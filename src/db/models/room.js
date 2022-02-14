import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    accessLink: {
      type: String,
      unique: true,
    },
    isPrivate: Boolean,
    isRecording: Boolean,
    isShowOldMessage: Boolean,
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    timestamps: true,
  }
);

userSchema.index({ accessLink: 'text', name: 'text' });

const Room = mongoose.model('rooms', roomSchema);
export default Room;
