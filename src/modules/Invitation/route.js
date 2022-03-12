import { Router } from 'express';
import invitationController from './controller';

const InvitationRouter = Router();

InvitationRouter.route('/').get(invitationController.getAll).post(invitationController.create);
InvitationRouter.route('/:invitationId').put(invitationController.answer);

export default InvitationRouter;
