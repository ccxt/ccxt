## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-commission | `symbol` [] | Query Commission Rates |
| all-order-list | [`from-id` `start-time` `end-time` `limit`] | Query all Order lists |
| all-orders | `symbol` [`order-id` `start-time` `end-time` `limit`] | All orders |
| get-account | [`omit-zero-balances`] | Account information |
| get-open-orders | [`symbol`] | Current open orders |
| get-order | `symbol` [`order-id` `orig-client-order-id`] | Query order |
| get-order-list | [`order-list-id` `orig-client-order-id`] | Query Order list |
| my-allocations | `symbol` [`start-time` `end-time` `from-allocation-id` `limit` `order-id`] | Query Allocations |
| my-filters | `symbol` [] | Query relevant filters |
| my-prevented-matches | `symbol` [`prevented-match-id` `order-id` `from-prevented-match-id` `limit`] | Query Prevented Matches |
| my-trades | `symbol` [`order-id` `start-time` `end-time` `from-id` `limit`] | Account trade list |
| open-order-list | [] | Query Open Order lists |
| order-amendments | `symbol` `order-id` [`from-execution-id` `limit`] | Query Order Amendments |
| rate-limit-order | [] | Query Unfilled Order Count |


## General

| Endpoint | Key params | Description |
|---|---|---|
| exchange-info | [`symbol` `symbols` `permissions` `show-permission-sets` `symbol-status`] | Exchange information |
| execution-rules | [`symbol` `symbols` `symbol-status`] | Query Execution Rules |
| ping | [] | Test connectivity |
| time | [] | Check server time |


## Market

