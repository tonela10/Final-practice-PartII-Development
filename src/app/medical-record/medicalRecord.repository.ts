import {Service} from "typedi";
import {DatabaseService} from "../../database/database.service";
import {MedicalRecordModel, TestResult} from "./medicalRecord.model";

@Service()
export class MedicalRecordRepository {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async create(record: MedicalRecordModel): Promise<MedicalRecordModel> {
        const db = await this.databaseService.openDatabase();

        const result = await db.run(
            `
                INSERT INTO medical_records (patientId, doctorId, diagnosis, prescriptions, notes, ongoingTreatments,
                                             createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                record.patientId,
                record.doctorId,
                record.diagnosis,
                JSON.stringify(record.prescriptions),
                record.notes,
                JSON.stringify(record.ongoingTreatments),
                new Date().toISOString(),
            ]
        );

        const recordId = result.lastID;

        for (const testResult of record.testResults) {
            await db.run(
                `
                    INSERT INTO test_results (recordId, testName, result, date)
                    VALUES (?, ?, ?, ?)
                `,
                [recordId, testResult.testName, testResult.result, testResult.date]
            );
        }

        return {
            ...record,
            recordId,
            createdAt: new Date().toISOString(),
        };
    }

    async update(recordId: number, updates: Partial<MedicalRecordModel>): Promise<MedicalRecordModel> {
        const db = await this.databaseService.openDatabase();

        await db.run(
            `
                UPDATE medical_records
                SET diagnosis         = ?,
                    prescriptions     = ?,
                    notes             = ?,
                    ongoingTreatments = ?,
                    updatedAt         = ?
                WHERE recordId = ?
            `,
            [
                updates.diagnosis,
                JSON.stringify(updates.prescriptions),
                updates.notes,
                JSON.stringify(updates.ongoingTreatments),
                new Date().toISOString(),
                recordId,
            ]
        );

        await db.run(`DELETE
                      FROM test_results
                      WHERE recordId = ?`, [recordId]);

        for (const testResult of updates.testResults || []) {
            await db.run(
                `
                    INSERT INTO test_results (recordId, testName, result, date)
                    VALUES (?, ?, ?, ?)
                `,
                [recordId, testResult.testName, testResult.result, testResult.date]
            );
        }

        const updatedRecord = await db.get(
            `SELECT *
             FROM medical_records
             WHERE recordId = ?`,
            [recordId]
        );

        const testResults: TestResult[] = await db.all(
            `SELECT testName, result, date
             FROM test_results
             WHERE recordId = ?`,
            [recordId]
        );

        return {
            ...updatedRecord,
            prescriptions: JSON.parse(updatedRecord.prescriptions),
            ongoingTreatments: JSON.parse(updatedRecord.ongoingTreatments),
            testResults,
            updatedAt: updatedRecord.updatedAt,
        }
    }

    async getById(recordId: number): Promise<MedicalRecordModel | null> {
        const db = await this.databaseService.openDatabase();

        const medicalRecord = await db.get(
            `SELECT *
             FROM medical_records
             WHERE recordId = ?`,
            [recordId]
        );

        if (!medicalRecord) {
            return null; // Record not found
        }

        const testResults: TestResult[] = await db.all(
            `SELECT testName, result, date
             FROM test_results
             WHERE recordId = ?`,
            [recordId]
        );

        return {
            ...medicalRecord,
            prescriptions: JSON.parse(medicalRecord.prescriptions),
            ongoingTreatments: JSON.parse(medicalRecord.ongoingTreatments),
            testResults,
        };
    }

    async getByPatientId(patientId: number): Promise<MedicalRecordModel[]> {
        const db = await this.databaseService.openDatabase();

        const medicalRecords = await db.all(
            `SELECT * FROM medical_records WHERE patientId = ?`,
            [patientId]
        );

        if (!medicalRecords || medicalRecords.length === 0) {
            return []; // No records found
        }

        return await Promise.all(
            medicalRecords.map(async (record: any) => {
                const testResults: TestResult[] = await db.all(
                    `SELECT testName, result, date FROM test_results WHERE recordId = ?`,
                    [record.recordId]
                );

                return {
                    ...record,
                    prescriptions: JSON.parse(record.prescriptions),
                    ongoingTreatments: JSON.parse(record.ongoingTreatments),
                    testResults,
                };
            })
        );
    }
}
