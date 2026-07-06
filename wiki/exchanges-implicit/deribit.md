Every endpoint in `deribit`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/deribit) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C# and Go. Call them by the camelCase name shown in the tables below (e.g. `publicGetAuth`); the snake_case alias (`public_get_auth`) also works in JavaScript, Python and PHP, and Go uses the PascalCase form (`PublicGetAuth`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const deribit = new ccxt.deribit ();
const response = await deribit.publicGetAuth (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const deribit = new ccxt.deribit ();
const response = await deribit.publicGetAuth (params);
```

#### **Python**

```python
import ccxt
deribit = ccxt.deribit()
response = deribit.public_get_auth(params)
```

#### **PHP**

```php
$deribit = new \ccxt\deribit();
$response = $deribit->public_get_auth($params);
```

#### **C#**

```csharp
using ccxt;
var deribit = new Deribit();
var response = await deribit.publicGetAuth(parameters);
```

#### **Go**

```go
deribit := ccxt.NewDeribit(nil)
response := <-deribit.PublicGetAuth(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official deribit API documentation:** [docs.deribit.com](https://docs.deribit.com/v2) · [github.com](https://github.com/deribit)

> 122 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicGetAuth` | GET | `auth` | 1 |
| `publicGetExchangeToken` | GET | `exchange_token` | 1 |
| `publicGetForkToken` | GET | `fork_token` | 1 |
| `publicGetSetHeartbeat` | GET | `set_heartbeat` | 1 |
| `publicGetDisableHeartbeat` | GET | `disable_heartbeat` | 1 |
| `publicGetGetTime` | GET | `get_time` | 1 |
| `publicGetHello` | GET | `hello` | 1 |
| `publicGetStatus` | GET | `status` | 1 |
| `publicGetTest` | GET | `test` | 1 |
| `publicGetSubscribe` | GET | `subscribe` | 1 |
| `publicGetUnsubscribe` | GET | `unsubscribe` | 1 |
| `publicGetUnsubscribeAll` | GET | `unsubscribe_all` | 1 |
| `publicGetGetAnnouncements` | GET | `get_announcements` | 1 |
| `publicGetGetBookSummaryByCurrency` | GET | `get_book_summary_by_currency` | 1 |
| `publicGetGetBookSummaryByInstrument` | GET | `get_book_summary_by_instrument` | 1 |
| `publicGetGetContractSize` | GET | `get_contract_size` | 1 |
| `publicGetGetCurrencies` | GET | `get_currencies` | 1 |
| `publicGetGetDeliveryPrices` | GET | `get_delivery_prices` | 1 |
| `publicGetGetFundingChartData` | GET | `get_funding_chart_data` | 1 |
| `publicGetGetFundingRateHistory` | GET | `get_funding_rate_history` | 1 |
| `publicGetGetFundingRateValue` | GET | `get_funding_rate_value` | 1 |
| `publicGetGetHistoricalVolatility` | GET | `get_historical_volatility` | 1 |
| `publicGetGetIndex` | GET | `get_index` | 1 |
| `publicGetGetIndexPrice` | GET | `get_index_price` | 1 |
| `publicGetGetIndexPriceNames` | GET | `get_index_price_names` | 1 |
| `publicGetGetInstrument` | GET | `get_instrument` | 1 |
| `publicGetGetInstruments` | GET | `get_instruments` | 1 |
| `publicGetGetLastSettlementsByCurrency` | GET | `get_last_settlements_by_currency` | 1 |
| `publicGetGetLastSettlementsByInstrument` | GET | `get_last_settlements_by_instrument` | 1 |
| `publicGetGetLastTradesByCurrency` | GET | `get_last_trades_by_currency` | 1 |
| `publicGetGetLastTradesByCurrencyAndTime` | GET | `get_last_trades_by_currency_and_time` | 1 |
| `publicGetGetLastTradesByInstrument` | GET | `get_last_trades_by_instrument` | 1 |
| `publicGetGetLastTradesByInstrumentAndTime` | GET | `get_last_trades_by_instrument_and_time` | 1 |
| `publicGetGetMarkPriceHistory` | GET | `get_mark_price_history` | 1 |
| `publicGetGetOrderBook` | GET | `get_order_book` | 1 |
| `publicGetGetTradeVolumes` | GET | `get_trade_volumes` | 1 |
| `publicGetGetTradingviewChartData` | GET | `get_tradingview_chart_data` | 1 |
| `publicGetGetVolatilityIndexData` | GET | `get_volatility_index_data` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetLogout` | GET | `logout` | 1 |
| `privateGetEnableCancelOnDisconnect` | GET | `enable_cancel_on_disconnect` | 1 |
| `privateGetDisableCancelOnDisconnect` | GET | `disable_cancel_on_disconnect` | 1 |
| `privateGetGetCancelOnDisconnect` | GET | `get_cancel_on_disconnect` | 1 |
| `privateGetSubscribe` | GET | `subscribe` | 1 |
| `privateGetUnsubscribe` | GET | `unsubscribe` | 1 |
| `privateGetUnsubscribeAll` | GET | `unsubscribe_all` | 1 |
| `privateGetChangeApiKeyName` | GET | `change_api_key_name` | 1 |
| `privateGetChangeScopeInApiKey` | GET | `change_scope_in_api_key` | 1 |
| `privateGetChangeSubaccountName` | GET | `change_subaccount_name` | 1 |
| `privateGetCreateApiKey` | GET | `create_api_key` | 1 |
| `privateGetCreateSubaccount` | GET | `create_subaccount` | 1 |
| `privateGetDisableApiKey` | GET | `disable_api_key` | 1 |
| `privateGetDisableTfaForSubaccount` | GET | `disable_tfa_for_subaccount` | 1 |
| `privateGetEnableAffiliateProgram` | GET | `enable_affiliate_program` | 1 |
| `privateGetEnableApiKey` | GET | `enable_api_key` | 1 |
| `privateGetGetAccessLog` | GET | `get_access_log` | 1 |
| `privateGetGetAccountSummary` | GET | `get_account_summary` | 1 |
| `privateGetGetAccountSummaries` | GET | `get_account_summaries` | 1 |
| `privateGetGetAffiliateProgramInfo` | GET | `get_affiliate_program_info` | 1 |
| `privateGetGetEmailLanguage` | GET | `get_email_language` | 1 |
| `privateGetGetNewAnnouncements` | GET | `get_new_announcements` | 1 |
| `privateGetGetPortfolioMargins` | GET | `get_portfolio_margins` | 1 |
| `privateGetGetPosition` | GET | `get_position` | 1 |
| `privateGetGetPositions` | GET | `get_positions` | 1 |
| `privateGetGetSubaccounts` | GET | `get_subaccounts` | 1 |
| `privateGetGetSubaccountsDetails` | GET | `get_subaccounts_details` | 1 |
| `privateGetGetTransactionLog` | GET | `get_transaction_log` | 1 |
| `privateGetListApiKeys` | GET | `list_api_keys` | 1 |
| `privateGetRemoveApiKey` | GET | `remove_api_key` | 1 |
| `privateGetRemoveSubaccount` | GET | `remove_subaccount` | 1 |
| `privateGetResetApiKey` | GET | `reset_api_key` | 1 |
| `privateGetSetAnnouncementAsRead` | GET | `set_announcement_as_read` | 1 |
| `privateGetSetApiKeyAsDefault` | GET | `set_api_key_as_default` | 1 |
| `privateGetSetEmailForSubaccount` | GET | `set_email_for_subaccount` | 1 |
| `privateGetSetEmailLanguage` | GET | `set_email_language` | 1 |
| `privateGetSetPasswordForSubaccount` | GET | `set_password_for_subaccount` | 1 |
| `privateGetToggleNotificationsFromSubaccount` | GET | `toggle_notifications_from_subaccount` | 1 |
| `privateGetToggleSubaccountLogin` | GET | `toggle_subaccount_login` | 1 |
| `privateGetExecuteBlockTrade` | GET | `execute_block_trade` | 4 |
| `privateGetGetBlockTrade` | GET | `get_block_trade` | 1 |
| `privateGetGetLastBlockTradesByCurrency` | GET | `get_last_block_trades_by_currency` | 1 |
| `privateGetInvalidateBlockTradeSignature` | GET | `invalidate_block_trade_signature` | 1 |
| `privateGetVerifyBlockTrade` | GET | `verify_block_trade` | 4 |
| `privateGetBuy` | GET | `buy` | 4 |
| `privateGetSell` | GET | `sell` | 4 |
| `privateGetEdit` | GET | `edit` | 4 |
| `privateGetEditByLabel` | GET | `edit_by_label` | 4 |
| `privateGetCancel` | GET | `cancel` | 4 |
| `privateGetCancelAll` | GET | `cancel_all` | 4 |
| `privateGetCancelAllByCurrency` | GET | `cancel_all_by_currency` | 4 |
| `privateGetCancelAllByInstrument` | GET | `cancel_all_by_instrument` | 4 |
| `privateGetCancelByLabel` | GET | `cancel_by_label` | 4 |
| `privateGetClosePosition` | GET | `close_position` | 4 |
| `privateGetGetMargins` | GET | `get_margins` | 1 |
| `privateGetGetMmpConfig` | GET | `get_mmp_config` | 1 |
| `privateGetGetOpenOrdersByCurrency` | GET | `get_open_orders_by_currency` | 1 |
| `privateGetGetOpenOrdersByInstrument` | GET | `get_open_orders_by_instrument` | 1 |
| `privateGetGetOrderHistoryByCurrency` | GET | `get_order_history_by_currency` | 1 |
| `privateGetGetOrderHistoryByInstrument` | GET | `get_order_history_by_instrument` | 1 |
| `privateGetGetOrderMarginByIds` | GET | `get_order_margin_by_ids` | 1 |
| `privateGetGetOrderState` | GET | `get_order_state` | 1 |
| `privateGetGetStopOrderHistory` | GET | `get_stop_order_history` | 1 |
| `privateGetGetTriggerOrderHistory` | GET | `get_trigger_order_history` | 1 |
| `privateGetGetUserTradesByCurrency` | GET | `get_user_trades_by_currency` | 1 |
| `privateGetGetUserTradesByCurrencyAndTime` | GET | `get_user_trades_by_currency_and_time` | 1 |
| `privateGetGetUserTradesByInstrument` | GET | `get_user_trades_by_instrument` | 1 |
| `privateGetGetUserTradesByInstrumentAndTime` | GET | `get_user_trades_by_instrument_and_time` | 1 |
| `privateGetGetUserTradesByOrder` | GET | `get_user_trades_by_order` | 1 |
| `privateGetResetMmp` | GET | `reset_mmp` | 1 |
| `privateGetSetMmpConfig` | GET | `set_mmp_config` | 1 |
| `privateGetGetSettlementHistoryByInstrument` | GET | `get_settlement_history_by_instrument` | 1 |
| `privateGetGetSettlementHistoryByCurrency` | GET | `get_settlement_history_by_currency` | 1 |
| `privateGetCancelTransferById` | GET | `cancel_transfer_by_id` | 1 |
| `privateGetCancelWithdrawal` | GET | `cancel_withdrawal` | 1 |
| `privateGetCreateDepositAddress` | GET | `create_deposit_address` | 1 |
| `privateGetGetCurrentDepositAddress` | GET | `get_current_deposit_address` | 1 |
| `privateGetGetDeposits` | GET | `get_deposits` | 1 |
| `privateGetGetTransfers` | GET | `get_transfers` | 1 |
| `privateGetGetWithdrawals` | GET | `get_withdrawals` | 1 |
| `privateGetSubmitTransferToSubaccount` | GET | `submit_transfer_to_subaccount` | 1 |
| `privateGetSubmitTransferToUser` | GET | `submit_transfer_to_user` | 1 |
| `privateGetWithdraw` | GET | `withdraw` | 1 |

