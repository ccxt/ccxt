import { Int, IndexType } from '../types.js';
interface IOrderBookSide<T> extends Array<T> {
    store(price: IndexType | undefined, size: IndexType | undefined): void;
    storeArray(array: (IndexType | undefined)[]): void;
    limit(): void;
}
declare class OrderBookSide extends Array implements IOrderBookSide<any> {
    index: Float64Array;
    depth: number;
    side: boolean;
    constructor(deltas?: Array<(IndexType | undefined)[]>, depth?: Int);
    storeArray(delta: (IndexType | undefined)[]): void;
    store(price: IndexType | undefined, size: IndexType | undefined): void;
    limit(): void;
    copy(): OrderBookSide;
}
declare class CountedOrderBookSide extends OrderBookSide {
    store(price: IndexType | undefined, size: IndexType | undefined): void;
    storeArray(delta: (IndexType | undefined)[]): void;
}
declare class IndexedOrderBookSide extends Array implements IOrderBookSide<any> {
    index: Float64Array;
    depth: number;
    hashmap: Map<any, any>;
    side: boolean;
    constructor(deltas?: Array<(IndexType | undefined)[]>, depth?: Int);
    store(price: IndexType | undefined, size: IndexType | undefined): void;
    storeArray(delta: (IndexType | undefined)[]): void;
    limit(): void;
    copy(): OrderBookSide;
}
declare class Asks extends OrderBookSide {
    get side(): boolean;
}
declare class Bids extends OrderBookSide {
    get side(): boolean;
}
declare class CountedAsks extends CountedOrderBookSide {
    get side(): boolean;
}
declare class CountedBids extends CountedOrderBookSide {
    get side(): boolean;
}
declare class IndexedAsks extends IndexedOrderBookSide {
    get side(): boolean;
}
declare class IndexedBids extends IndexedOrderBookSide {
    get side(): boolean;
}
export { Asks, Bids, OrderBookSide, CountedAsks, CountedBids, CountedOrderBookSide, IndexedAsks, IndexedBids, IndexedOrderBookSide, IOrderBookSide };
