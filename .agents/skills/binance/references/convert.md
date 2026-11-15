## Market Data

| Endpoint | Key params | Description |
|---|---|---|
| list-all-convert-pairs | [`from-asset` `to-asset`] | List All Convert Pairs |
| query-order-quantity-precision-per-asset | [] | Query order quantity precision per asset |


## Trade (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| accept-quote | `quote-id` [] | Accept Quote |
| cancel-limit-order | `order-id` [] | Cancel limit order |
| get-convert-trade-history | `start-time` `end-time` [`limit`] | Get Convert Trade History |
| order-status | [`order-id` `quote-id`] | Order status |
| place-limit-order | `base-asset` `quote-asset` `limit-price` `side` `expired-type` [`base-amount` `quote-amount` `wallet-type`] | Place limit order |
| query-limit-open-orders | [] | Query limit open orders |
| send-quote-request | `from-asset` `to-asset` [`from-amount` `to-amount` `wallet-type` `valid-time`] | Send Quote Request |