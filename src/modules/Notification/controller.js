import Notification from 'db/models/notification';
import Result from 'utilities/responseUtil';
import notificationService from './service';

const create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const rs = await notificationService.create(data);
    Result.success(res, { rs });
  } catch (error) {
    return next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).populate('from').lean();
    Result.success(res, { notifications });
  } catch (error) {
    return next(error);
  }
};

const notificationController = { create, getAll };
export default notificationController;
