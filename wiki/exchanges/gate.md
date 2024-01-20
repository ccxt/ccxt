
<a name="gate" id="gate"></a>

## gate{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchTransactionFees](#fetchtransactionfees)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTrades](#fetchtrades)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [transfer](#transfer)
* [setLeverage](#setleverage)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [repayMargin](#repaymargin)
* [repayCrossMargin](#repaycrossmargin)
* [borrowMargin](#borrowmargin)
* [borrowMargin](#borrowmargin)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchMySettlementHistory](#fetchmysettlementhistory)
* [fetchLedger](#fetchledger)
* [setPositionMode](#setpositionmode)
* [fetchUnderlyingAssets](#fetchunderlyingassets)
* [fetchLiquidations](#fetchliquidations)
* [fetchMyLiquidations](#fetchmyliquidations)
* [fetchGreeks](#fetchgreeks)
* [closePosition](#closeposition)
* [watchOrderBook](#watchorderbook)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchOHLCV](#watchohlcv)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for gate

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-all-currency-pairs-supported                                     // spot
- https://www.gate.io/docs/developers/apiv4/en/#list-all-supported-currency-pairs-supported-in-margin-trading         // margin
- https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts                                            // swap
- https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts-2                                          // future
- https://www.gate.io/docs/developers/apiv4/en/#list-all-the-contracts-with-specified-underlying-and-expiration-time  // option


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-all-currencies-details  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchCurrencies ([params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#get-a-single-contract  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a dictionary of [funding rates structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexe by market symbols

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchFundingRates (symbols[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#generate-currency-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | unified network code (not used directly by gate.io but used by ccxt to filter the response) |


```javascript
gate.fetchDepositAddress (code[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-personal-trading-fee  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-personal-trading-fee  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchTradingFees ([params])
```


<a name="fetchTransactionFees" id="fetchtransactionfees"></a>

### fetchTransactionFees{docsify-ignore}
`DEPRECATED`

please use fetchDepositWithdrawFees instead

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchTransactionFees (codes[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-status  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#query-account-book-2
- https://www.gate.io/docs/developers/apiv4/en/#query-account-book-3


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.gate.io/docs/developers/apiv4/en/#retrieve-order-book
- https://www.gate.io/docs/developers/apiv4/en/#futures-order-book
- https://www.gate.io/docs/developers/apiv4/en/#futures-order-book-2
- https://www.gate.io/docs/developers/apiv4/en/#options-order-book


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#get-details-of-a-specifc-order
- https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers
- https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers-2
- https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#get-details-of-a-specifc-order
- https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers
- https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers-2
- https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchTickers (symbols[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#funding-rate-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#retrieve-market-trades
- https://www.gate.io/docs/developers/apiv4/en/#futures-trading-history
- https://www.gate.io/docs/developers/apiv4/en/#futures-trading-history-2
- https://www.gate.io/docs/developers/apiv4/en/#options-trade-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
gate.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history
- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-2
- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-3
- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-4


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
Fetch personal trading history

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history
- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-2
- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-3
- https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-4


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used |
| params.type | <code>string</code> | No | 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used |
| params.until | <code>int</code> | No | The latest timestamp, in ms, that fetched trades were made |
| params.page | <code>int</code> | No | *spot only* Page number |
| params.order_id | <code>string</code> | No | *spot only* Filter trades with specified order ID. symbol is also required if this field is present |
| params.order | <code>string</code> | No | *contract only* Futures order ID, return related data only if specified |
| params.offset | <code>int</code> | No | *contract only* list offset, starting from 0 |
| params.last_id | <code>string</code> | No | *contract only* specify list staring point using the id of last record in previous list-query results |
| params.count_total | <code>int</code> | No | *contract only* whether to return total number matched, default to 0(no return) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
gate.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-deposit-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params.until | <code>int</code> | No | end time in ms |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
gate.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-records  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
gate.fetchWithdrawals (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.withdraw (code, amount, address, tag[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> \| <code>undefined</code> - [An order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#create-an-order
- https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order
- https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order
- https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order-2
- https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order-2
- https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order-3
- https://www.gate.io/docs/developers/apiv4/en/#create-an-options-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' *"market" is contract only* |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stopPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", or "PO" |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used |
| params.iceberg | <code>int</code> | No | Amount to display for the iceberg order, Null or 0 for normal orders, Set to -1 to hide the order completely |
| params.text | <code>string</code> | No | User defined information |
| params.account | <code>string</code> | No | *spot and margin only* "spot", "margin" or "cross_margin" |
| params.auto_borrow | <code>bool</code> | No | *margin only* Used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough |
| params.settle | <code>string</code> | No | *contract only* Unified Currency Code for settle currency |
| params.reduceOnly | <code>bool</code> | No | *contract only* Indicates if this order is to reduce the size of a position |
| params.close | <code>bool</code> | No | *contract only* Set as true to close the position, with size set to 0 |
| params.auto_size | <code>bool</code> | No | *contract only* Set side to close dual-mode position, close_long closes the long side, while close_short the short one, size also needs to be set to 0 |
| params.price_type | <code>int</code> | No | *contract only* 0 latest deal price, 1 mark price, 2 index price |
| params.cost | <code>float</code> | No | *spot market buy only* the quote quantity that can be used as an alternative for the amount |


```javascript
gate.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-2
- https://www.gate.io/docs/developers/apiv4/en/#create-a-batch-of-orders


| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |


```javascript
gate.createOrders (orders, [undefined])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#create-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order, gate currently only supports the modification of the price or amount fields

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#amend-an-order
- https://www.gate.io/docs/developers/apiv4/en/#amend-an-order-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
Retrieves information on an order

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order
- https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-2
- https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-3
- https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-4


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | Order id |
| symbol | <code>string</code> | Yes | Unified market symbol, *required for spot and margin* |
| params | <code>object</code> | No | Parameters specified by the exchange api |
| params.stop | <code>bool</code> | No | True if the order being fetched is a trigger order |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used |
| params.type | <code>string</code> | No | 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used |
| params.settle | <code>string</code> | No | 'btc' or 'usdt' - settle currency for perpetual swap and future - market settle currency is used if symbol !== undefined, default="usdt" for swap and "btc" for future |


```javascript
gate.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-all-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | true for fetching stop orders |
| params.type | <code>string</code> | No | spot, margin, swap or future, if not provided this.options['defaultType'] is used |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' - marginMode for type='margin', if not provided this.options['defaultMarginMode'] is used |


```javascript
gate.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-orders
- https://www.gate.io/docs/developers/apiv4/en/#retrieve-running-auto-order-list
- https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders
- https://www.gate.io/docs/developers/apiv4/en/#list-all-auto-orders
- https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders-2
- https://www.gate.io/docs/developers/apiv4/en/#list-all-auto-orders-2
- https://www.gate.io/docs/developers/apiv4/en/#list-options-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | true for fetching stop orders |
| params.type | <code>string</code> | No | spot, swap or future, if not provided this.options['defaultType'] is used |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used |


```javascript
gate.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
Cancels an open order

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order
- https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-2
- https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-3
- https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-4


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | Order id |
| symbol | <code>string</code> | Yes | Unified market symbol |
| params | <code>object</code> | No | Parameters specified by the exchange api |
| params.stop | <code>bool</code> | No | True if the order to be cancelled is a trigger order |


```javascript
gate.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-in-specified-currency-pair
- https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched
- https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched-2
- https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched-3


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.cancelAllOrders (symbol[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: A [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#transfer-between-trading-accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code for currency being transferred |
| amount | <code>float</code> | Yes | the amount of currency to transfer |
| fromAccount | <code>string</code> | Yes | the account to transfer currency from |
| toAccount | <code>string</code> | Yes | the account to transfer currency to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | Unified market symbol *required for type == margin* |


```javascript
gate.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.gate.io/docs/developers/apiv4/en/#update-position-leverage
- https://www.gate.io/docs/developers/apiv4/en/#update-position-leverage-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.setLeverage (leverage, symbol[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open contract position

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#get-single-position
- https://www.gate.io/docs/developers/apiv4/en/#get-single-position-2
- https://www.gate.io/docs/developers/apiv4/en/#get-specified-contract-position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-all-positions-of-a-user
- https://www.gate.io/docs/developers/apiv4/en/#list-all-positions-of-a-user-2
- https://www.gate.io/docs/developers/apiv4/en/#list-user-s-positions-of-specified-underlying


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | Not used by gate, but parsed internally by CCXT |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.settle | <code>string</code> | No | 'btc' or 'usdt' - settle currency for perpetual swap and future - default="usdt" for swap and "btc" for future |
| params.type | <code>string</code> | No | swap, future or option, if not provided this.options['defaultType'] is used |


```javascript
gate.fetchPositions (symbols[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts
- https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchLeverageTiers (symbols[, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-risk-limit-tiers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchMarketLeverageTiers (symbol[, params])
```


<a name="repayMargin" id="repaymargin"></a>

### repayMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.gate.io/docs/apiv4/en/#repay-a-loan  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.mode | <code>string</code> | No | 'all' or 'partial' payment mode, extra parameter required for isolated margin |
| params.id | <code>string</code> | No | '34267567' loan id, extra parameter required for isolated margin |


```javascript
gate.repayMargin (symbol, code, amount[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay cross margin borrowed margin and interest

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#cross-margin-repayments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.mode | <code>string</code> | No | 'all' or 'partial' payment mode, extra parameter required for isolated margin |
| params.id | <code>string</code> | No | '34267567' loan id, extra parameter required for isolated margin |


```javascript
gate.repayCrossMargin (code, amount, symbol[, params])
```


<a name="borrowMargin" id="borrowmargin"></a>

### borrowMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#marginuni  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.rate | <code>string</code> | No | '0.0002' or '0.002' extra parameter required for isolated margin |


```javascript
gate.borrowMargin (code, amount, symbol[, params])
```


<a name="borrowMargin" id="borrowmargin"></a>

### borrowMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.gate.io/docs/apiv4/en/#create-a-cross-margin-borrow-loan  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.rate | <code>string</code> | No | '0.0002' or '0.002' extra parameter required for isolated margin |


```javascript
gate.borrowMargin (code, amount, symbol[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#update-position-margin
- https://www.gate.io/docs/developers/apiv4/en/#update-position-margin-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#update-position-margin
- https://www.gate.io/docs/developers/apiv4/en/#update-position-margin-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.addMargin (symbol, amount[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a currency

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#futures-stats  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| timeframe | <code>string</code> | Yes | "5m", "15m", "30m", "1h", "4h", "1d" |
| since | <code>int</code> | No | the time(ms) of the earliest record to retrieve as a unix timestamp |
| limit | <code>int</code> | No | default 30 |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
gate.fetchOpenInterest (symbol, timeframe[, since, limit, params])
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
fetches historical settlement records

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/#/?id=settlement-history-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-settlement-history-2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history, required on gate |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |


```javascript
gate.fetchSettlementHistory (symbol[, since, limit, params])
```


<a name="fetchMySettlementHistory" id="fetchmysettlementhistory"></a>

### fetchMySettlementHistory{docsify-ignore}
fetches historical settlement records of the user

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects]

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-my-options-settlements  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |


```javascript
gate.fetchMySettlementHistory (symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#query-account-book
- https://www.gate.io/docs/developers/apiv4/en/#list-margin-account-balance-change-history
- https://www.gate.io/docs/developers/apiv4/en/#query-account-book-2
- https://www.gate.io/docs/developers/apiv4/en/#query-account-book-3
- https://www.gate.io/docs/developers/apiv4/en/#list-account-changing-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
gate.fetchLedger (code[, since, limit, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set dual/hedged mode to true or false for a swap market, make sure all positions are closed and no orders are open before setting dual mode

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.gate.io/docs/developers/apiv4/en/#enable-or-disable-dual-mode  

| Param | Type | Description |
| --- | --- | --- |
| hedged | <code>bool</code> | set to true to enable dual mode |
| symbol | <code>string</code>, <code>undefined</code> | if passed, dual mode is set for all markets with the same settle currency |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |
| params.settle | <code>string</code> | settle currency |


```javascript
gate.setPositionMode (hedged, symbol, params[])
```


<a name="fetchUnderlyingAssets" id="fetchunderlyingassets"></a>

### fetchUnderlyingAssets{docsify-ignore}
fetches the market ids of underlying assets for a specific contract market type

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [underlying assets](https://docs.ccxt.com/#/?id=underlying-assets-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-all-underlyings  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>string</code> | No | the contract market type, 'option', 'swap' or 'future', the default is 'option' |


```javascript
gate.fetchUnderlyingAssets ([params])
```


<a name="fetchLiquidations" id="fetchliquidations"></a>

### fetchLiquidations{docsify-ignore}
retrieves the public liquidations of a trading pair

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#retrieve-liquidation-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |


```javascript
gate.fetchLiquidations (symbol[, since, limit, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#list-liquidation-history
- https://www.gate.io/docs/developers/apiv4/en/#list-liquidation-history-2
- https://www.gate.io/docs/developers/apiv4/en/#list-user-s-liquidation-history-of-specified-underlying


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the exchange API endpoint |


```javascript
gate.fetchMyLiquidations (symbol[, since, limit, params])
```


<a name="fetchGreeks" id="fetchgreeks"></a>

### fetchGreeks{docsify-ignore}
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)

**See**: https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.fetchGreeks (symbol[, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - [A list of position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order
- https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order-2
- https://www.gate.io/docs/developers/apiv4/en/#create-an-options-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| params | <code>object</code> | No | extra parameters specific to the okx api endpoint |


```javascript
gate.closePosition (symbol, side[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchOrderBook (symbol[, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchTickers (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchTradesForSymbols (symbol[, since, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchBalance ([params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**

- https://www.gate.io/docs/developers/futures/ws/en/#positions-subscription
- https://www.gate.io/docs/developers/delivery/ws/en/#positions-subscription
- https://www.gate.io/docs/developers/options/ws/en/#positions-channel


| Param | Type | Description |
| --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | list of unified market symbols |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
gate.watchPositions (symbols, params[])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>gate</code>](#gate)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot, margin, swap, future, or option. Required if listening to all symbols. |
| params.isInverse | <code>boolean</code> | No | if future, listen to inverse or linear contracts |


```javascript
gate.watchOrders (symbol[, since, limit, params])
```

