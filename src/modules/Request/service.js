import Request from 'db/models/request';

const create = async (input) => {
  try {
    const data = await Request.create(input);
    return data;
  } catch (error) {
    throw error;
  }
};

const updateOne = async (requestId, payload) => {
  try {
    const data = await Request.findByIdAndUpdate(requestId, payload);
    return data;
  } catch (error) {
    throw error;
  }
};

const deleteOne = async (requestId) => {
  try {
    const data = await Request.findByIdAndDelete(requestId);
    return data;
  } catch (error) {
    throw error;
  }
};

const requestService = { create, deleteOne, updateOne };
export default requestService;
