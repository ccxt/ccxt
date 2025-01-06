'use strict';

var tokocrypto$1 = require('./abstract/tokocrypto.js');
var number = require('./base/functions/number.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class tokocrypto
 * @augments Exchange
 */
class tokocrypto extends tokocrypto$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'tokocrypto',
            'name': 'Tokocrypto',
            'countries': ['ID'],
            'certified': false,
            'pro': false,
            'version': 'v1',
            // new metainfo interface
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': undefined,
                'borrowMargin': undefined,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createReduceOnlyOrder': undefined,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': undefined,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
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
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/183870484-d3398d0c-f6a1-4cce-91b8-d58792308716.jpg',
                'api': {
                    'rest': {
                        'public': 'https://www.tokocrypto.com',
                        'binance': 'https://api.binance.com/api/v3',
                        'private': 'https://www.tokocrypto.com',
                    },
                },
                'www': 'https://tokocrypto.com',
                // 'referral': 'https://www.binance.us/?ref=35005074',
                'doc': 'https://www.tokocrypto.com/apidocs/',
                'fees': 'https://www.tokocrypto.com/fees/newschedule',
            },
            'api': {
                'binance': {
                    'get': {
                        'ping': 1,
                        'time': 1,
                        'depth': { 'cost': 1, 'byLimit': [[100, 1], [500, 5], [1000, 10], [5000, 50]] },
                        'trades': 1,
                        'aggTrades': 1,
                        'historicalTrades': 5,
                        'klines': 1,
                        'ticker/24hr': { 'cost': 1, 'noSymbol': 40 },
                        'ticker/price': { 'cost': 1, 'noSymbol': 2 },
                        'ticker/bookTicker': { 'cost': 1, 'noSymbol': 2 },
                        'exchangeInfo': 10,
                    },
                    'put': {
                        'userDataStream': 1,
                    },
                    'post': {
                        'userDataStream': 1,
                    },
                    'delete': {
                        'userDataStream': 1,
                    },
                },
                'public': {
                    'get': {
                        'open/v1/common/time': 1,
                        'open/v1/common/symbols': 1,
                        // all the actual symbols are type 1
                        'open/v1/market/depth': 1,
                        'open/v1/market/trades': 1,
                        'open/v1/market/agg-trades': 1,
                        'open/v1/market/klines': 1, // when symbol type is not 1
                    },
                },
                'private': {
                    'get': {
                        'open/v1/orders/detail': 1,
                        'open/v1/orders': 1,
                        'open/v1/account/spot': 1,
                        'open/v1/account/spot/asset': 1,
                        'open/v1/orders/trades': 1,
                        'open/v1/withdraws': 1,
                        'open/v1/deposits': 1,
                        'open/v1/deposits/address': 1,
                    },
                    'post': {
                        'open/v1/orders': 1,
                        'open/v1/orders/cancel': 1,
                        'open/v1/orders/oco': 1,
                        'open/v1/withdraws': 1,
                        'open/v1/user-data-stream': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0075'),
                    'maker': this.parseNumber('0.0075'), // 0.1% trading fee, zero fees for all trading pairs before November 1
                },
            },
            'precisionMode': number.TICK_SIZE,
            'options': {
                // 'fetchTradesMethod': 'binanceGetTrades', // binanceGetTrades, binanceGetAggTrades
                'createMarketBuyOrderRequiresPrice': true,
                'defaultTimeInForce': 'GTC',
                // 'defaultType': 'spot', // 'spot', 'future', 'margin', 'delivery'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                // 'fetchPositions': 'positionRisk', // or 'account'
                'recvWindow': 5 * 1000,
                'timeDifference': 0,
                'adjustForTimeDifference': false,
                'newOrderRespType': {
                    'market': 'FULL',
                    'limit': 'FULL', // we change it from 'ACK' by default to 'FULL' (returns immediately if limit is not hit)
                },
                'quoteOrderQty': false,
                'networks': {
                    'ERC20': 'ETH',
                    'TRC20': 'TRX',
                    'BEP2': 'BNB',
                    'BEP20': 'BSC',
                    'OMNI': 'OMNI',
                    'EOS': 'EOS',
                    'SPL': 'SOL',
                },
                'reverseNetworks': {
                    'tronscan.org': 'TRC20',
                    'etherscan.io': 'ERC20',
                    'bscscan.com': 'BSC',
                    'explorer.binance.org': 'BEP2',
                    'bithomp.com': 'XRP',
                    'bloks.io': 'EOS',
                    'stellar.expert': 'XLM',
                    'blockchair.com/bitcoin': 'BTC',
                    'blockchair.com/bitcoin-cash': 'BCH',
                    'blockchair.com/ecash': 'XEC',
                    'explorer.litecoin.net': 'LTC',
                    'explorer.avax.network': 'AVAX',
                    'solscan.io': 'SOL',
                    'polkadot.subscan.io': 'DOT',
                    'dashboard.internetcomputer.org': 'ICP',
                    'explorer.chiliz.com': 'CHZ',
                    'cardanoscan.io': 'ADA',
                    'mainnet.theoan.com': 'AION',
                    'algoexplorer.io': 'ALGO',
                    'explorer.ambrosus.com': 'AMB',
                    'viewblock.io/zilliqa': 'ZIL',
                    'viewblock.io/arweave': 'AR',
                    'explorer.ark.io': 'ARK',
                    'atomscan.com': 'ATOM',
                    'www.mintscan.io': 'CTK',
                    'explorer.bitcoindiamond.org': 'BCD',
                    'btgexplorer.com': 'BTG',
                    'bts.ai': 'BTS',
                    'explorer.celo.org': 'CELO',
                    'explorer.nervos.org': 'CKB',
                    'cerebro.cortexlabs.ai': 'CTXC',
                    'chainz.cryptoid.info': 'VIA',
                    'explorer.dcrdata.org': 'DCR',
                    'digiexplorer.info': 'DGB',
                    'dock.subscan.io': 'DOCK',
                    'dogechain.info': 'DOGE',
                    'explorer.elrond.com': 'EGLD',
                    'blockscout.com': 'ETC',
                    'explore-fetchhub.fetch.ai': 'FET',
                    'filfox.info': 'FIL',
                    'fio.bloks.io': 'FIO',
                    'explorer.firo.org': 'FIRO',
                    'neoscan.io': 'NEO',
                    'ftmscan.com': 'FTM',
                    'explorer.gochain.io': 'GO',
                    'block.gxb.io': 'GXS',
                    'hash-hash.info': 'HBAR',
                    'www.hiveblockexplorer.com': 'HIVE',
                    'explorer.helium.com': 'HNT',
                    'tracker.icon.foundation': 'ICX',
                    'www.iostabc.com': 'IOST',
                    'explorer.iota.org': 'IOTA',
                    'iotexscan.io': 'IOTX',
                    'irishub.iobscan.io': 'IRIS',
                    'kava.mintscan.io': 'KAVA',
                    'scope.klaytn.com': 'KLAY',
                    'kmdexplorer.io': 'KMD',
                    'kusama.subscan.io': 'KSM',
                    'explorer.lto.network': 'LTO',
                    'polygonscan.com': 'POLYGON',
                    'explorer.ont.io': 'ONT',
                    'minaexplorer.com': 'MINA',
                    'nanolooker.com': 'NANO',
                    'explorer.nebulas.io': 'NAS',
                    'explorer.nbs.plus': 'NBS',
                    'explorer.nebl.io': 'NEBL',
                    'nulscan.io': 'NULS',
                    'nxscan.com': 'NXS',
                    'explorer.harmony.one': 'ONE',
                    'explorer.poa.network': 'POA',
                    'qtum.info': 'QTUM',
                    'explorer.rsk.co': 'RSK',
                    'www.oasisscan.com': 'ROSE',
                    'ravencoin.network': 'RVN',
                    'sc.tokenview.com': 'SC',
                    'secretnodes.com': 'SCRT',
                    'explorer.skycoin.com': 'SKY',
                    'steemscan.com': 'STEEM',
                    'explorer.stacks.co': 'STX',
                    'www.thetascan.io': 'THETA',
                    'scan.tomochain.com': 'TOMO',
                    'explore.vechain.org': 'VET',
                    'explorer.vite.net': 'VITE',
                    'www.wanscan.org': 'WAN',
                    'wavesexplorer.com': 'WAVES',
                    'wax.eosx.io': 'WAXP',
                    'waltonchain.pro': 'WTC',
                    'chain.nem.ninja': 'XEM',
                    'verge-blockchain.info': 'XVG',
                    'explorer.yoyow.org': 'YOYOW',
                    'explorer.zcha.in': 'ZEC',
                    'explorer.zensystem.io': 'ZEN',
                },
                'impliedNetworks': {
                    'ETH': { 'ERC20': 'ETH' },
                    'TRX': { 'TRC20': 'TRX' },
                },
                'legalMoney': {
                    'MXN': true,
                    'UGX': true,
                    'SEK': true,
                    'CHF': true,
                    'VND': true,
                    'AED': true,
                    'DKK': true,
                    'KZT': true,
                    'HUF': true,
                    'PEN': true,
                    'PHP': true,
                    'USD': true,
                    'TRY': true,
                    'EUR': true,
                    'NGN': true,
                    'PLN': true,
                    'BRL': true,
                    'ZAR': true,
                    'KES': true,
                    'ARS': true,
                    'RUB': true,
                    'AUD': true,
                    'NOK': true,
                    'CZK': true,
                    'GBP': true,
                    'UAH': true,
                    'GHS': true,
                    'HKD': true,
                    'CAD': true,
                    'INR': true,
                    'JPY': true,
                    'NZD': true,
                },
            },
            // https://binance-docs.github.io/apidocs/spot/en/#error-codes-2
            'exceptions': {
                'exact': {
                    'System is under maintenance.': errors.OnMaintenance,
                    'System abnormality': errors.ExchangeError,
                    'You are not authorized to execute this request.': errors.PermissionDenied,
                    'API key does not exist': errors.AuthenticationError,
                    'Order would trigger immediately.': errors.OrderImmediatelyFillable,
                    'Stop price would trigger immediately.': errors.OrderImmediatelyFillable,
                    'Order would immediately match and take.': errors.OrderImmediatelyFillable,
                    'Account has insufficient balance for requested action.': errors.InsufficientFunds,
                    'Rest API trading is not enabled.': errors.ExchangeNotAvailable,
                    "You don't have permission.": errors.PermissionDenied,
                    'Market is closed.': errors.ExchangeNotAvailable,
                    'Too many requests. Please try again later.': errors.DDoSProtection,
                    'This action disabled is on this account.': errors.AccountSuspended,
                    '-1000': errors.ExchangeNotAvailable,
                    '-1001': errors.ExchangeNotAvailable,
                    '-1002': errors.AuthenticationError,
                    '-1003': errors.RateLimitExceeded,
                    '-1004': errors.DDoSProtection,
                    '-1005': errors.PermissionDenied,
                    '-1006': errors.BadResponse,
                    '-1007': errors.RequestTimeout,
                    '-1010': errors.BadResponse,
                    '-1011': errors.PermissionDenied,
                    '-1013': errors.InvalidOrder,
                    '-1014': errors.InvalidOrder,
                    '-1015': errors.RateLimitExceeded,
                    '-1016': errors.ExchangeNotAvailable,
                    '-1020': errors.BadRequest,
                    '-1021': errors.InvalidNonce,
                    '-1022': errors.AuthenticationError,
                    '-1023': errors.BadRequest,
                    '-1099': errors.AuthenticationError,
                    '-1100': errors.BadRequest,
                    '-1101': errors.BadRequest,
                    '-1102': errors.BadRequest,
                    '-1103': errors.BadRequest,
                    '-1104': errors.BadRequest,
                    '-1105': errors.BadRequest,
                    '-1106': errors.BadRequest,
                    '-1108': errors.BadRequest,
                    '-1109': errors.AuthenticationError,
                    '-1110': errors.BadRequest,
                    '-1111': errors.BadRequest,
                    '-1112': errors.InvalidOrder,
                    '-1113': errors.BadRequest,
                    '-1114': errors.BadRequest,
                    '-1115': errors.BadRequest,
                    '-1116': errors.BadRequest,
                    '-1117': errors.BadRequest,
                    '-1118': errors.BadRequest,
                    '-1119': errors.BadRequest,
                    '-1120': errors.BadRequest,
                    '-1121': errors.BadSymbol,
                    '-1125': errors.AuthenticationError,
                    '-1127': errors.BadRequest,
                    '-1128': errors.BadRequest,
                    '-1130': errors.BadRequest,
                    '-1131': errors.BadRequest,
                    '-1136': errors.BadRequest,
                    '-2008': errors.AuthenticationError,
                    '-2010': errors.ExchangeError,
                    '-2011': errors.OrderNotFound,
                    '-2013': errors.OrderNotFound,
                    '-2014': errors.AuthenticationError,
                    '-2015': errors.AuthenticationError,
                    '-2016': errors.BadRequest,
                    '-2018': errors.InsufficientFunds,
                    '-2019': errors.InsufficientFunds,
                    '-2020': errors.OrderNotFillable,
                    '-2021': errors.OrderImmediatelyFillable,
                    '-2022': errors.InvalidOrder,
                    '-2023': errors.InsufficientFunds,
                    '-2024': errors.InsufficientFunds,
                    '-2025': errors.InvalidOrder,
                    '-2026': errors.InvalidOrder,
                    '-2027': errors.InvalidOrder,
                    '-2028': errors.InsufficientFunds,
                    '-3000': errors.ExchangeError,
                    '-3001': errors.AuthenticationError,
                    '-3002': errors.BadSymbol,
                    '-3003': errors.BadRequest,
                    '-3004': errors.ExchangeError,
                    '-3005': errors.InsufficientFunds,
                    '-3006': errors.InsufficientFunds,
                    '-3007': errors.ExchangeError,
                    '-3008': errors.InsufficientFunds,
                    '-3009': errors.BadRequest,
                    '-3010': errors.ExchangeError,
                    '-3011': errors.BadRequest,
                    '-3012': errors.ExchangeError,
                    '-3013': errors.BadRequest,
                    '-3014': errors.AccountSuspended,
                    '-3015': errors.ExchangeError,
                    '-3016': errors.BadRequest,
                    '-3017': errors.ExchangeError,
                    '-3018': errors.AccountSuspended,
                    '-3019': errors.AccountSuspended,
                    '-3020': errors.InsufficientFunds,
                    '-3021': errors.BadRequest,
                    '-3022': errors.AccountSuspended,
                    '-3023': errors.BadRequest,
                    '-3024': errors.ExchangeError,
                    '-3025': errors.BadRequest,
                    '-3026': errors.BadRequest,
                    '-3027': errors.BadSymbol,
                    '-3028': errors.BadSymbol,
                    '-3029': errors.ExchangeError,
                    '-3036': errors.AccountSuspended,
                    '-3037': errors.ExchangeError,
                    '-3038': errors.BadRequest,
                    '-3041': errors.InsufficientFunds,
                    '-3042': errors.BadRequest,
                    '-3043': errors.BadRequest,
                    '-3044': errors.DDoSProtection,
                    '-3045': errors.ExchangeError,
                    '-3999': errors.ExchangeError,
                    '-4001': errors.BadRequest,
                    '-4002': errors.BadRequest,
                    '-4003': errors.BadRequest,
                    '-4004': errors.AuthenticationError,
                    '-4005': errors.RateLimitExceeded,
                    '-4006': errors.BadRequest,
                    '-4007': errors.BadRequest,
                    '-4008': errors.BadRequest,
                    '-4010': errors.BadRequest,
                    '-4011': errors.BadRequest,
                    '-4012': errors.BadRequest,
                    '-4013': errors.AuthenticationError,
                    '-4014': errors.PermissionDenied,
                    '-4015': errors.ExchangeError,
                    '-4016': errors.PermissionDenied,
                    '-4017': errors.PermissionDenied,
                    '-4018': errors.BadSymbol,
                    '-4019': errors.BadSymbol,
                    '-4021': errors.BadRequest,
                    '-4022': errors.BadRequest,
                    '-4023': errors.ExchangeError,
                    '-4024': errors.InsufficientFunds,
                    '-4025': errors.InsufficientFunds,
                    '-4026': errors.InsufficientFunds,
                    '-4027': errors.ExchangeError,
                    '-4028': errors.BadRequest,
                    '-4029': errors.BadRequest,
                    '-4030': errors.ExchangeError,
                    '-4031': errors.ExchangeError,
                    '-4032': errors.ExchangeError,
                    '-4033': errors.BadRequest,
                    '-4034': errors.ExchangeError,
                    '-4035': errors.PermissionDenied,
                    '-4036': errors.BadRequest,
                    '-4037': errors.ExchangeError,
                    '-4038': errors.ExchangeError,
                    '-4039': errors.BadRequest,
                    '-4040': errors.BadRequest,
                    '-4041': errors.ExchangeError,
                    '-4042': errors.ExchangeError,
                    '-4043': errors.BadRequest,
                    '-4044': errors.BadRequest,
                    '-4045': errors.ExchangeError,
                    '-4046': errors.AuthenticationError,
                    '-4047': errors.BadRequest,
                    '-5001': errors.BadRequest,
                    '-5002': errors.InsufficientFunds,
                    '-5003': errors.InsufficientFunds,
                    '-5004': errors.BadRequest,
                    '-5005': errors.InsufficientFunds,
                    '-5006': errors.BadRequest,
                    '-5007': errors.BadRequest,
                    '-5008': errors.InsufficientFunds,
                    '-5009': errors.BadRequest,
                    '-5010': errors.ExchangeError,
                    '-5011': errors.BadRequest,
                    '-5012': errors.ExchangeError,
                    '-5013': errors.InsufficientFunds,
                    '-5021': errors.BadRequest,
                    '-6001': errors.BadRequest,
                    '-6003': errors.BadRequest,
                    '-6004': errors.ExchangeError,
                    '-6005': errors.InvalidOrder,
                    '-6006': errors.BadRequest,
                    '-6007': errors.BadRequest,
                    '-6008': errors.BadRequest,
                    '-6009': errors.RateLimitExceeded,
                    '-6011': errors.BadRequest,
                    '-6012': errors.InsufficientFunds,
                    '-6013': errors.ExchangeError,
                    '-6014': errors.BadRequest,
                    '-6015': errors.BadRequest,
                    '-6016': errors.BadRequest,
                    '-6017': errors.BadRequest,
                    '-6018': errors.BadRequest,
                    '-6019': errors.AuthenticationError,
                    '-6020': errors.BadRequest,
                    '-7001': errors.BadRequest,
                    '-7002': errors.BadRequest,
                    '-9000': errors.InsufficientFunds,
                    '-10017': errors.BadRequest,
                    '-11008': errors.InsufficientFunds,
                    '-12014': errors.RateLimitExceeded,
                    '-13000': errors.BadRequest,
                    '-13001': errors.BadRequest,
                    '-13002': errors.BadRequest,
                    '-13003': errors.BadRequest,
                    '-13004': errors.BadRequest,
                    '-13005': errors.BadRequest,
                    '-13006': errors.InvalidOrder,
                    '-13007': errors.AuthenticationError,
                    '-21001': errors.BadRequest,
                    '-21002': errors.BadRequest,
                    '-21003': errors.BadRequest,
                    '100001003': errors.BadRequest,
                    '2202': errors.InsufficientFunds,
                    '3210': errors.InvalidOrder,
                    '3203': errors.InvalidOrder,
                    '3211': errors.InvalidOrder,
                    '3207': errors.InvalidOrder,
                    '3218': errors.OrderNotFound, // {"code":3218,"msg":"Order does not exist","timestamp":1662739749275}
                },
                'broad': {
                    'has no operation privilege': errors.PermissionDenied,
                    'MAX_POSITION': errors.InvalidOrder, // {"code":-2010,"msg":"Filter failure: MAX_POSITION"}
                },
            },
        });
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    /**
     * @method
     * @name tokocrypto#fetchTime
     * @see https://www.tokocrypto.com/apidocs/#check-server-time
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetOpenV1CommonTime(params);
        //
        //
        //
        return this.safeInteger(response, 'serverTime');
    }
    /**
     * @method
     * @name tokocrypto#fetchMarkets
     * @see https://www.tokocrypto.com/apidocs/#get-all-supported-trading-symbol
     * @description retrieves data on all markets for tokocrypto
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetOpenV1CommonSymbols(params);
        //
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //             "list":[
        //                 {
        //                     "type":1,
        //                     "symbol":"1INCH_BTC",
        //                     "baseAsset":"1INCH",
        //                     "basePrecision":8,
        //                     "quoteAsset":"BTC",
        //                     "quotePrecision":8,
        //                     "filters":[
        //                         {"filterType":"PRICE_FILTER","minPrice":"0.00000001","maxPrice":"1000.00000000","tickSize":"0.00000001","applyToMarket":false},
        //                         {"filterType":"PERCENT_PRICE","multiplierUp":5,"multiplierDown":0.2,"avgPriceMins":"5","applyToMarket":false},
        //                         {"filterType":"LOT_SIZE","minQty":"0.10000000","maxQty":"90000000.00000000","stepSize":"0.10000000","applyToMarket":false},
        //                         {"filterType":"MIN_NOTIONAL","avgPriceMins":"5","minNotional":"0.00010000","applyToMarket":true},
        //                         {"filterType":"ICEBERG_PARTS","applyToMarket":false,"limit":"10"},
        //                         {"filterType":"MARKET_LOT_SIZE","minQty":"0.00000000","maxQty":"79460.14117231","stepSize":"0.00000000","applyToMarket":false},
        //                         {"filterType":"TRAILING_DELTA","applyToMarket":false},
        //                         {"filterType":"MAX_NUM_ORDERS","applyToMarket":false},
        //                         {"filterType":"MAX_NUM_ALGO_ORDERS","applyToMarket":false,"maxNumAlgoOrders":"5"}
        //                     ],
        //                     "orderTypes":["LIMIT","LIMIT_MAKER","MARKET","STOP_LOSS_LIMIT","TAKE_PROFIT_LIMIT"],
        //                     "icebergEnable":1,
        //                     "ocoEnable":1,
        //                     "spotTradingEnable":1,
        //                     "marginTradingEnable":1,
        //                     "permissions":["SPOT","MARGIN"]
        //                 },
        //             ]
        //         },
        //         "timestamp":1659492212507
        //     }
        //
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const data = this.safeValue(response, 'data', {});
        const list = this.safeValue(data, 'list', []);
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const market = list[i];
            const baseId = this.safeString(market, 'baseAsset');
            const quoteId = this.safeString(market, 'quoteAsset');
            const id = this.safeString(market, 'symbol');
            const lowercaseId = this.safeStringLower(market, 'symbol');
            const settleId = this.safeString(market, 'marginAsset');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            const symbol = base + '/' + quote;
            const filters = this.safeValue(market, 'filters', []);
            const filtersByType = this.indexBy(filters, 'filterType');
            const status = this.safeString(market, 'spotTradingEnable');
            let active = (status === '1');
            const permissions = this.safeValue(market, 'permissions', []);
            for (let j = 0; j < permissions.length; j++) {
                if (permissions[j] === 'TRD_GRP_003') {
                    active = false;
                    break;
                }
            }
            const isMarginTradingAllowed = this.safeBool(market, 'isMarginTradingAllowed', false);
            const entry = {
                'id': id,
                'lowercaseId': lowercaseId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': 'spot',
                'spot': true,
                'margin': isMarginTradingAllowed,
                'swap': false,
                'future': false,
                'delivery': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'quantityPrecision'))),
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'pricePrecision'))),
                    'base': this.parseNumber(this.parsePrecision(this.safeString(market, 'baseAssetPrecision'))),
                    'quote': this.parseNumber(this.parsePrecision(this.safeString(market, 'quotePrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
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
                'created': undefined,
                'info': market,
            };
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeValue(filtersByType, 'PRICE_FILTER', {});
                entry['precision']['price'] = this.safeNumber(filter, 'tickSize');
                // PRICE_FILTER reports zero values for maxPrice
                // since they updated filter types in November 2018
                // https://github.com/ccxt/ccxt/issues/4286
                // therefore limits['price']['max'] doesn't have any meaningful value except undefined
                entry['limits']['price'] = {
                    'min': this.safeNumber(filter, 'minPrice'),
                    'max': this.safeNumber(filter, 'maxPrice'),
                };
                entry['precision']['price'] = filter['tickSize'];
            }
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeValue(filtersByType, 'LOT_SIZE', {});
                entry['precision']['amount'] = this.safeNumber(filter, 'stepSize');
                entry['limits']['amount'] = {
                    'min': this.safeNumber(filter, 'minQty'),
                    'max': this.safeNumber(filter, 'maxQty'),
                };
            }
            if ('MARKET_LOT_SIZE' in filtersByType) {
                const filter = this.safeValue(filtersByType, 'MARKET_LOT_SIZE', {});
                entry['limits']['market'] = {
                    'min': this.safeNumber(filter, 'minQty'),
                    'max': this.safeNumber(filter, 'maxQty'),
                };
            }
            if ('MIN_NOTIONAL' in filtersByType) {
                const filter = this.safeValue(filtersByType, 'MIN_NOTIONAL', {});
                entry['limits']['cost']['min'] = this.safeNumber2(filter, 'minNotional', 'notional');
            }
            result.push(entry);
        }
        return result;
    }
    /**
     * @method
     * @name tokocrypto#fetchOrderBook
     * @see https://www.tokocrypto.com/apidocs/#order-book
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
        }
        let response = undefined;
        if (market['quote'] === 'USDT') {
            request['symbol'] = market['baseId'] + market['quoteId'];
            response = await this.binanceGetDepth(this.extend(request, params));
        }
        else {
            request['symbol'] = market['id'];
            response = await this.publicGetOpenV1MarketDepth(this.extend(request, params));
        }
        //
        // future
        //
        //     {
        //         "lastUpdateId":333598053905,
        //         "E":1618631511986,
        //         "T":1618631511964,
        //         "bids":[
        //             ["2493.56","20.189"],
        //             ["2493.54","1.000"],
        //             ["2493.51","0.005"]
        //         ],
        //         "asks":[
        //             ["2493.57","0.877"],
        //             ["2493.62","0.063"],
        //             ["2493.71","12.054"],
        //         ]
        //     }
        // type not 1
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //            "lastUpdateId":3204783,
        //            "bids":[],
        //            "asks": []
        //         },
        //         "timestamp":1692262634599
        //     }
        const data = this.safeValue(response, 'data', response);
        const timestamp = this.safeInteger2(response, 'T', 'timestamp');
        const orderbook = this.parseOrderBook(data, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger(data, 'lastUpdateId');
        return orderbook;
    }
    parseTrade(trade, market = undefined) {
        //
        // aggregate trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
        //
        //     {
        //         "a": 26129,         // Aggregate tradeId
        //         "p": "0.01633102",  // Price
        //         "q": "4.70443515",  // Quantity
        //         "f": 27781,         // First tradeId
        //         "l": 27781,         // Last tradeId
        //         "T": 1498793709153, // Timestamp
        //         "m": true,          // Was the buyer the maker?
        //         "M": true           // Was the trade the best price match?
        //     }
        //
        // recent public trades and old public trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#recent-trades-list
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#old-trade-lookup-market_data
        //
        //     {
        //         "id": 28457,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "time": 1499865549590,
        //         "isBuyerMaker": true,
        //         "isBestMatch": true
        //     }
        //
        // private trades
        // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#account-trade-list-user_data
        //
        //     {
        //         "symbol": "BNBBTC",
        //         "id": 28457,
        //         "orderId": 100234,
        //         "price": "4.00000100",
        //         "qty": "12.00000000",
        //         "commission": "10.10000000",
        //         "commissionAsset": "BNB",
        //         "time": 1499865549590,
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "isBestMatch": true
        //     }
        //
        // futures trades
        // https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data
        //
        //     {
        //       "accountId": 20,
        //       "buyer": False,
        //       "commission": "-0.07819010",
        //       "commissionAsset": "USDT",
        //       "counterPartyId": 653,
        //       "id": 698759,
        //       "maker": False,
        //       "orderId": 25851813,
        //       "price": "7819.01",
        //       "qty": "0.002",
        //       "quoteQty": "0.01563",
        //       "realizedPnl": "-0.91539999",
        //       "side": "SELL",
        //       "symbol": "BTCUSDT",
        //       "time": 1569514978020
        //     }
        //     {
        //       "symbol": "BTCUSDT",
        //       "id": 477128891,
        //       "orderId": 13809777875,
        //       "side": "SELL",
        //       "price": "38479.55",
        //       "qty": "0.001",
        //       "realizedPnl": "-0.00009534",
        //       "marginAsset": "USDT",
        //       "quoteQty": "38.47955",
        //       "commission": "-0.00076959",
        //       "commissionAsset": "USDT",
        //       "time": 1612733566708,
        //       "positionSide": "BOTH",
        //       "maker": true,
        //       "buyer": false
        //     }
        //
        // { respType: FULL }
        //
        //     {
        //       "price": "4000.00000000",
        //       "qty": "1.00000000",
        //       "commission": "4.00000000",
        //       "commissionAsset": "USDT",
        //       "tradeId": "1234",
        //     }
        //
        const timestamp = this.safeInteger2(trade, 'T', 'time');
        const price = this.safeString2(trade, 'p', 'price');
        const amount = this.safeString2(trade, 'q', 'qty');
        const cost = this.safeString2(trade, 'quoteQty', 'baseQty'); // inverse futures
        const marketId = this.safeString(trade, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        let id = this.safeString2(trade, 't', 'a');
        id = this.safeString2(trade, 'id', 'tradeId', id);
        let side = undefined;
        const orderId = this.safeString(trade, 'orderId');
        const buyerMaker = this.safeValue2(trade, 'm', 'isBuyerMaker');
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy'; // this is reversed intentionally
            takerOrMaker = 'taker';
        }
        else if ('side' in trade) {
            side = this.safeStringLower(trade, 'side');
        }
        else {
            if ('isBuyer' in trade) {
                side = trade['isBuyer'] ? 'buy' : 'sell'; // this is a true side
            }
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString(trade, 'commission'),
                'currency': this.safeCurrencyCode(this.safeString(trade, 'commissionAsset')),
            };
        }
        if ('isMaker' in trade) {
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        }
        if ('maker' in trade) {
            takerOrMaker = trade['maker'] ? 'maker' : 'taker';
        }
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name tokocrypto#fetchTrades
     * @see https://www.tokocrypto.com/apidocs/#recent-trades-list
     * @see https://www.tokocrypto.com/apidocs/#compressedaggregate-trades-list
     * @description get the list of most recent trades for a particular symbol
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
            'symbol': this.getMarketIdByType(market),
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            // 'limit': 500,     // default = 500, maximum = 1000
        };
        if (market['quote'] !== 'USDT') {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const responseInner = this.publicGetOpenV1MarketTrades(this.extend(request, params));
            //
            //    {
            //       "code": 0,
            //       "msg": "success",
            //       "data": {
            //           "list": [
            //                {
            //                    "id": 28457,
            //                    "price": "4.00000100",
            //                    "qty": "12.00000000",
            //                    "time": 1499865549590,
            //                    "isBuyerMaker": true,
            //                    "isBestMatch": true
            //                }
            //            ]
            //        },
            //        "timestamp": 1571921637091
            //    }
            //
            const data = this.safeDict(responseInner, 'data', {});
            const list = this.safeList(data, 'list', []);
            return this.parseTrades(list, market, since, limit);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
        }
        const defaultMethod = 'binanceGetTrades';
        const method = this.safeString(this.options, 'fetchTradesMethod', defaultMethod);
        let response = undefined;
        if ((method === 'binanceGetAggTrades') && (since !== undefined)) {
            request['startTime'] = since;
            // https://github.com/ccxt/ccxt/issues/6400
            // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
            request['endTime'] = this.sum(since, 3600000);
            response = await this.binanceGetAggTrades(this.extend(request, params));
        }
        else {
            response = await this.binanceGetTrades(this.extend(request, params));
        }
        //
        // Caveats:
        // - default limit (500) applies only if no other parameters set, trades up
        //   to the maximum limit may be returned to satisfy other parameters
        // - if both limit and time window is set and time window contains more
        //   trades than the limit then the last trades from the window are returned
        // - 'tradeId' accepted and returned by this method is "aggregate" trade id
        //   which is different from actual trade id
        // - setting both fromId and time window results in error
        //
        // aggregate trades
        //
        //     [
        //         {
        //             "a": 26129,         // Aggregate tradeId
        //             "p": "0.01633102",  // Price
        //             "q": "4.70443515",  // Quantity
        //             "f": 27781,         // First tradeId
        //             "l": 27781,         // Last tradeId
        //             "T": 1498793709153, // Timestamp
        //             "m": true,          // Was the buyer the maker?
        //             "M": true           // Was the trade the best price match?
        //         }
        //     ]
        //
        // recent public trades and historical public trades
        //
        //     [
        //         {
        //             "id": 28457,
        //             "price": "4.00000100",
        //             "qty": "12.00000000",
        //             "time": 1499865549590,
        //             "isBuyerMaker": true,
        //             "isBestMatch": true
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "symbol": "ETHBTC",
        //         "priceChange": "0.00068700",
        //         "priceChangePercent": "2.075",
        //         "weightedAvgPrice": "0.03342681",
        //         "prevClosePrice": "0.03310300",
        //         "lastPrice": "0.03378900",
        //         "lastQty": "0.07700000",
        //         "bidPrice": "0.03378900",
        //         "bidQty": "7.16800000",
        //         "askPrice": "0.03379000",
        //         "askQty": "24.00000000",
        //         "openPrice": "0.03310200",
        //         "highPrice": "0.03388900",
        //         "lowPrice": "0.03306900",
        //         "volume": "205478.41000000",
        //         "quoteVolume": "6868.48826294",
        //         "openTime": 1601469986932,
        //         "closeTime": 1601556386932,
        //         "firstId": 196098772,
        //         "lastId": 196186315,
        //         "count": 87544
        //     }
        //
        // coinm
        //     {
        //         "baseVolume": "214549.95171161",
        //         "closeTime": "1621965286847",
        //         "count": "1283779",
        //         "firstId": "152560106",
        //         "highPrice": "39938.3",
        //         "lastId": "153843955",
        //         "lastPrice": "37993.4",
        //         "lastQty": "1",
        //         "lowPrice": "36457.2",
        //         "openPrice": "37783.4",
        //         "openTime": "1621878840000",
        //         "pair": "BTCUSD",
        //         "priceChange": "210.0",
        //         "priceChangePercent": "0.556",
        //         "symbol": "BTCUSD_PERP",
        //         "volume": "81990451",
        //         "weightedAvgPrice": "38215.08713747"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'closeTime');
        const marketId = this.safeString(ticker, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString(ticker, 'lastPrice');
        const isCoinm = ('baseVolume' in ticker);
        let baseVolume = undefined;
        let quoteVolume = undefined;
        if (isCoinm) {
            baseVolume = this.safeString(ticker, 'baseVolume');
            quoteVolume = this.safeString(ticker, 'volume');
        }
        else {
            baseVolume = this.safeString(ticker, 'volume');
            quoteVolume = this.safeString(ticker, 'quoteVolume');
        }
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'highPrice'),
            'low': this.safeString(ticker, 'lowPrice'),
            'bid': this.safeString(ticker, 'bidPrice'),
            'bidVolume': this.safeString(ticker, 'bidQty'),
            'ask': this.safeString(ticker, 'askPrice'),
            'askVolume': this.safeString(ticker, 'askQty'),
            'vwap': this.safeString(ticker, 'weightedAvgPrice'),
            'open': this.safeString(ticker, 'openPrice'),
            'close': last,
            'last': last,
            'previousClose': this.safeString(ticker, 'prevClosePrice'),
            'change': this.safeString(ticker, 'priceChange'),
            'percentage': this.safeString(ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name tokocrypto#fetchTickers
     * @see https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.binanceGetTicker24hr(params);
        return this.parseTickers(response, symbols);
    }
    getMarketIdByType(market) {
        if (market['quote'] === 'USDT') {
            return market['baseId'] + market['quoteId'];
        }
        return market['id'];
    }
    /**
     * @method
     * @name tokocrypto#fetchTicker
     * @see https://binance-docs.github.io/apidocs/spot/en/#24hr-ticker-price-change-statistics
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['baseId'] + market['quoteId'],
        };
        const response = await this.binanceGetTicker24hr(this.extend(request, params));
        if (Array.isArray(response)) {
            const firstTicker = this.safeDict(response, 0, {});
            return this.parseTicker(firstTicker, market);
        }
        return this.parseTicker(response, market);
    }
    /**
     * @method
     * @name tokocrypto#fetchBidsAsks
     * @see https://binance-docs.github.io/apidocs/spot/en/#symbol-order-book-ticker
     * @description fetches the bid and ask price and volume for multiple markets
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.binanceGetTickerBookTicker(params);
        return this.parseTickers(response, symbols);
    }
    parseOHLCV(ohlcv, market = undefined) {
        // when api method = publicGetKlines || fapiPublicGetKlines || dapiPublicGetKlines
        //     [
        //         1591478520000, // open time
        //         "0.02501300",  // open
        //         "0.02501800",  // high
        //         "0.02500000",  // low
        //         "0.02500000",  // close
        //         "22.19000000", // volume
        //         1591478579999, // close time
        //         "0.55490906",  // quote asset volume
        //         40,            // number of trades
        //         "10.92900000", // taker buy base asset volume
        //         "0.27336462",  // taker buy quote asset volume
        //         "0"            // ignore
        //     ]
        //
        //  when api method = fapiPublicGetMarkPriceKlines || fapiPublicGetIndexPriceKlines
        //     [
        //         [
        //         1591256460000,          // Open time
        //         "9653.29201333",        // Open
        //         "9654.56401333",        // High
        //         "9653.07367333",        // Low
        //         "9653.07367333",        // Close (or latest price)
        //         "0",                    // Ignore
        //         1591256519999,          // Close time
        //         "0",                    // Ignore
        //         60,                     // Number of bisic data
        //         "0",                    // Ignore
        //         "0",                    // Ignore
        //         "0"                     // Ignore
        //         ]
        //     ]
        //
        return [
            this.safeInteger(ohlcv, 0),
            this.safeNumber(ohlcv, 1),
            this.safeNumber(ohlcv, 2),
            this.safeNumber(ohlcv, 3),
            this.safeNumber(ohlcv, 4),
            this.safeNumber(ohlcv, 5),
        ];
    }
    /**
     * @method
     * @name tokocrypto#fetchOHLCV
     * @see https://binance-docs.github.io/apidocs/spot/en/#kline-candlestick-data
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        // binance docs say that the default limit 500, max 1500 for futures, max 1000 for spot markets
        // the reality is that the time range wider than 500 candles won't work right
        const defaultLimit = 500;
        const maxLimit = 1500;
        const price = this.safeString(params, 'price');
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, ['price', 'until']);
        limit = (limit === undefined) ? defaultLimit : Math.min(limit, maxLimit);
        const request = {
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
            'limit': limit,
        };
        if (price === 'index') {
            request['pair'] = market['id']; // Index price takes this argument instead of symbol
        }
        else {
            request['symbol'] = this.getMarketIdByType(market);
        }
        // const duration = this.parseTimeframe (timeframe);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let response = undefined;
        if (market['quote'] === 'USDT') {
            response = await this.binanceGetKlines(this.extend(request, params));
        }
        else {
            response = await this.publicGetOpenV1MarketKlines(this.extend(request, params));
        }
        //
        //     [
        //         [1591478520000,"0.02501300","0.02501800","0.02500000","0.02500000","22.19000000",1591478579999,"0.55490906",40,"10.92900000","0.27336462","0"],
        //         [1591478580000,"0.02499600","0.02500900","0.02499400","0.02500300","21.34700000",1591478639999,"0.53370468",24,"7.53800000","0.18850725","0"],
        //         [1591478640000,"0.02500800","0.02501100","0.02500300","0.02500800","154.14200000",1591478699999,"3.85405839",97,"5.32300000","0.13312641","0"],
        //     ]
        //
        const data = this.safeList(response, 'data', response);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    /**
     * @method
     * @name tokocrypto#fetchBalance
     * @see https://www.tokocrypto.com/apidocs/#account-information-signed
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot'
     * @param {string} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
     * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const defaultType = this.safeString2(this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString(params, 'type', defaultType);
        const defaultMarginMode = this.safeString2(this.options, 'marginMode', 'defaultMarginMode');
        const marginMode = this.safeStringLower(params, 'marginMode', defaultMarginMode);
        const request = {};
        const response = await this.privateGetOpenV1AccountSpot(this.extend(request, params));
        //
        // spot
        //
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //             "makerCommission":"0.00100000",
        //             "takerCommission":"0.00100000",
        //             "buyerCommission":"0.00000000",
        //             "sellerCommission":"0.00000000",
        //             "canTrade":1,
        //             "canWithdraw":1,
        //             "canDeposit":1,
        //             "status":1,
        //             "accountAssets":[
        //                 {"asset":"1INCH","free":"0","locked":"0"},
        //                 {"asset":"AAVE","free":"0","locked":"0"},
        //                 {"asset":"ACA","free":"0","locked":"0"}
        //             ],
        //         },
        //         "timestamp":1659666786943
        //     }
        //
        return this.parseBalanceCustom(response, type, marginMode);
    }
    parseBalanceCustom(response, type = undefined, marginMode = undefined) {
        const timestamp = this.safeInteger(response, 'updateTime');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const data = this.safeValue(response, 'data', {});
        const balances = this.safeValue(data, 'accountAssets', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString(balance, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(balance, 'free');
            account['used'] = this.safeString(balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    parseOrderStatus(status) {
        const statuses = {
            '-2': 'open',
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceling',
            '5': 'rejected',
            '6': 'expired',
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceling',
            'REJECTED': 'rejected',
            'EXPIRED': 'expired',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol": "LTCBTC",
        //         "orderId": 1,
        //         "clientOrderId": "myOrder1",
        //         "price": "0.1",
        //         "origQty": "1.0",
        //         "executedQty": "0.0",
        //         "cummulativeQuoteQty": "0.0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "icebergQty": "0.0",
        //         "time": 1499827319559,
        //         "updateTime": 1499827319559,
        //         "isWorking": true
        //     }
        // createOrder
        //     {
        //         "orderId": "145265071",
        //         "bOrderListId": "0",
        //         "clientId": "49c09c3c2cd54419a59c05441f517b3c",
        //         "bOrderId": "35247529",
        //         "symbol": "USDT_BIDR",
        //         "symbolType": "1",
        //         "side": "0",
        //         "type": "1",
        //         "price": "11915",
        //         "origQty": "2",
        //         "origQuoteQty": "23830.00",
        //         "executedQty": "0.00000000",
        //         "executedPrice": "0",
        //         "executedQuoteQty": "0.00",
        //         "timeInForce": "1",
        //         "stopPrice": "0",
        //         "icebergQty": "0",
        //         "status": "0",
        //         "createTime": "1662711074372"
        //     }
        //
        // createOrder with { "newOrderRespType": "FULL" }
        //
        //     {
        //       "symbol": "BTCUSDT",
        //       "orderId": 5403233939,
        //       "orderListId": -1,
        //       "clientOrderId": "x-R4BD3S825e669e75b6c14f69a2c43e",
        //       "transactTime": 1617151923742,
        //       "price": "0.00000000",
        //       "origQty": "0.00050000",
        //       "executedQty": "0.00050000",
        //       "cummulativeQuoteQty": "29.47081500",
        //       "status": "FILLED",
        //       "timeInForce": "GTC",
        //       "type": "MARKET",
        //       "side": "BUY",
        //       "fills": [
        //         {
        //           "price": "58941.63000000",
        //           "qty": "0.00050000",
        //           "commission": "0.00007050",
        //           "commissionAsset": "BNB",
        //           "tradeId": 737466631
        //         }
        //       ]
        //     }
        //
        // delivery
        //
        //     {
        //       "orderId": "18742727411",
        //       "symbol": "ETHUSD_PERP",
        //       "pair": "ETHUSD",
        //       "status": "FILLED",
        //       "clientOrderId": "x-xcKtGhcu3e2d1503fdd543b3b02419",
        //       "price": "0",
        //       "avgPrice": "4522.14",
        //       "origQty": "1",
        //       "executedQty": "1",
        //       "cumBase": "0.00221134",
        //       "timeInForce": "GTC",
        //       "type": "MARKET",
        //       "reduceOnly": false,
        //       "closePosition": false,
        //       "side": "SELL",
        //       "positionSide": "BOTH",
        //       "stopPrice": "0",
        //       "workingType": "CONTRACT_PRICE",
        //       "priceProtect": false,
        //       "origType": "MARKET",
        //       "time": "1636061952660",
        //       "updateTime": "1636061952660"
        //     }
        //
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const marketId = this.safeString(order, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        const filled = this.safeString(order, 'executedQty', '0');
        const timestamp = this.safeInteger(order, 'createTime');
        const average = this.safeString(order, 'avgPrice');
        const price = this.safeString2(order, 'price', 'executedPrice');
        const amount = this.safeString(order, 'origQty');
        // - Spot/Margin market: cummulativeQuoteQty
        //   Note this is not the actual cost, since Binance futures uses leverage to calculate margins.
        const cost = this.safeStringN(order, ['cummulativeQuoteQty', 'cumQuote', 'executedQuoteQty', 'cumBase']);
        const id = this.safeString(order, 'orderId');
        const type = this.parseOrderType(this.safeStringLower(order, 'type'));
        let side = this.safeStringLower(order, 'side');
        if (side === '0') {
            side = 'buy';
        }
        else if (side === '1') {
            side = 'sell';
        }
        const fills = this.safeValue(order, 'fills', []);
        const clientOrderId = this.safeString2(order, 'clientOrderId', 'clientId');
        let timeInForce = this.safeString(order, 'timeInForce');
        if (timeInForce === 'GTX') {
            // GTX means "Good Till Crossing" and is an equivalent way of saying Post Only
            timeInForce = 'PO';
        }
        const postOnly = (type === 'limit_maker') || (timeInForce === 'PO');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeValue(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': this.parseNumber(this.omitZero(this.safeString(order, 'stopPrice'))),
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': fills,
        }, market);
    }
    parseOrderType(status) {
        const statuses = {
            '2': 'market',
            '1': 'limit',
            '4': 'limit',
            '7': 'limit',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name tokocrypto#createOrder
     * @description create a trade order
     * @see https://www.tokocrypto.com/apidocs/#new-order--signed
     * @see https://www.tokocrypto.com/apidocs/#account-trade-list-signed
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order would be triggered
     * @param {float} [params.cost] for spot market buy orders, the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clientId');
        const postOnly = this.safeBool(params, 'postOnly', false);
        // only supported for spot/margin api
        if (postOnly) {
            type = 'LIMIT_MAKER';
        }
        params = this.omit(params, ['clientId', 'clientOrderId']);
        const initialUppercaseType = type.toUpperCase();
        let uppercaseType = initialUppercaseType;
        const triggerPrice = this.safeValue2(params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            params = this.omit(params, ['triggerPrice', 'stopPrice']);
            if (uppercaseType === 'MARKET') {
                uppercaseType = 'STOP_LOSS';
            }
            else if (uppercaseType === 'LIMIT') {
                uppercaseType = 'STOP_LOSS_LIMIT';
            }
        }
        const validOrderTypes = this.safeValue(market['info'], 'orderTypes');
        if (!this.inArray(uppercaseType, validOrderTypes)) {
            if (initialUppercaseType !== uppercaseType) {
                throw new errors.InvalidOrder(this.id + ' triggerPrice parameter is not allowed for ' + symbol + ' ' + type + ' orders');
            }
            else {
                throw new errors.InvalidOrder(this.id + ' ' + type + ' is not a valid order type for the ' + symbol + ' market');
            }
        }
        const reverseOrderTypeMapping = {
            'LIMIT': 1,
            'MARKET': 2,
            'STOP_LOSS': 3,
            'STOP_LOSS_LIMIT': 4,
            'TAKE_PROFIT': 5,
            'TAKE_PROFIT_LIMIT': 6,
            'LIMIT_MAKER': 7,
        };
        const request = {
            'symbol': market['baseId'] + '_' + market['quoteId'],
            'type': this.safeString(reverseOrderTypeMapping, uppercaseType),
        };
        if (side === 'buy') {
            request['side'] = 0;
        }
        else if (side === 'sell') {
            request['side'] = 1;
        }
        if (clientOrderId === undefined) {
            const broker = this.safeValue(this.options, 'broker');
            if (broker !== undefined) {
                const brokerId = this.safeString(broker, 'marketType');
                if (brokerId !== undefined) {
                    request['clientId'] = brokerId + this.uuid22();
                }
            }
        }
        else {
            request['clientId'] = clientOrderId;
        }
        // additional required fields depending on the order type
        let priceIsRequired = false;
        let triggerPriceIsRequired = false;
        let quantityIsRequired = false;
        //
        // spot/margin
        //
        //     LIMIT                timeInForce, quantity, price
        //     MARKET               quantity or quoteOrderQty
        //     STOP_LOSS            quantity, stopPrice
        //     STOP_LOSS_LIMIT      timeInForce, quantity, price, stopPrice
        //     TAKE_PROFIT          quantity, stopPrice
        //     TAKE_PROFIT_LIMIT    timeInForce, quantity, price, stopPrice
        //     LIMIT_MAKER          quantity, price
        //
        if (uppercaseType === 'MARKET') {
            if (side === 'buy') {
                const precision = market['precision']['price'];
                let quoteAmount = undefined;
                let createMarketBuyOrderRequiresPrice = true;
                [createMarketBuyOrderRequiresPrice, params] = this.handleOptionAndParams(params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
                const cost = this.safeNumber2(params, 'cost', 'quoteOrderQty');
                params = this.omit(params, ['cost', 'quoteOrderQty']);
                if (cost !== undefined) {
                    quoteAmount = cost;
                }
                else if (createMarketBuyOrderRequiresPrice) {
                    if (price === undefined) {
                        throw new errors.InvalidOrder(this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend (quote quantity) in the amount argument');
                    }
                    else {
                        const amountString = this.numberToString(amount);
                        const priceString = this.numberToString(price);
                        quoteAmount = Precise["default"].stringMul(amountString, priceString);
                    }
                }
                else {
                    quoteAmount = amount;
                }
                request['quoteOrderQty'] = this.decimalToPrecision(quoteAmount, number.TRUNCATE, precision, this.precisionMode);
            }
            else {
                quantityIsRequired = true;
            }
        }
        else if (uppercaseType === 'LIMIT') {
            priceIsRequired = true;
            quantityIsRequired = true;
        }
        else if ((uppercaseType === 'STOP_LOSS') || (uppercaseType === 'TAKE_PROFIT')) {
            triggerPriceIsRequired = true;
            quantityIsRequired = true;
            if (market['linear'] || market['inverse']) {
                priceIsRequired = true;
            }
        }
        else if ((uppercaseType === 'STOP_LOSS_LIMIT') || (uppercaseType === 'TAKE_PROFIT_LIMIT')) {
            quantityIsRequired = true;
            triggerPriceIsRequired = true;
            priceIsRequired = true;
        }
        else if (uppercaseType === 'LIMIT_MAKER') {
            priceIsRequired = true;
            quantityIsRequired = true;
        }
        if (quantityIsRequired) {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        if (priceIsRequired) {
            if (price === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (triggerPriceIsRequired) {
            if (triggerPrice === undefined) {
                throw new errors.InvalidOrder(this.id + ' createOrder() requires a triggerPrice extra param for a ' + type + ' order');
            }
            else {
                request['stopPrice'] = this.priceToPrecision(symbol, triggerPrice);
            }
        }
        const response = await this.privatePostOpenV1Orders(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "Success",
        //         "data": {
        //             "orderId": 145264846,
        //             "bOrderListId": 0,
        //             "clientId": "4ee2ab5e55e74b358eaf98079c670d17",
        //             "bOrderId": 35247499,
        //             "symbol": "USDT_BIDR",
        //             "symbolType": 1,
        //             "side": 0,
        //             "type": 1,
        //             "price": "11915",
        //             "origQty": "2",
        //             "origQuoteQty": "23830.00",
        //             "executedQty": "0.00000000",
        //             "executedPrice": "0",
        //             "executedQuoteQty": "0.00",
        //             "timeInForce": 1,
        //             "stopPrice": 0,
        //             "icebergQty": "0",
        //             "status": 0,
        //             "createTime": 1662710994848
        //         },
        //         "timestamp": 1662710994975
        //     }
        //
        const rawOrder = this.safeDict(response, 'data', {});
        return this.parseOrder(rawOrder, market);
    }
    /**
     * @method
     * @name tokocrypto#fetchOrder
     * @see https://www.tokocrypto.com/apidocs/#all-orders-signed
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOpenV1Orders(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "Success",
        //         "data": {
        //             "list": [{
        //                 "orderId": "145221985",
        //                 "clientId": "201515331fd64d03aedbe687a38152e3",
        //                 "bOrderId": "35239632",
        //                 "bOrderListId": "0",
        //                 "symbol": "USDT_BIDR",
        //                 "symbolType": 1,
        //                 "side": 0,
        //                 "type": 1,
        //                 "price": "11907",
        //                 "origQty": "2",
        //                 "origQuoteQty": "23814",
        //                 "executedQty": "0",
        //                 "executedPrice": "0",
        //                 "executedQuoteQty": "0",
        //                 "timeInForce": 1,
        //                 "stopPrice": "0",
        //                 "icebergQty": "0",
        //                 "status": 0,
        //                 "createTime": 1662699360000
        //             }]
        //         },
        //         "timestamp": 1662710056523
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const list = this.safeValue(data, 'list', []);
        const rawOrder = this.safeDict(list, 0, {});
        return this.parseOrder(rawOrder);
    }
    /**
     * @method
     * @name tokocrypto#fetchOrders
     * @see https://www.tokocrypto.com/apidocs/#all-orders-signed
     * @description fetches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            // 'type': -1, // -1 = all, 1 = open, 2 = closed
            // 'side': 1, // or 2
            // 'startTime': since,
            // 'endTime': this.milliseconds (),
            // 'fromId': 'starting order ID', // if defined, the "direct" field becomes mandatory
            // 'direct': 'prev', // prev, next
            // 'limit': 500, // default 500, max 1000
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOpenV1Orders(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": {
        //             "list": [
        //                 {
        //                     "orderId": "4", // order id
        //                     "bOrderId": "100001", // binance order id
        //                     "bOrderListId": -1, // Unless part of an OCO, the value will always be -1.
        //                     "clientId": "1aa4f99ad7bc4fab903395afd25d0597", // client custom order id
        //                     "symbol": "ADA_USDT",
        //                     "symbolType": 1,
        //                     "side": 1,
        //                     "type": 1,
        //                     "price": "0.1",
        //                     "origQty": "10",
        //                     "origQuoteQty": "1",
        //                     "executedQty": "0",
        //                     "executedPrice": "0",
        //                     "executedQuoteQty": "0",
        //                     "timeInForce": 1,
        //                     "stopPrice": "0.0000000000000000",
        //                     "icebergQty": "0.0000000000000000",
        //                     "status": 0,
        //                     "isWorking": 0,
        //                     "createTime": 1572692016811
        //                 }
        //             ]
        //         },
        //         "timestamp": 1572860756458
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const orders = this.safeList(data, 'list', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name tokocrypto#fetchOpenOrders
     * @see https://www.tokocrypto.com/apidocs/#all-orders-signed
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'type': 1 }; // -1 = all, 1 = open, 2 = closed
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name tokocrypto#fetchClosedOrders
     * @see https://www.tokocrypto.com/apidocs/#all-orders-signed
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'type': 2 }; // -1 = all, 1 = open, 2 = closed
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    /**
     * @method
     * @name tokocrypto#cancelOrder
     * @see https://www.tokocrypto.com/apidocs/#cancel-order-signed
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const request = {
            'orderId': id,
        };
        const response = await this.privatePostOpenV1OrdersCancel(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "Success",
        //         "data": {
        //             "orderId": "145221985",
        //             "bOrderListId": "0",
        //             "clientId": "201515331fd64d03aedbe687a38152e3",
        //             "bOrderId": "35239632",
        //             "symbol": "USDT_BIDR",
        //             "symbolType": 1,
        //             "type": 1,
        //             "side": 0,
        //             "price": "11907.0000000000000000",
        //             "origQty": "2.0000000000000000",
        //             "origQuoteQty": "23814.0000000000000000",
        //             "executedPrice": "0.0000000000000000",
        //             "executedQty": "0.00000000",
        //             "executedQuoteQty": "0.00",
        //             "timeInForce": 1,
        //             "stopPrice": "0.0000000000000000",
        //             "icebergQty": "0.0000000000000000",
        //             "status": 3
        //         },
        //         "timestamp": 1662710683634
        //     }
        //
        const rawOrder = this.safeDict(response, 'data', {});
        return this.parseOrder(rawOrder);
    }
    /**
     * @method
     * @name tokocrypto#fetchMyTrades
     * @see https://www.tokocrypto.com/apidocs/#account-trade-list-signed
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const endTime = this.safeInteger2(params, 'until', 'endTime');
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (endTime !== undefined) {
            request['endTime'] = endTime;
            params = this.omit(params, ['endTime', 'until']);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOpenV1OrdersTrades(this.extend(request, params));
        //
        //     {
        //         "code": 0,
        //         "msg": "success",
        //         "data": {
        //             "list": [
        //                 {
        //                     "tradeId": "3",
        //                     "orderId": "2",
        //                     "symbol": "ADA_USDT",
        //                     "price": "0.04398",
        //                     "qty": "250",
        //                     "quoteQty": "10.995",
        //                     "commission": "0.25",
        //                     "commissionAsset": "ADA",
        //                     "isBuyer": 1,
        //                     "isMaker": 0,
        //                     "isBestMatch": 1,
        //                     "time": "1572920872276"
        //                 }
        //             ]
        //         },
        //         "timestamp": 1573723498893
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const trades = this.safeList(data, 'list', []);
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name tokocrypto#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.tokocrypto.com/apidocs/#deposit-address-signed
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            // 'network': 'ETH', // 'BSC', 'XMR', you can get network and isDefault in networkList in the response of sapiGetCapitalConfigDetail
        };
        const networks = this.safeValue(this.options, 'networks', {});
        let network = this.safeStringUpper(params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['network'] = network;
            params = this.omit(params, 'network');
        }
        // has support for the 'network' parameter
        // https://binance-docs.github.io/apidocs/spot/en/#deposit-address-supporting-network-user_data
        const response = await this.privateGetOpenV1DepositsAddress(this.extend(request, params));
        //
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //             "uid":"182395",
        //             "asset":"USDT",
        //             "network":"ETH",
        //             "address":"0x101a925704f6ff13295ab8dd7a60988d116aaedf",
        //             "addressTag":"",
        //             "status":1
        //         },
        //         "timestamp":1660685915746
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const address = this.safeString(data, 'address');
        let tag = this.safeString(data, 'addressTag', '');
        if (tag.length === 0) {
            tag = undefined;
        }
        this.checkAddress(address);
        return {
            'info': response,
            'currency': code,
            'network': this.safeString(data, 'network'),
            'address': address,
            'tag': tag,
        };
    }
    /**
     * @method
     * @name tokocrypto#fetchDeposits
     * @see https://www.tokocrypto.com/apidocs/#deposit-history-signed
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        const request = {};
        const until = this.safeInteger(params, 'until');
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            let endTime = this.sum(since, 7776000000);
            if (until !== undefined) {
                endTime = Math.min(endTime, until);
            }
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOpenV1Deposits(this.extend(request, params));
        //
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //             "list":[
        //                 {
        //                     "id":5167969,
        //                     "asset":"BIDR",
        //                     "network":"BSC",
        //                     "address":"0x101a925704f6ff13295ab8dd7a60988d116aaedf",
        //                     "addressTag":"",
        //                     "txId":"113409337867",
        //                     "amount":"15000",
        //                     "transferType":1,
        //                     "status":1,
        //                     "insertTime":"1659429390000"
        //                 },
        //             ]
        //         },
        //         "timestamp":1659758865998
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const deposits = this.safeList(data, 'list', []);
        return this.parseTransactions(deposits, currency, since, limit);
    }
    /**
     * @method
     * @name tokocrypto#fetchWithdrawals
     * @see https://www.tokocrypto.com/apidocs/#withdraw-signed
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
            // max 3 months range https://github.com/ccxt/ccxt/issues/6495
            request['endTime'] = this.sum(since, 7776000000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOpenV1Withdraws(this.extend(request, params));
        //
        //     {
        //         "code":0,
        //         "msg":"Success",
        //         "data":{
        //             "list":[
        //                 {
        //                     "id":4245859,
        //                     "clientId":"198",
        //                     "asset":"BIDR",
        //                     "network":"BSC",
        //                     "address":"0xff1c75149cc492e7d5566145b859fcafc900b6e9",
        //                     "addressTag":"",
        //                     "amount":"10000",
        //                     "fee":"0",
        //                     "txId":"113501794501",
        //                     "transferType":1,
        //                     "status":10,
        //                     "createTime":1659521314413
        //                 }
        //             ]
        //         },
        //         "timestamp":1659759062187
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const withdrawals = this.safeList(data, 'list', []);
        return this.parseTransactions(withdrawals, currency, since, limit);
    }
    parseTransactionStatusByType(status, type = undefined) {
        const statusesByType = {
            'deposit': {
                '0': 'pending',
                '1': 'ok',
            },
            'withdrawal': {
                '0': 'pending',
                '1': 'canceled',
                '2': 'pending',
                '3': 'failed',
                '4': 'pending',
                '5': 'failed',
                '10': 'ok', // Completed
            },
        };
        const statuses = this.safeValue(statusesByType, type, {});
        return this.safeString(statuses, status, status);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //         "id": 5167969,
        //         "asset": "BIDR",
        //         "network": "BSC",
        //         "address": "0x101a925704f6ff13295ab8dd7a60988d116aaedf",
        //         "addressTag": "",
        //         "txId": "113409337867",
        //         "amount": "15000",
        //         "transferType": 1,
        //         "status": 1,
        //         "insertTime": "1659429390000"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "id": 4245859,
        //         "clientId": "198",
        //         "asset": "BIDR",
        //         "network": "BSC",
        //         "address": "0xff1c75149cc492e7d5566145b859fcafc900b6e9",
        //         "addressTag": "",
        //         "amount": "10000",
        //         "fee": "0",
        //         "txId": "113501794501",
        //         "transferType": 1,
        //         "status": 10,
        //         "createTime": 1659521314413
        //     }
        //
        // withdraw
        //
        //     {
        //         "code": 0,
        //         "msg": "成功",
        //         "data": {
        //             "withdrawId":"12"
        //         },
        //         "timestamp": 1571745049095
        //     }
        //
        const address = this.safeString(transaction, 'address');
        let tag = this.safeString(transaction, 'addressTag'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        let txid = this.safeString(transaction, 'txId');
        if ((txid !== undefined) && (txid.indexOf('Internal transfer ') >= 0)) {
            txid = txid.slice(18);
        }
        const currencyId = this.safeString2(transaction, 'coin', 'fiatCurrency');
        const code = this.safeCurrencyCode(currencyId, currency);
        let timestamp = undefined;
        const insertTime = this.safeInteger(transaction, 'insertTime');
        const createTime = this.safeInteger2(transaction, 'createTime', 'timestamp');
        let type = this.safeString(transaction, 'type');
        if (type === undefined) {
            if ((insertTime !== undefined) && (createTime === undefined)) {
                type = 'deposit';
                timestamp = insertTime;
            }
            else if ((insertTime === undefined) && (createTime !== undefined)) {
                type = 'withdrawal';
                timestamp = createTime;
            }
        }
        const feeCost = this.safeNumber2(transaction, 'transactionFee', 'totalFee');
        const fee = {
            'currency': undefined,
            'cost': undefined,
            'rate': undefined,
        };
        if (feeCost !== undefined) {
            fee['currency'] = code;
            fee['cost'] = feeCost;
        }
        const internalRaw = this.safeInteger(transaction, 'transferType');
        let internal = false;
        if (internalRaw !== undefined) {
            internal = true;
        }
        let id = this.safeString(transaction, 'id');
        if (id === undefined) {
            const data = this.safeValue(transaction, 'data', {});
            id = this.safeString(data, 'withdrawId');
            type = 'withdrawal';
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'type': type,
            'currency': code,
            'network': this.safeString(transaction, 'network'),
            'amount': this.safeNumber(transaction, 'amount'),
            'status': this.parseTransactionStatusByType(this.safeString(transaction, 'status'), type),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': address,
            'addressFrom': undefined,
            'addressTo': address,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tag,
            'updated': this.safeInteger2(transaction, 'successTime', 'updateTime'),
            'comment': undefined,
            'internal': internal,
            'fee': fee,
        };
    }
    /**
     * @method
     * @name bybit#withdraw
     * @see https://www.tokocrypto.com/apidocs/#withdraw-signed
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        this.checkAddress(address);
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            // 'clientId': 'string', // // client's custom id for withdraw order, server does not check it's uniqueness, automatically generated if not sent
            // 'network': 'string',
            'address': address,
            // 'addressTag': 'string', // for coins like XRP, XMR, etc
            'amount': this.numberToString(amount),
        };
        if (tag !== undefined) {
            request['addressTag'] = tag;
        }
        const [networkCode, query] = this.handleNetworkCodeAndParams(params);
        const networkId = this.networkCodeToId(networkCode);
        if (networkId !== undefined) {
            request['network'] = networkId.toUpperCase();
        }
        const response = await this.privatePostOpenV1Withdraws(this.extend(request, query));
        //
        //     {
        //         "code": 0,
        //         "msg": "成功",
        //         "data": {
        //             "withdrawId":"12"
        //         },
        //         "timestamp": 1571745049095
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!(api in this.urls['api']['rest'])) {
            throw new errors.NotSupported(this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api']['rest'][api];
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
        const userDataStream = (path === 'userDataStream') || (path === 'listenKey');
        if (userDataStream) {
            if (this.apiKey) {
                // v1 special case for userDataStream
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (method !== 'GET') {
                    body = this.urlencode(params);
                }
            }
            else {
                throw new errors.AuthenticationError(this.id + ' userDataStream endpoint requires `apiKey` credential');
            }
        }
        else if ((api === 'private') || (api === 'sapi' && path !== 'system/status') || (api === 'sapiV3') || (api === 'wapi' && path !== 'systemStatus') || (api === 'dapiPrivate') || (api === 'dapiPrivateV2') || (api === 'fapiPrivate') || (api === 'fapiPrivateV2')) {
            this.checkRequiredCredentials();
            let query = undefined;
            const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
            const extendedParams = this.extend({
                'timestamp': this.nonce(),
            }, params);
            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger(params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }
            if ((api === 'sapi') && (path === 'asset/dust')) {
                query = this.urlencodeWithArrayRepeat(extendedParams);
            }
            else if ((path === 'batchOrders') || (path.indexOf('sub-account') >= 0) || (path === 'capital/withdraw/apply') || (path.indexOf('staking') >= 0)) {
                query = this.rawencode(extendedParams);
            }
            else {
                query = this.urlencode(extendedParams);
            }
            const signature = this.hmac(this.encode(query), this.encode(this.secret), sha256.sha256);
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            }
            else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }
        else {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new errors.DDoSProtection(this.id + ' ' + code.toString() + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf('Price * QTY is zero or less') >= 0) {
                throw new errors.InvalidOrder(this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf('LOT_SIZE') >= 0) {
                throw new errors.InvalidOrder(this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf('PRICE_FILTER') >= 0) {
                throw new errors.InvalidOrder(this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        // check success value for wapi endpoints
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeBool(response, 'success', true);
        if (!success) {
            const messageInner = this.safeString(response, 'msg');
            let parsedMessage = undefined;
            if (messageInner !== undefined) {
                try {
                    parsedMessage = JSON.parse(messageInner);
                }
                catch (e) {
                    // do nothing
                    parsedMessage = undefined;
                }
                if (parsedMessage !== undefined) {
                    response = parsedMessage;
                }
            }
        }
        const message = this.safeString(response, 'msg');
        if (message !== undefined) {
            this.throwExactlyMatchedException(this.exceptions['exact'], message, this.id + ' ' + message);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, this.id + ' ' + message);
        }
        // checks against error codes
        const error = this.safeString(response, 'code');
        if (error !== undefined) {
            // https://github.com/ccxt/ccxt/issues/6501
            // https://github.com/ccxt/ccxt/issues/7742
            if ((error === '200') || Precise["default"].stringEquals(error, '0')) {
                return undefined;
            }
            // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
            // despite that their message is very confusing, it is raised by Binance
            // on a temporary ban, the API key is valid, but disabled for a while
            if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                throw new errors.DDoSProtection(this.id + ' ' + body);
            }
            const feedback = this.id + ' ' + body;
            if (message === 'No need to change margin type.') {
                // not an error
                // https://github.com/ccxt/ccxt/issues/11268
                // https://github.com/ccxt/ccxt/pull/11624
                // POST https://fapi.binance.com/fapi/v1/marginType 400 Bad Request
                // binanceusdm {"code":-4046,"msg":"No need to change margin type."}
                throw new errors.MarginModeAlreadySet(feedback);
            }
            this.throwExactlyMatchedException(this.exceptions['exact'], error, feedback);
            throw new errors.ExchangeError(feedback);
        }
        if (!success) {
            throw new errors.ExchangeError(this.id + ' ' + body);
        }
        return undefined;
    }
    calculateRateLimiterCost(api, method, path, params, config = {}) {
        if (('noCoin' in config) && !('coin' in params)) {
            return config['noCoin'];
        }
        else if (('noSymbol' in config) && !('symbol' in params)) {
            return config['noSymbol'];
        }
        else if (('noPoolId' in config) && !('poolId' in params)) {
            return config['noPoolId'];
        }
        else if (('byLimit' in config) && ('limit' in params)) {
            const limit = params['limit'];
            const byLimit = config['byLimit'];
            for (let i = 0; i < byLimit.length; i++) {
                const entry = byLimit[i];
                if (limit <= entry[0]) {
                    return entry[1];
                }
            }
        }
        return this.safeInteger(config, 'cost', 1);
    }
}

module.exports = tokocrypto;
