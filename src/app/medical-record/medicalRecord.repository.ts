import {Service} from "typedi";
import {DatabaseService} from "../../database/database.service";
import {MedicalRecordModel, TestResult} from "./medicalRecord.model";

@Service()
export class MedicalRecordRepository {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async create(record: MedicalRecordModel): Promise<MedicalRecordModel> {
        const db = await this.databaseService.openDatabase();

        // Insert the main medical record
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

        // Insert test results
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

        // Update the main medical record
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

        // Delete old test results
        await db.run(`DELETE
                      FROM test_results
                      WHERE recordId = ?`, [recordId]);

        // Insert updated test results
        for (const testResult of updates.testResults || []) {
            await db.run(
                `
                    INSERT INTO test_results (recordId, testName, result, date)
                    VALUES (?, ?, ?, ?)
                `,
                [recordId, testResult.testName, testResult.result, testResult.date]
            );
        }

        // Retrieve the updated record
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
}
