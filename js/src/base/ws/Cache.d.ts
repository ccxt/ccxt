import { Int } from '../types.js';
interface CustomArray extends Array<any> {
    hashmap: object;
}
declare class BaseCache extends Array {
    constructor(maxSize?: Int);
    clear(): void;
}
declare class ArrayCache extends BaseCache implements CustomArray {
    hashmap: object;
    constructor(maxSize?: Int);
    getLimit(symbol: any, limit: any): any;
    append(item: any): void;
}
declare class ArrayCacheByTimestamp extends BaseCache {
    constructor(maxSize?: Int);
    getLimit(symbol: any, limit: any): any;
    append(item: any): void;
}
declare class ArrayCacheBySymbolById extends ArrayCache {
    constructor(maxSize?: Int);
    append(item: any): void;
}
declare class ArrayCacheByOutcomeById extends ArrayCacheBySymbolById {
    constructor(maxSize?: any);
}
declare class ArrayCacheBySymbolBySide extends ArrayCache {
    constructor();
    append(item: any): void;
}
export { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheByOutcomeById, ArrayCacheBySymbolBySide, };
