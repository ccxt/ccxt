## Mining (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| account-list | `algo` `user-name` [] | Account List |
| acquiring-algorithm | [] | Acquiring Algorithm |
| acquiring-coinname | [] | Acquiring CoinName |
| cancel-hashrate-resale-configuration | `config-id` `user-name` [] | Cancel hashrate resale configuration |
| earnings-list | `algo` `user-name` [`coin` `start-date` `end-date` `page-index` `page-size`] | Earnings List |
| extra-bonus-list | `algo` `user-name` [`coin` `start-date` `end-date` `page-index` `page-size`] | Extra Bonus List |
| hashrate-resale-detail | `config-id` [`page-index` `page-size`] | Hashrate Resale Detail |
| hashrate-resale-list | [`page-index` `page-size`] | Hashrate Resale List |
| hashrate-resale-request | `user-name` `algo` `end-date` `start-date` `to-pool-user` `hash-rate` [] | Hashrate Resale Request |
| mining-account-earning | `algo` [`start-date` `end-date` `page-index` `page-size`] | Mining Account Earning |
| request-for-detail-miner-list | `algo` `user-name` `worker-name` [] | Request for Detail Miner List |
| request-for-miner-list | `algo` `user-name` [`page-index` `sort` `sort-column` `worker-status`] | Request for Miner List |
| statistic-list | `algo` `user-name` [] | Statistic List |