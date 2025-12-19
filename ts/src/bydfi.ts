
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bydfi.js';
// import { AuthenticationError, PermissionDenied, AccountSuspended, ExchangeError, InsufficientFunds, BadRequest, OrderNotFound, DDoSProtection, BadSymbol, ArgumentsRequired, NotSupported, OperationFailed, InvalidOrder } from './base/errors.js';
// import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';
// import type { TransferEntry, Int, OrderSide, OHLCV, FundingRateHistory, Order, OrderType, OrderRequest, Str, Trade, Balances, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency, Position, Dict, Leverage, MarginMode, Num, MarginModification, Currencies, int, TradingFeeInterface, FundingRate, FundingRates, DepositAddress } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bydfi
 * @augments Exchange
 */
export default class bydfi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bydfi',
            'name': 'BYDFi',
            'countries': [ 'SG' ], // Singapore todo check
            'rateLimit': 50, // 20 requests per second
            'version': 'v1',
            'certified': false,
            'pro': false, // todo set to true when pro file will be implemented
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersWithClientOrderId': false,
                'cancelOrderWithClientOrderId': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitOrder': true,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'deposit': false,
                'editOrder': 'emulated',
                'editOrders': false,
                'editOrderWithClientOrderId': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': 'emulated',
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchGreeks': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': true,
                'fetchL3OrderBook': false,
                'fetchLastPrices': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverage': false,
                'fetchLeverages': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchLongShortRatio': false,
                'fetchLongShortRatioHistory': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarginModes': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMarkPrices': false,
                'fetchMyLiquidations': false,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOption': false,
                'fetchOptionChain': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrdersByStatus': false,
                'fetchOrderTrades': false,
                'fetchOrderWithClientOrderId': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchUnderlyingAssets': false,
                'fetchVolatilityHistory': false,
                'fetchWithdrawAddresses': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'watchMyLiquidationsForSymbols': false,
                'withdraw': false,
                'ws': true,
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.bydfi.com/api',
                    'private': 'https://api.bydfi.com/api',
                },
                'www': 'https://bydfi.com/',
                'doc': 'https://developers.bydfi.com/en/',
            },
            'fees': {
            },
            'api': {
                'public': {
                    'get': {
                        'v1/public/api_limits': 1, // https://developers.bydfi.com/en/public#inquiry-into-api-rate-limit-configuration
                        'v1/swap/market/exchange_info': 1, // https://developers.bydfi.com/en/swap/market#fetching-trading-rules-and-pairs
                        'v1/swap/market/depth': 1, // https://developers.bydfi.com/en/swap/market#depth-information
                        'v1/swap/market/trades': 1, // https://developers.bydfi.com/en/swap/market#recent-trades
                        'v1/swap/market/klines': 1, // https://developers.bydfi.com/en/swap/market#candlestick-data
                        'v1/swap/market/ticker/24hr': 1, // https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics
                        'v1/swap/market/ticker/price': 1, // https://developers.bydfi.com/en/swap/market#latest-price
                        'v1/swap/market/mark_price': 1, // https://developers.bydfi.com/en/swap/market#mark-price
                        'v1/swap/market/funding_rate': 1, // https://developers.bydfi.com/en/swap/market#recent-funding-rate
                        'v1/swap/market/funding_rate_history': 1, // https://developers.bydfi.com/en/swap/market#historical-funding-rates
                        'v1/swap/market/risk_limit': 1, // https://developers.bydfi.com/en/swap/market#risk-limit
                    },
                },
                'private': {
                    'get': {
                        'v1/account/assets': 1, // https://developers.bydfi.com/en/account
                        'v1/account/transfer_records': 1, // https://developers.bydfi.com/en/account#query-wallet-transfer-records
                        'v1/spot/deposit_records': 1, // https://developers.bydfi.com/en/spot/account#query-deposit-records
                        'v1/spot/withdraw_records': 1, // https://developers.bydfi.com/en/spot/account#query-withdrawal-records
                        'v1/swap/trade/open_order': 1, // https://developers.bydfi.com/en/swap/trade#pending-order-query
                        'v1/swap/trade/plan_order': 1, // https://developers.bydfi.com/en/swap/trade#planned-order-query
                        'v1/swap/trade/leverage': 1, // https://developers.bydfi.com/en/swap/trade#get-leverage-for-single-trading-pair
                        'v1/swap/trade/history_order': 1, // https://developers.bydfi.com/en/swap/trade#historical-orders-query
                        'v1/swap/trade/history_trade': 1, // https://developers.bydfi.com/en/swap/trade#historical-trades-query
                        'v1/swap/trade/position_history': 1, // https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
                        'v1/swap/trade/positions': 1, // https://developers.bydfi.com/en/swap/trade#positions-query
                        'v1/swap/account/balance': 1, // https://developers.bydfi.com/en/swap/user#asset-query
                        'v1/swap/user_data/assets_margin': 1, // https://developers.bydfi.com/en/swap/user#margin-mode-query
                        'v1/swap/user_data/position_side/dual': 1, // https://developers.bydfi.com/en/swap/user#get-position-mode
                        'v1/agent/teams': 1, // https://developers.bydfi.com/en/agent/#query-kol-subordinate-team-information
                        'v1/agent/agent_links': 1, // https://developers.bydfi.com/en/agent/#query-kol-invitation-code-list
                        'v1/agent/regular_overview': 1, // https://developers.bydfi.com/en/agent/#query-kol-direct-client-data-list
                        'v1/agent/agent_sub_overview': 1, // https://developers.bydfi.com/en/agent/#query-kol-subordinate-affiliate-list
                        'v1/agent/partener_user_deposit': 1, // https://developers.bydfi.com/en/agent/#check-the-recharge-amount-of-kol-within-one-year
                        'v1/agent/partener_users_data': 1, // https://developers.bydfi.com/en/agent/#query-kol-subordinate-deposit-and-trading-data
                        'v1/agent/affiliate_uids': 1, // https://developers.bydfi.com/en/agent/#get-affiliate-uids
                        'v1/agent/affiliate_commission': 1, // https://developers.bydfi.com/en/agent/#get-affiliate-commission
                        'v1/agent/internal_withdrawal_status': 1, // https://developers.bydfi.com/en/agent/#get-internal-withdrawal-status
                    },
                    'post': {
                        'v1/account/transfer': 1, // https://developers.bydfi.com/en/account#asset-transfer-between-accounts
                        'v1/swap/trade/place_order': 1, // https://developers.bydfi.com/en/swap/trade#placing-an-order
                        'v1/swap/trade/batch_place_order': 1, // https://developers.bydfi.com/en/swap/trade#batch-order-placement
                        'v1/swap/trade/edit_order': 1, // https://developers.bydfi.com/en/swap/trade#order-modification
                        'v1/swap/trade/batch_edit_order': 1, // https://developers.bydfi.com/en/swap/trade#batch-order-modification
                        'v1/swap/trade/cancel_all_order': 1, // https://developers.bydfi.com/en/swap/trade#complete-order-cancellation
                        'v1/swap/trade/leverage': 1, // https://developers.bydfi.com/en/swap/trade#set-leverage-for-single-trading-pair
                        'v1/swap/trade/batch_leverage_margin': 1, // https://developers.bydfi.com/en/swap/trade#modify-leverage-and-margin-type-with-one-click
                        'v1/swap/user_data/margin_type': 1, // https://developers.bydfi.com/en/swap/user#change-margin-type-cross-margin
                        'v1/swap/user_data/position_side/dual': 1, // https://developers.bydfi.com/en/swap/user#change-position-mode-dual
                        'v1/agent/internal_withdrawal': 1, // https://developers.bydfi.com/en/agent/#internal-withdrawal
                    },
                },
            },
            'timeframes': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {
            },
            'options': {
            },
        });
    }
}
