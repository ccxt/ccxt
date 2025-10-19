
<a name="coincatch" id="coincatch"></a>

## coincatch{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchBalance](#fetchbalance)
* [transfer](#transfer)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [createSpotOrder](#createspotorder)
* [createSwapOrder](#createswaporder)
* [createOrderWithTakeProfitAndStopLoss](#createorderwithtakeprofitandstoploss)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMarginMode](#fetchmarginmode)
* [setMarginMode](#setmarginmode)
* [fetchPositionMode](#fetchpositionmode)
* [setPositionMode](#setpositionmode)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchPosition](#fetchposition)
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)
* [fetchPositions](#fetchpositions)
* [fetchLedger](#fetchledger)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [watchBalance](#watchbalance)
* [watchOrders](#watchorders)
* [watchPositions](#watchpositions)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://coincatch.github.io/github.io/en/spot/#get-server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://coincatch.github.io/github.io/en/spot/#get-coin-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchCurrencies ([params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#get-coin-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code> | No | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchDepositWithdrawFees ([codes, params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for the exchange

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://coincatch.github.io/github.io/en/spot/#get-all-tickers
- https://coincatch.github.io/github.io/en/mix/#get-all-symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-single-ticker
- https://coincatch.github.io/github.io/en/mix/#get-single-symbol-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-all-tickers
- https://coincatch.github.io/github.io/en/mix/#get-all-symbol-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' (default 'spot') |
| params.productType | <code>string</code> | No | 'umcbl' or 'dmcbl' (default 'umcbl') - USDT perpetual contract or Universal margin perpetual contract |


```javascript
coincatch.fetchTickers ([symbols, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://coincatch.github.io/github.io/en/spot/#get-merged-depth-data
- https://coincatch.github.io/github.io/en/mix/#get-merged-depth-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (maximum and default value is 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.precision | <code>string</code> | No | 'scale0' (default), 'scale1', 'scale2' or 'scale3' - price accuracy, according to the selected accuracy as the step size to return the cumulative depth |


```javascript
coincatch.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://coincatch.github.io/github.io/en/spot/#get-candle-data
- https://coincatch.github.io/github.io/en/mix/#get-candle-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (default 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.price | <code>string</code> | No | "mark" for mark price candles |


```javascript
coincatch.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-recent-trades
- https://coincatch.github.io/github.io/en/mix/#get-fills


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest entry to fetch |


```javascript
coincatch.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-current-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-history-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of entries to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.pageNo | <code>int</code> | No | the page number to fetch |
| params.nextPage | <code>bool</code> | No | whether to query the next page (default false) |


```javascript
coincatch.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#get-account-assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch balance for (default 'spot') |
| params.productType | <code>string</code> | No | *swap only* 'umcbl' or 'dmcbl' (default 'umcbl') |


```javascript
coincatch.fetchBalance ([params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | 'spot' or 'swap' or 'mix_usdt' or 'mix_usd' - account to transfer from |
| toAccount | <code>string</code> | Yes | 'spot' or 'swap' or 'mix_usdt' or 'mix_usd' - account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the transfer |


```javascript
coincatch.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#get-coin-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | network for fetch deposit address |


```javascript
coincatch.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#get-deposit-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (not used by exchange) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |
| params.pageNo | <code>int</code> | No | pageNo default 1 |
| params.pageSize | <code>int</code> | No | pageSize (default 20, max 100) |


```javascript
coincatch.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#get-withdraw-list-v2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |
| params.clientOid | <code>string</code> | No | clientOid |
| params.orderId | <code>string</code> | No | The response orderId |
| params.idLessThan | <code>string</code> | No | Requests the content on the page before this ID (older data), the value input should be the orderId of the corresponding interface. |


```javascript
coincatch.fetchWithdrawals (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | Yes | network for withdraw (mandatory) |
| params.remark | <code>string</code> | No | remark |
| params.clientOid | <code>string</code> | No | custom id |


```javascript
coincatch.withdraw (code, amount, address[, tag, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#place-order
- https://coincatch.github.io/github.io/en/spot/#place-plan-order
- https://coincatch.github.io/github.io/en/mix/#place-order
- https://coincatch.github.io/github.io/en/mix/#place-plan-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hedged | <code>bool</code> | No | *swap markets only* must be set to true if position mode is hedged (default false) |
| params.cost | <code>float</code> | No | *spot market buy only* the quote quantity that can be used as an alternative for the amount |
| params.triggerPrice | <code>float</code> | No | the price that the order is to be triggered |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK' or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order - is mandatory for swap |


```javascript
coincatch.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createSpotOrder" id="createspotorder"></a>

### createSpotOrder{docsify-ignore}
create a trade order on spot market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#place-order
- https://coincatch.github.io/github.io/en/spot/#place-plan-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *market buy only* the quote quantity that can be used as an alternative for the amount |
| params.triggerPrice | <code>float</code> | No | the price that the order is to be triggered at |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK' or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order (max length 40) |


```javascript
coincatch.createSpotOrder (symbol, type, side, amount[, price, params])
```


<a name="createSwapOrder" id="createswaporder"></a>

### createSwapOrder{docsify-ignore}
create a trade order on swap market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/mix/#place-order
- https://coincatch.github.io/github.io/en/mix/#place-plan-order
- https://coincatch.github.io/github.io/en/mix/#place-stop-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hedged | <code>bool</code> | No | must be set to true if position mode is hedged (default false) |
| params.postOnly | <code>bool</code> | No | *non-trigger orders only* if true, the order will only be posted to the order book and not executed immediately |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce only |
| params.timeInForce | <code>string</code> | No | *non-trigger orders only* 'GTC', 'FOK', 'IOC' or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.triggerPrice | <code>float</code> | No | the price that the order is to be triggered at |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |


```javascript
coincatch.createSwapOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrderWithTakeProfitAndStopLoss" id="createorderwithtakeprofitandstoploss"></a>

### createOrderWithTakeProfitAndStopLoss{docsify-ignore}
*swap markets only* create an order with a stop loss or take profit attached (type 3)

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency or the number of contracts |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, ignored in market orders |
| takeProfit | <code>float</code> | No | the take profit price, in units of the quote currency |
| stopLoss | <code>float</code> | No | the stop loss price, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.createOrderWithTakeProfitAndStopLoss (symbol, type, side, amount[, price, takeProfit, stopLoss, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders (all orders should be of the same symbol)

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#batch-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params (max 50 entries) |
| params | <code>object</code> | No | extra parameters specific to the api endpoint |


```javascript
coincatch.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade trigger, stop-looss or take-profit order

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#modify-plan-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user (non-trigger orders only)

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-order-details
- https://coincatch.github.io/github.io/en/mix/#get-order-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in (is mandatory for swap) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot') |
| params.clientOrderId | <code>string</code> | No | a unique id for the order that can be used as an alternative for the id |


```javascript
coincatch.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-order-list
- https://coincatch.github.io/github.io/en/spot/#get-current-plan-orders
- https://coincatch.github.io/github.io/en/mix/#get-open-order
- https://coincatch.github.io/github.io/en/mix/#get-all-open-order
- https://coincatch.github.io/github.io/en/mix/#get-plan-order-tpsl-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true if fetching trigger orders (default false) |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot') |
| params.productType | <code>string</code> | No | *swap only* 'umcbl' or 'dmcbl' - the product type of the market to fetch entries for (default 'umcbl') |
| params.marginCoin | <code>string</code> | No | *swap only* the margin coin of the market to fetch entries for |
| params.isPlan | <code>string</code> | No | *swap trigger only* 'plan' or 'profit_loss' ('plan' (default) for trigger (plan) orders, 'profit_loss' for stop-loss and take-profit orders) |


```javascript
coincatch.fetchOpenOrders ([symbol, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-order-list
- https://coincatch.github.io/github.io/en/spot/#get-history-plan-orders
- https://coincatch.github.io/github.io/en/mix/#get-history-orders
- https://coincatch.github.io/github.io/en/mix/#get-producttype-history-orders
- https://coincatch.github.io/github.io/en/mix/#get-history-plan-orders-tpsl


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | *is mandatory* unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.trigger | <code>boolean</code> | No | true if fetching trigger orders (default false) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' or 'profit_loss' ('plan' (default) for trigger (plan) orders, 'profit_loss' for stop-loss and take-profit orders) |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot') |
| params.productType | <code>string</code> | No | *swap only* 'umcbl' or 'dmcbl' - the product type of the market to fetch entries for (default 'umcbl') |


```javascript
coincatch.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#cancel-order-v2
- https://coincatch.github.io/github.io/en/spot/#cancel-plan-order
- https://coincatch.github.io/github.io/en/mix/#cancel-order
- https://coincatch.github.io/github.io/en/mix/#cancel-plan-order-tpsl


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order that can be used as an alternative for the id |
| params.trigger | <code>bool</code> | No | true for canceling a trigger order (default false) |
| params.stop | <code>bool</code> | No | *swap only* an alternative for trigger param |
| params.planType | <code>string</code> | No | *swap trigger only* the type of the plan order to cancel: 'profit_plan' - profit order, 'loss_plan' - loss order, 'normal_plan' - plan order, 'pos_profit' - position profit, 'pos_loss' - position loss, 'moving_plan' - Trailing TP/SL, 'track_plan' - Trailing Stop |


```javascript
coincatch.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://coincatch.github.io/github.io/en/spot/#cancel-all-orders
- https://coincatch.github.io/github.io/en/spot/#batch-cancel-plan-orders
- https://coincatch.github.io/github.io/en/mix/#batch-cancel-order
- https://coincatch.github.io/github.io/en/mix/#cancel-order-by-symbol
- https://coincatch.github.io/github.io/en/mix/#cancel-plan-order-tpsl-by-symbol
- https://coincatch.github.io/github.io/en/mix/#cancel-all-trigger-order-tpsl


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market the orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' - the type of the market to cancel orders for (default 'spot') |
| params.trigger | <code>bool</code> | No | true for canceling a trigger orders (default false) |
| params.productType | <code>string</code> | No | *swap only (if symbol is not provided* 'umcbl' or 'dmcbl' - the product type of the market to cancel orders for (default 'umcbl') |
| params.marginCoin | <code>string</code> | No | *mandatory for swap non-trigger dmcb (if symbol is not provided)* the margin coin of the market to cancel orders for |
| params.planType | <code>string</code> | No | *swap trigger only* the type of the plan order to cancel: 'profit_plan' - profit order, 'loss_plan' - loss order, 'normal_plan' - plan order, 'pos_profit' - position profit, 'pos_loss' - position loss, 'moving_plan' - Trailing TP/SL, 'track_plan' - Trailing Stop |


```javascript
coincatch.cancelAllOrders ([symbol, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple non-trigger orders

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#cancel-order-in-batch-v2-single-instruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | *is mandatory* unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids |


```javascript
coincatch.cancelOrders (ids, symbol[, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#trade-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-transaction-details
- https://coincatch.github.io/github.io/en/mix/#get-order-fill-detail
- https://coincatch.github.io/github.io/en/mix/#get-producttype-order-fill-detail


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | *is mandatory* unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | *swap markets only* the latest time in ms to fetch trades for, only supports the last 30 days timeframe |
| params.lastEndId | <code>string</code> | No | *swap markets only* query the data after this tradeId |


```javascript
coincatch.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#get-transaction-details  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of the trading pair

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-single-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchMarginMode (symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://coincatch.github.io/github.io/en/mix/#change-margin-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.setMarginMode (marginMode, symbol[, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://coincatch.github.io/github.io/en/mix/#get-single-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch entry for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchPositionMode (symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Set%20Position%20Mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch entry for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | 'umcbl' or 'dmcbl' (default 'umcbl' if symbol is not provided) |


```javascript
coincatch.setPositionMode (hedged, symbol[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-single-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | *for isolated margin mode with hedged position mode only* 'long' or 'short' |


```javascript
coincatch.setLeverage (leverage, symbol[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#change-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | *for isolated margin mode with hedged position mode only* 'long' or 'short' |


```javascript
coincatch.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#change-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | *for isolated margin mode with hedged position mode only* 'long' or 'short' |


```javascript
coincatch.addMargin (symbol, amount[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-symbol-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | 'long' or 'short' *for non-hedged position mode only* (default 'long') |


```javascript
coincatch.fetchPosition (symbol[, params])
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
fetch all open positions for specific symbol

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-symbol-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.fetchPositionsForSymbol (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#get-all-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols (all symbols must belong to the same product type) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | 'umcbl' or 'dmcbl' (default 'umcbl' if symbols are not provided) |
| params.marginCoin | <code>string</code> | No | the settle currency of the positions, needs to match the productType |


```javascript
coincatch.fetchPositions ([symbols, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered balance of the user

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**

- https://coincatch.github.io/github.io/en/spot/#get-bills
- https://coincatch.github.io/github.io/en/mix/#get-business-account-bill


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entrys to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | *swap only* the latest time in ms to fetch entries for |
| params.type | <code>string</code> | No | 'spot' or 'swap' (default 'spot') |
| params.after | <code>string</code> | No | *spot only* billId, return the data less than this billId |
| params.before | <code>string</code> | No | *spot only* billId, return the data greater than or equals to this billId |
| params.groupType | <code>string</code> | No | *spot only* |
| params.bizType | <code>string</code> | No | *spot only* |
| params.productType | <code>string</code> | No | *swap only* 'umcbl' or 'dmcbl' (default 'umcbl' or 'dmcbl' if code is provided and code is not equal to 'USDT') |
| params.business | <code>string</code> | No | *swap only* |
| params.lastEndId | <code>string</code> | No | *swap only* |
| params.next | <code>bool</code> | No | *swap only* |


```javascript
coincatch.fetchLedger ([code, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | the type of the instrument to fetch the ticker for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP') |


```javascript
coincatch.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unsubscribe from the ticker channel

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://coincatch.github.io/github.io/en/mix/#tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#tickers-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to watch the tickers for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.watchTickers (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://coincatch.github.io/github.io/en/spot/#candlesticks-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch (not including) |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (not including) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.instType | <code>bool</code> | No | the type of the instrument to fetch the OHLCV data for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP') |


```javascript
coincatch.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unsubscribe from the ohlcv channel

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ohlcv for |
| timeframe |  | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://coincatch.github.io/github.io/en/spot/#depth-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://coincatch.github.io/github.io/en/spot/#depth-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |


```javascript
coincatch.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://coincatch.github.io/github.io/en/spot/#depth-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols |  | Yes |  |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://coincatch.github.io/github.io/en/spot/#trades-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://coincatch.github.io/github.io/en/spot/#trades-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols |  | Yes |  |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://coincatch.github.io/github.io/en/spot/#trades-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.unWatchTrades (symbol[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#account-channel
- https://coincatch.github.io/github.io/en/mix/#account-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>str</code> | No | 'spot' or 'swap' (default is 'spot') |
| params.instType | <code>string</code> | No | *swap only* 'umcbl' or 'dmcbl' (default is 'umcbl') |


```javascript
coincatch.watchBalance ([params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://coincatch.github.io/github.io/en/spot/#order-channel
- https://coincatch.github.io/github.io/en/mix/#order-channel
- https://coincatch.github.io/github.io/en/mix/#plan-order-channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' |
| params.instType | <code>string</code> | No | *swap only* 'umcbl' or 'dmcbl' (default is 'umcbl') |
| params.trigger | <code>bool</code> | No | *swap only* whether to watch trigger orders (default is false) |


```javascript
coincatch.watchOrders (symbol[, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>coincatch</code>](#coincatch)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://coincatch.github.io/github.io/en/mix/#positions-channel  

| Param | Type | Description |
| --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | list of unified market symbols |
| since |  |  |
| limit |  |  |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
coincatch.watchPositions (symbols, since, limit, params[])
```

