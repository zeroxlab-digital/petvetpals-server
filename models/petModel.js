import mongoose from "mongoose";

const petSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null,
        required: false
    },
    age: {
        type: Number,
        required: true
    },
    breed: {
        type: String,
        default: "Unknown",
        required: false
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    weight: {
        type: Number,
        required: false
    }
}, { timestamps: true })
export const Pet = mongoose.model("Pet", petSchema);