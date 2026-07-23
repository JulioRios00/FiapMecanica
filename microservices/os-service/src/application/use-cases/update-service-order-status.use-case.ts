import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceOrderStatus } from '../../domain/entities/service-order.entity';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { DomainEventPublisherPort } from '../ports/domain-event-publisher.port';
import { buildOSStatusUpdatedEvent } from '../../domain/events/os-events';

interface Input {
  id: string;
  status: ServiceOrderStatus;
  reason?: string;
  correlationId?: string;
}

@Injectable()
export class UpdateServiceOrderStatusUseCase {
  constructor(
    private readonly repository: ServiceOrderRepositoryPort,
    private readonly eventPublisher: DomainEventPublisherPort,
  ) {}

  async execute(input: Input) {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Service order not found');
    }

    existing.updateStatus(input.status);
    const updated = await this.repository.updateStatus(input.id, input.status, input.reason);
    await this.eventPublisher.publish(buildOSStatusUpdatedEvent(updated, input.correlationId));
    return updated;
  }
}

