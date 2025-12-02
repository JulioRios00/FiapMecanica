import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer, CustomerProps } from '@domain/entities/customer.entity';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(id: string, data: Partial<CustomerProps>): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    
    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    existingCustomer.updateInfo(data);
    return await this.customerRepository.update(id, existingCustomer);
  }
}

