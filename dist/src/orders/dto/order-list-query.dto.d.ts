import { OrderStatus } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class OrderListQueryDto extends PaginationQueryDto {
    status?: OrderStatus;
}
