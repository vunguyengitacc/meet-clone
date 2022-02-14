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
    const data = await Room.create(data);
    return data;
  } catch (error) {
    throw error;
  }
};
const update = async (roomId, data) => {
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
    return data;
  } catch (error) {
    throw error;
  }
};

const roomService = { getOne, create, update, deleteOne };
export default roomService;
