@kwdef mutable struct Derive <: CcxtExchange
    parent::Union{Exchange, Nothing} = Exchange()
    describe::Function = describe
    setSandboxMode::Function = setSandboxMode
    fetchTime::Function = fetchTime
    fetchCurrencies::Function = fetchCurrencies
    parseCurrency::Function = parseCurrency
    fetchMarkets::Function = fetchMarkets
    fetchSpotMarkets::Function = fetchSpotMarkets
    fetchSwapMarkets::Function = fetchSwapMarkets
    fetchOptionMarkets::Function = fetchOptionMarkets
    parseMarket::Function = parseMarket
    fetchTicker::Function = fetchTicker
    parseTicker::Function = parseTicker
    fetchTrades::Function = fetchTrades
    parseTrade::Function = parseTrade
    fetchFundingRateHistory::Function = fetchFundingRateHistory
    fetchFundingRate::Function = fetchFundingRate
    parseFundingRate::Function = parseFundingRate
    hashOrderMessage::Function = hashOrderMessage
    signOrder::Function = signOrder
    hashMessage::Function = hashMessage
    signHash::Function = signHash
    signMessage::Function = signMessage
    parseUnits::Function = parseUnits
    createOrder::Function = createOrder
    editOrder::Function = editOrder
    cancelOrder::Function = cancelOrder
    cancelAllOrders::Function = cancelAllOrders
    fetchOrders::Function = fetchOrders
    fetchOpenOrders::Function = fetchOpenOrders
    fetchClosedOrders::Function = fetchClosedOrders
    fetchCanceledOrders::Function = fetchCanceledOrders
    parseTimeInForce::Function = parseTimeInForce
    parseOrderStatus::Function = parseOrderStatus
    parseOrder::Function = parseOrder
    fetchOrderTrades::Function = fetchOrderTrades
    fetchMyTrades::Function = fetchMyTrades
    fetchPositions::Function = fetchPositions
    parsePosition::Function = parsePosition
    fetchFundingHistory::Function = fetchFundingHistory
    parseIncome::Function = parseIncome
    fetchBalance::Function = fetchBalance
    parseBalance::Function = parseBalance
    fetchDeposits::Function = fetchDeposits
    fetchWithdrawals::Function = fetchWithdrawals
    parseTransaction::Function = parseTransaction
    parseTransactionStatus::Function = parseTransactionStatus
    handleDeriveSubaccountId::Function = handleDeriveSubaccountId
    handleDeriveWalletAddress::Function = handleDeriveWalletAddress
    handleErrors::Function = handleErrors
    sign::Function = sign

# Generated REST endpoint fields
    publicGetGetAllCurrencies::Function = publicGetGetAllCurrencies
    publicPostBuildRegisterSessionKeyTx::Function = publicPostBuildRegisterSessionKeyTx
    publicPostRegisterSessionKey::Function = publicPostRegisterSessionKey
    publicPostDeregisterSessionKey::Function = publicPostDeregisterSessionKey
    publicPostLogin::Function = publicPostLogin
    publicPostStatistics::Function = publicPostStatistics
    publicPostGetAllCurrencies::Function = publicPostGetAllCurrencies
    publicPostGetCurrency::Function = publicPostGetCurrency
    publicPostGetInstrument::Function = publicPostGetInstrument
    publicPostGetAllInstruments::Function = publicPostGetAllInstruments
    publicPostGetInstruments::Function = publicPostGetInstruments
    publicPostGetTicker::Function = publicPostGetTicker
    publicPostGetLatestSignedFeeds::Function = publicPostGetLatestSignedFeeds
    publicPostGetOptionSettlementPrices::Function = publicPostGetOptionSettlementPrices
    publicPostGetSpotFeedHistory::Function = publicPostGetSpotFeedHistory
    publicPostGetSpotFeedHistoryCandles::Function = publicPostGetSpotFeedHistoryCandles
    publicPostGetFundingRateHistory::Function = publicPostGetFundingRateHistory
    publicPostGetTradeHistory::Function = publicPostGetTradeHistory
    publicPostGetOptionSettlementHistory::Function = publicPostGetOptionSettlementHistory
    publicPostGetLiquidationHistory::Function = publicPostGetLiquidationHistory
    publicPostGetInterestRateHistory::Function = publicPostGetInterestRateHistory
    publicPostGetTransaction::Function = publicPostGetTransaction
    publicPostGetMargin::Function = publicPostGetMargin
    publicPostMarginWatch::Function = publicPostMarginWatch
    publicPostValidateInviteCode::Function = publicPostValidateInviteCode
    publicPostGetPoints::Function = publicPostGetPoints
    publicPostGetAllPoints::Function = publicPostGetAllPoints
    publicPostGetPointsLeaderboard::Function = publicPostGetPointsLeaderboard
    publicPostGetDescendantTree::Function = publicPostGetDescendantTree
    publicPostGetTreeRoots::Function = publicPostGetTreeRoots
    publicPostGetSwellPercentPoints::Function = publicPostGetSwellPercentPoints
    publicPostGetVaultAssets::Function = publicPostGetVaultAssets
    publicPostGetEtherfiEffectiveBalances::Function = publicPostGetEtherfiEffectiveBalances
    publicPostGetKelpEffectiveBalances::Function = publicPostGetKelpEffectiveBalances
    publicPostGetBridgeBalances::Function = publicPostGetBridgeBalances
    publicPostGetEthenaParticipants::Function = publicPostGetEthenaParticipants
    publicPostGetVaultShare::Function = publicPostGetVaultShare
    publicPostGetVaultStatistics::Function = publicPostGetVaultStatistics
    publicPostGetVaultBalances::Function = publicPostGetVaultBalances
    publicPostEstimateIntegratorPoints::Function = publicPostEstimateIntegratorPoints
    publicPostCreateSubaccountDebug::Function = publicPostCreateSubaccountDebug
    publicPostDepositDebug::Function = publicPostDepositDebug
    publicPostWithdrawDebug::Function = publicPostWithdrawDebug
    publicPostSendQuoteDebug::Function = publicPostSendQuoteDebug
    publicPostExecuteQuoteDebug::Function = publicPostExecuteQuoteDebug
    publicPostGetInviteCode::Function = publicPostGetInviteCode
    publicPostRegisterInvite::Function = publicPostRegisterInvite
    publicPostGetTime::Function = publicPostGetTime
    publicPostGetLiveIncidents::Function = publicPostGetLiveIncidents
    publicPostGetMakerPrograms::Function = publicPostGetMakerPrograms
    publicPostGetMakerProgramScores::Function = publicPostGetMakerProgramScores
    privatePostGetAccount::Function = privatePostGetAccount
    privatePostCreateSubaccount::Function = privatePostCreateSubaccount
    privatePostGetSubaccount::Function = privatePostGetSubaccount
    privatePostGetSubaccounts::Function = privatePostGetSubaccounts
    privatePostGetAllPortfolios::Function = privatePostGetAllPortfolios
    privatePostChangeSubaccountLabel::Function = privatePostChangeSubaccountLabel
    privatePostGetNotificationsv::Function = privatePostGetNotificationsv
    privatePostUpdateNotifications::Function = privatePostUpdateNotifications
    privatePostDeposit::Function = privatePostDeposit
    privatePostWithdraw::Function = privatePostWithdraw
    privatePostTransferErc20::Function = privatePostTransferErc20
    privatePostTransferPosition::Function = privatePostTransferPosition
    privatePostTransferPositions::Function = privatePostTransferPositions
    privatePostOrder::Function = privatePostOrder
    privatePostReplace::Function = privatePostReplace
    privatePostOrderDebug::Function = privatePostOrderDebug
    privatePostGetOrder::Function = privatePostGetOrder
    privatePostGetOrders::Function = privatePostGetOrders
    privatePostGetOpenOrders::Function = privatePostGetOpenOrders
    privatePostCancel::Function = privatePostCancel
    privatePostCancelByLabel::Function = privatePostCancelByLabel
    privatePostCancelByNonce::Function = privatePostCancelByNonce
    privatePostCancelByInstrument::Function = privatePostCancelByInstrument
    privatePostCancelAll::Function = privatePostCancelAll
    privatePostCancelTriggerOrder::Function = privatePostCancelTriggerOrder
    privatePostGetOrderHistory::Function = privatePostGetOrderHistory
    privatePostGetTradeHistory::Function = privatePostGetTradeHistory
    privatePostGetDepositHistory::Function = privatePostGetDepositHistory
    privatePostGetWithdrawalHistory::Function = privatePostGetWithdrawalHistory
    privatePostSendRfq::Function = privatePostSendRfq
    privatePostCancelRfq::Function = privatePostCancelRfq
    privatePostCancelBatchRfqs::Function = privatePostCancelBatchRfqs
    privatePostGetRfqs::Function = privatePostGetRfqs
    privatePostPollRfqs::Function = privatePostPollRfqs
    privatePostSendQuote::Function = privatePostSendQuote
    privatePostCancelQuote::Function = privatePostCancelQuote
    privatePostCancelBatchQuotes::Function = privatePostCancelBatchQuotes
    privatePostGetQuotes::Function = privatePostGetQuotes
    privatePostPollQuotes::Function = privatePostPollQuotes
    privatePostExecuteQuote::Function = privatePostExecuteQuote
    privatePostRfqGetBestQuote::Function = privatePostRfqGetBestQuote
    privatePostGetMargin::Function = privatePostGetMargin
    privatePostGetCollaterals::Function = privatePostGetCollaterals
    privatePostGetPositions::Function = privatePostGetPositions
    privatePostGetOptionSettlementHistory::Function = privatePostGetOptionSettlementHistory
    privatePostGetSubaccountValueHistory::Function = privatePostGetSubaccountValueHistory
    privatePostExpiredAndCancelledHistory::Function = privatePostExpiredAndCancelledHistory
    privatePostGetFundingHistory::Function = privatePostGetFundingHistory
    privatePostGetInterestHistory::Function = privatePostGetInterestHistory
    privatePostGetErc20TransferHistory::Function = privatePostGetErc20TransferHistory
    privatePostGetLiquidationHistory::Function = privatePostGetLiquidationHistory
    privatePostLiquidate::Function = privatePostLiquidate
    privatePostGetLiquidatorHistory::Function = privatePostGetLiquidatorHistory
    privatePostSessionKeys::Function = privatePostSessionKeys
    privatePostEditSessionKey::Function = privatePostEditSessionKey
    privatePostRegisterScopedSessionKey::Function = privatePostRegisterScopedSessionKey
    privatePostGetMmpConfig::Function = privatePostGetMmpConfig
    privatePostSetMmpConfig::Function = privatePostSetMmpConfig
    privatePostResetMmp::Function = privatePostResetMmp
    privatePostSetCancelOnDisconnect::Function = privatePostSetCancelOnDisconnect
    privatePostGetInviteCode::Function = privatePostGetInviteCode
    privatePostRegisterInvite::Function = privatePostRegisterInvite

