import {PatientModel} from "./patient.model";
import {DatabaseService} from "../../database/database.service";
import {Service} from "typedi";

@Service()
export class PatientRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async findByName(name: string): Promise<PatientModel | null> {
        const query = {
            sql: `SELECT * FROM patients WHERE name = ?`,
            params: [name],
        };
        const result = await this.databaseService.execQuery(query);
        return result.rowCount > 0 ? (result.rows[0] as PatientModel) : null;
    }

    async create(patient: PatientModel): Promise<PatientModel> {
        const query = {
            sql: `
                INSERT INTO patients (name, email, password, date_of_birth, address)
                VALUES (?, ?, ?, ?, ?)
            `,
            params: [patient.name, patient.email, patient.password, patient.dateOfBirth, patient.address],
        };

        const dbClient = await this.databaseService.openDatabase();

        try {
            const result = await dbClient.run(query.sql, query.params);
            return {
                id: result.lastID, // The inserted row ID
                ...patient,
            };
        } finally {
            await this.databaseService.closeDatabase();
        }
    }
}
