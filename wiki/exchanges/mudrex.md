
<a name="mudrex" id="mudrex"></a>

## mudrex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchOHLCV](#fetchohlcv)
* [fetchMarkOHLCV](#fetchmarkohlcv)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchMarkets](#fetchmarkets)
* [fetchBalance](#fetchbalance)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchPositions](#fetchpositions)
* [fetchPositionsHistory](#fetchpositionshistory)
* [closePosition](#closeposition)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [fetchMyTrades](#fetchmytrades)
* [transfer](#transfer)

<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.trade.mudrex.com/docs/historical-kline  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.price | <code>string</code> | No | "mark" to fetch mark price candles |


```javascript
mudrex.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchMarkOHLCV" id="fetchmarkohlcv"></a>

### fetchMarkOHLCV{docsify-ignore}
fetches historical mark price candlestick data containing the open, high, low, and close price of a market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchMarkOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchTicker (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchTickers (symbols?, params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for the exchange

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchMarkets (params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'swap' (default) or 'spot' - which wallet balance to fetch |
| params.trade_currency | <code>string</code> | No | the settlement currency to query the balance for |


```javascript
mudrex.fetchBalance (params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchLeverage (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginType | <code>string</code> | No | 'ISOLATED' (default) or 'CROSSED' |


```javascript
mudrex.setLeverage (leverage, symbol, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency (also required for market orders on this exchange) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>int</code> | No | leverage for the order, required if setLeverage() was not called beforehand |
| params.reduceOnly | <code>bool</code> | No | true if the order is reduce only |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the trigger price of the take-profit order attached to this order |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the trigger price of the stop-loss order attached to this order |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.takeProfitPrice | <code>float</code> | No | the trigger price for a standalone take-profit order on an existing position (requires params.positionId) |
| params.stopLossPrice | <code>float</code> | No | the trigger price for a standalone stop-loss order on an existing position (requires params.positionId) |
| params.positionId | <code>string</code> | No | the id of the position the standalone stopLossPrice/takeProfitPrice order is attached to |
| params.trade_currency | <code>string</code> | No | the settlement currency for the order |


```javascript
mudrex.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.editOrder (id, symbol, type, side, amount?, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.cancelOrder (id, symbol?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchOrder (id, symbol?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.fetchClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trade_currency | <code>string</code> | No | the settlement currency to query positions for |


```javascript
mudrex.fetchPositions (symbols?, params?)
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches the history of closed positions

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.trade.mudrex.com/docs/get-position-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of position structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trade_currency | <code>string</code> | No | the settlement currency to filter positions by |


```javascript
mudrex.fetchPositionsHistory (symbols?, since?, limit?, params?)
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position for a market

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| side | <code>string</code> | No | 'buy' or 'sell', not required by mudrex |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.position_id | <code>string</code> | No | the id of the position to close, resolved from the symbol if not provided |
| params.amount | <code>float</code> | No | the amount to close for a partial close, closes the whole position if not provided |


```javascript
mudrex.closePosition (symbol, side?, params?)
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin to a position

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.position_id | <code>string</code> | No | the id of the position to add margin to, resolved from the symbol if not provided |


```javascript
mudrex.addMargin (symbol, amount, params?)
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.reduceMargin (symbol, amount, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trade_currency | <code>string</code> | No | the settlement currency to filter trades by |


```javascript
mudrex.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>mudrex</code>](#mudrex)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.trade.mudrex.com/docs  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | 'spot' or 'futures' |
| toAccount | <code>string</code> | Yes | 'spot' or 'futures' |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mudrex.transfer (code, amount, fromAccount, toAccount, params?)
```

