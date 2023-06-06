import { Publisher, Subjects, TicketCreatedEvent } from '@sdm888tickets/common';

export default class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
};
