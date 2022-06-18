import { Router } from 'express';
import authController from './controller';

const AuthRouter = Router();
AuthRouter.route('/login').post(authController.login);
AuthRouter.route('/register').post(authController.register);
AuthRouter.route('/verify/:code').get(authController.verify)

export default AuthRouter;
