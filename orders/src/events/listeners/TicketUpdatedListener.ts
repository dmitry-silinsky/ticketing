import { Listener, ModelNotFoundError, Subjects, TicketUpdatedEvent } from '@sdm888tickets/common';
import { queueGroupName } from './QueueGroupName';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new ModelNotFoundError();
    }

    const { title, price } = data;
    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}
