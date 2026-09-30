## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-information-v2 | [] | Account Information V2 |
| account-information-v3 | [] | Account Information V3 |
| futures-account-balance-v2 | [] | Futures Account Balance V2 |
| futures-account-balance-v3 | [] | Futures Account Balance V3 |
| futures-account-configuration | [] | Futures Account Configuration |
| futures-trading-quantitative-rules-indicators | [`symbol`] | Futures Trading Quantitative Rules Indicators |
| get-bnb-burn-status | [] | Get BNB Burn Status |
| get-current-multi-assets-mode | [] | Get Current Multi-Assets Mode |
| get-current-position-mode | [] | Get Current Position Mode |
| get-download-id-for-futures-order-history | `start-time` `end-time` [] | Get Download Id For Futures Order History |
| get-download-id-for-futures-trade-history | `start-time` `end-time` [] | Get Download Id For Futures Trade History |
| get-download-id-for-futures-transaction-history | `start-time` `end-time` [] | Get Download Id For Futures Transaction History |
| get-futures-order-history-download-link-by-id | `download-id` [] | Get Futures Order History Download Link by Id |
| get-futures-trade-download-link-by-id | `download-id` [] | Get Futures Trade Download Link by Id |
| get-futures-transaction-history-download-link-by-id | `download-id` [] | Get Futures Transaction History Download Link by Id |
| get-income-history | [`symbol` `income-type` `start-time` `end-time` `page` `limit`] | Get Income History |
| notional-and-leverage-brackets | [`symbol`] | Notional and Leverage Brackets |
| query-user-rate-limit | [] | Query User Rate Limit |
| symbol-configuration | [`symbol`] | Symbol Configuration |
| toggle-bnb-burn-on-futures-trade | `fee-burn` [] | Toggle BNB Burn On Futures Trade |
| user-commission-rate | `symbol` [] | User Commission Rate |


## Convert (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| accept-the-offered-quote | `quote-id` [] | Accept the offered quote |
| list-all-convert-pairs | [`from-asset` `to-asset`] | List All Convert Pairs |
| order-status | [`order-id` `quote-id`] | Order status |
| send-quote-request | `from-asset` `to-asset` [`from-amount` `to-amount` `valid-time`] | Send Quote Request |


## Market Data

| Endpoint | Key params | Description |
|---|---|---|
| adl-risk | [`symbol`] | ADL Risk |
| basis | `pair` `contract-type` `period` [`limit` `start-time` `end-time`] | Basis |
| check-server-time | [] | Check Server Time |
| composite-index-symbol-information | [`symbol`] | Composite Index Symbol Information |
| compressed-aggregate-trades-list | `symbol` [`from-id` `start-time` `end-time` `limit`] | Compressed/Aggregate Trades List |
| continuous-contract-kline-candlestick-data | `pair` `contract-type` `interval` [`start-time` `end-time` `limit`] | Continuous Contract Kline/Candlestick Data |
| exchange-information | [] | Exchange Information |
| get-funding-rate-history | [`symbol` `start-time` `end-time` `limit`] | Get Funding Rate History |
| get-funding-rate-info | [] | Get Funding Rate Info |
| index-price-kline-candlestick-data | `pair` `interval` [`start-time` `end-time` `limit`] | Index Price Kline/Candlestick Data |
| kline-candlestick-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Kline/Candlestick Data |
| long-short-ratio | `symbol` `period` [`limit` `start-time` `end-time`] | Long/Short Ratio |
| mark-price | [`symbol`] | Mark Price |
| mark-price-kline-candlestick-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Mark Price Kline/Candlestick Data |
| multi-assets-mode-asset-index | [`symbol`] | Multi-Assets Mode Asset Index |
| old-trades-lookup | `symbol` [`limit` `from-id`] | Old Trades Lookup |
| open-interest | `symbol` [] | Open Interest |
| open-interest-statistics | `symbol` `period` [`limit` `start-time` `end-time`] | Open Interest Statistics |
| order-book | `symbol` [`limit`] | Order Book |
| premium-index-kline-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Premium index Kline Data |
| quarterly-contract-settlement-price | `pair` [] | Quarterly Contract Settlement Price |
| query-index-price-constituents | `symbol` [] | Query Index Price Constituents |
| query-insurance-fund-balance-snapshot | [`symbol`] | Query Insurance Fund Balance Snapshot |
| recent-trades-list | `symbol` [`limit`] | Recent Trades List |
| rpi-order-book | `symbol` [`limit`] | RPI Order Book |
| symbol-order-book-ticker | [`symbol`] | Symbol Order Book Ticker |
| symbol-price-ticker | [`symbol`] | Symbol Price Ticker |
| symbol-price-ticker-v2 | [`symbol`] | Symbol Price Ticker V2 |
| taker-buy-sell-volume | `symbol` `period` [`limit` `start-time` `end-time`] | Taker Buy/Sell Volume |
| test-connectivity | [] | Test Connectivity |
| ticker24hr-price-change-statistics | [`symbol`] | 24hr Ticker Price Change Statistics |
| top-trader-long-short-ratio-accounts | `symbol` `period` [`limit` `start-time` `end-time`] | Top Trader Long/Short Ratio (Accounts) |
| top-trader-long-short-ratio-positions | `symbol` `period` [`limit` `start-time` `end-time`] | Top Trader Long/Short Ratio (Positions) |
| trading-schedule | [] | Trading Schedule |


