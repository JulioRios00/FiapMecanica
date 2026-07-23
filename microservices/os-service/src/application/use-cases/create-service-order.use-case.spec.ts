import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { DomainEventPublisherPort } from '../ports/domain-event-publisher.port';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { CreateServiceOrderUseCase } from './create-service-order.use-case';

describe('CreateServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepositoryPort>;
  let eventPublisher: jest.Mocked<DomainEventPublisherPort>;
  let useCase: CreateServiceOrderUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      listHistory: jest.fn(),
    };
    eventPublisher = { publish: jest.fn() };
    useCase = new CreateServiceOrderUseCase(repository, eventPublisher);
  });

  it('creates an OPEN service order and publishes a v1.OSCreated event', async () => {
    const created = new ServiceOrder({
      id: 'os-1',
      orderNumber: 'OS-0001',
      description: 'Replace brake pads',
      status: 'OPEN',
    });
    repository.create.mockResolvedValue(created);

    const result = await useCase.execute({
      description: 'Replace brake pads',
      correlationId: 'corr-1',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ getDescription: expect.any(Function) }),
    );
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'v1.OSCreated',
        aggregateId: 'os-1',
        correlationId: 'corr-1',
      }),
    );
    expect(result).toBe(created);
  });

  it('propagates domain validation errors before touching the repository', async () => {
    await expect(useCase.execute({ description: 'no' })).rejects.toThrow(
      'Description must have at least 5 characters',
    );

    expect(repository.create).not.toHaveBeenCalled();
    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });
});
