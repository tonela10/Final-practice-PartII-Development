import {SpecialtyController} from './specialty.controller';
import {SpecialtyService} from './specialty.service';
import {Request, Response} from 'express';

describe('SpecialtyController', () => {
    let specialtyController: SpecialtyController;
    let specialtyService: jest.Mocked<SpecialtyService>;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        specialtyService = {
            getAll: jest.fn(),
        } as any;

        specialtyController = new SpecialtyController(specialtyService);

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('getAll', () => {
        it('should return a list of specialties with status 200', async () => {
            const mockSpecialties = [
                {specialtyId: 1, name: 'Cardiology', description: 'Heart specialist'},
                {specialtyId: 2, name: 'Neurology', description: 'Brain and nervous system specialist'},
            ];
            specialtyService.getAll.mockResolvedValue(mockSpecialties);

            await specialtyController['getAll'](req as Request, res as Response);

            expect(specialtyService.getAll).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockSpecialties);
        });

        it('should return a 500 status and error message if an exception occurs', async () => {
            const error = new Error('Database error');
            specialtyService.getAll.mockRejectedValue(error);

            await specialtyController['getAll'](req as Request, res as Response);

            expect(specialtyService.getAll).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: `Failed to fetch specialties: ${error.message}`,
            });
        });
    });

    describe('getRouter', () => {
        it('should return the router instance', () => {
            const router = specialtyController.getRouter();
            expect(router).toBeDefined();
        });
    });
});
