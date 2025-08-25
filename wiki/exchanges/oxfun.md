
<a name="oxfun" id="oxfun"></a>

## oxfun{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrderBook](#fetchorderbook)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchBalance](#fetchbalance)
* [fetchAccounts](#fetchaccounts)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [fetchPositions](#fetchpositions)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [cancelOrdersWs](#cancelordersws)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bitmex

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.ox.fun/?json#get-v3-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>dict</code> - an associative dictionary of currencies

**See**: https://docs.ox.fun/?json#get-v3-assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>dict</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchCurrencies ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.ox.fun/?json#get-v3-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.ox.fun/?json#get-v3-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchTicker (symbol[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.ox.fun/?json#get-v3-candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch (default now) |


```javascript
oxfun.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://docs.ox.fun/?json#get-v3-depth  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return (default 5, max 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rates for multiple markets

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Order&gt;</code> - an array of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.ox.fun/?json#get-v3-funding-estimates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchFundingRates (symbols[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rates for a symbol

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Order&gt;</code> - an array of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.ox.fun/?json#get-v3-funding-estimates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
Fetches the history of funding rates

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.ox.fun/?json#get-v3-funding-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch (default now) |


```javascript
oxfun.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetches the history of funding payments

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.ox.fun/?json#get-v3-funding  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch (default now) |


```javascript
oxfun.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes, if a market has a leverage tier of 0, then the leverage tiers cannot be obtained for this market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://docs.ox.fun/?json#get-v3-leverage-tiers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchLeverageTiers ([symbols, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.ox.fun/?json#get-v3-exchange-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch (default now) |


```javascript
oxfun.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://github.com/ccxt/ccxt/wiki/Manual#trade-structure)

**See**: https://docs.ox.fun/?json#get-v3-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (default 200, max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch (default now) |


```javascript
oxfun.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.ox.fun/?json#get-v3-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.asset | <code>string</code> | No | currency id, if empty the exchange returns info about all currencies |
| params.subAcc | <code>string</code> | No | Name of sub account. If no subAcc is given, then the response contains only the account linked to the API-Key. |


```javascript
oxfun.fetchBalance ([params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch subaccounts associated with a profile

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://docs.ox.fun/?json#get-v3-account-names  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.fetchAccounts ([params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.ox.fun/?json#post-v3-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account id to transfer from |
| toAccount | <code>string</code> | Yes | account id to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.ox.fun/?json#get-v3-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |


```javascript
oxfun.fetchTransfers (code[, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.ox.fun/?json#get-v3-deposit-addresses  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | network for fetch deposit address |


```javascript
oxfun.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.ox.fun/?json#get-v3-deposit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |


```javascript
oxfun.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.ox.fun/?json#get-v3-withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for (default 24 hours ago) |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve (default 50, max 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for (default time now) |


```javascript
oxfun.fetchWithdrawals (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.ox.fun/?json#post-v3-withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | network for withdraw |
| params.externalFee | <code>bool</code> | No | if false, then the fee is taken from the quantity, also with the burn fee for asset SOLO EXCHANGE SPECIFIC PARAMETERS |
| params.tfaType | <code>string</code> | No | GOOGLE, or AUTHY_SECRET, or YUBIKEY, for 2FA |
| params.code | <code>string</code> | No | 2FA code |


```javascript
oxfun.withdraw (code, amount, address, tag[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.ox.fun/?json#get-v3-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subAcc | <code>boolean</code> | No |  |


```javascript
oxfun.fetchPositions (symbols[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#post-v3-orders-place  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>int</code> | No | a unique id for the order |
| params.timestamp | <code>int</code> | No | in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. |
| params.recvWindow | <code>int</code> | No | in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used. |
| params.responseType | <code>string</code> | No | FULL or ACK |
| params.cost | <code>float</code> | No | the quote quantity that can be used as an alternative for the amount for market buy orders |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.limitPrice | <code>float</code> | No | Limit price for the STOP_LIMIT order |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted if it will be a maker order |
| params.timeInForce | <code>string</code> | No | GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade) |
| params.selfTradePreventionMode | <code>string</code> | No | NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here [https://docs.ox.fun/?json#self-trade-prevention-modes](https://docs.ox.fun/?json#self-trade-prevention-modes) |
| params.displayQuantity | <code>string</code> | No | for an iceberg order, pass both quantity and displayQuantity fields in the order request |


```javascript
oxfun.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#post-v3-orders-place  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timestamp | <code>int</code> | No | *for all orders* in milliseconds. If orders reach the matching engine and the current timestamp exceeds timestamp + recvWindow, then all orders will be rejected. |
| params.recvWindow | <code>int</code> | No | *for all orders* in milliseconds. If orders reach the matching engine and the current timestamp exceeds timestamp + recvWindow, then all orders will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used. |
| params.responseType | <code>string</code> | No | *for all orders* FULL or ACK |


```javascript
oxfun.createOrders (orders[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://open.big.one/docs/spot_orders.html#create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#get-v3-orders-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | a unique id for the order |
| symbol | <code>string</code> | No | not used by oxfun fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>int</code> | No | the client order id of the order |


```javascript
oxfun.fetchOrder (id[, symbol, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#get-v3-orders-working  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.orderId | <code>int</code> | No | a unique id for the order |
| params.clientOrderId | <code>int</code> | No | the client order id of the order |


```javascript
oxfun.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#delete-v3-orders-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>int</code> | No | a unique id for the order |
| params.timestamp | <code>int</code> | No | in milliseconds |
| params.recvWindow | <code>int</code> | No | in milliseconds |
| params.responseType | <code>string</code> | No | 'FULL' or 'ACK' |


```javascript
oxfun.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - response from exchange

**See**: https://docs.ox.fun/?json#delete-v3-orders-cancel-all  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.cancelAllOrders (symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#delete-v3-orders-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timestamp | <code>int</code> | No | in milliseconds |
| params.recvWindow | <code>int</code> | No | in milliseconds |
| params.responseType | <code>string</code> | No | 'FULL' or 'ACK' |


```javascript
oxfun.cancelOrders (ids[, symbol, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.ox.fun/?json#trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://docs.ox.fun/?json#trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.ox.fun/?json#candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.ox.fun/?json#candles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://docs.ox.fun/?json#fixed-size-order-book
- https://docs.ox.fun/?json#full-order-book


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://docs.ox.fun/?json#fixed-size-order-book
- https://docs.ox.fun/?json#full-order-book


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.ox.fun/?json#ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.ox.fun/?json#ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchTickers ([symbols, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.ox.fun/?json#best-bid-ask  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.watchBidsAsks (symbols[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.ox.fun/?json#balance-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchBalance ([params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://docs.ox.fun/?json#position-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since |  | Yes |  |
| limit |  | Yes |  |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchPositions (symbols, since, limit, params[])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#order-channel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>int</code>, <code>string</code> | No | If given it will be echoed in the reply and the max size of tag is 32 |


```javascript
oxfun.watchOrders (symbol[, since, limit, params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#order-commands  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>int</code> | No | a unique id for the order |
| params.timestamp | <code>int</code> | No | in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. |
| params.recvWindow | <code>int</code> | No | in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used. |
| params.cost | <code>float</code> | No | the quote quantity that can be used as an alternative for the amount for market buy orders |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.limitPrice | <code>float</code> | No | Limit price for the STOP_LIMIT order |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted if it will be a maker order |
| params.timeInForce | <code>string</code> | No | GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade) |
| params.selfTradePreventionMode | <code>string</code> | No | NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here [https://docs.ox.fun/?json#self-trade-prevention-modes](https://docs.ox.fun/?json#self-trade-prevention-modes) |
| params.displayQuantity | <code>string</code> | No | for an iceberg order, pass both quantity and displayQuantity fields in the order request |


```javascript
oxfun.createOrderWs (symbol, type, side, amount[, price, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#modify-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timestamp | <code>int</code> | No | in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. |
| params.recvWindow | <code>int</code> | No | in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used. |


```javascript
oxfun.editOrderWs (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.ox.fun/?json#cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.cancelOrderWs (id, symbol[, params])
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>oxfun</code>](#oxfun)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.okx.com/docs-v5/en/#order-book-trading-trade-ws-mass-cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
oxfun.cancelOrdersWs (ids, symbol[, params])
```

