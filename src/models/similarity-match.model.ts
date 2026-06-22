import mongoose, { Document, Schema } from 'mongoose';

export interface ISimilarityMatch extends Document {
  person: mongoose.Types.ObjectId;
  report: mongoose.Types.ObjectId;
  score: number;
  differences: string[];
  reasoning: string;
}

const similarityMatchSchema = new Schema<ISimilarityMatch>(
  {
    person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
    report: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    score: { type: Number, required: true },
    differences: { type: [String], default: [] },
    reasoning: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false },
);

similarityMatchSchema.index({ person: 1, report: 1 }, { unique: true });
similarityMatchSchema.index({ person: 1, score: -1 });
similarityMatchSchema.index({ report: 1, score: -1 });

export const SimilarityMatchModel = mongoose.model<ISimilarityMatch>('SimilarityMatch', similarityMatchSchema);
