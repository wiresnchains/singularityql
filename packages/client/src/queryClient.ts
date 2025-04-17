import { ResolverOutput, SingularityQLStatus } from "../../shared/index";

export class QueryClient {
    private serverUrl: string;

    constructor(serverUrl: string) {
        this.serverUrl = serverUrl;
    }

    public async query(query: string, placeholders: { [key: string]: any }): Promise<ResolverOutput | undefined> {
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
    
            return body;
        }
        catch (err) {
            console.error(err);
        }
    }
}
