import Member from 'db/models/member';
import Room from 'db/models/room';
import Result from 'utilities/responseUtil';
import memberService from './service';

const getAllInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const members = await Member.find({ roomId }).lean();
    Result.success(res, { members });
  } catch (error) {
    return next(error);
  }
};

const getMeInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const data = await Member.findOne({ roomId, userId: req.user._id }).populate('user').lean();
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
    if (member) {
      return Result.success(res, { data: member }, 201);
    }
    const room = await Room.findById(roomId).lean();
    if (room.isPrivate) {
      await Room.updateOne({ _id: room._id }, { $addToSet: { joinRequest: userId } });
      Result.success(res, { message: 'You are waiting for accepted' }, 201);
    } else {
      const data = await memberService.create({ roomId, userId, isAdmin: false });
      Result.success(res, { data }, 201);
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
      const data = await memberService.create({ roomId, userId, isAdmin: false });
      await Room.updateOne({ _id: room._id }, { $pull: { joinRequest: userId } });
      Result.success(res, { data }, 201);
    } else {
      const data = await memberService.create({ roomId, userId, isAdmin: false });
      Result.success(res, { data }, 201);
    }
  } catch (error) {
    return next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.params;
    const userId = req.user._id;
    const member = await Member.findOne({ roomId, userId }).lean();
    if (member._id === memberId || member.isAdmin) await memberService.deleteOne(member._id);
    else return Result.error(res, { message: `Unauthorized` });
    Result.success(res, { message: 'Successfully' }, 202);
  } catch (error) {
    return next(error);
  }
};

const memberController = { getAllInRoom, getMeInRoom, join, deleteOne, acceptRequest };
export default memberController;
