import Member from 'db/models/member';
import Room from 'db/models/room';
import Result from 'utilities/responseUtil';
import { createAccessToken } from 'utilities/tokenUtil';
import memberService from './service';
import jwt from 'jsonwebtoken';
import roomService from 'modules/Room/service';
import { v4 as uuidv4 } from 'uuid';
import requestService from 'modules/Request/service';

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
    const decode = jwt.verify(joinCode, process.env.SECRET);
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

const deleteOne = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.params;
    const userId = req.user._id;
    const { io } = req.app;
    const member = await Member.findById(memberId).populate('user').lean();
    if (member.userId.toString() === userId.toString() || member.isAdmin) await memberService.deleteOne(member._id);
    else return Result.error(res, { message: `Unauthorized` });
    if (member.isAdmin) await roomService.deleteOne(roomId);
    io.sockets.in(`room/${member.roomId}`).emit('room:member-quit', member);
    Result.success(res, { message: 'Successfully' }, 202);
  } catch (error) {
    return next(error);
  }
};

const memberController = { getAllInRoom, getMeInRoom, deleteOne };
export default memberController;
