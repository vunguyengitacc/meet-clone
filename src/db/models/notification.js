import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    name: String,
    message: String,
    memberId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'members' }],
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

notificationSchema.virtual('members', {
  ref: 'members',
  localField: 'memberId',
  foreignField: '_id',
});

const Notification = mongoose.model('notifications', notificationSchema);

export default Notification;
