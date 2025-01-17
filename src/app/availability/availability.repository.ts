import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { AvailabilityModel } from "./availability.model";

@Service()
export class AvailabilityRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(availability: AvailabilityModel): Promise<AvailabilityModel> {
        const db = await this.databaseService.openDatabase();

        const result = await db.run(
            `
            INSERT INTO doctor_availability (doctorId, startTime, endTime, days)
            VALUES (?, ?, ?, ?)
        `,
            [
                availability.doctorId,
                availability.startTime,
                availability.endTime,
                JSON.stringify(availability.days), // Store days as a JSON string
            ]
        );

        return {
            ...availability,
            availabilityId: result.lastID,
        };
    }

    async getAvailabilityByDoctor(doctorId: number): Promise<AvailabilityModel[]> {
        const db = await this.databaseService.openDatabase();

        const rows = await db.all(
            `
            SELECT availabilityId, startTime, endTime, days
            FROM doctor_availability
            WHERE doctorId = ?
        `,
            [doctorId]
        );

        return rows.map((row: any) => ({
            availabilityId: row.availabilityId,
            doctorId,
            startTime: row.startTime,
            endTime: row.endTime,
            days: JSON.parse(row.days),
        }));
    }

    async getAvailabilityByDoctorId(doctorId: number): Promise<
        { day: string; startTime: string; endTime: string }[]
    > {
        const db = await this.databaseService.openDatabase();

        const query = `
            SELECT day, startTime, endTime
            FROM availability
            WHERE doctorId = ?;
        `;

        const rows = await db.all(query, [doctorId]);

        return rows.map((row) => ({
            day: row.day,
            startTime: row.startTime,
            endTime: row.endTime,
        }));
    }
}
