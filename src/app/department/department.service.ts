import { Service } from "typedi";
import { DepartmentRepository } from "./department.repository";
import { DepartmentModel } from "./department.model";

@Service()
export class DepartmentService {
    constructor(private readonly departmentRepository: DepartmentRepository) {}

    // Method to get all departments
    async getAllDepartments(): Promise<DepartmentModel[]> {
        return this.departmentRepository.getAllDepartments();
    }
}