## Portfolio Margin Endpoints (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| classic-portfolio-margin-account-information | `asset` [] | Classic Portfolio Margin Account Information |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-trade-list | `symbol` [`order-id` `start-time` `end-time` `from-id` `limit`] | Account Trade List |
| all-orders | `symbol` [`order-id` `start-time` `end-time` `limit`] | All Orders |
| auto-cancel-all-open-orders | `symbol` `countdown-time` [] | Auto-Cancel All Open Orders |
| cancel-algo-order | [`algo-id` `client-algo-id`] | Cancel Algo Order |
| cancel-all-algo-open-orders | `symbol` [] | Cancel All Algo Open Orders |
| cancel-all-open-orders | `symbol` [] | Cancel All Open Orders |
| cancel-multiple-orders | `symbol` [`order-id-list` `orig-client-order-id-list`] | Cancel Multiple Orders |
| cancel-order | `symbol` [`order-id` `orig-client-order-id`] | Cancel Order |
| change-initial-leverage | `symbol` `leverage` [] | Change Initial Leverage |
| change-margin-type | `symbol` `margin-type` [] | Change Margin Type |
| change-multi-assets-mode | `multi-assets-margin` [] | Change Multi-Assets Mode |
| change-position-mode | `dual-side-position` [] | Change Position Mode |
| current-all-algo-open-orders | [`algo-type` `symbol` `algo-id`] | Current All Algo Open Orders |
| current-all-open-orders | [`symbol`] | Current All Open Orders |
| futures-tradfi-perps-contract | [] | Futures TradFi Perps Contract |
| get-order-modify-history | `symbol` [`order-id` `orig-client-order-id` `start-time` `end-time` `limit`] | Get Order Modify History |
| get-position-margin-change-history | `symbol` [`type` `start-time` `end-time` `limit`] | Get Position Margin Change History |
| modify-isolated-position-margin | `symbol` `amount` `type` [`position-side`] | Modify Isolated Position Margin |
| modify-multiple-orders | `batch-orders` [] | Modify Multiple Orders |
| modify-order | `symbol` `side` `quantity` `price` [`order-id` `orig-client-order-id` `price-match`] | Modify Order |
| new-algo-order | `algo-type` `symbol` `side` `type` [`position-side` `time-in-force` `quantity` `price` `trigger-price` `working-type` `price-match` `close-position` `price-protect` `reduce-only` `activate-price` `callback-rate` `client-algo-id` `new-order-resp-type` `self-trade-prevention-mode` `good-till-date`] | New Algo Order<br>Use this endpoint to place  TP/SL (Take Profit / Stop Loss) and trailing stop orders |
| new-order | `symbol` `side` `type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `new-client-order-id` `new-order-resp-type` `price-match` `self-trade-prevention-mode` `good-till-date`] | New Order |
| place-multiple-orders | `batch-orders` [] | Place Multiple Orders |
| position-adl-quantile-estimation | [`symbol`] | Position ADL Quantile Estimation |
| position-information-v2 | [`symbol`] | Position Information V2 |
| position-information-v3 | [`symbol`] | Position Information V3 |
| query-algo-order | [`algo-id` `client-algo-id`] | Query Algo Order |
| query-all-algo-orders | `symbol` [`algo-id` `start-time` `end-time` `limit`] | Query All Algo Orders |
| query-current-open-order | `symbol` [`order-id` `orig-client-order-id`] | Query Current Open Order |
| query-order | `symbol` [`order-id` `orig-client-order-id`] | Query Order |
| test-order | `symbol` `side` `type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `new-client-order-id` `stop-price` `close-position` `activation-price` `callback-rate` `working-type` `price-protect` `new-order-resp-type` `price-match` `self-trade-prevention-mode` `good-till-date`] | Test Order |
| users-force-orders | [`symbol` `auto-close-type` `start-time` `end-time` `limit`] | User\'s Force Orders |


## User Data Streams

| Endpoint | Key params | Description |
|---|---|---|
| close-user-data-stream | [] | Close User Data Stream |
| keepalive-user-data-stream | [] | Keepalive User Data Stream |
| start-user-data-stream | [] | Start User Data Stream |

### Enums

**auto-close-type:** `LIQUIDATION` `ADL`
**contract-type:** `PERPETUAL` `CURRENT_MONTH` `NEXT_MONTH` `CURRENT_QUARTER` `NEXT_QUARTER` `PERPETUAL_DELIVERING`
**interval:** `1s` `1m` `3m` `5m` `15m` `30m` `1h` `2h` `4h` `6h` `8h` `12h` `1d` `3d` `1w` `1M`
**margin-type:** `ISOLATED` `CROSSED`
**new-order-resp-type:** `ACK` `RESULT`
**period:** `5m` `15m` `30m` `1h` `2h` `4h` `6h` `12h` `1d`
**position-side:** `BOTH` `LONG` `SHORT`
**price-match:** `NONE` `OPPONENT` `OPPONENT_5` `OPPONENT_10` `OPPONENT_20` `QUEUE` `QUEUE_5` `QUEUE_10` `QUEUE_20`
**self-trade-prevention-mode:** `EXPIRE_TAKER` `EXPIRE_BOTH` `EXPIRE_MAKER`
**side:** `BUY` `SELL`
**time-in-force:** `GTC` `IOC` `FOK` `GTX` `GTD` `RPI`
**working-type:** `MARK_PRICE` `CONTRACT_PRICE`