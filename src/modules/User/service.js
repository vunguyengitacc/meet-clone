import User from 'db/models/user';

const getOne = async ({ userId }) => {
  try {
    const rs = await User.findById(userId).lean();
    return rs;
  } catch (error) {
    return next(error);
  }
};
const update = async (userId, updateData) => {
  try {
    const rs = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).lean();
    return rs;
  } catch (error) {
    throw error;
  }
};

const userService = { getOne, update };
export default userService;
