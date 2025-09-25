import mongoose from "mongoose";

const medicationSchema = mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    medication: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: false
    },
    frequency: {
        type: String,
        required: true
    },
    remaining: {
        type: Number,
        required: true,
        default: 0
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: false
    },
    is_ongoing: {
        type: Boolean,
        default: true,
        required: true
    },
    reason: {
        type: String,
        default: null,
        required: false
    },
    time_of_day: {
        type: String,
        default: null,
        required: false
    },
    next_due: {
        type: Date,
        default: null,
        required: false
    },
    instructions: {
        type: String,
        default: null,
        required: false
    },
    prescribed_by: {
        type: String,
        required: false
    }
}, { timestamps: true })

export const Medication = mongoose.model("Medication", medicationSchema);

// Schedule & Reminders
const scheduleReminderSchema = mongoose.Schema({
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medication",
        required: true
    },
    frequency: {
        type: String,
        required: false
    },
    starting_date: {
        type: Date,
        required: true,
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
            remind_before: {
                type: String,
                enum: ['0', '5', '10', '15', '30', '60'],
                default: '10'
            },
            last_reset: { type: Date, default: null },
            is_given: { type: Boolean, default: false },
            skipped: { type: Boolean, default: false }
        }
    ],
    reminder_methods: {
        type: [String],
        enum: ["push", "in-app"],
        required: false
    },
    repeat_reminder: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const ScheduleReminder = mongoose.model("ScheduleReminder", scheduleReminderSchema);
