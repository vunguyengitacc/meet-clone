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

const search = async (req, res, next) => {
  try {
    const { term } = req.query;
    const { not } = req.query;
    let exceptArr;
    if (Array.isArray(not)) {
      exceptArr = not;
    } else {
      exceptArr = [not];
    }
    const users = await User.find({ $text: { $search: term }, _id: { $nin: exceptArr } }).lean();
    Result.success(res, { users });
  } catch (error) {
    return next(error);
  }
};

const updateInfo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payload = { ...req.body };
    if (payload.password) delete payload.password;
    const userUpdated = await userService.update(userId, payload);
    Result.success(res, { userUpdated });
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
    const payload = { password: hash };
    const data = await userService.update(currentUser._id, payload);
    Result.success(res, { data });
  } catch (error) {
    return next(error);
  }
};

const userController = { getMe, updateInfo, updatePassword, search };
export default userController;
