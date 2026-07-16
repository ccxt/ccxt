## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-balance | [`asset`] | Account Balance |
| account-information | [] | Account Information |
| bnb-transfer | `amount` `transfer-side` [] | BNB transfer |
| change-auto-repay-futures-status | `auto-repay` [] | Change Auto-repay-futures Status |
| change-cm-initial-leverage | `symbol` `leverage` [] | Change CM Initial Leverage |
| change-cm-position-mode | `dual-side-position` [] | Change CM Position Mode |
| change-um-initial-leverage | `symbol` `leverage` [] | Change UM Initial Leverage |
| change-um-position-mode | `dual-side-position` [] | Change UM Position Mode |
| cm-notional-and-leverage-brackets | [`symbol`] | CM Notional and Leverage Brackets |
| fund-auto-collection | [] | Fund Auto-collection |
| fund-collection-by-asset | `asset` [] | Fund Collection by Asset |
| get-auto-repay-futures-status | [] | Get Auto-repay-futures Status |
| get-cm-account-detail | [] | Get CM Account Detail |
| get-cm-current-position-mode | [] | Get CM Current Position Mode |
| get-cm-income-history | [`symbol` `income-type` `start-time` `end-time` `page` `limit`] | Get CM Income History |
| get-download-id-for-um-futures-order-history | `start-time` `end-time` [] | Get Download Id For UM Futures Order History |
| get-download-id-for-um-futures-trade-history | `start-time` `end-time` [] | Get Download Id For UM Futures Trade History |
| get-download-id-for-um-futures-transaction-history | `start-time` `end-time` [] | Get Download Id For UM Futures Transaction History |
| get-margin-borrow-loan-interest-history | [`asset` `start-time` `end-time` `current` `size` `archived`] | Get Margin Borrow/Loan Interest History |
| get-um-account-detail | [] | Get UM Account Detail |
| get-um-account-detail-v2 | [] | Get UM Account Detail V2 |
| get-um-current-position-mode | [] | Get UM Current Position Mode |
| get-um-futures-order-download-link-by-id | `download-id` [] | Get UM Futures Order Download Link by Id |
| get-um-futures-trade-download-link-by-id | `download-id` [] | Get UM Futures Trade Download Link by Id |
| get-um-futures-transaction-download-link-by-id | `download-id` [] | Get UM Futures Transaction Download Link by Id |
| get-um-income-history | [`symbol` `income-type` `start-time` `end-time` `page` `limit`] | Get UM Income History |
| get-user-commission-rate-for-cm | `symbol` [] | Get User Commission Rate for CM |
| get-user-commission-rate-for-um | `symbol` [] | Get User Commission Rate for UM |
| margin-max-borrow | `asset` [] | Margin Max Borrow |
| portfolio-margin-um-trading-quantitative-rules-indicators | [`symbol`] | Portfolio Margin UM Trading Quantitative Rules Indicators |
| query-cm-position-information | [`margin-asset` `pair`] | Query CM Position Information |
| query-margin-loan-record | `asset` [`tx-id` `start-time` `end-time` `current` `size` `archived`] | Query Margin Loan Record |
| query-margin-max-withdraw | `asset` [] | Query Margin Max Withdraw |
| query-margin-repay-record | `asset` [`tx-id` `start-time` `end-time` `current` `size` `archived`] | Query Margin repay Record |
| query-portfolio-margin-negative-balance-interest-history | [`asset` `start-time` `end-time` `size`] | Query Portfolio Margin Negative Balance Interest History |
| query-um-position-information | [`symbol`] | Query UM Position Information |
| query-user-negative-balance-auto-exchange-record | `start-time` `end-time` [] | Query User Negative Balance Auto Exchange Record |
| query-user-rate-limit | [] | Query User Rate Limit |
| repay-futures-negative-balance | [] | Repay futures Negative Balance |
| um-futures-account-configuration | [] | UM Futures Account Configuration |
| um-futures-symbol-configuration | [`symbol`] | UM Futures Symbol Configuration |
| um-notional-and-leverage-brackets | [`symbol`] | UM Notional and Leverage Brackets |


## Market Data

