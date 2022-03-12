import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    result: String,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

invitationSchema.virtual('room', {
  ref: 'rooms',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true,
});

invitationSchema.virtual('user', {
  ref: 'users',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

invitationSchema.index({ roomId: 1, userId: 1 }, { unique: true });

const Invitation = mongoose.model('invitations', invitationSchema);

export default Invitation;
