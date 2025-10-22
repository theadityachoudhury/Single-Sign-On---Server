import { Document } from 'mongoose';

/**
 * Mongoose utility functions for common operations
 */
export default class MongooseUtils {
    /**
     * Convert a single Mongoose document to plain object
     * @param document - Mongoose document to convert
     * @returns Plain JavaScript object with virtuals
     */
    static toPlainObject<T>(document: Document): T {
        return document.toObject() as unknown as T;
    }

    /**
     * Convert an array of Mongoose documents to plain objects
     * @param documents - Array of Mongoose documents to convert
     * @returns Array of plain JavaScript objects with virtuals
     */
    static toPlainObjectArray<T>(documents: Document[]): T[] {
        return documents.map(doc => doc.toObject()) as unknown as T[];
    }

    /**
     * Safely convert a document to plain object (handles null/undefined)
     * @param document - Mongoose document to convert (can be null/undefined)
     * @returns Plain object or null
     */
    static toPlainObjectSafe<T>(document: Document | null | undefined): T | null {
        if (!document) return null;
        return document.toObject() as unknown as T;
    }

    /**
     * Convert documents with additional data transformation
     * @param documents - Array of Mongoose documents
     * @param transform - Optional transformation function
     * @returns Transformed array of plain objects
     */
    static toPlainObjectArrayWithTransform<T, R = T>(
        documents: Document[],
        transform?: (item: T) => R
    ): R[] {
        const plainObjects = documents.map(doc => doc.toObject()) as unknown as T[];

        if (transform) {
            return plainObjects.map(transform);
        }

        return plainObjects as unknown as R[];
    }
}
