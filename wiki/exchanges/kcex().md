
<a name="kcex" id="kcex"></a>

## kcex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)

<a name="kcex" id="kcex"></a>

### kcex{docsify-ignore}
Set rateLimit to 1000 if fully verified



```javascript
kcex.kcex ()
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for kcex

**Kind**: instance method of [<code>kcex</code>](#kcex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://api-docs.kcex.ir/#be8d9c51a2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kcex.fetchMarkets ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>kcex</code>](#kcex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api-docs.kcex.ir/#be8d9c51a2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kcex.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kcex</code>](#kcex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api-docs.kcex.ir/#be8d9c51a2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kcex.fetchTicker (symbol[, params])
```

