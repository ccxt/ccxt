/* eslint-disable max-classes-per-file */
// @ts-nocheck
class BaseCache extends Array {
    constructor(maxSize = undefined) {
        super();
        Object.defineProperty(this, 'maxSize', {
            __proto__: null,
            value: maxSize,
            writable: true,
        });
    }
    clear() {
        this.length = 0;
    }
}
class ArrayCache extends BaseCache {
    constructor(maxSize = undefined) {
        super(maxSize);
        Object.defineProperty(this, 'nestedNewUpdatesBySymbol', {
            __proto__: null,
            value: false,
            writable: true,
        });
        Object.defineProperty(this, 'newUpdatesBySymbol', {
            __proto__: null,
            value: {},
            writable: true,
        });
        Object.defineProperty(this, 'clearUpdatesBySymbol', {
            __proto__: null,
            value: {},
            writable: true,
        });
        Object.defineProperty(this, 'allNewUpdates', {
            __proto__: null,
            value: 0,
            writable: true,
        });
        Object.defineProperty(this, 'clearAllUpdates', {
            __proto__: null,
            value: false,
            writable: true,
        });
    }
    getLimit(symbol, limit) {
        let newUpdatesValue = undefined;
        if (symbol === undefined) {
            newUpdatesValue = this.allNewUpdates;
            this.clearAllUpdates = true;
        }
        else {
            newUpdatesValue = this.newUpdatesBySymbol[symbol];
            if ((newUpdatesValue !== undefined) && this.nestedNewUpdatesBySymbol) {
                newUpdatesValue = newUpdatesValue.size;
            }
            this.clearUpdatesBySymbol[symbol] = true;
        }
        if (newUpdatesValue === undefined) {
            return limit;
        }
        else if (limit !== undefined) {
            return Math.min(newUpdatesValue, limit);
        }
        else {
            return newUpdatesValue;
        }
    }
    append(item) {
        // maxSize may be 0 when initialized by a .filter() copy-construction
        if (this.maxSize && (this.length === this.maxSize)) {
            this.shift();
        }
        this.push(item);
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false;
            this.clearUpdatesBySymbol = {};
            this.allNewUpdates = 0;
            this.newUpdatesBySymbol = {};
        }
        if (this.clearUpdatesBySymbol[item.symbol]) {
            this.clearUpdatesBySymbol[item.symbol] = false;
            this.newUpdatesBySymbol[item.symbol] = 0;
        }
        this.newUpdatesBySymbol[item.symbol] = (this.newUpdatesBySymbol[item.symbol] || 0) + 1;
        this.allNewUpdates = (this.allNewUpdates || 0) + 1;
    }
}
class ArrayCacheByTimestamp extends BaseCache {
    constructor(maxSize = undefined) {
        super(maxSize);
        Object.defineProperty(this, 'hashmap', {
            __proto__: null,
            value: {},
            writable: true,
        });
        Object.defineProperty(this, 'sizeTracker', {
            __proto__: null,
            value: new Set(),
            writable: true,
        });
        Object.defineProperty(this, 'newUpdates', {
            __proto__: null,
            value: 0,
            writable: true,
        });
        Object.defineProperty(this, 'clearUpdates', {
            __proto__: null,
            value: false,
            writable: true,
        });
    }
    getLimit(symbol, limit) {
        this.clearUpdates = true;
        if (limit === undefined) {
            return this.newUpdates;
        }
        return Math.min(this.newUpdates, limit);
    }
    append(item) {
        if (item[0] in this.hashmap) {
            const reference = this.hashmap[item[0]];
            if (reference !== item) {
                for (const prop in item) {
                    reference[prop] = item[prop];
                }
            }
        }
        else {
            this.hashmap[item[0]] = item;
            if (this.maxSize && (this.length === this.maxSize)) {
                const deleteReference = this.shift();
                delete this.hashmap[deleteReference[0]];
            }
            this.push(item);
        }
        if (this.clearUpdates) {
            this.clearUpdates = false;
            this.sizeTracker.clear();
        }
        this.sizeTracker.add(item[0]);
        this.newUpdates = this.sizeTracker.size;
    }
}
class ArrayCacheBySymbolById extends ArrayCache {
    constructor(maxSize = undefined) {
        super(maxSize);
        this.nestedNewUpdatesBySymbol = true;
        Object.defineProperty(this, 'hashmap', {
            __proto__: null,
            value: {},
            writable: true,
        });
    }
    append(item) {
        const byId = this.hashmap[item.symbol] = this.hashmap[item.symbol] || {};
        if (item.id in byId) {
            const reference = byId[item.id];
            if (reference !== item) {
                for (const prop in item) {
                    reference[prop] = item[prop];
                }
            }
            item = reference;
            const index = this.findIndex((x) => x.id === item.id);
            // move the order to the end of the array
            this.splice(index, 1);
        }
        else {
            byId[item.id] = item;
        }
        if (this.maxSize && (this.length === this.maxSize)) {
            const deleteReference = this.shift();
            delete this.hashmap[deleteReference.symbol][deleteReference.id];
        }
        this.push(item);
        if (this.clearAllUpdates) {
            this.clearAllUpdates = false;
            this.clearUpdatesBySymbol = {};
            this.allNewUpdates = 0;
            this.newUpdatesBySymbol = {};
        }
        if (this.newUpdatesBySymbol[item.symbol] === undefined) {
            this.newUpdatesBySymbol[item.symbol] = new Set();
        }
        if (this.clearUpdatesBySymbol[item.symbol]) {
            this.clearUpdatesBySymbol[item.symbol] = false;
            this.newUpdatesBySymbol[item.symbol].clear();
        }
        // in case an exchange updates the same order id twice
        const idSet = this.newUpdatesBySymbol[item.symbol];
        const beforeLength = idSet.size;
        idSet.add(item.id);
        const afterLength = idSet.size;
        this.allNewUpdates = (this.allNewUpdates || 0) + (afterLength - beforeLength);
    }
}
export { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById, };