| Endpoint | Key params | Description |
|---|---|---|
| agg-trades | `symbol` [`from-id` `start-time` `end-time` `limit`] | Compressed/Aggregate trades list |
| avg-price | `symbol` [] | Current average price |
| depth | `symbol` [`limit` `symbol-status`] | Order book |
| get-trades | `symbol` [`limit`] | Recent trades list |
| historical-block-trades | `symbol` `from-id` [`limit`] | Historical Block Trades |
| historical-trades | `symbol` [`limit` `from-id`] | Old trade lookup |
| klines | `symbol` `interval` [`start-time` `end-time` `time-zone` `limit`] | Kline/Candlestick data |
| reference-price | `symbol` [] | Query Reference Price |
| reference-price-calculation | `symbol` [`symbol-status`] | Query Reference Price Calculation |
| ticker | [`symbol` `symbols` `window-size` `type` `symbol-status`] | Rolling window price change statistics |
| ticker24hr | [`symbol` `symbols` `type` `symbol-status`] | 24hr ticker price change statistics |
| ticker-book-ticker | [`symbol` `symbols` `symbol-status`] | Symbol order book ticker |
| ticker-price | [`symbol` `symbols` `symbol-status`] | Symbol price ticker |
| ticker-trading-day | [`symbol` `symbols` `time-zone` `type` `symbol-status`] | Trading Day Ticker |
| ui-klines | `symbol` `interval` [`start-time` `end-time` `time-zone` `limit`] | UIKlines |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| delete-open-orders | `symbol` [] | Cancel All Open Orders on a Symbol |
| delete-order | `symbol` [`order-id` `orig-client-order-id` `new-client-order-id` `cancel-restrictions`] | Cancel order |
| delete-order-list | `symbol` [`order-list-id` `list-client-order-id` `new-client-order-id`] | Cancel Order list |
| new-order | `symbol` `side` `type` [`time-in-force` `quantity` `quote-order-qty` `price` `new-client-order-id` `strategy-id` `strategy-type` `stop-price` `trailing-delta` `iceberg-qty` `new-order-resp-type` `self-trade-prevention-mode` `peg-price-type` `peg-offset-value` `peg-offset-type`] | New order |
| order-amend-keep-priority | `symbol` `new-qty` [`order-id` `orig-client-order-id` `new-client-order-id`] | Order Amend Keep Priority |
| order-cancel-replace | `symbol` `side` `type` `cancel-replace-mode` [`time-in-force` `quantity` `quote-order-qty` `price` `cancel-new-client-order-id` `cancel-orig-client-order-id` `cancel-order-id` `new-client-order-id` `strategy-id` `strategy-type` `stop-price` `trailing-delta` `iceberg-qty` `new-order-resp-type` `self-trade-prevention-mode` `cancel-restrictions` `order-rate-limit-exceeded-mode` `peg-price-type` `peg-offset-value` `peg-offset-type`] | Cancel an Existing Order and Send a New Order |
| order-list-oco | `symbol` `side` `quantity` `above-type` `below-type` [`list-client-order-id` `above-client-order-id` `above-iceberg-qty` `above-price` `above-stop-price` `above-trailing-delta` `above-time-in-force` `above-strategy-id` `above-strategy-type` `above-peg-price-type` `above-peg-offset-type` `above-peg-offset-value` `below-client-order-id` `below-iceberg-qty` `below-price` `below-stop-price` `below-trailing-delta` `below-time-in-force` `below-strategy-id` `below-strategy-type` `below-peg-price-type` `below-peg-offset-type` `below-peg-offset-value` `new-order-resp-type` `self-trade-prevention-mode`] | New Order list - OCO |
| order-list-opo | `symbol` `working-type` `working-side` `working-price` `working-quantity` `pending-type` `pending-side` [`list-client-order-id` `new-order-resp-type` `self-trade-prevention-mode` `working-client-order-id` `working-iceberg-qty` `working-time-in-force` `working-strategy-id` `working-strategy-type` `working-peg-price-type` `working-peg-offset-type` `working-peg-offset-value` `pending-client-order-id` `pending-price` `pending-stop-price` `pending-trailing-delta` `pending-iceberg-qty` `pending-time-in-force` `pending-strategy-id` `pending-strategy-type` `pending-peg-price-type` `pending-peg-offset-type` `pending-peg-offset-value`] | New Order List - OPO |
| order-list-opoco | `symbol` `working-type` `working-side` `working-price` `working-quantity` `pending-side` `pending-above-type` [`list-client-order-id` `new-order-resp-type` `self-trade-prevention-mode` `working-client-order-id` `working-iceberg-qty` `working-time-in-force` `working-strategy-id` `working-strategy-type` `working-peg-price-type` `working-peg-offset-type` `working-peg-offset-value` `pending-above-client-order-id` `pending-above-price` `pending-above-stop-price` `pending-above-trailing-delta` `pending-above-iceberg-qty` `pending-above-time-in-force` `pending-above-strategy-id` `pending-above-strategy-type` `pending-above-peg-price-type` `pending-above-peg-offset-type` `pending-above-peg-offset-value` `pending-below-type` `pending-below-client-order-id` `pending-below-price` `pending-below-stop-price` `pending-below-trailing-delta` `pending-below-iceberg-qty` `pending-below-time-in-force` `pending-below-strategy-id` `pending-below-strategy-type` `pending-below-peg-price-type` `pending-below-peg-offset-type` `pending-below-peg-offset-value`] | New Order List - OPOCO |
| order-list-oto | `symbol` `working-type` `working-side` `working-price` `working-quantity` `pending-type` `pending-side` `pending-quantity` [`list-client-order-id` `new-order-resp-type` `self-trade-prevention-mode` `working-client-order-id` `working-iceberg-qty` `working-time-in-force` `working-strategy-id` `working-strategy-type` `working-peg-price-type` `working-peg-offset-type` `working-peg-offset-value` `pending-client-order-id` `pending-price` `pending-stop-price` `pending-trailing-delta` `pending-iceberg-qty` `pending-time-in-force` `pending-strategy-id` `pending-strategy-type` `pending-peg-price-type` `pending-peg-offset-type` `pending-peg-offset-value`] | New Order list - OTO |
| order-list-otoco | `symbol` `working-type` `working-side` `working-price` `working-quantity` `pending-side` `pending-quantity` `pending-above-type` [`list-client-order-id` `new-order-resp-type` `self-trade-prevention-mode` `working-client-order-id` `working-iceberg-qty` `working-time-in-force` `working-strategy-id` `working-strategy-type` `working-peg-price-type` `working-peg-offset-type` `working-peg-offset-value` `pending-above-client-order-id` `pending-above-price` `pending-above-stop-price` `pending-above-trailing-delta` `pending-above-iceberg-qty` `pending-above-time-in-force` `pending-above-strategy-id` `pending-above-strategy-type` `pending-above-peg-price-type` `pending-above-peg-offset-type` `pending-above-peg-offset-value` `pending-below-type` `pending-below-client-order-id` `pending-below-price` `pending-below-stop-price` `pending-below-trailing-delta` `pending-below-iceberg-qty` `pending-below-time-in-force` `pending-below-strategy-id` `pending-below-strategy-type` `pending-below-peg-price-type` `pending-below-peg-offset-type` `pending-below-peg-offset-value`] | New Order list - OTOCO |
| order-oco | `symbol` `side` `quantity` `price` `stop-price` [`list-client-order-id` `limit-client-order-id` `limit-strategy-id` `limit-strategy-type` `limit-iceberg-qty` `trailing-delta` `stop-client-order-id` `stop-strategy-id` `stop-strategy-type` `stop-limit-price` `stop-iceberg-qty` `stop-limit-time-in-force` `new-order-resp-type` `self-trade-prevention-mode`] | New OCO - Deprecated |
| order-test | `symbol` `side` `type` [`compute-commission-rates` `time-in-force` `quantity` `quote-order-qty` `price` `new-client-order-id` `strategy-id` `strategy-type` `stop-price` `trailing-delta` `iceberg-qty` `new-order-resp-type` `self-trade-prevention-mode` `peg-price-type` `peg-offset-value` `peg-offset-type`] | Test new order |
| sor-order | `symbol` `side` `type` `quantity` [`time-in-force` `price` `new-client-order-id` `strategy-id` `strategy-type` `iceberg-qty` `new-order-resp-type` `self-trade-prevention-mode`] | New order using SOR |
| sor-order-test | `symbol` `side` `type` `quantity` [`compute-commission-rates` `time-in-force` `price` `new-client-order-id` `strategy-id` `strategy-type` `iceberg-qty` `new-order-resp-type` `self-trade-prevention-mode`] | Test new order using SOR |

