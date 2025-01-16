import { Service } from "typedi";
import { Router, Request, Response } from "express";
import { MedicalRecordService } from "./medicalRecord.service";
import { MedicalRecordModel } from "./medicalRecord.model";

@Service()
export class MedicalRecordController {
    private medicalRecordRouter = Router();

    constructor(private readonly medicalRecordService: MedicalRecordService) {
        this.medicalRecordRouter.post("/", this.create.bind(this));
    }

    getRouter(): Router {
        return this.medicalRecordRouter;
    }

    private async create(req: Request, res: Response): Promise<void> {
        try {
            const {
                patientId,
                doctorId,
                diagnosis,
                prescriptions,
                notes,
                testResults,
                ongoingTreatments,
            } = req.body;

            // Validate required fields
            if (!patientId || !doctorId || !diagnosis) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            const record: MedicalRecordModel = {
                patientId,
                doctorId,
                diagnosis,
                prescriptions,
                notes,
                testResults,
                ongoingTreatments,
            };

            const createdRecord = await this.medicalRecordService.create(record);

            res.status(201).json(createdRecord);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to create medical record: ${error.message}` });
        }
    }
}
