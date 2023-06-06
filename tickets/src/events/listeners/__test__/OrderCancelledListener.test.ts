import { natsWrapper } from '../../../NatsWrapper';
import { Ticket } from '../../../models/Ticket';
import mongoose from 'mongoose';
import { OrderCancelledEvent } from '@sdm888tickets/common';
import { OrderCancelledListener } from '../OrderCancelledListener';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'Concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: ticket.orderId,
    version: 0,
    ticket: { id: ticket.id }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, orderId, msg };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, ticket, data, orderId, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
