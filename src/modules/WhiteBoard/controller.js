import WhiteBoard from 'db/models/whiteBoard';
import Result from 'utilities/responseUtil';
import whiteBoardService from './service';

const getMine = async (req, res, next) => {
  try {
    const whiteBoards = await WhiteBoard.getAll().lean();
    Result.success(res, { whiteBoards });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const userId = req.user._id;
    const data = {
      ...payload,
      userId,
    };
    const whiteBoard = await whiteBoardService.create(data);
    Result.success(res, { whiteBoard }, 201);
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { whiteBoardId } = req.params;
    const whiteBoard = await WhiteBoard.findById(whiteBoardId).lean();
    Result.success(res, { whiteBoard });
  } catch (error) {
    next(error);
  }
};

const updateOne = async (req, res, next) => {
  try {
    const { whiteBoardId } = req.params;
    const payload = { ...req.body };
    const userId = req.user._id;
    const whiteBoard = await WhiteBoard.findById(whiteBoardId).lean();
    if (!whiteBoard) throw new Error('Not exist');
    if (whiteBoard.userId.toString() !== userId.toString()) throw new Error('Unauthorized');
    const data = { ...payload, userId };
    const updatedWhiteBoard = await whiteBoardService.update(whiteBoardId, data);
    Result.success(res, { updatedWhiteBoard });
  } catch (error) {
    next(error);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const { whiteBoardId } = req.params;
    const result = await whiteBoardService.deleteOne(whiteBoardId);
    Result.success(res, { result });
  } catch (error) {
    next(error);
  }
};

const whiteBoardController = { getMine, create, getOne, updateOne, deleteOne };

export default whiteBoardController;
