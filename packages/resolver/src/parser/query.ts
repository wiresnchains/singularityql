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

export type Query = {
    resolverName: string;
    params: Array<QueryParam>;
    requestedData: string[];
}
