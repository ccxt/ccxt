# Сhangelog


- Fixed CHBTC missing bid/ask handling in order books for certain symbols

## Version 1.2.0 2017-08-01

- Fixed Gatecoin private API body in GET-requests, [issue #80](https://github.com/kroitor/ccxt/issues/80)
- Added optional `userAgent` property, [issue #67](https://github.com/kroitor/ccxt/issues/67)
- Balance APIs unified, [issue #36](https://github.com/kroitor/ccxt/issues/36)
- Added auto product loading, users forget to preload them manually, [issue #57](https://github.com/kroitor/ccxt/issues/57), [issue #68](https://github.com/kroitor/ccxt/issues/68), [issue #69](https://github.com/kroitor/ccxt/issues/69)
- Added missing `last` field to Poloniex tickers, [issue #75](https://github.com/kroitor/ccxt/issues/75)
- Fixed CHBTC fetchOrder, [issue #74](https://github.com/kroitor/ccxt/issues/74)
- Removed obsolete `crypto` dependency (switched to `crypto-js` completely), [issue #23](https://github.com/kroitor/ccxt/issues/23), [issue #52](https://github.com/kroitor/ccxt/issues/52)
- New tests system that launches individual market tests in parallel (now running 3 minutes instead of 20)
- BTC-e shutdown

<img width="949" alt="screen shot 2017-08-01 at 01 20 21" src="https://user-images.githubusercontent.com/1294454/28800889-9d03c61e-7657-11e7-881c-c4becb03903d.png">

- Fixed a typo in Python examples, [issue #65](https://github.com/kroitor/ccxt/issues/65)
- Fixed Yunbi and CHBTC orders, [issue #62](https://github.com/kroitor/ccxt/issues/62), [issue #63](https://github.com/kroitor/ccxt/issues/63)
- Fixed missing Kraken balance currencies, [issue #60](https://github.com/kroitor/ccxt/issues/60)
- Fixed Kraken EOrder:Trading agreement required, fixed support for custom order params, [issue #58](https://github.com/kroitor/ccxt/issues/58)
- Coingi exchange support added
- Added basic error handling and exceptions for connectivity / auth errors
- Switched major version to 1.x.x
- Fixed Yunbi private API, [issue #55](https://github.com/kroitor/ccxt/issues/55)
- Gatecoin exchange added, [issue #54](https://github.com/kroitor/ccxt/issues/54)
- Yunbi exchange added, [issue #50](https://github.com/kroitor/ccxt/issues/50)
- CHBTC exchange added, [issue #50](https://github.com/kroitor/ccxt/issues/50)
- Added JavaScript, Python and PHP examples
- Added missing LTC/USD, LTC/EUR, LTC/BTC pairs to Bitstamp, [issue #48](https://github.com/kroitor/ccxt/issues/48)
- Fixed reversed pairs for Poloniex, [issue #46](https://github.com/kroitor/ccxt/issues/46)
- BL3P exchange support added, [issue #44](https://github.com/kroitor/ccxt/issues/44)
- Fixed Bittrex `load_products` method, [issue #43](https://github.com/kroitor/ccxt/issues/43)
- Fixed a typo in bitfinex `ocoorder` parameter, [issue #38](https://github.com/kroitor/ccxt/issues/38)
- Fixed GDAX orders, [issue #35](https://github.com/kroitor/ccxt/issues/35)
- Added missing `method` param to BTC-e private API, [issue #33](https://github.com/kroitor/ccxt/issues/33)
- Fixed multiple auth errors due to the missing .encode () in Python, [Yobit issue #26](https://github.com/kroitor/ccxt/issues/26), [Kraken issue #27](https://github.com/kroitor/ccxt/issues/27), [Bter issue #28](https://github.com/kroitor/ccxt/issues/28), [Liqui issue #29](https://github.com/kroitor/ccxt/issues/29), [Gemini issue #30](https://github.com/kroitor/ccxt/issues/30), [Cex.io issue #31](https://github.com/kroitor/ccxt/issues/31), [QuadrigaCX issue #32](https://github.com/kroitor/ccxt/issues/32)
- Added `__version__` to Python bindings, [issue #25](https://github.com/kroitor/ccxt/issues/25)
- Fixed multiple auth errors, [issue #24](https://github.com/kroitor/ccxt/issues/24)
- CoinMarketCap API support added (not an exchange), [issue #22](https://github.com/kroitor/ccxt/issues/22)
- Fixed GDAX API minor errors, [issue #20](https://github.com/kroitor/ccxt/issues/20)
- Fixed Bitfinex private API, [issue #19](https://github.com/kroitor/ccxt/issues/19)
- Added `products_by_id` and `symbols` market properties, [issue #18](https://github.com/kroitor/ccxt/issues/18)
- Fixed Python 3.4.5 compatibility, [issue #14](https://github.com/kroitor/ccxt/issues/14)
- Fixed DSH/DASH inconsistency with HitBTC and BTC-e, [issue #12](https://github.com/kroitor/ccxt/issues/12)
- Fixed missing bid/ask handling in Liqui (same API as BTC-e), [issue #11](https://github.com/kroitor/ccxt/issues/11)
- Fixed bid/ask inconsistency with BTC-e, [issue #10](https://github.com/kroitor/ccxt/issues/10)
- Reworked unified order APIs (removed unnecessary methods), [issue #9](https://github.com/kroitor/ccxt/issues/9)
- Liqui exchange support added, [issue #8](https://github.com/kroitor/ccxt/issues/8)
- Bter exchange support added, [issue #8](https://github.com/kroitor/ccxt/issues/8)
- Livecoin exchange support added, [issue #8](https://github.com/kroitor/ccxt/issues/8)
- Added a `markets` variable for listing exchange ids programmatically, [issue #6](https://github.com/kroitor/ccxt/issues/6)
- Fixed ANXPRO ticker API in Python, [issue #5](https://github.com/kroitor/ccxt/issues/5)
- Fixed pairs inconsistencies across markets, [issue #4](https://github.com/kroitor/ccxt/issues/4)
- Orderbook APIs unified, [issue #3](https://github.com/kroitor/ccxt/issues/3)
- Ticker APIs unified
- Fixed GDAX fetch_trades, [issue #2](https://github.com/kroitor/ccxt/issues/2)