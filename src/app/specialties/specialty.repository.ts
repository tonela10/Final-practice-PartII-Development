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
}
