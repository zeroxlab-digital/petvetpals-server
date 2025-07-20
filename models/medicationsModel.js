import mongoose from "mongoose";

const medicationSchema = mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    medication: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    freequency: {
        type: String,
        required: true
    },
    remaining: {
        type: Number,
        required: true,
        default: 0
    },
    next_due: {
        type: Date,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: false
    },
    notes: {
        type: String,
        default: null,
        required: false
    },
    instructions: {
        type: String,
        default: null,
        required: false
    },
    prescribed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vet",
        required: true
    }
}, { timestamps: true })

export const Medication = mongoose.model("Medication", medicationSchema);