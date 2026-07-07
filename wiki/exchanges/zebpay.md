
<a name="zebpay" id="zebpay"></a>

## zebpay{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrder](#fetchorder)
* [closePosition](#closeposition)
* [fetchLeverages](#fetchleverages)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchPositions](#fetchpositions)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#system-status
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchStatus (params?)
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the poloniexfutures server

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the poloniexfutures server

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-server-time
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchTime (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for zebpay

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-trading-pairs
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#fetch-markets


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |


```javascript
zebpay.fetchMarkets (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-coin-settings  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchCurrencies (params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-exchange-fee
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fee-single-symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>object</code> | No | side to fetch trading fee |


```javascript
zebpay.fetchTradingFee (symbol, params?)
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchTradingFees (params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-order-book
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-order-book


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-ticker
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-24hr-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchTicker (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchTickers (symbols, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-klinescandlesticks
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#-get-k-lines-ohlcv-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.endtime | <code>int</code> | No | the latest time in ms to fetch orders for |


```javascript
zebpay.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-recent-trades
- https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-aggregate-trades


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-trade-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchMyTrades (symbol, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-account-balance
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchBalance (params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#place-new-order
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.formType | <code>string</code> | No | The price at which a trigger order is triggered at |
| params.marginAsset | <code>string</code> | No | The asset the order creates, default is INR. |
| params.takeProfit | <code>boolean</code> | No | Takeprofit flag for the order. |
| params.stopLoss | <code>boolean</code> | No | Stop loss flag for the order. |
| params.positionId | <code>string</code> | No | PositionId of the order. |


```javascript
zebpay.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-order
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timestamp | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.cancelOrder (id, symbol, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancels all open orders

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timestamp | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.cancelOrders (symbol, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on multiple open orders made by the user

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-orders
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-details
- [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | cancel order by client order id |
| params.timestamp | <code>string</code> | No | cancel order by client order id |


```javascript
zebpay.fetchOrder (id, symbol, params?)
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>Array&lt;object&gt;</code> - [A list of position structures](https://docs.ccxt.com/?id=position-structure)

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | Yes | not used by kucoinfutures closePositions |
| params | <code>object</code> | No | extra parameters specific to the okx api endpoint |
| params.positionId | <code>string</code> | No | client order id of the order |


```javascript
zebpay.closePosition (symbol, side, params?)
```


<a name="fetchLeverages" id="fetchleverages"></a>

### fetchLeverages{docsify-ignore}
fetch the set leverage for all contract and margin markets

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a list of [leverage structures](https://docs.ccxt.com/?id=leverage-structure)

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchLeverages (symbols?, params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.fetchLeverage (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - response from the exchange

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
zebpay.setLeverage (leverage, symbol, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
Fetches current contract trading positions

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: Parsed exchange response for positions

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | List of unified symbols |
| params | <code>object</code> | No | Not used by krakenfutures |


```javascript
zebpay.fetchPositions (symbols, params?)
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint. |
| params.positionId | <code>string</code> | No | PositionId of the order to add margin. |
| params.timestamp | <code>string</code> | No | Tiemstamp. |


```javascript
zebpay.addMargin (symbol, amount, params?)
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>zebpay</code>](#zebpay)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol. |
| amount | <code>float</code> | Yes | amount of margin to add. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint. |
| params.positionId | <code>string</code> | No | PositionId of the order to add margin. |
| params.timestamp | <code>string</code> | No | Tiemstamp. |


```javascript
zebpay.reduceMargin (symbol, amount, params?)
```

