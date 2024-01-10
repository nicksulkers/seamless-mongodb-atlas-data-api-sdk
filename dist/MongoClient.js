import { Collection } from "./Collection.js";
export class MongoClient {
    instance; // Cluster0
    endpoint; // https://eu-west-2.aws.data.mongodb-api.com/app/data-ovfml/endpoint/data/v1
    apiKey; // 1234567890
    constructor(options) {
        for (const key in options)
            this[key] = options[key];
    }
    connect(callback) {
        if (callback)
            callback(null, this);
        return Promise.resolve(this);
    }
    db(dbName) {
        return {
            collection: (collectionName) => new Collection(this, dbName, collectionName)
        };
    }
}
