declare class OrderBook {
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
