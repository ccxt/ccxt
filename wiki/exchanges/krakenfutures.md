
<a name="krakenfutures" id="krakenfutures"></a>

## krakenfutures{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchPositions](#fetchpositions)
* [fetchLeverageTiers](#fetchleveragetiers)
* [transfer](#transfer)
* [setLeverage](#setleverage)
* [fetchLeverage](#fetchleverage)
* [watchTicker](#watchticker)
* [watchTicker](#watchticker)
* [watchTrades](#watchtrades)
* [watchOrderBook](#watchorderbook)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchOrders](#watchorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
Fetches the available trading markets from the exchange, Multi-collateral markets are returned as linear markets, but can be settled in multiple currencies

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: An array of market structures

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-instrument-details-get-instruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | exchange specific params |


```javascript
krakenfutures.fetchMarkets ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
Fetches a list of open orders in a market

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: An [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-market-data-get-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified market symbol |
| limit | <code>int</code> | No | Not used by krakenfutures |
| params | <code>object</code> | No | exchange specific params |


```javascript
krakenfutures.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - an array of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-market-data-get-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
Fetch a history of filled trades that this account has made

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: An array of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-market-data-get-trade-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| since | <code>int</code> | No | Timestamp in ms of earliest trade. Not used by krakenfutures except in combination with params.until |
| limit | <code>int</code> | No | Total number of trades, cannot exceed 100 |
| params | <code>object</code> | No | Exchange specific params |
| params.until | <code>int</code> | No | Timestamp in ms of latest trade |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
krakenfutures.fetchTrades (symbol[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-send-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of contracts |
| price | <code>float</code> | No | limit order price |
| params.reduceOnly | <code>bool</code> | No | set as true if you wish the order to only reduce an existing position, any order which increases an existing position will be rejected, default is false |
| params.postOnly | <code>bool</code> | No | set as true if you wish to make a postOnly order, default is false |
| params.clientOrderId | <code>string</code> | No | UUID The order identity that is specified from the user, It must be globally unique |
| params.triggerPrice | <code>float</code> | No | the price that a stop order is triggered at |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at |
| params.triggerSignal | <code>string</code> | No | for triggerPrice, stopLossPrice and takeProfitPrice orders, the trigger price type, 'last', 'mark' or 'index', default is 'last' |


```javascript
krakenfutures.createOrder (symbol, type, side, amount[, price])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-batch-order-management  

| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |


```javascript
krakenfutures.createOrders (orders, [undefined])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
Edit an open order on the exchange

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-edit-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | Not used by Krakenfutures |
| type | <code>string</code> | Yes | Not used by Krakenfutures |
| side | <code>string</code> | Yes | Not used by Krakenfutures |
| amount | <code>float</code> | Yes | Order size |
| price | <code>float</code> | No | Price to fill order at |
| params | <code>object</code> | No | Exchange specific params |


```javascript
krakenfutures.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
Cancel an open order on the exchange

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | Order id |
| symbol | <code>string</code> | Yes | Not used by Krakenfutures |
| params | <code>object</code> | No | Exchange specific params |


```javascript
krakenfutures.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-batch-order-management  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | max length 10 e.g. ["my_id_1","my_id_2"] |


```javascript
krakenfutures.cancelOrders (ids[, symbol, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
Cancels all orders on the exchange, including trigger orders

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: Response from exchange api

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>str</code> | Yes | Unified market symbol |
| params | <code>dict</code> | No | Exchange specific params |


```javascript
krakenfutures.cancelAllOrders (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
Gets all open orders, including trigger orders, for an account from the exchange api

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: An array of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-order-management-get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified market symbol |
| since | <code>int</code> | No | Timestamp (ms) of earliest order. (Not used by kraken api but filtered internally by CCXT) |
| limit | <code>int</code> | No | How many orders to return. (Not used by kraken api but filtered internally by CCXT) |
| params | <code>object</code> | No | Exchange specific parameters |


```javascript
krakenfutures.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-historical-data-get-your-fills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | *not used by the  api* the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
krakenfutures.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
Fetch the balance for a sub-account, all sub-account balances are inside 'info' in the response

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: A [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-account-information-get-wallets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | Exchange specific parameters |
| params.type | <code>string</code> | No | The sub-account type to query the balance of, possible values include 'flex', 'cash'/'main'/'funding', or a market symbol * defaults to 'flex' * |
| params.symbol | <code>string</code> | No | A unified market symbol, when assigned the balance for a trading market that matches the symbol is returned |


```javascript
krakenfutures.fetchBalance ([params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rates

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;Order&gt;</code> - an array of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-market-data-get-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.fetchFundingRates (symbols[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-historical-funding-rates-historical-funding-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the api endpoint |


```javascript
krakenfutures.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
Fetches current contract trading positions

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: Parsed exchange response for positions

**See**: https://docs.futures.kraken.com/#websocket-api-private-feeds-open-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | List of unified symbols |
| params | <code>object</code> | No | Not used by krakenfutures |


```javascript
krakenfutures.fetchPositions (symbols[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-instrument-details-get-instruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.fetchLeverageTiers (symbols[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfers currencies between sub-accounts

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://docs.futures.kraken.com/#http-api-trading-v3-api-transfers-initiate-wallet-transfer
- https://docs.futures.kraken.com/#http-api-trading-v3-api-transfers-initiate-withdrawal-to-spot-wallet


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | Unified currency code |
| amount | <code>float</code> | Yes | Size of the transfer |
| fromAccount | <code>string</code> | Yes | 'main'/'funding'/'future', 'flex', or a unified market symbol |
| toAccount | <code>string</code> | Yes | 'main'/'funding', 'flex', 'spot' or a unified market symbol |
| params | <code>object</code> | No | Exchange specific parameters |


```javascript
krakenfutures.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-multi-collateral-set-the-leverage-setting-for-a-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.setLeverage (leverage, symbol[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://docs.futures.kraken.com/#http-api-trading-v3-api-multi-collateral-get-the-leverage-setting-for-a-market  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.fetchLeverage (symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchTicker (symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.futures.kraken.com/#websocket-api-public-feeds-ticker-lite  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchTicker (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.futures.kraken.com/#websocket-api-public-feeds-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.futures.kraken.com/#websocket-api-public-feeds-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | not used by krakenfutures watchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchOrderBook (symbol[, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://docs.futures.kraken.com/#websocket-api-private-feeds-open-positions  

| Param | Type | Description |
| --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | list of unified market symbols |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchPositions (symbols, params[])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders
- https://docs.futures.kraken.com/#websocket-api-private-feeds-open-orders-verbose


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by krakenfutures watchOrders |
| since | <code>int</code> | No | not used by krakenfutures watchOrders |
| limit | <code>int</code> | No | not used by krakenfutures watchOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.futures.kraken.com/#websocket-api-private-feeds-fills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
krakenfutures.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>krakenfutures</code>](#krakenfutures)  
**Returns**: <code>object</code> - a object of wallet types each with a balance structure [https://docs.ccxt.com/#/?id=balance-structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.futures.kraken.com/#websocket-api-private-feeds-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by krakenfutures watchBalance |
| since | <code>int</code> | No | not used by krakenfutures watchBalance |
| limit | <code>int</code> | No | not used by krakenfutures watchBalance |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | can be either 'futures' or 'flex_futures' |


```javascript
krakenfutures.watchOrders (symbol[, since, limit, params])
```

