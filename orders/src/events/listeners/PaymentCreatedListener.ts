import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from '@sdm888tickets/common';
import { queueGroupName } from './QueueGroupName';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/Order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Complete });
    await order.save();

    msg.ack();
  }
}
