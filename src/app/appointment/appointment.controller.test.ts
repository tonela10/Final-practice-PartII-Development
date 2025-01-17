
import { jest } from '@jest/globals';
import { Request, Response } from "express";
import {AppointmentService} from "./appointment.service";
import {AppointmentController} from "./appointment.controller";
import {AppointmentModel} from "./appointment.model";
import {AppointmentStatus} from "./utils/AppointmentStatus";



describe("AppointmentController", () => {
    let appointmentController: AppointmentController;
    let appointmentService: jest.Mocked<AppointmentService>;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        // Mock the appointmentService methods
        appointmentService = {
            bookAppointment: jest.fn(),
            cancelAppointment: jest.fn(),
            rescheduleAppointment: jest.fn(),
        } as any;

        // Instantiate the controller with the mocked service
        appointmentController = new AppointmentController(appointmentService);

        // Initialize req and res mocks
        req = {};

        // Properly mock the res object with explicit types
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as Partial<Response>;
    });

    it("should successfully book an appointment", async () => {
        // Prepare the mock request body and service response
        const mockAppointment: AppointmentModel = {
            patientId: 1,
            doctorId: 2,
            appointmentDate: "2025-01-17T10:00:00Z",
            reason: "Checkup",
            status: AppointmentStatus.BOOKED,
        };
        const mockCreatedAppointment: AppointmentModel = { ...mockAppointment, appointmentId: 123 };

        // Mock the service method to return the mock appointment
        appointmentService.bookAppointment.mockResolvedValue(mockCreatedAppointment);

        // Prepare mock request body
        req.body = mockAppointment;

        // Call the controller method
        await appointmentController['bookAppointment'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCreatedAppointment);
    });

    it("should return status 500 when booking an appointment fails", async () => {
        // Mock the service method to throw an error
        const error = new Error("Service error");
        appointmentService.bookAppointment.mockRejectedValue(error);

        // Prepare mock request body
        req.body = { patientId: 1, doctorId: 2, appointmentDate: "2025-01-17T10:00:00Z", reason: "Checkup" };

        // Call the controller method
        await appointmentController['bookAppointment'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error", error2: error.message });
    });


    it("should return status 400 when canceling an appointment fails", async () => {
        // Mock the service method to throw an error
        const error = new Error("Service error");
        appointmentService.cancelAppointment.mockRejectedValue(error);

        // Prepare mock request parameters
        req.params = { appointmentId: "123" };

        // Call the controller method
        await appointmentController['cancelAppointment'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });

    it("should successfully reschedule an appointment", async () => {
        // Prepare mock request parameters and body
        const appointmentId = 123;
        const newAppointmentDate = "2025-01-18T10:00:00Z";
        const mockUpdatedAppointment: AppointmentModel = {
            appointmentId,
            patientId: 1,
            doctorId: 2,
            appointmentDate: newAppointmentDate,
            reason: "Checkup",
            status: AppointmentStatus.RESCHEDULED,
        };

        // Mock the service method to return the updated appointment
        appointmentService.rescheduleAppointment.mockResolvedValue(mockUpdatedAppointment);

        // Prepare mock request parameters and body
        req.params = { appointmentId: String(appointmentId) };
        req.body = { appointmentDate: newAppointmentDate };

        // Call the controller method
        await appointmentController['rescheduleAppointment'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUpdatedAppointment);
    });

    it("should return status 400 when rescheduling an appointment fails", async () => {
        // Mock the service method to throw an error
        const error = new Error("Service error");
        appointmentService.rescheduleAppointment.mockRejectedValue(error);

        // Prepare mock request parameters and body
        req.params = { appointmentId: "123" };
        req.body = { appointmentDate: "2025-01-18T10:00:00Z" };

        // Call the controller method
        await appointmentController['rescheduleAppointment'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
});
