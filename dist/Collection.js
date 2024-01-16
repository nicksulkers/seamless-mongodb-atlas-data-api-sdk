import { Cursor } from "./Cursor.js";
import { EJSON } from "bson";
export class Collection {
    client;
    db;
    collection;
    constructor(client, db, collection) {
        this.client = client;
        this.db = db;
        this.collection = collection;
    }
    async insertOne(document) {
        const result = await this.sendApiRequest("insertOne", { document });
        return result;
    }
    async insertMany(documents) {
        const result = await this.sendApiRequest("insertMany", { documents });
        return result;
    }
    insert = this.insertMany;
    async findOne(filter, { projection } = {}) {
        const { document } = await this.sendApiRequest("findOne", {
            filter,
            projection
        });
        return document;
    }
    findMany(filter, options = {}) {
        return new Cursor(this, { filter, ...options }, (newOptions) => this.sendApiRequest("find", newOptions));
    }
    find = this.findMany;
    async updateOne(filter, update, { upsert } = {}) {
        const result = await this.sendApiRequest("updateOne", {
            filter,
            update,
            upsert
        });
        return result;
    }
    async updateMany(filter, update, { upsert } = {}) {
        const result = await this.sendApiRequest("updateMany", {
            filter,
            update,
            upsert
        });
        return result;
    }
    update = this.updateMany;
    async deleteOne(filter) {
        const result = await this.sendApiRequest("deleteOne", { filter });
        return result;
    }
    async deleteMany(filter) {
        const result = await this.sendApiRequest("deleteMany", { filter });
        return result;
    }
    delete = this.deleteMany;
    async replaceOne(filter, replacement, { upsert } = {}) {
        const result = await this.sendApiRequest("replaceOne", {
            filter,
            replacement,
            upsert
        });
        return result;
    }
    async aggregate(pipeline) {
        const { documents } = await this.sendApiRequest("aggregate", { pipeline });
        return documents;
    }
    async countDocuments(filter, options) {
        const pipeline = [];
        if (filter)
            pipeline.push({ $match: filter });
        if (options?.skip !== undefined)
            pipeline.push({ $skip: options.skip });
        if (options?.limit !== undefined)
            pipeline.push({ $limit: options.limit });
        pipeline.push({ $group: { _id: null, count: { $sum: 1 } } });
        pipeline.push({ $project: { _id: 0 } });
        const [result] = await this.aggregate(pipeline);
        return result?.count?.$numberInt ? parseInt(result.count.$numberInt) : 0;
    }
    async estimatedDocumentCount() {
        const [result] = await this.aggregate([
            { $collStats: { count: {} } },
            { $group: { _id: null, count: { $sum: "$count" } } },
            { $project: { _id: 0 } }
        ]);
        return result?.count?.$numberInt ? parseInt(result.count.$numberInt) : 0;
    }
    async sendApiRequest(method, body = {}) {
        const response = await fetch(`${this.client.endpoint}/action/${method}`, {
            method: "POST",
            headers: {
                Accept: "application/ejson",
                "api-key": this.client.apiKey,
                "Content-Type": "application/ejson"
            },
            body: EJSON.stringify({
                collection: this.collection,
                database: this.db,
                dataSource: this.client.instance,
                ...body
            })
        });
        const responseText = await response.text();
        if (!response.ok)
            throw new Error(`${response.statusText}: ${responseText}`);
        return EJSON.parse(responseText);
    }
}
