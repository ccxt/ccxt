
<a name="defx" id="defx"></a>

## defx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchMarkPrice](#fetchmarkprice)
* [fetchFundingRate](#fetchfundingrate)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [closePosition](#closeposition)
* [closeAllPositions](#closeallpositions)
* [fetchLedger](#fetchledger)
* [withdraw](#withdraw)
* [setLeverage](#setleverage)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchBalance](#watchbalance)
* [watchOrders](#watchorders)
* [watchPositions](#watchpositions)

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchStatus ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://api-docs.defx.com/#4b03bb3b-a0fa-4dfb-b96c-237bde0ce9e6  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchTime ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for defx

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://api-docs.defx.com/#73cce0c8-f842-4891-9145-01bb6d61324d
- https://api-docs.defx.com/#24fd4e5b-840e-451e-99e0-7fea47c7f371


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api-docs.defx.com/#fe6f81d0-2f3a-4eee-976f-c8fc8f4c5d56  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api-docs.defx.com/#8c61cfbd-40d9-410e-b014-f5b36eba51d1  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchTickers (symbols[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://api-docs.defx.com/#54b71951-1472-4670-b5af-4c2dc41e73d0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms))) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
defx.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://api-docs.defx.com/#5865452f-ea32-4f13-bfbc-03af5f5574fd  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://api-docs.defx.com/#06b5b33c-2fc6-48de-896c-fc316f5871a7  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://api-docs.defx.com/#6c1a2971-8325-4e7d-9962-e0bfcaacf9c4  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.slab | <code>string</code> | No | slab from market.info.depthSlabs |


```javascript
defx.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches mark price for the market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api-docs.defx.com/#12168192-4e7b-4458-a001-e8b80961f0b7  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |


```javascript
defx.fetchMarkPrice (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://api-docs.defx.com/#12168192-4e7b-4458-a001-e8b80961f0b7  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchFundingRate (symbol[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://api-docs.defx.com/#26414338-14f7-40a1-b246-f8ea8571493f  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#ba222d88-8856-4d3c-87a9-7cec07bb2622  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | The price a trigger order is triggered at |
| params.reduceOnly | <code>string</code> | No | for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean. |


```javascript
defx.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#09186f23-f8d1-4993-acf4-9974d8a6ddb0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#db5531da-3692-4a53-841f-6ad6495f823a  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.cancelAllOrders (symbol[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://api-docs.defx.com/#d89dbb86-9aba-4f59-ac5d-a97ff25ea80e  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://api-docs.defx.com/#d89dbb86-9aba-4f59-ac5d-a97ff25ea80e  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchPositions ([symbols, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#44f82dd5-26b3-4e1f-b4aa-88ceddd65237  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
defx.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
defx.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
defx.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#ab200038-8acb-4170-b05e-4fcb4cc13751  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
defx.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position for a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-docs.defx.com/#b2c08074-c4d9-4e50-b637-0d6c498fa29e  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| side | <code>string</code> | No | one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short' |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionId | <code>string</code> | No | the position id you want to close |
| params.type | <code>string</code> | No | 'MARKET' or 'LIMIT' |
| params.quantity | <code>string</code> | No | how much of currency you want to trade in units of base currency |
| params.price | <code>string</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |


```javascript
defx.closePosition (symbol[, side, params])
```


<a name="closeAllPositions" id="closeallpositions"></a>

### closeAllPositions{docsify-ignore}
closes all open positions for a market type

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://api-docs.defx.com/#d6f63b43-100e-47a9-998c-8b6c0c72d204  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.closeAllPositions ([params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://api-docs.defx.com/#38cc8974-794f-48c0-b959-db045a0ee565  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
defx.fetchLedger ([code, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api-docs.defx.com/#2600f503-63ed-4672-b8f6-69ea5f03203b  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.withdraw (code, amount, address, tag[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://api-docs.defx.com/#4cb4ecc4-6c61-4194-8353-be67faaf7ca7  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.setLeverage (leverage, symbol[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchOHLCVForSymbols (symbolsAndTimeframes[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
defx.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchTickers ([symbols, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchTickers ([symbols, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchBidsAsks (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchTrades (symbol[, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchTradesForSymbols (symbols[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchBalance ([params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchOrders ([symbol, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>defx</code>](#defx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>number</code> | No | since timestamp |
| limit | <code>number</code> | No | limit |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
defx.watchPositions (symbols[, since, limit, params])
```

