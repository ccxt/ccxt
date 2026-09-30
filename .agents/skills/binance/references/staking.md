## Eth Staking (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| eth-staking-account | [] | ETH Staking account |
| get-current-eth-staking-quota | [] | Get current ETH staking quota |
| get-eth-redemption-history | [`redeem-id` `start-time` `end-time` `current` `size`] | Get ETH redemption history |
| get-eth-staking-history | [`purchase-id` `start-time` `end-time` `current` `size`] | Get ETH staking history |
| get-wbeth-rate-history | [`start-time` `end-time` `current` `size`] | Get WBETH Rate History |
| get-wbeth-rewards-history | [`start-time` `end-time` `current` `size`] | Get WBETH rewards history |
| get-wbeth-unwrap-history | [`start-time` `end-time` `current` `size`] | Get WBETH unwrap history |
| get-wbeth-wrap-history | [`start-time` `end-time` `current` `size`] | Get WBETH wrap history |
| redeem-eth | `amount` [`asset`] | Redeem ETH |
| subscribe-eth-staking | `amount` [] | Subscribe ETH Staking |
| wrap-beth | `amount` [] | Wrap BETH |


## On Chain Yields (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-on-chain-yields-locked-personal-left-quota | `project-id` [] | Get On-chain Yields Locked Personal Left Quota |
| get-on-chain-yields-locked-product-list | [`asset` `current` `size`] | Get On-chain Yields Locked Product List |
| get-on-chain-yields-locked-product-position | [`asset` `position-id` `project-id` `current` `size`] | Get On-chain Yields Locked Product Position |
| get-on-chain-yields-locked-redemption-record | [`position-id` `redeem-id` `asset` `start-time` `end-time` `current` `size`] | Get On-chain Yields Locked Redemption Record |
| get-on-chain-yields-locked-rewards-history | [`position-id` `asset` `start-time` `end-time` `current` `size`] | Get On-chain Yields Locked Rewards History |
| get-on-chain-yields-locked-subscription-preview | `project-id` `amount` [`auto-subscribe`] | Get On-chain Yields Locked Subscription Preview |
| get-on-chain-yields-locked-subscription-record | [`purchase-id` `client-id` `asset` `start-time` `end-time` `current` `size`] | Get On-chain Yields Locked Subscription Record |
| on-chain-yields-account | [] | On-chain Yields Account |
| redeem-on-chain-yields-locked-product | `position-id` [`channel-id`] | Redeem On-chain Yields Locked Product |
| set-on-chain-yields-locked-auto-subscribe | `position-id` `auto-subscribe` [] | Set On-chain Yields Locked Auto Subscribe |
| set-on-chain-yields-locked-product-redeem-option | `position-id` `redeem-to` [] | Set On-chain Yields Locked Product Redeem Option |
| subscribe-on-chain-yields-locked-product | `project-id` `amount` [`auto-subscribe` `source-account` `redeem-to` `channel-id` `client-id`] | Subscribe On-chain Yields Locked Product |


## Soft Staking (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-soft-staking-product-list | [`asset` `current` `size`] | Get Soft Staking Product List |
| get-soft-staking-rewards-history | [`asset` `start-time` `end-time` `current` `size`] | Get Soft Staking Rewards History |
| set-soft-staking | `soft-staking` [] | Set Soft Staking |


## Sol Staking (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| claim-boost-rewards | [] | Claim Boost Rewards |
| get-bnsol-rate-history | [`start-time` `end-time` `current` `size`] | Get BNSOL Rate History |
| get-bnsol-rewards-history | [`start-time` `end-time` `current` `size`] | Get BNSOL rewards history |
| get-boost-rewards-history | `type` [`start-time` `end-time` `current` `size`] | Get Boost Rewards History |
| get-sol-redemption-history | [`redeem-id` `start-time` `end-time` `current` `size`] | Get SOL redemption history |
| get-sol-staking-history | [`purchase-id` `start-time` `end-time` `current` `size`] | Get SOL staking history |
| get-sol-staking-quota-details | [] | Get SOL staking quota details |
| get-unclaimed-rewards | [] | Get Unclaimed Rewards |
| redeem-sol | `amount` [] | Redeem SOL |
| sol-staking-account | [] | SOL Staking account |
| subscribe-sol-staking | `amount` [] | Subscribe SOL Staking |