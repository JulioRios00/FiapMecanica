import { NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { DomainEventPublisherPort } from '../ports/domain-event-publisher.port';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { UpdateServiceOrderStatusUseCase } from './update-service-order-status.use-case';

describe('UpdateServiceOrderStatusUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepositoryPort>;
  let eventPublisher: jest.Mocked<DomainEventPublisherPort>;
  let useCase: UpdateServiceOrderStatusUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      listHistory: jest.fn(),
    };
    eventPublisher = { publish: jest.fn() };
    useCase = new UpdateServiceOrderStatusUseCase(repository, eventPublisher);
  });

  it('throws NotFoundException when the service order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'missing', status: 'AWAITING_QUOTE' }),
    ).rejects.toThrow(NotFoundException);
    expect(repository.updateStatus).not.toHaveBeenCalled();
    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });

  it('rejects an invalid status transition without touching the repository write path', async () => {
    const existing = new ServiceOrder({
      id: 'os-1',
      description: 'Replace brake pads',
      status: 'OPEN',
    });
    repository.findById.mockResolvedValue(existing);

    await expect(
      useCase.execute({ id: 'os-1', status: 'IN_EXECUTION' }),
    ).rejects.toThrow('Invalid status transition: OPEN -> IN_EXECUTION');
    expect(repository.updateStatus).not.toHaveBeenCalled();
    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });

  it('persists a valid transition and publishes a v1.OSStatusUpdated event', async () => {
    const existing = new ServiceOrder({
      id: 'os-1',
      orderNumber: 'OS-0001',
      description: 'Replace brake pads',
      status: 'OPEN',
    });
    const updated = new ServiceOrder({
      id: 'os-1',
      orderNumber: 'OS-0001',
      description: 'Replace brake pads',
      status: 'AWAITING_QUOTE',
    });
    repository.findById.mockResolvedValue(existing);
    repository.updateStatus.mockResolvedValue(updated);

    const result = await useCase.execute({
      id: 'os-1',
      status: 'AWAITING_QUOTE',
      reason: 'Diagnosis complete',
      correlationId: 'corr-1',
    });

    expect(repository.updateStatus).toHaveBeenCalledWith(
      'os-1',
      'AWAITING_QUOTE',
      'Diagnosis complete',
    );
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'v1.OSStatusUpdated',
        aggregateId: 'os-1',
        correlationId: 'corr-1',
        payload: { orderNumber: 'OS-0001', status: 'AWAITING_QUOTE' },
      }),
    );
    expect(result).toBe(updated);
  });
});
