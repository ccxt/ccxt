
<a name="backpack" id="backpack"></a>

## backpack{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRate](#fetchfundingrate)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchBalance](#fetchbalance)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [fetchDepositAddress](#fetchdepositaddress)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOpenOrder](#fetchopenorder)
* [fetchOrder](#fetchorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrders](#fetchorders)
* [fetchPositions](#fetchpositions)
* [fetchFundingHistory](#fetchfundinghistory)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchBidsAsks](#watchbidsasks)
* [unWatchBidsAsks](#unwatchbidsasks)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBook](#unwatchorderbook)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)
* [watchBalance](#watchbalance)
* [unWatchBalance](#unwatchbalance)
* [watchPositions](#watchpositions)
* [unWatchPositions](#unwatchpositions)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches available crypto and tokenized stock currencies from the assets endpoint

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.backpack.exchange/#tag/Assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | return tokenized stock assets only |


```javascript
backpack.fetchCurrencies (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves venue markets and tokenized stock RFQ markets discovered from securities

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.backpack.exchange/#tag/Markets/operation/get_markets
- https://docs.backpack.exchange/#tag/Stocks/operation/get_securities


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | return tokenized stock markets only |
| params.marketType | <code>string</code>, <code>Array&lt;string&gt;</code> | No | market types to discover: spot, swap or stock |


```javascript
backpack.fetchMarkets (params?)
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetches an indicative quote for converting between a tokenized stock and its quote currency

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - indicative conversion estimate; the price is a bound and is not guaranteed

**See**: https://docs.backpack.exchange/#tag/Stocks/operation/get_stock_indicative_quote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency to convert from |
| toCode | <code>string</code> | Yes | the currency to convert to |
| amount | <code>float</code> | Yes | amount in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.price | <code>float</code> | No | optional limit price when converting quote currency to stock |


```javascript
backpack.fetchConvertQuote (fromCode, toCode, amount, params?)
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
converts between a tokenized stock and its quote currency through a bounded RFQ

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - conversion result; RFQ submission may remain open and is not necessarily a fill

**See**

- https://docs.backpack.exchange/#tag/RFQ/operation/submit_rfq
- https://docs.backpack.exchange/#tag/RFQ/operation/accept_quote


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | RFQ identifier when accepting a quote, or a numeric client identifier for a new RFQ |
| fromCode | <code>string</code> | Yes | the currency to convert from |
| toCode | <code>string</code> | Yes | the currency to convert to |
| amount | <code>float</code> | No | amount in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.quoteId | <code>string</code> | No | accept this quote for RFQ id supplied as id |
| params.price | <code>float</code> | No | price bound from fetchConvertQuote; required when buying stock |
| params.baseAmount | <code>float</code> | No | stock quantity when converting quote currency to stock |
| params.clientOrderId | <code>int</code> | No | requester client identifier for a newly submitted RFQ |


```javascript
backpack.createConvertTrade (id, fromCode, toCode, amount?, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches venue or external provider statistics, not executable RFQ prices

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | return tokenized stock tickers only; inferred from requested symbols when omitted |
| params.source | <code>string</code> | No | Venue or External; RFQ symbols default to External, other symbols default to Venue |
| params.interval | <code>string</code> | No | ticker interval, External requires 1d |


```javascript
backpack.fetchTickers (symbols, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches underlying venue or external stock statistics, not an executable RFQ quote

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock data; inferred from symbol when omitted |
| params.source | <code>string</code> | No | Venue or External; RFQ symbols default to External |
| params.interval | <code>string</code> | No | ticker interval, External requires 1d |


```javascript
backpack.fetchTicker (symbol, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches venue order-book depth, RFQ and external provider depth are not supported

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_depth  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default 100, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects a tokenized stock spot order book; inferred from symbol when omitted |
| params.source | <code>string</code> | No | Venue, External provider depth is not supported |


```javascript
backpack.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches venue or external stock candlestick data for the underlying market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - a list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_klines  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in milliseconds of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (default 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock data; inferred from symbol when omitted |
| params.source | <code>string</code> | No | Venue or External; RFQ symbols default to External |
| params.price | <code>string</code> | No | last, mark or index, External requires last |
| params.priceType | <code>string</code> | No | Last, Mark or Index, External requires Last |
| params.until | <code>int</code> | No | latest candle timestamp in milliseconds |


```javascript
backpack.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_mark_prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
backpack.fetchFundingRate (symbol, params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a derivative trading pair

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=interest-history-structure](https://docs.ccxt.com/?id=interest-history-structure)

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_open_interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
backpack.fetchOpenInterest (symbol, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://docs.backpack.exchange/#tag/Markets/operation/get_funding_interval_rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of funding rate structures |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
backpack.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
gets recent venue order-book trades, not public RFQ or external provider fills

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://docs.backpack.exchange/#tag/Trades/operation/get_recent_trades
- https://docs.backpack.exchange/#tag/Trades/operation/get_historical_trades


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.offset | <code>int</code> | No | the number of trades to skip, default is 0 |
| params.stock | <code>boolean</code> | No | selects tokenized stock spot trades; inferred from symbol when omitted |


```javascript
backpack.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetches venue fills or requester RFQ fills, combining stock records when no symbol is supplied

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://docs.backpack.exchange/#tag/History/operation/get_fills
- https://docs.backpack.exchange/#tag/RFQ/operation/get_rfq_fill_history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for, locally filtered for RFQ history pages |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve (default 100, max 1000) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for, locally filtered for RFQ history pages |
| params.stock | <code>boolean</code> | No | selects tokenized stock fills; inferred from symbol when omitted |
| params.rfq | <code>boolean</code> | No | selects requester RFQ fills only, inferred from RFQ symbols |
| params.offset | <code>int</code> | No | exchange history pagination offset |
| params.sortDirection | <code>string</code> | No | Asc or Desc |
| params.deferredSettlement | <code>boolean</code> | No | selects deferred or immediate RFQ settlement records |
| params.fillType | <code>string</code> | No | User or CollateralConversion for RFQs, additional exchange-specific types for venue fills |


```javascript
backpack.fetchMyTrades (symbol, since?, limit?, params?)
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**: https://docs.backpack.exchange/#tag/System/operation/get_status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
backpack.fetchStatus (params?)
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://developer-pro.bitmart.com/en/spot/#get-system-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
backpack.fetchTime (params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
queries the capital account, optionally filtering tokenized stock assets locally

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://docs.backpack.exchange/#tag/Capital/operation/get_balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | return tokenized stock holdings only, without quote-currency cash |


```javascript
backpack.fetchBalance (params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.backpack.exchange/#tag/Capital/operation/get_deposits  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
backpack.fetchDeposits (code, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |


```javascript
backpack.fetchWithdrawals (code, since?, limit?, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://docs.backpack.exchange/#tag/Capital/operation/request_withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>string</code> | No | memo / destination tag, required for currencies in options['withdrawTagRequiredCurrencies'] |
| params.network | <code>string</code> | Yes | the network to withdraw on (mandatory) |


```javascript
backpack.withdraw (code, amount, address, params?)
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://docs.backpack.exchange/#tag/Capital/operation/get_deposit_address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.networkCode | <code>string</code> | No | the network to fetch the deposit address (mandatory) |


```javascript
backpack.fetchDepositAddress (code, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
creates a venue order or bounded requester RFQ for a tokenized stock

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.backpack.exchange/#tag/Order/operation/execute_order
- https://docs.backpack.exchange/#tag/RFQ/operation/submit_rfq


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | quantity in base currency, RFQs require base quantity |
| price | <code>float</code> | No | limit price, ignored for venue market orders but an optional execution bound for market RFQs |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | venue market orders only, quote-currency cost instead of amount |
| params.stock | <code>boolean</code> | No | selects tokenized stock spot or RFQ execution; inferred from symbol when omitted |
| params.executionMode | <code>string</code> | No | RFQ only, Immediate (default) or AwaitAccept for manually accepted limit RFQs |
| params.orderExpiryTime | <code>int</code> | No | RFQ only, resting Immediate RFQ expiry in milliseconds |
| params.clientOrderId | <code>int</code> | No | a unique id for the order |
| params.postOnly | <code>boolean</code> | No | venue orders only, true to place a post only order |
| params.timeInForce | <code>string</code> | No | venue orders only, GTC, IOC, FOK or PO |
| params.reduceOnly | <code>bool</code> | No | contracts only, reduces a position |
| params.selfTradePrevention | <code>string</code> | No | venue orders only, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH |
| params.autoLend | <code>bool</code> | No | lend if required |
| params.autoLendRedeem | <code>bool</code> | No | redeem a lend if required |
| params.autoBorrow | <code>bool</code> | No | borrow if required |
| params.autoBorrowRepay | <code>bool</code> | No | repay a borrow if required |
| params.triggerPrice | <code>float</code> | No | venue orders only, trigger price |
| params.takeProfit | <code>object</code> | No | swap markets only, attached take profit order |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.takeProfit.price | <code>float</code> | No | take profit limit price, omitted for a market order |
| params.stopLoss | <code>object</code> | No | swap markets only, attached stop loss order |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.stopLoss.price | <code>float</code> | No | stop loss limit price, omitted for a market order |


```javascript
backpack.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
creates venue order-book orders, RFQ batches are not supported

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.backpack.exchange/#tag/Order/operation/execute_order_batch  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock spot execution for all orders, otherwise inferred per symbol |


```javascript
backpack.createOrders (orders, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches open venue orders or RFQs with their candidate quotes

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.backpack.exchange/#tag/Order/operation/get_open_orders
- https://docs.backpack.exchange/#tag/RFQ/operation/get_open_rfqs


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders; inferred from symbol when provided, otherwise selects both venue/RFQ records |
| params.rfq | <code>boolean</code> | No | selects requester RFQs only, inferred from RFQ symbols |
| params.deferredSettlement | <code>boolean</code> | No | selects deferred or immediate RFQ records |


```javascript
backpack.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchOpenOrder" id="fetchopenorder"></a>

### fetchOpenOrder{docsify-ignore}
fetches an open venue order or requester RFQ by identifier

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.backpack.exchange/#tag/Order/operation/get_order
- https://docs.backpack.exchange/#tag/RFQ/operation/get_open_rfqs


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order or requester RFQ identifier |
| symbol | <code>string</code> | Yes | unified market symbol, required |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders; inferred from symbol when omitted |


```javascript
backpack.fetchOpenOrder (id, symbol, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches an order from filtered history with an open-order fallback

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.backpack.exchange/#tag/History
- https://docs.backpack.exchange/#tag/RFQ/operation/get_rfq_history
- https://docs.backpack.exchange/#tag/RFQ/operation/get_open_rfqs


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order or requester RFQ identifier |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders; inferred from symbol when omitted |


```javascript
backpack.fetchOrder (id, symbol, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels a venue order or requests RFQ cancellation without assuming immediate cancellation

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.backpack.exchange/#tag/Order/operation/cancel_order
- https://docs.backpack.exchange/#tag/RFQ/operation/cancel_rfq


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order or requester RFQ identifier |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders; inferred from symbol when omitted |
| params.clientOrderId | <code>int</code> | No | RFQ client identifier instead of id |


```javascript
backpack.cancelOrder (id, symbol, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels venue orders, bulk RFQ cancellation is not supported

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.backpack.exchange/#tag/Order/operation/cancel_open_orders
- https://docs.backpack.exchange/#tag/RFQ


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders; inferred from symbol when omitted |


```javascript
backpack.cancelAllOrders (symbol, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches venue or requester RFQ order history

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://github.com/ccxt/ccxt/wiki/Manual#order-structure)

**See**

- https://docs.backpack.exchange/#tag/History/operation/get_order_history
- https://docs.backpack.exchange/#tag/RFQ/operation/get_rfq_history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for, locally filtered on retrieved pages |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve (default 100, max 1000) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders; inferred from symbol when provided, otherwise selects both venue/RFQ records |
| params.rfq | <code>boolean</code> | No | selects requester RFQ history only, inferred from RFQ symbols |
| params.offset | <code>int</code> | No | exchange history pagination offset |
| params.sortDirection | <code>string</code> | No | Asc or Desc |
| params.deferredSettlement | <code>boolean</code> | No | selects deferred or immediate RFQ history |


```javascript
backpack.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetches derivative positions

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.backpack.exchange/#tag/Futures/operation/get_positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
backpack.fetchPositions (symbols, params?)
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetches the history of funding payments

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.backpack.exchange/#tag/History/operation/get_funding_payments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch (default now) |


```javascript
backpack.fetchFundingHistory (symbol, since?, limit?, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock data; inferred from symbol when omitted |
| params.source | <code>string</code> | No | Venue or External; RFQ ticker symbols default to External |
| params.interval | <code>string</code> | No | External ticker interval, must be 1d |
| params.channel | <code>string</code> | No | stockPrice or stockIndicativeQuote for quotes instead of statistics |


```javascript
backpack.watchTicker (symbol, params?)
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock data; inferred from symbol when omitted |
| params.source | <code>string</code> | No | Venue or External, matching the subscription |
| params.interval | <code>string</code> | No | External ticker interval, must be 1d |
| params.channel | <code>string</code> | No | stockPrice or stockIndicativeQuote, matching the subscription |


```javascript
backpack.unWatchTicker (symbol, params?)
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock markets only; inferred from symbols when omitted |
| params.source | <code>string</code> | No | Venue or External; RFQ ticker symbols default to External |
| params.interval | <code>string</code> | No | External ticker interval, must be 1d |
| params.channel | <code>string</code> | No | stockPrice or stockIndicativeQuote for quotes instead of statistics |


```javascript
backpack.watchTickers (symbols, params?)
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock markets only; inferred from symbols when omitted |
| params.source | <code>string</code> | No | Venue or External, matching the subscription |
| params.interval | <code>string</code> | No | External ticker interval, must be 1d |
| params.channel | <code>string</code> | No | stockPrice or stockIndicativeQuote, matching the subscription |


```javascript
backpack.unWatchTickers (symbols, params?)
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Book-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock quotes; inferred from symbols when omitted |
| params.source | <code>string</code> | No | Venue or External; RFQ quotes default to indicative quotes |
| params.interval | <code>string</code> | No | External data interval, must be 1d |
| params.channel | <code>string</code> | No | stockPrice or stockIndicativeQuote, unavailable prices remain undefined |


```javascript
backpack.watchBidsAsks (symbols, params?)
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
unWatches best bid & ask for symbols

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock markets only; inferred from symbols when omitted |
| params.source | <code>string</code> | No | Venue or External, matching the subscription |
| params.interval | <code>string</code> | No | External data interval, must be 1d |
| params.channel | <code>string</code> | No | stockPrice or stockIndicativeQuote, matching the subscription |


```javascript
backpack.unWatchBidsAsks (symbols, params?)
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.backpack.exchange/#tag/Streams/Public/K-Line  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects stock spot order-book candles, RFQ candles are unsupported |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.watchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.backpack.exchange/#tag/Streams/Public/K-Line  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects stock spot order-book candles |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.unWatchOHLCV (symbol, timeframe, params?)
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.backpack.exchange/#tag/Streams/Public/K-Line  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires stock spot order-book markets, not RFQ markets |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.watchOHLCVForSymbols (symbolsAndTimeframes, since?, limit?, params?)
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.backpack.exchange/#tag/Streams/Public/K-Line  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires stock spot order-book markets |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.unWatchOHLCVForSymbols (symbolsAndTimeframes, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires a stock spot order-book market, RFQ public trades are unsupported |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.watchTrades (symbol, since?, limit?, params?)
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires a stock spot order-book market |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.unWatchTrades (symbol, params?)
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires stock spot order-book markets, not RFQ markets |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.watchTradesForSymbols (symbols, since?, limit?, params?)
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires stock spot order-book markets |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.unWatchTradesForSymbols (symbols, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Depth  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires a stock spot order-book market, not an RFQ market |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.watchOrderBook (symbol, limit?, params?)
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Public/Depth  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires stock spot order-book markets, not RFQ markets |
| params.source | <code>string</code> | No | Venue only |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
backpack.watchOrderBookForSymbols (symbols, limit?, params?)
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires a stock spot order-book market |
| params.source | <code>string</code> | No | Venue only |


```javascript
backpack.unWatchOrderBook (symbol, params?)
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | requires stock spot order-book markets |
| params.source | <code>string</code> | No | Venue only |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
backpack.unWatchOrderBookForSymbols (symbols, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Private/Order-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock orders, RFQ markets use account.rfqUpdate |


```javascript
backpack.watchOrders (symbol?, since?, limit?, params?)
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Private/Order-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stock | <code>boolean</code> | No | selects tokenized stock order subscriptions |


```javascript
backpack.unWatchOrders (symbol?, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watches absolute capital-account asset updates accumulated since subscription, without an initial snapshot

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Private/Balance-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.stock | <code>boolean</code> | No | return tokenized stock assets only; explicit because this method has no symbol |


```javascript
backpack.watchBalance (params?)
```


<a name="unWatchBalance" id="unwatchbalance"></a>

### unWatchBalance{docsify-ignore}
unsubscribes from all capital-account asset updates

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>object</code> - unsubscription result

**See**: https://docs.backpack.exchange/#tag/Streams/Private/Balance-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra exchange-specific parameters |
| params.stock | <code>boolean</code> | No | accepts the tokenized stock view selector; explicit because this method has no symbol |


```javascript
backpack.unWatchBalance (params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Private/Position-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to watch positions for |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
backpack.watchPositions (symbols?, since?, limit?, params)
```


<a name="unWatchPositions" id="unwatchpositions"></a>

### unWatchPositions{docsify-ignore}
unWatches from the stream channel

**Kind**: instance method of [<code>backpack</code>](#backpack)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://docs.backpack.exchange/#tag/Streams/Private/Position-update  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to watch positions for |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
backpack.unWatchPositions (symbols?, params)
```

