import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServiceOrderStatus } from '@prisma/client';
import { JwtAuthGuard } from '@infrastructure/auth/guards/jwt-auth.guard';
import { ParseUUIDPipe } from '@shared/pipes/parse-uuid.pipe';
import { CreateServiceOrderDto } from '../dtos/service-order/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from '../dtos/service-order/update-service-order-status.dto';
import { ApproveServiceOrderDto } from '../dtos/service-order/approve-service-order.dto';
import { NotificationStatusUpdateDto } from '../dtos/service-order/notification-status-update.dto';
import { CreateServiceOrderUseCase } from '@application/use-cases/service-order/create-service-order.use-case';
import { GetServiceOrderUseCase } from '@application/use-cases/service-order/get-service-order.use-case';
import { ListServiceOrdersUseCase } from '@application/use-cases/service-order/list-service-orders.use-case';
import { UpdateServiceOrderStatusUseCase } from '@application/use-cases/service-order/update-service-order-status.use-case';
import { ApproveServiceOrderUseCase } from '@application/use-cases/service-order/approve-service-order.use-case';
import { GetServiceExecutionMetricsUseCase } from '@application/use-cases/service-order/get-service-execution-metrics.use-case';
import { UpdateStatusViaNotificationUseCase } from '@application/use-cases/service-order/update-status-via-notification.use-case';

@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly getServiceOrderUseCase: GetServiceOrderUseCase,
    private readonly listServiceOrdersUseCase: ListServiceOrdersUseCase,
    private readonly updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase,
    private readonly approveServiceOrderUseCase: ApproveServiceOrderUseCase,
    private readonly getServiceExecutionMetricsUseCase: GetServiceExecutionMetricsUseCase,
    private readonly updateStatusViaNotificationUseCase: UpdateStatusViaNotificationUseCase,
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
  @ApiQuery({
    name: 'excludeCompleted',
    required: false,
    type: Boolean,
    example: true,
    description: 'Exclude completed/delivered/cancelled orders. Defaults to true.',
  })
  @ApiQuery({
    name: 'sortByPriority',
    required: false,
    type: Boolean,
    example: true,
    description: 'Sort orders by status priority (IN_PROGRESS first). Defaults to true.',
  })
  @ApiResponse({ status: 200, description: 'Service orders retrieved successfully' })
  async findAll(
    @Query('status') status?: ServiceOrderStatus,
    @Query('customerId') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('excludeCompleted') excludeCompleted?: string,
    @Query('sortByPriority') sortByPriority?: string,
  ) {
    return await this.listServiceOrdersUseCase.execute({
      status,
      customerId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      excludeCompleted: excludeCompleted !== undefined ? excludeCompleted !== 'false' : undefined,
      sortByPriority: sortByPriority !== undefined ? sortByPriority !== 'false' : undefined,
    });
  }

  @Post('notify/status-update')
  @ApiOperation({
    summary: 'Update service order status via notification (public webhook)',
  })
  @ApiResponse({ status: 200, description: 'Status updated via notification successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  async notifyStatusUpdate(@Body() notificationDto: NotificationStatusUpdateDto) {
    return await this.updateStatusViaNotificationUseCase.execute({
      serviceOrderId: notificationDto.serviceOrderId,
      newStatus: notificationDto.newStatus,
      senderEmail: notificationDto.senderEmail,
      message: notificationDto.message,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get service order by ID (public endpoint for customer tracking)',
  })
  @ApiResponse({ status: 200, description: 'Service order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateServiceOrderStatusDto,
  ) {
    return await this.updateServiceOrderStatusUseCase.execute(
      id,
      updateStatusDto.status,
      updateStatusDto.reason,
    );
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve or reject service order (public endpoint for customer approval)',
  })
  @ApiResponse({ status: 200, description: 'Service order approved/rejected successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Service order not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveServiceOrderDto,
  ) {
    return await this.approveServiceOrderUseCase.execute(
      id,
      approveDto.approvedBy,
      approveDto.approvedAmount,
      approveDto.approved ?? true,
      approveDto.reason,
    );
  }

  @Get('metrics/execution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service execution metrics and average time' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: Date, description: 'Filter from date' })
  @ApiQuery({ name: 'endDate', required: false, type: Date, description: 'Filter to date' })
  async getMetrics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return await this.getServiceExecutionMetricsUseCase.execute(filters);
  }
}
