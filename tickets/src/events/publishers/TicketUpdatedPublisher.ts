import { Publisher, Subjects, TicketUpdatedEvent } from '@sdm888tickets/common';

export default class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
};
