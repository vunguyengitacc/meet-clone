import { Router } from 'express';
import userController from './controller';
const UserRouter = Router();

UserRouter.route('/').get(userController.getAll);
UserRouter.route('/:userId').put(userController.updateInfo);
UserRouter.route('/:userId/password').put(userController.updatePassword);

export default UserRouter;
