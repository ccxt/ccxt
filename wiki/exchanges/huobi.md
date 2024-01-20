
<a name="huobi" id="huobi"></a>

## huobi{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchTradingFee](#fetchtradingfee)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchAccounts](#fetchaccounts)
* [fetchCurrencies](#fetchcurrencies)
* [fetchBalance](#fetchbalance)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOpenOrders](#fetchopenorders)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [transfer](#transfer)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchBorrowInterest](#fetchborrowinterest)
* [fetchFundingHistory](#fetchfundinghistory)
* [setLeverage](#setleverage)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchLedger](#fetchledger)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchOpenInterestHistory](#fetchopeninteresthistory)
* [fetchOpenInterest](#fetchopeninterest)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [borrowCrossMargin](#borrowcrossmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [repayCrossMargin](#repaycrossmargin)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchLiquidations](#fetchliquidations)
* [watchTicker](#watchticker)
* [watchTrades](#watchtrades)
* [watchOHLCV](#watchohlcv)
* [watchOrderBook](#watchorderbook)
* [watchMyTrades](#watchmytrades)
* [watchOrders](#watchorders)
* [watchPositions](#watchpositions)
* [watchBalance](#watchbalance)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchTime ([params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchTradingFee (symbol[, params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for huobi

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#get-latest-tickers-for-all-pairs
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-a-batch-of-market-data-overview
- https://huobiapi.github.io/docs/dm/v1/en/#get-a-batch-of-market-data-overview
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-a-batch-of-market-data-overview-v2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchTickers (symbols[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-history-match-results-via-multiple-fields-new
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-history-match-results-via-multiple-fields-new
- https://huobiapi.github.io/docs/spot/v1/en/#search-match-results


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
huobi.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#get-the-most-recent-trades
- https://huobiapi.github.io/docs/dm/v1/en/#query-a-batch-of-trade-records-of-a-contract
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-a-batch-of-trade-records-of-a-contract
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-a-batch-of-trade-records-of-a-contract


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#get-klines-candles
- https://huobiapi.github.io/docs/dm/v1/en/#get-kline-data
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-kline-data
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-kline-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
huobi.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchAccounts ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchCurrencies ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#get-account-balance-of-a-specific-account
- https://www.htx.com/en-us/opend/newApiPages/?id=7ec4b429-7773-11ed-9966-0242ac110003
- https://www.htx.com/en-us/opend/newApiPages/?id=10000074-77b7-11ed-9966-0242ac110003
- https://huobiapi.github.io/docs/dm/v1/en/#query-asset-valuation
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-user-s-account-information
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-query-user-s-account-information
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-query-user-39-s-account-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unified | <code>bool</code> | No | provide this parameter if you have a recent account with unified cross+isolated margin account |


```javascript
huobi.fetchBalance ([params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchOrder (symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#search-past-orders
- https://huobiapi.github.io/docs/spot/v1/en/#search-historical-orders-within-48-hours
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-history-orders-new
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-history-orders-new
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-history-orders-new
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-history-orders-via-multiple-fields-new


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | *contract only* if the orders are stop trigger orders or not |
| params.stopLossTakeProfit | <code>bool</code> | No | *contract only* if the orders are stop-loss or take-profit orders |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.trailing | <code>boolean</code> | No | *contract only* set to true if you want to fetch trailing stop orders |


```javascript
huobi.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#search-past-orders
- https://huobiapi.github.io/docs/spot/v1/en/#search-historical-orders-within-48-hours
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-history-orders-new
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-history-orders-new
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-history-orders-new
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-history-orders-via-multiple-fields-new


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
huobi.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#get-all-open-orders
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-current-unfilled-order-acquisition
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-current-unfilled-order-acquisition


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | *contract only* if the orders are stop trigger orders or not |
| params.stopLossTakeProfit | <code>bool</code> | No | *contract only* if the orders are stop-loss or take-profit orders |
| params.trailing | <code>boolean</code> | No | *contract only* set to true if you want to fetch trailing stop orders |


```javascript
huobi.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#place-a-new-order                   // spot, margin
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#place-an-order        // coin-m swap
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#place-trigger-order   // coin-m swap trigger
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-an-order           // usdt-m swap cross
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-trigger-order      // usdt-m swap cross trigger
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-place-an-order        // usdt-m swap isolated
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-place-trigger-order   // usdt-m swap isolated trigger
- https://huobiapi.github.io/docs/dm/v1/en/#place-an-order                        // coin-m futures
- https://huobiapi.github.io/docs/dm/v1/en/#place-trigger-order                   // coin-m futures contract trigger


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stopPrice | <code>float</code> | No | the price a trigger order is triggered at |
| params.triggerType | <code>string</code> | No | *contract trigger orders only* ge: greater than or equal to, le: less than or equal to |
| params.stopLossPrice | <code>float</code> | No | *contract only* the price a stop-loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *contract only* the price a take-profit order is triggered at |
| params.operator | <code>string</code> | No | *spot and margin only* gte or lte, trigger price condition |
| params.offset | <code>string</code> | No | *contract only* 'open', 'close', or 'both', required in hedge mode |
| params.postOnly | <code>bool</code> | No | *contract only* true or false |
| params.leverRate | <code>int</code> | No | *contract only* required for all contract orders except tpsl, leverage greater than 20x requires prior approval of high-leverage agreement |
| params.timeInForce | <code>string</code> | No | supports 'IOC' and 'FOK' |
| params.cost | <code>float</code> | No | *spot market buy only* the quote quantity that can be used as an alternative for the amount |
| params.trailingPercent | <code>float</code> | No | *contract only* the percent to trail away from the current market price |
| params.trailingTriggerPrice | <code>float</code> | No | *contract only* the price to trigger a trailing order, default uses the price argument |


```javascript
huobi.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>boolean</code> | No | *contract only* if the order is a stop trigger order or not |
| params.stopLossTakeProfit | <code>boolean</code> | No | *contract only* if the order is a stop-loss or take-profit order |
| params.trailing | <code>boolean</code> | No | *contract only* set to true if you want to cancel a trailing order |


```javascript
huobi.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>bool</code> | No | *contract only* if the orders are stop trigger orders or not |
| params.stopLossTakeProfit | <code>bool</code> | No | *contract only* if the orders are stop-loss or take-profit orders |


```javascript
huobi.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stop | <code>boolean</code> | No | *contract only* if the orders are stop trigger orders or not |
| params.stopLossTakeProfit | <code>boolean</code> | No | *contract only* if the orders are stop-loss or take-profit orders |
| params.trailing | <code>boolean</code> | No | *contract only* set to true if you want to cancel all trailing orders |


```javascript
huobi.cancelAllOrders (symbol[, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch a dictionary of addresses for a currency, indexed by network

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/#/?id=address-structure) indexed by the network


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchWithdrawals (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.withdraw (code, amount, address, tag[, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://huobiapi.github.io/docs/dm/v1/en/#transfer-margin-between-spot-account-and-future-account
- https://huobiapi.github.io/docs/spot/v1/en/#transfer-fund-between-spot-account-and-future-contract-account
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-transfer-margin-between-spot-account-and-usdt-margined-contracts-account
- https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-spot-trading-account-to-cross-margin-account-cross
- https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-spot-trading-account-to-isolated-margin-account-isolated
- https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-cross-margin-account-to-spot-trading-account-cross
- https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-isolated-margin-account-to-spot-trading-account-isolated


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from 'spot', 'future', 'swap' |
| toAccount | <code>string</code> | Yes | account to transfer to 'spot', 'future', 'swap' |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | used for isolated margin transfer |
| params.subType | <code>string</code> | No | 'linear' or 'inverse', only used when transfering to/from swap accounts |


```javascript
huobi.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**

- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-historical-funding-rate
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-historical-funding-rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | not used by huobi, but filtered internally by ccxt |
| limit | <code>int</code> | No | not used by huobi, but filtered internally by ccxt |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a dictionary of [funding rates structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexe by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchFundingRates (symbols[, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| symbol | <code>string</code> | Yes | unified market symbol when fetch interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchBorrowInterest (code, symbol[, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**

- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-account-financial-records-via-multiple-fields-new   // linear swaps
- https://huobiapi.github.io/docs/dm/v1/en/#query-financial-records-via-multiple-fields-new                          // coin-m futures
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-financial-records-via-multiple-fields-new          // coin-m swaps


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.setLeverage (leverage, symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchPositions (symbols[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchPosition (symbol[, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered balance of the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger-structure)

**See**: https://huobiapi.github.io/docs/spot/v1/en/#get-account-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entrys to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
huobi.fetchLedger (code[, since, limit, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchLeverageTiers (symbols[, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchMarketLeverageTiers (symbol[, params])
```


<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

### fetchOpenInterestHistory{docsify-ignore}
Retrieves the open interest history of a currency

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an array of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**

- https://huobiapi.github.io/docs/dm/v1/en/#query-information-on-open-interest
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-information-on-open-interest
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-information-on-open-interest


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| timeframe | <code>string</code> | Yes | '1h', '4h', '12h', or '1d' |
| since | <code>int</code> | No | Not used by huobi api, but response parsed by CCXT |
| limit | <code>int</code> | No | Default：48，Data Range [1,200] |
| params | <code>object</code> | No | Exchange specific parameters |
| params.amount_type | <code>int</code> | No | *required* Open interest unit. 1-cont，2-cryptocurrency |
| params.pair | <code>int</code> | No | eg BTC-USDT *Only for USDT-M* |


```javascript
huobi.fetchOpenInterestHistory (symbol, timeframe[, since, limit, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a currency

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**

- https://huobiapi.github.io/docs/dm/v1/en/#get-contract-open-interest-information
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-swap-open-interest-information
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-swap-open-interest-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
huobi.fetchOpenInterest (symbol[, params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-isolated
- https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-cross


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**

- https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-isolated
- https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-cross


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.borrowCrossMargin (code, amount[, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://huobiapi.github.io/docs/spot/v1/en/#repay-margin-loan-cross-isolated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.repayIsolatedMargin (code, amount, symbol[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://huobiapi.github.io/docs/spot/v1/en/#repay-margin-loan-cross-isolated  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.repayCrossMargin (code, amount[, params])
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
Fetches historical settlement records

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/#/?id=settlement-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the settlement history for |
| since | <code>int</code> | No | timestamp in ms, value range = current time - 90 days，default = current time - 90 days |
| limit | <code>int</code> | No | page items, default 20, shall not exceed 50 |
| params | <code>object</code> | No | exchange specific params |
| params.until | <code>int</code> | No | timestamp in ms, value range = start_time -> current time，default = current time |
| params.page_index | <code>int</code> | No | page index, default page 1 if not filled |
| params.code | <code>int</code> | No | unified currency code, can be used when symbol is undefined |


```javascript
huobi.fetchSettlementHistory (symbol[, since, limit, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fees structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://huobiapi.github.io/docs/spot/v1/en/#get-all-supported-currencies-v2  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchLiquidations" id="fetchliquidations"></a>

### fetchLiquidations{docsify-ignore}
retrieves the public liquidations of a trading pair

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**

- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-liquidation-orders-new
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-liquidation-orders-new
- https://huobiapi.github.io/docs/dm/v1/en/#query-liquidation-order-information-new


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the huobi api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.tradeType | <code>int</code> | No | default 0, linear swap 0: all liquidated orders, 5: liquidated longs; 6: liquidated shorts, inverse swap and future 0: filled liquidated orders, 5: liquidated close orders, 6: liquidated open orders |


```javascript
huobi.fetchLiquidations (symbol[, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchTicker (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchTrades (symbol[, since, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://huobiapi.github.io/docs/dm/v1/en/#subscribe-market-depth-data
- https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#subscribe-incremental-market-depth-data
- https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-subscribe-incremental-market-depth-data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchOrderBook (symbol[, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchOrders (symbol[, since, limit, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions. Note: huobi has one channel for each marginMode and type

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**

- https://www.huobi.com/en-in/opend/newApiPages/?id=8cb7de1c-77b5-11ed-9966-0242ac110003
- https://www.huobi.com/en-in/opend/newApiPages/?id=8cb7df0f-77b5-11ed-9966-0242ac110003
- https://www.huobi.com/en-in/opend/newApiPages/?id=28c34a7d-77ae-11ed-9966-0242ac110003
- https://www.huobi.com/en-in/opend/newApiPages/?id=5d5156b5-77b6-11ed-9966-0242ac110003


| Param | Type | Description |
| --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | list of unified market symbols |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchPositions (symbols, params[])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>huobi</code>](#huobi)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
huobi.watchBalance ([params])
```

