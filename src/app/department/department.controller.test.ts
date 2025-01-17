import {Request, Response} from "express";
import {DepartmentController} from "./department.controller";
import {DepartmentService} from "./department.service";
import {jest} from '@jest/globals';

interface DepartmentModel {
    departmentId: number;
    name: string;
    description: string;
}

describe('DepartmentController', () => {
    let departmentController: DepartmentController;
    let departmentService: jest.Mocked<DepartmentService>;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        departmentService = {
            getAllDepartments: jest.fn(),
        } as any;

        departmentController = new DepartmentController(departmentService);

        req = {};

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as Partial<Response>;
    });

    it('should get all departments successfully', async () => {

        const mockDepartments: DepartmentModel[] = [
            {departmentId: 1, name: 'Cardiology', description: 'Heart-related issues'},
            {departmentId: 2, name: 'Neurology', description: 'Brain and nervous system'},
        ];

        departmentService.getAllDepartments.mockResolvedValue(mockDepartments);

        await departmentController['getAllDepartments'](req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockDepartments);
    });

    it('should return status 500 when there is an error fetching departments', async () => {

        const error = new Error('Service error');
        departmentService.getAllDepartments.mockRejectedValue(error);

        await departmentController['getAllDepartments'](req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: `Failed to fetch departments: ${error.message}`});
    });
});
