import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Medical History Schema
const medicalHistorySchema = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    vetOrClinic: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: new Date(),
        required: true
    },
    file: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    }
}, { timestamps: true });
export const MedicalHistory = model('MedicalHistory', medicalHistorySchema);

// Vaccination Schema
const vaccinationSchema = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Vet',
        required: true
    },
    vaccine: {
        type: String,
        required: true
    },
    date_given: {
        type: Date,
        default: new Date(),
        required: true
    },
    next_due: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['up-to-date', 'due', 'overdue'],
        default: 'up-to-date',
        required: true
    },
    notes: {
        type: String,
        default: null
    }
}, { timestamps: true });
export const Vaccination = model('Vaccination', vaccinationSchema);

// Allergy Condition Schema
const allergyConditionSchema = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    type: {
        type: String,
        enum: ['allergy', 'condition'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'mild',
        required: true
    },
    diagnosedDate: {
        type: Date,
        default: new Date(),
        required: true
    },
    description: {
        type: String,
        default: null
    }
}, { timestamps: true });
export const AllergyCondition = model('AllergyCondition', allergyConditionSchema);