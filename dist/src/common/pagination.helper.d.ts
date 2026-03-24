export interface PaginatedResult<T> {
    items: T[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}
export declare function paginate<T>(items: T[], totalItems: number, page: number, limit: number): PaginatedResult<T>;
