import { OrderCancelledEvent, Publisher, Subjects } from '@sdm888tickets/common';

export default class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
};
