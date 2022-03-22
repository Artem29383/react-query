interface query {
    asyncFn: () => any
}

export class Observer {
    private queries: {[key: string]: query} = {};

    add(key: string, asyncFn: () => any) {
        this.queries[key] = {
            asyncFn
        }
    }

    getQuery(key: string): query {
        return this.queries[key];
    }

    getAll() {
        return this.queries;
    }
}