
<a name="coinmetro" id="coinmetro"></a>

## coinmetro{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchBidsAsks](#fetchbidsasks)
* [fetchBalance](#fetchbalance)
* [fetchLedger](#fetchledger)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [closePosition](#closeposition)
* [fetchOpenOrders](#fetchopenorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOrder](#fetchorder)
* [borrowCrossMargin](#borrowcrossmargin)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#d5876d43-a3fe-4479-8c58-24d0f044edfb  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for coinmetro

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#9fd18008-338e-4863-b07d-722878a46832  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchMarkets ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#13cfb5bc-7bfb-4847-85e1-e0f35dfb3573  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
coinmetro.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ee5d698-06da-4570-8c84-914185e05065  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#4d48ae69-8ee2-44d1-a268-71f84e557b7b  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve (default 500, max 1000) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#26ad80d7-8c46-41b5-9208-386f439a8b87  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default 100, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchTickers ([symbols, params])
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#6ecd1cd1-f162-45a3-8b3b-de690332a485  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchBidsAsks ([symbols, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#741a1dcc-7307-40d0-acca-28d003d1506a  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchBalance ([params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#4e7831f7-a0e7-4c3e-9336-1d0e5dcb15cf  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
coinmetro.fetchLedger ([code, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#a4895a1d-3f50-40ae-8231-6962ef06c771  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | the quote quantity that can be used as an alternative for the amount in market orders |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", "GTD" |
| params.expirationTime | <code>number</code> | No | timestamp in millisecond, for GTD orders only |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *margin only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *margin only* The price at which a take profit order is triggered at |
| params.margin | <code>bool</code> | No | true for creating a margin order |
| params.fillStyle | <code>string</code> | No | fill style of the limit order: "sell" fulfills selling quantity "buy" fulfills buying quantity "base" fulfills base currency quantity "quote" fulfills quote currency quantity |
| params.clientOrderId | <code>string</code> | No | client's comment |


```javascript
coinmetro.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://documenter.getpostman.com/view/3653795/SVfWN6KS#eaea86da-16ca-4c56-9f00-5b1cb2ad89f8
- https://documenter.getpostman.com/view/3653795/SVfWN6KS#47f913fb-8cab-49f4-bc78-d980e6ced316


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by coinmetro cancelOrder () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.margin | <code>string</code> | No | true for cancelling a margin order |


```javascript
coinmetro.cancelOrder (id, symbol[, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#47f913fb-8cab-49f4-bc78-d980e6ced316  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by coinmetro closePosition () |
| side | <code>string</code> | No | not used by coinmetro closePosition () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.orderID | <code>string</code> | No | order id |
| params.fraction | <code>number</code> | No | fraction of order to close, between 0 and 1 (defaults to 1) |


```javascript
coinmetro.closePosition (symbol[, side, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#518afd7a-4338-439c-a651-d4fdaa964138  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#4d48ae69-8ee2-44d1-a268-71f84e557b7b  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#95bbed87-db1c-47a7-a03e-aa247e91d5a6  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>int</code>, <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by coinmetro fetchOrder () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.fetchOrder (id, symbol[, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>coinmetro</code>](#coinmetro)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://documenter.getpostman.com/view/3653795/SVfWN6KS#5b90b3b9-e5db-4d07-ac9d-d680a06fd110  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinmetro.borrowCrossMargin (code, amount[, params])
```

