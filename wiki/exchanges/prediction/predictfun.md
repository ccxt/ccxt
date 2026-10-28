
<a name="predictfun" id="predictfun"></a>

## predictfun{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchEvent](#fetchevent)
* [fetchEvents](#fetchevents)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchMyTrades](#fetchmytrades)
* [fetchTrades](#fetchtrades)
* [setSandboxMode](#setsandboxmode)
* [createOrder](#createorder)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [approve](#approve)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [unWatchOrders](#unwatchorders)
* [unWatchMyTrades](#unwatchmytrades)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
Retrieves all outcome markets from outcomeMeta.
Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;Market&gt;</code> - array of market structures

**See**

- https://dev.predict.fun/get-categories-25326910e0
- https://dev.predict.fun/search-categories-and-markets-27399810e0


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters |
| params.query | <code>string</code> | No | a single search term — routes the call through the search endpoint and returns only the matching markets |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query), the results are merged and deduplicated |
| params.tags | <code>Array&lt;string&gt;</code> | No | predictfun tag ids |
| params.slug | <code>string</code> | No | direct lookup by event slug |
| params.limit | <code>int</code> | No | the maximum number of events to collect markets from |


```javascript
predictfun.fetchMarkets (params?)
```


<a name="fetchEvent" id="fetchevent"></a>

### fetchEvent{docsify-ignore}
fetches a single prediction-market event (market topic)

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**: https://dev.predict.fun/get-category-by-slug-25326911e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | event slug |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.slug | <code>string</code> | No | event slug, overrides the id argument when both are given |


```javascript
predictfun.fetchEvent (id, params?)
```


<a name="fetchEvents" id="fetchevents"></a>

### fetchEvents{docsify-ignore}
fetches prediction-market events (market topics); the call must be scoped by query/queries/tags, eventId, or an l1Category/l2Category listing filter

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction event structures](https://docs.ccxt.com/#/?id=prediction-event-structure)

**See**

- https://dev.predict.fun/get-categories-25326910e0
- https://dev.predict.fun/search-categories-and-markets-27399810e0


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.query | <code>string</code> | No | a single search term — routes the call through GET /v1/search instead of the categories listing |
| params.queries | <code>Array&lt;string&gt;</code> | No | multiple search terms (alternative to query), searched one by one and merged deduplicated by event slug |
| params.tags | <code>Array&lt;string&gt;</code> | No | predictfun tag ids |
| params.slug | <code>string</code> | No | direct lookup by event slug |
| params.limit | <code>int</code> | No | the maximum number of events to return, capped at 25 per search term when searching |
| params.sort | <code>string</code> | No | 'VOLUME_24H_DESC' | 'VOLUME_ALL_DESC' | 'PUBLISHED_AT_ASC' | 'PUBLISHED_AT_DESC' |
| params.status | <code>string</code> | No | 'OPEN' | 'RESOLVED' |
| params.marketVariant | <code>string</code> | No | predictfun enum value ('SPORTS_MATCH', 'CRYPTO_UP_DOWN' etc.) |


```javascript
predictfun.fetchEvents (params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches the order book for a single prediction outcome token

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)

**See**: https://dev.predict.fun/get-the-orderbook-for-a-market-25326908e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle, or an outcome token id |
| limit | <code>int</code> | No | not used by predictfun fetchOrderBook |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.fetchOrderBook (outcome, limit?, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches the best bid and ask for a single prediction outcome token

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)

**See**: https://dev.predict.fun/get-market-by-id-25552989e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle, or an outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.fetchTicker (outcome, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches the settled matches the wallet took part in, on either side of the book

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://dev.predict.fun/get-order-match-events-25663812e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome handle, restricts the call to that outcome's market |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return, applied client side |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.after | <code>string</code> | No | cursor from a previous response, the venue pages back from the most recent match |
| params.isSignerMaker | <code>bool</code> | No | true keeps only the matches the wallet rested, false only the ones it took |
| params.signerAddress | <code>string</code> | No | read another wallet's matches instead of the configured one |


```javascript
predictfun.fetchMyTrades (outcome?, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches the most recent settled matches for a single prediction outcome token

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://dev.predict.fun/get-order-match-events-25663812e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle, or an outcome token id |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return, applied client side |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.after | <code>string</code> | No | cursor from a previous response, the venue pages back from the most recent match |
| params.minValueUsdtWei | <code>string</code> | No | only return matches worth at least this many wei |


```javascript
predictfun.fetchTrades (outcome, since?, limit?, params?)
```


<a name="setSandboxMode" id="setsandboxmode"></a>

### setSandboxMode{docsify-ignore}
switches between BNB mainnet and the BNB testnet

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  


| Param | Type | Description |
| --- | --- | --- |
| enable | <code>bool</code> | whether to use the testnet |


```javascript
predictfun.setSandboxMode (enable)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
creates a LIMIT or MARKET order on a single prediction outcome token

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://dev.predict.fun/create-an-order-32534694e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle, or an outcome token id |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the number of outcome shares |
| price | <code>float</code> | No | the price per share between 0 and 1, required for a limit order, and for a market order too unless warnOnMarketOrderWithoutPrice is turned off |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiration | <code>int</code> | No | unix timestamp in seconds the limit order expires at |
| params.postOnly | <code>bool</code> | No | reject the order if it would take liquidity |
| params.isFillOrKill | <code>bool</code> | No | fill the order completely or cancel it |
| params.slippageBps | <code>string</code> | No | slippage tolerance for a market order, in basis points |
| params.warnOnMarketOrderWithoutPrice | <code>bool</code> | No | set to false to sign a priceless market order at 0.99 to buy or 0.01 to sell, the worst price it accepts |
| params.selfTradePrevention | <code>string</code> | No | 'CANCEL_MAKER' | 'CANCEL_TAKER' | 'CANCEL_BOTH' |
| params.salt | <code>string</code> | No | order salt, pin it to retry an order idempotently |
| params.nonce | <code>string</code> | No | the maker's on chain nonce, defaults to 0 |
| params.feeRateBps | <code>string</code> | No | fee in basis points, read from the market when omitted |
| params.isNegRisk | <code>bool</code> | No | override the market's negative risk flag |
| params.isYieldBearing | <code>bool</code> | No | override the market's yield bearing flag |


```javascript
predictfun.createOrder (outcome, type, side, amount, price?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches the outcome shares the wallet holds

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://dev.predict.fun/get-positions-32675933e0
- https://dev.predict.fun/get-positions-by-address-32675934e0


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcomes | <code>Array&lt;string&gt;</code> | No | unified outcome handles to keep, all of them when omitted |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | read another wallet's positions, which needs no JWT |
| params.marketId | <code>string</code> | No | only positions on this market |
| params.isResolved | <code>bool</code> | No | only resolved, or only unresolved, positions |
| params.sort | <code>string</code> | No | 'AMOUNT_DESC' | 'EVENT_BLOCK_ASC' | 'EVENT_BLOCK_DESC' | 'SHARES_VALUE_DESC' | 'RETURN_DESC' |
| params.first | <code>int</code> | No | the maximum number of positions to return |
| params.after | <code>string</code> | No | cursor from a previous response |


```javascript
predictfun.fetchPositions (outcomes?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetches the shares the wallet holds of a single outcome

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://dev.predict.fun/get-positions-32675933e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle, or an outcome token id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.address | <code>string</code> | No | read another wallet's position, which needs no JWT |


```javascript
predictfun.fetchPosition (outcome, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
removes one of your own orders from the order book

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://dev.predict.fun/remove-orders-by-hash-38139973e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order hash, as returned by createOrder |
| outcome | <code>string</code> | No | unified outcome handle the order belongs to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.cancelOrder (id, outcome?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
removes several of your own orders from the order book, up to a hundred at a time

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://dev.predict.fun/remove-orders-by-hash-38139973e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | the order hashes, as returned by createOrder |
| outcome | <code>string</code> | No | unified outcome handle the orders belong to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.cancelOrders (ids, outcome?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches one of your own orders by its hash

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://dev.predict.fun/get-order-by-hash-25326901e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order hash |
| outcome | <code>string</code> | No | unified outcome handle the order belongs to, resolved from the order when omitted |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.fetchOrder (id, outcome?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches your own orders that are still resting on the book (only limit orders can be fetched)

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://dev.predict.fun/get-orders-25326902e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome handle to filter by, all outcomes when omitted |
| since | <code>int</code> | No | not used by predictfun fetchOpenOrders, the venue returns no order timestamps |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.after | <code>string</code> | No | cursor from a previous response, the venue pages back from the newest order |


```javascript
predictfun.fetchOpenOrders (outcome?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches your own orders that filled (only limit orders can be fetched)

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://dev.predict.fun/get-orders-25326902e0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome handle to filter by, all outcomes when omitted |
| since | <code>int</code> | No | not used by predictfun fetchClosedOrders, the venue returns no order timestamps |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.after | <code>string</code> | No | cursor from a previous response, the venue pages back from the newest order |


```javascript
predictfun.fetchClosedOrders (outcome?, since?, limit?, params?)
```


<a name="approve" id="approve"></a>

### approve{docsify-ignore}
grants the on-chain approvals a wallet needs before it can trade. The buy side is the USDT allowance the exchange spends, without which every order is refused with create_order_insufficient_collateral_allowance; the sell side is the ERC-1155 approval over the outcome shares themselves. WITHOUT params.amount THE BUY SIDE GRANTS AN UNLIMITED (max uint256) ALLOWANCE, pass params.amount to bound it. sends real transactions signed with the privateKey and waits for each receipt, so the wallet needs BNB for gas

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - the transaction receipt when buying, and the list of receipts when selling - a neg risk market needs two

**See**: https://dev.predict.fun/how-to-create-or-cancel-orders-679306m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome handle, used to pick the contracts its market settles through |
| params | <code>object</code> | No | extra parameters |
| params.side | <code>string</code> | No | 'buy' for the collateral allowance (the default), 'sell' for the outcome share approval |
| params.spender | <code>string</code> | No | approve this contract instead of resolving it from the outcome |
| params.token | <code>string</code> | No | the contract to grant on, defaults to USDT when buying and to the market's conditional tokens when selling |
| params.amount | <code>float</code> | No | the allowance in USDT, unlimited when omitted, buy side only |
| params.approved | <code>bool</code> | No | pass false to revoke instead of grant, sell side only |
| params.owner | <code>string</code> | No | the token holder, defaults to walletAddress or the address of the privateKey |
| params.rpcUrl | <code>string</code> | No | the rpc to broadcast through, defaults to the public endpoint for the chain |
| params.gasLimit | <code>string</code> | No | gas limit as hex, defaults to 0x186a0 |


```javascript
predictfun.approve (outcome?, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
subscribes to the live order book of an outcome and returns it as it updates

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>object</code> - a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)

**See**: https://dev.predict.fun/subscription-topics-1915507m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle |
| limit | <code>int</code> | No | the maximum number of price levels to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.watchOrderBook (outcome, limit?, params?)
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
stops watching the order book of an outcome. the venue publishes one book per market and both of its outcomes read it, so the sibling outcome is released with it

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>any</code> - the venue's acknowledgement

**See**: https://dev.predict.fun/subscription-topics-1915507m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | Yes | unified outcome handle |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.unWatchOrderBook (outcome, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches the wallet's own orders as the venue accepts, fills, expires or cancels them

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)

**See**: https://dev.predict.fun/subscription-topics-1915507m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome handle to narrow the stream to |
| since | <code>int</code> | No | timestamp in ms of the earliest order to return |
| limit | <code>int</code> | No | the maximum number of orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.watchOrders (outcome?, since?, limit?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches the wallet's own fills as they settle on chain

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)

**See**: https://dev.predict.fun/subscription-topics-1915507m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | unified outcome handle to narrow the stream to |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to return |
| limit | <code>int</code> | No | the maximum number of trades to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.watchMyTrades (outcome?, since?, limit?, params?)
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
stops watching the wallet's orders. one wallet topic carries orders and fills alike, so both streams are released together

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>any</code> - the venue's acknowledgement

**See**: https://dev.predict.fun/subscription-topics-1915507m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | not used by predictfun.unWatchOrders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.unWatchOrders (outcome?, params?)
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
stops watching the wallet's fills. one wallet topic carries orders and fills alike, so both streams are released together

**Kind**: instance method of [<code>predictfun</code>](#predictfun)  
**Returns**: <code>any</code> - the venue's acknowledgement

**See**: https://dev.predict.fun/subscription-topics-1915507m0  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| outcome | <code>string</code> | No | not used by predictfun.unWatchMyTrades |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
predictfun.unWatchMyTrades (outcome?, params?)
```

