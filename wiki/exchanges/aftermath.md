
<a name="aftermath" id="aftermath"></a>

## aftermath{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchCurrencies](#fetchcurrencies)
* [fetchMarkets](#fetchmarkets)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTicker](#fetchticker)
* [fetchOrderBook](#fetchorderbook)
* [fetchTrades](#fetchtrades)
* [fetchOHLCV](#fetchohlcv)
* [fetchBalance](#fetchbalance)
* [fetchAccounts](#fetchaccounts)
* [fetchOpenOrders](#fetchopenorders)
* [fetchPosition](#fetchposition)
* [fetchPositions](#fetchpositions)
* [createOrder](#createorder)
* [createOrders](#createorders)
* [cancelOrder](#cancelorder)
* [cancelOrders](#cancelorders)
* [addMargin](#addmargin)
* [reduceMargin](#reducemargin)
* [transfer](#transfer)
* [withdraw](#withdraw)
* [setLeverage](#setleverage)
* [signTxEd25519](#signtxed25519)
* [watchTrades](#watchtrades)
* [watchOrderBook](#watchorderbook)
* [watchPositions](#watchpositions)

<a name="fetchCurrencies" id="fetchcurrencies"></a>

### fetchCurrencies{docsify-ignore}
fetches all available currencies on an exchange

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - an associative dictionary of currencies

**See**: https://testnet.aftermath.finance/docs/#/CCXT/currencies  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchCurrencies (params?)
```


<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for woo

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**: https://testnet.aftermath.finance/docs/#/CCXT/markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchMarkets (params?)
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/markets  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchTradingFee (symbol, params?)
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchTicker (symbol, params?)
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://testnet.aftermath.finance/docs/#/CCXT/orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchOrderBook (symbol, limit?, params?)
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/trades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |


```javascript
aftermath.fetchTrades (symbol, since?, limit?, params?)
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**: https://testnet.aftermath.finance/docs/#/CCXT/ohlcv  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms))) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchOHLCV (symbol, timeframe, since?, limit?, params?)
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in positions

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/balance  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>string</code> | No | account object ID, required |


```javascript
aftermath.fetchBalance (params?)
```


<a name="fetchAccounts" id="fetchaccounts"></a>

### fetchAccounts{docsify-ignore}
query for accounts owned by the walletAddress. An Account is needed for all trading methods.

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array</code> - a list of [account structures](https://github.com/ccxt/ccxt/wiki/Manual#accounts)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/accounts  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.fetchAccounts (params?)
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/my_pending_orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountNumber | <code>int</code> | No | account number to query orders for, required |


```javascript
aftermath.fetchOpenOrders (symbol, since?, limit?, params?)
```


<a name="fetchPosition" id="fetchposition"></a>

### fetchPosition{docsify-ignore}
fetch data on an open position

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountNumber | <code>int</code> | No | account number to query positions for, required |


```javascript
aftermath.fetchPosition (symbol, params?)
```


<a name="fetchPositions" id="fetchpositions"></a>

### fetchPositions{docsify-ignore}
fetch all open positions

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/positions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountNumber | <code>int</code> | No | account number to query positions for, required |


```javascript
aftermath.fetchPositions (symbols, params?)
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_create_orders
- https://testnet.aftermath.finance/docs/#/CCXT/submit_create_orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce-only |
| params.account | <code>Account</code> | No | account id to use, required |


```javascript
aftermath.createOrder (symbol, type, side, amount, price?, params?)
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
create a list of trade orders

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_create_orders
- https://testnet.aftermath.finance/docs/#/CCXT/submit_create_orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>Account</code> | No | account id to use, required |


```javascript
aftermath.createOrders (orders, params?)
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_cancel_orders
- https://testnet.aftermath.finance/docs/#/CCXT/submit_cancel_orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.cancelOrder (id, symbol, params?)
```


<a name="cancelOrders" id="cancelorders"></a>

### cancelOrders{docsify-ignore}
cancel multiple orders

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;Order&gt;</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_cancel_orders
- https://testnet.aftermath.finance/docs/#/CCXT/submit_cancel_orders


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>Account</code> | No | account to cancel orders for, required |


```javascript
aftermath.cancelOrders (ids, symbol?, params?)
```


<a name="addMargin" id="addmargin"></a>

### addMargin{docsify-ignore}
add margin

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=add-margin-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_allocate
- https://testnet.aftermath.finance/docs/#/CCXT/submit_allocate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>Account</code> | No | account id to use, required |


```javascript
aftermath.addMargin (symbol, amount, params?)
```


<a name="reduceMargin" id="reducemargin"></a>

### reduceMargin{docsify-ignore}
remove margin from a position

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=reduce-margin-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_deallocate
- https://testnet.aftermath.finance/docs/#/CCXT/submit_deallocate


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>Account</code> | No | account id to use, required |


```javascript
aftermath.reduceMargin (symbol, amount, params?)
```


<a name="transfer" id="transfer"></a>

### transfer{docsify-ignore}
transfer currency internally between wallets on the same account

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_deposit
- https://testnet.aftermath.finance/docs/#/CCXT/submit_deposit


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.transfer (code, amount, fromAccount, toAccount, params?)
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_withdraw
- https://testnet.aftermath.finance/docs/#/CCXT/submit_withdraw


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>Account</code> | No | account id to use, required |


```javascript
aftermath.withdraw (code, amount, address, tag, params?)
```


<a name="setLeverage" id="setleverage"></a>

### setLeverage{docsify-ignore}
set the level of leverage for a market

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - response from the exchange

**See**

- https://testnet.aftermath.finance/docs/#/CCXT/build_set_leverage
- https://testnet.aftermath.finance/docs/#/CCXT/submit_set_leverage


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.account | <code>Account</code> | No | account id to use, required |


```javascript
aftermath.setLeverage (leverage, symbol, params?)
```


<a name="signTxEd25519" id="signtxed25519"></a>

### signTxEd25519{docsify-ignore}
Helper to sign some transaction bytes and return a generic transaction execution request.

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - the input transaction bytes and the signed digest


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| tx | <code>object</code> | No | transaction bytes and the signing digest for them |


```javascript
aftermath.signTxEd25519 (tx?)
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
watches information on multiple trades made in a market

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Atrades  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.watchTrades (symbol, since?, limit?, params?)
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols

**See**: https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Aorderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
aftermath.watchOrderBook (symbol, limit?, params?)
```


<a name="watchPositions" id="watchpositions"></a>

### watchPositions{docsify-ignore}
watch all open positions

**Kind**: instance method of [<code>aftermath</code>](#aftermath)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)

**See**: https://testnet.aftermath.finance/docs/#/CCXT/service%3A%3Ahandlers%3A%3Accxt%3A%3Astream%3A%3Apositions  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of position structures to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |
| params.accountNumber | <code>int</code> | No | account number to query orders for, required |


```javascript
aftermath.watchPositions (symbols, since?, limit?, params)
```

