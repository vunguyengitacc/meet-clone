import mongoose from 'mongoose';

const whiteBoardSchema = new mongoose.Schema(
  {
    name: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

whiteBoardSchema.virtual('user', {
  ref: 'users',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const WhiteBoard = mongoose.model('white-boards', whiteBoardSchema);

export default WhiteBoard;
