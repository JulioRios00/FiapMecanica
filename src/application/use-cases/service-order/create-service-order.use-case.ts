import { Injectable, NotFoundException } from '@nestjs/common';
import { Priority } from '@prisma/client';
import { ServiceOrder, ServiceOrderProps } from '@domain/entities/service-order.entity';
import {
  ServiceOrderRepositoryPort,
  ServiceOrderItem,
  PartOrderItem,
  ServiceOrderWithDetails,
} from '@application/ports/service-order.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { VehicleOwnershipException } from '@shared/exceptions/vehicle-ownership.exception';
import { InsufficientStockException } from '@shared/exceptions/insufficient-stock.exception';
import { ServiceInactiveException } from '@shared/exceptions/service-inactive.exception';

interface CreateServiceOrderInput {
  customerId: string;
  vehicleId: string;
  description: string;
  priority?: Priority;
  services?: Array<{ serviceId: string; quantity: number }>;
  parts?: Array<{ partId: string; quantity: number }>;
}

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepositoryPort,
    private readonly customerRepository: CustomerRepositoryPort,
    private readonly vehicleRepository: VehicleRepositoryPort,
    private readonly serviceRepository: ServiceRepositoryPort,
    private readonly partRepository: PartRepositoryPort,
  ) {}

  async execute(data: CreateServiceOrderInput): Promise<ServiceOrderWithDetails> {
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const vehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    if (vehicle.getCustomerId() !== data.customerId) {
      throw new VehicleOwnershipException(data.vehicleId, data.customerId);
    }

    const serviceItems: ServiceOrderItem[] = [];
    let totalAmount = 0;

    if (data.services && data.services.length > 0) {
      for (const svc of data.services) {
        const service = await this.serviceRepository.findById(svc.serviceId);
        if (!service) {
          throw new NotFoundException(`Service ${svc.serviceId} not found`);
        }
        if (!service.isActive()) {
          throw new ServiceInactiveException(svc.serviceId, service.getName());
        }

        const unitPrice = service.getPrice();
        const totalPrice = unitPrice * svc.quantity;
        totalAmount += totalPrice;

        serviceItems.push({
          serviceId: svc.serviceId,
          quantity: svc.quantity,
          unitPrice,
        });
      }
    }

    const partItems: PartOrderItem[] = [];
    if (data.parts && data.parts.length > 0) {
      for (const prt of data.parts) {
        const part = await this.partRepository.findById(prt.partId);
        if (!part) {
          throw new NotFoundException(`Part ${prt.partId} not found`);
        }
        if (!part.isActive()) {
          throw new ServiceInactiveException(prt.partId, part.getName());
        }
        if (part.getStockQuantity() < prt.quantity) {
          throw new InsufficientStockException(
            part.getName(),
            prt.quantity,
            part.getStockQuantity(),
          );
        }

        const unitPrice = part.getPrice();
        const totalPrice = unitPrice * prt.quantity;
        totalAmount += totalPrice;

        partItems.push({
          partId: prt.partId,
          quantity: prt.quantity,
          unitPrice,
        });
      }
    }

    const serviceOrderData: ServiceOrderProps = {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      description: data.description,
      priority: data.priority,
      totalAmount,
    };

    const serviceOrder = new ServiceOrder(serviceOrderData);

    return await this.serviceOrderRepository.create(serviceOrder, serviceItems, partItems);
  }
}
