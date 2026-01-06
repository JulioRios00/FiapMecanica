import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepositoryPort } from '@application/ports/part.repository.port';

@Injectable()
export class DeletePartUseCase {
  constructor(private readonly partRepository: PartRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const part = await this.partRepository.findById(id);

    if (!part) {
      throw new NotFoundException('Part not found');
    }

    part.deactivate();
    await this.partRepository.update(id, part);
  }
}
