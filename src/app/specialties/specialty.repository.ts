import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { SpecialtyModel } from "./specialty.model";

@Service()
export class SpecialtyRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async getAll(): Promise<SpecialtyModel[]> {
        const db = await this.databaseService.openDatabase();

        const specialties = await db.all(`SELECT * FROM specialties`);
        return specialties;
    }

    async getSpecialtyById(specialtyId: number): Promise<SpecialtyModel | null> {
        const db = await this.databaseService.openDatabase();
        const specialty = await db.get(`SELECT * FROM specialties WHERE specialtyId = ?`, [specialtyId]);
        return specialty
            ? {
                specialtyId: specialty.specialtyId,
                name: specialty.name,
                description: specialty.description,
            }
            : null;
    }
}
