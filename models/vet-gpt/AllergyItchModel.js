import mongoose, { Schema } from "mongoose";

const AllergyItchModel = new Schema({
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
export const AllergyItchReport = mongoose.model("AllergyItchReport", AllergyItchModel);