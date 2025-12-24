import { Customer } from '@domain/entities/customer.entity';

export abstract class CustomerRepositoryPort {
  abstract create(customer: Customer): Promise<Customer>;
  abstract findById(id: string): Promise<Customer | null>;
  abstract findByDocument(document: string): Promise<Customer | null>;
  abstract findByEmail(email: string): Promise<Customer | null>;
  abstract findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  }>;
  abstract update(id: string, customer: Customer): Promise<Customer>;
  abstract delete(id: string): Promise<void>;
}

