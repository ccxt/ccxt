## Market

| Endpoint | Key params | Description |
|---|---|---|
| index-price-streams | [`id`] | Index Price Streams |
| kline-candlestick-streams | `symbol` `interval` [`id`] | Kline/Candlestick Streams |
| mark-price | `underlying` [`id`] | Mark Price |
| new-symbol-info | [`id`] | New Symbol Info |
| open-interest | `expiration-date` [`id`] | Open Interest |

## Public

| Endpoint | Key params | Description |
|---|---|---|
| diff-book-depth-streams | `symbol` [`id` `update-speed`] | Diff Book Depth Streams |
| individual-symbol-book-ticker-streams | `symbol` [`id`] | Individual Symbol Book Ticker Streams |
| partial-book-depth-streams | `symbol` `level` [`id` `update-speed`] | Partial Book Depth Streams |
| ticker24-hour | `symbol` [`id`] | 24-hour TICKER |
| trade-streams | `symbol` [`id`] | Trade Streams |

## Other streams

| Endpoint | Key params | Description |
|---|---|---|
| user-data | listen-key [id] | Subscribes to the user data WebSocket stream using the provided listen key. |