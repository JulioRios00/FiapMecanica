import { Injectable } from '@nestjs/common';
import { Customer } from '@domain/entities/customer.entity';
import { CustomerRepositoryPort } from '@application/ports/customer.repository.port';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: Customer): Promise<Customer> {
    const data = customer.toJSON();
    const created = await this.prisma.customer.create({
      data: {
        name: data.name,
        documentType: data.documentType,
        document: data.document,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        active: data.active,
      },
    });

    return new Customer({
      id: created.id,
      name: created.name,
      documentType: created.documentType,
      document: created.document,
      email: created.email,
      phone: created.phone,
      address: created.address || undefined,
      city: created.city || undefined,
      state: created.state || undefined,
      zipCode: created.zipCode || undefined,
      active: created.active,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) return null;

    return new Customer({
      id: customer.id,
      name: customer.name,
      documentType: customer.documentType,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || undefined,
      city: customer.city || undefined,
      state: customer.state || undefined,
      zipCode: customer.zipCode || undefined,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async findByDocument(document: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { document },
    });

    if (!customer) return null;

    return new Customer({
      id: customer.id,
      name: customer.name,
      documentType: customer.documentType,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || undefined,
      city: customer.city || undefined,
      state: customer.state || undefined,
      zipCode: customer.zipCode || undefined,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findFirst({
      where: { email },
    });

    if (!customer) return null;

    return new Customer({
      id: customer.id,
      name: customer.name,
      documentType: customer.documentType,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || undefined,
      city: customer.city || undefined,
      state: customer.state || undefined,
      zipCode: customer.zipCode || undefined,
      active: customer.active,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async findAll(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.active !== undefined) {
      where.active = params.active;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const data = customers.map(
      (customer) =>
        new Customer({
          id: customer.id,
          name: customer.name,
          documentType: customer.documentType,
          document: customer.document,
          email: customer.email,
          phone: customer.phone,
          address: customer.address || undefined,
          city: customer.city || undefined,
          state: customer.state || undefined,
          zipCode: customer.zipCode || undefined,
          active: customer.active,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,
        }),
    );

    return { data, total, page, limit };
  }

  async update(id: string, customer: Customer): Promise<Customer> {
    const data = customer.toJSON();
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        active: data.active,
      },
    });

    return new Customer({
      id: updated.id,
      name: updated.name,
      documentType: updated.documentType,
      document: updated.document,
      email: updated.email,
      phone: updated.phone,
      address: updated.address || undefined,
      city: updated.city || undefined,
      state: updated.state || undefined,
      zipCode: updated.zipCode || undefined,
      active: updated.active,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({
      where: { id },
    });
  }
}

