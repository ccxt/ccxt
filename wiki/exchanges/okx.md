
<a name="okx" id="okx"></a>

## okx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchAccounts](#fetchaccounts)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTradingFee](#fetchtradingfee)
* [fetchBalance](#fetchbalance)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [fetchLedger](#fetchledger)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchDepositAddress](#fetchdepositaddress)
* [withdraw](#withdraw)
* [fetchDeposits](#fetchdeposits)
* [fetchDeposit](#fetchdeposit)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchWithdrawal](#fetchwithdrawal)
* [fetchLeverage](#fetchleverage)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchPositions](#fetchpositions)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingHistory](#fetchfundinghistory)
* [setLeverage](#setleverage)
* [setPositionMode](#setpositionmode)
* [setMarginMode](#setmarginmode)
* [fetchCrossBorrowRates](#fetchcrossborrowrates)
* [fetchCrossBorrowRate](#fetchcrossborrowrate)
* [fetchBorrowRateHistories](#fetchborrowratehistories)
* [fetchBorrowRateHistory](#fetchborrowratehistory)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchBorrowInterest](#fetchborrowinterest)
* [borrowCrossMargin](#borrowcrossmargin)
* [repayCrossMargin](#repaycrossmargin)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchOpenInterestHistory](#fetchopeninteresthistory)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchUnderlyingAssets](#fetchunderlyingassets)
* [fetchGreeks](#fetchgreeks)
* [closePosition](#closeposition)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchBalance](#watchbalance)
* [watchMyTrades](#watchmytrades)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelOrdersWs](#cancelordersws)
* [cancelAllOrdersWs](#cancelallordersws)

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://www.okx.com/docs-v5/en/#status-get-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchStatus ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-system-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchTime ([params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-account-configuration  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchAccounts ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for okx

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchCurrencies ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-order-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-trades
- https://www.okx.com/docs-v5/en/#rest-api-public-data-get-option-trades


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times |


```javascript
okx.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks
- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history
- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-mark-price-candlesticks
- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-mark-price-candlesticks-history
- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-index-candlesticks
- https://www.okx.com/docs-v5/en/#rest-api-market-data-get-index-candlesticks-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.price | <code>string</code> | No | "mark" or "index" for mark price and index price candles |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-fee-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchTradingFee (symbol[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-balance
- https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchBalance ([params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

### createMarketSellOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.createMarketSellOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
- https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-place-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.reduceOnly | <code>bool</code> | No | a mark to reduce the position size for margin, swap and future orders |
| params.postOnly | <code>bool</code> | No | true to place a post only order |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.takeProfit.price | <code>float</code> | No | used for take profit limit orders, not used for take profit market price orders |
| params.takeProfit.type | <code>string</code> | No | 'market' or 'limit' used to specify the take profit price type |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.stopLoss.price | <code>float</code> | No | used for stop loss limit orders, not used for stop loss market price orders |
| params.stopLoss.type | <code>string</code> | No | 'market' or 'limit' used to specify the stop loss price type |
| params.positionSide | <code>string</code> | No | if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short' |
| params.trailingPercent | <code>string</code> | No | the percent to trail away from the current market price |


```javascript
okx.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders  

| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |


```javascript
okx.createOrders (orders, [undefined])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-trade-amend-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, uses id if not passed |
| params.stopLossPrice | <code>float</code> | No | stop loss trigger price |
| params.newSlOrdPx | <code>float</code> | No | the stop loss order price, set to stopLossPrice if the type is market |
| params.newSlTriggerPxType | <code>string</code> | No | 'last', 'index' or 'mark' used to specify the stop loss trigger price type, default is 'last' |
| params.takeProfitPrice | <code>float</code> | No | take profit trigger price |
| params.newTpOrdPx | <code>float</code> | No | the take profit order price, set to takeProfitPrice if the type is market |
| params.newTpTriggerPxType | <code>string</code> | No | 'last', 'index' or 'mark' used to specify the take profit trigger price type, default is 'last' |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.stopLoss.price | <code>float</code> | No | used for stop loss limit orders, not used for stop loss market price orders |
| params.stopLoss.type | <code>string</code> | No | 'market' or 'limit' used to specify the stop loss price type |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.takeProfit.price | <code>float</code> | No | used for take profit limit orders, not used for take profit market price orders |
| params.takeProfit.type | <code>string</code> | No | 'market' or 'limit' used to specify the take profit price type |


```javascript
okx.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-order
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true if trigger orders |
| params.trailing | <code>boolean</code> | No | set to true if you want to cancel a trailing order |


```javascript
okx.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-multiple-orders
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | whether the order is a stop/trigger order |
| params.trailing | <code>boolean</code> | No | set to true if you want to cancel trailing orders |


```javascript
okx.cancelOrders (ids, symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetch an order by the id

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: [an order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-details
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra and exchange specific parameters |
| params.trigger | <code>boolean</code> | No | true if fetching trigger orders |


```javascript
okx.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-list
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.till | <code>int</code> | No | Timestamp in ms of the latest time to retrieve orders for |
| params.stop | <code>bool</code> | No | True if fetching trigger or conditional orders |
| params.ordType | <code>string</code> | No | "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap" |
| params.algoId | <code>string</code> | No | Algo ID "'433845797218942976'" |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
okx.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-7-days
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | True if fetching trigger or conditional orders |
| params.ordType | <code>string</code> | No | "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap" |
| params.algoId | <code>string</code> | No | Algo ID "'433845797218942976'" |
| params.until | <code>int</code> | No | timestamp in ms to fetch orders for |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
okx.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-7-days
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-history
- https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-3-months


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | True if fetching trigger or conditional orders |
| params.ordType | <code>string</code> | No | "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap" |
| params.algoId | <code>string</code> | No | Algo ID "'433845797218942976'" |
| params.until | <code>int</code> | No | timestamp in ms to fetch orders for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.method | <code>string</code> | No | method to be used, either 'privateGetTradeOrdersHistory', 'privateGetTradeOrdersHistoryArchive' or 'privateGetTradeOrdersAlgoHistory' default is 'privateGetTradeOrdersHistory' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
okx.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-transaction-details-last-3-months  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | Timestamp in ms of the latest time to retrieve trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-transaction-details-last-3-months  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered balance of the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger-structure)

**See**

- https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
- https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
- https://www.okx.com/docs-v5/en/#rest-api-funding-asset-bills-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entrys to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchLedger (code[, since, limit, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch a dictionary of addresses for a currency, indexed by network

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/#/?id=address-structure) indexed by the network

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchDepositAddress (code[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.withdraw (code, amount, address, tag[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-get-deposit-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchDeposits (code[, since, limit, params])
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch data on a currency deposit via the deposit id

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-get-deposit-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | filter by currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchDeposit (id, code[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-get-withdrawal-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

### fetchWithdrawal{docsify-ignore}
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-get-withdrawal-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | Yes | unified currency code of the currency withdrawn, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchWithdrawal (id, code[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-account-get-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |


```javascript
okx.fetchLeverage (symbol[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-account-get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | MARGIN, SWAP, FUTURES, OPTION |


```javascript
okx.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-account-get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | MARGIN, SWAP, FUTURES, OPTION |


```javascript
okx.fetchPositions (symbols[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions for specific symbol

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-account-get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | MARGIN (if needed) |


```javascript
okx.fetchPositions (symbol[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-funds-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchTransfers (code[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.okx.com/docs-v5/en/#rest-api-account-set-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.posSide | <code>string</code> | No | 'long' or 'short' for isolated margin long/short mode on futures and swap markets |


```javascript
okx.setLeverage (leverage, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-set-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use long_short_mode, false for net_mode |
| symbol | <code>string</code> | Yes | not used by okx setPositionMode |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.setPositionMode (hedged, symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-set-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>int</code> | No | leverage |


```javascript
okx.setMarginMode (marginMode, symbol[, params])
```


<a name="fetchCrossBorrowRates" id="fetchcrossborrowrates"></a>

### fetchCrossBorrowRates{docsify-ignore}
fetch the borrow interest rates of all currencies

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a list of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-interest-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchCrossBorrowRates ([params])
```


<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

### fetchCrossBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/#/?id=borrow-rate-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-interest-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchCrossBorrowRate (code[, params])
```


<a name="fetchBorrowRateHistories" id="fetchborrowratehistories"></a>

### fetchBorrowRateHistories{docsify-ignore}
retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) indexed by the market symbol

**See**: https://www.okx.com/docs-v5/en/#financial-product-savings-get-public-borrow-history-public  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest borrowRate, default is undefined |
| limit | <code>int</code> | No | max number of borrow rate prices to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchBorrowRateHistories (codes[, since, limit, params])
```


<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

### fetchBorrowRateHistory{docsify-ignore}
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure)

**See**: https://www.okx.com/docs-v5/en/#financial-product-savings-get-public-borrow-history-public  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchBorrowRateHistory (code[, since, limit, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-increase-decrease-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-increase-decrease-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.addMargin (symbol, amount[, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-public-data-get-position-tiers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |


```javascript
okx.fetchMarketLeverageTiers (symbol[, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - An list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-account-get-interest-accrued-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | the unified currency code for the currency of the interest |
| symbol | <code>string</code> | Yes | the market symbol of an isolated margin market, if undefined, the interest for cross margin markets is returned |
| since | <code>int</code> | No | timestamp in ms of the earliest time to receive interest records for |
| limit | <code>int</code> | No | the number of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure) to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.type | <code>int</code> | No | Loan type 1 - VIP loans 2 - Market loans *Default is Market loans* |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |


```javascript
okx.fetchBorrowInterest (code, symbol[, since, limit, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin (need to be VIP 5 and above)

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-vip-loans-borrow-and-repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.borrowCrossMargin (code, amount[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-vip-loans-borrow-and-repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.id | <code>string</code> | No | the order ID of borrowing, it is necessary while repaying |


```javascript
okx.repayCrossMargin (code, amount[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a currency

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-public-data-get-open-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
okx.fetchOpenInterest (symbol[, params])
```


<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

### fetchOpenInterestHistory{docsify-ignore}
Retrieves the open interest history of a currency

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: An array of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**

- https://www.okx.com/docs-v5/en/#rest-api-trading-data-get-contracts-open-interest-and-volume
- https://www.okx.com/docs-v5/en/#rest-api-trading-data-get-options-open-interest-and-volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT currency code or unified symbol |
| timeframe | <code>string</code> | Yes | "5m", "1h", or "1d" for option only "1d" or "8h" |
| since | <code>int</code> | No | The time in ms of the earliest record to retrieve as a unix timestamp |
| limit | <code>int</code> | No | Not used by okx, but parsed internally by CCXT |
| params | <code>object</code> | No | Exchange specific parameters |
| params.until | <code>int</code> | No | The time in ms of the latest record to retrieve as a unix timestamp |


```javascript
okx.fetchOpenInterestHistory (symbol, timeframe[, since, limit, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fees structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
fetches historical settlement records

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/#/?id=settlement-history-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-public-data-get-delivery-exercise-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol to fetch the settlement history for |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |


```javascript
okx.fetchSettlementHistory (symbol[, since, limit, params])
```


<a name="fetchUnderlyingAssets" id="fetchunderlyingassets"></a>

### fetchUnderlyingAssets{docsify-ignore}
fetches the market ids of underlying assets for a specific contract market type

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [underlying assets](https://docs.ccxt.com/#/?id=underlying-assets-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-underlying  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>string</code> | No | the contract market type, 'option', 'swap' or 'future', the default is 'option' |


```javascript
okx.fetchUnderlyingAssets ([params])
```


<a name="fetchGreeks" id="fetchgreeks"></a>

### fetchGreeks{docsify-ignore}
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-option-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchGreeks (symbol[, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - [A list of position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-close-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | 'buy' or 'sell', leave as undefined in net mode |
| params | <code>object</code> | No | extra parameters specific to the okx api endpoint |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', default is 'cross; |
| params.code | <code>string</code> | No | *required in the case of closing cross MARGIN position for Single-currency margin* margin currency EXCHANGE SPECIFIC PARAMETERS |
| params.autoCxl | <code>boolean</code> | No | whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false |
| params.tag | <code>string</code> | No | order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters |


```javascript
okx.closePosition (symbol[, side, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchTradesForSymbols (symbol[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
okx.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
okx.watchTickers ([symbols, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchBalance ([params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | true if fetching trigger or conditional trades |


```javascript
okx.watchMyTrades ([symbol, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-websocket-positions-channel  

| Param | Type | Description |
| --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | list of unified market symbols |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchPositions (symbols, params[])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | true if fetching trigger or conditional orders |


```javascript
okx.watchOrders ([symbol, since, limit, params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#websocket-api-trade-place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.test | <code>boolean</code> | Yes | test order, default false |


```javascript
okx.createOrderWs (symbol, type, side, amount[, price, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-amend-order
- https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-amend-multiple-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.editOrderWs (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://okx-docs.github.io/apidocs/websocket_api/en/#cancel-order-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clOrdId | <code>string</code> | No | client order id |


```javascript
okx.cancelOrderWs (id, symbol[, params])
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-mass-cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.cancelOrdersWs (ids, symbol[, params])
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancel all open orders of a type. Only applicable to Option in Portfolio Margin mode, and MMP privilege is required.

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.okx.com/websockets/#message-cancelAll  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.cancelAllOrdersWs (symbol[, params])
```

