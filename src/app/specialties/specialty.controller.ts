import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {SpecialtyService} from "./specialty.service";

@Service()
export class SpecialtyController {
    private specialtyRouter = Router();

    constructor(private readonly specialtyService: SpecialtyService) {
        this.specialtyRouter.get("/", this.getAll.bind(this));
    }

    getRouter(): Router {
        return this.specialtyRouter;
    }

    private async getAll(req: Request, res: Response): Promise<void> {
        try {
            const specialties = await this.specialtyService.getAll();
            res.status(200).json(specialties);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to fetch specialties: ${error.message}`});
        }
    }
}
