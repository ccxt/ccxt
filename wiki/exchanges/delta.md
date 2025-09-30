
<a name="delta" id="delta"></a>

## delta{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchLedger](#fetchledger)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchGreeks](#fetchgreeks)
* [closeAllPositions](#closeallpositions)
* [fetchMarginMode](#fetchmarginmode)
* [fetchOption](#fetchoption)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchTime ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchStatus ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.delta.exchange/#get-list-of-all-assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for delta

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.delta.exchange/#get-list-of-products  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.delta.exchange/#get-tickers-for-products  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchTickers (symbols[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.delta.exchange/#get-l2-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.delta.exchange/#get-public-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.delta.exchange/#delta-exchange-api-v2-historical-ohlc-candles-sparklines  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>string</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
delta.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.delta.exchange/#get-wallet-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchBalance ([params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.delta.exchange/#get-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.delta.exchange/#get-margined-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchPositions (symbols[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.delta.exchange/#place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.reduceOnly | <code>bool</code> | No | *contract only* indicates if this order is to reduce the size of a position |


```javascript
delta.createOrder (symbol, type, side, amount[, price, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.delta.exchange/#edit-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.delta.exchange/#cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.delta.exchange/#cancel-all-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.cancelAllOrders (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.delta.exchange/#get-active-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.delta.exchange/#get-order-history-cancelled-and-closed  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.delta.exchange/#get-user-fills-by-filters  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**: https://docs.delta.exchange/#get-wallet-transactions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchLedger ([code, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | unified network code |


```javascript
delta.fetchDepositAddress (code[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexed by market symbols

**See**: https://docs.delta.exchange/#get-tickers-for-products  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchFundingRates (symbols[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://docs.delta.exchange/#add-remove-position-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.addMargin (symbol, amount[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://docs.delta.exchange/#add-remove-position-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.reduceMargin (symbol, amount[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a derivative market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
delta.fetchOpenInterest (symbol[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://docs.delta.exchange/#get-order-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.delta.exchange/#change-order-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.setLeverage (leverage, symbol[, params])
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
fetches historical settlement records

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/#/?id=settlement-history-structure)

**See**: https://docs.delta.exchange/#get-product-settlement-prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |


```javascript
delta.fetchSettlementHistory (symbol[, since, limit, params])
```


<a name="fetchGreeks" id="fetchgreeks"></a>

### fetchGreeks{docsify-ignore}
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)

**See**: https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchGreeks (symbol[, params])
```


<a name="closeAllPositions" id="closeallpositions"></a>

### closeAllPositions{docsify-ignore}
closes all open positions for a market type

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.delta.exchange/#close-all-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user_id | <code>int</code> | No | the users id |


```javascript
delta.closeAllPositions ([params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a trading pair

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://docs.delta.exchange/#get-user  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchMarginMode (symbol[, params])
```


<a name="fetchOption" id="fetchoption"></a>

### fetchOption{docsify-ignore}
fetches option data that is commonly found in an option chain

**Kind**: instance method of [<code>delta</code>](#delta)  
**Returns**: <code>object</code> - an [option chain structure](https://docs.ccxt.com/#/?id=option-chain-structure)

**See**: https://docs.delta.exchange/#get-ticker-for-a-product-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
delta.fetchOption (symbol[, params])
```

