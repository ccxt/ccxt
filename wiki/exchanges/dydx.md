
<a name="dydx" id="dydx"></a>

## dydx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [fetchOrderBook](#fetchorderbook)
* [fetchLedger](#fetchledger)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [withdraw](#withdraw)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchAccounts](#fetchaccounts)
* [fetchBalance](#fetchbalance)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.dydx.xyz/indexer-client/http#get-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.fetchTime ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for hyperliquid

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.dydx.xyz/indexer-client/http#get-perpetual-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.fetchMarkets ([params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://developer.woox.io/api-reference/endpoint/public_data/marketTrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.dydx.xyz/indexer-client/http#get-candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
dydx.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-historical-funding  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
dydx.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#list-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#list-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#list-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#list-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#list-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchPositions ([symbols, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.dydx.xyz/interaction/trading#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTT", "IOC", or "PO" |
| params.triggerPrice | <code>float</code> | No | The price a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | price for a stoploss order |
| params.takeProfitPrice | <code>float</code> | No | price for a takeprofit order |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.goodTillBlock | <code>float</code> | No | expired block number for the order, required for market order and non limit GTT order, default value is latestBlockHeight + 20 |
| params.goodTillBlockTimeInSeconds | <code>float</code> | No | expired time elapsed for the order, required for limit GTT order and conditional, default value is 30 days |


```javascript
dydx.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.dydx.xyz/interaction/trading/#cancel-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | it should be the clientOrderId in this case |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id used when creating the order |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger/algo order |
| params.orderFlags | <code>float</code> | No | default is 64, orderFlags for the order, market order and non limit GTT order is 0, limit GTT order is 64 and conditional order is 32 |
| params.goodTillBlock | <code>float</code> | No | expired block number for the order, required for market order and non limit GTT order (orderFlags = 0), default value is latestBlockHeight + 20 |
| params.goodTillBlockTimeInSeconds | <code>float</code> | No | expired time elapsed for the order, required for limit GTT order and conditional (orderFlagss > 0), default value is 30 days |
| params.subAccountId | <code>int</code> | No | sub account id, default is 0 |


```javascript
dydx.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma |
| params.subAccountId | <code>int</code> | No | sub account id, default is 0 |


```javascript
dydx.cancelOrders (ids[, symbol, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://docs.dydx.xyz/indexer-client/http#get-perpetual-market-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered balance of the user

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger)

**See**: https://docs.dydx.xyz/indexer-client/http#get-transfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchLedger ([code, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from *main, subaccount* |
| toAccount | <code>string</code> | Yes | account to transfer to *subaccount, address* |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
dydx.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-transfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchTransfers (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.withdraw (code, amount, address, tag[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-transfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-transfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchDeposits (code[, since, limit, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-transfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.subAccountNumber | <code>string</code> | No | sub account number |


```javascript
dydx.fetchDepositsWithdrawals ([code, since, limit, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type

**See**: https://docs.dydx.xyz/indexer-client/http#get-subaccounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | wallet address that made trades |


```javascript
dydx.fetchAccounts ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://docs.dydx.xyz/indexer-client/http#get-subaccount  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.fetchBalance ([params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#public-trades)

**See**: https://docs.dydx.xyz/indexer-client/websockets#trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribes from the trades channel

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.dydx.xyz/indexer-client/websockets#trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.unWatchTrades (symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://docs.dydx.xyz/indexer-client/websockets#orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://docs.dydx.xyz/indexer-client/websockets#orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.unWatchOrderBook (symbol[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.dydx.xyz/indexer-client/websockets#candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
dydx.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>dydx</code>](#dydx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.dydx.xyz/indexer-client/websockets#candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timezone | <code>object</code> | No | if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00' |


```javascript
dydx.unWatchOHLCV (symbol, timeframe[, params])
```

