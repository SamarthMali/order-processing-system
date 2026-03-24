import { Role } from '../generated/prisma/client';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        id: number;
        email: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
        orders: {
            id: number;
            createdAt: Date;
            status: import("../generated/prisma/enums").OrderStatus;
        }[];
    } | null>;
    findAll(query: PaginationQueryDto): Promise<import("../common/pagination.helper").PaginatedResult<any>>;
}
