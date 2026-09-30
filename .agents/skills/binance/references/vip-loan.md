## Market Data (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-borrow-interest-rate | `loan-coin` [] | Get Borrow Interest Rate |
| get-collateral-asset-data | [`collateral-coin`] | Get Collateral Asset Data |
| get-loanable-assets-data | [`loan-coin` `vip-level`] | Get Loanable Assets Data |
| get-vip-loan-interest-rate-history | `coin`  [`start-time` `end-time` `current` `limit`] | Get VIP Loan Interest Rate History |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| vip-loan-borrow | `loan-account-id` `loan-coin` `loan-amount` `collateral-account-id` `collateral-coin` `is-flexible-rate` [`loan-term`] | VIP Loan Borrow |
| vip-loan-renew | `order-id` `loan-term` [] | VIP Loan Renew |
| vip-loan-repay | `order-id` `amount` [] | VIP Loan Repay |


## User Information (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| check-vip-loan-collateral-account | [`order-id` `collateral-account-id`] | Check VIP Loan Collateral Account |
| get-vip-loan-accrued-interest | [`order-id` `loan-coin` `start-time` `end-time` `current` `limit`] | Get VIP Loan Accrued Interest |
| get-vip-loan-ongoing-orders | [`order-id` `collateral-account-id` `loan-coin` `collateral-coin` `current` `limit`] | Get VIP Loan Ongoing Orders |
| query-application-status | [`current` `limit`] | Query Application Status |