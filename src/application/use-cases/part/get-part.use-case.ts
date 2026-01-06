import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepositoryPort } from '@application/ports/part.repository.port';

@Injectable()
export class GetPartUseCase {
  constructor(private readonly partRepository: PartRepositoryPort) {}

  async execute(id: string): Promise<any> {
    const part = await this.partRepository.findById(id);

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    return part;
  }
}
