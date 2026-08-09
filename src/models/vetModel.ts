import { Schema, model, InferSchemaType } from 'mongoose';

const vetSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Password must be at least 6 characters!']
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
        type: [String],
        default: []
    },
    about: {
        type: String,
        default: null,
    },
    fees: {
        type: Number,
        default: 0,
        required: true
    },
    degrees: {
        type: [String],
        default: []
    },
    experience_years: {
        type: Number,
        default: 0
    },
    experiences: {
        type: [
            {
                title: { type: String, trim: true },
                description: { type: String, trim: true },
                work_place: { type: String, trim: true },
                start_date: { type: Date },
                end_date: { type: Date, default: null }
            }
        ],
        default: []
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
        type: [String],
        default: []
    },
    slots_booked: {
        type: Array,
        default: [],
        required: true
    },
}, { timestamps: true, minimize: false })

type IVet = InferSchemaType<typeof vetSchema>;

export const Vet = model<IVet>('Vet', vetSchema);