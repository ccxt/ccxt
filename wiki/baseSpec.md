
<a name="addMargin" id="addmargin"></a>

## addMargin
add margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | amount of margin to add |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexaddmargin)
* [binance](/exchanges/binance.md#binanceaddmargin)
* [bitget](/exchanges/bitget.md#bitgetaddmargin)
* [coincatch](/exchanges/coincatch.md#coincatchaddmargin)
* [coinex](/exchanges/coinex.md#coinexaddmargin)
* [delta](/exchanges/delta.md#deltaaddmargin)
* [digifinex](/exchanges/digifinex.md#digifinexaddmargin)
* [exmo](/exchanges/exmo.md#exmoaddmargin)
* [gate](/exchanges/gate.md#gateaddmargin)
* [hitbtc](/exchanges/hitbtc.md#hitbtcaddmargin)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidaddmargin)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesaddmargin)
* [mexc](/exchanges/mexc.md#mexcaddmargin)
* [okx](/exchanges/okx.md#okxaddmargin)
* [poloniex](/exchanges/poloniex.md#poloniexaddmargin)
* [woo](/exchanges/woo.md#wooaddmargin)
* [xt](/exchanges/xt.md#xtaddmargin)

---

<a name="borrowCrossMargin" id="borrowcrossmargin"></a>

## borrowCrossMargin
create a loan to borrow margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to borrow margin in a portfolio margin account |

##### Supported exchanges
* [binance](/exchanges/binance.md#binanceborrowcrossmargin)
* [bitget](/exchanges/bitget.md#bitgetborrowcrossmargin)
* [bybit](/exchanges/bybit.md#bybitborrowcrossmargin)
* [coinmetro](/exchanges/coinmetro.md#coinmetroborrowcrossmargin)
* [htx](/exchanges/htx.md#htxborrowcrossmargin)
* [kucoin](/exchanges/kucoin.md#kucoinborrowcrossmargin)
* [okx](/exchanges/okx.md#okxborrowcrossmargin)

---

<a name="borrowIsolatedMargin" id="borrowisolatedmargin"></a>

## borrowIsolatedMargin
create a loan to borrow margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binanceborrowisolatedmargin)
* [bitget](/exchanges/bitget.md#bitgetborrowisolatedmargin)
* [bitmart](/exchanges/bitmart.md#bitmartborrowisolatedmargin)
* [coinex](/exchanges/coinex.md#coinexborrowisolatedmargin)
* [gate](/exchanges/gate.md#gateborrowisolatedmargin)
* [htx](/exchanges/htx.md#htxborrowisolatedmargin)
* [kucoin](/exchanges/kucoin.md#kucoinborrowisolatedmargin)

---

<a name="borrowMargin" id="borrowmargin"></a>

## borrowMargin
create a loan to borrow margin

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to borrow |
| amount | <code>float</code> | Yes | the amount to borrow |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.rate | <code>string</code> | No | '0.0002' or '0.002' extra parameter required for isolated margin |
| params.unifiedAccount | <code>boolean</code> | No | set to true for borrowing in the unified account |

##### Supported exchanges
* [gate](/exchanges/gate.md#gateborrowmargin)

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
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcalculatepriceprecision)

---

<a name="cancelAllOrders" id="cancelallorders"></a>

## cancelAllOrders
cancel all open orders in a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacacancelallorders)
* [apex](/exchanges/apex.md#apexcancelallorders)
* [ascendex](/exchanges/ascendex.md#ascendexcancelallorders)
* [backpack](/exchanges/backpack.md#backpackcancelallorders)
* [bigone](/exchanges/bigone.md#bigonecancelallorders)
* [binance](/exchanges/binance.md#binancecancelallorders)
* [bingx](/exchanges/bingx.md#bingxcancelallorders)
* [bitfinex](/exchanges/bitfinex.md#bitfinexcancelallorders)
* [bitget](/exchanges/bitget.md#bitgetcancelallorders)
* [bitmart](/exchanges/bitmart.md#bitmartcancelallorders)
* [bitmex](/exchanges/bitmex.md#bitmexcancelallorders)
* [bitopro](/exchanges/bitopro.md#bitoprocancelallorders)
* [bitrue](/exchanges/bitrue.md#bitruecancelallorders)
* [bitso](/exchanges/bitso.md#bitsocancelallorders)
* [bitstamp](/exchanges/bitstamp.md#bitstampcancelallorders)
* [bitteam](/exchanges/bitteam.md#bitteamcancelallorders)
* [bittrade](/exchanges/bittrade.md#bittradecancelallorders)
* [bitvavo](/exchanges/bitvavo.md#bitvavocancelallorders)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomcancelallorders)
* [bybit](/exchanges/bybit.md#bybitcancelallorders)
* [cex](/exchanges/cex.md#cexcancelallorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangecancelallorders)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalcancelallorders)
* [coincatch](/exchanges/coincatch.md#coincatchcancelallorders)
* [coinex](/exchanges/coinex.md#coinexcancelallorders)
* [coinsph](/exchanges/coinsph.md#coinsphcancelallorders)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcancelallorders)
* [defx](/exchanges/defx.md#defxcancelallorders)
* [delta](/exchanges/delta.md#deltacancelallorders)
* [deribit](/exchanges/deribit.md#deribitcancelallorders)
* [derive](/exchanges/derive.md#derivecancelallorders)
* [foxbit](/exchanges/foxbit.md#foxbitcancelallorders)
* [gate](/exchanges/gate.md#gatecancelallorders)
* [hashkey](/exchanges/hashkey.md#hashkeycancelallorders)
* [hibachi](/exchanges/hibachi.md#hibachicancelallorders)
* [hitbtc](/exchanges/hitbtc.md#hitbtccancelallorders)
* [hollaex](/exchanges/hollaex.md#hollaexcancelallorders)
* [htx](/exchanges/htx.md#htxcancelallorders)
* [kraken](/exchanges/kraken.md#krakencancelallorders)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturescancelallorders)
* [kucoin](/exchanges/kucoin.md#kucoincancelallorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturescancelallorders)
* [latoken](/exchanges/latoken.md#latokencancelallorders)
* [lbank](/exchanges/lbank.md#lbankcancelallorders)
* [mexc](/exchanges/mexc.md#mexccancelallorders)
* [modetrade](/exchanges/modetrade.md#modetradecancelallorders)
* [ndax](/exchanges/ndax.md#ndaxcancelallorders)
* [oceanex](/exchanges/oceanex.md#oceanexcancelallorders)
* [onetrading](/exchanges/onetrading.md#onetradingcancelallorders)
* [oxfun](/exchanges/oxfun.md#oxfuncancelallorders)
* [paradex](/exchanges/paradex.md#paradexcancelallorders)
* [phemex](/exchanges/phemex.md#phemexcancelallorders)
* [poloniex](/exchanges/poloniex.md#poloniexcancelallorders)
* [toobit](/exchanges/toobit.md#toobitcancelallorders)
* [whitebit](/exchanges/whitebit.md#whitebitcancelallorders)
* [woo](/exchanges/woo.md#woocancelallorders)
* [woofipro](/exchanges/woofipro.md#woofiprocancelallorders)
* [xt](/exchanges/xt.md#xtcancelallorders)

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
* [bingx](/exchanges/bingx.md#bingxcancelallordersafter)
* [bitmex](/exchanges/bitmex.md#bitmexcancelallordersafter)
* [bybit](/exchanges/bybit.md#bybitcancelallordersafter)
* [htx](/exchanges/htx.md#htxcancelallordersafter)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelallordersafter)
* [kraken](/exchanges/kraken.md#krakencancelallordersafter)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturescancelallordersafter)
* [okx](/exchanges/okx.md#okxcancelallordersafter)
* [whitebit](/exchanges/whitebit.md#whitebitcancelallordersafter)
* [woo](/exchanges/woo.md#woocancelallordersafter)

---

<a name="cancelAllOrdersWs" id="cancelallordersws"></a>

## cancelAllOrdersWs
cancel all open orders

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavocancelallordersws)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcancelallordersws)
* [gate](/exchanges/gate.md#gatecancelallordersws)
* [okx](/exchanges/okx.md#okxcancelallordersws)

---

<a name="cancelOrder" id="cancelorder"></a>

## cancelOrder
cancels an open order

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacacancelorder)
* [apex](/exchanges/apex.md#apexcancelorder)
* [ascendex](/exchanges/ascendex.md#ascendexcancelorder)
* [backpack](/exchanges/backpack.md#backpackcancelorder)
* [bigone](/exchanges/bigone.md#bigonecancelorder)
* [binance](/exchanges/binance.md#binancecancelorder)
* [bingx](/exchanges/bingx.md#bingxcancelorder)
* [bit2c](/exchanges/bit2c.md#bit2ccancelorder)
* [bitbank](/exchanges/bitbank.md#bitbankcancelorder)
* [bitbns](/exchanges/bitbns.md#bitbnscancelorder)
* [bitfinex](/exchanges/bitfinex.md#bitfinexcancelorder)
* [bitflyer](/exchanges/bitflyer.md#bitflyercancelorder)
* [bitget](/exchanges/bitget.md#bitgetcancelorder)
* [bithumb](/exchanges/bithumb.md#bithumbcancelorder)
* [bitmart](/exchanges/bitmart.md#bitmartcancelorder)
* [bitmex](/exchanges/bitmex.md#bitmexcancelorder)
* [bitopro](/exchanges/bitopro.md#bitoprocancelorder)
* [bitrue](/exchanges/bitrue.md#bitruecancelorder)
* [bitso](/exchanges/bitso.md#bitsocancelorder)
* [bitstamp](/exchanges/bitstamp.md#bitstampcancelorder)
* [bitteam](/exchanges/bitteam.md#bitteamcancelorder)
* [bittrade](/exchanges/bittrade.md#bittradecancelorder)
* [bitvavo](/exchanges/bitvavo.md#bitvavocancelorder)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomcancelorder)
* [blofin](/exchanges/blofin.md#blofincancelorder)
* [btcalpha](/exchanges/btcalpha.md#btcalphacancelorder)
* [btcbox](/exchanges/btcbox.md#btcboxcancelorder)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketscancelorder)
* [btcturk](/exchanges/btcturk.md#btcturkcancelorder)
* [bybit](/exchanges/bybit.md#bybitcancelorder)
* [cex](/exchanges/cex.md#cexcancelorder)
* [coinbase](/exchanges/coinbase.md#coinbasecancelorder)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangecancelorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalcancelorder)
* [coincatch](/exchanges/coincatch.md#coincatchcancelorder)
* [coincheck](/exchanges/coincheck.md#coincheckcancelorder)
* [coinex](/exchanges/coinex.md#coinexcancelorder)
* [coinmate](/exchanges/coinmate.md#coinmatecancelorder)
* [coinmetro](/exchanges/coinmetro.md#coinmetrocancelorder)
* [coinone](/exchanges/coinone.md#coinonecancelorder)
* [coinsph](/exchanges/coinsph.md#coinsphcancelorder)
* [coinspot](/exchanges/coinspot.md#coinspotcancelorder)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcancelorder)
* [cryptomus](/exchanges/cryptomus.md#cryptomuscancelorder)
* [defx](/exchanges/defx.md#defxcancelorder)
* [delta](/exchanges/delta.md#deltacancelorder)
* [deribit](/exchanges/deribit.md#deribitcancelorder)
* [derive](/exchanges/derive.md#derivecancelorder)
* [digifinex](/exchanges/digifinex.md#digifinexcancelorder)
* [exmo](/exchanges/exmo.md#exmocancelorder)
* [foxbit](/exchanges/foxbit.md#foxbitcancelorder)
* [gate](/exchanges/gate.md#gatecancelorder)
* [gemini](/exchanges/gemini.md#geminicancelorder)
* [hashkey](/exchanges/hashkey.md#hashkeycancelorder)
* [hibachi](/exchanges/hibachi.md#hibachicancelorder)
* [hitbtc](/exchanges/hitbtc.md#hitbtccancelorder)
* [hollaex](/exchanges/hollaex.md#hollaexcancelorder)
* [htx](/exchanges/htx.md#htxcancelorder)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelorder)
* [independentreserve](/exchanges/independentreserve.md#independentreservecancelorder)
* [indodax](/exchanges/indodax.md#indodaxcancelorder)
* [kraken](/exchanges/kraken.md#krakencancelorder)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturescancelorder)
* [kucoin](/exchanges/kucoin.md#kucoincancelorder)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturescancelorder)
* [latoken](/exchanges/latoken.md#latokencancelorder)
* [lbank](/exchanges/lbank.md#lbankcancelorder)
* [luno](/exchanges/luno.md#lunocancelorder)
* [mercado](/exchanges/mercado.md#mercadocancelorder)
* [mexc](/exchanges/mexc.md#mexccancelorder)
* [modetrade](/exchanges/modetrade.md#modetradecancelorder)
* [ndax](/exchanges/ndax.md#ndaxcancelorder)
* [novadax](/exchanges/novadax.md#novadaxcancelorder)
* [oceanex](/exchanges/oceanex.md#oceanexcancelorder)
* [okcoin](/exchanges/okcoin.md#okcoincancelorder)
* [okx](/exchanges/okx.md#okxcancelorder)
* [onetrading](/exchanges/onetrading.md#onetradingcancelorder)
* [oxfun](/exchanges/oxfun.md#oxfuncancelorder)
* [p2b](/exchanges/p2b.md#p2bcancelorder)
* [paradex](/exchanges/paradex.md#paradexcancelorder)
* [paymium](/exchanges/paymium.md#paymiumcancelorder)
* [phemex](/exchanges/phemex.md#phemexcancelorder)
* [probit](/exchanges/probit.md#probitcancelorder)
* [timex](/exchanges/timex.md#timexcancelorder)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptocancelorder)
* [toobit](/exchanges/toobit.md#toobitcancelorder)
* [upbit](/exchanges/upbit.md#upbitcancelorder)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangecancelorder)
* [whitebit](/exchanges/whitebit.md#whitebitcancelorder)
* [woo](/exchanges/woo.md#woocancelorder)
* [woofipro](/exchanges/woofipro.md#woofiprocancelorder)
* [xt](/exchanges/xt.md#xtcancelorder)
* [yobit](/exchanges/yobit.md#yobitcancelorder)
* [zaif](/exchanges/zaif.md#zaifcancelorder)
* [zonda](/exchanges/zonda.md#zondacancelorder)

---

<a name="cancelOrderWs" id="cancelorderws"></a>

## cancelOrderWs
cancels an open order

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavocancelorderws)
* [bybit](/exchanges/bybit.md#bybitcancelorderws)
* [cex](/exchanges/cex.md#cexcancelorderws)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcancelorderws)
* [gate](/exchanges/gate.md#gatecancelorderws)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelorderws)
* [okx](/exchanges/okx.md#okxcancelorderws)
* [oxfun](/exchanges/oxfun.md#oxfuncancelorderws)

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
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.clientOrderIds | <code>Array&lt;string&gt;</code> | No | alternative to ids, array of client order ids EXCHANGE SPECIFIC PARAMETERS |
| params.origClientOrderIdList | <code>Array&lt;string&gt;</code> | No | max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma |
| params.recvWindow | <code>Array&lt;int&gt;</code> | No |  |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancecancelorders)
* [bingx](/exchanges/bingx.md#bingxcancelorders)
* [bitfinex](/exchanges/bitfinex.md#bitfinexcancelorders)
* [bitget](/exchanges/bitget.md#bitgetcancelorders)
* [bitmart](/exchanges/bitmart.md#bitmartcancelorders)
* [bitmex](/exchanges/bitmex.md#bitmexcancelorders)
* [bitopro](/exchanges/bitopro.md#bitoprocancelorders)
* [bitso](/exchanges/bitso.md#bitsocancelorders)
* [bittrade](/exchanges/bittrade.md#bittradecancelorders)
* [blofin](/exchanges/blofin.md#blofincancelorders)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketscancelorders)
* [bybit](/exchanges/bybit.md#bybitcancelorders)
* [coinbase](/exchanges/coinbase.md#coinbasecancelorders)
* [coincatch](/exchanges/coincatch.md#coincatchcancelorders)
* [coinex](/exchanges/coinex.md#coinexcancelorders)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcancelorders)
* [digifinex](/exchanges/digifinex.md#digifinexcancelorders)
* [gate](/exchanges/gate.md#gatecancelorders)
* [hashkey](/exchanges/hashkey.md#hashkeycancelorders)
* [hibachi](/exchanges/hibachi.md#hibachicancelorders)
* [htx](/exchanges/htx.md#htxcancelorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelorders)
* [kraken](/exchanges/kraken.md#krakencancelorders)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturescancelorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturescancelorders)
* [mexc](/exchanges/mexc.md#mexccancelorders)
* [modetrade](/exchanges/modetrade.md#modetradecancelorders)
* [oceanex](/exchanges/oceanex.md#oceanexcancelorders)
* [okcoin](/exchanges/okcoin.md#okcoincancelorders)
* [okx](/exchanges/okx.md#okxcancelorders)
* [onetrading](/exchanges/onetrading.md#onetradingcancelorders)
* [oxfun](/exchanges/oxfun.md#oxfuncancelorders)
* [timex](/exchanges/timex.md#timexcancelorders)
* [toobit](/exchanges/toobit.md#toobitcancelorders)
* [woofipro](/exchanges/woofipro.md#woofiprocancelorders)
* [xt](/exchanges/xt.md#xtcancelorders)

---

<a name="cancelOrdersForSymbols" id="cancelordersforsymbols"></a>

## cancelOrdersForSymbols
cancel multiple orders for multiple symbols

**Kind**: instance   
**Returns**: <code>object</code> - an list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array&lt;CancellationRequest&gt;</code> | Yes | list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}] |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#bybitcancelordersforsymbols)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcancelordersforsymbols)
* [gate](/exchanges/gate.md#gatecancelordersforsymbols)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelordersforsymbols)
* [okx](/exchanges/okx.md#okxcancelordersforsymbols)

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
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelordersrequest)

---

<a name="cancelOrdersWs" id="cancelordersws"></a>

## cancelOrdersWs
cancel multiple orders

**Kind**: instance   
**Returns**: <code>object</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | Yes | order ids |
| symbol | <code>string</code> | Yes | not used by cex cancelOrders() |
| params | <code>object</code> | No | extra parameters specific to the cex api endpoint |

##### Supported exchanges
* [cex](/exchanges/cex.md#cexcancelordersws)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcancelordersws)
* [okx](/exchanges/okx.md#okxcancelordersws)
* [oxfun](/exchanges/oxfun.md#oxfuncancelordersws)

---

<a name="closeAllPositions" id="closeallpositions"></a>

## closeAllPositions
closes all open positions for a market type

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - A list of [position structures](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.productType | <code>string</code> | No | 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#bitgetcloseallpositions)
* [defx](/exchanges/defx.md#defxcloseallpositions)
* [delta](/exchanges/delta.md#deltacloseallpositions)

---

<a name="closePosition" id="closeposition"></a>

## closePosition
closes open positions for a market

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | Unified CCXT market symbol |
| side | <code>string</code> | No | not used by bingx |
| params | <code>object</code> | No | extra parameters specific to the bingx api endpoint |
| params.positionId | <code>string</code>, <code>undefined</code> | No | the id of the position you would like to close |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#bingxcloseposition)
* [bitget](/exchanges/bitget.md#bitgetcloseposition)
* [blofin](/exchanges/blofin.md#blofincloseposition)
* [coinbase](/exchanges/coinbase.md#coinbasecloseposition)
* [coinex](/exchanges/coinex.md#coinexcloseposition)
* [coinmetro](/exchanges/coinmetro.md#coinmetrocloseposition)
* [defx](/exchanges/defx.md#defxcloseposition)
* [gate](/exchanges/gate.md#gatecloseposition)
* [hitbtc](/exchanges/hitbtc.md#hitbtccloseposition)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturescloseposition)
* [okx](/exchanges/okx.md#okxcloseposition)

---

<a name="closePositions" id="closepositions"></a>

## closePositions
closes open positions for a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - [a list of position structures](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bingx api endpoint |
| params.recvWindow | <code>string</code> | No | request valid time window value |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#bitgetclosepositions)
* [cryptocom](/exchanges/cryptocom.md#cryptocomclosepositions)
* [htx](/exchanges/htx.md#htxclosepositions)

---

<a name="createConvertTrade" id="createconverttrade"></a>

## createConvertTrade
convert from one currency to another

**Kind**: instance   
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to make |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | No | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancecreateconverttrade)
* [bitget](/exchanges/bitget.md#bitgetcreateconverttrade)
* [bybit](/exchanges/bybit.md#bybitcreateconverttrade)
* [coinbase](/exchanges/coinbase.md#coinbasecreateconverttrade)
* [okx](/exchanges/okx.md#okxcreateconverttrade)
* [phemex](/exchanges/phemex.md#phemexcreateconverttrade)
* [whitebit](/exchanges/whitebit.md#whitebitcreateconverttrade)
* [woo](/exchanges/woo.md#woocreateconverttrade)

---

<a name="createDepositAddress" id="createdepositaddress"></a>

## createDepositAddress
create a currency deposit address

**Kind**: instance   
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency for the deposit address |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#bitfinexcreatedepositaddress)
* [coinbase](/exchanges/coinbase.md#coinbasecreatedepositaddress)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangecreatedepositaddress)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalcreatedepositaddress)
* [coinex](/exchanges/coinex.md#coinexcreatedepositaddress)
* [deribit](/exchanges/deribit.md#deribitcreatedepositaddress)
* [gemini](/exchanges/gemini.md#geminicreatedepositaddress)
* [hitbtc](/exchanges/hitbtc.md#hitbtccreatedepositaddress)
* [kraken](/exchanges/kraken.md#krakencreatedepositaddress)
* [kucoin](/exchanges/kucoin.md#kucoincreatedepositaddress)
* [luno](/exchanges/luno.md#lunocreatedepositaddress)
* [mexc](/exchanges/mexc.md#mexccreatedepositaddress)
* [ndax](/exchanges/ndax.md#ndaxcreatedepositaddress)
* [paymium](/exchanges/paymium.md#paymiumcreatedepositaddress)
* [poloniex](/exchanges/poloniex.md#poloniexcreatedepositaddress)
* [upbit](/exchanges/upbit.md#upbitcreatedepositaddress)
* [whitebit](/exchanges/whitebit.md#whitebitcreatedepositaddress)
* [yobit](/exchanges/yobit.md#yobitcreatedepositaddress)

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
* [binance](/exchanges/binance.md#binancecreategiftcode)

---

<a name="createMarkeSellOrderWithCost" id="createmarkesellorderwithcost"></a>

## createMarkeSellOrderWithCost
create a market sell order by providing the symbol and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#bybitcreatemarkesellorderwithcost)

---

<a name="createMarketBuyOrderWithCost" id="createmarketbuyorderwithcost"></a>

## createMarketBuyOrderWithCost
create a market buy order by providing the symbol and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacacreatemarketbuyorderwithcost)
* [bigone](/exchanges/bigone.md#bigonecreatemarketbuyorderwithcost)
* [binance](/exchanges/binance.md#binancecreatemarketbuyorderwithcost)
* [bingx](/exchanges/bingx.md#bingxcreatemarketbuyorderwithcost)
* [bitget](/exchanges/bitget.md#bitgetcreatemarketbuyorderwithcost)
* [bitmart](/exchanges/bitmart.md#bitmartcreatemarketbuyorderwithcost)
* [bitrue](/exchanges/bitrue.md#bitruecreatemarketbuyorderwithcost)
* [bittrade](/exchanges/bittrade.md#bittradecreatemarketbuyorderwithcost)
* [bybit](/exchanges/bybit.md#bybitcreatemarketbuyorderwithcost)
* [coinbase](/exchanges/coinbase.md#coinbasecreatemarketbuyorderwithcost)
* [coincatch](/exchanges/coincatch.md#coincatchcreatemarketbuyorderwithcost)
* [coinex](/exchanges/coinex.md#coinexcreatemarketbuyorderwithcost)
* [digifinex](/exchanges/digifinex.md#digifinexcreatemarketbuyorderwithcost)
* [exmo](/exchanges/exmo.md#exmocreatemarketbuyorderwithcost)
* [gate](/exchanges/gate.md#gatecreatemarketbuyorderwithcost)
* [hashkey](/exchanges/hashkey.md#hashkeycreatemarketbuyorderwithcost)
* [htx](/exchanges/htx.md#htxcreatemarketbuyorderwithcost)
* [kraken](/exchanges/kraken.md#krakencreatemarketbuyorderwithcost)
* [kucoin](/exchanges/kucoin.md#kucoincreatemarketbuyorderwithcost)
* [lbank](/exchanges/lbank.md#lbankcreatemarketbuyorderwithcost)
* [mexc](/exchanges/mexc.md#mexccreatemarketbuyorderwithcost)
* [okcoin](/exchanges/okcoin.md#okcoincreatemarketbuyorderwithcost)
* [okx](/exchanges/okx.md#okxcreatemarketbuyorderwithcost)
* [oxfun](/exchanges/oxfun.md#oxfuncreatemarketbuyorderwithcost)
* [whitebit](/exchanges/whitebit.md#whitebitcreatemarketbuyorderwithcost)
* [woo](/exchanges/woo.md#woocreatemarketbuyorderwithcost)
* [xt](/exchanges/xt.md#xtcreatemarketbuyorderwithcost)

---

<a name="createMarketOrderWithCost" id="createmarketorderwithcost"></a>

## createMarketOrderWithCost
create a market order by providing the symbol, side and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacacreatemarketorderwithcost)
* [binance](/exchanges/binance.md#binancecreatemarketorderwithcost)
* [bingx](/exchanges/bingx.md#bingxcreatemarketorderwithcost)
* [exmo](/exchanges/exmo.md#exmocreatemarketorderwithcost)
* [kraken](/exchanges/kraken.md#krakencreatemarketorderwithcost)
* [kucoin](/exchanges/kucoin.md#kucoincreatemarketorderwithcost)
* [whitebit](/exchanges/whitebit.md#whitebitcreatemarketorderwithcost)

---

<a name="createMarketSellOrderWithCost" id="createmarketsellorderwithcost"></a>

## createMarketSellOrderWithCost
create a market sell order by providing the symbol and cost

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| cost | <code>float</code> | Yes | how much you want to trade in units of the quote currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacacreatemarketsellorderwithcost)
* [binance](/exchanges/binance.md#binancecreatemarketsellorderwithcost)
* [bingx](/exchanges/bingx.md#bingxcreatemarketsellorderwithcost)
* [exmo](/exchanges/exmo.md#exmocreatemarketsellorderwithcost)
* [kucoin](/exchanges/kucoin.md#kucoincreatemarketsellorderwithcost)
* [mexc](/exchanges/mexc.md#mexccreatemarketsellorderwithcost)
* [okx](/exchanges/okx.md#okxcreatemarketsellorderwithcost)
* [woo](/exchanges/woo.md#woocreatemarketsellorderwithcost)

---

<a name="createOrder" id="createorder"></a>

## createOrder
create a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market', 'limit' or 'stop_limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.cost | <code>float</code> | No | *market orders only* the cost of the order in units of the quote currency |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacacreateorder)
* [apex](/exchanges/apex.md#apexcreateorder)
* [ascendex](/exchanges/ascendex.md#ascendexcreateorder)
* [backpack](/exchanges/backpack.md#backpackcreateorder)
* [bigone](/exchanges/bigone.md#bigonecreateorder)
* [binance](/exchanges/binance.md#binancecreateorder)
* [bingx](/exchanges/bingx.md#bingxcreateorder)
* [bit2c](/exchanges/bit2c.md#bit2ccreateorder)
* [bitbank](/exchanges/bitbank.md#bitbankcreateorder)
* [bitbns](/exchanges/bitbns.md#bitbnscreateorder)
* [bitfinex](/exchanges/bitfinex.md#bitfinexcreateorder)
* [bitflyer](/exchanges/bitflyer.md#bitflyercreateorder)
* [bitget](/exchanges/bitget.md#bitgetcreateorder)
* [bithumb](/exchanges/bithumb.md#bithumbcreateorder)
* [bitmart](/exchanges/bitmart.md#bitmartcreateorder)
* [bitmex](/exchanges/bitmex.md#bitmexcreateorder)
* [bitopro](/exchanges/bitopro.md#bitoprocreateorder)
* [bitrue](/exchanges/bitrue.md#bitruecreateorder)
* [bitso](/exchanges/bitso.md#bitsocreateorder)
* [bitstamp](/exchanges/bitstamp.md#bitstampcreateorder)
* [bitteam](/exchanges/bitteam.md#bitteamcreateorder)
* [bittrade](/exchanges/bittrade.md#bittradecreateorder)
* [bitvavo](/exchanges/bitvavo.md#bitvavocreateorder)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomcreateorder)
* [blofin](/exchanges/blofin.md#blofincreateorder)
* [btcalpha](/exchanges/btcalpha.md#btcalphacreateorder)
* [btcbox](/exchanges/btcbox.md#btcboxcreateorder)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketscreateorder)
* [btcturk](/exchanges/btcturk.md#btcturkcreateorder)
* [bybit](/exchanges/bybit.md#bybitcreateorder)
* [cex](/exchanges/cex.md#cexcreateorder)
* [coinbase](/exchanges/coinbase.md#coinbasecreateorder)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangecreateorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalcreateorder)
* [coincatch](/exchanges/coincatch.md#coincatchcreateorder)
* [coincheck](/exchanges/coincheck.md#coincheckcreateorder)
* [coinex](/exchanges/coinex.md#coinexcreateorder)
* [coinmate](/exchanges/coinmate.md#coinmatecreateorder)
* [coinmetro](/exchanges/coinmetro.md#coinmetrocreateorder)
* [coinone](/exchanges/coinone.md#coinonecreateorder)
* [coinsph](/exchanges/coinsph.md#coinsphcreateorder)
* [coinspot](/exchanges/coinspot.md#coinspotcreateorder)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcreateorder)
* [cryptomus](/exchanges/cryptomus.md#cryptomuscreateorder)
* [defx](/exchanges/defx.md#defxcreateorder)
* [delta](/exchanges/delta.md#deltacreateorder)
* [deribit](/exchanges/deribit.md#deribitcreateorder)
* [derive](/exchanges/derive.md#derivecreateorder)
* [digifinex](/exchanges/digifinex.md#digifinexcreateorder)
* [exmo](/exchanges/exmo.md#exmocreateorder)
* [foxbit](/exchanges/foxbit.md#foxbitcreateorder)
* [gate](/exchanges/gate.md#gatecreateorder)
* [gemini](/exchanges/gemini.md#geminicreateorder)
* [hashkey](/exchanges/hashkey.md#hashkeycreateorder)
* [hibachi](/exchanges/hibachi.md#hibachicreateorder)
* [hitbtc](/exchanges/hitbtc.md#hitbtccreateorder)
* [hollaex](/exchanges/hollaex.md#hollaexcreateorder)
* [htx](/exchanges/htx.md#htxcreateorder)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcreateorder)
* [independentreserve](/exchanges/independentreserve.md#independentreservecreateorder)
* [indodax](/exchanges/indodax.md#indodaxcreateorder)
* [kraken](/exchanges/kraken.md#krakencreateorder)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturescreateorder)
* [kucoin](/exchanges/kucoin.md#kucoincreateorder)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturescreateorder)
* [latoken](/exchanges/latoken.md#latokencreateorder)
* [lbank](/exchanges/lbank.md#lbankcreateorder)
* [luno](/exchanges/luno.md#lunocreateorder)
* [mercado](/exchanges/mercado.md#mercadocreateorder)
* [mexc](/exchanges/mexc.md#mexccreateorder)
* [modetrade](/exchanges/modetrade.md#modetradecreateorder)
* [ndax](/exchanges/ndax.md#ndaxcreateorder)
* [novadax](/exchanges/novadax.md#novadaxcreateorder)
* [oceanex](/exchanges/oceanex.md#oceanexcreateorder)
* [okcoin](/exchanges/okcoin.md#okcoincreateorder)
* [okx](/exchanges/okx.md#okxcreateorder)
* [onetrading](/exchanges/onetrading.md#onetradingcreateorder)
* [oxfun](/exchanges/oxfun.md#oxfuncreateorder)
* [p2b](/exchanges/p2b.md#p2bcreateorder)
* [paradex](/exchanges/paradex.md#paradexcreateorder)
* [paymium](/exchanges/paymium.md#paymiumcreateorder)
* [phemex](/exchanges/phemex.md#phemexcreateorder)
* [poloniex](/exchanges/poloniex.md#poloniexcreateorder)
* [probit](/exchanges/probit.md#probitcreateorder)
* [timex](/exchanges/timex.md#timexcreateorder)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptocreateorder)
* [toobit](/exchanges/toobit.md#toobitcreateorder)
* [upbit](/exchanges/upbit.md#upbitcreateorder)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangecreateorder)
* [whitebit](/exchanges/whitebit.md#whitebitcreateorder)
* [woo](/exchanges/woo.md#woocreateorder)
* [woofipro](/exchanges/woofipro.md#woofiprocreateorder)
* [xt](/exchanges/xt.md#xtcreateorder)
* [yobit](/exchanges/yobit.md#yobitcreateorder)
* [zaif](/exchanges/zaif.md#zaifcreateorder)
* [zonda](/exchanges/zonda.md#zondacreateorder)

---

<a name="createOrderWithTakeProfitAndStopLoss" id="createorderwithtakeprofitandstoploss"></a>

## createOrderWithTakeProfitAndStopLoss
*swap markets only* create an order with a stop loss or take profit attached (type 3)

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [coincatch](/exchanges/coincatch.md#coincatchcreateorderwithtakeprofitandstoploss)

---

<a name="createOrderWs" id="createorderws"></a>

## createOrderWs
create a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | Yes | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | Yes | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", or "PO" |
| params.stopPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.triggerPrice | <code>float</code> | No | The price at which a trigger order is triggered at |
| params.postOnly | <code>bool</code> | No | If true, the order will only be posted to the order book and not executed immediately |
| params.stopLossPrice | <code>float</code> | No | The price at which a stop loss order is triggered at |
| params.takeProfitPrice | <code>float</code> | No | The price at which a take profit order is triggered at |
| params.triggerType | <code>string</code> | No | "price" |
| params.triggerReference | <code>string</code> | No | "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order |
| params.selfTradePrevention | <code>string</code> | No | "decrementAndCancel", "cancelOldest", "cancelNewest", "cancelBoth" |
| params.disableMarketProtection | <code>bool</code> | No | don't cancel if the next fill price is 10% worse than the best fill price |
| params.responseRequired | <code>bool</code> | No | Set this to 'false' when only an acknowledgement of success or failure is required, this is faster. |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavocreateorderws)
* [bybit](/exchanges/bybit.md#bybitcreateorderws)
* [cex](/exchanges/cex.md#cexcreateorderws)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcreateorderws)
* [gate](/exchanges/gate.md#gatecreateorderws)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcreateorderws)
* [okx](/exchanges/okx.md#okxcreateorderws)
* [oxfun](/exchanges/oxfun.md#oxfuncreateorderws)

---

<a name="createOrders" id="createorders"></a>

## createOrders
create a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.timeInForce | <code>string</code> | No | "GTC", "IOC", "FOK", or "PO" |
| params.postOnly | <code>bool</code> | No | true or false |
| params.triggerPrice | <code>float</code> | No | the price at which a trigger order is triggered at |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexcreateorders)
* [backpack](/exchanges/backpack.md#backpackcreateorders)
* [binance](/exchanges/binance.md#binancecreateorders)
* [bingx](/exchanges/bingx.md#bingxcreateorders)
* [bitfinex](/exchanges/bitfinex.md#bitfinexcreateorders)
* [bitget](/exchanges/bitget.md#bitgetcreateorders)
* [bitmart](/exchanges/bitmart.md#bitmartcreateorders)
* [blofin](/exchanges/blofin.md#blofincreateorders)
* [bybit](/exchanges/bybit.md#bybitcreateorders)
* [coincatch](/exchanges/coincatch.md#coincatchcreateorders)
* [coinex](/exchanges/coinex.md#coinexcreateorders)
* [cryptocom](/exchanges/cryptocom.md#cryptocomcreateorders)
* [digifinex](/exchanges/digifinex.md#digifinexcreateorders)
* [foxbit](/exchanges/foxbit.md#foxbitcreateorders)
* [gate](/exchanges/gate.md#gatecreateorders)
* [hashkey](/exchanges/hashkey.md#hashkeycreateorders)
* [hibachi](/exchanges/hibachi.md#hibachicreateorders)
* [htx](/exchanges/htx.md#htxcreateorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcreateorders)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturescreateorders)
* [kucoin](/exchanges/kucoin.md#kucoincreateorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturescreateorders)
* [mexc](/exchanges/mexc.md#mexccreateorders)
* [modetrade](/exchanges/modetrade.md#modetradecreateorders)
* [okx](/exchanges/okx.md#okxcreateorders)
* [oxfun](/exchanges/oxfun.md#oxfuncreateorders)
* [woofipro](/exchanges/woofipro.md#woofiprocreateorders)

---

<a name="createOrdersRequest" id="createordersrequest"></a>

## createOrdersRequest
create a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Description |
| --- | --- | --- |
| orders | <code>Array</code> | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |

##### Supported exchanges
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcreateordersrequest)

---

<a name="createOrdersWs" id="createordersws"></a>

## createOrdersWs
create a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [gate](/exchanges/gate.md#gatecreateordersws)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcreateordersws)

---

<a name="createSpotOrder" id="createspotorder"></a>

## createSpotOrder
create a trade order on spot market

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [coincatch](/exchanges/coincatch.md#coincatchcreatespotorder)
* [hashkey](/exchanges/hashkey.md#hashkeycreatespotorder)

---

<a name="createSwapOrder" id="createswaporder"></a>

## createSwapOrder
create a trade order on swap market

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [coincatch](/exchanges/coincatch.md#coincatchcreateswaporder)
* [hashkey](/exchanges/hashkey.md#hashkeycreateswaporder)

---

<a name="createTrailingAmountOrder" id="createtrailingamountorder"></a>

## createTrailingAmountOrder
create a trailing order by providing the symbol, type, side, amount, price and trailingAmount

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [woo](/exchanges/woo.md#woocreatetrailingamountorder)

---

<a name="createTrailingPercentOrder" id="createtrailingpercentorder"></a>

## createTrailingPercentOrder
create a trailing order by providing the symbol, type, side, amount, price and trailingPercent

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [htx](/exchanges/htx.md#htxcreatetrailingpercentorder)
* [woo](/exchanges/woo.md#woocreatetrailingpercentorder)

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
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidcreatevault)

---

<a name="deposit" id="deposit"></a>

## deposit
make a deposit

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to deposit |
| id | <code>string</code> | Yes | the payment method id to be used for the deposit, can be retrieved from v2PrivateGetPaymentMethods |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.accountId | <code>string</code> | No | the id of the account to deposit into |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#coinbasedeposit)

---

<a name="editContractOrder" id="editcontractorder"></a>

## editContractOrder
edit a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [binance](/exchanges/binance.md#binanceeditcontractorder)

---

<a name="editOrder" id="editorder"></a>

## editOrder
edit a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


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
* [alpaca](/exchanges/alpaca.md#alpacaeditorder)
* [binance](/exchanges/binance.md#binanceeditorder)
* [bingx](/exchanges/bingx.md#bingxeditorder)
* [bitfinex](/exchanges/bitfinex.md#bitfinexeditorder)
* [bitget](/exchanges/bitget.md#bitgeteditorder)
* [bitmart](/exchanges/bitmart.md#bitmarteditorder)
* [bitvavo](/exchanges/bitvavo.md#bitvavoeditorder)
* [bybit](/exchanges/bybit.md#bybiteditorder)
* [coinbase](/exchanges/coinbase.md#coinbaseeditorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationaleditorder)
* [coincatch](/exchanges/coincatch.md#coincatcheditorder)
* [coinex](/exchanges/coinex.md#coinexeditorder)
* [cryptocom](/exchanges/cryptocom.md#cryptocomeditorder)
* [delta](/exchanges/delta.md#deltaeditorder)
* [deribit](/exchanges/deribit.md#deribiteditorder)
* [derive](/exchanges/derive.md#deriveeditorder)
* [exmo](/exchanges/exmo.md#exmoeditorder)
* [foxbit](/exchanges/foxbit.md#foxbiteditorder)
* [gate](/exchanges/gate.md#gateeditorder)
* [hibachi](/exchanges/hibachi.md#hibachieditorder)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquideditorder)
* [kraken](/exchanges/kraken.md#krakeneditorder)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfutureseditorder)
* [kucoin](/exchanges/kucoin.md#kucoineditorder)
* [modetrade](/exchanges/modetrade.md#modetradeeditorder)
* [okx](/exchanges/okx.md#okxeditorder)
* [phemex](/exchanges/phemex.md#phemexeditorder)
* [poloniex](/exchanges/poloniex.md#poloniexeditorder)
* [upbit](/exchanges/upbit.md#upbiteditorder)
* [whitebit](/exchanges/whitebit.md#whitebiteditorder)
* [woo](/exchanges/woo.md#wooeditorder)
* [woofipro](/exchanges/woofipro.md#woofiproeditorder)
* [xt](/exchanges/xt.md#xteditorder)

---

<a name="editOrderWs" id="editorderws"></a>

## editOrderWs
edit a trade order

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | cancel order id |
| symbol | <code>string</code> | Yes | unified symbol of the market to create an order in |
| type | <code>string</code> | Yes | 'market' or 'limit' |
| side | <code>string</code> | Yes | 'buy' or 'sell' |
| amount | <code>float</code> | No | how much of currency you want to trade in units of base currency |
| price | <code>float</code> | No | the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavoeditorderws)
* [bybit](/exchanges/bybit.md#bybiteditorderws)
* [cex](/exchanges/cex.md#cexeditorderws)
* [cryptocom](/exchanges/cryptocom.md#cryptocomeditorderws)
* [gate](/exchanges/gate.md#gateeditorderws)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquideditorderws)
* [okx](/exchanges/okx.md#okxeditorderws)
* [oxfun](/exchanges/oxfun.md#oxfuneditorderws)

---

<a name="editOrders" id="editorders"></a>

## editOrders
edit a list of trade orders

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| orders | <code>Array</code> | Yes | list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binanceeditorders)
* [bybit](/exchanges/bybit.md#bybiteditorders)
* [hibachi](/exchanges/hibachi.md#hibachieditorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquideditorders)

---

<a name="enableDemoTrading" id="enabledemotrading"></a>

## enableDemoTrading
enables or disables demo trading mode

**Kind**: instance   


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| enable | <code>boolean</code> | No | true if demo trading should be enabled, false otherwise |

##### Supported exchanges
* [binance](/exchanges/binance.md#binanceenabledemotrading)
* [bybit](/exchanges/bybit.md#bybitenabledemotrading)

---

<a name="fetchAccount" id="fetchaccount"></a>

## fetchAccount
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexfetchaccount)

---

<a name="fetchAccountIdByType" id="fetchaccountidbytype"></a>

## fetchAccountIdByType
fetch all the accounts by a type and marginModeassociated with a profile

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| type | <code>string</code> | Yes | 'spot', 'swap' or 'future |
| marginMode | <code>string</code> | No | 'cross' or 'isolated' |
| symbol | <code>string</code> | No | unified ccxt market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [htx](/exchanges/htx.md#htxfetchaccountidbytype)

---

<a name="fetchAccounts" id="fetchaccounts"></a>

## fetchAccounts
fetch all the accounts associated with a profile

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchaccounts)
* [bittrade](/exchanges/bittrade.md#bittradefetchaccounts)
* [coinbase](/exchanges/coinbase.md#coinbasefetchaccounts)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchaccounts)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchaccounts)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchaccounts)
* [deribit](/exchanges/deribit.md#deribitfetchaccounts)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchaccounts)
* [htx](/exchanges/htx.md#htxfetchaccounts)
* [kucoin](/exchanges/kucoin.md#kucoinfetchaccounts)
* [luno](/exchanges/luno.md#lunofetchaccounts)
* [mexc](/exchanges/mexc.md#mexcfetchaccounts)
* [ndax](/exchanges/ndax.md#ndaxfetchaccounts)
* [novadax](/exchanges/novadax.md#novadaxfetchaccounts)
* [okx](/exchanges/okx.md#okxfetchaccounts)
* [oxfun](/exchanges/oxfun.md#oxfunfetchaccounts)
* [woo](/exchanges/woo.md#woofetchaccounts)

---

<a name="fetchAllGreeks" id="fetchallgreeks"></a>

## fetchAllGreeks
fetches all option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance   
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch greeks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchallgreeks)
* [bybit](/exchanges/bybit.md#bybitfetchallgreeks)
* [okx](/exchanges/okx.md#okxfetchallgreeks)
* [paradex](/exchanges/paradex.md#paradexfetchallgreeks)

---

<a name="fetchBalance" id="fetchbalance"></a>

## fetchBalance
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchbalance)
* [apex](/exchanges/apex.md#apexfetchbalance)
* [ascendex](/exchanges/ascendex.md#ascendexfetchbalance)
* [backpack](/exchanges/backpack.md#backpackfetchbalance)
* [bigone](/exchanges/bigone.md#bigonefetchbalance)
* [binance](/exchanges/binance.md#binancefetchbalance)
* [bingx](/exchanges/bingx.md#bingxfetchbalance)
* [bit2c](/exchanges/bit2c.md#bit2cfetchbalance)
* [bitbank](/exchanges/bitbank.md#bitbankfetchbalance)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchbalance)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchbalance)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchbalance)
* [bitget](/exchanges/bitget.md#bitgetfetchbalance)
* [bithumb](/exchanges/bithumb.md#bithumbfetchbalance)
* [bitmart](/exchanges/bitmart.md#bitmartfetchbalance)
* [bitmex](/exchanges/bitmex.md#bitmexfetchbalance)
* [bitopro](/exchanges/bitopro.md#bitoprofetchbalance)
* [bitrue](/exchanges/bitrue.md#bitruefetchbalance)
* [bitso](/exchanges/bitso.md#bitsofetchbalance)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchbalance)
* [betteam](/exchanges/betteam.md#betteamfetchbalance)
* [bittrade](/exchanges/bittrade.md#bittradefetchbalance)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchbalance)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchbalance)
* [blofin](/exchanges/blofin.md#blofinfetchbalance)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchbalance)
* [btcbox](/exchanges/btcbox.md#btcboxfetchbalance)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchbalance)
* [btcturk](/exchanges/btcturk.md#btcturkfetchbalance)
* [bybit](/exchanges/bybit.md#bybitfetchbalance)
* [cex](/exchanges/cex.md#cexfetchbalance)
* [coinbase](/exchanges/coinbase.md#coinbasefetchbalance)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchbalance)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchbalance)
* [coincatch](/exchanges/coincatch.md#coincatchfetchbalance)
* [coincheck](/exchanges/coincheck.md#coincheckfetchbalance)
* [coinex](/exchanges/coinex.md#coinexfetchbalance)
* [coinmate](/exchanges/coinmate.md#coinmatefetchbalance)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchbalance)
* [coinone](/exchanges/coinone.md#coinonefetchbalance)
* [coinsph](/exchanges/coinsph.md#coinsphfetchbalance)
* [coinspot](/exchanges/coinspot.md#coinspotfetchbalance)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchbalance)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchbalance)
* [defx](/exchanges/defx.md#defxfetchbalance)
* [delta](/exchanges/delta.md#deltafetchbalance)
* [deribit](/exchanges/deribit.md#deribitfetchbalance)
* [derive](/exchanges/derive.md#derivefetchbalance)
* [digifinex](/exchanges/digifinex.md#digifinexfetchbalance)
* [exmo](/exchanges/exmo.md#exmofetchbalance)
* [foxbit](/exchanges/foxbit.md#foxbitfetchbalance)
* [gate](/exchanges/gate.md#gatefetchbalance)
* [gemini](/exchanges/gemini.md#geminifetchbalance)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchbalance)
* [hibachi](/exchanges/hibachi.md#hibachifetchbalance)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchbalance)
* [hollaex](/exchanges/hollaex.md#hollaexfetchbalance)
* [htx](/exchanges/htx.md#htxfetchbalance)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchbalance)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchbalance)
* [indodax](/exchanges/indodax.md#indodaxfetchbalance)
* [kraken](/exchanges/kraken.md#krakenfetchbalance)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchbalance)
* [kucoin](/exchanges/kucoin.md#kucoinfetchbalance)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchbalance)
* [latoken](/exchanges/latoken.md#latokenfetchbalance)
* [lbank](/exchanges/lbank.md#lbankfetchbalance)
* [luno](/exchanges/luno.md#lunofetchbalance)
* [mercado](/exchanges/mercado.md#mercadofetchbalance)
* [mexc](/exchanges/mexc.md#mexcfetchbalance)
* [modetrade](/exchanges/modetrade.md#modetradefetchbalance)
* [ndax](/exchanges/ndax.md#ndaxfetchbalance)
* [novadax](/exchanges/novadax.md#novadaxfetchbalance)
* [oceanex](/exchanges/oceanex.md#oceanexfetchbalance)
* [okcoin](/exchanges/okcoin.md#okcoinfetchbalance)
* [okx](/exchanges/okx.md#okxfetchbalance)
* [onetrading](/exchanges/onetrading.md#onetradingfetchbalance)
* [oxfun](/exchanges/oxfun.md#oxfunfetchbalance)
* [p2b](/exchanges/p2b.md#p2bfetchbalance)
* [paradex](/exchanges/paradex.md#paradexfetchbalance)
* [paymium](/exchanges/paymium.md#paymiumfetchbalance)
* [phemex](/exchanges/phemex.md#phemexfetchbalance)
* [poloniex](/exchanges/poloniex.md#poloniexfetchbalance)
* [probit](/exchanges/probit.md#probitfetchbalance)
* [timex](/exchanges/timex.md#timexfetchbalance)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchbalance)
* [toobit](/exchanges/toobit.md#toobitfetchbalance)
* [upbit](/exchanges/upbit.md#upbitfetchbalance)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchbalance)
* [whitebit](/exchanges/whitebit.md#whitebitfetchbalance)
* [woo](/exchanges/woo.md#woofetchbalance)
* [woofipro](/exchanges/woofipro.md#woofiprofetchbalance)
* [xt](/exchanges/xt.md#xtfetchbalance)
* [yobit](/exchanges/yobit.md#yobitfetchbalance)
* [zaif](/exchanges/zaif.md#zaiffetchbalance)
* [zonda](/exchanges/zonda.md#zondafetchbalance)

---

<a name="fetchBalanceWs" id="fetchbalancews"></a>

## fetchBalanceWs
query for balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/en/latest/manual.html?#balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchbalancews)
* [cex](/exchanges/cex.md#cexfetchbalancews)

---

<a name="fetchBidsAsks" id="fetchbidsasks"></a>

## fetchBidsAsks
fetches the bid and ask price and volume for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchbidsasks)
* [bitrue](/exchanges/bitrue.md#bitruefetchbidsasks)
* [bybit](/exchanges/bybit.md#bybitfetchbidsasks)
* [coinbase](/exchanges/coinbase.md#coinbasefetchbidsasks)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchbidsasks)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchbidsasks)
* [mexc](/exchanges/mexc.md#mexcfetchbidsasks)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchbidsasks)
* [toobit](/exchanges/toobit.md#toobitfetchbidsasks)
* [xt](/exchanges/xt.md#xtfetchbidsasks)

---

<a name="fetchBorrowInterest" id="fetchborrowinterest"></a>

## fetchBorrowInterest
fetch the interest owed by the user for borrowing currency for margin trading

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [borrow interest structures](https://docs.ccxt.com/#/?id=borrow-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| symbol | <code>string</code> | No | unified market symbol when fetch interest in isolated markets |
| since | <code>int</code> | No | the earliest time in ms to fetch borrrow interest for |
| limit | <code>int</code> | No | the maximum number of structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch the borrow interest in a portfolio margin account |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchborrowinterest)
* [bitget](/exchanges/bitget.md#bitgetfetchborrowinterest)
* [bitmart](/exchanges/bitmart.md#bitmartfetchborrowinterest)
* [bybit](/exchanges/bybit.md#bybitfetchborrowinterest)
* [coinex](/exchanges/coinex.md#coinexfetchborrowinterest)
* [gate](/exchanges/gate.md#gatefetchborrowinterest)
* [htx](/exchanges/htx.md#htxfetchborrowinterest)
* [kucoin](/exchanges/kucoin.md#kucoinfetchborrowinterest)
* [okx](/exchanges/okx.md#okxfetchborrowinterest)
* [whitebit](/exchanges/whitebit.md#whitebitfetchborrowinterest)

---

<a name="fetchBorrowRateHistories" id="fetchborrowratehistories"></a>

## fetchBorrowRateHistories
retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) indexed by the market symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest borrowRate, default is undefined |
| limit | <code>int</code> | No | max number of borrow rate prices to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | 'cross' or 'isolated' default is 'cross' |
| params.until | <code>int</code> | No | the latest time in ms to fetch entries for |

##### Supported exchanges
* [kucoin](/exchanges/kucoin.md#kucoinfetchborrowratehistories)
* [okx](/exchanges/okx.md#okxfetchborrowratehistories)

---

<a name="fetchBorrowRateHistory" id="fetchborrowratehistory"></a>

## fetchBorrowRateHistory
retrieves a history of a currencies borrow interest rate at specific time slots

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | timestamp for the earliest borrow rate |
| limit | <code>int</code> | No | the maximum number of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure) to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchborrowratehistory)
* [bybit](/exchanges/bybit.md#bybitfetchborrowratehistory)
* [kucoin](/exchanges/kucoin.md#kucoinfetchborrowratehistory)
* [okx](/exchanges/okx.md#okxfetchborrowratehistory)

---

<a name="fetchCanceledAndClosedOrders" id="fetchcanceledandclosedorders"></a>

## fetchCanceledAndClosedOrders
fetches information on multiple canceled orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


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
* [binance](/exchanges/binance.md#binancefetchcanceledandclosedorders)
* [bingx](/exchanges/bingx.md#bingxfetchcanceledandclosedorders)
* [bitget](/exchanges/bitget.md#bitgetfetchcanceledandclosedorders)
* [bybit](/exchanges/bybit.md#bybitfetchcanceledandclosedorders)
* [coincatch](/exchanges/coincatch.md#coincatchfetchcanceledandclosedorders)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchcanceledandclosedorders)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchcanceledandclosedorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchcanceledandclosedorders)

---

<a name="fetchCanceledOrders" id="fetchcanceledorders"></a>

## fetchCanceledOrders
fetches information on multiple canceled orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


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
* [binance](/exchanges/binance.md#binancefetchcanceledorders)
* [bingx](/exchanges/bingx.md#bingxfetchcanceledorders)
* [bitget](/exchanges/bitget.md#bitgetfetchcanceledorders)
* [bitmart](/exchanges/bitmart.md#bitmartfetchcanceledorders)
* [bitteam](/exchanges/bitteam.md#bitteamfetchcanceledorders)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchcanceledorders)
* [bybit](/exchanges/bybit.md#bybitfetchcanceledorders)
* [coinbase](/exchanges/coinbase.md#coinbasefetchcanceledorders)
* [defx](/exchanges/defx.md#defxfetchcanceledorders)
* [derive](/exchanges/derive.md#derivefetchcanceledorders)
* [exmo](/exchanges/exmo.md#exmofetchcanceledorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchcanceledorders)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchcanceledorders)
* [mexc](/exchanges/mexc.md#mexcfetchcanceledorders)
* [okx](/exchanges/okx.md#okxfetchcanceledorders)
* [upbit](/exchanges/upbit.md#upbitfetchcanceledorders)
* [xt](/exchanges/xt.md#xtfetchcanceledorders)

---

<a name="fetchClosedOrder" id="fetchclosedorder"></a>

## fetchClosedOrder
fetch an open order by it's id

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchclosedorder)
* [bybit](/exchanges/bybit.md#bybitfetchclosedorder)
* [cex](/exchanges/cex.md#cexfetchclosedorder)

---

<a name="fetchClosedOrders" id="fetchclosedorders"></a>

## fetchClosedOrders
fetches information on multiple closed orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchclosedorders)
* [ascendex](/exchanges/ascendex.md#ascendexfetchclosedorders)
* [bigone](/exchanges/bigone.md#bigonefetchclosedorders)
* [binance](/exchanges/binance.md#binancefetchclosedorders)
* [bingx](/exchanges/bingx.md#bingxfetchclosedorders)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchclosedorders)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchclosedorders)
* [bitget](/exchanges/bitget.md#bitgetfetchclosedorders)
* [bitmart](/exchanges/bitmart.md#bitmartfetchclosedorders)
* [bitmex](/exchanges/bitmex.md#bitmexfetchclosedorders)
* [bitopro](/exchanges/bitopro.md#bitoprofetchclosedorders)
* [bitrue](/exchanges/bitrue.md#bitruefetchclosedorders)
* [bitteam](/exchanges/bitteam.md#bitteamfetchclosedorders)
* [bittrade](/exchanges/bittrade.md#bittradefetchclosedorders)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchclosedorders)
* [blofin](/exchanges/blofin.md#blofinfetchclosedorders)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchclosedorders)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchclosedorders)
* [bybit](/exchanges/bybit.md#bybitfetchclosedorders)
* [cex](/exchanges/cex.md#cexfetchclosedorders)
* [coinbase](/exchanges/coinbase.md#coinbasefetchclosedorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchclosedorders)
* [coinex](/exchanges/coinex.md#coinexfetchclosedorders)
* [coinsph](/exchanges/coinsph.md#coinsphfetchclosedorders)
* [defx](/exchanges/defx.md#defxfetchclosedorders)
* [delta](/exchanges/delta.md#deltafetchclosedorders)
* [deribit](/exchanges/deribit.md#deribitfetchclosedorders)
* [derive](/exchanges/derive.md#derivefetchclosedorders)
* [foxbit](/exchanges/foxbit.md#foxbitfetchclosedorders)
* [gate](/exchanges/gate.md#gatefetchclosedorders)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchclosedorders)
* [hollaex](/exchanges/hollaex.md#hollaexfetchclosedorders)
* [htx](/exchanges/htx.md#htxfetchclosedorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchclosedorders)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchclosedorders)
* [indodax](/exchanges/indodax.md#indodaxfetchclosedorders)
* [kraken](/exchanges/kraken.md#krakenfetchclosedorders)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchclosedorders)
* [kucoin](/exchanges/kucoin.md#kucoinfetchclosedorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchclosedorders)
* [luno](/exchanges/luno.md#lunofetchclosedorders)
* [mexc](/exchanges/mexc.md#mexcfetchclosedorders)
* [modetrade](/exchanges/modetrade.md#modetradefetchclosedorders)
* [novadax](/exchanges/novadax.md#novadaxfetchclosedorders)
* [oceanex](/exchanges/oceanex.md#oceanexfetchclosedorders)
* [okcoin](/exchanges/okcoin.md#okcoinfetchclosedorders)
* [okx](/exchanges/okx.md#okxfetchclosedorders)
* [onetrading](/exchanges/onetrading.md#onetradingfetchclosedorders)
* [p2b](/exchanges/p2b.md#p2bfetchclosedorders)
* [phemex](/exchanges/phemex.md#phemexfetchclosedorders)
* [poloniex](/exchanges/poloniex.md#poloniexfetchclosedorders)
* [probit](/exchanges/probit.md#probitfetchclosedorders)
* [timex](/exchanges/timex.md#timexfetchclosedorders)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchclosedorders)
* [toobit](/exchanges/toobit.md#toobitfetchclosedorders)
* [upbit](/exchanges/upbit.md#upbitfetchclosedorders)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchclosedorders)
* [whitebit](/exchanges/whitebit.md#whitebitfetchclosedorders)
* [woo](/exchanges/woo.md#woofetchclosedorders)
* [woofipro](/exchanges/woofipro.md#woofiprofetchclosedorders)
* [xt](/exchanges/xt.md#xtfetchclosedorders)
* [zaif](/exchanges/zaif.md#zaiffetchclosedorders)

---

<a name="fetchClosedOrdersWs" id="fetchclosedordersws"></a>

## fetchClosedOrdersWs
fetches information on multiple closed orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [gate](/exchanges/gate.md#gatefetchclosedordersws)

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
* [binance](/exchanges/binance.md#binancefetchconvertcurrencies)
* [bitget](/exchanges/bitget.md#bitgetfetchconvertcurrencies)
* [bybit](/exchanges/bybit.md#bybitfetchconvertcurrencies)
* [okx](/exchanges/okx.md#okxfetchconvertcurrencies)
* [woo](/exchanges/woo.md#woofetchconvertcurrencies)

---

<a name="fetchConvertQuote" id="fetchconvertquote"></a>

## fetchConvertQuote
fetch a quote for converting from one currency to another

**Kind**: instance   
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| fromCode | <code>string</code> | Yes | the currency that you want to sell and convert from |
| toCode | <code>string</code> | Yes | the currency that you want to buy and convert into |
| amount | <code>float</code> | Yes | how much you want to trade in units of the from currency |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.walletType | <code>string</code> | No | either 'SPOT' or 'FUNDING', the default is 'SPOT' |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchconvertquote)
* [bitget](/exchanges/bitget.md#bitgetfetchconvertquote)
* [bybit](/exchanges/bybit.md#bybitfetchconvertquote)
* [coinbase](/exchanges/coinbase.md#coinbasefetchconvertquote)
* [okx](/exchanges/okx.md#okxfetchconvertquote)
* [phemex](/exchanges/phemex.md#phemexfetchconvertquote)
* [whitebit](/exchanges/whitebit.md#whitebitfetchconvertquote)
* [woo](/exchanges/woo.md#woofetchconvertquote)

---

<a name="fetchConvertTrade" id="fetchconverttrade"></a>

## fetchConvertTrade
fetch the data for a conversion trade

**Kind**: instance   
**Returns**: <code>object</code> - a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the id of the trade that you want to fetch |
| code | <code>string</code> | No | the unified currency code of the conversion trade |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchconverttrade)
* [bybit](/exchanges/bybit.md#bybitfetchconverttrade)
* [coinbase](/exchanges/coinbase.md#coinbasefetchconverttrade)
* [okx](/exchanges/okx.md#okxfetchconverttrade)
* [woo](/exchanges/woo.md#woofetchconverttrade)

---

<a name="fetchConvertTradeHistory" id="fetchconverttradehistory"></a>

## fetchConvertTradeHistory
fetch the users history of conversion trades

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [conversion structures](https://docs.ccxt.com/#/?id=conversion-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | the unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch conversions for |
| limit | <code>int</code> | No | the maximum number of conversion structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest conversion to fetch |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchconverttradehistory)
* [bitget](/exchanges/bitget.md#bitgetfetchconverttradehistory)
* [bybit](/exchanges/bybit.md#bybitfetchconverttradehistory)
* [okx](/exchanges/okx.md#okxfetchconverttradehistory)
* [phemex](/exchanges/phemex.md#phemexfetchconverttradehistory)
* [whitebit](/exchanges/whitebit.md#whitebitfetchconverttradehistory)
* [woo](/exchanges/woo.md#woofetchconverttradehistory)

---

<a name="fetchCrossBorrowRate" id="fetchcrossborrowrate"></a>

## fetchCrossBorrowRate
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance   
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/#/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchcrossborrowrate)
* [bitget](/exchanges/bitget.md#bitgetfetchcrossborrowrate)
* [bybit](/exchanges/bybit.md#bybitfetchcrossborrowrate)
* [digifinex](/exchanges/digifinex.md#digifinexfetchcrossborrowrate)
* [okx](/exchanges/okx.md#okxfetchcrossborrowrate)
* [whitebit](/exchanges/whitebit.md#whitebitfetchcrossborrowrate)

---

<a name="fetchCrossBorrowRates" id="fetchcrossborrowrates"></a>

## fetchCrossBorrowRates
fetch the borrow interest rates of all currencies

**Kind**: instance   
**Returns**: <code>object</code> - a list of [borrow rate structures](https://docs.ccxt.com/#/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [digifinex](/exchanges/digifinex.md#digifinexfetchcrossborrowrates)
* [okx](/exchanges/okx.md#okxfetchcrossborrowrates)

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
* [apex](/exchanges/apex.md#apexfetchcurrencies)
* [ascendex](/exchanges/ascendex.md#ascendexfetchcurrencies)
* [backpack](/exchanges/backpack.md#backpackfetchcurrencies)
* [bigone](/exchanges/bigone.md#bigonefetchcurrencies)
* [binance](/exchanges/binance.md#binancefetchcurrencies)
* [bingx](/exchanges/bingx.md#bingxfetchcurrencies)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchcurrencies)
* [bitget](/exchanges/bitget.md#bitgetfetchcurrencies)
* [bitmart](/exchanges/bitmart.md#bitmartfetchcurrencies)
* [bitmex](/exchanges/bitmex.md#bitmexfetchcurrencies)
* [bitopro](/exchanges/bitopro.md#bitoprofetchcurrencies)
* [bitrue](/exchanges/bitrue.md#bitruefetchcurrencies)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchcurrencies)
* [bitteam](/exchanges/bitteam.md#bitteamfetchcurrencies)
* [bittrade](/exchanges/bittrade.md#bittradefetchcurrencies)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchcurrencies)
* [bybit](/exchanges/bybit.md#bybitfetchcurrencies)
* [cex](/exchanges/cex.md#cexfetchcurrencies)
* [coinbase](/exchanges/coinbase.md#coinbasefetchcurrencies)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchcurrencies)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchcurrencies)
* [coincatch](/exchanges/coincatch.md#coincatchfetchcurrencies)
* [coinex](/exchanges/coinex.md#coinexfetchcurrencies)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchcurrencies)
* [coinone](/exchanges/coinone.md#coinonefetchcurrencies)
* [coinsph](/exchanges/coinsph.md#coinsphfetchcurrencies)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchcurrencies)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchcurrencies)
* [delta](/exchanges/delta.md#deltafetchcurrencies)
* [deribit](/exchanges/deribit.md#deribitfetchcurrencies)
* [derive](/exchanges/derive.md#derivefetchcurrencies)
* [digifinex](/exchanges/digifinex.md#digifinexfetchcurrencies)
* [exmo](/exchanges/exmo.md#exmofetchcurrencies)
* [gate](/exchanges/gate.md#gatefetchcurrencies)
* [gemini](/exchanges/gemini.md#geminifetchcurrencies)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchcurrencies)
* [hibachi](/exchanges/hibachi.md#hibachifetchcurrencies)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchcurrencies)
* [hollaex](/exchanges/hollaex.md#hollaexfetchcurrencies)
* [htx](/exchanges/htx.md#htxfetchcurrencies)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchcurrencies)
* [kraken](/exchanges/kraken.md#krakenfetchcurrencies)
* [kucoin](/exchanges/kucoin.md#kucoinfetchcurrencies)
* [latoken](/exchanges/latoken.md#latokenfetchcurrencies)
* [lbank](/exchanges/lbank.md#lbankfetchcurrencies)
* [luno](/exchanges/luno.md#lunofetchcurrencies)
* [mexc](/exchanges/mexc.md#mexcfetchcurrencies)
* [modetrade](/exchanges/modetrade.md#modetradefetchcurrencies)
* [ndax](/exchanges/ndax.md#ndaxfetchcurrencies)
* [okcoin](/exchanges/okcoin.md#okcoinfetchcurrencies)
* [okx](/exchanges/okx.md#okxfetchcurrencies)
* [onetrading](/exchanges/onetrading.md#onetradingfetchcurrencies)
* [oxfun](/exchanges/oxfun.md#oxfunfetchcurrencies)
* [phemex](/exchanges/phemex.md#phemexfetchcurrencies)
* [poloniex](/exchanges/poloniex.md#poloniexfetchcurrencies)
* [probit](/exchanges/probit.md#probitfetchcurrencies)
* [timex](/exchanges/timex.md#timexfetchcurrencies)
* [toobit](/exchanges/toobit.md#toobitfetchcurrencies)
* [whitebit](/exchanges/whitebit.md#whitebitfetchcurrencies)
* [woo](/exchanges/woo.md#woofetchcurrencies)
* [woofipro](/exchanges/woofipro.md#woofiprofetchcurrencies)
* [xt](/exchanges/xt.md#xtfetchcurrencies)

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
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchcurrenciesws)

---

<a name="fetchDeposit" id="fetchdeposit"></a>

## fetchDeposit
fetch information on a deposit

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | deposit id |
| code | <code>string</code> | Yes | not used by bitmart fetchDeposit () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#bitmartfetchdeposit)
* [bitso](/exchanges/bitso.md#bitsofetchdeposit)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchdeposit)
* [coinbase](/exchanges/coinbase.md#coinbasefetchdeposit)
* [exmo](/exchanges/exmo.md#exmofetchdeposit)
* [okx](/exchanges/okx.md#okxfetchdeposit)
* [upbit](/exchanges/upbit.md#upbitfetchdeposit)
* [whitebit](/exchanges/whitebit.md#whitebitfetchdeposit)

---

<a name="fetchDepositAddress" id="fetchdepositaddress"></a>

## fetchDepositAddress
fetch the deposit address for a currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - an [address structure](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchdepositaddress)
* [ascendex](/exchanges/ascendex.md#ascendexfetchdepositaddress)
* [backpack](/exchanges/backpack.md#backpackfetchdepositaddress)
* [bigone](/exchanges/bigone.md#bigonefetchdepositaddress)
* [binance](/exchanges/binance.md#binancefetchdepositaddress)
* [bingx](/exchanges/bingx.md#bingxfetchdepositaddress)
* [bit2c](/exchanges/bit2c.md#bit2cfetchdepositaddress)
* [bitbank](/exchanges/bitbank.md#bitbankfetchdepositaddress)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchdepositaddress)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchdepositaddress)
* [bitget](/exchanges/bitget.md#bitgetfetchdepositaddress)
* [bitmart](/exchanges/bitmart.md#bitmartfetchdepositaddress)
* [bitmex](/exchanges/bitmex.md#bitmexfetchdepositaddress)
* [bitso](/exchanges/bitso.md#bitsofetchdepositaddress)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchdepositaddress)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchdepositaddress)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchdepositaddress)
* [bybit](/exchanges/bybit.md#bybitfetchdepositaddress)
* [cex](/exchanges/cex.md#cexfetchdepositaddress)
* [coinbase](/exchanges/coinbase.md#coinbasefetchdepositaddress)
* [coincatch](/exchanges/coincatch.md#coincatchfetchdepositaddress)
* [coinex](/exchanges/coinex.md#coinexfetchdepositaddress)
* [coinsph](/exchanges/coinsph.md#coinsphfetchdepositaddress)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchdepositaddress)
* [delta](/exchanges/delta.md#deltafetchdepositaddress)
* [deribit](/exchanges/deribit.md#deribitfetchdepositaddress)
* [digifinex](/exchanges/digifinex.md#digifinexfetchdepositaddress)
* [exmo](/exchanges/exmo.md#exmofetchdepositaddress)
* [foxbit](/exchanges/foxbit.md#foxbitfetchdepositaddress)
* [gate](/exchanges/gate.md#gatefetchdepositaddress)
* [gemini](/exchanges/gemini.md#geminifetchdepositaddress)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchdepositaddress)
* [hibachi](/exchanges/hibachi.md#hibachifetchdepositaddress)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchdepositaddress)
* [htx](/exchanges/htx.md#htxfetchdepositaddress)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchdepositaddress)
* [kraken](/exchanges/kraken.md#krakenfetchdepositaddress)
* [kucoin](/exchanges/kucoin.md#kucoinfetchdepositaddress)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchdepositaddress)
* [lbank](/exchanges/lbank.md#lbankfetchdepositaddress)
* [luno](/exchanges/luno.md#lunofetchdepositaddress)
* [mexc](/exchanges/mexc.md#mexcfetchdepositaddress)
* [ndax](/exchanges/ndax.md#ndaxfetchdepositaddress)
* [okcoin](/exchanges/okcoin.md#okcoinfetchdepositaddress)
* [okx](/exchanges/okx.md#okxfetchdepositaddress)
* [oxfun](/exchanges/oxfun.md#oxfunfetchdepositaddress)
* [paymium](/exchanges/paymium.md#paymiumfetchdepositaddress)
* [phemex](/exchanges/phemex.md#phemexfetchdepositaddress)
* [poloniex](/exchanges/poloniex.md#poloniexfetchdepositaddress)
* [probit](/exchanges/probit.md#probitfetchdepositaddress)
* [timex](/exchanges/timex.md#timexfetchdepositaddress)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchdepositaddress)
* [toobit](/exchanges/toobit.md#toobitfetchdepositaddress)
* [upbit](/exchanges/upbit.md#upbitfetchdepositaddress)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchdepositaddress)
* [whitebit](/exchanges/whitebit.md#whitebitfetchdepositaddress)
* [woo](/exchanges/woo.md#woofetchdepositaddress)
* [xt](/exchanges/xt.md#xtfetchdepositaddress)
* [yobit](/exchanges/yobit.md#yobitfetchdepositaddress)
* [zonda](/exchanges/zonda.md#zondafetchdepositaddress)

---

<a name="fetchDepositAddresses" id="fetchdepositaddresses"></a>

## fetchDepositAddresses
fetch deposit addresses for multiple currencies and chain types

**Kind**: instance   
**Returns**: <code>object</code> - a list of [address structures](https://docs.ccxt.com/#/?id=address-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinone](/exchanges/coinone.md#coinonefetchdepositaddresses)
* [hollaex](/exchanges/hollaex.md#hollaexfetchdepositaddresses)
* [indodax](/exchanges/indodax.md#indodaxfetchdepositaddresses)
* [paymium](/exchanges/paymium.md#paymiumfetchdepositaddresses)
* [probit](/exchanges/probit.md#probitfetchdepositaddresses)
* [upbit](/exchanges/upbit.md#upbitfetchdepositaddresses)
* [zonda](/exchanges/zonda.md#zondafetchdepositaddresses)

---

<a name="fetchDepositAddressesByNetwork" id="fetchdepositaddressesbynetwork"></a>

## fetchDepositAddressesByNetwork
fetch the deposit addresses for a currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary [address structures](https://docs.ccxt.com/#/?id=address-structure), indexed by the network


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#bingxfetchdepositaddressesbynetwork)
* [bybit](/exchanges/bybit.md#bybitfetchdepositaddressesbynetwork)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchdepositaddressesbynetwork)
* [gate](/exchanges/gate.md#gatefetchdepositaddressesbynetwork)
* [gemini](/exchanges/gemini.md#geminifetchdepositaddressesbynetwork)
* [htx](/exchanges/htx.md#htxfetchdepositaddressesbynetwork)
* [kucoin](/exchanges/kucoin.md#kucoinfetchdepositaddressesbynetwork)
* [mexc](/exchanges/mexc.md#mexcfetchdepositaddressesbynetwork)
* [oceanex](/exchanges/oceanex.md#oceanexfetchdepositaddressesbynetwork)
* [okcoin](/exchanges/okcoin.md#okcoinfetchdepositaddressesbynetwork)
* [okx](/exchanges/okx.md#okxfetchdepositaddressesbynetwork)

---

<a name="fetchDepositMethodId" id="fetchdepositmethodid"></a>

## fetchDepositMethodId
fetch the deposit id for a fiat currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - a [deposit id structure](https://docs.ccxt.com/#/?id=deposit-id-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the deposit payment method id |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#coinbasefetchdepositmethodid)

---

<a name="fetchDepositMethodIds" id="fetchdepositmethodids"></a>

## fetchDepositMethodIds
fetch the deposit id for a fiat currency associated with this account

**Kind**: instance   
**Returns**: <code>object</code> - an array of [deposit id structures](https://docs.ccxt.com/#/?id=deposit-id-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#coinbasefetchdepositmethodids)

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
* [kraken](/exchanges/kraken.md#krakenfetchdepositmethods)

---

<a name="fetchDepositWithdrawFee" id="fetchdepositwithdrawfee"></a>

## fetchDepositWithdrawFee
fetch the fee for deposits and withdrawals

**Kind**: instance   
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network code of the currency |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#bitmartfetchdepositwithdrawfee)
* [coinex](/exchanges/coinex.md#coinexfetchdepositwithdrawfee)
* [kucoin](/exchanges/kucoin.md#kucoinfetchdepositwithdrawfee)

---

<a name="fetchDepositWithdrawFees" id="fetchdepositwithdrawfees"></a>

## fetchDepositWithdrawFees
fetch deposit and withdraw fees

**Kind**: instance   
**Returns**: <code>object</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified currency codes |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchdepositwithdrawfees)
* [binance](/exchanges/binance.md#binancefetchdepositwithdrawfees)
* [bingx](/exchanges/bingx.md#bingxfetchdepositwithdrawfees)
* [bitget](/exchanges/bitget.md#bitgetfetchdepositwithdrawfees)
* [bitmex](/exchanges/bitmex.md#bitmexfetchdepositwithdrawfees)
* [bitopro](/exchanges/bitopro.md#bitoprofetchdepositwithdrawfees)
* [bitrue](/exchanges/bitrue.md#bitruefetchdepositwithdrawfees)
* [bitso](/exchanges/bitso.md#bitsofetchdepositwithdrawfees)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchdepositwithdrawfees)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchdepositwithdrawfees)
* [bybit](/exchanges/bybit.md#bybitfetchdepositwithdrawfees)
* [coincatch](/exchanges/coincatch.md#coincatchfetchdepositwithdrawfees)
* [coinex](/exchanges/coinex.md#coinexfetchdepositwithdrawfees)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchdepositwithdrawfees)
* [deribit](/exchanges/deribit.md#deribitfetchdepositwithdrawfees)
* [digifinex](/exchanges/digifinex.md#digifinexfetchdepositwithdrawfees)
* [exmo](/exchanges/exmo.md#exmofetchdepositwithdrawfees)
* [gate](/exchanges/gate.md#gatefetchdepositwithdrawfees)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchdepositwithdrawfees)
* [hollaex](/exchanges/hollaex.md#hollaexfetchdepositwithdrawfees)
* [htx](/exchanges/htx.md#htxfetchdepositwithdrawfees)
* [kucoin](/exchanges/kucoin.md#kucoinfetchdepositwithdrawfees)
* [lbank](/exchanges/lbank.md#lbankfetchdepositwithdrawfees)
* [mexc](/exchanges/mexc.md#mexcfetchdepositwithdrawfees)
* [okx](/exchanges/okx.md#okxfetchdepositwithdrawfees)
* [poloniex](/exchanges/poloniex.md#poloniexfetchdepositwithdrawfees)
* [probit](/exchanges/probit.md#probitfetchdepositwithdrawfees)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchdepositwithdrawfees)
* [whitebit](/exchanges/whitebit.md#whitebitfetchdepositwithdrawfees)

---

<a name="fetchDeposits" id="fetchdeposits"></a>

## fetchDeposits
fetch all deposits made to an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposit structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchdeposits)
* [ascendex](/exchanges/ascendex.md#ascendexfetchdeposits)
* [backpack](/exchanges/backpack.md#backpackfetchdeposits)
* [bigone](/exchanges/bigone.md#bigonefetchdeposits)
* [binance](/exchanges/binance.md#binancefetchdeposits)
* [bingx](/exchanges/bingx.md#bingxfetchdeposits)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchdeposits)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchdeposits)
* [bitget](/exchanges/bitget.md#bitgetfetchdeposits)
* [bitmart](/exchanges/bitmart.md#bitmartfetchdeposits)
* [bitopro](/exchanges/bitopro.md#bitoprofetchdeposits)
* [bitrue](/exchanges/bitrue.md#bitruefetchdeposits)
* [bitso](/exchanges/bitso.md#bitsofetchdeposits)
* [bittrade](/exchanges/bittrade.md#bittradefetchdeposits)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchdeposits)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchdeposits)
* [blofin](/exchanges/blofin.md#blofinfetchdeposits)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchdeposits)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchdeposits)
* [bybit](/exchanges/bybit.md#bybitfetchdeposits)
* [coinbase](/exchanges/coinbase.md#coinbasefetchdeposits)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchdeposits)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchdeposits)
* [coincatch](/exchanges/coincatch.md#coincatchfetchdeposits)
* [coincheck](/exchanges/coincheck.md#coincheckfetchdeposits)
* [coinex](/exchanges/coinex.md#coinexfetchdeposits)
* [coinsph](/exchanges/coinsph.md#coinsphfetchdeposits)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchdeposits)
* [deribit](/exchanges/deribit.md#deribitfetchdeposits)
* [derive](/exchanges/derive.md#derivefetchdeposits)
* [digifinex](/exchanges/digifinex.md#digifinexfetchdeposits)
* [exmo](/exchanges/exmo.md#exmofetchdeposits)
* [foxbit](/exchanges/foxbit.md#foxbitfetchdeposits)
* [gate](/exchanges/gate.md#gatefetchdeposits)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchdeposits)
* [hibachi](/exchanges/hibachi.md#hibachifetchdeposits)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchdeposits)
* [hollaex](/exchanges/hollaex.md#hollaexfetchdeposits)
* [htx](/exchanges/htx.md#htxfetchdeposits)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchdeposits)
* [kraken](/exchanges/kraken.md#krakenfetchdeposits)
* [kucoin](/exchanges/kucoin.md#kucoinfetchdeposits)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchdeposits)
* [lbank](/exchanges/lbank.md#lbankfetchdeposits)
* [mexc](/exchanges/mexc.md#mexcfetchdeposits)
* [modetrade](/exchanges/modetrade.md#modetradefetchdeposits)
* [ndax](/exchanges/ndax.md#ndaxfetchdeposits)
* [novadax](/exchanges/novadax.md#novadaxfetchdeposits)
* [okcoin](/exchanges/okcoin.md#okcoinfetchdeposits)
* [okx](/exchanges/okx.md#okxfetchdeposits)
* [oxfun](/exchanges/oxfun.md#oxfunfetchdeposits)
* [phemex](/exchanges/phemex.md#phemexfetchdeposits)
* [poloniex](/exchanges/poloniex.md#poloniexfetchdeposits)
* [probit](/exchanges/probit.md#probitfetchdeposits)
* [timex](/exchanges/timex.md#timexfetchdeposits)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchdeposits)
* [toobit](/exchanges/toobit.md#toobitfetchdeposits)
* [upbit](/exchanges/upbit.md#upbitfetchdeposits)
* [whitebit](/exchanges/whitebit.md#whitebitfetchdeposits)
* [woo](/exchanges/woo.md#woofetchdeposits)
* [woofipro](/exchanges/woofipro.md#woofiprofetchdeposits)
* [xt](/exchanges/xt.md#xtfetchdeposits)

---

<a name="fetchDepositsWithdrawals" id="fetchdepositswithdrawals"></a>

## fetchDepositsWithdrawals
fetch history of deposits and withdrawals

**Kind**: instance   
**Returns**: <code>object</code> - a list of [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code for the currency of the deposit/withdrawals, default is undefined |
| since | <code>int</code> | No | timestamp in ms of the earliest deposit/withdrawal, default is undefined |
| limit | <code>int</code> | No | max number of deposit/withdrawals to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchdepositswithdrawals)
* [ascendex](/exchanges/ascendex.md#ascendexfetchdepositswithdrawals)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchdepositswithdrawals)
* [bitmex](/exchanges/bitmex.md#bitmexfetchdepositswithdrawals)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchdepositswithdrawals)
* [bitteam](/exchanges/bitteam.md#bitteamfetchdepositswithdrawals)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchdepositswithdrawals)
* [cex](/exchanges/cex.md#cexfetchdepositswithdrawals)
* [coinbase](/exchanges/coinbase.md#coinbasefetchdepositswithdrawals)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchdepositswithdrawals)
* [exchange](/exchanges/exchange.md#exchangefetchdepositswithdrawals)
* [coinmate](/exchanges/coinmate.md#coinmatefetchdepositswithdrawals)
* [exmo](/exchanges/exmo.md#exmofetchdepositswithdrawals)
* [gemini](/exchanges/gemini.md#geminifetchdepositswithdrawals)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchdepositswithdrawals)
* [indodax](/exchanges/indodax.md#indodaxfetchdepositswithdrawals)
* [modetrade](/exchanges/modetrade.md#modetradefetchdepositswithdrawals)
* [novadax](/exchanges/novadax.md#novadaxfetchdepositswithdrawals)
* [poloniex](/exchanges/poloniex.md#poloniexfetchdepositswithdrawals)
* [probit](/exchanges/probit.md#probitfetchdepositswithdrawals)
* [whitebit](/exchanges/whitebit.md#whitebitfetchdepositswithdrawals)
* [woo](/exchanges/woo.md#woofetchdepositswithdrawals)
* [woofipro](/exchanges/woofipro.md#woofiprofetchdepositswithdrawals)

---

<a name="fetchDepositsWs" id="fetchdepositsws"></a>

## fetchDepositsWs
fetch all deposits made to an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch deposits for |
| limit | <code>int</code> | No | the maximum number of deposits structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchdepositsws)

---

<a name="fetchFundingHistory" id="fetchfundinghistory"></a>

## fetchFundingHistory
fetches information on multiple orders made by the user *classic accounts only*

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=funding-history-structure)


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
* [apex](/exchanges/apex.md#apexfetchfundinghistory)
* [ascendex](/exchanges/ascendex.md#ascendexfetchfundinghistory)
* [backpack](/exchanges/backpack.md#backpackfetchfundinghistory)
* [binance](/exchanges/binance.md#binancefetchfundinghistory)
* [bitget](/exchanges/bitget.md#bitgetfetchfundinghistory)
* [bitmart](/exchanges/bitmart.md#bitmartfetchfundinghistory)
* [bybit](/exchanges/bybit.md#bybitfetchfundinghistory)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchfundinghistory)
* [coinex](/exchanges/coinex.md#coinexfetchfundinghistory)
* [derive](/exchanges/derive.md#derivefetchfundinghistory)
* [digifinex](/exchanges/digifinex.md#digifinexfetchfundinghistory)
* [gate](/exchanges/gate.md#gatefetchfundinghistory)
* [htx](/exchanges/htx.md#htxfetchfundinghistory)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchfundinghistory)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchfundinghistory)
* [mexc](/exchanges/mexc.md#mexcfetchfundinghistory)
* [modetrade](/exchanges/modetrade.md#modetradefetchfundinghistory)
* [okx](/exchanges/okx.md#okxfetchfundinghistory)
* [oxfun](/exchanges/oxfun.md#oxfunfetchfundinghistory)
* [phemex](/exchanges/phemex.md#phemexfetchfundinghistory)
* [whitebit](/exchanges/whitebit.md#whitebitfetchfundinghistory)
* [woo](/exchanges/woo.md#woofetchfundinghistory)
* [woofipro](/exchanges/woofipro.md#woofiprofetchfundinghistory)
* [xt](/exchanges/xt.md#xtfetchfundinghistory)

---

<a name="fetchFundingInterval" id="fetchfundinginterval"></a>

## fetchFundingInterval
fetch the current funding rate interval

**Kind**: instance   
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#bitgetfetchfundinginterval)
* [coinex](/exchanges/coinex.md#coinexfetchfundinginterval)
* [digifinex](/exchanges/digifinex.md#digifinexfetchfundinginterval)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchfundinginterval)
* [mexc](/exchanges/mexc.md#mexcfetchfundinginterval)
* [modetrade](/exchanges/modetrade.md#modetradefetchfundinginterval)
* [okx](/exchanges/okx.md#okxfetchfundinginterval)
* [woo](/exchanges/woo.md#woofetchfundinginterval)
* [woofipro](/exchanges/woofipro.md#woofiprofetchfundinginterval)
* [xt](/exchanges/xt.md#xtfetchfundinginterval)

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
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchfundingintervals)

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
* [backpack](/exchanges/backpack.md#backpackfetchfundingrate)
* [binance](/exchanges/binance.md#binancefetchfundingrate)
* [bingx](/exchanges/bingx.md#bingxfetchfundingrate)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchfundingrate)
* [bitget](/exchanges/bitget.md#bitgetfetchfundingrate)
* [bitmart](/exchanges/bitmart.md#bitmartfetchfundingrate)
* [blofin](/exchanges/blofin.md#blofinfetchfundingrate)
* [coincatch](/exchanges/coincatch.md#coincatchfetchfundingrate)
* [coinex](/exchanges/coinex.md#coinexfetchfundingrate)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchfundingrate)
* [defx](/exchanges/defx.md#defxfetchfundingrate)
* [delta](/exchanges/delta.md#deltafetchfundingrate)
* [deribit](/exchanges/deribit.md#deribitfetchfundingrate)
* [derive](/exchanges/derive.md#derivefetchfundingrate)
* [digifinex](/exchanges/digifinex.md#digifinexfetchfundingrate)
* [gate](/exchanges/gate.md#gatefetchfundingrate)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchfundingrate)
* [hibachi](/exchanges/hibachi.md#hibachifetchfundingrate)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchfundingrate)
* [htx](/exchanges/htx.md#htxfetchfundingrate)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchfundingrate)
* [lbank](/exchanges/lbank.md#lbankfetchfundingrate)
* [mexc](/exchanges/mexc.md#mexcfetchfundingrate)
* [modetrade](/exchanges/modetrade.md#modetradefetchfundingrate)
* [okx](/exchanges/okx.md#okxfetchfundingrate)
* [oxfun](/exchanges/oxfun.md#oxfunfetchfundingrate)
* [phemex](/exchanges/phemex.md#phemexfetchfundingrate)
* [whitebit](/exchanges/whitebit.md#whitebitfetchfundingrate)
* [woo](/exchanges/woo.md#woofetchfundingrate)
* [woofipro](/exchanges/woofipro.md#woofiprofetchfundingrate)
* [xt](/exchanges/xt.md#xtfetchfundingrate)

---

<a name="fetchFundingRateHistory" id="fetchfundingratehistory"></a>

## fetchFundingRateHistory
fetches historical funding rate prices

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the funding rate history for |
| since | <code>int</code> | No | timestamp in ms of the earliest funding rate to fetch |
| limit | <code>int</code> | No | the maximum amount of [funding rate structures](https://docs.ccxt.com/#/?id=funding-rate-history-structure) to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest funding rate |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexfetchfundingratehistory)
* [backpack](/exchanges/backpack.md#backpackfetchfundingratehistory)
* [binance](/exchanges/binance.md#binancefetchfundingratehistory)
* [bingx](/exchanges/bingx.md#bingxfetchfundingratehistory)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchfundingratehistory)
* [bitget](/exchanges/bitget.md#bitgetfetchfundingratehistory)
* [bitmart](/exchanges/bitmart.md#bitmartfetchfundingratehistory)
* [bitmex](/exchanges/bitmex.md#bitmexfetchfundingratehistory)
* [blofin](/exchanges/blofin.md#blofinfetchfundingratehistory)
* [bybit](/exchanges/bybit.md#bybitfetchfundingratehistory)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchfundingratehistory)
* [coincatch](/exchanges/coincatch.md#coincatchfetchfundingratehistory)
* [coinex](/exchanges/coinex.md#coinexfetchfundingratehistory)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchfundingratehistory)
* [deribit](/exchanges/deribit.md#deribitfetchfundingratehistory)
* [derive](/exchanges/derive.md#derivefetchfundingratehistory)
* [digifinex](/exchanges/digifinex.md#digifinexfetchfundingratehistory)
* [gate](/exchanges/gate.md#gatefetchfundingratehistory)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchfundingratehistory)
* [hibachi](/exchanges/hibachi.md#hibachifetchfundingratehistory)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchfundingratehistory)
* [htx](/exchanges/htx.md#htxfetchfundingratehistory)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchfundingratehistory)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchfundingratehistory)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchfundingratehistory)
* [mexc](/exchanges/mexc.md#mexcfetchfundingratehistory)
* [modetrade](/exchanges/modetrade.md#modetradefetchfundingratehistory)
* [okx](/exchanges/okx.md#okxfetchfundingratehistory)
* [oxfun](/exchanges/oxfun.md#oxfunfetchfundingratehistory)
* [phemex](/exchanges/phemex.md#phemexfetchfundingratehistory)
* [toobit](/exchanges/toobit.md#toobitfetchfundingratehistory)
* [woo](/exchanges/woo.md#woofetchfundingratehistory)
* [woofipro](/exchanges/woofipro.md#woofiprofetchfundingratehistory)
* [xt](/exchanges/xt.md#xtfetchfundingratehistory)

---

<a name="fetchFundingRates" id="fetchfundingrates"></a>

## fetchFundingRates
fetch the funding rate for multiple markets

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [funding rates structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexe by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchfundingrates)
* [binance](/exchanges/binance.md#binancefetchfundingrates)
* [bingx](/exchanges/bingx.md#bingxfetchfundingrates)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchfundingrates)
* [bitget](/exchanges/bitget.md#bitgetfetchfundingrates)
* [bitmex](/exchanges/bitmex.md#bitmexfetchfundingrates)
* [bybit](/exchanges/bybit.md#bybitfetchfundingrates)
* [coinex](/exchanges/coinex.md#coinexfetchfundingrates)
* [delta](/exchanges/delta.md#deltafetchfundingrates)
* [gate](/exchanges/gate.md#gatefetchfundingrates)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchfundingrates)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchfundingrates)
* [htx](/exchanges/htx.md#htxfetchfundingrates)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchfundingrates)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchfundingrates)
* [lbank](/exchanges/lbank.md#lbankfetchfundingrates)
* [modetrade](/exchanges/modetrade.md#modetradefetchfundingrates)
* [okx](/exchanges/okx.md#okxfetchfundingrates)
* [oxfun](/exchanges/oxfun.md#oxfunfetchfundingrates)
* [toobit](/exchanges/toobit.md#toobitfetchfundingrates)
* [whitebit](/exchanges/whitebit.md#whitebitfetchfundingrates)
* [woo](/exchanges/woo.md#woofetchfundingrates)
* [woofipro](/exchanges/woofipro.md#woofiprofetchfundingrates)

---

<a name="fetchGreeks" id="fetchgreeks"></a>

## fetchGreeks
fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract

**Kind**: instance   
**Returns**: <code>object</code> - a [greeks structure](https://docs.ccxt.com/#/?id=greeks-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch greeks for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchgreeks)
* [bybit](/exchanges/bybit.md#bybitfetchgreeks)
* [delta](/exchanges/delta.md#deltafetchgreeks)
* [deribit](/exchanges/deribit.md#deribitfetchgreeks)
* [gate](/exchanges/gate.md#gatefetchgreeks)
* [okx](/exchanges/okx.md#okxfetchgreeks)
* [paradex](/exchanges/paradex.md#paradexfetchgreeks)

---

<a name="fetchIsolatedBorrowRate" id="fetchisolatedborrowrate"></a>

## fetchIsolatedBorrowRate
fetch the rate of interest to borrow a currency for margin trading

**Kind**: instance   
**Returns**: <code>object</code> - an [isolated borrow rate structure](https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint EXCHANGE SPECIFIC PARAMETERS |
| params.vipLevel | <code>object</code> | No | user's current specific margin data will be returned if viplevel is omitted |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchisolatedborrowrate)
* [bitget](/exchanges/bitget.md#bitgetfetchisolatedborrowrate)
* [bitmart](/exchanges/bitmart.md#bitmartfetchisolatedborrowrate)
* [coinex](/exchanges/coinex.md#coinexfetchisolatedborrowrate)

---

<a name="fetchIsolatedBorrowRates" id="fetchisolatedborrowrates"></a>

## fetchIsolatedBorrowRates
fetch the borrow interest rates of all currencies

**Kind**: instance   
**Returns**: <code>object</code> - a [borrow rate structure](https://docs.ccxt.com/#/?id=borrow-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.symbol | <code>object</code> | No | unified market symbol EXCHANGE SPECIFIC PARAMETERS |
| params.vipLevel | <code>object</code> | No | user's current specific margin data will be returned if viplevel is omitted |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchisolatedborrowrates)
* [bitmart](/exchanges/bitmart.md#bitmartfetchisolatedborrowrates)
* [htx](/exchanges/htx.md#htxfetchisolatedborrowrates)

---

<a name="fetchL3OrderBook" id="fetchl3orderbook"></a>

## fetchL3OrderBook
fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| limit | <code>int</code> | No | max number of orders to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchl3orderbook)

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
* [binance](/exchanges/binance.md#binancefetchlastprices)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchlastprices)
* [htx](/exchanges/htx.md#htxfetchlastprices)
* [toobit](/exchanges/toobit.md#toobitfetchlastprices)

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
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch the ledger for a portfolio margin account |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchledger)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchledger)
* [bitget](/exchanges/bitget.md#bitgetfetchledger)
* [bitmart](/exchanges/bitmart.md#bitmartfetchledger)
* [bitmex](/exchanges/bitmex.md#bitmexfetchledger)
* [bitso](/exchanges/bitso.md#bitsofetchledger)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchledger)
* [blofin](/exchanges/blofin.md#blofinfetchledger)
* [bybit](/exchanges/bybit.md#bybitfetchledger)
* [cex](/exchanges/cex.md#cexfetchledger)
* [coinbase](/exchanges/coinbase.md#coinbasefetchledger)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchledger)
* [coincatch](/exchanges/coincatch.md#coincatchfetchledger)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchledger)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchledger)
* [defx](/exchanges/defx.md#defxfetchledger)
* [delta](/exchanges/delta.md#deltafetchledger)
* [digifinex](/exchanges/digifinex.md#digifinexfetchledger)
* [foxbit](/exchanges/foxbit.md#foxbitfetchledger)
* [gate](/exchanges/gate.md#gatefetchledger)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchledger)
* [hibachi](/exchanges/hibachi.md#hibachifetchledger)
* [htx](/exchanges/htx.md#htxfetchledger)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchledger)
* [kraken](/exchanges/kraken.md#krakenfetchledger)
* [kucoin](/exchanges/kucoin.md#kucoinfetchledger)
* [luno](/exchanges/luno.md#lunofetchledger)
* [modetrade](/exchanges/modetrade.md#modetradefetchledger)
* [ndax](/exchanges/ndax.md#ndaxfetchledger)
* [okcoin](/exchanges/okcoin.md#okcoinfetchledger)
* [okx](/exchanges/okx.md#okxfetchledger)
* [toobit](/exchanges/toobit.md#toobitfetchledger)
* [woo](/exchanges/woo.md#woofetchledger)
* [woofipro](/exchanges/woofipro.md#woofiprofetchledger)
* [xt](/exchanges/xt.md#xtfetchledger)
* [zonda](/exchanges/zonda.md#zondafetchledger)

---

<a name="fetchLedgerEntry" id="fetchledgerentry"></a>

## fetchLedgerEntry
fetch the history of changes, actions done by the user or operations that altered the balance of the user

**Kind**: instance   
**Returns**: <code>object</code> - a [ledger structure](https://docs.ccxt.com/#/?id=ledger)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the identification number of the ledger entry |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchledgerentry)

---

<a name="fetchLeverage" id="fetchleverage"></a>

## fetchLeverage
fetch the set leverage for a market

**Kind**: instance   
**Returns**: <code>object</code> - a [leverage structure](https://docs.ccxt.com/#/?id=leverage-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#bingxfetchleverage)
* [bitget](/exchanges/bitget.md#bitgetfetchleverage)
* [blofin](/exchanges/blofin.md#blofinfetchleverage)
* [bybit](/exchanges/bybit.md#bybitfetchleverage)
* [coincatch](/exchanges/coincatch.md#coincatchfetchleverage)
* [coinex](/exchanges/coinex.md#coinexfetchleverage)
* [delta](/exchanges/delta.md#deltafetchleverage)
* [gate](/exchanges/gate.md#gatefetchleverage)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchleverage)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchleverage)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchleverage)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchleverage)
* [mexc](/exchanges/mexc.md#mexcfetchleverage)
* [modetrade](/exchanges/modetrade.md#modetradefetchleverage)
* [okx](/exchanges/okx.md#okxfetchleverage)
* [paradex](/exchanges/paradex.md#paradexfetchleverage)
* [poloniex](/exchanges/poloniex.md#poloniexfetchleverage)
* [toobit](/exchanges/toobit.md#toobitfetchleverage)
* [woo](/exchanges/woo.md#woofetchleverage)
* [woofipro](/exchanges/woofipro.md#woofiprofetchleverage)

---

<a name="fetchLeverageTiers" id="fetchleveragetiers"></a>

## fetchLeverageTiers
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [leverage tiers structures](https://docs.ccxt.com/#/?id=leverage-tiers-structure), indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchleveragetiers)
* [binance](/exchanges/binance.md#binancefetchleveragetiers)
* [bybit](/exchanges/bybit.md#bybitfetchleveragetiers)
* [coinex](/exchanges/coinex.md#coinexfetchleveragetiers)
* [digifinex](/exchanges/digifinex.md#digifinexfetchleveragetiers)
* [gate](/exchanges/gate.md#gatefetchleveragetiers)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchleveragetiers)
* [htx](/exchanges/htx.md#htxfetchleveragetiers)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchleveragetiers)
* [mexc](/exchanges/mexc.md#mexcfetchleveragetiers)
* [oxfun](/exchanges/oxfun.md#oxfunfetchleveragetiers)
* [phemex](/exchanges/phemex.md#phemexfetchleveragetiers)
* [xt](/exchanges/xt.md#xtfetchleveragetiers)

---

<a name="fetchLeverages" id="fetchleverages"></a>

## fetchLeverages
fetch the set leverage for all contract markets

**Kind**: instance   
**Returns**: <code>object</code> - a list of [leverage structures](https://docs.ccxt.com/#/?id=leverage-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchleverages)
* [binance](/exchanges/binance.md#binancefetchleverages)
* [bitmex](/exchanges/bitmex.md#bitmexfetchleverages)
* [blofin](/exchanges/blofin.md#blofinfetchleverages)
* [gate](/exchanges/gate.md#gatefetchleverages)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchleverages)

---

<a name="fetchLiquidations" id="fetchliquidations"></a>

## fetchLiquidations
retrieves the public liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters |
| params.until | <code>int</code> | No | timestamp in ms of the latest liquidation |
| params.paginate | <code>boolean</code> | No | default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params) |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchliquidations)
* [bitmex](/exchanges/bitmex.md#bitmexfetchliquidations)
* [deribit](/exchanges/deribit.md#deribitfetchliquidations)
* [gate](/exchanges/gate.md#gatefetchliquidations)
* [htx](/exchanges/htx.md#htxfetchliquidations)
* [paradex](/exchanges/paradex.md#paradexfetchliquidations)

---

<a name="fetchLongShortRatioHistory" id="fetchlongshortratiohistory"></a>

## fetchLongShortRatioHistory
fetches the long short ratio history for a unified market symbol

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of [long short ratio structures](https://docs.ccxt.com/#/?id=long-short-ratio-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the long short ratio for |
| timeframe | <code>string</code> | No | the period for the ratio, default is 24 hours |
| since | <code>int</code> | No | the earliest time in ms to fetch ratios for |
| limit | <code>int</code> | No | the maximum number of long short ratio structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | timestamp in ms of the latest ratio to fetch |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchlongshortratiohistory)
* [bitget](/exchanges/bitget.md#bitgetfetchlongshortratiohistory)
* [bybit](/exchanges/bybit.md#bybitfetchlongshortratiohistory)
* [okx](/exchanges/okx.md#okxfetchlongshortratiohistory)

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
* [binance](/exchanges/binance.md#binancefetchmarginadjustmenthistory)
* [coinex](/exchanges/coinex.md#coinexfetchmarginadjustmenthistory)
* [okx](/exchanges/okx.md#okxfetchmarginadjustmenthistory)

---

<a name="fetchMarginMode" id="fetchmarginmode"></a>

## fetchMarginMode
fetches the margin mode of a specific symbol

**Kind**: instance   
**Returns**: <code>object</code> - a [margin mode structure](https://docs.ccxt.com/#/?id=margin-mode-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchmarginmode)
* [bingx](/exchanges/bingx.md#bingxfetchmarginmode)
* [bitget](/exchanges/bitget.md#bitgetfetchmarginmode)
* [blofin](/exchanges/blofin.md#blofinfetchmarginmode)
* [coincatch](/exchanges/coincatch.md#coincatchfetchmarginmode)
* [delta](/exchanges/delta.md#deltafetchmarginmode)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchmarginmode)
* [paradex](/exchanges/paradex.md#paradexfetchmarginmode)

---

<a name="fetchMarginModes" id="fetchmarginmodes"></a>

## fetchMarginModes
fetches the set margin mode of the user

**Kind**: instance   
**Returns**: <code>object</code> - a list of [margin mode structures](https://docs.ccxt.com/#/?id=margin-mode-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchmarginmodes)
* [binance](/exchanges/binance.md#binancefetchmarginmodes)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchmarginmodes)

---

<a name="fetchMarkPrice" id="fetchmarkprice"></a>

## fetchMarkPrice
fetches mark price for the market

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchmarkprice)
* [bingx](/exchanges/bingx.md#bingxfetchmarkprice)
* [bitget](/exchanges/bitget.md#bitgetfetchmarkprice)
* [blofin](/exchanges/blofin.md#blofinfetchmarkprice)
* [defx](/exchanges/defx.md#defxfetchmarkprice)
* [kucoin](/exchanges/kucoin.md#kucoinfetchmarkprice)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchmarkprice)
* [okx](/exchanges/okx.md#okxfetchmarkprice)

---

<a name="fetchMarkPrices" id="fetchmarkprices"></a>

## fetchMarkPrices
fetches mark prices for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchmarkprices)
* [bingx](/exchanges/bingx.md#bingxfetchmarkprices)
* [kucoin](/exchanges/kucoin.md#kucoinfetchmarkprices)
* [okx](/exchanges/okx.md#okxfetchmarkprices)

---

<a name="fetchMarketLeverageTiers" id="fetchmarketleveragetiers"></a>

## fetchMarketLeverageTiers
retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market

**Kind**: instance   
**Returns**: <code>object</code> - a [leverage tiers structure](https://docs.ccxt.com/#/?id=leverage-tiers-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.marginMode | <code>string</code> | No | for spot margin 'cross' or 'isolated', default is 'isolated' |
| params.code | <code>string</code> | No | required for cross spot margin |
| params.productType | <code>string</code> | No | *contract and uta only* 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES' |
| params.uta | <code>boolean</code> | No | set to true for the unified trading account (uta), defaults to false |

##### Supported exchanges
* [bitget](/exchanges/bitget.md#bitgetfetchmarketleveragetiers)
* [bybit](/exchanges/bybit.md#bybitfetchmarketleveragetiers)
* [digifinex](/exchanges/digifinex.md#digifinexfetchmarketleveragetiers)
* [gate](/exchanges/gate.md#gatefetchmarketleveragetiers)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchmarketleveragetiers)
* [okx](/exchanges/okx.md#okxfetchmarketleveragetiers)
* [xt](/exchanges/xt.md#xtfetchmarketleveragetiers)

---

<a name="fetchMarkets" id="fetchmarkets"></a>

## fetchMarkets
retrieves data on all markets for alpaca

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - an array of objects representing market data


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchmarkets)
* [apex](/exchanges/apex.md#apexfetchmarkets)
* [ascendex](/exchanges/ascendex.md#ascendexfetchmarkets)
* [backpack](/exchanges/backpack.md#backpackfetchmarkets)
* [bigone](/exchanges/bigone.md#bigonefetchmarkets)
* [binance](/exchanges/binance.md#binancefetchmarkets)
* [bingx](/exchanges/bingx.md#bingxfetchmarkets)
* [bitbank](/exchanges/bitbank.md#bitbankfetchmarkets)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchmarkets)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchmarkets)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchmarkets)
* [bitget](/exchanges/bitget.md#bitgetfetchmarkets)
* [bithumb](/exchanges/bithumb.md#bithumbfetchmarkets)
* [bitmart](/exchanges/bitmart.md#bitmartfetchmarkets)
* [bitmex](/exchanges/bitmex.md#bitmexfetchmarkets)
* [bitopro](/exchanges/bitopro.md#bitoprofetchmarkets)
* [bitrue](/exchanges/bitrue.md#bitruefetchmarkets)
* [bitso](/exchanges/bitso.md#bitsofetchmarkets)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchmarkets)
* [bitteam](/exchanges/bitteam.md#bitteamfetchmarkets)
* [bittrade](/exchanges/bittrade.md#bittradefetchmarkets)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchmarkets)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchmarkets)
* [blofin](/exchanges/blofin.md#blofinfetchmarkets)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchmarkets)
* [btcbox](/exchanges/btcbox.md#btcboxfetchmarkets)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchmarkets)
* [btcturk](/exchanges/btcturk.md#btcturkfetchmarkets)
* [bybit](/exchanges/bybit.md#bybitfetchmarkets)
* [cex](/exchanges/cex.md#cexfetchmarkets)
* [coinbase](/exchanges/coinbase.md#coinbasefetchmarkets)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchmarkets)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchmarkets)
* [coincatch](/exchanges/coincatch.md#coincatchfetchmarkets)
* [coinex](/exchanges/coinex.md#coinexfetchmarkets)
* [coinmate](/exchanges/coinmate.md#coinmatefetchmarkets)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchmarkets)
* [coinone](/exchanges/coinone.md#coinonefetchmarkets)
* [coinsph](/exchanges/coinsph.md#coinsphfetchmarkets)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchmarkets)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchmarkets)
* [defx](/exchanges/defx.md#defxfetchmarkets)
* [delta](/exchanges/delta.md#deltafetchmarkets)
* [deribit](/exchanges/deribit.md#deribitfetchmarkets)
* [derive](/exchanges/derive.md#derivefetchmarkets)
* [digifinex](/exchanges/digifinex.md#digifinexfetchmarkets)
* [exmo](/exchanges/exmo.md#exmofetchmarkets)
* [foxbit](/exchanges/foxbit.md#foxbitfetchmarkets)
* [gate](/exchanges/gate.md#gatefetchmarkets)
* [gemini](/exchanges/gemini.md#geminifetchmarkets)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchmarkets)
* [hibachi](/exchanges/hibachi.md#hibachifetchmarkets)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchmarkets)
* [hollaex](/exchanges/hollaex.md#hollaexfetchmarkets)
* [htx](/exchanges/htx.md#htxfetchmarkets)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchmarkets)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchmarkets)
* [indodax](/exchanges/indodax.md#indodaxfetchmarkets)
* [kraken](/exchanges/kraken.md#krakenfetchmarkets)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchmarkets)
* [kucoin](/exchanges/kucoin.md#kucoinfetchmarkets)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchmarkets)
* [latoken](/exchanges/latoken.md#latokenfetchmarkets)
* [lbank](/exchanges/lbank.md#lbankfetchmarkets)
* [luno](/exchanges/luno.md#lunofetchmarkets)
* [mercado](/exchanges/mercado.md#mercadofetchmarkets)
* [mexc](/exchanges/mexc.md#mexcfetchmarkets)
* [modetrade](/exchanges/modetrade.md#modetradefetchmarkets)
* [ndax](/exchanges/ndax.md#ndaxfetchmarkets)
* [novadax](/exchanges/novadax.md#novadaxfetchmarkets)
* [oceanex](/exchanges/oceanex.md#oceanexfetchmarkets)
* [okcoin](/exchanges/okcoin.md#okcoinfetchmarkets)
* [okx](/exchanges/okx.md#okxfetchmarkets)
* [onetrading](/exchanges/onetrading.md#onetradingfetchmarkets)
* [oxfun](/exchanges/oxfun.md#oxfunfetchmarkets)
* [p2b](/exchanges/p2b.md#p2bfetchmarkets)
* [paradex](/exchanges/paradex.md#paradexfetchmarkets)
* [phemex](/exchanges/phemex.md#phemexfetchmarkets)
* [poloniex](/exchanges/poloniex.md#poloniexfetchmarkets)
* [probit](/exchanges/probit.md#probitfetchmarkets)
* [timex](/exchanges/timex.md#timexfetchmarkets)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchmarkets)
* [toobit](/exchanges/toobit.md#toobitfetchmarkets)
* [upbit](/exchanges/upbit.md#upbitfetchmarkets)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchmarkets)
* [whitebit](/exchanges/whitebit.md#whitebitfetchmarkets)
* [woo](/exchanges/woo.md#woofetchmarkets)
* [woofipro](/exchanges/woofipro.md#woofiprofetchmarkets)
* [xt](/exchanges/xt.md#xtfetchmarkets)
* [yobit](/exchanges/yobit.md#yobitfetchmarkets)
* [zaif](/exchanges/zaif.md#zaiffetchmarkets)
* [zonda](/exchanges/zonda.md#zondafetchmarkets)

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
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchmarketsws)

---

<a name="fetchMyDustTrades" id="fetchmydusttrades"></a>

## fetchMyDustTrades
fetch all dust trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | not used by binance fetchMyDustTrades () |
| since | <code>int</code> | No | the earliest time in ms to fetch my dust trades for |
| limit | <code>int</code> | No | the maximum number of dust trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.type | <code>string</code> | No | 'spot' or 'margin', default spot |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchmydusttrades)

---

<a name="fetchMyLiquidations" id="fetchmyliquidations"></a>

## fetchMyLiquidations
retrieves the users liquidated positions

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://docs.ccxt.com/#/?id=liquidation-structure)


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
* [binance](/exchanges/binance.md#binancefetchmyliquidations)
* [bingx](/exchanges/bingx.md#bingxfetchmyliquidations)
* [bitget](/exchanges/bitget.md#bitgetfetchmyliquidations)
* [bitmart](/exchanges/bitmart.md#bitmartfetchmyliquidations)
* [bybit](/exchanges/bybit.md#bybitfetchmyliquidations)
* [deribit](/exchanges/deribit.md#deribitfetchmyliquidations)
* [gate](/exchanges/gate.md#gatefetchmyliquidations)

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
* [binance](/exchanges/binance.md#binancefetchmysettlementhistory)
* [bybit](/exchanges/bybit.md#bybitfetchmysettlementhistory)
* [gate](/exchanges/gate.md#gatefetchmysettlementhistory)

---

<a name="fetchMyTrades" id="fetchmytrades"></a>

## fetchMyTrades
fetch all trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch trades for |
| params.page_token | <code>string</code> | No | page_token - used for paging |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchmytrades)
* [apex](/exchanges/apex.md#apexfetchmytrades)
* [backpack](/exchanges/backpack.md#backpackfetchmytrades)
* [bigone](/exchanges/bigone.md#bigonefetchmytrades)
* [binance](/exchanges/binance.md#binancefetchmytrades)
* [bingx](/exchanges/bingx.md#bingxfetchmytrades)
* [bit2c](/exchanges/bit2c.md#bit2cfetchmytrades)
* [bitbank](/exchanges/bitbank.md#bitbankfetchmytrades)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchmytrades)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchmytrades)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchmytrades)
* [bitget](/exchanges/bitget.md#bitgetfetchmytrades)
* [bitmart](/exchanges/bitmart.md#bitmartfetchmytrades)
* [bitmex](/exchanges/bitmex.md#bitmexfetchmytrades)
* [bitopro](/exchanges/bitopro.md#bitoprofetchmytrades)
* [bitrue](/exchanges/bitrue.md#bitruefetchmytrades)
* [bitso](/exchanges/bitso.md#bitsofetchmytrades)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchmytrades)
* [bitteam](/exchanges/bitteam.md#bitteamfetchmytrades)
* [bittrade](/exchanges/bittrade.md#bittradefetchmytrades)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchmytrades)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchmytrades)
* [blofin](/exchanges/blofin.md#blofinfetchmytrades)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchmytrades)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchmytrades)
* [btcturk](/exchanges/btcturk.md#btcturkfetchmytrades)
* [bybit](/exchanges/bybit.md#bybitfetchmytrades)
* [coinbase](/exchanges/coinbase.md#coinbasefetchmytrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchmytrades)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchmytrades)
* [coincatch](/exchanges/coincatch.md#coincatchfetchmytrades)
* [coincheck](/exchanges/coincheck.md#coincheckfetchmytrades)
* [coinex](/exchanges/coinex.md#coinexfetchmytrades)
* [coinmate](/exchanges/coinmate.md#coinmatefetchmytrades)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchmytrades)
* [coinone](/exchanges/coinone.md#coinonefetchmytrades)
* [coinsph](/exchanges/coinsph.md#coinsphfetchmytrades)
* [coinspot](/exchanges/coinspot.md#coinspotfetchmytrades)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchmytrades)
* [defx](/exchanges/defx.md#defxfetchmytrades)
* [delta](/exchanges/delta.md#deltafetchmytrades)
* [deribit](/exchanges/deribit.md#deribitfetchmytrades)
* [derive](/exchanges/derive.md#derivefetchmytrades)
* [digifinex](/exchanges/digifinex.md#digifinexfetchmytrades)
* [exmo](/exchanges/exmo.md#exmofetchmytrades)
* [foxbit](/exchanges/foxbit.md#foxbitfetchmytrades)
* [gate](/exchanges/gate.md#gatefetchmytrades)
* [gemini](/exchanges/gemini.md#geminifetchmytrades)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchmytrades)
* [hibachi](/exchanges/hibachi.md#hibachifetchmytrades)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchmytrades)
* [hollaex](/exchanges/hollaex.md#hollaexfetchmytrades)
* [htx](/exchanges/htx.md#htxfetchmytrades)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchmytrades)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchmytrades)
* [kraken](/exchanges/kraken.md#krakenfetchmytrades)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchmytrades)
* [kucoin](/exchanges/kucoin.md#kucoinfetchmytrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchmytrades)
* [latoken](/exchanges/latoken.md#latokenfetchmytrades)
* [lbank](/exchanges/lbank.md#lbankfetchmytrades)
* [luno](/exchanges/luno.md#lunofetchmytrades)
* [mercado](/exchanges/mercado.md#mercadofetchmytrades)
* [mexc](/exchanges/mexc.md#mexcfetchmytrades)
* [modetrade](/exchanges/modetrade.md#modetradefetchmytrades)
* [ndax](/exchanges/ndax.md#ndaxfetchmytrades)
* [novadax](/exchanges/novadax.md#novadaxfetchmytrades)
* [okcoin](/exchanges/okcoin.md#okcoinfetchmytrades)
* [okx](/exchanges/okx.md#okxfetchmytrades)
* [onetrading](/exchanges/onetrading.md#onetradingfetchmytrades)
* [oxfun](/exchanges/oxfun.md#oxfunfetchmytrades)
* [p2b](/exchanges/p2b.md#p2bfetchmytrades)
* [paradex](/exchanges/paradex.md#paradexfetchmytrades)
* [phemex](/exchanges/phemex.md#phemexfetchmytrades)
* [poloniex](/exchanges/poloniex.md#poloniexfetchmytrades)
* [probit](/exchanges/probit.md#probitfetchmytrades)
* [timex](/exchanges/timex.md#timexfetchmytrades)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchmytrades)
* [toobit](/exchanges/toobit.md#toobitfetchmytrades)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchmytrades)
* [whitebit](/exchanges/whitebit.md#whitebitfetchmytrades)
* [woo](/exchanges/woo.md#woofetchmytrades)
* [woofipro](/exchanges/woofipro.md#woofiprofetchmytrades)
* [xt](/exchanges/xt.md#xtfetchmytrades)
* [yobit](/exchanges/yobit.md#yobitfetchmytrades)
* [zonda](/exchanges/zonda.md#zondafetchmytrades)

---

<a name="fetchMyTradesWs" id="fetchmytradesws"></a>

## fetchMyTradesWs
fetch all trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchmytradesws)

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
| params | <code>object</code> | No | extra parameters specific to the alpha api endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |
| params.method | <code>string</code> | No | method, default: marketPublicGetV1beta3CryptoLocBars |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchohlcv)
* [apex](/exchanges/apex.md#apexfetchohlcv)
* [ascendex](/exchanges/ascendex.md#ascendexfetchohlcv)
* [backpack](/exchanges/backpack.md#backpackfetchohlcv)
* [bigone](/exchanges/bigone.md#bigonefetchohlcv)
* [binance](/exchanges/binance.md#binancefetchohlcv)
* [bingx](/exchanges/bingx.md#bingxfetchohlcv)
* [bitbank](/exchanges/bitbank.md#bitbankfetchohlcv)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchohlcv)
* [bitget](/exchanges/bitget.md#bitgetfetchohlcv)
* [bithumb](/exchanges/bithumb.md#bithumbfetchohlcv)
* [bitmart](/exchanges/bitmart.md#bitmartfetchohlcv)
* [bitmex](/exchanges/bitmex.md#bitmexfetchohlcv)
* [bitopro](/exchanges/bitopro.md#bitoprofetchohlcv)
* [bitrue](/exchanges/bitrue.md#bitruefetchohlcv)
* [bitso](/exchanges/bitso.md#bitsofetchohlcv)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchohlcv)
* [bitteam](/exchanges/bitteam.md#bitteamfetchohlcv)
* [bittrade](/exchanges/bittrade.md#bittradefetchohlcv)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchohlcv)
* [blofin](/exchanges/blofin.md#blofinfetchohlcv)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchohlcv)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchohlcv)
* [btcturk](/exchanges/btcturk.md#btcturkfetchohlcv)
* [bybit](/exchanges/bybit.md#bybitfetchohlcv)
* [cex](/exchanges/cex.md#cexfetchohlcv)
* [coinbase](/exchanges/coinbase.md#coinbasefetchohlcv)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchohlcv)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchohlcv)
* [coincatch](/exchanges/coincatch.md#coincatchfetchohlcv)
* [coinex](/exchanges/coinex.md#coinexfetchohlcv)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchohlcv)
* [coinsph](/exchanges/coinsph.md#coinsphfetchohlcv)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchohlcv)
* [defx](/exchanges/defx.md#defxfetchohlcv)
* [delta](/exchanges/delta.md#deltafetchohlcv)
* [deribit](/exchanges/deribit.md#deribitfetchohlcv)
* [digifinex](/exchanges/digifinex.md#digifinexfetchohlcv)
* [exmo](/exchanges/exmo.md#exmofetchohlcv)
* [foxbit](/exchanges/foxbit.md#foxbitfetchohlcv)
* [gateio](/exchanges/gateio.md#gateiofetchohlcv)
* [gemini](/exchanges/gemini.md#geminifetchohlcv)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchohlcv)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchohlcv)
* [hollaex](/exchanges/hollaex.md#hollaexfetchohlcv)
* [htx](/exchanges/htx.md#htxfetchohlcv)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchohlcv)
* [indodax](/exchanges/indodax.md#indodaxfetchohlcv)
* [kraken](/exchanges/kraken.md#krakenfetchohlcv)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchohlcv)
* [kucoin](/exchanges/kucoin.md#kucoinfetchohlcv)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchohlcv)
* [lbank](/exchanges/lbank.md#lbankfetchohlcv)
* [luno](/exchanges/luno.md#lunofetchohlcv)
* [mercado](/exchanges/mercado.md#mercadofetchohlcv)
* [mexc](/exchanges/mexc.md#mexcfetchohlcv)
* [modetrade](/exchanges/modetrade.md#modetradefetchohlcv)
* [ndax](/exchanges/ndax.md#ndaxfetchohlcv)
* [novadax](/exchanges/novadax.md#novadaxfetchohlcv)
* [oceanex](/exchanges/oceanex.md#oceanexfetchohlcv)
* [okcoin](/exchanges/okcoin.md#okcoinfetchohlcv)
* [okx](/exchanges/okx.md#okxfetchohlcv)
* [onetrading](/exchanges/onetrading.md#onetradingfetchohlcv)
* [oxfun](/exchanges/oxfun.md#oxfunfetchohlcv)
* [p2b](/exchanges/p2b.md#p2bfetchohlcv)
* [paradex](/exchanges/paradex.md#paradexfetchohlcv)
* [phemex](/exchanges/phemex.md#phemexfetchohlcv)
* [poloniex](/exchanges/poloniex.md#poloniexfetchohlcv)
* [probit](/exchanges/probit.md#probitfetchohlcv)
* [timex](/exchanges/timex.md#timexfetchohlcv)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchohlcv)
* [toobit](/exchanges/toobit.md#toobitfetchohlcv)
* [upbit](/exchanges/upbit.md#upbitfetchohlcv)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchohlcv)
* [whitebit](/exchanges/whitebit.md#whitebitfetchohlcv)
* [woo](/exchanges/woo.md#woofetchohlcv)
* [woofipro](/exchanges/woofipro.md#woofiprofetchohlcv)
* [xt](/exchanges/xt.md#xtfetchohlcv)
* [zonda](/exchanges/zonda.md#zondafetchohlcv)

---

<a name="fetchOHLCVWs" id="fetchohlcvws"></a>

## fetchOHLCVWs
fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| since | <code>int</code> | No | timestamp in ms of the earliest candle to fetch |
| limit | <code>int</code> | No | the maximum amount of candles to fetch |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchohlcvws)
* [lbank](/exchanges/lbank.md#lbankfetchohlcvws)

---

<a name="fetchOpenInterest" id="fetchopeninterest"></a>

## fetchOpenInterest
retrieves the open interest of a contract trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an open interest structure[https://docs.ccxt.com/#/?id=open-interest-structure](https://docs.ccxt.com/#/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified CCXT market symbol |
| params | <code>object</code> | No | exchange specific parameters |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexfetchopeninterest)
* [backpack](/exchanges/backpack.md#backpackfetchopeninterest)
* [binance](/exchanges/binance.md#binancefetchopeninterest)
* [bingx](/exchanges/bingx.md#bingxfetchopeninterest)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchopeninterest)
* [bitget](/exchanges/bitget.md#bitgetfetchopeninterest)
* [bitmart](/exchanges/bitmart.md#bitmartfetchopeninterest)
* [bybit](/exchanges/bybit.md#bybitfetchopeninterest)
* [delta](/exchanges/delta.md#deltafetchopeninterest)
* [gate](/exchanges/gate.md#gatefetchopeninterest)
* [hibachi](/exchanges/hibachi.md#hibachifetchopeninterest)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchopeninterest)
* [htx](/exchanges/htx.md#htxfetchopeninterest)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchopeninterest)
* [okx](/exchanges/okx.md#okxfetchopeninterest)
* [paradex](/exchanges/paradex.md#paradexfetchopeninterest)
* [phemex](/exchanges/phemex.md#phemexfetchopeninterest)

---

<a name="fetchOpenInterestHistory" id="fetchopeninteresthistory"></a>

## fetchOpenInterestHistory
Retrieves the open interest history of a currency

**Kind**: instance   
**Returns**: <code>object</code> - an array of [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)


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
* [binance](/exchanges/binance.md#binancefetchopeninteresthistory)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchopeninteresthistory)
* [bybit](/exchanges/bybit.md#bybitfetchopeninteresthistory)
* [htx](/exchanges/htx.md#htxfetchopeninteresthistory)
* [okx](/exchanges/okx.md#okxfetchopeninteresthistory)

---

<a name="fetchOpenInterests" id="fetchopeninterests"></a>

## fetchOpenInterests
Retrieves the open interest for a list of symbols

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [open interest structures](https://docs.ccxt.com/#/?id=open-interest-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | a list of unified CCXT market symbols |
| params | <code>object</code> | No | exchange specific parameters |

##### Supported exchanges
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchopeninterests)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchopeninterests)
* [htx](/exchanges/htx.md#htxfetchopeninterests)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchopeninterests)
* [okx](/exchanges/okx.md#okxfetchopeninterests)

---

<a name="fetchOpenOrder" id="fetchopenorder"></a>

## fetchOpenOrder
fetch an open order by it's id

**Kind**: instance   
**Returns**: <code>object</code> - an [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | not used by hollaex fetchOpenOrder () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackfetchopenorder)
* [binance](/exchanges/binance.md#binancefetchopenorder)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchopenorder)
* [bybit](/exchanges/bybit.md#bybitfetchopenorder)
* [cex](/exchanges/cex.md#cexfetchopenorder)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchopenorder)
* [hollaex](/exchanges/hollaex.md#hollaexfetchopenorder)

---

<a name="fetchOpenOrders" id="fetchopenorders"></a>

## fetchOpenOrders
fetch all unfilled currently open orders

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchopenorders)
* [apex](/exchanges/apex.md#apexfetchopenorders)
* [ascendex](/exchanges/ascendex.md#ascendexfetchopenorders)
* [backpack](/exchanges/backpack.md#backpackfetchopenorders)
* [bigone](/exchanges/bigone.md#bigonefetchopenorders)
* [binance](/exchanges/binance.md#binancefetchopenorders)
* [bingx](/exchanges/bingx.md#bingxfetchopenorders)
* [bit2c](/exchanges/bit2c.md#bit2cfetchopenorders)
* [bitbank](/exchanges/bitbank.md#bitbankfetchopenorders)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchopenorders)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchopenorders)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchopenorders)
* [bitget](/exchanges/bitget.md#bitgetfetchopenorders)
* [bithumb](/exchanges/bithumb.md#bithumbfetchopenorders)
* [bitmart](/exchanges/bitmart.md#bitmartfetchopenorders)
* [bitmex](/exchanges/bitmex.md#bitmexfetchopenorders)
* [bitopro](/exchanges/bitopro.md#bitoprofetchopenorders)
* [bitrue](/exchanges/bitrue.md#bitruefetchopenorders)
* [bitso](/exchanges/bitso.md#bitsofetchopenorders)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchopenorders)
* [bitteam](/exchanges/bitteam.md#bitteamfetchopenorders)
* [bittrade](/exchanges/bittrade.md#bittradefetchopenorders)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchopenorders)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchopenorders)
* [blofin](/exchanges/blofin.md#blofinfetchopenorders)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchopenorders)
* [btcbox](/exchanges/btcbox.md#btcboxfetchopenorders)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchopenorders)
* [btcturk](/exchanges/btcturk.md#btcturkfetchopenorders)
* [bybit](/exchanges/bybit.md#bybitfetchopenorders)
* [cex](/exchanges/cex.md#cexfetchopenorders)
* [coinbase](/exchanges/coinbase.md#coinbasefetchopenorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchopenorders)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchopenorders)
* [coincatch](/exchanges/coincatch.md#coincatchfetchopenorders)
* [coincheck](/exchanges/coincheck.md#coincheckfetchopenorders)
* [coinex](/exchanges/coinex.md#coinexfetchopenorders)
* [coinmate](/exchanges/coinmate.md#coinmatefetchopenorders)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchopenorders)
* [coinone](/exchanges/coinone.md#coinonefetchopenorders)
* [coinsph](/exchanges/coinsph.md#coinsphfetchopenorders)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchopenorders)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchopenorders)
* [defx](/exchanges/defx.md#defxfetchopenorders)
* [delta](/exchanges/delta.md#deltafetchopenorders)
* [deribit](/exchanges/deribit.md#deribitfetchopenorders)
* [derive](/exchanges/derive.md#derivefetchopenorders)
* [digifinex](/exchanges/digifinex.md#digifinexfetchopenorders)
* [exmo](/exchanges/exmo.md#exmofetchopenorders)
* [foxbit](/exchanges/foxbit.md#foxbitfetchopenorders)
* [gate](/exchanges/gate.md#gatefetchopenorders)
* [gemini](/exchanges/gemini.md#geminifetchopenorders)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchopenorders)
* [hibachi](/exchanges/hibachi.md#hibachifetchopenorders)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchopenorders)
* [hollaex](/exchanges/hollaex.md#hollaexfetchopenorders)
* [htx](/exchanges/htx.md#htxfetchopenorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchopenorders)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchopenorders)
* [indodax](/exchanges/indodax.md#indodaxfetchopenorders)
* [kraken](/exchanges/kraken.md#krakenfetchopenorders)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchopenorders)
* [kucoin](/exchanges/kucoin.md#kucoinfetchopenorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchopenorders)
* [latoken](/exchanges/latoken.md#latokenfetchopenorders)
* [lbank](/exchanges/lbank.md#lbankfetchopenorders)
* [luno](/exchanges/luno.md#lunofetchopenorders)
* [mercado](/exchanges/mercado.md#mercadofetchopenorders)
* [mexc](/exchanges/mexc.md#mexcfetchopenorders)
* [modetrade](/exchanges/modetrade.md#modetradefetchopenorders)
* [ndax](/exchanges/ndax.md#ndaxfetchopenorders)
* [novadax](/exchanges/novadax.md#novadaxfetchopenorders)
* [oceanex](/exchanges/oceanex.md#oceanexfetchopenorders)
* [okcoin](/exchanges/okcoin.md#okcoinfetchopenorders)
* [okx](/exchanges/okx.md#okxfetchopenorders)
* [onetrading](/exchanges/onetrading.md#onetradingfetchopenorders)
* [oxfun](/exchanges/oxfun.md#oxfunfetchopenorders)
* [p2b](/exchanges/p2b.md#p2bfetchopenorders)
* [paradex](/exchanges/paradex.md#paradexfetchopenorders)
* [phemex](/exchanges/phemex.md#phemexfetchopenorders)
* [poloniex](/exchanges/poloniex.md#poloniexfetchopenorders)
* [probit](/exchanges/probit.md#probitfetchopenorders)
* [timex](/exchanges/timex.md#timexfetchopenorders)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchopenorders)
* [toobit](/exchanges/toobit.md#toobitfetchopenorders)
* [upbit](/exchanges/upbit.md#upbitfetchopenorders)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchopenorders)
* [whitebit](/exchanges/whitebit.md#whitebitfetchopenorders)
* [woo](/exchanges/woo.md#woofetchopenorders)
* [woofipro](/exchanges/woofipro.md#woofiprofetchopenorders)
* [xt](/exchanges/xt.md#xtfetchopenorders)
* [yobit](/exchanges/yobit.md#yobitfetchopenorders)
* [zaif](/exchanges/zaif.md#zaiffetchopenorders)
* [zonda](/exchanges/zonda.md#zondafetchopenorders)

---

<a name="fetchOpenOrdersWs" id="fetchopenordersws"></a>

## fetchOpenOrdersWs
fetch all unfilled currently open orders

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch open orders for |
| limit | <code>int</code> | No | the maximum number of  open orders structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchopenordersws)
* [cex](/exchanges/cex.md#cexfetchopenordersws)
* [gate](/exchanges/gate.md#gatefetchopenordersws)

---

<a name="fetchOption" id="fetchoption"></a>

## fetchOption
fetches option data that is commonly found in an option chain

**Kind**: instance   
**Returns**: <code>object</code> - an [option chain structure](https://docs.ccxt.com/#/?id=option-chain-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchoption)
* [bybit](/exchanges/bybit.md#bybitfetchoption)
* [delta](/exchanges/delta.md#deltafetchoption)
* [deribit](/exchanges/deribit.md#deribitfetchoption)
* [gate](/exchanges/gate.md#gatefetchoption)
* [okx](/exchanges/okx.md#okxfetchoption)

---

<a name="fetchOptionChain" id="fetchoptionchain"></a>

## fetchOptionChain
fetches data for an underlying asset that is commonly found in an option chain

**Kind**: instance   
**Returns**: <code>object</code> - a list of [option chain structures](https://docs.ccxt.com/#/?id=option-chain-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | base currency to fetch an option chain for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#bybitfetchoptionchain)
* [deribit](/exchanges/deribit.md#deribitfetchoptionchain)
* [gate](/exchanges/gate.md#gatefetchoptionchain)
* [okx](/exchanges/okx.md#okxfetchoptionchain)

---

<a name="fetchOptionPositions" id="fetchoptionpositions"></a>

## fetchOptionPositions
fetch data on open options positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchoptionpositions)

---

<a name="fetchOrder" id="fetchorder"></a>

## fetchOrder
fetches information on an order made by the user

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchorder)
* [apex](/exchanges/apex.md#apexfetchorder)
* [ascendex](/exchanges/ascendex.md#ascendexfetchorder)
* [bigone](/exchanges/bigone.md#bigonefetchorder)
* [binance](/exchanges/binance.md#binancefetchorder)
* [bingx](/exchanges/bingx.md#bingxfetchorder)
* [bit2c](/exchanges/bit2c.md#bit2cfetchorder)
* [bitbank](/exchanges/bitbank.md#bitbankfetchorder)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchorder)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchorder)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchorder)
* [bitget](/exchanges/bitget.md#bitgetfetchorder)
* [bithumb](/exchanges/bithumb.md#bithumbfetchorder)
* [bitmart](/exchanges/bitmart.md#bitmartfetchorder)
* [bitmex](/exchanges/bitmex.md#bitmexfetchorder)
* [bitopro](/exchanges/bitopro.md#bitoprofetchorder)
* [bitrue](/exchanges/bitrue.md#bitruefetchorder)
* [bitso](/exchanges/bitso.md#bitsofetchorder)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchorder)
* [bitteam](/exchanges/bitteam.md#bitteamfetchorder)
* [bittrade](/exchanges/bittrade.md#bittradefetchorder)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchorder)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchorder)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchorder)
* [btcbox](/exchanges/btcbox.md#btcboxfetchorder)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchorder)
* [bybit](/exchanges/bybit.md#bybitfetchorder)
* [coinbase](/exchanges/coinbase.md#coinbasefetchorder)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchorder)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchorder)
* [coincatch](/exchanges/coincatch.md#coincatchfetchorder)
* [coinex](/exchanges/coinex.md#coinexfetchorder)
* [coinmate](/exchanges/coinmate.md#coinmatefetchorder)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchorder)
* [coinone](/exchanges/coinone.md#coinonefetchorder)
* [coinsph](/exchanges/coinsph.md#coinsphfetchorder)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchorder)
* [defx](/exchanges/defx.md#defxfetchorder)
* [deribit](/exchanges/deribit.md#deribitfetchorder)
* [digifinex](/exchanges/digifinex.md#digifinexfetchorder)
* [exmo](/exchanges/exmo.md#exmofetchorder)
* [foxbit](/exchanges/foxbit.md#foxbitfetchorder)
* [gate](/exchanges/gate.md#gatefetchorder)
* [gemini](/exchanges/gemini.md#geminifetchorder)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchorder)
* [hibachi](/exchanges/hibachi.md#hibachifetchorder)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchorder)
* [hollaex](/exchanges/hollaex.md#hollaexfetchorder)
* [htx](/exchanges/htx.md#htxfetchorder)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchorder)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchorder)
* [indodax](/exchanges/indodax.md#indodaxfetchorder)
* [kraken](/exchanges/kraken.md#krakenfetchorder)
* [kucoin](/exchanges/kucoin.md#kucoinfetchorder)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchorder)
* [latoken](/exchanges/latoken.md#latokenfetchorder)
* [lbank](/exchanges/lbank.md#lbankfetchorder)
* [luno](/exchanges/luno.md#lunofetchorder)
* [mercado](/exchanges/mercado.md#mercadofetchorder)
* [mexc](/exchanges/mexc.md#mexcfetchorder)
* [modetrade](/exchanges/modetrade.md#modetradefetchorder)
* [ndax](/exchanges/ndax.md#ndaxfetchorder)
* [novadax](/exchanges/novadax.md#novadaxfetchorder)
* [oceanex](/exchanges/oceanex.md#oceanexfetchorder)
* [okcoin](/exchanges/okcoin.md#okcoinfetchorder)
* [okx](/exchanges/okx.md#okxfetchorder)
* [onetrading](/exchanges/onetrading.md#onetradingfetchorder)
* [oxfun](/exchanges/oxfun.md#oxfunfetchorder)
* [paradex](/exchanges/paradex.md#paradexfetchorder)
* [phemex](/exchanges/phemex.md#phemexfetchorder)
* [poloniex](/exchanges/poloniex.md#poloniexfetchorder)
* [probit](/exchanges/probit.md#probitfetchorder)
* [timex](/exchanges/timex.md#timexfetchorder)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchorder)
* [toobit](/exchanges/toobit.md#toobitfetchorder)
* [upbit](/exchanges/upbit.md#upbitfetchorder)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchorder)
* [woo](/exchanges/woo.md#woofetchorder)
* [woofipro](/exchanges/woofipro.md#woofiprofetchorder)
* [xt](/exchanges/xt.md#xtfetchorder)
* [yobit](/exchanges/yobit.md#yobitfetchorder)

---

<a name="fetchOrderBook" id="fetchorderbook"></a>

## fetchOrderBook
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchorderbook)
* [apex](/exchanges/apex.md#apexfetchorderbook)
* [ascendex](/exchanges/ascendex.md#ascendexfetchorderbook)
* [backpack](/exchanges/backpack.md#backpackfetchorderbook)
* [bigone](/exchanges/bigone.md#bigonefetchorderbook)
* [binance](/exchanges/binance.md#binancefetchorderbook)
* [bingx](/exchanges/bingx.md#bingxfetchorderbook)
* [bit2c](/exchanges/bit2c.md#bit2cfetchorderbook)
* [bitbank](/exchanges/bitbank.md#bitbankfetchorderbook)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchorderbook)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchorderbook)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchorderbook)
* [bitget](/exchanges/bitget.md#bitgetfetchorderbook)
* [bithumb](/exchanges/bithumb.md#bithumbfetchorderbook)
* [bitmart](/exchanges/bitmart.md#bitmartfetchorderbook)
* [bitmex](/exchanges/bitmex.md#bitmexfetchorderbook)
* [bitopro](/exchanges/bitopro.md#bitoprofetchorderbook)
* [bitrue](/exchanges/bitrue.md#bitruefetchorderbook)
* [bitso](/exchanges/bitso.md#bitsofetchorderbook)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchorderbook)
* [bitteam](/exchanges/bitteam.md#bitteamfetchorderbook)
* [bittrade](/exchanges/bittrade.md#bittradefetchorderbook)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchorderbook)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchorderbook)
* [blofin](/exchanges/blofin.md#blofinfetchorderbook)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchorderbook)
* [btcbox](/exchanges/btcbox.md#btcboxfetchorderbook)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchorderbook)
* [btcturk](/exchanges/btcturk.md#btcturkfetchorderbook)
* [bybit](/exchanges/bybit.md#bybitfetchorderbook)
* [cex](/exchanges/cex.md#cexfetchorderbook)
* [coinbase](/exchanges/coinbase.md#coinbasefetchorderbook)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchorderbook)
* [coincatch](/exchanges/coincatch.md#coincatchfetchorderbook)
* [coincheck](/exchanges/coincheck.md#coincheckfetchorderbook)
* [coinex](/exchanges/coinex.md#coinexfetchorderbook)
* [coinmate](/exchanges/coinmate.md#coinmatefetchorderbook)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchorderbook)
* [coinone](/exchanges/coinone.md#coinonefetchorderbook)
* [coinsph](/exchanges/coinsph.md#coinsphfetchorderbook)
* [coinspot](/exchanges/coinspot.md#coinspotfetchorderbook)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchorderbook)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchorderbook)
* [defx](/exchanges/defx.md#defxfetchorderbook)
* [delta](/exchanges/delta.md#deltafetchorderbook)
* [deribit](/exchanges/deribit.md#deribitfetchorderbook)
* [digifinex](/exchanges/digifinex.md#digifinexfetchorderbook)
* [exmo](/exchanges/exmo.md#exmofetchorderbook)
* [foxbit](/exchanges/foxbit.md#foxbitfetchorderbook)
* [gate](/exchanges/gate.md#gatefetchorderbook)
* [gemini](/exchanges/gemini.md#geminifetchorderbook)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchorderbook)
* [hibachi](/exchanges/hibachi.md#hibachifetchorderbook)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchorderbook)
* [hollaex](/exchanges/hollaex.md#hollaexfetchorderbook)
* [htx](/exchanges/htx.md#htxfetchorderbook)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchorderbook)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchorderbook)
* [indodax](/exchanges/indodax.md#indodaxfetchorderbook)
* [kraken](/exchanges/kraken.md#krakenfetchorderbook)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchorderbook)
* [kucoin](/exchanges/kucoin.md#kucoinfetchorderbook)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchorderbook)
* [latoken](/exchanges/latoken.md#latokenfetchorderbook)
* [lbank](/exchanges/lbank.md#lbankfetchorderbook)
* [luno](/exchanges/luno.md#lunofetchorderbook)
* [mercado](/exchanges/mercado.md#mercadofetchorderbook)
* [mexc](/exchanges/mexc.md#mexcfetchorderbook)
* [modetrade](/exchanges/modetrade.md#modetradefetchorderbook)
* [ndax](/exchanges/ndax.md#ndaxfetchorderbook)
* [novadax](/exchanges/novadax.md#novadaxfetchorderbook)
* [oceanex](/exchanges/oceanex.md#oceanexfetchorderbook)
* [okcoin](/exchanges/okcoin.md#okcoinfetchorderbook)
* [okx](/exchanges/okx.md#okxfetchorderbook)
* [onetrading](/exchanges/onetrading.md#onetradingfetchorderbook)
* [oxfun](/exchanges/oxfun.md#oxfunfetchorderbook)
* [p2b](/exchanges/p2b.md#p2bfetchorderbook)
* [paradex](/exchanges/paradex.md#paradexfetchorderbook)
* [paymium](/exchanges/paymium.md#paymiumfetchorderbook)
* [phemex](/exchanges/phemex.md#phemexfetchorderbook)
* [poloniex](/exchanges/poloniex.md#poloniexfetchorderbook)
* [probit](/exchanges/probit.md#probitfetchorderbook)
* [timex](/exchanges/timex.md#timexfetchorderbook)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchorderbook)
* [toobit](/exchanges/toobit.md#toobitfetchorderbook)
* [upbit](/exchanges/upbit.md#upbitfetchorderbook)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchorderbook)
* [whitebit](/exchanges/whitebit.md#whitebitfetchorderbook)
* [woo](/exchanges/woo.md#woofetchorderbook)
* [woofipro](/exchanges/woofipro.md#woofiprofetchorderbook)
* [xt](/exchanges/xt.md#xtfetchorderbook)
* [yobit](/exchanges/yobit.md#yobitfetchorderbook)
* [zaif](/exchanges/zaif.md#zaiffetchorderbook)
* [zonda](/exchanges/zonda.md#zondafetchorderbook)

---

<a name="fetchOrderBookWs" id="fetchorderbookws"></a>

## fetchOrderBookWs
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/en/latest/manual.html#order-book-structure) indexed by market symbols


| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | unified symbol of the market to fetch the order book for |
| limit | <code>int</code>, <code>undefined</code> | the maximum amount of order book entries to return |
| params | <code>object</code> | extra parameters specific to the lbank api endpoint |

##### Supported exchanges
* [lbank](/exchanges/lbank.md#lbankfetchorderbookws)

---

<a name="fetchOrderBooks" id="fetchorderbooks"></a>

## fetchOrderBooks
fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbol


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | list of unified market symbols, all symbols fetched if undefined, default is undefined |
| limit | <code>int</code> | No | max number of entries per orderbook to return, default is undefined |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [exmo](/exchanges/exmo.md#exmofetchorderbooks)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchorderbooks)
* [hollaex](/exchanges/hollaex.md#hollaexfetchorderbooks)
* [oceanex](/exchanges/oceanex.md#oceanexfetchorderbooks)
* [upbit](/exchanges/upbit.md#upbitfetchorderbooks)
* [yobit](/exchanges/yobit.md#yobitfetchorderbooks)

---

<a name="fetchOrderClassic" id="fetchorderclassic"></a>

## fetchOrderClassic
fetches information on an order made by the user *classic accounts only*

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#bybitfetchorderclassic)

---

<a name="fetchOrderTrades" id="fetchordertrades"></a>

## fetchOrderTrades
fetch all the trades made from a single order

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | order id |
| symbol | <code>string</code> | Yes | unified market symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trades to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexfetchordertrades)
* [binance](/exchanges/binance.md#binancefetchordertrades)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchordertrades)
* [bitmart](/exchanges/bitmart.md#bitmartfetchordertrades)
* [bitso](/exchanges/bitso.md#bitsofetchordertrades)
* [bittrade](/exchanges/bittrade.md#bittradefetchordertrades)
* [bybit](/exchanges/bybit.md#bybitfetchordertrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchordertrades)
* [coincatch](/exchanges/coincatch.md#coincatchfetchordertrades)
* [coinsph](/exchanges/coinsph.md#coinsphfetchordertrades)
* [deribit](/exchanges/deribit.md#deribitfetchordertrades)
* [derive](/exchanges/derive.md#derivefetchordertrades)
* [exmo](/exchanges/exmo.md#exmofetchordertrades)
* [gate](/exchanges/gate.md#gatefetchordertrades)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchordertrades)
* [htx](/exchanges/htx.md#htxfetchordertrades)
* [kraken](/exchanges/kraken.md#krakenfetchordertrades)
* [kucoin](/exchanges/kucoin.md#kucoinfetchordertrades)
* [mexc](/exchanges/mexc.md#mexcfetchordertrades)
* [modetrade](/exchanges/modetrade.md#modetradefetchordertrades)
* [ndax](/exchanges/ndax.md#ndaxfetchordertrades)
* [novadax](/exchanges/novadax.md#novadaxfetchordertrades)
* [okcoin](/exchanges/okcoin.md#okcoinfetchordertrades)
* [okx](/exchanges/okx.md#okxfetchordertrades)
* [onetrading](/exchanges/onetrading.md#onetradingfetchordertrades)
* [p2b](/exchanges/p2b.md#p2bfetchordertrades)
* [poloniex](/exchanges/poloniex.md#poloniexfetchordertrades)
* [whitebit](/exchanges/whitebit.md#whitebitfetchordertrades)
* [woo](/exchanges/woo.md#woofetchordertrades)
* [woofipro](/exchanges/woofipro.md#woofiprofetchordertrades)

---

<a name="fetchOrderWs" id="fetchorderws"></a>

## fetchOrderWs
fetches information on an order made by the user

**Kind**: instance   
**Returns**: <code>object</code> - An [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | the order id |
| symbol | <code>string</code> | Yes | unified symbol of the market the order was made in |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchorderws)
* [cex](/exchanges/cex.md#cexfetchorderws)
* [gate](/exchanges/gate.md#gatefetchorderws)

---

<a name="fetchOrders" id="fetchorders"></a>

## fetchOrders
fetches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch orders for |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchorders)
* [apex](/exchanges/apex.md#apexfetchorders)
* [backpack](/exchanges/backpack.md#backpackfetchorders)
* [bigone](/exchanges/bigone.md#bigonefetchorders)
* [binance](/exchanges/binance.md#binancefetchorders)
* [bingx](/exchanges/bingx.md#bingxfetchorders)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchorders)
* [bitmex](/exchanges/bitmex.md#bitmexfetchorders)
* [bitopro](/exchanges/bitopro.md#bitoprofetchorders)
* [bitteam](/exchanges/bitteam.md#bitteamfetchorders)
* [bittrade](/exchanges/bittrade.md#bittradefetchorders)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchorders)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchorders)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchorders)
* [btcbox](/exchanges/btcbox.md#btcboxfetchorders)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchorders)
* [btcturk](/exchanges/btcturk.md#btcturkfetchorders)
* [bybit](/exchanges/bybit.md#bybitfetchorders)
* [cex](/exchanges/cex.md#cexfetchorders)
* [coinbase](/exchanges/coinbase.md#coinbasefetchorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchorders)
* [coinmate](/exchanges/coinmate.md#coinmatefetchorders)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchorders)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchorders)
* [defx](/exchanges/defx.md#defxfetchorders)
* [derive](/exchanges/derive.md#derivefetchorders)
* [digifinex](/exchanges/digifinex.md#digifinexfetchorders)
* [foxbit](/exchanges/foxbit.md#foxbitfetchorders)
* [gemini](/exchanges/gemini.md#geminifetchorders)
* [hollaex](/exchanges/hollaex.md#hollaexfetchorders)
* [htx](/exchanges/htx.md#htxfetchorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchorders)
* [latoken](/exchanges/latoken.md#latokenfetchorders)
* [lbank](/exchanges/lbank.md#lbankfetchorders)
* [luno](/exchanges/luno.md#lunofetchorders)
* [mercado](/exchanges/mercado.md#mercadofetchorders)
* [mexc](/exchanges/mexc.md#mexcfetchorders)
* [modetrade](/exchanges/modetrade.md#modetradefetchorders)
* [ndax](/exchanges/ndax.md#ndaxfetchorders)
* [novadax](/exchanges/novadax.md#novadaxfetchorders)
* [oceanex](/exchanges/oceanex.md#oceanexfetchorders)
* [paradex](/exchanges/paradex.md#paradexfetchorders)
* [phemex](/exchanges/phemex.md#phemexfetchorders)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchorders)
* [toobit](/exchanges/toobit.md#toobitfetchorders)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchorders)
* [woo](/exchanges/woo.md#woofetchorders)
* [woofipro](/exchanges/woofipro.md#woofiprofetchorders)
* [xt](/exchanges/xt.md#xtfetchorders)

---

<a name="fetchOrdersByIds" id="fetchordersbyids"></a>

## fetchOrdersByIds
fetch orders by the list of order id

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structure](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| ids | <code>Array&lt;string&gt;</code> | No | list of order id |
| symbol | <code>string</code> | No | unified ccxt market symbol |
| params | <code>object</code> | No | extra parameters specific to the kraken api endpoint |

##### Supported exchanges
* [kraken](/exchanges/kraken.md#krakenfetchordersbyids)

---

<a name="fetchOrdersByStatus" id="fetchordersbystatus"></a>

## fetchOrdersByStatus
fetch a list of orders

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


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
* [coinex](/exchanges/coinex.md#coinexfetchordersbystatus)
* [kucoin](/exchanges/kucoin.md#kucoinfetchordersbystatus)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchordersbystatus)

---

<a name="fetchOrdersClassic" id="fetchordersclassic"></a>

## fetchOrdersClassic
fetches information on multiple orders made by the user *classic accounts only*

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


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
* [bybit](/exchanges/bybit.md#bybitfetchordersclassic)

---

<a name="fetchOrdersWs" id="fetchordersws"></a>

## fetchOrdersWs
fetches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;Order&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of  orde structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchordersws)
* [gate](/exchanges/gate.md#gatefetchordersws)

---

<a name="fetchPortfolioDetails" id="fetchportfoliodetails"></a>

## fetchPortfolioDetails
Fetch details for a specific portfolio by UUID

**Kind**: instance   
**Returns**: <code>Array&lt;any&gt;</code> - An account structure <https://docs.ccxt.com/#/?id=account-structure>


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| portfolioUuid | <code>string</code> | Yes | The unique identifier of the portfolio to fetch |
| params | <code>Dict</code> | No | Extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#coinbasefetchportfoliodetails)

---

<a name="fetchPortfolios" id="fetchportfolios"></a>

## fetchPortfolios
fetch all the portfolios

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [account structures](https://docs.ccxt.com/#/?id=account-structure) indexed by the account type


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbase](/exchanges/coinbase.md#coinbasefetchportfolios)

---

<a name="fetchPosition" id="fetchposition"></a>

## fetchPosition
fetch data on an open position

**Kind**: instance   
**Returns**: <code>object</code> - a [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market the position is held in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchposition)
* [bingx](/exchanges/bingx.md#bingxfetchposition)
* [bitget](/exchanges/bitget.md#bitgetfetchposition)
* [bitmart](/exchanges/bitmart.md#bitmartfetchposition)
* [blofin](/exchanges/blofin.md#blofinfetchposition)
* [bybit](/exchanges/bybit.md#bybitfetchposition)
* [coinbase](/exchanges/coinbase.md#coinbasefetchposition)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchposition)
* [coincatch](/exchanges/coincatch.md#coincatchfetchposition)
* [coinex](/exchanges/coinex.md#coinexfetchposition)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchposition)
* [defx](/exchanges/defx.md#defxfetchposition)
* [delta](/exchanges/delta.md#deltafetchposition)
* [deribit](/exchanges/deribit.md#deribitfetchposition)
* [digifinex](/exchanges/digifinex.md#digifinexfetchposition)
* [gate](/exchanges/gate.md#gatefetchposition)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchposition)
* [htx](/exchanges/htx.md#htxfetchposition)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchposition)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchposition)
* [mexc](/exchanges/mexc.md#mexcfetchposition)
* [modetrade](/exchanges/modetrade.md#modetradefetchposition)
* [okx](/exchanges/okx.md#okxfetchposition)
* [paradex](/exchanges/paradex.md#paradexfetchposition)
* [whitebit](/exchanges/whitebit.md#whitebitfetchposition)
* [woo](/exchanges/woo.md#woofetchposition)
* [woofipro](/exchanges/woofipro.md#woofiprofetchposition)
* [xt](/exchanges/xt.md#xtfetchposition)

---

<a name="fetchPositionHistory" id="fetchpositionhistory"></a>

## fetchPositionHistory
fetches historical positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified contract symbol |
| since | <code>int</code> | No | the earliest time in ms to fetch positions for |
| limit | <code>int</code> | No | the maximum amount of records to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange api endpoint |
| params.until | <code>int</code> | No | the latest time in ms to fetch positions for |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#bingxfetchpositionhistory)
* [coinex](/exchanges/coinex.md#coinexfetchpositionhistory)
* [whitebit](/exchanges/whitebit.md#whitebitfetchpositionhistory)

---

<a name="fetchPositionMode" id="fetchpositionmode"></a>

## fetchPositionMode
fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets

**Kind**: instance   
**Returns**: <code>object</code> - an object detailing whether the market is in hedged or one-way mode


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchpositionmode)
* [bingx](/exchanges/bingx.md#bingxfetchpositionmode)
* [bitmart](/exchanges/bitmart.md#bitmartfetchpositionmode)
* [blofin](/exchanges/blofin.md#blofinfetchpositionmode)
* [coincatch](/exchanges/coincatch.md#coincatchfetchpositionmode)
* [mexc](/exchanges/mexc.md#mexcfetchpositionmode)
* [okx](/exchanges/okx.md#okxfetchpositionmode)
* [poloniex](/exchanges/poloniex.md#poloniexfetchpositionmode)

---

<a name="fetchPositions" id="fetchpositions"></a>

## fetchPositions
fetch all open positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexfetchpositions)
* [ascendex](/exchanges/ascendex.md#ascendexfetchpositions)
* [backpack](/exchanges/backpack.md#backpackfetchpositions)
* [binance](/exchanges/binance.md#binancefetchpositions)
* [bingx](/exchanges/bingx.md#bingxfetchpositions)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchpositions)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchpositions)
* [bitget](/exchanges/bitget.md#bitgetfetchpositions)
* [bitmart](/exchanges/bitmart.md#bitmartfetchpositions)
* [bitmex](/exchanges/bitmex.md#bitmexfetchpositions)
* [blofin](/exchanges/blofin.md#blofinfetchpositions)
* [bybit](/exchanges/bybit.md#bybitfetchpositions)
* [coinbase](/exchanges/coinbase.md#coinbasefetchpositions)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchpositions)
* [coincatch](/exchanges/coincatch.md#coincatchfetchpositions)
* [coinex](/exchanges/coinex.md#coinexfetchpositions)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchpositions)
* [defx](/exchanges/defx.md#defxfetchpositions)
* [delta](/exchanges/delta.md#deltafetchpositions)
* [deribit](/exchanges/deribit.md#deribitfetchpositions)
* [derive](/exchanges/derive.md#derivefetchpositions)
* [digifinex](/exchanges/digifinex.md#digifinexfetchpositions)
* [gate](/exchanges/gate.md#gatefetchpositions)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchpositions)
* [hibachi](/exchanges/hibachi.md#hibachifetchpositions)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchpositions)
* [htx](/exchanges/htx.md#htxfetchpositions)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchpositions)
* [kraken](/exchanges/kraken.md#krakenfetchpositions)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchpositions)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchpositions)
* [mexc](/exchanges/mexc.md#mexcfetchpositions)
* [modetrade](/exchanges/modetrade.md#modetradefetchpositions)
* [okx](/exchanges/okx.md#okxfetchpositions)
* [oxfun](/exchanges/oxfun.md#oxfunfetchpositions)
* [paradex](/exchanges/paradex.md#paradexfetchpositions)
* [phemex](/exchanges/phemex.md#phemexfetchpositions)
* [poloniex](/exchanges/poloniex.md#poloniexfetchpositions)
* [toobit](/exchanges/toobit.md#toobitfetchpositions)
* [whitebit](/exchanges/whitebit.md#whitebitfetchpositions)
* [woo](/exchanges/woo.md#woofetchpositions)
* [woofipro](/exchanges/woofipro.md#woofiprofetchpositions)
* [xt](/exchanges/xt.md#xtfetchpositions)

---

<a name="fetchPositionsForSymbol" id="fetchpositionsforsymbol"></a>

## fetchPositionsForSymbol
fetch all open positions for specific symbol

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structure](https://docs.ccxt.com/#/?id=position-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coincatch](/exchanges/coincatch.md#coincatchfetchpositionsforsymbol)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchpositionsforsymbol)
* [okx](/exchanges/okx.md#okxfetchpositionsforsymbol)

---

<a name="fetchPositionsHistory" id="fetchpositionshistory"></a>

## fetchPositionsHistory
fetches historical positions

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)


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
* [bitget](/exchanges/bitget.md#bitgetfetchpositionshistory)
* [bybit](/exchanges/bybit.md#bybitfetchpositionshistory)
* [gate](/exchanges/gate.md#gatefetchpositionshistory)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchpositionshistory)
* [mexc](/exchanges/mexc.md#mexcfetchpositionshistory)
* [okx](/exchanges/okx.md#okxfetchpositionshistory)

---

<a name="fetchSettlementHistory" id="fetchsettlementhistory"></a>

## fetchSettlementHistory
fetches historical settlement records

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [settlement history objects](https://docs.ccxt.com/#/?id=settlement-history-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the settlement history |
| since | <code>int</code> | No | timestamp in ms |
| limit | <code>int</code> | No | number of records, default 100, max 100 |
| params | <code>object</code> | No | exchange specific params |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchsettlementhistory)
* [bybit](/exchanges/bybit.md#bybitfetchsettlementhistory)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchsettlementhistory)
* [delta](/exchanges/delta.md#deltafetchsettlementhistory)
* [gate](/exchanges/gate.md#gatefetchsettlementhistory)
* [htx](/exchanges/htx.md#htxfetchsettlementhistory)
* [okx](/exchanges/okx.md#okxfetchsettlementhistory)

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
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchspotmarkets)

---

<a name="fetchStatus" id="fetchstatus"></a>

## fetchStatus
the latest known information on the availability of the exchange API

**Kind**: instance   
**Returns**: <code>object</code> - a [status structure](https://docs.ccxt.com/#/?id=exchange-status-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackfetchstatus)
* [binance](/exchanges/binance.md#binancefetchstatus)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchstatus)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchstatus)
* [bitmart](/exchanges/bitmart.md#bitmartfetchstatus)
* [bitrue](/exchanges/bitrue.md#bitruefetchstatus)
* [coinsph](/exchanges/coinsph.md#coinsphfetchstatus)
* [defx](/exchanges/defx.md#defxfetchstatus)
* [delta](/exchanges/delta.md#deltafetchstatus)
* [deribit](/exchanges/deribit.md#deribitfetchstatus)
* [digifinex](/exchanges/digifinex.md#digifinexfetchstatus)
* [foxbit](/exchanges/foxbit.md#foxbitfetchstatus)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchstatus)
* [htx](/exchanges/htx.md#htxfetchstatus)
* [kraken](/exchanges/kraken.md#krakenfetchstatus)
* [kucoin](/exchanges/kucoin.md#kucoinfetchstatus)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchstatus)
* [mexc](/exchanges/mexc.md#mexcfetchstatus)
* [modetrade](/exchanges/modetrade.md#modetradefetchstatus)
* [okx](/exchanges/okx.md#okxfetchstatus)
* [paradex](/exchanges/paradex.md#paradexfetchstatus)
* [toobit](/exchanges/toobit.md#toobitfetchstatus)
* [whitebit](/exchanges/whitebit.md#whitebitfetchstatus)
* [woo](/exchanges/woo.md#woofetchstatus)
* [woofipro](/exchanges/woofipro.md#woofiprofetchstatus)

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
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchswapmarkets)

---

<a name="fetchTicker" id="fetchticker"></a>

## fetchTicker
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchticker)
* [apex](/exchanges/apex.md#apexfetchticker)
* [ascendex](/exchanges/ascendex.md#ascendexfetchticker)
* [backpack](/exchanges/backpack.md#backpackfetchticker)
* [bigone](/exchanges/bigone.md#bigonefetchticker)
* [binance](/exchanges/binance.md#binancefetchticker)
* [bingx](/exchanges/bingx.md#bingxfetchticker)
* [bit2c](/exchanges/bit2c.md#bit2cfetchticker)
* [bitbank](/exchanges/bitbank.md#bitbankfetchticker)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchticker)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchticker)
* [bitget](/exchanges/bitget.md#bitgetfetchticker)
* [bithumb](/exchanges/bithumb.md#bithumbfetchticker)
* [bitmart](/exchanges/bitmart.md#bitmartfetchticker)
* [bitmex](/exchanges/bitmex.md#bitmexfetchticker)
* [bitopro](/exchanges/bitopro.md#bitoprofetchticker)
* [bitrue](/exchanges/bitrue.md#bitruefetchticker)
* [bitso](/exchanges/bitso.md#bitsofetchticker)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchticker)
* [bitteam](/exchanges/bitteam.md#bitteamfetchticker)
* [bittrade](/exchanges/bittrade.md#bittradefetchticker)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchticker)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchticker)
* [blofin](/exchanges/blofin.md#blofinfetchticker)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchticker)
* [btcbox](/exchanges/btcbox.md#btcboxfetchticker)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchticker)
* [btcturk](/exchanges/btcturk.md#btcturkfetchticker)
* [bybit](/exchanges/bybit.md#bybitfetchticker)
* [cex](/exchanges/cex.md#cexfetchticker)
* [coinbase](/exchanges/coinbase.md#coinbasefetchticker)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchticker)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchticker)
* [coincatch](/exchanges/coincatch.md#coincatchfetchticker)
* [coincheck](/exchanges/coincheck.md#coincheckfetchticker)
* [coinex](/exchanges/coinex.md#coinexfetchticker)
* [coinmate](/exchanges/coinmate.md#coinmatefetchticker)
* [coinone](/exchanges/coinone.md#coinonefetchticker)
* [coinsph](/exchanges/coinsph.md#coinsphfetchticker)
* [coinspot](/exchanges/coinspot.md#coinspotfetchticker)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchticker)
* [defx](/exchanges/defx.md#defxfetchticker)
* [delta](/exchanges/delta.md#deltafetchticker)
* [deribit](/exchanges/deribit.md#deribitfetchticker)
* [derive](/exchanges/derive.md#derivefetchticker)
* [digifinex](/exchanges/digifinex.md#digifinexfetchticker)
* [exmo](/exchanges/exmo.md#exmofetchticker)
* [foxbit](/exchanges/foxbit.md#foxbitfetchticker)
* [gate](/exchanges/gate.md#gatefetchticker)
* [gemini](/exchanges/gemini.md#geminifetchticker)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchticker)
* [hibachi](/exchanges/hibachi.md#hibachifetchticker)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchticker)
* [hollaex](/exchanges/hollaex.md#hollaexfetchticker)
* [htx](/exchanges/htx.md#htxfetchticker)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchticker)
* [indodax](/exchanges/indodax.md#indodaxfetchticker)
* [kraken](/exchanges/kraken.md#krakenfetchticker)
* [kucoin](/exchanges/kucoin.md#kucoinfetchticker)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchticker)
* [latoken](/exchanges/latoken.md#latokenfetchticker)
* [lbank](/exchanges/lbank.md#lbankfetchticker)
* [luno](/exchanges/luno.md#lunofetchticker)
* [mercado](/exchanges/mercado.md#mercadofetchticker)
* [mexc](/exchanges/mexc.md#mexcfetchticker)
* [ndax](/exchanges/ndax.md#ndaxfetchticker)
* [novadax](/exchanges/novadax.md#novadaxfetchticker)
* [oceanex](/exchanges/oceanex.md#oceanexfetchticker)
* [okcoin](/exchanges/okcoin.md#okcoinfetchticker)
* [okx](/exchanges/okx.md#okxfetchticker)
* [onetrading](/exchanges/onetrading.md#onetradingfetchticker)
* [oxfun](/exchanges/oxfun.md#oxfunfetchticker)
* [p2b](/exchanges/p2b.md#p2bfetchticker)
* [paradex](/exchanges/paradex.md#paradexfetchticker)
* [paymium](/exchanges/paymium.md#paymiumfetchticker)
* [phemex](/exchanges/phemex.md#phemexfetchticker)
* [poloniex](/exchanges/poloniex.md#poloniexfetchticker)
* [probit](/exchanges/probit.md#probitfetchticker)
* [timex](/exchanges/timex.md#timexfetchticker)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchticker)
* [upbit](/exchanges/upbit.md#upbitfetchticker)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchticker)
* [whitebit](/exchanges/whitebit.md#whitebitfetchticker)
* [xt](/exchanges/xt.md#xtfetchticker)
* [yobit](/exchanges/yobit.md#yobitfetchticker)
* [zaif](/exchanges/zaif.md#zaiffetchticker)
* [zonda](/exchanges/zonda.md#zondafetchticker)

---

<a name="fetchTickerWs" id="fetchtickerws"></a>

## fetchTickerWs
fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the cex api endpoint |

##### Supported exchanges
* [cex](/exchanges/cex.md#cexfetchtickerws)
* [lbank](/exchanges/lbank.md#lbankfetchtickerws)

---

<a name="fetchTickers" id="fetchtickers"></a>

## fetchTickers
fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbols of the markets to fetch tickers for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchtickers)
* [apex](/exchanges/apex.md#apexfetchtickers)
* [ascendex](/exchanges/ascendex.md#ascendexfetchtickers)
* [backpack](/exchanges/backpack.md#backpackfetchtickers)
* [bigone](/exchanges/bigone.md#bigonefetchtickers)
* [binance](/exchanges/binance.md#binancefetchtickers)
* [bingx](/exchanges/bingx.md#bingxfetchtickers)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchtickers)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchtickers)
* [bitget](/exchanges/bitget.md#bitgetfetchtickers)
* [bithumb](/exchanges/bithumb.md#bithumbfetchtickers)
* [bitmart](/exchanges/bitmart.md#bitmartfetchtickers)
* [bitmex](/exchanges/bitmex.md#bitmexfetchtickers)
* [bitopro](/exchanges/bitopro.md#bitoprofetchtickers)
* [bitrue](/exchanges/bitrue.md#bitruefetchtickers)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchtickers)
* [bitteam](/exchanges/bitteam.md#bitteamfetchtickers)
* [bittrade](/exchanges/bittrade.md#bittradefetchtickers)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchtickers)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchtickers)
* [blofin](/exchanges/blofin.md#blofinfetchtickers)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchtickers)
* [btcbox](/exchanges/btcbox.md#btcboxfetchtickers)
* [btcturk](/exchanges/btcturk.md#btcturkfetchtickers)
* [bybit](/exchanges/bybit.md#bybitfetchtickers)
* [cex](/exchanges/cex.md#cexfetchtickers)
* [coinbase](/exchanges/coinbase.md#coinbasefetchtickers)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchtickers)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchtickers)
* [coincatch](/exchanges/coincatch.md#coincatchfetchtickers)
* [coinex](/exchanges/coinex.md#coinexfetchtickers)
* [coinmate](/exchanges/coinmate.md#coinmatefetchtickers)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchtickers)
* [coinone](/exchanges/coinone.md#coinonefetchtickers)
* [coinsph](/exchanges/coinsph.md#coinsphfetchtickers)
* [coinspot](/exchanges/coinspot.md#coinspotfetchtickers)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchtickers)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchtickers)
* [defx](/exchanges/defx.md#defxfetchtickers)
* [delta](/exchanges/delta.md#deltafetchtickers)
* [deribit](/exchanges/deribit.md#deribitfetchtickers)
* [digifinex](/exchanges/digifinex.md#digifinexfetchtickers)
* [exmo](/exchanges/exmo.md#exmofetchtickers)
* [foxbit](/exchanges/foxbit.md#foxbitfetchtickers)
* [gate](/exchanges/gate.md#gatefetchtickers)
* [gemini](/exchanges/gemini.md#geminifetchtickers)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchtickers)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchtickers)
* [hollaex](/exchanges/hollaex.md#hollaexfetchtickers)
* [htx](/exchanges/htx.md#htxfetchtickers)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchtickers)
* [indodax](/exchanges/indodax.md#indodaxfetchtickers)
* [kraken](/exchanges/kraken.md#krakenfetchtickers)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchtickers)
* [kucoin](/exchanges/kucoin.md#kucoinfetchtickers)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchtickers)
* [latoken](/exchanges/latoken.md#latokenfetchtickers)
* [lbank](/exchanges/lbank.md#lbankfetchtickers)
* [luno](/exchanges/luno.md#lunofetchtickers)
* [mexc](/exchanges/mexc.md#mexcfetchtickers)
* [novadax](/exchanges/novadax.md#novadaxfetchtickers)
* [oceanex](/exchanges/oceanex.md#oceanexfetchtickers)
* [okcoin](/exchanges/okcoin.md#okcoinfetchtickers)
* [okx](/exchanges/okx.md#okxfetchtickers)
* [onetrading](/exchanges/onetrading.md#onetradingfetchtickers)
* [oxfun](/exchanges/oxfun.md#oxfunfetchtickers)
* [p2b](/exchanges/p2b.md#p2bfetchtickers)
* [paradex](/exchanges/paradex.md#paradexfetchtickers)
* [phemex](/exchanges/phemex.md#phemexfetchtickers)
* [poloniex](/exchanges/poloniex.md#poloniexfetchtickers)
* [probit](/exchanges/probit.md#probitfetchtickers)
* [timex](/exchanges/timex.md#timexfetchtickers)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchtickers)
* [toobit](/exchanges/toobit.md#toobitfetchtickers)
* [upbit](/exchanges/upbit.md#upbitfetchtickers)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchtickers)
* [whitebit](/exchanges/whitebit.md#whitebitfetchtickers)
* [xt](/exchanges/xt.md#xtfetchtickers)
* [yobit](/exchanges/yobit.md#yobitfetchtickers)

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
* [alpaca](/exchanges/alpaca.md#alpacafetchtime)
* [apex](/exchanges/apex.md#apexfetchtime)
* [ascendex](/exchanges/ascendex.md#ascendexfetchtime)
* [backpack](/exchanges/backpack.md#backpackfetchtime)
* [bigone](/exchanges/bigone.md#bigonefetchtime)
* [binance](/exchanges/binance.md#binancefetchtime)
* [bingx](/exchanges/bingx.md#bingxfetchtime)
* [bitget](/exchanges/bitget.md#bitgetfetchtime)
* [bitmart](/exchanges/bitmart.md#bitmartfetchtime)
* [bitrue](/exchanges/bitrue.md#bitruefetchtime)
* [bittrade](/exchanges/bittrade.md#bittradefetchtime)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchtime)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchtime)
* [bybit](/exchanges/bybit.md#bybitfetchtime)
* [cex](/exchanges/cex.md#cexfetchtime)
* [coinbase](/exchanges/coinbase.md#coinbasefetchtime)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchtime)
* [coincatch](/exchanges/coincatch.md#coincatchfetchtime)
* [coinex](/exchanges/coinex.md#coinexfetchtime)
* [coinsph](/exchanges/coinsph.md#coinsphfetchtime)
* [defx](/exchanges/defx.md#defxfetchtime)
* [delta](/exchanges/delta.md#deltafetchtime)
* [deribit](/exchanges/deribit.md#deribitfetchtime)
* [derive](/exchanges/derive.md#derivefetchtime)
* [digifinex](/exchanges/digifinex.md#digifinexfetchtime)
* [gate](/exchanges/gate.md#gatefetchtime)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchtime)
* [hibachi](/exchanges/hibachi.md#hibachifetchtime)
* [htx](/exchanges/htx.md#htxfetchtime)
* [indodax](/exchanges/indodax.md#indodaxfetchtime)
* [kraken](/exchanges/kraken.md#krakenfetchtime)
* [kucoin](/exchanges/kucoin.md#kucoinfetchtime)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchtime)
* [latoken](/exchanges/latoken.md#latokenfetchtime)
* [lbank](/exchanges/lbank.md#lbankfetchtime)
* [mexc](/exchanges/mexc.md#mexcfetchtime)
* [modetrade](/exchanges/modetrade.md#modetradefetchtime)
* [novadax](/exchanges/novadax.md#novadaxfetchtime)
* [oceanex](/exchanges/oceanex.md#oceanexfetchtime)
* [okcoin](/exchanges/okcoin.md#okcoinfetchtime)
* [okx](/exchanges/okx.md#okxfetchtime)
* [onetrading](/exchanges/onetrading.md#onetradingfetchtime)
* [paradex](/exchanges/paradex.md#paradexfetchtime)
* [poloniex](/exchanges/poloniex.md#poloniexfetchtime)
* [probit](/exchanges/probit.md#probitfetchtime)
* [timex](/exchanges/timex.md#timexfetchtime)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchtime)
* [toobit](/exchanges/toobit.md#toobitfetchtime)
* [whitebit](/exchanges/whitebit.md#whitebitfetchtime)
* [woo](/exchanges/woo.md#woofetchtime)
* [woofipro](/exchanges/woofipro.md#woofiprofetchtime)
* [xt](/exchanges/xt.md#xtfetchtime)

---

<a name="fetchTrades" id="fetchtrades"></a>

## fetchTrades
get the list of most recent trades for a particular symbol

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.loc | <code>string</code> | No | crypto location, default: us |
| params.method | <code>string</code> | No | method, default: marketPublicGetV1beta3CryptoLocTrades |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchtrades)
* [apex](/exchanges/apex.md#apexfetchtrades)
* [ascendex](/exchanges/ascendex.md#ascendexfetchtrades)
* [backpack](/exchanges/backpack.md#backpackfetchtrades)
* [bigone](/exchanges/bigone.md#bigonefetchtrades)
* [binance](/exchanges/binance.md#binancefetchtrades)
* [bingx](/exchanges/bingx.md#bingxfetchtrades)
* [bit2c](/exchanges/bit2c.md#bit2cfetchtrades)
* [bitbank](/exchanges/bitbank.md#bitbankfetchtrades)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchtrades)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchtrades)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchtrades)
* [bitget](/exchanges/bitget.md#bitgetfetchtrades)
* [bithumb](/exchanges/bithumb.md#bithumbfetchtrades)
* [bitmart](/exchanges/bitmart.md#bitmartfetchtrades)
* [bitmex](/exchanges/bitmex.md#bitmexfetchtrades)
* [bitopro](/exchanges/bitopro.md#bitoprofetchtrades)
* [bitrue](/exchanges/bitrue.md#bitruefetchtrades)
* [bitso](/exchanges/bitso.md#bitsofetchtrades)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchtrades)
* [bitteam](/exchanges/bitteam.md#bitteamfetchtrades)
* [bittrade](/exchanges/bittrade.md#bittradefetchtrades)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchtrades)
* [blofin](/exchanges/blofin.md#blofinfetchtrades)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchtrades)
* [btcbox](/exchanges/btcbox.md#btcboxfetchtrades)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchtrades)
* [btcturk](/exchanges/btcturk.md#btcturkfetchtrades)
* [bybit](/exchanges/bybit.md#bybitfetchtrades)
* [cex](/exchanges/cex.md#cexfetchtrades)
* [coinbase](/exchanges/coinbase.md#coinbasefetchtrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchtrades)
* [coincatch](/exchanges/coincatch.md#coincatchfetchtrades)
* [coincheck](/exchanges/coincheck.md#coincheckfetchtrades)
* [coinex](/exchanges/coinex.md#coinexfetchtrades)
* [coinmate](/exchanges/coinmate.md#coinmatefetchtrades)
* [coinmetro](/exchanges/coinmetro.md#coinmetrofetchtrades)
* [coinone](/exchanges/coinone.md#coinonefetchtrades)
* [coinsph](/exchanges/coinsph.md#coinsphfetchtrades)
* [coinspot](/exchanges/coinspot.md#coinspotfetchtrades)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchtrades)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchtrades)
* [defx](/exchanges/defx.md#defxfetchtrades)
* [delta](/exchanges/delta.md#deltafetchtrades)
* [deribit](/exchanges/deribit.md#deribitfetchtrades)
* [derive](/exchanges/derive.md#derivefetchtrades)
* [digifinex](/exchanges/digifinex.md#digifinexfetchtrades)
* [exmo](/exchanges/exmo.md#exmofetchtrades)
* [foxbit](/exchanges/foxbit.md#foxbitfetchtrades)
* [gate](/exchanges/gate.md#gatefetchtrades)
* [gemini](/exchanges/gemini.md#geminifetchtrades)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchtrades)
* [hibachi](/exchanges/hibachi.md#hibachifetchtrades)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchtrades)
* [hollaex](/exchanges/hollaex.md#hollaexfetchtrades)
* [htx](/exchanges/htx.md#htxfetchtrades)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchtrades)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchtrades)
* [indodax](/exchanges/indodax.md#indodaxfetchtrades)
* [kraken](/exchanges/kraken.md#krakenfetchtrades)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturesfetchtrades)
* [kucoin](/exchanges/kucoin.md#kucoinfetchtrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchtrades)
* [latoken](/exchanges/latoken.md#latokenfetchtrades)
* [lbank](/exchanges/lbank.md#lbankfetchtrades)
* [luno](/exchanges/luno.md#lunofetchtrades)
* [mercado](/exchanges/mercado.md#mercadofetchtrades)
* [mexc](/exchanges/mexc.md#mexcfetchtrades)
* [modetrade](/exchanges/modetrade.md#modetradefetchtrades)
* [ndax](/exchanges/ndax.md#ndaxfetchtrades)
* [novadax](/exchanges/novadax.md#novadaxfetchtrades)
* [oceanex](/exchanges/oceanex.md#oceanexfetchtrades)
* [okcoin](/exchanges/okcoin.md#okcoinfetchtrades)
* [okx](/exchanges/okx.md#okxfetchtrades)
* [oxfun](/exchanges/oxfun.md#oxfunfetchtrades)
* [p2b](/exchanges/p2b.md#p2bfetchtrades)
* [paradex](/exchanges/paradex.md#paradexfetchtrades)
* [paymium](/exchanges/paymium.md#paymiumfetchtrades)
* [phemex](/exchanges/phemex.md#phemexfetchtrades)
* [poloniex](/exchanges/poloniex.md#poloniexfetchtrades)
* [probit](/exchanges/probit.md#probitfetchtrades)
* [timex](/exchanges/timex.md#timexfetchtrades)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchtrades)
* [toobit](/exchanges/toobit.md#toobitfetchtrades)
* [upbit](/exchanges/upbit.md#upbitfetchtrades)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangefetchtrades)
* [whitebit](/exchanges/whitebit.md#whitebitfetchtrades)
* [woo](/exchanges/woo.md#woofetchtrades)
* [woofipro](/exchanges/woofipro.md#woofiprofetchtrades)
* [xt](/exchanges/xt.md#xtfetchtrades)
* [yobit](/exchanges/yobit.md#yobitfetchtrades)
* [zaif](/exchanges/zaif.md#zaiffetchtrades)
* [zonda](/exchanges/zonda.md#zondafetchtrades)

---

<a name="fetchTradesWs" id="fetchtradesws"></a>

## fetchTradesWs
get the list of most recent trades for a particular symbol

**Kind**: instance   
**Returns**: <code>Array&lt;Trade&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [lbank](/exchanges/lbank.md#lbankfetchtradesws)

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
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to fetch trading fees in a portfolio margin account |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchtradingfee)
* [bingx](/exchanges/bingx.md#bingxfetchtradingfee)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchtradingfee)
* [bitget](/exchanges/bitget.md#bitgetfetchtradingfee)
* [bitmart](/exchanges/bitmart.md#bitmartfetchtradingfee)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchtradingfee)
* [bybit](/exchanges/bybit.md#bybitfetchtradingfee)
* [coinex](/exchanges/coinex.md#coinexfetchtradingfee)
* [coinmate](/exchanges/coinmate.md#coinmatefetchtradingfee)
* [coinsph](/exchanges/coinsph.md#coinsphfetchtradingfee)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchtradingfee)
* [digifinex](/exchanges/digifinex.md#digifinexfetchtradingfee)
* [gate](/exchanges/gate.md#gatefetchtradingfee)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchtradingfee)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchtradingfee)
* [htx](/exchanges/htx.md#htxfetchtradingfee)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchtradingfee)
* [kraken](/exchanges/kraken.md#krakenfetchtradingfee)
* [kucoin](/exchanges/kucoin.md#kucoinfetchtradingfee)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchtradingfee)
* [latoken](/exchanges/latoken.md#latokenfetchtradingfee)
* [lbank](/exchanges/lbank.md#lbankfetchtradingfee)
* [luno](/exchanges/luno.md#lunofetchtradingfee)
* [mexc](/exchanges/mexc.md#mexcfetchtradingfee)
* [okx](/exchanges/okx.md#okxfetchtradingfee)
* [timex](/exchanges/timex.md#timexfetchtradingfee)
* [upbit](/exchanges/upbit.md#upbitfetchtradingfee)
* [woo](/exchanges/woo.md#woofetchtradingfee)

---

<a name="fetchTradingFees" id="fetchtradingfees"></a>

## fetchTradingFees
fetch the trading fees for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexfetchtradingfees)
* [binance](/exchanges/binance.md#binancefetchtradingfees)
* [bit2c](/exchanges/bit2c.md#bit2cfetchtradingfees)
* [bitbank](/exchanges/bitbank.md#bitbankfetchtradingfees)
* [bitfinex](/exchanges/bitfinex.md#bitfinexfetchtradingfees)
* [bitget](/exchanges/bitget.md#bitgetfetchtradingfees)
* [bitopro](/exchanges/bitopro.md#bitoprofetchtradingfees)
* [bitso](/exchanges/bitso.md#bitsofetchtradingfees)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchtradingfees)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchtradingfees)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchtradingfees)
* [bybit](/exchanges/bybit.md#bybitfetchtradingfees)
* [cex](/exchanges/cex.md#cexfetchtradingfees)
* [coinbase](/exchanges/coinbase.md#coinbasefetchtradingfees)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchtradingfees)
* [coincheck](/exchanges/coincheck.md#coincheckfetchtradingfees)
* [coinex](/exchanges/coinex.md#coinexfetchtradingfees)
* [coinsph](/exchanges/coinsph.md#coinsphfetchtradingfees)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchtradingfees)
* [cryptomus](/exchanges/cryptomus.md#cryptomusfetchtradingfees)
* [deribit](/exchanges/deribit.md#deribitfetchtradingfees)
* [exmo](/exchanges/exmo.md#exmofetchtradingfees)
* [foxbit](/exchanges/foxbit.md#foxbitfetchtradingfees)
* [gate](/exchanges/gate.md#gatefetchtradingfees)
* [gemini](/exchanges/gemini.md#geminifetchtradingfees)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchtradingfees)
* [hibachi](/exchanges/hibachi.md#hibachifetchtradingfees)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchtradingfees)
* [hollaex](/exchanges/hollaex.md#hollaexfetchtradingfees)
* [independentreserve](/exchanges/independentreserve.md#independentreservefetchtradingfees)
* [lbank](/exchanges/lbank.md#lbankfetchtradingfees)
* [modetrade](/exchanges/modetrade.md#modetradefetchtradingfees)
* [oceanex](/exchanges/oceanex.md#oceanexfetchtradingfees)
* [onetrading](/exchanges/onetrading.md#onetradingfetchtradingfees)
* [poloniex](/exchanges/poloniex.md#poloniexfetchtradingfees)
* [toobit](/exchanges/toobit.md#toobitfetchtradingfees)
* [upbit](/exchanges/upbit.md#upbitfetchtradingfees)
* [whitebit](/exchanges/whitebit.md#whitebitfetchtradingfees)
* [woo](/exchanges/woo.md#woofetchtradingfees)
* [woofipro](/exchanges/woofipro.md#woofiprofetchtradingfees)
* [yobit](/exchanges/yobit.md#yobitfetchtradingfees)

---

<a name="fetchTradingFeesWs" id="fetchtradingfeesws"></a>

## fetchTradingFeesWs
fetch the trading fees for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [fee structures](https://docs.ccxt.com/#/?id=fee-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchtradingfeesws)

---

<a name="fetchTransactionFee" id="fetchtransactionfee"></a>

## fetchTransactionFee
please use fetchDepositWithdrawFee instead

**Kind**: instance   
**Returns**: <code>object</code> - a [fee structure](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.network | <code>string</code> | No | the network code of the currency |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#bitmartfetchtransactionfee)
* [indodax](/exchanges/indodax.md#indodaxfetchtransactionfee)
* [kucoin](/exchanges/kucoin.md#kucoinfetchtransactionfee)

---

<a name="fetchTransactionFees" id="fetchtransactionfees"></a>

## fetchTransactionFees
please use fetchDepositWithdrawFees instead

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [fee structures](https://docs.ccxt.com/#/?id=fee-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| codes | <code>Array&lt;string&gt;</code>, <code>undefined</code> | Yes | not used by binance fetchTransactionFees () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancefetchtransactionfees)
* [bitso](/exchanges/bitso.md#bitsofetchtransactionfees)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchtransactionfees)
* [exmo](/exchanges/exmo.md#exmofetchtransactionfees)
* [gate](/exchanges/gate.md#gatefetchtransactionfees)
* [lbank](/exchanges/lbank.md#lbankfetchtransactionfees)
* [mexc](/exchanges/mexc.md#mexcfetchtransactionfees)
* [whitebit](/exchanges/whitebit.md#whitebitfetchtransactionfees)

---

<a name="fetchTransactions" id="fetchtransactions"></a>

## fetchTransactions
Fetch all transactions (deposits and withdrawals) made from an account.

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawal structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [foxbit](/exchanges/foxbit.md#foxbitfetchtransactions)
* [latoken](/exchanges/latoken.md#latokenfetchtransactions)

---

<a name="fetchTransfer" id="fetchtransfer"></a>

## fetchTransfer
fetches a transfer

**Kind**: instance   
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | transfer id |
| code | <code>string</code> | No | not used by mexc fetchTransfer |
| params | <code>object</code> | Yes | extra parameters specific to the exchange api endpoint |

##### Supported exchanges
* [mexc](/exchanges/mexc.md#mexcfetchtransfer)

---

<a name="fetchTransfers" id="fetchtransfers"></a>

## fetchTransfers
fetch a history of internal transfers made on an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transfer structures](https://docs.ccxt.com/#/?id=transfer-structure)


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
* [binance](/exchanges/binance.md#binancefetchtransfers)
* [bingx](/exchanges/bingx.md#bingxfetchtransfers)
* [bitget](/exchanges/bitget.md#bitgetfetchtransfers)
* [bitmart](/exchanges/bitmart.md#bitmartfetchtransfers)
* [bitrue](/exchanges/bitrue.md#bitruefetchtransfers)
* [bybit](/exchanges/bybit.md#bybitfetchtransfers)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchtransfers)
* [coinex](/exchanges/coinex.md#coinexfetchtransfers)
* [deribit](/exchanges/deribit.md#deribitfetchtransfers)
* [digifinex](/exchanges/digifinex.md#digifinexfetchtransfers)
* [latoken](/exchanges/latoken.md#latokenfetchtransfers)
* [mexc](/exchanges/mexc.md#mexcfetchtransfers)
* [okx](/exchanges/okx.md#okxfetchtransfers)
* [oxfun](/exchanges/oxfun.md#oxfunfetchtransfers)
* [paradex](/exchanges/paradex.md#paradexfetchtransfers)
* [phemex](/exchanges/phemex.md#phemexfetchtransfers)
* [woo](/exchanges/woo.md#woofetchtransfers)

---

<a name="fetchUnderlyingAssets" id="fetchunderlyingassets"></a>

## fetchUnderlyingAssets
fetches the market ids of underlying assets for a specific contract market type

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [underlying assets](https://docs.ccxt.com/#/?id=underlying-assets-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | exchange specific params |
| params.type | <code>string</code> | No | the contract market type, 'option', 'swap' or 'future', the default is 'option' |

##### Supported exchanges
* [gate](/exchanges/gate.md#gatefetchunderlyingassets)
* [okx](/exchanges/okx.md#okxfetchunderlyingassets)

---

<a name="fetchVolatilityHistory" id="fetchvolatilityhistory"></a>

## fetchVolatilityHistory
fetch the historical volatility of an option market based on an underlying asset

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [volatility history objects](https://docs.ccxt.com/#/?id=volatility-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.period | <code>int</code> | No | the period in days to fetch the volatility for: 7,14,21,30,60,90,180,270 |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#bybitfetchvolatilityhistory)
* [deribit](/exchanges/deribit.md#deribitfetchvolatilityhistory)

---

<a name="fetchWithdrawal" id="fetchwithdrawal"></a>

## fetchWithdrawal
fetch data on a currency withdrawal via the withdrawal id

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| id | <code>string</code> | Yes | withdrawal id |
| code | <code>string</code> | Yes | not used by bitmart.fetchWithdrawal |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [bitmart](/exchanges/bitmart.md#bitmartfetchwithdrawal)
* [bitopro](/exchanges/bitopro.md#bitoprofetchwithdrawal)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchwithdrawal)
* [exmo](/exchanges/exmo.md#exmofetchwithdrawal)
* [hollaex](/exchanges/hollaex.md#hollaexfetchwithdrawal)
* [okx](/exchanges/okx.md#okxfetchwithdrawal)
* [upbit](/exchanges/upbit.md#upbitfetchwithdrawal)

---

<a name="fetchWithdrawals" id="fetchwithdrawals"></a>

## fetchWithdrawals
fetch all withdrawals made from an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | No | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawal structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacafetchwithdrawals)
* [ascendex](/exchanges/ascendex.md#ascendexfetchwithdrawals)
* [backpack](/exchanges/backpack.md#backpackfetchwithdrawals)
* [bigone](/exchanges/bigone.md#bigonefetchwithdrawals)
* [binance](/exchanges/binance.md#binancefetchwithdrawals)
* [bingx](/exchanges/bingx.md#bingxfetchwithdrawals)
* [bitbns](/exchanges/bitbns.md#bitbnsfetchwithdrawals)
* [bitflyer](/exchanges/bitflyer.md#bitflyerfetchwithdrawals)
* [bitget](/exchanges/bitget.md#bitgetfetchwithdrawals)
* [bitmart](/exchanges/bitmart.md#bitmartfetchwithdrawals)
* [bitopro](/exchanges/bitopro.md#bitoprofetchwithdrawals)
* [bitrue](/exchanges/bitrue.md#bitruefetchwithdrawals)
* [bitstamp](/exchanges/bitstamp.md#bitstampfetchwithdrawals)
* [bittrade](/exchanges/bittrade.md#bittradefetchwithdrawals)
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchwithdrawals)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomfetchwithdrawals)
* [blofin](/exchanges/blofin.md#blofinfetchwithdrawals)
* [btcalpha](/exchanges/btcalpha.md#btcalphafetchwithdrawals)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketsfetchwithdrawals)
* [bybit](/exchanges/bybit.md#bybitfetchwithdrawals)
* [coinbase](/exchanges/coinbase.md#coinbasefetchwithdrawals)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangefetchwithdrawals)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalfetchwithdrawals)
* [coincatch](/exchanges/coincatch.md#coincatchfetchwithdrawals)
* [coincheck](/exchanges/coincheck.md#coincheckfetchwithdrawals)
* [coinex](/exchanges/coinex.md#coinexfetchwithdrawals)
* [coinsph](/exchanges/coinsph.md#coinsphfetchwithdrawals)
* [cryptocom](/exchanges/cryptocom.md#cryptocomfetchwithdrawals)
* [deribit](/exchanges/deribit.md#deribitfetchwithdrawals)
* [derive](/exchanges/derive.md#derivefetchwithdrawals)
* [digifinex](/exchanges/digifinex.md#digifinexfetchwithdrawals)
* [exmo](/exchanges/exmo.md#exmofetchwithdrawals)
* [foxbit](/exchanges/foxbit.md#foxbitfetchwithdrawals)
* [gate](/exchanges/gate.md#gatefetchwithdrawals)
* [hashkey](/exchanges/hashkey.md#hashkeyfetchwithdrawals)
* [hibachi](/exchanges/hibachi.md#hibachifetchwithdrawals)
* [hitbtc](/exchanges/hitbtc.md#hitbtcfetchwithdrawals)
* [hollaex](/exchanges/hollaex.md#hollaexfetchwithdrawals)
* [htx](/exchanges/htx.md#htxfetchwithdrawals)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidfetchwithdrawals)
* [kraken](/exchanges/kraken.md#krakenfetchwithdrawals)
* [kucoin](/exchanges/kucoin.md#kucoinfetchwithdrawals)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesfetchwithdrawals)
* [lbank](/exchanges/lbank.md#lbankfetchwithdrawals)
* [mexc](/exchanges/mexc.md#mexcfetchwithdrawals)
* [modetrade](/exchanges/modetrade.md#modetradefetchwithdrawals)
* [ndax](/exchanges/ndax.md#ndaxfetchwithdrawals)
* [novadax](/exchanges/novadax.md#novadaxfetchwithdrawals)
* [okcoin](/exchanges/okcoin.md#okcoinfetchwithdrawals)
* [okx](/exchanges/okx.md#okxfetchwithdrawals)
* [oxfun](/exchanges/oxfun.md#oxfunfetchwithdrawals)
* [paradex](/exchanges/paradex.md#paradexfetchwithdrawals)
* [phemex](/exchanges/phemex.md#phemexfetchwithdrawals)
* [poloniex](/exchanges/poloniex.md#poloniexfetchwithdrawals)
* [probit](/exchanges/probit.md#probitfetchwithdrawals)
* [timex](/exchanges/timex.md#timexfetchwithdrawals)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptofetchwithdrawals)
* [toobit](/exchanges/toobit.md#toobitfetchwithdrawals)
* [upbit](/exchanges/upbit.md#upbitfetchwithdrawals)
* [woo](/exchanges/woo.md#woofetchwithdrawals)
* [woofipro](/exchanges/woofipro.md#woofiprofetchwithdrawals)
* [xt](/exchanges/xt.md#xtfetchwithdrawals)

---

<a name="fetchWithdrawalsWs" id="fetchwithdrawalsws"></a>

## fetchWithdrawalsWs
fetch all withdrawals made from an account

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [transaction structures](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| since | <code>int</code> | No | the earliest time in ms to fetch withdrawals for |
| limit | <code>int</code> | No | the maximum number of withdrawals structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavofetchwithdrawalsws)

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
* [bybit](/exchanges/bybit.md#bybitisunifiedenabled)

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
* [kucoin](/exchanges/kucoin.md#kucoinloadmigrationstatus)

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
* [gate](/exchanges/gate.md#gateloadunifiedstatus)

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
* [&lt;anonymous&gt;](/exchanges/&lt;anonymous&gt;.md#&lt;anonymous&gt;market)

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
* [binance](/exchanges/binance.md#binanceredeemgiftcode)

---

<a name="reduceMargin" id="reducemargin"></a>

## reduceMargin
remove margin from a position

**Kind**: instance   
**Returns**: <code>object</code> - a [margin structure](https://docs.ccxt.com/#/?id=reduce-margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| amount | <code>float</code> | Yes | the amount of margin to remove |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexreducemargin)
* [binance](/exchanges/binance.md#binancereducemargin)
* [bitget](/exchanges/bitget.md#bitgetreducemargin)
* [coincatch](/exchanges/coincatch.md#coincatchreducemargin)
* [coinex](/exchanges/coinex.md#coinexreducemargin)
* [delta](/exchanges/delta.md#deltareducemargin)
* [digifinex](/exchanges/digifinex.md#digifinexreducemargin)
* [exmo](/exchanges/exmo.md#exmoreducemargin)
* [gate](/exchanges/gate.md#gatereducemargin)
* [hitbtc](/exchanges/hitbtc.md#hitbtcreducemargin)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidreducemargin)
* [mexc](/exchanges/mexc.md#mexcreducemargin)
* [okx](/exchanges/okx.md#okxreducemargin)
* [poloniex](/exchanges/poloniex.md#poloniexreducemargin)
* [woo](/exchanges/woo.md#wooreducemargin)
* [xt](/exchanges/xt.md#xtreducemargin)

---

<a name="repayCrossMargin" id="repaycrossmargin"></a>

## repayCrossMargin
repay borrowed margin and interest

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to repay margin in a portfolio margin account |
| params.repayCrossMarginMethod | <code>string</code> | No | *portfolio margin only* 'papiPostRepayLoan' (default), 'papiPostMarginRepayDebt' (alternative) |
| params.specifyRepayAssets | <code>string</code> | No | *portfolio margin papiPostMarginRepayDebt only* specific asset list to repay debt |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancerepaycrossmargin)
* [bitget](/exchanges/bitget.md#bitgetrepaycrossmargin)
* [bybit](/exchanges/bybit.md#bybitrepaycrossmargin)
* [gate](/exchanges/gate.md#gaterepaycrossmargin)
* [htx](/exchanges/htx.md#htxrepaycrossmargin)
* [kucoin](/exchanges/kucoin.md#kucoinrepaycrossmargin)
* [okx](/exchanges/okx.md#okxrepaycrossmargin)

---

<a name="repayIsolatedMargin" id="repayisolatedmargin"></a>

## repayIsolatedMargin
repay borrowed margin and interest

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol, required for isolated margin |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancerepayisolatedmargin)
* [bitget](/exchanges/bitget.md#bitgetrepayisolatedmargin)
* [bitmart](/exchanges/bitmart.md#bitmartrepayisolatedmargin)
* [coinex](/exchanges/coinex.md#coinexrepayisolatedmargin)
* [htx](/exchanges/htx.md#htxrepayisolatedmargin)
* [kucoin](/exchanges/kucoin.md#kucoinrepayisolatedmargin)

---

<a name="repayMargin" id="repaymargin"></a>

## repayMargin
repay borrowed margin and interest

**Kind**: instance   
**Returns**: <code>object</code> - a [margin loan structure](https://docs.ccxt.com/#/?id=margin-loan-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| code | <code>string</code> | Yes | unified currency code of the currency to repay |
| amount | <code>float</code> | Yes | the amount to repay |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.mode | <code>string</code> | No | 'all' or 'partial' payment mode, extra parameter required for isolated margin |
| params.id | <code>string</code> | No | '34267567' loan id, extra parameter required for isolated margin |

##### Supported exchanges
* [gate](/exchanges/gate.md#gaterepaymargin)
* [woo](/exchanges/woo.md#woorepaymargin)

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
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidreserverequestweight)

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
* [apex](/exchanges/apex.md#apexsetleverage)
* [ascendex](/exchanges/ascendex.md#ascendexsetleverage)
* [binance](/exchanges/binance.md#binancesetleverage)
* [bingx](/exchanges/bingx.md#bingxsetleverage)
* [bitget](/exchanges/bitget.md#bitgetsetleverage)
* [bitmart](/exchanges/bitmart.md#bitmartsetleverage)
* [bitmex](/exchanges/bitmex.md#bitmexsetleverage)
* [bitrue](/exchanges/bitrue.md#bitruesetleverage)
* [blofin](/exchanges/blofin.md#blofinsetleverage)
* [bybit](/exchanges/bybit.md#bybitsetleverage)
* [coincatch](/exchanges/coincatch.md#coincatchsetleverage)
* [coinex](/exchanges/coinex.md#coinexsetleverage)
* [defx](/exchanges/defx.md#defxsetleverage)
* [delta](/exchanges/delta.md#deltasetleverage)
* [digifinex](/exchanges/digifinex.md#digifinexsetleverage)
* [gate](/exchanges/gate.md#gatesetleverage)
* [hashkey](/exchanges/hashkey.md#hashkeysetleverage)
* [hitbtc](/exchanges/hitbtc.md#hitbtcsetleverage)
* [htx](/exchanges/htx.md#htxsetleverage)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidsetleverage)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturessetleverage)
* [kucoin](/exchanges/kucoin.md#kucoinsetleverage)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturessetleverage)
* [mexc](/exchanges/mexc.md#mexcsetleverage)
* [modetrade](/exchanges/modetrade.md#modetradesetleverage)
* [okx](/exchanges/okx.md#okxsetleverage)
* [paradex](/exchanges/paradex.md#paradexsetleverage)
* [phemex](/exchanges/phemex.md#phemexsetleverage)
* [poloniex](/exchanges/poloniex.md#poloniexsetleverage)
* [toobit](/exchanges/toobit.md#toobitsetleverage)
* [whitebit](/exchanges/whitebit.md#whitebitsetleverage)
* [woo](/exchanges/woo.md#woosetleverage)
* [woofipro](/exchanges/woofipro.md#woofiprosetleverage)
* [xt](/exchanges/xt.md#xtsetleverage)

---

<a name="setMargin" id="setmargin"></a>

## setMargin
Either adds or reduces margin in an isolated position in order to set the margin to a specific value

**Kind**: instance   
**Returns**: <code>object</code> - A [margin structure](https://docs.ccxt.com/#/?id=add-margin-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market to set margin in |
| amount | <code>float</code> | Yes | the amount to set the margin to |
| params | <code>object</code> | No | parameters specific to the bingx api endpoint |

##### Supported exchanges
* [bingx](/exchanges/bingx.md#bingxsetmargin)
* [bitfinex](/exchanges/bitfinex.md#bitfinexsetmargin)
* [bitrue](/exchanges/bitrue.md#bitruesetmargin)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalsetmargin)
* [phemex](/exchanges/phemex.md#phemexsetmargin)

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
* [ascendex](/exchanges/ascendex.md#ascendexsetmarginmode)
* [binance](/exchanges/binance.md#binancesetmarginmode)
* [bingx](/exchanges/bingx.md#bingxsetmarginmode)
* [bitget](/exchanges/bitget.md#bitgetsetmarginmode)
* [bitmex](/exchanges/bitmex.md#bitmexsetmarginmode)
* [blofin](/exchanges/blofin.md#blofinsetmarginmode)
* [bybit](/exchanges/bybit.md#bybitsetmarginmode)
* [coincatch](/exchanges/coincatch.md#coincatchsetmarginmode)
* [coinex](/exchanges/coinex.md#coinexsetmarginmode)
* [digifinex](/exchanges/digifinex.md#digifinexsetmarginmode)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidsetmarginmode)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturessetmarginmode)
* [mexc](/exchanges/mexc.md#mexcsetmarginmode)
* [okx](/exchanges/okx.md#okxsetmarginmode)
* [paradex](/exchanges/paradex.md#paradexsetmarginmode)
* [phemex](/exchanges/phemex.md#phemexsetmarginmode)
* [toobit](/exchanges/toobit.md#toobitsetmarginmode)
* [xt](/exchanges/xt.md#xtsetmarginmode)

---

<a name="setPositionMode" id="setpositionmode"></a>

## setPositionMode
set hedged to true or false for a market

**Kind**: instance   
**Returns**: <code>object</code> - response from the exchange


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| hedged | <code>bool</code> | Yes | set to true to use dualSidePosition |
| symbol | <code>string</code> | Yes | not used by binance setPositionMode () |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.portfolioMargin | <code>boolean</code> | No | set to true if you would like to set the position mode for a portfolio margin account |
| params.subType | <code>string</code> | No | "linear" or "inverse" |

##### Supported exchanges
* [binance](/exchanges/binance.md#binancesetpositionmode)
* [bingx](/exchanges/bingx.md#bingxsetpositionmode)
* [bitget](/exchanges/bitget.md#bitgetsetpositionmode)
* [bitmart](/exchanges/bitmart.md#bitmartsetpositionmode)
* [blofin](/exchanges/blofin.md#blofinsetpositionmode)
* [bybit](/exchanges/bybit.md#bybitsetpositionmode)
* [coincatch](/exchanges/coincatch.md#coincatchsetpositionmode)
* [gate](/exchanges/gate.md#gatesetpositionmode)
* [htx](/exchanges/htx.md#htxsetpositionmode)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturessetpositionmode)
* [mexc](/exchanges/mexc.md#mexcsetpositionmode)
* [okx](/exchanges/okx.md#okxsetpositionmode)
* [phemex](/exchanges/phemex.md#phemexsetpositionmode)
* [poloniex](/exchanges/poloniex.md#poloniexsetpositionmode)
* [woo](/exchanges/woo.md#woosetpositionmode)

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
* [ndax](/exchanges/ndax.md#ndaxsignin)
* [probit](/exchanges/probit.md#probitsignin)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangesignin)

---

<a name="transfer" id="transfer"></a>

## transfer
transfer currency internally between wallets on the same account

**Kind**: instance   
**Returns**: <code>object</code> - a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | amount to transfer |
| fromAccount | <code>string</code> | Yes | account to transfer from |
| toAccount | <code>string</code> | Yes | account to transfer to |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.transferId | <code>string</code> | No | UUID, which is unique across the platform |

##### Supported exchanges
* [apex](/exchanges/apex.md#apextransfer)
* [ascendex](/exchanges/ascendex.md#ascendextransfer)
* [bigone](/exchanges/bigone.md#bigonetransfer)
* [binance](/exchanges/binance.md#binancetransfer)
* [bingx](/exchanges/bingx.md#bingxtransfer)
* [bitfinex](/exchanges/bitfinex.md#bitfinextransfer)
* [bitget](/exchanges/bitget.md#bitgettransfer)
* [bitmart](/exchanges/bitmart.md#bitmarttransfer)
* [bitrue](/exchanges/bitrue.md#bitruetransfer)
* [bitstamp](/exchanges/bitstamp.md#bitstamptransfer)
* [blofin](/exchanges/blofin.md#blofintransfer)
* [bybit](/exchanges/bybit.md#bybittransfer)
* [cex](/exchanges/cex.md#cextransfer)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationaltransfer)
* [coincatch](/exchanges/coincatch.md#coincatchtransfer)
* [coinex](/exchanges/coinex.md#coinextransfer)
* [deribit](/exchanges/deribit.md#deribittransfer)
* [digifinex](/exchanges/digifinex.md#digifinextransfer)
* [gate](/exchanges/gate.md#gatetransfer)
* [hashkey](/exchanges/hashkey.md#hashkeytransfer)
* [hitbtc](/exchanges/hitbtc.md#hitbtctransfer)
* [htx](/exchanges/htx.md#htxtransfer)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidtransfer)
* [kraken](/exchanges/kraken.md#krakentransfer)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturestransfer)
* [kucoin](/exchanges/kucoin.md#kucointransfer)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturestransfer)
* [latoken](/exchanges/latoken.md#latokentransfer)
* [mexc](/exchanges/mexc.md#mexctransfer)
* [novadax](/exchanges/novadax.md#novadaxtransfer)
* [okcoin](/exchanges/okcoin.md#okcointransfer)
* [okx](/exchanges/okx.md#okxtransfer)
* [oxfun](/exchanges/oxfun.md#oxfuntransfer)
* [paymium](/exchanges/paymium.md#paymiumtransfer)
* [phemex](/exchanges/phemex.md#phemextransfer)
* [poloniex](/exchanges/poloniex.md#poloniextransfer)
* [toobit](/exchanges/toobit.md#toobittransfer)
* [whitebit](/exchanges/whitebit.md#whitebittransfer)
* [woo](/exchanges/woo.md#wootransfer)
* [xt](/exchanges/xt.md#xttransfer)
* [zonda](/exchanges/zonda.md#zondatransfer)

---

<a name="transferOut" id="transferout"></a>

## transferOut
transfer from spot wallet to futures wallet

**Kind**: instance   
**Returns**: a [transfer structure](https://docs.ccxt.com/#/?id=transfer-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>str</code> | Yes | Unified currency code |
| amount | <code>float</code> | Yes | Size of the transfer |
| params | <code>dict</code> | No | Exchange specific parameters |

##### Supported exchanges
* [kraken](/exchanges/kraken.md#krakentransferout)
* [krakenfutures](/exchanges/krakenfutures.md#krakenfuturestransferout)

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
* [backpack](/exchanges/backpack.md#backpackunwatchbidsasks)
* [mexc](/exchanges/mexc.md#mexcunwatchbidsasks)

---

<a name="unWatchMyTrades" id="unwatchmytrades"></a>

## unWatchMyTrades
unWatches information on multiple trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |
| params.executionFast | <code>boolean</code> | No | use fast execution |

##### Supported exchanges
* [bybit](/exchanges/bybit.md#bybitunwatchmytrades)

---

<a name="unWatchOHLCV" id="unwatchohlcv"></a>

## unWatchOHLCV
watches historical candlestick data containing the open, high, low, and close price, and the volume of a market

**Kind**: instance   
**Returns**: <code>Array&lt;Array&lt;int&gt;&gt;</code> - A list of candles ordered as timestamp, open, high, low, close, volume


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch OHLCV data for |
| timeframe | <code>string</code> | Yes | the length of time each candle represents |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchohlcv)
* [bitfinex](/exchanges/bitfinex.md#bitfinexunwatchohlcv)
* [bitget](/exchanges/bitget.md#bitgetunwatchohlcv)
* [bybit](/exchanges/bybit.md#bybitunwatchohlcv)
* [coincatch](/exchanges/coincatch.md#coincatchunwatchohlcv)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchohlcv)
* [defx](/exchanges/defx.md#defxunwatchohlcv)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidunwatchohlcv)
* [kucoin](/exchanges/kucoin.md#kucoinunwatchohlcv)
* [mexc](/exchanges/mexc.md#mexcunwatchohlcv)
* [okx](/exchanges/okx.md#okxunwatchohlcv)

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
* [backpack](/exchanges/backpack.md#backpackunwatchohlcvforsymbols)
* [bybit](/exchanges/bybit.md#bybitunwatchohlcvforsymbols)
* [defx](/exchanges/defx.md#defxunwatchohlcvforsymbols)
* [okx](/exchanges/okx.md#okxunwatchohlcvforsymbols)

---

<a name="unWatchOrderBook" id="unwatchorderbook"></a>

## unWatchOrderBook
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchorderbook)
* [bitget](/exchanges/bitget.md#bitgetunwatchorderbook)
* [bybit](/exchanges/bybit.md#bybitunwatchorderbook)
* [coincatch](/exchanges/coincatch.md#coincatchunwatchorderbook)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchorderbook)
* [defx](/exchanges/defx.md#defxunwatchorderbook)
* [derive](/exchanges/derive.md#deriveunwatchorderbook)
* [gate](/exchanges/gate.md#gateunwatchorderbook)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidunwatchorderbook)
* [kucoin](/exchanges/kucoin.md#kucoinunwatchorderbook)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesunwatchorderbook)
* [mexc](/exchanges/mexc.md#mexcunwatchorderbook)
* [okx](/exchanges/okx.md#okxunwatchorderbook)

---

<a name="unWatchOrderBookForSymbols" id="unwatchorderbookforsymbols"></a>

## unWatchOrderBookForSymbols
unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.method | <code>string</code> | No | either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2' |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchorderbookforsymbols)
* [bybit](/exchanges/bybit.md#bybitunwatchorderbookforsymbols)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchorderbookforsymbols)
* [defx](/exchanges/defx.md#defxunwatchorderbookforsymbols)
* [kucoin](/exchanges/kucoin.md#kucoinunwatchorderbookforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesunwatchorderbookforsymbols)
* [okx](/exchanges/okx.md#okxunwatchorderbookforsymbols)

---

<a name="unWatchOrders" id="unwatchorders"></a>

## unWatchOrders
unWatches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | No | unified market symbol of the market orders were made in |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchorders)
* [bybit](/exchanges/bybit.md#bybitunwatchorders)

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
* [backpack](/exchanges/backpack.md#backpackunwatchpositions)
* [bybit](/exchanges/bybit.md#bybitunwatchpositions)

---

<a name="unWatchTicker" id="unwatchticker"></a>

## unWatchTicker
unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchticker)
* [bitfinex](/exchanges/bitfinex.md#bitfinexunwatchticker)
* [bitget](/exchanges/bitget.md#bitgetunwatchticker)
* [bybit](/exchanges/bybit.md#bybitunwatchticker)
* [coincatch](/exchanges/coincatch.md#coincatchunwatchticker)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchticker)
* [defx](/exchanges/defx.md#defxunwatchticker)
* [kucoin](/exchanges/kucoin.md#kucoinunwatchticker)
* [mexc](/exchanges/mexc.md#mexcunwatchticker)
* [okx](/exchanges/okx.md#okxunwatchticker)

---

<a name="unWatchTickers" id="unwatchtickers"></a>

## unWatchTickers
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchtickers)
* [bybit](/exchanges/bybit.md#bybitunwatchtickers)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchtickers)
* [defx](/exchanges/defx.md#defxunwatchtickers)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidunwatchtickers)
* [mexc](/exchanges/mexc.md#mexcunwatchtickers)
* [okx](/exchanges/okx.md#okxunwatchtickers)

---

<a name="unWatchTrades" id="unwatchtrades"></a>

## unWatchTrades
unWatches from the stream channel

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchtrades)
* [bitfinex](/exchanges/bitfinex.md#bitfinexunwatchtrades)
* [bitget](/exchanges/bitget.md#bitgetunwatchtrades)
* [bybit](/exchanges/bybit.md#bybitunwatchtrades)
* [coincatch](/exchanges/coincatch.md#coincatchunwatchtrades)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchtrades)
* [defx](/exchanges/defx.md#defxunwatchtrades)
* [derive](/exchanges/derive.md#deriveunwatchtrades)
* [gate](/exchanges/gate.md#gateunwatchtrades)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidunwatchtrades)
* [kucoin](/exchanges/kucoin.md#kucoinunwatchtrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesunwatchtrades)
* [mexc](/exchanges/mexc.md#mexcunwatchtrades)
* [okx](/exchanges/okx.md#okxunwatchtrades)

---

<a name="unWatchTradesForSymbols" id="unwatchtradesforsymbols"></a>

## unWatchTradesForSymbols
unWatches from the stream channel

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [backpack](/exchanges/backpack.md#backpackunwatchtradesforsymbols)
* [bybit](/exchanges/bybit.md#bybitunwatchtradesforsymbols)
* [cryptocom](/exchanges/cryptocom.md#cryptocomunwatchtradesforsymbols)
* [defx](/exchanges/defx.md#defxunwatchtradesforsymbols)
* [gate](/exchanges/gate.md#gateunwatchtradesforsymbols)
* [kucoin](/exchanges/kucoin.md#kucoinunwatchtradesforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfuturesunwatchtradesforsymbols)
* [okx](/exchanges/okx.md#okxunwatchtradesforsymbols)

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
* [bybit](/exchanges/bybit.md#bybitupgradeunifiedtradeaccount)

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
* [binance](/exchanges/binance.md#binanceverifygiftcode)

---

<a name="watchBalance" id="watchbalance"></a>

## watchBalance
watch balance and get the amount of funds available for trading or funds locked in orders

**Kind**: instance   
**Returns**: <code>object</code> - a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [ascendex](/exchanges/ascendex.md#ascendexwatchbalance)
* [bingx](/exchanges/bingx.md#bingxwatchbalance)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchbalance)
* [bitget](/exchanges/bitget.md#bitgetwatchbalance)
* [bitmart](/exchanges/bitmart.md#bitmartwatchbalance)
* [bitmex](/exchanges/bitmex.md#bitmexwatchbalance)
* [bitopro](/exchanges/bitopro.md#bitoprowatchbalance)
* [bitrue](/exchanges/bitrue.md#bitruewatchbalance)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomwatchbalance)
* [blofin](/exchanges/blofin.md#blofinwatchbalance)
* [bybit](/exchanges/bybit.md#bybitwatchbalance)
* [cex](/exchanges/cex.md#cexwatchbalance)
* [coincatch](/exchanges/coincatch.md#coincatchwatchbalance)
* [coinex](/exchanges/coinex.md#coinexwatchbalance)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchbalance)
* [defx](/exchanges/defx.md#defxwatchbalance)
* [deribit](/exchanges/deribit.md#deribitwatchbalance)
* [exmo](/exchanges/exmo.md#exmowatchbalance)
* [gate](/exchanges/gate.md#gatewatchbalance)
* [hashkey](/exchanges/hashkey.md#hashkeywatchbalance)
* [hollaex](/exchanges/hollaex.md#hollaexwatchbalance)
* [htx](/exchanges/htx.md#htxwatchbalance)
* [kucoin](/exchanges/kucoin.md#kucoinwatchbalance)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchbalance)
* [lbank](/exchanges/lbank.md#lbankwatchbalance)
* [mexc](/exchanges/mexc.md#mexcwatchbalance)
* [modetrade](/exchanges/modetrade.md#modetradewatchbalance)
* [okcoin](/exchanges/okcoin.md#okcoinwatchbalance)
* [okx](/exchanges/okx.md#okxwatchbalance)
* [onetrading](/exchanges/onetrading.md#onetradingwatchbalance)
* [oxfun](/exchanges/oxfun.md#oxfunwatchbalance)
* [phemex](/exchanges/phemex.md#phemexwatchbalance)
* [probit](/exchanges/probit.md#probitwatchbalance)
* [toobit](/exchanges/toobit.md#toobitwatchbalance)
* [upbit](/exchanges/upbit.md#upbitwatchbalance)
* [whitebit](/exchanges/whitebit.md#whitebitwatchbalance)
* [woo](/exchanges/woo.md#woowatchbalance)
* [woofipro](/exchanges/woofipro.md#woofiprowatchbalance)

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
* [backpack](/exchanges/backpack.md#backpackwatchbidsasks)
* [bitget](/exchanges/bitget.md#bitgetwatchbidsasks)
* [bitmart](/exchanges/bitmart.md#bitmartwatchbidsasks)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchbidsasks)
* [blofin](/exchanges/blofin.md#blofinwatchbidsasks)
* [bybit](/exchanges/bybit.md#bybitwatchbidsasks)
* [coinex](/exchanges/coinex.md#coinexwatchbidsasks)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchbidsasks)
* [defx](/exchanges/defx.md#defxwatchbidsasks)
* [deribit](/exchanges/deribit.md#deribitwatchbidsasks)
* [gate](/exchanges/gate.md#gatewatchbidsasks)
* [gemini](/exchanges/gemini.md#geminiwatchbidsasks)
* [kucoin](/exchanges/kucoin.md#kucoinwatchbidsasks)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchbidsasks)
* [mexc](/exchanges/mexc.md#mexcwatchbidsasks)
* [modetrade](/exchanges/modetrade.md#modetradewatchbidsasks)
* [okx](/exchanges/okx.md#okxwatchbidsasks)
* [oxfun](/exchanges/oxfun.md#oxfunwatchbidsasks)
* [woo](/exchanges/woo.md#woowatchbidsasks)
* [woofipro](/exchanges/woofipro.md#woofiprowatchbidsasks)

---

<a name="watchFundingRate" id="watchfundingrate"></a>

## watchFundingRate
watch the current funding rate

**Kind**: instance   
**Returns**: <code>object</code> - a [funding rate structure](https://docs.ccxt.com/#/?id=funding-rate-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [okx](/exchanges/okx.md#okxwatchfundingrate)

---

<a name="watchFundingRates" id="watchfundingrates"></a>

## watchFundingRates
watch the funding rate for multiple markets

**Kind**: instance   
**Returns**: <code>object</code> - a dictionary of [funding rates structures](https://docs.ccxt.com/#/?id=funding-rates-structure), indexe by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | list of unified market symbols |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalwatchfundingrates)

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
* [bitmex](/exchanges/bitmex.md#bitmexwatchliquidations)
* [bybit](/exchanges/bybit.md#bybitwatchliquidations)

---

<a name="watchLiquidationsForSymbols" id="watchliquidationsforsymbols"></a>

## watchLiquidationsForSymbols
watch the public liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the bitmex api endpoint |

##### Supported exchanges
* [bitmex](/exchanges/bitmex.md#bitmexwatchliquidationsforsymbols)
* [okx](/exchanges/okx.md#okxwatchliquidationsforsymbols)

---

<a name="watchMarkPrice" id="watchmarkprice"></a>

## watchMarkPrice
watches a mark price

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |

##### Supported exchanges
* [okx](/exchanges/okx.md#okxwatchmarkprice)

---

<a name="watchMarkPrices" id="watchmarkprices"></a>

## watchMarkPrices
watches mark prices

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | No | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.channel | <code>string</code> | No | the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers |

##### Supported exchanges
* [okx](/exchanges/okx.md#okxwatchmarkprices)

---

<a name="watchMyLiquidations" id="watchmyliquidations"></a>

## watchMyLiquidations
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
* [gate](/exchanges/gate.md#gatewatchmyliquidations)

---

<a name="watchMyLiquidationsForSymbols" id="watchmyliquidationsforsymbols"></a>

## watchMyLiquidationsForSymbols
watch the private liquidations of a trading pair

**Kind**: instance   
**Returns**: <code>object</code> - an array of [liquidation structures](https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified CCXT market symbols |
| since | <code>int</code> | No | the earliest time in ms to fetch liquidations for |
| limit | <code>int</code> | No | the maximum number of liquidation structures to retrieve |
| params | <code>object</code> | No | exchange specific parameters for the gate api endpoint |

##### Supported exchanges
* [gate](/exchanges/gate.md#gatewatchmyliquidationsforsymbols)
* [okx](/exchanges/okx.md#okxwatchmyliquidationsforsymbols)

---

<a name="watchMyTrades" id="watchmytrades"></a>

## watchMyTrades
watches information on multiple trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |
| params.unifiedMargin | <code>boolean</code> | No | use unified margin account |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacawatchmytrades)
* [apex](/exchanges/apex.md#apexwatchmytrades)
* [bingx](/exchanges/bingx.md#bingxwatchmytrades)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchmytrades)
* [bitget](/exchanges/bitget.md#bitgetwatchmytrades)
* [bitmex](/exchanges/bitmex.md#bitmexwatchmytrades)
* [bitopro](/exchanges/bitopro.md#bitoprowatchmytrades)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchmytrades)
* [bybit](/exchanges/bybit.md#bybitwatchmytrades)
* [cex](/exchanges/cex.md#cexwatchmytrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchmytrades)
* [coinex](/exchanges/coinex.md#coinexwatchmytrades)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchmytrades)
* [deribit](/exchanges/deribit.md#deribitwatchmytrades)
* [derive](/exchanges/derive.md#derivewatchmytrades)
* [exmo](/exchanges/exmo.md#exmowatchmytrades)
* [gate](/exchanges/gate.md#gatewatchmytrades)
* [hashkey](/exchanges/hashkey.md#hashkeywatchmytrades)
* [hollaex](/exchanges/hollaex.md#hollaexwatchmytrades)
* [htx](/exchanges/htx.md#htxwatchmytrades)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwatchmytrades)
* [kucoin](/exchanges/kucoin.md#kucoinwatchmytrades)
* [mexc](/exchanges/mexc.md#mexcwatchmytrades)
* [modetrade](/exchanges/modetrade.md#modetradewatchmytrades)
* [okx](/exchanges/okx.md#okxwatchmytrades)
* [onetrading](/exchanges/onetrading.md#onetradingwatchmytrades)
* [phemex](/exchanges/phemex.md#phemexwatchmytrades)
* [probit](/exchanges/probit.md#probitwatchmytrades)
* [toobit](/exchanges/toobit.md#toobitwatchmytrades)
* [upbit](/exchanges/upbit.md#upbitwatchmytrades)
* [whitebit](/exchanges/whitebit.md#whitebitwatchmytrades)
* [woo](/exchanges/woo.md#woowatchmytrades)
* [woofipro](/exchanges/woofipro.md#woofiprowatchmytrades)

---

<a name="watchMyTradesForSymbols" id="watchmytradesforsymbols"></a>

## watchMyTradesForSymbols
watches information on multiple trades made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | the earliest time in ms to fetch trades for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchmytradesforsymbols)

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
* [alpaca](/exchanges/alpaca.md#alpacawatchohlcv)
* [apex](/exchanges/apex.md#apexwatchohlcv)
* [ascendex](/exchanges/ascendex.md#ascendexwatchohlcv)
* [backpack](/exchanges/backpack.md#backpackwatchohlcv)
* [bingx](/exchanges/bingx.md#bingxwatchohlcv)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchohlcv)
* [bitget](/exchanges/bitget.md#bitgetwatchohlcv)
* [bitmart](/exchanges/bitmart.md#bitmartwatchohlcv)
* [bitmex](/exchanges/bitmex.md#bitmexwatchohlcv)
* [bittrade](/exchanges/bittrade.md#bittradewatchohlcv)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchohlcv)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomwatchohlcv)
* [blofin](/exchanges/blofin.md#blofinwatchohlcv)
* [bybit](/exchanges/bybit.md#bybitwatchohlcv)
* [cex](/exchanges/cex.md#cexwatchohlcv)
* [coincatch](/exchanges/coincatch.md#coincatchwatchohlcv)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchohlcv)
* [defx](/exchanges/defx.md#defxwatchohlcv)
* [deribit](/exchanges/deribit.md#deribitwatchohlcv)
* [gate](/exchanges/gate.md#gatewatchohlcv)
* [gemini](/exchanges/gemini.md#geminiwatchohlcv)
* [hashkey](/exchanges/hashkey.md#hashkeywatchohlcv)
* [htx](/exchanges/htx.md#htxwatchohlcv)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwatchohlcv)
* [kucoin](/exchanges/kucoin.md#kucoinwatchohlcv)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchohlcv)
* [lbank](/exchanges/lbank.md#lbankwatchohlcv)
* [mexc](/exchanges/mexc.md#mexcwatchohlcv)
* [modetrade](/exchanges/modetrade.md#modetradewatchohlcv)
* [ndax](/exchanges/ndax.md#ndaxwatchohlcv)
* [okcoin](/exchanges/okcoin.md#okcoinwatchohlcv)
* [okx](/exchanges/okx.md#okxwatchohlcv)
* [onetrading](/exchanges/onetrading.md#onetradingwatchohlcv)
* [oxfun](/exchanges/oxfun.md#oxfunwatchohlcv)
* [phemex](/exchanges/phemex.md#phemexwatchohlcv)
* [toobit](/exchanges/toobit.md#toobitwatchohlcv)
* [upbit](/exchanges/upbit.md#upbitwatchohlcv)
* [whitebit](/exchanges/whitebit.md#whitebitwatchohlcv)
* [woo](/exchanges/woo.md#woowatchohlcv)
* [woofipro](/exchanges/woofipro.md#woofiprowatchohlcv)

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
* [apex](/exchanges/apex.md#apexwatchohlcvforsymbols)
* [backpack](/exchanges/backpack.md#backpackwatchohlcvforsymbols)
* [bingx](/exchanges/bingx.md#bingxwatchohlcvforsymbols)
* [blofin](/exchanges/blofin.md#blofinwatchohlcvforsymbols)
* [bybit](/exchanges/bybit.md#bybitwatchohlcvforsymbols)
* [defx](/exchanges/defx.md#defxwatchohlcvforsymbols)
* [deribit](/exchanges/deribit.md#deribitwatchohlcvforsymbols)
* [okx](/exchanges/okx.md#okxwatchohlcvforsymbols)
* [oxfun](/exchanges/oxfun.md#oxfunwatchohlcvforsymbols)
* [toobit](/exchanges/toobit.md#toobitwatchohlcvforsymbols)

---

<a name="watchOrderBook" id="watchorderbook"></a>

## watchOrderBook
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the order book for |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacawatchorderbook)
* [apex](/exchanges/apex.md#apexwatchorderbook)
* [ascendex](/exchanges/ascendex.md#ascendexwatchorderbook)
* [backpack](/exchanges/backpack.md#backpackwatchorderbook)
* [bingx](/exchanges/bingx.md#bingxwatchorderbook)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchorderbook)
* [bitget](/exchanges/bitget.md#bitgetwatchorderbook)
* [bithumb](/exchanges/bithumb.md#bithumbwatchorderbook)
* [bitmart](/exchanges/bitmart.md#bitmartwatchorderbook)
* [bitmex](/exchanges/bitmex.md#bitmexwatchorderbook)
* [bitopro](/exchanges/bitopro.md#bitoprowatchorderbook)
* [bitstamp](/exchanges/bitstamp.md#bitstampwatchorderbook)
* [bittrade](/exchanges/bittrade.md#bittradewatchorderbook)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchorderbook)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomwatchorderbook)
* [blofin](/exchanges/blofin.md#blofinwatchorderbook)
* [bybit](/exchanges/bybit.md#bybitwatchorderbook)
* [cex](/exchanges/cex.md#cexwatchorderbook)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchorderbook)
* [coincatch](/exchanges/coincatch.md#coincatchwatchorderbook)
* [coincheck](/exchanges/coincheck.md#coincheckwatchorderbook)
* [coinex](/exchanges/coinex.md#coinexwatchorderbook)
* [coinone](/exchanges/coinone.md#coinonewatchorderbook)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchorderbook)
* [defx](/exchanges/defx.md#defxwatchorderbook)
* [deribit](/exchanges/deribit.md#deribitwatchorderbook)
* [derive](/exchanges/derive.md#derivewatchorderbook)
* [exmo](/exchanges/exmo.md#exmowatchorderbook)
* [gate](/exchanges/gate.md#gatewatchorderbook)
* [gemini](/exchanges/gemini.md#geminiwatchorderbook)
* [hashkey](/exchanges/hashkey.md#hashkeywatchorderbook)
* [hollaex](/exchanges/hollaex.md#hollaexwatchorderbook)
* [htx](/exchanges/htx.md#htxwatchorderbook)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwatchorderbook)
* [independentreserve](/exchanges/independentreserve.md#independentreservewatchorderbook)
* [kucoin](/exchanges/kucoin.md#kucoinwatchorderbook)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchorderbook)
* [lbank](/exchanges/lbank.md#lbankwatchorderbook)
* [luno](/exchanges/luno.md#lunowatchorderbook)
* [mexc](/exchanges/mexc.md#mexcwatchorderbook)
* [modetrade](/exchanges/modetrade.md#modetradewatchorderbook)
* [ndax](/exchanges/ndax.md#ndaxwatchorderbook)
* [okcoin](/exchanges/okcoin.md#okcoinwatchorderbook)
* [okx](/exchanges/okx.md#okxwatchorderbook)
* [onetrading](/exchanges/onetrading.md#onetradingwatchorderbook)
* [oxfun](/exchanges/oxfun.md#oxfunwatchorderbook)
* [phemex](/exchanges/phemex.md#phemexwatchorderbook)
* [probit](/exchanges/probit.md#probitwatchorderbook)
* [toobit](/exchanges/toobit.md#toobitwatchorderbook)
* [upbit](/exchanges/upbit.md#upbitwatchorderbook)
* [whitebit](/exchanges/whitebit.md#whitebitwatchorderbook)
* [woo](/exchanges/woo.md#woowatchorderbook)
* [woofipro](/exchanges/woofipro.md#woofiprowatchorderbook)

---

<a name="watchOrderBookForSymbols" id="watchorderbookforsymbols"></a>

## watchOrderBookForSymbols
watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data

**Kind**: instance   
**Returns**: <code>object</code> - A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified array of symbols |
| limit | <code>int</code> | No | the maximum amount of order book entries to return. |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexwatchorderbookforsymbols)
* [backpack](/exchanges/backpack.md#backpackwatchorderbookforsymbols)
* [bingx](/exchanges/bingx.md#bingxwatchorderbookforsymbols)
* [bitget](/exchanges/bitget.md#bitgetwatchorderbookforsymbols)
* [bitmart](/exchanges/bitmart.md#bitmartwatchorderbookforsymbols)
* [bitmex](/exchanges/bitmex.md#bitmexwatchorderbookforsymbols)
* [blofin](/exchanges/blofin.md#blofinwatchorderbookforsymbols)
* [bybit](/exchanges/bybit.md#bybitwatchorderbookforsymbols)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchorderbookforsymbols)
* [coincatch](/exchanges/coincatch.md#coincatchwatchorderbookforsymbols)
* [coinex](/exchanges/coinex.md#coinexwatchorderbookforsymbols)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchorderbookforsymbols)
* [defx](/exchanges/defx.md#defxwatchorderbookforsymbols)
* [deribit](/exchanges/deribit.md#deribitwatchorderbookforsymbols)
* [gemini](/exchanges/gemini.md#geminiwatchorderbookforsymbols)
* [kucoin](/exchanges/kucoin.md#kucoinwatchorderbookforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchorderbookforsymbols)
* [okx](/exchanges/okx.md#okxwatchorderbookforsymbols)
* [oxfun](/exchanges/oxfun.md#oxfunwatchorderbookforsymbols)
* [toobit](/exchanges/toobit.md#toobitwatchorderbookforsymbols)

---

<a name="watchOrders" id="watchorders"></a>

## watchOrders
watches information on multiple orders made by the user

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market orders were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacawatchorders)
* [apex](/exchanges/apex.md#apexwatchorders)
* [ascendex](/exchanges/ascendex.md#ascendexwatchorders)
* [backpack](/exchanges/backpack.md#backpackwatchorders)
* [bingx](/exchanges/bingx.md#bingxwatchorders)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchorders)
* [bitget](/exchanges/bitget.md#bitgetwatchorders)
* [bitmart](/exchanges/bitmart.md#bitmartwatchorders)
* [bitmex](/exchanges/bitmex.md#bitmexwatchorders)
* [bitrue](/exchanges/bitrue.md#bitruewatchorders)
* [bitstamp](/exchanges/bitstamp.md#bitstampwatchorders)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchorders)
* [biofin](/exchanges/biofin.md#biofinwatchorders)
* [bybit](/exchanges/bybit.md#bybitwatchorders)
* [cex](/exchanges/cex.md#cexwatchorders)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchorders)
* [coincatch](/exchanges/coincatch.md#coincatchwatchorders)
* [coinex](/exchanges/coinex.md#coinexwatchorders)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchorders)
* [defx](/exchanges/defx.md#defxwatchorders)
* [deribit](/exchanges/deribit.md#deribitwatchorders)
* [derive](/exchanges/derive.md#derivewatchorders)
* [exmo](/exchanges/exmo.md#exmowatchorders)
* [gate](/exchanges/gate.md#gatewatchorders)
* [hashkey](/exchanges/hashkey.md#hashkeywatchorders)
* [hollaex](/exchanges/hollaex.md#hollaexwatchorders)
* [htx](/exchanges/htx.md#htxwatchorders)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwatchorders)
* [kucoin](/exchanges/kucoin.md#kucoinwatchorders)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchorders)
* [lbank](/exchanges/lbank.md#lbankwatchorders)
* [mexc](/exchanges/mexc.md#mexcwatchorders)
* [modetrade](/exchanges/modetrade.md#modetradewatchorders)
* [okcoin](/exchanges/okcoin.md#okcoinwatchorders)
* [okx](/exchanges/okx.md#okxwatchorders)
* [onetrading](/exchanges/onetrading.md#onetradingwatchorders)
* [oxfun](/exchanges/oxfun.md#oxfunwatchorders)
* [phemex](/exchanges/phemex.md#phemexwatchorders)
* [probit](/exchanges/probit.md#probitwatchorders)
* [toobit](/exchanges/toobit.md#toobitwatchorders)
* [upbit](/exchanges/upbit.md#upbitwatchorders)
* [whitebit](/exchanges/whitebit.md#whitebitwatchorders)
* [woo](/exchanges/woo.md#woowatchorders)
* [woofipro](/exchanges/woofipro.md#woofiprowatchorders)

---

<a name="watchOrdersForSymbols" id="watchordersforsymbols"></a>

## watchOrdersForSymbols
watches information on multiple orders made by the user across multiple symbols

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes |  |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of order structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [blofin](/exchanges/blofin.md#blofinwatchordersforsymbols)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchordersforsymbols)

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
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchposition)

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
* [apex](/exchanges/apex.md#apexwatchpositions)
* [backpack](/exchanges/backpack.md#backpackwatchpositions)
* [bitget](/exchanges/bitget.md#bitgetwatchpositions)
* [bitmart](/exchanges/bitmart.md#bitmartwatchpositions)
* [bitmex](/exchanges/bitmex.md#bitmexwatchpositions)
* [blofin](/exchanges/blofin.md#blofinwatchpositions)
* [bybit](/exchanges/bybit.md#bybitwatchpositions)
* [coincatch](/exchanges/coincatch.md#coincatchwatchpositions)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchpositions)
* [defx](/exchanges/defx.md#defxwatchpositions)
* [gate](/exchanges/gate.md#gatewatchpositions)
* [hashkey](/exchanges/hashkey.md#hashkeywatchpositions)
* [htx](/exchanges/htx.md#htxwatchpositions)
* [modetrade](/exchanges/modetrade.md#modetradewatchpositions)
* [okx](/exchanges/okx.md#okxwatchpositions)
* [oxfun](/exchanges/oxfun.md#oxfunwatchpositions)
* [toobit](/exchanges/toobit.md#toobitwatchpositions)
* [woo](/exchanges/woo.md#woowatchpositions)
* [woofipro](/exchanges/woofipro.md#woofiprowatchpositions)

---

<a name="watchTicker" id="watchticker"></a>

## watchTicker
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacawatchticker)
* [apex](/exchanges/apex.md#apexwatchticker)
* [backpack](/exchanges/backpack.md#backpackwatchticker)
* [bingx](/exchanges/bingx.md#bingxwatchticker)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchticker)
* [bitget](/exchanges/bitget.md#bitgetwatchticker)
* [bithumb](/exchanges/bithumb.md#bithumbwatchticker)
* [bitmart](/exchanges/bitmart.md#bitmartwatchticker)
* [bitmex](/exchanges/bitmex.md#bitmexwatchticker)
* [bitopro](/exchanges/bitopro.md#bitoprowatchticker)
* [bittrade](/exchanges/bittrade.md#bittradewatchticker)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchticker)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomwatchticker)
* [blofin](/exchanges/blofin.md#blofinwatchticker)
* [bybit](/exchanges/bybit.md#bybitwatchticker)
* [cex](/exchanges/cex.md#cexwatchticker)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchticker)
* [coincatch](/exchanges/coincatch.md#coincatchwatchticker)
* [coinex](/exchanges/coinex.md#coinexwatchticker)
* [coinone](/exchanges/coinone.md#coinonewatchticker)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchticker)
* [defx](/exchanges/defx.md#defxwatchticker)
* [deribit](/exchanges/deribit.md#deribitwatchticker)
* [derive](/exchanges/derive.md#derivewatchticker)
* [exmo](/exchanges/exmo.md#exmowatchticker)
* [gate](/exchanges/gate.md#gatewatchticker)
* [hahskey](/exchanges/hahskey.md#hahskeywatchticker)
* [htx](/exchanges/htx.md#htxwatchticker)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwatchticker)
* [kucoin](/exchanges/kucoin.md#kucoinwatchticker)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchticker)
* [lbank](/exchanges/lbank.md#lbankwatchticker)
* [mexc](/exchanges/mexc.md#mexcwatchticker)
* [modetrade](/exchanges/modetrade.md#modetradewatchticker)
* [ndax](/exchanges/ndax.md#ndaxwatchticker)
* [okcoin](/exchanges/okcoin.md#okcoinwatchticker)
* [okx](/exchanges/okx.md#okxwatchticker)
* [onetrading](/exchanges/onetrading.md#onetradingwatchticker)
* [oxfun](/exchanges/oxfun.md#oxfunwatchticker)
* [phemex](/exchanges/phemex.md#phemexwatchticker)
* [probit](/exchanges/probit.md#probitwatchticker)
* [toobit](/exchanges/toobit.md#toobitwatchticker)
* [upbit](/exchanges/upbit.md#upbitwatchticker)
* [whitebit](/exchanges/whitebit.md#whitebitwatchticker)
* [woo](/exchanges/woo.md#woowatchticker)
* [woofipro](/exchanges/woofipro.md#woofiprowatchticker)

---

<a name="watchTickers" id="watchtickers"></a>

## watchTickers
watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list

**Kind**: instance   
**Returns**: <code>object</code> - a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch the ticker for |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexwatchtickers)
* [backpack](/exchanges/backpack.md#backpackwatchtickers)
* [bingx](/exchanges/bingx.md#bingxwatchtickers)
* [bitget](/exchanges/bitget.md#bitgetwatchtickers)
* [bithumb](/exchanges/bithumb.md#bithumbwatchtickers)
* [bitmart](/exchanges/bitmart.md#bitmartwatchtickers)
* [bitmex](/exchanges/bitmex.md#bitmexwatchtickers)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchtickers)
* [blofin](/exchanges/blofin.md#blofinwatchtickers)
* [bybit](/exchanges/bybit.md#bybitwatchtickers)
* [cex](/exchanges/cex.md#cexwatchtickers)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchtickers)
* [coincatch](/exchanges/coincatch.md#coincatchwatchtickers)
* [coinex](/exchanges/coinex.md#coinexwatchtickers)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchtickers)
* [defx](/exchanges/defx.md#defxwatchtickers)
* [deribit](/exchanges/deribit.md#deribitwatchtickers)
* [exmo](/exchanges/exmo.md#exmowatchtickers)
* [gate](/exchanges/gate.md#gatewatchtickers)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwatchtickers)
* [kucoin](/exchanges/kucoin.md#kucoinwatchtickers)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchtickers)
* [mexc](/exchanges/mexc.md#mexcwatchtickers)
* [modetrade](/exchanges/modetrade.md#modetradewatchtickers)
* [okx](/exchanges/okx.md#okxwatchtickers)
* [onetrading](/exchanges/onetrading.md#onetradingwatchtickers)
* [oxfun](/exchanges/oxfun.md#oxfunwatchtickers)
* [phemex](/exchanges/phemex.md#phemexwatchtickers)
* [toobit](/exchanges/toobit.md#toobitwatchtickers)
* [upbit](/exchanges/upbit.md#upbitwatchtickers)
* [whitebit](/exchanges/whitebit.md#whitebitwatchtickers)
* [woo](/exchanges/woo.md#woowatchtickers)
* [woofipro](/exchanges/woofipro.md#woofiprowatchtickers)

---

<a name="watchTrades" id="watchtrades"></a>

## watchTrades
watches information on multiple trades made in a market

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbol | <code>string</code> | Yes | unified market symbol of the market trades were made in |
| since | <code>int</code> | No | the earliest time in ms to fetch orders for |
| limit | <code>int</code> | No | the maximum number of trade structures to retrieve |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacawatchtrades)
* [apex](/exchanges/apex.md#apexwatchtrades)
* [ascendex](/exchanges/ascendex.md#ascendexwatchtrades)
* [backpack](/exchanges/backpack.md#backpackwatchtrades)
* [bingx](/exchanges/bingx.md#bingxwatchtrades)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwatchtrades)
* [bitget](/exchanges/bitget.md#bitgetwatchtrades)
* [bithumb](/exchanges/bithumb.md#bithumbwatchtrades)
* [bitmart](/exchanges/bitmart.md#bitmartwatchtrades)
* [bitmex](/exchanges/bitmex.md#bitmexwatchtrades)
* [bitopro](/exchanges/bitopro.md#bitoprowatchtrades)
* [bitstamp](/exchanges/bitstamp.md#bitstampwatchtrades)
* [bittrade](/exchanges/bittrade.md#bittradewatchtrades)
* [bitvavo](/exchanges/bitvavo.md#bitvavowatchtrades)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomwatchtrades)
* [blofin](/exchanges/blofin.md#blofinwatchtrades)
* [bybit](/exchanges/bybit.md#bybitwatchtrades)
* [cex](/exchanges/cex.md#cexwatchtrades)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewatchtrades)
* [coincatch](/exchanges/coincatch.md#coincatchwatchtrades)
* [coincheck](/exchanges/coincheck.md#coincheckwatchtrades)
* [coinex](/exchanges/coinex.md#coinexwatchtrades)
* [coinone](/exchanges/coinone.md#coinonewatchtrades)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchtrades)
* [defx](/exchanges/defx.md#defxwatchtrades)
* [deribit](/exchanges/deribit.md#deribitwatchtrades)
* [derive](/exchanges/derive.md#derivewatchtrades)
* [exmo](/exchanges/exmo.md#exmowatchtrades)
* [gate](/exchanges/gate.md#gatewatchtrades)
* [gemini](/exchanges/gemini.md#geminiwatchtrades)
* [hashkey](/exchanges/hashkey.md#hashkeywatchtrades)
* [hollaex](/exchanges/hollaex.md#hollaexwatchtrades)
* [htx](/exchanges/htx.md#htxwatchtrades)
* [independentreserve](/exchanges/independentreserve.md#independentreservewatchtrades)
* [kucoin](/exchanges/kucoin.md#kucoinwatchtrades)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchtrades)
* [lbank](/exchanges/lbank.md#lbankwatchtrades)
* [luno](/exchanges/luno.md#lunowatchtrades)
* [mexc](/exchanges/mexc.md#mexcwatchtrades)
* [modetrade](/exchanges/modetrade.md#modetradewatchtrades)
* [ndax](/exchanges/ndax.md#ndaxwatchtrades)
* [okcoin](/exchanges/okcoin.md#okcoinwatchtrades)
* [okx](/exchanges/okx.md#okxwatchtrades)
* [oxfun](/exchanges/oxfun.md#oxfunwatchtrades)
* [phemex](/exchanges/phemex.md#phemexwatchtrades)
* [probit](/exchanges/probit.md#probitwatchtrades)
* [toobit](/exchanges/toobit.md#toobitwatchtrades)
* [upbit](/exchanges/upbit.md#upbitwatchtrades)
* [whitebit](/exchanges/whitebit.md#whitebitwatchtrades)
* [woo](/exchanges/woo.md#woowatchtrades)
* [woofipro](/exchanges/woofipro.md#woofiprowatchtrades)

---

<a name="watchTradesForSymbols" id="watchtradesforsymbols"></a>

## watchTradesForSymbols
get the list of most recent trades for a list of symbols

**Kind**: instance   
**Returns**: <code>Array&lt;object&gt;</code> - a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| symbols | <code>Array&lt;string&gt;</code> | Yes | unified symbol of the market to fetch trades for |
| since | <code>int</code> | No | timestamp in ms of the earliest trade to fetch |
| limit | <code>int</code> | No | the maximum amount of trades to fetch |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [apex](/exchanges/apex.md#apexwatchtradesforsymbols)
* [ascendex](/exchanges/ascendex.md#ascendexwatchtradesforsymbols)
* [backpack](/exchanges/backpack.md#backpackwatchtradesforsymbols)
* [bitget](/exchanges/bitget.md#bitgetwatchtradesforsymbols)
* [bitmart](/exchanges/bitmart.md#bitmartwatchtradesforsymbols)
* [bitmex](/exchanges/bitmex.md#bitmexwatchtradesforsymbols)
* [blofin](/exchanges/blofin.md#blofinwatchtradesforsymbols)
* [bybit](/exchanges/bybit.md#bybitwatchtradesforsymbols)
* [coinbase](/exchanges/coinbase.md#coinbasewatchtradesforsymbols)
* [coincatch](/exchanges/coincatch.md#coincatchwatchtradesforsymbols)
* [coinex](/exchanges/coinex.md#coinexwatchtradesforsymbols)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwatchtradesforsymbols)
* [defx](/exchanges/defx.md#defxwatchtradesforsymbols)
* [deribit](/exchanges/deribit.md#deribitwatchtradesforsymbols)
* [gate](/exchanges/gate.md#gatewatchtradesforsymbols)
* [gemini](/exchanges/gemini.md#geminiwatchtradesforsymbols)
* [kucoin](/exchanges/kucoin.md#kucoinwatchtradesforsymbols)
* [kucoinfutures](/exchanges/kucoinfutures.md#kucoinfutureswatchtradesforsymbols)
* [okx](/exchanges/okx.md#okxwatchtradesforsymbols)
* [oxfun](/exchanges/oxfun.md#oxfunwatchtradesforsymbols)
* [toobit](/exchanges/toobit.md#toobitwatchtradesforsymbols)
* [upbit](/exchanges/upbit.md#upbitwatchtradesforsymbols)

---

<a name="withdraw" id="withdraw"></a>

## withdraw
make a withdrawal

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes | a memo for the transaction |
| params | <code>object</code> | No | extra parameters specific to the exchange API endpoint |

##### Supported exchanges
* [alpaca](/exchanges/alpaca.md#alpacawithdraw)
* [backpack](/exchanges/backpack.md#backpackwithdraw)
* [bigone](/exchanges/bigone.md#bigonewithdraw)
* [binance](/exchanges/binance.md#binancewithdraw)
* [bingx](/exchanges/bingx.md#bingxwithdraw)
* [bitbank](/exchanges/bitbank.md#bitbankwithdraw)
* [bitfinex](/exchanges/bitfinex.md#bitfinexwithdraw)
* [bitflyer](/exchanges/bitflyer.md#bitflyerwithdraw)
* [bitget](/exchanges/bitget.md#bitgetwithdraw)
* [bithumb](/exchanges/bithumb.md#bithumbwithdraw)
* [bitmart](/exchanges/bitmart.md#bitmartwithdraw)
* [bitmex](/exchanges/bitmex.md#bitmexwithdraw)
* [bitopro](/exchanges/bitopro.md#bitoprowithdraw)
* [bitrue](/exchanges/bitrue.md#bitruewithdraw)
* [bitso](/exchanges/bitso.md#bitsowithdraw)
* [bitstamp](/exchanges/bitstamp.md#bitstampwithdraw)
* [bittrade](/exchanges/bittrade.md#bittradewithdraw)
* [bitvavo](/exchanges/bitvavo.md#bitvavowithdraw)
* [blockchaincom](/exchanges/blockchaincom.md#blockchaincomwithdraw)
* [btcmarkets](/exchanges/btcmarkets.md#btcmarketswithdraw)
* [bybit](/exchanges/bybit.md#bybitwithdraw)
* [coinbase](/exchanges/coinbase.md#coinbasewithdraw)
* [coinbaseexchange](/exchanges/coinbaseexchange.md#coinbaseexchangewithdraw)
* [coinbaseinternational](/exchanges/coinbaseinternational.md#coinbaseinternationalwithdraw)
* [coincatch](/exchanges/coincatch.md#coincatchwithdraw)
* [coinex](/exchanges/coinex.md#coinexwithdraw)
* [coinmate](/exchanges/coinmate.md#coinmatewithdraw)
* [coinsph](/exchanges/coinsph.md#coinsphwithdraw)
* [cryptocom](/exchanges/cryptocom.md#cryptocomwithdraw)
* [defx](/exchanges/defx.md#defxwithdraw)
* [deribit](/exchanges/deribit.md#deribitwithdraw)
* [digifinex](/exchanges/digifinex.md#digifinexwithdraw)
* [exmo](/exchanges/exmo.md#exmowithdraw)
* [foxbit](/exchanges/foxbit.md#foxbitwithdraw)
* [gate](/exchanges/gate.md#gatewithdraw)
* [gemini](/exchanges/gemini.md#geminiwithdraw)
* [hashkey](/exchanges/hashkey.md#hashkeywithdraw)
* [hibachi](/exchanges/hibachi.md#hibachiwithdraw)
* [hitbtc](/exchanges/hitbtc.md#hitbtcwithdraw)
* [hollaex](/exchanges/hollaex.md#hollaexwithdraw)
* [htx](/exchanges/htx.md#htxwithdraw)
* [hyperliquid](/exchanges/hyperliquid.md#hyperliquidwithdraw)
* [independentreserve](/exchanges/independentreserve.md#independentreservewithdraw)
* [indodax](/exchanges/indodax.md#indodaxwithdraw)
* [kraken](/exchanges/kraken.md#krakenwithdraw)
* [kucoin](/exchanges/kucoin.md#kucoinwithdraw)
* [lbank](/exchanges/lbank.md#lbankwithdraw)
* [mercado](/exchanges/mercado.md#mercadowithdraw)
* [mexc](/exchanges/mexc.md#mexcwithdraw)
* [modetrade](/exchanges/modetrade.md#modetradewithdraw)
* [ndax](/exchanges/ndax.md#ndaxwithdraw)
* [novadax](/exchanges/novadax.md#novadaxwithdraw)
* [okcoin](/exchanges/okcoin.md#okcoinwithdraw)
* [okx](/exchanges/okx.md#okxwithdraw)
* [oxfun](/exchanges/oxfun.md#oxfunwithdraw)
* [phemex](/exchanges/phemex.md#phemexwithdraw)
* [poloniex](/exchanges/poloniex.md#poloniexwithdraw)
* [probit](/exchanges/probit.md#probitwithdraw)
* [tokocrypto](/exchanges/tokocrypto.md#tokocryptowithdraw)
* [toobit](/exchanges/toobit.md#toobitwithdraw)
* [upbit](/exchanges/upbit.md#upbitwithdraw)
* [wavesexchange](/exchanges/wavesexchange.md#wavesexchangewithdraw)
* [whitebit](/exchanges/whitebit.md#whitebitwithdraw)
* [woo](/exchanges/woo.md#woowithdraw)
* [woofipro](/exchanges/woofipro.md#woofiprowithdraw)
* [xt](/exchanges/xt.md#xtwithdraw)
* [yobit](/exchanges/yobit.md#yobitwithdraw)
* [zaif](/exchanges/zaif.md#zaifwithdraw)
* [zonda](/exchanges/zonda.md#zondawithdraw)

---

<a name="withdrawWs" id="withdrawws"></a>

## withdrawWs
make a withdrawal

**Kind**: instance   
**Returns**: <code>object</code> - a [transaction structure](https://docs.ccxt.com/#/?id=transaction-structure)


| Param | Type | Required | Description |
| --- | --- | --- | --- |
| code | <code>string</code> | Yes | unified currency code |
| amount | <code>float</code> | Yes | the amount to withdraw |
| address | <code>string</code> | Yes | the address to withdraw to |
| tag | <code>string</code> | Yes |  |
| params | <code>object</code> | No | extra parameters specific to the bitvavo api endpoint |

##### Supported exchanges
* [bitvavo](/exchanges/bitvavo.md#bitvavowithdrawws)
