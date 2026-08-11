## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| adjust-cross-margin-max-leverage | `max-leverage` [] | Adjust cross margin max leverage |
| disable-isolated-margin-account | `symbol` [] | Disable Isolated Margin Account |
| enable-isolated-margin-account | `symbol` [] | Enable Isolated Margin Account |
| get-bnb-burn-status | [] | Get BNB Burn Status |
| get-summary-of-margin-account | [] | Get Summary of Margin account |
| query-cross-isolated-margin-capital-flow | [`asset` `symbol` `type` `start-time` `end-time` `from-id` `limit`] | Query Cross Isolated Margin Capital Flow |
| query-cross-margin-account-details | [] | Query Cross Margin Account Details |
| query-cross-margin-fee-data | [`vip-level` `coin`] | Query Cross Margin Fee Data |
| query-enabled-isolated-margin-account-limit | [] | Query Enabled Isolated Margin Account Limit |
| query-isolated-margin-account-info | [`symbols`] | Query Isolated Margin Account Info |
| query-isolated-margin-fee-data | [`vip-level` `symbol`] | Query Isolated Margin Fee Data |


## Borrow Repay (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-future-hourly-interest-rate | `assets` `is-isolated` [] | Get future hourly interest rate |
| get-interest-history | [`asset` `isolated-symbol` `start-time` `end-time` `current` `size`] | Get Interest History |
| margin-account-borrow-repay | `asset` `is-isolated` `symbol` `amount` `type` [] | Margin account borrow/repay |
| query-borrow-repay-records-in-margin-account | `type` [`asset` `isolated-symbol` `tx-id` `start-time` `end-time` `current` `size`] | Query borrow/repay records in Margin account |
| query-margin-interest-rate-history | `asset` [`vip-level` `start-time` `end-time`] | Query Margin Interest Rate History |
| query-max-borrow | `asset` [`isolated-symbol`] | Query Max Borrow |


## Market Data

| Endpoint | Key params | Description |
|---|---|---|
| cross-margin-collateral-ratio | [] | Cross margin collateral ratio |
| get-all-cross-margin-pairs | [`symbol`] | Get All Cross Margin Pairs |
| get-all-isolated-margin-symbol | [`symbol`] | Get All Isolated Margin Symbol |
| get-all-margin-assets | [`asset`] | Get All Margin Assets |
| get-delist-schedule | [] | Get Delist Schedule |
| get-limit-price-pairs | [] | Get Limit Price Pairs |
| get-list-schedule | [] | Get list Schedule |
| get-margin-asset-risk-based-liquidation-ratio | [] | Get Margin Asset Risk-Based Liquidation Ratio |
| get-margin-restricted-assets | [] | Get Margin Restricted Assets |
| query-isolated-margin-tier-data | `symbol` [`tier`] | Query Isolated Margin Tier Data |
| query-liability-coin-leverage-bracket-in-cross-margin-pro-mode | [] | Query Liability Coin Leverage Bracket in Cross Margin Pro Mode |
| query-margin-available-inventory | `type` [] | Query Margin Available Inventory |
| query-margin-priceindex | `symbol` [] | Query Margin PriceIndex |


## Risk Data Stream

