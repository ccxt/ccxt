## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-information | [] | Account Information |
| futures-account-balance | [] | Futures Account Balance |
| get-current-position-mode | [] | Get Current Position Mode |
| get-download-id-for-futures-order-history | `start-time` `end-time` [] | Get Download Id For Futures Order History |
| get-download-id-for-futures-trade-history | `start-time` `end-time` [] | Get Download Id For Futures Trade History |
| get-download-id-for-futures-transaction-history | `start-time` `end-time` [] | Get Download Id For Futures Transaction History |
| get-futures-order-history-download-link-by-id | `download-id` [] | Get Futures Order History Download Link by Id |
| get-futures-trade-download-link-by-id | `download-id` [] | Get Futures Trade Download Link by Id |
| get-futures-transaction-history-download-link-by-id | `download-id` [] | Get Futures Transaction History Download Link by Id |
| get-income-history | [`symbol` `income-type` `start-time` `end-time` `page` `limit`] | Get Income History |
| notional-bracket-for-pair | [`pair`] | Notional Bracket for Pair |
| notional-bracket-for-symbol | [`symbol`] | Notional Bracket for Symbol |
| user-commission-rate | `symbol` [] | User Commission Rate |


## Market Data

| Endpoint | Key params | Description |
|---|---|---|
| basis | `pair` `contract-type` `period` [`limit` `start-time` `end-time`] | Basis |
| check-server-time | [] | Check Server time |
| compressed-aggregate-trades-list | `symbol` [`from-id` `start-time` `end-time` `limit`] | Compressed/Aggregate Trades List |
| continuous-contract-kline-candlestick-data | `pair` `contract-type` `interval` [`start-time` `end-time` `limit`] | Continuous Contract Kline/Candlestick Data |
| exchange-information | [] | Exchange Information |
| get-funding-rate-history-of-perpetual-futures | `symbol` [`start-time` `end-time` `limit`] | Get Funding Rate History of Perpetual Futures |
| get-funding-rate-info | [] | Get Funding Rate Info |
| index-price-and-mark-price | [`symbol` `pair`] | Index Price and Mark Price |
| index-price-kline-candlestick-data | `pair` `interval` [`start-time` `end-time` `limit`] | Index Price Kline/Candlestick Data |
| kline-candlestick-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Kline/Candlestick Data |
| long-short-ratio | `pair` `period` [`limit` `start-time` `end-time`] | Long/Short Ratio |
| mark-price-kline-candlestick-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Mark Price Kline/Candlestick Data |
| old-trades-lookup | `symbol` [`limit` `from-id`] | Old Trades Lookup |
| open-interest | `symbol` [] | Open Interest |
| open-interest-statistics | `pair` `contract-type` `period` [`limit` `start-time` `end-time`] | Open Interest Statistics |
| order-book | `symbol` [`limit`] | Order Book |
| premium-index-kline-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Premium index Kline Data |
| query-index-price-constituents | `symbol` [] | Query Index Price Constituents |
| recent-trades-list | `symbol` [`limit`] | Recent Trades List |
| symbol-order-book-ticker | [`symbol` `pair`] | Symbol Order Book Ticker |
| symbol-price-ticker | [`symbol` `pair`] | Symbol Price Ticker |
| taker-buy-sell-volume | `pair` `contract-type` `period` [`limit` `start-time` `end-time`] | Taker Buy/Sell Volume |
| test-connectivity | [] | Test Connectivity |
| ticker24hr-price-change-statistics | [`symbol` `pair`] | 24hr Ticker Price Change Statistics |
| top-trader-long-short-ratio-accounts | `symbol` `period` [`limit` `start-time` `end-time`] | Top Trader Long/Short Ratio (Accounts) |
| top-trader-long-short-ratio-positions | `pair` `period` [`limit` `start-time` `end-time`] | Top Trader Long/Short Ratio (Positions) |


