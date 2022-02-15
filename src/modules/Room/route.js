import { Router } from 'express';
import memberController from 'modules/Member/controller';
import messageController from 'modules/Message/controller';
import notificationController from 'modules/Notification/controller';
import roomController from './controller';
const RoomRouter = Router();

RoomRouter.route('/').post(roomController.create);
RoomRouter.route('/:roomId').get(roomController.getOne).put(roomController.update).delete(roomController.deleteOne);

RoomRouter.route('/:roomId/members').get(memberController.getAllInRoom).post(memberController.join);
RoomRouter.route('/:roomId/requests/:userId').post(memberController.acceptRequest);
RoomRouter.route('/:roomId/members/:memberId').delete(memberController.deleteOne);
RoomRouter.route('/:roomId/messages').get(messageController.getAllInRoom).post(messageController.create);
RoomRouter.route('/:roomId/notifications').post(notificationController.create);

export default RoomRouter;
