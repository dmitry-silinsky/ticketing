import { Listener, ModelNotFoundError, OrderCreatedEvent, Subjects } from '@sdm888tickets/common';
import { queueGroupName } from './QueueGroupName';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
import TicketUpdatedPublisher from '../publishers/TicketUpdatedPublisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new ModelNotFoundError();
    }

    ticket.set({ orderId: data.id });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version
    });

    msg.ack();
  }
}
