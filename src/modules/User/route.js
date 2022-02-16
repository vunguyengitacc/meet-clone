import { Router } from 'express';
import userController from './controller';
const UserRouter = Router();

UserRouter.route('/me').get(userController.getMe).put(userController.updateInfo);
UserRouter.route('/me/password').put(userController.updatePassword);

export default UserRouter;
