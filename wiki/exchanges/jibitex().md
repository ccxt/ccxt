
<a name="jibitex" id="jibitex"></a>

## jibitex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrderBooks](#fetchorderbooks)

<a name="jibitex" id="jibitex"></a>

### jibitex{docsify-ignore}
Set rateLimit to 1000 if fully verified



```javascript
jibitex.jibitex ()
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for jibitex

**Kind**: instance method of [<code>jibitex</code>](#jibitex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://jibitex.co/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
jibitex.fetchMarkets ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>jibitex</code>](#jibitex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://jibitex.co/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
jibitex.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>jibitex</code>](#jibitex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://jibitex.co/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
jibitex.fetchTicker (symbol[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>jibitex</code>](#jibitex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://jibitex.co/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
jibitex.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchOrderBooks" id="fetchorderbooks"></a>

### fetchOrderBooks{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets

**Kind**: instance method of [<code>jibitex</code>](#jibitex)  
**Returns**: <code>object</code> - a dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbol

**See**: https://jibitex.co/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols, all symbols fetched if undefined, default is undefined |
| limit | <code>int</code> | No | max number of entries per orderbook to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
jibitex.fetchOrderBooks (symbols[, limit, params])
```

