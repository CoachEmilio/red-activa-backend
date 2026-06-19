import mongoose from 'mongoose';
import { SimilarityMatchModel } from '../models/similarity-match.model';
import { SimilarityResult } from './similarity.service';

const SCORE_THRESHOLD = 0.5;

const saveMany = async (personId: string, results: SimilarityResult[]): Promise<void> => {
  const above = results.filter((r) => r.score >= SCORE_THRESHOLD);
  if (above.length === 0) return;

  const ops = above.map((r) => ({
    updateOne: {
      filter: {
        person: new mongoose.Types.ObjectId(personId),
        report: new mongoose.Types.ObjectId(r.reportId),
      },
      update: {
        $set: {
          score: r.score,
          breakdown: r.breakdown,
          matches: r.matches,
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
    .populate('person', 'estimatedAge gender distinctiveFeatures status address dateOfAdmission identifyingPhotos')
    .sort({ score: -1 });
};

export const similarityMatchService = { saveMany, findByPerson, findByReport };
