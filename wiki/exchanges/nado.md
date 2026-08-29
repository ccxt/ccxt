
<a name="nado" id="nado"></a>

## nado{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchPositions](#fetchpositions)
* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchFundingRates](#fetchfundingrates)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCV](#unwatchohlcv)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchBidsAsks](#watchbidsasks)
* [unWatchBidsAsks](#unwatchbidsasks)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)
* [watchMyTrades](#watchmytrades)
* [unWatchMyTrades](#unwatchmytrades)
* [watchPositions](#watchpositions)
* [unWatchPositions](#unwatchpositions)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelOrdersWs](#cancelordersws)
* [cancelAllOrdersWs](#cancelallordersws)

<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/executes/place-order
- https://docs.nado.xyz/developer-resources/api/trigger/executes/place-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | must be 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.expiration | <code>string</code>, <code>int</code> | No | order expiration timestamp in seconds, defaults to 4294967295 |
| params.appendix | <code>string</code>, <code>int</code> | No | pre-encoded order appendix |
| params.reduceOnly | <code>boolean</code> | No | true if the order should only reduce position |
| params.postOnly | <code>boolean</code> | No | true to create a post-only order |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', or 'PO' |
| params.spotLeverage | <code>boolean</code> | No | whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage |
| params.triggerPrice | <code>float</code> | No | *swap only* The price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *swap only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *swap only* The price at which a take profit order is triggered at |
| params.triggerDirection | <code>string</code> | No | trigger direction, above, below |
| params.id | <code>int</code> | No | client-provided request id, returned by the exchange in the response |


```javascript
nado.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-and-place  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | must be 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.expiration | <code>string</code>, <code>int</code> | No | order expiration timestamp in seconds, defaults to 4294967295 |
| params.appendix | <code>string</code>, <code>int</code> | No | pre-encoded order appendix |
| params.reduceOnly | <code>boolean</code> | No | true if the order should only reduce position |
| params.postOnly | <code>boolean</code> | No | true to create a post-only order |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', or 'PO' |
| params.spotLeverage | <code>boolean</code> | No | whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage |
| params.placeRequiresUnfilled | <code>boolean</code> | No | when true, aborts the new order if the canceled order had partial fills or the cancel failed, exchange-specific alias params.place_requires_unfilled, defaults to true |
| params.id | <code>int</code> | No | client-provided request id, returned by the exchange in the response |


```javascript
nado.editOrder (id, symbol, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.requiredUnfilledAmount | <code>string</code> | No | cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount |
| params.id | <code>int</code> | No | client-provided request id, returned by the exchange in the response |


```javascript
nado.cancelOrder (id, symbol, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-product-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, when undefined all orders for all products are canceled |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.id | <code>int</code> | No | client-provided request id, returned by the exchange in the response |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |


```javascript
nado.cancelAllOrders (symbol?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.requiredUnfilledAmount | <code>string</code> | No | cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount |
| params.id | <code>int</code> | No | client-provided request id, returned by the exchange in the response |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |


```javascript
nado.cancelOrders (ids, symbol, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/queries/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchOrder (id, symbol, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/archive-indexer/orders
- https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |


```javascript
nado.fetchOrders (symbol, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/queries/orders
- https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger order |


```javascript
nado.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/archive-indexer/orders
- https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.until | <code>int</code> | No | timestamp in ms of the latest order to fetch |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger order |


```javascript
nado.fetchClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |


```javascript
nado.fetchCanceledOrders (symbol, since?, limit?, params?)
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.nado.xyz/developer-resources/api/trigger/queries/list-trigger-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |


```javascript
nado.fetchCanceledAndClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.nado.xyz/developer-resources/api/archive-indexer/matches  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest trade |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch |


```javascript
nado.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/queries/subaccount-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |


```javascript
nado.fetchBalance (params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.nado.xyz/developer-resources/api/archive-indexer/events  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.until | <code>int</code> | No | timestamp in ms of the latest deposit to fetch |


```javascript
nado.fetchDeposits (code?, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.nado.xyz/developer-resources/api/archive-indexer/events  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.until | <code>int</code> | No | timestamp in ms of the latest withdrawal to fetch |


```javascript
nado.fetchWithdrawals (code?, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Position&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/queries/subaccount-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |


```javascript
nado.fetchPositions (symbols?, params?)
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.nado.xyz/developer-resources/api/gateway/edge#control-messages  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchTime (params?)
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**: https://docs.nado.xyz/developer-resources/api/gateway/queries/status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchStatus (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for nado

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/queries/symbols
- https://docs.nado.xyz/developer-resources/api/v2/pairs
- https://docs.nado.xyz/developer-resources/api/v2/assets


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchMarkets (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.nado.xyz/developer-resources/api/v2/assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchCurrencies (params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.nado.xyz/developer-resources/api/v2/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchTickers (symbols, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.nado.xyz/developer-resources/api/v2/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchTicker (symbol, params?)
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://docs.nado.xyz/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.edge | <code>boolean</code> | No | whether to retrieve volume and open interest metrics for all chains, defaults to true |


```javascript
nado.fetchFundingRate (symbol, params?)
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://docs.nado.xyz/developer-resources/api/archive-indexer/interest-and-funding-payments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |


```javascript
nado.fetchFundingHistory (symbol, since?, limit?, params?)
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a dictionary of [funding rate structures](https://docs.ccxt.com/?id=funding-rates-structure), indexed by market symbols

**See**: https://docs.nado.xyz/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.edge | <code>boolean</code> | No | whether to retrieve volume and open interest metrics for all chains, defaults to true |


```javascript
nado.fetchFundingRates (symbols?, params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://docs.nado.xyz/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |
| params.edge | <code>boolean</code> | No | whether to retrieve volume and open interest metrics for all chains, defaults to true |


```javascript
nado.fetchOpenInterest (symbol, params?)
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
retrieves the open interests of some currencies

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a dictionary of [open interest structures](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://docs.nado.xyz/developer-resources/api/v2/contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |
| params.edge | <code>boolean</code> | No | whether to retrieve volume and open interest metrics for all chains, defaults to true |


```javascript
nado.fetchOpenInterests (symbols?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://docs.nado.xyz/developer-resources/api/v2/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of the most recent trades for a particular symbol

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.nado.xyz/developer-resources/api/v2/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.max_trade_id | <code>int</code> | No | max trade id to include in the result for pagination |


```javascript
nado.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.nado.xyz/developer-resources/api/archive-indexer/candlesticks  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
nado.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchTrades (symbol, since?, limit?, params?)
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches information on multiple trades made in a market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchTrades (symbol, params?)
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchTradesForSymbols (symbols, since?, limit?, params?)
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unWatches information on multiple trades made in a list of markets

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to unwatch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchTradesForSymbols (symbols, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>OrderBook</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchOrderBook (symbol, limit?, params?)
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchOrderBook (symbol, params?)
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>OrderBook</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchOrderBookForSymbols (symbols, limit?, params?)
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for a list of symbols

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to unwatch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchOrderBookForSymbols (symbols, params?)
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - A dictionary of [OHLCV](https://docs.ccxt.com/#/?id=ohlcv-structure) structures indexed by market symbols

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to watch OHLCV data for, example [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchOHLCVForSymbols (symbolsAndTimeframes, since?, limit?, params?)
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchOHLCV (symbol, timeframe, params?)
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to unwatch OHLCV data for, example [['BTC/USDT0:USDT0', '1m'], ['ETH/USDT0:USDT0', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchOHLCVForSymbols (symbolsAndTimeframes, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker with the best bid and ask for a specific market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchTicker (symbol, params?)
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker with the best bid and ask for a specific market

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchTicker (symbol, params?)
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches price tickers with the best bid and ask for all markets of a specific list

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchTickers (symbols?, params?)
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches price tickers with the best bid and ask for all markets of a specific list

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to unwatch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchTickers (symbols?, params?)
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the bids and asks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchBidsAsks (symbols, params?)
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
unWatches best bid & ask for symbols

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**: https://docs.nado.xyz/developer-resources/api/subscriptions/streams  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to unwatch the bids and asks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchBidsAsks (symbols, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
- https://docs.nado.xyz/developer-resources/api/subscriptions/streams
- https://docs.nado.xyz/developer-resources/api/subscriptions/events


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchOrders (symbol, since?, limit?, params?)
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
- https://docs.nado.xyz/developer-resources/api/subscriptions/streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchOrders (symbol, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
- https://docs.nado.xyz/developer-resources/api/subscriptions/streams
- https://docs.nado.xyz/developer-resources/api/subscriptions/events


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchMyTrades (symbol, since?, limit?, params?)
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unWatches information on multiple trades made by the user

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
- https://docs.nado.xyz/developer-resources/api/subscriptions/streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchMyTrades (symbol, params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watches information on user positions

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
- https://docs.nado.xyz/developer-resources/api/subscriptions/streams
- https://docs.nado.xyz/developer-resources/api/subscriptions/events


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of position structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.watchPositions (symbols?, since?, limit?, params?)
```


<a name="unWatchPositions" id="unwatchpositions"></a>

### unWatchPositions{docsify-ignore}
unWatches information on user positions

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.nado.xyz/developer-resources/api/subscriptions/authentication
- https://docs.nado.xyz/developer-resources/api/subscriptions/streams


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
nado.unWatchPositions (symbols?, params?)
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order over the v2 gateway WebSocket

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
- https://docs.nado.xyz/developer-resources/api/gateway/executes/place-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | must be 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.expiration | <code>string</code>, <code>int</code> | No | order expiration timestamp in seconds, defaults to 4294967295 |
| params.appendix | <code>string</code>, <code>int</code> | No | pre-encoded order appendix |
| params.reduceOnly | <code>boolean</code> | No | true if the order should only reduce position |
| params.postOnly | <code>boolean</code> | No | true to create a post-only order |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', or 'PO' |
| params.spotLeverage | <code>boolean</code> | No | whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage |
| params.id | <code>int</code> | No | client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted |


```javascript
nado.createOrderWs (symbol, type, side, amount, price?, params?)
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order over the v2 gateway WebSocket

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
- https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-and-place


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | must be 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.expiration | <code>string</code>, <code>int</code> | No | order expiration timestamp in seconds, defaults to 4294967295 |
| params.appendix | <code>string</code>, <code>int</code> | No | pre-encoded order appendix |
| params.reduceOnly | <code>boolean</code> | No | true if the order should only reduce position |
| params.postOnly | <code>boolean</code> | No | true to create a post-only order |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', or 'PO' |
| params.spotLeverage | <code>boolean</code> | No | whether leverage should be used for spot, defaults to true, exchange-specific alias params.spot_leverage |
| params.placeRequiresUnfilled | <code>boolean</code> | No | when true, aborts the new order if the canceled order had partial fills or the cancel failed, exchange-specific alias params.place_requires_unfilled, defaults to true |
| params.id | <code>int</code> | No | client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted |


```javascript
nado.editOrderWs (id, symbol, type, side, amount, price?, params?)
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order over the v2 gateway WebSocket

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
- https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.requiredUnfilledAmount | <code>string</code> | No | cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount |
| params.id | <code>int</code> | No | client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted |


```javascript
nado.cancelOrderWs (id, symbol, params?)
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancel multiple orders over the v2 gateway WebSocket

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
- https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.requiredUnfilledAmount | <code>string</code> | No | cancel only if the order's absolute remaining unfilled amount matches this amount, exchange-specific raw x18 alias params.required_unfilled_amount |
| params.id | <code>int</code> | No | client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted |


```javascript
nado.cancelOrdersWs (ids, symbol, params?)
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancel all open orders over the v2 gateway WebSocket

**Kind**: instance method of [<code>nado</code>](#nado)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.nado.xyz/developer-resources/api/gateway/websocket-v2
- https://docs.nado.xyz/developer-resources/api/gateway/executes/cancel-product-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, when undefined all orders for all products are canceled |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount | <code>string</code> | No | the 12-byte subaccount identifier, defaults to 'default' |
| params.id | <code>int</code> | No | client-provided request id used to correlate the out-of-order v2 response, autogenerated when omitted |


```javascript
nado.cancelAllOrdersWs (symbol?, params?)
```

