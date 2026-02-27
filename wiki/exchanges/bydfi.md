
<a name="bydfi" id="bydfi"></a>

## bydfi{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [editOrders](#editorders)
* [cancelAllOrders](#cancelallorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOpenOrder](#fetchopenorder)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [setLeverage](#setleverage)
* [fetchLeverage](#fetchleverage)
* [fetchPositions](#fetchpositions)
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)
* [fetchPositionHistory](#fetchpositionhistory)
* [fetchPositionsHistory](#fetchpositionshistory)
* [fetchMarginMode](#fetchmarginmode)
* [setMarginMode](#setmarginmode)
* [setPositionMode](#setpositionmode)
* [fetchPositionMode](#fetchpositionmode)
* [fetchBalance](#fetchbalance)
* [fetchTransfers](#fetchtransfers)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchOrders](#watchorders)
* [watchOrdersForSymbols](#watchordersforsymbols)
* [watchPositions](#watchpositions)
* [watchBalance](#watchbalance)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bydfi

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://developers.bydfi.com/en/swap/market#fetching-trading-rules-and-pairs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.fetchMarkets ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure) indexed by market symbols

**See**: https://developers.bydfi.com/en/swap/market#depth-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return, could be 5, 10, 20, 50, 100, 500 or 1000 (default 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |


```javascript
bydfi.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://developers.bydfi.com/en/swap/market#recent-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 500, max 1000) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.fromId | <code>int</code> | No | retrieve from which trade ID to start. Default to retrieve the most recent trade records |


```javascript
bydfi.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://developers.bydfi.com/en/swap/trade#historical-trades-query  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet |
| params.orderType | <code>string</code> | No | order type ('LIMIT', 'MARKET', 'LIQ', 'LIMIT_CLOSE', 'MARKET_CLOSE', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET') |


```javascript
bydfi.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://developers.bydfi.com/en/swap/market#candlestick-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (max 500) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
bydfi.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.fetchTicker (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://developers.bydfi.com/en/swap/market#recent-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://developers.bydfi.com/en/swap/market#historical-funding-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate to fetch |


```javascript
bydfi.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/trade#placing-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |
| params.hedged | <code>bool</code> | No | true for hedged mode, false for one way mode, default is false |
| params.clientOrderId | <code>string</code> | No | Custom order ID, must be unique for open orders |
| params.timeInForce | <code>string</code> | No | 'GTC' (Good Till Cancelled), 'FOK' (Fill Or Kill), 'IOC' (Immediate Or Cancel), 'PO' (Post Only) |
| params.postOnly | <code>bool</code> | No | true or false, whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false, true or false whether the order is reduce-only |
| params.stopLossPrice | <code>float</code> | No | The price a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price a take profit order is triggered at |
| params.trailingTriggerPrice | <code>float</code> | No | the price to activate a trailing order, default uses the price argument or market price if price is not provided |
| params.trailingPercent | <code>float</code> | No | the percent to trail away from the current market price |
| params.triggerPriceType | <code>string</code> | No | 'MARK_PRICE' or 'CONTRACT_PRICE', default is 'CONTRACT_PRICE', the price type used to trigger stop orders |
| params.closePosition | <code>bool</code> | No | true or false, whether to close all positions after triggering, only supported in STOP_MARKET and TAKE_PROFIT_MARKET; not used with quantity; |


```javascript
bydfi.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/trade#batch-order-placement  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/trade#order-modification  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id (mandatory if params.clientOrderId is not provided) |
| symbol | <code>string</code> | No | unified symbol of the market to create an order in |
| type | <code>string</code> | No | not used by bydfi editOrder |
| side | <code>string</code> | No | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price for the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order (could be alternative to id) |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.editOrder (id[, symbol, type, side, amount, price, params])
```


<a name="editOrders" id="editorders"></a>

### editOrders{docsify-ignore}
edit a list of trade orders

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/trade#batch-order-modification  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.editOrders (orders[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/trade#complete-order-cancellation  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.cancelAllOrders (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://developers.bydfi.com/en/swap/trade#pending-order-query
- https://developers.bydfi.com/en/swap/trade#planned-order-query


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | true or false, whether to fetch conditional orders only |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrder" id="fetchopenorder"></a>

### fetchOpenOrder{docsify-ignore}
fetch an open order by the id

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://developers.bydfi.com/en/swap/trade#pending-order-query
- https://developers.bydfi.com/en/swap/trade#planned-order-query


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id (mandatory if params.clientOrderId is not provided) |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | true or false, whether to fetch conditional orders only |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order (could be alternative to id) |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.fetchOpenOrder (id, symbol[, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/trade#historical-orders-query  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the closed orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of closed orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest order |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet |
| params.orderType | <code>string</code> | No | order type ('LIMIT', 'MARKET', 'LIQ', 'LIMIT_CLOSE', 'MARKET_CLOSE', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET') |


```javascript
bydfi.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://developers.bydfi.com/en/swap/trade#set-leverage-for-single-trading-pair  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.setLeverage (leverage, symbol[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://developers.bydfi.com/en/swap/trade#get-leverage-for-single-trading-pair  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.fetchLeverage (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://developers.bydfi.com/en/swap/trade#positions-query  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.settleCoin | <code>string</code> | No | the settlement currency (USDT or USDC or USD) |


```javascript
bydfi.fetchPositions ([symbols, params])
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
fetch all open positions for specific symbol

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://developers.bydfi.com/en/swap/trade#positions-query  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |


```javascript
bydfi.fetchPositionsForSymbol (symbol[, params])
```


<a name="fetchPositionHistory" id="fetchpositionhistory"></a>

### fetchPositionHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | a unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch , params["until"] - since <= 7 days |
| limit | <code>int</code> | No | the maximum amount of records to fetch (default 500, max 500) |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest position to fetch , params["until"] - since <= 7 days |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.fetchPositionHistory (symbol[, since, limit, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | a list of unified market symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch , params["until"] - since <= 7 days |
| limit | <code>int</code> | No | the maximum amount of records to fetch (default 500, max 500) |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest position to fetch , params["until"] - since <= 7 days |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.fetchPositionsHistory (symbols[, since, limit, params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a trading pair

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)

**See**: https://developers.bydfi.com/en/swap/user#margin-mode-query  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.fetchMarginMode (symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://developers.bydfi.com/en/swap/user#change-margin-type-cross-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |


```javascript
bydfi.setMarginMode (marginMode, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market, hedged for bydfi is set identically for all markets with same settle currency

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://developers.bydfi.com/en/swap/user#change-position-mode-dual  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | No | not used by bydfi setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |
| params.settleCoin | <code>string</code> | No | The settlement currency - USDT or USDC or USD (default is USDT) |


```javascript
bydfi.setPositionMode (hedged[, symbol, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for bydfi is set identically for all markets with same settle currency

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://developers.bydfi.com/en/swap/user#get-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |
| params.wallet | <code>string</code> | No | The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |
| params.settleCoin | <code>string</code> | No | The settlement currency - USDT or USDC or USD (default is USDT or settle currency of the market if market is provided) |


```javascript
bydfi.fetchPositionMode ([symbol, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://developers.bydfi.com/en/account#asset-inquiry
- https://developers.bydfi.com/en/swap/user#asset-query


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountType | <code>string</code> | No | the type of account to fetch the balance for, either 'spot' or 'swap'  or 'funding' (default is 'spot') |
| params.wallet | <code>string</code> | No | *swap only* The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract |
| params.asset | <code>string</code> | No | currency id for the balance to fetch |


```javascript
bydfi.fetchBalance ([params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://developers.bydfi.com/en/account#query-wallet-transfer-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve (default 10) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
bydfi.fetchTransfers (code[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://developers.bydfi.com/en/spot/account#query-deposit-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code (mandatory) |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://developers.bydfi.com/en/spot/account#query-withdrawal-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code (mandatory) |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawal structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.fetchWithdrawals (code[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
- https://developers.bydfi.com/en/swap/websocket-market#market-wide-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchTickers (symbols[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://developers.bydfi.com/en/swap/websocket-market#ticker-by-symbol
- https://developers.bydfi.com/en/swap/websocket-market#market-wide-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.unWatchTickers (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://developers.bydfi.com/en/swap/websocket-market#candlestick-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://developers.bydfi.com/en/swap/websocket-market#candlestick-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://developers.bydfi.com/en/swap/websocket-market#candlestick-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://developers.bydfi.com/en/swap/websocket-market#candlestick-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.unWatchOHLCVForSymbols (symbolsAndTimeframes[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default and maxi is 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default and max is 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://developers.bydfi.com/en/swap/websocket-market#limited-depth-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
bydfi.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/websocket-account#order-trade-update-push  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchOrders (symbol[, since, limit, params])
```


<a name="watchOrdersForSymbols" id="watchordersforsymbols"></a>

### watchOrdersForSymbols{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.bydfi.com/en/swap/websocket-account#order-trade-update-push  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch orders for |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchOrdersForSymbols (symbols[, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://developers.bydfi.com/en/swap/websocket-account#balance-and-position-update-push  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchPositions ([symbols, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bydfi</code>](#bydfi)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://developers.bydfi.com/en/swap/websocket-account#balance-and-position-update-push  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bydfi.watchBalance ([params])
```

