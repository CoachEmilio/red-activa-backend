import { InstitutionModel } from '../models/institution.model';
import { InstitutionType } from '../enums';
import { logger } from '../lib';
import { SeederLog } from '../models/seeder-log.model';

const SEEDER_ID = 'institutions-v2';

const institutions = [
  {
    name: 'Hospital Italiano de Buenos Aires',
    type: InstitutionType.HOSPITAL,
    address: 'Tte. Gral. Juan D. Perón 4190, Almagro',
    neighborhood: 'Almagro',
    location: { type: 'Point' as const, coordinates: [-58.4217, -34.6039] },
  },
  {
    name: 'Hospital Alemán',
    type: InstitutionType.HOSPITAL,
    address: 'Av. Pueyrredón 1640, Recoleta',
    neighborhood: 'Recoleta',
    location: { type: 'Point' as const, coordinates: [-58.3993, -34.5904] },
  },
  {
    name: 'Hospital Británico de Buenos Aires',
    type: InstitutionType.HOSPITAL,
    address: 'Perdriel 74, Barracas',
    neighborhood: 'Barracas',
    location: { type: 'Point' as const, coordinates: [-58.3735, -34.6398] },
  },
  {
    name: 'Hospital de Clínicas José de San Martín (UBA)',
    type: InstitutionType.HOSPITAL,
    address: 'Av. Córdoba 2351, Balvanera',
    neighborhood: 'Balvanera',
    location: { type: 'Point' as const, coordinates: [-58.3978, -34.5983] },
  },
  {
    name: 'Sanatorio Güemes',
    type: InstitutionType.SANATORIUM,
    address: 'Acuña de Figueroa 1240, Almagro',
    neighborhood: 'Almagro',
    location: { type: 'Point' as const, coordinates: [-58.4208, -34.6034] },
  },
  {
    name: 'Sanatorio Otamendi',
    type: InstitutionType.SANATORIUM,
    address: 'Azcuénaga 870, Recoleta',
    neighborhood: 'Recoleta',
    location: { type: 'Point' as const, coordinates: [-58.3972, -34.5997] },
  },
  {
    name: 'Sanatorio Mater Dei',
    type: InstitutionType.SANATORIUM,
    address: 'San Martín de Tours 2952, Palermo',
    neighborhood: 'Palermo',
    location: { type: 'Point' as const, coordinates: [-58.4010, -34.5818] },
  },
  {
    name: 'Fundación Favaloro',
    type: InstitutionType.HOSPITAL,
    address: 'Av. Belgrano 1746, Monserrat',
    neighborhood: 'Monserrat',
    location: { type: 'Point' as const, coordinates: [-58.3929, -34.6128] },
  },
  {
    name: 'Clínica Bazterrica',
    type: InstitutionType.CLINIC,
    address: 'Billinghurst 2072, Palermo',
    neighborhood: 'Palermo',
    location: { type: 'Point' as const, coordinates: [-58.4116, -34.5881] },
  },
  {
    name: 'Clínica del Sol',
    type: InstitutionType.CLINIC,
    address: 'Av. Coronel Díaz 2211, Palermo',
    neighborhood: 'Palermo',
    location: { type: 'Point' as const, coordinates: [-58.4098, -34.5871] },
  },
  {
    name: 'Policía de la Ciudad',
    type: InstitutionType.MANAGEMENT,
    address: 'Tucumán 1560, San Nicolás',
    neighborhood: 'San Nicolas',
    location: { type: 'Point' as const, coordinates: [-58.3877, -34.6027] },
  },
  {
    name: 'Ministerio Público Fiscal CABA',
    type: InstitutionType.MANAGEMENT,
    address: 'Bartolomé Mitre 1735, San Nicolás',
    neighborhood: 'San Nicolas',
    location: { type: 'Point' as const, coordinates: [-58.3928, -34.6047] },
  },
  {
    name: 'Ministerio Público Fiscal - Procuración General de la Nación',
    type: InstitutionType.MANAGEMENT,
    address: 'Tucumán 966, San Nicolás',
    neighborhood: 'San Nicolas',
    location: { type: 'Point' as const, coordinates: [-58.3748, -34.6018] },
  },
  {
    name: 'Sistema Federal de Búsqueda de Personas Desaparecidas (SIFEBU)',
    type: InstitutionType.MANAGEMENT,
    address: 'Gelly 5736, Palermo',
    neighborhood: 'Palermo',
    location: { type: 'Point' as const, coordinates: [-58.3816, -34.6037] },
  },
];

export const runSeeders = async (): Promise<void> => {
  try {
    const alreadyRan = await SeederLog.findById(SEEDER_ID);
    if (alreadyRan) {
      logger.info(`Seeder "${SEEDER_ID}" already ran, skipping`);
      return;
    }

    await InstitutionModel.deleteMany({});
    await InstitutionModel.insertMany(institutions);
    await SeederLog.create({ _id: SEEDER_ID });

    logger.info(`Seeder "${SEEDER_ID}" completed — ${institutions.length} institutions inserted`);
  } catch (err) {
    logger.error(err, `Seeder "${SEEDER_ID}" failed`);
    throw err;
  }
};
