import bcrypt from 'bcrypt';
import User from 'db/models/user';
import Result from 'utilities/responseUtil';
import userService from './service';

const getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (req.query.search) {
      const users = await User.find({ $or: [{ email: search }, { username: search }] });
      return Result.success(res, { users }, 201);
    }
    const users = await User.find({});
    Result.success(res, { users }, 201);
  } catch (error) {
    return next(error);
  }
};

const updateInfo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = { ...req.body, updateAt: Date.now() };
    if (data.password) delete data.password;
    const updatedUser = await userService.update(userId, data);
    Result.success(res, { updatedUser });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;
    const passwordChecker = await bcrypt.compare(currentPassword, currentUser.password);
    if (!passwordChecker) {
      return Result.error(res, { message: 'Current password is wrong' }, 401);
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updateData = { password: hashedPassword, updateAt: Date.now() };
    const updatedUser = await userService.update(currentUser._id, updateData);
    Result.success(res, { updatedUser });
  } catch (error) {
    return next(error);
  }
};

const userController = { getAll, updateInfo, updatePassword };
export default userController;
