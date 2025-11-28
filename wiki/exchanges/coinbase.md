
<a name="coinbase" id="coinbase"></a>

## coinbase{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchAccounts](#fetchaccounts)
* [fetchPortfolios](#fetchportfolios)
* [createDepositAddress](#createdepositaddress)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchBalance](#fetchbalance)
* [fetchLedger](#fetchledger)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchBidsAsks](#fetchbidsasks)
* [withdraw](#withdraw)
* [fetchDepositAddress](#fetchdepositaddress)
* [deposit](#deposit)
* [fetchDeposit](#fetchdeposit)
* [fetchDepositMethodIds](#fetchdepositmethodids)
* [fetchDepositMethodId](#fetchdepositmethodid)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchConvertTrade](#fetchconverttrade)
* [closePosition](#closeposition)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchTradingFees](#fetchtradingfees)
* [fetchPortfolioDetails](#fetchportfoliodetails)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-time#http-request  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | 'v2PublicGetTime' or 'v3PublicGetBrokerageTime' default is 'v2PublicGetTime' |


```javascript
coinbase.fetchTime ([params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getaccounts
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-accounts#list-accounts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbase.fetchAccounts ([params])
```


<a name="fetchPortfolios" id="fetchportfolios"></a>

### fetchPortfolios{docsify-ignore}
fetch all the portfolios

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfolios  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchPortfolios ([params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-addresses#create-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.createDepositAddress (code[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
Fetch all withdrawals made from an account. Won't return crypto withdrawals. Use fetchLedger for those.

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cdp.coinbase.com/coinbase-app/docs/api-withdrawals#list-withdrawals  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.currencyType | <code>string</code> | No | "fiat" or "crypto" |


```javascript
coinbase.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
Fetch all fiat deposits made to an account. Won't return crypto deposits or staking rewards. Use fetchLedger for those.

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cdp.coinbase.com/coinbase-app/docs/api-deposits#list-deposits  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.currencyType | <code>string</code> | No | "fiat" or "crypto" |


```javascript
coinbase.fetchDeposits (code[, since, limit, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cdp.coinbase.com/coinbase-app/docs/api-transactions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchDepositsWithdrawals ([code, since, limit, params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for coinbase

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicproducts
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-currencies#get-fiat-currencies
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.usePrivate | <code>boolean</code> | No | use private endpoint for fetching markets |


```javascript
coinbase.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**

- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-currencies#get-fiat-currencies
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchCurrencies ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getproducts
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates#get-exchange-rates


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.usePrivate | <code>boolean</code> | No | use private endpoint for fetching tickers |


```javascript
coinbase.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getmarkettrades
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-spot-price
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-buy-price
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-prices#get-sell-price


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.usePrivate | <code>boolean</code> | No | whether to use the private endpoint for fetching the ticker |


```javascript
coinbase.fetchTicker (symbol[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getaccounts
- https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-accounts#list-accounts
- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmbalancesummary


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.v3 | <code>boolean</code> | No | default false, set true to use v3 api endpoint |
| params.type | <code>string</code> | No | "spot" (default) or "swap" or "future" |
| params.limit | <code>int</code> | No | default 250, maximum number of accounts to return |


```javascript
coinbase.fetchBalance ([params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
Fetch the history of changes, i.e. actions done by the user or operations that altered the balance. Will return staking rewards, and crypto deposits or withdrawals.

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://docs.cdp.coinbase.com/coinbase-app/docs/api-transactions#list-transactions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbase.fetchLedger ([code, since, limit, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_postorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stopPrice | <code>float</code> | No | price to trigger stop orders |
| params.triggerPrice | <code>float</code> | No | price to trigger stop orders |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop-loss orders |
| params.takeProfitPrice | <code>float</code> | No | price to trigger take-profit orders |
| params.postOnly | <code>bool</code> | No | true or false |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'GTD' or 'PO', 'FOK' |
| params.stop_direction | <code>string</code> | No | 'UNKNOWN_STOP_DIRECTION', 'STOP_DIRECTION_STOP_UP', 'STOP_DIRECTION_STOP_DOWN' the direction the stopPrice is triggered from |
| params.end_time | <code>string</code> | No | '2023-05-25T17:01:05.092Z' for 'GTD' orders |
| params.cost | <code>float</code> | No | *spot market buy only* the quote quantity that can be used as an alternative for the amount |
| params.preview | <code>boolean</code> | No | default to false, wether to use the test/preview endpoint or not |
| params.leverage | <code>float</code> | No | default to 1, the leverage to use for the order |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.retail_portfolio_id | <code>string</code> | No | portfolio uid |
| params.is_max | <code>boolean</code> | No | Used in conjunction with tradable_balance to indicate the user wants to use their entire tradable balance |
| params.tradable_balance | <code>string</code> | No | amount of tradable balance |


```javascript
coinbase.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by coinbase cancelOrder() |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_cancelorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | not used by coinbase cancelOrders() |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.cancelOrders (ids, symbol[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_editorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.preview | <code>boolean</code> | No | default to false, wether to use the test/preview endpoint or not |


```javascript
coinbase.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified market symbol that the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol that the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbase.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on all currently open orders

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |


```javascript
coinbase.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of closed order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |


```javascript
coinbase.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_gethistoricalorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of canceled order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpubliccandles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, not used by coinbase |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.usePrivate | <code>boolean</code> | No | default false, when true will use the private endpoint to fetch the candles |


```javascript
coinbase.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicmarkettrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the trades |
| since | <code>int</code> | No | not used by coinbase fetchTrades |
| limit | <code>int</code> | No | the maximum number of trade structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.usePrivate | <code>boolean</code> | No | default false, when true will use the private endpoint to fetch the trades |


```javascript
coinbase.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the trades |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of trade structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbase.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpublicproductbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.usePrivate | <code>boolean</code> | No | default false, when true will use the private endpoint to fetch the order book |


```javascript
coinbase.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getbestbidask  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchBidsAsks ([symbols, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-transactions#send-money  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No | an optional tag for the withdrawal |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.withdraw (code, amount, address[, tag, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_postcoinbaseaccountaddresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchDepositAddress (code[, params])
```


<a name="deposit" id="deposit"></a>

### deposit{docsify-ignore}
make a deposit

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-deposits#deposit-funds  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to deposit |
| id | <code>string</code> | Yes | the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the id of the account to deposit into |


```javascript
coinbase.deposit (code, amount, id[, params])
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch information on a deposit, fiat only, for crypto transactions use fetchLedger

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-deposits#show-deposit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | No | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the id of the account that the funds were deposited into |


```javascript
coinbase.fetchDeposit (id[, code, params])
```


<a name="fetchDepositMethodIds" id="fetchdepositmethodids"></a>

### fetchDepositMethodIds{docsify-ignore}
fetch the deposit id for a fiat currency associated with this account

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an array of [deposit id structures](https://docs.ccxt.com/#/?id=deposit-id-structure)

**See**: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethods  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchDepositMethodIds ([params])
```


<a name="fetchDepositMethodId" id="fetchdepositmethodid"></a>

### fetchDepositMethodId{docsify-ignore}
fetch the deposit id for a fiat currency associated with this account

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [deposit id structure](https://docs.ccxt.com/#/?id=deposit-id-structure)

**See**: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_getpaymentmethod  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the deposit payment method id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchDepositMethodId (id[, params])
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetch a quote for converting from one currency to another

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_createconvertquote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trade_incentive_metadata | <code>object</code> | No | an object to fill in user incentive data |
| params.trade_incentive_metadata.user_incentive_id | <code>string</code> | No | the id of the incentive |
| params.trade_incentive_metadata.code_val | <code>string</code> | No | the code value of the incentive |


```javascript
coinbase.fetchConvertQuote (fromCode, toCode[, amount, params])
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
convert from one currency to another

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_commitconverttrade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbase.createConvertTrade (id, fromCode, toCode[, amount, params])
```


<a name="fetchConvertTrade" id="fetchconverttrade"></a>

### fetchConvertTrade{docsify-ignore}
fetch the data for a conversion trade

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getconverttrade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to commit |
| code | <code>string</code> | Yes | the unified currency code that was converted from |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.toCode | <code>strng</code> | Yes | the unified currency code that was converted into |


```javascript
coinbase.fetchConvertTrade (id, code[, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
*futures only* closes open positions for a market

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cdp.coinbase.com/coinbase-app/trade/reference/retailbrokerageapi_closeposition  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | not used by coinbase |
| params | <code>object</code> | No | extra parameters specific to the coinbase api endpoint |
| params.clientOrderId | <code>string</code> | Yes | *mandatory* the client order id of the position to close |
| params.size | <code>float</code> | No | the size of the position to close, optional |


```javascript
coinbase.closePosition (symbol[, side, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmpositions
- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxpositions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolio | <code>string</code> | No | the portfolio UUID to fetch positions for |


```javascript
coinbase.fetchPositions ([symbols, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getintxposition
- https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getfcmposition


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.product_id | <code>string</code> | No | *futures only* the product id of the position to fetch, required for futures markets only |
| params.portfolio | <code>string</code> | No | *perpetual/swaps only* the portfolio UUID to fetch the position for, required for perpetual/swaps markets only |


```javascript
coinbase.fetchPosition (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://docs.cdp.coinbase.com/advanced-trade/reference/retailbrokerageapi_gettransactionsummary/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' |


```javascript
coinbase.fetchTradingFees ([params])
```


<a name="fetchPortfolioDetails" id="fetchportfoliodetails"></a>

### fetchPortfolioDetails{docsify-ignore}
Fetch details for a specific portfolio by UUID

**Kind**: instance method of [<code>coinbase</code>](#coinbase)  
**Returns**: <code>Array&lt;any&gt;</code> - An account structure <https://docs.ccxt.com/#/?id=account-structure>

**See**: https://docs.cloud.coinbase.com/advanced-trade/reference/retailbrokerageapi_getportfolios  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| portfolioUuid | <code>string</code> | Yes | The unique identifier of the portfolio to fetch |
| params | <code>Dict</code> | No | Extra parameters specific to the exchange API endpoint |


```javascript
coinbase.fetchPortfolioDetails (portfolioUuid[, params])
```

