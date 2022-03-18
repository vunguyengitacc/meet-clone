import WhiteBoard from 'db/models/whiteBoard';

const getOne = async (whiteBoardId) => {
  try {
    const rs = await WhiteBoard.findById(whiteBoardId).lean();
    return rs;
  } catch (error) {
    return next(error);
  }
};

const create = async (data) => {
  try {
    const rs = await WhiteBoard.create(data);
    return rs;
  } catch (error) {
    throw error;
  }
};

const update = async (whiteBoardId, updateData) => {
  try {
    const rs = await WhiteBoard.findByIdAndUpdate(whiteBoardId, { $set: updateData }, { new: true }).lean();
    return rs;
  } catch (error) {
    throw error;
  }
};

const deleteOne = async (whiteBoardId) => {
  try {
    const rs = await WhiteBoard.findByIdAndDelete(whiteBoardId);
    console.log(rs);
    return rs;
  } catch (error) {
    throw error;
  }
};

const whiteBoardService = { getOne, update, create, deleteOne };
export default whiteBoardService;
