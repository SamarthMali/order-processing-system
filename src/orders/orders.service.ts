import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '../generated/prisma/client';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { OrderAuditService } from './order-audit.service';
import { paginate, PaginatedResult } from '../common/pagination.helper';

const STATUS_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: OrderAuditService,
  ) {}

  async create(customerId: number, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !found.has(id));
      throw new BadRequestException(`Product(s) not found: ${missing.join(', ')}`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
    }

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          customerId,
          items: {
            create: dto.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
      });
    });

    await this.auditService.log({
      orderId: order.id,
      action: 'ORDER_CREATED',
      newStatus: OrderStatus.PENDING,
      performedById: customerId,
      performedByRole: 'CUSTOMER',
    });

    return order;
  }

  async findOne(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (role !== Role.ADMIN && order.customerId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async findAll(
    userId: number,
    role: Role,
    status?: OrderStatus,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (role !== Role.ADMIN) {
      where.customerId = userId;
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { include: { product: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return paginate(items, totalItems, page, limit);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
    const targetIndex = STATUS_FLOW.indexOf(dto.status);

    if (targetIndex === -1 || targetIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Invalid status transition: ${order.status} → ${dto.status}. ` +
          `Expected next status: ${STATUS_FLOW[currentIndex + 1] ?? 'none (already delivered)'}`,
      );
    }

    const oldStatus = order.status;

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: {
        items: { include: { product: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    await this.auditService.log({
      orderId: id,
      action: 'STATUS_UPDATED',
      oldStatus,
      newStatus: dto.status,
      performedById: userId,
      performedByRole: 'ADMIN',
    });

    return updated;
  }

  async cancel(id: number, userId: number, role: Role) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    if (role !== Role.ADMIN && order.customerId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Only PENDING orders can be cancelled. Current status: ${order.status}`,
      );
    }

    const oldStatus = order.status;

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: { include: { product: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });

    await this.auditService.log({
      orderId: id,
      action: 'ORDER_CANCELLED',
      oldStatus,
      newStatus: OrderStatus.CANCELLED,
      performedById: userId,
      performedByRole: role,
    });

    return updated;
  }

  async promotePendingToProcessing(): Promise<number> {
    const pendingOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PENDING },
      select: { id: true },
    });

    if (pendingOrders.length === 0) return 0;

    const result = await this.prisma.order.updateMany({
      where: { status: OrderStatus.PENDING },
      data: { status: OrderStatus.PROCESSING },
    });

    await this.auditService.logMany(
      pendingOrders.map((o) => ({
        orderId: o.id,
        action: 'CRON_STATUS_UPDATE',
        oldStatus: OrderStatus.PENDING,
        newStatus: OrderStatus.PROCESSING,
        performedByRole: 'SYSTEM',
      })),
    );

    this.logger.log(
      `Cron: promoted ${result.count} order(s) from PENDING → PROCESSING`,
    );

    return result.count;
  }
}
