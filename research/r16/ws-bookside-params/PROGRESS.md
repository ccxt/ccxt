# WS-BOOKSIDE-PARAMS progress

Base 71554d5011c. Branch typed90-sub-ws-bookside-params.

## Step 1 (5119e4e89da)
- Base Exchange.ts: new `handleBookDeltas (orderbook: any, deltas)` / `handleBookDelta (orderbook: any, delta)` (throws NotSupported);
  loadOrderBook replays its cache via handleBookDeltas (it passes the whole stored book).
- Renamed to handleBookDelta(s) (no behaviour change, every override and call in the file):
  backpack bithumb bitstamp coinbaseinternational deepcoin gate kucoin luno mexc onetrading xt
  (11 venues: brief's 9 + deepcoin and xt, both whole-book; xt/mexc/gate/backpack/kucoin/bitstamp use loadOrderBook).
- Base + 26 side overrides: `handleDelta(s) (bookside: IOrderBookSide<any>, ...)`; tsc clean, lint 0 errors.
- Farm replays (typed-param printing check): java j2057, cs j2058, go j2059 (--no-merge, --unit-tests).

## Step 2 (0e3d38cb639) hand-written loadOrderBook in every port replays via handleBookDeltas
cs Exchange.WsBridge.cs, go exchange.go (+ IDerivedExchange HandleBookDelta/HandleBookDeltas), java Exchange.java,
php pro/ClientTrait.php, python async_support/base/exchange.py, rust ccxt-base exchange.rs dispatch name.
Without this, the 6 loadOrderBook venues (backpack bitstamp gate kucoin mexc xt) would hit the base side loop.

## Step 3 (0f7c5a70672) FAIL CLOSED on the side type: base + 26 overrides keep `bookside: any`
- j2057/j2058/j2059 (typed IOrderBookSide<any> params) green but ZERO helper delta: Java prints `Object bookside`
  (JAVA_NATIVE_PARAMETER_TYPES only maps base/types.ts aliases), C# `object`, Go `any`; callDynamically store/storeArray
  62 -> 62. Printing a side type needs a generator mapping (IOrderBookSide -> io.github.ccxt.ws.OrderBookSide /
  ccxt.pro.IOrderBookSide / ccxt.IOrderBookSide) in the pin: out of this lead's scope (hand to root / ast #93).
- callers.mjs: 20 of 74 handleDelta(s) call args are `any` (orderbook params `any` in handleOrderBookMessage of
  binance bittrade bitvavo lighter okx woo; safeValue(this.orderbooks) locals in cex coinex coinone dydx) -> per brief,
  whole hierarchy stays any.
- Final replays: java j2061, cs j2062, go j2063 at 0f7c5a70672.
