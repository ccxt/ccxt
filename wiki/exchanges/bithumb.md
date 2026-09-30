
<a name="bithumb" id="bithumb"></a>

## bithumb{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchBalance](#fetchbalance)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [createOrders](#createorders)
* [createOrder](#createorder)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createTwapOrder](#createtwaporder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [withdraw](#withdraw)
* [fetchWithdrawalWhitelist](#fetchwithdrawalwhitelist)
* [fetchWithdrawal](#fetchwithdrawal)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposit](#fetchdeposit)
* [fetchDeposits](#fetchdeposits)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDepositAddresses](#fetchdepositaddresses)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchOrderBook](#watchorderbook)
* [watchTrades](#watchtrades)
* [watchBalance](#watchbalance)
* [watchOrders](#watchorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bithumb

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
- https://apidocs.bithumb.com/reference/%EA%B1%B0%EB%9E%98-%EB%8C%80%EC%83%81-%EB%AA%A9%EB%A1%9D-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchMarkets (params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchBalance (params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%ED%98%B8%EA%B0%80-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
- https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchTickers (symbols, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchTicker (symbol, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api
- https://apidocs.bithumb.com/reference/%EB%B6%84minute-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%9D%BCday-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%A3%BCweek-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%9B%94month-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
- https://apidocs.bithumb.com/reference/%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchTrades (symbol, since?, limit?, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders, only available for the generation 2 API

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://apidocs.bithumb.com/reference/%EB%8B%A4%EA%B1%B4-%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | supports 'IOC', 'FOK', and 'PO' |
| params.postOnly | <code>bool</code> | No | true or false |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.createOrders (orders, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
- https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
- https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0
- https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | supports 'IOC', 'FOK', and 'PO' |
| params.postOnly | <code>bool</code> | No | true or false |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order |
| params.cost | <code>string</code> | No | *generation 2 only* optional cost parameter for market buy orders instead of setting the price, must also set createMarketBuyOrderRequiresPrice to false |
| params.createMarketBuyOrderRequiresPrice | <code>bool</code> | No | *generation 2 only* set to false if passing a cost param or using cost in the amount argument, defaults to true |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.createMarketBuyOrderWithCost (symbol, cost, params?)
```


<a name="createTwapOrder" id="createtwaporder"></a>

### createTwapOrder{docsify-ignore}
create a trade order that is executed as a TWAP order over a specified duration.

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency, only required for sale |
| duration | <code>int</code> | Yes | the duration of the TWAP order in milliseconds |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.frequency | <code>string</code> | Yes | required order interval in seconds, 15, 20, 30, 60 or 120 |
| params.price | <code>string</code> | No | order price, required for purchase |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.createTwapOrder (symbol, side, amount, duration, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%A3%BC%EB%AC%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order, alternative to using the order id |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |
| params.twap | <code>bool</code> | No | *generation 2 only* if you want to fetch a generation 2 twap order |
| params.state | <code>string</code> | No | *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel |


```javascript
bithumb.fetchOrder (id, symbol?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |
| params.twap | <code>bool</code> | No | *generation 2 only* if you want to fetch generation 2 twap orders |
| params.state | <code>string</code> | No | *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel |


```javascript
bithumb.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | an array of client order ids |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.twap | <code>bool</code> | No | *generation 2 only* if you want to fetch generation 2 twap orders |
| params.state | <code>string</code> | No | *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel |


```javascript
bithumb.fetchOrders (symbol, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | an array of client order ids |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.twap | <code>bool</code> | No | if you want to fetch generation 2 twap orders |


```javascript
bithumb.fetchClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | an array of client order ids |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.twap | <code>bool</code> | No | if you want to fetch generation 2 twap orders |


```javascript
bithumb.fetchCanceledOrders (symbol, since?, limit?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0
- https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98
- https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order, alternative to using the order id |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |
| params.twap | <code>bool</code> | No | if you want to cancel a generation 2 twap order |


```javascript
bithumb.cancelOrder (id, symbol?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://apidocs.bithumb.com/reference/%EB%8B%A4%EA%B1%B4-%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | alternative to ids, array of client order ids |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.cancelOrders (ids, symbol?, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8
- https://apidocs.bithumb.com/reference/%EA%B0%80%EC%83%81-%EC%9E%90%EC%82%B0-%EC%B6%9C%EA%B8%88-%EC%9A%94%EC%B2%AD
- https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88-%EC%9A%94%EC%B2%AD


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes | the secondary withdrawal destination address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |
| params.network | <code>string</code> | No | the blockchain network to withdraw on, for example BTC or DASH |
| params.destination | <code>string</code> | No | secondary address destination for specific currencies, can alternatively use the tag argument |
| params.exchange_name | <code>string</code> | No | withdrawal exchange name |
| params.receiver_type | <code>string</code> | No | either personal or corporation |
| params.ko_name | <code>string</code> | No | *generation 1 only* the receiver name in korean |
| params.en_name | <code>string</code> | No | *generation 1 only* the receiver name in english |
| params.receiver_ko_name | <code>string</code> | No | *generation 2 only* the personal receiver name in korean |
| params.receiver_en_name | <code>string</code> | No | *generation 2 only* the personal receiver name in english |
| params.receiver_corp_ko_name | <code>string</code> | No | *generation 2 only* the corporation receiver name in korean |
| params.receiver_corp_en_name | <code>string</code> | No | *generation 2 only* the corporation receiver name in english |
| params.two_factor_type | <code>string</code> | No | *generation 2 KRW withdraw only* the two factor type, for example kakao |


```javascript
bithumb.withdraw (code, amount, address, tag, params?)
```


<a name="fetchWithdrawalWhitelist" id="fetchwithdrawalwhitelist"></a>

### fetchWithdrawalWhitelist{docsify-ignore}
fetch a list of allowed withdrawal addresses

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list response from the exchange

**See**: https://apidocs.bithumb.com/reference/%EC%B6%9C%EA%B8%88-%ED%97%88%EC%9A%A9-%EC%A3%BC%EC%86%8C-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchWithdrawalWhitelist (params?)
```


<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

### fetchWithdrawal{docsify-ignore}
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%B6%9C%EA%B8%88-%EC%A1%B0%ED%9A%8C  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | No | the currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.txid | <code>string</code> | No | the transaction id for the withdrawal |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchWithdrawal (id, code?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://apidocs.bithumb.com/reference/%EC%B6%9C%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.page | <code>int</code> | No | the number of pages to return, default is 1 |
| params.state | <code>string</code> | No | the withdrawal state, either PROCESSING, DONE or CANCELLED |
| params.order_by | <code>string</code> | No | either asc or desc, desc is the default |
| params.uuids | <code>Array&lt;string&gt;</code> | No | an array of uuid strings |
| params.txids | <code>Array&lt;string&gt;</code> | No | an array of txid strings |


```javascript
bithumb.fetchWithdrawals (code?, since?, limit?, params?)
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch information on a deposit

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%9E%85%EA%B8%88-%EC%A1%B0%ED%9A%8C  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.txid | <code>string</code> | No | the transaction id for the deposit |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchDeposit (id, code, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://apidocs.bithumb.com/reference/%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
- https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.page | <code>int</code> | No | the number of pages to return, default is 1 |
| params.state | <code>string</code> | No | the deposit state, for KRW, PROCESSING, ACCEPTED or CANCELLED, for others, DEPOSIT_PROCESSING, DEPOSIT_ACCEPTED, DEPOSIT_CANCELLED |
| params.order_by | <code>string</code> | No | either asc or desc, desc is the default |
| params.uuids | <code>Array&lt;string&gt;</code> | No | an array of uuid strings |
| params.txids | <code>Array&lt;string&gt;</code> | No | an array of txid strings |


```javascript
bithumb.fetchDeposits (code, since?, limit?, params?)
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://apidocs.bithumb.com/reference/%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%83%9D%EC%84%B1-%EC%9A%94%EC%B2%AD  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.network | <code>string</code> | No | the blockchain network to create a deposit address on |


```javascript
bithumb.createDepositAddress (code, params?)
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |
| params.network | <code>string</code> | No | network for fetch deposit address |


```javascript
bithumb.fetchDepositAddress (code, params?)
```


<a name="fetchDepositAddresses" id="fetchdepositaddresses"></a>

### fetchDepositAddresses{docsify-ignore}
fetch deposit addresses for multiple currencies (when available)

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/?id=address-structure) indexed by currency code

**See**: https://apidocs.bithumb.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code> | No | list of unified currency codes, default is undefined (all currencies) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.fetchDepositAddresses (codes?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [ticker structure](https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
- https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tickTypes | <code>string</code> | No | generation 1 only, the tick type to subscribe to, '24H' by default (30M, 1H, 12H, 24H, MID) |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.watchTicker (symbol, params?)
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure) indexed by market symbols

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
- https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch tickers for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tickTypes | <code>string</code> | No | generation 1 only, the tick type to subscribe to, '24H' by default (30M, 1H, 12H, 24H, MID) |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.watchTickers (symbols, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
- https://apidocs.bithumb.com/reference/%ED%98%B8%EA%B0%80-orderbook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.watchOrderBook (symbol, limit?, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#public-trades)

**See**

- https://apidocs.bithumb.com/v1.2.0/reference/%EB%B9%97%EC%8D%B8-%EA%B1%B0%EB%9E%98%EC%86%8C-%EC%A0%95%EB%B3%B4-%EC%88%98%EC%8B%A0
- https://apidocs.bithumb.com/reference/%EC%B2%B4%EA%B2%B0-trade


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.watchTrades (symbol, since?, limit?, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%9E%90%EC%82%B0-myasset  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.watchBalance (params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bithumb</code>](#bithumb)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://apidocs.bithumb.com/v2.1.5/reference/%EB%82%B4-%EC%A3%BC%EB%AC%B8-%EB%B0%8F-%EC%B2%B4%EA%B2%B0-myorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.codes | <code>Array&lt;string&gt;</code> | No | market codes to filter orders |
| params.generation | <code>int</code> | No | *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2 |


```javascript
bithumb.watchOrders (symbol, since?, limit?, params?)
```

