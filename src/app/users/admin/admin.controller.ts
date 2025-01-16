import { Service } from "typedi";
import { Router, Request, Response } from "express";
import { AdminService } from "./admin.service";

@Service()
export class AdminController {
    private adminRouter = Router();

    constructor(private readonly adminService: AdminService) {
        this.adminRouter.post("/", this.createAdmin.bind(this));
        this.adminRouter.put("/:adminId", this.updateAdmin.bind(this));
        this.adminRouter.get("/:adminId", this.getAdminProfile.bind(this));
    }

    getRouter(): Router {
        return this.adminRouter;
    }

    private async createAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            const admin = await this.adminService.createAdmin(name, email, password);

            res.status(201).json({
                id: admin.id,
                name: admin.name,
                email: admin.email,
            });
        } catch (error) {
            // @ts-ignore
            if (error.message === "Admin with this email already exists") {
                // @ts-ignore
                res.status(409).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }

    private async updateAdmin(req: Request, res: Response): Promise<void> {
        try {
            const { adminId } = req.params;
            const { name, email } = req.body;

            if (!name || !email) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            const updatedAdmin = await this.adminService.updateAdmin(Number(adminId), name, email);

            res.status(200).json({
                id: updatedAdmin.id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
            });
        } catch (error) {
            // @ts-ignore
            if (error.message === "Admin not found") {
                // @ts-ignore
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }

    private async getAdminProfile(req: Request, res: Response): Promise<void> {
        try {
            const { adminId } = req.params;

            const admin = await this.adminService.getAdminProfile(Number(adminId));

            res.status(200).json({
                id: admin.id,
                name: admin.name,
                email: admin.email,
            });
        } catch (error) {
            // @ts-ignore
            if (error.message === "Admin not found") {
                // @ts-ignore
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    }

}
