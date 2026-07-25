import { SagaInstance } from '../../domain/entities/saga-instance.entity';

export abstract class SagaRepositoryPort {
  abstract create(instance: SagaInstance): Promise<SagaInstance>;
  abstract save(instance: SagaInstance): Promise<SagaInstance>;
  abstract findById(id: string): Promise<SagaInstance | null>;
}
