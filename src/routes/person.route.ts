import { Router, Request, Response, NextFunction } from 'express';
import { personController } from '../controllers/person.controller';
import { jwtMiddleware } from '../middlewares/jwt.middleware';
import { uploadPersonImages } from '../config/multer.config';
import { similarityMatchService } from '../services/similarity-match.service';
import { WSresponse } from '../lib';

const router: Router = Router();

router.use(jwtMiddleware);

router
  .route('/')
  .get(personController.findAll)
  .post(uploadPersonImages.array('images', 10), personController.create);

router
  .route('/:id')
  .get(personController.findById)
  .put(personController.update);

router.get('/:id/similarities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matches = await similarityMatchService.findByPerson(req.params.id);
    res.send(new WSresponse(true, matches));
  } catch (err) {
    next(err);
  }
});

export const personRouter: Router = router;
