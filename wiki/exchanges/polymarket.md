
<a name="polymarket" id="polymarket"></a>

## polymarket{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchBidsAsks](#fetchbidsasks)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchTradingFees](#fetchtradingfees)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [editOrder](#editorder)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchMyTrades](#fetchmytrades)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [fetchLeverage](#fetchleverage)
* [fetchMarginMode](#fetchmarginmode)
* [setLeverage](#setleverage)
* [setMarginMode](#setmarginmode)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [createProxyCredentials](#createproxycredentials)

<a name="polymarket" id="polymarket"></a>

### polymarket{docsify-ignore}
Polymarket perpetual futures - a hybrid dex with an off-chain order book and on-chain settlement of collateral. The venue trades linear perpetual contracts on crypto, indices, equities and commodities, quoted using USD and collateralized exclusively with pUSD. The prediction-market CLOB is a separate product, integrated separately under ccxt.prediction.polymarket



```javascript
polymarket.polymarket ()
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTime (params?)
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange api

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchStatus (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange - every instrument base, the usd quote and the collateral asset

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchCurrencies (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for polymarket perps

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchMarkets (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market, merging the ticker, statistics and best bid and ask endpoints

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTicker (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market, merging the ticker, statistics and best bid and ask endpoints

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTickers (symbols?, params?)
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the best bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchBidsAsks (symbols?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return, must be one of 10, 100, 500 or 1000, the default is 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of the most recent trades for a particular symbol

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to fetch, the venue serves at most 100 per request |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch |


```javascript
polymarket.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, the venue serves at most 1000 per request |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling the endpoint multiple times |


```javascript
polymarket.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchFundingRate (symbol, params?)
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetches the current funding rates for multiple markets

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a dictionary of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchFundingRates (symbols?, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of funding rate structures to fetch, the venue serves at most 100 per request |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling the endpoint multiple times |


```javascript
polymarket.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOpenInterest (symbol, params?)
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
retrieves the open interest of multiple contract trading pairs

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a dictionary of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.polymarket.com/perps/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOpenInterests (symbols?, params?)
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetches the default trading fees for multiple markets

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://docs.polymarket.com/perps/learn-about-trading/fees  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchTradingFees (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit', a market order executes like an immediate-or-cancel order without a price |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price to fulfill the order at, a market order accepts one to act like a protective bound |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK' or 'PO' |
| params.postOnly | <code>bool</code> | No | true to place a maker only order |
| params.reduceOnly | <code>bool</code> | No | true to reduce an open position only |
| params.clientOrderId | <code>string</code> | No | a client order id, exactly 32 lowercase hex characters |
| params.exp | <code>int</code> | No | expiry timestamp of the signed command in ms, bounds how long the gateway may hold the request |


```javascript
polymarket.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders in one signed batch

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.exp | <code>int</code> | No | expiry timestamp of the signed command in ms, bounds how long the gateway may hold the request |


```javascript
polymarket.createOrders (orders, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | not used by polymarket cancelOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | cancel by the client order id instead of the exchange order id |


```javascript
polymarket.cancelOrder (id, symbol?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders in one signed batch

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | not used by polymarket cancelOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | cancel by client order ids instead of the exchange order ids |


```javascript
polymarket.cancelOrders (ids, symbol?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders, optionally scoped to a single market

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list with the raw acknowledgement of the venue

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, cancels the orders of every market when omitted |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.cancelAllOrders (symbol?, params?)
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
arms or clears a dead man's switch that cancels every open order once the deadline passes

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the raw acknowledgement of the venue

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer, the venue requires at least 5 seconds |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.cancelAllOrdersAfter (timeout, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a resting standalone gtc limit order, only the price and the total quantity can change

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| type | <code>string</code> | Yes | not used by polymarket editOrder |
| side | <code>string</code> | Yes | not used by polymarket editOrder |
| amount | <code>float</code> | Yes | the new total order quantity, it must exceed the already filled quantity |
| price | <code>float</code> | Yes | the new order price |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.editOrder (id, symbol, type, side, amount, price, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for the account equity, the free order margin and the used initial margin

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchBalance (params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchPositions (symbols?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchPosition (symbol, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | not sent to the venue, applied client-side |
| limit | <code>int</code> | No | the maximum number of open order structures to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches the latest known snapshot of up to one hundred orders

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | not sent to the venue, applied client-side |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest order |
| params.clientOrderId | <code>string</code> | No | fetch the order with this client order id only |


```javascript
polymarket.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | not used by polymarket fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchOrder (id, symbol?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, the venue serves fills of every market, filtered client-side |
| since | <code>int</code> | No | timestamp in ms of the earliest trade |
| limit | <code>int</code> | No | the maximum number of trade structures to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade |
| params.cursor | <code>string</code> | No | opaque pagination cursor returned by the previous page |


```javascript
polymarket.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the funding payments paid and received on the open positions of the account

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest funding payment |
| limit | <code>int</code> | No | the maximum number of funding payment structures to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding payment |


```javascript
polymarket.fetchFundingHistory (symbol?, since?, limit?, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to the account

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.polymarket.com/perps/fund-your-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit |
| limit | <code>int</code> | No | the maximum number of transaction structures to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest deposit |


```javascript
polymarket.fetchDeposits (code?, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from the account

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.polymarket.com/perps/fund-your-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest withdrawal |
| limit | <code>int</code> | No | the maximum number of transaction structures to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest withdrawal |


```javascript
polymarket.fetchWithdrawals (code?, since?, limit?, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
withdraw the collateral asset to the polymarket wallet of the account, the request is signed by the wallet key with the withdraw struct of the deposit contract

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.polymarket.com/perps/fund-your-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.withdraw (code, amount, address, params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the leverage and the margin mode configured for a market

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchLeverage (symbol, params?)
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode configured for a market

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.fetchMarginMode (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market, optionally switching the margin mode at the same time

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the raw acknowledgement of the venue

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', the venue keeps the current mode when omitted is not supported - the default is cross |


```javascript
polymarket.setLeverage (leverage, symbol, params?)
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set the margin mode of a market, the venue updates the mode and the leverage together

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the raw acknowledgement of the venue

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>float</code> | Yes | the rate of leverage to set together with the mode |


```javascript
polymarket.setMarginMode (marginMode, symbol?, params?)
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin to an isolated position

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.addMargin (symbol, amount, params?)
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from an isolated position

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://docs.polymarket.com/perps/trading  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.reduceMargin (symbol, amount, params?)
```


<a name="createProxyCredentials" id="createproxycredentials"></a>

### createProxyCredentials{docsify-ignore}
provisions fresh trading session credentials - generates a proxy keypair, registers it with an EIP-712 CreateProxy message signed by the wallet key and caches the returned secret, the venue keeps the session valid for the requested lifetime

**Kind**: instance method of [<code>polymarket</code>](#polymarket)  
**Returns**: <code>object</code> - the session credentials, holding the proxy address, the proxy private key, the secret and the expiry timestamp

**See**: https://docs.polymarket.com/perps/authenticated-sessions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
polymarket.createProxyCredentials (params?)
```

