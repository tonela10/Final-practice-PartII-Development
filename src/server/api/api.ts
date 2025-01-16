import {Router} from 'express';
import {Service} from 'typedi';
import {PatientController} from "../../app/users/patient/patient.controller";
import {DoctorController} from "../../app/users/doctor/doctor.controller";
import {AdminController} from "../../app/users/admin/admin.controller";
import {AppointmentController} from "../../app/appointment/appointment.controller";
import {MedicalRecordController} from "../../app/medical-record/medicalRecord.controller";

@Service()
export class Api {
    private apiRouter: Router;

    constructor(
        private patientController: PatientController,
        private doctorController: DoctorController,
        private adminController: AdminController,
        private appointmentController: AppointmentController,
        private medicalRecordController: MedicalRecordController
    ) {
        this.apiRouter = Router();

        this.apiRouter.use('/patient', patientController.getRouter());
        this.apiRouter.use('/doctor', doctorController.getRouter());
        this.apiRouter.use('/admin', adminController.getRouter());
        this.apiRouter.use('/appointment', appointmentController.getRouter());
        this.apiRouter.use('/medical-record', medicalRecordController.getRouter());
    }

    getApiRouter(): Router {
        return this.apiRouter;
    }
}
