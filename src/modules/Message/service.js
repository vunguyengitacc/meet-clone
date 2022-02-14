import Message from 'db/models/message';

const create = async (data) => {
  try {
    const data = await Message.create(data);
    return data;
  } catch (error) {
    throw error;
  }
};

const messageService = { create };
export default messageService;
