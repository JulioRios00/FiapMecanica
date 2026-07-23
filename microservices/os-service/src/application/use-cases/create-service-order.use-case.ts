import { Injectable } from '@nestjs/common';
import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { DomainEventPublisherPort } from '../ports/domain-event-publisher.port';
import { buildOSCreatedEvent } from '../../domain/events/os-events';

interface Input {
  description: string;
  correlationId?: string;
}

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly repository: ServiceOrderRepositoryPort,
    private readonly eventPublisher: DomainEventPublisherPort,
  ) {}

  async execute(input: Input): Promise<ServiceOrder> {
    const order = new ServiceOrder({
      description: input.description,
      status: 'OPEN',
    });

    const created = await this.repository.create(order);
    await this.eventPublisher.publish(buildOSCreatedEvent(created, input.correlationId));
    return created;
  }
}

