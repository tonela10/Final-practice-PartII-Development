import {Service} from "typedi";
import {DoctorRepository} from "./doctor.repository";
import {DoctorModel} from "./doctor.model";
import {SpecialtyRepository} from "../../specialties/specialty.repository";
import {AvailabilityRepository} from "../../availability/availability.repository";

@Service()
export class DoctorService {
    constructor(
        private readonly doctorRepository: DoctorRepository,
        private readonly specialtyRepository: SpecialtyRepository,
        private readonly availabilityRepository: AvailabilityRepository,
    ) {
    }

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
        const doctor = await this.doctorRepository.getDoctorById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found.");
        }

        const specialty = await this.specialtyRepository.getSpecialtyById(specialtyId);
        if (!specialty) {
            throw new Error("Specialty not found.");
        }

        await this.doctorRepository.updateDoctorSpecialty(doctorId, specialtyId);

        return {
            doctorId,
            specialties: [specialty],
        };
    }

    async getDoctorSpecialties(doctorId: number) {
        const doctor = await this.doctorRepository.getDoctorById(doctorId);
        if (!doctor) {
            throw new Error("Doctor not found.");
        }

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

    async searchDoctors(filters: {
        availability?: { day: string; startTime: string; endTime: string }[];
        specialtyId?: number;
        location?: string;
    }) {
        const {availability, specialtyId, location} = filters;

        const doctors = await this.doctorRepository.searchDoctors(filters);

        return await Promise.all(
            doctors.map(async (doctor) => {
                const availability = await this.availabilityRepository.getAvailabilityByDoctorId(doctor.id!);
                const specialty = await this.specialtyRepository.getSpecialtyById(doctor.specialtyId);

                return {
                    doctorId: doctor.id,
                    name: doctor.name,
                    availability,
                    specialties: specialty ? [{specialtyId: specialty.specialtyId, name: specialty.name}] : [],
                    location: doctor.location,
                };
            })
        );
    }

}
