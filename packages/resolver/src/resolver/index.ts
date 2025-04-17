import { SingularityQLStatus } from "../../../shared";
import { parse } from "../parser";
import { QueryParamType } from "../parser/query";

export type ResolverResult = {
    [key: string]: any;
    status: SingularityQLStatus;
    error?: string;
};

export type Resolver = (...args: any[]) => Promise<ResolverResult> | ResolverResult;

export const resolvers: Map<String, Resolver> = new Map();

const RESERVED_KEYWORDS = ["status", "error"];

export function addResolver(name: string, handler: Resolver) {
    if (RESERVED_KEYWORDS.find(keyword => keyword == name)) {
        throw new Error(`Cannot create resolver \`${name}\` because it is a reserved keyword in SingularityQL`);
    }

    if (resolvers.get(name)) {
        throw new Error(`Resolver for \`${name}\` already exists`);
    }

    resolvers.set(name, handler);
}

export async function resolve(queryStr: string, placeholders: { [key: string]: any }): Promise<ResolverResult> {
    const output: ResolverResult = {
        status: SingularityQLStatus.Unknown
    };

    try {
        const queries = parse(queryStr);
        const queryScopedVariables: { [key: string]: any } = {};
    
        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const resolver = resolvers.get(query.resolverName);
            const queryResult: { [key: string]: any } = {};
    
            if (!resolver)
                throw new Error(`Unknown resolver \`${query.resolverName}\``);
    
            const resolved = await resolver(...query.params.map(param => {
                if (param.type == QueryParamType.StringLiteral) {
                    return param.value;
                }
                else if (param.type == QueryParamType.NumberLiteral) {
                    let result = Number(param.value);
                        
                    if (Number.isNaN(result))
                        throw new Error("Failed to parse Number");
    
                    return result;
                }
                else if (param.type == QueryParamType.Placeholder) {
                    let result = placeholders[param.value];
    
                    if (result == undefined)
                        throw new Error(`Placeholder \`${param.value}\` was not passed`);
    
                    return result;
                }
                else if (param.type == QueryParamType.QueryVariable) {
                    let result = queryScopedVariables[param.value];
    
                    if (result == undefined)
                        throw new Error(`Query-scoped variable \`${param.value}\` does not exist`);
    
                    return result;
                }
    
                throw new Error("Unknown query parameter type");
            }));
    
            for (let j = 0; j < query.requestedData.length; j++) {
                const dataRequest = query.requestedData[j];
                const value = resolved[dataRequest.value];
    
                if (!value && !dataRequest.optional)
                    throw new Error(`Value \`${dataRequest.value}\` was requested but not returned by the resolver`);
    
                queryResult[dataRequest.alias || dataRequest.value] = value;
                queryScopedVariables[dataRequest.alias || dataRequest.value] = value;
            }
    
            output[query.alias || query.resolverName] = queryResult;
        }

        output["status"] = SingularityQLStatus.Ok;
    
        return output;
    }
    catch (err: any) {
        output["status"] = SingularityQLStatus.Error;
        output["error"] = err.toString();
    }

    return output;
}
