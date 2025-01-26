import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vet: {
        type: mongoose.Schema.Types.ObjectId,
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
        enum: ["pending", "confirmed", "cancelled"],
        default: null
    }
}, { timestamps: true })

export const Appointment = mongoose.model("Appointment", appointmentSchema);