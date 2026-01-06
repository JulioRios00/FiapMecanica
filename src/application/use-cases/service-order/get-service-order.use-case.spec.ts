import { Test, TestingModule } from '@nestjs/testing';
import { GetServiceOrderUseCase } from './get-service-order.use-case';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

describe('GetServiceOrderUseCase', () => {
  let useCase: GetServiceOrderUseCase;
  let serviceOrderRepository: jest.Mocked<ServiceOrderRepositoryPort>;

  const mockServiceOrder = new ServiceOrder({
    id: '123',
    orderNumber: 'OS-001',
    customerId: 'customer-123',
    vehicleId: 'vehicle-123',
    status: ServiceOrderStatus.RECEIVED,
    description: 'Oil change needed',
    totalAmount: 150,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetServiceOrderUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetServiceOrderUseCase>(GetServiceOrderUseCase);
    serviceOrderRepository = module.get(ServiceOrderRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a service order when found', async () => {
    serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

    const result = await useCase.execute('123');

    expect(result).toEqual(mockServiceOrder);
    expect(serviceOrderRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should throw NotFoundException when service order not found', async () => {
    serviceOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999')).rejects.toThrow(NotFoundException);
  });
});
