import express, { Request, Response } from 'express';
import {
  BadRequestError,
  ModelNotFoundError,
  NotAuthorizedError, OrderStatus,
  RequireAuth,
  validateRequest
} from '@sdm888tickets/common';
import { body } from 'express-validator';
import { Order } from '../models/Order';
import { stripe } from '../Stripe';
import { Payment } from '../models/Payment';
import { PaymentCreatedPublisher } from '../events/publishers/PaymentCreatedPublisher';
import { natsWrapper } from '../NatsWrapper';

const router = express.Router();

router.post(
  '/api/payments',
   RequireAuth,
  [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new ModelNotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token
    });
    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id
    });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment!.id,
      orderId: payment!.orderId,
      stripeId: payment!.stripeId
    });

    res
      .status(201)
      .send({ id: payment.id });
  }
);

export { router as createChargeRouter };
