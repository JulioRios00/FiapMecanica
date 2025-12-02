import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServiceOrderStatus } from '@prisma/client';

export class UpdateServiceOrderStatusDto {
  @ApiProperty({
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.IN_PROGRESS,
    description: 'New status',
  })
  @IsNotEmpty()
  @IsEnum(ServiceOrderStatus)
  status: ServiceOrderStatus;

  @ApiProperty({
    example: 'Customer requested change',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

