interface Future extends Promise<unknown> {
    resolve(value: unknown): void;
    reject(reason?: any): void;
}
export default function Future(): Future;
export {};
