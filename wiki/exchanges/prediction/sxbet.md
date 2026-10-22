
<a name="sxbet" id="sxbet"></a>

## sxbet{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchEvents](#fetchevents)
* [fetchEvent](#fetchevent)
* [approve](#approve)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [fetchSettlements](#fetchsettlements)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [watchOrderBook](#watchorderbook)
* [watchTicker](#watchticker)
* [watchTrades](#watchtrades)
* [watchMyTrades](#watchmytrades)
* [watchOrders](#watchorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all active markets, each becomes one market with its two sides listed under the outcomes key

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.sx.bet/api-reference/get-markets-active  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | max number of markets to collect (defaults to options.marketsPageSize * options.maxMarketsPages, 5000) |


```javascript
sxbet.fetchMarkets (params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches sx.bet fixtures (one fixture = one event, its markets are every moneyline/spread/total line on that fixture) scoped by eventId, leagueId, sportId or a free-text query/tags match against team and league names — always live from the API, never the local cache (it POPULATES the cache for later event()/outcome lookups). query/queries/tags are matched client-side over a bounded scan of /markets/active — the venue's GET /search covers team names only (not league or sport labels) and is not wired here yet

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**: https://docs.sx.bet/api-reference/get-markets-active  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.eventId | <code>string</code> | No | direct lookup by unified event id (the sx.bet sportXeventId, e.g. 'L18870109') |
| params.query | <code>string</code> | No | free-text search matched against team and league names |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple free-text searches (alternative to query, unioned) |
| params.tags | <code>Array&lt;string&gt;</code> | No | matched identically to query/queries (sx.bet has no tag taxonomy) |
| params.leagueId | <code>int</code> | No | sx.bet league id (e.g. 243 for NFL) — fetched server-side |
| params.sportId | <code>int</code> | No | sx.bet sport id (e.g. 8 for Football) — fetched server-side |
| params.status | <code>string</code> | No | 'active' | 'inactive' | 'closed' | 'all' |
| params.limit | <code>int</code> | No | max number of events to return |


```javascript
sxbet.fetchEvents (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single sx.bet fixture (event) by its sportXeventId

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://docs.sx.bet/api-reference/get-markets-active  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the sx.bet sportXeventId, e.g. 'L18870109' |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchEvent (id, params?)
```


<a name="approve" id="approve"></a>

### approve{docsify-ignore}
funds the account's obv3 proxy wallet - v3 trading capital must sit inside the proxy. Deploys the proxy first when absent, then moves USDC from the wallet into it via a gasless EIP-2612 Permit signature (POST /user/transfer-to-proxy)

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a dict with the raw response and the transfer sessionId

**See**

- https://docs.sx.bet/api-reference/post-user-transfer-to-proxy
- https://docs.sx.bet/api-reference/post-user-deploy-proxy


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.amount | <code>float</code> | No | the USDC amount to move into the proxy (required) |
| params.tokenAddress | <code>string</code> | No | the token to transfer, defaults to the active base token |
| params.spender | <code>string</code> | No | the transfer executor granted the permit, defaults to options.transferToProxySpender or the obv3 transferToProxyExecutorAddress |
| params.deadline | <code>int</code> | No | unix seconds the permit signature expires at, defaults to options.approveDeadlineSeconds from now |
| params.rpcUrl | <code>string</code> | No | overrides the chain's default RPC endpoint (see options.chains) |


```javascript
sxbet.approve (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
places an order on sx.bet's v3 unified orderbook - a 'limit' order rests with GTC time-in-force, a 'market' order fills immediately with IOC (or FOK via params.timeInForce). sx.bet has no shares - 'amount' is the USDC stake to risk, and 'price' is the implied probability (0-1) of the requested outcome. 'sell' bets the OPPOSITE outcome of the one requested (sx.bet is bilateral: there is no owned position to sell, only the complementary side of the same market)

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/post-orders-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| type | <code>string</code> | Yes | 'limit' (GTC resting order) or 'market' (IOC immediate fill) |
| side | <code>string</code> | Yes | 'buy' backs the requested outcome, 'sell' backs the complementary one |
| amount | <code>float</code> | Yes | the USDC amount to stake/risk |
| price | <code>float</code> | No | implied probability (0-1) of the requested outcome; required for both order types |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | overrides the derived value - 'GTC', 'IOC' or 'FOK' |
| params.expiry | <code>int</code> | No | unix seconds the order expires at; must be in the future (zero and past values are rejected, so is anything inside the fixture's betting-delay window - /metadata/obv3 resolves the delay per sport/league, live vs pregame), defaults to options.defaultOrderExpirySeconds from now |
| params.salt | <code>string</code> | No | overrides the random salt differentiating this order |
| params.clientOrderId | <code>string</code> | No | caller-chosen id echoed back on reads (max 64 chars) |
| params.waitForOutcome | <code>boolean</code> | No | wait for the matching outcome inline (default true) |
| params.useBetCredits | <code>boolean</code> | No | fund the stake from bet credits instead of the proxy balance (IOC/FOK only) |
| params.externalUserId | <code>string</code> | No | partner attribution id echoed back on order, fill and trade reads |


```javascript
sxbet.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels one resting maker order - v3 cancels are plain api-key-authenticated DELETE requests, no signature involved

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/delete-orders-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| outcome | <code>string</code> | No | not used by sxbet.cancelOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.cancelOrder (id, outcome?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancels multiple resting maker orders in one request - v3 cancels are plain api-key-authenticated DELETE requests, no signature involved

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/delete-orders-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | the order ids to cancel |
| outcome | <code>string</code> | No | not used by sxbet.cancelOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.cancelOrders (ids, outcome?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels every resting maker order of the account, or every order of one fixture via params.eventId - v3 cancels are plain api-key-authenticated DELETE requests, no signature involved

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**

- https://docs.sx.bet/api-reference/delete-orders-v3-all
- https://docs.sx.bet/api-reference/delete-orders-v3-event


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | not used by sxbet.cancelAllOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.eventId | <code>string</code> | No | cancels every order across every market of this fixture instead of the account-wide path (params.sportXeventId is accepted too) |


```javascript
sxbet.cancelAllOrders (outcome?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches the account's resting maker orders via the api-key-authenticated GET /orders-v3 (the route is hardcoded to ACTIVE orders and scoped to the key's account)

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/get-orders-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcomeId — narrows to that outcome's market |
| since | <code>int</code> | No | applied client-side (the route has no date filter; rows carry createdAt) |
| limit | <code>int</code> | No | the maximum number of orders to return (server-side perPage, max 100, default 50) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (e.g. eventId, sortBy, sortAsc, nextKey) |


```javascript
sxbet.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches the account's maker orders. sx.bet's GET /orders-v3 listing is hardcoded to ACTIVE orders — filled/cancelled/expired orders leave the listing permanently (their history is only reconstructable from fills), so this returns the same set that fetchOpenOrders returns

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/get-orders-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcomeId — narrows to that outcome's market |
| since | <code>int</code> | No | applied client-side (the route has no date filter; rows carry createdAt) |
| limit | <code>int</code> | No | the maximum number of orders to return (server-side perPage, max 100, default 50) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (e.g. eventId, sortBy, sortAsc, nextKey) |


```javascript
sxbet.fetchOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches a single maker order by its order hash - unlike the listing, GET /orders-v3/{orderId} also serves filled, cancelled and expired orders while they still exist. a missing or foreign id 404s with 'Order not found', surfaced through handleErrors's OrderNotFound mapping

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/get-order-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order hash |
| outcome | <code>string</code> | No | unified outcome or outcomeId (labelling hint only, the request needs just the id) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchOrder (id, outcome?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches the public trade tape of one outcome's market — every bettor's settled and in-flight bets on that market. the venue requires the trades listing to be scoped, so the outcome argument is mandatory

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.sx.bet/api-reference/get-trades-v3-public  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcomeId |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return — applied client-side over the newest page (the public tape serves newest-first and has no date filter; older pages are reachable through params.nextKey) |
| limit | <code>int</code> | No | the maximum number of trades to return (server-side perPage, max 100, default 50) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (e.g. eventId, nextKey) |


```javascript
sxbet.fetchTrades (outcome, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the account's fills (matched legs of its own orders, both taker and maker side) via the api-key-authenticated GET /fills-v3

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.sx.bet/api-reference/get-fills-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcomeId — narrows to that outcome's market and drops the opposite side's legs |
| since | <code>int</code> | No | timestamp in ms of the earliest fill to fetch (server-side startDate) |
| limit | <code>int</code> | No | the maximum number of fills to return (server-side perPage, max 100, default 50) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (e.g. tradeId, orderId, endDate, sortAsc, nextKey) |


```javascript
sxbet.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
fetches the account's order-spendable proxy balance from GET /user/balance-v3 - v3 trading capital sits inside the obv3 proxy wallet (funded via approve()), and GTC posting is checked against availableAmount. free is the spendable availableAmount, used the escrowedAmount locked behind open bets

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.sx.bet/api-reference/get-user-balance-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchBalance (params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches the account's open positions from the venue's per-market aggregates (GET /positions-v3, MATCHED and LOCKED bets by default; override with params.status - the enum is MATCHED, LOCKED, SETTLED, FAILED, and pnl is populated only when the filter is exclusively SETTLED). contracts is the total stake at risk, entryPrice the blended implied probability of the market's best-case outcome

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://docs.sx.bet/api-reference/get-positions-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | filter by unified outcomes or outcomeIds |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchPositions (outcomes?, params?)
```


<a name="fetchSettlements" id="fetchsettlements"></a>

### fetchSettlements{docsify-ignore}
fetches the account's settled bets — each settled GET /trades-v3 row becomes one settlement with the resolved winner, the payout (stake / odds when won, the stake back when the market voided, zero when lost) and the realized pnl

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of prediction settlement structures

**See**: https://docs.sx.bet/api-reference/get-trades-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter to a single unified outcome or outcomeId |
| since | <code>int</code> | No | timestamp in ms of the earliest settlement to fetch (server-side startDate on the bet time) |
| limit | <code>int</code> | No | the maximum number of settlements to fetch (server-side perPage, max 100, default 50) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (e.g. eventId, endDate, sortAsc, nextKey) |


```javascript
sxbet.fetchSettlements (outcome?, since?, limit?, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the current best resting odds for a single sx.bet outcome. sx.bet is a peer-to-peer odds book (no matched-trade tape or candles), so bid/ask are the best (highest) percentageOdds resting on this outcome's own side and its mirror (1 - best percentageOdds resting on the opposite outcome)

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://docs.sx.bet/api-reference/get-orderbook-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle or outcomeId (marketHash or marketHash + '-2') |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchTicker (outcome, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches the current best resting odds for multiple sx.bet outcomes, one book snapshot per market

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome

**See**: https://docs.sx.bet/api-reference/get-orderbook-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes - required: sx.bet has thousands of markets and no endpoint returning all of them at once |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchTickers (outcomes, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the resting maker order book for a single sx.bet outcome. bids are maker orders already betting on this outcome (priced at each maker's own implied probability, sized by their remaining stake); asks mirror the opposite outcome's maker orders (price = 1 - their implied probability, sized by how much a taker could bet against them, per sx.bet's remaining-taker-space formula) — the same YES/NO-style mirrored construction used across this codebase's other binary prediction venues

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.sx.bet/api-reference/get-orderbook-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle or outcomeId |
| limit | <code>int</code> | No | the maximum number of bids/asks to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.fetchOrderBook (outcome, limit?, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
streams the order book of an outcome - the v3 channel publishes the entire aggregated book on every update with a monotonic version, so each message replaces the held book

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.sx.bet/api-reference/channel-orderbook-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| limit | <code>int</code> | No | the maximum number of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.watchOrderBook (outcome, limit?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
streams best-odds updates of an outcome; the venue channel is global, entries are filtered down to the requested outcome's market

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://docs.sx.bet/api-reference/channel-best-odds-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.watchTicker (outcome, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
streams public bets of an outcome; the venue channel is global, entries are filtered down to the requested outcome

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.sx.bet/api-reference/channel-recent-trades-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.watchTrades (outcome, since?, limit?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
streams the authenticated wallet's fills over its per-account v3 channel

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.sx.bet/api-reference/channel-fills-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcome token id to narrow the stream down to |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.watchMyTrades (outcome?, since?, limit?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
streams updates of the authenticated wallet's orders over its per-account v3 channel

**Kind**: instance method of [<code>sxbet</code>](#sxbet)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.sx.bet/api-reference/channel-orders-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcome token id to narrow the stream down to |
| since | <code>int</code> | No | timestamp in ms of the earliest order to return |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
sxbet.watchOrders (outcome?, since?, limit?, params?)
```

