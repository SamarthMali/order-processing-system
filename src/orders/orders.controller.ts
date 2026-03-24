import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { Roles } from '../auth/decorators';
import { OrdersService } from './orders.service';
import { OrderAuditService } from './order-audit.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly auditService: OrderAuditService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order (authenticated user)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or insufficient stock' })
  create(@Req() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders (Admin: all, Customer: own only, paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders' })
  findAll(@Req() req, @Query() query: OrderListQueryDto) {
    return this.ordersService.findAll(
      req.user.sub,
      req.user.role,
      query.status,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details (Admin: any, Customer: own only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 403, description: 'Cannot view other users orders' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id, req.user.sub, req.user.role);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateStatus(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto, req.user.sub);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel order (Admin: any PENDING, Customer: own PENDING)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 403, description: 'Cannot cancel other users orders' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancel(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(id, req.user.sub, req.user.role);
  }

  @Roles(Role.ADMIN)
  @Get(':id/audit-log')
  @ApiOperation({ summary: 'Get audit trail for a specific order (Admin only, paginated)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated order audit log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getOrderAuditLog(
    @Param('id', ParseIntPipe) id: number,
    @Query() pagination?: PaginationQueryDto,
  ) {
    return this.auditService.findByOrderId(id, pagination?.page, pagination?.limit);
  }

  @Roles(Role.ADMIN)
  @Get('audit-logs/all')
  @ApiOperation({ summary: 'List all audit logs with optional filters (Admin only, paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAllAuditLogs(@Query() query: AuditLogQueryDto) {
    return this.auditService.findAll(
      {
        orderId: query.orderId,
        action: query.action,
      },
      query.page,
      query.limit,
    );
  }
}
