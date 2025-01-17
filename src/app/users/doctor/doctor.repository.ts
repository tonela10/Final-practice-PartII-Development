import {Service} from "typedi";
import {DatabaseService} from "../../../database/database.service";
import {DoctorModel} from "./doctor.model";

@Service()
export class DoctorRepository {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async findByEmail(email: string): Promise<DoctorModel | null> {
        const query = {
            sql: `SELECT *
                  FROM doctors
                  WHERE email = ?`,
            params: [email],
        };
        const result = await this.databaseService.execQuery(query);
        return result.rowCount > 0 ? (result.rows[0] as DoctorModel) : null;
    }

    async findByLicenseNumber(licenseNumber: string): Promise<DoctorModel | null> {
        const query = {
            sql: `SELECT *
                  FROM doctors
                  WHERE license_number = ?`,
            params: [licenseNumber],
        };
        const result = await this.databaseService.execQuery(query);
        return result.rowCount > 0 ? (result.rows[0] as DoctorModel) : null;
    }

    async findById(doctorId: number): Promise<DoctorModel | null> {
        const db = await this.databaseService.openDatabase();

        const doctor = await db.get<DoctorModel>(
            `
                SELECT id, name, email, specialty, license_number
                FROM doctors
                WHERE id = ?
            `,
            [doctorId]
        );

        return doctor || null;
    }

    async create(doctor: DoctorModel): Promise<DoctorModel> {
        const query = {
            sql: `
                INSERT INTO doctors (name, email, password, specialty, license_number)
                VALUES (?, ?, ?, ?, ?)
            `,
            params: [doctor.name, doctor.email, doctor.password, doctor.specialty, doctor.licenseNumber],
        };

        const dbClient = await this.databaseService.openDatabase();
        try {
            const result = await dbClient.run(query.sql, query.params);
            return {id: result.lastID, ...doctor};
        } finally {
            await this.databaseService.closeDatabase();
        }
    }

    async update(doctorId: number, updatedDoctor: Partial<DoctorModel>): Promise<DoctorModel> {
        const db = await this.databaseService.openDatabase();

        await db.run(
            `
                UPDATE doctors
                SET name      = ?,
                    email     = ?,
                    specialty = ?
                WHERE id = ?
            `,
            [updatedDoctor.name, updatedDoctor.email, updatedDoctor.specialty, doctorId]
        );

        const doctor = await db.get<DoctorModel>(`SELECT *
                                                  FROM doctors
                                                  WHERE id = ?`, [doctorId]);
        if (!doctor) throw new Error("Doctor not found");

        return doctor;
    }

    async getDoctorById(doctorId: number) {
        const db = await this.databaseService.openDatabase();
        return await db.get(`SELECT *
                             FROM doctors
                             WHERE id = ?`, [doctorId]);
    }

    async updateDoctorSpecialty(doctorId: number, specialtyId: number): Promise<void> {
        const db = await this.databaseService.openDatabase();
        await db.run(`UPDATE doctors
                      SET specialtyId = ?
                      WHERE id = ?`, [specialtyId, doctorId]);
    }

    async searchDoctors(filters: {
        availability?: { day: string; startTime: string; endTime: string }[];
        specialtyId?: number;
        location?: string;
    }) {
        const db = await this.databaseService.openDatabase();

        const conditions: string[] = [];
        const parameters: any[] = [];

        if (filters.specialtyId) {
            conditions.push("specialtyId = ?");
            parameters.push(filters.specialtyId);
        }

        if (filters.location) {
            conditions.push("location LIKE ?");
            parameters.push(`%${filters.location}%`);
        }

        if (filters.availability) {
            const availabilityFilters = filters.availability.map(() => "(day = ? AND startTime >= ? AND endTime <= ?)");
            conditions.push(availabilityFilters.join(" OR "));
            filters.availability.forEach((slot) => {
                parameters.push(slot.day, slot.startTime, slot.endTime);
            });
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const query = `SELECT *
                       FROM doctors ${whereClause}`;

        return await db.all(query, parameters);
    }


}
