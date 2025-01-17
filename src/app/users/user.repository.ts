import { DatabaseService } from "../../database/database.service";

export class UserRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async searchUsers(filters: { role?: string; name?: string; email?: string }) {
        const db = await this.databaseService.openDatabase();
        const params: any[] = [];
        let query = '';
        const roleFilter = filters.role?.toLowerCase();

        // Role-based query logic
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
            // If no role is specified, search across all tables
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

        return await db.all(query, params);
    }

    // Helper function to dynamically build query conditions
    private buildConditions(filters: { role?: string; name?: string; email?: string }, params: any[]) {
        const conditions: string[] = [];

        // Add filtering condition for 'name' if provided
        if (filters.name) {
            conditions.push("name LIKE ?");
            params.push(`%${filters.name}%`);
        }

        // Add filtering condition for 'email' if provided
        if (filters.email) {
            conditions.push("email LIKE ?");
            params.push(`%${filters.email}%`);
        }

        // Return condition string if conditions are present
        return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : '';
    }
}
