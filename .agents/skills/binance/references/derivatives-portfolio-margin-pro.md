## Account (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| bnb-transfer | `amount` `transfer-side` [] | BNB transfer |
| change-auto-repay-futures-status | `auto-repay` [] | Change Auto-repay-futures Status |
| delete-margin-call-level | [] | Delete Margin Call Level |
| fund-auto-collection | [] | Fund Auto-collection |
| fund-collection-by-asset | `asset` [] | Fund Collection by Asset |
| get-auto-repay-futures-status | [] | Get Auto-repay-futures Status |
| get-delta-mode-status | [] | Get Delta Mode Status |
| get-margin-call-level | [] | Get Margin Call Level |
| get-portfolio-margin-pro-account-balance | [`asset`] | Get Portfolio Margin Pro Account Balance |
| get-portfolio-margin-pro-account-info | [] | Get Portfolio Margin Pro Account Info |
| get-portfolio-margin-pro-span-account-info | [] | Get Portfolio Margin Pro SPAN Account Info |
| get-transferable-earn-asset-balance-for-portfolio-margin | `asset` `transfer-type` [] | Get Transferable Earn Asset Balance for Portfolio Margin |
| portfolio-margin-pro-bankruptcy-loan-repay | [`from`] | Portfolio Margin Pro Bankruptcy Loan Repay |
| query-portfolio-margin-pro-bankruptcy-loan-amount | [] | Query Portfolio Margin Pro Bankruptcy Loan Amount |
| query-portfolio-margin-pro-bankruptcy-loan-repay-history | [`start-time` `end-time` `current` `size`] | Query Portfolio Margin Pro Bankruptcy Loan Repay History |
| query-portfolio-margin-pro-negative-balance-interest-history | [`asset` `start-time` `end-time` `size`] | Query Portfolio Margin Pro Negative Balance Interest History |
| repay-futures-negative-balance | [`from`] | Repay futures Negative Balance |
| set-margin-call-level | `margin-call-level` [] | Set Margin Call Level |
| switch-delta-mode | `delta-enabled` [] | Switch Delta Mode |
| transfer-ldusdt-rwusd-for-portfolio-margin | `asset` `transfer-type` `amount` [] | Transfer LDUSDT/RWUSD for Portfolio Margin |


## Market Data (auth required)

| Endpoint | Key params | Description |
|---|---|---|
| get-portfolio-margin-asset-leverage | [] | Get Portfolio Margin Asset Leverage |
| portfolio-margin-collateral-rate | [] | Portfolio Margin Collateral Rate |
| portfolio-margin-pro-tiered-collateral-rate | [] | Portfolio Margin Pro Tiered Collateral Rate |
| query-portfolio-margin-asset-index-price | [`asset`] | Query Portfolio Margin Asset Index Price |