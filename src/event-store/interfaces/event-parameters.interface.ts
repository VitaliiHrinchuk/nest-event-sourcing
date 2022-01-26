export interface EventParameters {
    id: string;
    name: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    version: number;
    payload?: object;
    metadata?: object;
}