import { OrderBookSide } from './OrderBookSide.js';
import { Int, Str, Dict, List } from '../types.js';
interface CustomOrderBookProp {
}
declare class OrderBook implements CustomOrderBookProp {
    cache: List;
    asks: OrderBookSide;
    bids: OrderBookSide;
    timestamp: Int;
    datetime: Str;
    nonce: Int;
    symbol: Str;
    outcome: Str;
    outcomeId: Str;
    market: Str;
    constructor(snapshot?: Dict, depth?: Int);
    limit(): OrderBook;
    update(snapshot: Dict): OrderBook;
    reset(snapshot?: Dict): OrderBook;
    copy(): OrderBook;
}
declare class CountedOrderBook extends OrderBook {
    constructor(snapshot?: Dict, depth?: Int);
}
declare class IndexedOrderBook extends OrderBook {
    constructor(snapshot?: Dict, depth?: Int);
}
export { OrderBook, OrderBook as WsOrderBook, CountedOrderBook, IndexedOrderBook, };
