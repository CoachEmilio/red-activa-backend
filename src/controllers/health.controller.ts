import { Request, Response, NextFunction } from 'express';
import { WSresponse } from '../lib';
import { healthService } from '../services';
import { a } from '../services/test';

const getHealthStatus = (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthStatus = healthService.getHealthStatus();
    res.send(new WSresponse(true, healthStatus));
  } catch (err) {
    next(err);
  }
};

const test = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await a.compararDescripciones(
      'Mujer joven con campera de jena, remera blanca y pantalon negro. Se logra ver un tatuaje en forma del indio tomando merca en el pie',
      'Mujer joven de 25 años, delgada, cabello largo lacio negro. Campera de jean corta, remera blanca, pantalón negro. Tatuaje de mariposa en el tobillo derecho y múltiples aros en las orejas.',
    );
    res.send(new WSresponse(true, resultado));
  } catch (err) {
    next(err);
  }
};

export const healthController = { getHealthStatus, test };
