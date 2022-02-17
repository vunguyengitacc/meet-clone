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
    const data = await Room.findOne({ $or: [{ accessCode: roomId }] }).lean();
    if (!data) return Result.error(res, { message: 'Room is not existed' });
    Result.success(res, { data });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    let payload = { ...req.body };
    payload.accessCode = uuidv4();
    const room = await roomService.create(payload);
    const joinCode = createAccessToken({ roomId: room._id, userId: req.user._id, isAdmin: true });
    Result.success(res, { result: { room, joinCode } }, 201);
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const payload = { ...req.body };
    const data = await roomService.update(roomId, payload);
    Result.success(res, { data });
  } catch (error) {
    return next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const member = await Member.findOne({ roomId, userId: req.user._id }).populate('roles').lean();
    if (!member.isAdmin) return Result.error(res, { message: `Unauthorized` });
    const rs = await roomService.deleteOne(roomId);
    Result.success(res, { rs }, 202);
  } catch (error) {
    return next(error);
  }
};

const roomController = { getAll, getOne, create, update, deleteOne };
export default roomController;
