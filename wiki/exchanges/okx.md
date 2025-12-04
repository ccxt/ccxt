
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
* [fetchMarkPrice](#fetchmarkprice)
* [fetchMarkPrices](#fetchmarkprices)
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
* [cancelOrdersForSymbols](#cancelordersforsymbols)
* [cancelAllOrdersAfter](#cancelallordersafter)
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
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingHistory](#fetchfundinghistory)
* [setLeverage](#setleverage)
* [fetchPositionMode](#fetchpositionmode)
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
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterestHistory](#fetchopeninteresthistory)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchUnderlyingAssets](#fetchunderlyingassets)
* [fetchGreeks](#fetchgreeks)
* [fetchAllGreeks](#fetchallgreeks)
* [closePosition](#closeposition)
* [fetchOption](#fetchoption)
* [fetchOptionChain](#fetchoptionchain)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchConvertTrade](#fetchconverttrade)
* [fetchConvertTradeHistory](#fetchconverttradehistory)
* [fetchConvertCurrencies](#fetchconvertcurrencies)
* [fetchMarginAdjustmentHistory](#fetchmarginadjustmenthistory)
* [fetchPositionsHistory](#fetchpositionshistory)
* [fetchLongShortRatioHistory](#fetchlongshortratiohistory)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [watchFundingRate](#watchfundingrate)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [watchMarkPrice](#watchmarkprice)
* [watchMarkPrices](#watchmarkprices)
* [unWatchTickers](#unwatchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchLiquidationsForSymbols](#watchliquidationsforsymbols)
* [watchMyLiquidationsForSymbols](#watchmyliquidationsforsymbols)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [unWatchOrderBook](#unwatchorderbook)
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
| params.method | <code>string</code> | No | 'publicGetMarketBooksFull' or 'publicGetMarketBooks' default is 'publicGetMarketBooks' |


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
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchTickers ([symbols, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches mark price for the market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-mark-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchMarkPrice (symbol[, params])
```


<a name="fetchMarkPrices" id="fetchmarkprices"></a>

### fetchMarkPrices{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-mark-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchMarkPrices ([symbols, params])
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
| params.method | <code>string</code> | No | 'publicGetMarketTrades' or 'publicGetMarketHistoryTrades' default is 'publicGetMarketTrades' |
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
- https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-candlesticks-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.price | <code>string</code> | No | "mark" or "index" for mark price and index price candles |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.type | <code>string</code> | No | "Candles" or "HistoryCandles", default is "Candles" for recent candles, "HistoryCandles" for older candles |
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
| params.type | <code>string</code> | No | wallet type, ['funding' or 'trading'] default is 'trading' |


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
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
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
| params.tpOrdKind | <code>string</code> | No | 'condition' or 'limit', the default is 'condition' |
| params.hedged | <code>bool</code> | No | *swap and future only* true for hedged mode, false for one way mode |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', the default is 'cross' |


```javascript
okx.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-amend-order
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-amend-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
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
| params.newTpOrdKind | <code>string</code> | No | 'condition' or 'limit', the default is 'condition' |


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


<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

### cancelOrdersForSymbols{docsify-ignore}
cancel multiple orders for multiple symbols

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-multiple-orders
- https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | whether the order is a stop/trigger order |
| params.trailing | <code>boolean</code> | No | set to true if you want to cancel trailing orders |


```javascript
okx.cancelOrdersForSymbols (orders[, params])
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - the api result

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-all-after  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.cancelAllOrdersAfter (timeout[, params])
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
| params.trigger | <code>bool</code> | No | True if fetching trigger or conditional orders |
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
| params.trigger | <code>bool</code> | No | True if fetching trigger or conditional orders |
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
| params.trigger | <code>bool</code> | No | True if fetching trigger or conditional orders |
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
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**

- https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
- https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
- https://www.okx.com/docs-v5/en/#rest-api-funding-asset-bills-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
okx.fetchLedger ([code, since, limit, params])
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
| params.network | <code>string</code> | No | the network name for the deposit address |


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

**See**

- https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
- https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-positions-history history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | MARGIN, SWAP, FUTURES, OPTION |


```javascript
okx.fetchPositions (symbols[, params])
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
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
okx.fetchPositionsForSymbol (symbol[, params])
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


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchFundingInterval (symbol[, params])
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


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetches the current funding rates for multiple symbols

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a dictionary of [funding rates structure](https://docs.ccxt.com/#/?id=funding-rates-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchFundingRates (symbols[, params])
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
| params.posSide | <code>string</code> | No | 'long' or 'short' or 'net' for isolated margin long/short mode on futures and swap markets, default is 'net' |


```javascript
okx.setLeverage (leverage, symbol[, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-account-configuration  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | if you have multiple accounts, you must specify the account id to fetch the position mode |


```javascript
okx.fetchPositionMode (symbol[, params])
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
fetch the interest owed b the user for borrowing currency for margin trading

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


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interests of some currencies

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an dictionary of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://www.okx.com/docs-v5/en/#rest-api-public-data-get-open-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | Unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |
| params.instType | <code>string</code> | Yes | Instrument type, options: 'SWAP', 'FUTURES', 'OPTION', default to 'SWAP' |
| params.uly | <code>string</code> | Yes | Underlying, Applicable to FUTURES/SWAP/OPTION, if instType is 'OPTION', either uly or instFamily is required |
| params.instFamily | <code>string</code> | Yes | Instrument family, Applicable to FUTURES/SWAP/OPTION, if instType is 'OPTION', either uly or instFamily is required |


```javascript
okx.fetchOpenInterests (symbols[, params])
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


<a name="fetchAllGreeks" id="fetchallgreeks"></a>

### fetchAllGreeks{docsify-ignore}
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-option-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch greeks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uly | <code>string</code> | Yes | Underlying, either uly or instFamily is required |
| params.instFamily | <code>string</code> | Yes | Instrument family, either uly or instFamily is required |


```javascript
okx.fetchAllGreeks ([symbols, params])
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


<a name="fetchOption" id="fetchoption"></a>

### fetchOption{docsify-ignore}
fetches option data that is commonly found in an option chain

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an [option chain structure](https://docs.ccxt.com/#/?id=option-chain-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchOption (symbol[, params])
```


<a name="fetchOptionChain" id="fetchoptionchain"></a>

### fetchOptionChain{docsify-ignore}
fetches data for an underlying asset that is commonly found in an option chain

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a list of [option chain structures](https://docs.ccxt.com/#/?id=option-chain-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | base currency to fetch an option chain for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uly | <code>string</code> | No | the underlying asset, can be obtained from fetchUnderlyingAssets () |


```javascript
okx.fetchOptionChain (code[, params])
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetch a quote for converting from one currency to another

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-estimate-quote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchConvertQuote (fromCode, toCode[, amount, params])
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
convert from one currency to another

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-convert-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.createConvertTrade (id, fromCode, toCode[, amount, params])
```


<a name="fetchConvertTrade" id="fetchconverttrade"></a>

### fetchConvertTrade{docsify-ignore}
fetch the data for a conversion trade

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to fetch |
| code | <code>string</code> | No | the unified currency code of the conversion trade |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchConvertTrade (id[, code, params])
```


<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

### fetchConvertTradeHistory{docsify-ignore}
fetch the users history of conversion trades

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest conversion to fetch |


```javascript
okx.fetchConvertTradeHistory ([code, since, limit, params])
```


<a name="fetchConvertCurrencies" id="fetchconvertcurrencies"></a>

### fetchConvertCurrencies{docsify-ignore}
fetches all available currencies that can be converted

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.fetchConvertCurrencies ([params])
```


<a name="fetchMarginAdjustmentHistory" id="fetchmarginadjustmenthistory"></a>

### fetchMarginAdjustmentHistory{docsify-ignore}
fetches the history of margin added or reduced from contract isolated positions

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [margin structures](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**

- https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-7-days
- https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | not used by okx fetchMarginAdjustmentHistory |
| type | <code>string</code> | No | "add" or "reduce" |
| since | <code>int</code> | No | the earliest time in ms to fetch margin adjustment history for |
| limit | <code>int</code> | No | the maximum number of entries to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.auto | <code>boolean</code> | No | true if fetching auto margin increases |


```javascript
okx.fetchMarginAdjustmentHistory ([symbol, type, since, limit, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-positions-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | No | unified market symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch |
| limit | <code>int</code> | No | the maximum amount of records to fetch, default=100, max=100 |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.marginMode | <code>string</code> | No | "cross" or "isolated" EXCHANGE SPECIFIC PARAMETERS |
| params.instType | <code>string</code> | No | margin, swap, futures or option |
| params.type | <code>string</code> | No | the type of latest close position 1: close position partially, 2：close all, 3：liquidation, 4：partial liquidation; 5：adl, is it is the latest type if there are several types for the same position |
| params.posId | <code>string</code> | No | position id, there is attribute expiration, the posid will be expired if it is more than 30 days after the last full close position, then position will use new posid |
| params.before | <code>string</code> | No | timestamp in ms of the earliest position to fetch based on the last update time of the position |
| params.after | <code>string</code> | No | timestamp in ms of the latest position to fetch based on the last update time of the position |


```javascript
okx.fetchPositionsHistory ([symbols, since, limit, params])
```


<a name="fetchLongShortRatioHistory" id="fetchlongshortratiohistory"></a>

### fetchLongShortRatioHistory{docsify-ignore}
fetches the long short ratio history for a unified market symbol

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [long short ratio structures](https://docs.ccxt.com/#/?id=long-short-ratio-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-statistics-rest-api-get-contract-long-short-ratio  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the long short ratio for |
| timeframe | <code>string</code> | No | the period for the ratio |
| since | <code>int</code> | No | the earliest time in ms to fetch ratios for |
| limit | <code>int</code> | No | the maximum number of long short ratio structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ratio to fetch |


```javascript
okx.fetchLongShortRatioHistory (symbol[, timeframe, since, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-trades-channel
- https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-all-trades-channel


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

**See**

- https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-trades-channel
- https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-all-trades-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | Yes |  |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, trades by default. Can be 'trades' and 'trades-all' |


```javascript
okx.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, trades by default. Can be trades, trades-all |


```javascript
okx.unWatchTradesForSymbols (symbols[, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.unWatchTrades (symbol[, params])
```


<a name="watchFundingRate" id="watchfundingrate"></a>

### watchFundingRate{docsify-ignore}
watch the current funding rate

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-websocket-funding-rate-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchFundingRate (symbol[, params])
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


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
okx.unWatchTicker (symbol[, params])
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


<a name="watchMarkPrice" id="watchmarkprice"></a>

### watchMarkPrice{docsify-ignore}
watches a mark price

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-websocket-mark-price-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
okx.watchMarkPrice (symbol[, params])
```


<a name="watchMarkPrices" id="watchmarkprices"></a>

### watchMarkPrices{docsify-ignore}
watches mark prices

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-websocket-mark-price-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
okx.watchMarkPrices ([symbols, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
okx.unWatchTickers ([symbols, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchBidsAsks (symbols[, params])
```


<a name="watchLiquidationsForSymbols" id="watchliquidationsforsymbols"></a>

### watchLiquidationsForSymbols{docsify-ignore}
watch the public liquidations of a trading pair

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)

**See**: https://www.okx.com/docs-v5/en/#public-data-websocket-liquidation-orders-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | Yes |  |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the okx api endpoint |


```javascript
okx.watchLiquidationsForSymbols (symbols[, since, limit, params])
```


<a name="watchMyLiquidationsForSymbols" id="watchmyliquidationsforsymbols"></a>

### watchMyLiquidationsForSymbols{docsify-ignore}
watch the private liquidations of a trading pair

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)

**See**: https://www.okx.com/docs-v5/en/#trading-account-websocket-balance-and-position-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the okx api endpoint |


```javascript
okx.watchMyLiquidationsForSymbols (symbols[, since, limit, params])
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


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.unWatchOHLCV (symbol, timeframe[, params])
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


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
okx.unWatchOHLCVForSymbols (symbolsAndTimeframes[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.depth | <code>string</code> | No | okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt |


```javascript
okx.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | 1,5, 400, 50 (l2-tbt, vip4+) or 40000 (vip5+) the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.depth | <code>string</code> | No | okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt |


```javascript
okx.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params.depth | <code>string</code> | No | okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt |


```javascript
okx.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-order-book-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params.depth | <code>string</code> | No | okx order book depth, can be books, books5, books-l2-tbt, books50-l2-tbt, bbo-tbt |


```javascript
okx.unWatchOrderBook (symbol[, params])
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
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | true if fetching trigger or conditional trades |
| params.type | <code>string</code> | No | 'spot', 'swap', 'future', 'option', 'ANY', 'SPOT', 'MARGIN', 'SWAP', 'FUTURES' or 'OPTION' |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', for automatically setting the type to spot margin |


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
| since |  |  |
| limit |  |  |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
okx.watchPositions (symbols, since, limit, params[])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>okx</code>](#okx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-order-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | true if fetching trigger or conditional orders |
| params.type | <code>string</code> | No | 'spot', 'swap', 'future', 'option', 'ANY', 'SPOT', 'MARGIN', 'SWAP', 'FUTURES' or 'OPTION' |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', for automatically setting the type to spot margin |


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
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
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
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
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