end
function describe(self::Derive, )
    return deepExtend(describe(self.parent), Dict{Symbol, Any}(
    Symbol("id") => "derive",
    Symbol("name") => "Derive",
    Symbol("countries") => [],
    Symbol("version") => "v1",
    Symbol("rateLimit") => 50,
    Symbol("certified") => false,
    Symbol("pro") => true,
    Symbol("dex") => true,
    Symbol("has") => Dict{Symbol, Any}(
        Symbol("CORS") => nothing,
        Symbol("spot") => false,
        Symbol("margin") => false,
        Symbol("swap") => false,
        Symbol("future") => false,
        Symbol("option") => false,
        Symbol("addMargin") => false,
        Symbol("borrowCrossMargin") => false,
        Symbol("borrowIsolatedMargin") => false,
        Symbol("cancelAllOrders") => true,
        Symbol("cancelAllOrdersAfter") => false,
        Symbol("cancelOrder") => true,
        Symbol("cancelOrders") => false,
        Symbol("cancelOrdersForSymbols") => false,
        Symbol("closeAllPositions") => false,
        Symbol("closePosition") => false,
        Symbol("createMarketBuyOrderWithCost") => false,
        Symbol("createMarketOrderWithCost") => false,
        Symbol("createMarketSellOrderWithCost") => false,
        Symbol("createOrder") => true,
        Symbol("createOrders") => false,
        Symbol("createReduceOnlyOrder") => false,
        Symbol("createStopOrder") => false,
        Symbol("createTriggerOrder") => false,
        Symbol("editOrder") => true,
        Symbol("fetchAccounts") => false,
        Symbol("fetchBalance") => true,
        Symbol("fetchBorrowInterest") => false,
        Symbol("fetchBorrowRateHistories") => false,
        Symbol("fetchBorrowRateHistory") => false,
        Symbol("fetchCanceledAndClosedOrders") => false,
        Symbol("fetchCanceledOrders") => true,
        Symbol("fetchClosedOrders") => true,
        Symbol("fetchCrossBorrowRate") => false,
        Symbol("fetchCrossBorrowRates") => false,
        Symbol("fetchCurrencies") => true,
        Symbol("fetchDepositAddress") => false,
        Symbol("fetchDepositAddresses") => false,
        Symbol("fetchDeposits") => true,
        Symbol("fetchDepositWithdrawFee") => "emulated",
        Symbol("fetchDepositWithdrawFees") => false,
        Symbol("fetchFundingHistory") => true,
        Symbol("fetchFundingRate") => true,
        Symbol("fetchFundingRateHistory") => true,
        Symbol("fetchFundingRates") => false,
        Symbol("fetchIndexOHLCV") => false,
        Symbol("fetchIsolatedBorrowRate") => false,
        Symbol("fetchIsolatedBorrowRates") => false,
        Symbol("fetchLedger") => true,
        Symbol("fetchLeverage") => false,
        Symbol("fetchLeverageTiers") => false,
        Symbol("fetchLiquidations") => false,
        Symbol("fetchMarginMode") => nothing,
        Symbol("fetchMarketLeverageTiers") => false,
        Symbol("fetchMarkets") => true,
        Symbol("fetchMarkOHLCV") => false,
        Symbol("fetchMyLiquidations") => false,
        Symbol("fetchMyTrades") => true,
        Symbol("fetchOHLCV") => false,
        Symbol("fetchOpenInterest") => false,
        Symbol("fetchOpenInterestHistory") => false,
        Symbol("fetchOpenInterests") => false,
        Symbol("fetchOpenOrders") => true,
        Symbol("fetchOrder") => false,
        Symbol("fetchOrderBook") => false,
        Symbol("fetchOrders") => true,
        Symbol("fetchOrderTrades") => true,
        Symbol("fetchPosition") => false,
        Symbol("fetchPositionMode") => false,
        Symbol("fetchPositions") => true,
        Symbol("fetchPositionsRisk") => false,
        Symbol("fetchPremiumIndexOHLCV") => false,
        Symbol("fetchTicker") => true,
        Symbol("fetchTickers") => false,
        Symbol("fetchTime") => true,
        Symbol("fetchTrades") => true,
        Symbol("fetchTradingFee") => false,
        Symbol("fetchTradingFees") => false,
        Symbol("fetchTransfer") => false,
        Symbol("fetchTransfers") => false,
        Symbol("fetchWithdrawal") => false,
        Symbol("fetchWithdrawals") => true,
        Symbol("reduceMargin") => false,
        Symbol("repayCrossMargin") => false,
        Symbol("repayIsolatedMargin") => false,
        Symbol("sandbox") => true,
        Symbol("setLeverage") => false,
        Symbol("setMarginMode") => false,
        Symbol("setPositionMode") => false,
        Symbol("transfer") => false,
        Symbol("withdraw") => false
    ),
    Symbol("timeframes") => Dict{Symbol, Any}(
        Symbol("1m") => "1m",
        Symbol("3m") => "3m",
        Symbol("5m") => "5m",
        Symbol("15m") => "15m",
        Symbol("30m") => "30m",
        Symbol("1h") => "1h",
        Symbol("2h") => "2h",
        Symbol("4h") => "4h",
        Symbol("8h") => "8h",
        Symbol("12h") => "12h",
        Symbol("1d") => "1d",
        Symbol("3d") => "3d",
        Symbol("1w") => "1w",
        Symbol("1M") => "1M"
    ),
    Symbol("urls") => Dict{Symbol, Any}(
        Symbol("logo") => "https://github.com/user-attachments/assets/9e640700-c870-41f9-8907-fba58e120fed",
        Symbol("api") => Dict{Symbol, Any}(
            Symbol("public") => "https://api.lyra.finance/public",
            Symbol("private") => "https://api.lyra.finance/private"
        ),
        Symbol("test") => Dict{Symbol, Any}(
            Symbol("public") => "https://api-demo.lyra.finance/public",
            Symbol("private") => "https://api-demo.lyra.finance/private"
        ),
        Symbol("www") => "https://www.derive.xyz/",
        Symbol("doc") => "https://docs.derive.xyz/docs/",
        Symbol("fees") => "https://docs.derive.xyz/reference/fees-1/",
        Symbol("referral") => "https://www.derive.xyz/invite/3VB0B"
    ),
    Symbol("api") => Dict{Symbol, Any}(
        Symbol("public") => Dict{Symbol, Any}(
            Symbol("get") => ["get_all_currencies"],
            Symbol("post") => ["build_register_session_key_tx", "register_session_key", "deregister_session_key", "login", "statistics", "get_all_currencies", "get_currency", "get_instrument", "get_all_instruments", "get_instruments", "get_ticker", "get_latest_signed_feeds", "get_option_settlement_prices", "get_spot_feed_history", "get_spot_feed_history_candles", "get_funding_rate_history", "get_trade_history", "get_option_settlement_history", "get_liquidation_history", "get_interest_rate_history", "get_transaction", "get_margin", "margin_watch", "validate_invite_code", "get_points", "get_all_points", "get_points_leaderboard", "get_descendant_tree", "get_tree_roots", "get_swell_percent_points", "get_vault_assets", "get_etherfi_effective_balances", "get_kelp_effective_balances", "get_bridge_balances", "get_ethena_participants", "get_vault_share", "get_vault_statistics", "get_vault_balances", "estimate_integrator_points", "create_subaccount_debug", "deposit_debug", "withdraw_debug", "send_quote_debug", "execute_quote_debug", "get_invite_code", "register_invite", "get_time", "get_live_incidents", "get_maker_programs", "get_maker_program_scores"]
        ),
        Symbol("private") => Dict{Symbol, Any}(
            Symbol("post") => ["get_account", "create_subaccount", "get_subaccount", "get_subaccounts", "get_all_portfolios", "change_subaccount_label", "get_notificationsv", "update_notifications", "deposit", "withdraw", "transfer_erc20", "transfer_position", "transfer_positions", "order", "replace", "order_debug", "get_order", "get_orders", "get_open_orders", "cancel", "cancel_by_label", "cancel_by_nonce", "cancel_by_instrument", "cancel_all", "cancel_trigger_order", "get_order_history", "get_trade_history", "get_deposit_history", "get_withdrawal_history", "send_rfq", "cancel_rfq", "cancel_batch_rfqs", "get_rfqs", "poll_rfqs", "send_quote", "cancel_quote", "cancel_batch_quotes", "get_quotes", "poll_quotes", "execute_quote", "rfq_get_best_quote", "get_margin", "get_collaterals", "get_positions", "get_option_settlement_history", "get_subaccount_value_history", "expired_and_cancelled_history", "get_funding_history", "get_interest_history", "get_erc20_transfer_history", "get_liquidation_history", "liquidate", "get_liquidator_history", "session_keys", "edit_session_key", "register_scoped_session_key", "get_mmp_config", "set_mmp_config", "reset_mmp", "set_cancel_on_disconnect", "get_invite_code", "register_invite"]
        )
    ),
    Symbol("fees") => Dict{Symbol, Any}(),
    Symbol("requiredCredentials") => Dict{Symbol, Any}(
        Symbol("apiKey") => false,
        Symbol("secret") => false,
        Symbol("walletAddress") => true,
        Symbol("privateKey") => true
    ),
    Symbol("exceptions") => Dict{Symbol, Any}(
        Symbol("exact") => Dict{Symbol, Any}(
            Symbol("-32000") => RateLimitExceeded,
            Symbol("-32100") => RateLimitExceeded,
            Symbol("-32700") => BadRequest,
            Symbol("-32600") => BadRequest,
            Symbol("-32601") => BadRequest,
            Symbol("-32602") => InvalidOrder,
            Symbol("-32603") => InvalidOrder,
            Symbol("9000") => InvalidOrder,
            Symbol("10000") => BadRequest,
            Symbol("10001") => BadRequest,
            Symbol("10002") => BadRequest,
            Symbol("10003") => BadRequest,
            Symbol("10004") => InvalidOrder,
            Symbol("10005") => BadRequest,
            Symbol("10006") => BadRequest,
            Symbol("10007") => BadRequest,
            Symbol("10008") => BadRequest,
            Symbol("10009") => BadRequest,
            Symbol("10010") => InvalidOrder,
            Symbol("10011") => InsufficientFunds,
            Symbol("10012") => InsufficientFunds,
            Symbol("10013") => ExchangeError,
            Symbol("10014") => ExchangeError,
            Symbol("11000") => InsufficientFunds,
            Symbol("11002") => InvalidOrder,
            Symbol("11003") => InvalidOrder,
            Symbol("11004") => InvalidOrder,
            Symbol("11005") => InvalidOrder,
            Symbol("11006") => OrderNotFound,
            Symbol("11007") => InvalidOrder,
            Symbol("11008") => InvalidOrder,
            Symbol("11009") => InvalidOrder,
            Symbol("11010") => InvalidOrder,
            Symbol("11011") => InvalidOrder,
            Symbol("11012") => InvalidOrder,
            Symbol("11013") => InvalidOrder,
            Symbol("11014") => InvalidOrder,
            Symbol("11015") => InvalidOrder,
            Symbol("11016") => InvalidOrder,
            Symbol("11017") => InvalidOrder,
            Symbol("11018") => InvalidOrder,
            Symbol("11019") => InvalidOrder,
            Symbol("11020") => InsufficientFunds,
            Symbol("11021") => InvalidOrder,
            Symbol("11022") => InvalidOrder,
            Symbol("11023") => InvalidOrder,
            Symbol("11024") => InvalidOrder,
            Symbol("11025") => InvalidOrder,
            Symbol("11026") => BadRequest,
            Symbol("11027") => InvalidOrder,
            Symbol("11028") => InvalidOrder,
            Symbol("11050") => InvalidOrder,
            Symbol("11051") => InvalidOrder,
            Symbol("11052") => InvalidOrder,
            Symbol("11053") => InvalidOrder,
            Symbol("11054") => InvalidOrder,
            Symbol("11055") => InvalidOrder,
            Symbol("11100") => InvalidOrder,
            Symbol("11101") => InvalidOrder,
            Symbol("11102") => InvalidOrder,
            Symbol("11103") => InvalidOrder,
            Symbol("11104") => InvalidOrder,
            Symbol("11105") => InvalidOrder,
            Symbol("11106") => InvalidOrder,
            Symbol("11107") => InvalidOrder,
            Symbol("11200") => InvalidOrder,
            Symbol("11201") => InvalidOrder,
            Symbol("11202") => InvalidOrder,
            Symbol("11203") => InvalidOrder,
            Symbol("12000") => InvalidOrder,
            Symbol("12001") => InvalidOrder,
            Symbol("12002") => BadRequest,
            Symbol("12003") => BadRequest,
            Symbol("13000") => BadRequest,
            Symbol("14000") => BadRequest,
            Symbol("14001") => InvalidOrder,
            Symbol("14002") => BadRequest,
            Symbol("14008") => BadRequest,
            Symbol("14009") => BadRequest,
            Symbol("14010") => BadRequest,
            Symbol("14011") => BadRequest,
            Symbol("14012") => BadRequest,
            Symbol("14013") => BadRequest,
            Symbol("14014") => InvalidOrder,
            Symbol("14015") => BadRequest,
            Symbol("14016") => BadRequest,
            Symbol("14017") => BadRequest,
            Symbol("14018") => BadRequest,
            Symbol("14019") => BadRequest,
            Symbol("14020") => BadRequest,
            Symbol("14021") => BadRequest,
            Symbol("14022") => AuthenticationError,
            Symbol("14023") => InvalidOrder,
            Symbol("14024") => BadRequest,
            Symbol("14025") => BadRequest,
            Symbol("14026") => BadRequest,
            Symbol("14027") => AuthenticationError,
            Symbol("14028") => BadRequest,
            Symbol("14029") => AuthenticationError,
            Symbol("14030") => BadRequest,
            Symbol("14031") => AuthenticationError,
            Symbol("14032") => BadRequest,
            Symbol("16000") => AuthenticationError,
            Symbol("16001") => AuthenticationError,
            Symbol("16100") => AuthenticationError,
            Symbol("17000") => BadRequest,
            Symbol("17001") => BadRequest,
            Symbol("17002") => BadRequest,
            Symbol("17003") => BadRequest,
            Symbol("17004") => BadRequest,
            Symbol("17005") => BadRequest,
            Symbol("17006") => BadRequest,
            Symbol("17007") => BadRequest,
            Symbol("18000") => BadRequest,
            Symbol("18001") => BadRequest,
            Symbol("18002") => BadRequest,
            Symbol("18003") => BadRequest,
            Symbol("18004") => BadRequest,
            Symbol("18005") => BadRequest,
            Symbol("18006") => BadRequest,
            Symbol("18007") => BadRequest,
            Symbol("19000") => BadRequest
        ),
        Symbol("broad") => Dict{Symbol, Any}()
    ),
    Symbol("precisionMode") => TICK_SIZE,
    Symbol("commonCurrencies") => Dict{Symbol, Any}(),
    Symbol("options") => Dict{Symbol, Any}(
        Symbol("deriveWalletAddress") => "",
        Symbol("id") => "0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749"
    )
))

