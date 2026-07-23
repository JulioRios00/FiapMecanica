import { DomainEvent } from '../../domain/events/domain-event';

export abstract class DomainEventPublisherPort {
  abstract publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
}

