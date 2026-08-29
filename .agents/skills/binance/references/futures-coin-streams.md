## Websocket Market Streams

| Endpoint | Key params | Description |
|---|---|---|
| aggregate-trade-streams | `symbol` [`id`] | Aggregate Trade Streams |
| all-book-tickers-stream | [`id`] | All Book Tickers Stream |
| all-market-liquidation-order-streams | [`id`] | All Market Liquidation Order Streams |
| all-market-mini-tickers-stream | [`id`] | All Market Mini Tickers Stream |
| all-market-tickers-streams | [`id`] | All Market Tickers Streams |
| continuous-contract-kline-candlestick-streams | `pair` `contract-type` `interval` [`id`] | Continuous Contract Kline/Candlestick Streams |
| contract-info-stream | [`id`] | Contract Info Stream |
| diff-book-depth-streams | `symbol` [`id` `update-speed`] | Diff. Book Depth Streams |
| index-kline-candlestick-streams | `pair` `interval` [`id`] | Index Kline/Candlestick Streams |
| index-price-stream | `pair` [`id` `update-speed`] | Index Price Stream |
| individual-symbol-book-ticker-streams | `symbol` [`id`] | Individual Symbol Book Ticker Streams |
| individual-symbol-mini-ticker-stream | `symbol` [`id`] | Individual Symbol Mini Ticker Stream |
| individual-symbol-ticker-streams | `symbol` [`id`] | Individual Symbol Ticker Streams |
| kline-candlestick-streams | `symbol` `interval` [`id`] | Kline/Candlestick Streams |
| liquidation-order-streams | `symbol` [`id`] | Liquidation Order Streams |
| mark-price-kline-candlestick-streams | `symbol` `interval` [`id`] | Mark Price Kline/Candlestick Streams |
| mark-price-of-all-symbols-of-a-pair | `pair` [`id` `update-speed`] | Mark Price of All Symbols of a Pair |
| mark-price-stream | `symbol` [`id` `update-speed`] | Mark Price Stream |
| partial-book-depth-streams | `symbol` `levels` [`id` `update-speed`] | Partial Book Depth Streams |

## Other streams

| Endpoint | Key params | Description |
|---|---|---|
| user-data | listen-key [id] | Subscribes to the user data WebSocket stream using the provided listen key. |