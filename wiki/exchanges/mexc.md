
<a name="mexc" id="mexc"></a>

## mexc{docsify-ignore}
**Kind**: global class  
**Extends**: <code>Exchange</code>  

* [createMarketBuyOrderWithCost](#createmarketbuyorderwithcost)
* [createOrders](#createorders)
* [fetchFundingRateHistory](#fetchfundingratehistory)

<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

### createMarketBuyOrderWithCost{docsify-ignore}
create a market buy order by providing the symbol and cost

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.createMarketBuyOrderWithCost (symbol, cost[, params])
```


<a name="createOrders" id="createorders"></a>

### createOrders{docsify-ignore}
*spot only*  *all orders must have the same symbol* create a list of trade orders

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)

**See**: https://mexcdevelop.github.io/apidocs/spot_v3_en/#batch-orders  

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to api endpoint |


```javascript
mexc.createOrders (orders[, params])
```


<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

### fetchFundingRateHistory{docsify-ignore}
fetches historical funding rate prices

**Kind**: instance method of [<code>mexc</code>](#mexc)  
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | not used by mexc, but filtered internally by ccxt |
| limit | <code>int</code> | No | mexc limit is page_size default 20, maximum is 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |


```javascript
mexc.fetchFundingRateHistory (symbol[, since, limit, params])
```

