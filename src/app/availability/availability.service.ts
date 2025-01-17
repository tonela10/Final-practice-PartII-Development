import {Service} from "typedi";
import {AvailabilityRepository} from "./availability.repository";
import {AvailabilityModel} from "./availability.model";

@Service()
export class AvailabilityService {
    constructor(private readonly availabilityRepository: AvailabilityRepository) {}

    async setAvailability(availability: AvailabilityModel): Promise<AvailabilityModel> {
        return this.availabilityRepository.create(availability);
    }

    async getAvailabilityByDoctor(doctorId: number): Promise<AvailabilityModel[]> {
        return this.availabilityRepository.getAvailabilityByDoctor(doctorId);
    }
}
