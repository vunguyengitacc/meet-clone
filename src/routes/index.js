import tokenChecker from 'middlewares/tokenChecker';
import AuthRouter from 'modules/Auth/route';
import InvitationRouter from 'modules/Invitation/route';
import NotificationRouter from 'modules/Notification/route';
import RoomRouter from 'modules/Room/route';
import UserRouter from 'modules/User/route';
import WhiteBoardRouter from 'modules/WhiteBoard/route';
import Result from 'utilities/responseUtil';

const MasterRoute = (app) => {
  app.use('/api/auth', AuthRouter);
  app.use('/api/users', tokenChecker, UserRouter);
  app.use('/api/rooms', tokenChecker, RoomRouter);
  app.use('/api/invitations', tokenChecker, InvitationRouter);
  app.use('/api/notifications', tokenChecker, NotificationRouter);
  app.use('/api/whiteboards', tokenChecker, WhiteBoardRouter);
  app.use((req, res, next) => Result.error(res, { message: 'API Not Found' }, 404));
};

export default MasterRoute;
