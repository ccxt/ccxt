Every endpoint in `bitstamp`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/bitstamp) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicGetOhlcPair`); the snake_case alias (`public_get_ohlc_pair`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetOhlcPair`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const bitstamp = new ccxt.bitstamp ();
const response = await bitstamp.publicGetOhlcPair (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const bitstamp = new ccxt.bitstamp ();
const response = await bitstamp.publicGetOhlcPair (params);
```

#### **Python**

```python
import ccxt
bitstamp = ccxt.bitstamp()
response = bitstamp.public_get_ohlc_pair(params)
```

#### **PHP**

```php
$bitstamp = new \ccxt\bitstamp();
$response = $bitstamp->public_get_ohlc_pair($params);
```

#### **C#**

```csharp
using ccxt;
var bitstamp = new Bitstamp();
var response = await bitstamp.publicGetOhlcPair(parameters);
```

#### **Go**

```go
bitstamp := ccxt.NewBitstamp(nil)
response := <-bitstamp.PublicGetOhlcPair(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official bitstamp API documentation:** [bitstamp.net](https://www.bitstamp.net/api)

> 263 implicit endpoints across 2 access groups.

## public

**Base URL**: `https://www.bitstamp.net/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetOhlcPair` | GET | `ohlc/{pair}/` | 1 |
| `publicGetOrderBookPair` | GET | `order_book/{pair}/` | 1 |
| `publicGetTicker` | GET | `ticker/` | 1 |
| `publicGetTickerHourPair` | GET | `ticker_hour/{pair}/` | 1 |
| `publicGetTickerPair` | GET | `ticker/{pair}/` | 1 |
| `publicGetTransactionsPair` | GET | `transactions/{pair}/` | 1 |
| `publicGetTradingPairsInfo` | GET | `trading-pairs-info/` | 1 |
| `publicGetMarkets` | GET | `markets/` | 1 |
| `publicGetCurrencies` | GET | `currencies/` | 1 |
| `publicGetEurUsd` | GET | `eur_usd/` | 1 |
| `publicGetTravelRuleVasps` | GET | `travel_rule/vasps/` | 1 |
| `publicGetFundingRateMarketSymbol` | GET | `funding_rate/{market_symbol}/` | 1 |
| `publicGetFundingRateHistoryPair` | GET | `funding_rate_history/{pair}/` | 1 |

## private

**Base URL**: `https://www.bitstamp.net/api`

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetTravelRuleContacts` | GET | `travel_rule/contacts/` | 1 |
| `privateGetContactsContactUuid` | GET | `contacts/{contact_uuid}/` | 1 |
| `privateGetEarnSubscriptions` | GET | `earn/subscriptions/` | 1 |
| `privateGetEarnTransactions` | GET | `earn/transactions/` | 1 |
| `privateGetTradeHistory` | GET | `trade_history/` | 1 |
| `privateGetTradeHistoryPair` | GET | `trade_history/{pair}` | 1 |
| `privatePostAccountBalances` | POST | `account_balances/` | 1 |
| `privatePostAccountBalancesCurrency` | POST | `account_balances/{currency}/` | 1 |
| `privatePostBalance` | POST | `balance/` | 1 |
| `privatePostBalancePair` | POST | `balance/{pair}/` | 1 |
| `privatePostBchWithdrawal` | POST | `bch_withdrawal/` | 1 |
| `privatePostBchAddress` | POST | `bch_address/` | 1 |
| `privatePostUserTransactions` | POST | `user_transactions/` | 1 |
| `privatePostUserTransactionsPair` | POST | `user_transactions/{pair}/` | 1 |
| `privatePostCryptoTransactions` | POST | `crypto-transactions/` | 1 |
| `privatePostOpenOrder` | POST | `open_order` | 1 |
| `privatePostOpenOrdersAll` | POST | `open_orders/all/` | 1 |
| `privatePostOpenOrdersPair` | POST | `open_orders/{pair}/` | 1 |
| `privatePostReplaceOrder` | POST | `replace_order/` | 1 |
| `privatePostOrderStatus` | POST | `order_status/` | 1 |
| `privatePostCancelOrder` | POST | `cancel_order/` | 1 |
| `privatePostCancelAllOrders` | POST | `cancel_all_orders/` | 1 |
| `privatePostCancelAllOrdersPair` | POST | `cancel_all_orders/{pair}/` | 1 |
| `privatePostBuyPair` | POST | `buy/{pair}/` | 1 |
| `privatePostBuyMarketPair` | POST | `buy/market/{pair}/` | 1 |
| `privatePostBuyInstantPair` | POST | `buy/instant/{pair}/` | 1 |
| `privatePostSellPair` | POST | `sell/{pair}/` | 1 |
| `privatePostSellMarketPair` | POST | `sell/market/{pair}/` | 1 |
| `privatePostSellInstantPair` | POST | `sell/instant/{pair}/` | 1 |
| `privatePostTransferToMain` | POST | `transfer-to-main/` | 1 |
| `privatePostTransferFromMain` | POST | `transfer-from-main/` | 1 |
| `privatePostMyTradingPairs` | POST | `my_trading_pairs/` | 1 |
| `privatePostFeesTrading` | POST | `fees/trading/` | 1 |
| `privatePostFeesTradingMarketSymbol` | POST | `fees/trading/{market_symbol}` | 1 |
| `privatePostFeesWithdrawal` | POST | `fees/withdrawal/` | 1 |
| `privatePostFeesWithdrawalCurrency` | POST | `fees/withdrawal/{currency}/` | 1 |
| `privatePostWithdrawalRequests` | POST | `withdrawal-requests/` | 1 |
| `privatePostWithdrawalOpen` | POST | `withdrawal/open/` | 1 |
| `privatePostWithdrawalStatus` | POST | `withdrawal/status/` | 1 |
| `privatePostWithdrawalCancel` | POST | `withdrawal/cancel/` | 1 |
| `privatePostLiquidationAddressNew` | POST | `liquidation_address/new/` | 1 |
| `privatePostLiquidationAddressInfo` | POST | `liquidation_address/info/` | 1 |
| `privatePostBtcUnconfirmed` | POST | `btc_unconfirmed/` | 1 |
| `privatePostWebsocketsToken` | POST | `websockets_token/` | 1 |
| `privatePostRevokeAllApiKeys` | POST | `revoke_all_api_keys/` | 1 |
| `privatePostGetMaxOrderAmount` | POST | `get_max_order_amount/` | 1 |
| `privatePostBtcWithdrawal` | POST | `btc_withdrawal/` | 1 |
| `privatePostBtcAddress` | POST | `btc_address/` | 1 |
| `privatePostRippleWithdrawal` | POST | `ripple_withdrawal/` | 1 |
| `privatePostRippleAddress` | POST | `ripple_address/` | 1 |
| `privatePostLtcWithdrawal` | POST | `ltc_withdrawal/` | 1 |
| `privatePostLtcAddress` | POST | `ltc_address/` | 1 |
| `privatePostEthWithdrawal` | POST | `eth_withdrawal/` | 1 |
| `privatePostEthAddress` | POST | `eth_address/` | 1 |
| `privatePostXrpWithdrawal` | POST | `xrp_withdrawal/` | 1 |
| `privatePostXrpAddress` | POST | `xrp_address/` | 1 |
| `privatePostXlmWithdrawal` | POST | `xlm_withdrawal/` | 1 |
| `privatePostXlmAddress` | POST | `xlm_address/` | 1 |
| `privatePostPaxWithdrawal` | POST | `pax_withdrawal/` | 1 |
| `privatePostPaxAddress` | POST | `pax_address/` | 1 |
| `privatePostLinkWithdrawal` | POST | `link_withdrawal/` | 1 |
| `privatePostLinkAddress` | POST | `link_address/` | 1 |
| `privatePostUsdcWithdrawal` | POST | `usdc_withdrawal/` | 1 |
| `privatePostUsdcAddress` | POST | `usdc_address/` | 1 |
| `privatePostOmgWithdrawal` | POST | `omg_withdrawal/` | 1 |
| `privatePostOmgAddress` | POST | `omg_address/` | 1 |
| `privatePostDaiWithdrawal` | POST | `dai_withdrawal/` | 1 |
| `privatePostDaiAddress` | POST | `dai_address/` | 1 |
| `privatePostKncWithdrawal` | POST | `knc_withdrawal/` | 1 |
| `privatePostKncAddress` | POST | `knc_address/` | 1 |
| `privatePostMkrWithdrawal` | POST | `mkr_withdrawal/` | 1 |
| `privatePostMkrAddress` | POST | `mkr_address/` | 1 |
| `privatePostZrxWithdrawal` | POST | `zrx_withdrawal/` | 1 |
| `privatePostZrxAddress` | POST | `zrx_address/` | 1 |
| `privatePostGusdWithdrawal` | POST | `gusd_withdrawal/` | 1 |
| `privatePostGusdAddress` | POST | `gusd_address/` | 1 |
| `privatePostAaveWithdrawal` | POST | `aave_withdrawal/` | 1 |
| `privatePostAaveAddress` | POST | `aave_address/` | 1 |
| `privatePostBatWithdrawal` | POST | `bat_withdrawal/` | 1 |
| `privatePostBatAddress` | POST | `bat_address/` | 1 |
| `privatePostUmaWithdrawal` | POST | `uma_withdrawal/` | 1 |
| `privatePostUmaAddress` | POST | `uma_address/` | 1 |
| `privatePostSnxWithdrawal` | POST | `snx_withdrawal/` | 1 |
| `privatePostSnxAddress` | POST | `snx_address/` | 1 |
| `privatePostUniWithdrawal` | POST | `uni_withdrawal/` | 1 |
| `privatePostUniAddress` | POST | `uni_address/` | 1 |
| `privatePostYfiWithdrawal` | POST | `yfi_withdrawal/` | 1 |
| `privatePostYfiAddress` | POST | `yfi_address/` | 1 |
| `privatePostAudioWithdrawal` | POST | `audio_withdrawal/` | 1 |
| `privatePostAudioAddress` | POST | `audio_address/` | 1 |
| `privatePostCrvWithdrawal` | POST | `crv_withdrawal/` | 1 |
| `privatePostCrvAddress` | POST | `crv_address/` | 1 |
| `privatePostAlgoWithdrawal` | POST | `algo_withdrawal/` | 1 |
| `privatePostAlgoAddress` | POST | `algo_address/` | 1 |
| `privatePostCompWithdrawal` | POST | `comp_withdrawal/` | 1 |
| `privatePostCompAddress` | POST | `comp_address/` | 1 |
| `privatePostGrtWithdrawal` | POST | `grt_withdrawal/` | 1 |
| `privatePostGrtAddress` | POST | `grt_address/` | 1 |
| `privatePostUsdtWithdrawal` | POST | `usdt_withdrawal/` | 1 |
| `privatePostUsdtAddress` | POST | `usdt_address/` | 1 |
| `privatePostEurtWithdrawal` | POST | `eurt_withdrawal/` | 1 |
| `privatePostEurtAddress` | POST | `eurt_address/` | 1 |
| `privatePostMaticWithdrawal` | POST | `matic_withdrawal/` | 1 |
| `privatePostMaticAddress` | POST | `matic_address/` | 1 |
| `privatePostSushiWithdrawal` | POST | `sushi_withdrawal/` | 1 |
| `privatePostSushiAddress` | POST | `sushi_address/` | 1 |
| `privatePostChzWithdrawal` | POST | `chz_withdrawal/` | 1 |
| `privatePostChzAddress` | POST | `chz_address/` | 1 |
| `privatePostEnjWithdrawal` | POST | `enj_withdrawal/` | 1 |
| `privatePostEnjAddress` | POST | `enj_address/` | 1 |
| `privatePostAlphaWithdrawal` | POST | `alpha_withdrawal/` | 1 |
| `privatePostAlphaAddress` | POST | `alpha_address/` | 1 |
| `privatePostFttWithdrawal` | POST | `ftt_withdrawal/` | 1 |
| `privatePostFttAddress` | POST | `ftt_address/` | 1 |
| `privatePostStorjWithdrawal` | POST | `storj_withdrawal/` | 1 |
| `privatePostStorjAddress` | POST | `storj_address/` | 1 |
| `privatePostAxsWithdrawal` | POST | `axs_withdrawal/` | 1 |
| `privatePostAxsAddress` | POST | `axs_address/` | 1 |
| `privatePostSandWithdrawal` | POST | `sand_withdrawal/` | 1 |
| `privatePostSandAddress` | POST | `sand_address/` | 1 |
| `privatePostHbarWithdrawal` | POST | `hbar_withdrawal/` | 1 |
| `privatePostHbarAddress` | POST | `hbar_address/` | 1 |
| `privatePostRgtWithdrawal` | POST | `rgt_withdrawal/` | 1 |
| `privatePostRgtAddress` | POST | `rgt_address/` | 1 |
| `privatePostFetWithdrawal` | POST | `fet_withdrawal/` | 1 |
| `privatePostFetAddress` | POST | `fet_address/` | 1 |
| `privatePostSklWithdrawal` | POST | `skl_withdrawal/` | 1 |
| `privatePostSklAddress` | POST | `skl_address/` | 1 |
| `privatePostCelWithdrawal` | POST | `cel_withdrawal/` | 1 |
| `privatePostCelAddress` | POST | `cel_address/` | 1 |
| `privatePostSxpWithdrawal` | POST | `sxp_withdrawal/` | 1 |
| `privatePostSxpAddress` | POST | `sxp_address/` | 1 |
| `privatePostAdaWithdrawal` | POST | `ada_withdrawal/` | 1 |
| `privatePostAdaAddress` | POST | `ada_address/` | 1 |
| `privatePostSlpWithdrawal` | POST | `slp_withdrawal/` | 1 |
| `privatePostSlpAddress` | POST | `slp_address/` | 1 |
| `privatePostFtmWithdrawal` | POST | `ftm_withdrawal/` | 1 |
| `privatePostFtmAddress` | POST | `ftm_address/` | 1 |
| `privatePostPerpWithdrawal` | POST | `perp_withdrawal/` | 1 |
| `privatePostPerpAddress` | POST | `perp_address/` | 1 |
| `privatePostDydxWithdrawal` | POST | `dydx_withdrawal/` | 1 |
| `privatePostDydxAddress` | POST | `dydx_address/` | 1 |
| `privatePostGalaWithdrawal` | POST | `gala_withdrawal/` | 1 |
| `privatePostGalaAddress` | POST | `gala_address/` | 1 |
| `privatePostShibWithdrawal` | POST | `shib_withdrawal/` | 1 |
| `privatePostShibAddress` | POST | `shib_address/` | 1 |
| `privatePostAmpWithdrawal` | POST | `amp_withdrawal/` | 1 |
| `privatePostAmpAddress` | POST | `amp_address/` | 1 |
| `privatePostSgbWithdrawal` | POST | `sgb_withdrawal/` | 1 |
| `privatePostSgbAddress` | POST | `sgb_address/` | 1 |
| `privatePostAvaxWithdrawal` | POST | `avax_withdrawal/` | 1 |
| `privatePostAvaxAddress` | POST | `avax_address/` | 1 |
| `privatePostWbtcWithdrawal` | POST | `wbtc_withdrawal/` | 1 |
| `privatePostWbtcAddress` | POST | `wbtc_address/` | 1 |
| `privatePostCtsiWithdrawal` | POST | `ctsi_withdrawal/` | 1 |
| `privatePostCtsiAddress` | POST | `ctsi_address/` | 1 |
| `privatePostCvxWithdrawal` | POST | `cvx_withdrawal/` | 1 |
| `privatePostCvxAddress` | POST | `cvx_address/` | 1 |
| `privatePostImxWithdrawal` | POST | `imx_withdrawal/` | 1 |
| `privatePostImxAddress` | POST | `imx_address/` | 1 |
| `privatePostNexoWithdrawal` | POST | `nexo_withdrawal/` | 1 |
| `privatePostNexoAddress` | POST | `nexo_address/` | 1 |
| `privatePostUstWithdrawal` | POST | `ust_withdrawal/` | 1 |
| `privatePostUstAddress` | POST | `ust_address/` | 1 |
| `privatePostAntWithdrawal` | POST | `ant_withdrawal/` | 1 |
| `privatePostAntAddress` | POST | `ant_address/` | 1 |
| `privatePostGodsWithdrawal` | POST | `gods_withdrawal/` | 1 |
| `privatePostGodsAddress` | POST | `gods_address/` | 1 |
| `privatePostRadWithdrawal` | POST | `rad_withdrawal/` | 1 |
| `privatePostRadAddress` | POST | `rad_address/` | 1 |
| `privatePostBandWithdrawal` | POST | `band_withdrawal/` | 1 |
| `privatePostBandAddress` | POST | `band_address/` | 1 |
| `privatePostInjWithdrawal` | POST | `inj_withdrawal/` | 1 |
| `privatePostInjAddress` | POST | `inj_address/` | 1 |
| `privatePostRlyWithdrawal` | POST | `rly_withdrawal/` | 1 |
| `privatePostRlyAddress` | POST | `rly_address/` | 1 |
| `privatePostRndrWithdrawal` | POST | `rndr_withdrawal/` | 1 |
| `privatePostRndrAddress` | POST | `rndr_address/` | 1 |
| `privatePostVegaWithdrawal` | POST | `vega_withdrawal/` | 1 |
| `privatePostVegaAddress` | POST | `vega_address/` | 1 |
| `privatePost1inchWithdrawal` | POST | `1inch_withdrawal/` | 1 |
| `privatePost1inchAddress` | POST | `1inch_address/` | 1 |
| `privatePostEnsWithdrawal` | POST | `ens_withdrawal/` | 1 |
| `privatePostEnsAddress` | POST | `ens_address/` | 1 |
| `privatePostManaWithdrawal` | POST | `mana_withdrawal/` | 1 |
| `privatePostManaAddress` | POST | `mana_address/` | 1 |
| `privatePostLrcWithdrawal` | POST | `lrc_withdrawal/` | 1 |
| `privatePostLrcAddress` | POST | `lrc_address/` | 1 |
| `privatePostApeWithdrawal` | POST | `ape_withdrawal/` | 1 |
| `privatePostApeAddress` | POST | `ape_address/` | 1 |
| `privatePostMplWithdrawal` | POST | `mpl_withdrawal/` | 1 |
| `privatePostMplAddress` | POST | `mpl_address/` | 1 |
| `privatePostEurocWithdrawal` | POST | `euroc_withdrawal/` | 1 |
| `privatePostEurocAddress` | POST | `euroc_address/` | 1 |
| `privatePostSolWithdrawal` | POST | `sol_withdrawal/` | 1 |
| `privatePostSolAddress` | POST | `sol_address/` | 1 |
| `privatePostDotWithdrawal` | POST | `dot_withdrawal/` | 1 |
| `privatePostDotAddress` | POST | `dot_address/` | 1 |
| `privatePostNearWithdrawal` | POST | `near_withdrawal/` | 1 |
| `privatePostNearAddress` | POST | `near_address/` | 1 |
| `privatePostDogeWithdrawal` | POST | `doge_withdrawal/` | 1 |
| `privatePostDogeAddress` | POST | `doge_address/` | 1 |
| `privatePostFlrWithdrawal` | POST | `flr_withdrawal/` | 1 |
| `privatePostFlrAddress` | POST | `flr_address/` | 1 |
| `privatePostDgldWithdrawal` | POST | `dgld_withdrawal/` | 1 |
| `privatePostDgldAddress` | POST | `dgld_address/` | 1 |
| `privatePostLdoWithdrawal` | POST | `ldo_withdrawal/` | 1 |
| `privatePostLdoAddress` | POST | `ldo_address/` | 1 |
| `privatePostTravelRuleContacts` | POST | `travel_rule/contacts/` | 1 |
| `privatePostEarnSubscribe` | POST | `earn/subscribe/` | 1 |
| `privatePostEarnSubscriptionsSetting` | POST | `earn/subscriptions/setting/` | 1 |
| `privatePostEarnUnsubscribe` | POST | `earn/unsubscribe` | 1 |
| `privatePostWecanWithdrawal` | POST | `wecan_withdrawal/` | 1 |
| `privatePostWecanAddress` | POST | `wecan_address/` | 1 |
| `privatePostTracWithdrawal` | POST | `trac_withdrawal/` | 1 |
| `privatePostTracAddress` | POST | `trac_address/` | 1 |
| `privatePostEurcvWithdrawal` | POST | `eurcv_withdrawal/` | 1 |
| `privatePostEurcvAddress` | POST | `eurcv_address/` | 1 |
| `privatePostPyusdWithdrawal` | POST | `pyusd_withdrawal/` | 1 |
| `privatePostPyusdAddress` | POST | `pyusd_address/` | 1 |
| `privatePostLmwrWithdrawal` | POST | `lmwr_withdrawal/` | 1 |
| `privatePostLmwrAddress` | POST | `lmwr_address/` | 1 |
| `privatePostPepeWithdrawal` | POST | `pepe_withdrawal/` | 1 |
| `privatePostPepeAddress` | POST | `pepe_address/` | 1 |
| `privatePostBlurWithdrawal` | POST | `blur_withdrawal/` | 1 |
| `privatePostBlurAddress` | POST | `blur_address/` | 1 |
| `privatePostVextWithdrawal` | POST | `vext_withdrawal/` | 1 |
| `privatePostVextAddress` | POST | `vext_address/` | 1 |
| `privatePostCsprWithdrawal` | POST | `cspr_withdrawal/` | 1 |
| `privatePostCsprAddress` | POST | `cspr_address/` | 1 |
| `privatePostVchfWithdrawal` | POST | `vchf_withdrawal/` | 1 |
| `privatePostVchfAddress` | POST | `vchf_address/` | 1 |
| `privatePostVeurWithdrawal` | POST | `veur_withdrawal/` | 1 |
| `privatePostVeurAddress` | POST | `veur_address/` | 1 |
| `privatePostTrufWithdrawal` | POST | `truf_withdrawal/` | 1 |
| `privatePostTrufAddress` | POST | `truf_address/` | 1 |
| `privatePostWifWithdrawal` | POST | `wif_withdrawal/` | 1 |
| `privatePostWifAddress` | POST | `wif_address/` | 1 |
| `privatePostSmtWithdrawal` | POST | `smt_withdrawal/` | 1 |
| `privatePostSmtAddress` | POST | `smt_address/` | 1 |
| `privatePostSuiWithdrawal` | POST | `sui_withdrawal/` | 1 |
| `privatePostSuiAddress` | POST | `sui_address/` | 1 |
| `privatePostJupWithdrawal` | POST | `jup_withdrawal/` | 1 |
| `privatePostJupAddress` | POST | `jup_address/` | 1 |
| `privatePostOndoWithdrawal` | POST | `ondo_withdrawal/` | 1 |
| `privatePostOndoAddress` | POST | `ondo_address/` | 1 |
| `privatePostBobaWithdrawal` | POST | `boba_withdrawal/` | 1 |
| `privatePostBobaAddress` | POST | `boba_address/` | 1 |
| `privatePostPythWithdrawal` | POST | `pyth_withdrawal/` | 1 |
| `privatePostPythAddress` | POST | `pyth_address/` | 1 |

