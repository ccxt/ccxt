
<a name="addMargin" id="addmargin"></a>

## addMargin
add margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#addmargin)
* [aster](/exchanges/aster.md#addmargin)
* [binance](/exchanges/binance.md#addmargin)
* [bitget](/exchanges/bitget.md#addmargin)
* [coincatch](/exchanges/coincatch.md#addmargin)
* [coinex](/exchanges/coinex.md#addmargin)
* [delta](/exchanges/delta.md#addmargin)
* [digifinex](/exchanges/digifinex.md#addmargin)
* [exmo](/exchanges/exmo.md#addmargin)
* [gate](/exchanges/gate.md#addmargin)
* [hitbtc](/exchanges/hitbtc.md#addmargin)
* [hyperliquid](/exchanges/hyperliquid.md#addmargin)
* [kucoinfutures](/exchanges/kucoinfutures.md#addmargin)
* [mexc](/exchanges/mexc.md#addmargin)
* [okx](/exchanges/okx.md#addmargin)
* [poloniex](/exchanges/poloniex.md#addmargin)
* [woo](/exchanges/woo.md#addmargin)
* [xt](/exchanges/xt.md#addmargin)
* [zebpayfutures](/exchanges/zebpayfutures.md#addmargin)

---

<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

## borrowCrossMargin
create a loan to borrow margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to borrow margin in a portfolio margin account |

##### Supported exchanges
* [binance](/exchanges/binance.md#borrowcrossmargin)
* [bitget](/exchanges/bitget.md#borrowcrossmargin)
* [bybit](/exchanges/bybit.md#borrowcrossmargin)
* [coinmetro](/exchanges/coinmetro.md#borrowcrossmargin)
* [htx](/exchanges/htx.md#borrowcrossmargin)
* [kucoin](/exchanges/kucoin.md#borrowcrossmargin)
* [okx](/exchanges/okx.md#borrowcrossmargin)

---

<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

## borrowIsolatedMargin
create a loan to borrow margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#borrowisolatedmargin)
* [bitget](/exchanges/bitget.md#borrowisolatedmargin)
* [bitmart](/exchanges/bitmart.md#borrowisolatedmargin)
* [coinex](/exchanges/coinex.md#borrowisolatedmargin)
* [gate](/exchanges/gate.md#borrowisolatedmargin)
* [htx](/exchanges/htx.md#borrowisolatedmargin)
* [kucoin](/exchanges/kucoin.md#borrowisolatedmargin)

---

<a name="borrowMargin" id="borrowmargin"></a>

## borrowMargin
create a loan to borrow margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.rate | <code>string</code> | No | '0.0002' or '0.002' extra parameter required for isolated margin |
| params.unifiedAccount | <code>boolean</code> | No | set to true for borrowing in the unified account |

##### Supported exchanges
* [gate](/exchanges/gate.md#borrowmargin)

---

<a name="calculatePricePrecision" id="calculatepriceprecision"></a>

## calculatePricePrecision
Helper function to calculate the Hyperliquid DECIMAL_PLACES price precision

**Kind**: instance   
**Returns**: <code>int</code> - The calculated price precision


| Param | Type | Description |
| --- | --- | --- |
| price | <code>float</code> | the price to use in the calculation |
| amountPrecision | <code>int</code> | the amountPrecision to use in the calculation |
| maxDecimals | <code>int</code> | the maxDecimals to use in the calculation |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#calculatepriceprecision)

---

<a name="cancelAllOrders" id="cancelallorders"></a>

## cancelAllOrders
cancel all open orders in a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#cancelallorders)
* [apex](/exchanges/apex.md#cancelallorders)
* [arkham](/exchanges/arkham.md#cancelallorders)
* [ascendex](/exchanges/ascendex.md#cancelallorders)
* [aster](/exchanges/aster.md#cancelallorders)
* [backpack](/exchanges/backpack.md#cancelallorders)
* [bigone](/exchanges/bigone.md#cancelallorders)
* [binance](/exchanges/binance.md#cancelallorders)
* [bingx](/exchanges/bingx.md#cancelallorders)
* [bitfinex](/exchanges/bitfinex.md#cancelallorders)
* [bitget](/exchanges/bitget.md#cancelallorders)
* [bitmart](/exchanges/bitmart.md#cancelallorders)
* [bitmex](/exchanges/bitmex.md#cancelallorders)
* [bitopro](/exchanges/bitopro.md#cancelallorders)
* [bitrue](/exchanges/bitrue.md#cancelallorders)
* [bitso](/exchanges/bitso.md#cancelallorders)
* [bitstamp](/exchanges/bitstamp.md#cancelallorders)
* [bitteam](/exchanges/bitteam.md#cancelallorders)
* [bittrade](/exchanges/bittrade.md#cancelallorders)
* [bitvavo](/exchanges/bitvavo.md#cancelallorders)
* [blockchaincom](/exchanges/blockchaincom.md#cancelallorders)
* [bullish](/exchanges/bullish.md#cancelallorders)
* [bybit](/exchanges/bybit.md#cancelallorders)
* [bydfi](/exchanges/bydfi.md#cancelallorders)
* [cex](/exchanges/cex.md#cancelallorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#cancelallorders)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#cancelallorders)
* [coincatch](/exchanges/coincatch.md#cancelallorders)
* [coinex](/exchanges/coinex.md#cancelallorders)
* [coinsph](/exchanges/coinsph.md#cancelallorders)
* [cryptocom](/exchanges/cryptocom.md#cancelallorders)
* [deepcoin](/exchanges/deepcoin.md#cancelallorders)
* [defx](/exchanges/defx.md#cancelallorders)
* [delta](/exchanges/delta.md#cancelallorders)
* [deribit](/exchanges/deribit.md#cancelallorders)
* [derive](/exchanges/derive.md#cancelallorders)
* [foxbit](/exchanges/foxbit.md#cancelallorders)
* [gate](/exchanges/gate.md#cancelallorders)
* [hashkey](/exchanges/hashkey.md#cancelallorders)
* [hibachi](/exchanges/hibachi.md#cancelallorders)
* [hitbtc](/exchanges/hitbtc.md#cancelallorders)
* [hollaex](/exchanges/hollaex.md#cancelallorders)
* [htx](/exchanges/htx.md#cancelallorders)
* [kraken](/exchanges/kraken.md#cancelallorders)
* [krakenfutures](/exchanges/krakenfutures.md#cancelallorders)
* [kucoin](/exchanges/kucoin.md#cancelallorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#cancelallorders)
* [latoken](/exchanges/latoken.md#cancelallorders)
* [lbank](/exchanges/lbank.md#cancelallorders)
* [mexc](/exchanges/mexc.md#cancelallorders)
* [modetrade](/exchanges/modetrade.md#cancelallorders)
* [ndax](/exchanges/ndax.md#cancelallorders)
* [onetrading](/exchanges/onetrading.md#cancelallorders)
* [oxfun](/exchanges/oxfun.md#cancelallorders)
* [paradex](/exchanges/paradex.md#cancelallorders)
* [phemex](/exchanges/phemex.md#cancelallorders)
* [poloniex](/exchanges/poloniex.md#cancelallorders)
* [toobit](/exchanges/toobit.md#cancelallorders)
* [whitebit](/exchanges/whitebit.md#cancelallorders)
* [woo](/exchanges/woo.md#cancelallorders)
* [woofipro](/exchanges/woofipro.md#cancelallorders)
* [xt](/exchanges/xt.md#cancelallorders)

---

<a name="cancelAllOrdersAfter" id="cancelallordersafter"></a>

## cancelAllOrdersAfter
dead man's switch, cancel all orders after the given timeout

**Kind**: instance   
**Returns**: <code>object</code> - the api result


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| timeout | <code>number</code> | Yes | time in milliseconds, 0 represents cancel the timer |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | spot or swap market |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#cancelallordersafter)
* [bitmex](/exchanges/bitmex.md#cancelallordersafter)
* [bybit](/exchanges/bybit.md#cancelallordersafter)
* [htx](/exchanges/htx.md#cancelallordersafter)
* [hyperliquid](/exchanges/hyperliquid.md#cancelallordersafter)
* [kraken](/exchanges/kraken.md#cancelallordersafter)
* [krakenfutures](/exchanges/krakenfutures.md#cancelallordersafter)
* [okx](/exchanges/okx.md#cancelallordersafter)
* [whitebit](/exchanges/whitebit.md#cancelallordersafter)
* [woo](/exchanges/woo.md#cancelallordersafter)

---

<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

## cancelAllOrdersWs
cancel all open orders in a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market to cancel orders in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#cancelallordersws)
* [bitvavo](/exchanges/bitvavo.md#cancelallordersws)
* [cryptocom](/exchanges/cryptocom.md#cancelallordersws)
* [gate](/exchanges/gate.md#cancelallordersws)
* [okx](/exchanges/okx.md#cancelallordersws)

---

<a name="cancelOrder" id="cancelorder"></a>

## cancelOrder
cancels an open order

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#cancelorder)
* [alpaca](/exchanges/alpaca.md#cancelorder)
* [apex](/exchanges/apex.md#cancelorder)
* [arkham](/exchanges/arkham.md#cancelorder)
* [ascendex](/exchanges/ascendex.md#cancelorder)
* [aster](/exchanges/aster.md#cancelorder)
* [backpack](/exchanges/backpack.md#cancelorder)
* [bigone](/exchanges/bigone.md#cancelorder)
* [binance](/exchanges/binance.md#cancelorder)
* [bingx](/exchanges/bingx.md#cancelorder)
* [bit2c](/exchanges/bit2c.md#cancelorder)
* [bitbank](/exchanges/bitbank.md#cancelorder)
* [bitbns](/exchanges/bitbns.md#cancelorder)
* [bitfinex](/exchanges/bitfinex.md#cancelorder)
* [bitflyer](/exchanges/bitflyer.md#cancelorder)
* [bitget](/exchanges/bitget.md#cancelorder)
* [bithumb](/exchanges/bithumb.md#cancelorder)
* [bitmart](/exchanges/bitmart.md#cancelorder)
* [bitmex](/exchanges/bitmex.md#cancelorder)
* [bitopro](/exchanges/bitopro.md#cancelorder)
* [bitrue](/exchanges/bitrue.md#cancelorder)
* [bitso](/exchanges/bitso.md#cancelorder)
* [bitstamp](/exchanges/bitstamp.md#cancelorder)
* [bitteam](/exchanges/bitteam.md#cancelorder)
* [bittrade](/exchanges/bittrade.md#cancelorder)
* [bitvavo](/exchanges/bitvavo.md#cancelorder)
* [blockchaincom](/exchanges/blockchaincom.md#cancelorder)
* [blofin](/exchanges/blofin.md#cancelorder)
* [btcbox](/exchanges/btcbox.md#cancelorder)
* [btcmarkets](/exchanges/btcmarkets.md#cancelorder)
* [btcturk](/exchanges/btcturk.md#cancelorder)
* [bullish](/exchanges/bullish.md#cancelorder)
* [bybit](/exchanges/bybit.md#cancelorder)
* [cex](/exchanges/cex.md#cancelorder)
* [coinbase](/exchanges/coinbase.md#cancelorder)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#cancelorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#cancelorder)
* [coincatch](/exchanges/coincatch.md#cancelorder)
* [coincheck](/exchanges/coincheck.md#cancelorder)
* [coinex](/exchanges/coinex.md#cancelorder)
* [coinmate](/exchanges/coinmate.md#cancelorder)
* [coinmetro](/exchanges/coinmetro.md#cancelorder)
* [coinone](/exchanges/coinone.md#cancelorder)
* [coinsph](/exchanges/coinsph.md#cancelorder)
* [coinspot](/exchanges/coinspot.md#cancelorder)
* [cryptocom](/exchanges/cryptocom.md#cancelorder)
* [cryptomus](/exchanges/cryptomus.md#cancelorder)
* [deepcoin](/exchanges/deepcoin.md#cancelorder)
* [defx](/exchanges/defx.md#cancelorder)
* [delta](/exchanges/delta.md#cancelorder)
* [deribit](/exchanges/deribit.md#cancelorder)
* [derive](/exchanges/derive.md#cancelorder)
* [digifinex](/exchanges/digifinex.md#cancelorder)
* [dydx](/exchanges/dydx.md#cancelorder)
* [exmo](/exchanges/exmo.md#cancelorder)
* [foxbit](/exchanges/foxbit.md#cancelorder)
* [gate](/exchanges/gate.md#cancelorder)
* [gemini](/exchanges/gemini.md#cancelorder)
* [hashkey](/exchanges/hashkey.md#cancelorder)
* [hibachi](/exchanges/hibachi.md#cancelorder)
* [hitbtc](/exchanges/hitbtc.md#cancelorder)
* [hollaex](/exchanges/hollaex.md#cancelorder)
* [htx](/exchanges/htx.md#cancelorder)
* [hyperliquid](/exchanges/hyperliquid.md#cancelorder)
* [independentreserve](/exchanges/independentreserve.md#cancelorder)
* [indodax](/exchanges/indodax.md#cancelorder)
* [kraken](/exchanges/kraken.md#cancelorder)
* [krakenfutures](/exchanges/krakenfutures.md#cancelorder)
* [kucoin](/exchanges/kucoin.md#cancelorder)
* [kucoinfutures](/exchanges/kucoinfutures.md#cancelorder)
* [latoken](/exchanges/latoken.md#cancelorder)
* [lbank](/exchanges/lbank.md#cancelorder)
* [luno](/exchanges/luno.md#cancelorder)
* [mercado](/exchanges/mercado.md#cancelorder)
* [mexc](/exchanges/mexc.md#cancelorder)
* [modetrade](/exchanges/modetrade.md#cancelorder)
* [ndax](/exchanges/ndax.md#cancelorder)
* [novadax](/exchanges/novadax.md#cancelorder)
* [okx](/exchanges/okx.md#cancelorder)
* [onetrading](/exchanges/onetrading.md#cancelorder)
* [oxfun](/exchanges/oxfun.md#cancelorder)
* [p2b](/exchanges/p2b.md#cancelorder)
* [paradex](/exchanges/paradex.md#cancelorder)
* [paymium](/exchanges/paymium.md#cancelorder)
* [phemex](/exchanges/phemex.md#cancelorder)
* [probit](/exchanges/probit.md#cancelorder)
* [timex](/exchanges/timex.md#cancelorder)
* [tokocrypto](/exchanges/tokocrypto.md#cancelorder)
* [toobit](/exchanges/toobit.md#cancelorder)
* [upbit](/exchanges/upbit.md#cancelorder)
* [wavesexchange](/exchanges/wavesexchange.md#cancelorder)
* [whitebit](/exchanges/whitebit.md#cancelorder)
* [woo](/exchanges/woo.md#cancelorder)
* [woofipro](/exchanges/woofipro.md#cancelorder)
* [xt](/exchanges/xt.md#cancelorder)
* [yobit](/exchanges/yobit.md#cancelorder)
* [zaif](/exchanges/zaif.md#cancelorder)
* [zebpay](/exchanges/zebpay.md#cancelorder)
* [zonda](/exchanges/zonda.md#cancelorder)

---

<a name="cancelOrderWs" id="cancelorderws"></a>

## cancelOrderWs
cancel multiple orders

**Kind**: instance   
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cancelRestrictions | <code>string</code>, <code>undefined</code> | No | Supported values: ONLY_NEW - Cancel will succeed if the order status is NEW. ONLY_PARTIALLY_FILLED - Cancel will succeed if order status is PARTIALLY_FILLED. |
| params.trigger | <code>boolean</code> | No | set to true if you would like to cancel a conditional order |

##### Supported exchanges
* [binance](/exchanges/binance.md#cancelorderws)
* [bitvavo](/exchanges/bitvavo.md#cancelorderws)
* [bybit](/exchanges/bybit.md#cancelorderws)
* [cex](/exchanges/cex.md#cancelorderws)
* [cryptocom](/exchanges/cryptocom.md#cancelorderws)
* [gate](/exchanges/gate.md#cancelorderws)
* [hyperliquid](/exchanges/hyperliquid.md#cancelorderws)
* [okx](/exchanges/okx.md#cancelorderws)
* [oxfun](/exchanges/oxfun.md#cancelorderws)

---

<a name="cancelOrders" id="cancelorders"></a>

## cancelOrders
cancel multiple orders

**Kind**: instance   
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | No | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.origClientOrderIdList | <code>Array&lt;string&gt;</code> | No | max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma |
| params.recvWindow | <code>Array&lt;int&gt;</code> | No |  |

##### Supported exchanges
* [aster](/exchanges/aster.md#cancelorders)
* [binance](/exchanges/binance.md#cancelorders)
* [bingx](/exchanges/bingx.md#cancelorders)
* [bitfinex](/exchanges/bitfinex.md#cancelorders)
* [bitget](/exchanges/bitget.md#cancelorders)
* [bitmart](/exchanges/bitmart.md#cancelorders)
* [bitmex](/exchanges/bitmex.md#cancelorders)
* [bitopro](/exchanges/bitopro.md#cancelorders)
* [bitso](/exchanges/bitso.md#cancelorders)
* [bittrade](/exchanges/bittrade.md#cancelorders)
* [blofin](/exchanges/blofin.md#cancelorders)
* [btcmarkets](/exchanges/btcmarkets.md#cancelorders)
* [bybit](/exchanges/bybit.md#cancelorders)
* [coinbase](/exchanges/coinbase.md#cancelorders)
* [coincatch](/exchanges/coincatch.md#cancelorders)
* [coinex](/exchanges/coinex.md#cancelorders)
* [cryptocom](/exchanges/cryptocom.md#cancelorders)
* [deepcoin](/exchanges/deepcoin.md#cancelorders)
* [digifinex](/exchanges/digifinex.md#cancelorders)
* [dydx](/exchanges/dydx.md#cancelorders)
* [gate](/exchanges/gate.md#cancelorders)
* [hashkey](/exchanges/hashkey.md#cancelorders)
* [hibachi](/exchanges/hibachi.md#cancelorders)
* [htx](/exchanges/htx.md#cancelorders)
* [hyperliquid](/exchanges/hyperliquid.md#cancelorders)
* [kraken](/exchanges/kraken.md#cancelorders)
* [krakenfutures](/exchanges/krakenfutures.md#cancelorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#cancelorders)
* [mexc](/exchanges/mexc.md#cancelorders)
* [modetrade](/exchanges/modetrade.md#cancelorders)
* [okx](/exchanges/okx.md#cancelorders)
* [onetrading](/exchanges/onetrading.md#cancelorders)
* [oxfun](/exchanges/oxfun.md#cancelorders)
* [timex](/exchanges/timex.md#cancelorders)
* [toobit](/exchanges/toobit.md#cancelorders)
* [woofipro](/exchanges/woofipro.md#cancelorders)
* [xt](/exchanges/xt.md#cancelorders)
* [zebpay](/exchanges/zebpay.md#cancelorders)

---

<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

## cancelOrdersForSymbols
cancel multiple orders for multiple symbols

**Kind**: instance   
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#cancelordersforsymbols)
* [cryptocom](/exchanges/cryptocom.md#cancelordersforsymbols)
* [gate](/exchanges/gate.md#cancelordersforsymbols)
* [hyperliquid](/exchanges/hyperliquid.md#cancelordersforsymbols)
* [okx](/exchanges/okx.md#cancelordersforsymbols)

---

<a name="cancelOrdersRequest" id="cancelordersrequest"></a>

## cancelOrdersRequest
build the request payload for cancelling multiple orders

**Kind**: instance   
**Returns**: <code>object</code> - the raw request object to be sent to the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No |  |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#cancelordersrequest)

---

<a name="cancelOrdersWs" id="cancelordersws"></a>

## cancelOrdersWs
cancel multiple orders

**Kind**: instance   
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | not used by cex cancelOrders() |
| params | <code>object</code> | No | extra parameters specific to the cex api endpoint |

##### Supported exchanges
* [cex](/exchanges/cex.md#cancelordersws)
* [hyperliquid](/exchanges/hyperliquid.md#cancelordersws)
* [okx](/exchanges/okx.md#cancelordersws)
* [oxfun](/exchanges/oxfun.md#cancelordersws)

---

<a name="closeAllPositions" id="closeallpositions"></a>

## closeAllPositions
closes all open positions for a market type

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#closeallpositions)
* [defx](/exchanges/defx.md#closeallpositions)
* [delta](/exchanges/delta.md#closeallpositions)

---

<a name="closePosition" id="closeposition"></a>

## closePosition
closes open positions for a market

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | not used by bingx |
| params | <code>object</code> | No | extra parameters specific to the bingx api endpoint |
| params.positionId | <code>string</code>, <code>undefined</code> | No | the id of the position you would like to close |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#closeposition)
* [bitget](/exchanges/bitget.md#closeposition)
* [blofin](/exchanges/blofin.md#closeposition)
* [coinbase](/exchanges/coinbase.md#closeposition)
* [coinex](/exchanges/coinex.md#closeposition)
* [coinmetro](/exchanges/coinmetro.md#closeposition)
* [deepcoin](/exchanges/deepcoin.md#closeposition)
* [defx](/exchanges/defx.md#closeposition)
* [gate](/exchanges/gate.md#closeposition)
* [hitbtc](/exchanges/hitbtc.md#closeposition)
* [kucoinfutures](/exchanges/kucoinfutures.md#closeposition)
* [okx](/exchanges/okx.md#closeposition)
* [zebpay](/exchanges/zebpay.md#closeposition)

---

<a name="closePositions" id="closepositions"></a>

## closePositions
closes open positions for a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - [a list of position structures](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bingx api endpoint |
| params.recvWindow | <code>string</code> | No | request valid time window value |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#closepositions)
* [cryptocom](/exchanges/cryptocom.md#closepositions)
* [htx](/exchanges/htx.md#closepositions)

---

<a name="createAccount" id="createaccount"></a>

## createAccount
creates a sub-account under the main account

**Kind**: instance   
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | the name of the sub-account |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.expiresAfter | <code>int</code> | No | time in ms after which the sub-account will expire |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#createaccount)

---

<a name="createConvertTrade" id="createconverttrade"></a>

## createConvertTrade
convert from one currency to another

**Kind**: instance   
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#createconverttrade)
* [bitget](/exchanges/bitget.md#createconverttrade)
* [bybit](/exchanges/bybit.md#createconverttrade)
* [coinbase](/exchanges/coinbase.md#createconverttrade)
* [okx](/exchanges/okx.md#createconverttrade)
* [phemex](/exchanges/phemex.md#createconverttrade)
* [whitebit](/exchanges/whitebit.md#createconverttrade)
* [woo](/exchanges/woo.md#createconverttrade)

---

<a name="createDepositAddress" id="createdepositaddress"></a>

## createDepositAddress
create a currency deposit address

**Kind**: instance   
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#createdepositaddress)
* [bitfinex](/exchanges/bitfinex.md#createdepositaddress)
* [coinbase](/exchanges/coinbase.md#createdepositaddress)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#createdepositaddress)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#createdepositaddress)
* [coinex](/exchanges/coinex.md#createdepositaddress)
* [deribit](/exchanges/deribit.md#createdepositaddress)
* [gemini](/exchanges/gemini.md#createdepositaddress)
* [hitbtc](/exchanges/hitbtc.md#createdepositaddress)
* [kraken](/exchanges/kraken.md#createdepositaddress)
* [kucoin](/exchanges/kucoin.md#createdepositaddress)
* [luno](/exchanges/luno.md#createdepositaddress)
* [mexc](/exchanges/mexc.md#createdepositaddress)
* [ndax](/exchanges/ndax.md#createdepositaddress)
* [paymium](/exchanges/paymium.md#createdepositaddress)
* [poloniex](/exchanges/poloniex.md#createdepositaddress)
* [upbit](/exchanges/upbit.md#createdepositaddress)
* [whitebit](/exchanges/whitebit.md#createdepositaddress)
* [yobit](/exchanges/yobit.md#createdepositaddress)

---

<a name="createGiftCode" id="creategiftcode"></a>

## createGiftCode
create gift code

**Kind**: instance   
**Returns**: <code>object</code> - The gift code id, code, currency and amount


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | gift code |
| amount | <code>float</code> | Yes | amount of currency for the gift |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#creategiftcode)

---

<a name="createMarkeSellOrderWithCost" id="createmarkesellorderwithcost"></a>

## createMarkeSellOrderWithCost
create a market sell order by providing the symbol and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#createmarkesellorderwithcost)

---

<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

## createMarketBuyOrderWithCost
create a market buy order by providing the symbol and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#createmarketbuyorderwithcost)
* [bigone](/exchanges/bigone.md#createmarketbuyorderwithcost)
* [binance](/exchanges/binance.md#createmarketbuyorderwithcost)
* [bingx](/exchanges/bingx.md#createmarketbuyorderwithcost)
* [bitget](/exchanges/bitget.md#createmarketbuyorderwithcost)
* [bitmart](/exchanges/bitmart.md#createmarketbuyorderwithcost)
* [bitrue](/exchanges/bitrue.md#createmarketbuyorderwithcost)
* [bittrade](/exchanges/bittrade.md#createmarketbuyorderwithcost)
* [bybit](/exchanges/bybit.md#createmarketbuyorderwithcost)
* [coinbase](/exchanges/coinbase.md#createmarketbuyorderwithcost)
* [coincatch](/exchanges/coincatch.md#createmarketbuyorderwithcost)
* [coinex](/exchanges/coinex.md#createmarketbuyorderwithcost)
* [deepcoin](/exchanges/deepcoin.md#createmarketbuyorderwithcost)
* [digifinex](/exchanges/digifinex.md#createmarketbuyorderwithcost)
* [exmo](/exchanges/exmo.md#createmarketbuyorderwithcost)
* [gate](/exchanges/gate.md#createmarketbuyorderwithcost)
* [hashkey](/exchanges/hashkey.md#createmarketbuyorderwithcost)
* [htx](/exchanges/htx.md#createmarketbuyorderwithcost)
* [kraken](/exchanges/kraken.md#createmarketbuyorderwithcost)
* [kucoin](/exchanges/kucoin.md#createmarketbuyorderwithcost)
* [lbank](/exchanges/lbank.md#createmarketbuyorderwithcost)
* [mexc](/exchanges/mexc.md#createmarketbuyorderwithcost)
* [okx](/exchanges/okx.md#createmarketbuyorderwithcost)
* [oxfun](/exchanges/oxfun.md#createmarketbuyorderwithcost)
* [whitebit](/exchanges/whitebit.md#createmarketbuyorderwithcost)
* [woo](/exchanges/woo.md#createmarketbuyorderwithcost)
* [xt](/exchanges/xt.md#createmarketbuyorderwithcost)

---

<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

## createMarketOrderWithCost
create a market order by providing the symbol, side and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#createmarketorderwithcost)
* [binance](/exchanges/binance.md#createmarketorderwithcost)
* [bingx](/exchanges/bingx.md#createmarketorderwithcost)
* [deepcoin](/exchanges/deepcoin.md#createmarketorderwithcost)
* [exmo](/exchanges/exmo.md#createmarketorderwithcost)
* [kraken](/exchanges/kraken.md#createmarketorderwithcost)
* [kucoin](/exchanges/kucoin.md#createmarketorderwithcost)
* [whitebit](/exchanges/whitebit.md#createmarketorderwithcost)

---

<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

## createMarketSellOrderWithCost
create a market sell order by providing the symbol and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#createmarketsellorderwithcost)
* [binance](/exchanges/binance.md#createmarketsellorderwithcost)
* [bingx](/exchanges/bingx.md#createmarketsellorderwithcost)
* [deepcoin](/exchanges/deepcoin.md#createmarketsellorderwithcost)
* [exmo](/exchanges/exmo.md#createmarketsellorderwithcost)
* [kucoin](/exchanges/kucoin.md#createmarketsellorderwithcost)
* [mexc](/exchanges/mexc.md#createmarketsellorderwithcost)
* [okx](/exchanges/okx.md#createmarketsellorderwithcost)
* [woo](/exchanges/woo.md#createmarketsellorderwithcost)

---

<a name="createOrder" id="createorder"></a>

## createOrder
create a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#createorder)
* [alpaca](/exchanges/alpaca.md#createorder)
* [apex](/exchanges/apex.md#createorder)
* [arkham](/exchanges/arkham.md#createorder)
* [ascendex](/exchanges/ascendex.md#createorder)
* [aster](/exchanges/aster.md#createorder)
* [backpack](/exchanges/backpack.md#createorder)
* [bigone](/exchanges/bigone.md#createorder)
* [binance](/exchanges/binance.md#createorder)
* [bingx](/exchanges/bingx.md#createorder)
* [bit2c](/exchanges/bit2c.md#createorder)
* [bitbank](/exchanges/bitbank.md#createorder)
* [bitbns](/exchanges/bitbns.md#createorder)
* [bitfinex](/exchanges/bitfinex.md#createorder)
* [bitflyer](/exchanges/bitflyer.md#createorder)
* [bitget](/exchanges/bitget.md#createorder)
* [bithumb](/exchanges/bithumb.md#createorder)
* [bitmart](/exchanges/bitmart.md#createorder)
* [bitmex](/exchanges/bitmex.md#createorder)
* [bitopro](/exchanges/bitopro.md#createorder)
* [bitrue](/exchanges/bitrue.md#createorder)
* [bitso](/exchanges/bitso.md#createorder)
* [bitstamp](/exchanges/bitstamp.md#createorder)
* [bitteam](/exchanges/bitteam.md#createorder)
* [bittrade](/exchanges/bittrade.md#createorder)
* [bitvavo](/exchanges/bitvavo.md#createorder)
* [blockchaincom](/exchanges/blockchaincom.md#createorder)
* [blofin](/exchanges/blofin.md#createorder)
* [btcbox](/exchanges/btcbox.md#createorder)
* [btcmarkets](/exchanges/btcmarkets.md#createorder)
* [btcturk](/exchanges/btcturk.md#createorder)
* [bullish](/exchanges/bullish.md#createorder)
* [bybit](/exchanges/bybit.md#createorder)
* [bydfi](/exchanges/bydfi.md#createorder)
* [cex](/exchanges/cex.md#createorder)
* [coinbase](/exchanges/coinbase.md#createorder)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#createorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#createorder)
* [coincatch](/exchanges/coincatch.md#createorder)
* [coincheck](/exchanges/coincheck.md#createorder)
* [coinex](/exchanges/coinex.md#createorder)
* [coinmate](/exchanges/coinmate.md#createorder)
* [coinmetro](/exchanges/coinmetro.md#createorder)
* [coinone](/exchanges/coinone.md#createorder)
* [coinsph](/exchanges/coinsph.md#createorder)
* [coinspot](/exchanges/coinspot.md#createorder)
* [cryptocom](/exchanges/cryptocom.md#createorder)
* [cryptomus](/exchanges/cryptomus.md#createorder)
* [deepcoin](/exchanges/deepcoin.md#createorder)
* [defx](/exchanges/defx.md#createorder)
* [delta](/exchanges/delta.md#createorder)
* [deribit](/exchanges/deribit.md#createorder)
* [derive](/exchanges/derive.md#createorder)
* [digifinex](/exchanges/digifinex.md#createorder)
* [dydx](/exchanges/dydx.md#createorder)
* [exmo](/exchanges/exmo.md#createorder)
* [foxbit](/exchanges/foxbit.md#createorder)
* [gate](/exchanges/gate.md#createorder)
* [gemini](/exchanges/gemini.md#createorder)
* [hashkey](/exchanges/hashkey.md#createorder)
* [hibachi](/exchanges/hibachi.md#createorder)
* [hitbtc](/exchanges/hitbtc.md#createorder)
* [hollaex](/exchanges/hollaex.md#createorder)
* [htx](/exchanges/htx.md#createorder)
* [hyperliquid](/exchanges/hyperliquid.md#createorder)
* [independentreserve](/exchanges/independentreserve.md#createorder)
* [indodax](/exchanges/indodax.md#createorder)
* [kraken](/exchanges/kraken.md#createorder)
* [krakenfutures](/exchanges/krakenfutures.md#createorder)
* [kucoin](/exchanges/kucoin.md#createorder)
* [kucoinfutures](/exchanges/kucoinfutures.md#createorder)
* [latoken](/exchanges/latoken.md#createorder)
* [lbank](/exchanges/lbank.md#createorder)
* [luno](/exchanges/luno.md#createorder)
* [mercado](/exchanges/mercado.md#createorder)
* [mexc](/exchanges/mexc.md#createorder)
* [modetrade](/exchanges/modetrade.md#createorder)
* [ndax](/exchanges/ndax.md#createorder)
* [novadax](/exchanges/novadax.md#createorder)
* [okx](/exchanges/okx.md#createorder)
* [onetrading](/exchanges/onetrading.md#createorder)
* [oxfun](/exchanges/oxfun.md#createorder)
* [p2b](/exchanges/p2b.md#createorder)
* [paradex](/exchanges/paradex.md#createorder)
* [paymium](/exchanges/paymium.md#createorder)
* [phemex](/exchanges/phemex.md#createorder)
* [poloniex](/exchanges/poloniex.md#createorder)
* [probit](/exchanges/probit.md#createorder)
* [timex](/exchanges/timex.md#createorder)
* [tokocrypto](/exchanges/tokocrypto.md#createorder)
* [toobit](/exchanges/toobit.md#createorder)
* [upbit](/exchanges/upbit.md#createorder)
* [wavesexchange](/exchanges/wavesexchange.md#createorder)
* [whitebit](/exchanges/whitebit.md#createorder)
* [woo](/exchanges/woo.md#createorder)
* [woofipro](/exchanges/woofipro.md#createorder)
* [xt](/exchanges/xt.md#createorder)
* [yobit](/exchanges/yobit.md#createorder)
* [zaif](/exchanges/zaif.md#createorder)
* [zebpay](/exchanges/zebpay.md#createorder)
* [zonda](/exchanges/zonda.md#createorder)

---

<a name="createOrderWithTakeProfitAndStopLoss" id="createorderwithtakeprofitandstoploss"></a>

## createOrderWithTakeProfitAndStopLoss
*swap markets only* create an order with a stop loss or take profit attached (type 3)

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency or the number of contracts |
| price | <code>float</code> | No | the price to fulfill the order, in units of the quote currency, ignored in market orders |
| takeProfit | <code>float</code> | No | the take profit price, in units of the quote currency |
| stopLoss | <code>float</code> | No | the stop loss price, in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coincatch](/exchanges/coincatch.md#createorderwithtakeprofitandstoploss)

---

<a name="createOrderWs" id="createorderws"></a>

## createOrderWs
create a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.test | <code>boolean</code> | Yes | test order, default false |
| params.returnRateLimits | <code>boolean</code> | Yes | set to true to return rate limit information, default false |

##### Supported exchanges
* [binance](/exchanges/binance.md#createorderws)
* [bitvavo](/exchanges/bitvavo.md#createorderws)
* [bybit](/exchanges/bybit.md#createorderws)
* [cex](/exchanges/cex.md#createorderws)
* [cryptocom](/exchanges/cryptocom.md#createorderws)
* [gate](/exchanges/gate.md#createorderws)
* [hyperliquid](/exchanges/hyperliquid.md#createorderws)
* [okx](/exchanges/okx.md#createorderws)
* [oxfun](/exchanges/oxfun.md#createorderws)

---

<a name="createOrders" id="createorders"></a>

## createOrders
create a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.postOnly | <code>bool</code> | No | true or false |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#createorders)
* [aster](/exchanges/aster.md#createorders)
* [backpack](/exchanges/backpack.md#createorders)
* [binance](/exchanges/binance.md#createorders)
* [bingx](/exchanges/bingx.md#createorders)
* [bitfinex](/exchanges/bitfinex.md#createorders)
* [bitget](/exchanges/bitget.md#createorders)
* [bitmart](/exchanges/bitmart.md#createorders)
* [blofin](/exchanges/blofin.md#createorders)
* [bybit](/exchanges/bybit.md#createorders)
* [bydfi](/exchanges/bydfi.md#createorders)
* [coincatch](/exchanges/coincatch.md#createorders)
* [coinex](/exchanges/coinex.md#createorders)
* [cryptocom](/exchanges/cryptocom.md#createorders)
* [digifinex](/exchanges/digifinex.md#createorders)
* [foxbit](/exchanges/foxbit.md#createorders)
* [gate](/exchanges/gate.md#createorders)
* [hashkey](/exchanges/hashkey.md#createorders)
* [hibachi](/exchanges/hibachi.md#createorders)
* [htx](/exchanges/htx.md#createorders)
* [hyperliquid](/exchanges/hyperliquid.md#createorders)
* [kraken](/exchanges/kraken.md#createorders)
* [krakenfutures](/exchanges/krakenfutures.md#createorders)
* [kucoin](/exchanges/kucoin.md#createorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#createorders)
* [mexc](/exchanges/mexc.md#createorders)
* [modetrade](/exchanges/modetrade.md#createorders)
* [okx](/exchanges/okx.md#createorders)
* [oxfun](/exchanges/oxfun.md#createorders)
* [woofipro](/exchanges/woofipro.md#createorders)

---

<a name="createOrdersRequest" id="createordersrequest"></a>

## createOrdersRequest
create a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#createordersrequest)

---

<a name="createOrdersWs" id="createordersws"></a>

## createOrdersWs
create a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [gate](/exchanges/gate.md#createordersws)
* [hyperliquid](/exchanges/hyperliquid.md#createordersws)

---

<a name="createSpotOrder" id="createspotorder"></a>

## createSpotOrder
create a trade order on spot market

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.cost | <code>float</code> | No | *market buy only* the quote quantity that can be used as an alternative for the amount |
| params.triggerPrice | <code>float</code> | No | the price that the order is to be triggered at |
| params.postOnly | <code>bool</code> | No | if true, the order will only be posted to the order book and not executed immediately |
| params.timeInForce | <code>string</code> | No | 'GTC', 'IOC', 'FOK' or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order (max length 40) |

##### Supported exchanges
* [coincatch](/exchanges/coincatch.md#createspotorder)
* [hashkey](/exchanges/hashkey.md#createspotorder)

---

<a name="createSwapOrder" id="createswaporder"></a>

## createSwapOrder
create a trade order on swap market

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of you want to trade in units of the base currency |
| price | <code>float</code> | No | the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.hedged | <code>bool</code> | No | must be set to true if position mode is hedged (default false) |
| params.postOnly | <code>bool</code> | No | *non-trigger orders only* if true, the order will only be posted to the order book and not executed immediately |
| params.reduceOnly | <code>bool</code> | No | true or false whether the order is reduce only |
| params.timeInForce | <code>string</code> | No | *non-trigger orders only* 'GTC', 'FOK', 'IOC' or 'PO' |
| params.clientOrderId | <code>string</code> | No | a unique id for the order |
| params.triggerPrice | <code>float</code> | No | the price that the order is to be triggered at |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.takeProfit | <code>object</code> | No | *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only) |
| params.takeProfit.triggerPrice | <code>float</code> | No | take profit trigger price |
| params.stopLoss | <code>object</code> | No | *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only) |
| params.stopLoss.triggerPrice | <code>float</code> | No | stop loss trigger price |

##### Supported exchanges
* [coincatch](/exchanges/coincatch.md#createswaporder)
* [hashkey](/exchanges/hashkey.md#createswaporder)

---

<a name="createTrailingAmountOrder" id="createtrailingamountorder"></a>

## createTrailingAmountOrder
create a trailing order by providing the symbol, type, side, amount, price and trailingAmount

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency, or number of contracts |
| price | <code>float</code> | No | the price for the order to be filled at, in units of the quote currency, ignored in market orders |
| trailingAmount | <code>float</code> | Yes | the quote amount to trail away from the current market price |
| trailingTriggerPrice | <code>float</code> | Yes | the price to activate a trailing order, default uses the price argument |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [woo](/exchanges/woo.md#createtrailingamountorder)

---

<a name="createTrailingPercentOrder" id="createtrailingpercentorder"></a>

## createTrailingPercentOrder
create a trailing order by providing the symbol, type, side, amount, price and trailingPercent

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much you want to trade in units of the base currency, or number of contracts |
| price | <code>float</code> | No | the price for the order to be filled at, in units of the quote currency, ignored in market orders |
| trailingPercent | <code>float</code> | Yes | the percent to trail away from the current market price |
| trailingTriggerPrice | <code>float</code> | Yes | the price to activate a trailing order, default uses the price argument |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [htx](/exchanges/htx.md#createtrailingpercentorder)
* [woo](/exchanges/woo.md#createtrailingpercentorder)

---

<a name="createVault" id="createvault"></a>

## createVault
creates a value

**Kind**: instance   
**Returns**: <code>object</code> - the api result


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| name | <code>string</code> | Yes | The name of the vault |
| description | <code>string</code> | Yes | The description of the vault |
| initialUsd | <code>number</code> | Yes | The initialUsd of the vault |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#createvault)

---

<a name="deposit" id="deposit"></a>

## deposit
make a deposit

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to deposit |
| id | <code>string</code> | Yes | the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the id of the account to deposit into |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#deposit)

---

<a name="editContractOrder" id="editcontractorder"></a>

## editContractOrder
edit a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to edit an order in a portfolio margin account |

##### Supported exchanges
* [binance](/exchanges/binance.md#editcontractorder)

---

<a name="editOrder" id="editorder"></a>

## editOrder
edit a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market to create an order in |
| type | <code>string</code> | No | 'market', 'limit' or 'stop_limit' |
| side | <code>string</code> | No | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code> | No | the price for the order, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>string</code> | No | the price to trigger a stop order |
| params.timeInForce | <code>string</code> | No | for crypto trading either 'gtc' or 'ioc' can be used |
| params.clientOrderId | <code>string</code> | No | a unique identifier for the order, automatically generated if not sent |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#editorder)
* [binance](/exchanges/binance.md#editorder)
* [bingx](/exchanges/bingx.md#editorder)
* [bitfinex](/exchanges/bitfinex.md#editorder)
* [bitget](/exchanges/bitget.md#editorder)
* [bitmart](/exchanges/bitmart.md#editorder)
* [bitvavo](/exchanges/bitvavo.md#editorder)
* [bullish](/exchanges/bullish.md#editorder)
* [bybit](/exchanges/bybit.md#editorder)
* [bydfi](/exchanges/bydfi.md#editorder)
* [coinbase](/exchanges/coinbase.md#editorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#editorder)
* [coincatch](/exchanges/coincatch.md#editorder)
* [coinex](/exchanges/coinex.md#editorder)
* [cryptocom](/exchanges/cryptocom.md#editorder)
* [deepcoin](/exchanges/deepcoin.md#editorder)
* [delta](/exchanges/delta.md#editorder)
* [deribit](/exchanges/deribit.md#editorder)
* [derive](/exchanges/derive.md#editorder)
* [exmo](/exchanges/exmo.md#editorder)
* [foxbit](/exchanges/foxbit.md#editorder)
* [gate](/exchanges/gate.md#editorder)
* [hibachi](/exchanges/hibachi.md#editorder)
* [hyperliquid](/exchanges/hyperliquid.md#editorder)
* [kraken](/exchanges/kraken.md#editorder)
* [krakenfutures](/exchanges/krakenfutures.md#editorder)
* [kucoin](/exchanges/kucoin.md#editorder)
* [modetrade](/exchanges/modetrade.md#editorder)
* [okx](/exchanges/okx.md#editorder)
* [phemex](/exchanges/phemex.md#editorder)
* [poloniex](/exchanges/poloniex.md#editorder)
* [upbit](/exchanges/upbit.md#editorder)
* [whitebit](/exchanges/whitebit.md#editorder)
* [woo](/exchanges/woo.md#editorder)
* [woofipro](/exchanges/woofipro.md#editorder)
* [xt](/exchanges/xt.md#editorder)

---

<a name="editOrderWs" id="editorderws"></a>

## editOrderWs
edit a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of the currency you want to trade in units of the base currency |
| price | <code>float</code>, <code>undefined</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#editorderws)
* [bitvavo](/exchanges/bitvavo.md#editorderws)
* [bybit](/exchanges/bybit.md#editorderws)
* [cex](/exchanges/cex.md#editorderws)
* [cryptocom](/exchanges/cryptocom.md#editorderws)
* [gate](/exchanges/gate.md#editorderws)
* [hyperliquid](/exchanges/hyperliquid.md#editorderws)
* [okx](/exchanges/okx.md#editorderws)
* [oxfun](/exchanges/oxfun.md#editorderws)

---

<a name="editOrders" id="editorders"></a>

## editOrders
edit a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#editorders)
* [bybit](/exchanges/bybit.md#editorders)
* [bydfi](/exchanges/bydfi.md#editorders)
* [coinex](/exchanges/coinex.md#editorders)
* [hibachi](/exchanges/hibachi.md#editorders)
* [hyperliquid](/exchanges/hyperliquid.md#editorders)

---

<a name="enableDemoTrading" id="enabledemotrading"></a>

## enableDemoTrading
enables or disables demo trading mode

**Kind**: instance   


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| enable | <code>boolean</code> | No | true if demo trading should be enabled, false otherwise |

##### Supported exchanges
* [binance](/exchanges/binance.md#enabledemotrading)
* [bitget](/exchanges/bitget.md#enabledemotrading)
* [bybit](/exchanges/bybit.md#enabledemotrading)

---

<a name="fetchAccount" id="fetchaccount"></a>

## fetchAccount
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchaccount)

---

<a name="fetchAccountIdByType" id="fetchaccountidbytype"></a>

## fetchAccountIdByType
fetch all the accounts by a type and marginModeassociated with a profile

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| type | <code>string</code> | Yes | 'spot', 'swap' or 'future |
| marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| symbol | <code>string</code> | No | unified ccxt market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [htx](/exchanges/htx.md#fetchaccountidbytype)

---

<a name="fetchAccounts" id="fetchaccounts"></a>

## fetchAccounts
fetch all the accounts associated with a profile

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#fetchaccounts)
* [ascendex](/exchanges/ascendex.md#fetchaccounts)
* [bittrade](/exchanges/bittrade.md#fetchaccounts)
* [bullish](/exchanges/bullish.md#fetchaccounts)
* [coinbase](/exchanges/coinbase.md#fetchaccounts)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchaccounts)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchaccounts)
* [cryptocom](/exchanges/cryptocom.md#fetchaccounts)
* [deribit](/exchanges/deribit.md#fetchaccounts)
* [dydx](/exchanges/dydx.md#fetchaccounts)
* [hashkey](/exchanges/hashkey.md#fetchaccounts)
* [htx](/exchanges/htx.md#fetchaccounts)
* [kucoin](/exchanges/kucoin.md#fetchaccounts)
* [luno](/exchanges/luno.md#fetchaccounts)
* [mexc](/exchanges/mexc.md#fetchaccounts)
* [ndax](/exchanges/ndax.md#fetchaccounts)
* [novadax](/exchanges/novadax.md#fetchaccounts)
* [okx](/exchanges/okx.md#fetchaccounts)
* [oxfun](/exchanges/oxfun.md#fetchaccounts)
* [whitebit](/exchanges/whitebit.md#fetchaccounts)
* [woo](/exchanges/woo.md#fetchaccounts)

---

<a name="fetchAllGreeks" id="fetchallgreeks"></a>

## fetchAllGreeks
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance   
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/?id=greeks-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch greeks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchallgreeks)
* [bybit](/exchanges/bybit.md#fetchallgreeks)
* [okx](/exchanges/okx.md#fetchallgreeks)
* [paradex](/exchanges/paradex.md#fetchallgreeks)

---

<a name="fetchBalance" id="fetchbalance"></a>

## fetchBalance
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchbalance)
* [alpaca](/exchanges/alpaca.md#fetchbalance)
* [apex](/exchanges/apex.md#fetchbalance)
* [arkham](/exchanges/arkham.md#fetchbalance)
* [ascendex](/exchanges/ascendex.md#fetchbalance)
* [aster](/exchanges/aster.md#fetchbalance)
* [backpack](/exchanges/backpack.md#fetchbalance)
* [bigone](/exchanges/bigone.md#fetchbalance)
* [binance](/exchanges/binance.md#fetchbalance)
* [bingx](/exchanges/bingx.md#fetchbalance)
* [bit2c](/exchanges/bit2c.md#fetchbalance)
* [bitbank](/exchanges/bitbank.md#fetchbalance)
* [bitbns](/exchanges/bitbns.md#fetchbalance)
* [bitfinex](/exchanges/bitfinex.md#fetchbalance)
* [bitflyer](/exchanges/bitflyer.md#fetchbalance)
* [bitget](/exchanges/bitget.md#fetchbalance)
* [bithumb](/exchanges/bithumb.md#fetchbalance)
* [bitmart](/exchanges/bitmart.md#fetchbalance)
* [bitmex](/exchanges/bitmex.md#fetchbalance)
* [bitopro](/exchanges/bitopro.md#fetchbalance)
* [bitrue](/exchanges/bitrue.md#fetchbalance)
* [bitso](/exchanges/bitso.md#fetchbalance)
* [bitstamp](/exchanges/bitstamp.md#fetchbalance)
* [betteam](/exchanges/betteam.md#fetchbalance)
* [bittrade](/exchanges/bittrade.md#fetchbalance)
* [bitvavo](/exchanges/bitvavo.md#fetchbalance)
* [blockchaincom](/exchanges/blockchaincom.md#fetchbalance)
* [blofin](/exchanges/blofin.md#fetchbalance)
* [btcbox](/exchanges/btcbox.md#fetchbalance)
* [btcmarkets](/exchanges/btcmarkets.md#fetchbalance)
* [btcturk](/exchanges/btcturk.md#fetchbalance)
* [bullish](/exchanges/bullish.md#fetchbalance)
* [bybit](/exchanges/bybit.md#fetchbalance)
* [bydfi](/exchanges/bydfi.md#fetchbalance)
* [cex](/exchanges/cex.md#fetchbalance)
* [coinbase](/exchanges/coinbase.md#fetchbalance)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchbalance)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchbalance)
* [coincatch](/exchanges/coincatch.md#fetchbalance)
* [coincheck](/exchanges/coincheck.md#fetchbalance)
* [coinex](/exchanges/coinex.md#fetchbalance)
* [coinmate](/exchanges/coinmate.md#fetchbalance)
* [coinmetro](/exchanges/coinmetro.md#fetchbalance)
* [coinone](/exchanges/coinone.md#fetchbalance)
* [coinsph](/exchanges/coinsph.md#fetchbalance)
* [coinspot](/exchanges/coinspot.md#fetchbalance)
* [cryptocom](/exchanges/cryptocom.md#fetchbalance)
* [cryptomus](/exchanges/cryptomus.md#fetchbalance)
* [deepcoin](/exchanges/deepcoin.md#fetchbalance)
* [defx](/exchanges/defx.md#fetchbalance)
* [delta](/exchanges/delta.md#fetchbalance)
* [deribit](/exchanges/deribit.md#fetchbalance)
* [derive](/exchanges/derive.md#fetchbalance)
* [digifinex](/exchanges/digifinex.md#fetchbalance)
* [dydx](/exchanges/dydx.md#fetchbalance)
* [exmo](/exchanges/exmo.md#fetchbalance)
* [foxbit](/exchanges/foxbit.md#fetchbalance)
* [gate](/exchanges/gate.md#fetchbalance)
* [gemini](/exchanges/gemini.md#fetchbalance)
* [hashkey](/exchanges/hashkey.md#fetchbalance)
* [hibachi](/exchanges/hibachi.md#fetchbalance)
* [hitbtc](/exchanges/hitbtc.md#fetchbalance)
* [hollaex](/exchanges/hollaex.md#fetchbalance)
* [htx](/exchanges/htx.md#fetchbalance)
* [hyperliquid](/exchanges/hyperliquid.md#fetchbalance)
* [independentreserve](/exchanges/independentreserve.md#fetchbalance)
* [indodax](/exchanges/indodax.md#fetchbalance)
* [kraken](/exchanges/kraken.md#fetchbalance)
* [krakenfutures](/exchanges/krakenfutures.md#fetchbalance)
* [kucoin](/exchanges/kucoin.md#fetchbalance)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchbalance)
* [latoken](/exchanges/latoken.md#fetchbalance)
* [lbank](/exchanges/lbank.md#fetchbalance)
* [luno](/exchanges/luno.md#fetchbalance)
* [mercado](/exchanges/mercado.md#fetchbalance)
* [mexc](/exchanges/mexc.md#fetchbalance)
* [modetrade](/exchanges/modetrade.md#fetchbalance)
* [ndax](/exchanges/ndax.md#fetchbalance)
* [novadax](/exchanges/novadax.md#fetchbalance)
* [okx](/exchanges/okx.md#fetchbalance)
* [onetrading](/exchanges/onetrading.md#fetchbalance)
* [oxfun](/exchanges/oxfun.md#fetchbalance)
* [p2b](/exchanges/p2b.md#fetchbalance)
* [paradex](/exchanges/paradex.md#fetchbalance)
* [paymium](/exchanges/paymium.md#fetchbalance)
* [phemex](/exchanges/phemex.md#fetchbalance)
* [poloniex](/exchanges/poloniex.md#fetchbalance)
* [probit](/exchanges/probit.md#fetchbalance)
* [timex](/exchanges/timex.md#fetchbalance)
* [tokocrypto](/exchanges/tokocrypto.md#fetchbalance)
* [toobit](/exchanges/toobit.md#fetchbalance)
* [upbit](/exchanges/upbit.md#fetchbalance)
* [wavesexchange](/exchanges/wavesexchange.md#fetchbalance)
* [whitebit](/exchanges/whitebit.md#fetchbalance)
* [woo](/exchanges/woo.md#fetchbalance)
* [woofipro](/exchanges/woofipro.md#fetchbalance)
* [xt](/exchanges/xt.md#fetchbalance)
* [yobit](/exchanges/yobit.md#fetchbalance)
* [zaif](/exchanges/zaif.md#fetchbalance)
* [zebpay](/exchanges/zebpay.md#fetchbalance)
* [zonda](/exchanges/zonda.md#fetchbalance)

---

<a name="fetchBalanceWs" id="fetchbalancews"></a>

## fetchBalanceWs
fetch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code>, <code>undefined</code> | No | 'future', 'delivery', 'savings', 'funding', or 'spot' |
| params.marginMode | <code>string</code>, <code>undefined</code> | No | 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null |
| params.symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | No | unified market symbols, only used in isolated margin mode |
| params.method | <code>string</code>, <code>undefined</code> | No | method to use. Can be account.balance, account.status, v2/account.balance or v2/account.status |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchbalancews)
* [bitvavo](/exchanges/bitvavo.md#fetchbalancews)
* [cex](/exchanges/cex.md#fetchbalancews)

---

<a name="fetchBidsAsks" id="fetchbidsasks"></a>

## fetchBidsAsks
fetches the bid and ask price and volume for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchbidsasks)
* [bitrue](/exchanges/bitrue.md#fetchbidsasks)
* [bybit](/exchanges/bybit.md#fetchbidsasks)
* [coinbase](/exchanges/coinbase.md#fetchbidsasks)
* [coinmetro](/exchanges/coinmetro.md#fetchbidsasks)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchbidsasks)
* [mexc](/exchanges/mexc.md#fetchbidsasks)
* [tokocrypto](/exchanges/tokocrypto.md#fetchbidsasks)
* [toobit](/exchanges/toobit.md#fetchbidsasks)
* [xt](/exchanges/xt.md#fetchbidsasks)

---

<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

## fetchBorrowInterest
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/?id=borrow-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | unified market symbol when fetch interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch the borrow interest in a portfolio margin account |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchborrowinterest)
* [bitget](/exchanges/bitget.md#fetchborrowinterest)
* [bitmart](/exchanges/bitmart.md#fetchborrowinterest)
* [bybit](/exchanges/bybit.md#fetchborrowinterest)
* [coinex](/exchanges/coinex.md#fetchborrowinterest)
* [gate](/exchanges/gate.md#fetchborrowinterest)
* [htx](/exchanges/htx.md#fetchborrowinterest)
* [kucoin](/exchanges/kucoin.md#fetchborrowinterest)
* [okx](/exchanges/okx.md#fetchborrowinterest)
* [whitebit](/exchanges/whitebit.md#fetchborrowinterest)

---

<a name="fetchBorrowRateHistories" id="fetchborrowratehistories"></a>

## fetchBorrowRateHistories
retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure) indexed by the market symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest borrowRate, default is undefined |
| limit | <code>int</code> | No | max number of borrow rate prices to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default is 'cross' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |

##### Supported exchanges
* [kucoin](/exchanges/kucoin.md#fetchborrowratehistories)
* [okx](/exchanges/okx.md#fetchborrowratehistories)

---

<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

## fetchBorrowRateHistory
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure) to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchborrowratehistory)
* [bullish](/exchanges/bullish.md#fetchborrowratehistory)
* [bybit](/exchanges/bybit.md#fetchborrowratehistory)
* [kucoin](/exchanges/kucoin.md#fetchborrowratehistory)
* [okx](/exchanges/okx.md#fetchborrowratehistory)

---

<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

## fetchCanceledAndClosedOrders
fetches information on multiple canceled orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch orders in a portfolio margin account |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchcanceledandclosedorders)
* [bingx](/exchanges/bingx.md#fetchcanceledandclosedorders)
* [bitget](/exchanges/bitget.md#fetchcanceledandclosedorders)
* [bullish](/exchanges/bullish.md#fetchcanceledandclosedorders)
* [bybit](/exchanges/bybit.md#fetchcanceledandclosedorders)
* [bydfi](/exchanges/bydfi.md#fetchcanceledandclosedorders)
* [coincatch](/exchanges/coincatch.md#fetchcanceledandclosedorders)
* [coinmetro](/exchanges/coinmetro.md#fetchcanceledandclosedorders)
* [deepcoin](/exchanges/deepcoin.md#fetchcanceledandclosedorders)
* [hashkey](/exchanges/hashkey.md#fetchcanceledandclosedorders)
* [hyperliquid](/exchanges/hyperliquid.md#fetchcanceledandclosedorders)

---

<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

## fetchCanceledOrders
fetches information on multiple canceled orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch orders in a portfolio margin account |
| params.trigger | <code>boolean</code> | No | set to true if you would like to fetch portfolio margin account trigger or conditional orders |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchcanceledorders)
* [bingx](/exchanges/bingx.md#fetchcanceledorders)
* [bitget](/exchanges/bitget.md#fetchcanceledorders)
* [bitmart](/exchanges/bitmart.md#fetchcanceledorders)
* [bitteam](/exchanges/bitteam.md#fetchcanceledorders)
* [blockchaincom](/exchanges/blockchaincom.md#fetchcanceledorders)
* [bullish](/exchanges/bullish.md#fetchcanceledorders)
* [bybit](/exchanges/bybit.md#fetchcanceledorders)
* [coinbase](/exchanges/coinbase.md#fetchcanceledorders)
* [deepcoin](/exchanges/deepcoin.md#fetchcanceledorders)
* [defx](/exchanges/defx.md#fetchcanceledorders)
* [derive](/exchanges/derive.md#fetchcanceledorders)
* [exmo](/exchanges/exmo.md#fetchcanceledorders)
* [hyperliquid](/exchanges/hyperliquid.md#fetchcanceledorders)
* [krakenfutures](/exchanges/krakenfutures.md#fetchcanceledorders)
* [mexc](/exchanges/mexc.md#fetchcanceledorders)
* [okx](/exchanges/okx.md#fetchcanceledorders)
* [upbit](/exchanges/upbit.md#fetchcanceledorders)
* [xt](/exchanges/xt.md#fetchcanceledorders)

---

<a name="fetchClosedOrder" id="fetchclosedorder"></a>

## fetchClosedOrder
fetch an open order by it's id

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#fetchclosedorder)
* [bybit](/exchanges/bybit.md#fetchclosedorder)
* [cex](/exchanges/cex.md#fetchclosedorder)
* [deepcoin](/exchanges/deepcoin.md#fetchclosedorder)

---

<a name="fetchClosedOrders" id="fetchclosedorders"></a>

## fetchClosedOrders
fetches information on multiple closed orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchclosedorders)
* [alpaca](/exchanges/alpaca.md#fetchclosedorders)
* [arkham](/exchanges/arkham.md#fetchclosedorders)
* [ascendex](/exchanges/ascendex.md#fetchclosedorders)
* [bigone](/exchanges/bigone.md#fetchclosedorders)
* [binance](/exchanges/binance.md#fetchclosedorders)
* [bingx](/exchanges/bingx.md#fetchclosedorders)
* [bitfinex](/exchanges/bitfinex.md#fetchclosedorders)
* [bitflyer](/exchanges/bitflyer.md#fetchclosedorders)
* [bitget](/exchanges/bitget.md#fetchclosedorders)
* [bitmart](/exchanges/bitmart.md#fetchclosedorders)
* [bitmex](/exchanges/bitmex.md#fetchclosedorders)
* [bitopro](/exchanges/bitopro.md#fetchclosedorders)
* [bitrue](/exchanges/bitrue.md#fetchclosedorders)
* [bitteam](/exchanges/bitteam.md#fetchclosedorders)
* [bittrade](/exchanges/bittrade.md#fetchclosedorders)
* [blockchaincom](/exchanges/blockchaincom.md#fetchclosedorders)
* [blofin](/exchanges/blofin.md#fetchclosedorders)
* [btcmarkets](/exchanges/btcmarkets.md#fetchclosedorders)
* [bullish](/exchanges/bullish.md#fetchclosedorders)
* [bybit](/exchanges/bybit.md#fetchclosedorders)
* [cex](/exchanges/cex.md#fetchclosedorders)
* [coinbase](/exchanges/coinbase.md#fetchclosedorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchclosedorders)
* [coinex](/exchanges/coinex.md#fetchclosedorders)
* [coinsph](/exchanges/coinsph.md#fetchclosedorders)
* [deepcoin](/exchanges/deepcoin.md#fetchclosedorders)
* [defx](/exchanges/defx.md#fetchclosedorders)
* [delta](/exchanges/delta.md#fetchclosedorders)
* [deribit](/exchanges/deribit.md#fetchclosedorders)
* [derive](/exchanges/derive.md#fetchclosedorders)
* [dydx](/exchanges/dydx.md#fetchclosedorders)
* [foxbit](/exchanges/foxbit.md#fetchclosedorders)
* [gate](/exchanges/gate.md#fetchclosedorders)
* [hitbtc](/exchanges/hitbtc.md#fetchclosedorders)
* [hollaex](/exchanges/hollaex.md#fetchclosedorders)
* [htx](/exchanges/htx.md#fetchclosedorders)
* [hyperliquid](/exchanges/hyperliquid.md#fetchclosedorders)
* [independentreserve](/exchanges/independentreserve.md#fetchclosedorders)
* [indodax](/exchanges/indodax.md#fetchclosedorders)
* [kraken](/exchanges/kraken.md#fetchclosedorders)
* [krakenfutures](/exchanges/krakenfutures.md#fetchclosedorders)
* [kucoin](/exchanges/kucoin.md#fetchclosedorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchclosedorders)
* [luno](/exchanges/luno.md#fetchclosedorders)
* [mexc](/exchanges/mexc.md#fetchclosedorders)
* [modetrade](/exchanges/modetrade.md#fetchclosedorders)
* [novadax](/exchanges/novadax.md#fetchclosedorders)
* [okx](/exchanges/okx.md#fetchclosedorders)
* [onetrading](/exchanges/onetrading.md#fetchclosedorders)
* [p2b](/exchanges/p2b.md#fetchclosedorders)
* [phemex](/exchanges/phemex.md#fetchclosedorders)
* [poloniex](/exchanges/poloniex.md#fetchclosedorders)
* [probit](/exchanges/probit.md#fetchclosedorders)
* [timex](/exchanges/timex.md#fetchclosedorders)
* [tokocrypto](/exchanges/tokocrypto.md#fetchclosedorders)
* [toobit](/exchanges/toobit.md#fetchclosedorders)
* [upbit](/exchanges/upbit.md#fetchclosedorders)
* [wavesexchange](/exchanges/wavesexchange.md#fetchclosedorders)
* [whitebit](/exchanges/whitebit.md#fetchclosedorders)
* [woo](/exchanges/woo.md#fetchclosedorders)
* [woofipro](/exchanges/woofipro.md#fetchclosedorders)
* [xt](/exchanges/xt.md#fetchclosedorders)
* [zaif](/exchanges/zaif.md#fetchclosedorders)

---

<a name="fetchClosedOrdersWs" id="fetchclosedordersws"></a>

## fetchClosedOrdersWs
fetch closed orders

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchclosedordersws)
* [gate](/exchanges/gate.md#fetchclosedordersws)

---

<a name="fetchConvertCurrencies" id="fetchconvertcurrencies"></a>

## fetchConvertCurrencies
fetches all available currencies that can be converted

**Kind**: instance   
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchconvertcurrencies)
* [bitget](/exchanges/bitget.md#fetchconvertcurrencies)
* [bybit](/exchanges/bybit.md#fetchconvertcurrencies)
* [okx](/exchanges/okx.md#fetchconvertcurrencies)
* [woo](/exchanges/woo.md#fetchconvertcurrencies)

---

<a name="fetchConvertQuote" id="fetchconvertquote"></a>

## fetchConvertQuote
fetch a quote for converting from one currency to another

**Kind**: instance   
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | Yes | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.walletType | <code>string</code> | No | either 'SPOT' or 'FUNDING', the default is 'SPOT' |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchconvertquote)
* [bitget](/exchanges/bitget.md#fetchconvertquote)
* [bybit](/exchanges/bybit.md#fetchconvertquote)
* [coinbase](/exchanges/coinbase.md#fetchconvertquote)
* [okx](/exchanges/okx.md#fetchconvertquote)
* [phemex](/exchanges/phemex.md#fetchconvertquote)
* [whitebit](/exchanges/whitebit.md#fetchconvertquote)
* [woo](/exchanges/woo.md#fetchconvertquote)

---

<a name="fetchConvertTrade" id="fetchconverttrade"></a>

## fetchConvertTrade
fetch the data for a conversion trade

**Kind**: instance   
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to fetch |
| code | <code>string</code> | No | the unified currency code of the conversion trade |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchconverttrade)
* [bybit](/exchanges/bybit.md#fetchconverttrade)
* [coinbase](/exchanges/coinbase.md#fetchconverttrade)
* [okx](/exchanges/okx.md#fetchconverttrade)
* [woo](/exchanges/woo.md#fetchconverttrade)

---

<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

## fetchConvertTradeHistory
fetch the users history of conversion trades

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest conversion to fetch |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchconverttradehistory)
* [bitget](/exchanges/bitget.md#fetchconverttradehistory)
* [bybit](/exchanges/bybit.md#fetchconverttradehistory)
* [okx](/exchanges/okx.md#fetchconverttradehistory)
* [phemex](/exchanges/phemex.md#fetchconverttradehistory)
* [whitebit](/exchanges/whitebit.md#fetchconverttradehistory)
* [woo](/exchanges/woo.md#fetchconverttradehistory)

---

<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

## fetchCrossBorrowRate
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance   
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchcrossborrowrate)
* [bitget](/exchanges/bitget.md#fetchcrossborrowrate)
* [bybit](/exchanges/bybit.md#fetchcrossborrowrate)
* [digifinex](/exchanges/digifinex.md#fetchcrossborrowrate)
* [okx](/exchanges/okx.md#fetchcrossborrowrate)
* [whitebit](/exchanges/whitebit.md#fetchcrossborrowrate)

---

<a name="fetchCrossBorrowRates" id="fetchcrossborrowrates"></a>

## fetchCrossBorrowRates
fetch the borrow interest rates of all currencies

**Kind**: instance   
**Returns**: <code>object</code> - a list of [borrow rate structures](https://docs.ccxt.com/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [digifinex](/exchanges/digifinex.md#fetchcrossborrowrates)
* [okx](/exchanges/okx.md#fetchcrossborrowrates)

---

<a name="fetchCurrencies" id="fetchcurrencies"></a>

## fetchCurrencies
fetches all available currencies on an exchange

**Kind**: instance   
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchcurrencies)
* [arkham](/exchanges/arkham.md#fetchcurrencies)
* [ascendex](/exchanges/ascendex.md#fetchcurrencies)
* [aster](/exchanges/aster.md#fetchcurrencies)
* [backpack](/exchanges/backpack.md#fetchcurrencies)
* [bigone](/exchanges/bigone.md#fetchcurrencies)
* [binance](/exchanges/binance.md#fetchcurrencies)
* [bingx](/exchanges/bingx.md#fetchcurrencies)
* [bitfinex](/exchanges/bitfinex.md#fetchcurrencies)
* [bitget](/exchanges/bitget.md#fetchcurrencies)
* [bitmart](/exchanges/bitmart.md#fetchcurrencies)
* [bitmex](/exchanges/bitmex.md#fetchcurrencies)
* [bitopro](/exchanges/bitopro.md#fetchcurrencies)
* [bitrue](/exchanges/bitrue.md#fetchcurrencies)
* [bitstamp](/exchanges/bitstamp.md#fetchcurrencies)
* [bitteam](/exchanges/bitteam.md#fetchcurrencies)
* [bittrade](/exchanges/bittrade.md#fetchcurrencies)
* [bitvavo](/exchanges/bitvavo.md#fetchcurrencies)
* [bullish](/exchanges/bullish.md#fetchcurrencies)
* [bybit](/exchanges/bybit.md#fetchcurrencies)
* [cex](/exchanges/cex.md#fetchcurrencies)
* [coinbase](/exchanges/coinbase.md#fetchcurrencies)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchcurrencies)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchcurrencies)
* [coincatch](/exchanges/coincatch.md#fetchcurrencies)
* [coinex](/exchanges/coinex.md#fetchcurrencies)
* [coinmetro](/exchanges/coinmetro.md#fetchcurrencies)
* [coinone](/exchanges/coinone.md#fetchcurrencies)
* [coinsph](/exchanges/coinsph.md#fetchcurrencies)
* [cryptocom](/exchanges/cryptocom.md#fetchcurrencies)
* [cryptomus](/exchanges/cryptomus.md#fetchcurrencies)
* [delta](/exchanges/delta.md#fetchcurrencies)
* [deribit](/exchanges/deribit.md#fetchcurrencies)
* [derive](/exchanges/derive.md#fetchcurrencies)
* [digifinex](/exchanges/digifinex.md#fetchcurrencies)
* [exmo](/exchanges/exmo.md#fetchcurrencies)
* [gate](/exchanges/gate.md#fetchcurrencies)
* [gemini](/exchanges/gemini.md#fetchcurrencies)
* [hashkey](/exchanges/hashkey.md#fetchcurrencies)
* [hitbtc](/exchanges/hitbtc.md#fetchcurrencies)
* [hollaex](/exchanges/hollaex.md#fetchcurrencies)
* [htx](/exchanges/htx.md#fetchcurrencies)
* [hyperliquid](/exchanges/hyperliquid.md#fetchcurrencies)
* [kraken](/exchanges/kraken.md#fetchcurrencies)
* [kucoin](/exchanges/kucoin.md#fetchcurrencies)
* [latoken](/exchanges/latoken.md#fetchcurrencies)
* [lbank](/exchanges/lbank.md#fetchcurrencies)
* [luno](/exchanges/luno.md#fetchcurrencies)
* [mexc](/exchanges/mexc.md#fetchcurrencies)
* [modetrade](/exchanges/modetrade.md#fetchcurrencies)
* [ndax](/exchanges/ndax.md#fetchcurrencies)
* [okx](/exchanges/okx.md#fetchcurrencies)
* [onetrading](/exchanges/onetrading.md#fetchcurrencies)
* [oxfun](/exchanges/oxfun.md#fetchcurrencies)
* [phemex](/exchanges/phemex.md#fetchcurrencies)
* [poloniex](/exchanges/poloniex.md#fetchcurrencies)
* [probit](/exchanges/probit.md#fetchcurrencies)
* [timex](/exchanges/timex.md#fetchcurrencies)
* [toobit](/exchanges/toobit.md#fetchcurrencies)
* [whitebit](/exchanges/whitebit.md#fetchcurrencies)
* [woo](/exchanges/woo.md#fetchcurrencies)
* [woofipro](/exchanges/woofipro.md#fetchcurrencies)
* [xt](/exchanges/xt.md#fetchcurrencies)
* [zebpay](/exchanges/zebpay.md#fetchcurrencies)

---

<a name="fetchCurrenciesWs" id="fetchcurrenciesws"></a>

## fetchCurrenciesWs
fetches all available currencies on an exchange

**Kind**: instance   
**Returns**: <code>object</code> - an associative dictionary of currencies


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#fetchcurrenciesws)

---

<a name="fetchDeposit" id="fetchdeposit"></a>

## fetchDeposit
fetch information on a deposit

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | not used by bitmart fetchDeposit () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#fetchdeposit)
* [bitso](/exchanges/bitso.md#fetchdeposit)
* [blockchaincom](/exchanges/blockchaincom.md#fetchdeposit)
* [coinbase](/exchanges/coinbase.md#fetchdeposit)
* [exmo](/exchanges/exmo.md#fetchdeposit)
* [okx](/exchanges/okx.md#fetchdeposit)
* [upbit](/exchanges/upbit.md#fetchdeposit)
* [whitebit](/exchanges/whitebit.md#fetchdeposit)

---

<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

## fetchDepositAddress
fetch the deposit address for a currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#fetchdepositaddress)
* [arkham](/exchanges/arkham.md#fetchdepositaddress)
* [ascendex](/exchanges/ascendex.md#fetchdepositaddress)
* [backpack](/exchanges/backpack.md#fetchdepositaddress)
* [bigone](/exchanges/bigone.md#fetchdepositaddress)
* [binance](/exchanges/binance.md#fetchdepositaddress)
* [bingx](/exchanges/bingx.md#fetchdepositaddress)
* [bit2c](/exchanges/bit2c.md#fetchdepositaddress)
* [bitbank](/exchanges/bitbank.md#fetchdepositaddress)
* [bitbns](/exchanges/bitbns.md#fetchdepositaddress)
* [bitfinex](/exchanges/bitfinex.md#fetchdepositaddress)
* [bitget](/exchanges/bitget.md#fetchdepositaddress)
* [bitmart](/exchanges/bitmart.md#fetchdepositaddress)
* [bitmex](/exchanges/bitmex.md#fetchdepositaddress)
* [bitso](/exchanges/bitso.md#fetchdepositaddress)
* [bitstamp](/exchanges/bitstamp.md#fetchdepositaddress)
* [bitvavo](/exchanges/bitvavo.md#fetchdepositaddress)
* [blockchaincom](/exchanges/blockchaincom.md#fetchdepositaddress)
* [bullish](/exchanges/bullish.md#fetchdepositaddress)
* [bybit](/exchanges/bybit.md#fetchdepositaddress)
* [cex](/exchanges/cex.md#fetchdepositaddress)
* [coinbase](/exchanges/coinbase.md#fetchdepositaddress)
* [coincatch](/exchanges/coincatch.md#fetchdepositaddress)
* [coinex](/exchanges/coinex.md#fetchdepositaddress)
* [coinsph](/exchanges/coinsph.md#fetchdepositaddress)
* [cryptocom](/exchanges/cryptocom.md#fetchdepositaddress)
* [deepcoin](/exchanges/deepcoin.md#fetchdepositaddress)
* [delta](/exchanges/delta.md#fetchdepositaddress)
* [deribit](/exchanges/deribit.md#fetchdepositaddress)
* [digifinex](/exchanges/digifinex.md#fetchdepositaddress)
* [exmo](/exchanges/exmo.md#fetchdepositaddress)
* [foxbit](/exchanges/foxbit.md#fetchdepositaddress)
* [gate](/exchanges/gate.md#fetchdepositaddress)
* [gemini](/exchanges/gemini.md#fetchdepositaddress)
* [hashkey](/exchanges/hashkey.md#fetchdepositaddress)
* [hibachi](/exchanges/hibachi.md#fetchdepositaddress)
* [hitbtc](/exchanges/hitbtc.md#fetchdepositaddress)
* [htx](/exchanges/htx.md#fetchdepositaddress)
* [independentreserve](/exchanges/independentreserve.md#fetchdepositaddress)
* [kraken](/exchanges/kraken.md#fetchdepositaddress)
* [kucoin](/exchanges/kucoin.md#fetchdepositaddress)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchdepositaddress)
* [lbank](/exchanges/lbank.md#fetchdepositaddress)
* [luno](/exchanges/luno.md#fetchdepositaddress)
* [mexc](/exchanges/mexc.md#fetchdepositaddress)
* [ndax](/exchanges/ndax.md#fetchdepositaddress)
* [okx](/exchanges/okx.md#fetchdepositaddress)
* [oxfun](/exchanges/oxfun.md#fetchdepositaddress)
* [paymium](/exchanges/paymium.md#fetchdepositaddress)
* [phemex](/exchanges/phemex.md#fetchdepositaddress)
* [poloniex](/exchanges/poloniex.md#fetchdepositaddress)
* [probit](/exchanges/probit.md#fetchdepositaddress)
* [timex](/exchanges/timex.md#fetchdepositaddress)
* [tokocrypto](/exchanges/tokocrypto.md#fetchdepositaddress)
* [toobit](/exchanges/toobit.md#fetchdepositaddress)
* [upbit](/exchanges/upbit.md#fetchdepositaddress)
* [wavesexchange](/exchanges/wavesexchange.md#fetchdepositaddress)
* [whitebit](/exchanges/whitebit.md#fetchdepositaddress)
* [woo](/exchanges/woo.md#fetchdepositaddress)
* [xt](/exchanges/xt.md#fetchdepositaddress)
* [yobit](/exchanges/yobit.md#fetchdepositaddress)
* [zonda](/exchanges/zonda.md#fetchdepositaddress)

---

<a name="fetchDepositAddresses" id="fetchdepositaddresses"></a>

## fetchDepositAddresses
fetch deposit addresses for multiple currencies (when available)

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [address structures](https://docs.ccxt.com/#/?id=address-structure) indexed by currency code


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code> | No | list of unified currency codes, default is undefined (all currencies) |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | account ID to fetch deposit addresses for |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#fetchdepositaddresses)
* [coinone](/exchanges/coinone.md#fetchdepositaddresses)
* [deepcoin](/exchanges/deepcoin.md#fetchdepositaddresses)
* [hollaex](/exchanges/hollaex.md#fetchdepositaddresses)
* [indodax](/exchanges/indodax.md#fetchdepositaddresses)
* [paymium](/exchanges/paymium.md#fetchdepositaddresses)
* [probit](/exchanges/probit.md#fetchdepositaddresses)
* [upbit](/exchanges/upbit.md#fetchdepositaddresses)
* [zonda](/exchanges/zonda.md#fetchdepositaddresses)

---

<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

## fetchDepositAddressesByNetwork
fetch the deposit addresses for a currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary [address structures](https://docs.ccxt.com/?id=address-structure), indexed by the network


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#fetchdepositaddressesbynetwork)
* [bingx](/exchanges/bingx.md#fetchdepositaddressesbynetwork)
* [bybit](/exchanges/bybit.md#fetchdepositaddressesbynetwork)
* [cryptocom](/exchanges/cryptocom.md#fetchdepositaddressesbynetwork)
* [gate](/exchanges/gate.md#fetchdepositaddressesbynetwork)
* [gemini](/exchanges/gemini.md#fetchdepositaddressesbynetwork)
* [htx](/exchanges/htx.md#fetchdepositaddressesbynetwork)
* [kucoin](/exchanges/kucoin.md#fetchdepositaddressesbynetwork)
* [mexc](/exchanges/mexc.md#fetchdepositaddressesbynetwork)
* [okx](/exchanges/okx.md#fetchdepositaddressesbynetwork)

---

<a name="fetchDepositMethodId" id="fetchdepositmethodid"></a>

## fetchDepositMethodId
fetch the deposit id for a fiat currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - a [deposit id structure](https://docs.ccxt.com/?id=deposit-id-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the deposit payment method id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#fetchdepositmethodid)

---

<a name="fetchDepositMethodIds" id="fetchdepositmethodids"></a>

## fetchDepositMethodIds
fetch the deposit id for a fiat currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - an array of [deposit id structures](https://docs.ccxt.com/?id=deposit-id-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#fetchdepositmethodids)

---

<a name="fetchDepositMethods" id="fetchdepositmethods"></a>

## fetchDepositMethods
fetch deposit methods for a currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - of deposit methods


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the kraken api endpoint |

##### Supported exchanges
* [kraken](/exchanges/kraken.md#fetchdepositmethods)

---

<a name="fetchDepositWithdrawFee" id="fetchdepositwithdrawfee"></a>

## fetchDepositWithdrawFee
fetch the fee for deposits and withdrawals

**Kind**: instance   
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network code of the currency |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#fetchdepositwithdrawfee)
* [coinex](/exchanges/coinex.md#fetchdepositwithdrawfee)
* [kucoin](/exchanges/kucoin.md#fetchdepositwithdrawfee)

---

<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

## fetchDepositWithdrawFees
fetch deposit and withdraw fees

**Kind**: instance   
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#fetchdepositwithdrawfees)
* [binance](/exchanges/binance.md#fetchdepositwithdrawfees)
* [bingx](/exchanges/bingx.md#fetchdepositwithdrawfees)
* [bitget](/exchanges/bitget.md#fetchdepositwithdrawfees)
* [bitmex](/exchanges/bitmex.md#fetchdepositwithdrawfees)
* [bitopro](/exchanges/bitopro.md#fetchdepositwithdrawfees)
* [bitrue](/exchanges/bitrue.md#fetchdepositwithdrawfees)
* [bitso](/exchanges/bitso.md#fetchdepositwithdrawfees)
* [bitstamp](/exchanges/bitstamp.md#fetchdepositwithdrawfees)
* [bitvavo](/exchanges/bitvavo.md#fetchdepositwithdrawfees)
* [bybit](/exchanges/bybit.md#fetchdepositwithdrawfees)
* [coincatch](/exchanges/coincatch.md#fetchdepositwithdrawfees)
* [coinex](/exchanges/coinex.md#fetchdepositwithdrawfees)
* [cryptocom](/exchanges/cryptocom.md#fetchdepositwithdrawfees)
* [deribit](/exchanges/deribit.md#fetchdepositwithdrawfees)
* [digifinex](/exchanges/digifinex.md#fetchdepositwithdrawfees)
* [exmo](/exchanges/exmo.md#fetchdepositwithdrawfees)
* [gate](/exchanges/gate.md#fetchdepositwithdrawfees)
* [hitbtc](/exchanges/hitbtc.md#fetchdepositwithdrawfees)
* [hollaex](/exchanges/hollaex.md#fetchdepositwithdrawfees)
* [htx](/exchanges/htx.md#fetchdepositwithdrawfees)
* [kucoin](/exchanges/kucoin.md#fetchdepositwithdrawfees)
* [lbank](/exchanges/lbank.md#fetchdepositwithdrawfees)
* [mexc](/exchanges/mexc.md#fetchdepositwithdrawfees)
* [okx](/exchanges/okx.md#fetchdepositwithdrawfees)
* [poloniex](/exchanges/poloniex.md#fetchdepositwithdrawfees)
* [probit](/exchanges/probit.md#fetchdepositwithdrawfees)
* [wavesexchange](/exchanges/wavesexchange.md#fetchdepositwithdrawfees)
* [whitebit](/exchanges/whitebit.md#fetchdepositwithdrawfees)

---

<a name="fetchDeposits" id="fetchdeposits"></a>

## fetchDeposits
fetch all deposits made to an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchdeposits)
* [alpaca](/exchanges/alpaca.md#fetchdeposits)
* [arkham](/exchanges/arkham.md#fetchdeposits)
* [ascendex](/exchanges/ascendex.md#fetchdeposits)
* [backpack](/exchanges/backpack.md#fetchdeposits)
* [bigone](/exchanges/bigone.md#fetchdeposits)
* [binance](/exchanges/binance.md#fetchdeposits)
* [bingx](/exchanges/bingx.md#fetchdeposits)
* [bitbns](/exchanges/bitbns.md#fetchdeposits)
* [bitflyer](/exchanges/bitflyer.md#fetchdeposits)
* [bitget](/exchanges/bitget.md#fetchdeposits)
* [bitmart](/exchanges/bitmart.md#fetchdeposits)
* [bitopro](/exchanges/bitopro.md#fetchdeposits)
* [bitrue](/exchanges/bitrue.md#fetchdeposits)
* [bitso](/exchanges/bitso.md#fetchdeposits)
* [bittrade](/exchanges/bittrade.md#fetchdeposits)
* [bitvavo](/exchanges/bitvavo.md#fetchdeposits)
* [blockchaincom](/exchanges/blockchaincom.md#fetchdeposits)
* [blofin](/exchanges/blofin.md#fetchdeposits)
* [btcmarkets](/exchanges/btcmarkets.md#fetchdeposits)
* [bybit](/exchanges/bybit.md#fetchdeposits)
* [bydfi](/exchanges/bydfi.md#fetchdeposits)
* [coinbase](/exchanges/coinbase.md#fetchdeposits)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchdeposits)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchdeposits)
* [coincatch](/exchanges/coincatch.md#fetchdeposits)
* [coincheck](/exchanges/coincheck.md#fetchdeposits)
* [coinex](/exchanges/coinex.md#fetchdeposits)
* [coinsph](/exchanges/coinsph.md#fetchdeposits)
* [cryptocom](/exchanges/cryptocom.md#fetchdeposits)
* [deepcoin](/exchanges/deepcoin.md#fetchdeposits)
* [deribit](/exchanges/deribit.md#fetchdeposits)
* [derive](/exchanges/derive.md#fetchdeposits)
* [digifinex](/exchanges/digifinex.md#fetchdeposits)
* [dydx](/exchanges/dydx.md#fetchdeposits)
* [exmo](/exchanges/exmo.md#fetchdeposits)
* [foxbit](/exchanges/foxbit.md#fetchdeposits)
* [gate](/exchanges/gate.md#fetchdeposits)
* [hashkey](/exchanges/hashkey.md#fetchdeposits)
* [hibachi](/exchanges/hibachi.md#fetchdeposits)
* [hitbtc](/exchanges/hitbtc.md#fetchdeposits)
* [hollaex](/exchanges/hollaex.md#fetchdeposits)
* [htx](/exchanges/htx.md#fetchdeposits)
* [hyperliquid](/exchanges/hyperliquid.md#fetchdeposits)
* [kraken](/exchanges/kraken.md#fetchdeposits)
* [kucoin](/exchanges/kucoin.md#fetchdeposits)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchdeposits)
* [lbank](/exchanges/lbank.md#fetchdeposits)
* [mexc](/exchanges/mexc.md#fetchdeposits)
* [modetrade](/exchanges/modetrade.md#fetchdeposits)
* [ndax](/exchanges/ndax.md#fetchdeposits)
* [novadax](/exchanges/novadax.md#fetchdeposits)
* [okx](/exchanges/okx.md#fetchdeposits)
* [oxfun](/exchanges/oxfun.md#fetchdeposits)
* [phemex](/exchanges/phemex.md#fetchdeposits)
* [poloniex](/exchanges/poloniex.md#fetchdeposits)
* [probit](/exchanges/probit.md#fetchdeposits)
* [timex](/exchanges/timex.md#fetchdeposits)
* [tokocrypto](/exchanges/tokocrypto.md#fetchdeposits)
* [toobit](/exchanges/toobit.md#fetchdeposits)
* [upbit](/exchanges/upbit.md#fetchdeposits)
* [whitebit](/exchanges/whitebit.md#fetchdeposits)
* [woo](/exchanges/woo.md#fetchdeposits)
* [woofipro](/exchanges/woofipro.md#fetchdeposits)
* [xt](/exchanges/xt.md#fetchdeposits)

---

<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

## fetchDepositsWithdrawals
fetch history of deposits and withdrawals

**Kind**: instance   
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#fetchdepositswithdrawals)
* [ascendex](/exchanges/ascendex.md#fetchdepositswithdrawals)
* [bitfinex](/exchanges/bitfinex.md#fetchdepositswithdrawals)
* [bitmex](/exchanges/bitmex.md#fetchdepositswithdrawals)
* [bitstamp](/exchanges/bitstamp.md#fetchdepositswithdrawals)
* [bitteam](/exchanges/bitteam.md#fetchdepositswithdrawals)
* [btcmarkets](/exchanges/btcmarkets.md#fetchdepositswithdrawals)
* [bullish](/exchanges/bullish.md#fetchdepositswithdrawals)
* [cex](/exchanges/cex.md#fetchdepositswithdrawals)
* [coinbase](/exchanges/coinbase.md#fetchdepositswithdrawals)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchdepositswithdrawals)
* [exchange](/exchanges/exchange.md#fetchdepositswithdrawals)
* [coinmate](/exchanges/coinmate.md#fetchdepositswithdrawals)
* [dydx](/exchanges/dydx.md#fetchdepositswithdrawals)
* [exmo](/exchanges/exmo.md#fetchdepositswithdrawals)
* [gemini](/exchanges/gemini.md#fetchdepositswithdrawals)
* [hitbtc](/exchanges/hitbtc.md#fetchdepositswithdrawals)
* [indodax](/exchanges/indodax.md#fetchdepositswithdrawals)
* [modetrade](/exchanges/modetrade.md#fetchdepositswithdrawals)
* [novadax](/exchanges/novadax.md#fetchdepositswithdrawals)
* [poloniex](/exchanges/poloniex.md#fetchdepositswithdrawals)
* [probit](/exchanges/probit.md#fetchdepositswithdrawals)
* [whitebit](/exchanges/whitebit.md#fetchdepositswithdrawals)
* [woo](/exchanges/woo.md#fetchdepositswithdrawals)
* [woofipro](/exchanges/woofipro.md#fetchdepositswithdrawals)

---

<a name="fetchDepositsWs" id="fetchdepositsws"></a>

## fetchDepositsWs
fetch all deposits made to an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#fetchdepositsws)

---

<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

## fetchFundingHistory
fetches information on multiple orders made by the user *classic accounts only*

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=funding-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve, default 100 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>object</code> | No | end time, ms |
| params.side | <code>boolean</code> | No | BUY or SELL |
| params.page | <code>boolean</code> | No | Page numbers start from 0 |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchfundinghistory)
* [arkham](/exchanges/arkham.md#fetchfundinghistory)
* [ascendex](/exchanges/ascendex.md#fetchfundinghistory)
* [aster](/exchanges/aster.md#fetchfundinghistory)
* [backpack](/exchanges/backpack.md#fetchfundinghistory)
* [binance](/exchanges/binance.md#fetchfundinghistory)
* [bingx](/exchanges/bingx.md#fetchfundinghistory)
* [bitget](/exchanges/bitget.md#fetchfundinghistory)
* [bitmart](/exchanges/bitmart.md#fetchfundinghistory)
* [bybit](/exchanges/bybit.md#fetchfundinghistory)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchfundinghistory)
* [coinex](/exchanges/coinex.md#fetchfundinghistory)
* [derive](/exchanges/derive.md#fetchfundinghistory)
* [digifinex](/exchanges/digifinex.md#fetchfundinghistory)
* [gate](/exchanges/gate.md#fetchfundinghistory)
* [htx](/exchanges/htx.md#fetchfundinghistory)
* [hyperliquid](/exchanges/hyperliquid.md#fetchfundinghistory)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchfundinghistory)
* [mexc](/exchanges/mexc.md#fetchfundinghistory)
* [modetrade](/exchanges/modetrade.md#fetchfundinghistory)
* [okx](/exchanges/okx.md#fetchfundinghistory)
* [oxfun](/exchanges/oxfun.md#fetchfundinghistory)
* [phemex](/exchanges/phemex.md#fetchfundinghistory)
* [whitebit](/exchanges/whitebit.md#fetchfundinghistory)
* [woo](/exchanges/woo.md#fetchfundinghistory)
* [woofipro](/exchanges/woofipro.md#fetchfundinghistory)
* [xt](/exchanges/xt.md#fetchfundinghistory)

---

<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

## fetchFundingInterval
fetch the current funding rate interval

**Kind**: instance   
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#fetchfundinginterval)
* [coinex](/exchanges/coinex.md#fetchfundinginterval)
* [digifinex](/exchanges/digifinex.md#fetchfundinginterval)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchfundinginterval)
* [mexc](/exchanges/mexc.md#fetchfundinginterval)
* [modetrade](/exchanges/modetrade.md#fetchfundinginterval)
* [okx](/exchanges/okx.md#fetchfundinginterval)
* [woo](/exchanges/woo.md#fetchfundinginterval)
* [woofipro](/exchanges/woofipro.md#fetchfundinginterval)
* [xt](/exchanges/xt.md#fetchfundinginterval)

---

<a name="fetchFundingIntervals" id="fetchfundingintervals"></a>

## fetchFundingIntervals
fetch the funding rate interval for multiple markets

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchfundingintervals)
* [binance](/exchanges/binance.md#fetchfundingintervals)
* [bitget](/exchanges/bitget.md#fetchfundingintervals)

---

<a name="fetchFundingLimits" id="fetchfundinglimits"></a>

## fetchFundingLimits
fetch the deposit and withdrawal limits for a currency

**Kind**: instance   
**Returns**: <code>object</code> - a [funding limits structure](https://docs.ccxt.com/?id=funding-limits-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [whitebit](/exchanges/whitebit.md#fetchfundinglimits)

---

<a name="fetchFundingRate" id="fetchfundingrate"></a>

## fetchFundingRate
fetch the current funding rate

**Kind**: instance   
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchfundingrate)
* [backpack](/exchanges/backpack.md#fetchfundingrate)
* [binance](/exchanges/binance.md#fetchfundingrate)
* [bingx](/exchanges/bingx.md#fetchfundingrate)
* [bitflyer](/exchanges/bitflyer.md#fetchfundingrate)
* [bitget](/exchanges/bitget.md#fetchfundingrate)
* [bitmart](/exchanges/bitmart.md#fetchfundingrate)
* [blofin](/exchanges/blofin.md#fetchfundingrate)
* [bydfi](/exchanges/bydfi.md#fetchfundingrate)
* [coincatch](/exchanges/coincatch.md#fetchfundingrate)
* [coinex](/exchanges/coinex.md#fetchfundingrate)
* [cryptocom](/exchanges/cryptocom.md#fetchfundingrate)
* [deepcoin](/exchanges/deepcoin.md#fetchfundingrate)
* [defx](/exchanges/defx.md#fetchfundingrate)
* [delta](/exchanges/delta.md#fetchfundingrate)
* [deribit](/exchanges/deribit.md#fetchfundingrate)
* [derive](/exchanges/derive.md#fetchfundingrate)
* [digifinex](/exchanges/digifinex.md#fetchfundingrate)
* [gate](/exchanges/gate.md#fetchfundingrate)
* [hashkey](/exchanges/hashkey.md#fetchfundingrate)
* [hibachi](/exchanges/hibachi.md#fetchfundingrate)
* [hitbtc](/exchanges/hitbtc.md#fetchfundingrate)
* [htx](/exchanges/htx.md#fetchfundingrate)
* [kucoin](/exchanges/kucoin.md#fetchfundingrate)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchfundingrate)
* [lbank](/exchanges/lbank.md#fetchfundingrate)
* [mexc](/exchanges/mexc.md#fetchfundingrate)
* [modetrade](/exchanges/modetrade.md#fetchfundingrate)
* [okx](/exchanges/okx.md#fetchfundingrate)
* [oxfun](/exchanges/oxfun.md#fetchfundingrate)
* [phemex](/exchanges/phemex.md#fetchfundingrate)
* [whitebit](/exchanges/whitebit.md#fetchfundingrate)
* [woo](/exchanges/woo.md#fetchfundingrate)
* [woofipro](/exchanges/woofipro.md#fetchfundingrate)
* [xt](/exchanges/xt.md#fetchfundingrate)

---

<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

## fetchFundingRateHistory
fetches historical funding rate prices

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchfundingratehistory)
* [aster](/exchanges/aster.md#fetchfundingratehistory)
* [backpack](/exchanges/backpack.md#fetchfundingratehistory)
* [binance](/exchanges/binance.md#fetchfundingratehistory)
* [bingx](/exchanges/bingx.md#fetchfundingratehistory)
* [bitfinex](/exchanges/bitfinex.md#fetchfundingratehistory)
* [bitget](/exchanges/bitget.md#fetchfundingratehistory)
* [bitmart](/exchanges/bitmart.md#fetchfundingratehistory)
* [bitmex](/exchanges/bitmex.md#fetchfundingratehistory)
* [blofin](/exchanges/blofin.md#fetchfundingratehistory)
* [bullish](/exchanges/bullish.md#fetchfundingratehistory)
* [bybit](/exchanges/bybit.md#fetchfundingratehistory)
* [bydfi](/exchanges/bydfi.md#fetchfundingratehistory)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchfundingratehistory)
* [coincatch](/exchanges/coincatch.md#fetchfundingratehistory)
* [coinex](/exchanges/coinex.md#fetchfundingratehistory)
* [cryptocom](/exchanges/cryptocom.md#fetchfundingratehistory)
* [deepcoin](/exchanges/deepcoin.md#fetchfundingratehistory)
* [deribit](/exchanges/deribit.md#fetchfundingratehistory)
* [derive](/exchanges/derive.md#fetchfundingratehistory)
* [digifinex](/exchanges/digifinex.md#fetchfundingratehistory)
* [dydx](/exchanges/dydx.md#fetchfundingratehistory)
* [gate](/exchanges/gate.md#fetchfundingratehistory)
* [hashkey](/exchanges/hashkey.md#fetchfundingratehistory)
* [hibachi](/exchanges/hibachi.md#fetchfundingratehistory)
* [hitbtc](/exchanges/hitbtc.md#fetchfundingratehistory)
* [htx](/exchanges/htx.md#fetchfundingratehistory)
* [hyperliquid](/exchanges/hyperliquid.md#fetchfundingratehistory)
* [krakenfutures](/exchanges/krakenfutures.md#fetchfundingratehistory)
* [kucoin](/exchanges/kucoin.md#fetchfundingratehistory)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchfundingratehistory)
* [mexc](/exchanges/mexc.md#fetchfundingratehistory)
* [modetrade](/exchanges/modetrade.md#fetchfundingratehistory)
* [okx](/exchanges/okx.md#fetchfundingratehistory)
* [oxfun](/exchanges/oxfun.md#fetchfundingratehistory)
* [paradex](/exchanges/paradex.md#fetchfundingratehistory)
* [phemex](/exchanges/phemex.md#fetchfundingratehistory)
* [toobit](/exchanges/toobit.md#fetchfundingratehistory)
* [woo](/exchanges/woo.md#fetchfundingratehistory)
* [woofipro](/exchanges/woofipro.md#fetchfundingratehistory)
* [xt](/exchanges/xt.md#fetchfundingratehistory)

---

<a name="fetchFundingRates" id="fetchfundingrates"></a>

## fetchFundingRates
fetch the funding rate for multiple markets

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rates structures](https://docs.ccxt.com/?id=funding-rates-structure), indexe by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#fetchfundingrates)
* [aster](/exchanges/aster.md#fetchfundingrates)
* [binance](/exchanges/binance.md#fetchfundingrates)
* [bingx](/exchanges/bingx.md#fetchfundingrates)
* [bitfinex](/exchanges/bitfinex.md#fetchfundingrates)
* [bitget](/exchanges/bitget.md#fetchfundingrates)
* [bitmex](/exchanges/bitmex.md#fetchfundingrates)
* [bybit](/exchanges/bybit.md#fetchfundingrates)
* [coinex](/exchanges/coinex.md#fetchfundingrates)
* [deepcoin](/exchanges/deepcoin.md#fetchfundingrates)
* [delta](/exchanges/delta.md#fetchfundingrates)
* [gate](/exchanges/gate.md#fetchfundingrates)
* [hashkey](/exchanges/hashkey.md#fetchfundingrates)
* [hitbtc](/exchanges/hitbtc.md#fetchfundingrates)
* [htx](/exchanges/htx.md#fetchfundingrates)
* [hyperliquid](/exchanges/hyperliquid.md#fetchfundingrates)
* [krakenfutures](/exchanges/krakenfutures.md#fetchfundingrates)
* [lbank](/exchanges/lbank.md#fetchfundingrates)
* [modetrade](/exchanges/modetrade.md#fetchfundingrates)
* [okx](/exchanges/okx.md#fetchfundingrates)
* [oxfun](/exchanges/oxfun.md#fetchfundingrates)
* [toobit](/exchanges/toobit.md#fetchfundingrates)
* [whitebit](/exchanges/whitebit.md#fetchfundingrates)
* [woo](/exchanges/woo.md#fetchfundingrates)
* [woofipro](/exchanges/woofipro.md#fetchfundingrates)

---

<a name="fetchGreeks" id="fetchgreeks"></a>

## fetchGreeks
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance   
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/?id=greeks-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchgreeks)
* [bybit](/exchanges/bybit.md#fetchgreeks)
* [delta](/exchanges/delta.md#fetchgreeks)
* [deribit](/exchanges/deribit.md#fetchgreeks)
* [gate](/exchanges/gate.md#fetchgreeks)
* [okx](/exchanges/okx.md#fetchgreeks)
* [paradex](/exchanges/paradex.md#fetchgreeks)

---

<a name="fetchHip3Markets" id="fetchhip3markets"></a>

## fetchHip3Markets
retrieves data on all hip3 markets for hyperliquid

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#fetchhip3markets)

---

<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

## fetchIsolatedBorrowRate
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance   
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://docs.ccxt.com/?id=isolated-borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.vipLevel | <code>object</code> | No | user's current specific margin data will be returned if viplevel is omitted |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchisolatedborrowrate)
* [bitget](/exchanges/bitget.md#fetchisolatedborrowrate)
* [bitmart](/exchanges/bitmart.md#fetchisolatedborrowrate)
* [coinex](/exchanges/coinex.md#fetchisolatedborrowrate)

---

<a name="fetchIsolatedBorrowRates" id="fetchisolatedborrowrates"></a>

## fetchIsolatedBorrowRates
fetch the borrow interest rates of all currencies

**Kind**: instance   
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>object</code> | No | unified market symbol EXCHANGE SPECIFIC PARAMETERS |
| params.vipLevel | <code>object</code> | No | user's current specific margin data will be returned if viplevel is omitted |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchisolatedborrowrates)
* [bitmart](/exchanges/bitmart.md#fetchisolatedborrowrates)
* [htx](/exchanges/htx.md#fetchisolatedborrowrates)

---

<a name="fetchL3OrderBook" id="fetchl3orderbook"></a>

## fetchL3OrderBook
fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/?id=order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [blockchaincom](/exchanges/blockchaincom.md#fetchl3orderbook)

---

<a name="fetchLastPrices" id="fetchlastprices"></a>

## fetchLastPrices
fetches the last price for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of lastprices structures


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the last prices |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchlastprices)
* [hashkey](/exchanges/hashkey.md#fetchlastprices)
* [htx](/exchanges/htx.md#fetchlastprices)
* [toobit](/exchanges/toobit.md#fetchlastprices)

---

<a name="fetchLedger" id="fetchledger"></a>

## fetchLedger
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance   
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | timestamp in ms of the earliest ledger entry |
| limit | <code>int</code> | No | max number of ledger entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ledger entry |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchledger)
* [binance](/exchanges/binance.md#fetchledger)
* [bitfinex](/exchanges/bitfinex.md#fetchledger)
* [bitget](/exchanges/bitget.md#fetchledger)
* [bitmart](/exchanges/bitmart.md#fetchledger)
* [bitmex](/exchanges/bitmex.md#fetchledger)
* [bitso](/exchanges/bitso.md#fetchledger)
* [bitstamp](/exchanges/bitstamp.md#fetchledger)
* [blofin](/exchanges/blofin.md#fetchledger)
* [bybit](/exchanges/bybit.md#fetchledger)
* [cex](/exchanges/cex.md#fetchledger)
* [coinbase](/exchanges/coinbase.md#fetchledger)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchledger)
* [coincatch](/exchanges/coincatch.md#fetchledger)
* [coinmetro](/exchanges/coinmetro.md#fetchledger)
* [cryptocom](/exchanges/cryptocom.md#fetchledger)
* [deepcoin](/exchanges/deepcoin.md#fetchledger)
* [defx](/exchanges/defx.md#fetchledger)
* [delta](/exchanges/delta.md#fetchledger)
* [digifinex](/exchanges/digifinex.md#fetchledger)
* [dydx](/exchanges/dydx.md#fetchledger)
* [foxbit](/exchanges/foxbit.md#fetchledger)
* [gate](/exchanges/gate.md#fetchledger)
* [hashkey](/exchanges/hashkey.md#fetchledger)
* [hibachi](/exchanges/hibachi.md#fetchledger)
* [htx](/exchanges/htx.md#fetchledger)
* [hyperliquid](/exchanges/hyperliquid.md#fetchledger)
* [kraken](/exchanges/kraken.md#fetchledger)
* [kucoin](/exchanges/kucoin.md#fetchledger)
* [luno](/exchanges/luno.md#fetchledger)
* [modetrade](/exchanges/modetrade.md#fetchledger)
* [ndax](/exchanges/ndax.md#fetchledger)
* [okx](/exchanges/okx.md#fetchledger)
* [toobit](/exchanges/toobit.md#fetchledger)
* [woo](/exchanges/woo.md#fetchledger)
* [woofipro](/exchanges/woofipro.md#fetchledger)
* [xt](/exchanges/xt.md#fetchledger)
* [zonda](/exchanges/zonda.md#fetchledger)

---

<a name="fetchLedgerEntry" id="fetchledgerentry"></a>

## fetchLedgerEntry
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance   
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/?id=ledger-entry-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the identification number of the ledger entry |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchledgerentry)

---

<a name="fetchLeverage" id="fetchleverage"></a>

## fetchLeverage
fetch the set leverage for a market

**Kind**: instance   
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/?id=leverage-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#fetchleverage)
* [bingx](/exchanges/bingx.md#fetchleverage)
* [bitget](/exchanges/bitget.md#fetchleverage)
* [blofin](/exchanges/blofin.md#fetchleverage)
* [bybit](/exchanges/bybit.md#fetchleverage)
* [bydfi](/exchanges/bydfi.md#fetchleverage)
* [coincatch](/exchanges/coincatch.md#fetchleverage)
* [coinex](/exchanges/coinex.md#fetchleverage)
* [delta](/exchanges/delta.md#fetchleverage)
* [gate](/exchanges/gate.md#fetchleverage)
* [hashkey](/exchanges/hashkey.md#fetchleverage)
* [hitbtc](/exchanges/hitbtc.md#fetchleverage)
* [krakenfutures](/exchanges/krakenfutures.md#fetchleverage)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchleverage)
* [mexc](/exchanges/mexc.md#fetchleverage)
* [modetrade](/exchanges/modetrade.md#fetchleverage)
* [okx](/exchanges/okx.md#fetchleverage)
* [paradex](/exchanges/paradex.md#fetchleverage)
* [poloniex](/exchanges/poloniex.md#fetchleverage)
* [toobit](/exchanges/toobit.md#fetchleverage)
* [woo](/exchanges/woo.md#fetchleverage)
* [woofipro](/exchanges/woofipro.md#fetchleverage)
* [zebpay](/exchanges/zebpay.md#fetchleverage)

---

<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

## fetchLeverageTiers
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/?id=leverage-tiers-structure), indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#fetchleveragetiers)
* [ascendex](/exchanges/ascendex.md#fetchleveragetiers)
* [binance](/exchanges/binance.md#fetchleveragetiers)
* [bybit](/exchanges/bybit.md#fetchleveragetiers)
* [coinex](/exchanges/coinex.md#fetchleveragetiers)
* [digifinex](/exchanges/digifinex.md#fetchleveragetiers)
* [gate](/exchanges/gate.md#fetchleveragetiers)
* [hashkey](/exchanges/hashkey.md#fetchleveragetiers)
* [htx](/exchanges/htx.md#fetchleveragetiers)
* [krakenfutures](/exchanges/krakenfutures.md#fetchleveragetiers)
* [mexc](/exchanges/mexc.md#fetchleveragetiers)
* [oxfun](/exchanges/oxfun.md#fetchleveragetiers)
* [phemex](/exchanges/phemex.md#fetchleveragetiers)
* [xt](/exchanges/xt.md#fetchleveragetiers)

---

<a name="fetchLeverages" id="fetchleverages"></a>

## fetchLeverages
fetch the set leverage for all contract markets

**Kind**: instance   
**Returns**: <code>object</code> - a list of [leverage structures](https://docs.ccxt.com/?id=leverage-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#fetchleverages)
* [aster](/exchanges/aster.md#fetchleverages)
* [binance](/exchanges/binance.md#fetchleverages)
* [bitmex](/exchanges/bitmex.md#fetchleverages)
* [blofin](/exchanges/blofin.md#fetchleverages)
* [gate](/exchanges/gate.md#fetchleverages)
* [krakenfutures](/exchanges/krakenfutures.md#fetchleverages)
* [zebpay](/exchanges/zebpay.md#fetchleverages)

---

<a name="fetchLiquidations" id="fetchliquidations"></a>

## fetchLiquidations
retrieves the public liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#fetchliquidations)
* [bitmex](/exchanges/bitmex.md#fetchliquidations)
* [deribit](/exchanges/deribit.md#fetchliquidations)
* [gate](/exchanges/gate.md#fetchliquidations)
* [htx](/exchanges/htx.md#fetchliquidations)
* [paradex](/exchanges/paradex.md#fetchliquidations)

---

<a name="fetchLongShortRatioHistory" id="fetchlongshortratiohistory"></a>

## fetchLongShortRatioHistory
fetches the long short ratio history for a unified market symbol

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of [long short ratio structures](https://docs.ccxt.com/?id=long-short-ratio-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the long short ratio for |
| timeframe | <code>string</code> | No | the period for the ratio, default is 24 hours |
| since | <code>int</code> | No | the earliest time in ms to fetch ratios for |
| limit | <code>int</code> | No | the maximum number of long short ratio structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ratio to fetch |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchlongshortratiohistory)
* [bitget](/exchanges/bitget.md#fetchlongshortratiohistory)
* [bybit](/exchanges/bybit.md#fetchlongshortratiohistory)
* [okx](/exchanges/okx.md#fetchlongshortratiohistory)

---

<a name="fetchMarginAdjustmentHistory" id="fetchmarginadjustmenthistory"></a>

## fetchMarginAdjustmentHistory
fetches the history of margin added or reduced from contract isolated positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [margin structures](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| type | <code>string</code> | No | "add" or "reduce" |
| since | <code>int</code> | No | timestamp in ms of the earliest change to fetch |
| limit | <code>int</code> | No | the maximum amount of changes to fetch |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest change to fetch |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchmarginadjustmenthistory)
* [binance](/exchanges/binance.md#fetchmarginadjustmenthistory)
* [coinex](/exchanges/coinex.md#fetchmarginadjustmenthistory)
* [okx](/exchanges/okx.md#fetchmarginadjustmenthistory)

---

<a name="fetchMarginMode" id="fetchmarginmode"></a>

## fetchMarginMode
fetches the margin mode of a specific symbol

**Kind**: instance   
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/?id=margin-mode-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmarginmode)
* [bingx](/exchanges/bingx.md#fetchmarginmode)
* [bitget](/exchanges/bitget.md#fetchmarginmode)
* [blofin](/exchanges/blofin.md#fetchmarginmode)
* [bybit](/exchanges/bybit.md#fetchmarginmode)
* [bydfi](/exchanges/bydfi.md#fetchmarginmode)
* [coincatch](/exchanges/coincatch.md#fetchmarginmode)
* [delta](/exchanges/delta.md#fetchmarginmode)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchmarginmode)
* [paradex](/exchanges/paradex.md#fetchmarginmode)

---

<a name="fetchMarginModes" id="fetchmarginmodes"></a>

## fetchMarginModes
fetches the set margin mode of the user

**Kind**: instance   
**Returns**: <code>object</code> - a list of [margin mode structures](https://docs.ccxt.com/?id=margin-mode-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#fetchmarginmodes)
* [aster](/exchanges/aster.md#fetchmarginmodes)
* [binance](/exchanges/binance.md#fetchmarginmodes)
* [hitbtc](/exchanges/hitbtc.md#fetchmarginmodes)

---

<a name="fetchMarkPrice" id="fetchmarkprice"></a>

## fetchMarkPrice
fetches mark price for the market

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmarkprice)
* [bingx](/exchanges/bingx.md#fetchmarkprice)
* [bitget](/exchanges/bitget.md#fetchmarkprice)
* [blofin](/exchanges/blofin.md#fetchmarkprice)
* [defx](/exchanges/defx.md#fetchmarkprice)
* [kucoin](/exchanges/kucoin.md#fetchmarkprice)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchmarkprice)
* [okx](/exchanges/okx.md#fetchmarkprice)

---

<a name="fetchMarkPrices" id="fetchmarkprices"></a>

## fetchMarkPrices
fetches mark prices for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmarkprices)
* [bingx](/exchanges/bingx.md#fetchmarkprices)
* [kucoin](/exchanges/kucoin.md#fetchmarkprices)
* [okx](/exchanges/okx.md#fetchmarkprices)

---

<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

## fetchMarketLeverageTiers
retrieve information on the maximum leverage, for different trade sizes for a single market

**Kind**: instance   
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/?id=leverage-tiers-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#fetchmarketleveragetiers)
* [bitget](/exchanges/bitget.md#fetchmarketleveragetiers)
* [bybit](/exchanges/bybit.md#fetchmarketleveragetiers)
* [digifinex](/exchanges/digifinex.md#fetchmarketleveragetiers)
* [gate](/exchanges/gate.md#fetchmarketleveragetiers)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchmarketleveragetiers)
* [okx](/exchanges/okx.md#fetchmarketleveragetiers)
* [xt](/exchanges/xt.md#fetchmarketleveragetiers)

---

<a name="fetchMarkets" id="fetchmarkets"></a>

## fetchMarkets
retrieves data on all markets for alp

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchmarkets)
* [alpaca](/exchanges/alpaca.md#fetchmarkets)
* [apex](/exchanges/apex.md#fetchmarkets)
* [arkham](/exchanges/arkham.md#fetchmarkets)
* [ascendex](/exchanges/ascendex.md#fetchmarkets)
* [aster](/exchanges/aster.md#fetchmarkets)
* [backpack](/exchanges/backpack.md#fetchmarkets)
* [bigone](/exchanges/bigone.md#fetchmarkets)
* [binance](/exchanges/binance.md#fetchmarkets)
* [bingx](/exchanges/bingx.md#fetchmarkets)
* [bitbank](/exchanges/bitbank.md#fetchmarkets)
* [bitbns](/exchanges/bitbns.md#fetchmarkets)
* [bitfinex](/exchanges/bitfinex.md#fetchmarkets)
* [bitflyer](/exchanges/bitflyer.md#fetchmarkets)
* [bitget](/exchanges/bitget.md#fetchmarkets)
* [bithumb](/exchanges/bithumb.md#fetchmarkets)
* [bitmart](/exchanges/bitmart.md#fetchmarkets)
* [bitmex](/exchanges/bitmex.md#fetchmarkets)
* [bitopro](/exchanges/bitopro.md#fetchmarkets)
* [bitrue](/exchanges/bitrue.md#fetchmarkets)
* [bitso](/exchanges/bitso.md#fetchmarkets)
* [bitstamp](/exchanges/bitstamp.md#fetchmarkets)
* [bitteam](/exchanges/bitteam.md#fetchmarkets)
* [bittrade](/exchanges/bittrade.md#fetchmarkets)
* [bitvavo](/exchanges/bitvavo.md#fetchmarkets)
* [blockchaincom](/exchanges/blockchaincom.md#fetchmarkets)
* [blofin](/exchanges/blofin.md#fetchmarkets)
* [btcbox](/exchanges/btcbox.md#fetchmarkets)
* [btcmarkets](/exchanges/btcmarkets.md#fetchmarkets)
* [btcturk](/exchanges/btcturk.md#fetchmarkets)
* [bullish](/exchanges/bullish.md#fetchmarkets)
* [bybit](/exchanges/bybit.md#fetchmarkets)
* [bydfi](/exchanges/bydfi.md#fetchmarkets)
* [cex](/exchanges/cex.md#fetchmarkets)
* [coinbase](/exchanges/coinbase.md#fetchmarkets)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchmarkets)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchmarkets)
* [coincatch](/exchanges/coincatch.md#fetchmarkets)
* [coinex](/exchanges/coinex.md#fetchmarkets)
* [coinmate](/exchanges/coinmate.md#fetchmarkets)
* [coinmetro](/exchanges/coinmetro.md#fetchmarkets)
* [coinone](/exchanges/coinone.md#fetchmarkets)
* [coinsph](/exchanges/coinsph.md#fetchmarkets)
* [cryptocom](/exchanges/cryptocom.md#fetchmarkets)
* [cryptomus](/exchanges/cryptomus.md#fetchmarkets)
* [deepcoin](/exchanges/deepcoin.md#fetchmarkets)
* [defx](/exchanges/defx.md#fetchmarkets)
* [delta](/exchanges/delta.md#fetchmarkets)
* [deribit](/exchanges/deribit.md#fetchmarkets)
* [derive](/exchanges/derive.md#fetchmarkets)
* [digifinex](/exchanges/digifinex.md#fetchmarkets)
* [dydx](/exchanges/dydx.md#fetchmarkets)
* [exmo](/exchanges/exmo.md#fetchmarkets)
* [foxbit](/exchanges/foxbit.md#fetchmarkets)
* [gate](/exchanges/gate.md#fetchmarkets)
* [gemini](/exchanges/gemini.md#fetchmarkets)
* [hashkey](/exchanges/hashkey.md#fetchmarkets)
* [hibachi](/exchanges/hibachi.md#fetchmarkets)
* [hitbtc](/exchanges/hitbtc.md#fetchmarkets)
* [hollaex](/exchanges/hollaex.md#fetchmarkets)
* [htx](/exchanges/htx.md#fetchmarkets)
* [hyperliquid](/exchanges/hyperliquid.md#fetchmarkets)
* [independentreserve](/exchanges/independentreserve.md#fetchmarkets)
* [indodax](/exchanges/indodax.md#fetchmarkets)
* [kraken](/exchanges/kraken.md#fetchmarkets)
* [krakenfutures](/exchanges/krakenfutures.md#fetchmarkets)
* [kucoin](/exchanges/kucoin.md#fetchmarkets)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchmarkets)
* [latoken](/exchanges/latoken.md#fetchmarkets)
* [lbank](/exchanges/lbank.md#fetchmarkets)
* [luno](/exchanges/luno.md#fetchmarkets)
* [mercado](/exchanges/mercado.md#fetchmarkets)
* [mexc](/exchanges/mexc.md#fetchmarkets)
* [modetrade](/exchanges/modetrade.md#fetchmarkets)
* [ndax](/exchanges/ndax.md#fetchmarkets)
* [novadax](/exchanges/novadax.md#fetchmarkets)
* [okx](/exchanges/okx.md#fetchmarkets)
* [onetrading](/exchanges/onetrading.md#fetchmarkets)
* [oxfun](/exchanges/oxfun.md#fetchmarkets)
* [p2b](/exchanges/p2b.md#fetchmarkets)
* [paradex](/exchanges/paradex.md#fetchmarkets)
* [phemex](/exchanges/phemex.md#fetchmarkets)
* [poloniex](/exchanges/poloniex.md#fetchmarkets)
* [probit](/exchanges/probit.md#fetchmarkets)
* [timex](/exchanges/timex.md#fetchmarkets)
* [tokocrypto](/exchanges/tokocrypto.md#fetchmarkets)
* [toobit](/exchanges/toobit.md#fetchmarkets)
* [upbit](/exchanges/upbit.md#fetchmarkets)
* [wavesexchange](/exchanges/wavesexchange.md#fetchmarkets)
* [whitebit](/exchanges/whitebit.md#fetchmarkets)
* [woo](/exchanges/woo.md#fetchmarkets)
* [woofipro](/exchanges/woofipro.md#fetchmarkets)
* [xt](/exchanges/xt.md#fetchmarkets)
* [yobit](/exchanges/yobit.md#fetchmarkets)
* [zaif](/exchanges/zaif.md#fetchmarkets)
* [zebpay](/exchanges/zebpay.md#fetchmarkets)
* [zonda](/exchanges/zonda.md#fetchmarkets)

---

<a name="fetchMarketsWs" id="fetchmarketsws"></a>

## fetchMarketsWs
retrieves data on all markets for bitvavo

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#fetchmarketsws)

---

<a name="fetchMyDustTrades" id="fetchmydusttrades"></a>

## fetchMyDustTrades
fetch all dust trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by binance fetchMyDustTrades () |
| since | <code>int</code> | No | the earliest time in ms to fetch my dust trades for |
| limit | <code>int</code> | No | the maximum number of dust trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'margin', default spot |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmydusttrades)

---

<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

## fetchMyLiquidations
retrieves the users liquidated positions

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/?id=liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the binance api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.paginate | <code>boolean</code> | No | *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch liquidations in a portfolio margin account |
| params.type | <code>string</code> | No | "spot" |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmyliquidations)
* [bingx](/exchanges/bingx.md#fetchmyliquidations)
* [bitget](/exchanges/bitget.md#fetchmyliquidations)
* [bitmart](/exchanges/bitmart.md#fetchmyliquidations)
* [bybit](/exchanges/bybit.md#fetchmyliquidations)
* [deribit](/exchanges/deribit.md#fetchmyliquidations)
* [gate](/exchanges/gate.md#fetchmyliquidations)

---

<a name="fetchMySettlementHistory" id="fetchmysettlementhistory"></a>

## fetchMySettlementHistory
fetches historical settlement records of the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects]


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records |
| params | <code>object</code> | No | exchange specific params |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmysettlementhistory)
* [bybit](/exchanges/bybit.md#fetchmysettlementhistory)
* [gate](/exchanges/gate.md#fetchmysettlementhistory)

---

<a name="fetchMyTrades" id="fetchmytrades"></a>

## fetchMyTrades
fetch all trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchmytrades)
* [alpaca](/exchanges/alpaca.md#fetchmytrades)
* [apex](/exchanges/apex.md#fetchmytrades)
* [arkham](/exchanges/arkham.md#fetchmytrades)
* [aster](/exchanges/aster.md#fetchmytrades)
* [backpack](/exchanges/backpack.md#fetchmytrades)
* [bigone](/exchanges/bigone.md#fetchmytrades)
* [binance](/exchanges/binance.md#fetchmytrades)
* [bingx](/exchanges/bingx.md#fetchmytrades)
* [bit2c](/exchanges/bit2c.md#fetchmytrades)
* [bitbank](/exchanges/bitbank.md#fetchmytrades)
* [bitbns](/exchanges/bitbns.md#fetchmytrades)
* [bitfinex](/exchanges/bitfinex.md#fetchmytrades)
* [bitflyer](/exchanges/bitflyer.md#fetchmytrades)
* [bitget](/exchanges/bitget.md#fetchmytrades)
* [bitmart](/exchanges/bitmart.md#fetchmytrades)
* [bitmex](/exchanges/bitmex.md#fetchmytrades)
* [bitopro](/exchanges/bitopro.md#fetchmytrades)
* [bitrue](/exchanges/bitrue.md#fetchmytrades)
* [bitso](/exchanges/bitso.md#fetchmytrades)
* [bitstamp](/exchanges/bitstamp.md#fetchmytrades)
* [bitteam](/exchanges/bitteam.md#fetchmytrades)
* [bittrade](/exchanges/bittrade.md#fetchmytrades)
* [bitvavo](/exchanges/bitvavo.md#fetchmytrades)
* [blockchaincom](/exchanges/blockchaincom.md#fetchmytrades)
* [blofin](/exchanges/blofin.md#fetchmytrades)
* [btcmarkets](/exchanges/btcmarkets.md#fetchmytrades)
* [btcturk](/exchanges/btcturk.md#fetchmytrades)
* [bullish](/exchanges/bullish.md#fetchmytrades)
* [bybit](/exchanges/bybit.md#fetchmytrades)
* [bydfi](/exchanges/bydfi.md#fetchmytrades)
* [coinbase](/exchanges/coinbase.md#fetchmytrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchmytrades)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchmytrades)
* [coincatch](/exchanges/coincatch.md#fetchmytrades)
* [coincheck](/exchanges/coincheck.md#fetchmytrades)
* [coinex](/exchanges/coinex.md#fetchmytrades)
* [coinmate](/exchanges/coinmate.md#fetchmytrades)
* [coinmetro](/exchanges/coinmetro.md#fetchmytrades)
* [coinone](/exchanges/coinone.md#fetchmytrades)
* [coinsph](/exchanges/coinsph.md#fetchmytrades)
* [coinspot](/exchanges/coinspot.md#fetchmytrades)
* [cryptocom](/exchanges/cryptocom.md#fetchmytrades)
* [deepcoin](/exchanges/deepcoin.md#fetchmytrades)
* [defx](/exchanges/defx.md#fetchmytrades)
* [delta](/exchanges/delta.md#fetchmytrades)
* [deribit](/exchanges/deribit.md#fetchmytrades)
* [derive](/exchanges/derive.md#fetchmytrades)
* [digifinex](/exchanges/digifinex.md#fetchmytrades)
* [exmo](/exchanges/exmo.md#fetchmytrades)
* [foxbit](/exchanges/foxbit.md#fetchmytrades)
* [gate](/exchanges/gate.md#fetchmytrades)
* [gemini](/exchanges/gemini.md#fetchmytrades)
* [hashkey](/exchanges/hashkey.md#fetchmytrades)
* [hibachi](/exchanges/hibachi.md#fetchmytrades)
* [hitbtc](/exchanges/hitbtc.md#fetchmytrades)
* [hollaex](/exchanges/hollaex.md#fetchmytrades)
* [htx](/exchanges/htx.md#fetchmytrades)
* [hyperliquid](/exchanges/hyperliquid.md#fetchmytrades)
* [independentreserve](/exchanges/independentreserve.md#fetchmytrades)
* [kraken](/exchanges/kraken.md#fetchmytrades)
* [krakenfutures](/exchanges/krakenfutures.md#fetchmytrades)
* [kucoin](/exchanges/kucoin.md#fetchmytrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchmytrades)
* [latoken](/exchanges/latoken.md#fetchmytrades)
* [lbank](/exchanges/lbank.md#fetchmytrades)
* [luno](/exchanges/luno.md#fetchmytrades)
* [mercado](/exchanges/mercado.md#fetchmytrades)
* [mexc](/exchanges/mexc.md#fetchmytrades)
* [modetrade](/exchanges/modetrade.md#fetchmytrades)
* [ndax](/exchanges/ndax.md#fetchmytrades)
* [novadax](/exchanges/novadax.md#fetchmytrades)
* [okx](/exchanges/okx.md#fetchmytrades)
* [onetrading](/exchanges/onetrading.md#fetchmytrades)
* [oxfun](/exchanges/oxfun.md#fetchmytrades)
* [p2b](/exchanges/p2b.md#fetchmytrades)
* [paradex](/exchanges/paradex.md#fetchmytrades)
* [phemex](/exchanges/phemex.md#fetchmytrades)
* [poloniex](/exchanges/poloniex.md#fetchmytrades)
* [probit](/exchanges/probit.md#fetchmytrades)
* [timex](/exchanges/timex.md#fetchmytrades)
* [tokocrypto](/exchanges/tokocrypto.md#fetchmytrades)
* [toobit](/exchanges/toobit.md#fetchmytrades)
* [wavesexchange](/exchanges/wavesexchange.md#fetchmytrades)
* [whitebit](/exchanges/whitebit.md#fetchmytrades)
* [woo](/exchanges/woo.md#fetchmytrades)
* [woofipro](/exchanges/woofipro.md#fetchmytrades)
* [xt](/exchanges/xt.md#fetchmytrades)
* [yobit](/exchanges/yobit.md#fetchmytrades)
* [zebpay](/exchanges/zebpay.md#fetchmytrades)
* [zonda](/exchanges/zonda.md#fetchmytrades)

---

<a name="fetchMyTradesWs" id="fetchmytradesws"></a>

## fetchMyTradesWs
fetch all trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code>, <code>undefined</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code>, <code>undefined</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.endTime | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.fromId | <code>int</code> | No | first trade Id to fetch |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchmytradesws)
* [bitvavo](/exchanges/bitvavo.md#fetchmytradesws)

---

<a name="fetchOHLCV" id="fetchohlcv"></a>

## fetchOHLCV
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchohlcv)
* [alpaca](/exchanges/alpaca.md#fetchohlcv)
* [apex](/exchanges/apex.md#fetchohlcv)
* [arkham](/exchanges/arkham.md#fetchohlcv)
* [ascendex](/exchanges/ascendex.md#fetchohlcv)
* [aster](/exchanges/aster.md#fetchohlcv)
* [backpack](/exchanges/backpack.md#fetchohlcv)
* [bigone](/exchanges/bigone.md#fetchohlcv)
* [binance](/exchanges/binance.md#fetchohlcv)
* [bingx](/exchanges/bingx.md#fetchohlcv)
* [bitbank](/exchanges/bitbank.md#fetchohlcv)
* [bitfinex](/exchanges/bitfinex.md#fetchohlcv)
* [bitget](/exchanges/bitget.md#fetchohlcv)
* [bithumb](/exchanges/bithumb.md#fetchohlcv)
* [bitmart](/exchanges/bitmart.md#fetchohlcv)
* [bitmex](/exchanges/bitmex.md#fetchohlcv)
* [bitopro](/exchanges/bitopro.md#fetchohlcv)
* [bitrue](/exchanges/bitrue.md#fetchohlcv)
* [bitso](/exchanges/bitso.md#fetchohlcv)
* [bitstamp](/exchanges/bitstamp.md#fetchohlcv)
* [bitteam](/exchanges/bitteam.md#fetchohlcv)
* [bittrade](/exchanges/bittrade.md#fetchohlcv)
* [bitvavo](/exchanges/bitvavo.md#fetchohlcv)
* [blofin](/exchanges/blofin.md#fetchohlcv)
* [btcmarkets](/exchanges/btcmarkets.md#fetchohlcv)
* [btcturk](/exchanges/btcturk.md#fetchohlcv)
* [bullish](/exchanges/bullish.md#fetchohlcv)
* [bybit](/exchanges/bybit.md#fetchohlcv)
* [bydfi](/exchanges/bydfi.md#fetchohlcv)
* [cex](/exchanges/cex.md#fetchohlcv)
* [coinbase](/exchanges/coinbase.md#fetchohlcv)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchohlcv)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchohlcv)
* [coincatch](/exchanges/coincatch.md#fetchohlcv)
* [coinex](/exchanges/coinex.md#fetchohlcv)
* [coinmetro](/exchanges/coinmetro.md#fetchohlcv)
* [coinsph](/exchanges/coinsph.md#fetchohlcv)
* [cryptocom](/exchanges/cryptocom.md#fetchohlcv)
* [deepcoin](/exchanges/deepcoin.md#fetchohlcv)
* [defx](/exchanges/defx.md#fetchohlcv)
* [delta](/exchanges/delta.md#fetchohlcv)
* [deribit](/exchanges/deribit.md#fetchohlcv)
* [digifinex](/exchanges/digifinex.md#fetchohlcv)
* [dydx](/exchanges/dydx.md#fetchohlcv)
* [exmo](/exchanges/exmo.md#fetchohlcv)
* [foxbit](/exchanges/foxbit.md#fetchohlcv)
* [gateio](/exchanges/gateio.md#fetchohlcv)
* [gemini](/exchanges/gemini.md#fetchohlcv)
* [hashkey](/exchanges/hashkey.md#fetchohlcv)
* [hitbtc](/exchanges/hitbtc.md#fetchohlcv)
* [hollaex](/exchanges/hollaex.md#fetchohlcv)
* [htx](/exchanges/htx.md#fetchohlcv)
* [hyperliquid](/exchanges/hyperliquid.md#fetchohlcv)
* [indodax](/exchanges/indodax.md#fetchohlcv)
* [kraken](/exchanges/kraken.md#fetchohlcv)
* [krakenfutures](/exchanges/krakenfutures.md#fetchohlcv)
* [kucoin](/exchanges/kucoin.md#fetchohlcv)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchohlcv)
* [lbank](/exchanges/lbank.md#fetchohlcv)
* [luno](/exchanges/luno.md#fetchohlcv)
* [mercado](/exchanges/mercado.md#fetchohlcv)
* [mexc](/exchanges/mexc.md#fetchohlcv)
* [modetrade](/exchanges/modetrade.md#fetchohlcv)
* [ndax](/exchanges/ndax.md#fetchohlcv)
* [novadax](/exchanges/novadax.md#fetchohlcv)
* [okx](/exchanges/okx.md#fetchohlcv)
* [onetrading](/exchanges/onetrading.md#fetchohlcv)
* [oxfun](/exchanges/oxfun.md#fetchohlcv)
* [p2b](/exchanges/p2b.md#fetchohlcv)
* [paradex](/exchanges/paradex.md#fetchohlcv)
* [phemex](/exchanges/phemex.md#fetchohlcv)
* [poloniex](/exchanges/poloniex.md#fetchohlcv)
* [probit](/exchanges/probit.md#fetchohlcv)
* [timex](/exchanges/timex.md#fetchohlcv)
* [tokocrypto](/exchanges/tokocrypto.md#fetchohlcv)
* [toobit](/exchanges/toobit.md#fetchohlcv)
* [upbit](/exchanges/upbit.md#fetchohlcv)
* [wavesexchange](/exchanges/wavesexchange.md#fetchohlcv)
* [whitebit](/exchanges/whitebit.md#fetchohlcv)
* [woo](/exchanges/woo.md#fetchohlcv)
* [woofipro](/exchanges/woofipro.md#fetchohlcv)
* [xt](/exchanges/xt.md#fetchohlcv)
* [zebpay](/exchanges/zebpay.md#fetchohlcv)
* [zonda](/exchanges/zonda.md#fetchohlcv)

---

<a name="fetchOHLCVWs" id="fetchohlcvws"></a>

## fetchOHLCVWs
query historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified symbol of the market to query OHLCV data for |
| timeframe | <code>string</code> | the length of time each candle represents |
| since | <code>int</code> | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | the maximum amount of candles to fetch |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | timestamp in ms of the earliest candle to fetch EXCHANGE SPECIFIC PARAMETERS |
| params.timeZone | <code>string</code> | default=0 (UTC) |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchohlcvws)
* [bitvavo](/exchanges/bitvavo.md#fetchohlcvws)
* [lbank](/exchanges/lbank.md#fetchohlcvws)

---

<a name="fetchOpenInterest" id="fetchopeninterest"></a>

## fetchOpenInterest
retrieves the open interest of a contract trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/?id=open-interest-structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchopeninterest)
* [backpack](/exchanges/backpack.md#fetchopeninterest)
* [binance](/exchanges/binance.md#fetchopeninterest)
* [bingx](/exchanges/bingx.md#fetchopeninterest)
* [bitfinex](/exchanges/bitfinex.md#fetchopeninterest)
* [bitget](/exchanges/bitget.md#fetchopeninterest)
* [bitmart](/exchanges/bitmart.md#fetchopeninterest)
* [bybit](/exchanges/bybit.md#fetchopeninterest)
* [delta](/exchanges/delta.md#fetchopeninterest)
* [deribit](/exchanges/deribit.md#fetchopeninterest)
* [gate](/exchanges/gate.md#fetchopeninterest)
* [hibachi](/exchanges/hibachi.md#fetchopeninterest)
* [hitbtc](/exchanges/hitbtc.md#fetchopeninterest)
* [htx](/exchanges/htx.md#fetchopeninterest)
* [hyperliquid](/exchanges/hyperliquid.md#fetchopeninterest)
* [okx](/exchanges/okx.md#fetchopeninterest)
* [paradex](/exchanges/paradex.md#fetchopeninterest)
* [phemex](/exchanges/phemex.md#fetchopeninterest)

---

<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

## fetchOpenInterestHistory
Retrieves the open interest history of a currency

**Kind**: instance   
**Returns**: <code>object</code> - an array of [open interest structure](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| timeframe | <code>string</code> | Yes | "5m","15m","30m","1h","2h","4h","6h","12h", or "1d" |
| since | <code>int</code> | No | the time(ms) of the earliest record to retrieve as a unix timestamp |
| limit | <code>int</code> | No | default 30, max 500 |
| params | <code>object</code> | No | exchange specific parameters |
| params.until | <code>int</code> | No | the time(ms) of the latest record to retrieve as a unix timestamp |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchopeninteresthistory)
* [bitfinex](/exchanges/bitfinex.md#fetchopeninteresthistory)
* [bybit](/exchanges/bybit.md#fetchopeninteresthistory)
* [htx](/exchanges/htx.md#fetchopeninteresthistory)
* [okx](/exchanges/okx.md#fetchopeninteresthistory)

---

<a name="fetchOpenInterests" id="fetchopeninterests"></a>

## fetchOpenInterests
Retrieves the open interest for a list of symbols

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [open interest structures](https://docs.ccxt.com/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#fetchopeninterests)
* [hitbtc](/exchanges/hitbtc.md#fetchopeninterests)
* [htx](/exchanges/htx.md#fetchopeninterests)
* [hyperliquid](/exchanges/hyperliquid.md#fetchopeninterests)
* [okx](/exchanges/okx.md#fetchopeninterests)

---

<a name="fetchOpenOrder" id="fetchopenorder"></a>

## fetchOpenOrder
fetch an open order by the id

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchopenorder)
* [backpack](/exchanges/backpack.md#fetchopenorder)
* [binance](/exchanges/binance.md#fetchopenorder)
* [bitfinex](/exchanges/bitfinex.md#fetchopenorder)
* [bybit](/exchanges/bybit.md#fetchopenorder)
* [bydfi](/exchanges/bydfi.md#fetchopenorder)
* [cex](/exchanges/cex.md#fetchopenorder)
* [deepcoin](/exchanges/deepcoin.md#fetchopenorder)
* [hitbtc](/exchanges/hitbtc.md#fetchopenorder)
* [hollaex](/exchanges/hollaex.md#fetchopenorder)

---

<a name="fetchOpenOrders" id="fetchopenorders"></a>

## fetchOpenOrders
fetch all unfilled currently open orders

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchopenorders)
* [alpaca](/exchanges/alpaca.md#fetchopenorders)
* [apex](/exchanges/apex.md#fetchopenorders)
* [arkham](/exchanges/arkham.md#fetchopenorders)
* [ascendex](/exchanges/ascendex.md#fetchopenorders)
* [aster](/exchanges/aster.md#fetchopenorders)
* [backpack](/exchanges/backpack.md#fetchopenorders)
* [bigone](/exchanges/bigone.md#fetchopenorders)
* [binance](/exchanges/binance.md#fetchopenorders)
* [bingx](/exchanges/bingx.md#fetchopenorders)
* [bit2c](/exchanges/bit2c.md#fetchopenorders)
* [bitbank](/exchanges/bitbank.md#fetchopenorders)
* [bitbns](/exchanges/bitbns.md#fetchopenorders)
* [bitfinex](/exchanges/bitfinex.md#fetchopenorders)
* [bitflyer](/exchanges/bitflyer.md#fetchopenorders)
* [bitget](/exchanges/bitget.md#fetchopenorders)
* [bithumb](/exchanges/bithumb.md#fetchopenorders)
* [bitmart](/exchanges/bitmart.md#fetchopenorders)
* [bitmex](/exchanges/bitmex.md#fetchopenorders)
* [bitopro](/exchanges/bitopro.md#fetchopenorders)
* [bitrue](/exchanges/bitrue.md#fetchopenorders)
* [bitso](/exchanges/bitso.md#fetchopenorders)
* [bitstamp](/exchanges/bitstamp.md#fetchopenorders)
* [bitteam](/exchanges/bitteam.md#fetchopenorders)
* [bittrade](/exchanges/bittrade.md#fetchopenorders)
* [bitvavo](/exchanges/bitvavo.md#fetchopenorders)
* [blockchaincom](/exchanges/blockchaincom.md#fetchopenorders)
* [blofin](/exchanges/blofin.md#fetchopenorders)
* [btcbox](/exchanges/btcbox.md#fetchopenorders)
* [btcmarkets](/exchanges/btcmarkets.md#fetchopenorders)
* [btcturk](/exchanges/btcturk.md#fetchopenorders)
* [bullish](/exchanges/bullish.md#fetchopenorders)
* [bybit](/exchanges/bybit.md#fetchopenorders)
* [bydfi](/exchanges/bydfi.md#fetchopenorders)
* [cex](/exchanges/cex.md#fetchopenorders)
* [coinbase](/exchanges/coinbase.md#fetchopenorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchopenorders)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchopenorders)
* [coincatch](/exchanges/coincatch.md#fetchopenorders)
* [coincheck](/exchanges/coincheck.md#fetchopenorders)
* [coinex](/exchanges/coinex.md#fetchopenorders)
* [coinmate](/exchanges/coinmate.md#fetchopenorders)
* [coinmetro](/exchanges/coinmetro.md#fetchopenorders)
* [coinone](/exchanges/coinone.md#fetchopenorders)
* [coinsph](/exchanges/coinsph.md#fetchopenorders)
* [cryptocom](/exchanges/cryptocom.md#fetchopenorders)
* [cryptomus](/exchanges/cryptomus.md#fetchopenorders)
* [deepcoin](/exchanges/deepcoin.md#fetchopenorders)
* [defx](/exchanges/defx.md#fetchopenorders)
* [delta](/exchanges/delta.md#fetchopenorders)
* [deribit](/exchanges/deribit.md#fetchopenorders)
* [derive](/exchanges/derive.md#fetchopenorders)
* [digifinex](/exchanges/digifinex.md#fetchopenorders)
* [dydx](/exchanges/dydx.md#fetchopenorders)
* [exmo](/exchanges/exmo.md#fetchopenorders)
* [foxbit](/exchanges/foxbit.md#fetchopenorders)
* [gate](/exchanges/gate.md#fetchopenorders)
* [gemini](/exchanges/gemini.md#fetchopenorders)
* [hashkey](/exchanges/hashkey.md#fetchopenorders)
* [hibachi](/exchanges/hibachi.md#fetchopenorders)
* [hitbtc](/exchanges/hitbtc.md#fetchopenorders)
* [hollaex](/exchanges/hollaex.md#fetchopenorders)
* [htx](/exchanges/htx.md#fetchopenorders)
* [hyperliquid](/exchanges/hyperliquid.md#fetchopenorders)
* [independentreserve](/exchanges/independentreserve.md#fetchopenorders)
* [indodax](/exchanges/indodax.md#fetchopenorders)
* [kraken](/exchanges/kraken.md#fetchopenorders)
* [krakenfutures](/exchanges/krakenfutures.md#fetchopenorders)
* [kucoin](/exchanges/kucoin.md#fetchopenorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchopenorders)
* [latoken](/exchanges/latoken.md#fetchopenorders)
* [lbank](/exchanges/lbank.md#fetchopenorders)
* [luno](/exchanges/luno.md#fetchopenorders)
* [mercado](/exchanges/mercado.md#fetchopenorders)
* [mexc](/exchanges/mexc.md#fetchopenorders)
* [modetrade](/exchanges/modetrade.md#fetchopenorders)
* [ndax](/exchanges/ndax.md#fetchopenorders)
* [novadax](/exchanges/novadax.md#fetchopenorders)
* [okx](/exchanges/okx.md#fetchopenorders)
* [onetrading](/exchanges/onetrading.md#fetchopenorders)
* [oxfun](/exchanges/oxfun.md#fetchopenorders)
* [p2b](/exchanges/p2b.md#fetchopenorders)
* [paradex](/exchanges/paradex.md#fetchopenorders)
* [phemex](/exchanges/phemex.md#fetchopenorders)
* [poloniex](/exchanges/poloniex.md#fetchopenorders)
* [probit](/exchanges/probit.md#fetchopenorders)
* [timex](/exchanges/timex.md#fetchopenorders)
* [tokocrypto](/exchanges/tokocrypto.md#fetchopenorders)
* [toobit](/exchanges/toobit.md#fetchopenorders)
* [upbit](/exchanges/upbit.md#fetchopenorders)
* [wavesexchange](/exchanges/wavesexchange.md#fetchopenorders)
* [whitebit](/exchanges/whitebit.md#fetchopenorders)
* [woo](/exchanges/woo.md#fetchopenorders)
* [woofipro](/exchanges/woofipro.md#fetchopenorders)
* [xt](/exchanges/xt.md#fetchopenorders)
* [yobit](/exchanges/yobit.md#fetchopenorders)
* [zaif](/exchanges/zaif.md#fetchopenorders)
* [zebpay](/exchanges/zebpay.md#fetchopenorders)
* [zonda](/exchanges/zonda.md#fetchopenorders)

---

<a name="fetchOpenOrdersWs" id="fetchopenordersws"></a>

## fetchOpenOrdersWs
fetch all unfilled currently open orders

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code>, <code>undefined</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code>, <code>undefined</code> | No | the maximum number of open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchopenordersws)
* [bitvavo](/exchanges/bitvavo.md#fetchopenordersws)
* [cex](/exchanges/cex.md#fetchopenordersws)
* [gate](/exchanges/gate.md#fetchopenordersws)

---

<a name="fetchOption" id="fetchoption"></a>

## fetchOption
fetches option data that is commonly found in an option chain

**Kind**: instance   
**Returns**: <code>object</code> - an [option chain structure](https://docs.ccxt.com/?id=option-chain-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchoption)
* [bybit](/exchanges/bybit.md#fetchoption)
* [delta](/exchanges/delta.md#fetchoption)
* [deribit](/exchanges/deribit.md#fetchoption)
* [gate](/exchanges/gate.md#fetchoption)
* [okx](/exchanges/okx.md#fetchoption)

---

<a name="fetchOptionChain" id="fetchoptionchain"></a>

## fetchOptionChain
fetches data for an underlying asset that is commonly found in an option chain

**Kind**: instance   
**Returns**: <code>object</code> - a list of [option chain structures](https://docs.ccxt.com/?id=option-chain-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | base currency to fetch an option chain for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#fetchoptionchain)
* [deribit](/exchanges/deribit.md#fetchoptionchain)
* [gate](/exchanges/gate.md#fetchoptionchain)
* [okx](/exchanges/okx.md#fetchoptionchain)

---

<a name="fetchOptionPositions" id="fetchoptionpositions"></a>

## fetchOptionPositions
fetch data on open options positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchoptionpositions)

---

<a name="fetchOrder" id="fetchorder"></a>

## fetchOrder
fetches information on an order made by the user

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | not used by alp fetchOrder |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchorder)
* [alpaca](/exchanges/alpaca.md#fetchorder)
* [apex](/exchanges/apex.md#fetchorder)
* [arkmm](/exchanges/arkmm.md#fetchorder)
* [ascendex](/exchanges/ascendex.md#fetchorder)
* [aster](/exchanges/aster.md#fetchorder)
* [bigone](/exchanges/bigone.md#fetchorder)
* [binance](/exchanges/binance.md#fetchorder)
* [bingx](/exchanges/bingx.md#fetchorder)
* [bit2c](/exchanges/bit2c.md#fetchorder)
* [bitbank](/exchanges/bitbank.md#fetchorder)
* [bitbns](/exchanges/bitbns.md#fetchorder)
* [bitfinex](/exchanges/bitfinex.md#fetchorder)
* [bitflyer](/exchanges/bitflyer.md#fetchorder)
* [bitget](/exchanges/bitget.md#fetchorder)
* [bithumb](/exchanges/bithumb.md#fetchorder)
* [bitmart](/exchanges/bitmart.md#fetchorder)
* [bitmex](/exchanges/bitmex.md#fetchorder)
* [bitopro](/exchanges/bitopro.md#fetchorder)
* [bitrue](/exchanges/bitrue.md#fetchorder)
* [bitso](/exchanges/bitso.md#fetchorder)
* [bitstamp](/exchanges/bitstamp.md#fetchorder)
* [bitteam](/exchanges/bitteam.md#fetchorder)
* [bittrade](/exchanges/bittrade.md#fetchorder)
* [bitvavo](/exchanges/bitvavo.md#fetchorder)
* [blockchaincom](/exchanges/blockchaincom.md#fetchorder)
* [btcbox](/exchanges/btcbox.md#fetchorder)
* [btcmarkets](/exchanges/btcmarkets.md#fetchorder)
* [bullish](/exchanges/bullish.md#fetchorder)
* [bybit](/exchanges/bybit.md#fetchorder)
* [coinbase](/exchanges/coinbase.md#fetchorder)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchorder)
* [coincatch](/exchanges/coincatch.md#fetchorder)
* [coinex](/exchanges/coinex.md#fetchorder)
* [coinmate](/exchanges/coinmate.md#fetchorder)
* [coinmetro](/exchanges/coinmetro.md#fetchorder)
* [coinone](/exchanges/coinone.md#fetchorder)
* [coinsph](/exchanges/coinsph.md#fetchorder)
* [cryptocom](/exchanges/cryptocom.md#fetchorder)
* [defx](/exchanges/defx.md#fetchorder)
* [delta](/exchanges/delta.md#fetchorder)
* [deribit](/exchanges/deribit.md#fetchorder)
* [digifinex](/exchanges/digifinex.md#fetchorder)
* [dydx](/exchanges/dydx.md#fetchorder)
* [exmo](/exchanges/exmo.md#fetchorder)
* [foxbit](/exchanges/foxbit.md#fetchorder)
* [gate](/exchanges/gate.md#fetchorder)
* [gemini](/exchanges/gemini.md#fetchorder)
* [hashkey](/exchanges/hashkey.md#fetchorder)
* [hibachi](/exchanges/hibachi.md#fetchorder)
* [hitbtc](/exchanges/hitbtc.md#fetchorder)
* [hollaex](/exchanges/hollaex.md#fetchorder)
* [htx](/exchanges/htx.md#fetchorder)
* [hyperliquid](/exchanges/hyperliquid.md#fetchorder)
* [independentreserve](/exchanges/independentreserve.md#fetchorder)
* [indodax](/exchanges/indodax.md#fetchorder)
* [kraken](/exchanges/kraken.md#fetchorder)
* [krakenfutures](/exchanges/krakenfutures.md#fetchorder)
* [kucoin](/exchanges/kucoin.md#fetchorder)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchorder)
* [latoken](/exchanges/latoken.md#fetchorder)
* [lbank](/exchanges/lbank.md#fetchorder)
* [luno](/exchanges/luno.md#fetchorder)
* [mercado](/exchanges/mercado.md#fetchorder)
* [mexc](/exchanges/mexc.md#fetchorder)
* [modetrade](/exchanges/modetrade.md#fetchorder)
* [ndax](/exchanges/ndax.md#fetchorder)
* [novadax](/exchanges/novadax.md#fetchorder)
* [okx](/exchanges/okx.md#fetchorder)
* [onetrading](/exchanges/onetrading.md#fetchorder)
* [oxfun](/exchanges/oxfun.md#fetchorder)
* [paradex](/exchanges/paradex.md#fetchorder)
* [phemex](/exchanges/phemex.md#fetchorder)
* [poloniex](/exchanges/poloniex.md#fetchorder)
* [probit](/exchanges/probit.md#fetchorder)
* [timex](/exchanges/timex.md#fetchorder)
* [tokocrypto](/exchanges/tokocrypto.md#fetchorder)
* [toobit](/exchanges/toobit.md#fetchorder)
* [upbit](/exchanges/upbit.md#fetchorder)
* [wavesexchange](/exchanges/wavesexchange.md#fetchorder)
* [whitebit](/exchanges/whitebit.md#fetchorder)
* [woo](/exchanges/woo.md#fetchorder)
* [woofipro](/exchanges/woofipro.md#fetchorder)
* [xt](/exchanges/xt.md#fetchorder)
* [yobit](/exchanges/yobit.md#fetchorder)
* [zebpay](/exchanges/zebpay.md#fetchorder)

---

<a name="fetchOrderBook" id="fetchorderbook"></a>

## fetchOrderBook
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchorderbook)
* [alpaca](/exchanges/alpaca.md#fetchorderbook)
* [apex](/exchanges/apex.md#fetchorderbook)
* [arkham](/exchanges/arkham.md#fetchorderbook)
* [ascendex](/exchanges/ascendex.md#fetchorderbook)
* [aster](/exchanges/aster.md#fetchorderbook)
* [backpack](/exchanges/backpack.md#fetchorderbook)
* [bigone](/exchanges/bigone.md#fetchorderbook)
* [binance](/exchanges/binance.md#fetchorderbook)
* [bingx](/exchanges/bingx.md#fetchorderbook)
* [bit2c](/exchanges/bit2c.md#fetchorderbook)
* [bitbank](/exchanges/bitbank.md#fetchorderbook)
* [bitbns](/exchanges/bitbns.md#fetchorderbook)
* [bitfinex](/exchanges/bitfinex.md#fetchorderbook)
* [bitflyer](/exchanges/bitflyer.md#fetchorderbook)
* [bitget](/exchanges/bitget.md#fetchorderbook)
* [bithumb](/exchanges/bithumb.md#fetchorderbook)
* [bitmart](/exchanges/bitmart.md#fetchorderbook)
* [bitmex](/exchanges/bitmex.md#fetchorderbook)
* [bitopro](/exchanges/bitopro.md#fetchorderbook)
* [bitrue](/exchanges/bitrue.md#fetchorderbook)
* [bitso](/exchanges/bitso.md#fetchorderbook)
* [bitstamp](/exchanges/bitstamp.md#fetchorderbook)
* [bitteam](/exchanges/bitteam.md#fetchorderbook)
* [bittrade](/exchanges/bittrade.md#fetchorderbook)
* [bitvavo](/exchanges/bitvavo.md#fetchorderbook)
* [blockchaincom](/exchanges/blockchaincom.md#fetchorderbook)
* [blofin](/exchanges/blofin.md#fetchorderbook)
* [btcbox](/exchanges/btcbox.md#fetchorderbook)
* [btcmarkets](/exchanges/btcmarkets.md#fetchorderbook)
* [btcturk](/exchanges/btcturk.md#fetchorderbook)
* [bullish](/exchanges/bullish.md#fetchorderbook)
* [bybit](/exchanges/bybit.md#fetchorderbook)
* [bydfi](/exchanges/bydfi.md#fetchorderbook)
* [cex](/exchanges/cex.md#fetchorderbook)
* [coinbase](/exchanges/coinbase.md#fetchorderbook)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchorderbook)
* [coincatch](/exchanges/coincatch.md#fetchorderbook)
* [coincheck](/exchanges/coincheck.md#fetchorderbook)
* [coinex](/exchanges/coinex.md#fetchorderbook)
* [coinmate](/exchanges/coinmate.md#fetchorderbook)
* [coinmetro](/exchanges/coinmetro.md#fetchorderbook)
* [coinone](/exchanges/coinone.md#fetchorderbook)
* [coinsph](/exchanges/coinsph.md#fetchorderbook)
* [coinspot](/exchanges/coinspot.md#fetchorderbook)
* [cryptocom](/exchanges/cryptocom.md#fetchorderbook)
* [cryptomus](/exchanges/cryptomus.md#fetchorderbook)
* [deepcoin](/exchanges/deepcoin.md#fetchorderbook)
* [defx](/exchanges/defx.md#fetchorderbook)
* [delta](/exchanges/delta.md#fetchorderbook)
* [deribit](/exchanges/deribit.md#fetchorderbook)
* [digifinex](/exchanges/digifinex.md#fetchorderbook)
* [dydx](/exchanges/dydx.md#fetchorderbook)
* [exmo](/exchanges/exmo.md#fetchorderbook)
* [foxbit](/exchanges/foxbit.md#fetchorderbook)
* [gate](/exchanges/gate.md#fetchorderbook)
* [gemini](/exchanges/gemini.md#fetchorderbook)
* [hashkey](/exchanges/hashkey.md#fetchorderbook)
* [hibachi](/exchanges/hibachi.md#fetchorderbook)
* [hitbtc](/exchanges/hitbtc.md#fetchorderbook)
* [hollaex](/exchanges/hollaex.md#fetchorderbook)
* [htx](/exchanges/htx.md#fetchorderbook)
* [hyperliquid](/exchanges/hyperliquid.md#fetchorderbook)
* [independentreserve](/exchanges/independentreserve.md#fetchorderbook)
* [indodax](/exchanges/indodax.md#fetchorderbook)
* [kraken](/exchanges/kraken.md#fetchorderbook)
* [krakenfutures](/exchanges/krakenfutures.md#fetchorderbook)
* [kucoin](/exchanges/kucoin.md#fetchorderbook)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchorderbook)
* [latoken](/exchanges/latoken.md#fetchorderbook)
* [lbank](/exchanges/lbank.md#fetchorderbook)
* [luno](/exchanges/luno.md#fetchorderbook)
* [mercado](/exchanges/mercado.md#fetchorderbook)
* [mexc](/exchanges/mexc.md#fetchorderbook)
* [modetrade](/exchanges/modetrade.md#fetchorderbook)
* [ndax](/exchanges/ndax.md#fetchorderbook)
* [novadax](/exchanges/novadax.md#fetchorderbook)
* [okx](/exchanges/okx.md#fetchorderbook)
* [onetrading](/exchanges/onetrading.md#fetchorderbook)
* [oxfun](/exchanges/oxfun.md#fetchorderbook)
* [p2b](/exchanges/p2b.md#fetchorderbook)
* [paradex](/exchanges/paradex.md#fetchorderbook)
* [paymium](/exchanges/paymium.md#fetchorderbook)
* [phemex](/exchanges/phemex.md#fetchorderbook)
* [poloniex](/exchanges/poloniex.md#fetchorderbook)
* [probit](/exchanges/probit.md#fetchorderbook)
* [timex](/exchanges/timex.md#fetchorderbook)
* [tokocrypto](/exchanges/tokocrypto.md#fetchorderbook)
* [toobit](/exchanges/toobit.md#fetchorderbook)
* [upbit](/exchanges/upbit.md#fetchorderbook)
* [wavesexchange](/exchanges/wavesexchange.md#fetchorderbook)
* [whitebit](/exchanges/whitebit.md#fetchorderbook)
* [woo](/exchanges/woo.md#fetchorderbook)
* [woofipro](/exchanges/woofipro.md#fetchorderbook)
* [xt](/exchanges/xt.md#fetchorderbook)
* [yobit](/exchanges/yobit.md#fetchorderbook)
* [zaif](/exchanges/zaif.md#fetchorderbook)
* [zebpay](/exchanges/zebpay.md#fetchorderbook)
* [zonda](/exchanges/zonda.md#fetchorderbook)

---

<a name="fetchOrderBookWs" id="fetchorderbookws"></a>

## fetchOrderBookWs
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchorderbookws)
* [lbank](/exchanges/lbank.md#fetchorderbookws)

---

<a name="fetchOrderBooks" id="fetchorderbooks"></a>

## fetchOrderBooks
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols, all symbols fetched if undefined, default is undefined |
| limit | <code>int</code> | No | max number of entries per orderbook to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [exmo](/exchanges/exmo.md#fetchorderbooks)
* [hitbtc](/exchanges/hitbtc.md#fetchorderbooks)
* [hollaex](/exchanges/hollaex.md#fetchorderbooks)
* [upbit](/exchanges/upbit.md#fetchorderbooks)
* [yobit](/exchanges/yobit.md#fetchorderbooks)

---

<a name="fetchOrderClassic" id="fetchorderclassic"></a>

## fetchOrderClassic
fetches information on an order made by the user *classic accounts only*

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#fetchorderclassic)

---

<a name="fetchOrderTrades" id="fetchordertrades"></a>

## fetchOrderTrades
fetch all the trades made from a single order

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchordertrades)
* [binance](/exchanges/binance.md#fetchordertrades)
* [bitfinex](/exchanges/bitfinex.md#fetchordertrades)
* [bitmart](/exchanges/bitmart.md#fetchordertrades)
* [bitso](/exchanges/bitso.md#fetchordertrades)
* [bittrade](/exchanges/bittrade.md#fetchordertrades)
* [bullish](/exchanges/bullish.md#fetchordertrades)
* [bybit](/exchanges/bybit.md#fetchordertrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchordertrades)
* [coincatch](/exchanges/coincatch.md#fetchordertrades)
* [coinsph](/exchanges/coinsph.md#fetchordertrades)
* [deepcoin](/exchanges/deepcoin.md#fetchordertrades)
* [deribit](/exchanges/deribit.md#fetchordertrades)
* [derive](/exchanges/derive.md#fetchordertrades)
* [exmo](/exchanges/exmo.md#fetchordertrades)
* [gate](/exchanges/gate.md#fetchordertrades)
* [hitbtc](/exchanges/hitbtc.md#fetchordertrades)
* [htx](/exchanges/htx.md#fetchordertrades)
* [kraken](/exchanges/kraken.md#fetchordertrades)
* [kucoin](/exchanges/kucoin.md#fetchordertrades)
* [mexc](/exchanges/mexc.md#fetchordertrades)
* [modetrade](/exchanges/modetrade.md#fetchordertrades)
* [ndax](/exchanges/ndax.md#fetchordertrades)
* [novadax](/exchanges/novadax.md#fetchordertrades)
* [okx](/exchanges/okx.md#fetchordertrades)
* [onetrading](/exchanges/onetrading.md#fetchordertrades)
* [p2b](/exchanges/p2b.md#fetchordertrades)
* [poloniex](/exchanges/poloniex.md#fetchordertrades)
* [whitebit](/exchanges/whitebit.md#fetchordertrades)
* [woo](/exchanges/woo.md#fetchordertrades)
* [woofipro](/exchanges/woofipro.md#fetchordertrades)
* [zebpatspot](/exchanges/zebpatspot.md#fetchordertrades)

---

<a name="fetchOrderWs" id="fetchorderws"></a>

## fetchOrderWs
fetches information on an order made by the user

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | No | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchorderws)
* [bitvavo](/exchanges/bitvavo.md#fetchorderws)
* [cex](/exchanges/cex.md#fetchorderws)
* [gate](/exchanges/gate.md#fetchorderws)

---

<a name="fetchOrders" id="fetchorders"></a>

## fetchOrders
fetches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchorders)
* [alpaca](/exchanges/alpaca.md#fetchorders)
* [apex](/exchanges/apex.md#fetchorders)
* [aster](/exchanges/aster.md#fetchorders)
* [backpack](/exchanges/backpack.md#fetchorders)
* [bigone](/exchanges/bigone.md#fetchorders)
* [binance](/exchanges/binance.md#fetchorders)
* [bingx](/exchanges/bingx.md#fetchorders)
* [bitflyer](/exchanges/bitflyer.md#fetchorders)
* [bitmex](/exchanges/bitmex.md#fetchorders)
* [bitopro](/exchanges/bitopro.md#fetchorders)
* [bitteam](/exchanges/bitteam.md#fetchorders)
* [bittrade](/exchanges/bittrade.md#fetchorders)
* [bitvavo](/exchanges/bitvavo.md#fetchorders)
* [blockchaincom](/exchanges/blockchaincom.md#fetchorders)
* [btcbox](/exchanges/btcbox.md#fetchorders)
* [btcmarkets](/exchanges/btcmarkets.md#fetchorders)
* [btcturk](/exchanges/btcturk.md#fetchorders)
* [bullish](/exchanges/bullish.md#fetchorders)
* [bybit](/exchanges/bybit.md#fetchorders)
* [cex](/exchanges/cex.md#fetchorders)
* [coinbase](/exchanges/coinbase.md#fetchorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchorders)
* [coinmate](/exchanges/coinmate.md#fetchorders)
* [cryptocom](/exchanges/cryptocom.md#fetchorders)
* [cryptomus](/exchanges/cryptomus.md#fetchorders)
* [defx](/exchanges/defx.md#fetchorders)
* [derive](/exchanges/derive.md#fetchorders)
* [digifinex](/exchanges/digifinex.md#fetchorders)
* [dydx](/exchanges/dydx.md#fetchorders)
* [foxbit](/exchanges/foxbit.md#fetchorders)
* [gemini](/exchanges/gemini.md#fetchorders)
* [hollaex](/exchanges/hollaex.md#fetchorders)
* [htx](/exchanges/htx.md#fetchorders)
* [hyperliquid](/exchanges/hyperliquid.md#fetchorders)
* [krakenfutures](/exchanges/krakenfutures.md#fetchorders)
* [latoken](/exchanges/latoken.md#fetchorders)
* [lbank](/exchanges/lbank.md#fetchorders)
* [luno](/exchanges/luno.md#fetchorders)
* [mercado](/exchanges/mercado.md#fetchorders)
* [mexc](/exchanges/mexc.md#fetchorders)
* [modetrade](/exchanges/modetrade.md#fetchorders)
* [ndax](/exchanges/ndax.md#fetchorders)
* [novadax](/exchanges/novadax.md#fetchorders)
* [paradex](/exchanges/paradex.md#fetchorders)
* [phemex](/exchanges/phemex.md#fetchorders)
* [tokocrypto](/exchanges/tokocrypto.md#fetchorders)
* [toobit](/exchanges/toobit.md#fetchorders)
* [wavesexchange](/exchanges/wavesexchange.md#fetchorders)
* [whitebit](/exchanges/whitebit.md#fetchorders)
* [woo](/exchanges/woo.md#fetchorders)
* [woofipro](/exchanges/woofipro.md#fetchorders)
* [xt](/exchanges/xt.md#fetchorders)

---

<a name="fetchOrdersByIds" id="fetchordersbyids"></a>

## fetchOrdersByIds
fetch orders by the list of order id

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structure](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | No | list of order id |
| symbol | <code>string</code> | No | unified ccxt market symbol |
| params | <code>object</code> | No | extra parameters specific to the kraken api endpoint |

##### Supported exchanges
* [kraken](/exchanges/kraken.md#fetchordersbyids)

---

<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

## fetchOrdersByStatus
fetch a list of orders

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| status | <code>string</code> | Yes | order status to fetch for |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for fetching trigger orders |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' for fetching spot margin orders |

##### Supported exchanges
* [coinex](/exchanges/coinex.md#fetchordersbystatus)
* [kucoin](/exchanges/kucoin.md#fetchordersbystatus)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchordersbystatus)

---

<a name="fetchOrdersClassic" id="fetchordersclassic"></a>

## fetchOrdersClassic
fetches information on multiple orders made by the user *classic accounts only*

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


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

##### Supported exchanges
* [bybit](/exchanges/bybit.md#fetchordersclassic)

---

<a name="fetchOrdersWs" id="fetchordersws"></a>

## fetchOrdersWs
fetches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code>, <code>undefined</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code>, <code>undefined</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.orderId | <code>int</code> | No | order id to begin at |
| params.startTime | <code>int</code> | No | earliest time in ms to retrieve orders for |
| params.endTime | <code>int</code> | No | latest time in ms to retrieve orders for |
| params.limit | <code>int</code> | No | the maximum number of order structures to retrieve |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchordersws)
* [bitvavo](/exchanges/bitvavo.md#fetchordersws)
* [gate](/exchanges/gate.md#fetchordersws)

---

<a name="fetchPortfolioDetails" id="fetchportfoliodetails"></a>

## fetchPortfolioDetails
Fetch details for a specific portfolio by UUID

**Kind**: instance   
**Returns**: <code>Array&lt;any&gt;</code> - An account structure <https://docs.ccxt.com/?id=account-structure>


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| portfolioUuid | <code>string</code> | Yes | The unique identifier of the portfolio to fetch |
| params | <code>Dict</code> | No | Extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#fetchportfoliodetails)

---

<a name="fetchPortfolios" id="fetchportfolios"></a>

## fetchPortfolios
fetch all the portfolios

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#fetchportfolios)

---

<a name="fetchPosition" id="fetchposition"></a>

## fetchPosition
fetch data on an open position

**Kind**: instance   
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchposition)
* [bingx](/exchanges/bingx.md#fetchposition)
* [bitget](/exchanges/bitget.md#fetchposition)
* [bitmart](/exchanges/bitmart.md#fetchposition)
* [blofin](/exchanges/blofin.md#fetchposition)
* [bybit](/exchanges/bybit.md#fetchposition)
* [coinbase](/exchanges/coinbase.md#fetchposition)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchposition)
* [coincatch](/exchanges/coincatch.md#fetchposition)
* [coinex](/exchanges/coinex.md#fetchposition)
* [cryptocom](/exchanges/cryptocom.md#fetchposition)
* [defx](/exchanges/defx.md#fetchposition)
* [delta](/exchanges/delta.md#fetchposition)
* [deribit](/exchanges/deribit.md#fetchposition)
* [digifinex](/exchanges/digifinex.md#fetchposition)
* [dydx](/exchanges/dydx.md#fetchposition)
* [gate](/exchanges/gate.md#fetchposition)
* [hitbtc](/exchanges/hitbtc.md#fetchposition)
* [htx](/exchanges/htx.md#fetchposition)
* [hyperliquid](/exchanges/hyperliquid.md#fetchposition)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchposition)
* [mexc](/exchanges/mexc.md#fetchposition)
* [modetrade](/exchanges/modetrade.md#fetchposition)
* [okx](/exchanges/okx.md#fetchposition)
* [paradex](/exchanges/paradex.md#fetchposition)
* [whitebit](/exchanges/whitebit.md#fetchposition)
* [woo](/exchanges/woo.md#fetchposition)
* [woofipro](/exchanges/woofipro.md#fetchposition)
* [xt](/exchanges/xt.md#fetchposition)

---

<a name="fetchPositionHistory" id="fetchpositionhistory"></a>

## fetchPositionHistory
fetches historical positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified contract symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum amount of records to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch positions for |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#fetchpositionhistory)
* [bydfi](/exchanges/bydfi.md#fetchpositionhistory)
* [coinex](/exchanges/coinex.md#fetchpositionhistory)
* [whitebit](/exchanges/whitebit.md#fetchpositionhistory)

---

<a name="fetchPositionMode" id="fetchpositionmode"></a>

## fetchPositionMode
fetchs the position mode, hedged or one way, hedged for aster is set identically for all linear markets or all inverse markets

**Kind**: instance   
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchpositionmode)
* [binance](/exchanges/binance.md#fetchpositionmode)
* [bingx](/exchanges/bingx.md#fetchpositionmode)
* [bitmart](/exchanges/bitmart.md#fetchpositionmode)
* [blofin](/exchanges/blofin.md#fetchpositionmode)
* [bydfi](/exchanges/bydfi.md#fetchpositionmode)
* [coincatch](/exchanges/coincatch.md#fetchpositionmode)
* [mexc](/exchanges/mexc.md#fetchpositionmode)
* [okx](/exchanges/okx.md#fetchpositionmode)
* [poloniex](/exchanges/poloniex.md#fetchpositionmode)

---

<a name="fetchPositionWs" id="fetchpositionws"></a>

## fetchPositionWs
fetch data on an open position

**Kind**: instance   
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchpositionws)

---

<a name="fetchPositions" id="fetchpositions"></a>

## fetchPositions
fetch all open positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#fetchpositions)
* [arkkm](/exchanges/arkkm.md#fetchpositions)
* [ascendex](/exchanges/ascendex.md#fetchpositions)
* [aster](/exchanges/aster.md#fetchpositions)
* [backpack](/exchanges/backpack.md#fetchpositions)
* [binance](/exchanges/binance.md#fetchpositions)
* [bingx](/exchanges/bingx.md#fetchpositions)
* [bitfinex](/exchanges/bitfinex.md#fetchpositions)
* [bitflyer](/exchanges/bitflyer.md#fetchpositions)
* [bitget](/exchanges/bitget.md#fetchpositions)
* [bitmart](/exchanges/bitmart.md#fetchpositions)
* [bitmex](/exchanges/bitmex.md#fetchpositions)
* [blofin](/exchanges/blofin.md#fetchpositions)
* [bullish](/exchanges/bullish.md#fetchpositions)
* [bybit](/exchanges/bybit.md#fetchpositions)
* [bydfi](/exchanges/bydfi.md#fetchpositions)
* [coinbase](/exchanges/coinbase.md#fetchpositions)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchpositions)
* [coincatch](/exchanges/coincatch.md#fetchpositions)
* [coinex](/exchanges/coinex.md#fetchpositions)
* [cryptocom](/exchanges/cryptocom.md#fetchpositions)
* [deepcoin](/exchanges/deepcoin.md#fetchpositions)
* [defx](/exchanges/defx.md#fetchpositions)
* [delta](/exchanges/delta.md#fetchpositions)
* [deribit](/exchanges/deribit.md#fetchpositions)
* [derive](/exchanges/derive.md#fetchpositions)
* [digifinex](/exchanges/digifinex.md#fetchpositions)
* [dydx](/exchanges/dydx.md#fetchpositions)
* [gate](/exchanges/gate.md#fetchpositions)
* [hashkey](/exchanges/hashkey.md#fetchpositions)
* [hibachi](/exchanges/hibachi.md#fetchpositions)
* [hitbtc](/exchanges/hitbtc.md#fetchpositions)
* [htx](/exchanges/htx.md#fetchpositions)
* [hyperliquid](/exchanges/hyperliquid.md#fetchpositions)
* [kraken](/exchanges/kraken.md#fetchpositions)
* [krakenfutures](/exchanges/krakenfutures.md#fetchpositions)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchpositions)
* [mexc](/exchanges/mexc.md#fetchpositions)
* [modetrade](/exchanges/modetrade.md#fetchpositions)
* [okx](/exchanges/okx.md#fetchpositions)
* [oxfun](/exchanges/oxfun.md#fetchpositions)
* [paradex](/exchanges/paradex.md#fetchpositions)
* [phemex](/exchanges/phemex.md#fetchpositions)
* [poloniex](/exchanges/poloniex.md#fetchpositions)
* [toobit](/exchanges/toobit.md#fetchpositions)
* [whitebit](/exchanges/whitebit.md#fetchpositions)
* [woo](/exchanges/woo.md#fetchpositions)
* [woofipro](/exchanges/woofipro.md#fetchpositions)
* [xt](/exchanges/xt.md#fetchpositions)
* [zebpay](/exchanges/zebpay.md#fetchpositions)

---

<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

## fetchPositionsForSymbol
fetch all open positions for specific symbol

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.contractType | <code>string</code> | No | FUTURE or DELIVERY, default is FUTURE |

##### Supported exchanges
* [bydfi](/exchanges/bydfi.md#fetchpositionsforsymbol)
* [coincatch](/exchanges/coincatch.md#fetchpositionsforsymbol)
* [deepcoin](/exchanges/deepcoin.md#fetchpositionsforsymbol)
* [hashkey](/exchanges/hashkey.md#fetchpositionsforsymbol)
* [okx](/exchanges/okx.md#fetchpositionsforsymbol)

---

<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

## fetchPositionsHistory
fetches historical positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified contract symbols |
| since | <code>int</code> | No | timestamp in ms of the earliest position to fetch, default=3 months ago, max range for params["until"] - since is 3 months |
| limit | <code>int</code> | No | the maximum amount of records to fetch, default=20, max=100 |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest position to fetch, max range for params["until"] - since is 3 months |
| params.productType | <code>string</code> | No | USDT-FUTURES (default), COIN-FUTURES, USDC-FUTURES, SUSDT-FUTURES, SCOIN-FUTURES, or SUSDC-FUTURES |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#fetchpositionshistory)
* [bybit](/exchanges/bybit.md#fetchpositionshistory)
* [bydfi](/exchanges/bydfi.md#fetchpositionshistory)
* [gate](/exchanges/gate.md#fetchpositionshistory)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchpositionshistory)
* [mexc](/exchanges/mexc.md#fetchpositionshistory)
* [okx](/exchanges/okx.md#fetchpositionshistory)

---

<a name="fetchPositionsRisk" id="fetchpositionsrisk"></a>

## fetchPositionsRisk
fetch positions risk

**Kind**: instance   
**Returns**: <code>object</code> - data on the positions risk


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchpositionsrisk)

---

<a name="fetchPositionsWs" id="fetchpositionsws"></a>

## fetchPositionsWs
fetch all open positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.returnRateLimits | <code>boolean</code> | No | set to true to return rate limit informations, defaults to false. |
| params.method | <code>string</code>, <code>undefined</code> | No | method to use. Can be account.position or v2/account.position |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchpositionsws)

---

<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

## fetchSettlementHistory
fetches historical settlement records

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/?id=settlement-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records, default 100, max 100 |
| params | <code>object</code> | No | exchange specific params |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchsettlementhistory)
* [bybit](/exchanges/bybit.md#fetchsettlementhistory)
* [cryptocom](/exchanges/cryptocom.md#fetchsettlementhistory)
* [delta](/exchanges/delta.md#fetchsettlementhistory)
* [gate](/exchanges/gate.md#fetchsettlementhistory)
* [htx](/exchanges/htx.md#fetchsettlementhistory)
* [okx](/exchanges/okx.md#fetchsettlementhistory)

---

<a name="fetchSpotMarkets" id="fetchspotmarkets"></a>

## fetchSpotMarkets
retrieves data on all spot markets for hyperliquid

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#fetchspotmarkets)

---

<a name="fetchStatus" id="fetchstatus"></a>

## fetchStatus
the latest known information on the availability of the exchange API

**Kind**: instance   
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/?id=exchange-status-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#fetchstatus)
* [binance](/exchanges/binance.md#fetchstatus)
* [bitbns](/exchanges/bitbns.md#fetchstatus)
* [bitfinex](/exchanges/bitfinex.md#fetchstatus)
* [bitmart](/exchanges/bitmart.md#fetchstatus)
* [bitrue](/exchanges/bitrue.md#fetchstatus)
* [coinsph](/exchanges/coinsph.md#fetchstatus)
* [defx](/exchanges/defx.md#fetchstatus)
* [delta](/exchanges/delta.md#fetchstatus)
* [deribit](/exchanges/deribit.md#fetchstatus)
* [digifinex](/exchanges/digifinex.md#fetchstatus)
* [foxbit](/exchanges/foxbit.md#fetchstatus)
* [hashkey](/exchanges/hashkey.md#fetchstatus)
* [htx](/exchanges/htx.md#fetchstatus)
* [hyperliquid](/exchanges/hyperliquid.md#fetchstatus)
* [kraken](/exchanges/kraken.md#fetchstatus)
* [kucoin](/exchanges/kucoin.md#fetchstatus)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchstatus)
* [mexc](/exchanges/mexc.md#fetchstatus)
* [modetrade](/exchanges/modetrade.md#fetchstatus)
* [okx](/exchanges/okx.md#fetchstatus)
* [paradex](/exchanges/paradex.md#fetchstatus)
* [toobit](/exchanges/toobit.md#fetchstatus)
* [whitebit](/exchanges/whitebit.md#fetchstatus)
* [woo](/exchanges/woo.md#fetchstatus)
* [woofipro](/exchanges/woofipro.md#fetchstatus)
* [zebpay](/exchanges/zebpay.md#fetchstatus)

---

<a name="fetchSwapMarkets" id="fetchswapmarkets"></a>

## fetchSwapMarkets
retrieves data on all swap markets for hyperliquid

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#fetchswapmarkets)

---

<a name="fetchTicker" id="fetchticker"></a>

## fetchTicker
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchticker)
* [alpaca](/exchanges/alpaca.md#fetchticker)
* [apex](/exchanges/apex.md#fetchticker)
* [arkham](/exchanges/arkham.md#fetchticker)
* [ascendex](/exchanges/ascendex.md#fetchticker)
* [aster](/exchanges/aster.md#fetchticker)
* [backpack](/exchanges/backpack.md#fetchticker)
* [bigone](/exchanges/bigone.md#fetchticker)
* [binance](/exchanges/binance.md#fetchticker)
* [bingx](/exchanges/bingx.md#fetchticker)
* [bit2c](/exchanges/bit2c.md#fetchticker)
* [bitbank](/exchanges/bitbank.md#fetchticker)
* [bitfinex](/exchanges/bitfinex.md#fetchticker)
* [bitflyer](/exchanges/bitflyer.md#fetchticker)
* [bitget](/exchanges/bitget.md#fetchticker)
* [bithumb](/exchanges/bithumb.md#fetchticker)
* [bitmart](/exchanges/bitmart.md#fetchticker)
* [bitmex](/exchanges/bitmex.md#fetchticker)
* [bitopro](/exchanges/bitopro.md#fetchticker)
* [bitrue](/exchanges/bitrue.md#fetchticker)
* [bitso](/exchanges/bitso.md#fetchticker)
* [bitstamp](/exchanges/bitstamp.md#fetchticker)
* [bitteam](/exchanges/bitteam.md#fetchticker)
* [bittrade](/exchanges/bittrade.md#fetchticker)
* [bitvavo](/exchanges/bitvavo.md#fetchticker)
* [blockchaincom](/exchanges/blockchaincom.md#fetchticker)
* [blofin](/exchanges/blofin.md#fetchticker)
* [btcbox](/exchanges/btcbox.md#fetchticker)
* [btcmarkets](/exchanges/btcmarkets.md#fetchticker)
* [btcturk](/exchanges/btcturk.md#fetchticker)
* [bullish](/exchanges/bullish.md#fetchticker)
* [bybit](/exchanges/bybit.md#fetchticker)
* [bydfi](/exchanges/bydfi.md#fetchticker)
* [cex](/exchanges/cex.md#fetchticker)
* [coinbase](/exchanges/coinbase.md#fetchticker)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchticker)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchticker)
* [coincatch](/exchanges/coincatch.md#fetchticker)
* [coincheck](/exchanges/coincheck.md#fetchticker)
* [coinex](/exchanges/coinex.md#fetchticker)
* [coinmate](/exchanges/coinmate.md#fetchticker)
* [coinone](/exchanges/coinone.md#fetchticker)
* [coinsph](/exchanges/coinsph.md#fetchticker)
* [coinspot](/exchanges/coinspot.md#fetchticker)
* [cryptocom](/exchanges/cryptocom.md#fetchticker)
* [defx](/exchanges/defx.md#fetchticker)
* [delta](/exchanges/delta.md#fetchticker)
* [deribit](/exchanges/deribit.md#fetchticker)
* [derive](/exchanges/derive.md#fetchticker)
* [digifinex](/exchanges/digifinex.md#fetchticker)
* [exmo](/exchanges/exmo.md#fetchticker)
* [foxbit](/exchanges/foxbit.md#fetchticker)
* [gate](/exchanges/gate.md#fetchticker)
* [gemini](/exchanges/gemini.md#fetchticker)
* [hashkey](/exchanges/hashkey.md#fetchticker)
* [hibachi](/exchanges/hibachi.md#fetchticker)
* [hitbtc](/exchanges/hitbtc.md#fetchticker)
* [hollaex](/exchanges/hollaex.md#fetchticker)
* [htx](/exchanges/htx.md#fetchticker)
* [independentreserve](/exchanges/independentreserve.md#fetchticker)
* [indodax](/exchanges/indodax.md#fetchticker)
* [kraken](/exchanges/kraken.md#fetchticker)
* [kucoin](/exchanges/kucoin.md#fetchticker)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchticker)
* [latoken](/exchanges/latoken.md#fetchticker)
* [lbank](/exchanges/lbank.md#fetchticker)
* [luno](/exchanges/luno.md#fetchticker)
* [mercado](/exchanges/mercado.md#fetchticker)
* [mexc](/exchanges/mexc.md#fetchticker)
* [ndax](/exchanges/ndax.md#fetchticker)
* [novadax](/exchanges/novadax.md#fetchticker)
* [okx](/exchanges/okx.md#fetchticker)
* [onetrading](/exchanges/onetrading.md#fetchticker)
* [oxfun](/exchanges/oxfun.md#fetchticker)
* [p2b](/exchanges/p2b.md#fetchticker)
* [paradex](/exchanges/paradex.md#fetchticker)
* [paymium](/exchanges/paymium.md#fetchticker)
* [phemex](/exchanges/phemex.md#fetchticker)
* [poloniex](/exchanges/poloniex.md#fetchticker)
* [probit](/exchanges/probit.md#fetchticker)
* [timex](/exchanges/timex.md#fetchticker)
* [tokocrypto](/exchanges/tokocrypto.md#fetchticker)
* [upbit](/exchanges/upbit.md#fetchticker)
* [wavesexchange](/exchanges/wavesexchange.md#fetchticker)
* [whitebit](/exchanges/whitebit.md#fetchticker)
* [xt](/exchanges/xt.md#fetchticker)
* [yobit](/exchanges/yobit.md#fetchticker)
* [zaif](/exchanges/zaif.md#fetchticker)
* [zebpay](/exchanges/zebpay.md#fetchticker)
* [zonda](/exchanges/zonda.md#fetchticker)

---

<a name="fetchTickerWs" id="fetchtickerws"></a>

## fetchTickerWs
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | method to use can be ticker.price or ticker.book |
| params.returnRateLimits | <code>boolean</code> | No | return the rate limits for the exchange |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchtickerws)
* [cex](/exchanges/cex.md#fetchtickerws)
* [lbank](/exchanges/lbank.md#fetchtickerws)

---

<a name="fetchTickers" id="fetchtickers"></a>

## fetchTickers
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchtickers)
* [alpaca](/exchanges/alpaca.md#fetchtickers)
* [apex](/exchanges/apex.md#fetchtickers)
* [ascendex](/exchanges/ascendex.md#fetchtickers)
* [aster](/exchanges/aster.md#fetchtickers)
* [backpack](/exchanges/backpack.md#fetchtickers)
* [bigone](/exchanges/bigone.md#fetchtickers)
* [binance](/exchanges/binance.md#fetchtickers)
* [bingx](/exchanges/bingx.md#fetchtickers)
* [bitbns](/exchanges/bitbns.md#fetchtickers)
* [bitfinex](/exchanges/bitfinex.md#fetchtickers)
* [bitget](/exchanges/bitget.md#fetchtickers)
* [bithumb](/exchanges/bithumb.md#fetchtickers)
* [bitmart](/exchanges/bitmart.md#fetchtickers)
* [bitmex](/exchanges/bitmex.md#fetchtickers)
* [bitopro](/exchanges/bitopro.md#fetchtickers)
* [bitrue](/exchanges/bitrue.md#fetchtickers)
* [bitstamp](/exchanges/bitstamp.md#fetchtickers)
* [bitteam](/exchanges/bitteam.md#fetchtickers)
* [bittrade](/exchanges/bittrade.md#fetchtickers)
* [bitvavo](/exchanges/bitvavo.md#fetchtickers)
* [blockchaincom](/exchanges/blockchaincom.md#fetchtickers)
* [blofin](/exchanges/blofin.md#fetchtickers)
* [btcbox](/exchanges/btcbox.md#fetchtickers)
* [btcturk](/exchanges/btcturk.md#fetchtickers)
* [bybit](/exchanges/bybit.md#fetchtickers)
* [bydfi](/exchanges/bydfi.md#fetchtickers)
* [cex](/exchanges/cex.md#fetchtickers)
* [coinbase](/exchanges/coinbase.md#fetchtickers)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchtickers)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchtickers)
* [coincatch](/exchanges/coincatch.md#fetchtickers)
* [coinex](/exchanges/coinex.md#fetchtickers)
* [coinmate](/exchanges/coinmate.md#fetchtickers)
* [coinmetro](/exchanges/coinmetro.md#fetchtickers)
* [coinone](/exchanges/coinone.md#fetchtickers)
* [coinsph](/exchanges/coinsph.md#fetchtickers)
* [coinspot](/exchanges/coinspot.md#fetchtickers)
* [cryptocom](/exchanges/cryptocom.md#fetchtickers)
* [cryptomus](/exchanges/cryptomus.md#fetchtickers)
* [deepcoin](/exchanges/deepcoin.md#fetchtickers)
* [defx](/exchanges/defx.md#fetchtickers)
* [delta](/exchanges/delta.md#fetchtickers)
* [deribit](/exchanges/deribit.md#fetchtickers)
* [digifinex](/exchanges/digifinex.md#fetchtickers)
* [exmo](/exchanges/exmo.md#fetchtickers)
* [foxbit](/exchanges/foxbit.md#fetchtickers)
* [gate](/exchanges/gate.md#fetchtickers)
* [gemini](/exchanges/gemini.md#fetchtickers)
* [hashkey](/exchanges/hashkey.md#fetchtickers)
* [hitbtc](/exchanges/hitbtc.md#fetchtickers)
* [hollaex](/exchanges/hollaex.md#fetchtickers)
* [htx](/exchanges/htx.md#fetchtickers)
* [hyperliquid](/exchanges/hyperliquid.md#fetchtickers)
* [indodax](/exchanges/indodax.md#fetchtickers)
* [kraken](/exchanges/kraken.md#fetchtickers)
* [krakenfutures](/exchanges/krakenfutures.md#fetchtickers)
* [kucoin](/exchanges/kucoin.md#fetchtickers)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchtickers)
* [latoken](/exchanges/latoken.md#fetchtickers)
* [lbank](/exchanges/lbank.md#fetchtickers)
* [luno](/exchanges/luno.md#fetchtickers)
* [mexc](/exchanges/mexc.md#fetchtickers)
* [novadax](/exchanges/novadax.md#fetchtickers)
* [okx](/exchanges/okx.md#fetchtickers)
* [onetrading](/exchanges/onetrading.md#fetchtickers)
* [oxfun](/exchanges/oxfun.md#fetchtickers)
* [p2b](/exchanges/p2b.md#fetchtickers)
* [paradex](/exchanges/paradex.md#fetchtickers)
* [phemex](/exchanges/phemex.md#fetchtickers)
* [poloniex](/exchanges/poloniex.md#fetchtickers)
* [probit](/exchanges/probit.md#fetchtickers)
* [timex](/exchanges/timex.md#fetchtickers)
* [tokocrypto](/exchanges/tokocrypto.md#fetchtickers)
* [toobit](/exchanges/toobit.md#fetchtickers)
* [upbit](/exchanges/upbit.md#fetchtickers)
* [wavesexchange](/exchanges/wavesexchange.md#fetchtickers)
* [whitebit](/exchanges/whitebit.md#fetchtickers)
* [xt](/exchanges/xt.md#fetchtickers)
* [yobit](/exchanges/yobit.md#fetchtickers)
* [zebpay](/exchanges/zebpay.md#fetchtickers)

---

<a name="fetchTime" id="fetchtime"></a>

## fetchTime
fetches the current integer timestamp in milliseconds from the exchange server

**Kind**: instance   
**Returns**: <code>int</code> - the current integer timestamp in milliseconds from the exchange server


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#fetchtime)
* [apex](/exchanges/apex.md#fetchtime)
* [arkham](/exchanges/arkham.md#fetchtime)
* [ascendex](/exchanges/ascendex.md#fetchtime)
* [aster](/exchanges/aster.md#fetchtime)
* [backpack](/exchanges/backpack.md#fetchtime)
* [bigone](/exchanges/bigone.md#fetchtime)
* [binance](/exchanges/binance.md#fetchtime)
* [bingx](/exchanges/bingx.md#fetchtime)
* [bitget](/exchanges/bitget.md#fetchtime)
* [bitmart](/exchanges/bitmart.md#fetchtime)
* [bitrue](/exchanges/bitrue.md#fetchtime)
* [bittrade](/exchanges/bittrade.md#fetchtime)
* [bitvavo](/exchanges/bitvavo.md#fetchtime)
* [btcmarkets](/exchanges/btcmarkets.md#fetchtime)
* [bullish](/exchanges/bullish.md#fetchtime)
* [bybit](/exchanges/bybit.md#fetchtime)
* [cex](/exchanges/cex.md#fetchtime)
* [coinbase](/exchanges/coinbase.md#fetchtime)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchtime)
* [coincatch](/exchanges/coincatch.md#fetchtime)
* [coinex](/exchanges/coinex.md#fetchtime)
* [coinmate](/exchanges/coinmate.md#fetchtime)
* [coinsph](/exchanges/coinsph.md#fetchtime)
* [defx](/exchanges/defx.md#fetchtime)
* [delta](/exchanges/delta.md#fetchtime)
* [deribit](/exchanges/deribit.md#fetchtime)
* [derive](/exchanges/derive.md#fetchtime)
* [digifinex](/exchanges/digifinex.md#fetchtime)
* [dydx](/exchanges/dydx.md#fetchtime)
* [gate](/exchanges/gate.md#fetchtime)
* [hashkey](/exchanges/hashkey.md#fetchtime)
* [hibachi](/exchanges/hibachi.md#fetchtime)
* [htx](/exchanges/htx.md#fetchtime)
* [hyperliquid](/exchanges/hyperliquid.md#fetchtime)
* [indodax](/exchanges/indodax.md#fetchtime)
* [kraken](/exchanges/kraken.md#fetchtime)
* [kucoin](/exchanges/kucoin.md#fetchtime)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchtime)
* [latoken](/exchanges/latoken.md#fetchtime)
* [lbank](/exchanges/lbank.md#fetchtime)
* [mexc](/exchanges/mexc.md#fetchtime)
* [modetrade](/exchanges/modetrade.md#fetchtime)
* [novadax](/exchanges/novadax.md#fetchtime)
* [okx](/exchanges/okx.md#fetchtime)
* [onetrading](/exchanges/onetrading.md#fetchtime)
* [paradex](/exchanges/paradex.md#fetchtime)
* [poloniex](/exchanges/poloniex.md#fetchtime)
* [probit](/exchanges/probit.md#fetchtime)
* [timex](/exchanges/timex.md#fetchtime)
* [tokocrypto](/exchanges/tokocrypto.md#fetchtime)
* [toobit](/exchanges/toobit.md#fetchtime)
* [whitebit](/exchanges/whitebit.md#fetchtime)
* [woo](/exchanges/woo.md#fetchtime)
* [woofipro](/exchanges/woofipro.md#fetchtime)
* [xt](/exchanges/xt.md#fetchtime)
* [zebpayfutures](/exchanges/zebpayfutures.md#fetchtime)

---

<a name="fetchTrades" id="fetchtrades"></a>

## fetchTrades
get the list of most recent trades for a particular symbol

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchtrades)
* [alpaca](/exchanges/alpaca.md#fetchtrades)
* [apex](/exchanges/apex.md#fetchtrades)
* [arkham](/exchanges/arkham.md#fetchtrades)
* [ascendex](/exchanges/ascendex.md#fetchtrades)
* [aster](/exchanges/aster.md#fetchtrades)
* [backpack](/exchanges/backpack.md#fetchtrades)
* [bigone](/exchanges/bigone.md#fetchtrades)
* [binance](/exchanges/binance.md#fetchtrades)
* [bingx](/exchanges/bingx.md#fetchtrades)
* [bit2c](/exchanges/bit2c.md#fetchtrades)
* [bitbank](/exchanges/bitbank.md#fetchtrades)
* [bitbns](/exchanges/bitbns.md#fetchtrades)
* [bitfinex](/exchanges/bitfinex.md#fetchtrades)
* [bitflyer](/exchanges/bitflyer.md#fetchtrades)
* [bitget](/exchanges/bitget.md#fetchtrades)
* [bithumb](/exchanges/bithumb.md#fetchtrades)
* [bitmart](/exchanges/bitmart.md#fetchtrades)
* [bitmex](/exchanges/bitmex.md#fetchtrades)
* [bitopro](/exchanges/bitopro.md#fetchtrades)
* [bitrue](/exchanges/bitrue.md#fetchtrades)
* [bitso](/exchanges/bitso.md#fetchtrades)
* [bitstamp](/exchanges/bitstamp.md#fetchtrades)
* [bitteam](/exchanges/bitteam.md#fetchtrades)
* [bittrade](/exchanges/bittrade.md#fetchtrades)
* [bitvavo](/exchanges/bitvavo.md#fetchtrades)
* [blofin](/exchanges/blofin.md#fetchtrades)
* [btcbox](/exchanges/btcbox.md#fetchtrades)
* [btcmarkets](/exchanges/btcmarkets.md#fetchtrades)
* [btcturk](/exchanges/btcturk.md#fetchtrades)
* [bullish](/exchanges/bullish.md#fetchtrades)
* [bybit](/exchanges/bybit.md#fetchtrades)
* [bydfi](/exchanges/bydfi.md#fetchtrades)
* [cex](/exchanges/cex.md#fetchtrades)
* [coinbase](/exchanges/coinbase.md#fetchtrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchtrades)
* [coincatch](/exchanges/coincatch.md#fetchtrades)
* [coincheck](/exchanges/coincheck.md#fetchtrades)
* [coinex](/exchanges/coinex.md#fetchtrades)
* [coinmate](/exchanges/coinmate.md#fetchtrades)
* [coinmetro](/exchanges/coinmetro.md#fetchtrades)
* [coinone](/exchanges/coinone.md#fetchtrades)
* [coinsph](/exchanges/coinsph.md#fetchtrades)
* [coinspot](/exchanges/coinspot.md#fetchtrades)
* [cryptocom](/exchanges/cryptocom.md#fetchtrades)
* [cryptomus](/exchanges/cryptomus.md#fetchtrades)
* [deepcoin](/exchanges/deepcoin.md#fetchtrades)
* [defx](/exchanges/defx.md#fetchtrades)
* [delta](/exchanges/delta.md#fetchtrades)
* [deribit](/exchanges/deribit.md#fetchtrades)
* [derive](/exchanges/derive.md#fetchtrades)
* [digifinex](/exchanges/digifinex.md#fetchtrades)
* [dydx](/exchanges/dydx.md#fetchtrades)
* [exmo](/exchanges/exmo.md#fetchtrades)
* [foxbit](/exchanges/foxbit.md#fetchtrades)
* [gate](/exchanges/gate.md#fetchtrades)
* [gemini](/exchanges/gemini.md#fetchtrades)
* [hashkey](/exchanges/hashkey.md#fetchtrades)
* [hibachi](/exchanges/hibachi.md#fetchtrades)
* [hitbtc](/exchanges/hitbtc.md#fetchtrades)
* [hollaex](/exchanges/hollaex.md#fetchtrades)
* [htx](/exchanges/htx.md#fetchtrades)
* [hyperliquid](/exchanges/hyperliquid.md#fetchtrades)
* [independentreserve](/exchanges/independentreserve.md#fetchtrades)
* [indodax](/exchanges/indodax.md#fetchtrades)
* [kraken](/exchanges/kraken.md#fetchtrades)
* [krakenfutures](/exchanges/krakenfutures.md#fetchtrades)
* [kucoin](/exchanges/kucoin.md#fetchtrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchtrades)
* [latoken](/exchanges/latoken.md#fetchtrades)
* [lbank](/exchanges/lbank.md#fetchtrades)
* [luno](/exchanges/luno.md#fetchtrades)
* [mercado](/exchanges/mercado.md#fetchtrades)
* [mexc](/exchanges/mexc.md#fetchtrades)
* [modetrade](/exchanges/modetrade.md#fetchtrades)
* [ndax](/exchanges/ndax.md#fetchtrades)
* [novadax](/exchanges/novadax.md#fetchtrades)
* [okx](/exchanges/okx.md#fetchtrades)
* [oxfun](/exchanges/oxfun.md#fetchtrades)
* [p2b](/exchanges/p2b.md#fetchtrades)
* [paradex](/exchanges/paradex.md#fetchtrades)
* [paymium](/exchanges/paymium.md#fetchtrades)
* [phemex](/exchanges/phemex.md#fetchtrades)
* [poloniex](/exchanges/poloniex.md#fetchtrades)
* [probit](/exchanges/probit.md#fetchtrades)
* [timex](/exchanges/timex.md#fetchtrades)
* [tokocrypto](/exchanges/tokocrypto.md#fetchtrades)
* [toobit](/exchanges/toobit.md#fetchtrades)
* [upbit](/exchanges/upbit.md#fetchtrades)
* [wavesexchange](/exchanges/wavesexchange.md#fetchtrades)
* [whitebit](/exchanges/whitebit.md#fetchtrades)
* [woo](/exchanges/woo.md#fetchtrades)
* [woofipro](/exchanges/woofipro.md#fetchtrades)
* [xt](/exchanges/xt.md#fetchtrades)
* [yobit](/exchanges/yobit.md#fetchtrades)
* [zaif](/exchanges/zaif.md#fetchtrades)
* [zebpay](/exchanges/zebpay.md#fetchtrades)
* [zonda](/exchanges/zonda.md#fetchtrades)

---

<a name="fetchTradesWs" id="fetchtradesws"></a>

## fetchTradesWs
fetch all trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve, default=500, max=1000 |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.fromId | <code>int</code> | No | trade ID to begin at |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchtradesws)
* [lbank](/exchanges/lbank.md#fetchtradesws)

---

<a name="fetchTradingFee" id="fetchtradingfee"></a>

## fetchTradingFee
fetch the trading fees for a market

**Kind**: instance   
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#fetchtradingfee)
* [binance](/exchanges/binance.md#fetchtradingfee)
* [bingx](/exchanges/bingx.md#fetchtradingfee)
* [bitflyer](/exchanges/bitflyer.md#fetchtradingfee)
* [bitget](/exchanges/bitget.md#fetchtradingfee)
* [bitmart](/exchanges/bitmart.md#fetchtradingfee)
* [bitstamp](/exchanges/bitstamp.md#fetchtradingfee)
* [bybit](/exchanges/bybit.md#fetchtradingfee)
* [coinex](/exchanges/coinex.md#fetchtradingfee)
* [coinmate](/exchanges/coinmate.md#fetchtradingfee)
* [coinsph](/exchanges/coinsph.md#fetchtradingfee)
* [cryptocom](/exchanges/cryptocom.md#fetchtradingfee)
* [digifinex](/exchanges/digifinex.md#fetchtradingfee)
* [gate](/exchanges/gate.md#fetchtradingfee)
* [hashkey](/exchanges/hashkey.md#fetchtradingfee)
* [hitbtc](/exchanges/hitbtc.md#fetchtradingfee)
* [htx](/exchanges/htx.md#fetchtradingfee)
* [hyperliquid](/exchanges/hyperliquid.md#fetchtradingfee)
* [kraken](/exchanges/kraken.md#fetchtradingfee)
* [kucoin](/exchanges/kucoin.md#fetchtradingfee)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchtradingfee)
* [latoken](/exchanges/latoken.md#fetchtradingfee)
* [lbank](/exchanges/lbank.md#fetchtradingfee)
* [luno](/exchanges/luno.md#fetchtradingfee)
* [mexc](/exchanges/mexc.md#fetchtradingfee)
* [okx](/exchanges/okx.md#fetchtradingfee)
* [timex](/exchanges/timex.md#fetchtradingfee)
* [upbit](/exchanges/upbit.md#fetchtradingfee)
* [woo](/exchanges/woo.md#fetchtradingfee)
* [zebpay](/exchanges/zebpay.md#fetchtradingfee)

---

<a name="fetchTradingFees" id="fetchtradingfees"></a>

## fetchTradingFees
fetch the trading fees for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/?id=fee-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#fetchtradingfees)
* [ascendex](/exchanges/ascendex.md#fetchtradingfees)
* [binance](/exchanges/binance.md#fetchtradingfees)
* [bit2c](/exchanges/bit2c.md#fetchtradingfees)
* [bitbank](/exchanges/bitbank.md#fetchtradingfees)
* [bitfinex](/exchanges/bitfinex.md#fetchtradingfees)
* [bitget](/exchanges/bitget.md#fetchtradingfees)
* [bitopro](/exchanges/bitopro.md#fetchtradingfees)
* [bitso](/exchanges/bitso.md#fetchtradingfees)
* [bitstamp](/exchanges/bitstamp.md#fetchtradingfees)
* [bitvavo](/exchanges/bitvavo.md#fetchtradingfees)
* [blockchaincom](/exchanges/blockchaincom.md#fetchtradingfees)
* [bybit](/exchanges/bybit.md#fetchtradingfees)
* [cex](/exchanges/cex.md#fetchtradingfees)
* [coinbase](/exchanges/coinbase.md#fetchtradingfees)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchtradingfees)
* [coincheck](/exchanges/coincheck.md#fetchtradingfees)
* [coinex](/exchanges/coinex.md#fetchtradingfees)
* [coinsph](/exchanges/coinsph.md#fetchtradingfees)
* [cryptocom](/exchanges/cryptocom.md#fetchtradingfees)
* [cryptomus](/exchanges/cryptomus.md#fetchtradingfees)
* [deribit](/exchanges/deribit.md#fetchtradingfees)
* [exmo](/exchanges/exmo.md#fetchtradingfees)
* [foxbit](/exchanges/foxbit.md#fetchtradingfees)
* [gate](/exchanges/gate.md#fetchtradingfees)
* [gemini](/exchanges/gemini.md#fetchtradingfees)
* [hashkey](/exchanges/hashkey.md#fetchtradingfees)
* [hibachi](/exchanges/hibachi.md#fetchtradingfees)
* [hitbtc](/exchanges/hitbtc.md#fetchtradingfees)
* [hollaex](/exchanges/hollaex.md#fetchtradingfees)
* [independentreserve](/exchanges/independentreserve.md#fetchtradingfees)
* [lbank](/exchanges/lbank.md#fetchtradingfees)
* [modetrade](/exchanges/modetrade.md#fetchtradingfees)
* [onetrading](/exchanges/onetrading.md#fetchtradingfees)
* [poloniex](/exchanges/poloniex.md#fetchtradingfees)
* [toobit](/exchanges/toobit.md#fetchtradingfees)
* [upbit](/exchanges/upbit.md#fetchtradingfees)
* [whitebit](/exchanges/whitebit.md#fetchtradingfees)
* [woo](/exchanges/woo.md#fetchtradingfees)
* [woofipro](/exchanges/woofipro.md#fetchtradingfees)
* [yobit](/exchanges/yobit.md#fetchtradingfees)
* [zebpay(futures)](/exchanges/zebpay(futures).md#fetchtradingfees)

---

<a name="fetchTradingFeesWs" id="fetchtradingfeesws"></a>

## fetchTradingFeesWs
fetch the trading fees for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/?id=fee-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#fetchtradingfeesws)

---

<a name="fetchTradingLimits" id="fetchtradinglimits"></a>

## fetchTradingLimits
fetch the trading limits for a market

**Kind**: instance   
**Returns**: <code>object</code> - a [trading limits structure](https://docs.ccxt.com/?id=trading-limits-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [whitebit](/exchanges/whitebit.md#fetchtradinglimits)

---

<a name="fetchTransactionFee" id="fetchtransactionfee"></a>

## fetchTransactionFee
please use fetchDepositWithdrawFee instead

**Kind**: instance   
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network code of the currency |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#fetchtransactionfee)
* [indodax](/exchanges/indodax.md#fetchtransactionfee)
* [kucoin](/exchanges/kucoin.md#fetchtransactionfee)

---

<a name="fetchTransactionFees" id="fetchtransactionfees"></a>

## fetchTransactionFees
please use fetchDepositWithdrawFees instead

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fee structures](https://docs.ccxt.com/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | not used by binance fetchTransactionFees () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchtransactionfees)
* [bitso](/exchanges/bitso.md#fetchtransactionfees)
* [bitstamp](/exchanges/bitstamp.md#fetchtransactionfees)
* [exmo](/exchanges/exmo.md#fetchtransactionfees)
* [gate](/exchanges/gate.md#fetchtransactionfees)
* [lbank](/exchanges/lbank.md#fetchtransactionfees)
* [mexc](/exchanges/mexc.md#fetchtransactionfees)
* [whitebit](/exchanges/whitebit.md#fetchtransactionfees)

---

<a name="fetchTransactions" id="fetchtransactions"></a>

## fetchTransactions
Fetch all transactions (deposits and withdrawals) made from an account.

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawal structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [foxbit](/exchanges/foxbit.md#fetchtransactions)
* [latoken](/exchanges/latoken.md#fetchtransactions)
* [whitebit](/exchanges/whitebit.md#fetchtransactions)

---

<a name="fetchTransfer" id="fetchtransfer"></a>

## fetchTransfer
fetches a transfer

**Kind**: instance   
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | transfer id |
| code | <code>string</code> | No | not used by mexc fetchTransfer |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |

##### Supported exchanges
* [mexc](/exchanges/mexc.md#fetchtransfer)

---

<a name="fetchTransfers" id="fetchtransfers"></a>

## fetchTransfers
fetch a history of internal transfers made on an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency transferred |
| since | <code>int</code> | No | the earliest time in ms to fetch transfers for |
| limit | <code>int</code> | No | the maximum number of transfers structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch transfers for |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.internal | <code>boolean</code> | No | default false, when true will fetch pay trade history |

##### Supported exchanges
* [binance](/exchanges/binance.md#fetchtransfers)
* [bingx](/exchanges/bingx.md#fetchtransfers)
* [bitget](/exchanges/bitget.md#fetchtransfers)
* [bitmart](/exchanges/bitmart.md#fetchtransfers)
* [bitrue](/exchanges/bitrue.md#fetchtransfers)
* [bullish](/exchanges/bullish.md#fetchtransfers)
* [bybit](/exchanges/bybit.md#fetchtransfers)
* [bydfi](/exchanges/bydfi.md#fetchtransfers)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchtransfers)
* [coinex](/exchanges/coinex.md#fetchtransfers)
* [deribit](/exchanges/deribit.md#fetchtransfers)
* [digifinex](/exchanges/digifinex.md#fetchtransfers)
* [dydx](/exchanges/dydx.md#fetchtransfers)
* [kucoin](/exchanges/kucoin.md#fetchtransfers)
* [latoken](/exchanges/latoken.md#fetchtransfers)
* [mexc](/exchanges/mexc.md#fetchtransfers)
* [okx](/exchanges/okx.md#fetchtransfers)
* [oxfun](/exchanges/oxfun.md#fetchtransfers)
* [paradex](/exchanges/paradex.md#fetchtransfers)
* [phemex](/exchanges/phemex.md#fetchtransfers)
* [woo](/exchanges/woo.md#fetchtransfers)

---

<a name="fetchUnderlyingAssets" id="fetchunderlyingassets"></a>

## fetchUnderlyingAssets
fetches the market ids of underlying assets for a specific contract market type

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [underlying assets](https://docs.ccxt.com/?id=underlying-assets-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>string</code> | No | the contract market type, 'option', 'swap' or 'future', the default is 'option' |

##### Supported exchanges
* [gate](/exchanges/gate.md#fetchunderlyingassets)
* [okx](/exchanges/okx.md#fetchunderlyingassets)

---

<a name="fetchVolatilityHistory" id="fetchvolatilityhistory"></a>

## fetchVolatilityHistory
fetch the historical volatility of an option market based on an underlying asset

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [volatility history objects](https://docs.ccxt.com/?id=volatility-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.period | <code>int</code> | No | the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270 |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#fetchvolatilityhistory)
* [deribit](/exchanges/deribit.md#fetchvolatilityhistory)

---

<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

## fetchWithdrawal
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | Yes | not used by bitmart.fetchWithdrawal |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#fetchwithdrawal)
* [bitopro](/exchanges/bitopro.md#fetchwithdrawal)
* [blockchaincom](/exchanges/blockchaincom.md#fetchwithdrawal)
* [exmo](/exchanges/exmo.md#fetchwithdrawal)
* [hollaex](/exchanges/hollaex.md#fetchwithdrawal)
* [okx](/exchanges/okx.md#fetchwithdrawal)
* [upbit](/exchanges/upbit.md#fetchwithdrawal)

---

<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

## fetchWithdrawals
fetch all withdrawals made from an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alp](/exchanges/alp.md#fetchwithdrawals)
* [alpaca](/exchanges/alpaca.md#fetchwithdrawals)
* [ascendex](/exchanges/ascendex.md#fetchwithdrawals)
* [backpack](/exchanges/backpack.md#fetchwithdrawals)
* [bigone](/exchanges/bigone.md#fetchwithdrawals)
* [binance](/exchanges/binance.md#fetchwithdrawals)
* [bingx](/exchanges/bingx.md#fetchwithdrawals)
* [bitbns](/exchanges/bitbns.md#fetchwithdrawals)
* [bitflyer](/exchanges/bitflyer.md#fetchwithdrawals)
* [bitget](/exchanges/bitget.md#fetchwithdrawals)
* [bitmart](/exchanges/bitmart.md#fetchwithdrawals)
* [bitopro](/exchanges/bitopro.md#fetchwithdrawals)
* [bitrue](/exchanges/bitrue.md#fetchwithdrawals)
* [bitstamp](/exchanges/bitstamp.md#fetchwithdrawals)
* [bittrade](/exchanges/bittrade.md#fetchwithdrawals)
* [bitvavo](/exchanges/bitvavo.md#fetchwithdrawals)
* [blockchaincom](/exchanges/blockchaincom.md#fetchwithdrawals)
* [blofin](/exchanges/blofin.md#fetchwithdrawals)
* [btcmarkets](/exchanges/btcmarkets.md#fetchwithdrawals)
* [bybit](/exchanges/bybit.md#fetchwithdrawals)
* [bydfi](/exchanges/bydfi.md#fetchwithdrawals)
* [coinbase](/exchanges/coinbase.md#fetchwithdrawals)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#fetchwithdrawals)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#fetchwithdrawals)
* [coincatch](/exchanges/coincatch.md#fetchwithdrawals)
* [coincheck](/exchanges/coincheck.md#fetchwithdrawals)
* [coinex](/exchanges/coinex.md#fetchwithdrawals)
* [coinsph](/exchanges/coinsph.md#fetchwithdrawals)
* [cryptocom](/exchanges/cryptocom.md#fetchwithdrawals)
* [deepcoin](/exchanges/deepcoin.md#fetchwithdrawals)
* [deribit](/exchanges/deribit.md#fetchwithdrawals)
* [derive](/exchanges/derive.md#fetchwithdrawals)
* [digifinex](/exchanges/digifinex.md#fetchwithdrawals)
* [dydx](/exchanges/dydx.md#fetchwithdrawals)
* [exmo](/exchanges/exmo.md#fetchwithdrawals)
* [foxbit](/exchanges/foxbit.md#fetchwithdrawals)
* [gate](/exchanges/gate.md#fetchwithdrawals)
* [hashkey](/exchanges/hashkey.md#fetchwithdrawals)
* [hibachi](/exchanges/hibachi.md#fetchwithdrawals)
* [hitbtc](/exchanges/hitbtc.md#fetchwithdrawals)
* [hollaex](/exchanges/hollaex.md#fetchwithdrawals)
* [htx](/exchanges/htx.md#fetchwithdrawals)
* [hyperliquid](/exchanges/hyperliquid.md#fetchwithdrawals)
* [kraken](/exchanges/kraken.md#fetchwithdrawals)
* [kucoin](/exchanges/kucoin.md#fetchwithdrawals)
* [kucoinfutures](/exchanges/kucoinfutures.md#fetchwithdrawals)
* [lbank](/exchanges/lbank.md#fetchwithdrawals)
* [mexc](/exchanges/mexc.md#fetchwithdrawals)
* [modetrade](/exchanges/modetrade.md#fetchwithdrawals)
* [ndax](/exchanges/ndax.md#fetchwithdrawals)
* [novadax](/exchanges/novadax.md#fetchwithdrawals)
* [okx](/exchanges/okx.md#fetchwithdrawals)
* [oxfun](/exchanges/oxfun.md#fetchwithdrawals)
* [paradex](/exchanges/paradex.md#fetchwithdrawals)
* [phemex](/exchanges/phemex.md#fetchwithdrawals)
* [poloniex](/exchanges/poloniex.md#fetchwithdrawals)
* [probit](/exchanges/probit.md#fetchwithdrawals)
* [timex](/exchanges/timex.md#fetchwithdrawals)
* [tokocrypto](/exchanges/tokocrypto.md#fetchwithdrawals)
* [toobit](/exchanges/toobit.md#fetchwithdrawals)
* [upbit](/exchanges/upbit.md#fetchwithdrawals)
* [whitebit](/exchanges/whitebit.md#fetchwithdrawals)
* [woo](/exchanges/woo.md#fetchwithdrawals)
* [woofipro](/exchanges/woofipro.md#fetchwithdrawals)
* [xt](/exchanges/xt.md#fetchwithdrawals)

---

<a name="fetchWithdrawalsWs" id="fetchwithdrawalsws"></a>

## fetchWithdrawalsWs
fetch all withdrawals made from an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#fetchwithdrawalsws)

---

<a name="isUnifiedEnabled" id="isunifiedenabled"></a>

## isUnifiedEnabled
returns [enableUnifiedMargin, enableUnifiedAccount] so the user can check if unified account is enabled

**Kind**: instance   
**Returns**: <code>any</code> - [enableUnifiedMargin, enableUnifiedAccount]


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#isunifiedenabled)

---

<a name="loadMigrationStatus" id="loadmigrationstatus"></a>

## loadMigrationStatus
loads the migration status for the account (hf or not)

**Kind**: instance   
**Returns**: <code>any</code> - ignore


| Param | Type | Description |
| --- | --- | --- |
| force | <code>boolean</code> | load account state for non hf |

##### Supported exchanges
* [kucoin](/exchanges/kucoin.md#loadmigrationstatus)

---

<a name="loadUnifiedStatus" id="loadunifiedstatus"></a>

## loadUnifiedStatus
returns unifiedAccount so the user can check if the unified account is enabled

**Kind**: instance   
**Returns**: <code>boolean</code> - true or false if the enabled unified account is enabled or not and sets the unifiedAccount option if it is undefined


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [gate](/exchanges/gate.md#loadunifiedstatus)

---

<a name="market" id="market"></a>

## market
calculates the presumptive fee that would be charged for an order

**Kind**: instance   
**Returns**: <code>object</code> - contains the rate, the percentage multiplied to the order amount to obtain the fee amount, and cost, the total value of the fee in units of the quote currency, for the order


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified market symbol |
| type | <code>string</code> | not used by btcmarkets.calculateFee |
| side | <code>string</code> | not used by btcmarkets.calculateFee |
| amount | <code>float</code> | how much you want to trade, in units of the base currency on most exchanges, or number of contracts |
| price | <code>float</code> | the price for the order to be filled at, in units of the quote currency |
| takerOrMaker | <code>string</code> | 'taker' or 'maker' |
| params | <code>object</code> |  |

##### Supported exchanges
* [&lt;anonymous&gt;](/exchanges/&lt;anonymous&gt;.md#market)

---

<a name="redeemGiftCode" id="redeemgiftcode"></a>

## redeemGiftCode
redeem gift code

**Kind**: instance   
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| giftcardCode | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#redeemgiftcode)

---

<a name="reduceMargin" id="reducemargin"></a>

## reduceMargin
remove margin from a position

**Kind**: instance   
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/?id=margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#reducemargin)
* [aster](/exchanges/aster.md#reducemargin)
* [binance](/exchanges/binance.md#reducemargin)
* [bitget](/exchanges/bitget.md#reducemargin)
* [coincatch](/exchanges/coincatch.md#reducemargin)
* [coinex](/exchanges/coinex.md#reducemargin)
* [delta](/exchanges/delta.md#reducemargin)
* [digifinex](/exchanges/digifinex.md#reducemargin)
* [exmo](/exchanges/exmo.md#reducemargin)
* [gate](/exchanges/gate.md#reducemargin)
* [hitbtc](/exchanges/hitbtc.md#reducemargin)
* [hyperliquid](/exchanges/hyperliquid.md#reducemargin)
* [mexc](/exchanges/mexc.md#reducemargin)
* [okx](/exchanges/okx.md#reducemargin)
* [poloniex](/exchanges/poloniex.md#reducemargin)
* [woo](/exchanges/woo.md#reducemargin)
* [xt](/exchanges/xt.md#reducemargin)
* [zebpayfutures](/exchanges/zebpayfutures.md#reducemargin)

---

<a name="repayCrossMargin" id="repaycrossmargin"></a>

## repayCrossMargin
repay borrowed margin and interest

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to repay margin in a portfolio margin account |
| params.repayCrossMarginMethod | <code>string</code> | No | *portfolio margin only* 'papiPostRepayLoan' (default), 'papiPostMarginRepayDebt' (alternative) |
| params.specifyRepayAssets | <code>string</code> | No | *portfolio margin papiPostMarginRepayDebt only* specific asset list to repay debt |

##### Supported exchanges
* [binance](/exchanges/binance.md#repaycrossmargin)
* [bitget](/exchanges/bitget.md#repaycrossmargin)
* [bybit](/exchanges/bybit.md#repaycrossmargin)
* [gate](/exchanges/gate.md#repaycrossmargin)
* [htx](/exchanges/htx.md#repaycrossmargin)
* [kucoin](/exchanges/kucoin.md#repaycrossmargin)
* [okx](/exchanges/okx.md#repaycrossmargin)

---

<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

## repayIsolatedMargin
repay borrowed margin and interest

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#repayisolatedmargin)
* [bitget](/exchanges/bitget.md#repayisolatedmargin)
* [bitmart](/exchanges/bitmart.md#repayisolatedmargin)
* [coinex](/exchanges/coinex.md#repayisolatedmargin)
* [htx](/exchanges/htx.md#repayisolatedmargin)
* [kucoin](/exchanges/kucoin.md#repayisolatedmargin)

---

<a name="repayMargin" id="repaymargin"></a>

## repayMargin
repay borrowed margin and interest

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.mode | <code>string</code> | No | 'all' or 'partial' payment mode, extra parameter required for isolated margin |
| params.id | <code>string</code> | No | '34267567' loan id, extra parameter required for isolated margin |

##### Supported exchanges
* [gate](/exchanges/gate.md#repaymargin)
* [woo](/exchanges/woo.md#repaymargin)

---

<a name="reserveRequestWeight" id="reserverequestweight"></a>

## reserveRequestWeight
Instead of trading to increase the address based rate limits, this action allows reserving additional actions for 0.0005 USDC per request. The cost is paid from the Perps balance.

**Kind**: instance   
**Returns**: <code>object</code> - a response object


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| weight | <code>number</code> | Yes | the weight to reserve, 1 weight = 1 action, 0.0005 USDC per action |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#reserverequestweight)

---

<a name="setLeverage" id="setleverage"></a>

## setLeverage
set the level of leverage for a market

**Kind**: instance   
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| leverage | <code>float</code> | Yes | the rate of leverage |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#setleverage)
* [arkham](/exchanges/arkham.md#setleverage)
* [ascendex](/exchanges/ascendex.md#setleverage)
* [aster](/exchanges/aster.md#setleverage)
* [binance](/exchanges/binance.md#setleverage)
* [bingx](/exchanges/bingx.md#setleverage)
* [bitget](/exchanges/bitget.md#setleverage)
* [bitmart](/exchanges/bitmart.md#setleverage)
* [bitmex](/exchanges/bitmex.md#setleverage)
* [bitrue](/exchanges/bitrue.md#setleverage)
* [blofin](/exchanges/blofin.md#setleverage)
* [bybit](/exchanges/bybit.md#setleverage)
* [bydfi](/exchanges/bydfi.md#setleverage)
* [coincatch](/exchanges/coincatch.md#setleverage)
* [coinex](/exchanges/coinex.md#setleverage)
* [deepcoin](/exchanges/deepcoin.md#setleverage)
* [defx](/exchanges/defx.md#setleverage)
* [delta](/exchanges/delta.md#setleverage)
* [digifinex](/exchanges/digifinex.md#setleverage)
* [gate](/exchanges/gate.md#setleverage)
* [hashkey](/exchanges/hashkey.md#setleverage)
* [hitbtc](/exchanges/hitbtc.md#setleverage)
* [htx](/exchanges/htx.md#setleverage)
* [hyperliquid](/exchanges/hyperliquid.md#setleverage)
* [krakenfutures](/exchanges/krakenfutures.md#setleverage)
* [kucoin](/exchanges/kucoin.md#setleverage)
* [kucoinfutures](/exchanges/kucoinfutures.md#setleverage)
* [mexc](/exchanges/mexc.md#setleverage)
* [modetrade](/exchanges/modetrade.md#setleverage)
* [okx](/exchanges/okx.md#setleverage)
* [paradex](/exchanges/paradex.md#setleverage)
* [phemex](/exchanges/phemex.md#setleverage)
* [poloniex](/exchanges/poloniex.md#setleverage)
* [toobit](/exchanges/toobit.md#setleverage)
* [whitebit](/exchanges/whitebit.md#setleverage)
* [woo](/exchanges/woo.md#setleverage)
* [woofipro](/exchanges/woofipro.md#setleverage)
* [xt](/exchanges/xt.md#setleverage)
* [zebpay](/exchanges/zebpay.md#setleverage)

---

<a name="setMargin" id="setmargin"></a>

## setMargin
Either adds or reduces margin in an isolated position in order to set the margin to a specific value

**Kind**: instance   
**Returns**: <code>object</code> - A [margin structure](https://docs.ccxt.com/?id=margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to set margin in |
| amount | <code>float</code> | Yes | the amount to set the margin to |
| params | <code>object</code> | No | parameters specific to the bingx api endpoint |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#setmargin)
* [bitfinex](/exchanges/bitfinex.md#setmargin)
* [bitrue](/exchanges/bitrue.md#setmargin)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#setmargin)
* [phemex](/exchanges/phemex.md#setmargin)

---

<a name="setMarginMode" id="setmarginmode"></a>

## setMarginMode
set margin mode to 'cross' or 'isolated'

**Kind**: instance   
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| marginMode | <code>string</code> | Yes | 'cross' or 'isolated' |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#setmarginmode)
* [aster](/exchanges/aster.md#setmarginmode)
* [binance](/exchanges/binance.md#setmarginmode)
* [bingx](/exchanges/bingx.md#setmarginmode)
* [bitget](/exchanges/bitget.md#setmarginmode)
* [bitmex](/exchanges/bitmex.md#setmarginmode)
* [blofin](/exchanges/blofin.md#setmarginmode)
* [bybit](/exchanges/bybit.md#setmarginmode)
* [bydfi](/exchanges/bydfi.md#setmarginmode)
* [coincatch](/exchanges/coincatch.md#setmarginmode)
* [coinex](/exchanges/coinex.md#setmarginmode)
* [digifinex](/exchanges/digifinex.md#setmarginmode)
* [hyperliquid](/exchanges/hyperliquid.md#setmarginmode)
* [kucoinfutures](/exchanges/kucoinfutures.md#setmarginmode)
* [mexc](/exchanges/mexc.md#setmarginmode)
* [okx](/exchanges/okx.md#setmarginmode)
* [paradex](/exchanges/paradex.md#setmarginmode)
* [phemex](/exchanges/phemex.md#setmarginmode)
* [toobit](/exchanges/toobit.md#setmarginmode)
* [xt](/exchanges/xt.md#setmarginmode)

---

<a name="setPositionMode" id="setpositionmode"></a>

## setPositionMode
set hedged to true or false for a market

**Kind**: instance   
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by bingx setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#setpositionmode)
* [binance](/exchanges/binance.md#setpositionmode)
* [bingx](/exchanges/bingx.md#setpositionmode)
* [bitget](/exchanges/bitget.md#setpositionmode)
* [bitmart](/exchanges/bitmart.md#setpositionmode)
* [blofin](/exchanges/blofin.md#setpositionmode)
* [bybit](/exchanges/bybit.md#setpositionmode)
* [bydfi](/exchanges/bydfi.md#setpositionmode)
* [coincatch](/exchanges/coincatch.md#setpositionmode)
* [gate](/exchanges/gate.md#setpositionmode)
* [htx](/exchanges/htx.md#setpositionmode)
* [kucoinfutures](/exchanges/kucoinfutures.md#setpositionmode)
* [mexc](/exchanges/mexc.md#setpositionmode)
* [okx](/exchanges/okx.md#setpositionmode)
* [phemex](/exchanges/phemex.md#setpositionmode)
* [poloniex](/exchanges/poloniex.md#setpositionmode)
* [woo](/exchanges/woo.md#setpositionmode)

---

<a name="setSandboxMode" id="setsandboxmode"></a>

## setSandboxMode
enables or disables demo trading mode, if enabled will send PAPTRADING=1 in headers

**Kind**: instance   


| Param |
| --- |
| enabled | 

##### Supported exchanges
* [bitget](/exchanges/bitget.md#setsandboxmode)

---

<a name="signIn" id="signin"></a>

## signIn
sign in, must be called prior to using other authenticated methods

**Kind**: instance   
**Returns**: response from exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bullish](/exchanges/bullish.md#signin)
* [ndax](/exchanges/ndax.md#signin)
* [probit](/exchanges/probit.md#signin)
* [wavesexchange](/exchanges/wavesexchange.md#signin)

---

<a name="transfer" id="transfer"></a>

## transfer
transfer currency internally between wallets on the same account

**Kind**: instance   
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.transferId | <code>string</code> | No | UUID, which is unique across the platform |

##### Supported exchanges
* [apex](/exchanges/apex.md#transfer)
* [ascendex](/exchanges/ascendex.md#transfer)
* [aster](/exchanges/aster.md#transfer)
* [bigone](/exchanges/bigone.md#transfer)
* [binance](/exchanges/binance.md#transfer)
* [bingx](/exchanges/bingx.md#transfer)
* [bitfinex](/exchanges/bitfinex.md#transfer)
* [bitget](/exchanges/bitget.md#transfer)
* [bitmart](/exchanges/bitmart.md#transfer)
* [bitrue](/exchanges/bitrue.md#transfer)
* [bitstamp](/exchanges/bitstamp.md#transfer)
* [blofin](/exchanges/blofin.md#transfer)
* [bullish](/exchanges/bullish.md#transfer)
* [bybit](/exchanges/bybit.md#transfer)
* [budfi](/exchanges/budfi.md#transfer)
* [cex](/exchanges/cex.md#transfer)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#transfer)
* [coincatch](/exchanges/coincatch.md#transfer)
* [coinex](/exchanges/coinex.md#transfer)
* [deepcoin](/exchanges/deepcoin.md#transfer)
* [deribit](/exchanges/deribit.md#transfer)
* [digifinex](/exchanges/digifinex.md#transfer)
* [dydx](/exchanges/dydx.md#transfer)
* [gate](/exchanges/gate.md#transfer)
* [hashkey](/exchanges/hashkey.md#transfer)
* [hitbtc](/exchanges/hitbtc.md#transfer)
* [htx](/exchanges/htx.md#transfer)
* [hyperliquid](/exchanges/hyperliquid.md#transfer)
* [kraken](/exchanges/kraken.md#transfer)
* [krakenfutures](/exchanges/krakenfutures.md#transfer)
* [kucoin](/exchanges/kucoin.md#transfer)
* [kucoinfutures](/exchanges/kucoinfutures.md#transfer)
* [latoken](/exchanges/latoken.md#transfer)
* [mexc](/exchanges/mexc.md#transfer)
* [novadax](/exchanges/novadax.md#transfer)
* [okx](/exchanges/okx.md#transfer)
* [oxfun](/exchanges/oxfun.md#transfer)
* [paymium](/exchanges/paymium.md#transfer)
* [phemex](/exchanges/phemex.md#transfer)
* [poloniex](/exchanges/poloniex.md#transfer)
* [toobit](/exchanges/toobit.md#transfer)
* [whitebit](/exchanges/whitebit.md#transfer)
* [woo](/exchanges/woo.md#transfer)
* [xt](/exchanges/xt.md#transfer)
* [zonda](/exchanges/zonda.md#transfer)

---

<a name="transferOut" id="transferout"></a>

## transferOut
transfer from spot wallet to futures wallet

**Kind**: instance   
**Returns**: a [transfer structure](https://docs.ccxt.com/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>str</code> | Yes | Unified currency code |
| amount | <code>float</code> | Yes | Size of the transfer |
| params | <code>dict</code> | No | Exchange specific parameters |

##### Supported exchanges
* [kraken](/exchanges/kraken.md#transferout)
* [krakenfutures](/exchanges/krakenfutures.md#transferout)

---

<a name="unWatchBidsAsks" id="unwatchbidsasks"></a>

## unWatchBidsAsks
unWatches best bid & ask for symbols

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchbidsasks)
* [backpack](/exchanges/backpack.md#unwatchbidsasks)
* [mexc](/exchanges/mexc.md#unwatchbidsasks)
* [woo](/exchanges/woo.md#unwatchbidsasks)

---

<a name="unWatchMarkPrice" id="unwatchmarkprice"></a>

## unWatchMarkPrice
unWatches a mark price for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchmarkprice)
* [binance](/exchanges/binance.md#unwatchmarkprice)

---

<a name="unWatchMarkPrices" id="unwatchmarkprices"></a>

## unWatchMarkPrices
watches the mark price for all markets

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchmarkprices)
* [binance](/exchanges/binance.md#unwatchmarkprices)

---

<a name="unWatchMyTrades" id="unwatchmytrades"></a>

## unWatchMyTrades
unWatches information on multiple trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |
| params.executionFast | <code>boolean</code> | No | use fast execution |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#unwatchmytrades)
* [hyperliquid](/exchanges/hyperliquid.md#unwatchmytrades)

---

<a name="unWatchOHLCV" id="unwatchohlcv"></a>

## unWatchOHLCV
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchohlcv)
* [backpack](/exchanges/backpack.md#unwatchohlcv)
* [binance](/exchanges/binance.md#unwatchohlcv)
* [bingx](/exchanges/bingx.md#unwatchohlcv)
* [bitfinex](/exchanges/bitfinex.md#unwatchohlcv)
* [bitget](/exchanges/bitget.md#unwatchohlcv)
* [bitmart](/exchanges/bitmart.md#unwatchohlcv)
* [bybit](/exchanges/bybit.md#unwatchohlcv)
* [bydfi](/exchanges/bydfi.md#unwatchohlcv)
* [coincatch](/exchanges/coincatch.md#unwatchohlcv)
* [cryptocom](/exchanges/cryptocom.md#unwatchohlcv)
* [deepcoin](/exchanges/deepcoin.md#unwatchohlcv)
* [defx](/exchanges/defx.md#unwatchohlcv)
* [dydx](/exchanges/dydx.md#unwatchohlcv)
* [htx](/exchanges/htx.md#unwatchohlcv)
* [hyperliquid](/exchanges/hyperliquid.md#unwatchohlcv)
* [kucoin](/exchanges/kucoin.md#unwatchohlcv)
* [mexc](/exchanges/mexc.md#unwatchohlcv)
* [okx](/exchanges/okx.md#unwatchohlcv)
* [woo](/exchanges/woo.md#unwatchohlcv)

---

<a name="unWatchOHLCVForSymbols" id="unwatchohlcvforsymbols"></a>

## unWatchOHLCVForSymbols
unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchohlcvforsymbols)
* [backpack](/exchanges/backpack.md#unwatchohlcvforsymbols)
* [binance](/exchanges/binance.md#unwatchohlcvforsymbols)
* [bybit](/exchanges/bybit.md#unwatchohlcvforsymbols)
* [bydfi](/exchanges/bydfi.md#unwatchohlcvforsymbols)
* [defx](/exchanges/defx.md#unwatchohlcvforsymbols)
* [okx](/exchanges/okx.md#unwatchohlcvforsymbols)

---

<a name="unWatchOrderBook" id="unwatchorderbook"></a>

## unWatchOrderBook
unsubscribe from the orderbook channel

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchorderbook)
* [backpack](/exchanges/backpack.md#unwatchorderbook)
* [binance](/exchanges/binance.md#unwatchorderbook)
* [bingx](/exchanges/bingx.md#unwatchorderbook)
* [bitget](/exchanges/bitget.md#unwatchorderbook)
* [bitmart](/exchanges/bitmart.md#unwatchorderbook)
* [bybit](/exchanges/bybit.md#unwatchorderbook)
* [bydfi](/exchanges/bydfi.md#unwatchorderbook)
* [coincatch](/exchanges/coincatch.md#unwatchorderbook)
* [cryptocom](/exchanges/cryptocom.md#unwatchorderbook)
* [deepcoin](/exchanges/deepcoin.md#unwatchorderbook)
* [defx](/exchanges/defx.md#unwatchorderbook)
* [derive](/exchanges/derive.md#unwatchorderbook)
* [dydx](/exchanges/dydx.md#unwatchorderbook)
* [gate](/exchanges/gate.md#unwatchorderbook)
* [htx](/exchanges/htx.md#unwatchorderbook)
* [hyperliquid](/exchanges/hyperliquid.md#unwatchorderbook)
* [kucoin](/exchanges/kucoin.md#unwatchorderbook)
* [kucoinfutures](/exchanges/kucoinfutures.md#unwatchorderbook)
* [mexc](/exchanges/mexc.md#unwatchorderbook)
* [okx](/exchanges/okx.md#unwatchorderbook)
* [woo](/exchanges/woo.md#unwatchorderbook)

---

<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

## unWatchOrderBookForSymbols
unsubscribe from the orderbook channel

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to unwatch the trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.limit | <code>int</code> | No | orderbook limit, default is undefined |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchorderbookforsymbols)
* [backpack](/exchanges/backpack.md#unwatchorderbookforsymbols)
* [binance](/exchanges/binance.md#unwatchorderbookforsymbols)
* [bitmart](/exchanges/bitmart.md#unwatchorderbookforsymbols)
* [bybit](/exchanges/bybit.md#unwatchorderbookforsymbols)
* [bydfi](/exchanges/bydfi.md#unwatchorderbookforsymbols)
* [cryptocom](/exchanges/cryptocom.md#unwatchorderbookforsymbols)
* [defx](/exchanges/defx.md#unwatchorderbookforsymbols)
* [kucoin](/exchanges/kucoin.md#unwatchorderbookforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#unwatchorderbookforsymbols)
* [okx](/exchanges/okx.md#unwatchorderbookforsymbols)

---

<a name="unWatchOrders" id="unwatchorders"></a>

## unWatchOrders
unWatches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#unwatchorders)
* [bitmart](/exchanges/bitmart.md#unwatchorders)
* [bybit](/exchanges/bybit.md#unwatchorders)
* [hyperliquid](/exchanges/hyperliquid.md#unwatchorders)

---

<a name="unWatchPositions" id="unwatchpositions"></a>

## unWatchPositions
unWatches from the stream channel

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols to watch positions for |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#unwatchpositions)
* [bitmart](/exchanges/bitmart.md#unwatchpositions)
* [bybit](/exchanges/bybit.md#unwatchpositions)

---

<a name="unWatchTicker" id="unwatchticker"></a>

## unWatchTicker
unWatches a price ticker

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchticker)
* [backpack](/exchanges/backpack.md#unwatchticker)
* [binance](/exchanges/binance.md#unwatchticker)
* [bingx](/exchanges/bingx.md#unwatchticker)
* [bitfinex](/exchanges/bitfinex.md#unwatchticker)
* [bitget](/exchanges/bitget.md#unwatchticker)
* [bitmart](/exchanges/bitmart.md#unwatchticker)
* [bybit](/exchanges/bybit.md#unwatchticker)
* [bydfi](/exchanges/bydfi.md#unwatchticker)
* [coincatch](/exchanges/coincatch.md#unwatchticker)
* [cryptocom](/exchanges/cryptocom.md#unwatchticker)
* [deepcoin](/exchanges/deepcoin.md#unwatchticker)
* [defx](/exchanges/defx.md#unwatchticker)
* [htx](/exchanges/htx.md#unwatchticker)
* [kucoin](/exchanges/kucoin.md#unwatchticker)
* [mexc](/exchanges/mexc.md#unwatchticker)
* [okx](/exchanges/okx.md#unwatchticker)
* [woo](/exchanges/woo.md#unwatchticker)

---

<a name="unWatchTickers" id="unwatchtickers"></a>

## unWatchTickers
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchtickers)
* [backpack](/exchanges/backpack.md#unwatchtickers)
* [binance](/exchanges/binance.md#unwatchtickers)
* [bitmart](/exchanges/bitmart.md#unwatchtickers)
* [bybit](/exchanges/bybit.md#unwatchtickers)
* [bydfi](/exchanges/bydfi.md#unwatchtickers)
* [cryptocom](/exchanges/cryptocom.md#unwatchtickers)
* [defx](/exchanges/defx.md#unwatchtickers)
* [hyperliquid](/exchanges/hyperliquid.md#unwatchtickers)
* [mexc](/exchanges/mexc.md#unwatchtickers)
* [okx](/exchanges/okx.md#unwatchtickers)
* [woo](/exchanges/woo.md#unwatchtickers)

---

<a name="unWatchTrades" id="unwatchtrades"></a>

## unWatchTrades
unsubscribe from the trades channel

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchtrades)
* [backpack](/exchanges/backpack.md#unwatchtrades)
* [binance](/exchanges/binance.md#unwatchtrades)
* [bingx](/exchanges/bingx.md#unwatchtrades)
* [bitfinex](/exchanges/bitfinex.md#unwatchtrades)
* [bitget](/exchanges/bitget.md#unwatchtrades)
* [bitmart](/exchanges/bitmart.md#unwatchtrades)
* [bybit](/exchanges/bybit.md#unwatchtrades)
* [coincatch](/exchanges/coincatch.md#unwatchtrades)
* [cryptocom](/exchanges/cryptocom.md#unwatchtrades)
* [deepcoin](/exchanges/deepcoin.md#unwatchtrades)
* [defx](/exchanges/defx.md#unwatchtrades)
* [derive](/exchanges/derive.md#unwatchtrades)
* [dydx](/exchanges/dydx.md#unwatchtrades)
* [gate](/exchanges/gate.md#unwatchtrades)
* [htx](/exchanges/htx.md#unwatchtrades)
* [hyperliquid](/exchanges/hyperliquid.md#unwatchtrades)
* [kucoin](/exchanges/kucoin.md#unwatchtrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#unwatchtrades)
* [mexc](/exchanges/mexc.md#unwatchtrades)
* [okx](/exchanges/okx.md#unwatchtrades)
* [woo](/exchanges/woo.md#unwatchtrades)

---

<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

## unWatchTradesForSymbols
unsubscribe from the trades channel

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#unwatchtradesforsymbols)
* [backpack](/exchanges/backpack.md#unwatchtradesforsymbols)
* [binance](/exchanges/binance.md#unwatchtradesforsymbols)
* [bitmart](/exchanges/bitmart.md#unwatchtradesforsymbols)
* [bybit](/exchanges/bybit.md#unwatchtradesforsymbols)
* [cryptocom](/exchanges/cryptocom.md#unwatchtradesforsymbols)
* [defx](/exchanges/defx.md#unwatchtradesforsymbols)
* [gate](/exchanges/gate.md#unwatchtradesforsymbols)
* [kucoin](/exchanges/kucoin.md#unwatchtradesforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#unwatchtradesforsymbols)
* [okx](/exchanges/okx.md#unwatchtradesforsymbols)

---

<a name="upgradeUnifiedTradeAccount" id="upgradeunifiedtradeaccount"></a>

## upgradeUnifiedTradeAccount
upgrades the account to unified trade account *warning* this is irreversible

**Kind**: instance   
**Returns**: <code>any</code> - nothing


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#upgradeunifiedtradeaccount)

---

<a name="verifyGiftCode" id="verifygiftcode"></a>

## verifyGiftCode
verify gift code

**Kind**: instance   
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | reference number id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#verifygiftcode)

---

<a name="watchBalance" id="watchbalance"></a>

## watchBalance
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>str</code> | No | spot or contract if not provided this.options['defaultType'] is used |

##### Supported exchanges
* [arkham](/exchanges/arkham.md#watchbalance)
* [ascendex](/exchanges/ascendex.md#watchbalance)
* [aster](/exchanges/aster.md#watchbalance)
* [binance](/exchanges/binance.md#watchbalance)
* [bingx](/exchanges/bingx.md#watchbalance)
* [bitfinex](/exchanges/bitfinex.md#watchbalance)
* [bitget](/exchanges/bitget.md#watchbalance)
* [bithumb](/exchanges/bithumb.md#watchbalance)
* [bitmart](/exchanges/bitmart.md#watchbalance)
* [bitmex](/exchanges/bitmex.md#watchbalance)
* [bitopro](/exchanges/bitopro.md#watchbalance)
* [bitrue](/exchanges/bitrue.md#watchbalance)
* [blockchaincom](/exchanges/blockchaincom.md#watchbalance)
* [blofin](/exchanges/blofin.md#watchbalance)
* [bullish](/exchanges/bullish.md#watchbalance)
* [bybit](/exchanges/bybit.md#watchbalance)
* [bydfi](/exchanges/bydfi.md#watchbalance)
* [cex](/exchanges/cex.md#watchbalance)
* [coincatch](/exchanges/coincatch.md#watchbalance)
* [coinex](/exchanges/coinex.md#watchbalance)
* [cryptocom](/exchanges/cryptocom.md#watchbalance)
* [defx](/exchanges/defx.md#watchbalance)
* [deribit](/exchanges/deribit.md#watchbalance)
* [exmo](/exchanges/exmo.md#watchbalance)
* [gate](/exchanges/gate.md#watchbalance)
* [hashkey](/exchanges/hashkey.md#watchbalance)
* [hollaex](/exchanges/hollaex.md#watchbalance)
* [htx](/exchanges/htx.md#watchbalance)
* [kucoin](/exchanges/kucoin.md#watchbalance)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchbalance)
* [lbank](/exchanges/lbank.md#watchbalance)
* [mexc](/exchanges/mexc.md#watchbalance)
* [modetrade](/exchanges/modetrade.md#watchbalance)
* [okx](/exchanges/okx.md#watchbalance)
* [onetrading](/exchanges/onetrading.md#watchbalance)
* [oxfun](/exchanges/oxfun.md#watchbalance)
* [phemex](/exchanges/phemex.md#watchbalance)
* [probit](/exchanges/probit.md#watchbalance)
* [toobit](/exchanges/toobit.md#watchbalance)
* [upbit](/exchanges/upbit.md#watchbalance)
* [whitebit](/exchanges/whitebit.md#watchbalance)
* [woo](/exchanges/woo.md#watchbalance)
* [woofipro](/exchanges/woofipro.md#watchbalance)

---

<a name="watchBidsAsks" id="watchbidsasks"></a>

## watchBidsAsks
watches best bid & ask for symbols

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [aster](/exchanges/aster.md#watchbidsasks)
* [backpack](/exchanges/backpack.md#watchbidsasks)
* [binance](/exchanges/binance.md#watchbidsasks)
* [bitget](/exchanges/bitget.md#watchbidsasks)
* [bitmart](/exchanges/bitmart.md#watchbidsasks)
* [bitvavo](/exchanges/bitvavo.md#watchbidsasks)
* [blofin](/exchanges/blofin.md#watchbidsasks)
* [bybit](/exchanges/bybit.md#watchbidsasks)
* [coinex](/exchanges/coinex.md#watchbidsasks)
* [cryptocom](/exchanges/cryptocom.md#watchbidsasks)
* [defx](/exchanges/defx.md#watchbidsasks)
* [deribit](/exchanges/deribit.md#watchbidsasks)
* [gate](/exchanges/gate.md#watchbidsasks)
* [gemini](/exchanges/gemini.md#watchbidsasks)
* [kucoin](/exchanges/kucoin.md#watchbidsasks)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchbidsasks)
* [mexc](/exchanges/mexc.md#watchbidsasks)
* [modetrade](/exchanges/modetrade.md#watchbidsasks)
* [okx](/exchanges/okx.md#watchbidsasks)
* [oxfun](/exchanges/oxfun.md#watchbidsasks)
* [woo](/exchanges/woo.md#watchbidsasks)
* [woofipro](/exchanges/woofipro.md#watchbidsasks)

---

<a name="watchFundingRate" id="watchfundingrate"></a>

## watchFundingRate
watch the current funding rate

**Kind**: instance   
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [okx](/exchanges/okx.md#watchfundingrate)

---

<a name="watchFundingRates" id="watchfundingrates"></a>

## watchFundingRates
watch the funding rate for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [funding rates structures](https://docs.ccxt.com/?id=funding-rates-structure), indexe by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbaseinternational](/exchanges/coinbaseinternational.md#watchfundingrates)

---

<a name="watchLiquidations" id="watchliquidations"></a>

## watchLiquidations
watch the public liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmex api endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#watchliquidations)
* [bitmex](/exchanges/bitmex.md#watchliquidations)
* [bybit](/exchanges/bybit.md#watchliquidations)

---

<a name="watchLiquidationsForSymbols" id="watchliquidationsforsymbols"></a>

## watchLiquidationsForSymbols
watch the public liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmex api endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#watchliquidationsforsymbols)
* [bitmex](/exchanges/bitmex.md#watchliquidationsforsymbols)
* [okx](/exchanges/okx.md#watchliquidationsforsymbols)

---

<a name="watchMarkPrice" id="watchmarkprice"></a>

## watchMarkPrice
watches a mark price for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |

##### Supported exchanges
* [aster](/exchanges/aster.md#watchmarkprice)
* [binance](/exchanges/binance.md#watchmarkprice)
* [okx](/exchanges/okx.md#watchmarkprice)

---

<a name="watchMarkPrices" id="watchmarkprices"></a>

## watchMarkPrices
watches the mark price for all markets

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.use1sFreq | <code>boolean</code> | No | *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds |

##### Supported exchanges
* [aster](/exchanges/aster.md#watchmarkprices)
* [binance](/exchanges/binance.md#watchmarkprices)
* [okx](/exchanges/okx.md#watchmarkprices)

---

<a name="watchMyLiquidations" id="watchmyliquidations"></a>

## watchMyLiquidations
watch the private liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmex api endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#watchmyliquidations)
* [gate](/exchanges/gate.md#watchmyliquidations)

---

<a name="watchMyLiquidationsForSymbols" id="watchmyliquidationsforsymbols"></a>

## watchMyLiquidationsForSymbols
watch the private liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmex api endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#watchmyliquidationsforsymbols)
* [gate](/exchanges/gate.md#watchmyliquidationsforsymbols)
* [okx](/exchanges/okx.md#watchmyliquidationsforsymbols)

---

<a name="watchMyTrades" id="watchmytrades"></a>

## watchMyTrades
watches information on multiple trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#watchmytrades)
* [apex](/exchanges/apex.md#watchmytrades)
* [aster](/exchanges/aster.md#watchmytrades)
* [binance](/exchanges/binance.md#watchmytrades)
* [bingx](/exchanges/bingx.md#watchmytrades)
* [bitfinex](/exchanges/bitfinex.md#watchmytrades)
* [bitget](/exchanges/bitget.md#watchmytrades)
* [bitmex](/exchanges/bitmex.md#watchmytrades)
* [bitopro](/exchanges/bitopro.md#watchmytrades)
* [bitvavo](/exchanges/bitvavo.md#watchmytrades)
* [bullish](/exchanges/bullish.md#watchmytrades)
* [bybit](/exchanges/bybit.md#watchmytrades)
* [cex](/exchanges/cex.md#watchmytrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchmytrades)
* [coinex](/exchanges/coinex.md#watchmytrades)
* [cryptocom](/exchanges/cryptocom.md#watchmytrades)
* [deepcoin](/exchanges/deepcoin.md#watchmytrades)
* [deribit](/exchanges/deribit.md#watchmytrades)
* [derive](/exchanges/derive.md#watchmytrades)
* [exmo](/exchanges/exmo.md#watchmytrades)
* [gate](/exchanges/gate.md#watchmytrades)
* [hashkey](/exchanges/hashkey.md#watchmytrades)
* [hollaex](/exchanges/hollaex.md#watchmytrades)
* [htx](/exchanges/htx.md#watchmytrades)
* [hyperliquid](/exchanges/hyperliquid.md#watchmytrades)
* [kucoin](/exchanges/kucoin.md#watchmytrades)
* [mexc](/exchanges/mexc.md#watchmytrades)
* [modetrade](/exchanges/modetrade.md#watchmytrades)
* [okx](/exchanges/okx.md#watchmytrades)
* [onetrading](/exchanges/onetrading.md#watchmytrades)
* [phemex](/exchanges/phemex.md#watchmytrades)
* [probit](/exchanges/probit.md#watchmytrades)
* [toobit](/exchanges/toobit.md#watchmytrades)
* [upbit](/exchanges/upbit.md#watchmytrades)
* [whitebit](/exchanges/whitebit.md#watchmytrades)
* [woo](/exchanges/woo.md#watchmytrades)
* [woofipro](/exchanges/woofipro.md#watchmytrades)

---

<a name="watchMyTradesForSymbols" id="watchmytradesforsymbols"></a>

## watchMyTradesForSymbols
watches information on multiple trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchmytradesforsymbols)

---

<a name="watchOHLCV" id="watchohlcv"></a>

## watchOHLCV
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#watchohlcv)
* [apex](/exchanges/apex.md#watchohlcv)
* [arkham](/exchanges/arkham.md#watchohlcv)
* [ascendex](/exchanges/ascendex.md#watchohlcv)
* [aster](/exchanges/aster.md#watchohlcv)
* [backpack](/exchanges/backpack.md#watchohlcv)
* [binance](/exchanges/binance.md#watchohlcv)
* [bingx](/exchanges/bingx.md#watchohlcv)
* [bitfinex](/exchanges/bitfinex.md#watchohlcv)
* [bitget](/exchanges/bitget.md#watchohlcv)
* [bitmart](/exchanges/bitmart.md#watchohlcv)
* [bitmex](/exchanges/bitmex.md#watchohlcv)
* [bittrade](/exchanges/bittrade.md#watchohlcv)
* [bitvavo](/exchanges/bitvavo.md#watchohlcv)
* [blockchaincom](/exchanges/blockchaincom.md#watchohlcv)
* [blofin](/exchanges/blofin.md#watchohlcv)
* [bybit](/exchanges/bybit.md#watchohlcv)
* [bydfi](/exchanges/bydfi.md#watchohlcv)
* [cex](/exchanges/cex.md#watchohlcv)
* [coincatch](/exchanges/coincatch.md#watchohlcv)
* [cryptocom](/exchanges/cryptocom.md#watchohlcv)
* [deepcoin](/exchanges/deepcoin.md#watchohlcv)
* [defx](/exchanges/defx.md#watchohlcv)
* [deribit](/exchanges/deribit.md#watchohlcv)
* [dydx](/exchanges/dydx.md#watchohlcv)
* [gate](/exchanges/gate.md#watchohlcv)
* [gemini](/exchanges/gemini.md#watchohlcv)
* [hashkey](/exchanges/hashkey.md#watchohlcv)
* [htx](/exchanges/htx.md#watchohlcv)
* [hyperliquid](/exchanges/hyperliquid.md#watchohlcv)
* [kucoin](/exchanges/kucoin.md#watchohlcv)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchohlcv)
* [lbank](/exchanges/lbank.md#watchohlcv)
* [mexc](/exchanges/mexc.md#watchohlcv)
* [modetrade](/exchanges/modetrade.md#watchohlcv)
* [ndax](/exchanges/ndax.md#watchohlcv)
* [okx](/exchanges/okx.md#watchohlcv)
* [onetrading](/exchanges/onetrading.md#watchohlcv)
* [oxfun](/exchanges/oxfun.md#watchohlcv)
* [phemex](/exchanges/phemex.md#watchohlcv)
* [toobit](/exchanges/toobit.md#watchohlcv)
* [upbit](/exchanges/upbit.md#watchohlcv)
* [whitebit](/exchanges/whitebit.md#watchohlcv)
* [woo](/exchanges/woo.md#watchohlcv)
* [woofipro](/exchanges/woofipro.md#watchohlcv)

---

<a name="watchOHLCVForSymbols" id="watchohlcvforsymbols"></a>

## watchOHLCVForSymbols
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>object</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbolsAndTimeframes | <code>Array&lt;Array&lt;string&gt;&gt;</code> | Yes | array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']] |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#watchohlcvforsymbols)
* [aster](/exchanges/aster.md#watchohlcvforsymbols)
* [backpack](/exchanges/backpack.md#watchohlcvforsymbols)
* [binance](/exchanges/binance.md#watchohlcvforsymbols)
* [blofin](/exchanges/blofin.md#watchohlcvforsymbols)
* [bybit](/exchanges/bybit.md#watchohlcvforsymbols)
* [bydfi](/exchanges/bydfi.md#watchohlcvforsymbols)
* [defx](/exchanges/defx.md#watchohlcvforsymbols)
* [deribit](/exchanges/deribit.md#watchohlcvforsymbols)
* [okx](/exchanges/okx.md#watchohlcvforsymbols)
* [oxfun](/exchanges/oxfun.md#watchohlcvforsymbols)
* [toobit](/exchanges/toobit.md#watchohlcvforsymbols)

---

<a name="watchOrderBook" id="watchorderbook"></a>

## watchOrderBook
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#watchorderbook)
* [apex](/exchanges/apex.md#watchorderbook)
* [arkham](/exchanges/arkham.md#watchorderbook)
* [ascendex](/exchanges/ascendex.md#watchorderbook)
* [aster](/exchanges/aster.md#watchorderbook)
* [backpack](/exchanges/backpack.md#watchorderbook)
* [binance](/exchanges/binance.md#watchorderbook)
* [bingx](/exchanges/bingx.md#watchorderbook)
* [bitfinex](/exchanges/bitfinex.md#watchorderbook)
* [bitget](/exchanges/bitget.md#watchorderbook)
* [bithumb](/exchanges/bithumb.md#watchorderbook)
* [bitmart](/exchanges/bitmart.md#watchorderbook)
* [bitmex](/exchanges/bitmex.md#watchorderbook)
* [bitopro](/exchanges/bitopro.md#watchorderbook)
* [bitstamp](/exchanges/bitstamp.md#watchorderbook)
* [bittrade](/exchanges/bittrade.md#watchorderbook)
* [bitvavo](/exchanges/bitvavo.md#watchorderbook)
* [blockchaincom](/exchanges/blockchaincom.md#watchorderbook)
* [blofin](/exchanges/blofin.md#watchorderbook)
* [bullish](/exchanges/bullish.md#watchorderbook)
* [bybit](/exchanges/bybit.md#watchorderbook)
* [bydfi](/exchanges/bydfi.md#watchorderbook)
* [cex](/exchanges/cex.md#watchorderbook)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchorderbook)
* [coincatch](/exchanges/coincatch.md#watchorderbook)
* [coincheck](/exchanges/coincheck.md#watchorderbook)
* [coinex](/exchanges/coinex.md#watchorderbook)
* [coinone](/exchanges/coinone.md#watchorderbook)
* [cryptocom](/exchanges/cryptocom.md#watchorderbook)
* [deepcoin](/exchanges/deepcoin.md#watchorderbook)
* [defx](/exchanges/defx.md#watchorderbook)
* [deribit](/exchanges/deribit.md#watchorderbook)
* [derive](/exchanges/derive.md#watchorderbook)
* [dydx](/exchanges/dydx.md#watchorderbook)
* [exmo](/exchanges/exmo.md#watchorderbook)
* [gate](/exchanges/gate.md#watchorderbook)
* [gemini](/exchanges/gemini.md#watchorderbook)
* [hashkey](/exchanges/hashkey.md#watchorderbook)
* [hollaex](/exchanges/hollaex.md#watchorderbook)
* [htx](/exchanges/htx.md#watchorderbook)
* [hyperliquid](/exchanges/hyperliquid.md#watchorderbook)
* [independentreserve](/exchanges/independentreserve.md#watchorderbook)
* [kucoin](/exchanges/kucoin.md#watchorderbook)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchorderbook)
* [lbank](/exchanges/lbank.md#watchorderbook)
* [luno](/exchanges/luno.md#watchorderbook)
* [mexc](/exchanges/mexc.md#watchorderbook)
* [modetrade](/exchanges/modetrade.md#watchorderbook)
* [ndax](/exchanges/ndax.md#watchorderbook)
* [okx](/exchanges/okx.md#watchorderbook)
* [onetrading](/exchanges/onetrading.md#watchorderbook)
* [oxfun](/exchanges/oxfun.md#watchorderbook)
* [phemex](/exchanges/phemex.md#watchorderbook)
* [probit](/exchanges/probit.md#watchorderbook)
* [toobit](/exchanges/toobit.md#watchorderbook)
* [upbit](/exchanges/upbit.md#watchorderbook)
* [whitebit](/exchanges/whitebit.md#watchorderbook)
* [woo](/exchanges/woo.md#watchorderbook)
* [woofipro](/exchanges/woofipro.md#watchorderbook)

---

<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

## watchOrderBookForSymbols
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#watchorderbookforsymbols)
* [aster](/exchanges/aster.md#watchorderbookforsymbols)
* [backpack](/exchanges/backpack.md#watchorderbookforsymbols)
* [binance](/exchanges/binance.md#watchorderbookforsymbols)
* [bitget](/exchanges/bitget.md#watchorderbookforsymbols)
* [bitmart](/exchanges/bitmart.md#watchorderbookforsymbols)
* [bitmex](/exchanges/bitmex.md#watchorderbookforsymbols)
* [blofin](/exchanges/blofin.md#watchorderbookforsymbols)
* [bybit](/exchanges/bybit.md#watchorderbookforsymbols)
* [bydfi](/exchanges/bydfi.md#watchorderbookforsymbols)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchorderbookforsymbols)
* [coincatch](/exchanges/coincatch.md#watchorderbookforsymbols)
* [coinex](/exchanges/coinex.md#watchorderbookforsymbols)
* [cryptocom](/exchanges/cryptocom.md#watchorderbookforsymbols)
* [defx](/exchanges/defx.md#watchorderbookforsymbols)
* [deribit](/exchanges/deribit.md#watchorderbookforsymbols)
* [gemini](/exchanges/gemini.md#watchorderbookforsymbols)
* [kucoin](/exchanges/kucoin.md#watchorderbookforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchorderbookforsymbols)
* [okx](/exchanges/okx.md#watchorderbookforsymbols)
* [oxfun](/exchanges/oxfun.md#watchorderbookforsymbols)
* [toobit](/exchanges/toobit.md#watchorderbookforsymbols)

---

<a name="watchOrders" id="watchorders"></a>

## watchOrders
watches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#watchorders)
* [apex](/exchanges/apex.md#watchorders)
* [arkham](/exchanges/arkham.md#watchorders)
* [ascendex](/exchanges/ascendex.md#watchorders)
* [aster](/exchanges/aster.md#watchorders)
* [backpack](/exchanges/backpack.md#watchorders)
* [binance](/exchanges/binance.md#watchorders)
* [bingx](/exchanges/bingx.md#watchorders)
* [bitfinex](/exchanges/bitfinex.md#watchorders)
* [bitget](/exchanges/bitget.md#watchorders)
* [bithumb](/exchanges/bithumb.md#watchorders)
* [bitmart](/exchanges/bitmart.md#watchorders)
* [bitmex](/exchanges/bitmex.md#watchorders)
* [bitrue](/exchanges/bitrue.md#watchorders)
* [bitstamp](/exchanges/bitstamp.md#watchorders)
* [bitvavo](/exchanges/bitvavo.md#watchorders)
* [biofin](/exchanges/biofin.md#watchorders)
* [bullish](/exchanges/bullish.md#watchorders)
* [bybit](/exchanges/bybit.md#watchorders)
* [bydfi](/exchanges/bydfi.md#watchorders)
* [cex](/exchanges/cex.md#watchorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchorders)
* [coincatch](/exchanges/coincatch.md#watchorders)
* [coinex](/exchanges/coinex.md#watchorders)
* [cryptocom](/exchanges/cryptocom.md#watchorders)
* [deepcoin](/exchanges/deepcoin.md#watchorders)
* [defx](/exchanges/defx.md#watchorders)
* [deribit](/exchanges/deribit.md#watchorders)
* [derive](/exchanges/derive.md#watchorders)
* [exmo](/exchanges/exmo.md#watchorders)
* [gate](/exchanges/gate.md#watchorders)
* [hashkey](/exchanges/hashkey.md#watchorders)
* [hollaex](/exchanges/hollaex.md#watchorders)
* [htx](/exchanges/htx.md#watchorders)
* [hyperliquid](/exchanges/hyperliquid.md#watchorders)
* [kucoin](/exchanges/kucoin.md#watchorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchorders)
* [lbank](/exchanges/lbank.md#watchorders)
* [mexc](/exchanges/mexc.md#watchorders)
* [modetrade](/exchanges/modetrade.md#watchorders)
* [okx](/exchanges/okx.md#watchorders)
* [onetrading](/exchanges/onetrading.md#watchorders)
* [oxfun](/exchanges/oxfun.md#watchorders)
* [phemex](/exchanges/phemex.md#watchorders)
* [probit](/exchanges/probit.md#watchorders)
* [toobit](/exchanges/toobit.md#watchorders)
* [upbit](/exchanges/upbit.md#watchorders)
* [whitebit](/exchanges/whitebit.md#watchorders)
* [woo](/exchanges/woo.md#watchorders)
* [woofipro](/exchanges/woofipro.md#watchorders)

---

<a name="watchOrdersForSymbols" id="watchordersforsymbols"></a>

## watchOrdersForSymbols
watches information on multiple orders made by the user across multiple symbols

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.trigger | <code>boolean</code> | No | set to true for trigger orders |

##### Supported exchanges
* [blofin](/exchanges/blofin.md#watchordersforsymbols)
* [bydfi](/exchanges/bydfi.md#watchordersforsymbols)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchordersforsymbols)

---

<a name="watchPosition" id="watchposition"></a>

## watchPosition
watch open positions for a specific symbol

**Kind**: instance   
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code>, <code>undefined</code> | unified market symbol |
| params | <code>object</code> | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [kucoinfutures](/exchanges/kucoinfutures.md#watchposition)

---

<a name="watchPositions" id="watchpositions"></a>

## watchPositions
watch all open positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/en/latest/manual.html#position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum number of positions to retrieve |
| params | <code>object</code> | Yes | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#watchpositions)
* [arkham](/exchanges/arkham.md#watchpositions)
* [aster](/exchanges/aster.md#watchpositions)
* [backpack](/exchanges/backpack.md#watchpositions)
* [binance](/exchanges/binance.md#watchpositions)
* [bitget](/exchanges/bitget.md#watchpositions)
* [bitmart](/exchanges/bitmart.md#watchpositions)
* [bitmex](/exchanges/bitmex.md#watchpositions)
* [blofin](/exchanges/blofin.md#watchpositions)
* [bullish](/exchanges/bullish.md#watchpositions)
* [bybit](/exchanges/bybit.md#watchpositions)
* [bydfi](/exchanges/bydfi.md#watchpositions)
* [coincatch](/exchanges/coincatch.md#watchpositions)
* [cryptocom](/exchanges/cryptocom.md#watchpositions)
* [deepcoin](/exchanges/deepcoin.md#watchpositions)
* [defx](/exchanges/defx.md#watchpositions)
* [gate](/exchanges/gate.md#watchpositions)
* [hashkey](/exchanges/hashkey.md#watchpositions)
* [htx](/exchanges/htx.md#watchpositions)
* [modetrade](/exchanges/modetrade.md#watchpositions)
* [okx](/exchanges/okx.md#watchpositions)
* [oxfun](/exchanges/oxfun.md#watchpositions)
* [toobit](/exchanges/toobit.md#watchpositions)
* [woo](/exchanges/woo.md#watchpositions)
* [woofipro](/exchanges/woofipro.md#watchpositions)

---

<a name="watchTicker" id="watchticker"></a>

## watchTicker
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#watchticker)
* [apex](/exchanges/apex.md#watchticker)
* [arkham](/exchanges/arkham.md#watchticker)
* [aster](/exchanges/aster.md#watchticker)
* [backpack](/exchanges/backpack.md#watchticker)
* [binance](/exchanges/binance.md#watchticker)
* [bingx](/exchanges/bingx.md#watchticker)
* [bitfinex](/exchanges/bitfinex.md#watchticker)
* [bitget](/exchanges/bitget.md#watchticker)
* [bithumb](/exchanges/bithumb.md#watchticker)
* [bitmart](/exchanges/bitmart.md#watchticker)
* [bitmex](/exchanges/bitmex.md#watchticker)
* [bitopro](/exchanges/bitopro.md#watchticker)
* [bittrade](/exchanges/bittrade.md#watchticker)
* [bitvavo](/exchanges/bitvavo.md#watchticker)
* [blockchaincom](/exchanges/blockchaincom.md#watchticker)
* [blofin](/exchanges/blofin.md#watchticker)
* [bullish](/exchanges/bullish.md#watchticker)
* [bybit](/exchanges/bybit.md#watchticker)
* [bydfi](/exchanges/bydfi.md#watchticker)
* [cex](/exchanges/cex.md#watchticker)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchticker)
* [coincatch](/exchanges/coincatch.md#watchticker)
* [coinex](/exchanges/coinex.md#watchticker)
* [coinone](/exchanges/coinone.md#watchticker)
* [cryptocom](/exchanges/cryptocom.md#watchticker)
* [deepcoin](/exchanges/deepcoin.md#watchticker)
* [defx](/exchanges/defx.md#watchticker)
* [deribit](/exchanges/deribit.md#watchticker)
* [derive](/exchanges/derive.md#watchticker)
* [exmo](/exchanges/exmo.md#watchticker)
* [gate](/exchanges/gate.md#watchticker)
* [hahskey](/exchanges/hahskey.md#watchticker)
* [htx](/exchanges/htx.md#watchticker)
* [hyperliquid](/exchanges/hyperliquid.md#watchticker)
* [kucoin](/exchanges/kucoin.md#watchticker)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchticker)
* [lbank](/exchanges/lbank.md#watchticker)
* [mexc](/exchanges/mexc.md#watchticker)
* [modetrade](/exchanges/modetrade.md#watchticker)
* [ndax](/exchanges/ndax.md#watchticker)
* [okx](/exchanges/okx.md#watchticker)
* [onetrading](/exchanges/onetrading.md#watchticker)
* [oxfun](/exchanges/oxfun.md#watchticker)
* [phemex](/exchanges/phemex.md#watchticker)
* [probit](/exchanges/probit.md#watchticker)
* [toobit](/exchanges/toobit.md#watchticker)
* [upbit](/exchanges/upbit.md#watchticker)
* [whitebit](/exchanges/whitebit.md#watchticker)
* [woo](/exchanges/woo.md#watchticker)
* [woofipro](/exchanges/woofipro.md#watchticker)

---

<a name="watchTickers" id="watchtickers"></a>

## watchTickers
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#watchtickers)
* [aster](/exchanges/aster.md#watchtickers)
* [backpack](/exchanges/backpack.md#watchtickers)
* [binance](/exchanges/binance.md#watchtickers)
* [bitget](/exchanges/bitget.md#watchtickers)
* [bithumb](/exchanges/bithumb.md#watchtickers)
* [bitmart](/exchanges/bitmart.md#watchtickers)
* [bitmex](/exchanges/bitmex.md#watchtickers)
* [bitvavo](/exchanges/bitvavo.md#watchtickers)
* [blofin](/exchanges/blofin.md#watchtickers)
* [bybit](/exchanges/bybit.md#watchtickers)
* [bydfi](/exchanges/bydfi.md#watchtickers)
* [cex](/exchanges/cex.md#watchtickers)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchtickers)
* [coincatch](/exchanges/coincatch.md#watchtickers)
* [coinex](/exchanges/coinex.md#watchtickers)
* [cryptocom](/exchanges/cryptocom.md#watchtickers)
* [defx](/exchanges/defx.md#watchtickers)
* [deribit](/exchanges/deribit.md#watchtickers)
* [exmo](/exchanges/exmo.md#watchtickers)
* [gate](/exchanges/gate.md#watchtickers)
* [hyperliquid](/exchanges/hyperliquid.md#watchtickers)
* [kucoin](/exchanges/kucoin.md#watchtickers)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchtickers)
* [mexc](/exchanges/mexc.md#watchtickers)
* [modetrade](/exchanges/modetrade.md#watchtickers)
* [okx](/exchanges/okx.md#watchtickers)
* [onetrading](/exchanges/onetrading.md#watchtickers)
* [oxfun](/exchanges/oxfun.md#watchtickers)
* [phemex](/exchanges/phemex.md#watchtickers)
* [toobit](/exchanges/toobit.md#watchtickers)
* [upbit](/exchanges/upbit.md#watchtickers)
* [whitebit](/exchanges/whitebit.md#watchtickers)
* [woo](/exchanges/woo.md#watchtickers)
* [woofipro](/exchanges/woofipro.md#watchtickers)

---

<a name="watchTrades" id="watchtrades"></a>

## watchTrades
watches information on multiple trades made in a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#watchtrades)
* [apex](/exchanges/apex.md#watchtrades)
* [arkham](/exchanges/arkham.md#watchtrades)
* [ascendex](/exchanges/ascendex.md#watchtrades)
* [aster](/exchanges/aster.md#watchtrades)
* [backpack](/exchanges/backpack.md#watchtrades)
* [binance](/exchanges/binance.md#watchtrades)
* [bingx](/exchanges/bingx.md#watchtrades)
* [bitfinex](/exchanges/bitfinex.md#watchtrades)
* [bitget](/exchanges/bitget.md#watchtrades)
* [bithumb](/exchanges/bithumb.md#watchtrades)
* [bitmart](/exchanges/bitmart.md#watchtrades)
* [bitmex](/exchanges/bitmex.md#watchtrades)
* [bitopro](/exchanges/bitopro.md#watchtrades)
* [bitstamp](/exchanges/bitstamp.md#watchtrades)
* [bittrade](/exchanges/bittrade.md#watchtrades)
* [bitvavo](/exchanges/bitvavo.md#watchtrades)
* [blockchaincom](/exchanges/blockchaincom.md#watchtrades)
* [blofin](/exchanges/blofin.md#watchtrades)
* [bullish](/exchanges/bullish.md#watchtrades)
* [bybit](/exchanges/bybit.md#watchtrades)
* [cex](/exchanges/cex.md#watchtrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#watchtrades)
* [coincatch](/exchanges/coincatch.md#watchtrades)
* [coincheck](/exchanges/coincheck.md#watchtrades)
* [coinex](/exchanges/coinex.md#watchtrades)
* [coinone](/exchanges/coinone.md#watchtrades)
* [cryptocom](/exchanges/cryptocom.md#watchtrades)
* [deepcoin](/exchanges/deepcoin.md#watchtrades)
* [defx](/exchanges/defx.md#watchtrades)
* [deribit](/exchanges/deribit.md#watchtrades)
* [derive](/exchanges/derive.md#watchtrades)
* [dydx](/exchanges/dydx.md#watchtrades)
* [exmo](/exchanges/exmo.md#watchtrades)
* [gate](/exchanges/gate.md#watchtrades)
* [gemini](/exchanges/gemini.md#watchtrades)
* [hashkey](/exchanges/hashkey.md#watchtrades)
* [hollaex](/exchanges/hollaex.md#watchtrades)
* [htx](/exchanges/htx.md#watchtrades)
* [hyperliquid](/exchanges/hyperliquid.md#watchtrades)
* [independentreserve](/exchanges/independentreserve.md#watchtrades)
* [kucoin](/exchanges/kucoin.md#watchtrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchtrades)
* [lbank](/exchanges/lbank.md#watchtrades)
* [luno](/exchanges/luno.md#watchtrades)
* [mexc](/exchanges/mexc.md#watchtrades)
* [modetrade](/exchanges/modetrade.md#watchtrades)
* [ndax](/exchanges/ndax.md#watchtrades)
* [okx](/exchanges/okx.md#watchtrades)
* [oxfun](/exchanges/oxfun.md#watchtrades)
* [phemex](/exchanges/phemex.md#watchtrades)
* [probit](/exchanges/probit.md#watchtrades)
* [toobit](/exchanges/toobit.md#watchtrades)
* [upbit](/exchanges/upbit.md#watchtrades)
* [whitebit](/exchanges/whitebit.md#watchtrades)
* [woo](/exchanges/woo.md#watchtrades)
* [woofipro](/exchanges/woofipro.md#watchtrades)

---

<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

## watchTradesForSymbols
get the list of most recent trades for a list of symbols

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#watchtradesforsymbols)
* [ascendex](/exchanges/ascendex.md#watchtradesforsymbols)
* [aster](/exchanges/aster.md#watchtradesforsymbols)
* [backpack](/exchanges/backpack.md#watchtradesforsymbols)
* [binance](/exchanges/binance.md#watchtradesforsymbols)
* [bitget](/exchanges/bitget.md#watchtradesforsymbols)
* [bitmart](/exchanges/bitmart.md#watchtradesforsymbols)
* [bitmex](/exchanges/bitmex.md#watchtradesforsymbols)
* [blofin](/exchanges/blofin.md#watchtradesforsymbols)
* [bybit](/exchanges/bybit.md#watchtradesforsymbols)
* [coinbase](/exchanges/coinbase.md#watchtradesforsymbols)
* [coincatch](/exchanges/coincatch.md#watchtradesforsymbols)
* [coinex](/exchanges/coinex.md#watchtradesforsymbols)
* [cryptocom](/exchanges/cryptocom.md#watchtradesforsymbols)
* [defx](/exchanges/defx.md#watchtradesforsymbols)
* [deribit](/exchanges/deribit.md#watchtradesforsymbols)
* [gate](/exchanges/gate.md#watchtradesforsymbols)
* [gemini](/exchanges/gemini.md#watchtradesforsymbols)
* [kucoin](/exchanges/kucoin.md#watchtradesforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#watchtradesforsymbols)
* [okx](/exchanges/okx.md#watchtradesforsymbols)
* [oxfun](/exchanges/oxfun.md#watchtradesforsymbols)
* [toobit](/exchanges/toobit.md#watchtradesforsymbols)
* [upbit](/exchanges/upbit.md#watchtradesforsymbols)

---

<a name="withdraw" id="withdraw"></a>

## withdraw
make a withdrawal

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes | a memo for the transaction |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#withdraw)
* [arkkm](/exchanges/arkkm.md#withdraw)
* [aster](/exchanges/aster.md#withdraw)
* [backpack](/exchanges/backpack.md#withdraw)
* [bigone](/exchanges/bigone.md#withdraw)
* [binance](/exchanges/binance.md#withdraw)
* [bingx](/exchanges/bingx.md#withdraw)
* [bitbank](/exchanges/bitbank.md#withdraw)
* [bitfinex](/exchanges/bitfinex.md#withdraw)
* [bitflyer](/exchanges/bitflyer.md#withdraw)
* [bitget](/exchanges/bitget.md#withdraw)
* [bithumb](/exchanges/bithumb.md#withdraw)
* [bitmart](/exchanges/bitmart.md#withdraw)
* [bitmex](/exchanges/bitmex.md#withdraw)
* [bitopro](/exchanges/bitopro.md#withdraw)
* [bitrue](/exchanges/bitrue.md#withdraw)
* [bitso](/exchanges/bitso.md#withdraw)
* [bitstamp](/exchanges/bitstamp.md#withdraw)
* [bittrade](/exchanges/bittrade.md#withdraw)
* [bitvavo](/exchanges/bitvavo.md#withdraw)
* [blockchaincom](/exchanges/blockchaincom.md#withdraw)
* [btcmarkets](/exchanges/btcmarkets.md#withdraw)
* [bullish](/exchanges/bullish.md#withdraw)
* [bybit](/exchanges/bybit.md#withdraw)
* [coinbase](/exchanges/coinbase.md#withdraw)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#withdraw)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#withdraw)
* [coincatch](/exchanges/coincatch.md#withdraw)
* [coinex](/exchanges/coinex.md#withdraw)
* [coinmate](/exchanges/coinmate.md#withdraw)
* [coinsph](/exchanges/coinsph.md#withdraw)
* [cryptocom](/exchanges/cryptocom.md#withdraw)
* [defx](/exchanges/defx.md#withdraw)
* [deribit](/exchanges/deribit.md#withdraw)
* [digifinex](/exchanges/digifinex.md#withdraw)
* [dydx](/exchanges/dydx.md#withdraw)
* [exmo](/exchanges/exmo.md#withdraw)
* [foxbit](/exchanges/foxbit.md#withdraw)
* [gate](/exchanges/gate.md#withdraw)
* [gemini](/exchanges/gemini.md#withdraw)
* [hashkey](/exchanges/hashkey.md#withdraw)
* [hibachi](/exchanges/hibachi.md#withdraw)
* [hitbtc](/exchanges/hitbtc.md#withdraw)
* [hollaex](/exchanges/hollaex.md#withdraw)
* [htx](/exchanges/htx.md#withdraw)
* [hyperliquid](/exchanges/hyperliquid.md#withdraw)
* [independentreserve](/exchanges/independentreserve.md#withdraw)
* [indodax](/exchanges/indodax.md#withdraw)
* [kraken](/exchanges/kraken.md#withdraw)
* [kucoin](/exchanges/kucoin.md#withdraw)
* [lbank](/exchanges/lbank.md#withdraw)
* [mercado](/exchanges/mercado.md#withdraw)
* [mexc](/exchanges/mexc.md#withdraw)
* [modetrade](/exchanges/modetrade.md#withdraw)
* [ndax](/exchanges/ndax.md#withdraw)
* [novadax](/exchanges/novadax.md#withdraw)
* [okx](/exchanges/okx.md#withdraw)
* [oxfun](/exchanges/oxfun.md#withdraw)
* [phemex](/exchanges/phemex.md#withdraw)
* [poloniex](/exchanges/poloniex.md#withdraw)
* [probit](/exchanges/probit.md#withdraw)
* [tokocrypto](/exchanges/tokocrypto.md#withdraw)
* [toobit](/exchanges/toobit.md#withdraw)
* [upbit](/exchanges/upbit.md#withdraw)
* [wavesexchange](/exchanges/wavesexchange.md#withdraw)
* [whitebit](/exchanges/whitebit.md#withdraw)
* [woo](/exchanges/woo.md#withdraw)
* [woofipro](/exchanges/woofipro.md#withdraw)
* [xt](/exchanges/xt.md#withdraw)
* [yobit](/exchanges/yobit.md#withdraw)
* [zaif](/exchanges/zaif.md#withdraw)
* [zonda](/exchanges/zonda.md#withdraw)

---

<a name="withdrawWs" id="withdrawws"></a>

## withdrawWs
make a withdrawal

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#withdrawws)
