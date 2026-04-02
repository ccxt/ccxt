
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
* [fetchContractDepositAddress](#fetchcontractdepositaddress)
* [fetchDepositAddressesByNetwork](#fetchdepositaddressesbynetwork)
* [fetchOrderBook](#fetchorderbook)
* [createOrder](#createorder)
* [createSpotOrder](#createspotorder)
* [createContractOrder](#createcontractorder)
* [createUtaOrder](#createutaorder)
* [createMarketOrderWithCost](#createmarketorderwithcost)
* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createMarketSellOrderWithCost](#createmarketsellorderwithcost)
* [createOrders](#createorders)
* [createSpotOrders](#createspotorders)
* [createContractOrders](#createcontractorders)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelSpotOrder](#cancelspotorder)
* [cancelContractOrder](#cancelcontractorder)
* [cancelUtaOrder](#cancelutaorder)
* [cancelAllOrders](#cancelallorders)
* [cancelAllSpotOrders](#cancelallspotorders)
* [cancelAllContractOrders](#cancelallcontractorders)
* [cancelAllUtaOrders](#cancelallutaorders)
* [fetchOrdersByStatus](#fetchordersbystatus)
* [fetchSpotOrdersByStatus](#fetchspotordersbystatus)
* [fetchContractOrdersByStatus](#fetchcontractordersbystatus)
* [fetchUtaOrdersByStatus](#fetchutaordersbystatus)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrder](#fetchorder)
* [fetchSpotOrder](#fetchspotorder)
* [fetchContractOrder](#fetchcontractorder)
* [fetchUtaOrder](#fetchutaorder)
* [fetchOrderTrades](#fetchordertrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchMySpotTrades](#fetchmyspottrades)
* [fetchMyContractTrades](#fetchmycontracttrades)
* [fetchMyUtaTrades](#fetchmyutatrades)
* [fetchTrades](#fetchtrades)
* [fetchTradingFee](#fetchtradingfee)
* [withdraw](#withdraw)
* [fetchDeposits](#fetchdeposits)
* [fetchContractDeposits](#fetchcontractdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchContractWithdrawals](#fetchcontractwithdrawals)
* [fetchBalance](#fetchbalance)
* [fetchContractBalance](#fetchcontractbalance)
* [fetchUtaBalance](#fetchutabalance)
* [transfer](#transfer)
* [transferUta](#transferuta)
* [transferClassic](#transferclassic)
* [fetchLedger](#fetchledger)
* [fetchBorrowInterest](#fetchborrowinterest)
* [fetchBorrowRateHistories](#fetchborrowratehistories)
* [fetchBorrowRateHistory](#fetchborrowratehistory)
* [borrowCrossMargin](#borrowcrossmargin)
* [borrowIsolatedMargin](#borrowisolatedmargin)
* [repayCrossMargin](#repaycrossmargin)
* [repayIsolatedMargin](#repayisolatedmargin)
* [fetchDepositWithdrawFees](#fetchdepositwithdrawfees)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [setContractLeverage](#setcontractleverage)
* [fetchFundingInterval](#fetchfundinginterval)
* [fetchFundingRate](#fetchfundingrate)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchPositionsHistory](#fetchpositionshistory)
* [cancelOrders](#cancelorders)
* [addMargin](#addmargin)
* [fetchMarginMode](#fetchmarginmode)
* [setMarginMode](#setmarginmode)
* [setPositionMode](#setpositionmode)
* [fetchPositionMode](#fetchpositionmode)
* [closePosition](#closeposition)
* [fetchMarketLeverageTiers](#fetchmarketleveragetiers)
* [fetchLeverageTiers](#fetchleveragetiers)
* [fetchOpenInterests](#fetchopeninterests)
* [fetchOpenInterestHistory](#fetchopeninteresthistory)
* [isUTAEnabled](#isutaenabled)
* [fetchTransfers](#fetchtransfers)
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
* [watchPosition](#watchposition)

<a name="fetchTime" id="fetchtime"></a>

### fetchTime{docsify-ignore}
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-server-time
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-server-time


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
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-service-status
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-service-status
- https://www.kucoin.com/docs-new/rest/ua/get-service-status


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.tradeType | <code>string</code> | No | *uta only* set to SPOT or FUTURES |


```javascript
kucoin.fetchStatus ([params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for kucoin

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-symbols
- https://www.kucoin.com/docs-new/rest/ua/get-symbol
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


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

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies
- https://www.kucoin.com/docs-new/rest/ua/get-currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchCurrencies (params, [undefined])
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type

**See**: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-list-spot  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchAccounts ([params])
```


<a name="fetchTransactionFee" id="fetchtransactionfee"></a>

### fetchTransactionFee{docsify-ignore}
*DEPRECATED* please use fetchDepositWithdrawFee instead

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

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
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas  

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
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-tickers
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-tickers
- https://www.kucoin.com/docs-new/rest/ua/get-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.type | <code>string</code> | No | spot or swap (default is spot) |
| params.method | <code>string</code> | No | *swap only* the method to use, futuresPublicGetContractsActive or futuresPublicGetAllTickers (default is futuresPublicGetContractsActive) |


```javascript
kucoin.fetchTickers ([symbols, params])
```


<a name="fetchMarkPrices" id="fetchmarkprices"></a>

### fetchMarkPrices{docsify-ignore}
fetches the mark price for multiple markets

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-list  

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
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-24hr-stats
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-ticker
- https://www.kucoin.com/docs-new/rest/ua/get-ticker


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchTicker (symbol[, params])
```


<a name="fetchMarkPrice" id="fetchmarkprice"></a>

### fetchMarkPrice{docsify-ignore}
fetches the mark price for a specific market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-detail
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-mark-price


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

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
- https://www.kucoin.com/docs-new/rest/ua/get-klines


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://www.kucoin.com/docs-new/rest/account-info/deposit/add-deposit-address-v3  

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
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
- https://www.kucoin.com/docs-new/rest/ua/get-deposit-address


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the blockchain network name |
| params.accountType | <code>string</code> | No | 'main', 'contract' or 'uta' (default is 'main') |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) endpoint, defaults to false |


```javascript
kucoin.fetchDepositAddress (code[, params])
```


<a name="fetchContractDepositAddress" id="fetchcontractdepositaddress"></a>

### fetchContractDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)

**See**: https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchContractDepositAddress (code[, params])
```


<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

### fetchDepositAddressesByNetwork{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an array of [address structures](https://docs.ccxt.com/?id=address-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
- https://www.kucoin.com/docs-new/rest/ua/get-deposit-address


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) endpoint, defaults to false |


```javascript
kucoin.fetchDepositAddressesByNetwork (code[, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-part-orderbook
- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-full-orderbook
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-part-orderbook
- https://www.kucoin.com/docs-new/rest/ua/get-orderbook


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchOrderBook (symbol[, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
Create an order on the exchange

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
- https://www.kucoin.com/docs-new/rest/ua/place-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) endpoint, defaults to false Check createSpotOrder(), createContractOrder() and createUtaOrder () for more details on the extra parameters that can be used in params |


```javascript
kucoin.createOrder (symbol, type, side, amount[, price, params])
```


<a name="createSpotOrder" id="createspotorder"></a>

### createSpotOrder{docsify-ignore}
helper method for creating spot orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order


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
| params.postOnly | <code>bool</code> | No | Post only flag, invalid when timeInForce is IOC or FOK EXCHANGE SPECIFIC PARAMETERS |
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
kucoin.createSpotOrder (symbol, type, side, amount[, price, params])
```


<a name="createContractOrder" id="createcontractorder"></a>

### createContractOrder{docsify-ignore}
helper method for creating contract orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType |
| params.triggerPrice | <code>float</code> | No | The price a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop-loss orders |
| params.takeProfitPrice | <code>float</code> | No | price to trigger take-profit orders |
| params.reduceOnly | <code>bool</code> | No | A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true. |
| params.timeInForce | <code>string</code> | No | GTC, GTT, IOC, or FOK, default is GTC, limit orders only |
| params.postOnly | <code>bool</code> | No | Post only flag, invalid when timeInForce is IOC or FOK |
| params.cost | <code>float</code> | No | the cost of the order in units of USDT |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', default is 'isolated' |
| params.hedged | <code>bool</code> | No | *swap and future only* true for hedged mode, false for one way mode, default is false ----------------- Exchange Specific Parameters ----------------- |
| params.leverage | <code>float</code> | No | Leverage size of the order (mandatory param in request, default is 1) |
| params.clientOid | <code>string</code> | No | client order id, defaults to uuid if not passed |
| params.remark | <code>string</code> | No | remark for the order, length cannot exceed 100 utf8 characters |
| params.stop | <code>string</code> | No | 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice. |
| params.triggerPriceType | <code>string</code> | No | "last", "mark", "index" - defaults to "mark" |
| params.stopPriceType | <code>string</code> | No | exchange-specific alternative for triggerPriceType: TP, IP or MP |
| params.closeOrder | <code>bool</code> | No | set to true to close position |
| params.test | <code>bool</code> | No | set to true to use the test order endpoint (does not submit order, use to validate params) |
| params.forceHold | <code>bool</code> | No | A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.\ |
| params.positionSide | <code>string</code> | No | *swap and future only* hedged two-way position side, LONG or SHORT |


```javascript
kucoin.createContractOrder (symbol, type, side, amount[, price, params])
```


<a name="createUtaOrder" id="createutaorder"></a>

### createUtaOrder{docsify-ignore}
helper method for creating uta orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.kucoin.com/docs-new/rest/ua/place-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | the amount of currency to trade |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, defaults to uuid if not passed |
| params.cost | <code>float</code> | No | the cost of the order in units of quote currency |
| params.timeInForce | <code>string</code> | No | GTC, GTD, IOC, FOK or PO |
| params.postOnly | <code>bool</code> | No | Post only flag, invalid when timeInForce is IOC or FOK (default is false) |
| params.reduceOnly | <code>bool</code> | No | *contract markets only* A mark to reduce the position size only. Set to false by default |
| params.triggerPrice | <code>float</code> | No | The price a trigger order is triggered at |
| params.triggerDirection | <code>string</code> | No | 'ascending' or 'descending', the direction the triggerPrice is triggered from, requires triggerPrice |
| params.triggerPriceType | <code>string</code> | No | *contract markets only* "last", "mark", "index" - defaults to "mark" |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop-loss orders |
| params.takeProfitPrice | <code>float</code> | No | price to trigger take-profit orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', (default is 'cross' for margin orders, default is 'isolated' for contract orders) Exchange-specific parameters ------------------------------------------------- |
| params.accountMode | <code>string</code> | No | 'unified' or 'classic', default is 'unified' |
| params.stp | <code>string</code> | No | '', // self trade prevention, CN, CO, CB or DC |
| params.cancelAfter | <code>int</code> | No | Cancel After N Seconds (Calculated from the time of entering the matching engine), only effective when timeInForce is GTD |
| params.sizeUnit | <code>string</code> | No | *contracts only* 'BASECCY' (amount of base currency) or 'UNIT' (number of contracts), default is 'UNIT' Classic account parameters |
| params.autoBorrow | <code>bool</code> | No | *classic margin orders only* |
| params.autoRepay | <code>bool</code> | No | *classic margin orders only* |
| params.hedged | <code>string</code> | No | *classic contract orders only* true for hedged mode, false for one way mode, default is false |
| params.leverage | <code>int</code> | No | *classic contract orders with isolated marginMode only* Leverage size of the order |


```javascript
kucoin.createUtaOrder (symbol, type, side, amount[, price, params])
```


<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

### createMarketOrderWithCost{docsify-ignore}
create a market order by providing the symbol, side and cost

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order


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
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order


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
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order


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
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint Check createSpotOrders() and createContractOrders() for more details on the extra parameters that can be used in params |


```javascript
kucoin.createOrders (orders[, params])
```


<a name="createSpotOrders" id="createspotorders"></a>

### createSpotOrders{docsify-ignore}
helper method for creating spot orders in batch

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hf | <code>bool</code> | No | false, // true for hf orders |
| params.sync | <code>bool</code> | No | false, // true to use the hf sync call |


```javascript
kucoin.createSpotOrders (orders[, params])
```


<a name="createContractOrders" id="createcontractorders"></a>

### createContractOrders{docsify-ignore}
helper method for creating contract orders in batch

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.createContractOrders (orders[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit an order, kucoin currently only supports the modification of HF orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.kucoin.com/docs-new/rest/spot-trading/orders/modify-order  

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

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/ua/cancel-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.marginMode | <code>string</code> | No | *spot only* 'cross' or 'isolated' |
| params.uta | <code>boolean</code> | No | true for cancelling order with unified account endpoint (default is false) Check cancelSpotOrder() and cancelContractOrder() for more details on the extra parameters that can be used in params |


```javascript
kucoin.cancelOrder (id, symbol[, params])
```


<a name="cancelSpotOrder" id="cancelspotorder"></a>

### cancelSpotOrder{docsify-ignore}
helper method for cancelling spot orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | True if cancelling a stop order |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.sync | <code>bool</code> | No | false, // true to use the hf sync call |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |


```javascript
kucoin.cancelSpotOrder (id, symbol[, params])
```


<a name="cancelContractOrder" id="cancelcontractorder"></a>

### cancelContractOrder{docsify-ignore}
helper method for cancelling contract orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | cancel order by client order id |


```javascript
kucoin.cancelContractOrder (id, symbol[, params])
```


<a name="cancelUtaOrder" id="cancelutaorder"></a>

### cancelUtaOrder{docsify-ignore}
helper method for cancelling uta orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**: https://www.kucoin.com/docs-new/rest/ua/cancel-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountMode | <code>string</code> | No | 'unified' or 'classic' (default is 'unified') |
| params.clientOrderId | <code>string</code> | No | client order id, required if id is not provided |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', required if fetching a margin order |


```javascript
kucoin.cancelUtaOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
- https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.marginMode | <code>string</code> | No | *spot only* 'cross' or 'isolated' |
| params.uta | <code>boolean</code> | No | true for cancelling orders with unified account endpoint (default is false) Check cancelAllSpotOrders(), cancelAllContractOrders() and cancelAllUtaOrders() for more details on the extra parameters that can be used in params |


```javascript
kucoin.cancelAllOrders (symbol[, params])
```


<a name="cancelAllSpotOrders" id="cancelallspotorders"></a>

### cancelAllSpotOrders{docsify-ignore}
helper method for cancelling all spot orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | *invalid for isolated margin* true if cancelling all stop orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| params.orderIds | <code>string</code> | No | *stop orders only* Comma separated order IDs |
| params.hf | <code>bool</code> | No | false, // true for hf order |


```javascript
kucoin.cancelAllSpotOrders (symbol[, params])
```


<a name="cancelAllContractOrders" id="cancelallcontractorders"></a>

### cancelAllContractOrders{docsify-ignore}
helper method for cancelling all contract orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>object</code> | No | When true, all the trigger orders will be cancelled |


```javascript
kucoin.cancelAllContractOrders (symbol[, params])
```


<a name="cancelAllUtaOrders" id="cancelallutaorders"></a>

### cancelAllUtaOrders{docsify-ignore}
helper method for cancelling all uta orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: Response from the exchange

**See**: https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-symbol  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>bool</code> | No | true if cancelling all stop orders |
| params.marginMode | <code>string</code> | No | 'CROSS' or 'ISOLATED' |


```javascript
kucoin.cancelAllUtaOrders (symbol[, params])
```


<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

### fetchOrdersByStatus{docsify-ignore}
fetches a list of orders placed on the exchange

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [array of order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
- https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
- https://www.kucoin.com/docs-new/rest/ua/get-order-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | 'active' or 'closed', only 'active' is valid for stop orders |
| symbol | <code>string</code> | Yes | unified symbol for the market to retrieve orders from |
| since | <code>int</code> | No | timestamp in ms of the earliest order to retrieve |
| limit | <code>int</code> | No | The maximum number of orders to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.uta | <code>boolean</code> | No | true for fetch orders with uta endpoint (default is false) Check fetchSpotOrdersByStatus(), fetchContractOrdersByStatus() and fetchUtaOrdersByStatus() for more details on the extra parameters that can be used in params |


```javascript
kucoin.fetchOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchSpotOrdersByStatus" id="fetchspotordersbystatus"></a>

### fetchSpotOrdersByStatus{docsify-ignore}
fetch a list of spot orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [array of order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list


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
| params.tradeType | <code>string</code> | No | TRADE for spot trading, MARGIN_TRADE or MARGIN_ISOLATED_TRADE for Margin Trading |
| params.currentPage | <code>int</code> | No | *trigger orders only* current page |
| params.orderIds | <code>string</code> | No | *trigger orders only* comma separated order ID list |
| params.trigger | <code>bool</code> | No | True if fetching a trigger order |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', only for margin orders |


```javascript
kucoin.fetchSpotOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchContractOrdersByStatus" id="fetchcontractordersbystatus"></a>

### fetchContractOrdersByStatus{docsify-ignore}
fetches a list of contract orders placed on the exchange

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [array of order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | 'active' or 'closed', only 'active' is valid for stop orders |
| symbol | <code>string</code> | Yes | unified symbol for the market to retrieve orders from |
| since | <code>int</code> | No | timestamp in ms of the earliest order to retrieve |
| limit | <code>int</code> | No | The maximum number of orders to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.trigger | <code>bool</code> | No | set to true to retrieve untriggered stop orders |
| params.until | <code>int</code> | No | End time in ms |
| params.side | <code>string</code> | No | buy or sell |
| params.type | <code>string</code> | No | limit or market |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchContractOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchUtaOrdersByStatus" id="fetchutaordersbystatus"></a>

### fetchUtaOrdersByStatus{docsify-ignore}
helper method for fetching orders by status with uta endpoint

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [array of order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/ua/get-open-order-list
- https://www.kucoin.com/docs-new/rest/ua/get-order-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | 'active' or 'closed', only 'active' is valid for stop orders |
| symbol | <code>string</code> | Yes | unified symbol for the market to retrieve orders from |
| since | <code>int</code> | No | timestamp in ms of the earliest order to retrieve |
| limit | <code>int</code> | No | The maximum number of orders to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.until | <code>int</code> | No | End time in ms |
| params.side | <code>string</code> | No | *closed orders only* 'BUY' or 'SELL' |
| params.accountMode | <code>string</code> | No | 'unified' or 'classic' (default is unified) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchUtaOrdersByStatus (status, symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/ua/get-order-history


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
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
- https://www.kucoin.com/docs-new/rest/ua/get-open-order-list


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
| params.orderIds | <code>string</code> | No | *trigger orders only* comma separated order ID list |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
- https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/ua/get-order-details


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.uta | <code>bool</code> | No | true if fetching an order with uta endpoint (default is false) Check fetchSpotOrder(), fetchContractOrder() and fetchUtaOrder() for more details on the extra parameters that can be used in params |


```javascript
kucoin.fetchOrder (id, symbol[, params])
```


<a name="fetchSpotOrder" id="fetchspotorder"></a>

### fetchSpotOrder{docsify-ignore}
fetch a spot order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | Order id |
| symbol | <code>string</code> | Yes | not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter |
| params | <code>object</code> | No | exchange specific parameters |
| params.trigger | <code>bool</code> | No | true if fetching a trigger order |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.clientOid | <code>bool</code> | No | unique order id created by users to identify their orders |
| params.marginMode | <code>object</code> | No | 'cross' or 'isolated' |


```javascript
kucoin.fetchSpotOrder (id, symbol[, params])
```


<a name="fetchContractOrder" id="fetchcontractorder"></a>

### fetchContractOrder{docsify-ignore}
fetc contract order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
- https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchContractOrder (id, symbol[, params])
```


<a name="fetchUtaOrder" id="fetchutaorder"></a>

### fetchUtaOrder{docsify-ignore}
fetch uta order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://www.kucoin.com/docs-new/rest/ua/get-order-details  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountMode | <code>string</code> | No | 'unified' or 'classic' (default is 'unified') |
| params.clientOrderId | <code>string</code> | No | client order id, required if id is not provided |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', required if fetching a margin order |


```javascript
kucoin.fetchUtaOrder (id, symbol[, params])
```


<a name="fetchOrderTrades" id="fetchordertrades"></a>

### fetchOrderTrades{docsify-ignore}
fetch all the trades made from a single order

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://docs.kucoin.com/#list-fills
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
- https://www.kucoin.com/docs-new/rest/ua/get-trade-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') |
| params.uta | <code>boolean</code> | No | set to true if fetching trades from uta endpoint, default is false. |


```javascript
kucoin.fetchOrderTrades (id, symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
- https://www.kucoin.com/docs-new/rest/ua/get-trade-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.type | <code>string</code> | No | 'spot' or 'swap', used if symbol is not provided (default is 'spot') Check fetchMySpotTrades() and fetchMyContractTrades() for more details on the extra parameters that can be used in params |


```javascript
kucoin.fetchMyTrades (symbol[, since, limit, params])
```


<a name="fetchMySpotTrades" id="fetchmyspottrades"></a>

### fetchMySpotTrades{docsify-ignore}
fetch all spot trades made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
- https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.hf | <code>bool</code> | No | false, // true for hf order |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', only for margin trades |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchMySpotTrades (symbol[, since, limit, params])
```


<a name="fetchMyContractTrades" id="fetchmycontracttrades"></a>

### fetchMyContractTrades{docsify-ignore}
fetch all contract trades made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | End time in ms |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchMyContractTrades (symbol[, since, limit, params])
```


<a name="fetchMyUtaTrades" id="fetchmyutatrades"></a>

### fetchMyUtaTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://www.kucoin.com/docs-new/rest/ua/get-trade-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve (default is 50, max is 200) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.accountMode | <code>string</code> | No | 'unified' or 'classic', defaults to 'unified' |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', only for margin trades |
| params.side | <code>string</code> | No | 'BUY' or 'SELL' (both if not provided) |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchMyUtaTrades (symbol[, since, limit, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-trade-history
- https://www.kucoin.com/docs-new/rest/ua/get-trades
- https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-trade-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-spot-margin
- https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-futures
- https://www.kucoin.com/docs-new/rest/ua/get-actual-fee


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) endpoint, defaults to false |


```javascript
kucoin.fetchTradingFee (symbol[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://www.kucoin.com/docs-new/rest/account-info/withdrawals/withdraw-v3  

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
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-history
- https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-list
- https://www.kucoin.com/docs/rest/funding/deposit/get-v1-historical-deposits-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.accountType | <code>string</code> | No | 'main' or 'contract' (default is 'main') |


```javascript
kucoin.fetchDeposits (code[, since, limit, params])
```


<a name="fetchContractDeposits" id="fetchcontractdeposits"></a>

### fetchContractDeposits{docsify-ignore}
helper method for fetching deposits for futures accounts

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchContractDeposits (code[, since, limit, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-history
- https://www.kucoin.com/docs/rest/funding/withdrawals/get-withdrawals-list
- https://www.kucoin.com/docs/rest/funding/withdrawals/get-v1-historical-withdrawals-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.accountType | <code>string</code> | No | 'main' or 'contract' (default is 'main') |


```javascript
kucoin.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchContractWithdrawals" id="fetchcontractwithdrawals"></a>

### fetchContractWithdrawals{docsify-ignore}
helper method for fetching withdrawals for futures accounts

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchContractWithdrawals (code[, since, limit, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-detail-spot
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
- https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
- https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>object</code> | No | 'cross' or 'isolated', margin type for fetching margin balance |
| params.type | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hf | <code>object</code> | No | *default if false* if true, the result includes the balance of the high frequency account |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) endpoint, defaults to false |


```javascript
kucoin.fetchBalance ([params])
```


<a name="fetchContractBalance" id="fetchcontractbalance"></a>

### fetchContractBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.code | <code>object</code> | No | the unified currency code to fetch the balance for, if not provided, the default .options['fetchBalance']['code'] will be used |


```javascript
kucoin.fetchContractBalance ([params])
```


<a name="fetchUtaBalance" id="fetchutabalance"></a>

### fetchUtaBalance{docsify-ignore}
helper method for fetching balance with unified trading account (uta) endpoint

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-uta
- https://www.kucoin.com/docs-new/rest/ua/get-account-currency-assets-classic


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot', 'unified', 'funding', 'cross', 'isolated' or 'swap' (default is 'spot') |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated', margin type for fetching margin balance, only applicable if type is margin (default is cross) |


```javascript
kucoin.fetchUtaBalance ([params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&
- https://www.kucoin.com/docs-new/rest/ua/flex-transfer


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) endpoint, defaults to false Check transferClassic() and transferUta() for more details on params |


```javascript
kucoin.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="transferUta" id="transferuta"></a>

### transferUta{docsify-ignore}
transfer currency internally between wallets on the same account with uta endpoint

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://www.kucoin.com/docs-new/rest/ua/flex-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.transferType | <code>string</code> | No | INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT, SUB_TO_SUB (default is INTERNAL) |
| params.fromUserId | <code>string</code> | No | required if transferType is SUB_TO_PARENT or SUB_TO_SUB |
| params.toUserId | <code>string</code> | No | required if transferType is PARENT_TO_SUB or SUB_TO_SUB |


```javascript
kucoin.transferUta (code, amount, fromAccount, toAccount[, params])
```


<a name="transferClassic" id="transferclassic"></a>

### transferClassic{docsify-ignore}
transfer currency internally between wallets on the same account with classic endpoints

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.transferType | <code>string</code> | No | INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT (default is INTERNAL) |
| params.fromUserId | <code>string</code> | No | required if transferType is SUB_TO_PARENT |
| params.toUserId | <code>string</code> | No | required if transferType is PARENT_TO_SUB |


```javascript
kucoin.transferClassic (code, amount, fromAccount, toAccount[, params])
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-tradehf
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-marginhf
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-futures
- https://www.kucoin.com/docs-new/rest/ua/get-account-ledger


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry, default is undefined |
| limit | <code>int</code> | No | max number of ledger entries to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hf | <code>boolean</code> | No | default false, when true will fetch ledger entries for the high frequency trading account |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.uta | <code>boolean</code> | No | default false, when true will fetch ledger entries for the unified trading account (UTA) instead of the regular accounts endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchLedger ([code, since, limit, params])
```


<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

### fetchBorrowInterest{docsify-ignore}
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/?id=borrow-interest-structure)

**See**

- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
- https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin


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
**Returns**: <code>object</code> - a dictionary of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure) indexed by the market symbol

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history  

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
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure)

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure) to retrieve |
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
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow  

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
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow  

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
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay  

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
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)

**See**: https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay  

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
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/?id=fee-structure)

**See**: https://docs.kucoin.com/#get-currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchDepositWithdrawFees (codes[, params])
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-cross-margin-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchLeverage (symbol[, params])
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.kucoin.com/docs-new/rest/margin-trading/debit/modify-leverage
- https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
- https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>int</code> | No | New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | *contract markets only* set to true for the unified trading account (uta) |


```javascript
kucoin.setLeverage ([leverage, symbol, params])
```


<a name="setContractLeverage" id="setcontractleverage"></a>

### setContractLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
- https://www.kucoin.com/docs-new/rest/ua/modify-leverage-uta


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) |


```javascript
kucoin.setContractLeverage (leverage, symbol[, params])
```


<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

### fetchFundingInterval{docsify-ignore}
fetch the current funding rate interval

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchFundingInterval (symbol[, params])
```


<a name="fetchFundingRate" id="fetchfundingrate"></a>

### fetchFundingRate{docsify-ignore}
fetch the current funding rate

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**

- https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
- https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta) |


```javascript
kucoin.fetchFundingRate (symbol[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-public-funding-history
- https://www.kucoin.com/docs-new/rest/ua/get-history-funding-rate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | not used by kucuoinfutures |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | end time in ms |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to true |


```javascript
kucoin.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-private-funding-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchFundingHistory (symbol[, since, limit, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-details
- https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
- https://www.kucoin.com/docs-new/rest/ua/get-position-list-uta


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchPositions (symbols[, params])
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetches historical positions

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-positions-history
- https://www.kucoin.com/docs-new/rest/ua/get-position-history-uta


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch position history for |
| limit | <code>int</code> | No | the maximum number of entries to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | closing end time |
| params.pageId | <code>int</code> | No | page id |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |


```javascript
kucoin.fetchPositionsHistory ([symbols, since, limit, params])
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders for contract markets

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/3470241e0
- https://www.kucoin.com/docs-new/rest/ua/batch-cancel-order-by-id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids |
| params.uta | <code>boolean</code> | No | set to true to use the unified trading account (uta) endpoint, defaults to false for the contract orders |
| params.accountMode | <code>string</code> | No | *for uta endpoint only* 'unified' or 'classic' (default is 'unified') |
| params.marginMode | <code>string</code> | No | *for margin orders only* 'cross' or 'isolated' |


```javascript
kucoin.cancelOrders (ids, symbol[, params])
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/add-isolated-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.positionSide | <code>string</code> | No | *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH') |


```javascript
kucoin.addMargin (symbol, amount[, params])
```


<a name="fetchMarginMode" id="fetchmarginmode"></a>

### fetchMarginMode{docsify-ignore}
fetches the margin mode of a trading pair

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-margin-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the margin mode for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchMarginMode (symbol[, params])
```


<a name="setMarginMode" id="setmarginmode"></a>

### setMarginMode{docsify-ignore}
set margin mode to 'cross' or 'isolated'

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-margin-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.setMarginMode (marginMode, symbol[, params])
```


<a name="setPositionMode" id="setpositionmode"></a>

### setPositionMode{docsify-ignore}
set hedged to true or false for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a response from the exchange

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use two way position |
| symbol | <code>string</code> | No | not used by bybit setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.setPositionMode (hedged[, symbol, params])
```


<a name="fetchPositionMode" id="fetchpositionmode"></a>

### fetchPositionMode{docsify-ignore}
fetchs the position mode, hedged or one way

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchPositionMode ([symbol, params])
```


<a name="closePosition" id="closeposition"></a>

### closePosition{docsify-ignore}
closes open positions for a market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - [A list of position structures](https://docs.ccxt.com/?id=position-structure)

**See**

- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
- https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | Yes | not used by kucoin closePositions |
| params | <code>object</code> | No | extra parameters specific to the okx api endpoint |
| params.clientOrderId | <code>string</code> | No | client order id of the order |


```javascript
kucoin.closePosition (symbol, side[, params])
```


<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

### fetchMarketLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/?id=leverage-tiers-structure)

**See**: https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-isolated-margin-risk-limit  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true to fetch leverage tiers for unified trading account instead of futures account (default is false) |


```javascript
kucoin.fetchMarketLeverageTiers (symbol[, params])
```


<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

### fetchLeverageTiers{docsify-ignore}
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/?id=leverage-tiers-structure), indexed by market symbols

**See**: https://www.kucoin.com/docs-new/rest/ua/get-position-tiers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.fetchLeverageTiers (symbols[, params])
```


<a name="fetchOpenInterests" id="fetchopeninterests"></a>

### fetchOpenInterests{docsify-ignore}
Retrieves the open interest for a list of symbols

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | Unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |


```javascript
kucoin.fetchOpenInterests ([symbols, params])
```


<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

### fetchOpenInterestHistory{docsify-ignore}
Retrieves the open interest history of a currency

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - an array of [open interest structures](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://www.kucoin.com/docs-new/rest/ua/get-futures-open-interset  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| timeframe | <code>string</code> | Yes | '5m', '15m', '30m', '1h', '4h' or '1d' |
| since | <code>int</code> | No | the time(ms) of the earliest record to retrieve as a unix timestamp |
| limit | <code>int</code> | No | default 30，max 200 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchOpenInterestHistory (symbol, timeframe[, since, limit, params])
```


<a name="isUTAEnabled" id="isutaenabled"></a>

### isUTAEnabled{docsify-ignore}
returns true or false so the user can check if unified account is enabled

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>boolean</code> - true if unified account is enabled, false otherwise

**See**: https://www.kucoin.com/docs-new/rest/ua/get-account-mode  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.isUTAEnabled ([params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
kucoin.fetchTransfers ([code, since, limit, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/3470063w0
- https://www.kucoin.com/docs-new/3470081w0


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
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/3470063w0
- https://www.kucoin.com/docs-new/3470081w0


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
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/3470063w0
- https://www.kucoin.com/docs-new/3470064w0
- https://www.kucoin.com/docs-new/3470081w0


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | *spot markets only* either '/market/snapshot' or '/market/ticker' default is '/market/ticker' |


```javascript
kucoin.watchTickers (symbols[, params])
```


<a name="watchBidsAsks" id="watchbidsasks"></a>

### watchBidsAsks{docsify-ignore}
watches best bid & ask for symbols

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**

- https://www.kucoin.com/docs-new/3470067w0
- https://www.kucoin.com/docs-new/3470080w0


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

**See**

- https://www.kucoin.com/docs-new/3470071w0
- https://www.kucoin.com/docs-new/3470086w0


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

**See**

- https://www.kucoin.com/docs-new/3470071w0
- https://www.kucoin.com/docs-new/3470086w0


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
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.kucoin.com/docs-new/3470072w0
- https://www.kucoin.com/docs-new/3470084w0


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
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.kucoin.com/docs-new/3470072w0
- https://www.kucoin.com/docs-new/3470084w0


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
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.kucoin.com/docs-new/3470072w0
- https://www.kucoin.com/docs-new/3470084w0


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
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**

- https://www.kucoin.com/docs-new/3470072w0
- https://www.kucoin.com/docs-new/3470084w0


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
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

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
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

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
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs-new/3470069w0 // spot level 5
- https://www.kucoin.com/docs-new/3470070w0 // spot level 50
- https://www.kucoin.com/docs-new/3470068w0 // spot incremental
- https://www.kucoin.com/docs-new/3470083w0 // futures level 5
- https://www.kucoin.com/docs-new/3470097w0 // futures level 50
- https://www.kucoin.com/docs-new/3470082w0 // futures incremental


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchOrderBookForSymbols (symbols[, limit, params])
```


<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

### unWatchOrderBookForSymbols{docsify-ignore}
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**

- https://www.kucoin.com/docs-new/3470069w0 // spot level 5
- https://www.kucoin.com/docs-new/3470070w0 // spot level 50
- https://www.kucoin.com/docs-new/3470068w0 // spot incremental
- https://www.kucoin.com/docs-new/3470083w0 // futures level 5
- https://www.kucoin.com/docs-new/3470097w0 // futures level 50
- https://www.kucoin.com/docs-new/3470082w0 // futures incremental


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' or '/contractMarket/level2' or '/contractMarket/level2Depth5' or '/contractMarket/level2Depth50' default is '/market/level2' for spot and '/contractMarket/level2' for futures |


```javascript
kucoin.unWatchOrderBookForSymbols (symbols[, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://www.kucoin.com/docs-new/3470074w0 // spot regular orders
- https://www.kucoin.com/docs-new/3470139w0 // spot trigger orders
- https://www.kucoin.com/docs-new/3470090w0 // contract regular orders
- https://www.kucoin.com/docs-new/3470091w0 // contract trigger orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | trigger orders are watched if true |
| params.type | <code>string</code> | No | 'spot' or 'swap' (default is 'spot' if symbol is not provided) |


```javascript
kucoin.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user on spot

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**

- https://www.kucoin.com/docs-new/3470074w0
- https://www.kucoin.com/docs-new/3470090w0


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | '/spotMarket/tradeOrders' or '/spot/tradeFills' or '/contractMarket/tradeOrders', default is '/spotMarket/tradeOrders' |


```javascript
kucoin.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**

- https://www.kucoin.com/docs-new/3470075w0 // spot balance
- https://www.kucoin.com/docs-new/3470092w0 // contract balance


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'swap' (default is 'spot') |


```javascript
kucoin.watchBalance ([params])
```


<a name="watchPosition" id="watchposition"></a>

### watchPosition{docsify-ignore}
watch open positions for a specific symbol

**Kind**: instance method of [<code>kucoin</code>](#kucoin)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://www.kucoin.com/docs-new/3470093w0  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code>, <code>undefined</code> | unified market symbol |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |


```javascript
kucoin.watchPosition (symbol, params[])
```

