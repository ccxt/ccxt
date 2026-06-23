
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
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrder](#fetchorder)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchEvents](#fetchevents)
* [fetchEvent](#fetchevent)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
fetches all kalshi markets via cursor pagination and maps each binary market to YES and NO CCXT markets

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://trading-api.readme.io/reference/getmarkets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a single query string to filter markets by (matches ticker/title) |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple query strings (alternative to query) |
| params.limit | <code>int</code> | No | max number of markets to collect (defaults to options.fetchMarketsLimit, 1000); stops the cursor pagination once reached |


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
| symbol | <code>string</code> | Yes | the unified symbol like TRUMP_BRING_BACK_MANUFACTURING:YES or outcomeId like KXGDPSHAREMANU-29 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchTicker (symbol, params?)
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
| symbol | <code>string</code> | Yes | unified outcome symbol or outcome id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOpenInterest (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches tickers for multiple outcomes at once, batching their market tickers through the markets endpoint

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome symbol

**See**: https://docs.kalshi.com/api-reference/market/get-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified outcome symbols, fetches tickers for all loaded outcomes when omitted |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchTickers (symbols?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the order book for a single kalshi outcome

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://docs.kalshi.com/api-reference/market/get-market-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol or outcome id |
| limit | <code>int</code> | No | the maximum number of bids/asks to return (not enforced by kalshis API, reserved for future client-side trimming) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches OHLCV candlesticks for a single kalshi outcome from the candlesticks endpoint

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.kalshi.com/api-reference/market/get-market-candlesticks  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches public trade history for a single kalshi market ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.kalshi.com/api-reference/market/get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchTrades (symbol, since?, limit?, params?)
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
| symbols | <code>Array&lt;string&gt;</code> | No | filter by outcome ids or symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchPositions (symbols?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches resting (open) orders for the authenticated kalshi user, optionally filtered by ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/getorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | filter by unified outcome symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOpenOrders (symbol?, since?, limit?, params?)
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
| symbol | <code>string</code> | No | unified outcome symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.fetchOrder (id, symbol?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
places a limit or market order on kalshi for the given outcome token

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/createorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of contracts |
| price | <code>float</code> | No | limit price in dollars (0–1 range) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.createOrder (symbol, type, side, amount, price?, params?)
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
| symbol | <code>string</code> | No | unified outcome symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.cancelOrder (id, symbol?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders on kalshi, optionally scoped to one outcome ticker

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://trading-api.readme.io/reference/cancelorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified outcome symbol to scope the cancellation to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kalshi.cancelAllOrders (symbol?, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches kalshi events via cursor-paginated /events, filters client-side by query strings, then fetches full event details with nested markets in parallel and caches in this.events

**Kind**: instance method of [<code>kalshi</code>](#kalshi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**: https://trading-api.readme.io/reference/getevents  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a single query string to filter events by (matches event ticker/title) |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple query strings (alternative to query) |
| params.status | <code>string</code> | No | 'open' | 'closed' | 'settled', defaults to options.defaultEventStatus |
| params.limit | <code>int</code> | No | page size per request, defaults to 200 |
| params.maxPages | <code>int</code> | No | maximum number of pages to scan, defaults to 5 |


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

