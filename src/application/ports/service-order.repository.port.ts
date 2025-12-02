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

export interface ServiceOrderRepositoryPort {
  create(
    serviceOrder: ServiceOrder,
    serviceItems?: ServiceOrderItem[],
    partItems?: PartOrderItem[],
  ): Promise<ServiceOrderWithDetails>;
  findById(id: string): Promise<ServiceOrderWithDetails | null>;
  findByOrderNumber(orderNumber: string): Promise<ServiceOrderWithDetails | null>;
  findByCustomerId(customerId: string): Promise<ServiceOrder[]>;
  findByVehicleId(vehicleId: string): Promise<ServiceOrder[]>;
  findByStatus(status: ServiceOrderStatus): Promise<ServiceOrder[]>;
  findAll(params?: {
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
  update(id: string, serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  updateStatus(id: string, status: ServiceOrderStatus, reason?: string): Promise<ServiceOrder>;
  addServiceItem(serviceOrderId: string, item: ServiceOrderItem): Promise<void>;
  addPartItem(serviceOrderId: string, item: PartOrderItem): Promise<void>;
  getAverageExecutionTime(): Promise<number>;
  delete(id: string): Promise<void>;
}

