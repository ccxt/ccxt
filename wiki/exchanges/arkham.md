
<a name="arkham" id="arkham"></a>

## arkham{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTime](#fetchtime)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTicker](#fetchticker)
* [fetchTrades](#fetchtrades)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOpenOrders](#fetchopenorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [createOrder](#createorder)
* [fetchMyTrades](#fetchmytrades)
* [fetchAccounts](#fetchaccounts)
* [fetchBalance](#fetchbalance)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchTradingFees](#fetchtradingfees)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchLeverageTiers](#fetchleveragetiers)
* [watchTicker](#watchticker)
* [watchOHLCV](#watchohlcv)
* [watchOrderBook](#watchorderbook)
* [watchTrades](#watchtrades)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://arkm.com/docs#get/public/assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for arkm

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://arkm.com/docs#get/public/pairs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchMarkets ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://arkm.com/docs#get/public/server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchTime ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://arkm.com/docs#get/public/book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the number of order book entries to return, max 50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://arkm.com/docs#get/public/candles  

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
arkham.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchTicker (symbol[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://arkm.com/docs#get/public/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |
| params.method | <code>string</code> | No | method, default: marketPublicGetV1beta3CryptoLocTrades |


```javascript
arkham.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://arkm.com/docs#get/orders/history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
arkham.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://arkm.com/docs#get/orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
arkham.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://arkm.com/docs#post/orders/cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://arkm.com/docs#post/orders/cancel/all  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | cancel alls open orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.cancelAllOrders (symbol[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order on the exchange

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: [An order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://arkm.com/docs#post/orders/new  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| type | <code>string</code> | Yes | "limit" or "market" |
| side | <code>string</code> | Yes | "buy" or "sell" |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.triggerPrice | <code>float</code> | No | price for a trigger (conditional) order |
| params.stopLossPrice | <code>float</code> | No | price for a stoploss order |
| params.takeProfitPrice | <code>float</code> | No | price for a takeprofit order |
| params.triggerDirection | <code>string</code> | No | the direction for trigger orders, 'ascending' or 'descending' |
| params.triggerPriceType | <code>string</code> | No | mark, index or last |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |


```javascript
arkham.createOrder (symbol, type, side, amount[, price, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://arkm.com/docs#get/trades/time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.page_token | <code>string</code> | No | page_token - used for paging |


```javascript
arkham.fetchMyTrades ([symbol, since, limit, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type

**See**: https://arkm.com/docs#get/user  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchAccounts ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for account info

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://arkm.com/docs#get/account/balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchBalance ([params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://arkm.com/docs#post/account/deposit/addresses/new  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.createDepositAddress (code[, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch the deposit addresses for a currency associated with this account

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a dictionary [address structures](https://docs.ccxt.com/?id=address-structure), indexed by the network

**See**: https://arkm.com/docs#get/account/deposit/addresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://arkm.com/docs#get/account/deposit/addresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://arkm.com/docs#get/account/deposits  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchDeposits (code[, since, limit, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/?id=fee-structure) indexed by market symbols

**See**: https://arkm.com/docs#get/account/fees  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |


```javascript
arkham.fetchTradingFees ([params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://arkm.com/docs#get/account/funding-rate-payments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
arkham.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://arkm.com/docs#get/account/leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://arkm.com/docs#post/account/leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.setLeverage (leverage, symbol[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://arkm.com/docs#get/public/margin-schedules  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.fetchLeverageTiers (symbols[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://arkm.com/docs#stream/ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.watchTicker (symbol[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://arkm.com/docs#stream/candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://arkm.com/docs#stream/l2_updates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.watchOrderBook (symbol[, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://arkm.com/docs#stream/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.watchTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://arkm.com/docs#stream/balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>str</code> | No | spot or contract if not provided this.options['defaultType'] is used |


```javascript
arkham.watchBalance ([params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://arkm.com/docs#stream/positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
arkham.watchPositions ([symbols, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>arkham</code>](#arkham)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://arkm.com/docs#stream/order_statuses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
arkham.watchOrders (symbol[, since, limit, params])
```

