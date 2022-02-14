import User from 'db/models/user';

const getOne = async ({ userId }) => {
  try {
    const user = await User.findById(userId).lean();
    return user;
  } catch (error) {
    return next(error);
  }
};
const update = async (userId, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).lean();
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

const userService = { getOne, update };
export default userService;
