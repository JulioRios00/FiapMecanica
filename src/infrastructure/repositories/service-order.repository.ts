import { Injectable } from '@nestjs/common';
import { ServiceOrderStatus } from '@prisma/client';
import { ServiceOrder } from '@domain/entities/service-order.entity';
import {
  ServiceOrderRepositoryPort,
  ServiceOrderItem,
  PartOrderItem,
  ServiceOrderWithDetails,
} from '@application/ports/service-order.repository.port';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ServiceOrderRepository implements ServiceOrderRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    serviceOrder: ServiceOrder,
    serviceItems?: ServiceOrderItem[],
    partItems?: PartOrderItem[],
  ): Promise<ServiceOrderWithDetails> {
    const data = serviceOrder.toJSON();

    // Generate sequential order number
    const count = await this.prisma.serviceOrder.count();
    const orderNumber = `OS${String(count + 1).padStart(6, '0')}`;

    const created = await this.prisma.serviceOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        status: data.status,
        priority: data.priority,
        description: data.description,
        diagnosis: data.diagnosis,
        observations: data.observations,
        estimatedCompletion: data.estimatedCompletion,
        totalAmount: data.totalAmount,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo,
        serviceItems: serviceItems
          ? {
              create: serviceItems.map((item) => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity,
                status: 'PENDING',
              })),
            }
          : undefined,
        partItems: partItems
          ? {
              create: partItems.map((item) => ({
                partId: item.partId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity,
                status: 'PENDING',
              })),
            }
          : undefined,
        statusHistory: {
          create: {
            newStatus: data.status,
            changedBy: data.createdBy,
          },
        },
      },
      include: {
        serviceItems: true,
        partItems: true,
      },
    });

    return this.mapToServiceOrder(created);
  }

  async findById(id: string): Promise<ServiceOrderWithDetails | null> {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        serviceItems: {
          include: { service: true },
        },
        partItems: {
          include: { part: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!serviceOrder) return null;

    return this.mapToServiceOrder(serviceOrder);
  }

  async findByOrderNumber(
    orderNumber: string,
  ): Promise<ServiceOrderWithDetails | null> {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        vehicle: true,
        serviceItems: {
          include: { service: true },
        },
        partItems: {
          include: { part: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!serviceOrder) return null;

    return this.mapToServiceOrder(serviceOrder);
  }

  async findByCustomerId(customerId: string): Promise<ServiceOrder[]> {
    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return serviceOrders.map((so) => this.mapToServiceOrder(so));
  }

  async findByVehicleId(vehicleId: string): Promise<ServiceOrder[]> {
    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: { vehicleId },
      orderBy: { createdAt: 'desc' },
    });

    return serviceOrders.map((so) => this.mapToServiceOrder(so));
  }

  async findByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]> {
    const serviceOrders = await this.prisma.serviceOrder.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });

    return serviceOrders.map((so) => this.mapToServiceOrder(so));
  }

  async findAll(params?: {
    status?: ServiceOrderStatus;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ServiceOrderWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.status) where.status = params.status;
    if (params?.customerId) where.customerId = params.customerId;

    const [serviceOrders, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          vehicle: true,
          serviceItems: {
            include: { service: true },
          },
          partItems: {
            include: { part: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    const data = serviceOrders.map((so) => this.mapToServiceOrder(so));

    return { data, total, page, limit };
  }

  async update(id: string, serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const data = serviceOrder.toJSON();
    const updated = await this.prisma.serviceOrder.update({
      where: { id },
      data: {
        status: data.status,
        priority: data.priority,
        diagnosis: data.diagnosis,
        observations: data.observations,
        estimatedCompletion: data.estimatedCompletion,
        actualCompletion: data.actualCompletion,
        totalAmount: data.totalAmount,
        approvedAmount: data.approvedAmount,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        assignedTo: data.assignedTo,
      },
    });

    return this.mapToServiceOrder(updated);
  }

  async updateStatus(
    id: string,
    status: ServiceOrderStatus,
    reason?: string,
  ): Promise<ServiceOrder> {
    const current = await this.prisma.serviceOrder.findUnique({
      where: { id },
    });

    const updated = await this.prisma.serviceOrder.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            previousStatus: current?.status,
            newStatus: status,
            reason,
          },
        },
      },
    });

    return this.mapToServiceOrder(updated);
  }

  async addServiceItem(
    serviceOrderId: string,
    item: ServiceOrderItem,
  ): Promise<void> {
    await this.prisma.serviceOrderItem.create({
      data: {
        serviceOrderId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        status: 'PENDING',
      },
    });
  }

  async addPartItem(serviceOrderId: string, item: PartOrderItem): Promise<void> {
    await this.prisma.partOrderItem.create({
      data: {
        serviceOrderId,
        partId: item.partId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        status: 'PENDING',
      },
    });
  }

  async getAverageExecutionTime(): Promise<number> {
    const completedOrders = await this.prisma.serviceOrder.findMany({
      where: {
        status: {
          in: [ServiceOrderStatus.COMPLETED, ServiceOrderStatus.DELIVERED],
        },
        actualCompletion: { not: null },
      },
      select: {
        createdAt: true,
        actualCompletion: true,
      },
    });

    if (completedOrders.length === 0) return 0;

    const totalTime = completedOrders.reduce((sum, order) => {
      const diff =
        order.actualCompletion!.getTime() - order.createdAt.getTime();
      return sum + diff;
    }, 0);

    return totalTime / completedOrders.length / (1000 * 60 * 60); // Return in hours
  }

  async delete(id: string): Promise<void> {
    await this.prisma.serviceOrder.delete({
      where: { id },
    });
  }

  private mapToServiceOrder(data: any): ServiceOrder {
    return new ServiceOrder({
      id: data.id,
      orderNumber: data.orderNumber,
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      status: data.status,
      priority: data.priority,
      description: data.description,
      diagnosis: data.diagnosis || undefined,
      observations: data.observations || undefined,
      estimatedCompletion: data.estimatedCompletion || undefined,
      actualCompletion: data.actualCompletion || undefined,
      totalAmount: Number(data.totalAmount),
      approvedAmount: data.approvedAmount ? Number(data.approvedAmount) : undefined,
      approvedAt: data.approvedAt || undefined,
      approvedBy: data.approvedBy || undefined,
      createdBy: data.createdBy || undefined,
      assignedTo: data.assignedTo || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

