import { DatabaseService } from "../../database/database.service";
import {Service} from "typedi";

@Service()
export class UserRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async searchUsers(filters: { role?: string; name?: string; email?: string }) {
        const db = await this.databaseService.openDatabase();
        const params: any[] = [];
        let query;
        const roleFilter = filters.role?.toLowerCase();

        if (roleFilter === 'admin') {
            query = `
                SELECT id AS userId, name, email, 'Admin' AS role
                FROM admins
                         ${this.buildConditions(filters, params)}
            `;
        } else if (roleFilter === 'doctor') {
            query = `
                SELECT id AS userId, name, email, 'Doctor' AS role
                FROM doctors
                         ${this.buildConditions(filters, params)}
            `;
        } else if (roleFilter === 'patient') {
            query = `
                SELECT id AS userId, name, email, 'Patient' AS role
                FROM patients
                         ${this.buildConditions(filters, params)}
            `;
        } else {
            query = `
                SELECT id AS userId, name, email, 'Admin' AS role FROM admins
                                                                           ${this.buildConditions(filters, params)}
                UNION
                SELECT id AS userId, name, email, 'Doctor' AS role FROM doctors
                                                                            ${this.buildConditions(filters, params)}
                UNION
                SELECT id AS userId, name, email, 'Patient' AS role FROM patients
                                                                             ${this.buildConditions(filters, params)}
            `;
        }

        console.log(query); // Imprime la consulta para verificarla
        return await db.all(query, params);
    }

    // Helper function to dynamically build query conditions
    private buildConditions(filters: { role?: string; name?: string; email?: string }, params: any[]) {
        const conditions: string[] = [];

        if (filters.name) {
            conditions.push("name LIKE ?");
            params.push(`%${filters.name}%`);
        }

        if (filters.email) {
            conditions.push("email LIKE ?");
            params.push(`%${filters.email}%`);
        }

        return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : '';
    }
}
