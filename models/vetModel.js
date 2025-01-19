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
        required: true
    },
    image: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    fees: {
        type: Number,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    slots_book: {
        type: Object,
        default: {}
    }
}, { minimize: false })

export const vetModel = mongoose.model("vet", vetSchema);