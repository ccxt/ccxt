interface CustomArray extends Array {
    hashmap: object;
}
declare class BaseCache extends Array {
    constructor(maxSize?: any);
    clear(): void;
}
declare class ArrayCache extends BaseCache implements CustomArray {
    hashmap: object;
    constructor(maxSize?: any);
    getLimit(symbol: any, limit: any): any;
    append(item: any): void;
}
declare class ArrayCacheByTimestamp extends BaseCache {
    constructor(maxSize?: any);
    getLimit(symbol: any, limit: any): any;
    append(item: any): void;
}
declare class ArrayCacheBySymbolById extends ArrayCache {
    constructor(maxSize?: any);
    append(item: any): void;
}
declare class ArrayCacheBySymbolBySide extends ArrayCache {
    constructor();
    append(item: any): void;
}
export { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, };
