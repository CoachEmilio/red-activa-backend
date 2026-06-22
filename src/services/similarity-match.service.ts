import mongoose from 'mongoose';
import { SimilarityMatchModel } from '../models/similarity-match.model';
import { SimilarityResult } from './similarity.service';

const saveMany = async (personId: string, results: SimilarityResult[]): Promise<void> => {
  if (results.length === 0) return;

  const ops = results.map((r) => ({
    updateOne: {
      filter: {
        person: new mongoose.Types.ObjectId(personId),
        report: new mongoose.Types.ObjectId(r.reportId),
      },
      update: {
        $set: {
          score: r.score,
          differences: r.differences,
          reasoning: r.reasoning,
        },
      },
      upsert: true,
    },
  }));

  await SimilarityMatchModel.bulkWrite(ops);
};

const findByPerson = async (personId: string) => {
  return SimilarityMatchModel.find({ person: new mongoose.Types.ObjectId(personId) })
    .populate('report', 'fullName description neighborhood gender estimatedAge lastSeenDate')
    .sort({ score: -1 });
};

const findByReport = async (reportId: string) => {
  return SimilarityMatchModel.find({ report: new mongoose.Types.ObjectId(reportId) })
    .populate(
      'person',
      'estimatedAgeMin estimatedAgeMax gender distinctiveFeatures status address dateOfAdmission identifyingPhotos',
    )
    .sort({ score: -1 });
};

export const similarityMatchService = { saveMany, findByPerson, findByReport };
