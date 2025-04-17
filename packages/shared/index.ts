export enum SingularityQLStatus {
    Unknown,
    Ok,
    Error
}

export type ResolverResult = {
    [key: string]: any;
};

export interface ResolverOutput extends ResolverResult {
    status: SingularityQLStatus;
    error?: string;
};
