import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ServiceOrder, ServiceOrderProps } from '@domain/entities/service-order.entity';
import { ServiceOrderRepositoryPort, ServiceOrderItem, PartOrderItem } from '@application/ports/service-order.repository.port';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { VehicleRepositoryPort } from '@application/ports/vehicle.repository.port';
import { ServiceRepositoryPort } from '@application/ports/service.repository.port';
import { PartRepositoryPort } from '@application/ports/part.repository.port';

interface CreateServiceOrderInput {
  customerId: string;
  vehicleId: string;
  description: string;
  priority?: any;
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

  async execute(data: CreateServiceOrderInput): Promise<any> {
    // Validate customer exists
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate vehicle exists and belongs to customer
    const vehicle = await this.vehicleRepository.findById(data.vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    if (vehicle.getCustomerId() !== data.customerId) {
      throw new BadRequestException('Vehicle does not belong to this customer');
    }

    // Process services and calculate prices
    const serviceItems: ServiceOrderItem[] = [];
    let totalAmount = 0;

    if (data.services && data.services.length > 0) {
      for (const svc of data.services) {
        const service = await this.serviceRepository.findById(svc.serviceId);
        if (!service) {
          throw new NotFoundException(`Service ${svc.serviceId} not found`);
        }
        if (!service.isActive()) {
          throw new BadRequestException(`Service ${service.getName()} is not active`);
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

    // Process parts and calculate prices
    const partItems: PartOrderItem[] = [];
    if (data.parts && data.parts.length > 0) {
      for (const prt of data.parts) {
        const part = await this.partRepository.findById(prt.partId);
        if (!part) {
          throw new NotFoundException(`Part ${prt.partId} not found`);
        }
        if (!part.isActive()) {
          throw new BadRequestException(`Part ${part.getName()} is not active`);
        }
        if (part.getStockQuantity() < prt.quantity) {
          throw new BadRequestException(
            `Insufficient stock for part ${part.getName()}. Available: ${part.getStockQuantity()}`,
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

    // Create service order
    const serviceOrderData: ServiceOrderProps = {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      description: data.description,
      priority: data.priority,
      totalAmount,
    };

    const serviceOrder = new ServiceOrder(serviceOrderData);
    
    return await this.serviceOrderRepository.create(
      serviceOrder,
      serviceItems,
      partItems,
    );
  }
}

