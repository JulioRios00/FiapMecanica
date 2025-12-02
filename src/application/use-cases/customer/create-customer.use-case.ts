import { Injectable, ConflictException } from '@nestjs/common';
import { Customer, CustomerProps } from '@domain/entities/customer.entity';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

@Injectable()
export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(data: CustomerProps): Promise<Customer> {
    // Check if customer with same document already exists
    const existingCustomer = await this.customerRepository.findByDocument(
      data.document,
    );

    if (existingCustomer) {
      throw new ConflictException('Customer with this document already exists');
    }

    // Check if email is already in use
    const existingEmail = await this.customerRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email already in use');
    }

    const customer = new Customer(data);
    return await this.customerRepository.create(customer);
  }
}

