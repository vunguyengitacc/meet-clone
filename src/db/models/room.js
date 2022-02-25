import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    accessCode: {
      type: String,
      unique: true,
    },
    isPrivate: Boolean,
    isRecording: Boolean,
    isShowOldMessage: Boolean,
    isAllowMessage: Boolean,
    isAllowShareScreen: Boolean,
    isAllowShareWebcam: Boolean,
    isAllowShareMicro: Boolean,
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    timestamps: true,
  }
);

roomSchema.index({ accessLink: 'text', name: 'text' });

const Room = mongoose.model('rooms', roomSchema);
export default Room;
