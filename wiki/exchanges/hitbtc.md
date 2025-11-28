
<a name="hitbtc" id="hitbtc"></a>

## hitbtc{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchBalance](#fetchbalance)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchOrderBooks](#fetchorderbooks)
* [fetchOrderBook](#fetchorderbook)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOHLCV](#fetchohlcv)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOrder](#fetchorder)
* [fetchOrderTrades](#fetchordertrades)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOpenOrder](#fetchopenorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrder](#cancelorder)
* [createOrder](#createorder)
* [fetchMarginModes](#fetchmarginmodes)
* [transfer](#transfer)
* [withdraw](#withdraw)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchFundingRate](#fetchfundingrate)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [closePosition](#closeposition)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for hitbtc

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://api.hitbtc.com/#symbols  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://api.hitbtc.com/#currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchCurrencies ([params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://api.hitbtc.com/#generate-deposit-crypto-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://api.hitbtc.com/#get-deposit-crypto-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchDepositAddress (code[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://api.hitbtc.com/#wallet-balance
- https://api.hitbtc.com/#get-spot-trading-balance
- https://api.hitbtc.com/#get-trading-balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchBalance ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api.hitbtc.com/#tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://api.hitbtc.com/#tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://api.hitbtc.com/#trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://api.hitbtc.com/#spot-trades-history
- https://api.hitbtc.com/#futures-trades-history
- https://api.hitbtc.com/#margin-trades-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for fetching margin trades |


```javascript
hitbtc.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api.hitbtc.com/#get-transactions-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchDepositsWithdrawals ([code, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api.hitbtc.com/#get-transactions-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api.hitbtc.com/#get-transactions-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchOrderBooks" id="fetchorderbooks"></a>

### fetchOrderBooks{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbol

**See**: https://api.hitbtc.com/#order-books  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols, all symbols fetched if undefined, default is undefined |
| limit | <code>int</code> | No | max number of entries per orderbook to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchOrderBooks ([symbols, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://api.hitbtc.com/#order-books  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**

- https://api.hitbtc.com/#get-trading-commission
- https://api.hitbtc.com/#get-trading-commission-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**

- https://api.hitbtc.com/#get-all-trading-commissions
- https://api.hitbtc.com/#get-all-trading-commissions-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchTradingFees ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://api.hitbtc.com/#candles
- https://api.hitbtc.com/#futures-index-price-candles
- https://api.hitbtc.com/#futures-mark-price-candles
- https://api.hitbtc.com/#futures-premium-index-candles


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
hitbtc.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#spot-orders-history
- https://api.hitbtc.com/#futures-orders-history
- https://api.hitbtc.com/#margin-orders-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for fetching margin orders |


```javascript
hitbtc.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#spot-orders-history
- https://api.hitbtc.com/#futures-orders-history
- https://api.hitbtc.com/#margin-orders-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for fetching a margin order |


```javascript
hitbtc.fetchOrder (id, symbol[, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://api.hitbtc.com/#spot-trades-history
- https://api.hitbtc.com/#futures-trades-history
- https://api.hitbtc.com/#margin-trades-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for fetching margin trades |


```javascript
hitbtc.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#get-all-active-spot-orders
- https://api.hitbtc.com/#get-active-futures-orders
- https://api.hitbtc.com/#get-active-margin-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for fetching open margin orders |


```javascript
hitbtc.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrder" id="fetchopenorder"></a>

### fetchOpenOrder{docsify-ignore}
fetch an open order by it's id

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#get-active-spot-order
- https://api.hitbtc.com/#get-active-futures-order
- https://api.hitbtc.com/#get-active-margin-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for fetching an open margin order |


```javascript
hitbtc.fetchOpenOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#cancel-all-spot-orders
- https://api.hitbtc.com/#cancel-futures-orders
- https://api.hitbtc.com/#cancel-all-margin-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for canceling margin orders |


```javascript
hitbtc.cancelAllOrders (symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#cancel-spot-order
- https://api.hitbtc.com/#cancel-futures-order
- https://api.hitbtc.com/#cancel-margin-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported |
| params.margin | <code>bool</code> | No | true for canceling a margin order |


```javascript
hitbtc.cancelOrder (id, symbol[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://api.hitbtc.com/#create-new-spot-order
- https://api.hitbtc.com/#create-margin-order
- https://api.hitbtc.com/#create-futures-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported for spot-margin, swap supports both, default is 'cross' |
| params.margin | <code>bool</code> | No | true for creating a margin order |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", "Day", "GTD" |


```javascript
hitbtc.createOrder (symbol, type, side, amount[, price, params])
```


<a name="fetchMarginModes" id="fetchmarginmodes"></a>

### fetchMarginModes{docsify-ignore}
fetches margin mode of the user

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a list of [margin mode structures](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**

- https://api.hitbtc.com/#get-margin-position-parameters
- https://api.hitbtc.com/#get-futures-position-parameters


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchMarginModes (symbols[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://api.hitbtc.com/#transfer-between-wallet-and-exchange  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://api.hitbtc.com/#withdraw-crypto  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.withdraw (code, amount, address, tag[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetches funding rates for multiple markets

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://api.hitbtc.com/#futures-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchFundingRates (symbols[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://api.hitbtc.com/#funding-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
hitbtc.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://api.hitbtc.com/#get-futures-margin-accounts
- https://api.hitbtc.com/#get-all-margin-accounts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | not used by hitbtc fetchPositions () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set |
| params.margin | <code>bool</code> | No | true for fetching spot-margin positions |


```javascript
hitbtc.fetchPositions (symbols[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://api.hitbtc.com/#get-futures-margin-account
- https://api.hitbtc.com/#get-isolated-margin-account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set |
| params.margin | <code>bool</code> | No | true for fetching a spot-margin position |


```javascript
hitbtc.fetchPosition (symbol[, params])
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://api.hitbtc.com/#futures-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
hitbtc.fetchOpenInterests ([symbols, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a derivative trading pair

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=interest-history-structure](https://docs.ccxt.com/#/?id=interest-history-structure)

**See**: https://api.hitbtc.com/#futures-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
hitbtc.fetchOpenInterest (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://api.hitbtc.com/#futures-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchFundingRate (symbol[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**

- https://api.hitbtc.com/#create-update-margin-account-2
- https://api.hitbtc.com/#create-update-margin-account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set |
| params.margin | <code>bool</code> | No | true for reducing spot-margin |


```javascript
hitbtc.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**

- https://api.hitbtc.com/#create-update-margin-account-2
- https://api.hitbtc.com/#create-update-margin-account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set |
| params.margin | <code>bool</code> | No | true for adding spot-margin |


```javascript
hitbtc.addMargin (symbol, amount[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**

- https://api.hitbtc.com/#get-futures-margin-account
- https://api.hitbtc.com/#get-isolated-margin-account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set |
| params.margin | <code>bool</code> | No | true for fetching spot-margin leverage |


```javascript
hitbtc.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://api.hitbtc.com/#create-update-margin-account-2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.setLeverage (leverage, symbol[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fees structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://api.hitbtc.com/#currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hitbtc.fetchDepositWithdrawFees (codes[, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>hitbtc</code>](#hitbtc)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://api.hitbtc.com/#close-all-futures-margin-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified ccxt market symbol |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| params | <code>object</code> | No | extra parameters specific to the okx api endpoint |
| params.symbol | <code>string</code> | No | *required* unified market symbol |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', default is 'cross' |


```javascript
hitbtc.closePosition (symbol, side[, params])
```

