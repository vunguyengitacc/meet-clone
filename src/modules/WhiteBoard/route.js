import { Router } from 'express';
import whiteBoardController from './controller';

const WhiteBoardRouter = Router();

WhiteBoardRouter.route('/').get(whiteBoardController.getMine).post(whiteBoardController.create);
WhiteBoardRouter.route('/:whiteBoardId')
  .get(whiteBoardController.getOne)
  .put(whiteBoardController.updateOne)
  .delete(whiteBoardController.deleteOne);

export default WhiteBoardRouter;
