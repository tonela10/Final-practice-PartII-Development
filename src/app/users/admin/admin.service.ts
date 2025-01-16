import { Service } from "typedi";
import { AdminRepository } from "./admin.repository";
import { AdminModel } from "./admin.model";

@Service()
export class AdminService {
    constructor(private readonly adminRepository: AdminRepository) {}

    async createAdmin(name: string, email: string, password: string): Promise<AdminModel> {
        const existingAdmin = await this.adminRepository.findByEmail(email);

        if (existingAdmin) {
            throw new Error("Admin with this email already exists");
        }

        const admin: AdminModel = { name, email, password };
        return await this.adminRepository.create(admin);
    }

    async updateAdmin(adminId: number, name: string, email: string): Promise<AdminModel> {
        const updatedAdmin = await this.adminRepository.update(adminId, name, email);

        if (!updatedAdmin) {
            throw new Error("Admin not found");
        }

        return updatedAdmin;
    }

    async getAdminProfile(adminId: number): Promise<AdminModel> {
        const admin = await this.adminRepository.findById(adminId);

        if (!admin) {
            throw new Error("Admin not found");
        }

        return admin;
    }
}
