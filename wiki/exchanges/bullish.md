
<a name="bullish" id="bullish"></a>

## bullish{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [fetchTicker](#fetchticker)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOrder](#fetchorder)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [withdraw](#withdraw)
* [fetchAccounts](#fetchaccounts)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [fetchTransfers](#fetchtransfers)
* [transfer](#transfer)
* [fetchBorrowRateHistory](#fetchborrowratehistory)
* [signIn](#signin)
* [watchTrades](#watchtrades)
* [watchTicker](#watchticker)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for ace

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchMarkets ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/orderbook/hybrid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (not used by bullish) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/trades
- https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/trades


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (max 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bullish.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.orderId | <code>string</code> | No | the order id to fetch trades for |
| params.clientOrderId | <code>string</code> | No | the client order id to fetch trades for |
| params.tradingAccountId | <code>string</code> | No | the trading account id to fetch trades for |


```javascript
bullish.fetchMyTrades ([symbol, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the client order id to fetch trades for |


```javascript
bullish.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchTicker (symbol[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/candle  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (max 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest entry |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bullish.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response |
| limit | <code>int</code> | No | the maximum amount of funding rate structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
- https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve (5, 25, 50, 100, default is 25) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest order to fetch |
| params.tradingAccountId | <code>string</code> | No | the trading account id (mandatory parameter) |
| params.orderId | <code>string</code> | No | the id of the order to fetch for |
| params.clientOrderId | <code>string</code> | No | the client id of the order to fetch for |
| params.status | <code>string</code> | No | filter by order status, 'OPEN', 'CANCELLED', 'CLOSED', 'REJECTED' |
| params.paginate | <code>bool</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bullish.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | Yes | the trading account id (mandatory parameter) |


```javascript
bullish.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the canceled orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of canceled orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | No | the trading account id (mandatory parameter) |


```javascript
bullish.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the closed orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of closed orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | Yes | the trading account id (mandatory parameter) |


```javascript
bullish.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the closed orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of closed orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | No | the trading account id (mandatory parameter) |


```javascript
bullish.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v2/orders/-orderId-  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.traidingAccountId | <code>string</code> | No | the trading account id (mandatory parameter) |


```javascript
bullish.fetchOrder (id[, symbol, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or 'STOP_LIMIT' or 'POST_ONLY' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a custom client order id |
| params.triggerPrice | <code>float</code> | No | the price at which a stop order is triggered at |
| params.timeInForce | <code>string</code> | No | the time in force for the order, either 'GTC' (Good Till Cancelled) or 'IOC' (Immediate or Cancel), default is 'GTC' |
| params.allowBorrow | <code>bool</code> | No | if true, the order will be allowed to borrow assets to fulfill the order (default is false) |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately (default is false) |
| params.traidingAccountId | <code>string</code> | Yes | the trading account id (mandatory parameter) |


```javascript
bullish.createOrder (symbol, type, side, amount[, price, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade limit order

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-amend  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market to create an order in |
| type | <code>string</code> | No | 'limit' or 'POST_ONLY' |
| side | <code>string</code> | No | not used by bullish editOrder |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price for the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.traidingAccountId | <code>string</code> | No | the trading account id (mandatory parameter) |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately (default is false) |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order, automatically generated if not sent |


```javascript
bullish.editOrder (id[, symbol, type, side, amount, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | No | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.commandType | <code>string</code> | Yes | the command type, default is 'V3CancelOrder' (mandatory parameter) |
| params.traidingAccountId | <code>string</code> | No | the trading account id (mandatory parameter) |


```javascript
bullish.cancelOrder ([id, symbol, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.traidingAccountId | <code>string</code> | Yes | the trading account id (mandatory parameter) |


```javascript
bullish.cancelAllOrders ([symbol, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/transactions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchDepositsWithdrawals ([code, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/wallets/withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timestamp | <code>string</code> | Yes | the timestamp of the withdrawal request (mandatory) |
| params.nonce | <code>string</code> | Yes | the nonce of the withdrawal request (mandatory) |
| params.network | <code>string</code> | Yes | network for withdraw (mandatory) |


```javascript
bullish.withdraw (code, amount, address[, tag, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--trading-accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.fetchAccounts ([params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/deposit-instructions/crypto/-symbol-  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | network for deposit address |


```javascript
bullish.fetchDepositAddress (code[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset
- https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset/-symbol-


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | Yes | the trading account id (mandatory parameter) |
| params.code | <code>string</code> | No | unified currency code, default is undefined |


```javascript
bullish.fetchBalance ([params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/derivatives-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | Yes | the trading account id |


```javascript
bullish.fetchPositions (symbols[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | Yes | the latest time in ms to fetch transfers for (default time now) |
| params.tradingAccountId | <code>string</code> | Yes | the trading account id |


```javascript
bullish.fetchTransfers (code[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/command-commandType-V1TransferAsset  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency codeåå |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account ID to transfer from |
| toAccount | <code>string</code> | Yes | account ID to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

### fetchBorrowRateHistory{docsify-ignore}
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/borrow-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | Yes | the latest time in ms to fetch entries for |
| params.tradingAccountId | <code>string</code> | Yes | the trading account id |


```javascript
bullish.fetchBorrowRateHistory (code[, since, limit, params])
```


<a name="signIn" id="signin"></a>

### signIn{docsify-ignore}
sign in, must be called prior to using other authenticated methods

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: response from exchange

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--add-authenticated-request-header  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.signIn ([params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--unified-anonymous-trades-websocket-unauthenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.watchTrades (symbol[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--anonymous-market-data-price-tick-unauthenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.watchTicker (symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--multi-orderbook-websocket-unauthenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bullish.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | No | the trading account id to fetch entries for |


```javascript
bullish.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | No | the trading account id to fetch entries for |


```javascript
bullish.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingAccountId | <code>string</code> | No | the trading account id to fetch entries for |


```javascript
bullish.watchBalance ([params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>bullish</code>](#bullish)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
bullish.watchPositions ([symbols, since, limit, params])
```

