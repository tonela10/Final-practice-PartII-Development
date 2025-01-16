import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { MedicalRecordModel, TestResult } from "./medicalRecord.model";

@Service()
export class MedicalRecordRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(record: MedicalRecordModel): Promise<MedicalRecordModel> {
        const db = await this.databaseService.openDatabase();

        // Insert the main medical record
        const result = await db.run(
            `
            INSERT INTO medical_records (patientId, doctorId, diagnosis, prescriptions, notes, ongoingTreatments, createdAt)
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
}