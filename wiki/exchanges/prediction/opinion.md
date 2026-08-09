
<a name="opinion" id="opinion"></a>

## opinion{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchEvents](#fetchevents)
* [fetchEvent](#fetchevent)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [parseOHLCV](#parseohlcv)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [parsePredictionOrder](#parsepredictionorder)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [createApiKey](#createapikey)
* [fetchApiKey](#fetchapikey)
* [deleteApiKey](#deleteapikey)
* [watchOrderBook](#watchorderbook)
* [watchTicker](#watchticker)
* [watchTrades](#watchtrades)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
fetches every kind of opinion market
categorical parents double as our unified "events" and are cached into this.events as a side effect

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | max number of markets to collect (defaults to options.marketsPageLimit * options.maxMarketsPages, 1000) |


```javascript
opinion.fetchMarkets (params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches Opinion's categorical markets - scope required via query/queries/tags/eventId/slug/labelId

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.labelId | <code>int</code> | No | filter by opinion category label id |
| params.limit | <code>int</code> | No | max number of events to fetch (paginated server-side; defaults to options.maxFetchEventsResults, 100) |


```javascript
opinion.fetchEvents (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event by its market id, or slug

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the numeric marketId, or the market slug |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchEvent (id, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the latest trade price and top of book for a single outcome token

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/token  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchTicker (outcome, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches tickers for multiple outcome tokens - opinion has no all-tickers endpoint, each token needs its own latest-price + orderbook request

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/token  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes or outcome token ids - required, opinion has no all-tickers endpoint |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchTickers (outcomes, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the order book for a single outcome token

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/token  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| limit | <code>int</code> | No | not used by opinion fetchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data for an outcome token

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/token  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| timeframe | <code>string</code> | Yes | the length of time each candle represents - only '1h' and '1d' are supported live |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchOHLCV (outcome, timeframe, since?, limit?, params?)
```


<a name="parseOHLCV" id="parseohlcv"></a>

### parseOHLCV{docsify-ignore}
parses a single opinion price-history point into a unified OHLCV candle

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;int&gt;</code> - a candle ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ohlcv | <code>object</code> | Yes | the raw { p, t } point |
| market | <code>object</code> | No | the outcome object the candle belongs to |


```javascript
opinion.parseOHLCV (ohlcv, market?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
places a limit or market order on the CLOB for the given outcome token

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | for limit orders, the number of outcome shares to trade; for market orders, the quote (USDT) to spend on a BUY or the shares to sell on a SELL |
| price | <code>float</code> | No | the price per outcome token between 0 and 1; required for limit orders and market SELL orders (where it acts as the reference / worst acceptable price for the taker amount); ignored for market BUY orders (amount is already the quote to spend) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.postOnly | <code>bool</code> | No | limit orders only - reject the order if it would cross the spread |


```javascript
opinion.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a single open order by id

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| outcome | <code>string</code> | No | not used by opinion cancelOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.cancelOrder (id, outcome?, params?)
```


<a name="parsePredictionOrder" id="parsepredictionorder"></a>

### parsePredictionOrder{docsify-ignore}
parses a raw opinion order object into a unified prediction order structure

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| order | <code>object</code> | Yes | the raw opinion OrderData object |
| market | <code>object</code> | No | the outcome object the order belongs to |


```javascript
opinion.parsePredictionOrder (order, market?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches all of the authenticated user's orders

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome or outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches a single order by id

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| outcome | <code>string</code> | No | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchOrder (id, outcome?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches the authenticated user's open orders

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome or outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches the authenticated user's closed orders

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome or outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchClosedOrders (outcome?, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the authenticated user's trades

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by unified outcome or outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
fetches the authenticated user's quote-token balances

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/quote-token  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchBalance (params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches the authenticated user's open positions

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | filter by unified outcomes or outcome token ids |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.fetchPositions (outcomes?, params?)
```


<a name="createApiKey" id="createapikey"></a>

### createApiKey{docsify-ignore}
self-service creation of an Open API key linked to this.walletAddress via
an EIP-712-signed request - there is no "generate key" button in the Opinion GUI, this is
the only documented way to obtain a wallet-linked key

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - the api credentials { apiKey, walletAddress }

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/authentication  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |


```javascript
opinion.createApiKey (params?)
```


<a name="fetchApiKey" id="fetchapikey"></a>

### fetchApiKey{docsify-ignore}
fetches the currently active Open API key for this.walletAddress

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - the api credentials { apiKey, walletAddress }

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/authentication  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |


```javascript
opinion.fetchApiKey (params?)
```


<a name="deleteApiKey" id="deleteapikey"></a>

### deleteApiKey{docsify-ignore}
revokes the Open API key for this.walletAddress

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - raw response, result.deleted confirms revocation

**See**: https://docs.opinion.trade/developer-guide/opinion-open-api/authentication  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |


```javascript
opinion.deleteApiKey (params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
streams the order book of an outcome token; the channel is delta-only so the live book is seeded from the REST snapshot

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| limit | <code>int</code> | No | the maximum number of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.watchOrderBook (outcome, limit?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
streams last-price updates of an outcome token

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.watchTicker (outcome, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
streams public trades of an outcome token

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-websocket/market-channels  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.watchTrades (outcome, since?, limit?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
streams the authenticated user's order updates of one market - the venue channel is per-market, so the outcome argument is required

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-websocket/user-channels  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id whose market to watch |
| since | <code>int</code> | No | timestamp in ms of the earliest order to return |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.watchOrders (outcome, since?, limit?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
streams the authenticated user's executed trades of one market - the venue channel is per-market, so the outcome argument is required

**Kind**: instance method of [<code>opinion</code>](#opinion)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.opinion.trade/developer-guide/opinion-websocket/user-channels  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome token id whose market to watch |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
opinion.watchMyTrades (outcome, since?, limit?, params?)
```

