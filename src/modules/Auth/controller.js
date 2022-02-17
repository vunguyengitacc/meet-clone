import bcrypt from 'bcrypt';
import User from 'db/models/user';
import Result from 'utilities/responseUtil';
import { createAccessToken } from 'utilities/tokenUtil';

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
    const access_token = createAccessToken({ id: user._id, ussername: user.username });
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
      password: hash,
      avatarURI: `https://avatars.dicebear.com/4.5/api/initials/${fullname}.svg`,
    });
    const access_token = createAccessToken({ id: newUser._id, ussername: newUser.username });
    Result.success(res, { access_token }, 201);
  } catch (error) {
    return next(error);
  }
};

const authController = { login, register };
export default authController;
