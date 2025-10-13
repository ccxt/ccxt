
<a name="cryptomus" id="cryptomus"></a>

## cryptomus{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchTradingFees](#fetchtradingfees)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for the exchange

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://doc.cryptomus.com/personal/market-cap/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://doc.cryptomus.com/personal/market-cap/assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.fetchCurrencies ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://doc.cryptomus.com/personal/market-cap/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.fetchTickers ([symbols, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://doc.cryptomus.com/personal/market-cap/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.level | <code>int</code> | No | 0 or 1 or 2 or 3 or 4 or 5 - the level of volume |


```javascript
cryptomus.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://doc.cryptomus.com/personal/market-cap/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (maximum value is 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://doc.cryptomus.com/personal/converts/balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://doc.cryptomus.com/personal/exchange/market-order-creation
- https://doc.cryptomus.com/personal/exchange/limit-order-creation


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or for spot |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders (only for limit orders) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *market buy only* the quote quantity that can be used as an alternative for the amount |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order (optional) |


```javascript
cryptomus.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open limit order

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://doc.cryptomus.com/personal/exchange/limit-order-cancellation  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in (not used in cryptomus) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.cancelOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://doc.cryptomus.com/personal/exchange/history-of-completed-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in (not used in cryptomus) |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for (not used in cryptomus) |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve (not used in cryptomus) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.direction | <code>string</code> | No | order direction 'buy' or 'sell' |
| params.order_id | <code>string</code> | No | order id |
| params.client_order_id | <code>string</code> | No | client order id |
| params.limit | <code>string</code> | No | A special parameter that sets the maximum number of records the request will return |
| params.offset | <code>string</code> | No | A special parameter that sets the number of records from the beginning of the list |


```javascript
cryptomus.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://doc.cryptomus.com/personal/exchange/list-of-active-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for (not used in cryptomus) |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve (not used in cryptomus) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.direction | <code>string</code> | No | order direction 'buy' or 'sell' |
| params.order_id | <code>string</code> | No | order id |
| params.client_order_id | <code>string</code> | No | client order id |
| params.limit | <code>string</code> | No | A special parameter that sets the maximum number of records the request will return |
| params.offset | <code>string</code> | No | A special parameter that sets the number of records from the beginning of the list |


```javascript
cryptomus.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>cryptomus</code>](#cryptomus)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://trade-docs.coinlist.co/?javascript--nodejs#list-fees  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptomus.fetchTradingFees ([params])
```

