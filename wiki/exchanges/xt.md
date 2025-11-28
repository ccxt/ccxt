
<a name="xt" id="xt"></a>

## xt{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchBidsAsks](#fetchbidsasks)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [fetchLedger](#fetchledger)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [setLeverage](#setleverage)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [transfer](#transfer)
* [setMarginMode](#setmarginmode)
* [editOrder](#editorder)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the xt server

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the xt server

**See**: https://doc.xt.com/#market1serverInfo  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchTime (params, [undefined])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://doc.xt.com/#deposit_withdrawalsupportedCurrenciesGet  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchCurrencies (params, [undefined])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for xt

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://doc.xt.com/#market2symbol
- https://doc.xt.com/#futures_quotesgetSymbols


| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchMarkets (params, [undefined])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://doc.xt.com/#market4kline
- https://doc.xt.com/#futures_quotesgetKLine


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
xt.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/en/latest/manual.html#order-book-structure) indexed by market symbols

**See**

- https://doc.xt.com/#market3depth
- https://doc.xt.com/#futures_quotesgetDepth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/en/latest/manual.html#ticker-structure)

**See**

- https://doc.xt.com/#market10ticker24h
- https://doc.xt.com/#futures_quotesgetAggTicker


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol to fetch the ticker for |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchTicker (symbol, params[])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - an array of [ticker structures](https://docs.ccxt.com/en/latest/manual.html#ticker-structure)

**See**

- https://doc.xt.com/#market10ticker24h
- https://doc.xt.com/#futures_quotesgetAggTickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchTickers ([symbols, params])
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/en/latest/manual.html#ticker-structure)

**See**: https://doc.xt.com/#market9tickerBook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | No | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchBidsAsks ([symbols, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/en/latest/manual.html?#public-trades)

**See**

- https://doc.xt.com/#market5tradeRecent
- https://doc.xt.com/#futures_quotesgetDeal


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/en/latest/manual.html?#public-trades)

**See**

- https://doc.xt.com/#tradetradeGet
- https://doc.xt.com/#futures_ordergetTrades


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchMyTrades ([symbol, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/en/latest/manual.html?#balance-structure)

**See**

- https://doc.xt.com/#balancebalancesGet
- https://doc.xt.com/#futures_usergetBalances


| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchBalance (params, [undefined])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://doc.xt.com/#orderorderPost  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
xt.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderorderPost
- https://doc.xt.com/#futures_ordercreate
- https://doc.xt.com/#futures_entrustcreatePlan
- https://doc.xt.com/#futures_entrustcreateProfit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, can be ignored in market orders |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK' or 'GTX' |
| params.entrustType | <code>string</code> | No | 'TAKE_PROFIT', 'STOP', 'TAKE_PROFIT_MARKET', 'STOP_MARKET', 'TRAILING_STOP_MARKET', required if stopPrice is defined, currently isn't functioning on xt's side |
| params.triggerPriceType | <code>string</code> | No | 'INDEX_PRICE', 'MARK_PRICE', 'LATEST_PRICE', required if stopPrice is defined |
| params.triggerPrice | <code>float</code> | No | price to trigger a stop order |
| params.stopPrice | <code>float</code> | No | alias for triggerPrice |
| params.stopLoss | <code>float</code> | No | price to set a stop-loss on an open position |
| params.takeProfit | <code>float</code> | No | price to set a take-profit on an open position |


```javascript
xt.createOrder (symbol, type, side, amount[, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderorderGet
- https://doc.xt.com/#futures_ordergetById
- https://doc.xt.com/#futures_entrustgetPlanById
- https://doc.xt.com/#futures_entrustgetProfitById


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |
| params.stopLossTakeProfit | <code>bool</code> | No | if the order is a stop-loss or take-profit order |


```javascript
xt.fetchOrder (id[, symbol, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderhistoryOrderGet
- https://doc.xt.com/#futures_ordergetHistory
- https://doc.xt.com/#futures_entrustgetPlanHistory


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |


```javascript
xt.fetchOrders ([symbol, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderopenOrderGet
- https://doc.xt.com/#futures_ordergetOrders
- https://doc.xt.com/#futures_entrustgetPlan
- https://doc.xt.com/#futures_entrustgetProfit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |
| params.stopLossTakeProfit | <code>bool</code> | No | if the order is a stop-loss or take-profit order |


```javascript
xt.fetchOpenOrders ([symbol, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderhistoryOrderGet
- https://doc.xt.com/#futures_ordergetOrders
- https://doc.xt.com/#futures_entrustgetPlan
- https://doc.xt.com/#futures_entrustgetProfit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |
| params.stopLossTakeProfit | <code>bool</code> | No | if the order is a stop-loss or take-profit order |


```javascript
xt.fetchClosedOrders ([symbol, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderhistoryOrderGet
- https://doc.xt.com/#futures_ordergetOrders
- https://doc.xt.com/#futures_entrustgetPlan
- https://doc.xt.com/#futures_entrustgetProfit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |
| params.stopLossTakeProfit | <code>bool</code> | No | if the order is a stop-loss or take-profit order |


```javascript
xt.fetchCanceledOrders ([symbol, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderorderDel
- https://doc.xt.com/#futures_ordercancel
- https://doc.xt.com/#futures_entrustcancelPlan
- https://doc.xt.com/#futures_entrustcancelProfit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |
| params.stopLossTakeProfit | <code>bool</code> | No | if the order is a stop-loss or take-profit order |


```javascript
xt.cancelOrder (id[, symbol, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**

- https://doc.xt.com/#orderopenOrderDel
- https://doc.xt.com/#futures_ordercancelBatch
- https://doc.xt.com/#futures_entrustcancelPlanBatch
- https://doc.xt.com/#futures_entrustcancelProfitBatch


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.trigger | <code>bool</code> | No | if the order is a trigger order or not |
| params.stopLossTakeProfit | <code>bool</code> | No | if the order is a stop-loss or take-profit order |


```javascript
xt.cancelAllOrders ([symbol, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/en/latest/manual.html#order-structure)

**See**: https://doc.xt.com/#orderbatchOrderDel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.cancelOrders (ids[, symbol, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/en/latest/manual.html#ledger-structure)

**See**: https://doc.xt.com/#futures_usergetBalanceBill  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchLedger ([code, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/en/latest/manual.html#address-structure)

**See**: https://doc.xt.com/#deposit_withdrawaldepositAddressGet  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | unified currency code |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |
| params.network | <code>string</code> | required network id |


```javascript
xt.fetchDepositAddress (code, params[])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/en/latest/manual.html#transaction-structure)

**See**: https://doc.xt.com/#deposit_withdrawalhistoryDepositGet  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of transaction structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchDeposits ([code, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/en/latest/manual.html#transaction-structure)

**See**: https://doc.xt.com/#deposit_withdrawalwithdrawHistory  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of transaction structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchWithdrawals ([code, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/en/latest/manual.html#transaction-structure)

**See**: https://doc.xt.com/#deposit_withdrawalwithdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No |  |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.withdraw (code, amount, address[, tag, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://doc.xt.com/#futures_useradjustLeverage  

| Param | Type | Description |
| --- | --- | --- |
| leverage | <code>float</code> | the rate of leverage |
| symbol | <code>string</code> | unified market symbol |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |
| params.positionSide | <code>string</code> | 'LONG' or 'SHORT' |


```javascript
xt.setLeverage (leverage, symbol, params[])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin to a position

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://doc.xt.com/#futures_useradjustMargin  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol |
| amount | <code>float</code> | amount of margin to add |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |
| params.positionSide | <code>string</code> | 'LONG' or 'SHORT' |


```javascript
xt.addMargin (symbol, amount, params[])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://doc.xt.com/#futures_useradjustMargin  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol |
| amount | <code>float</code> | the amount of margin to remove |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |
| params.positionSide | <code>string</code> | 'LONG' or 'SHORT' |


```javascript
xt.reduceMargin (symbol, amount, params[])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage for different trade sizes

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure)

**See**: https://doc.xt.com/#futures_quotesgetLeverageBrackets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | No | a list of unified market symbols |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchLeverageTiers ([symbols, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage for different trade sizes of a single market

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)

**See**: https://doc.xt.com/#futures_quotesgetLeverageBracket  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchMarketLeverageTiers (symbol, params[])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rates

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure)

**See**: https://doc.xt.com/#futures_quotesgetFundingRateRecord  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures] to fetch |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |
| params.paginate | <code>bool</code> | Yes | true/false whether to use the pagination helper to aumatically paginate through the results |


```javascript
xt.fetchFundingRateHistory ([symbol, since, limit, params])
```


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://doc.xt.com/#futures_quotesgetFundingRate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
xt.fetchFundingInterval (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://doc.xt.com/#futures_quotesgetFundingRate  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchFundingRate (symbol, params[])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the funding history

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://doc.xt.com/#futures_usergetFunding  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the starting timestamp in milliseconds |
| limit | <code>int</code> | No | the number of entries to return |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://doc.xt.com/#futures_usergetPosition  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol of the market the position is held in |
| params | <code>object</code> | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchPosition (symbol, params[])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://doc.xt.com/#futures_usergetPosition  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | No | list of unified market symbols, not supported with xt |
| params | <code>object</code> | Yes | extra parameters specific to the xt api endpoint |


```javascript
xt.fetchPositions ([symbols, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://doc.xt.com/#transfersubTransferPost  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | unified currency code |
| amount | <code>float</code> | amount to transfer |
| fromAccount | <code>string</code> | account to transfer from -  spot, swap, leverage, finance |
| toAccount | <code>string</code> | account to transfer to - spot, swap, leverage, finance |
| params | <code>object</code> | extra parameters specific to the whitebit api endpoint |


```javascript
xt.transfer (code, amount, fromAccount, toAccount, params[])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://doc.xt.com/#futures_userchangePositionType  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | No | required |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionSide | <code>string</code> | No | *required* "long" or "short" |


```javascript
xt.setMarginMode (marginMode[, symbol, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
cancels an order and places a new order

**Kind**: instance method of [<code>xt</code>](#xt)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://doc.xt.com/#orderorderUpdate
- https://doc.xt.com/#futures_orderupdate
- https://doc.xt.com/#futures_entrustupdateProfit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stopLoss | <code>float</code> | No | price to set a stop-loss on an open position |
| params.takeProfit | <code>float</code> | No | price to set a take-profit on an open position |


```javascript
xt.editOrder (id, symbol, type, side, amount[, price, params])
```

