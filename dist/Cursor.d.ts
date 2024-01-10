import type { Collection } from "./Collection.js";
export declare class Cursor<T> {
    private collection;
    private options;
    private fetchMethod;
    private cache;
    private position;
    private mapMethod;
    constructor(collection: Collection<T>, options: {
        filter: Record<string, any>;
        projection?: Record<string, any>;
        sort?: Record<string, any>;
        limit?: number;
        skip?: number;
    }, fetchMethod: (newOptions: typeof options) => Promise<{
        documents: T[];
    }>);
    private fetchMore;
    private reset;
    hasNext(): Promise<boolean>;
    next(): Promise<T | null>;
    toArray(): Promise<T[]>;
    map<U>(mapMethod: (document: T) => U): Cursor<U>;
    project(projection: typeof this.options.projection): this;
    filter(filter: typeof this.options.filter): this;
    sort(sort: typeof this.options.sort): this;
    limit(limit: typeof this.options.limit): this;
    skip(skip: typeof this.options.skip): this;
    clone(): Cursor<T>;
    close(): Promise<void>;
}
