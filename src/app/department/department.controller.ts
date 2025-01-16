import { Service } from "typedi";
import { Request, Response, Router } from "express";
import { DepartmentService } from "./department.service";

@Service()
export class DepartmentController {
    private departmentRouter = Router();

    constructor(private readonly departmentService: DepartmentService) {
        // Define the route for getting all departments
        this.departmentRouter.get("/", this.getAllDepartments.bind(this));
    }

    // Get the router for the controller
    getRouter(): Router {
        return this.departmentRouter;
    }

    // Endpoint for fetching all departments
    private async getAllDepartments(req: Request, res: Response): Promise<void> {
        try {
            // Get all departments from the service
            const departments = await this.departmentService.getAllDepartments();
            res.status(200).json(departments);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to fetch departments: ${error.message}` });
        }
    }
}
