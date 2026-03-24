import { OrdersService } from './orders.service';
export declare class OrdersCron {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    handlePendingOrders(): Promise<void>;
}
