import Member from 'db/models/member';
import Room from 'db/models/room';
import Result from 'utilities/responseUtil';
import { createAccessToken } from 'utilities/tokenUtil';
import memberService from './service';
import jwt from 'jsonwebtoken';
import roomService from 'modules/Room/service';
import { v4 as uuidv4 } from 'uuid';

const getAllInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const members = await Member.find({ roomId }).populate('user').lean();
    Result.success(res, { members });
  } catch (error) {
    return next(error);
  }
};

const getMeInRoom = async (req, res, next) => {
  try {
    const { roomId, joinCode } = req.params;
    const { io } = req.app;
    const decode = await jwt.verify(joinCode, process.env.SECRET);
    if (decode.roomId !== roomId || decode.userId !== req.user._id.toString()) throw new Error('Invalid join code');
    let data = await Member.findOne({ roomId, userId: req.user._id, joinSession: joinCode }).populate('user').lean();
    if (data === null) {
      data = await memberService.create({
        roomId,
        userId: req.user._id,
        isAdmin: decode.isAdmin,
        joinSession: joinCode,
      });
      data = await Member.findOne({ roomId, userId: req.user._id, isAdmin: decode.isAdmin, joinSession: joinCode })
        .populate('user')
        .lean();
    }
    io.sockets.in(`room/${roomId}`).emit('room:member-join', data);
    Result.success(res, { data });
  } catch (error) {
    return next(error);
  }
};

const join = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const member = await Member.findOne({ roomId, userId }).lean();
    const room = await Room.findById(roomId).lean();
    let session = uuidv4();
    if (room.isPrivate && (member == undefined || !member.isAdmin)) {
      await Room.updateOne({ _id: room._id }, { $addToSet: { joinRequest: userId } });
      Result.success(res, { message: 'You are waiting for accepted' }, 201);
    } else {
      const joinCode = createAccessToken({ roomId, userId, session });
      Result.success(res, { joinCode }, 201);
    }
  } catch (error) {
    return next(error);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params;
    const room = await Room.findById(roomId).lean();
    if (!room) return Result.error(res, { message: `Room does not existed` });
    if (room.isPrivate) {
      const yourId = req.user._id;
      const member = await Member.findOne({ roomId, yourId, isAdmin: true }).lean();
      if (!member) return Result.error(res, { message: `Unauthorized` });
      const joinCode = createAccessToken({ roomId, userId, session: uuidv4() });
      await Room.updateOne({ _id: room._id }, { $pull: { joinRequest: userId } });
      Result.success(res, { joinCode }, 201);
    } else {
      const joinCode = createAccessToken({ roomId, userId, session: uuidv4() });
      Result.success(res, { joinCode }, 201);
    }
  } catch (error) {
    return next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.params;
    const userId = req.user._id;
    const { io } = req.app;
    const member = await Member.findOne({ roomId, userId }).populate('user').lean();
    if (member._id.toString() === memberId || member.isAdmin) await memberService.deleteOne(member._id);
    else return Result.error(res, { message: `Unauthorized` });
    if (member.isAdmin) await roomService.deleteOne(roomId);
    io.sockets.in(`room/${member.roomId}`).emit('room:member-quit', member);
    Result.success(res, { message: 'Successfully' }, 202);
  } catch (error) {
    return next(error);
  }
};

const memberController = { getAllInRoom, getMeInRoom, join, deleteOne, acceptRequest };
export default memberController;
