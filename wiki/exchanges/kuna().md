
<a name="kuna" id="kuna"></a>

## kuna{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchL3OrderBook](#fetchl3orderbook)
* [fetchTrades](#fetchtrades)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrder](#cancelorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOrdersByStatus](#fetchordersbystatus)
* [fetchMyTrades](#fetchmytrades)
* [withdraw](#withdraw)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchWithdrawal](#fetchwithdrawal)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchDeposit](#fetchdeposit)

<a name="kuna" id="kuna"></a>

### kuna{docsify-ignore}
Use the public-key as your apiKey



```javascript
kuna.kuna ()
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.kuna.io/docs/get-time-on-the-server  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.kuna.io/docs/get-information-about-available-currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for kuna

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.kuna.io/docs/get-all-traded-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchMarkets ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.kuna.io/docs/get-public-orders-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | 5, 10, 20, 50, 100, 500, or 1000 (default) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market. The average is not returned in the response, but the median can be accessed via response['info']['price']

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kuna.io/docs/get-market-info-by-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchTickers ([symbols, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kuna.io/docs/get-market-info-by-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchTicker (symbol[, params])
```


<a name="fetchL3OrderBook" id="fetchl3orderbook"></a>

### fetchL3OrderBook{docsify-ignore}
fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchL3OrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.kuna.io/docs/get-public-trades-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | between 1 and 100, 25 by default |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kuna.io/docs/create-a-new-order-private  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at EXCHANGE SPECIFIC PARAMETERS |
| params.id | <code>string</code> | No | id must be a UUID format, if you do not specify id, it will be generated automatically. |
| params.quoteQuantity | <code>float</code> | No | the max quantity of the quote asset to use for selling/buying |


```javascript
kuna.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.cancelOrder (id, symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>string</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | not used by kuna cancelOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.cancelOrder (ids, symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kuna.io/docs/get-order-details-by-id  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by kuna fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.withTrades | <code>boolean</code> | No | default == true, specify if the response should include trades associated with the order |


```javascript
kuna.fetchOrder (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kuna.io/docs/get-active-client-orders-private  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | 1-100, the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest timestamp (ms) to fetch orders for EXCHANGE SPECIFIC PARAMETERS |
| params.sort | <code>string</code> | No | asc (oldest-on-top) or desc (newest-on-top) |


```javascript
kuna.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kuna.io/docs/get-private-orders-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for EXCHANGE SPECIFIC PARAMETERS |
| params.sort | <code>string</code> | No | asc (oldest-on-top) or desc (newest-on-top) |


```javascript
kuna.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

### fetchOrdersByStatus{docsify-ignore}
fetch a list of orders

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kuna.io/docs/get-private-orders-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | canceled, closed, expired, open, pending, rejected, or waitStop |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | 1-100, the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest timestamp (ms) to fetch orders for EXCHANGE SPECIFIC PARAMETERS |
| params.sort | <code>string</code> | No | asc (oldest-on-top) or desc (newest-on-top) |


```javascript
kuna.fetchOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.kuna.io/docs/get-private-trades-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | not used by kuna fetchMyTrades |
| limit | <code>int</code> | No | not used by kuna fetchMyTrades |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.orderId | <code>string</code> | No | UUID of an order, to receive trades for this order only |
| params.sort | <code>string</code> | No | asc (oldest-on-top) or desc (newest-on-top) |


```javascript
kuna.fetchMyTrades (symbol[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kuna.io/docs/create-a-withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.chain | <code>string</code> | No | the chain to withdraw to EXCHANGE SPECIFIC PARAMETERS |
| params.id | <code>string</code> | No | id must be a uuid format, if you do not specify id, it will be generated automatically |
| params.withdrawAll | <code>boolean</code> | No | this field says that the amount should also include a fee |


```javascript
kuna.withdraw (code, amount, address, tag[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made to an account

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kuna.io/docs/get-withdraw-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch deposits for EXCHANGE SPECIFIC PARAMETERS |
| params.status | <code>string</code> | No | Created, Canceled, PartiallyProcessed, Processing, Processed, WaitForConfirmation, Pending, AmlChecking |
| params.sortField | <code>string</code> | No | amount (sorting by time), createdAt (sorting by date) |
| params.sortOrder | <code>string</code> | No | asc (oldest-on-top), or desc (newest-on-top, default) |
| params.skip | <code>int</code> | No | 0 - ... Select the number of transactions to skip |
| params.address | <code>string</code> | No |  |


```javascript
kuna.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

### fetchWithdrawal{docsify-ignore}
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kuna.io/docs/get-withdraw-details-by-id  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | Yes | not used by kuna.fetchWithdrawal |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchWithdrawal (id, code[, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.kuna.io/docs/generate-a-constant-crypto-address-for-deposit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.kuna.io/docs/find-crypto-address-for-deposit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kuna.io/docs/get-deposit-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch deposits for EXCHANGE SPECIFIC PARAMETERS |
| params.status | <code>string</code> | No | Created, Canceled, PartiallyProcessed, Processing, Processed, WaitForConfirmation, Pending, AmlChecking |
| params.sortField | <code>string</code> | No | amount (sorting by time), createdAt (sorting by date) |
| params.sortOrder | <code>string</code> | No | asc (oldest-on-top), or desc (newest-on-top, default) |
| params.skip | <code>int</code> | No | 0 - ... Select the number of transactions to skip |
| params.address | <code>string</code> | No |  |


```javascript
kuna.fetchDeposits (code[, since, limit, params])
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch data on a currency deposit via the deposit id

**Kind**: instance method of [<code>kuna</code>](#kuna)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.kuna.io/docs/get-deposit-details-by-id  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | filter by currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kuna.fetchDeposit (id, code[, params])
```

