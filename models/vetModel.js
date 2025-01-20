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
    speciality: {
        type: String,
        default: "",
    },
    about: {
        type: String,
        default: "",
    },
    fees: {
        type: Number,
        default: 0
    },
    degree: {
        type: String,
        default: "",
    },
    experience: {
        type: Number,
        default: 0
    },
    date: {
        type: Number,
        default: Date.now()
    },
    slots_book: {
        type: Object,
        default: {},
        required: false
    }
}, { minimize: false })

export const Vet = mongoose.model("Vet", vetSchema);