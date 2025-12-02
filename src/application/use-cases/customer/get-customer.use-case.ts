import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from '@domain/entities/customer.entity';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

@Injectable()
export class GetCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }
}

