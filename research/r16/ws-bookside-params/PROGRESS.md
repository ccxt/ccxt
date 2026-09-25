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
