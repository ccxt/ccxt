
<a name="bitteam" id="bitteam"></a>

## bitteam{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrderBook](#fetchorderbook)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bitteam

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://bit.team/trade/api/documentation#/CCXT/getTradeApiCcxtPairs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |


```javascript
bitteam.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiCurrencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchCurrencies ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure) indexed by market symbols

**See**: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcOrderbookPair  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default 100, max 200) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of  orde structures to retrieve (default 10) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |
| params.type | <code>string</code> | No | the status of the order - 'active', 'closed', 'cancelled', 'all', 'history' (default 'all') |


```javascript
bitteam.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - An [order structure](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrderId  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>int</code>, <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by bitteam fetchOrder () |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve (default 10) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of closed order structures to retrieve (default 10) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - a list of [order structures](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of canceled order structures to retrieve (default 10) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - an [order structure](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtOrdercreate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - An [order structure](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by bitteam cancelOrder () |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel open orders of market

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelallorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.cancelAllOrders (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure)

**See**: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcSummary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - a [ticker structure](https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure)

**See**: https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairName  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchTicker (symbol[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#public-trades)

**See**: https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcTradesPair  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#trade-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtTradesofuser  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve (default 10) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet

**Kind**: instance method of [<code>bitteam</code>](#bitteam)  
**Returns**: <code>object</code> - a list of [transaction structure](https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure)

**See**: https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiTransactionsofuser  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return (default 10) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |


```javascript
bitteam.fetchDepositsWithdrawals ([code, since, limit, params])
```

