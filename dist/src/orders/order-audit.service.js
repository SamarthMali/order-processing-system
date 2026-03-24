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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderAuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_helper_1 = require("../common/pagination.helper");
let OrderAuditService = class OrderAuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(entry) {
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
    async logMany(entries) {
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
    async findByOrderId(orderId, page = 1, limit = 10) {
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
        return (0, pagination_helper_1.paginate)(items, totalItems, page, limit);
    }
    async findAll(filters, page = 1, limit = 10) {
        const where = {};
        if (filters?.orderId)
            where.orderId = filters.orderId;
        if (filters?.action)
            where.action = filters.action;
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
        return (0, pagination_helper_1.paginate)(items, totalItems, page, limit);
    }
};
exports.OrderAuditService = OrderAuditService;
exports.OrderAuditService = OrderAuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderAuditService);
//# sourceMappingURL=order-audit.service.js.map