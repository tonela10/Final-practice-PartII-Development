import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {PatientService} from "./patient.service";
import {PatientModel} from "./patient.model";

@Service()
export class PatientController {
    private patientRouter = Router();

    constructor(private readonly patientService: PatientService) {
        // Define routes
        this.patientRouter.post('/', this.create.bind(this));
    }

    getRouter(): Router {
        return this.patientRouter;
    }

    /**
     * Handles the creation of a new patient.
     * @param req - Express request object
     * @param res - Express response object
     */
    private async create(req: Request, res: Response): Promise<void> {
        try {
            const {name, email, password, dateOfBirth, address} = req.body;

            // Validate required fields
            if (!name || !email || !password || !dateOfBirth || !address) {
                res.status(400).json({error: "All fields are required"});
                return;
            }

            // Call the service to create a new patient
            const patient: PatientModel = await this.patientService.create({
                name,
                email,
                password,
                dateOfBirth,
                address
            });

            // Respond with the newly created patient
            res.status(201).json({
                id: patient.id,
                name: patient.name,
                email: patient.email,
                dateOfBirth: patient.dateOfBirth,
                address: patient.address
            });
        } catch (error) {
            // Log the error (optional)
            console.error("Error creating patient:", error);

            // Send an appropriate error response
            res.status(500).json({error: "Failed to create patient"});
        }
    }
}
