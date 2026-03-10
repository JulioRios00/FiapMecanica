import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ApproveServiceOrderDto {
  @ApiProperty({ example: 'customer@email.com', description: 'Who approved/rejected' })
  @IsNotEmpty()
  @IsString()
  approvedBy: string;

  @ApiProperty({
    example: true,
    required: false,
    default: true,
    description: 'Whether to approve (true) or reject (false) the service order',
  })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;

  @ApiProperty({
    example: 500.0,
    required: false,
    description: 'Approved amount (optional, defaults to total)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @ApiProperty({
    example: 'Budget too expensive',
    required: false,
    description: 'Reason for rejection (used when approved=false)',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
