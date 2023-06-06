import express, {Request, Response} from 'express';
import {BadRequestError, ModelNotFoundError, OrderStatus, RequireAuth, validateRequest} from '@sdm888tickets/common';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import {Ticket} from '../models/Ticket';
import {Order} from "../models/Order";
import OrderCreatedPublisher from '../events/publishers/OrderCreatedPublisher';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60;

router.post(
  '/api/orders',
  RequireAuth,
  [
      body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('ticketID must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new ModelNotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError(`Ticket is already reserved`);
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    })
    await order.save();

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res
      .status(201)
      .send(order);
  }
);

export { router as newOrderRouter };
