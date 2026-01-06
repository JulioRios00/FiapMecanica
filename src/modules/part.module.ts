import { Module } from '@nestjs/common';
import { PartController } from '@presentation/controllers/part.controller';
import { CreatePartUseCase } from '@application/use-cases/part/create-part.use-case';
import { GetPartUseCase } from '@application/use-cases/part/get-part.use-case';
import { ListPartsUseCase } from '@application/use-cases/part/list-parts.use-case';
import { UpdatePartUseCase } from '@application/use-cases/part/update-part.use-case';
import { DeletePartUseCase } from '@application/use-cases/part/delete-part.use-case';
import { PartRepository } from '@infrastructure/repositories/part.repository';
import { PartRepositoryPort } from '@application/ports/part.repository.port';
import { PrismaService } from '@infrastructure/database/prisma.service';

@Module({
  controllers: [PartController],
  providers: [
    PrismaService,
    {
      provide: PartRepositoryPort,
      useClass: PartRepository,
    },
    CreatePartUseCase,
    GetPartUseCase,
    ListPartsUseCase,
    UpdatePartUseCase,
    DeletePartUseCase,
  ],
  exports: [PartRepositoryPort],
})
export class PartModule {}
