'use strict';

var coinex$1 = require('./abstract/coinex.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');
var md5 = require('./static_dependencies/noble-hashes/md5.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class coinex
 * @augments Exchange
 */
class coinex extends coinex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'coinex',
            'name': 'CoinEx',
            'version': 'v2',
            'countries': ['CN'],
            // IP ratelimit is 400 requests per second
            // rateLimit = 1000ms / 400 = 2.5
            // 200 per 2 seconds => 100 per second => weight = 4
            // 120 per 2 seconds => 60 per second => weight = 6.667
            // 80 per 2 seconds => 40 per second => weight = 10
            // 60 per 2 seconds => 30 per second => weight = 13.334
            // 40 per 2 seconds => 20 per second => weight = 20
            // 20 per 2 seconds => 10 per second => weight = 40
            // v1 is per 2 seconds and v2 is per 1 second
            'rateLimit': 2.5,
            'pro': true,
            'certified': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': true,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
                'createStopLossOrder': true,
                'createStopOrder': true,
                'createTakeProfitOrder': true,
                'createTriggerOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowInterest': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': true,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': true,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': true,
                'fetchLeverages': false,
                'fetchLeverageTiers': true,
                'fetchMarginAdjustmentHistory': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositionHistory': true,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg',
                'api': {
                    'public': 'https://api.coinex.com',
                    'private': 'https://api.coinex.com',
                    'perpetualPublic': 'https://api.coinex.com/perpetual',
                    'perpetualPrivate': 'https://api.coinex.com/perpetual',
                },
                'www': 'https://www.coinex.com',
                'doc': 'https://docs.coinex.com/api/v2',
                'fees': 'https://www.coinex.com/fees',
                'referral': 'https://www.coinex.com/register?refer_code=yw5fz',
            },
            'api': {
                'v1': {
                    'public': {
                        'get': {
                            'amm/market': 1,
                            'common/currency/rate': 1,
                            'common/asset/config': 1,
                            'common/maintain/info': 1,
                            'common/temp-maintain/info': 1,
                            'margin/market': 1,
                            'market/info': 1,
                            'market/list': 1,
                            'market/ticker': 1,
                            'market/ticker/all': 1,
                            'market/depth': 1,
                            'market/deals': 1,
                            'market/kline': 1,
                            'market/detail': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'account/amm/balance': 40,
                            'account/investment/balance': 40,
                            'account/balance/history': 40,
                            'account/market/fee': 40,
                            'balance/coin/deposit': 40,
                            'balance/coin/withdraw': 40,
                            'balance/info': 40,
                            'balance/deposit/address/{coin_type}': 40,
                            'contract/transfer/history': 40,
                            'credit/info': 40,
                            'credit/balance': 40,
                            'investment/transfer/history': 40,
                            'margin/account': 1,
                            'margin/config': 1,
                            'margin/loan/history': 40,
                            'margin/transfer/history': 40,
                            'order/deals': 40,
                            'order/finished': 40,
                            'order/pending': 8,
                            'order/status': 8,
                            'order/status/batch': 8,
                            'order/user/deals': 40,
                            'order/stop/finished': 40,
                            'order/stop/pending': 8,
                            'order/user/trade/fee': 1,
                            'order/market/trade/info': 1,
                            'sub_account/balance': 1,
                            'sub_account/transfer/history': 40,
                            'sub_account/auth/api': 40,
                            'sub_account/auth/api/{user_auth_id}': 40,
                        },
                        'post': {
                            'balance/coin/withdraw': 40,
                            'contract/balance/transfer': 40,
                            'margin/flat': 40,
                            'margin/loan': 40,
                            'margin/transfer': 40,
                            'order/limit/batch': 40,
                            'order/ioc': 13.334,
                            'order/limit': 13.334,
                            'order/market': 13.334,
                            'order/modify': 13.334,
                            'order/stop/limit': 13.334,
                            'order/stop/market': 13.334,
                            'order/stop/modify': 13.334,
                            'sub_account/transfer': 40,
                            'sub_account/register': 1,
                            'sub_account/unfrozen': 40,
                            'sub_account/frozen': 40,
                            'sub_account/auth/api': 40,
                        },
                        'put': {
                            'balance/deposit/address/{coin_type}': 40,
                            'sub_account/unfrozen': 40,
                            'sub_account/frozen': 40,
                            'sub_account/auth/api/{user_auth_id}': 40,
                            'v1/account/settings': 40,
                        },
                        'delete': {
                            'balance/coin/withdraw': 40,
                            'order/pending/batch': 40,
                            'order/pending': 13.334,
                            'order/stop/pending': 40,
                            'order/stop/pending/{id}': 13.334,
                            'order/pending/by_client_id': 40,
                            'order/stop/pending/by_client_id': 40,
                            'sub_account/auth/api/{user_auth_id}': 40,
                            'sub_account/authorize/{id}': 40,
                        },
                    },
                    'perpetualPublic': {
                        'get': {
                            'ping': 1,
                            'time': 1,
                            'market/list': 1,
                            'market/limit_config': 1,
                            'market/ticker': 1,
                            'market/ticker/all': 1,
                            'market/depth': 1,
                            'market/deals': 1,
                            'market/funding_history': 1,
                            'market/kline': 1,
                        },
                    },
                    'perpetualPrivate': {
                        'get': {
                            'market/user_deals': 1,
                            'asset/query': 40,
                            'order/pending': 8,
                            'order/finished': 40,
                            'order/stop_finished': 40,
                            'order/stop_pending': 8,
                            'order/status': 8,
                            'order/stop_status': 8,
                            'position/finished': 40,
                            'position/pending': 40,
                            'position/funding': 40,
                            'position/adl_history': 40,
                            'market/preference': 40,
                            'position/margin_history': 40,
                            'position/settle_history': 40,
                        },
                        'post': {
                            'market/adjust_leverage': 1,
                            'market/position_expect': 1,
                            'order/put_limit': 20,
                            'order/put_market': 20,
                            'order/put_stop_limit': 20,
                            'order/put_stop_market': 20,
                            'order/modify': 20,
                            'order/modify_stop': 20,
                            'order/cancel': 20,
                            'order/cancel_all': 40,
                            'order/cancel_batch': 40,
                            'order/cancel_stop': 20,
                            'order/cancel_stop_all': 40,
                            'order/close_limit': 20,
                            'order/close_market': 20,
                            'position/adjust_margin': 20,
                            'position/stop_loss': 20,
                            'position/take_profit': 20,
                            'position/market_close': 20,
                            'order/cancel/by_client_id': 20,
                            'order/cancel_stop/by_client_id': 20,
                            'market/preference': 20,
                        },
                    },
                },
                'v2': {
                    'public': {
                        'get': {
                            'maintain/info': 1,
                            'ping': 1,
                            'time': 1,
                            'spot/market': 1,
                            'spot/ticker': 1,
                            'spot/depth': 1,
                            'spot/deals': 1,
                            'spot/kline': 1,
                            'spot/index': 1,
                            'futures/market': 1,
                            'futures/ticker': 1,
                            'futures/depth': 1,
                            'futures/deals': 1,
                            'futures/kline': 1,
                            'futures/index': 1,
                            'futures/funding-rate': 1,
                            'futures/funding-rate-history': 1,
                            'futures/position-level': 1,
                            'futures/liquidation-history': 1,
                            'futures/basis-history': 1,
                            'assets/deposit-withdraw-config': 1,
                            'assets/all-deposit-withdraw-config': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'account/subs': 1,
                            'account/subs/api-detail': 40,
                            'account/subs/info': 1,
                            'account/subs/api': 40,
                            'account/subs/transfer-history': 40,
                            'account/subs/spot-balance': 1,
                            'account/trade-fee-rate': 40,
                            'assets/spot/balance': 40,
                            'assets/futures/balance': 40,
                            'assets/margin/balance': 1,
                            'assets/financial/balance': 40,
                            'assets/amm/liquidity': 40,
                            'assets/credit/info': 40,
                            'assets/margin/borrow-history': 40,
                            'assets/margin/interest-limit': 1,
                            'assets/deposit-address': 40,
                            'assets/deposit-history': 40,
                            'assets/withdraw': 40,
                            'assets/transfer-history': 40,
                            'spot/order-status': 8,
                            'spot/batch-order-status': 8,
                            'spot/pending-order': 8,
                            'spot/finished-order': 40,
                            'spot/pending-stop-order': 8,
                            'spot/finished-stop-order': 40,
                            'spot/user-deals': 40,
                            'spot/order-deals': 40,
                            'futures/order-status': 8,
                            'futures/batch-order-status': 1,
                            'futures/pending-order': 8,
                            'futures/finished-order': 40,
                            'futures/pending-stop-order': 8,
                            'futures/finished-stop-order': 40,
                            'futures/user-deals': 1,
                            'futures/order-deals': 1,
                            'futures/pending-position': 40,
                            'futures/finished-position': 1,
                            'futures/position-margin-history': 1,
                            'futures/position-funding-history': 40,
                            'futures/position-adl-history': 1,
                            'futures/position-settle-history': 1,
                        },
                        'post': {
                            'account/subs': 40,
                            'account/subs/frozen': 40,
                            'account/subs/unfrozen': 40,
                            'account/subs/api': 40,
                            'account/subs/edit-api': 40,
                            'account/subs/delete-api': 40,
                            'account/subs/transfer': 40,
                            'account/settings': 40,
                            'assets/margin/borrow': 40,
                            'assets/margin/repay': 40,
                            'assets/renewal-deposit-address': 40,
                            'assets/withdraw': 40,
                            'assets/cancel-withdraw': 40,
                            'assets/transfer': 40,
                            'assets/amm/add-liquidity': 1,
                            'assets/amm/remove-liquidity': 1,
                            'spot/order': 13.334,
                            'spot/stop-order': 13.334,
                            'spot/batch-order': 40,
                            'spot/batch-stop-order': 1,
                            'spot/modify-order': 13.334,
                            'spot/modify-stop-order': 13.334,
                            'spot/cancel-all-order': 1,
                            'spot/cancel-order': 6.667,
                            'spot/cancel-stop-order': 6.667,
                            'spot/cancel-batch-order': 10,
                            'spot/cancel-batch-stop-order': 10,
                            'spot/cancel-order-by-client-id': 1,
                            'spot/cancel-stop-order-by-client-id': 1,
                            'futures/order': 20,
                            'futures/stop-order': 20,
                            'futures/batch-order': 1,
                            'futures/batch-stop-order': 1,
                            'futures/modify-order': 20,
                            'futures/modify-stop-order': 20,
                            'futures/cancel-all-order': 1,
                            'futures/cancel-order': 10,
                            'futures/cancel-stop-order': 10,
                            'futures/cancel-batch-order': 20,
                            'futures/cancel-batch-stop-order': 20,
                            'futures/cancel-order-by-client-id': 1,
                            'futures/cancel-stop-order-by-client-id': 1,
                            'futures/close-position': 20,
                            'futures/adjust-position-margin': 20,
                            'futures/adjust-position-leverage': 20,
                            'futures/set-position-stop-loss': 20,
                            'futures/set-position-take-profit': 20,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.001,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.0,
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'ZEC': 0.0001,
                        'DASH': 0.0001,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'options': {
                'brokerId': 'x-167673045',
                'createMarketBuyOrderRequiresPrice': true,
                'defaultType': 'spot',
                'defaultSubType': 'linear',
                'fetchDepositAddress': {
                    'fillResponseFromRequest': true,
                },
                'accountsByType': {
                    'spot': 'SPOT',
                    'margin': 'MARGIN',
                    'swap': 'FUTURES',
                },
                'accountsById': {
                    'SPOT': 'spot',
                    'MARGIN': 'margin',
                    'FUTURES': 'swap',
                },
                'networks': {
                    'BTC': 'BTC',
                    'BEP20': 'BSC',
                    'TRC20': 'TRC20',
                    'ERC20': 'ERC20',
                    'BRC20': 'BRC20',
                    'SOL': 'SOL',
                    'TON': 'SOL',
                    'BSV': 'BSV',
                    'AVAXC': 'AVA_C',
                    'AVAXX': 'AVA',
                    'SUI': 'SUI',
                    'ACA': 'ACA',
                    'CHZ': 'CHILIZ',
                    'ADA': 'ADA',
                    'ARB': 'ARBITRUM',
                    'ARBNOVA': 'ARBITRUM_NOVA',
                    'OP': 'OPTIMISM',
                    'APT': 'APTOS',
                    'ATOM': 'ATOM',
                    'FTM': 'FTM',
                    'BCH': 'BCH',
                    'ASTR': 'ASTR',
                    'LTC': 'LTC',
                    'MATIC': 'MATIC',
                    'CRONOS': 'CRONOS',
                    'DASH': 'DASH',
                    'DOT': 'DOT',
                    'ETC': 'ETC',
                    'ETHW': 'ETHPOW',
                    'FIL': 'FIL',
                    'ZIL': 'ZIL',
                    'DOGE': 'DOGE',
                    'TIA': 'CELESTIA',
                    'SEI': 'SEI',
                    'XRP': 'XRP',
                    'XMR': 'XMR',
                    // CSC, AE, BASE, AIPG, AKASH, POLKADOTASSETHUB ?, ALEO, STX, ALGO, ALPH, BLAST, AR, ARCH, ARDR, ARK, ARRR, MANTA, NTRN, LUNA, AURORA, AVAIL, ASC20, AVA, AYA, AZERO, BAN, BAND, BB, RUNES, BEAM, BELLSCOIN, BITCI, NEAR, AGORIC, BLOCX, BNC, BOBA, BRISE, KRC20, CANTO, CAPS, CCD, CELO, CFX, CHI, CKB, CLORE, CLV, CORE, CSPR, CTXC, DAG, DCR, DERO, DESO, DEFI, DGB, DNX, DOCK, DOGECHAIN, DYDX, DYMENSION, EGLD, ELA, ELF, ENJIN, EOSIO, ERG, ETN_SC, EVMOS, EWC, SGB, FACT, FB, FET, FIO, FIRO, NEO3, FLOW, FLARE, FLUX, LINEA, FREN, FSN, FB_BRC20, GLMR, GRIN, GRS, HACASH, HBAR, HERB, HIVE, MAPO, HMND, HNS, ZKSYNC, HTR, HUAHUA, MERLIN, ICP, ICX, INJ, IOST, IOTA, IOTX, IRIS, IRON, ONE, JOYSTREAM, KAI, KAR, KAS, KAVA, KCN, KDA, KLAY, KLY, KMD, KSM, KUB, KUJIRA, LAT, LBC, LUNC, LUKSO, MARS, METIS, MINA, MANTLE, MOB, MODE, MONA, MOVR, MTL, NEOX, NEXA, NIBI, NIMIQ, NMC, ONOMY, NRG, WAVES, NULS, OAS, OCTA, OLT, ONT, OORT, ORAI, OSMO, P3D, COMPOSABLE, PIVX, RON, POKT, POLYMESH, PRE_MARKET, PYI, QKC, QTUM, QUBIC, RSK, ROSE, ROUTE, RTM, THORCHAIN, RVN, RADIANT, SAGA, SALVIUM, SATOX, SC, SCP, _NULL, SCRT, SDN, RGBPP, SELF, SMH, SPACE, STARGAZE, STC, STEEM, STRATISEVM, STRD, STARKNET, SXP, SYS, TAIKO, TAO, TARA, TENET, THETA, TT, VENOM, VECHAIN, TOMO, VITE, VLX, VSYS, VTC, WAN, WAXP, WEMIX, XCH, XDC, XEC, XELIS, NEM, XHV, XLM, XNA, NANO, XPLA, XPR, XPRT, XRD, XTZ, XVG, XYM, ZANO, ZEC, ZEN, ZEPH, ZETA
                },
            },
            'features': {
                'spot': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        // exchange-supported features
                        // 'marketBuyRequiresPrice': true,
                        // 'marketBuyByCost': true,
                        // 'selfTradePrevention': true,
                        // 'iceberg': true,
                    },
                    'createOrders': {
                        'max': 5,
                    },
                    'fetchMyTrades': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': 100000,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBackClosed': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'forDerivatives': {
                    'extends': 'spot',
                    'createOrder': {
                        'marginMode': true,
                        'stopLossPrice': true,
                        'takeProfitPrice': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                    },
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
            'commonCurrencies': {
                'ACM': 'Actinium',
            },
            'precisionMode': number.TICK_SIZE,
            'exceptions': {
                'exact': {
                    // https://github.com/coinexcom/coinex_exchange_api/wiki/013error_code
                    '23': errors.PermissionDenied,
                    '24': errors.AuthenticationError,
                    '25': errors.AuthenticationError,
                    '34': errors.AuthenticationError,
                    '35': errors.ExchangeNotAvailable,
                    '36': errors.RequestTimeout,
                    '213': errors.RateLimitExceeded,
                    '107': errors.InsufficientFunds,
                    '158': errors.PermissionDenied,
                    '600': errors.OrderNotFound,
                    '601': errors.InvalidOrder,
                    '602': errors.InvalidOrder,
                    '606': errors.InvalidOrder,
                    '3008': errors.RequestTimeout,
                    '3109': errors.InsufficientFunds,
                    '3127': errors.InvalidOrder,
                    '3600': errors.OrderNotFound,
                    '3606': errors.InvalidOrder,
                    '3610': errors.ExchangeError,
                    '3612': errors.InvalidOrder,
                    '3613': errors.InvalidOrder,
                    '3614': errors.InvalidOrder,
                    '3615': errors.InvalidOrder,
                    '3616': errors.InvalidOrder,
                    '3617': errors.InvalidOrder,
                    '3618': errors.InvalidOrder,
                    '3619': errors.InvalidOrder,
                    '3620': errors.InvalidOrder,
                    '3621': errors.InvalidOrder,
                    '3622': errors.InvalidOrder,
                    '3627': errors.InvalidOrder,
                    '3628': errors.InvalidOrder,
                    '3629': errors.InvalidOrder,
                    '3632': errors.InvalidOrder,
                    '3633': errors.InvalidOrder,
                    '3634': errors.InvalidOrder,
                    '3635': errors.InvalidOrder,
                    '4001': errors.ExchangeNotAvailable,
                    '4002': errors.RequestTimeout,
                    '4003': errors.ExchangeError,
                    '4004': errors.BadRequest,
                    '4005': errors.AuthenticationError,
                    '4006': errors.AuthenticationError,
                    '4007': errors.PermissionDenied,
                    '4008': errors.AuthenticationError,
                    '4009': errors.ExchangeError,
                    '4010': errors.ExchangeError,
                    '4011': errors.PermissionDenied,
                    '4017': errors.ExchangeError,
                    '4115': errors.AccountSuspended,
                    '4117': errors.BadSymbol,
                    '4123': errors.RateLimitExceeded,
                    '4130': errors.ExchangeError,
                    '4158': errors.ExchangeError,
                    '4213': errors.RateLimitExceeded,
                    '4512': errors.PermissionDenied, // Insufficient sub-account permissions, please check.
                },
                'broad': {
                    'ip not allow visit': errors.PermissionDenied,
                    'service too busy': errors.ExchangeNotAvailable,
                },
            },
        });
    }
    /**
     * @method
     * @name coinex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-all-deposit-withdrawal-config
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.v2PublicGetAssetsAllDepositWithdrawConfig(params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "asset": {
        //                     "ccy": "CET",
        //                     "deposit_enabled": true,
        //                     "withdraw_enabled": true,
        //                     "inter_transfer_enabled": true,
        //                     "is_st": false
        //                 },
        //                 "chains": [
        //                     {
        //                         "chain": "CSC",
        //                         "min_deposit_amount": "0.8",
        //                         "min_withdraw_amount": "8",
        //                         "deposit_enabled": true,
        //                         "withdraw_enabled": true,
        //                         "deposit_delay_minutes": 0,
        //                         "safe_confirmations": 10,
        //                         "irreversible_confirmations": 20,
        //                         "deflation_rate": "0",
        //                         "withdrawal_fee": "0.026",
        //                         "withdrawal_precision": 8,
        //                         "memo": "",
        //                         "is_memo_required_for_deposit": false,
        //                         "explorer_asset_url": ""
        //                     },
        //                 ]
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const coin = data[i];
            const asset = this.safeDict(coin, 'asset', {});
            const chains = this.safeList(coin, 'chains', []);
            const currencyId = this.safeString(asset, 'ccy');
            if (currencyId === undefined) {
                continue; // coinex returns empty structures for some reason
            }
            const code = this.safeCurrencyCode(currencyId);
            const canDeposit = this.safeBool(asset, 'deposit_enabled');
            const canWithdraw = this.safeBool(asset, 'withdraw_enabled');
            const firstChain = this.safeDict(chains, 0, {});
            const firstPrecisionString = this.parsePrecision(this.safeString(firstChain, 'withdrawal_precision'));
            result[code] = {
                'id': currencyId,
                'code': code,
                'name': undefined,
                'active': canDeposit && canWithdraw,
                'deposit': canDeposit,
                'withdraw': canWithdraw,
                'fee': undefined,
                'precision': this.parseNumber(firstPrecisionString),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': {},
                'info': coin,
            };
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString(chain, 'chain');
                const precisionString = this.parsePrecision(this.safeString(chain, 'withdrawal_precision'));
                const feeString = this.safeString(chain, 'withdrawal_fee');
                const minNetworkDepositString = this.safeString(chain, 'min_deposit_amount');
                const minNetworkWithdrawString = this.safeString(chain, 'min_withdraw_amount');
                const canDepositChain = this.safeBool(chain, 'deposit_enabled');
                const canWithdrawChain = this.safeBool(chain, 'withdraw_enabled');
                const network = {
                    'id': networkId,
                    'network': networkId,
                    'name': undefined,
                    'active': canDepositChain && canWithdrawChain,
                    'deposit': canDepositChain,
                    'withdraw': canWithdrawChain,
                    'fee': this.parseNumber(feeString),
                    'precision': this.parseNumber(precisionString),
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'deposit': {
                            'min': this.parseNumber(minNetworkDepositString),
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.parseNumber(minNetworkWithdrawString),
                            'max': undefined,
                        },
                    },
                    'info': chain,
                };
                const networks = this.safeDict(result[code], 'networks', {});
                networks[networkId] = network;
                result[code]['networks'] = networks;
            }
        }
        return result;
    }
    /**
     * @method
     * @name coinex#fetchMarkets
     * @description retrieves data on all markets for coinex
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const promisesUnresolved = [
            this.fetchSpotMarkets(params),
            this.fetchContractMarkets(params),
        ];
        const promises = await Promise.all(promisesUnresolved);
        const spotMarkets = promises[0];
        const swapMarkets = promises[1];
        return this.arrayConcat(spotMarkets, swapMarkets);
    }
    async fetchSpotMarkets(params) {
        const response = await this.v2PublicGetSpotMarket(params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "base_ccy": "SORA",
        //                 "base_ccy_precision": 8,
        //                 "is_amm_available": true,
        //                 "is_margin_available": false,
        //                 "maker_fee_rate": "0.003",
        //                 "market": "SORAUSDT",
        //                 "min_amount": "500",
        //                 "quote_ccy": "USDT",
        //                 "quote_ccy_precision": 6,
        //                 "taker_fee_rate": "0.003"
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const markets = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString(market, 'market');
            const baseId = this.safeString(market, 'base_ccy');
            const quoteId = this.safeString(market, 'quote_ccy');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const symbol = base + '/' + quote;
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber(market, 'taker_fee_rate'),
                'maker': this.safeNumber(market, 'maker_fee_rate'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'base_ccy_precision'))),
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'quote_ccy_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'min_amount'),
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
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }
    async fetchContractMarkets(params) {
        const response = await this.v2PublicGetFuturesMarket(params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "base_ccy": "BTC",
        //                 "base_ccy_precision": 8,
        //                 "contract_type": "inverse",
        //                 "leverage": ["1","2","3","5","8","10","15","20","30","50","100"],
        //                 "maker_fee_rate": "0",
        //                 "market": "BTCUSD",
        //                 "min_amount": "10",
        //                 "open_interest_volume": "2566879",
        //                 "quote_ccy": "USD",
        //                 "quote_ccy_precision": 2,
        //                 "taker_fee_rate": "0"
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const markets = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const fees = this.fees;
            const leverages = this.safeList(entry, 'leverage', []);
            const subType = this.safeString(entry, 'contract_type');
            const linear = (subType === 'linear');
            const inverse = (subType === 'inverse');
            const id = this.safeString(entry, 'market');
            const baseId = this.safeString(entry, 'base_ccy');
            const quoteId = this.safeString(entry, 'quote_ccy');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settleId = (subType === 'linear') ? 'USDT' : baseId;
            const settle = this.safeCurrencyCode(settleId);
            const symbol = base + '/' + quote + ':' + settle;
            const leveragesLength = leverages.length;
            result.push({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': true,
                'linear': linear,
                'inverse': inverse,
                'taker': fees['trading']['taker'],
                'maker': fees['trading']['maker'],
                'contractSize': this.parseNumber('1'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(entry, 'base_ccy_precision'))),
                    'price': this.parseNumber(this.parsePrecision(this.safeString(entry, 'quote_ccy_precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber(leverages, 0),
                        'max': this.safeNumber(leverages, leveragesLength - 1),
                    },
                    'amount': {
                        'min': this.safeNumber(entry, 'min_amount'),
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
                'created': undefined,
                'info': entry,
            });
        }
        return result;
    }
    parseTicker(ticker, market = undefined) {
        //
        // Spot fetchTicker, fetchTickers
        //
        //     {
        //         "close": "62393.47",
        //         "high": "64106.41",
        //         "last": "62393.47",
        //         "low": "59650.01",
        //         "market": "BTCUSDT",
        //         "open": "61616.15",
        //         "period": 86400,
        //         "value": "28711273.4065667262",
        //         "volume": "461.76557205",
        //         "volume_buy": "11.41506354",
        //         "volume_sell": "7.3240169"
        //     }
        //
        // Swap fetchTicker, fetchTickers
        //
        //     {
        //         "close": "62480.08",
        //         "high": "64100",
        //         "index_price": "62443.05",
        //         "last": "62480.08",
        //         "low": "59600",
        //         "mark_price": "62443.05",
        //         "market": "BTCUSDT",
        //         "open": "61679.98",
        //         "period": 86400,
        //         "value": "180226025.69791713065326633165",
        //         "volume": "2900.2218",
        //         "volume_buy": "7.3847",
        //         "volume_sell": "6.1249"
        //     }
        //
        const marketType = ('mark_price' in ticker) ? 'swap' : 'spot';
        const marketId = this.safeString(ticker, 'market');
        const symbol = this.safeSymbol(marketId, market, undefined, marketType);
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': undefined,
            'bidVolume': this.safeString(ticker, 'volume_buy'),
            'ask': undefined,
            'askVolume': this.safeString(ticker, 'volume_sell'),
            'vwap': undefined,
            'open': this.safeString(ticker, 'open'),
            'close': this.safeString(ticker, 'close'),
            'last': this.safeString(ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'volume'),
            'quoteVolume': undefined,
            'markPrice': this.safeString(ticker, 'mark_price'),
            'indexPrice': this.safeString(ticker, 'index_price'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name coinex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.v2PublicGetFuturesTicker(this.extend(request, params));
        }
        else {
            response = await this.v2PublicGetSpotTicker(this.extend(request, params));
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "close": "62393.47",
        //                 "high": "64106.41",
        //                 "last": "62393.47",
        //                 "low": "59650.01",
        //                 "market": "BTCUSDT",
        //                 "open": "61616.15",
        //                 "period": 86400,
        //                 "value": "28711273.4065667262",
        //                 "volume": "461.76557205",
        //                 "volume_buy": "11.41506354",
        //                 "volume_sell": "7.3240169"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "close": "62480.08",
        //                 "high": "64100",
        //                 "index_price": "62443.05",
        //                 "last": "62480.08",
        //                 "low": "59600",
        //                 "mark_price": "62443.05",
        //                 "market": "BTCUSDT",
        //                 "open": "61679.98",
        //                 "period": 86400,
        //                 "value": "180226025.69791713065326633165",
        //                 "volume": "2900.2218",
        //                 "volume_buy": "7.3847",
        //                 "volume_sell": "6.1249"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        return this.parseTicker(result, market);
    }
    /**
     * @method
     * @name coinex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-ticker
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue(symbols, 0);
            market = this.market(symbol);
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let response = undefined;
        if (marketType === 'swap') {
            response = await this.v2PublicGetFuturesTicker(query);
        }
        else {
            response = await this.v2PublicGetSpotTicker(query);
        }
        //
        // Spot
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "close": "62393.47",
        //                 "high": "64106.41",
        //                 "last": "62393.47",
        //                 "low": "59650.01",
        //                 "market": "BTCUSDT",
        //                 "open": "61616.15",
        //                 "period": 86400,
        //                 "value": "28711273.4065667262",
        //                 "volume": "461.76557205",
        //                 "volume_buy": "11.41506354",
        //                 "volume_sell": "7.3240169"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        // Swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "close": "62480.08",
        //                 "high": "64100",
        //                 "index_price": "62443.05",
        //                 "last": "62480.08",
        //                 "low": "59600",
        //                 "mark_price": "62443.05",
        //                 "market": "BTCUSDT",
        //                 "open": "61679.98",
        //                 "period": 86400,
        //                 "value": "180226025.69791713065326633165",
        //                 "volume": "2900.2218",
        //                 "volume_buy": "7.3847",
        //                 "volume_sell": "6.1249"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTickers(data, symbols);
    }
    /**
     * @method
     * @name coinex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.coinex.com/api/v2/common/http/time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.v2PublicGetTime(params);
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "timestamp": 1711699867777
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.safeInteger(data, 'timestamp');
    }
    /**
     * @method
     * @name coinex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-depth
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = 20, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (limit === undefined) {
            limit = 20; // default
        }
        const request = {
            'market': market['id'],
            'limit': limit,
            'interval': '0',
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.v2PublicGetFuturesDepth(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": {
            //             "depth": {
            //                 "asks": [
            //                     ["70851.94", "0.2119"],
            //                     ["70851.95", "0.0004"],
            //                     ["70851.96", "0.0004"]
            //                 ],
            //                 "bids": [
            //                     ["70851.93", "1.0314"],
            //                     ["70850.93", "0.0021"],
            //                     ["70850.42", "0.0306"]
            //                 ],
            //                 "checksum": 2956436260,
            //                 "last": "70851.94",
            //                 "updated_at": 1712824003252
            //             },
            //             "is_full": true,
            //             "market": "BTCUSDT"
            //         },
            //         "message": "OK"
            //     }
            //
        }
        else {
            response = await this.v2PublicGetSpotDepth(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": {
            //             "depth": {
            //                 "asks": [
            //                     ["70875.31", "0.28670282"],
            //                     ["70875.32", "0.31008114"],
            //                     ["70875.42", "0.05876653"]
            //                 ],
            //                 "bids": [
            //                     ["70855.3", "0.00632222"],
            //                     ["70855.29", "0.36216834"],
            //                     ["70855.17", "0.10166802"]
            //                 ],
            //                 "checksum": 2313816665,
            //                 "last": "70857.19",
            //                 "updated_at": 1712823790987
            //             },
            //             "is_full": true,
            //             "market": "BTCUSDT"
            //         },
            //         "message": "OK"
            //     }
            //
        }
        const data = this.safeDict(response, 'data', {});
        const depth = this.safeDict(data, 'depth', {});
        const timestamp = this.safeInteger(depth, 'updated_at');
        return this.parseOrderBook(depth, symbol, timestamp);
    }
    parseTrade(trade, market = undefined) {
        //
        // Spot and Swap fetchTrades (public)
        //
        //     {
        //         "amount": "0.00049432",
        //         "created_at": 1713849825667,
        //         "deal_id": 4137517302,
        //         "price": "66251",
        //         "side": "buy"
        //     }
        //
        // Spot and Margin fetchMyTrades (private)
        //
        //     {
        //         "amount": "0.00010087",
        //         "created_at": 1714618087585,
        //         "deal_id": 4161200602,
        //         "margin_market": "",
        //         "market": "BTCUSDT",
        //         "order_id": 117654919342,
        //         "price": "57464.04",
        //         "side": "sell"
        //     }
        //
        // Swap fetchMyTrades (private)
        //
        //     {
        //         "deal_id": 1180222387,
        //         "created_at": 1714119054558,
        //         "market": "BTCUSDT",
        //         "side": "buy",
        //         "order_id": 136915589622,
        //         "price": "64376",
        //         "amount": "0.0001",
        //         "role": "taker",
        //         "fee": "0.0299",
        //         "fee_ccy": "USDT"
        //     }
        //
        const timestamp = this.safeInteger(trade, 'created_at');
        let defaultType = this.safeString(this.options, 'defaultType');
        if (market !== undefined) {
            defaultType = market['type'];
        }
        const marketId = this.safeString(trade, 'market');
        market = this.safeMarket(marketId, market, undefined, defaultType);
        const feeCostString = this.safeString(trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString(trade, 'fee_ccy');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': this.safeString(trade, 'deal_id'),
            'order': this.safeString(trade, 'order_id'),
            'type': undefined,
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': this.safeString(trade, 'role'),
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'amount'),
            'cost': this.safeString(trade, 'deal_money'),
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name coinex#fetchTrades
     * @description get the list of the most recent trades for a particular symbol
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-deals
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-deals
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            // 'last_id': 0,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.v2PublicGetFuturesDeals(this.extend(request, params));
        }
        else {
            response = await this.v2PublicGetSpotDeals(this.extend(request, params));
        }
        //
        // Spot and Swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "amount": "0.00049432",
        //                 "created_at": 1713849825667,
        //                 "deal_id": 4137517302,
        //                 "price": "66251",
        //                 "side": "buy"
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        return this.parseTrades(response['data'], market, since, limit);
    }
    /**
     * @method
     * @name coinex#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.v2PublicGetSpotMarket(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "base_ccy": "BTC",
            //                 "base_ccy_precision": 8,
            //                 "is_amm_available": false,
            //                 "is_margin_available": true,
            //                 "maker_fee_rate": "0.002",
            //                 "market": "BTCUSDT",
            //                 "min_amount": "0.0001",
            //                 "quote_ccy": "USDT",
            //                 "quote_ccy_precision": 2,
            //                 "taker_fee_rate": "0.002"
            //             }
            //         ],
            //         "message": "OK"
            //     }
            //
        }
        else {
            response = await this.v2PublicGetFuturesMarket(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "base_ccy": "BTC",
            //                 "base_ccy_precision": 8,
            //                 "contract_type": "linear",
            //                 "leverage": ["1","2","3","5","8","10","15","20","30","50","100"],
            //                 "maker_fee_rate": "0",
            //                 "market": "BTCUSDT",
            //                 "min_amount": "0.0001",
            //                 "open_interest_volume": "185.7498",
            //                 "quote_ccy": "USDT",
            //                 "quote_ccy_precision": 2,
            //                 "taker_fee_rate": "0"
            //             }
            //         ],
            //         "message": "OK"
            //     }
            //
        }
        const data = this.safeList(response, 'data', []);
        const result = this.safeDict(data, 0, {});
        return this.parseTradingFee(result, market);
    }
    /**
     * @method
     * @name coinex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    async fetchTradingFees(params = {}) {
        await this.loadMarkets();
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchTradingFees', undefined, params);
        let response = undefined;
        if (type === 'swap') {
            response = await this.v2PublicGetFuturesMarket(params);
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "base_ccy": "BTC",
            //                 "base_ccy_precision": 8,
            //                 "contract_type": "linear",
            //                 "leverage": ["1","2","3","5","8","10","15","20","30","50","100"],
            //                 "maker_fee_rate": "0",
            //                 "market": "BTCUSDT",
            //                 "min_amount": "0.0001",
            //                 "open_interest_volume": "185.7498",
            //                 "quote_ccy": "USDT",
            //                 "quote_ccy_precision": 2,
            //                 "taker_fee_rate": "0"
            //             }
            //         ],
            //         "message": "OK"
            //     }
            //
        }
        else {
            response = await this.v2PublicGetSpotMarket(params);
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "base_ccy": "BTC",
            //                 "base_ccy_precision": 8,
            //                 "is_amm_available": false,
            //                 "is_margin_available": true,
            //                 "maker_fee_rate": "0.002",
            //                 "market": "BTCUSDT",
            //                 "min_amount": "0.0001",
            //                 "quote_ccy": "USDT",
            //                 "quote_ccy_precision": 2,
            //                 "taker_fee_rate": "0.002"
            //             },
            //         ],
            //         "message": "OK"
            //     }
            //
        }
        const data = this.safeList(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString(entry, 'market');
            const market = this.safeMarket(marketId, undefined, undefined, type);
            const symbol = market['symbol'];
            result[symbol] = this.parseTradingFee(entry, market);
        }
        return result;
    }
    parseTradingFee(fee, market = undefined) {
        const marketId = this.safeValue(fee, 'market');
        const symbol = this.safeSymbol(marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber(fee, 'maker_fee_rate'),
            'taker': this.safeNumber(fee, 'taker_fee_rate'),
            'percentage': true,
            'tierBased': true,
        };
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "close": "66999.95",
        //         "created_at": 1713934620000,
        //         "high": "66999.95",
        //         "low": "66988.53",
        //         "market": "BTCUSDT",
        //         "open": "66988.53",
        //         "value": "0.1572393",        // base volume
        //         "volume": "10533.2501364336" // quote volume
        //     }
        //
        return [
            this.safeInteger(ohlcv, 'created_at'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'value'),
        ];
    }
    /**
     * @method
     * @name coinex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.coinex.com/api/v2/spot/market/http/list-market-kline
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'period': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['swap']) {
            response = await this.v2PublicGetFuturesKline(this.extend(request, params));
        }
        else {
            response = await this.v2PublicGetSpotKline(this.extend(request, params));
        }
        //
        // Spot and Swap
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "close": "66999.95",
        //                 "created_at": 1713934620000,
        //                 "high": "66999.95",
        //                 "low": "66988.53",
        //                 "market": "BTCUSDT",
        //                 "open": "66988.53",
        //                 "value": "0.1572393",
        //                 "volume": "10533.2501364336"
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    async fetchMarginBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v2PrivateGetAssetsMarginBalance(params);
        //
        //     {
        //         "data": [
        //             {
        //                 "margin_account": "BTCUSDT",
        //                 "base_ccy": "BTC",
        //                 "quote_ccy": "USDT",
        //                 "available": {
        //                     "base_ccy": "0.00000026",
        //                     "quote_ccy": "0"
        //                 },
        //                 "frozen": {
        //                     "base_ccy": "0",
        //                     "quote_ccy": "0"
        //                 },
        //                 "repaid": {
        //                     "base_ccy": "0",
        //                     "quote_ccy": "0"
        //                 },
        //                 "interest": {
        //                     "base_ccy": "0",
        //                     "quote_ccy": "0"
        //                 },
        //                 "rik_rate": "",
        //                 "liq_price": ""
        //             },
        //         ],
        //         "code": 0,
        //         "message": "OK"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeList(response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const free = this.safeDict(entry, 'available', {});
            const used = this.safeDict(entry, 'frozen', {});
            const loan = this.safeDict(entry, 'repaid', {});
            const interest = this.safeDict(entry, 'interest', {});
            const baseAccount = this.account();
            const baseCurrencyId = this.safeString(entry, 'base_ccy');
            const baseCurrencyCode = this.safeCurrencyCode(baseCurrencyId);
            baseAccount['free'] = this.safeString(free, 'base_ccy');
            baseAccount['used'] = this.safeString(used, 'base_ccy');
            const baseDebt = this.safeString(loan, 'base_ccy');
            const baseInterest = this.safeString(interest, 'base_ccy');
            baseAccount['debt'] = Precise["default"].stringAdd(baseDebt, baseInterest);
            result[baseCurrencyCode] = baseAccount;
        }
        return this.safeBalance(result);
    }
    async fetchSpotBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v2PrivateGetAssetsSpotBalance(params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "available": "0.00000046",
        //                 "ccy": "USDT",
        //                 "frozen": "0"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeList(response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString(entry, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(entry, 'available');
            account['used'] = this.safeString(entry, 'frozen');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchSwapBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v2PrivateGetAssetsFuturesBalance(params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "available": "0.00000046",
        //                 "ccy": "USDT",
        //                 "frozen": "0",
        //                 "margin": "0",
        //                 "transferrable": "0.00000046",
        //                 "unrealized_pnl": "0"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeList(response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString(entry, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(entry, 'available');
            account['used'] = this.safeString(entry, 'frozen');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchFinancialBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.v2PrivateGetAssetsFinancialBalance(params);
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "available": "0.00000046",
        //                 "ccy": "USDT",
        //                 "frozen": "0"
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const result = { 'info': response };
        const balances = this.safeList(response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const entry = balances[i];
            const currencyId = this.safeString(entry, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(entry, 'available');
            account['used'] = this.safeString(entry, 'frozen');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name coinex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-spot-balance         // spot
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-futures-balance      // swap
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-marigin-balance      // margin
     * @see https://docs.coinex.com/api/v2/assets/balance/http/get-financial-balance    // financial
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'margin', 'swap', 'financial', or 'spot'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchBalance', params);
        const isMargin = (marginMode !== undefined) || (marketType === 'margin');
        if (marketType === 'swap') {
            return await this.fetchSwapBalance(params);
        }
        else if (marketType === 'financial') {
            return await this.fetchFinancialBalance(params);
        }
        else if (isMargin) {
            return await this.fetchMarginBalance(params);
        }
        else {
            return await this.fetchSpotBalance(params);
        }
    }
    parseOrderStatus(status) {
        const statuses = {
            'rejected': 'rejected',
            'open': 'open',
            'not_deal': 'open',
            'part_deal': 'open',
            'done': 'closed',
            'cancel': 'canceled',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // Spot and Margin createOrder, createOrders, editOrder, cancelOrders, cancelOrder, fetchOpenOrders
        //
        //     {
        //         "amount": "0.0001",
        //         "base_fee": "0",
        //         "ccy": "BTC",
        //         "client_id": "x-167673045-a0a3c6461459a801",
        //         "created_at": 1714114386250,
        //         "discount_fee": "0",
        //         "filled_amount": "0",
        //         "filled_value": "0",
        //         "last_fill_amount": "0",
        //         "last_fill_price": "0",
        //         "maker_fee_rate": "0.002",
        //         "market": "BTCUSDT",
        //         "market_type": "SPOT",
        //         "order_id": 117178743547,
        //         "price": "61000",
        //         "quote_fee": "0",
        //         "side": "buy",
        //         "taker_fee_rate": "0.002",
        //         "type": "limit",
        //         "unfilled_amount": "0.0001",
        //         "updated_at": 1714114386250
        //     }
        //
        // Spot and Margin fetchClosedOrders
        //
        //     {
        //         "order_id": 117180532345,
        //         "market": "BTCUSDT",
        //         "market_type": "SPOT",
        //         "side": "sell",
        //         "type": "market",
        //         "ccy": "BTC",
        //         "amount": "0.00015484",
        //         "price": "0",
        //         "client_id": "",
        //         "created_at": 1714116494219,
        //         "updated_at": 0,
        //         "base_fee": "0",
        //         "quote_fee": "0.0199931699632",
        //         "discount_fee": "0",
        //         "maker_fee_rate": "0",
        //         "taker_fee_rate": "0.002",
        //         "unfilled_amount": "0",
        //         "filled_amount": "0.00015484",
        //         "filled_value": "9.9965849816"
        //     }
        //
        // Spot, Margin and Swap trigger createOrder, createOrders, editOrder
        //
        //     {
        //         "stop_id": 117180138153
        //     }
        //
        // Swap createOrder, createOrders, editOrder, cancelOrders, cancelOrder, fetchOpenOrders, fetchClosedOrders, closePosition
        //
        //     {
        //         "amount": "0.0001",
        //         "client_id": "x-167673045-1471b81d747080a0",
        //         "created_at": 1714116769986,
        //         "fee": "0",
        //         "fee_ccy": "USDT",
        //         "filled_amount": "0",
        //         "filled_value": "0",
        //         "last_filled_amount": "0",
        //         "last_filled_price": "0",
        //         "maker_fee_rate": "0.0003",
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "order_id": 136913377780,
        //         "price": "61000.42",
        //         "realized_pnl": "0",
        //         "side": "buy",
        //         "taker_fee_rate": "0.0005",
        //         "type": "limit",
        //         "unfilled_amount": "0.0001",
        //         "updated_at": 1714116769986
        //     }
        //
        // Swap stopLossPrice and takeProfitPrice createOrder
        //
        //     {
        //         "adl_level": 1,
        //         "ath_margin_size": "2.14586666",
        //         "ath_position_amount": "0.0001",
        //         "avg_entry_price": "64376",
        //         "bkr_price": "0",
        //         "close_avbl": "0.0001",
        //         "cml_position_value": "6.4376",
        //         "created_at": 1714119054558,
        //         "leverage": "3",
        //         "liq_price": "0",
        //         "maintenance_margin_rate": "0.005",
        //         "maintenance_margin_value": "0.03218632",
        //         "margin_avbl": "2.14586666",
        //         "margin_mode": "cross",
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "max_position_value": "6.4376",
        //         "open_interest": "0.0001",
        //         "position_id": 303884204,
        //         "position_margin_rate": "3.10624785634397912265",
        //         "realized_pnl": "-0.0032188",
        //         "settle_price": "64376",
        //         "settle_value": "6.4376",
        //         "side": "long",
        //         "stop_loss_price": "62000",
        //         "stop_loss_type": "latest_price",
        //         "take_profit_price": "0",
        //         "take_profit_type": "",
        //         "unrealized_pnl": "0",
        //         "updated_at": 1714119054559
        //     }
        //
        // Swap fetchOrder
        //
        //     {
        //         "amount": "0.0001",
        //         "client_id": "x-167673045-da5f31dcd478a829",
        //         "created_at": 1714460987164,
        //         "fee": "0",
        //         "fee_ccy": "USDT",
        //         "filled_amount": "0",
        //         "filled_value": "0",
        //         "last_filled_amount": "0",
        //         "last_filled_price": "0",
        //         "maker_fee_rate": "0.0003",
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "order_id": 137319868771,
        //         "price": "61000",
        //         "realized_pnl": "0",
        //         "side": "buy",
        //         "status": "open",
        //         "taker_fee_rate": "0.0005",
        //         "type": "limit",
        //         "unfilled_amount": "0.0001",
        //         "updated_at": 1714460987164
        //     }
        //
        // Spot and Margin fetchOrder
        //
        //     {
        //         "amount": "0.0001",
        //         "base_fee": "0",
        //         "ccy": "BTC",
        //         "client_id": "x-167673045-da918d6724e3af81",
        //         "created_at": 1714461638958,
        //         "discount_fee": "0",
        //         "filled_amount": "0",
        //         "filled_value": "0",
        //         "last_fill_amount": "0",
        //         "last_fill_price": "0",
        //         "maker_fee_rate": "0.002",
        //         "market": "BTCUSDT",
        //         "market_type": "SPOT",
        //         "order_id": 117492012985,
        //         "price": "61000",
        //         "quote_fee": "0",
        //         "side": "buy",
        //         "status": "open",
        //         "taker_fee_rate": "0.002",
        //         "type": "limit",
        //         "unfilled_amount": "0.0001",
        //         "updated_at": 1714461638958
        //     }
        //
        // Swap trigger fetchOpenOrders, fetchClosedOrders - Spot and Swap trigger cancelOrders, cancelOrder
        //
        //     {
        //         "amount": "0.0001",
        //         "client_id": "x-167673045-a7d7714c6478acf6",
        //         "created_at": 1714187923820,
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "price": "61000",
        //         "side": "buy",
        //         "stop_id": 136984426097,
        //         "trigger_direction": "higher",
        //         "trigger_price": "62000",
        //         "trigger_price_type": "latest_price",
        //         "type": "limit",
        //         "updated_at": 1714187974363
        //     }
        //
        // Spot and Margin trigger fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "stop_id": 117586439530,
        //         "market": "BTCUSDT",
        //         "market_type": "SPOT",
        //         "ccy": "BTC",
        //         "side": "buy",
        //         "type": "limit",
        //         "amount": "0.0001",
        //         "price": "51000",
        //         "trigger_price": "52000",
        //         "trigger_direction": "higher",
        //         "trigger_price_type": "mark_price",
        //         "client_id": "x-167673045-df61777094c69312",
        //         "created_at": 1714551237335,
        //         "updated_at": 1714551237335
        //     }
        //
        const rawStatus = this.safeString(order, 'status');
        const timestamp = this.safeInteger(order, 'created_at');
        let updatedTimestamp = this.safeInteger(order, 'updated_at');
        if (updatedTimestamp === 0) {
            updatedTimestamp = timestamp;
        }
        const marketId = this.safeString(order, 'market');
        const defaultType = this.safeString(this.options, 'defaultType');
        let orderType = this.safeStringLower(order, 'market_type', defaultType);
        if (orderType === 'futures') {
            orderType = 'swap';
        }
        const marketType = (orderType === 'swap') ? 'swap' : 'spot';
        market = this.safeMarket(marketId, market, undefined, marketType);
        const feeCurrencyId = this.safeString(order, 'fee_ccy');
        let feeCurrency = this.safeCurrencyCode(feeCurrencyId);
        if (feeCurrency === undefined) {
            feeCurrency = market['quote'];
        }
        let side = this.safeString(order, 'side');
        if (side === 'long') {
            side = 'buy';
        }
        else if (side === 'short') {
            side = 'sell';
        }
        let clientOrderId = this.safeString(order, 'client_id');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        return this.safeOrder({
            'id': this.safeStringN(order, ['position_id', 'order_id', 'stop_id']),
            'clientOrderId': clientOrderId,
            'datetime': this.iso8601(timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': updatedTimestamp,
            'status': this.parseOrderStatus(rawStatus),
            'symbol': market['symbol'],
            'type': this.safeString(order, 'type'),
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': side,
            'price': this.safeString(order, 'price'),
            'triggerPrice': this.safeString(order, 'trigger_price'),
            'takeProfitPrice': this.safeNumber(order, 'take_profit_price'),
            'stopLossPrice': this.safeNumber(order, 'stop_loss_price'),
            'cost': this.safeString(order, 'filled_value'),
            'average': this.safeString(order, 'avg_entry_price'),
            'amount': this.safeString(order, 'amount'),
            'filled': this.safeString(order, 'filled_amount'),
            'remaining': this.safeString(order, 'unfilled_amount'),
            'trades': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': this.safeString2(order, 'quote_fee', 'fee'),
            },
            'info': order,
        }, market);
    }
    /**
     * @method
     * @name coinex#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://viabtc.github.io/coinex_api_en_doc/spot/#docsspot003_trade003_market_order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-order
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
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market(symbol);
        const swap = market['swap'];
        const clientOrderId = this.safeString2(params, 'client_id', 'clientOrderId');
        const triggerPrice = this.safeString2(params, 'stopPrice', 'triggerPrice');
        const stopLossPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const option = this.safeString(params, 'option');
        const isMarketOrder = type === 'market';
        const postOnly = this.isPostOnly(isMarketOrder, option === 'maker_only', params);
        const timeInForceRaw = this.safeStringUpper(params, 'timeInForce');
        const reduceOnly = this.safeBool(params, 'reduceOnly');
        if (reduceOnly) {
            if (!market['swap']) {
                throw new errors.InvalidOrder(this.id + ' createOrder() does not support reduceOnly for ' + market['type'] + ' orders, reduceOnly orders are supported for swap markets only');
            }
        }
        const request = {
            'market': market['id'],
        };
        if (clientOrderId === undefined) {
            const defaultId = 'x-167673045';
            const brokerId = this.safeString(this.options, 'brokerId', defaultId);
            request['client_id'] = brokerId + '-' + this.uuid16();
        }
        else {
            request['client_id'] = clientOrderId;
        }
        if ((stopLossPrice === undefined) && (takeProfitPrice === undefined)) {
            if (!reduceOnly) {
                request['side'] = side;
            }
            let requestType = type;
            if (postOnly) {
                requestType = 'maker_only';
            }
            else if (timeInForceRaw !== undefined) {
                if (timeInForceRaw === 'IOC') {
                    requestType = 'ioc';
                }
                else if (timeInForceRaw === 'FOK') {
                    requestType = 'fok';
                }
            }
            if (!isMarketOrder) {
                request['price'] = this.priceToPrecision(symbol, price);
            }
            request['type'] = requestType;
        }
        if (swap) {
            request['market_type'] = 'FUTURES';
            if (stopLossPrice || takeProfitPrice) {
                if (stopLossPrice) {
                    request['stop_loss_price'] = this.priceToPrecision(symbol, stopLossPrice);
                    request['stop_loss_type'] = this.safeString(params, 'stop_type', 'latest_price');
                }
                else if (takeProfitPrice) {
                    request['take_profit_price'] = this.priceToPrecision(symbol, takeProfitPrice);
                    request['take_profit_type'] = this.safeString(params, 'stop_type', 'latest_price');
                }
            }
            else {
                request['amount'] = this.amountToPrecision(symbol, amount);
                if (triggerPrice !== undefined) {
                    request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
                    request['trigger_price_type'] = this.safeString(params, 'stop_type', 'latest_price');
                }
            }
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
            if (marginMode !== undefined) {
                request['market_type'] = 'MARGIN';
            }
            else {
                request['market_type'] = 'SPOT';
            }
            if ((type === 'market') && (side === 'buy')) {
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber(params, 'cost');
                params = this.omit(params, 'cost');
                if (createMarketBuyOrderRequiresPrice) {
                    if ((price === undefined) && (cost === undefined)) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        const quoteAmount = this.parseToNumeric(Precise["default"].stringMul(amountString, priceString));
                        const costRequest = (cost !== undefined) ? cost : quoteAmount;
                        request['amount'] = this.costToPrecision(symbol, costRequest);
                    }
                }
                else {
                    request['amount'] = this.costToPrecision(symbol, amount);
                }
            }
            else {
                request['amount'] = this.amountToPrecision(symbol, amount);
            }
            if (triggerPrice !== undefined) {
                request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            }
        }
        params = this.omit(params, ['reduceOnly', 'timeInForce', 'postOnly', 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice']);
        return this.extend(request, params);
    }
    /**
     * @method
     * @name coinex#createOrder
     * @description create a trade order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-stop-order
     * @see https://docs.coinex.com/api/v2/futures/position/http/close-position
     * @see https://docs.coinex.com/api/v2/futures/position/http/set-position-stop-loss
     * @see https://docs.coinex.com/api/v2/futures/position/http/set-position-take-profit
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take profit orders
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO'
     * @param {boolean} [params.postOnly] set to true if you wish to make a post only order
     * @param {boolean} [params.reduceOnly] *contract only* indicates if this order is to reduce the size of a position
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const reduceOnly = this.safeBool(params, 'reduceOnly');
        const triggerPrice = this.safeString2(params, 'stopPrice', 'triggerPrice');
        const stopLossTriggerPrice = this.safeString(params, 'stopLossPrice');
        const takeProfitTriggerPrice = this.safeString(params, 'takeProfitPrice');
        const isTriggerOrder = triggerPrice !== undefined;
        const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
        const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
        const isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
        const request = this.createOrderRequest(symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['spot']) {
            if (isTriggerOrder) {
                response = await this.v2PrivatePostSpotStopOrder(request);
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "stop_id": 117180138153
                //         },
                //         "message": "OK"
                //     }
                //
            }
            else {
                response = await this.v2PrivatePostSpotOrder(request);
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "amount": "0.0001",
                //             "base_fee": "0",
                //             "ccy": "BTC",
                //             "client_id": "x-167673045-a0a3c6461459a801",
                //             "created_at": 1714114386250,
                //             "discount_fee": "0",
                //             "filled_amount": "0",
                //             "filled_value": "0",
                //             "last_fill_amount": "0",
                //             "last_fill_price": "0",
                //             "maker_fee_rate": "0.002",
                //             "market": "BTCUSDT",
                //             "market_type": "SPOT",
                //             "order_id": 117178743547,
                //             "price": "61000",
                //             "quote_fee": "0",
                //             "side": "buy",
                //             "taker_fee_rate": "0.002",
                //             "type": "limit",
                //             "unfilled_amount": "0.0001",
                //             "updated_at": 1714114386250
                //         },
                //         "message": "OK"
                //     }
                //
            }
        }
        else {
            if (isTriggerOrder) {
                response = await this.v2PrivatePostFuturesStopOrder(request);
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "stop_id": 136915460994
                //         },
                //         "message": "OK"
                //     }
                //
            }
            else if (isStopLossOrTakeProfitTrigger) {
                if (isStopLossTriggerOrder) {
                    response = await this.v2PrivatePostFuturesSetPositionStopLoss(request);
                    //
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "adl_level": 1,
                    //             "ath_margin_size": "2.14586666",
                    //             "ath_position_amount": "0.0001",
                    //             "avg_entry_price": "64376",
                    //             "bkr_price": "0",
                    //             "close_avbl": "0.0001",
                    //             "cml_position_value": "6.4376",
                    //             "created_at": 1714119054558,
                    //             "leverage": "3",
                    //             "liq_price": "0",
                    //             "maintenance_margin_rate": "0.005",
                    //             "maintenance_margin_value": "0.03218632",
                    //             "margin_avbl": "2.14586666",
                    //             "margin_mode": "cross",
                    //             "market": "BTCUSDT",
                    //             "market_type": "FUTURES",
                    //             "max_position_value": "6.4376",
                    //             "open_interest": "0.0001",
                    //             "position_id": 303884204,
                    //             "position_margin_rate": "3.10624785634397912265",
                    //             "realized_pnl": "-0.0032188",
                    //             "settle_price": "64376",
                    //             "settle_value": "6.4376",
                    //             "side": "long",
                    //             "stop_loss_price": "62000",
                    //             "stop_loss_type": "latest_price",
                    //             "take_profit_price": "0",
                    //             "take_profit_type": "",
                    //             "unrealized_pnl": "0",
                    //             "updated_at": 1714119054559
                    //         },
                    //         "message": "OK"
                    //     }
                    //
                }
                else if (isTakeProfitTriggerOrder) {
                    response = await this.v2PrivatePostFuturesSetPositionTakeProfit(request);
                    //
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "adl_level": 1,
                    //             "ath_margin_size": "2.14586666",
                    //             "ath_position_amount": "0.0001",
                    //             "avg_entry_price": "64376",
                    //             "bkr_price": "0",
                    //             "close_avbl": "0.0001",
                    //             "cml_position_value": "6.4376",
                    //             "created_at": 1714119054558,
                    //             "leverage": "3",
                    //             "liq_price": "0",
                    //             "maintenance_margin_rate": "0.005",
                    //             "maintenance_margin_value": "0.03218632",
                    //             "margin_avbl": "2.14586666",
                    //             "margin_mode": "cross",
                    //             "market": "BTCUSDT",
                    //             "market_type": "FUTURES",
                    //             "max_position_value": "6.4376",
                    //             "open_interest": "0.0001",
                    //             "position_id": 303884204,
                    //             "position_margin_rate": "3.10624785634397912265",
                    //             "realized_pnl": "-0.0032188",
                    //             "settle_price": "64376",
                    //             "settle_value": "6.4376",
                    //             "side": "long",
                    //             "stop_loss_price": "62000",
                    //             "stop_loss_type": "latest_price",
                    //             "take_profit_price": "70000",
                    //             "take_profit_type": "latest_price",
                    //             "unrealized_pnl": "0",
                    //             "updated_at": 1714119054559
                    //         },
                    //         "message": "OK"
                    //     }
                    //
                }
            }
            else {
                if (reduceOnly) {
                    response = await this.v2PrivatePostFuturesClosePosition(request);
                    //
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "amount": "0.0001",
                    //             "client_id": "x-167673045-4f264600c432ac06",
                    //             "created_at": 1714119323764,
                    //             "fee": "0.003221",
                    //             "fee_ccy": "USDT",
                    //             "filled_amount": "0.0001",
                    //             "filled_value": "6.442017",
                    //             "last_filled_amount": "0.0001",
                    //             "last_filled_price": "64420.17",
                    //             "maker_fee_rate": "0",
                    //             "market": "BTCUSDT",
                    //             "market_type": "FUTURES",
                    //             "order_id": 136915813578,
                    //             "price": "0",
                    //             "realized_pnl": "0.004417",
                    //             "side": "sell",
                    //             "taker_fee_rate": "0.0005",
                    //             "type": "market",
                    //             "unfilled_amount": "0",
                    //             "updated_at": 1714119323764
                    //         },
                    //         "message": "OK"
                    //     }
                    //
                }
                else {
                    response = await this.v2PrivatePostFuturesOrder(request);
                    //
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "amount": "0.0001",
                    //             "client_id": "x-167673045-1471b81d747080a0",
                    //             "created_at": 1714116769986,
                    //             "fee": "0",
                    //             "fee_ccy": "USDT",
                    //             "filled_amount": "0",
                    //             "filled_value": "0",
                    //             "last_filled_amount": "0",
                    //             "last_filled_price": "0",
                    //             "maker_fee_rate": "0.0003",
                    //             "market": "BTCUSDT",
                    //             "market_type": "FUTURES",
                    //             "order_id": 136913377780,
                    //             "price": "61000.42",
                    //             "realized_pnl": "0",
                    //             "side": "buy",
                    //             "taker_fee_rate": "0.0005",
                    //             "type": "limit",
                    //             "unfilled_amount": "0.0001",
                    //             "updated_at": 1714116769986
                    //         },
                    //         "message": "OK"
                    //     }
                    //
                }
            }
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name coinex#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-multi-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/put-multi-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-multi-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/put-multi-stop-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let symbol = undefined;
        let reduceOnly = false;
        let isTriggerOrder = false;
        let isStopLossOrTakeProfitTrigger = false;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
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
            const orderParams = this.safeValue(rawOrder, 'params', {});
            if (type !== 'limit') {
                throw new errors.NotSupported(this.id + ' createOrders() does not support ' + type + ' orders, only limit orders are accepted');
            }
            reduceOnly = this.safeValue(orderParams, 'reduceOnly');
            const triggerPrice = this.safeNumber2(orderParams, 'stopPrice', 'triggerPrice');
            const stopLossTriggerPrice = this.safeNumber(orderParams, 'stopLossPrice');
            const takeProfitTriggerPrice = this.safeNumber(orderParams, 'takeProfitPrice');
            isTriggerOrder = triggerPrice !== undefined;
            const isStopLossTriggerOrder = stopLossTriggerPrice !== undefined;
            const isTakeProfitTriggerOrder = takeProfitTriggerPrice !== undefined;
            isStopLossOrTakeProfitTrigger = isStopLossTriggerOrder || isTakeProfitTriggerOrder;
            const orderRequest = this.createOrderRequest(marketId, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'orders': ordersRequests,
        };
        let response = undefined;
        if (market['spot']) {
            if (isTriggerOrder) {
                response = await this.v2PrivatePostSpotBatchStopOrder(request);
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "code": 0,
                //                 "data": {
                //                     "stop_id": 117186257510
                //                 },
                //                 "message": "OK"
                //             },
                //         ],
                //         "message": "OK"
                //     }
                //
            }
            else {
                response = await this.v2PrivatePostSpotBatchOrder(request);
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "amount": "0.0001",
                //                 "base_fee": "0",
                //                 "ccy": "BTC",
                //                 "client_id": "x-167673045-f3651372049dab0d",
                //                 "created_at": 1714121403450,
                //                 "discount_fee": "0",
                //                 "filled_amount": "0",
                //                 "filled_value": "0",
                //                 "last_fill_amount": "0",
                //                 "last_fill_price": "0",
                //                 "maker_fee_rate": "0.002",
                //                 "market": "BTCUSDT",
                //                 "market_type": "SPOT",
                //                 "order_id": 117185362233,
                //                 "price": "61000",
                //                 "quote_fee": "0",
                //                 "side": "buy",
                //                 "taker_fee_rate": "0.002",
                //                 "type": "limit",
                //                 "unfilled_amount": "0.0001",
                //                 "updated_at": 1714121403450
                //             },
                //             {
                //                 "code": 3109,
                //                 "data": null,
                //                 "message": "balance not enough"
                //             }
                //         ],
                //         "message": "OK"
                //     }
                //
            }
        }
        else {
            if (isTriggerOrder) {
                response = await this.v2PrivatePostFuturesBatchStopOrder(request);
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "code": 0,
                //                 "data": {
                //                     "stop_id": 136919625994
                //                 },
                //                 "message": "OK"
                //             },
                //         ],
                //         "message": "OK"
                //     }
                //
            }
            else if (isStopLossOrTakeProfitTrigger) {
                throw new errors.NotSupported(this.id + ' createOrders() does not support stopLossPrice or takeProfitPrice orders');
            }
            else {
                if (reduceOnly) {
                    throw new errors.NotSupported(this.id + ' createOrders() does not support reduceOnly orders');
                }
                else {
                    response = await this.v2PrivatePostFuturesBatchOrder(request);
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "code": 0,
                    //                 "data": {
                    //                     "amount": "0.0001",
                    //                     "client_id": "x-167673045-2cb7436f3462a654",
                    //                     "created_at": 1714122832493,
                    //                     "fee": "0",
                    //                     "fee_ccy": "USDT",
                    //                     "filled_amount": "0",
                    //                     "filled_value": "0",
                    //                     "last_filled_amount": "0",
                    //                     "last_filled_price": "0",
                    //                     "maker_fee_rate": "0.0003",
                    //                     "market": "BTCUSDT",
                    //                     "market_type": "FUTURES",
                    //                     "order_id": 136918835063,
                    //                     "price": "61000",
                    //                     "realized_pnl": "0",
                    //                     "side": "buy",
                    //                     "taker_fee_rate": "0.0005",
                    //                     "type": "limit",
                    //                     "unfilled_amount": "0.0001",
                    //                     "updated_at": 1714122832493
                    //                 },
                    //                 "message": "OK"
                    //             },
                    //         ],
                    //         "message": "OK"
                    //     }
                    //
                }
            }
        }
        const data = this.safeList(response, 'data', []);
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            let status = undefined;
            const code = this.safeInteger(entry, 'code');
            if (code !== undefined) {
                if (code !== 0) {
                    status = 'rejected';
                }
                else {
                    status = 'open';
                }
            }
            const innerData = this.safeDict(entry, 'data', {});
            let order = undefined;
            if (market['spot'] && !isTriggerOrder) {
                entry['status'] = status;
                order = this.parseOrder(entry, market);
            }
            else {
                innerData['status'] = status;
                order = this.parseOrder(innerData, market);
            }
            results.push(order);
        }
        return results;
    }
    /**
     * @method
     * @name coinex#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-batch-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-batch-stop-order
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for canceling stop orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        let response = undefined;
        const requestIds = [];
        for (let i = 0; i < ids.length; i++) {
            requestIds.push(parseInt(ids[i]));
        }
        if (trigger) {
            request['stop_ids'] = requestIds;
        }
        else {
            request['order_ids'] = requestIds;
        }
        if (market['spot']) {
            if (trigger) {
                response = await this.v2PrivatePostSpotCancelBatchStopOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "code": 0,
                //                 "data": {
                //                     "amount": "0.0001",
                //                     "ccy": "BTC",
                //                     "client_id": "x-167673045-8e33d6f4a4bcb022",
                //                     "created_at": 1714188827291,
                //                     "market": "BTCUSDT",
                //                     "market_type": "SPOT",
                //                     "price": "61000",
                //                     "side": "buy",
                //                     "stop_id": 117248845854,
                //                     "trigger_direction": "higher",
                //                     "trigger_price": "62000",
                //                     "trigger_price_type": "mark_price",
                //                     "type": "limit",
                //                     "updated_at": 1714188827291
                //                 },
                //                 "message": "OK"
                //             },
                //         ],
                //         "message": "OK"
                //     }
                //
            }
            else {
                response = await this.v2PrivatePostSpotCancelBatchOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "code": 0,
                //                 "data": {
                //                     "amount": "0.0001",
                //                     "base_fee": "0",
                //                     "ccy": "BTC",
                //                     "client_id": "x-167673045-c1cc78e5b42d8c4e",
                //                     "created_at": 1714188449497,
                //                     "discount_fee": "0",
                //                     "filled_amount": "0",
                //                     "filled_value": "0",
                //                     "last_fill_amount": "0",
                //                     "last_fill_price": "0",
                //                     "maker_fee_rate": "0.002",
                //                     "market": "BTCUSDT",
                //                     "market_type": "SPOT",
                //                     "order_id": 117248494358,
                //                     "price": "60000",
                //                     "quote_fee": "0",
                //                     "side": "buy",
                //                     "taker_fee_rate": "0.002",
                //                     "type": "limit",
                //                     "unfilled_amount": "0.0001",
                //                     "updated_at": 1714188449497
                //                 },
                //                 "message": ""
                //             },
                //         ],
                //         "message": "OK"
                //     }
                //
            }
        }
        else {
            request['market_type'] = 'FUTURES';
            if (trigger) {
                response = await this.v2PrivatePostFuturesCancelBatchStopOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "code": 0,
                //                 "data": {
                //                     "amount": "0.0001",
                //                     "client_id": "x-167673045-a7d7714c6478acf6",
                //                     "created_at": 1714187923820,
                //                     "market": "BTCUSDT",
                //                     "market_type": "FUTURES",
                //                     "price": "61000",
                //                     "side": "buy",
                //                     "stop_id": 136984426097,
                //                     "trigger_direction": "higher",
                //                     "trigger_price": "62000",
                //                     "trigger_price_type": "latest_price",
                //                     "type": "limit",
                //                     "updated_at": 1714187974363
                //                 },
                //                 "message": ""
                //             },
                //         ],
                //         "message": "OK"
                //     }
                //
            }
            else {
                response = await this.v2PrivatePostFuturesCancelBatchOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": [
                //             {
                //                 "code": 0,
                //                 "data": {
                //                     "amount": "0.0001",
                //                     "client_id": "x-167673045-9f80fde284339a72",
                //                     "created_at": 1714187491784,
                //                     "fee": "0",
                //                     "fee_ccy": "USDT",
                //                     "filled_amount": "0",
                //                     "filled_value": "0",
                //                     "last_filled_amount": "0",
                //                     "last_filled_price": "0",
                //                     "maker_fee_rate": "0.0003",
                //                     "market": "BTCUSDT",
                //                     "market_type": "FUTURES",
                //                     "order_id": 136983851788,
                //                     "price": "61000",
                //                     "realized_pnl": "0",
                //                     "side": "buy",
                //                     "taker_fee_rate": "0.0005",
                //                     "type": "limit",
                //                     "unfilled_amount": "0.0001",
                //                     "updated_at": 1714187567079
                //                 },
                //                 "message": ""
                //             },
                //         ],
                //         "message": "OK"
                //     }
                //
            }
        }
        const data = this.safeList(response, 'data', []);
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const item = this.safeDict(entry, 'data', {});
            const order = this.parseOrder(item, market);
            results.push(order);
        }
        return results;
    }
    /**
     * @method
     * @name coinex#editOrder
     * @description edit a trade order
     * @see https://docs.coinex.com/api/v2/spot/order/http/edit-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/edit-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/edit-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/edit-stop-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price to trigger stop orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision(symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        let response = undefined;
        const triggerPrice = this.safeStringN(params, ['stopPrice', 'triggerPrice', 'trigger_price']);
        params = this.omit(params, ['stopPrice', 'triggerPrice']);
        const isTriggerOrder = triggerPrice !== undefined;
        if (isTriggerOrder) {
            request['trigger_price'] = this.priceToPrecision(symbol, triggerPrice);
            request['stop_id'] = this.parseToNumeric(id);
        }
        else {
            request['order_id'] = this.parseToNumeric(id);
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('editOrder', params);
        if (market['spot']) {
            if (marginMode !== undefined) {
                request['market_type'] = 'MARGIN';
            }
            else {
                request['market_type'] = 'SPOT';
            }
            if (isTriggerOrder) {
                response = await this.v2PrivatePostSpotModifyStopOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "stop_id": 117337235167
                //         },
                //         "message": "OK"
                //     }
                //
            }
            else {
                response = await this.v2PrivatePostSpotModifyOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "amount": "0.0001",
                //             "base_fee": "0",
                //             "ccy": "BTC",
                //             "client_id": "x-167673045-87eb2bebf42882d8",
                //             "created_at": 1714290302047,
                //             "discount_fee": "0",
                //             "filled_amount": "0",
                //             "filled_value": "0",
                //             "last_fill_amount": "0",
                //             "last_fill_price": "0",
                //             "maker_fee_rate": "0.002",
                //             "market": "BTCUSDT",
                //             "market_type": "SPOT",
                //             "order_id": 117336922195,
                //             "price": "61000",
                //             "quote_fee": "0",
                //             "side": "buy",
                //             "status": "open",
                //             "taker_fee_rate": "0.002",
                //             "type": "limit",
                //             "unfilled_amount": "0.0001",
                //             "updated_at": 1714290191141
                //         },
                //         "message": "OK"
                //     }
                //
            }
        }
        else {
            request['market_type'] = 'FUTURES';
            if (isTriggerOrder) {
                response = await this.v2PrivatePostFuturesModifyStopOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "stop_id": 137091875605
                //         },
                //         "message": "OK"
                //     }
                //
            }
            else {
                response = await this.v2PrivatePostFuturesModifyOrder(this.extend(request, params));
                //
                //     {
                //         "code": 0,
                //         "data": {
                //             "amount": "0.0001",
                //             "client_id": "x-167673045-3f2d09191462b207",
                //             "created_at": 1714290927630,
                //             "fee": "0",
                //             "fee_ccy": "USDT",
                //             "filled_amount": "0",
                //             "filled_value": "0",
                //             "last_filled_amount": "0",
                //             "last_filled_price": "0",
                //             "maker_fee_rate": "0.0003",
                //             "market": "BTCUSDT",
                //             "market_type": "FUTURES",
                //             "order_id": 137091566717,
                //             "price": "61000",
                //             "realized_pnl": "0",
                //             "side": "buy",
                //             "taker_fee_rate": "0.0005",
                //             "type": "limit",
                //             "unfilled_amount": "0.0001",
                //             "updated_at": 1714290927630
                //         },
                //         "message": "OK"
                //     }
                //
            }
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name coinex#cancelOrder
     * @description cancels an open order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-order-by-client-id
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-stop-order-by-client-id
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-order-by-client-id
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-stop-order-by-client-id
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, defaults to id if not passed
     * @param {boolean} [params.trigger] set to true for canceling a trigger order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const isTriggerOrder = this.safeBool2(params, 'stop', 'trigger');
        const swap = market['swap'];
        const request = {
            'market': market['id'],
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('cancelOrder', params);
        if (swap) {
            request['market_type'] = 'FUTURES';
        }
        else {
            if (marginMode !== undefined) {
                request['market_type'] = 'MARGIN';
            }
            else {
                request['market_type'] = 'SPOT';
            }
        }
        const clientOrderId = this.safeString2(params, 'client_id', 'clientOrderId');
        params = this.omit(params, ['stop', 'trigger', 'clientOrderId']);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
            if (isTriggerOrder) {
                if (swap) {
                    response = await this.v2PrivatePostFuturesCancelStopOrderByClientId(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "code": 0,
                    //                 "data": {
                    //                     "amount": "0.0001",
                    //                     "client_id": "client01",
                    //                     "created_at": 1714368624473,
                    //                     "market": "BTCUSDT",
                    //                     "market_type": "FUTURES",
                    //                     "price": "61000",
                    //                     "side": "buy",
                    //                     "stop_id": 137175823891,
                    //                     "trigger_direction": "higher",
                    //                     "trigger_price": "61500",
                    //                     "trigger_price_type": "latest_price",
                    //                     "type": "limit",
                    //                     "updated_at": 1714368661444
                    //                 },
                    //                 "message": ""
                    //             }
                    //         ],
                    //         "message": "OK"
                    //     }
                }
                else {
                    response = await this.v2PrivatePostSpotCancelStopOrderByClientId(this.extend(request, params));
                    //     {
                    //         "code" :0,
                    //         "data": [
                    //             {
                    //                 "code": 0,
                    //                 "data": {
                    //                     "amount": "0.0001",
                    //                     "ccy": "BTC",
                    //                     "client_id": "client01",
                    //                     "created_at": 1714366950279,
                    //                     "market": "BTCUSDT",
                    //                     "market_type": "SPOT",
                    //                     "price": "61000",
                    //                     "side": "buy",
                    //                     "stop_id": 117402512706,
                    //                     "trigger_direction": "higher",
                    //                     "trigger_price": "61500",
                    //                     "trigger_price_type": "mark_price",
                    //                     "type": "limit",
                    //                     "updated_at": 1714366950279
                    //                 },
                    //                 "message": "OK"
                    //             }
                    //         ],
                    //         "message": "OK"
                    //     }
                }
            }
            else {
                if (swap) {
                    response = await this.v2PrivatePostFuturesCancelOrderByClientId(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "code": 0,
                    //                 "data": {
                    //                     "amount": "0.0001",
                    //                     "client_id": "x-167673045-bf60e24bb437a3df",
                    //                     "created_at": 1714368416437,
                    //                     "fee": "0",
                    //                     "fee_ccy": "USDT",
                    //                     "filled_amount": "0",
                    //                     "filled_value": "0",
                    //                     "last_filled_amount": "0",
                    //                     "last_filled_price": "0",
                    //                     "maker_fee_rate": "0.0003",
                    //                     "market": "BTCUSDT",
                    //                     "market_type": "FUTURES",
                    //                     "order_id": 137175616437,
                    //                     "price": "61000",
                    //                     "realized_pnl": "0",
                    //                     "side": "buy",
                    //                     "taker_fee_rate": "0.0005",
                    //                     "type": "limit",
                    //                     "unfilled_amount": "0.0001",
                    //                     "updated_at": 1714368507174
                    //                 },
                    //                 "message": ""
                    //             }
                    //         ],
                    //         "message": "OK"
                    //     }
                }
                else {
                    response = await this.v2PrivatePostSpotCancelOrderByClientId(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "code": 0,
                    //                 "data": {
                    //                     "amount": "0.0001",
                    //                     "base_fee": "0",
                    //                     "ccy": "BTC",
                    //                     "client_id": "x-167673045-d49eaca5f412afc8",
                    //                     "created_at": 1714366502807,
                    //                     "discount_fee": "0",
                    //                     "filled_amount": "0",
                    //                     "filled_value": "0",
                    //                     "last_fill_amount": "0",
                    //                     "last_fill_price": "0",
                    //                     "maker_fee_rate": "0.002",
                    //                     "market": "BTCUSDT",
                    //                     "market_type": "SPOT",
                    //                     "order_id": 117402157490,
                    //                     "price": "61000",
                    //                     "quote_fee": "0",
                    //                     "side": "buy",
                    //                     "taker_fee_rate": "0.002",
                    //                     "type": "limit",
                    //                     "unfilled_amount": "0.0001",
                    //                     "updated_at": 1714366502807
                    //                 },
                    //                 "message": "OK"
                    //             }
                    //         ],
                    //         "message": "OK"
                    //     }
                }
            }
        }
        else {
            if (isTriggerOrder) {
                request['stop_id'] = this.parseToNumeric(id);
                if (swap) {
                    response = await this.v2PrivatePostFuturesCancelStopOrder(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "amount": "0.0001",
                    //             "ccy": "BTC",
                    //             "client_id": "x-167673045-f21ecfd7542abf1f",
                    //             "created_at": 1714366177334,
                    //             "market": "BTCUSDT",
                    //             "market_type": "SPOT",
                    //             "price": "61000",
                    //             "side": "buy",
                    //             "stop_id": 117401897954,
                    //             "trigger_direction": "higher",
                    //             "trigger_price": "61500",
                    //             "trigger_price_type": "mark_price",
                    //             "type": "limit",
                    //             "updated_at": 1714366177334
                    //         },
                    //         "message": "OK"
                    //     }
                }
                else {
                    response = await this.v2PrivatePostSpotCancelStopOrder(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "amount": "0.0001",
                    //             "ccy": "BTC",
                    //             "client_id": "x-167673045-f21ecfd7542abf1f",
                    //             "created_at": 1714366177334,
                    //             "market": "BTCUSDT",
                    //             "market_type": "SPOT",
                    //             "price": "61000",
                    //             "side": "buy",
                    //             "stop_id": 117401897954,
                    //             "trigger_direction": "higher",
                    //             "trigger_price": "61500",
                    //             "trigger_price_type": "mark_price",
                    //             "type": "limit",
                    //             "updated_at": 1714366177334
                    //         },
                    //         "message": "OK"
                    //     }
                }
            }
            else {
                request['order_id'] = this.parseToNumeric(id);
                if (swap) {
                    response = await this.v2PrivatePostFuturesCancelOrder(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "amount": "0.0001",
                    //             "client_id": "x-167673045-7f14381c74a98a85",
                    //             "created_at": 1714367342024,
                    //             "fee": "0",
                    //             "fee_ccy": "USDT",
                    //             "filled_amount": "0",
                    //             "filled_value": "0",
                    //             "last_filled_amount": "0",
                    //             "last_filled_price": "0",
                    //             "maker_fee_rate": "0.0003",
                    //             "market": "BTCUSDT",
                    //             "market_type": "FUTURES",
                    //             "order_id": 137174472136,
                    //             "price": "61000",
                    //             "realized_pnl": "0",
                    //             "side": "buy",
                    //             "taker_fee_rate": "0.0005",
                    //             "type": "limit",
                    //             "unfilled_amount": "0.0001",
                    //             "updated_at": 1714367515978
                    //         },
                    //         "message": "OK"
                    //     }
                }
                else {
                    response = await this.v2PrivatePostSpotCancelOrder(this.extend(request, params));
                    //     {
                    //         "code": 0,
                    //         "data": {
                    //             "amount": "0.0001",
                    //             "base_fee": "0",
                    //             "ccy": "BTC",
                    //             "client_id": "x-167673045-86fbe37b54a2aea3",
                    //             "created_at": 1714365277437,
                    //             "discount_fee": "0",
                    //             "filled_amount": "0",
                    //             "filled_value": "0",
                    //             "last_fill_amount": "0",
                    //             "last_fill_price": "0",
                    //             "maker_fee_rate": "0.002",
                    //             "market": "BTCUSDT",
                    //             "market_type": "SPOT",
                    //             "order_id": 117401168172,
                    //             "price": "61000",
                    //             "quote_fee": "0",
                    //             "side": "buy",
                    //             "taker_fee_rate": "0.002",
                    //             "type": "limit",
                    //             "unfilled_amount": "0.0001",
                    //             "updated_at": 1714365277437
                    //         },
                    //         "message": "OK"
                    //     }
                }
            }
        }
        let data = undefined;
        if (clientOrderId !== undefined) {
            const rows = this.safeList(response, 'data', []);
            data = this.safeDict(rows[0], 'data', {});
        }
        else {
            data = this.safeDict(response, 'data', {});
        }
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name coinex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.coinex.com/api/v2/spot/order/http/cancel-all-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/cancel-all-order
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' for canceling spot margin orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        let response = undefined;
        if (market['swap']) {
            request['market_type'] = 'FUTURES';
            response = await this.v2PrivatePostFuturesCancelAllOrder(this.extend(request, params));
            //
            // {"code":0,"data":{},"message":"OK"}
            //
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('cancelAllOrders', params);
            if (marginMode !== undefined) {
                request['market_type'] = 'MARGIN';
            }
            else {
                request['market_type'] = 'SPOT';
            }
            response = await this.v2PrivatePostSpotCancelAllOrder(this.extend(request, params));
            //
            // {"code":0,"data":{},"message":"OK"}
            //
        }
        return [
            this.safeOrder({
                'info': response,
            }),
        ];
    }
    /**
     * @method
     * @name coinex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.coinex.com/api/v2/spot/order/http/get-order-status
     * @see https://docs.coinex.com/api/v2/futures/order/http/get-order-status
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'order_id': this.parseToNumeric(id),
        };
        let response = undefined;
        if (market['swap']) {
            response = await this.v2PrivateGetFuturesOrderStatus(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": {
            //             "amount": "0.0001",
            //             "client_id": "x-167673045-da5f31dcd478a829",
            //             "created_at": 1714460987164,
            //             "fee": "0",
            //             "fee_ccy": "USDT",
            //             "filled_amount": "0",
            //             "filled_value": "0",
            //             "last_filled_amount": "0",
            //             "last_filled_price": "0",
            //             "maker_fee_rate": "0.0003",
            //             "market": "BTCUSDT",
            //             "market_type": "FUTURES",
            //             "order_id": 137319868771,
            //             "price": "61000",
            //             "realized_pnl": "0",
            //             "side": "buy",
            //             "status": "open",
            //             "taker_fee_rate": "0.0005",
            //             "type": "limit",
            //             "unfilled_amount": "0.0001",
            //             "updated_at": 1714460987164
            //         },
            //         "message": "OK"
            //     }
            //
        }
        else {
            response = await this.v2PrivateGetSpotOrderStatus(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": {
            //             "amount": "0.0001",
            //             "base_fee": "0",
            //             "ccy": "BTC",
            //             "client_id": "x-167673045-da918d6724e3af81",
            //             "created_at": 1714461638958,
            //             "discount_fee": "0",
            //             "filled_amount": "0",
            //             "filled_value": "0",
            //             "last_fill_amount": "0",
            //             "last_fill_price": "0",
            //             "maker_fee_rate": "0.002",
            //             "market": "BTCUSDT",
            //             "market_type": "SPOT",
            //             "order_id": 117492012985,
            //             "price": "61000",
            //             "quote_fee": "0",
            //             "side": "buy",
            //             "status": "open",
            //             "taker_fee_rate": "0.002",
            //             "type": "limit",
            //             "unfilled_amount": "0.0001",
            //             "updated_at": 1714461638958
            //         },
            //         "message": "OK"
            //     }
            //
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name coinex#fetchOrdersByStatus
     * @description fetch a list of orders
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order
     * @param {string} status order status to fetch for
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching spot margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrdersByStatus(status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trigger = this.safeBool2(params, 'stop', 'trigger');
        params = this.omit(params, ['stop', 'trigger']);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOrdersByStatus', market, params);
        let response = undefined;
        const isClosed = (status === 'finished') || (status === 'closed');
        const isOpen = (status === 'pending') || (status === 'open');
        if (marketType === 'swap') {
            request['market_type'] = 'FUTURES';
            if (isClosed) {
                if (trigger) {
                    response = await this.v2PrivateGetFuturesFinishedStopOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "stop_id": 52431158859,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "FUTURES",
                    //                 "side": "sell",
                    //                 "type": "market",
                    //                 "amount": "0.0005",
                    //                 "price": "20599.64",
                    //                 "client_id": "",
                    //                 "created_at": 1667547909856,
                    //                 "updated_at": 1667547909856,
                    //                 "trigger_price": "20599.64",
                    //                 "trigger_price_type": "latest_price",
                    //                 "trigger_direction": ""
                    //             },
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
                else {
                    response = await this.v2PrivateGetFuturesFinishedOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "order_id": 136915813578,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "FUTURES",
                    //                 "side": "sell",
                    //                 "type": "market",
                    //                 "amount": "0.0001",
                    //                 "price": "0",
                    //                 "client_id": "x-167673045-4f264600c432ac06",
                    //                 "created_at": 1714119323764,
                    //                 "updated_at": 1714119323764,
                    //                 "unfilled_amount": "0",
                    //                 "filled_amount": "0.0001",
                    //                 "filled_value": "6.442017",
                    //                 "fee": "0.003221",
                    //                 "fee_ccy": "USDT",
                    //                 "maker_fee_rate": "0",
                    //                 "taker_fee_rate": "0.0005"
                    //             },
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
            }
            else if (isOpen) {
                if (trigger) {
                    response = await this.v2PrivateGetFuturesPendingStopOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "stop_id": 137481469849,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "FUTURES",
                    //                 "side": "buy",
                    //                 "type": "limit",
                    //                 "amount": "0.0001",
                    //                 "price": "51000",
                    //                 "client_id": "x-167673045-2b932341949fa2a1",
                    //                 "created_at": 1714552257876,
                    //                 "updated_at": 1714552257876,
                    //                 "trigger_price": "52000",
                    //                 "trigger_price_type": "latest_price",
                    //                 "trigger_direction": "higher"
                    //             }
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "total": 1,
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
                else {
                    response = await this.v2PrivateGetFuturesPendingOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "order_id": 137480580906,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "FUTURES",
                    //                 "side": "buy",
                    //                 "type": "limit",
                    //                 "amount": "0.0001",
                    //                 "price": "51000",
                    //                 "client_id": "",
                    //                 "created_at": 1714551877569,
                    //                 "updated_at": 1714551877569,
                    //                 "unfilled_amount": "0.0001",
                    //                 "filled_amount": "0",
                    //                 "filled_value": "0",
                    //                 "fee": "0",
                    //                 "fee_ccy": "USDT",
                    //                 "maker_fee_rate": "0.0003",
                    //                 "taker_fee_rate": "0.0005",
                    //                 "last_filled_amount": "0",
                    //                 "last_filled_price": "0",
                    //                 "realized_pnl": "0"
                    //             }
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "total": 1,
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
            }
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchOrdersByStatus', params);
            if (marginMode !== undefined) {
                request['market_type'] = 'MARGIN';
            }
            else {
                request['market_type'] = 'SPOT';
            }
            if (isClosed) {
                if (trigger) {
                    response = await this.v2PrivateGetSpotFinishedStopOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "stop_id": 117654881420,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "SPOT",
                    //                 "ccy": "USDT",
                    //                 "side": "buy",
                    //                 "type": "market",
                    //                 "amount": "5.83325524",
                    //                 "price": "0",
                    //                 "trigger_price": "57418",
                    //                 "trigger_direction": "lower",
                    //                 "trigger_price_type": "mark_price",
                    //                 "client_id": "",
                    //                 "created_at": 1714618050597,
                    //                 "updated_at": 0
                    //             }
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
                else {
                    response = await this.v2PrivateGetSpotFinishedOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "order_id": 117180532345,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "SPOT",
                    //                 "side": "sell",
                    //                 "type": "market",
                    //                 "ccy": "BTC",
                    //                 "amount": "0.00015484",
                    //                 "price": "0",
                    //                 "client_id": "",
                    //                 "created_at": 1714116494219,
                    //                 "updated_at": 0,
                    //                 "base_fee": "0",
                    //                 "quote_fee": "0.0199931699632",
                    //                 "discount_fee": "0",
                    //                 "maker_fee_rate": "0",
                    //                 "taker_fee_rate": "0.002",
                    //                 "unfilled_amount": "0",
                    //                 "filled_amount": "0.00015484",
                    //                 "filled_value": "9.9965849816"
                    //             },
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
            }
            else if (status === 'pending') {
                if (trigger) {
                    response = await this.v2PrivateGetSpotPendingStopOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "stop_id": 117586439530,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "SPOT",
                    //                 "ccy": "BTC",
                    //                 "side": "buy",
                    //                 "type": "limit",
                    //                 "amount": "0.0001",
                    //                 "price": "51000",
                    //                 "trigger_price": "52000",
                    //                 "trigger_direction": "higher",
                    //                 "trigger_price_type": "mark_price",
                    //                 "client_id": "x-167673045-df61777094c69312",
                    //                 "created_at": 1714551237335,
                    //                 "updated_at": 1714551237335
                    //             }
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "total": 1,
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
                else {
                    response = await this.v2PrivateGetSpotPendingOrder(this.extend(request, params));
                    //
                    //     {
                    //         "code": 0,
                    //         "data": [
                    //             {
                    //                 "order_id": 117585921297,
                    //                 "market": "BTCUSDT",
                    //                 "market_type": "SPOT",
                    //                 "side": "buy",
                    //                 "type": "limit",
                    //                 "ccy": "BTC",
                    //                 "amount": "0.00011793",
                    //                 "price": "52000",
                    //                 "client_id": "",
                    //                 "created_at": 1714550707486,
                    //                 "updated_at": 1714550707486,
                    //                 "base_fee": "0",
                    //                 "quote_fee": "0",
                    //                 "discount_fee": "0",
                    //                 "maker_fee_rate": "0.002",
                    //                 "taker_fee_rate": "0.002",
                    //                 "last_fill_amount": "0",
                    //                 "last_fill_price": "0",
                    //                 "unfilled_amount": "0.00011793",
                    //                 "filled_amount": "0",
                    //                 "filled_value": "0"
                    //             }
                    //         ],
                    //         "message": "OK",
                    //         "pagination": {
                    //             "total": 1,
                    //             "has_next": false
                    //         }
                    //     }
                    //
                }
            }
        }
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    /**
     * @method
     * @name coinex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-pending-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-pending-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-pending-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-pending-stop-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching spot margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const openOrders = await this.fetchOrdersByStatus('pending', symbol, since, limit, params);
        for (let i = 0; i < openOrders.length; i++) {
            openOrders[i]['status'] = 'open';
        }
        return openOrders;
    }
    /**
     * @method
     * @name coinex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/spot/order/http/list-finished-stop-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-order
     * @see https://docs.coinex.com/api/v2/futures/order/http/list-finished-stop-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] set to true for fetching trigger orders
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching spot margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByStatus('finished', symbol, since, limit, params);
    }
    /**
     * @method
     * @name coinex#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/update-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const network = this.safeString2(params, 'chain', 'network');
        if (network === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createDepositAddress() requires a network parameter');
        }
        params = this.omit(params, 'network');
        const request = {
            'ccy': currency['id'],
            'chain': this.networkCodeToId(network, currency['code']),
        };
        const response = await this.v2PrivatePostAssetsRenewalDepositAddress(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "address": "0x321bd6479355142334f45653ad5d8b76105a1234",
        //             "memo": ""
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    /**
     * @method
     * @name coinex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDepositAddress() requires a "network" parameter');
        }
        request['chain'] = this.networkCodeToId(networkCode); // required for on-chain, not required for inter-user transfer
        const response = await this.v2PrivateGetAssetsDepositAddress(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "address": "0x321bd6479355142334f45653ad5d8b76105a1234",
        //             "memo": ""
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {
        //         "address": "1P1JqozxioQwaqPwgMAQdNDYNyaVSqgARq",
        //         "memo": ""
        //     }
        //
        const coinAddress = this.safeString(depositAddress, 'address');
        const parts = coinAddress.split(':');
        let address = undefined;
        let tag = undefined;
        const partsLength = parts.length;
        if (partsLength > 1 && parts[0] !== 'cfx') {
            address = parts[0];
            tag = parts[1];
        }
        else {
            address = coinAddress;
        }
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode(undefined, currency),
            'network': undefined,
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name coinex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.coinex.com/api/v2/spot/deal/http/list-user-deals
     * @see https://docs.coinex.com/api/v2/futures/deal/http/list-user-deals
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trades
     * @param {string} [params.side] the side of the trades, either 'buy' or 'sell', required for swap
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        let response = undefined;
        if (market['swap']) {
            request['market_type'] = 'FUTURES';
            response = await this.v2PrivateGetFuturesUserDeals(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "deal_id": 1180222387,
            //                 "created_at": 1714119054558,
            //                 "market": "BTCUSDT",
            //                 "side": "buy",
            //                 "order_id": 136915589622,
            //                 "price": "64376",
            //                 "amount": "0.0001"
            //             }
            //         ],
            //         "message": "OK",
            //         "pagination": {
            //             "has_next": true
            //         }
            //     }
            //
        }
        else {
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
            if (marginMode !== undefined) {
                request['market_type'] = 'MARGIN';
            }
            else {
                request['market_type'] = 'SPOT';
            }
            response = await this.v2PrivateGetSpotUserDeals(this.extend(request, params));
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "amount": "0.00010087",
            //                 "created_at": 1714618087585,
            //                 "deal_id": 4161200602,
            //                 "margin_market": "",
            //                 "market": "BTCUSDT",
            //                 "order_id": 117654919342,
            //                 "price": "57464.04",
            //                 "side": "sell"
            //             }
            //         ],
            //         "message": "OK",
            //         "pagination": {
            //             "has_next": true
            //         }
            //     }
            //
        }
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    /**
     * @method
     * @name coinex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-finished-position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] the method to use 'v2PrivateGetFuturesPendingPosition' or 'v2PrivateGetFuturesFinishedPosition' default is 'v2PrivateGetFuturesPendingPosition'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let defaultMethod = undefined;
        [defaultMethod, params] = this.handleOptionAndParams(params, 'fetchPositions', 'method', 'v2PrivateGetFuturesPendingPosition');
        symbols = this.marketSymbols(symbols);
        const request = {
            'market_type': 'FUTURES',
        };
        let market = undefined;
        if (symbols !== undefined) {
            let symbol = undefined;
            if (Array.isArray(symbols)) {
                const symbolsLength = symbols.length;
                if (symbolsLength > 1) {
                    throw new errors.BadRequest(this.id + ' fetchPositions() symbols argument cannot contain more than 1 symbol');
                }
                symbol = symbols[0];
            }
            else {
                symbol = symbols;
            }
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        let response = undefined;
        if (defaultMethod === 'v2PrivateGetFuturesPendingPosition') {
            response = await this.v2PrivateGetFuturesPendingPosition(this.extend(request, params));
        }
        else {
            response = await this.v2PrivateGetFuturesFinishedPosition(this.extend(request, params));
        }
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "position_id": 305891033,
        //                 "market": "BTCUSDT",
        //                 "market_type": "FUTURES",
        //                 "side": "long",
        //                 "margin_mode": "cross",
        //                 "open_interest": "0.0001",
        //                 "close_avbl": "0.0001",
        //                 "ath_position_amount": "0.0001",
        //                 "unrealized_pnl": "0",
        //                 "realized_pnl": "-0.00311684",
        //                 "avg_entry_price": "62336.8",
        //                 "cml_position_value": "6.23368",
        //                 "max_position_value": "6.23368",
        //                 "created_at": 1715152208041,
        //                 "updated_at": 1715152208041,
        //                 "take_profit_price": "0",
        //                 "stop_loss_price": "0",
        //                 "take_profit_type": "",
        //                 "stop_loss_type": "",
        //                 "settle_price": "62336.8",
        //                 "settle_value": "6.23368",
        //                 "leverage": "3",
        //                 "margin_avbl": "2.07789333",
        //                 "ath_margin_size": "2.07789333",
        //                 "position_margin_rate": "2.40545879023305655728",
        //                 "maintenance_margin_rate": "0.005",
        //                 "maintenance_margin_value": "0.03118094",
        //                 "liq_price": "0",
        //                 "bkr_price": "0",
        //                 "adl_level": 1
        //             }
        //         ],
        //         "message": "OK",
        //         "pagination": {
        //             "has_next": false
        //         }
        //     }
        //
        const position = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < position.length; i++) {
            result.push(this.parsePosition(position[i], market));
        }
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    /**
     * @method
     * @name coinex#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-pending-position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market_type': 'FUTURES',
            'market': market['id'],
        };
        const response = await this.v2PrivateGetFuturesPendingPosition(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "position_id": 305891033,
        //                 "market": "BTCUSDT",
        //                 "market_type": "FUTURES",
        //                 "side": "long",
        //                 "margin_mode": "cross",
        //                 "open_interest": "0.0001",
        //                 "close_avbl": "0.0001",
        //                 "ath_position_amount": "0.0001",
        //                 "unrealized_pnl": "0",
        //                 "realized_pnl": "-0.00311684",
        //                 "avg_entry_price": "62336.8",
        //                 "cml_position_value": "6.23368",
        //                 "max_position_value": "6.23368",
        //                 "created_at": 1715152208041,
        //                 "updated_at": 1715152208041,
        //                 "take_profit_price": "0",
        //                 "stop_loss_price": "0",
        //                 "take_profit_type": "",
        //                 "stop_loss_type": "",
        //                 "settle_price": "62336.8",
        //                 "settle_value": "6.23368",
        //                 "leverage": "3",
        //                 "margin_avbl": "2.07789333",
        //                 "ath_margin_size": "2.07789333",
        //                 "position_margin_rate": "2.40545879023305655728",
        //                 "maintenance_margin_rate": "0.005",
        //                 "maintenance_margin_value": "0.03118094",
        //                 "liq_price": "0",
        //                 "bkr_price": "0",
        //                 "adl_level": 1
        //             }
        //         ],
        //         "message": "OK",
        //         "pagination": {
        //             "has_next": false
        //         }
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parsePosition(data[0], market);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "position_id": 305891033,
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "side": "long",
        //         "margin_mode": "cross",
        //         "open_interest": "0.0001",
        //         "close_avbl": "0.0001",
        //         "ath_position_amount": "0.0001",
        //         "unrealized_pnl": "0",
        //         "realized_pnl": "-0.00311684",
        //         "avg_entry_price": "62336.8",
        //         "cml_position_value": "6.23368",
        //         "max_position_value": "6.23368",
        //         "created_at": 1715152208041,
        //         "updated_at": 1715152208041,
        //         "take_profit_price": "0",
        //         "stop_loss_price": "0",
        //         "take_profit_type": "",
        //         "stop_loss_type": "",
        //         "settle_price": "62336.8",
        //         "settle_value": "6.23368",
        //         "leverage": "3",
        //         "margin_avbl": "2.07789333",
        //         "ath_margin_size": "2.07789333",
        //         "position_margin_rate": "2.40545879023305655728",
        //         "maintenance_margin_rate": "0.005",
        //         "maintenance_margin_value": "0.03118094",
        //         "liq_price": "0",
        //         "bkr_price": "0",
        //         "adl_level": 1
        //     }
        //
        const marketId = this.safeString(position, 'market');
        market = this.safeMarket(marketId, market, undefined, 'swap');
        const timestamp = this.safeInteger(position, 'created_at');
        return this.safePosition({
            'info': position,
            'id': this.safeInteger(position, 'position_id'),
            'symbol': market['symbol'],
            'notional': this.safeNumber(position, 'settle_value'),
            'marginMode': this.safeString(position, 'margin_mode'),
            'liquidationPrice': this.safeNumber(position, 'liq_price'),
            'entryPrice': this.safeNumber(position, 'avg_entry_price'),
            'unrealizedPnl': this.safeNumber(position, 'unrealized_pnl'),
            'realizedPnl': this.safeNumber(position, 'realized_pnl'),
            'percentage': undefined,
            'contracts': this.safeNumber(position, 'close_avbl'),
            'contractSize': this.safeNumber(market, 'contractSize'),
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': this.safeString(position, 'side'),
            'hedged': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastUpdateTimestamp': this.safeInteger(position, 'updated_at'),
            'maintenanceMargin': this.safeNumber(position, 'maintenance_margin_value'),
            'maintenanceMarginPercentage': this.safeNumber(position, 'maintenance_margin_rate'),
            'collateral': this.safeNumber(position, 'margin_avbl'),
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber(position, 'leverage'),
            'marginRatio': this.safeNumber(position, 'position_margin_rate'),
            'stopLossPrice': this.omitZero(this.safeString(position, 'stop_loss_price')),
            'takeProfitPrice': this.omitZero(this.safeString(position, 'take_profit_price')),
        });
    }
    /**
     * @method
     * @name coinex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.leverage the rate of leverage
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        marginMode = marginMode.toLowerCase();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new errors.BadRequest(this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['type'] !== 'swap') {
            throw new errors.BadSymbol(this.id + ' setMarginMode() supports swap contracts only');
        }
        const leverage = this.safeInteger(params, 'leverage');
        const maxLeverage = this.safeInteger(market['limits']['leverage'], 'max', 100);
        if (leverage === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a leverage parameter');
        }
        if ((leverage < 1) || (leverage > maxLeverage)) {
            throw new errors.BadRequest(this.id + ' setMarginMode() leverage should be between 1 and ' + maxLeverage.toString() + ' for ' + symbol);
        }
        const request = {
            'market': market['id'],
            'market_type': 'FUTURES',
            'margin_mode': marginMode,
            'leverage': leverage,
        };
        return await this.v2PrivatePostFuturesAdjustPositionLeverage(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "leverage": 1,
        //             "margin_mode": "isolated"
        //         },
        //         "message": "OK"
        //     }
        //
    }
    /**
     * @method
     * @name coinex#setLeverage
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-leverage
     * @description set the level of leverage for a market
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' (default is 'cross')
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' setLeverage() supports swap contracts only');
        }
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('setLeverage', params, 'cross');
        const minLeverage = this.safeInteger(market['limits']['leverage'], 'min', 1);
        const maxLeverage = this.safeInteger(market['limits']['leverage'], 'max', 100);
        if ((leverage < minLeverage) || (leverage > maxLeverage)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between ' + minLeverage.toString() + ' and ' + maxLeverage.toString() + ' for ' + symbol);
        }
        const request = {
            'market': market['id'],
            'market_type': 'FUTURES',
            'margin_mode': marginMode,
            'leverage': leverage,
        };
        return await this.v2PrivatePostFuturesAdjustPositionLeverage(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "leverage": 1,
        //             "margin_mode": "isolated"
        //         },
        //         "message": "OK"
        //     }
        //
    }
    /**
     * @method
     * @name coinex#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-position-level
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds(symbols);
            request['market'] = marketIds.join(',');
        }
        const response = await this.v2PublicGetFuturesPositionLevel(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "level": [
        //                     {
        //                         "amount": "20001",
        //                         "leverage": "20",
        //                         "maintenance_margin_rate": "0.02",
        //                         "min_initial_margin_rate": "0.05"
        //                     },
        //                     {
        //                         "amount": "50001",
        //                         "leverage": "10",
        //                         "maintenance_margin_rate": "0.04",
        //                         "min_initial_margin_rate": "0.1"
        //                     },
        //                 ],
        //                 "market": "MINAUSDT"
        //             },
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseLeverageTiers(data, symbols, 'market');
    }
    parseMarketLeverageTiers(info, market = undefined) {
        const tiers = [];
        const brackets = this.safeList(info, 'level', []);
        let minNotional = 0;
        for (let i = 0; i < brackets.length; i++) {
            const tier = brackets[i];
            const marketId = this.safeString(info, 'market');
            market = this.safeMarket(marketId, market, undefined, 'swap');
            const maxNotional = this.safeNumber(tier, 'amount');
            tiers.push({
                'tier': this.sum(i, 1),
                'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
                'currency': market['linear'] ? market['base'] : market['quote'],
                'minNotional': minNotional,
                'maxNotional': maxNotional,
                'maintenanceMarginRate': this.safeNumber(tier, 'maintenance_margin_rate'),
                'maxLeverage': this.safeInteger(tier, 'leverage'),
                'info': tier,
            });
            minNotional = maxNotional;
        }
        return tiers;
    }
    async modifyMarginHelper(symbol, amount, addOrReduce, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const rawAmount = this.amountToPrecision(symbol, amount);
        let requestAmount = rawAmount;
        if (addOrReduce === 'reduce') {
            requestAmount = Precise["default"].stringNeg(rawAmount);
        }
        const request = {
            'market': market['id'],
            'market_type': 'FUTURES',
            'amount': requestAmount,
        };
        const response = await this.v2PrivatePostFuturesAdjustPositionMargin(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "adl_level": 1,
        //             "ath_margin_size": "2.034928",
        //             "ath_position_amount": "0.0001",
        //             "avg_entry_price": "61047.84",
        //             "bkr_price": "30698.5600000000000004142",
        //             "close_avbl": "0.0001",
        //             "cml_position_value": "6.104784",
        //             "created_at": 1715488472908,
        //             "leverage": "3",
        //             "liq_price": "30852.82412060301507579316",
        //             "maintenance_margin_rate": "0.005",
        //             "maintenance_margin_value": "0.03051465",
        //             "margin_avbl": "3.034928",
        //             "margin_mode": "isolated",
        //             "market": "BTCUSDT",
        //             "market_type": "FUTURES",
        //             "max_position_value": "6.104784",
        //             "open_interest": "0.0001",
        //             "position_id": 306458800,
        //             "position_margin_rate": "0.49713929272518077625",
        //             "realized_pnl": "-0.003052392",
        //             "settle_price": "61047.84",
        //             "settle_value": "6.104784",
        //             "side": "long",
        //             "stop_loss_price": "0",
        //             "stop_loss_type": "",
        //             "take_profit_price": "0",
        //             "take_profit_type": "",
        //             "unrealized_pnl": "0",
        //             "updated_at": 1715488805563
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data');
        const status = this.safeStringLower(response, 'message');
        const type = (addOrReduce === 'reduce') ? 'reduce' : 'add';
        return this.extend(this.parseMarginModification(data, market), {
            'type': type,
            'amount': this.parseNumber(amount),
            'status': status,
        });
    }
    parseMarginModification(data, market = undefined) {
        //
        // addMargin/reduceMargin
        //
        //     {
        //         "adl_level": 1,
        //         "ath_margin_size": "2.034928",
        //         "ath_position_amount": "0.0001",
        //         "avg_entry_price": "61047.84",
        //         "bkr_price": "30698.5600000000000004142",
        //         "close_avbl": "0.0001",
        //         "cml_position_value": "6.104784",
        //         "created_at": 1715488472908,
        //         "leverage": "3",
        //         "liq_price": "30852.82412060301507579316",
        //         "maintenance_margin_rate": "0.005",
        //         "maintenance_margin_value": "0.03051465",
        //         "margin_avbl": "3.034928",
        //         "margin_mode": "isolated",
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "max_position_value": "6.104784",
        //         "open_interest": "0.0001",
        //         "position_id": 306458800,
        //         "position_margin_rate": "0.49713929272518077625",
        //         "realized_pnl": "-0.003052392",
        //         "settle_price": "61047.84",
        //         "settle_value": "6.104784",
        //         "side": "long",
        //         "stop_loss_price": "0",
        //         "stop_loss_type": "",
        //         "take_profit_price": "0",
        //         "take_profit_type": "",
        //         "unrealized_pnl": "0",
        //         "updated_at": 1715488805563
        //     }
        //
        // fetchMarginAdjustmentHistory
        //
        //     {
        //         "bkr_pirce": "24698.56000000000000005224",
        //         "created_at": 1715489978697,
        //         "leverage": "3",
        //         "liq_price": "24822.67336683417085432386",
        //         "margin_avbl": "3.634928",
        //         "margin_change": "-1.5",
        //         "margin_mode": "isolated",
        //         "market": "BTCUSDT",
        //         "market_type": "FUTURES",
        //         "open_interest": "0.0001",
        //         "position_id": 306458800,
        //         "settle_price": "61047.84"
        //     }
        //
        const marketId = this.safeString(data, 'market');
        const timestamp = this.safeInteger2(data, 'updated_at', 'created_at');
        const change = this.safeString(data, 'margin_change');
        return {
            'info': data,
            'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
            'type': undefined,
            'marginMode': 'isolated',
            'amount': this.parseNumber(Precise["default"].stringAbs(change)),
            'total': this.safeNumber(data, 'margin_avbl'),
            'code': market['quote'],
            'status': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name coinex#addMargin
     * @description add margin
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    /**
     * @method
     * @name coinex#reduceMargin
     * @description remove margin from a position
     * @see https://docs.coinex.com/api/v2/futures/position/http/adjust-position-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'reduce', params);
    }
    /**
     * @method
     * @name coinex#fetchFundingHistory
     * @description fetch the history of funding fee payments paid and received on this account
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-position-funding-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'market': market['id'],
            'market_type': 'FUTURES',
        };
        [request, params] = this.handleUntilOption('end_time', request, params);
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetFuturesPositionFundingHistory(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "ccy": "USDT",
        //                 "created_at": 1715673620183,
        //                 "funding_rate": "0",
        //                 "funding_value": "0",
        //                 "market": "BTCUSDT",
        //                 "market_type": "FUTURES",
        //                 "position_id": 306458800,
        //                 "side": "long"
        //             },
        //         ],
        //         "message": "OK",
        //         "pagination": {
        //             "has_next": true
        //         }
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger(entry, 'created_at');
            const currencyId = this.safeString(entry, 'ccy');
            const code = this.safeCurrencyCode(currencyId);
            result.push({
                'info': entry,
                'symbol': symbol,
                'code': code,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'id': this.safeNumber(entry, 'position_id'),
                'amount': this.safeNumber(entry, 'funding_value'),
            });
        }
        return result;
    }
    /**
     * @method
     * @name coinex#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate
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
            'market': market['id'],
        };
        const response = await this.v2PublicGetFuturesFundingRate(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "latest_funding_rate": "0",
        //                 "latest_funding_time": 1715731200000,
        //                 "mark_price": "61602.22",
        //                 "market": "BTCUSDT",
        //                 "max_funding_rate": "0.00375",
        //                 "min_funding_rate": "-0.00375",
        //                 "next_funding_rate": "0.00021074",
        //                 "next_funding_time": 1715760000000
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const first = this.safeDict(data, 0, {});
        return this.parseFundingRate(first, market);
    }
    /**
     * @method
     * @name coinex#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingInterval(symbol, params = {}) {
        return await this.fetchFundingRate(symbol, params);
    }
    parseFundingRate(contract, market = undefined) {
        //
        // fetchFundingRate, fetchFundingRates, fetchFundingInterval
        //
        //     {
        //         "latest_funding_rate": "0",
        //         "latest_funding_time": 1715731200000,
        //         "mark_price": "61602.22",
        //         "market": "BTCUSDT",
        //         "max_funding_rate": "0.00375",
        //         "min_funding_rate": "-0.00375",
        //         "next_funding_rate": "0.00021074",
        //         "next_funding_time": 1715760000000
        //     }
        //
        const currentFundingTimestamp = this.safeInteger(contract, 'latest_funding_time');
        const futureFundingTimestamp = this.safeInteger(contract, 'next_funding_time');
        const fundingTimeString = this.safeString(contract, 'latest_funding_time');
        const nextFundingTimeString = this.safeString(contract, 'next_funding_time');
        const millisecondsInterval = Precise["default"].stringSub(nextFundingTimeString, fundingTimeString);
        const marketId = this.safeString(contract, 'market');
        return {
            'info': contract,
            'symbol': this.safeSymbol(marketId, market, undefined, 'swap'),
            'markPrice': this.safeNumber(contract, 'mark_price'),
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': this.safeNumber(contract, 'latest_funding_rate'),
            'fundingTimestamp': currentFundingTimestamp,
            'fundingDatetime': this.iso8601(currentFundingTimestamp),
            'nextFundingRate': this.safeNumber(contract, 'next_funding_rate'),
            'nextFundingTimestamp': futureFundingTimestamp,
            'nextFundingDatetime': this.iso8601(futureFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': this.parseFundingInterval(millisecondsInterval),
        };
    }
    parseFundingInterval(interval) {
        const intervals = {
            '3600000': '1h',
            '14400000': '4h',
            '28800000': '8h',
            '57600000': '16h',
            '86400000': '24h',
        };
        return this.safeString(intervals, interval, interval);
    }
    /**
     * @method
     * @name coinex#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRates(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeValue(symbols, 0);
            market = this.market(symbol);
            if (!market['swap']) {
                throw new errors.BadSymbol(this.id + ' fetchFundingRates() supports swap contracts only');
            }
            const marketIds = this.marketIds(symbols);
            request['market'] = marketIds.join(',');
        }
        const response = await this.v2PublicGetFuturesFundingRate(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "latest_funding_rate": "0",
        //                 "latest_funding_time": 1715731200000,
        //                 "mark_price": "61602.22",
        //                 "market": "BTCUSDT",
        //                 "max_funding_rate": "0.00375",
        //                 "min_funding_rate": "-0.00375",
        //                 "next_funding_rate": "0.00021074",
        //                 "next_funding_time": 1715760000000
        //             }
        //         ],
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = this.parseFundingRates(data, market);
        return this.filterByArray(result, 'symbol', symbols);
    }
    /**
     * @method
     * @name coinex#withdraw
     * @description make a withdrawal
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        this.checkAddress(address);
        await this.loadMarkets();
        const currency = this.currency(code);
        if (tag) {
            address = address + ':' + tag;
        }
        const request = {
            'ccy': currency['id'],
            'to_address': address,
            'amount': this.numberToString(amount), // the actual amount without fees, https://www.coinex.com/fees
        };
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId(networkCode); // required for on-chain, not required for inter-user transfer
        }
        const response = await this.v2PrivatePostAssetsWithdraw(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "withdraw_id": 31193755,
        //             "created_at": 1716874165038,
        //             "withdraw_method": "ON_CHAIN",
        //             "ccy": "USDT",
        //             "amount": "17.3",
        //             "actual_amount": "15",
        //             "chain": "TRC20",
        //             "tx_fee": "2.3",
        //             "fee_asset": "USDT",
        //             "fee_amount": "2.3",
        //             "to_address": "TY5vq3MT6b5cQVAHWHtpGyPg1ERcQgi3UN",
        //             "memo": "",
        //             "tx_id": "",
        //             "confirmations": 0,
        //             "explorer_address_url": "https://tronscan.org/#/address/TY5vq3MT6b5cQVAHWHtpGyPg1ERcQgi3UN",
        //             "explorer_tx_url": "https://tronscan.org/#/transaction/",
        //             "remark": "",
        //             "status": "audit_required"
        //         },
        //         "message": "OK"
        //     }
        //
        const transaction = this.safeDict(response, 'data', {});
        return this.parseTransaction(transaction, currency);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'audit': 'pending',
            'pass': 'pending',
            'audit_required': 'pending',
            'processing': 'pending',
            'confirming': 'pending',
            'not_pass': 'failed',
            'cancel': 'canceled',
            'finish': 'ok',
            'finished': 'ok',
            'fail': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name coinex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.coinex.com/api/v2/futures/market/http/list-market-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params, 1000);
        }
        const market = this.market(symbol);
        let request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        const response = await this.v2PublicGetFuturesFundingRateHistory(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "actual_funding_rate": "0",
        //                 "funding_time": 1715731221761,
        //                 "market": "BTCUSDT",
        //                 "theoretical_funding_rate": "0"
        //             },
        //         ],
        //         "message": "OK",
        //         "pagination": {
        //             "has_next": true
        //         }
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString(entry, 'market');
            const symbolInner = this.safeSymbol(marketId, market, undefined, 'swap');
            const timestamp = this.safeInteger(entry, 'funding_time');
            rates.push({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber(entry, 'actual_funding_rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "deposit_id": 5173806,
        //         "created_at": 1714021652557,
        //         "tx_id": "d9f47d2550397c635cb89a8963118f8fe78ef048bc8b6f0caaeaa7dc6",
        //         "tx_id_display": "",
        //         "ccy": "USDT",
        //         "chain": "TRC20",
        //         "deposit_method": "ON_CHAIN",
        //         "amount": "30",
        //         "actual_amount": "",
        //         "to_address": "TYewD2pVWDUwfNr9A",
        //         "confirmations": 20,
        //         "status": "FINISHED",
        //         "tx_explorer_url": "https://tronscan.org/#/transaction",
        //         "to_addr_explorer_url": "https://tronscan.org/#/address",
        //         "remark": ""
        //     }
        //
        // fetchWithdrawals and withdraw
        //
        //     {
        //         "withdraw_id": 259364,
        //         "created_at": 1701323541548,
        //         "withdraw_method": "ON_CHAIN",
        //         "ccy": "USDT",
        //         "amount": "23.845744",
        //         "actual_amount": "22.445744",
        //         "chain": "TRC20",
        //         "tx_fee": "1.4",
        //         "fee_asset": "USDT",
        //         "fee_amount": "1.4",
        //         "to_address": "T8t5i2454dhdhnnnGdi49vMbihvY",
        //         "memo": "",
        //         "tx_id": "1237623941964de9954ed2e36640228d78765c1026",
        //         "confirmations": 18,
        //         "explorer_address_url": "https://tronscan.org/#/address",
        //         "explorer_tx_url": "https://tronscan.org/#/transaction",
        //         "remark": "",
        //         "status": "finished"
        //     }
        //
        const address = this.safeString(transaction, 'to_address');
        let tag = this.safeString(transaction, 'memo');
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let remark = this.safeString(transaction, 'remark');
        if (remark !== undefined) {
            if (remark.length < 1) {
                remark = undefined;
            }
        }
        let txid = this.safeString(transaction, 'tx_id');
        if (txid !== undefined) {
            if (txid.length < 1) {
                txid = undefined;
            }
        }
        const currencyId = this.safeString(transaction, 'ccy');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.safeInteger(transaction, 'created_at');
        const type = ('withdraw_id' in transaction) ? 'withdrawal' : 'deposit';
        const networkId = this.safeString(transaction, 'chain');
        let feeCost = this.safeString(transaction, 'tx_fee');
        const transferMethod = this.safeStringLower2(transaction, 'withdraw_method', 'deposit_method');
        const internal = transferMethod === 'local';
        let amount = this.safeNumber(transaction, 'actual_amount');
        if (amount === undefined) {
            amount = this.safeNumber(transaction, 'amount');
        }
        if (type === 'deposit') {
            feeCost = '0';
        }
        const feeCurrencyId = this.safeString(transaction, 'fee_asset');
        const fee = {
            'cost': this.parseNumber(feeCost),
            'currency': this.safeCurrencyCode(feeCurrencyId),
        };
        return {
            'info': transaction,
            'id': this.safeString2(transaction, 'withdraw_id', 'deposit_id'),
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.networkIdToCode(networkId),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': this.parseTransactionStatus(this.safeString(transaction, 'status')),
            'updated': undefined,
            'fee': fee,
            'comment': remark,
            'internal': internal,
        };
    }
    /**
     * @method
     * @name coinex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.coinex.com/api/v2/assets/transfer/http/transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] unified ccxt symbol, required when either the fromAccount or toAccount is margin
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const amountToPrecision = this.currencyToPrecision(code, amount);
        const accountsByType = this.safeDict(this.options, 'accountsByType', {});
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, toAccount);
        const request = {
            'ccy': currency['id'],
            'amount': amountToPrecision,
            'from_account_type': fromId,
            'to_account_type': toId,
        };
        if ((fromAccount === 'margin') || (toAccount === 'margin')) {
            const symbol = this.safeString(params, 'symbol');
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' transfer() the symbol parameter must be defined for a margin account');
            }
            params = this.omit(params, 'symbol');
            request['market'] = this.marketId(symbol);
        }
        if ((fromAccount !== 'spot') && (toAccount !== 'spot')) {
            throw new errors.BadRequest(this.id + ' transfer() can only be between spot and swap, or spot and margin, either the fromAccount or toAccount must be spot');
        }
        const response = await this.v2PrivatePostAssetsTransfer(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {},
        //         "message": "OK"
        //     }
        //
        return this.extend(this.parseTransfer(response, currency), {
            'amount': this.parseNumber(amountToPrecision),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }
    parseTransferStatus(status) {
        const statuses = {
            '0': 'ok',
            'SUCCESS': 'ok',
            'OK': 'ok',
            'finished': 'ok',
            'FINISHED': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransfer(transfer, currency = undefined) {
        const timestamp = this.safeInteger(transfer, 'created_at');
        const currencyId = this.safeString(transfer, 'ccy');
        const fromId = this.safeString(transfer, 'from_account_type');
        const toId = this.safeString(transfer, 'to_account_type');
        const accountsById = this.safeValue(this.options, 'accountsById', {});
        return {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.safeString(accountsById, fromId, fromId),
            'toAccount': this.safeString(accountsById, toId, toId),
            'status': this.parseTransferStatus(this.safeString2(transfer, 'code', 'status')),
        };
    }
    /**
     * @method
     * @name coinex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.coinex.com/api/v2/assets/transfer/http/list-transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' for fetching transfers to and from your margin account
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchTransfers() requires a code argument');
        }
        const currency = this.currency(code);
        let request = {
            'ccy': currency['id'],
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchTransfers', params);
        if (marginMode !== undefined) {
            request['transfer_type'] = 'MARGIN';
        }
        else {
            request['transfer_type'] = 'FUTURES';
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        const response = await this.v2PrivateGetAssetsTransferHistory(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "created_at": 1715848480646,
        //                 "from_account_type": "SPOT",
        //                 "to_account_type": "FUTURES",
        //                 "ccy": "USDT",
        //                 "amount": "10",
        //                 "status": "finished"
        //             },
        //         ],
        //         "pagination": {
        //             "total": 8,
        //             "has_next": false
        //         },
        //         "code": 0,
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransfers(data, currency, since, limit);
    }
    /**
     * @method
     * @name coinex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-withdrawal-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetAssetsWithdraw(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "withdraw_id": 259364,
        //                 "created_at": 1701323541548,
        //                 "withdraw_method": "ON_CHAIN",
        //                 "ccy": "USDT",
        //                 "amount": "23.845744",
        //                 "actual_amount": "22.445744",
        //                 "chain": "TRC20",
        //                 "tx_fee": "1.4",
        //                 "fee_asset": "USDT",
        //                 "fee_amount": "1.4",
        //                 "to_address": "T8t5i2454dhdhnnnGdi49vMbihvY",
        //                 "memo": "",
        //                 "tx_id": "1237623941964de9954ed2e36640228d78765c1026",
        //                 "confirmations": 18,
        //                 "explorer_address_url": "https://tronscan.org/#/address",
        //                 "explorer_tx_url": "https://tronscan.org/#/transaction",
        //                 "remark": "",
        //                 "status": "finished"
        //             },
        //         ],
        //         "pagination": {
        //             "total": 9,
        //             "has_next": true
        //         },
        //         "code": 0,
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit);
    }
    /**
     * @method
     * @name coinex#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/list-deposit-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['ccy'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetAssetsDepositHistory(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "deposit_id": 5173806,
        //                 "created_at": 1714021652557,
        //                 "tx_id": "d9f47d2550397c635cb89a8963118f8fe78ef048bc8b6f0caaeaa7dc6",
        //                 "tx_id_display": "",
        //                 "ccy": "USDT",
        //                 "chain": "TRC20",
        //                 "deposit_method": "ON_CHAIN",
        //                 "amount": "30",
        //                 "actual_amount": "",
        //                 "to_address": "TYewD2pVWDUwfNr9A",
        //                 "confirmations": 20,
        //                 "status": "FINISHED",
        //                 "tx_explorer_url": "https://tronscan.org/#/transaction",
        //                 "to_addr_explorer_url": "https://tronscan.org/#/address",
        //                 "remark": ""
        //             },
        //         ],
        //         "paginatation": {
        //             "total": 8,
        //             "has_next": true
        //         },
        //         "code": 0,
        //         "message": "OK"
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransactions(data, currency, since, limit);
    }
    parseIsolatedBorrowRate(info, market = undefined) {
        //
        //     {
        //         "market": "BTCUSDT",
        //         "ccy": "USDT",
        //         "leverage": 10,
        //         "min_amount": "60",
        //         "max_amount": "500000",
        //         "daily_interest_rate": "0.001"
        //     }
        //
        const marketId = this.safeString(info, 'market');
        market = this.safeMarket(marketId, market, undefined, 'spot');
        const currency = this.safeString(info, 'ccy');
        const rate = this.safeNumber(info, 'daily_interest_rate');
        let baseRate = undefined;
        let quoteRate = undefined;
        if (currency === market['baseId']) {
            baseRate = rate;
        }
        else if (currency === market['quoteId']) {
            quoteRate = rate;
        }
        return {
            'symbol': market['symbol'],
            'base': market['base'],
            'baseRate': baseRate,
            'quote': market['quote'],
            'quoteRate': quoteRate,
            'period': 86400000,
            'timestamp': undefined,
            'datetime': undefined,
            'info': info,
        };
    }
    /**
     * @method
     * @name coinex#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit
     * @param {string} symbol unified symbol of the market to fetch the borrow rate for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.code unified currency code
     * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    async fetchIsolatedBorrowRate(symbol, params = {}) {
        await this.loadMarkets();
        const code = this.safeString(params, 'code');
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchIsolatedBorrowRate() requires a code parameter');
        }
        params = this.omit(params, 'code');
        const currency = this.currency(code);
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'ccy': currency['id'],
        };
        const response = await this.v2PrivateGetAssetsMarginInterestLimit(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "market": "BTCUSDT",
        //             "ccy": "USDT",
        //             "leverage": 10,
        //             "min_amount": "60",
        //             "max_amount": "500000",
        //             "daily_interest_rate": "0.001"
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseIsolatedBorrowRate(data, market);
    }
    /**
     * @method
     * @name coinex#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-borrow-history
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest(code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetAssetsMarginBorrowHistory(this.extend(request, params));
        //
        //     {
        //         "data": [
        //             {
        //                 "borrow_id": 2642934,
        //                 "created_at": 1654761016000,
        //                 "market": "BTCUSDT",
        //                 "ccy": "USDT",
        //                 "daily_interest_rate": "0.001",
        //                 "expired_at": 1655625016000,
        //                 "borrow_amount": "100",
        //                 "to_repaied_amount": "0",
        //                 "is_auto_renew": false,
        //                 "status": "finish"
        //             },
        //         ],
        //         "pagination": {
        //             "total": 4,
        //             "has_next": true
        //         },
        //         "code": 0,
        //         "message": "OK"
        //     }
        //
        const rows = this.safeValue(response, 'data', []);
        const interest = this.parseBorrowInterests(rows, market);
        return this.filterByCurrencySinceLimit(interest, code, since, limit);
    }
    parseBorrowInterest(info, market = undefined) {
        //
        //     {
        //         "borrow_id": 2642934,
        //         "created_at": 1654761016000,
        //         "market": "BTCUSDT",
        //         "ccy": "USDT",
        //         "daily_interest_rate": "0.001",
        //         "expired_at": 1655625016000,
        //         "borrow_amount": "100",
        //         "to_repaied_amount": "0",
        //         "is_auto_renew": false,
        //         "status": "finish"
        //     }
        //
        const marketId = this.safeString(info, 'market');
        market = this.safeMarket(marketId, market, undefined, 'spot');
        const timestamp = this.safeInteger(info, 'expired_at');
        return {
            'info': info,
            'symbol': market['symbol'],
            'currency': this.safeCurrencyCode(this.safeString(info, 'ccy')),
            'interest': this.safeNumber(info, 'to_repaied_amount'),
            'interestRate': this.safeNumber(info, 'daily_interest_rate'),
            'amountBorrowed': this.safeNumber(info, 'borrow_amount'),
            'marginMode': 'isolated',
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    /**
     * @method
     * @name coinex#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-borrow
     * @param {string} symbol unified market symbol, required for coinex
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.isAutoRenew] whether to renew the margin loan automatically or not, default is false
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async borrowIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const currency = this.currency(code);
        const isAutoRenew = this.safeBool2(params, 'isAutoRenew', 'is_auto_renew', false);
        params = this.omit(params, 'isAutoRenew');
        const request = {
            'market': market['id'],
            'ccy': currency['id'],
            'borrow_amount': this.currencyToPrecision(code, amount),
            'is_auto_renew': isAutoRenew,
        };
        const response = await this.v2PrivatePostAssetsMarginBorrow(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "borrow_id": 13784021,
        //             "market": "BTCUSDT",
        //             "ccy": "USDT",
        //             "daily_interest_rate": "0.001",
        //             "expired_at": 1717299948340,
        //             "borrow_amount": "60",
        //             "to_repaied_amount": "60.0025",
        //             "status": "loan"
        //         },
        //         "message": "OK"
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
     * @name coinex#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/margin-repay
     * @param {string} symbol unified market symbol, required for coinex
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.borrow_id] extra parameter that is not required
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async repayIsolatedMargin(symbol, code, amount, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const currency = this.currency(code);
        const request = {
            'market': market['id'],
            'ccy': currency['id'],
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.v2PrivatePostAssetsMarginRepay(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {},
        //         "message": "OK"
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
        //     {
        //         "borrow_id": 13784021,
        //         "market": "BTCUSDT",
        //         "ccy": "USDT",
        //         "daily_interest_rate": "0.001",
        //         "expired_at": 1717299948340,
        //         "borrow_amount": "60",
        //         "to_repaied_amount": "60.0025",
        //         "status": "loan"
        //     }
        //
        const currencyId = this.safeString(info, 'ccy');
        const marketId = this.safeString(info, 'market');
        const timestamp = this.safeInteger(info, 'expired_at');
        return {
            'id': this.safeInteger(info, 'borrow_id'),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeString(info, 'borrow_amount'),
            'symbol': this.safeSymbol(marketId, undefined, undefined, 'spot'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': info,
        };
    }
    /**
     * @method
     * @name coinex#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @see https://docs.coinex.com/api/v2/assets/deposit-withdrawal/http/get-deposit-withdrawal-config
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFee(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'ccy': currency['id'],
        };
        const response = await this.v2PublicGetAssetsDepositWithdrawConfig(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "asset": {
        //                 "ccy": "USDT",
        //                 "deposit_enabled": true,
        //                 "withdraw_enabled": true,
        //                 "inter_transfer_enabled": true,
        //                 "is_st": false
        //             },
        //             "chains": [
        //                 {
        //                     "chain": "TRC20",
        //                     "min_deposit_amount": "2.4",
        //                     "min_withdraw_amount": "2.4",
        //                     "deposit_enabled": true,
        //                     "withdraw_enabled": true,
        //                     "deposit_delay_minutes": 0,
        //                     "safe_confirmations": 10,
        //                     "irreversible_confirmations": 20,
        //                     "deflation_rate": "0",
        //                     "withdrawal_fee": "2.4",
        //                     "withdrawal_precision": 6,
        //                     "memo": "",
        //                     "is_memo_required_for_deposit": false,
        //                     "explorer_asset_url": "https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        //                 },
        //             ]
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositWithdrawFee(data, currency);
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //     {
        //         "asset": {
        //             "ccy": "USDT",
        //             "deposit_enabled": true,
        //             "withdraw_enabled": true,
        //             "inter_transfer_enabled": true,
        //             "is_st": false
        //         },
        //         "chains": [
        //             {
        //                 "chain": "TRC20",
        //                 "min_deposit_amount": "2.4",
        //                 "min_withdraw_amount": "2.4",
        //                 "deposit_enabled": true,
        //                 "withdraw_enabled": true,
        //                 "deposit_delay_minutes": 0,
        //                 "safe_confirmations": 10,
        //                 "irreversible_confirmations": 20,
        //                 "deflation_rate": "0",
        //                 "withdrawal_fee": "2.4",
        //                 "withdrawal_precision": 6,
        //                 "memo": "",
        //                 "is_memo_required_for_deposit": false,
        //                 "explorer_asset_url": "https://tronscan.org/#/token20/TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
        //             },
        //         ]
        //     }
        //
        const result = {
            'info': fee,
            'withdraw': {
                'fee': undefined,
                'percentage': undefined,
            },
            'deposit': {
                'fee': undefined,
                'percentage': undefined,
            },
            'networks': {},
        };
        const chains = this.safeList(fee, 'chains', []);
        const asset = this.safeDict(fee, 'asset', {});
        for (let i = 0; i < chains.length; i++) {
            const entry = chains[i];
            const isWithdrawEnabled = this.safeBool(entry, 'withdraw_enabled');
            if (isWithdrawEnabled) {
                result['withdraw']['fee'] = this.safeNumber(entry, 'withdrawal_fee');
                result['withdraw']['percentage'] = false;
                const networkId = this.safeString(entry, 'chain');
                if (networkId) {
                    const networkCode = this.networkIdToCode(networkId, this.safeString(asset, 'ccy'));
                    result['networks'][networkCode] = {
                        'withdraw': {
                            'fee': this.safeNumber(entry, 'withdrawal_fee'),
                            'percentage': false,
                        },
                        'deposit': {
                            'fee': undefined,
                            'percentage': undefined,
                        },
                    };
                }
            }
        }
        return result;
    }
    /**
     * @method
     * @name coinex#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://docs.coinex.com/api/v2/assets/loan-flat/http/list-margin-interest-limit
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.code unified currency code
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const code = this.safeString(params, 'code');
        if (code === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchLeverage() requires a code parameter');
        }
        params = this.omit(params, 'code');
        const currency = this.currency(code);
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'ccy': currency['id'],
        };
        const response = await this.v2PrivateGetAssetsMarginInterestLimit(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "market": "BTCUSDT",
        //             "ccy": "USDT",
        //             "leverage": 10,
        //             "min_amount": "50",
        //             "max_amount": "500000",
        //             "daily_interest_rate": "0.001"
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        //
        //     {
        //         "market": "BTCUSDT",
        //         "ccy": "USDT",
        //         "leverage": 10,
        //         "min_amount": "50",
        //         "max_amount": "500000",
        //         "daily_interest_rate": "0.001"
        //     }
        //
        const marketId = this.safeString(leverage, 'market');
        const leverageValue = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market, undefined, 'spot'),
            'marginMode': 'isolated',
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    /**
     * @method
     * @name coinex#fetchPositionHistory
     * @description fetches historical positions
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-finished-position
     * @param {string} symbol unified contract symbol
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum amount of records to fetch, default is 10
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] the latest time in ms to fetch positions for
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionHistory(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'market_type': 'FUTURES',
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        [request, params] = this.handleUntilOption('end_time', request, params);
        const response = await this.v2PrivateGetFuturesFinishedPosition(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "position_id": 305891033,
        //                 "market": "BTCUSDT",
        //                 "market_type": "FUTURES",
        //                 "side": "long",
        //                 "margin_mode": "cross",
        //                 "open_interest": "0.0001",
        //                 "close_avbl": "0.0001",
        //                 "ath_position_amount": "0.0001",
        //                 "unrealized_pnl": "0",
        //                 "realized_pnl": "-0.00311684",
        //                 "avg_entry_price": "62336.8",
        //                 "cml_position_value": "6.23368",
        //                 "max_position_value": "6.23368",
        //                 "created_at": 1715152208041,
        //                 "updated_at": 1715152208041,
        //                 "take_profit_price": "0",
        //                 "stop_loss_price": "0",
        //                 "take_profit_type": "",
        //                 "stop_loss_type": "",
        //                 "settle_price": "62336.8",
        //                 "settle_value": "6.23368",
        //                 "leverage": "3",
        //                 "margin_avbl": "2.07789333",
        //                 "ath_margin_size": "2.07789333",
        //                 "position_margin_rate": "2.40545879023305655728",
        //                 "maintenance_margin_rate": "0.005",
        //                 "maintenance_margin_value": "0.03118094",
        //                 "liq_price": "0",
        //                 "bkr_price": "0",
        //                 "adl_level": 1
        //             }
        //         ],
        //         "message": "OK",
        //         "pagination": {
        //             "has_next": false
        //         }
        //     }
        //
        const records = this.safeList(response, 'data', []);
        const positions = this.parsePositions(records);
        return this.filterBySymbolSinceLimit(positions, symbol, since, limit);
    }
    /**
     * @method
     * @name coinex#closePosition
     * @description closes an open position for a market
     * @see https://docs.coinex.com/api/v2/futures/position/http/close-position
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] buy or sell, not used by coinex
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.type required by coinex, one of: limit, market, maker_only, ioc or fok, default is *market*
     * @param {string} [params.price] the price to fulfill the order, ignored in market orders
     * @param {string} [params.amount] the amount to trade in units of the base currency
     * @param {string} [params.clientOrderId] the client id of the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async closePosition(symbol, side = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const type = this.safeString(params, 'type', 'market');
        const request = {
            'market': market['id'],
            'market_type': 'FUTURES',
            'type': type,
        };
        const clientOrderId = this.safeString2(params, 'client_id', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['client_id'] = clientOrderId;
        }
        params = this.omit(params, 'clientOrderId');
        const response = await this.v2PrivatePostFuturesClosePosition(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "amount": "0.0001",
        //             "client_id": "",
        //             "created_at": 1729666043969,
        //             "fee": "0.00335858",
        //             "fee_ccy": "USDT",
        //             "filled_amount": "0.0001",
        //             "filled_value": "6.717179",
        //             "last_filled_amount": "0.0001",
        //             "last_filled_price": "67171.79",
        //             "maker_fee_rate": "0",
        //             "market": "BTCUSDT",
        //             "market_type": "FUTURES",
        //             "order_id": 155477479761,
        //             "price": "0",
        //             "realized_pnl": "-0.001823",
        //             "side": "sell",
        //             "taker_fee_rate": "0.0005",
        //             "type": "market",
        //             "unfilled_amount": "0",
        //             "updated_at": 1729666043969
        //         },
        //         "message": "OK"
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    handleMarginModeAndParams(methodName, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {Array} the marginMode in lowercase
         */
        const defaultType = this.safeString(this.options, 'defaultType');
        const isMargin = this.safeBool(params, 'margin', false);
        let marginMode = undefined;
        [marginMode, params] = super.handleMarginModeAndParams(methodName, params, defaultValue);
        if (marginMode === undefined) {
            if ((defaultType === 'margin') || (isMargin === true)) {
                marginMode = 'isolated';
            }
        }
        return [marginMode, params];
    }
    nonce() {
        return this.milliseconds();
    }
    sign(path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams(path, params);
        const version = api[0];
        const requestUrl = api[1];
        let url = this.urls['api'][requestUrl] + '/' + version + '/' + path;
        let query = this.omit(params, this.extractParams(path));
        const nonce = this.nonce().toString();
        if (method === 'POST') {
            const parts = path.split('/');
            const firstPart = this.safeString(parts, 0, '');
            const numParts = parts.length;
            const lastPart = this.safeString(parts, numParts - 1, '');
            const lastWords = lastPart.split('_');
            const numWords = lastWords.length;
            const lastWord = this.safeString(lastWords, numWords - 1, '');
            if ((firstPart === 'order') && (lastWord === 'limit' || lastWord === 'market')) {
                // inject in implicit API calls
                // POST /order/limit - Place limit orders
                // POST /order/market - Place market orders
                // POST /order/stop/limit - Place stop limit orders
                // POST /order/stop/market - Place stop market orders
                // POST /perpetual/v1/order/put_limit - Place limit orders
                // POST /perpetual/v1/order/put_market - Place market orders
                // POST /perpetual/v1/order/put_stop_limit - Place stop limit orders
                // POST /perpetual/v1/order/put_stop_market - Place stop market orders
                const clientOrderId = this.safeString(params, 'client_id');
                if (clientOrderId === undefined) {
                    const defaultId = 'x-167673045';
                    const brokerId = this.safeValue(this.options, 'brokerId', defaultId);
                    query['client_id'] = brokerId + '_' + this.uuid16();
                }
            }
        }
        if (requestUrl === 'perpetualPrivate') {
            this.checkRequiredCredentials();
            query = this.extend({
                'access_id': this.apiKey,
                'timestamp': nonce,
            }, query);
            query = this.keysort(query);
            const urlencoded = this.rawencode(query);
            const signature = this.hash(this.encode(urlencoded + '&secret_key=' + this.secret), sha256.sha256);
            headers = {
                'Authorization': signature.toLowerCase(),
                'AccessId': this.apiKey,
            };
            if ((method === 'GET') || (method === 'PUT')) {
                url += '?' + urlencoded;
            }
            else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = urlencoded;
            }
        }
        else if (requestUrl === 'public' || requestUrl === 'perpetualPublic') {
            if (Object.keys(query).length) {
                url += '?' + this.urlencode(query);
            }
        }
        else {
            if (version === 'v1') {
                this.checkRequiredCredentials();
                query = this.extend({
                    'access_id': this.apiKey,
                    'tonce': nonce,
                }, query);
                query = this.keysort(query);
                const urlencoded = this.rawencode(query);
                const signature = this.hash(this.encode(urlencoded + '&secret_key=' + this.secret), md5.md5);
                headers = {
                    'Authorization': signature.toUpperCase(),
                    'Content-Type': 'application/json',
                };
                if ((method === 'GET') || (method === 'DELETE') || (method === 'PUT')) {
                    url += '?' + urlencoded;
                }
                else {
                    body = this.json(query);
                }
            }
            else if (version === 'v2') {
                this.checkRequiredCredentials();
                query = this.keysort(query);
                const urlencoded = this.rawencode(query);
                let preparedString = method + '/' + version + '/' + path;
                if (method === 'POST') {
                    body = this.json(query);
                    preparedString += body;
                }
                else if (urlencoded) {
                    preparedString += '?' + urlencoded;
                }
                preparedString += nonce + this.secret;
                const signature = this.hash(this.encode(preparedString), sha256.sha256);
                headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-COINEX-KEY': this.apiKey,
                    'X-COINEX-SIGN': signature,
                    'X-COINEX-TIMESTAMP': nonce,
                };
                if (method !== 'POST') {
                    if (urlencoded) {
                        url += '?' + urlencoded;
                    }
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const code = this.safeString(response, 'code');
        const data = this.safeValue(response, 'data');
        const message = this.safeString(response, 'message');
        if ((code !== '0') || ((message !== 'Success') && (message !== 'Succeeded') && (message.toLowerCase() !== 'ok') && !data)) {
            const feedback = this.id + ' ' + message;
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], code, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
    /**
     * @method
     * @name coinex#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://docs.coinex.com/api/v2/futures/position/http/list-position-margin-history
     * @param {string} symbol unified market symbol
     * @param {string} [type] not used by coinex fetchMarginAdjustmentHistory
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum amount of changes to fetch, default is 10
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest change to fetch
     * @param {int} [params.positionId] the id of the position that you want to retrieve margin adjustment history for
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    async fetchMarginAdjustmentHistory(symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMarginAdjustmentHistory() requires a symbol argument');
        }
        const positionId = this.safeInteger2(params, 'positionId', 'position_id');
        params = this.omit(params, 'positionId');
        if (positionId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMarginAdjustmentHistory() requires a positionId parameter');
        }
        const market = this.market(symbol);
        let request = {
            'market': market['id'],
            'market_type': 'FUTURES',
            'position_id': positionId,
        };
        [request, params] = this.handleUntilOption('end_time', request, params);
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.v2PrivateGetFuturesPositionMarginHistory(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "bkr_pirce": "24698.56000000000000005224",
        //                 "created_at": 1715489978697,
        //                 "leverage": "3",
        //                 "liq_price": "24822.67336683417085432386",
        //                 "margin_avbl": "3.634928",
        //                 "margin_change": "-1.5",
        //                 "margin_mode": "isolated",
        //                 "market": "BTCUSDT",
        //                 "market_type": "FUTURES",
        //                 "open_interest": "0.0001",
        //                 "position_id": 306458800,
        //                 "settle_price": "61047.84"
        //             },
        //         ],
        //         "message": "OK",
        //         "pagination": {
        //             "has_next": true
        //         }
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const modifications = this.parseMarginModifications(data, undefined, 'market', 'swap');
        return this.filterBySymbolSinceLimit(modifications, symbol, since, limit);
    }
}

module.exports = coinex;
