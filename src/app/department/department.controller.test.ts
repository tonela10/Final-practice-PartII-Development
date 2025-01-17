import { Request, Response } from "express";
import { DepartmentController } from "./department.controller";
import { DepartmentService } from "./department.service";
import { jest } from '@jest/globals';

// Create the mock DepartmentModel
interface DepartmentModel {
    departmentId: number;
    name: string;
    description: string;
}

describe('DepartmentController', () => {
    let departmentController: DepartmentController;
    let departmentService: jest.Mocked<DepartmentService>;
    let req: Partial<Request>;
    let res: Partial<Response>; // Make sure to type the mock Response properly

    beforeEach(() => {
        // Mock the departmentService methods
        departmentService = {
            getAllDepartments: jest.fn(),
        } as any;

        // Instantiate the controller with the mocked service
        departmentController = new DepartmentController(departmentService);

        // Initialize req and res mocks
        req = {};

        // Properly mock the res object with explicit types
        res = {
            status: jest.fn().mockReturnThis(),  // Ensures it returns 'this' for chaining
            json: jest.fn()                      // Mock json method
        } as Partial<Response>;
    });

    it('should get all departments successfully', async () => {
        // Prepare mock data for departments
        const mockDepartments: DepartmentModel[] = [
            { departmentId: 1, name: 'Cardiology', description: 'Heart-related issues' },
            { departmentId: 2, name: 'Neurology', description: 'Brain and nervous system' },
        ];

        // Mock the service method to return the mock data
        departmentService.getAllDepartments.mockResolvedValue(mockDepartments);

        // Call the controller method
        await departmentController['getAllDepartments'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockDepartments);
    });

    it('should return status 500 when there is an error fetching departments', async () => {
        // Mock the service method to throw an error
        const error = new Error('Service error');
        departmentService.getAllDepartments.mockRejectedValue(error);

        // Call the controller method
        await departmentController['getAllDepartments'](req as Request, res as Response);

        // Verify the response
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: `Failed to fetch departments: ${error.message}` });
    });
});
