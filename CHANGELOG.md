# Сhangelog

## Version 1.10.1 2017-11-06

- Fixed YoBit `create_order()`, [#465](https://github.com/ccxt-dev/ccxt/issues/465)
- Fixed Poloniex in Python async, [#461](https://github.com/ccxt-dev/ccxt/issues/461)
- Fixed HitBTC createOrder in Python async, [#460](https://github.com/ccxt-dev/ccxt/issues/460)
- Fixed BCH withdrawals with Bitfinex, [#457](https://github.com/ccxt-dev/ccxt/issues/457)
- Fixed USD/USDT withdrawals with Bitfinex, [#456](https://github.com/ccxt-dev/ccxt/issues/456)
- Added throttle() to Python asyncio, [#297](https://github.com/ccxt-dev/ccxt/issues/297), [#373](https://github.com/ccxt-dev/ccxt/pull/373)
- Split the sources into multiple files, [#233](https://github.com/ccxt-dev/ccxt/issues/233)
- Fixed BCH vs BCC on HitBTC, [#447](https://github.com/ccxt-dev/ccxt/issues/447)
- Fixed the build sequence for Windows, [#445](https://github.com/ccxt-dev/ccxt/issues/445)
- Fixed Huobi `fetchBalance()` and `createOrder()`, [#444](https://github.com/ccxt-dev/ccxt/issues/444)
- Fixed UTF-8 decoding error in Bitfinex, [#441](https://github.com/ccxt-dev/ccxt/issues/441)
- Fixed Gemini `createrder()`, [#436](https://github.com/ccxt-dev/ccxt/issues/436)
- Fixed OKCoinUSD `fetchTrades()` ids integers → strings, [#434](https://github.com/ccxt-dev/ccxt/issues/434)
- Added handling for InvalidOrder to GDAX, [#427](https://github.com/ccxt-dev/ccxt/issues/427)
- Fixed GDAX fills' parsing, [#417](https://github.com/ccxt-dev/ccxt/issues/417)
- Added Bter/Gate.io `withdraw()`, [#413](https://github.com/ccxt-dev/ccxt/issues/413)
- Fixed GDAX fills' sides, [#410](https://github.com/ccxt-dev/ccxt/issues/410)
- Fixed GDAX precision strings → floats, [#405](https://github.com/ccxt-dev/ccxt/issues/405)
- Binance now supporting both BCC (BitConnect) and BCH (Bitcoin Cash), [#402](https://github.com/ccxt-dev/ccxt/issues/402)
- Added BCH/BRL market to Mercado Bitcoin, [#400](https://github.com/ccxt-dev/ccxt/issues/400)
- Fixed handling of Bitfinex errors, [#399](https://github.com/ccxt-dev/ccxt/issues/399)
- Fixed bitflyer fetch_balance in Python, [#394](https://github.com/ccxt-dev/ccxt/issues/394)
- Fixed Liqui rounding triggering InsufficientFunds, [#393](https://github.com/ccxt-dev/ccxt/issues/393)
- Fixed multiple symbol inconsistencies with Cryptopia, [#390](https://github.com/ccxt-dev/ccxt/issues/390)
- Fixed reversed ticker bidasks form WEX, [#389](https://github.com/ccxt-dev/ccxt/issues/389)
- Fixed GDAX order status, [#388](https://github.com/ccxt-dev/ccxt/issues/388)
- Fixed fetchTrades timestamps from Bitstamp, [#384](https://github.com/ccxt-dev/ccxt/issues/384)
- Added fetchOHLCV to Bitfinex v1, [#379](https://github.com/ccxt-dev/ccxt/issues/379)
- Fixed Bitfinex v2 OCHLV → OHLCV, [#374](https://github.com/ccxt-dev/ccxt/issues/374)
- Fixed symbol in Kraken fetchMyTrades, [#367](https://github.com/ccxt-dev/ccxt/issues/367)
- Added QTUM/KRW market to bithumb, [#366](https://github.com/ccxt-dev/ccxt/issues/366)
- Unified all fetchOrderBook() method signatures, [#365](https://github.com/ccxt-dev/ccxt/issues/365)
- Added fees, precision, limits, fixed nonce for CEX.io, [#364](https://github.com/ccxt-dev/ccxt/pull/364)
- Added fetchOpenOrders to BTCTrade UA, [#363](https://github.com/ccxt-dev/ccxt/pull/363)
- Added multiple significant improvements and fixes to HitBTC v2, [#362](https://github.com/ccxt-dev/ccxt/pull/362)
- Added aiohttp proxy support to Python async version, [#358](https://github.com/ccxt-dev/ccxt/issues/358)
- Resolved FCN → Facilecoin conflict on Cryptopia, [#357](https://github.com/ccxt-dev/ccxt/issues/357)
- Added support for a new exchange: [Gate.io](https://gate.io/) (China), [#353](https://github.com/ccxt-dev/ccxt/issues/353)
- Fixed fetchBalance() error handling for BTCTrade UA, [#352](https://github.com/ccxt-dev/ccxt/pull/352)
- Fixed amount in fetchMyTrades for BTCTrade UA, [#351](https://github.com/ccxt-dev/ccxt/pull/351)
- Resolved ICN, AIR, ANR, ATM, DCT, DGD, LUN conflicts for YoBit, [#350](https://github.com/ccxt-dev/ccxt/issues/350)
- Added fetchOHLCV() to Poloniex, [#349](https://github.com/ccxt-dev/ccxt/issues/349)
- Mapped BTM → Bitmark on Poloniex to resolve a conflict with BTM for Bytom, [#348](https://github.com/ccxt-dev/ccxt/issues/348)
- Added deposit() method to Cryptopia, [#347](https://github.com/ccxt-dev/ccxt/issues/347)
- Added fetchOrder() to bitstamp, [#346](https://github.com/ccxt-dev/ccxt/pull/346)
- Fixed SouthXchange withdraw(), [#344](https://github.com/ccxt-dev/ccxt/issues/344)
- Fixed Bleutrade fetchBalance return, [#341](https://github.com/ccxt-dev/ccxt/issues/341)
- Fixed OKCoin and OKEX cancelOrder, [#336](https://github.com/ccxt-dev/ccxt/issues/336)
- Fixed Bithumb fetchBalance return, [#333](https://github.com/ccxt-dev/ccxt/issues/333)
- Added support for a new exchange: [Kuna](kuna.io) (Ukraine), [#330](https://github.com/ccxt-dev/ccxt/pull/330), [#331](https://github.com/ccxt-dev/ccxt/pull/331), [#332](https://github.com/ccxt-dev/ccxt/pull/332), [#339](https://github.com/ccxt-dev/ccxt/pull/339)
- Fixed YoBit fetchBalance return, [#329](https://github.com/ccxt-dev/ccxt/issues/329)
- Fixed Huobi PRO fetchBalance return, [#328](https://github.com/ccxt-dev/ccxt/issues/328)
- Fixed GMT → UTC with some exchanges in JavaScript [#325](https://github.com/ccxt-dev/ccxt/issues/325)
- Yunbi, BTCChina, OKCoin CNY shutdown
![btcchina shutdown](https://user-images.githubusercontent.com/1294454/31608027-6599291a-b277-11e7-97e7-80051840c66e.jpg)
- Liqui and DSX unified (same BTC-e API)
- Fixed BCC → BCH on DSX, [#83](https://github.com/ccxt-dev/ccxt/issues/83), [BCH](https://github.com/ccxt-dev/ccxt/search?q=bch&type=Issues)
- Yobit and Liqui unified (same BTC-e API)
- Added support for a new exchange: [Allcoin](https://allcoin.com) (Canada), [#317](https://github.com/kroitor/ccxt/issues/317)
- Fixed HitBTC v1 market buy/sell, [#314](https://github.com/kroitor/ccxt/issues/314)
- Fixed PHP 7 method declaraions, [#313](https://github.com/kroitor/ccxt/issues/313)
- Added fetchOrders, fetchOpenOrders, fetchClosedOrders to OKCoin/OKEX, [#71](https://github.com/kroitor/ccxt/issues/71), [#312](https://github.com/kroitor/ccxt/issues/312)
- Fixed OKCoin/OKEX fetchOrder and fetchTrades, [#308](https://github.com/kroitor/ccxt/issues/308), [#312](https://github.com/kroitor/ccxt/issues/312)
- Added `symbol` to all tickers
- Added GDAX fetchOrder, fetchOrders, fetchOpenOrders and fetchClosedOrders, [#71](https://github.com/kroitor/ccxt/issues/71)
- Changed the createMarketBuyOrder signature and implementation for OKcoin/OKEX, [#307](https://github.com/kroitor/ccxt/issues/307)
- Added fetchOrder, fetchOpenOrders, fetchClosedOrders to HitBTC, [#305](https://github.com/kroitor/ccxt/pull/305)
- Added fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders to Cryptopia, Liqui and Poloniex
- Fixed IoTcoin on ccex, [#302](https://github.com/kroitor/ccxt/issues/302)
- Fixed ANICoin, Bitshares2 on YoBit, [#302](https://github.com/kroitor/ccxt/issues/302)
- Fixed Binance market orders, [#298](https://github.com/kroitor/ccxt/issues/298)
- Added cex.io fetchOpenOrders, [#293](https://github.com/kroitor/ccxt/pull/293)
- Fixed reversed baseVolume and quoteVolume with Poloniex fetchTicker, [#292](https://github.com/kroitor/ccxt/issues/292)
- Added main/trading account support to HitBTC fetchBalance, [#288](https://github.com/kroitor/ccxt/issues/288)
- Added `deposit()` implementations for Bitfinex (experimental), [#288](https://github.com/kroitor/ccxt/issues/288)
- Fixed YoBit pair symbols: EPAY, OMGame, Republicoin, NavajoCoin, LiZi, [#287](https://github.com/kroitor/ccxt/issues/287)
- Fixed Cryptopia symbol: CC → CCX, [#287](https://github.com/kroitor/ccxt/issues/287)
- Fixed Bitfinex `withdraw()`, [#286](https://github.com/kroitor/ccxt/issues/286)
- Fixed ticker base/quote volumes, [#279](https://github.com/kroitor/ccxt/issues/279), [#280](https://github.com/kroitor/ccxt/issues/280), [#281](https://github.com/kroitor/ccxt/issues/281), [#282](https://github.com/kroitor/ccxt/issues/282), [#283](https://github.com/kroitor/ccxt/issues/283), [#284](https://github.com/kroitor/ccxt/issues/284)
- Fixed `cancelOrder()` for CEX.io, [#277](https://github.com/kroitor/ccxt/issues/277)
- Fixed Bitfinex `fetch_balance()` in Python 3, [#276](https://github.com/kroitor/ccxt/issues/276)
- Added CEX.io `fetchOrder()` (not unified yet), [#275](https://github.com/kroitor/ccxt/issues/275)
- Fixed bitcoin.co.id `cancelOrder()`, [#273](https://github.com/kroitor/ccxt/issues/273)
- Fixed ACX for milliseconds nonce, [#273](https://github.com/kroitor/ccxt/issues/273)
- Fixed error details output in Python 3, [#271](https://github.com/kroitor/ccxt/pull/271)
- Renamed missed CCXTError → BaseError in Python 3, [#270](https://github.com/kroitor/ccxt/pull/270)
- Added support for a new exchange: [BtcBox](https://www.btcbox.co.jp) (Japan, experimental)
- Fixed HitBTC v1 `create_order()` in PHP, [#267](https://github.com/kroitor/ccxt/issues/267)
- Fixed GDAX `withdraw()`, [#266](https://github.com/kroitor/ccxt/issues/266)
- Fixed Bittrex `fetchOrder()` symbol param, [#264](https://github.com/kroitor/ccxt/pull/264)
- Fixed `parseOrders()` in PHP, [#258](https://github.com/kroitor/ccxt/pull/258)
- Fixed HitBTC v2 `fetchBalance()` function param signature in PHP, [#257](https://github.com/kroitor/ccxt/pull/257)
- Removed a duplicate redefinition of `request()` from PHP, [#256](https://github.com/kroitor/ccxt/pull/256)
- Fixed `throttle()` in PHP, [#254](https://github.com/kroitor/ccxt/pull/254)
- Renamed CCXTError base exception class to BaseError
- Added experimental limits and precision digits  to Kraken, Liqui, Binance, Poloniex
- Added missing markets to Binance
- Added min/max trade limits to Bittrex and Cryptopia (experimental)

## Version 1.9.x 2017-10-01

- Added precision thresholds to Binance, Bittrex, Cryptopia, Kraken markets
- Added order cache and emulated fetchClosedOrders workaround to Cryptopia
- Added a symbol param to `cancelOrder ()` / `cancel_order ()`
- Added new ZEC/KRW market to Bithumb
- Fixed CEX.io endpoint URLs for extra params, [#250](https://github.com/kroitor/ccxt/issues/250), [#251](https://github.com/kroitor/ccxt/pull/251)
- Fixed Poloniex fetchTrades, [#246](https://github.com/kroitor/ccxt/issues/246)
- Fixed all PEP8-conformance issues entirely, [#244](https://github.com/kroitor/ccxt/issues/244)
- Added support for a new exchange: [QRYPTOS](https://www.qryptos.com) (China, Taiwan, a property of QUOINE)
- Added fetchOpenOrders and fetchClosedOrders to Bitfinex v1 (experimental)
- Added fetchOrder and fetchOrders to OKCoin CNY, OKCoin USD and OKEX (experimental)
- Added withdraw method to Exmo (experimental)
- Added more robust private API error handling for CEX.io
- Added withdraw method to Mercado Bitcoin (experimental)
- Fixed Liqui cancelOrder missing await in Python asyncio-version, [#241](https://github.com/kroitor/ccxt/issues/241)
- Fixed Cryptopia fetchTicker misplaced volumes, [#239](https://github.com/kroitor/ccxt/issues/239)
- Added HitBTC v1 fetchOrder (experimental)
- Added more exceptions to coincheck for non-BTC/JPY-markets, [#236](https://github.com/kroitor/ccxt/issues/236)
- Fixed Liqui balance totals, [#235](https://github.com/kroitor/ccxt/issues/235)
- Fixed fetchTicker transpilation bug, [#234](https://github.com/kroitor/ccxt/issues/234)
- Added fetchMyTrades to Kraken
- Added fetchFreeBalance, fetchUsedBalance, fetchTotalBalance
- Added `hasFetchTicker`, `hasFetchOrderBook`, `hasFetchTrades` properties
- Fixed BTCTradeUA fetchTicker for empty bidasks
- Fixed Kraken fetchTicker baseVolume
- Fixed BCH support / updated markets for Bit2C
- Renamed fetchBestPrices to fetchMarketPrice for Virwox
- Fixed Virwox fetchTicker for empty bidasks
- Added fetchOrder, fetchOrders, fetchOpenOrders, fetchMyTrades to Binance

## Version 1.8.x 2017-09-24

- Added support for a new exchange: [Tidex](https://tidex.com) (United Kingdom)
- Added missing new markets to Bitcoin.co.id, [#228](https://github.com/kroitor/ccxt/issues/228), , [#229](https://github.com/kroitor/ccxt/pull/229)
- Restored Bistamp v2 fetchOrderStatus, [#226](https://github.com/kroitor/ccxt/issues/226)
- Added `hasCORS` property to base exchange class, [#225](https://github.com/kroitor/ccxt/issues/225)
- Minor fix to GDAX OHLCV, [#221](https://github.com/kroitor/ccxt/issues/221)
- Fixed the `since` param in GDAX fetchOHLCV, [#221](https://github.com/kroitor/ccxt/issues/221)
- Added support for a new exchange: [WEX](https://wex.nz) (New Zealand)
- Dropped the legacy ECMAScript 5 support for the greater maintainability and performance gains
- Added missing spot pairs BCC/BTC LTC/BTC ETH/BTC ETC/BTC to OKEX, improved futures support, [#216](https://github.com/kroitor/ccxt/issues/216)
- Added support for a new exchange: [Bithumb](https://www.bithumb.com) (South Korea, private API in progress)
- Removed excessive body.encode() from Python 3.5+ asyncio version, [#214](https://github.com/kroitor/ccxt/pull/214)
- Fixed Bter orderbook in Python3 for empty bidasks in their response, [#213](https://github.com/kroitor/ccxt/issues/213)
- Added initial test_async.py for testing against Python 3.5+ asyncio
- Cleaned up for the upcoming refactoring, multiple bugfixes (mostly to Python3.5+ asyncio version)
- Fixed bitFlyer futures, [#212](https://github.com/kroitor/ccxt/pull/212)
- Fixed HitBTC v2 cancelOrder, [#211](https://github.com/kroitor/ccxt/issues/211)
- Added experimental support for a new exchange: [Independent Reserve](https://www.independentreserve.com/) (Australia, New Zealand)
- Added experimental support for a new exchange: [Nova Exchange](https://novaexchange.com) (Tanzania)
- Fixed itBit createOrder/cancelOrder for walletId
- Fixed Jubi cancelOrder
- Switched HitBTC v2 fetchBalance to trading account by default, [#210](https://github.com/kroitor/ccxt/pull/210)
- Added an internal rate-limiting REST poller to JS (experimental)
- Fixed Cryptopia fetchTicker volume, [#206](https://github.com/kroitor/ccxt/issues/206)
- Fixed Bittrex await cancelOrder, [#205](https://github.com/kroitor/ccxt/issues/205)
- Fixed empty CEX DASH/USD fetchTicker
- Added Bittrex v2 fetchOHLCV (alpha-stage of their new API)

## Version 1.7.x 2017-09-15

- Added missing endpoints to Bitstamp v2, [#198](https://github.com/kroitor/ccxt/issues/198)
- Added support for older Bitstamp v1 API, [#198](https://github.com/kroitor/ccxt/issues/198)
- Removed BTC/USD market from Huobi, [#195](https://github.com/kroitor/ccxt/issues/195)
- Added Huobi PRO API: BCH/BTC, ETC/BTC, ETH/BTC, LTC/BTC, [#195](https://github.com/kroitor/ccxt/issues/195)
- Added Huobi CNY API: BCH/CNY, ETH/CNY, ETC/CNY, [#195](https://github.com/kroitor/ccxt/issues/195)
- Fixed Bitfinex parseOrder timestamp, [#200](https://github.com/kroitor/ccxt/issues/200)
- Fixed Bitfinex cancelOrder error, [#199](https://github.com/kroitor/ccxt/issues/199)
- Removed EOS market from CHBTC, [#197](https://github.com/kroitor/ccxt/issues/197)
- Added missing BCH/HSR/QTUM markets to CHBTC, [#197](https://github.com/kroitor/ccxt/issues/197)
- Added missing BCH/ETH/ETC markets to OKCoin CNY, [#196](https://github.com/kroitor/ccxt/issues/196)
- Fixed BCH/ETH markets with BTCChina, [#194](https://github.com/kroitor/ccxt/issues/194)
- Added fetchOpenOrders/fetchClosedOrders implementation to Kraken, [#71](https://github.com/kroitor/ccxt/issues/71)
- Added support for a new exchange: [Bleutrade](https://bleutrade.com) (Brazil)
- Fixed Cryptopia fetchOpenOrders issue, [#192](https://github.com/kroitor/ccxt/issues/192)
- Added `.hasPublicAPI / .hasPrivateAPI` properties to all derived exchanges
- Added support for a new exchange: [ACX](https://acx.io) (Australia)
- Fixed Bitflyer's private GET APIs, [#187](https://github.com/kroitor/ccxt/pull/187)
- BitBays exchange was renamed to MixCoins, now operating in UK and Hong Kong
- Removed support for BTCe exchange (was shut down earlier)
- Fixed float formatting issue, [#185](https://github.com/kroitor/ccxt/issues/185)
- Fixed side issue with Bitflyer parseTrade, [#184](https://github.com/kroitor/ccxt/issues/184)
- Fixed fetchOpenOrders amount/symbol with Bittrex and Poloniex [#183](https://github.com/kroitor/ccxt/issues/183)
- Fixed Bitfinex DASH balance issue, [#178](https://github.com/kroitor/ccxt/issues/178)
- Added missing ETH and BCH markets to BTCChina, [#175](https://github.com/kroitor/ccxt/issues/175)
- BitBays ceased operation in China

![BitBays ceased operation](https://user-images.githubusercontent.com/1294454/30231444-90b89000-94f3-11e7-84ba-f3ca1fe8cd3b.png)

- Added support for HitBTC v2 API, [#172](https://github.com/kroitor/ccxt/issues/172)
- Unified most of fetchOHLCV implementations where available, [related commits](https://github.com/kroitor/ccxt/search?q=fetchOHLCV&type=Commits&utf8=%E2%9C%93), [#169](https://github.com/kroitor/ccxt/issues/169)
- Added initial support for Bitfinex v2 API, [#154](https://github.com/kroitor/ccxt/issues/154)
- Added git release tags on Travis CI, [#151](https://github.com/kroitor/ccxt/issues/151)

## Version 1.6.x 2017-09-03

- Added experimental fetchOHLCV implementations, [#169](https://github.com/kroitor/ccxt/issues/169)
- Unified most of fetchTrades returns, [related commits](https://github.com/kroitor/ccxt/search?q=unified+fetchTrades+return&type=Commits&utf8=%E2%9C%93)
- Added experimental unified `withdraw ()` method to Bitfinex, [#167](https://github.com/kroitor/ccxt/issues/167)
- Added [examples/js/basic-chart.js](https://github.com/kroitor/ccxt/blob/master/examples/js/basic-chart.js) and [examples/py/basic-chart.py](https://github.com/kroitor/ccxt/blob/master/examples/py/basic-chart.py)
- Changed fetchBalance to floats, [#166](https://github.com/kroitor/ccxt/issues/166)
- Added handling of InsufficientFunds for HitBTC [#164](https://github.com/kroitor/ccxt/issues/164)
- Prepared for an API update on Bitfinex [#154](https://github.com/kroitor/ccxt/issues/154)
- Changed order type handling for margin orders on Bitfinex, [#130](https://github.com/kroitor/ccxt/issues/130), [#157](https://github.com/kroitor/ccxt/issues/157)
- Added experimental fetchClosedOrders, fetchOpenOrders to Zaif, [#71](https://github.com/kroitor/ccxt/issues/71)
- Fixed BlinkTrade createOrder response
- Fixed Zaif BCH balance issue, [#156](https://github.com/kroitor/ccxt/issues/156)
- Added handling for `vwap == null` in coinfloor tickers
- Moved the docs from GitHub wiki into the master branch inside the repository, [#134](https://github.com/kroitor/ccxt/issues/134), [#137](https://github.com/kroitor/ccxt/pull/137)
- Added extra `params` to all fetchTrades() implementations, [#135](https://github.com/kroitor/ccxt/pull/135)
- Fixed HitBTC issue with overrided nonce vs clientOrderId, [#155](https://github.com/kroitor/ccxt/issues/155)
- Added experimental fetchOrder to Kraken, [#71](https://github.com/kroitor/ccxt/issues/71), [#102](https://github.com/kroitor/ccxt/pull/102)
- Added `order_status` endpoint to Bitstamp, [#148](https://github.com/kroitor/ccxt/pull/148)

## Version 1.5.x 2017-08-24

- Added support for a new exchange: [OKEX](https://www.okex.com) (China, US)
- Fixed Kraken KeyError: 'txid' exception, [#143](https://github.com/kroitor/ccxt/issues/143)
- Added `hasFetchTickers` property to indicate method availability [#145](https://github.com/kroitor/ccxt/issues/145)
- Added support for a new exchange: [Binance](https://www.binance.com) (China) [#142](https://github.com/kroitor/ccxt/issues/142)
- Fixed `asyncio Unclosed client session` warning in Python 3.5+ [139](https://github.com/kroitor/ccxt/issues/139)
- Fixed `asyncio TypeError: must be str, not bytes` issue in Python 3.5+ with GDAX, Bitfinex and Kraken [139](https://github.com/kroitor/ccxt/issues/139)
- Python package now includes a bdist wheel (binary distribution for a faster install), [#136](https://github.com/kroitor/ccxt/issues/136)
- Fixed market orders for OKCoin, [#138](https://github.com/kroitor/ccxt/issues/138)
- Added fetchMyOpenOrders to Poloniex and Bittrex, [#102](https://github.com/kroitor/ccxt/issues/102)
- Fixed `exchange.version` property in Python, [#126](https://github.com/kroitor/ccxt/issues/126)
- Added initial async/await support to Python 3.5+, [#7](https://github.com/kroitor/ccxt/issues/7)
- Fixed HitBTC cancel_order issue with clientOrderId vs orderId, [#125](https://github.com/kroitor/ccxt/issues/125)
- Fixed HitBTC price formatting issue, [#122](https://github.com/kroitor/ccxt/issues/122)
- Added support for a new exchange: [Cryptopia](https://www.cryptopia.co.nz) (New Zealand), [#119](https://github.com/kroitor/ccxt/issues/119), [#123](https://github.com/kroitor/ccxt/pull/123)
- Fixed Yobit low price in exponential format, [#122](https://github.com/kroitor/ccxt/issues/122)
- Fixed Bitflyer private API, [#121](https://github.com/kroitor/ccxt/issues/121)
- Added new Bitstamp markets: ETH/USD, ETH/EUR and ETH/BTC, [#120](https://github.com/kroitor/ccxt/issues/120)
- Added parameterization to unified fetchTrades, [#118](https://github.com/kroitor/ccxt/pull/118)
- Added parseOHLCVs, parseOLHCV base methods
- Added experimental unified fetchOHLCV to GDAX
- Added experimental unified fetchOHLCV method to OKCoin

## Version 1.4.x 2017-08-17

- Added unified fetchOrder to Bittrex and Liqui, [#116](https://github.com/kroitor/ccxt/issues/116)
- Fixed Bter createOrder, [#115](https://github.com/kroitor/ccxt/issues/115)
- Added [Browser Bundle](https://github.com/kroitor/ccxt#javascript-for-use-with-the-script-tag) for use with the `<script>` tag, served from the [unpkg CDN](https://unpkg.com/)
- Refactored imports / exports handling, making it compatible with JavaScript module bundlers
- Added initial support for a new exchange:, [coinfloor](https://www.coinfloor.co.uk) UK (still under development)
- Isolated code genome into `ccxt.js`, `ccxt.php` and `ccxt.py`, added `build` folder for generated files
- Fixed Bter BCC vs BCH in fetchTickers, [#83](https://github.com/kroitor/ccxt/issues/83)
- Fixed Python byte-encoding with Gemini, [#30](https://github.com/kroitor/ccxt/issues/30), [#113](https://github.com/kroitor/ccxt/issues/113)
- Added experimental `fetchOrders ()` workaround and other private methods for Poloniex (WIP), [#102](https://github.com/kroitor/ccxt/pull/102)
- Python pip is now cached in Travis CI, [#108](https://github.com/kroitor/ccxt/pull/108)
- Tox is now enforcing Python PEP8 with flake8 upon each build in Travis CI, [#107](https://github.com/kroitor/ccxt/pull/107)
- Added ETH markets to OKCoin USD, [#103](https://github.com/kroitor/ccxt/pull/103)
- Python codebase is now PEP8-conformant, [#104](https://github.com/kroitor/ccxt/issues/104), [#106](https://github.com/kroitor/ccxt/pull/106)
- Unified `createOrder ()` return, [#94](https://github.com/kroitor/ccxt/issues/94)
- Started work on orders/trades unification, [#71](https://github.com/kroitor/ccxt/issues/71), [#102](https://github.com/kroitor/ccxt/pull/102)
- Added support for a new exchange: [BTC Markets](https://btcmarkets.net) (Australia)
- Updated [CONTRIBUTING](https://github.com/kroitor/ccxt/blob/master/CONTRIBUTING.md) guidelines
- Added a new ad-hoc test-frontend to run individual tests of all exchanges in all languages in parallel, see [How To Build & Run Tests On Your Local Machine](https://github.com/kroitor/ccxt/blob/master/CONTRIBUTING.md#how-to-build--run-tests-on-your-local-machine)
- Started adding fetchTickers () (all at once) where applicable, [#7](https://github.com/kroitor/ccxt/issues/7)
- Fixed Bittrex used/pending balance, [#91](https://github.com/kroitor/ccxt/issues/91)

## Version 1.3.x 2017-08-08

```diff
- Version 1.3.x is backward incompatible with previous versions due to a major renaming in the code
```

- Renamed basic elements for consistency, this change is backward-incompatible, [#89](https://github.com/kroitor/ccxt/issues/89)
  - renamed (M|m)arket[s] → (E|e)xchange[s] everywhere in code, tests, examples and docs
  - renamed (P|p)roduct[s] → (M|m)arket[s] everywhere as well
- Added optional `substituteCommonCurrencyCodes` exchange parameter (true by default)
- Fixed HitBTC string/float/decimal conversions, [#88](https://github.com/kroitor/ccxt/issues/88)
- Initial Bitcoin Cash support (preferred BCH to BCC), [#83](https://github.com/kroitor/ccxt/issues/83)
- Fixed Kraken BTC balance, [#82](https://github.com/kroitor/ccxt/issues/82)
- Added additional extra params to fetchOrderBook to control the level of order book aggregation detail, [#84](https://github.com/kroitor/ccxt/issues/84)
- Reworked exception hierarchy and error handling for unification
- Fixed CHBTC missing bid/ask handling in order books for certain symbols

## Version 1.2.x 2017-08-01

- Fixed Gatecoin private API body in GET-requests, [#80](https://github.com/kroitor/ccxt/issues/80)
- Added optional `userAgent` property, [#67](https://github.com/kroitor/ccxt/issues/67)
- Balance APIs unified, [#36](https://github.com/kroitor/ccxt/issues/36)
- Added auto product loading, users forget to preload them manually, [#57](https://github.com/kroitor/ccxt/issues/57), [#68](https://github.com/kroitor/ccxt/issues/68), [#69](https://github.com/kroitor/ccxt/issues/69)
- Added missing `last` field to Poloniex tickers, [#75](https://github.com/kroitor/ccxt/issues/75)
- Fixed CHBTC fetchOrder, [#74](https://github.com/kroitor/ccxt/issues/74)
- Removed obsolete `crypto` dependency (switched to `crypto-js` completely), [#23](https://github.com/kroitor/ccxt/issues/23), [#52](https://github.com/kroitor/ccxt/issues/52)
- New tests system that launches individual market tests in parallel (now running 3 minutes instead of 20)
- BTC-e shutdown

![BTCe shutdown](https://user-images.githubusercontent.com/1294454/28800889-9d03c61e-7657-11e7-881c-c4becb03903d.png)

- Fixed a typo in Python examples, [#65](https://github.com/kroitor/ccxt/issues/65)
- Fixed Yunbi and CHBTC orders, [#62](https://github.com/kroitor/ccxt/issues/62), [#63](https://github.com/kroitor/ccxt/issues/63)
- Fixed missing Kraken balance currencies, [#60](https://github.com/kroitor/ccxt/issues/60)
- Fixed Kraken EOrder:Trading agreement required, fixed support for custom order params, [#58](https://github.com/kroitor/ccxt/issues/58)
- Coingi exchange support added
- Added basic error handling and exceptions for connectivity / auth errors
- Switched major version to 1.x.x
- Fixed Yunbi private API, [#55](https://github.com/kroitor/ccxt/issues/55)
- Gatecoin exchange added, [#54](https://github.com/kroitor/ccxt/issues/54)
- Yunbi exchange added, [#50](https://github.com/kroitor/ccxt/issues/50)
- CHBTC exchange added, [#50](https://github.com/kroitor/ccxt/issues/50)
- Added JavaScript, Python and PHP examples
- Added missing LTC/USD, LTC/EUR, LTC/BTC pairs to Bitstamp, [#48](https://github.com/kroitor/ccxt/issues/48)
- Fixed reversed pairs for Poloniex, [#46](https://github.com/kroitor/ccxt/issues/46)
- BL3P exchange support added, [#44](https://github.com/kroitor/ccxt/issues/44)
- Fixed Bittrex `load_products` method, [#43](https://github.com/kroitor/ccxt/issues/43)
- Fixed a typo in bitfinex `ocoorder` parameter, [#38](https://github.com/kroitor/ccxt/issues/38)
- Fixed GDAX orders, [#35](https://github.com/kroitor/ccxt/issues/35)
- Added missing `method` param to BTC-e private API, [#33](https://github.com/kroitor/ccxt/issues/33)
- Fixed multiple auth errors due to the missing .encode () in Python:
  - [Yobit #26](https://github.com/kroitor/ccxt/issues/26)
  - [Kraken #27](https://github.com/kroitor/ccxt/issues/27)
  - [Bter issue #28](https://github.com/kroitor/ccxt/issues/28)
  - [Liqui issue #29](https://github.com/kroitor/ccxt/issues/29)
  - [Gemini issue #30](https://github.com/kroitor/ccxt/issues/30)
  - [Cex.io #31](https://github.com/kroitor/ccxt/issues/31)
  - [QuadrigaCX #32](https://github.com/kroitor/ccxt/issues/32)
- Added `__version__` to Python bindings, [#25](https://github.com/kroitor/ccxt/issues/25)
- Fixed multiple auth errors, [#24](https://github.com/kroitor/ccxt/issues/24)
- CoinMarketCap API support added (not an exchange), [#22](https://github.com/kroitor/ccxt/issues/22)
- Fixed GDAX API minor errors, [#20](https://github.com/kroitor/ccxt/issues/20)
- Fixed Bitfinex private API, [#19](https://github.com/kroitor/ccxt/issues/19)
- Added `products_by_id` and `symbols` market properties, [#18](https://github.com/kroitor/ccxt/issues/18)
- Fixed Python 3.4.5 compatibility, [#14](https://github.com/kroitor/ccxt/issues/14)
- Fixed DSH/DASH inconsistency with HitBTC and BTC-e, [#12](https://github.com/kroitor/ccxt/issues/12)
- Fixed missing bid/ask handling in Liqui (same API as BTC-e), [#11](https://github.com/kroitor/ccxt/issues/11)
- Fixed bid/ask inconsistency with BTC-e, [#10](https://github.com/kroitor/ccxt/issues/10)
- Reworked unified order APIs (removed unnecessary methods), [#9](https://github.com/kroitor/ccxt/issues/9)
- Liqui exchange support added, [#8](https://github.com/kroitor/ccxt/issues/8)
- Bter exchange support added, [#8](https://github.com/kroitor/ccxt/issues/8)
- Livecoin exchange support added, [#8](https://github.com/kroitor/ccxt/issues/8)
- Added a `markets` variable for listing exchange ids programmatically, [#6](https://github.com/kroitor/ccxt/issues/6)
- Fixed ANXPRO ticker API in Python, [#5](https://github.com/kroitor/ccxt/issues/5)
- Fixed pairs inconsistencies across markets, [#4](https://github.com/kroitor/ccxt/issues/4)
- Orderbook APIs unified, [#3](https://github.com/kroitor/ccxt/issues/3)
- Ticker APIs unified
- Fixed GDAX fetch_trades, [#2](https://github.com/kroitor/ccxt/issues/2)
