import { Injectable } from '@nestjs/common';
import { Customer } from '@domain/entities/customer.entity';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';

@Injectable()
export class ListCustomersUseCase {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {}

  async execute(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await this.customerRepository.findAll(params);
  }
}

