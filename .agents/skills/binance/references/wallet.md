## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-api-trading-status | [] | Account API Trading Status |
| account-info | [] | Account info |
| account-status | [] | Account Status |
| daily-account-snapshot | `type` [`start-time` `end-time` `limit`] | Daily Account Snapshot |
| disable-fast-withdraw-switch | [] | Disable Fast Withdraw Switch |
| enable-fast-withdraw-switch | [] | Enable Fast Withdraw Switch |
| get-api-key-permission | [] | Get API Key Permission |


## Asset (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| asset-detail | [`asset`] | Asset Detail |
| asset-dividend-record | [`asset` `start-time` `end-time` `limit`] | Asset Dividend Record |
| dust-convert | `asset` [`client-id` `target-asset` `third-party-client-id` `dust-quota-asset-to-target-asset-price`] | Dust Convert |
| dust-convertible-assets | `target-asset` [`dust-quota-asset-to-target-asset-price`] | Dust Convertible Assets |
| dust-transfer | `asset` [`account-type`] | Dust Transfer |
| dustlog | [`account-type` `start-time` `end-time`] | DustLog |
| funding-wallet | [`asset` `need-btc-valuation`] | Funding Wallet |
| get-assets-that-can-be-converted-into-bnb | [`account-type`] | Get Assets That Can Be Converted Into BNB |
| get-cloud-mining-payment-and-refund-history | `start-time` `end-time` [`tran-id` `client-tran-id` `asset` `current` `size`] | Get Cloud-Mining payment and refund history |
| get-open-symbol-list | [] | Get Open Symbol List |
| query-user-delegation-history | `email` `start-time` `end-time` [`type` `asset` `current` `size`] | Query User Delegation History(For Master Account) |
| query-user-universal-transfer-history | `type` [`start-time` `end-time` `current` `size` `from-symbol` `to-symbol`] | Query User Universal Transfer History |
| query-user-wallet-balance | [`quote-asset`] | Query User Wallet Balance |
| toggle-bnb-burn-on-spot-trade-and-margin-interest | [`spot-bnb-burn` `interest-bnb-burn`] | Toggle BNB Burn On Spot Trade And Margin Interest |
| trade-fee | [`symbol`] | Trade Fee |
| user-asset | [`asset` `need-btc-valuation`] | User Asset |
| user-universal-transfer | `type` `asset` `amount` [`from-symbol` `to-symbol`] | User Universal Transfer |


## Capital (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| all-coins-information | [] | All Coins\' Information |
| deposit-address | `coin` [`network` `amount`] | Deposit Address(supporting network) |
| deposit-history | [`include-source` `coin` `status` `start-time` `end-time` `offset` `limit`  `tx-id`] | Deposit History (supporting network) |
| fetch-deposit-address-list-with-network | `coin` [`network`] | Fetch deposit address list with network |
| fetch-withdraw-address-list | [] | Fetch withdraw address list |
| fetch-withdraw-quota | [] | Fetch withdraw quota |
| one-click-arrival-deposit-apply | [`deposit-id` `tx-id` `sub-account-id` `sub-user-id`] | One click arrival deposit apply (for expired address deposit) |
| withdraw | `coin` `address` `amount` [`withdraw-order-id` `network` `address-tag` `transaction-fee-flag` `name` `wallet-type`] | Withdraw |
| withdraw-history | [`coin` `withdraw-order-id` `status` `offset` `limit` `id-list` `start-time` `end-time`] | Withdraw History (supporting network) |


## Others

| Endpoint | Key params | Description |
|---|---|---|
| get-symbols-delist-schedule-for-spot | [] | Get symbols delist schedule for spot |
| system-status | [] | System Status (System) |


## Travel Rule (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| broker-withdraw | `address` `coin` `amount` `withdraw-order-id` `questionnaire` `originator-pii` `signature` [`address-tag` `network` `address-name` `transaction-fee-flag` `wallet-type`] | Broker Withdraw (for brokers of local entities that require travel rule) |
| check-questionnaire-requirements | [] | Check Questionnaire Requirements (for local entities that require travel rule) (supporting network) |
| deposit-history-travel-rule | [`tr-id` `tx-id` `tran-id` `network` `coin` `travel-rule-status` `pending-questionnaire` `start-time` `end-time` `offset` `limit`] | Deposit History (for local entities that required travel rule) (supporting network) |
| deposit-history-v2 | [`deposit-id` `tx-id` `network` `coin` `retrieve-questionnaire` `start-time` `end-time` `offset` `limit`] | Deposit History V2 (for local entities that required travel rule) (supporting network) |
| fetch-address-verification-list | [] | Fetch address verification list |
| submit-deposit-questionnaire | `sub-account-id` `deposit-id` `questionnaire` `beneficiary-pii` `signature` [`network` `coin` `amount` `address` `address-tag`] | Submit Deposit Questionnaire (For local entities that require travel rule) (supporting network) |
| submit-deposit-questionnaire-travel-rule | `tran-id` `questionnaire` [] | Submit Deposit Questionnaire (For local entities that require travel rule) (supporting network) |
| submit-deposit-questionnaire-v2 | `deposit-id` `questionnaire` [] | Submit Deposit Questionnaire V2 (For local entities that require travel rule) (supporting network) |
| vasp-list | [] | VASP list (for local entities that require travel rule) (supporting network) |
| withdraw-history-v1 | [`tr-id` `tx-id` `withdraw-order-id` `network` `coin` `travel-rule-status` `offset` `limit` `start-time` `end-time`] | Withdraw History (for local entities that require travel rule) (supporting network) |
| withdraw-history-v2 | [`tr-id` `tx-id` `withdraw-order-id` `network` `coin` `travel-rule-status` `offset` `limit` `start-time` `end-time`] | Withdraw History V2 (for local entities that require travel rule) (supporting network) |
| withdraw-travel-rule | `coin` `address` `amount` `questionnaire` [`withdraw-order-id` `network` `address-tag` `transaction-fee-flag` `name` `wallet-type`] | Withdraw (for local entities that require travel rule) |