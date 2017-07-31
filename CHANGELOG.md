# Сhangelog

- Balance APIs unified
- New tests system that launches individual market tests in parallel (now running 3 minutes instead of 20)
- Removed obsolete `crypto` dependency (switched to `crypto-js` completely)
- BTC-e shutdown


- Fixed Kraken EOrder:Trading agreement required, fixed support for custom order params
- Coingi exchange support added
- Added basic error handling and exceptions for connectivity / auth errors
- Switched major version to 1.x.x
- CoinMarketCap API support added (not an exchange)
- BL3P exchange support added
- Fixed bid/ask inconsistency with BTC-e, issue #10
- Reworked unified order APIs (removed unnecessary methods), issue #9
- Liqui exchange support added, issue #8
- Bter exchange support added, issue #8
- Livecoin exchange support added, issue #8
- Added a 'markets' variable for listing exchange ids programmatically, issue #6
- Fixed ANXPRO ticker API in Python, issue #5
- Fixed pairs inconsistencies across markets, issue #4
- Orderbook APIs unified, issue #3
- Ticker APIs unified
- Fixed GDAX fetch_trades, issue #2