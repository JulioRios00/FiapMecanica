import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelModel, ConfirmChannel, connect } from 'amqplib';
import { ExecutionServicePort } from '../../application/ports/execution-service.port';

/**
 * execution-service-api is built choreography-style: it has no REST command
 * to start or cancel an execution, only a RabbitMQ consumer on the
 * "workshop.saga" topic exchange listening for "service-order.approved" and
 * "service-order.cancelled". This orchestrator still decides *when* to
 * trigger execution -- it just uses AMQP as the transport for this one
 * participant, matching the contract execution-service-api actually exposes,
 * instead of asking that team to add a REST endpoint.
 */
@Injectable()
export class RabbitMqExecutionServiceClient implements ExecutionServicePort, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqExecutionServiceClient.name);
  private readonly exchange: string;
  private readonly url: string;
  private connection?: ChannelModel;
  private channel?: ConfirmChannel;
  private connecting?: Promise<void>;

  constructor(private readonly config: ConfigService) {
    this.exchange = this.config.get<string>('EXECUTION_SAGA_EXCHANGE', 'workshop.saga');
    this.url = this.config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async startExecution(payload: { osId: string; correlationId: string }): Promise<void> {
    await this.publish('service-order.approved', { serviceOrderId: payload.osId }, payload.correlationId);
  }

  async cancelExecution(payload: { osId: string; reason: string; correlationId: string }): Promise<void> {
    await this.publish(
      'service-order.cancelled',
      { serviceOrderId: payload.osId, reason: payload.reason },
      payload.correlationId,
    );
  }

  private async ensureConnected(): Promise<void> {
    if (this.channel) {
      return;
    }
    if (!this.connecting) {
      this.connecting = (async () => {
        this.connection = await connect(this.url);
        this.channel = await this.connection.createConfirmChannel();
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
      })();
    }
    await this.connecting;
  }

  private async publish(routingKey: string, payload: Record<string, unknown>, correlationId: string): Promise<void> {
    await this.ensureConnected();
    this.channel!.publish(
      this.exchange,
      routingKey,
      Buffer.from(
        JSON.stringify({
          eventId: correlationId,
          event: routingKey,
          occurredAt: new Date().toISOString(),
          payload,
        }),
      ),
      { persistent: true, contentType: 'application/json' },
    );
    await this.channel!.waitForConfirms();
    this.logger.log(`Published ${routingKey} to ${this.exchange} (correlationId=${correlationId})`);
  }
}
