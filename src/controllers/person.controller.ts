import { Request, Response, NextFunction } from 'express';
import { WSresponse, logger } from '../lib';
import { personService, CreatePersonContext } from '../services/person.service';
import { uploadService } from '../services/upload.service';
import { institutionService } from '../services/institution.service';
import { similarityService, SimilarityCandidate } from '../services/similarity.service';
import { similarityMatchService } from '../services/similarity-match.service';
import { Gender, PersonStatus, UserRole } from '../enums';
import { buildReportedBy } from '../utils/reporter.utils';
import { IPerson } from '../models/person.model';
import { IReport, ReportModel } from '../models/report.model';

const runSimilarityInBackground = (newPerson: IPerson): void => {
  const personId = (newPerson._id as any).toString();

  // Use $text pre-filter to narrow candidates to reports with matching terms,
  // then fall back to all reports if the person features produce no $text hits.
  const textQuery = { $text: { $search: newPerson.distinctiveFeatures }, deletedAt: null };
  const fallbackQuery = { deletedAt: null };

  ReportModel.find(textQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .then(async (reports) => {
      const source = reports.length > 0 ? reports : await ReportModel.find(fallbackQuery);
      if (source.length === 0) return;

      const candidates: SimilarityCandidate[] = (source as IReport[]).map((r) => ({
        reportId: (r._id as any).toString(),
        description: r.description,
        gender: r.gender,
        estimatedAge: r.estimatedAge,
      }));

      const results = similarityService.compare(
        newPerson.distinctiveFeatures,
        newPerson.gender,
        { min: newPerson.estimatedAgeMin, max: newPerson.estimatedAgeMax },
        candidates,
      );
      await similarityMatchService.saveMany(personId, results);

      logger.info(
        { personId, candidates: candidates.length, saved: results.length, textFiltered: reports.length > 0 },
        'Similarity check completed',
      );
    })
    .catch((err) => logger.error(err, 'Background similarity check failed'));
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];

    const institution = await institutionService.findById(res.locals.institutionId);

    const [lon, lat] = institution.location.coordinates;
    const nearestManagement = await institutionService.findNearestManagement(lon, lat);

    const ctx: CreatePersonContext = {
      userId: res.locals.userId,
      institutionId: res.locals.institutionId,
      address: institution.address,
      neighborhood: institution.neighborhood,
      geoLocation: institution.location.coordinates,
      reportedBy: buildReportedBy(res.locals.role as UserRole, res.locals.gender as Gender, res.locals.fullName),
      assignedTo: nearestManagement?.name ?? res.locals.entity,
    };

    const person = await personService.create(req.body, ctx);

    if (files.length > 0) {
      const photoUrls = uploadService.movePersonImages(files, (person._id as any).toString());
      await personService.addPhotos((person._id as any).toString(), photoUrls);
      const updated = await personService.findById((person._id as any).toString());
      res.status(201).send(new WSresponse(true, updated));
      runSimilarityInBackground(person as unknown as IPerson);
      return;
    }

    res.status(201).send(new WSresponse(true, person));
    runSimilarityInBackground(person as unknown as IPerson);
  } catch (err) {
    next(err);
  }
};

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, institution, gender } = req.query as Record<string, string>;
    const persons = await personService.findAll({
      status: Object.values(PersonStatus).includes(status as PersonStatus) ? (status as PersonStatus) : undefined,
      institution: institution || undefined,
      gender: Object.values(Gender).includes(gender as Gender) ? (gender as Gender) : undefined,
    });
    res.send(new WSresponse(true, persons));
  } catch (err) {
    next(err);
  }
};

const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const person = await personService.findById(req.params.id);
    res.send(new WSresponse(true, person));
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const person = await personService.update(req.params.id, req.body);
    res.send(new WSresponse(true, person));
  } catch (err) {
    next(err);
  }
};

const addPhotos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    const photoUrls = uploadService.movePersonImages(files, req.params.id);
    const person = await personService.addPhotos(req.params.id, photoUrls);
    res.send(new WSresponse(true, person));
  } catch (err) {
    next(err);
  }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await personService.remove(req.params.id);
    res.send(new WSresponse(true, null));
  } catch (err) {
    next(err);
  }
};

export const personController = { create, findAll, findById, update, addPhotos, remove };
