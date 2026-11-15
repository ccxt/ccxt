## Future Algo (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| cancel-algo-order-future-algo | `algo-id` [] | Cancel Algo Order |
| query-current-algo-open-orders-future-algo | [] | Query Current Algo Open Orders |
| query-historical-algo-orders-future-algo | [`symbol` `side` `start-time` `end-time` `page` `page-size`] | Query Historical Algo Orders |
| query-sub-orders-future-algo | `algo-id` [`page` `page-size`] | Query Sub Orders |
| time-weighted-average-price-future-algo | `symbol` `side` `quantity` `duration` [`position-side` `client-algo-id` `reduce-only` `limit-price`] | Time-Weighted Average Price(Twap) New Order |
| volume-participation-future-algo | `symbol` `side` `quantity` `urgency` [`position-side` `client-algo-id` `reduce-only` `limit-price`] | Volume Participation New Order |


## Spot Algo (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| cancel-algo-order-spot-algo | `algo-id` [] | Cancel Algo Order |
| query-current-algo-open-orders-spot-algo | [] | Query Current Algo Open Orders |
| query-historical-algo-orders-spot-algo | [`symbol` `side` `start-time` `end-time` `page` `page-size`] | Query Historical Algo Orders |
| query-sub-orders-spot-algo | `algo-id` [`page` `page-size`] | Query Sub Orders |
| time-weighted-average-price-spot-algo | `symbol` `side` `quantity` `duration` [`client-algo-id` `limit-price`] | Time-Weighted Average Price(Twap) New Order |