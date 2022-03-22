import {Options} from "./useQuery";

interface query {
    asyncFn: () => any
    limitRequest?: number;
}

export class Observer {
    private queries: { [key: string]: query } = {};
    private timer: NodeJS.Timeout | null = null;

    public shouldLoadOnMount(options: Options) {
        return options.enabled !== false;
    }

    private getQuery(key: string): query {
        return this.queries[key];
    }

    public add(key: string, asyncFn: () => any, options: Options) {
        this.queries[key] = {
            asyncFn,
            limitRequest: options.retry || 0,
        }
    }

    private async fetchWithLimit(request: () => any, limit: number) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await request();
                resolve(response);
            } catch (e) {
                if (!limit) {
                    reject(e);
                } else {
                    setTimeout(() => {
                        resolve(this.fetchWithLimit(request, limit - 1))
                    }, 1000);
                }
            }
        })
    }

    public async toCallQuery(key: string, options: Options): Promise<Promise<any> | null> {
        return new Promise(async (resolve, reject) => {
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.timer = setTimeout(async () => {
                try {
                    const query = this.getQuery(key);
                    const response = await this.fetchWithLimit(query.asyncFn, query.limitRequest!);
                    resolve(response)
                } catch (e) {
                    reject(e);
                }
                this.removeQuery(key);
            }, options.debounce)
        })
    }

    private removeQuery(key: string) {
        delete this.queries[key];
    }

    public getAll() {
        return this.queries;
    }
}