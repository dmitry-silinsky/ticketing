import { OrderCreatedEvent, Publisher, Subjects } from '@sdm888tickets/common';

export default class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
};
