import express, { Request, Response } from 'express';
import { Ticket } from '../models/Ticket';
import {
  BadRequestError,
  ModelNotFoundError,
  NotAuthorizedError,
  RequireAuth,
  validateRequest
} from '@sdm888tickets/common';
import { body } from 'express-validator';
import {natsWrapper} from '../NatsWrapper';
import TicketUpdatedPublisher from '../events/publishers/TicketUpdatedPublisher';

const router = express.Router();

router.put(
    '/api/tickets/:id',
    RequireAuth,
    [
      body('title').not().isEmpty().withMessage('Title is required'),
      body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        throw new ModelNotFoundError();
      }

      if (ticket.orderId) {
        throw new BadRequestError('Cannot edit a reserved ticket');
      }

      if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
      }

      const { title, price } = req.body;

      ticket.set({ title, price });
      await ticket.save();

      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId
      });

      res.send(ticket);
    }
);

export { router as updateTicketRouter };
