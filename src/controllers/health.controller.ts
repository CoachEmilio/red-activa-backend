import { Request, Response, NextFunction } from 'express';
import { WSresponse } from '../lib';
import { healthService } from '../services';

const getHealthStatus = (req: Request, res: Response, next: NextFunction) => {
  try {
    const healthStatus = healthService.getHealthStatus();
    res.send(new WSresponse(true, healthStatus));
  } catch (err) {
    next(err);
  }
};

export const healthController = { getHealthStatus };
