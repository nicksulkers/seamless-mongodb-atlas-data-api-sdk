import { Cursor } from "./Cursor.js";
import type { MongoClient } from "./MongoClient.js";
export declare class Collection<T> {
    private client;
    private db;
    private collection;
    constructor(client: MongoClient, db: string, collection: string);
    insertOne(document: T): Promise<{
        insertedId: string;
    }>;
    insertMany(documents: T[]): Promise<{
        insertedIds: string[];
    }>;
    insert: (documents: T[]) => Promise<{
        insertedIds: string[];
    }>;
    findOne(filter: Record<string, any>, { projection }?: {
        projection?: Record<string, any>;
    }): Promise<T>;
    findMany(filter?: Record<string, any>, options?: {
        projection?: Record<string, any>;
        sort?: Record<string, any>;
        limit?: number;
        skip?: number;
    }): Cursor<T>;
    find: (filter?: Record<string, any>, options?: {
        projection?: Record<string, any>;
        sort?: Record<string, any>;
        limit?: number;
        skip?: number;
    }) => Cursor<T>;
    updateOne(filter: Record<string, any>, update: Record<string, any>, { upsert }?: {
        upsert?: boolean;
    }): Promise<{
        matchedCount: number;
        modifiedCount: number;
        upsertedId?: string;
    }>;
    updateMany(filter: Record<string, any>, update: Record<string, any>, { upsert }?: {
        upsert?: boolean;
    }): Promise<{
        matchedCount: number;
        modifiedCount: number;
        upsertedId?: string;
    }>;
    update: (filter: Record<string, any>, update: Record<string, any>, { upsert }?: {
        upsert?: boolean;
    }) => Promise<{
        matchedCount: number;
        modifiedCount: number;
        upsertedId?: string;
    }>;
    deleteOne(filter: Record<string, any>): Promise<{
        deletedCount: number;
    }>;
    deleteMany(filter: Record<string, any>): Promise<{
        deletedCount: number;
    }>;
    delete: (filter: Record<string, any>) => Promise<{
        deletedCount: number;
    }>;
    replaceOne(filter: Record<string, any>, replacement: Record<string, any>, { upsert }?: {
        upsert?: boolean;
    }): Promise<{
        matchedCount: number;
        modifiedCount: number;
        upsertedId?: string;
    }>;
    aggregate<T = Record<string, any>>(pipeline: Record<string, any>[]): Promise<T[]>;
    countDocuments(filter?: Record<string, any>, options?: {
        limit?: number;
        skip?: number;
    }): Promise<number>;
    estimatedDocumentCount(): Promise<number>;
    private sendApiRequest;
}