end
function setSandboxMode(self::Derive, enable)
    setSandboxMode(self.parent, enable);
    self.options[Symbol("sandboxMode")] = enable;

end
function fetchTime(self::Derive, params=Dict())
    response = Base.fetch(self.publicPostGetTime(params));
    return safeInteger(response, "result")

end
function fetchCurrencies(self::Derive, params=Dict())
    tokenResponse = Base.fetch(self.publicGetGetAllCurrencies(params));
    currencies = self.safeList(tokenResponse, "result", []);
    return self.parseCurrencies(currencies)

end
function parseCurrency(self::Derive, rawCurrency)
    currencyId = safeString(rawCurrency, "currency");
    code = self.safeCurrencyCode(currencyId);
    return self.safeCurrencyStructure(Dict{Symbol, Any}(
    Symbol("id") => currencyId,
    Symbol("name") => nothing,
    Symbol("code") => code,
    Symbol("precision") => nothing,
    Symbol("active") => nothing,
    Symbol("fee") => nothing,
    Symbol("networks") => nothing,
    Symbol("deposit") => nothing,
    Symbol("withdraw") => nothing,
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("deposit") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("withdraw") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("info") => rawCurrency
))

end
function fetchMarkets(self::Derive, params=Dict())
    spotMarketsPromise = self.fetchSpotMarkets(params);
    swapMarketsPromise = self.fetchSwapMarkets(params);
    optionMarketsPromise = self.fetchOptionMarkets(params);
    (spotMarkets, swapMarkets, optionMarkets) = (Base.fetch(asyncmap(Base.fetch, [spotMarketsPromise, swapMarketsPromise, optionMarketsPromise])));
    result = arrayConcat(spotMarkets, swapMarkets);
    result = arrayConcat(result, optionMarkets);
    return result

