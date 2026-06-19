import { ReportModel } from '../models/report.model';
import { SeederLog } from '../models/seeder-log.model';
import { Gender } from '../enums';
import { logger } from '../lib';

const SEEDER_ID = 'reports-v2';

export const runReportsSeeders = async (): Promise<void> => {
  try {
    const alreadyRan = await SeederLog.findById(SEEDER_ID);
    if (alreadyRan) {
      logger.info(`Seeder "${SEEDER_ID}" already ran, skipping`);
      return;
    }

    await ReportModel.deleteMany({});

    const reports = [
      {
        fullName: 'Roberto Ángel Ferreyra',
        description: 'Hombre de aproximadamente 45 años, contextura robusta, cabello canoso corto. Vestía camisa a cuadros azul y blanca, pantalón de jean oscuro. Tatuaje de una cruz en el antebrazo izquierdo y cicatriz en la ceja derecha. Usa anteojos de armazón negra.',
        picture: '/uploads/reports/placeholder.jpg',
        neighborhood: 'Almagro',
        lastSeenDate: new Date('2026-05-28T18:30:00'),
        gender: Gender.MALE,
        estimatedAge: 45,
        height: 1.76,
        weight: 88,
      },
      {
        fullName: 'Camila Inés Suárez',
        description: 'Mujer joven de 25 años, delgada, cabello largo lacio negro. Campera de jean corta, remera blanca, pantalón negro. Tatuaje de mariposa en el tobillo derecho y múltiples aros en las orejas.',
        picture: '/uploads/reports/placeholder.jpg',
        neighborhood: 'Palermo',
        lastSeenDate: new Date('2026-06-01T21:00:00'),
        gender: Gender.FEMALE,
        estimatedAge: 25,
        height: 1.63,
        weight: 54,
      },
      {
        fullName: 'Néstor Fabián Quiroga',
        description: 'Hombre adulto mayor de unos 70 años. Contextura delgada, tez blanca. Padece deterioro cognitivo. Vestía pijama a rayas celeste y blanco. Descalzo. Manchas de vitíligo en ambas manos y cuello. Calvo con franja de cabello blanco en los costados.',
        picture: '/uploads/reports/placeholder.jpg',
        neighborhood: 'Recoleta',
        lastSeenDate: new Date('2026-06-05T07:15:00'),
        gender: Gender.MALE,
        estimatedAge: 70,
      },
      {
        fullName: 'Valentina Rocío Medina',
        description: 'Adolescente de 17 años, contextura media, cabello castaño oscuro en colita. Guardapolvo blanco, pollera gris y mochila verde. Frenillos metálicos. Marca de nacimiento marrón en la mejilla izquierda. Zapatillas de lona negras.',
        picture: '/uploads/reports/placeholder.jpg',
        neighborhood: 'Balvanera',
        lastSeenDate: new Date('2026-06-03T13:45:00'),
        gender: Gender.FEMALE,
        estimatedAge: 17,
        height: 1.60,
      },
      {
        fullName: 'Marcelo Darío Fuentes',
        description: 'Hombre de 40 años, contextura atlética, cabello negro corto. Tatuaje de águila en el antebrazo derecho. Cicatriz en el mentón. Vestía remera deportiva gris y pantalón de jean. Orientado. Salió a correr y no regresó.',
        picture: '/uploads/reports/placeholder.jpg',
        neighborhood: 'Almagro',
        lastSeenDate: new Date('2026-06-02T06:30:00'),
        gender: Gender.MALE,
        estimatedAge: 40,
        height: 1.79,
        weight: 82,
      },
      {
        fullName: 'Luciana Beatriz Torres',
        description: 'Mujer de unos 28 años, cabello castaño corto. Piercing en oreja izquierda. Marca de nacimiento en el cuello lado derecho. Vestía ropa informal. Desorientada según testigos.',
        picture: '/uploads/reports/placeholder.jpg',
        neighborhood: 'Almagro',
        lastSeenDate: new Date('2026-06-03T16:00:00'),
        gender: Gender.FEMALE,
        estimatedAge: 28,
        height: 1.62,
        weight: 56,
      },
    ];

    await ReportModel.insertMany(reports);
    await SeederLog.create({ _id: SEEDER_ID });

    logger.info(`Seeder "${SEEDER_ID}" completed — ${reports.length} reports inserted`);
  } catch (err) {
    logger.error(err, `Seeder "${SEEDER_ID}" failed`);
    throw err;
  }
};
