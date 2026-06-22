import { NeighborhoodModel } from '../models/neighborhood.model';

const findByPoint = async (longitude: number, latitude: number): Promise<string | null> => {
  const neighborhood = await NeighborhoodModel.findOne({
    boundary: {
      $geoIntersects: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
      },
    },
  });
  return neighborhood?.name ?? null;
};

export const neighborhoodService = { findByPoint };
