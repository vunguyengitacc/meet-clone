import tokenChecker from 'middlewares/tokenChecker';
import AuthRouter from 'modules/Auth/route';
import UserRouter from 'modules/User/route';
import Result from 'utilities/responseUtil';

const MasterRoute = (app) => {
  app.use('/api/auth', AuthRouter);
  app.use('/api/users', tokenChecker, UserRouter);
  app.use((req, res, next) => Result.error(res, { message: 'API Not Found' }, 404));
};

export default MasterRoute;
