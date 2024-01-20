
<a name="poloniexfutures" id="poloniexfutures"></a>

## poloniexfutures{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchL3OrderBook](#fetchl3orderbook)
* [fetchTrades](#fetchtrades)
* [fetchTime](#fetchtime)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [fetchPositions](#fetchpositions)
* [fetchFundingHistory](#fetchfundinghistory)
* [cancelAllOrders](#cancelallorders)
* [fetchOrdersByStatus](#fetchordersbystatus)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOrder](#fetchorder)
* [fetchFundingRate](#fetchfundingrate)
* [fetchMyTrades](#fetchmytrades)
* [setMarginMode](#setmarginmode)
* [watchTicker](#watchticker)
* [watchTrades](#watchtrades)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)
* [watchBalance](#watchbalance)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for poloniexfutures

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://futures-docs.poloniex.com/#symbol-2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://futures-docs.poloniex.com/#get-real-time-ticker-2-0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://futures-docs.poloniex.com/#get-real-time-ticker-of-all-symbols  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchTickers (symbols[, params])
```


<a name="fetchL3OrderBook" id="fetchl3orderbook"></a>

### fetchL3OrderBook{docsify-ignore}
fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://futures-docs.poloniex.com/#get-full-order-book-level-3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchL3OrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://futures-docs.poloniex.com/#historical-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the poloniexfutures server

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the poloniexfutures server

**See**: https://futures-docs.poloniex.com/#time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchTime ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://futures-docs.poloniex.com/#k-chart  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://futures-docs.poloniex.com/#get-account-overview  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://futures-docs.poloniex.com/#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>float</code> | No | Leverage size of the order |
| params.stopPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.reduceOnly | <code>bool</code> | No | A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true. |
| params.timeInForce | <code>string</code> | No | GTC, GTT, IOC, or FOK, default is GTC, limit orders only |
| params.postOnly | <code>string</code> | No | Post only flag, invalid when timeInForce is IOC or FOK |
| params.clientOid | <code>string</code> | No | client order id, defaults to uuid if not passed |
| params.remark | <code>string</code> | No | remark for the order, length cannot exceed 100 utf8 characters |
| params.stop | <code>string</code> | No | 'up' or 'down', defaults to 'up' if side is sell and 'down' if side is buy, requires stopPrice |
| params.stopPriceType | <code>string</code> | No | TP, IP or MP, defaults to TP |
| params.closeOrder | <code>bool</code> | No | set to true to close position |
| params.forceHold | <code>bool</code> | No | A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default. |


```javascript
poloniexfutures.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://futures-docs.poloniex.com/#cancel-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.cancelOrder (id, symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://futures-docs.poloniex.com/#get-position-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchPositions (symbols[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://futures-docs.poloniex.com/#get-funding-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>object</code> | No | When true, all the trigger orders will be cancelled |


```javascript
poloniexfutures.cancelAllOrders (symbol[, params])
```


<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

### fetchOrdersByStatus{docsify-ignore}
fetches a list of orders placed on the exchange

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: An [array of order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://futures-docs.poloniex.com/#get-order-list
- https://futures-docs.poloniex.com/#get-untriggered-stop-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | 'active' or 'closed', only 'active' is valid for stop orders |
| symbol | <code>string</code> | Yes | unified symbol for the market to retrieve orders from |
| since | <code>int</code> | No | timestamp in ms of the earliest order to retrieve |
| limit | <code>int</code> | No | The maximum number of orders to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.stop | <code>bool</code> | No | set to true to retrieve untriggered stop orders |
| params.until | <code>int</code> | No | End time in ms |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit or market |


```javascript
poloniexfutures.fetchOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://futures-docs.poloniex.com/#get-order-list
- https://futures-docs.poloniex.com/#get-untriggered-stop-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.till | <code>int</code> | No | end time in ms |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit, or market |


```javascript
poloniexfutures.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://futures-docs.poloniex.com/#get-order-list
- https://futures-docs.poloniex.com/#get-untriggered-stop-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.till | <code>int</code> | No | end time in ms |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit, or market |


```javascript
poloniexfutures.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://futures-docs.poloniex.com/#get-details-of-a-single-order
- https://futures-docs.poloniex.com/#get-single-order-by-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchOrder (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://futures-docs.poloniex.com/#get-premium-index  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.fetchFundingRate (symbol[, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://futures-docs.poloniex.com/#get-fills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| orderIdFills | <code>string</code> | Yes | filles for a specific order (other parameters can be ignored if specified) |
| side | <code>string</code> | Yes | buy or sell |
| type | <code>string</code> | Yes | limit, market, limit_stop or market_stop |
| endAt | <code>int</code> | Yes | end time (milisecond) |


```javascript
poloniexfutures.fetchMyTrades (symbol[, since, limit, params, orderIdFills, side, type, endAt])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://futures-docs.poloniex.com/#change-margin-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>int</code> | Yes | 0 (isolated) or 1 (cross) |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.setMarginMode (marginMode, symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://futures-docs.poloniex.com/#get-real-time-symbol-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.watchTicker (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://futures-docs.poloniex.com/#full-matching-engine-data-level-3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.watchTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://futures-docs.poloniex.com/#level-2-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | not used by poloniexfutures watchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | the method to use. Defaults to /contractMarket/level2 can also be /contractMarket/level3v2 to receive the raw stream of orders |


```javascript
poloniexfutures.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://futures-docs.poloniex.com/#private-messages  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | filter by unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | the method to use will default to /contractMarket/tradeOrders. Set to /contractMarket/advancedOrders to watch stop orders |


```javascript
poloniexfutures.watchOrders (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>poloniexfutures</code>](#poloniexfutures)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://futures-docs.poloniex.com/#account-balance-events  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
poloniexfutures.watchBalance ([params])
```

