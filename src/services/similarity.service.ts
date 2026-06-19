import { logger } from '../lib';
import { Gender } from '../enums';

export interface SimilarityCandidate {
  reportId: string;
  description: string;
  gender?: Gender;
  estimatedAge?: number;
}

export interface PersonAgeRange {
  min: number;
  max: number;
}

export interface SimilarityResult {
  reportId: string;
  score: number;
  breakdown: {
    text: number;
    gender: number | null;
    age: number | null;
  };
  matches: string[];
}

const STOP_WORDS = new Set([
  'de', 'la', 'el', 'en', 'un', 'una', 'con', 'por', 'para', 'que', 'del',
  'los', 'las', 'al', 'se', 'su', 'y', 'a', 'o', 'es', 'no', 'le', 'lo',
  'me', 'mi', 'si', 'ya', 'mas', 'pero', 'sin', 'sobre', 'entre', 'como',
  'muy', 'bien', 'fue', 'son', 'has', 'hay', 'sus', 'este', 'esta', 'esto',
]);

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[Ì€-Í¯]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

const tokenize = (text: string): string[] =>
  normalize(text)
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

const buildFreqVector = (tokens: string[]): Map<string, number> => {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return freq;
};

const cosineSimilarity = (a: Map<string, number>, b: Map<string, number>): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [term, countA] of a) {
    const countB = b.get(term) ?? 0;
    dot += countA * countB;
    normA += countA * countA;
  }
  for (const [, countB] of b) normB += countB * countB;

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const genderScore = (personGender: Gender, reportGender?: Gender): number | null => {
  if (!reportGender) return null;
  return personGender === reportGender ? 1 : 0;
};

const ageScore = (personAge: PersonAgeRange, reportAge?: number): number | null => {
  if (reportAge === undefined || reportAge === null) return null;
  if (reportAge >= personAge.min && reportAge <= personAge.max) return 1;
  const dist = reportAge < personAge.min ? personAge.min - reportAge : reportAge - personAge.max;
  return Math.max(0, 1 - dist / 20);
};

const computeWeights = (hasGender: boolean, hasAge: boolean) => {
  if (hasGender && hasAge) return { text: 0.6, gender: 0.2, age: 0.2 };
  if (hasGender) return { text: 0.7, gender: 0.3, age: 0 };
  if (hasAge) return { text: 0.7, gender: 0, age: 0.3 };
  return { text: 1.0, gender: 0, age: 0 };
};

const findMatchingTerms = (queryTokens: string[], candidateTokens: string[]): string[] => {
  const candidateSet = new Set(candidateTokens);
  return [...new Set(queryTokens.filter((t) => candidateSet.has(t)))];
};

const compare = (
  personFeatures: string,
  personGender: Gender,
  personAge: PersonAgeRange,
  candidates: SimilarityCandidate[],
): SimilarityResult[] => {
  if (candidates.length === 0) return [];

  const queryTokens = tokenize(personFeatures);
  const queryVec = buildFreqVector(queryTokens);

  const results: SimilarityResult[] = candidates
    .map((c) => {
      const gScore = genderScore(personGender, c.gender);
      const aScore = ageScore(personAge, c.estimatedAge);
      const weights = computeWeights(gScore !== null, aScore !== null);

      const candidateTokens = tokenize(c.description);
      const candidateVec = buildFreqVector(candidateTokens);
      const tScore = cosineSimilarity(queryVec, candidateVec);

      const score =
        tScore * weights.text +
        (gScore ?? 0) * weights.gender +
        (aScore ?? 0) * weights.age;

      const matches = findMatchingTerms(queryTokens, candidateTokens);

      return {
        reportId: c.reportId,
        score: Math.round(score * 100) / 100,
        breakdown: {
          text: Math.round(tScore * 100) / 100,
          gender: gScore !== null ? Math.round(gScore * 100) / 100 : null,
          age: aScore !== null ? Math.round(aScore * 100) / 100 : null,
        },
        matches,
      };
    })
    .sort((a, b) => b.score - a.score);

  logger.info({ candidates: candidates.length, results: results.length }, 'Composite similarity check');

  return results;
};

export const similarityService = { compare };
