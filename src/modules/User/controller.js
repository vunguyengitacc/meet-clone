import bcrypt from 'bcrypt';
import User from 'db/models/user';
import Result from 'utilities/responseUtil';
import userService from './service';

const getMe = async (req, res, next) => {
  try {
    Result.success(res, { currentUser: req.user });
  } catch (error) {
    return next(error);
  }
};

const updateInfo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = { ...req.body };
    if (data.password) delete data.password;
    const rs = await userService.update(userId, data);
    Result.success(res, { rs });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;
    const passwordComparer = await bcrypt.compare(currentPassword, currentUser.password);
    if (!passwordComparer) {
      return Result.error(res, { message: 'Current password is wrong' }, 401);
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const data = { password: hash };
    const rs = await userService.update(currentUser._id, data);
    Result.success(res, { rs });
  } catch (error) {
    return next(error);
  }
};

const userController = { getMe, updateInfo, updatePassword };
export default userController;
