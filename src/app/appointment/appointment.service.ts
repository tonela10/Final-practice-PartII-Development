import {Service} from "typedi";
import {AppointmentModel} from "./appointment.model";
import {AppointmentRepository} from "./appointment.repository";
import {AppointmentStatus} from "./utils/AppointmentStatus";

@Service()
export class AppointmentService {
    constructor(private readonly appointmentRepository: AppointmentRepository) {
    }

    async bookAppointment(
        patientId: number,
        doctorId: number,
        appointmentDate: string,
        reason: string
    ): Promise<AppointmentModel> {
        const appointment: AppointmentModel = {
            patientId,
            doctorId,
            appointmentDate,
            reason,
            status: AppointmentStatus.BOOKED,
        };

        return await this.appointmentRepository.create(appointment);
    }

    public async cancelAppointment(appointmentId: number): Promise<{ appointmentId: number }> {
        await this.appointmentRepository.delete(appointmentId);

        return {appointmentId};
    }

    public async rescheduleAppointment(appointmentId: number, newAppointmentDate: string): Promise<AppointmentModel> {
        return this.appointmentRepository.reschedule(appointmentId, newAppointmentDate);
    }

    public async getAppointments(patientId: number): Promise<AppointmentModel[]> {
        return this.appointmentRepository.getAppointmentsByPatientId(patientId);
    }

    async getAppointmentsByDoctor(doctorId: number): Promise<AppointmentModel[]> {
        return this.appointmentRepository.getAppointmentsByDoctor(doctorId);
    }
}
