
<a name="upbit" id="upbit"></a>

## upbit{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [fetchMarkets](#fetchmarkets)
* [fetchBalance](#fetchbalance)
* [fetchOrderBooks](#fetchorderbooks)
* [fetchOrderBook](#fetchorderbook)
* [fetchTickers](#fetchtickers)
* [fetchTicker](#fetchticker)
* [fetchTrades](#fetchtrades)
* [fetchTradingFee](#fetchtradingfee)
* [fetchTradingFees](#fetchtradingfees)
* [fetchOHLCV](#fetchohlcv)
* [createOrder](#createorder)
* [cancelOrder](#cancelorder)
* [editOrder](#editorder)
* [fetchDeposits](#fetchdeposits)
* [fetchDeposit](#fetchdeposit)
* [fetchWithdrawals](#fetchwithdrawals)
* [fetchWithdrawal](#fetchwithdrawal)
* [fetchOpenOrders](#fetchopenorders)
* [fetchClosedOrders](#fetchclosedorders)
* [fetchCanceledOrders](#fetchcanceledorders)
* [fetchOrder](#fetchorder)
* [fetchDepositAddresses](#fetchdepositaddresses)
* [fetchDepositAddress](#fetchdepositaddress)
* [createDepositAddress](#createdepositaddress)
* [withdraw](#withdraw)
* [watchTicker](#watchticker)
* [watchTickers](#watchtickers)
* [watchTrades](#watchtrades)
* [watchTradesForSymbols](#watchtradesforsymbols)
* [watchOrderBook](#watchorderbook)
* [watchOHLCV](#watchohlcv)
* [watchOrders](#watchorders)
* [watchMyTrades](#watchmytrades)
* [watchBalance](#watchbalance)

<a name="fetchMarkets" id="fetchmarkets"></a>

### fetchMarkets{docsify-ignore}
retrieves data on all markets for upbit

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data

**See**

- https://docs.upbit.com/kr/reference/마켓-코드-조회
- https://global-docs.upbit.com/reference/listing-market-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchMarkets ([params])
```


<a name="fetchBalance" id="fetchbalance"></a>

### fetchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**

- https://docs.upbit.com/kr/reference/전체-계좌-조회
- https://global-docs.upbit.com/reference/overall-account-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchBalance ([params])
```


<a name="fetchOrderBooks" id="fetchorderbooks"></a>

### fetchOrderBooks{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbol

**See**

- https://docs.upbit.com/kr/reference/호가-정보-조회
- https://global-docs.upbit.com/reference/order-book-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols, all symbols fetched if undefined, default is undefined |
| limit | <code>int</code> | No | not used by upbit fetchOrderBooks () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchOrderBooks (symbols[, limit, params])
```


<a name="fetchOrderBook" id="fetchorderbook"></a>

### fetchOrderBook{docsify-ignore}
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**

- https://docs.upbit.com/kr/reference/호가-정보-조회
- https://global-docs.upbit.com/reference/order-book-list


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchOrderBook (symbol[, limit, params])
```


<a name="fetchTickers" id="fetchtickers"></a>

### fetchTickers{docsify-ignore}
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.upbit.com/kr/reference/ticker현재가-정보
- https://global-docs.upbit.com/reference/tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchTickers (symbols[, params])
```


<a name="fetchTicker" id="fetchticker"></a>

### fetchTicker{docsify-ignore}
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**

- https://docs.upbit.com/kr/reference/ticker현재가-정보
- https://global-docs.upbit.com/reference/tickers


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchTicker (symbol[, params])
```


<a name="fetchTrades" id="fetchtrades"></a>

### fetchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**

- https://docs.upbit.com/kr/reference/최근-체결-내역
- https://global-docs.upbit.com/reference/today-trades-history


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchTrades (symbol[, since, limit, params])
```


<a name="fetchTradingFee" id="fetchtradingfee"></a>

### fetchTradingFee{docsify-ignore}
fetch the trading fees for a market

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)

**See**

- https://docs.upbit.com/kr/reference/주문-가능-정보
- https://global-docs.upbit.com/reference/available-order-information


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchTradingFee (symbol[, params])
```


<a name="fetchTradingFees" id="fetchtradingfees"></a>

### fetchTradingFees{docsify-ignore}
fetch the trading fees for markets

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [trading fee structure](https://docs.ccxt.com/#/?id=trading-fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchTradingFees ([params])
```


<a name="fetchOHLCV" id="fetchohlcv"></a>

### fetchOHLCV{docsify-ignore}
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume

**See**

- https://docs.upbit.com/kr/reference/분minute-캔들-1
- https://global-docs.upbit.com/reference/minutes


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="createOrder" id="createorder"></a>

### createOrder{docsify-ignore}
create a trade order

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/주문하기
- https://global-docs.upbit.com/reference/order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | supports 'market' and 'limit'. if params.ordType is set to best, a best-type order will be created regardless of the value of type. |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount |
| params.ordType | <code>string</code> | No | this field can be used to place a ‘best’ type order |
| params.timeInForce | <code>string</code> | No | 'IOC' or 'FOK'. only for limit or best type orders. this field is required when the order type is 'best'. |


```javascript
upbit.createOrder (symbol, type, side, amount[, price, params])
```


<a name="cancelOrder" id="cancelorder"></a>

### cancelOrder{docsify-ignore}
cancels an open order

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/주문-취소
- https://global-docs.upbit.com/reference/order-cancel


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by upbit cancelOrder () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.cancelOrder (id, symbol[, params])
```


<a name="editOrder" id="editorder"></a>

### editOrder{docsify-ignore}
canceled existing order and create new order. It's only generated same side and symbol as the canceled order. it returns the data of the canceled order, except for `new_order_uuid` and `new_identifier`. to get the details of the new order, use `fetchOrder(new_order_uuid)`.

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/취소-후-재주문
- https://global-docs.upbit.com/reference/cancel-and-new


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the uuid of the previous order you want to edit. |
| symbol | <code>string</code> | Yes | the symbol of the new order. it must be the same as the symbol of the previous order. |
| type | <code>string</code> | Yes | the type of the new order. only limit or market is accepted. if params.newOrdType is set to best, a best-type order will be created regardless of the value of type. |
| side | <code>string</code> | Yes | the side of the new order. it must be the same as the side of the previous order. |
| amount | <code>number</code> | Yes | the amount of the asset you want to buy or sell. It could be overridden by specifying the new_volume parameter in params. |
| price | <code>number</code> | Yes | the price of the asset you want to buy or sell. It could be overridden by specifying the new_price parameter in params. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint. |
| params.clientOrderId | <code>string</code> | No | to identify the previous order, either the id or this field is required in this method. |
| params.cost | <code>float</code> | No | for market buy and best buy orders, the quote quantity that can be used as an alternative for the amount. |
| params.newTimeInForce | <code>string</code> | No | 'IOC' or 'FOK'. only for limit or best type orders. this field is required when the order type is 'best'. |
| params.newClientOrderId | <code>string</code> | No | the order ID that the user can define. |
| params.newOrdType | <code>string</code> | No | this field only accepts limit, price, market, or best. You can refer to the Upbit developer documentation for details on how to use this field. |


```javascript
upbit.editOrder (id, symbol, type, side, amount, price[, params])
```


<a name="fetchDeposits" id="fetchdeposits"></a>

### fetchDeposits{docsify-ignore}
fetch all deposits made to an account

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://docs.upbit.com/kr/reference/입금-리스트-조회
- https://global-docs.upbit.com/reference/deposit-list-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchDeposits (code[, since, limit, params])
```


<a name="fetchDeposit" id="fetchdeposit"></a>

### fetchDeposit{docsify-ignore}
fetch information on a deposit

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://docs.upbit.com/kr/reference/개별-입금-조회
- https://global-docs.upbit.com/reference/individual-deposit-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the unique id for the deposit |
| code | <code>string</code> | No | unified currency code of the currency deposited |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.txid | <code>string</code> | No | withdrawal transaction id, the id argument is reserved for uuid |


```javascript
upbit.fetchDeposit (id[, code, params])
```


<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

### fetchWithdrawals{docsify-ignore}
fetch all withdrawals made from an account

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://docs.upbit.com/kr/reference/전체-출금-조회
- https://global-docs.upbit.com/reference/withdrawal-list-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchWithdrawals (code[, since, limit, params])
```


<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

### fetchWithdrawal{docsify-ignore}
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://docs.upbit.com/kr/reference/개별-출금-조회
- https://global-docs.upbit.com/reference/individual-withdrawal-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the unique id for the withdrawal |
| code | <code>string</code> | No | unified currency code of the currency withdrawn |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.txid | <code>string</code> | No | withdrawal transaction id, the id argument is reserved for uuid |


```javascript
upbit.fetchWithdrawal (id[, code, params])
```


<a name="fetchOpenOrders" id="fetchopenorders"></a>

### fetchOpenOrders{docsify-ignore}
fetch all unfilled currently open orders

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/대기-주문-조회
- https://global-docs.upbit.com/reference/open-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.state | <code>string</code> | No | default is 'wait', set to 'watch' for stop limit orders |


```javascript
upbit.fetchOpenOrders (symbol[, since, limit, params])
```


<a name="fetchClosedOrders" id="fetchclosedorders"></a>

### fetchClosedOrders{docsify-ignore}
fetches information on multiple closed orders made by the user

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/종료-주문-조회
- https://global-docs.upbit.com/reference/closed-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest order |


```javascript
upbit.fetchClosedOrders (symbol[, since, limit, params])
```


<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

### fetchCanceledOrders{docsify-ignore}
fetches information on multiple canceled orders made by the user

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/종료-주문-조회
- https://global-docs.upbit.com/reference/closed-order


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | timestamp in ms of the earliest order, default is undefined |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest order |


```javascript
upbit.fetchCanceledOrders (symbol[, since, limit, params])
```


<a name="fetchOrder" id="fetchorder"></a>

### fetchOrder{docsify-ignore}
fetches information on an order made by the user

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**

- https://docs.upbit.com/kr/reference/개별-주문-조회
- https://global-docs.upbit.com/reference/individual-order-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by upbit fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchOrder (id, symbol[, params])
```


<a name="fetchDepositAddresses" id="fetchdepositaddresses"></a>

### fetchDepositAddresses{docsify-ignore}
fetch deposit addresses for multiple currencies and chain types

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a list of [address structures](https://docs.ccxt.com/#/?id=address-structure)

**See**

- https://docs.upbit.com/kr/reference/전체-입금-주소-조회
- https://global-docs.upbit.com/reference/general-deposit-address-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.fetchDepositAddresses (codes[, params])
```


<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

### fetchDepositAddress{docsify-ignore}
fetch the deposit address for a currency associated with this account

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**

- https://docs.upbit.com/kr/reference/개별-입금-주소-조회
- https://global-docs.upbit.com/reference/individual-deposit-address-inquiry


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | Yes | deposit chain, can view all chains via this.publicGetWalletAssets, default is eth, unless the currency has a default chain within this.options['networks'] |


```javascript
upbit.fetchDepositAddress (code[, params])
```


<a name="createDepositAddress" id="createdepositaddress"></a>

### createDepositAddress{docsify-ignore}
create a currency deposit address

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)

**See**

- https://docs.upbit.com/kr/reference/입금-주소-생성-요청
- https://global-docs.upbit.com/reference/deposit-address-generation


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.createDepositAddress (code[, params])
```


<a name="withdraw" id="withdraw"></a>

### withdraw{docsify-ignore}
make a withdrawal

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)

**See**

- https://docs.upbit.com/kr/reference/디지털자산-출금하기
- https://global-docs.upbit.com/reference/withdrawal-digital-assets


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.withdraw (code, amount, address, tag[, params])
```


<a name="watchTicker" id="watchticker"></a>

### watchTicker{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://global-docs.upbit.com/reference/websocket-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchTicker (symbol[, params])
```


<a name="watchTickers" id="watchtickers"></a>

### watchTickers{docsify-ignore}
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)

**See**: https://global-docs.upbit.com/reference/websocket-ticker  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchTickers (symbols[, params])
```


<a name="watchTrades" id="watchtrades"></a>

### watchTrades{docsify-ignore}
get the list of most recent trades for a particular symbol

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://global-docs.upbit.com/reference/websocket-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchTrades (symbol[, since, limit, params])
```


<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

### watchTradesForSymbols{docsify-ignore}
get the list of most recent trades for a list of symbols

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)

**See**: https://global-docs.upbit.com/reference/websocket-trade  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchTradesForSymbols (symbols[, since, limit, params])
```


<a name="watchOrderBook" id="watchorderbook"></a>

### watchOrderBook{docsify-ignore}
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols

**See**: https://global-docs.upbit.com/reference/websocket-orderbook  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchOrderBook (symbol[, limit, params])
```


<a name="watchOHLCV" id="watchohlcv"></a>

### watchOHLCV{docsify-ignore}
watches information an OHLCV with timestamp, openingPrice, highPrice, lowPrice, tradePrice, baseVolume in 1s.

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;OHLCV&gt;</code> - a list of [OHLCV structures](https://docs.ccxt.com/#/?id=ohlcv-structure)

**See**

- https://docs.upbit.com/kr/reference/websocket-candle for Upbit KR
- https://global-docs.upbit.com/reference/websocket-candle for Upbit Global


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| timeframe | <code>string</code> | Yes | specifies the OHLCV candle interval to watch. As of now, Upbit only supports 1s candles. |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchOHLCV (symbol, timeframe[, since, limit, params])
```


<a name="watchOrders" id="watchorders"></a>

### watchOrders{docsify-ignore}
watches information on multiple orders made by the user

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://global-docs.upbit.com/reference/websocket-myorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchOrders (symbol[, since, limit, params])
```


<a name="watchMyTrades" id="watchmytrades"></a>

### watchMyTrades{docsify-ignore}
watches information on multiple trades made by the user

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)

**See**: https://global-docs.upbit.com/reference/websocket-myorder  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchMyTrades (symbol[, since, limit, params])
```


<a name="watchBalance" id="watchbalance"></a>

### watchBalance{docsify-ignore}
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance method of [<code>upbit</code>](#upbit)  
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)

**See**: https://global-docs.upbit.com/reference/websocket-myasset  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
upbit.watchBalance ([params])
```

