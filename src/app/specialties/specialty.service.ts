import { Service } from "typedi";
import { SpecialtyRepository } from "./specialty.repository";
import { SpecialtyModel } from "./specialty.model";

@Service()
export class SpecialtyService {
    constructor(private readonly specialtyRepository: SpecialtyRepository) {}

    async getAll(): Promise<SpecialtyModel[]> {
        return this.specialtyRepository.getAll();
    }
}
