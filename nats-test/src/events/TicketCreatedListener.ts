import Listener from './Listener';
import { Message } from 'node-nats-streaming';
import { Subjects } from './Subjects';
import { TicketCreatedEvent } from './TicketCreatedEvent';

export default class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data', data);

    msg.ack();
  }
}
