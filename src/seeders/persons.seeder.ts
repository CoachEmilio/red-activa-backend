import { PersonModel } from '../models/person.model';
import { UserModel } from '../models/user.model';
import { InstitutionModel } from '../models/institution.model';
import { SeederLog } from '../models/seeder-log.model';
import { Gender, ConsciousnessLevel, PersonStatus, UserRole } from '../enums';
import { buildReportedBy } from '../utils/reporter.utils';
import { logger } from '../lib';

const SEEDER_ID = 'persons-v5';

export const runPersonsSeeders = async (): Promise<void> => {
  try {
    const alreadyRan = await SeederLog.findById(SEEDER_ID);
    if (alreadyRan) {
      logger.info(`Seeder "${SEEDER_ID}" already ran, skipping`);
      return;
    }

    const carlos = await UserModel.findOne({ email: 'carlos.mendez@italiano.org.ar' });
    const laura = await UserModel.findOne({ email: 'laura.garcia@italiano.org.ar' });
    const italiano = await InstitutionModel.findOne({ name: 'Hospital Italiano de Buenos Aires' });

    if (!carlos || !laura || !italiano) {
      throw new Error('Required users or institution not found. Run users seeder first.');
    }

    await PersonModel.deleteMany({});

    const persons = [
      {
        estimatedAgeMin: 38,
        estimatedAgeMax: 48,
        gender: Gender.MALE,
        height: 1.78,
        weight: 80,
        distinctiveFeatures: 'Tatuaje de águila en antebrazo derecho. Cicatriz en mentón.',
        consciousnessLevel: ConsciousnessLevel.CONSCIOUS,
        address: italiano.address,
        neighborhood: italiano.neighborhood,
        geoLocation: { type: 'Point' as const, coordinates: italiano.location.coordinates },
        institution: italiano._id,
        dateOfAdmission: new Date('2026-06-03T09:15:00'),
        status: PersonStatus.UNIDENTIFIED,
        reportedBy: buildReportedBy(UserRole.DOCTOR, Gender.MALE, `${carlos.firstName} ${carlos.lastName}`),
        assignedTo: 'Policía de la Ciudad',
        createdBy: carlos._id,
        identifyingPhotos: [],
      },
      {
        estimatedAgeMin: 24,
        estimatedAgeMax: 32,
        gender: Gender.FEMALE,
        height: 1.62,
        weight: 55,
        distinctiveFeatures: 'Cabello castaño corto. Piercing en oreja izquierda. Marca de nacimiento en cuello.',
        consciousnessLevel: ConsciousnessLevel.DISORIENTED,
        address: italiano.address,
        neighborhood: italiano.neighborhood,
        geoLocation: { type: 'Point' as const, coordinates: italiano.location.coordinates },
        institution: italiano._id,
        dateOfAdmission: new Date('2026-06-03T14:45:00'),
        status: PersonStatus.POTENTIAL_MATCH,
        reportedBy: buildReportedBy(UserRole.NURSE, Gender.FEMALE, `${laura.firstName} ${laura.lastName}`),
        assignedTo: 'EAAF',
        createdBy: laura._id,
        identifyingPhotos: [],
      },
    ];

    await PersonModel.insertMany(persons);
    await SeederLog.create({ _id: SEEDER_ID });

    logger.info(`Seeder "${SEEDER_ID}" completed — ${persons.length} persons inserted`);
  } catch (err) {
    logger.error(err, `Seeder "${SEEDER_ID}" failed`);
    throw err;
  }
};
