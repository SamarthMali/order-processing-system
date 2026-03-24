import { OrdersService } from './orders.service';
import { OrderAuditService } from './order-audit.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
export declare class OrdersController {
    private readonly ordersService;
    private readonly auditService;
    constructor(ordersService: OrdersService, auditService: OrderAuditService);
    create(req: any, dto: CreateOrderDto): Promise<{
        items: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: number;
            price: number;
            productId: number;
            quantity: number;
            orderId: number;
        })[];
        customer: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
        customerId: number;
    }>;
    findAll(req: any, query: OrderListQueryDto): Promise<import("../common/pagination.helper").PaginatedResult<any>>;
    findOne(req: any, id: number): Promise<{
        items: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: number;
            price: number;
            productId: number;
            quantity: number;
            orderId: number;
        })[];
        customer: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
        customerId: number;
    }>;
    updateStatus(req: any, id: number, dto: UpdateOrderStatusDto): Promise<{
        items: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: number;
            price: number;
            productId: number;
            quantity: number;
            orderId: number;
        })[];
        customer: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
        customerId: number;
    }>;
    cancel(req: any, id: number): Promise<{
        items: ({
            product: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                stock: number;
            };
        } & {
            id: number;
            price: number;
            productId: number;
            quantity: number;
            orderId: number;
        })[];
        customer: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: import("../generated/prisma/enums").OrderStatus;
        customerId: number;
    }>;
    getOrderAuditLog(id: number, pagination?: PaginationQueryDto): Promise<import("../common/pagination.helper").PaginatedResult<any>>;
    getAllAuditLogs(query: AuditLogQueryDto): Promise<import("../common/pagination.helper").PaginatedResult<any>>;
}
