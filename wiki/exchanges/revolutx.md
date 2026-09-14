
<a name="revolutx" id="revolutx"></a>

## revolutx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [editOrder](#editorder)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves all available markets on the exchange

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [market structures](https://docs.ccxt.com/?id=market-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.region | <code>string</code> | No | the region to filter markets by (e.g. EEA, UK) |


```javascript
revolutx.fetchMarkets (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on the exchange

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - a dictionary of [currency structures](https://docs.ccxt.com/?id=currency-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.region | <code>string</code> | No | the region to filter currencies by |


```javascript
revolutx.fetchCurrencies (params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.region | <code>string</code> | No | the region to fetch tickers for (e.g. EEA, UK) |


```javascript
revolutx.fetchTickers (symbols, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker for a given market symbol

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.region | <code>string</code> | No | the region to fetch the ticker for |


```javascript
revolutx.fetchTicker (symbol, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the current order book snapshot for a given market symbol

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum number of orders to return (1-50, default 50) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.region | <code>string</code> | No | the region to fetch the order book for |


```javascript
revolutx.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data for a given market symbol

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of [OHLCV structures](https://docs.ccxt.com/?id=ohlcv-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents (e.g. 1m, 5m, 1h, 1d) |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.region | <code>string</code> | No | the region to fetch candles for |


```javascript
revolutx.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches the public trade history for a given market symbol

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to return (1-1900, default 1900) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch |
| params.cursor | <code>string</code> | No | pagination cursor from the previous response |


```javascript
revolutx.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
fetches the current balance for the authenticated user

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
revolutx.fetchBalance (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the base currency you want to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a custom client order id (UUID) |
| params.cost | <code>float</code> | No | the order cost in units of the quote currency (alternative to amount) |
| params.timeInForce | <code>string</code> | No | 'gtc' or 'ioc' for limit orders |
| params.executionInstructions | <code>Array&lt;string&gt;</code> | No | limit order instructions, e.g. ['post_only'] or ['allow_taker'] |


```javascript
revolutx.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order by its id

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id (venue order id) |
| symbol | <code>string</code> | Yes | not used by this exchange |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
revolutx.cancelOrder (id, symbol, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - an empty [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | not used by this exchange |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
revolutx.cancelAllOrders (symbol?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches an order by its id

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id (venue order id) |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
revolutx.fetchOrder (id, symbol, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches all open orders for the authenticated user

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code>, <code>undefined</code> | Yes | unified symbol of the market to fetch open orders for |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to return (1-300, default 300) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cursor | <code>string</code> | No | pagination cursor from the previous response |
| params.orderStates | <code>Array&lt;string&gt;</code> | No | filter by order states, e.g. ['new', 'partially_filled'] |
| params.orderTypes | <code>Array&lt;string&gt;</code> | No | filter by order types, e.g. ['limit', 'market'] |
| params.side | <code>string</code> | No | filter by side, 'buy' or 'sell' |


```javascript
revolutx.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches historical orders for the authenticated user

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code>, <code>undefined</code> | Yes | unified symbol of the market to fetch orders for |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch, the lookup window is limited to 30 days |
| limit | <code>int</code> | No | the maximum number of orders to return (1-1900, default 1900) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest order to fetch |
| params.cursor | <code>string</code> | No | pagination cursor from the previous response |
| params.orderStates | <code>Array&lt;string&gt;</code> | No | filter by order states, e.g. ['filled', 'cancelled', 'rejected'] |
| params.orderTypes | <code>Array&lt;string&gt;</code> | No | filter by order types, e.g. ['limit', 'market'] |


```javascript
revolutx.fetchOrders (symbol, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches closed (filled, cancelled, rejected) orders for the authenticated user

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code>, <code>undefined</code> | Yes | unified symbol of the market to fetch orders for |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch, the lookup window is limited to 30 days |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
revolutx.fetchClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the trade history for the authenticated user

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch, the lookup window is limited to 30 days |
| limit | <code>int</code> | No | the maximum number of trades to return (1-1900, default 1900) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch |
| params.cursor | <code>string</code> | No | pagination cursor from the previous response |


```javascript
revolutx.fetchMyTrades (symbol, since?, limit?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
replaces an existing order

**Kind**: instance method of [<code>revolutx</code>](#revolutx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id (venue order id) to replace |
| symbol | <code>string</code> | Yes | unified symbol of the market |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the new amount |
| price | <code>float</code> | No | the new price |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a custom client order id (UUID) |
| params.cost | <code>float</code> | No | the new order cost in units of the quote currency |
| params.timeInForce | <code>string</code> | No | e.g. gtc |
| params.executionInstructions | <code>Array&lt;string&gt;</code> | No | e.g. ['post_only'] |


```javascript
revolutx.editOrder (id, symbol, type, side, amount, price?, params?)
```

