import { Listener, ModelNotFoundError, OrderCancelledEvent, Subjects } from '@sdm888tickets/common';
import { queueGroupName } from './QueueGroupName';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
import TicketUpdatedPublisher from "../publishers/TicketUpdatedPublisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new ModelNotFoundError();
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version
    });

    msg.ack();
  }
};
