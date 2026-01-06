import { Test, TestingModule } from '@nestjs/testing';
import { ApproveServiceOrderUseCase } from './approve-service-order.use-case';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

describe('ApproveServiceOrderUseCase', () => {
  let useCase: ApproveServiceOrderUseCase;
  let serviceOrderRepository: jest.Mocked<ServiceOrderRepositoryPort>;

  const mockServiceOrder = new ServiceOrder({
    id: '123',
    customerId: 'customer-123',
    vehicleId: 'vehicle-123',
    description: 'Oil change needed',
    status: ServiceOrderStatus.AWAITING_APPROVAL,
    totalAmount: 150,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApproveServiceOrderUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ApproveServiceOrderUseCase>(ApproveServiceOrderUseCase);
    serviceOrderRepository = module.get(ServiceOrderRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should approve service order', async () => {
    serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
    serviceOrderRepository.update.mockResolvedValue(mockServiceOrder);

    const result = await useCase.execute('123', 'customer-123');

    expect(serviceOrderRepository.findById).toHaveBeenCalledWith('123');
    expect(serviceOrderRepository.update).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should approve service order with custom amount', async () => {
    const mockAwaitingApproval = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      totalAmount: 150,
    });
    
    serviceOrderRepository.findById.mockResolvedValue(mockAwaitingApproval);
    serviceOrderRepository.update.mockResolvedValue(mockAwaitingApproval);

    const result = await useCase.execute('123', 'customer-123', 200);

    expect(serviceOrderRepository.findById).toHaveBeenCalledWith('123');
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when service order not found', async () => {
    serviceOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', 'customer-123')).rejects.toThrow(NotFoundException);
  });
});
