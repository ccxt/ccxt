'use strict';

var okx$1 = require('./abstract/okx.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class okx
 * @augments Exchange
 */
class okx extends okx$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'okx',
            'name': 'OKX',
            'countries': ['CN', 'US'],
            'version': 'v5',
            'rateLimit': 100 * 1.03,
            'pro': true,
            'certified': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'addMargin': true,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createConvertTrade': true,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createOrderWithTakeProfitAndStopLoss': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopLossOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTrailingPercentOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': true,
                'fetchBorrowRateHistory': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': true,
                'fetchConvertQuote': true,
                'fetchConvertTrade': true,
                'fetchConvertTradeHistory': true,
                'fetchCrossBorrowRate': true,
                'fetchCrossBorrowRates': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchGreeks': true,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': true,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': true,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': true,
                'fetchMarketLeverageTiers': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMySettlementHistory': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOption': true,
                'fetchOptionChain': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPermissions': undefined,
                'fetchPosition': true,
                'fetchPositionHistory': 'emulated',
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': true,
                'fetchTransfers': true,
                'fetchUnderlyingAssets': true,
                'fetchVolatilityHistory': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayCrossMargin': true,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
                '3M': '3M',
            },
            'hostname': 'www.okx.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg',
                'api': {
                    'rest': 'https://{hostname}',
                },
                'www': 'https://www.okx.com',
                'doc': 'https://www.okx.com/docs-v5/en/',
                'fees': 'https://www.okx.com/pages/products/fees.html',
                'referral': {
                    // old reflink 0% discount https://www.okx.com/join/1888677
                    // new reflink 20% discount https://www.okx.com/join/CCXT2023
                    'url': 'https://www.okx.com/join/CCXT2023',
                    'discount': 0.2,
                },
                'test': {
                    'rest': 'https://{hostname}',
                },
            },
            'api': {
                'public': {
                    'get': {
                        'market/books-full': 2,
                        'market/tickers': 1,
                        'market/ticker': 1,
                        'market/index-tickers': 1,
                        'market/books': 1 / 2,
                        'market/books-lite': 5 / 3,
                        'market/candles': 1 / 2,
                        'market/history-candles': 1,
                        'market/index-candles': 1,
                        'market/history-index-candles': 2,
                        'market/mark-price-candles': 1,
                        'market/history-mark-price-candles': 2,
                        'market/trades': 1 / 5,
                        'market/history-trades': 2,
                        'market/option/instrument-family-trades': 1,
                        'market/platform-24-volume': 10,
                        'market/open-oracle': 50,
                        'market/exchange-rate': 20,
                        'market/index-components': 1,
                        'public/economic-calendar': 50,
                        'market/block-tickers': 1,
                        'market/block-ticker': 1,
                        'public/block-trades': 1,
                        'public/instruments': 1,
                        'public/delivery-exercise-history': 1 / 2,
                        'public/open-interest': 1,
                        'public/funding-rate': 1,
                        'public/funding-rate-history': 1,
                        'public/price-limit': 1,
                        'public/opt-summary': 1,
                        'public/estimated-price': 2,
                        'public/discount-rate-interest-free-quota': 10,
                        'public/time': 2,
                        'public/mark-price': 2,
                        'public/position-tiers': 2,
                        'public/interest-rate-loan-quota': 10,
                        'public/vip-interest-rate-loan-quota': 10,
                        'public/underlying': 1,
                        'public/insurance-fund': 2,
                        'public/convert-contract-coin': 2,
                        'public/option-trades': 1,
                        'public/instrument-tick-bands': 4,
                        'rubik/stat/trading-data/support-coin': 4,
                        'rubik/stat/taker-volume': 4,
                        'rubik/stat/margin/loan-ratio': 4,
                        // long/short
                        'rubik/stat/contracts/long-short-account-ratio': 4,
                        'rubik/stat/contracts/open-interest-volume': 4,
                        'rubik/stat/option/open-interest-volume': 4,
                        // put/call
                        'rubik/stat/option/open-interest-volume-ratio': 4,
                        'rubik/stat/option/open-interest-volume-expiry': 4,
                        'rubik/stat/option/open-interest-volume-strike': 4,
                        'rubik/stat/option/taker-block-volume': 4,
                        'system/status': 50,
                        // public api
                        'sprd/spreads': 1,
                        'sprd/books': 1 / 2,
                        'sprd/ticker': 1,
                        'sprd/public-trades': 1 / 5,
                        'tradingBot/grid/ai-param': 1,
                        'tradingBot/grid/min-investment': 1,
                        'tradingBot/public/rsi-back-testing': 1,
                        'asset/exchange-list': 5 / 3,
                        'finance/staking-defi/eth/apy-history': 5 / 3,
                        'finance/savings/lending-rate-summary': 5 / 3,
                        'finance/savings/lending-rate-history': 5 / 3,
                        // public broker
                        'finance/sfp/dcd/products': 2 / 3,
                        // copytrading
                        'copytrading/public-lead-traders': 4,
                        'copytrading/public-weekly-pnl': 4,
                        'copytrading/public-stats': 4,
                        'copytrading/public-preference-currency': 4,
                        'copytrading/public-current-subpositions': 4,
                        'copytrading/public-subpositions-history': 4,
                    },
                },
                'private': {
                    'get': {
                        // rfq
                        'rfq/counterparties': 4,
                        'rfq/maker-instrument-settings': 4,
                        'rfq/mmp-config': 4,
                        'rfq/rfqs': 10,
                        'rfq/quotes': 10,
                        'rfq/trades': 4,
                        'rfq/public-trades': 4,
                        // sprd
                        'sprd/order': 1 / 3,
                        'sprd/orders-pending': 1 / 3,
                        'sprd/orders-history': 1 / 2,
                        'sprd/orders-history-archive': 1 / 2,
                        'sprd/trades': 1 / 3,
                        // trade
                        'trade/order': 1 / 3,
                        'trade/orders-pending': 1 / 3,
                        'trade/orders-history': 1 / 2,
                        'trade/orders-history-archive': 1,
                        'trade/fills': 1 / 3,
                        'trade/fills-history': 2.2,
                        'trade/fills-archive': 2,
                        'trade/order-algo': 1,
                        'trade/orders-algo-pending': 1,
                        'trade/orders-algo-history': 1,
                        'trade/easy-convert-currency-list': 20,
                        'trade/easy-convert-history': 20,
                        'trade/one-click-repay-currency-list': 20,
                        'trade/one-click-repay-history': 20,
                        'trade/account-rate-limit': 1,
                        // asset
                        'asset/currencies': 5 / 3,
                        'asset/balances': 5 / 3,
                        'asset/non-tradable-assets': 5 / 3,
                        'asset/asset-valuation': 10,
                        'asset/transfer-state': 10,
                        'asset/bills': 5 / 3,
                        'asset/deposit-lightning': 5,
                        'asset/deposit-address': 5 / 3,
                        'asset/deposit-history': 5 / 3,
                        'asset/withdrawal-history': 5 / 3,
                        'asset/deposit-withdraw-status': 20,
                        'asset/convert/currencies': 5 / 3,
                        'asset/convert/currency-pair': 5 / 3,
                        'asset/convert/history': 5 / 3,
                        'asset/monthly-statement': 2,
                        // account
                        'account/balance': 2,
                        'account/positions': 2,
                        'account/positions-history': 100,
                        'account/account-position-risk': 2,
                        'account/bills': 5 / 3,
                        'account/bills-archive': 5 / 3,
                        'account/config': 4,
                        'account/max-size': 1,
                        'account/max-avail-size': 1,
                        'account/leverage-info': 1,
                        'account/adjust-leverage-info': 4,
                        'account/max-loan': 1,
                        'account/trade-fee': 4,
                        'account/interest-accrued': 4,
                        'account/interest-rate': 4,
                        'account/max-withdrawal': 1,
                        'account/risk-state': 2,
                        'account/quick-margin-borrow-repay-history': 4,
                        'account/borrow-repay-history': 4,
                        'account/vip-interest-accrued': 4,
                        'account/vip-interest-deducted': 4,
                        'account/vip-loan-order-list': 4,
                        'account/vip-loan-order-detail': 4,
                        'account/interest-limits': 4,
                        'account/greeks': 2,
                        'account/position-tiers': 2,
                        'account/mmp-config': 4,
                        // subaccount
                        'users/subaccount/list': 10,
                        'account/subaccount/balances': 10 / 3,
                        'asset/subaccount/balances': 10 / 3,
                        'account/subaccount/max-withdrawal': 1,
                        'asset/subaccount/bills': 5 / 3,
                        'asset/subaccount/managed-subaccount-bills': 5 / 3,
                        'users/entrust-subaccount-list': 10,
                        'account/subaccount/interest-limits': 4,
                        // grid trading
                        'tradingBot/grid/orders-algo-pending': 1,
                        'tradingBot/grid/orders-algo-history': 1,
                        'tradingBot/grid/orders-algo-details': 1,
                        'tradingBot/grid/sub-orders': 1,
                        'tradingBot/grid/positions': 1,
                        'tradingBot/grid/ai-param': 1,
                        'tradingBot/signal/signals': 1,
                        'tradingBot/signal/orders-algo-details': 1,
                        'tradingBot/signal/orders-algo-history': 1,
                        'tradingBot/signal/positions': 1,
                        'tradingBot/signal/positions-history': 1,
                        'tradingBot/signal/sub-orders': 1,
                        'tradingBot/signal/event-history': 1,
                        'tradingBot/recurring/orders-algo-pending': 1,
                        'tradingBot/recurring/orders-algo-history': 1,
                        'tradingBot/recurring/orders-algo-details': 1,
                        'tradingBot/recurring/sub-orders': 1,
                        // earn
                        'finance/savings/balance': 5 / 3,
                        'finance/savings/lending-history': 5 / 3,
                        'finance/staking-defi/offers': 10 / 3,
                        'finance/staking-defi/orders-active': 10 / 3,
                        'finance/staking-defi/orders-history': 10 / 3,
                        // eth staking
                        'finance/staking-defi/eth/balance': 5 / 3,
                        'finance/staking-defi/eth/purchase-redeem-history': 5 / 3,
                        // copytrading
                        'copytrading/current-subpositions': 1,
                        'copytrading/subpositions-history': 1,
                        'copytrading/instruments': 4,
                        'copytrading/profit-sharing-details': 4,
                        'copytrading/total-profit-sharing': 4,
                        'copytrading/unrealized-profit-sharing-details': 4,
                        'copytrading/copy-settings': 4,
                        'copytrading/batch-leverage-info': 4,
                        'copytrading/current-lead-traders': 4,
                        'copytrading/lead-traders-history': 4,
                        // broker
                        'broker/nd/info': 10,
                        'broker/nd/subaccount-info': 10,
                        'broker/nd/subaccount/apikey': 10,
                        'asset/broker/nd/subaccount-deposit-address': 5 / 3,
                        'asset/broker/nd/subaccount-deposit-history': 4,
                        'asset/broker/nd/subaccount-withdrawal-history': 4,
                        'broker/nd/rebate-daily': 100,
                        'broker/nd/rebate-per-orders': 300,
                        'finance/sfp/dcd/order': 2,
                        'finance/sfp/dcd/orders': 2,
                        'broker/fd/rebate-per-orders': 300,
                        'broker/fd/if-rebate': 5,
                        // affiliate
                        'affiliate/invitee/detail': 1,
                        'users/partner/if-rebate': 1,
                    },
                    'post': {
                        // rfq
                        'rfq/create-rfq': 4,
                        'rfq/cancel-rfq': 4,
                        'rfq/cancel-batch-rfqs': 10,
                        'rfq/cancel-all-rfqs': 10,
                        'rfq/execute-quote': 15,
                        'rfq/maker-instrument-settings': 4,
                        'rfq/mmp-reset': 4,
                        'rfq/mmp-config': 100,
                        'rfq/create-quote': 0.4,
                        'rfq/cancel-quote': 0.4,
                        'rfq/cancel-batch-quotes': 10,
                        'rfq/cancel-all-quotes': 10,
                        // sprd
                        'sprd/order': 1,
                        'sprd/cancel-order': 1,
                        'sprd/mass-cancel': 1,
                        'sprd/amend-order': 1,
                        // trade
                        'trade/order': 1 / 3,
                        'trade/batch-orders': 1 / 15,
                        'trade/cancel-order': 1 / 3,
                        'trade/cancel-batch-orders': 1 / 15,
                        'trade/amend-order': 1 / 3,
                        'trade/amend-batch-orders': 1 / 150,
                        'trade/close-position': 1,
                        'trade/fills-archive': 172800,
                        'trade/order-algo': 1,
                        'trade/cancel-algos': 1,
                        'trade/amend-algos': 1,
                        'trade/cancel-advance-algos': 1,
                        'trade/easy-convert': 20,
                        'trade/one-click-repay': 20,
                        'trade/mass-cancel': 4,
                        'trade/cancel-all-after': 10,
                        // asset
                        'asset/transfer': 10,
                        'asset/withdrawal': 5 / 3,
                        'asset/withdrawal-lightning': 5,
                        'asset/cancel-withdrawal': 5 / 3,
                        'asset/convert-dust-assets': 10,
                        'asset/convert/estimate-quote': 1,
                        'asset/convert/trade': 1,
                        'asset/monthly-statement': 1,
                        // account
                        'account/set-position-mode': 4,
                        'account/set-leverage': 1,
                        'account/position/margin-balance': 1,
                        'account/set-greeks': 4,
                        'account/set-isolated-mode': 4,
                        'account/quick-margin-borrow-repay': 4,
                        'account/borrow-repay': 5 / 3,
                        'account/simulated_margin': 10,
                        'account/position-builder': 10,
                        'account/set-riskOffset-type': 2,
                        'account/activate-option': 4,
                        'account/set-auto-loan': 4,
                        'account/set-account-level': 4,
                        'account/mmp-reset': 4,
                        'account/mmp-config': 100,
                        // subaccount
                        'users/subaccount/modify-apikey': 10,
                        'asset/subaccount/transfer': 10,
                        'users/subaccount/set-transfer-out': 10,
                        'account/subaccount/set-loan-allocation': 4,
                        // grid trading
                        'tradingBot/grid/order-algo': 1,
                        'tradingBot/grid/amend-order-algo': 1,
                        'tradingBot/grid/stop-order-algo': 1,
                        'tradingBot/grid/close-position': 1,
                        'tradingBot/grid/cancel-close-order': 1,
                        'tradingBot/grid/order-instant-trigger': 1,
                        'tradingBot/grid/withdraw-income': 1,
                        'tradingBot/grid/compute-margin-balance': 1,
                        'tradingBot/grid/margin-balance': 1,
                        'tradingBot/grid/min-investment': 1,
                        'tradingBot/signal/create-signal': 1,
                        'tradingBot/signal/order-algo': 1,
                        'tradingBot/signal/stop-order-algo': 1,
                        'tradingBot/signal/margin-balance': 1,
                        'tradingBot/signal/amendTPSL': 1,
                        'tradingBot/signal/set-instruments': 1,
                        'tradingBot/signal/close-position': 1,
                        'tradingBot/signal/sub-order': 1,
                        'tradingBot/signal/cancel-sub-order': 1,
                        'tradingBot/recurring/order-algo': 1,
                        'tradingBot/recurring/amend-order-algo': 1,
                        'tradingBot/recurring/stop-order-algo': 1,
                        // earn
                        'finance/savings/purchase-redempt': 5 / 3,
                        'finance/savings/set-lending-rate': 5 / 3,
                        'finance/staking-defi/purchase': 3,
                        'finance/staking-defi/redeem': 3,
                        'finance/staking-defi/cancel': 3,
                        // eth staking
                        'finance/staking-defi/eth/purchase': 5,
                        'finance/staking-defi/eth/redeem': 5,
                        // copytrading
                        'copytrading/algo-order': 1,
                        'copytrading/close-subposition': 1,
                        'copytrading/set-instruments': 4,
                        'copytrading/first-copy-settings': 4,
                        'copytrading/amend-copy-settings': 4,
                        'copytrading/stop-copy-trading': 4,
                        'copytrading/batch-set-leverage': 4,
                        // broker
                        'broker/nd/create-subaccount': 0.25,
                        'broker/nd/delete-subaccount': 1,
                        'broker/nd/subaccount/apikey': 0.25,
                        'broker/nd/subaccount/modify-apikey': 1,
                        'broker/nd/subaccount/delete-apikey': 1,
                        'broker/nd/set-subaccount-level': 4,
                        'broker/nd/set-subaccount-fee-rate': 4,
                        'broker/nd/set-subaccount-assets': 0.25,
                        'asset/broker/nd/subaccount-deposit-address': 1,
                        'asset/broker/nd/modify-subaccount-deposit-address': 5 / 3,
                        'broker/nd/rebate-per-orders': 36000,
                        'finance/sfp/dcd/quote': 10,
                        'finance/sfp/dcd/order': 10,
                        'broker/nd/report-subaccount-ip': 0.25,
                        'broker/fd/rebate-per-orders': 36000,
                    },
                },
            },
            'fees': {
                'trading': {
                    'taker': this.parseNumber('0.0015'),
                    'maker': this.parseNumber('0.0010'),
                },
                'spot': {
                    'taker': this.parseNumber('0.0015'),
                    'maker': this.parseNumber('0.0010'),
                },
                'future': {
                    'taker': this.parseNumber('0.0005'),
                    'maker': this.parseNumber('0.0002'),
                },
                'swap': {
                    'taker': this.parseNumber('0.00050'),
                    'maker': this.parseNumber('0.00020'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'password': true,
            },
            'exceptions': {
                'exact': {
                    // Public error codes from 50000-53999
                    // General Class
                    '1': errors.ExchangeError,
                    '2': errors.ExchangeError,
                    '50000': errors.BadRequest,
                    '50001': errors.OnMaintenance,
                    '50002': errors.BadRequest,
                    '50004': errors.RequestTimeout,
                    '50005': errors.ExchangeNotAvailable,
                    '50006': errors.BadRequest,
                    '50007': errors.AccountSuspended,
                    '50008': errors.AuthenticationError,
                    '50009': errors.AccountSuspended,
                    '50010': errors.ExchangeError,
                    '50011': errors.RateLimitExceeded,
                    '50012': errors.ExchangeError,
                    '50013': errors.ExchangeNotAvailable,
                    '50014': errors.BadRequest,
                    '50015': errors.ExchangeError,
                    '50016': errors.ExchangeError,
                    '50017': errors.ExchangeError,
                    '50018': errors.ExchangeError,
                    '50019': errors.ExchangeError,
                    '50020': errors.ExchangeError,
                    '50021': errors.ExchangeError,
                    '50022': errors.ExchangeError,
                    '50023': errors.ExchangeError,
                    '50024': errors.BadRequest,
                    '50025': errors.ExchangeError,
                    '50026': errors.ExchangeNotAvailable,
                    '50027': errors.PermissionDenied,
                    '50028': errors.ExchangeError,
                    '50044': errors.BadRequest,
                    '50061': errors.ExchangeError,
                    '50062': errors.ExchangeError,
                    // API Class
                    '50100': errors.ExchangeError,
                    '50101': errors.AuthenticationError,
                    '50102': errors.InvalidNonce,
                    '50103': errors.AuthenticationError,
                    '50104': errors.AuthenticationError,
                    '50105': errors.AuthenticationError,
                    '50106': errors.AuthenticationError,
                    '50107': errors.AuthenticationError,
                    '50108': errors.ExchangeError,
                    '50109': errors.ExchangeError,
                    '50110': errors.PermissionDenied,
                    '50111': errors.AuthenticationError,
                    '50112': errors.AuthenticationError,
                    '50113': errors.AuthenticationError,
                    '50114': errors.AuthenticationError,
                    '50115': errors.BadRequest,
                    // Trade Class
                    '51000': errors.BadRequest,
                    '51001': errors.BadSymbol,
                    '51002': errors.BadSymbol,
                    '51003': errors.BadRequest,
                    '51004': errors.InvalidOrder,
                    '51005': errors.InvalidOrder,
                    '51006': errors.InvalidOrder,
                    '51007': errors.InvalidOrder,
                    '51008': errors.InsufficientFunds,
                    '51009': errors.AccountSuspended,
                    '51010': errors.AccountNotEnabled,
                    '51011': errors.InvalidOrder,
                    '51012': errors.BadSymbol,
                    '51014': errors.BadSymbol,
                    '51015': errors.BadSymbol,
                    '51016': errors.InvalidOrder,
                    '51017': errors.ExchangeError,
                    '51018': errors.ExchangeError,
                    '51019': errors.ExchangeError,
                    '51020': errors.InvalidOrder,
                    '51021': errors.ContractUnavailable,
                    '51022': errors.ContractUnavailable,
                    '51023': errors.ExchangeError,
                    '51024': errors.AccountSuspended,
                    '51025': errors.ExchangeError,
                    '51026': errors.BadSymbol,
                    '51027': errors.ContractUnavailable,
                    '51028': errors.ContractUnavailable,
                    '51029': errors.ContractUnavailable,
                    '51030': errors.ContractUnavailable,
                    '51031': errors.InvalidOrder,
                    '51046': errors.InvalidOrder,
                    '51047': errors.InvalidOrder,
                    '51072': errors.InvalidOrder,
                    '51073': errors.InvalidOrder,
                    '51074': errors.InvalidOrder,
                    '51090': errors.InvalidOrder,
                    '51091': errors.InvalidOrder,
                    '51092': errors.InvalidOrder,
                    '51093': errors.InvalidOrder,
                    '51094': errors.InvalidOrder,
                    '51095': errors.InvalidOrder,
                    '51096': errors.InvalidOrder,
                    '51098': errors.InvalidOrder,
                    '51099': errors.InvalidOrder,
                    '51100': errors.InvalidOrder,
                    '51101': errors.InvalidOrder,
                    '51102': errors.InvalidOrder,
                    '51103': errors.InvalidOrder,
                    '51104': errors.InvalidOrder,
                    '51105': errors.InvalidOrder,
                    '51106': errors.InvalidOrder,
                    '51107': errors.InvalidOrder,
                    '51108': errors.InvalidOrder,
                    '51109': errors.InvalidOrder,
                    '51110': errors.InvalidOrder,
                    '51111': errors.BadRequest,
                    '51112': errors.InvalidOrder,
                    '51113': errors.RateLimitExceeded,
                    '51115': errors.InvalidOrder,
                    '51116': errors.InvalidOrder,
                    '51117': errors.InvalidOrder,
                    '51118': errors.InvalidOrder,
                    '51119': errors.InsufficientFunds,
                    '51120': errors.InvalidOrder,
                    '51121': errors.InvalidOrder,
                    '51122': errors.InvalidOrder,
                    '51124': errors.InvalidOrder,
                    '51125': errors.InvalidOrder,
                    '51126': errors.InvalidOrder,
                    '51127': errors.InsufficientFunds,
                    '51128': errors.InvalidOrder,
                    '51129': errors.InvalidOrder,
                    '51130': errors.BadSymbol,
                    '51131': errors.InsufficientFunds,
                    '51132': errors.InvalidOrder,
                    '51133': errors.InvalidOrder,
                    '51134': errors.InvalidOrder,
                    '51135': errors.InvalidOrder,
                    '51136': errors.InvalidOrder,
                    '51137': errors.InvalidOrder,
                    '51138': errors.InvalidOrder,
                    '51139': errors.InvalidOrder,
                    '51156': errors.BadRequest,
                    '51159': errors.BadRequest,
                    '51162': errors.InvalidOrder,
                    '51163': errors.InvalidOrder,
                    '51166': errors.InvalidOrder,
                    '51174': errors.InvalidOrder,
                    '51185': errors.InvalidOrder,
                    '51201': errors.InvalidOrder,
                    '51202': errors.InvalidOrder,
                    '51203': errors.InvalidOrder,
                    '51204': errors.InvalidOrder,
                    '51205': errors.InvalidOrder,
                    '51250': errors.InvalidOrder,
                    '51251': errors.InvalidOrder,
                    '51252': errors.InvalidOrder,
                    '51253': errors.InvalidOrder,
                    '51254': errors.InvalidOrder,
                    '51255': errors.InvalidOrder,
                    '51256': errors.InvalidOrder,
                    '51257': errors.InvalidOrder,
                    '51258': errors.InvalidOrder,
                    '51259': errors.InvalidOrder,
                    '51260': errors.InvalidOrder,
                    '51261': errors.InvalidOrder,
                    '51262': errors.InvalidOrder,
                    '51263': errors.InvalidOrder,
                    '51264': errors.InvalidOrder,
                    '51265': errors.InvalidOrder,
                    '51267': errors.InvalidOrder,
                    '51268': errors.InvalidOrder,
                    '51269': errors.InvalidOrder,
                    '51270': errors.InvalidOrder,
                    '51271': errors.InvalidOrder,
                    '51272': errors.InvalidOrder,
                    '51273': errors.InvalidOrder,
                    '51274': errors.InvalidOrder,
                    '51275': errors.InvalidOrder,
                    '51276': errors.InvalidOrder,
                    '51277': errors.InvalidOrder,
                    '51278': errors.InvalidOrder,
                    '51279': errors.InvalidOrder,
                    '51280': errors.InvalidOrder,
                    '51321': errors.InvalidOrder,
                    '51322': errors.InvalidOrder,
                    '51323': errors.BadRequest,
                    '51324': errors.BadRequest,
                    '51325': errors.InvalidOrder,
                    '51327': errors.InvalidOrder,
                    '51328': errors.InvalidOrder,
                    '51329': errors.InvalidOrder,
                    '51330': errors.InvalidOrder,
                    '51400': errors.OrderNotFound,
                    '51401': errors.OrderNotFound,
                    '51402': errors.OrderNotFound,
                    '51403': errors.InvalidOrder,
                    '51404': errors.InvalidOrder,
                    '51405': errors.ExchangeError,
                    '51406': errors.ExchangeError,
                    '51407': errors.BadRequest,
                    '51408': errors.ExchangeError,
                    '51409': errors.ExchangeError,
                    '51410': errors.CancelPending,
                    '51500': errors.ExchangeError,
                    '51501': errors.ExchangeError,
                    '51502': errors.InsufficientFunds,
                    '51503': errors.ExchangeError,
                    '51506': errors.ExchangeError,
                    '51508': errors.ExchangeError,
                    '51509': errors.ExchangeError,
                    '51510': errors.ExchangeError,
                    '51511': errors.ExchangeError,
                    '51600': errors.ExchangeError,
                    '51601': errors.ExchangeError,
                    '51602': errors.ExchangeError,
                    '51603': errors.OrderNotFound,
                    '51732': errors.AuthenticationError,
                    '51733': errors.AuthenticationError,
                    '51734': errors.AuthenticationError,
                    '51735': errors.ExchangeError,
                    '51736': errors.InsufficientFunds,
                    // Data class
                    '52000': errors.ExchangeError,
                    // SPOT/MARGIN error codes 54000-54999
                    '54000': errors.ExchangeError,
                    '54001': errors.ExchangeError,
                    // Trading bot Error Code from 55100 to 55999
                    '55100': errors.InvalidOrder,
                    '55101': errors.InvalidOrder,
                    '55102': errors.InvalidOrder,
                    '55103': errors.InvalidOrder,
                    '55104': errors.InvalidOrder,
                    '55111': errors.InvalidOrder,
                    '55112': errors.InvalidOrder,
                    '55113': errors.InvalidOrder,
                    // FUNDING error codes 58000-58999
                    '58000': errors.ExchangeError,
                    '58001': errors.AuthenticationError,
                    '58002': errors.PermissionDenied,
                    '58003': errors.ExchangeError,
                    '58004': errors.AccountSuspended,
                    '58005': errors.ExchangeError,
                    '58006': errors.ExchangeError,
                    '58007': errors.ExchangeError,
                    '58100': errors.ExchangeError,
                    '58101': errors.AccountSuspended,
                    '58102': errors.RateLimitExceeded,
                    '58103': errors.ExchangeError,
                    '58104': errors.ExchangeError,
                    '58105': errors.ExchangeError,
                    '58106': errors.ExchangeError,
                    '58107': errors.ExchangeError,
                    '58108': errors.ExchangeError,
                    '58109': errors.ExchangeError,
                    '58110': errors.ExchangeError,
                    '58111': errors.ExchangeError,
                    '58112': errors.ExchangeError,
                    '58114': errors.ExchangeError,
                    '58115': errors.ExchangeError,
                    '58116': errors.ExchangeError,
                    '58117': errors.ExchangeError,
                    '58125': errors.BadRequest,
                    '58126': errors.BadRequest,
                    '58127': errors.BadRequest,
                    '58128': errors.BadRequest,
                    '58200': errors.ExchangeError,
                    '58201': errors.ExchangeError,
                    '58202': errors.ExchangeError,
                    '58203': errors.InvalidAddress,
                    '58204': errors.AccountSuspended,
                    '58205': errors.ExchangeError,
                    '58206': errors.ExchangeError,
                    '58207': errors.InvalidAddress,
                    '58208': errors.ExchangeError,
                    '58209': errors.ExchangeError,
                    '58210': errors.ExchangeError,
                    '58211': errors.ExchangeError,
                    '58212': errors.ExchangeError,
                    '58213': errors.AuthenticationError,
                    '58221': errors.BadRequest,
                    '58222': errors.BadRequest,
                    '58224': errors.BadRequest,
                    '58227': errors.BadRequest,
                    '58228': errors.BadRequest,
                    '58229': errors.InsufficientFunds,
                    '58300': errors.ExchangeError,
                    '58350': errors.InsufficientFunds,
                    // Account error codes 59000-59999
                    '59000': errors.ExchangeError,
                    '59001': errors.ExchangeError,
                    '59100': errors.ExchangeError,
                    '59101': errors.ExchangeError,
                    '59102': errors.ExchangeError,
                    '59103': errors.InsufficientFunds,
                    '59104': errors.ExchangeError,
                    '59105': errors.ExchangeError,
                    '59106': errors.ExchangeError,
                    '59107': errors.ExchangeError,
                    '59108': errors.InsufficientFunds,
                    '59109': errors.ExchangeError,
                    '59128': errors.InvalidOrder,
                    '59200': errors.InsufficientFunds,
                    '59201': errors.InsufficientFunds,
                    '59216': errors.BadRequest,
                    '59260': errors.PermissionDenied,
                    '59262': errors.PermissionDenied,
                    '59300': errors.ExchangeError,
                    '59301': errors.ExchangeError,
                    '59313': errors.ExchangeError,
                    '59401': errors.ExchangeError,
                    '59500': errors.ExchangeError,
                    '59501': errors.ExchangeError,
                    '59502': errors.ExchangeError,
                    '59503': errors.ExchangeError,
                    '59504': errors.ExchangeError,
                    '59505': errors.ExchangeError,
                    '59506': errors.ExchangeError,
                    '59507': errors.ExchangeError,
                    '59508': errors.AccountSuspended,
                    '59642': errors.BadRequest,
                    '59643': errors.ExchangeError,
                    // WebSocket error Codes from 60000-63999
                    '60001': errors.AuthenticationError,
                    '60002': errors.AuthenticationError,
                    '60003': errors.AuthenticationError,
                    '60004': errors.AuthenticationError,
                    '60005': errors.AuthenticationError,
                    '60006': errors.InvalidNonce,
                    '60007': errors.AuthenticationError,
                    '60008': errors.AuthenticationError,
                    '60009': errors.AuthenticationError,
                    '60010': errors.AuthenticationError,
                    '60011': errors.AuthenticationError,
                    '60012': errors.BadRequest,
                    '60013': errors.BadRequest,
                    '60014': errors.RateLimitExceeded,
                    '60015': errors.NetworkError,
                    '60016': errors.ExchangeNotAvailable,
                    '60017': errors.BadRequest,
                    '60018': errors.BadRequest,
                    '60019': errors.BadRequest,
                    '63999': errors.ExchangeError,
                    '70010': errors.BadRequest,
                    '70013': errors.BadRequest,
                    '70016': errors.BadRequest, // Please specify your instrument settings for at least one instType.
                },
                'broad': {
                    'Internal Server Error': errors.ExchangeNotAvailable,
                    'server error': errors.ExchangeNotAvailable, // {"code":500,"data":{},"detailMsg":"","error_code":"500","error_message":"server error 1236805249","msg":"server error 1236805249"}
                },
            },
            'httpExceptions': {
                '429': errors.ExchangeNotAvailable, // https://github.com/ccxt/ccxt/issues/9612
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                'sandboxMode': false,
                'defaultNetwork': 'ERC20',
                'defaultNetworks': {
                    'ETH': 'ERC20',
                    'BTC': 'BTC',
                    'USDT': 'TRC20',
                },
                'networks': {
                    'BTC': 'Bitcoin',
                    'BTCLN': 'Lightning',
                    'BEP20': 'BSC',
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
                    'CRC20': 'Crypto',
                    // sorted
                    'ACA': 'Acala',
                    'ALGO': 'Algorand',
                    'BHP': 'BHP',
                    'APT': 'Aptos',
                    'ARBONE': 'Arbitrum One',
                    'AVAXC': 'Avalanche C',
                    'AVAXX': 'Avalanche X-Chain',
                    'ARK': 'ARK',
                    'AR': 'Arweave',
                    'ASTR': 'Astar',
                    'BCH': 'BitcoinCash',
                    'BSV': 'Bitcoin SV',
                    'BTM': 'Bytom',
                    'ADA': 'Cardano',
                    'CSPR': 'Casper',
                    'CELO': 'CELO',
                    'XCH': 'Chia',
                    'CHZ': 'Chiliz',
                    'ATOM': 'Cosmos',
                    'TRUE': 'TrueChain',
                    'DCR': 'Decred',
                    'DGB': 'Digibyte',
                    'DOGE': 'Dogecoin',
                    'XEC': 'XEC',
                    'EGLD': 'Elrond',
                    'EOS': 'EOS',
                    'ETC': 'Ethereum Classic',
                    'ETHW': 'EthereumPow',
                    'FTM': 'Fantom',
                    'FIL': 'Filecoin',
                    'FLOW': 'FLOW',
                    'FSN': 'Fusion',
                    'ONE': 'Harmony',
                    'HBAR': 'Hedera',
                    'HNT': 'Helium',
                    'ZEN': 'Horizen',
                    'ICX': 'ICON',
                    'ICP': 'Dfinity',
                    'IOST': 'IOST',
                    'IOTA': 'MIOTA',
                    'KDA': 'Kadena',
                    'KAR': 'KAR',
                    'KLAY': 'Klaytn',
                    'KSM': 'Kusama',
                    'LSK': 'Lisk',
                    'LTC': 'Litecoin',
                    'METIS': 'Metis',
                    'MINA': 'Mina',
                    'XMR': 'Monero',
                    'GLRM': 'Moonbeam',
                    'MOVR': 'Moonriver',
                    'NANO': 'Nano',
                    'NEAR': 'NEAR',
                    'NAS': 'Nebulas',
                    'NEM': 'New Economy Movement',
                    'NULS': 'NULS',
                    'OASYS': 'OASYS',
                    'OKC': 'OKC',
                    'ONT': 'Ontology',
                    'OPTIMISM': 'Optimism',
                    'LAT': 'PlatON',
                    'DOT': 'Polkadot',
                    'MATIC': 'Polygon',
                    'RVN': 'Ravencoin',
                    'XRP': 'Ripple',
                    'SC': 'Siacoin',
                    'SOL': 'Solana',
                    'STX': 'l-Stacks',
                    'XLM': 'Stellar Lumens',
                    'XTZ': 'Tezos',
                    'TON': 'TON',
                    'THETA': 'Theta',
                    'VSYS': 'VSYSTEMS',
                    'WAVES': 'WAVES',
                    'WAX': 'Wax',
                    'ZEC': 'Zcash',
                    'ZIL': 'Zilliqa',
                    'ZKSYNC': 'ZKSYNC',
                    // 'NEON3': 'N3', // tbd
                    // undetermined : "CELO-TOKEN", "Digital Cash", Khala
                    // todo: uncomment below after consensus
                    // 'AELF': 'AELF',
                    // 'BITCOINDIAMOND': 'Bitcoin Diamond',
                    // 'BITCOINGOLD': 'BitcoinGold',
                    // 'YOYOW': 'YOYOW',
                    // 'QTUM': 'Quantum',
                    // 'INTCHAIN': 'INTCHAIN',
                    // 'YOUCHAIN': 'YOUCHAIN',
                    // 'RONIN': 'Ronin',
                    // 'OEC': 'OEC',
                    // 'WAYIKICHAIN': 'WGRT',
                    // 'MDNA': 'DNA',
                    // 'STEP': 'Step Network',
                    // 'EMINER': 'Eminer',
                    // 'CYBERMILES': 'CyberMiles',
                    // 'HYPERCASH': 'HyperCash',
                    // 'CONFLUX': 'Conflux',
                    // 'CORTEX': 'Cortex',
                    // 'TERRA': 'Terra',
                    // 'TERRACLASSIC': 'Terra Classic',
                },
                'fetchOpenInterestHistory': {
                    'timeframes': {
                        '5m': '5m',
                        '1h': '1H',
                        '8h': '8H',
                        '1d': '1D',
                        '5M': '5m',
                        '1H': '1H',
                        '8H': '8H',
                        '1D': '1D',
                    },
                },
                'fetchOHLCV': {
                    // 'type': 'Candles', // Candles or HistoryCandles, IndexCandles, MarkPriceCandles
                    'timezone': 'UTC', // UTC, HK
                },
                'fetchPositions': {
                    'method': 'privateGetAccountPositions', // privateGetAccountPositions or privateGetAccountPositionsHistory
                },
                'createOrder': 'privatePostTradeBatchOrders',
                'createMarketBuyOrderRequiresPrice': false,
                'fetchMarkets': ['spot', 'future', 'swap', 'option'],
                'defaultType': 'spot',
                // 'fetchBalance': {
                //     'type': 'spot', // 'funding', 'trading', 'spot'
                // },
                'fetchLedger': {
                    'method': 'privateGetAccountBills', // privateGetAccountBills, privateGetAccountBillsArchive, privateGetAssetBills
                },
                // 6: Funding account, 18: Trading account
                'fetchOrder': {
                    'method': 'privateGetTradeOrder', // privateGetTradeOrdersAlgoHistory
                },
                'fetchOpenOrders': {
                    'method': 'privateGetTradeOrdersPending', // privateGetTradeOrdersAlgoPending
                },
                'cancelOrders': {
                    'method': 'privatePostTradeCancelBatchOrders', // privatePostTradeCancelAlgos
                },
                'fetchCanceledOrders': {
                    'method': 'privateGetTradeOrdersHistory', // privateGetTradeOrdersAlgoHistory
                },
                'fetchClosedOrders': {
                    'method': 'privateGetTradeOrdersHistory', // privateGetTradeOrdersAlgoHistory
                },
                'withdraw': {
                    // a funding password credential is required by the exchange for the
                    // withdraw call (not to be confused with the api password credential)
                    'password': undefined,
                    'pwd': undefined, // password or pwd both work
                },
                'algoOrderTypes': {
                    'conditional': true,
                    'trigger': true,
                    'oco': true,
                    'move_order_stop': true,
                    'iceberg': true,
                    'twap': true,
                },
                'accountsByType': {
                    'funding': '6',
                    'trading': '18',
                    'spot': '18',
                    'future': '18',
                    'futures': '18',
                    'margin': '18',
                    'swap': '18',
                    'option': '18',
                },
                'accountsById': {
                    '6': 'funding',
                    '18': 'trading', // unified trading account
                },
                'exchangeType': {
                    'spot': 'SPOT',
                    'margin': 'MARGIN',
                    'swap': 'SWAP',
                    'future': 'FUTURES',
                    'futures': 'FUTURES',
                    'option': 'OPTION',
                    'SPOT': 'SPOT',
                    'MARGIN': 'MARGIN',
                    'SWAP': 'SWAP',
                    'FUTURES': 'FUTURES',
                    'OPTION': 'OPTION',
                },
                'brokerId': 'e847386590ce4dBC',
            },
            'commonCurrencies': {
                // the exchange refers to ERC20 version of Aeternity (AEToken)
                'AE': 'AET',
                'WIN': 'WINTOKEN', // https://github.com/ccxt/ccxt/issues/5701
            },
        });
    }
    handleMarketTypeAndParams(methodName, market = undefined, params = {}, defaultValue = undefined) {
        const instType = this.safeString(params, 'instType');
        params = this.omit(params, 'instType');
        const type = this.safeString(params, 'type');
        if ((type === undefined) && (instType !== undefined)) {
            params['type'] = instType;
        }
        return super.handleMarketTypeAndParams(methodName, market, params, defaultValue);
    }
    convertToInstrumentType(type) {
        const exchangeTypes = this.safeDict(this.options, 'exchangeType', {});
        return this.safeString(exchangeTypes, type, type);
    }
    createExpiredOptionMarket(symbol) {
        // support expired option contracts
        const quote = 'USD';
        const optionParts = symbol.split('-');
        const symbolBase = symbol.split('/');
        let base = undefined;
        if (symbol.indexOf('/') > -1) {
            base = this.safeString(symbolBase, 0);
        }
        else {
            base = this.safeString(optionParts, 0);
        }
        const settle = base;
        const expiry = this.safeString(optionParts, 2);
        const strike = this.safeString(optionParts, 3);
        const optionType = this.safeString(optionParts, 4);
        const datetime = this.convertExpireDate(expiry);
        const timestamp = this.parse8601(datetime);
        return {
            'id': base + '-' + quote + '-' + expiry + '-' + strike + '-' + optionType,
            'symbol': base + '/' + quote + ':' + settle + '-' + expiry + '-' + strike + '-' + optionType,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'active': false,
            'type': 'option',
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': false,
            'future': false,
            'option': true,
            'margin': false,
            'contract': true,
            'contractSize': this.parseNumber('1'),
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': (optionType === 'C') ? 'call' : 'put',
            'strike': this.parseNumber(strike),
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': undefined,
        };
    }
    safeMarket(marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.indexOf('-C') > -1) || (marketId.indexOf('-P') > -1));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket(marketId);
        }
        return super.safeMarket(marketId, market, delimiter, marketType);
    }
    async fetchStatus(params = {}) {
        /**
         * @method
         * @name okx#fetchStatus
         * @description the latest known information on the availability of the exchange API
         * @see https://www.okx.com/docs-v5/en/#status-get-status
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
         */
        const response = await this.publicGetSystemStatus(params);
        //
        // Note, if there is no maintenance around, the 'data' array is empty
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "begin": "1621328400000",
        //                 "end": "1621329000000",
        //                 "href": "https://www.okx.com/support/hc/en-us/articles/360060882172",
        //                 "scheDesc": "",
        //                 "serviceType": "1", // 0 WebSocket, 1 Spot/Margin, 2 Futures, 3 Perpetual, 4 Options, 5 Trading service
        //                 "state": "scheduled", // ongoing, completed, canceled
        //                 "system": "classic", // classic, unified
        //                 "title": "Classic Spot System Upgrade"
        //             },
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const dataLength = data.length;
        const update = {
            'updated': undefined,
            'status': (dataLength === 0) ? 'ok' : 'maintenance',
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
        for (let i = 0; i < data.length; i++) {
            const event = data[i];
            const state = this.safeString(event, 'state');
            update['eta'] = this.safeInteger(event, 'end');
            update['url'] = this.safeString(event, 'href');
            if (state === 'ongoing') {
                update['status'] = 'maintenance';
            }
            else if (state === 'scheduled') {
                update['status'] = 'ok';
            }
            else if (state === 'completed') {
                update['status'] = 'ok';
            }
            else if (state === 'canceled') {
                update['status'] = 'ok';
            }
        }
        return update;
    }
    async fetchTime(params = {}) {
        /**
         * @method
         * @name okx#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-system-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetPublicTime(params);
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {"ts": "1621247923668"}
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.safeInteger(first, 'ts');
    }
    async fetchAccounts(params = {}) {
        /**
         * @method
         * @name okx#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-account-configuration
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        const response = await this.privateGetAccountConfig(params);
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "acctLv": "2",
        //                 "autoLoan": false,
        //                 "ctIsoMode": "automatic",
        //                 "greeksType": "PA",
        //                 "level": "Lv1",
        //                 "levelTmp": "",
        //                 "mgnIsoMode": "automatic",
        //                 "posMode": "long_short_mode",
        //                 "uid": "88018754289672195"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const accountId = this.safeString(account, 'uid');
            const type = this.safeString(account, 'acctLv');
            result.push({
                'id': accountId,
                'type': type,
                'currency': undefined,
                'info': account,
                'code': undefined,
            });
        }
        return result;
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name okx#fetchMarkets
         * @description retrieves data on all markets for okx
         * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const types = this.safeList(this.options, 'fetchMarkets', []);
        let promises = [];
        let result = [];
        for (let i = 0; i < types.length; i++) {
            promises.push(this.fetchMarketsByType(types[i], params));
        }
        promises = await Promise.all(promises);
        for (let i = 0; i < promises.length; i++) {
            result = this.arrayConcat(result, promises[i]);
        }
        return result;
    }
    parseMarket(market) {
        //
        //     {
        //         "alias": "", // this_week, next_week, quarter, next_quarter
        //         "baseCcy": "BTC",
        //         "category": "1",
        //         "ctMult": "",
        //         "ctType": "", // inverse, linear
        //         "ctVal": "",
        //         "ctValCcy": "",
        //         "expTime": "",
        //         "instId": "BTC-USDT", // BTC-USD-210521, CSPR-USDT-SWAP, BTC-USD-210517-44000-C
        //         "instType": "SPOT", // SPOT, FUTURES, SWAP, OPTION
        //         "lever": "10",
        //         "listTime": "1548133413000",
        //         "lotSz": "0.00000001",
        //         "minSz": "0.00001",
        //         "optType": "",
        //         "quoteCcy": "USDT",
        //         "settleCcy": "",
        //         "state": "live",
        //         "stk": "",
        //         "tickSz": "0.1",
        //         "uly": ""
        //     }
        //
        //     {
        //         "alias": "",
        //         "baseCcy": "",
        //         "category": "1",
        //         "ctMult": "0.1",
        //         "ctType": "",
        //         "ctVal": "1",
        //         "ctValCcy": "BTC",
        //         "expTime": "1648195200000",
        //         "instId": "BTC-USD-220325-194000-P",
        //         "instType": "OPTION",
        //         "lever": "",
        //         "listTime": "1631262612280",
        //         "lotSz": "1",
        //         "minSz": "1",
        //         "optType": "P",
        //         "quoteCcy": "",
        //         "settleCcy": "BTC",
        //         "state": "live",
        //         "stk": "194000",
        //         "tickSz": "0.0005",
        //         "uly": "BTC-USD"
        //     }
        //
        const id = this.safeString(market, 'instId');
        let type = this.safeStringLower(market, 'instType');
        if (type === 'futures') {
            type = 'future';
        }
        const spot = (type === 'spot');
        const future = (type === 'future');
        const swap = (type === 'swap');
        const option = (type === 'option');
        const contract = swap || future || option;
        let baseId = this.safeString(market, 'baseCcy');
        let quoteId = this.safeString(market, 'quoteCcy');
        const settleId = this.safeString(market, 'settleCcy');
        const settle = this.safeCurrencyCode(settleId);
        const underlying = this.safeString(market, 'uly');
        if ((underlying !== undefined) && !spot) {
            const parts = underlying.split('-');
            baseId = this.safeString(parts, 0);
            quoteId = this.safeString(parts, 1);
        }
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        let symbol = base + '/' + quote;
        let expiry = undefined;
        let strikePrice = undefined;
        let optionType = undefined;
        if (contract) {
            symbol = symbol + ':' + settle;
            expiry = this.safeInteger(market, 'expTime');
            if (future) {
                const ymd = this.yymmdd(expiry);
                symbol = symbol + '-' + ymd;
            }
            else if (option) {
                strikePrice = this.safeString(market, 'stk');
                optionType = this.safeString(market, 'optType');
                const ymd = this.yymmdd(expiry);
                symbol = symbol + '-' + ymd + '-' + strikePrice + '-' + optionType;
                optionType = (optionType === 'P') ? 'put' : 'call';
            }
        }
        const tickSize = this.safeString(market, 'tickSz');
        const fees = this.safeDict2(this.fees, type, 'trading', {});
        let maxLeverage = this.safeString(market, 'lever', '1');
        maxLeverage = Precise["default"].stringMax(maxLeverage, '1');
        const maxSpotCost = this.safeNumber(market, 'maxMktSz');
        return this.extend(fees, {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': spot && (Precise["default"].stringGt(maxLeverage, '1')),
            'swap': swap,
            'future': future,
            'option': option,
            'active': true,
            'contract': contract,
            'linear': contract ? (quoteId === settleId) : undefined,
            'inverse': contract ? (baseId === settleId) : undefined,
            'contractSize': contract ? this.safeNumber(market, 'ctVal') : undefined,
            'expiry': expiry,
            'expiryDatetime': this.iso8601(expiry),
            'strike': strikePrice,
            'optionType': optionType,
            'created': this.safeInteger(market, 'listTime'),
            'precision': {
                'amount': this.safeNumber(market, 'lotSz'),
                'price': this.parseNumber(tickSize),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber('1'),
                    'max': this.parseNumber(maxLeverage),
                },
                'amount': {
                    'min': this.safeNumber(market, 'minSz'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': contract ? undefined : maxSpotCost,
                },
            },
            'info': market,
        });
    }
    async fetchMarketsByType(type, params = {}) {
        const request = {
            'instType': this.convertToInstrumentType(type),
        };
        if (type === 'option') {
            const optionsUnderlying = this.safeList(this.options, 'defaultUnderlying', ['BTC-USD', 'ETH-USD']);
            const promises = [];
            for (let i = 0; i < optionsUnderlying.length; i++) {
                const underlying = optionsUnderlying[i];
                request['uly'] = underlying;
                promises.push(this.publicGetPublicInstruments(this.extend(request, params)));
            }
            const promisesResult = await Promise.all(promises);
            let markets = [];
            for (let i = 0; i < promisesResult.length; i++) {
                const res = this.safeDict(promisesResult, i, {});
                const options = this.safeList(res, 'data', []);
                markets = this.arrayConcat(markets, options);
            }
            return this.parseMarkets(markets);
        }
        const response = await this.publicGetPublicInstruments(this.extend(request, params));
        //
        // spot, future, swap, option
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "alias": "", // this_week, next_week, quarter, next_quarter
        //                 "baseCcy": "BTC",
        //                 "category": "1",
        //                 "ctMult": "",
        //                 "ctType": "", // inverse, linear
        //                 "ctVal": "",
        //                 "ctValCcy": "",
        //                 "expTime": "",
        //                 "instId": "BTC-USDT", // BTC-USD-210521, CSPR-USDT-SWAP, BTC-USD-210517-44000-C
        //                 "instType": "SPOT", // SPOT, FUTURES, SWAP, OPTION
        //                 "lever": "10",
        //                 "listTime": "1548133413000",
        //                 "lotSz": "0.00000001",
        //                 "minSz": "0.00001",
        //                 "optType": "",
        //                 "quoteCcy": "USDT",
        //                 "settleCcy": "",
        //                 "state": "live",
        //                 "stk": "",
        //                 "tickSz": "0.1",
        //                 "uly": ""
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const dataResponse = this.safeList(response, 'data', []);
        return this.parseMarkets(dataResponse);
    }
    safeNetwork(networkId) {
        const networksById = {
            'Bitcoin': 'BTC',
            'Omni': 'OMNI',
            'TRON': 'TRC20',
        };
        return this.safeString(networksById, networkId, networkId);
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name okx#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        // this endpoint requires authentication
        // while fetchCurrencies is a public API method by design
        // therefore we check the keys here
        // and fallback to generating the currencies from the markets
        const isSandboxMode = this.safeBool(this.options, 'sandboxMode', false);
        if (!this.checkRequiredCredentials(false) || isSandboxMode) {
            return undefined;
        }
        //
        // has['fetchCurrencies'] is currently set to true, but an unauthorized request returns
        //
        //     {"msg":"Request header “OK_ACCESS_KEY“ can't be empty.","code":"50103"}
        //
        const response = await this.privateGetAssetCurrencies(params);
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "canDep": true,
        //                "canInternal": false,
        //                "canWd": true,
        //                "ccy": "USDT",
        //                "chain": "USDT-TRC20",
        //                "logoLink": "https://static.coinall.ltd/cdn/assets/imgs/221/5F74EB20302D7761.png",
        //                "mainNet": false,
        //                "maxFee": "1.6",
        //                "maxWd": "8852150",
        //                "minFee": "0.8",
        //                "minWd": "2",
        //                "name": "Tether",
        //                "usedWdQuota": "0",
        //                "wdQuota": "500",
        //                "wdTickSz": "3"
        //            },
        //            {
        //                "canDep": true,
        //                "canInternal": false,
        //                "canWd": true,
        //                "ccy": "USDT",
        //                "chain": "USDT-ERC20",
        //                "logoLink": "https://static.coinall.ltd/cdn/assets/imgs/221/5F74EB20302D7761.png",
        //                "mainNet": false,
        //                "maxFee": "16",
        //                "maxWd": "8852150",
        //                "minFee": "8",
        //                "minWd": "2",
        //                "name": "Tether",
        //                "usedWdQuota": "0",
        //                "wdQuota": "500",
        //                "wdTickSz": "3"
        //            },
        //            ...
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const result = {};
        const dataByCurrencyId = this.groupBy(data, 'ccy');
        const currencyIds = Object.keys(dataByCurrencyId);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const currency = this.safeCurrency(currencyId);
            const code = currency['code'];
            const chains = dataByCurrencyId[currencyId];
            const networks = {};
            let currencyActive = false;
            let depositEnabled = false;
            let withdrawEnabled = false;
            let maxPrecision = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const canDeposit = this.safeBool(chain, 'canDep');
                depositEnabled = (canDeposit) ? canDeposit : depositEnabled;
                const canWithdraw = this.safeBool(chain, 'canWd');
                withdrawEnabled = (canWithdraw) ? canWithdraw : withdrawEnabled;
                const canInternal = this.safeBool(chain, 'canInternal');
                const active = (canDeposit && canWithdraw && canInternal) ? true : false;
                currencyActive = (active) ? active : currencyActive;
                const networkId = this.safeString(chain, 'chain');
                if ((networkId !== undefined) && (networkId.indexOf('-') >= 0)) {
                    const parts = networkId.split('-');
                    const chainPart = this.safeString(parts, 1, networkId);
                    const networkCode = this.networkIdToCode(chainPart, currency['code']);
                    const precision = this.parsePrecision(this.safeString(chain, 'wdTickSz'));
                    if (maxPrecision === undefined) {
                        maxPrecision = precision;
                    }
                    else {
                        maxPrecision = Precise["default"].stringMin(maxPrecision, precision);
                    }
                    networks[networkCode] = {
                        'id': networkId,
                        'network': networkCode,
                        'active': active,
                        'deposit': canDeposit,
                        'withdraw': canWithdraw,
                        'fee': this.safeNumber(chain, 'minFee'),
                        'precision': this.parseNumber(precision),
                        'limits': {
                            'withdraw': {
                                'min': this.safeNumber(chain, 'minWd'),
                                'max': this.safeNumber(chain, 'maxWd'),
                            },
                        },
                        'info': chain,
                    };
                }
            }
            const firstChain = this.safeDict(chains, 0, {});
            result[code] = {
                'info': undefined,
                'code': code,
                'id': currencyId,
                'name': this.safeString(firstChain, 'name'),
                'active': currencyActive,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': this.parseNumber(maxPrecision),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.method] 'publicGetMarketBooksFull' or 'publicGetMarketBooks' default is 'publicGetMarketBooks'
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        let method = undefined;
        [method, params] = this.handleOptionAndParams(params, 'fetchOrderBook', 'method', 'publicGetMarketBooks');
        if (method === 'publicGetMarketBooksFull' && limit === undefined) {
            limit = 5000;
        }
        limit = (limit === undefined) ? 100 : limit;
        if (limit !== undefined) {
            request['sz'] = limit; // max 400
        }
        let response = undefined;
        if ((method === 'publicGetMarketBooksFull') || (limit > 400)) {
            response = await this.publicGetMarketBooksFull(this.extend(request, params));
        }
        else {
            response = await this.publicGetMarketBooks(this.extend(request, params));
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "asks": [
        //                     ["0.07228","4.211619","0","2"], // price, amount, liquidated orders, total open orders
        //                     ["0.0723","299.880364","0","2"],
        //                     ["0.07231","3.72832","0","1"],
        //                 ],
        //                 "bids": [
        //                     ["0.07221","18.5","0","1"],
        //                     ["0.0722","18.5","0","1"],
        //                     ["0.07219","0.505407","0","1"],
        //                 ],
        //                 "ts": "1621438475342"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        const timestamp = this.safeInteger(first, 'ts');
        return this.parseOrderBook(first, symbol, timestamp);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "instType": "SPOT",
        //         "instId": "ETH-BTC",
        //         "last": "0.07319",
        //         "lastSz": "0.044378",
        //         "askPx": "0.07322",
        //         "askSz": "4.2",
        //         "bidPx": "0.0732",
        //         "bidSz": "6.050058",
        //         "open24h": "0.07801",
        //         "high24h": "0.07975",
        //         "low24h": "0.06019",
        //         "volCcy24h": "11788.887619",
        //         "vol24h": "167493.829229",
        //         "ts": "1621440583784",
        //         "sodUtc0": "0.07872",
        //         "sodUtc8": "0.07345"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'ts');
        const marketId = this.safeString(ticker, 'instId');
        market = this.safeMarket(marketId, market, '-');
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'last');
        const open = this.safeString(ticker, 'open24h');
        const spot = this.safeBool(market, 'spot', false);
        const quoteVolume = spot ? this.safeString(ticker, 'volCcy24h') : undefined;
        const baseVolume = this.safeString(ticker, 'vol24h');
        const high = this.safeString(ticker, 'high24h');
        const low = this.safeString(ticker, 'low24h');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': this.safeString(ticker, 'bidPx'),
            'bidVolume': this.safeString(ticker, 'bidSz'),
            'ask': this.safeString(ticker, 'askPx'),
            'askVolume': this.safeString(ticker, 'askSz'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTicker(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "ETH-BTC",
        //                 "last": "0.07319",
        //                 "lastSz": "0.044378",
        //                 "askPx": "0.07322",
        //                 "askSz": "4.2",
        //                 "bidPx": "0.0732",
        //                 "bidSz": "6.050058",
        //                 "open24h": "0.07801",
        //                 "high24h": "0.07975",
        //                 "low24h": "0.06019",
        //                 "volCcy24h": "11788.887619",
        //                 "vol24h": "167493.829229",
        //                 "ts": "1621440583784",
        //                 "sodUtc0": "0.07872",
        //                 "sodUtc8": "0.07345"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parseTicker(first, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const market = this.getMarketFromSymbols(symbols);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        const request = {
            'instType': this.convertToInstrumentType(marketType),
        };
        if (marketType === 'option') {
            const defaultUnderlying = this.safeString(this.options, 'defaultUnderlying', 'BTC-USD');
            const currencyId = this.safeString2(params, 'uly', 'marketId', defaultUnderlying);
            if (currencyId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchTickers() requires an underlying uly or marketId parameter for options markets');
            }
            else {
                request['uly'] = currencyId;
            }
        }
        const response = await this.publicGetMarketTickers(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "SPOT",
        //                 "instId": "BCD-BTC",
        //                 "last": "0.0000769",
        //                 "lastSz": "5.4788",
        //                 "askPx": "0.0000777",
        //                 "askSz": "3.2197",
        //                 "bidPx": "0.0000757",
        //                 "bidSz": "4.7509",
        //                 "open24h": "0.0000885",
        //                 "high24h": "0.0000917",
        //                 "low24h": "0.0000596",
        //                 "volCcy24h": "9.2877",
        //                 "vol24h": "124824.1985",
        //                 "ts": "1621441741434",
        //                 "sodUtc0": "0.0000905",
        //                 "sodUtc8": "0.0000729"
        //             },
        //         ]
        //     }
        //
        const tickers = this.safeList(response, 'data', []);
        return this.parseTickers(tickers, symbols);
    }
    parseTrade(trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "instId": "ETH-BTC",
        //         "side": "sell",
        //         "sz": "0.119501",
        //         "px": "0.07065",
        //         "tradeId": "15826757",
        //         "ts": "1621446178316"
        //     }
        //
        // option: fetchTrades
        //
        //     {
        //         "fillVol": "0.46387625976562497",
        //         "fwdPx": "26299.754935451125",
        //         "indexPx": "26309.7",
        //         "instFamily": "BTC-USD",
        //         "instId": "BTC-USD-230526-26000-C",
        //         "markPx": "0.042386283557554236",
        //         "optType": "C",
        //         "px": "0.0415",
        //         "side": "sell",
        //         "sz": "90",
        //         "tradeId": "112",
        //         "ts": "1683907480154"
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "side": "buy",
        //         "fillSz": "0.007533",
        //         "fillPx": "2654.98",
        //         "fee": "-0.000007533",
        //         "ordId": "317321390244397056",
        //         "instType": "SPOT",
        //         "instId": "ETH-USDT",
        //         "clOrdId": "",
        //         "posSide": "net",
        //         "billId": "317321390265368576",
        //         "tag": "0",
        //         "execType": "T",
        //         "tradeId": "107601752",
        //         "feeCcy": "ETH",
        //         "ts": "1621927314985"
        //     }
        //
        const id = this.safeString(trade, 'tradeId');
        const marketId = this.safeString(trade, 'instId');
        market = this.safeMarket(marketId, market, '-');
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(trade, 'ts');
        const price = this.safeString2(trade, 'fillPx', 'px');
        const amount = this.safeString2(trade, 'fillSz', 'sz');
        const side = this.safeString(trade, 'side');
        const orderId = this.safeString(trade, 'ordId');
        const feeCostString = this.safeString(trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise["default"].stringNeg(feeCostString);
            const feeCurrencyId = this.safeString(trade, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCostSigned,
                'currency': feeCurrencyCode,
            };
        }
        let takerOrMaker = this.safeString(trade, 'execType');
        if (takerOrMaker === 'T') {
            takerOrMaker = 'taker';
        }
        else if (takerOrMaker === 'M') {
            takerOrMaker = 'maker';
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-trades
         * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-option-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] *only applies to publicGetMarketHistoryTrades* default false, when true will automatically paginate by calling this endpoint multiple times
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor('fetchTrades', symbol, since, limit, params, 'tradeId', 'after', undefined, 100);
        }
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        let response = undefined;
        if (market['option']) {
            response = await this.publicGetPublicOptionTrades(this.extend(request, params));
        }
        else {
            if (limit !== undefined) {
                request['limit'] = limit; // default 100
            }
            let method = undefined;
            [method, params] = this.handleOptionAndParams(params, 'fetchTrades', 'method', 'publicGetMarketTrades');
            if (method === 'publicGetMarketTrades') {
                response = await this.publicGetMarketTrades(this.extend(request, params));
            }
            else if (method === 'publicGetMarketHistoryTrades') {
                response = await this.publicGetMarketHistoryTrades(this.extend(request, params));
            }
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {"instId":"ETH-BTC","side":"sell","sz":"0.119501","px":"0.07065","tradeId":"15826757","ts":"1621446178316"},
        //             {"instId":"ETH-BTC","side":"sell","sz":"0.03","px":"0.07068","tradeId":"15826756","ts":"1621446178066"},
        //             {"instId":"ETH-BTC","side":"buy","sz":"0.507","px":"0.07069","tradeId":"15826755","ts":"1621446175085"},
        //         ]
        //     }
        //
        // option
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "fillVol": "0.46387625976562497",
        //                 "fwdPx": "26299.754935451125",
        //                 "indexPx": "26309.7",
        //                 "instFamily": "BTC-USD",
        //                 "instId": "BTC-USD-230526-26000-C",
        //                 "markPx": "0.042386283557554236",
        //                 "optType": "C",
        //                 "px": "0.0415",
        //                 "side": "sell",
        //                 "sz": "90",
        //                 "tradeId": "112",
        //                 "ts": "1683907480154"
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     [
        //         "1678928760000", // timestamp
        //         "24341.4", // open
        //         "24344", // high
        //         "24313.2", // low
        //         "24323", // close
        //         "628", // contract volume
        //         "2.5819", // base volume
        //         "62800", // quote volume
        //         "0" // candlestick state
        //     ]
        //
        const res = this.handleMarketTypeAndParams('fetchOHLCV', market, undefined);
        const type = res[0];
        const volumeIndex = (type === 'spot') ? 5 : 6;
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, volumeIndex),
        ];
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-mark-price-candlesticks
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-mark-price-candlesticks-history
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-index-candlesticks
         * @see https://www.okx.com/docs-v5/en/#rest-api-market-data-get-index-candlesticks-history
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.price] "mark" or "index" for mark price and index price candles
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 200);
        }
        const price = this.safeString(params, 'price');
        params = this.omit(params, 'price');
        const options = this.safeDict(this.options, 'fetchOHLCV', {});
        const timezone = this.safeString(options, 'timezone', 'UTC');
        if (limit === undefined) {
            limit = 100; // default 100, max 100
        }
        const duration = this.parseTimeframe(timeframe);
        let bar = this.safeString(this.timeframes, timeframe, timeframe);
        if ((timezone === 'UTC') && (duration >= 21600)) { // if utc and timeframe >= 6h
            bar += timezone.toLowerCase();
        }
        const request = {
            'instId': market['id'],
            'bar': bar,
            'limit': limit,
        };
        let defaultType = 'Candles';
        if (since !== undefined) {
            const now = this.milliseconds();
            const durationInMilliseconds = duration * 1000;
            // switch to history candles if since is past the cutoff for current candles
            const historyBorder = now - ((1440 - 1) * durationInMilliseconds);
            if (since < historyBorder) {
                defaultType = 'HistoryCandles';
            }
            const startTime = Math.max(since - 1, 0);
            request['before'] = startTime;
            request['after'] = this.sum(since, durationInMilliseconds * limit);
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['after'] = until;
            params = this.omit(params, 'until');
        }
        defaultType = this.safeString(options, 'type', defaultType); // Candles or HistoryCandles
        const type = this.safeString(params, 'type', defaultType);
        params = this.omit(params, 'type');
        const isHistoryCandles = (type === 'HistoryCandles');
        let response = undefined;
        if (price === 'mark') {
            if (isHistoryCandles) {
                response = await this.publicGetMarketHistoryMarkPriceCandles(this.extend(request, params));
            }
            else {
                response = await this.publicGetMarketMarkPriceCandles(this.extend(request, params));
            }
        }
        else if (price === 'index') {
            request['instId'] = market['info']['instFamily']; // okx index candles require instFamily instead of instId
            if (isHistoryCandles) {
                response = await this.publicGetMarketHistoryIndexCandles(this.extend(request, params));
            }
            else {
                response = await this.publicGetMarketIndexCandles(this.extend(request, params));
            }
        }
        else {
            if (isHistoryCandles) {
                response = await this.publicGetMarketHistoryCandles(this.extend(request, params));
            }
            else {
                response = await this.publicGetMarketCandles(this.extend(request, params));
            }
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             ["1678928760000","24341.4","24344","24313.2","24323","628","2.5819","62800","0"],
        //             ["1678928700000","24324.1","24347.6","24321.7","24341.4","2565","10.5401","256500","1"],
        //             ["1678928640000","24300.2","24324.1","24288","24324.1","3304","13.5937","330400","1"],
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate-history
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params, 100);
        }
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        if (since !== undefined) {
            request['before'] = Math.max(since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicFundingRateHistory(this.extend(request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {
        //                 "instType":"SWAP",
        //                 "instId":"BTC-USDT-SWAP",
        //                 "fundingRate":"0.018",
        //                 "realizedRate":"0.017",
        //                 "fundingTime":"1597026383085"
        //             },
        //             {
        //                 "instType":"SWAP",
        //                 "instId":"BTC-USDT-SWAP",
        //                 "fundingRate":"0.018",
        //                 "realizedRate":"0.017",
        //                 "fundingTime":"1597026383085"
        //             }
        //         ]
        //     }
        //
        const rates = [];
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const rate = data[i];
            const timestamp = this.safeInteger(rate, 'fundingTime');
            rates.push({
                'info': rate,
                'symbol': this.safeSymbol(this.safeString(rate, 'instId')),
                'fundingRate': this.safeNumber(rate, 'realizedRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseBalanceByType(type, response) {
        if (type === 'funding') {
            return this.parseFundingBalance(response);
        }
        else {
            return this.parseTradingBalance(response);
        }
    }
    parseTradingBalance(response) {
        const result = { 'info': response };
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        const timestamp = this.safeInteger(first, 'uTime');
        const details = this.safeList(first, 'details', []);
        for (let i = 0; i < details.length; i++) {
            const balance = details[i];
            const currencyId = this.safeString(balance, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            // it may be incorrect to use total, free and used for swap accounts
            const eq = this.safeString(balance, 'eq');
            const availEq = this.safeString(balance, 'availEq');
            if ((eq === undefined) || (availEq === undefined)) {
                account['free'] = this.safeString(balance, 'availBal');
                account['used'] = this.safeString(balance, 'frozenBal');
            }
            else {
                account['total'] = eq;
                account['free'] = availEq;
            }
            result[code] = account;
        }
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp);
        return this.safeBalance(result);
    }
    parseFundingBalance(response) {
        const result = { 'info': response };
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString(balance, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            // it may be incorrect to use total, free and used for swap accounts
            account['total'] = this.safeString(balance, 'bal');
            account['free'] = this.safeString(balance, 'availBal');
            account['used'] = this.safeString(balance, 'frozenBal');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseTradingFee(fee, market = undefined) {
        // https://www.okx.com/docs-v5/en/#rest-api-account-get-fee-rates
        //
        //     {
        //         "category": "1",
        //         "delivery": "",
        //         "exercise": "",
        //         "instType": "SPOT",
        //         "level": "Lv1",
        //         "maker": "-0.0008",
        //         "taker": "-0.001",
        //         "ts": "1639043138472"
        //     }
        //
        return {
            'info': fee,
            'symbol': this.safeSymbol(undefined, market),
            // OKX returns the fees as negative values opposed to other exchanges, so the sign needs to be flipped
            'maker': this.parseNumber(Precise["default"].stringNeg(this.safeString2(fee, 'maker', 'makerU'))),
            'taker': this.parseNumber(Precise["default"].stringNeg(this.safeString2(fee, 'taker', 'takerU'))),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    async fetchTradingFee(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-fee-rates
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instType': this.convertToInstrumentType(market['type']), // SPOT, MARGIN, SWAP, FUTURES, OPTION
            // "instId": market["id"], // only applicable to SPOT/MARGIN
            // "uly": market["id"], // only applicable to FUTURES/SWAP/OPTION
            // "category": "1", // 1 = Class A, 2 = Class B, 3 = Class C, 4 = Class D
        };
        if (market['spot']) {
            request['instId'] = market['id'];
        }
        else if (market['swap'] || market['future'] || market['option']) {
            request['uly'] = market['baseId'] + '-' + market['quoteId'];
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTradingFee() supports spot, swap, future or option markets only');
        }
        const response = await this.privateGetAccountTradeFee(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "category": "1",
        //                 "delivery": "",
        //                 "exercise": "",
        //                 "instType": "SPOT",
        //                 "level": "Lv1",
        //                 "maker": "-0.0008",
        //                 "taker": "-0.001",
        //                 "ts": "1639043138472"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parseTradingFee(first, market);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name okx#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-balance
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const [marketType, query] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const request = {
        // 'ccy': 'BTC,ETH', // comma-separated list of currency ids
        };
        let response = undefined;
        if (marketType === 'funding') {
            response = await this.privateGetAssetBalances(this.extend(request, query));
        }
        else {
            response = await this.privateGetAccountBalance(this.extend(request, query));
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "adjEq": "",
        //                 "details": [
        //                     {
        //                         "availBal": "",
        //                         "availEq": "28.21006347",
        //                         "cashBal": "28.21006347",
        //                         "ccy": "USDT",
        //                         "crossLiab": "",
        //                         "disEq": "28.2687404020176",
        //                         "eq":"28 .21006347",
        //                         "eqUsd": "28.2687404020176",
        //                         "frozenBal": "0",
        //                         "interest": "",
        //                         "isoEq": "0",
        //                         "isoLiab": "",
        //                         "liab": "",
        //                         "maxLoan": "",
        //                         "mgnRatio": "",
        //                         "notionalLever": "0",
        //                         "ordFrozen": "0",
        //                         "twap": "0",
        //                         "uTime": "1621556539861",
        //                         "upl": "0",
        //                         "uplLiab": ""
        //                     }
        //                 ],
        //                 "imr": "",
        //                 "isoEq": "0",
        //                 "mgnRatio": "",
        //                 "mmr": "",
        //                 "notionalUsd": "",
        //                 "ordFroz": "",
        //                 "totalEq": "28.2687404020176",
        //                 "uTime": "1621556553510"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "adjEq": "",
        //                 "details": [
        //                     {
        //                         "availBal": "0.049",
        //                         "availEq": "",
        //                         "cashBal": "0.049",
        //                         "ccy": "BTC",
        //                         "crossLiab": "",
        //                         "disEq": "1918.55678",
        //                         "eq": "0.049",
        //                         "eqUsd": "1918.55678",
        //                         "frozenBal": "0",
        //                         "interest": "",
        //                         "isoEq": "",
        //                         "isoLiab": "",
        //                         "liab": "",
        //                         "maxLoan": "",
        //                         "mgnRatio": "",
        //                         "notionalLever": "",
        //                         "ordFrozen": "0",
        //                         "twap": "0",
        //                         "uTime": "1621973128591",
        //                         "upl": "",
        //                         "uplLiab": ""
        //                     }
        //                 ],
        //                 "imr": "",
        //                 "isoEq": "",
        //                 "mgnRatio": "",
        //                 "mmr": "",
        //                 "notionalUsd": "",
        //                 "ordFroz": "",
        //                 "totalEq": "1918.55678",
        //                 "uTime": "1622045126908"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        // funding
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "availBal": "0.00005426",
        //                 "bal": 0.0000542600000000,
        //                 "ccy": "BTC",
        //                 "frozenBal": "0"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        return this.parseBalanceByType(marketType, response);
    }
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        /**
         * @method
         * @name okx#createMarketBuyOrderWithCost
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
         * @description create a market buy order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot markets only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        params['tgtCcy'] = 'quote_ccy';
        return await this.createOrder(symbol, 'market', 'buy', cost, undefined, params);
    }
    async createMarketSellOrderWithCost(symbol, cost, params = {}) {
        /**
         * @method
         * @name okx#createMarketSellOrderWithCost
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
         * @description create a market buy order by providing the symbol and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketSellOrderWithCost() supports spot markets only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        params['tgtCcy'] = 'quote_ccy';
        return await this.createOrder(symbol, 'market', 'sell', cost, undefined, params);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
            // 'ccy': currency['id'], // only applicable to cross MARGIN orders in single-currency margin
            // 'clOrdId': clientOrderId, // up to 32 characters, must be unique
            // 'tag': tag, // up to 8 characters
            'side': side,
            // 'posSide': 'long', // long, short, // required in the long/short mode, and can only be long or short (only for future or swap)
            'ordType': type,
            // 'ordType': type, // privatePostTradeOrder: market, limit, post_only, fok, ioc, optimal_limit_ioc
            // 'ordType': type, // privatePostTradeOrderAlgo: conditional, oco, trigger, move_order_stop, iceberg, twap
            'sz': this.amountToPrecision(symbol, amount),
            // 'px': this.priceToPrecision (symbol, price), // limit orders only
            // 'reduceOnly': false,
            //
            // 'triggerPx': 10, // stopPrice (trigger orders)
            // 'orderPx': 10, // Order price if -1, the order will be executed at the market price. (trigger orders)
            // 'triggerPxType': 'last', // Conditional default is last, mark or index (trigger orders)
            //
            // 'tpTriggerPx': 10, // takeProfitPrice (conditional orders)
            // 'tpTriggerPxType': 'last', // Conditional default is last, mark or index (conditional orders)
            // 'tpOrdPx': 10, // Order price for Take-Profit orders, if -1 will be executed at market price (conditional orders)
            //
            // 'slTriggerPx': 10, // stopLossPrice (conditional orders)
            // 'slTriggerPxType': 'last', // Conditional default is last, mark or index (conditional orders)
            // 'slOrdPx': 10, // Order price for Stop-Loss orders, if -1 will be executed at market price (conditional orders)
        };
        const spot = market['spot'];
        const contract = market['contract'];
        const triggerPrice = this.safeValueN(params, ['triggerPrice', 'stopPrice', 'triggerPx']);
        const timeInForce = this.safeString(params, 'timeInForce', 'GTC');
        const takeProfitPrice = this.safeValue2(params, 'takeProfitPrice', 'tpTriggerPx');
        const tpOrdPx = this.safeValue(params, 'tpOrdPx', price);
        const tpTriggerPxType = this.safeString(params, 'tpTriggerPxType', 'last');
        const stopLossPrice = this.safeValue2(params, 'stopLossPrice', 'slTriggerPx');
        const slOrdPx = this.safeValue(params, 'slOrdPx', price);
        const slTriggerPxType = this.safeString(params, 'slTriggerPxType', 'last');
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const stopLossDefined = (stopLoss !== undefined);
        const takeProfit = this.safeValue(params, 'takeProfit');
        const takeProfitDefined = (takeProfit !== undefined);
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callbackRatio');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        const trigger = (triggerPrice !== undefined) || (type === 'trigger');
        const isReduceOnly = this.safeValue(params, 'reduceOnly', false);
        const defaultMarginMode = this.safeString2(this.options, 'defaultMarginMode', 'marginMode', 'cross');
        let marginMode = this.safeString2(params, 'marginMode', 'tdMode'); // cross or isolated, tdMode not ommited so as to be extended into the request
        let margin = false;
        if ((marginMode !== undefined) && (marginMode !== 'cash')) {
            margin = true;
        }
        else {
            marginMode = defaultMarginMode;
            margin = this.safeBool(params, 'margin', false);
        }
        if (spot) {
            if (margin) {
                const defaultCurrency = (side === 'buy') ? market['quote'] : market['base'];
                const currency = this.safeString(params, 'ccy', defaultCurrency);
                request['ccy'] = this.safeCurrencyCode(currency);
            }
            const tradeMode = margin ? marginMode : 'cash';
            request['tdMode'] = tradeMode;
        }
        else if (contract) {
            if (market['swap'] || market['future']) {
                let positionSide = undefined;
                [positionSide, params] = this.handleOptionAndParams(params, 'createOrder', 'positionSide');
                if (positionSide !== undefined) {
                    request['posSide'] = positionSide;
                }
                else {
                    let hedged = undefined;
                    [hedged, params] = this.handleOptionAndParams(params, 'createOrder', 'hedged');
                    if (hedged) {
                        const isBuy = (side === 'buy');
                        const isProtective = (takeProfitPrice !== undefined) || (stopLossPrice !== undefined) || isReduceOnly;
                        if (isProtective) {
                            // in case of protective orders, the posSide should be opposite of position side
                            // reduceOnly is emulated and not natively supported by the exchange
                            request['posSide'] = isBuy ? 'short' : 'long';
                            if (isReduceOnly) {
                                params = this.omit(params, 'reduceOnly');
                            }
                        }
                        else {
                            request['posSide'] = isBuy ? 'long' : 'short';
                        }
                    }
                }
            }
            request['tdMode'] = marginMode;
        }
        const isMarketOrder = type === 'market';
        let postOnly = false;
        [postOnly, params] = this.handlePostOnly(isMarketOrder, type === 'post_only', params);
        params = this.omit(params, ['currency', 'ccy', 'marginMode', 'timeInForce', 'stopPrice', 'triggerPrice', 'clientOrderId', 'stopLossPrice', 'takeProfitPrice', 'slOrdPx', 'tpOrdPx', 'margin', 'stopLoss', 'takeProfit', 'trailingPercent']);
        const ioc = (timeInForce === 'IOC') || (type === 'ioc');
        const fok = (timeInForce === 'FOK') || (type === 'fok');
        const conditional = (stopLossPrice !== undefined) || (takeProfitPrice !== undefined) || (type === 'conditional');
        const marketIOC = (isMarketOrder && ioc) || (type === 'optimal_limit_ioc');
        const defaultTgtCcy = this.safeString(this.options, 'tgtCcy', 'base_ccy');
        const tgtCcy = this.safeString(params, 'tgtCcy', defaultTgtCcy);
        if ((!contract) && (!margin)) {
            request['tgtCcy'] = tgtCcy;
        }
        if (isMarketOrder || marketIOC) {
            request['ordType'] = 'market';
            if (spot && (side === 'buy')) {
                // spot market buy: "sz" can refer either to base currency units or to quote currency units
                // see documentation: https://www.okx.com/docs-v5/en/#rest-api-trade-place-order
                if (tgtCcy === 'quote_ccy') {
                    // quote_ccy: sz refers to units of quote currency
                    let createMarketBuyOrderRequiresPrice = true;
                    [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                    let notional = this.safeNumber2(params, 'cost', 'sz');
                    params = this.omit(params, ['cost', 'sz']);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price !== undefined) {
                            if (notional === undefined) {
                                const amountString = this.numberToString(amount);
                                const priceString = this.numberToString(price);
                                const quoteAmount = Precise["default"].stringMul(amountString, priceString);
                                notional = this.parseNumber(quoteAmount);
                            }
                        }
                        else if (notional === undefined) {
                            throw new errors.InvalidOrder(this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'cost' unified extra parameter or in exchange-specific 'sz' extra parameter (the exchange-specific behaviour)");
                        }
                    }
                    else {
                        notional = (notional === undefined) ? amount : notional;
                    }
                    request['sz'] = this.costToPrecision(symbol, notional);
                }
            }
            if (marketIOC && contract) {
                request['ordType'] = 'optimal_limit_ioc';
            }
        }
        else {
            if ((!trigger) && (!conditional)) {
                request['px'] = this.priceToPrecision(symbol, price);
            }
        }
        if (postOnly) {
            request['ordType'] = 'post_only';
        }
        else if (ioc && !marketIOC) {
            request['ordType'] = 'ioc';
        }
        else if (fok) {
            request['ordType'] = 'fok';
        }
        if (isTrailingPercentOrder) {
            const convertedTrailingPercent = Precise["default"].stringDiv(trailingPercent, '100');
            request['callbackRatio'] = convertedTrailingPercent;
            request['ordType'] = 'move_order_stop';
        }
        else if (stopLossDefined || takeProfitDefined) {
            if (stopLossDefined) {
                const stopLossTriggerPrice = this.safeValueN(stopLoss, ['triggerPrice', 'stopPrice', 'slTriggerPx']);
                if (stopLossTriggerPrice === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires a trigger price in params["stopLoss"]["triggerPrice"], or params["stopLoss"]["stopPrice"], or params["stopLoss"]["slTriggerPx"] for a stop loss order');
                }
                request['slTriggerPx'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
                const stopLossLimitPrice = this.safeValueN(stopLoss, ['price', 'stopLossPrice', 'slOrdPx']);
                const stopLossOrderType = this.safeString(stopLoss, 'type');
                if (stopLossOrderType !== undefined) {
                    const stopLossLimitOrderType = (stopLossOrderType === 'limit');
                    const stopLossMarketOrderType = (stopLossOrderType === 'market');
                    if ((!stopLossLimitOrderType) && (!stopLossMarketOrderType)) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() params["stopLoss"]["type"] must be either "limit" or "market"');
                    }
                    else if (stopLossLimitOrderType) {
                        if (stopLossLimitPrice === undefined) {
                            throw new errors.InvalidOrder(this.id + ' createOrder() requires a limit price in params["stopLoss"]["price"] or params["stopLoss"]["slOrdPx"] for a stop loss limit order');
                        }
                        else {
                            request['slOrdPx'] = this.priceToPrecision(symbol, stopLossLimitPrice);
                        }
                    }
                    else if (stopLossOrderType === 'market') {
                        request['slOrdPx'] = '-1';
                    }
                }
                else if (stopLossLimitPrice !== undefined) {
                    request['slOrdPx'] = this.priceToPrecision(symbol, stopLossLimitPrice); // limit sl order
                }
                else {
                    request['slOrdPx'] = '-1'; // market sl order
                }
                const stopLossTriggerPriceType = this.safeString2(stopLoss, 'triggerPriceType', 'slTriggerPxType', 'last');
                if (stopLossTriggerPriceType !== undefined) {
                    if ((stopLossTriggerPriceType !== 'last') && (stopLossTriggerPriceType !== 'index') && (stopLossTriggerPriceType !== 'mark')) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() stop loss trigger price type must be one of "last", "index" or "mark"');
                    }
                    request['slTriggerPxType'] = stopLossTriggerPriceType;
                }
            }
            if (takeProfitDefined) {
                const takeProfitTriggerPrice = this.safeValueN(takeProfit, ['triggerPrice', 'stopPrice', 'tpTriggerPx']);
                if (takeProfitTriggerPrice === undefined) {
                    throw new errors.InvalidOrder(this.id + ' createOrder() requires a trigger price in params["takeProfit"]["triggerPrice"], or params["takeProfit"]["stopPrice"], or params["takeProfit"]["tpTriggerPx"] for a take profit order');
                }
                request['tpTriggerPx'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
                const takeProfitLimitPrice = this.safeValueN(takeProfit, ['price', 'takeProfitPrice', 'tpOrdPx']);
                const takeProfitOrderType = this.safeString2(takeProfit, 'type', 'tpOrdKind');
                if (takeProfitOrderType !== undefined) {
                    const takeProfitLimitOrderType = (takeProfitOrderType === 'limit');
                    const takeProfitMarketOrderType = (takeProfitOrderType === 'market');
                    if ((!takeProfitLimitOrderType) && (!takeProfitMarketOrderType)) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() params["takeProfit"]["type"] must be either "limit" or "market"');
                    }
                    else if (takeProfitLimitOrderType) {
                        if (takeProfitLimitPrice === undefined) {
                            throw new errors.InvalidOrder(this.id + ' createOrder() requires a limit price in params["takeProfit"]["price"] or params["takeProfit"]["tpOrdPx"] for a take profit limit order');
                        }
                        else {
                            request['tpOrdKind'] = takeProfitOrderType;
                            request['tpOrdPx'] = this.priceToPrecision(symbol, takeProfitLimitPrice);
                        }
                    }
                    else if (takeProfitOrderType === 'market') {
                        request['tpOrdPx'] = '-1';
                    }
                }
                else if (takeProfitLimitPrice !== undefined) {
                    request['tpOrdKind'] = 'limit';
                    request['tpOrdPx'] = this.priceToPrecision(symbol, takeProfitLimitPrice); // limit tp order
                }
                else {
                    request['tpOrdPx'] = '-1'; // market tp order
                }
                const takeProfitTriggerPriceType = this.safeString2(takeProfit, 'triggerPriceType', 'tpTriggerPxType', 'last');
                if (takeProfitTriggerPriceType !== undefined) {
                    if ((takeProfitTriggerPriceType !== 'last') && (takeProfitTriggerPriceType !== 'index') && (takeProfitTriggerPriceType !== 'mark')) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() take profit trigger price type must be one of "last", "index" or "mark"');
                    }
                    request['tpTriggerPxType'] = takeProfitTriggerPriceType;
                }
            }
        }
        else if (trigger) {
            request['ordType'] = 'trigger';
            request['triggerPx'] = this.priceToPrecision(symbol, triggerPrice);
            request['orderPx'] = isMarketOrder ? '-1' : this.priceToPrecision(symbol, price);
        }
        else if (conditional) {
            request['ordType'] = 'conditional';
            const twoWayCondition = ((takeProfitPrice !== undefined) && (stopLossPrice !== undefined));
            // if TP and SL are sent together
            // as ordType 'conditional' only stop-loss order will be applied
            // tpOrdKind is 'condition' which is the default
            if (twoWayCondition) {
                request['ordType'] = 'oco';
            }
            if (takeProfitPrice !== undefined) {
                request['tpTriggerPx'] = this.priceToPrecision(symbol, takeProfitPrice);
                request['tpOrdPx'] = (tpOrdPx === undefined) ? '-1' : this.priceToPrecision(symbol, tpOrdPx);
                request['tpTriggerPxType'] = tpTriggerPxType;
            }
            if (stopLossPrice !== undefined) {
                request['slTriggerPx'] = this.priceToPrecision(symbol, stopLossPrice);
                request['slOrdPx'] = (slOrdPx === undefined) ? '-1' : this.priceToPrecision(symbol, slOrdPx);
                request['slTriggerPxType'] = slTriggerPxType;
            }
        }
        if (clientOrderId === undefined) {
            const brokerId = this.safeString(this.options, 'brokerId');
            if (brokerId !== undefined) {
                request['clOrdId'] = brokerId + this.uuid16();
                request['tag'] = brokerId;
            }
        }
        else {
            request['clOrdId'] = clientOrderId;
            params = this.omit(params, ['clOrdId', 'clientOrderId']);
        }
        return this.extend(request, params);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name okx#createOrder
         * @description create a trade order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-place-algo-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
         * @param {bool} [params.postOnly] true to place a post only order
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
         * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
         * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
         * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
         * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
         * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
         * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
         * @param {string} [params.positionSide] if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short'
         * @param {string} [params.trailingPercent] the percent to trail away from the current market price
         * @param {string} [params.tpOrdKind] 'condition' or 'limit', the default is 'condition'
         * @param {string} [params.hedged] true/false, to automatically set exchange-specific params needed when trading in hedge mode
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = this.createOrderRequest(symbol, type, side, amount, price, params);
        let method = this.safeString(this.options, 'createOrder', 'privatePostTradeBatchOrders');
        const requestOrdType = this.safeString(request, 'ordType');
        if ((requestOrdType === 'trigger') || (requestOrdType === 'conditional') || (requestOrdType === 'move_order_stop') || (type === 'move_order_stop') || (type === 'oco') || (type === 'iceberg') || (type === 'twap')) {
            method = 'privatePostTradeOrderAlgo';
        }
        if ((method !== 'privatePostTradeOrder') && (method !== 'privatePostTradeOrderAlgo') && (method !== 'privatePostTradeBatchOrders')) {
            throw new errors.ExchangeError(this.id + ' createOrder() this.options["createOrder"] must be either privatePostTradeBatchOrders or privatePostTradeOrder or privatePostTradeOrderAlgo');
        }
        if (method === 'privatePostTradeBatchOrders') {
            // keep the request body the same
            // submit a single order in an array to the batch order endpoint
            // because it has a lower ratelimit
            request = [request];
        }
        let response = undefined;
        if (method === 'privatePostTradeOrder') {
            response = await this.privatePostTradeOrder(request);
        }
        else if (method === 'privatePostTradeOrderAlgo') {
            response = await this.privatePostTradeOrderAlgo(request);
        }
        else {
            response = await this.privatePostTradeBatchOrders(request);
        }
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        const order = this.parseOrder(first, market);
        order['type'] = type;
        order['side'] = side;
        return order;
    }
    async createOrders(orders, params = {}) {
        /**
         * @method
         * @name okx#createOrders
         * @description create a list of trade orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-place-multiple-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const extendedParams = this.extend(orderParams, params); // the request does not accept extra params since it's a list, so we're extending each order with the common params
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, extendedParams);
            ordersRequests.push(orderRequest);
        }
        const response = await this.privatePostTradeBatchOrders(ordersRequests);
        // {
        //     "code": "0",
        //     "data": [
        //        {
        //           "clOrdId": "e847386590ce4dBCc7f2a1b4c4509f82",
        //           "ordId": "636305438765568000",
        //           "sCode": "0",
        //           "sMsg": "Order placed",
        //           "tag": "e847386590ce4dBC"
        //        },
        //        {
        //           "clOrdId": "e847386590ce4dBC0b9993fe642d8f62",
        //           "ordId": "636305438765568001",
        //           "sCode": "0",
        //           "sMsg": "Order placed",
        //           "tag": "e847386590ce4dBC"
        //        }
        //     ],
        //     "inTime": "1697979038584486",
        //     "msg": "",
        //     "outTime": "1697979038586493"
        // }
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    editOrderRequest(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        let isAlgoOrder = undefined;
        if ((type === 'trigger') || (type === 'conditional') || (type === 'move_order_stop') || (type === 'oco') || (type === 'iceberg') || (type === 'twap')) {
            isAlgoOrder = true;
        }
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            if (isAlgoOrder) {
                request['algoClOrdId'] = clientOrderId;
            }
            else {
                request['clOrdId'] = clientOrderId;
            }
        }
        else {
            if (isAlgoOrder) {
                request['algoId'] = id;
            }
            else {
                request['ordId'] = id;
            }
        }
        let stopLossTriggerPrice = this.safeValue2(params, 'stopLossPrice', 'newSlTriggerPx');
        let stopLossPrice = this.safeValue(params, 'newSlOrdPx');
        const stopLossTriggerPriceType = this.safeString(params, 'newSlTriggerPxType', 'last');
        let takeProfitTriggerPrice = this.safeValue2(params, 'takeProfitPrice', 'newTpTriggerPx');
        let takeProfitPrice = this.safeValue(params, 'newTpOrdPx');
        const takeProfitTriggerPriceType = this.safeString(params, 'newTpTriggerPxType', 'last');
        const stopLoss = this.safeValue(params, 'stopLoss');
        const takeProfit = this.safeValue(params, 'takeProfit');
        const stopLossDefined = (stopLoss !== undefined);
        const takeProfitDefined = (takeProfit !== undefined);
        if (isAlgoOrder) {
            if ((stopLossTriggerPrice === undefined) && (takeProfitTriggerPrice === undefined)) {
                throw new errors.BadRequest(this.id + ' editOrder() requires a stopLossPrice or takeProfitPrice parameter for editing an algo order');
            }
            if (stopLossTriggerPrice !== undefined) {
                if (stopLossPrice === undefined) {
                    throw new errors.BadRequest(this.id + ' editOrder() requires a newSlOrdPx parameter for editing an algo order');
                }
                request['newSlTriggerPx'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
                request['newSlOrdPx'] = (type === 'market') ? '-1' : this.priceToPrecision(symbol, stopLossPrice);
                request['newSlTriggerPxType'] = stopLossTriggerPriceType;
            }
            if (takeProfitTriggerPrice !== undefined) {
                if (takeProfitPrice === undefined) {
                    throw new errors.BadRequest(this.id + ' editOrder() requires a newTpOrdPx parameter for editing an algo order');
                }
                request['newTpTriggerPx'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
                request['newTpOrdPx'] = (type === 'market') ? '-1' : this.priceToPrecision(symbol, takeProfitPrice);
                request['newTpTriggerPxType'] = takeProfitTriggerPriceType;
            }
        }
        else {
            if (stopLossTriggerPrice !== undefined) {
                request['newSlTriggerPx'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
                request['newSlOrdPx'] = (type === 'market') ? '-1' : this.priceToPrecision(symbol, stopLossPrice);
                request['newSlTriggerPxType'] = stopLossTriggerPriceType;
            }
            if (takeProfitTriggerPrice !== undefined) {
                request['newTpTriggerPx'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
                request['newTpOrdPx'] = (type === 'market') ? '-1' : this.priceToPrecision(symbol, takeProfitPrice);
                request['newTpTriggerPxType'] = takeProfitTriggerPriceType;
            }
            if (stopLossDefined) {
                stopLossTriggerPrice = this.safeValue(stopLoss, 'triggerPrice');
                stopLossPrice = this.safeValue(stopLoss, 'price');
                const stopLossType = this.safeString(stopLoss, 'type');
                request['newSlTriggerPx'] = this.priceToPrecision(symbol, stopLossTriggerPrice);
                request['newSlOrdPx'] = (stopLossType === 'market') ? '-1' : this.priceToPrecision(symbol, stopLossPrice);
                request['newSlTriggerPxType'] = stopLossTriggerPriceType;
            }
            if (takeProfitDefined) {
                takeProfitTriggerPrice = this.safeValue(takeProfit, 'triggerPrice');
                takeProfitPrice = this.safeValue(takeProfit, 'price');
                const takeProfitType = this.safeString(takeProfit, 'type');
                request['newTpOrdKind'] = (takeProfitType === 'limit') ? takeProfitType : 'condition';
                request['newTpTriggerPx'] = this.priceToPrecision(symbol, takeProfitTriggerPrice);
                request['newTpOrdPx'] = (takeProfitType === 'market') ? '-1' : this.priceToPrecision(symbol, takeProfitPrice);
                request['newTpTriggerPxType'] = takeProfitTriggerPriceType;
            }
        }
        if (amount !== undefined) {
            request['newSz'] = this.amountToPrecision(symbol, amount);
        }
        if (!isAlgoOrder) {
            if (price !== undefined) {
                request['newPx'] = this.priceToPrecision(symbol, price);
            }
        }
        params = this.omit(params, ['clOrdId', 'clientOrderId', 'takeProfitPrice', 'stopLossPrice', 'stopLoss', 'takeProfit']);
        return this.extend(request, params);
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name okx#editOrder
         * @description edit a trade order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-amend-order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-amend-algo-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] client order id, uses id if not passed
         * @param {float} [params.stopLossPrice] stop loss trigger price
         * @param {float} [params.newSlOrdPx] the stop loss order price, set to stopLossPrice if the type is market
         * @param {string} [params.newSlTriggerPxType] 'last', 'index' or 'mark' used to specify the stop loss trigger price type, default is 'last'
         * @param {float} [params.takeProfitPrice] take profit trigger price
         * @param {float} [params.newTpOrdPx] the take profit order price, set to takeProfitPrice if the type is market
         * @param {string} [params.newTpTriggerPxType] 'last', 'index' or 'mark' used to specify the take profit trigger price type, default is 'last'
         * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
         * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
         * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
         * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
         * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
         * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
         * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
         * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
         * @param {string} [params.newTpOrdKind] 'condition' or 'limit', the default is 'condition'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = this.editOrderRequest(id, symbol, type, side, amount, price, params);
        let isAlgoOrder = undefined;
        if ((type === 'trigger') || (type === 'conditional') || (type === 'move_order_stop') || (type === 'oco') || (type === 'iceberg') || (type === 'twap')) {
            isAlgoOrder = true;
        }
        let response = undefined;
        if (isAlgoOrder) {
            response = await this.privatePostTradeAmendAlgos(this.extend(request, params));
        }
        else {
            response = await this.privatePostTradeAmendOrder(this.extend(request, params));
        }
        //
        //     {
        //        "code": "0",
        //        "data": [
        //            {
        //                 "clOrdId": "e847386590ce4dBCc1a045253497a547",
        //                 "ordId": "559176536793178112",
        //                 "reqId": "",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //            }
        //        ],
        //        "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        const order = this.parseOrder(first, market);
        order['type'] = type;
        order['side'] = side;
        return order;
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#cancelOrder
         * @description cancels an open order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] true if trigger orders
         * @param {boolean} [params.trailing] set to true if you want to cancel a trailing order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        const stop = this.safeValue2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        if (stop || trailing) {
            const orderInner = await this.cancelOrders([id], symbol, params);
            return this.safeValue(orderInner, 0);
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
            // 'ordId': id, // either ordId or clOrdId is required
            // 'clOrdId': clientOrderId,
        };
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
        }
        else {
            request['ordId'] = id;
        }
        const query = this.omit(params, ['clOrdId', 'clientOrderId']);
        const response = await this.privatePostTradeCancelOrder(this.extend(request, query));
        // {"code":"0","data":[{"clOrdId":"","ordId":"317251910906576896","sCode":"0","sMsg":""}],"msg":""}
        const data = this.safeValue(response, 'data', []);
        const order = this.safeDict(data, 0);
        return this.parseOrder(order, market);
    }
    parseIds(ids) {
        /**
         * @ignore
         * @method
         * @name okx#parseIds
         * @param {string[]|string} ids order ids
         * @returns {string[]} list of order ids
         */
        if ((ids !== undefined) && typeof ids === 'string') {
            return ids.split(',');
        }
        else {
            return ids;
        }
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#cancelOrders
         * @description cancel multiple orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-multiple-orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order
         * @param {string[]} ids order ids
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] whether the order is a stop/trigger order
         * @param {boolean} [params.trailing] set to true if you want to cancel trailing orders
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        // TODO : the original endpoint signature differs, according to that you can skip individual symbol and assign ids in batch. At this moment, `params` is not being used too.
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = [];
        const options = this.safeValue(this.options, 'cancelOrders', {});
        const defaultMethod = this.safeString(options, 'method', 'privatePostTradeCancelBatchOrders');
        let method = this.safeString(params, 'method', defaultMethod);
        const clientOrderIds = this.parseIds(this.safeValue2(params, 'clOrdId', 'clientOrderId'));
        const algoIds = this.parseIds(this.safeValue(params, 'algoId'));
        const stop = this.safeValue2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        if (stop || trailing) {
            method = 'privatePostTradeCancelAlgos';
        }
        if (clientOrderIds === undefined) {
            ids = this.parseIds(ids);
            if (algoIds !== undefined) {
                for (let i = 0; i < algoIds.length; i++) {
                    request.push({
                        'algoId': algoIds[i],
                        'instId': market['id'],
                    });
                }
            }
            for (let i = 0; i < ids.length; i++) {
                if (trailing || stop) {
                    request.push({
                        'algoId': ids[i],
                        'instId': market['id'],
                    });
                }
                else {
                    request.push({
                        'ordId': ids[i],
                        'instId': market['id'],
                    });
                }
            }
        }
        else {
            for (let i = 0; i < clientOrderIds.length; i++) {
                request.push({
                    'instId': market['id'],
                    'clOrdId': clientOrderIds[i],
                });
            }
        }
        let response = undefined;
        if (method === 'privatePostTradeCancelAlgos') {
            response = await this.privatePostTradeCancelAlgos(request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        else {
            response = await this.privatePostTradeCancelBatchOrders(request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "clOrdId": "e123456789ec4dBC1123456ba123b45e",
        //                 "ordId": "405071912345641543",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //             },
        //             ...
        //         ],
        //         "msg": ""
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "algoId": "431375349042380800",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const ordersData = this.safeList(response, 'data', []);
        return this.parseOrders(ordersData, market, undefined, undefined, params);
    }
    async cancelOrdersForSymbols(orders, params = {}) {
        /**
         * @method
         * @name okx#cancelOrdersForSymbols
         * @description cancel multiple orders for multiple symbols
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-multiple-orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-post-cancel-algo-order
         * @param {CancellationRequest[]} orders each order should contain the parameters required by cancelOrder namely id and symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.trigger] whether the order is a stop/trigger order
         * @param {boolean} [params.trailing] set to true if you want to cancel trailing orders
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = [];
        const options = this.safeDict(this.options, 'cancelOrders', {});
        const defaultMethod = this.safeString(options, 'method', 'privatePostTradeCancelBatchOrders');
        let method = this.safeString(params, 'method', defaultMethod);
        const stop = this.safeBool2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        const isStopOrTrailing = stop || trailing;
        if (isStopOrTrailing) {
            method = 'privatePostTradeCancelAlgos';
        }
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const id = this.safeString(order, 'id');
            const clientOrderId = this.safeString2(order, 'clOrdId', 'clientOrderId');
            const symbol = this.safeString(order, 'symbol');
            const market = this.market(symbol);
            let idKey = 'ordId';
            if (isStopOrTrailing) {
                idKey = 'algoId';
            }
            else if (clientOrderId !== undefined) {
                idKey = 'clOrdId';
            }
            const requestItem = {
                'instId': market['id'],
            };
            requestItem[idKey] = (clientOrderId !== undefined) ? clientOrderId : id;
            request.push(requestItem);
        }
        let response = undefined;
        if (method === 'privatePostTradeCancelAlgos') {
            response = await this.privatePostTradeCancelAlgos(request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        else {
            response = await this.privatePostTradeCancelBatchOrders(request); // * dont extend with params, otherwise ARRAY will be turned into OBJECT
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "clOrdId": "e123456789ec4dBC1123456ba123b45e",
        //                 "ordId": "405071912345641543",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //             },
        //             ...
        //         ],
        //         "msg": ""
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "algoId": "431375349042380800",
        //                 "sCode": "0",
        //                 "sMsg": ""
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const ordersData = this.safeList(response, 'data', []);
        return this.parseOrders(ordersData, undefined, undefined, undefined, params);
    }
    async cancelAllOrdersAfter(timeout, params = {}) {
        /**
         * @method
         * @name okx#cancelAllOrdersAfter
         * @description dead man's switch, cancel all orders after the given timeout
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-cancel-all-after
         * @param {number} timeout time in milliseconds, 0 represents cancel the timer
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} the api result
         */
        await this.loadMarkets();
        const request = {
            'timeOut': (timeout > 0) ? this.parseToInt(timeout / 1000) : 0,
        };
        const response = await this.privatePostTradeCancelAllAfter(this.extend(request, params));
        //
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {
        //                 "triggerTime":"1587971460",
        //                 "ts":"1587971400"
        //             }
        //         ]
        //     }
        //
        return response;
    }
    parseOrderStatus(status) {
        const statuses = {
            'canceled': 'canceled',
            'order_failed': 'canceled',
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
            'effective': 'closed',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "clOrdId": "oktswap6",
        //         "ordId": "312269865356374016",
        //         "tag": "",
        //         "sCode": "0",
        //         "sMsg": ""
        //     }
        //
        // editOrder
        //
        //     {
        //         "clOrdId": "e847386590ce4dBCc1a045253497a547",
        //         "ordId": "559176536793178112",
        //         "reqId": "",
        //         "sCode": "0",
        //         "sMsg": ""
        //     }
        //
        // Spot and Swap fetchOrder, fetchOpenOrders
        //
        //     {
        //         "accFillSz": "0",
        //         "avgPx": "",
        //         "cTime": "1621910749815",
        //         "category": "normal",
        //         "ccy": "",
        //         "clOrdId": "",
        //         "fee": "0",
        //         "feeCcy": "ETH",
        //         "fillPx": "",
        //         "fillSz": "0",
        //         "fillTime": "",
        //         "instId": "ETH-USDT",
        //         "instType": "SPOT",
        //         "lever": "",
        //         "ordId": "317251910906576896",
        //         "ordType": "limit",
        //         "pnl": "0",
        //         "posSide": "net",
        //         "px": "2000",
        //         "rebate": "0",
        //         "rebateCcy": "USDT",
        //         "side": "buy",
        //         "slOrdPx": "",
        //         "slTriggerPx": "",
        //         "state": "live",
        //         "sz": "0.001",
        //         "tag": "",
        //         "tdMode": "cash",
        //         "tpOrdPx": "",
        //         "tpTriggerPx": "",
        //         "tradeId": "",
        //         "uTime": "1621910749815"
        //     }
        //
        // Algo Order fetchOpenOrders, fetchCanceledOrders, fetchClosedOrders
        //
        //     {
        //         "activePx": "",
        //         "activePxType": "",
        //         "actualPx": "",
        //         "actualSide": "buy",
        //         "actualSz": "0",
        //         "algoId": "431375349042380800",
        //         "cTime": "1649119897778",
        //         "callbackRatio": "",
        //         "callbackSpread": "",
        //         "ccy": "",
        //         "ctVal": "0.01",
        //         "instId": "BTC-USDT-SWAP",
        //         "instType": "SWAP",
        //         "last": "46538.9",
        //         "lever": "125",
        //         "moveTriggerPx": "",
        //         "notionalUsd": "467.059",
        //         "ordId": "",
        //         "ordPx": "50000",
        //         "ordType": "trigger",
        //         "posSide": "long",
        //         "pxLimit": "",
        //         "pxSpread": "",
        //         "pxVar": "",
        //         "side": "buy",
        //         "slOrdPx": "",
        //         "slTriggerPx": "",
        //         "slTriggerPxType": "",
        //         "state": "live",
        //         "sz": "1",
        //         "szLimit": "",
        //         "tag": "",
        //         "tdMode": "isolated",
        //         "tgtCcy": "",
        //         "timeInterval": "",
        //         "tpOrdPx": "",
        //         "tpTriggerPx": "",
        //         "tpTriggerPxType": "",
        //         "triggerPx": "50000",
        //         "triggerPxType": "last",
        //         "triggerTime": "",
        //         "uly": "BTC-USDT"
        //     }
        //
        const scode = this.safeString(order, 'sCode');
        if ((scode !== undefined) && (scode !== '0')) {
            return this.safeOrder({
                'id': this.safeString(order, 'ordId'),
                'clientOrderId': this.safeString(order, 'clOrdId'),
                'status': 'rejected',
                'info': order,
            });
        }
        const id = this.safeString2(order, 'algoId', 'ordId');
        const timestamp = this.safeInteger(order, 'cTime');
        const lastUpdateTimestamp = this.safeInteger(order, 'uTime');
        const lastTradeTimestamp = this.safeInteger(order, 'fillTime');
        const side = this.safeString(order, 'side');
        let type = this.safeString(order, 'ordType');
        let postOnly = undefined;
        let timeInForce = undefined;
        if (type === 'post_only') {
            postOnly = true;
            type = 'limit';
        }
        else if (type === 'fok') {
            timeInForce = 'FOK';
            type = 'limit';
        }
        else if (type === 'ioc') {
            timeInForce = 'IOC';
            type = 'limit';
        }
        const marketId = this.safeString(order, 'instId');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market, '-');
        const filled = this.safeString(order, 'accFillSz');
        const price = this.safeString2(order, 'px', 'ordPx');
        const average = this.safeString(order, 'avgPx');
        const status = this.parseOrderStatus(this.safeString(order, 'state'));
        const feeCostString = this.safeString(order, 'fee');
        let amount = undefined;
        let cost = undefined;
        // spot market buy: "sz" can refer either to base currency units or to quote currency units
        // see documentation: https://www.okx.com/docs-v5/en/#rest-api-trade-place-order
        const defaultTgtCcy = this.safeString(this.options, 'tgtCcy', 'base_ccy');
        const tgtCcy = this.safeString(order, 'tgtCcy', defaultTgtCcy);
        const instType = this.safeString(order, 'instType');
        if ((side === 'buy') && (type === 'market') && (instType === 'SPOT') && (tgtCcy === 'quote_ccy')) {
            // "sz" refers to the cost
            cost = this.safeString(order, 'sz');
        }
        else {
            // "sz" refers to the trade currency amount
            amount = this.safeString(order, 'sz');
        }
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCostSigned = Precise["default"].stringNeg(feeCostString);
            const feeCurrencyId = this.safeString(order, 'feeCcy');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': this.parseNumber(feeCostSigned),
                'currency': feeCurrencyCode,
            };
        }
        let clientOrderId = this.safeString(order, 'clOrdId');
        if ((clientOrderId !== undefined) && (clientOrderId.length < 1)) {
            clientOrderId = undefined; // fix empty clientOrderId string
        }
        const stopLossPrice = this.safeNumber2(order, 'slTriggerPx', 'slOrdPx');
        const takeProfitPrice = this.safeNumber2(order, 'tpTriggerPx', 'tpOrdPx');
        const stopPrice = this.safeNumberN(order, ['triggerPx', 'moveTriggerPx']);
        const reduceOnlyRaw = this.safeString(order, 'reduceOnly');
        let reduceOnly = false;
        if (reduceOnly !== undefined) {
            reduceOnly = (reduceOnlyRaw === 'true');
        }
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopLossPrice': stopLossPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
            'reduceOnly': reduceOnly,
        }, market);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchOrder
         * @description fetch an order by the id
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-details
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-details
         * @param {string} id the order id
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra and exchange specific parameters
         * @param {boolean} [params.trigger] true if fetching trigger orders
         * @returns [an order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
            // 'clOrdId': 'abcdef12345', // optional, [a-z0-9]{1,32}
            // 'ordId': id,
            // 'instType': // spot, swap, futures, margin
        };
        const clientOrderId = this.safeString2(params, 'clOrdId', 'clientOrderId');
        const options = this.safeValue(this.options, 'fetchOrder', {});
        const defaultMethod = this.safeString(options, 'method', 'privateGetTradeOrder');
        let method = this.safeString(params, 'method', defaultMethod);
        const stop = this.safeValue2(params, 'stop', 'trigger');
        if (stop) {
            method = 'privateGetTradeOrderAlgo';
            if (clientOrderId !== undefined) {
                request['algoClOrdId'] = clientOrderId;
            }
            else {
                request['algoId'] = id;
            }
        }
        else {
            if (clientOrderId !== undefined) {
                request['clOrdId'] = clientOrderId;
            }
            else {
                request['ordId'] = id;
            }
        }
        const query = this.omit(params, ['method', 'clOrdId', 'clientOrderId', 'stop', 'trigger']);
        let response = undefined;
        if (method === 'privateGetTradeOrderAlgo') {
            response = await this.privateGetTradeOrderAlgo(this.extend(request, query));
        }
        else {
            response = await this.privateGetTradeOrder(this.extend(request, query));
        }
        //
        // Spot and Swap
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accFillSz": "0",
        //                 "avgPx": "",
        //                 "cTime": "1621910749815",
        //                 "category": "normal",
        //                 "ccy": "",
        //                 "clOrdId": "",
        //                 "fee": "0",
        //                 "feeCcy": "ETH",
        //                 "fillPx": "",
        //                 "fillSz": "0",
        //                 "fillTime": "",
        //                 "instId": "ETH-USDT",
        //                 "instType": "SPOT",
        //                 "lever": "",
        //                 "ordId": "317251910906576896",
        //                 "ordType": "limit",
        //                 "pnl": "0",
        //                 "posSide": "net",
        //                 "px":"20 00",
        //                 "rebate": "0",
        //                 "rebateCcy": "USDT",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "state": "live",
        //                 "sz":"0. 001",
        //                 "tag": "",
        //                 "tdMode": "cash",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tradeId": "",
        //                 "uTime": "1621910749815"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        // Algo order
        //     {
        //         "code":"0",
        //         "msg":"",
        //         "data":[
        //             {
        //                 "instType":"FUTURES",
        //                 "instId":"BTC-USD-200329",
        //                 "ordId":"123445",
        //                 "ccy":"BTC",
        //                 "clOrdId":"",
        //                 "algoId":"1234",
        //                 "sz":"999",
        //                 "closeFraction":"",
        //                 "ordType":"oco",
        //                 "side":"buy",
        //                 "posSide":"long",
        //                 "tdMode":"cross",
        //                 "tgtCcy": "",
        //                 "state":"effective",
        //                 "lever":"20",
        //                 "tpTriggerPx":"",
        //                 "tpTriggerPxType":"",
        //                 "tpOrdPx":"",
        //                 "slTriggerPx":"",
        //                 "slTriggerPxType":"",
        //                 "triggerPx":"99",
        //                 "triggerPxType":"last",
        //                 "ordPx":"12",
        //                 "actualSz":"",
        //                 "actualPx":"",
        //                 "actualSide":"",
        //                 "pxVar":"",
        //                 "pxSpread":"",
        //                 "pxLimit":"",
        //                 "szLimit":"",
        //                 "tag": "adadadadad",
        //                 "timeInterval":"",
        //                 "callbackRatio":"",
        //                 "callbackSpread":"",
        //                 "activePx":"",
        //                 "moveTriggerPx":"",
        //                 "reduceOnly": "false",
        //                 "triggerTime":"1597026383085",
        //                 "last": "16012",
        //                 "failCode": "",
        //                 "algoClOrdId": "",
        //                 "cTime":"1597026383000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const order = this.safeDict(data, 0);
        return this.parseOrder(order, market);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-list
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-list
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] True if fetching trigger or conditional orders
         * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
         * @param {string} [params.algoId] Algo ID "'433845797218942976'"
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOpenOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchOpenOrders', symbol, since, limit, params);
        }
        const request = {
        // 'instType': 'SPOT', // SPOT, MARGIN, SWAP, FUTURES, OPTION
        // 'uly': currency['id'],
        // 'instId': market['id'],
        // 'ordType': 'limit', // market, limit, post_only, fok, ioc, comma-separated, stop orders: conditional, oco, trigger, move_order_stop, iceberg, or twap
        // 'state': 'live', // live, partially_filled
        // 'after': orderId,
        // 'before': orderId,
        // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const options = this.safeValue(this.options, 'fetchOpenOrders', {});
        const algoOrderTypes = this.safeValue(this.options, 'algoOrderTypes', {});
        const defaultMethod = this.safeString(options, 'method', 'privateGetTradeOrdersPending');
        let method = this.safeString(params, 'method', defaultMethod);
        const ordType = this.safeString(params, 'ordType');
        const stop = this.safeValue2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        if (trailing || stop || (ordType in algoOrderTypes)) {
            method = 'privateGetTradeOrdersAlgoPending';
        }
        if (trailing) {
            request['ordType'] = 'move_order_stop';
        }
        else if (stop && (ordType === undefined)) {
            request['ordType'] = 'trigger';
        }
        const query = this.omit(params, ['method', 'stop', 'trigger', 'trailing']);
        let response = undefined;
        if (method === 'privateGetTradeOrdersAlgoPending') {
            response = await this.privateGetTradeOrdersAlgoPending(this.extend(request, query));
        }
        else {
            response = await this.privateGetTradeOrdersPending(this.extend(request, query));
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accFillSz": "0",
        //                 "avgPx": "",
        //                 "cTime": "1621910749815",
        //                 "category": "normal",
        //                 "ccy": "",
        //                 "clOrdId": "",
        //                 "fee": "0",
        //                 "feeCcy": "ETH",
        //                 "fillPx": "",
        //                 "fillSz": "0",
        //                 "fillTime": "",
        //                 "instId": "ETH-USDT",
        //                 "instType": "SPOT",
        //                 "lever": "",
        //                 "ordId": "317251910906576896",
        //                 "ordType": "limit",
        //                 "pnl": "0",
        //                 "posSide": "net",
        //                 "px":"20 00",
        //                 "rebate": "0",
        //                 "rebateCcy": "USDT",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "state": "live",
        //                 "sz":"0. 001",
        //                 "tag": "",
        //                 "tdMode": "cash",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tradeId": "",
        //                 "uTime": "1621910749815"
        //             }
        //         ],
        //         "msg":""
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "activePx": "",
        //                 "activePxType": "",
        //                 "actualPx": "",
        //                 "actualSide": "buy",
        //                 "actualSz": "0",
        //                 "algoId": "431375349042380800",
        //                 "cTime": "1649119897778",
        //                 "callbackRatio": "",
        //                 "callbackSpread": "",
        //                 "ccy": "",
        //                 "ctVal": "0.01",
        //                 "instId": "BTC-USDT-SWAP",
        //                 "instType": "SWAP",
        //                 "last": "46538.9",
        //                 "lever": "125",
        //                 "moveTriggerPx": "",
        //                 "notionalUsd": "467.059",
        //                 "ordId": "",
        //                 "ordPx": "50000",
        //                 "ordType": "trigger",
        //                 "posSide": "long",
        //                 "pxLimit": "",
        //                 "pxSpread": "",
        //                 "pxVar": "",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "slTriggerPxType": "",
        //                 "state": "live",
        //                 "sz": "1",
        //                 "szLimit": "",
        //                 "tag": "",
        //                 "tdMode": "isolated",
        //                 "tgtCcy": "",
        //                 "timeInterval": "",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tpTriggerPxType": "",
        //                 "triggerPx": "50000",
        //                 "triggerPxType": "last",
        //                 "triggerTime": "",
        //                 "uly": "BTC-USDT"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-7-days
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-history
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] timestamp in ms of the earliest order, default is undefined
         * @param {int} [limit] max number of orders to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] True if fetching trigger or conditional orders
         * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
         * @param {string} [params.algoId] Algo ID "'433845797218942976'"
         * @param {int} [params.until] timestamp in ms to fetch orders for
         * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'instType': type.toUpperCase (), // SPOT, MARGIN, SWAP, FUTURES, OPTION
        // 'uly': currency['id'],
        // 'instId': market['id'],
        // 'ordType': 'limit', // market, limit, post_only, fok, ioc, comma-separated stop orders: conditional, oco, trigger, move_order_stop, iceberg, or twap
        // 'state': 'canceled', // filled, canceled
        // 'after': orderId,
        // 'before': orderId,
        // 'limit': limit, // default 100, max 100
        // 'algoId': "'433845797218942976'", // Algo order
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        let type = undefined;
        let query = undefined;
        [type, query] = this.handleMarketTypeAndParams('fetchCanceledOrders', market, params);
        request['instType'] = this.convertToInstrumentType(type);
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        request['state'] = 'canceled';
        const options = this.safeValue(this.options, 'fetchCanceledOrders', {});
        const algoOrderTypes = this.safeValue(this.options, 'algoOrderTypes', {});
        const defaultMethod = this.safeString(options, 'method', 'privateGetTradeOrdersHistory');
        let method = this.safeString(params, 'method', defaultMethod);
        const ordType = this.safeString(params, 'ordType');
        const stop = this.safeValue2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        if (trailing) {
            method = 'privateGetTradeOrdersAlgoHistory';
            request['ordType'] = 'move_order_stop';
        }
        else if (stop || (ordType in algoOrderTypes)) {
            method = 'privateGetTradeOrdersAlgoHistory';
            const algoId = this.safeString(params, 'algoId');
            if (algoId !== undefined) {
                request['algoId'] = algoId;
                params = this.omit(params, 'algoId');
            }
            if (stop) {
                if (ordType === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' fetchCanceledOrders() requires an "ordType" string parameter, "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"');
                }
            }
        }
        else {
            if (since !== undefined) {
                request['begin'] = since;
            }
            const until = this.safeInteger(query, 'until');
            if (until !== undefined) {
                request['end'] = until;
                query = this.omit(query, ['until']);
            }
        }
        const send = this.omit(query, ['method', 'stop', 'trigger', 'trailing']);
        let response = undefined;
        if (method === 'privateGetTradeOrdersAlgoHistory') {
            response = await this.privateGetTradeOrdersAlgoHistory(this.extend(request, send));
        }
        else {
            response = await this.privateGetTradeOrdersHistory(this.extend(request, send));
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accFillSz": "0",
        //                 "avgPx": "",
        //                 "cTime": "1644037822494",
        //                 "category": "normal",
        //                 "ccy": "",
        //                 "clOrdId": "",
        //                 "fee": "0",
        //                 "feeCcy": "BTC",
        //                 "fillPx": "",
        //                 "fillSz": "0",
        //                 "fillTime": "",
        //                 "instId": "BTC-USDT",
        //                 "instType": "SPOT",
        //                 "lever": "",
        //                 "ordId": "410059580352409602",
        //                 "ordType": "limit",
        //                 "pnl": "0",
        //                 "posSide": "net",
        //                 "px": "30000",
        //                 "rebate": "0",
        //                 "rebateCcy": "USDT",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "slTriggerPxType": "",
        //                 "source": "",
        //                 "state": "canceled",
        //                 "sz": "0.0005452",
        //                 "tag": "",
        //                 "tdMode": "cash",
        //                 "tgtCcy": "",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tpTriggerPxType": "",
        //                 "tradeId": "",
        //                 "uTime": "1644038165667"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "activePx": "",
        //                 "activePxType": "",
        //                 "actualPx": "",
        //                 "actualSide": "buy",
        //                 "actualSz": "0",
        //                 "algoId": "433845797218942976",
        //                 "cTime": "1649708898523",
        //                 "callbackRatio": "",
        //                 "callbackSpread": "",
        //                 "ccy": "",
        //                 "ctVal": "0.01",
        //                 "instId": "BTC-USDT-SWAP",
        //                 "instType": "SWAP",
        //                 "last": "39950.4",
        //                 "lever": "125",
        //                 "moveTriggerPx": "",
        //                 "notionalUsd": "1592.1760000000002",
        //                 "ordId": "",
        //                 "ordPx": "29000",
        //                 "ordType": "trigger",
        //                 "posSide": "long",
        //                 "pxLimit": "",
        //                 "pxSpread": "",
        //                 "pxVar": "",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "slTriggerPxType": "",
        //                 "state": "canceled",
        //                 "sz": "4",
        //                 "szLimit": "",
        //                 "tag": "",
        //                 "tdMode": "isolated",
        //                 "tgtCcy": "",
        //                 "timeInterval": "",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tpTriggerPxType": "",
        //                 "triggerPx": "30000",
        //                 "triggerPxType": "last",
        //                 "triggerTime": "",
        //                 "uly": "BTC-USDT"
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-7-days
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-algo-trading-get-algo-order-history
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-order-history-last-3-months
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.trigger] True if fetching trigger or conditional orders
         * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
         * @param {string} [params.algoId] Algo ID "'433845797218942976'"
         * @param {int} [params.until] timestamp in ms to fetch orders for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @param {string} [params.method] method to be used, either 'privateGetTradeOrdersHistory', 'privateGetTradeOrdersHistoryArchive' or 'privateGetTradeOrdersAlgoHistory' default is 'privateGetTradeOrdersHistory'
         * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchClosedOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchClosedOrders', symbol, since, limit, params);
        }
        const request = {
        // 'instType': type.toUpperCase (), // SPOT, MARGIN, SWAP, FUTURES, OPTION
        // 'uly': currency['id'],
        // 'instId': market['id'],
        // 'ordType': 'limit', // market, limit, post_only, fok, ioc, comma-separated stop orders: conditional, oco, trigger, move_order_stop, iceberg, or twap
        // 'state': 'filled', // filled, effective
        // 'after': orderId,
        // 'before': orderId,
        // 'limit': limit, // default 100, max 100
        // 'algoId': "'433845797218942976'", // Algo order
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        let type = undefined;
        let query = undefined;
        [type, query] = this.handleMarketTypeAndParams('fetchClosedOrders', market, params);
        request['instType'] = this.convertToInstrumentType(type);
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        const options = this.safeDict(this.options, 'fetchClosedOrders', {});
        const algoOrderTypes = this.safeDict(this.options, 'algoOrderTypes', {});
        const defaultMethod = this.safeString(options, 'method', 'privateGetTradeOrdersHistory');
        let method = this.safeString(params, 'method', defaultMethod);
        const ordType = this.safeString(params, 'ordType');
        const stop = this.safeBool2(params, 'stop', 'trigger');
        const trailing = this.safeBool(params, 'trailing', false);
        if (trailing || stop || (ordType in algoOrderTypes)) {
            method = 'privateGetTradeOrdersAlgoHistory';
            request['state'] = 'effective';
        }
        if (trailing) {
            request['ordType'] = 'move_order_stop';
        }
        else if (stop) {
            if (ordType === undefined) {
                request['ordType'] = 'trigger';
            }
        }
        else {
            if (since !== undefined) {
                request['begin'] = since;
            }
            const until = this.safeInteger(query, 'until');
            if (until !== undefined) {
                request['end'] = until;
                query = this.omit(query, ['until']);
            }
            request['state'] = 'filled';
        }
        const send = this.omit(query, ['method', 'stop', 'trigger', 'trailing']);
        let response = undefined;
        if (method === 'privateGetTradeOrdersAlgoHistory') {
            response = await this.privateGetTradeOrdersAlgoHistory(this.extend(request, send));
        }
        else if (method === 'privateGetTradeOrdersHistoryArchive') {
            response = await this.privateGetTradeOrdersHistoryArchive(this.extend(request, send));
        }
        else {
            response = await this.privateGetTradeOrdersHistory(this.extend(request, send));
        }
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accFillSz": "0",
        //                 "avgPx": "",
        //                 "cTime": "1621910749815",
        //                 "category": "normal",
        //                 "ccy": "",
        //                 "clOrdId": "",
        //                 "fee": "0",
        //                 "feeCcy": "ETH",
        //                 "fillPx": "",
        //                 "fillSz": "0",
        //                 "fillTime": "",
        //                 "instId": "ETH-USDT",
        //                 "instType": "SPOT",
        //                 "lever": "",
        //                 "ordId": "317251910906576896",
        //                 "ordType": "limit",
        //                 "pnl": "0",
        //                 "posSide": "net",
        //                 "px": "2000",
        //                 "rebate": "0",
        //                 "rebateCcy": "USDT",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "state": "live",
        //                 "sz": "0.001",
        //                 "tag": "",
        //                 "tdMode": "cash",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tradeId": "",
        //                 "uTime": "1621910749815"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        // Algo order
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "activePx": "",
        //                 "activePxType": "",
        //                 "actualPx": "",
        //                 "actualSide": "buy",
        //                 "actualSz": "0",
        //                 "algoId": "433845797218942976",
        //                 "cTime": "1649708898523",
        //                 "callbackRatio": "",
        //                 "callbackSpread": "",
        //                 "ccy": "",
        //                 "ctVal": "0.01",
        //                 "instId": "BTC-USDT-SWAP",
        //                 "instType": "SWAP",
        //                 "last": "39950.4",
        //                 "lever": "125",
        //                 "moveTriggerPx": "",
        //                 "notionalUsd": "1592.1760000000002",
        //                 "ordId": "",
        //                 "ordPx": "29000",
        //                 "ordType": "trigger",
        //                 "posSide": "long",
        //                 "pxLimit": "",
        //                 "pxSpread": "",
        //                 "pxVar": "",
        //                 "side": "buy",
        //                 "slOrdPx": "",
        //                 "slTriggerPx": "",
        //                 "slTriggerPxType": "",
        //                 "state": "effective",
        //                 "sz": "4",
        //                 "szLimit": "",
        //                 "tag": "",
        //                 "tdMode": "isolated",
        //                 "tgtCcy": "",
        //                 "timeInterval": "",
        //                 "tpOrdPx": "",
        //                 "tpTriggerPx": "",
        //                 "tpTriggerPxType": "",
        //                 "triggerPx": "30000",
        //                 "triggerPxType": "last",
        //                 "triggerTime": "",
        //                 "uly": "BTC-USDT"
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-transaction-details-last-3-months
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] Timestamp in ms of the latest time to retrieve trades for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchMyTrades', symbol, since, limit, params);
        }
        let request = {
        // 'instType': 'SPOT', // SPOT, MARGIN, SWAP, FUTURES, OPTION
        // 'uly': currency['id'],
        // 'instId': market['id'],
        // 'ordId': orderId,
        // 'after': billId,
        // 'before': billId,
        // 'limit': limit, // default 100, max 100
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        if (since !== undefined) {
            request['begin'] = since;
        }
        [request, params] = this.handleUntilOption('end', request, params);
        const [type, query] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        request['instType'] = this.convertToInstrumentType(type);
        if ((limit !== undefined) && (since === undefined)) { // let limit = n, okx will return the n most recent results, instead of the n results after limit, so limit should only be sent when since is undefined
            request['limit'] = limit; // default 100, max 100
        }
        const response = await this.privateGetTradeFillsHistory(this.extend(request, query));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "side": "buy",
        //                 "fillSz": "0.007533",
        //                 "fillPx": "2654.98",
        //                 "fee": "-0.000007533",
        //                 "ordId": "317321390244397056",
        //                 "instType": "SPOT",
        //                 "instId": "ETH-USDT",
        //                 "clOrdId": "",
        //                 "posSide": "net",
        //                 "billId": "317321390265368576",
        //                 "tag": "0",
        //                 "execType": "T",
        //                 "tradeId": "107601752",
        //                 "feeCcy": "ETH",
        //                 "ts": "1621927314985"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit, query);
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-get-transaction-details-last-3-months
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const request = {
            // 'instrument_id': market['id'],
            'ordId': id,
            // 'after': '1', // return the page after the specified page number
            // 'before': '1', // return the page before the specified page number
            // 'limit': limit, // optional, number of results per request, default = maximum = 100
        };
        return await this.fetchMyTrades(symbol, since, limit, this.extend(request, params));
    }
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-asset-bills-details
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchLedger', code, since, limit, params);
        }
        const options = this.safeDict(this.options, 'fetchLedger', {});
        let method = this.safeString(options, 'method');
        method = this.safeString(params, 'method', method);
        params = this.omit(params, 'method');
        let request = {
        // 'instType': undefined, // 'SPOT', 'MARGIN', 'SWAP', 'FUTURES", 'OPTION'
        // 'ccy': undefined, // currency['id'],
        // 'mgnMode': undefined, // 'isolated', 'cross'
        // 'ctType': undefined, // 'linear', 'inverse', only applicable to FUTURES/SWAP
        // 'type': varies depending the 'method' endpoint :
        //     - https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
        //     - https://www.okx.com/docs-v5/en/#rest-api-funding-asset-bills-details
        //     - https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
        // 'after': 'id', // return records earlier than the requested bill id
        // 'before': 'id', // return records newer than the requested bill id
        // 'limit': 100, // default 100, max 100
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLedger', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'mgnMode');
        }
        if (method !== 'privateGetAssetBills') {
            if (marginMode !== undefined) {
                request['mgnMode'] = marginMode;
            }
        }
        const [type, query] = this.handleMarketTypeAndParams('fetchLedger', undefined, params);
        if (type !== undefined) {
            request['instType'] = this.convertToInstrumentType(type);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        [request, params] = this.handleUntilOption('end', request, params);
        let response = undefined;
        if (method === 'privateGetAccountBillsArchive') {
            response = await this.privateGetAccountBillsArchive(this.extend(request, query));
        }
        else if (method === 'privateGetAssetBills') {
            response = await this.privateGetAssetBills(this.extend(request, query));
        }
        else {
            response = await this.privateGetAccountBills(this.extend(request, query));
        }
        //
        // privateGetAccountBills, privateGetAccountBillsArchive
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "bal": "0.0000819307998198",
        //                 "balChg": "-664.2679586599999802",
        //                 "billId": "310394313544966151",
        //                 "ccy": "USDT",
        //                 "fee": "0",
        //                 "from": "",
        //                 "instId": "LTC-USDT",
        //                 "instType": "SPOT",
        //                 "mgnMode": "cross",
        //                 "notes": "",
        //                 "ordId": "310394313519800320",
        //                 "pnl": "0",
        //                 "posBal": "0",
        //                 "posBalChg": "0",
        //                 "subType": "2",
        //                 "sz": "664.26795866",
        //                 "to": "",
        //                 "ts": "1620275771196",
        //                 "type": "2"
        //             }
        //         ]
        //     }
        //
        // privateGetAssetBills
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "billId": "12344",
        //                 "ccy": "BTC",
        //                 "balChg": "2",
        //                 "bal": "12",
        //                 "type": "1",
        //                 "ts": "1597026383085"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseLedger(data, currency, since, limit);
    }
    parseLedgerEntryType(type) {
        const types = {
            '1': 'transfer',
            '2': 'trade',
            '3': 'trade',
            '4': 'rebate',
            '5': 'trade',
            '6': 'transfer',
            '7': 'trade',
            '8': 'fee',
            '9': 'trade',
            '10': 'trade',
            '11': 'trade', // system token conversion
        };
        return this.safeString(types, type, type);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        // privateGetAccountBills, privateGetAccountBillsArchive
        //
        //     {
        //         "bal": "0.0000819307998198",
        //         "balChg": "-664.2679586599999802",
        //         "billId": "310394313544966151",
        //         "ccy": "USDT",
        //         "fee": "0",
        //         "from": "",
        //         "instId": "LTC-USDT",
        //         "instType": "SPOT",
        //         "mgnMode": "cross",
        //         "notes": "",
        //         "ordId": "310394313519800320",
        //         "pnl": "0",
        //         "posBal": "0",
        //         "posBalChg": "0",
        //         "subType": "2",
        //         "sz": "664.26795866",
        //         "to": "",
        //         "ts": "1620275771196",
        //         "type": "2"
        //     }
        //
        // privateGetAssetBills
        //
        //     {
        //         "billId": "12344",
        //         "ccy": "BTC",
        //         "balChg": "2",
        //         "bal": "12",
        //         "type": "1",
        //         "ts": "1597026383085"
        //     }
        //
        const id = this.safeString(item, 'billId');
        const account = undefined;
        const referenceId = this.safeString(item, 'ordId');
        const referenceAccount = undefined;
        const type = this.parseLedgerEntryType(this.safeString(item, 'type'));
        const code = this.safeCurrencyCode(this.safeString(item, 'ccy'), currency);
        const amountString = this.safeString(item, 'balChg');
        const amount = this.parseNumber(amountString);
        const timestamp = this.safeInteger(item, 'ts');
        const feeCostString = this.safeString(item, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': this.parseNumber(Precise["default"].stringNeg(feeCostString)),
                'currency': code,
            };
        }
        const before = undefined;
        const afterString = this.safeString(item, 'bal');
        const after = this.parseNumber(afterString);
        const status = 'ok';
        const marketId = this.safeString(item, 'instId');
        const symbol = this.safeSymbol(marketId, undefined, '-');
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'symbol': symbol,
            'amount': amount,
            'before': before,
            'after': after,
            'status': status,
            'fee': fee,
        };
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {
        //         "addr": "okbtothemoon",
        //         "memo": "971668", // may be missing
        //         "tag":"52055", // may be missing
        //         "pmtId": "", // may be missing
        //         "ccy": "BTC",
        //         "to": "6", // 1 SPOT, 3 FUTURES, 6 FUNDING, 9 SWAP, 12 OPTION, 18 Unified account
        //         "selected": true
        //     }
        //
        //     {
        //         "ccy":"usdt-erc20",
        //         "to":"6",
        //         "addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa",
        //         "selected":true
        //     }
        //
        //     {
        //        "chain": "ETH-OKExChain",
        //        "addrEx": { "comment": "6040348" }, // some currencies like TON may have this field,
        //        "ctAddr": "72315c",
        //        "ccy": "ETH",
        //        "to": "6",
        //        "addr": "0x1c9f2244d1ccaa060bd536827c18925db10db102",
        //        "selected": true
        //     }
        //
        const address = this.safeString(depositAddress, 'addr');
        let tag = this.safeStringN(depositAddress, ['tag', 'pmtId', 'memo']);
        if (tag === undefined) {
            const addrEx = this.safeValue(depositAddress, 'addrEx', {});
            tag = this.safeString(addrEx, 'comment');
        }
        const currencyId = this.safeString(depositAddress, 'ccy');
        currency = this.safeCurrency(currencyId, currency);
        const code = currency['code'];
        const chain = this.safeString(depositAddress, 'chain');
        const networks = this.safeValue(currency, 'networks', {});
        const networksById = this.indexBy(networks, 'id');
        let networkData = this.safeValue(networksById, chain);
        // inconsistent naming responses from exchange
        // with respect to network naming provided in currency info vs address chain-names and ids
        //
        // response from address endpoint:
        //      {
        //          "chain": "USDT-Polygon",
        //          "ctAddr": "",
        //          "ccy": "USDT",
        //          "to":"6" ,
        //          "addr": "0x1903441e386cc49d937f6302955b5feb4286dcfa",
        //          "selected": true
        //      }
        // network information from currency['networks'] field:
        // Polygon: {
        //        info: {
        //            canDep: false,
        //            canInternal: false,
        //            canWd: false,
        //            ccy: 'USDT',
        //            chain: 'USDT-Polygon-Bridge',
        //            mainNet: false,
        //            maxFee: '26.879528',
        //            minFee: '13.439764',
        //            minWd: '0.001',
        //            name: ''
        //        },
        //        id: 'USDT-Polygon-Bridge',
        //        network: 'Polygon',
        //        active: false,
        //        deposit: false,
        //        withdraw: false,
        //        fee: 13.439764,
        //        precision: undefined,
        //        limits: {
        //            withdraw: {
        //                min: 0.001,
        //                max: undefined
        //            }
        //        }
        //     },
        //
        if (chain === 'USDT-Polygon') {
            networkData = this.safeValue2(networksById, 'USDT-Polygon-Bridge', 'USDT-Polygon');
        }
        const network = this.safeString(networkData, 'network');
        const networkCode = this.networkIdToCode(network, code);
        this.checkAddress(address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': networkCode,
            'info': depositAddress,
        };
    }
    async fetchDepositAddressesByNetwork(code, params = {}) {
        /**
         * @method
         * @name okx#fetchDepositAddressesByNetwork
         * @description fetch a dictionary of addresses for a currency, indexed by network
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
        };
        const response = await this.privateGetAssetDepositAddress(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "addr": "okbtothemoon",
        //                 "memo": "971668", // may be missing
        //                 "tag":"52055", // may be missing
        //                 "pmtId": "", // may be missing
        //                 "ccy": "BTC",
        //                 "to": "6", // 1 SPOT, 3 FUTURES, 6 FUNDING, 9 SWAP, 12 OPTION, 18 Unified account
        //                 "selected": true
        //             },
        //             // {"ccy":"usdt-erc20","to":"6","addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa","selected":true},
        //             // {"ccy":"usdt-trc20","to":"6","addr":"TRrd5SiSZrfQVRKm4e9SRSbn2LNTYqCjqx","selected":true},
        //             // {"ccy":"usdt_okexchain","to":"6","addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa","selected":true},
        //             // {"ccy":"usdt_kip20","to":"6","addr":"0x696abb81974a8793352cbd33aadcf78eda3cfdfa","selected":true},
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const filtered = this.filterBy(data, 'selected', true);
        const parsed = this.parseDepositAddresses(filtered, [currency['code']], false);
        return this.indexBy(parsed, 'network');
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name okx#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        const rawNetwork = this.safeStringUpper(params, 'network');
        const networks = this.safeValue(this.options, 'networks', {});
        const network = this.safeString(networks, rawNetwork, rawNetwork);
        params = this.omit(params, 'network');
        const response = await this.fetchDepositAddressesByNetwork(code, params);
        let result = undefined;
        if (network === undefined) {
            result = this.safeValue(response, code);
            if (result === undefined) {
                const alias = this.safeString(networks, code, code);
                result = this.safeValue(response, alias);
                if (result === undefined) {
                    const defaultNetwork = this.safeString(this.options, 'defaultNetwork', 'ERC20');
                    result = this.safeValue(response, defaultNetwork);
                    if (result === undefined) {
                        const values = Object.values(response);
                        result = this.safeValue(values, 0);
                        if (result === undefined) {
                            throw new errors.InvalidAddress(this.id + ' fetchDepositAddress() cannot find deposit address for ' + code);
                        }
                    }
                }
            }
            return result;
        }
        result = this.safeValue(response, network);
        if (result === undefined) {
            throw new errors.InvalidAddress(this.id + ' fetchDepositAddress() cannot find ' + network + ' deposit address for ' + code);
        }
        return result;
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name okx#withdraw
         * @description make a withdrawal
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-withdrawal
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        if ((tag !== undefined) && (tag.length > 0)) {
            address = address + ':' + tag;
        }
        const request = {
            'ccy': currency['id'],
            'toAddr': address,
            'dest': '4',
            'amt': this.numberToString(amount),
        };
        let network = this.safeString(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        if (network !== undefined) {
            const networks = this.safeDict(this.options, 'networks', {});
            network = this.safeString(networks, network.toUpperCase(), network); // handle ETH>ERC20 alias
            request['chain'] = currency['id'] + '-' + network;
            params = this.omit(params, 'network');
        }
        let fee = this.safeString(params, 'fee');
        if (fee === undefined) {
            const currencies = await this.fetchCurrencies();
            this.currencies = this.deepExtend(this.currencies, currencies);
            const targetNetwork = this.safeDict(currency['networks'], this.networkIdToCode(network), {});
            fee = this.safeString(targetNetwork, 'fee');
            if (fee === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a "fee" string parameter, network transaction fee must be ≥ 0. Withdrawals to OKCoin or OKX are fee-free, please set "0". Withdrawing to external digital asset address requires network transaction fee.');
            }
        }
        request['fee'] = this.numberToString(fee); // withdrawals to OKCoin or OKX are fee-free, please set 0
        const query = this.omit(params, ['fee']);
        const response = await this.privatePostAssetWithdrawal(this.extend(request, query));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "amt": "0.1",
        //                 "wdId": "67485",
        //                 "ccy": "BTC"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const transaction = this.safeDict(data, 0);
        return this.parseTransaction(transaction, currency);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-deposit-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchDeposits', code, since, limit, params);
        }
        let request = {
        // 'ccy': currency['id'],
        // 'state': 2, // 0 waiting for confirmation, 1 deposit credited, 2 deposit successful
        // 'after': since,
        // 'before' this.milliseconds (),
        // 'limit': limit, // default 100, max 100
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = Math.max(since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [request, params] = this.handleUntilOption('after', request, params);
        const response = await this.privateGetAssetDepositHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "amt": "0.01044408",
        //                 "txId": "1915737_3_0_0_asset",
        //                 "ccy": "BTC",
        //                 "from": "13801825426",
        //                 "to": "",
        //                 "ts": "1597026383085",
        //                 "state": "2",
        //                 "depId": "4703879"
        //             },
        //             {
        //                 "amt": "491.6784211",
        //                 "txId": "1744594_3_184_0_asset",
        //                 "ccy": "OKB",
        //                 "from": "",
        //                 "to": "",
        //                 "ts": "1597026383085",
        //                 "state": "2",
        //                 "depId": "4703809"
        //             },
        //             {
        //                 "amt": "223.18782496",
        //                 "txId": "6d892c669225b1092c780bf0da0c6f912fc7dc8f6b8cc53b003288624c",
        //                 "ccy": "USDT",
        //                 "from": "",
        //                 "to": "39kK4XvgEuM7rX9frgyHoZkWqx4iKu1spD",
        //                 "ts": "1597026383085",
        //                 "state": "2",
        //                 "depId": "4703779"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit, params);
    }
    async fetchDeposit(id, code = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchDeposit
         * @description fetch data on a currency deposit via the deposit id
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-deposit-history
         * @param {string} id deposit id
         * @param {string} code filter by currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const request = {
            'depId': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        const response = await this.privateGetAssetDepositHistory(this.extend(request, params));
        const data = this.safeValue(response, 'data');
        const deposit = this.safeDict(data, 0, {});
        return this.parseTransaction(deposit, currency);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic('fetchWithdrawals', code, since, limit, params);
        }
        let request = {
        // 'ccy': currency['id'],
        // 'state': 2, // -3: pending cancel, -2 canceled, -1 failed, 0, pending, 1 sending, 2 sent, 3 awaiting email verification, 4 awaiting manual verification, 5 awaiting identity verification
        // 'after': since,
        // 'before': this.milliseconds (),
        // 'limit': limit, // default 100, max 100
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = Math.max(since - 1, 0);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        [request, params] = this.handleUntilOption('after', request, params);
        const response = await this.privateGetAssetWithdrawalHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "amt": "0.094",
        //                 "wdId": "4703879",
        //                 "fee": "0.01000000eth",
        //                 "txId": "0x62477bac6509a04512819bb1455e923a60dea5966c7caeaa0b24eb8fb0432b85",
        //                 "ccy": "ETH",
        //                 "from": "13426335357",
        //                 "to": "0xA41446125D0B5b6785f6898c9D67874D763A1519",
        //                 "ts": "1597026383085",
        //                 "state": "2"
        //             },
        //             {
        //                 "amt": "0.01",
        //                 "wdId": "4703879",
        //                 "fee": "0.00000000btc",
        //                 "txId": "",
        //                 "ccy": "BTC",
        //                 "from": "13426335357",
        //                 "to": "13426335357",
        //                 "ts": "1597026383085",
        //                 "state": "2"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit, params);
    }
    async fetchWithdrawal(id, code = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
         * @param {string} id withdrawal id
         * @param {string} code unified currency code of the currency withdrawn, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const request = {
            'wdId': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        const response = await this.privateGetAssetWithdrawalHistory(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "chain": "USDT-TRC20",
        //                "clientId": '',
        //                "fee": "0.8",
        //                "ccy": "USDT",
        //                "amt": "54.561",
        //                "txId": "00cff6ec7fa7c7d7d184bd84e82b9ff36863f07c0421188607f87dfa94e06b70",
        //                "from": "example@email.com",
        //                "to": "TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp",
        //                "state": "2",
        //                "ts": "1641376485000",
        //                "wdId": "25147041"
        //            }
        //        ],
        //        "msg": ''
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const withdrawal = this.safeDict(data, 0, {});
        return this.parseTransaction(withdrawal);
    }
    parseTransactionStatus(status) {
        //
        // deposit statuses
        //
        //     {
        //         "0": "waiting for confirmation",
        //         "1": "deposit credited",
        //         "2": "deposit successful"
        //     }
        //
        // withdrawal statuses
        //
        //     {
        //        '-3': "pending cancel",
        //        "-2": "canceled",
        //        "-1": "failed",
        //         "0": "pending",
        //         "1": "sending",
        //         "2": "sent",
        //         "3": "awaiting email verification",
        //         "4": "awaiting manual verification",
        //         "5": "awaiting identity verification"
        //     }
        //
        const statuses = {
            '-3': 'pending',
            '-2': 'canceled',
            '-1': 'failed',
            '0': 'pending',
            '1': 'pending',
            '2': 'ok',
            '3': 'pending',
            '4': 'pending',
            '5': 'pending',
            '6': 'pending',
            '7': 'pending',
            '8': 'pending',
            '9': 'pending',
            '10': 'pending',
            '12': 'pending',
            '15': 'pending',
            '16': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "amt": "0.1",
        //         "wdId": "67485",
        //         "ccy": "BTC"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "amt": "0.094",
        //         "wdId": "4703879",
        //         "fee": "0.01000000eth",
        //         "txId": "0x62477bac6509a04512819bb1455e923a60dea5966c7caeaa0b24eb8fb0432b85",
        //         "ccy": "ETH",
        //         "from": "13426335357",
        //         "to": "0xA41446125D0B5b6785f6898c9D67874D763A1519",
        //         "tag",
        //         "pmtId",
        //         "memo",
        //         "ts": "1597026383085",
        //         "state": "2"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "amt": "0.01044408",
        //         "txId": "1915737_3_0_0_asset",
        //         "ccy": "BTC",
        //         "from": "13801825426",
        //         "to": "",
        //         "ts": "1597026383085",
        //         "state": "2",
        //         "depId": "4703879"
        //     }
        //
        let type = undefined;
        let id = undefined;
        const withdrawalId = this.safeString(transaction, 'wdId');
        const addressFrom = this.safeString(transaction, 'from');
        const addressTo = this.safeString(transaction, 'to');
        const address = addressTo;
        let tagTo = this.safeString2(transaction, 'tag', 'memo');
        tagTo = this.safeString2(transaction, 'pmtId', tagTo);
        if (withdrawalId !== undefined) {
            type = 'withdrawal';
            id = withdrawalId;
        }
        else {
            // the payment_id will appear on new deposits but appears to be removed from the response after 2 months
            id = this.safeString(transaction, 'depId');
            type = 'deposit';
        }
        const currencyId = this.safeString(transaction, 'ccy');
        const code = this.safeCurrencyCode(currencyId);
        const amount = this.safeNumber(transaction, 'amt');
        const status = this.parseTransactionStatus(this.safeString(transaction, 'state'));
        const txid = this.safeString(transaction, 'txId');
        const timestamp = this.safeInteger(transaction, 'ts');
        let feeCost = undefined;
        if (type === 'deposit') {
            feeCost = 0;
        }
        else {
            feeCost = this.safeNumber(transaction, 'fee');
        }
        // todo parse tags
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': undefined,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'tag': tagTo,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }
    async fetchLeverage(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLeverage', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'mgnMode', 'cross'); // cross as default marginMode
        }
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' fetchLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
            'mgnMode': marginMode,
        };
        const response = await this.privateGetAccountLeverageInfo(this.extend(request, params));
        //
        //     {
        //        "code": "0",
        //        "data": [
        //            {
        //                "instId": "BTC-USDT-SWAP",
        //                "lever": "5.00000000",
        //                "mgnMode": "isolated",
        //                "posSide": "net"
        //            }
        //        ],
        //        "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        let marketId = undefined;
        let marginMode = undefined;
        let longLeverage = undefined;
        let shortLeverage = undefined;
        for (let i = 0; i < leverage.length; i++) {
            const entry = leverage[i];
            marginMode = this.safeStringLower(entry, 'mgnMode');
            marketId = this.safeString(entry, 'instId');
            const positionSide = this.safeStringLower(entry, 'posSide');
            if (positionSide === 'long') {
                longLeverage = this.safeInteger(entry, 'lever');
            }
            else if (positionSide === 'short') {
                shortLeverage = this.safeInteger(entry, 'lever');
            }
            else {
                longLeverage = this.safeInteger(entry, 'lever');
                shortLeverage = this.safeInteger(entry, 'lever');
            }
        }
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        };
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const [type, query] = this.handleMarketTypeAndParams('fetchPosition', market, params);
        const request = {
            // instType String No Instrument type, MARGIN, SWAP, FUTURES, OPTION
            'instId': market['id'],
            // posId String No Single position ID or multiple position IDs (no more than 20) separated with comma
        };
        if (type !== undefined) {
            request['instType'] = this.convertToInstrumentType(type);
        }
        const response = await this.privateGetAccountPositions(this.extend(request, query));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "adl": "1",
        //                 "availPos": "1",
        //                 "avgPx": "2566.31",
        //                 "cTime": "1619507758793",
        //                 "ccy": "ETH",
        //                 "deltaBS": "",
        //                 "deltaPA": "",
        //                 "gammaBS": "",
        //                 "gammaPA": "",
        //                 "imr": "",
        //                 "instId": "ETH-USD-210430",
        //                 "instType": "FUTURES",
        //                 "interest": "0",
        //                 "last": "2566.22",
        //                 "lever": "10",
        //                 "liab": "",
        //                 "liabCcy": "",
        //                 "liqPx": "2352.8496681818233",
        //                 "margin": "0.0003896645377994",
        //                 "mgnMode": "isolated",
        //                 "mgnRatio": "11.731726509588816",
        //                 "mmr": "0.0000311811092368",
        //                 "optVal": "",
        //                 "pTime": "1619507761462",
        //                 "pos": "1",
        //                 "posCcy": "",
        //                 "posId": "307173036051017730",
        //                 "posSide": "long",
        //                 "thetaBS": "",
        //                 "thetaPA": "",
        //                 "tradeId": "109844",
        //                 "uTime": "1619507761462",
        //                 "upl": "-0.0000009932766034",
        //                 "uplRatio": "-0.0025490556801078",
        //                 "vegaBS": "",
        //                 "vegaPA": ""
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const position = this.safeDict(data, 0);
        if (position === undefined) {
            return undefined;
        }
        return this.parsePosition(position, market);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchPositions
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-positions-history history
         * @description fetch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] MARGIN, SWAP, FUTURES, OPTION
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const request = {
        // 'instType': 'MARGIN', // optional string, MARGIN, SWAP, FUTURES, OPTION
        // 'instId': market['id'], // optional string, e.g. 'BTC-USD-190927-5000-C'
        // 'posId': '307173036051017730', // optional string, Single or multiple position IDs (no more than 20) separated with commas
        };
        if (symbols !== undefined) {
            const marketIds = [];
            for (let i = 0; i < symbols.length; i++) {
                const entry = symbols[i];
                const market = this.market(entry);
                marketIds.push(market['id']);
            }
            const marketIdsLength = marketIds.length;
            if (marketIdsLength > 0) {
                request['instId'] = marketIds.join(',');
            }
        }
        const fetchPositionsOptions = this.safeDict(this.options, 'fetchPositions', {});
        const method = this.safeString(fetchPositionsOptions, 'method', 'privateGetAccountPositions');
        let response = undefined;
        if (method === 'privateGetAccountPositionsHistory') {
            response = await this.privateGetAccountPositionsHistory(this.extend(request, params));
        }
        else {
            response = await this.privateGetAccountPositions(this.extend(request, params));
        }
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "adl": "1",
        //                 "availPos": "1",
        //                 "avgPx": "2566.31",
        //                 "cTime": "1619507758793",
        //                 "ccy": "ETH",
        //                 "deltaBS": "",
        //                 "deltaPA": "",
        //                 "gammaBS": "",
        //                 "gammaPA": "",
        //                 "imr": "",
        //                 "instId": "ETH-USD-210430",
        //                 "instType": "FUTURES",
        //                 "interest": "0",
        //                 "last": "2566.22",
        //                 "lever": "10",
        //                 "liab": "",
        //                 "liabCcy": "",
        //                 "liqPx": "2352.8496681818233",
        //                 "margin": "0.0003896645377994",
        //                 "mgnMode": "isolated",
        //                 "mgnRatio": "11.731726509588816",
        //                 "mmr": "0.0000311811092368",
        //                 "optVal": "",
        //                 "pTime": "1619507761462",
        //                 "pos": "1",
        //                 "posCcy": "",
        //                 "posId": "307173036051017730",
        //                 "posSide": "long",
        //                 "thetaBS": "",
        //                 "thetaPA": "",
        //                 "tradeId": "109844",
        //                 "uTime": "1619507761462",
        //                 "upl": "-0.0000009932766034",
        //                 "uplRatio": "-0.0025490556801078",
        //                 "vegaBS": "",
        //                 "vegaPA": ""
        //             }
        //         ]
        //     }
        //
        const positions = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push(this.parsePosition(positions[i]));
        }
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    async fetchPositionsForSymbol(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchPositions
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-positions
         * @description fetch all open positions for specific symbol
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.instType] MARGIN (if needed)
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        return await this.fetchPositions([symbol], params);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //        "adl": "3",
        //        "availPos": "1",
        //        "avgPx": "34131.1",
        //        "cTime": "1627227626502",
        //        "ccy": "USDT",
        //        "deltaBS": "",
        //        "deltaPA": "",
        //        "gammaBS": "",
        //        "gammaPA": "",
        //        "imr": "170.66093041794787",
        //        "instId": "BTC-USDT-SWAP",
        //        "instType": "SWAP",
        //        "interest": "0",
        //        "last": "34134.4",
        //        "lever": "2",
        //        "liab": "",
        //        "liabCcy": "",
        //        "liqPx": "12608.959083877446",
        //        "markPx": "4786.459271773621",
        //        "margin": "",
        //        "mgnMode": "cross",
        //        "mgnRatio": "140.49930117599155",
        //        "mmr": "1.3652874433435829",
        //        "notionalUsd": "341.5130010779638",
        //        "optVal": "",
        //        "pos": "1",
        //        "posCcy": "",
        //        "posId": "339552508062380036",
        //        "posSide": "long",
        //        "thetaBS": "",
        //        "thetaPA": "",
        //        "tradeId": "98617799",
        //        "uTime": "1627227626502",
        //        "upl": "0.0108608358957281",
        //        "uplRatio": "0.0000636418743944",
        //        "vegaBS": "",
        //        "vegaPA": ""
        //    }
        // history
        //    {
        //        "cTime":"1708351230102",
        //        "ccy":"USDT",
        //        "closeAvgPx":"1.2567",
        //        "closeTotalPos":"40",
        //        "direction":"short",
        //        "fee":"-0.0351036",
        //        "fundingFee":"0",
        //        "instId":"SUSHI-USDT-SWAP",
        //        "instType":"SWAP",
        //        "lever":"10.0",
        //        "liqPenalty":"0",
        //        "mgnMode":"isolated",
        //        "openAvgPx":"1.2462",
        //        "openMaxPos":"40",
        //        "pnl":"-0.42",
        //        "pnlRatio":"-0.0912982667308618",
        //        "posId":"666159086676836352",
        //        "realizedPnl":"-0.4551036",
        //        "triggerPx":"",
        //        "type":"2",
        //        "uTime":"1708354805699",
        //        "uly":"SUSHI-USDT"
        //    }
        //
        const marketId = this.safeString(position, 'instId');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const symbol = market['symbol'];
        const pos = this.safeString(position, 'pos'); // 'pos' field: One way mode: 0 if position is not open, 1 if open | Two way (hedge) mode: -1 if short, 1 if long, 0 if position is not open
        const contractsAbs = Precise["default"].stringAbs(pos);
        let side = this.safeString2(position, 'posSide', 'direction');
        const hedged = side !== 'net';
        const contracts = this.parseNumber(contractsAbs);
        if (market['margin']) {
            // margin position
            if (side === 'net') {
                const posCcy = this.safeString(position, 'posCcy');
                const parsedCurrency = this.safeCurrencyCode(posCcy);
                if (parsedCurrency !== undefined) {
                    side = (market['base'] === parsedCurrency) ? 'long' : 'short';
                }
            }
            if (side === undefined) {
                side = this.safeString(position, 'direction');
            }
        }
        else {
            if (pos !== undefined) {
                if (side === 'net') {
                    if (Precise["default"].stringGt(pos, '0')) {
                        side = 'long';
                    }
                    else if (Precise["default"].stringLt(pos, '0')) {
                        side = 'short';
                    }
                    else {
                        side = undefined;
                    }
                }
            }
        }
        const contractSize = this.safeNumber(market, 'contractSize');
        const contractSizeString = this.numberToString(contractSize);
        const markPriceString = this.safeString(position, 'markPx');
        let notionalString = this.safeString(position, 'notionalUsd');
        if (market['inverse']) {
            notionalString = Precise["default"].stringDiv(Precise["default"].stringMul(contractsAbs, contractSizeString), markPriceString);
        }
        const notional = this.parseNumber(notionalString);
        const marginMode = this.safeString(position, 'mgnMode');
        let initialMarginString = undefined;
        const entryPriceString = this.safeString2(position, 'avgPx', 'openAvgPx');
        const unrealizedPnlString = this.safeString(position, 'upl');
        const leverageString = this.safeString(position, 'lever');
        let initialMarginPercentage = undefined;
        let collateralString = undefined;
        if (marginMode === 'cross') {
            initialMarginString = this.safeString(position, 'imr');
            collateralString = Precise["default"].stringAdd(initialMarginString, unrealizedPnlString);
        }
        else if (marginMode === 'isolated') {
            initialMarginPercentage = Precise["default"].stringDiv('1', leverageString);
            collateralString = this.safeString(position, 'margin');
        }
        const maintenanceMarginString = this.safeString(position, 'mmr');
        const maintenanceMargin = this.parseNumber(maintenanceMarginString);
        const maintenanceMarginPercentageString = Precise["default"].stringDiv(maintenanceMarginString, notionalString);
        if (initialMarginPercentage === undefined) {
            initialMarginPercentage = this.parseNumber(Precise["default"].stringDiv(initialMarginString, notionalString, 4));
        }
        else if (initialMarginString === undefined) {
            initialMarginString = Precise["default"].stringMul(initialMarginPercentage, notionalString);
        }
        const rounder = '0.00005'; // round to closest 0.01%
        const maintenanceMarginPercentage = this.parseNumber(Precise["default"].stringDiv(Precise["default"].stringAdd(maintenanceMarginPercentageString, rounder), '1', 4));
        const liquidationPrice = this.safeNumber(position, 'liqPx');
        const percentageString = this.safeString(position, 'uplRatio');
        const percentage = this.parseNumber(Precise["default"].stringMul(percentageString, '100'));
        const timestamp = this.safeInteger(position, 'cTime');
        const marginRatio = this.parseNumber(Precise["default"].stringDiv(maintenanceMarginString, collateralString, 4));
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'posId'),
            'symbol': symbol,
            'notional': notional,
            'marginMode': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': this.parseNumber(entryPriceString),
            'unrealizedPnl': this.parseNumber(unrealizedPnlString),
            'realizedPnl': this.safeNumber(position, 'realizedPnl'),
            'percentage': percentage,
            'contracts': contracts,
            'contractSize': contractSize,
            'markPrice': this.parseNumber(markPriceString),
            'lastPrice': this.safeNumber(position, 'closeAvgPx'),
            'side': side,
            'hedged': hedged,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': this.safeInteger(position, 'uTime'),
            'maintenanceMargin': maintenanceMargin,
            'maintenanceMarginPercentage': maintenanceMarginPercentage,
            'collateral': this.parseNumber(collateralString),
            'initialMargin': this.parseNumber(initialMarginString),
            'initialMarginPercentage': this.parseNumber(initialMarginPercentage),
            'leverage': this.parseNumber(leverageString),
            'marginRatio': marginRatio,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name okx#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-funds-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, toAccount);
        const request = {
            'ccy': currency['id'],
            'amt': this.currencyToPrecision(code, amount),
            'type': '0',
            'from': fromId,
            'to': toId, // beneficiary account, 6: Funding account, 18: Trading account
            // 'subAcct': 'sub-account-name', // optional, only required when type is 1, 2 or 4
            // 'loanTrans': false, // Whether or not borrowed coins can be transferred out under Multi-currency margin and Portfolio margin. The default is false
            // 'clientId': 'client-supplied id', // A combination of case-sensitive alphanumerics, all numbers, or all letters of up to 32 characters
            // 'omitPosRisk': false, // Ignore position risk. Default is false. Applicable to Portfolio margin
        };
        if (fromId === 'master') {
            request['type'] = '1';
            request['subAcct'] = toId;
            request['from'] = this.safeString(params, 'from', '6');
            request['to'] = this.safeString(params, 'to', '6');
        }
        else if (toId === 'master') {
            request['type'] = '2';
            request['subAcct'] = fromId;
            request['from'] = this.safeString(params, 'from', '6');
            request['to'] = this.safeString(params, 'to', '6');
        }
        const response = await this.privatePostAssetTransfer(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "transId": "754147",
        //                 "ccy": "USDT",
        //                 "from": "6",
        //                 "amt": "0.1",
        //                 "to": "18"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const rawTransfer = this.safeDict(data, 0, {});
        return this.parseTransfer(rawTransfer, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //     {
        //         "transId": "754147",
        //         "ccy": "USDT",
        //         "from": "6",
        //         "amt": "0.1",
        //         "to": "18"
        //     }
        //
        // fetchTransfer
        //
        //     {
        //         "amt": "5",
        //         "ccy": "USDT",
        //         "from": "18",
        //         "instId": "",
        //         "state": "success",
        //         "subAcct": "",
        //         "to": "6",
        //         "toInstId": "",
        //         "transId": "464424732",
        //         "type": "0"
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "bal": "70.6874353780312913",
        //         "balChg": "-4.0000000000000000", // negative means "to funding", positive meand "from funding"
        //         "billId": "588900695232225299",
        //         "ccy": "USDT",
        //         "execType": "",
        //         "fee": "",
        //         "from": "18",
        //         "instId": "",
        //         "instType": "",
        //         "mgnMode": "",
        //         "notes": "To Funding Account",
        //         "ordId": "",
        //         "pnl": "",
        //         "posBal": "",
        //         "posBalChg": "",
        //         "price": "0",
        //         "subType": "12",
        //         "sz": "-4",
        //         "to": "6",
        //         "ts": "1686676866989",
        //         "type": "1"
        //     }
        //
        const id = this.safeString2(transfer, 'transId', 'billId');
        const currencyId = this.safeString(transfer, 'ccy');
        const code = this.safeCurrencyCode(currencyId, currency);
        let amount = this.safeNumber(transfer, 'amt');
        const fromAccountId = this.safeString(transfer, 'from');
        const toAccountId = this.safeString(transfer, 'to');
        const accountsById = this.safeDict(this.options, 'accountsById', {});
        const timestamp = this.safeInteger(transfer, 'ts');
        const balanceChange = this.safeString(transfer, 'sz');
        if (balanceChange !== undefined) {
            amount = this.parseNumber(Precise["default"].stringAbs(balanceChange));
        }
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': this.safeString(accountsById, fromAccountId),
            'toAccount': this.safeString(accountsById, toAccountId),
            'status': this.parseTransferStatus(this.safeString(transfer, 'state')),
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'success': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchTransfer(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'transId': id,
            // 'type': 0, // default is 0 transfer within account, 1 master to sub, 2 sub to master
        };
        const response = await this.privateGetAssetTransferState(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "amt": "5",
        //                 "ccy": "USDT",
        //                 "from": "18",
        //                 "instId": "",
        //                 "state": "success",
        //                 "subAcct": "",
        //                 "to": "6",
        //                 "toInstId": "",
        //                 "transId": "464424732",
        //                 "type": "0"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const transfer = this.safeDict(data, 0);
        return this.parseTransfer(transfer);
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for
         * @param {int} [limit] the maximum number of transfers structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {
            'type': '1', // https://www.okx.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
        };
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        if (since !== undefined) {
            request['begin'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAccountBillsArchive(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "bal": "70.6874353780312913",
        //                "balChg": "-4.0000000000000000",
        //                "billId": "588900695232225299",
        //                "ccy": "USDT",
        //                "execType": "",
        //                "fee": "",
        //                "from": "18",
        //                "instId": "",
        //                "instType": "",
        //                "mgnMode": "",
        //                "notes": "To Funding Account",
        //                "ordId": "",
        //                "pnl": "",
        //                "posBal": "",
        //                "posBalChg": "",
        //                "price": "0",
        //                "subType": "12",
        //                "sz": "-4",
        //                "to": "6",
        //                "ts": "1686676866989",
        //                "type": "1"
        //            },
        //            ...
        //        ],
        //        "msg": ""
        //    }
        //
        const transfers = this.safeList(response, 'data', []);
        return this.parseTransfers(transfers, currency, since, limit, params);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isArray = Array.isArray(params);
        const request = '/api/' + this.version + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        let url = this.implodeHostname(this.urls['api']['rest']) + request;
        // const type = this.getPathAuthenticationType (path);
        if (api === 'public') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else if (api === 'private') {
            this.checkRequiredCredentials();
            // inject id in implicit api call
            if (method === 'POST' && (path === 'trade/batch-orders' || path === 'trade/order-algo' || path === 'trade/order')) {
                const brokerId = this.safeString(this.options, 'brokerId', 'e847386590ce4dBC');
                if (Array.isArray(params)) {
                    for (let i = 0; i < params.length; i++) {
                        const entry = params[i];
                        const clientOrderId = this.safeString(entry, 'clOrdId');
                        if (clientOrderId === undefined) {
                            entry['clOrdId'] = brokerId + this.uuid16();
                            entry['tag'] = brokerId;
                            params[i] = entry;
                        }
                    }
                }
                else {
                    const clientOrderId = this.safeString(params, 'clOrdId');
                    if (clientOrderId === undefined) {
                        params['clOrdId'] = brokerId + this.uuid16();
                        params['tag'] = brokerId;
                    }
                }
            }
            const timestamp = this.iso8601(this.milliseconds());
            headers = {
                'OK-ACCESS-KEY': this.apiKey,
                'OK-ACCESS-PASSPHRASE': this.password,
                'OK-ACCESS-TIMESTAMP': timestamp,
                // 'OK-FROM': '',
                // 'OK-TO': '',
                // 'OK-LIMIT': '',
            };
            let auth = timestamp + method + request;
            if (method === 'GET') {
                if (Object.keys(query).length) {
                    const urlencodedQuery = '?' + this.urlencode(query);
                    url += urlencodedQuery;
                    auth += urlencodedQuery;
                }
            }
            else {
                if (isArray || Object.keys(query).length) {
                    body = this.json(query);
                    auth += body;
                }
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256, 'base64');
            headers['OK-ACCESS-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    parseFundingRate(contract, market = undefined) {
        //
        //    {
        //        "fundingRate": "0.00027815",
        //        "fundingTime": "1634256000000",
        //        "instId": "BTC-USD-SWAP",
        //        "instType": "SWAP",
        //        "nextFundingRate": "0.00017",
        //        "nextFundingTime": "1634284800000"
        //    }
        //
        // in the response above nextFundingRate is actually two funding rates from now
        //
        const nextFundingRateTimestamp = this.safeInteger(contract, 'nextFundingTime');
        const marketId = this.safeString(contract, 'instId');
        const symbol = this.safeSymbol(marketId, market);
        const nextFundingRate = this.safeNumber(contract, 'nextFundingRate');
        const fundingTime = this.safeInteger(contract, 'fundingTime');
        // https://www.okx.com/support/hc/en-us/articles/360053909272-Ⅸ-Introduction-to-perpetual-swap-funding-fee
        // > The current interest is 0.
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'fundingRate'),
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601(fundingTime),
            'nextFundingRate': nextFundingRate,
            'nextFundingTimestamp': nextFundingRateTimestamp,
            'nextFundingDatetime': this.iso8601(nextFundingRateTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.ExchangeError(this.id + ' fetchFundingRate() is only valid for swap markets');
        }
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetPublicFundingRate(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "fundingRate": "0.00027815",
        //                "fundingTime": "1634256000000",
        //                "instId": "BTC-USD-SWAP",
        //                "instType": "SWAP",
        //                "nextFundingRate": "0.00017",
        //                "nextFundingTime": "1634284800000"
        //            }
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const entry = this.safeDict(data, 0, {});
        return this.parseFundingRate(entry, market);
    }
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch funding history for
         * @param {int} [limit] the maximum number of funding history structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets();
        const request = {
            // 'instType': 'SPOT', // SPOT, MARGIN, SWAP, FUTURES, OPTION
            // 'ccy': currency['id'],
            // 'mgnMode': 'isolated', // isolated, cross
            // 'ctType': 'linear', // linear, inverse, only applicable to FUTURES/SWAP
            'type': '8',
            //
            // supported values for type
            //
            //     1 Transfer
            //     2 Trade
            //     3 Delivery
            //     4 Auto token conversion
            //     5 Liquidation
            //     6 Margin transfer
            //     7 Interest deduction
            //     8 Funding fee
            //     9 ADL
            //     10 Clawback
            //     11 System token conversion
            //     12 Strategy transfer
            //     13 ddh
            //
            // 'subType': '',
            //
            // supported values for subType
            //
            //     1 Buy
            //     2 Sell
            //     3 Open long
            //     4 Open short
            //     5 Close long
            //     6 Close short
            //     9 Interest deduction
            //     11 Transfer in
            //     12 Transfer out
            //     160 Manual margin increase
            //     161 Manual margin decrease
            //     162 Auto margin increase
            //     110 Auto buy
            //     111 Auto sell
            //     118 System token conversion transfer in
            //     119 System token conversion transfer out
            //     100 Partial liquidation close long
            //     101 Partial liquidation close short
            //     102 Partial liquidation buy
            //     103 Partial liquidation sell
            //     104 Liquidation long
            //     105 Liquidation short
            //     106 Liquidation buy
            //     107 Liquidation sell
            //     110 Liquidation transfer in
            //     111 Liquidation transfer out
            //     125 ADL close long
            //     126 ADL close short
            //     127 ADL buy
            //     128 ADL sell
            //     131 ddh buy
            //     132 ddh sell
            //     170 Exercised
            //     171 Counterparty exercised
            //     172 Expired OTM
            //     112 Delivery long
            //     113 Delivery short
            //     117 Delivery/Exercise clawback
            //     173 Funding fee expense
            //     174 Funding fee income
            //     200 System transfer in
            //     201 Manually transfer in
            //     202 System transfer out
            //     203 Manually transfer out
            //
            // "after": "id", // earlier than the requested bill ID
            // "before": "id", // newer than the requested bill ID
            // "limit": "100", // default 100, max 100
        };
        if (limit !== undefined) {
            request['limit'] = limit.toString(); // default 100, max 100
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            if (market['contract']) {
                if (market['linear']) {
                    request['ctType'] = 'linear';
                    request['ccy'] = market['quoteId'];
                }
                else {
                    request['ctType'] = 'inverse';
                    request['ccy'] = market['baseId'];
                }
            }
        }
        const [type, query] = this.handleMarketTypeAndParams('fetchFundingHistory', market, params);
        if (type === 'swap') {
            request['instType'] = this.convertToInstrumentType(type);
        }
        // AccountBillsArchive has the same cost as AccountBills but supports three months of data
        const response = await this.privateGetAccountBillsArchive(this.extend(request, query));
        //
        //    {
        //        "bal": "0.0242946200998573",
        //        "balChg": "0.0000148752712240",
        //        "billId": "377970609204146187",
        //        "ccy": "ETH",
        //        "execType": "",
        //        "fee": "0",
        //        "from": "",
        //        "instId": "ETH-USD-SWAP",
        //        "instType": "SWAP",
        //        "mgnMode": "isolated",
        //        "notes": "",
        //        "ordId": "",
        //        "pnl": "0.000014875271224",
        //        "posBal": "0",
        //        "posBalChg": "0",
        //        "subType": "174",
        //        "sz": "9",
        //        "to": "",
        //        "ts": "1636387215588",
        //        "type": "8"
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger(entry, 'ts');
            const instId = this.safeString(entry, 'instId');
            const marketInner = this.safeMarket(instId);
            const currencyId = this.safeString(entry, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            result.push({
                'info': entry,
                'symbol': marketInner['symbol'],
                'code': code,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'id': this.safeString(entry, 'billId'),
                'amount': this.safeNumber(entry, 'balChg'),
            });
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#setLeverage
         * @description set the level of leverage for a market
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-set-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @param {string} [params.posSide] 'long' or 'short' for isolated margin long/short mode on futures and swap markets
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 125)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between 1 and 125');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('setLeverage', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'mgnMode', 'cross'); // cross as default marginMode
        }
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' setLeverage() requires a marginMode parameter that must be either cross or isolated');
        }
        const request = {
            'lever': leverage,
            'mgnMode': marginMode,
            'instId': market['id'],
        };
        const posSide = this.safeString(params, 'posSide');
        if (marginMode === 'isolated') {
            if (posSide === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a posSide argument for isolated margin');
            }
            if (posSide !== 'long' && posSide !== 'short' && posSide !== 'net') {
                throw new errors.BadRequest(this.id + ' setLeverage() requires the posSide argument to be either "long", "short" or "net"');
            }
        }
        const response = await this.privatePostAccountSetLeverage(this.extend(request, params));
        //
        //     {
        //       "code": "0",
        //       "data": [
        //         {
        //           "instId": "BTC-USDT-SWAP",
        //           "lever": "5",
        //           "mgnMode": "isolated",
        //           "posSide": "long"
        //         }
        //       ],
        //       "msg": ""
        //     }
        //
        return response;
    }
    async fetchPositionMode(symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchPositionMode
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-account-configuration
         * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [param.accountId] if you have multiple accounts, you must specify the account id to fetch the position mode
         * @returns {object} an object detailing whether the market is in hedged or one-way mode
         */
        const accounts = await this.fetchAccounts();
        const length = accounts.length;
        let selectedAccount = undefined;
        if (length > 1) {
            const accountId = this.safeString(params, 'accountId');
            if (accountId === undefined) {
                const accountIds = this.getListFromObjectValues(accounts, 'id');
                throw new errors.ExchangeError(this.id + ' fetchPositionMode() can not detect position mode, because you have multiple accounts. Set params["accountId"] to desired id from: ' + accountIds.join(', '));
            }
            else {
                const accountsById = this.indexBy(accounts, 'id');
                selectedAccount = this.safeDict(accountsById, accountId);
            }
        }
        else {
            selectedAccount = accounts[0];
        }
        const mainAccount = selectedAccount['info'];
        const posMode = this.safeString(mainAccount, 'posMode'); // long_short_mode, net_mode
        const isHedged = posMode === 'long_short_mode';
        return {
            'info': mainAccount,
            'hedged': isHedged,
        };
    }
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#setPositionMode
         * @description set hedged to true or false for a market
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-set-position-mode
         * @param {bool} hedged set to true to use long_short_mode, false for net_mode
         * @param {string} symbol not used by okx setPositionMode
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        let hedgeMode = undefined;
        if (hedged) {
            hedgeMode = 'long_short_mode';
        }
        else {
            hedgeMode = 'net_mode';
        }
        const request = {
            'posMode': hedgeMode,
        };
        const response = await this.privatePostAccountSetPositionMode(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "posMode": "net_mode"
        //            }
        //        ],
        //        "msg": ""
        //    }
        //
        return response;
    }
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name okx#setMarginMode
         * @description set margin mode to 'cross' or 'isolated'
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-set-leverage
         * @param {string} marginMode 'cross' or 'isolated'
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.leverage] leverage
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        marginMode = marginMode.toLowerCase();
        if ((marginMode !== 'cross') && (marginMode !== 'isolated')) {
            throw new errors.BadRequest(this.id + ' setMarginMode() marginMode must be either cross or isolated');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const lever = this.safeInteger2(params, 'lever', 'leverage');
        if ((lever === undefined) || (lever < 1) || (lever > 125)) {
            throw new errors.BadRequest(this.id + ' setMarginMode() params["lever"] should be between 1 and 125');
        }
        params = this.omit(params, ['leverage']);
        const request = {
            'lever': lever,
            'mgnMode': marginMode,
            'instId': market['id'],
        };
        const response = await this.privatePostAccountSetLeverage(this.extend(request, params));
        //
        //     {
        //       "code": "0",
        //       "data": [
        //         {
        //           "instId": "BTC-USDT-SWAP",
        //           "lever": "5",
        //           "mgnMode": "isolated",
        //           "posSide": "long"
        //         }
        //       ],
        //       "msg": ""
        //     }
        //
        return response;
    }
    async fetchCrossBorrowRates(params = {}) {
        /**
         * @method
         * @name okx#fetchCrossBorrowRates
         * @description fetch the borrow interest rates of all currencies
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-interest-rate
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
        await this.loadMarkets();
        const response = await this.privateGetAccountInterestRate(params);
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "ccy": "BTC",
        //                "interestRate": "0.00000833"
        //            }
        //            ...
        //        ],
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            rates.push(this.parseBorrowRate(data[i]));
        }
        return rates;
    }
    async fetchCrossBorrowRate(code, params = {}) {
        /**
         * @method
         * @name okx#fetchCrossBorrowRate
         * @description fetch the rate of interest to borrow a currency for margin trading
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-interest-rate
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
        };
        const response = await this.privateGetAccountInterestRate(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //             {
        //                "ccy": "USDT",
        //                "interestRate": "0.00002065"
        //             }
        //             ...
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const rate = this.safeDict(data, 0, {});
        return this.parseBorrowRate(rate);
    }
    parseBorrowRate(info, currency = undefined) {
        //
        //    {
        //        "amt": "992.10341195",
        //        "ccy": "BTC",
        //        "rate": "0.01",
        //        "ts": "1643954400000"
        //    }
        //
        const ccy = this.safeString(info, 'ccy');
        const timestamp = this.safeInteger(info, 'ts');
        return {
            'currency': this.safeCurrencyCode(ccy),
            'rate': this.safeNumber2(info, 'interestRate', 'rate'),
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    parseBorrowRateHistories(response, codes, since, limit) {
        //
        //    [
        //        {
        //            "amt": "992.10341195",
        //            "ccy": "BTC",
        //            "rate": "0.01",
        //            "ts": "1643954400000"
        //        },
        //        ...
        //    ]
        //
        const borrowRateHistories = {};
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const code = this.safeCurrencyCode(this.safeString(item, 'ccy'));
            if (codes === undefined || this.inArray(code, codes)) {
                if (!(code in borrowRateHistories)) {
                    borrowRateHistories[code] = [];
                }
                const borrowRateStructure = this.parseBorrowRate(item);
                borrowRateHistories[code].push(borrowRateStructure);
            }
        }
        const keys = Object.keys(borrowRateHistories);
        for (let i = 0; i < keys.length; i++) {
            const code = keys[i];
            borrowRateHistories[code] = this.filterByCurrencySinceLimit(borrowRateHistories[code], code, since, limit);
        }
        return borrowRateHistories;
    }
    parseBorrowRateHistory(response, code, since, limit) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const item = response[i];
            const borrowRate = this.parseBorrowRate(item);
            result.push(borrowRate);
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterByCurrencySinceLimit(sorted, code, since, limit);
    }
    async fetchBorrowRateHistories(codes = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchBorrowRateHistories
         * @description retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
         * @see https://www.okx.com/docs-v5/en/#financial-product-savings-get-public-borrow-history-public
         * @param {string[]|undefined} codes list of unified currency codes, default is undefined
         * @param {int} [since] timestamp in ms of the earliest borrowRate, default is undefined
         * @param {int} [limit] max number of borrow rate prices to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} indexed by the market symbol
         */
        await this.loadMarkets();
        const request = {
        // 'ccy': currency['id'],
        // 'after': this.milliseconds (), // Pagination of data to return records earlier than the requested ts,
        // 'before': since, // Pagination of data to return records newer than the requested ts,
        // 'limit': limit, // default is 100 and maximum is 100
        };
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetFinanceSavingsLendingRateHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "amt": "992.10341195",
        //                 "ccy": "BTC",
        //                 "rate": "0.01",
        //                 "ts": "1643954400000"
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseBorrowRateHistories(data, codes, since, limit);
    }
    async fetchBorrowRateHistory(code, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchBorrowRateHistory
         * @description retrieves a history of a currencies borrow interest rate at specific time slots
         * @see https://www.okx.com/docs-v5/en/#financial-product-savings-get-public-borrow-history-public
         * @param {string} code unified currency code
         * @param {int} [since] timestamp for the earliest borrow rate
         * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
            // 'after': this.milliseconds (), // Pagination of data to return records earlier than the requested ts,
            // 'before': since, // Pagination of data to return records newer than the requested ts,
            // 'limit': limit, // default is 100 and maximum is 100
        };
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetFinanceSavingsLendingRateHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "amt": "992.10341195",
        //                 "ccy": "BTC",
        //                 "rate": "0.01",
        //                 "ts": "1643954400000"
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseBorrowRateHistory(data, code, since, limit);
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const posSide = this.safeString(params, 'posSide', 'net');
        params = this.omit(params, ['posSide']);
        const request = {
            'instId': market['id'],
            'amt': amount,
            'type': type,
            'posSide': posSide,
        };
        const response = await this.privatePostAccountPositionMarginBalance(this.extend(request, params));
        //
        //     {
        //       "code": "0",
        //       "data": [
        //         {
        //           "amt": "0.01",
        //           "instId": "ETH-USD-SWAP",
        //           "posSide": "net",
        //           "type": "reduce"
        //         }
        //       ],
        //       "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const entry = this.safeDict(data, 0, {});
        const errorCode = this.safeString(response, 'code');
        return this.extend(this.parseMarginModification(entry, market), {
            'status': (errorCode === '0') ? 'ok' : 'failed',
        });
    }
    parseMarginModification(data, market = undefined) {
        //
        // addMargin/reduceMargin
        //
        //    {
        //        "amt": "0.01",
        //        "instId": "ETH-USD-SWAP",
        //        "posSide": "net",
        //        "type": "reduce"
        //    }
        //
        // fetchMarginAdjustmentHistory
        //
        //    {
        //        bal: '67621.4325135010619812',
        //        balChg: '-10.0000000000000000',
        //        billId: '691293628710342659',
        //        ccy: 'USDT',
        //        clOrdId: '',
        //        execType: '',
        //        fee: '0',
        //        fillFwdPx: '',
        //        fillIdxPx: '',
        //        fillMarkPx: '',
        //        fillMarkVol: '',
        //        fillPxUsd: '',
        //        fillPxVol: '',
        //        fillTime: '1711089244850',
        //        from: '',
        //        instId: 'XRP-USDT-SWAP',
        //        instType: 'SWAP',
        //        interest: '0',
        //        mgnMode: 'isolated',
        //        notes: '',
        //        ordId: '',
        //        pnl: '0',
        //        posBal: '73.12',
        //        posBalChg: '10.00',
        //        px: '',
        //        subType: '160',
        //        sz: '10',
        //        tag: '',
        //        to: '',
        //        tradeId: '0',
        //        ts: '1711089244699',
        //        type: '6'
        //    }
        //
        const amountRaw = this.safeString2(data, 'amt', 'posBalChg');
        const typeRaw = this.safeString(data, 'type');
        let type = undefined;
        if (typeRaw === '6') {
            type = Precise["default"].stringGt(amountRaw, '0') ? 'add' : 'reduce';
        }
        else {
            type = typeRaw;
        }
        const amount = Precise["default"].stringAbs(amountRaw);
        const marketId = this.safeString(data, 'instId');
        const responseMarket = this.safeMarket(marketId, market);
        const code = responseMarket['inverse'] ? responseMarket['base'] : responseMarket['quote'];
        const timestamp = this.safeInteger(data, 'ts');
        return {
            'info': data,
            'symbol': responseMarket['symbol'],
            'type': type,
            'marginMode': 'isolated',
            'amount': this.parseNumber(amount),
            'code': code,
            'total': undefined,
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name okx#reduceMargin
         * @description remove margin from a position
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-increase-decrease-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'reduce', params);
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name okx#addMargin
         * @description add margin
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-increase-decrease-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    async fetchMarketLeverageTiers(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchMarketLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
         * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-position-tiers
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const type = market['spot'] ? 'MARGIN' : this.convertToInstrumentType(market['type']);
        const uly = this.safeString(market['info'], 'uly');
        if (!uly) {
            if (type !== 'MARGIN') {
                throw new errors.BadRequest(this.id + ' fetchMarketLeverageTiers() cannot fetch leverage tiers for ' + symbol);
            }
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchMarketLeverageTiers', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'tdMode', 'cross'); // cross as default marginMode
        }
        const request = {
            'instType': type,
            'tdMode': marginMode,
            'uly': uly,
        };
        if (type === 'MARGIN') {
            request['instId'] = market['id'];
        }
        const response = await this.publicGetPublicPositionTiers(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "baseMaxLoan": "500",
        //                "imr": "0.1",
        //                "instId": "ETH-USDT",
        //                "maxLever": "10",
        //                "maxSz": "500",
        //                "minSz": "0",
        //                "mmr": "0.03",
        //                "optMgnFactor": "0",
        //                "quoteMaxLoan": "200000",
        //                "tier": "1",
        //                "uly": ""
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseMarketLeverageTiers(data, market);
    }
    parseMarketLeverageTiers(info, market = undefined) {
        /**
         * @ignore
         * @method
         * @param {object} info Exchange response for 1 market
         * @param {object} market CCXT market
         */
        //
        //    [
        //        {
        //            "baseMaxLoan": "500",
        //            "imr": "0.1",
        //            "instId": "ETH-USDT",
        //            "maxLever": "10",
        //            "maxSz": "500",
        //            "minSz": "0",
        //            "mmr": "0.03",
        //            "optMgnFactor": "0",
        //            "quoteMaxLoan": "200000",
        //            "tier": "1",
        //            "uly": ""
        //        },
        //        ...
        //    ]
        //
        const tiers = [];
        for (let i = 0; i < info.length; i++) {
            const tier = info[i];
            tiers.push({
                'tier': this.safeInteger(tier, 'tier'),
                'currency': market['quote'],
                'minNotional': this.safeNumber(tier, 'minSz'),
                'maxNotional': this.safeNumber(tier, 'maxSz'),
                'maintenanceMarginRate': this.safeNumber(tier, 'mmr'),
                'maxLeverage': this.safeNumber(tier, 'maxLever'),
                'info': tier,
            });
        }
        return tiers;
    }
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchBorrowInterest
         * @description fetch the interest owed by the user for borrowing currency for margin trading
         * @see https://www.okx.com/docs-v5/en/#rest-api-account-get-interest-accrued-data
         * @param {string} code the unified currency code for the currency of the interest
         * @param {string} symbol the market symbol of an isolated margin market, if undefined, the interest for cross margin markets is returned
         * @param {int} [since] timestamp in ms of the earliest time to receive interest records for
         * @param {int} [limit] the number of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure} to retrieve
         * @param {object} [params] exchange specific parameters
         * @param {int} [params.type] Loan type 1 - VIP loans 2 - Market loans *Default is Market loans*
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object[]} An list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
         */
        await this.loadMarkets();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchBorrowInterest', params);
        if (marginMode === undefined) {
            marginMode = this.safeString(params, 'mgnMode', 'cross'); // cross as default marginMode
        }
        const request = {
            'mgnMode': marginMode,
        };
        let market = undefined;
        if (code !== undefined) {
            const currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        if (since !== undefined) {
            request['before'] = since - 1;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['instId'] = market['id'];
        }
        const response = await this.privateGetAccountInterestAccrued(this.extend(request, params));
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "ccy": "USDT",
        //                "instId": "",
        //                "interest": "0.0003960833333334",
        //                "interestRate": "0.0000040833333333",
        //                "liab": "97",
        //                "mgnMode": "",
        //                "ts": "1637312400000",
        //                "type": "1"
        //            },
        //            ...
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const interest = this.parseBorrowInterests(data);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        const instId = this.safeString(info, 'instId');
        if (instId !== undefined) {
            market = this.safeMarket(instId, market);
        }
        const timestamp = this.safeInteger(info, 'ts');
        return {
            'symbol': this.safeString(market, 'symbol'),
            'marginMode': this.safeString(info, 'mgnMode'),
            'currency': this.safeCurrencyCode(this.safeString(info, 'ccy')),
            'interest': this.safeNumber(info, 'interest'),
            'interestRate': this.safeNumber(info, 'interestRate'),
            'amountBorrowed': this.safeNumber(info, 'liab'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    async borrowCrossMargin(code, amount, params = {}) {
        /**
         * @method
         * @name okx#borrowCrossMargin
         * @description create a loan to borrow margin (need to be VIP 5 and above)
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-vip-loans-borrow-and-repay
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
            'amt': this.currencyToPrecision(code, amount),
            'side': 'borrow',
        };
        const response = await this.privatePostAccountBorrowRepay(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "amt": "102",
        //                 "ccy": "USDT",
        //                 "ordId": "544199684697214976",
        //                 "side": "borrow",
        //                 "state": "1"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const loan = this.safeDict(data, 0, {});
        return this.parseMarginLoan(loan, currency);
    }
    async repayCrossMargin(code, amount, params = {}) {
        /**
         * @method
         * @name okx#repayCrossMargin
         * @description repay borrowed margin and interest
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-vip-loans-borrow-and-repay
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.id] the order ID of borrowing, it is necessary while repaying
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets();
        const id = this.safeString2(params, 'id', 'ordId');
        params = this.omit(params, 'id');
        if (id === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' repayCrossMargin() requires an id parameter');
        }
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
            'amt': this.currencyToPrecision(code, amount),
            'side': 'repay',
            'ordId': id,
        };
        const response = await this.privatePostAccountBorrowRepay(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "amt": "102",
        //                 "ccy": "USDT",
        //                 "ordId": "544199684697214976",
        //                 "side": "repay",
        //                 "state": "1"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const loan = this.safeDict(data, 0, {});
        return this.parseMarginLoan(loan, currency);
    }
    parseMarginLoan(info, currency = undefined) {
        //
        //     {
        //         "amt": "102",
        //         "availLoan": "97",
        //         "ccy": "USDT",
        //         "loanQuota": "6000000",
        //         "posLoan": "0",
        //         "side": "repay",
        //         "usedLoan": "97"
        //     }
        //
        const currencyId = this.safeString(info, 'ccy');
        return {
            'id': undefined,
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(info, 'amt'),
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    async fetchOpenInterest(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-open-interest
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const type = this.convertToInstrumentType(market['type']);
        const uly = this.safeString(market['info'], 'uly');
        const request = {
            'instType': type,
            'uly': uly,
            'instId': market['id'],
        };
        const response = await this.publicGetPublicOpenInterest(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "instId": "BTC-USDT-SWAP",
        //                 "instType": "SWAP",
        //                 "oi": "2125419",
        //                 "oiCcy": "21254.19",
        //                 "ts": "1664005108969"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOpenInterest(data[0], market);
    }
    async fetchOpenInterestHistory(symbol, timeframe = '1d', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchOpenInterestHistory
         * @description Retrieves the open interest history of a currency
         * @see https://www.okx.com/docs-v5/en/#rest-api-trading-data-get-contracts-open-interest-and-volume
         * @see https://www.okx.com/docs-v5/en/#rest-api-trading-data-get-options-open-interest-and-volume
         * @param {string} symbol Unified CCXT currency code or unified symbol
         * @param {string} timeframe "5m", "1h", or "1d" for option only "1d" or "8h"
         * @param {int} [since] The time in ms of the earliest record to retrieve as a unix timestamp
         * @param {int} [limit] Not used by okx, but parsed internally by CCXT
         * @param {object} [params] Exchange specific parameters
         * @param {int} [params.until] The time in ms of the latest record to retrieve as a unix timestamp
         * @returns An array of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
         */
        const options = this.safeDict(this.options, 'fetchOpenInterestHistory', {});
        const timeframes = this.safeDict(options, 'timeframes', {});
        timeframe = this.safeString(timeframes, timeframe, timeframe);
        if (timeframe !== '5m' && timeframe !== '1H' && timeframe !== '1D') {
            throw new errors.BadRequest(this.id + ' fetchOpenInterestHistory cannot only use the 5m, 1h, and 1d timeframe');
        }
        await this.loadMarkets();
        // handle unified currency code or symbol
        let currencyId = undefined;
        let market = undefined;
        if ((symbol in this.markets) || (symbol in this.markets_by_id)) {
            market = this.market(symbol);
            currencyId = market['baseId'];
        }
        else {
            const currency = this.currency(symbol);
            currencyId = currency['id'];
        }
        const request = {
            'ccy': currencyId,
            'period': timeframe,
        };
        let type = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOpenInterestHistory', market, params);
        if (type === 'option') {
            response = await this.publicGetRubikStatOptionOpenInterestVolume(this.extend(request, params));
        }
        else {
            if (since !== undefined) {
                request['begin'] = since;
            }
            const until = this.safeInteger(params, 'until');
            if (until !== undefined) {
                request['end'] = until;
                params = this.omit(params, ['until']);
            }
            response = await this.publicGetRubikStatContractsOpenInterestVolume(this.extend(request, params));
        }
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            [
        //                "1648221300000",  // timestamp
        //                "2183354317.945",  // open interest (USD)
        //                "74285877.617",  // volume (USD)
        //            ],
        //            ...
        //        ],
        //        "msg": ''
        //    }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOpenInterests(data, undefined, since, limit);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        // fetchOpenInterestHistory
        //
        //    [
        //        "1648221300000",  // timestamp
        //        "2183354317.945",  // open interest (USD) - (coin) for options
        //        "74285877.617",  // volume (USD) - (coin) for options
        //    ]
        //
        // fetchOpenInterest
        //
        //     {
        //         "instId": "BTC-USD-230520-25500-P",
        //         "instType": "OPTION",
        //         "oi": "300",
        //         "oiCcy": "3",
        //         "ts": "1684551166251"
        //     }
        //
        const id = this.safeString(interest, 'instId');
        market = this.safeMarket(id, market);
        const time = this.safeInteger(interest, 'ts');
        const timestamp = this.safeInteger(interest, 0, time);
        let baseVolume = undefined;
        let quoteVolume = undefined;
        let openInterestAmount = undefined;
        let openInterestValue = undefined;
        const type = this.safeString(this.options, 'defaultType');
        if (Array.isArray(interest)) {
            if (type === 'option') {
                openInterestAmount = this.safeNumber(interest, 1);
                baseVolume = this.safeNumber(interest, 2);
            }
            else {
                openInterestValue = this.safeNumber(interest, 1);
                quoteVolume = this.safeNumber(interest, 2);
            }
        }
        else {
            baseVolume = this.safeNumber(interest, 'oiCcy');
            openInterestAmount = this.safeNumber(interest, 'oi');
            openInterestValue = this.safeNumber(interest, 'oiCcy');
        }
        return this.safeOpenInterest({
            'symbol': this.safeSymbol(id),
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'openInterestAmount': openInterestAmount,
            'openInterestValue': openInterestValue,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        this.options['sandboxMode'] = enable;
        if (enable) {
            this.headers['x-simulated-trading'] = '1';
        }
        else if ('x-simulated-trading' in this.headers) {
            this.headers = this.omit(this.headers, 'x-simulated-trading');
        }
    }
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const response = await this.privateGetAssetCurrencies(params);
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "canDep": true,
        //                "canInternal": false,
        //                "canWd": true,
        //                "ccy": "USDT",
        //                "chain": "USDT-TRC20",
        //                "logoLink": "https://static.coinall.ltd/cdn/assets/imgs/221/5F74EB20302D7761.png",
        //                "mainNet": false,
        //                "maxFee": "1.6",
        //                "maxWd": "8852150",
        //                "minFee": "0.8",
        //                "minWd": "2",
        //                "name": "Tether",
        //                "usedWdQuota": "0",
        //                "wdQuota": "500",
        //                "wdTickSz": "3"
        //            },
        //            {
        //                "canDep": true,
        //                "canInternal": false,
        //                "canWd": true,
        //                "ccy": "USDT",
        //                "chain": "USDT-ERC20",
        //                "logoLink": "https://static.coinall.ltd/cdn/assets/imgs/221/5F74EB20302D7761.png",
        //                "mainNet": false,
        //                "maxFee": "16",
        //                "maxWd": "8852150",
        //                "minFee": "8",
        //                "minWd": "2",
        //                "name": "Tether",
        //                "usedWdQuota": "0",
        //                "wdQuota": "500",
        //                "wdTickSz": "3"
        //            },
        //            ...
        //        ],
        //        "msg": ""
        //    }
        //
        const data = this.safeList(response, 'data');
        return this.parseDepositWithdrawFees(data, codes);
    }
    parseDepositWithdrawFees(response, codes = undefined, currencyIdKey = undefined) {
        //
        // [
        //   {
        //       "canDep": true,
        //       "canInternal": false,
        //       "canWd": true,
        //       "ccy": "USDT",
        //       "chain": "USDT-TRC20",
        //       "logoLink": "https://static.coinall.ltd/cdn/assets/imgs/221/5F74EB20302D7761.png",
        //       "mainNet": false,
        //       "maxFee": "1.6",
        //       "maxWd": "8852150",
        //       "minFee": "0.8",
        //       "minWd": "2",
        //       "name": "Tether",
        //       "usedWdQuota": "0",
        //       "wdQuota": "500",
        //       "wdTickSz": "3"
        //   }
        // ]
        //
        const depositWithdrawFees = {};
        codes = this.marketCodes(codes);
        for (let i = 0; i < response.length; i++) {
            const feeInfo = response[i];
            const currencyId = this.safeString(feeInfo, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            if ((codes === undefined) || (this.inArray(code, codes))) {
                const depositWithdrawFee = this.safeValue(depositWithdrawFees, code);
                if (depositWithdrawFee === undefined) {
                    depositWithdrawFees[code] = this.depositWithdrawFee({});
                }
                depositWithdrawFees[code]['info'][currencyId] = feeInfo;
                const chain = this.safeString(feeInfo, 'chain');
                const chainSplit = chain.split('-');
                const networkId = this.safeValue(chainSplit, 1);
                const withdrawFee = this.safeNumber(feeInfo, 'minFee');
                const withdrawResult = {
                    'fee': withdrawFee,
                    'percentage': (withdrawFee !== undefined) ? false : undefined,
                };
                const depositResult = {
                    'fee': undefined,
                    'percentage': undefined,
                };
                const networkCode = this.networkIdToCode(networkId, code);
                depositWithdrawFees[code]['networks'][networkCode] = {
                    'withdraw': withdrawResult,
                    'deposit': depositResult,
                };
            }
        }
        const depositWithdrawCodes = Object.keys(depositWithdrawFees);
        for (let i = 0; i < depositWithdrawCodes.length; i++) {
            const code = depositWithdrawCodes[i];
            const currency = this.currency(code);
            depositWithdrawFees[code] = this.assignDefaultDepositWithdrawFees(depositWithdrawFees[code], currency);
        }
        return depositWithdrawFees;
    }
    async fetchSettlementHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchSettlementHistory
         * @description fetches historical settlement records
         * @see https://www.okx.com/docs-v5/en/#rest-api-public-data-get-delivery-exercise-history
         * @param {string} symbol unified market symbol to fetch the settlement history for
         * @param {int} [since] timestamp in ms
         * @param {int} [limit] number of records
         * @param {object} [params] exchange specific params
         * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchSettlementHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchSettlementHistory', market, params);
        if (type !== 'future' && type !== 'option') {
            throw new errors.NotSupported(this.id + ' fetchSettlementHistory() supports futures and options markets only');
        }
        const request = {
            'instType': this.convertToInstrumentType(type),
            'uly': market['baseId'] + '-' + market['quoteId'],
        };
        if (since !== undefined) {
            request['before'] = since - 1;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicDeliveryExerciseHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "details": [
        //                     {
        //                         "insId": "BTC-USD-230523-25750-C",
        //                         "px": "27290.1486867000556483",
        //                         "type": "exercised"
        //                     },
        //                 ],
        //                 "ts":"1684656000000"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const settlements = this.parseSettlements(data, market);
        const sorted = this.sortBy(settlements, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseSettlement(settlement, market) {
        //
        //     {
        //         "insId": "BTC-USD-230521-28500-P",
        //         "px": "27081.2007345984751516",
        //         "type": "exercised"
        //     }
        //
        const marketId = this.safeString(settlement, 'insId');
        return {
            'info': settlement,
            'symbol': this.safeSymbol(marketId, market),
            'price': this.safeNumber(settlement, 'px'),
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    parseSettlements(settlements, market) {
        //
        //     {
        //         "details": [
        //             {
        //                 "insId": "BTC-USD-230523-25750-C",
        //                 "px": "27290.1486867000556483",
        //                 "type": "exercised"
        //             },
        //         ],
        //         "ts":"1684656000000"
        //     }
        //
        const result = [];
        for (let i = 0; i < settlements.length; i++) {
            const entry = settlements[i];
            const timestamp = this.safeInteger(entry, 'ts');
            const details = this.safeList(entry, 'details', []);
            for (let j = 0; j < details.length; j++) {
                const settlement = this.parseSettlement(details[j], market);
                result.push(this.extend(settlement, {
                    'timestamp': timestamp,
                    'datetime': this.iso8601(timestamp),
                }));
            }
        }
        return result;
    }
    async fetchUnderlyingAssets(params = {}) {
        /**
         * @method
         * @name okx#fetchUnderlyingAssets
         * @description fetches the market ids of underlying assets for a specific contract market type
         * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-underlying
         * @param {object} [params] exchange specific params
         * @param {string} [params.type] the contract market type, 'option', 'swap' or 'future', the default is 'option'
         * @returns {object[]} a list of [underlying assets]{@link https://docs.ccxt.com/#/?id=underlying-assets-structure}
         */
        await this.loadMarkets();
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchUnderlyingAssets', undefined, params);
        if ((marketType === undefined) || (marketType === 'spot')) {
            marketType = 'option';
        }
        if ((marketType !== 'option') && (marketType !== 'swap') && (marketType !== 'future')) {
            throw new errors.NotSupported(this.id + ' fetchUnderlyingAssets() supports contract markets only');
        }
        const request = {
            'instType': this.convertToInstrumentType(marketType),
        };
        const response = await this.publicGetPublicUnderlying(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             [
        //                 "BTC-USD",
        //                 "ETH-USD"
        //             ]
        //         ],
        //         "msg": ""
        //     }
        //
        const underlyings = this.safeList(response, 'data', []);
        return underlyings[0];
    }
    async fetchGreeks(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchGreeks
         * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
         * @see https://www.okx.com/docs-v5/en/#public-data-rest-api-get-option-market-data
         * @param {string} symbol unified symbol of the market to fetch greeks for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const optionParts = marketId.split('-');
        const request = {
            'uly': market['info']['uly'],
            'instFamily': market['info']['instFamily'],
            'expTime': this.safeString(optionParts, 2),
        };
        const response = await this.publicGetPublicOptSummary(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "askVol": "0",
        //                 "bidVol": "0",
        //                 "delta": "0.5105464486882039",
        //                 "deltaBS": "0.7325502184143025",
        //                 "fwdPx": "37675.80158694987186",
        //                 "gamma": "-0.13183515090501083",
        //                 "gammaBS": "0.000024139685826358558",
        //                 "instId": "BTC-USD-240329-32000-C",
        //                 "instType": "OPTION",
        //                 "lever": "4.504428015946619",
        //                 "markVol": "0.5916253554539876",
        //                 "realVol": "0",
        //                 "theta": "-0.0004202992014012855",
        //                 "thetaBS": "-18.52354631567909",
        //                 "ts": "1699586421976",
        //                 "uly": "BTC-USD",
        //                 "vega": "0.0020207455080045846",
        //                 "vegaBS": "74.44022302387287",
        //                 "volLv": "0.5948549730405797"
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const entryMarketId = this.safeString(entry, 'instId');
            if (entryMarketId === marketId) {
                return this.parseGreeks(entry, market);
            }
        }
        return undefined;
    }
    parseGreeks(greeks, market = undefined) {
        //
        //     {
        //         "askVol": "0",
        //         "bidVol": "0",
        //         "delta": "0.5105464486882039",
        //         "deltaBS": "0.7325502184143025",
        //         "fwdPx": "37675.80158694987186",
        //         "gamma": "-0.13183515090501083",
        //         "gammaBS": "0.000024139685826358558",
        //         "instId": "BTC-USD-240329-32000-C",
        //         "instType": "OPTION",
        //         "lever": "4.504428015946619",
        //         "markVol": "0.5916253554539876",
        //         "realVol": "0",
        //         "theta": "-0.0004202992014012855",
        //         "thetaBS": "-18.52354631567909",
        //         "ts": "1699586421976",
        //         "uly": "BTC-USD",
        //         "vega": "0.0020207455080045846",
        //         "vegaBS": "74.44022302387287",
        //         "volLv": "0.5948549730405797"
        //     }
        //
        const timestamp = this.safeInteger(greeks, 'ts');
        const marketId = this.safeString(greeks, 'instId');
        const symbol = this.safeSymbol(marketId, market);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'delta': this.safeNumber(greeks, 'delta'),
            'gamma': this.safeNumber(greeks, 'gamma'),
            'theta': this.safeNumber(greeks, 'theta'),
            'vega': this.safeNumber(greeks, 'vega'),
            'rho': undefined,
            'bidSize': undefined,
            'askSize': undefined,
            'bidImpliedVolatility': this.safeNumber(greeks, 'bidVol'),
            'askImpliedVolatility': this.safeNumber(greeks, 'askVol'),
            'markImpliedVolatility': this.safeNumber(greeks, 'markVol'),
            'bidPrice': undefined,
            'askPrice': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'underlyingPrice': undefined,
            'info': greeks,
        };
    }
    async closePosition(symbol, side = undefined, params = {}) {
        /**
         * @method
         * @name okx#closePosition
         * @description closes open positions for a market
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-trade-post-close-positions
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} [side] 'buy' or 'sell', leave as undefined in net mode
         * @param {object} [params] extra parameters specific to the okx api endpoint
         * @param {string} [params.clientOrderId] a unique identifier for the order
         * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross;
         * @param {string} [params.code] *required in the case of closing cross MARGIN position for Single-currency margin* margin currency
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {boolean} [params.autoCxl] whether any pending orders for closing out needs to be automatically canceled when close position via a market order. false or true, the default is false
         * @param {string} [params.tag] order tag a combination of case-sensitive alphanumerics, all numbers, or all letters of up to 16 characters
         * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const clientOrderId = this.safeString(params, 'clientOrderId');
        const code = this.safeString(params, 'code');
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('closePosition', params, 'cross');
        const request = {
            'instId': market['id'],
            'mgnMode': marginMode,
        };
        if (side !== undefined) {
            if ((side === 'buy')) {
                request['posSide'] = 'long';
            }
            else if (side === 'sell') {
                request['posSide'] = 'short';
            }
            else {
                request['posSide'] = side;
            }
        }
        if (clientOrderId !== undefined) {
            request['clOrdId'] = clientOrderId;
        }
        if (code !== undefined) {
            const currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        const response = await this.privatePostTradeClosePosition(this.extend(request, params));
        //
        //    {
        //        "code": "1",
        //        "data": [
        //            {
        //                "clOrdId":"e847386590ce4dBCe903bbc394dc88bf",
        //                "ordId":"",
        //                "sCode":"51000",
        //                "sMsg":"Parameter posSide error ",
        //                "tag":"e847386590ce4dBC"
        //            }
        //        ],
        //        "inTime": "1701877077101064",
        //        "msg": "All operations failed",
        //        "outTime": "1701877077102579"
        //    }
        //
        const data = this.safeList(response, 'data', []);
        const order = this.safeDict(data, 0);
        return this.parseOrder(order, market);
    }
    async fetchOption(symbol, params = {}) {
        /**
         * @method
         * @name okx#fetchOption
         * @description fetches option data that is commonly found in an option chain
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-ticker
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'instId': market['id'],
        };
        const response = await this.publicGetMarketTicker(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "OPTION",
        //                 "instId": "BTC-USD-241227-60000-P",
        //                 "last": "",
        //                 "lastSz": "0",
        //                 "askPx": "",
        //                 "askSz": "0",
        //                 "bidPx": "",
        //                 "bidSz": "0",
        //                 "open24h": "",
        //                 "high24h": "",
        //                 "low24h": "",
        //                 "volCcy24h": "0",
        //                 "vol24h": "0",
        //                 "ts": "1711176035035",
        //                 "sodUtc0": "",
        //                 "sodUtc8": ""
        //             }
        //         ]
        //     }
        //
        const result = this.safeList(response, 'data', []);
        const chain = this.safeDict(result, 0, {});
        return this.parseOption(chain, undefined, market);
    }
    async fetchOptionChain(code, params = {}) {
        /**
         * @method
         * @name okx#fetchOptionChain
         * @description fetches data for an underlying asset that is commonly found in an option chain
         * @see https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-tickers
         * @param {string} currency base currency to fetch an option chain for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.uly] the underlying asset, can be obtained from fetchUnderlyingAssets ()
         * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'uly': currency['code'] + '-USD',
            'instType': 'OPTION',
        };
        const response = await this.publicGetMarketTickers(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "msg": "",
        //         "data": [
        //             {
        //                 "instType": "OPTION",
        //                 "instId": "BTC-USD-240323-52000-C",
        //                 "last": "",
        //                 "lastSz": "0",
        //                 "askPx": "",
        //                 "askSz": "0",
        //                 "bidPx": "",
        //                 "bidSz": "0",
        //                 "open24h": "",
        //                 "high24h": "",
        //                 "low24h": "",
        //                 "volCcy24h": "0",
        //                 "vol24h": "0",
        //                 "ts": "1711176207008",
        //                 "sodUtc0": "",
        //                 "sodUtc8": ""
        //             },
        //         ]
        //     }
        //
        const result = this.safeList(response, 'data', []);
        return this.parseOptionChain(result, undefined, 'instId');
    }
    parseOption(chain, currency = undefined, market = undefined) {
        //
        //     {
        //         "instType": "OPTION",
        //         "instId": "BTC-USD-241227-60000-P",
        //         "last": "",
        //         "lastSz": "0",
        //         "askPx": "",
        //         "askSz": "0",
        //         "bidPx": "",
        //         "bidSz": "0",
        //         "open24h": "",
        //         "high24h": "",
        //         "low24h": "",
        //         "volCcy24h": "0",
        //         "vol24h": "0",
        //         "ts": "1711176035035",
        //         "sodUtc0": "",
        //         "sodUtc8": ""
        //     }
        //
        const marketId = this.safeString(chain, 'instId');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(chain, 'ts');
        return {
            'info': chain,
            'currency': undefined,
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'impliedVolatility': undefined,
            'openInterest': undefined,
            'bidPrice': this.safeNumber(chain, 'bidPx'),
            'askPrice': this.safeNumber(chain, 'askPx'),
            'midPrice': undefined,
            'markPrice': undefined,
            'lastPrice': this.safeNumber(chain, 'last'),
            'underlyingPrice': undefined,
            'change': undefined,
            'percentage': undefined,
            'baseVolume': this.safeNumber(chain, 'volCcy24h'),
            'quoteVolume': undefined,
        };
    }
    async fetchConvertQuote(fromCode, toCode, amount = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchConvertQuote
         * @description fetch a quote for converting from one currency to another
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-estimate-quote
         * @param {string} fromCode the currency that you want to sell and convert from
         * @param {string} toCode the currency that you want to buy and convert into
         * @param {float} [amount] how much you want to trade in units of the from currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        const request = {
            'baseCcy': fromCode.toUpperCase(),
            'quoteCcy': toCode.toUpperCase(),
            'rfqSzCcy': fromCode.toUpperCase(),
            'rfqSz': this.numberToString(amount),
            'side': 'sell',
        };
        const response = await this.privatePostAssetConvertEstimateQuote(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "baseCcy": "ETH",
        //                 "baseSz": "0.01023052",
        //                 "clQReqId": "",
        //                 "cnvtPx": "2932.40104429",
        //                 "origRfqSz": "30",
        //                 "quoteCcy": "USDT",
        //                 "quoteId": "quoterETH-USDT16461885104612381",
        //                 "quoteSz": "30",
        //                 "quoteTime": "1646188510461",
        //                 "rfqSz": "30",
        //                 "rfqSzCcy": "USDT",
        //                 "side": "buy",
        //                 "ttlMs": "10000"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        const fromCurrencyId = this.safeString(result, 'baseCcy', fromCode);
        const fromCurrency = this.currency(fromCurrencyId);
        const toCurrencyId = this.safeString(result, 'quoteCcy', toCode);
        const toCurrency = this.currency(toCurrencyId);
        return this.parseConversion(result, fromCurrency, toCurrency);
    }
    async createConvertTrade(id, fromCode, toCode, amount = undefined, params = {}) {
        /**
         * @method
         * @name okx#createConvertTrade
         * @description convert from one currency to another
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-convert-trade
         * @param {string} id the id of the trade that you want to make
         * @param {string} fromCode the currency that you want to sell and convert from
         * @param {string} toCode the currency that you want to buy and convert into
         * @param {float} [amount] how much you want to trade in units of the from currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        const request = {
            'quoteId': id,
            'baseCcy': fromCode,
            'quoteCcy': toCode,
            'szCcy': fromCode,
            'sz': this.numberToString(amount),
            'side': 'sell',
        };
        const response = await this.privatePostAssetConvertTrade(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "baseCcy": "ETH",
        //                 "clTReqId": "",
        //                 "fillBaseSz": "0.01023052",
        //                 "fillPx": "2932.40104429",
        //                 "fillQuoteSz": "30",
        //                 "instId": "ETH-USDT",
        //                 "quoteCcy": "USDT",
        //                 "quoteId": "quoterETH-USDT16461885104612381",
        //                 "side": "buy",
        //                 "state": "fullyFilled",
        //                 "tradeId": "trader16461885203381437",
        //                 "ts": "1646188520338"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        const fromCurrencyId = this.safeString(result, 'baseCcy', fromCode);
        const fromCurrency = this.currency(fromCurrencyId);
        const toCurrencyId = this.safeString(result, 'quoteCcy', toCode);
        const toCurrency = this.currency(toCurrencyId);
        return this.parseConversion(result, fromCurrency, toCurrency);
    }
    async fetchConvertTrade(id, code = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchConvertTrade
         * @description fetch the data for a conversion trade
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-history
         * @param {string} id the id of the trade that you want to fetch
         * @param {string} [code] the unified currency code of the conversion trade
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        const request = {
            'clTReqId': id,
        };
        const response = await this.privateGetAssetConvertHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "clTReqId": "",
        //                 "instId": "ETH-USDT",
        //                 "side": "buy",
        //                 "fillPx": "2932.401044",
        //                 "baseCcy": "ETH",
        //                 "quoteCcy": "USDT",
        //                 "fillBaseSz": "0.01023052",
        //                 "state": "fullyFilled",
        //                 "tradeId": "trader16461885203381437",
        //                 "fillQuoteSz": "30",
        //                 "ts": "1646188520000"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        const fromCurrencyId = this.safeString(result, 'baseCcy');
        const toCurrencyId = this.safeString(result, 'quoteCcy');
        let fromCurrency = undefined;
        let toCurrency = undefined;
        if (fromCurrencyId !== undefined) {
            fromCurrency = this.currency(fromCurrencyId);
        }
        if (toCurrencyId !== undefined) {
            toCurrency = this.currency(toCurrencyId);
        }
        return this.parseConversion(result, fromCurrency, toCurrency);
    }
    async fetchConvertTradeHistory(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchConvertTradeHistory
         * @description fetch the users history of conversion trades
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-history
         * @param {string} [code] the unified currency code
         * @param {int} [since] the earliest time in ms to fetch conversions for
         * @param {int} [limit] the maximum number of conversion structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
         * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
         */
        await this.loadMarkets();
        let request = {};
        [request, params] = this.handleUntilOption('after', request, params);
        if (since !== undefined) {
            request['before'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetAssetConvertHistory(this.extend(request, params));
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "clTReqId": "",
        //                 "instId": "ETH-USDT",
        //                 "side": "buy",
        //                 "fillPx": "2932.401044",
        //                 "baseCcy": "ETH",
        //                 "quoteCcy": "USDT",
        //                 "fillBaseSz": "0.01023052",
        //                 "state": "fullyFilled",
        //                 "tradeId": "trader16461885203381437",
        //                 "fillQuoteSz": "30",
        //                 "ts": "1646188520000"
        //             }
        //         ],
        //         "msg": ""
        //     }
        //
        const rows = this.safeList(response, 'data', []);
        return this.parseConversions(rows, code, 'baseCcy', 'quoteCcy', since, limit);
    }
    parseConversion(conversion, fromCurrency = undefined, toCurrency = undefined) {
        //
        // fetchConvertQuote
        //
        //     {
        //         "baseCcy": "ETH",
        //         "baseSz": "0.01023052",
        //         "clQReqId": "",
        //         "cnvtPx": "2932.40104429",
        //         "origRfqSz": "30",
        //         "quoteCcy": "USDT",
        //         "quoteId": "quoterETH-USDT16461885104612381",
        //         "quoteSz": "30",
        //         "quoteTime": "1646188510461",
        //         "rfqSz": "30",
        //         "rfqSzCcy": "USDT",
        //         "side": "buy",
        //         "ttlMs": "10000"
        //     }
        //
        // createConvertTrade
        //
        //     {
        //         "baseCcy": "ETH",
        //         "clTReqId": "",
        //         "fillBaseSz": "0.01023052",
        //         "fillPx": "2932.40104429",
        //         "fillQuoteSz": "30",
        //         "instId": "ETH-USDT",
        //         "quoteCcy": "USDT",
        //         "quoteId": "quoterETH-USDT16461885104612381",
        //         "side": "buy",
        //         "state": "fullyFilled",
        //         "tradeId": "trader16461885203381437",
        //         "ts": "1646188520338"
        //     }
        //
        // fetchConvertTrade, fetchConvertTradeHistory
        //
        //     {
        //         "clTReqId": "",
        //         "instId": "ETH-USDT",
        //         "side": "buy",
        //         "fillPx": "2932.401044",
        //         "baseCcy": "ETH",
        //         "quoteCcy": "USDT",
        //         "fillBaseSz": "0.01023052",
        //         "state": "fullyFilled",
        //         "tradeId": "trader16461885203381437",
        //         "fillQuoteSz": "30",
        //         "ts": "1646188520000"
        //     }
        //
        const timestamp = this.safeInteger2(conversion, 'quoteTime', 'ts');
        const fromCoin = this.safeString(conversion, 'baseCcy');
        const fromCode = this.safeCurrencyCode(fromCoin, fromCurrency);
        const to = this.safeString(conversion, 'quoteCcy');
        const toCode = this.safeCurrencyCode(to, toCurrency);
        return {
            'info': conversion,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeStringN(conversion, ['clQReqId', 'tradeId', 'quoteId']),
            'fromCurrency': fromCode,
            'fromAmount': this.safeNumber2(conversion, 'baseSz', 'fillBaseSz'),
            'toCurrency': toCode,
            'toAmount': this.safeNumber2(conversion, 'quoteSz', 'fillQuoteSz'),
            'price': this.safeNumber2(conversion, 'cnvtPx', 'fillPx'),
            'fee': undefined,
        };
    }
    async fetchConvertCurrencies(params = {}) {
        /**
         * @method
         * @name okx#fetchConvertCurrencies
         * @description fetches all available currencies that can be converted
         * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-convert-currencies
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        await this.loadMarkets();
        const response = await this.privateGetAssetConvertCurrencies(params);
        //
        //     {
        //         "code": "0",
        //         "data": [
        //             {
        //                 "ccy": "BTC",
        //                 "max": "",
        //                 "min": ""
        //             },
        //         ],
        //         "msg": ""
        //     }
        //
        const result = {};
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString(entry, 'ccy');
            const code = this.safeCurrencyCode(id);
            result[code] = {
                'info': entry,
                'id': id,
                'code': code,
                'networks': undefined,
                'type': undefined,
                'name': undefined,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber(entry, 'min'),
                        'max': this.safeNumber(entry, 'max'),
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
            };
        }
        return result;
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //    {
        //        "code": "1",
        //        "data": [
        //            {
        //                "clOrdId": "",
        //                "ordId": "",
        //                "sCode": "51119",
        //                "sMsg": "Order placement failed due to insufficient balance. ",
        //                "tag": ""
        //            }
        //        ],
        //        "msg": ""
        //    },
        //    {
        //        "code": "58001",
        //        "data": [],
        //        "msg": "Incorrect trade password"
        //    }
        //
        const code = this.safeString(response, 'code');
        if ((code !== '0') && (code !== '2')) { // 2 means that bulk operation partially succeeded
            const feedback = this.id + ' ' + body;
            const data = this.safeList(response, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const error = data[i];
                const errorCode = this.safeString(error, 'sCode');
                const message = this.safeString(error, 'sMsg');
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            }
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
    async fetchMarginAdjustmentHistory(symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchMarginAdjustmentHistory
         * @description fetches the history of margin added or reduced from contract isolated positions
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-7-days
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-bills-details-last-3-months
         * @param {string} [symbol] not used by okx fetchMarginAdjustmentHistory
         * @param {string} [type] "add" or "reduce"
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {boolean} [params.auto] true if fetching auto margin increases
         * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        await this.loadMarkets();
        const auto = this.safeBool(params, 'auto');
        if (type === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMarginAdjustmentHistory () requires a type argument');
        }
        const isAdd = type === 'add';
        let subType = isAdd ? '160' : '161';
        if (auto) {
            if (isAdd) {
                subType = '162';
            }
            else {
                throw new errors.BadRequest(this.id + ' cannot fetch margin adjustments for type ' + type);
            }
        }
        const request = {
            'subType': subType,
            'mgnMode': 'isolated',
        };
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let response = undefined;
        const now = this.milliseconds();
        const oneWeekAgo = now - 604800000;
        const threeMonthsAgo = now - 7776000000;
        if ((since === undefined) || (since > oneWeekAgo)) {
            response = await this.privateGetAccountBills(this.extend(request, params));
        }
        else if (since > threeMonthsAgo) {
            response = await this.privateGetAccountBillsArchive(this.extend(request, params));
        }
        else {
            throw new errors.BadRequest(this.id + ' fetchMarginAdjustmentHistory () cannot fetch margin adjustments older than 3 months');
        }
        //
        //    {
        //        code: '0',
        //        data: [
        //            {
        //                bal: '67621.4325135010619812',
        //                balChg: '-10.0000000000000000',
        //                billId: '691293628710342659',
        //                ccy: 'USDT',
        //                clOrdId: '',
        //                execType: '',
        //                fee: '0',
        //                fillFwdPx: '',
        //                fillIdxPx: '',
        //                fillMarkPx: '',
        //                fillMarkVol: '',
        //                fillPxUsd: '',
        //                fillPxVol: '',
        //                fillTime: '1711089244850',
        //                from: '',
        //                instId: 'XRP-USDT-SWAP',
        //                instType: 'SWAP',
        //                interest: '0',
        //                mgnMode: 'isolated',
        //                notes: '',
        //                ordId: '',
        //                pnl: '0',
        //                posBal: '73.12',
        //                posBalChg: '10.00',
        //                px: '',
        //                subType: '160',
        //                sz: '10',
        //                tag: '',
        //                to: '',
        //                tradeId: '0',
        //                ts: '1711089244699',
        //                type: '6'
        //            }
        //        ],
        //        msg: ''
        //    }
        //
        const data = this.safeList(response, 'data');
        const modifications = this.parseMarginModifications(data);
        return this.filterBySymbolSinceLimit(modifications, symbol, since, limit);
    }
    async fetchPositionsHistory(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name okx#fetchPositionsHistory
         * @description fetches historical positions
         * @see https://www.okx.com/docs-v5/en/#trading-account-rest-api-get-positions-history
         * @param {string} [symbols] unified market symbols
         * @param {int} [since] timestamp in ms of the earliest position to fetch
         * @param {int} [limit] the maximum amount of records to fetch, default=100, max=100
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @param {string} [params.marginMode] "cross" or "isolated"
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.instType] margin, swap, futures or option
         * @param {string} [params.type] the type of latest close position 1: close position partially, 2：close all, 3：liquidation, 4：partial liquidation; 5：adl, is it is the latest type if there are several types for the same position
         * @param {string} [params.posId] position id, there is attribute expiration, the posid will be expired if it is more than 30 days after the last full close position, then position will use new posid
         * @param {string} [params.before] timestamp in ms of the earliest position to fetch based on the last update time of the position
         * @param {string} [params.after] timestamp in ms of the latest position to fetch based on the last update time of the position
         * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const marginMode = this.safeString(params, 'marginMode');
        const instType = this.safeStringUpper(params, 'instType');
        params = this.omit(params, ['until', 'marginMode', 'instType']);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'limit': limit,
        };
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.market(symbols[0]);
                request['instId'] = market['id'];
            }
        }
        if (marginMode !== undefined) {
            request['mgnMode'] = marginMode;
        }
        if (instType !== undefined) {
            request['instType'] = instType;
        }
        const response = await this.privateGetAccountPositionsHistory(this.extend(request, params));
        //
        //    {
        //        code: '0',
        //        data: [
        //            {
        //                cTime: '1708735940395',
        //                ccy: 'USDT',
        //                closeAvgPx: '0.6330444444444444',
        //                closeTotalPos: '27',
        //                direction: 'long',
        //                fee: '-1.69566',
        //                fundingFee: '-11.870404179341788',
        //                instId: 'XRP-USDT-SWAP',
        //                instType: 'SWAP',
        //                lever: '3.0',
        //                liqPenalty: '0',
        //                mgnMode: 'cross',
        //                openAvgPx: '0.623',
        //                openMaxPos: '15',
        //                pnl: '27.11999999999988',
        //                pnlRatio: '0.0241732402722634',
        //                posId: '681423155054862336',
        //                realizedPnl: '13.553935820658092',
        //                triggerPx: '',
        //                type: '2',
        //                uTime: '1711088748170',
        //                uly: 'XRP-USDT'
        //            },
        //            ...
        //        ],
        //        msg: ''
        //    }
        //
        const data = this.safeList(response, 'data');
        const positions = this.parsePositions(data, symbols, params);
        return this.filterBySinceLimit(positions, since, limit);
    }
}

module.exports = okx;
