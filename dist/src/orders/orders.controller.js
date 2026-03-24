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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("../generated/prisma/client");
const decorators_1 = require("../auth/decorators");
const orders_service_1 = require("./orders.service");
const order_audit_service_1 = require("./order-audit.service");
const dto_1 = require("./dto");
const pagination_query_dto_1 = require("../common/dto/pagination-query.dto");
const order_list_query_dto_1 = require("./dto/order-list-query.dto");
const audit_log_query_dto_1 = require("./dto/audit-log-query.dto");
let OrdersController = class OrdersController {
    ordersService;
    auditService;
    constructor(ordersService, auditService) {
        this.ordersService = ordersService;
        this.auditService = auditService;
    }
    create(req, dto) {
        return this.ordersService.create(req.user.sub, dto);
    }
    findAll(req, query) {
        return this.ordersService.findAll(req.user.sub, req.user.role, query.status, query.page, query.limit);
    }
    findOne(req, id) {
        return this.ordersService.findOne(id, req.user.sub, req.user.role);
    }
    updateStatus(req, id, dto) {
        return this.ordersService.updateStatus(id, dto, req.user.sub);
    }
    cancel(req, id) {
        return this.ordersService.cancel(id, req.user.sub, req.user.role);
    }
    getOrderAuditLog(id, pagination) {
        return this.auditService.findByOrderId(id, pagination?.page, pagination?.limit);
    }
    getAllAuditLogs(query) {
        return this.auditService.findAll({
            orderId: query.orderId,
            action: query.action,
        }, query.page, query.limit);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new order (authenticated user)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed or insufficient stock' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List orders (Admin: all, Customer: own only, paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of orders' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, order_list_query_dto_1.OrderListQueryDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details (Admin: any, Customer: own only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order details' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot view other users orders' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, decorators_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order status updated' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel order (Admin: any PENDING, Customer: own PENDING)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order cancelled' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order cannot be cancelled' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot cancel other users orders' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, decorators_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)(':id/audit-log'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit trail for a specific order (Admin only, paginated)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated order audit log entries' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pagination_query_dto_1.PaginationQueryDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrderAuditLog", null);
__decorate([
    (0, decorators_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.Get)('audit-logs/all'),
    (0, swagger_1.ApiOperation)({ summary: 'List all audit logs with optional filters (Admin only, paginated)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated audit log entries' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin only' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_log_query_dto_1.AuditLogQueryDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getAllAuditLogs", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiTags)('Orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        order_audit_service_1.OrderAuditService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map