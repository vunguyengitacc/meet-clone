import Member from 'db/models/member';
import Room from 'db/models/room';
import Result from 'utilities/responseUtil';
import roomService from './service';
import { v4 as uuidv4 } from 'uuid';
import { createAccessToken } from 'utilities/tokenUtil';

const getAll = async (req, res, next) => {
  try {
    const data = await Room.getAll().lean();
    Result.success(res, { data });
  } catch (error) {
    return next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const room = await Room.findOne({ $or: [{ accessCode: roomId }] }).lean();
    if (!room) return Result.error(res, { message: 'Room is not existed' });
    if (room.authorId.toString() === userId.toString()) {
      const joinCode = createAccessToken({ roomId: room._id, userId: req.user._id, isAdmin: true, session: uuidv4() });
      return Result.success(res, { result: { room, joinCode } });
    }
    return Result.success(res, { result: { room, joinCode: '' } });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    let payload = { ...req.body };
    payload.accessCode = uuidv4();
    payload.authorId = req.user._id;
    const room = await roomService.create(payload);
    const joinCode = createAccessToken({ roomId: room._id, userId: req.user._id, isAdmin: true, session: uuidv4() });
    Result.success(res, { result: { room, joinCode } }, 201);
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { io } = req.app;
    const payload = { ...req.body };
    const { notification, room } = payload;
    const roomUpdated = await roomService.update(roomId, room);
    io.sockets.in(`room/${roomId}`).emit('room:update', { roomUpdated, notification });
    Result.success(res, { roomUpdated });
  } catch (error) {
    return next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { io } = req.app;
    const member = await Member.findOne({ roomId, userId: req.user._id }).lean();
    if (!member.isAdmin) return Result.error(res, { message: `Unauthorized` });
    const rs = await roomService.deleteOne(roomId);
    await Member.deleteMany({ roomId: roomId });
    io.sockets.in(`room/${roomId}`).emit('room:finish', rs);
    Result.success(res, { rs }, 202);
  } catch (error) {
    return next(error);
  }
};

const roomController = { getAll, getOne, create, update, deleteOne };
export default roomController;
