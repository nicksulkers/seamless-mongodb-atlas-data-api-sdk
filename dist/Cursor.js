export class Cursor {
    collection;
    options;
    fetchMethod;
    cache = [];
    position = 0;
    mapMethod = (document) => document;
    constructor(collection, options = { filter: {} }, fetchMethod) {
        this.collection = collection;
        this.options = options;
        this.fetchMethod = fetchMethod;
    }
    async fetchMore(defaultLimit = 25) {
        if (this.position >= this.cache.length) {
            const specifiedLimit = this.options.limit;
            const fetchedCount = this.cache.length;
            const remainingLimit = specifiedLimit ? Math.min(defaultLimit, specifiedLimit - fetchedCount) : defaultLimit;
            if (fetchedCount < remainingLimit) {
                const { documents } = await this.fetchMethod({
                    ...this.options,
                    skip: (this.options.skip || 0) + fetchedCount,
                    limit: remainingLimit
                });
                this.cache.push(...documents);
            }
        }
    }
    reset() {
        this.cache = [];
        this.position = 0;
    }
    async hasNext() {
        await this.fetchMore();
        return this.cache[this.position] !== undefined;
    }
    async next() {
        await this.fetchMore();
        if (this.position < this.cache.length) {
            return this.mapMethod(this.cache[this.position++]);
        }
        return null;
    }
    async toArray() {
        while (await this.next()) { }
        return this.cache.map(this.mapMethod);
    }
    map(mapMethod) {
        // @ts-ignore: Overriding mapMethod for type transformation.
        this.mapMethod = mapMethod;
        return this;
    }
    project(projection) {
        this.options.projection = projection;
        this.reset();
        return this;
    }
    filter(filter) {
        this.options.filter = filter;
        this.reset();
        return this;
    }
    sort(sort) {
        this.options.sort = sort;
        this.reset();
        return this;
    }
    limit(limit) {
        this.options.limit = limit;
        this.reset();
        return this;
    }
    skip(skip) {
        this.options.skip = skip;
        this.reset();
        return this;
    }
    clone() {
        const clone = new Cursor(this.collection, this.options, this.fetchMethod);
        clone.cache = this.cache;
        return clone;
    }
    close() {
        this.reset();
        return Promise.resolve();
    }
}
