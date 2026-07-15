
<a name="kalshi" id="kalshi"></a>

## kalshi{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchStatus](#fetchstatus)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [fetchSettlements](#fetchsettlements)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOrder](#fetchorder)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchEvents](#fetchevents)
* [fetchEvent](#fetchevent)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
fetches kalshi markets; with a query it resolves the query via the events endpoint and returns the matched events' markets, otherwise it pages the markets listing

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://trading-api.readme.io/reference/getmarkets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a single search query; resolved against the events endpoint (event title/ticker), then the matched events' markets are returned |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search queries (alternative to query); markets from any matching event are returned |
| params.limit | <code>int</code> | No | for an unscoped listing (no query), the max number of markets to collect (defaults to options.maxFetchMarketsLimit, 1000) |


```javascript
kalshi.fetchMarkets (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the current market price and bid/ask for a single kalshi outcome

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kalshi.com/api-reference/market/get-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | the unified outcome like TRUMP_BRING_BACK_MANUFACTURING:YES or outcomeId like KXGDPSHAREMANU-29 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchTicker (outcome, params?)
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
fetches the kalshi exchange status

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.kalshi.com/api-reference/exchange/get-exchange-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchStatus (params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
fetches the open interest of a prediction market outcome

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.kalshi.com/api-reference/market/get-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOpenInterest (outcome, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches tickers for multiple outcomes at once, batching their market tickers through the markets endpoint (100 per request)

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome

**See**: https://docs.kalshi.com/api-reference/market/get-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes — required: kalshi has tens of thousands of markets and no endpoint returning all tickers at once, so an unscoped call is not supported |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchTickers (outcomes, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the order book for a single kalshi outcome

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://docs.kalshi.com/api-reference/market/get-market-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome id |
| limit | <code>int</code> | No | the maximum number of bids/asks to return (not enforced by kalshis API, reserved for future client-side trimming) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches OHLCV candlesticks for a single kalshi outcome from the candlesticks endpoint

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.kalshi.com/api-reference/market/get-market-candlesticks  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOHLCV (outcome, timeframe, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches public trade history for a single kalshi market ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.kalshi.com/api-reference/market/get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchTrades (outcome, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch the fills (executed trades) of the authenticated kalshi user

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://trading-api.readme.io/reference/getfills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter to a single unified outcome |
| since | <code>int</code> | No | the earliest fill timestamp (ms) to fetch |
| limit | <code>int</code> | No | the maximum number of fills to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
fetches the authenticated user's USD portfolio balance from kalshi

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://trading-api.readme.io/reference/getbalance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchBalance (params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches open market positions for the authenticated kalshi user

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://trading-api.readme.io/reference/getportfoliopositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | filter by outcome ids or outcomes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchPositions (outcomes?, params?)
```


<a name="fetchSettlements" id="fetchsettlements"></a>

### fetchSettlements{docsify-ignore}
fetches the user's settled (resolved) positions, with the collateral paid out and realized pnl

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of prediction settlement structures

**See**: https://trading-api.readme.io/reference/getportfoliosettlements  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter to a single unified outcome |
| since | <code>int</code> | No | timestamp in ms of the earliest settlement to fetch |
| limit | <code>int</code> | No | the maximum number of settlements to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchSettlements (outcome?, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches resting (open) orders for the authenticated kalshi user, optionally filtered by ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/getorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches all orders (resting, executed and canceled) for the authenticated kalshi user

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/getorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOrders (outcome?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches the closed (executed or canceled) orders for the authenticated kalshi user

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/getorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchClosedOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches a single order by id from the kalshi portfolio endpoint

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/getorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| outcome | <code>string</code> | No | unified outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOrder (id, outcome?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
places a limit or market order on kalshi for the given outcome token

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/createorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of contracts |
| price | <code>float</code> | No | limit price in dollars (0–1 range) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edits a resting order by cancelling it and placing a new one with the updated terms

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/createorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the order to edit |
| outcome | <code>string</code> | Yes | unified outcome |
| type | <code>string</code> | Yes | 'limit' (kalshi has only limit orders) |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | the new number of contracts |
| price | <code>float</code> | No | the new price (0..1) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.editOrder (id, outcome, type, side, amount?, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a single open order by id on kalshi

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/cancelorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| outcome | <code>string</code> | No | unified outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.cancelOrder (id, outcome?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders on kalshi, optionally scoped to one outcome ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/cancelorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to scope the cancellation to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.cancelAllOrders (outcome?, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches kalshi events scoped by a search query, tag, category or series ticker — always live from the API, never from the local cache (it POPULATES the cache for later event()/outcome lookups). the scope decides the endpoint: a free-text `query` hits kalshi's ranked search endpoint and the top `limit` matches are fetched canonically; `tags`/`category` resolve to series via the /series listing then fetch their events; `series_ticker` is used verbatim. `limit` bounds how many events are actually fetched (broad scopes stop early), and any other param is forwarded straight to the /events endpoint.

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**: https://docs.kalshi.com/api-reference/events/get-events  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint (unrecognised keys are forwarded to GET /events) |
| params.query | <code>string</code> | No | free-text search resolved server-side via kalshi's series search endpoint |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple free-text searches (alternative to query, unioned) |
| params.series_ticker | <code>string</code> | No | one or more comma-separated kalshi series tickers (e.g. 'KXBTC') — used verbatim, no search |
| params.tags | <code>Array&lt;string&gt;</code> | No | kalshi series tags (e.g. ['BTC']) — resolved to series via the /series listing |
| params.category | <code>string</code> | No | a kalshi series category (e.g. 'Crypto') — resolved to series via the /series listing |
| params.status | <code>string</code> | No | 'active' | 'inactive' | 'closed', defaults to options.defaultEventStatus |
| params.limit | <code>int</code> | No | max number of events to return |


```javascript
kalshi.fetchEvents (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event by its event ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://trading-api.readme.io/reference/getevent  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the event ticker |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchEvent (id, params?)
```

