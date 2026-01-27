
<a name="bybit" id="bybit"></a>

## bybit{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [enableDemoTrading](#enabledemotrading)
* [isUnifiedEnabled](#isunifiedenabled)
* [upgradeUnifiedTradeAccount](#upgradeunifiedtradeaccount)
* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchBidsAsks](#fetchbidsasks)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchTrades](#fetchtrades)
* [fetchOrderBook](#fetchorderbook)
* [fetchBalance](#fetchbalance)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarkeSellOrderWithCost](#createmarkesellorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [editOrders](#editorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [cancelOrdersForSymbols](#cancelordersforsymbols)
* [cancelAllOrders](#cancelallorders)
* [fetchOrderClassic](#fetchorderclassic)
* [fetchOrder](#fetchorder)
* [fetchOrders](#fetchorders)
* [fetchOrdersClassic](#fetchordersclassic)
* [fetchClosedOrder](#fetchclosedorder)
* [fetchOpenOrder](#fetchopenorder)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchLedger](#fetchledger)
* [withdraw](#withdraw)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchLeverage](#fetchleverage)
* [setMarginMode](#setmarginmode)
* [setLeverage](#setleverage)
* [setPositionMode](#setpositionmode)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchOpenInterestHistory](#fetchopeninteresthistory)
* [fetchCrossBorrowRate](#fetchcrossborrowrate)
* [fetchBorrowInterest](#fetchborrowinterest)
* [fetchBorrowRateHistory](#fetchborrowratehistory)
* [transfer](#transfer)
* [fetchTransfers](#fetchtransfers)
* [borrowCrossMargin](#borrowcrossmargin)
* [repayCrossMargin](#repaycrossmargin)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchSettlementHistory](#fetchsettlementhistory)
* [fetchMySettlementHistory](#fetchmysettlementhistory)
* [fetchVolatilityHistory](#fetchvolatilityhistory)
* [fetchGreeks](#fetchgreeks)
* [fetchAllGreeks](#fetchallgreeks)
* [fetchMyLiquidations](#fetchmyliquidations)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchOption](#fetchoption)
* [fetchOptionChain](#fetchoptionchain)
* [fetchPositionsHistory](#fetchpositionshistory)
* [fetchConvertCurrencies](#fetchconvertcurrencies)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchConvertTrade](#fetchconverttrade)
* [fetchConvertTradeHistory](#fetchconverttradehistory)
* [fetchLongShortRatioHistory](#fetchlongshortratiohistory)
* [fetchMarginMode](#fetchmarginmode)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrderWs](#cancelorderws)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [unWatchTicker](#unwatchticker)
* [watchBidsAsks](#watchbidsasks)
* [watchOHLCV](#watchohlcv)
* [watchOHLCVForSymbols](#watchohlcvforsymbols)
* [unWatchOHLCVForSymbols](#unwatchohlcvforsymbols)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrderBook](#watchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [unWatchOrderBookForSymbols](#unwatchorderbookforsymbols)
* [unWatchOrderBook](#unwatchorderbook)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTradesForSymbols](#unwatchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [watchMyTrades](#watchmytrades)
* [unWatchMyTrades](#unwatchmytrades)
* [watchPositions](#watchpositions)
* [unWatchPositions](#unwatchpositions)
* [watchLiquidations](#watchliquidations)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)
* [watchBalance](#watchbalance)

<a name="enableDemoTrading" id="enabledemotrading"></a>

### enableDemoTrading{docsify-ignore}
enables or disables demo trading mode

**Kind**: instance method of [<code>bybit</code>](#bybit)  

**See**: https://bybit-exchange.github.io/docs/v5/demo  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| enable | <code>boolean</code> | No | true if demo trading should be enabled, false otherwise |


```javascript
bybit.enableDemoTrading ([enable])
```


<a name="isUnifiedEnabled" id="isunifiedenabled"></a>

### isUnifiedEnabled{docsify-ignore}
returns [enableUnifiedMargin, enableUnifiedAccount] so the user can check if unified account is enabled

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>any</code> - [enableUnifiedMargin, enableUnifiedAccount]

**See**

- https://bybit-exchange.github.io/docs/v5/user/apikey-info#http-request
- https://bybit-exchange.github.io/docs/v5/account/account-info


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.isUnifiedEnabled ([params])
```


<a name="upgradeUnifiedTradeAccount" id="upgradeunifiedtradeaccount"></a>

### upgradeUnifiedTradeAccount{docsify-ignore}
upgrades the account to unified trade account *warning* this is irreversible

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>any</code> - nothing

**See**: https://bybit-exchange.github.io/docs/v5/account/upgrade-unified-account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.upgradeUnifiedTradeAccount ([params])
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://bybit-exchange.github.io/docs/v5/market/time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchTime ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://bybit-exchange.github.io/docs/v5/asset/coin-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchCurrencies ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bybit

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://bybit-exchange.github.io/docs/v5/market/instrument  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchMarkets ([params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchTicker (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an array of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | *contract only* 'linear', 'inverse' |
| params.baseCoin | <code>string</code> | No | *option only* base coin, default is 'BTC' |


```javascript
bybit.fetchTickers (symbols[, params])
```


<a name="fetchBidsAsks" id="fetchbidsasks"></a>

### fetchBidsAsks{docsify-ignore}
fetches the bid and ask price and volume for multiple markets

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | *contract only* 'linear', 'inverse' |
| params.baseCoin | <code>string</code> | No | *option only* base coin, default is 'BTC' |


```javascript
bybit.fetchBidsAsks (symbols[, params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bybit-exchange.github.io/docs/v5/market/kline
- https://bybit-exchange.github.io/docs/v5/market/mark-kline
- https://bybit-exchange.github.io/docs/v5/market/index-kline
- https://bybit-exchange.github.io/docs/v5/market/preimum-index-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetches funding rates for multiple markets

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchFundingRates (symbols[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/history-fund-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://bybit-exchange.github.io/docs/v5/market/recent-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |


```javascript
bybit.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/market/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/spot-margin-normal/account-info
- https://bybit-exchange.github.io/docs/v5/asset/all-balance
- https://bybit-exchange.github.io/docs/v5/account/wallet-balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | wallet type, ['spot', 'swap', 'funding'] |


```javascript
bybit.fetchBalance ([params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createMarkeSellOrderWithCost" id="createmarkesellorderwithcost"></a>

### createMarkeSellOrderWithCost{docsify-ignore}
create a market sell order by providing the symbol and cost

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/create-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.createMarkeSellOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/order/create-order
- https://bybit-exchange.github.io/docs/v5/position/trading-stop


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK" |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.positionIdx | <code>string</code> | No | *contracts only* 0 for one-way mode, 1 buy side of hedged mode, 2 sell side of hedged mode |
| params.hedged | <code>bool</code> | No | *contracts only* true for hedged mode, false for one way mode, default is false |
| params.isLeverage | <code>int</code> | No | *unified spot only* false then spot trading true then margin trading |
| params.tpslMode | <code>string</code> | No | *contract only* 'Full' or 'Partial' |
| params.mmp | <code>string</code> | No | *option only* market maker protection |
| params.triggerDirection | <code>string</code> | No | *contract only* the direction for trigger orders, 'ascending' or 'descending' |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.stopLossLimitPrice | <code>float</code> | No | The limit price for a stoploss order (only when used in OCO with takeProfitPrice) |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.takeProfitLimitPrice | <code>float</code> | No | The limit price for a takeprofit order (only when used in OCO combination with stopLossPrice) |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.trailingAmount | <code>string</code> | No | the quote amount to trail away from the current market price |
| params.trailingTriggerPrice | <code>string</code> | No | the price to trigger a trailing order, default uses the price argument |
| params.tradingStopEndpoint | <code>boolean</code> | No | whether to enforce using the tradingStop (https://bybit-exchange.github.io/docs/v5/position/trading-stop) endpoint, makes difference when submitting single tp/sl order |


```javascript
bybit.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/batch-place  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/order/amend-order
- https://bybit-exchange.github.io/docs/derivatives/unified/replace-order
- https://bybit-exchange.github.io/docs/api-explorer/derivatives/trade/contract/replace-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | unique client order id |
| params.triggerPrice | <code>float</code> | No | The price that a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | The price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price that a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.triggerBy | <code>string</code> | No | 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice |
| params.slTriggerBy | <code>string</code> | No | 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss |
| params.tpTriggerby | <code>string</code> | No | 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit |


```javascript
bybit.editOrder (id, symbol, type, side, amount, price[, params])
```


<a name="editOrders" id="editorders"></a>

### editOrders{docsify-ignore}
edit a list of trade orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/batch-amend  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.editOrders (orders[, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | *spot only* whether the order is a trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.orderFilter | <code>string</code> | No | *spot only* 'Order' or 'StopOrder' or 'tpslOrder' |


```javascript
bybit.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/batch-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids |


```javascript
bybit.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - the api result

**See**: https://bybit-exchange.github.io/docs/v5/order/dcp  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.product | <code>string</code> | No | OPTIONS, DERIVATIVES, SPOT, default is 'DERIVATIVES' |


```javascript
bybit.cancelAllOrdersAfter (timeout[, params])
```


<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

### cancelOrdersForSymbols{docsify-ignore}
cancel multiple orders for multiple symbols

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/batch-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.cancelOrdersForSymbols (orders[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/cancel-all  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true if trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.baseCoin | <code>string</code> | No | Base coin. Supports linear, inverse & option |
| params.settleCoin | <code>string</code> | No | Settle coin. Supports linear, inverse & option |


```javascript
bybit.cancelAllOrders (symbol[, params])
```


<a name="fetchOrderClassic" id="fetchorderclassic"></a>

### fetchOrderClassic{docsify-ignore}
fetches information on an order made by the user *classic accounts only*

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchOrderClassic (id, symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
*classic accounts only/ spot not supported*  fetches information on an order made by the user *classic accounts only*

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.acknowledged | <code>object</code> | No | to suppress the warning, set to true |


```javascript
bybit.fetchOrder (id, symbol[, params])
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
*classic accounts only/ spot not supported* fetches information on multiple orders made by the user *classic accounts only/ spot not supported*

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true if trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchOrders (symbol[, since, limit, params])
```


<a name="fetchOrdersClassic" id="fetchordersclassic"></a>

### fetchOrdersClassic{docsify-ignore}
fetches information on multiple orders made by the user *classic accounts only*

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true if trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchOrdersClassic (symbol[, since, limit, params])
```


<a name="fetchClosedOrder" id="fetchclosedorder"></a>

### fetchClosedOrder{docsify-ignore}
fetches information on a closed order made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching a closed trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |


```javascript
bybit.fetchClosedOrder (id[, symbol, params])
```


<a name="fetchOpenOrder" id="fetchopenorder"></a>

### fetchOpenOrder{docsify-ignore}
fetches information on an open order made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/open-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching an open trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.baseCoin | <code>string</code> | No | Base coin. Supports linear, inverse & option |
| params.settleCoin | <code>string</code> | No | Settle coin. Supports linear, inverse & option |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |


```javascript
bybit.fetchOpenOrder (id[, symbol, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchCanceledAndClosedOrders ([symbol, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching closed trigger orders |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchClosedOrders ([symbol, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/order-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | true if trigger order |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchCanceledOrders ([symbol, since, limit, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/order/open-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching open trigger orders |
| params.stop | <code>boolean</code> | No | alias for trigger |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.baseCoin | <code>string</code> | No | Base coin. Supports linear, inverse & option |
| params.settleCoin | <code>string</code> | No | Settle coin. Supports linear, inverse & option |
| params.orderFilter | <code>string</code> | No | 'Order' or 'StopOrder' or 'tpslOrder' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://bybit-exchange.github.io/docs/v5/position/execution  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch a dictionary of addresses for a currency, indexed by network

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/?id=address-structure) indexed by the network

**See**: https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/master-deposit-addr  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchDepositAddress (code[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/deposit-record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for, default = 30 days before the current time |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve, default = 50, max = 50 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch deposits for, default = 30 days after since EXCHANGE SPECIFIC PARAMETERS |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.cursor | <code>string</code> | No | used for pagination |


```javascript
bybit.fetchDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/withdraw-record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/account/transaction-log
- https://bybit-exchange.github.io/docs/v5/account/contract-transaction-log


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.subType | <code>string</code> | No | if inverse will use v5/account/contract-transaction-log |


```javascript
bybit.fetchLedger ([code, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/withdraw  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountType | <code>string</code> | No | 'UTA', 'FUND', 'FUND,UTA', and 'SPOT (for classic accounts only) |


```javascript
bybit.withdraw (code, amount, address, tag[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://bybit-exchange.github.io/docs/v5/position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://bybit-exchange.github.io/docs/v5/position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.baseCoin | <code>string</code> | No | Base coin. Supports linear, inverse & option |
| params.settleCoin | <code>string</code> | No | Settle coin. Supports linear, inverse & option |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times |


```javascript
bybit.fetchPositions (symbols[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://bybit-exchange.github.io/docs/v5/position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchLeverage (symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode (account) or trade mode (symbol)

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://bybit-exchange.github.io/docs/v5/account/set-margin-mode
- https://bybit-exchange.github.io/docs/v5/position/cross-isolate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | account mode must be either [isolated, cross, portfolio], trade mode must be either [isolated, cross] |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>string</code> | No | the rate of leverage, is required if setting trade mode (symbol) |


```javascript
bybit.setMarginMode (marginMode, symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://bybit-exchange.github.io/docs/v5/position/leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.buyLeverage | <code>string</code> | No | leverage for buy side |
| params.sellLeverage | <code>string</code> | No | leverage for sell side |


```javascript
bybit.setLeverage (leverage, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://bybit-exchange.github.io/docs/v5/position/position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes |  |
| symbol | <code>string</code> | Yes | used for unified account with inverse market |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.setPositionMode (hedged, symbol[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
Retrieves the open interest of a derivative trading pair

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/open-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |
| params.interval | <code>string</code> | No | 5m, 15m, 30m, 1h, 4h, 1d |
| params.category | <code>string</code> | No | "linear" or "inverse" |


```javascript
bybit.fetchOpenInterest (symbol[, params])
```


<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

### fetchOpenInterestHistory{docsify-ignore}
Gets the total amount of unsettled contracts. In other words, the total number of contracts held in open positions

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: An array of open interest structures

**See**: https://bybit-exchange.github.io/docs/v5/market/open-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified market symbol |
| timeframe | <code>string</code> | Yes | "5m", 15m, 30m, 1h, 4h, 1d |
| since | <code>int</code> | No | Not used by Bybit |
| limit | <code>int</code> | No | The number of open interest structures to return. Max 200, default 50 |
| params | <code>object</code> | No | Exchange specific parameters |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchOpenInterestHistory (symbol, timeframe[, since, limit, params])
```


<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

### fetchCrossBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/?id=borrow-rate-structure)

**See**: https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/interest-quota  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchCrossBorrowRate (code[, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/?id=borrow-interest-structure)

**See**: https://bybit-exchange.github.io/docs/zh-TW/v5/spot-margin-normal/account-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| symbol | <code>string</code> | Yes | unified market symbol when fetch interest in isolated markets |
| since | <code>number</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>number</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchBorrowInterest (code, symbol[, since, limit, params])
```


<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

### fetchBorrowRateHistory{docsify-ignore}
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure)

**See**: https://bybit-exchange.github.io/docs/v5/spot-margin-uta/historical-interest  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure) to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
bybit.fetchBorrowRateHistory (code[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/create-inter-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.transferId | <code>string</code> | No | UUID, which is unique across the platform |


```javascript
bybit.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/inter-transfer-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchTransfers (code[, since, limit, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)

**See**: https://bybit-exchange.github.io/docs/v5/account/borrow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.borrowCrossMargin (code, amount[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)

**See**: https://bybit-exchange.github.io/docs/v5/account/no-convert-repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.repayCrossMargin (code, amount[, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/?id=leverage-tiers-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/risk-limit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchMarketLeverageTiers (symbol[, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**: https://bybit-exchange.github.io/docs/v5/account/fee-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/?id=fee-structure) indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/account/fee-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |


```javascript
bybit.fetchTradingFees ([params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/?id=fee-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/coin-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

### fetchSettlementHistory{docsify-ignore}
fetches historical settlement records

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects]

**See**: https://bybit-exchange.github.io/docs/v5/market/delivery-price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |


```javascript
bybit.fetchSettlementHistory (symbol[, since, limit, params])
```


<a name="fetchMySettlementHistory" id="fetchmysettlementhistory"></a>

### fetchMySettlementHistory{docsify-ignore}
fetches historical settlement records of the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects]

**See**: https://bybit-exchange.github.io/docs/v5/asset/delivery  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |


```javascript
bybit.fetchMySettlementHistory (symbol[, since, limit, params])
```


<a name="fetchVolatilityHistory" id="fetchvolatilityhistory"></a>

### fetchVolatilityHistory{docsify-ignore}
fetch the historical volatility of an option market based on an underlying asset

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [volatility history objects](https://docs.ccxt.com/?id=volatility-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/iv  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.period | <code>int</code> | No | the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270 |


```javascript
bybit.fetchVolatilityHistory (code[, params])
```


<a name="fetchGreeks" id="fetchgreeks"></a>

### fetchGreeks{docsify-ignore}
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/?id=greeks-structure)

**See**: https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchGreeks (symbol[, params])
```


<a name="fetchAllGreeks" id="fetchallgreeks"></a>

### fetchAllGreeks{docsify-ignore}
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/?id=greeks-structure)

**See**: https://bybit-exchange.github.io/docs/api-explorer/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch greeks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.baseCoin | <code>string</code> | No | the baseCoin of the symbol, default is BTC |


```javascript
bybit.fetchAllGreeks ([symbols, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)

**See**: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the exchange API endpoint |
| params.type | <code>string</code> | No | market type, ['swap', 'option', 'spot'] |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'] |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchMyLiquidations ([symbol, since, limit, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, for different trade sizes

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/market/risk-limit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | market subType, ['linear', 'inverse'], default is 'linear' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchLeverageTiers ([symbols, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bybit.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="fetchOption" id="fetchoption"></a>

### fetchOption{docsify-ignore}
fetches option data that is commonly found in an option chain

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [option chain structure](https://docs.ccxt.com/?id=option-chain-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchOption (symbol[, params])
```


<a name="fetchOptionChain" id="fetchoptionchain"></a>

### fetchOptionChain{docsify-ignore}
fetches data for an underlying asset that is commonly found in an option chain

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a list of [option chain structures](https://docs.ccxt.com/?id=option-chain-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/tickers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | base currency to fetch an option chain for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchOptionChain (code[, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://bybit-exchange.github.io/docs/v5/position/close-pnl  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | a list of unified market symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch, params["until"] - since <= 7 days |
| limit | <code>int</code> | No | the maximum amount of records to fetch, default=50, max=100 |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest position to fetch, params["until"] - since <= 7 days |
| params.subType | <code>string</code> | No | 'linear' or 'inverse' |


```javascript
bybit.fetchPositionsHistory (symbols[, since, limit, params])
```


<a name="fetchConvertCurrencies" id="fetchconvertcurrencies"></a>

### fetchConvertCurrencies{docsify-ignore}
fetches all available currencies that can be converted

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://bybit-exchange.github.io/docs/v5/asset/convert/convert-coin-list  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountType | <code>string</code> | No | eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract |


```javascript
bybit.fetchConvertCurrencies ([params])
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetch a quote for converting from one currency to another

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/?id=conversion-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/convert/apply-quote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountType | <code>string</code> | No | eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract |


```javascript
bybit.fetchConvertQuote (fromCode, toCode[, amount, params])
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
convert from one currency to another

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/?id=conversion-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/convert/confirm-quote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | Yes | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.createConvertTrade (id, fromCode, toCode, amount[, params])
```


<a name="fetchConvertTrade" id="fetchconverttrade"></a>

### fetchConvertTrade{docsify-ignore}
fetch the data for a conversion trade

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/?id=conversion-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-result  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to fetch |
| code | <code>string</code> | No | the unified currency code of the conversion trade |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountType | <code>string</code> | No | eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract |


```javascript
bybit.fetchConvertTrade (id[, code, params])
```


<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

### fetchConvertTradeHistory{docsify-ignore}
fetch the users history of conversion trades

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/?id=conversion-structure)

**See**: https://bybit-exchange.github.io/docs/v5/asset/convert/get-convert-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountType | <code>string</code> | No | eb_convert_uta, eb_convert_spot, eb_convert_funding, eb_convert_inverse, or eb_convert_contract |


```javascript
bybit.fetchConvertTradeHistory ([code, since, limit, params])
```


<a name="fetchLongShortRatioHistory" id="fetchlongshortratiohistory"></a>

### fetchLongShortRatioHistory{docsify-ignore}
fetches the long short ratio history for a unified market symbol

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [long short ratio structures](https://docs.ccxt.com/?id=long-short-ratio-structure)

**See**: https://bybit-exchange.github.io/docs/v5/market/long-short-ratio  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the long short ratio for |
| timeframe | <code>string</code> | No | the period for the ratio, default is 24 hours |
| since | <code>int</code> | No | the earliest time in ms to fetch ratios for |
| limit | <code>int</code> | No | the maximum number of long short ratio structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchLongShortRatioHistory (symbol[, timeframe, since, limit, params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of the trading pair

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)

**See**: https://bybit-exchange.github.io/docs/v5/account/account-info  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.fetchMarginMode ([symbol, params])
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/order/create-order
- https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK" |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.positionIdx | <code>string</code> | No | *contracts only*  0 for one-way mode, 1 buy side  of hedged mode, 2 sell side of hedged mode |
| params.isLeverage | <code>boolean</code> | No | *unified spot only* false then spot trading true then margin trading |
| params.tpslMode | <code>string</code> | No | *contract only* 'full' or 'partial' |
| params.mmp | <code>string</code> | No | *option only* market maker protection |
| params.triggerDirection | <code>string</code> | No | *contract only* the direction for trigger orders, 'above' or 'below' |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.trailingAmount | <code>string</code> | No | the quote amount to trail away from the current market price |
| params.trailingTriggerPrice | <code>string</code> | No | the price to trigger a trailing order, default uses the price argument |


```javascript
bybit.createOrderWs (symbol, type, side, amount[, price, params])
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/order/amend-order
- https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | The price that a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | The price that a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price that a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |
| params.triggerBy | <code>string</code> | No | 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice |
| params.slTriggerBy | <code>string</code> | No | 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss |
| params.tpTriggerby | <code>string</code> | No | 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit |


```javascript
bybit.editOrderWs (id, symbol, type, side, amount, price[, params])
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/order/cancel-order
- https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | *spot only* whether the order is a trigger order |
| params.orderFilter | <code>string</code> | No | *spot only* 'Order' or 'StopOrder' or 'tpslOrder' |


```javascript
bybit.cancelOrderWs (id, symbol[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchTickers (symbols[, params])
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchTickers (symbols[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches a price ticker

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchTicker (symbol[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchBidsAsks (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/kline
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

### watchOHLCVForSymbols{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/kline
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchOHLCVForSymbols (symbolsAndTimeframes[, since, limit, params])
```


<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

### unWatchOHLCVForSymbols{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/kline
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchOHLCVForSymbols (symbolsAndTimeframes[, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/public/kline
- https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchOHLCV (symbol, timeframe[, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchOrderBook (symbol[, limit, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |


```javascript
bybit.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |


```javascript
bybit.unWatchOrderBook (symbol[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

### unWatchTradesForSymbols{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchTradesForSymbols (symbols[, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchTrades (symbol[, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/private/execution
- https://bybit-exchange.github.io/docs/v5/websocket/private/fast-execution


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |
| params.executionFast | <code>boolean</code> | No | use fast execution |


```javascript
bybit.watchMyTrades (symbol[, since, limit, params])
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unWatches information on multiple trades made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://bybit-exchange.github.io/docs/v5/websocket/private/execution
- https://bybit-exchange.github.io/docs/v5/websocket/private/fast-execution


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |
| params.executionFast | <code>boolean</code> | No | use fast execution |


```javascript
bybit.unWatchMyTrades (symbol[, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/private/position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchPositions ([symbols, since, limit, params])
```


<a name="unWatchPositions" id="unwatchpositions"></a>

### unWatchPositions{docsify-ignore}
unWatches all open positions

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - status of the unwatch request

**See**: https://bybit-exchange.github.io/docs/v5/websocket/private/position  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.unWatchPositions ([symbols, params])
```


<a name="watchLiquidations" id="watchliquidations"></a>

### watchLiquidations{docsify-ignore}
watch the public liquidations of a trading pair

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/public/liquidation  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmex api endpoint |
| params.method | <code>string</code> | No | exchange specific method, supported: liquidation, allLiquidation |


```javascript
bybit.watchLiquidations (symbol[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/private/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchOrders (symbol[, since, limit, params])
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/private/order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |


```javascript
bybit.unWatchOrders (symbol[, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bybit</code>](#bybit)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://bybit-exchange.github.io/docs/v5/websocket/private/wallet  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bybit.watchBalance ([params])
```

