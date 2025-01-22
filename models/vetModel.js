import mongoose from "mongoose";

const vetSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "Not specified"],
        default: "Not specified"
    },
    image: {
        type: String,
        default: "",
    },
    specialities: {
        type: Array,
        default: [],
        required: true
    },
    about: {
        type: String,
        default: "",
    },
    fees: {
        type: Number,
        default: 0,
        required: true
    },
    degrees: {
        type: Array,
        default: [],
        required: true
    },
    experience_years: {
        type: Number,
        default: 0,
        required: true
    },
    slots_booked: {
        type: Array,
        default: [],
        required: true
    }
}, { timestamp: true })

export const Vet = mongoose.model("Vet", vetSchema);