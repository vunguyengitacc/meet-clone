import Member from 'db/models/member';
import Message from 'db/models/message';
import Result from 'utilities/responseUtil';
import messageService from './service';

const getAllInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    let messages = await Message.find()
      .populate({ path: 'member', populate: { path: 'user' } })
      .lean();
    const rs = messages.filter((i) => i.member.roomId.toString() === roomId);
    Result.success(res, { rs });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { io } = req.app;
    let { member, message } = { ...req.body };

    if (userId !== member.userId.toString()) return Result.error(res, { message: 'Unauthorized' });

    const memberData = await Member.findById(member._id).lean();

    message.memberId = memberData._id;

    const rs = await messageService.create(message);
    message = await Message.findById(rs._id).populate('member').lean();
    io?.sockets.in(`room/${member.roomId}`).emit('message:new', message);

    Result.success(res, { message }, 201);
  } catch (error) {
    return next(error);
  }
};

const messageController = { getAllInRoom, create };
export default messageController;
