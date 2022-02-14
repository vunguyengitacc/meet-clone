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

const notificationController = { create };
export default notificationController;
