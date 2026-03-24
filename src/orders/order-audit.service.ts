import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginatedResult } from '../common/pagination.helper';

export interface AuditLogEntry {
  orderId: number;
  action: string;
  oldStatus?: string;
  newStatus: string;
  performedById?: number;
  performedByRole?: string;
  note?: string;
}

@Injectable()
export class OrderAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    return this.prisma.orderAuditLog.create({
      data: {
        orderId: entry.orderId,
        action: entry.action,
        oldStatus: entry.oldStatus ?? null,
        newStatus: entry.newStatus,
        performedById: entry.performedById ?? null,
        performedByRole: entry.performedByRole ?? null,
        note: entry.note ?? null,
      },
    });
  }

  async logMany(entries: AuditLogEntry[]) {
    return this.prisma.orderAuditLog.createMany({
      data: entries.map((e) => ({
        orderId: e.orderId,
        action: e.action,
        oldStatus: e.oldStatus ?? null,
        newStatus: e.newStatus,
        performedById: e.performedById ?? null,
        performedByRole: e.performedByRole ?? null,
        note: e.note ?? null,
      })),
    });
  }

  async findByOrderId(
    orderId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    const where = { orderId };
    const [items, totalItems] = await Promise.all([
      this.prisma.orderAuditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          performedBy: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.orderAuditLog.count({ where }),
    ]);
    return paginate(items, totalItems, page, limit);
  }

  async findAll(
    filters?: { orderId?: number; action?: string },
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    const where: any = {};
    if (filters?.orderId) where.orderId = filters.orderId;
    if (filters?.action) where.action = filters.action;

    const [items, totalItems] = await Promise.all([
      this.prisma.orderAuditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          order: { select: { id: true, status: true, customerId: true } },
          performedBy: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.orderAuditLog.count({ where }),
    ]);
    return paginate(items, totalItems, page, limit);
  }
}
