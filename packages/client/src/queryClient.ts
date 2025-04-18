import { ResolverOutput, SingularityQLStatus } from "../../shared/index";
import stringify from "json-stable-stringify";

type CacheEntry = {
    value: ResolverOutput;
    expiresAt: number;
};

export type QueryOptions = {
    placeholders?: { [key: string]: any };
    cacheTTL?: number;
};

export class QueryClient {
    private serverUrl: string;
    private cache: Map<string, CacheEntry> = new Map();
    private defaultTTL: number = 5 * 60 * 1000;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    public async query(query: string, options: QueryOptions): Promise<ResolverOutput | undefined> {
        const placeholders = options.placeholders || {};

        const key = this.createCacheKey(query, placeholders);
        const now = Date.now();

        if (key) {
            const cached = this.cache.get(key);

            if (cached) {
                if (cached.expiresAt > now)
                    return cached.value;
    
                this.cache.delete(key);
            }
        }
        else {
            console.error("Failed to generate cache key");
        }

        try {
            const response = await fetch(this.serverUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sgql: {
                        query,
                        placeholders
                    }
                })
            });
    
            const body: ResolverOutput = await response.json();
    
            if (body.status != SingularityQLStatus.Ok)
                throw new Error(body.error);

            if (key) {
                this.cache.set(key, {
                    value: body,
                    expiresAt: now + (options.cacheTTL == undefined ? this.defaultTTL : options.cacheTTL)
                });
            }
    
            return body;
        }
        catch (err) {
            console.error(err);
        }
    }

    private createCacheKey(query: string, placeholders: { [key: string]: any }): string | undefined {
        return stringify({ query, placeholders });
    }
}
