import { Injectable, NotFoundException } from '@nestjs/common';
import { SagaRepositoryPort } from '../ports/saga-repository.port';

@Injectable()
export class GetSagaStatusUseCase {
  constructor(private readonly sagaRepository: SagaRepositoryPort) {}

  async execute(id: string) {
    const saga = await this.sagaRepository.findById(id);
    if (!saga) {
      throw new NotFoundException('Saga instance not found');
    }
    return saga;
  }
}
