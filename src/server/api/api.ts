import {Router} from 'express';
import {Service} from 'typedi';
import {CalculatorController} from "../../app/calculator/calculator.controller";
import {PatientController} from "../../app/patient/patient.controller";
import {DoctorController} from "../../app/doctor/doctor.controller";
import {AdminController} from "../../app/admin/admin.controller";
import {AppointmentController} from "../../app/appointment/appointment.controller";

@Service()
export class Api {
    private apiRouter: Router;

    constructor(
        private calculatorController: CalculatorController,
        private patientController: PatientController,
        private doctorController: DoctorController,
        private adminController: AdminController,
        private appointmentController:AppointmentController,
    ) {
        this.apiRouter = Router();

        this.apiRouter.use('/calculator', calculatorController.getRouter());
        this.apiRouter.use('/patient', patientController.getRouter());
        this.apiRouter.use('/doctor', doctorController.getRouter());
        this.apiRouter.use('/admin', adminController.getRouter());
        this.apiRouter.use('/appointment', appointmentController.getRouter());
    }

    getApiRouter(): Router {
        return this.apiRouter;
    }
}
