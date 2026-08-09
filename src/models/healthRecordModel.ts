import { Schema, model, InferSchemaType } from 'mongoose';

// Medical History Schema
const medicalHistorySchema = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    vetOrClinic: {
        type: String,
        default: null
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    treatment: {
        type: String,
        default: null
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

type IMedicalHistory = InferSchemaType<typeof medicalHistorySchema>;
export const MedicalHistory = model<IMedicalHistory>('MedicalHistory', medicalHistorySchema);


// Vaccination Schema
const vaccinationSchema = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    provider: {
        type: String,
        default: null
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
        default: null
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
type IVaccination = InferSchemaType<typeof vaccinationSchema>;
export const Vaccination = model<IVaccination>('Vaccination', vaccinationSchema);

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
        required: true,
        trim: true
    },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        default: 'mild',
        required: true
    },
    diagnosedDate: {
        type: Date,
        default: null
    },
    description: {
        type: String,
        default: null
    }
}, { timestamps: true });

type IAllergyCondition = InferSchemaType<typeof allergyConditionSchema>
export const AllergyCondition = model<IAllergyCondition>('AllergyCondition', allergyConditionSchema);