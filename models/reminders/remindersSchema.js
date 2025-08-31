import mongoose, { Schema } from "mongoose";

const reminderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reminder_type: {
        type: String,
        enum: {
            values: ["Vaccination", "Vet Appointment", "Exercise", "Hydration", "Other"],
            message: `{VALUE} is not supported`
        },
        required: [true, "Reminder type is required"],
    },
    frequency: {
        type: String,
        enum: {
            values: ["one_time", "daily_once", "daily_twice", "weekly", "bi-weekly", "monthly"],
            message: `{VALUE} is not supported`
        },
        required: true
    },
    reminder_date: {
        type: Date,
        required: false,
        default: null
    },
    starting_date: {
        type: Date,
        required: false,
        default: null
    },
    end_date: {
        type: Date,
        required: false,
        default: null
    },
    reminder_times: [
        {
            time: { type: String, required: true },
            reminde_before: {
                type: String,
                enum: ['0', '5', '10', '15', '30', '60'],
                default: '10'
            },
            last_reset: { type: Date, default: null },
            is_given: { type: Boolean, default: false },
            skipped: { type: Boolean, default: false }
        }
    ],
    notes: {
        type: String,
        required: false,
        default: null
    },
    reminder_methods: {
        type: [String],
        enum: ["push", "in-app"],
        required: false,
        default: ["push"]
    },
    repeat_reminder: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Reminder = mongoose.model("Reminder", reminderSchema);