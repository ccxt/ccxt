
<a name="kucoin" id="kucoin"></a>

## kucoin{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchStatus](#fetchstatus)
* [fetchMarkets](#fetchmarkets)
* [loadMigrationStatus](#loadmigrationstatus)
* [fetchCurrencies](#fetchcurrencies)
* [fetchAccounts](#fetchaccounts)
* [fetchTransactionFee](#fetchtransactionfee)
* [fetchDepositWithdrawFee](#fetchdepositwithdrawfee)
* [fetchTickers](#fetchtickers)
* [fetchMarkPrices](#fetchmarkprices)
* [fetchTicker](#fetchticker)
* [fetchMarkPrice](#fetchmarkprice)
* [fetchOHLCV](#fetchohlcv)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchOrderBook](#fetchorderbook)
* [createOrder](#createorder)
* [createMarketOrderWithCost](#createmarketorderwithcost)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrdersByStatus](#fetchordersbystatus)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrder](#fetchorder)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchTrades](#fetchtrades)
* [fetchTradingFee](#fetchtradingfee)
* [withdraw](#withdraw)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchBalance](#fetchbalance)
* [transfer](#transfer)
* [fetchLedger](#fetchledger)
* [fetchBorrowInterest](#fetchborrowinterest)
* [fetchBorrowRateHistories](#fetchborrowratehistories)
* [fetchBorrowRateHistory](#fetchborrowratehistory)
* [borrowCrossMargin](#borrowcrossmargin)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [repayCrossMargin](#repaycrossmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [setLeverage](#setleverage)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://docs.kucoin.com/#server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchTime ([params])
```


<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)

**See**: https://docs.kucoin.com/#service-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchStatus ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for kucoin

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.kucoin.com/#get-symbols-list-deprecated
- https://docs.kucoin.com/#get-all-tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchMarkets ([params])
```


<a name="loadMigrationStatus" id="loadmigrationstatus"></a>

### loadMigrationStatus{docsify-ignore}
loads the migration status for the account (hf or not)

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>any</code> - ignore

**See**: https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/get-user-type  

| Param | Type | Description |
| --- | --- | --- |
| force | <code>boolean</code> | load account state for non hf |


```javascript
kucoin.loadMigrationStatus (force, [undefined])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.kucoin.com/#get-currencies  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchCurrencies (params, [undefined])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://docs.kucoin.com/#list-accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchAccounts ([params])
```


<a name="fetchTransactionFee" id="fetchtransactionfee"></a>

### fetchTransactionFee{docsify-ignore}
*DEPRECATED* please use fetchDepositWithdrawFee instead

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.kucoin.com/#get-withdrawal-quotas  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>string</code> | unified currency code |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchTransactionFee (code, params[])
```


<a name="fetchDepositWithdrawFee" id="fetchdepositwithdrawfee"></a>

### fetchDepositWithdrawFee{docsify-ignore}
fetch the fee for deposits and withdrawals

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.kucoin.com/#get-withdrawal-quotas  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency; you can query the chain through the response of the GET /api/v2/currencies/{currency} interface |


```javascript
kucoin.fetchDepositWithdrawFee (code[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kucoin.com/#get-all-tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchTickers (symbols[, params])
```


<a name="fetchMarkPrices" id="fetchmarkprices"></a>

### fetchMarkPrices{docsify-ignore}
fetches the mark price for multiple markets

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.kucoin.com/docs/rest/margin-trading/margin-info/get-all-margin-trading-pairs-mark-prices  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchMarkPrices ([symbols, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.kucoin.com/#get-24hr-stats  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchTicker (symbol[, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches the mark price for a specific market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.kucoin.com/docs/rest/margin-trading/margin-info/get-mark-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchMarkPrice (symbol[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.kucoin.com/#get-klines  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://www.kucoin.com/docs/rest/funding/deposit/create-deposit-address-v3-  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the blockchain network name |


```javascript
kucoin.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.kucoin.com/#get-deposit-addresses-v2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the blockchain network name |


```javascript
kucoin.fetchDepositAddress (code[, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an array of [address structures](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.kucoin.com/#get-deposit-addresses-v2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs/rest/spot-trading/market-data/get-part-order-book-aggregated-
- https://www.kucoin.com/docs/rest/spot-trading/market-data/get-full-order-book-aggregated-


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchOrderBook (symbol[, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.kucoin.com/spot#place-a-new-order
- https://docs.kucoin.com/spot#place-a-new-order-2
- https://docs.kucoin.com/spot#place-a-margin-order
- https://docs.kucoin.com/spot-hf/#place-hf-order
- https://www.kucoin.com/docs/rest/spot-trading/orders/place-order-test
- https://www.kucoin.com/docs/rest/margin-trading/orders/place-margin-order-test
- https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-place-hf-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.marginMode | <code>string</code> | No | 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned |
| params.timeInForce | <code>string</code> | No | GTC, GTT, IOC, or FOK, default is GTC, limit orders only |
| params.postOnly | <code>string</code> | No | Post only flag, invalid when timeInForce is IOC or FOK EXCHANGE SPECIFIC PARAMETERS |
| params.clientOid | <code>string</code> | No | client order id, defaults to uuid if not passed |
| params.remark | <code>string</code> | No | remark for the order, length cannot exceed 100 utf8 characters |
| params.tradeType | <code>string</code> | No | 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders limit orders --------------------------------------------------- |
| params.cancelAfter | <code>float</code> | No | long, // cancel after n seconds, requires timeInForce to be GTT |
| params.hidden | <code>bool</code> | No | false, // Order will not be displayed in the order book |
| params.iceberg | <code>bool</code> | No | false, // Only a portion of the order is displayed in the order book |
| params.visibleSize | <code>string</code> | No | this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order market orders -------------------------------------------------- |
| params.funds | <code>string</code> | No | // Amount of quote currency to use stop orders ---------------------------------------------------- |
| params.stop | <code>string</code> | No | Either loss or entry, the default is loss. Requires triggerPrice to be defined margin orders -------------------------------------------------- |
| params.leverage | <code>float</code> | No | Leverage size of the order |
| params.stp | <code>string</code> | No | '', // self trade prevention, CN, CO, CB or DC |
| params.autoBorrow | <code>bool</code> | No | false, // The system will first borrow you funds at the optimal interest rate and then place an order for you |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.test | <code>bool</code> | No | set to true to test an order, no order will be created but the request will be validated |
| params.sync | <code>bool</code> | No | set to true to use the hf sync call |


```javascript
kucoin.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

### createMarketOrderWithCost{docsify-ignore}
create a market order by providing the symbol, side and cost

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.kucoin.com/docs/rest/spot-trading/orders/place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.createMarketOrderWithCost (symbol, side, cost[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.kucoin.com/docs/rest/spot-trading/orders/place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

### createMarketSellOrderWithCost{docsify-ignore}
create a market sell order by providing the symbol and cost

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.kucoin.com/docs/rest/spot-trading/orders/place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.createMarketSellOrderWithCost (symbol, cost[, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.kucoin.com/docs/rest/spot-trading/orders/place-multiple-orders
- https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/place-multiple-hf-orders
- https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-place-multiple-hf-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hf | <code>bool</code> | No | false, // true for hf orders |
| params.sync | <code>bool</code> | No | false, // true to use the hf sync call |


```javascript
kucoin.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit an order, kucoin currently only supports the modification of HF orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.kucoin.com/spot-hf/#modify-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | not used |
| side | <code>string</code> | Yes | not used |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, defaults to id if not passed |


```javascript
kucoin.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**

- https://docs.kucoin.com/spot#cancel-an-order
- https://docs.kucoin.com/spot#cancel-an-order-2
- https://docs.kucoin.com/spot#cancel-single-order-by-clientoid
- https://docs.kucoin.com/spot#cancel-single-order-by-clientoid-2
- https://docs.kucoin.com/spot-hf/#cancel-orders-by-orderid
- https://docs.kucoin.com/spot-hf/#cancel-order-by-clientoid
- https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-cancel-hf-order-by-orderid
- https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-cancel-hf-order-by-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | True if cancelling a stop order |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.sync | <code>bool</code> | No | false, // true to use the hf sync call |


```javascript
kucoin.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**

- https://docs.kucoin.com/spot#cancel-all-orders
- https://docs.kucoin.com/spot#cancel-orders
- https://docs.kucoin.com/spot-hf/#cancel-all-hf-orders-by-symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | *invalid for isolated margin* true if cancelling all stop orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.orderIds | <code>string</code> | No | *stop orders only* Comma seperated order IDs |
| params.hf | <code>bool</code> | No | false, // true for hf order |


```javascript
kucoin.cancelAllOrders (symbol[, params])
```


<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

### fetchOrdersByStatus{docsify-ignore}
fetch a list of orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [array of order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.kucoin.com/spot#list-orders
- https://docs.kucoin.com/spot#list-stop-orders
- https://docs.kucoin.com/spot-hf/#obtain-list-of-active-hf-orders
- https://docs.kucoin.com/spot-hf/#obtain-list-of-filled-hf-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | *not used for stop orders* 'open' or 'closed' |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | max number of orders to return |
| params | <code>object</code> | No | exchange specific params |
| params.until | <code>int</code> | No | end time in ms |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit, market, limit_stop or market_stop |
| params.tradeType | <code>string</code> | No | TRADE for spot trading, MARGIN_TRADE for Margin Trading |
| params.currentPage | <code>int</code> | No | *trigger orders only* current page |
| params.orderIds | <code>string</code> | No | *trigger orders only* comma seperated order ID list |
| params.trigger | <code>bool</code> | No | True if fetching a trigger order |
| params.hf | <code>bool</code> | No | false, // true for hf order |


```javascript
kucoin.fetchOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.kucoin.com/spot#list-orders
- https://docs.kucoin.com/spot#list-stop-orders
- https://docs.kucoin.com/spot-hf/#obtain-list-of-active-hf-orders
- https://docs.kucoin.com/spot-hf/#obtain-list-of-filled-hf-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit, market, limit_stop or market_stop |
| params.tradeType | <code>string</code> | No | TRADE for spot trading, MARGIN_TRADE for Margin Trading |
| params.trigger | <code>bool</code> | No | True if fetching a trigger order |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.kucoin.com/spot#list-orders
- https://docs.kucoin.com/spot#list-stop-orders
- https://docs.kucoin.com/spot-hf/#obtain-list-of-active-hf-orders
- https://docs.kucoin.com/spot-hf/#obtain-list-of-filled-hf-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.trigger | <code>bool</code> | No | true if fetching trigger orders |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit, market, limit_stop or market_stop |
| params.tradeType | <code>string</code> | No | TRADE for spot trading, MARGIN_TRADE for Margin Trading |
| params.currentPage | <code>int</code> | No | *trigger orders only* current page |
| params.orderIds | <code>string</code> | No | *trigger orders only* comma seperated order ID list |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetch an order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.kucoin.com/spot#get-an-order
- https://docs.kucoin.com/spot#get-single-active-order-by-clientoid
- https://docs.kucoin.com/spot#get-single-order-info
- https://docs.kucoin.com/spot#get-single-order-by-clientoid
- https://docs.kucoin.com/spot-hf/#details-of-a-single-hf-order
- https://docs.kucoin.com/spot-hf/#obtain-details-of-a-single-hf-order-using-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | Order id |
| symbol | <code>string</code> | Yes | not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter |
| params | <code>object</code> | No | exchange specific parameters |
| params.trigger | <code>bool</code> | No | true if fetching a trigger order |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.clientOid | <code>bool</code> | No | unique order id created by users to identify their orders |


```javascript
kucoin.fetchOrder (id, symbol[, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.kucoin.com/#list-fills
- https://docs.kucoin.com/spot-hf/#transaction-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.kucoin.com/#list-fills
- https://docs.kucoin.com/spot-hf/#transaction-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.kucoin.com/docs/rest/spot-trading/market-data/get-trade-histories  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.kucoin.com/docs/rest/funding/trade-fee/trading-pair-actual-fee-spot-margin-trade_hf  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchTradingFee (symbol[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.kucoin.com/docs/rest/funding/withdrawals/apply-withdraw-v3-  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.withdraw (code, amount, address, tag[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-list
- https://www.kucoin.com/docs/rest/funding/deposit/get-v1-historical-deposits-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://www.kucoin.com/docs/rest/funding/withdrawals/get-withdrawals-list
- https://www.kucoin.com/docs/rest/funding/withdrawals/get-v1-historical-withdrawals-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.kucoin.com/docs/rest/account/basic-info/get-account-list-spot-margin-trade_hf
- https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-margin
- https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-isolated-margin


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>object</code> | No | 'cross' or 'isolated', margin type for fetching margin balance |
| params.type | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hf | <code>object</code> | No | *default if false* if true, the result includes the balance of the high frequency account |


```javascript
kucoin.fetchBalance ([params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://www.kucoin.com/docs/rest/funding/transfer/inner-transfer
- https://docs.kucoin.com/futures/#transfer-funds-to-kucoin-main-account-2
- https://docs.kucoin.com/spot-hf/#internal-funds-transfers-in-high-frequency-trading-accounts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**

- https://www.kucoin.com/docs/rest/account/basic-info/get-account-ledgers-spot-margin
- https://www.kucoin.com/docs/rest/account/basic-info/get-account-ledgers-trade_hf
- https://www.kucoin.com/docs/rest/account/basic-info/get-account-ledgers-margin_hf


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hf | <code>boolean</code> | No | default false, when true will fetch ledger entries for the high frequency trading account |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchLedger ([code, since, limit, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)

**See**

- https://docs.kucoin.com/#get-repay-record
- https://docs.kucoin.com/#query-isolated-margin-account-info


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | unified market symbol, required for isolated margin |
| since | <code>int</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default is 'cross' |


```javascript
kucoin.fetchBorrowInterest ([code, symbol, since, limit, params])
```


<a name="fetchBorrowRateHistories" id="fetchborrowratehistories"></a>

### fetchBorrowRateHistories{docsify-ignore}
retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) indexed by the market symbol

**See**: https://www.kucoin.com/docs/rest/margin-trading/margin-trading-v3-/get-cross-isolated-margin-interest-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest borrowRate, default is undefined |
| limit | <code>int</code> | No | max number of borrow rate prices to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default is 'cross' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
kucoin.fetchBorrowRateHistories (codes[, since, limit, params])
```


<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

### fetchBorrowRateHistory{docsify-ignore}
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure)

**See**: https://www.kucoin.com/docs/rest/margin-trading/margin-trading-v3-/get-cross-isolated-margin-interest-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default is 'cross' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
kucoin.fetchBorrowRateHistory (code[, since, limit, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.kucoin.com/#1-margin-borrowing  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoints |
| params.timeInForce | <code>string</code> | No | either IOC or FOK |


```javascript
kucoin.borrowCrossMargin (code, amount[, params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.kucoin.com/#1-margin-borrowing  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoints |
| params.timeInForce | <code>string</code> | No | either IOC or FOK |


```javascript
kucoin.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.kucoin.com/#2-repayment  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoints |


```javascript
kucoin.repayCrossMargin (code, amount[, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.kucoin.com/#2-repayment  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoints |


```javascript
kucoin.repayIsolatedMargin (symbol, code, amount[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees - *IMPORTANT* use fetchDepositWithdrawFee to get more in-depth info

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.kucoin.com/#get-currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchDepositWithdrawFees (codes[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.kucoin.com/docs/rest/margin-trading/margin-trading-v3-/modify-leverage-multiplier  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>int</code> | No | New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.setLeverage ([leverage, symbol, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/market-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/market-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/snapshot' or '/market/ticker' default is '/market/ticker' |


```javascript
kucoin.watchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchBidsAsks (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/klines  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/klines  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/match-execution-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/match-execution-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unWatches trades stream

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/match-execution-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.unWatchTradesForSymbols (symbols[, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches trades stream

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/public-channels/match-execution-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.unWatchTrades (symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
kucoin.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
kucoin.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
kucoin.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level1-bbo-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-market-data
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-5-best-ask-bid-orders
- https://www.kucoin.com/docs/websocket/spot-trading/public-channels/level2-50-best-ask-bid-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |


```javascript
kucoin.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.kucoin.com/docs/websocket/spot-trading/private-channels/private-order-change
- https://www.kucoin.com/docs/websocket/spot-trading/private-channels/stop-order-event


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | trigger orders are watched if true |


```javascript
kucoin.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/private-channels/private-order-change  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | '/spotMarket/tradeOrders' or '/spot/tradeFills' default is '/spotMarket/tradeOrders' |


```javascript
kucoin.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://www.kucoin.com/docs/websocket/spot-trading/private-channels/account-balance-change  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchBalance ([params])
```

