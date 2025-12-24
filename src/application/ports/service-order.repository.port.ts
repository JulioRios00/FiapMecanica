import { ServiceOrder } from '@domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@prisma/client';

export interface ServiceOrderItem {
  serviceId: string;
  quantity: number;
  unitPrice: number;
}

export interface PartOrderItem {
  partId: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceOrderWithDetails extends ServiceOrder {
  serviceItems?: ServiceOrderItem[];
  partItems?: PartOrderItem[];
}

export abstract class ServiceOrderRepositoryPort {
  abstract create(
    serviceOrder: ServiceOrder,
    serviceItems?: ServiceOrderItem[],
    partItems?: PartOrderItem[],
  ): Promise<ServiceOrderWithDetails>;
  abstract findById(id: string): Promise<ServiceOrderWithDetails | null>;
  abstract findByOrderNumber(orderNumber: string): Promise<ServiceOrderWithDetails | null>;
  abstract findByCustomerId(customerId: string): Promise<ServiceOrder[]>;
  abstract findByVehicleId(vehicleId: string): Promise<ServiceOrder[]>;
  abstract findByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]>;
  abstract findAll(params?: {
    status?: ServiceOrderStatus;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ServiceOrderWithDetails[];
    total: number;
    page: number;
    limit: number;
  }>;
  abstract update(id: string, serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  abstract updateStatus(id: string, status: ServiceOrderStatus, reason?: string): Promise<ServiceOrder>;
  abstract addServiceItem(serviceOrderId: string, item: ServiceOrderItem): Promise<void>;
  abstract addPartItem(serviceOrderId: string, item: PartOrderItem): Promise<void>;
  abstract getAverageExecutionTime(): Promise<number>;
  abstract delete(id: string): Promise<void>;
}

