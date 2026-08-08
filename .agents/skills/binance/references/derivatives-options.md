## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-funding-flow | `currency` [`record-id` `start-time` `end-time` `limit`] | Account Funding Flow |
| option-margin-account-information | [] | Option Margin Account Information |


## Market Data

| Endpoint | Key params | Description |
|---|---|---|
| check-server-time | [] | Check Server Time |
| exchange-information | [] | Exchange Information |
| historical-exercise-records | [`underlying` `start-time` `end-time` `limit`] | Historical Exercise Records |
| index-price | `underlying` [] | Index Price |
| kline-candlestick-data | `symbol` `interval` [`start-time` `end-time` `limit`] | Kline/Candlestick Data |
| open-interest | `underlying-asset` `expiration` [] | Open Interest |
| option-mark-price | [`symbol`] | Option Mark Price |
| order-book | `symbol` [`limit`] | Order Book |
| recent-block-trades-list | [`symbol` `limit`] | Recent Block Trades List |
| recent-trades-list | `symbol` [`limit`] | Recent Trades List |
| test-connectivity | [] | Test Connectivity |
| ticker24hr-price-change-statistics | [`symbol`] | 24hr Ticker Price Change Statistics |


## Market Maker Block Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| accept-block-trade-order | `block-order-matching-key` [] | Accept Block Trade Order |
| account-block-trade-list | [`end-time` `start-time` `underlying`] | Account Block Trade List |
| cancel-block-trade-order | `block-order-matching-key` [] | Cancel Block Trade Order |
| extend-block-trade-order | `block-order-matching-key` [] | Extend Block Trade Order |
| new-block-trade-order | `liquidity` `legs` [] | New Block Trade Order |
| query-block-trade-details | `block-order-matching-key` [] | Query Block Trade Details |
| query-block-trade-order | [`block-order-matching-key` `end-time` `start-time` `underlying`] | Query Block Trade Order |


## Market Maker Endpoints (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| auto-cancel-all-open-orders | `underlyings` [] | Auto-Cancel All Open Orders (Kill-Switch) Heartbeat |
| get-auto-cancel-all-open-orders | [`underlying`] | Get Auto-Cancel All Open Orders (Kill-Switch) Config |
| get-market-maker-protection-config | [`underlying`] | Get Market Maker Protection Config |
| reset-market-maker-protection-config | [`underlying`] | Reset Market Maker Protection Config |
| set-auto-cancel-all-open-orders | `underlying` `countdown-time` [] | Set Auto-Cancel All Open Orders (Kill-Switch) Config |
| set-market-maker-protection-config | [`underlying` `window-time-in-milliseconds` `frozen-time-in-milliseconds` `qty-limit` `delta-limit`] | Set Market Maker Protection Config |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-trade-list | [`symbol` `from-id` `start-time` `end-time` `limit`] | Account Trade List |
| cancel-all-option-orders-by-underlying | `underlying` [] | Cancel All Option Orders By Underlying |
| cancel-all-option-orders-on-specific-symbol | `symbol` [] | Cancel all Option orders on specific symbol |
| cancel-multiple-option-orders | `symbol` [`order-ids` `client-order-ids`] | Cancel Multiple Option Orders |
| cancel-option-order | `symbol` [`order-id` `client-order-id`] | Cancel Option Order |
| new-order | `symbol` `side` `type` `quantity` [`price` `time-in-force` `reduce-only` `post-only` `new-order-resp-type` `client-order-id` `is-mmp` `self-trade-prevention-mode`] | New Order |
| option-position-information | [`symbol`] | Option Position Information |
| place-multiple-orders | `orders` [] | Place Multiple Orders |
| query-current-open-option-orders | [`symbol` `order-id` `start-time` `end-time`] | Query Current Open Option Orders |
| query-option-order-history | `symbol` [`order-id` `start-time` `end-time` `limit`] | Query Option Order History |
| query-single-order | `symbol` [`order-id` `client-order-id`] | Query Single Order |
| user-commission | [] | User Commission |
| user-exercise-record | [`symbol` `start-time` `end-time` `limit`] | User Exercise Record |


## User Data Streams

| Endpoint | Key params | Description |
|---|---|---|
| close-user-data-stream | [] | Close User Data Stream |
| keepalive-user-data-stream | [] | Keepalive User Data Stream |
| start-user-data-stream | [] | Start User Data Stream |

### Enums

**new-order-resp-type:** `ACK` `RESULT`
**self-trade-prevention-mode:** `EXPIRE_TAKER` `EXPIRE_BOTH` `EXPIRE_MAKER`
**side:** `BUY` `SELL`
**time-in-force:** `GTC` `IOC` `FOK` `GTX`
**type:** `LIMIT`