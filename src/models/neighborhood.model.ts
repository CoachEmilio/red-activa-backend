import mongoose, { Document, Schema } from 'mongoose';

export interface INeighborhood extends Document {
  name: string;
  comuna: number;
  boundary: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  centroid: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const neighborhoodSchema = new Schema<INeighborhood>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    comuna: { type: Number, required: true },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        required: true,
      },
      coordinates: { type: [[[Number]]], required: true },
    },
    centroid: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true, versionKey: false },
);

neighborhoodSchema.index({ boundary: '2dsphere' });

export const NeighborhoodModel = mongoose.model<INeighborhood>('Neighborhood', neighborhoodSchema);
