
<a name="ascendex" id="ascendex"></a>

## ascendex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTime](#fetchtime)
* [fetchAccounts](#fetchaccounts)
* [fetchBalance](#fetchbalance)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchTradingFees](#fetchtradingfees)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchPositions](#fetchpositions)
* [fetchFundingRates](#fetchfundingrates)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [setLeverage](#setleverage)
* [setMarginMode](#setmarginmode)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [transfer](#transfer)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchMarginModes](#fetchmarginmodes)
* [fetchLeverages](#fetchleverages)
* [watchOHLCV](#watchohlcv)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchBalance](#watchbalance)
* [watchOrders](#watchorders)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for ascendex

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchMarkets ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the ascendex server

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the ascendex server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchTime ([params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchAccounts ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#cash-account-balance
- https://ascendex.github.io/ascendex-pro-api/#margin-account-balance
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | wallet type, 'spot', 'margin', or 'swap' |
| params.marginMode | <code>string</code> | No | 'cross' or undefined, for spot margin trading, value of 'isolated' is invalid |


```javascript
ascendex.fetchBalance ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#ticker
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchTickers (symbols[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
ascendex.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://ascendex.github.io/ascendex-pro-api/#market-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchTradingFees ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order on the exchange

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: [An order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#place-order
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#new-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| type | <code>string</code> | Yes | "limit" or "market" |
| side | <code>string</code> | Yes | "buy" or "sell" |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.postOnly | <code>bool</code> | No | true or false |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *swap only* take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *swap only* stop loss trigger price |


```javascript
ascendex.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#place-batch-orders
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#place-batch-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.postOnly | <code>bool</code> | No | true or false |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at |


```javascript
ascendex.createOrders (orders[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#query-order
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#query-order-by-id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#list-open-orders
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#list-open-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#list-history-orders-v2
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#list-current-history-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
ascendex.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://ascendex.github.io/ascendex-pro-api/#cancel-order
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list with a single [order structure](https://docs.ccxt.com/#/?id=order-structure) with the response assigned to the info property

**See**

- https://ascendex.github.io/ascendex-pro-api/#cancel-all-orders
- https://ascendex.github.io/ascendex-futures-pro-api-v2/#cancel-all-open-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.cancelAllOrders (symbol[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://ascendex.github.io/ascendex-pro-api/#query-deposit-addresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | unified network code for deposit chain |


```javascript
ascendex.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchDepositsWithdrawals ([code, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchPositions (symbols[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rates structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexe by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchFundingRates (symbols[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.addMargin (symbol, amount[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://ascendex.github.io/ascendex-futures-pro-api-v2/#change-contract-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.setLeverage (leverage, symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://ascendex.github.io/ascendex-futures-pro-api-v2/#change-margin-type  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.setMarginMode (marginMode, symbol[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchLeverageTiers (symbols[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://ascendex.github.io/ascendex-pro-api/#list-all-assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchDepositWithdrawFees (codes[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency codeåå |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://ascendex.github.io/ascendex-futures-pro-api-v2/#funding-payment-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
ascendex.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="fetchMarginModes" id="fetchmarginmodes"></a>

### fetchMarginModes{docsify-ignore}
fetches the set margin mode of the user

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a list of [margin mode structures](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://ascendex.github.io/ascendex-futures-pro-api-v2/#position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchMarginModes ([symbols, params])
```


<a name="fetchLeverages" id="fetchleverages"></a>

### fetchLeverages{docsify-ignore}
fetch the set leverage for all contract markets

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a list of [leverage structures](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://ascendex.github.io/ascendex-futures-pro-api-v2/#position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.fetchLeverages ([symbols, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://ascendex.github.io/ascendex-pro-api/#channel-bar-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://ascendex.github.io/ascendex-pro-api/#channel-market-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://ascendex.github.io/ascendex-pro-api/#channel-market-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.name | <code>string</code> | No | the name of the method to call, 'trade' or 'aggTrade', default is 'trade' |


```javascript
ascendex.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://ascendex.github.io/ascendex-pro-api/#channel-level-2-order-book-updates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.watchOrderBook (symbol[, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://ascendex.github.io/ascendex-pro-api/#channel-order-and-balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.watchBalance ([params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>ascendex</code>](#ascendex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://ascendex.github.io/ascendex-pro-api/#channel-order-and-balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ascendex.watchOrders (symbol[, since, limit, params])
```

