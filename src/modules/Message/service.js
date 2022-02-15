import Message from 'db/models/message';

const create = async (data) => {
  try {
    const rs = await Message.create(data);
    return rs;
  } catch (error) {
    throw error;
  }
};

const messageService = { create };
export default messageService;
