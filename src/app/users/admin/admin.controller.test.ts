import request from 'supertest';
import express from 'express';
import {AdminController} from './admin.controller';
import {AdminService} from './admin.service';
import {UserService} from '../user.service';

jest.mock('./admin.service');
jest.mock('../user.service');

describe('AdminController', () => {
    let app: express.Application;
    let adminController: AdminController;
    let adminService: jest.Mocked<AdminService>;
    let userService: jest.Mocked<UserService>;

    beforeEach(() => {
        // @ts-ignore
        adminService = new AdminService() as jest.Mocked<AdminService>;
        // @ts-ignore
        userService = new UserService() as jest.Mocked<UserService>;

        adminController = new AdminController(adminService, userService);
        app = express();
        app.use(express.json());
        app.use('/api/admin', adminController.getRouter());
    });

    describe('POST /api/admin', () => {
        it('should create a new admin', async () => {
            adminService.createAdmin.mockResolvedValue({id: 1, name: 'John Doe', email: 'john@example.com'});

            const response = await request(app)
                .post('/api/admin')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(201);
            expect(response.body.name).toBe('John Doe');
            expect(response.body.email).toBe('john@example.com');
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app).post('/api/admin').send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Missing required fields');
        });

        it('should return 409 if the admin already exists', async () => {
            adminService.createAdmin.mockRejectedValue(new Error('Admin with this email already exists'));

            const response = await request(app)
                .post('/api/admin')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(409);
            expect(response.body.error).toBe('Admin with this email already exists');
        });

        it('should return 500 for internal server errors', async () => {
            adminService.createAdmin.mockRejectedValue(new Error('Some internal error'));

            const response = await request(app)
                .post('/api/admin')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('PUT /api/admin/:adminId', () => {
        it('should update an admin', async () => {
            adminService.updateAdmin.mockResolvedValue({id: 1, name: 'John Doe', email: 'john@example.com'});

            const response = await request(app)
                .put('/api/admin/1')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('John Doe');
            expect(response.body.email).toBe('john@example.com');
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app).put('/api/admin/1').send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Missing required fields');
        });

        it('should return 404 if admin is not found', async () => {
            adminService.updateAdmin.mockRejectedValue(new Error('Admin not found'));

            const response = await request(app)
                .put('/api/admin/1')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Admin not found');
        });

        it('should return 500 for internal server errors', async () => {
            adminService.updateAdmin.mockRejectedValue(new Error('Some internal error'));

            const response = await request(app)
                .put('/api/admin/1')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /api/admin/:adminId', () => {
        it('should get an admin profile', async () => {
            adminService.getAdminProfile.mockResolvedValue({id: 1, name: 'John Doe', email: 'john@example.com'});

            const response = await request(app).get('/api/admin/1');

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('John Doe');
            expect(response.body.email).toBe('john@example.com');
        });

        it('should return 404 if admin is not found', async () => {
            adminService.getAdminProfile.mockRejectedValue(new Error('Admin not found'));

            const response = await request(app).get('/api/admin/1');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Admin not found');
        });

        it('should return 500 for internal server errors', async () => {
            adminService.getAdminProfile.mockRejectedValue(new Error('Some internal error'));

            const response = await request(app).get('/api/admin/1');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal Server Error');
        });
    });

    describe('GET /api/admin/searchUsers', () => {
        it('should search users by query parameters', async () => {
            userService.searchUsers.mockResolvedValue([{
                userId: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'Admin'
            }]);

            const response = await request(app).get('/api/admin/searchUsers').query({role: 'Admin'});

            expect(response.status).toBe(200);
            expect(response.body[0].name).toBe('John Doe');
            expect(response.body[0].role).toBe('Admin');
        });

        it('should return 400 if no query parameters are provided', async () => {
            const response = await request(app).get('/api/admin/searchUsers');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('At least one search parameter (role, name, or email) is required.');
        });

        it('should return 500 for internal server errors', async () => {
            userService.searchUsers.mockRejectedValue(new Error('Some internal error'));

            const response = await request(app).get('/api/admin/searchUsers').query({role: 'Admin'});

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Failed to search users: Some internal error');
        });
    });
});
