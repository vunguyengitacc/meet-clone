import Notification from 'db/models/notification';

const create = async (data) => {
  try {
    const data = await Notification.create(data);
    return data;
  } catch (error) {
    throw error;
  }
};

const deleteOne = async (notificationId) => {
  try {
    const data = await Notification.findByIdAndDelete(notificationId);
    return data;
  } catch (error) {
    throw error;
  }
};

const notificationService = { create, deleteOne };
export default notificationService;
