import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../generated/prisma/client';
import { PaginatedResult } from '../common/pagination.helper';
export declare class UsersService {
    private readonly prisma;
    private readonly SALT_ROUNDS;
    constructor(prisma: PrismaService);
    create(email: string, password: string, name: string, role?: Role): Promise<{
        id: number;
        email: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: number): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findAll(page?: number, limit?: number): Promise<PaginatedResult<any>>;
    getProfile(id: number): Promise<{
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
    validatePassword(plainText: string, hashed: string): Promise<boolean>;
}
