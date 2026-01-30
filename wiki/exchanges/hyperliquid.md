
<a name="hyperliquid" id="hyperliquid"></a>

## hyperliquid{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchHip3Markets](#fetchhip3markets)
* [fetchSwapMarkets](#fetchswapmarkets)
* [calculatePricePrecision](#calculatepriceprecision)
* [fetchSpotMarkets](#fetchspotmarkets)
* [fetchBalance](#fetchbalance)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchFundingRates](#fetchfundingrates)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [createOrdersRequest](#createordersrequest)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelOrdersRequest](#cancelordersrequest)
* [cancelOrdersForSymbols](#cancelordersforsymbols)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [editOrder](#editorder)
* [editOrders](#editorders)
* [createVault](#createvault)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchMyTrades](#fetchmytrades)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [setMarginMode](#setmarginmode)
* [setLeverage](#setleverage)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [transfer](#transfer)
* [withdraw](#withdraw)
* [fetchTradingFee](#fetchtradingfee)
* [fetchLedger](#fetchledger)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchFundingHistory](#fetchfundinghistory)
* [reserveRequestWeight](#reserverequestweight)
* [createAccount](#createaccount)
* [createOrdersWs](#createordersws)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrdersWs](#cancelordersws)
* [cancelOrderWs](#cancelorderws)
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

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchStatus ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchMarkets ([params])
```


<a name="fetchHip3Markets" id="fetchhip3markets"></a>

### fetchHip3Markets{docsify-ignore}
retrieves data on all hip3 markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchHip3Markets ([params])
```


<a name="fetchSwapMarkets" id="fetchswapmarkets"></a>

### fetchSwapMarkets{docsify-ignore}
retrieves data on all swap markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchSwapMarkets ([params])
```


<a name="calculatePricePrecision" id="calculatepriceprecision"></a>

### calculatePricePrecision{docsify-ignore}
Helper function to calculate the Hyperliquid DECIMAL_PLACES price precision

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>int</code> - The calculated price precision


| Param | Type | Description |
| --- | --- | --- |
| price | <code>float</code> | the price to use in the calculation |
| amountPrecision | <code>int</code> | the amountPrecision to use in the calculation |
| maxDecimals | <code>int</code> | the maxDecimals to use in the calculation |


```javascript
hyperliquid.calculatePricePrecision (price, amountPrecision, maxDecimals[])
```


<a name="fetchSpotMarkets" id="fetchspotmarkets"></a>

### fetchSpotMarkets{docsify-ignore}
retrieves data on all spot markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchSpotMarkets ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.type | <code>string</code> | No | wallet type, ['spot', 'swap'], defaults to swap |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null |
| params.dex | <code>string</code> | No | for hip3 markets, the dex name, eg: 'xyz' |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchBalance ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', by default fetches both |
| params.hip3 | <code>boolean</code> | No | set to true to fetch hip3 markets only |


```javascript
hyperliquid.fetchTickers ([symbols, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
retrieves data on all swap markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchFundingRates ([symbols, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents, support '1m', '15m', '1h', '1d' |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
hyperliquid.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.user | <code>string</code> | No | wallet address that made trades |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchTrades (symbol[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.slippage | <code>string</code> | No | the slippage for market order |
| params.vaultAddress | <code>string</code> | No | the vault address for order |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.createOrders (orders[, params])
```


<a name="createOrdersRequest" id="createordersrequest"></a>

### createOrdersRequest{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |


```javascript
hyperliquid.createOrdersRequest (orders, [undefined])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address for order |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code>, <code>Array&lt;string&gt;</code> | No | client order ids, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.cancelOrders (ids[, symbol, params])
```


<a name="cancelOrdersRequest" id="cancelordersrequest"></a>

### cancelOrdersRequest{docsify-ignore}
build the request payload for cancelling multiple orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the raw request object to be sent to the exchange

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No |  |


```javascript
hyperliquid.cancelOrdersRequest (ids, symbol[, params])
```


<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

### cancelOrdersForSymbols{docsify-ignore}
cancel multiple orders for multiple symbols

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.cancelOrdersForSymbols (orders[, params])
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the api result


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.cancelAllOrdersAfter (timeout[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address for order |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="editOrders" id="editorders"></a>

### editOrders{docsify-ignore}
edit a list of trade orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.editOrders (orders[, params])
```


<a name="createVault" id="createvault"></a>

### createVault{docsify-ignore}
creates a value

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the api result


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | The name of the vault |
| description | <code>string</code> | Yes | The description of the vault |
| initialUsd | <code>number</code> | Yes | The initialUsd of the vault |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.createVault (name, description, initialUsd[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
hyperliquid.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.method | <code>string</code> | No | 'openOrders' or 'frontendOpenOrders' default is 'frontendOpenOrders' |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.dex | <code>string</code> | No | perp dex name. default is null |


```javascript
hyperliquid.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetch all unfilled currently closed orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetch all canceled orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetch all closed and canceled orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetch all orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.dex | <code>string</code> | No | perp dex name. default is null |


```javascript
hyperliquid.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchOrder (id, symbol[, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.dex | <code>string</code> | No | perp dex name, eg: XYZ |


```javascript
hyperliquid.fetchPositions ([symbols, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode (symbol)

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | margin mode must be either [isolated, cross] |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>string</code> | No | the rate of leverage, is required if setting trade mode (symbol) |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.setMarginMode (marginMode, symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | margin mode must be either [isolated, cross], default is cross |


```javascript
hyperliquid.setLeverage (leverage, symbol[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.addMargin (symbol, amount[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.reduceMargin (symbol, amount[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from *spot, swap* |
| toAccount | <code>string</code> | Yes | account to transfer to *swap, spot or address* |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal (only support USDC)

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | vault address withdraw from |


```javascript
hyperliquid.withdraw (code, amount, address, tag[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchTradingFee (symbol[, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchLedger ([code, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch withdrawals for |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.vaultAddress | <code>string</code> | No | vault address |


```javascript
hyperliquid.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch withdrawals for |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.vaultAddress | <code>string</code> | No | vault address |


```javascript
hyperliquid.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
hyperliquid.fetchOpenInterests ([symbols, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
hyperliquid.fetchOpenInterest (symbol[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="reserveRequestWeight" id="reserverequestweight"></a>

### reserveRequestWeight{docsify-ignore}
Instead of trading to increase the address based rate limits, this action allows reserving additional actions for 0.0005 USDC per request. The cost is paid from the Perps balance.

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| weight | <code>number</code> | Yes | the weight to reserve, 1 weight = 1 action, 0.0005 USDC per action |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.reserveRequestWeight (weight[, params])
```


<a name="createAccount" id="createaccount"></a>

### createAccount{docsify-ignore}
creates a sub-account under the main account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | the name of the sub-account |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiresAfter | <code>int</code> | No | time in ms after which the sub-account will expire |


```javascript
hyperliquid.createAccount (name[, params])
```


<a name="createOrdersWs" id="createordersws"></a>

### createOrdersWs{docsify-ignore}
create a list of trade orders using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.createOrdersWs (orders[, params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.slippage | <code>string</code> | No | the slippage for market order |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.createOrderWs (symbol, type, side, amount[, price, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.editOrderWs (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancel multiple orders using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | list of order ids to cancel |
| symbol | <code>string</code> | Yes | unified symbol of the market the orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>Array&lt;string&gt;</code> | No | list of client order ids to cancel instead of order ids |
| params.vaultAddress | <code>string</code> | No | the vault address for order cancellation |


```javascript
hyperliquid.cancelOrdersWs (ids, symbol[, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancel a single order using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id to cancel |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id to cancel instead of order id |
| params.vaultAddress | <code>string</code> | No | the vault address for order cancellation |


```javascript
hyperliquid.cancelOrderWs (id, symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchOrderBook (symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | 'webData2' or 'allMids', default is 'webData2' |


```javascript
hyperliquid.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | 'webData2' or 'allMids', default is 'webData2' |
| params.dex | <code>string</code> | No | for for hip3 tokens subscription, eg: 'xyz' or 'flx`, if symbols are provided we will infer it from the first symbol's market |


```javascript
hyperliquid.watchTickers (symbols[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | 'webData2' or 'allMids', default is 'webData2' |


```javascript
hyperliquid.unWatchTickers (symbols[, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.watchMyTrades (symbol[, since, limit, params])
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unWatches information on multiple trades made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.unWatchMyTrades (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches information on multiple trades made in a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchTrades (symbol[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.watchOrders (symbol[, since, limit, params])
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.unWatchOrders (symbol[, params])
```

