
<a name="kraken" id="kraken"></a>

## kraken{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchStatus](#fetchstatus)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTradingFee](#fetchtradingfee)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOHLCV](#fetchohlcv)
* [fetchLedger](#fetchledger)
* [fetchTrades](#fetchtrades)
* [fetchBalance](#fetchbalance)
* [createMarketOrderWithCost](#createmarketorderwithcost)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOrderTrades](#fetchordertrades)
* [fetchOrdersByIds](#fetchordersbyids)
* [fetchMyTrades](#fetchmytrades)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchDeposits](#fetchdeposits)
* [fetchTime](#fetchtime)
* [fetchWithdrawals](#fetchwithdrawals)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositMethods](#fetchdepositmethods)
* [fetchDepositAddress](#fetchdepositaddress)
* [withdraw](#withdraw)
* [fetchPositions](#fetchpositions)
* [transferOut](#transferout)
* [transfer](#transfer)

<a name="kraken" id="kraken"></a>

### kraken{docsify-ignore}
Set rateLimit to 1000 if fully verified



```javascript
kraken.kraken ()
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for kraken

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTradableAssetPairs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchMarkets ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/get-system-status/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchStatus ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getAssetInfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchCurrencies ([params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradeVolume  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchTradingFee (symbol[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getOrderBook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTickerInformation  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTickerInformation  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchTicker (symbol[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.kraken.com/api/docs/rest-api/get-ohlc-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kraken.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getLedgers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |
| params.end | <code>int</code> | No | timestamp in seconds of the latest ledger entry |


```javascript
kraken.fetchLedger ([code, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getRecentTrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getExtendedBalance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchBalance ([params])
```


<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

### createMarketOrderWithCost{docsify-ignore}
create a market order by providing the symbol, side and cost

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/rest/#tag/Spot-Trading/operation/addOrder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in (only USD markets are supported) |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.createMarketOrderWithCost (symbol, side, cost[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol, side and cost

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/rest/#tag/Spot-Trading/operation/addOrder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/add-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.reduceOnly | <code>bool</code> | No | *margin only* indicates if this order is to reduce the size of a position |
| params.stopLossPrice | <code>float</code> | No | *margin only* the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *margin only* the price that a take profit order is triggered at |
| params.trailingAmount | <code>string</code> | No | *margin only* the quote amount to trail away from the current market price |
| params.trailingPercent | <code>string</code> | No | *margin only* the percent to trail away from the current market price |
| params.trailingLimitAmount | <code>string</code> | No | *margin only* the quote amount away from the trailingAmount |
| params.trailingLimitPercent | <code>string</code> | No | *margin only* the percent away from the trailingAmount |
| params.offset | <code>string</code> | No | *margin only* '+' or '-' whether you want the trailingLimitAmount value to be positive or negative, default is negative '-' |
| params.trigger | <code>string</code> | No | *margin only* the activation price type, 'last' or 'index', default is 'last' |


```javascript
kraken.createOrder (symbol, type, side, amount[, price, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/amend-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at |
| params.trailingAmount | <code>string</code> | No | the quote amount to trail away from the current market price |
| params.trailingPercent | <code>string</code> | No | the percent to trail away from the current market price |
| params.trailingLimitAmount | <code>string</code> | No | the quote amount away from the trailingAmount |
| params.trailingLimitPercent | <code>string</code> | No | the percent away from the trailingAmount |
| params.offset | <code>string</code> | No | '+' or '-' whether you want the trailingLimitAmount value to be positive or negative |
| params.postOnly | <code>boolean</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.clientOrderId | <code>string</code> | No | the orders client order id |


```javascript
kraken.editOrder (id, symbol, type, side[, amount, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getOrdersInfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by kraken fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchOrder (id, symbol[, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradesInfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchOrdersByIds" id="fetchordersbyids"></a>

### fetchOrdersByIds{docsify-ignore}
fetch orders by the list of order id

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getClosedOrders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | No | list of order id |
| symbol | <code>string</code> | No | unified ccxt market symbol |
| params | <code>object</code> | No | extra parameters specific to the kraken api endpoint |


```javascript
kraken.fetchOrdersByIds ([ids, symbol, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/get-trade-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade entry |
| params.end | <code>int</code> | No | timestamp in seconds of the latest trade entry |


```javascript
kraken.fetchMyTrades (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the orders client order id |
| params.userref | <code>int</code> | No | the orders user reference id |


```javascript
kraken.cancelOrder (id[, symbol, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelOrderBatch  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | open orders transaction ID (txid) or user reference (userref) |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelAllOrders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.cancelAllOrders (symbol[, params])
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - the api result

**See**: https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelAllOrdersAfter  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.cancelAllOrdersAfter (timeout[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the orders client order id |
| params.userref | <code>int</code> | No | the orders user reference id |


```javascript
kraken.fetchOpenOrders ([symbol, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kraken.com/api/docs/rest-api/get-closed-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest entry |
| params.clientOrderId | <code>string</code> | No | the orders client order id |
| params.userref | <code>int</code> | No | the orders user reference id |


```javascript
kraken.fetchClosedOrders ([symbol, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentDeposits  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest transaction entry |
| params.end | <code>int</code> | No | timestamp in seconds of the latest transaction entry |


```javascript
kraken.fetchDeposits (code[, since, limit, params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getServerTime  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchTime ([params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentWithdrawals  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest transaction entry |
| params.end | <code>int</code> | No | timestamp in seconds of the latest transaction entry |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times |


```javascript
kraken.fetchWithdrawals (code[, since, limit, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.createDepositAddress (code[, params])
```


<a name="fetchDepositMethods" id="fetchdepositmethods"></a>

### fetchDepositMethods{docsify-ignore}
fetch deposit methods for a currency associated with this account

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - of deposit methods

**See**: https://docs.kraken.com/rest/#tag/Funding/operation/getDepositMethods  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the kraken api endpoint |


```javascript
kraken.fetchDepositMethods (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchDepositAddress (code[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kraken.com/rest/#tag/Funding/operation/withdrawFunds  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to, not required can be '' or undefined/none/null |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.withdraw (code, amount, address, tag[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.kraken.com/rest/#tag/Account-Data/operation/getOpenPositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | not used by kraken fetchPositions () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kraken.fetchPositions ([symbols, params])
```


<a name="transferOut" id="transferout"></a>

### transferOut{docsify-ignore}
transfer from spot wallet to futures wallet

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>str</code> | Yes | Unified currency code |
| amount | <code>float</code> | Yes | Size of the transfer |
| params | <code>dict</code> | No | Exchange specific parameters |


```javascript
kraken.transferOut (code, amount[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfers currencies between sub-accounts (only spot->swap direction is supported)

**Kind**: instance method of [<code>kraken</code>](#kraken)  
**Returns**: a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | Unified currency code |
| amount | <code>float</code> | Yes | Size of the transfer |
| fromAccount | <code>string</code> | Yes | 'spot' or 'Spot Wallet' |
| toAccount | <code>string</code> | Yes | 'swap' or 'Futures Wallet' |
| params | <code>object</code> | No | Exchange specific parameters |


```javascript
kraken.transfer (code, amount, fromAccount, toAccount[, params])
```

