import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { AvailabilityService } from '../../availability/availability.service';
import { AppointmentService } from '../../appointment/appointment.service';

describe('DoctorController', () => {
    let doctorController: DoctorController;
    let doctorService: jest.Mocked<DoctorService>;
    let availabilityService: jest.Mocked<AvailabilityService>;
    let appointmentService: jest.Mocked<AppointmentService>;

    beforeEach(() => {
        doctorService = {
            create: jest.fn(),
            updateProfile: jest.fn(),
            getProfile: jest.fn(),
            associateSpecialty: jest.fn(),
            getDoctorSpecialties: jest.fn(),
        } as any;

        availabilityService = {
            setAvailability: jest.fn(),
            getAvailabilityByDoctor: jest.fn(),
        } as any;

        appointmentService = {
            getAppointmentsByDoctor: jest.fn(),
        } as any;

        doctorController = new DoctorController(doctorService, availabilityService, appointmentService);
    });

    it('should create a new doctor', async () => {
        doctorService.create.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 1,
            password: 'hashedpassword123',
            licenseNumber: 'ABC12345',
            location: '',
        });

        const req = { body: { name: 'John Doe', email: 'john@example.com', password: 'password', specialty: 1, licenseNumber: 'ABC12345' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 1,
            password: 'hashedpassword123',
            licenseNumber: 'ABC12345',
            location: '',
        });
    });

    it('should update a doctor profile', async () => {
        doctorService.updateProfile.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 1,
            password: 'hashedpassword123',
            licenseNumber: 'ABC12345',
        });

        const req = { params: { doctorId: '1' }, body: { name: 'John Doe', email: 'john@example.com', specialty: 1 } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.updateProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 1,
        });
    });

    it('should get a doctor profile', async () => {
        doctorService.getProfile.mockResolvedValue({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 1,
            password: 'hashedpassword123',
            licenseNumber: 'ABC12345',
        });

        const req = { params: { doctorId: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.getProfile(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            specialty: 1,
            licenseNumber: 'ABC12345',
        });
    });

    it('should set availability for a doctor', async () => {
        availabilityService.setAvailability.mockResolvedValue({
            doctorId: 1,
            startTime: '09:00',
            endTime: '17:00',
            days: ['Monday', 'Wednesday'],
        });

        const req = { params: { doctorId: '1' }, body: { startTime: '09:00', endTime: '17:00', days: ['Monday', 'Wednesday'] } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.setAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            doctorId: 1,
            startTime: '09:00',
            endTime: '17:00',
            days: ['Monday', 'Wednesday'],
        });
    });

    it('should get a doctor\'s availability', async () => {
        availabilityService.getAvailabilityByDoctor.mockResolvedValue([
            { doctorId: 1, startTime: '09:00', endTime: '17:00', days: ['Monday', 'Wednesday'] },
        ]);

        const req = { params: { doctorId: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.getAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { doctorId: 1, startTime: '09:00', endTime: '17:00', days: ['Monday', 'Wednesday'] },
        ]);
    });

    it('should associate a doctor with a specialty', async () => {
        doctorService.associateSpecialty.mockResolvedValue({
            doctorId: 1,
            specialties: [{ specialtyId: 2, name: 'Cardiology', description: 'Heart specialist' }],
        });

        const req = { params: { doctorId: '1' }, body: { specialtyIds: [2] } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.associateSpecialty(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            doctorId: 1,
            specialties: [{ specialtyId: 2, name: 'Cardiology', description: 'Heart specialist' }],
        });
    });

    it('should get a doctor\'s specialties', async () => {
        doctorService.getDoctorSpecialties.mockResolvedValue([
            { specialtyId: 1, name: 'Cardiology', description: 'Heart specialist' },
        ]);

        const req = { params: { doctorId: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

        await doctorController.getSpecialties(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            { specialtyId: 1, name: 'Cardiology', description: 'Heart specialist' },
        ]);
    });
});
