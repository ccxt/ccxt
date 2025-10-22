
<a name="coinex" id="coinex"></a>

## coinex{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
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
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOrdersByStatus](#fetchordersbystatus)
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
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchFundingRates](#fetchfundingrates)
* [withdraw](#withdraw)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchIsolatedBorrowRate](#fetchisolatedborrowrate)
* [fetchBorrowInterest](#fetchborrowinterest)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [fetchDepositWithdrawFee](#fetchdepositwithdrawfee)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchLeverage](#fetchleverage)
* [fetchPositionHistory](#fetchpositionhistory)
* [closePosition](#closeposition)
* [fetchMarginAdjustmentHistory](#fetchmarginadjustmenthistory)
* [watchBalance](#watchbalance)
* [watchMyTrades](#watchmytrades)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)
* [watchBidsAsks](#watchbidsasks)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for coinex

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.coinex.com/api/v2/spot/market/http/list-market
- https://docs.coinex.com/api/v2/futures/market/http/list-market


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

- https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
- https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker


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

- https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
- https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker


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

**See**: https://docs.coinex.com/api/v2/common/http/time  

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

- https://docs.coinex.com/api/v2/spot/market/http/list-market-depth
- https://docs.coinex.com/api/v2/futures/market/http/list-market-depth


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
get the list of the most recent trades for a particular symbol

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://docs.coinex.com/api/v2/spot/market/http/list-market-deals
- https://docs.coinex.com/api/v2/futures/market/http/list-market-deals


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

**See**

- https://docs.coinex.com/api/v2/spot/market/http/list-market
- https://docs.coinex.com/api/v2/futures/market/http/list-market


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

**See**

- https://docs.coinex.com/api/v2/spot/market/http/list-market
- https://docs.coinex.com/api/v2/futures/market/http/list-market


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

- https://docs.coinex.com/api/v2/spot/market/http/list-market-kline
- https://docs.coinex.com/api/v2/futures/market/http/list-market-kline


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

- https://docs.coinex.com/api/v2/assets/balance/http/get-spot-balance         // spot
- https://docs.coinex.com/api/v2/assets/balance/http/get-futures-balance      // swap
- https://docs.coinex.com/api/v2/assets/balance/http/get-marigin-balance      // margin
- https://docs.coinex.com/api/v2/assets/balance/http/get-financial-balance    // financial


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

**See**

- https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
- https://docs.coinex.com/api/v2/spot/order/http/put-order


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

- https://docs.coinex.com/api/v2/spot/order/http/put-order
- https://docs.coinex.com/api/v2/spot/order/http/put-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/put-order
- https://docs.coinex.com/api/v2/futures/order/http/put-stop-order
- https://docs.coinex.com/api/v2/futures/position/http/close-position
- https://docs.coinex.com/api/v2/futures/position/http/set-position-stop-loss
- https://docs.coinex.com/api/v2/futures/position/http/set-position-take-profit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | price to trigger stop orders |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop loss orders |
| params.takeProfitPrice | <code>float</code> | No | price to trigger take profit orders |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', 'PO' |
| params.postOnly | <code>boolean</code> | No | set to true if you wish to make a post only order |
| params.reduceOnly | <code>boolean</code> | No | *contract only* indicates if this order is to reduce the size of a position |


```javascript
coinex.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders (all orders should be of the same symbol)

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/put-multi-order
- https://docs.coinex.com/api/v2/spot/order/http/put-multi-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/put-multi-order
- https://docs.coinex.com/api/v2/futures/order/http/put-multi-stop-order


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

- https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-order
- https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-order
- https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-stop-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for canceling stop orders |


```javascript
coinex.cancelOrders (ids, symbol[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/edit-order
- https://docs.coinex.com/api/v2/spot/order/http/edit-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/edit-order
- https://docs.coinex.com/api/v2/futures/order/http/edit-stop-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the price to trigger stop orders |


```javascript
coinex.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/cancel-order
- https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order
- https://docs.coinex.com/api/v2/spot/order/http/cancel-order-by-client-id
- https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order-by-client-id
- https://docs.coinex.com/api/v2/futures/order/http/cancel-order
- https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/cancel-order-by-client-id
- https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order-by-client-id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, defaults to id if not passed |
| params.trigger | <code>boolean</code> | No | set to true for canceling a trigger order |


```javascript
coinex.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/cancel-all-order
- https://docs.coinex.com/api/v2/futures/order/http/cancel-all-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' for canceling spot margin orders |


```javascript
coinex.cancelAllOrders (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/get-order-status
- https://docs.coinex.com/api/v2/futures/order/http/get-order-status


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchOrder (id, symbol[, params])
```


<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

### fetchOrdersByStatus{docsify-ignore}
fetch a list of orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
- https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
- https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | order status to fetch for |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' for fetching spot margin orders |


```javascript
coinex.fetchOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/list-pending-order
- https://docs.coinex.com/api/v2/spot/order/http/list-pending-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/list-pending-order
- https://docs.coinex.com/api/v2/futures/order/http/list-pending-stop-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' for fetching spot margin orders |


```javascript
coinex.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
- https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
- https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
- https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' for fetching spot margin orders |


```javascript
coinex.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/update-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the blockchain network to create a deposit address on |


```javascript
coinex.createDepositAddress (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the blockchain network to create a deposit address on |


```javascript
coinex.fetchDepositAddress (code[, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.coinex.com/api/v2/spot/deal/http/list-user-deals
- https://docs.coinex.com/api/v2/futures/deal/http/list-user-deals


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trades |
| params.side | <code>string</code> | No | the side of the trades, either 'buy' or 'sell', required for swap |


```javascript
coinex.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
- https://docs.coinex.com/api/v2/futures/position/http/list-finished-position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | the method to use 'v2PrivateGetFuturesPendingPosition' or 'v2PrivateGetFuturesFinishedPosition' default is 'v2PrivateGetFuturesPendingPosition' |


```javascript
coinex.fetchPositions ([symbols, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.coinex.com/api/v2/futures/position/http/list-pending-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchPosition (symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>int</code> | Yes | the rate of leverage |


```javascript
coinex.setMarginMode (marginMode, symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage  

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

**See**: https://docs.coinex.com/api/v2/futures/market/http/list-market-position-level  

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

**See**: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin  

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

**See**: https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin  

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
fetch the history of funding fee payments paid and received on this account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://docs.coinex.com/api/v2/futures/position/http/list-position-funding-history  

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

**See**: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchFundingInterval (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rates for multiple markets

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate  

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

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No | memo |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | unified network code |


```javascript
coinex.withdraw (code, amount, address[, tag, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
coinex.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.coinex.com/api/v2/assets/transfer/http/transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | unified ccxt symbol, required when either the fromAccount or toAccount is margin |


```javascript
coinex.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.coinex.com/api/v2/assets/transfer/http/list-transfer-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' for fetching transfers to and from your margin account |


```javascript
coinex.fetchTransfers (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-withdrawal-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawal structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchWithdrawals ([code, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-deposit-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposit structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchDeposits ([code, since, limit, params])
```


<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

### fetchIsolatedBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure)

**See**: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the borrow rate for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.code | <code>string</code> | Yes | unified currency code |


```javascript
coinex.fetchIsolatedBorrowRate (symbol[, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)

**See**: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-borrow-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | unified market symbol when fetch interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchBorrowInterest ([code, symbol, since, limit, params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-borrow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for coinex |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.isAutoRenew | <code>boolean</code> | No | whether to renew the margin loan automatically or not, default is false |


```javascript
coinex.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for coinex |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.borrow_id | <code>string</code> | No | extra parameter that is not required |


```javascript
coinex.repayIsolatedMargin (symbol, code, amount[, params])
```


<a name="fetchDepositWithdrawFee" id="fetchdepositwithdrawfee"></a>

### fetchDepositWithdrawFee{docsify-ignore}
fetch the fee for deposits and withdrawals

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-withdrawal-config  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchDepositWithdrawFee (code[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch the fees for deposits and withdrawals

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes |  | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.code | <code>string</code> | Yes | unified currency code |


```javascript
coinex.fetchLeverage (symbol[, params])
```


<a name="fetchPositionHistory" id="fetchpositionhistory"></a>

### fetchPositionHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.coinex.com/api/v2/futures/position/http/list-finished-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified contract symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum amount of records to fetch, default is 10 |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch positions for |


```javascript
coinex.fetchPositionHistory (symbol[, since, limit, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position for a market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.coinex.com/api/v2/futures/position/http/close-position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| side | <code>string</code> | No | buy or sell, not used by coinex |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | Yes | required by coinex, one of: limit, market, maker_only, ioc or fok, default is *market* |
| params.price | <code>string</code> | No | the price to fulfill the order, ignored in market orders |
| params.amount | <code>string</code> | No | the amount to trade in units of the base currency |
| params.clientOrderId | <code>string</code> | No | the client id of the order |


```javascript
coinex.closePosition (symbol[, side, params])
```


<a name="fetchMarginAdjustmentHistory" id="fetchmarginadjustmenthistory"></a>

### fetchMarginAdjustmentHistory{docsify-ignore}
fetches the history of margin added or reduced from contract isolated positions

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [margin structures](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://docs.coinex.com/api/v2/futures/position/http/list-position-margin-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| type | <code>string</code> | No | not used by coinex fetchMarginAdjustmentHistory |
| since | <code>int</code> | No | timestamp in ms of the earliest change to fetch |
| limit | <code>int</code> | No | the maximum amount of changes to fetch, default is 10 |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest change to fetch |
| params.positionId | <code>int</code> | No | the id of the position that you want to retrieve margin adjustment history for |


```javascript
coinex.fetchMarginAdjustmentHistory (symbol[, type, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://docs.coinex.com/api/v2/assets/balance/ws/spot_balance
- https://docs.coinex.com/api/v2/assets/balance/ws/futures_balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchBalance ([params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.coinex.com/api/v2/spot/deal/ws/user-deals
- https://docs.coinex.com/api/v2/futures/deal/ws/user-deals


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market the trades were made in |
| since | <code>int</code> | No | the earliest time in ms to watch trades |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchMyTrades ([symbol, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.coinex.com/api/v2/spot/market/ws/market
- https://docs.coinex.com/api/v2/futures/market/ws/market-state


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

**See**

- https://docs.coinex.com/api/v2/spot/market/ws/market
- https://docs.coinex.com/api/v2/futures/market/ws/market-state


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

- https://docs.coinex.com/api/v2/spot/market/ws/market-deals
- https://docs.coinex.com/api/v2/futures/market/ws/market-deals


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
watch the most recent trades for a list of symbols

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://docs.coinex.com/api/v2/spot/market/ws/market-deals
- https://docs.coinex.com/api/v2/futures/market/ws/market-deals


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://docs.coinex.com/api/v2/spot/market/ws/market-depth
- https://docs.coinex.com/api/v2/futures/market/ws/market-depth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://docs.coinex.com/api/v2/spot/market/ws/market-depth
- https://docs.coinex.com/api/v2/futures/market/ws/market-depth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.coinex.com/api/v2/spot/order/ws/user-order
- https://docs.coinex.com/api/v2/futures/order/ws/user-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | if the orders to watch are trigger orders or not |


```javascript
coinex.watchOrders (symbol[, since, limit, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>coinex</code>](#coinex)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.coinex.com/api/v2/spot/market/ws/market-bbo
- https://docs.coinex.com/api/v2/futures/market/ws/market-bbo


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinex.watchBidsAsks ([symbols, params])
```

