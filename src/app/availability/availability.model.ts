export interface AvailabilityModel {
    availabilityId?: number;  // Optional, because it's auto-generated
    doctorId: number;
    startTime: string;  // datetime string
    endTime: string;    // datetime string
    days: string[];     // array of days, e.g., ["Monday", "Wednesday", "Friday"]
}
