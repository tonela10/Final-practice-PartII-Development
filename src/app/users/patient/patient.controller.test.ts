import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { AppointmentService } from '../../appointment/appointment.service';
import { MedicalRecordService } from '../../medical-record/medicalRecord.service';
import { DoctorService } from '../doctor/doctor.service';
import { AppointmentStatus } from '../../appointment/utils/AppointmentStatus';

describe('PatientController', () => {
    let patientController: PatientController;
    let patientService: jest.Mocked<PatientService>;
    let appointmentService: jest.Mocked<AppointmentService>;
    let medicalRecordService: jest.Mocked<MedicalRecordService>;
    let doctorService: jest.Mocked<DoctorService>;

    beforeEach(() => {
        patientService = {
            create: jest.fn(),
            update: jest.fn(),
            getProfile: jest.fn(),
        } as any;

        appointmentService = {
            getAppointments: jest.fn(),
        } as any;

        medicalRecordService = {
            getByPatientId: jest.fn(),
        } as any;

        doctorService = {
            searchDoctors: jest.fn(),
        } as any;

        patientController = new PatientController(
            patientService,
            appointmentService,
            medicalRecordService,
            doctorService,
        );
    });

    it('should create a new patient', async () => {
        patientService.create.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedpassword123',
            dateOfBirth: '1990-01-01',
            address: '123 Main St',
        });

        const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'password', dateOfBirth: '1990-01-01', address: '123 Main St' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await patientController['create'](req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            dateOfBirth: '1990-01-01',
            address: '123 Main St',
        });
    });

    it('should update a patient profile', async () => {
        patientService.update.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            address: '123 Main St',
            password: 'hashedpassword123',
            dateOfBirth: '1990-01-01',
        });

        const req = { params: { patientId: '1' }, body: { name: 'John Doe', email: 'john@example.com', address: '123 Main St' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await patientController['update'](req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            address: '123 Main St',
            password: 'hashedpassword123',
            dateOfBirth: '1990-01-01',
        });
    });

    it('should get a patient profile', async () => {
        patientService.getProfile.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedpassword123',
            dateOfBirth: '1990-01-01',
            address: '123 Main St',
        });

        const req = { params: { patientId: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await patientController['getProfile'](req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            dateOfBirth: '1990-01-01',
            address: '123 Main St',
            password: 'hashedpassword123',
        });
    });

    it('should get patient appointments', async () => {
        appointmentService.getAppointments.mockResolvedValue([
            {
                appointmentId: 1,
                doctorId: 2,
                appointmentDate: '2025-01-18',
                reason: 'Check-up',
                status: AppointmentStatus.BOOKED,
                patientId: 0
            },
        ]);

        const req = { params: { patientId: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await patientController['getAppointments'](req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                appointmentId: 1,
                doctorId: 2,
                appointmentDate: '2025-01-18',
                reason: 'Check-up',
                status: AppointmentStatus.BOOKED,
                patientId: 0
            },
        ]);
    });

    it('should get medical records by patient ID', async () => {
        medicalRecordService.getByPatientId.mockResolvedValue([
            {
                patientId: 1,
                notes: 'Medical note 1',
                doctorId: 0,
                diagnosis: '',
                prescriptions: [],
                testResults: [],
                ongoingTreatments: [],
            },
        ]);

        const req = { params: { patientId: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await patientController['getMedicalRecordByPatientId'](req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                diagnosis:"",
                doctorId: 0,
                patientId: 1,
                notes: 'Medical note 1',
                ongoingTreatments: [],
                prescriptions: [],
                testResults: [],
            },
        ]);
    });

    it('should search doctors by criteria', async () => {
        doctorService.searchDoctors.mockResolvedValue([
            {
                doctorId: 1,
                name: 'Dr. Jane Doe',
                specialties: [{ specialtyId: 1, name: 'Cardiology' }],
                location: '123 Clinic',
                availability: [],
            },
        ]);

        const req = { body: { specialtyId: 1, location: '123 Clinic' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await patientController['searchDoctors'](req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            {
                doctorId: 1,
                name: 'Dr. Jane Doe',
                specialties: [{ specialtyId: 1, name: 'Cardiology' }],
                location: '123 Clinic',
                availability: [],
            },
        ]);
    });
});
