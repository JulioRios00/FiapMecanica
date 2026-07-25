import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import { LoggerModule } from 'nestjs-pino';
import { SagaModule } from './modules/saga.module';
import { HealthModule } from './modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({ service: 'saga-orchestrator' }),
        // Correlate every log line with the saga: reuse an incoming
        // x-correlation-id if present (e.g. from a client or another
        // service), otherwise mint one and echo it back.
        genReqId: (req, res) => {
          const header = req.headers['x-correlation-id'];
          const correlationId = (Array.isArray(header) ? header[0] : header) || randomUUID();
          res.setHeader('x-correlation-id', correlationId);
          return correlationId;
        },
      },
    }),
    HttpModule,
    SagaModule,
    HealthModule,
  ],
})
export class AppModule {}
