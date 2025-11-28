
<a name="phemex" id="phemex"></a>

## phemex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchPositions](#fetchpositions)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchFundingRate](#fetchfundingrate)
* [setMargin](#setmargin)
* [setMarginMode](#setmarginmode)
* [setPositionMode](#setpositionmode)
* [fetchLeverageTiers](#fetchleveragetiers)
* [setLeverage](#setleverage)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [withdraw](#withdraw)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchConvertTradeHistory](#fetchconverttradehistory)
* [watchBalance](#watchbalance)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchTrades](#watchtrades)
* [watchOrderBook](#watchorderbook)
* [watchOHLCV](#watchohlcv)
* [watchMyTrades](#watchmytrades)
* [watchOrders](#watchorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for phemex

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://phemex-docs.github.io/#query-product-information-3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchCurrencies ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querykline
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | *only used for USDT settled contracts, otherwise is emulated and not supported by the exchange* timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | *USDT settled/ linear swaps only* end time in ms |


```javascript
phemex.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query24hrsticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols-2     // spot
- https://phemex-docs.github.io/#query-24-ticker-for-all-symbols             // linear
- https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols       // inverse


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querytrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://phemex-docs.github.io/#query-wallets
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
- https://phemex-docs.github.io/#query-trading-account-and-positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap |
| params.code | <code>string</code> | No | *swap only* currency code of the balance to query (USD, USDT, etc), default is USDT |


```javascript
phemex.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#place-order
- https://phemex-docs.github.io/#place-order-http-put-prefered-3


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>float</code> | No | trigger price for conditional orders |
| params.takeProfit | <code>object</code> | No | *swap only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *swap only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.posSide | <code>string</code> | No | *swap only* "Merged" for one way mode, "Long" for buy side of hedged mode, "Short" for sell side of hedged mode |
| params.hedged | <code>bool</code> | No | *swap only* true for hedged mode, false for one way mode, default is false |


```javascript
phemex.createOrder (symbol, type, side, amount[, price, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#amend-order-by-orderid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.posSide | <code>string</code> | No | either 'Merged' or 'Long' or 'Short' |


```javascript
phemex.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancel-single-order-by-orderid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.posSide | <code>string</code> | No | either 'Merged' or 'Long' or 'Short' |


```javascript
phemex.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancelall  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.cancelAllOrders (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://phemex-docs.github.io/#query-orders-by-ids  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryopenorder
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotListAllOpenOrder


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#queryorder
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedgedd-Perpetual-API.md#query-closed-orders-by-symbol
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotDataOrdersByIds


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.settle | <code>string</code> | No | the settlement currency to fetch orders for |


```javascript
phemex.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-user-trade
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-user-trade
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotDataTradesHist


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the chain name to fetch the deposit address e.g. ETH, TRX, EOS, SOL, etc. |


```javascript
phemex.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-trading-account-and-positions
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
- https://phemex-docs.github.io/#query-account-positions-with-unrealized-pnl


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.code | <code>string</code> | No | the currency code to fetch positions for, USD, BTC or USDT, USDT is the default |
| params.method | <code>string</code> | No | *USDT contracts only* 'privateGetGAccountsAccountPositions' or 'privateGetGAccountsAccountPositions' default is 'privateGetGAccountsAccountPositions' |


```javascript
phemex.fetchPositions ([symbols, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#futureDataFundingFeesHist  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchFundingRate (symbol[, params])
```


<a name="setMargin" id="setmargin"></a>

### setMargin{docsify-ignore}
Either adds or reduces margin in an isolated position in order to set the margin to a specific value

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - A [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#assign-position-balance-in-isolated-marign-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to set margin in |
| amount | <code>float</code> | Yes | the amount to set the margin to |
| params | <code>object</code> | No | parameters specific to the exchange API endpoint |


```javascript
phemex.setMargin (symbol, amount[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://phemex-docs.github.io/#set-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.setMarginMode (marginMode, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#switch-position-mode-synchronously  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by binance setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.setPositionMode (hedged, symbol[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchLeverageTiers (symbols[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#set-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage, 100 > leverage > -100 excluding numbers between -1 to 1 |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hedged | <code>bool</code> | No | set to true if hedged position mode is enabled (by default long and short leverage are set to the same value) |
| params.longLeverageRr | <code>float</code> | No | *hedged mode only* set the leverage for long positions |
| params.shortLeverageRr | <code>float</code> | No | *hedged mode only* set the leverage for short positions |


```javascript
phemex.setLeverage (leverage, symbol[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://phemex-docs.github.io/#transfer-between-spot-and-futures
- https://phemex-docs.github.io/#universal-transfer-main-account-only-transfer-between-sub-to-main-main-to-sub-or-sub-to-sub


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.bizType | <code>string</code> | No | for transferring between main and sub-acounts either 'SPOT' or 'PERPETUAL' default is 'SPOT' |


```javascript
phemex.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://phemex-docs.github.io/#query-transfer-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of  transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchTransfers (code[, since, limit, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://phemex-docs.github.io/#query-funding-rate-history-2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
phemex.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [transaction structure](https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure)

**See**: https://phemex-docs.github.io/#create-withdraw-request  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the phemex api endpoint |
| params.network | <code>string</code> | No | unified network code |


```javascript
phemex.withdraw (code, amount, address, tag[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a trading pair

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://phemex-docs.github.io/#query-24-hours-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
phemex.fetchOpenInterest (symbol[, params])
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetch a quote for converting from one currency to another

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://phemex-docs.github.io/#rfq-quote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | Yes | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.fetchConvertQuote (fromCode, toCode, amount[, params])
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
convert from one currency to another

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://phemex-docs.github.io/#convert  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.createConvertTrade (id, fromCode, toCode[, amount, params])
```


<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

### fetchConvertTradeHistory{docsify-ignore}
fetch the users history of conversion trades

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://phemex-docs.github.io/#query-convert-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve, default 20, max 200 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>string</code> | No | the end time in ms |
| params.fromCurrency | <code>string</code> | No | the currency that you sold and converted from |
| params.toCurrency | <code>string</code> | No | the currency that you bought and converted into |


```javascript
phemex.fetchConvertTradeHistory ([code, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-account-order-position-aop
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-account-order-position-aop
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-wallet-order-messages


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.settle | <code>string</code> | No | set to USDT to use hedged perpetual api |


```javascript
phemex.watchBalance ([params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-24-hours-ticker
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-24-hours-ticker
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-24-hours-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-24-hours-ticker
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-24-hours-ticker
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-24-hours-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |


```javascript
phemex.watchTickers ([symbols, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-trade
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-trade
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-trade


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.watchTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-orderbook
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-orderbook-for-new-model
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-30-levels-orderbook
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-full-orderbook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.watchOrderBook (symbol[, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#subscribe-kline
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#subscribe-kline
- https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#subscribe-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>phemex</code>](#phemex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
phemex.watchOrders (symbol[, since, limit, params])
```

