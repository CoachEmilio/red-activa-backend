import mongoose from 'mongoose';
import { PersonModel } from '../models/person.model';
import { CustomError } from '../lib';
import { ApiError, PersonStatus } from '../enums';
import { CreatePersonDto, UpdatePersonDto, PersonFilters } from '../types';

const INSTITUTION_FIELDS = 'name type address';
const INSTITUTION_DETAIL_FIELDS = 'name type address phone location';
const CREATED_BY_FIELDS = 'firstName lastName email';

const buildPopulatedQuery = (query: ReturnType<typeof PersonModel.find>, detail = false) =>
  query
    .populate('institution', detail ? INSTITUTION_DETAIL_FIELDS : INSTITUTION_FIELDS)
    .populate('createdBy', CREATED_BY_FIELDS);

export interface CreatePersonContext {
  userId: string;
  institutionId: string;
  location: string;
  reportedBy: string;
  assignedTo: string;
}

const create = async (dto: CreatePersonDto, ctx: CreatePersonContext, photoUrls: string[] = []) => {
  const person = await PersonModel.create({
    ...dto,
    institution: new mongoose.Types.ObjectId(ctx.institutionId),
    location: ctx.location,
    reportedBy: ctx.reportedBy,
    assignedTo: ctx.assignedTo,
    dateOfAdmission: new Date(),
    status: PersonStatus.UNIDENTIFIED,
    createdBy: new mongoose.Types.ObjectId(ctx.userId),
    identifyingPhotos: photoUrls.map((url) => ({ url, uploadedAt: new Date() })),
  });
  return person.populate([
    { path: 'institution', select: INSTITUTION_FIELDS },
    { path: 'createdBy', select: CREATED_BY_FIELDS },
  ]);
};

const findAll = async (filters: PersonFilters = {}) => {
  const query: Record<string, any> = {};
  if (filters.status) query.status = filters.status;
  if (filters.institution) query.institution = new mongoose.Types.ObjectId(filters.institution);
  if (filters.gender) query.gender = filters.gender;

  return buildPopulatedQuery(PersonModel.find(query)).sort({ createdAt: -1 });
};

const findById = async (id: string) => {
  const person = await buildPopulatedQuery(PersonModel.findById(id) as any, true);
  if (!person) throw new CustomError(ApiError.Person.notFound);
  return person;
};

const update = async (id: string, dto: UpdatePersonDto) => {
  const updated = await buildPopulatedQuery(
    PersonModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }) as any,
  );
  if (!updated) throw new CustomError(ApiError.Person.notFound);
  return updated;
};

const addPhotos = async (id: string, photoUrls: string[]) => {
  const photos = photoUrls.map((url) => ({ url, uploadedAt: new Date() }));
  const person = await PersonModel.findByIdAndUpdate(
    id,
    { $push: { identifyingPhotos: { $each: photos } } },
    { new: true },
  );
  if (!person) throw new CustomError(ApiError.Person.notFound);
  return person;
};

const remove = async (id: string) => {
  const deleted = await PersonModel.findByIdAndDelete(id);
  if (!deleted) throw new CustomError(ApiError.Person.notFound);
};

export const personService = { create, findAll, findById, update, addPhotos, remove };
