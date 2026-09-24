## Flexible Rate (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| check-collateral-repay-rate | `loan-coin` `collateral-coin` [] | Check Collateral Repay Rate |
| flexible-loan-adjust-ltv | `loan-coin` `collateral-coin` `adjustment-amount` `direction` [] | Flexible Loan Adjust LTV |
| flexible-loan-borrow | `loan-coin` `collateral-coin` [`loan-amount` `collateral-amount`] | Flexible Loan Borrow |
| flexible-loan-repay | `loan-coin` `collateral-coin` `repay-amount` [`collateral-return` `full-repayment` `repayment-type`] | Flexible Loan Repay |
| get-flexible-loan-assets-data | [`loan-coin`] | Get Flexible Loan Assets Data |
| get-flexible-loan-borrow-history | [`loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Flexible Loan Borrow History |
| get-flexible-loan-collateral-assets-data | [`collateral-coin`] | Get Flexible Loan Collateral Assets Data |
| get-flexible-loan-interest-rate-history | `coin`  [`start-time` `end-time` `current` `limit`] | Get Flexible Loan Interest Rate History |
| get-flexible-loan-liquidation-history | [`loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Flexible Loan Liquidation History |
| get-flexible-loan-ltv-adjustment-history | [`loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Flexible Loan LTV Adjustment History |
| get-flexible-loan-ongoing-orders | [`loan-coin` `collateral-coin` `current` `limit`] | Get Flexible Loan Ongoing Orders |
| get-flexible-loan-repayment-history | [`loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Flexible Loan Repayment History |


## Stable Rate (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| check-collateral-repay-rate-stable-rate | `loan-coin` `collateral-coin` `repay-amount` [] | Check Collateral Repay Rate |
| get-crypto-loans-income-history | [`asset` `type` `start-time` `end-time` `limit`] | Get Crypto Loans Income History |
| get-loan-borrow-history | [`order-id` `loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Loan Borrow History |
| get-loan-ltv-adjustment-history | [`order-id` `loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Loan LTV Adjustment History |
| get-loan-repayment-history | [`order-id` `loan-coin` `collateral-coin` `start-time` `end-time` `current` `limit`] | Get Loan Repayment History |