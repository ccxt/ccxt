Every endpoint in `coinbaseinternational`'s `api` definition is exposed as an **implicit method** — a thin, generated wrapper around the raw exchange endpoint. Use these for exchange-specific functionality the [CCXT API](/docs/exchanges/coinbaseinternational) does not cover.

These methods are available in every CCXT language — TypeScript, JavaScript, Python, PHP, C#, Go and Java. Call them by the camelCase name shown in the tables below (e.g. `publicPostAuth`); Python and PHP use the snake_case form (`public_post_auth`), and Go uses the PascalCase form (`PublicPostAuth`). Switch tabs for the call in each language:

<!-- tabs:start -->

#### **JavaScript**

```javascript
const coinbaseinternational = new ccxt.coinbaseinternational ();
const response = await coinbaseinternational.publicPostAuth (params);
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const coinbaseinternational = new ccxt.coinbaseinternational ();
const response = await coinbaseinternational.publicPostAuth (params);
```

#### **Python**

```python
import ccxt
coinbaseinternational = ccxt.coinbaseinternational()
response = coinbaseinternational.public_post_auth(params)
```

#### **PHP**

```php
$coinbaseinternational = new \ccxt\coinbaseinternational();
$response = $coinbaseinternational->public_post_auth($params);
```

#### **C#**

```csharp
using ccxt;
var coinbaseinternational = new Coinbaseinternational();
var response = await coinbaseinternational.publicPostAuth(parameters);
```

#### **Go**

```go
coinbaseinternational := ccxt.NewCoinbaseinternational(nil)
response := <-coinbaseinternational.PublicPostAuth(params)
```

<!-- tabs:end -->

Path parameters wrapped in `{}` (e.g. `{pair}`) are substituted from `params`; everything else in `params` is sent as the query string or request body. **Cost** is the rate-limiter weight of each call.

