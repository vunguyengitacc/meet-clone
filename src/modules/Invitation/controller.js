import Invitation from 'db/models/invitation';
import Result from 'utilities/responseUtil';
import { createAccessToken } from 'utilities/tokenUtil';
import invitationService from './service';
import { v4 as uuidv4 } from 'uuid';
import Notification from 'db/models/notification';
import notificationService from 'modules/Notification/service';

const getAll = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const invitations = await Invitation.find({ userId })
      .populate({ path: 'room', populate: { path: 'author' } })
      .lean();
    Result.success(res, { invitations });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { io } = req.app;
    const { userId, roomId } = req.body;
    const rs = await invitationService.create({ userId, roomId });
    const invitation = await Invitation.findById(rs._id).populate('room').lean();
    const temp = await Notification.create({
      userId: invitation.userId,
      name: `Invitation from ${req.user.fullname}`,
      content: invitation,
      type: 'INVITATION',
      fromId: req.user._id,
    });
    const notification = await Notification.findById(temp._id).populate('from').lean();
    io.sockets.in(`auth/${invitation.userId.toString()}`).emit('notification:new', { notification });
    Result.success(res, { invitation }, 201);
  } catch (error) {
    return next(error);
  }
};

const answer = async (req, res, next) => {
  try {
    const { invitationId } = req.params;
    const payload = req.body;
    const { result } = payload.invitation;
    const userId = req.user._id;
    const invitation = await Invitation.findById(invitationId).populate('room').lean();
    if (invitation && userId.toString() === invitation.userId.toString()) {
      if (result === 'ACCEPT') {
        const joinCode = createAccessToken({ roomId: invitation.roomId, userId, session: uuidv4() });
        await invitationService.deleteOne(invitation._id);
        Result.success(res, { joinCode }, 201);
      } else {
        await invitationService.deleteOne(invitation._id);
        Result.success(res, { message: 'success' }, 201);
      }
      await notificationService.deleteOne(payload.notificationId);
    } else {
      throw new Error('Unauthorized');
    }
  } catch (error) {
    return next(error);
  }
};

const invitationController = { getAll, create, answer };
export default invitationController;
