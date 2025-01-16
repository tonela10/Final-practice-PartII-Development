import {Service} from "typedi";
import {Request, Response, Router} from "express";
import {DoctorService} from "./doctor.service";
import {AvailabilityModel} from "../availability/availability.model";
import {AvailabilityService} from "../availability/availability.service";

@Service()
export class DoctorController {
    private doctorRouter = Router();

    constructor(private readonly doctorService: DoctorService,
                private readonly availabilityService: AvailabilityService) {
        this.doctorRouter.post('/', this.create.bind(this));
        this.doctorRouter.put('/:doctorId',this.updateProfile.bind(this));
        this.doctorRouter.get('/:doctorId', this.getProfile.bind(this));

        this.doctorRouter.post('/:doctorId/availability', this.setAvailability.bind(this));
        this.doctorRouter.get('/:doctorId/availability', this.getAvailability.bind(this));

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

    private async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);
            const { name, email, specialty } = req.body;

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({ error: "Invalid doctor ID" });
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
            res.status(500).json({ error: error });
        }
    }

    private async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({ error: "Invalid doctor ID" });
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
            if (error.message=== "Doctor not found") {
                res.status(404).json({ error: "Doctor not found" });
            } else {
                // @ts-ignore
                res.status(500).json({ error: error.message });
            }
        }
    }
    private async setAvailability(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId } = req.params;
            const { startTime, endTime, days } = req.body;

            // Validate required fields
            if (!startTime || !endTime || !days || !doctorId) {
                res.status(400).json({ error: "Missing required fields" });
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
            res.status(500).json({ error:  `Failed to set availability: ${error.message}` });
        }
    }

    private async getAvailability(req: Request, res: Response): Promise<void> {
        try {
            const doctorId = parseInt(req.params.doctorId, 10);

            if (!doctorId || isNaN(doctorId)) {
                res.status(400).json({ error: "Invalid doctor ID" });
                return;
            }

            // Get availability from the service
            const availability = await this.availabilityService.getAvailabilityByDoctor(doctorId);

            // If no availability found
            if (!availability || availability.length === 0) {
                res.status(404).json({ error: "No availability found for this doctor" });
                return;
            }

            // Respond with the availability data
            res.status(200).json(availability);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: `Failed to retrieve availability: ${error.message}` });
        }
    }
}
