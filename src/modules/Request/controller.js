import Member from 'db/models/member';
import Request from 'db/models/request';
import Room from 'db/models/room';
import Result from 'utilities/responseUtil';
import { createAccessToken } from 'utilities/tokenUtil';
import { v4 as uuidv4 } from 'uuid';
import requestService from './service';

const getAllInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const requests = await Request.find({ roomId }).lean();
    Result.success(res, { requests });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { io } = req.app;
    const userId = req.user._id;
    const member = await Member.findOne({ roomId, userId }).lean();
    const room = await Room.findById(roomId).lean();
    let session = uuidv4();
    if (room.isPrivate && (member == undefined || !member.isAdmin)) {
      const data = await requestService.create({ roomId, userId, status: 'WAITING' });
      const newRequest = await Request.findById(data._id).populate('user').lean();
      io.sockets.in(`room/${room._id.toString()}`).emit('request/new', newRequest);
      Result.success(res, { newRequest }, 201);
    } else {
      const joinCode = createAccessToken({ roomId, userId, session });
      Result.success(res, { joinCode }, 201);
    }
  } catch (error) {
    return next(error);
  }
};

const answerRequest = async (req, res, next) => {
  try {
    const { roomId, requestId } = req.params;
    const { io } = req.app;
    const { result } = req.body;
    const room = await Room.findById(roomId).lean();
    if (!room) return Result.error(res, { message: `Room does not existed` });
    const request = await Request.findById(requestId).lean();
    if (roomId !== request.roomId.toString()) return Result.error(res, { message: `Unauthorized` });
    if (!request) return Result.error(res, { message: `Request does not existed` });
    if (room.isPrivate) {
      const yourId = req.user._id;
      const member = await Member.findOne({ roomId, yourId, isAdmin: true }).lean();
      if (!member) return Result.error(res, { message: `Unauthorized` });
      if (result !== 'ACCEPT') {
        const requestUpdated = await requestService.updateOne(request._id, {
          result: 'You are rejected!',
          status: 'REJECT',
        });
        io.sockets.in(`auth/${request.userId.toString()}`).emit('request/answer', { requestUpdated });
        return Result.success(res, { requestUpdated }, 201);
      }
      const joinCode = createAccessToken({ roomId, userId: request.userId, session: uuidv4() });
      const requestUpdated = await requestService.updateOne(request._id, { result: joinCode, status: 'ACCEPT' });
      io.sockets.in(`auth/${request.userId.toString()}`).emit('request/answer', { joinCode, requestUpdated });
      Result.success(res, { requestUpdated }, 201);
    } else {
      const joinCode = createAccessToken({ roomId, userId, session: uuidv4() });
      Result.success(res, { joinCode }, 201);
    }
  } catch (error) {
    return next(error);
  }
};

const requestController = { getAllInRoom, create, answerRequest };
export default requestController;
