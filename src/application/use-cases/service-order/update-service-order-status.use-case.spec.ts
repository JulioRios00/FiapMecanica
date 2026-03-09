import { Test, TestingModule } from '@nestjs/testing';
import { UpdateServiceOrderStatusUseCase } from './update-service-order-status.use-case';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { EmailServicePort } from '@application/ports/email.service.port';
import { NotFoundException } from '@nestjs/common';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

describe('UpdateServiceOrderStatusUseCase', () => {
  let useCase: UpdateServiceOrderStatusUseCase;
  let serviceOrderRepository: jest.Mocked<ServiceOrderRepositoryPort>;

  const mockServiceOrder = new ServiceOrder({
    id: '123',
    orderNumber: 'OS000001',
    customerId: 'customer-123',
    vehicleId: 'vehicle-123',
    description: 'Oil change needed',
    status: ServiceOrderStatus.RECEIVED,
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockCustomerRepo = {
      findById: jest.fn(),
    };

    const mockEmailService = {
      sendStatusUpdateEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateServiceOrderStatusUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockRepository,
        },
        {
          provide: CustomerRepositoryPort,
          useValue: mockCustomerRepo,
        },
        {
          provide: EmailServicePort,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateServiceOrderStatusUseCase>(UpdateServiceOrderStatusUseCase);
    serviceOrderRepository = module.get(ServiceOrderRepositoryPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update service order status', async () => {
    serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
    serviceOrderRepository.updateStatus.mockResolvedValue(mockServiceOrder);

    const result = await useCase.execute('123', ServiceOrderStatus.IN_DIAGNOSIS);

    expect(serviceOrderRepository.findById).toHaveBeenCalledWith('123');
    expect(serviceOrderRepository.updateStatus).toHaveBeenCalledWith(
      '123',
      ServiceOrderStatus.IN_DIAGNOSIS,
      undefined,
    );
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when service order not found', async () => {
    serviceOrderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('999', ServiceOrderStatus.IN_DIAGNOSIS)).rejects.toThrow(
      NotFoundException,
    );
  });
});
