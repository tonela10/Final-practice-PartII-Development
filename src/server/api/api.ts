import {Router} from 'express';
import {Service} from 'typedi';
import {CalculatorController} from "../../app/calculator/calculator.controller";
import {PatientController} from "../../app/patient/patient.controller";
import {DoctorController} from "../../app/doctor/doctor.controller";

@Service()
export class Api {
    private apiRouter: Router;

    constructor(
        private calculatorController: CalculatorController,
        private patientController: PatientController,
        private doctorController: DoctorController,
    ) {
        this.apiRouter = Router();

        this.apiRouter.use('/calculator', calculatorController.getRouter());
        this.apiRouter.use('/patient', patientController.getRouter());
        this.apiRouter.use('/doctor', doctorController.getRouter());
    }

    getApiRouter(): Router {
        return this.apiRouter;
    }
}
