declare class OrderBook {
    constructor(snapshot?: {}, depth?: undefined);
    limit(): this;
    update(snapshot: any): this;
    reset(snapshot?: {}): this;
}
declare class CountedOrderBook extends OrderBook {
    constructor(snapshot?: {}, depth?: undefined);
}
declare class IndexedOrderBook extends OrderBook {
    constructor(snapshot?: {}, depth?: undefined);
}
export { OrderBook, CountedOrderBook, IndexedOrderBook, };
