
<a name="astralx" id="astralx"></a>

## astralx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [parseTicker](#parseticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [parseOHLCV](#parseohlcv)
* [fetchTime](#fetchtime)
* [fetchFundingRate](#fetchfundingrate)
* [parseFundingRate](#parsefundingrate)
* [fetchTrades](#fetchtrades)
* [parseTrade](#parsetrade)
* [fetchCurrencies](#fetchcurrencies)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchPositions](#fetchpositions)
* [parsePosition](#parseposition)
* [parseOrder](#parseorder)
* [sign](#sign)
* [handleErrors](#handleerrors)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for astralx

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;Market&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker for a trading symbol

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchTicker (symbol[, params])
```


<a name="parseTicker" id="parseticker"></a>

### parseTicker{docsify-ignore}
parses a ticker structure from the exchange response

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ticker | <code>object</code> | Yes | the ticker data from the exchange |
| market | <code>object</code> | No | the market to which the ticker belongs |


```javascript
astralx.parseTicker (ticker[, market])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>OrderBook</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;OHLCV&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="parseOHLCV" id="parseohlcv"></a>

### parseOHLCV{docsify-ignore}
parses OHLCV data from the exchange response

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;number&gt;</code> - [timestamp, open, high, low, close, volume]


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ohlcv | <code>Array&lt;number&gt;</code> | Yes | the OHLCV data from the exchange |
| market | <code>object</code> | No | the market to which the OHLCV data belongs |


```javascript
astralx.parseOHLCV (ohlcv[, market])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchTime ([params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetches the current funding rate

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchFundingRate (symbol[, params])
```


<a name="parseFundingRate" id="parsefundingrate"></a>

### parseFundingRate{docsify-ignore}
parses a funding rate structure from the exchange response

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| contract | <code>object</code> | Yes | the funding rate data from the exchange |
| market | <code>object</code> | No | the market to which the funding rate belongs |


```javascript
astralx.parseFundingRate (contract[, market])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchTrades (symbol[, since, limit, params])
```


<a name="parseTrade" id="parsetrade"></a>

### parseTrade{docsify-ignore}
parses a trade structure from the exchange response

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [trade structure](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| trade | <code>object</code> | Yes | the trade data from the exchange |
| market | <code>object</code> | No | the market to which the trade belongs |


```javascript
astralx.parseTrade (trade[, market])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchCurrencies ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.cancelOrder (id, symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on all open orders made by the user

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>Array&lt;Position&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
astralx.fetchPositions ([symbols, params])
```


<a name="parsePosition" id="parseposition"></a>

### parsePosition{docsify-ignore}
parse a position structure from the exchange response

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| position | <code>object</code> | Yes | the position data from the exchange |
| marketParam | <code>object</code> | No | the market to which the position belongs |


```javascript
astralx.parsePosition (position[, marketParam])
```


<a name="parseOrder" id="parseorder"></a>

### parseOrder{docsify-ignore}
parse an order structure from the exchange response

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| order | <code>object</code> | Yes | the order data from the exchange |
| marketParam | <code>object</code> | No | the market to which the order belongs |


```javascript
astralx.parseOrder (order[, marketParam])
```


<a name="sign" id="sign"></a>

### sign{docsify-ignore}
signs the request with HMAC-SHA256

**Kind**: instance method of [<code>astralx</code>](#astralx)  
**Returns**: <code>object</code> - the signed request parameters


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| path | <code>string</code> | Yes | the API endpoint path |
| api | <code>string</code> | Yes | 'public' or 'private' |
| method | <code>string</code> | Yes | 'GET', 'POST', 'DELETE' |
| params | <code>object</code> | Yes | the parameters to include in the request |
| headers | <code>object</code> | No | additional headers to include |
| body | <code>object</code> | No | the request body |


```javascript
astralx.sign (path, api, method, params[, headers, body])
```


<a name="handleErrors" id="handleerrors"></a>

### handleErrors{docsify-ignore}
handles exchange errors

**Kind**: instance method of [<code>astralx</code>](#astralx)  


| Param | Type | Description |
| --- | --- | --- |
| code | <code>int</code> | the HTTP status code |
| reason | <code>string</code> | the HTTP reason phrase |
| url | <code>string</code> | the URL of the request |
| method | <code>string</code> | the HTTP method used |
| headers | <code>object</code> | the HTTP headers |
| body | <code>string</code> | the response body |
| response | <code>object</code> | the parsed response |
| requestHeaders | <code>object</code> | the original request headers |
| requestBody | <code>object</code> | the original request body |


```javascript
astralx.handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody[])
```

