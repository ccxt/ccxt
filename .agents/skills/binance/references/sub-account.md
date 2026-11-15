## Account Management (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| create-a-virtual-sub-account | `sub-account-string` [] | Create a Virtual Sub-account (For Master Account) |
| enable-futures-for-sub-account | `email` [] | Enable Futures for Sub-account (For Master Account) |
| enable-options-for-sub-account | `email` [] | Enable Options for Sub-account (For Master Account) |
| get-futures-position-risk-of-sub-account | `email` [] | Get Futures Position-Risk of Sub-account (For Master Account) |
| get-futures-position-risk-of-sub-account-v2 | `email` `futures-type` [] | Get Futures Position-Risk of Sub-account V2 (For Master Account) |
| get-sub-accounts-status-on-margin-or-futures | [`email`] | Get Sub-account\'s Status on Margin Or Futures (For Master Account) |
| query-sub-account-list | [`email` `is-freeze` `page` `limit`] | Query Sub-account List (For Master Account) |
| query-sub-account-transaction-statistics | [`email`] | Query Sub-account Transaction Statistics (For Master Account) |


## Api Management (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| add-ip-restriction-for-sub-account-api-key | `email` `sub-account-api-key` `status` [`ip-address`] | Add IP Restriction for Sub-Account API key (For Master Account) |
| delete-ip-list-for-a-sub-account-api-key | `email` `sub-account-api-key` `ip-address` [] | Delete IP List For a Sub-account API Key (For Master Account) |
| get-ip-restriction-for-a-sub-account-api-key | `email` `sub-account-api-key` [] | Get IP Restriction for a Sub-account API Key (For Master Account) |


## Asset Management (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| futures-transfer-for-sub-account | `email` `asset` `amount` `type` [] | Futures Transfer for Sub-account (For Master Account) |
| get-detail-on-sub-accounts-futures-account | `email` [] | Get Detail on Sub-account\'s Futures Account (For Master Account) |
| get-detail-on-sub-accounts-futures-account-v2 | `email` `futures-type` [] | Get Detail on Sub-account\'s Futures Account V2 (For Master Account) |
| get-detail-on-sub-accounts-margin-account | `email` [] | Get Detail on Sub-account\'s Margin Account (For Master Account) |
| get-move-position-history-for-sub-account | `symbol` `page` `rows` [`start-time` `end-time`] | Get Move Position History for Sub-account (For Master Account) |
| get-sub-account-deposit-address | `email` `coin` [`network` `amount`] | Get Sub-account Deposit Address (For Master Account) |
| get-sub-account-deposit-history | `email` [`coin` `status` `start-time` `end-time` `limit` `offset`  `tx-id`] | Get Sub-account Deposit History (For Master Account) |
| get-summary-of-sub-accounts-futures-account | `page` `limit` [] | Get Summary of Sub-account\'s Futures Account (For Master Account) |
| get-summary-of-sub-accounts-futures-account-v2 | `futures-type` [`page` `limit`] | Get Summary of Sub-account\'s Futures Account V2 (For Master Account) |
| get-summary-of-sub-accounts-margin-account | [] | Get Summary of Sub-account\'s Margin Account (For Master Account) |
| margin-transfer-for-sub-account | `email` `asset` `amount` `type` [] | Margin Transfer for Sub-account (For Master Account) |
| move-position-for-sub-account | `from-user-email` `to-user-email` `product-type` `order-args` [] | Move Position for Sub-account (For Master Account) |
| query-sub-account-assets | `email` [] | Query Sub-account Assets (For Master Account) |
| query-sub-account-assets-asset-management | `email` [] | Query Sub-account Assets (For Master Account) |
| query-sub-account-futures-asset-transfer-history | `email` `futures-type` [`start-time` `end-time` `page` `limit`] | Query Sub-account Futures Asset Transfer History (For Master Account) |
| query-sub-account-spot-asset-transfer-history | [`from-email` `to-email` `start-time` `end-time` `page` `limit`] | Query Sub-account Spot Asset Transfer History (For Master Account) |
| query-sub-account-spot-assets-summary | [`email` `page` `size`] | Query Sub-account Spot Assets Summary (For Master Account) |
| query-universal-transfer-history | [`from-email` `to-email` `client-tran-id` `start-time` `end-time` `page` `limit`] | Query Universal Transfer History (For Master Account) |
| sub-account-futures-asset-transfer | `from-email` `to-email` `futures-type` `asset` `amount` [] | Sub-account Futures Asset Transfer (For Master Account) |
| sub-account-transfer-history | [`asset` `type` `start-time` `end-time` `limit` `return-fail-history`] | Sub-account Transfer History (For Sub-account) |
| transfer-to-master | `asset` `amount` [] | Transfer to Master (For Sub-account) |
| transfer-to-sub-account-of-same-master | `to-email` `asset` `amount` [] | Transfer to Sub-account of Same Master (For Sub-account) |
| universal-transfer | `from-account-type` `to-account-type` `asset` `amount` [`from-email` `to-email` `client-tran-id` `symbol`] | Universal Transfer (For Master Account) |


## Managed Sub Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| deposit-assets-into-the-managed-sub-account | `to-email` `asset` `amount` [] | Deposit Assets Into The Managed Sub-account (For Investor Master Account) |
| get-managed-sub-account-deposit-address | `email` `coin` [`network` `amount`] | Get Managed Sub-account Deposit Address (For Investor Master Account) |
| query-managed-sub-account-asset-details | `email` [] | Query Managed Sub-account Asset Details (For Investor Master Account) |
| query-managed-sub-account-futures-asset-details | `email` [`account-type`] | Query Managed Sub-account Futures Asset Details (For Investor Master Account) |
| query-managed-sub-account-list | [`email` `page` `limit`] | Query Managed Sub-account List (For Investor) |
| query-managed-sub-account-margin-asset-details | `email` [`account-type`] | Query Managed Sub-account Margin Asset Details (For Investor Master Account) |
| query-managed-sub-account-snapshot | `email` `type` [`start-time` `end-time` `limit`] | Query Managed Sub-account Snapshot (For Investor Master Account) |
| query-managed-sub-account-transfer-log-master-account-investor | `email` `start-time` `end-time` `page` `limit` [`transfers` `transfer-function-account-type`] | Query Managed Sub Account Transfer Log (For Investor Master Account) |
| query-managed-sub-account-transfer-log-master-account-trading | `email` `start-time` `end-time` `page` `limit` [`transfers` `transfer-function-account-type`] | Query Managed Sub Account Transfer Log (For Trading Team Master Account) |
| query-managed-sub-account-transfer-log-sub-account-trading | `start-time` `end-time` `page` `limit` [`transfers` `transfer-function-account-type`] | Query Managed Sub Account Transfer Log (For Trading Team Sub Account) |
| withdrawl-assets-from-the-managed-sub-account | `from-email` `asset` `amount` [`transfer-date`] | Withdrawl Assets From The Managed Sub-account (For Investor Master Account) |