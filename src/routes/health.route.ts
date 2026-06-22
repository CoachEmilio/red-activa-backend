import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router: Router = Router();

router.route('/').get(healthController.getHealthStatus);

export const healthRouter: Router = router;
