import { InferSchemaType, Schema, model } from 'mongoose';

const SymptomReportSchema = new Schema(
  {
    petId: {
      type: Schema.Types.ObjectId,
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

type ISymptom = InferSchemaType<typeof SymptomReportSchema>;

export const SymptomReport = model<ISymptom>('SymptomReport', SymptomReportSchema);