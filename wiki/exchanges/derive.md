
<a name="derive" id="derive"></a>

## derive{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchAccounts](#fetchaccounts)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchGreeks](#fetchgreeks)
* [fetchOption](#fetchoption)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchMySettlementHistory](#fetchmysettlementhistory)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingRate](#fetchfundingrate)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchPositions](#fetchpositions)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchBalance](#fetchbalance)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchBorrowRateHistory](#fetchborrowratehistory)
* [fetchBorrowInterest](#fetchborrowinterest)
* [withdraw](#withdraw)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [watchOrderBook](#watchorderbook)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchBidsAsks](#watchbidsasks)
* [unWatchOrderBook](#unwatchorderbook)
* [unWatchTrades](#unwatchtrades)
* [watchTrades](#watchtrades)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)
* [watchMyTrades](#watchmytrades)
* [unWatchMyTrades](#unwatchmytrades)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.derive.xyz/api-reference/system/publicget_time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchTime (params?)
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the subaccounts associated with the wallet

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [account structures](https://docs.ccxt.com/?id=account-structure)

**See**: https://docs.derive.xyz/api-reference/subaccounts/privateget_subaccounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchAccounts (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_all_currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchCurrencies (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for derive

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_all_instruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchMarkets (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchTicker (symbol, params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract market

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the open interest for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchOpenInterest (symbol, params?)
```


<a name="fetchGreeks" id="fetchgreeks"></a>

### fetchGreeks{docsify-ignore}
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/?id=greeks-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchGreeks (symbol, params?)
```


<a name="fetchOption" id="fetchoption"></a>

### fetchOption{docsify-ignore}
fetches option data that is commonly found in an option chain

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an [option structure](https://docs.ccxt.com/?id=option-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchOption (symbol, params?)
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
fetches historical settlement records, the venue publishes one underlying settlement price per currency and expiry rather than per option instrument, so the records carry no symbol

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/?id=settlement-history-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_option_settlement_prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of any market of the underlying currency to fetch the settlement history for |
| since | <code>int</code> | No | timestamp in ms of the earliest settlement to fetch |
| limit | <code>int</code> | No | the maximum number of settlements to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchSettlementHistory (symbol, since?, limit?, params?)
```


<a name="fetchMySettlementHistory" id="fetchmysettlementhistory"></a>

### fetchMySettlementHistory{docsify-ignore}
fetches historical settlement records of the user

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/?id=settlement-history-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_option_settlement_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the settlement history to fetch |
| since | <code>int</code> | No | timestamp in ms of the earliest settlement to fetch |
| limit | <code>int</code> | No | the maximum number of settlements to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchMySettlementHistory (symbol?, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_trade_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch; limits above ~500 cannot be filled in a single request because the venue caps pages at 1000 raw rows (two per match), use params.paginate instead |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
derive.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://docs.derive.xyz/api-reference/market-data/publicget_tradingview_chart_data      // trade candles
- https://docs.derive.xyz/api-reference/market-data/publicget_index_chart_data           // params.price = 'index'


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch; a single request covers at most 5000 candles from since, use params.paginate for wider ranges |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, also sizes the request window when since is not provided |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.price | <code>string</code> | No | "index" to fetch candles of the index price instead of trades, their volume is undefined |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
derive.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_funding_rate_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of funding rate structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_funding_rate_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.fetchFundingRate (symbol, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/orderbook/privateorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |
| params.triggerPrice | <code>float</code> | No | the price a standalone trigger (stop) order is triggered at |
| params.stopLossPrice | <code>float</code> | No | the price a standalone stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price a standalone take profit order is triggered at |
| params.trigger_price_type | <code>string</code> | No | the price type the trigger watches, only 'mark' is supported by the venue (default) |
| params.postOnly | <code>bool</code> | No | true makes the order post only |
| params.reduceOnly | <code>bool</code> | No | true reduces the position only, not available with post only |
| params.max_fee | <code>float</code> | No | *required* the maximum fee you are willing to pay for the order |


```javascript
derive.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/orderbook/privatereplace  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.editOrder (id, symbol, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/orderbook/privatecancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | whether the order is a trigger/algo order |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.cancelOrder (id, symbol, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.derive.xyz/api-reference/orderbook/privatecancel_by_instrument
- https://docs.derive.xyz/api-reference/orderbook/privatecancel_all


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.cancelAllOrders (symbol?, params?)
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user; only orders in a terminal state (filled, cancelled, expired) are returned, use fetchOpenOrders for orders resting on the order book

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_order_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.paginate | <code>boolean</code> | No | set to true if you want to fetch orders with pagination |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchCanceledAndClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user, a standalone trigger order is not visible here until it triggers, list those through fetchOpenOrders with params.trigger instead

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/orderbook/privateget_order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | not used by derive.fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchOrder (id, symbol?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on all currently open orders of the user resting on the order book

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.derive.xyz/api-reference/orderbook/privateget_open_orders
- https://docs.derive.xyz/api-reference/orderbook/privateget_trigger_orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | when true fetches the pending trigger orders that have not fired yet instead of the orders resting on the order book |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed (fully filled) orders made by the user

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_order_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | set to true if you want to fetch orders with pagination |


```javascript
derive.fetchClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_order_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
derive.fetchCanceledOrders (symbol, since?, limit?, params?)
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_trade_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchOrderTrades (id, symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_trade_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | set to true if you want to fetch trades with pagination |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchMyTrades (symbol, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.derive.xyz/api-reference/subaccounts/privateget_positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | not used by fetchPositions () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchPositions (symbols?, params?)
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_funding_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch funding history for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
derive.fetchFundingHistory (symbol?, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://docs.derive.xyz/api-reference/subaccounts/privateget_all_portfolios     // whole wallet
- https://docs.derive.xyz/api-reference/subaccounts/privateget_subaccount        // params.subaccount_id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>int</code> | No | scope the balance to a single subaccount instead of the whole wallet |


```javascript
derive.fetchBalance (params?)
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer a spot asset between subaccounts belonging to the same wallet

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://docs.derive.xyz/api-reference/transfers-&-withdrawals/privatetransfer_spot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | the subaccount id to transfer from |
| toAccount | <code>string</code> | Yes | the subaccount id to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.max_fee_usd | <code>float</code> | No | the maximum accepted fee in usd, default 0: transfers between existing subaccounts are free |
| params.new_subaccount_manager | <code>int</code> | No | a manager id creates a fresh subaccount under the sender wallet as the destination instead of toAccount, the creation charges a fee so max_fee_usd must cover it |


```javascript
derive.transfer (code, amount, fromAccount, toAccount, params?)
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch the spot transfer history of a subaccount

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_erc20_transfer_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest transfer to fetch |
| limit | <code>int</code> | No | the maximum number of transfers to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest transfer to fetch |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchTransfers (code?, since?, limit?, params?)
```


<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

### fetchBorrowRateHistory{docsify-ignore}
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure)

**See**: https://docs.derive.xyz/api-reference/market-data/publicget_interest_rate_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest rate to fetch |
| limit | <code>int</code> | No | the maximum number of rates to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest rate to fetch |
| params.risk_universe_id | <code>int</code> | No | the risk universe to read the rates from, default 1: without the filter the venue interleaves every universe with duplicate timestamps |
| params.period | <code>int</code> | No | the bucket size in seconds, default hourly |


```javascript
derive.fetchBorrowRateHistory (code, since?, limit?, params?)
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetches the interest accrued on the cash balance of a subaccount, the venue charges or pays it on the settlement currency only

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/?id=borrow-interest-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_interest_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | not used by derive.fetchBorrowInterest |
| since | <code>int</code> | No | timestamp in ms of the earliest interest event to fetch |
| limit | <code>int</code> | No | the maximum number of interest events to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest interest event to fetch |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchBorrowInterest (code?, symbol?, since?, limit?, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal to an L1 address, the payout defaults to the owner wallet and a session key may only pay out to the owner wallet or a whitelisted recipient

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.derive.xyz/api-reference/transfers-&-withdrawals/privatewithdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the L1 address to withdraw to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.max_fee_usd | <code>float</code> | No | the maximum accepted fee in usd, default 1, or 10 with force_batch |
| params.force_batch | <code>bool</code> | No | pay the higher fee to have the withdrawal batch proven immediately |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.withdraw (code, amount, address, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_deposit_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchDeposits (code, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.derive.xyz/api-reference/history/privateget_withdrawal_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.fetchWithdrawals (code, since?, limit?, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://docs.derive.xyz/api-reference/channels/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.watchOrderBook (symbol, limit?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.derive.xyz/api-reference/channels/tickerslim  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.watchTicker (symbol, params?)
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unsubscribe from the ticker channel; note that the bid ask feed of the same symbol shares the channel and stops as well

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://docs.derive.xyz/api-reference/channels/tickerslim  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.unWatchTicker (symbol, params?)
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols; the data is sourced from the same ticker_slim channel the ticker uses

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.derive.xyz/api-reference/channels/tickerslim  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the bids and asks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.watchBidsAsks (symbols, params?)
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |


```javascript
derive.unWatchOrderBook (symbol, params?)
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>any</code> - status of the unwatch request


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.unWatchTrades (symbol, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.derive.xyz/api-reference/channels/tradesbyinstrument  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
derive.watchTrades (symbol, since?, limit?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.derive.xyz/api-reference/channels/subaccountorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.watchOrders (symbol, since?, limit?, params?)
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unsubscribe from the orders channel

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://docs.derive.xyz/api-reference/channels/subaccountorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | not used by derive unWatchOrders, the whole subaccount channel is unsubscribed |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.unWatchOrders (symbol?, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://docs.derive.xyz/api-reference/channels/subaccounttrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.watchMyTrades (symbol, since?, limit?, params?)
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unsubscribe from the my trades channel

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://docs.derive.xyz/api-reference/channels/subaccounttrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | not used by derive unWatchMyTrades, the whole subaccount channel is unsubscribed |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |


```javascript
derive.unWatchMyTrades (symbol?, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watches balance updates for a single subaccount, the returned structure is scoped to the watched subaccount

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://docs.derive.xyz/api-reference/channels/subaccountbalances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |
| params.fetchBalanceSnapshot | <code>boolean</code> | No | default true, the channel only streams changed totals, so an initial snapshot is loaded over rest before subscribing |


```javascript
derive.watchBalance (params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions; the sizes stream over the balances channel, while entry price, pnl and margin fields stay from the rest snapshot until the next one

**Kind**: instance method of [<code>derive</code>](#derive)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.derive.xyz/api-reference/channels/subaccountbalances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to watch positions for |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subaccount_id | <code>string</code> | No | *required* the subaccount id |
| params.fetchPositionsSnapshot | <code>boolean</code> | No | default true, the channel only streams size changes, so an initial snapshot is loaded over rest before subscribing |


```javascript
derive.watchPositions (symbols?, since?, limit?, params?)
```

