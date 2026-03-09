import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServiceOrderStatus } from '@prisma/client';

export class NotificationStatusUpdateDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Service order ID',
  })
  @IsNotEmpty()
  @IsString()
  serviceOrderId: string;

  @ApiProperty({
    example: 'IN_PROGRESS',
    enum: ServiceOrderStatus,
    description: 'New status for the service order',
  })
  @IsNotEmpty()
  @IsEnum(ServiceOrderStatus)
  newStatus: ServiceOrderStatus;

  @ApiProperty({
    example: 'mechanic@workshop.com',
    description: 'Email of the sender triggering the notification',
  })
  @IsNotEmpty()
  @IsEmail()
  senderEmail: string;

  @ApiProperty({
    example: 'Service completed successfully',
    required: false,
    description: 'Optional message to include in the notification',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
