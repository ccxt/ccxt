# Changelog

## 1.2.0 - 2026-05-14

- Added WebSocket streams commands.

**Derivatives Trading Portfolio Margin**

### Added (7)

- `cancel-all-um-algo-open-orders` (`DELETE /papi/v1/um/algo/allOpenOrders`)
- `cancel-um-algo-order` (`DELETE /papi/v1/um/algo/order`)
- `futures-tradfi-perps-contract` (`POST /papi/v1/um/stock/contract`)
- `new-um-algo-order` (`POST /papi/v1/um/algo/order`)
- `query-all-current-um-open-algo-orders` (`GET /papi/v1/um/algo/openAlgoOrders`)
- `query-current-um-open-algo-order` (`GET /papi/v1/um/algo/algoOrder`)
- `query-um-algo-order-history` (`GET /papi/v1/um/algo/allAlgoOrders`)

**Derivatives Trading Portfolio Margin Pro**

### Added (3)

- `delete-margin-call-level` (`DELETE /sapi/v1/portfolio/margin-call-level`)
- `get-margin-call-level` (`GET /sapi/v1/portfolio/margin-call-level`)
- `set-margin-call-level` (`POST /sapi/v1/portfolio/margin-call-level`)

**Derivatives Trading Usds Futures**

### Changed (3)

- Deleted parameter `page`
  - affected methods:
    - `query-all-algo-orders` (`GET /fapi/v1/allAlgoOrders`)
- Modified parameter `interval`:
  - enum added: `1s`
  - affected methods:
    - `continuous-contract-kline-candlestick-data` (`GET /fapi/v1/continuousKlines`)
    - `index-price-kline-candlestick-data` (`GET /fapi/v1/indexPriceKlines`)
    - `kline-candlestick-data` (`GET /fapi/v1/klines`)
    - `mark-price-kline-candlestick-data` (`GET /fapi/v1/markPriceKlines`)
    - `premium-index-kline-data` (`GET /fapi/v1/premiumIndexKlines`)
- Modified parameter `limit`:
  - required: `true` → `false`
  - affected methods:
    - `basis` (`GET /futures/data/basis`)

**Spot**

### Added (1)

- `historical-block-trades` (`GET /api/v3/historicalBlockTrades`)

### Changed (1)

- Modified parameter `selfTradePreventionMode`:
  - enum added: `TRANSFER`
  - affected methods:
    - `new-order` (`POST /api/v3/order`)
    - `order-cancel-replace` (`POST /api/v3/order/cancelReplace`)
    - `order-oco` (`POST /api/v3/order/oco`)
    - `order-test` (`POST /api/v3/order/test`)
    - `order-list-oco` (`POST /api/v3/orderList/oco`)
    - `order-list-opo` (`POST /api/v3/orderList/opo`)
    - `order-list-opoco` (`POST /api/v3/orderList/opoco`)
    - `order-list-oto` (`POST /api/v3/orderList/oto`)
    - `order-list-otoco` (`POST /api/v3/orderList/otoco`)
    - `sor-order` (`POST /api/v3/sor/order`)
    - `sor-order-test` (`POST /api/v3/sor/order/test`)

**Sub Account**

### Changed (2)

- Added parameter `rows`
  - affected methods:
    - `get-move-position-history-for-sub-account` (`GET /sapi/v1/sub-account/futures/move-position`)
- Deleted parameter `row`
  - affected methods:
    - `get-move-position-history-for-sub-account` (`GET /sapi/v1/sub-account/futures/move-position`)

## 1.1.0 - 2026-04-11

- Added support for the following products:
    - Algo Trading
    - Alpha
    - C2C
    - Copy Trading
    - Crypto Loan
    - Derivatives Trading (COIN-M Futures)
    - Derivatives Trading (Options)
    - Derivatives Trading (Portfolio Margin)
    - Derivatives Trading (Portfolio Margin Pro)
    - Dual Investment
    - Fiat
    - Gift Card
    - Margin Trading
    - Mining
    - Pay
    - Rebate
    - Simple Earn
    - Staking
    - Sub Account
    - VIP Loan
    - Wallet

## 1.0.1 - 2026-04-09

- Renamed BINANCE_API_SECRET to BINANCE_SECRET_KEY

## 1.0.0 - 2026-04-08

- Initial release