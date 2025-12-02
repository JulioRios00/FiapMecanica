import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { CreateServiceOrderDto } from '../dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../dtos/service-order/update-service-order-status.dto';
import { ApproveServiceOrderDto } from '../dtos/service-order/approve-service-order.dto';
import { CreateServiceOrderUseCase } from '@application/use-cases/service-order/create-service-order.use-case';
import { GetServiceOrderUseCase } from '@application/use-cases/service-order/get-service-order.use-case';
import { ListServiceOrdersUseCase } from '@application/use-cases/service-order/list-service-orders.use-case';
import { UpdateServiceOrderStatusUseCase } from '@application/use-cases/service-order/update-service-order-status.use-case';
import { ApproveServiceOrderUseCase } from '@application/use-cases/service-order/approve-service-order.use-case';

@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly getServiceOrderUseCase: GetServiceOrderUseCase,
    private readonly listServiceOrdersUseCase: ListServiceOrdersUseCase,
    private readonly updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase,
    private readonly approveServiceOrderUseCase: ApproveServiceOrderUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service order' })
  @ApiResponse({ status: 201, description: 'Service order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Customer or vehicle not found' })
  async create(@Body() createServiceOrderDto: CreateServiceOrderDto) {
    return await this.createServiceOrderUseCase.execute(createServiceOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all service orders (public endpoint for customer tracking)',
  })
  @ApiQuery({ name: 'status', required: false, enum: ServiceOrderStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Service orders retrieved successfully' })
  async findAll(
    @Query('status') status?: ServiceOrderStatus,
    @Query('customerId') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.listServiceOrdersUseCase.execute({
      status,
      customerId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get service order by ID (public endpoint for customer tracking)',
  })
  @ApiResponse({ status: 200, description: 'Service order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  async findOne(@Param('id') id: string) {
    return await this.getServiceOrderUseCase.execute(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service order status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateServiceOrderStatusDto,
  ) {
    return await this.updateServiceOrderStatusUseCase.execute(
      id,
      updateStatusDto.status,
      updateStatusDto.reason,
    );
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Approve service order (public endpoint for customer approval)',
  })
  @ApiResponse({ status: 200, description: 'Service order approved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveServiceOrderDto,
  ) {
    return await this.approveServiceOrderUseCase.execute(
      id,
      approveDto.approvedBy,
      approveDto.approvedAmount,
    );
  }
}

