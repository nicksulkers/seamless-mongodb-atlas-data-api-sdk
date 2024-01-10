import { Collection } from "./Collection.js";

export class MongoClient {
	instance: string; // Cluster0
	endpoint: string; // https://eu-west-2.aws.data.mongodb-api.com/app/data-ovfml/endpoint/data/v1
	apiKey: string; // 1234567890

	constructor(options: { instance: string; endpoint: string; apiKey: string }) {
		for (const key in options) this[key] = options[key];
	}

	connect(callback?: (error: any, client: MongoClient) => any): Promise<MongoClient> {
		if (callback) callback(null, this);
		return Promise.resolve(this);
	}

	db(dbName: string) {
		return {
			collection: (collectionName: string) => new Collection(this, dbName, collectionName)
		};
	}
}
