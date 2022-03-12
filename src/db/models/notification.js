import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    content: mongoose.Schema.Types.Mixed,
    fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

notificationSchema.virtual('user', {
  ref: 'users',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
notificationSchema.virtual('from', {
  ref: 'users',
  localField: 'fromId',
  foreignField: '_id',
  justOne: true,
});

const Notification = mongoose.model('notifications', notificationSchema);

export default Notification;
