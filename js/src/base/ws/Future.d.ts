export interface FutureInterface extends Promise<any> {
    resolve(value: unknown): void;
    reject(reason?: any): void;
}
export declare function Future(): FutureInterface;
export declare namespace Future {
    var race: (futures: any) => FutureInterface;
}
