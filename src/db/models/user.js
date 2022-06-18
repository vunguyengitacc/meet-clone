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
    fullname: String,
    email: {
      type: String,
      unique: true,
    },
    oldEmail: String,
    isVerifyEmail: Boolean,
    phone: String,
    address: String,
    avatarURI: String,
    bio: String,    
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

userSchema.index({ username: 'text', fullname: 'text', email: 'text' });
const User = mongoose.model('users', userSchema);
export default User;
