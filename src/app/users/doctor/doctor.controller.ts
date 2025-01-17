import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {DoctorService} from "./doctor.service";
import {AvailabilityModel} from "../../availability/availability.model";
import {AvailabilityService} from "../../availability/availability.service";
import {AppointmentService} from "../../appointment/appointment.service";


@Service()
export class DoctorController {
    private doctorRouter = Router();

    constructor(
        private readonly doctorService: DoctorService,
        private readonly availabilityService: AvailabilityService,
        private readonly appointmentService: AppointmentService) {

        this.doctorRouter.post('/', this.create.bind(this));
        this.doctorRouter.put('/:doctorId', this.updateProfile.bind(this));
        this.doctorRouter.get('/:doctorId', this.getProfile.bind(this));

        this.doctorRouter.post('/:doctorId/availability', this.setAvailability.bind(this));
        this.doctorRouter.get('/:doctorId/availability', this.getAvailability.bind(this));

        this.doctorRouter.get('/:doctorId/appointment', this.getAppointments.bind(this));

        this.doctorRouter.post('/:doctorId/specialties', this.associateSpecialty.bind(this));
        this.doctorRouter.get('/:doctorId/specialties',this.getSpecialties.bind(this));
    }

    getRouter(): Router {
        return this.doctorRouter;
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const {name, email, password, specialty, licenseNumber} = req.body;
            const doctor = await this.doctorService.create({
                location: "",
                name, email, password, specialty, licenseNumber});
            res.status(201).json(doctor);
        } catch (error) {
            // @ts-ignore
            res.status(400).json({error: error.message || "Failed to create doctor"});
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);
            const {name, email, specialty} = req.body;

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({error: "Invalid doctor ID"});
                return;
            }

            const updatedDoctor = await this.doctorService.updateProfile(doctorId, {
                name,
                email,
                specialty,
            });

            res.status(200).json({
                id: updatedDoctor.id,
                name: updatedDoctor.name,
                email: updatedDoctor.email,
                specialty: updatedDoctor.specialty,
            });
        } catch (error) {
            res.status(500).json({error: error});
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({error: "Invalid doctor ID"});
                return;
            }

            const doctor = await this.doctorService.getProfile(doctorId);

            res.status(200).json({
                id: doctor.id,
                name: doctor.name,
                email: doctor.email,
                specialty: doctor.specialty,
                licenseNumber: doctor.licenseNumber,
            });
        } catch (error) {
            // @ts-ignore
            if (error.message === "Doctor not found") {
                res.status(404).json({error: "Doctor not found"});
            } else {
                // @ts-ignore
                res.status(500).json({error: error.message});
            }
        }
    }

    async setAvailability(req: Request, res: Response): Promise<void> {
        try {
            const {doctorId} = req.params;
            const {startTime, endTime, days} = req.body;

            // Validate required fields
            if (!startTime || !endTime || !days || !doctorId) {
                res.status(400).json({error: "Missing required fields"});
                return;
            }

            // Call the service to create availability
            const availability: AvailabilityModel = await this.availabilityService.setAvailability({
                doctorId: Number(doctorId),
                startTime,
                endTime,
                days,
            });

            // Respond with the created availability
            res.status(201).json(availability);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to set availability: ${error.message}`});
        }
    }

    async getAvailability(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({error: "Invalid doctor ID"});
                return;
            }

            // Get availability from the service
            const availability = await this.availabilityService.getAvailabilityByDoctor(doctorId);

            // If no availability found
            if (!availability || availability.length === 0) {
                res.status(404).json({error: "No availability found for this doctor"});
                return;
            }

            // Respond with the availability data
            res.status(200).json(availability);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to retrieve availability: ${error.message}`});
        }
    }

    private async getAppointments(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({error: "Invalid doctor ID"});
                return;
            }

            // Get appointments from the service
            const appointments = await this.appointmentService.getAppointmentsByDoctor(doctorId);

            // If no appointments found
            if (!appointments || appointments.length === 0) {
                res.status(404).json({error: "No appointments found for this doctor"});
                return;
            }

            // Respond with the list of appointments
            res.status(200).json(appointments);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({error: `Failed to retrieve appointments: ${error.message}`});
        }
    }

    async associateSpecialty(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId } = req.params;
            const { specialtyIds } = req.body;

            // Validate input
            if (!doctorId || !specialtyIds || !Array.isArray(specialtyIds) || specialtyIds.length !== 1) {
                res.status(400).json({ error: "Doctor can be associated with exactly one specialty." });
                return;
            }

            // Convert `doctorId` and `specialtyId` to integers
            const doctorIdInt = parseInt(doctorId, 10);
            const specialtyId = parseInt(specialtyIds[0], 10);

            if (isNaN(doctorIdInt) || isNaN(specialtyId)) {
                res.status(400).json({ error: "Invalid doctorId or specialtyId." });
                return;
            }

            // Associate the doctor with the specialty
            const result = await this.doctorService.associateSpecialty(doctorIdInt, specialtyId);

            res.status(200).json(result);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to associate specialty: ${error.message}` });
        }
    }

    async getSpecialties(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId } = req.params;

            // Validate doctorId
            const doctorIdInt = parseInt(doctorId, 10);
            if (isNaN(doctorIdInt)) {
                res.status(400).json({ error: "Invalid doctor ID" });
                return;
            }

            // Get specialties for the doctor
            const specialties = await this.doctorService.getDoctorSpecialties(doctorIdInt);

            res.status(200).json(specialties);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to retrieve specialties: ${error.message}` });
        }
    }
}
