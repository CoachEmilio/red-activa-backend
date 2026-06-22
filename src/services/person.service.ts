import mongoose from 'mongoose';
import { PersonModel } from '../models/person.model';
import { CustomError } from '../lib';
import { ApiError, PersonStatus } from '../enums';
import { CreatePersonDto, UpdatePersonDto, PersonFilters } from '../types';

const INSTITUTION_FIELDS = 'name type address neighborhood';
const INSTITUTION_DETAIL_FIELDS = 'name type address phone neighborhood location';
const CREATED_BY_FIELDS = 'firstName lastName email';

const buildPopulatedQuery = (query: ReturnType<typeof PersonModel.find>, detail = false) =>
  query
    .populate('institution', detail ? INSTITUTION_DETAIL_FIELDS : INSTITUTION_FIELDS)
    .populate('createdBy', CREATED_BY_FIELDS);

export interface CreatePersonContext {
  userId: string;
  institutionId: string;
  address: string;
  neighborhood: string;
  geoLocation: [number, number];
  reportedBy: string;
  assignedTo: string;
}

const create = async (dto: CreatePersonDto, ctx: CreatePersonContext, photoUrls: string[] = []) => {
  const person = await PersonModel.create({
    ...dto,
    institution: new mongoose.Types.ObjectId(ctx.institutionId),
    address: ctx.address,
    neighborhood: ctx.neighborhood,
    geoLocation: { type: 'Point', coordinates: ctx.geoLocation },
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
  const query: Record<string, any> = { deletedAt: null };
  if (filters.status) query.status = filters.status;
  if (filters.institution) query.institution = new mongoose.Types.ObjectId(filters.institution);
  if (filters.gender) query.gender = filters.gender;

  return buildPopulatedQuery(PersonModel.find(query)).sort({ createdAt: -1 });
};

const findById = async (id: string) => {
  const person = await buildPopulatedQuery(
    PersonModel.findOne({ _id: id, deletedAt: null }) as any,
    true,
  );
  if (!person) throw new CustomError(ApiError.Person.notFound);
  return person;
};

const update = async (id: string, dto: UpdatePersonDto) => {
  const updated = await buildPopulatedQuery(
    PersonModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      dto,
      { new: true, runValidators: true },
    ) as any,
  );
  if (!updated) throw new CustomError(ApiError.Person.notFound);
  return updated;
};

const addPhotos = async (id: string, photoUrls: string[]) => {
  const photos = photoUrls.map((url) => ({ url, uploadedAt: new Date() }));
  const person = await PersonModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { $push: { identifyingPhotos: { $each: photos } } },
    { new: true },
  );
  if (!person) throw new CustomError(ApiError.Person.notFound);
  return person;
};

export const personService = { create, findAll, findById, update, addPhotos };
