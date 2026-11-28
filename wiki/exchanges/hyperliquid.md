
<a name="hyperliquid" id="hyperliquid"></a>

## hyperliquid{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchStatus](#fetchstatus)
* [fetchTime](#fetchtime)
* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchHip3Markets](#fetchhip3markets)
* [fetchSwapMarkets](#fetchswapmarkets)
* [calculatePricePrecision](#calculatepriceprecision)
* [fetchSpotMarkets](#fetchspotmarkets)
* [fetchBalance](#fetchbalance)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRates](#fetchfundingrates)
* [fetchOHLCV](#fetchohlcv)
* [fetchTrades](#fetchtrades)
* [isUnifiedEnabled](#isunifiedenabled)
* [setUserAbstraction](#setuserabstraction)
* [enableUserDexAbstraction](#enableuserdexabstraction)
* [setAgentAbstraction](#setagentabstraction)
* [createOrder](#createorder)
* [createTwapOrder](#createtwaporder)
* [createOrders](#createorders)
* [createOrdersRequest](#createordersrequest)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelTwapOrder](#canceltwaporder)
* [cancelOrdersRequest](#cancelordersrequest)
* [cancelOrdersForSymbols](#cancelordersforsymbols)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [editOrder](#editorder)
* [editOrders](#editorders)
* [createVault](#createvault)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchCanceledAndClosedOrders](#fetchcanceledandclosedorders)
* [fetchOrders](#fetchorders)
* [fetchOrder](#fetchorder)
* [fetchMyTrades](#fetchmytrades)
* [fetchMyLiquidations](#fetchmyliquidations)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [setMarginMode](#setmarginmode)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [transfer](#transfer)
* [withdraw](#withdraw)
* [fetchTradingFee](#fetchtradingfee)
* [fetchLedger](#fetchledger)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterest](#fetchopeninterest)
* [fetchFundingHistory](#fetchfundinghistory)
* [reserveRequestWeight](#reserverequestweight)
* [approveAgent](#approveagent)
* [noop](#noop)
* [claimRewards](#claimrewards)
* [usdSend](#usdsend)
* [spotSend](#spotsend)
* [stakingDeposit](#stakingdeposit)
* [stakingWithdraw](#stakingwithdraw)
* [tokenDelegate](#tokendelegate)
* [fetchApprovedBuilders](#fetchapprovedbuilders)
* [fetchVaultDetails](#fetchvaultdetails)
* [fetchStakingDelegations](#fetchstakingdelegations)
* [fetchStakingSummary](#fetchstakingsummary)
* [fetchStakingHistory](#fetchstakinghistory)
* [fetchStakingRewards](#fetchstakingrewards)
* [fetchAccounts](#fetchaccounts)
* [fetchCrossBorrowRates](#fetchcrossborrowrates)
* [fetchCrossBorrowRate](#fetchcrossborrowrate)
* [fetchBorrowInterest](#fetchborrowinterest)
* [createSubAccount](#createsubaccount)
* [createOrdersWs](#createordersws)
* [createOrderWs](#createorderws)
* [editOrderWs](#editorderws)
* [cancelOrdersWs](#cancelordersws)
* [cancelOrderWs](#cancelorderws)
* [watchOrderBook](#watchorderbook)
* [unWatchOrderBook](#unwatchorderbook)
* [watchBidsAsks](#watchbidsasks)
* [unWatchBidsAsks](#unwatchbidsasks)
* [watchTicker](#watchticker)
* [unWatchTicker](#unwatchticker)
* [watchTickers](#watchtickers)
* [unWatchTickers](#unwatchtickers)
* [watchMyTrades](#watchmytrades)
* [watchMyLiquidations](#watchmyliquidations)
* [watchMyLiquidationsForSymbols](#watchmyliquidationsforsymbols)
* [unWatchMyTrades](#unwatchmytrades)
* [watchTrades](#watchtrades)
* [unWatchTrades](#unwatchtrades)
* [watchOHLCV](#watchohlcv)
* [unWatchOHLCV](#unwatchohlcv)
* [watchBalance](#watchbalance)
* [unWatchBalance](#unwatchbalance)
* [watchPositions](#watchpositions)
* [unWatchPositions](#unwatchpositions)
* [watchOrders](#watchorders)
* [unWatchOrders](#unwatchorders)

<a name="fetchStatus" id="fetchstatus"></a>

### fetchStatus{docsify-ignore}
the latest known information on the availability of the exchange API

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchStatus (params?)
```


<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchTime (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchCurrencies (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchMarkets (params?)
```


<a name="fetchHip3Markets" id="fetchhip3markets"></a>

### fetchHip3Markets{docsify-ignore}
retrieves data on all hip3 markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchHip3Markets (params?)
```


<a name="fetchSwapMarkets" id="fetchswapmarkets"></a>

### fetchSwapMarkets{docsify-ignore}
retrieves data on all swap markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchSwapMarkets (params?)
```


<a name="calculatePricePrecision" id="calculatepriceprecision"></a>

### calculatePricePrecision{docsify-ignore}
Helper function to calculate the Hyperliquid DECIMAL_PLACES price precision

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>int</code> - The calculated price precision


| Param | Type | Description |
| --- | --- | --- |
| price | <code>float</code> | the price to use in the calculation |
| amountPrecision | <code>int</code> | the amountPrecision to use in the calculation |
| maxDecimals | <code>int</code> | the maxDecimals to use in the calculation |


```javascript
hyperliquid.calculatePricePrecision (price, amountPrecision, maxDecimals)
```


<a name="fetchSpotMarkets" id="fetchspotmarkets"></a>

### fetchSpotMarkets{docsify-ignore}
retrieves data on all spot markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchSpotMarkets (params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.type | <code>string</code> | No | wallet type, ['spot', 'swap'], defaults to swap |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null |
| params.dex | <code>string</code> | No | for hip3 markets, the dex name, eg: 'xyz' |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.enableUnifiedMargin | <code>boolean</code> | No | enable unified margin, CCXT tries to auto-detects this value but you can override it |


```javascript
hyperliquid.fetchBalance (params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', by default fetches both |
| params.hip3 | <code>boolean</code> | No | set to true to fetch hip3 markets only |


```javascript
hyperliquid.fetchTickers (symbols?, params?)
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate for a symbol - hyperliquid only offers a bulk endpoint, so this filters the result of fetchFundingRates

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchFundingRate (symbol, params?)
```


<a name="fetchFundingRates" id="fetchfundingrates"></a>

### fetchFundingRates{docsify-ignore}
retrieves data on all swap markets for hyperliquid

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.dex | <code>string</code> | No | perp dex name for hip3 markets, eg: 'xyz', inferred from the symbols if not provided |
| params.method | <code>string</code> | No | 'metaAndAssetCtxs' (default) for the current funding rates, or 'predictedFundings' for the predicted rate and time of the next funding, only available for the main dex, the predictions for other venues are in info |


```javascript
hyperliquid.fetchFundingRates (symbols?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents, support '1m', '15m', '1h', '1d' |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |


```javascript
hyperliquid.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade |
| params.address | <code>string</code> | No | wallet address that made trades |
| params.user | <code>string</code> | No | wallet address that made trades |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchTrades (symbol, since?, limit?, params?)
```


<a name="isUnifiedEnabled" id="isunifiedenabled"></a>

### isUnifiedEnabled{docsify-ignore}
returns enableUnifiedMargin so the user can check if unified account is enabled

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>bool</code> - enableUnifiedMargin

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| method | <code>string</code> | Yes | the method for which we want to check if unified margin is enabled, this is used to check options for specific methods (e.g. fetchBalance can have a specific option to enable unified margin) |
| address | <code>string</code> | No | the wallet address to query; defaults to the configured walletAddress |
| shouldRefresh | <code>boolean</code> | No | force a fresh request instead of returning the cached value |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.isUnifiedEnabled (method, address?, shouldRefresh?, params?)
```


<a name="setUserAbstraction" id="setuserabstraction"></a>

### setUserAbstraction{docsify-ignore}
set user abstraction mode

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: dictionary response from the exchange

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| abstraction | <code>string</code> | Yes | one of the strings ["disabled", "unifiedAccount", "portfolioMargin"], |
| params | <code>object</code> | No |  |
| params.type | <code>string</code> | No | 'userSetAbstraction' or 'agentSetAbstraction' default is 'userSetAbstraction' |


```javascript
hyperliquid.setUserAbstraction (abstraction, params?)
```


<a name="enableUserDexAbstraction" id="enableuserdexabstraction"></a>

### enableUserDexAbstraction{docsify-ignore}
If set, actions on HIP-3 perps will automatically transfer collateral from validator-operated USDC perps balance for HIP-3 DEXs where USDC is the collateral token, and spot otherwise

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: dictionary response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| enabled | <code>boolean</code> | Yes | whether to enable user dex abstraction |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'userDexAbstraction' or 'agentEnableDexAbstraction' default is 'userDexAbstraction' |


```javascript
hyperliquid.enableUserDexAbstraction (enabled, params?)
```


<a name="setAgentAbstraction" id="setagentabstraction"></a>

### setAgentAbstraction{docsify-ignore}
set agent abstraction mode

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: dictionary response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| abstraction | <code>string</code> | Yes | one of the strings ["i", "u", "p"] where "i" is "disabled", "u" is "unifiedAccount", and "p" is "portfolioMargin" |
| params | <code>object</code> | No |  |


```javascript
hyperliquid.setAgentAbstraction (abstraction, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.slippage | <code>string</code> | No | the slippage for market order |
| params.vaultAddress | <code>string</code> | No | the vault address for order |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.priorityFee | <code>int</code> | No | the order priority fee rate in units of 1e-8 (10000 = 1 bp), only for IOC orders (market orders included) or post-only orders that are not reduce-only, paid in HYPE from the undelegated staking balance |
| params.trailingPercent | <code>float</code> | No | *swap only* the percent to trail away from the best mark price, the order is sent as a native trailing stop that executes as a market order |
| params.trailingAmount | <code>float</code> | No | *swap only* the quote amount to trail away from the best mark price, the order is sent as a native trailing stop that executes as a market order |
| params.trailingTriggerPrice | <code>float</code> | No | *swap only* the mark price at which a trailing order starts tracking, tracking starts immediately if omitted |


```javascript
hyperliquid.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createTwapOrder" id="createtwaporder"></a>

### createTwapOrder{docsify-ignore}
create a trade order that is executed as a TWAP order over a specified duration.

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| duration | <code>int</code> | Yes | the duration of the TWAP order in milliseconds |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.randomize | <code>bool</code> | No | whether to randomize the time intervals of the TWAP order slices (default is false, meaning equal intervals) |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.expiresAfter | <code>int</code> | No | time in ms after which the twap order expires |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.createTwapOrder (symbol, side, amount, duration, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.priorityFee | <code>int</code> | No | the order priority fee rate in units of 1e-8 (10000 = 1 bp) applied to the whole request, only when every order is IOC (market orders included) or every order is post-only and not reduce-only, paid in HYPE from the undelegated staking balance |


```javascript
hyperliquid.createOrders (orders, params?)
```


<a name="createOrdersRequest" id="createordersrequest"></a>

### createOrdersRequest{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |


```javascript
hyperliquid.createOrdersRequest (orders)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address for order |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.twap | <code>boolean</code> | No | whether the order to cancel is a twap order, (default is false) |
| params.fast | <code>boolean</code> | No | whether to send the cancel with the fast flag, rejected for trigger orders, prioritized in the mempool in a future network upgrade, (default is false) |


```javascript
hyperliquid.cancelOrder (id, symbol, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code>, <code>Array&lt;string&gt;</code> | No | client order ids, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.fast | <code>boolean</code> | No | whether to send the cancel with the fast flag, rejected for trigger orders, prioritized in the mempool in a future network upgrade, (default is false) |


```javascript
hyperliquid.cancelOrders (ids, symbol?, params?)
```


<a name="cancelTwapOrder" id="canceltwaporder"></a>

### cancelTwapOrder{docsify-ignore}
cancels a running twap order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiresAfter | <code>int</code> | No | time in ms after which the twap order expires |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.cancelTwapOrder (id, symbol, params?)
```


<a name="cancelOrdersRequest" id="cancelordersrequest"></a>

### cancelOrdersRequest{docsify-ignore}
build the request payload for cancelling multiple orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the raw request object to be sent to the exchange

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No |  |
| params.fast | <code>boolean</code> | No | whether to send the cancel with the fast flag, rejected for trigger orders, (default is false) |


```javascript
hyperliquid.cancelOrdersRequest (ids, symbol, params?)
```


<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

### cancelOrdersForSymbols{docsify-ignore}
cancel multiple orders for multiple symbols

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.fast | <code>boolean</code> | No | whether to send the cancel with the fast flag, rejected for trigger orders, prioritized in the mempool in a future network upgrade, (default is false) |


```javascript
hyperliquid.cancelOrdersForSymbols (orders, params?)
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the api result


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.cancelAllOrdersAfter (timeout, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address for order |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.editOrder (id, symbol, type, side, amount, price?, params?)
```


<a name="editOrders" id="editorders"></a>

### editOrders{docsify-ignore}
edit a list of trade orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.editOrders (orders, params?)
```


<a name="createVault" id="createvault"></a>

### createVault{docsify-ignore}
creates a value

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the api result


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | The name of the vault |
| description | <code>string</code> | Yes | The description of the vault |
| initialUsd | <code>number</code> | Yes | The initialUsd of the vault |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.createVault (name, description, initialUsd, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |


```javascript
hyperliquid.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.method | <code>string</code> | No | 'openOrders' or 'frontendOpenOrders' default is 'frontendOpenOrders' |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.dex | <code>string</code> | No | perp dex name. default is null |


```javascript
hyperliquid.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetch all unfilled currently closed orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetch all canceled orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchCanceledOrders (symbol, since?, limit?, params?)
```


<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

### fetchCanceledAndClosedOrders{docsify-ignore}
fetch all closed and canceled orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchCanceledAndClosedOrders (symbol, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetch all orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.dex | <code>string</code> | No | perp dex name. default is null |


```javascript
hyperliquid.fetchOrders (symbol, since?, limit?, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchOrder (id, symbol, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest trade |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.twap | <code>boolean</code> | No | set to true to fetch the fills of twap orders instead, the exchange returns the 2000 most recent ones and ignores since and until |


```javascript
hyperliquid.fetchMyTrades (symbol, since?, limit?, params?)
```


<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

### fetchMyLiquidations{docsify-ignore}
retrieves the users liquidated positions

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchMyLiquidations (symbol?, since?, limit?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchPosition (symbol, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.dex | <code>string</code> | No | perp dex name, eg: XYZ |


```javascript
hyperliquid.fetchPositions (symbols?, params?)
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode (symbol)

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | margin mode must be either [isolated, cross] |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.leverage | <code>string</code> | No | the rate of leverage, is required if setting trade mode (symbol) |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.setMarginMode (marginMode, symbol, params?)
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/?id=leverage-tiers-structure), indexed by market symbols

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
- https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margin-tiers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols, all symbols must belong to the same dex for hip3 markets |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.dex | <code>string</code> | No | the hip3 dex to fetch the tiers from, inferred from the symbols when omitted |


```javascript
hyperliquid.fetchLeverageTiers (symbols?, params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage and margin mode for a swap market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchLeverage (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | margin mode must be either [isolated, cross], default is cross |


```javascript
hyperliquid.setLeverage (leverage, symbol, params?)
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.addMargin (symbol, amount, params?)
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault address |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.reduceMargin (symbol, amount, params?)
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-between-sub-accounts
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from *spot, swap, main or a sub-account address* |
| toAccount | <code>string</code> | Yes | account to transfer to *swap, spot, main or a sub-account address* |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | spot <> swap only, moves the balance inside this vault or sub-account instead of the main account |
| params.type | <code>string</code> | No | main <> sub-account only, 'spot' moves the spot ledger instead of the perp ledger |
| params.method | <code>string</code> | No | main <> sub-account only, 'sendAsset' forces the unified-account route, 'subAccountTransfer' forces the legacy sub-account actions; defaults to sendAsset when the account abstraction is unifiedAccount |
| params.enableUnifiedMargin | <code>boolean</code> | No | main <> sub-account only, skips the abstraction lookup and states whether the account is unified |
| params.sourceDex | <code>string</code> | No | sendAsset only, perp dex to move from, '' for the default USDC perp dex or 'spot', defaults to 'spot' |
| params.destinationDex | <code>string</code> | No | sendAsset only, perp dex to move to, '' for the default USDC perp dex or 'spot', defaults to 'spot' |
| params.user | <code>string</code> | No | sendAsset only, the master wallet address, defaults to walletAddress |


```javascript
hyperliquid.transfer (code, amount, fromAccount, toAccount, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal (only support USDC)

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.tag | <code>string</code> | No | memo / destination tag, required for currencies in options['withdrawTagRequiredCurrencies'] |
| params.vaultAddress | <code>string</code> | No | vault address withdraw from |


```javascript
hyperliquid.withdraw (code, amount, address, params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchTradingFee (symbol, params?)
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchLedger (code?, since?, limit?, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch withdrawals for |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.vaultAddress | <code>string</code> | No | vault address |


```javascript
hyperliquid.fetchDeposits (code, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch withdrawals for |
| params.subAccountAddress | <code>string</code> | No | sub account user address |
| params.vaultAddress | <code>string</code> | No | vault address |


```javascript
hyperliquid.fetchWithdrawals (code, since?, limit?, params?)
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |
| params.dex | <code>string</code> | No | perp dex name for hip3 markets, eg: 'xyz', inferred from the symbols if not provided |


```javascript
hyperliquid.fetchOpenInterests (symbols?, params?)
```


<a name="fetchOpenInterest" id="fetchopeninterest"></a>

### fetchOpenInterest{docsify-ignore}
retrieves the open interest of a contract trading pair

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [open interest structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
hyperliquid.fetchOpenInterest (symbol, params?)
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subAccountAddress | <code>string</code> | No | sub account user address |


```javascript
hyperliquid.fetchFundingHistory (symbol?, since?, limit?, params?)
```


<a name="reserveRequestWeight" id="reserverequestweight"></a>

### reserveRequestWeight{docsify-ignore}
Instead of trading to increase the address based rate limits, this action allows reserving additional actions for 0.0005 USDC per request. The cost is paid from the Perps balance.

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| weight | <code>number</code> | Yes | the weight to reserve, 1 weight = 1 action, 0.0005 USDC per action |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.reserveRequestWeight (weight, params?)
```


<a name="approveAgent" id="approveagent"></a>

### approveAgent{docsify-ignore}
approves an API wallet (agent) that can trade on behalf of the account but can not withdraw, the request must be signed with the private key of the main wallet, not with the one of an API wallet

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**

- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| agentAddress | <code>string</code> | Yes | the address of the API wallet to approve |
| agentName | <code>string</code> | No | the name of the API wallet, an account has a single unnamed API wallet, which is replaced when another unnamed one is approved, and up to 3 named ones, append ' valid_until <timestamp in ms>' to the name to set an expiration of at most 180 days |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.approveAgent (agentAddress, agentName?, params?)
```


<a name="noop" id="noop"></a>

### noop{docsify-ignore}
sends an action that does nothing but marks the nonce as used, which invalidates a pending request sent with the same nonce, it can be a more effective way to cancel in-flight orders than a cancel

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| nonce | <code>int</code> | No | the nonce to mark as used, a new one is generated when omitted |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.vaultAddress | <code>string</code> | No | the vault or sub-account address to send the action for |


```javascript
hyperliquid.noop (nonce?, params?)
```


<a name="claimRewards" id="claimrewards"></a>

### claimRewards{docsify-ignore}
claims the rewards earned by the account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#claim-rewards  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.claimRewards (params?)
```


<a name="usdSend" id="usdsend"></a>

### usdSend{docsify-ignore}
sends USDC from the perp balance to another address on hyperliquid, it does not go through the EVM bridge, the request must be signed with the private key of the main wallet

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| amount | <code>float</code> | Yes | the amount of USDC to send |
| address | <code>string</code> | Yes | the address to send to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.usdSend (amount, address, params?)
```


<a name="spotSend" id="spotsend"></a>

### spotSend{docsify-ignore}
sends a spot asset to another address on hyperliquid, it does not go through the EVM bridge, the request must be signed with the private key of the main wallet

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the asset to send |
| amount | <code>float</code> | Yes | the amount to send |
| address | <code>string</code> | Yes | the address to send to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.spotSend (code, amount, address, params?)
```


<a name="stakingDeposit" id="stakingdeposit"></a>

### stakingDeposit{docsify-ignore}
moves HYPE from the spot balance into the staking balance, where it can be delegated to validators or used to pay priority fees, the request must be signed with the private key of the main wallet

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| amount | <code>float</code> | Yes | the amount of HYPE to move into staking |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.stakingDeposit (amount, params?)
```


<a name="stakingWithdraw" id="stakingwithdraw"></a>

### stakingWithdraw{docsify-ignore}
moves HYPE from the staking balance back to the spot balance, the amount goes through a 7 day unstaking queue, the request must be signed with the private key of the main wallet

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| amount | <code>float</code> | Yes | the amount of HYPE to move out of staking |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.stakingWithdraw (amount, params?)
```


<a name="tokenDelegate" id="tokendelegate"></a>

### tokenDelegate{docsify-ignore}
delegates HYPE of the staking balance to a validator, or undelegates it, a delegation is locked for 1 day, the request must be signed with the private key of the main wallet

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| validator | <code>string</code> | Yes | the address of the validator |
| amount | <code>float</code> | Yes | the amount of HYPE to delegate or undelegate |
| isUndelegate | <code>boolean</code> | No | true to undelegate, false (default) to delegate |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.tokenDelegate (validator, amount, isUndelegate?, params?)
```


<a name="fetchApprovedBuilders" id="fetchapprovedbuilders"></a>

### fetchApprovedBuilders{docsify-ignore}
fetch the addresses of the builders the user approved a builder fee for

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;string&gt;</code> - a list of builder addresses

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-approved-builders-for-user  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchApprovedBuilders (params?)
```


<a name="fetchVaultDetails" id="fetchvaultdetails"></a>

### fetchVaultDetails{docsify-ignore}
fetch the details of a vault, its leader, description, portfolio history, apr and followers

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the vault details as returned by the exchange

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| vaultAddress | <code>string</code> | Yes | the address of the vault |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | a user address, when provided the response includes the state of that user as a follower of the vault |


```javascript
hyperliquid.fetchVaultDetails (vaultAddress, params?)
```


<a name="fetchStakingDelegations" id="fetchstakingdelegations"></a>

### fetchStakingDelegations{docsify-ignore}
fetch the amounts of HYPE the user delegated to each validator

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of delegations as returned by the exchange

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchStakingDelegations (params?)
```


<a name="fetchStakingSummary" id="fetchstakingsummary"></a>

### fetchStakingSummary{docsify-ignore}
fetch the staking balances of the user, the undelegated amount is the one priority fees are paid from

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the staking summary as returned by the exchange

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchStakingSummary (params?)
```


<a name="fetchStakingHistory" id="fetchstakinghistory"></a>

### fetchStakingHistory{docsify-ignore}
fetch the history of the staking deposits, withdrawals, delegations and undelegations of the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of staking events as returned by the exchange

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchStakingHistory (params?)
```


<a name="fetchStakingRewards" id="fetchstakingrewards"></a>

### fetchStakingRewards{docsify-ignore}
fetch the staking rewards earned by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of staking rewards as returned by the exchange

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchStakingRewards (params?)
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch the sub-accounts of a master account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [account structures](https://docs.ccxt.com/?id=account-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | the master account address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchAccounts (params?)
```


<a name="fetchCrossBorrowRates" id="fetchcrossborrowrates"></a>

### fetchCrossBorrowRates{docsify-ignore}
fetch the borrow interest rates of all currencies of the borrow/lend protocol

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a list of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-all-borrow-lend-reserve-states  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchCrossBorrowRates (params?)
```


<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

### fetchCrossBorrowRate{docsify-ignore}
fetch the borrow interest rate of a currency of the borrow/lend protocol

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/?id=borrow-rate-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-reserve-state  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.fetchCrossBorrowRate (code, params?)
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for the currencies borrowed from the borrow/lend protocol

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/?id=borrow-interest-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | not used by hyperliquid fetchBorrowInterest |
| since | <code>int</code> | No | not used by hyperliquid fetchBorrowInterest, the exchange returns the current state only |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.fetchBorrowInterest (code?, symbol?, since?, limit?, params?)
```


<a name="createSubAccount" id="createsubaccount"></a>

### createSubAccount{docsify-ignore}
creates a sub-account under the main account

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | the name of the sub-account |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiresAfter | <code>int</code> | No | time in ms after which the sub-account will expire |


```javascript
hyperliquid.createSubAccount (name, params?)
```


<a name="createOrdersWs" id="createordersws"></a>

### createOrdersWs{docsify-ignore}
create a list of trade orders using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.createOrdersWs (orders, params?)
```


<a name="createOrderWs" id="createorderws"></a>

### createOrderWs{docsify-ignore}
create a trade order using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.slippage | <code>string</code> | No | the slippage for market order |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.createOrderWs (symbol, type, side, amount, price?, params?)
```


<a name="editOrderWs" id="editorderws"></a>

### editOrderWs{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | 'Gtc', 'Ioc', 'Alo' |
| params.postOnly | <code>bool</code> | No | true or false whether the order is post-only |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.clientOrderId | <code>string</code> | No | client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef) |
| params.vaultAddress | <code>string</code> | No | the vault address for order |


```javascript
hyperliquid.editOrderWs (id, symbol, type, side, amount, price?, params?)
```


<a name="cancelOrdersWs" id="cancelordersws"></a>

### cancelOrdersWs{docsify-ignore}
cancel multiple orders using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | list of order ids to cancel |
| symbol | <code>string</code> | Yes | unified symbol of the market the orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>Array&lt;string&gt;</code> | No | list of client order ids to cancel instead of order ids |
| params.vaultAddress | <code>string</code> | No | the vault address for order cancellation |


```javascript
hyperliquid.cancelOrdersWs (ids, symbol, params?)
```


<a name="cancelOrderWs" id="cancelorderws"></a>

### cancelOrderWs{docsify-ignore}
cancel a single order using WebSocket post request

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id to cancel |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id to cancel instead of order id |
| params.vaultAddress | <code>string</code> | No | the vault address for order cancellation |


```javascript
hyperliquid.cancelOrderWs (id, symbol, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchOrderBook (symbol, limit?, params?)
```


<a name="unWatchOrderBook" id="unwatchorderbook"></a>

### unWatchOrderBook{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchOrderBook (symbol, params?)
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches the best bid & ask of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | a list with a single unified symbol, the stream is per market so the method must be called once for each symbol to watch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchBidsAsks (symbols, params?)
```


<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

### unWatchBidsAsks{docsify-ignore}
unWatches the best bid & ask of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - the exchange response

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | a list with a single unified symbol, the stream is per market so the method must be called once for each symbol to unwatch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchBidsAsks (symbols, params?)
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchTicker (symbol, params?)
```


<a name="unWatchTicker" id="unwatchticker"></a>

### unWatchTicker{docsify-ignore}
unWatches the price ticker stream of a specific market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>any</code> - status of the unwatch request

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to stop watching the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchTicker (symbol, params?)
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.dex | <code>string</code> | No | for hip3 tokens subscription, eg: 'xyz' or 'flx`, if symbols are provided we will infer it from the first symbol's market |


```javascript
hyperliquid.watchTickers (symbols, params?)
```


<a name="unWatchTickers" id="unwatchtickers"></a>

### unWatchTickers{docsify-ignore}
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchTickers (symbols, params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.watchMyTrades (symbol, since?, limit?, params?)
```


<a name="watchMyLiquidations" id="watchmyliquidations"></a>

### watchMyLiquidations{docsify-ignore}
watch the private liquidations of a trading pair

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.watchMyLiquidations (symbol, since?, limit?, params?)
```


<a name="watchMyLiquidationsForSymbols" id="watchmyliquidationsforsymbols"></a>

### watchMyLiquidationsForSymbols{docsify-ignore}
watch the private liquidations of a list of trading pairs

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.watchMyLiquidationsForSymbols (symbols, since?, limit?, params?)
```


<a name="unWatchMyTrades" id="unwatchmytrades"></a>

### unWatchMyTrades{docsify-ignore}
unWatches information on multiple trades made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.unWatchMyTrades (symbol, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchTrades (symbol, since?, limit?, params?)
```


<a name="unWatchTrades" id="unwatchtrades"></a>

### unWatchTrades{docsify-ignore}
unWatches information on multiple trades made in a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchTrades (symbol, params?)
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.watchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="unWatchOHLCV" id="unwatchohlcv"></a>

### unWatchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, close price, and the volume of a market

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchOHLCV (symbol, timeframe, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.dex | <code>string</code> | No | for hip3 tokens subscription, eg: 'xyz' or 'flx' |


```javascript
hyperliquid.watchBalance (params?)
```


<a name="unWatchBalance" id="unwatchbalance"></a>

### unWatchBalance{docsify-ignore}
unWatches balance

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - status of the unwatch request

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchBalance (params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.dex | <code>string</code> | No | for hip3 tokens subscription, eg: 'xyz' or 'flx`, if symbols are provided we will infer it from the first symbol's market |


```javascript
hyperliquid.watchPositions (symbols?, since?, limit?, params)
```


<a name="unWatchPositions" id="unwatchpositions"></a>

### unWatchPositions{docsify-ignore}
unWatches all open positions

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>object</code> - status of the unwatch request

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
hyperliquid.unWatchPositions (symbols?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.watchOrders (symbol, since?, limit?, params?)
```


<a name="unWatchOrders" id="unwatchorders"></a>

### unWatchOrders{docsify-ignore}
unWatches information on multiple orders made by the user

**Kind**: instance method of [<code>hyperliquid</code>](#hyperliquid)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.user | <code>string</code> | No | user address, will default to this.walletAddress if not provided |


```javascript
hyperliquid.unWatchOrders (symbol, params?)
```

