import { Service } from "typedi";
import { MedicalRecordRepository } from "./medicalRecord.repository";
import { MedicalRecordModel } from "./medicalRecord.model";

@Service()
export class MedicalRecordService {
    constructor(private readonly medicalRecordRepository: MedicalRecordRepository) {}

    async create(record: MedicalRecordModel): Promise<MedicalRecordModel> {
        return this.medicalRecordRepository.create(record);
    }
}
