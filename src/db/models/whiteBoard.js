import mongoose from 'mongoose';

const whiteBoardSchema = new mongoose.Schema(
  {
    name: String,
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'members' },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

messageSchema.virtual('member', {
  ref: 'members',
  localField: 'memberId',
  foreignField: '_id',
  justOne: true,
});

const WhiteBoard = mongoose.model('white-boards', whiteBoardSchema);

export default WhiteBoard;
