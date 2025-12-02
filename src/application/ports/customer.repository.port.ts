import { Customer } from '@domain/entities/customer.entity';

export interface CustomerRepositoryPort {
  create(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(params?: { active?: boolean; page?: number; limit?: number }): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  }>;
  update(id: string, customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}

