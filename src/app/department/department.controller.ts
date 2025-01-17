import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {DepartmentService} from "./department.service";

@Service()
export class DepartmentController {
    private departmentRouter = Router();

    constructor(private readonly departmentService: DepartmentService) {
        this.departmentRouter.get("/", this.getAllDepartments.bind(this));
    }

    getRouter(): Router {
        return this.departmentRouter;
    }

    private async getAllDepartments(req: Request, res: Response): Promise<void> {
        try {
            const departments = await this.departmentService.getAllDepartments();
            res.status(200).json(departments);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to fetch departments: ${error.message}`});
        }
    }
}
