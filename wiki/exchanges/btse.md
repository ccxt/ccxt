
<a name="btse" id="btse"></a>

## btse{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchOHLCV](#fetchohlcv)
* [fetchOrderBook](#fetchorderbook)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchBalance](#fetchbalance)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchOrderTrades](#fetchordertrades)
* [createOrder](#createorder)
* [createSpotOrder](#createspotorder)
* [createContractOrder](#createcontractorder)
* [fetchOpenOrder](#fetchopenorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [fetchOpenOrders](#fetchopenorders)
* [fetchTradingFees](#fetchtradingfees)
* [fetchDepositsWithdrawals](#fetchdepositswithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchLedger](#fetchledger)
* [fetchTradingFee](#fetchtradingfee)
* [fetchPositions](#fetchpositions)
* [fetchPositionsForSymbol](#fetchpositionsforsymbol)
* [fetchPositionMode](#fetchpositionmode)
* [setPositionMode](#setpositionmode)
* [fetchMarginMode](#fetchmarginmode)
* [setMarginMode](#setmarginmode)
* [closePosition](#closeposition)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://btsecom.github.io/docs/spotV3_3/en/#query-server-time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchTime (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for btse

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.btse.com/markets/rest/get-markets/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchMarkets (params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.btse.com/markets/rest/get-klines/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch (default and max 300) |
| params | <code>object</code> | No | extra parameters specific to the bitteam api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
btse.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure) indexed by market symbols

**See**: https://docs.btse.com/markets/rest/get-orderbook/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://docs.btse.com/markets/rest/get-funding-rate-history/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch, used to select the requested period and then applied client-side |
| limit | <code>int</code> | No | the maximum amount of entries to fetch, applied client-side |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.period | <code>string</code> | No | the funding rate history period, one of '7D', '2W' or '1M', selected from since by default |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate to fetch, applied client-side |


```javascript
btse.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://docs.btse.com/wallet/rest/get-user-assets/
- https://btsecom.github.io/docs/futuresV2_3/en/#query-wallet-balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | wallet type, spot or swap, default is spot |
| params.wallet | <code>string</code> | No | futures wallet name, CROSS@ by default, or ISOLATED@ followed by the market id with -USDT appended |


```javascript
btse.fetchBalance (params?)
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, for different trade sizes

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://docs.btse.com/markets/rest/get-market-risk-limits/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchLeverageTiers (symbols, params?)
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, for different trade sizes for a single market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/?id=leverage-tiers-structure)

**See**: https://docs.btse.com/markets/rest/get-market-risk-limits/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchMarketLeverageTiers (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.btse.com/markets/rest/get-24-hr-ticker/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchTickers (symbols, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://docs.btse.com/markets/rest/get-24-hr-ticker/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchTicker (symbol, params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a derivative trading pair

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=interest-history-structure](https://docs.ccxt.com/?id=interest-history-structure)

**See**: https://docs.btse.com/markets/rest/get-24-hr-ticker/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
btse.fetchOpenInterest (symbol, params?)
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [open interest structures](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://docs.btse.com/markets/rest/get-24-hr-ticker/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
btse.fetchOpenInterests (symbols?, params?)
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://docs.btse.com/markets/rest/get-24-hr-ticker/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchFundingRate (symbol, params?)
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the funding rate for multiple markets

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rates structures](https://docs.ccxt.com/?id=funding-rates-structure), indexe by market symbols

**See**: https://docs.btse.com/markets/rest/get-24-hr-ticker/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchFundingRates (symbols, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://docs.btse.com/markets/rest/get-trades/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch, applied client-side to the most recent trades window |
| limit | <code>int</code> | No | the maximum amount of trades to fetch (max 500) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest entry to fetch, applied client-side to the most recent trades window |


```javascript
btse.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://docs.btse.com/spot/rest/get-trade-history/
- https://docs.btse.com/futures/rest/get-trade-history/


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms for the ending date filter, default is undefined |
| params.type | <code>string</code> | No | 'spot' or 'swap' or 'future', default is 'spot' |


```javascript
btse.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://btsecom.github.io/docs/spotV3_3/en/#query-user-trades-fills
- https://btsecom.github.io/docs/futuresV2_3/en/#query-trades-fills-2


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, could be used instead of the order id |
| params.type | <code>string</code> | No | 'spot' or 'swap' or 'future', default is 'spot' |


```javascript
btse.fetchOrderTrades (id, symbol?, since?, limit?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://btsecom.github.io/docs/spotV3_3/en/#create-new-order
- https://btsecom.github.io/docs/futuresV2_3/en/#create-new-order
- https://btsecom.github.io/docs/futuresV2_3/en/#create-new-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately (default is false) |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', 'PO', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH' |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at (same as takeProfitPrice) |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at |
| params.triggerPriceType | <code>string</code> | No | 'INDEX_PRICE' or 'LAST_PRICE', default is 'LAST_PRICE' |
| params.trailingAmount | <code>float</code> | No | the quote amount to trail away from the current market price |
| params.deviation | <code>float</code> | No | *PEG orders only* How much should the order price deviate from index price. Value is in percentage and can range from -10 to 10 |
| params.stealth | <code>float</code> | No | *PEG orders only*  How many percent of the order is to be displayed on the orderbook |
| params.stopPrice | <code>float</code> | No | *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* Mandatory when creating an OCO order. Indicates the stop price |
| params.hedged | <code>bool</code> | No | *contract markets only* true for hedged mode, false for one way mode, default is false |
| params.marginMode | <code>string</code> | No | *contract markets only* 'cross' or 'isolated' (default is 'cross') - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode |
| params.positionMode | <code>string</code> | No | *contract markets only* 'ONE_WAY (default) or 'HEDGE or 'ISOLATED' (if not provided, it will be derived from marginMode and hedged params) |
| params.takeProfit | <code>object</code> | No | *contract markets only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *contract markets only* take profit trigger price |
| params.takeProfit.priceType | <code>string</code> | No | *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice' |
| params.stopLoss | <code>object</code> | No | *contract markets only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *contract markets only* stop loss trigger price |
| params.stopLoss.priceType | <code>string</code> | No | *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice' |


```javascript
btse.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createSpotOrder" id="createspotorder"></a>

### createSpotOrder{docsify-ignore}
create a trade order on spot market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/spot/rest/place-order
- https://docs.btse.com/spot/rest/place-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit', 'OCO', 'PEG', 'TWAP' or 'TRAILING' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately, default is false |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC' or 'FOK' |
| params.cost | <code>float</code> | No | *market buy and trailing buy orders only* the quote quantity that can be used as an alternative for the amount |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at, same as takeProfitPrice |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at |
| params.triggerPriceType | <code>string</code> | No | 'last', 'mark' or 'index', default is 'last' |
| params.trailingAmount | <code>float</code> | No | the quote amount to trail away from the current market price |
| params.trailingPercent | <code>float</code> | No | the percent to trail away from the current market price |
| params.deviation | <code>float</code> | No | *PEG orders only* how much should the order price deviate from the pegged price, in percent from -10 to 10 |
| params.stealth | <code>float</code> | No | *PEG orders only* how many percent of the order is to be displayed on the orderbook, from 1 to 100 |
| params.stopPrice | <code>float</code> | No | *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* the limit price of the stop loss leg |


```javascript
btse.createSpotOrder (symbol, type, side, amount, price?, params?)
```


<a name="createContractOrder" id="createcontractorder"></a>

### createContractOrder{docsify-ignore}
create a trade order on contract market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/futures/rest/place-order
- https://docs.btse.com/futures/rest/place-algo-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit', 'OCO', 'PEG', 'TWAP' or 'TRAILING' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately, default is false |
| params.reduceOnly | <code>bool</code> | No | if true, the order will only reduce a current position, not increase it, default is false |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK', 'PO', 'HALFSEC', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH' |
| params.hedged | <code>bool</code> | No | true for hedged mode, false for one way mode, default is false |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', default is 'cross' - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode |
| params.positionMode | <code>string</code> | No | 'ONE_WAY', 'HEDGE' or 'ISOLATED' - if not provided, it will be derived from the marginMode and hedged params |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at, same as takeProfitPrice |
| params.stopLossPrice | <code>float</code> | No | the price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | the price that a take profit order is triggered at |
| params.triggerPriceType | <code>string</code> | No | 'last', 'mark' or 'index', default is 'mark' |
| params.trailingAmount | <code>float</code> | No | the quote amount to trail away from the current market price |
| params.trailingPercent | <code>float</code> | No | the percent to trail away from the current market price |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.takeProfit.priceType | <code>string</code> | No | 'last', 'mark' or 'index', default is 'mark' |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.stopLoss.priceType | <code>string</code> | No | 'last', 'mark' or 'index', default is 'mark' |
| params.deviation | <code>float</code> | No | *PEG orders only* the offset applied to the pegged reference price |
| params.stealth | <code>float</code> | No | *PEG orders only* the portion of the order size displayed on the book |
| params.stopPrice | <code>float</code> | No | *NB - It is NOT the stopLossPrice!!! OCO orders only* the limit price of the stop loss leg |


```javascript
btse.createContractOrder (symbol, type, side, amount, price?, params?)
```


<a name="fetchOpenOrder" id="fetchopenorder"></a>

### fetchOpenOrder{docsify-ignore}
fetches information on an open order made by the user

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/spot/rest/get-order
- https://docs.btse.com/futures/rest/get-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.type | <code>string</code> | No | 'spot', 'swap' or 'future', default is 'spot' |
| params.includeCancelled | <code>bool</code> | No | *contract markets only* if true, cancelled orders are included in the lookup |


```javascript
btse.fetchOpenOrder (id, symbol?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/spot/rest/amend-order
- https://docs.btse.com/futures/rest/amend-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' (not used by btse) |
| side | <code>string</code> | Yes | 'buy' or 'sell' (not used by btse) |
| amount | <code>float</code> | No | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order, required if id is not provided |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at |
| params.totalAmountMode | <code>bool</code> | No | if true, the amount is treated as the new total order quantity including the already filled portion, default is false |
| params.slide | <code>bool</code> | No | *contract markets only* if true and only the price is amended, the price slides to the best available price |


```javascript
btse.editOrder (id, symbol, type, side, amount?, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/spot/rest/cancel-order
- https://docs.btse.com/futures/rest/cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | a unique id for the order, required if id is not provided |


```javascript
btse.cancelOrder (id, symbol, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders in a market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/spot/rest/cancel-all-orders
- https://btsecom.github.io/docs/futuresV2_3/en/#cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market to cancel orders in, on spot markets omit it to cancel every open order across all pairs |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot', 'swap' or 'future', default is 'spot', used when the symbol is omitted |


```javascript
btse.cancelAllOrders (symbol?, params?)
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - the api result

**See**

- https://docs.btse.com/spot/rest/cancel-all-after
- https://docs.btse.com/futures/rest/cancel-all-after


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot', 'swap' or 'future', default is 'spot' |


```javascript
btse.cancelAllOrdersAfter (timeout, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://docs.btse.com/spot/rest/get-orders
- https://docs.btse.com/futures/rest/get-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for, filtered client-side |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve, filtered client-side |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot', 'swap' or 'future', default is 'spot' |


```javascript
btse.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/?id=fee-structure) indexed by market symbols

**See**

- https://docs.btse.com/spot/rest/get-fees
- https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot', 'swap' or 'future' (default is 'spot') |


```javascript
btse.fetchTradingFees (params?)
```


<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

### fetchDepositsWithdrawals{docsify-ignore}
fetch history of deposits and withdrawals

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.btse.com/wallet/rest/get-user-wallet-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, required for the default spot wallet |
| since | <code>int</code> | No | the earliest time in ms to fetch transactions for |
| limit | <code>int</code> | No | the maximum number of transaction structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transactions for, excluded |
| params.walletType | <code>string</code> | No | wallet to query, SPOT by default, ISOLATED requires params.walletName |


```javascript
btse.fetchDepositsWithdrawals (code?, since?, limit?, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.btse.com/wallet/rest/get-user-wallet-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, required for the default spot wallet |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of transaction structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch deposits for, excluded |
| params.walletType | <code>string</code> | No | wallet to query, SPOT by default, ISOLATED requires params.walletName |


```javascript
btse.fetchDeposits (code?, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.btse.com/wallet/rest/get-user-wallet-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, required for the default spot wallet |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of transaction structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch withdrawals for, excluded |
| params.walletType | <code>string</code> | No | wallet to query, SPOT by default, ISOLATED requires params.walletName |


```javascript
btse.fetchWithdrawals (code?, since?, limit?, params?)
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [ledger structures](https://docs.ccxt.com/#/?id=ledger)

**See**: https://docs.btse.com/wallet/rest/get-user-wallet-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch ledger entries for |
| limit | <code>int</code> | No | the maximum number of ledger entry structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch ledger entries for, excluded |
| params.walletType | <code>string</code> | No | wallet to query, SPOT by default, ISOLATED requires params.walletName |


```javascript
btse.fetchLedger (code?, since?, limit?, params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**

- https://docs.btse.com/spot/rest/get-fees
- https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchTradingFee (symbol, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.btse.com/futures/rest/get-positions/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchPositions (symbols?, params?)
```


<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

### fetchPositionsForSymbol{docsify-ignore}
fetch all open positions for specific symbol

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://docs.btse.com/futures/rest/get-positions/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchPositionsForSymbol (symbol, params?)
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way, hedged for btse is set identically for all linear markets or all inverse markets

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://docs.btse.com/futures/rest/get-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch entry for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchPositionMode (symbol, params?)
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
NB!!! This method also sets margin mode to cross on btse. Set hedged to true or false for a cross-margin market.

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.btse.com/futures/rest/change-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | unified symbol of the market to set position mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.setPositionMode (hedged, symbol, params?)
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a specific symbol

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)

**See**: https://docs.btse.com/futures/rest/get-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchMarginMode (symbol, params?)
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.btse.com/futures/rest/change-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hedged | <code>bool</code> | No | set to true to use dualSidePosition, required for setting marginMode to cross on btse |


```javascript
btse.setMarginMode (marginMode, symbol, params?)
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position for a market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://docs.btse.com/futures/rest/close-position/  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| side | <code>string</code> | No | not used by btse |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionId | <code>string</code> | No | the id of the position to close, mandatory |
| params.type | <code>string</code> | No | 'limit' or 'market' (default is 'market') |
| params.price | <code>float</code> | No | required if params.type is 'limit' |
| params.postOnly | <code>bool</code> | No | true if the order should be post only |


```javascript
btse.closePosition (symbol, side?, params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the leverage for a market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://docs.btse.com/futures/rest/get-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
btse.fetchLeverage (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>btse</code>](#btse)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://docs.btse.com/futures/rest/change-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionMode | <code>string</code> | No | ONE_WAY or HEDGE, defaults to ONE_WAY on the exchange side when omitted |
| params.positionDirection | <code>string</code> | No | LONG or SHORT, identifies the side to update in hedge mode |
| params.positionId | <code>string</code> | No | existing position id to update, disambiguates the target position in hedge mode |


```javascript
btse.setLeverage (leverage, symbol, params?)
```