| Endpoint | Key params | Description |
|---|---|---|
| test-connectivity | [] | Test Connectivity |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| cancel-all-cm-open-conditional-orders | `symbol` [] | Cancel All CM Open Conditional Orders |
| cancel-all-cm-open-orders | `symbol` [] | Cancel All CM Open Orders |
| cancel-all-um-algo-open-orders | `symbol` [] | Cancel All UM Algo Open Orders |
| cancel-all-um-open-conditional-orders | `symbol` [] | Cancel All UM Open Conditional Orders |
| cancel-all-um-open-orders | `symbol` [] | Cancel All UM Open Orders |
| cancel-cm-conditional-order | `symbol` [`strategy-id` `new-client-strategy-id`] | Cancel CM Conditional Order |
| cancel-cm-order | `symbol` [`order-id` `orig-client-order-id`] | Cancel CM Order |
| cancel-margin-account-all-open-orders-on-a-symbol | `symbol` [] | Cancel Margin Account All Open Orders on a Symbol |
| cancel-margin-account-oco-orders | `symbol` [`order-list-id` `list-client-order-id` `new-client-order-id`] | Cancel Margin Account OCO Orders |
| cancel-margin-account-order | `symbol` [`order-id` `orig-client-order-id` `new-client-order-id`] | Cancel Margin Account Order |
| cancel-um-algo-order | [`algo-id` `client-algo-id`] | Cancel UM Algo Order |
| cancel-um-conditional-order | `symbol` [`strategy-id` `new-client-strategy-id`] | Cancel UM Conditional Order |
| cancel-um-order | `symbol` [`order-id` `orig-client-order-id`] | Cancel UM Order |
| cm-account-trade-list | [`symbol` `pair` `start-time` `end-time` `from-id` `limit`] | CM Account Trade List |
| cm-position-adl-quantile-estimation | [`symbol`] | CM Position ADL Quantile Estimation |
| futures-tradfi-perps-contract | [] | Futures TradFi Perps Contract |
| get-um-futures-bnb-burn-status | [] | Get UM Futures BNB Burn Status |
| margin-account-borrow | `asset` `amount` [] | Margin Account Borrow |
| margin-account-new-oco | `symbol` `side` `quantity` `price` `stop-price` [`list-client-order-id` `limit-client-order-id` `limit-iceberg-qty` `stop-client-order-id` `stop-limit-price` `stop-iceberg-qty` `stop-limit-time-in-force` `new-order-resp-type` `side-effect-type`] | Margin Account New OCO |
| margin-account-repay | `asset` `amount` [] | Margin Account Repay |
| margin-account-repay-debt | `asset` [`amount` `specify-repay-assets`] | Margin Account Repay Debt |
| margin-account-trade-list | `symbol` [`order-id` `start-time` `end-time` `from-id` `limit`] | Margin Account Trade List |
| modify-cm-order | `symbol` `side` `quantity` `price` [`order-id` `orig-client-order-id` `price-match`] | Modify CM Order |
| modify-um-order | `symbol` `side` `quantity` `price` [`order-id` `orig-client-order-id` `price-match`] | Modify UM Order |
| new-cm-conditional-order | `symbol` `side` `strategy-type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `working-type` `price-protect` `new-client-strategy-id` `stop-price` `activation-price` `callback-rate`] | New CM Conditional Order |
| new-cm-order | `symbol` `side` `type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `price-match` `new-client-order-id` `new-order-resp-type`] | New CM Order |
| new-margin-order | `symbol` `side` `type` [`quantity` `quote-order-qty` `price` `stop-price` `new-client-order-id` `new-order-resp-type` `iceberg-qty` `side-effect-type` `time-in-force` `self-trade-prevention-mode` `auto-repay-at-cancel`] | New Margin Order |
| new-um-algo-order | `algo-type` `symbol` `side` `type` `quantity` [`position-side` `time-in-force` `price` `trigger-price` `working-type` `price-match` `price-protect` `reduce-only` `activate-price` `callback-rate` `client-algo-id` `new-order-resp-type` `self-trade-prevention-mode` `good-till-date`] | New UM Algo Order |
| new-um-conditional-order | `symbol` `side` `strategy-type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `working-type` `price-protect` `new-client-strategy-id` `stop-price` `activation-price` `callback-rate` `price-match` `self-trade-prevention-mode` `good-till-date`] | New UM Conditional Order |
| new-um-order | `symbol` `side` `type` [`position-side` `time-in-force` `quantity` `reduce-only` `price` `new-client-order-id` `new-order-resp-type` `price-match` `self-trade-prevention-mode` `good-till-date`] | New UM Order |
| query-all-cm-conditional-orders | [`symbol` `strategy-id` `start-time` `end-time` `limit`] | Query All CM Conditional Orders |
| query-all-cm-orders | `symbol` [`pair` `order-id` `start-time` `end-time` `limit`] | Query All CM Orders |
| query-all-current-cm-open-conditional-orders | [`symbol`] | Query All Current CM Open Conditional Orders |
| query-all-current-cm-open-orders | [`symbol` `pair`] | Query All Current CM Open Orders |
| query-all-current-um-open-algo-orders | [`algo-type` `symbol` `algo-id`] | Query All Current UM Open Algo Orders |
| query-all-current-um-open-conditional-orders | [`symbol`] | Query All Current UM Open Conditional Orders |
| query-all-current-um-open-orders | [`symbol`] | Query All Current UM Open Orders |
| query-all-margin-account-orders | `symbol` [`order-id` `start-time` `end-time` `limit`] | Query All Margin Account Orders |
| query-all-um-conditional-orders | [`symbol` `strategy-id` `start-time` `end-time` `limit`] | Query All UM Conditional Orders |
| query-all-um-orders | `symbol` [`order-id` `start-time` `end-time` `limit`] | Query All UM Orders |
| query-cm-conditional-order-history | `symbol` [`strategy-id` `new-client-strategy-id`] | Query CM Conditional Order History |
| query-cm-modify-order-history | `symbol` [`order-id` `orig-client-order-id` `start-time` `end-time` `limit`] | Query CM Modify Order History |
| query-cm-order | `symbol` [`order-id` `orig-client-order-id`] | Query CM Order |
| query-current-cm-open-conditional-order | `symbol` [`strategy-id` `new-client-strategy-id`] | Query Current CM Open Conditional Order |
| query-current-cm-open-order | `symbol` [`order-id` `orig-client-order-id`] | Query Current CM Open Order |
| query-current-margin-open-order | `symbol` [] | Query Current Margin Open Order |
| query-current-um-open-algo-order | [`algo-id` `client-algo-id`] | Query Current UM Open Algo Order |
| query-current-um-open-conditional-order | `symbol` [`strategy-id` `new-client-strategy-id`] | Query Current UM Open Conditional Order |
| query-current-um-open-order | `symbol` [`order-id` `orig-client-order-id`] | Query Current UM Open Order |
| query-margin-account-order | `symbol` [`order-id` `orig-client-order-id`] | Query Margin Account Order |
| query-margin-accounts-all-oco | [`from-id` `start-time` `end-time` `limit`] | Query Margin Account\'s all OCO |
| query-margin-accounts-oco | [`order-list-id` `orig-client-order-id`] | Query Margin Account\'s OCO |
| query-margin-accounts-open-oco | [] | Query Margin Account\'s Open OCO |
| query-um-algo-order-history | `symbol` [`algo-id` `start-time` `end-time` `limit`] | Query UM Algo Order History |
| query-um-conditional-order-history | `symbol` [`strategy-id` `new-client-strategy-id`] | Query UM Conditional Order History |
| query-um-modify-order-history | `symbol` [`order-id` `orig-client-order-id` `start-time` `end-time` `limit`] | Query UM Modify Order History |
| query-um-order | `symbol` [`order-id` `orig-client-order-id`] | Query UM Order |
| query-users-cm-force-orders | [`symbol` `auto-close-type` `start-time` `end-time` `limit`] | Query User\'s CM Force Orders |
| query-users-margin-force-orders | [`start-time` `end-time` `current` `size`] | Query User\'s Margin Force Orders |
| query-users-um-force-orders | [`symbol` `auto-close-type` `start-time` `end-time` `limit`] | Query User\'s UM Force Orders |
| toggle-bnb-burn-on-um-futures-trade | `fee-burn` [] | Toggle BNB Burn On UM Futures Trade |
| um-account-trade-list | `symbol` [`start-time` `end-time` `from-id` `limit`] | UM Account Trade List |
| um-position-adl-quantile-estimation | [`symbol`] | UM Position ADL Quantile Estimation |


## User Data Streams

| Endpoint | Key params | Description |
|---|---|---|
| close-user-data-stream | [] | Close User Data Stream |
| keepalive-user-data-stream | [] | Keepalive User Data Stream |
| start-user-data-stream | [] | Start User Data Stream |

### Enums

**auto-close-type:** `LIQUIDATION` `ADL`
**new-order-resp-type:** `ACK` `RESULT`
**position-side:** `BOTH` `LONG` `SHORT`
**price-match:** `NONE` `OPPONENT` `OPPONENT_5` `OPPONENT_10` `OPPONENT_20` `QUEUE` `QUEUE_5` `QUEUE_10` `QUEUE_20`
**self-trade-prevention-mode:** `NONE` `EXPIRE_TAKER` `EXPIRE_BOTH` `EXPIRE_MAKER`
**side-effect-type:** `NO_SIDE_EFFECT` `MARGIN_BUY` `AUTO_REPAY`
**side:** `BUY` `SELL`
**stop-limit-time-in-force:** `GTC` `IOC` `FOK`
**strategy-type:** `STOP` `STOP_MARKET` `LIMIT_MAKER` `TAKE_PROFIT` `TAKE_PROFIT_MARKET` `TRAILING_STOP_MARKET`
**time-in-force:** `GTC` `IOC` `FOK` `GTX`
**type:** `LIMIT` `MARKET`
**working-type:** `MARK_PRICE`