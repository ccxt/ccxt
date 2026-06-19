
<a name="extended" id="extended"></a>

## extended{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTicker](#fetchticker)
* [fetchTickers](#fetchtickers)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchMyTrades](#fetchmytrades)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchOpenInterestHistory](#fetchopeninteresthistory)
* [fetchBalance](#fetchbalance)
* [fetchAccount](#fetchaccount)
* [fetchAccounts](#fetchaccounts)
* [fetchLedger](#fetchledger)
* [fetchTransactions](#fetchtransactions)
* [fetchDeposits](#fetchdeposits)
* [fetchWithdrawals](#fetchwithdrawals)
* [withdraw](#withdraw)
* [fetchTransfers](#fetchtransfers)
* [transfer](#transfer)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchLeverage](#fetchleverage)
* [setLeverage](#setleverage)
* [fetchPositions](#fetchpositions)
* [fetchPosition](#fetchposition)
* [fetchPositionsHistory](#fetchpositionshistory)
* [createOrder](#createorder)
* [editOrder](#editorder)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [cancelAllOrders](#cancelallorders)
* [cancelAllOrdersAfter](#cancelallordersafter)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchOrders](#fetchorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [watchOrderBook](#watchorderbook)
* [watchOrders](#watchorders)
* [watchBalance](#watchbalance)
* [watchMyTrades](#watchmytrades)
* [watchPositions](#watchpositions)
* [watchFundingRate](#watchfundingrate)
* [watchMarkPrice](#watchmarkprice)
* [watchTrades](#watchtrades)
* [watchOHLCV](#watchohlcv)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for extended

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://api.docs.extended.exchange/#get-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchMarkets (params?)
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://api.docs.extended.exchange/#get-assets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchCurrencies (params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://api.docs.extended.exchange/#get-market-statistics  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchTicker (symbol, params?)
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://api.docs.extended.exchange/#get-markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchTickers (symbols?, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://api.docs.extended.exchange/#get-market-order-book  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://api.docs.extended.exchange/#get-market-last-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://api.docs.extended.exchange/#get-trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the trades |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchMyTrades (symbol?, since?, limit?, params?)
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the funding payments history

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;FundingHistory&gt;</code> - a list of [funding history structures](https://docs.ccxt.com/?id=funding-history-structure)

**See**: https://api.docs.extended.exchange/#get-funding-payments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchFundingHistory (symbol?, since?, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://api.docs.extended.exchange/#get-candles-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, default 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.candleType | <code>string</code> | No | candle type: 'trades' (default), 'mark-prices', or 'index-prices' |
| params.price | <code>string</code> | No | *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles |
| params.until | <code>int</code> | No | end timestamp in ms for the requested period |


```javascript
extended.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)

**See**: https://api.docs.extended.exchange/#get-funding-rates-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of entries to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate to fetch |
| params.endTime | <code>int</code> | No | exchange-specific end timestamp in ms of the latest funding rate to fetch |
| params.cursor | <code>int</code> | No | offset of the result set |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchFundingRateHistory (symbol, since?, limit?, params?)
```


<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

### fetchOpenInterestHistory{docsify-ignore}
Retrieves the open interest history of a currency

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of [open interest structures](https://docs.ccxt.com/?id=open-interest-structure)

**See**: https://api.docs.extended.exchange/#get-open-interest-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| timeframe | <code>string</code> | Yes | '1h' or '1d' |
| since | <code>int</code> | No | the time(ms) of the earliest record to retrieve as a unix timestamp |
| limit | <code>int</code> | No | the maximum amount of open interest structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.until | <code>int</code> | No | timestamp in ms of the latest open interest record to fetch |


```javascript
extended.fetchOpenInterestHistory (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://api.docs.extended.exchange/#get-spot-balances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchBalance (params?)
```


<a name="fetchAccount" id="fetchaccount"></a>

### fetchAccount{docsify-ignore}
fetch the current authenticated sub-account

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - an [account structure](https://docs.ccxt.com/?id=account-structure)

**See**: https://api.docs.extended.exchange/#get-account-details  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchAccount (params?)
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch the current authenticated sub-account, extended private endpoints only return records for the authenticated sub-account

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [account structures](https://docs.ccxt.com/?id=account-structure)

**See**: https://api.docs.extended.exchange/#get-sub-accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchAccounts (params?)
```


<a name="fetchLedger" id="fetchledger"></a>

### fetchLedger{docsify-ignore}
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [ledger structures](https://docs.ccxt.com/?id=ledger)

**See**: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchLedger (code?, since?, limit?, params?)
```


<a name="fetchTransactions" id="fetchtransactions"></a>

### fetchTransactions{docsify-ignore}
fetch history of deposits, withdrawals, and transfers

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Transaction&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch transactions for |
| limit | <code>int</code> | No | the maximum number of transaction structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchTransactions (code?, since?, limit?, params?)
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Transaction&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposit structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchDeposits (code?, since?, limit?, params?)
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Transaction&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawal structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchWithdrawals (code?, since?, limit?, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a Starknet withdrawal

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**: https://api.docs.extended.exchange/#withdrawals  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the Starknet address to withdraw to |
| tag | <code>string</code> | Yes | unused |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.chainId | <code>string</code> | No | only STRK is supported |
| params.settlementExpiration | <code>int</code> | No | settlement expiration timestamp in seconds, defaults to now + 14 days + 60 seconds |


```javascript
extended.withdraw (code, amount, address, tag, params?)
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;TransferEntry&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfer structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchTransfers (code?, since?, limit?, params?)
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer collateral between sub-accounts associated with the same wallet

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**: https://api.docs.extended.exchange/#create-transfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to transfer |
| fromAccount | <code>string</code> | Yes | source account id, defaults to the authenticated account id |
| toAccount | <code>string</code> | Yes | destination account id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.toVault | <code>string</code> | Yes | destination account L2 vault |
| params.toL2Key | <code>string</code> | Yes | destination account L2 public key |
| params.settlementExpiration | <code>int</code> | No | settlement expiration timestamp in seconds, defaults to now + 21 days |


```javascript
extended.transfer (code, amount, fromAccount, toAccount, params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**: https://api.docs.extended.exchange/#get-fees  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.builderId | <code>string</code> | No | builder client id |


```javascript
extended.fetchTradingFee (symbol, params?)
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for multiple markets

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/?id=fee-structure) indexed by market symbols

**See**: https://api.docs.extended.exchange/#get-fees  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.market | <code>string</code> | No | exchange market id |
| params.builderId | <code>string</code> | No | builder client id |


```javascript
extended.fetchTradingFees (params?)
```


<a name="fetchLeverage" id="fetchleverage"></a>

### fetchLeverage{docsify-ignore}
fetch the set leverage for a market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)

**See**: https://api.docs.extended.exchange/#get-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchLeverage (symbol, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - response from the exchange

**See**: https://api.docs.extended.exchange/#update-leverage  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>int</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.setLeverage (leverage, symbol, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Position&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://api.docs.extended.exchange/#get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchPositions (symbols, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://api.docs.extended.exchange/#get-positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchPosition (symbol, params?)
```


<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

### fetchPositionsHistory{docsify-ignore}
fetch historical positions

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Position&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://api.docs.extended.exchange/#get-positions-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of position structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchPositionsHistory (symbols, since?, limit?, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#create-or-edit-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, required for all order types |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | client order id, sent as the exchange order id |
| params.cancelId | <code>string</code> | No | previous external order id to replace |
| params.timeInForce | <code>string</code> | No | 'GTT' or 'IOC' |
| params.postOnly | <code>boolean</code> | No | true if the order should only make liquidity |
| params.reduceOnly | <code>boolean</code> | No | true if the order should only reduce a position |
| params.fee | <code>string</code> | No | max fee rate for the order, default is 0.0005 |
| params.expiryEpochMillis | <code>int</code> | No | order expiration timestamp in milliseconds, default is now + 1 hour |
| params.triggerPrice | <code>float</code> | No | *swap only* The price at which a trigger order is triggered at |
| params.stopLossPrice | <code>float</code> | No | *swap only* The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | *swap only* The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | *swap only* take profit trigger price |
| params.takeProfit.price | <code>float</code> | No | *swap only* the execution price for a take profit attached to a trigger order |
| params.takeProfit.type | <code>string</code> | No | *swap only* the type for a take profit attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is '' |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | *swap only* stop loss trigger price |
| params.stopLoss.price | <code>float</code> | No | *swap only* the execution price for a stop loss attached to a trigger order |
| params.stopLoss.type | <code>string</code> | No | *swap only* the type for a stop loss attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is '' |


```javascript
extended.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#create-or-edit-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id assigned by Extended |
| symbol | <code>string</code> | Yes | unified symbol of the market to edit an order in |
| type | <code>string</code> | Yes | 'limit' or 'market' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.editOrder (id, symbol, type, side, amount?, price?, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://api.docs.extended.exchange/#cancel-order-by-id
- https://api.docs.extended.exchange/#cancel-order-by-external-id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id assigned by Extended |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | user-defined order id, cancels by external id |


```javascript
extended.cancelOrder (id, symbol?, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders by order ids or client order ids

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#mass-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol, only used to populate the returned orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | client order ids |
| params.clientOrderId | <code>string</code> | No | single client order id |


```javascript
extended.cancelOrders (ids, symbol?, params?)
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancels all open orders, optionally filtered by symbol

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#mass-cancel  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.cancelAllOrders (symbol?, params?)
```


<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

### cancelAllOrdersAfter{docsify-ignore}
dead man's switch, cancel all orders after the given timeout

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - the api result

**See**: https://api.docs.extended.exchange/#mass-auto-cancel-dead-man-39-s-switch  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.cancelAllOrdersAfter (timeout, params?)
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://api.docs.extended.exchange/#get-order-by-id
- https://api.docs.extended.exchange/#get-orders-by-external-id


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id assigned by Extended |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | No | user-defined order id, fetches by external id |


```javascript
extended.fetchOrder (id, symbol?, params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#get-open-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the orders |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.fetchOpenOrders (symbol?, since?, limit?, params?)
```


<a name="fetchOrders" id="fetchorders"></a>

### fetchOrders{docsify-ignore}
fetches information on multiple orders made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#get-orders-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the orders |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchOrders (symbol?, since?, limit?, params?)
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#get-orders-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the orders |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchClosedOrders (symbol?, since?, limit?, params?)
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#get-orders-history  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the orders |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
extended.fetchCanceledOrders (symbol?, since?, limit?, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://api.docs.extended.exchange/#order-book-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.depth | <code>string</code> | No | set to '1' to receive best bid and ask snapshots only |


```javascript
extended.watchOrderBook (symbol, limit?, params?)
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://api.docs.extended.exchange/#account-updates-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchOrders (symbol, since?, limit?, params?)
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
watches balance updates

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://api.docs.extended.exchange/#account-updates-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchBalance (params?)
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://api.docs.extended.exchange/#account-updates-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the trades |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchMyTrades (symbol?, since?, limit?, params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watches information on multiple positions

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)

**See**: https://api.docs.extended.exchange/#account-updates-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of position structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchPositions (symbols?, since?, limit?, params?)
```


<a name="watchFundingRate" id="watchfundingrate"></a>

### watchFundingRate{docsify-ignore}
watch the current funding rate

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)

**See**: https://api.docs.extended.exchange/#funding-rates-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchFundingRate (symbol, params?)
```


<a name="watchMarkPrice" id="watchmarkprice"></a>

### watchMarkPrice{docsify-ignore}
watches a mark price for a specific market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://api.docs.extended.exchange/#mark-price-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchMarkPrice (symbol, params?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://api.docs.extended.exchange/#trades-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
extended.watchTrades (symbol, since?, limit?, params?)
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>extended</code>](#extended)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://api.docs.extended.exchange/#candles-stream  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.candleType | <code>string</code> | No | candle type: 'trades' (default), 'mark-prices', or 'index-prices' |
| params.price | <code>string</code> | No | *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles |


```javascript
extended.watchOHLCV (symbol, timeframe, since?, limit?, params?)
```

