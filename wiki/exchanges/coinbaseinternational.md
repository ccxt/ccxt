
<a name="coinbaseinternational" id="coinbaseinternational"></a>

## coinbaseinternational{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchBalance](#fetchbalance)
* [fetchTransfers](#fetchtransfers)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchMyTrades](#fetchmytrades)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [watchBalance](#watchbalance)
* [watchMyTrades](#watchmytrades)
* [unWatchMyTrades](#unwatchmytrades)
* [watchOrders](#watchorders)
* [watchOrdersForSymbols](#watchordersforsymbols)
* [unWatchOrders](#unwatchorders)
* [watchPositions](#watchpositions)
* [unWatchPositions](#unwatchpositions)
* [watchFundingRate](#watchfundingrate)
* [watchFundingRates](#watchfundingrates)
* [unWatchFundingRate](#unwatchfundingrate)
* [unWatchFundingRates](#unwatchfundingrates)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchMarkPrice](#watchmarkprice)
* [watchMarkPrices](#watchmarkprices)
* [unWatchMarkPrice](#unwatchmarkprice)
* [unWatchMarkPrices](#unwatchmarkprices)
* [watchBidsAsks](#watchbidsasks)
* [unWatchBidsAsks](#unwatchbidsasks)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCV](#unwatchohlcv)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBook](#unwatchorderbook)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelAllOrdersWs](#cancelallordersws)
* [fetchOrderWs](#fetchorderws)
* [fetchOpenOrdersWs](#fetchopenordersws)
* [fetchOrdersWs](#fetchordersws)
* [fetchBalanceWs](#fetchbalancews)
* [fetchMyTradesWs](#fetchmytradesws)
* [fetchPositionsWs](#fetchpositionsws)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**

- https://docs.cdp.coinbase.com/api-reference/supporting/public-get_time
- https://docs.deribit.com/api-reference/supporting/public-get_time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchTime (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for coinbaseinternational

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-get_instruments
- https://docs.deribit.com/api-reference/market-data/public-get_instruments


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.currency | <code>string</code> | No | settlement currency filter, defaults to any on Deribit |


```javascript
coinbaseinternational.fetchMarkets (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-get_currencies
- https://docs.deribit.com/api-reference/market-data/public-get_currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchCurrencies (params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-get_tradingview_chart_data
- https://docs.deribit.com/api-reference/market-data/public-get_tradingview_chart_data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, default 100 max 10000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbaseinternational.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-get_funding_rate_history
- https://docs.deribit.com/api-reference/market-data/public-get_funding_rate_history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |
| params.paginate | <code>boolean</code> | No | native Deribit automatic pagination is not supported |


```javascript
coinbaseinternational.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-ticker
- https://docs.deribit.com/api-reference/market-data/public-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchTickers (symbols, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-ticker
- https://docs.deribit.com/api-reference/market-data/public-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchTicker (symbol, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches a market order book

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/market-data/public-get_order_book
- https://docs.deribit.com/api-reference/market-data/public-get_order_book


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| limit | <code>int</code> | No | the maximum number of bids and asks to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
- https://docs.deribit.com/api-reference/account-management/private-get_account_summaries
- https://docs.deribit.com/api-reference/account-management/private-get_account_summary


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.code | <code>string</code> | No | unified currency code for a native Deribit single account summary |


```javascript
coinbaseinternational.fetchBalance (params?)
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
- https://docs.deribit.com/api-reference/account-management/private-get_transaction_log


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.until | <code>int</code> | No | timestamp in ms of the latest transfer to fetch |
| params.continuation | <code>string</code> | No | continuation token for pagination |


```javascript
coinbaseinternational.fetchTransfers (code, since?, limit?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_position
- https://docs.deribit.com/api-reference/account-management/private-get_position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchPosition (symbol, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
- https://docs.deribit.com/api-reference/account-management/private-get_positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.currency | <code>string</code> | No | settlement currency filter |
| params.kind | <code>string</code> | No | instrument kind filter |


```javascript
coinbaseinternational.fetchPositions (symbols?, params?)
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
- https://docs.deribit.com/api-reference/account-management/private-get_transaction_log


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest transaction to fetch |
| limit | <code>int</code> | No | the maximum number of transactions to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.until | <code>int</code> | No | timestamp in ms of the latest transaction to fetch |
| params.query | <code>string</code> | No | transaction-log query filter |
| params.continuation | <code>string</code> | No | continuation token for pagination |


```javascript
coinbaseinternational.fetchDepositsWithdrawals (code, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
- https://docs.deribit.com/api-reference/account-management/private-get_transaction_log


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.until | <code>int</code> | No | timestamp in ms of the latest transaction to fetch |
| params.continuation | <code>string</code> | No | continuation token for pagination |


```javascript
coinbaseinternational.fetchWithdrawals (code, since?, limit?, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_transaction_log
- https://docs.deribit.com/api-reference/account-management/private-get_transaction_log


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.until | <code>int</code> | No | timestamp in ms of the latest transaction to fetch |
| params.continuation | <code>string</code> | No | continuation token for pagination |


```javascript
coinbaseinternational.fetchDeposits (code, since?, limit?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-buy
- https://docs.cdp.coinbase.com/api-reference/trading/private-sell
- https://docs.deribit.com/api-reference/trading/private-buy
- https://docs.deribit.com/api-reference/trading/private-sell


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot) |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.stopPrice | <code>float</code> | No | alias for triggerPrice |
| params.triggerPrice | <code>float</code> | No | price to trigger stop orders |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop-loss orders |
| params.postOnly | <code>bool</code> | No | true or false |
| params.tif | <code>string</code> | No | 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders |
| params.expire_time | <code>string</code> | No | The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z) |
| params.stp_mode | <code>string</code> | No | Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders. |


```javascript
coinbaseinternational.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
- https://docs.deribit.com/api-reference/trading/private-cancel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by cancelOrder() |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.cancelOrder (id, symbol, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
- https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
- https://docs.deribit.com/api-reference/trading/private-cancel_all
- https://docs.deribit.com/api-reference/trading/private-cancel_all_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.cancelAllOrders (symbol?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-edit
- https://docs.deribit.com/api-reference/trading/private-edit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot) |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.triggerPrice | <code>float</code> | No | price to trigger stop orders |


```javascript
coinbaseinternational.editOrder (id, symbol, type, side, amount, price?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
- https://docs.deribit.com/api-reference/trading/private-get_order_state


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified market symbol that the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchOrder (id, symbol, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on all currently open orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
- https://docs.deribit.com/api-reference/trading/private-get_open_orders_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.paginate | <code>boolean</code> | No | native Deribit pagination is not supported |
| params.offset | <code>int</code> | No | offset |
| params.event_type | <code>string</code> | No | The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED |


```javascript
coinbaseinternational.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by-instrument
- https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument
- https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument_and_time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the trades |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of trade structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.historical | <code>boolean</code> | No | native Deribit indexed history, excludes recent trades |
| params.until | <code>int</code> | No | native Deribit latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | native Deribit automatic pagination is not supported |


```javascript
coinbaseinternational.fetchMyTrades (symbol, since?, limit?, params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://docs.cdp.coinbase.com/api-reference/account-management/private-get_leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route; native route throws NotSupported; get_leverage is gateway-only |
| params.isolated | <code>boolean</code> | No | set to true for isolated margin |
| params.subaccount_id | <code>int</code> | No | The user id for the subaccount, available to retail broker callers, defaults to the authenticated account |


```javascript
coinbaseinternational.fetchLeverage (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.cdp.coinbase.com/api-reference/trading/private-set_leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>int</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route; native route throws NotSupported; set_leverage is gateway-only |
| params.isolated | <code>boolean</code> | No | set to true for isolated margin |
| params.subaccount_id | <code>int</code> | No | The user id for the subaccount, available to retail broker callers, defaults to the authenticated account |


```javascript
coinbaseinternational.setLeverage (leverage, symbol, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userportfoliocurrency
- https://docs.deribit.com/subscriptions/user/userportfoliocurrency


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.currency | <code>string</code> | No | currency code to watch, default is any |


```javascript
coinbaseinternational.watchBalance (params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches trades associated with the user

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/usertradesinstrument_nameinterval
- https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default raw |


```javascript
coinbaseinternational.watchMyTrades (symbol?, since?, limit?, params?)
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
stops watching user trades

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchMyTrades (symbol?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on orders made by the user

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
- https://docs.deribit.com/subscriptions/user/userordersinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default raw |


```javascript
coinbaseinternational.watchOrders (symbol?, since?, limit?, params?)
```


<a name="watchOrdersForSymbols" id="watchordersforsymbols"></a>

### watchOrdersForSymbols{docsify-ignore}
watches information on orders made by the user for multiple symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userordersinstrument_nameinterval
- https://docs.deribit.com/subscriptions/user/userordersinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest order to fetch |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchOrdersForSymbols (symbols, since?, limit?, params?)
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
stops watching user orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchOrders (symbol?, params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watches all open positions

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/user/userchangesinstrument_nameinterval
- https://docs.deribit.com/subscriptions/user/userchangesinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch |
| limit | <code>int</code> | No | the maximum number of positions to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default raw |


```javascript
coinbaseinternational.watchPositions (symbols?, since?, limit?, params?)
```


<a name="unWatchPositions" id="unwatchpositions"></a>

### unWatchPositions{docsify-ignore}
stops watching open positions

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/private-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/private-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchPositions (symbols?, params?)
```


<a name="watchFundingRate" id="watchfundingrate"></a>

### watchFundingRate{docsify-ignore}
watch the current funding rate

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
- https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchFundingRate (symbol, params?)
```


<a name="watchFundingRates" id="watchfundingrates"></a>

### watchFundingRates{docsify-ignore}
watch the funding rate for multiple markets

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of [funding rates structures](https://docs.ccxt.com/?id=funding-rates-structure), indexe by market symbols

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
- https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchFundingRates (symbols, params?)
```


<a name="unWatchFundingRate" id="unwatchfundingrate"></a>

### unWatchFundingRate{docsify-ignore}
stops watching the funding rate for a symbol

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchFundingRate (symbol, params?)
```


<a name="unWatchFundingRates" id="unwatchfundingrates"></a>

### unWatchFundingRates{docsify-ignore}
stops watching funding rates for multiple symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchFundingRates (symbols?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
- https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default 100ms |


```javascript
coinbaseinternational.watchTicker (symbol?, params?)
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
stops watching a ticker

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchTicker (symbol, params?)
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
- https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default 100ms |


```javascript
coinbaseinternational.watchTickers (symbols?, params?)
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
stops watching tickers

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchTickers (symbols?, params?)
```


<a name="watchMarkPrice" id="watchmarkprice"></a>

### watchMarkPrice{docsify-ignore}
watches a mark price for a specific market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
- https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default 100ms |


```javascript
coinbaseinternational.watchMarkPrice (symbol, params?)
```


<a name="watchMarkPrices" id="watchmarkprices"></a>

### watchMarkPrices{docsify-ignore}
watches the mark price for multiple markets

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/tickerinstrument_nameinterval
- https://docs.deribit.com/subscriptions/market-data/tickerinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to watch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |
| params.interval | <code>string</code> | No | notification interval, default 100ms |


```javascript
coinbaseinternational.watchMarkPrices (symbols, params?)
```


<a name="unWatchMarkPrice" id="unwatchmarkprice"></a>

### unWatchMarkPrice{docsify-ignore}
stops watching the mark price for a symbol

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchMarkPrice (symbol, params?)
```


<a name="unWatchMarkPrices" id="unwatchmarkprices"></a>

### unWatchMarkPrices{docsify-ignore}
stops watching mark prices for multiple symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchMarkPrices (symbols?, params?)
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/quoteinstrument_name
- https://docs.deribit.com/subscriptions/market-data/quoteinstrument_name


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to watch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchBidsAsks (symbols?, params?)
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
stops watching best bid & ask for symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchBidsAsks (symbols?, params?)
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
- https://docs.deribit.com/subscriptions/market-data/charttradesinstrument_nameresolution


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data for multiple markets and timeframes

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of OHLCV arrays indexed by symbol and timeframe

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/market-data/charttradesinstrument_nameresolution
- https://docs.deribit.com/subscriptions/market-data/charttradesinstrument_nameresolution


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchOHLCVForSymbols (symbolsAndTimeframes, since?, limit?, params?)
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
stops watching OHLCV data for a symbol

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchOHLCV (symbol, timeframe, params?)
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
stops watching OHLCV data for multiple symbols and timeframes

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchOHLCVForSymbols (symbolsAndTimeframes, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
- https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchTrades (symbol, since?, limit?, params?)
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/trades/tradesinstrument_nameinterval
- https://docs.deribit.com/subscriptions/trades/tradesinstrument_nameinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchTradesForSymbols (symbols, since?, limit?, params?)
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
stops watching trades for a symbol

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchTrades (symbol, params?)
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
stops watching trades for multiple symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchTradesForSymbols (symbols, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
- https://docs.deribit.com/subscriptions/orderbook/bookinstrument_nameinterval
- https://docs.deribit.com/subscriptions/orderbook/bookinstrument_namegroupdepthinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchOrderBook (symbol, limit?, params?)
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/coinbase-deribit-app-api/websocket/orderbook/bookinstrument_nameinterval
- https://docs.deribit.com/subscriptions/orderbook/bookinstrument_nameinterval
- https://docs.deribit.com/subscriptions/orderbook/bookinstrument_namegroupdepthinterval


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.watchOrderBookForSymbols (symbols, limit?, params?)
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
stops watching an order book

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchOrderBook (symbol, params?)
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
stops watching order books for multiple symbols

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - the exchange response

**See**

- https://docs.cdp.coinbase.com/api-reference/subscription-management/public-unsubscribe
- https://docs.deribit.com/api-reference/subscription-management/public-unsubscribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.unWatchOrderBookForSymbols (symbols, params?)
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-buy
- https://docs.cdp.coinbase.com/api-reference/trading/private-sell
- https://docs.deribit.com/api-reference/trading/private-buy
- https://docs.deribit.com/api-reference/trading/private-sell


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | number of contracts for native Deribit derivatives, otherwise the exchange order amount (base currency for spot) |
| price | <code>float</code> | No | the price at which the order is to be fulfilled |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.createOrderWs (symbol, type, side, amount, price?, params?)
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-edit
- https://docs.deribit.com/api-reference/trading/private-edit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| type | <code>string</code> | Yes | not used by coinbaseinternational editOrderWs |
| side | <code>string</code> | Yes | not used by coinbaseinternational editOrderWs |
| amount | <code>float</code> | No | new order amount, in contracts for native Deribit derivatives |
| price | <code>float</code> | No | new order price |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.editOrderWs (id, symbol, type, side, amount?, price?, params?)
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-cancel
- https://docs.deribit.com/api-reference/trading/private-cancel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.cancelOrderWs (id, symbol?, params?)
```


<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

### cancelAllOrdersWs{docsify-ignore}
cancels all open orders over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all
- https://docs.cdp.coinbase.com/api-reference/trading/private-cancel_all_by_instrument
- https://docs.deribit.com/api-reference/trading/private-cancel_all
- https://docs.deribit.com/api-reference/trading/private-cancel_all_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.cancelAllOrdersWs (symbol?, params?)
```


<a name="fetchOrderWs" id="fetchorderws"></a>

### fetchOrderWs{docsify-ignore}
fetches an order over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_state
- https://docs.deribit.com/api-reference/trading/private-get_order_state


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchOrderWs (id, symbol?, params?)
```


<a name="fetchOpenOrdersWs" id="fetchopenordersws"></a>

### fetchOpenOrdersWs{docsify-ignore}
fetches open orders over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_open_orders_by_instrument
- https://docs.deribit.com/api-reference/trading/private-get_open_orders_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchOpenOrdersWs (symbol, since?, limit?, params?)
```


<a name="fetchOrdersWs" id="fetchordersws"></a>

### fetchOrdersWs{docsify-ignore}
fetches order history over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_order_history_by_instrument
- https://docs.deribit.com/api-reference/trading/private-get_order_history_by_instrument


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the maximum number of orders to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchOrdersWs (symbol, since?, limit?, params?)
```


<a name="fetchBalanceWs" id="fetchbalancews"></a>

### fetchBalanceWs{docsify-ignore}
fetches the balance over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_account_summaries
- https://docs.deribit.com/api-reference/account-management/private-get_account_summaries
- https://docs.deribit.com/api-reference/account-management/private-get_account_summary


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchBalanceWs (params?)
```


<a name="fetchMyTradesWs" id="fetchmytradesws"></a>

### fetchMyTradesWs{docsify-ignore}
fetches user trades over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/trading/private-get_user_trades_by_instrument
- https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument
- https://docs.deribit.com/api-reference/trading/private-get_user_trades_by_instrument_and_time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest trade |
| limit | <code>int</code> | No | the maximum number of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchMyTradesWs (symbol, since?, limit?, params?)
```


<a name="fetchPositionsWs" id="fetchpositionsws"></a>

### fetchPositionsWs{docsify-ignore}
fetches open positions over websocket

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://docs.cdp.coinbase.com/api-reference/account-management/private-get_positions
- https://docs.deribit.com/api-reference/account-management/private-get_positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.route | <code>string</code> | No | auto (default), deribit, or coinbase; overrides options.route |


```javascript
coinbaseinternational.fetchPositionsWs (symbols?, params?)
```

