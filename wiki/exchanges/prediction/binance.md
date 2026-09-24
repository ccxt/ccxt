
<a name="binance" id="binance"></a>

## binance{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchEvents](#fetchevents)
* [fetchEvent](#fetchevent)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchBalance](#fetchbalance)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchMyTrades](#fetchmytrades)
* [fetchWallet](#fetchwallet)
* [fetchQuote](#fetchquote)
* [createOrder](#createorder)
* [createMarketOrderWithCost](#createmarketorderwithcost)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)

<a name="binance" id="binance"></a>

### binance{docsify-ignore}
Binance Web3 Wallet prediction trading. Binance aggregates prediction markets from
on-chain vendors (predict.fun on BNB Chain) behind its standard signed SAPI — every endpoint,
including market data, requires apiKey/secret credentials



```javascript
binance.binance ()
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
fetches binance prediction markets; with a query it resolves the query via the search endpoint and returns the matched topics' markets, otherwise it pages the market listing

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a single search query resolved against the market search endpoint |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search queries (alternative to query) |
| params.l1Category | <code>string</code> | No | filter the listing by a level-1 category id (see the category/list endpoint) |
| params.l2Category | <code>string</code> | No | filter the listing by a level-2 category id |
| params.limit | <code>int</code> | No | for an unscoped listing (no query), the max number of topics to collect (defaults to options.maxFetchMarketsLimit, 200) |


```javascript
binance.fetchMarkets (params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a free-text search resolved against the semantic market search endpoint |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple free-text searches (alternative to query) |
| params.tags | <code>Array&lt;string&gt;</code> | No | treated as additional free-text searches (binance has no tag taxonomy) |
| params.eventId | <code>string</code> | No | a marketTopicId, fetched directly via the detail endpoint |
| params.l1Category | <code>string</code> | No | scope the listing server-side by a level-1 category id |
| params.l2Category | <code>string</code> | No | scope the listing server-side by a level-2 category id |
| params.limit | <code>int</code> | No | the maximum number of events to return |
| params.sort | <code>string</code> | No | 'volume' | 'liquidity' | 'newest' (client-side) |
| params.status | <code>string</code> | No | 'active' | 'closed' | 'all' (client-side) |
| params.sortBy | <code>string</code> | No | sort events by server side ('RECOMMENDED' | 'VOLUME' | 'PARTICIPANTS' | 'CREATED_TIME' | 'END_DATE'), works when no queries and eventId provided |
| params.orderBy | <code>string</code> | No | order events by server side ('ASC' | 'DESC'), works when no queries and eveitId provided |


```javascript
binance.fetchEvents (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event (market topic) by its marketTopicId

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the marketTopicId |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.fetchEvent (id, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the last trade price for a single prediction outcome

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-last-trade-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle like BTC_PRICE_1H_UP_DOWN_UP:YES, or an outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.fetchTicker (outcome, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches last trade prices for multiple outcomes, one request per distinct underlying market

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-last-trade-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | Yes | unified outcomes — required: the venue has no all-tickers endpoint |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.fetchTickers (outcomes, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the order book for a single prediction outcome token

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/market-data#query-order-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle, or an outcome token id |
| limit | <code>int</code> | No | not used by binance fetchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/wallet#query-payment-option-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'CeDefi', 'FUNDING', or 'SPOT' |


```javascript
binance.fetchBalance (params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches currently open orders for the user

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#query-active-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| since | <code>int</code> | No | only return orders updated since this timestamp in ms |
| limit | <code>int</code> | No | max number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tradeSide | <code>string</code> | No | Filter by trade side. Enum: BUY, SELL |
| params.l1Category | <code>string</code> | No | Filter by level-1 category |
| params.paginate | <code>boolean</code> | No | *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
binance.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches all historical orders for the user

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#query-order-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| since | <code>int</code> | No | only return orders updated since this timestamp in ms |
| limit | <code>int</code> | No | max number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.orderType | <code>string</code> | No | Filter by order type. Enum: MARKET, LIMIT |
| params.l1Category | <code>string</code> | No | Filter by level-1 category |
| params.status | <code>string</code> | No | Filter by order status |
| params.until | <code>string</code> | No | end timestamp in ms |
| params.paginate | <code>boolean</code> | No | *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
binance.fetchOrders (outcome?, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches the user's outcome positions; outcome positions are spot token balances under the "+<encoding>" coin form (size and entry notional), the value/entry/mark price/pnl are computed from the current mid prices

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/position#query-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | filter by outcome ids or outcomes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tab | <code>string</code> | No | Position status tab. Values from PositionQueryType. Default ONGOING |


```javascript
binance.fetchPositions (outcomes?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/position#query-positions-by-filter  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.fetchPosition (outcome?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#query-order-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | filter by outcome |
| since | <code>int</code> | No | only return orders updated since this timestamp in ms |
| limit | <code>int</code> | No | max number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.orderType | <code>string</code> | No | Filter by order type. Enum: MARKET, LIMIT |
| params.l1Category | <code>string</code> | No | Filter by level-1 category |
| params.status | <code>string</code> | No | Filter by order status |
| params.until | <code>string</code> | No | end timestamp in ms |
| params.paginate | <code>boolean</code> | No | *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
binance.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchWallet" id="fetchwallet"></a>

### fetchWallet{docsify-ignore}
fetch wallet for user and save the one match the walletAddress user provided

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a wallet

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/wallet#list-prediction-wallets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| methodName | <code>string</code> | No | method name |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.fetchWallet (methodName?, params?)
```


<a name="fetchQuote" id="fetchquote"></a>

### fetchQuote{docsify-ignore}
request for quote from binance server

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a quote

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#get-quote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| request | <code>object</code> | No | request to the exchange API endpoint |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.chainId | <code>string</code> | No | Chain ID. Default 56 (BSC) |
| params.feeRateBps | <code>integer</code> | No | Fee rate in basis points. Default 200, range 1–10000 |
| params.fundingSource | <code>string</code> | No | Funding source. Enum: MPC, CEX. Default MPC |
| params.fundTransferAmount | <code>string</code> | No | Auto-transfer amount before order (wei). Must be > 0 if provided |


```javascript
binance.fetchQuote (request?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
creates a limit or market order for an outcome market

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | quantity of outcome tokens |
| price | <code>float</code> | No | limit price (0–1 range for prediction markets) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | Must match orderType: FOK for MARKET, GTC for LIMIT |
| params.slippage | <code>string</code> | No | slippage for market orders (default 5%) |
| params.fundingSource | <code>string</code> | No | Funding source. Enum: MPC, CEX. Default MPC |
| params.fundTransferAmount | <code>string</code> | No | Auto-transfer amount before order (wei). Must be > 0 if provided |
| params.accountType | <code>string</code> | No | Payment account type. Enum: SPOT, FUNDING |
| params.feeRateBps | <code>string</code> | No | Payment account type. Enum: SPOT, FUNDING |
| params.cost | <code>string</code> | No | Buy prediction market with USDT cost, only for buy side |


```javascript
binance.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

### createMarketOrderWithCost{docsify-ignore}
create a market order by providing the symbol, side and cost

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.createMarketOrderWithCost (symbol, side, cost, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a single open order

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>object</code> - a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#batch-cancel-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| outcome | <code>string</code> | No | unified outcome |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.cancelOrder (id, outcome?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancels multiple open orders

**Kind**: instance method of [<code>binance</code>](#binance)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://developers.binance.com/en/docs/catalog/web3-wallet-prediction-trading/api/rest-api/trade#batch-cancel-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| outcome | <code>string</code> | No | unified outcome (required) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
binance.cancelOrders (ids, outcome?, params?)
```

