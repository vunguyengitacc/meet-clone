import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    result: Boolean,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

requestSchema.virtual('room', {
  ref: 'rooms',
  localField: 'roomIId',
  foreignField: '_id',
});

requestSchema.virtual('user', {
  ref: 'users',
  localField: 'userIId',
  foreignField: '_id',
});
const Request = mongoose.model('requests', requestSchema);

export default Request;
