import { Module } from '@nestjs/common';
import { HealthController } from '../presentation/controllers/health.controller';
import { PrismaService } from '../infra/database/prisma.service';

@Module({
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}