| Endpoint | Key params | Description |
|---|---|---|
| close-user-data-stream | [] | Close User Data Stream |
| keepalive-user-data-stream | `listen-key` [] | Keepalive User Data Stream |
| start-user-data-stream | [] | Start User Data Stream |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| create-special-key | `api-name` [`symbol` `ip` `public-key` `permission-mode`] | Create Special Key(Low-Latency Trading) |
| delete-special-key | [`api-name` `symbol`] | Delete Special Key(Low-Latency Trading) |
| edit-ip-for-special-key | `ip` [`symbol`] | Edit ip for Special Key(Low-Latency Trading) |
| get-force-liquidation-record | [`start-time` `end-time` `isolated-symbol` `current` `size`] | Get Force Liquidation Record |
| get-small-liability-exchange-coin-list | [] | Get Small Liability Exchange Coin List |
| get-small-liability-exchange-history | `current` `size` [`start-time` `end-time`] | Get Small Liability Exchange History |
| margin-account-cancel-all-open-orders-on-a-symbol | `symbol` [`is-isolated`] | Margin Account Cancel all Open Orders on a Symbol |
| margin-account-cancel-oco | `symbol` [`is-isolated` `order-list-id` `list-client-order-id` `new-client-order-id`] | Margin Account Cancel OCO |
| margin-account-cancel-order | `symbol` [`is-isolated` `order-id` `orig-client-order-id` `new-client-order-id`] | Margin Account Cancel Order |
| margin-account-new-oco | `symbol` `side` `quantity` `price` `stop-price` [`is-isolated` `list-client-order-id` `limit-client-order-id` `limit-iceberg-qty` `stop-client-order-id` `stop-limit-price` `stop-iceberg-qty` `stop-limit-time-in-force` `new-order-resp-type` `side-effect-type` `self-trade-prevention-mode` `auto-repay-at-cancel`] | Margin Account New OCO |
| margin-account-new-order | `symbol` `side` `type` [`is-isolated` `quantity` `quote-order-qty` `price` `stop-price` `new-client-order-id` `iceberg-qty` `new-order-resp-type` `side-effect-type` `time-in-force` `self-trade-prevention-mode` `auto-repay-at-cancel`] | Margin Account New Order |
| margin-account-new-oto | `symbol` `working-type` `working-side` `working-price` `working-quantity` `working-iceberg-qty` `pending-type` `pending-side` `pending-quantity` [`is-isolated` `list-client-order-id` `new-order-resp-type` `side-effect-type` `self-trade-prevention-mode` `auto-repay-at-cancel` `working-client-order-id` `working-time-in-force` `pending-client-order-id` `pending-price` `pending-stop-price` `pending-trailing-delta` `pending-iceberg-qty` `pending-time-in-force`] | Margin Account New OTO |
| margin-account-new-otoco | `symbol` `working-type` `working-side` `working-price` `working-quantity` `pending-side` `pending-quantity` `pending-above-type` [`is-isolated` `side-effect-type` `auto-repay-at-cancel` `list-client-order-id` `new-order-resp-type` `self-trade-prevention-mode` `working-client-order-id` `working-iceberg-qty` `working-time-in-force` `pending-above-client-order-id` `pending-above-price` `pending-above-stop-price` `pending-above-trailing-delta` `pending-above-iceberg-qty` `pending-above-time-in-force` `pending-below-type` `pending-below-client-order-id` `pending-below-price` `pending-below-stop-price` `pending-below-trailing-delta` `pending-below-iceberg-qty` `pending-below-time-in-force`] | Margin Account New OTOCO |
| margin-manual-liquidation | `type` [`symbol`] | Margin Manual Liquidation |
| query-current-margin-order-count-usage | [`is-isolated` `symbol`] | Query Current Margin Order Count Usage |
| query-margin-accounts-all-oco | [`is-isolated` `symbol` `from-id` `start-time` `end-time` `limit`] | Query Margin Account\'s all OCO |
| query-margin-accounts-all-orders | `symbol` [`is-isolated` `order-id` `start-time` `end-time` `limit`] | Query Margin Account\'s All Orders |
| query-margin-accounts-oco | [`is-isolated` `symbol` `order-list-id` `orig-client-order-id`] | Query Margin Account\'s OCO |
| query-margin-accounts-open-oco | [`is-isolated` `symbol`] | Query Margin Account\'s Open OCO |
| query-margin-accounts-open-orders | [`symbol` `is-isolated`] | Query Margin Account\'s Open Orders |
| query-margin-accounts-order | `symbol` [`is-isolated` `order-id` `orig-client-order-id`] | Query Margin Account\'s Order |
| query-margin-accounts-trade-list | `symbol` [`is-isolated` `order-id` `start-time` `end-time` `from-id` `limit`] | Query Margin Account\'s Trade List |
| query-prevented-matches | `symbol` [`prevented-match-id` `order-id` `from-prevented-match-id`  `is-isolated`] | Query Prevented Matches |
| query-special-key | [`symbol`] | Query Special key(Low Latency Trading) |
| query-special-key-list | [`symbol`] | Query Special key List(Low Latency Trading) |
| small-liability-exchange | `asset-names` [] | Small Liability Exchange |


## Transfer (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-cross-margin-transfer-history | [`asset` `type` `start-time` `end-time` `current` `size` `isolated-symbol`] | Get Cross Margin Transfer History |
| query-max-transfer-out-amount | `asset` [`isolated-symbol`] | Query Max Transfer-Out Amount |

### Enums

**new-order-resp-type:** `ACK` `RESULT` `FULL`
**side:** `BUY` `SELL`
**time-in-force:** `GTC` `IOC` `FOK`