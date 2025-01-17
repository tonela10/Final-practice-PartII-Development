import {Service} from "typedi";
import {DoctorRepository} from "./doctor.repository";
import {DoctorModel} from "./doctor.model";
import {SpecialtyRepository} from "../../specialties/specialty.repository";

@Service()
export class DoctorService {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly specialtyRepository: SpecialtyRepository,
        ) {}

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

    async updateProfile(doctorId: number, updates: Partial<DoctorModel>): Promise<DoctorModel> {
        return await this.doctorRepository.update(doctorId, updates);
    }

    async getProfile(doctorId: number): Promise<DoctorModel> {
        const doctor = await this.doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found");
        }
        return doctor;
    }

    async associateSpecialty(doctorId: number, specialtyId: number) {
        // Ensure the doctor exists
        const doctor = await this.doctorRepository.getDoctorById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found.");
        }

        // Ensure the specialty exists
        const specialty = await this.specialtyRepository.getSpecialtyById(specialtyId);
        if (!specialty) {
            throw new Error("Specialty not found.");
        }

        // Associate the doctor with the specialty
        await this.doctorRepository.updateDoctorSpecialty(doctorId, specialtyId);

        // Return the updated association
        return {
            doctorId,
            specialties: [specialty],
        };
    }
    
    async getDoctorSpecialties(doctorId: number) {
        // Ensure the doctor exists
        const doctor = await this.doctorRepository.getDoctorById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found.");
        }

        // Fetch the associated specialty
        const specialty = await this.specialtyRepository.getSpecialtyById(doctor.specialtyId);

        return specialty
            ? [
                {
                    specialtyId: specialty.specialtyId,
                    name: specialty.name,
                    description: specialty.description,
                },
            ]
            : [];
    }

    async getDoctorsBySpecialty(specialtyId?: number) {
        // Fetch doctors from the repository
        const doctors = await this.doctorRepository.getDoctorsBySpecialty(specialtyId);

        // Map results with specialty details
        const doctorList = await Promise.all(
            doctors.map(async (doctor) => {
                const specialty = await this.specialtyRepository.getSpecialtyById(doctor.specialtyId);

                return {
                    doctorId: doctor.id,
                    name: doctor.name,
                    email: doctor.email,
                    specialties: specialty
                        ? [
                            {
                                specialtyId: specialty.specialtyId,
                                name: specialty.name,
                            },
                        ]
                        : [],
                };
            })
        );

        return doctorList;
    }
}
