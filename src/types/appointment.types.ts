
export interface BookAppointmentDTO {
    date: Date;
}

export interface UpdateAppointmentDTO {
    pet: {};
    purpose: string;
    payment_status: boolean;
    status: "pending" | "confirmed" | "cancelled" | "past";
    date: Date
}

export interface SlotBookDTO {
    date: Date;
    appointmentId: string;
}