import { Collection } from "./Collection.js";
export declare class MongoClient {
    instance: string;
    endpoint: string;
    apiKey: string;
    constructor(options: {
        instance: string;
        endpoint: string;
        apiKey: string;
    });
    connect(callback?: (error: any, client: MongoClient) => any): Promise<MongoClient>;
    db(dbName: string): {
        collection: (collectionName: string) => Collection<unknown>;
    };
}
