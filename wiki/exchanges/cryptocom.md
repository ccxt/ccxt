
<a name="cryptocom" id="cryptocom"></a>

## cryptocom{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOrders](#fetchorders)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrderBook](#fetchorderbook)
* [fetchBalance](#fetchbalance)
* [fetchOrder](#fetchorder)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelOrdersForSymbols](#cancelordersforsymbols)
* [fetchOpenOrders](#fetchopenorders)
* [fetchMyTrades](#fetchmytrades)
* [withdraw](#withdraw)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchLedger](#fetchledger)
* [fetchAccounts](#fetchaccounts)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [closePositions](#closepositions)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchMyTrades](#watchmytrades)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrders](#watchorders)
* [watchPositions](#watchpositions)
* [watchBalance](#watchbalance)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelAllOrdersWs](#cancelallordersws)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for cryptocom

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-instruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchMarkets ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers
- https://exchange-docs.crypto.com/derivatives/index.html#public-get-tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchTicker (symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for, max date range is one day |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve, default 100 max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
cryptocom.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get a list of the most recent trades for a particular symbol

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch, maximum date range is one day |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
cryptocom.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-candlestick  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
cryptocom.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the number of order book entries to return, max 50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-user-balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchBalance ([params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-detail  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchOrder (id, symbol[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit', 'stop_loss', 'stop_limit', 'take_profit', 'take_profit_limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK' or 'PO' |
| params.ref_price_type | <code>string</code> | No | 'MARK_PRICE', 'INDEX_PRICE', 'LAST_PRICE' which trigger price type to use, default is MARK_PRICE |
| params.triggerPrice | <code>float</code> | No | price to trigger a trigger order |
| params.stopLossPrice | <code>float</code> | No | price to trigger a stop-loss trigger order |
| params.takeProfitPrice | <code>float</code> | No | price to trigger a take-profit trigger order |


```javascript
cryptocom.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-list
- https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-oco


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-amend-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol of the order to edit |
| type | <code>string</code> | No | not used by cryptocom editOrder |
| side | <code>string</code> | No | not used by cryptocom editOrder |
| amount | <code>float</code> | Yes | (mandatory) how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | Yes | (mandatory) the price for the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the original client order id of the order to edit, required if id is not provided |


```javascript
cryptocom.editOrder (id, symbol[, type, side, amount, price, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - Returns exchange raw message[https://docs.ccxt.com/#/?id=order-structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders to cancel |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.cancelAllOrders (symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id of the order to cancel |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.cancelOrder (id[, symbol, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.cancelOrders (ids, symbol[, params])
```


<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

### cancelOrdersForSymbols{docsify-ignore}
cancel multiple orders for multiple symbols

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.cancelOrdersForSymbols (orders[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for, maximum date range is one day |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
cryptocom.fetchMyTrades (symbol[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.withdraw (code, amount, address, tag[, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch a dictionary of addresses for a currency, indexed by network

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/#/?id=address-structure) indexed by the network

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |


```javascript
cryptocom.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-withdrawal-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |


```javascript
cryptocom.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-transactions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |


```javascript
cryptocom.fetchLedger ([code, since, limit, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchAccounts ([params])
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
fetches historical settlement records

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/#/?id=settlement-history-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-expired-settlement-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>int</code> | No | 'future', 'option' |


```javascript
cryptocom.fetchSettlementHistory (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetches historical funding rates

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rates

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures] to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is the current time |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
cryptocom.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchPositions (symbols[, params])
```


<a name="closePositions" id="closepositions"></a>

### closePositions{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - [A list of position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-close-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | not used by cryptocom.closePositions |
| params | <code>object</code> | No | extra parameters specific to the okx api endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.type | <code>string</code> | No | LIMIT or MARKET |
| params.price | <code>number</code> | No | for limit orders only |


```javascript
cryptocom.closePositions (symbol[, side, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-instrument-fee-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-fee-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.fetchTradingFees ([params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.bookSubscriptionType | <code>string</code> | No | The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates |
| params.bookUpdateFrequency | <code>int</code> | No | Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription |


```javascript
cryptocom.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.bookSubscriptionType | <code>string</code> | No | The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates |
| params.bookUpdateFrequency | <code>int</code> | No | Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription |


```javascript
cryptocom.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.bookSubscriptionType | <code>string</code> | No | The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates |
| params.bookUpdateFrequency | <code>int</code> | No | Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription |


```javascript
cryptocom.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is 50 |
| params.bookSubscriptionType | <code>string</code> | No | The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates |
| params.bookUpdateFrequency | <code>int</code> | No | Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription |


```javascript
cryptocom.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.unWatchTrades (symbol[, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to unwatch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.unWatchTradesForSymbols ([symbols, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-trade-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchTickers (symbols[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.unWatchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchBidsAsks (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-order-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchOrders (symbol[, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-position_balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to watch positions for |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchPositions ([symbols, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.watchBalance ([params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.createOrderWs (symbol, type, side, amount[, price, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-amend-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol of the order to edit |
| type | <code>string</code> | No | not used by cryptocom editOrder |
| side | <code>string</code> | No | not used by cryptocom editOrder |
| amount | <code>float</code> | Yes | (mandatory) how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | Yes | (mandatory) the price for the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | the original client order id of the order to edit, required if id is not provided |


```javascript
cryptocom.editOrderWs (id, symbol[, type, side, amount, price, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id of the order to cancel |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.cancelOrderWs (id[, symbol, params])
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>cryptocom</code>](#cryptocom)  
**Returns**: <code>object</code> - Returns exchange raw message [https://docs.ccxt.com/#/?id=order-structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders to cancel |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
cryptocom.cancelAllOrdersWs (symbol[, params])
```

