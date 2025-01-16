import {AppointmentStatus} from "./utils/AppointmentStatus";

export interface AppointmentModel {
    appointmentId?: number;
    patientId: number;
    doctorId: number;
    appointmentDate: string; // Use ISO 8601 format for datetime
    reason: string;
    status: AppointmentStatus;
}
