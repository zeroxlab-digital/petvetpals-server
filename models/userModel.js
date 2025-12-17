import mongoose from "mongoose";

const userSchema = mongoose.Schema({
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
    address: {
        type: String,
        default: null,
    },
    city: {
        type: String,
        default: null,
    },
    zip: {
        type: String,
        default: null,
    },
    state: {
        type: String,
        default: null
    },
    membership_status: {
        type: String,
        default: "Basic"
    },
    timezone: {
        type: String,
        default: "UTC",
    }
}, { timestamps: true })

export const User = mongoose.model("User", userSchema);