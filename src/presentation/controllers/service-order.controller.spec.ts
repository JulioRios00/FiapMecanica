import { UpdateServiceOrderStatusUseCase } from '@application/use-cases/service-order/update-service-order-status.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderStatus } from '@prisma/client';
import { ListServiceOrdersUseCase } from '@application/use-cases/service-order/list-service-orders.use-case';
import { GetServiceOrderUseCase } from '@application/use-cases/service-order/get-service-order.use-case';
import { GetServiceExecutionMetricsUseCase } from '@application/use-cases/service-order/get-service-execution-metrics.use-case';
import { CreateServiceOrderUseCase } from '@application/use-cases/service-order/create-service-order.use-case';
import { ApproveServiceOrderUseCase } from '@application/use-cases/service-order/approve-service-order.use-case';
import { UpdateStatusViaNotificationUseCase } from '@application/use-cases/service-order/update-status-via-notification.use-case';

import { ServiceOrderController } from './service-order.controller';

describe('ServiceOrderController', () => {
  let controller: ServiceOrderController;

  const mockCreateServiceOrderUseCase = {
    execute: jest.fn(),
  };

  const mockGetServiceOrderUseCase = {
    execute: jest.fn(),
  };

  const mockListServiceOrdersUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateServiceOrderStatusUseCase = {
    execute: jest.fn(),
  };

  const mockApproveServiceOrderUseCase = {
    execute: jest.fn(),
  };

  const mockGetServiceExecutionMetricsUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateStatusViaNotificationUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceOrderController],
      providers: [
        {
          provide: CreateServiceOrderUseCase,
          useValue: mockCreateServiceOrderUseCase,
        },
        {
          provide: GetServiceOrderUseCase,
          useValue: mockGetServiceOrderUseCase,
        },
        {
          provide: ListServiceOrdersUseCase,
          useValue: mockListServiceOrdersUseCase,
        },
        {
          provide: UpdateServiceOrderStatusUseCase,
          useValue: mockUpdateServiceOrderStatusUseCase,
        },
        {
          provide: ApproveServiceOrderUseCase,
          useValue: mockApproveServiceOrderUseCase,
        },
        {
          provide: GetServiceExecutionMetricsUseCase,
          useValue: mockGetServiceExecutionMetricsUseCase,
        },
        {
          provide: UpdateStatusViaNotificationUseCase,
          useValue: mockUpdateStatusViaNotificationUseCase,
        },
      ],
    }).compile();

    controller = module.get<ServiceOrderController>(ServiceOrderController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service order', async () => {
      const createDto = {
        customerId: 'customer-id',
        vehicleId: 'vehicle-id',
        description: 'Regular maintenance',
        services: [{ serviceId: 'service-id', quantity: 1 }],
      };

      const serviceOrder = { id: 'order-id', totalAmount: 100.0 };
      mockCreateServiceOrderUseCase.execute.mockResolvedValue(serviceOrder);

      const result = await controller.create(createDto);

      expect(result).toEqual(serviceOrder);
      expect(mockCreateServiceOrderUseCase.execute).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should list service orders without filters', async () => {
      const serviceOrders = [{ id: 'order-1' }];
      mockListServiceOrdersUseCase.execute.mockResolvedValue(serviceOrders);

      const result = await controller.findAll();

      expect(result).toEqual(serviceOrders);
      expect(mockListServiceOrdersUseCase.execute).toHaveBeenCalledWith({
        status: undefined,
        customerId: undefined,
        page: undefined,
        limit: undefined,
        excludeCompleted: undefined,
        sortByPriority: undefined,
      });
    });

    it('should list service orders with filters', async () => {
      const serviceOrders = [{ id: 'order-1' }];
      mockListServiceOrdersUseCase.execute.mockResolvedValue(serviceOrders);

      const result = await controller.findAll(
        ServiceOrderStatus.RECEIVED,
        'customer-id',
        '1',
        '10',
        'true',
      );

      expect(result).toEqual(serviceOrders);
      expect(mockListServiceOrdersUseCase.execute).toHaveBeenCalledWith({
        status: ServiceOrderStatus.RECEIVED,
        customerId: 'customer-id',
        page: 1,
        limit: 10,
        excludeCompleted: true,
        sortByPriority: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should get a service order by id', async () => {
      const serviceOrder = { id: 'order-id' };
      mockGetServiceOrderUseCase.execute.mockResolvedValue(serviceOrder);

      const result = await controller.findOne('order-id');

      expect(result).toEqual(serviceOrder);
      expect(mockGetServiceOrderUseCase.execute).toHaveBeenCalledWith('order-id');
    });
  });

  describe('updateStatus', () => {
    it('should update service order status', async () => {
      const mockNewStatus = ServiceOrderStatus.IN_PROGRESS;
      const updateStatusDto = {
        status: mockNewStatus,
        reason: 'Started work',
      };

      const serviceOrder = { id: 'order-id', status: mockNewStatus };
      mockUpdateServiceOrderStatusUseCase.execute.mockResolvedValue(serviceOrder);

      const result = await controller.updateStatus('order-id', updateStatusDto);

      expect(result).toEqual(serviceOrder);
      expect(mockUpdateServiceOrderStatusUseCase.execute).toHaveBeenCalledWith(
        'order-id',
        updateStatusDto.status,
        updateStatusDto.reason,
      );
    });
  });

  describe('approve', () => {
    it('should approve a service order', async () => {
      const approveDto = {
        approvedBy: 'customer-name',
        approvedAmount: 100.0,
      };

      const serviceOrder = { id: 'order-id', status: ServiceOrderStatus.APPROVED };
      mockApproveServiceOrderUseCase.execute.mockResolvedValue(serviceOrder);

      const result = await controller.approve('order-id', approveDto);

      expect(result).toEqual(serviceOrder);
      expect(mockApproveServiceOrderUseCase.execute).toHaveBeenCalledWith(
        'order-id',
        approveDto.approvedBy,
        approveDto.approvedAmount,
        true,
        undefined,
      );
    });

    it('should reject a service order', async () => {
      const approveDto = {
        approvedBy: 'customer-name',
        approved: false,
        reason: 'Too expensive',
      };

      const serviceOrder = { id: 'order-id', status: ServiceOrderStatus.CANCELLED };
      mockApproveServiceOrderUseCase.execute.mockResolvedValue(serviceOrder);

      const result = await controller.approve('order-id', approveDto);

      expect(result).toEqual(serviceOrder);
      expect(mockApproveServiceOrderUseCase.execute).toHaveBeenCalledWith(
        'order-id',
        approveDto.approvedBy,
        undefined,
        false,
        'Too expensive',
      );
    });
  });

  describe('getMetrics', () => {
    it('should get service execution metrics without filters', async () => {
      const metrics = {
        totalServiceOrders: 10,
        completedServiceOrders: 8,
        averageExecutionTimeInHours: 2.5,
        averageExecutionTimeFormatted: '2h 30min',
        servicesByStatus: [],
      };

      mockGetServiceExecutionMetricsUseCase.execute.mockResolvedValue(metrics);

      const result = await controller.getMetrics();

      expect(result).toEqual(metrics);
      expect(mockGetServiceExecutionMetricsUseCase.execute).toHaveBeenCalledWith({});
    });

    it('should get service execution metrics with filters', async () => {
      const metrics = {
        totalServiceOrders: 5,
        completedServiceOrders: 4,
        averageExecutionTimeInHours: 1.5,
        averageExecutionTimeFormatted: '1h 30min',
        servicesByStatus: [],
      };

      mockGetServiceExecutionMetricsUseCase.execute.mockResolvedValue(metrics);

      const result = await controller.getMetrics('2024-01-01', '2024-12-31');

      expect(result).toEqual(metrics);
      expect(mockGetServiceExecutionMetricsUseCase.execute).toHaveBeenCalledWith({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });
    });
  });
});
