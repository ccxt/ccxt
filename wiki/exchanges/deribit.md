
<a name="deribit" id="deribit"></a>

## deribit{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchStatus](#fetchstatus)
* [fetchAccounts](#fetchaccounts)
* [fetchMarkets](#fetchmarkets)
* [fetchBalance](#fetchbalance)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOrderBook](#fetchorderbook)
* [fetchOrder](#fetchorder)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchVolatilityHistory](#fetchvolatilityhistory)
* [fetchTransfers](#fetchtransfers)
* [transfer](#transfer)
* [withdraw](#withdraw)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchLiquidations](#fetchliquidations)
* [fetchMyLiquidations](#fetchmyliquidations)
* [fetchGreeks](#fetchgreeks)
* [fetchOption](#fetchoption)
* [fetchOptionChain](#fetchoptionchain)
* [watchBalance](#watchbalance)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchMyTrades](#watchmytrades)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchOrders](#watchorders)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.deribit.com/#public-get_time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.deribit.com/#public-get_currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchCurrencies ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.deribit.com/#public-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchStatus ([params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://docs.deribit.com/#private-get_subaccounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchAccounts ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for deribit

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.deribit.com/#public-get_currencies
- https://docs.deribit.com/#public-get_instruments


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchMarkets ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://docs.deribit.com/#private-get_account_summary
- https://docs.deribit.com/#private-get_account_summaries


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.code | <code>string</code> | No | unified currency code of the currency for the balance, if defined 'privateGetGetAccountSummary' will be used, otherwise 'privateGetGetAccountSummaries' will be used |


```javascript
deribit.fetchBalance ([params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.deribit.com/#private-create_deposit_address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.deribit.com/#private-get_current_deposit_address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchDepositAddress (code[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.deribit.com/#public-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.deribit.com/#public-get_book_summary_by_currency  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.code | <code>string</code> | No | *required* the currency code to fetch the tickers for, eg. 'BTC', 'ETH' |


```javascript
deribit.fetchTickers ([symbols, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.deribit.com/#public-get_tradingview_chart_data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | whether to paginate the results, set to false by default |
| params.until | <code>int</code> | No | the latest time in ms to fetch ohlcv for |


```javascript
deribit.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol.

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://docs.deribit.com/#public-get_last_trades_by_instrument
- https://docs.deribit.com/#public-get_last_trades_by_instrument_and_time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |


```javascript
deribit.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://docs.deribit.com/#private-get_account_summary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchTradingFees ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.deribit.com/#public-get_order_book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.deribit.com/#private-get_order_state  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchOrder (id, symbol[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.deribit.com/#private-buy
- https://docs.deribit.com/#private-sell


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency. |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>string</code> | No | the trigger type 'index_price', 'mark_price', or 'last_price', default is 'last_price' |
| params.trailingAmount | <code>float</code> | No | the quote amount to trail away from the current market price |


```javascript
deribit.createOrder (symbol, type, side, amount[, price, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.deribit.com/#private-edit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | edit order id |
| symbol | <code>string</code> | No | unified symbol of the market to edit an order in |
| type | <code>string</code> | No | 'market' or 'limit' |
| side | <code>string</code> | No | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency. |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trailingAmount | <code>float</code> | No | the quote amount to trail away from the current market price |


```javascript
deribit.editOrder (id[, symbol, type, side, amount, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.deribit.com/#private-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by deribit cancelOrder () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.deribit.com/#private-cancel_all
- https://docs.deribit.com/#private-cancel_all_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.cancelAllOrders (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.deribit.com/#private-get_open_orders_by_currency
- https://docs.deribit.com/#private-get_open_orders_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.deribit.com/#private-get_order_history_by_currency
- https://docs.deribit.com/#private-get_order_history_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.deribit.com/#private-get_user_trades_by_order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.deribit.com/#private-get_user_trades_by_currency
- https://docs.deribit.com/#private-get_user_trades_by_currency_and_time
- https://docs.deribit.com/#private-get_user_trades_by_instrument
- https://docs.deribit.com/#private-get_user_trades_by_instrument_and_time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.deribit.com/#private-get_deposits  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.deribit.com/#private-get_withdrawals  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.deribit.com/#private-get_position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.deribit.com/#private-get_positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.currency | <code>string</code> | No | currency code filter for positions |
| params.kind | <code>string</code> | No | market type filter for positions 'future', 'option', 'spot', 'future_combo' or 'option_combo' |
| params.subaccount_id | <code>int</code> | No | the user id for the subaccount |


```javascript
deribit.fetchPositions (symbols[, params])
```


<a name="fetchVolatilityHistory" id="fetchvolatilityhistory"></a>

### fetchVolatilityHistory{docsify-ignore}
fetch the historical volatility of an option market based on an underlying asset

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [volatility history objects](https://docs.ccxt.com/#/?id=volatility-structure)

**See**: https://docs.deribit.com/#public-get_historical_volatility  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchVolatilityHistory (code[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.deribit.com/#private-get_transfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of  transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchTransfers (code[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://docs.deribit.com/#private-submit_transfer_to_user
- https://docs.deribit.com/#private-submit_transfer_to_subaccount


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.deribit.com/#private-withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.withdraw (code, amount, address, tag[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.deribit.com/#public-get_currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.deribit.com/#public-get_funding_rate_value  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.start_timestamp | <code>int</code> | No | fetch funding rate starting from this timestamp |
| params.end_timestamp | <code>int</code> | No | fetch funding rate ending at this timestamp |


```javascript
deribit.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.deribit.com/#public-get_funding_rate_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding rate history for |
| limit | <code>int</code> | No | the maximum number of entries to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | fetch funding rate ending at this timestamp |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
deribit.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchLiquidations" id="fetchliquidations"></a>

### fetchLiquidations{docsify-ignore}
retrieves the public liquidations of a trading pair

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**: https://docs.deribit.com/#public-get_last_settlements_by_currency  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the deribit api endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
deribit.fetchLiquidations (symbol[, since, limit, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**: https://docs.deribit.com/#private-get_settlement_history_by_instrument  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the deribit api endpoint |


```javascript
deribit.fetchMyLiquidations (symbol[, since, limit, params])
```


<a name="fetchGreeks" id="fetchgreeks"></a>

### fetchGreeks{docsify-ignore}
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)

**See**: https://docs.deribit.com/#public-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchGreeks (symbol[, params])
```


<a name="fetchOption" id="fetchoption"></a>

### fetchOption{docsify-ignore}
fetches option data that is commonly found in an option chain

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - an [option chain structure](https://docs.ccxt.com/#/?id=option-chain-structure)

**See**: https://docs.deribit.com/#public-get_book_summary_by_instrument  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchOption (symbol[, params])
```


<a name="fetchOptionChain" id="fetchoptionchain"></a>

### fetchOptionChain{docsify-ignore}
fetches data for an underlying asset that is commonly found in an option chain

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a list of [option chain structures](https://docs.ccxt.com/#/?id=option-chain-structure)

**See**: https://docs.deribit.com/#public-get_book_summary_by_currency  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | base currency to fetch an option chain for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.fetchOptionChain (code[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.deribit.com/#user-portfolio-currency  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchBalance ([params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information for a specific market.

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.deribit.com/#ticker-instrument_name-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.interval | <code>str</code> | No | specify aggregation and frequency of notifications. Possible values: 100ms, raw |


```javascript
deribit.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.deribit.com/#ticker-instrument_name-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.interval | <code>str</code> | No | specify aggregation and frequency of notifications. Possible values: 100ms, raw |


```javascript
deribit.watchTickers ([symbols, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.deribit.com/#quote-instrument_name  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchBidsAsks ([symbols, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.deribit.com/#trades-instrument_name-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.interval | <code>str</code> | No | specify aggregation and frequency of notifications. Possible values: 100ms, raw |


```javascript
deribit.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.deribit.com/#trades-instrument_name-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
get the list of trades associated with the user

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.deribit.com/#user-trades-instrument_name-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for. Use 'any' to watch all trades |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.interval | <code>str</code> | No | specify aggregation and frequency of notifications. Possible values: 100ms, raw |


```javascript
deribit.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.deribit.com/#book-instrument_name-group-depth-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.interval | <code>string</code> | No | Frequency of notifications. Events will be aggregated over this interval. Possible values: 100ms, raw |


```javascript
deribit.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.deribit.com/#book-instrument_name-group-depth-interval  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.deribit.com/#user-orders-instrument_name-raw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchOrders (symbol[, since, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.deribit.com/#chart-trades-instrument_name-resolution  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>deribit</code>](#deribit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.deribit.com/#chart-trades-instrument_name-resolution  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
deribit.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```

