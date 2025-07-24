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
        required: true
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
    next_due: {
        type: Date,
        required: true
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
    notes: {
        type: String,
        default: null,
        required: false
    },
    instructions: {
        type: String,
        default: null,
        required: false
    },
    prescribed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vet",
        required: true
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
        default: new Date()
    },
    end_date: {
        type: Date,
        required: false,
        default: null
    },
    reminder_time: {
        type: String,
        required: true
    },
    remind_before: {
        type: String,
        default: "15",
        required: false
    },
    reminder_methods: {
        type: [String],
        enum: ["push-notification", "in-app alert"],
        default: ["push-notification"],
        required: false
    },
    repeat_reminder: {
        type: Boolean,
        default: false,
        required: false
    }
}, { timestamps: true })
export const ScheduleReminder = mongoose.model("ScheduleReminder", scheduleReminderSchema);