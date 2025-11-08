
<a name="hashkey" id="hashkey"></a>

## hashkey{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchLastPrices](#fetchlastprices)
* [fetchBalance](#fetchbalance)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [transfer](#transfer)
* [fetchAccounts](#fetchaccounts)
* [fetchLedger](#fetchledger)
* [createOrder](#createorder)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createSpotOrder](#createspotorder)
* [createSwapOrder](#createswaporder)
* [createOrders](#createorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchPositions](#fetchpositions)
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [watchOHLCV](#watchohlcv)
* [watchTrades](#watchtrades)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchPositions](#watchpositions)
* [watchBalance](#watchbalance)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://hashkeyglobal-apidoc.readme.io/reference/check-server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchTime ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/test-connectivity  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchStatus ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for the exchange

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | the id of the market to fetch |


```javascript
hashkey.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchCurrencies ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-order-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (maximum value is 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-recent-trade-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (maximum value is 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#trade-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/get-account-trade-list
- https://hashkeyglobal-apidoc.readme.io/reference/query-futures-trades
- https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-user


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | *is mandatory for swap markets* unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch trades for (default 'spot') |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for, only supports the last 30 days timeframe |
| params.fromId | <code>string</code> | No | srarting trade id |
| params.toId | <code>string</code> | No | ending trade id |
| params.clientOrderId | <code>string</code> | No | *spot markets only* filter trades by orderId |
| params.accountId | <code>string</code> | No | account id to fetch the orders from |


```javascript
hashkey.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-kline  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
hashkey.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchTickers ([symbols, params])
```


<a name="fetchLastPrices" id="fetchlastprices"></a>

### fetchLastPrices{docsify-ignore}
fetches the last price for multiple markets

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a dictionary of lastprices structures

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-symbol-price-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the last prices |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | the id of the market to fetch last price for |


```javascript
hashkey.fetchLastPrices ([symbols, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-account-information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | account ID, for Master Key only |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch balance for (default 'spot') |


```javascript
hashkey.fetchBalance ([params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code (default is 'USDT') |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | network for fetch deposit address (default is 'ETH') |


```javascript
hashkey.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |
| params.fromId | <code>int</code> | No | starting ID (To be released) |


```javascript
hashkey.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/withdrawal-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |


```javascript
hashkey.fetchWithdrawals (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | network for withdraw |
| params.clientOrderId | <code>string</code> | No | client order id |
| params.platform | <code>string</code> | No | the platform to withdraw to (hashkey, HashKey HK) |


```javascript
hashkey.withdraw (code, amount, address, tag[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/new-account-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account id to transfer from |
| toAccount | <code>string</code> | Yes | account id to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the transfer |
| params.remark | <code>string</code> | No | a note for the transfer |


```javascript
hashkey.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://hashkeyglobal-apidoc.readme.io/reference/query-sub-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchAccounts ([params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-account-transaction-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined (not used) |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.flowType | <code>int</code> | No | trade, fee, transfer, deposit, withdrawal |
| params.accountType | <code>int</code> | No | spot, swap, custody |


```javascript
hashkey.fetchLedger ([code, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
- https://hashkeyglobal-apidoc.readme.io/reference/create-order
- https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *spot market buy only* the quote quantity that can be used as an alternative for the amount |
| params.test | <code>boolean</code> | No | *spot markets only* whether to use the test endpoint or not, default is false |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.timeInForce | <code>string</code> | No | "GTC" or "IOC" or "PO" for spot, 'GTC' or 'FOK' or 'IOC' or 'LIMIT_MAKER' or 'PO' for swap |
| params.clientOrderId | <code>string</code> | No | a unique id for the order - is mandatory for swap |
| params.triggerPrice | <code>float</code> | No | *swap markets only* The price at which a trigger order is triggered at |


```javascript
hashkey.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createSpotOrder" id="createspotorder"></a>

### createSpotOrder{docsify-ignore}
create a trade order on spot market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
- https://hashkeyglobal-apidoc.readme.io/reference/create-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or 'LIMIT_MAKER' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *market buy only* the quote quantity that can be used as an alternative for the amount |
| params.test | <code>bool</code> | No | whether to use the test endpoint or not, default is false |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |


```javascript
hashkey.createSpotOrder (symbol, type, side, amount[, price, params])
```


<a name="createSwapOrder" id="createswaporder"></a>

### createSwapOrder{docsify-ignore}
create a trade order on swap market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or 'STOP' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.timeInForce | <code>string</code> | No | 'GTC', 'FOK', 'IOC', 'LIMIT_MAKER' or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |


```javascript
hashkey.createSwapOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders (all orders should be of the same symbol)

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/create-multiple-orders
- https://hashkeyglobal-apidoc.readme.io/reference/batch-create-new-futures-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the api endpoint |


```javascript
hashkey.createOrders (orders[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/cancel-order
- https://hashkeyglobal-apidoc.readme.io/reference/cancel-futures-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot') |
| params.clientOrderId | <code>string</code> | No | a unique id for the order that can be used as an alternative for the id |
| params.trigger | <code>bool</code> | No | *swap markets only* true for canceling a trigger order (default false) |
| params.stop | <code>bool</code> | No | *swap markets only* an alternative for trigger param |


```javascript
hashkey.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - response from exchange

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/cancel-all-open-orders
- https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | 'buy' or 'sell' |


```javascript
hashkey.cancelAllOrders (symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/cancel-multiple-orders
- https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order-by-order-id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol (not used by hashkey) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot') |


```javascript
hashkey.cancelOrders (ids[, symbol, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/query-order
- https://hashkeyglobal-apidoc.readme.io/reference/get-futures-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot') |
| params.clientOrderId | <code>string</code> | No | a unique id for the order that can be used as an alternative for the id |
| params.accountId | <code>string</code> | No | *spot markets only* account id to fetch the order from |
| params.trigger | <code>bool</code> | No | *swap markets only* true for fetching a trigger order (default false) |
| params.stop | <code>bool</code> | No | *swap markets only* an alternative for trigger param |


```javascript
hashkey.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
- https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders
- https://hashkeyglobal-apidoc.readme.io/reference/sub
- https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in - is mandatory for swap markets |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve - default 500, maximum 1000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot') |
| params.orderId | <code>string</code> | No | *spot markets only* the id of the order to fetch |
| params.side | <code>string</code> | No | *spot markets only* 'buy' or 'sell' - the side of the orders to fetch |
| params.fromOrderId | <code>string</code> | No | *swap markets only* the id of the order to start from |
| params.trigger | <code>bool</code> | No | *swap markets only* true for fetching trigger orders (default false) |
| params.stop | <code>bool</code> | No | *swap markets only* an alternative for trigger param |
| params.accountId | <code>string</code> | No | account id to fetch the orders from |


```javascript
hashkey.fetchOpenOrders ([symbol, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://hashkeyglobal-apidoc.readme.io/reference/get-all-orders
- https://hashkeyglobal-apidoc.readme.io/reference/query-futures-history-orders
- https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-history-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | *is mandatory for swap markets* unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve - default 500, maximum 1000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for - only supports the last 90 days timeframe |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot') |
| params.orderId | <code>string</code> | No | *spot markets only* the id of the order to fetch |
| params.side | <code>string</code> | No | *spot markets only* 'buy' or 'sell' - the side of the orders to fetch |
| params.fromOrderId | <code>string</code> | No | *swap markets only* the id of the order to start from |
| params.trigger | <code>bool</code> | No | *swap markets only* the id of the order to start from true for fetching trigger orders (default false) |
| params.stop | <code>bool</code> | No | *swap markets only* the id of the order to start from an alternative for trigger param |
| params.accountId | <code>string</code> | No | account id to fetch the orders from |


```javascript
hashkey.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexed by market symbols

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchFundingRates (symbols[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-history-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.fromId | <code>int</code> | No | the id of the entry to start from |
| params.endId | <code>int</code> | No | the id of the entry to end with |


```javascript
hashkey.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned) |


```javascript
hashkey.fetchPositions (symbols[, params])
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
fetch all open positions for specific symbol

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned) |


```javascript
hashkey.fetchPositionsForSymbol (symbol[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/query-futures-leverage-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.setLeverage (leverage, symbol[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchLeverageTiers (symbols[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**

- https://developers.binance.com/docs/wallet/asset/trade-fee // spot
- https://hashkeyglobal-apidoc.readme.io/reference/get-futures-commission-rate-request-weight // swap


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
*for spot markets only* fetch the trading fees for multiple markets

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://developers.binance.com/docs/wallet/asset/trade-fee  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.fetchTradingFees ([params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.binary | <code>bool</code> | No | true or false - default false |


```javascript
hashkey.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.binary | <code>bool</code> | No | true or false - default false |


```javascript
hashkey.watchTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#public-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to watch positions for |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
hashkey.watchPositions ([symbols, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hashkey</code>](#hashkey)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://hashkeyglobal-apidoc.readme.io/reference/websocket-api#private-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to watch balance for (default 'spot') |


```javascript
hashkey.watchBalance ([params])
```

