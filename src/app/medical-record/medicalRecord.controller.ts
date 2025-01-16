import {Service} from "typedi";
import {Router, Request, Response} from "express";
import {MedicalRecordService} from "./medicalRecord.service";
import {MedicalRecordModel} from "./medicalRecord.model";

@Service()
export class MedicalRecordController {
    private medicalRecordRouter = Router();

    constructor(private readonly medicalRecordService: MedicalRecordService) {
        this.medicalRecordRouter.post("/", this.create.bind(this));
        this.medicalRecordRouter.put("/:recordId", this.update.bind(this));
        this.medicalRecordRouter.get("/:recordId", this.getById.bind(this));
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
                res.status(400).json({error: "Missing required fields"});
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
            res.status(500).json({error: `Failed to create medical record: ${error.message}`});
        }
    }

    private async update(req: Request, res: Response): Promise<void> {
        try {
            const recordId = parseInt(req.params.recordId, 10);
            const {diagnosis, prescriptions, notes, testResults, ongoingTreatments} = req.body;

            if (!recordId || isNaN(recordId)) {
                res.status(400).json({error: "Invalid record ID"});
                return;
            }

            const updatedRecord = await this.medicalRecordService.update(recordId, {
                diagnosis,
                prescriptions,
                notes,
                testResults,
                ongoingTreatments,
            });

            res.status(200).json(updatedRecord);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to update medical record: ${error.message}`});
        }
    }

    private async getById(req: Request, res: Response): Promise<void> {
        try {
            const recordId = parseInt(req.params.recordId, 10);

            if (!recordId || isNaN(recordId)) {
                res.status(400).json({error: "Invalid record ID"});
                return;
            }

            const medicalRecord = await this.medicalRecordService.getById(recordId);

            if (!medicalRecord) {
                res.status(404).json({error: "Medical record not found"});
                return;
            }

            res.status(200).json(medicalRecord);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to fetch medical record: ${error.message}`});
        }
    }
}
