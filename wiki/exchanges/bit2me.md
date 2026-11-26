
<a name="bit2me" id="bit2me"></a>

## bit2me{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [cancelOrder](#cancelorder)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [watchOrderBook](#watchorderbook)
* [watchTrades](#watchtrades)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)
* [createOrderWs](#createorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelOrdersWs](#cancelordersws)
* [cancelAllOrdersWs](#cancelallordersws)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bit2me

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/market-config/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marketEnabled | <code>string</code> | No | filter by market state, one of 'enabled', 'enabled_at', 'frozen', 'restricted' |


```javascript
bit2me.fetchMarkets (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://api.bit2me.com/docs/wallet/rest-overview  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.includeTestnet | <code>boolean</code> | No | default false, when true testnet assets are included |


```javascript
bit2me.fetchCurrencies (params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/tickers/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.fetchTickers (symbols?, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/tickers/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.fetchTicker (symbol, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://api.bit2me.com/docs/pro/api-reference/marketdata/v2/trading/order-book/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | not used by bit2me.fetchOrderBook, the endpoint always returns up to 100 levels per side |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://api.bit2me.com/docs/pro/api-reference/marketdata/v1/trading/trade/last/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch, default 50, max 50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://api.bit2me.com/docs/pro/api-reference/marketdata/v1/trading/candle/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, default 1000, max 1000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bit2me.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/balance/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbols | <code>string</code> | No | comma-separated currency codes, only those wallets are returned |


```javascript
bit2me.fetchBalance (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure), for an OCO the take profit leg is returned and both legs are available in info, cancelling one leg does not cancel the other

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, required for limit orders, for market buy orders it is used to compute the cost to spend (amount * price) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the price at which a stop-limit order is activated, requires a limit price |
| params.stopLossPrice | <code>float</code> | No | the trigger price of a stop loss, placed as a stop-limit order at the limit price, or as the stop loss leg of an OCO when takeProfitPrice is also set |
| params.takeProfitPrice | <code>float</code> | No | the trigger price of a take profit, placed as a stop-limit order at the limit price, or as the take profit leg of an OCO when stopLossPrice is also set |
| params.stopLimitPrice | <code>float</code> | No | OCO only, the limit price of the stop loss leg, defaults to the price argument and then to stopLossPrice |
| params.cost | <code>float</code> | No | for market orders only, the amount to trade in units of the quote currency, overrides amount |
| params.timeInForce | <code>string</code> | No | 'GTC' (default) or 'FOK' (limit orders only), IOC is not available on bit2me |
| params.postOnly | <code>boolean</code> | No | true to place a post-only limit order |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order |


```javascript
bit2me.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.createMarketBuyOrderWithCost (symbol, cost, params?)
```


<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

### createMarketSellOrderWithCost{docsify-ignore}
create a market sell order by providing the symbol and cost

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/post  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.createMarketSellOrderWithCost (symbol, cost, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/delete  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | not used by bit2me.cancelOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.cancelOrder (id, symbol?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/get
- https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | not used by bit2me.fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | fetch the order by its client order id instead of its id |


```javascript
bit2me.fetchOrder (id, symbol?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve, default 100, max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.offset | <code>int</code> | No | the number of orders to skip, for pagination |
| params.status | <code>string</code> | No | only orders in exactly this status, one of 'open', 'inactive', 'filled', 'cancelled' |
| params.status_in | <code>string</code> | No | comma-separated statuses to include |
| params.clientOrderId | <code>string</code> | No | comma-separated client order ids to filter by |


```javascript
bit2me.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders, including stop-limit orders waiting for their trigger

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve, default 100, max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
bit2me.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple filled orders made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve, default 100, max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
bit2me.fetchClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve, default 100, max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
bit2me.fetchCanceledOrders (symbol?, since?, limit?, params?)
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and filled orders made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve, default 100, max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
bit2me.fetchCanceledAndClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/trade/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve, default 50, max 50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.offset | <code>int</code> | No | the number of trades to skip, for pagination |


```javascript
bit2me.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/trading/v1/trading/order/id/trades/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.fetchOrderTrades (id, symbol?, since?, limit?, params?)
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between the bit2me wallet and the trading (pro) wallet

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/deposit/post
- https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/wallet/withdraw/post


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | 'funding' (the bit2me wallet) or 'spot' (the trading wallet) |
| toAccount | <code>string</code> | Yes | 'funding' (the bit2me wallet) or 'spot' (the trading wallet) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.transfer (code, amount, fromAccount, toAccount, params?)
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch the history of movements between the bit2me wallet and the trading (pro) wallet

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://api.bit2me.com/docs/pro/api-reference/funding/v1/trading/movement/get  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve, default 100, max 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for |
| params.movementType | <code>string</code> | No | 'deposit' or 'withdrawal', to fetch only one direction |


```javascript
bit2me.fetchTransfers (code?, since?, limit?, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://api.bit2me.com/docs/pro/websocket-public  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.watchOrderBook (symbol, limit?, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://api.bit2me.com/docs/pro/websocket-public  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.watchTrades (symbol, since?, limit?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/websocket-private  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.watchOrders (symbol?, since?, limit?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://api.bit2me.com/docs/pro/websocket-private  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.watchMyTrades (symbol?, since?, limit?, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://api.bit2me.com/docs/pro/websocket-private  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.watchBalance (params?)
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order over the websocket

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/websocket-commands  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, required for limit orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint, the same as for createOrder |
| params.triggerPrice | <code>float</code> | No | the price at which a stop-limit order is activated, requires a limit price |
| params.cost | <code>float</code> | No | for market orders only, the amount to trade in units of the quote currency, overrides amount |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order |


```javascript
bit2me.createOrderWs (symbol, type, side, amount, price?, params?)
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order over the websocket

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/websocket-commands  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | not used by bit2me.cancelOrderWs |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.cancelOrderWs (id, symbol?, params?)
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancels multiple orders over the websocket, up to 20 at a time

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure), orders the exchange refused to cancel keep an undefined status and carry the reason in info

**See**: https://api.bit2me.com/docs/pro/websocket-commands  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | not used by bit2me.cancelOrdersWs |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bit2me.cancelOrdersWs (ids, symbol?, params?)
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancels all open orders of a market over the websocket

**Kind**: instance method of [<code>bit2me</code>](#bit2me)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.bit2me.com/docs/pro/websocket-commands  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | 'buy' or 'sell', to cancel only that side |


```javascript
bit2me.cancelAllOrdersWs (symbol, params?)
```

