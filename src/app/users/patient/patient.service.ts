import {Service} from "typedi";
import {PatientModel} from "./patient.model";
import {PatientRepository} from "./patient.repository";

@Service()
export class PatientService {
    constructor(private readonly patientRepository: PatientRepository) {
    }

    /**
     * Creates a new patient.
     * @param patientData - The data for the new patient.
     * @returns The created patient.
     * @throws Error if a patient with the same email already exists.
     */
    async create(patientData: PatientModel): Promise<PatientModel> {
        const existingPatient = await this.patientRepository.findByName(patientData.name);
        if (existingPatient) {
            throw new Error("Patient with this name already exists");
        }

        return await this.patientRepository.create(patientData);
    }

    async update(patientId: number, updateData: Partial<PatientModel>): Promise<PatientModel> {
        const patient = await this.patientRepository.findById(patientId);

        if (!patient) {
            throw new Error("Patient not found");
        }

        const updatedPatient = {
            ...patient,
            ...updateData,
        };

        return await this.patientRepository.update(patientId, updatedPatient);
    }

    async getProfile(patientId: number): Promise<PatientModel> {
        const patient = await this.patientRepository.findById(patientId);
        if (!patient) {
            throw new Error("Patient not found");
        }
        return patient;
    }
}
