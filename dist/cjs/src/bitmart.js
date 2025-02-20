'use strict';

var bitmart$1 = require('./abstract/bitmart.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class bitmart
 * @augments Exchange
 */
class bitmart extends bitmart$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitmart',
            'name': 'BitMart',
            'countries': ['US', 'CN', 'HK', 'KR'],
            // 150 per 5 seconds = 30 per second
            // rateLimit = 1000ms / 30 ~= 33.334
            'rateLimit': 33.34,
            'version': 'v2',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTrailingPercentOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': true,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIsolatedBorrowRate': true,
                'fetchIsolatedBorrowRates': true,
                'fetchLedger': true,
                'fetchLiquidations': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyLiquidations': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactionFee': true,
                'fetchTransactionFees': false,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawAddressesByNetwork': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'hostname': 'bitmart.com',
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/0623e9c4-f50e-48c9-82bd-65c3908c3a14',
                'api': {
                    'spot': 'https://api-cloud.{hostname}',
                    'swap': 'https://api-cloud-v2.{hostname}', // bitmart.info for Hong Kong users
                },
                'www': 'https://www.bitmart.com/',
                'doc': 'https://developer-pro.bitmart.com/',
                'referral': {
                    'url': 'http://www.bitmart.com/?r=rQCFLh',
                    'discount': 0.3,
                },
                'fees': 'https://www.bitmart.com/fee/en',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': {
                        'system/time': 3,
                        'system/service': 3,
                        // spot markets
                        'spot/v1/currencies': 7.5,
                        'spot/v1/symbols': 7.5,
                        'spot/v1/symbols/details': 5,
                        'spot/quotation/v3/tickers': 6,
                        'spot/quotation/v3/ticker': 4,
                        'spot/quotation/v3/lite-klines': 5,
                        'spot/quotation/v3/klines': 7,
                        'spot/quotation/v3/books': 4,
                        'spot/quotation/v3/trades': 4,
                        'spot/v1/ticker': 5,
                        'spot/v2/ticker': 30,
                        'spot/v1/ticker_detail': 5,
                        'spot/v1/steps': 30,
                        'spot/v1/symbols/kline': 6,
                        'spot/v1/symbols/book': 5,
                        'spot/v1/symbols/trades': 5,
                        // contract markets
                        'contract/v1/tickers': 15,
                        'contract/public/details': 5,
                        'contract/public/depth': 5,
                        'contract/public/open-interest': 30,
                        'contract/public/funding-rate': 30,
                        'contract/public/funding-rate-history': 30,
                        'contract/public/kline': 6,
                        'account/v1/currencies': 30,
                    },
                },
                'private': {
                    'get': {
                        // sub-account
                        'account/sub-account/v1/transfer-list': 7.5,
                        'account/sub-account/v1/transfer-history': 7.5,
                        'account/sub-account/main/v1/wallet': 5,
                        'account/sub-account/main/v1/subaccount-list': 7.5,
                        'account/contract/sub-account/main/v1/wallet': 5,
                        'account/contract/sub-account/main/v1/transfer-list': 7.5,
                        'account/contract/sub-account/v1/transfer-history': 7.5,
                        // account
                        'account/v1/wallet': 5,
                        'account/v1/currencies': 30,
                        'spot/v1/wallet': 5,
                        'account/v1/deposit/address': 30,
                        'account/v1/withdraw/charge': 32,
                        'account/v2/deposit-withdraw/history': 7.5,
                        'account/v1/deposit-withdraw/detail': 7.5,
                        // order
                        'spot/v1/order_detail': 1,
                        'spot/v2/orders': 5,
                        'spot/v1/trades': 5,
                        // newer order endpoint
                        'spot/v2/trades': 4,
                        'spot/v3/orders': 5,
                        'spot/v2/order_detail': 1,
                        // margin
                        'spot/v1/margin/isolated/borrow_record': 1,
                        'spot/v1/margin/isolated/repay_record': 1,
                        'spot/v1/margin/isolated/pairs': 30,
                        'spot/v1/margin/isolated/account': 5,
                        'spot/v1/trade_fee': 30,
                        'spot/v1/user_fee': 30,
                        // broker
                        'spot/v1/broker/rebate': 1,
                        // contract
                        'contract/private/assets-detail': 5,
                        'contract/private/order': 1.2,
                        'contract/private/order-history': 10,
                        'contract/private/position': 10,
                        'contract/private/get-open-orders': 1.2,
                        'contract/private/current-plan-order': 1.2,
                        'contract/private/trades': 10,
                        'contract/private/position-risk': 10,
                        'contract/private/affilate/rebate-list': 10,
                        'contract/private/affilate/trade-list': 10,
                        'contract/private/transaction-history': 10,
                    },
                    'post': {
                        // sub-account endpoints
                        'account/sub-account/main/v1/sub-to-main': 30,
                        'account/sub-account/sub/v1/sub-to-main': 30,
                        'account/sub-account/main/v1/main-to-sub': 30,
                        'account/sub-account/sub/v1/sub-to-sub': 30,
                        'account/sub-account/main/v1/sub-to-sub': 30,
                        'account/contract/sub-account/main/v1/sub-to-main': 7.5,
                        'account/contract/sub-account/main/v1/main-to-sub': 7.5,
                        'account/contract/sub-account/sub/v1/sub-to-main': 7.5,
                        // account
                        'account/v1/withdraw/apply': 7.5,
                        // transaction and trading
                        'spot/v1/submit_order': 1,
                        'spot/v1/batch_orders': 1,
                        'spot/v2/cancel_order': 1,
                        'spot/v1/cancel_orders': 15,
                        'spot/v4/query/order': 1,
                        'spot/v4/query/client-order': 1,
                        'spot/v4/query/open-orders': 5,
                        'spot/v4/query/history-orders': 5,
                        'spot/v4/query/trades': 5,
                        'spot/v4/query/order-trades': 5,
                        'spot/v4/cancel_orders': 3,
                        'spot/v4/cancel_all': 90,
                        'spot/v4/batch_orders': 3,
                        // newer endpoint
                        'spot/v3/cancel_order': 1,
                        'spot/v2/batch_orders': 1,
                        'spot/v2/submit_order': 1,
                        // margin
                        'spot/v1/margin/submit_order': 1,
                        'spot/v1/margin/isolated/borrow': 30,
                        'spot/v1/margin/isolated/repay': 30,
                        'spot/v1/margin/isolated/transfer': 30,
                        // contract
                        'account/v1/transfer-contract-list': 60,
                        'account/v1/transfer-contract': 60,
                        'contract/private/submit-order': 2.5,
                        'contract/private/cancel-order': 1.5,
                        'contract/private/cancel-orders': 30,
                        'contract/private/submit-plan-order': 2.5,
                        'contract/private/cancel-plan-order': 1.5,
                        'contract/private/submit-leverage': 2.5,
                        'contract/private/submit-tp-sl-order': 2.5,
                        'contract/private/modify-plan-order': 2.5,
                        'contract/private/modify-preset-plan-order': 2.5,
                        'contract/private/modify-tp-sl-order': 2.5,
                    },
                },
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '45m': 45,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
                '1M': 43200,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0040'),
                    'maker': this.parseNumber('0.0035'),
                    'tiers': {
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0020')],
                            [this.parseNumber('10'), this.parseNumber('0.18')],
                            [this.parseNumber('50'), this.parseNumber('0.0016')],
                            [this.parseNumber('250'), this.parseNumber('0.0014')],
                            [this.parseNumber('1000'), this.parseNumber('0.0012')],
                            [this.parseNumber('5000'), this.parseNumber('0.0010')],
                            [this.parseNumber('25000'), this.parseNumber('0.0008')],
                            [this.parseNumber('50000'), this.parseNumber('0.0006')],
                        ],
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.001')],
                            [this.parseNumber('10'), this.parseNumber('0.0009')],
                            [this.parseNumber('50'), this.parseNumber('0.0008')],
                            [this.parseNumber('250'), this.parseNumber('0.0007')],
                            [this.parseNumber('1000'), this.parseNumber('0.0006')],
                            [this.parseNumber('5000'), this.parseNumber('0.0005')],
                            [this.parseNumber('25000'), this.parseNumber('0.0004')],
                            [this.parseNumber('50000'), this.parseNumber('0.0003')],
                        ],
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    // general errors
                    '30000': errors.ExchangeError,
                    '30001': errors.AuthenticationError,
                    '30002': errors.AuthenticationError,
                    '30003': errors.AccountSuspended,
                    '30004': errors.AuthenticationError,
                    '30005': errors.AuthenticationError,
                    '30006': errors.AuthenticationError,
                    '30007': errors.AuthenticationError,
                    '30008': errors.AuthenticationError,
                    '30010': errors.PermissionDenied,
                    '30011': errors.AuthenticationError,
                    '30012': errors.AuthenticationError,
                    '30013': errors.RateLimitExceeded,
                    '30014': errors.ExchangeNotAvailable,
                    '30016': errors.OnMaintenance,
                    '30017': errors.RateLimitExceeded,
                    '30018': errors.BadRequest,
                    '30019': errors.PermissionDenied,
                    // funding account & sub account errors
                    '60000': errors.BadRequest,
                    '60001': errors.BadRequest,
                    '60002': errors.BadRequest,
                    '60003': errors.ExchangeError,
                    '60004': errors.ExchangeError,
                    '60005': errors.ExchangeError,
                    '60006': errors.ExchangeError,
                    '60007': errors.InvalidAddress,
                    '60008': errors.InsufficientFunds,
                    '60009': errors.ExchangeError,
                    '60010': errors.ExchangeError,
                    '60011': errors.InvalidAddress,
                    '60012': errors.ExchangeError,
                    '60020': errors.PermissionDenied,
                    '60021': errors.PermissionDenied,
                    '60022': errors.PermissionDenied,
                    '60026': errors.PermissionDenied,
                    '60027': errors.PermissionDenied,
                    '60028': errors.AccountSuspended,
                    '60029': errors.AccountSuspended,
                    '60030': errors.BadRequest,
                    '60031': errors.BadRequest,
                    '60050': errors.ExchangeError,
                    '60051': errors.ExchangeError,
                    '61001': errors.InsufficientFunds,
                    '61003': errors.BadRequest,
                    '61004': errors.BadRequest,
                    '61005': errors.BadRequest,
                    '61006': errors.NotSupported,
                    '61007': errors.ExchangeError,
                    '61008': errors.ExchangeError,
                    // spot public errors
                    '70000': errors.ExchangeError,
                    '70001': errors.BadRequest,
                    '70002': errors.BadSymbol,
                    '70003': errors.NetworkError,
                    '71001': errors.BadRequest,
                    '71002': errors.BadRequest,
                    '71003': errors.BadRequest,
                    '71004': errors.BadRequest,
                    '71005': errors.BadRequest,
                    // spot & margin errors
                    '50000': errors.BadRequest,
                    '50001': errors.BadSymbol,
                    '50002': errors.BadRequest,
                    '50003': errors.BadRequest,
                    '50004': errors.BadRequest,
                    '50005': errors.OrderNotFound,
                    '50006': errors.InvalidOrder,
                    '50007': errors.InvalidOrder,
                    '50008': errors.InvalidOrder,
                    '50009': errors.InvalidOrder,
                    '50010': errors.InvalidOrder,
                    '50011': errors.InvalidOrder,
                    '50012': errors.InvalidOrder,
                    '50013': errors.InvalidOrder,
                    '50014': errors.BadRequest,
                    '50015': errors.BadRequest,
                    '50016': errors.BadRequest,
                    '50017': errors.BadRequest,
                    '50018': errors.BadRequest,
                    '50019': errors.ExchangeError,
                    '50020': errors.InsufficientFunds,
                    '50021': errors.BadRequest,
                    '50022': errors.ExchangeNotAvailable,
                    '50023': errors.BadSymbol,
                    '50024': errors.BadRequest,
                    '50025': errors.BadRequest,
                    '50026': errors.BadRequest,
                    '50027': errors.BadRequest,
                    '50028': errors.BadRequest,
                    '50029': errors.InvalidOrder,
                    '50030': errors.OrderNotFound,
                    '50031': errors.OrderNotFound,
                    '50032': errors.OrderNotFound,
                    '50033': errors.InvalidOrder,
                    // below Error codes used interchangeably for both failed postOnly and IOC orders depending on market price and order side
                    '50034': errors.InvalidOrder,
                    '50035': errors.InvalidOrder,
                    '50036': errors.ExchangeError,
                    '50037': errors.BadRequest,
                    '50038': errors.BadRequest,
                    '50039': errors.BadRequest,
                    '50040': errors.BadSymbol,
                    '50041': errors.ExchangeError,
                    '50042': errors.BadRequest,
                    '51000': errors.BadSymbol,
                    '51001': errors.ExchangeError,
                    '51002': errors.ExchangeError,
                    '51003': errors.ExchangeError,
                    '51004': errors.InsufficientFunds,
                    '51005': errors.InvalidOrder,
                    '51006': errors.InvalidOrder,
                    '51007': errors.BadRequest,
                    '51008': errors.ExchangeError,
                    '51009': errors.InvalidOrder,
                    '51010': errors.InvalidOrder,
                    '51011': errors.InvalidOrder,
                    '51012': errors.InvalidOrder,
                    '51013': errors.InvalidOrder,
                    '51014': errors.InvalidOrder,
                    '51015': errors.InvalidOrder,
                    '52000': errors.BadRequest,
                    '52001': errors.BadRequest,
                    '52002': errors.BadRequest,
                    '52003': errors.BadRequest,
                    '52004': errors.BadRequest,
                    '53000': errors.AccountSuspended,
                    '53001': errors.AccountSuspended,
                    '53002': errors.PermissionDenied,
                    '53003': errors.PermissionDenied,
                    '53005': errors.PermissionDenied,
                    '53006': errors.PermissionDenied,
                    '53007': errors.PermissionDenied,
                    '53008': errors.PermissionDenied,
                    '53009': errors.PermissionDenied,
                    '53010': errors.PermissionDenied,
                    '57001': errors.BadRequest,
                    '58001': errors.BadRequest,
                    '59001': errors.ExchangeError,
                    '59002': errors.ExchangeError,
                    '59003': errors.ExchangeError,
                    '59004': errors.ExchangeError,
                    '59005': errors.PermissionDenied,
                    '59006': errors.ExchangeError,
                    '59007': errors.ExchangeError,
                    '59008': errors.ExchangeError,
                    '59009': errors.ExchangeError,
                    '59010': errors.InsufficientFunds,
                    '59011': errors.ExchangeError,
                    // contract errors
                    '40001': errors.ExchangeError,
                    '40002': errors.ExchangeError,
                    '40003': errors.ExchangeError,
                    '40004': errors.ExchangeError,
                    '40005': errors.ExchangeError,
                    '40006': errors.PermissionDenied,
                    '40007': errors.BadRequest,
                    '40008': errors.InvalidNonce,
                    '40009': errors.BadRequest,
                    '40010': errors.BadRequest,
                    '40011': errors.BadRequest,
                    '40012': errors.ExchangeError,
                    '40013': errors.ExchangeError,
                    '40014': errors.BadSymbol,
                    '40015': errors.BadSymbol,
                    '40016': errors.InvalidOrder,
                    '40017': errors.InvalidOrder,
                    '40018': errors.InvalidOrder,
                    '40019': errors.ExchangeError,
                    '40020': errors.InvalidOrder,
                    '40021': errors.ExchangeError,
                    '40022': errors.ExchangeError,
                    '40023': errors.ExchangeError,
                    '40024': errors.ExchangeError,
                    '40025': errors.ExchangeError,
                    '40026': errors.ExchangeError,
                    '40027': errors.InsufficientFunds,
                    '40028': errors.PermissionDenied,
                    '40029': errors.InvalidOrder,
                    '40030': errors.InvalidOrder,
                    '40031': errors.InvalidOrder,
                    '40032': errors.InvalidOrder,
                    '40033': errors.InvalidOrder,
                    '40034': errors.BadSymbol,
                    '40035': errors.OrderNotFound,
                    '40036': errors.InvalidOrder,
                    '40037': errors.OrderNotFound,
                    '40038': errors.BadRequest,
                    '40039': errors.BadRequest,
                    '40040': errors.InvalidOrder,
                    '40041': errors.InvalidOrder,
                    '40042': errors.InvalidOrder,
                    '40043': errors.InvalidOrder,
                    '40044': errors.InvalidOrder,
                    '40045': errors.InvalidOrder,
                    '40046': errors.PermissionDenied,
                    '40047': errors.PermissionDenied,
                    '40048': errors.InvalidOrder,
                    '40049': errors.InvalidOrder,
                    '40050': errors.InvalidOrder, // 403, Client OrderId duplicated with existing orders
                },
                'broad': {
                    'You contract account available balance not enough': errors.InsufficientFunds,
                    'you contract account available balance not enough': errors.InsufficientFunds,
                },
            },
            'commonCurrencies': {
                '$GM': 'GOLDMINER',
                '$HERO': 'Step Hero',
                '$PAC': 'PAC',
                'BP': 'BEYOND',
                'GDT': 'Gorilla Diamond',
                'GLD': 'Goldario',
                'MVP': 'MVP Coin',
                'TRU': 'Truebit', // conflict with TrueFi
            },
            'options': {
                'defaultNetworks': {
                    'USDT': 'TRC20',
                    'BTC': 'BTC',
                    'ETH': 'ERC20',
                },
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'networks': {
                    'ERC20': 'ERC20',
                    'SOL': 'SOL',
                    'BTC': 'BTC',
                    'TRC20': 'TRC20',
                    // todo: should be TRX after unification
                    // 'TRC20': [ 'TRC20', 'trc20', 'TRON' ], // todo: after unification i.e. TRON is returned from fetchDepositAddress
                    // 'ERC20': [ 'ERC20', 'ERC-20', 'ERC20 ' ], // todo: after unification
                    'OMNI': 'OMNI',
                    'XLM': 'XLM',
                    'EOS': 'EOS',
                    'NEO': 'NEO',
                    'BTM': 'BTM',
                    'BCH': 'BCH',
                    'LTC': 'LTC',
                    'BSV': 'BSV',
                    'XRP': 'XRP',
                    // 'VECHAIN': [ 'VET', 'Vechain' ], // todo: after unification
                    'PLEX': 'PLEX',
                    'XCH': 'XCH',
                    // 'AVALANCHE_C': [ 'AVAX', 'AVAX-C' ], // todo: after unification
                    'NEAR': 'NEAR',
                    'FIO': 'FIO',
                    'SCRT': 'SCRT',
                    'IOTX': 'IOTX',
                    'ALGO': 'ALGO',
                    'ATOM': 'ATOM',
                    'DOT': 'DOT',
                    'ADA': 'ADA',
                    'DOGE': 'DOGE',
                    'XYM': 'XYM',
                    'GLMR': 'GLMR',
                    'MOVR': 'MOVR',
                    'ZIL': 'ZIL',
                    'INJ': 'INJ',
                    'KSM': 'KSM',
                    'ZEC': 'ZEC',
                    'NAS': 'NAS',
                    'POLYGON': 'MATIC',
                    'HRC20': 'HECO',
                    'XDC': 'XDC',
                    'ONE': 'ONE',
                    'LAT': 'LAT',
                    'CSPR': 'Casper',
                    'ICP': 'Computer',
                    'XTZ': 'XTZ',
                    'MINA': 'MINA',
                    'BEP20': 'BSC_BNB',
                    'THETA': 'THETA',
                    'AKT': 'AKT',
                    'AR': 'AR',
                    'CELO': 'CELO',
                    'FIL': 'FIL',
                    'NULS': 'NULS',
                    'ETC': 'ETC',
                    'DASH': 'DASH',
                    'DGB': 'DGB',
                    'BEP2': 'BEP2',
                    'GRIN': 'GRIN',
                    'WAVES': 'WAVES',
                    'ABBC': 'ABBC',
                    'ACA': 'ACA',
                    'QTUM': 'QTUM',
                    'PAC': 'PAC',
                    // 'TERRACLASSIC': 'LUNC', // TBD
                    // 'TERRA': 'Terra', // TBD
                    // 'HEDERA': [ 'HBAR', 'Hedera', 'Hedera Mainnet' ], // todo: after unification
                    'TLOS': 'TLOS',
                    'KARDIA': 'KardiaChain',
                    'FUSE': 'FUSE',
                    'TRC10': 'TRC10',
                    'FIRO': 'FIRO',
                    'FTM': 'Fantom',
                    // 'KLAYTN': [ 'klaytn', 'KLAY', 'Klaytn' ], // todo: after unification
                    // 'ELROND': [ 'EGLD', 'Elrond eGold', 'MultiversX' ], // todo: after unification
                    'EVER': 'EVER',
                    'KAVA': 'KAVA',
                    'HYDRA': 'HYDRA',
                    'PLCU': 'PLCU',
                    'BRISE': 'BRISE',
                    // 'CRC20': [ 'CRO', 'CRO_Chain' ], // todo: after unification
                    // 'CONFLUX': [ 'CFX eSpace', 'CFX' ], // todo: after unification
                    'OPTIMISM': 'OPTIMISM',
                    'REEF': 'REEF',
                    'SYS': 'SYS',
                    'VITE': 'VITE',
                    'STX': 'STX',
                    'SXP': 'SXP',
                    'BITCI': 'BITCI',
                    // 'ARBITRUM': [ 'ARBI', 'Arbitrum' ], // todo: after unification
                    'XRD': 'XRD',
                    'ASTR': 'ASTAR',
                    'ZEN': 'HORIZEN',
                    'LTO': 'LTO',
                    'ETHW': 'ETHW',
                    'ETHF': 'ETHF',
                    'IOST': 'IOST',
                    // 'CHILIZ': [ 'CHZ', 'CHILIZ' ], // todo: after unification
                    'APT': 'APT',
                    // 'FLOW': [ 'FLOW', 'Flow' ], // todo: after unification
                    'ONT': 'ONT',
                    'EVMOS': 'EVMOS',
                    'XMR': 'XMR',
                    'OASYS': 'OAS',
                    'OSMO': 'OSMO',
                    'OMAX': 'OMAX Chain',
                    'DESO': 'DESO',
                    'BFIC': 'BFIC',
                    'OHO': 'OHO',
                    'CS': 'CS',
                    'CHEQ': 'CHEQ',
                    'NODL': 'NODL',
                    'NEM': 'XEM',
                    'FRA': 'FRA',
                    'ERGO': 'ERG',
                    // todo: below will be uncommented after unification
                    // 'BITCOINHD': 'BHD',
                    // 'CRUST': 'CRU',
                    // 'MINTME': 'MINTME',
                    // 'ZENITH': 'ZENITH',
                    // 'ZENIQ': 'ZENIQ', // "ZEN-20" is different
                    // 'BITCOINVAULT': 'BTCV',
                    // 'MOBILECOIN': 'MBX',
                    // 'PINETWORK': 'PI',
                    // 'PI': 'PI',
                    // 'REBUS': 'REBUS',
                    // 'XODEX': 'XODEX',
                    // 'ULTRONGLOW': 'UTG'
                    // 'QIBLOCKCHAIN': 'QIE',
                    // 'XIDEN': 'XDEN',
                    // 'PHAETON': 'PHAE',
                    // 'REDLIGHT': 'REDLC',
                    // 'VERITISE': 'VTS',
                    // 'VERIBLOCK': 'VBK',
                    // 'RAMESTTA': 'RAMA',
                    // 'BITICA': 'BDCC',
                    // 'CROWNSOVEREIGN': 'CSOV',
                    // 'DRAC': 'DRC20',
                    // 'QCHAIN': 'QDT',
                    // 'KINGARU': 'KRU',
                    // 'PROOFOFMEMES': 'POM',
                    // 'CUBE': 'CUBE',
                    // 'CADUCEUS': 'CMP',
                    // 'VEIL': 'VEIL',
                    // 'ENERGYWEB': 'EWT',
                    // 'CYPHERIUM': 'CPH',
                    // 'LBRY': 'LBC',
                    // 'ETHERCOIN': 'ETE',
                    // undetermined chains:
                    // LEX (for LexThum), TAYCAN (for TRICE), SFL (probably TAYCAN), OMNIA (for APEX), NAC (for NAC), KAG (Kinesis), CEM (crypto emergency), XVM (for Venidium), NEVM (for NEVM), IGT20 (for IGNITE), FILM (FILMCredits), CC (CloudCoin), MERGE (MERGE), LTNM (Bitcoin latinum), PLUGCN ( PlugChain), DINGO (dingo), LED (LEDGIS), AVAT (AVAT), VSOL (Vsolidus), EPIC (EPIC cash), NFC (netflowcoin), mrx (Metrix Coin), Idena (idena network), PKT (PKT Cash), BondDex (BondDex), XBN (XBN), KALAM (Kalamint), REV (RChain), KRC20 (MyDeFiPet), ARC20 (Hurricane Token), GMD (Coop network), BERS (Berith), ZEBI (Zebi), BRC (Baer Chain), DAPS (DAPS Coin), APL (Gold Secured Currency), NDAU (NDAU), WICC (WICC), UPG (Unipay God), TSL (TreasureSL), MXW (Maxonrow), CLC (Cifculation), SMH (SMH Coin), XIN (CPCoin), RDD (ReddCoin), OK (Okcash), KAR (KAR), CCX (ConcealNetwork),
                },
                'networksById': {
                    'ETH': 'ERC20',
                    'Ethereum': 'ERC20',
                    'USDT': 'OMNI',
                    'Bitcoin': 'BTC',
                },
                'defaultType': 'spot',
                'fetchBalance': {
                    'type': 'spot', // 'spot', 'swap', 'account'
                },
                'accountsByType': {
                    'spot': 'spot',
                    'swap': 'swap',
                },
                'createMarketBuyOrderRequiresPrice': true,
                'brokerId': 'CCXTxBitmart000',
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': false,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'marketBuyRequiresPrice': false,
                        'marketBuyByCost': true,
                        'leverage': true,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 10,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': 200,
                        'daysBack': undefined,
                        'untilDays': 99999,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 200,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 200,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000, // variable timespans for recent endpoint, 200 for historical
                    },
                },
                'forDerivatives': {
                    'extends': 'default',
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                        'attachedStopLossTakeProfit': {
                            'triggerPriceType': {
                                'last': true,
                                'mark': true,
                                'index': false,
                            },
                            'price': false,
                        },
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': true,
                        'marketBuyRequiresPrice': true,
                        'marketBuyByCost': true,
                        // exchange-supported features
                        // 'selfTradePrevention': true,
                        // 'twap': false,
                        // 'iceberg': false,
                        // 'oco': false,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': 99999,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 200,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                    },
                    'fetchOHLCV': {
                        'limit': 500,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivatives',
                    },
                    'inverse': {
                        'extends': 'forDerivatives',
                    },
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
        });
    }
    /**
     * @method
     * @name bitmart#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetSystemTime(params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"c4e5e5b7-fe9f-4191-89f7-53f6c5bf9030",
        //         "data":{
        //             "server_time":1599843709578
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.safeInteger(data, 'server_time');
    }
    /**
     * @method
     * @name bitmart#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const options = this.safeDict(this.options, 'fetchStatus', {});
        const defaultType = this.safeString(this.options, 'defaultType');
        let type = this.safeString(options, 'type', defaultType);
        type = this.safeString(params, 'type', type);
        params = this.omit(params, 'type');
        const response = await this.publicGetSystemService(params);
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "1d3f28b0-763e-4f78-90c4-5e3ad19dc595",
        //         "data": {
        //           "service": [
        //             {
        //               "title": "Spot API Stop",
        //               "service_type": "spot",
        //               "status": 2,
        //               "start_time": 1648639069125,
        //               "end_time": 1648639069125
        //             },
        //             {
        //               "title": "Contract API Stop",
        //               "service_type": "contract",
        //               "status": 2,
        //               "start_time": 1648639069125,
        //               "end_time": 1648639069125
        //             }
        //           ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const services = this.safeList(data, 'service', []);
        const servicesByType = this.indexBy(services, 'service_type');
        if (type === 'swap') {
            type = 'contract';
        }
        const service = this.safeString(servicesByType, type);
        let status = undefined;
        let eta = undefined;
        if (service !== undefined) {
            const statusCode = this.safeInteger(service, 'status');
            if (statusCode === 2) {
                status = 'ok';
            }
            else {
                status = 'maintenance';
                eta = this.safeInteger(service, 'end_time');
            }
        }
        return {
            'status': status,
            'updated': undefined,
            'eta': eta,
            'url': undefined,
            'info': response,
        };
    }
    async fetchSpotMarkets(params = {}) {
        const response = await this.publicGetSpotV1SymbolsDetails(params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"a67c9146-086d-4d3f-9897-5636a9bb26e1",
        //         "data":{
        //             "symbols":[
        //               {
        //                  "symbol": "BTC_USDT",
        //                  "symbol_id": 53,
        //                  "base_currency": "BTC",
        //                  "quote_currency": "USDT",
        //                  "base_min_size": "0.000010000000000000000000000000",
        //                  "base_max_size": "100000000.000000000000000000000000000000",
        //                  "price_min_precision": -1,
        //                  "price_max_precision": 2,
        //                  "quote_increment": "0.00001", // Api docs says "The minimum order quantity is also the minimum order quantity increment", however I think they mistakenly use the term 'order quantity'
        //                  "expiration": "NA",
        //                  "min_buy_amount": "5.000000000000000000000000000000",
        //                  "min_sell_amount": "5.000000000000000000000000000000",
        //                  "trade_status": "trading"
        //               },
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const symbols = this.safeList(data, 'symbols', []);
        const result = [];
        const fees = this.fees['trading'];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString(market, 'symbol');
            const numericId = this.safeInteger(market, 'symbol_id');
            const baseId = this.safeString(market, 'base_currency');
            const quoteId = this.safeString(market, 'quote_currency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const symbol = base + '/' + quote;
            const minBuyCost = this.safeString(market, 'min_buy_amount');
            const minSellCost = this.safeString(market, 'min_sell_amount');
            const minCost = Precise["default"].stringMax(minBuyCost, minSellCost);
            const baseMinSize = this.safeNumber(market, 'base_min_size');
            result.push(this.safeMarketStructure({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'maker': fees['maker'],
                'taker': fees['taker'],
                'precision': {
                    'amount': baseMinSize,
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'price_max_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': baseMinSize,
                        'max': this.safeNumber(market, 'base_max_size'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber(minCost),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            }));
        }
        return result;
    }
    async fetchContractMarkets(params = {}) {
        const response = await this.publicGetContractPublicDetails(params);
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": {
        //             "symbols": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "product_type": 1,
        //                     "open_timestamp": 1645977600000,
        //                     "expire_timestamp": 0,
        //                     "settle_timestamp": 0,
        //                     "base_currency": "BTC",
        //                     "quote_currency": "USDT",
        //                     "last_price": "63547.4",
        //                     "volume_24h": "110938430",
        //                     "turnover_24h": "7004836342.6944",
        //                     "index_price": "63587.85404255",
        //                     "index_name": "BTCUSDT",
        //                     "contract_size": "0.001",
        //                     "min_leverage": "1",
        //                     "max_leverage": "100",
        //                     "price_precision": "0.1",
        //                     "vol_precision": "1",
        //                     "max_volume": "1000000",
        //                     "min_volume": "1",
        //                     "funding_rate": "0.0000801",
        //                     "expected_funding_rate": "-0.0000035",
        //                     "open_interest": "278214",
        //                     "open_interest_value": "17555316.9355496",
        //                     "high_24h": "64109.4",
        //                     "low_24h": "61857.6",
        //                     "change_24h": "0.0239264900886327",
        //                     "funding_time": 1726819200000
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const symbols = this.safeList(data, 'symbols', []);
        const result = [];
        const fees = this.fees['trading'];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'base_currency');
            const quoteId = this.safeString(market, 'quote_currency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settleId = 'USDT'; // this is bitmart's ID for usdt
            const settle = this.safeCurrencyCode(settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const productType = this.safeInteger(market, 'product_type');
            const isSwap = (productType === 1);
            const isFutures = (productType === 2);
            let expiry = this.safeInteger(market, 'expire_timestamp');
            if (!isFutures && (expiry === 0)) {
                expiry = undefined;
            }
            result.push(this.safeMarketStructure({
                'id': id,
                'numericId': undefined,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': isSwap ? 'swap' : 'future',
                'spot': false,
                'margin': false,
                'swap': isSwap,
                'future': isFutures,
                'option': false,
                'active': true,
                'contract': true,
                'linear': true,
                'inverse': false,
                'contractSize': this.safeNumber(market, 'contract_size'),
                'expiry': expiry,
                'expiryDatetime': this.iso8601(expiry),
                'strike': undefined,
                'optionType': undefined,
                'maker': fees['maker'],
                'taker': fees['taker'],
                'precision': {
                    'amount': this.safeNumber(market, 'vol_precision'),
                    'price': this.safeNumber(market, 'price_precision'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber(market, 'min_leverage'),
                        'max': this.safeNumber(market, 'max_leverage'),
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'min_volume'),
                        'max': this.safeNumber(market, 'max_volume'),
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
                'created': this.safeInteger(market, 'open_timestamp'),
                'info': market,
            }));
        }
        return result;
    }
    /**
     * @method
     * @name bitmart#fetchMarkets
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details
     * @description retrieves data on all markets for bitmart
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const spot = await this.fetchSpotMarkets(params);
        const contract = await this.fetchContractMarkets(params);
        return this.arrayConcat(spot, contract);
    }
    /**
     * @method
     * @name bitmart#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetAccountV1Currencies(params);
        //
        //     {
        //         "message": "OK",
        //         "code":1000,
        //         "trace": "9eaec51cd80d46d48a1c6b447206c4d6.71.17392193317851454",
        //         "data": {
        //             "currencies": [
        //                 {
        //                     "currency": "BTC",
        //                     "name": "Bitcoin",
        //                     "contract_address": null,
        //                     "network": "BTC",
        //                     "withdraw_enabled": true,
        //                     "deposit_enabled": true,
        //                     "withdraw_minsize": "0.0003",
        //                     "withdraw_minfee": "9.74"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const currencies = this.safeList(data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const fullId = this.safeString(currency, 'currency');
            let currencyId = fullId;
            let networkId = this.safeString(currency, 'network');
            if (fullId.indexOf('NFT') < 0) {
                const parts = fullId.split('-');
                currencyId = this.safeString(parts, 0);
                const second = this.safeString(parts, 1);
                if (second !== undefined) {
                    networkId = second.toUpperCase();
                }
            }
            const currencyCode = this.safeCurrencyCode(currencyId);
            let entry = this.safeDict(result, currencyCode);
            if (entry === undefined) {
                entry = {
                    'info': currency,
                    'id': currencyId,
                    'code': currencyCode,
                    'precision': undefined,
                    'name': this.safeString(currency, 'name'),
                    'deposit': undefined,
                    'withdraw': undefined,
                    'active': undefined,
                    'networks': {},
                };
            }
            const networkCode = this.networkIdToCode(networkId);
            const withdraw = this.safeBool(currency, 'withdraw_enabled');
            const deposit = this.safeBool(currency, 'deposit_enabled');
            entry['networks'][networkCode] = {
                'info': currency,
                'id': networkId,
                'code': networkCode,
                'withdraw': withdraw,
                'deposit': deposit,
                'active': withdraw && deposit,
                'fee': this.safeNumber(currency, 'withdraw_minfee'),
                'limits': {
                    'withdraw': {
                        'min': this.safeNumber(currency, 'withdraw_minsize'),
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result[currencyCode] = entry;
        }
        const keys = Object.keys(result);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const currency = result[key];
            result[key] = this.safeCurrencyStructure(currency);
        }
        return result;
    }
    getCurrencyIdFromCodeAndNetwork(currencyCode, networkCode) {
        if (networkCode === undefined) {
            networkCode = this.defaultNetworkCode(currencyCode); // use default network code if not provided
        }
        const currency = this.currency(currencyCode);
        let id = currency['id'];
        let idFromNetwork = undefined;
        const networks = this.safeDict(currency, 'networks', {});
        let networkInfo = {};
        if (networkCode === undefined) {
            // network code is not provided and there is no default network code
            let network = this.safeDict(networks, currencyCode); // trying to find network that has the same code as currency
            if (network === undefined) {
                // use the first network in the networks list if there is no network code with the same code as currency
                const keys = Object.keys(networks);
                const length = keys.length;
                if (length > 0) {
                    network = this.safeValue(networks, keys[0]);
                }
            }
            networkInfo = this.safeDict(network, 'info', {});
            idFromNetwork = this.safeString(networkInfo, 'currency'); // use currency name from network
        }
        else {
            const providedOrDefaultNetwork = this.safeDict(networks, networkCode);
            if (providedOrDefaultNetwork !== undefined) {
                networkInfo = this.safeDict(providedOrDefaultNetwork, 'info', {});
                idFromNetwork = this.safeString(networkInfo, 'currency'); // use currency name from network
            }
            else {
                id += '-' + this.networkCodeToId(networkCode, currencyCode); // use concatenated currency id and network code if network is not found
            }
        }
        return (idFromNetwork !== undefined) ? idFromNetwork : id;
    }
    /**
     * @method
     * @name bitmart#fetchTransactionFee
     * @deprecated
     * @description please use fetchDepositWithdrawFee instead
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network code of the currency
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTransactionFee(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        let network = undefined;
        [network, params] = this.handleNetworkCodeAndParams(params);
        const request = {
            'currency': this.getCurrencyIdFromCodeAndNetwork(currency['code'], network),
        };
        const response = await this.privateGetAccountV1WithdrawCharge(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": "1000",
        //         "trace": "3ecc0adf-91bd-4de7-aca1-886c1122f54f",
        //         "data": {
        //             "today_available_withdraw_BTC": "100.0000",
        //             "min_withdraw": "0.005",
        //             "withdraw_precision": "8",
        //             "withdraw_fee": "0.000500000000000000000000000000"
        //         }
        //     }
        //
        const data = response['data'];
        const withdrawFees = {};
        withdrawFees[code] = this.safeNumber(data, 'withdraw_fee');
        return {
            'info': response,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        "today_available_withdraw_BTC": "100.0000",
        //        "min_withdraw": "0.005",
        //        "withdraw_precision": "8",
        //        "withdraw_fee": "0.000500000000000000000000000000"
        //    }
        //
        return {
            'info': fee,
            'withdraw': {
                'fee': this.safeNumber(fee, 'withdraw_fee'),
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
    }
    /**
     * @method
     * @name bitmart#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network code of the currency
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFee(code, params = {}) {
        await this.loadMarkets();
        let network = undefined;
        [network, params] = this.handleNetworkCodeAndParams(params);
        const request = {
            'currency': this.getCurrencyIdFromCodeAndNetwork(code, network),
        };
        const response = await this.privateGetAccountV1WithdrawCharge(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": "1000",
        //         "trace": "3ecc0adf-91bd-4de7-aca1-886c1122f54f",
        //         "data": {
        //             "today_available_withdraw_BTC": "100.0000",
        //             "min_withdraw": "0.005",
        //             "withdraw_precision": "8",
        //             "withdraw_fee": "0.000500000000000000000000000000"
        //         }
        //     }
        //
        const data = response['data'];
        return this.parseDepositWithdrawFee(data);
    }
    parseTicker(ticker, market = undefined) {
        //
        // spot (REST) fetchTickers
        //
        //     {
        //         'result': [
        //             "AFIN_USDT",     // symbol
        //             "0.001047",      // last
        //             "11110",         // v_24h
        //             "11.632170",     // qv_24h
        //             "0.001048",      // open_24h
        //             "0.001048",      // high_24h
        //             "0.001047",      // low_24h
        //             "-0.00095",      // price_change_24h
        //             "0.001029",      // bid_px
        //             "5555",          // bid_sz
        //             "0.001041",      // ask_px
        //             "5297",          // ask_sz
        //             "1717122550482"  // timestamp
        //         ]
        //     }
        //
        // spot (REST) fetchTicker
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "last": "68500.00",
        //         "v_24h": "10491.65490",
        //         "qv_24h": "717178990.42",
        //         "open_24h": "68149.75",
        //         "high_24h": "69499.99",
        //         "low_24h": "67132.40",
        //         "fluctuation": "0.00514",
        //         "bid_px": "68500",
        //         "bid_sz": "0.00162",
        //         "ask_px": "68500.01",
        //         "ask_sz": "0.01722",
        //         "ts": "1717131391671"
        //     }
        //
        // spot (WS)
        //
        //      {
        //          "symbol":"BTC_USDT",
        //          "last_price":"146.24",
        //          "open_24h":"147.17",
        //          "high_24h":"147.48",
        //          "low_24h":"143.88",
        //          "base_volume_24h":"117387.58", // NOT base, but quote currency!!!
        //          "s_t": 1610936002
        //      }
        //
        // swap
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "product_type": 1,
        //         "open_timestamp": 1645977600000,
        //         "expire_timestamp": 0,
        //         "settle_timestamp": 0,
        //         "base_currency": "BTC",
        //         "quote_currency": "USDT",
        //         "last_price": "63547.4",
        //         "volume_24h": "110938430",
        //         "turnover_24h": "7004836342.6944",
        //         "index_price": "63587.85404255",
        //         "index_name": "BTCUSDT",
        //         "contract_size": "0.001",
        //         "min_leverage": "1",
        //         "max_leverage": "100",
        //         "price_precision": "0.1",
        //         "vol_precision": "1",
        //         "max_volume": "1000000",
        //         "min_volume": "1",
        //         "funding_rate": "0.0000801",
        //         "expected_funding_rate": "-0.0000035",
        //         "open_interest": "278214",
        //         "open_interest_value": "17555316.9355496",
        //         "high_24h": "64109.4",
        //         "low_24h": "61857.6",
        //         "change_24h": "0.0239264900886327",
        //         "funding_time": 1726819200000
        //     }
        //
        const result = this.safeList(ticker, 'result', []);
        const average = this.safeString2(ticker, 'avg_price', 'index_price');
        let marketId = this.safeString2(ticker, 'symbol', 'contract_symbol');
        let timestamp = this.safeInteger2(ticker, 'timestamp', 'ts');
        let last = this.safeString2(ticker, 'last_price', 'last');
        let percentage = this.safeString2(ticker, 'price_change_percent_24h', 'change_24h');
        let change = this.safeString(ticker, 'fluctuation');
        let high = this.safeString2(ticker, 'high_24h', 'high_price');
        let low = this.safeString2(ticker, 'low_24h', 'low_price');
        let bid = this.safeString2(ticker, 'best_bid', 'bid_px');
        let bidVolume = this.safeString2(ticker, 'best_bid_size', 'bid_sz');
        let ask = this.safeString2(ticker, 'best_ask', 'ask_px');
        let askVolume = this.safeString2(ticker, 'best_ask_size', 'ask_sz');
        let open = this.safeString(ticker, 'open_24h');
        let baseVolume = this.safeStringN(ticker, ['base_volume_24h', 'v_24h', 'volume_24h']);
        let quoteVolume = this.safeStringLowerN(ticker, ['quote_volume_24h', 'qv_24h', 'turnover_24h']);
        const listMarketId = this.safeString(result, 0);
        if (listMarketId !== undefined) {
            marketId = listMarketId;
            timestamp = this.safeInteger(result, 12);
            high = this.safeString(result, 5);
            low = this.safeString(result, 6);
            bid = this.safeString(result, 8);
            bidVolume = this.safeString(result, 9);
            ask = this.safeString(result, 10);
            askVolume = this.safeString(result, 11);
            open = this.safeString(result, 4);
            last = this.safeString(result, 1);
            change = this.safeString(result, 7);
            baseVolume = this.safeString(result, 2);
            quoteVolume = this.safeStringLower(result, 3);
        }
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        if (timestamp === undefined) {
            // ticker from WS has a different field (in seconds)
            timestamp = this.safeIntegerProduct(ticker, 's_t', 1000);
        }
        if (percentage === undefined) {
            percentage = Precise["default"].stringMul(change, '100');
        }
        if (quoteVolume === undefined) {
            if (baseVolume === undefined) {
                // this is swap
                quoteVolume = this.safeString(ticker, 'volume_24h', quoteVolume);
            }
            else {
                // this is a ticker from websockets
                // contrary to name and documentation, base_volume_24h is actually the quote volume
                quoteVolume = baseVolume;
                baseVolume = undefined;
            }
        }
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'indexPrice': this.safeString(ticker, 'index_price'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name bitmart#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developer-pro.bitmart.com/en/spot/#get-ticker-of-a-trading-pair-v3
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {};
        let response = undefined;
        if (market['swap']) {
            request['symbol'] = market['id'];
            response = await this.publicGetContractPublicDetails(this.extend(request, params));
            //
            //     {
            //         "code": 1000,
            //         "message": "Ok",
            //         "data": {
            //             "symbols": [
            //                 {
            //                     "symbol": "BTCUSDT",
            //                     "product_type": 1,
            //                     "open_timestamp": 1645977600000,
            //                     "expire_timestamp": 0,
            //                     "settle_timestamp": 0,
            //                     "base_currency": "BTC",
            //                     "quote_currency": "USDT",
            //                     "last_price": "63547.4",
            //                     "volume_24h": "110938430",
            //                     "turnover_24h": "7004836342.6944",
            //                     "index_price": "63587.85404255",
            //                     "index_name": "BTCUSDT",
            //                     "contract_size": "0.001",
            //                     "min_leverage": "1",
            //                     "max_leverage": "100",
            //                     "price_precision": "0.1",
            //                     "vol_precision": "1",
            //                     "max_volume": "1000000",
            //                     "min_volume": "1",
            //                     "funding_rate": "0.0000801",
            //                     "expected_funding_rate": "-0.0000035",
            //                     "open_interest": "278214",
            //                     "open_interest_value": "17555316.9355496",
            //                     "high_24h": "64109.4",
            //                     "low_24h": "61857.6",
            //                     "change_24h": "0.0239264900886327",
            //                     "funding_time": 1726819200000
            //                 },
            //             ]
            //         }
            //     }
            //
        }
        else if (market['spot']) {
            request['symbol'] = market['id'];
            response = await this.publicGetSpotQuotationV3Ticker(this.extend(request, params));
            //
            //     {
            //         "code": 1000,
            //         "trace": "f2194c2c202d2.99.1717535",
            //         "message": "success",
            //         "data": {
            //             "symbol": "BTC_USDT",
            //             "last": "68500.00",
            //             "v_24h": "10491.65490",
            //             "qv_24h": "717178990.42",
            //             "open_24h": "68149.75",
            //             "high_24h": "69499.99",
            //             "low_24h": "67132.40",
            //             "fluctuation": "0.00514",
            //             "bid_px": "68500",
            //             "bid_sz": "0.00162",
            //             "ask_px": "68500.01",
            //             "ask_sz": "0.01722",
            //             "ts": "1717131391671"
            //         }
            //     }
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTicker() does not support ' + market['type'] + ' markets, only spot and swap markets are accepted');
        }
        // fails in naming for contract tickers 'contract_symbol'
        let tickers = [];
        let ticker = {};
        if (market['spot']) {
            ticker = this.safeDict(response, 'data', {});
        }
        else {
            const data = this.safeDict(response, 'data', {});
            tickers = this.safeList(data, 'symbols', []);
            ticker = this.safeDict(tickers, 0, {});
        }
        return this.parseTicker(ticker, market);
    }
    /**
     * @method
     * @name bitmart#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://developer-pro.bitmart.com/en/spot/#get-ticker-of-all-pairs-v3
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let type = undefined;
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeString(symbols, 0);
            market = this.market(symbol);
        }
        [type, params] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.publicGetSpotQuotationV3Tickers(params);
            //
            //     {
            //         "code": 1000,
            //         "trace": "17c5e5d9ac49f9b71efca2bed55f1a.105.171225637482393",
            //         "message": "success",
            //         "data": [
            //             [
            //                 "AFIN_USDT",
            //                 "0.001047",
            //                 "11110",
            //                 "11.632170",
            //                 "0.001048",
            //                 "0.001048",
            //                 "0.001047",
            //                 "-0.00095",
            //                 "0.001029",
            //                 "5555",
            //                 "0.001041",
            //                 "5297",
            //                 "1717122550482"
            //             ],
            //         ]
            //     }
            //
        }
        else if (type === 'swap') {
            response = await this.publicGetContractPublicDetails(params);
            //
            //     {
            //         "code": 1000,
            //         "message": "Ok",
            //         "data": {
            //             "symbols": [
            //                 {
            //                     "symbol": "BTCUSDT",
            //                     "product_type": 1,
            //                     "open_timestamp": 1645977600000,
            //                     "expire_timestamp": 0,
            //                     "settle_timestamp": 0,
            //                     "base_currency": "BTC",
            //                     "quote_currency": "USDT",
            //                     "last_price": "63547.4",
            //                     "volume_24h": "110938430",
            //                     "turnover_24h": "7004836342.6944",
            //                     "index_price": "63587.85404255",
            //                     "index_name": "BTCUSDT",
            //                     "contract_size": "0.001",
            //                     "min_leverage": "1",
            //                     "max_leverage": "100",
            //                     "price_precision": "0.1",
            //                     "vol_precision": "1",
            //                     "max_volume": "1000000",
            //                     "min_volume": "1",
            //                     "funding_rate": "0.0000801",
            //                     "expected_funding_rate": "-0.0000035",
            //                     "open_interest": "278214",
            //                     "open_interest_value": "17555316.9355496",
            //                     "high_24h": "64109.4",
            //                     "low_24h": "61857.6",
            //                     "change_24h": "0.0239264900886327",
            //                     "funding_time": 1726819200000
            //                 },
            //             ]
            //         }
            //     }
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTickers() does not support ' + type + ' markets, only spot and swap markets are accepted');
        }
        let tickers = [];
        if (type === 'spot') {
            tickers = this.safeList(response, 'data', []);
        }
        else {
            const data = this.safeDict(response, 'data', {});
            tickers = this.safeList(data, 'symbols', []);
        }
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = {};
            if (type === 'spot') {
                ticker = this.parseTicker({ 'result': tickers[i] });
            }
            else {
                ticker = this.parseTicker(tickers[i]);
            }
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    /**
     * @method
     * @name bitmart#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer-pro.bitmart.com/en/spot/#get-depth-v3
     * @see https://developer-pro.bitmart.com/en/futures/#get-market-depth
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-market-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            if (limit !== undefined) {
                request['limit'] = limit; // default 35, max 50
            }
            response = await this.publicGetSpotQuotationV3Books(this.extend(request, params));
        }
        else if (market['swap']) {
            response = await this.publicGetContractPublicDepth(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchOrderBook() does not support ' + market['type'] + ' markets, only spot and swap markets are accepted');
        }
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "data": {
        //             "ts": "1695264191808",
        //             "symbol": "BTC_USDT",
        //             "asks": [
        //                 ["26942.57","0.06492"],
        //                 ["26942.73","0.05447"],
        //                 ["26943.00","0.07154"]
        //             ],
        //             "bids": [
        //                 ["26942.45","0.00074"],
        //                 ["26941.53","0.00371"],
        //                 ["26940.94","0.08992"]
        //             ]
        //         },
        //         "trace": "430a7f69581d4258a8e4b424dfb10782.73.16952341919017619"
        //     }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": {
        //             "asks": [
        //                 ["26938.3","3499","3499"],
        //                 ["26938.5","14702","18201"],
        //                 ["26938.6","20457","38658"]
        //             ],
        //             "bids": [
        //                 ["26938.2","20","20"],
        //                 ["26937.9","1913","1933"],
        //                 ["26937.8","2588","4521"]
        //             ],
        //             "timestamp": 1695264383999,
        //             "symbol": "BTCUSDT"
        //         },
        //         "trace": "4cad855074664097ac6ba5258c47305d.72.16952643834721135"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.safeInteger2(data, 'ts', 'timestamp');
        return this.parseOrderBook(data, market['symbol'], timestamp);
    }
    parseTrade(trade, market = undefined) {
        //
        // public fetchTrades spot ( amount = count * price )
        //
        //     [
        //         "BTC_USDT",      // symbol
        //         "1717212457302", // timestamp
        //         "67643.11",      // price
        //         "0.00106",       // size
        //         "sell"           // side
        //     ]
        //
        // spot: fetchMyTrades
        //
        //    {
        //        "tradeId":"182342999769370687",
        //        "orderId":"183270218784142990",
        //        "clientOrderId":"183270218784142990",
        //        "symbol":"ADA_USDT",
        //        "side":"buy",
        //        "orderMode":"spot",
        //        "type":"market",
        //        "price":"0.245948",
        //        "size":"20.71",
        //        "notional":"5.09358308",
        //        "fee":"0.00509358",
        //        "feeCoinName":"USDT",
        //        "tradeRole":"taker",
        //        "createTime":1695658457836,
        //    }
        //
        // swap: fetchMyTrades
        //
        //    {
        //        "order_id": "230930336848609",
        //        "trade_id": "6212604014",
        //        "symbol": "BTCUSDT",
        //        "side": 3,
        //        "price": "26910.4",
        //        "vol": "1",
        //        "exec_type": "Taker",
        //        "profit": false,
        //        "create_time": 1695961596692,
        //        "realised_profit": "-0.0003",
        //        "paid_fees": "0.01614624"
        //    }
        //
        // ws swap
        //
        //    {
        //        'fee': '-0.000044502',
        //        'feeCcy': 'USDT',
        //        'fillPrice': '74.17',
        //        'fillQty': '1',
        //        'lastTradeID': 6802340762
        //    }
        //
        const timestamp = this.safeIntegerN(trade, ['createTime', 'create_time', 1]);
        const isPublic = this.safeString(trade, 0);
        const isPublicTrade = (isPublic !== undefined);
        let amount = undefined;
        let cost = undefined;
        let type = undefined;
        let side = undefined;
        if (isPublicTrade) {
            amount = this.safeString2(trade, 'count', 3);
            cost = this.safeString(trade, 'amount');
            side = this.safeString2(trade, 'type', 4);
        }
        else {
            amount = this.safeStringN(trade, ['size', 'vol', 'fillQty']);
            cost = this.safeString(trade, 'notional');
            type = this.safeString(trade, 'type');
            side = this.parseOrderSide(this.safeString(trade, 'side'));
        }
        const marketId = this.safeString2(trade, 'symbol', 0);
        market = this.safeMarket(marketId, market);
        const feeCostString = this.safeString2(trade, 'fee', 'paid_fees');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'feeCoinName');
            let feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            if (feeCurrencyCode === undefined) {
                feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'info': trade,
            'id': this.safeStringN(trade, ['tradeId', 'trade_id', 'lastTradeID']),
            'order': this.safeString2(trade, 'orderId', 'order_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': this.safeStringN(trade, ['price', 'fillPrice', 2]),
            'amount': amount,
            'cost': cost,
            'takerOrMaker': this.safeStringLower2(trade, 'tradeRole', 'exec_type'),
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name bitmart#fetchTrades
     * @description get a list of the most recent trades for a particular symbol
     * @see https://developer-pro.bitmart.com/en/spot/#get-recent-trades-v3
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' fetchTrades() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetSpotQuotationV3Trades(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "trace": "58031f9a5bd.111.17117",
        //         "message": "success",
        //         "data": [
        //             [
        //                 "BTC_USDT",
        //                 "1717212457302",
        //                 "67643.11",
        //                 "0.00106",
        //                 "sell"
        //             ],
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        // spot
        //    [
        //        "1699512060", // timestamp
        //        "36746.49", // open
        //        "36758.71", // high
        //        "36736.13", // low
        //        "36755.99", // close
        //        "2.83965", // base volume
        //        "104353.57" // quote volume
        //    ]
        //
        // swap
        //    {
        //        "low_price": "20090.3",
        //        "high_price": "20095.5",
        //        "open_price": "20092.6",
        //        "close_price": "20091.4",
        //        "volume": "8748",
        //        "timestamp": 1665002281
        //    }
        //
        // ws
        //    [
        //        1631056350, // timestamp
        //        "46532.83", // open
        //        "46555.71", // high
        //        "46511.41", // low
        //        "46555.71", // close
        //        "0.25", // volume
        //    ]
        //
        // ws swap
        //    {
        //        "symbol":"BTCUSDT",
        //        "o":"146.24",
        //        "h":"146.24",
        //        "l":"146.24",
        //        "c":"146.24",
        //        "v":"146"
        //    }
        //
        if (Array.isArray(ohlcv)) {
            return [
                this.safeTimestamp(ohlcv, 0),
                this.safeNumber(ohlcv, 1),
                this.safeNumber(ohlcv, 2),
                this.safeNumber(ohlcv, 3),
                this.safeNumber(ohlcv, 4),
                this.safeNumber(ohlcv, 5),
            ];
        }
        else {
            return [
                this.safeTimestamp2(ohlcv, 'timestamp', 'ts'),
                this.safeNumber2(ohlcv, 'open_price', 'o'),
                this.safeNumber2(ohlcv, 'high_price', 'h'),
                this.safeNumber2(ohlcv, 'low_price', 'l'),
                this.safeNumber2(ohlcv, 'close_price', 'c'),
                this.safeNumber2(ohlcv, 'volume', 'v'),
            ];
        }
    }
    /**
     * @method
     * @name bitmart#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developer-pro.bitmart.com/en/spot/#get-history-k-line-v3
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-k-line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp of the latest candle in ms
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 200);
        }
        const market = this.market(symbol);
        const duration = this.parseTimeframe(timeframe);
        const parsedTimeframe = this.safeInteger(this.timeframes, timeframe);
        let request = {
            'symbol': market['id'],
        };
        if (parsedTimeframe !== undefined) {
            request['step'] = parsedTimeframe;
        }
        else {
            request['step'] = timeframe;
        }
        if (market['spot']) {
            [request, params] = this.handleUntilOption('before', request, params, 0.001);
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (since !== undefined) {
                request['after'] = this.parseToInt((since / 1000)) - 1;
            }
        }
        else {
            const maxLimit = 500;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min(maxLimit, limit);
            const now = this.parseToInt(this.milliseconds() / 1000);
            if (since === undefined) {
                const start = now - limit * duration;
                request['start_time'] = start;
                request['end_time'] = now;
            }
            else {
                const start = this.parseToInt((since / 1000)) - 1;
                const end = this.sum(start, limit * duration);
                request['start_time'] = start;
                request['end_time'] = Math.min(end, now);
            }
            [request, params] = this.handleUntilOption('end_time', request, params, 0.001);
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.publicGetContractPublicKline(this.extend(request, params));
        }
        else {
            response = await this.publicGetSpotQuotationV3Klines(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "data": [
        //             ["1699512060","36746.49","36758.71","36736.13","36755.99","2.83965","104353.57"],
        //             ["1699512120","36756.00","36758.70","36737.14","36737.63","1.96070","72047.10"],
        //             ["1699512180","36737.63","36740.45","36737.62","36740.44","0.63194","23217.62"]
        //         ],
        //         "trace": "6591fc7b508845359d5fa442e3b3a4fb.72.16995122398750695"
        //     }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "low_price": "20090.3",
        //                 "high_price": "20095.5",
        //                 "open_price": "20092.6",
        //                 "close_price": "20091.4",
        //                 "volume": "8748",
        //                 "timestamp": 1665002281
        //             },
        //             ...
        //         ],
        //         "trace": "96c989db-e0f5-46f5-bba6-60cfcbde699b"
        //     }
        //
        const ohlcv = this.safeList(response, 'data', []);
        return this.parseOHLCVs(ohlcv, market, timeframe, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchMyTrades
     * @see https://developer-pro.bitmart.com/en/spot/#account-trade-list-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-trade-keyed
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.marginMode] *spot* whether to fetch trades for margin orders or spot orders, defaults to spot orders (only isolated margin orders are supported)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        const until = this.safeIntegerN(params, ['until', 'endTime', 'end_time']);
        params = this.omit(params, ['until']);
        if (type === 'spot') {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
            if (marginMode === 'isolated') {
                request['orderMode'] = 'iso_margin';
            }
            const options = this.safeDict(this.options, 'fetchMyTrades', {});
            const maxLimit = 200;
            const defaultLimit = this.safeInteger(options, 'limit', maxLimit);
            if (limit === undefined) {
                limit = defaultLimit;
            }
            request['limit'] = Math.min(limit, maxLimit);
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (until !== undefined) {
                request['endTime'] = until;
            }
            response = await this.privatePostSpotV4QueryTrades(this.extend(request, params));
        }
        else if (type === 'swap') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
            }
            if (since !== undefined) {
                request['start_time'] = since;
            }
            if (until !== undefined) {
                request['end_time'] = until;
            }
            response = await this.privateGetContractPrivateTrades(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchMyTrades() does not support ' + type + ' orders, only spot and swap orders are accepted');
        }
        //
        // spot
        //
        //    {
        //        "code":1000,
        //        "message":"success",
        //        "data":[
        //           {
        //              "tradeId":"182342999769370687",
        //              "orderId":"183270218784142990",
        //              "clientOrderId":"183270218784142990",
        //              "symbol":"ADA_USDT",
        //              "side":"buy",
        //              "orderMode":"spot",
        //              "type":"market",
        //              "price":"0.245948",
        //              "size":"20.71",
        //              "notional":"5.09358308",
        //              "fee":"0.00509358",
        //              "feeCoinName":"USDT",
        //              "tradeRole":"taker",
        //              "createTime":1695658457836,
        //              "updateTime":1695658457836
        //           }
        //        ],
        //        "trace":"fbaee9e0e2f5442fba5b3262fc86b0ac.65.16956593456523085"
        //    }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "order_id": "230930336848609",
        //                 "trade_id": "6212604014",
        //                 "symbol": "BTCUSDT",
        //                 "side": 3,
        //                 "price": "26910.4",
        //                 "vol": "1",
        //                 "exec_type": "Taker",
        //                 "profit": false,
        //                 "create_time": 1695961596692,
        //                 "realised_profit": "-0.0003",
        //                 "paid_fees": "0.01614624"
        //             },
        //         ],
        //         "trace": "4cad855074634097ac6ba5257c47305d.62.16959616054873723"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchOrderTrades
     * @see https://developer-pro.bitmart.com/en/spot/#order-trade-list-v4-signed
     * @description fetch all the trades made from a single order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostSpotV4QueryOrderTrades(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, undefined, since, limit);
    }
    customParseBalance(response, marketType) {
        const data = this.safeDict(response, 'data', {});
        let wallet = undefined;
        if (marketType === 'swap') {
            wallet = this.safeList(response, 'data', []);
        }
        else if (marketType === 'margin') {
            wallet = this.safeList(data, 'symbols', []);
        }
        else {
            wallet = this.safeList(data, 'wallet', []);
        }
        const result = { 'info': response };
        if (marketType === 'margin') {
            for (let i = 0; i < wallet.length; i++) {
                const entry = wallet[i];
                const marketId = this.safeString(entry, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined, '_');
                const base = this.safeDict(entry, 'base', {});
                const quote = this.safeDict(entry, 'quote', {});
                const baseCode = this.safeCurrencyCode(this.safeString(base, 'currency'));
                const quoteCode = this.safeCurrencyCode(this.safeString(quote, 'currency'));
                const subResult = {};
                subResult[baseCode] = this.parseBalanceHelper(base);
                subResult[quoteCode] = this.parseBalanceHelper(quote);
                result[symbol] = this.safeBalance(subResult);
            }
            return result;
        }
        else {
            for (let i = 0; i < wallet.length; i++) {
                const balance = wallet[i];
                let currencyId = this.safeString2(balance, 'id', 'currency');
                currencyId = this.safeString(balance, 'coin_code', currencyId);
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString2(balance, 'available', 'available_balance');
                account['used'] = this.safeString2(balance, 'frozen', 'frozen_balance');
                result[code] = account;
            }
            return this.safeBalance(result);
        }
    }
    parseBalanceHelper(entry) {
        const account = this.account();
        account['used'] = this.safeString(entry, 'frozen');
        account['free'] = this.safeString(entry, 'available');
        account['total'] = this.safeString(entry, 'total_asset');
        const debt = this.safeString(entry, 'borrow_unpaid');
        const interest = this.safeString(entry, 'interest_unpaid');
        account['debt'] = Precise["default"].stringAdd(debt, interest);
        return account;
    }
    /**
     * @method
     * @name bitmart#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developer-pro.bitmart.com/en/spot/#get-spot-wallet-balance
     * @see https://developer-pro.bitmart.com/en/futures/#get-contract-assets-detail
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-assets-keyed
     * @see https://developer-pro.bitmart.com/en/spot/#get-account-balance
     * @see https://developer-pro.bitmart.com/en/spot/#get-margin-account-details-isolated
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const marginMode = this.safeString(params, 'marginMode');
        const isMargin = this.safeBool(params, 'margin', false);
        params = this.omit(params, ['margin', 'marginMode']);
        if (marginMode !== undefined || isMargin) {
            marketType = 'margin';
        }
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetSpotV1Wallet(params);
        }
        else if (marketType === 'swap') {
            response = await this.privateGetContractPrivateAssetsDetail(params);
        }
        else if (marketType === 'account') {
            response = await this.privateGetAccountV1Wallet(params);
        }
        else if (marketType === 'margin') {
            response = await this.privateGetSpotV1MarginIsolatedAccount(params);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchBalance() does not support ' + marketType + ' markets, only spot, swap and account and margin markets are accepted');
        }
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"39069916-72f9-44c7-acde-2ad5afd21cad",
        //         "data":{
        //             "wallet":[
        //                 {"id":"BTC","name":"Bitcoin","available":"0.00000062","frozen":"0.00000000"},
        //                 {"id":"ETH","name":"Ethereum","available":"0.00002277","frozen":"0.00000000"},
        //                 {"id":"BMX","name":"BitMart Token","available":"0.00000000","frozen":"0.00000000"}
        //             ]
        //         }
        //     }
        //
        // account
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"5c3b7fc7-93b2-49ef-bb59-7fdc56915b59",
        //         "data":{
        //             "wallet":[
        //                 {"currency":"BTC","name":"Bitcoin","available":"0.00000062","frozen":"0.00000000"},
        //                 {"currency":"ETH","name":"Ethereum","available":"0.00002277","frozen":"0.00000000"}
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "currency": "USDT",
        //                 "available_balance": "0",
        //                 "frozen_balance": "0",
        //                 "unrealized": "0",
        //                 "equity": "0",
        //                 "position_deposit": "0"
        //             },
        //             ...
        //         ],
        //         "trace": "f9da3a39-cf45-42e7-914d-294f565dfc33"
        //     }
        //
        // margin
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "61dd6ab265c04064b72d8bc9b205f741.71.16701055600915302",
        //         "data": {
        //             "symbols": [
        //                 {
        //                     "symbol": "BTC_USDT",
        //                     "risk_rate": "999.00",
        //                     "risk_level": "1",
        //                     "buy_enabled": false,
        //                     "sell_enabled": false,
        //                     "liquidate_price": null,
        //                     "liquidate_rate": "1.15",
        //                     "base": {
        //                         "currency": "BTC",
        //                         "borrow_enabled": true,
        //                         "borrowed": "0.00000000",
        //                         "available": "0.00000000",
        //                         "frozen": "0.00000000",
        //                         "net_asset": "0.00000000",
        //                         "net_assetBTC": "0.00000000",
        //                         "total_asset": "0.00000000",
        //                         "borrow_unpaid": "0.00000000",
        //                         "interest_unpaid": "0.00000000"
        //                     },
        //                     "quote": {
        //                         "currency": "USDT",
        //                         "borrow_enabled": true,
        //                         "borrowed": "0.00000000",
        //                         "available": "20.00000000",
        //                         "frozen": "0.00000000",
        //                         "net_asset": "20.00000000",
        //                         "net_assetBTC": "0.00118008",
        //                         "total_asset": "20.00000000",
        //                         "borrow_unpaid": "0.00000000",
        //                         "interest_unpaid": "0.00000000"
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.customParseBalance(response, marketType);
    }
    parseTradingFee(fee, market = undefined) {
        //
        //     {
        //         "symbol": "ETH_USDT",
        //         "taker_fee_rate": "0.0025",
        //         "maker_fee_rate": "0.0025"
        //     }
        //
        const marketId = this.safeString(fee, 'symbol');
        const symbol = this.safeSymbol(marketId);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber(fee, 'maker_fee_rate'),
            'taker': this.safeNumber(fee, 'taker_fee_rate'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    /**
     * @method
     * @name bitmart#fetchTradingFee
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' fetchTradingFee() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetSpotV1TradeFee(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": "1000",
        //         "trace": "5a6f1e40-37fe-4849-a494-03279fadcc62",
        //         "data": {
        //             "symbol": "ETH_USDT",
        //             "taker_fee_rate": "0.0025",
        //             "maker_fee_rate": "0.0025"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTradingFee(data);
    }
    parseOrder(order, market = undefined) {
        //
        // createOrder, editOrder
        //
        //     {
        //         "order_id": 2707217580
        //     }
        //
        // swap
        //   "data": {
        //       "order_id": 231116359426639,
        //       "price": "market price"
        //    },
        //
        // cancelOrder
        //
        //     "2707217580" // order id
        //
        // spot fetchOrder, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order_id":1736871726781,
        //         "symbol":"BTC_USDT",
        //         "create_time":1591096004000,
        //         "side":"sell",
        //         "type":"market", // limit, market, limit_maker, ioc
        //         "price":"0.00",
        //         "price_avg":"0.00",
        //         "size":"0.02000",
        //         "notional":"0.00000000",
        //         "filled_notional":"0.00000000",
        //         "filled_size":"0.00000",
        //         "status":"8"
        //     }
        //
        // spot v4
        //    {
        //        "orderId" : "118100034543076010",
        //        "clientOrderId" : "118100034543076010",
        //        "symbol" : "BTC_USDT",
        //        "side" : "buy",
        //        "orderMode" : "spot",
        //        "type" : "limit",
        //        "state" : "filled",
        //        "price" : "48800.00",
        //        "priceAvg" : "39999.00",
        //        "size" : "0.10000",
        //        "filledSize" : "0.10000",
        //        "notional" : "4880.00000000",
        //        "filledNotional" : "3999.90000000",
        //        "createTime" : 1681701557927,
        //        "updateTime" : 1681701559408
        //    }
        //
        // swap: fetchOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "order_id": "230935812485489",
        //         "client_order_id": "",
        //         "price": "24000",
        //         "size": "1",
        //         "symbol": "BTCUSDT",
        //         "state": 2,
        //         "side": 1,
        //         "type": "limit",
        //         "leverage": "10",
        //         "open_type": "isolated",
        //         "deal_avg_price": "0",
        //         "deal_size": "0",
        //         "create_time": 1695702258629,
        //         "update_time": 1695702258642,
        //         "activation_price_type": 0,
        //         "activation_price": "",
        //         "callback_rate": ""
        //     }
        //
        let id = undefined;
        if (typeof order === 'string') {
            id = order;
            order = {};
        }
        id = this.safeString2(order, 'order_id', 'orderId', id);
        const timestamp = this.safeInteger2(order, 'create_time', 'createTime');
        const marketId = this.safeString(order, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        market = this.safeMarket(symbol, market);
        const orderType = this.safeString(market, 'type', 'spot');
        let type = this.safeString(order, 'type');
        let timeInForce = undefined;
        let postOnly = undefined;
        if (type === 'limit_maker') {
            type = 'limit';
            postOnly = true;
            timeInForce = 'PO';
        }
        if (type === 'ioc') {
            type = 'limit';
            timeInForce = 'IOC';
        }
        let priceString = this.safeString(order, 'price');
        if (priceString === 'market price') {
            priceString = undefined;
        }
        const trailingActivationPrice = this.safeNumber(order, 'activation_price');
        return this.safeOrder({
            'id': id,
            'clientOrderId': this.safeString2(order, 'client_order_id', 'clientOrderId'),
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'update_time'),
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': this.parseOrderSide(this.safeString(order, 'side')),
            'price': this.omitZero(priceString),
            'triggerPrice': trailingActivationPrice,
            'amount': this.omitZero(this.safeString(order, 'size')),
            'cost': this.safeString2(order, 'filled_notional', 'filledNotional'),
            'average': this.safeStringN(order, ['price_avg', 'priceAvg', 'deal_avg_price']),
            'filled': this.safeStringN(order, ['filled_size', 'filledSize', 'deal_size']),
            'remaining': undefined,
            'status': this.parseOrderStatusByType(orderType, this.safeString2(order, 'status', 'state')),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseOrderSide(side) {
        const sides = {
            '1': 'buy',
            '2': 'buy',
            '3': 'sell',
            '4': 'sell',
        };
        return this.safeString(sides, side, side);
    }
    parseOrderStatusByType(type, status) {
        const statusesByType = {
            'spot': {
                '1': 'rejected',
                '2': 'open',
                '3': 'rejected',
                '4': 'open',
                '5': 'open',
                '6': 'closed',
                '7': 'canceled',
                '8': 'canceled',
                'new': 'open',
                'partially_filled': 'open',
                'filled': 'closed',
                'partially_canceled': 'canceled',
            },
            'swap': {
                '1': 'open',
                '2': 'open',
                '4': 'closed', // Completed
            },
        };
        const statuses = this.safeDict(statusesByType, type, {});
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name bitmart#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://developer-pro.bitmart.com/en/spot/#new-order-v2-signed
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder(symbol, 'market', 'buy', cost, undefined, params);
    }
    /**
     * @method
     * @name bitmart#createOrder
     * @description create a trade order
     * @see https://developer-pro.bitmart.com/en/spot/#new-order-v2-signed
     * @see https://developer-pro.bitmart.com/en/spot/#place-margin-order
     * @see https://developer-pro.bitmart.com/en/futures/#submit-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#submit-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-tp-or-sl-order-signed
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit' or 'trailing' for swap markets only
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.leverage] *swap only* leverage level
     * @param {string} [params.clientOrderId] client order id of the order
     * @param {boolean} [params.reduceOnly] *swap only* reduce only
     * @param {boolean} [params.postOnly] make sure the order is posted to the order book and not matched immediately
     * @param {string} [params.triggerPrice] *swap only* the price to trigger a stop order
     * @param {int} [params.price_type] *swap only* 1: last price, 2: fair price, default is 1
     * @param {int} [params.price_way] *swap only* 1: price way long, 2: price way short
     * @param {int} [params.activation_price_type] *swap trailing order only* 1: last price, 2: fair price, default is 1
     * @param {string} [params.trailingPercent] *swap only* the percent to trail away from the current market price, min 0.1 max 5
     * @param {string} [params.trailingTriggerPrice] *swap only* the price to trigger a trailing order, default uses the price argument
     * @param {string} [params.stopLossPrice] *swap only* the price to trigger a stop-loss order
     * @param {string} [params.takeProfitPrice] *swap only* the price to trigger a take-profit order
     * @param {int} [params.plan_category] *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const result = this.handleMarginModeAndParams('createOrder', params);
        const marginMode = this.safeString(result, 0);
        const triggerPrice = this.safeStringN(params, ['triggerPrice', 'stopPrice', 'trigger_price']);
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const isTriggerOrder = triggerPrice !== undefined;
        let response = undefined;
        if (market['spot']) {
            const spotRequest = this.createSpotOrderRequest(symbol, type, side, amount, price, params);
            if (marginMode === 'isolated') {
                response = await this.privatePostSpotV1MarginSubmitOrder(spotRequest);
            }
            else {
                response = await this.privatePostSpotV2SubmitOrder(spotRequest);
            }
        }
        else {
            const swapRequest = this.createSwapOrderRequest(symbol, type, side, amount, price, params);
            if (isTriggerOrder) {
                response = await this.privatePostContractPrivateSubmitPlanOrder(swapRequest);
            }
            else if (isStopLoss || isTakeProfit) {
                response = await this.privatePostContractPrivateSubmitTpSlOrder(swapRequest);
            }
            else {
                response = await this.privatePostContractPrivateSubmitOrder(swapRequest);
            }
        }
        //
        // spot and margin
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "order_id": 2707217580
        //         }
        //     }
        //
        // swap
        // {"code":1000,"message":"Ok","data":{"order_id":231116359426639,"price":"market price"},"trace":"7f9c94e10f9d4513bc08a7bfc2a5559a.62.16996369620521911"}
        //
        const data = this.safeDict(response, 'data', {});
        const order = this.parseOrder(data, market);
        order['type'] = type;
        order['side'] = side;
        order['amount'] = amount;
        order['price'] = price;
        return order;
    }
    /**
     * @method
     * @name bitmart#createOrders
     * @description create a list of trade orders
     * @see https://developer-pro.bitmart.com/en/spot/#new-batch-order-v4-signed
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let symbol = undefined;
        let market = undefined;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            market = this.market(marketId);
            if (!market['spot']) {
                throw new errors.NotSupported(this.id + ' createOrders() supports spot orders only');
            }
            if (symbol === undefined) {
                symbol = marketId;
            }
            else {
                if (symbol !== marketId) {
                    throw new errors.BadRequest(this.id + ' createOrders() requires all orders to have the same symbol');
                }
            }
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeValue(rawOrder, 'amount');
            const price = this.safeValue(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            let orderRequest = this.createSpotOrderRequest(marketId, type, side, amount, price, orderParams);
            orderRequest = this.omit(orderRequest, ['symbol']); // not needed because it goes in the outter object
            ordersRequests.push(orderRequest);
        }
        const request = {
            'symbol': market['id'],
            'orderParams': ordersRequests,
        };
        const response = await this.privatePostSpotV4BatchOrders(request);
        //
        // {
        //     "message": "OK",
        //     "code": 1000,
        //     "trace": "5fc697fb817a4b5396284786a9b2609a.263.17022620476480263",
        //     "data": {
        //       "code": 0,
        //       "msg": "success",
        //       "data": {
        //         "orderIds": [
        //           "212751308355553320"
        //         ]
        //       }
        //     }
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const innderData = this.safeDict(data, 'data', {});
        const orderIds = this.safeList(innderData, 'orderIds', []);
        const parsedOrders = [];
        for (let i = 0; i < orderIds.length; i++) {
            const orderId = orderIds[i];
            const order = this.safeOrder({ 'id': orderId }, market);
            parsedOrders.push(order);
        }
        return parsedOrders;
    }
    createSwapOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#createSwapOrderRequest
         * @ignore
         * @description create a trade order
         * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-order-signed
         * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-plan-order-signed
         * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-tp-or-sl-order-signed
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'trailing', 'stop_loss', or 'take_profit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.leverage] leverage level
         * @param {boolean} [params.reduceOnly] *swap only* reduce only
         * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross'
         * @param {string} [params.clientOrderId] client order id of the order
         * @param {string} [params.triggerPrice] *swap only* the price to trigger a stop order
         * @param {int} [params.price_type] *swap only* 1: last price, 2: fair price, default is 1
         * @param {int} [params.price_way] *swap only* 1: price way long, 2: price way short
         * @param {int} [params.activation_price_type] *swap trailing order only* 1: last price, 2: fair price, default is 1
         * @param {string} [params.trailingPercent] *swap only* the percent to trail away from the current market price, min 0.1 max 5
         * @param {string} [params.trailingTriggerPrice] *swap only* the price to trigger a trailing order, default uses the price argument
         * @param {string} [params.stopLossPrice] *swap only* the price to trigger a stop-loss order
         * @param {string} [params.takeProfitPrice] *swap only* the price to trigger a take-profit order
         * @param {int} [params.plan_category] *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const market = this.market(symbol);
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        if (isStopLoss) {
            type = 'stop_loss';
        }
        else if (isTakeProfit) {
            type = 'take_profit';
        }
        const request = {
            'symbol': market['id'],
            'type': type,
            'size': parseInt(this.amountToPrecision(symbol, amount)),
        };
        const timeInForce = this.safeString(params, 'timeInForce');
        const mode = this.safeInteger(params, 'mode'); // only for swap
        const isMarketOrder = type === 'market';
        let postOnly = undefined;
        let reduceOnly = this.safeBool(params, 'reduceOnly');
        const isExchangeSpecificPo = (mode === 4);
        [postOnly, params] = this.handlePostOnly(isMarketOrder, isExchangeSpecificPo, params);
        const ioc = ((timeInForce === 'IOC') || (mode === 3));
        const isLimitOrder = (type === 'limit') || postOnly || ioc;
        if (timeInForce === 'GTC') {
            request['mode'] = 1;
        }
        else if (timeInForce === 'FOK') {
            request['mode'] = 2;
        }
        else if (timeInForce === 'IOC') {
            request['mode'] = 3;
        }
        if (postOnly) {
            request['mode'] = 4;
        }
        const triggerPrice = this.safeStringN(params, ['triggerPrice', 'stopPrice', 'trigger_price']);
        const isTriggerOrder = triggerPrice !== undefined;
        const trailingTriggerPrice = this.safeString2(params, 'trailingTriggerPrice', 'activation_price', this.numberToString(price));
        const trailingPercent = this.safeString2(params, 'trailingPercent', 'callback_rate');
        const isTrailingPercentOrder = trailingPercent !== undefined;
        if (isLimitOrder) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        else if (type === 'trailing' || isTrailingPercentOrder) {
            request['callback_rate'] = trailingPercent;
            request['activation_price'] = this.priceToPrecision(symbol, trailingTriggerPrice);
            request['activation_price_type'] = this.safeInteger(params, 'activation_price_type', 1);
        }
        if (isTriggerOrder) {
            if (isLimitOrder || price !== undefined) {
                request['executive_price'] = this.priceToPrecision(symbol, price);
            }
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            request['price_type'] = this.safeInteger(params, 'price_type', 1);
            if (side === 'buy') {
                if (reduceOnly) {
                    request['price_way'] = 2;
                }
                else {
                    request['price_way'] = 1;
                }
            }
            else if (side === 'sell') {
                if (reduceOnly) {
                    request['price_way'] = 1;
                }
                else {
                    request['price_way'] = 2;
                }
            }
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params, 'cross');
        if (isStopLoss || isTakeProfit) {
            reduceOnly = true;
            request['price_type'] = this.safeInteger(params, 'price_type', 1);
            request['executive_price'] = this.priceToPrecision(symbol, price);
            if (isStopLoss) {
                request['trigger_price'] = this.priceToPrecision(symbol, stopLossPrice);
            }
            else {
                request['trigger_price'] = this.priceToPrecision(symbol, takeProfitPrice);
            }
        }
        else {
            request['open_type'] = marginMode;
        }
        if (side === 'buy') {
            if (reduceOnly) {
                request['side'] = 2; // buy close short
            }
            else {
                request['side'] = 1; // buy open long
            }
        }
        else if (side === 'sell') {
            if (reduceOnly) {
                request['side'] = 3; // sell close long
            }
            else {
                request['side'] = 4; // sell open short
            }
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit(params, 'clientOrderId');
            request['client_order_id'] = clientOrderId;
        }
        const leverage = this.safeInteger(params, 'leverage');
        params = this.omit(params, ['timeInForce', 'postOnly', 'reduceOnly', 'leverage', 'trailingTriggerPrice', 'trailingPercent', 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice']);
        if (leverage !== undefined) {
            request['leverage'] = this.numberToString(leverage);
        }
        else if (isTriggerOrder) {
            request['leverage'] = '1'; // for plan orders leverage is required, if not available default to 1
        }
        return this.extend(request, params);
    }
    createSpotOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitmart#createSpotOrderRequest
         * @ignore
         * @description create a spot order request
         * @see https://developer-pro.bitmart.com/en/spot/#place-spot-order
         * @see https://developer-pro.bitmart.com/en/spot/#place-margin-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'side': side,
            'type': type,
        };
        const timeInForce = this.safeString(params, 'timeInForce');
        if (timeInForce === 'FOK') {
            throw new errors.InvalidOrder(this.id + ' createOrder() only accepts timeInForce parameter values of IOC or PO');
        }
        const mode = this.safeInteger(params, 'mode'); // only for swap
        const isMarketOrder = type === 'market';
        let postOnly = undefined;
        const isExchangeSpecificPo = (type === 'limit_maker') || (mode === 4);
        [postOnly, params] = this.handlePostOnly(isMarketOrder, isExchangeSpecificPo, params);
        params = this.omit(params, ['timeInForce', 'postOnly']);
        const ioc = ((timeInForce === 'IOC') || (type === 'ioc'));
        const isLimitOrder = (type === 'limit') || postOnly || ioc;
        // method = 'privatePostSpotV2SubmitOrder';
        if (isLimitOrder) {
            request['size'] = this.amountToPrecision(symbol, amount);
            request['price'] = this.priceToPrecision(symbol, price);
        }
        else if (isMarketOrder) {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let notional = this.safeString2(params, 'cost', 'notional');
                params = this.omit(params, 'cost');
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if ((price === undefined) && (notional === undefined)) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument or in the "notional" extra parameter (the exchange-specific behaviour)');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        notional = Precise["default"].stringMul(amountString, priceString);
                    }
                }
                else {
                    notional = (notional === undefined) ? this.numberToString(amount) : notional;
                }
                request['notional'] = this.decimalToPrecision(notional, number.TRUNCATE, market['precision']['price'], this.precisionMode);
            }
            else if (side === 'sell') {
                request['size'] = this.amountToPrecision(symbol, amount);
            }
        }
        if (postOnly) {
            request['type'] = 'limit_maker';
        }
        if (ioc) {
            request['type'] = 'ioc';
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit(params, 'clientOrderId');
            request['client_order_id'] = clientOrderId;
        }
        return this.extend(request, params);
    }
    /**
     * @method
     * @name bitmart#cancelOrder
     * @description cancels an open order
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-order-signed
     * @see https://developer-pro.bitmart.com/en/spot/#cancel-order-v3-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-plan-order-signed
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] *spot only* the client order id of the order to cancel
     * @param {boolean} [params.trigger] *swap only* whether the order is a trigger order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        else {
            request['order_id'] = id.toString();
        }
        params = this.omit(params, ['clientOrderId']);
        let response = undefined;
        if (market['spot']) {
            response = await this.privatePostSpotV3CancelOrder(this.extend(request, params));
        }
        else {
            const trigger = this.safeBool2(params, 'stop', 'trigger');
            params = this.omit(params, ['stop', 'trigger']);
            if (!trigger) {
                response = await this.privatePostContractPrivateCancelOrder(this.extend(request, params));
            }
            else {
                response = await this.privatePostContractPrivateCancelPlanOrder(this.extend(request, params));
            }
        }
        // swap
        // {"code":1000,"message":"Ok","trace":"7f9c94e10f9d4513bc08a7bfc2a5559a.55.16959817848001851"}
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "result": true
        //         }
        //     }
        //
        // spot alternative
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": true
        //     }
        //
        if (market['swap']) {
            return response;
        }
        const data = this.safeValue(response, 'data');
        if (data === true) {
            return this.safeOrder({ 'id': id }, market);
        }
        const succeeded = this.safeValue(data, 'succeed');
        if (succeeded !== undefined) {
            id = this.safeString(succeeded, 0);
            if (id === undefined) {
                throw new errors.InvalidOrder(this.id + ' cancelOrder() failed to cancel ' + symbol + ' order id ' + id);
            }
        }
        else {
            const result = this.safeValue(data, 'result');
            if (!result) {
                throw new errors.InvalidOrder(this.id + ' cancelOrder() ' + symbol + ' order id ' + id + ' is filled or canceled');
            }
        }
        const order = this.safeOrder({ 'id': id, 'symbol': market['symbol'], 'info': {} }, market);
        return order;
    }
    /**
     * @method
     * @name bitmart#cancelOrders
     * @description cancel multiple orders
     * @see https://developer-pro.bitmart.com/en/spot/#cancel-batch-order-v4-signed
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' cancelOrders() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const clientOrderIds = this.safeList(params, 'clientOrderIds');
        params = this.omit(params, ['clientOrderIds']);
        const request = {
            'symbol': market['id'],
        };
        if (clientOrderIds !== undefined) {
            request['clientOrderIds'] = clientOrderIds;
        }
        else {
            request['orderIds'] = ids;
        }
        const response = await this.privatePostSpotV4CancelOrders(this.extend(request, params));
        //
        //  {
        //      "message": "OK",
        //      "code": 1000,
        //      "trace": "c4edbce860164203954f7c3c81d60fc6.309.17022669632770001",
        //      "data": {
        //        "successIds": [
        //          "213055379155243012"
        //        ],
        //        "failIds": [],
        //        "totalCount": 1,
        //        "successCount": 1,
        //        "failedCount": 0
        //      }
        //  }
        //
        const data = this.safeDict(response, 'data', {});
        const allOrders = [];
        const successIds = this.safeList(data, 'successIds', []);
        for (let i = 0; i < successIds.length; i++) {
            const id = successIds[i];
            allOrders.push(this.safeOrder({ 'id': id, 'status': 'canceled' }, market));
        }
        const failIds = this.safeList(data, 'failIds', []);
        for (let i = 0; i < failIds.length; i++) {
            const id = failIds[i];
            allOrders.push(this.safeOrder({ 'id': id, 'status': 'failed' }, market));
        }
        return allOrders;
    }
    /**
     * @method
     * @name bitmart#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://developer-pro.bitmart.com/en/spot/#cancel-all-orders
     * @see https://developer-pro.bitmart.com/en/spot/#new-batch-order-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-all-orders-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#cancel-all-orders-signed
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] *spot only* 'buy' or 'sell'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let response = undefined;
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        if (type === 'spot') {
            response = await this.privatePostSpotV4CancelAll(this.extend(request, params));
        }
        else if (type === 'swap') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
            }
            response = await this.privatePostContractPrivateCancelOrders(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {}
        //     }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "trace": "7f9c94e10f9d4513bc08a7bfc2a5559a.70.16954131323145323"
        //     }
        //
        return response;
    }
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrdersByStatus() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' fetchOrdersByStatus() does not support ' + market['type'] + ' orders, only spot orders are accepted');
        }
        const request = {
            'symbol': market['id'],
            'offset': 1,
            'N': 100, // max limit is 100
        };
        if (status === 'open') {
            request['status'] = 9;
        }
        else if (status === 'closed') {
            request['status'] = 6;
        }
        else if (status === 'canceled') {
            request['status'] = 8;
        }
        else {
            request['status'] = status;
        }
        const response = await this.privateGetSpotV3Orders(this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"70e7d427-7436-4fb8-8cdd-97e1f5eadbe9",
        //         "data":{
        //             "current_page":1,
        //             "orders":[
        //                 {
        //                     "order_id":2147601241,
        //                     "symbol":"BTC_USDT",
        //                     "create_time":1591099963000,
        //                     "side":"sell",
        //                     "type":"limit",
        //                     "price":"9000.00",
        //                     "price_avg":"0.00",
        //                     "size":"1.00000",
        //                     "notional":"9000.00000000",
        //                     "filled_notional":"0.00000000",
        //                     "filled_size":"0.00000",
        //                     "status":"4"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const orders = this.safeList(data, 'orders', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchOpenOrders
     * @see https://developer-pro.bitmart.com/en/spot/#current-open-orders-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-all-open-orders-keyed
     * @see https://developer-pro.bitmart.com/en/futures/#get-all-current-plan-orders-keyed
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.marginMode] *spot* whether to fetch trades for margin orders or spot orders, defaults to spot orders (only isolated margin orders are supported)
     * @param {int} [params.until] *spot* the latest time in ms to fetch orders for
     * @param {string} [params.type] *swap* order type, 'limit' or 'market'
     * @param {string} [params.order_state] *swap* the order state, 'all' or 'partially_filled', default is 'all'
     * @param {string} [params.orderType] *swap only* 'limit', 'market', or 'trailing'
     * @param {boolean} [params.trailing] *swap only* set to true if you want to fetch trailing orders
     * @param {boolean} [params.trigger] *swap only* set to true if you want to fetch trigger orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        let response = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        if (type === 'spot') {
            if (limit !== undefined) {
                request['limit'] = Math.min(limit, 200);
            }
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchOpenOrders', params);
            if (marginMode === 'isolated') {
                request['orderMode'] = 'iso_margin';
            }
            if (since !== undefined) {
                request['startTime'] = since;
            }
            const until = this.safeInteger2(params, 'until', 'endTime');
            if (until !== undefined) {
                params = this.omit(params, ['endTime']);
                request['endTime'] = until;
            }
            response = await this.privatePostSpotV4QueryOpenOrders(this.extend(request, params));
        }
        else if (type === 'swap') {
            if (limit !== undefined) {
                request['limit'] = Math.min(limit, 100);
            }
            const isTrigger = this.safeBool2(params, 'stop', 'trigger');
            params = this.omit(params, ['stop', 'trigger']);
            if (isTrigger) {
                response = await this.privateGetContractPrivateCurrentPlanOrder(this.extend(request, params));
            }
            else {
                const trailing = this.safeBool(params, 'trailing', false);
                let orderType = this.safeString(params, 'orderType');
                params = this.omit(params, ['orderType', 'trailing']);
                if (trailing) {
                    orderType = 'trailing';
                }
                if (orderType !== undefined) {
                    request['type'] = orderType;
                }
                response = await this.privateGetContractPrivateGetOpenOrders(this.extend(request, params));
            }
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchOpenOrders() does not support ' + type + ' orders, only spot and swap orders are accepted');
        }
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "data": [
        //             {
        //                 "orderId": "183299373022163211",
        //                 "clientOrderId": "183299373022163211",
        //                 "symbol": "BTC_USDT",
        //                 "side": "buy",
        //                 "orderMode": "spot",
        //                 "type": "limit",
        //                 "state": "new",
        //                 "price": "25000.00",
        //                 "priceAvg": "0.00",
        //                 "size": "0.00020",
        //                 "filledSize": "0.00000",
        //                 "notional": "5.00000000",
        //                 "filledNotional": "0.00000000",
        //                 "createTime": 1695703703338,
        //                 "updateTime": 1695703703359
        //             }
        //         ],
        //         "trace": "15f11d48e3234c81a2e786cr2e7a38e6.71.16957022303515933"
        //     }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "order_id": "230935812485489",
        //                 "client_order_id": "",
        //                 "price": "24000",
        //                 "size": "1",
        //                 "symbol": "BTCUSDT",
        //                 "state": 2,
        //                 "side": 1,
        //                 "type": "limit",
        //                 "leverage": "10",
        //                 "open_type": "isolated",
        //                 "deal_avg_price": "0",
        //                 "deal_size": "0",
        //                 "create_time": 1695702258629,
        //                 "update_time": 1695702258642
        //             }
        //         ],
        //         "trace": "7f9d94g10f9d4513bc08a7rfc3a5559a.71.16957022303515933"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchClosedOrders
     * @see https://developer-pro.bitmart.com/en/spot/#account-orders-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-history-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-order-history-keyed
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {string} [params.marginMode] *spot only* 'cross' or 'isolated', for margin trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchClosedOrders', market, params);
        if (type !== 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchClosedOrders() requires a symbol argument');
            }
        }
        if (since !== undefined) {
            const startTimeKey = (type === 'spot') ? 'startTime' : 'start_time';
            request[startTimeKey] = since;
        }
        const endTimeKey = (type === 'spot') ? 'endTime' : 'end_time';
        const until = this.safeInteger2(params, 'until', endTimeKey);
        if (until !== undefined) {
            params = this.omit(params, ['until']);
            request[endTimeKey] = until;
        }
        let response = undefined;
        if (type === 'spot') {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchClosedOrders', params);
            if (marginMode === 'isolated') {
                request['orderMode'] = 'iso_margin';
            }
            response = await this.privatePostSpotV4QueryHistoryOrders(this.extend(request, params));
        }
        else {
            response = await this.privateGetContractPrivateOrderHistory(this.extend(request, params));
        }
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus('canceled', symbol, since, limit, params);
    }
    /**
     * @method
     * @name bitmart#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://developer-pro.bitmart.com/en/spot/#query-order-by-id-v4-signed
     * @see https://developer-pro.bitmart.com/en/spot/#query-order-by-clientorderid-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-detail-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-order-detail-keyed
     * @param {string} id the id of the order
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] *spot* fetch the order by client order id instead of order id
     * @param {string} [params.orderType] *swap only* 'limit', 'market', 'liquidate', 'bankruptcy', 'adl' or 'trailing'
     * @param {boolean} [params.trailing] *swap only* set to true if you want to fetch a trailing order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let type = undefined;
        let market = undefined;
        let response = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [type, params] = this.handleMarketTypeAndParams('fetchOrder', market, params);
        if (type === 'spot') {
            const clientOrderId = this.safeString(params, 'clientOrderId');
            if (!clientOrderId) {
                request['orderId'] = id;
            }
            if (clientOrderId !== undefined) {
                response = await this.privatePostSpotV4QueryClientOrder(this.extend(request, params));
            }
            else {
                response = await this.privatePostSpotV4QueryOrder(this.extend(request, params));
            }
        }
        else if (type === 'swap') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
            }
            const trailing = this.safeBool(params, 'trailing', false);
            let orderType = this.safeString(params, 'orderType');
            params = this.omit(params, ['orderType', 'trailing']);
            if (trailing) {
                orderType = 'trailing';
            }
            if (orderType !== undefined) {
                request['type'] = orderType;
            }
            request['symbol'] = market['id'];
            request['order_id'] = id;
            response = await this.privateGetContractPrivateOrder(this.extend(request, params));
        }
        //
        // spot
        //
        //     {
        //         "code": 1000,
        //         "message": "success",
        //         "data": {
        //             "orderId": "183347420821295423",
        //             "clientOrderId": "183347420821295423",
        //             "symbol": "BTC_USDT",
        //             "side": "buy",
        //             "orderMode": "spot",
        //             "type": "limit",
        //             "state": "new",
        //             "price": "24000.00",
        //             "priceAvg": "0.00",
        //             "size": "0.00022",
        //             "filledSize": "0.00000",
        //             "notional": "5.28000000",
        //             "filledNotional": "0.00000000",
        //             "createTime": 1695783014734,
        //             "updateTime": 1695783014762
        //         },
        //         "trace": "ce3e6422c8b44d5fag855348a68693ed.63.14957831547451715"
        //     }
        //
        // swap
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": {
        //             "order_id": "230927283405028",
        //             "client_order_id": "",
        //             "price": "23000",
        //             "size": "1",
        //             "symbol": "BTCUSDT",
        //             "state": 2,
        //             "side": 1,
        //             "type": "limit",
        //             "leverage": "10",
        //             "open_type": "isolated",
        //             "deal_avg_price": "0",
        //             "deal_size": "0",
        //             "create_time": 1695783433600,
        //             "update_time": 1695783433613
        //         },
        //         "trace": "4cad855075664097af6ba5257c47605d.63.14957831547451715"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name bitmart#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://developer-pro.bitmart.com/en/spot/#deposit-address-keyed
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        let network = undefined;
        [network, params] = this.handleNetworkCodeAndParams(params);
        const request = {
            'currency': this.getCurrencyIdFromCodeAndNetwork(code, network),
        };
        const response = await this.privateGetAccountV1DepositAddress(this.extend(request, params));
        //
        //    {
        //        "message": "OK",
        //        "code": 1000,
        //        "trace": "0e6edd79-f77f-4251-abe5-83ba75d06c1a",
        //        "data": {
        //            currency: 'ETH',
        //            chain: 'Ethereum',
        //            address: '0x99B5EEc2C520f86F0F62F05820d28D05D36EccCf',
        //            address_memo: ''
        //        }
        //    }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        currency: 'ETH',
        //        chain: 'Ethereum',
        //        address: '0x99B5EEc2C520f86F0F62F05820d28D05D36EccCf',
        //        address_memo: ''
        //    }
        //
        let currencyId = this.safeString(depositAddress, 'currency');
        let network = this.safeString(depositAddress, 'chain');
        if (currencyId.indexOf('NFT') < 0) {
            const parts = currencyId.split('-');
            currencyId = this.safeString(parts, 0);
            const secondPart = this.safeString(parts, 1);
            if (secondPart !== undefined) {
                network = secondPart;
            }
        }
        const address = this.safeString(depositAddress, 'address');
        currency = this.safeCurrency(currencyId, currency);
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': this.safeString(currency, 'code'),
            'network': this.networkIdToCode(network),
            'address': address,
            'tag': this.safeString(depositAddress, 'address_memo'),
        };
    }
    /**
     * @method
     * @name bitmart#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network name for this withdrawal
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        let network = undefined;
        [network, params] = this.handleNetworkCodeAndParams(params);
        const request = {
            'currency': this.getCurrencyIdFromCodeAndNetwork(code, network),
            'amount': amount,
            'destination': 'To Digital Address',
            'address': address,
        };
        if (tag !== undefined) {
            request['address_memo'] = tag;
        }
        const response = await this.privatePostAccountV1WithdrawApply(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "trace":"886fb6ae-456b-4654-b4e0-d681ac05cea1",
        //         "message": "OK",
        //         "data": {
        //             "withdraw_id": "121212"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const transaction = this.parseTransaction(data, currency);
        return this.extend(transaction, {
            'code': code,
            'address': address,
            'tag': tag,
        });
    }
    async fetchTransactionsByType(type, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (limit === undefined) {
            limit = 50; // max 50
        }
        const request = {
            'operation_type': type,
            'offset': 1,
            'N': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetAccountV2DepositWithdrawHistory(this.extend(request, params));
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"142bf92a-fc50-4689-92b6-590886f90b97",
        //         "data":{
        //             "records":[
        //                 {
        //                     "withdraw_id":"1679952",
        //                     "deposit_id":"",
        //                     "operation_type":"withdraw",
        //                     "currency":"BMX",
        //                     "apply_time":1588867374000,
        //                     "arrival_amount":"59.000000000000",
        //                     "fee":"1.000000000000",
        //                     "status":0,
        //                     "address":"0xe57b69a8776b37860407965B73cdFFBDFe668Bb5",
        //                     "address_memo":"",
        //                     "tx_id":""
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const records = this.safeList(data, 'records', []);
        return this.parseTransactions(records, currency, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchDeposit
     * @description fetch information on a deposit
     * @param {string} id deposit id
     * @param {string} code not used by bitmart fetchDeposit ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposit(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'id': id,
        };
        const response = await this.privateGetAccountV1DepositWithdrawDetail(this.extend(request, params));
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"f7f74924-14da-42a6-b7f2-d3799dd9a612",
        //         "data":{
        //             "record":{
        //                 "withdraw_id":"",
        //                 "deposit_id":"1679952",
        //                 "operation_type":"deposit",
        //                 "currency":"BMX",
        //                 "apply_time":1588867374000,
        //                 "arrival_amount":"59.000000000000",
        //                 "fee":"1.000000000000",
        //                 "status":0,
        //                 "address":"0xe57b69a8776b37860407965B73cdFFBDFe668Bb5",
        //                 "address_memo":"",
        //                 "tx_id":""
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const record = this.safeDict(data, 'record', {});
        return this.parseTransaction(record);
    }
    /**
     * @method
     * @name bitmart#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType('deposit', code, since, limit, params);
    }
    /**
     * @method
     * @name bitmart#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @param {string} id withdrawal id
     * @param {string} code not used by bitmart.fetchWithdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawal(id, code = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'id': id,
        };
        const response = await this.privateGetAccountV1DepositWithdrawDetail(this.extend(request, params));
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"f7f74924-14da-42a6-b7f2-d3799dd9a612",
        //         "data":{
        //             "record":{
        //                 "withdraw_id":"1679952",
        //                 "deposit_id":"",
        //                 "operation_type":"withdraw",
        //                 "currency":"BMX",
        //                 "apply_time":1588867374000,
        //                 "arrival_amount":"59.000000000000",
        //                 "fee":"1.000000000000",
        //                 "status":0,
        //                 "address":"0xe57b69a8776b37860407965B73cdFFBDFe668Bb5",
        //                 "address_memo":"",
        //                 "tx_id":""
        //             }
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const record = this.safeDict(data, 'record', {});
        return this.parseTransaction(record);
    }
    /**
     * @method
     * @name bitmart#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType('withdraw', code, since, limit, params);
    }
    parseTransactionStatus(status) {
        const statuses = {
            '0': 'pending',
            '1': 'pending',
            '2': 'pending',
            '3': 'ok',
            '4': 'canceled',
            '5': 'failed', // Fail
        };
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "withdraw_id": "121212"
        //     }
        //
        // fetchDeposits, fetchWithdrawals, fetchWithdrawal
        //
        //     {
        //         "withdraw_id":"1679952",
        //         "deposit_id":"",
        //         "operation_type":"withdraw",
        //         "currency":"BMX",
        //         "apply_time":1588867374000,
        //         "arrival_amount":"59.000000000000",
        //         "fee":"1.000000000000",
        //         "status":0,
        //         "address":"0xe57b69a8776b37860407965B73cdFFBDFe668Bb5",
        //         "address_memo":"",
        //         "tx_id":""
        //     }
        //
        let id = undefined;
        const withdrawId = this.safeString(transaction, 'withdraw_id');
        const depositId = this.safeString(transaction, 'deposit_id');
        let type = undefined;
        if ((withdrawId !== undefined) && (withdrawId !== '')) {
            type = 'withdraw';
            id = withdrawId;
        }
        else if ((depositId !== undefined) && (depositId !== '')) {
            type = 'deposit';
            id = depositId;
        }
        const amount = this.safeNumber(transaction, 'arrival_amount');
        const timestamp = this.safeInteger(transaction, 'apply_time');
        let currencyId = this.safeString(transaction, 'currency');
        let networkId = undefined;
        if (currencyId.indexOf('NFT') < 0) {
            const parts = currencyId.split('-');
            currencyId = this.safeString(parts, 0);
            networkId = this.safeString(parts, 1);
        }
        const code = this.safeCurrencyCode(currencyId, currency);
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const feeCost = this.safeNumber(transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const txid = this.safeString(transaction, 'tx_id');
        const address = this.safeString(transaction, 'address');
        const tag = this.safeString(transaction, 'address_memo');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'network': this.networkIdToCode(networkId),
            'address': address,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'internal': undefined,
            'comment': undefined,
            'timestamp': (timestamp !== 0) ? timestamp : undefined,
            'datetime': (timestamp !== 0) ? this.iso8601(timestamp) : undefined,
            'fee': fee,
        };
    }
    /**
     * @method
     * @name bitmart#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://developer-pro.bitmart.com/en/spot/#margin-repay-isolated
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {string} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const currency = this.currency(code);
        const request = {
            'symbol': market['id'],
            'currency': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.privatePostSpotV1MarginIsolatedRepay(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "b0a60b4c-e986-4b54-a190-8f7c05ddf685",
        //         "data": {
        //             "repay_id": "2afcc16d99bd4707818c5a355dc89bed"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const transaction = this.parseMarginLoan(data, currency);
        return this.extend(transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }
    /**
     * @method
     * @name bitmart#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://developer-pro.bitmart.com/en/spot/#margin-borrow-isolated
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to borrow
     * @param {string} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const currency = this.currency(code);
        const request = {
            'symbol': market['id'],
            'currency': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.privatePostSpotV1MarginIsolatedBorrow(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "e6fda683-181e-4e78-ac9c-b27c4c8ba035",
        //         "data": {
        //             "borrow_id": "629a7177a4ed4cf09869c6a4343b788c"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const transaction = this.parseMarginLoan(data, currency);
        return this.extend(transaction, {
            'amount': amount,
            'symbol': symbol,
        });
    }
    parseMarginLoan(info, currency = undefined) {
        //
        // borrowMargin
        //
        //     {
        //         "borrow_id": "629a7177a4ed4cf09869c6a4343b788c",
        //     }
        //
        // repayMargin
        //
        //     {
        //         "repay_id": "2afcc16d99bd4707818c5a355dc89bed",
        //     }
        //
        return {
            'id': this.safeString2(info, 'borrow_id', 'repay_id'),
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    /**
     * @method
     * @name bitmart#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://developer-pro.bitmart.com/en/spot/#get-trading-pair-borrowing-rate-and-amount-keyed
     * @param {string} symbol unified symbol of the market to fetch the borrow rate for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [isolated borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#isolated-borrow-rate-structure}
     */
    async fetchIsolatedBorrowRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetSpotV1MarginIsolatedPairs(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "0985a130-a5ae-4fc1-863f-4704e214f585",
        //         "data": {
        //             "symbols": [
        //                 {
        //                     "symbol": "BTC_USDT",
        //                     "max_leverage": "5",
        //                     "symbol_enabled": true,
        //                     "base": {
        //                         "currency": "BTC",
        //                         "daily_interest": "0.00055000",
        //                         "hourly_interest": "0.00002291",
        //                         "max_borrow_amount": "2.00000000",
        //                         "min_borrow_amount": "0.00000001",
        //                         "borrowable_amount": "0.00670810"
        //                     },
        //                     "quote": {
        //                         "currency": "USDT",
        //                         "daily_interest": "0.00055000",
        //                         "hourly_interest": "0.00002291",
        //                         "max_borrow_amount": "50000.00000000",
        //                         "min_borrow_amount": "0.00000001",
        //                         "borrowable_amount": "135.12575038"
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const symbols = this.safeList(data, 'symbols', []);
        const borrowRate = this.safeDict(symbols, 0, []);
        return this.parseIsolatedBorrowRate(borrowRate, market);
    }
    parseIsolatedBorrowRate(info, market = undefined) {
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "max_leverage": "5",
        //         "symbol_enabled": true,
        //         "base": {
        //             "currency": "BTC",
        //             "daily_interest": "0.00055000",
        //             "hourly_interest": "0.00002291",
        //             "max_borrow_amount": "2.00000000",
        //             "min_borrow_amount": "0.00000001",
        //             "borrowable_amount": "0.00670810"
        //         },
        //         "quote": {
        //             "currency": "USDT",
        //             "daily_interest": "0.00055000",
        //             "hourly_interest": "0.00002291",
        //             "max_borrow_amount": "50000.00000000",
        //             "min_borrow_amount": "0.00000001",
        //             "borrowable_amount": "135.12575038"
        //         }
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const baseData = this.safeDict(info, 'base', {});
        const quoteData = this.safeDict(info, 'quote', {});
        const baseId = this.safeString(baseData, 'currency');
        const quoteId = this.safeString(quoteData, 'currency');
        return {
            'symbol': symbol,
            'base': this.safeCurrencyCode(baseId),
            'baseRate': this.safeNumber(baseData, 'hourly_interest'),
            'quote': this.safeCurrencyCode(quoteId),
            'quoteRate': this.safeNumber(quoteData, 'hourly_interest'),
            'period': 3600000,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    /**
     * @method
     * @name bitmart#fetchIsolatedBorrowRates
     * @description fetch the borrow interest rates of all currencies, currently only works for isolated margin
     * @see https://developer-pro.bitmart.com/en/spot/#get-trading-pair-borrowing-rate-and-amount-keyed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [isolated borrow rate structures]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    async fetchIsolatedBorrowRates(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetSpotV1MarginIsolatedPairs(params);
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "0985a130-a5ae-4fc1-863f-4704e214f585",
        //         "data": {
        //             "symbols": [
        //                 {
        //                     "symbol": "BTC_USDT",
        //                     "max_leverage": "5",
        //                     "symbol_enabled": true,
        //                     "base": {
        //                         "currency": "BTC",
        //                         "daily_interest": "0.00055000",
        //                         "hourly_interest": "0.00002291",
        //                         "max_borrow_amount": "2.00000000",
        //                         "min_borrow_amount": "0.00000001",
        //                         "borrowable_amount": "0.00670810"
        //                     },
        //                     "quote": {
        //                         "currency": "USDT",
        //                         "daily_interest": "0.00055000",
        //                         "hourly_interest": "0.00002291",
        //                         "max_borrow_amount": "50000.00000000",
        //                         "min_borrow_amount": "0.00000001",
        //                         "borrowable_amount": "135.12575038"
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const symbols = this.safeList(data, 'symbols', []);
        return this.parseIsolatedBorrowRates(symbols);
    }
    /**
     * @method
     * @name bitmart#transfer
     * @description transfer currency internally between wallets on the same account, currently only supports transfer between spot and margin
     * @see https://developer-pro.bitmart.com/en/spot/#margin-asset-transfer-signed
     * @see https://developer-pro.bitmart.com/en/futures/#transfer-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#transfer-signed
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const amountToPrecision = this.currencyToPrecision(code, amount);
        const request = {
            'amount': amountToPrecision,
            'currency': currency['id'],
        };
        const fromId = this.convertTypeToAccount(fromAccount);
        const toId = this.convertTypeToAccount(toAccount);
        if (fromAccount === 'spot') {
            if (toAccount === 'margin') {
                request['side'] = 'in';
                request['symbol'] = toId;
            }
            else if (toAccount === 'swap') {
                request['type'] = 'spot_to_contract';
            }
        }
        else if (toAccount === 'spot') {
            if (fromAccount === 'margin') {
                request['side'] = 'out';
                request['symbol'] = fromId;
            }
            else if (fromAccount === 'swap') {
                request['type'] = 'contract_to_spot';
            }
        }
        else {
            throw new errors.ArgumentsRequired(this.id + ' transfer() requires either fromAccount or toAccount to be spot');
        }
        let response = undefined;
        if ((fromAccount === 'margin') || (toAccount === 'margin')) {
            response = await this.privatePostSpotV1MarginIsolatedTransfer(this.extend(request, params));
        }
        else if ((fromAccount === 'swap') || (toAccount === 'swap')) {
            response = await this.privatePostAccountV1TransferContract(this.extend(request, params));
        }
        //
        // margin
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "b26cecec-ef5a-47d9-9531-2bd3911d3d55",
        //         "data": {
        //             "transfer_id": "ca90d97a621e47d49774f19af6b029f5"
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "4cad858074667097ac6ba5257c57305d.68.16953302431189455",
        //         "data": {
        //             "currency": "USDT",
        //             "amount": "5"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.extend(this.parseTransfer(data, currency), {
            'status': this.parseTransferStatus(this.safeString2(response, 'code', 'message')),
        });
    }
    parseTransferStatus(status) {
        const statuses = {
            '1000': 'ok',
            'OK': 'ok',
            'FINISHED': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransferToAccount(type) {
        const types = {
            'contract_to_spot': 'spot',
            'spot_to_contract': 'swap',
        };
        return this.safeString(types, type, type);
    }
    parseTransferFromAccount(type) {
        const types = {
            'contract_to_spot': 'swap',
            'spot_to_contract': 'spot',
        };
        return this.safeString(types, type, type);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // margin
        //
        //     {
        //         "transfer_id": "ca90d97a621e47d49774f19af6b029f5"
        //     }
        //
        // swap
        //
        //     {
        //         "currency": "USDT",
        //         "amount": "5"
        //     }
        //
        // fetchTransfers
        //
        //     {
        //         "transfer_id": "902463535961567232",
        //         "currency": "USDT",
        //         "amount": "5",
        //         "type": "contract_to_spot",
        //         "state": "FINISHED",
        //         "timestamp": 1695330539565
        //     }
        //
        const currencyId = this.safeString(transfer, 'currency');
        const timestamp = this.safeInteger(transfer, 'timestamp');
        return {
            'id': this.safeString(transfer, 'transfer_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.parseTransferFromAccount(this.safeString(transfer, 'type')),
            'toAccount': this.parseTransferToAccount(this.safeString(transfer, 'type')),
            'status': this.parseTransferStatus(this.safeString(transfer, 'state')),
        };
    }
    /**
     * @method
     * @name bitmart#fetchTransfers
     * @description fetch a history of internal transfers made on an account, only transfers between spot and swap are supported
     * @see https://developer-pro.bitmart.com/en/futures/#get-transfer-list-signed
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] the required number of pages, default is 1, max is 1000
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (limit === undefined) {
            limit = 10;
        }
        const request = {
            'page': this.safeInteger(params, 'page', 1),
            'limit': limit, // default is 10, max is 100
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['time_start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until'); // unified in milliseconds
        const endTime = this.safeInteger(params, 'time_end', until); // exchange-specific in milliseconds
        params = this.omit(params, ['until']);
        if (endTime !== undefined) {
            request['time_end'] = endTime;
        }
        const response = await this.privatePostAccountV1TransferContractList(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "7f9d93e10f9g4513bc08a7btc2a5559a.69.16953325693032193",
        //         "data": {
        //             "records": [
        //                 {
        //                     "transfer_id": "902463535961567232",
        //                     "currency": "USDT",
        //                     "amount": "5",
        //                     "type": "contract_to_spot",
        //                     "state": "FINISHED",
        //                     "timestamp": 1695330539565
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const records = this.safeList(data, 'records', []);
        return this.parseTransfers(records, currency, since, limit);
    }
    /**
     * @method
     * @name bitmart#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://developer-pro.bitmart.com/en/spot/#get-borrow-record-isolated
     * @param {string} code unified currency code
     * @param {string} symbol unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchBorrowInterest() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['N'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        const response = await this.privateGetSpotV1MarginIsolatedBorrowRecord(this.extend(request, params));
        //
        //     {
        //         "message": "OK",
        //         "code": 1000,
        //         "trace": "8ea27a2a-4aba-49fa-961d-43a0137b0ef3",
        //         "data": {
        //             "records": [
        //                 {
        //                     "borrow_id": "1659045283903rNvJnuRTJNL5J53n",
        //                     "symbol": "BTC_USDT",
        //                     "currency": "USDT",
        //                     "borrow_amount": "100.00000000",
        //                     "daily_interest": "0.00055000",
        //                     "hourly_interest": "0.00002291",
        //                     "interest_amount": "0.00229166",
        //                     "create_time": 1659045284000
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const rows = this.safeList(data, 'records', []);
        const interest = this.parseBorrowInterests(rows, market);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        //
        //     {
        //         "borrow_id": "1657664327844Lk5eJJugXmdHHZoe",
        //         "symbol": "BTC_USDT",
        //         "currency": "USDT",
        //         "borrow_amount": "20.00000000",
        //         "daily_interest": "0.00055000",
        //         "hourly_interest": "0.00002291",
        //         "interest_amount": "0.00045833",
        //         "create_time": 1657664329000
        //     }
        //
        const marketId = this.safeString(info, 'symbol');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(info, 'create_time');
        return {
            'info': info,
            'symbol': this.safeString(market, 'symbol'),
            'currency': this.safeCurrencyCode(this.safeString(info, 'currency')),
            'interest': this.safeNumber(info, 'interest_amount'),
            'interestRate': this.safeNumber(info, 'hourly_interest'),
            'amountBorrowed': this.safeNumber(info, 'borrow_amount'),
            'marginMode': 'isolated',
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name bitmart#fetchOpenInterest
     * @description Retrieves the open interest of a currency
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-futures-openinterest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['contract']) {
            throw new errors.BadRequest(this.id + ' fetchOpenInterest() supports contract markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetContractPublicOpenInterest(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": {
        //             "timestamp": 1694657502415,
        //             "symbol": "BTCUSDT",
        //             "open_interest": "265231.721368593081729069",
        //             "open_interest_value": "7006353.83988919"
        //         },
        //         "trace": "7f9c94e10f9d4513bc08a7bfc2a5559a.72.16946575108274991"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOpenInterest(data, market);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //         "timestamp": 1694657502415,
        //         "symbol": "BTCUSDT",
        //         "open_interest": "265231.721368593081729069",
        //         "open_interest_value": "7006353.83988919"
        //     }
        //
        const timestamp = this.safeInteger(interest, 'timestamp');
        const id = this.safeString(interest, 'symbol');
        return this.safeOpenInterest({
            'symbol': this.safeSymbol(id, market),
            'openInterestAmount': this.safeNumber(interest, 'open_interest'),
            'openInterestValue': this.safeNumber(interest, 'open_interest_value'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    /**
     * @method
     * @name bitmart#setLeverage
     * @description set the level of leverage for a market
     * @see https://developer-pro.bitmart.com/en/futures/#submit-leverage-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-leverage-signed
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross'
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('setLeverage', params);
        this.checkRequiredArgument('setLeverage', marginMode, 'marginMode', ['isolated', 'cross']);
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' setLeverage() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage.toString(),
            'open_type': marginMode,
        };
        return await this.privatePostContractPrivateSubmitLeverage(this.extend(request, params));
    }
    /**
     * @method
     * @name bitmart#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetContractPublicFundingRate(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": {
        //             "timestamp": 1695184410697,
        //             "symbol": "BTCUSDT",
        //             "rate_value": "-0.00002614",
        //             "expected_rate": "-0.00002"
        //         },
        //         "trace": "4cad855074654097ac7ba5257c47305d.54.16951844206655589"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseFundingRate(data, market);
    }
    /**
     * @method
     * @name bitmart#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetContractPublicFundingRateHistory(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": {
        //             "list": [
        //                 {
        //                     "symbol": "BTCUSDT",
        //                     "funding_rate": "0.000091412174",
        //                     "funding_time": "1734336000000"
        //                 },
        //             ]
        //         },
        //         "trace": "fg73d949fgfdf6a40c8fc7f5ae6738.54.345345345345"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const result = this.safeList(data, 'list', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString(entry, 'symbol');
            const symbolInner = this.safeSymbol(marketId, market, '-', 'swap');
            const timestamp = this.safeInteger(entry, 'funding_time');
            rates.push({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber(entry, 'funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "timestamp": 1695184410697,
        //         "symbol": "BTCUSDT",
        //         "rate_value": "-0.00002614",
        //         "expected_rate": "-0.00002"
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const timestamp = this.safeInteger(contract, 'timestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market),
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': this.safeNumber(contract, 'expected_rate'),
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': this.safeNumber(contract, 'rate_value'),
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        };
    }
    /**
     * @method
     * @name bitmart#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://developer-pro.bitmart.com/en/futures/#get-current-position-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-risk-details-keyed
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.privateGetContractPrivatePosition(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "leverage": "10",
        //                 "timestamp": 1696392515269,
        //                 "current_fee": "0.0014250028",
        //                 "open_timestamp": 1696392256998,
        //                 "current_value": "27.4039",
        //                 "mark_price": "27.4039",
        //                 "position_value": "27.4079",
        //                 "position_cross": "3.75723474",
        //                 "maintenance_margin": "0.1370395",
        //                 "close_vol": "0",
        //                 "close_avg_price": "0",
        //                 "open_avg_price": "27407.9",
        //                 "entry_price": "27407.9",
        //                 "current_amount": "1",
        //                 "unrealized_value": "-0.004",
        //                 "realized_value": "-0.01644474",
        //                 "position_type": 1
        //             }
        //         ],
        //         "trace":"4cad855074664097ac5ba5257c47305d.67.16963925142065945"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parsePosition(first, market);
    }
    /**
     * @method
     * @name bitmart#fetchPositions
     * @description fetch all open contract positions
     * @see https://developer-pro.bitmart.com/en/futures/#get-current-position-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-risk-details-keyed
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let symbolsLength = undefined;
        if (symbols !== undefined) {
            symbolsLength = symbols.length;
            const first = this.safeString(symbols, 0);
            market = this.market(first);
        }
        const request = {};
        if (symbolsLength === 1) {
            // only supports symbols as undefined or sending one symbol
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetContractPrivatePosition(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "leverage": "10",
        //                 "timestamp": 1696392515269,
        //                 "current_fee": "0.0014250028",
        //                 "open_timestamp": 1696392256998,
        //                 "current_value": "27.4039",
        //                 "mark_price": "27.4039",
        //                 "position_value": "27.4079",
        //                 "position_cross": "3.75723474",
        //                 "maintenance_margin": "0.1370395",
        //                 "close_vol": "0",
        //                 "close_avg_price": "0",
        //                 "open_avg_price": "27407.9",
        //                 "entry_price": "27407.9",
        //                 "current_amount": "1",
        //                 "unrealized_value": "-0.004",
        //                 "realized_value": "-0.01644474",
        //                 "position_type": 1
        //             },
        //         ],
        //         "trace":"4cad855074664097ac5ba5257c47305d.67.16963925142065945"
        //     }
        //
        const positions = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < positions.length; i++) {
            result.push(this.parsePosition(positions[i]));
        }
        symbols = this.marketSymbols(symbols);
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "leverage": "10",
        //         "timestamp": 1696392515269,
        //         "current_fee": "0.0014250028",
        //         "open_timestamp": 1696392256998,
        //         "current_value": "27.4039",
        //         "mark_price": "27.4039",
        //         "position_value": "27.4079",
        //         "position_cross": "3.75723474",
        //         "maintenance_margin": "0.1370395",
        //         "close_vol": "0",
        //         "close_avg_price": "0",
        //         "open_avg_price": "27407.9",
        //         "entry_price": "27407.9",
        //         "current_amount": "1",
        //         "unrealized_value": "-0.004",
        //         "realized_value": "-0.01644474",
        //         "position_type": 1
        //     }
        //
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(position, 'timestamp');
        const side = this.safeInteger(position, 'position_type');
        const maintenanceMargin = this.safeString(position, 'maintenance_margin');
        const notional = this.safeString(position, 'current_value');
        const collateral = this.safeString(position, 'position_cross');
        const maintenanceMarginPercentage = Precise["default"].stringDiv(maintenanceMargin, notional);
        const marginRatio = Precise["default"].stringDiv(maintenanceMargin, collateral);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': undefined,
            'hedged': undefined,
            'side': (side === 1) ? 'long' : 'short',
            'contracts': this.safeNumber(position, 'current_amount'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'entryPrice': this.safeNumber(position, 'entry_price'),
            'markPrice': this.safeNumber(position, 'mark_price'),
            'lastPrice': undefined,
            'notional': this.parseNumber(notional),
            'leverage': this.safeNumber(position, 'leverage'),
            'collateral': this.parseNumber(collateral),
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': this.parseNumber(maintenanceMargin),
            'maintenanceMarginPercentage': this.parseNumber(maintenanceMarginPercentage),
            'unrealizedPnl': this.safeNumber(position, 'unrealized_value'),
            'realizedPnl': this.safeNumber(position, 'realized_value'),
            'liquidationPrice': undefined,
            'marginMode': undefined,
            'percentage': undefined,
            'marginRatio': this.parseNumber(marginRatio),
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    /**
     * @method
     * @name bitmart#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-history-keyed
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmart api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    async fetchMyLiquidations(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyLiquidations() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.NotSupported(this.id + ' fetchMyLiquidations() supports swap markets only');
        }
        let request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        const response = await this.privateGetContractPrivateOrderHistory(this.extend(request, params));
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "order_id": "231007865458273",
        //                 "client_order_id": "",
        //                 "price": "27407.9",
        //                 "size": "1",
        //                 "symbol": "BTCUSDT",
        //                 "state": 4,
        //                 "side": 3,
        //                 "type": "liquidate",
        //                 "leverage": "10",
        //                 "open_type": "isolated",
        //                 "deal_avg_price": "27422.6",
        //                 "deal_size": "1",
        //                 "create_time": 1696405864011,
        //                 "update_time": 1696405864045
        //             },
        //         ],
        //         "trace": "4cad855074664097ac6ba4257c47305d.71.16965658195443021"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const checkLiquidation = this.safeString(entry, 'type');
            if (checkLiquidation === 'liquidate') {
                result.push(entry);
            }
        }
        return this.parseLiquidations(result, market, since, limit);
    }
    parseLiquidation(liquidation, market = undefined) {
        //
        //     {
        //         "order_id": "231007865458273",
        //         "client_order_id": "",
        //         "price": "27407.9",
        //         "size": "1",
        //         "symbol": "BTCUSDT",
        //         "state": 4,
        //         "side": 3,
        //         "type": "market",
        //         "leverage": "10",
        //         "open_type": "isolated",
        //         "deal_avg_price": "27422.6",
        //         "deal_size": "1",
        //         "create_time": 1696405864011,
        //         "update_time": 1696405864045
        //     }
        //
        const marketId = this.safeString(liquidation, 'symbol');
        const timestamp = this.safeInteger(liquidation, 'update_time');
        const contractsString = this.safeString(liquidation, 'deal_size');
        const contractSizeString = this.safeString(market, 'contractSize');
        const priceString = this.safeString(liquidation, 'deal_avg_price');
        const baseValueString = Precise["default"].stringMul(contractsString, contractSizeString);
        const quoteValueString = Precise["default"].stringMul(baseValueString, priceString);
        return this.safeLiquidation({
            'info': liquidation,
            'symbol': this.safeSymbol(marketId, market),
            'contracts': this.parseNumber(contractsString),
            'contractSize': this.parseNumber(contractSizeString),
            'price': this.parseNumber(priceString),
            'baseValue': this.parseNumber(baseValueString),
            'quoteValue': this.parseNumber(quoteValueString),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        });
    }
    /**
     * @method
     * @name bitmart#editOrder
     * @description edits an open order
     * @see https://developer-pro.bitmart.com/en/futuresv2/#modify-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#modify-tp-sl-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#modify-preset-plan-order-signed
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.triggerPrice] *swap only* the price to trigger a stop order
     * @param {string} [params.stopLossPrice] *swap only* the price to trigger a stop-loss order
     * @param {string} [params.takeProfitPrice] *swap only* the price to trigger a take-profit order
     * @param {string} [params.stopLoss.triggerPrice] *swap only* the price to trigger a preset stop-loss order
     * @param {string} [params.takeProfit.triggerPrice] *swap only* the price to trigger a preset take-profit order
     * @param {string} [params.clientOrderId] client order id of the order
     * @param {int} [params.price_type] *swap only* 1: last price, 2: fair price, default is 1
     * @param {int} [params.plan_category] *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.NotSupported(this.id + ' editOrder() does not support ' + market['type'] + ' markets, only swap markets are supported');
        }
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const triggerPrice = this.safeStringN(params, ['triggerPrice', 'stopPrice', 'trigger_price']);
        const stopLoss = this.safeDict(params, 'stopLoss', {});
        const takeProfit = this.safeDict(params, 'takeProfit', {});
        const presetStopLoss = this.safeString(stopLoss, 'triggerPrice');
        const presetTakeProfit = this.safeString(takeProfit, 'triggerPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLoss = stopLossPrice !== undefined;
        const isTakeProfit = takeProfitPrice !== undefined;
        const isPresetStopLoss = presetStopLoss !== undefined;
        const isPresetTakeProfit = presetTakeProfit !== undefined;
        const request = {
            'symbol': market['id'],
        };
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params = this.omit(params, 'clientOrderId');
            request['client_order_id'] = clientOrderId;
        }
        if (id !== undefined) {
            request['order_id'] = id;
        }
        params = this.omit(params, ['triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'stopLoss', 'takeProfit']);
        let response = undefined;
        if (isTriggerOrder || isStopLoss || isTakeProfit) {
            request['price_type'] = this.safeInteger(params, 'price_type', 1);
            if (price !== undefined) {
                request['executive_price'] = this.priceToPrecision(symbol, price);
            }
        }
        if (isTriggerOrder) {
            request['type'] = type;
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            response = await this.privatePostContractPrivateModifyPlanOrder(this.extend(request, params));
            //
            //     {
            //         "code": 1000,
            //         "message": "Ok",
            //         "data": {
            //             "order_id": "3000023150003503"
            //         },
            //         "trace": "324523453245.108.1734567125596324575"
            //     }
            //
        }
        else if (isStopLoss || isTakeProfit) {
            request['category'] = type;
            if (isStopLoss) {
                request['trigger_price'] = this.priceToPrecision(symbol, stopLossPrice);
            }
            else {
                request['trigger_price'] = this.priceToPrecision(symbol, takeProfitPrice);
            }
            response = await this.privatePostContractPrivateModifyTpSlOrder(this.extend(request, params));
            //
            //     {
            //         "code": 1000,
            //         "message": "Ok",
            //         "data": {
            //             "order_id": "3000023150003480"
            //         },
            //         "trace": "23452345.104.1724536582682345459"
            //     }
            //
        }
        else if (isPresetStopLoss || isPresetTakeProfit) {
            if (isPresetStopLoss) {
                request['preset_stop_loss_price_type'] = this.safeInteger(params, 'price_type', 1);
                request['preset_stop_loss_price'] = this.priceToPrecision(symbol, presetStopLoss);
            }
            else {
                request['preset_take_profit_price_type'] = this.safeInteger(params, 'price_type', 1);
                request['preset_take_profit_price'] = this.priceToPrecision(symbol, presetTakeProfit);
            }
            response = await this.privatePostContractPrivateModifyPresetPlanOrder(this.extend(request, params));
            //
            //     {
            //         "code": 1000,
            //         "message": "Ok",
            //         "data": {
            //             "order_id": "3000023150003496"
            //         },
            //         "trace": "a5c3234534534a836bc476a203.123452.172716624359200197"
            //     }
            //
        }
        else {
            throw new errors.NotSupported(this.id + ' editOrder() only supports trigger, stop loss and take profit orders');
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name bitmart#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-transaction-history-keyed
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        let request = {};
        [request, params] = this.handleUntilOption('end_time', request, params);
        const transactionsRequest = this.fetchTransactionsRequest(0, undefined, since, limit, params);
        const response = await this.privateGetContractPrivateTransactionHistory(transactionsRequest);
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "time": "1734422402121",
        //                 "type": "Funding Fee",
        //                 "amount": "-0.00008253",
        //                 "asset": "USDT",
        //                 "symbol": "LTCUSDT",
        //                 "tran_id": "1734422402121",
        //                 "flow_type": 3
        //             },
        //         ],
        //         "trace": "4cd11f83c71egfhfgh842790f07241e.23.173442343427772866"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseLedger(data, currency, since, limit);
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        //     {
        //         "time": "1734422402121",
        //         "type": "Funding Fee",
        //         "amount": "-0.00008253",
        //         "asset": "USDT",
        //         "symbol": "LTCUSDT",
        //         "tran_id": "1734422402121",
        //         "flow_type": 3
        //     }
        //
        let amount = this.safeString(item, 'amount');
        let direction = undefined;
        if (Precise["default"].stringLe(amount, '0')) {
            direction = 'out';
            amount = Precise["default"].stringMul('-1', amount);
        }
        else {
            direction = 'in';
        }
        const currencyId = this.safeString(item, 'asset');
        currency = this.safeCurrency(currencyId, currency);
        const timestamp = this.safeInteger(item, 'time');
        const type = this.safeString(item, 'type');
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'tran_id'),
            'direction': direction,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': this.safeString(item, 'tradeId'),
            'type': this.parseLedgerEntryType(type),
            'currency': currency['code'],
            'amount': this.parseNumber(amount),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const ledgerType = {
            'Commission Fee': 'fee',
            'Funding Fee': 'fee',
            'Realized PNL': 'trade',
            'Transfer': 'transfer',
            'Liquidation Clearance': 'settlement',
        };
        return this.safeString(ledgerType, type, type);
    }
    fetchTransactionsRequest(flowType = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let request = {};
        if (flowType !== undefined) {
            request['flow_type'] = flowType;
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        return this.extend(request, params);
    }
    /**
     * @method
     * @name bitmart#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-transaction-history-keyed
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the starting timestamp in milliseconds
     * @param {int} [limit] the number of entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch funding history for
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let request = {};
        [request, params] = this.handleUntilOption('end_time', request, params);
        const transactionsRequest = this.fetchTransactionsRequest(3, symbol, since, limit, params);
        const response = await this.privateGetContractPrivateTransactionHistory(transactionsRequest);
        //
        //     {
        //         "code": 1000,
        //         "message": "Ok",
        //         "data": [
        //             {
        //                 "time": "1734422402121",
        //                 "type": "Funding Fee",
        //                 "amount": "-0.00008253",
        //                 "asset": "USDT",
        //                 "symbol": "LTCUSDT",
        //                 "tran_id": "1734422402121",
        //                 "flow_type": 3
        //             },
        //         ],
        //         "trace": "4cd11f83c71egfhfgh842790f07241e.23.173442343427772866"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseFundingHistories(data, market, since, limit);
    }
    parseFundingHistory(contract, market = undefined) {
        //
        //     {
        //         "time": "1734422402121",
        //         "type": "Funding Fee",
        //         "amount": "-0.00008253",
        //         "asset": "USDT",
        //         "symbol": "LTCUSDT",
        //         "tran_id": "1734422402121",
        //         "flow_type": 3
        //     }
        //
        const marketId = this.safeString(contract, 'symbol');
        const currencyId = this.safeString(contract, 'asset');
        const timestamp = this.safeInteger(contract, 'time');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
            'code': this.safeCurrencyCode(currencyId),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(contract, 'tran_id'),
            'amount': this.safeNumber(contract, 'amount'),
        };
    }
    parseFundingHistories(contracts, market = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < contracts.length; i++) {
            const contract = contracts[i];
            result.push(this.parseFundingHistory(contract, market));
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySinceLimit(sorted, since, limit);
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const parts = path.split('/');
        // to do: refactor api endpoints with spot/swap sections
        const category = this.safeString(parts, 0, 'spot');
        const market = (category === 'spot' || category === 'account') ? 'spot' : 'swap';
        const baseUrl = this.implodeHostname(this.urls['api'][market]);
        let url = baseUrl + '/' + this.implodeParams(path, params);
        const query = this.omit(params, this.extractParams(path));
        let queryString = '';
        const getOrDelete = (method === 'GET') || (method === 'DELETE');
        if (getOrDelete) {
            if (Object.keys(query).length) {
                queryString = this.urlencode(query);
                url += '?' + queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.nonce().toString();
            const brokerId = this.safeString(this.options, 'brokerId', 'CCXTxBitmart000');
            headers = {
                'X-BM-KEY': this.apiKey,
                'X-BM-TIMESTAMP': timestamp,
                'X-BM-BROKER-ID': brokerId,
                'Content-Type': 'application/json',
            };
            if (!getOrDelete) {
                body = this.json(query);
                queryString = body;
            }
            const auth = timestamp + '#' + this.uid + '#' + queryString;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            headers['X-BM-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        // spot
        //
        //     {"message":"Bad Request [to is empty]","code":50000,"trace":"f9d46e1b-4edb-4d07-a06e-4895fb2fc8fc","data":{}}
        //     {"message":"Bad Request [from is empty]","code":50000,"trace":"579986f7-c93a-4559-926b-06ba9fa79d76","data":{}}
        //     {"message":"Kline size over 500","code":50004,"trace":"d625caa8-e8ca-4bd2-b77c-958776965819","data":{}}
        //     {"message":"Balance not enough","code":50020,"trace":"7c709d6a-3292-462c-98c5-32362540aeef","data":{}}
        //     {"code":40012,"message":"You contract account available balance not enough.","trace":"..."}
        //
        // contract
        //
        //     {"errno":"OK","message":"INVALID_PARAMETER","code":49998,"trace":"eb5ebb54-23cd-4de2-9064-e090b6c3b2e3","data":null}
        //
        const message = this.safeStringLower(response, 'message');
        const isErrorMessage = (message !== undefined) && (message !== 'ok') && (message !== 'success');
        const errorCode = this.safeString(response, 'code');
        const isErrorCode = (errorCode !== undefined) && (errorCode !== '1000');
        if (isErrorCode || isErrorMessage) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], errorCode, feedback);
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
}

module.exports = bitmart;
