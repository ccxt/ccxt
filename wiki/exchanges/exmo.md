
<a name="exmo" id="exmo"></a>

## exmo{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchTradingFees](#fetchtradingfees)
* [fetchTransactionFees](#fetchtransactionfees)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [fetchOrderBook](#fetchorderbook)
* [fetchOrderBooks](#fetchorderbooks)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [createMarketOrderWithCost](#createmarketorderwithcost)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [fetchOrder](#fetchorder)
* [fetchOrderTrades](#fetchordertrades)
* [fetchOpenOrders](#fetchopenorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [editOrder](#editorder)
* [fetchDepositAddress](#fetchdepositaddress)
* [withdraw](#withdraw)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchWithdrawal](#fetchwithdrawal)
* [fetchDeposit](#fetchdeposit)
* [fetchDeposits](#fetchdeposits)
* [watchBalance](#watchbalance)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchTrades](#watchtrades)
* [watchMyTrades](#watchmytrades)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)

<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#eebf9f25-0289-4946-9482-89872c738449  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#143ef808-79ca-4e49-9e79-a60ea4d8c0e3  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.addMargin (symbol, amount[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#90927062-256c-4b03-900f-2b99131f9a54
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchTradingFees ([params])
```


<a name="fetchTransactionFees" id="fetchtransactionfees"></a>

### fetchTransactionFees{docsify-ignore}
`DEPRECATED`

please use fetchDepositWithdrawFees instead

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a list of [transaction fees structures](https://docs.ccxt.com/#/?id=fees-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchTransactionFees (codes[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a list of [transaction fees structures](https://docs.ccxt.com/#/?id=fees-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#7cdf0ca8-9ff6-4cf3-aa33-bcec83155c49
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for exmo

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchMarkets ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#65eeb949-74e5-4631-9184-c38387fe53e8  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
exmo.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#59c5160f-27a1-4d9a-8cfb-7979c7ffaac6
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8388df7-1f9f-4d41-81c4-5a387d171dc6


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | *isolated* fetches the isolated margin balance |


```javascript
exmo.fetchBalance ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOrderBooks" id="fetchorderbooks"></a>

### fetchOrderBooks{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbol

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols, all symbols fetched if undefined, default is undefined |
| limit | <code>int</code> | No | max number of entries per orderbook to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchOrderBooks (symbols[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchTicker (symbol[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#5a5a9c0d-cf17-47f6-9d62-6d4404ebd5ac  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#b8d8d9af-4f46-46a1-939b-ad261d79f452  // spot
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#f4b1aaf8-399f-403b-ab5e-4926d967a106  // margin


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | a symbol is required but it can be a single string, or a non-empty array |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | *required for margin orders* the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.offset | <code>int</code> | No | last deal offset, default = 0 |


```javascript
exmo.fetchMyTrades (symbol[, since, limit, params])
```


<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

### createMarketOrderWithCost{docsify-ignore}
create a market order by providing the symbol, side and cost

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.createMarketOrderWithCost (symbol, side, cost[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

### createMarketSellOrderWithCost{docsify-ignore}
create a market sell order by providing the symbol and cost

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.createMarketSellOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#de6f4321-eeac-468c-87f7-c4ad7062e265  // stop market
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#3561b86c-9ff1-436e-8e68-ac926b7eb523  // margin


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at |
| params.timeInForce | <code>string</code> | No | *spot only* 'fok', 'ioc' or 'post_only' |
| params.postOnly | <code>boolean</code> | No | *spot only* true for post only orders |
| params.cost | <code>float</code> | No | *spot only* *market orders only* the cost of the order in the quote currency for market orders |


```javascript
exmo.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#1f710d4b-75bc-4b65-ad68-006f863a3f26
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#a4d0aae8-28f7-41ac-94fd-c4030130453d  // stop market
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#705dfec5-2b35-4667-862b-faf54eca6209  // margin


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by exmo cancelOrder () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true to cancel a trigger order |
| params.marginMode | <code>string</code> | No | set to 'cross' or 'isolated' to cancel a margin order |


```javascript
exmo.cancelOrder (id, symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
*spot only* fetches information on an order made by the user

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by exmo fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchOrder (id, symbol[, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#00810661-9119-46c5-aec5-55abe9cb42c7  // margin


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | set to "isolated" to fetch trades for a margin order |


```javascript
exmo.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#0e135370-daa4-4689-8acd-b6876dee9ba1  // spot open orders
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#a7cfd4f0-476e-4675-b33f-22a46902f245  // margin


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | set to "isolated" for margin orders |


```javascript
exmo.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#1d2524dd-ae6d-403a-a067-77b50d13fbe5  // margin
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#a51be1d0-af5f-44e4-99d7-f7b04c6067d0  // spot canceled orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | set to "isolated" for margin orders |


```javascript
exmo.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
*margin only* edit a trade order

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#f27ee040-c75f-4b59-b608-d05bd45b7899  // margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| type | <code>string</code> | Yes | not used by exmo editOrder |
| side | <code>string</code> | Yes | not used by exmo editOrder |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | stop price for stop-market and stop-limit orders |
| params.marginMode | <code>string</code> | Yes | must be set to isolated EXCHANGE SPECIFIC PARAMETERS |
| params.distance | <code>int</code> | No | distance for trailing stop orders |
| params.expire | <code>int</code> | No | expiration timestamp in UTC timezone for the order. order will not be expired if expire is 0 |
| params.comment | <code>string</code> | No | optional comment for order. up to 50 latin symbols, whitespaces, underscores |


```javascript
exmo.editOrder (id, symbol, type, side[, amount, price, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8f9ced9-7ab6-4383-a6a4-bc54469ba60e  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchDepositAddress (code[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#3ab9c34d-ad58-4f87-9c57-2e2ea88a8325  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.withdraw (code, amount, address, tag[, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#31e69a33-4849-4e6a-b4b4-6d574238f6a7  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchDepositsWithdrawals ([code, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

### fetchWithdrawal{docsify-ignore}
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | Yes | unified currency code of the currency withdrawn, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchWithdrawal (id, code[, params])
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch information on a deposit

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | unified currency code, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchDeposit (id, code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.fetchDeposits (code[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchBalance ([params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#fd8f47bc-8517-43c0-bb60-1d61a86d4471  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://documenter.getpostman.com/view/10287440/SzYXWKPi#fd8f47bc-8517-43c0-bb60-1d61a86d4471  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchTickers ([symbols, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchTrades (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
get the list of trades associated with the user

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>exmo</code>](#exmo)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://documenter.getpostman.com/view/10287440/SzYXWKPi#85f7bc03-b1c9-4cd2-bd22-8fd422272825
- https://documenter.getpostman.com/view/10287440/SzYXWKPi#95e4ed18-1791-4e6d-83ad-cbfe9be1051c


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
exmo.watchOrders (symbol[, since, limit, params])
```