## Portfolio Margin Endpoints (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| classic-portfolio-margin-account-information | `asset` [] | Classic Portfolio Margin Account Information |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-trade-list | [`symbol` `pair` `order-id` `start-time` `end-time` `from-id` `limit`] | Account Trade List |
| all-orders | [`symbol` `pair` `order-id` `start-time` `end-time` `limit`] | All Orders |
| auto-cancel-all-open-orders | `symbol` `countdown-time` [] | Auto-Cancel All Open Orders |
| cancel-all-open-orders | `symbol` [] | Cancel All Open Orders |
| cancel-multiple-orders | `symbol` [`order-id-list` `orig-client-order-id-list`] | Cancel Multiple Orders |
| cancel-order | `symbol` [`order-id` `orig-client-order-id`] | Cancel Order |
| change-initial-leverage | `symbol` `leverage` [] | Change Initial Leverage |
| change-margin-type | `symbol` `margin-type` [] | Change Margin Type |
| change-position-mode | `dual-side-position` [] | Change Position Mode |
| current-all-open-orders | [`symbol` `pair`] | Current All Open Orders |
| get-order-modify-history | `symbol` [`order-id` `orig-client-order-id` `start-time` `end-time` `limit`] | Get Order Modify History |
| get-position-margin-change-history | `symbol` [`type` `start-time` `end-time` `limit`] | Get Position Margin Change History |
| modify-isolated-position-margin | `symbol` `amount` `type` [`position-side`] | Modify Isolated Position Margin |
| modify-multiple-orders | `batch-orders` [] | Modify Multiple Orders |
| modify-order | `symbol` `side` [`order-id` `orig-client-order-id` `quantity` `price` `price-match`] | Modify Order |
| new-order | `symbol` `side` `type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `new-client-order-id` `stop-price` `close-position` `activation-price` `callback-rate` `working-type` `price-protect` `new-order-resp-type` `price-match` `self-trade-prevention-mode`] | New Order |
| place-multiple-orders | `batch-orders` [] | Place Multiple Orders |
| position-adl-quantile-estimation | [`symbol`] | Position ADL Quantile Estimation |
| position-information | [`margin-asset` `pair`] | Position Information |
| query-current-open-order | `symbol` [`order-id` `orig-client-order-id`] | Query Current Open Order |
| query-order | `symbol` [`order-id` `orig-client-order-id`] | Query Order |
| users-force-orders | [`symbol` `auto-close-type` `start-time` `end-time` `limit`] | User\'s Force Orders |


## User Data Streams

| Endpoint | Key params | Description |
|---|---|---|
| close-user-data-stream | [] | Close User Data Stream |
| keepalive-user-data-stream | [] | Keepalive User Data Stream |
| start-user-data-stream | [] | Start User Data Stream |

### Enums

**auto-close-type:** `LIQUIDATION` `ADL`
**contract-type:** `PERPETUAL` `CURRENT_QUARTER` `NEXT_QUARTER` `CURRENT_QUARTER_DELIVERING` `NEXT_QUARTER_DELIVERING` `PERPETUAL_DELIVERING`
**interval:** `1m` `3m` `5m` `15m` `30m` `1h` `2h` `4h` `6h` `8h` `12h` `1d` `3d` `1w` `1M`
**margin-type:** `ISOLATED` `CROSSED`
**new-order-resp-type:** `ACK` `RESULT`
**period:** `5m` `15m` `30m` `1h` `2h` `4h` `6h` `12h` `1d`
**position-side:** `BOTH` `LONG` `SHORT`
**price-match:** `NONE` `OPPONENT` `OPPONENT_5` `OPPONENT_10` `OPPONENT_20` `QUEUE` `QUEUE_5` `QUEUE_10` `QUEUE_20`
**self-trade-prevention-mode:** `NONE` `EXPIRE_TAKER` `EXPIRE_BOTH` `EXPIRE_MAKER`
**side:** `BUY` `SELL`
**time-in-force:** `GTC` `IOC` `FOK` `GTX`
**type:** `LIMIT` `MARKET` `STOP` `STOP_MARKET` `TAKE_PROFIT` `TAKE_PROFIT_MARKET` `TRAILING_STOP_MARKET`
**working-type:** `MARK_PRICE` `CONTRACT_PRICE`