declare class BaseCache extends Array {
    constructor(maxSize?: undefined);
    clear(): void;
}
declare class ArrayCache extends BaseCache {
    constructor(maxSize?: undefined);
    getLimit(symbol: any, limit: any): any;
    append(item: any): void;
}
declare class ArrayCacheByTimestamp extends BaseCache {
    constructor(maxSize?: undefined);
    getLimit(symbol: any, limit: any): any;
    append(item: any): void;
}
declare class ArrayCacheBySymbolById extends ArrayCache {
    constructor(maxSize?: undefined);
    append(item: any): void;
}
declare class ArrayCacheBySymbolBySide extends ArrayCache {
    constructor();
    append(item: any): void;
}
export { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, };
