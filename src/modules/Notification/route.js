const { Router } = require('express');
const { default: notificationController } = require('./controller');

const NotificationRouter = Router();

NotificationRouter.route('/').get(notificationController.getAll).post(notificationController.create);

export default NotificationRouter;
