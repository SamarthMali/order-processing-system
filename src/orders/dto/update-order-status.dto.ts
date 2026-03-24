import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../generated/prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.PROCESSING,
    description: 'Valid transitions: PENDING→PROCESSING→SHIPPED→DELIVERED',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
