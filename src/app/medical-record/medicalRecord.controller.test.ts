import {MedicalRecordController} from './medicalRecord.controller';
import {MedicalRecordService} from './medicalRecord.service';
import {Request, Response} from 'express';
import {MedicalRecordModel} from './medicalRecord.model';

describe('MedicalRecordController', () => {
    let medicalRecordController: MedicalRecordController;
    let medicalRecordService: jest.Mocked<MedicalRecordService>;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        medicalRecordService = {
            create: jest.fn(),
            update: jest.fn(),
            getById: jest.fn(),
        } as any;

        medicalRecordController = new MedicalRecordController(medicalRecordService);

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('create', () => {
        it('should create a medical record and return status 201', async () => {
            const mockRecord: MedicalRecordModel = {
                patientId: 1,
                doctorId: 1,
                diagnosis: 'Flu',
                prescriptions: ['Medicine A'],
                notes: 'Patient is recovering',
                testResults: [{testName: 'Blood Test', result: 'Positive', date: '2025-01-01'}],
                ongoingTreatments: ['Treatment A'],
            };

            medicalRecordService.create.mockResolvedValue(mockRecord);

            req.body = mockRecord;

            await medicalRecordController['create'](req as Request, res as Response);

            expect(medicalRecordService.create).toHaveBeenCalledWith(mockRecord);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockRecord);
        });

        it('should return status 400 if required fields are missing', async () => {
            req.body = {doctorId: 1, diagnosis: 'Flu'};

            await medicalRecordController['create'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: 'Missing required fields'});
        });

        it('should return 500 status on error', async () => {
            const error = new Error('Database error');
            medicalRecordService.create.mockRejectedValue(error);

            req.body = {patientId: 1, doctorId: 1, diagnosis: 'Flu'};

            await medicalRecordController['create'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: `Failed to create medical record: ${error.message}`,
            });
        });
    });

    describe('update', () => {
        it('should update a medical record and return status 200', async () => {
            const updatedRecord: Partial<MedicalRecordModel> = {
                diagnosis: 'Cold',
                prescriptions: ['Medicine B'],
                testResults: [{testName: 'X-Ray', result: 'Normal', date: '2025-01-02'}],
            };

            const mockUpdatedRecord: MedicalRecordModel = {
                recordId: 1,
                patientId: 1,
                doctorId: 1,
                diagnosis: 'Cold',
                prescriptions: ['Medicine B'],
                notes: 'Patient is recovering',
                testResults: [{testName: 'X-Ray', result: 'Normal', date: '2025-01-02'}],
                ongoingTreatments: ['Treatment A'],
                createdAt: '2025-01-10',
            };

            medicalRecordService.update.mockResolvedValue(mockUpdatedRecord);

            req.params = {recordId: '1'};
            req.body = updatedRecord;

            await medicalRecordController['update'](req as Request, res as Response);

            expect(medicalRecordService.update).toHaveBeenCalledWith(1, updatedRecord);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdatedRecord);
        });

        it('should return status 400 if recordId is invalid', async () => {
            req.params = {recordId: 'invalid'};

            await medicalRecordController['update'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({error: 'Failed to update medical record: Cannot destructure property \'diagnosis\' of \'req.body\' as it is undefined.'});
        });

        it('should return 500 status on error', async () => {
            const error = new Error('Database error');
            medicalRecordService.update.mockRejectedValue(error);

            req.params = {recordId: '1'};
            req.body = {diagnosis: 'Cold'};

            await medicalRecordController['update'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: `Failed to update medical record: ${error.message}`,
            });
        });
    });


    describe('getById', () => {
        it('should return a medical record by id with status 200', async () => {
            const mockRecord: MedicalRecordModel = {
                patientId: 1,
                doctorId: 1,
                diagnosis: 'Flu',
                prescriptions: ['Medicine A'],
                notes: 'Patient is recovering',
                testResults: [{testName: 'Blood Test', result: 'Positive', date: '2025-01-01'}],
                ongoingTreatments: ['Treatment A'],
            };

            medicalRecordService.getById.mockResolvedValue(mockRecord);

            req.params = {recordId: '1'};

            await medicalRecordController['getById'](req as Request, res as Response);

            expect(medicalRecordService.getById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockRecord);
        });

        it('should return status 400 if recordId is invalid', async () => {
            req.params = {recordId: 'invalid'};

            await medicalRecordController['getById'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: 'Invalid record ID'});
        });

        it('should return status 404 if medical record is not found', async () => {
            medicalRecordService.getById.mockResolvedValue(null);

            req.params = {recordId: '1'};

            await medicalRecordController['getById'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({error: 'Medical record not found'});
        });

        it('should return 500 status on error', async () => {
            const error = new Error('Database error');
            medicalRecordService.getById.mockRejectedValue(error);

            req.params = {recordId: '1'};

            await medicalRecordController['getById'](req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: `Failed to fetch medical record: ${error.message}`,
            });
        });
    });

    describe('getRouter', () => {
        it('should return the router instance', () => {
            const router = medicalRecordController.getRouter();
            expect(router).toBeDefined();
        });
    });
});
