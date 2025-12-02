import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    customer.deactivate();
    await this.customerRepository.update(id, customer);
  }
}

