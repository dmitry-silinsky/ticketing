import express, { Request, Response } from 'express';
import { Ticket } from '../models/Ticket';
import { ModelNotFoundError } from '@sdm888tickets/common';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new ModelNotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
