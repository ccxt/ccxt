'use strict';

var hitbtc$1 = require('./abstract/hitbtc.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var errors = require('./base/errors.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

/**
 * @class hitbtc
 * @augments Exchange
 */
class hitbtc extends hitbtc$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'hitbtc',
            'name': 'HitBTC',
            'countries': ['HK'],
            // 300 requests per second => 1000ms / 300 = 3.333 (Trading: placing, replacing, deleting)
            // 30 requests per second => ( 1000ms / rateLimit ) / 30 = cost = 10 (Market Data and other Public Requests)
            // 20 requests per second => ( 1000ms / rateLimit ) / 20 = cost = 15 (All Other)
            'rateLimit': 3.333,
            'version': '3',
            'has': {
                'CORS': false,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': undefined,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'closePosition': false,
                'createDepositAddress': true,
                'createOrder': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': true,
                'fetchLeverageTiers': undefined,
                'fetchLiquidations': false,
                'fetchMarginMode': 'emulated',
                'fetchMarginModes': true,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPosition': true,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': 'emulated',
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'sandbox': true,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'precisionMode': number.TICK_SIZE,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg',
                'test': {
                    'public': 'https://api.demo.hitbtc.com/api/3',
                    'private': 'https://api.demo.hitbtc.com/api/3',
                },
                'api': {
                    'public': 'https://api.hitbtc.com/api/3',
                    'private': 'https://api.hitbtc.com/api/3',
                },
                'www': 'https://hitbtc.com',
                'referral': 'https://hitbtc.com/?ref_id=5a5d39a65d466',
                'doc': [
                    'https://api.hitbtc.com',
                    'https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv2.md',
                ],
                'fees': [
                    'https://hitbtc.com/fees-and-limits',
                    'https://support.hitbtc.com/hc/en-us/articles/115005148605-Fees-and-limits',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'public/currency': 10,
                        'public/currency/{currency}': 10,
                        'public/symbol': 10,
                        'public/symbol/{symbol}': 10,
                        'public/ticker': 10,
                        'public/ticker/{symbol}': 10,
                        'public/price/rate': 10,
                        'public/price/history': 10,
                        'public/price/ticker': 10,
                        'public/price/ticker/{symbol}': 10,
                        'public/trades': 10,
                        'public/trades/{symbol}': 10,
                        'public/orderbook': 10,
                        'public/orderbook/{symbol}': 10,
                        'public/candles': 10,
                        'public/candles/{symbol}': 10,
                        'public/converted/candles': 10,
                        'public/converted/candles/{symbol}': 10,
                        'public/futures/info': 10,
                        'public/futures/info/{symbol}': 10,
                        'public/futures/history/funding': 10,
                        'public/futures/history/funding/{symbol}': 10,
                        'public/futures/candles/index_price': 10,
                        'public/futures/candles/index_price/{symbol}': 10,
                        'public/futures/candles/mark_price': 10,
                        'public/futures/candles/mark_price/{symbol}': 10,
                        'public/futures/candles/premium_index': 10,
                        'public/futures/candles/premium_index/{symbol}': 10,
                        'public/futures/candles/open_interest': 10,
                        'public/futures/candles/open_interest/{symbol}': 10,
                    },
                },
                'private': {
                    'get': {
                        'spot/balance': 15,
                        'spot/balance/{currency}': 15,
                        'spot/order': 1,
                        'spot/order/{client_order_id}': 1,
                        'spot/fee': 15,
                        'spot/fee/{symbol}': 15,
                        'spot/history/order': 15,
                        'spot/history/trade': 15,
                        'margin/account': 1,
                        'margin/account/isolated/{symbol}': 1,
                        'margin/account/cross/{currency}': 1,
                        'margin/order': 1,
                        'margin/order/{client_order_id}': 1,
                        'margin/config': 15,
                        'margin/history/order': 15,
                        'margin/history/trade': 15,
                        'margin/history/positions': 15,
                        'margin/history/clearing': 15,
                        'futures/balance': 15,
                        'futures/balance/{currency}': 15,
                        'futures/account': 1,
                        'futures/account/isolated/{symbol}': 1,
                        'futures/order': 1,
                        'futures/order/{client_order_id}': 1,
                        'futures/config': 15,
                        'futures/fee': 15,
                        'futures/fee/{symbol}': 15,
                        'futures/history/order': 15,
                        'futures/history/trade': 15,
                        'futures/history/positions': 15,
                        'futures/history/clearing': 15,
                        'wallet/balance': 30,
                        'wallet/balance/{currency}': 30,
                        'wallet/crypto/address': 30,
                        'wallet/crypto/address/recent-deposit': 30,
                        'wallet/crypto/address/recent-withdraw': 30,
                        'wallet/crypto/address/check-mine': 30,
                        'wallet/transactions': 30,
                        'wallet/transactions/{tx_id}': 30,
                        'wallet/crypto/fee/estimate': 30,
                        'wallet/airdrops': 30,
                        'wallet/amount-locks': 30,
                        'sub-account': 15,
                        'sub-account/acl': 15,
                        'sub-account/balance/{subAccID}': 15,
                        'sub-account/crypto/address/{subAccID}/{currency}': 15,
                    },
                    'post': {
                        'spot/order': 1,
                        'spot/order/list': 1,
                        'margin/order': 1,
                        'margin/order/list': 1,
                        'futures/order': 1,
                        'futures/order/list': 1,
                        'wallet/crypto/address': 30,
                        'wallet/crypto/withdraw': 30,
                        'wallet/convert': 30,
                        'wallet/transfer': 30,
                        'wallet/internal/withdraw': 30,
                        'wallet/crypto/check-offchain-available': 30,
                        'wallet/crypto/fees/estimate': 30,
                        'wallet/airdrops/{id}/claim': 30,
                        'sub-account/freeze': 15,
                        'sub-account/activate': 15,
                        'sub-account/transfer': 15,
                        'sub-account/acl': 15,
                    },
                    'patch': {
                        'spot/order/{client_order_id}': 1,
                        'margin/order/{client_order_id}': 1,
                        'futures/order/{client_order_id}': 1,
                    },
                    'delete': {
                        'spot/order': 1,
                        'spot/order/{client_order_id}': 1,
                        'margin/position': 1,
                        'margin/position/isolated/{symbol}': 1,
                        'margin/order': 1,
                        'margin/order/{client_order_id}': 1,
                        'futures/position': 1,
                        'futures/position/{margin_mode}/{symbol}': 1,
                        'futures/order': 1,
                        'futures/order/{client_order_id}': 1,
                        'wallet/crypto/withdraw/{id}': 30,
                    },
                    'put': {
                        'margin/account/isolated/{symbol}': 1,
                        'futures/account/isolated/{symbol}': 1,
                        'wallet/crypto/withdraw/{id}': 30,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': this.parseNumber('0.0009'),
                    'maker': this.parseNumber('0.0009'),
                    'tiers': {
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.0009')],
                            [this.parseNumber('10'), this.parseNumber('0.0007')],
                            [this.parseNumber('100'), this.parseNumber('0.0006')],
                            [this.parseNumber('500'), this.parseNumber('0.0005')],
                            [this.parseNumber('1000'), this.parseNumber('0.0003')],
                            [this.parseNumber('5000'), this.parseNumber('0.0002')],
                            [this.parseNumber('10000'), this.parseNumber('0.0001')],
                            [this.parseNumber('20000'), this.parseNumber('0')],
                            [this.parseNumber('50000'), this.parseNumber('-0.0001')],
                            [this.parseNumber('100000'), this.parseNumber('-0.0001')],
                        ],
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.0009')],
                            [this.parseNumber('10'), this.parseNumber('0.0008')],
                            [this.parseNumber('100'), this.parseNumber('0.0007')],
                            [this.parseNumber('500'), this.parseNumber('0.0007')],
                            [this.parseNumber('1000'), this.parseNumber('0.0006')],
                            [this.parseNumber('5000'), this.parseNumber('0.0006')],
                            [this.parseNumber('10000'), this.parseNumber('0.0005')],
                            [this.parseNumber('20000'), this.parseNumber('0.0004')],
                            [this.parseNumber('50000'), this.parseNumber('0.0003')],
                            [this.parseNumber('100000'), this.parseNumber('0.0002')],
                        ],
                    },
                },
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'exceptions': {
                'exact': {
                    '429': errors.RateLimitExceeded,
                    '500': errors.ExchangeError,
                    '503': errors.ExchangeNotAvailable,
                    '504': errors.ExchangeNotAvailable,
                    '600': errors.PermissionDenied,
                    '800': errors.ExchangeError,
                    '1002': errors.AuthenticationError,
                    '1003': errors.PermissionDenied,
                    '1004': errors.AuthenticationError,
                    '1005': errors.AuthenticationError,
                    '2001': errors.BadSymbol,
                    '2002': errors.BadRequest,
                    '2003': errors.BadRequest,
                    '2010': errors.BadRequest,
                    '2011': errors.BadRequest,
                    '2012': errors.BadRequest,
                    '2020': errors.BadRequest,
                    '2022': errors.BadRequest,
                    '2024': errors.InvalidOrder,
                    '10001': errors.BadRequest,
                    '10021': errors.AccountSuspended,
                    '10022': errors.BadRequest,
                    '20001': errors.InsufficientFunds,
                    '20002': errors.OrderNotFound,
                    '20003': errors.ExchangeError,
                    '20004': errors.ExchangeError,
                    '20005': errors.ExchangeError,
                    '20006': errors.ExchangeError,
                    '20007': errors.ExchangeError,
                    '20008': errors.InvalidOrder,
                    '20009': errors.InvalidOrder,
                    '20010': errors.OnMaintenance,
                    '20011': errors.ExchangeError,
                    '20012': errors.ExchangeError,
                    '20014': errors.ExchangeError,
                    '20016': errors.ExchangeError,
                    '20018': errors.ExchangeError,
                    '20031': errors.ExchangeError,
                    '20032': errors.ExchangeError,
                    '20033': errors.ExchangeError,
                    '20034': errors.ExchangeError,
                    '20040': errors.ExchangeError,
                    '20041': errors.ExchangeError,
                    '20042': errors.ExchangeError,
                    '20043': errors.ExchangeError,
                    '20044': errors.PermissionDenied,
                    '20045': errors.InvalidOrder,
                    '20047': errors.InvalidOrder,
                    '20048': errors.InvalidOrder,
                    '20049': errors.InvalidOrder,
                    '20080': errors.ExchangeError,
                    '21001': errors.ExchangeError,
                    '21003': errors.AccountSuspended,
                    '21004': errors.AccountSuspended,
                    '22004': errors.ExchangeError,
                    '22008': errors.ExchangeError, // Gateway timeout exceeded.
                },
                'broad': {},
            },
            'options': {
                'defaultNetwork': 'ERC20',
                'defaultNetworks': {
                    'ETH': 'ETH',
                    'USDT': 'TRC20',
                },
                'networks': {
                    // mainnet network ids are in lowercase for BTC & ETH
                    'BTC': 'btc',
                    'OMNI': 'BTC',
                    'ETH': 'eth',
                    'ERC20': 'ETH',
                    'ETC': 'ETC',
                    'BEP20': 'BSC',
                    'TRC20': 'TRX',
                    // '': 'UGT',
                    'NEAR': 'NEAR',
                    // '': 'LWF',
                    'DGB': 'DGB',
                    // '': 'YOYOW',
                    'AE': 'AE',
                    // 'BCHABC': 'BCHABC',
                    // '': 'BCI',
                    // 'BYTECOIN': 'bcn',
                    'AR': 'AR',
                    // '': 'HPC',
                    'ADA': 'ADA',
                    // 'BELDEX': 'BDX',
                    // 'ARDOR': 'ARDR',
                    // 'NEBLIO': 'NEBL',
                    // '': 'DIM',
                    'CHZ': 'CHZ',
                    // '': 'BET',
                    // '': '8BT',
                    'ABBC': 'ABBC',
                    // '': 'ABTC',
                    // 'ACHAIN': 'ACT',
                    // '': 'ADK',
                    // '': 'AEON',
                    'ALGO': 'ALGO',
                    // 'AMBROSUS': 'AMB',
                    // '': 'APL',
                    'APT': 'APT',
                    // '': 'ARK',
                    // 'PIRATECHAIN': 'ARRR',
                    // '': 'ASP',
                    // '': 'ATB',
                    'ATOM': 'ATOM',
                    'AVAXC': 'AVAC',
                    'AVAXX': 'AVAX',
                    // '': 'AYA',
                    // '': 'B2G',
                    // '': 'B2X',
                    // '': 'BANANO',
                    // '': 'BCCF',
                    'BSV': 'BCHSV',
                    'BEP2': 'BNB',
                    // 'BOSON': 'BOS',
                    // '': 'BRL', // brazilian real
                    // '': 'BST',
                    // 'BITCOINADDITION': 'BTCADD',
                    // '': 'BTCP',
                    // 'SUPERBTC': 'SBTC',
                    // 'BITCOINVAULT': 'BTCV',
                    // 'BITCOINGOLD': 'BTG',
                    // 'BITCOINDIAMOND': 'BCD',
                    // 'BITCONNECT': 'BCC',
                    // '': 'BTM',
                    // 'BITSHARES_OLD': 'BTS',
                    // '': 'BTX',
                    // '': 'BWI',
                    'CELO': 'CELO',
                    // '': 'CENNZ',
                    // '': 'CHX',
                    'CKB': 'CKB',
                    // 'CALLISTO': 'CLO',
                    // '': 'CLR',
                    // '': 'CNX',
                    // '': 'CRS',
                    // '': 'CSOV',
                    'CTXC': 'CTXC',
                    // '': 'CURE',
                    // 'CONSTELLATION': 'DAG',
                    // '': 'DAPS',
                    'DASH': 'DASH',
                    // '': 'DBIX',
                    'DCR': 'DCR',
                    // '': 'DCT',
                    // '': 'DDR',
                    // '': 'DNA',
                    'DOGE': 'doge',
                    // 'POLKADOT': 'DOT',
                    // '': 'NEWDOT', POLKADOT NEW
                    // '': 'dsh',
                    // '': 'ECA',
                    // '': 'ECOIN',
                    // '': 'EEX',
                    'EGLD': 'EGLD',
                    // '': 'ELE',
                    // 'ELECTRONEUM': 'Electroneum',
                    // '': 'ELM',
                    // '': 'EMC',
                    'EOS': 'EOS',
                    // 'AERGO': 'ERG',
                    'ETHW': 'ETHW',
                    // 'ETHERLITE': 'ETL',
                    // '': 'ETP', // metaverse etp
                    // '': 'EUNO',
                    'EVER': 'EVER',
                    // '': 'EXP',
                    // '': 'fcn',
                    'FET': 'FET',
                    'FIL': 'FIL',
                    // '': 'FIRO',
                    'FLOW': 'FLOW',
                    // '': 'G999',
                    // '': 'GAME',
                    // '': 'GASP',
                    // '': 'GBX',
                    // '': 'GHOST',
                    // '': 'GLEEC',
                    'GLMR': 'GLMR',
                    // '': 'GMD',
                    // '': 'GRAPH',
                    'GRIN': 'GRIN',
                    'HBAR': 'HBAR',
                    // '': 'HDG',
                    'HIVE': 'HIVE',
                    // 'HARBOR': 'HRB',
                    // '': 'HSR',
                    // '': 'HTML',
                    'HYDRA': 'HYDRA',
                    'ICP': 'ICP',
                    'ICX': 'ICX',
                    // '': 'IML',
                    'IOST': 'IOST',
                    'IOTA': 'IOTA',
                    'IOTX': 'IOTX',
                    // '': 'IQ',
                    'KAVA': 'KAVA',
                    'KLAY': 'KIM',
                    'KOMODO': 'KMD',
                    // '': 'KRM',
                    'KSM': 'KSM',
                    // '': 'LAVA',
                    // 'LITECOINCASH': 'LCC',
                    'LSK': 'LSK',
                    // '': 'LOC',
                    'LTC': 'ltc',
                    // '': 'LTNM',
                    // 'TERRACLASSIC': 'LUNA',
                    // 'TERRA': 'LUNANEW',
                    // '': 'MAN',
                    // '': 'MESH',
                    'MINA': 'MINA',
                    // '': 'MNX',
                    // 'MOBILECOIN': 'MOB',
                    'MOVR': 'MOVR',
                    // '': 'MPK',
                    // '': 'MRV',
                    'NANO': 'NANO',
                    // '': 'NAV',
                    'NEO': 'NEO',
                    // 'NIMIQ': 'NIM',
                    // '': 'NJBC',
                    // '': 'NKN',
                    // '': 'NLC2',
                    // '': 'NOF',
                    // 'ENERGI': 'NRG',
                    // '': 'nxt',
                    // '': 'ODN',
                    'ONE': 'ONE',
                    // 'ONTOLOGYGAS': 'ONG',
                    'ONT': 'ONT',
                    'OPTIMISM': 'OP',
                    // '': 'PAD',
                    // '': 'PART',
                    // '': 'PBKX',
                    // '': 'PLC',
                    'PLCU': 'PLCU',
                    // '': 'PLI',
                    // '': 'POA',
                    'MATIC': 'POLYGON',
                    // '': 'PPC',
                    // '': 'PQT',
                    // '': 'PROC',
                    // 'PASTEL': 'PSL',
                    // '': 'qcn',
                    'QTUM': 'QTUM',
                    // '': 'RCOIN',
                    'REI': 'REI',
                    // '': 'RIF',
                    // '': 'ROOTS',
                    'OASIS': 'ROSE',
                    // '': 'RPX',
                    // '': 'RUB',
                    'RVN': 'RVN',
                    // '': 'SBD',
                    'SC': 'SC',
                    'SCRT': 'SCRT',
                    // '': 'SLX',
                    // 'SMARTMESH': 'SMART',
                    // '': 'SMT',
                    // '': 'SNM',
                    'SOL': 'SOL',
                    // '': 'SRX',
                    // '': 'STAK',
                    'STEEM': 'STEEM',
                    // 'STRATIS': 'STRAT',
                    // '': 'TCN',
                    // '': 'TENT',
                    'THETA': 'Theta',
                    // '': 'TIV',
                    // '': 'TNC',
                    // 'TON': 'TONCOIN',
                    'TRUE': 'TRUE',
                    // '': 'TRY', // turkish lira
                    // '': 'UNO',
                    // '': 'USNOTA',
                    // '': 'VEO',
                    'VET': 'VET',
                    // '': 'VITAE',
                    // 'VELAS': 'VLX',
                    'VSYS': 'VSYS',
                    // '': 'VTC',
                    'WAVES': 'WAVES',
                    'WAX': 'WAX',
                    // '': 'WEALTH',
                    // 'WALTONCHAIN': 'WTC',
                    // '': 'WTT',
                    'XCH': 'XCH',
                    // '': 'XDC', // xinfin?
                    // '': 'xdn',
                    // '': 'XDNCO',
                    // '': 'XDNICCO',
                    'XEC': 'XEC',
                    'NEM': 'XEM',
                    // 'HAVEN': 'XHV',
                    // '': 'XLC',
                    'XLM': 'XLM',
                    // '': 'XMO',
                    'XMR': 'xmr',
                    // 'MONEROCLASSIC': 'XMC',
                    // '': 'XNS',
                    // '': 'XPRM',
                    // '': 'XRC',
                    'XRD': 'XRD',
                    'XRP': 'XRP',
                    'XTZ': 'XTZ',
                    'XVG': 'XVG',
                    'XYM': 'XYM',
                    'ZEC': 'ZEC',
                    'ZEN': 'ZEN',
                    'ZIL': 'ZIL',
                    // '': 'ZYN',
                },
                'accountsByType': {
                    'spot': 'spot',
                    'funding': 'wallet',
                    'swap': 'derivatives',
                    'future': 'derivatives',
                },
                'withdraw': {
                    'includeFee': false,
                },
            },
            'commonCurrencies': {
                'AUTO': 'Cube',
                'BCC': 'BCC',
                'BDP': 'BidiPass',
                'BET': 'DAO.Casino',
                'BIT': 'BitRewards',
                'BOX': 'BOX Token',
                'CPT': 'Cryptaur',
                'GET': 'Themis',
                'GMT': 'GMT Token',
                'HSR': 'HC',
                'IQ': 'IQ.Cash',
                'LNC': 'LinkerCoin',
                'PLA': 'PlayChip',
                'PNT': 'Penta',
                'SBTC': 'Super Bitcoin',
                'STEPN': 'GMT',
                'STX': 'STOX',
                'TV': 'Tokenville',
                'XMT': 'MTL',
                'XPNT': 'PNT',
            },
        });
    }
    nonce() {
        return this.milliseconds();
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name hitbtc#fetchMarkets
         * @description retrieves data on all markets for hitbtc
         * @see https://api.hitbtc.com/#symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetPublicSymbol(params);
        //
        //     {
        //         "AAVEUSDT_PERP":{
        //             "type":"futures",
        //             "expiry":null,
        //             "underlying":"AAVE",
        //             "base_currency":null,
        //             "quote_currency":"USDT",
        //             "quantity_increment":"0.01",
        //             "tick_size":"0.001",
        //             "take_rate":"0.0005",
        //             "make_rate":"0.0002",
        //             "fee_currency":"USDT",
        //             "margin_trading":true,
        //             "max_initial_leverage":"50.00"
        //         },
        //         "MANAUSDT":{
        //             "type":"spot",
        //             "base_currency":"MANA",
        //             "quote_currency":"USDT",
        //             "quantity_increment":"1",
        //             "tick_size":"0.0000001",
        //             "take_rate":"0.0025",
        //             "make_rate":"0.001",
        //             "fee_currency":"USDT",
        //             "margin_trading":true,
        //             "max_initial_leverage":"5.00"
        //         },
        //     }
        //
        const result = [];
        const ids = Object.keys(response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id.endsWith('_BQX')) {
                continue; // seems like an invalid symbol and if we try to access it individually we get: {"timestamp":"2023-09-02T14:38:20.351Z","error":{"description":"Try get /public/symbol, to get list of all available symbols.","code":2001,"message":"No such symbol: EOSUSD_BQX"},"path":"/api/3/public/symbol/EOSUSD_BQX","requestId":"e1e9fce6-16374591"}
            }
            const market = this.safeValue(response, id);
            const marketType = this.safeString(market, 'type');
            const expiry = this.safeInteger(market, 'expiry');
            const contract = (marketType === 'futures');
            const spot = (marketType === 'spot');
            const marginTrading = this.safeBool(market, 'margin_trading', false);
            const margin = spot && marginTrading;
            const future = (expiry !== undefined);
            const swap = (contract && !future);
            const option = false;
            const baseId = this.safeString2(market, 'base_currency', 'underlying');
            const quoteId = this.safeString(market, 'quote_currency');
            const feeCurrencyId = this.safeString(market, 'fee_currency');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const feeCurrency = this.safeCurrencyCode(feeCurrencyId);
            let settleId = undefined;
            let settle = undefined;
            let symbol = base + '/' + quote;
            let type = 'spot';
            let contractSize = undefined;
            let linear = undefined;
            let inverse = undefined;
            if (contract) {
                contractSize = this.parseNumber('1');
                settleId = feeCurrencyId;
                settle = this.safeCurrencyCode(settleId);
                linear = ((quote !== undefined) && (quote === settle));
                inverse = !linear;
                symbol = symbol + ':' + settle;
                if (future) {
                    symbol = symbol + '-' + expiry;
                    type = 'future';
                }
                else {
                    type = 'swap';
                }
            }
            const lotString = this.safeString(market, 'quantity_increment');
            const stepString = this.safeString(market, 'tick_size');
            const lot = this.parseNumber(lotString);
            const step = this.parseNumber(stepString);
            result.push({
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
                'margin': margin,
                'swap': swap,
                'future': future,
                'option': option,
                'active': true,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber(market, 'take_rate'),
                'maker': this.safeNumber(market, 'make_rate'),
                'contractSize': contractSize,
                'expiry': expiry,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'feeCurrency': feeCurrency,
                'precision': {
                    'amount': lot,
                    'price': step,
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber('1'),
                        'max': this.safeNumber(market, 'max_initial_leverage', 1),
                    },
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': step,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber(Precise["default"].stringMul(lotString, stepString)),
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name hitbtc#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://api.hitbtc.com/#currencies
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetPublicCurrency(params);
        //
        //     {
        //       "WEALTH": {
        //         "full_name": "ConnectWealth",
        //         "payin_enabled": false,
        //         "payout_enabled": false,
        //         "transfer_enabled": true,
        //         "precision_transfer": "0.001",
        //         "networks": [
        //           {
        //             "network": "ETH",
        //             "protocol": "ERC20",
        //             "default": true,
        //             "payin_enabled": false,
        //             "payout_enabled": false,
        //             "precision_payout": "0.001",
        //             "payout_fee": "0.016800000000",
        //             "payout_is_payment_id": false,
        //             "payin_payment_id": false,
        //             "payin_confirmations": "2"
        //           }
        //         ]
        //       }
        //     }
        //
        const result = {};
        const currencies = Object.keys(response);
        for (let i = 0; i < currencies.length; i++) {
            const currencyId = currencies[i];
            const code = this.safeCurrencyCode(currencyId);
            const entry = response[currencyId];
            const name = this.safeString(entry, 'full_name');
            const precision = this.safeNumber(entry, 'precision_transfer');
            const payinEnabled = this.safeBool(entry, 'payin_enabled', false);
            const payoutEnabled = this.safeBool(entry, 'payout_enabled', false);
            const transferEnabled = this.safeBool(entry, 'transfer_enabled', false);
            const active = payinEnabled && payoutEnabled && transferEnabled;
            const rawNetworks = this.safeValue(entry, 'networks', []);
            const networks = {};
            let fee = undefined;
            let depositEnabled = undefined;
            let withdrawEnabled = undefined;
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                const networkId = this.safeString2(rawNetwork, 'protocol', 'network');
                const network = this.safeNetwork(networkId);
                fee = this.safeNumber(rawNetwork, 'payout_fee');
                const networkPrecision = this.safeNumber(rawNetwork, 'precision_payout');
                const payinEnabledNetwork = this.safeBool(rawNetwork, 'payin_enabled', false);
                const payoutEnabledNetwork = this.safeBool(rawNetwork, 'payout_enabled', false);
                const activeNetwork = payinEnabledNetwork && payoutEnabledNetwork;
                if (payinEnabledNetwork && !depositEnabled) {
                    depositEnabled = true;
                }
                else if (!payinEnabledNetwork) {
                    depositEnabled = false;
                }
                if (payoutEnabledNetwork && !withdrawEnabled) {
                    withdrawEnabled = true;
                }
                else if (!payoutEnabledNetwork) {
                    withdrawEnabled = false;
                }
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'fee': fee,
                    'active': activeNetwork,
                    'deposit': payinEnabledNetwork,
                    'withdraw': payoutEnabledNetwork,
                    'precision': networkPrecision,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            const networksKeys = Object.keys(networks);
            const networksLength = networksKeys.length;
            result[code] = {
                'info': entry,
                'code': code,
                'id': currencyId,
                'precision': precision,
                'name': name,
                'active': active,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'networks': networks,
                'fee': (networksLength <= 1) ? fee : undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }
    safeNetwork(networkId) {
        if (networkId === undefined) {
            return undefined;
        }
        else {
            return networkId.toUpperCase();
        }
    }
    async createDepositAddress(code, params = {}) {
        /**
         * @method
         * @name hitbtc#createDepositAddress
         * @description create a currency deposit address
         * @see https://api.hitbtc.com/#generate-deposit-crypto-address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const network = this.safeStringUpper(params, 'network');
        if ((network !== undefined) && (code === 'USDT')) {
            const networks = this.safeValue(this.options, 'networks');
            const parsedNetwork = this.safeString(networks, network);
            if (parsedNetwork !== undefined) {
                request['currency'] = parsedNetwork;
            }
            params = this.omit(params, 'network');
        }
        const response = await this.privatePostWalletCryptoAddress(this.extend(request, params));
        //
        //  {"currency":"ETH","address":"0xd0d9aea60c41988c3e68417e2616065617b7afd3"}
        //
        const currencyId = this.safeString(response, 'currency');
        return {
            'currency': this.safeCurrencyCode(currencyId),
            'address': this.safeString(response, 'address'),
            'tag': this.safeString(response, 'payment_id'),
            'network': undefined,
            'info': response,
        };
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://api.hitbtc.com/#get-deposit-crypto-address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
        };
        const network = this.safeStringUpper(params, 'network');
        if ((network !== undefined) && (code === 'USDT')) {
            const networks = this.safeValue(this.options, 'networks');
            const parsedNetwork = this.safeString(networks, network);
            if (parsedNetwork !== undefined) {
                request['currency'] = parsedNetwork;
            }
            params = this.omit(params, 'network');
        }
        const response = await this.privateGetWalletCryptoAddress(this.extend(request, params));
        //
        //  [{"currency":"ETH","address":"0xd0d9aea60c41988c3e68417e2616065617b7afd3"}]
        //
        const firstAddress = this.safeValue(response, 0);
        const address = this.safeString(firstAddress, 'address');
        const currencyId = this.safeString(firstAddress, 'currency');
        const tag = this.safeString(firstAddress, 'payment_id');
        const parsedCode = this.safeCurrencyCode(currencyId);
        return {
            'info': response,
            'address': address,
            'tag': tag,
            'code': parsedCode,
            'currency': parsedCode,
            'network': undefined,
        };
    }
    parseBalance(response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString(entry, 'currency');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['free'] = this.safeString(entry, 'available');
            account['used'] = this.safeString(entry, 'reserved');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name hitbtc#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://api.hitbtc.com/#wallet-balance
         * @see https://api.hitbtc.com/#get-spot-trading-balance
         * @see https://api.hitbtc.com/#get-trading-balance
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        const type = this.safeStringLower(params, 'type', 'spot');
        params = this.omit(params, ['type']);
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        const account = this.safeString(accountsByType, type, type);
        let response = undefined;
        if (account === 'wallet') {
            response = await this.privateGetWalletBalance(params);
        }
        else if (account === 'spot') {
            response = await this.privateGetSpotBalance(params);
        }
        else if (account === 'derivatives') {
            response = await this.privateGetFuturesBalance(params);
        }
        else {
            const keys = Object.keys(accountsByType);
            throw new errors.BadRequest(this.id + ' fetchBalance() type parameter must be one of ' + keys.join(', '));
        }
        //
        //     [
        //       {
        //         "currency": "PAXG",
        //         "available": "0",
        //         "reserved": "0",
        //         "reserved_margin": "0",
        //       },
        //       ...
        //     ]
        //
        return this.parseBalance(response);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.hitbtc.com/#tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicTickerSymbol(this.extend(request, params));
        //
        //     {
        //         "ask": "0.020572",
        //         "bid": "0.020566",
        //         "last": "0.020574",
        //         "low": "0.020388",
        //         "high": "0.021084",
        //         "open": "0.020913",
        //         "volume": "138444.3666",
        //         "volume_quote": "2853.6874972480",
        //         "timestamp": "2021-06-02T17:52:36.731Z"
        //     }
        //
        return this.parseTicker(response, market);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://api.hitbtc.com/#tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds(symbols);
            const delimited = marketIds.join(',');
            request['symbols'] = delimited;
        }
        const response = await this.publicGetPublicTicker(this.extend(request, params));
        //
        //     {
        //       "BTCUSDT": {
        //         "ask": "63049.06",
        //         "bid": "63046.41",
        //         "last": "63048.36",
        //         "low": "62010.00",
        //         "high": "66657.99",
        //         "open": "64839.75",
        //         "volume": "15272.13278",
        //         "volume_quote": "976312127.6277998",
        //         "timestamp": "2021-10-22T04:25:47.573Z"
        //       }
        //     }
        //
        const result = {};
        const keys = Object.keys(response);
        for (let i = 0; i < keys.length; i++) {
            const marketId = keys[i];
            const market = this.safeMarket(marketId);
            const symbol = market['symbol'];
            const entry = response[marketId];
            result[symbol] = this.parseTicker(entry, market);
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //       "ask": "62756.01",
        //       "bid": "62754.09",
        //       "last": "62755.87",
        //       "low": "62010.00",
        //       "high": "66657.99",
        //       "open": "65089.27",
        //       "volume": "16719.50366",
        //       "volume_quote": "1063422878.8156828",
        //       "timestamp": "2021-10-22T07:29:14.585Z"
        //     }
        //
        const timestamp = this.parse8601(ticker['timestamp']);
        const symbol = this.safeSymbol(undefined, market);
        const baseVolume = this.safeString(ticker, 'volume');
        const quoteVolume = this.safeString(ticker, 'volume_quote');
        const open = this.safeString(ticker, 'open');
        const last = this.safeString(ticker, 'last');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high'),
            'low': this.safeString(ticker, 'low'),
            'bid': this.safeString(ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString(ticker, 'ask'),
            'askVolume': undefined,
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
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://api.hitbtc.com/#trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        let response = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
            response = await this.publicGetPublicTradesSymbol(this.extend(request, params));
        }
        else {
            response = await this.publicGetPublicTrades(this.extend(request, params));
        }
        if (symbol !== undefined) {
            return this.parseTrades(response, market);
        }
        let trades = [];
        const marketIds = Object.keys(response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const marketInner = this.market(marketId);
            const rawTrades = response[marketId];
            const parsed = this.parseTrades(rawTrades, marketInner);
            trades = this.arrayConcat(trades, parsed);
        }
        return trades;
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://api.hitbtc.com/#spot-trades-history
         * @see https://api.hitbtc.com/#futures-trades-history
         * @see https://api.hitbtc.com/#margin-trades-history
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for fetching margin trades
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        let marketType = undefined;
        let marginMode = undefined;
        let response = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchMyTrades', params);
        params = this.omit(params, ['marginMode', 'margin']);
        if (marginMode !== undefined) {
            response = await this.privateGetMarginHistoryTrade(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateGetSpotHistoryTrade(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateGetFuturesHistoryTrade(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginHistoryTrade(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchMyTrades() not support this market type');
            }
        }
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // createOrder (market)
        //
        //  {
        //      "id": "1569252895",
        //      "position_id": "0",
        //      "quantity": "10",
        //      "price": "0.03919424",
        //      "fee": "0.000979856000",
        //      "timestamp": "2022-01-25T19:38:36.153Z",
        //      "taker": true
        //  }
        //
        // fetchTrades
        //
        //  {
        //      "id": 974786185,
        //      "price": "0.032462",
        //      "qty": "0.3673",
        //      "side": "buy",
        //      "timestamp": "2020-10-16T12:57:39.846Z"
        //  }
        //
        // fetchMyTrades spot
        //
        //  {
        //      "id": 277210397,
        //      "clientOrderId": "6e102f3e7f3f4e04aeeb1cdc95592f1a",
        //      "orderId": 28102855393,
        //      "symbol": "ETHBTC",
        //      "side": "sell",
        //      "quantity": "0.002",
        //      "price": "0.073365",
        //      "fee": "0.000000147",
        //      "timestamp": "2018-04-28T18:39:55.345Z",
        //      "taker": true
        //  }
        //
        // fetchMyTrades swap and margin
        //
        //  {
        //      "id": 4718564,
        //      "order_id": 58730811958,
        //      "client_order_id": "475c47d97f867f09726186eb22b4c3d4",
        //      "symbol": "BTCUSDT_PERP",
        //      "side": "sell",
        //      "quantity": "0.0001",
        //      "price": "41118.51",
        //      "fee": "0.002055925500",
        //      "timestamp": "2022-03-17T05:23:17.795Z",
        //      "taker": true,
        //      "position_id": 2350122,
        //      "pnl": "0.002255000000",
        //      "liquidation": false
        //  }
        //
        const timestamp = this.parse8601(trade['timestamp']);
        const marketId = this.safeString(trade, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        let fee = undefined;
        const feeCostString = this.safeString(trade, 'fee');
        const taker = this.safeValue(trade, 'taker');
        let takerOrMaker = undefined;
        if (taker !== undefined) {
            takerOrMaker = taker ? 'taker' : 'maker';
        }
        else {
            takerOrMaker = 'taker'; // the only case when `taker` field is missing, is public fetchTrades and it must be taker
        }
        if (feeCostString !== undefined) {
            const info = this.safeValue(market, 'info', {});
            const feeCurrency = this.safeString(info, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode(feeCurrency);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const orderId = this.safeString2(trade, 'clientOrderId', 'client_order_id');
        const priceString = this.safeString(trade, 'price');
        const amountString = this.safeString2(trade, 'quantity', 'qty');
        const side = this.safeString(trade, 'side');
        const id = this.safeString(trade, 'id');
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    async fetchTransactionsHelper(types, code, since, limit, params) {
        await this.loadMarkets();
        const request = {
            'types': types,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currencies'] = currency['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetWalletTransactions(this.extend(request, params));
        //
        //     [
        //       {
        //         "id": "101609495",
        //         "created_at": "2018-03-06T22:05:06.507Z",
        //         "updated_at": "2018-03-06T22:11:45.03Z",
        //         "status": "SUCCESS",
        //         "type": "DEPOSIT",
        //         "subtype": "BLOCKCHAIN",
        //         "native": {
        //           "tx_id": "e20b0965-4024-44d0-b63f-7fb8996a6706",
        //           "index": "881652766",
        //           "currency": "ETH",
        //           "amount": "0.01418088",
        //           "hash": "d95dbbff3f9234114f1211ab0ba2a94f03f394866fd5749d74a1edab80e6c5d3",
        //           "address": "0xd9259302c32c0a0295d86a39185c9e14f6ba0a0d",
        //           "confirmations": "20",
        //           "senders": [
        //             "0x243bec9256c9a3469da22103891465b47583d9f1"
        //           ]
        //         }
        //       }
        //     ]
        //
        return this.parseTransactions(response, currency, since, limit, params);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'PENDING': 'pending',
            'FAILED': 'failed',
            'SUCCESS': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransactionType(type) {
        const types = {
            'DEPOSIT': 'deposit',
            'WITHDRAW': 'withdrawal',
        };
        return this.safeString(types, type, type);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // transaction
        //
        //     {
        //       "id": "101609495",
        //       "created_at": "2018-03-06T22:05:06.507Z",
        //       "updated_at": "2018-03-06T22:11:45.03Z",
        //       "status": "SUCCESS",
        //       "type": "DEPOSIT", // DEPOSIT, WITHDRAW, ..
        //       "subtype": "BLOCKCHAIN",
        //       "native": {
        //         "tx_id": "e20b0965-4024-44d0-b63f-7fb8996a6706",
        //         "index": "881652766",
        //         "currency": "ETH",
        //         "amount": "0.01418088",
        //         "hash": "d95dbbff3f9234114f1211ab0ba2a94f03f394866fd5749d74a1edab80e6c5d3",
        //         "address": "0xd9259302c32c0a0295d86a39185c9e14f6ba0a0d",
        //         "confirmations": "20",
        //         "senders": [
        //           "0x243bec9256c9a3469da22103891465b47583d9f1"
        //         ],
        //         "fee": "1.22" // only for WITHDRAW
        //       }
        //     },
        //     "operation_id": "084cfcd5-06b9-4826-882e-fdb75ec3625d", // only for WITHDRAW
        //     "commit_risk": {}
        // withdraw
        //
        //     {
        //         "id":"084cfcd5-06b9-4826-882e-fdb75ec3625d"
        //     }
        //
        const id = this.safeString2(transaction, 'operation_id', 'id');
        const timestamp = this.parse8601(this.safeString(transaction, 'created_at'));
        const updated = this.parse8601(this.safeString(transaction, 'updated_at'));
        const type = this.parseTransactionType(this.safeString(transaction, 'type'));
        const status = this.parseTransactionStatus(this.safeString(transaction, 'status'));
        const native = this.safeValue(transaction, 'native', {});
        const currencyId = this.safeString(native, 'currency');
        const code = this.safeCurrencyCode(currencyId);
        const txhash = this.safeString(native, 'hash');
        const address = this.safeString(native, 'address');
        const addressTo = address;
        const tag = this.safeString(native, 'payment_id');
        const tagTo = tag;
        const sender = this.safeValue(native, 'senders');
        const addressFrom = this.safeString(sender, 0);
        const amount = this.safeNumber(native, 'amount');
        const subType = this.safeString(transaction, 'subtype');
        const internal = subType === 'OFFCHAIN';
        // https://api.hitbtc.com/#check-if-offchain-is-available
        const fee = {
            'currency': undefined,
            'cost': undefined,
            'rate': undefined,
        };
        const feeCost = this.safeNumber(native, 'fee');
        if (feeCost !== undefined) {
            fee['currency'] = code;
            fee['cost'] = feeCost;
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txhash,
            'type': type,
            'currency': code,
            'network': undefined,
            'amount': amount,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'address': address,
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': tagTo,
            'updated': updated,
            'comment': undefined,
            'internal': internal,
            'fee': fee,
        };
    }
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals
         * @see https://api.hitbtc.com/#get-transactions-history
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
         * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        return await this.fetchTransactionsHelper('DEPOSIT,WITHDRAW', code, since, limit, params);
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://api.hitbtc.com/#get-transactions-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        return await this.fetchTransactionsHelper('DEPOSIT', code, since, limit, params);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://api.hitbtc.com/#get-transactions-history
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        return await this.fetchTransactionsHelper('WITHDRAW', code, since, limit, params);
    }
    async fetchOrderBooks(symbols = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://api.hitbtc.com/#order-books
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            const marketIdsInner = this.marketIds(symbols);
            request['symbols'] = marketIdsInner.join(',');
        }
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetPublicOrderbook(this.extend(request, params));
        const result = {};
        const marketIds = Object.keys(response);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const orderbook = response[marketId];
            const symbol = this.safeSymbol(marketId);
            const timestamp = this.parse8601(this.safeString(orderbook, 'timestamp'));
            result[symbol] = this.parseOrderBook(response[marketId], symbol, timestamp, 'bid', 'ask');
        }
        return result;
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api.hitbtc.com/#order-books
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetPublicOrderbookSymbol(this.extend(request, params));
        const timestamp = this.parse8601(this.safeString(response, 'timestamp'));
        return this.parseOrderBook(response, symbol, timestamp, 'bid', 'ask');
    }
    parseTradingFee(fee, market = undefined) {
        //
        //     {
        //         "symbol":"ARVUSDT", // returned from fetchTradingFees only
        //         "take_rate":"0.0009",
        //         "make_rate":"0.0009"
        //     }
        //
        const taker = this.safeNumber(fee, 'take_rate');
        const maker = this.safeNumber(fee, 'make_rate');
        const marketId = this.safeString(fee, 'symbol');
        const symbol = this.safeSymbol(marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'taker': taker,
            'maker': maker,
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    async fetchTradingFee(symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://api.hitbtc.com/#get-trading-commission
         * @see https://api.hitbtc.com/#get-trading-commission-2
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['type'] === 'spot') {
            response = await this.privateGetSpotFeeSymbol(this.extend(request, params));
        }
        else if (market['type'] === 'swap') {
            response = await this.privateGetFuturesFeeSymbol(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTradingFee() not support this market type');
        }
        //
        //     {
        //         "take_rate":"0.0009",
        //         "make_rate":"0.0009"
        //     }
        //
        return this.parseTradingFee(response, market);
    }
    async fetchTradingFees(params = {}) {
        /**
         * @method
         * @name hitbtc#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://api.hitbtc.com/#get-all-trading-commissions
         * @see https://api.hitbtc.com/#get-all-trading-commissions-2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTradingFees', undefined, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateGetSpotFee(query);
        }
        else if (marketType === 'swap') {
            response = await this.privateGetFuturesFee(query);
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchTradingFees() not support this market type');
        }
        //
        //     [
        //         {
        //             "symbol":"ARVUSDT",
        //             "take_rate":"0.0009",
        //             "make_rate":"0.0009"
        //         }
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const fee = this.parseTradingFee(response[i]);
            const symbol = fee['symbol'];
            result[symbol] = fee;
        }
        return result;
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.hitbtc.com/#candles
         * @see https://api.hitbtc.com/#futures-index-price-candles
         * @see https://api.hitbtc.com/#futures-mark-price-candles
         * @see https://api.hitbtc.com/#futures-premium-index-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, 1000);
        }
        const market = this.market(symbol);
        let request = {
            'symbol': market['id'],
            'period': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['from'] = this.iso8601(since);
        }
        [request, params] = this.handleUntilOption('until', request, params);
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        const price = this.safeString(params, 'price');
        params = this.omit(params, 'price');
        let response = undefined;
        if (price === 'mark') {
            response = await this.publicGetPublicFuturesCandlesMarkPriceSymbol(this.extend(request, params));
        }
        else if (price === 'index') {
            response = await this.publicGetPublicFuturesCandlesIndexPriceSymbol(this.extend(request, params));
        }
        else if (price === 'premiumIndex') {
            response = await this.publicGetPublicFuturesCandlesPremiumIndexSymbol(this.extend(request, params));
        }
        else {
            response = await this.publicGetPublicCandlesSymbol(this.extend(request, params));
        }
        //
        // Spot and Swap
        //
        //     [
        //         {
        //             "timestamp": "2021-10-25T07:38:00.000Z",
        //             "open": "4173.391",
        //             "close": "4170.923",
        //             "min": "4170.923",
        //             "max": "4173.986",
        //             "volume": "0.1879",
        //             "volume_quote": "784.2517846"
        //         }
        //     ]
        //
        // Mark, Index and Premium Index
        //
        //     [
        //         {
        //             "timestamp": "2022-04-01T01:28:00.000Z",
        //             "open": "45146.39",
        //             "close": "45219.43",
        //             "min": "45146.39",
        //             "max": "45219.43"
        //         },
        //     ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        // Spot and Swap
        //
        //     {
        //         "timestamp":"2015-08-20T19:01:00.000Z",
        //         "open":"0.006",
        //         "close":"0.006",
        //         "min":"0.006",
        //         "max":"0.006",
        //         "volume":"0.003",
        //         "volume_quote":"0.000018"
        //     }
        //
        // Mark, Index and Premium Index
        //
        //     {
        //         "timestamp": "2022-04-01T01:28:00.000Z",
        //         "open": "45146.39",
        //         "close": "45219.43",
        //         "min": "45146.39",
        //         "max": "45219.43"
        //     },
        //
        return [
            this.parse8601(this.safeString(ohlcv, 'timestamp')),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'max'),
            this.safeNumber(ohlcv, 'min'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'volume'),
        ];
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://api.hitbtc.com/#spot-orders-history
         * @see https://api.hitbtc.com/#futures-orders-history
         * @see https://api.hitbtc.com/#margin-orders-history
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for fetching margin orders
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = this.iso8601(since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchClosedOrders', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchClosedOrders', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginHistoryOrder(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateGetSpotHistoryOrder(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateGetFuturesHistoryOrder(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginHistoryOrder(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchClosedOrders() not support this market type');
            }
        }
        const parsed = this.parseOrders(response, market, since, limit);
        return this.filterByArray(parsed, 'status', ['closed', 'canceled'], false);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://api.hitbtc.com/#spot-orders-history
         * @see https://api.hitbtc.com/#futures-orders-history
         * @see https://api.hitbtc.com/#margin-orders-history
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for fetching a margin order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'client_order_id': id,
        };
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOrder', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrder', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginHistoryOrder(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateGetSpotHistoryOrder(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateGetFuturesHistoryOrder(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginHistoryOrder(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchOrder() not support this market type');
            }
        }
        //
        //     [
        //       {
        //         "id": "685965182082",
        //         "client_order_id": "B3CBm9uGg9oYQlw96bBSEt38-6gbgBO0",
        //         "symbol": "BTCUSDT",
        //         "side": "buy",
        //         "status": "new",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.00010",
        //         "quantity_cumulative": "0",
        //         "price": "50000.00",
        //         "price_average": "0",
        //         "created_at": "2021-10-26T11:40:09.287Z",
        //         "updated_at": "2021-10-26T11:40:09.287Z"
        //       }
        //     ]
        //
        const order = this.safeDict(response, 0);
        return this.parseOrder(order, market);
    }
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://api.hitbtc.com/#spot-trades-history
         * @see https://api.hitbtc.com/#futures-trades-history
         * @see https://api.hitbtc.com/#margin-trades-history
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for fetching margin trades
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'order_id': id, // exchange assigned order id as oppose to the client order id
        };
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOrderTrades', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchOrderTrades', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginHistoryTrade(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateGetSpotHistoryTrade(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateGetFuturesHistoryTrade(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginHistoryTrade(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchOrderTrades() not support this market type');
            }
        }
        //
        // Spot
        //
        //     [
        //       {
        //         "id": 1393448977,
        //         "order_id": 653496804534,
        //         "client_order_id": "065f6f0ff9d54547848454182263d7b4",
        //         "symbol": "DICEETH",
        //         "side": "buy",
        //         "quantity": "1.4",
        //         "price": "0.00261455",
        //         "fee": "0.000003294333",
        //         "timestamp": "2021-09-19T05:35:56.601Z",
        //         "taker": true
        //       }
        //     ]
        //
        // Swap and Margin
        //
        //     [
        //         {
        //             "id": 4718551,
        //             "order_id": 58730748700,
        //             "client_order_id": "dcbcd8549e3445ee922665946002ef67",
        //             "symbol": "BTCUSDT_PERP",
        //             "side": "buy",
        //             "quantity": "0.0001",
        //             "price": "41095.96",
        //             "fee": "0.002054798000",
        //             "timestamp": "2022-03-17T05:23:02.217Z",
        //             "taker": true,
        //             "position_id": 2350122,
        //             "pnl": "0",
        //             "liquidation": false
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://api.hitbtc.com/#get-all-active-spot-orders
         * @see https://api.hitbtc.com/#get-active-futures-orders
         * @see https://api.hitbtc.com/#get-active-margin-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for fetching open margin orders
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchOpenOrders', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginOrder(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateGetSpotOrder(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateGetFuturesOrder(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginOrder(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchOpenOrders() not support this market type');
            }
        }
        //
        //     [
        //       {
        //         "id": "488953123149",
        //         "client_order_id": "103ad305301e4c3590045b13de15b36e",
        //         "symbol": "BTCUSDT",
        //         "side": "buy",
        //         "status": "new",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.00001",
        //         "quantity_cumulative": "0",
        //         "price": "0.01",
        //         "post_only": false,
        //         "created_at": "2021-04-13T13:06:16.567Z",
        //         "updated_at": "2021-04-13T13:06:16.567Z"
        //       }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    async fetchOpenOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOpenOrder
         * @description fetch an open order by it's id
         * @see https://api.hitbtc.com/#get-active-spot-order
         * @see https://api.hitbtc.com/#get-active-futures-order
         * @see https://api.hitbtc.com/#get-active-margin-order
         * @param {string} id order id
         * @param {string} symbol unified market symbol, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for fetching an open margin order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const request = {
            'client_order_id': id,
        };
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchOpenOrder', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchOpenOrder', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginOrderClientOrderId(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateGetSpotOrderClientOrderId(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateGetFuturesOrderClientOrderId(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginOrderClientOrderId(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchOpenOrder() not support this market type');
            }
        }
        return this.parseOrder(response, market);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#cancelAllOrders
         * @description cancel all open orders
         * @see https://api.hitbtc.com/#cancel-all-spot-orders
         * @see https://api.hitbtc.com/#cancel-futures-orders
         * @see https://api.hitbtc.com/#cancel-all-margin-orders
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for canceling margin orders
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('cancelAllOrders', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateDeleteMarginOrder(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateDeleteSpotOrder(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateDeleteFuturesOrder(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateDeleteMarginOrder(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' cancelAllOrders() not support this market type');
            }
        }
        return this.parseOrders(response, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#cancelOrder
         * @description cancels an open order
         * @see https://api.hitbtc.com/#cancel-spot-order
         * @see https://api.hitbtc.com/#cancel-futures-order
         * @see https://api.hitbtc.com/#cancel-margin-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
         * @param {bool} [params.margin] true for canceling a margin order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {
            'client_order_id': id,
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('cancelOrder', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateDeleteMarginOrderClientOrderId(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privateDeleteSpotOrderClientOrderId(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privateDeleteFuturesOrderClientOrderId(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateDeleteMarginOrderClientOrderId(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' cancelOrder() not support this market type');
            }
        }
        return this.parseOrder(response, market);
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {
            'client_order_id': id,
            'quantity': this.amountToPrecision(symbol, amount),
        };
        if ((type === 'limit') || (type === 'stopLimit')) {
            if (price === undefined) {
                throw new errors.ExchangeError(this.id + ' editOrder() limit order requires price');
            }
            request['price'] = this.priceToPrecision(symbol, price);
        }
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('editOrder', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('editOrder', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privatePatchMarginOrderClientOrderId(this.extend(request, params));
        }
        else {
            if (marketType === 'spot') {
                response = await this.privatePatchSpotOrderClientOrderId(this.extend(request, params));
            }
            else if (marketType === 'swap') {
                response = await this.privatePatchFuturesOrderClientOrderId(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privatePatchMarginOrderClientOrderId(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' editOrder() not support this market type');
            }
        }
        return this.parseOrder(response, market);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#createOrder
         * @description create a trade order
         * @see https://api.hitbtc.com/#create-new-spot-order
         * @see https://api.hitbtc.com/#create-margin-order
         * @see https://api.hitbtc.com/#create-futures-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported for spot-margin, swap supports both, default is 'cross'
         * @param {bool} [params.margin] true for creating a margin order
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "Day", "GTD"
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = undefined;
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('createOrder', market, params);
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
        [request, params] = this.createOrderRequest(market, marketType, type, side, amount, price, marginMode, params);
        let response = undefined;
        if (marketType === 'swap') {
            response = await this.privatePostFuturesOrder(this.extend(request, params));
        }
        else if ((marketType === 'margin') || (marginMode !== undefined)) {
            response = await this.privatePostMarginOrder(this.extend(request, params));
        }
        else {
            response = await this.privatePostSpotOrder(this.extend(request, params));
        }
        return this.parseOrder(response, market);
    }
    createOrderRequest(market, marketType, type, side, amount, price = undefined, marginMode = undefined, params = {}) {
        const isLimit = (type === 'limit');
        const reduceOnly = this.safeValue(params, 'reduceOnly');
        const timeInForce = this.safeString(params, 'timeInForce');
        const triggerPrice = this.safeNumberN(params, ['triggerPrice', 'stopPrice', 'stop_price']);
        const isPostOnly = this.isPostOnly(type === 'market', undefined, params);
        const request = {
            'type': type,
            'side': side,
            'quantity': this.amountToPrecision(market['symbol'], amount),
            'symbol': market['id'],
            // 'client_order_id': 'r42gdPjNMZN-H_xs8RKl2wljg_dfgdg4', // Optional
            // 'time_in_force': 'GTC', // Optional GTC, IOC, FOK, Day, GTD
            // 'price': this.priceToPrecision (symbol, price), // Required if type is limit, stopLimit, or takeProfitLimit
            // 'stop_price': this.safeNumber (params, 'stop_price'), // Required if type is stopLimit, stopMarket, takeProfitLimit, takeProfitMarket
            // 'expire_time': '2021-06-15T17:01:05.092Z', // Required if timeInForce is GTD
            // 'strict_validate': false,
            // 'post_only': false, // Optional
            // 'reduce_only': false, // Optional
            // 'display_quantity': '0', // Optional
            // 'take_rate': 0.001, // Optional
            // 'make_rate': 0.001, // Optional
        };
        if (reduceOnly !== undefined) {
            if ((market['type'] !== 'swap') && (market['type'] !== 'margin')) {
                throw new errors.InvalidOrder(this.id + ' createOrder() does not support reduce_only for ' + market['type'] + ' orders, reduce_only orders are supported for swap and margin markets only');
            }
        }
        if (reduceOnly === true) {
            request['reduce_only'] = reduceOnly;
        }
        if (isPostOnly) {
            request['post_only'] = true;
        }
        if (timeInForce !== undefined) {
            request['time_in_force'] = timeInForce;
        }
        if (isLimit || (type === 'stopLimit') || (type === 'takeProfitLimit')) {
            if (price === undefined) {
                throw new errors.ExchangeError(this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision(market['symbol'], price);
        }
        if ((timeInForce === 'GTD')) {
            const expireTime = this.safeString(params, 'expire_time');
            if (expireTime === undefined) {
                throw new errors.ExchangeError(this.id + ' createOrder() requires an expire_time parameter for a GTD order');
            }
        }
        if (triggerPrice !== undefined) {
            request['stop_price'] = this.priceToPrecision(market['symbol'], triggerPrice);
            if (isLimit) {
                request['type'] = 'stopLimit';
            }
            else if (type === 'market') {
                request['type'] = 'stopMarket';
            }
        }
        else if ((type === 'stopLimit') || (type === 'stopMarket') || (type === 'takeProfitLimit') || (type === 'takeProfitMarket')) {
            throw new errors.ExchangeError(this.id + ' createOrder() requires a stopPrice parameter for stop-loss and take-profit orders');
        }
        params = this.omit(params, ['triggerPrice', 'timeInForce', 'stopPrice', 'stop_price', 'reduceOnly', 'postOnly']);
        if (marketType === 'swap') {
            // set default margin mode to cross
            if (marginMode === undefined) {
                marginMode = 'cross';
            }
            request['margin_mode'] = marginMode;
        }
        return [request, params];
    }
    parseOrderStatus(status) {
        const statuses = {
            'new': 'open',
            'suspended': 'open',
            'partiallyFilled': 'open',
            'filled': 'closed',
            'canceled': 'canceled',
            'expired': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrder(order, market = undefined) {
        //
        // limit
        //     {
        //       "id": 488953123149,
        //       "client_order_id": "103ad305301e4c3590045b13de15b36e",
        //       "symbol": "BTCUSDT",
        //       "side": "buy",
        //       "status": "new",
        //       "type": "limit",
        //       "time_in_force": "GTC",
        //       "quantity": "0.00001",
        //       "quantity_cumulative": "0",
        //       "price": "0.01",
        //       "price_average": "0.01",
        //       "post_only": false,
        //       "created_at": "2021-04-13T13:06:16.567Z",
        //       "updated_at": "2021-04-13T13:06:16.567Z"
        //     }
        //
        // market
        //     {
        //       "id": "685877626834",
        //       "client_order_id": "Yshl7G-EjaREyXQYaGbsmdtVbW-nzQwu",
        //       "symbol": "BTCUSDT",
        //       "side": "buy",
        //       "status": "filled",
        //       "type": "market",
        //       "time_in_force": "GTC",
        //       "quantity": "0.00010",
        //       "quantity_cumulative": "0.00010",
        //       "post_only": false,
        //       "created_at": "2021-10-26T08:55:55.1Z",
        //       "updated_at": "2021-10-26T08:55:55.1Z",
        //       "trades": [
        //         {
        //           "id": "1437229630",
        //           "position_id": "0",
        //           "quantity": "0.00010",
        //           "price": "62884.78",
        //           "fee": "0.005659630200",
        //           "timestamp": "2021-10-26T08:55:55.1Z",
        //           "taker": true
        //         }
        //       ]
        //     }
        //
        // swap and margin
        //
        //     {
        //         "id": 58418961892,
        //         "client_order_id": "r42gdPjNMZN-H_xs8RKl2wljg_dfgdg4",
        //         "symbol": "BTCUSDT_PERP",
        //         "side": "buy",
        //         "status": "new",
        //         "type": "limit",
        //         "time_in_force": "GTC",
        //         "quantity": "0.0005",
        //         "quantity_cumulative": "0",
        //         "price": "30000.00",
        //         "post_only": false,
        //         "reduce_only": false,
        //         "created_at": "2022-03-16T08:16:53.039Z",
        //         "updated_at": "2022-03-16T08:16:53.039Z"
        //     }
        //
        const id = this.safeString(order, 'client_order_id');
        // we use clientOrderId as the order id with this exchange intentionally
        // because most of their endpoints will require clientOrderId
        // explained here: https://github.com/ccxt/ccxt/issues/5674
        const side = this.safeString(order, 'side');
        const type = this.safeString(order, 'type');
        const amount = this.safeString(order, 'quantity');
        const price = this.safeString(order, 'price');
        const average = this.safeString(order, 'price_average');
        const created = this.safeString(order, 'created_at');
        const timestamp = this.parse8601(created);
        const updated = this.safeString(order, 'updated_at');
        let lastTradeTimestamp = undefined;
        if (updated !== created) {
            lastTradeTimestamp = this.parse8601(updated);
        }
        const filled = this.safeString(order, 'quantity_cumulative');
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const postOnly = this.safeValue(order, 'post_only');
        const timeInForce = this.safeString(order, 'time_in_force');
        const rawTrades = this.safeValue(order, 'trades');
        const stopPrice = this.safeString(order, 'stop_price');
        return this.safeOrder({
            'info': order,
            'id': id,
            'clientOrderId': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'price': price,
            'amount': amount,
            'type': type,
            'side': side,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeValue(order, 'reduce_only'),
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'status': status,
            'average': average,
            'trades': rawTrades,
            'fee': undefined,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
        }, market);
    }
    async fetchMarginModes(symbols = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchMarginMode
         * @description fetches margin mode of the user
         * @see https://api.hitbtc.com/#get-margin-position-parameters
         * @see https://api.hitbtc.com/#get-futures-position-parameters
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            market = this.market(symbols[0]);
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchMarginMode', market, params);
        let response = undefined;
        if (marketType === 'margin') {
            response = await this.privateGetMarginConfig(params);
            //
            //     {
            //         "config": [{
            //             "symbol": "BTCUSD",
            //             "margin_call_leverage_mul": "1.50",
            //             "liquidation_leverage_mul": "2.00",
            //             "max_initial_leverage": "10.00",
            //             "margin_mode": "Isolated",
            //             "force_close_fee": "0.05",
            //             "enabled": true,
            //             "active": true,
            //             "limit_base": "50000.00",
            //             "limit_power": "2.2",
            //             "unlimited_threshold": "10.0"
            //         }]
            //     }
            //
        }
        else if (marketType === 'swap') {
            response = await this.privateGetFuturesConfig(params);
            //
            //     {
            //         "config": [{
            //             "symbol": "BTCUSD_PERP",
            //             "margin_call_leverage_mul": "1.20",
            //             "liquidation_leverage_mul": "2.00",
            //             "max_initial_leverage": "100.00",
            //             "margin_mode": "Isolated",
            //             "force_close_fee": "0.001",
            //             "enabled": true,
            //             "active": false,
            //             "limit_base": "5000000.000000000000",
            //             "limit_power": "1.25",
            //             "unlimited_threshold": "2.00"
            //         }]
            //     }
            //
        }
        else {
            throw new errors.BadSymbol(this.id + ' fetchMarginModes () supports swap contracts and margin only');
        }
        const config = this.safeList(response, 'config', []);
        return this.parseMarginModes(config, symbols, 'symbol');
    }
    parseMarginMode(marginMode, market = undefined) {
        const marketId = this.safeString(marginMode, 'symbol');
        return {
            'info': marginMode,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': this.safeStringLower(marginMode, 'margin_mode'),
        };
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name hitbtc#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://api.hitbtc.com/#transfer-between-wallet-and-exchange
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        // account can be "spot", "wallet", or "derivatives"
        await this.loadMarkets();
        const currency = this.currency(code);
        const requestAmount = this.currencyToPrecision(code, amount);
        const accountsByType = this.safeValue(this.options, 'accountsByType', {});
        fromAccount = fromAccount.toLowerCase();
        toAccount = toAccount.toLowerCase();
        const fromId = this.safeString(accountsByType, fromAccount, fromAccount);
        const toId = this.safeString(accountsByType, toAccount, toAccount);
        if (fromId === toId) {
            throw new errors.BadRequest(this.id + ' transfer() fromAccount and toAccount arguments cannot be the same account');
        }
        const request = {
            'currency': currency['id'],
            'amount': requestAmount,
            'source': fromId,
            'destination': toId,
        };
        const response = await this.privatePostWalletTransfer(this.extend(request, params));
        //
        //     [
        //         "2db6ebab-fb26-4537-9ef8-1a689472d236"
        //     ]
        //
        return this.parseTransfer(response, currency);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // transfer
        //
        //     [
        //         "2db6ebab-fb26-4537-9ef8-1a689472d236"
        //     ]
        //
        return {
            'id': this.safeString(transfer, 0),
            'timestamp': undefined,
            'datetime': undefined,
            'currency': this.safeCurrencyCode(undefined, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
            'info': transfer,
        };
    }
    async convertCurrencyNetwork(code, amount, fromNetwork, toNetwork, params) {
        await this.loadMarkets();
        if (code !== 'USDT') {
            throw new errors.ExchangeError(this.id + ' convertCurrencyNetwork() only supports USDT currently');
        }
        const networks = this.safeValue(this.options, 'networks', {});
        fromNetwork = fromNetwork.toUpperCase();
        toNetwork = toNetwork.toUpperCase();
        fromNetwork = this.safeString(networks, fromNetwork); // handle ETH>ERC20 alias
        toNetwork = this.safeString(networks, toNetwork); // handle ETH>ERC20 alias
        if (fromNetwork === toNetwork) {
            throw new errors.BadRequest(this.id + ' convertCurrencyNetwork() fromNetwork cannot be the same as toNetwork');
        }
        if ((fromNetwork === undefined) || (toNetwork === undefined)) {
            const keys = Object.keys(networks);
            throw new errors.ArgumentsRequired(this.id + ' convertCurrencyNetwork() requires a fromNetwork parameter and a toNetwork parameter, supported networks are ' + keys.join(', '));
        }
        const request = {
            'from_currency': fromNetwork,
            'to_currency': toNetwork,
            'amount': this.currencyToPrecision(code, amount),
        };
        const response = await this.privatePostWalletConvert(this.extend(request, params));
        // {"result":["587a1868-e62d-4d8e-b27c-dbdb2ee96149","e168df74-c041-41f2-b76c-e43e4fed5bc7"]}
        return {
            'info': response,
        };
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#withdraw
         * @description make a withdrawal
         * @see https://api.hitbtc.com/#withdraw-crypto
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        this.checkAddress(address);
        const currency = this.currency(code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const networks = this.safeValue(this.options, 'networks', {});
        const network = this.safeStringUpper(params, 'network');
        if ((network !== undefined) && (code === 'USDT')) {
            const parsedNetwork = this.safeString(networks, network);
            if (parsedNetwork !== undefined) {
                request['network_code'] = parsedNetwork;
            }
            params = this.omit(params, 'network');
        }
        const withdrawOptions = this.safeValue(this.options, 'withdraw', {});
        const includeFee = this.safeBool(withdrawOptions, 'includeFee', false);
        if (includeFee) {
            request['include_fee'] = true;
        }
        const response = await this.privatePostWalletCryptoWithdraw(this.extend(request, params));
        //
        //     {
        //         "id":"084cfcd5-06b9-4826-882e-fdb75ec3625d"
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    async fetchFundingRates(symbols = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchFundingRates
         * @description fetches funding rates for multiple markets
         * @see https://api.hitbtc.com/#futures-info
         * @param {string[]} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
            market = this.market(symbols[0]);
            const queryMarketIds = this.marketIds(symbols);
            request['symbols'] = queryMarketIds.join(',');
        }
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchFundingRates', market, params);
        if (type !== 'swap') {
            throw new errors.NotSupported(this.id + ' fetchFundingRates() does not support ' + type + ' markets');
        }
        const response = await this.publicGetPublicFuturesInfo(this.extend(request, params));
        //
        //     {
        //         "BTCUSDT_PERP": {
        //             "contract_type": "perpetual",
        //             "mark_price": "30897.68",
        //             "index_price": "30895.29",
        //             "funding_rate": "0.0001",
        //             "open_interest": "93.7128",
        //             "next_funding_time": "2021-07-21T16:00:00.000Z",
        //             "indicative_funding_rate": "0.0001",
        //             "premium_index": "0.000047541807127312",
        //             "avg_premium_index": "0.000087063368020112",
        //             "interest_rate": "0.0001",
        //             "timestamp": "2021-07-21T09:48:37.235Z"
        //         }
        //     }
        //
        const marketIds = Object.keys(response);
        const fundingRates = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = this.safeString(marketIds, i);
            const rawFundingRate = this.safeValue(response, marketId);
            const marketInner = this.market(marketId);
            const symbol = marketInner['symbol'];
            const fundingRate = this.parseFundingRate(rawFundingRate, marketInner);
            fundingRates[symbol] = fundingRate;
        }
        return this.filterByArray(fundingRates, 'symbol', symbols);
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchFundingRateHistory
         * @see https://api.hitbtc.com/#funding-history
         * @description fetches historical funding rate prices
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        await this.loadMarkets();
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchFundingRateHistory', symbol, since, limit, '8h', params, 1000);
        }
        let market = undefined;
        let request = {
        // all arguments are optional
        // 'symbols': Comma separated list of symbol codes,
        // 'sort': 'DESC' or 'ASC'
        // 'from': 'Datetime or Number',
        // 'until': 'Datetime or Number',
        // 'limit': 100,
        // 'offset': 0,
        };
        [request, params] = this.handleUntilOption('until', request, params);
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
            request['symbols'] = market['id'];
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPublicFuturesHistoryFunding(this.extend(request, params));
        //
        //    {
        //        "BTCUSDT_PERP": [
        //            {
        //                "timestamp": "2021-07-29T16:00:00.271Z",
        //                "funding_rate": "0.0001",
        //                "avg_premium_index": "0.000061858585213222",
        //                "next_funding_time": "2021-07-30T00:00:00.000Z",
        //                "interest_rate": "0.0001"
        //            },
        //            ...
        //        ],
        //        ...
        //    }
        //
        const contracts = Object.keys(response);
        const rates = [];
        for (let i = 0; i < contracts.length; i++) {
            const marketId = contracts[i];
            const marketInner = this.safeMarket(marketId);
            const fundingRateData = response[marketId];
            for (let j = 0; j < fundingRateData.length; j++) {
                const entry = fundingRateData[j];
                const symbolInner = this.safeSymbol(marketInner['symbol']);
                const fundingRate = this.safeNumber(entry, 'funding_rate');
                const datetime = this.safeString(entry, 'timestamp');
                rates.push({
                    'info': entry,
                    'symbol': symbolInner,
                    'fundingRate': fundingRate,
                    'timestamp': this.parse8601(datetime),
                    'datetime': datetime,
                });
            }
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchPositions
         * @description fetch all open positions
         * @see https://api.hitbtc.com/#get-futures-margin-accounts
         * @see https://api.hitbtc.com/#get-all-margin-accounts
         * @param {string[]|undefined} symbols not used by hitbtc fetchPositions ()
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
         * @param {bool} [params.margin] true for fetching spot-margin positions
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const request = {};
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchPositions', undefined, params);
        if (marketType === 'spot') {
            marketType = 'swap';
        }
        [marginMode, params] = this.handleMarginModeAndParams('fetchPositions', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginAccount(this.extend(request, params));
        }
        else {
            if (marketType === 'swap') {
                response = await this.privateGetFuturesAccount(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginAccount(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchPositions() not support this market type');
            }
        }
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT_PERP",
        //             "type": "isolated",
        //             "leverage": "10.00",
        //             "created_at": "2022-03-19T07:54:35.24Z",
        //             "updated_at": "2022-03-19T07:54:58.922Z",
        //             currencies": [
        //                 {
        //                     "code": "USDT",
        //                     "margin_balance": "7.478100643043",
        //                     "reserved_orders": "0",
        //                     "reserved_positions": "0.303530761300"
        //                 }
        //             ],
        //             "positions": [
        //                 {
        //                     "id": 2470568,
        //                     "symbol": "ETHUSDT_PERP",
        //                     "quantity": "0.001",
        //                     "price_entry": "2927.509",
        //                     "price_margin_call": "0",
        //                     "price_liquidation": "0",
        //                     "pnl": "0",
        //                     "created_at": "2022-03-19T07:54:35.24Z",
        //                     "updated_at": "2022-03-19T07:54:58.922Z"
        //                 }
        //             ]
        //         },
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push(this.parsePosition(response[i]));
        }
        return result;
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchPosition
         * @description fetch data on a single open contract trade position
         * @see https://api.hitbtc.com/#get-futures-margin-account
         * @see https://api.hitbtc.com/#get-isolated-margin-account
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
         * @param {bool} [params.margin] true for fetching a spot-margin position
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchPosition', undefined, params);
        [marginMode, params] = this.handleMarginModeAndParams('fetchPosition', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginAccountIsolatedSymbol(this.extend(request, params));
        }
        else {
            if (marketType === 'swap') {
                response = await this.privateGetFuturesAccountIsolatedSymbol(this.extend(request, params));
            }
            else if (marketType === 'margin') {
                response = await this.privateGetMarginAccountIsolatedSymbol(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchPosition() not support this market type');
            }
        }
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT_PERP",
        //             "type": "isolated",
        //             "leverage": "10.00",
        //             "created_at": "2022-03-19T07:54:35.24Z",
        //             "updated_at": "2022-03-19T07:54:58.922Z",
        //             currencies": [
        //                 {
        //                     "code": "USDT",
        //                     "margin_balance": "7.478100643043",
        //                     "reserved_orders": "0",
        //                     "reserved_positions": "0.303530761300"
        //                 }
        //             ],
        //             "positions": [
        //                 {
        //                     "id": 2470568,
        //                     "symbol": "ETHUSDT_PERP",
        //                     "quantity": "0.001",
        //                     "price_entry": "2927.509",
        //                     "price_margin_call": "0",
        //                     "price_liquidation": "0",
        //                     "pnl": "0",
        //                     "created_at": "2022-03-19T07:54:35.24Z",
        //                     "updated_at": "2022-03-19T07:54:58.922Z"
        //                 }
        //             ]
        //         },
        //     ]
        //
        return this.parsePosition(response, market);
    }
    parsePosition(position, market = undefined) {
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT_PERP",
        //             "type": "isolated",
        //             "leverage": "10.00",
        //             "created_at": "2022-03-19T07:54:35.24Z",
        //             "updated_at": "2022-03-19T07:54:58.922Z",
        //             currencies": [
        //                 {
        //                     "code": "USDT",
        //                     "margin_balance": "7.478100643043",
        //                     "reserved_orders": "0",
        //                     "reserved_positions": "0.303530761300"
        //                 }
        //             ],
        //             "positions": [
        //                 {
        //                     "id": 2470568,
        //                     "symbol": "ETHUSDT_PERP",
        //                     "quantity": "0.001",
        //                     "price_entry": "2927.509",
        //                     "price_margin_call": "0",
        //                     "price_liquidation": "0",
        //                     "pnl": "0",
        //                     "created_at": "2022-03-19T07:54:35.24Z",
        //                     "updated_at": "2022-03-19T07:54:58.922Z"
        //                 }
        //             ]
        //         },
        //     ]
        //
        const marginMode = this.safeString(position, 'type');
        const leverage = this.safeNumber(position, 'leverage');
        const datetime = this.safeString(position, 'updated_at');
        const positions = this.safeValue(position, 'positions', []);
        let liquidationPrice = undefined;
        let entryPrice = undefined;
        let contracts = undefined;
        for (let i = 0; i < positions.length; i++) {
            const entry = positions[i];
            liquidationPrice = this.safeNumber(entry, 'price_liquidation');
            entryPrice = this.safeNumber(entry, 'price_entry');
            contracts = this.safeNumber(entry, 'quantity');
        }
        const currencies = this.safeValue(position, 'currencies', []);
        let collateral = undefined;
        for (let i = 0; i < currencies.length; i++) {
            const entry = currencies[i];
            collateral = this.safeNumber(entry, 'margin_balance');
        }
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'notional': undefined,
            'marginMode': marginMode,
            'marginType': marginMode,
            'liquidationPrice': liquidationPrice,
            'entryPrice': entryPrice,
            'unrealizedPnl': undefined,
            'percentage': undefined,
            'contracts': contracts,
            'contractSize': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'side': undefined,
            'hedged': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': collateral,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    parseOpenInterest(interest, market = undefined) {
        //
        //     {
        //         "contract_type": "perpetual",
        //         "mark_price": "42307.43",
        //         "index_price": "42303.27",
        //         "funding_rate": "0.0001",
        //         "open_interest": "30.9826",
        //         "next_funding_time": "2022-03-22T16:00:00.000Z",
        //         "indicative_funding_rate": "0.0001",
        //         "premium_index": "0",
        //         "avg_premium_index": "0.000029587712038098",
        //         "interest_rate": "0.0001",
        //         "timestamp": "2022-03-22T08:08:26.687Z"
        //     }
        //
        const datetime = this.safeString(interest, 'timestamp');
        const value = this.safeNumber(interest, 'open_interest');
        return this.safeOpenInterest({
            'symbol': market['symbol'],
            'openInterestAmount': undefined,
            'openInterestValue': value,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'info': interest,
        }, market);
    }
    async fetchOpenInterest(symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchOpenInterest
         * @description Retrieves the open interest of a derivative trading pair
         * @see https://api.hitbtc.com/#futures-info
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchOpenInterest() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicFuturesInfoSymbol(this.extend(request, params));
        //
        //     {
        //         "contract_type": "perpetual",
        //         "mark_price": "42307.43",
        //         "index_price": "42303.27",
        //         "funding_rate": "0.0001",
        //         "open_interest": "30.9826",
        //         "next_funding_time": "2022-03-22T16:00:00.000Z",
        //         "indicative_funding_rate": "0.0001",
        //         "premium_index": "0",
        //         "avg_premium_index": "0.000029587712038098",
        //         "interest_rate": "0.0001",
        //         "timestamp": "2022-03-22T08:08:26.687Z"
        //     }
        //
        return this.parseOpenInterest(response, market);
    }
    async fetchFundingRate(symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://api.hitbtc.com/#futures-info
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['swap']) {
            throw new errors.BadSymbol(this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetPublicFuturesInfoSymbol(this.extend(request, params));
        //
        //     {
        //         "contract_type": "perpetual",
        //         "mark_price": "42307.43",
        //         "index_price": "42303.27",
        //         "funding_rate": "0.0001",
        //         "open_interest": "30.9826",
        //         "next_funding_time": "2022-03-22T16:00:00.000Z",
        //         "indicative_funding_rate": "0.0001",
        //         "premium_index": "0",
        //         "avg_premium_index": "0.000029587712038098",
        //         "interest_rate": "0.0001",
        //         "timestamp": "2022-03-22T08:08:26.687Z"
        //     }
        //
        return this.parseFundingRate(response, market);
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "contract_type": "perpetual",
        //         "mark_price": "42307.43",
        //         "index_price": "42303.27",
        //         "funding_rate": "0.0001",
        //         "open_interest": "30.9826",
        //         "next_funding_time": "2022-03-22T16:00:00.000Z",
        //         "indicative_funding_rate": "0.0001",
        //         "premium_index": "0",
        //         "avg_premium_index": "0.000029587712038098",
        //         "interest_rate": "0.0001",
        //         "timestamp": "2022-03-22T08:08:26.687Z"
        //     }
        //
        const fundingDateTime = this.safeString(contract, 'next_funding_time');
        const datetime = this.safeString(contract, 'timestamp');
        return {
            'info': contract,
            'symbol': this.safeSymbol(undefined, market),
            'markPrice': this.safeNumber(contract, 'mark_price'),
            'indexPrice': this.safeNumber(contract, 'index_price'),
            'interestRate': this.safeNumber(contract, 'interest_rate'),
            'estimatedSettlePrice': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
            'fundingRate': this.safeNumber(contract, 'funding_rate'),
            'fundingTimestamp': this.parse8601(fundingDateTime),
            'fundingDatetime': fundingDateTime,
            'nextFundingRate': this.safeNumber(contract, 'indicative_funding_rate'),
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const leverage = this.safeString(params, 'leverage');
        if (market['swap']) {
            if (leverage === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' modifyMarginHelper() requires a leverage parameter for swap markets');
            }
        }
        const stringAmount = this.numberToString(amount);
        if (stringAmount !== '0') {
            amount = this.amountToPrecision(symbol, stringAmount);
        }
        else {
            amount = '0';
        }
        const request = {
            'symbol': market['id'],
            'margin_balance': amount, // swap and margin
            // "leverage": "10", // swap only required
            // "strict_validate": false, // swap and margin
        };
        if (leverage !== undefined) {
            request['leverage'] = leverage;
        }
        let marketType = undefined;
        let marginMode = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('modifyMarginHelper', market, params);
        [marginMode, params] = this.handleMarginModeAndParams('modifyMarginHelper', params);
        let response = undefined;
        if (marketType === 'swap') {
            response = await this.privatePutFuturesAccountIsolatedSymbol(this.extend(request, params));
        }
        else if ((marketType === 'margin') || (marketType === 'spot') || (marginMode === 'isolated')) {
            response = await this.privatePutMarginAccountIsolatedSymbol(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' modifyMarginHelper() not support this market type');
        }
        //
        //     {
        //         "symbol": "BTCUSDT_PERP",
        //         "type": "isolated",
        //         "leverage": "8.00",
        //         "created_at": "2022-03-30T23:34:27.161Z",
        //         "updated_at": "2022-03-30T23:34:27.161Z",
        //         "currencies": [
        //             {
        //                 "code": "USDT",
        //                 "margin_balance": "7.000000000000",
        //                 "reserved_orders": "0",
        //                 "reserved_positions": "0"
        //             }
        //         ],
        //         "positions": null
        //     }
        //
        return this.extend(this.parseMarginModification(response, market), {
            'amount': this.parseNumber(amount),
            'type': type,
        });
    }
    parseMarginModification(data, market = undefined) {
        //
        // addMargin/reduceMargin
        //
        //     {
        //         "symbol": "BTCUSDT_PERP",
        //         "type": "isolated",
        //         "leverage": "8.00",
        //         "created_at": "2022-03-30T23:34:27.161Z",
        //         "updated_at": "2022-03-30T23:34:27.161Z",
        //         "currencies": [
        //             {
        //                 "code": "USDT",
        //                 "margin_balance": "7.000000000000",
        //                 "reserved_orders": "0",
        //                 "reserved_positions": "0"
        //             }
        //         ],
        //         "positions": null
        //     }
        //
        const currencies = this.safeValue(data, 'currencies', []);
        const currencyInfo = this.safeValue(currencies, 0);
        const datetime = this.safeString(data, 'updated_at');
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': undefined,
            'marginMode': 'isolated',
            'amount': undefined,
            'total': undefined,
            'code': this.safeString(currencyInfo, 'code'),
            'status': undefined,
            'timestamp': this.parse8601(datetime),
            'datetime': datetime,
        };
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name hitbtc#reduceMargin
         * @description remove margin from a position
         * @see https://api.hitbtc.com/#create-update-margin-account-2
         * @see https://api.hitbtc.com/#create-update-margin-account
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
         * @param {bool} [params.margin] true for reducing spot-margin
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        if (this.numberToString(amount) !== '0') {
            throw new errors.BadRequest(this.id + ' reduceMargin() on hitbtc requires the amount to be 0 and that will remove the entire margin amount');
        }
        return await this.modifyMarginHelper(symbol, amount, 'reduce', params);
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name hitbtc#addMargin
         * @description add margin
         * @see https://api.hitbtc.com/#create-update-margin-account-2
         * @see https://api.hitbtc.com/#create-update-margin-account
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
         * @param {bool} [params.margin] true for adding spot-margin
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    async fetchLeverage(symbol, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://api.hitbtc.com/#get-futures-margin-account
         * @see https://api.hitbtc.com/#get-isolated-margin-account
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
         * @param {bool} [params.margin] true for fetching spot-margin leverage
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('fetchLeverage', params);
        params = this.omit(params, ['marginMode', 'margin']);
        let response = undefined;
        if (marginMode !== undefined) {
            response = await this.privateGetMarginAccountIsolatedSymbol(this.extend(request, params));
        }
        else {
            if (market['type'] === 'spot') {
                response = await this.privateGetMarginAccountIsolatedSymbol(this.extend(request, params));
            }
            else if (market['type'] === 'swap') {
                response = await this.privateGetFuturesAccountIsolatedSymbol(this.extend(request, params));
            }
            else if (market['type'] === 'margin') {
                response = await this.privateGetMarginAccountIsolatedSymbol(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchLeverage() not support this market type');
            }
        }
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "type": "isolated",
        //         "leverage": "12.00",
        //         "created_at": "2022-03-29T22:31:29.067Z",
        //         "updated_at": "2022-03-30T00:00:00.125Z",
        //         "currencies": [
        //             {
        //                 "code": "USDT",
        //                 "margin_balance": "20.824360374174",
        //                 "reserved_orders": "0",
        //                 "reserved_positions": "0.973330435000"
        //             }
        //         ],
        //         "positions": [
        //             {
        //                 "id": 631301,
        //                 "symbol": "BTCUSDT",
        //                 "quantity": "0.00022",
        //                 "price_entry": "47425.57",
        //                 "price_margin_call": "",
        //                 "price_liquidation": "0",
        //                 "pnl": "0",
        //                 "created_at": "2022-03-29T22:31:29.067Z",
        //                 "updated_at": "2022-03-30T00:00:00.125Z"
        //             }
        //         ]
        //     }
        //
        return this.parseLeverage(response, market);
    }
    parseLeverage(leverage, market = undefined) {
        const marketId = this.safeString(leverage, 'symbol');
        const leverageValue = this.safeInteger(leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': this.safeSymbol(marketId, market),
            'marginMode': this.safeStringLower(leverage, 'type'),
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        };
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#setLeverage
         * @description set the level of leverage for a market
         * @see https://api.hitbtc.com/#create-update-margin-account-2
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        if (params['margin_balance'] === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a margin_balance parameter that will transfer margin to the specified trading pair');
        }
        const market = this.market(symbol);
        const amount = this.safeNumber(params, 'margin_balance');
        const maxLeverage = this.safeInteger(market['limits']['leverage'], 'max', 50);
        if (market['type'] !== 'swap') {
            throw new errors.BadSymbol(this.id + ' setLeverage() supports swap contracts only');
        }
        if ((leverage < 1) || (leverage > maxLeverage)) {
            throw new errors.BadRequest(this.id + ' setLeverage() leverage should be between 1 and ' + maxLeverage.toString() + ' for ' + symbol);
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage.toString(),
            'margin_balance': this.amountToPrecision(symbol, amount),
            // 'strict_validate': false,
        };
        return await this.privatePutFuturesAccountIsolatedSymbol(this.extend(request, params));
    }
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://api.hitbtc.com/#currencies
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets();
        const response = await this.publicGetPublicCurrency(params);
        //
        //     {
        //       "WEALTH": {
        //         "full_name": "ConnectWealth",
        //         "payin_enabled": false,
        //         "payout_enabled": false,
        //         "transfer_enabled": true,
        //         "precision_transfer": "0.001",
        //         "networks": [
        //           {
        //             "network": "ETH",
        //             "protocol": "ERC20",
        //             "default": true,
        //             "payin_enabled": false,
        //             "payout_enabled": false,
        //             "precision_payout": "0.001",
        //             "payout_fee": "0.016800000000",
        //             "payout_is_payment_id": false,
        //             "payin_payment_id": false,
        //             "payin_confirmations": "2"
        //           }
        //         ]
        //       }
        //     }
        //
        return this.parseDepositWithdrawFees(response, codes);
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //         "full_name": "ConnectWealth",
        //         "payin_enabled": false,
        //         "payout_enabled": false,
        //         "transfer_enabled": true,
        //         "precision_transfer": "0.001",
        //         "networks": [
        //           {
        //             "network": "ETH",
        //             "protocol": "ERC20",
        //             "default": true,
        //             "payin_enabled": false,
        //             "payout_enabled": false,
        //             "precision_payout": "0.001",
        //             "payout_fee": "0.016800000000",
        //             "payout_is_payment_id": false,
        //             "payin_payment_id": false,
        //             "payin_confirmations": "2"
        //           }
        //         ]
        //    }
        //
        const networks = this.safeValue(fee, 'networks', []);
        const result = this.depositWithdrawFee(fee);
        for (let j = 0; j < networks.length; j++) {
            const networkEntry = networks[j];
            const networkId = this.safeString(networkEntry, 'network');
            const networkCode = this.networkIdToCode(networkId);
            const withdrawFee = this.safeNumber(networkEntry, 'payout_fee');
            const isDefault = this.safeValue(networkEntry, 'default');
            const withdrawResult = {
                'fee': withdrawFee,
                'percentage': (withdrawFee !== undefined) ? false : undefined,
            };
            if (isDefault === true) {
                result['withdraw'] = withdrawResult;
            }
            result['networks'][networkCode] = {
                'withdraw': withdrawResult,
                'deposit': {
                    'fee': undefined,
                    'percentage': undefined,
                },
            };
        }
        return result;
    }
    async closePosition(symbol, side = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc#closePosition
         * @description closes open positions for a market
         * @see https://api.hitbtc.com/#close-all-futures-margin-positions
         * @param {object} [params] extra parameters specific to the okx api endpoint
         * @param {string} [params.symbol] *required* unified market symbol
         * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross'
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        let marginMode = undefined;
        [marginMode, params] = this.handleMarginModeAndParams('closePosition', params, 'cross');
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
            'margin_mode': marginMode,
        };
        const response = await this.privateDeleteFuturesPositionMarginModeSymbol(this.extend(request, params));
        //
        // {
        //     "id":"202471640",
        //     "symbol":"TRXUSDT_PERP",
        //     "margin_mode":"Cross",
        //     "leverage":"1.00",
        //     "quantity":"0",
        //     "price_entry":"0",
        //     "price_margin_call":"0",
        //     "price_liquidation":"0",
        //     "pnl":"0.001234100000",
        //     "created_at":"2023-10-29T14:46:13.235Z",
        //     "updated_at":"2023-12-19T09:34:40.014Z"
        // }
        //
        return this.parseOrder(response, market);
    }
    handleMarginModeAndParams(methodName, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} [params] extra parameters specific to the exchange API endpoint
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
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        //     {
        //       "error": {
        //         "code": 20001,
        //         "message": "Insufficient funds",
        //         "description": "Check that the funds are sufficient, given commissions"
        //       }
        //     }
        //
        //     {
        //       "error": {
        //         "code": "600",
        //         "message": "Action not allowed"
        //       }
        //     }
        //
        const error = this.safeValue(response, 'error');
        const errorCode = this.safeString(error, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString2(error, 'message', 'description');
            this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        const implodedPath = this.implodeParams(path, params);
        let url = this.urls['api'][api] + '/' + implodedPath;
        let getRequest = undefined;
        const keys = Object.keys(query);
        const queryLength = keys.length;
        headers = {
            'Content-Type': 'application/json',
        };
        if (method === 'GET') {
            if (queryLength) {
                getRequest = '?' + this.urlencode(query);
                url = url + getRequest;
            }
        }
        else {
            body = this.json(params);
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.nonce().toString();
            const payload = [method, '/api/3/' + implodedPath];
            if (method === 'GET') {
                if (getRequest !== undefined) {
                    payload.push(getRequest);
                }
            }
            else {
                payload.push(body);
            }
            payload.push(timestamp);
            const payloadString = payload.join('');
            const signature = this.hmac(this.encode(payloadString), this.encode(this.secret), sha256.sha256, 'hex');
            const secondPayload = this.apiKey + ':' + signature + ':' + timestamp;
            const encoded = this.stringToBase64(secondPayload);
            headers['Authorization'] = 'HS256 ' + encoded;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = hitbtc;
