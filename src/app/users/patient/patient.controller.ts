import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {PatientService} from "./patient.service";
import {PatientModel} from "./patient.model";
import {AppointmentService} from "../../appointment/appointment.service";
import {MedicalRecordService} from "../../medical-record/medicalRecord.service";
import {DoctorService} from "../doctor/doctor.service";

@Service()
export class PatientController {
    private patientRouter = Router();

    constructor(private readonly patientService: PatientService,
                private readonly appointmentService: AppointmentService,
                private readonly medicalRecordService: MedicalRecordService,
                private readonly doctorService: DoctorService,
    ) {
        // Define routes
        this.patientRouter.post('/', this.create.bind(this));

        this.patientRouter.put('/:patientId', this.update.bind(this));
        this.patientRouter.get('/:patientId',this.getProfile.bind(this));
        this.patientRouter.get('/:patientId/appointment', this.getAppointments.bind(this));
        this.patientRouter.get("/:patientId/medical-record", this.getMedicalRecordByPatientId.bind(this));
        this.patientRouter.get("/:specialtyId/doctors", this.getDoctorsBySpecialty.bind(this));

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

    private async update(req: Request, res: Response): Promise<void> {
        try {
            const {patientId} = req.params;
            const {name, email, address} = req.body;

            const updatedPatient = await this.patientService.update(Number(patientId), {name, email, address});

            res.status(200).json(updatedPatient);
        } catch (error) {
            res.status(500).json({error: error || "Failed to update patient"});
        }
    }

    private async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const {patientId} = req.params;
            const patient = await this.patientService.getProfile(Number(patientId));
            res.status(200).json(patient);
        } catch (error) {
            res.status(404).json({error: error || "Patient not found"});
        }
    }

    private async getAppointments(req: Request, res: Response): Promise<void> {
        try {
            const {patientId} = req.params;
            const appointments = await this.appointmentService.getAppointments(Number(patientId));
            res.status(200).json(appointments); // Forward the appointments to the response
        } catch (error) {
            res.status(404).json({error: "Appointments not found"});
        }
    }

    private async getMedicalRecordByPatientId(req: Request, res: Response): Promise<void> {
        try {
            const patientId = parseInt(req.params.patientId, 10);

            if (!patientId || isNaN(patientId)) {
                res.status(400).json({ error: "Invalid patient ID" });
                return;
            }

            const medicalRecords = await this.medicalRecordService.getByPatientId(patientId);

            if (medicalRecords.length === 0) {
                res.status(404).json({ error: "No medical records found for this patient" });
                return;
            }

            res.status(200).json(medicalRecords);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to fetch medical records: ${error.message}` });
        }
    }

    private async getDoctorsBySpecialty(req: Request, res: Response): Promise<void> {
        try {
            const { specialtyId } = req.params;

            // Validate specialtyId
            const specialtyIdInt = parseInt(specialtyId, 10);
            if (!isNaN(specialtyIdInt) && specialtyIdInt < 1) {
                res.status(400).json({ error: "Invalid specialty ID" });
                return;
            }

            // Fetch doctors filtered by specialty
            const doctors = await this.doctorService.getDoctorsBySpecialty(specialtyIdInt);

            res.status(200).json(doctors);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to retrieve doctors: ${error.message}` });
        }
    }
}
