import { Router, Request, Response, NextFunction } from 'express';
import { jwtMiddleware } from '../middlewares/jwt.middleware';
import { analyticsService } from '../services/analytics.service';
import { WSresponse } from '../lib';

const router: Router = Router();

router.use(jwtMiddleware);

router.get('/by-neighborhood', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.byNeighborhood();
    res.send(new WSresponse(true, data));
  } catch (err) {
    next(err);
  }
});

router.get('/heatmap', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.heatmap();
    res.send(new WSresponse(true, data));
  } catch (err) {
    next(err);
  }
});

router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.summary();
    res.send(new WSresponse(true, data));
  } catch (err) {
    next(err);
  }
});

export const analyticsRouter: Router = router;
