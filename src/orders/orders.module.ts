import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderAuditService } from './order-audit.service';
import { OrdersCron } from './orders.cron';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderAuditService, OrdersCron],
})
export class OrdersModule {}
