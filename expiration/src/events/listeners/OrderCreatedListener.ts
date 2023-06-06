import { Listener, OrderCreatedEvent, Subjects } from '@sdm888tickets/common';
import { queueGroupName } from './QueueGroupName';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/ExpirationQueue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job: ', delay);

    await expirationQueue.add(
      {
        orderId: data.id
      },
      {
        delay
      }
    );

    msg.ack();
  }
}
