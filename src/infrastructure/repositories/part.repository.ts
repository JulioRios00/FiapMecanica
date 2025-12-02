import { Injectable } from '@nestjs/common';
import { Part } from '@domain/entities/part.entity';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PartRepository implements PartRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(part: Part): Promise<Part> {
    const data = part.toJSON();
    const created = await this.prisma.part.create({
      data: {
        name: data.name,
        description: data.description,
        partNumber: data.partNumber,
        manufacturer: data.manufacturer,
        price: data.price,
        stockQuantity: data.stockQuantity,
        minStockLevel: data.minStockLevel,
        unit: data.unit,
        active: data.active,
      },
    });

    return new Part({
      id: created.id,
      name: created.name,
      description: created.description || undefined,
      partNumber: created.partNumber,
      manufacturer: created.manufacturer || undefined,
      price: Number(created.price),
      stockQuantity: created.stockQuantity,
      minStockLevel: created.minStockLevel,
      unit: created.unit,
      active: created.active,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: string): Promise<Part | null> {
    const part = await this.prisma.part.findUnique({
      where: { id },
    });

    if (!part) return null;

    return new Part({
      id: part.id,
      name: part.name,
      description: part.description || undefined,
      partNumber: part.partNumber,
      manufacturer: part.manufacturer || undefined,
      price: Number(part.price),
      stockQuantity: part.stockQuantity,
      minStockLevel: part.minStockLevel,
      unit: part.unit,
      active: part.active,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    });
  }

  async findByPartNumber(partNumber: string): Promise<Part | null> {
    const part = await this.prisma.part.findUnique({
      where: { partNumber },
    });

    if (!part) return null;

    return new Part({
      id: part.id,
      name: part.name,
      description: part.description || undefined,
      partNumber: part.partNumber,
      manufacturer: part.manufacturer || undefined,
      price: Number(part.price),
      stockQuantity: part.stockQuantity,
      minStockLevel: part.minStockLevel,
      unit: part.unit,
      active: part.active,
      createdAt: part.createdAt,
      updatedAt: part.updatedAt,
    });
  }

  async findLowStock(): Promise<Part[]> {
    const parts = await this.prisma.part.findMany({
      where: {
        active: true,
        stockQuantity: {
          lte: this.prisma.part.fields.minStockLevel,
        },
      },
    });

    return parts.map(
      (part) =>
        new Part({
          id: part.id,
          name: part.name,
          description: part.description || undefined,
          partNumber: part.partNumber,
          manufacturer: part.manufacturer || undefined,
          price: Number(part.price),
          stockQuantity: part.stockQuantity,
          minStockLevel: part.minStockLevel,
          unit: part.unit,
          active: part.active,
          createdAt: part.createdAt,
          updatedAt: part.updatedAt,
        }),
    );
  }

  async findAll(params?: {
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Part[];
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

    const [parts, total] = await Promise.all([
      this.prisma.part.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.part.count({ where }),
    ]);

    const data = parts.map(
      (part) =>
        new Part({
          id: part.id,
          name: part.name,
          description: part.description || undefined,
          partNumber: part.partNumber,
          manufacturer: part.manufacturer || undefined,
          price: Number(part.price),
          stockQuantity: part.stockQuantity,
          minStockLevel: part.minStockLevel,
          unit: part.unit,
          active: part.active,
          createdAt: part.createdAt,
          updatedAt: part.updatedAt,
        }),
    );

    return { data, total, page, limit };
  }

  async update(id: string, part: Part): Promise<Part> {
    const data = part.toJSON();
    const updated = await this.prisma.part.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        manufacturer: data.manufacturer,
        price: data.price,
        stockQuantity: data.stockQuantity,
        minStockLevel: data.minStockLevel,
        unit: data.unit,
        active: data.active,
      },
    });

    return new Part({
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      partNumber: updated.partNumber,
      manufacturer: updated.manufacturer || undefined,
      price: Number(updated.price),
      stockQuantity: updated.stockQuantity,
      minStockLevel: updated.minStockLevel,
      unit: updated.unit,
      active: updated.active,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.part.delete({
      where: { id },
    });
  }
}

