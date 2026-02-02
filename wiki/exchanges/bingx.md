
<a name="bingx" id="bingx"></a>

## bingx{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchMarkPrice](#fetchmarkprice)
* [fetchMarkPrices](#fetchmarkprices)
* [fetchBalance](#fetchbalance)
* [fetchPositionHistory](#fetchpositionhistory)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [createMarketOrderWithCost](#createmarketorderwithcost)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelOrders](#cancelorders)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [setMarginMode](#setmarginmode)
* [setMargin](#setmargin)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchMyTrades](#fetchmytrades)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [withdraw](#withdraw)
* [fetchMyLiquidations](#fetchmyliquidations)
* [closePosition](#closeposition)
* [fetchPositionMode](#fetchpositionmode)
* [setPositionMode](#setpositionmode)
* [editOrder](#editorder)
* [fetchMarginMode](#fetchmarginmode)
* [fetchTradingFee](#fetchtradingfee)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the bingx server

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the bingx server

**See**: https://bingx-api.github.io/docs/#/swapV2/base-info.html#Get%20Server%20Time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://bingx-api.github.io/docs/#/common/account-api.html#All%20Coins  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bingx

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20Symbols
- https://bingx-api.github.io/docs/#/swapV2/market-api.html#Contract%20Information
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Contract%20Information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchMarkets ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bingx-api.github.io/docs/#/swapV2/market-api.html#K-Line%20Data
- https://bingx-api.github.io/docs/#/spot/market-api.html#Candlestick%20chart%20data
- https://bingx-api.github.io/docs/#/swapV2/market-api.html#%20K-Line%20Data
- https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Mark%20Price%20Kline/Candlestick%20Data
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Get%20K-line%20Data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bingx.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20transaction%20records
- https://bingx-api.github.io/docs/#/swapV2/market-api.html#The%20latest%20Trade%20of%20a%20Trading%20Pair


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20depth%20information
- https://bingx-api.github.io/docs/#/swapV2/market-api.html#Get%20Market%20Depth
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%20Depth%20Data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**

- https://bingx-api.github.io/docs/#/swapV2/market-api.html#Current%20Funding%20Rate
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Price%20&%20Current%20Funding%20Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rate for multiple symbols

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://bingx-api.github.io/docs/#/swapV2/market-api.html#Current%20Funding%20Rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchFundingRates ([symbols, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://bingx-api.github.io/docs/#/swapV2/market-api.html#Funding%20Rate%20History  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bingx.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetches historical funding received

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Get%20Account%20Profit%20and%20Loss%20Fund%20Flow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding history structures](https://docs.ccxt.com/?id=funding-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding to fetch |


```javascript
bingx.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a trading pair

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)

**See**

- https://bingx-api.github.io/docs/#/swapV2/market-api.html#Get%20Swap%20Open%20Positions
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Get%20Swap%20Open%20Positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
bingx.fetchOpenInterest (symbol[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Get%20Ticker
- https://bingx-api.github.io/docs/#/en-us/spot/market-api.html#24-hour%20price%20changes
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%2024-Hour%20Price%20Change


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Get%20Ticker
- https://bingx-api.github.io/docs/#/en-us/spot/market-api.html#24-hour%20price%20changes
- https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%2024-Hour%20Price%20Change


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchTickers (symbols[, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches mark prices for the market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Mark%20Price%20and%20Funding%20Rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchMarkPrice (symbol[, params])
```


<a name="fetchMarkPrices" id="fetchmarkprices"></a>

### fetchMarkPrices{docsify-ignore}
fetches mark prices for multiple markets

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Mark%20Price%20and%20Funding%20Rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchMarkPrices ([symbols, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://bingx-api.github.io/docs/#/spot/trade-api.html#Query%20Assets
- https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20account%20data
- https://bingx-api.github.io/docs/#/standard/contract-interface.html#Query%20standard%20contract%20balance
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Account%20Assets


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.standard | <code>boolean</code> | No | whether to fetch standard contract balances |
| params.type | <code>string</code> | No | the type of balance to fetch (spot, swap, funding) default is `spot` |


```javascript
bingx.fetchBalance ([params])
```


<a name="fetchPositionHistory" id="fetchpositionhistory"></a>

### fetchPositionHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Position%20History  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified contract symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum amount of records to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch positions for |


```javascript
bingx.fetchPositionHistory (symbol[, since, limit, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20position%20data
- https://bingx-api.github.io/docs/#/en-us/standard/contract-interface.html#position
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20warehouse


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.standard | <code>boolean</code> | No | whether to fetch standard contract positions |


```javascript
bingx.fetchPositions (symbols[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20position%20data
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20warehouse


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchPosition (symbol[, params])
```


<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

### createMarketOrderWithCost{docsify-ignore}
create a market order by providing the symbol, side and cost

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.createMarketOrderWithCost (symbol, side, cost[, params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

### createMarketSellOrderWithCost{docsify-ignore}
create a market sell order by providing the symbol and cost

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.createMarketSellOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Trade%20order
- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Create%20an%20Order
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Trade%20order
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Place%20TWAP%20Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.postOnly | <code>bool</code> | No | true to place a post only order |
| params.timeInForce | <code>string</code> | No | spot supports 'PO', 'GTC' and 'IOC', swap supports 'PO', 'GTC', 'IOC' and 'FOK' |
| params.reduceOnly | <code>bool</code> | No | *swap only* true or false whether the order is reduce only |
| params.triggerPrice | <code>float</code> | No | triggerPrice at which the attached take profit / stop loss order will be triggered |
| params.stopLossPrice | <code>float</code> | No | stop loss trigger price |
| params.takeProfitPrice | <code>float</code> | No | take profit trigger price |
| params.cost | <code>float</code> | No | the quote quantity that can be used as an alternative for the amount |
| params.trailingAmount | <code>float</code> | No | *swap only* the quote amount to trail away from the current market price |
| params.trailingPercent | <code>float</code> | No | *swap only* the percent to trail away from the current market price |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.test | <code>boolean</code> | No | *swap only* whether to use the test endpoint or not, default is false |
| params.positionSide | <code>string</code> | No | *contracts only* "BOTH" for one way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode |
| params.hedged | <code>boolean</code> | No | *swap only* whether the order is in hedged mode or one way mode |


```javascript
bingx.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/spot/trade-api.html#Batch%20Placing%20Orders
- https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Bulk%20order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.sync | <code>boolean</code> | No | *spot only* if true, multiple orders are ordered serially and all orders do not require the same symbol/side/type |


```javascript
bingx.createOrders (orders[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20Order
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20Order
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Cancel%20an%20Order
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20TWAP%20Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |


```javascript
bingx.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20orders%20by%20symbol
- https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Cancel%20All%20Orders
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Cancel%20all%20orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.cancelAllOrders ([symbol, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Cancel%20a%20Batch%20of%20Orders
- https://bingx-api.github.io/docs/#/spot/trade-api.html#Cancel%20a%20Batch%20of%20Orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids |


```javascript
bingx.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - the api result

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20all%20orders%20in%20countdown
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20all%20orders%20in%20countdown


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap market |


```javascript
bingx.cancelAllOrdersAfter (timeout[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20details
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20details
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Order
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#TWAP%20Order%20Details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.twap | <code>boolean</code> | No | if fetching twap order |


```javascript
bingx.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#All%20Orders
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history (returns less fields than above)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.orderId | <code>int</code> | No | Only return subsequent orders, and return the latest order by default |


```javascript
bingx.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Current%20Open%20Orders
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Current%20All%20Open%20Orders
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20all%20current%20pending%20orders
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20TWAP%20Entrusted%20Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.twap | <code>boolean</code> | No | if fetching twap open orders |


```javascript
bingx.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20history
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#User's%20History%20Orders
- https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the closed orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of closed orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.standard | <code>boolean</code> | No | whether to fetch standard contract orders |


```javascript
bingx.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20history
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#User's%20History%20Orders
- https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the canceled orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of canceled orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.standard | <code>boolean</code> | No | whether to fetch standard contract orders |


```javascript
bingx.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20history
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#User's%20History%20Orders
- https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20TWAP%20Historical%20Orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.standard | <code>boolean</code> | No | whether to fetch standard contract orders |
| params.twap | <code>boolean</code> | No | if fetching twap orders |


```javascript
bingx.fetchCanceledAndClosedOrders ([symbol, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/common/account-api.html#Asset%20Transfer%20New  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from (spot, swap, futures, or funding) |
| toAccount | <code>string</code> | Yes | account to transfer to (spot, swap (linear or inverse), future, or funding) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/common/account-api.html#Asset%20transfer%20records%20new  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve (default 10, max 100) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.fromAccount | <code>string</code> | Yes | (mandatory) transfer from (spot, swap (linear or inverse), future, or funding) |
| params.toAccount | <code>string</code> | Yes | (mandatory) transfer to (spot, swap(linear or inverse), future, or funding) |
| params.paginate | <code>boolean</code> | No | whether to paginate the results (default false) |


```javascript
bingx.fetchTransfers ([code, since, limit, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch the deposit addresses for a currency associated with this account

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a dictionary [address structures](https://docs.ccxt.com/?id=address-structure), indexed by the network

**See**: https://bingx-api.github.io/docs/#/en-us/common/wallet-api.html#Query%20Main%20Account%20Deposit%20Address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/common/wallet-api.html#Query%20Main%20Account%20Deposit%20Address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency |


```javascript
bingx.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://bingx-api.github.io/docs/#/spot/account-api.html#Deposit%20History(supporting%20network)  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchDeposits ([code, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://bingx-api.github.io/docs/#/spot/account-api.html#Withdraw%20History%20(supporting%20network)  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchWithdrawals ([code, since, limit, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Change%20Margin%20Type
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Set%20Margin%20Type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.setMarginMode (marginMode, symbol[, params])
```


<a name="setMargin" id="setmargin"></a>

### setMargin{docsify-ignore}
Either adds or reduces margin in an isolated position in order to set the margin to a specific value

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - A [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Adjust%20isolated%20margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to set margin in |
| amount | <code>float</code> | Yes | the amount to set the margin to |
| params | <code>object</code> | No | parameters specific to the bingx api endpoint |


```javascript
bingx.setMargin (symbol, amount[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**

- https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Query%20Leverage
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Leverage


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Switch%20Leverage
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Modify%20Leverage


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.side | <code>string</code> | No | hedged: ['long' or 'short']. one way: ['both'] |


```javascript
bingx.setLeverage (leverage, symbol[, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20transaction%20details
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20historical%20transaction%20orders
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20historical%20transaction%20details
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Order%20Trade%20Detail


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is undefined |
| params.trandingUnit | <code>string</code> | Yes | COIN (directly represent assets such as BTC and ETH) or CONT (represents the number of contract sheets) |
| params.orderId | <code>string</code> | Yes | the order id required for inverse swap |


```javascript
bingx.fetchMyTrades ([symbol, since, limit, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/?id=fee-structure)

**See**: https://bingx-api.github.io/docs/#/common/account-api.html#All%20Coins'%20Information  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchDepositWithdrawFees (codes[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://bingx-api.github.io/docs/#/en-us/spot/wallet-api.html#Withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.walletType | <code>int</code> | No | 1 fund (funding) account, 2 standard account, 3 perpetual account, 15 spot account |


```javascript
bingx.withdraw (code, amount, address[, tag, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)

**See**

- https://bingx-api.github.io/docs/#/swapV2/trade-api.html#User's%20Force%20Orders
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20force%20orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bingx api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |


```javascript
bingx.fetchMyLiquidations ([symbol, since, limit, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#One-Click%20Close%20All%20Positions
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Close%20all%20positions%20in%20bulk


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | not used by bingx |
| params | <code>object</code> | No | extra parameters specific to the bingx api endpoint |
| params.positionId | <code>string</code>, <code>undefined</code> | No | the id of the position you would like to close |


```javascript
bingx.closePosition (symbol[, side, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Get%20Position%20Mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchPositionMode (symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Set%20Position%20Mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by bingx setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.setPositionMode (hedged, symbol[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
cancels an order and places a new order

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20order%20and%20place%20a%20new%20order  // spot
- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20an%20order%20and%20then%20Place%20a%20new%20order  // swap


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>string</code> | No | Trigger price used for TAKE_STOP_LIMIT, TAKE_STOP_MARKET, TRIGGER_LIMIT, TRIGGER_MARKET order types. |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price EXCHANGE SPECIFIC PARAMETERS |
| params.cancelClientOrderID | <code>string</code> | No | the user-defined id of the order to be canceled, 1-40 characters, different orders cannot use the same clientOrderID, only supports a query range of 2 hours |
| params.cancelRestrictions | <code>string</code> | No | cancel orders with specified status, NEW: New order, PENDING: Pending order, PARTIALLY_FILLED: Partially filled |
| params.cancelReplaceMode | <code>string</code> | No | STOP_ON_FAILURE - if the cancel order fails, it will not continue to place a new order, ALLOW_FAILURE - regardless of whether the cancel order succeeds or fails, it will continue to place a new order |
| params.quoteOrderQty | <code>float</code> | No | order amount |
| params.newClientOrderId | <code>string</code> | No | custom order id consisting of letters, numbers, and _, 1-40 characters, different orders cannot use the same newClientOrderId. |
| params.positionSide | <code>string</code> | No | *contract only* position direction, required for single position as BOTH, for both long and short positions only LONG or SHORT can be chosen, defaults to LONG if empty |
| params.reduceOnly | <code>string</code> | No | *contract only* true or false, default=false for single position mode. this parameter is not accepted for both long and short positions mode |
| params.priceRate | <code>float</code> | No | *contract only* for type TRAILING_STOP_Market or TRAILING_TP_SL, Max = 1 |
| params.workingType | <code>string</code> | No | *contract only* StopPrice trigger price types, MARK_PRICE (default), CONTRACT_PRICE, or INDEX_PRICE |


```javascript
bingx.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of the trading pair

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Margin%20Type
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Margin%20Type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchMarginMode (symbol[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Trading%20Commission%20Rate
- https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20Trading%20Commission%20Rate
- https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Trade%20Commission%20Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchTradingFee (symbol[, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, for different trade sizes for a single market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/?id=leverage-tiers-structure)

**See**: https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Position%20and%20Maintenance%20Margin%20Ratio  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.fetchMarketLeverageTiers (symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20to%2024-hour%20Price%20Change
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20to%2024-hour%20price%20changes
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%2024-Hour%20Price%20Change


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20to%2024-hour%20Price%20Change
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20to%2024-hour%20price%20changes
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%2024-Hour%20Price%20Change


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.unWatchTicker (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscription%20transaction%20by%20transaction
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20the%20Latest%20Trade%20Detail
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscription%20transaction%20by%20transaction


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchTrades (symbol[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribes from the trades channel

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscription%20transaction%20by%20transaction
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20the%20Latest%20Trade%20Detail
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscription%20transaction%20by%20transaction


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.name | <code>string</code> | No | the name of the method to call, 'trade' or 'aggTrade', default is 'trade' |


```javascript
bingx.unWatchTrades (symbol[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20Market%20Depth%20Data
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Limited%20Depth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#Subscribe%20Market%20Depth%20Data
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20Market%20Depth%20Data
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Limited%20Depth


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.unWatchOrderBook (symbol[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#K-line%20Streams
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20K-Line%20Data
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Latest%20Trading%20Pair%20K-Line


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/market.html#K-line%20Streams
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/market.html#Subscribe%20K-Line%20Data
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/market.html#Subscribe%20to%20Latest%20Trading%20Pair%20K-Line


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20order%20update%20data
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Order%20update%20push
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Order%20update%20push


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders are made in |
| since | <code>int</code> | No | the earliest time in ms to watch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchOrders ([symbol, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20order%20update%20data
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Order%20update%20push
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Order%20update%20push


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market the trades are made in |
| since | <code>int</code> | No | the earliest time in ms to watch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchMyTrades ([symbol, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bingx</code>](#bingx)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://bingx-api.github.io/docs/#/en-us/spot/socket/account.html#Subscription%20account%20balance%20push
- https://bingx-api.github.io/docs/#/en-us/swapV2/socket/account.html#Account%20balance%20and%20position%20update%20push
- https://bingx-api.github.io/docs/#/en-us/cswap/socket/account.html#Account%20balance%20and%20position%20update%20push


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bingx.watchBalance ([params])
```

