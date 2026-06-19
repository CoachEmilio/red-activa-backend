import { Router, Request, Response, NextFunction } from 'express';
import { jwtMiddleware } from '../middlewares/jwt.middleware';
import { reportService } from '../services/report.service';
import { similarityMatchService } from '../services/similarity-match.service';
import { WSresponse } from '../lib';

const router: Router = Router();

router.use(jwtMiddleware);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await reportService.findAll();
    res.send(new WSresponse(true, reports));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.findById(req.params.id);
    res.send(new WSresponse(true, report));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/similarities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await similarityMatchService.findByReport(req.params.id);
    res.send(new WSresponse(true, matches));
  } catch (err) {
    next(err);
  }
});

export const reportRouter: Router = router;
