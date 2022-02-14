import Member from 'db/models/member';
import Message from 'db/models/message';
import Result from 'utilities/responseUtil';
import messageService from './service';

const getAllInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.populate('member')
      .find({ member: { $elemMath: { roomId } } })
      .populate({
        path: 'member',
        populate: { path: 'user' },
      });

    Result.success(res, { messages }, 201);
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const member = await Member.findOne({ userId, roomId }).lean();

    const data = { ...req.body };
    data.memberId = member._id;

    const rs = await messageService.create(data);

    Result.success(res, { rs }, 201);
  } catch (error) {
    return next(error);
  }
};

const messageController = { getAllInRoom, create };
export default messageController;
