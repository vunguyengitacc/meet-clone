import Invitation from 'db/models/invitation';

const create = async (data) => {
  try {
    const rs = await Invitation.create(data);
    return rs;
  } catch (error) {
    throw error;
  }
};
const deleteOne = async (notificationId) => {
  try {
    const data = await Invitation.findByIdAndDelete(notificationId);
    return data;
  } catch (error) {
    throw error;
  }
};

const invitationService = { create, deleteOne };
export default invitationService;
