
<a name="hibachi" id="hibachi"></a>

## hibachi{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchBalance](#fetchbalance)
* [fetchTrades](#fetchtrades)
* [fetchTicker](#fetchticker)
* [fetchOrder](#fetchorder)
* [fetchTradingFees](#fetchtradingfees)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [editOrders](#editorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [withdraw](#withdraw)
* [fetchOrderBook](#fetchorderbook)
* [fetchMyTrades](#fetchmytrades)
* [fetchOpenOrders](#fetchopenorders)
* [fetchPositions](#fetchpositions)
* [fetchLedger](#fetchledger)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchTime](#fetchtime)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)

<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the close, high, low, open prices, interval and the volumeNotional

**Kind**: instance property of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://api-doc.hibachi.xyz/#4f0eacec-c61e-4d51-afb3-23c51c2c6bac  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
hibachi.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for hibachi

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchCurrencies ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchBalance ([params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of recent [trade structures]

**See**: https://api-doc.hibachi.xyz/#86a53bc1-d3bb-4b93-8a11-7034d4698caa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (maximum value is 100) |
| params | <code>object</code> | No | extra parameters specific to the hibachi api endpoint |


```javascript
hibachi.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker and the related information for the past 24h

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market |
| params | <code>object</code> | No | extra parameters specific to the hibachi api endpoint |


```javascript
hibachi.fetchTicker (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#096a8854-b918-4de8-8731-b2a28d26b96d  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchOrder (id, symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fee

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - a map of market symbols to [fee structures](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Description |
| --- | --- |
| params | extra parameters |


```javascript
hibachi.fetchTradingFees (params, [undefined])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#00f6d5ad-5275-41cb-a1a8-19ed5d142124  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
*contract only* create a list of trade orders

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a limit order that is not matched

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#94d2cdaf-1c71-440f-a981-da1112824810  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | must be 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell', should stay the same with original side |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="editOrders" id="editorders"></a>

### editOrders{docsify-ignore}
edit a list of trade orders

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.editOrders (orders[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#e99c4f48-e610-4b7c-b7f6-1b4bb7af0271  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | is unused |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol, unused |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.cancelOrders (ids[, symbol, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#8ed24695-016e-49b2-a72d-7511ca921fee  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.cancelAllOrders (symbol[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api-doc.hibachi.xyz/#6421625d-3e45-45fa-be9b-d2a0e780c090  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code, only support USDT |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.withdraw (code, amount, address, tag[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the state of the open orders on the orderbook

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - A dictionary containg [orderbook information](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market |
| limit | <code>int</code> | No | currently unused |
| params | <code>object</code> | No | extra parameters to be passed -- see documentation link above |


```javascript
hibachi.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api-doc.hibachi.xyz/#0adbf143-189f-40e0-afdc-88af4cba3c79  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches all current open orders

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api-doc.hibachi.xyz/#3243f8a0-086c-44c5-ab8a-71bbb7bab403  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol to filter by |
| since | <code>int</code> | No | milisecond timestamp of the earliest order |
| limit | <code>int</code> | No | the maximum number of open orders to return |
| params | <code>object</code> | No | extra parameters |


```javascript
hibachi.fetchOpenOrders ([symbol, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchPositions ([symbols, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchLedger ([code, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch deposit address for given currency and chain. currently, we have a single EVM address across multiple EVM chains. Note: This method is currently only supported for trustless accounts

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters for API |
| params.publicKey | <code>string</code> | No | your public key, you can get it from UI after creating API key |


```javascript
hibachi.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch deposits made to account

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | filter by earliest timestamp (ms) |
| limit | <code>int</code> | No | maximum number of deposits to be returned |
| params | <code>object</code> | No | extra parameters to be passed to API |


```javascript
hibachi.fetchDeposits ([code, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch withdrawals made from account

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | filter by earliest timestamp (ms) |
| limit | <code>int</code> | No | maximum number of deposits to be returned |
| params | <code>object</code> | No | extra parameters to be passed to API |


```javascript
hibachi.fetchWithdrawals ([code, since, limit, params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: http://api-doc.hibachi.xyz/#b5c6a3bc-243d-4d35-b6d4-a74c92495434  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchTime ([params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://api-doc.hibachi.xyz/#bc34e8ae-e094-4802-8d56-3efe3a7bad49  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
hibachi.fetchOpenInterest (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://api-doc.hibachi.xyz/#bca696ca-b9b2-4072-8864-5d6b8c09807e  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>hibachi</code>](#hibachi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hibachi.fetchFundingRateHistory (symbol[, since, limit, params])
```

