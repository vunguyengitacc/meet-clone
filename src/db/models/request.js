import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status: String,
    result: String,
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
  localField: 'roomId',
  foreignField: '_id',
  justOne: true,
});

requestSchema.virtual('user', {
  ref: 'users',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});
const Request = mongoose.model('requests', requestSchema);

export default Request;
