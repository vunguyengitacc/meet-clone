import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    fullname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    avatarURI: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, obj) => {
        delete obj.password;
        return obj;
      },
    },
    timestamps: true,
  }
);

const User = mongoose.model('users', userSchema);
export default User;
