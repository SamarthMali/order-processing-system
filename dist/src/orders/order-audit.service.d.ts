import { PrismaService } from '../prisma/prisma.service';
import { PaginatedResult } from '../common/pagination.helper';
export interface AuditLogEntry {
    orderId: number;
    action: string;
    oldStatus?: string;
    newStatus: string;
    performedById?: number;
    performedByRole?: string;
    note?: string;
}
export declare class OrderAuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(entry: AuditLogEntry): Promise<{
        id: number;
        createdAt: Date;
        action: string;
        oldStatus: string | null;
        newStatus: string;
        performedByRole: string | null;
        note: string | null;
        orderId: number;
        performedById: number | null;
    }>;
    logMany(entries: AuditLogEntry[]): Promise<import("../generated/prisma/internal/prismaNamespace").BatchPayload>;
    findByOrderId(orderId: number, page?: number, limit?: number): Promise<PaginatedResult<any>>;
    findAll(filters?: {
        orderId?: number;
        action?: string;
    }, page?: number, limit?: number): Promise<PaginatedResult<any>>;
}
