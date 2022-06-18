import bcrypt from 'bcrypt';
import User from 'db/models/user';
import userService from 'modules/User/service';
import { sendVerifyMail } from 'utilities/mailUtil';
import Result from 'utilities/responseUtil';
import { createAccessToken } from 'utilities/tokenUtil';
import jwt from 'jsonwebtoken';

const login = async (req, res, next) => {
  try {
    const { account, password } = req.body;
    const user = await User.findOne({ $or: [{ email: account }, { username: account }] }).select('+password');
    if (!user) {
      return Result.error(res, { message: 'Email does not exist' }, 401);
    }
    const passwordComparer = await bcrypt.compare(password, user.password);
    if (!passwordComparer) {
      return Result.error(res, { message: 'Wrong password' }, 401);
    }
    if(!user.isVerifyEmail && !user.oldEmail ){
      return Result.error(res, { message: 'Your account has not been verify yet' }, 401);
    }
    const access_token = createAccessToken({ id: user._id, username: user.username });
    Result.success(res, { access_token });
  } catch (error) {
    return next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { fullname, username, email, password } = req.body;
    const usernameChecker = await User.find({ username }).countDocuments();
    if (usernameChecker) {
      return Result.error(res, { message: 'Username has been already used' });
    }
    const emailChecker = await User.find({ email }).countDocuments();
    if (emailChecker) {
      return Result.error(res, { message: 'Email has been already used' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullname,
      username,
      email,
      isVerifyEmail: false,
      password: hash,
      avatarURI: `https://avatars.dicebear.com/4.5/api/initials/${fullname}.svg`,
    });
    const user = await User.findOne({ username }).lean();
    const code = createAccessToken({ userId: user._id, email });
      sendVerifyMail(
        email,
        `Let's Meet verifying`,
        `Please verify your account by clicking this link: <a href="http://127.0.0.1:8000/api/auth/verify/${code}">Click here</a>`
      );
    Result.success(res, { newUser }, 201);
  } catch (error) {
    return next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { code } = req.params;
    console.log(code)
    const decode = jwt.verify(code, process.env.SECRET);
    const {userId, email} = decode;
    const user = await User.findById(userId).lean();
    if(!user && user.email !== email) return Result.error(res, { message: 'Invalid verifying process' }, 401);
    const userUpdated = await userService.update(userId, { 
      isVerifyEmail: true,
      oldEmail: user.email
     });
    Result.success(res, { msg: "You have verified your email address! You can user this email address to connect with the app right now" }, 201);
  } catch (error) {
    return next(error)
  }
}

const authController = { login, register, verify };
export default authController;
