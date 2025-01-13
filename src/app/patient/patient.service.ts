import {Service} from "typedi";
import {PatientModel} from "./patient.model";
import {PatientRepository} from "./patient.repository";

@Service()
export class PatientService {
    constructor(private readonly patientRepository: PatientRepository) {}

    /**
     * Creates a new patient.
     * @param patientData - The data for the new patient.
     * @returns The created patient.
     * @throws Error if a patient with the same email already exists.
     */
    async create(patientData: PatientModel): Promise<PatientModel> {
        // Check if a patient with the same email already exists
        const existingPatient = await this.patientRepository.findByName(patientData.name);
        if (existingPatient) {
            throw new Error("Patient with this name already exists");
        }

        // Create the patient
        return await this.patientRepository.create(patientData);
    }
}
