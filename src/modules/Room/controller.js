import Member from 'db/models/member';
import Room from 'db/models/room';
import memberService from 'modules/Member/service';
import Result from 'utilities/responseUtil';
import roomService from './service';

const getAll = async (req, res, next) => {
  try {
    const rooms = await Room.getAll();
    Result.success(res, { rooms }, 201);
  } catch (error) {
    return next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    Result.success(res, { room }, 201);
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const rs = await roomService.create(data);
    Result.success(res, { rs });
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const data = { ...req.body };
    const rs = await roomService.update(roomId, data);
    Result.success(res, { rs });
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
    Result.success(res, { rs });
  } catch (error) {
    return next(error);
  }
};

const roomController = { getAll, getOne, create, update, deleteOne };
export default roomController;
