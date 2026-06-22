import { logger } from '../lib';
import { googleAI } from '../utils';
import { IPerson } from '../models/person.model';
import { IReport, ReportModel } from '../models/report.model';
import { similarityMatchService } from './similarity-match.service';

interface SimilarityCandidate {
  reportId: string;
  description: string;
}

export interface SimilarityResult {
  reportId: string;
  score: number;
  differences: string[];
  reasoning: string;
}

const SCORE_THRESHOLD = 60;
const CANDIDATES_LIMIT = 5;

const compare = async (description: string, candidates: SimilarityCandidate[]): Promise<SimilarityResult[]> => {
  if (candidates.length === 0) return [];

  const comparisons = await Promise.all(
    candidates.map(async (candidate) => {
      const { score, differences, reasoning } = await googleAI.compararDescripciones(
        description,
        candidate.description,
      );
      return { reportId: candidate.reportId, score, differences, reasoning };
    }),
  );

  const results = comparisons.filter((r) => r.score > SCORE_THRESHOLD).sort((a, b) => b.score - a.score);

  logger.info({ candidates: candidates.length, results: results.length }, 'AI similarity check');

  return results;
};

const findAndSaveMatches = async (person: IPerson): Promise<void> => {
  const personId = (person._id as any).toString();

  try {
    const reports: IReport[] = await ReportModel.find(
      {
        $text: { $search: person.distinctiveFeatures },
        deletedAt: null,
        gender: person.gender,
        neighborhood: person.neighborhood,
        estimatedAge: { $gte: person.estimatedAgeMin, $lte: person.estimatedAgeMax },
      },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(CANDIDATES_LIMIT);

    if (reports.length === 0) return;

    const candidates: SimilarityCandidate[] = reports.map((r) => ({
      reportId: (r._id as any).toString(),
      description: r.description,
    }));

    const results = await compare(person.distinctiveFeatures, candidates);
    await similarityMatchService.saveMany(personId, results);

    logger.info({ personId, candidates: candidates.length, saved: results.length }, 'Similarity check completed');
  } catch (err) {
    logger.error(err, 'Background similarity check failed');
  }
};

export const similarityService = { compare, findAndSaveMatches };
