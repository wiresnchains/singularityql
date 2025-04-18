export enum QueryParamType {
    QueryVariable,
    BooleanLiteral,
    StringLiteral,
    NumberLiteral,
    Placeholder
}

export type QueryParam = {
    type: QueryParamType;
    value: string;
}

export type QueryDataRequest = {
    value: string;
    alias?: string;
    optional: boolean;
    queryScopeOnly: boolean;
}

export type Query = {
    resolverName: string;
    params: QueryParam[];
    requestedData: QueryDataRequest[];
    alias?: string;
}
