
<a name="ellipx" id="ellipx"></a>

## ellipx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTrades](#fetchtrades)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [fetchOrder](#fetchorder)
* [fetchOrdersByStatus](#fetchordersbystatus)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [cancelOrder](#cancelorder)
* [fetchOrderTrades](#fetchordertrades)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchTradingFee](#fetchtradingfee)
* [withdraw](#withdraw)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
Fetches market information from the exchange.

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Promise.&lt;Array&lt;Market&gt;&gt;</code> - An array of market structures.

**See**

- https://docs.ccxt.com/en/latest/manual.html#markets
- https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.1a1t05wpgfof


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | Extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.d2jylz4u6pmu  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchTicker (symbol[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.bqmucewhkpdz  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return the exchange not supported yet. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market, default will return the last 24h period.

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Array&lt;OHLCV&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.w65baeuhxwt8  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |


```javascript
ellipx.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches information on all currencies from the exchange, including deposit/withdrawal details and available chains

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Promise.&lt;Currencies&gt;</code> - An object of currency structures indexed by currency codes

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.x65f9s9j74jf  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the ellipx API endpoint |
| params.Can_Deposit | <code>string</code> | No | filter currencies by deposit availability, Y for available |
| params.results_per_page | <code>number</code> | No | number of results per page, default 100 |
| params._expand | <code>string</code> | No | additional fields to expand in response, default '/Crypto_Token,/Crypto_Chain' |


```javascript
ellipx.fetchCurrencies ([params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
fetches all completed trades for a particular market/symbol

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol (e.g. 'BTC/USDT') |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the EllipX API endpoint |
| params.before | <code>string</code> | No | get trades before the given trade ID |


```javascript
ellipx.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.ihrjov144txg  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchBalance ([params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a new order in a market

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.yzfak2n2bwpo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol (e.g. 'BTC/USDT') |
| type | <code>string</code> | Yes | order type - the exchange automatically sets type to 'limit' if price defined, 'market' if undefined |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | amount of base currency to trade (can be undefined if using Spend_Limit) |
| price | <code>float</code> | No | price per unit of base currency for limit orders |
| params | <code>object</code> | No | extra parameters specific to the EllipX API endpoint |
| params.cost | <code>float</code> | No | maximum amount to spend in quote currency (required for market orders if amount undefined) |


```javascript
ellipx.createOrder (symbol, type, side[, amount, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order ID as returned by createOrder or fetchOrders |
| symbol | <code>string</code>, <code>undefined</code> | Yes | not used by ellipx.fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the EllipX API endpoint |


```javascript
ellipx.fetchOrder (id, symbol[, params])
```


<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

### fetchOrdersByStatus{docsify-ignore}
fetches a list of orders placed on the exchange

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | 'open' or 'closed', omit for all orders |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum amount of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol of the market orders were made in |
| since | <code>int</code>, <code>undefined</code> | timestamp in ms of the earliest order |
| limit | <code>int</code>, <code>undefined</code> | the maximum amount of orders to fetch |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchOrders (symbol, since, limit, params[])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on open orders made by the user

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.5z2nh2b5s81n  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol of the market orders were made in |
| since | <code>int</code>, <code>undefined</code> | timestamp in ms of the earliest order |
| limit | <code>int</code>, <code>undefined</code> | the maximum amount of orders to fetch |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchOpenOrders (symbol, since, limit, params[])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
Cancels an open order on the exchange

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Promise.&lt;object&gt;</code> - A Promise that resolves to the canceled order info

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.f1qu1pb1rebn  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | The order ID to cancel (format: mktor-xxxxx-xxxx-xxxx-xxxx-xxxxxxxx) |
| symbol | <code>string</code> | No | ellipx.cancelOrder does not use the symbol parameter |
| params | <code>object</code> | No | Extra parameters specific to the exchange API |


```javascript
ellipx.cancelOrder (id[, symbol, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
ellipx.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetches a crypto deposit address for a specific currency

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - an address structure {
    'currency': string, // unified currency code
    'address': string, // the address for deposits
    'tag': string|undefined, // tag/memo for deposits if needed
    'network': object, // network object from currency info
    'info': object // raw response from exchange
}

**Throws**:

- <code>ExchangeError</code> if currency does not support deposits

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.k7qe5aricayh  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code (e.g. "BTC", "ETH", "USDT") |
| params | <code>object</code> | No | extra parameters specific to the EllipX API endpoint |


```javascript
ellipx.fetchDepositAddress (code[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
Fetches the current trading fees (maker and taker) applicable to the user.

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>Promise.&lt;object&gt;</code> - A promise resolving to a unified trading fee structure:
{
    'info': object,        // the raw response from the exchange
    'symbol': undefined,   // symbol is not used for this exchange
    'maker': number,       // maker fee rate in decimal form
    'taker': number,       // taker fee rate in decimal form
    'percentage': true,    // indicates fees are in percentage
    'tierBased': false,    // indicates fees do not vary by volume tiers
}

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.kki5jay2c8it  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | Not used by EllipX as fees are not symbol-specific. |
| params | <code>object</code> | No | Extra parameters specific to the EllipX API endpoint. |


```javascript
ellipx.fetchTradingFee ([symbol, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
Make a withdrawal request

**Kind**: instance method of [<code>ellipx</code>](#ellipx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.google.com/document/d/1ZXzTQYffKE_EglTaKptxGQERRnunuLHEMmar7VC9syM/edit?tab=t.0#heading=h.zegupoa8g4t9  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>number</code> | Yes | Amount to withdraw |
| address | <code>string</code> | Yes | Destination wallet address |
| tag | <code>string</code> | No | Additional tag/memo for currencies that require it |
| params | <code>object</code> | Yes | Extra parameters specific to the EllipX API endpoint (Crypto_Chain__, Unit__) |


```javascript
ellipx.withdraw (code, amount, address[, tag, params])
```

