import mongoose from 'mongoose';

const SymptomReportSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    symptoms: [
      {
        bodyPart: String,
        symptoms: [String],
      },
    ],
    conditions: [
      {
        name: String,
        description: String,
        severity: String,
        matchPercentage: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const SymptomReport = mongoose.model('SymptomReport', SymptomReportSchema);