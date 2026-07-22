
<a name="polymarket" id="polymarket"></a>

## polymarket{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrder](#fetchorder)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchEvents](#fetchevents)
* [fetchEvent](#fetchevent)
* [deriveApiKey](#deriveapikey)
* [createApiKey](#createapikey)
* [createOrDeriveApiKey](#createorderiveapikey)
* [watchOrderBook](#watchorderbook)
* [watchTrades](#watchtrades)
* [watchTicker](#watchticker)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for polymarket, each prediction market becomes one market with its outcome tokens listed under the outcomes key

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.polymarket.com/api-reference/events/list-events
- https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.query | <code>string</code> | No | a single search term used to filter the fetched events |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query) |
| params.tags | <code>Array&lt;string&gt;</code> | No | filter events by tag — human-readable labels ("Fed Rates") or slugs ("fed-rates") both work; multiple tags match ANY (one gamma listing per tag, unioned) |
| params.status | <code>string</code> | No | 'active', 'closed' or 'all', the status of the events to fetch, defaults to 'active' |
| params.limit | <code>int</code> | No | max number of events to fetch when no query is given (defaults to options.fetchMarketsLimit, 200); the listing is ordered by 24h volume so the most active markets come first — outcomes on lower-volume markets are resolvable on demand by their token id (fetchOutcome) |


```javascript
polymarket.fetchMarkets (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the current mid-price and best bid/ask for a single outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**

- https://docs.polymarket.com/api-reference/data/get-midpoint-price
- https://docs.polymarket.com/api-reference/market-data/get-order-book
- https://docs.polymarket.com/api-reference/data/get-last-trade-price


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome like TRUMP_DANCE_TODAY_997:YES or an outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTicker (outcome, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches tickers for multiple outcome tokens at once using the batched CLOB book, midpoint and last-trade-price endpoints (200 per request trio)

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome

**See**

- https://docs.polymarket.com/api-reference/market-data/get-order-books-request-body
- https://docs.polymarket.com/api-reference/market-data/get-midpoint-prices-request-body
- https://docs.polymarket.com/api-reference/data/get-last-trades-prices


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes or outcome token ids — required: polymarket has no endpoint returning all tickers at once, so an unscoped call is not supported |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTickers (outcomes, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the CLOB order book for a single outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.polymarket.com/api-reference/market-data/get-order-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| limit | <code>int</code> | No | not used by polymarket fetchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches price history ticks for a single outcome token and buckets them client-side into OHLCV candles, snapping tick timestamps to the candle boundary

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.polymarket.com/api-reference/markets/get-prices-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOHLCV (outcome, timeframe, since?, limit?, params?)
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current timestamp from the CLOB server

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>int</code> - the current server time in milliseconds

**See**: https://docs.polymarket.com/api-reference/data/get-server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTime (params?)
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
fetches the gamma API health status

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.polymarket.com/api-reference/events/list-events  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchStatus (params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
fetches the open interest of a prediction market outcome

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.polymarket.com/api-reference/misc/get-open-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOpenInterest (outcome, params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetches the base fee rate for a prediction market outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.polymarket.com/api-reference/market-data/get-fee-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTradingFee (outcome, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches public trade history for a single outcome token from the data API

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| since | <code>int</code> | No | not used by polymarket fetchTrades |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTrades (outcome, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the authenticated user's trade history from the CLOB, optionally filtered by outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.polymarket.com/api-reference/trade/get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcome token id |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetches all the trades made from a single order

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.polymarket.com/api-reference/trade/get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| outcome | <code>string</code> | No | unified outcome or outcome token id to narrow the lookup |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOrderTrades (id, outcome?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
fetches the USDC collateral balance available for trading on the CLOB

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.polymarket.com/api-reference/trade/get-balance-allowance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.signatureType | <code>int</code> | No | 0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE, 3=POLY_1271 (deposit wallet); defaults to options.signatureType |


```javascript
polymarket.fetchBalance (params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches open outcome token positions for the wallet from the data API

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | unified outcomes to filter by |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchPositions (outcomes?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetches the open position for a single outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchPosition (outcome, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches open resting orders for the authenticated user, optionally filtered by outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/get-user-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcome token id |
| since | <code>int</code> | No | not used by polymarket fetchOpenOrders |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches a single order by id from the CLOB private data endpoint

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/get-single-order-by-id  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| outcome | <code>string</code> | No | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOrder (id, outcome?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
places a limit or market order on the CLOB for the given outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/post-a-new-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| type | <code>string</code> | Yes | 'market' or 'limit'; market orders default to FOK and, when no price is given, use the outcome's current price as the marketable reference |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how many outcome tokens to trade |
| price | <code>float</code> | No | the price per outcome token between 0 and 1; required for limit orders, defaults to the outcome's current price for market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.orderType | <code>string</code> | No | time-in-force override: 'GTC' (default for limit), 'FOK' (default for market), 'GTD' or 'FAK' |
| params.signatureType | <code>int</code> | No | 0=EOA, 1=POLY_PROXY, 2=GNOSIS_SAFE, 3=POLY_1271 (deposit wallet); defaults to options.signatureType |
| params.funder | <code>string</code> | No | the wallet that holds the USDC collateral; defaults to options.funder or the signing address |
| params.tickSize | <code>string</code> | No | the market tick size ('0.1'/'0.01'/'0.001'/'0.0001'); read from the outcome when omitted |
| params.negRisk | <code>bool</code> | No | whether the market is a neg-risk market; read from the outcome when omitted |
| params.salt | <code>string</code> | No | order salt; defaults to the current time in ms (pin it for idempotent retries) |
| params.timestamp | <code>string</code> | No | order timestamp; defaults to the current time in ms |
| params.expiration | <code>string</code> | No | unix-seconds expiration for GTD orders; defaults to '0' (no expiry) |
| params.builderCode | <code>string</code> | No | builder wallet address or full bytes32 builder code attached to the order for attribution (zero fee — tracking only); defaults to options.builder |


```javascript
polymarket.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
places multiple orders on the CLOB in a single batched request

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/post-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;object&gt;</code> | Yes | a list of order requests, each an object with outcome, type, side, amount, price and optional params (same params as createOrder) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.createOrders (orders, params?)
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
places a market buy order sized by USDC cost (how much to spend) rather than shares

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/post-a-new-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| cost | <code>float</code> | Yes | the amount of USDC to spend |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (see createOrder) |


```javascript
polymarket.createMarketBuyOrderWithCost (outcome, cost, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a single open order by id on the CLOB

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/cancel-single-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| outcome | <code>string</code> | No | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.cancelOrder (id, outcome?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancels multiple open orders by id on the CLOB in a single request

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/api-reference/trade/cancel-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | the order ids to cancel |
| outcome | <code>string</code> | No | not used by polymarket cancelOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.cancelOrders (ids, outcome?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders on the CLOB, optionally scoped to one outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**

- https://docs.polymarket.com/api-reference/trade/cancel-all-orders
- https://docs.polymarket.com/api-reference/trade/cancel-market-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome or outcome token id; when given only that outcome's orders are cancelled |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.cancelAllOrders (outcome?, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches prediction-market events matching the given scope (query/queries/tags/eventId/slug — required) and caches their markets and outcomes on the instance; for an unscoped top-volume browse use fetchMarkets ()

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**

- https://docs.polymarket.com/api-reference/search/search-markets-events-and-profiles
- https://docs.polymarket.com/api-reference/events/list-events


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.query | <code>string</code> | No | a single keyword search term |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query) |
| params.tags | <code>Array&lt;string&gt;</code> | No | filter events by tag — human-readable labels ("Fed Rates") or slugs ("fed-rates") both work; multiple tags match ANY (one gamma listing per tag, unioned and deduped) |
| params.limit | <code>int</code> | No | max number of events to return |
| params.sort | <code>string</code> | No | 'volume' (default), 'liquidity' or 'newest' — mapped to the gamma order field |
| params.status | <code>string</code> | No | 'active' (default), 'inactive', 'closed' or 'all' ('inactive' and 'closed' are interchangeable) |
| params.searchIn | <code>string</code> | No | when searching, restrict the match to 'title' (default), 'description' or 'both' |
| params.eventId | <code>string</code> | No | direct lookup by event id (short-circuits the listing/search) |
| params.slug | <code>string</code> | No | direct lookup by event slug |
| params.searchPageSize | <code>int</code> | No | search page size (gamma limit_per_type, default 100); lower it to shrink the download when a small limit is enough, higher to over-fetch before client-side status/title filtering |
| params.maxSearchPages | <code>int</code> | No | max search pages to fetch when no limit is given (default 5), bounding a broad query |


```javascript
polymarket.fetchEvents (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event by its id or slug

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**

- https://docs.polymarket.com/api-reference/events/get-event-by-id
- https://docs.polymarket.com/api-reference/events/get-event-by-slug


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the event id (numeric) or slug |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchEvent (id, params?)
```


<a name="deriveApiKey" id="deriveapikey"></a>

### deriveApiKey{docsify-ignore}
derives the L2 api credentials (apiKey, secret, passphrase) deterministically from the wallet private key

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the api credentials { apiKey, secret, passphrase }

**See**: https://docs.polymarket.com/developers/CLOB/authentication  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.nonce | <code>int</code> | No | the nonce used to derive the credentials, defaults to 0 |


```javascript
polymarket.deriveApiKey (params?)
```


<a name="createApiKey" id="createapikey"></a>

### createApiKey{docsify-ignore}
creates new L2 api credentials (apiKey, secret, passphrase) for the wallet private key

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the api credentials { apiKey, secret, passphrase }

**See**: https://docs.polymarket.com/developers/CLOB/authentication  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.nonce | <code>int</code> | No | the nonce used to create the credentials, defaults to 0 |


```javascript
polymarket.createApiKey (params?)
```


<a name="createOrDeriveApiKey" id="createorderiveapikey"></a>

### createOrDeriveApiKey{docsify-ignore}
derives the existing L2 api credentials for the wallet private key, creating them if none exist yet

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the api credentials { apiKey, secret, passphrase }

**See**: https://docs.polymarket.com/developers/CLOB/authentication  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.createOrDeriveApiKey (params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
streams live order-book updates for a single Polymarket outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome (e.g. "TRUMP_WINS_2028:YES") or an outcome token id |
| limit | <code>int</code> | No | optional depth limit applied after resolving |
| params | <code>object</code> | No | extra params (currently unused) |


```javascript
polymarket.watchOrderBook (outcome, limit?, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
streams live fills for a single Polymarket outcome token

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| since | <code>int</code> | No | optional unix timestamp (ms) lower bound |
| limit | <code>int</code> | No | optional max number of trades to return |
| params | <code>object</code> | No | extra params (unused) |


```javascript
polymarket.watchTrades (outcome, since?, limit?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
streams a synthetic ticker derived from order-book snapshots and deltas (mid = (bid + ask) / 2)

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| params | <code>object</code> | No | extra params (unused) |


```javascript
polymarket.watchTicker (outcome, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches the authenticated user's order updates over the CLOB user websocket channel

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.polymarket.com/developers/CLOB/websocket/user-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter the stream to one market |
| since | <code>int</code> | No | the earliest time in ms to return orders for |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.watchOrders (outcome?, since?, limit?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches the authenticated user's trade fills over the CLOB user websocket channel

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.polymarket.com/developers/CLOB/websocket/user-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter the stream to one market |
| since | <code>int</code> | No | the earliest time in ms to return trades for |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.watchMyTrades (outcome?, since?, limit?, params?)
```

