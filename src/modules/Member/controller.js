import Member from 'db/models/member';
import Result from 'utilities/responseUtil';
import memberService from './service';
import jwt from 'jsonwebtoken';
import roomService from 'modules/Room/service';

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
    const me = await Member.findOne(userId).lean();
    if (member.userId.toString() === userId.toString() || me.isAdmin) await memberService.deleteOne(member._id);
    else return Result.error(res, { message: `Unauthorized` });
    // if (member.isAdmin) await roomService.deleteOne(roomId);
    io.sockets.in(`room/${member.roomId}`).emit('room:member-quit', member);
    io.sockets.in(`room/${member.roomId}`).emit('room:be-kicked', member);
    Result.success(res, { message: 'Successfully' }, 202);
    const memberInRoom = await Member.find({roomId}).lean();
    if(memberInRoom?.length == 0) await roomService.deleteOne(roomId);    
  } catch (error) {
    return next(error);
  }
};

const memberController = { getAllInRoom, getMeInRoom, deleteOne };
export default memberController;
