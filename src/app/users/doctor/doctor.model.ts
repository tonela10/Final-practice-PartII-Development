export interface DoctorModel {
    id?: number;          // Primary Key
    name: string;         // Doctor's name
    email: string;        // Doctor's email
    password: string;     // Hashed password for security
    specialty: string;    // Medical specialty
    licenseNumber: string; // Unique medical license number
}