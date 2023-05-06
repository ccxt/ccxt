export interface Future extends Promise<unknown> {
    resolve(value: unknown): void;
    reject(reason?: any): void;
}
export declare function createFuture(): Future;
