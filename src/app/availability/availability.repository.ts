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
}
