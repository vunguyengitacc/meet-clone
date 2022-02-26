import { Router } from 'express';
import memberController from 'modules/Member/controller';
import messageController from 'modules/Message/controller';
import requestController from 'modules/Request/controller';
import roomController from './controller';
const RoomRouter = Router();

RoomRouter.route('/').post(roomController.create);
RoomRouter.route('/:roomId').get(roomController.getOne).put(roomController.update).delete(roomController.deleteOne);

RoomRouter.route('/:roomId/members').get(memberController.getAllInRoom);
RoomRouter.route('/:roomId/members/:joinCode').get(memberController.getMeInRoom);
RoomRouter.route('/:roomId/requests').get(requestController.getAllInRoom).post(requestController.create);
RoomRouter.route('/:roomId/requests/:requestId').put(requestController.answerRequest);
RoomRouter.route('/:roomId/members/:memberId').delete(memberController.deleteOne);
RoomRouter.route('/:roomId/messages').get(messageController.getAllInRoom).post(messageController.create);

export default RoomRouter;
