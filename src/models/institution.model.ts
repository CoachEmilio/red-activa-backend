import mongoose, { Document, Schema } from 'mongoose';
import { InstitutionType } from '../enums';

export interface IInstitution extends Document {
  name: string;
  type: InstitutionType;
  address: string;
  phone?: string;
  neighborhood: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  deletedAt?: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: Object.values(InstitutionType) },
    address: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    neighborhood: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: { type: [Number], required: true },
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

institutionSchema.index({ location: '2dsphere' });
institutionSchema.index({ neighborhood: 1 });
institutionSchema.index({ deletedAt: 1 });

export const InstitutionModel = mongoose.model<IInstitution>('Institution', institutionSchema);
