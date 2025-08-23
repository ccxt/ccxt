
<a name="vertex" id="vertex"></a>

## vertex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchTickers](#fetchtickers)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [cancelAllOrders](#cancelallorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [withdraw](#withdraw)
* [watchTrades](#watchtrades)
* [watchMyTrades](#watchmytrades)
* [watchTicker](#watchticker)
* [watchOrderBook](#watchorderbook)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for vertex

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/symbols  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchMarkets ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchTime ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchStatus ([params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/matches  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/fee-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.fetchTradingFees ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/candlesticks  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms))) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetches funding rates for multiple markets

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchFundingRates (symbols[, params])
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
vertex.fetchOpenInterests ([symbols, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a derivative trading pair

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
vertex.fetchOpenInterest (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/v2/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchTickers ([symbols, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/place-order
- https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/place-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | ioc, fok |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only, only works for ioc and fok order |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |


```javascript
vertex.createOrder (symbol, type, side, amount[, price, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-and-place  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | ioc, fok |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only, only works for ioc and fok order |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |


```javascript
vertex.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/orders
- https://docs.vertexprotocol.com/developer-resources/api/trigger/queries/list-trigger-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger/algo order |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/trigger/queries/list-trigger-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger/algo order |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.fetchOrders (symbol[, since, limit, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-product-orders
- https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/cancel-product-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger/algo order |


```javascript
vertex.cancelAllOrders (symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-orders
- https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/cancel-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-orders
- https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/cancel-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.cancelOrders (ids[, symbol, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/subaccount-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.fetchBalance ([params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/subaccount-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.fetchPositions ([symbols, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/withdrawing-on-chain  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.withdraw (code, amount, address, tag[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.watchTrades (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.watchTicker (symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.watchOrderBook (symbol[, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since |  | Yes |  |
| limit |  | Yes |  |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
vertex.watchPositions (symbols, since, limit, params[])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>vertex</code>](#vertex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.vertexprotocol.com/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
vertex.watchOrders (symbol[, since, limit, params])
```

