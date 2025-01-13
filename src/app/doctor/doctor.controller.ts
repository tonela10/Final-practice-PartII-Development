import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {DoctorService} from "./doctor.service";

@Service()
export class DoctorController {
    private doctorRouter = Router();

    constructor(private readonly doctorService: DoctorService) {
        this.doctorRouter.post('/', this.create.bind(this));
    }

    getRouter(): Router {
        return this.doctorRouter;
    }

    private async create(req: Request, res: Response): Promise<void> {
        try {
            const {name, email, password, specialty, licenseNumber} = req.body;
            const doctor = await this.doctorService.create({name, email, password, specialty, licenseNumber});
            res.status(201).json(doctor);
        } catch (error) {
            // @ts-ignore
            res.status(400).json({error: error.message || "Failed to create doctor"});
        }
    }
}
