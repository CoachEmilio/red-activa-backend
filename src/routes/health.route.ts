import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router: Router = Router();

router.route('/').get(healthController.getHealthStatus);
router.route('/test').get(healthController.test);

export const healthRouter: Router = router;
