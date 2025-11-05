
<a name="p2b" id="p2b"></a>

## p2b{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchClosedOrders](#fetchclosedorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bigone

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
p2b.fetchMarkets ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
p2b.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
p2b.fetchTicker (symbol[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#depth-result  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.interval | <code>string</code> | No | 0 (default), 0.00000001, 0.0000001, 0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1 |


```javascript
p2b.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | 1-100, default=50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.lastId | <code>int</code> | Yes | order id |


```javascript
p2b.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#kline  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | 1m, 1h, or 1d |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | 1-500, default=50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.offset | <code>int</code> | No | default=0, with this value the last candles are returned |


```javascript
p2b.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#all-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
p2b.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | must be 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
p2b.createOrder (symbol, type, side, amount, price[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
p2b.cancelOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.offset | <code>int</code> | No | 0-10000, default=0 |


```javascript
p2b.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-by-order-id  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | 1-100, default=50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.offset | <code>int</code> | No | 0-10000, default=0 |


```javascript
p2b.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user, only the transaction records in the past 3 month can be queried, the time between since and params["until"] cannot be longer than 24 hours

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#deals-history-by-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for, default = params["until"] - 86400000 |
| limit | <code>int</code> | No | 1-100, default=50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for, default = current timestamp or since + 86400000 EXCHANGE SPECIFIC PARAMETERS |
| params.offset | <code>int</code> | No | 0-10000, default=0 |


```javascript
p2b.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user, the time between since and params["untnil"] cannot be longer than 24 hours

**Kind**: instance method of [<code>p2b</code>](#p2b)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md#orders-history-by-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for, default = params["until"] - 86400000 |
| limit | <code>int</code> | No | 1-100, default=50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for, default = current timestamp or since + 86400000 EXCHANGE SPECIFIC PARAMETERS |
| params.offset | <code>int</code> | No | 0-10000, default=0 |


```javascript
p2b.fetchClosedOrders (symbol[, since, limit, params])
```

