
<a name="bitvavo" id="bitvavo"></a>

## bitvavo{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [fetchDepositAddress](#fetchdepositaddress)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchMyTrades](#fetchmytrades)
* [withdraw](#withdraw)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchTrades](#watchtrades)
* [watchOHLCV](#watchohlcv)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelAllOrdersWs](#cancelallordersws)
* [fetchOrderWs](#fetchorderws)
* [fetchOrdersWs](#fetchordersws)
* [fetchOpenOrdersWs](#fetchopenordersws)
* [fetchMyTradesWs](#fetchmytradesws)
* [withdrawWs](#withdrawws)
* [fetchWithdrawalsWs](#fetchwithdrawalsws)
* [fetchOHLCVWs](#fetchohlcvws)
* [fetchDepositsWs](#fetchdepositsws)
* [fetchTradingFeesWs](#fetchtradingfeesws)
* [fetchMarketsWs](#fetchmarketsws)
* [fetchCurrenciesWs](#fetchcurrenciesws)
* [fetchBalanceWs](#fetchbalancews)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchTime ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bitvavo

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.bitvavo.com/#tag/General/paths/~1markets/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.bitvavo.com/#tag/General/paths/~1assets/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchCurrencies ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.bitvavo.com/#tag/Market-Data/paths/~1ticker~124h/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.bitvavo.com/#tag/Market-Data/paths/~1{market}~1trades/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitvavo.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1account/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchTradingFees ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.bitvavo.com/#tag/Market-Data/paths/~1{market}~1book/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.bitvavo.com/#tag/Market-Data/paths/~1{market}~1candles/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitvavo.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1balance/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchBalance ([params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchDepositAddress (code[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Trading-endpoints/paths/~1order/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", or "PO" |
| params.stopPrice | <code>float</code> | No | Alias for triggerPrice |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.postOnly | <code>bool</code> | No | If true, the order will only be posted to the order book and not executed immediately |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.triggerType | <code>string</code> | No | "price" |
| params.triggerReference | <code>string</code> | No | "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order |
| params.selfTradePrevention | <code>string</code> | No | "decrementAndCancel", "cancelOldest", "cancelNewest", "cancelBoth" |
| params.disableMarketProtection | <code>bool</code> | No | don't cancel if the next fill price is 10% worse than the best fill price |
| params.responseRequired | <code>bool</code> | No | Set this to 'false' when only an acknowledgement of success or failure is required, this is faster. |


```javascript
bitvavo.createOrder (symbol, type, side, amount, price[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1order/put  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.editOrder (id, symbol, type, side[, amount, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.bitvavo.com/#tag/Orders/paths/~1order/delete
- https://docs.bitvavo.com/#tag/Trading-endpoints/paths/~1order/delete


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1orders/delete  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.cancelAllOrders (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Trading-endpoints/paths/~1order/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Trading-endpoints/paths/~1orders/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
bitvavo.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Trading-endpoints/paths/~1ordersOpen/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.bitvavo.com/#tag/Trading-endpoints/paths/~1trades/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitvavo.fetchMyTrades (symbol[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.withdraw (code, amount, address, tag[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1withdrawalHistory/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1depositHistory/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchDeposits (code[, since, limit, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.bitvavo.com/#tag/General/paths/~1assets/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.fetchDepositWithdrawFees (codes[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.bitvavo.com/#tag/Market-data-subscription-WebSocket/paths/~1subscribeTicker24h/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.bitvavo.com/#tag/Market-data-subscription-WebSocket/paths/~1subscribeTicker24h/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchTickers ([symbols, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.bitvavo.com/#tag/Market-data-subscription-WebSocket/paths/~1subscribeTicker24h/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchBidsAsks (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchTrades (symbol[, since, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitvavo.watchMyTrades (symbol[, since, limit, params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1order/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", or "PO" |
| params.stopPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.postOnly | <code>bool</code> | No | If true, the order will only be posted to the order book and not executed immediately |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.triggerType | <code>string</code> | No | "price" |
| params.triggerReference | <code>string</code> | No | "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order |
| params.selfTradePrevention | <code>string</code> | No | "decrementAndCancel", "cancelOldest", "cancelNewest", "cancelBoth" |
| params.disableMarketProtection | <code>bool</code> | No | don't cancel if the next fill price is 10% worse than the best fill price |
| params.responseRequired | <code>bool</code> | No | Set this to 'false' when only an acknowledgement of success or failure is required, this is faster. |


```javascript
bitvavo.createOrderWs (symbol, type, side, amount, price[, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1order/put  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.editOrderWs (id, symbol, type, side[, amount, price, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1order/delete  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.cancelOrderWs (id, symbol[, params])
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1orders/delete  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.cancelAllOrdersWs (symbol[, params])
```


<a name="fetchOrderWs" id="fetchorderws"></a>

### fetchOrderWs{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/General/paths/~1assets/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchOrderWs (id, symbol[, params])
```


<a name="fetchOrdersWs" id="fetchordersws"></a>

### fetchOrdersWs{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.bitvavo.com/#tag/Orders/paths/~1orders/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of  orde structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchOrdersWs (symbol[, since, limit, params])
```


<a name="fetchOpenOrdersWs" id="fetchopenordersws"></a>

### fetchOpenOrdersWs{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchOpenOrdersWs (symbol[, since, limit, params])
```


<a name="fetchMyTradesWs" id="fetchmytradesws"></a>

### fetchMyTradesWs{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.bitvavo.com/#tag/Trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchMyTradesWs (symbol[, since, limit, params])
```


<a name="withdrawWs" id="withdrawws"></a>

### withdrawWs{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.withdrawWs (code, amount, address, tag[, params])
```


<a name="fetchWithdrawalsWs" id="fetchwithdrawalsws"></a>

### fetchWithdrawalsWs{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1withdrawalHistory/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchWithdrawalsWs (code[, since, limit, params])
```


<a name="fetchOHLCVWs" id="fetchohlcvws"></a>

### fetchOHLCVWs{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.bitvavo.com/#tag/Market-Data/paths/~1{market}~1candles/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchOHLCVWs (symbol, timeframe[, since, limit, params])
```


<a name="fetchDepositsWs" id="fetchdepositsws"></a>

### fetchDepositsWs{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1depositHistory/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchDepositsWs (code[, since, limit, params])
```


<a name="fetchTradingFeesWs" id="fetchtradingfeesws"></a>

### fetchTradingFeesWs{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1account/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchTradingFeesWs ([params])
```


<a name="fetchMarketsWs" id="fetchmarketsws"></a>

### fetchMarketsWs{docsify-ignore}
retrieves data on all markets for bitvavo

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.bitvavo.com/#tag/General/paths/~1markets/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |


```javascript
bitvavo.fetchMarketsWs ([params])
```


<a name="fetchCurrenciesWs" id="fetchcurrenciesws"></a>

### fetchCurrenciesWs{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.bitvavo.com/#tag/General/paths/~1assets/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchCurrenciesWs ([params])
```


<a name="fetchBalanceWs" id="fetchbalancews"></a>

### fetchBalanceWs{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitvavo</code>](#bitvavo)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/en/latest/manual.html?#balance-structure)

**See**: https://docs.bitvavo.com/#tag/Account/paths/~1balance/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |


```javascript
bitvavo.fetchBalanceWs ([params])
```

