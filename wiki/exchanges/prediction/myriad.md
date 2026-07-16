
<a name="myriad" id="myriad"></a>

## myriad{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchEvent](#fetchevent)
* [fetchPositions](#fetchpositions)
* [fetchTradeQuote](#fetchtradequote)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchTicker](#fetchticker)
* [fetchTradingFee](#fetchtradingfee)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchEvents](#fetchevents)
* [watchOrderBook](#watchorderbook)
* [watchTrades](#watchtrades)
* [watchMyTrades](#watchmytrades)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchOHLCV](#watchohlcv)
* [watchOrders](#watchorders)
* [watchPositions](#watchpositions)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for myriad, each prediction market becomes one market with its outcome tokens listed under the outcomes key

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.query | <code>string</code> | No | a single search term used to filter the fetched markets |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query) |
| params.state | <code>string</code> | No | 'open', 'closed' or 'resolved', the state of the markets to fetch, defaults to 'open' |
| params.limit | <code>int</code> | No | max number of markets to collect (defaults to options.fetchMarketsLimit, 1000); stops the pagination once reached |


```javascript
myriad.fetchMarkets (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event by its market id

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the market id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchEvent (id, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch the open outcome-token positions held by a wallet (myriad settles trades on-chain, so only read-only portfolio data is exposed by the API)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | unified outcomes to filter by |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.address | <code>string</code> | No | the wallet address to query, defaults to this.walletAddress |


```javascript
myriad.fetchPositions (outcomes?, params?)
```


<a name="fetchTradeQuote" id="fetchtradequote"></a>

### fetchTradeQuote{docsify-ignore}
fetches a trade quote — price, shares, fees and the on-chain calldata — for buying or selling an outcome. Myriad settles trades on-chain, so this returns the calldata to submit to the prediction-market contract rather than placing an off-chain order

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a quote object with price, shares, fees and the on-chain calldata

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome id |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | for 'buy' the collateral value to spend; for 'sell' the number of shares to sell |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.slippage | <code>float</code> | No | maximum slippage tolerance (default 0.005) |


```javascript
myriad.fetchTradeQuote (outcome, side, amount, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order. Myriad has two trading models: a gasless order book (CLOB) where an EIP-712 signed order is posted off-chain and settled by the operator, and an on-chain AMM. Order-book markets are used by default; the model can be forced via params.tradingModel

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e2bc49cf4914b07528  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome id |
| type | <code>string</code> | Yes | 'limit' or 'market' (order book); ignored by the AMM path |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of outcome shares to trade (AMM 'buy' spends this as collateral value instead) |
| price | <code>float</code> | No | price per share as a fraction in [0, 1] (required for order-book limit orders) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradingModel | <code>string</code> | No | 'ob' to force the order book, 'amm' to force the on-chain AMM; defaults to the market's model |
| params.timeInForce | <code>string</code> | No | order-book time in force: 'GTC', 'GTD', 'FOK', 'FAK' or 'PO' |
| params.expiration | <code>string</code> | No | unix-seconds expiration for a GTD order |


```javascript
myriad.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
places multiple order book orders. Myriad's batch endpoint is not reliable, so the
orders are signed and submitted sequentially (not atomically)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e2bc49cf4914b07528  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;object&gt;</code> | Yes | a list of order requests, each with outcome, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.createOrders (orders, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edits an open order by cancelling it and placing a replacement (gasless). Myriad's
batch-modify endpoint is not reliable, so the cancel and replace are submitted sequentially

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281b58c5adb2f5998eec8  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the hash of the order to replace |
| outcome | <code>string</code> | Yes | unified outcome of the new order |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of outcome shares for the new order |
| price | <code>float</code> | No | price per share as a fraction in [0, 1] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.editOrder (id, outcome, type, side, amount, price?, params?)
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
buys an outcome by spending a fixed collateral amount on the AMM (dollar-sizing)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle |
| cost | <code>float</code> | Yes | the collateral (USDC) amount to spend |
| params | <code>object</code> | No | extra exchange-specific parameters |


```javascript
myriad.createMarketBuyOrderWithCost (outcome, cost, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order book order by its hash (re-signs the original order to prove ownership; gasless)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281b58c5adb2f5998eec8  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order hash returned by createOrder |
| outcome | <code>string</code> | No | unified outcome the order belongs to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.cancelOrder (id, outcome?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open order book orders for the wallet, optionally scoped to one market (gasless)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - the raw response with the count of cancelled orders

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281e7a14cd34e6a716761  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome; when omitted cancels across all markets |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.cancelAllOrders (outcome?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancels multiple open order book orders by hash in one request (gasless)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828177961fd94a6055966f  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | the order hashes to cancel |
| outcome | <code>string</code> | No | not used by myriad cancelOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.cancelOrders (ids, outcome?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches a single order book order by its hash

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828116b8a0d976baea1df0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order hash |
| outcome | <code>string</code> | No | unified outcome the order belongs to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchOrder (id, outcome?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches order book orders for the wallet (or any trader passed via params.trader)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trader | <code>string</code> | No | wallet address to query (defaults to the configured wallet) |
| params.status | <code>string</code> | No | 'open', 'filled', 'cancelled' or 'expired' |


```javascript
myriad.fetchOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches open order book orders for the wallet

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches the wallet's filled order book orders

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchClosedOrders (outcome?, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches the wallet's cancelled order book orders

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchCanceledOrders (outcome?, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the wallet's filled order book orders as trades. Note: Myriad's REST exposes the order's
limit price, not the per-fill execution price, so the price reflects the order's limit (exact for resting/limit
fills, an upper/lower bound for market orders) — use watchTrades for live execution prices

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da828171a003cf996487d008  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest trade |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
fetches the wallet's on-chain collateral balance for the order-book network (USD1 on BNB Chain)

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network_id | <code>string</code> | No | the network id (defaults to options.defaultNetworkId, '56') |


```javascript
myriad.fetchBalance (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the current price for a single outcome by loading the parent market

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome like TRUMP_WIN:YES or an outcome id like 2741:756/0 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchTicker (outcome, params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetches the buy/sell fee rates for a market outcome

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome or outcome id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchTradingFee (outcome, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the real order book for order-book markets, or synthesizes a one-level book from the AMM price otherwise

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da8281bba6aaf24dd61f2bb1  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome like TRUMP_WIN:YES or an outcome id |
| limit | <code>int</code> | No | not used by myriad fetchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches price history for an outcome from the price_charts bucket embedded in the market response

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome like TRUMP_WIN:YES or an outcome id |
| timeframe | <code>string</code> | Yes | mapped to the closest available chart bucket (24h, 7d or 30d) |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum number of candles to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchOHLCV (outcome, timeframe, since?, limit?, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches tickers for multiple outcomes, grouping requested outcomes by their parent market to fetch each market only once

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes — required: myriad has no endpoint returning all tickers at once, so an unscoped call is not supported |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchTickers (outcomes, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches recent public trades for a single outcome from the market action feed

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome like TRUMP_WIN:YES or an outcome id |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.fetchTrades (outcome, since?, limit?, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches prediction-market events matching the given scope (query/queries/tags/eventId — required) and caches their markets and outcomes on the instance

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of event structures

**See**: https://docs.myriad.markets/builders/myriad-api-reference  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.query | <code>string</code> | No | a single search term; an eventId does a direct lookup and tags map to server-side keyword searches |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query) |
| params.tags | <code>Array&lt;string&gt;</code> | No | tag slugs to scope by (searched as keywords, e.g. ['bitcoin', 'world-cup']) |
| params.eventId | <code>string</code> | No | direct lookup by unified event id (composite networkId:marketId) |
| params.limit | <code>int</code> | No | maximum number of markets per query, defaults to 50 |
| params.state | <code>string</code> | No | 'open', 'closed' or 'resolved', defaults to 'open' |


```javascript
myriad.fetchEvents (params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
streams the order book for an outcome over the Centrifugo websocket; the channel is delta-only so the book is seeded from the REST snapshot

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| limit | <code>int</code> | No | the maximum number of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchOrderBook (outcome, limit?, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
streams public trades for an outcome over the Centrifugo websocket

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| since | <code>int</code> | No | timestamp in ms of the earliest trade |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchTrades (outcome, since?, limit?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
streams the wallet's own fills for a market over the Centrifugo trades channel (real
execution prices, unlike the REST fetchMyTrades); requires a market outcome since the channel is per-market

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome whose market to watch |
| since | <code>int</code> | No | timestamp in ms of the earliest trade |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchMyTrades (outcome, since?, limit?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
streams best bid/ask/last for an outcome over the Centrifugo prices channel

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchTicker (outcome, params?)
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
streams best bid/ask/last for several outcomes over the Centrifugo prices channels

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>object</code> - a dict of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure) indexed by outcome

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes to watch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchTickers (outcomes, params?)
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
streams OHLCV candles for an outcome, synthesised from the live trades channel

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of [timestamp, open, high, low, close, volume] candles

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| timeframe | <code>string</code> | Yes | the length of each candle (e.g. '1m', '1h', '1d') |
| since | <code>int</code> | No | timestamp in ms of the earliest candle |
| limit | <code>int</code> | No | the maximum number of candles to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchOHLCV (outcome, timeframe, since?, limit?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
streams the wallet's order lifecycle updates over the Centrifugo orders channel

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchOrders (outcome?, since?, limit?, params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
streams the wallet's share-balance changes over the Centrifugo positions channel

**Kind**: instance method of [<code>myriad</code>](#myriad)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://docs.myriad.markets/builders/myriad-order-book/order-book-api#37dc9e49da82810581f8d2c8be2364fa  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | unified outcomes to filter by |
| since | <code>int</code> | No | timestamp in ms of the earliest position update |
| limit | <code>int</code> | No | the maximum number of position updates to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
myriad.watchPositions (outcomes?, since?, limit?, params?)
```

