import {Service} from "typedi";
import {MedicalRecordRepository} from "./medicalRecord.repository";
import {MedicalRecordModel} from "./medicalRecord.model";

@Service()
export class MedicalRecordService {
    constructor(private readonly medicalRecordRepository: MedicalRecordRepository) {
    }

    async create(record: MedicalRecordModel): Promise<MedicalRecordModel> {
        return this.medicalRecordRepository.create(record);
    }

    async update(recordId: number, updates: Partial<MedicalRecordModel>): Promise<MedicalRecordModel> {
        return this.medicalRecordRepository.update(recordId, updates);
    }

    async getById(recordId: number): Promise<MedicalRecordModel | null> {
        return this.medicalRecordRepository.getById(recordId);
    }
}
