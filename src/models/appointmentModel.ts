import { Schema, model, InferSchemaType } from 'mongoose';

const appointmentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vet: {
        type: Schema.Types.ObjectId,
        ref: "Vet",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    payment_status: {
        type: Boolean,
        default: false,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "past"],
        default: null
    },
    pet: {
        type: Schema.Types.ObjectId,
        ref: "Pet",
        default: null
    },
    purpose: {
        type: String,
        default: null
    }
}, { timestamps: true })

type IAppointment = InferSchemaType<typeof appointmentSchema>;

export const Appointment = model<IAppointment>('Appointment', appointmentSchema);