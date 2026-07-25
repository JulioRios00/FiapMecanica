import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SagaController } from '../presentation/controllers/saga.controller';
import { StartServiceOrderSagaUseCase } from '../application/use-cases/start-service-order-saga.use-case';
import { GetSagaStatusUseCase } from '../application/use-cases/get-saga-status.use-case';
import { SagaCompensationService } from '../application/services/saga-compensation.service';
import { SagaRepositoryPort } from '../application/ports/saga-repository.port';
import { OsServicePort } from '../application/ports/os-service.port';
import { BillingServicePort } from '../application/ports/billing-service.port';
import { ExecutionServicePort } from '../application/ports/execution-service.port';
import { PrismaService } from '../infra/database/prisma.service';
import { PrismaSagaRepository } from '../infra/repositories/prisma-saga.repository';
import { HttpOsServiceClient } from '../infra/clients/http-os-service.client';
import { HttpBillingServiceClient } from '../infra/clients/http-billing-service.client';
import { RabbitMqExecutionServiceClient } from '../infra/clients/rabbitmq-execution-service.client';
import { MockBillingServiceClient } from '../infra/mocks/mock-billing-service.client';
import { MockExecutionServiceClient } from '../infra/mocks/mock-execution-service.client';

/**
 * Billing Service and Execution Service are owned by other teams. Until
 * USE_MOCK_DOWNSTREAM=false, saga-orchestrator talks to in-process mocks for
 * those two ports so the full saga (including compensation) can be run and
 * demonstrated end-to-end without either of them running. When disabled:
 * billing-service is called over REST (HttpBillingServiceClient);
 * execution-service-api is choreography-only, so it's triggered by
 * publishing to RabbitMQ instead (RabbitMqExecutionServiceClient) -- see
 * docs/architecture.md for why.
 */
@Module({
  imports: [HttpModule],
  controllers: [SagaController],
  providers: [
    PrismaService,
    {
      provide: SagaRepositoryPort,
      useClass: PrismaSagaRepository,
    },
    {
      provide: OsServicePort,
      useClass: HttpOsServiceClient,
    },
    {
      provide: BillingServicePort,
      useFactory: (http: HttpService, config: ConfigService) =>
        config.get<string>('USE_MOCK_DOWNSTREAM', 'true') === 'false'
          ? new HttpBillingServiceClient(http, config)
          : new MockBillingServiceClient(),
      inject: [HttpService, ConfigService],
    },
    {
      provide: ExecutionServicePort,
      useFactory: (config: ConfigService) =>
        config.get<string>('USE_MOCK_DOWNSTREAM', 'true') === 'false'
          ? new RabbitMqExecutionServiceClient(config)
          : new MockExecutionServiceClient(),
      inject: [ConfigService],
    },
    SagaCompensationService,
    StartServiceOrderSagaUseCase,
    GetSagaStatusUseCase,
  ],
})
export class SagaModule {}
