import mongoose from "mongoose";

const petSchema = mongoose.Schema({
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
})
export const Pet = mongoose.model("Pet", petSchema);