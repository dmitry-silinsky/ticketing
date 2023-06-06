import {ExpirationCompleteEvent, Publisher, Subjects} from '@sdm888tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
