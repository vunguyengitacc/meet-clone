import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms' },
    enalbleShareMicro: Boolean,
    enalbleShareWebcam: Boolean,
    enalbleShareScreen: Boolean,
    joinSession: String,
    isAdmin: Boolean,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

memberSchema.virtual('user', {
  ref: 'users',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

memberSchema.virtual('room', {
  ref: 'rooms',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true,
});

const Member = mongoose.model('members', memberSchema);

export default Member;
