import { Test, TestingModule } from '@nestjs/testing';
import { ServiceOrderStatus, Priority } from '@prisma/client';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import { PartOrderItem, ServiceOrderItem } from '@application/ports/service-order.repository.port';

import { ServiceOrderRepository } from './service-order.repository';
import { PrismaService } from '../database/prisma.service';

const serviceOrder = new ServiceOrder({
  customerId: 'customer-id',
  vehicleId: 'vehicle-id',
  description: 'Regular maintenance',
  totalAmount: 100.0,
});

const makeServiceData = (
  serviceItems: ServiceOrderItem[] = [],
  partItems: PartOrderItem[] = [],
) => ({
  id: 'order-id',
  orderNumber: 'OS000001',
  customerId: 'customer-id',
  vehicleId: 'vehicle-id',
  status: ServiceOrderStatus.RECEIVED,
  priority: Priority.NORMAL,
  description: 'Regular maintenance',
  diagnosis: null,
  observations: null,
  estimatedCompletion: null,
  totalAmount: 100.0,
  createdBy: null,
  assignedTo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  serviceItems,
  partItems,
});

const partItem = {
  partId: 'service-id',
  quantity: 2,
  unitPrice: 100.0,
};

const serviceItem = {
  serviceId: 'service-id',
  quantity: 2,
  unitPrice: 100.0,
};

