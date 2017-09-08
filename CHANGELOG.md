# Сhangelog

- Fixed Bitfinex DASH balance issue, [#178](https://github.com/kroitor/ccxt/issues/178)
- Added missing ETH and BCH markets to BTCChina, [#175](https://github.com/kroitor/ccxt/issues/175) 
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

<img width="949" alt="screen shot 2017-08-01 at 01 20 21" src="https://user-images.githubusercontent.com/1294454/28800889-9d03c61e-7657-11e7-881c-c4becb03903d.png">

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
