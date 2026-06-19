import mongoose, { Document, Schema } from 'mongoose';
import { Gender, ConsciousnessLevel, PersonStatus } from '../enums';

export interface IIdentifyingPhoto {
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface IPerson extends Document {
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  gender: Gender;
  height?: number;
  weight?: number;
  distinctiveFeatures: string;
  consciousnessLevel: ConsciousnessLevel;
  address: string;
  neighborhood: string;
  geoLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  institution: mongoose.Types.ObjectId;
  dateOfAdmission: Date;
  status: PersonStatus;
  reportedBy: string;
  assignedTo?: string;
  identifyingPhotos?: IIdentifyingPhoto[];
  createdBy: mongoose.Types.ObjectId;
  deletedAt?: Date;
}

const identifyingPhotoSchema = new Schema<IIdentifyingPhoto>(
  {
    url: { type: String, required: true },
    caption: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const personSchema = new Schema<IPerson>(
  {
    estimatedAgeMin: { type: Number, required: true, min: 0, max: 120 },
    estimatedAgeMax: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, required: true, enum: Object.values(Gender) },
    height: { type: Number, min: 0.3, max: 3.5 },
    weight: { type: Number, min: 1, max: 300 },
    distinctiveFeatures: { type: String, required: true, trim: true },
    consciousnessLevel: { type: String, required: true, enum: Object.values(ConsciousnessLevel) },
    address: { type: String, required: true, trim: true },
    neighborhood: { type: String, required: true, trim: true },
    geoLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: { type: [Number], required: true },
    },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    dateOfAdmission: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(PersonStatus),
      default: PersonStatus.UNIDENTIFIED,
    },
    reportedBy: { type: String, required: true, trim: true },
    assignedTo: { type: String, trim: true },
    identifyingPhotos: { type: [identifyingPhotoSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

personSchema.index({ geoLocation: '2dsphere' });
personSchema.index({ neighborhood: 1 });
personSchema.index({ status: 1 });
personSchema.index({ gender: 1 });
personSchema.index({ institution: 1, status: 1 });
personSchema.index({ deletedAt: 1 });

export const PersonModel = mongoose.model<IPerson>('Person', personSchema);
