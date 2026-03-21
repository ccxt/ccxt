
<a name="aster" id="aster"></a>

## aster{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTime](#fetchtime)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingIntervals](#fetchfundingintervals)
* [fetchBalance](#fetchbalance)
* [setMarginMode](#setmarginmode)
* [fetchPositionMode](#fetchpositionmode)
* [setPositionMode](#setpositionmode)
* [fetchTradingFee](#fetchtradingfee)
* [fetchOrder](#fetchorder)
* [fetchOpenOrder](#fetchopenorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelAllOrders](#cancelallorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [setLeverage](#setleverage)
* [fetchLeverages](#fetchleverages)
* [fetchMarginModes](#fetchmarginmodes)
* [fetchMarginAdjustmentHistory](#fetchmarginadjustmenthistory)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchLedger](#fetchledger)
* [fetchPositionsRisk](#fetchpositionsrisk)
* [fetchPositions](#fetchpositions)
* [withdraw](#withdraw)
* [transfer](#transfer)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchMarkPrice](#watchmarkprice)
* [unWatchMarkPrice](#unwatchmarkprice)
* [watchMarkPrices](#watchmarkprices)
* [unWatchMarkPrices](#unwatchmarkprices)
* [watchBidsAsks](#watchbidsasks)
* [unWatchBidsAsks](#unwatchbidsasks)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#trading-specification-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#exchange-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bigone

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#trading-specification-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#exchange-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchMarkets ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#check-server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchTime ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-data
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.price | <code>string</code> | No | "mark" or "index" for mark price and index price candles |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
aster.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#recent-trades-list
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#recent-trades-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#account-trade-history-user_data
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#account-trade-list-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is undefined |


```javascript
aster.fetchMyTrades ([symbol, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#depth-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#order-book


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-funding-rate-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
aster.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#24h-price-change
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#24hr-ticker-price-change-statistics


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an array of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#24h-price-change
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#24hr-ticker-price-change-statistics


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |
| params.type | <code>string</code> | No | 'spot', 'option', use params["subType"] for swap and future markets |


```javascript
aster.fetchTickers (symbols[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rate for multiple symbols

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#24hr-ticker-price-change-statistics  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchFundingRates ([symbols, params])
```


<a name="fetchFundingIntervals" id="fetchfundingintervals"></a>

### fetchFundingIntervals{docsify-ignore}
fetch the funding rate interval for multiple markets

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-funding-rate-config  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchFundingIntervals ([symbols, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#account-information-v4-user_data
- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#account-information-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |
| params.type | <code>string</code> | No | 'spot', 'option', use params["subType"] for swap and future markets |


```javascript
aster.fetchBalance ([params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#change-margin-type-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.setMarginMode (marginMode, symbol[, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for aster is set identically for all linear markets or all inverse markets

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-current-position-modeuser_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchPositionMode (symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#change-position-modetrade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by bingx setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.setPositionMode (hedged, symbol[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#get-symbol-fees
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#user-commission-rate-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchTradingFee (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#query-order-user_data
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#query-order-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |


```javascript
aster.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrder" id="fetchopenorder"></a>

### fetchOpenOrder{docsify-ignore}
fetch an open order by the id

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#query-current-open-order-user_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchOpenOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#query-all-orders-user_data
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#all-orders-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
aster.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#current-open-orders-user_data
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#current-all-open-orders-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |
| params.type | <code>string</code> | No | 'spot', 'option', use params["subType"] for swap and future markets |


```javascript
aster.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#place-order-trade
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#new-order--trade


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or 'STOP' or 'STOP_MARKET' or 'TAKE_PROFIT' or 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.reduceOnly | <code>string</code> | No | for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean. |
| params.test | <code>boolean</code> | No | whether to use the test endpoint or not, default is false |
| params.trailingPercent | <code>float</code> | No | the percent to trail away from the current market price |
| params.trailingTriggerPrice | <code>float</code> | No | the price to trigger a trailing order, default uses the price argument |
| params.positionSide | <code>string</code> | No | "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at |


```javascript
aster.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#place-multiple-orders--trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.createOrders (orders[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#cancel-all-open-orders-trade
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#cancel-all-open-orders-trade


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.cancelAllOrders (symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#cancel-order-trade
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#cancel-order-trade


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#cancel-multiple-orders-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.origClientOrderIdList | <code>Array&lt;string&gt;</code> | No | max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma |
| params.recvWindow | <code>Array&lt;int&gt;</code> | No |  |


```javascript
aster.cancelOrders (ids[, symbol, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#change-initial-leverage-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.setLeverage (leverage, symbol[, params])
```


<a name="fetchLeverages" id="fetchleverages"></a>

### fetchLeverages{docsify-ignore}
fetch the set leverage for all markets

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a list of [leverage structures](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchLeverages ([symbols, params])
```


<a name="fetchMarginModes" id="fetchmarginmodes"></a>

### fetchMarginModes{docsify-ignore}
fetches margin mode of the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a list of [margin mode structures](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchMarginModes (symbols[, params])
```


<a name="fetchMarginAdjustmentHistory" id="fetchmarginadjustmenthistory"></a>

### fetchMarginAdjustmentHistory{docsify-ignore}
fetches the history of margin added or reduced from contract isolated positions

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [margin structures](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-position-margin-change-history-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| type | <code>string</code> | No | "add" or "reduce" |
| since | <code>int</code> | No | timestamp in ms of the earliest change to fetch |
| limit | <code>int</code> | No | the maximum amount of changes to fetch |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest change to fetch |


```javascript
aster.fetchMarginAdjustmentHistory (symbol[, type, since, limit, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#modify-isolated-position-margin-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#modify-isolated-position-margin-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.addMargin (symbol, amount[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-income-historyuser_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding history entry |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch the funding history for a portfolio margin account |
| params.subType | <code>string</code> | No | "linear" or "inverse" |


```javascript
aster.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#get-income-historyuser_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |


```javascript
aster.fetchLedger ([code, since, limit, params])
```


<a name="fetchPositionsRisk" id="fetchpositionsrisk"></a>

### fetchPositionsRisk{docsify-ignore}
fetch positions risk

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - data on the positions risk

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.fetchPositionsRisk (symbols[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#position-information-v2-user_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | method name to call, "positionRisk", "account" or "option", default is "positionRisk" |


```javascript
aster.fetchPositions ([symbols, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#withdraw-user_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.withdraw (code, amount, address, tag[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#transfer-asset-to-other-address-trade
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#transfer-between-futures-and-spot-user_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchTickers (symbols[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchTickers (symbols[, params])
```


<a name="watchMarkPrice" id="watchmarkprice"></a>

### watchMarkPrice{docsify-ignore}
watches a mark price for a specific market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |


```javascript
aster.watchMarkPrice (symbol[, params])
```


<a name="unWatchMarkPrice" id="unwatchmarkprice"></a>

### unWatchMarkPrice{docsify-ignore}
unWatches a mark price for a specific market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |


```javascript
aster.unWatchMarkPrice (symbol[, params])
```


<a name="watchMarkPrices" id="watchmarkprices"></a>

### watchMarkPrices{docsify-ignore}
watches the mark price for all markets

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |


```javascript
aster.watchMarkPrices (symbols[, params])
```


<a name="unWatchMarkPrices" id="unwatchmarkprices"></a>

### unWatchMarkPrices{docsify-ignore}
watches the mark price for all markets

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |


```javascript
aster.unWatchMarkPrices (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#best-order-book-information-by-symbol
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-book-ticker-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchBidsAsks (symbols[, params])
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
unWatches best bid & ask for symbols

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#best-order-book-information-by-symbol
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-book-ticker-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchBidsAsks (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchTrades (symbol[, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchTradesForSymbols (symbols[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |


```javascript
aster.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |


```javascript
aster.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aster.unWatchOHLCVForSymbols (symbolsAndTimeframes[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#payload-account_update
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#event-balance-and-position-update


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' |


```javascript
aster.watchBalance ([params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#event-balance-and-position-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>number</code> | No | since timestamp |
| limit | <code>number</code> | No | limit |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
aster.watchPositions (symbols[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#payload-order-update
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#event-order-update


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' if symbol is not provided |


```javascript
aster.watchOrders ([symbol, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>aster</code>](#aster)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#payload-order-update
- https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#event-order-update


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' if symbol is not provided |


```javascript
aster.watchMyTrades ([symbol, since, limit, params])
```

