import { Injectable } from '@nestjs/common';
import { ServiceOrderRepositoryPort } from '../ports/service-order-repository.port';

@Injectable()
export class ListServiceOrderHistoryUseCase {
  constructor(private readonly repository: ServiceOrderRepositoryPort) {}

  async execute(id: string) {
    return this.repository.listHistory(id);
  }
}

