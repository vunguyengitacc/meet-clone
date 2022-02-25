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

const acceptRequest = async (req, res, next) => {
  try {
    const { roomId, requestId } = req.params;
    const { io } = req.app;
    const room = await Room.findById(roomId).lean();
    if (!room) return Result.error(res, { message: `Room does not existed` });
    const request = await Request.findById(requestId).lean();
    if (!request) return Result.error(res, { message: `Request does not existed` });
    if (room.isPrivate) {
      const yourId = req.user._id;
      const member = await Member.findOne({ roomId, yourId, isAdmin: true }).lean();
      if (!member) return Result.error(res, { message: `Unauthorized` });
      const joinCode = createAccessToken({ roomId, userId: request.userId, session: uuidv4() });
      io.sockets.on(`auth/${request.userId.toString()}`).emit('request/accept', { joinCode });
      await requestService.deleteOne(request._id);
      Result.success(res, { joinCode }, 201);
    } else {
      const joinCode = createAccessToken({ roomId, userId, session: uuidv4() });
      Result.success(res, { joinCode }, 201);
    }
  } catch (error) {
    return next(error);
  }
};

const requestController = { getAllInRoom, acceptRequest };
export default requestController;
