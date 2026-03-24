import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
export declare class AuditLogQueryDto extends PaginationQueryDto {
    orderId?: number;
    action?: string;
}
