## Web Socket Streams

| Endpoint | Key params | Description |
|---|---|---|
| agg-trade | `symbol` [] | WebSocket Aggregate Trade Streams |
| all-market-rolling-window-ticker | `window-size` [] | WebSocket All Market Rolling Window Statistics Streams |
| all-mini-ticker | [] | WebSocket All Market Mini Tickers Stream |
| avg-price | `symbol` [] | WebSocket Average Price |
| block-trade | `symbol` [] | WebSocket Block Trade Streams |
| book-ticker | `symbol` [] | WebSocket Individual Symbol Book Ticker Streams |
| diff-book-depth | `symbol` [`update-speed`] | WebSocket Diff. Depth Stream |
| kline | `symbol` `interval` [] | WebSocket Kline/Candlestick Streams for UTC |
| kline-offset | `symbol` `interval` [] | WebSocket Kline/Candlestick Streams with timezone offset |
| mini-ticker | `symbol` [] | WebSocket Individual Symbol Mini Ticker Stream |
| partial-book-depth | `symbol` `levels` [`update-speed`] | WebSocket Partial Book Depth Streams |
| reference-price | `symbol` [] | WebSocket Reference Price Streams |
| rolling-window-ticker | `symbol` `window-size` [] | WebSocket Individual Symbol Rolling Window Statistics Streams |
| ticker | `symbol` [] | WebSocket Individual Symbol Ticker Streams |
| trade | `symbol` [] | WebSocket Trade Streams |

### Enums

**interval:** `1s` `1m` `3m` `5m` `15m` `30m` `1h` `2h` `4h` `6h` `8h` `12h` `1d` `3d` `1w` `1M`
**levels:** `5` `10` `20`
**window-size:** `1h` `4h` `1d`