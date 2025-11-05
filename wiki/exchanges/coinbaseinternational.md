
<a name="coinbaseinternational" id="coinbaseinternational"></a>

## coinbaseinternational{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchAccounts](#fetchaccounts)
* [fetchOHLCV](#fetchohlcv)
* [fetchFundingRateHistory](#fetchfundingratehistory)
* [fetchFundingHistory](#fetchfundinghistory)
* [fetchTransfers](#fetchtransfers)
* [createDepositAddress](#createdepositaddress)
* [setMargin](#setmargin)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchDeposits](#fetchdeposits)
* [fetchMarkets](#fetchmarkets)
* [fetchCurrencies](#fetchcurrencies)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchBalance](#fetchbalance)
* [transfer](#transfer)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [cancelAllOrders](#cancelallorders)
* [editOrder](#editorder)
* [fetchOrder](#fetchorder)
* [fetchOpenOrders](#fetchopenorders)
* [fetchMyTrades](#fetchmytrades)
* [withdraw](#withdraw)

<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
fetch all the accounts associated with a profile

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type

**See**: https://docs.cloud.coinbase.com/intx/reference/getportfolios  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchAccounts ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://docs.cdp.coinbase.com/intx/reference/getinstrumentcandles  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch, default 100 max 10000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest candle to fetch |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbaseinternational.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getinstrumentfunding  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbaseinternational.fetchFundingRateHistory (symbol[, since, limit, params])
```


<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

### fetchFundingHistory{docsify-ignore}
fetch the history of funding payments paid and received on this account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [funding history structure](https://docs.ccxt.com/#/?id=funding-history-structure)

**See**: https://docs.cdp.coinbase.com/intx/reference/gettransfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch funding history for |
| limit | <code>int</code> | No | the maximum number of funding history structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchFundingHistory ([symbol, since, limit, params])
```


<a name="fetchTransfers" id="fetchtransfers"></a>

### fetchTransfers{docsify-ignore}
fetch a history of internal transfers made on an account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)

**See**: https://docs.cdp.coinbase.com/intx/reference/gettransfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of  transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchTransfers (code[, since, limit, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**

- https://docs.cloud.coinbase.com/intx/reference/createaddress
- https://docs.cloud.coinbase.com/intx/reference/createcounterpartyid


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network_arn_id | <code>string</code> | No | Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a) if not provided will pick default |
| params.network | <code>string</code> | No | unified network code to identify the blockchain network |


```javascript
coinbaseinternational.createDepositAddress (code[, params])
```


<a name="setMargin" id="setmargin"></a>

### setMargin{docsify-ignore}
Either adds or reduces margin in order to set the margin to a specific value

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - A [margin structure](https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/setportfoliomarginoverride  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to set margin in |
| amount | <code>float</code> | Yes | the amount to set the margin to |
| params | <code>object</code> | No | parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.setMargin (symbol, amount[, params])
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getportfolioposition  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchPosition (symbol[, params])
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getportfoliopositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchPositions ([symbols, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/gettransfers  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolios | <code>string</code> | No | Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided. |
| params.until | <code>int</code> | No | Only find transfers updated before this time. Use timestamp format |
| params.status | <code>string</code> | No | The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED] |
| params.type | <code>string</code> | No | The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING] |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbaseinternational.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolios | <code>string</code> | No | Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided. |
| params.until | <code>int</code> | No | Only find transfers updated before this time. Use timestamp format |
| params.status | <code>string</code> | No | The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED] |
| params.type | <code>string</code> | No | The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING] |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbaseinternational.fetchDeposits (code[, since, limit, params])
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for coinbaseinternational

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://docs.cloud.coinbase.com/intx/reference/getinstruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchMarkets ([params])
```


<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://docs.cloud.coinbase.com/intx/reference/getassets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchCurrencies ([params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getinstruments  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getinstrumentquote  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchTicker (symbol[, params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getportfoliobalances  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.v3 | <code>boolean</code> | No | default false, set true to use v3 api endpoint |


```javascript
coinbaseinternational.fetchBalance ([params])
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
Transfer an amount of asset from one portfolio to another.

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [transfer structure](https://github.com/ccxt/ccxt/wiki/Manual#transfer-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/createportfolioassettransfer  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.transfer (code, amount, fromAccount, toAccount[, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/createorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.stopPrice | <code>float</code> | No | alias for triggerPrice |
| params.triggerPrice | <code>float</code> | No | price to trigger stop orders |
| params.stopLossPrice | <code>float</code> | No | price to trigger stop-loss orders |
| params.postOnly | <code>bool</code> | No | true or false |
| params.tif | <code>string</code> | No | 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders |
| params.expire_time | <code>string</code> | No | The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z) |
| params.stp_mode | <code>string</code> | No | Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders. |


```javascript
coinbaseinternational.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/cancelorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by coinbaseinternational cancelOrder() |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.cancelOrder (id, symbol[, params])
```


<a name="cancelAllOrders" id="cancelallorders"></a>

### cancelAllOrders{docsify-ignore}
cancel all open orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.cancelAllOrders (symbol[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
edit a trade order

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/modifyorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderId | <code>string</code> | Yes | client order id |


```javascript
coinbaseinternational.editOrder (id, symbol, type, side, amount[, price, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/modifyorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified market symbol that the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
coinbaseinternational.fetchOrder (id, symbol[, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetches information on all currently open orders

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getorders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the orders |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.offset | <code>int</code> | No | offset |
| params.event_type | <code>string</code> | No | The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED |


```javascript
coinbaseinternational.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchMyTrades" id="fetchmytrades"></a>

### fetchMyTrades{docsify-ignore}
fetch all trades made by the user

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://docs.cloud.coinbase.com/intx/reference/getmultiportfoliofills  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the trades |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | the maximum number of trade structures to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |


```javascript
coinbaseinternational.fetchMyTrades (symbol[, since, limit, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>coinbaseinternational</code>](#coinbaseinternational)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://docs.cloud.coinbase.com/intx/reference/withdraw
- https://docs.cloud.coinbase.com/intx/reference/counterpartywithdraw


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | No | an optional tag for the withdrawal |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.add_network_fee_to_total | <code>boolean</code> | No | if true, deducts network fee from the portfolio, otherwise deduct fee from the withdrawal |
| params.network_arn_id | <code>string</code> | No | Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a) |
| params.nonce | <code>string</code> | No | a unique integer representing the withdrawal request |


```javascript
coinbaseinternational.withdraw (code, amount, address[, tag, params])
```