📚 **Official coinbaseinternational API documentation:** [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/overview) · [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/advanced-trade-apis/guides/derivatives/technical#authentication) · [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/authentication-authorization/api-key-authentication) · [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/authentication-authorization/api-key-authentication#generating-a-jwt) · [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/coinbase-app/oauth2-integration/access-and-refresh-tokens) · [docs.deribit.com](https://docs.deribit.com)

> 126 implicit endpoints across 2 access groups.

## public

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `publicPostAuth` | POST | `auth` | 1 |
| `publicGetDisableHeartbeat` | GET | `disable_heartbeat` | 1 |
| `publicGetGetAnnouncements` | GET | `get_announcements` | 1 |
| `publicGetGetBlockRfqTrades` | GET | `get_block_rfq_trades` | 1 |
| `publicGetGetBookSummaryByCurrency` | GET | `get_book_summary_by_currency` | 1 |
| `publicGetGetBookSummaryByInstrument` | GET | `get_book_summary_by_instrument` | 1 |
| `publicGetGetComboDetails` | GET | `get_combo_details` | 1 |
| `publicGetGetComboIds` | GET | `get_combo_ids` | 1 |
| `publicGetGetCombos` | GET | `get_combos` | 1 |
| `publicGetGetContractSize` | GET | `get_contract_size` | 1 |
| `publicGetGetCurrencies` | GET | `get_currencies` | 1 |
| `publicGetGetDeliveryPrices` | GET | `get_delivery_prices` | 1 |
| `publicGetGetExpirations` | GET | `get_expirations` | 1 |
| `publicGetGetFundingChartData` | GET | `get_funding_chart_data` | 1 |
| `publicGetGetFundingRateHistory` | GET | `get_funding_rate_history` | 1 |
| `publicGetGetFundingRateValue` | GET | `get_funding_rate_value` | 1 |
| `publicGetGetHistoricalVolatility` | GET | `get_historical_volatility` | 1 |
| `publicGetGetIndexChartData` | GET | `get_index_chart_data` | 1 |
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
| `publicGetGetOrderBookByInstrumentId` | GET | `get_order_book_by_instrument_id` | 1 |
| `publicGetGetSupportedIndexNames` | GET | `get_supported_index_names` | 1 |
| `publicGetGetTime` | GET | `get_time` | 1 |
| `publicGetGetTradeVolumes` | GET | `get_trade_volumes` | 1 |
| `publicGetGetTradingviewChartData` | GET | `get_tradingview_chart_data` | 1 |
| `publicGetGetVolatilityIndexData` | GET | `get_volatility_index_data` | 1 |
| `publicGetHello` | GET | `hello` | 1 |
| `publicGetSetHeartbeat` | GET | `set_heartbeat` | 1 |
| `publicGetStatus` | GET | `status` | 1 |
| `publicGetSubscribe` | GET | `subscribe` | 1 |
| `publicGetTest` | GET | `test` | 1 |
| `publicGetTicker` | GET | `ticker` | 1 |
| `publicGetTickersByCurrency` | GET | `tickers_by_currency` | 1 |
| `publicGetUnsubscribe` | GET | `unsubscribe` | 1 |
| `publicGetUnsubscribeAll` | GET | `unsubscribe_all` | 1 |

## private

| Method | HTTP | Endpoint | Cost |
| --- | --- | --- | --- |
| `privateGetAcceptBlockRfq` | GET | `accept_block_rfq` | 1 |
| `privateGetAddBlockRfqQuote` | GET | `add_block_rfq_quote` | 1 |
| `privateGetApproveBlockTrade` | GET | `approve_block_trade` | 1 |
| `privateGetBuy` | GET | `buy` | 1 |
| `privateGetCancel` | GET | `cancel` | 1 |
| `privateGetCancelAll` | GET | `cancel_all` | 1 |
| `privateGetCancelAllBlockRfqQuotes` | GET | `cancel_all_block_rfq_quotes` | 1 |
| `privateGetCancelAllByCurrency` | GET | `cancel_all_by_currency` | 1 |
| `privateGetCancelAllByCurrencyPair` | GET | `cancel_all_by_currency_pair` | 1 |
| `privateGetCancelAllByInstrument` | GET | `cancel_all_by_instrument` | 1 |
| `privateGetCancelAllByKindOrType` | GET | `cancel_all_by_kind_or_type` | 1 |
| `privateGetCancelBlockRfq` | GET | `cancel_block_rfq` | 1 |
| `privateGetCancelBlockRfqQuote` | GET | `cancel_block_rfq_quote` | 1 |
| `privateGetCancelBlockRfqTrigger` | GET | `cancel_block_rfq_trigger` | 1 |
| `privateGetCancelByLabel` | GET | `cancel_by_label` | 1 |
| `privateGetChangeMarginModel` | GET | `change_margin_model` | 1 |
| `privateGetClosePosition` | GET | `close_position` | 1 |
| `privateGetCreateBlockRfq` | GET | `create_block_rfq` | 1 |
| `privateGetCreateCombo` | GET | `create_combo` | 1 |
| `privateGetDisableCancelOnDisconnect` | GET | `disable_cancel_on_disconnect` | 1 |
| `privateGetEdit` | GET | `edit` | 1 |
| `privateGetEditBlockRfqQuote` | GET | `edit_block_rfq_quote` | 1 |
| `privateGetEditByLabel` | GET | `edit_by_label` | 1 |
| `privateGetEnableCancelOnDisconnect` | GET | `enable_cancel_on_disconnect` | 1 |
| `privateGetExecuteBlockTrade` | GET | `execute_block_trade` | 1 |
| `privateGetGetAccessLog` | GET | `get_access_log` | 1 |
| `privateGetGetAccountSummaries` | GET | `get_account_summaries` | 1 |
| `privateGetGetAccountSummary` | GET | `get_account_summary` | 1 |
| `privateGetGetBlockRfqMakers` | GET | `get_block_rfq_makers` | 1 |
| `privateGetGetBlockRfqQuotes` | GET | `get_block_rfq_quotes` | 1 |
| `privateGetGetBlockRfqUserInfo` | GET | `get_block_rfq_user_info` | 1 |
| `privateGetGetBlockRfqs` | GET | `get_block_rfqs` | 1 |
| `privateGetGetBlockTrade` | GET | `get_block_trade` | 1 |
| `privateGetGetBlockTradeRequests` | GET | `get_block_trade_requests` | 1 |
| `privateGetGetBlockTrades` | GET | `get_block_trades` | 1 |
| `privateGetGetBrokerTradeRequests` | GET | `get_broker_trade_requests` | 1 |
| `privateGetGetBrokerTrades` | GET | `get_broker_trades` | 1 |
| `privateGetGetCancelOnDisconnect` | GET | `get_cancel_on_disconnect` | 1 |
| `privateGetGetLegPrices` | GET | `get_leg_prices` | 1 |
| `privateGetGetLeverage` | GET | `get_leverage` | 1 |
| `privateGetGetMargins` | GET | `get_margins` | 1 |
| `privateGetGetMaxOrderSize` | GET | `get_max_order_size` | 1 |
| `privateGetGetOpenOrders` | GET | `get_open_orders` | 1 |
| `privateGetGetOpenOrdersByCurrency` | GET | `get_open_orders_by_currency` | 1 |
| `privateGetGetOpenOrdersByInstrument` | GET | `get_open_orders_by_instrument` | 1 |
| `privateGetGetOpenOrdersByLabel` | GET | `get_open_orders_by_label` | 1 |
| `privateGetGetOrderHistoryByCurrency` | GET | `get_order_history_by_currency` | 1 |
| `privateGetGetOrderHistoryByInstrument` | GET | `get_order_history_by_instrument` | 1 |
| `privateGetGetOrderMarginByIds` | GET | `get_order_margin_by_ids` | 1 |
| `privateGetGetOrderState` | GET | `get_order_state` | 1 |
| `privateGetGetOrderStateByLabel` | GET | `get_order_state_by_label` | 1 |
| `privateGetGetPmeParams` | GET | `get_pme_params` | 1 |
| `privateGetGetPosition` | GET | `get_position` | 1 |
| `privateGetGetPositions` | GET | `get_positions` | 1 |
| `privateGetGetRiskProfile` | GET | `get_risk_profile` | 1 |
| `privateGetGetSettlementHistoryByCurrency` | GET | `get_settlement_history_by_currency` | 1 |
| `privateGetGetSettlementHistoryByInstrument` | GET | `get_settlement_history_by_instrument` | 1 |
| `privateGetGetSubaccounts` | GET | `get_subaccounts` | 1 |
| `privateGetGetSubaccountsDetails` | GET | `get_subaccounts_details` | 1 |
| `privateGetGetTradingLimits` | GET | `get_trading_limits` | 1 |
| `privateGetGetTransactionLog` | GET | `get_transaction_log` | 10 |
| `privateGetGetTriggerOrderHistory` | GET | `get_trigger_order_history` | 1 |
| `privateGetGetUserLocks` | GET | `get_user_locks` | 1 |
| `privateGetGetUserTradesByCurrency` | GET | `get_user_trades_by_currency` | 1 |
| `privateGetGetUserTradesByCurrencyAndTime` | GET | `get_user_trades_by_currency_and_time` | 1 |
| `privateGetGetUserTradesByInstrument` | GET | `get_user_trades_by_instrument` | 1 |
| `privateGetGetUserTradesByInstrumentAndTime` | GET | `get_user_trades_by_instrument_and_time` | 1 |
| `privateGetGetUserTradesByOrder` | GET | `get_user_trades_by_order` | 1 |
| `privateGetInvalidateBlockTradeSignature` | GET | `invalidate_block_trade_signature` | 1 |
| `privateGetLogout` | GET | `logout` | 1 |
| `privateGetPmeSimulate` | GET | `pme/simulate` | 1 |
| `privateGetRejectBlockTrade` | GET | `reject_block_trade` | 1 |
| `privateGetSell` | GET | `sell` | 1 |
| `privateGetSetLeverage` | GET | `set_leverage` | 1 |
| `privateGetSimulateBlockTrade` | GET | `simulate_block_trade` | 1 |
| `privateGetSimulatePortfolio` | GET | `simulate_portfolio` | 1 |
| `privateGetSubscribe` | GET | `subscribe` | 1 |
| `privateGetSubmitTransferBetweenSubaccounts` | GET | `submit_transfer_between_subaccounts` | 1 |
| `privateGetUnsubscribe` | GET | `unsubscribe` | 1 |
| `privateGetUnsubscribeAll` | GET | `unsubscribe_all` | 1 |
| `privateGetVerifyBlockTrade` | GET | `verify_block_trade` | 1 |

