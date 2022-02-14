import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'members' },
    content: String,
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

const Message = mongoose.model('messages', messageSchema);

export default Message;
