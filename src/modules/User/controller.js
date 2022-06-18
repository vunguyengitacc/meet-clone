import bcrypt from 'bcrypt';
import User from 'db/models/user';
import { sendVerifyMail } from 'utilities/mailUtil';
import Result from 'utilities/responseUtil';
import userService from './service';
import { createAccessToken } from 'utilities/tokenUtil';

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
    let payload = { ...req.body }; 
    let isUpdateEmail = false;
    const user = await User.findById(userId).lean();
    if(!user) return Result.error(res, { message: 'Invalid user' }, 401);
    if(user.isVerifyEmail && payload.email && payload.email.toString()!==user.email.toString()){
      payload.oldEmail = user.email;
      payload.isVerifyEmail = false;
      isUpdateEmail = true;
      
    }
    else if(!user.isVerifyEmail && payload.email && payload.email.toString()!==user.email.toString()){            
      isUpdateEmail = true;      
    }
    
    if (payload.password) delete payload.password;
    const userUpdated = await userService.update(userId, payload);
    if(isUpdateEmail) {
      const code = createAccessToken({ userId: user._id, email: payload.email });
      sendVerifyMail(
        payload.email,
        `Let's Meet verifying`,
        `Please verify your account by clicking this link: <a href="http://127.0.0.1:8000/api/auth/verify/${code}">Click here</a>`
      );
    }
    Result.success(res, { userUpdated, isUpdateEmail });
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
