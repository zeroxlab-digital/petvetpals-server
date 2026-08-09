import { Schema, model, InferSchemaType } from 'mongoose';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minLength: [6, 'Password must be at least 6 characters!'],
        required: true
    },
    googleId: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
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
        enum: ['basic', 'premium'],
        default: "basic"
    },
    timezone: {
        type: String,
        default: "UTC",
    }
}, { timestamps: true });

type IUser = InferSchemaType<typeof userSchema>

export const User = model<IUser>('User', userSchema);