
<a name="bitmart" id="bitmart"></a>

## bitmart{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTransactionFee](#fetchtransactionfee)
* [fetchDepositWithdrawFee](#fetchdepositwithdrawfee)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [fetchBalance](#fetchbalance)
* [fetchTradingFee](#fetchtradingfee)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchOrder](#fetchorder)
* [fetchDepositAddress](#fetchdepositaddress)
* [withdraw](#withdraw)
* [fetchDeposit](#fetchdeposit)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawal](#fetchwithdrawal)
* [fetchWithdrawals](#fetchwithdrawals)
* [repayIsolatedMargin](#repayisolatedmargin)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [fetchIsolatedBorrowRate](#fetchisolatedborrowrate)
* [fetchIsolatedBorrowRates](#fetchisolatedborrowrates)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchBorrowInterest](#fetchborrowinterest)
* [fetchOpenInterest](#fetchopeninterest)
* [setLeverage](#setleverage)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchMyLiquidations](#fetchmyliquidations)
* [editOrder](#editorder)
* [fetchLedger](#fetchledger)
* [fetchFundingHistory](#fetchfundinghistory)
* [setPositionMode](#setpositionmode)
* [fetchPositionMode](#fetchpositionmode)
* [watchBalance](#watchbalance)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchOrders](#watchorders)
* [watchPositions](#watchpositions)
* [watchOHLCV](#watchohlcv)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://developer-pro.bitmart.com/en/spot/#get-system-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchTime ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-system-service-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchStatus ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bitmart

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://developer-pro.bitmart.com/en/spot/#get-trading-pair-details-v1
- https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://developer-pro.bitmart.com/en/spot/#get-currency-list-v1  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchCurrencies ([params])
```


<a name="fetchTransactionFee" id="fetchtransactionfee"></a>

### fetchTransactionFee{docsify-ignore}
`DEPRECATED`

please use fetchDepositWithdrawFee instead

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network code of the currency |


```javascript
bitmart.fetchTransactionFee (code[, params])
```


<a name="fetchDepositWithdrawFee" id="fetchdepositwithdrawfee"></a>

### fetchDepositWithdrawFee{docsify-ignore}
fetch the fee for deposits and withdrawals

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#withdraw-quota-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network code of the currency |


```javascript
bitmart.fetchDepositWithdrawFee (code[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#get-ticker-of-a-trading-pair-v3
- https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#get-ticker-of-all-pairs-v3
- https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchTickers (symbols[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://developer-pro.bitmart.com/en/spot/#get-depth-v3
- https://developer-pro.bitmart.com/en/futuresv2/#get-market-depth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get a list of the most recent trades for a particular symbol

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://developer-pro.bitmart.com/en/spot/#get-recent-trades-v3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://developer-pro.bitmart.com/en/spot/#get-history-k-line-v3
- https://developer-pro.bitmart.com/en/futuresv2/#get-k-line


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp of the latest candle in ms |
| params.paginate | <code>boolean</code> | No | *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitmart.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#account-trade-list-v4-signed
- https://developer-pro.bitmart.com/en/futuresv2/#get-order-trade-keyed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.marginMode | <code>boolean</code> | No | *spot* whether to fetch trades for margin orders or spot orders, defaults to spot orders (only isolated margin orders are supported) |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#order-trade-list-v4-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#get-spot-wallet-balance-keyed
- https://developer-pro.bitmart.com/en/futuresv2/#get-contract-assets-keyed
- https://developer-pro.bitmart.com/en/spot/#get-account-balance-keyed
- https://developer-pro.bitmart.com/en/spot/#get-margin-account-details-isolated-keyed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchBalance ([params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-actual-trade-fee-rate-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchTradingFee (symbol[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#new-order-v2-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#new-order-v2-signed
- https://developer-pro.bitmart.com/en/spot/#new-margin-order-v1-signed
- https://developer-pro.bitmart.com/en/futuresv2/#submit-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#submit-plan-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#submit-tp-sl-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#submit-trail-order-signed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit' or 'trailing' for swap markets only |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.leverage | <code>string</code> | No | *swap only* leverage level |
| params.clientOrderId | <code>string</code> | No | client order id of the order |
| params.reduceOnly | <code>boolean</code> | No | *swap only* reduce only |
| params.postOnly | <code>boolean</code> | No | make sure the order is posted to the order book and not matched immediately |
| params.triggerPrice | <code>string</code> | No | *swap only* the price to trigger a stop order |
| params.price_type | <code>int</code> | No | *swap only* 1: last price, 2: fair price, default is 1 |
| params.price_way | <code>int</code> | No | *swap only* 1: price way long, 2: price way short |
| params.activation_price_type | <code>int</code> | No | *swap trailing order only* 1: last price, 2: fair price, default is 1 |
| params.trailingPercent | <code>string</code> | No | *swap only* the percent to trail away from the current market price, min 0.1 max 5 |
| params.trailingTriggerPrice | <code>string</code> | No | *swap only* the price to trigger a trailing order, default uses the price argument |
| params.stopLossPrice | <code>string</code> | No | *swap only* the price to trigger a stop-loss order |
| params.takeProfitPrice | <code>string</code> | No | *swap only* the price to trigger a take-profit order |
| params.plan_category | <code>int</code> | No | *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1 |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#new-batch-order-v4-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.createOrders (orders[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/futuresv2/#cancel-order-signed
- https://developer-pro.bitmart.com/en/spot/#cancel-order-v3-signed
- https://developer-pro.bitmart.com/en/futuresv2/#cancel-plan-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#cancel-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#cancel-trail-order-signed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | *spot only* the client order id of the order to cancel |
| params.trigger | <code>boolean</code> | No | *swap only* whether the order is a trigger order |
| params.trailing | <code>boolean</code> | No | *swap only* whether the order is a stop order |


```javascript
bitmart.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#cancel-batch-order-v4-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids |


```javascript
bitmart.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#cancel-all-order-v4-signed
- https://developer-pro.bitmart.com/en/futuresv2/#cancel-all-orders-signed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | *spot only* 'buy' or 'sell' |


```javascript
bitmart.cancelAllOrders (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#current-open-orders-v4-signed
- https://developer-pro.bitmart.com/en/futuresv2/#get-all-open-orders-keyed
- https://developer-pro.bitmart.com/en/futuresv2/#get-all-current-plan-orders-keyed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>boolean</code> | No | *spot* whether to fetch trades for margin orders or spot orders, defaults to spot orders (only isolated margin orders are supported) |
| params.until | <code>int</code> | No | *spot* the latest time in ms to fetch orders for |
| params.type | <code>string</code> | No | *swap* order type, 'limit' or 'market' |
| params.order_state | <code>string</code> | No | *swap* the order state, 'all' or 'partially_filled', default is 'all' |
| params.orderType | <code>string</code> | No | *swap only* 'limit', 'market', or 'trailing' |
| params.trailing | <code>boolean</code> | No | *swap only* set to true if you want to fetch trailing orders |
| params.trigger | <code>boolean</code> | No | *swap only* set to true if you want to fetch trigger orders |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#account-orders-v4-signed
- https://developer-pro.bitmart.com/en/futuresv2/#get-order-history-keyed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest entry |
| params.marginMode | <code>string</code> | No | *spot only* 'cross' or 'isolated', for margin trading |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#query-order-by-id-v4-signed
- https://developer-pro.bitmart.com/en/spot/#query-order-by-clientorderid-v4-signed
- https://developer-pro.bitmart.com/en/futuresv2/#get-order-detail-keyed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the order |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | *spot* fetch the order by client order id instead of order id |
| params.orderType | <code>string</code> | No | *swap only* 'limit', 'market', 'liquidate', 'bankruptcy', 'adl' or 'trailing' |
| params.trailing | <code>boolean</code> | No | *swap only* set to true if you want to fetch a trailing order |
| params.stpMode | <code>string</code> | No | self-trade prevention only for spot, defaults to none, ['none', 'cancel_maker', 'cancel_taker', 'cancel_both'] |


```javascript
bitmart.fetchOrder (id, symbol[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#deposit-address-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchDepositAddress (code[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#withdraw-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network name for this withdrawal |


```javascript
bitmart.withdraw (code, amount, address, tag[, params])
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch information on a deposit

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-a-deposit-or-withdraw-detail-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | not used by bitmart fetchDeposit () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchDeposit (id, code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-deposit-and-withdraw-history-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

### fetchWithdrawal{docsify-ignore}
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-a-deposit-or-withdraw-detail-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | Yes | not used by bitmart.fetchWithdrawal |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchWithdrawal (id, code[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-deposit-and-withdraw-history-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchWithdrawals (code[, since, limit, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#margin-repay-isolated-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>string</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.repayIsolatedMargin (symbol, code, amount[, params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#margin-borrow-isolated-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>string</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

### fetchIsolatedBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://github.com/ccxt/ccxt/wiki/Manual#isolated-borrow-rate-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-trading-pair-borrowing-rate-and-amount-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the borrow rate for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchIsolatedBorrowRate (symbol[, params])
```


<a name="fetchIsolatedBorrowRates" id="fetchisolatedborrowrates"></a>

### fetchIsolatedBorrowRates{docsify-ignore}
fetch the borrow interest rates of all currencies, currently only works for isolated margin

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a list of [isolated borrow rate structures](https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-trading-pair-borrowing-rate-and-amount-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchIsolatedBorrowRates ([params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account, currently only supports transfer between spot and margin

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#margin-asset-transfer-signed
- https://developer-pro.bitmart.com/en/futuresv2/#transfer-signed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account, only transfers between spot and swap are supported

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-transfer-list-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.page | <code>int</code> | No | the required number of pages, default is 1, max is 1000 |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for |


```javascript
bitmart.fetchTransfers (code[, since, limit, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)

**See**: https://developer-pro.bitmart.com/en/spot/#get-borrow-record-isolated-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| symbol | <code>string</code> | Yes | unified market symbol when fetch interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchBorrowInterest (code, symbol[, since, limit, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a currency

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-futures-openinterest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
bitmart.fetchOpenInterest (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://developer-pro.bitmart.com/en/futuresv2/#submit-leverage-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' |


```javascript
bitmart.setLeverage (leverage, symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-current-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-funding-rate-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response |
| limit | <code>int</code> | No | the maximum amount of funding rate structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open contract positions

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-keyed
- https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-v2-keyed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchPositions (symbols[, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-order-history-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmart api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |


```javascript
bitmart.fetchMyLiquidations (symbol[, since, limit, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edits an open order

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/futuresv2/#modify-plan-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#modify-tp-sl-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#modify-preset-plan-order-signed
- https://developer-pro.bitmart.com/en/futuresv2/#modify-limit-order-signed


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>string</code> | No | *swap only* the price to trigger a stop order |
| params.stopLossPrice | <code>string</code> | No | *swap only* the price to trigger a stop-loss order |
| params.takeProfitPrice | <code>string</code> | No | *swap only* the price to trigger a take-profit order |
| params.stopLoss.triggerPrice | <code>string</code> | No | *swap only* the price to trigger a preset stop-loss order |
| params.takeProfit.triggerPrice | <code>string</code> | No | *swap only* the price to trigger a preset take-profit order |
| params.clientOrderId | <code>string</code> | No | client order id of the order |
| params.price_type | <code>int</code> | No | *swap only* 1: last price, 2: fair price, default is 1 |
| params.plan_category | <code>int</code> | No | *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1 |


```javascript
bitmart.editOrder (id, symbol, type, side[, amount, price, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [ledger structures](https://docs.ccxt.com/#/?id=ledger)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-transaction-history-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |


```javascript
bitmart.fetchLedger ([code, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-transaction-history-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the starting timestamp in milliseconds |
| limit | <code>int</code> | No | the number of entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch funding history for |


```javascript
bitmart.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://developer-pro.bitmart.com/en/futuresv2/#submit-leverage-signed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by bingx setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.setPositionMode (hedged, symbol[, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://developer-pro.bitmart.com/en/futuresv2/#get-position-mode-keyed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.fetchPositionMode (symbol[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#private-balance-change
- https://developer-pro.bitmart.com/en/futuresv2/#private-assets-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchBalance ([params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://developer-pro.bitmart.com/en/spot/#public-trade-channel
- https://developer-pro.bitmart.com/en/futuresv2/#public-trade-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://developer-pro.bitmart.com/en/spot/#public-trade-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
- https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
- https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#public-ticker-channel
- https://developer-pro.bitmart.com/en/futuresv2/#public-ticker-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchBidsAsks (symbols[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://developer-pro.bitmart.com/en/spot/#private-order-progress
- https://developer-pro.bitmart.com/en/futuresv2/#private-order-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchOrders (symbol[, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://developer-pro.bitmart.com/en/futures/#private-position-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchPositions (symbols[, since, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://developer-pro.bitmart.com/en/spot/#public-kline-channel
- https://developer-pro.bitmart.com/en/futuresv2/#public-klinebin-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitmart.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://developer-pro.bitmart.com/en/spot/#public-depth-all-channel
- https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel
- https://developer-pro.bitmart.com/en/futuresv2/#public-depth-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.speed | <code>string</code> | No | *futures only* '100ms' or '200ms' |


```javascript
bitmart.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitmart</code>](#bitmart)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://developer-pro.bitmart.com/en/spot/#public-depth-increase-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.depth | <code>string</code> | No | the type of order book to subscribe to, default is 'depth/increase100', also accepts 'depth5' or 'depth20' or depth50 |


```javascript
bitmart.watchOrderBookForSymbols (symbols[, limit, params])
```

