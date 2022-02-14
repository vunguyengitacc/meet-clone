import { Router } from 'express';
import tokenChecker from 'middlewares/tokenChecker';
import authController from './controller';

const AuthRouter = Router();
AuthRouter.route('/getMe').get(tokenChecker, authController.getMe);
AuthRouter.route('/login').post(authController.login);
AuthRouter.route('/register').post(authController.register);

export default AuthRouter;
