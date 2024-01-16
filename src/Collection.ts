import { Cursor } from "./Cursor.js";
import type { MongoClient } from "./MongoClient.js";
import { EJSON } from "bson";

export class Collection<T> {
	constructor(private client: MongoClient, private db: string, private collection: string) {}

	async insertOne(document: T) {
		const result: { insertedId: string } = await this.sendApiRequest("insertOne", { document });
		return result;
	}

	async insertMany(documents: T[]) {
		const result: { insertedIds: string[] } = await this.sendApiRequest("insertMany", { documents });
		return result;
	}

	insert = this.insertMany;

	async findOne(filter: Record<string, any>, { projection }: { projection?: Record<string, any> } = {}) {
		const { document }: { document: T } = await this.sendApiRequest("findOne", {
			filter,
			projection
		});
		return document;
	}

	findMany(
		filter?: Record<string, any>,
		options: {
			projection?: Record<string, any>;
			sort?: Record<string, any>;
			limit?: number;
			skip?: number;
		} = {}
	) {
		return new Cursor<T>(this, { filter, ...options }, (newOptions: typeof options & { filter: typeof filter }) =>
			this.sendApiRequest("find", newOptions)
		);
	}

	find = this.findMany;

	async updateOne(filter: Record<string, any>, update: Record<string, any>, { upsert }: { upsert?: boolean } = {}) {
		const result: {
			matchedCount: number;
			modifiedCount: number;
			upsertedId?: string;
		} = await this.sendApiRequest("updateOne", {
			filter,
			update,
			upsert
		});
		return result;
	}

	async updateMany(filter: Record<string, any>, update: Record<string, any>, { upsert }: { upsert?: boolean } = {}) {
		const result: {
			matchedCount: number;
			modifiedCount: number;
			upsertedId?: string;
		} = await this.sendApiRequest("updateMany", {
			filter,
			update,
			upsert
		});
		return result;
	}

	update = this.updateMany;

	async deleteOne(filter: Record<string, any>) {
		const result: { deletedCount: number } = await this.sendApiRequest("deleteOne", { filter });
		return result;
	}

	async deleteMany(filter: Record<string, any>) {
		const result: { deletedCount: number } = await this.sendApiRequest("deleteMany", { filter });
		return result;
	}

	delete = this.deleteMany;

	async replaceOne(
		filter: Record<string, any>,
		replacement: Record<string, any>,
		{ upsert }: { upsert?: boolean } = {}
	) {
		const result: {
			matchedCount: number;
			modifiedCount: number;
			upsertedId?: string;
		} = await this.sendApiRequest("replaceOne", {
			filter,
			replacement,
			upsert
		});
		return result;
	}

	async aggregate<T = Record<string, any>>(pipeline: Record<string, any>[]) {
		const { documents }: { documents: T[] } = await this.sendApiRequest("aggregate", { pipeline });
		return documents;
	}

	async countDocuments(filter?: Record<string, any>, options?: { limit?: number; skip?: number }) {
		const pipeline: Record<string, any>[] = [];
		if (filter) pipeline.push({ $match: filter });
		if (options?.skip !== undefined) pipeline.push({ $skip: options.skip });
		if (options?.limit !== undefined) pipeline.push({ $limit: options.limit });
		pipeline.push({ $group: { _id: null, count: { $sum: 1 } } });
		pipeline.push({ $project: { _id: 0 } });

		const [result] = await this.aggregate<{ count: { $numberInt: string } }>(pipeline);
		return result?.count?.$numberInt ? parseInt(result.count.$numberInt) : 0;
	}

	async estimatedDocumentCount() {
		const [result] = await this.aggregate<{ count: { $numberInt: string } }>([
			{ $collStats: { count: {} } },
			{ $group: { _id: null, count: { $sum: "$count" } } },
			{ $project: { _id: 0 } }
		]);
		return result?.count?.$numberInt ? parseInt(result.count.$numberInt) : 0;
	}

	private async sendApiRequest(method: string, body: Record<string, any> = {}) {
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
		if (!response.ok) throw new Error(`${response.statusText}: ${responseText}`);

		return EJSON.parse(responseText);
	}
}
