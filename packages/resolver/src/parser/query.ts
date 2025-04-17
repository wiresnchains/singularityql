export enum QueryParamType {
    QueryVariable,
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
}

export type Query = {
    resolverName: string;
    params: QueryParam[];
    requestedData: QueryDataRequest[];
    alias?: string;
}
