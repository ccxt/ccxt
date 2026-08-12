## Bfusd (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-bfusd-account | [] | Get BFUSD Account |
| get-bfusd-quota-details | [] | Get BFUSD Quota Details |
| get-bfusd-rate-history | [`start-time` `end-time` `current` `size`] | Get BFUSD Rate History |
| get-bfusd-redemption-history | [`start-time` `end-time` `current` `size`] | Get BFUSD Redemption History |
| get-bfusd-rewards-history | [`start-time` `end-time` `current` `size`] | Get BFUSD Rewards History |
| get-bfusd-subscription-history | [`asset` `start-time` `end-time` `current` `size`] | Get BFUSD subscription history |
| redeem-bfusd | `amount` `type` [] | Redeem BFUSD |
| subscribe-bfusd | `asset` `amount` [] | Subscribe BFUSD |


## Flexible Locked (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-collateral-record | [`product-id` `start-time` `end-time` `current` `size`] | Get Collateral Record |
| get-flexible-personal-left-quota | `product-id` [] | Get Flexible Personal Left Quota |
| get-flexible-product-position | [`asset` `product-id` `current` `size`] | Get Flexible Product Position |
| get-flexible-redemption-record | [`product-id` `redeem-id` `asset` `start-time` `end-time` `current` `size`] | Get Flexible Redemption Record |
| get-flexible-rewards-history | `type` [`product-id` `asset` `start-time` `end-time` `current` `size`] | Get Flexible Rewards History |
| get-flexible-subscription-preview | `product-id` `amount` [] | Get Flexible Subscription Preview |
| get-flexible-subscription-record | [`product-id` `purchase-id` `asset` `start-time` `end-time` `current` `size`] | Get Flexible Subscription Record |
| get-locked-personal-left-quota | `project-id` [] | Get Locked Personal Left Quota |
| get-locked-product-position | [`asset` `position-id` `project-id` `current` `size`] | Get Locked Product Position |
| get-locked-redemption-record | [`position-id` `redeem-id` `asset` `start-time` `end-time` `current` `size`] | Get Locked Redemption Record |
| get-locked-rewards-history | [`position-id` `asset` `start-time` `end-time` `current` `size`] | Get Locked Rewards History |
| get-locked-subscription-preview | `project-id` `amount` [`auto-subscribe`] | Get Locked Subscription Preview |
| get-locked-subscription-record | [`purchase-id` `asset` `start-time` `end-time` `current` `size`] | Get Locked Subscription Record |
| get-rate-history | `product-id` [`apr-period` `start-time` `end-time` `current` `size`] | Get Rate History |
| get-simple-earn-flexible-product-list | [`asset` `current` `size`] | Get Simple Earn Flexible Product List |
| get-simple-earn-locked-product-list | [`asset` `current` `size`] | Get Simple Earn Locked Product List |
| redeem-flexible-product | `product-id` [`redeem-all` `amount` `dest-account`] | Redeem Flexible Product |
| redeem-locked-product | `position-id` [] | Redeem Locked Product |
| set-flexible-auto-subscribe | `product-id` `auto-subscribe` [] | Set Flexible Auto Subscribe |
| set-locked-auto-subscribe | `position-id` `auto-subscribe` [] | Set Locked Auto Subscribe |
| set-locked-product-redeem-option | `position-id` `redeem-to` [] | Set Locked Product Redeem Option |
| simple-account | [] | Simple Account |
| subscribe-flexible-product | `product-id` `amount` [`auto-subscribe` `source-account`] | Subscribe Flexible Product |
| subscribe-locked-product | `project-id` `amount` [`auto-subscribe` `source-account` `redeem-to`] | Subscribe Locked Product |


## Rwusd (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-rwusd-account | [] | Get RWUSD Account |
| get-rwusd-quota-details | [] | Get RWUSD Quota Details |
| get-rwusd-rate-history | [`start-time` `end-time` `current` `size`] | Get RWUSD Rate History |
| get-rwusd-redemption-history | [`start-time` `end-time` `current` `size`] | Get RWUSD Redemption History |
| get-rwusd-rewards-history | [`start-time` `end-time` `current` `size`] | Get RWUSD Rewards History |
| get-rwusd-subscription-history | [`asset` `start-time` `end-time` `current` `size`] | Get RWUSD subscription history |
| redeem-rwusd | `amount` `type` [] | Redeem RWUSD |
| subscribe-rwusd | `asset` `amount` [] | Subscribe RWUSD |