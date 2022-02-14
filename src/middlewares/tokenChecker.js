import User from 'db/models/user';
import jwt from 'jsonwebtoken';
import Result from 'utilities/responseUtil';

const tokenChecker = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return Result.error(res, { message: 'No token provided' }, 403);
    }
    token = token.split(' ')[1];
    const decode = await jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decode.id).select('+password');
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
export default tokenChecker;
