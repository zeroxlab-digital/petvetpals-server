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
        enum: ["male", "female"],
        default: null
    },
    image: {
        type: String,
        default: null,
    },
    banner: {
        type: String,
        default: null,
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
    experiences: {
        type: Array,
        default: [],
    },
    works_at: {
        type: String,
        default: null
    },
    based_in: {
        type: String,
        default: null
    },
    languages: {
        type: Array,
        default: []
    },
    slots_booked: {
        type: Array,
        default: [],
        required: true
    },
}, { timestamps: true, minimize: false })

export const Vet = mongoose.model("Vet", vetSchema);