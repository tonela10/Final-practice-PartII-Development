import {Service} from "typedi";
import {DoctorRepository} from "./doctor.repository";
import {DoctorModel} from "./doctor.model";

@Service()
export class DoctorService {
    constructor(private readonly doctorRepository: DoctorRepository) {}

    async create(doctorData: DoctorModel): Promise<DoctorModel> {
        const existingEmail = await this.doctorRepository.findByEmail(doctorData.email);
        if (existingEmail) {
            throw new Error("A doctor with this email already exists");
        }

        const existingLicense = await this.doctorRepository.findByLicenseNumber(doctorData.licenseNumber);
        if (existingLicense) {
            throw new Error("A doctor with this license number already exists");
        }

        return await this.doctorRepository.create(doctorData);
    }
}
