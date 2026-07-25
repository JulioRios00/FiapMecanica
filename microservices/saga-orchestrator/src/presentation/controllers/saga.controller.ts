import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StartServiceOrderSagaUseCase } from '../../application/use-cases/start-service-order-saga.use-case';
import { GetSagaStatusUseCase } from '../../application/use-cases/get-saga-status.use-case';
import { StartSagaDto } from '../dtos/start-saga.dto';

@ApiTags('sagas')
@Controller('sagas')
export class SagaController {
  constructor(
    private readonly startSagaUseCase: StartServiceOrderSagaUseCase,
    private readonly getSagaStatusUseCase: GetSagaStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start the orchestrated OS -> Quote -> Execution saga' })
  async start(@Body() dto: StartSagaDto) {
    const saga = await this.startSagaUseCase.execute(dto);
    return saga.toJSON();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saga instance status, completed steps, and last error (if any)' })
  async findOne(@Param('id') id: string) {
    const saga = await this.getSagaStatusUseCase.execute(id);
    return saga.toJSON();
  }
}
