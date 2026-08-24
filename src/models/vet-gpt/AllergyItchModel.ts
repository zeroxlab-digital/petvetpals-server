import { InferSchemaType, Schema, model } from 'mongoose';

const AllergyItchSchema = new Schema({
    pet: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    episode: {
        length: {
            type: String,
            required: true
        },
        severity: {
            type: Number,
            required: true
        },
        affected_areas: {
            type: [String],
            required: true
        },
        visible_signs: {
            type: [String],
        }
    }
}, { timestamps: true });

type IAllergyReport = InferSchemaType<typeof AllergyItchSchema>;

export const AllergyItchReport = model<IAllergyReport>('AllergyItchReport', AllergyItchSchema);