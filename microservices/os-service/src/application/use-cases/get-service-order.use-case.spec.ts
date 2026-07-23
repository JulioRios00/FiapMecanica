import { NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '../../domain/entities/service-order.entity';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';
import { GetServiceOrderUseCase } from './get-service-order.use-case';

describe('GetServiceOrderUseCase', () => {
  let repository: jest.Mocked<ServiceOrderRepositoryPort>;
  let useCase: GetServiceOrderUseCase;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      listHistory: jest.fn(),
    };
    useCase = new GetServiceOrderUseCase(repository);
  });

  it('returns the service order when found', async () => {
    const order = new ServiceOrder({ id: 'os-1', description: 'Replace brake pads' });
    repository.findById.mockResolvedValue(order);

    const result = await useCase.execute('os-1');

    expect(repository.findById).toHaveBeenCalledWith('os-1');
    expect(result).toBe(order);
  });

  it('throws NotFoundException when the service order does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
