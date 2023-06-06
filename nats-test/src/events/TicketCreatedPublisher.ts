import Publisher from './Publisher';
import { TicketCreatedEvent } from './TicketCreatedEvent';
import { Subjects } from './Subjects';

export default class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
