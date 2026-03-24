import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '../generated/prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrderAuditService } from './order-audit.service';
import { PaginatedResult } from '../common/pagination.helper';
export declare class OrdersService {
    private readonly prisma;
    private readonly auditService;
    private readonly logger;
    constructor(prisma: PrismaService, auditService: OrderAuditService);
    create(customerId: number, dto: CreateOrderDto): Promise<{
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
        status: OrderStatus;
        customerId: number;
    }>;
    findOne(id: number, userId: number, role: Role): Promise<{
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
        status: OrderStatus;
        customerId: number;
    }>;
    findAll(userId: number, role: Role, status?: OrderStatus, page?: number, limit?: number): Promise<PaginatedResult<any>>;
    updateStatus(id: number, dto: UpdateOrderStatusDto, userId: number): Promise<{
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
        status: OrderStatus;
        customerId: number;
    }>;
    cancel(id: number, userId: number, role: Role): Promise<{
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
        status: OrderStatus;
        customerId: number;
    }>;
    promotePendingToProcessing(): Promise<number>;
}
