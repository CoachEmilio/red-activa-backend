import { Request, Response, NextFunction } from 'express';
import { WSresponse } from '../lib';
import { personService, CreatePersonContext } from '../services/person.service';
import { uploadService } from '../services/upload.service';
import { institutionService } from '../services/institution.service';
import { Gender, PersonStatus, UserRole } from '../enums';
import { buildReportedBy } from '../utils/reporter.utils';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = (req.files as Express.Multer.File[]) ?? [];

    const institution = await institutionService.findById(res.locals.institutionId);

    const ctx: CreatePersonContext = {
      userId: res.locals.userId,
      institutionId: res.locals.institutionId,
      location: institution.address,
      reportedBy: buildReportedBy(res.locals.role as UserRole, res.locals.gender as Gender, res.locals.fullName),
      assignedTo: res.locals.entity,
    };

    const person = await personService.create(req.body, ctx);

    if (files.length > 0) {
      const photoUrls = uploadService.movePersonImages(files, (person._id as any).toString());
      await personService.addPhotos((person._id as any).toString(), photoUrls);
      const updated = await personService.findById((person._id as any).toString());
      return res.status(201).send(new WSresponse(true, updated));
    }

    res.status(201).send(new WSresponse(true, person));
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