### Enums

**above-peg-offset-type:** `PRICE_LEVEL`
**above-peg-price-type:** `PRIMARY_PEG` `MARKET_PEG`
**above-time-in-force:** `GTC` `IOC` `FOK`
**above-type:** `STOP_LOSS_LIMIT` `STOP_LOSS` `LIMIT_MAKER` `TAKE_PROFIT` `TAKE_PROFIT_LIMIT`
**below-peg-offset-type:** `PRICE_LEVEL`
**below-peg-price-type:** `PRIMARY_PEG` `MARKET_PEG`
**below-time-in-force:** `GTC` `IOC` `FOK`
**below-type:** `STOP_LOSS` `STOP_LOSS_LIMIT` `TAKE_PROFIT` `TAKE_PROFIT_LIMIT`
**cancel-replace-mode:** `STOP_ON_FAILURE` `ALLOW_FAILURE`
**cancel-restrictions:** `ONLY_NEW` `NEW` `ONLY_PARTIALLY_FILLED` `PARTIALLY_FILLED`
**interval:** `1s` `1m` `3m` `5m` `15m` `30m` `1h` `2h` `4h` `6h` `8h` `12h` `1d` `3d` `1w` `1M`
**new-order-resp-type:** `ACK` `RESULT` `FULL` `MARKET` `LIMIT`
**order-rate-limit-exceeded-mode:** `DO_NOTHING` `CANCEL_ONLY`
**peg-offset-type:** `PRICE_LEVEL` `NON_REPRESENTABLE`
**peg-price-type:** `PRIMARY_PEG` `MARKET_PEG` `NON_REPRESENTABLE`
**pending-above-peg-offset-type:** `PRICE_LEVEL`
**pending-above-peg-price-type:** `PRIMARY_PEG` `MARKET_PEG`
**pending-above-time-in-force:** `GTC` `IOC` `FOK`
**pending-above-type:** `STOP_LOSS_LIMIT` `STOP_LOSS` `LIMIT_MAKER` `TAKE_PROFIT` `TAKE_PROFIT_LIMIT`
**pending-below-peg-offset-type:** `PRICE_LEVEL`
**pending-below-peg-price-type:** `PRIMARY_PEG` `MARKET_PEG`
**pending-below-time-in-force:** `GTC` `IOC` `FOK`
**pending-below-type:** `STOP_LOSS` `STOP_LOSS_LIMIT` `TAKE_PROFIT` `TAKE_PROFIT_LIMIT`
**pending-peg-offset-type:** `PRICE_LEVEL`
**pending-peg-price-type:** `PRIMARY_PEG` `MARKET_PEG`
**pending-side:** `BUY` `SELL`
**pending-time-in-force:** `GTC` `IOC` `FOK`
**pending-type:** `LIMIT` `MARKET` `STOP_LOSS` `STOP_LOSS_LIMIT` `TAKE_PROFIT` `TAKE_PROFIT_LIMIT` `LIMIT_MAKER`
**self-trade-prevention-mode:** `NONE` `EXPIRE_TAKER` `EXPIRE_MAKER` `EXPIRE_BOTH` `DECREMENT` `TRANSFER` `NON_REPRESENTABLE`
**side:** `BUY` `SELL`
**stop-limit-time-in-force:** `GTC` `IOC` `FOK`
**symbol-status:** `TRADING` `END_OF_DAY` `HALT` `BREAK` `NON_REPRESENTABLE`
**time-in-force:** `GTC` `IOC` `FOK` `NON_REPRESENTABLE`
**type:** `FULL` `MINI`
**type:** `MARKET` `LIMIT` `STOP_LOSS` `STOP_LOSS_LIMIT` `TAKE_PROFIT` `TAKE_PROFIT_LIMIT` `LIMIT_MAKER` `NON_REPRESENTABLE`
**window-size:** `1m` `2m` `3m` `4m` `5m` `6m` `7m` `8m` `9m` `10m` `11m` `12m` `13m` `14m` `15m` `16m` `17m` `18m` `19m` `20m` `21m` `22m` `23m` `24m` `25m` `26m` `27m` `28m` `29m` `30m` `31m` `32m` `33m` `34m` `35m` `36m` `37m` `38m` `39m` `40m` `41m` `42m` `43m` `44m` `45m` `46m` `47m` `48m` `49m` `50m` `51m` `52m` `53m` `54m` `55m` `56m` `57m` `58m` `59m` `1h` `2h` `3h` `4h` `5h` `6h` `7h` `8h` `9h` `10h` `11h` `12h` `13h` `14h` `15h` `16h` `17h` `18h` `19h` `20h` `21h` `22h` `23h` `1d` `2d` `3d` `4d` `5d` `6d`
**working-peg-offset-type:** `PRICE_LEVEL`
**working-peg-price-type:** `PRIMARY_PEG` `MARKET_PEG`
**working-side:** `BUY` `SELL`
**working-time-in-force:** `GTC` `IOC` `FOK`
**working-type:** `LIMIT` `LIMIT_MAKER`