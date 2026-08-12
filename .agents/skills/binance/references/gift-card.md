## Market Data (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| create-a-dual-token-gift-card | `base-token` `face-token` `base-token-amount` [] | Create a dual-token gift card(fixed value, discount feature) |
| create-a-single-token-gift-card | `token` `amount` [] | Create a single-token gift card |
| fetch-rsa-public-key | [] | Fetch RSA Public Key |
| fetch-token-limit | `base-token` [] | Fetch Token Limit |
| redeem-a-binance-gift-card | `code` [`external-uid`] | Redeem a Binance Gift Card |
| verify-binance-gift-card-by-gift-card-number | `reference-no` [] | Verify Binance Gift Card by Gift Card Number |