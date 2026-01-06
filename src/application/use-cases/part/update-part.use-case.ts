import { Injectable, NotFoundException } from '@nestjs/common';
import { PartRepositoryPort } from '@application/ports/part.repository.port';

@Injectable()
export class UpdatePartUseCase {
  constructor(private readonly partRepository: PartRepositoryPort) {}

  async execute(id: string, data: any): Promise<any> {
    const existingPart = await this.partRepository.findById(id);

    if (!existingPart) {
      throw new NotFoundException('Part not found');
    }

    existingPart.updateInfo(data);
    return await this.partRepository.update(id, existingPart);
  }
}
