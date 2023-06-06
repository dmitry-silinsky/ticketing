import express, { Request, Response } from 'express';
import { RequireAuth } from '@sdm888tickets/common';
import { Order } from '../models/Order';

const router = express.Router();

router.get('/api/orders', RequireAuth, async (req: Request, res: Response) => {
  const orders = await Order
    .find({ userId: req.currentUser!.id })
    .populate('ticket');

  res.send(orders);
});

export { router as indexOrderRouter };
