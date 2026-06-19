import mongoose, { Document, Schema } from 'mongoose';
import { Gender } from '../enums';

export interface IReport extends Document {
  fullName: string;
  description: string;
  picture: string;
  neighborhood: string;
  lastSeenDate?: Date;
  gender?: Gender;
  estimatedAge?: number;
  height?: number;
  weight?: number;
  deletedAt?: Date;
}

const reportSchema = new Schema<IReport>(
  {
    fullName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    picture: { type: String, required: true },
    neighborhood: { type: String, required: true, trim: true },
    lastSeenDate: { type: Date },
    gender: { type: String, enum: Object.values(Gender) },
    estimatedAge: { type: Number, min: 0, max: 120 },
    height: { type: Number, min: 0.3, max: 3.5 },
    weight: { type: Number, min: 1, max: 300 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

reportSchema.index({ description: 'text', fullName: 'text' });
reportSchema.index({ neighborhood: 1 });
reportSchema.index({ gender: 1 });
reportSchema.index({ estimatedAge: 1 });
reportSchema.index({ deletedAt: 1 });

export const ReportModel = mongoose.model<IReport>('Report', reportSchema);
