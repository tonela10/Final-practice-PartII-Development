import { Service } from "typedi";
import { DatabaseService } from "../../database/database.service";
import { AdminModel } from "./admin.model";

@Service()
export class AdminRepository {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(admin: AdminModel): Promise<AdminModel> {
        const db = await this.databaseService.openDatabase();
        const result = await db.run(
            `
            INSERT INTO admins (name, email, password)
            VALUES (?, ?, ?)
        `,
            [admin.name, admin.email, admin.password]
        );

        return {
            id: result.lastID,
            name: admin.name,
            email: admin.email,
        };
    }

    async update(adminId: number, name: string, email: string): Promise<AdminModel | null> {
        const db = await this.databaseService.openDatabase();

        const result = await db.run(
            `
        UPDATE admins
        SET name = ?, email = ?
        WHERE id = ?
    `,
            [name, email, adminId]
        );

        if (result.changes === 0) {
            return null; // Admin not found
        }

        return {
            id: adminId,
            name,
            email,
        };
    }


    async findByEmail(email: string): Promise<AdminModel | null> {
        const db = await this.databaseService.openDatabase();
        const admin = await db.get<AdminModel>(
            `
            SELECT id, name, email, password
            FROM admins
            WHERE email = ?
        `,
            [email]
        );

        return admin || null;
    }

    async findById(adminId: number): Promise<AdminModel | null> {
        const db = await this.databaseService.openDatabase();

        const row = await db.get(
            `
        SELECT id, name, email
        FROM admins
        WHERE id = ?
    `,
            [adminId]
        );

        if (!row) {
            return null; // Admin not found
        }

        return {
            id: row.id,
            name: row.name,
            email: row.email,
        };
    }

}
