import Member from 'db/models/member';

const getOne = async ({ memberId }) => {
  try {
    const data = await Member.findById(memberId).lean();
    return data;
  } catch (error) {
    return next(error);
  }
};
const create = async (data) => {
  try {
    const data = await Member.create(data);
    return data;
  } catch (error) {
    throw error;
  }
};
const update = async (memberId, data) => {
  try {
    const data = await Member.findByIdAndUpdate(memberId, { $set: updateData }, { new: true }).lean();
    return data;
  } catch (error) {
    throw error;
  }
};
const deleteOne = async (memberId) => {
  try {
    const data = await Member.findByIdAndDelete(memberId);
    return data;
  } catch (error) {
    throw error;
  }
};

const memberService = { getOne, create, update, deleteOne };
export default memberService;
