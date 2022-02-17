import jwt from 'jsonwebtoken';

export const createAccessToken = (data) => {
  const access_token = jwt.sign(data, process.env.SECRET, {
    // expiresIn: '10m',
  });
  return access_token;
};
