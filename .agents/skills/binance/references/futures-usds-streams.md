## Market

| Endpoint | Key params | Description |
|---|---|---|
| aggregate-trade-streams | `symbol` [`id`] | Aggregate Trade Streams |
| all-market-liquidation-order-streams | [`id`] | All Market Liquidation Order Streams |
| all-market-mini-tickers-stream | [`id`] | All Market Mini Tickers Stream |
| all-market-tickers-streams | [`id`] | All Market Tickers Streams |
| composite-index-symbol-information-streams | `symbol` [`id`] | Composite Index Symbol Information Streams |
| continuous-contract-kline-candlestick-streams | `pair` `contract-type` `interval` [`id`] | Continuous Contract Kline/Candlestick Streams |
| contract-info-stream | [`id`] | Contract Info Stream |
| individual-symbol-mini-ticker-stream | `symbol` [`id`] | Individual Symbol Mini Ticker Stream |
| individual-symbol-ticker-streams | `symbol` [`id`] | Individual Symbol Ticker Streams |
| kline-candlestick-streams | `symbol` `interval` [`id`] | Kline/Candlestick Streams |
| liquidation-order-streams | `symbol` [`id`] | Liquidation Order Streams |
| mark-price-stream | `symbol` [`id` `update-speed`] | Mark Price Stream |
| mark-price-stream-for-all-market | [`id` `update-speed`] | Mark Price Stream for All market |
| multi-assets-mode-asset-index | [`id`] | Multi-Assets Mode Asset Index |
| trading-session-stream | [`id`] | Trading Session Stream |

## Public

| Endpoint | Key params | Description |
|---|---|---|
| all-book-tickers-stream | [`id`] | All Book Tickers Stream |
| diff-book-depth-streams | `symbol` [`id` `update-speed`] | Diff. Book Depth Streams |
| individual-symbol-book-ticker-streams | `symbol` [`id`] | Individual Symbol Book Ticker Streams |
| partial-book-depth-streams | `symbol` `levels` [`id` `update-speed`] | Partial Book Depth Streams |
| rpi-diff-book-depth-streams | `symbol` [`id`] | RPI Diff. Book Depth Streams |

## Other streams

| Endpoint | Key params | Description |
|---|---|---|
| user-data | listen-key [id] | Subscribes to the user data WebSocket stream using the provided listen key. |