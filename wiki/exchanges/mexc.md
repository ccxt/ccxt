
<a name="mexc" id="mexc"></a>

## mexc{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchBidsAsks](#fetchbidsasks)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchAccounts](#fetchaccounts)
* [fetchTradingFee](#fetchtradingfee)
* [fetchBalance](#fetchbalance)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [setLeverage](#setleverage)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchTransfer](#fetchtransfer)
* [fetchTransfers](#fetchtransfers)
* [transfer](#transfer)
* [withdraw](#withdraw)
* [setPositionMode](#setpositionmode)
* [fetchPositionMode](#fetchpositionmode)
* [fetchTransactionFees](#fetchtransactionfees)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchLeverage](#fetchleverage)
* [fetchPositionsHistory](#fetchpositionshistory)
* [setMarginMode](#setmarginmode)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchOHLCV](#watchohlcv)
* [watchOrderBook](#watchorderbook)
* [watchTrades](#watchtrades)
* [watchMyTrades](#watchmytrades)
* [watchOrders](#watchorders)
* [watchBalance](#watchbalance)
* [unWatchTicker](#unwatchticker)
* [unWatchTickers](#unwatchtickers)
* [unWatchBidsAsks](#unwatchbidsasks)
* [unWatchOHLCV](#unwatchohlcv)
* [unWatchOrderBook](#unwatchorderbook)
* [unWatchTrades](#unwatchtrades)

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#test-connectivity
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-server-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchStatus ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#check-server-time
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-server-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for mexc

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#exchange-information
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchMarkets ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#order-book
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-s-depth-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#recent-trades-list
- https://mexcdevelop.github.io/apidocs/spot_v3_en/#compressed-aggregate-trades-list
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-transaction-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | *spot only* *since must be defined* the latest time in ms to fetch entries for |


```javascript
mexc.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#kline-candlestick-data
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
mexc.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-trend-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-trend-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchTicker (symbol[, params])
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#symbol-order-book-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchBidsAsks (symbols[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

### createMarketSellOrderWithCost{docsify-ignore}
create a market sell order by providing the symbol and cost

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.createMarketSellOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#order-under-maintenance
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#trigger-order-under-maintenance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | only 'isolated' is supported for spot-margin trading |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted if it will be a maker order |
| params.reduceOnly | <code>bool</code> | No | *contract only* indicates if this order is to reduce the size of a position |
| params.hedged | <code>bool</code> | No | *swap only* true for hedged mode, false for one way mode, default is false |
| params.timeInForce | <code>string</code> | No | 'IOC' or 'FOK', default is 'GTC' EXCHANGE SPECIFIC PARAMETERS |
| params.leverage | <code>int</code> | No | *contract only* leverage is necessary on isolated margin |
| params.positionId | <code>long</code> | No | *contract only* it is recommended to fill in this parameter when closing a position |
| params.externalOid | <code>string</code> | No | *contract only* external order ID |
| params.positionMode | <code>int</code> | No | *contract only*  1:hedge, 2:one-way, default: the user's current config |
| params.test | <code>boolean</code> | No | *spot only* whether to use the test endpoint or not, default is false |


```javascript
mexc.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
*spot only*  *all orders must have the same symbol* create a list of trade orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#batch-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to api endpoint |


```javascript
mexc.createOrders (orders[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-order
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#query-the-order-based-on-the-order-number


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | only 'isolated' is supported, for spot-margin trading |


```javascript
mexc.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.marginMode | <code>string</code> | No | only 'isolated' is supported, for spot-margin trading |


```javascript
mexc.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#current-open-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | only 'isolated' is supported, for spot-margin trading |


```javascript
mexc.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#cancel-order
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-order-under-maintenance
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-stop-limit-trigger-order-under-maintenance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | only 'isolated' is supported for spot-margin trading |


```javascript
mexc.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-order-under-maintenance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#cancel-all-open-orders-on-a-symbol
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-all-orders-under-a-contract-under-maintenance
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-all-trigger-orders-under-maintenance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | only 'isolated' is supported for spot-margin trading |


```javascript
mexc.cancelAllOrders (symbol[, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-information
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-informations-of-user-39-s-asset


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchAccounts ([params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-mx-deduct-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchTradingFee (symbol[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-information
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-informations-of-user-39-s-asset
- https://mexcdevelop.github.io/apidocs/spot_v3_en/#isolated-account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbols | <code>string</code> | No | // required for margin, market id's separated by commas |


```javascript
mexc.fetchBalance ([params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-trade-list
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-transaction-details-of-the-user-s-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |


```javascript
mexc.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-trade-list
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#query-the-order-based-on-the-order-number


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#increase-or-decrease-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#increase-or-decrease-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.addMargin (symbol, amount[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#switch-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.setLeverage (leverage, symbol[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-details-of-user-s-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchFundingInterval (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | not used by mexc, but filtered internally by ccxt |
| limit | <code>int</code> | No | mexc limit is page_size default 20, maximum is 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes, if a market has a leverage tier of 0, then the leverage tiers cannot be obtained for this market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchLeverageTiers ([symbols, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch a dictionary of addresses for a currency, indexed by network

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/#/?id=address-structure) indexed by the network

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-address-supporting-network  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchDepositAddressesByNetwork (code[, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#generate-deposit-address-supporting-network  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the blockchain network name |


```javascript
mexc.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-address-supporting-network  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the chain of currency, this only apply for multi-chain currency, and there is no need for single chain currency |


```javascript
mexc.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-history-supporting-network  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#withdraw-history-supporting-network  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchPositions (symbols[, params])
```


<a name="fetchTransfer" id="fetchtransfer"></a>

### fetchTransfer{docsify-ignore}
fetches a transfer

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v2_en/#internal-assets-transfer-order-inquiry  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | transfer id |
| code | <code>string</code> | No | not used by mexc fetchTransfer |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |


```javascript
mexc.fetchTransfer (id[, code, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v2_en/#get-internal-assets-transfer-records
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-39-s-asset-transfer-records


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of  transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchTransfers (code[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#user-universal-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | market symbol required for margin account transfers eg:BTCUSDT |


```javascript
mexc.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#withdraw-new
- https://www.mexc.com/api-docs/spot-v3/wallet-endpoints#internal-transfer


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.internal | <code>object</code> | No | false by default, set to true for an "internal transfer" |
| params.toAccountType | <code>object</code> | No | skipped by default, set to 'EMAIL|UID|MOBILE' when making an "internal transfer" |


```javascript
mexc.withdraw (code, amount, address, tag[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#change-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by mexc setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.setPositionMode (hedged, symbol[, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by mexc fetchPositionMode |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchPositionMode (symbol[, params])
```


<a name="fetchTransactionFees" id="fetchtransactionfees"></a>

### fetchTransactionFees{docsify-ignore}
fetch deposit and withdrawal fees

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | returns fees for all currencies if undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchTransactionFees (codes[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdrawal fees

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | returns fees for all currencies if undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchLeverage (symbol[, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified contract symbols |
| since | <code>int</code> | No | not used by mexc fetchPositionsHistory |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, default=1000 |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.type | <code>int</code> | No | position type，1: long, 2: short |
| params.page_num | <code>int</code> | No | current page number, default is 1 |


```javascript
mexc.fetchPositionsHistory ([symbols, since, limit, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://mexcdevelop.github.io/apidocs/contract_v1_en/#switch-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | No | required when there is no position, else provide params["positionId"] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionId | <code>string</code> | No | required when a position is set |
| params.direction | <code>string</code> | No | "long" or "short" required when there is no position |


```javascript
mexc.setMarginMode (marginMode[, symbol, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
- https://mexcdevelop.github.io/apidocs/spot_v3_en/#miniticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.miniTicker | <code>boolean</code> | No | set to true for using the miniTicker endpoint |


```javascript
mexc.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
- https://mexcdevelop.github.io/apidocs/spot_v3_en/#minitickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.miniTicker | <code>boolean</code> | No | set to true for using the miniTicker endpoint |


```javascript
mexc.watchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.watchBidsAsks (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.mexc.com/api-docs/spot-v3/websocket-market-streams#trade-streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.mexc.com/api-docs/spot-v3/websocket-market-streams#trade-streams
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.frequency | <code>string</code> | No | the frequency of the order book updates, default is '10ms', can be '100ms' or '10ms |


```javascript
mexc.watchOrderBook (symbol[, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.mexc.com/api-docs/spot-v3/websocket-market-streams#trade-streams
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.watchTrades (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.mexc.com/api-docs/spot-v3/websocket-user-data-streams#spot-account-deals
- https://mexcdevelop.github.io/apidocs/contract_v1_en/#private-channels


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.mexc.com/api-docs/spot-v3/websocket-user-data-streams#spot-account-orders
- https://mexcdevelop.github.io/apidocs/spot_v3_en/#margin-account-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code>, <code>undefined</code> | Yes | the type of orders to retrieve, can be 'spot' or 'margin' |


```javascript
mexc.watchOrders (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://www.mexc.com/api-docs/spot-v3/websocket-user-data-streams#spot-account-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.watchBalance ([params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.unWatchTicker (symbol[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.unWatchTickers (symbols[, params])
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
unWatches best bid & ask for symbols

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.unWatchBidsAsks (symbols[, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timezone | <code>object</code> | No | if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00' |


```javascript
mexc.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.frequency | <code>string</code> | No | the frequency of the order book updates, default is '10ms', can be '100ms' or '10ms |


```javascript
mexc.unWatchOrderBook (symbol[, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribes from the trades channel

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.name | <code>string</code> | No | the name of the method to call, 'trade' or 'aggTrade', default is 'trade' |


```javascript
mexc.unWatchTrades (symbol[, params])
```

