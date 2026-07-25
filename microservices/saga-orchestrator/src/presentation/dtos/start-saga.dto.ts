import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class StartSagaDto {
  @ApiProperty({ example: 'Replace brake pads' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  description: string;

  @ApiProperty({
    required: false,
    description:
      'Optional correlation id for tracing. Pass "fail:<STEP>" (e.g. "fail:START_EXECUTION") against the ' +
      'mock downstream services to force a failure and observe the compensation flow.',
  })
  @IsOptional()
  @IsString()
  correlationId?: string;
}
