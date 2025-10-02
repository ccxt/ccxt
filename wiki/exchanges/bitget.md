
<a name="bitget" id="bitget"></a>

## bitget{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchDeposits](#fetchdeposits)
* [withdraw](#withdraw)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchMarkPrice](#fetchmarkprice)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchLedger](#fetchledger)
* [fetchMyTrades](#fetchmytrades)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingHistory](#fetchfundinghistory)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [setMarginMode](#setmarginmode)
* [setPositionMode](#setpositionmode)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchTransfers](#fetchtransfers)
* [transfer](#transfer)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [borrowCrossMargin](#borrowcrossmargin)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [repayCrossMargin](#repaycrossmargin)
* [fetchMyLiquidations](#fetchmyliquidations)
* [fetchIsolatedBorrowRate](#fetchisolatedborrowrate)
* [fetchCrossBorrowRate](#fetchcrossborrowrate)
* [fetchBorrowInterest](#fetchborrowinterest)
* [closePosition](#closeposition)
* [closeAllPositions](#closeallpositions)
* [fetchMarginMode](#fetchmarginmode)
* [fetchPositionsHistory](#fetchpositionshistory)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchConvertTradeHistory](#fetchconverttradehistory)
* [fetchConvertCurrencies](#fetchconvertcurrencies)
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchLongShortRatioHistory](#fetchlongshortratiohistory)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://www.bitget.com/api-doc/common/public/Get-Server-Time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchTime ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bitget

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Symbols
- https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
- https://www.bitget.com/api-doc/margin/common/support-currencies
- https://www.bitget.com/api-doc/uta/public/Instruments


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.bitget.com/api-doc/spot/market/Get-Coin-List  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchCurrencies ([params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/Get-Query-Position-Lever
- https://www.bitget.com/api-doc/margin/cross/account/Cross-Tier-Data
- https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Tier-Data
- https://www.bitget.com/api-doc/uta/public/Get-Position-Tier-Data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | for spot margin 'cross' or 'isolated', default is 'isolated' |
| params.code | <code>string</code> | No | required for cross spot margin |
| params.productType | <code>string</code> | No | *contract and uta only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchMarketLeverageTiers (symbol[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in milliseconds |
| params.idLessThan | <code>string</code> | No | return records with id less than the provided value |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchDeposits (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Wallet-Withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.chain | <code>string</code> | No | the blockchain network the withdrawal is taking place on |


```javascript
bitget.withdraw (code, amount, address, tag[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Withdraw-Record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in milliseconds |
| params.idLessThan | <code>string</code> | No | return records with id less than the provided value |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchDepositAddress (code[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Orderbook
- https://www.bitget.com/api-doc/contract/market/Get-Merge-Depth
- https://www.bitget.com/api-doc/uta/public/OrderBook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Tickers
- https://www.bitget.com/api-doc/contract/market/Get-Ticker
- https://www.bitget.com/api-doc/uta/public/Tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchTicker (symbol[, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches the mark price for a specific market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchMarkPrice (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Tickers
- https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
- https://www.bitget.com/api-doc/uta/public/Tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.subType | <code>string</code> | No | *contract only* 'linear', 'inverse' |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |


```javascript
bitget.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Recent-Trades
- https://www.bitget.com/api-doc/spot/market/Get-Market-Trades
- https://www.bitget.com/api-doc/contract/market/Get-Recent-Fills
- https://www.bitget.com/api-doc/contract/market/Get-Fills-History
- https://www.bitget.com/api-doc/uta/public/Fills


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.until | <code>int</code> | No | *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times |


```javascript
bitget.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.bitget.com/api-doc/common/public/Get-Trade-Rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross', for finding the fee rate of spot margin trading pairs |


```javascript
bitget.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Symbols
- https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
- https://www.bitget.com/api-doc/margin/common/support-currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.margin | <code>boolean</code> | No | set to true for spot margin |


```javascript
bitget.fetchTradingFees ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Candle-Data
- https://www.bitget.com/api-doc/spot/market/Get-History-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-History-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-History-Index-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-History-Mark-Candle-Data
- https://www.bitget.com/api-doc/uta/public/Get-Candle-Data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.useHistoryEndpoint | <code>boolean</code> | No | whether to force to use historical endpoint (it has max limit of 200) |
| params.useHistoryEndpointForPagination | <code>boolean</code> | No | whether to force to use historical endpoint for pagination (default true) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.price | <code>string</code> | No | *swap only* "mark" (to fetch mark price candles) or "index" (to fetch index price candles) |


```javascript
bitget.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
- https://www.bitget.com/api-doc/contract/account/Get-Account-List
- https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Assets
- https://www.bitget.com/api-doc/margin/isolated/account/Get-Isolated-Assets
- https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
- https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
- https://www.bitget.com/api-doc/uta/account/Get-Account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>string</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchBalance ([params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Place-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Place-Order
- https://www.bitget.com/api-doc/spot/plan/Place-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Place-Order
- https://www.bitget.com/api-doc/contract/plan/Place-Tpsl-Order
- https://www.bitget.com/api-doc/contract/plan/Place-Plan-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
- https://www.bitget.com/api-doc/uta/trade/Place-Order
- https://www.bitget.com/api-doc/uta/strategy/Place-Strategy-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *spot only* how much you want to trade in units of the quote currency, for market buy orders only |
| params.triggerPrice | <code>float</code> | No | *swap only* The price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *swap only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *swap only* The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *swap only* take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *swap only* stop loss trigger price |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.loanType | <code>string</code> | No | *spot margin only* 'normal', 'autoLoan', 'autoRepay', or 'autoLoanAndRepay' default is 'normal' |
| params.holdSide | <code>string</code> | No | *contract stopLossPrice, takeProfitPrice only* Two-way position: ('long' or 'short'), one-way position: ('buy' or 'sell') |
| params.stopLoss.price | <code>float</code> | No | *swap only* the execution price for a stop loss attached to a trigger order |
| params.takeProfit.price | <code>float</code> | No | *swap only* the execution price for a take profit attached to a trigger order |
| params.stopLoss.type | <code>string</code> | No | *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.takeProfit.type | <code>string</code> | No | *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.trailingPercent | <code>string</code> | No | *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10 |
| params.trailingTriggerPrice | <code>string</code> | No | *swap and future only* the price to trigger a trailing stop order, default uses the price argument |
| params.triggerType | <code>string</code> | No | *swap and future only* 'fill_price', 'mark_price' or 'index_price' |
| params.oneWayMode | <code>boolean</code> | No | *swap and future only* required to set this to true in one_way_mode and you can leave this as undefined in hedge_mode, can adjust the mode using the setPositionMode() method |
| params.hedged | <code>bool</code> | No | *swap and future only* true for hedged mode, false for one way mode, default is false |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.posSide | <code>string</code> | No | *uta only* hedged two-way position side, long or short |


```javascript
bitget.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders (all orders should be of the same symbol)

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Batch-Place-Orders
- https://www.bitget.com/api-doc/contract/trade/Batch-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Order
- https://www.bitget.com/api-doc/uta/trade/Place-Batch


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the api endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/plan/Modify-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Modify-Order
- https://www.bitget.com/api-doc/contract/plan/Modify-Tpsl-Order
- https://www.bitget.com/api-doc/contract/plan/Modify-Plan-Order
- https://www.bitget.com/api-doc/uta/trade/Modify-Order
- https://www.bitget.com/api-doc/uta/strategy/Modify-Strategy-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *swap only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *swap only* The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *swap only* take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *swap only* stop loss trigger price |
| params.stopLoss.price | <code>float</code> | No | *swap only* the execution price for a stop loss attached to a trigger order |
| params.takeProfit.price | <code>float</code> | No | *swap only* the execution price for a take profit attached to a trigger order |
| params.stopLoss.type | <code>string</code> | No | *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.takeProfit.type | <code>string</code> | No | *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.trailingPercent | <code>string</code> | No | *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10 |
| params.trailingTriggerPrice | <code>string</code> | No | *swap and future only* the price to trigger a trailing stop order, default uses the price argument |
| params.newTriggerType | <code>string</code> | No | *swap and future only* 'fill_price', 'mark_price' or 'index_price' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Cancel-Order
- https://www.bitget.com/api-doc/spot/plan/Cancel-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Cancel-Order
- https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Cancel-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Cancel-Order
- https://www.bitget.com/api-doc/uta/trade/Cancel-Order
- https://www.bitget.com/api-doc/uta/strategy/Cancel-Strategy-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.trigger | <code>boolean</code> | No | set to true for canceling trigger orders |
| params.planType | <code>string</code> | No | *swap only* either profit_plan, loss_plan, normal_plan, pos_profit, pos_loss, moving_plan or track_plan |
| params.trailing | <code>boolean</code> | No | set to true if you want to cancel a trailing order |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order, id does not need to be provided if clientOrderId is provided |


```javascript
bitget.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an array of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Batch-Cancel-Orders
- https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
- https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders
- https://www.bitget.com/api-doc/uta/trade/Cancel-Batch


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.trigger | <code>boolean</code> | No | *contract only* set to true for canceling trigger orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Cancel-Symbol-Orders
- https://www.bitget.com/api-doc/spot/plan/Batch-Cancel-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
- https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-cancel-orders
- https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-cancel-order
- https://www.bitget.com/api-doc/uta/trade/Cancel-All-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.trigger | <code>boolean</code> | No | *contract only* set to true for canceling trigger orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.cancelAllOrders (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-Order-Info
- https://www.bitget.com/api-doc/contract/trade/Get-Order-Details
- https://www.bitget.com/api-doc/uta/trade/Get-Order-Details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order, id does not need to be provided if clientOrderId is provided |


```javascript
bitget.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-Unfilled-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-Current-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-Pending
- https://www.bitget.com/api-doc/contract/plan/get-orders-plan-pending
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Open-Orders
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Open-Orders
- https://www.bitget.com/api-doc/uta/strategy/Get-Unfilled-Strategy-Orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
- https://www.bitget.com/api-doc/contract/plan/orders-plan-history
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
- https://www.bitget.com/api-doc/uta/trade/Get-Order-History


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the closed orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of closed orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
bitget.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
- https://www.bitget.com/api-doc/contract/plan/orders-plan-history
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
- https://www.bitget.com/api-doc/uta/trade/Get-Order-History


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the canceled orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of canceled orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
bitget.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
- https://www.bitget.com/api-doc/contract/plan/orders-plan-history
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
- https://www.bitget.com/api-doc/uta/trade/Get-Order-History
- https://www.bitget.com/api-doc/uta/strategy/Get-History-Strategy-Orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**

- https://www.bitget.com/api-doc/spot/account/Get-Account-Bills
- https://www.bitget.com/api-doc/contract/account/Get-Account-Bill


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.symbol | <code>string</code> | No | *contract only* unified market symbol |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchLedger ([code, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-Fills
- https://www.bitget.com/api-doc/contract/trade/Get-Order-Fills
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-Fills
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Transaction-Details
- https://www.bitget.com/api-doc/uta/trade/Get-Order-Fills


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/get-single-position
- https://www.bitget.com/api-doc/uta/trade/Get-Position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/get-all-position
- https://www.bitget.com/api-doc/contract/position/Get-History-Position
- https://www.bitget.com/api-doc/uta/trade/Get-Position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginCoin | <code>string</code> | No | the settle currency of the positions, needs to match the productType |
| params.productType | <code>string</code> | No | 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.useHistoryEndpoint | <code>boolean</code> | No | default false, when true  will use the historic endpoint to fetch positions |
| params.method | <code>string</code> | No | either (default) 'privateMixGetV2MixPositionAllPosition', 'privateMixGetV2MixPositionHistoryPosition', or 'privateUtaGetV3PositionCurrentPosition' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchPositions ([symbols, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-History-Funding-Rate
- https://www.bitget.com/api-doc/uta/public/Get-History-Funding-Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of funding rate structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
- https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
- https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.method | <code>string</code> | No | either (default) 'publicMixGetV2MixMarketCurrentFundRate' or 'publicMixGetV2MixMarketFundingTime' |


```javascript
bitget.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rates for all markets

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a dictionary of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexed by market symbols

**See**: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | *contract only* 'linear', 'inverse' |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |


```javascript
bitget.fetchFundingRates ([symbols, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the funding history

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Get-Account-Bill  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the starting timestamp in milliseconds |
| limit | <code>int</code> | No | the number of entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch funding history for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Change-Margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Change-Margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.addMargin (symbol, amount[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Get-Single-Account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.bitget.com/api-doc/contract/account/Change-Leverage
- https://www.bitget.com/api-doc/uta/account/Change-Leverage


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>int</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.holdSide | <code>string</code> | No | *isolated only* position direction, 'long' or 'short' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.posSide | <code>boolean</code> | No | required for uta isolated margin, long or short |


```javascript
bitget.setLeverage (leverage, symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.bitget.com/api-doc/contract/account/Change-Margin-Mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.setMarginMode (marginMode, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.bitget.com/api-doc/contract/account/Change-Hold-Mode
- https://www.bitget.com/api-doc/uta/account/Change-Position-Mode


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by bitget setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | required if not uta and symbol is undefined: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.setPositionMode (hedged, symbol[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-Open-Interest
- https://www.bitget.com/api-doc/uta/public/Get-Open-Interest


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchOpenInterest (symbol[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Account-TransferRecords  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
bitget.fetchTransfers (code[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Wallet-Transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | unified CCXT market symbol, required when transferring to or from an account type that is a leveraged position-by-position account |
| params.clientOid | <code>string</code> | No | custom id |


```javascript
bitget.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.bitget.com/api-doc/spot/market/Get-Coin-List  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchDepositWithdrawFees (codes[, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/cross/account/Cross-Borrow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>string</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.borrowCrossMargin (code, amount[, params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Borrow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>string</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>string</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.repayIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/cross/account/Cross-Repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>string</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.repayCrossMargin (code, amount[, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**

- https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Liquidation-Records
- https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Liquidation-Records


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitget api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default value is 'cross' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchMyLiquidations ([symbol, since, limit, params])
```


<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

### fetchIsolatedBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure)

**See**: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Margin-Interest-Rate-And-Max-Borrowable-Amount  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchIsolatedBorrowRate (symbol[, params])
```


<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

### fetchCrossBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [borrow rate structure](https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure)

**See**

- https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Margin-Interest-Rate-And-Borrowable
- https://www.bitget.com/api-doc/uta/public/Get-Margin-Loans


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchCrossBorrowRate (code[, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)

**See**

- https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Interest-Records
- https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Interest-Records


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | unified market symbol when fetching interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchBorrowInterest ([code, symbol, since, limit, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
- https://www.bitget.com/api-doc/uta/trade/Close-All-Positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| side | <code>string</code> | No | one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short' |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.closePosition (symbol[, side, params])
```


<a name="closeAllPositions" id="closeallpositions"></a>

### closeAllPositions{docsify-ignore}
closes all open positions for a market type

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
- https://www.bitget.com/api-doc/uta/trade/Close-All-Positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.closeAllPositions ([params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a trading pair

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Get-Single-Account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchMarginMode (symbol[, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/Get-History-Position
- https://www.bitget.com/api-doc/uta/trade/Get-Position-History


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified contract symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months |
| limit | <code>int</code> | No | the maximum amount of records to fetch, default=20, max=100 |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months |
| params.productType | <code>string</code> | No | USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchPositionsHistory ([symbols, since, limit, params])
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetch a quote for converting from one currency to another

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.bitget.com/api-doc/common/convert/Get-Quoted-Price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchConvertQuote (fromCode, toCode[, amount, params])
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
convert from one currency to another

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.bitget.com/api-doc/common/convert/Trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | Yes | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.price | <code>string</code> | Yes | the price of the conversion, obtained from fetchConvertQuote() |
| params.toAmount | <code>string</code> | Yes | the amount you want to trade in units of the toCurrency, obtained from fetchConvertQuote() |


```javascript
bitget.createConvertTrade (id, fromCode, toCode, amount[, params])
```


<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

### fetchConvertTradeHistory{docsify-ignore}
fetch the users history of conversion trades

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.bitget.com/api-doc/common/convert/Get-Convert-Record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchConvertTradeHistory ([code, since, limit, params])
```


<a name="fetchConvertCurrencies" id="fetchconvertcurrencies"></a>

### fetchConvertCurrencies{docsify-ignore}
fetches all available currencies that can be converted

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.bitget.com/api-doc/common/convert/Get-Convert-Currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchConvertCurrencies ([params])
```


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
- https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchFundingInterval (symbol[, params])
```


<a name="fetchLongShortRatioHistory" id="fetchlongshortratiohistory"></a>

### fetchLongShortRatioHistory{docsify-ignore}
fetches the long short ratio history for a unified market symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [long short ratio structures](https://docs.ccxt.com/#/?id=long-short-ratio-structure)

**See**

- https://www.bitget.com/api-doc/common/apidata/Margin-Ls-Ratio
- https://www.bitget.com/api-doc/common/apidata/Account-Long-Short


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the long short ratio for |
| timeframe | <code>string</code> | No | the period for the ratio |
| since | <code>int</code> | No | the earliest time in ms to fetch ratios for |
| limit | <code>int</code> | No | the maximum number of long short ratio structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchLongShortRatioHistory (symbol[, timeframe, since, limit, params])
```


<a name="bitget" id="bitget"></a>

### bitget{docsify-ignore}
watching delivery future markets is not yet implemented (perpertual future & swap is implemented)



```javascript
bitget.bitget ()
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to watch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unsubscribe from the ticker channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>any</code> - status of the unwatch request

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to watch the tickers for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchBidsAsks (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unsubscribe from the ohlcv channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ohlcv for |
| timeframe | <code>string</code> | No | the period for the ratio, default is 1 minute |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.unWatchOHLCV (symbol[, timeframe, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>any</code> - status of the unwatch request

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.unWatchTrades (symbol[, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**

- https://www.bitget.com/api-doc/contract/websocket/private/Positions-Channel
- https://www.bitget.com/api-doc/uta/websocket/private/Positions-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | one of 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES', default is 'USDT-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchPositions (symbols[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/private/Order-Channel
- https://www.bitget.com/api-doc/contract/websocket/private/Order-Channel
- https://www.bitget.com/api-doc/contract/websocket/private/Plan-Order-Channel
- https://www.bitget.com/api-doc/margin/cross/websocket/private/Cross-Orders
- https://www.bitget.com/api-doc/margin/isolated/websocket/private/Isolate-Orders
- https://www.bitget.com/api-doc/uta/websocket/private/Order-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | *contract only* set to true for watching trigger orders |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for watching spot margin orders] |
| params.type | <code>string</code> | No | 'spot', 'swap' |
| params.subType | <code>string</code> | No | 'linear', 'inverse' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches trades made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.bitget.com/api-doc/contract/websocket/private/Fill-Channel
- https://www.bitget.com/api-doc/uta/websocket/private/Fill-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>str</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/private/Account-Channel
- https://www.bitget.com/api-doc/contract/websocket/private/Account-Channel
- https://www.bitget.com/api-doc/margin/cross/websocket/private/Margin-Cross-Account-Assets
- https://www.bitget.com/api-doc/margin/isolated/websocket/private/Margin-isolated-account-assets
- https://www.bitget.com/api-doc/uta/websocket/private/Account-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>str</code> | No | spot or contract if not provided this.options['defaultType'] is used |
| params.instType | <code>string</code> | No | one of 'SPOT', 'MARGIN', 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for watching spot margin balances |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchBalance ([params])
```


<a name="bitget" id="bitget"></a>

## bitget{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchTime](#fetchtime)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchDeposits](#fetchdeposits)
* [withdraw](#withdraw)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDepositAddress](#fetchdepositaddress)
* [fetchOrderBook](#fetchorderbook)
* [fetchTicker](#fetchticker)
* [fetchMarkPrice](#fetchmarkprice)
* [fetchTickers](#fetchtickers)
* [fetchTrades](#fetchtrades)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchLedger](#fetchledger)
* [fetchMyTrades](#fetchmytrades)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchFundingHistory](#fetchfundinghistory)
* [reduceMargin](#reducemargin)
* [addMargin](#addmargin)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [setMarginMode](#setmarginmode)
* [setPositionMode](#setpositionmode)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchTransfers](#fetchtransfers)
* [transfer](#transfer)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [borrowCrossMargin](#borrowcrossmargin)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [repayCrossMargin](#repaycrossmargin)
* [fetchMyLiquidations](#fetchmyliquidations)
* [fetchIsolatedBorrowRate](#fetchisolatedborrowrate)
* [fetchCrossBorrowRate](#fetchcrossborrowrate)
* [fetchBorrowInterest](#fetchborrowinterest)
* [closePosition](#closeposition)
* [closeAllPositions](#closeallpositions)
* [fetchMarginMode](#fetchmarginmode)
* [fetchPositionsHistory](#fetchpositionshistory)
* [fetchConvertQuote](#fetchconvertquote)
* [createConvertTrade](#createconverttrade)
* [fetchConvertTradeHistory](#fetchconverttradehistory)
* [fetchConvertCurrencies](#fetchconvertcurrencies)
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchLongShortRatioHistory](#fetchlongshortratiohistory)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [watchBidsAsks](#watchbidsasks)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchOrderBookForSymbols](#watchorderbookforsymbols)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [unWatchTrades](#unwatchtrades)
* [watchPositions](#watchpositions)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**: https://www.bitget.com/api-doc/common/public/Get-Server-Time  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchTime ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for bitget

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Symbols
- https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
- https://www.bitget.com/api-doc/margin/common/support-currencies
- https://www.bitget.com/api-doc/uta/public/Instruments


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.bitget.com/api-doc/spot/market/Get-Coin-List  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchCurrencies ([params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/Get-Query-Position-Lever
- https://www.bitget.com/api-doc/margin/cross/account/Cross-Tier-Data
- https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Tier-Data
- https://www.bitget.com/api-doc/uta/public/Get-Position-Tier-Data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | for spot margin 'cross' or 'isolated', default is 'isolated' |
| params.code | <code>string</code> | No | required for cross spot margin |
| params.productType | <code>string</code> | No | *contract and uta only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchMarketLeverageTiers (symbol[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in milliseconds |
| params.idLessThan | <code>string</code> | No | return records with id less than the provided value |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchDeposits (code[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Wallet-Withdrawal  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.chain | <code>string</code> | No | the blockchain network the withdrawal is taking place on |


```javascript
bitget.withdraw (code, amount, address, tag[, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Withdraw-Record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in milliseconds |
| params.idLessThan | <code>string</code> | No | return records with id less than the provided value |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Deposit-Address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchDepositAddress (code[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Orderbook
- https://www.bitget.com/api-doc/contract/market/Get-Merge-Depth
- https://www.bitget.com/api-doc/uta/public/OrderBook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Tickers
- https://www.bitget.com/api-doc/contract/market/Get-Ticker
- https://www.bitget.com/api-doc/uta/public/Tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchTicker (symbol[, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches the mark price for a specific market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://www.bitget.com/api-doc/contract/market/Get-Symbol-Price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchMarkPrice (symbol[, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Tickers
- https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker
- https://www.bitget.com/api-doc/uta/public/Tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.subType | <code>string</code> | No | *contract only* 'linear', 'inverse' |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |


```javascript
bitget.fetchTickers (symbols[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Recent-Trades
- https://www.bitget.com/api-doc/spot/market/Get-Market-Trades
- https://www.bitget.com/api-doc/contract/market/Get-Recent-Fills
- https://www.bitget.com/api-doc/contract/market/Get-Fills-History
- https://www.bitget.com/api-doc/uta/public/Fills


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.until | <code>int</code> | No | *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | *only applies to publicSpotGetV2SpotMarketFillsHistory and publicMixGetV2MixMarketFillsHistory* default false, when true will automatically paginate by calling this endpoint multiple times |


```javascript
bitget.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.bitget.com/api-doc/common/public/Get-Trade-Rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross', for finding the fee rate of spot margin trading pairs |


```javascript
bitget.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Symbols
- https://www.bitget.com/api-doc/contract/market/Get-All-Symbols-Contracts
- https://www.bitget.com/api-doc/margin/common/support-currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.margin | <code>boolean</code> | No | set to true for spot margin |


```javascript
bitget.fetchTradingFees ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.bitget.com/api-doc/spot/market/Get-Candle-Data
- https://www.bitget.com/api-doc/spot/market/Get-History-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-History-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-History-Index-Candle-Data
- https://www.bitget.com/api-doc/contract/market/Get-History-Mark-Candle-Data
- https://www.bitget.com/api-doc/uta/public/Get-Candle-Data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.useHistoryEndpoint | <code>boolean</code> | No | whether to force to use historical endpoint (it has max limit of 200) |
| params.useHistoryEndpointForPagination | <code>boolean</code> | No | whether to force to use historical endpoint for pagination (default true) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.price | <code>string</code> | No | *swap only* "mark" (to fetch mark price candles) or "index" (to fetch index price candles) |


```javascript
bitget.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.bitget.com/api-doc/spot/account/Get-Account-Assets
- https://www.bitget.com/api-doc/contract/account/Get-Account-List
- https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Assets
- https://www.bitget.com/api-doc/margin/isolated/account/Get-Isolated-Assets
- https://bitgetlimited.github.io/apidoc/en/margin/#get-cross-assets
- https://bitgetlimited.github.io/apidoc/en/margin/#get-isolated-assets
- https://www.bitget.com/api-doc/uta/account/Get-Account


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>string</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchBalance ([params])
```


<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Place-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Place-Order
- https://www.bitget.com/api-doc/spot/plan/Place-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Place-Order
- https://www.bitget.com/api-doc/contract/plan/Place-Tpsl-Order
- https://www.bitget.com/api-doc/contract/plan/Place-Plan-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Place-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Place-Order
- https://www.bitget.com/api-doc/uta/trade/Place-Order
- https://www.bitget.com/api-doc/uta/strategy/Place-Strategy-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *spot only* how much you want to trade in units of the quote currency, for market buy orders only |
| params.triggerPrice | <code>float</code> | No | *swap only* The price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *swap only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *swap only* The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *swap only* take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *swap only* stop loss trigger price |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.loanType | <code>string</code> | No | *spot margin only* 'normal', 'autoLoan', 'autoRepay', or 'autoLoanAndRepay' default is 'normal' |
| params.holdSide | <code>string</code> | No | *contract stopLossPrice, takeProfitPrice only* Two-way position: ('long' or 'short'), one-way position: ('buy' or 'sell') |
| params.stopLoss.price | <code>float</code> | No | *swap only* the execution price for a stop loss attached to a trigger order |
| params.takeProfit.price | <code>float</code> | No | *swap only* the execution price for a take profit attached to a trigger order |
| params.stopLoss.type | <code>string</code> | No | *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.takeProfit.type | <code>string</code> | No | *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.trailingPercent | <code>string</code> | No | *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10 |
| params.trailingTriggerPrice | <code>string</code> | No | *swap and future only* the price to trigger a trailing stop order, default uses the price argument |
| params.triggerType | <code>string</code> | No | *swap and future only* 'fill_price', 'mark_price' or 'index_price' |
| params.oneWayMode | <code>boolean</code> | No | *swap and future only* required to set this to true in one_way_mode and you can leave this as undefined in hedge_mode, can adjust the mode using the setPositionMode() method |
| params.hedged | <code>bool</code> | No | *swap and future only* true for hedged mode, false for one way mode, default is false |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.posSide | <code>string</code> | No | *uta only* hedged two-way position side, long or short |


```javascript
bitget.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders (all orders should be of the same symbol)

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Batch-Place-Orders
- https://www.bitget.com/api-doc/contract/trade/Batch-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Order
- https://www.bitget.com/api-doc/uta/trade/Place-Batch


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the api endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.createOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/plan/Modify-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Modify-Order
- https://www.bitget.com/api-doc/contract/plan/Modify-Tpsl-Order
- https://www.bitget.com/api-doc/contract/plan/Modify-Plan-Order
- https://www.bitget.com/api-doc/uta/trade/Modify-Order
- https://www.bitget.com/api-doc/uta/strategy/Modify-Strategy-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | the price that a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *swap only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *swap only* The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *swap only* take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *swap only* stop loss trigger price |
| params.stopLoss.price | <code>float</code> | No | *swap only* the execution price for a stop loss attached to a trigger order |
| params.takeProfit.price | <code>float</code> | No | *swap only* the execution price for a take profit attached to a trigger order |
| params.stopLoss.type | <code>string</code> | No | *swap only* the type for a stop loss attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.takeProfit.type | <code>string</code> | No | *swap only* the type for a take profit attached to a trigger order, 'fill_price', 'index_price' or 'mark_price', default is 'mark_price' |
| params.trailingPercent | <code>string</code> | No | *swap and future only* the percent to trail away from the current market price, rate can not be greater than 10 |
| params.trailingTriggerPrice | <code>string</code> | No | *swap and future only* the price to trigger a trailing stop order, default uses the price argument |
| params.newTriggerType | <code>string</code> | No | *swap and future only* 'fill_price', 'mark_price' or 'index_price' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Cancel-Order
- https://www.bitget.com/api-doc/spot/plan/Cancel-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Cancel-Order
- https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Cancel-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Cancel-Order
- https://www.bitget.com/api-doc/uta/trade/Cancel-Order
- https://www.bitget.com/api-doc/uta/strategy/Cancel-Strategy-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.trigger | <code>boolean</code> | No | set to true for canceling trigger orders |
| params.planType | <code>string</code> | No | *swap only* either profit_plan, loss_plan, normal_plan, pos_profit, pos_loss, moving_plan or track_plan |
| params.trailing | <code>boolean</code> | No | set to true if you want to cancel a trailing order |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order, id does not need to be provided if clientOrderId is provided |


```javascript
bitget.cancelOrder (id, symbol[, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an array of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Batch-Cancel-Orders
- https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
- https://www.bitget.com/api-doc/contract/plan/Cancel-Plan-Order
- https://www.bitget.com/api-doc/margin/cross/trade/Cross-Batch-Cancel-Order
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Batch-Cancel-Orders
- https://www.bitget.com/api-doc/uta/trade/Cancel-Batch


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.trigger | <code>boolean</code> | No | *contract only* set to true for canceling trigger orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.cancelOrders (ids, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Cancel-Symbol-Orders
- https://www.bitget.com/api-doc/spot/plan/Batch-Cancel-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Batch-Cancel-Orders
- https://bitgetlimited.github.io/apidoc/en/margin/#isolated-batch-cancel-orders
- https://bitgetlimited.github.io/apidoc/en/margin/#cross-batch-cancel-order
- https://www.bitget.com/api-doc/uta/trade/Cancel-All-Order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for spot margin trading |
| params.trigger | <code>boolean</code> | No | *contract only* set to true for canceling trigger orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.cancelAllOrders (symbol[, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-Order-Info
- https://www.bitget.com/api-doc/contract/trade/Get-Order-Details
- https://www.bitget.com/api-doc/uta/trade/Get-Order-Details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.clientOrderId | <code>string</code> | No | the clientOrderId of the order, id does not need to be provided if clientOrderId is provided |


```javascript
bitget.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-Unfilled-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-Current-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-Pending
- https://www.bitget.com/api-doc/contract/plan/get-orders-plan-pending
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Open-Orders
- https://www.bitget.com/api-doc/margin/isolated/trade/Isolated-Open-Orders
- https://www.bitget.com/api-doc/uta/strategy/Get-Unfilled-Strategy-Orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
- https://www.bitget.com/api-doc/contract/plan/orders-plan-history
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
- https://www.bitget.com/api-doc/uta/trade/Get-Order-History


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the closed orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of closed orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
bitget.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
- https://www.bitget.com/api-doc/contract/plan/orders-plan-history
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
- https://www.bitget.com/api-doc/uta/trade/Get-Order-History


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the canceled orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order |
| limit | <code>int</code> | No | the max number of canceled orders to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |


```javascript
bitget.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetches information on multiple canceled and closed orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-History-Orders
- https://www.bitget.com/api-doc/spot/plan/Get-History-Plan-Order
- https://www.bitget.com/api-doc/contract/trade/Get-Orders-History
- https://www.bitget.com/api-doc/contract/plan/orders-plan-history
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-History
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Order-History
- https://www.bitget.com/api-doc/uta/trade/Get-Order-History
- https://www.bitget.com/api-doc/uta/strategy/Get-History-Strategy-Orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |
| params.planType | <code>string</code> | No | *contract stop only* 'normal_plan': average trigger order, 'profit_loss': opened tp/sl orders, 'track_plan': trailing stop order, default is 'normal_plan' |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.isPlan | <code>string</code> | No | *swap only* 'plan' for stop orders and 'profit_loss' for tp/sl orders, default is 'plan' |
| params.trailing | <code>boolean</code> | No | set to true if you want to fetch trailing orders |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchCanceledAndClosedOrders (symbol[, since, limit, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)

**See**

- https://www.bitget.com/api-doc/spot/account/Get-Account-Bills
- https://www.bitget.com/api-doc/contract/account/Get-Account-Bill


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.symbol | <code>string</code> | No | *contract only* unified market symbol |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchLedger ([code, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.bitget.com/api-doc/spot/trade/Get-Fills
- https://www.bitget.com/api-doc/contract/trade/Get-Order-Fills
- https://www.bitget.com/api-doc/margin/cross/trade/Get-Cross-Order-Fills
- https://www.bitget.com/api-doc/margin/isolated/trade/Get-Isolated-Transaction-Details
- https://www.bitget.com/api-doc/uta/trade/Get-Order-Fills


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on a single open contract trade position

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/get-single-position
- https://www.bitget.com/api-doc/uta/trade/Get-Position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/get-all-position
- https://www.bitget.com/api-doc/contract/position/Get-History-Position
- https://www.bitget.com/api-doc/uta/trade/Get-Position


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginCoin | <code>string</code> | No | the settle currency of the positions, needs to match the productType |
| params.productType | <code>string</code> | No | 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.useHistoryEndpoint | <code>boolean</code> | No | default false, when true  will use the historic endpoint to fetch positions |
| params.method | <code>string</code> | No | either (default) 'privateMixGetV2MixPositionAllPosition', 'privateMixGetV2MixPositionHistoryPosition', or 'privateUtaGetV3PositionCurrentPosition' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchPositions ([symbols, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-History-Funding-Rate
- https://www.bitget.com/api-doc/uta/public/Get-History-Funding-Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of funding rate structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
- https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
- https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.method | <code>string</code> | No | either (default) 'publicMixGetV2MixMarketCurrentFundRate' or 'publicMixGetV2MixMarketFundingTime' |


```javascript
bitget.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
fetch the current funding rates for all markets

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a dictionary of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexed by market symbols

**See**: https://www.bitget.com/api-doc/contract/market/Get-All-Symbol-Ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | *contract only* 'linear', 'inverse' |
| params.productType | <code>string</code> | No | *contract only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |


```javascript
bitget.fetchFundingRates ([symbols, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the funding history

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Get-Account-Bill  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the starting timestamp in milliseconds |
| limit | <code>int</code> | No | the number of entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch funding history for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Change-Margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.reduceMargin (symbol, amount[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Change-Margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.addMargin (symbol, amount[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Get-Single-Account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.bitget.com/api-doc/contract/account/Change-Leverage
- https://www.bitget.com/api-doc/uta/account/Change-Leverage


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>int</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.holdSide | <code>string</code> | No | *isolated only* position direction, 'long' or 'short' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.posSide | <code>boolean</code> | No | required for uta isolated margin, long or short |


```javascript
bitget.setLeverage (leverage, symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.bitget.com/api-doc/contract/account/Change-Margin-Mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.setMarginMode (marginMode, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.bitget.com/api-doc/contract/account/Change-Hold-Mode
- https://www.bitget.com/api-doc/uta/account/Change-Position-Mode


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by bitget setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | required if not uta and symbol is undefined: 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.setPositionMode (hedged, symbol[, params])
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-Open-Interest
- https://www.bitget.com/api-doc/uta/public/Get-Open-Interest


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchOpenInterest (symbol[, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Get-Account-TransferRecords  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |


```javascript
bitget.fetchTransfers (code[, since, limit, params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://www.bitget.com/api-doc/spot/account/Wallet-Transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>string</code> | No | unified CCXT market symbol, required when transferring to or from an account type that is a leveraged position-by-position account |
| params.clientOid | <code>string</code> | No | custom id |


```javascript
bitget.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

### fetchDepositWithdrawFees{docsify-ignore}
fetch deposit and withdraw fees

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)

**See**: https://www.bitget.com/api-doc/spot/market/Get-Coin-List  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchDepositWithdrawFees (codes[, params])
```


<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

### borrowCrossMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/cross/account/Cross-Borrow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>string</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.borrowCrossMargin (code, amount[, params])
```


<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

### borrowIsolatedMargin{docsify-ignore}
create a loan to borrow margin

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Borrow  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>string</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.borrowIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

### repayIsolatedMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>string</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.repayIsolatedMargin (symbol, code, amount[, params])
```


<a name="repayCrossMargin" id="repaycrossmargin"></a>

### repayCrossMargin{docsify-ignore}
repay borrowed margin and interest

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)

**See**: https://www.bitget.com/api-doc/margin/cross/account/Cross-Repay  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>string</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.repayCrossMargin (code, amount[, params])
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)

**See**

- https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Liquidation-Records
- https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Liquidation-Records


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitget api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default value is 'cross' |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchMyLiquidations ([symbol, since, limit, params])
```


<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

### fetchIsolatedBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure)

**See**: https://www.bitget.com/api-doc/margin/isolated/account/Isolated-Margin-Interest-Rate-And-Max-Borrowable-Amount  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchIsolatedBorrowRate (symbol[, params])
```


<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

### fetchCrossBorrowRate{docsify-ignore}
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [borrow rate structure](https://github.com/ccxt/ccxt/wiki/Manual#borrow-rate-structure)

**See**

- https://www.bitget.com/api-doc/margin/cross/account/Get-Cross-Margin-Interest-Rate-And-Borrowable
- https://www.bitget.com/api-doc/uta/public/Get-Margin-Loans


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchCrossBorrowRate (code[, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)

**See**

- https://www.bitget.com/api-doc/margin/cross/record/Get-Cross-Interest-Records
- https://www.bitget.com/api-doc/margin/isolated/record/Get-Isolated-Interest-Records


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | unified market symbol when fetching interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
bitget.fetchBorrowInterest ([code, symbol, since, limit, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes an open position for a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
- https://www.bitget.com/api-doc/uta/trade/Close-All-Positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| side | <code>string</code> | No | one-way mode: 'buy' or 'sell', hedge-mode: 'long' or 'short' |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.closePosition (symbol[, side, params])
```


<a name="closeAllPositions" id="closeallpositions"></a>

### closeAllPositions{docsify-ignore}
closes all open positions for a market type

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/trade/Flash-Close-Position
- https://www.bitget.com/api-doc/uta/trade/Close-All-Positions


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.closeAllPositions ([params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a trading pair

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/#/?id=margin-mode-structure)

**See**: https://www.bitget.com/api-doc/contract/account/Get-Single-Account  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchMarginMode (symbol[, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)

**See**

- https://www.bitget.com/api-doc/contract/position/Get-History-Position
- https://www.bitget.com/api-doc/uta/trade/Get-Position-History


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified contract symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months |
| limit | <code>int</code> | No | the maximum amount of records to fetch, default=20, max=100 |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months |
| params.productType | <code>string</code> | No | USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchPositionsHistory ([symbols, since, limit, params])
```


<a name="fetchConvertQuote" id="fetchconvertquote"></a>

### fetchConvertQuote{docsify-ignore}
fetch a quote for converting from one currency to another

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.bitget.com/api-doc/common/convert/Get-Quoted-Price  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchConvertQuote (fromCode, toCode[, amount, params])
```


<a name="createConvertTrade" id="createconverttrade"></a>

### createConvertTrade{docsify-ignore}
convert from one currency to another

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.bitget.com/api-doc/common/convert/Trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | Yes | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.price | <code>string</code> | Yes | the price of the conversion, obtained from fetchConvertQuote() |
| params.toAmount | <code>string</code> | Yes | the amount you want to trade in units of the toCurrency, obtained from fetchConvertQuote() |


```javascript
bitget.createConvertTrade (id, fromCode, toCode, amount[, params])
```


<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

### fetchConvertTradeHistory{docsify-ignore}
fetch the users history of conversion trades

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/#/?id=conversion-structure)

**See**: https://www.bitget.com/api-doc/common/convert/Get-Convert-Record  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchConvertTradeHistory ([code, since, limit, params])
```


<a name="fetchConvertCurrencies" id="fetchconvertcurrencies"></a>

### fetchConvertCurrencies{docsify-ignore}
fetches all available currencies that can be converted

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://www.bitget.com/api-doc/common/convert/Get-Convert-Currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchConvertCurrencies ([params])
```


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**

- https://www.bitget.com/api-doc/contract/market/Get-Symbol-Next-Funding-Time
- https://www.bitget.com/api-doc/uta/public/Get-Current-Funding-Rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.fetchFundingInterval (symbol[, params])
```


<a name="fetchLongShortRatioHistory" id="fetchlongshortratiohistory"></a>

### fetchLongShortRatioHistory{docsify-ignore}
fetches the long short ratio history for a unified market symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [long short ratio structures](https://docs.ccxt.com/#/?id=long-short-ratio-structure)

**See**

- https://www.bitget.com/api-doc/common/apidata/Margin-Ls-Ratio
- https://www.bitget.com/api-doc/common/apidata/Account-Long-Short


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the long short ratio for |
| timeframe | <code>string</code> | No | the period for the ratio |
| since | <code>int</code> | No | the earliest time in ms to fetch ratios for |
| limit | <code>int</code> | No | the maximum number of long short ratio structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.fetchLongShortRatioHistory (symbol[, timeframe, since, limit, params])
```


<a name="bitget" id="bitget"></a>

### bitget{docsify-ignore}
watching delivery future markets is not yet implemented (perpertual future & swap is implemented)



```javascript
bitget.bitget ()
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to watch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTicker (symbol[, params])
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unsubscribe from the ticker channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>any</code> - status of the unwatch request

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
bitget.unWatchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to watch the tickers for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchBidsAsks (symbols[, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
unsubscribe from the ohlcv channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Candlesticks-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the ohlcv for |
| timeframe | <code>string</code> | No | the period for the ratio, default is 1 minute |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.unWatchOHLCV (symbol[, timeframe, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOrderBook (symbol[, limit, params])
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unsubscribe from the orderbook channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.unWatchOrderBook (symbol[, params])
```


<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

### watchOrderBookForSymbols{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unsubscribe from the trades channel

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>any</code> - status of the unwatch request

**See**

- https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
- https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
- https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.unWatchTrades (symbol[, params])
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**

- https://www.bitget.com/api-doc/contract/websocket/private/Positions-Channel
- https://www.bitget.com/api-doc/uta/websocket/private/Positions-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.instType | <code>string</code> | No | one of 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES', default is 'USDT-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchPositions (symbols[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/private/Order-Channel
- https://www.bitget.com/api-doc/contract/websocket/private/Order-Channel
- https://www.bitget.com/api-doc/contract/websocket/private/Plan-Order-Channel
- https://www.bitget.com/api-doc/margin/cross/websocket/private/Cross-Orders
- https://www.bitget.com/api-doc/margin/isolated/websocket/private/Isolate-Orders
- https://www.bitget.com/api-doc/uta/websocket/private/Order-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | *contract only* set to true for watching trigger orders |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for watching spot margin orders] |
| params.type | <code>string</code> | No | 'spot', 'swap' |
| params.subType | <code>string</code> | No | 'linear', 'inverse' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches trades made by the user

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**

- https://www.bitget.com/api-doc/contract/websocket/private/Fill-Channel
- https://www.bitget.com/api-doc/uta/websocket/private/Fill-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>str</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>bitget</code>](#bitget)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://www.bitget.com/api-doc/spot/websocket/private/Account-Channel
- https://www.bitget.com/api-doc/contract/websocket/private/Account-Channel
- https://www.bitget.com/api-doc/margin/cross/websocket/private/Margin-Cross-Account-Assets
- https://www.bitget.com/api-doc/margin/isolated/websocket/private/Margin-isolated-account-assets
- https://www.bitget.com/api-doc/uta/websocket/private/Account-Channel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>str</code> | No | spot or contract if not provided this.options['defaultType'] is used |
| params.instType | <code>string</code> | No | one of 'SPOT', 'MARGIN', 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.marginMode | <code>string</code> | No | 'isolated' or 'cross' for watching spot margin balances |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
bitget.watchBalance ([params])
```

