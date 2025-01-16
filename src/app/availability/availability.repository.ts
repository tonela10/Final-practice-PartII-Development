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
            availabilityId: result.lastID,  // Get the ID of the newly inserted availability
        };
    }

    async getAvailabilityByDoctor(doctorId: number): Promise<AvailabilityModel[]> {
        const db = await this.databaseService.openDatabase();

        // Query to fetch availability for the specified doctorId
        const rows = await db.all(
            `
            SELECT availabilityId, startTime, endTime, days
            FROM doctor_availability
            WHERE doctorId = ?
        `,
            [doctorId]
        );

        // Map rows to AvailabilityModel format
        return rows.map((row: any) => ({
            availabilityId: row.availabilityId,
            doctorId,
            startTime: row.startTime,
            endTime: row.endTime,
            days: JSON.parse(row.days),  // Parse the stored JSON string back into an array
        }));
    }
}
