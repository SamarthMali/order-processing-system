"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("../generated/prisma/client");
const order_audit_service_1 = require("./order-audit.service");
const pagination_helper_1 = require("../common/pagination.helper");
const STATUS_FLOW = [
    client_1.OrderStatus.PENDING,
    client_1.OrderStatus.PROCESSING,
    client_1.OrderStatus.SHIPPED,
    client_1.OrderStatus.DELIVERED,
];
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    auditService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(customerId, dto) {
        const productIds = dto.items.map((i) => i.productId);
        const products = await this.prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        if (products.length !== productIds.length) {
            const found = new Set(products.map((p) => p.id));
            const missing = productIds.filter((id) => !found.has(id));
            throw new common_1.BadRequestException(`Product(s) not found: ${missing.join(', ')}`);
        }
        const productMap = new Map(products.map((p) => [p.id, p]));
        for (const item of dto.items) {
            const product = productMap.get(item.productId);
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
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
                            const product = productMap.get(item.productId);
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
            newStatus: client_1.OrderStatus.PENDING,
            performedById: customerId,
            performedByRole: 'CUSTOMER',
        });
        return order;
    }
    async findOne(id, userId, role) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                customer: { select: { id: true, name: true, email: true } },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order #${id} not found`);
        }
        if (role !== client_1.Role.ADMIN && order.customerId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own orders');
        }
        return order;
    }
    async findAll(userId, role, status, page = 1, limit = 10) {
        const where = {};
        if (status) {
            where.status = status;
        }
        if (role !== client_1.Role.ADMIN) {
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
        return (0, pagination_helper_1.paginate)(items, totalItems, page, limit);
    }
    async updateStatus(id, dto, userId) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order #${id} not found`);
        }
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update a cancelled order');
        }
        const currentIndex = STATUS_FLOW.indexOf(order.status);
        const targetIndex = STATUS_FLOW.indexOf(dto.status);
        if (targetIndex === -1 || targetIndex !== currentIndex + 1) {
            throw new common_1.BadRequestException(`Invalid status transition: ${order.status} → ${dto.status}. ` +
                `Expected next status: ${STATUS_FLOW[currentIndex + 1] ?? 'none (already delivered)'}`);
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
    async cancel(id, userId, role) {
        const order = await this.prisma.order.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order #${id} not found`);
        }
        if (role !== client_1.Role.ADMIN && order.customerId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own orders');
        }
        if (order.status !== client_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException(`Only PENDING orders can be cancelled. Current status: ${order.status}`);
        }
        const oldStatus = order.status;
        const updated = await this.prisma.order.update({
            where: { id },
            data: { status: client_1.OrderStatus.CANCELLED },
            include: {
                items: { include: { product: true } },
                customer: { select: { id: true, name: true, email: true } },
            },
        });
        await this.auditService.log({
            orderId: id,
            action: 'ORDER_CANCELLED',
            oldStatus,
            newStatus: client_1.OrderStatus.CANCELLED,
            performedById: userId,
            performedByRole: role,
        });
        return updated;
    }
    async promotePendingToProcessing() {
        const pendingOrders = await this.prisma.order.findMany({
            where: { status: client_1.OrderStatus.PENDING },
            select: { id: true },
        });
        if (pendingOrders.length === 0)
            return 0;
        const result = await this.prisma.order.updateMany({
            where: { status: client_1.OrderStatus.PENDING },
            data: { status: client_1.OrderStatus.PROCESSING },
        });
        await this.auditService.logMany(pendingOrders.map((o) => ({
            orderId: o.id,
            action: 'CRON_STATUS_UPDATE',
            oldStatus: client_1.OrderStatus.PENDING,
            newStatus: client_1.OrderStatus.PROCESSING,
            performedByRole: 'SYSTEM',
        })));
        this.logger.log(`Cron: promoted ${result.count} order(s) from PENDING → PROCESSING`);
        return result.count;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        order_audit_service_1.OrderAuditService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map