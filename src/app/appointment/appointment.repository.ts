import {Service} from "typedi";
import {DatabaseService} from "../../database/database.service";
import {AppointmentModel} from "./appointment.model";

@Service()
export class AppointmentRepository {
    constructor(private readonly databaseService: DatabaseService) {
    }

    async create(appointment: AppointmentModel): Promise<AppointmentModel> {
        const db = await this.databaseService.openDatabase();

        const result = await db.run(
            `
                INSERT INTO appointments (patientId, doctorId, appointmentDate, reason, status)
                VALUES (?, ?, ?, ?, ?)
            `,
            [
                appointment.patientId,
                appointment.doctorId,
                appointment.appointmentDate,
                appointment.reason,
                appointment.status,
            ]
        );

        return {
            ...appointment,
            appointmentId: result.lastID,
        };
    }

    async delete(appointmentId: number): Promise<void> {
        const db = await this.databaseService.openDatabase();

        const result = await db.run(
            `
                DELETE
                FROM appointments
                WHERE appointmentId = ?
            `,
            [appointmentId]
        );

        if (result.changes === 0) {
            throw new Error("Appointment not found");
        }
    }

    async reschedule(appointmentId: number, newAppointmentDate: string): Promise<AppointmentModel> {
        const db = await this.databaseService.openDatabase();

        const result = await db.run(
            `
                UPDATE appointments
                SET appointmentDate = ?,
                    status = 'Rescheduled'
                WHERE appointmentId = ?
            `,
            [newAppointmentDate, appointmentId]
        );

        if (result.changes === 0) {
            throw new Error("Appointment not found");
        }

        // Retrieve the updated appointment
        const updatedAppointment = await db.get(
            `
                SELECT *
                FROM appointments
                WHERE appointmentId = ?
            `,
            [appointmentId]
        );

        return updatedAppointment;
    }

    async getAppointmentsByPatientId(patientId: number): Promise<AppointmentModel[]> {
        const db = await this.databaseService.openDatabase();

        return await db.all(
            `
                SELECT *
                FROM appointments
                WHERE patientId = ?
            `,
            [patientId]
        );
    }
}
