
//  ---------------------------------------------------------------------------

import { Exchange } from './base/Exchange.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { AuthenticationError, ExchangeError, InvalidOrder, NotSupported } from './base/errors.js';

//  ---------------------------------------------------------------------------

export default class xt extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'xt',
            'name': 'XT',
            'countries': [ 'SC' ], // Seychelles
            // 10 requests per second => 1000ms / 10 = 100 (All other)
            // 3 requests per second => 1000ms / 3 = 333.333 (get assets -> fetchMarkets & fetchCurrencies)
            // 1000 times per minute for each single IP -> Otherwise account locked for 10min
            'rateLimit': 100, // TODO: Is rate limit right? https://doc.xt.com/#documentationlimitRules and https://doc.xt.com/#futures_documentationlimitRules
            'version': 'v4',
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': undefined,
                'swap': true,
                'future': true,
                'option': false,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
            },
            'precisionMode': DECIMAL_PLACES,
            'urls': {
                'logo': '', // TODO: Add logo
                'api': {
                    'spot': 'https://sapi.xt.com',
                    'linear': 'https://fapi.xt.com',
                    'inverse': 'https://dapi.xt.com',
                },
                'www': 'https://xt.com',
                'referral': '', // TODO: Add referral
                'doc': [
                    'https://doc.xt.com/',
                    'https://github.com/xtpub/api-doc',
                ],
                'fees': [
                ],
            },
            'api': {
                'public': {
                    'spot': {
                        'get': {
                            'balance': 1,
                            'balances': 1,
                            'currencies': 1,
                            'depth': 2,
                            'kline': 1,
                            'symbol': 1, // 0.1 for multiple symbols
                            'ticker': 1, // 0.1 for multiple symbols
                            'ticker/book': 1, // 0.1 for multiple symbols
                            'ticker/price': 1, // 0.1 for multiple symbols
                            'ticker/24h': 1, // 0.1 for multiple symbols
                            'time': 1,
                            'trade/history': 1,
                            'trade/recent': 1,
                            'wallet/support/currency': 1,
                        },
                    },
                    'linear': {
                        'get': {
                            'future/market/v1/public/contract/risk-balance': 1,
                            'future/market/v1/public/contract/open-interest': 1,
                            'future/market/v1/public/leverage/bracket/detail': 1,
                            'future/market/v1/public/leverage/bracket/list': 1,
                            'future/market/v1/public/q/agg-ticker': 1,
                            'future/market/v1/public/q/agg-tickers': 1,
                            'future/market/v1/public/q/deal': 1,
                            'future/market/v1/public/q/depth': 1,
                            'future/market/v1/public/q/funding-rate': 1,
                            'future/market/v1/public/q/funding-rate-record': 1,
                            'future/market/v1/public/q/index-price': 1,
                            'future/market/v1/public/q/kline': 1,
                            'future/market/v1/public/q/mark-price': 1,
                            'future/market/v1/public/q/symbol-index-price': 1,
                            'future/market/v1/public/q/symbol-mark-price': 1,
                            'future/market/v1/public/q/ticker': 1,
                            'future/market/v1/public/q/tickers': 1,
                            'future/market/v1/public/symbol/coins': 3.33,
                            'future/market/v1/public/symbol/detail': 3.33,
                            'future/market/v1/public/symbol/list': 1,
                        },
                    },
                    'inverse': {
                        'get': {
                            'future/market/v1/public/contract/risk-balance': 1,
                            'future/market/v1/public/contract/open-interest': 1,
                            'future/market/v1/public/leverage/bracket/detail': 1,
                            'future/market/v1/public/leverage/bracket/list': 1,
                            'future/market/v1/public/q/agg-ticker': 1,
                            'future/market/v1/public/q/agg-tickers': 1,
                            'future/market/v1/public/q/deal': 1,
                            'future/market/v1/public/q/depth': 1,
                            'future/market/v1/public/q/funding-rate': 1,
                            'future/market/v1/public/q/funding-rate-record': 1,
                            'future/market/v1/public/q/index-price': 1,
                            'future/market/v1/public/q/kline': 1,
                            'future/market/v1/public/q/mark-price': 1,
                            'future/market/v1/public/q/symbol-index-price': 1,
                            'future/market/v1/public/q/symbol-mark-price': 1,
                            'future/market/v1/public/q/ticker': 1,
                            'future/market/v1/public/q/tickers': 1,
                            'future/market/v1/public/symbol/coins': 3.33,
                            'future/market/v1/public/symbol/detail': 3.33,
                            'future/market/v1/public/symbol/list': 1,
                        },
                    },
                },
                'private': {
                    'spot': {
                        'get': {
                            'batch-order': 1,
                            'deposit/address': 1,
                            'deposit/history': 1,
                            'history-order': 1,
                            'open-order': 1,
                            'order': 1,
                            'order/{orderId}': 1,
                            'trade': 1,
                            'withdraw/history': 1,
                        },
                        'post': {
                            'order': 0.5,
                            'withdraw': 1,
                        },
                        'delete': {
                            'batch-order': 1,
                            'open-order': 1,
                            'order/{orderId}': 1,
                        },
                    },
                    'linear': {
                        'get': {
                            'future/trade/v1/entrust/plan-detail': 1,
                            'future/trade/v1/entrust/plan-list': 1,
                            'future/trade/v1/entrust/plan-list-history': 1,
                            'future/trade/v1/entrust/profit-detail': 1,
                            'future/trade/v1/entrust/profit-list': 1,
                            'future/trade/v1/order/detail': 1,
                            'future/trade/v1/order/list': 1,
                            'future/trade/v1/order/list-history': 1,
                            'future/trade/v1/order/trade-list': 1,
                            'future/user/v1/account/info': 1,
                            'future/user/v1/balance/bills': 1,
                            'future/user/v1/balance/detail': 1,
                            'future/user/v1/balance/funding-rate-list': 1,
                            'future/user/v1/balance/list': 1,
                            'future/user/v1/position/adl': 1,
                            'future/user/v1/position/list': 1,
                            'future/user/v1/user/collection/list': 1,
                            'future/user/v1/user/listen-key': 1,
                        },
                        'post': {
                            'future/trade/v1/entrust/cancel-all-plan': 1,
                            'future/trade/v1/entrust/cancel-all-profit-stop': 1,
                            'future/trade/v1/entrust/cancel-plan': 1,
                            'future/trade/v1/entrust/cancel-profit-stop': 1,
                            'future/trade/v1/entrust/create-profit': 1,
                            'future/trade/v1/entrust/update-profit-stop': 1,
                            'future/trade/v1/order/cancel': 1,
                            'future/trade/v1/order/cancel-all': 1,
                            'future/trade/v1/order/create': 1,
                            'future/trade/v1/order/create-batch': 1,
                            'future/user/v1/account/open': 1,
                            'future/user/v1/position/adjust-leverage': 1,
                            'future/user/v1/position/auto-margin': 1,
                            'future/user/v1/position/close-all': 1,
                            'future/user/v1/position/margin': 1,
                            'future/user/v1/user/collection/add': 1,
                            'future/user/v1/user/collection/cancel': 1,
                        },
                    },
                    'inverse': {
                        'get': {
                            'future/trade/v1/entrust/plan-detail': 1,
                            'future/trade/v1/entrust/plan-list': 1,
                            'future/trade/v1/entrust/plan-list-history': 1,
                            'future/trade/v1/entrust/profit-detail': 1,
                            'future/trade/v1/entrust/profit-list': 1,
                            'future/trade/v1/order/detail': 1,
                            'future/trade/v1/order/list': 1,
                            'future/trade/v1/order/list-history': 1,
                            'future/trade/v1/order/trade-list': 1,
                            'future/user/v1/account/info': 1,
                            'future/user/v1/balance/bills': 1,
                            'future/user/v1/balance/detail': 1,
                            'future/user/v1/balance/funding-rate-list': 1,
                            'future/user/v1/balance/list': 1,
                            'future/user/v1/position/adl': 1,
                            'future/user/v1/position/list': 1,
                            'future/user/v1/user/collection/list': 1,
                            'future/user/v1/user/listen-key': 1,
                        },
                        'post': {
                            'future/trade/v1/entrust/cancel-all-plan': 1,
                            'future/trade/v1/entrust/cancel-all-profit-stop': 1,
                            'future/trade/v1/entrust/cancel-plan': 1,
                            'future/trade/v1/entrust/cancel-profit-stop': 1,
                            'future/trade/v1/entrust/create-profit': 1,
                            'future/trade/v1/entrust/update-profit-stop': 1,
                            'future/trade/v1/order/cancel': 1,
                            'future/trade/v1/order/cancel-all': 1,
                            'future/trade/v1/order/create': 1,
                            'future/trade/v1/order/create-batch': 1,
                            'future/user/v1/account/open': 1,
                            'future/user/v1/position/adjust-leverage': 1,
                            'future/user/v1/position/auto-margin': 1,
                            'future/user/v1/position/close-all': 1,
                            'future/user/v1/position/margin': 1,
                            'future/user/v1/user/collection/add': 1,
                            'future/user/v1/user/collection/cancel': 1,
                        },
                    },
                },
            },
            'fees': {
                'trading': {
                },
                'tierBased': true,
                'percentage': true,
                'taker': this.parseNumber ('0.002'),
                'maker': this.parseNumber ('0.002'),
                'tiers': {
                    'maker': [
                        [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                        [ this.parseNumber ('5000'), this.parseNumber ('0.0018') ],
                        [ this.parseNumber ('10000'), this.parseNumber ('0.0016') ],
                        [ this.parseNumber ('20000'), this.parseNumber ('0.0014') ],
                        [ this.parseNumber ('50000'), this.parseNumber ('0.0012') ],
                        [ this.parseNumber ('150000'), this.parseNumber ('0.0010') ],
                        [ this.parseNumber ('300000'), this.parseNumber ('0.0008') ],
                        [ this.parseNumber ('600000'), this.parseNumber ('0.0007') ],
                        [ this.parseNumber ('1200000'), this.parseNumber ('0.0006') ],
                        [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                        [ this.parseNumber ('6000000'), this.parseNumber ('0.0004') ],
                        [ this.parseNumber ('15000000'), this.parseNumber ('0.0003') ],
                        [ this.parseNumber ('30000000'), this.parseNumber ('0.0002') ],
                    ],
                    'taker': [
                        [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                        [ this.parseNumber ('5000'), this.parseNumber ('0.0018') ],
                        [ this.parseNumber ('10000'), this.parseNumber ('0.0016') ],
                        [ this.parseNumber ('20000'), this.parseNumber ('0.0014') ],
                        [ this.parseNumber ('50000'), this.parseNumber ('0.0012') ],
                        [ this.parseNumber ('150000'), this.parseNumber ('0.0010') ],
                        [ this.parseNumber ('300000'), this.parseNumber ('0.0008') ],
                        [ this.parseNumber ('600000'), this.parseNumber ('0.0007') ],
                        [ this.parseNumber ('1200000'), this.parseNumber ('0.0006') ],
                        [ this.parseNumber ('2500000'), this.parseNumber ('0.0005') ],
                        [ this.parseNumber ('6000000'), this.parseNumber ('0.0004') ],
                        [ this.parseNumber ('15000000'), this.parseNumber ('0.0003') ],
                        [ this.parseNumber ('30000000'), this.parseNumber ('0.0002') ],
                    ],
                },
            },
            'exceptions': {
                'exact': { // TODO: Error codes, https://doc.xt.com/#documentationerrorCode
                    'AUTH_001': AuthenticationError, // missing request header xt-validate-appkey
                    'AUTH_002': AuthenticationError, // missing request header xt-validate-timestamp
                    'AUTH_003': AuthenticationError, // missing request header xt-validate-recvwindow
                    'AUTH_004': AuthenticationError, // bad request header xt-validate-recvwindow
                    'AUTH_005': AuthenticationError, // missing request header xt-validate-algorithms
                    'AUTH_006': AuthenticationError, // bad request header xt-validate-algorithms
                    'AUTH_007': AuthenticationError, // missing request header xt-validate-signature
                    'AUTH_101': AuthenticationError, // ApiKey does not exist
                    'AUTH_102': AuthenticationError, // ApiKey is not activated
                    'AUTH_103': AuthenticationError, // Signature error, {"rc":1,"mc":"AUTH_103","ma":[],"result":null}
                    'AUTH_104': AuthenticationError, // Unbound IP request
                    'AUTH_105': AuthenticationError, // outdated message
                    'AUTH_106': AuthenticationError, // Exceeded apikey permission
                },
                'broad': {},
            },
            'commonCurrencies': { // TODO: commonCurrencies
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h', // spot only
                '2h': '2h', // spot only
                '4h': '4h',
                '6h': '6h', // spot only
                '8h': '8h', // spot only
                '1d': '1d',
                '3d': '3d', // spot only
                '1w': '1w',
                '1M': '1M', // spot only
            },
            'options': {
                'networks': {
                    'ERC20': 'Ethereum',
                    'TRC20': 'Tron',
                    'BEP20': 'BNB Smart Chain',
                    'BEP2': 'BNB-BEP2',
                    'BTC': 'Bitcoin',
                    'FIO': 'FIO',
                    'XT': 'XT Smart Chain',
                    'ETC': 'Ethereum Classic',
                    'EOS': 'EOS',
                    'QTUM': 'QTUM',
                    'HECO': 'HECO',
                    'MATIC': 'Polygon',
                    'METIS': 'METIS',
                    'LTC': 'Litecoin',
                    'BTS': 'BitShares',
                    'XRP': 'Ripple',
                    'XLM': 'Stellar Network',
                    'ADA': 'Cardano',
                    'DASH': 'DASH',
                    'XEM': 'XEM',
                    'XWC': 'XWC-XWC',
                    'DOGE': 'dogecoin',
                    'DCR': 'Decred',
                    'SC': 'Siacoin',
                    'XTZ': 'Tezos',
                    'SCC': 'SCC',
                    'BSV': 'BSV',
                    'ZEC': 'Zcash',
                    'VSYS': 'VSYS',
                    'BTX': 'BTX',
                    'XMR': 'Monero',
                    'LSK': 'Lisk',
                    'ATOM': 'Cosmos',
                    'ONT': 'Ontology',
                    'ALGO': 'Algorand',
                    'RISE': 'RISE',
                    'CSPR': 'CSPR',
                    'SOL': 'SOL-SOL',
                    'DOT': 'Polkadot',
                    'KAVA': 'KAVA',
                    'BEB': 'BEB',
                    'ZEN': 'Horizen',
                    'PC': 'PC',
                    'FIL': 'Filecoin',
                    'MARS': 'MARS',
                    'BITCI': 'BITCI',
                    'CHZ': 'chz',
                    'XCH': 'XCH',
                    'MMUI': 'MMUI',
                    'ICP': 'Internet Computer',
                    'MINA': 'MINA',
                    'KSM': 'Kusama',
                    'LUNA': 'Terra',
                    'THETA': 'Theta Token',
                    'FTM': 'Fantom',
                    'FESS': 'FESS',
                    'FRTS': 'FRTS',
                    'TEC': 'TEC',
                    'SWT': 'SWT',
                    'TOMO': 'TOMO',
                    'VET': 'VeChain',
                    'DEL': 'DEL',
                    'AVAX C-Chain': 'AVAX C-Chain',
                    'CPH': 'CPH',
                    'HDD': 'HDD',
                    'NEAR': 'NEAR Protocol',
                    'ONE': 'Harmony',
                    'KLAY': 'Klaytn',
                    'ABBC': 'ABBC',
                    'LTNM': 'LTNM',
                    'XDC': 'XDC',
                    'PHAE': 'PHAE',
                    'BLKC': 'BLKC',
                    'CELO': 'CELO',
                    'POKT': 'POKT',
                    'WELUPS': 'WELUPS',
                    'XDAI': 'XDAI',
                    'XYM': 'XYM',
                    'AR': 'Arweave',
                    'CELT': 'OKT',
                    'ROSE': 'ROSE',
                    'EGLD': 'Elrond eGold',
                    'WAXP': 'WAXP',
                    'CRO': 'CRO-CRONOS',
                    'BAR': 'BAR',
                    'BCH': 'Bitcoin Cash',
                    'DINGO': 'DINGO',
                    'GLMR': 'Moonbeam',
                    'ARB': 'ARB',
                    'TFUEL': 'TFUEL',
                    'BETH': 'BETH',
                    'LOOP': 'LOOP-LRC',
                    'KYCC': 'KYCC',
                    'CLO': 'CLO',
                    'XFL': 'XFL',
                    'EGX': 'EGX',
                    'WAVES': 'WAVES',
                    'TKG': 'TKG',
                    'REI': 'REI Network',
                    'LYR': 'LYR',
                    'ASTR': 'Astar Network',
                    'IOST': 'IOST',
                    'GAL(FT)': 'GAL(FT)',
                    'WEMIX': 'WEMIX',
                    'LUNC': 'LUNC',
                    'OP': 'OPT',
                    'HBAR': 'HBAR',
                    'PLCUC': 'PLCUC',
                    'CUBE': 'CUBE',
                    'BND': 'BND',
                    'MMT': 'MMT-MMT',
                    'VXXL': 'VXXL',
                    'BBC': 'BBC',
                    'EVMOS': 'EVMOS',
                    'REDLC': 'REDLC',
                    'IVAR': 'IVAR',
                    'QIE': 'QIE',
                    'RVN': 'RVN',
                    'unkown': 'unkown',
                    'ETHW': 'ETHW',
                    'ETHS': 'ETHS',
                    'ETHF': 'ETHF',
                    'TBC': 'TBC-TBC',
                    'NEOX': 'NEOX',
                    'OMAX': 'OMAX-OMAX CHAIN',
                    'KUB': 'KUB',
                    'AIPC': 'AIPC',
                    'LAT': 'LAT',
                    'ALEO(IOU)': 'ALEO(IOU)',
                    'APT': 'APT',
                    'PIRI': 'PIRI',
                    'PETH': 'PETH',
                    'MLXC': 'MLXC',
                    'NXT': 'NXT',
                    'PI': 'PI',
                    'PLCU': 'PLCU',
                    'GMMT': 'GMMT chain',
                    'CORE': 'CORE',
                    'BTC2': 'BTC2',
                    'NEO': 'NEO',
                    'ZIL': 'Zilliqa',
                },
                'networksById': {
                    'Ethereum': 'ERC20',
                    'Tron': 'TRC20',
                    'BNB Smart Chain': 'BEP20',
                    'BNB-BEP2': 'BEP2',
                    'Bitcoin': 'BTC',
                    'FIO': 'FIO',
                    'XT Smart Chain': 'XT',
                    'Ethereum Classic': 'ETC',
                    'EOS': 'EOS',
                    'QTUM': 'QTUM',
                    'HECO': 'HECO',
                    'Polygon': 'MATIC',
                    'METIS': 'METIS',
                    'Litecoin': 'LTC',
                    'BitShares': 'BTS',
                    'Ripple': 'XRP',
                    'Stellar Network': 'XLM',
                    'Cardano': 'ADA',
                    'DASH': 'DASH',
                    'XEM': 'XEM',
                    'XWC-XWC': 'XWC',
                    'dogecoin': 'DOGE',
                    'Decred': 'DCR',
                    'Siacoin': 'SC',
                    'Tezos': 'XTZ',
                    'SCC': 'SCC',
                    'BSV': 'BSV',
                    'Zcash': 'ZEC',
                    'VSYS': 'VSYS',
                    'BTX': 'BTX',
                    'Monero': 'XMR',
                    'Lisk': 'LSK',
                    'Cosmos': 'ATOM',
                    'Ontology': 'ONT',
                    'Algorand': 'ALGO',
                    'RISE': 'RISE',
                    'CSPR': 'CSPR',
                    'SOL-SOL': 'SOL',
                    'Polkadot': 'DOT',
                    'KAVA': 'KAVA',
                    'BEB': 'BEB',
                    'Horizen': 'ZEN',
                    'PC': 'PC',
                    'Filecoin': 'FIL',
                    'MARS': 'MARS',
                    'BITCI': 'BITCI',
                    'chz': 'CHZ',
                    'XCH': 'XCH',
                    'MMUI': 'MMUI',
                    'Internet Computer': 'ICP',
                    'MINA': 'MINA',
                    'Kusama': 'KSM',
                    'Terra': 'LUNA',
                    'Theta Token': 'THETA',
                    'Fantom': 'FTM',
                    'FESS': 'FESS',
                    'FRTS': 'FRTS',
                    'TEC': 'TEC',
                    'SWT': 'SWT',
                    'TOMO': 'TOMO',
                    'VeChain': 'VET',
                    'DEL': 'DEL',
                    'AVAX C-Chain': 'AVAX C-Chain',
                    'CPH': 'CPH',
                    'HDD': 'HDD',
                    'NEAR Protocol': 'NEAR',
                    'Harmony': 'ONE',
                    'Klaytn': 'KLAY',
                    'ABBC': 'ABBC',
                    'LTNM': 'LTNM',
                    'XDC': 'XDC',
                    'PHAE': 'PHAE',
                    'BLKC': 'BLKC',
                    'CELO': 'CELO',
                    'POKT': 'POKT',
                    'WELUPS': 'WELUPS',
                    'XDAI': 'XDAI',
                    'XYM': 'XYM',
                    'Arweave': 'AR',
                    'OKT': 'CELT',
                    'ROSE': 'ROSE',
                    'Elrond eGold': 'EGLD',
                    'WAXP': 'WAXP',
                    'CRO-CRONOS': 'CRO',
                    'CRONOS': 'CRO',
                    'BAR': 'BAR',
                    'Bitcoin Cash': 'BCH',
                    'DINGO': 'DINGO',
                    'Moonbeam': 'GLMR',
                    'ARB': 'ARB',
                    'TFUEL': 'TFUEL',
                    'BETH': 'BETH',
                    'LOOP-LRC': 'LOOP',
                    'KYCC': 'KYCC',
                    'CLO': 'CLO',
                    'XFL': 'XFL',
                    'EGX': 'EGX',
                    'WAVES': 'WAVES',
                    'TKG': 'TKG',
                    'REI Network': 'REI',
                    'LYR': 'LYR',
                    'Astar Network': 'ASTR',
                    'IOST': 'IOST',
                    'GAL(FT)': 'GAL(FT)',
                    'WEMIX': 'WEMIX',
                    'LUNC': 'LUNC',
                    'OPT': 'OP',
                    'HBAR': 'HBAR',
                    'PLCUC': 'PLCUC',
                    'CUBE': 'CUBE',
                    'BND': 'BND',
                    'MMT-MMT': 'MMT',
                    'VXXL': 'VXXL',
                    'BBC': 'BBC',
                    'EVMOS': 'EVMOS',
                    'REDLC': 'REDLC',
                    'IVAR': 'IVAR',
                    'QIE': 'QIE',
                    'RVN': 'RVN',
                    'unkown': 'unkown',
                    'ETHW': 'ETHW',
                    'ETHS': 'ETHS',
                    'ETHF': 'ETHF',
                    'TBC-TBC': 'TBC',
                    'NEOX': 'NEOX',
                    'OMAX-OMAX CHAIN': 'OMAX',
                    'KUB': 'KUB',
                    'AIPC': 'AIPC',
                    'LAT': 'LAT',
                    'ALEO(IOU)': 'ALEO(IOU)',
                    'APT': 'APT',
                    'PIRI': 'PIRI',
                    'PETH': 'PETH',
                    'MLXC': 'MLXC',
                    'NXT': 'NXT',
                    'PI': 'PI',
                    'PLCU': 'PLCU',
                    'GMMT chain': 'GMMT',
                    'CORE': 'CORE',
                    'BTC2': 'BTC2',
                    'NEO': 'NEO',
                    'Zilliqa': 'ZIL',
                },
                'createMarketBuyOrderRequiresPrice': true,
                'recvWindow': '5000', // in milliseconds, spot only
            },
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name xt#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the xt server
         * @see https://doc.xt.com/#market1serverInfo
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the xt server
         */
        const response = await (this as any).publicSpotGetTime (params);
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "serverTime": 1677823301643
        //         }
        //     }
        //
        const data = this.safeValue (response, 'result');
        return this.safeInteger (data, 'serverTime');
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name xt#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://doc.xt.com/#deposit_withdrawalsupportedCurrenciesGet
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await (this as any).publicSpotGetWalletSupportCurrency (params);
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "currency": "btc",
        //                 "supportChains": [
        //                     {
        //                         "chain": "Bitcoin",
        //                         "depositEnabled": true,
        //                         "withdrawEnabled": true
        //                     },
        //                 ]
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const rawNetworks = this.safeValue (entry, 'supportChains', []);
            const networks = {};
            let depositEnabled = undefined;
            let withdrawEnabled = undefined;
            for (let j = 0; j < rawNetworks.length; j++) {
                const rawNetwork = rawNetworks[j];
                const networkId = this.safeString (rawNetwork, 'chain');
                const network = this.networkIdToCode (networkId);
                depositEnabled = this.safeValue (rawNetwork, 'depositEnabled');
                withdrawEnabled = this.safeValue (rawNetwork, 'withdrawEnabled');
                networks[network] = {
                    'info': rawNetwork,
                    'id': networkId,
                    'network': network,
                    'name': undefined,
                    'active': undefined,
                    'fee': undefined,
                    'precision': undefined,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
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
                };
            }
            result[code] = {
                'info': entry,
                'id': currencyId,
                'code': code,
                'name': undefined,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'networks': networks,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
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
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name xt#fetchMarkets
         * @description retrieves data on all markets for xt
         * @see https://doc.xt.com/#market2symbol
         * @see https://doc.xt.com/#futures_quotesgetSymbols
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        let promises = [
            (this as any).fetchSpotMarkets (params),
            (this as any).fetchSwapAndFutureMarkets (params),
        ];
        promises = await Promise.all (promises);
        const spotMarkets = promises[0];
        const swapAndFutureMarkets = promises[1];
        return this.arrayConcat (spotMarkets, swapAndFutureMarkets);
    }

    async fetchSpotMarkets (params = {}) {
        const response = await (this as any).publicSpotGetSymbol (params);
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "time": 1677881368812,
        //             "version": "abb101d1543e54bee40687b135411ba0",
        //             "symbols": [
        //                 {
        //                     "id": 640,
        //                     "symbol": "xt_usdt",
        //                     "state": "ONLINE",
        //                     "stateTime": 1554048000000,
        //                     "tradingEnabled": true,
        //                     "openapiEnabled": true,
        //                     "nextStateTime": null,
        //                     "nextState": null,
        //                     "depthMergePrecision": 5,
        //                     "baseCurrency": "xt",
        //                     "baseCurrencyPrecision": 8,
        //                     "baseCurrencyId": 128,
        //                     "quoteCurrency": "usdt",
        //                     "quoteCurrencyPrecision": 8,
        //                     "quoteCurrencyId": 11,
        //                     "pricePrecision": 4,
        //                     "quantityPrecision": 2,
        //                     "orderTypes": ["LIMIT","MARKET"],
        //                     "timeInForces": ["GTC","IOC"],
        //                     "displayWeight": 10002,
        //                     "displayLevel": "FULL",
        //                     "plates": [],
        //                     "filters":[
        //                         {
        //                             "filter": "QUOTE_QTY",
        //                             "min": "1"
        //                         },
        //                         {
        //                             "filter": "PROTECTION_LIMIT",
        //                             "buyMaxDeviation": "0.8",
        //                             "sellMaxDeviation": "4"
        //                         },
        //                         {
        //                             "filter": "PROTECTION_MARKET",
        //                             "maxDeviation": "0.02"
        //                         }
        //                     ]
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'result', {});
        const symbols = this.safeValue (data, 'symbols', []);
        return this.parseMarkets (symbols);
    }

    async fetchSwapAndFutureMarkets (params = {}) {
        const markets = await Promise.all ([ (this as any).publicLinearGetFutureMarketV1PublicSymbolList (params), (this as any).publicInverseGetFutureMarketV1PublicSymbolList (params) ]);
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "id": 52,
        //                 "symbolGroupId": 71,
        //                 "symbol": "xt_usdt",
        //                 "pair": "xt_usdt",
        //                 "contractType": "PERPETUAL",
        //                 "productType": "perpetual",
        //                 "predictEventType": null,
        //                 "underlyingType": "U_BASED",
        //                 "contractSize": "1",
        //                 "tradeSwitch": true,
        //                 "isDisplay": true,
        //                 "isOpenApi": false,
        //                 "state": 0,
        //                 "initLeverage": 20,
        //                 "initPositionType": "CROSSED",
        //                 "baseCoin": "xt",
        //                 "quoteCoin": "usdt",
        //                 "baseCoinPrecision": 8,
        //                 "baseCoinDisplayPrecision": 4,
        //                 "quoteCoinPrecision": 8,
        //                 "quoteCoinDisplayPrecision": 4,
        //                 "quantityPrecision": 0,
        //                 "pricePrecision": 4,
        //                 "supportOrderType": "LIMIT,MARKET",
        //                 "supportTimeInForce": "GTC,FOK,IOC,GTX",
        //                 "supportEntrustType": "TAKE_PROFIT,STOP,TAKE_PROFIT_MARKET,STOP_MARKET,TRAILING_STOP_MARKET",
        //                 "supportPositionType": "CROSSED,ISOLATED",
        //                 "minQty": "1",
        //                 "minNotional": "5",
        //                 "maxNotional": "20000000",
        //                 "multiplierDown": "0.1",
        //                 "multiplierUp": "0.1",
        //                 "maxOpenOrders": 200,
        //                 "maxEntrusts": 200,
        //                 "makerFee": "0.0004",
        //                 "takerFee": "0.0006",
        //                 "liquidationFee": "0.01",
        //                 "marketTakeBound": "0.1",
        //                 "depthPrecisionMerge": 5,
        //                 "labels": ["HOT"],
        //                 "onboardDate": 1657101601000,
        //                 "enName": "XTUSDT ",
        //                 "cnName": "XTUSDT",
        //                 "minStepPrice": "0.0001",
        //                 "minPrice": null,
        //                 "maxPrice": null,
        //                 "deliveryDate": 1669879634000,
        //                 "deliveryPrice": null,
        //                 "deliveryCompletion": false,
        //                 "cnDesc": null,
        //                 "enDesc": null
        //             },
        //         ]
        //     }
        //
        const swapAndFutureMarkets = this.arrayConcat (this.safeValue (markets[0], 'result', []), this.safeValue (markets[1], 'result', []));
        return this.parseMarkets (swapAndFutureMarkets);
    }

    parseMarkets (markets) {
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            result.push (this.parseMarket (markets[i]));
        }
        return result;
    }

    parseMarket (market) {
        //
        // spot
        //
        //     {
        //         "id": 640,
        //         "symbol": "xt_usdt",
        //         "state": "ONLINE",
        //         "stateTime": 1554048000000,
        //         "tradingEnabled": true,
        //         "openapiEnabled": true,
        //         "nextStateTime": null,
        //         "nextState": null,
        //         "depthMergePrecision": 5,
        //         "baseCurrency": "xt",
        //         "baseCurrencyPrecision": 8,
        //         "baseCurrencyId": 128,
        //         "quoteCurrency": "usdt",
        //         "quoteCurrencyPrecision": 8,
        //         "quoteCurrencyId": 11,
        //         "pricePrecision": 4,
        //         "quantityPrecision": 2,
        //         "orderTypes": ["LIMIT","MARKET"],
        //         "timeInForces": ["GTC","IOC"],
        //         "displayWeight": 10002,
        //         "displayLevel": "FULL",
        //         "plates": [],
        //         "filters":[
        //             {
        //                 "filter": "QUOTE_QTY",
        //                 "min": "1"
        //             },
        //             {
        //                 "filter": "PROTECTION_LIMIT",
        //                 "buyMaxDeviation": "0.8",
        //                 "sellMaxDeviation": "4"
        //             },
        //             {
        //                 "filter": "PROTECTION_MARKET",
        //                 "maxDeviation": "0.02"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "id": 52,
        //         "symbolGroupId": 71,
        //         "symbol": "xt_usdt",
        //         "pair": "xt_usdt",
        //         "contractType": "PERPETUAL",
        //         "productType": "perpetual",
        //         "predictEventType": null,
        //         "underlyingType": "U_BASED",
        //         "contractSize": "1",
        //         "tradeSwitch": true,
        //         "isDisplay": true,
        //         "isOpenApi": false,
        //         "state": 0,
        //         "initLeverage": 20,
        //         "initPositionType": "CROSSED",
        //         "baseCoin": "xt",
        //         "quoteCoin": "usdt",
        //         "baseCoinPrecision": 8,
        //         "baseCoinDisplayPrecision": 4,
        //         "quoteCoinPrecision": 8,
        //         "quoteCoinDisplayPrecision": 4,
        //         "quantityPrecision": 0,
        //         "pricePrecision": 4,
        //         "supportOrderType": "LIMIT,MARKET",
        //         "supportTimeInForce": "GTC,FOK,IOC,GTX",
        //         "supportEntrustType": "TAKE_PROFIT,STOP,TAKE_PROFIT_MARKET,STOP_MARKET,TRAILING_STOP_MARKET",
        //         "supportPositionType": "CROSSED,ISOLATED",
        //         "minQty": "1",
        //         "minNotional": "5",
        //         "maxNotional": "20000000",
        //         "multiplierDown": "0.1",
        //         "multiplierUp": "0.1",
        //         "maxOpenOrders": 200,
        //         "maxEntrusts": 200,
        //         "makerFee": "0.0004",
        //         "takerFee": "0.0006",
        //         "liquidationFee": "0.01",
        //         "marketTakeBound": "0.1",
        //         "depthPrecisionMerge": 5,
        //         "labels": ["HOT"],
        //         "onboardDate": 1657101601000,
        //         "enName": "XTUSDT ",
        //         "cnName": "XTUSDT",
        //         "minStepPrice": "0.0001",
        //         "minPrice": null,
        //         "maxPrice": null,
        //         "deliveryDate": 1669879634000,
        //         "deliveryPrice": null,
        //         "deliveryCompletion": false,
        //         "cnDesc": null,
        //         "enDesc": null
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString2 (market, 'baseCurrency', 'baseCoin');
        const quoteId = this.safeString2 (market, 'quoteCurrency', 'quoteCoin');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const state = this.safeString (market, 'state');
        let symbol = base + '/' + quote;
        const filters = this.safeValue (market, 'filters', []);
        let minAmount = undefined;
        for (let i = 0; i < filters.length; i++) {
            const entry = filters[i];
            const filter = this.safeString (entry, 'filter');
            if (filter === 'QUOTE_QTY') {
                minAmount = this.safeNumber (entry, 'min');
            }
        }
        const underlyingType = this.safeString (market, 'underlyingType');
        let linear = undefined;
        let inverse = undefined;
        let settleId = undefined;
        let settle = undefined;
        let expiry = undefined;
        let future = false;
        let swap = false;
        let contract = false;
        let spot = true;
        let type = 'spot';
        if (underlyingType === 'U_BASED') {
            symbol = symbol + ':' + quote;
            settleId = baseId;
            settle = quote;
            linear = true;
            inverse = false;
        } else if (underlyingType === 'COIN_BASED') {
            symbol = symbol + ':' + base;
            settleId = baseId;
            settle = base;
            linear = false;
            inverse = true;
        }
        if (underlyingType !== undefined) {
            expiry = this.safeInteger (market, 'deliveryDate');
            const productType = this.safeString (market, 'productType');
            if (productType !== 'perpetual') {
                symbol = symbol + '-' + this.yymmdd (expiry);
                type = 'future';
                future = true;
            } else {
                type = 'swap';
                swap = true;
            }
            minAmount = this.safeNumber (market, 'minQty');
            contract = true;
            spot = false;
        }
        return {
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
            'margin': undefined,
            'swap': swap,
            'future': future,
            'option': false,
            'active': (state === 'ONLINE') || (state === '0') ? true : false,
            'contract': contract,
            'linear': linear,
            'inverse': inverse,
            'taker': this.safeNumber (market, 'takerFee'),
            'maker': this.safeNumber (market, 'makerFee'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'price': this.safeNumber (market, 'pricePrecision'),
                'amount': this.safeNumber (market, 'quantityPrecision'),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
                    'max': undefined,
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'minNotional'),
                    'max': this.safeNumber (market, 'maxNotional'),
                },
            },
            'info': market,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://doc.xt.com/#market4kline
         * @see https://doc.xt.com/#futures_quotesgetKLine
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        let method = 'publicSpotGetKline';
        if (market['linear']) {
            method = 'publicLinearGetFutureMarketV1PublicQKline';
        } else if (market['inverse']) {
            method = 'publicInverseGetFutureMarketV1PublicQKline';
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "t": 1678167720000,
        //                 "o": "22467.85",
        //                 "c": "22465.87",
        //                 "h": "22468.86",
        //                 "l": "22465.21",
        //                 "q": "1.316656",
        //                 "v": "29582.73018498"
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "s": "btc_usdt",
        //                 "p": "btc_usdt",
        //                 "t": 1678168020000,
        //                 "o": "22450.0",
        //                 "c": "22441.5",
        //                 "h": "22450.0",
        //                 "l": "22441.5",
        //                 "a": "312931",
        //                 "v": "702461.58895"
        //             },
        //         ]
        //     }
        //
        const ohlcvs = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // spot
        //
        //     {
        //         "t": 1678167720000,
        //         "o": "22467.85",
        //         "c": "22465.87",
        //         "h": "22468.86",
        //         "l": "22465.21",
        //         "q": "1.316656",
        //         "v": "29582.73018498"
        //     }
        //
        // swap and future
        //
        //     {
        //         "s": "btc_usdt",
        //         "p": "btc_usdt",
        //         "t": 1678168020000,
        //         "o": "22450.0",
        //         "c": "22441.5",
        //         "h": "22450.0",
        //         "l": "22441.5",
        //         "a": "312931",
        //         "v": "702461.58895"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber2 (ohlcv, 'a', 'v'),
        ];
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchOrderBook
         * @see https://doc.xt.com/#market3depth
         * @see https://doc.xt.com/#futures_quotesgetDepth
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified market symbol to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'publicSpotGetDepth';
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            if (limit !== undefined) {
                request['level'] = Math.min (limit, 50);
            } else {
                request['level'] = 50;
            }
            if (market['linear']) {
                method = 'publicLinearGetFutureMarketV1PublicQDepth';
            } else if (market['inverse']) {
                method = 'publicInverseGetFutureMarketV1PublicQDepth';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "timestamp": 1678169975184,
        //             "lastUpdateId": 1675333221812,
        //             "bids": [
        //                 ["22444.51", "0.129887"],
        //                 ["22444.49", "0.114245"],
        //                 ["22444.30", "0.225956"]
        //             ],
        //             "asks": [
        //                 ["22446.19", "0.095330"],
        //                 ["22446.24", "0.224413"],
        //                 ["22446.28", "0.329095"]
        //             ]
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "t": 1678170311005,
        //             "s": "btc_usdt",
        //             "u": 471694545627,
        //             "b": [
        //                 ["22426", "198623"],
        //                 ["22423.5", "80295"],
        //                 ["22423", "163580"]
        //             ],
        //             "a": [
        //                 ["22427", "3417"],
        //                 ["22428.5", "43532"],
        //                 ["22429", "119"]
        //             ]
        //         }
        //     }
        //
        const orderBook = this.safeValue (response, 'result', {});
        const timestamp = this.safeNumber2 (orderBook, 'timestamp', 't');
        if (market['spot']) {
            return this.parseOrderBook (orderBook, symbol, timestamp);
        }
        return this.parseOrderBook (orderBook, symbol, timestamp, 'b', 'a');
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name xt#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://doc.xt.com/#market10ticker24h
         * @see https://doc.xt.com/#futures_quotesgetAggTicker
         * @param {string} symbol unified market symbol to fetch the ticker for
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = 'publicSpotGetTicker24h';
        if (market['linear']) {
            method = 'publicLinearGetFutureMarketV1PublicQAggTicker';
        } else if (market['inverse']) {
            method = 'publicInverseGetFutureMarketV1PublicQAggTicker';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "s": "btc_usdt",
        //                 "t": 1678172693931,
        //                 "cv": "34.00",
        //                 "cr": "0.0015",
        //                 "o": "22398.05",
        //                 "l": "22323.72",
        //                 "h": "22600.50",
        //                 "c": "22432.05",
        //                 "q": "7962.256931",
        //                 "v": "178675209.47416856"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "t": 1678172848572,
        //             "s": "btc_usdt",
        //             "c": "22415.5",
        //             "h": "22590.0",
        //             "l": "22310.0",
        //             "a": "623654031",
        //             "v": "1399166074.31675",
        //             "o": "22381.5",
        //             "r": "0.0015",
        //             "i": "22424.5",
        //             "m": "22416.5",
        //             "bp": "22415",
        //             "ap": "22415.5"
        //         }
        //     }
        //
        const ticker = this.safeValue (response, 'result');
        if (market['spot']) {
            return this.parseTicker (ticker[0], market);
        }
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://doc.xt.com/#market10ticker24h
         * @see https://doc.xt.com/#futures_quotesgetAggTickers
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbols !== undefined) {
            symbols = this.marketSymbols (symbols);
            market = this.market (symbols[0]);
        }
        const request = {};
        let method = undefined;
        if (market['spot']) {
            method = 'publicSpotGetTicker24h';
            request['symbols'] = symbols;
        } else {
            if (symbols !== undefined) {
                throw new NotSupported (this.id + ' the symbols argument is not supported for swap and future markets');
            }
            if (market['linear']) {
                method = 'publicLinearGetFutureMarketV1PublicQAggTickers';
            } else if (market['inverse']) {
                method = 'publicInverseGetFutureMarketV1PublicQAggTickers';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "s": "btc_usdt",
        //                 "t": 1678172693931,
        //                 "cv": "34.00",
        //                 "cr": "0.0015",
        //                 "o": "22398.05",
        //                 "l": "22323.72",
        //                 "h": "22600.50",
        //                 "c": "22432.05",
        //                 "q": "7962.256931",
        //                 "v": "178675209.47416856"
        //             }
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": {
        //             "t": 1678172848572,
        //             "s": "btc_usdt",
        //             "c": "22415.5",
        //             "h": "22590.0",
        //             "l": "22310.0",
        //             "a": "623654031",
        //             "v": "1399166074.31675",
        //             "o": "22381.5",
        //             "r": "0.0015",
        //             "i": "22424.5",
        //             "m": "22416.5",
        //             "bp": "22415",
        //             "ap": "22415.5"
        //         }
        //     }
        //
        const tickers = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i], market);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers: spot
        //
        //     {
        //         "s": "btc_usdt",
        //         "t": 1678172693931,
        //         "cv": "34.00",
        //         "cr": "0.0015",
        //         "o": "22398.05",
        //         "l": "22323.72",
        //         "h": "22600.50",
        //         "c": "22432.05",
        //         "q": "7962.256931",
        //         "v": "178675209.47416856"
        //     }
        //
        // fetchTicker, fetchTickers: swap and future
        //
        //     {
        //         "t": 1678172848572,
        //         "s": "btc_usdt",
        //         "c": "22415.5",
        //         "h": "22590.0",
        //         "l": "22310.0",
        //         "a": "623654031",
        //         "v": "1399166074.31675",
        //         "o": "22381.5",
        //         "r": "0.0015",
        //         "i": "22424.5",
        //         "m": "22416.5",
        //         "bp": "22415",
        //         "ap": "22415.5"
        //     }
        //
        const marketId = this.safeString (ticker, 's');
        let marketType = (market !== undefined) ? market['type'] : undefined;
        if (marketType === undefined) {
            marketType = ('cv' in ticker) ? 'spot' : 'contract';
        }
        market = this.safeMarket (marketId, market, '_', marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 't');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'h'),
            'low': this.safeNumber (ticker, 'l'),
            'bid': this.safeNumber (ticker, 'bp'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ap'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': this.safeString (ticker, 'c'),
            'last': this.safeString (ticker, 'c'),
            'previousClose': undefined,
            'change': this.safeNumber (ticker, 'cv'),
            'percentage': this.safeNumber2 (ticker, 'cr', 'r'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber2 (ticker, 'a', 'v'),
            'info': ticker,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name xt#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://doc.xt.com/#market5tradeRecent
         * @see https://doc.xt.com/#futures_quotesgetDeal
         * @param {string} symbol unified market symbol to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the xt api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'publicSpotGetTradeRecent';
            if (limit !== undefined) {
                request['limit'] = limit;
            }
        } else {
            if (limit !== undefined) {
                request['num'] = limit;
            }
            if (market['linear']) {
                method = 'publicLinearGetFutureMarketV1PublicQDeal';
            } else if (market['inverse']) {
                method = 'publicInverseGetFutureMarketV1PublicQDeal';
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": [
        //             {
        //                 "i": 203530723141917063,
        //                 "t": 1678227505815,
        //                 "p": "22038.81",
        //                 "q": "0.000978",
        //                 "v": "21.55395618",
        //                 "b": true
        //             },
        //         ]
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": [
        //             {
        //                 "t": 1678227683897,
        //                 "s": "btc_usdt",
        //                 "p": "22031",
        //                 "a": "1067",
        //                 "m": "BID"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // spot
        //
        //     {
        //         "i": 203530723141917063,
        //         "t": 1678227505815,
        //         "p": "22038.81",
        //         "q": "0.000978",
        //         "v": "21.55395618",
        //         "b": true
        //     }
        //
        // swap and future
        //
        //     {
        //         "t": 1678227683897,
        //         "s": "btc_usdt",
        //         "p": "22031",
        //         "a": "1067",
        //         "m": "BID"
        //     }
        //
        const marketId = this.safeString (trade, 's');
        let marketType = (market !== undefined) ? market['type'] : undefined;
        if (marketType === undefined) {
            marketType = ('b' in trade) ? 'spot' : 'contract';
        }
        market = this.safeMarket (marketId, market, '_', marketType);
        const bidOrAsk = this.safeString (trade, 'm');
        let side = undefined;
        if (bidOrAsk !== undefined) {
            side = (bidOrAsk === 'BID') ? 'buy' : 'sell';
        }
        const buyerMaker = this.safeValue (trade, 'b');
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            takerOrMaker = buyerMaker ? 'maker' : 'taker';
        }
        const timestamp = this.safeInteger (trade, 't');
        return {
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeNumber (trade, 'p'),
            'amount': this.safeNumber (trade, 'q'),
            'cost': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name xt#createOrder
         * @description create a trade order
         * @see https://doc.xt.com/#orderorderPost
         * @see https://doc.xt.com/#futures_ordercreate
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much you want to trade in units of the base currency
         * @param {float|undefined} price the price to fulfill the order, in units of the quote currency, can be ignored in market orders
         * @param {object} params extra parameters specific to the xt api endpoint
         * @param {string|undefined} params.timeInForce 'GTC', 'IOC', 'FOK' or 'GTX'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('createOrder', market, params);
        let timeInForce = this.safeStringUpper (params, 'timeInForce', 'GTC');
        let method = undefined;
        if (market['spot']) {
            method = 'privateSpotPostOrder';
            request['side'] = side.toUpperCase ();
            request['type'] = type.toUpperCase ();
            request['bizType'] = (marketType === 'margin') ? 'LEVER' : 'SPOT';
            if (type === 'market') {
                timeInForce = this.safeStringUpper (params, 'timeInForce', 'FOK');
                if (side === 'buy') {
                    const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires a price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                        } else {
                            const amountString = this.numberToString (amount);
                            const priceString = this.numberToString (price);
                            const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
                            request['quoteQty'] = this.costToPrecision (symbol, cost);
                        }
                    } else {
                        request['quoteQty'] = this.amountToPrecision (symbol, amount);
                    }
                } else {
                    request['quantity'] = this.amountToPrecision (symbol, amount);
                }
            } else {
                request['price'] = this.priceToPrecision (symbol, price);
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
            request['timeInForce'] = timeInForce;
        } else {
            if (market['linear']) {
                method = 'privateLinearPostFutureTradeV1OrderCreate';
            } else if (market['inverse']) {
                method = 'privateInversePostFutureTradeV1OrderCreate';
            }
            request['orderSide'] = side.toUpperCase ();
            request['orderType'] = type.toUpperCase ();
            const convertContractsToAmount = Precise.stringDiv (this.numberToString (amount), this.numberToString (market['contractSize']));
            request['origQty'] = this.amountToPrecision (symbol, this.parseNumber (convertContractsToAmount));
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            }
            if (timeInForce !== undefined) {
                request['timeInForce'] = timeInForce;
            }
            const reduceOnly = this.safeValue (params, 'reduceOnly', false);
            if (side === 'buy') {
                const requestType = (reduceOnly) ? 'SHORT' : 'LONG';
                request['positionSide'] = requestType;
            } else {
                const requestType = (reduceOnly) ? 'LONG' : 'SHORT';
                request['positionSide'] = requestType;
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "rc": 0,
        //         "mc": "SUCCESS",
        //         "ma": [],
        //         "result": {
        //             "orderId": "204371980095156544"
        //         }
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": "206410760006650176"
        //     }
        //
        const order = (market['spot']) ? this.safeValue (response, 'result', {}) : response;
        return this.parseOrder (order, market);
    }

    parseOrder (order, market = undefined) {
        //
        // spot
        //
        //     {
        //         "orderId": "204371980095156544"
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": "206410760006650176"
        //     }
        //
        return this.safeOrder ({
            'info': order,
            'id': this.safeString2 (order, 'orderId', 'result'),
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': undefined,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': undefined,
            'price': undefined,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'average': undefined,
            'status': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
            'trades': undefined,
        }, market);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // TODO: finish handleErrors, spot api and linear/inverse, private and public, apis check the different error formats
        //
        // spot
        //
        //     {
        //         "rc": 1,
        //         "mc": "AUTH_103",
        //         "ma": [],
        //         "result": null
        //     }
        //
        //     {
        //         "returnCode": 0,
        //         "msgInfo": "success",
        //         "error": null,
        //         "result": []
        //     }
        //
        // swap and future
        //
        //     {
        //         "returnCode": 1,
        //         "msgInfo": "failure",
        //         "error": {
        //             "code": "403",
        //             "msg": "invalid signature"
        //         },
        //         "result": null
        //     }
        //
        const status = this.safeStringUpper2 (response, 'msgInfo', 'mc');
        if (status !== 'SUCCESS') {
            const feedback = this.id + ' ' + body;
            const error = this.safeValue (response, 'error', {});
            const spotErrorCode = this.safeString (response, 'mc');
            const errorCode = this.safeString (error, 'code', spotErrorCode);
            const spotMessage = this.safeString (response, 'msgInfo');
            const message = this.safeString (error, 'msg', spotMessage);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const signed = api[0] === 'private';
        const endpoint = api[1];
        const request = '/' + this.implodeParams (path, params);
        let payload = undefined;
        if (endpoint === 'spot') {
            if (signed) {
                payload = '/' + this.version + request;
            } else {
                payload = '/' + this.version + '/public' + request;
            }
        } else {
            payload = request;
        }
        let url = this.urls['api'][endpoint] + payload;
        const query = this.omit (params, this.extractParams (path));
        const urlencoded = this.urlencode (this.keysort (query));
        if (signed) {
            this.checkRequiredCredentials ();
            const defaultRecvWindow = this.safeString (this.options, 'recvWindow');
            const recvWindow = this.safeString (params, 'recvWindow', defaultRecvWindow);
            const timestamp = this.numberToString (this.nonce ());
            body = params;
            if ((payload === '/v4/order') || (payload === '/future/trade/v1/order/create')) {
                body['clientMedia'] = 'CCXT';
            }
            body = (method === 'GET') ? undefined : this.json (body);
            let payloadString = undefined;
            if (endpoint === 'spot') {
                payloadString = 'xt-validate-algorithms=HmacSHA256&xt-validate-appkey=' + this.apiKey + '&xt-validate-recvwindow=' + recvWindow + '&xt-validate-timestamp=' + timestamp;
                if (method === 'GET') {
                    payloadString = payloadString + '#' + method + '#' + payload;
                } else {
                    payloadString = payloadString + '#' + method + '#' + payload + '#' + body;
                }
                headers = {
                    'xt-validate-algorithms': 'HmacSHA256',
                    'xt-validate-recvwindow': recvWindow,
                    'Content-Type': 'application/json',
                };
            } else {
                payloadString = 'xt-validate-appkey=' + this.apiKey + '&xt-validate-timestamp=' + timestamp;
                if (method === 'GET') {
                    payloadString = payloadString + '#' + payload;
                } else {
                    payloadString = payloadString + '#' + payload + '#' + body;
                }
                headers = {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                };
            }
            const signature = this.hmac (this.encode (payloadString), this.encode (this.secret), 'sha256');
            headers['xt-validate-appkey'] = this.apiKey;
            headers['xt-validate-timestamp'] = timestamp;
            headers['xt-validate-signature'] = signature;
        } else {
            if (urlencoded) {
                url += '?' + urlencoded;
            }
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
