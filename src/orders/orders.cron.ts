import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersCron {
  private readonly logger = new Logger(OrdersCron.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handlePendingOrders() {
    this.logger.log('Running scheduled job: promote PENDING → PROCESSING');
    const count = await this.ordersService.promotePendingToProcessing();
    this.logger.log(`Job complete. ${count} order(s) promoted.`);
  }
}
