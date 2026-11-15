import { Int, Str, Dict, Dictionary, Num } from '../types.js';
interface CustomArray extends Array<any> {
    hashmap: Dictionary<any>;
}
declare class BaseCache extends Array {
    maxSize: Int;
    constructor(maxSize?: Int);
    clear(): void;
    removeAt(index: Int): any;
}
declare class ArrayCache extends BaseCache implements CustomArray {
    hashmap: Dictionary<any>;
    nestedNewUpdatesBySymbol: boolean;
    newUpdatesBySymbol: Dictionary<number>;
    seenUpdatesBySymbol: Dictionary<Set<any>>;
    seenUpdatesAll: Dictionary<Set<any>>;
    clearUpdatesBySymbol: Dictionary<boolean>;
    allNewUpdates: number;
    clearAllUpdates: boolean;
    constructor(maxSize?: Int);
    getLimit(symbol: Str, limit: Int): Int;
    clear(): void;
    append(item: Dict): void;
}
declare class ArrayCacheByTimestamp extends BaseCache {
    hashmap: Dictionary<any>;
    sizeTracker: Set<any>;
    newUpdates: number;
    clearUpdates: boolean;
    constructor(maxSize?: Int);
    getLimit(symbol: Str, limit: Int): Int;
    clear(): void;
    append(item: Num[]): void;
}
declare class ArrayCacheBySymbolById extends ArrayCache {
    keyField: Str;
    constructor(maxSize?: Int);
    append(item: Dict): void;
}
declare class ArrayCacheByOutcomeById extends ArrayCacheBySymbolById {
    constructor(maxSize?: Int);
}
declare class ArrayCacheBySymbolBySide extends ArrayCache {
    constructor();
    append(item: Dict): void;
}
export { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCacheByOutcomeById, ArrayCacheBySymbolBySide, };
