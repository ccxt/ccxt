
<a name="pacifica" id="pacifica"></a>

## pacifica{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchSwapMarkets](#fetchswapmarkets)
* [fetchBalance](#fetchbalance)
* [fetchLeverage](#fetchleverage)
* [fetchAccountSettings](#fetchaccountsettings)
* [fetchMarginMode](#fetchmarginmode)
* [fetchOrderBook](#fetchorderbook)
* [fetchFundingRates](#fetchfundingrates)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [cancelOrder](#cancelorder)
* [editOrder](#editorder)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTickers](#fetchtickers)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [setMarginMode](#setmarginmode)
* [setLeverage](#setleverage)
* [withdraw](#withdraw)
* [fetchTradingFee](#fetchtradingfee)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchLedger](#fetchledger)
* [fetchFundingHistory](#fetchfundinghistory)
* [transfer](#transfer)
* [createSubAccount](#createsubaccount)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrdersWs](#cancelordersws)
* [cancelOrderWs](#cancelorderws)
* [cancelAllOrdersWs](#cancelallordersws)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchMyTrades](#watchmytrades)
* [unWatchMyTrades](#unwatchmytrades)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for pacifica

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.fetchMarkets ([params])
```


<a name="fetchSwapMarkets" id="fetchswapmarkets"></a>

### fetchSwapMarkets{docsify-ignore}
retrieves data on all swap markets for pacifica

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-market-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.fetchSwapMarkets ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchBalance ([params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchLeverage (symbol[, params])
```


<a name="fetchAccountSettings" id="fetchaccountsettings"></a>

### fetchAccountSettings{docsify-ignore}
fetch account's market settings. Settings are cached for walletAddress. To refresh the cache, call loadAccountSettings with refresh=true

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - Dict repacked from list by symbol key

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-settings  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchAccountSettings ([params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of the trading pair

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchMarginMode (symbol[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.aggLevel | <code>int</code> | No | aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000 |


```javascript
pacifica.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
retrieves data on all swap markets for pacifica

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.fetchFundingRates ([symbols, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-candle-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents, support '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '8h', '12h', '1d' |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch. 'limit' is priority |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params |


```javascript
pacifica.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-recent-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-trade-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |
| params.cursor | <code>string</code> | No | pagination cursor from prev request (manual use) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
pacifica.fetchMyTrades ([symbol, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-limit-order
- https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-market-order
- https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-stop-order
- https://docs.pacifica.fi/api-documentation/api/rest-api/orders/create-position-tp-sl


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency. Not used for set tpsl order! |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | The price a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at (optional provide stopLossCloid) |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at (optional provide takeProfitCloid) |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book) |
| params.reduceOnly | <code>boolean</code> | No | Ensures that the executed order does not flip the opened position. |
| params.clientOrderId | <code>string</code> | No | client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders. It is supports only limit orders and have a random jitter ~100-300ms!

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/batch-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type (optional or 'limit'), side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.createOrders (orders[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/batch-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids. An ids list is always required (can be empty). Both ids and clientOrderIds can be passed simultaneously. |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>string</code>, <code>Array&lt;string&gt;</code> | No | client order ids, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.cancelOrders (ids[, symbol, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | (optional) unified market symbol of the market to cancel orders in. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.excludeReduceOnly | <code>boolean</code> | No | whether to exclude reduce-only orders |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.cancelAllOrders (symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-stop-order#response
- https://docs.pacifica.fi/api-documentation/api/rest-api/orders/cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>boolean</code> | No | necessary if this is to cancel a stop order. |
| params.clientOrderId | <code>string</code> | No | client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.cancelOrder (id, symbol[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/edit-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | edit order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' WARN is not usable! |
| side | <code>string</code> | Yes | 'buy' or 'sell' WARN is not usable! |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.editOrder (id, symbol, type, side, amount, price[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-historical-funding  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cursor | <code>string</code> | No | pagination cursor from prev request (manual use) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
pacifica.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/markets/get-prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.fetchTickers ([symbols, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetch all unfilled currently closed orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetch all canceled orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetch all closed and canceled orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetch all orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-order-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |
| params.cursor | <code>string</code> | No | pagination cursor from prev request (manual use) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
pacifica.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/orders/get-order-history-by-id  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | (optional) unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.fetchOrder (id, symbol[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchPositions ([symbols, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode (symbol)

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/update-margin-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | margin mode must be either [isolated, cross] |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.setMarginMode (marginMode, symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/update-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.setLeverage (leverage, symbol[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal (only support native USDC)

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/request-withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.withdraw (code, amount, address, tag[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |


```javascript
pacifica.fetchTradingFee (symbol[, params])
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
pacifica.fetchOpenInterests ([symbols, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
pacifica.fetchOpenInterest (symbol[, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/account/get-account-balance-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |
| params.cursor | <code>string</code> | No | pagination cursor from prev request (manual use) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
pacifica.fetchLedger ([code, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | will default to walletAddress if not provided |
| params.cursor | <code>string</code> | No | pagination cursor from prev request |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
pacifica.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/rest-api/subaccounts/subaccount-fund-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from *spot, swap* |
| toAccount | <code>string</code> | Yes | account to transfer to *swap, spot or address* |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |


```javascript
pacifica.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="createSubAccount" id="createsubaccount"></a>

### createSubAccount{docsify-ignore}
creates a sub-account under the main account

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | unused argument |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiryWindow | <code>int</code> | No | time to live in milliseconds |
| params.subAccountAddress | <code>string</code> | No | The public key (address) of the sub-account to use for creation |
| params.subAccountPrivateKey | <code>string</code> | No | The private key of the sub-account to use for creation |


```javascript
pacifica.createSubAccount (name[, params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/create-market-order
- https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/create-limit-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | The price a trigger order is triggered at |
| params.stopLossPrice | <code>float</code>, <code>undefined</code> | No | the price that a stop loss order is triggered at (optional provide stopLossCloid) |
| params.takeProfitPrice | <code>float</code>, <code>undefined</code> | No | the price that a take profit order is triggered at (optional provide takeProfitCloid) |
| params.timeInForce | <code>string</code>, <code>undefined</code> | No | "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book) |
| params.reduceOnly | <code>bool</code>, <code>undefined</code> | No | Ensures that the executed order does not flip the opened position. |
| params.clientOrderId | <code>string</code>, <code>undefined</code> | No | client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code>, <code>undefined</code> | No | time to live in milliseconds |
| params.agentAddress | <code>string</code>, <code>undefined</code> | No | only if agent wallet in use. |
| params.originAddress | <code>string</code>, <code>undefined</code> | No | only if agent in use. Agent's owner address ( default = credentials walletAddress ) |


```javascript
pacifica.createOrderWs (symbol, type, side, amount[, price, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/edit-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | edit order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code>, <code>undefined</code> | No | time to live in milliseconds |
| params.agentAddress | <code>string</code>, <code>undefined</code> | No | only if agent wallet in use |
| params.originAddress | <code>string</code>, <code>undefined</code> | No | only if agent in use. Agent's owner address ( default = credentials walletAddress ) |


```javascript
pacifica.editOrderWs (id, symbol, type, side, amount, price[, params])
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/batch-order
- https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code>, <code>Array&lt;string&gt;</code> | No | client order ids, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code>, <code>undefined</code> | No | time to live in milliseconds |
| params.agentAddress | <code>string</code>, <code>undefined</code> | No | only if agent wallet in use |
| params.originAddress | <code>string</code>, <code>undefined</code> | No | only if agent in use. Agent's owner address ( default = credentials walletAddress ) |


```javascript
pacifica.cancelOrdersWs (ids[, symbol, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code>, <code>undefined</code> | No | necessary if this is to cancel a stop order. |
| params.clientOrderId | <code>string</code>, <code>undefined</code> | No | client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479) |
| params.expiryWindow | <code>int</code>, <code>undefined</code> | No | time to live in milliseconds |
| params.agentAddress | <code>string</code>, <code>undefined</code> | No | only if agent wallet in use |
| params.originAddress | <code>string</code>, <code>undefined</code> | No | only if agent in use. Agent's owner address ( default = credentials walletAddress ) |


```javascript
pacifica.cancelOrderWs (id, symbol[, params])
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | (optional) unified market symbol of the market to cancel orders in. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.excludeReduceOnly | <code>boolean</code>, <code>undefined</code> | No | whether to exclude reduce-only orders |
| params.expiryWindow | <code>int</code>, <code>undefined</code> | No | time to live in milliseconds |
| params.agentAddress | <code>string</code>, <code>undefined</code> | No | only if agent wallet in use |
| params.originAddress | <code>string</code>, <code>undefined</code> | No | only if agent in use. Agent's owner address ( default = credentials walletAddress ) |


```javascript
pacifica.cancelAllOrdersWs (symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.aggLevel | <code>int</code>, <code>undefined</code> | No | aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000 |


```javascript
pacifica.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.aggLevel | <code>int</code>, <code>undefined</code> | No | aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000 |


```javascript
pacifica.unWatchOrderBook (symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.watchTickers (symbols[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.unWatchTickers (symbols[, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code>, <code>undefined</code> | No | will default to options' walletAddress if not provided |


```javascript
pacifica.watchMyTrades (symbol[, since, limit, params])
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unWatches information on multiple trades made by the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code>, <code>undefined</code> | No | will default to options' walletAddress if not provided |


```javascript
pacifica.unWatchMyTrades (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches information on multiple trades made in a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.unWatchTrades (symbol[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/candle  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/candle  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
pacifica.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-order-updates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code>, <code>undefined</code> | No | will default to options' walletAddress if not provided |


```javascript
pacifica.watchOrders (symbol[, since, limit, params])
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>pacifica</code>](#pacifica)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-order-updates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code>, <code>undefined</code> | No | will default to options' walletAddress if not provided |


```javascript
pacifica.unWatchOrders (symbol[, params])
```