end
function fetchSpotMarkets(self::Derive, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("expired") => false,
        Symbol("instrument_type") => "erc20"
    );
    response = Base.fetch(self.publicPostGetAllInstruments(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "instruments", []);
    return self.parseMarkets(data)

end
function fetchSwapMarkets(self::Derive, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("expired") => false,
        Symbol("instrument_type") => "perp"
    );
    response = Base.fetch(self.publicPostGetAllInstruments(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "instruments", []);
    return self.parseMarkets(data)

end
function fetchOptionMarkets(self::Derive, params=Dict())
    request = Dict{Symbol, Any}(
        Symbol("expired") => false,
        Symbol("instrument_type") => "option"
    );
    response = Base.fetch(self.publicPostGetAllInstruments(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "instruments", []);
    return self.parseMarkets(data)

end
function parseMarket(self::Derive, market)
    type_var = safeString(market, "instrument_type");
    marketType = nothing;
    spot = false;
    margin = true;
    swap = false;
    option = false;
    linear = nothing;
    inverse = nothing;
    baseId = safeString(market, "base_currency");
    quoteId = safeString(market, "quote_currency");
    base = self.safeCurrencyCode(baseId);
    quote_var = self.safeCurrencyCode(quoteId);
    marketId = safeString(market, "instrument_name");
    symbol = string(base, "/", quote_var);
    settleId = nothing;
    settle = nothing;
    expiry = nothing;
    strike = nothing;
    optionType = nothing;
    optionLetter = nothing;
    if functions.ccxtruthy(type_var == "erc20")
        spot = true;
        marketType = "spot";
    elseif functions.ccxtruthy(type_var == "perp")
        margin = false;
        settleId = "USDC";
        settle = self.safeCurrencyCode(settleId);
        symbol = string(base, "/", quote_var, ":", settle);
        swap = true;
        linear = true;
        inverse = false;
        marketType = "swap";
    else
        if functions.ccxtruthy(type_var == "option")
            settleId = "USDC";
            settle = self.safeCurrencyCode(settleId);
            margin = false;
            option = true;
            marketType = "option";
            optionDetails = self.safeDict(market, "option_details");
            expiry = safeTimestamp(optionDetails, "expiry");
            strike = safeInteger(optionDetails, "strike");
            optionLetter = safeString(optionDetails, "option_type");
            symbol = string(base, "/", quote_var, ":", settle, "-", self.yymmdd(expiry), "-", numberToString(strike), "-", optionLetter);
            if functions.ccxtruthy(optionLetter == "P")
                optionType = "put";
            else
                optionType = "call";
            end
            linear = true;
            inverse = false;
        end

    end
    contractSize = functions.ccxtruthy((spot)) ? nothing : 1;
    isContract = (@functions.ccxt_or(swap, option));
    return self.safeMarketStructure(Dict{Symbol, Any}(
    Symbol("id") => marketId,
    Symbol("symbol") => symbol,
    Symbol("base") => base,
    Symbol("quote") => quote_var,
    Symbol("settle") => settle,
    Symbol("baseId") => baseId,
    Symbol("quoteId") => quoteId,
    Symbol("settleId") => settleId,
    Symbol("type") => marketType,
    Symbol("spot") => spot,
    Symbol("margin") => margin,
    Symbol("swap") => swap,
    Symbol("future") => false,
    Symbol("option") => option,
    Symbol("active") => self.safeBool(market, "is_active"),
    Symbol("contract") => isContract,
    Symbol("linear") => linear,
    Symbol("inverse") => inverse,
    Symbol("contractSize") => contractSize,
    Symbol("expiry") => expiry,
    Symbol("expiryDatetime") => self.iso8601(expiry),
    Symbol("taker") => self.safeNumber(market, "taker_fee_rate"),
    Symbol("maker") => self.safeNumber(market, "maker_fee_rate"),
    Symbol("strike") => strike,
    Symbol("optionType") => optionType,
    Symbol("precision") => Dict{Symbol, Any}(
        Symbol("amount") => self.safeNumber(market, "amount_step"),
        Symbol("price") => self.safeNumber(market, "tick_size")
    ),
    Symbol("limits") => Dict{Symbol, Any}(
        Symbol("leverage") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("amount") => Dict{Symbol, Any}(
            Symbol("min") => self.safeNumber(market, "minimum_amount"),
            Symbol("max") => self.safeNumber(market, "maximum_amount")
        ),
        Symbol("price") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        ),
        Symbol("cost") => Dict{Symbol, Any}(
            Symbol("min") => nothing,
            Symbol("max") => nothing
        )
    ),
    Symbol("created") => nothing,
    Symbol("info") => market
))

end
function fetchTicker(self::Derive, symbol, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    response = Base.fetch(self.publicPostGetTicker(extend(request, params)));
    data = self.safeDict(response, "result", Dict{Symbol, Any}());
    return self.parseTicker(data, market)

end
function parseTicker(self::Derive, ticker, market=nothing)
    marketId = safeString(ticker, "instrument_name");
    timestamp = self.safeIntegerOmitZero(ticker, "timestamp");
    symbol = self.safeSymbol(marketId, market);
    stats = self.safeDict(ticker, "stats");
    change = safeString(stats, "percent_change");
    return self.safeTicker(Dict{Symbol, Any}(
    Symbol("symbol") => symbol,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("high") => safeString(stats, "high"),
    Symbol("low") => safeString(stats, "low"),
    Symbol("bid") => safeString(ticker, "best_bid_price"),
    Symbol("bidVolume") => safeString(ticker, "best_bid_amount"),
    Symbol("ask") => safeString(ticker, "best_ask_price"),
    Symbol("askVolume") => safeString(ticker, "best_ask_amount"),
    Symbol("vwap") => nothing,
    Symbol("open") => nothing,
    Symbol("close") => nothing,
    Symbol("last") => nothing,
    Symbol("previousClose") => nothing,
    Symbol("change") => change,
    Symbol("percentage") => stringMul(change, "100"),
    Symbol("average") => nothing,
    Symbol("baseVolume") => nothing,
    Symbol("quoteVolume") => nothing,
    Symbol("indexPrice") => safeString(ticker, "index_price"),
    Symbol("markPrice") => safeString(ticker, "mark_price"),
    Symbol("info") => ticker
), market)

end
function fetchTrades(self::Derive, symbol, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    request = Dict{Symbol, Any}();
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        if functions.ccxtruthy(functions.ccxt_gt(limit, 1000))
            limit = 1000;
        end
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from_timestamp")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("to_timestamp")] = until;
    end
    response = Base.fetch(self.publicPostGetTradeHistory(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "trades", []);
    return self.parseTrades(data, market, since, limit)

end
function parseTrade(self::Derive, trade, market=nothing)
    marketId = safeString(trade, "instrument_name");
    symbol = self.safeSymbol(marketId, market);
    timestamp = safeInteger(trade, "timestamp");
    fee = Dict{Symbol, Any}(
        Symbol("currency") => "USDC",
        Symbol("cost") => safeString(trade, "trade_fee")
    );
    return self.safeTrade(Dict{Symbol, Any}(
    Symbol("info") => trade,
    Symbol("id") => safeString(trade, "trade_id"),
    Symbol("order") => safeString(trade, "order_id"),
    Symbol("symbol") => symbol,
    Symbol("side") => safeStringLower(trade, "direction"),
    Symbol("type") => nothing,
    Symbol("takerOrMaker") => safeString(trade, "liquidity_role"),
    Symbol("price") => safeString(trade, "trade_price"),
    Symbol("amount") => safeString(trade, "trade_amount"),
    Symbol("cost") => nothing,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("fee") => fee
), market)

end
function fetchFundingRateHistory(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing)
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    until = safeInteger(params, "until");
    params = omit(params, ["until"]);
    if functions.ccxtruthy(until != nothing)
        request[Symbol("to_timestamp")] = until;
    end
    response = Base.fetch(self.publicPostGetFundingRateHistory(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    data = self.safeList(result, "funding_rate_history", []);
    rates = [];
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(data)))
        entry = get(data, i + 1, nothing);
        timestamp = safeInteger(entry, "timestamp");
        push!(rates, Dict{Symbol, Any}(
    Symbol("info") => entry,
    Symbol("symbol") => get(market, Symbol("symbol"), nothing),
    Symbol("fundingRate") => self.safeNumber(entry, "funding_rate"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp)
));
        i += 1
    end
    sorted = sortBy(rates, "timestamp");
    return self.filterBySymbolSinceLimit(sorted, get(market, Symbol("symbol"), nothing), since, limit)

end
function fetchFundingRate(self::Derive, symbol, params=Dict())
    response = Base.fetch(self.fetchFundingRateHistory(symbol, nothing, 1, params));
    data = self.safeDict(response, 0);
    return self.parseFundingRate(data)

end
function parseFundingRate(self::Derive, contract, market=nothing)
    symbol = safeString(contract, "symbol");
    fundingTimestamp = safeInteger(contract, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => contract,
    Symbol("symbol") => symbol,
    Symbol("markPrice") => nothing,
    Symbol("indexPrice") => nothing,
    Symbol("interestRate") => nothing,
    Symbol("estimatedSettlePrice") => nothing,
    Symbol("timestamp") => nothing,
    Symbol("datetime") => nothing,
    Symbol("fundingRate") => self.safeNumber(contract, "fundingRate"),
    Symbol("fundingTimestamp") => fundingTimestamp,
    Symbol("fundingDatetime") => self.iso8601(fundingTimestamp),
    Symbol("nextFundingRate") => nothing,
    Symbol("nextFundingTimestamp") => nothing,
    Symbol("nextFundingDatetime") => nothing,
    Symbol("previousFundingRate") => nothing,
    Symbol("previousFundingTimestamp") => nothing,
    Symbol("previousFundingDatetime") => nothing,
    Symbol("interval") => nothing
)

end
function hashOrderMessage(self::Derive, order)
    accountHash = hash(self.ethAbiEncode(["bytes32", "uint256", "uint256", "address", "bytes32", "uint256", "address", "address"], order), keccak, "binary");
    sandboxMode = self.safeBool(self.options, "sandboxMode", false);
    DOMAIN_SEPARATOR = functions.ccxtruthy((sandboxMode)) ? "9bcf4dc06df5d8bf23af818d5716491b995020f377d3b7b64c29ed14e3dd1105" : "d96e5f90797da7ec8dc4e276260c7f3f87fedf68775fbe1ef116e996fc60441b";
    binaryDomainSeparator = self.base16ToBinary(DOMAIN_SEPARATOR);
    prefix = self.base16ToBinary("1901");
    return hash(binaryConcat(prefix, binaryDomainSeparator, accountHash), keccak, "hex")

end
function signOrder(self::Derive, order, privateKey)
    hashOrder = self.hashOrderMessage(order);
    return self.signHash(hashOrder[-64 + 1:end], privateKey[-64 + 1:end])

end
function hashMessage(self::Derive, message)
    binaryMessage = self.encode(message);
    binaryMessageLength = self.binaryLength(binaryMessage);
    x19 = self.base16ToBinary("19");
    newline = self.base16ToBinary("0a");
    prefix = binaryConcat(x19, self.encode("Ethereum Signed Message:"), newline, self.encode(numberToString(binaryMessageLength)));
    return string("0x", hash(binaryConcat(prefix, binaryMessage), keccak, "hex"))

end
function signHash(self::Derive, hash, privateKey)
    self.checkRequiredCredentials();
    signature = ecdsa(hash[-64 + 1:end], privateKey[-64 + 1:end], secp256k1, nothing);
    r = get(signature, Symbol("r"), nothing);
    s = get(signature, Symbol("s"), nothing);
    v = self.intToBase16(self.sum(27, get(signature, Symbol("v"), nothing)));
    return string("0x", lpad(r, 64, "0"), lpad(s, 64, "0"), v)

end
function signMessage(self::Derive, message, privateKey)
    return self.signHash(self.hashMessage(message), privateKey[-64 + 1:end])

end
function parseUnits(self::Derive, num, dec="1000000000000000000")
    return stringMul(num, dec)

end
function createOrder(self::Derive, symbol, type_var, side, amount, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    if functions.ccxtruthy(price == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a price argument")));
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("createOrder", params);
    test = self.safeBool(params, "test", false);
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    timeInForce = safeStringLower2(params, "timeInForce", "time_in_force");
    postOnly = self.safeBool(params, "postOnly");
    orderType = lowercase(type_var);
    orderSide = lowercase(side);
    nonce = milliseconds();
    signatureExpiry = safeInteger(params, "signature_expiry_sec", seconds() + 7776000);
    ACTION_TYPEHASH = self.base16ToBinary("4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17");
    sandboxMode = self.safeBool(self.options, "sandboxMode", false);
    TRADE_MODULE_ADDRESS = functions.ccxtruthy((sandboxMode)) ? "0x87F2863866D85E3192a35A73b388BD625D83f2be" : "0xB8D20c2B7a1Ad2EE33Bc50eF10876eD3035b5e7b";
    priceString = numberToString(price);
    maxFee = nothing;
    (maxFee, params) = self.handleOptionAndParams(params, "createOrder", "max_fee");
    if functions.ccxtruthy(maxFee == nothing)
        throw(ArgumentsRequired(string(self.id, " createOrder() requires a max_fee argument in params")));
    end
    maxFeeString = numberToString(maxFee);
    amountString = numberToString(amount);
    tradeModuleDataHash = hash(self.ethAbiEncode(["address", "uint", "int", "int", "uint", "uint", "bool"], [get(get(market, Symbol("info"), nothing), Symbol("base_asset_address"), nothing), self.parseToNumeric(get(get(market, Symbol("info"), nothing), Symbol("base_asset_sub_id"), nothing)), self.convertToBigInt(self.parseUnits(priceString)), self.convertToBigInt(self.parseUnits(self.amountToPrecision(symbol, amountString))), self.convertToBigInt(self.parseUnits(maxFeeString)), subaccountId, orderSide == "buy"]), keccak, "binary");
    deriveWalletAddress = nothing;
    (deriveWalletAddress, params) = self.handleDeriveWalletAddress("createOrder", params);
    signature = self.signOrder([ACTION_TYPEHASH, subaccountId, nonce, TRADE_MODULE_ADDRESS, tradeModuleDataHash, signatureExpiry, deriveWalletAddress, self.walletAddress], self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("direction") => orderSide,
        Symbol("order_type") => orderType,
        Symbol("nonce") => nonce,
        Symbol("amount") => amountString,
        Symbol("limit_price") => priceString,
        Symbol("max_fee") => maxFeeString,
        Symbol("subaccount_id") => subaccountId,
        Symbol("signature_expiry_sec") => signatureExpiry,
        Symbol("referral_code") => safeString(self.options, "id", "0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749"),
        Symbol("signer") => self.walletAddress
    );
    if functions.ccxtruthy(reduceOnly != nothing)
        request[Symbol("reduce_only")] = reduceOnly;
        if functions.ccxtruthy(@functions.ccxt_and(reduceOnly, postOnly))
            throw(InvalidOrder(string(self.id, " cannot use reduce only with post only time in force")));
        end
    end
    if functions.ccxtruthy(postOnly != nothing)
        request[Symbol("time_in_force")] = "post_only";
    elseif functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("time_in_force")] = timeInForce;
    end
    stopLoss = safeValue(params, "stopLoss");
    takeProfit = safeValue(params, "takeProfit");
    triggerPriceType = safeString(params, "trigger_price_type", "mark");
    if functions.ccxtruthy(stopLoss != nothing)
        stopLossPrice = safeString(stopLoss, "triggerPrice", stopLoss);
        request[Symbol("trigger_price")] = stopLossPrice;
        request[Symbol("trigger_type")] = "stoploss";
        request[Symbol("trigger_price_type")] = triggerPriceType;
    elseif functions.ccxtruthy(takeProfit != nothing)
        takeProfitPrice = safeString(takeProfit, "triggerPrice", takeProfit);
        request[Symbol("trigger_price")] = takeProfitPrice;
        request[Symbol("trigger_type")] = "takeprofit";
        request[Symbol("trigger_price_type")] = triggerPriceType;
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("label")] = clientOrderId;
    end
    request[Symbol("signature")] = signature;
    params = omit(params, ["reduceOnly", "reduce_only", "timeInForce", "time_in_force", "postOnly", "test", "clientOrderId", "stopPrice", "triggerPrice", "trigger_price", "stopLoss", "takeProfit", "trigger_price_type"]);
    if functions.ccxtruthy(test)
        response = Base.fetch(self.privatePostOrderDebug(extend(request, params)));
    else
        response = Base.fetch(self.privatePostOrder(extend(request, params)));
    end
    result = self.safeDict(response, "result");
    rawOrder = self.safeDict(result, "raw_data");
    if functions.ccxtruthy(rawOrder == nothing)
        rawOrder = self.safeDict(result, "order", Dict{Symbol, Any}());
    end
    order = self.parseOrder(rawOrder, market);
    order[Symbol("type")] = type_var;
    return order

end
function editOrder(self::Derive, id, symbol, type_var, side, amount=nothing, price=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("editOrder", params);
    reduceOnly = self.safeBool2(params, "reduceOnly", "reduce_only");
    timeInForce = safeStringLower2(params, "timeInForce", "time_in_force");
    postOnly = self.safeBool(params, "postOnly");
    orderType = lowercase(type_var);
    orderSide = lowercase(side);
    nonce = milliseconds();
    signatureExpiry = self.safeNumber(params, "signature_expiry_sec", seconds() + 7776000);
    ACTION_TYPEHASH = self.base16ToBinary("4d7a9f27c403ff9c0f19bce61d76d82f9aa29f8d6d4b0c5474607d9770d1af17");
    sandboxMode = self.safeBool(self.options, "sandboxMode", false);
    TRADE_MODULE_ADDRESS = functions.ccxtruthy((sandboxMode)) ? "0x87F2863866D85E3192a35A73b388BD625D83f2be" : "0xB8D20c2B7a1Ad2EE33Bc50eF10876eD3035b5e7b";
    priceString = numberToString(price);
    maxFeeString = safeString(params, "max_fee", "0");
    amountString = numberToString(amount);
    tradeModuleDataHash = hash(self.ethAbiEncode(["address", "uint", "int", "int", "uint", "uint", "bool"], [get(get(market, Symbol("info"), nothing), Symbol("base_asset_address"), nothing), self.parseToNumeric(get(get(market, Symbol("info"), nothing), Symbol("base_asset_sub_id"), nothing)), self.convertToBigInt(self.parseUnits(priceString)), self.convertToBigInt(self.parseUnits(self.amountToPrecision(symbol, amountString))), self.convertToBigInt(self.parseUnits(maxFeeString)), subaccountId, orderSide == "buy"]), keccak, "binary");
    deriveWalletAddress = nothing;
    (deriveWalletAddress, params) = self.handleDeriveWalletAddress("editOrder", params);
    signature = self.signOrder([ACTION_TYPEHASH, subaccountId, nonce, TRADE_MODULE_ADDRESS, tradeModuleDataHash, signatureExpiry, deriveWalletAddress, self.walletAddress], self.privateKey);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("order_id_to_cancel") => id,
        Symbol("direction") => orderSide,
        Symbol("order_type") => orderType,
        Symbol("nonce") => nonce,
        Symbol("amount") => amountString,
        Symbol("limit_price") => priceString,
        Symbol("max_fee") => maxFeeString,
        Symbol("subaccount_id") => subaccountId,
        Symbol("signature_expiry_sec") => signatureExpiry,
        Symbol("signer") => self.walletAddress
    );
    if functions.ccxtruthy(reduceOnly != nothing)
        request[Symbol("reduce_only")] = reduceOnly;
        if functions.ccxtruthy(@functions.ccxt_and(reduceOnly, postOnly))
            throw(InvalidOrder(string(self.id, " cannot use reduce only with post only time in force")));
        end
    end
    if functions.ccxtruthy(postOnly != nothing)
        request[Symbol("time_in_force")] = "post_only";
    elseif functions.ccxtruthy(timeInForce != nothing)
        request[Symbol("time_in_force")] = timeInForce;
    end
    clientOrderId = safeString(params, "clientOrderId");
    if functions.ccxtruthy(clientOrderId != nothing)
        request[Symbol("label")] = clientOrderId;
    end
    request[Symbol("signature")] = signature;
    params = omit(params, ["reduceOnly", "reduce_only", "timeInForce", "time_in_force", "postOnly", "clientOrderId"]);
    response = Base.fetch(self.privatePostReplace(extend(request, params)));
    result = self.safeDict(response, "result");
    rawOrder = self.safeDict(result, "order", Dict{Symbol, Any}());
    order = self.parseOrder(rawOrder, market);
    return order

end
function cancelOrder(self::Derive, id, symbol=nothing, params=Dict())
    if functions.ccxtruthy(symbol == nothing)
        throw(ArgumentsRequired(string(self.id, " cancelOrder() requires a symbol argument")));
    end
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = self.market(symbol);
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("cancelOrder", params);
    params = omit(params, ["trigger", "stop"]);
    request = Dict{Symbol, Any}(
        Symbol("instrument_name") => get(market, Symbol("id"), nothing),
        Symbol("subaccount_id") => subaccountId
    );
    clientOrderIdUnified = safeString(params, "clientOrderId");
    clientOrderIdExchangeSpecific = safeString(params, "label", clientOrderIdUnified);
    isByClientOrder = clientOrderIdExchangeSpecific != nothing;
    if functions.ccxtruthy(isByClientOrder)
        request[Symbol("label")] = clientOrderIdExchangeSpecific;
        params = omit(params, ["clientOrderId", "label"]);
        response = Base.fetch(self.privatePostCancelByLabel(extend(request, params)));
    else
        request[Symbol("order_id")] = id;
        if functions.ccxtruthy(isTrigger)
            response = Base.fetch(self.privatePostCancelTriggerOrder(extend(request, params)));
        else
            response = Base.fetch(self.privatePostCancel(extend(request, params)));
        end
    end
    extendParams = Dict{Symbol, Any}(
        Symbol("symbol") => symbol
    );
    order = self.safeDict(response, "result", Dict{Symbol, Any}());
    if functions.ccxtruthy(isByClientOrder)
        extendParams[Symbol("client_order_id")] = clientOrderIdExchangeSpecific;
    end
    return extend(self.parseOrder(order, market), extendParams)

end
function cancelAllOrders(self::Derive, symbol=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("cancelAllOrders", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    if functions.ccxtruthy(market != nothing)
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
        response = Base.fetch(self.privatePostCancelByInstrument(extend(request, params)));
    else
        response = Base.fetch(self.privatePostCancelAll(extend(request, params)));
    end
    return [self.safeOrder(Dict{Symbol, Any}(
    Symbol("info") => response
))]

end
function fetchOrders(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchOrders", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchOrders", symbol, since, limit, params, "page", 500))
    end
    isTrigger = self.safeBool2(params, "trigger", "stop", false);
    params = omit(params, ["trigger", "stop"]);
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchOrders", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    else
        request[Symbol("page_size")] = 500;
    end
    if functions.ccxtruthy(isTrigger)
        request[Symbol("status")] = "untriggered";
    end
    response = Base.fetch(self.privatePostGetOrders(extend(request, params)));
    data = safeValue(response, "result");
    page = safeInteger(params, "page");
    if functions.ccxtruthy(page != nothing)
        pagination = self.safeDict(data, "pagination");
        currentPage = safeInteger(pagination, "num_pages", 0);
        if functions.ccxtruthy(functions.ccxt_gt(page, currentPage))
                return []
        end
    end
    orders = self.safeList(data, "orders", []);
    return self.parseOrders(orders, market, since, limit)

end
function fetchOpenOrders(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "open"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function fetchClosedOrders(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "filled"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function fetchCanceledOrders(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    extendedParams = extend(params, Dict{Symbol, Any}(
        Symbol("status") => "cancelled"
    ));
    return Base.fetch(self.fetchOrders(symbol, since, limit, extendedParams))

end
function parseTimeInForce(self::Derive, timeInForce)
    timeInForces = Dict{Symbol, Any}(
        Symbol("ioc") => "IOC",
        Symbol("fok") => "FOK",
        Symbol("gtc") => "GTC",
        Symbol("post_only") => "PO"
    );
    return safeString(timeInForces, timeInForce)

end
function parseOrderStatus(self::Derive, status)
    if functions.ccxtruthy(status != nothing)
        statuses = Dict{Symbol, Any}(
            Symbol("open") => "open",
            Symbol("untriggered") => "open",
            Symbol("filled") => "closed",
            Symbol("cancelled") => "canceled",
            Symbol("expired") => "rejected"
        );
            return safeString(statuses, status, status)
    end
    return status

end
function parseOrder(self::Derive, rawOrder, market=nothing)
    order = self.safeDict(rawOrder, "data");
    if functions.ccxtruthy(order == nothing)
        order = rawOrder;
    end
    timestamp = safeInteger2(rawOrder, "creation_timestamp", "nonce");
    orderId = safeString(order, "order_id");
    marketId = safeString(order, "instrument_name");
    if functions.ccxtruthy(marketId != nothing)
        market = self.safeMarket(marketId, market);
    end
    symbol = safeString(market, "symbol");
    price = safeString(order, "limit_price");
    average = safeString(order, "average_price");
    amount = safeString(order, "desired_amount");
    filled = safeString(order, "filled_amount");
    fee = safeString(order, "order_fee");
    orderType = safeStringLower(order, "order_type");
    isBid = self.safeBool(order, "is_bid");
    side = safeString(order, "direction");
    if functions.ccxtruthy(side == nothing)
        if functions.ccxtruthy(isBid)
            side = "buy";
        else
            side = "sell";
        end
    end
    triggerType = safeString(order, "trigger_type");
    stopLossPrice = nothing;
    takeProfitPrice = nothing;
    triggerPrice = nothing;
    if functions.ccxtruthy(triggerType != nothing)
        triggerPrice = safeString(order, "trigger_price");
        if functions.ccxtruthy(triggerType == "stoploss")
            stopLossPrice = triggerPrice;
        else
            takeProfitPrice = triggerPrice;
        end
    end
    lastUpdateTimestamp = safeInteger(rawOrder, "last_update_timestamp");
    status = safeString(order, "order_status");
    timeInForce = safeString(order, "time_in_force");
    return self.safeOrder(Dict{Symbol, Any}(
    Symbol("id") => orderId,
    Symbol("clientOrderId") => safeString(order, "label"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastTradeTimestamp") => nothing,
    Symbol("lastUpdateTimestamp") => lastUpdateTimestamp,
    Symbol("status") => self.parseOrderStatus(status),
    Symbol("symbol") => symbol,
    Symbol("type") => orderType,
    Symbol("timeInForce") => self.parseTimeInForce(timeInForce),
    Symbol("postOnly") => nothing,
    Symbol("reduceOnly") => self.safeBool(order, "reduce_only"),
    Symbol("side") => side,
    Symbol("price") => price,
    Symbol("triggerPrice") => triggerPrice,
    Symbol("takeProfitPrice") => takeProfitPrice,
    Symbol("stopLossPrice") => stopLossPrice,
    Symbol("average") => average,
    Symbol("amount") => amount,
    Symbol("filled") => filled,
    Symbol("remaining") => nothing,
    Symbol("cost") => nothing,
    Symbol("trades") => nothing,
    Symbol("fee") => Dict{Symbol, Any}(
        Symbol("cost") => fee,
        Symbol("currency") => "USDC"
    ),
    Symbol("info") => order
), market)

end
function fetchOrderTrades(self::Derive, id, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchOrderTrades", params);
    request = Dict{Symbol, Any}(
        Symbol("order_id") => id,
        Symbol("subaccount_id") => subaccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from_timestamp")] = since;
    end
    response = Base.fetch(self.privatePostGetTradeHistory(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    trades = self.safeList(result, "trades", []);
    return self.parseTrades(trades, market, since, limit, params)

end
function fetchMyTrades(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchMyTrades", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchMyTrades", symbol, since, limit, params, "page", 500))
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchMyTrades", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("from_timestamp")] = since;
    end
    response = Base.fetch(self.privatePostGetTradeHistory(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    page = safeInteger(params, "page");
    if functions.ccxtruthy(page != nothing)
        pagination = self.safeDict(result, "pagination");
        currentPage = safeInteger(pagination, "num_pages", 0);
        if functions.ccxtruthy(functions.ccxt_gt(page, currentPage))
                return []
        end
    end
    trades = self.safeList(result, "trades", []);
    return self.parseTrades(trades, market, since, limit, params)

end
function fetchPositions(self::Derive, symbols=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchPositions", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    params = omit(params, ["subaccount_id"]);
    response = Base.fetch(self.privatePostGetPositions(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    positions = self.safeList(result, "positions", []);
    return self.parsePositions(positions, symbols)

end
function parsePosition(self::Derive, position, market=nothing)
    contract = safeString(position, "instrument_name");
    market = self.safeMarket(contract, market);
    size_var = safeString(position, "amount");
    side = nothing;
    if functions.ccxtruthy(stringGt(size_var, "0"))
        side = "long";
    else
        side = "short";
    end
    contractSize = safeString(market, "contractSize");
    markPrice = safeString(position, "mark_price");
    timestamp = safeInteger(position, "creation_timestamp");
    unrealisedPnl = safeString(position, "unrealized_pnl");
    size_var = stringAbs(size_var);
    notional = stringMul(size_var, markPrice);
    return self.safePosition(Dict{Symbol, Any}(
    Symbol("info") => position,
    Symbol("id") => nothing,
    Symbol("symbol") => safeString(market, "symbol"),
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("lastUpdateTimestamp") => nothing,
    Symbol("initialMargin") => safeString(position, "initial_margin"),
    Symbol("initialMarginPercentage") => nothing,
    Symbol("maintenanceMargin") => safeString(position, "maintenance_margin"),
    Symbol("maintenanceMarginPercentage") => nothing,
    Symbol("entryPrice") => nothing,
    Symbol("notional") => self.parseNumber(notional),
    Symbol("leverage") => self.safeNumber(position, "leverage"),
    Symbol("unrealizedPnl") => self.parseNumber(unrealisedPnl),
    Symbol("contracts") => self.parseNumber(size_var),
    Symbol("contractSize") => self.parseNumber(contractSize),
    Symbol("marginRatio") => nothing,
    Symbol("liquidationPrice") => self.safeNumber(position, "liquidation_price"),
    Symbol("markPrice") => self.parseNumber(markPrice),
    Symbol("lastPrice") => nothing,
    Symbol("collateral") => nothing,
    Symbol("marginMode") => nothing,
    Symbol("side") => side,
    Symbol("percentage") => nothing,
    Symbol("hedged") => nothing,
    Symbol("stopLossPrice") => nothing,
    Symbol("takeProfitPrice") => nothing
))

end
function fetchFundingHistory(self::Derive, symbol=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    paginate = false;
    (paginate, params) = self.handleOptionAndParams(params, "fetchFundingHistory", "paginate");
    if functions.ccxtruthy(paginate)
            return Base.fetch(self.fetchPaginatedCallIncremental("fetchFundingHistory", symbol, since, limit, params, "page", 500))
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchFundingHistory", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    market = nothing;
    if functions.ccxtruthy(symbol != nothing)
        market = self.market(symbol);
        request[Symbol("instrument_name")] = get(market, Symbol("id"), nothing);
    end
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    if functions.ccxtruthy(limit != nothing)
        request[Symbol("page_size")] = limit;
    end
    response = Base.fetch(self.privatePostGetFundingHistory(extend(request, params)));
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    page = safeInteger(params, "page");
    if functions.ccxtruthy(page != nothing)
        pagination = self.safeDict(result, "pagination");
        currentPage = safeInteger(pagination, "num_pages", 0);
        if functions.ccxtruthy(functions.ccxt_gt(page, currentPage))
                return []
        end
    end
    events = self.safeList(result, "events", []);
    return self.parseIncomes(events, market, since, limit)

end
function parseIncome(self::Derive, income, market=nothing)
    marketId = safeString(income, "instrument_name");
    symbol = self.safeSymbol(marketId, market);
    rate = safeString(income, "funding");
    code = self.safeCurrencyCode("USDC");
    timestamp = safeInteger(income, "timestamp");
    return Dict{Symbol, Any}(
    Symbol("info") => income,
    Symbol("symbol") => symbol,
    Symbol("code") => code,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("id") => nothing,
    Symbol("amount") => nothing,
    Symbol("rate") => rate
)

end
function fetchBalance(self::Derive, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    deriveWalletAddress = nothing;
    (deriveWalletAddress, params) = self.handleDeriveWalletAddress("fetchBalance", params);
    request = Dict{Symbol, Any}(
        Symbol("wallet") => deriveWalletAddress
    );
    response = Base.fetch(self.privatePostGetAllPortfolios(extend(request, params)));
    result = self.safeList(response, "result");
    return self.parseBalance(result)

end
function parseBalance(self::Derive, response)
    result = Dict{Symbol, Any}(
        Symbol("info") => response
    );
    i = 0
    while functions.ccxtruthy(functions.ccxt_lt(i, length(response)))
        subaccount = get(response, i + 1, nothing);
        collaterals = self.safeList(subaccount, "collaterals", []);
        j = 0
        while functions.ccxtruthy(functions.ccxt_lt(j, length(collaterals)))
            balance = get(collaterals, j + 1, nothing);
            code = self.safeCurrencyCode(safeString(balance, "currency"));
            account = self.safeDict(result, code);
            if functions.ccxtruthy(account == nothing)
                account = self.account();
                account[Symbol("total")] = safeString(balance, "amount");
            else
                amount = safeString(balance, "amount");
                account[Symbol("total")] = stringAdd(get(account, Symbol("total"), nothing), amount);
            end
            result[Symbol(code)] = account;
            j += 1
        end
        i += 1
    end
    return self.safeBalance(result)

end
function fetchDeposits(self::Derive, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchDeposits", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    response = Base.fetch(self.privatePostGetDepositHistory(extend(request, params)));
    currency = self.safeCurrency(code);
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    events = self.safeList(result, "events", []);
    return self.parseTransactions(events, currency, since, limit, params)

end
function fetchWithdrawals(self::Derive, code=nothing, since=nothing, limit=nothing, params=Dict())
    if functions.ccxtruthy(self.markets == nothing)
        Base.fetch(self.loadMarkets());
    end
    subaccountId = nothing;
    (subaccountId, params) = self.handleDeriveSubaccountId("fetchWithdrawals", params);
    request = Dict{Symbol, Any}(
        Symbol("subaccount_id") => subaccountId
    );
    if functions.ccxtruthy(since != nothing)
        request[Symbol("start_timestamp")] = since;
    end
    response = Base.fetch(self.privatePostGetWithdrawalHistory(extend(request, params)));
    currency = self.safeCurrency(code);
    result = self.safeDict(response, "result", Dict{Symbol, Any}());
    events = self.safeList(result, "events", []);
    return self.parseTransactions(events, currency, since, limit, params)

end
function parseTransaction(self::Derive, transaction, currency=nothing)
    code = safeString(transaction, "asset");
    timestamp = safeInteger(transaction, "timestamp");
    txId = safeString(transaction, "tx_hash");
    if functions.ccxtruthy(txId == "0x0")
        txId = nothing;
    end
    return Dict{Symbol, Any}(
    Symbol("info") => transaction,
    Symbol("id") => nothing,
    Symbol("txid") => txId,
    Symbol("timestamp") => timestamp,
    Symbol("datetime") => self.iso8601(timestamp),
    Symbol("address") => nothing,
    Symbol("addressFrom") => nothing,
    Symbol("addressTo") => nothing,
    Symbol("tag") => nothing,
    Symbol("tagFrom") => nothing,
    Symbol("tagTo") => nothing,
    Symbol("type") => nothing,
    Symbol("amount") => self.safeNumber(transaction, "amount"),
    Symbol("currency") => code,
    Symbol("status") => self.parseTransactionStatus(safeString(transaction, "tx_status")),
    Symbol("updated") => nothing,
    Symbol("comment") => nothing,
    Symbol("internal") => nothing,
    Symbol("fee") => nothing,
    Symbol("network") => nothing
)

end
function parseTransactionStatus(self::Derive, status)
    statuses = Dict{Symbol, Any}(
        Symbol("settled") => "ok",
        Symbol("reverted") => "failed"
    );
    return safeString(statuses, status, status)

end
function handleDeriveSubaccountId(self::Derive, methodName, params)
    derivesubAccountId = nothing;
    (derivesubAccountId, params) = self.handleOptionAndParams(params, methodName, "subaccount_id");
    if functions.ccxtruthy(@functions.ccxt_and((derivesubAccountId != nothing), (derivesubAccountId != "")))
        self.options[Symbol("subaccount_id")] = derivesubAccountId;
            return [derivesubAccountId, params]
    end
    optionsWallet = safeString(self.options, "subaccount_id");
    if functions.ccxtruthy(optionsWallet != nothing)
            return [optionsWallet, params]
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a subaccount_id parameter inside \'params\' or exchange.options[\'subaccount_id\']=ID.")));

end
function handleDeriveWalletAddress(self::Derive, methodName, params)
    deriveWalletAddress = nothing;
    (deriveWalletAddress, params) = self.handleOptionAndParams(params, methodName, "deriveWalletAddress");
    if functions.ccxtruthy(@functions.ccxt_and((deriveWalletAddress != nothing), (deriveWalletAddress != "")))
        self.options[Symbol("deriveWalletAddress")] = deriveWalletAddress;
            return [deriveWalletAddress, params]
    end
    optionsWallet = safeString(self.options, "deriveWalletAddress");
    if functions.ccxtruthy(optionsWallet != nothing)
            return [optionsWallet, params]
    end
    throw(ArgumentsRequired(string(self.id, " ", methodName, "() requires a deriveWalletAddress parameter inside \'params\' or exchange.options[\'deriveWalletAddress\'] = ADDRESS, the address can find in HOME => Developers tab.")));

end
function handleErrors(self::Derive, httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody)
    if functions.ccxtruthy(!functions.ccxtruthy(response))
            return nothing
    end
    error = self.safeDict(response, "error");
    if functions.ccxtruthy(error != nothing)
        errorCode = safeString(error, "code");
        feedback = string(self.id, " ", json(response));
        self.throwBroadlyMatchedException(get(self.exceptions, Symbol("broad"), nothing), body, feedback);
        self.throwExactlyMatchedException(get(self.exceptions, Symbol("exact"), nothing), errorCode, feedback);
        throw(ExchangeError(feedback));
    end
    return nothing

end
function sign(self::Derive, path, api="public", method="GET", params=Dict(), headers=nothing, body=nothing)
    url = string(get(get(self.urls, Symbol("api"), nothing), Symbol(api), nothing), "/", path);
    if functions.ccxtruthy(method == "POST")
        headers = Dict{Symbol, Any}(
            Symbol("Content-Type") => "application/json"
        );
        if functions.ccxtruthy(api == "private")
            now = string(milliseconds());
            signature = self.signMessage(now, self.privateKey);
            headers[Symbol("X-LyraWallet")] = safeString(self.options, "deriveWalletAddress");
            headers[Symbol("X-LyraTimestamp")] = now;
            headers[Symbol("X-LyraSignature")] = signature;
        end
        body = json(params);
    end
    return Dict{Symbol, Any}(
    Symbol("url") => url,
    Symbol("method") => method,
    Symbol("body") => body,
    Symbol("headers") => headers
)

end

# Property resolution is shared by every generated exchange; see
# `ccxt_getproperty` in src/CCXTBase.jl for the lookup order.
Base.getproperty(self::Derive, name::Symbol) = ccxt_getproperty(self, name)

# Implicit REST endpoint methods (generated from describe().api)
function publicGetGetAllCurrencies(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_all_currencies", "public", "GET", params, nothing, nothing, Dict())
end

function publicPostBuildRegisterSessionKeyTx(self::Derive, params=Dict(), context=Dict())
    return request(self, "build_register_session_key_tx", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostRegisterSessionKey(self::Derive, params=Dict(), context=Dict())
    return request(self, "register_session_key", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostDeregisterSessionKey(self::Derive, params=Dict(), context=Dict())
    return request(self, "deregister_session_key", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostLogin(self::Derive, params=Dict(), context=Dict())
    return request(self, "login", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostStatistics(self::Derive, params=Dict(), context=Dict())
    return request(self, "statistics", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetAllCurrencies(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_all_currencies", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetCurrency(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_currency", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetInstrument(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_instrument", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetAllInstruments(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_all_instruments", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetInstruments(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_instruments", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetTicker(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_ticker", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetLatestSignedFeeds(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_latest_signed_feeds", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetOptionSettlementPrices(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_option_settlement_prices", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetSpotFeedHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_spot_feed_history", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetSpotFeedHistoryCandles(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_spot_feed_history_candles", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetFundingRateHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_funding_rate_history", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetTradeHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_trade_history", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetOptionSettlementHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_option_settlement_history", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetLiquidationHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_liquidation_history", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetInterestRateHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_interest_rate_history", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetTransaction(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_transaction", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetMargin(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_margin", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostMarginWatch(self::Derive, params=Dict(), context=Dict())
    return request(self, "margin_watch", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostValidateInviteCode(self::Derive, params=Dict(), context=Dict())
    return request(self, "validate_invite_code", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetPoints(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_points", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetAllPoints(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_all_points", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetPointsLeaderboard(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_points_leaderboard", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetDescendantTree(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_descendant_tree", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetTreeRoots(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_tree_roots", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetSwellPercentPoints(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_swell_percent_points", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetVaultAssets(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_vault_assets", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetEtherfiEffectiveBalances(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_etherfi_effective_balances", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetKelpEffectiveBalances(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_kelp_effective_balances", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetBridgeBalances(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_bridge_balances", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetEthenaParticipants(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_ethena_participants", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetVaultShare(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_vault_share", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetVaultStatistics(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_vault_statistics", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetVaultBalances(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_vault_balances", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostEstimateIntegratorPoints(self::Derive, params=Dict(), context=Dict())
    return request(self, "estimate_integrator_points", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostCreateSubaccountDebug(self::Derive, params=Dict(), context=Dict())
    return request(self, "create_subaccount_debug", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostDepositDebug(self::Derive, params=Dict(), context=Dict())
    return request(self, "deposit_debug", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostWithdrawDebug(self::Derive, params=Dict(), context=Dict())
    return request(self, "withdraw_debug", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostSendQuoteDebug(self::Derive, params=Dict(), context=Dict())
    return request(self, "send_quote_debug", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostExecuteQuoteDebug(self::Derive, params=Dict(), context=Dict())
    return request(self, "execute_quote_debug", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetInviteCode(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_invite_code", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostRegisterInvite(self::Derive, params=Dict(), context=Dict())
    return request(self, "register_invite", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetTime(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_time", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetLiveIncidents(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_live_incidents", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetMakerPrograms(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_maker_programs", "public", "POST", params, nothing, nothing, Dict())
end

function publicPostGetMakerProgramScores(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_maker_program_scores", "public", "POST", params, nothing, nothing, Dict())
end

function privatePostGetAccount(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_account", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCreateSubaccount(self::Derive, params=Dict(), context=Dict())
    return request(self, "create_subaccount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetSubaccount(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_subaccount", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetSubaccounts(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_subaccounts", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetAllPortfolios(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_all_portfolios", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostChangeSubaccountLabel(self::Derive, params=Dict(), context=Dict())
    return request(self, "change_subaccount_label", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetNotificationsv(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_notificationsv", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostUpdateNotifications(self::Derive, params=Dict(), context=Dict())
    return request(self, "update_notifications", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostDeposit(self::Derive, params=Dict(), context=Dict())
    return request(self, "deposit", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostWithdraw(self::Derive, params=Dict(), context=Dict())
    return request(self, "withdraw", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransferErc20(self::Derive, params=Dict(), context=Dict())
    return request(self, "transfer_erc20", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransferPosition(self::Derive, params=Dict(), context=Dict())
    return request(self, "transfer_position", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostTransferPositions(self::Derive, params=Dict(), context=Dict())
    return request(self, "transfer_positions", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrder(self::Derive, params=Dict(), context=Dict())
    return request(self, "order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostReplace(self::Derive, params=Dict(), context=Dict())
    return request(self, "replace", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostOrderDebug(self::Derive, params=Dict(), context=Dict())
    return request(self, "order_debug", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetOrder(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetOrders(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetOpenOrders(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_open_orders", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancel(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelByLabel(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_by_label", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelByNonce(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_by_nonce", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelByInstrument(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_by_instrument", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelAll(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_all", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelTriggerOrder(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_trigger_order", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetOrderHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_order_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetTradeHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_trade_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetDepositHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_deposit_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetWithdrawalHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_withdrawal_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSendRfq(self::Derive, params=Dict(), context=Dict())
    return request(self, "send_rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelRfq(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_rfq", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelBatchRfqs(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_batch_rfqs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetRfqs(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_rfqs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPollRfqs(self::Derive, params=Dict(), context=Dict())
    return request(self, "poll_rfqs", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSendQuote(self::Derive, params=Dict(), context=Dict())
    return request(self, "send_quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelQuote(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostCancelBatchQuotes(self::Derive, params=Dict(), context=Dict())
    return request(self, "cancel_batch_quotes", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetQuotes(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_quotes", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostPollQuotes(self::Derive, params=Dict(), context=Dict())
    return request(self, "poll_quotes", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExecuteQuote(self::Derive, params=Dict(), context=Dict())
    return request(self, "execute_quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRfqGetBestQuote(self::Derive, params=Dict(), context=Dict())
    return request(self, "rfq_get_best_quote", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetMargin(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_margin", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetCollaterals(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_collaterals", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetPositions(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_positions", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetOptionSettlementHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_option_settlement_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetSubaccountValueHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_subaccount_value_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostExpiredAndCancelledHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "expired_and_cancelled_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetFundingHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_funding_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetInterestHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_interest_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetErc20TransferHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_erc20_transfer_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetLiquidationHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_liquidation_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostLiquidate(self::Derive, params=Dict(), context=Dict())
    return request(self, "liquidate", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetLiquidatorHistory(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_liquidator_history", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSessionKeys(self::Derive, params=Dict(), context=Dict())
    return request(self, "session_keys", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostEditSessionKey(self::Derive, params=Dict(), context=Dict())
    return request(self, "edit_session_key", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRegisterScopedSessionKey(self::Derive, params=Dict(), context=Dict())
    return request(self, "register_scoped_session_key", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetMmpConfig(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_mmp_config", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSetMmpConfig(self::Derive, params=Dict(), context=Dict())
    return request(self, "set_mmp_config", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostResetMmp(self::Derive, params=Dict(), context=Dict())
    return request(self, "reset_mmp", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostSetCancelOnDisconnect(self::Derive, params=Dict(), context=Dict())
    return request(self, "set_cancel_on_disconnect", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostGetInviteCode(self::Derive, params=Dict(), context=Dict())
    return request(self, "get_invite_code", "private", "POST", params, nothing, nothing, Dict())
end

function privatePostRegisterInvite(self::Derive, params=Dict(), context=Dict())
    return request(self, "register_invite", "private", "POST", params, nothing, nothing, Dict())
end

function Derive(; kwargs...)
    inst = Derive(Exchange(), describe, setSandboxMode, fetchTime, fetchCurrencies, parseCurrency, fetchMarkets, fetchSpotMarkets, fetchSwapMarkets, fetchOptionMarkets, parseMarket, fetchTicker, parseTicker, fetchTrades, parseTrade, fetchFundingRateHistory, fetchFundingRate, parseFundingRate, hashOrderMessage, signOrder, hashMessage, signHash, signMessage, parseUnits, createOrder, editOrder, cancelOrder, cancelAllOrders, fetchOrders, fetchOpenOrders, fetchClosedOrders, fetchCanceledOrders, parseTimeInForce, parseOrderStatus, parseOrder, fetchOrderTrades, fetchMyTrades, fetchPositions, parsePosition, fetchFundingHistory, parseIncome, fetchBalance, parseBalance, fetchDeposits, fetchWithdrawals, parseTransaction, parseTransactionStatus, handleDeriveSubaccountId, handleDeriveWalletAddress, handleErrors, sign, publicGetGetAllCurrencies, publicPostBuildRegisterSessionKeyTx, publicPostRegisterSessionKey, publicPostDeregisterSessionKey, publicPostLogin, publicPostStatistics, publicPostGetAllCurrencies, publicPostGetCurrency, publicPostGetInstrument, publicPostGetAllInstruments, publicPostGetInstruments, publicPostGetTicker, publicPostGetLatestSignedFeeds, publicPostGetOptionSettlementPrices, publicPostGetSpotFeedHistory, publicPostGetSpotFeedHistoryCandles, publicPostGetFundingRateHistory, publicPostGetTradeHistory, publicPostGetOptionSettlementHistory, publicPostGetLiquidationHistory, publicPostGetInterestRateHistory, publicPostGetTransaction, publicPostGetMargin, publicPostMarginWatch, publicPostValidateInviteCode, publicPostGetPoints, publicPostGetAllPoints, publicPostGetPointsLeaderboard, publicPostGetDescendantTree, publicPostGetTreeRoots, publicPostGetSwellPercentPoints, publicPostGetVaultAssets, publicPostGetEtherfiEffectiveBalances, publicPostGetKelpEffectiveBalances, publicPostGetBridgeBalances, publicPostGetEthenaParticipants, publicPostGetVaultShare, publicPostGetVaultStatistics, publicPostGetVaultBalances, publicPostEstimateIntegratorPoints, publicPostCreateSubaccountDebug, publicPostDepositDebug, publicPostWithdrawDebug, publicPostSendQuoteDebug, publicPostExecuteQuoteDebug, publicPostGetInviteCode, publicPostRegisterInvite, publicPostGetTime, publicPostGetLiveIncidents, publicPostGetMakerPrograms, publicPostGetMakerProgramScores, privatePostGetAccount, privatePostCreateSubaccount, privatePostGetSubaccount, privatePostGetSubaccounts, privatePostGetAllPortfolios, privatePostChangeSubaccountLabel, privatePostGetNotificationsv, privatePostUpdateNotifications, privatePostDeposit, privatePostWithdraw, privatePostTransferErc20, privatePostTransferPosition, privatePostTransferPositions, privatePostOrder, privatePostReplace, privatePostOrderDebug, privatePostGetOrder, privatePostGetOrders, privatePostGetOpenOrders, privatePostCancel, privatePostCancelByLabel, privatePostCancelByNonce, privatePostCancelByInstrument, privatePostCancelAll, privatePostCancelTriggerOrder, privatePostGetOrderHistory, privatePostGetTradeHistory, privatePostGetDepositHistory, privatePostGetWithdrawalHistory, privatePostSendRfq, privatePostCancelRfq, privatePostCancelBatchRfqs, privatePostGetRfqs, privatePostPollRfqs, privatePostSendQuote, privatePostCancelQuote, privatePostCancelBatchQuotes, privatePostGetQuotes, privatePostPollQuotes, privatePostExecuteQuote, privatePostRfqGetBestQuote, privatePostGetMargin, privatePostGetCollaterals, privatePostGetPositions, privatePostGetOptionSettlementHistory, privatePostGetSubaccountValueHistory, privatePostExpiredAndCancelledHistory, privatePostGetFundingHistory, privatePostGetInterestHistory, privatePostGetErc20TransferHistory, privatePostGetLiquidationHistory, privatePostLiquidate, privatePostGetLiquidatorHistory, privatePostSessionKeys, privatePostEditSessionKey, privatePostRegisterScopedSessionKey, privatePostGetMmpConfig, privatePostSetMmpConfig, privatePostResetMmp, privatePostSetCancelOnDisconnect, privatePostGetInviteCode, privatePostRegisterInvite)
    desc = inst.describe()
    for (k, v) in desc
        inst[Symbol(k)] = v
    end
    return inst
end
