import {Service} from "typedi";
import {DatabaseService} from "../../database/database.service";
import {DepartmentModel} from "./department.model";

@Service()
export class DepartmentRepository {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async getAllDepartments(): Promise<DepartmentModel[]> {
        const db = await this.databaseService.openDatabase();

        const rows = await db.all(`
            SELECT departmentId, name, description
            FROM departments
        `);

        return rows.map((row: { departmentId: number, name: string, description: string }) => ({
            departmentId: row.departmentId,
            name: row.name,
            description: row.description
        }));
    }
}
