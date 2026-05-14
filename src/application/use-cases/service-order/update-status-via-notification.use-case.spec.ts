import { Test, TestingModule } from '@nestjs/testing';
import { UpdateStatusViaNotificationUseCase } from './update-status-via-notification.use-case';
import { ServiceOrderRepositoryPort } from '@application/ports/service-order.repository.port';
import { NotificationPort } from '@application/ports/notification.port';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

describe('UpdateStatusViaNotificationUseCase', () => {
  let useCase: UpdateStatusViaNotificationUseCase;
  let serviceOrderRepository: jest.Mocked<ServiceOrderRepositoryPort>;
  let notificationService: jest.Mocked<NotificationPort>;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockNotification = {
      sendStatusUpdateNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStatusViaNotificationUseCase,
        {
          provide: ServiceOrderRepositoryPort,
          useValue: mockRepository,
        },
        {
          provide: NotificationPort,
          useValue: mockNotification,
        },
      ],
    }).compile();

    useCase = module.get<UpdateStatusViaNotificationUseCase>(UpdateStatusViaNotificationUseCase);
    serviceOrderRepository = module.get(ServiceOrderRepositoryPort);
    notificationService = module.get(NotificationPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update status and send notification', async () => {
    const mockServiceOrder = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.RECEIVED,
      totalAmount: 150,
    });

    serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
    serviceOrderRepository.updateStatus.mockResolvedValue(mockServiceOrder);
    notificationService.sendStatusUpdateNotification.mockResolvedValue(undefined);

    const result = await useCase.execute({
      serviceOrderId: '123',
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      senderEmail: 'mechanic@workshop.com',
      message: 'Starting diagnosis',
    });

    expect(serviceOrderRepository.findById).toHaveBeenCalledWith('123');
    expect(serviceOrderRepository.updateStatus).toHaveBeenCalledWith(
      '123',
      ServiceOrderStatus.IN_DIAGNOSIS,
      'Starting diagnosis',
    );
    expect(notificationService.sendStatusUpdateNotification).toHaveBeenCalledWith({
      serviceOrderId: '123',
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      senderEmail: 'mechanic@workshop.com',
      message: 'Starting diagnosis',
    });
    expect(result).toBeDefined();
  });

  it('should update status without message', async () => {
    const mockServiceOrder = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.RECEIVED,
      totalAmount: 150,
    });

    serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);
    serviceOrderRepository.updateStatus.mockResolvedValue(mockServiceOrder);
    notificationService.sendStatusUpdateNotification.mockResolvedValue(undefined);

    await useCase.execute({
      serviceOrderId: '123',
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      senderEmail: 'mechanic@workshop.com',
    });

    expect(serviceOrderRepository.updateStatus).toHaveBeenCalledWith(
      '123',
      ServiceOrderStatus.IN_DIAGNOSIS,
      'Status updated via notification by mechanic@workshop.com',
    );
  });

  it('should throw NotFoundException when service order not found', async () => {
    serviceOrderRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        serviceOrderId: '999',
        newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
        senderEmail: 'mechanic@workshop.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException on invalid status transition', async () => {
    const mockServiceOrder = new ServiceOrder({
      id: '123',
      customerId: 'customer-123',
      vehicleId: 'vehicle-123',
      description: 'Oil change needed',
      status: ServiceOrderStatus.RECEIVED,
      totalAmount: 150,
    });

    serviceOrderRepository.findById.mockResolvedValue(mockServiceOrder);

    await expect(
      useCase.execute({
        serviceOrderId: '123',
        newStatus: ServiceOrderStatus.COMPLETED,
        senderEmail: 'mechanic@workshop.com',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
