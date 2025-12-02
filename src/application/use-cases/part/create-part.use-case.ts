import { Injectable, ConflictException } from '@nestjs/common';
import { Part, PartProps } from '@domain/entities/part.entity';
import { PartRepositoryPort } from '@application/ports/part.repository.port';

@Injectable()
export class CreatePartUseCase {
  constructor(private readonly partRepository: PartRepositoryPort) {}

  async execute(data: PartProps): Promise<Part> {
    // Check if part with same part number already exists
    const existingPart = await this.partRepository.findByPartNumber(
      data.partNumber,
    );

    if (existingPart) {
      throw new ConflictException('Part with this part number already exists');
    }

    const part = new Part(data);
    return await this.partRepository.create(part);
  }
}

