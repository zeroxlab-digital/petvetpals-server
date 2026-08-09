import { Schema, model, InferSchemaType } from 'mongoose';

const petSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ['dog', 'cat'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    date_of_birth: {
        type: Date,
        required: true,
        default: null
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
    weight: [
        {
            value: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    activity_level: [
        {
            value: { type: Number, required: false, min: 0, max: 100 },
            date: { type: Date, default: Date.now }
        }
    ],
    energy_level: [
        {
            value: { type: Number, required: false, min: 0, max: 100 },
            date: { type: Date, default: Date.now }
        }
    ],
    overall_health: {
        type: Number,
        default: 70,
        min: 0,
        max: 100
    }
}, { timestamps: true })

type IPet = InferSchemaType<typeof petSchema>;

export const Pet = model<IPet>('Pet', petSchema);