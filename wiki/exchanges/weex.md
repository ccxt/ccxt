
<a name="weex" id="weex"></a>

## weex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTickers](#fetchtickers)
* [fetchBidsAsks](#fetchbidsasks)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchBalance](#fetchbalance)
* [fetchTransfers](#fetchtransfers)
* [createOrder](#createorder)
* [createSpotOrder](#createspotorder)
* [createContractOrder](#createcontractorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchOrders](#fetchorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchLedger](#fetchledger)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)
* [closeAllPositions](#closeallpositions)
* [closePosition](#closeposition)
* [fetchTradingFee](#fetchtradingfee)
* [fetchMarginMode](#fetchmarginmode)
* [fetchMarginModes](#fetchmarginmodes)
* [setMarginMode](#setmarginmode)
* [fetchLeverage](#fetchleverage)
* [fetchLeverages](#fetchleverages)
* [setLeverage](#setleverage)
* [fetchPositionMode](#fetchpositionmode)
* [setPositionMode](#setpositionmode)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [unWatchTicker](#unwatchticker)
* [unWatchTickers](#unwatchtickers)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCV](#unwatchohlcv)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBook](#unwatchorderbook)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchBidsAsks](#watchbidsasks)
* [unWatchBidsAsks](#unwatchbidsasks)
* [watchMyTrades](#watchmytrades)
* [unWatchMyTrades](#unwatchmytrades)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)
* [unWatchPositions](#unwatchpositions)

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**: https://www.weex.com/api-doc/spot/ConfigAPI/Ping  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchStatus ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**

- https://www.weex.com/api-doc/spot/ConfigAPI/GetServerTime
- https://www.weex.com/api-doc/contract/Market_API/GetServerTime


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' |


```javascript
weex.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.weex.com/api-doc/spot/ConfigAPI/CurrencyInfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for exchagne

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://www.weex.com/api-doc/spot/ConfigAPI/GetProductInfo // spot
- https://www.weex.com/api-doc/contract/Market_API/GetContractInfo // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchMarkets ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.weex.com/api-doc/spot/MarketDataAPI/GetAllTickerInfo // spot
- https://www.weex.com/api-doc/contract/Market_API/GetTicker24h // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' (used if symbols are not provided) |


```javascript
weex.fetchTickers (symbols[, params])
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.weex.com/api-doc/spot/MarketDataAPI/GetBookTicker // spot
- https://www.weex.com/api-doc/contract/Market_API/GetBookTicker // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' (used if symbols are not provided) |


```javascript
weex.fetchBidsAsks (symbols[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.weex.com/api-doc/spot/MarketDataAPI/GetDepthData // spot
- https://www.weex.com/api-doc/contract/Market_API/GetDepthData // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default 15, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.weex.com/api-doc/spot/MarketDataAPI/GetKLineData // spot
- https://www.weex.com/api-doc/contract/Market_API/GetKlines // contract last price
- https://www.weex.com/api-doc/contract/Market_API/GetIndexPriceKlines // contract index price
- https://www.weex.com/api-doc/contract/Market_API/GetMarkPriceKlines // contract mark price
- https://www.weex.com/api-doc/contract/Market_API/GetHistoryKlines // contract historical klines


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (default 100, max 300) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint Check fetchSpotOHLCV() and fetchContractOHLCV() for more details on the extra parameters that can be used in params |


```javascript
weex.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.weex.com/api-doc/spot/MarketDataAPI/GetTradeData // spot
- https://www.weex.com/api-doc/contract/Market_API/GetRecentTrades // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 100, max 1000) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://www.weex.com/api-doc/contract/Market_API/GetOpenInterest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
weex.fetchOpenInterest (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rates-structure), indexed by market symbols

**See**: https://www.weex.com/api-doc/contract/Market_API/GetCurrentFundingRate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |


```javascript
weex.fetchFundingRates (symbols[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://www.weex.com/api-doc/contract/Market_API/GetFundingRateHistory  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of funding rate records to fetch (default 100, max 1000) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
weex.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in positions

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.weex.com/api-doc/spot/AccountAPI/GetAccountBalance // spot
- https://www.weex.com/api-doc/contract/Account_API/GetAccountBalance // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' (default is 'spot') |


```javascript
weex.fetchBalance ([params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://www.weex.com/api-doc/spot/AccountAPI/TransferRecords  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve (default 10, max 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
weex.fetchTransfers ([code, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/PlaceOrder // spot
- https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder // contract
- https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder // contract trigger
- https://www.weex.com/api-doc/contract/Transaction_API/PlaceTpSlOrder // contract take profit / stop loss


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint Check createSpotOrder() and createContractOrder() for more details on the extra parameters that can be used in params |


```javascript
weex.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createSpotOrder" id="createspotorder"></a>

### createSpotOrder{docsify-ignore}
helper method for creating spot orders

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.weex.com/api-doc/spot/orderApi/PlaceOrder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', or 'FOK' |


```javascript
weex.createSpotOrder (symbol, type, side, amount[, price, params])
```


<a name="createContractOrder" id="createcontractorder"></a>

### createContractOrder{docsify-ignore}
helper method for creating contract orders

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/contract/Transaction_API/PlaceOrder
- https://www.weex.com/api-doc/contract/Transaction_API/PlacePendingOrder


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType |
| params.takeProfit.triggerPrice | <code>float</code> | No | The price at which the take profit order will be triggered |
| params.takeProfit.triggerPriceType | <code>string</code> | No | The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last') |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType |
| params.stopLoss.triggerPrice | <code>float</code> | No | The price at which the stop loss order will be triggered |
| params.stopLoss.triggerPriceType | <code>string</code> | No | The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last') |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop-loss orders |
| params.stopLossPriceType | <code>string</code> | No | The type of the trigger price for the stop loss order, either 'last' or 'mark' (default is 'last') |
| params.takeProfitPrice | <code>float</code> | No | price to trigger take-profit orders |
| params.takeProfitPriceType | <code>string</code> | No | The type of the trigger price for the take profit order, either 'last' or 'mark' (default is 'last') |
| params.reduceOnly | <code>bool</code> | No | A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true. |
| params.timeInForce | <code>string</code> | No | GTC, IOC, or FOK (default is GTC for limit orders) |


```javascript
weex.createContractOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/CancelOrder // spot
- https://www.weex.com/api-doc/contract/Transaction_API/CancelOrder // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' (default is 'spot') |
| params.trigger | <code>boolean</code> | No | *contract orders only* whether the order to cancel is a trigger order |
| params.clientOrderId | <code>string</code> | No | *non-trigger orders only* a unique id for the order |


```javascript
weex.cancelOrder (id[, symbol, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: Response from the exchange

**See**

- https://www.weex.com/api-doc/spot/orderApi/Cancel-Symbol-Orders // spot
- https://www.weex.com/api-doc/contract/Transaction_API/CancelAllOrders // contract
- https://www.weex.com/api-doc/contract/Transaction_API/CancelAllPendingOrders // contract trigger


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.trigger | <code>boolean</code> | No | *swap only* true for cancelling trigger orders (default is false) |


```javascript
weex.cancelAllOrders (symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/BulkCancel // spot
- https://www.weex.com/api-doc/contract/Transaction_API/CancelOrdersBatch // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids (could be an alternative to ids) |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |


```javascript
weex.cancelOrders (ids[, symbol, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/OrderDetails // spot
- https://www.weex.com/api-doc/contract/Transaction_API/GetSingleOrderInfo // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.clientOrderId | <code>string</code> | No | *spot only* a unique id for the order, used if id is not provided |


```javascript
weex.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/UnfinishedOrders // spot
- https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentOrderStatus // contract
- https://www.weex.com/api-doc/contract/Transaction_API/GetCurrentPendingOrders // contract trigger


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.trigger | <code>boolean</code> | No | *swap only* whether to fetch trigger orders (default is false) |


```javascript
weex.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
- https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |


```javascript
weex.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot
- https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |


```javascript
weex.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple spot orders made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.weex.com/api-doc/spot/orderApi/HistoryOrders // spot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in (required for spot orders) |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>object</code> | No | end time, ms |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
weex.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple closed and canceled orders made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.weex.com/api-doc/contract/Transaction_API/GetOrderHistory // contract  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in (required for spot orders) |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>object</code> | No | end time, ms |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
weex.fetchCanceledAndClosedOrders ([symbol, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
- https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchOrderTrades (id[, symbol, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.weex.com/api-doc/spot/orderApi/TransactionDetails // spot
- https://www.weex.com/api-doc/contract/Transaction_API/GetTradeDetails // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |


```javascript
weex.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)

**See**

- https://www.weex.com/api-doc/spot/AccountAPI/GetBillRecords // spot
- https://www.weex.com/api-doc/spot/AccountAPI/GetFundBillRecords // funding
- https://www.weex.com/api-doc/contract/Account_API/GetContractBills // contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined, max is 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |
| params.type | <code>string</code> | No | 'spot', 'funding' or 'swap' (default is 'spot') |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
weex.fetchLedger ([code, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetAllPositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchPositions ([symbols, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchPosition (symbol[, params])
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
fetch all open positions for specific symbol

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSinglePosition  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchPositionsForSymbol (symbol[, params])
```


<a name="closeAllPositions" id="closeallpositions"></a>

### closeAllPositions{docsify-ignore}
closes all open positions for a market type

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.closeAllPositions ([params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.weex.com/api-doc/contract/Transaction_API/ClosePositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | not used by current exchange |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.closePosition (symbol[, side, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a contract market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetCommissionRate // contract  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchTradingFee (symbol[, params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a specific symbol

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchMarginMode (symbol[, params])
```


<a name="fetchMarginModes" id="fetchmarginmodes"></a>

### fetchMarginModes{docsify-ignore}
fetches margin modes the symbols, with symbols=undefined all markets are returned

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a list of [margin mode structures](https://docs.ccxt.com/?id=margin-mode-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchMarginModes (symbols[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.setMarginMode (marginMode, symbol[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchLeverage (symbol[, params])
```


<a name="fetchLeverages" id="fetchleverages"></a>

### fetchLeverages{docsify-ignore}
fetch the set leverage for all markets

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a list of [leverage structures](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchLeverages ([symbols, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.weex.com/api-doc/contract/Account_API/UpdateLeverageTRADE  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' (default is 'cross' if specific leverage parameters are not provided) |
| params.crossLeverage | <code>number</code> | No | *cross margin mode only* leverage for cross margin mode when marginMode is 'cross' |
| params.isolatedLongLeverage | <code>number</code> | No | *isolated margin mode only* leverage for long positions when marginMode is 'isolated' |
| params.isolatedShortLeverage | <code>number</code> | No | *isolated margin mode only* leverage for short positions when marginMode is 'isolated' If specific leverage parameters are not provided the leverage value will be applied to both long and short positions if marginMode is 'isolated' or to cross margin mode if marginMode is 'cross' If marginMode is not provided and specific leverage parameters are not provided too the leverage value will be applied to cross leverage |


```javascript
weex.setLeverage (leverage, symbol[, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://www.weex.com/api-doc/contract/Account_API/GetSymbolConfig  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.fetchPositionMode (symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.weex.com/api-doc/contract/Account_API/ChangeMarginModeTRADE  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | Yes | 'cross' or 'isolated' (default is 'cross') |


```javascript
weex.setPositionMode (hedged, symbol[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionId | <code>string</code> | Yes | the id of the position to reduce margin from, required |


```javascript
weex.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://www.weex.com/api-doc/contract/Account_API/AdjustPositionMarginTRADE  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionId | <code>string</code> | Yes | the id of the position to add margin to, required |


```javascript
weex.addMargin (symbol, amount[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.name | <code>string</code> | No | stream to use can be ticker or miniTicker |


```javascript
weex.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchTickers (symbols[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchTicker (symbol[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Tickers-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchTickers (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribes from the trades channel

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchTrades (symbol[, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unsubscribes from the trades channel

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Trades-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchTradesForSymbols (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Candlesticks-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchOHLCVForSymbols (symbolsAndTimeframes[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchOrderBook (symbol[, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.weex.com/api-doc/spot/Websocket/public/Depth-Channel
- https://www.weex.com/api-doc/contract/Websocket/public/Depth-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for spot symbols

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.watchBidsAsks (symbols[, params])
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
unWatches best bid & ask for spot symbols

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.weex.com/api-doc/spot/Websocket/public/BookTicker-Channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchBidsAsks (symbols[, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/private/Fill-Channel
- https://www.weex.com/api-doc/contract/Websocket/private/Fill-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap, default is spot if symbol is not provided |


```javascript
weex.watchMyTrades (symbol[, since, limit, params])
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unWatches information on multiple trades made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/private/Fill-Channel
- https://www.weex.com/api-doc/contract/Websocket/private/Fill-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | not used by the exchange |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap, default is spot |


```javascript
weex.unWatchMyTrades ([symbol, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/private/Order-Channel
- https://www.weex.com/api-doc/contract/Websocket/private/Order-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap, default is spot if symbol is not provided |


```javascript
weex.watchOrders (symbol[, since, limit, params])
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/private/Order-Channel
- https://www.weex.com/api-doc/contract/Websocket/private/Order-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | not used by the exchange |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchOrders ([symbol, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://www.weex.com/api-doc/spot/Websocket/private/Account-Channel
- https://www.weex.com/api-doc/contract/Websocket/private/Account-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', default is 'spot' |


```javascript
weex.watchBalance ([params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://www.weex.com/api-doc/contract/Websocket/private/Positions-Channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of position structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.accountNumber | <code>int</code> | No | account number to query orders for, required |


```javascript
weex.watchPositions (symbols[, since, limit, params])
```


<a name="unWatchPositions" id="unwatchpositions"></a>

### unWatchPositions{docsify-ignore}
unWatches all open positions

**Kind**: instance method of [<code>weex</code>](#weex)  
**Returns**: <code>object</code> - status of the unwatch request

**See**: https://www.weex.com/api-doc/contract/Websocket/private/Positions-Channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | not used by the exchange, unsubscription from positions is global for all symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
weex.unWatchPositions ([symbols, params])
```

