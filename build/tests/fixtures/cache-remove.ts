import { ArrayCacheBySymbolBySide } from '../../../ts/src/base/ws/Cache.js';
class Other {
    remove (symbol: string) {}
}
export default class Probe {
    cache: ArrayCacheBySymbolBySide;
    other: Other;
    run (cache: ArrayCacheBySymbolBySide, symbol: string) {
        cache.remove (symbol);
        this.cache.remove (symbol);
        this.other.remove (symbol);
    }
}
