import { Test, TestingModule } from '@nestjs/testing';
import { ApproveServiceOrderUseCase } from './approve-service-order.use-case';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

describe('ApproveServiceOrderUseCase', () => {
  let useCase: ApproveServiceOrderUseCase;
  let serviceOrderRepository: jest.Mocked<ServiceOrderRepositoryPort>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
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
    const mockServiceOrder = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      totalAmount: 150,
    });

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

  it('should reject service order when approved is false', async () => {
    const mockAwaitingApproval = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      totalAmount: 150,
    });

    serviceOrderRepository.findById.mockResolvedValue(mockAwaitingApproval);
    serviceOrderRepository.updateStatus.mockResolvedValue(mockAwaitingApproval);

    const result = await useCase.execute('123', 'customer-123', undefined, false, 'Too expensive');

    expect(serviceOrderRepository.findById).toHaveBeenCalledWith('123');
    expect(serviceOrderRepository.updateStatus).toHaveBeenCalledWith(
      '123',
      ServiceOrderStatus.CANCELLED,
      'Too expensive',
    );
    expect(result).toBeDefined();
  });

  it('should reject service order without reason', async () => {
    const mockAwaitingApproval = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      totalAmount: 150,
    });

    serviceOrderRepository.findById.mockResolvedValue(mockAwaitingApproval);
    serviceOrderRepository.updateStatus.mockResolvedValue(mockAwaitingApproval);

    const result = await useCase.execute('123', 'customer-123', undefined, false);

    expect(serviceOrderRepository.updateStatus).toHaveBeenCalledWith(
      '123',
      ServiceOrderStatus.CANCELLED,
      'Rejected by customer-123',
    );
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when service order not found', async () => {
    serviceOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', 'customer-123')).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when order is not in AWAITING_APPROVAL status', async () => {
    const mockReceived = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.RECEIVED,
      totalAmount: 150,
    });

    serviceOrderRepository.findById.mockResolvedValue(mockReceived);

    await expect(useCase.execute('123', 'customer-123')).rejects.toThrow(BadRequestException);
  });
});
