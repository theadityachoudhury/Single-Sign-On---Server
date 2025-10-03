import { PostgreSQLConnection } from '@/database/connections/postgres.connection';
import { Pool } from 'pg';
import { IBaseRepository, PaginatedResult, QueryOptions } from '../interfaces/base.repository.interface';

export abstract class BasePostgresRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>
    implements IBaseRepository<T, CreateDTO, UpdateDTO> {

    protected pool: Pool;

    constructor(protected tableName: string) {
        this.pool = PostgreSQLConnection.getInstance().getPool();
    }

    protected buildWhereClause(filter: Record<string, any>): { whereClause: string; values: any[] } {
        const conditions: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                conditions.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        });

        return {
            whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
            values
        };
    }

    protected buildSelectQuery(
        filter: Record<string, any> = {},
        options: QueryOptions = {}
    ): { query: string; values: any[] } {
        const { whereClause, values } = this.buildWhereClause(filter);

        let query = `SELECT * FROM ${this.tableName} ${whereClause}`;

        if (options.sort) {
            const sortClauses = Object.entries(options.sort)
                .map(([key, direction]) => `${key} ${direction === 1 ? 'ASC' : 'DESC'}`)
                .join(', ');
            query += ` ORDER BY ${sortClauses}`;
        }

        if (options.limit) query += ` LIMIT ${options.limit}`;
        if (options.skip) query += ` OFFSET ${options.skip}`;

        return { query, values };
    }

    async findById(id: string): Promise<T | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const result = await this.pool.query(query, [id]);

        return result.rows[0] ? this.mapFromPostgres(result.rows[0]) : null;
    }

    async findMany(filter: Record<string, any> = {}, options: QueryOptions = {}): Promise<T[]> {
        const { query, values } = this.buildSelectQuery(filter, options);
        const result = await this.pool.query(query, values);

        return result.rows.map(row => this.mapFromPostgres(row));
    }

    async create(data: CreateDTO): Promise<T> {
        const mappedData = this.mapToPostgres(data);
        const keys = Object.keys(mappedData);
        const values = Object.values(mappedData);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

        const result = await this.pool.query(query, values);
        return this.mapFromPostgres(result.rows[0]);
    }

    async update(id: string, data: UpdateDTO): Promise<T | null> {
        const mappedData = this.mapToPostgres(data);
        const keys = Object.keys(mappedData);
        const values = Object.values(mappedData);

        const setClauses = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

        const query = `
      UPDATE ${this.tableName}
      SET ${setClauses}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

        const result = await this.pool.query(query, [id, ...values]);
        return result.rows[0] ? this.mapFromPostgres(result.rows[0]) : null;
    }

    async delete(id: string): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
        const result = await this.pool.query(query, [id]);

        return (result.rowCount || 0) > 0;
    }

    async count(filter: Record<string, any> = {}): Promise<number> {
        const { whereClause, values } = this.buildWhereClause(filter);
        const query = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;

        const result = await this.pool.query(query, values);
        return parseInt(result.rows[0].count);
    }

    async exists(id: string): Promise<boolean> {
        const query = `SELECT 1 FROM ${this.tableName} WHERE id = $1 LIMIT 1`;
        const result = await this.pool.query(query, [id]);

        return result.rows.length > 0;
    }

    protected async findWithPagination(
        filter: Record<string, any> = {},
        page: number,
        limit: number,
        options: QueryOptions = {}
    ): Promise<PaginatedResult<T>> {
        const skip = (page - 1) * limit;
        const total = await this.count(filter);

        const data = await this.findMany(filter, {
            ...options,
            skip,
            limit
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    // Abstract methods for mapping
    protected abstract mapFromPostgres(row: any): T;
    protected mapToPostgres(data: any): any {
        // Default implementation - override if needed
        if (data && typeof data === 'object') {
            if (data.id) {
                delete data.id; // Remove id field if present
            }

            if (data.createAt) {
                delete data.createAt; // Remove createAt field if present
            }

            if (data.updateAt) {
                delete data.updateAt; // Remove updateAt field if present
            }
        }
        return data;
    }
}