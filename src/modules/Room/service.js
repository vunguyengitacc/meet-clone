import Member from 'db/models/member';
import Room from 'db/models/room';

const getOne = async ({ roomId }) => {
  try {
    const room = await Room.findById(roomId).lean();
    return room;
  } catch (error) {
    return next(error);
  }
};
const create = async (data) => {
  try {
    if (!data.isPrivate) data.isPrivate = true;
    if (!data.isShowOldMessage) data.isShowOldMessage = false;
    if (!data.isRecording) data.isRecording = false;
    if (!data.isAllowMessage) data.isAllowMessage = true;
    if (!data.isAllowShareScreen) data.isAllowShareScreen = true;
    if (!data.isAllowShareWebcam) data.isAllowShareWebcam = true;
    if (!data.isAllowShareMicro) data.isAllowShareMicro = true;
    const rs = await Room.create(data);
    return rs;
  } catch (error) {
    throw error;
  }
};
const update = async (roomId, updateData) => {
  try {
    const data = await Room.findByIdAndUpdate(roomId, { $set: updateData }, { new: true }).lean();
    return data;
  } catch (error) {
    throw error;
  }
};
const deleteOne = async (roomId) => {
  try {
    const data = await Room.findByIdAndDelete(roomId);
    await Member.deleteMany({ roomId });
    return data;
  } catch (error) {
    throw error;
  }
};

const roomService = { getOne, create, update, deleteOne };
export default roomService;
