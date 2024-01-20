
<a name="coinex" id="coinex"></a>

## coinex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchTime](#fetchtime)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelOrders](#cancelorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [createDepositAddress](#createdepositaddress)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchMyTrades](#fetchmytrades)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [setMarginMode](#setmarginmode)
* [setLeverage](#setleverage)
* [fetchLeverageTiers](#fetchleveragetiers)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [withdraw](#withdraw)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchIsolatedBorrowRate](#fetchisolatedborrowrate)
* [fetchIsolatedBorrowRates](#fetchisolatedborrowrates)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [watchBalance](#watchbalance)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchTrades](#watchtrades)
* [watchOrderBook](#watchorderbook)
* [watchOHLCV](#watchohlcv)
* [fetchOHLCV](#fetchohlcv)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for coinex

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market002_all_market_info
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http006_market_list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market007_single_market_ticker
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http008_market_ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market008_all_market_ticker
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http009_market_ticker_all


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTickers (symbols[, params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http005_system_time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTime ([params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market004_market_depth
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http010_market_depth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market005_market_deals
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http011_market_deals


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market003_single_market_info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market002_all_market_info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTradingFees ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market006_market_kline
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http012_market_kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account001_account_info         // spot
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account004_investment_balance   // financial
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account006_margin_account       // margin
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http016_asset_query       // swap


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'margin', 'swap', 'financial', or 'spot' |


```javascript
coinex.fetchBalance ([params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade001_limit_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade004_IOC_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade005_stop_limit_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade006_stop_market_order
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http017_put_limit
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http018_put_market
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http019_put_limit_stop
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http020_put_market_stop
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http031_market_close
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http030_limit_close


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | price to trigger stop orders |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop loss orders |
| params.takeProfitPrice | <code>float</code> | No | price to trigger take profit orders |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', 'PO' |
| params.postOnly | <code>boolean</code> | No | set to true if you wish to make a post only order |
| params.reduceOnly | <code>boolean</code> | No | *contract only* indicates if this order is to reduce the size of a position |
| params.position_id | <code>int</code> | No | *required for reduce only orders* the position id to reduce |


```javascript
coinex.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders (all orders should be of the same symbol)

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade002_batch_limit_orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the api endpoint |


```javascript
coinex.createOrders (orders[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade016_batch_cancel_order
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http021-0_cancel_order_batch


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.cancelOrders (ids, symbol[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade018_cancle_stop_pending_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade015_cancel_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade024_cancel_order_by_client_id
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade025_cancel_stop_order_by_client_id
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http023_cancel_stop_order
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http021_cancel_order
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http042_cancel_order_by_client_id
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http043_cancel_stop_order_by_client_id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, defaults to id if not passed |
| params.stop | <code>boolean</code> | No | if stop order = true, default = false |


```javascript
coinex.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade018_cancle_stop_pending_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade015_cancel_order
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http024_cancel_stop_all
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http022_cancel_all


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.cancelAllOrders (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http028_stop_status
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http026_order_status
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade007_order_status


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchOrder (symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http027_query_pending_stop
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http025_query_pending
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade013_stop_pending_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade011_pending_order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http029_query_finished
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade010_stop_finished_order
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade012_finished_order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account019_update_deposit_address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account020_query_deposit_address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchDepositAddress (code[, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http013_user_deals
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade014_user_deals


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http033_pending_position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchPositions (symbols[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http033_pending_position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchPosition (symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http014_adjust_leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.setMarginMode (marginMode, symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http014_adjust_leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' (default is 'cross') |


```javascript
coinex.setLeverage (leverage, symbol[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http007_market_limit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchLeverageTiers (symbols[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http032_adjust_position_margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.addMargin (symbol, amount[, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http032_adjust_position_margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.reduceMargin (symbol, amount[, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http034_funding_position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http008_market_ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rates

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http009_market_ticker_all  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchFundingRates (symbols[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account015_submit_withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | unified network code |


```javascript
coinex.withdraw (code, amount, address, tag[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures001_http038_funding_history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
coinex.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account014_balance_contract_transfer
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account013_margin_transfer


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account025_margin_transfer_history
- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account024_contract_transfer_history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of  transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchTransfers (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account026_withdraw_list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account009_deposit_list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchDeposits (code[, since, limit, params])
```


<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

### fetchIsolatedBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account007_margin_account_settings  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the borrow rate for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchIsolatedBorrowRate (symbol[, params])
```


<a name="fetchIsolatedBorrowRates" id="fetchisolatedborrowrates"></a>

### fetchIsolatedBorrowRates{docsify-ignore}
fetch the borrow interest rates of all currencies

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a list of [isolated borrow rate structures](https://github.com/ccxt/ccxt/wiki/Manual#isolated-borrow-rate-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot002_account007_margin_account_settings  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchIsolatedBorrowRates ([params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://github.com/coinexcom/coinex_exchange_api/wiki/086margin_loan  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for coinex |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://github.com/coinexcom/coinex_exchange_api/wiki/087margin_flat  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for coinex |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loan_id | <code>string</code> | No | extra parameter that is not required |


```javascript
coinex.repayIsolatedMargin (symbol, code, amount[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fees structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot001_market010_asset_config  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchDepositWithdrawFees (codes[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchBalance ([params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot004_websocket007_state_subscribe  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot004_websocket007_state_subscribe  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchTickers (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot004_websocket012_deal_subcribe
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures002_websocket019_deal_subcribe


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchTrades (symbol[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot004_websocket017_depth_subscribe_multi
- https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures002_websocket011_depth_subscribe_multi


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchOrderBook (symbol[, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://viabtc.github.io/coinex_api_en_doc/futures/#docsfutures002_websocket023_kline_subscribe  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
query historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot004_websocket005_kline_query  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified symbol of the market to query OHLCV data for |
| timeframe | <code>string</code> | the length of time each candle represents |
| since | <code>int</code>, <code>undefined</code> | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code>, <code>undefined</code> | the maximum amount of candles to fetch |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |
| params.end | <code>int</code>, <code>undefined</code> | the end time for spot markets, this.seconds () is set as default |


```javascript
coinex.fetchOHLCV (symbol, timeframe, since, limit, params[])
```

