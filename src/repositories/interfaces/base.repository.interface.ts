export interface IBaseRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
    findById(id: string): Promise<T | null>;
    findMany(filter?: Record<string, any>, options?: QueryOptions): Promise<T[]>;
    create(data: CreateDTO): Promise<T>;
    update(id: string, data: UpdateDTO): Promise<T | null>;
    delete(id: string): Promise<boolean>;
    count(filter?: Record<string, any>): Promise<number>;
    exists(id: string): Promise<boolean>;
}

export interface QueryOptions {
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    select?: string[] | Record<string, 0 | 1>;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}