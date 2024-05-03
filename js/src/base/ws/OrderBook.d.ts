import { IOrderBookSide } from './OrderBookSide.js';
import { Int, Str } from '../types.js';
interface CustomOrderBookProp {
    cache: any[];
}
declare class OrderBook implements CustomOrderBookProp {
    cache: any[];
    asks: IOrderBookSide<any>;
    bids: IOrderBookSide<any>;
    timestamp: Int;
    datetime: Str;
    nonce: Int;
    symbol: Str;
    constructor(snapshot?: {}, depth?: any);
    limit(): this;
    update(snapshot: any): this;
    reset(snapshot?: {}): this;
}
declare class CountedOrderBook extends OrderBook {
    constructor(snapshot?: {}, depth?: any);
}
declare class IndexedOrderBook extends OrderBook {
    constructor(snapshot?: {}, depth?: any);
}
export { OrderBook, CountedOrderBook, IndexedOrderBook, };
