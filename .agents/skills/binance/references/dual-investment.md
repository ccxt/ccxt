## Market Data (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-dual-investment-product-list | `option-type` `exercised-coin` `invest-coin` [`page-size` `page-index`] | Get Dual Investment product list |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| change-auto-compound-status | `position-id` [`auto-compound-plan`] | Change Auto-Compound status |
| check-dual-investment-accounts | [] | Check Dual Investment accounts |
| get-dual-investment-positions | [`status` `page-size` `page-index`] | Get Dual Investment positions |
| subscribe-dual-investment-products | `id` `order-id` `deposit-amount` `auto-compound-plan` [] | Subscribe Dual Investment products |