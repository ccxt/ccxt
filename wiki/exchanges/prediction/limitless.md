
<a name="limitless" id="limitless"></a>

## limitless{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchEvent](#fetchevent)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOrdersByIds](#fetchordersbyids)
* [fetchOrder](#fetchorder)
* [fetchAccounts](#fetchaccounts)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchPositions](#fetchpositions)
* [fetchEvents](#fetchevents)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
fetches all active limitless markets paginated and returns one CCXT market per child market, each containing a list of outcome objects (YES/NO)

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.limitless.exchange/api-reference/markets/get-active-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a single search query string to filter markets by |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search query strings (alternative to query) |
| params.limit | <code>int</code> | No | max number of markets to collect (defaults to options.fetchMarketsLimit, 1000); caps the pages fetched |


```javascript
limitless.fetchMarkets (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event by its market slug or address

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://docs.limitless.exchange/api-reference/markets/get-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the market slug or address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchEvent (id, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the current price and best bid/ask for a single outcome token, combining the market detail and order book endpoints

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.limitless.exchange/api-reference/markets/get-market
- https://docs.limitless.exchange/api-reference/trading/orderbook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol like TRUMP_OUT_PRESIDENT_2027:YES or an outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchTicker (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches tickers for multiple outcome tokens, grouping requested outcomes by their parent market, fetches all active markets when symbols is omitted

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome symbol

**See**

- https://docs.limitless.exchange/api-reference/markets/get-market
- https://docs.limitless.exchange/api-reference/trading/orderbook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified outcome symbols or outcome token ids |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchTickers (symbols?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches recent public trades for a single outcome token from the market events feed

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.limitless.exchange/api-reference/trading/market-events  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol like TRUMP_OUT_PRESIDENT_2027:YES or an outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the order book for a single outcome token, converting 6-decimal USDC sizes to whole units, no outcomes are quoted at 1 - price with the sides swapped

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://docs.limitless.exchange/api-reference/trading/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified outcome symbol like TRUMP_OUT_PRESIDENT_2027:YES or an outcome token id |
| limit | <code>int</code> | No | not used by limitless fetchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical prices for a single limitless market outcome and maps them to OHLCV format, uses the `interval` query parameter and selects the YES/NO series that matches the requested outcome

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.limitless.exchange/api-reference/trading/historical-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | outcome symbol, e.g. "TRUMP_OUT:YES" |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches orders for the authenticated user for a single outcome

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/orders/get-user-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | outcome symbol, e.g. "TRUMP_OUT:YES" |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches open orders for the authenticated user for a single outcome

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/orders/get-user-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | outcome symbol, e.g. "TRUMP_OUT:YES" |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches closed orders for the authenticated user for a single outcome

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/orders/get-user-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | outcome symbol, e.g. "TRUMP_OUT:YES" |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOrdersByIds" id="fetchordersbyids"></a>

### fetchOrdersByIds{docsify-ignore}
fetch orders by the list of order id

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/trading/order-status-batch  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | list of order id |
| symbol | <code>string</code> | No | market outcome symbol, e.g. "TRUMP_OUT:YES" |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchOrdersByIds (ids, symbol?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/trading/order-status-batch  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | market outcome symbol, e.g. "TRUMP_OUT:YES" |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchOrder (id, symbol?, params?)
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
query for account id and info

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [account structures]

**See**: https://docs.limitless.exchange/api-reference/portfolio/get-current-profile  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchAccounts (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
places a limit or market order on limitless for the given outcome token

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/orders/create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | outcome symbol, e.g. "TRUMP_OUT:YES" |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | amount of outcome tokens |
| price | <code>float</code> | No | limit price (0–1 range) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a single open order by id

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/orders/cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | outcome symbol, e.g. "TRUMP_OUT:YES" |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.cancelOrder (id, symbol?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders at the same time

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/trading/cancel-batch  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.cancelOrders (ids, symbol?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders for one market slug

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.limitless.exchange/api-reference/orders/cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | outcome symbol, e.g. "TRUMP_OUT:YES" |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.slug | <code>string</code> | No | the market slug to cancel all orders for |


```javascript
limitless.cancelAllOrders (symbol?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.limitless.exchange/api-reference/trades/get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | outcome symbol, e.g. "TRUMP_OUT:YES" |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches open positions for the authenticated limitless user from the portfolio endpoint

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.limitless.exchange/api-reference/portfolio/get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | filter by outcome ids or symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
limitless.fetchPositions (symbols?, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches prediction-market events matching the given search terms (or the most active markets, capped, when omitted) and caches their markets and outcomes on the instance

**Kind**: instance method of [<code>limitless</code>](#limitless)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**: https://docs.limitless.exchange/api-reference/markets/search  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.query | <code>string</code> | No | a single search term; when omitted (and no queries) returns the events cached by loadMarkets (capped by options.fetchMarketsLimit) |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query) |
| params.limit | <code>int</code> | No | maximum number of markets per query, defaults to 50 |


```javascript
limitless.fetchEvents (params?)
```

