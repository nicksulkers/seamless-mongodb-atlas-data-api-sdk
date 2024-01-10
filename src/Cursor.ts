import type { Collection } from "./Collection.js";

export class Cursor<T> {
	private cache: T[] = [];
	private position = 0;
	private mapMethod = (document: T) => document;

	constructor(
		private collection: Collection<T>,
		private options: {
			filter: Record<string, any>;
			projection?: Record<string, any>;
			sort?: Record<string, any>;
			limit?: number;
			skip?: number;
		} = { filter: {} },
		private fetchMethod: (newOptions: typeof options) => Promise<{ documents: T[] }>
	) {}

	private async fetchMore(defaultLimit = 25) {
		if (this.position >= this.cache.length) {
			const specifiedLimit = this.options.limit;
			const fetchedCount = this.cache.length;
			const remainingLimit = specifiedLimit ? Math.min(defaultLimit, specifiedLimit - fetchedCount) : defaultLimit;

			if (fetchedCount < specifiedLimit && remainingLimit > 0) {
				const { documents }: { documents: T[] } = await this.fetchMethod({
					...this.options,
					skip: (this.options.skip || 0) + fetchedCount,
					limit: remainingLimit
				});
				this.cache.push(...documents);
			}
		}
	}

	private reset() {
		this.cache = [];
		this.position = 0;
	}

	async hasNext() {
		await this.fetchMore();
		return this.cache[this.position] !== undefined;
	}

	async next(): Promise<T | null> {
		await this.fetchMore();
		if (this.position < this.cache.length) {
			return this.mapMethod(this.cache[this.position++]);
		}
		return null;
	}

	async toArray() {
		while (await this.next()) {}
		return this.cache.map(this.mapMethod);
	}

	map<U>(mapMethod: (document: T) => U) {
		// @ts-ignore: Overriding mapMethod for type transformation.
		this.mapMethod = mapMethod;
		return this as unknown as Cursor<U>;
	}

	project(projection: typeof this.options.projection) {
		this.options.projection = projection;
		this.reset();
		return this;
	}

	filter(filter: typeof this.options.filter) {
		this.options.filter = filter;
		this.reset();
		return this;
	}

	sort(sort: typeof this.options.sort) {
		this.options.sort = sort;
		this.reset();
		return this;
	}

	limit(limit: typeof this.options.limit) {
		this.options.limit = limit;
		this.reset();
		return this;
	}

	skip(skip: typeof this.options.skip) {
		this.options.skip = skip;
		this.reset();
		return this;
	}

	clone() {
		const clone = new Cursor<T>(this.collection, this.options, this.fetchMethod);
		clone.cache = this.cache;
		return clone;
	}

	close() {
		this.reset();
		return Promise.resolve();
	}
}
