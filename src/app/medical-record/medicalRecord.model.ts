export interface MedicalRecordModel {
    recordId?: number;
    patientId: number;
    doctorId: number;
    diagnosis: string;
    prescriptions: string[];
    notes: string;
    testResults: TestResult[];
    ongoingTreatments: string[];
    createdAt?: string;
}

export interface TestResult {
    testName: string;
    result: string;
    date: string;
}
