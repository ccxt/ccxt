
<a name="interactivebrokers" id="interactivebrokers"></a>

## interactivebrokers{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [signIn](#signin)
* [fetchBalance](#fetchbalance)
* [fetchMarkets](#fetchmarkets)
* [fetchTickers](#fetchtickers)
* [fetchBidsAsks](#fetchbidsasks)
* [fetchLastPrices](#fetchlastprices)
* [fetchMarkPrices](#fetchmarkprices)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchStatus](#fetchstatus)
* [fetchOHLCV](#fetchohlcv)
* [fetchAccounts](#fetchaccounts)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchPositions](#fetchpositions)
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)

<a name="signIn" id="signin"></a>

### signIn{docsify-ignore}
obtains a live session token via the oauth 1.0a diffie-hellman exchange and opens the brokerage session, must be called prior to using other authenticated methods (called automatically by authenticate)

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.interactivebrokers.com/docs/web-api/api-reference/authentication/oauth-1-0-a/req-live-session-token
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/initialize-session


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.signIn (params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders, the cash comes from the ledger, the crypto holdings from the positions and the locked ('used') amounts from the open orders of the current brokerage session

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-portfolio-ledger
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-uncached-positions
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the account id, defaults to options["accountId"] or the selected account |
| params.positions | <code>boolean</code> | No | add the holdings of options.fetchBalance.positionAssetClasses (crypto by default) as balances, default true |
| params.openOrders | <code>boolean</code> | No | compute the locked ('used') amounts from the open orders, default true |


```javascript
interactivebrokers.fetchBalance (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on the market types of options.fetchMarkets.types: stocks of options.fetchMarkets.exchanges.STK, crypto of options.fetchMarkets.cryptoSpotSymbols, fx pairs of options.fetchMarkets.forexCurrencies, coinbase derivatives perp-style futures discovered with the market scanner (as swap, e.g. BTC/USD:USD), dated coinbase derivatives futures (scanned) and CME and CFE crypto futures of options.fetchMarkets.cryptoCmeFutureSymbols (as future, e.g. BTC/USD:USD-261127) and cfds of options.fetchMarkets.cfdExchanges (as swap, e.g. AAPL/USD:USD), bonds of options.fetchMarkets.bondSymbols are loaded only with 'bond' in options.fetchMarkets.types (as spot, e.g. US-T-4.125-270131.SMART/USD), the market id is the IBKR conid

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-conids-by-exchange
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-bond-filters
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-info-and-rules
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-future-by-symbol
- https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#scanner-run
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-symbols-from-body
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-currency-pairs
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-instrument-definition


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.fetchMarkets (params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, the first snapshot request only subscribes to the market data, so the request is retried until data arrives

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.fields | <code>string</code> | No | comma-separated snapshot field ids, max 50 |


```javascript
interactivebrokers.fetchTickers (symbols, params?)
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the bids and asks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.fields | <code>string</code> | No | comma-separated snapshot field ids, default '84,85,86,88' |


```javascript
interactivebrokers.fetchBidsAsks (symbols, params?)
```


<a name="fetchLastPrices" id="fetchlastprices"></a>

### fetchLastPrices{docsify-ignore}
fetches the last price for multiple markets

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a dictionary of [last price structures](https://docs.ccxt.com/?id=last-price-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the last prices for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.fetchLastPrices (symbols, params?)
```


<a name="fetchMarkPrices" id="fetchmarkprices"></a>

### fetchMarkPrices{docsify-ignore}
fetches the mark price for multiple markets

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the mark prices for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.fetchMarkPrices (symbols, params?)
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
retrieves the open interest of multiple futures or swap markets

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a dictionary of [open interest structures](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the open interest for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.fetchOpenInterests (symbols, params?)
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the status of the brokerage session, 'ok' when authenticated and connected

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/get-brokerage-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.fetchStatus (params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, max 1000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.outsideRth | <code>boolean</code> | No | include data outside regular trading hours |
| params.source | <code>string</code> | No | 'Last', 'Bid_Ask' or 'Midpoint' |


```javascript
interactivebrokers.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [account structures](https://docs.ccxt.com/?id=account-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-all-accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts' |


```javascript
interactivebrokers.fetchAccounts (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order, order reply prompts are confirmed automatically when options.createOrder.autoConfirmOrderReplies is true

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/submit-new-order
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/confirm-order-reply


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the stop price, creates a STP (market) or STP LMT (limit) order |
| params.trailingAmount | <code>float</code> | No | the trailing offset in quote currency, creates a TRAIL or TRAILLMT order |
| params.trailingPercent | <code>float</code> | No | the trailing offset in percent, creates a TRAIL or TRAILLMT order |
| params.timeInForce | <code>string</code> | No | 'DAY', 'IOC', 'GTC', 'OPG' or 'PAX' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order, sent as cOID |
| params.outsideRTH | <code>boolean</code> | No | allow the order to execute outside regular trading hours |
| params.accountId | <code>string</code> | No | the account id, defaults to options["accountId"] |


```javascript
interactivebrokers.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint, see createOrder |


```javascript
interactivebrokers.editOrder (id, symbol, type, side, amount?, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/cancel-open-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the account id, defaults to options["accountId"] |


```javascript
interactivebrokers.cancelOrder (id, symbol?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user, only orders of the current brokerage session are available

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-order-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
interactivebrokers.fetchOrder (id, symbol?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders of the current brokerage session

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.filters | <code>string</code> | No | a single exchange-side status filter, e.g. 'filled' |
| params.force | <code>boolean</code> | No | refresh the cached order list first, default true |


```javascript
interactivebrokers.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders of the current brokerage session

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.filters | <code>string</code> | No | an exchange-side status filter, by default all orders are fetched and filtered by their unified status |
| params.force | <code>boolean</code> | No | refresh the cached order list first, default true |


```javascript
interactivebrokers.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple filled orders of the current brokerage session

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.filters | <code>string</code> | No | an exchange-side status filter, by default all orders are fetched and filtered by their unified status |
| params.force | <code>boolean</code> | No | refresh the cached order list first, default true |


```javascript
interactivebrokers.fetchClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders of the current brokerage session

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.filters | <code>string</code> | No | an exchange-side status filter, by default all orders are fetched and filtered by their unified status |
| params.force | <code>boolean</code> | No | refresh the cached order list first, default true |


```javascript
interactivebrokers.fetchCanceledOrders (symbol?, since?, limit?, params?)
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple filled and canceled orders of the current brokerage session

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.filters | <code>string</code> | No | an exchange-side status filter, by default all orders are fetched and filtered by their unified status |
| params.force | <code>boolean</code> | No | refresh the cached order list first, default true |


```javascript
interactivebrokers.fetchCanceledAndClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user, over the last days (max 7) via iserver/account/trades, or for crypto markets (which iserver/account/trades does not return) via pa/transactions

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-trade-history
- https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio-analyst/get-transactions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, required for crypto markets |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.days | <code>int</code> | No | number of days to fetch, max 7 for iserver/account/trades, default 90 for pa/transactions |
| params.method | <code>string</code> | No | 'privateGetIserverAccountTrades' or 'privatePostPaTransactions', default is 'privatePostPaTransactions' for crypto markets and 'privateGetIserverAccountTrades' otherwise |
| params.currency | <code>string</code> | No | pa/transactions only, the currency to display the amounts in, default 'USD' |
| params.accountId | <code>string</code> | No | pa/transactions only, the account id, defaults to options["accountId"] |


```javascript
interactivebrokers.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-uncached-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the account id, defaults to options["accountId"] |


```javascript
interactivebrokers.fetchPositions (symbols?, params?)
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
fetch the open positions of a single market

**Kind**: instance method of [<code>interactivebrokers</code>](#interactivebrokers)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-position-by-conid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the account id, defaults to options["accountId"] |


```javascript
interactivebrokers.fetchPositionsForSymbol (symbol, params?)
```

