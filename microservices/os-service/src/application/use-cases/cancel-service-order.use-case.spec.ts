import { NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { DomainEventPublisherPort } from '../ports/domain-event-publisher.port';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { CancelServiceOrderUseCase } from './cancel-service-order.use-case';

describe('CancelServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepositoryPort>;
  let eventPublisher: jest.Mocked<DomainEventPublisherPort>;
  let useCase: CancelServiceOrderUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      listHistory: jest.fn(),
    };
    eventPublisher = { publish: jest.fn() };
    useCase = new CancelServiceOrderUseCase(repository, eventPublisher);
  });

  it('throws NotFoundException when the service order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing' })).rejects.toThrow(NotFoundException);
    expect(repository.updateStatus).not.toHaveBeenCalled();
    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });

  it('refuses to cancel an already completed order', async () => {
    const existing = new ServiceOrder({
      id: 'os-1',
      description: 'Replace brake pads',
      status: 'IN_EXECUTION',
    });
    existing.updateStatus('COMPLETED');
    repository.findById.mockResolvedValue(existing);

    await expect(useCase.execute({ id: 'os-1' })).rejects.toThrow(
      'Cannot cancel a completed service order',
    );
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });

  it('cancels the order and publishes a v1.OSCancelled event', async () => {
    const existing = new ServiceOrder({
      id: 'os-1',
      orderNumber: 'OS-0001',
      description: 'Replace brake pads',
      status: 'OPEN',
    });
    const cancelled = new ServiceOrder({
      id: 'os-1',
      orderNumber: 'OS-0001',
      description: 'Replace brake pads',
      status: 'CANCELLED',
    });
    repository.findById.mockResolvedValue(existing);
    repository.updateStatus.mockResolvedValue(cancelled);

    const result = await useCase.execute({
      id: 'os-1',
      reason: 'Customer request',
      correlationId: 'corr-1',
    });

    expect(repository.updateStatus).toHaveBeenCalledWith('os-1', 'CANCELLED', 'Customer request');
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'v1.OSCancelled',
        aggregateId: 'os-1',
        correlationId: 'corr-1',
      }),
    );
    expect(result).toBe(cancelled);
  });
});
