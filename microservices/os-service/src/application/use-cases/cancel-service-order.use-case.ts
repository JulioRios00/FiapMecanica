import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { DomainEventPublisherPort } from '../ports/domain-event-publisher.port';
import { buildOSCancelledEvent } from '../../domain/events/os-events';

interface Input {
  id: string;
  reason?: string;
  correlationId?: string;
}

@Injectable()
export class CancelServiceOrderUseCase {
  constructor(
    private readonly repository: ServiceOrderRepositoryPort,
    private readonly eventPublisher: DomainEventPublisherPort,
  ) {}

  async execute(input: Input) {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Service order not found');
    }

    existing.forceCancel();
    const updated = await this.repository.updateStatus(input.id, 'CANCELLED', input.reason);
    await this.eventPublisher.publish(buildOSCancelledEvent(updated, input.correlationId));
    return updated;
  }
}

