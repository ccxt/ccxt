'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    publicGetConfConfig(params = {}) {
        return this.request('conf/{config}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubActionObject(params = {}) {
        return this.request('conf/pub:{action}:{object}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubActionObjectDetail(params = {}) {
        return this.request('conf/pub:{action}:{object}:{detail}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapObject(params = {}) {
        return this.request('conf/pub:map:{object}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapObjectDetail(params = {}) {
        return this.request('conf/pub:map:{object}:{detail}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyDetail(params = {}) {
        return this.request('conf/pub:map:currency:{detail}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencySym(params = {}) {
        return this.request('conf/pub:map:currency:sym', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyLabel(params = {}) {
        return this.request('conf/pub:map:currency:label', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyUnit(params = {}) {
        return this.request('conf/pub:map:currency:unit', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyUndl(params = {}) {
        return this.request('conf/pub:map:currency:undl', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyPool(params = {}) {
        return this.request('conf/pub:map:currency:pool', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyExplorer(params = {}) {
        return this.request('conf/pub:map:currency:explorer', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapCurrencyTxFee(params = {}) {
        return this.request('conf/pub:map:currency:tx:fee', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubMapTxMethod(params = {}) {
        return this.request('conf/pub:map:tx:method', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListObject(params = {}) {
        return this.request('conf/pub:list:{object}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListObjectDetail(params = {}) {
        return this.request('conf/pub:list:{object}:{detail}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListCurrency(params = {}) {
        return this.request('conf/pub:list:currency', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListPairExchange(params = {}) {
        return this.request('conf/pub:list:pair:exchange', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListPairMargin(params = {}) {
        return this.request('conf/pub:list:pair:margin', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListPairFutures(params = {}) {
        return this.request('conf/pub:list:pair:futures', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubListCompetitions(params = {}) {
        return this.request('conf/pub:list:competitions', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubInfoObject(params = {}) {
        return this.request('conf/pub:info:{object}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubInfoObjectDetail(params = {}) {
        return this.request('conf/pub:info:{object}:{detail}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubInfoPair(params = {}) {
        return this.request('conf/pub:info:pair', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubInfoPairFutures(params = {}) {
        return this.request('conf/pub:info:pair:futures', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubInfoTxStatus(params = {}) {
        return this.request('conf/pub:info:tx:status', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetConfPubFees(params = {}) {
        return this.request('conf/pub:fees', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetPlatformStatus(params = {}) {
        return this.request('platform/status', ['public'], 'GET', params, undefined, undefined, { 'cost': 8 });
    }
    publicGetTickers(params = {}) {
        return this.request('tickers', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetTickerSymbol(params = {}) {
        return this.request('ticker/{symbol}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetTickersHist(params = {}) {
        return this.request('tickers/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetTradesSymbolHist(params = {}) {
        return this.request('trades/{symbol}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetBookSymbolPrecision(params = {}) {
        return this.request('book/{symbol}/{precision}', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetBookSymbolP0(params = {}) {
        return this.request('book/{symbol}/P0', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetBookSymbolP1(params = {}) {
        return this.request('book/{symbol}/P1', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetBookSymbolP2(params = {}) {
        return this.request('book/{symbol}/P2', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetBookSymbolP3(params = {}) {
        return this.request('book/{symbol}/P3', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetBookSymbolR0(params = {}) {
        return this.request('book/{symbol}/R0', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicGetStats1KeySizeSymbolSideSection(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:{side}/{section}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolSideLast(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:{side}/last', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolSideHist(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:{side}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolSection(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}/{section}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolLast(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}/last', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolHist(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolLongLast(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:long/last', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolLongHist(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:long/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolShortLast(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:short/last', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStats1KeySizeSymbolShortHist(params = {}) {
        return this.request('stats1/{key}:{size}:{symbol}:short/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetCandlesTradeTimeframeSymbolPeriodSection(params = {}) {
        return this.request('candles/trade:{timeframe}:{symbol}:{period}/{section}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetCandlesTradeTimeframeSymbolSection(params = {}) {
        return this.request('candles/trade:{timeframe}:{symbol}/{section}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetCandlesTradeTimeframeSymbolLast(params = {}) {
        return this.request('candles/trade:{timeframe}:{symbol}/last', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetCandlesTradeTimeframeSymbolHist(params = {}) {
        return this.request('candles/trade:{timeframe}:{symbol}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStatusType(params = {}) {
        return this.request('status/{type}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStatusDeriv(params = {}) {
        return this.request('status/deriv', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetStatusDerivSymbolHist(params = {}) {
        return this.request('status/deriv/{symbol}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetLiquidationsHist(params = {}) {
        return this.request('liquidations/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 80 });
    }
    publicGetRankingsKeyTimeframeSymbolSection(params = {}) {
        return this.request('rankings/{key}:{timeframe}:{symbol}/{section}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetRankingsKeyTimeframeSymbolHist(params = {}) {
        return this.request('rankings/{key}:{timeframe}:{symbol}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetPulseHist(params = {}) {
        return this.request('pulse/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetPulseProfileNickname(params = {}) {
        return this.request('pulse/profile/{nickname}', ['public'], 'GET', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicGetFundingStatsSymbolHist(params = {}) {
        return this.request('funding/stats/{symbol}/hist', ['public'], 'GET', params, undefined, undefined, { 'cost': 10 });
    }
    publicGetExtVasps(params = {}) {
        return this.request('ext/vasps', ['public'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    publicPostCalcTradeAvg(params = {}) {
        return this.request('calc/trade/avg', ['public'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    publicPostCalcFx(params = {}) {
        return this.request('calc/fx', ['public'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRWallets(params = {}) {
        return this.request('auth/r/wallets', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRWalletsHist(params = {}) {
        return this.request('auth/r/wallets/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthROrders(params = {}) {
        return this.request('auth/r/orders', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthROrdersSymbol(params = {}) {
        return this.request('auth/r/orders/{symbol}', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWOrderSubmit(params = {}) {
        return this.request('auth/w/order/submit', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWOrderUpdate(params = {}) {
        return this.request('auth/w/order/update', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWOrderCancel(params = {}) {
        return this.request('auth/w/order/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWOrderMulti(params = {}) {
        return this.request('auth/w/order/multi', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWOrderCancelMulti(params = {}) {
        return this.request('auth/w/order/cancel/multi', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthROrdersSymbolHist(params = {}) {
        return this.request('auth/r/orders/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthROrdersHist(params = {}) {
        return this.request('auth/r/orders/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthROrdersOtcSymbolHist(params = {}) {
        return this.request('auth/r/orders/otc/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthROrderSymbolIdTrades(params = {}) {
        return this.request('auth/r/order/{symbol}:{id}/trades', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRTradesSymbolHist(params = {}) {
        return this.request('auth/r/trades/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRTradesHist(params = {}) {
        return this.request('auth/r/trades/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRLedgersCurrencyHist(params = {}) {
        return this.request('auth/r/ledgers/{currency}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRLedgersHist(params = {}) {
        return this.request('auth/r/ledgers/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRInfoMarginKey(params = {}) {
        return this.request('auth/r/info/margin/{key}', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRInfoMarginBase(params = {}) {
        return this.request('auth/r/info/margin/base', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRInfoMarginSymAll(params = {}) {
        return this.request('auth/r/info/margin/sym_all', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPositions(params = {}) {
        return this.request('auth/r/positions', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWPositionClaim(params = {}) {
        return this.request('auth/w/position/claim', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWPositionIncrease(params = {}) {
        return this.request('auth/w/position/increase:', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPositionIncreaseInfo(params = {}) {
        return this.request('auth/r/position/increase/info', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPositionsHist(params = {}) {
        return this.request('auth/r/positions/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPositionsAudit(params = {}) {
        return this.request('auth/r/positions/audit', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPositionsSnap(params = {}) {
        return this.request('auth/r/positions/snap', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWPositionUpdateFundingType(params = {}) {
        return this.request('auth/w/position/update/funding/type', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWDerivCollateralSet(params = {}) {
        return this.request('auth/w/deriv/collateral/set', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWDerivCollateralLimits(params = {}) {
        return this.request('auth/w/deriv/collateral/limits', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingOffers(params = {}) {
        return this.request('auth/r/funding/offers', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingOffersSymbol(params = {}) {
        return this.request('auth/r/funding/offers/{symbol}', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWFundingOfferSubmit(params = {}) {
        return this.request('auth/w/funding/offer/submit', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWFundingOfferCancel(params = {}) {
        return this.request('auth/w/funding/offer/cancel', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWFundingOfferCancelAll(params = {}) {
        return this.request('auth/w/funding/offer/cancel/all', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWFundingClose(params = {}) {
        return this.request('auth/w/funding/close', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWFundingAuto(params = {}) {
        return this.request('auth/w/funding/auto', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWFundingKeep(params = {}) {
        return this.request('auth/w/funding/keep', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingOffersSymbolHist(params = {}) {
        return this.request('auth/r/funding/offers/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingOffersHist(params = {}) {
        return this.request('auth/r/funding/offers/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingLoans(params = {}) {
        return this.request('auth/r/funding/loans', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingLoansHist(params = {}) {
        return this.request('auth/r/funding/loans/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingLoansSymbol(params = {}) {
        return this.request('auth/r/funding/loans/{symbol}', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingLoansSymbolHist(params = {}) {
        return this.request('auth/r/funding/loans/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingCredits(params = {}) {
        return this.request('auth/r/funding/credits', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingCreditsHist(params = {}) {
        return this.request('auth/r/funding/credits/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingCreditsSymbol(params = {}) {
        return this.request('auth/r/funding/credits/{symbol}', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingCreditsSymbolHist(params = {}) {
        return this.request('auth/r/funding/credits/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingTradesSymbolHist(params = {}) {
        return this.request('auth/r/funding/trades/{symbol}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRFundingTradesHist(params = {}) {
        return this.request('auth/r/funding/trades/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRInfoFundingKey(params = {}) {
        return this.request('auth/r/info/funding/{key}', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRInfoUser(params = {}) {
        return this.request('auth/r/info/user', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRSummary(params = {}) {
        return this.request('auth/r/summary', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRLoginsHist(params = {}) {
        return this.request('auth/r/logins/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPermissions(params = {}) {
        return this.request('auth/r/permissions', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWToken(params = {}) {
        return this.request('auth/w/token', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRAuditHist(params = {}) {
        return this.request('auth/r/audit/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWTransfer(params = {}) {
        return this.request('auth/w/transfer', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWDepositAddress(params = {}) {
        return this.request('auth/w/deposit/address', ['private'], 'POST', params, undefined, undefined, { 'cost': 24 });
    }
    privatePostAuthRDepositAddressAll(params = {}) {
        return this.request('auth/r/deposit/address/all', ['private'], 'POST', params, undefined, undefined, { 'cost': 24 });
    }
    privatePostAuthWDepositInvoice(params = {}) {
        return this.request('auth/w/deposit/invoice', ['private'], 'POST', params, undefined, undefined, { 'cost': 24 });
    }
    privatePostAuthRExtInvoicePayments(params = {}) {
        return this.request('auth/r/ext/invoice/payments', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWWithdraw(params = {}) {
        return this.request('auth/w/withdraw', ['private'], 'POST', params, undefined, undefined, { 'cost': 24 });
    }
    privatePostAuthRMovementsCurrencyHist(params = {}) {
        return this.request('auth/r/movements/{currency}/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRMovementsHist(params = {}) {
        return this.request('auth/r/movements/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRMovementsInfo(params = {}) {
        return this.request('auth/r/movements/info', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRAlerts(params = {}) {
        return this.request('auth/r/alerts', ['private'], 'POST', params, undefined, undefined, { 'cost': 5.34 });
    }
    privatePostAuthWAlertSet(params = {}) {
        return this.request('auth/w/alert/set', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWAlertPriceSymbolPriceDel(params = {}) {
        return this.request('auth/w/alert/price:{symbol}:{price}/del', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWAlertTypeSymbolPriceDel(params = {}) {
        return this.request('auth/w/alert/{type}:{symbol}:{price}/del', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthCalcOrderAvail(params = {}) {
        return this.request('auth/calc/order/avail', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWSettingsSet(params = {}) {
        return this.request('auth/w/settings/set', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRSettings(params = {}) {
        return this.request('auth/r/settings', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWSettingsDel(params = {}) {
        return this.request('auth/w/settings/del', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRPulseHist(params = {}) {
        return this.request('auth/r/pulse/hist', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWPulseAdd(params = {}) {
        return this.request('auth/w/pulse/add', ['private'], 'POST', params, undefined, undefined, { 'cost': 16 });
    }
    privatePostAuthWPulseDel(params = {}) {
        return this.request('auth/w/pulse/del', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWExtWalletsDepositsRequest(params = {}) {
        return this.request('auth/w/ext/wallets/deposits/request', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthWExtWalletsWithdrawalsRequest(params = {}) {
        return this.request('auth/w/ext/wallets/withdrawals/request', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
    privatePostAuthRExtWalletsTransfersFreeCount(params = {}) {
        return this.request('auth/r/ext/wallets/transfers/free/count', ['private'], 'POST', params, undefined, undefined, { 'cost': 2.7 });
    }
}

exports["default"] = Exchange;
