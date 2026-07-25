import { Injectable } from '@nestjs/common';
import { SagaInstance, SagaStatus, SagaStep } from '../../domain/entities/saga-instance.entity';
import { SagaRepositoryPort } from '../../application/ports/saga-repository.port';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaSagaRepository implements SagaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(instance: SagaInstance): Promise<SagaInstance> {
    const data = instance.toJSON();
    const created = await this.prisma.sagaInstance.create({
      data: {
        id: data.id,
        osId: data.osId,
        status: data.status,
        correlationId: data.correlationId,
        completedSteps: data.completedSteps,
        lastError: data.lastError,
      },
    });

    return this.map(created);
  }

  async save(instance: SagaInstance): Promise<SagaInstance> {
    const data = instance.toJSON();
    const updated = await this.prisma.sagaInstance.update({
      where: { id: data.id },
      data: {
        osId: data.osId,
        status: data.status,
        completedSteps: data.completedSteps,
        lastError: data.lastError,
      },
    });

    return this.map(updated);
  }

  async findById(id: string): Promise<SagaInstance | null> {
    const data = await this.prisma.sagaInstance.findUnique({ where: { id } });
    return data ? this.map(data) : null;
  }

  private map(data: {
    id: string;
    osId: string | null;
    status: string;
    correlationId: string;
    completedSteps: string[];
    lastError: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SagaInstance {
    return new SagaInstance({
      id: data.id,
      osId: data.osId ?? undefined,
      status: data.status as SagaStatus,
      correlationId: data.correlationId,
      completedSteps: data.completedSteps as SagaStep[],
      lastError: data.lastError ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
