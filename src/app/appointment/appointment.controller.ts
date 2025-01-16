import { Request, Response, Router } from "express";
import { Service } from "typedi";
import { AppointmentService } from "./appointment.service";

@Service()
export class AppointmentController {
    private appointmentRouter = Router();

    constructor(private readonly appointmentService: AppointmentService) {
        this.appointmentRouter.post("/", this.bookAppointment.bind(this));
        this.appointmentRouter.delete("/:appointmentId", this.cancelAppointment.bind(this));
    }

    getRouter(): Router {
        return this.appointmentRouter;
    }

    private async bookAppointment(req: Request, res: Response): Promise<void> {
        try {
            const { patientId, doctorId, appointmentDate, reason } = req.body;

            const appointment = await this.appointmentService.bookAppointment(
                patientId,
                doctorId,
                appointmentDate,
                reason
            );

            res.status(201).json(appointment);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ error: "Internal Server Error", error2: error.message });
        }
    }

    private async cancelAppointment(req: Request, res: Response): Promise<void> {
        try {
            const { appointmentId } = req.params;

            const result = await this.appointmentService.cancelAppointment(Number(appointmentId));

            res.status(200).json({
                message: "Appointment canceled successfully",
                appointmentId: result.appointmentId,
            });
        } catch (error) {
            // @ts-ignore
            res.status(400).json({ error: error.message });
        }
    }
}
