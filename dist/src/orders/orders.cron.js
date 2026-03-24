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
var OrdersCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const orders_service_1 = require("./orders.service");
let OrdersCron = OrdersCron_1 = class OrdersCron {
    ordersService;
    logger = new common_1.Logger(OrdersCron_1.name);
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async handlePendingOrders() {
        this.logger.log('Running scheduled job: promote PENDING → PROCESSING');
        const count = await this.ordersService.promotePendingToProcessing();
        this.logger.log(`Job complete. ${count} order(s) promoted.`);
    }
};
exports.OrdersCron = OrdersCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersCron.prototype, "handlePendingOrders", null);
exports.OrdersCron = OrdersCron = OrdersCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersCron);
//# sourceMappingURL=orders.cron.js.map