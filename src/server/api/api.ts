import {Router} from 'express';
import {Service} from 'typedi';
import {CalculatorController} from "../../app/calculator/calculator.controller";
import {PatientController} from "../../app/patient/patient.controller";

@Service()
export class Api {
    private apiRouter: Router;

    constructor(
        private calculatorController: CalculatorController,
        private patientController: PatientController,
    ) {
        this.apiRouter = Router();

        this.apiRouter.use('/calculator', calculatorController.getRouter());
        this.apiRouter.use('/patient', patientController.getRouter())
    }

    getApiRouter(): Router {
        return this.apiRouter;
    }

}
