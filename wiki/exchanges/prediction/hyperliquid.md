
<a name="hyperliquid" id="hyperliquid"></a>

## hyperliquid{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [fetchPositions](#fetchpositions)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchEvents](#fetchevents)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
Retrieves all Hyperliquid outcome markets from outcomeMeta.
Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Market&gt;</code> - array of market structures

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids#outcomes  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |


```javascript
hyperliquid.fetchMarkets (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a ticker for a single outcome market using the L2 order book snapshot

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome (e.g. 'BTC_ABOVE_78213_20260503:YES') |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchTicker (outcome, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches all outcome market tickers using allMids then optionally enriches with l2Book

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-all-mids-for-all-actively-traded-coins  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | filter by outcome ids or outcomes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchTickers (outcomes?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the L2 order book for an outcome market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| limit | <code>int</code> | No | max depth levels (not used by hyperliquid but accepted) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches candlestick OHLCV data for an outcome market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| timeframe | <code>string</code> | Yes | '1m', '5m', '15m', '1h', '4h', '1d', etc. |
| since | <code>int</code> | No | timestamp in ms of earliest candle |
| limit | <code>int</code> | No | max number of candles |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end timestamp in ms |


```javascript
hyperliquid.fetchOHLCV (outcome, timeframe, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
Fetches spot balance (outcomes use spot-like balance).

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Balances</code> - balance structure

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |
| params.user | <code>string</code> | No | wallet address (defaults to this.walletAddress) |


```javascript
hyperliquid.fetchBalance (params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches the user's outcome positions; outcome positions are spot token balances under the "+<encoding>" coin form (size and entry notional), the value/entry/mark price/pnl are computed from the current mid prices

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | filter by outcome ids or outcomes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | wallet address |


```javascript
hyperliquid.fetchPositions (outcomes?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
creates a limit or market order for an outcome market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | quantity of outcome tokens |
| price | <code>float</code> | No | limit price (0–1 range for prediction markets) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc' | 'Ioc' | 'Alo' (default 'Gtc') |
| params.postOnly | <code>boolean</code> | No | if true sets timeInForce to 'Alo' |
| params.reduceOnly | <code>boolean</code> | No | if true, marks the order as reduce only so it can only decrease an existing position |
| params.slippage | <code>string</code> | No | slippage for market orders (default 5%) |
| params.clientOrderId | <code>string</code> | No | hex cloid |
| params.vaultAddress | <code>string</code> | No | optional subaccount/vault address to trade on behalf of (master signer must be authorized) |


```javascript
hyperliquid.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a single open order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| outcome | <code>string</code> | No | unified outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | cancel by client order id |
| params.vaultAddress | <code>string</code> | No | optional subaccount/vault address to cancel on behalf of |


```javascript
hyperliquid.cancelOrder (id, outcome?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancels multiple open orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| outcome | <code>string</code> | No | unified outcome (required) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.cancelOrders (ids, outcome?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches currently open orders for the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| since | <code>int</code> | No | only return orders updated since this timestamp in ms |
| limit | <code>int</code> | No | max number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | wallet address |
| params.method | <code>string</code> | No | 'openOrders' | 'frontendOpenOrders' (default) |


```javascript
hyperliquid.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches all historical orders for the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| since | <code>int</code> | No | only return orders updated since this timestamp in ms |
| limit | <code>int</code> | No | max number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | wallet address |


```javascript
hyperliquid.fetchOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches a single order by id

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| outcome | <code>string</code> | No | outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | wallet address |
| params.clientOrderId | <code>string</code> | No | fetch by client order id instead |


```javascript
hyperliquid.fetchOrder (id, outcome?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches the most recent public trades for an outcome

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-coins-recent-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| since | <code>int</code> | No | only return trades at or after this timestamp in ms |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchTrades (outcome, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the authenticated user's fill history

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| since | <code>int</code> | No | start timestamp in ms |
| limit | <code>int</code> | No | max number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | wallet address |
| params.until | <code>int</code> | No | end timestamp in ms |


```javascript
hyperliquid.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
Groups outcome markets by their underlying (e.g. BTC_ABOVE_78213) into event structures. Each event contains both the YES and NO markets.

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;PredictionEvent&gt;</code> - array of event structures


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |
| params.query | <code>string</code> | No | a single query string to filter by (matches description/outcome) |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple query strings (alternative to query) |


```javascript
hyperliquid.fetchEvents (params?)
```

