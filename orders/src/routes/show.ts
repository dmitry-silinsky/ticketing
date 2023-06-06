import express, { Request, Response } from 'express';
import {
  ModelNotFoundError,
  NotAuthorizedError,
  RequireAuth
} from '@sdm888tickets/common';
import { Order } from '../models/Order';

const router = express.Router();

router.get('/api/orders/:orderId', RequireAuth, async (req: Request, res: Response) => {
  const order = await Order
    .findById(req.params.orderId)
    .populate('ticket');

  if (!order) {
    throw new ModelNotFoundError();
  }
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  res.send(order);
});

export { router as showOrderRouter };
