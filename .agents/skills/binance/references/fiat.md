## Fiat (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| deposit | `currency` `api-payment-method` `amount` [ `ext`] | Deposit |
| fiat-withdraw | `currency` `api-payment-method` `amount` `account-info` [ `ext`] | Fiat Withdraw |
| get-fiat-deposit-withdraw-history | `transaction-type` [`begin-time` `end-time` `page` `rows`] | Get Fiat Deposit/Withdraw History |
| get-fiat-payments-history | `transaction-type` [`begin-time` `end-time` `page` `rows`] | Get Fiat Payments History |
| get-order-detail | `order-no` [] | Get Order Detail |