describe('ServiceOrderRepository', () => {
  let repository: ServiceOrderRepository;

  const mockPrismaServiceDefault = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  };
  const mockPrismaService = {
    serviceOrder: mockPrismaServiceDefault,
    serviceOrderItem: mockPrismaServiceDefault,
    partOrderItem: mockPrismaServiceDefault,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceOrderRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ServiceOrderRepository>(ServiceOrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a service order', async () => {
      const createdData = makeServiceData();

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue(createdData);

      const result = await repository.create(serviceOrder);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockPrismaService.serviceOrder.create).toHaveBeenCalled();
    });

    it('should create a service order with service items', async () => {
      const createdData = makeServiceData([serviceItem]);

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue(createdData);

      const result = await repository.create(serviceOrder, [serviceItem]);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockPrismaService.serviceOrder.create).toHaveBeenCalled();
    });

    it('should create a service order with part items', async () => {
      const createdData = makeServiceData(undefined, [partItem]);

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.create.mockResolvedValue(createdData);

      const result = await repository.create(serviceOrder, undefined, [partItem]);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockPrismaService.serviceOrder.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a service order by id', async () => {
      const input = 'order-id';
      const serviceOrderData = makeServiceData();

      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(serviceOrderData);

      const result = await repository.findById(input);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockPrismaService.serviceOrder.findUnique).toHaveBeenCalledWith({
        where: { id: input },
        include: expect.any(Object),
      });
    });

    it('should return null if service order not found', async () => {
      const input = 'non-existent-id';
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(null);

      const result = await repository.findById(input);

      expect(result).toBeNull();
    });
  });

  describe('findByOrderNumber', () => {
    it('should find a service order by order number', async () => {
      const input = 'OS000001';
      const serviceOrderData = makeServiceData();

      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(serviceOrderData);

      const result = await repository.findByOrderNumber(input);

      expect(result).toBeInstanceOf(ServiceOrder);
    });

    it('should return null if service order not found', async () => {
      const input = 'OS000002';
      mockPrismaService.serviceOrder.findUnique.mockResolvedValue(null);

      const result = await repository.findByOrderNumber(input);

      expect(result).toBeNull();
    });
  });

  describe('findByCustomerId', () => {
    it('should find service orders by customer id', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);

      const result = await repository.findByCustomerId('customer-id');

      expect(result[0]).toBeInstanceOf(ServiceOrder);
    });
  });

  describe('findByVehicleId', () => {
    it('should find service orders by vehicle id', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);

      const result = await repository.findByVehicleId('vehicle-id');

      expect(result[0]).toBeInstanceOf(ServiceOrder);
    });
  });

  describe('findByStatus', () => {
    it('should find service orders by status', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);

      const result = await repository.findByStatus(ServiceOrderStatus.RECEIVED);

      expect(result[0]).toBeInstanceOf(ServiceOrder);
    });
  });

  describe('findAll', () => {
    it('should find all service orders with pagination', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);
      mockPrismaService.serviceOrder.count.mockResolvedValue(1);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all service orders without pagination', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);
      mockPrismaService.serviceOrder.count.mockResolvedValue(1);

      const result = await repository.findAll();

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should find all received service orders', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);
      mockPrismaService.serviceOrder.count.mockResolvedValue(1);

      const result = await repository.findAll({ status: ServiceOrderStatus.RECEIVED });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should find all service orders by customer id', async () => {
      const serviceOrdersData = [makeServiceData()];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(serviceOrdersData);
      mockPrismaService.serviceOrder.count.mockResolvedValue(1);

      const result = await repository.findAll({ customerId: 'customer-id' });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update service order', async () => {
      const updatedData = {
        ...makeServiceData(),
        description: 'Regular maintenance updated',
      };

      mockPrismaService.serviceOrder.update.mockResolvedValue(updatedData);

      const result = await repository.update('order-id', serviceOrder);

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockPrismaService.serviceOrder.update).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update service order status', async () => {
      const updatedData = {
        ...makeServiceData(),
        status: ServiceOrderStatus.IN_PROGRESS,
      };

      mockPrismaService.serviceOrder.update.mockResolvedValue(updatedData);

      const result = await repository.updateStatus(
        'order-id',
        ServiceOrderStatus.IN_PROGRESS,
        'Started work',
      );

      expect(result).toBeInstanceOf(ServiceOrder);
      expect(mockPrismaService.serviceOrder.update).toHaveBeenCalled();
    });
  });

  describe('addServiceItem', () => {
    it('should add a service item to a service order', async () => {
      const createdData = makeServiceData();

      mockPrismaService.serviceOrderItem.create.mockResolvedValue(createdData);

      await repository.addServiceItem('order-id', serviceItem);

      expect(mockPrismaService.serviceOrderItem.create).toHaveBeenCalled();
    });
  });

  describe('addPartItem', () => {
    it('should add a part item to a service order', async () => {
      const createdData = makeServiceData();

      mockPrismaService.partOrderItem.create.mockResolvedValue(createdData);

      await repository.addPartItem('order-id', partItem);

      expect(mockPrismaService.partOrderItem.create).toHaveBeenCalled();
    });
  });

  describe('getAverageExecutionTime', () => {
    it('should return 0 when there are no completed orders', async () => {
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);

      const result = await repository.getAverageExecutionTime();

      expect(result).toBe(0);
    });

    it('should calculate the correct average execution time in hours', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1000 * 60 * 60);
      const threeHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 3);

      const mockCompletedOrders = [
        { createdAt: oneHourAgo, actualCompletion: now },
        { createdAt: threeHoursAgo, actualCompletion: now },
      ];

      mockPrismaService.serviceOrder.findMany.mockResolvedValue(mockCompletedOrders);

      const result = await repository.getAverageExecutionTime();

      expect(result).toBe(2);
    });
  });

  describe('getExecutionMetrics', () => {
    it('should return metrics with zero values when no data exists', async () => {
      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.findMany.mockResolvedValueOnce([]);
      mockPrismaService.serviceOrder.groupBy.mockResolvedValueOnce([]);

      const result = await repository.getExecutionMetrics();

      expect(result).toEqual({
        totalServiceOrders: 0,
        completedServiceOrders: 0,
        averageExecutionTimeInHours: 0,
        servicesByStatus: [],
      });
    });

    it('should calculate metrics correctly without filters', async () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);

      mockPrismaService.serviceOrder.count.mockResolvedValueOnce(10);
      mockPrismaService.serviceOrder.count.mockResolvedValueOnce(5);
      mockPrismaService.serviceOrder.findMany.mockResolvedValueOnce([
        { createdAt: twoHoursAgo, actualCompletion: now },
      ]);

      mockPrismaService.serviceOrder.groupBy.mockResolvedValueOnce([
        { status: ServiceOrderStatus.COMPLETED, _count: { status: 5 } },
        { status: ServiceOrderStatus.RECEIVED, _count: { status: 5 } },
      ]);

      const result = await repository.getExecutionMetrics();

      expect(result.totalServiceOrders).toBe(10);
      expect(result.completedServiceOrders).toBe(5);
      expect(result.averageExecutionTimeInHours).toBe(2);
      expect(result.servicesByStatus).toHaveLength(2);
      expect(result.servicesByStatus).toEqual(
        expect.arrayContaining([
          { status: ServiceOrderStatus.COMPLETED, count: 5 },
          { status: ServiceOrderStatus.RECEIVED, count: 5 },
        ]),
      );
    });

    it('should apply date filters correctly to prisma queries', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      mockPrismaService.serviceOrder.count.mockResolvedValue(0);
      mockPrismaService.serviceOrder.findMany.mockResolvedValue([]);
      mockPrismaService.serviceOrder.groupBy.mockResolvedValue([]);

      await repository.getExecutionMetrics({ startDate, endDate });

      const expectedWhere = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      expect(mockPrismaService.serviceOrder.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );

      expect(mockPrismaService.serviceOrder.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
    });
  });

  describe('delete', () => {
    it('should delete a service order', async () => {
      const input = 'order-id';
      await repository.delete(input);

      expect(mockPrismaService.serviceOrder.delete).toHaveBeenCalledWith({
        where: { id: input },
      });
    });
  });
});
