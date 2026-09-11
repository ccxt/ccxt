// Closed allow-list for the typed-return pass (JN-2: the public async surface of
// Exchange.java). Ported from ccxt/ccxt#30113; the C# analogue (ccxt/ccxt#30066) is merged.
//
// THIS TABLE IS DERIVED. Do not hand-edit it:
//
//     python3 build/javaTypedCoresClosedSet.py            # report the fixed point
//     python3 build/javaTypedCoresClosedSet.py --write    # rewrite the table
//     python3 build/javaTypedCoresClosedSet.py --check    # non-zero if it drifted
//
// A name is typed only when build/javaTypedCoresClosedSet.py proves all of:
//   1. every typed-wrapper conversion for it uses ONE family (new T(res) /
//      toTypedList(res, T::new)); a bare cast or two families excludes it;
//   2. the family is invertible (generateJavaTypedCoreHelpers.py --capabilities:
//      TypedCores.from* hands back `__raw`, the exact payload);
//   3. EVERY declaration on the crypto tier is in the transpiled supplyAsync
//      shape build/typeJavaCores.py retypes -- Java generics are invariant, so one
//      non-retypable declaration excludes the name (the C# CS0508 analogue);
//   4. it is not declared on BaseExchange.java (shared with the prediction tier);
//   5. no hand-written consumer above the TRANSPILED marker receives the value;
//   6. policy: watch* and *Ws stay out of this slice (REST async surface only).
//
// Consuming call sites are wrapped in the from* inverse by build/typeJavaCores.py,
// so a typed core hands untyped code the same raw Map/List it always did.

export const TYPED_CORES: Record<string, string> = {
    'cancelAllOrders': 'List<Order>',
    'cancelOrder': 'Order',
    'cancelOrderWithClientOrderId': 'Order',
    'cancelOrders': 'List<Order>',
    'cancelOrdersWithClientOrderIds': 'List<Order>',
    'cancelUnifiedOrder': 'Order',
    'closeAllPositions': 'List<Position>',
    'closePosition': 'Order',
    'createLimitBuyOrder': 'Order',
    'createLimitOrder': 'Order',
    'createLimitSellOrder': 'Order',
    'createMarketBuyOrder': 'Order',
    'createMarketBuyOrderWithCost': 'Order',
    'createMarketOrder': 'Order',
    'createMarketOrderWithCost': 'Order',
    'createMarketSellOrder': 'Order',
    'createMarketSellOrderWithCost': 'Order',
    'createOrder': 'Order',
    'createOrderWithTakeProfitAndStopLoss': 'Order',
    'createOrders': 'List<Order>',
    'createPostOnlyOrder': 'Order',
    'createReduceOnlyOrder': 'Order',
    'createStopLimitOrder': 'Order',
    'createStopLossOrder': 'Order',
    'createStopMarketOrder': 'Order',
    'createStopOrder': 'Order',
    'createTakeProfitOrder': 'Order',
    'createTrailingAmountOrder': 'Order',
    'createTrailingPercentOrder': 'Order',
    'createTriggerOrder': 'Order',
    'editLimitBuyOrder': 'Order',
    'editLimitOrder': 'Order',
    'editLimitSellOrder': 'Order',
    'editOrder': 'Order',
    'editOrderWithClientOrderId': 'Order',
    'editOrders': 'List<Order>',
    'fetchBidsAsks': 'Tickers',
    'fetchCanceledAndClosedOrders': 'List<Order>',
    'fetchCanceledOrders': 'List<Order>',
    'fetchClosedOrders': 'List<Order>',
    'fetchL2OrderBook': 'OrderBook',
    'fetchL3OrderBook': 'OrderBook',
    'fetchMarkPrice': 'Ticker',
    'fetchMarkPrices': 'Tickers',
    'fetchMyTrades': 'List<Trade>',
    'fetchOpenInterest': 'OpenInterest',
    'fetchOpenOrders': 'List<Order>',
    'fetchOrder': 'Order',
    'fetchOrderBook': 'OrderBook',
    'fetchOrderTrades': 'List<Trade>',
    'fetchOrderWithClientOrderId': 'Order',
    'fetchOrders': 'List<Order>',
    'fetchPosition': 'Position',
    'fetchPositionHistory': 'List<Position>',
    'fetchPositions': 'List<Position>',
    'fetchPositionsForSymbol': 'List<Position>',
    'fetchPositionsHistory': 'List<Position>',
    'fetchPositionsRisk': 'List<Position>',
    'fetchTicker': 'Ticker',
    'fetchTickers': 'Tickers',
    'fetchTrades': 'List<Trade>',
    'fetchTradingFee': 'TradingFeeInterface',
    'fetchUnifiedOrder': 'Order',
};

// This slice leaves the prediction tier untouched (PredictionExchange is a sibling of
// Exchange, not a subclass), so the table is deliberately empty.
export const PREDICTION_TYPED_CORES: Record<string, string> = {
};

// Live-ws snapshot cores (watchOrderBook*): mirrored for reference only; not enabled by
// this slice (watch* is R6-excluded).
export const SNAPSHOT_CORES: Record<string, { type: string, helper: string }> = {
};
