'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var mexc$1 = require('./abstract/mexc.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class mexc
 * @augments Exchange
 */
class mexc extends mexc$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'mexc',
            'name': 'MEXC Global',
            'countries': ['SC'],
            'rateLimit': 50,
            'version': 'v3',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': true,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': true,
                'createMarketSellOrderWithCost': true,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'deposit': undefined,
                'editOrder': undefined,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingInterval': true,
                'fetchFundingIntervals': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchIsolatedPositions': false,
                'fetchL2OrderBook': true,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': true,
                'fetchLeverages': false,
                'fetchLeverageTiers': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': 'emulated',
                'fetchPositionHistory': 'emulated',
                'fetchPositionMode': true,
                'fetchPositions': true,
                'fetchPositionsHistory': true,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': 'emulated',
                'fetchTransactionFees': true,
                'fetchTransactions': undefined,
                'fetchTransfer': true,
                'fetchTransfers': true,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg',
                'api': {
                    'spot': {
                        'public': 'https://api.mexc.com',
                        'private': 'https://api.mexc.com',
                    },
                    'spot2': {
                        'public': 'https://www.mexc.com/open/api/v2',
                        'private': 'https://www.mexc.com/open/api/v2',
                    },
                    'contract': {
                        'public': 'https://contract.mexc.com/api/v1/contract',
                        'private': 'https://contract.mexc.com/api/v1/private',
                    },
                    'broker': {
                        'private': 'https://api.mexc.com/api/v3/broker',
                    },
                },
                'www': 'https://www.mexc.com/',
                'doc': [
                    'https://mexcdevelop.github.io/apidocs/',
                ],
                'fees': [
                    'https://www.mexc.com/fee',
                ],
                'referral': 'https://www.mexc.com/register?inviteCode=mexc-1FQ1GNu1',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'ping': 1,
                            'time': 1,
                            'exchangeInfo': 10,
                            'depth': 1,
                            'trades': 5,
                            'historicalTrades': 1,
                            'aggTrades': 1,
                            'klines': 1,
                            'avgPrice': 1,
                            'ticker/24hr': 1,
                            'ticker/price': 1,
                            'ticker/bookTicker': 1,
                            'etf/info': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 2,
                            'openOrders': 3,
                            'allOrders': 10,
                            'account': 10,
                            'myTrades': 10,
                            'tradeFee': 10,
                            'sub-account/list': 1,
                            'sub-account/apiKey': 1,
                            'capital/config/getall': 10,
                            'capital/deposit/hisrec': 1,
                            'capital/withdraw/history': 1,
                            'capital/withdraw/address': 10,
                            'capital/deposit/address': 10,
                            'capital/transfer': 1,
                            'capital/transfer/tranId': 1,
                            'capital/transfer/internal': 1,
                            'capital/sub-account/universalTransfer': 1,
                            'capital/convert': 1,
                            'capital/convert/list': 1,
                            'margin/loan': 1,
                            'margin/allOrders': 1,
                            'margin/myTrades': 1,
                            'margin/openOrders': 1,
                            'margin/maxTransferable': 1,
                            'margin/priceIndex': 1,
                            'margin/order': 1,
                            'margin/isolated/account': 1,
                            'margin/maxBorrowable': 1,
                            'margin/repay': 1,
                            'margin/isolated/pair': 1,
                            'margin/forceLiquidationRec': 1,
                            'margin/isolatedMarginData': 1,
                            'margin/isolatedMarginTier': 1,
                            'rebate/taxQuery': 1,
                            'rebate/detail': 1,
                            'rebate/detail/kickback': 1,
                            'rebate/referCode': 1,
                            'rebate/affiliate/commission': 1,
                            'rebate/affiliate/withdraw': 1,
                            'rebate/affiliate/commission/detail': 1,
                            'mxDeduct/enable': 1,
                            'userDataStream': 1,
                            'selfSymbols': 1,
                        },
                        'post': {
                            'order': 1,
                            'order/test': 1,
                            'sub-account/virtualSubAccount': 1,
                            'sub-account/apiKey': 1,
                            'sub-account/futures': 1,
                            'sub-account/margin': 1,
                            'batchOrders': 10,
                            'capital/withdraw/apply': 1,
                            'capital/withdraw': 1,
                            'capital/transfer': 1,
                            'capital/transfer/internal': 1,
                            'capital/deposit/address': 1,
                            'capital/sub-account/universalTransfer': 1,
                            'capital/convert': 10,
                            'mxDeduct/enable': 1,
                            'userDataStream': 1,
                        },
                        'put': {
                            'userDataStream': 1,
                        },
                        'delete': {
                            'order': 1,
                            'openOrders': 1,
                            'sub-account/apiKey': 1,
                            'margin/order': 1,
                            'margin/openOrders': 1,
                            'userDataStream': 1,
                            'capital/withdraw': 1,
                        },
                    },
                },
                'contract': {
                    'public': {
                        'get': {
                            'ping': 2,
                            'detail': 100,
                            'support_currencies': 2,
                            'depth/{symbol}': 2,
                            'depth_commits/{symbol}/{limit}': 2,
                            'index_price/{symbol}': 2,
                            'fair_price/{symbol}': 2,
                            'funding_rate/{symbol}': 2,
                            'kline/{symbol}': 2,
                            'kline/index_price/{symbol}': 2,
                            'kline/fair_price/{symbol}': 2,
                            'deals/{symbol}': 2,
                            'ticker': 2,
                            'risk_reverse': 2,
                            'risk_reverse/history': 2,
                            'funding_rate/history': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/assets': 2,
                            'account/asset/{currency}': 2,
                            'account/transfer_record': 2,
                            'position/list/history_positions': 2,
                            'position/open_positions': 2,
                            'position/funding_records': 2,
                            'position/position_mode': 2,
                            'order/list/open_orders/{symbol}': 2,
                            'order/list/history_orders': 2,
                            'order/external/{symbol}/{external_oid}': 2,
                            'order/get/{order_id}': 2,
                            'order/batch_query': 8,
                            'order/deal_details/{order_id}': 2,
                            'order/list/order_deals': 2,
                            'planorder/list/orders': 2,
                            'stoporder/list/orders': 2,
                            'stoporder/order_details/{stop_order_id}': 2,
                            'account/risk_limit': 2,
                            'account/tiered_fee_rate': 2,
                            'position/leverage': 2,
                        },
                        'post': {
                            'position/change_margin': 2,
                            'position/change_leverage': 2,
                            'position/change_position_mode': 2,
                            'order/submit': 2,
                            'order/submit_batch': 40,
                            'order/cancel': 2,
                            'order/cancel_with_external': 2,
                            'order/cancel_all': 2,
                            'account/change_risk_level': 2,
                            'planorder/place': 2,
                            'planorder/cancel': 2,
                            'planorder/cancel_all': 2,
                            'stoporder/cancel': 2,
                            'stoporder/cancel_all': 2,
                            'stoporder/change_price': 2,
                            'stoporder/change_plan_price': 2,
                        },
                    },
                },
                'spot2': {
                    'public': {
                        'get': {
                            'market/symbols': 1,
                            'market/coin/list': 2,
                            'common/timestamp': 1,
                            'common/ping': 2,
                            'market/ticker': 1,
                            'market/depth': 1,
                            'market/deals': 1,
                            'market/kline': 1,
                            'market/api_default_symbols': 2,
                        },
                    },
                    'private': {
                        'get': {
                            'account/info': 1,
                            'order/open_orders': 1,
                            'order/list': 1,
                            'order/query': 1,
                            'order/deals': 1,
                            'order/deal_detail': 1,
                            'asset/deposit/address/list': 2,
                            'asset/deposit/list': 2,
                            'asset/address/list': 2,
                            'asset/withdraw/list': 2,
                            'asset/internal/transfer/record': 10,
                            'account/balance': 10,
                            'asset/internal/transfer/info': 10,
                            'market/api_symbols': 2,
                        },
                        'post': {
                            'order/place': 1,
                            'order/place_batch': 1,
                            'order/advanced/place_batch': 1,
                            'asset/withdraw': 2,
                            'asset/internal/transfer': 10,
                        },
                        'delete': {
                            'order/cancel': 1,
                            'order/cancel_by_symbol': 1,
                            'asset/withdraw': 2,
                        },
                    },
                },
                'broker': {
                    'private': {
                        'get': {
                            'sub-account/universalTransfer': 1,
                            'sub-account/list': 1,
                            'sub-account/apiKey': 1,
                            'capital/deposit/subAddress': 1,
                            'capital/deposit/subHisrec': 1,
                            'capital/deposit/subHisrec/getall': 1,
                        },
                        'post': {
                            'sub-account/virtualSubAccount': 1,
                            'sub-account/apiKey': 1,
                            'capital/deposit/subAddress': 1,
                            'capital/withdraw/apply': 1,
                            'sub-account/universalTransfer': 1,
                            'sub-account/futures': 1,
                        },
                        'delete': {
                            'sub-account/apiKey': 1,
                        },
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '8h': '8h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M', // spot, swap
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.002'),
                    'taker': this.parseNumber('0.002'),
                },
            },
            'options': {
                'adjustForTimeDifference': false,
                'timeDifference': 0,
                'unavailableContracts': {
                    'BTC/USDT:USDT': true,
                    'LTC/USDT:USDT': true,
                    'ETH/USDT:USDT': true,
                },
                'fetchMarkets': {
                    'types': {
                        'spot': true,
                        'swap': {
                            'linear': true,
                            'inverse': false,
                        },
                    },
                },
                'useCcxtTradeId': true,
                'timeframes': {
                    'spot': {
                        '1m': '1m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '60m',
                        '4h': '4h',
                        '1d': '1d',
                        '1w': '1W',
                        '1M': '1M',
                    },
                    'swap': {
                        '1m': 'Min1',
                        '5m': 'Min5',
                        '15m': 'Min15',
                        '30m': 'Min30',
                        '1h': 'Min60',
                        '4h': 'Hour4',
                        '8h': 'Hour8',
                        '1d': 'Day1',
                        '1w': 'Week1',
                        '1M': 'Month1',
                    },
                },
                'defaultType': 'spot',
                'defaultNetwork': 'ETH',
                'defaultNetworks': {
                    'ETH': 'ETH',
                    'USDT': 'ERC20',
                    'USDC': 'ERC20',
                    'BTC': 'BTC',
                    'LTC': 'LTC',
                },
                'networks': {
                    'ZKSYNC': 'ZKSYNCERA',
                    'TRC20': 'TRX',
                    'TON': 'TONCOIN',
                    'ARBITRUM': 'ARB',
                    'STX': 'STACKS',
                    'LUNC': 'LUNA',
                    'STARK': 'STARKNET',
                    'APT': 'APTOS',
                    'PEAQ': 'PEAQEVM',
                    'AVAXC': 'AVAX_CCHAIN',
                    'ERC20': 'ETH',
                    'ACA': 'ACALA',
                    'BEP20': 'BSC',
                    'OPTIMISM': 'OP',
                    // 'ADA': 'Cardano(ADA)',
                    // 'AE': 'AE',
                    // 'ALGO': 'Algorand(ALGO)',
                    // 'ALPH': 'Alephium(ALPH)',
                    // 'ARB': 'Arbitrum One(ARB)',
                    // 'ARBONE': 'ArbitrumOne(ARB)',
                    'ASTR': 'ASTAR',
                    // 'ATOM': 'Cosmos(ATOM)',
                    // 'AVAXC': 'Avalanche C Chain(AVAX CCHAIN)',
                    // 'AVAXX': 'Avalanche X Chain(AVAX XCHAIN)',
                    // 'AZERO': 'Aleph Zero(AZERO)',
                    // 'BCH': 'Bitcoin Cash(BCH)',
                    // 'BNCDOT': 'BNCPOLKA',
                    // 'BSV': 'Bitcoin SV(BSV)',
                    // 'BTC': 'Bitcoin(BTC)',
                    'BTM': 'BTM2',
                    // 'CHZ': 'Chiliz Legacy Chain(CHZ)',
                    // 'CHZ2': 'Chiliz Chain(CHZ2)',
                    // 'CLORE': 'Clore.ai(CLORE)',
                    'CRC20': 'CRONOS',
                    // 'DC': 'Dogechain(DC)',
                    // 'DNX': 'Dynex(DNX)',
                    // 'DOGE': 'Dogecoin(DOGE)',
                    // 'DOT': 'Polkadot(DOT)',
                    'DOT': 'DOTASSETHUB',
                    // 'DYM': 'Dymension(DYM)',
                    'ETHF': 'ETF',
                    'HRC20': 'HECO',
                    // 'KLAY': 'Klaytn(KLAY)',
                    'OASIS': 'ROSE',
                    'OKC': 'OKT',
                    'RSK': 'RBTC',
                    // 'RVN': 'Ravencoin(RVN)',
                    // 'SATOX': 'Satoxcoin(SATOX)',
                    // 'SC': 'SC',
                    // 'SCRT': 'SCRT',
                    // 'SDN': 'SDN',
                    // 'SGB': 'SGB',
                    // 'SOL': 'Solana(SOL)',
                    // 'STAR': 'STAR',
                    // 'STARK': 'Starknet(STARK)',
                    // 'STEEM': 'STEEM',
                    // 'SYS': 'SYS',
                    // 'TAO': 'Bittensor(TAO)',
                    // 'TIA': 'Celestia(TIA)',
                    // 'TOMO': 'TOMO',
                    // 'TON': 'Toncoin(TON)',
                    // 'TRC10': 'TRC10',
                    // 'TRC20': 'Tron(TRC20)',
                    // 'UGAS': 'UGAS(Ultrain)',
                    // 'VET': 'VeChain(VET)',
                    // 'VEX': 'Vexanium(VEX)',
                    // 'VSYS': 'VSYS',
                    // 'WAVES': 'WAVES',
                    // 'WAX': 'WAX',
                    // 'WEMIX': 'WEMIX',
                    // 'XCH': 'Chia(XCH)',
                    // 'XDC': 'XDC',
                    // 'XEC': 'XEC',
                    // 'XLM': 'Stellar(XLM)',
                    // 'XMR': 'Monero(XMR)',
                    // 'XNA': 'Neurai(XNA)',
                    // 'XPR': 'XPR Network',
                    // 'XRD': 'XRD',
                    // 'XRP': 'Ripple(XRP)',
                    // 'XTZ': 'XTZ',
                    // 'XVG': 'XVG',
                    // 'XYM': 'XYM',
                    // 'ZEC': 'ZEC',
                    // 'ZEN': 'ZEN',
                    // 'ZIL': 'Zilliqa(ZIL)',
                    // 'ZTG': 'ZTG',
                    // todo: uncomment below after concensus
                    // 'ALAYA': 'ATP',
                    // 'ANDUSCHAIN': 'DEB',
                    // 'ASSETMANTLE': 'MNTL',
                    // 'AXE': 'AXE',
                    // 'BITCOINHD': 'BHD',
                    // 'BITCOINVAULT': 'BTCV',
                    // 'BITKUB': 'KUB',
                    // 'BITSHARES_OLD': 'BTS',
                    // 'BITSHARES': 'NBS',
                    // 'BYTZ': 'BYTZ',
                    // 'CANTO': 'CANTO', // CANTOEVM
                    // 'CENNZ': 'CENNZ',
                    // 'CHAINX': 'PCX',
                    // 'CONCODRIUM': 'CCD',
                    // 'CONTENTVALUENETWORK': 'CVNT',
                    // 'CORTEX': 'CTXC',
                    // 'CYPHERIUM': 'CPH',
                    // 'DANGNN': 'DGC',
                    // 'DARWINIASMARTCHAIN': 'Darwinia Smart Chain',
                    // 'DHEALTH': 'DHP',
                    // 'DOGECOIN': [ 'DOGE', 'DOGECHAIN' ], // todo after unification
                    // 'DRAC': 'DRAC',
                    // 'DRAKEN': 'DRK',
                    // 'ECOCHAIN': 'ECOC',
                    // 'ELECTRAPROTOCOL': 'XEP',
                    // 'EMERALD': 'EMERALD', // sits on top of OASIS
                    // 'EVMOS': 'EVMOS', // EVMOSETH is different
                    // 'EXOSAMA': 'SAMA',
                    // 'FIBOS': 'FO',
                    // 'FILECASH': 'FIC',
                    // 'FIRMACHAIN': 'FCT',
                    // 'FIRO': 'XZC',
                    // 'FNCY': 'FNCY',
                    // 'FRUITS': 'FRTS',
                    // 'GLEEC': 'GLEEC',
                    // 'GXCHAIN': 'GXC',
                    // 'HANDSHAKE': 'HNS',
                    // 'HPB': 'HPB',
                    // 'HSHARE': 'HC',
                    // 'HUAHUA': 'HUAHUA',
                    // 'HUPAYX': 'HPX',
                    // 'INDEXCHAIN': 'IDX',
                    // 'INTCHAIN': 'INT',
                    // 'INTEGRITEE': 'TEER',
                    // 'INTERLAY': 'INTR',
                    // 'IOEX': 'IOEX',
                    // 'JUNO': 'JUNO',
                    // 'KASPA': 'KASPA',
                    // 'KEKCHAIN': 'KEKCHAIN',
                    // 'KINTSUGI': 'KINT',
                    // 'KOINOS': 'KOINOS',
                    // 'KONSTELLATION': 'DARC',
                    // 'KUJIRA': 'KUJI',
                    // 'KULUPU': 'KLP',
                    // 'LBRY': 'LBC',
                    // 'LEDGIS': 'LED',
                    // 'LIGHTNINGBITCOIN': 'LBTC',
                    // 'LINE': 'LINE',
                    // 'MDNA': 'DNA',
                    // 'MDUKEY': 'MDU',
                    // 'METAMUI': 'MMUI',
                    // 'METAVERSE_ETP': 'ETP',
                    // 'METER': 'MTRG',
                    // 'MEVERSE': 'MEVerse',
                    // 'NEWTON': 'NEW',
                    // 'NODLE': 'NODLE',
                    // 'ORIGYN': 'OGY',
                    // 'PAC': 'PAC',
                    // 'PASTEL': 'PSL',
                    // 'PHALA': 'Khala',
                    // 'PLEX': 'PLEX',
                    // 'PMG': 'PMG',
                    // 'POINT': 'POINT', // POINTEVM is different
                    // 'PROOFOFMEMES': 'POM',
                    // 'PROXIMAX': 'XPX',
                    // 'RCHAIN': 'REV',
                    // 'REBUS': 'REBUS', // REBUSEVM is different
                    // 'RIZON': 'ATOLO',
                    // 'SENTINEL': 'DVPN',
                    // 'SERO': 'SERO',
                    // 'TECHPAY': 'TPC',
                    // 'TELOSCOIN': 'TLOS', // todo
                    // 'TERRA': 'LUNA2',
                    // 'TERRACLASSIC': 'LUNC',
                    // 'TLOS': 'TELOS', // todo
                    // 'TOMAINFO': 'TON',
                    // 'TONGTONG': 'TTC',
                    // 'TURTLECOIN': 'TRTL',
                    // 'ULORD': 'UT',
                    // 'ULTRAIN': 'UGAS',
                    // 'UMEE': 'UMEE',
                    // 'VDIMENSION': 'VOLLAR',
                    // 'VEXANIUM': 'VEX',
                    // 'VNT': 'VNT',
                    // 'WAYKICHAIN': 'WICC',
                    // 'WHITECOIN': 'XWC',
                    // 'WITNET': 'WIT',
                    // 'XDAI': 'XDAI',
                    // 'XX': 'XX',
                    // 'YAS': 'YAS',
                    // 'ZENITH': 'ZENITH',
                    // 'ZKSYNC': 'ZKSYNC',
                    // // 'BAJUN': '',
                    // OKB <> OKT (for usdt it's exception) for OKC, PMEER, FLARE, STRD, ZEL, FUND, "NONE", CRING, FREETON, QTZ  (probably unique network is meant), HT, BSC(RACAV1), BSC(RACAV2), AMBROSUS, BAJUN, NOM. their individual info is at https://www.mexc.com/api/platform/asset/spot/{COINNAME}
                },
                'networksById': {
                    'BNB Smart Chain(BEP20-RACAV1)': 'BSC',
                    'BNB Smart Chain(BEP20-RACAV2)': 'BSC',
                    'BNB Smart Chain(BEP20)': 'BSC',
                    'Ethereum(ERC20)': 'ERC20',
                    // TODO: uncomment below after deciding unified name
                    // 'PEPE COIN BSC':
                    // 'SMART BLOCKCHAIN':
                    // 'f(x)Core':
                    // 'Syscoin Rollux':
                    // 'Syscoin UTXO':
                    // 'zkSync Era':
                    // 'zkSync Lite':
                    // 'Darwinia Smart Chain':
                    // 'Arbitrum One(ARB-Bridged)':
                    // 'Optimism(OP-Bridged)':
                    // 'Polygon(MATIC-Bridged)':
                },
                'recvWindow': 5 * 1000,
                'maxTimeTillEnd': 90 * 86400 * 1000 - 1,
                'broker': 'CCXT',
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': {
                            'last': false,
                            'mark': false,
                            'index': false,
                        },
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': false,
                        },
                        'hedged': true,
                        'trailing': false,
                        'leverage': true,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': {
                        'max': 20,
                    },
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 30,
                        'untilDays': undefined,
                        'symbolRequired': true,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOpenOrders': {
                        'marginMode': true,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': 7,
                        'untilDays': 7,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchClosedOrders': {
                        'marginMode': true,
                        'limit': 1000,
                        'daysBack': 7,
                        'daysBackCanceled': 7,
                        'untilDays': 7,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': true,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                    'fetchCurrencies': {
                        'private': true,
                    },
                },
                'forDerivs': {
                    'extends': 'default',
                    'createOrder': {
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': true,
                        },
                        'triggerDirection': true,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'hedged': true,
                        'leverage': true,
                        'marketBuyByCost': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90,
                        'untilDays': 90,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90,
                        'untilDays': 90,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 90,
                        'daysBackCanceled': undefined,
                        'untilDays': 90,
                        'trigger': true,
                        'trailing': false,
                    },
                    'fetchOHLCV': {
                        'limit': 2000,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forDerivs',
                    },
                    'inverse': {
                        'extends': 'forDerivs',
                    },
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {
                'BEYONDPROTOCOL': 'BEYOND',
                'BIFI': 'BIFIF',
                'BYN': 'BEYONDFI',
                'COFI': 'COFIX',
                'DFI': 'DFISTARTER',
                'DFT': 'DFUTURE',
                'DRK': 'DRK',
                'EGC': 'EGORASCREDIT',
                'FLUX1': 'FLUX',
                'FLUX': 'FLUX1',
                'FREE': 'FREEROSSDAO',
                'GAS': 'GASDAO',
                'GASNEO': 'GAS',
                'GMT': 'GMTTOKEN',
                'STEPN': 'GMT',
                'HERO': 'STEPHERO',
                'MIMO': 'MIMOSA',
                'PROS': 'PROSFINANCE',
                'SIN': 'SINCITYTOKEN',
                'SOUL': 'SOULSWAP',
                'XBT': 'XBT', // restore original mapping
            },
            'exceptions': {
                'exact': {
                    // until mexc migrates fully to v3, it might be worth to note the version & market aside errors, not easily remove obsolete version's exceptions in future
                    '-1128': errors.BadRequest,
                    '-2011': errors.BadRequest,
                    '-1121': errors.BadSymbol,
                    '10101': errors.InsufficientFunds,
                    '2009': errors.InvalidOrder,
                    '2011': errors.BadRequest,
                    '30004': errors.InsufficientFunds,
                    '33333': errors.BadRequest,
                    '44444': errors.BadRequest,
                    '1002': errors.InvalidOrder,
                    '30019': errors.BadRequest,
                    '30005': errors.InvalidOrder,
                    '2003': errors.InvalidOrder,
                    '2005': errors.InsufficientFunds,
                    '400': errors.BadRequest,
                    // '500': OnMaintenance, // {"code": 500,"message": "Under maintenance, please try again later","announcement": "https://www.mexc.com/support/articles/17827791510263"}
                    '600': errors.BadRequest,
                    '70011': errors.PermissionDenied,
                    '88004': errors.InsufficientFunds,
                    '88009': errors.ExchangeError,
                    '88013': errors.InvalidOrder,
                    '88015': errors.InsufficientFunds,
                    '700003': errors.InvalidNonce,
                    '26': errors.ExchangeError,
                    '602': errors.AuthenticationError,
                    '10001': errors.AuthenticationError,
                    '10007': errors.BadSymbol,
                    '10015': errors.BadRequest,
                    '10072': errors.BadRequest,
                    '10073': errors.BadRequest,
                    '10095': errors.InvalidOrder,
                    '10096': errors.InvalidOrder,
                    '10097': errors.InvalidOrder,
                    '10098': errors.InvalidOrder,
                    '10099': errors.BadRequest,
                    '10100': errors.BadRequest,
                    '10102': errors.InvalidOrder,
                    '10103': errors.ExchangeError,
                    '10200': errors.BadRequest,
                    '10201': errors.BadRequest,
                    '10202': errors.BadRequest,
                    '10206': errors.BadRequest,
                    '10211': errors.BadRequest,
                    '10212': errors.BadRequest,
                    '10216': errors.ExchangeError,
                    '10219': errors.ExchangeError,
                    '10222': errors.BadRequest,
                    '10232': errors.BadRequest,
                    '10259': errors.ExchangeError,
                    '10265': errors.ExchangeError,
                    '10268': errors.BadRequest,
                    '20001': errors.ExchangeError,
                    '20002': errors.ExchangeError,
                    '22222': errors.BadRequest,
                    '30000': errors.ExchangeError,
                    '30001': errors.InvalidOrder,
                    '30002': errors.InvalidOrder,
                    '30003': errors.InvalidOrder,
                    '30010': errors.InvalidOrder,
                    '30014': errors.InvalidOrder,
                    '30016': errors.InvalidOrder,
                    '30018': errors.AccountSuspended,
                    '30020': errors.AuthenticationError,
                    '30021': errors.BadRequest,
                    '30025': errors.InvalidOrder,
                    '30026': errors.BadRequest,
                    '30027': errors.InvalidOrder,
                    '30028': errors.InvalidOrder,
                    '30029': errors.InvalidOrder,
                    '30032': errors.InvalidOrder,
                    '30041': errors.InvalidOrder,
                    '60005': errors.ExchangeError,
                    '700001': errors.AuthenticationError,
                    '700002': errors.AuthenticationError,
                    '700004': errors.BadRequest,
                    '700005': errors.InvalidNonce,
                    '700006': errors.BadRequest,
                    '700007': errors.AuthenticationError,
                    '700008': errors.BadRequest,
                    '700013': errors.AuthenticationError,
                    '730001': errors.BadRequest,
                    '730002': errors.BadRequest,
                    '730000': errors.ExchangeError,
                    '730003': errors.ExchangeError,
                    '730100': errors.ExchangeError,
                    '730600': errors.BadRequest,
                    '730601': errors.BadRequest,
                    '730602': errors.BadRequest,
                    '730700': errors.BadRequest,
                    '730701': errors.BadRequest,
                    '730702': errors.BadRequest,
                    '730703': errors.BadRequest,
                    '730704': errors.BadRequest,
                    '730705': errors.BadRequest,
                    '730706': errors.BadRequest,
                    '730707': errors.BadRequest,
                    '730101': errors.BadRequest,
                    '140001': errors.BadRequest,
                    '140002': errors.AuthenticationError, // sub account is forbidden
                },
                'broad': {
                    'Order quantity error, please try to modify.': errors.BadRequest,
                    'Combination of optional parameters invalid': errors.BadRequest,
                    'api market order is disabled': errors.BadRequest,
                    'Contract not allow place order!': errors.InvalidOrder,
                    'Oversold': errors.InsufficientFunds,
                    'Insufficient position': errors.InsufficientFunds,
                    'Insufficient balance!': errors.InsufficientFunds,
                    'Bid price is great than max allow price': errors.InvalidOrder,
                    'Invalid symbol.': errors.BadSymbol,
                    'Param error!': errors.BadRequest,
                    'maintenance': errors.OnMaintenance, // {"code": 500,"message": "Under maintenance, please try again later","announcement": "https://www.mexc.com/support/articles/17827791510263"}
                },
            },
        });
    }
    /**
     * @method
     * @name mexc#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#test-connectivity
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    async fetchStatus(params = {}) {
        const [marketType, query] = this.handleMarketTypeAndParams('fetchStatus', undefined, params);
        let response = undefined;
        let status = undefined;
        let updated = undefined;
        if (marketType === 'spot') {
            response = await this.spotPublicGetPing(query);
            //
            //     {}
            //
            const keys = Object.keys(response);
            const length = keys.length;
            status = length ? this.json(response) : 'ok';
        }
        else if (marketType === 'swap') {
            response = await this.contractPublicGetPing(query);
            //
            //     {"success":true,"code":"0","data":"1648124374985"}
            //
            status = this.safeValue(response, 'success') ? 'ok' : this.json(response);
            updated = this.safeInteger(response, 'data');
        }
        return {
            'status': status,
            'updated': updated,
            'url': undefined,
            'eta': undefined,
            'info': response,
        };
    }
    /**
     * @method
     * @name mexc#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#check-server-time
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTime', undefined, params);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.spotPublicGetTime(query);
            //
            //     {"serverTime": "1647519277579"}
            //
            return this.safeInteger(response, 'serverTime');
        }
        else if (marketType === 'swap') {
            response = await this.contractPublicGetPing(query);
            //
            //     {"success":true,"code":"0","data":"1648124374985"}
            //
            return this.safeInteger(response, 'data');
        }
        return undefined;
    }
    /**
     * @method
     * @name mexc#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        // this endpoint requires authentication
        // while fetchCurrencies is a public API method by design
        // therefore we check the keys here
        // and fallback to generating the currencies from the markets
        if (!this.checkRequiredCredentials(false)) {
            return {};
        }
        const response = await this.spotPrivateGetCapitalConfigGetall(params);
        //
        // {
        //     "coin": "QANX",
        //     "name": "QANplatform",
        //     "networkList": [
        //       {
        //         "coin": "QANX",
        //         "depositDesc": null,
        //         "depositEnable": true,
        //         "minConfirm": "0",
        //         "name": "QANplatform",
        //         "network": "BEP20(BSC)",
        //         "withdrawEnable": false,
        //         "withdrawFee": "42.000000000000000000",
        //         "withdrawIntegerMultiple": null,
        //         "withdrawMax": "24000000.000000000000000000",
        //         "withdrawMin": "20.000000000000000000",
        //         "sameAddress": false,
        //         "contract": "0xAAA7A10a8ee237ea61E8AC46C50A8Db8bCC1baaa"
        //       },
        //       {
        //         "coin": "QANX",
        //         "depositDesc": null,
        //         "depositEnable": true,
        //         "minConfirm": "0",
        //         "name": "QANplatform",
        //         "network": "ERC20",
        //         "withdrawEnable": true,
        //         "withdrawFee": "2732.000000000000000000",
        //         "withdrawIntegerMultiple": null,
        //         "withdrawMax": "24000000.000000000000000000",
        //         "withdrawMin": "240.000000000000000000",
        //         "sameAddress": false,
        //         "contract": "0xAAA7A10a8ee237ea61E8AC46C50A8Db8bCC1baaa"
        //       }
        //     ]
        //   }
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString(currency, 'coin');
            const code = this.safeCurrencyCode(id);
            const networks = {};
            const chains = this.safeValue(currency, 'networkList', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString2(chain, 'netWork', 'network');
                const network = this.networkIdToCode(networkId);
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': undefined,
                    'deposit': this.safeBool(chain, 'depositEnable', false),
                    'withdraw': this.safeBool(chain, 'withdrawEnable', false),
                    'fee': this.safeNumber(chain, 'withdrawFee'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.safeString(chain, 'withdrawMin'),
                            'max': this.safeString(chain, 'withdrawMax'),
                        },
                    },
                    'contract': this.safeString(chain, 'contract'),
                };
            }
            result[code] = this.safeCurrencyStructure({
                'info': currency,
                'id': id,
                'code': code,
                'name': this.safeString(currency, 'name'),
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'type': 'crypto',
                'networks': networks,
            });
        }
        return result;
    }
    /**
     * @method
     * @name mexc#fetchMarkets
     * @description retrieves data on all markets for mexc
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#exchange-information
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        if (this.options['adjustForTimeDifference']) {
            await this.loadTimeDifference();
        }
        const spotMarketPromise = this.fetchSpotMarkets(params);
        const swapMarketPromise = this.fetchSwapMarkets(params);
        const [spotMarket, swapMarket] = await Promise.all([spotMarketPromise, swapMarketPromise]);
        return this.arrayConcat(spotMarket, swapMarket);
    }
    /**
     * @ignore
     * @method
     * @name mexc#fetchMarkets
     * @description retrieves data on all spot markets for mexc
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchSpotMarkets(params = {}) {
        const response = await this.spotPublicGetExchangeInfo(params);
        //
        //     {
        //         "timezone": "CST",
        //         "serverTime": 1647521860402,
        //         "rateLimits": [],
        //         "exchangeFilters": [],
        //         "symbols": [
        //           {
        //                "symbol": "OGNUSDT",
        //                "status": "1",
        //                "baseAsset": "OGN",
        //                "baseAssetPrecision": "2",
        //                "quoteAsset": "USDT",
        //                "quoteAssetPrecision": "4",
        //                "orderTypes": [
        //                    "LIMIT",
        //                    "LIMIT_MAKER"
        //                ],
        //                "baseCommissionPrecision": "2",
        //                "quoteCommissionPrecision": "4",
        //                "quoteOrderQtyMarketAllowed": false,
        //                "isSpotTradingAllowed": true,
        //                "isMarginTradingAllowed": true,
        //                "permissions": [
        //                    "SPOT",
        //                    "MARGIN"
        //                ],
        //                "filters": [],
        //                "baseSizePrecision": "0.01", // this turned out to be a minimum base amount for order
        //                "maxQuoteAmount": "5000000",
        //                "makerCommission": "0.002",
        //                "takerCommission": "0.002"
        //                "quoteAmountPrecision": "5", // this turned out to be a minimum cost amount for order
        //                "quotePrecision": "4", // deprecated in favor of 'quoteAssetPrecision' ( https://dev.binance.vision/t/what-is-the-difference-between-quoteprecision-and-quoteassetprecision/4333 )
        //                // note, "icebergAllowed" & "ocoAllowed" fields were recently removed
        //            },
        //         ]
        //     }
        //
        // Notes:
        // - 'quoteAssetPrecision' & 'baseAssetPrecision' are not currency's real blockchain precision (to view currency's actual individual precision, refer to fetchCurrencies() method).
        //
        const data = this.safeValue(response, 'symbols', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseAsset');
            const quoteId = this.safeString(market, 'quoteAsset');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const status = this.safeString(market, 'status');
            const isSpotTradingAllowed = this.safeValue(market, 'isSpotTradingAllowed');
            let active = false;
            if ((status === '1') && (isSpotTradingAllowed)) {
                active = true;
            }
            const isMarginTradingAllowed = this.safeValue(market, 'isMarginTradingAllowed');
            const makerCommission = this.safeNumber(market, 'makerCommission');
            const takerCommission = this.safeNumber(market, 'takerCommission');
            const maxQuoteAmount = this.safeNumber(market, 'maxQuoteAmount');
            result.push({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': isMarginTradingAllowed,
                'swap': false,
                'future': false,
                'option': false,
                'active': active,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': takerCommission,
                'maker': makerCommission,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'baseAssetPrecision'))),
                    'price': this.parseNumber(this.parsePrecision(this.safeString(market, 'quoteAssetPrecision'))),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'baseSizePrecision'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber(market, 'quoteAmountPrecision'),
                        'max': maxQuoteAmount,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }
    /**
     * @ignore
     * @method
     * @name mexc#fetchMarkets
     * @description retrieves data on all swap markets for mexc
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchSwapMarkets(params = {}) {
        const currentRl = this.rateLimit;
        this.setProperty(this, 'rateLimit', 10); // see comment: https://github.com/ccxt/ccxt/pull/23698
        const response = await this.contractPublicGetDetail(params);
        this.setProperty(this, 'rateLimit', currentRl);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol":"BTC_USDT",
        //                 "displayName":"BTC_USDT永续",
        //                 "displayNameEn":"BTC_USDT SWAP",
        //                 "positionOpenType":3,
        //                 "baseCoin":"BTC",
        //                 "quoteCoin":"USDT",
        //                 "settleCoin":"USDT",
        //                 "contractSize":0.0001,
        //                 "minLeverage":1,
        //                 "maxLeverage":125,
        //                 "priceScale":2, // seems useless atm, as it's just how UI shows the price, i.e. 29583.50 for BTC/USDT:USDT, while price ticksize is 0.5
        //                 "volScale":0, // probably: contract amount precision
        //                 "amountScale":4, // probably: quote currency precision
        //                 "priceUnit":0.5, // price tick size
        //                 "volUnit":1, // probably: contract tick size
        //                 "minVol":1,
        //                 "maxVol":1000000,
        //                 "bidLimitPriceRate":0.1,
        //                 "askLimitPriceRate":0.1,
        //                 "takerFeeRate":0.0006,
        //                 "makerFeeRate":0.0002,
        //                 "maintenanceMarginRate":0.004,
        //                 "initialMarginRate":0.008,
        //                 "riskBaseVol":10000,
        //                 "riskIncrVol":200000,
        //                 "riskIncrMmr":0.004,
        //                 "riskIncrImr":0.004,
        //                 "riskLevelLimit":5,
        //                 "priceCoefficientVariation":0.1,
        //                 "indexOrigin":["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state":0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew":false,
        //                 "isHot":true,
        //                 "isHidden":false
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue(response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString(market, 'symbol');
            const baseId = this.safeString(market, 'baseCoin');
            const quoteId = this.safeString(market, 'quoteCoin');
            const settleId = this.safeString(market, 'settleCoin');
            const base = this.safeCurrencyCode(baseId);
            const quote = this.safeCurrencyCode(quoteId);
            const settle = this.safeCurrencyCode(settleId);
            const state = this.safeString(market, 'state');
            const isLinear = quote === settle;
            result.push({
                'id': id,
                'symbol': base + '/' + quote + ':' + settle,
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
                'active': (state === '0'),
                'contract': true,
                'linear': isLinear,
                'inverse': !isLinear,
                'taker': this.safeNumber(market, 'takerFeeRate'),
                'maker': this.safeNumber(market, 'makerFeeRate'),
                'contractSize': this.safeNumber(market, 'contractSize'),
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber(market, 'volUnit'),
                    'price': this.safeNumber(market, 'priceUnit'),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber(market, 'minLeverage'),
                        'max': this.safeNumber(market, 'maxLeverage'),
                    },
                    'amount': {
                        'min': this.safeNumber(market, 'minVol'),
                        'max': this.safeNumber(market, 'maxVol'),
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
    /**
     * @method
     * @name mexc#fetchOrderBook
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#order-book
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-s-depth-information
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
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
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let orderbook = undefined;
        if (market['spot']) {
            const response = await this.spotPublicGetDepth(this.extend(request, params));
            //
            //     {
            //         "lastUpdateId": "744267132",
            //         "bids": [
            //             ["40838.50","0.387864"],
            //             ["40837.95","0.008400"],
            //         ],
            //         "asks": [
            //             ["40838.61","6.544908"],
            //             ["40838.88","0.498000"],
            //         ]
            //     }
            //
            const spotTimestamp = this.safeInteger(response, 'timestamp');
            orderbook = this.parseOrderBook(response, symbol, spotTimestamp);
            orderbook['nonce'] = this.safeInteger(response, 'lastUpdateId');
        }
        else if (market['swap']) {
            const response = await this.contractPublicGetDepthSymbol(this.extend(request, params));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "asks":[
            //                 [3445.72,48379,1],
            //                 [3445.75,34994,1],
            //             ],
            //             "bids":[
            //                 [3445.55,44081,1],
            //                 [3445.51,24857,1],
            //             ],
            //             "version":2827730444,
            //             "timestamp":1634117846232
            //         }
            //     }
            //
            const data = this.safeValue(response, 'data');
            const timestamp = this.safeInteger(data, 'timestamp');
            orderbook = this.parseOrderBook(data, symbol, timestamp);
            orderbook['nonce'] = this.safeInteger(data, 'version');
        }
        return orderbook;
    }
    parseBidAsk(bidask, priceKey = 0, amountKey = 1, countOrIdKey = 2) {
        const countKey = 2;
        const price = this.safeNumber(bidask, priceKey);
        const amount = this.safeNumber(bidask, amountKey);
        const count = this.safeNumber(bidask, countKey);
        if (count !== undefined) {
            return [price, amount, count];
        }
        return [price, amount];
    }
    /**
     * @method
     * @name mexc#fetchTrades
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#recent-trades-list
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#compressed-aggregate-trades-list
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-transaction-data
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *spot only* *since must be defined* the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let trades = undefined;
        if (market['spot']) {
            const until = this.safeIntegerN(params, ['endTime', 'until']);
            if (since !== undefined) {
                request['startTime'] = since;
                if (until === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' fetchTrades() requires an until parameter when since is provided');
                }
            }
            if (until !== undefined) {
                if (since === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' fetchTrades() requires a since parameter when until is provided');
                }
                request['endTime'] = until;
            }
            let method = this.safeString(this.options, 'fetchTradesMethod', 'spotPublicGetAggTrades');
            method = this.safeString(params, 'method', method); // AggTrades, HistoricalTrades, Trades
            params = this.omit(params, ['method']);
            if (method === 'spotPublicGetAggTrades') {
                trades = await this.spotPublicGetAggTrades(this.extend(request, params));
            }
            else if (method === 'spotPublicGetHistoricalTrades') {
                trades = await this.spotPublicGetHistoricalTrades(this.extend(request, params));
            }
            else if (method === 'spotPublicGetTrades') {
                trades = await this.spotPublicGetTrades(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchTrades() not support this method');
            }
            //
            //     /trades, /historicalTrades
            //
            //     [
            //         {
            //             "id": null,
            //             "price": "40798.94",
            //             "qty": "0.000508",
            //             "quoteQty": "20.72586152",
            //             "time": "1647546934374",
            //             "isBuyerMaker": true,
            //             "isBestMatch": true
            //         },
            //     ]
            //
            //     /aggrTrades
            //
            //     [
            //         {
            //           "a": null,
            //           "f": null,
            //           "l": null,
            //           "p": "40679",
            //           "q": "0.001309",
            //           "T": 1647551328000,
            //           "m": true,
            //           "M": true
            //         },
            //     ]
            //
        }
        else if (market['swap']) {
            const response = await this.contractPublicGetDealsSymbol(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "code": 0,
            //         "data": [
            //             {
            //                 "p": 31199,
            //                 "v": 18,
            //                 "T": 1,
            //                 "O": 3,
            //                 "M": 2,
            //                 "t": 1609831235985
            //             },
            //         ]
            //     }
            //
            trades = this.safeValue(response, 'data');
        }
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        let id = undefined;
        let timestamp = undefined;
        let orderId = undefined;
        let symbol = undefined;
        let fee = undefined;
        const type = undefined;
        let side = undefined;
        let takerOrMaker = undefined;
        let priceString = undefined;
        let amountString = undefined;
        let costString = undefined;
        // if swap
        if ('v' in trade) {
            //
            // swap: fetchTrades
            //
            //     {
            //         "p": 31199,
            //         "v": 18,
            //         "T": 1,
            //         "O": 3,
            //         "M": 2,
            //         "t": 1609831235985
            //     }
            //
            timestamp = this.safeInteger(trade, 't');
            market = this.safeMarket(undefined, market);
            symbol = market['symbol'];
            priceString = this.safeString(trade, 'p');
            amountString = this.safeString(trade, 'v');
            side = this.parseOrderSide(this.safeString(trade, 'T'));
            takerOrMaker = 'taker';
        }
        else {
            //
            // spot: fetchTrades (for aggTrades)
            //
            //         {
            //             "a": null,
            //             "f": null,
            //             "l": null,
            //             "p": "40679",
            //             "q": "0.001309",
            //             "T": 1647551328000,
            //             "m": true,
            //             "M": true
            //         }
            //
            // spot: fetchMyTrades, fetchOrderTrades
            //
            //         {
            //             "symbol": "BTCUSDT",
            //             "id": "133948532984922113",
            //             "orderId": "133948532531949568",
            //             "orderListId": "-1",
            //             "price": "41995.51",
            //             "qty": "0.0002",
            //             "quoteQty": "8.399102",
            //             "commission": "0.016798204",
            //             "commissionAsset": "USDT",
            //             "time": "1647718055000",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "isBestMatch": true
            //         }
            //
            // swap: fetchMyTrades, fetchOrderTrades
            //
            //         {
            //             "id": "299444585",
            //             "symbol": "STEPN_USDT",
            //             "side": "1",
            //             "vol": "1",
            //             "price": "2.45455",
            //             "feeCurrency": "USDT",
            //             "fee": "0.00147273",
            //             "timestamp": "1648924557000",
            //             "profit": "0",
            //             "category": "1",
            //             "orderId": "265307163526610432",
            //             "positionMode": "1",
            //             "taker": true
            //         }
            //
            const marketId = this.safeString(trade, 'symbol');
            market = this.safeMarket(marketId, market);
            symbol = market['symbol'];
            id = this.safeString2(trade, 'id', 'a');
            priceString = this.safeString2(trade, 'price', 'p');
            orderId = this.safeString(trade, 'orderId');
            // if swap
            if ('positionMode' in trade) {
                timestamp = this.safeInteger(trade, 'timestamp');
                amountString = this.safeString(trade, 'vol');
                side = this.parseOrderSide(this.safeString(trade, 'side'));
                fee = {
                    'cost': this.safeString(trade, 'fee'),
                    'currency': this.safeCurrencyCode(this.safeString(trade, 'feeCurrency')),
                };
                takerOrMaker = this.safeValue(trade, 'taker') ? 'taker' : 'maker';
            }
            else {
                timestamp = this.safeInteger2(trade, 'time', 'T');
                amountString = this.safeString2(trade, 'qty', 'q');
                costString = this.safeString(trade, 'quoteQty');
                const isBuyer = this.safeValue(trade, 'isBuyer');
                const isMaker = this.safeValue(trade, 'isMaker');
                const buyerMaker = this.safeValue2(trade, 'isBuyerMaker', 'm');
                if (isMaker !== undefined) {
                    takerOrMaker = isMaker ? 'maker' : 'taker';
                }
                if (isBuyer !== undefined) {
                    side = isBuyer ? 'buy' : 'sell';
                }
                if (buyerMaker !== undefined) {
                    side = buyerMaker ? 'sell' : 'buy';
                    takerOrMaker = 'taker';
                }
                const feeAsset = this.safeString(trade, 'commissionAsset');
                if (feeAsset !== undefined) {
                    fee = {
                        'cost': this.safeString(trade, 'commission'),
                        'currency': this.safeCurrencyCode(feeAsset),
                    };
                }
            }
        }
        if (id === undefined && this.safeBool(this.options, 'useCcxtTradeId', true)) {
            id = this.createCcxtTradeId(timestamp, side, amountString, priceString, takerOrMaker);
        }
        return this.safeTrade({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': costString,
            'fee': fee,
            'info': trade,
        }, market);
    }
    /**
     * @method
     * @name mexc#fetchOHLCV
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#kline-candlestick-data
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const maxLimit = (market['spot']) ? 1000 : 2000;
        let paginate = false;
        [paginate, params] = this.handleOptionAndParams(params, 'fetchOHLCV', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit);
        }
        const options = this.safeValue(this.options, 'timeframes', {});
        const timeframes = this.safeValue(options, market['type'], {});
        const timeframeValue = this.safeString(timeframes, timeframe);
        const duration = this.parseTimeframe(timeframe) * 1000;
        const request = {
            'symbol': market['id'],
            'interval': timeframeValue,
        };
        let candles = undefined;
        if (market['spot']) {
            const until = this.safeIntegerN(params, ['until', 'endTime']);
            if (since !== undefined) {
                request['startTime'] = since;
                if (until === undefined) {
                    // we have to calculate it assuming we can get at most 2000 entries per request
                    const end = this.sum(since, maxLimit * duration);
                    const now = this.milliseconds();
                    request['endTime'] = Math.min(end, now);
                }
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (until !== undefined) {
                params = this.omit(params, ['until']);
                request['endTime'] = until;
            }
            const response = await this.spotPublicGetKlines(this.extend(request, params));
            //
            //     [
            //       [
            //         1640804880000,
            //         "47482.36",
            //         "47482.36",
            //         "47416.57",
            //         "47436.1",
            //         "3.550717",
            //         1640804940000,
            //         "168387.3"
            //       ],
            //     ]
            //
            candles = response;
        }
        else if (market['swap']) {
            const until = this.safeIntegerProductN(params, ['until', 'endTime'], 0.001);
            if (since !== undefined) {
                request['start'] = this.parseToInt(since / 1000);
            }
            if (until !== undefined) {
                params = this.omit(params, ['until']);
                request['end'] = until;
            }
            const priceType = this.safeString(params, 'price', 'default');
            params = this.omit(params, 'price');
            let response = undefined;
            if (priceType === 'default') {
                response = await this.contractPublicGetKlineSymbol(this.extend(request, params));
            }
            else if (priceType === 'index') {
                response = await this.contractPublicGetKlineIndexPriceSymbol(this.extend(request, params));
            }
            else if (priceType === 'mark') {
                response = await this.contractPublicGetKlineFairPriceSymbol(this.extend(request, params));
            }
            else {
                throw new errors.NotSupported(this.id + ' fetchOHLCV() not support this price type, [default, index, mark]');
            }
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "time":[1634052300,1634052360,1634052420],
            //             "open":[3492.2,3491.3,3495.65],
            //             "close":[3491.3,3495.65,3495.2],
            //             "high":[3495.85,3496.55,3499.4],
            //             "low":[3491.15,3490.9,3494.2],
            //             "vol":[1740.0,351.0,314.0],
            //             "amount":[60793.623,12260.4885,10983.1375],
            //         }
            //     }
            //
            const data = this.safeValue(response, 'data');
            candles = this.convertTradingViewToOHLCV(data, 'time', 'open', 'high', 'low', 'close', 'vol');
        }
        return this.parseOHLCVs(candles, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
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
     * @name mexc#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-trend-data
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let isSingularMarket = false;
        if (symbols !== undefined) {
            const length = symbols.length;
            isSingularMarket = length === 1;
            const firstSymbol = this.safeString(symbols, 0);
            market = this.market(firstSymbol);
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTickers', market, params);
        let tickers = undefined;
        if (isSingularMarket) {
            request['symbol'] = market['id'];
        }
        if (marketType === 'spot') {
            tickers = await this.spotPublicGetTicker24hr(this.extend(request, query));
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "priceChange": "184.34",
            //             "priceChangePercent": "0.00400048",
            //             "prevClosePrice": "46079.37",
            //             "lastPrice": "46263.71",
            //             "lastQty": "",
            //             "bidPrice": "46260.38",
            //             "bidQty": "",
            //             "askPrice": "46260.41",
            //             "askQty": "",
            //             "openPrice": "46079.37",
            //             "highPrice": "47550.01",
            //             "lowPrice": "45555.5",
            //             "volume": "1732.461487",
            //             "quoteVolume": null,
            //             "openTime": 1641349500000,
            //             "closeTime": 1641349582808,
            //             "count": null
            //         }
            //     ]
            //
        }
        else if (marketType === 'swap') {
            const response = await this.contractPublicGetTicker(this.extend(request, query));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":[
            //             {
            //                 "symbol":"ETH_USDT",
            //                 "lastPrice":3581.3,
            //                 "bid1":3581.25,
            //                 "ask1":3581.5,
            //                 "volume24":4045530,
            //                 "amount24":141331823.5755,
            //                 "holdVol":5832946,
            //                 "lower24Price":3413.4,
            //                 "high24Price":3588.7,
            //                 "riseFallRate":0.0275,
            //                 "riseFallValue":95.95,
            //                 "indexPrice":3580.7852,
            //                 "fairPrice":3581.08,
            //                 "fundingRate":0.000063,
            //                 "maxBidPrice":3938.85,
            //                 "minAskPrice":3222.7,
            //                 "timestamp":1634162885016
            //             },
            //         ]
            //     }
            //
            tickers = this.safeValue(response, 'data', []);
        }
        // when it's single symbol request, the returned structure is different (singular object) for both spot & swap, thus we need to wrap inside array
        if (isSingularMarket) {
            tickers = [tickers];
        }
        return this.parseTickers(tickers, symbols);
    }
    /**
     * @method
     * @name mexc#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#24hr-ticker-price-change-statistics
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-trend-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTicker', market, params);
        let ticker = undefined;
        const request = {
            'symbol': market['id'],
        };
        if (marketType === 'spot') {
            ticker = await this.spotPublicGetTicker24hr(this.extend(request, query));
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "priceChange": "184.34",
            //         "priceChangePercent": "0.00400048",
            //         "prevClosePrice": "46079.37",
            //         "lastPrice": "46263.71",
            //         "lastQty": "",
            //         "bidPrice": "46260.38",
            //         "bidQty": "",
            //         "askPrice": "46260.41",
            //         "askQty": "",
            //         "openPrice": "46079.37",
            //         "highPrice": "47550.01",
            //         "lowPrice": "45555.5",
            //         "volume": "1732.461487",
            //         "quoteVolume": null,
            //         "openTime": 1641349500000,
            //         "closeTime": 1641349582808,
            //         "count": null
            //     }
            //
        }
        else if (marketType === 'swap') {
            const response = await this.contractPublicGetTicker(this.extend(request, query));
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":{
            //             "symbol":"ETH_USDT",
            //             "lastPrice":3581.3,
            //             "bid1":3581.25,
            //             "ask1":3581.5,
            //             "volume24":4045530,
            //             "amount24":141331823.5755,
            //             "holdVol":5832946,
            //             "lower24Price":3413.4,
            //             "high24Price":3588.7,
            //             "riseFallRate":0.0275,
            //             "riseFallValue":95.95,
            //             "indexPrice":3580.7852,
            //             "fairPrice":3581.08,
            //             "fundingRate":0.000063,
            //             "maxBidPrice":3938.85,
            //             "minAskPrice":3222.7,
            //             "timestamp":1634162885016
            //         }
            //     }
            //
            ticker = this.safeValue(response, 'data', {});
        }
        // when it's single symbol request, the returned structure is different (singular object) for both spot & swap, thus we need to wrap inside array
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        let timestamp = undefined;
        let bid = undefined;
        let ask = undefined;
        let bidVolume = undefined;
        let askVolume = undefined;
        let baseVolume = undefined;
        let quoteVolume = undefined;
        let open = undefined;
        let high = undefined;
        let low = undefined;
        let changePcnt = undefined;
        let changeValue = undefined;
        let prevClose = undefined;
        const isSwap = this.safeValue(market, 'swap');
        // if swap
        if (isSwap || ('timestamp' in ticker)) {
            //
            //     {
            //         "symbol": "ETH_USDT",
            //         "lastPrice": 3581.3,
            //         "bid1": 3581.25,
            //         "ask1": 3581.5,
            //         "volume24": 4045530,
            //         "amount24": 141331823.5755,
            //         "holdVol": 5832946,
            //         "lower24Price": 3413.4,
            //         "high24Price": 3588.7,
            //         "riseFallRate": 0.0275,
            //         "riseFallValue": 95.95,
            //         "indexPrice": 3580.7852,
            //         "fairPrice": 3581.08,
            //         "fundingRate": 0.000063,
            //         "maxBidPrice": 3938.85,
            //         "minAskPrice": 3222.7,
            //         "timestamp": 1634162885016
            //     }
            //
            timestamp = this.safeInteger(ticker, 'timestamp');
            bid = this.safeString(ticker, 'bid1');
            ask = this.safeString(ticker, 'ask1');
            baseVolume = this.safeString(ticker, 'volume24');
            quoteVolume = this.safeString(ticker, 'amount24');
            high = this.safeString(ticker, 'high24Price');
            low = this.safeString(ticker, 'lower24Price');
            changeValue = this.safeString(ticker, 'riseFallValue');
            changePcnt = this.safeString(ticker, 'riseFallRate');
            changePcnt = Precise["default"].stringMul(changePcnt, '100');
        }
        else {
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "priceChange": "184.34",
            //         "priceChangePercent": "0.00400048",
            //         "prevClosePrice": "46079.37",
            //         "lastPrice": "46263.71",
            //         "lastQty": "",
            //         "bidPrice": "46260.38",
            //         "bidQty": "",
            //         "askPrice": "46260.41",
            //         "askQty": "",
            //         "openPrice": "46079.37",
            //         "highPrice": "47550.01",
            //         "lowPrice": "45555.5",
            //         "volume": "1732.461487",
            //         "quoteVolume": null,
            //         "openTime": 1641349500000,
            //         "closeTime": 1641349582808,
            //         "count": null
            //     }
            //
            timestamp = this.safeInteger(ticker, 'closeTime');
            bid = this.safeString(ticker, 'bidPrice');
            ask = this.safeString(ticker, 'askPrice');
            bidVolume = this.safeString(ticker, 'bidQty');
            askVolume = this.safeString(ticker, 'askQty');
            if (Precise["default"].stringEq(bidVolume, '0')) {
                bidVolume = undefined;
            }
            if (Precise["default"].stringEq(askVolume, '0')) {
                askVolume = undefined;
            }
            baseVolume = this.safeString(ticker, 'volume');
            quoteVolume = this.safeString(ticker, 'quoteVolume');
            open = this.safeString(ticker, 'openPrice');
            high = this.safeString(ticker, 'highPrice');
            low = this.safeString(ticker, 'lowPrice');
            prevClose = this.safeString(ticker, 'prevClosePrice');
            changeValue = this.safeString(ticker, 'priceChange');
            changePcnt = this.safeString(ticker, 'priceChangePercent');
            changePcnt = Precise["default"].stringMul(changePcnt, '100');
        }
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'open': open,
            'high': high,
            'low': low,
            'close': this.safeString(ticker, 'lastPrice'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'previousClose': prevClose,
            'change': changeValue,
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name mexc#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#symbol-order-book-ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        let isSingularMarket = false;
        if (symbols !== undefined) {
            const length = symbols.length;
            isSingularMarket = length === 1;
            market = this.market(symbols[0]);
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchBidsAsks', market, params);
        let tickers = undefined;
        if (marketType === 'spot') {
            tickers = await this.spotPublicGetTickerBookTicker(query);
            //
            //     [
            //       {
            //         "symbol": "AEUSDT",
            //         "bidPrice": "0.11001",
            //         "bidQty": "115.59",
            //         "askPrice": "0.11127",
            //         "askQty": "215.48"
            //       },
            //     ]
            //
        }
        else if (marketType === 'swap') {
            throw new errors.NotSupported(this.id + ' fetchBidsAsks() is not available for ' + marketType + ' markets');
        }
        // when it's single symbol request, the returned structure is different (singular object) for both spot & swap, thus we need to wrap inside array
        if (isSingularMarket) {
            tickers = [tickers];
        }
        return this.parseTickers(tickers, symbols);
    }
    /**
     * @method
     * @name mexc#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
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
        const req = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', 'buy', 0, undefined, this.extend(req, params));
    }
    /**
     * @method
     * @name mexc#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createMarketSellOrderWithCost(symbol, cost, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        const req = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', 'sell', 0, undefined, this.extend(req, params));
    }
    /**
     * @method
     * @name mexc#createOrder
     * @description create a trade order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#order-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#trigger-order-under-maintenance
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported for spot-margin trading
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {bool} [params.reduceOnly] *contract only* indicates if this order is to reduce the size of a position
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode, default is false
     * @param {string} [params.timeInForce] 'IOC' or 'FOK', default is 'GTC'
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.leverage] *contract only* leverage is necessary on isolated margin
     * @param {long} [params.positionId] *contract only* it is recommended to fill in this parameter when closing a position
     * @param {string} [params.externalOid] *contract only* external order ID
     * @param {int} [params.positionMode] *contract only*  1:hedge, 2:one-way, default: the user's current config
     * @param {boolean} [params.test] *spot only* whether to use the test endpoint or not, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const [marginMode, query] = this.handleMarginModeAndParams('createOrder', params);
        if (market['spot']) {
            return await this.createSpotOrder(market, type, side, amount, price, marginMode, query);
        }
        else {
            return await this.createSwapOrder(market, type, side, amount, price, marginMode, query);
        }
    }
    createSpotOrderRequest(market, type, side, amount, price = undefined, marginMode = undefined, params = {}) {
        const symbol = market['symbol'];
        const orderSide = side.toUpperCase();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'type': type.toUpperCase(),
        };
        if (type === 'market') {
            const cost = this.safeNumber2(params, 'cost', 'quoteOrderQty');
            params = this.omit(params, 'cost');
            if (cost !== undefined) {
                amount = cost;
                request['quoteOrderQty'] = this.costToPrecision(symbol, amount);
            }
            else {
                if (price === undefined) {
                    request['quantity'] = this.amountToPrecision(symbol, amount);
                }
                else {
                    const amountString = this.numberToString(amount);
                    const priceString = this.numberToString(price);
                    const quoteAmount = Precise["default"].stringMul(amountString, priceString);
                    amount = quoteAmount;
                    request['quoteOrderQty'] = this.costToPrecision(symbol, amount);
                }
            }
        }
        else {
            request['quantity'] = this.amountToPrecision(symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision(symbol, price);
        }
        const clientOrderId = this.safeString(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
            params = this.omit(params, ['type', 'clientOrderId']);
        }
        if (marginMode !== undefined) {
            if (marginMode !== 'isolated') {
                throw new errors.BadRequest(this.id + ' createOrder() does not support marginMode ' + marginMode + ' for spot-margin trading');
            }
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(type === 'market', type === 'LIMIT_MAKER', params);
        if (postOnly) {
            request['type'] = 'LIMIT_MAKER';
        }
        const tif = this.safeString(params, 'timeInForce');
        if (tif !== undefined) {
            params = this.omit(params, 'timeInForce');
            if (tif === 'IOC') {
                request['type'] = 'IMMEDIATE_OR_CANCEL';
            }
            else if (tif === 'FOK') {
                request['type'] = 'FILL_OR_KILL';
            }
        }
        return this.extend(request, params);
    }
    /**
     * @ignore
     * @method
     * @name mexc#createSpotOrder
     * @description create a trade order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @param {string} market unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {string} [marginMode] only 'isolated' is supported for spot-margin trading
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createSpotOrder(market, type, side, amount, price = undefined, marginMode = undefined, params = {}) {
        await this.loadMarkets();
        const test = this.safeBool(params, 'test', false);
        params = this.omit(params, 'test');
        const request = this.createSpotOrderRequest(market, type, side, amount, price, marginMode, params);
        let response = undefined;
        if (test) {
            response = await this.spotPrivatePostOrderTest(request);
        }
        else {
            response = await this.spotPrivatePostOrder(request);
        }
        //
        // spot
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "123738410679123456",
        //         "orderListId": -1
        //     }
        //
        // margin
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "762634301354414080",
        //         "clientOrderId": null,
        //         "isIsolated": true,
        //         "transactTime": 1661992652132
        //     }
        //
        const order = this.parseOrder(response, market);
        order['side'] = side;
        order['type'] = type;
        if (this.safeString(order, 'price') === undefined) {
            order['price'] = price;
        }
        if (this.safeString(order, 'amount') === undefined) {
            order['amount'] = amount;
        }
        return order;
    }
    /**
     * @ignore
     * @method
     * @name mexc#createSwapOrder
     * @description create a trade order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#new-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#order-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#trigger-order-under-maintenance
     * @param {string} market unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {string} [marginMode] only 'isolated' is supported for spot-margin trading
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {bool} [params.reduceOnly] indicates if this order is to reduce the size of a position
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode, default is false
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.leverage] leverage is necessary on isolated margin
     * @param {long} [params.positionId] it is recommended to fill in this parameter when closing a position
     * @param {string} [params.externalOid] external order ID
     * @param {int} [params.positionMode] 1:hedge, 2:one-way, default: the user's current config
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createSwapOrder(market, type, side, amount, price = undefined, marginMode = undefined, params = {}) {
        await this.loadMarkets();
        const symbol = market['symbol'];
        const unavailableContracts = this.safeValue(this.options, 'unavailableContracts', {});
        const isContractUnavaiable = this.safeBool(unavailableContracts, symbol, false);
        if (isContractUnavaiable) {
            throw new errors.NotSupported(this.id + ' createSwapOrder() does not support yet this symbol:' + symbol);
        }
        let openType = undefined;
        if (marginMode !== undefined) {
            if (marginMode === 'cross') {
                openType = 2;
            }
            else if (marginMode === 'isolated') {
                openType = 1;
            }
            else {
                throw new errors.ArgumentsRequired(this.id + ' createSwapOrder() marginMode parameter should be either "cross" or "isolated"');
            }
        }
        else {
            openType = this.safeInteger(params, 'openType', 2); // defaulting to cross margin
        }
        if ((type !== 'limit') && (type !== 'market') && (type !== 1) && (type !== 2) && (type !== 3) && (type !== 4) && (type !== 5) && (type !== 6)) {
            throw new errors.InvalidOrder(this.id + ' createSwapOrder() order type must either limit, market, or 1 for limit orders, 2 for post-only orders, 3 for IOC orders, 4 for FOK orders, 5 for market orders or 6 to convert market price to current price');
        }
        let postOnly = undefined;
        [postOnly, params] = this.handlePostOnly(type === 'market', type === 2, params);
        if (postOnly) {
            type = 2;
        }
        else if (type === 'limit') {
            type = 1;
        }
        else if (type === 'market') {
            type = 6;
        }
        const request = {
            'symbol': market['id'],
            // 'price': parseFloat (this.priceToPrecision (symbol, price)),
            'vol': parseFloat(this.amountToPrecision(symbol, amount)),
            // 'leverage': int, // required for isolated margin
            // 'side': side, // 1 open long, 2 close short, 3 open short, 4 close long
            //
            // supported order types
            //
            //     1 limit
            //     2 post only maker (PO)
            //     3 transact or cancel instantly (IOC)
            //     4 transact completely or cancel completely (FOK)
            //     5 market orders
            //     6 convert market price to current price
            //
            'type': type,
            'openType': openType, // 1 isolated, 2 cross
            // 'positionId': 1394650, // long, filling in this parameter when closing a position is recommended
            // 'externalOid': clientOrderId,
            // 'triggerPrice': 10.0, // Required for trigger order
            // 'triggerType': 1, // Required for trigger order 1: more than or equal, 2: less than or equal
            // 'executeCycle': 1, // Required for trigger order 1: 24 hours,2: 7 days
            // 'trend': 1, // Required for trigger order 1: latest price, 2: fair price, 3: index price
            // 'orderType': 1, // Required for trigger order 1: limit order,2:Post Only Maker,3: close or cancel instantly ,4: close or cancel completely,5: Market order
        };
        if ((type !== 5) && (type !== 6) && (type !== 'market')) {
            request['price'] = parseFloat(this.priceToPrecision(symbol, price));
        }
        if (openType === 1) {
            const leverage = this.safeInteger(params, 'leverage');
            if (leverage === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createSwapOrder() requires a leverage parameter for isolated margin orders');
            }
        }
        const reduceOnly = this.safeBool(params, 'reduceOnly', false);
        const hedged = this.safeBool(params, 'hedged', false);
        let sideInteger = undefined;
        if (hedged) {
            if (reduceOnly) {
                params = this.omit(params, 'reduceOnly'); // hedged mode does not accept this parameter
                side = (side === 'buy') ? 'sell' : 'buy';
            }
            sideInteger = (side === 'buy') ? 1 : 3;
            request['positionMode'] = 1;
        }
        else {
            if (reduceOnly) {
                sideInteger = (side === 'buy') ? 2 : 4;
            }
            else {
                sideInteger = (side === 'buy') ? 1 : 3;
            }
        }
        request['side'] = sideInteger;
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'externalOid');
        if (clientOrderId !== undefined) {
            request['externalOid'] = clientOrderId;
        }
        const triggerPrice = this.safeNumber2(params, 'triggerPrice', 'stopPrice');
        params = this.omit(params, ['clientOrderId', 'externalOid', 'postOnly', 'stopPrice', 'triggerPrice', 'hedged']);
        let response = undefined;
        if (triggerPrice) {
            request['triggerPrice'] = this.priceToPrecision(symbol, triggerPrice);
            request['triggerType'] = this.safeInteger(params, 'triggerType', 1);
            request['executeCycle'] = this.safeInteger(params, 'executeCycle', 1);
            request['trend'] = this.safeInteger(params, 'trend', 1);
            request['orderType'] = this.safeInteger(params, 'orderType', 1);
            response = await this.contractPrivatePostPlanorderPlace(this.extend(request, params));
        }
        else {
            response = await this.contractPrivatePostOrderSubmit(this.extend(request, params));
        }
        //
        // Swap
        //     {"code":200,"data":"2ff3163e8617443cb9c6fc19d42b1ca4"}
        //
        // Trigger
        //     {"success":true,"code":0,"data":259208506303929856}
        //
        const data = this.safeString(response, 'data');
        return this.safeOrder({ 'id': data }, market);
    }
    /**
     * @method
     * @name mexc#createOrders
     * @description *spot only*  *all orders must have the same symbol* create a list of trade orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#batch-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders(orders, params = {}) {
        await this.loadMarkets();
        const ordersRequests = [];
        let symbol = undefined;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const market = this.market(marketId);
            if (!market['spot']) {
                throw new errors.NotSupported(this.id + ' createOrders() is only supported for spot markets');
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
            const orderParams = this.safeValue(rawOrder, 'params', {});
            let marginMode = undefined;
            [marginMode, params] = this.handleMarginModeAndParams('createOrder', params);
            const orderRequest = this.createSpotOrderRequest(market, type, side, amount, price, marginMode, orderParams);
            ordersRequests.push(orderRequest);
        }
        const request = {
            'batchOrders': this.json(ordersRequests),
        };
        const response = await this.spotPrivatePostBatchOrders(request);
        //
        // [
        //     {
        //       "symbol": "BTCUSDT",
        //       "orderId": "1196315350023612316",
        //       "newClientOrderId": "hio8279hbdsds",
        //       "orderListId": -1
        //     },
        //     {
        //       "newClientOrderId": "123456",
        //       "msg": "The minimum transaction volume cannot be less than:0.5USDT",
        //       "code": 30002
        //     },
        //     {
        //       "symbol": "BTCUSDT",
        //       "orderId": "1196315350023612318",
        //       "orderListId": -1
        //     }
        // ]
        //
        return this.parseOrders(response);
    }
    /**
     * @method
     * @name mexc#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#query-the-order-based-on-the-order-number
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported, for spot-margin trading
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        let data = undefined;
        if (market['spot']) {
            const clientOrderId = this.safeString(params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                params = this.omit(params, 'clientOrderId');
                request['origClientOrderId'] = clientOrderId;
            }
            else {
                request['orderId'] = id;
            }
            const [marginMode, query] = this.handleMarginModeAndParams('fetchOrder', params);
            if (marginMode !== undefined) {
                if (marginMode !== 'isolated') {
                    throw new errors.BadRequest(this.id + ' fetchOrder() does not support marginMode ' + marginMode + ' for spot-margin trading');
                }
                data = await this.spotPrivateGetMarginOrder(this.extend(request, query));
            }
            else {
                data = await this.spotPrivateGetOrder(this.extend(request, query));
            }
            //
            // spot
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "orderId": "133734823834147272",
            //         "orderListId": "-1",
            //         "clientOrderId": null,
            //         "price": "30000",
            //         "origQty": "0.0002",
            //         "executedQty": "0",
            //         "cummulativeQuoteQty": "0",
            //         "status": "CANCELED",
            //         "timeInForce": null,
            //         "type": "LIMIT",
            //         "side": "BUY",
            //         "stopPrice": null,
            //         "icebergQty": null,
            //         "time": "1647667102000",
            //         "updateTime": "1647708567000",
            //         "isWorking": true,
            //         "origQuoteOrderQty": "6"
            //     }
            //
            // margin
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "orderId": "763307297891028992",
            //         "orderListId": "-1",
            //         "clientOrderId": null,
            //         "price": "18000",
            //         "origQty": "0.0014",
            //         "executedQty": "0",
            //         "cummulativeQuoteQty": "0",
            //         "status": "NEW",
            //         "type": "LIMIT",
            //         "side": "BUY",
            //         "isIsolated": true,
            //         "isWorking": true,
            //         "time": 1662153107000,
            //         "updateTime": 1662153107000
            //     }
            //
        }
        else if (market['swap']) {
            request['order_id'] = id;
            const response = await this.contractPrivateGetOrderGetOrderId(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": {
            //             "orderId": "264995729269765120",
            //             "symbol": "STEPN_USDT",
            //             "positionId": "0",
            //             "price": "2.2",
            //             "vol": "15",
            //             "leverage": "20",
            //             "side": "1",
            //             "category": "1",
            //             "orderType": "1",
            //             "dealAvgPrice": "0",
            //             "dealVol": "0",
            //             "orderMargin": "2.2528",
            //             "takerFee": "0",
            //             "makerFee": "0",
            //             "profit": "0",
            //             "feeCurrency": "USDT",
            //             "openType": "1",
            //             "state": "2",
            //             "externalOid": "_m_0e9520c256744d64b942985189026d20",
            //             "errorCode": "0",
            //             "usedMargin": "0",
            //             "createTime": "1648850305236",
            //             "updateTime": "1648850305245",
            //             "positionMode": "1"
            //         }
            //     }
            //
            data = this.safeValue(response, 'data');
        }
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name mexc#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {string} [params.marginMode] only 'isolated' is supported, for spot-margin trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        const [marketType, query] = this.handleMarketTypeAndParams('fetchOrders', market, params);
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrders() requires a symbol argument for spot market');
            }
            const [marginMode, queryInner] = this.handleMarginModeAndParams('fetchOrders', params);
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (until !== undefined) {
                request['endTime'] = until;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            let response = undefined;
            if (marginMode !== undefined) {
                if (marginMode !== 'isolated') {
                    throw new errors.BadRequest(this.id + ' fetchOrders() does not support marginMode ' + marginMode + ' for spot-margin trading');
                }
                response = await this.spotPrivateGetMarginAllOrders(this.extend(request, queryInner));
            }
            else {
                response = await this.spotPrivateGetAllOrders(this.extend(request, queryInner));
            }
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "133949373632483328",
            //             "orderListId": "-1",
            //             "clientOrderId": null,
            //             "price": "45000",
            //             "origQty": "0.0002",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "timeInForce": null,
            //             "type": "LIMIT",
            //             "side": "SELL",
            //             "stopPrice": null,
            //             "icebergQty": null,
            //             "time": "1647718255000",
            //             "updateTime": "1647718255000",
            //             "isWorking": true,
            //             "origQuoteOrderQty": "9"
            //         },
            //     ]
            //
            // margin
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "763307297891028992",
            //             "orderListId": "-1",
            //             "clientOrderId": null,
            //             "price": "18000",
            //             "origQty": "0.0014",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "type": "LIMIT",
            //             "side": "BUY",
            //             "isIsolated": true,
            //             "isWorking": true,
            //             "time": 1662153107000,
            //             "updateTime": 1662153107000
            //         }
            //     ]
            //
            return this.parseOrders(response, market, since, limit);
        }
        else {
            if (since !== undefined) {
                request['start_time'] = since;
                const end = this.safeInteger(params, 'end_time', until);
                if (end === undefined) {
                    request['end_time'] = this.sum(since, this.options['maxTimeTillEnd']);
                }
                else {
                    if ((end - since) > this.options['maxTimeTillEnd']) {
                        throw new errors.BadRequest(this.id + ' end is invalid, i.e. exceeds allowed 90 days.');
                    }
                    else {
                        request['end_time'] = until;
                    }
                }
            }
            else if (until !== undefined) {
                request['start_time'] = this.sum(until, this.options['maxTimeTillEnd'] * -1);
                request['end_time'] = until;
            }
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
            let method = this.safeString(this.options, 'fetchOrders', 'contractPrivateGetOrderListHistoryOrders');
            method = this.safeString(query, 'method', method);
            let ordersOfRegular = [];
            let ordersOfTrigger = [];
            if (method === 'contractPrivateGetOrderListHistoryOrders') {
                const response = await this.contractPrivateGetOrderListHistoryOrders(this.extend(request, query));
                //
                //     {
                //         "success": true,
                //         "code": "0",
                //         "data": [
                //             {
                //                 "orderId": "265230764677709315",
                //                 "symbol": "STEPN_USDT",
                //                 "positionId": "0",
                //                 "price": "2.1",
                //                 "vol": "102",
                //                 "leverage": "20",
                //                 "side": "1",
                //                 "category": "1",
                //                 "orderType": "1",
                //                 "dealAvgPrice": "0",
                //                 "dealVol": "0",
                //                 "orderMargin": "10.96704",
                //                 "takerFee": "0",
                //                 "makerFee": "0",
                //                 "profit": "0",
                //                 "feeCurrency": "USDT",
                //                 "openType": "1",
                //                 "state": "2",
                //                 "externalOid": "_m_7e42f8df6b324c869e4e200397e2b00f",
                //                 "errorCode": "0",
                //                 "usedMargin": "0",
                //                 "createTime": "1648906342000",
                //                 "updateTime": "1648906342000",
                //                 "positionMode": "1"
                //             },
                //          ]
                //     }
                //
                ordersOfRegular = this.safeValue(response, 'data');
            }
            else {
                // the Planorder endpoints work not only for stop-market orders, but also for stop-limit orders that were supposed to have a separate endpoint
                const response = await this.contractPrivateGetPlanorderListOrders(this.extend(request, query));
                //
                //     {
                //         "success": true,
                //         "code": "0",
                //         "data": [
                //             {
                //                 "symbol": "STEPN_USDT",
                //                 "leverage": "20",
                //                 "side": "1",
                //                 "vol": "13",
                //                 "openType": "1",
                //                 "state": "1",
                //                 "orderType": "1",
                //                 "errorCode": "0",
                //                 "createTime": "1648984276000",
                //                 "updateTime": "1648984276000",
                //                 "id": "265557643326564352",
                //                 "triggerType": "1",
                //                 "triggerPrice": "3",
                //                 "price": "2.9", // not present in stop-market, but in stop-limit order
                //                 "executeCycle": "87600",
                //                 "trend": "1",
                //             },
                //         ]
                //     }
                //
                ordersOfTrigger = this.safeValue(response, 'data');
            }
            const merged = this.arrayConcat(ordersOfTrigger, ordersOfRegular);
            return this.parseOrders(merged, market, since, limit, params);
        }
    }
    async fetchOrdersByIds(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchOrdersByIds', market, params);
        if (marketType === 'spot') {
            throw new errors.BadRequest(this.id + ' fetchOrdersByIds() is not supported for ' + marketType);
        }
        else {
            request['order_ids'] = ids.join(',');
            const response = await this.contractPrivateGetOrderBatchQuery(this.extend(request, query));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "orderId": "265230764677709315",
            //                 "symbol": "STEPN_USDT",
            //                 "positionId": "0",
            //                 "price": "2.1",
            //                 "vol": "102",
            //                 "leverage": "20",
            //                 "side": "1",
            //                 "category": "1",
            //                 "orderType": "1",
            //                 "dealAvgPrice": "0",
            //                 "dealVol": "0",
            //                 "orderMargin": "10.96704",
            //                 "takerFee": "0",
            //                 "makerFee": "0",
            //                 "profit": "0",
            //                 "feeCurrency": "USDT",
            //                 "openType": "1",
            //                 "state": "2",
            //                 "externalOid": "_m_7e42f8df6b324c869e4e200397e2b00f",
            //                 "errorCode": "0",
            //                 "usedMargin": "0",
            //                 "createTime": "1648906342000",
            //                 "updateTime": "1648906342000",
            //                 "positionMode": "1"
            //             }
            //         ]
            //     }
            //
            const data = this.safeList(response, 'data');
            return this.parseOrders(data, market);
        }
    }
    /**
     * @method
     * @name mexc#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#current-open-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported, for spot-margin trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        let marketType = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        [marketType, params] = this.handleMarketTypeAndParams('fetchOpenOrders', market, params);
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOpenOrders() requires a symbol argument for spot market');
            }
            request['symbol'] = market['id'];
            const [marginMode, query] = this.handleMarginModeAndParams('fetchOpenOrders', params);
            let response = undefined;
            if (marginMode !== undefined) {
                if (marginMode !== 'isolated') {
                    throw new errors.BadRequest(this.id + ' fetchOpenOrders() does not support marginMode ' + marginMode + ' for spot-margin trading');
                }
                response = await this.spotPrivateGetMarginOpenOrders(this.extend(request, query));
            }
            else {
                response = await this.spotPrivateGetOpenOrders(this.extend(request, query));
            }
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "133949373632483328",
            //             "orderListId": "-1",
            //             "clientOrderId": "",
            //             "price": "45000",
            //             "origQty": "0.0002",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "timeInForce": null,
            //             "type": "LIMIT",
            //             "side": "SELL",
            //             "stopPrice": null,
            //             "icebergQty": null,
            //             "time": "1647718255199",
            //             "updateTime": null,
            //             "isWorking": true,
            //             "origQuoteOrderQty": "9"
            //         }
            //     ]
            //
            // margin
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "764547676405633024",
            //             "orderListId": "-1",
            //             "clientOrderId": null,
            //             "price": "18000",
            //             "origQty": "0.0013",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "type": "LIMIT",
            //             "side": "BUY",
            //             "isIsolated": true,
            //             "isWorking": true,
            //             "time": 1662448836000,
            //             "updateTime": 1662448836000
            //         }
            //     ]
            //
            return this.parseOrders(response, market, since, limit);
        }
        else {
            // TO_DO: another possible way is through: open_orders/{symbol}, but as they have same ratelimits, and less granularity, i think historical orders are more convenient, as it supports more params (however, theoretically, open-orders endpoint might be sligthly fast)
            return await this.fetchOrdersByState(2, symbol, since, limit, params);
        }
    }
    /**
     * @method
     * @name mexc#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState(3, symbol, since, limit, params);
    }
    /**
     * @method
     * @name mexc#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#all-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-of-the-user-39-s-historical-orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#gets-the-trigger-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState(4, symbol, since, limit, params);
    }
    async fetchOrdersByState(state, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const [marketType] = this.handleMarketTypeAndParams('fetchOrdersByState', market, params);
        if (marketType === 'spot') {
            throw new errors.NotSupported(this.id + ' fetchOrdersByState() is not supported for ' + marketType);
        }
        else {
            request['states'] = state;
            return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
        }
    }
    /**
     * @method
     * @name mexc#cancelOrder
     * @description cancels an open order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#cancel-order
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-order-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-stop-limit-trigger-order-under-maintenance
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported for spot-margin trading
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            market['id'];
        }
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelOrder', market, params);
        const [marginMode, query] = this.handleMarginModeAndParams('cancelOrder', params);
        let data = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
            }
            const requestInner = {
                'symbol': market['id'],
            };
            const clientOrderId = this.safeString(params, 'clientOrderId');
            if (clientOrderId !== undefined) {
                params = this.omit(query, 'clientOrderId');
                requestInner['origClientOrderId'] = clientOrderId;
            }
            else {
                requestInner['orderId'] = id;
            }
            if (marginMode !== undefined) {
                if (marginMode !== 'isolated') {
                    throw new errors.BadRequest(this.id + ' cancelOrder() does not support marginMode ' + marginMode + ' for spot-margin trading');
                }
                data = await this.spotPrivateDeleteMarginOrder(this.extend(requestInner, query));
            }
            else {
                data = await this.spotPrivateDeleteOrder(this.extend(requestInner, query));
            }
            //
            // spot
            //
            //     {
            //         "symbol": "BTCUSDT",
            //         "orderId": "133734823834447872",
            //         "price": "30000",
            //         "origQty": "0.0002",
            //         "type": "LIMIT",
            //         "side": "BUY"
            //     }
            //
            // margin
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "762640232574226432",
            //             "orderListId": "-1",
            //             "clientOrderId": null,
            //             "price": "18000",
            //             "origQty": "0.00147",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "type": "LIMIT",
            //             "side": "BUY",
            //             "isIsolated": true,
            //             "isWorking": true,
            //             "time": 1661994066000,
            //             "updateTime": 1661994066000
            //         }
            //     ]
            //
        }
        else {
            // TODO: PlanorderCancel endpoint has bug atm. waiting for fix.
            let method = this.safeString(this.options, 'cancelOrder', 'contractPrivatePostOrderCancel'); // contractPrivatePostOrderCancel, contractPrivatePostPlanorderCancel
            method = this.safeString(query, 'method', method);
            let response = undefined;
            if (method === 'contractPrivatePostOrderCancel') {
                response = await this.contractPrivatePostOrderCancel([id]); // the request cannot be changed or extended. This is the only way to send.
            }
            else if (method === 'contractPrivatePostPlanorderCancel') {
                response = await this.contractPrivatePostPlanorderCancel([id]); // the request cannot be changed or extended. This is the only way to send.
            }
            else {
                throw new errors.NotSupported(this.id + ' cancelOrder() not support this method');
            }
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "orderId": "264995729269765120",
            //                 "errorCode": "0",         // if already canceled: "2041"; if doesn't exist: "2040"
            //                 "errorMsg": "success",    // if already canceled: "order state cannot be cancelled"; if doesn't exist: "order not exist"
            //             }
            //         ]
            //     }
            //
            data = this.safeValue(response, 'data');
            const order = this.safeValue(data, 0);
            const errorMsg = this.safeValue(order, 'errorMsg', '');
            if (errorMsg !== 'success') {
                throw new errors.InvalidOrder(this.id + ' cancelOrder() the order with id ' + id + ' cannot be cancelled: ' + errorMsg);
            }
        }
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name mexc#cancelOrders
     * @description cancel multiple orders
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-the-order-under-maintenance
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol !== undefined) ? this.market(symbol) : undefined;
        const [marketType] = this.handleMarketTypeAndParams('cancelOrders', market, params);
        if (marketType === 'spot') {
            throw new errors.BadRequest(this.id + ' cancelOrders() is not supported for ' + marketType);
        }
        else {
            const response = await this.contractPrivatePostOrderCancel(ids); // the request cannot be changed or extended. The only way to send.
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "orderId": "264995729269765120",
            //                 "errorCode": "0",         // if already canceled: "2041"
            //                 "errorMsg": "success",    // if already canceled: "order state cannot be cancelled"
            //             },
            //         ]
            //     }
            //
            const data = this.safeList(response, 'data');
            return this.parseOrders(data, market);
        }
    }
    /**
     * @method
     * @name mexc#cancelAllOrders
     * @description cancel all open orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#cancel-all-open-orders-on-a-symbol
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-all-orders-under-a-contract-under-maintenance
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#cancel-all-trigger-orders-under-maintenance
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] only 'isolated' is supported for spot-margin trading
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = (symbol !== undefined) ? this.market(symbol) : undefined;
        const request = {};
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('cancelAllOrders', market, params);
        const [marginMode, query] = this.handleMarginModeAndParams('cancelAllOrders', params);
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelAllOrders() requires a symbol argument on spot');
            }
            request['symbol'] = market['id'];
            let response = undefined;
            if (marginMode !== undefined) {
                if (marginMode !== 'isolated') {
                    throw new errors.BadRequest(this.id + ' cancelAllOrders() does not support marginMode ' + marginMode + ' for spot-margin trading');
                }
                response = await this.spotPrivateDeleteMarginOpenOrders(this.extend(request, query));
            }
            else {
                response = await this.spotPrivateDeleteOpenOrders(this.extend(request, query));
            }
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "133926492139692032",
            //             "price": "30000",
            //             "origQty": "0.0002",
            //             "type": "LIMIT",
            //             "side": "BUY"
            //         },
            //     ]
            //
            // margin
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "orderId": "762640232574226432",
            //             "orderListId": "-1",
            //             "clientOrderId": null,
            //             "price": "18000",
            //             "origQty": "0.00147",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "status": "NEW",
            //             "type": "LIMIT",
            //             "side": "BUY",
            //             "isIsolated": true,
            //             "isWorking": true,
            //             "time": 1661994066000,
            //             "updateTime": 1661994066000
            //         }
            //     ]
            //
            return this.parseOrders(response, market);
        }
        else {
            if (symbol !== undefined) {
                request['symbol'] = market['id'];
            }
            // method can be either: contractPrivatePostOrderCancelAll or contractPrivatePostPlanorderCancelAll
            // the Planorder endpoints work not only for stop-market orders but also for stop-limit orders that are supposed to have separate endpoint
            let method = this.safeString(this.options, 'cancelAllOrders', 'contractPrivatePostOrderCancelAll');
            method = this.safeString(query, 'method', method);
            let response = undefined;
            if (method === 'contractPrivatePostOrderCancelAll') {
                response = await this.contractPrivatePostOrderCancelAll(this.extend(request, query));
            }
            else if (method === 'contractPrivatePostPlanorderCancelAll') {
                response = await this.contractPrivatePostPlanorderCancelAll(this.extend(request, query));
            }
            //
            //     {
            //         "success": true,
            //         "code": "0"
            //     }
            //
            const data = this.safeList(response, 'data', []);
            return this.parseOrders(data, market);
        }
    }
    parseOrder(order, market = undefined) {
        //
        // spot
        //    createOrder
        //
        //    {
        //        "symbol": "FARTCOINUSDT",
        //        "orderId": "C02__342252993005723644225",
        //        "orderListId": "-1",
        //        "price": "1.1",
        //        "origQty": "6.3",
        //        "type": "IMMEDIATE_OR_CANCEL",
        //        "side": "SELL",
        //        "transactTime": "1745852205223"
        //    }
        //
        //    unknown endpoint on spot
        //
        //    {
        //         "symbol": "BTCUSDT",
        //         "orderId": "123738410679123456",
        //         "orderListId": -1
        //    }
        //
        // margin: createOrder
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "762634301354414080",
        //         "clientOrderId": null,
        //         "isIsolated": true,
        //         "transactTime": 1661992652132
        //     }
        //
        // spot: cancelOrder, cancelAllOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133926441921286144",
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "type": "LIMIT",
        //         "side": "BUY"
        //     }
        //
        // margin: cancelOrder, cancelAllOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "762640232574226432",
        //         "orderListId": "-1",
        //         "clientOrderId": null,
        //         "price": "18000",
        //         "origQty": "0.00147",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "NEW",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "isIsolated": true,
        //         "isWorking": true,
        //         "time": 1661994066000,
        //         "updateTime": 1661994066000
        //     }
        //
        // spot: fetchOrder, fetchOpenOrders, fetchOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "133734823834147272",
        //         "orderListId": "-1",
        //         "clientOrderId": null,
        //         "price": "30000",
        //         "origQty": "0.0002",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "CANCELED",
        //         "timeInForce": null,
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "stopPrice": null,
        //         "icebergQty": null,
        //         "time": "1647667102000",
        //         "updateTime": "1647708567000",
        //         "isWorking": true,
        //         "origQuoteOrderQty": "6"
        //     }
        //
        // margin: fetchOrder, fetchOrders
        //
        //     {
        //         "symbol": "BTCUSDT",
        //         "orderId": "763307297891028992",
        //         "orderListId": "-1",
        //         "clientOrderId": null,
        //         "price": "18000",
        //         "origQty": "0.0014",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "status": "NEW",
        //         "type": "LIMIT",
        //         "side": "BUY",
        //         "isIsolated": true,
        //         "isWorking": true,
        //         "time": 1662153107000,
        //         "updateTime": 1662153107000
        //     }
        //
        // swap: createOrder
        //
        //     2ff3163e8617443cb9c6fc19d42b1ca4
        //
        // swap: fetchOrder, fetchOrders
        //
        //     regular
        //     {
        //         "orderId": "264995729269765120",
        //         "symbol": "STEPN_USDT",
        //         "positionId": "0",
        //         "price": "2.2",
        //         "vol": "15",
        //         "leverage": "20",
        //         "side": "1", // TODO: not unified
        //         "category": "1",
        //         "orderType": "1", // TODO: not unified
        //         "dealAvgPrice": "0",
        //         "dealVol": "0",
        //         "orderMargin": "2.2528",
        //         "takerFee": "0",
        //         "makerFee": "0",
        //         "profit": "0",
        //         "feeCurrency": "USDT",
        //         "openType": "1",
        //         "state": "2", // TODO
        //         "externalOid": "_m_0e9520c256744d64b942985189026d20",
        //         "errorCode": "0",
        //         "usedMargin": "0",
        //         "createTime": "1648850305236",
        //         "updateTime": "1648850305245",
        //         "positionMode": "1"
        //     }
        //
        //     stop
        //     {
        //         "id": "265557643326564352",
        //         "triggerType": "1",
        //         "triggerPrice": "3",
        //         "price": "2.9", // not present in stop-market, but in stop-limit order
        //         "executeCycle": "87600",
        //         "trend": "1",
        //          // below keys are same as in regular order structure
        //         "symbol": "STEPN_USDT",
        //         "leverage": "20",
        //         "side": "1",
        //         "vol": "13",
        //         "openType": "1",
        //         "state": "1",
        //         "orderType": "1",
        //         "errorCode": "0",
        //         "createTime": "1648984276000",
        //         "updateTime": "1648984276000",
        //     }
        //
        // createOrders error
        //
        //     {
        //         "newClientOrderId": "123456",
        //         "msg": "The minimum transaction volume cannot be less than:0.5USDT",
        //         "code": 30002
        //     }
        //
        const code = this.safeInteger(order, 'code');
        if (code !== undefined) {
            // error upon placing multiple orders
            return this.safeOrder({
                'info': order,
                'status': 'rejected',
                'clientOrderId': this.safeString(order, 'newClientOrderId'),
            });
        }
        let id = undefined;
        if (typeof order === 'string') {
            id = order;
        }
        else {
            id = this.safeString2(order, 'orderId', 'id');
        }
        let timeInForce = this.parseOrderTimeInForce(this.safeString(order, 'timeInForce'));
        const typeRaw = this.safeString(order, 'type');
        if (timeInForce === undefined) {
            timeInForce = this.getTifFromRawOrderType(typeRaw);
        }
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeIntegerN(order, ['time', 'createTime', 'transactTime']);
        let fee = undefined;
        const feeCurrency = this.safeString(order, 'feeCurrency');
        if (feeCurrency !== undefined) {
            const takerFee = this.safeString(order, 'takerFee');
            const makerFee = this.safeString(order, 'makerFee');
            const feeSum = Precise["default"].stringAdd(takerFee, makerFee);
            fee = {
                'currency': feeCurrency,
                'cost': this.parseNumber(feeSum),
            };
        }
        return this.safeOrder({
            'id': id,
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'status': this.parseOrderStatus(this.safeString2(order, 'status', 'state')),
            'symbol': market['symbol'],
            'type': this.parseOrderType(typeRaw),
            'timeInForce': timeInForce,
            'side': this.parseOrderSide(this.safeString(order, 'side')),
            'price': this.safeNumber(order, 'price'),
            'triggerPrice': this.safeNumber2(order, 'stopPrice', 'triggerPrice'),
            'average': this.safeNumber(order, 'dealAvgPrice'),
            'amount': this.safeNumber2(order, 'origQty', 'vol'),
            'cost': this.safeNumber(order, 'cummulativeQuoteQty'),
            'filled': this.safeNumber2(order, 'executedQty', 'dealVol'),
            'remaining': undefined,
            'fee': fee,
            'trades': undefined,
            'info': order,
        }, market);
    }
    parseOrderSide(status) {
        const statuses = {
            'BUY': 'buy',
            'SELL': 'sell',
            '1': 'buy',
            '2': 'sell',
            // contracts v1 : TODO
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
            // on spot, during submission below types are used only accepted as limit order
            'IMMEDIATE_OR_CANCEL': 'limit',
            'FILL_OR_KILL': 'limit',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderStatus(status) {
        const statuses = {
            'NEW': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PARTIALLY_FILLED': 'open',
            'PARTIALLY_CANCELED': 'canceled',
            // contracts v1
            // '1': 'uninformed', // TODO: wt?
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
            // '5': 'invalid', //  TODO: wt?
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderTimeInForce(status) {
        const statuses = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
        };
        return this.safeString(statuses, status, status);
    }
    getTifFromRawOrderType(orderType = undefined) {
        const statuses = {
            'LIMIT': 'GTC',
            'LIMIT_MAKER': 'POST_ONLY',
            'IMMEDIATE_OR_CANCEL': 'IOC',
            'FILL_OR_KILL': 'FOK',
            'MARKET': 'IOC',
        };
        return this.safeString(statuses, orderType, orderType);
    }
    async fetchAccountHelper(type, params) {
        if (type === 'spot') {
            return await this.spotPrivateGetAccount(params);
            //
            //     {
            //         "makerCommission": "20",
            //         "takerCommission": "20",
            //         "buyerCommission": "0",
            //         "sellerCommission": "0",
            //         "canTrade": true,
            //         "canWithdraw": true,
            //         "canDeposit": true,
            //         "updateTime": null,
            //         "accountType": "SPOT",
            //         "balances": [
            //             {
            //                 "asset": "BTC",
            //                 "free": "0.002",
            //                 "locked": "0"
            //             },
            //             {
            //                 "asset": "USDT",
            //                 "free": "88.120131350620957006",
            //                 "locked": "0"
            //             },
            //         ],
            //         "permissions": [
            //             "SPOT"
            //         ]
            //     }
            //
        }
        else if (type === 'swap') {
            const response = await this.contractPrivateGetAccountAssets(params);
            //
            //     {
            //         "success":true,
            //         "code":0,
            //         "data":[
            //            {
            //              "currency":"BSV",
            //              "positionMargin":0,
            //              "availableBalance":0,
            //              "cashBalance":0,
            //              "frozenBalance":0,
            //              "equity":0,
            //              "unrealized":0,
            //              "bonus":0
            //           },
            //         ]
            //     }
            //
            return this.safeValue(response, 'data');
        }
        return undefined;
    }
    /**
     * @method
     * @name mexc#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-information
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-informations-of-user-39-s-asset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        // TODO: is the below endpoints suitable for fetchAccounts?
        const [marketType, query] = this.handleMarketTypeAndParams('fetchAccounts', undefined, params);
        await this.loadMarkets();
        const response = await this.fetchAccountHelper(marketType, query);
        const data = this.safeValue(response, 'balances', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const currencyId = this.safeString2(account, 'asset', 'currency');
            const code = this.safeCurrencyCode(currencyId);
            result.push({
                'id': this.safeString(account, 'id'),
                'type': this.safeString(account, 'type'),
                'code': code,
                'info': account,
            });
        }
        return result;
    }
    /**
     * @method
     * @name mexc#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-mx-deduct-status
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.BadRequest(this.id + ' fetchTradingFee() supports spot markets only');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.spotPrivateGetTradeFee(this.extend(request, params));
        //
        //  {
        //      "data":{
        //        "makerCommission":0.003000000000000000,
        //        "takerCommission":0.003000000000000000
        //      },
        //      "code":0,
        //      "msg":"success",
        //      "timestamp":1669109672717
        //  }
        //
        const data = this.safeDict(response, 'data', {});
        return {
            'info': data,
            'symbol': symbol,
            'maker': this.safeNumber(data, 'makerCommission'),
            'taker': this.safeNumber(data, 'takerCommission'),
            'percentage': undefined,
            'tierBased': undefined,
        };
    }
    customParseBalance(response, marketType) {
        //
        // spot
        //
        //     {
        //         "asset": "USDT",
        //         "free": "0.000000000674",
        //         "locked": "0"
        //     }
        //
        // swap
        //
        //     {
        //         "currency": "BSV",
        //         "positionMargin": 0,
        //         "availableBalance": 0,
        //         "cashBalance": 0,
        //         "frozenBalance": 0,
        //         "equity": 0,
        //         "unrealized": 0,
        //         "bonus": 0
        //     }
        //
        // margin
        //
        //     {
        //         "baseAsset": {
        //             "asset": "BTC",
        //             "borrowEnabled": true,
        //             "borrowed": "0",
        //             "free": "0",
        //             "interest": "0",
        //             "locked": "0",
        //             "netAsset": "0",
        //             "netAssetOfBtc": "0",
        //             "repayEnabled": true,
        //             "totalAsset": "0"
        //         }
        //         "quoteAsset": {
        //             "asset": "USDT",
        //             "borrowEnabled": true,
        //             "borrowed": "0",
        //             "free": "10",
        //             "interest": "0",
        //             "locked": "0",
        //             "netAsset": "10",
        //             "netAssetOfBtc": "0",
        //             "repayEnabled": true,
        //             "totalAsset": "10"
        //         }
        //         "symbol": "BTCUSDT",
        //         "isolatedCreated": true,
        //         "enabled": true,
        //         "marginLevel": "999",
        //         "marginRatio": "9",
        //         "indexPrice": "16741.137068965517241379",
        //         "liquidatePrice": "--",
        //         "liquidateRate": "--",
        //         "tradeEnabled": true
        //     }
        //
        let wallet = undefined;
        if (marketType === 'margin') {
            wallet = this.safeValue(response, 'assets', []);
        }
        else if (marketType === 'swap') {
            wallet = this.safeValue(response, 'data', []);
        }
        else {
            wallet = this.safeValue(response, 'balances', []);
        }
        const result = { 'info': response };
        if (marketType === 'margin') {
            for (let i = 0; i < wallet.length; i++) {
                const entry = wallet[i];
                const marketId = this.safeString(entry, 'symbol');
                const symbol = this.safeSymbol(marketId, undefined);
                const base = this.safeValue(entry, 'baseAsset', {});
                const quote = this.safeValue(entry, 'quoteAsset', {});
                const baseCode = this.safeCurrencyCode(this.safeString(base, 'asset'));
                const quoteCode = this.safeCurrencyCode(this.safeString(quote, 'asset'));
                const subResult = {};
                subResult[baseCode] = this.parseBalanceHelper(base);
                subResult[quoteCode] = this.parseBalanceHelper(quote);
                result[symbol] = this.safeBalance(subResult);
            }
            return result;
        }
        else if (marketType === 'swap') {
            for (let i = 0; i < wallet.length; i++) {
                const entry = wallet[i];
                const currencyId = this.safeString(entry, 'currency');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(entry, 'availableBalance');
                account['used'] = this.safeString(entry, 'frozenBalance');
                result[code] = account;
            }
            return this.safeBalance(result);
        }
        else {
            for (let i = 0; i < wallet.length; i++) {
                const entry = wallet[i];
                const currencyId = this.safeString(entry, 'asset');
                const code = this.safeCurrencyCode(currencyId);
                const account = this.account();
                account['free'] = this.safeString(entry, 'free');
                account['used'] = this.safeString(entry, 'locked');
                result[code] = account;
            }
            return this.safeBalance(result);
        }
    }
    parseBalanceHelper(entry) {
        const account = this.account();
        account['used'] = this.safeString(entry, 'locked');
        account['free'] = this.safeString(entry, 'free');
        account['total'] = this.safeString(entry, 'totalAsset');
        const debt = this.safeString(entry, 'borrowed');
        const interest = this.safeString(entry, 'interest');
        account['debt'] = Precise["default"].stringAdd(debt, interest);
        return account;
    }
    /**
     * @method
     * @name mexc#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-information
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-informations-of-user-39-s-asset
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#isolated-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbols] // required for margin, market id's separated by commas
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let marketType = undefined;
        const request = {};
        [marketType, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const marginMode = this.safeString(params, 'marginMode');
        const isMargin = this.safeBool(params, 'margin', false);
        params = this.omit(params, ['margin', 'marginMode']);
        let response = undefined;
        if ((marginMode !== undefined) || (isMargin) || (marketType === 'margin')) {
            let parsedSymbols = undefined;
            const symbol = this.safeString(params, 'symbol');
            if (symbol === undefined) {
                const symbols = this.safeValue(params, 'symbols');
                if (symbols !== undefined) {
                    parsedSymbols = this.marketIds(symbols).join(',');
                }
            }
            else {
                const market = this.market(symbol);
                parsedSymbols = market['id'];
            }
            this.checkRequiredArgument('fetchBalance', parsedSymbols, 'symbol or symbols');
            marketType = 'margin';
            request['symbols'] = parsedSymbols;
            params = this.omit(params, ['symbol', 'symbols']);
            response = await this.spotPrivateGetMarginIsolatedAccount(this.extend(request, params));
        }
        else if (marketType === 'spot') {
            response = await this.spotPrivateGetAccount(this.extend(request, params));
        }
        else if (marketType === 'swap') {
            response = await this.contractPrivateGetAccountAssets(this.extend(request, params));
        }
        else {
            throw new errors.NotSupported(this.id + ' fetchBalance() not support this method');
        }
        //
        // spot
        //
        //     {
        //         "makerCommission": 0,
        //         "takerCommission": 20,
        //         "buyerCommission": 0,
        //         "sellerCommission": 0,
        //         "canTrade": true,
        //         "canWithdraw": true,
        //         "canDeposit": true,
        //         "updateTime": null,
        //         "accountType": "SPOT",
        //         "balances": [
        //             {
        //                 "asset": "USDT",
        //                 "free": "0.000000000674",
        //                 "locked": "0"
        //             },
        //         ],
        //         "permissions": ["SPOT"]
        //     }
        //
        // swap
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "currency": "BSV",
        //                 "positionMargin": 0,
        //                 "availableBalance": 0,
        //                 "cashBalance": 0,
        //                 "frozenBalance": 0,
        //                 "equity": 0,
        //                 "unrealized": 0,
        //                 "bonus": 0
        //             },
        //         ]
        //     }
        //
        // margin
        //
        //     {
        //         "assets": [
        //             {
        //                 "baseAsset": {
        //                     "asset": "BTC",
        //                     "borrowEnabled": true,
        //                     "borrowed": "0",
        //                     "free": "0",
        //                     "interest": "0",
        //                     "locked": "0",
        //                     "netAsset": "0",
        //                     "netAssetOfBtc": "0",
        //                     "repayEnabled": true,
        //                     "totalAsset": "0"
        //                 },
        //                 "quoteAsset": {
        //                     "asset": "USDT",
        //                     "borrowEnabled": true,
        //                     "borrowed": "0",
        //                     "free": "10",
        //                     "interest": "0",
        //                     "locked": "0",
        //                     "netAsset": "10",
        //                     "netAssetOfBtc": "0",
        //                     "repayEnabled": true,
        //                     "totalAsset": "10"
        //                 },
        //                 "symbol": "BTCUSDT",
        //                 "isolatedCreated": true,
        //                 "enabled": true,
        //                 "marginLevel": "999",
        //                 "marginRatio": "9",
        //                 "indexPrice": "16741.137068965517241379",
        //                 "liquidatePrice": "--",
        //                 "liquidateRate": "--",
        //                 "tradeEnabled": true
        //             }
        //         ]
        //     }
        //
        return this.customParseBalance(response, marketType);
    }
    /**
     * @method
     * @name mexc#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-trade-list
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-all-transaction-details-of-the-user-s-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let marketType = undefined;
        [marketType, params] = this.handleMarketTypeAndParams('fetchMyTrades', market, params);
        const request = {
            'symbol': market['id'],
        };
        let trades = undefined;
        if (marketType === 'spot') {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            const until = this.safeInteger(params, 'until');
            if (until !== undefined) {
                params = this.omit(params, 'until');
                request['endTime'] = until;
            }
            trades = await this.spotPrivateGetMyTrades(this.extend(request, params));
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "id": "133948532984922113",
            //             "orderId": "133948532531949568",
            //             "orderListId": "-1",
            //             "price": "41995.51",
            //             "qty": "0.0002",
            //             "quoteQty": "8.399102",
            //             "commission": "0.016798204",
            //             "commissionAsset": "USDT",
            //             "time": "1647718055000",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "isBestMatch": true
            //         }
            //     ]
            //
        }
        else {
            if (since !== undefined) {
                request['start_time'] = since;
                const end = this.safeInteger(params, 'end_time');
                if (end === undefined) {
                    request['end_time'] = this.sum(since, this.options['maxTimeTillEnd']);
                }
            }
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
            const response = await this.contractPrivateGetOrderListOrderDeals(this.extend(request, params));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "id": "299444585",
            //                 "symbol": "STEPN_USDT",
            //                 "side": "1",
            //                 "vol": "1",
            //                 "price": "2.45455",
            //                 "feeCurrency": "USDT",
            //                 "fee": "0.00147273",
            //                 "timestamp": "1648924557000",
            //                 "profit": "0",
            //                 "category": "1",
            //                 "orderId": "265307163526610432",
            //                 "positionMode": "1",
            //                 "taker": true
            //             }
            //         ]
            //     }
            //
            trades = this.safeValue(response, 'data');
        }
        return this.parseTrades(trades, market, since, limit);
    }
    /**
     * @method
     * @name mexc#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#account-trade-list
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#query-the-order-based-on-the-order-number
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const [marketType, query] = this.handleMarketTypeAndParams('fetchOrderTrades', market, params);
        let trades = undefined;
        if (marketType === 'spot') {
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' fetchOrderTrades() requires a symbol argument');
            }
            request['symbol'] = market['id'];
            request['orderId'] = id;
            trades = await this.spotPrivateGetMyTrades(this.extend(request, query));
            //
            // spot
            //
            //     [
            //         {
            //             "symbol": "BTCUSDT",
            //             "id": "133948532984922113",
            //             "orderId": "133948532531949568",
            //             "orderListId": "-1",
            //             "price": "41995.51",
            //             "qty": "0.0002",
            //             "quoteQty": "8.399102",
            //             "commission": "0.016798204",
            //             "commissionAsset": "USDT",
            //             "time": "1647718055000",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "isBestMatch": true
            //         }
            //     ]
            //
        }
        else {
            request['order_id'] = id;
            const response = await this.contractPrivateGetOrderDealDetailsOrderId(this.extend(request, query));
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": [
            //             {
            //                 "id": "299444585",
            //                 "symbol": "STEPN_USDT",
            //                 "side": "1",
            //                 "vol": "1",
            //                 "price": "2.45455",
            //                 "feeCurrency": "USDT",
            //                 "fee": "0.00147273",
            //                 "timestamp": "1648924557000",
            //                 "profit": "0",
            //                 "category": "1",
            //                 "orderId": "265307163526610432",
            //                 "positionMode": "1",
            //                 "taker": true
            //             }
            //         ]
            //     }
            //
            trades = this.safeValue(response, 'data');
        }
        return this.parseTrades(trades, market, since, limit, query);
    }
    async modifyMarginHelper(symbol, amount, addOrReduce, params = {}) {
        const positionId = this.safeInteger(params, 'positionId');
        if (positionId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' modifyMarginHelper() requires a positionId parameter');
        }
        await this.loadMarkets();
        const request = {
            'positionId': positionId,
            'amount': amount,
            'type': addOrReduce,
        };
        const response = await this.contractPrivatePostPositionChangeMargin(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0
        //     }
        return response;
    }
    /**
     * @method
     * @name mexc#reduceMargin
     * @description remove margin from a position
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#increase-or-decrease-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    async reduceMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'SUB', params);
    }
    /**
     * @method
     * @name mexc#addMargin
     * @description add margin
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#increase-or-decrease-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    async addMargin(symbol, amount, params = {}) {
        return await this.modifyMarginHelper(symbol, amount, 'ADD', params);
    }
    /**
     * @method
     * @name mexc#setLeverage
     * @description set the level of leverage for a market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#switch-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'leverage': leverage,
        };
        const positionId = this.safeInteger(params, 'positionId');
        if (positionId === undefined) {
            const openType = this.safeNumber(params, 'openType'); // 1 or 2
            const positionType = this.safeNumber(params, 'positionType'); // 1 or 2
            const market = (symbol !== undefined) ? this.market(symbol) : undefined;
            if ((openType === undefined) || (positionType === undefined) || (market === undefined)) {
                throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a positionId parameter or a symbol argument with openType and positionType parameters, use openType 1 or 2 for isolated or cross margin respectively, use positionType 1 or 2 for long or short positions');
            }
            else {
                request['openType'] = openType;
                request['symbol'] = market['id'];
                request['positionType'] = positionType;
            }
        }
        else {
            request['positionId'] = positionId;
        }
        return await this.contractPrivatePostPositionChangeLeverage(this.extend(request, params));
    }
    /**
     * @method
     * @name mexc#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-details-of-user-s-funding-rate
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {
        // 'symbol': market['id'],
        // 'position_id': positionId,
        // 'page_num': 1,
        // 'page_size': limit, // default 20, max 100
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPrivateGetPositionFundingRecords(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "pageSize": 20,
        //             "totalCount": 2,
        //             "totalPage": 1,
        //             "currentPage": 1,
        //             "resultList": [
        //                 {
        //                     "id": 7423910,
        //                     "symbol": "BTC_USDT",
        //                     "positionType": 1,
        //                     "positionValue": 29.30024,
        //                     "funding": 0.00076180624,
        //                     "rate": -0.000026,
        //                     "settleTime": 1643299200000
        //                 },
        //                 {
        //                     "id": 7416473,
        //                     "symbol": "BTC_USDT",
        //                     "positionType": 1,
        //                     "positionValue": 28.9188,
        //                     "funding": 0.0014748588,
        //                     "rate": -0.000051,
        //                     "settleTime": 1643270400000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue(response, 'data', {});
        const resultList = this.safeValue(data, 'resultList', []);
        const result = [];
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeInteger(entry, 'settleTime');
            result.push({
                'info': entry,
                'symbol': symbol,
                'code': undefined,
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
                'id': this.safeNumber(entry, 'id'),
                'amount': this.safeNumber(entry, 'funding'),
            });
        }
        return result;
    }
    parseFundingRate(contract, market = undefined) {
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "fundingRate": 0.000014,
        //         "maxFundingRate": 0.003,
        //         "minFundingRate": -0.003,
        //         "collectCycle": 8,
        //         "nextSettleTime": 1643241600000,
        //         "timestamp": 1643240373359
        //     }
        //
        const nextFundingRate = this.safeNumber(contract, 'fundingRate');
        const nextFundingTimestamp = this.safeInteger(contract, 'nextSettleTime');
        const marketId = this.safeString(contract, 'symbol');
        const symbol = this.safeSymbol(marketId, market, undefined, 'contract');
        const timestamp = this.safeInteger(contract, 'timestamp');
        const interval = this.safeString(contract, 'collectCycle');
        let intervalString = undefined;
        if (interval !== undefined) {
            intervalString = interval + 'h';
        }
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'fundingRate': nextFundingRate,
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601(nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': intervalString,
        };
    }
    /**
     * @method
     * @name mexc#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingInterval(symbol, params = {}) {
        return await this.fetchFundingRate(symbol, params);
    }
    /**
     * @method
     * @name mexc#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    async fetchFundingRate(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractPublicGetFundingRateSymbol(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": {
        //             "symbol": "BTC_USDT",
        //             "fundingRate": 0.000014,
        //             "maxFundingRate": 0.003,
        //             "minFundingRate": -0.003,
        //             "collectCycle": 8,
        //             "nextSettleTime": 1643241600000,
        //             "timestamp": 1643240373359
        //         }
        //     }
        //
        const result = this.safeValue(response, 'data', {});
        return this.parseFundingRate(result, market);
    }
    /**
     * @method
     * @name mexc#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-contract-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by mexc, but filtered internally by ccxt
     * @param {int} [limit] mexc limit is page_size default 20, maximum is 100
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
            // 'page_size': limit, // optional
            // 'page_num': 1, // optional, current page number, default is 1
        };
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPublicGetFundingRateHistory(this.extend(request, params));
        //
        //    {
        //        "success": true,
        //        "code": 0,
        //        "data": {
        //            "pageSize": 2,
        //            "totalCount": 21,
        //            "totalPage": 11,
        //            "currentPage": 1,
        //            "resultList": [
        //                {
        //                    "symbol": "BTC_USDT",
        //                    "fundingRate": 0.000266,
        //                    "settleTime": 1609804800000
        //                },
        //                {
        //                    "symbol": "BTC_USDT",
        //                    "fundingRate": 0.00029,
        //                    "settleTime": 1609776000000
        //                }
        //            ]
        //        }
        //    }
        //
        const data = this.safeValue(response, 'data');
        const result = this.safeValue(data, 'resultList', []);
        const rates = [];
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const marketId = this.safeString(entry, 'symbol');
            const symbolInner = this.safeSymbol(marketId);
            const timestamp = this.safeInteger(entry, 'settleTime');
            rates.push({
                'info': entry,
                'symbol': symbolInner,
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, market['symbol'], since, limit);
    }
    /**
     * @method
     * @name mexc#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes, if a market has a leverage tier of 0, then the leverage tiers cannot be obtained for this market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-contract-information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, 'swap', true, true);
        const response = await this.contractPublicGetDetail(params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":[
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "displayName": "BTC_USDT永续",
        //                 "displayNameEn": "BTC_USDT SWAP",
        //                 "positionOpenType": 3,
        //                 "baseCoin": "BTC",
        //                 "quoteCoin": "USDT",
        //                 "settleCoin": "USDT",
        //                 "contractSize": 0.0001,
        //                 "minLeverage": 1,
        //                 "maxLeverage": 125,
        //                 "priceScale": 2,
        //                 "volScale": 0,
        //                 "amountScale": 4,
        //                 "priceUnit": 0.5,
        //                 "volUnit": 1,
        //                 "minVol": 1,
        //                 "maxVol": 1000000,
        //                 "bidLimitPriceRate": 0.1,
        //                 "askLimitPriceRate": 0.1,
        //                 "takerFeeRate": 0.0006,
        //                 "makerFeeRate": 0.0002,
        //                 "maintenanceMarginRate": 0.004,
        //                 "initialMarginRate": 0.008,
        //                 "riskBaseVol": 10000,
        //                 "riskIncrVol": 200000,
        //                 "riskIncrMmr": 0.004,
        //                 "riskIncrImr": 0.004,
        //                 "riskLevelLimit": 5,
        //                 "priceCoefficientVariation": 0.1,
        //                 "indexOrigin": ["BINANCE","GATEIO","HUOBI","MXC"],
        //                 "state": 0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //                 "isNew": false,
        //                 "isHot": true,
        //                 "isHidden": false
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data');
        return this.parseLeverageTiers(data, symbols, 'symbol');
    }
    parseMarketLeverageTiers(info, market = undefined) {
        //
        //    {
        //        "symbol": "BTC_USDT",
        //        "displayName": "BTC_USDT永续",
        //        "displayNameEn": "BTC_USDT SWAP",
        //        "positionOpenType": 3,
        //        "baseCoin": "BTC",
        //        "quoteCoin": "USDT",
        //        "settleCoin": "USDT",
        //        "contractSize": 0.0001,
        //        "minLeverage": 1,
        //        "maxLeverage": 125,
        //        "priceScale": 2,
        //        "volScale": 0,
        //        "amountScale": 4,
        //        "priceUnit": 0.5,
        //        "volUnit": 1,
        //        "minVol": 1,
        //        "maxVol": 1000000,
        //        "bidLimitPriceRate": 0.1,
        //        "askLimitPriceRate": 0.1,
        //        "takerFeeRate": 0.0006,
        //        "makerFeeRate": 0.0002,
        //        "maintenanceMarginRate": 0.004,
        //        "initialMarginRate": 0.008,
        //        "riskBaseVol": 10000,
        //        "riskIncrVol": 200000,
        //        "riskIncrMmr": 0.004,
        //        "riskIncrImr": 0.004,
        //        "riskLevelLimit": 5,
        //        "priceCoefficientVariation": 0.1,
        //        "indexOrigin": ["BINANCE","GATEIO","HUOBI","MXC"],
        //        "state": 0, // 0 enabled, 1 delivery, 2 completed, 3 offline, 4 pause
        //        "isNew": false,
        //        "isHot": true,
        //        "isHidden": false
        //    }
        //
        const marketId = this.safeString(info, 'symbol');
        let maintenanceMarginRate = this.safeString(info, 'maintenanceMarginRate');
        let initialMarginRate = this.safeString(info, 'initialMarginRate');
        const maxVol = this.safeString(info, 'maxVol');
        const riskIncrVol = this.safeString(info, 'riskIncrVol');
        const riskIncrMmr = this.safeString(info, 'riskIncrMmr');
        const riskIncrImr = this.safeString(info, 'riskIncrImr');
        let floor = '0';
        const tiers = [];
        const quoteId = this.safeString(info, 'quoteCoin');
        if (riskIncrVol === '0') {
            return [
                {
                    'tier': 0,
                    'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
                    'currency': this.safeCurrencyCode(quoteId),
                    'minNotional': undefined,
                    'maxNotional': undefined,
                    'maintenanceMarginRate': undefined,
                    'maxLeverage': this.safeNumber(info, 'maxLeverage'),
                    'info': info,
                },
            ];
        }
        while (Precise["default"].stringLt(floor, maxVol)) {
            const cap = Precise["default"].stringAdd(floor, riskIncrVol);
            tiers.push({
                'tier': this.parseNumber(Precise["default"].stringDiv(cap, riskIncrVol)),
                'symbol': this.safeSymbol(marketId, market, undefined, 'contract'),
                'currency': this.safeCurrencyCode(quoteId),
                'minNotional': this.parseNumber(floor),
                'maxNotional': this.parseNumber(cap),
                'maintenanceMarginRate': this.parseNumber(maintenanceMarginRate),
                'maxLeverage': this.parseNumber(Precise["default"].stringDiv('1', initialMarginRate)),
                'info': info,
            });
            initialMarginRate = Precise["default"].stringAdd(initialMarginRate, riskIncrImr);
            maintenanceMarginRate = Precise["default"].stringAdd(maintenanceMarginRate, riskIncrMmr);
            floor = cap;
        }
        return tiers;
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //    {
        //        coin: "USDT",
        //        network: "BNB Smart Chain(BEP20)",
        //        address: "0x0d48003e0c27c5de62b97c9b4cdb31fdd29da619",
        //        memo:  null
        //    }
        //
        const address = this.safeString(depositAddress, 'address');
        const currencyId = this.safeString(depositAddress, 'coin');
        const networkId = this.safeString(depositAddress, 'netWork');
        this.checkAddress(address);
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode(currencyId, currency),
            'network': this.networkIdToCode(networkId, currencyId),
            'address': address,
            'tag': this.safeString(depositAddress, 'memo'),
        };
    }
    /**
     * @method
     * @name mexc#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-address-supporting-network
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    async fetchDepositAddressesByNetwork(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
        };
        const networkCode = this.safeString(params, 'network');
        let networkId = undefined;
        if (networkCode !== undefined) {
            // createDepositAddress and fetchDepositAddress use a different network-id compared to withdraw
            const networkUnified = this.networkIdToCode(networkCode, code);
            const networks = this.safeDict(currency, 'networks', {});
            if (networkUnified in networks) {
                const network = this.safeDict(networks, networkUnified, {});
                const networkInfo = this.safeValue(network, 'info', {});
                networkId = this.safeString(networkInfo, 'network');
            }
            else {
                networkId = this.networkCodeToId(networkCode, code);
            }
        }
        if (networkId !== undefined) {
            request['network'] = networkId;
        }
        params = this.omit(params, 'network');
        const response = await this.spotPrivateGetCapitalDepositAddress(this.extend(request, params));
        //
        //    [
        //        {
        //            coin: "USDT",
        //            network: "BNB Smart Chain(BEP20)",
        //            address: "0x0d48003e0c27c5de62b97c9b4cdb31fdd29da619",
        //            memo:  null
        //        }
        //        ...
        //    ]
        //
        const addressStructures = this.parseDepositAddresses(response, undefined, false);
        return this.indexBy(addressStructures, 'network');
    }
    /**
     * @method
     * @name mexc#createDepositAddress
     * @description create a currency deposit address
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#generate-deposit-address-supporting-network
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async createDepositAddress(code, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'coin': currency['id'],
        };
        const networkCode = this.safeString(params, 'network');
        if (networkCode === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' createDepositAddress requires a `network` parameter');
        }
        // createDepositAddress and fetchDepositAddress use a different network-id compared to withdraw
        let networkId = undefined;
        const networkUnified = this.networkIdToCode(networkCode, code);
        const networks = this.safeDict(currency, 'networks', {});
        if (networkUnified in networks) {
            const network = this.safeDict(networks, networkUnified, {});
            const networkInfo = this.safeValue(network, 'info', {});
            networkId = this.safeString(networkInfo, 'network');
        }
        else {
            networkId = this.networkCodeToId(networkCode, code);
        }
        if (networkId !== undefined) {
            request['network'] = networkId;
        }
        params = this.omit(params, 'network');
        const response = await this.spotPrivatePostCapitalDepositAddress(this.extend(request, params));
        //     {
        //        "coin": "EOS",
        //        "network": "EOS",
        //        "address": "zzqqqqqqqqqq",
        //        "memo": "MX10068"
        //     }
        return this.parseDepositAddress(response, currency);
    }
    /**
     * @method
     * @name mexc#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-address-supporting-network
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the chain of currency, this only apply for multi-chain currency, and there is no need for single chain currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress(code, params = {}) {
        const network = this.safeString(params, 'network');
        const addressStructures = await this.fetchDepositAddressesByNetwork(code, params);
        let result = undefined;
        if (network !== undefined) {
            result = this.safeDict(addressStructures, this.networkIdToCode(network, code));
        }
        else {
            const options = this.safeDict(this.options, 'defaultNetworks');
            const defaultNetworkForCurrency = this.safeString(options, code);
            if (defaultNetworkForCurrency !== undefined) {
                result = this.safeDict(addressStructures, defaultNetworkForCurrency);
            }
            else {
                const keys = Object.keys(addressStructures);
                const key = this.safeString(keys, 0);
                result = this.safeDict(addressStructures, key);
            }
        }
        if (result === undefined) {
            throw new errors.InvalidAddress(this.id + ' fetchDepositAddress() cannot find a deposit address for ' + code + ', and network' + network + 'consider creating one using .createDepositAddress() method or in MEXC website');
        }
        return result;
    }
    /**
     * @method
     * @name mexc#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#deposit-history-supporting-network
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'coin': currency['id'] + network example: USDT-TRX,
        // 'status': 'status',
        // 'startTime': since, // default 90 days
        // 'endTime': this.nonce(),
        // 'limit': limit, // default 1000, maximum 1000
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
            // currently mexc does not have network names unified so for certain things we might need TRX or TRC-20
            // due to that I'm applying the network parameter directly so the user can control it on its side
            const rawNetwork = this.safeString(params, 'network');
            if (rawNetwork !== undefined) {
                params = this.omit(params, 'network');
                request['coin'] = request['coin'] + '-' + rawNetwork;
            }
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                throw new errors.ExchangeError('This exchange supports a maximum limit of 1000');
            }
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetCapitalDepositHisrec(this.extend(request, params));
        //
        // [
        //     {
        //         "amount": "10",
        //         "coin": "USDC-TRX",
        //         "network": "TRX",
        //         "status": "5",
        //         "address": "TSMcEDDvkqY9dz8RkFnrS86U59GwEZjfvh",
        //         "txId": "51a8f49e6f03f2c056e71fe3291aa65e1032880be855b65cecd0595a1b8af95b:0",
        //         "insertTime": "1664805021000",
        //         "unlockConfirm": "200",
        //         "confirmTimes": "203",
        //         "memo": "xxyy1122",
        //         "transHash": "51a8f49e6f03f2c056e71fe3291aa65e1032880be855b65cecd0595a1b8af95b",
        //         "updateTime": "1664805621000",
        //         "netWork: "TRX"
        //     }
        // ]
        //
        return this.parseTransactions(response, currency, since, limit);
    }
    /**
     * @method
     * @name mexc#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#withdraw-history-supporting-network
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
        // 'coin': currency['id'],
        // 'status': 'status',
        // 'startTime': since, // default 90 days
        // 'endTime': this.nonce(),
        // 'limit': limit, // default 1000, maximum 1000
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            if (limit > 1000) {
                throw new errors.ExchangeError('This exchange supports a maximum limit of 1000');
            }
            request['limit'] = limit;
        }
        const response = await this.spotPrivateGetCapitalWithdrawHistory(this.extend(request, params));
        //
        // [
        //     {
        //       "id": "adcd1c8322154de691b815eedcd10c42",
        //       "txId": "0xc8c918cd69b2246db493ef6225a72ffdc664f15b08da3e25c6879b271d05e9d0:0",
        //       "coin": "USDC-MATIC",
        //       "network": "MATIC",
        //       "address": "0xeE6C7a415995312ED52c53a0f8f03e165e0A5D62",
        //       "amount": "2",
        //       "transferType": "0",
        //       "status": "7",
        //       "transactionFee": "1",
        //       "confirmNo": null,
        //       "applyTime": "1664882739000",
        //       "remark": '',
        //       "memo": null,
        //       "explorerUrl": "https://etherscan.io/tx/0xc8c918cd69b2246db493ef6225a72ffdc664f15b08da3e25c6879b271d05e9d0",
        //       "transHash": "0xc8c918cd69b2246db493ef6225a72ffdc664f15b08da3e25c6879b271d05e9d0",
        //       "updateTime": "1664882799000",
        //       "netWork: "MATIC"
        //     }
        // ]
        //
        return this.parseTransactions(response, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        // {
        //     "amount": "10",
        //     "coin": "USDC-TRX",
        //     "network": "TRX",
        //     "status": "5",
        //     "address": "TSMcEDDvkqY9dz8RkFnrS86U59GwEZjfvh",
        //     "txId": "51a8f49e6f03f2c056e71fe3291aa65e1032880be855b65cecd0595a1b8af95b:0",
        //     "insertTime": "1664805021000",
        //     "unlockConfirm": "200",
        //     "confirmTimes": "203",
        //     "memo": "xxyy1122",
        //     "transHash": "51a8f49e6f03f2c056e71fe3291aa65e1032880be855b65cecd0595a1b8af95b",
        //     "updateTime": "1664805621000",
        //     "netWork: "TRX"
        // }
        //
        // fetchWithdrawals
        //
        // {
        //     "id": "adcd1c8322154de691b815eedcd10c42",
        //     "txId": "0xc8c918cd69b2246db493ef6225a72ffdc664f15b08da3e25c6879b271d05e9d0:0",
        //     "coin": "USDC-MATIC",
        //     "network": "MATIC",
        //     "address": "0xeE6C7a415995312ED52c53a0f8f03e165e0A5D62",
        //     "amount": "2",
        //     "transferType": "0",
        //     "status": "7",
        //     "transactionFee": "1",
        //     "confirmNo": null,
        //     "applyTime": "1664882739000",
        //     "remark": "",
        //     "memo": null,
        //     "explorerUrl": "https://etherscan.io/tx/0xc8c918cd69b2246db493ef6225a72ffdc664f15b08da3e25c6879b271d05e9d0",
        //     "transHash": "0xc8c918cd69b2246db493ef6225a72ffdc664f15b08da3e25c6879b271d05e9d0",
        //     "updateTime": "1664882799000",
        //     "netWork: "MATIC"
        //   }
        //
        // withdraw
        //
        //     {
        //         "id":"25fb2831fb6d4fc7aa4094612a26c81d"
        //     }
        //
        // internal withdraw (aka internal-transfer)
        //
        //     {
        //         "tranId":"ad36f0e9c9a24ae794b36fa4f152e471"
        //     }
        //
        const id = this.safeString2(transaction, 'id', 'tranId');
        const type = (id === undefined) ? 'deposit' : 'withdrawal';
        const timestamp = this.safeInteger2(transaction, 'insertTime', 'applyTime');
        const updated = this.safeInteger(transaction, 'updateTime');
        let currencyId = undefined;
        const currencyWithNetwork = this.safeString(transaction, 'coin');
        if (currencyWithNetwork !== undefined) {
            currencyId = currencyWithNetwork.split('-')[0];
        }
        let network = undefined;
        const rawNetwork = this.safeString(transaction, 'network');
        if (rawNetwork !== undefined) {
            network = this.networkIdToCode(rawNetwork);
        }
        const code = this.safeCurrencyCode(currencyId, currency);
        const status = this.parseTransactionStatusByType(this.safeString(transaction, 'status'), type);
        let amountString = this.safeString(transaction, 'amount');
        const address = this.safeString(transaction, 'address');
        const txid = this.safeString2(transaction, 'transHash', 'txId');
        let fee = undefined;
        const feeCostString = this.safeString(transaction, 'transactionFee');
        if (feeCostString !== undefined) {
            fee = {
                'cost': this.parseNumber(feeCostString),
                'currency': code,
            };
        }
        if (type === 'withdrawal') {
            // mexc withdrawal amount includes the fee
            amountString = Precise["default"].stringSub(amountString, feeCostString);
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': network,
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': this.safeString(transaction, 'memo'),
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': this.parseNumber(amountString),
            'currency': code,
            'status': status,
            'updated': updated,
            'comment': this.safeString(transaction, 'remark'),
            'internal': undefined,
            'fee': fee,
        };
    }
    parseTransactionStatusByType(status, type = undefined) {
        const statusesByType = {
            'deposit': {
                '1': 'failed',
                '2': 'pending',
                '3': 'pending',
                '4': 'pending',
                '5': 'ok',
                '6': 'pending',
                '7': 'failed', // REJECTED
            },
            'withdrawal': {
                '1': 'pending',
                '2': 'pending',
                '3': 'pending',
                '4': 'pending',
                '5': 'pending',
                '6': 'pending',
                '7': 'ok',
                '8': 'failed',
                '9': 'canceled',
                '10': 'pending', // MANUAL
            },
        };
        const statuses = this.safeValue(statusesByType, type, {});
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name mexc#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.fetchPositions(undefined, this.extend(request, params));
        return this.safeValue(response, 0);
    }
    /**
     * @method
     * @name mexc#fetchPositions
     * @description fetch all open positions
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.contractPrivateGetPositionOpenPositions(params);
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "positionId": 1394650,
        //                 "symbol": "ETH_USDT",
        //                 "positionType": 1,
        //                 "openType": 1,
        //                 "state": 1,
        //                 "holdVol": 1,
        //                 "frozenVol": 0,
        //                 "closeVol": 0,
        //                 "holdAvgPrice": 1217.3,
        //                 "openAvgPrice": 1217.3,
        //                 "closeAvgPrice": 0,
        //                 "liquidatePrice": 1211.2,
        //                 "oim": 0.1290338,
        //                 "im": 0.1290338,
        //                 "holdFee": 0,
        //                 "realised": -0.0073,
        //                 "leverage": 100,
        //                 "createTime": 1609991676000,
        //                 "updateTime": 1609991676000,
        //                 "autoAddIm": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parsePositions(data, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        // fetchPositions
        //
        //     {
        //         "positionId": 1394650,
        //         "symbol": "ETH_USDT",
        //         "positionType": 1,
        //         "openType": 1,
        //         "state": 1,
        //         "holdVol": 1,
        //         "frozenVol": 0,
        //         "closeVol": 0,
        //         "holdAvgPrice": 1217.3,
        //         "openAvgPrice": 1217.3,
        //         "closeAvgPrice": 0,
        //         "liquidatePrice": 1211.2,
        //         "oim": 0.1290338,
        //         "im": 0.1290338,
        //         "holdFee": 0,
        //         "realised": -0.0073,
        //         "leverage": 100,
        //         "createTime": 1609991676000,
        //         "updateTime": 1609991676000,
        //         "autoAddIm": false
        //     }
        //
        // fetchPositionsHistory
        //
        //    {
        //        positionId: '390281084',
        //        symbol: 'RVN_USDT',
        //        positionType: '1',
        //        openType: '2',
        //        state: '3',
        //        holdVol: '0',
        //        frozenVol: '0',
        //        closeVol: '1141',
        //        holdAvgPrice: '0.03491',
        //        holdAvgPriceFullyScale: '0.03491',
        //        openAvgPrice: '0.03491',
        //        openAvgPriceFullyScale: '0.03491',
        //        closeAvgPrice: '0.03494',
        //        liquidatePrice: '0.03433',
        //        oim: '0',
        //        im: '0',
        //        holdFee: '0',
        //        realised: '0.1829',
        //        leverage: '50',
        //        createTime: '1711512408000',
        //        updateTime: '1711512553000',
        //        autoAddIm: false,
        //        version: '4',
        //        profitRatio: '0.0227',
        //        newOpenAvgPrice: '0.03491',
        //        newCloseAvgPrice: '0.03494',
        //        closeProfitLoss: '0.3423',
        //        fee: '0.1593977',
        //        positionShowStatus: 'CLOSED'
        //    }
        //
        market = this.safeMarket(this.safeString(position, 'symbol'), market, undefined, 'swap');
        const symbol = market['symbol'];
        const contracts = this.safeString(position, 'holdVol');
        const entryPrice = this.safeNumber(position, 'openAvgPrice');
        const initialMargin = this.safeString(position, 'im');
        const rawSide = this.safeString(position, 'positionType');
        const side = (rawSide === '1') ? 'long' : 'short';
        const openType = this.safeString(position, 'margin_mode');
        const marginType = (openType === '1') ? 'isolated' : 'cross';
        const leverage = this.safeNumber(position, 'leverage');
        const liquidationPrice = this.safeNumber(position, 'liquidatePrice');
        const timestamp = this.safeInteger(position, 'updateTime');
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'contracts': this.parseNumber(contracts),
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'collateral': undefined,
            'side': side,
            'unrealizedPnl': undefined,
            'leverage': this.parseNumber(leverage),
            'percentage': undefined,
            'marginMode': marginType,
            'notional': undefined,
            'markPrice': undefined,
            'lastPrice': undefined,
            'liquidationPrice': liquidationPrice,
            'initialMargin': this.parseNumber(initialMargin),
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'marginRatio': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'hedged': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'lastUpdateTimestamp': undefined,
        });
    }
    /**
     * @method
     * @name mexc#fetchTransfer
     * @description fetches a transfer
     * @see https://mexcdevelop.github.io/apidocs/spot_v2_en/#internal-assets-transfer-order-inquiry
     * @param {string} id transfer id
     * @param {string} [code] not used by mexc fetchTransfer
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfer(id, code = undefined, params = {}) {
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTransfer', undefined, params);
        await this.loadMarkets();
        if (marketType === 'spot') {
            const request = {
                'transact_id': id,
            };
            const response = await this.spot2PrivateGetAssetInternalTransferInfo(this.extend(request, query));
            //
            //     {
            //         "code": "200",
            //         "data": {
            //             "currency": "USDT",
            //             "amount": "1",
            //             "transact_id": "954877a2ef54499db9b28a7cf9ebcf41",
            //             "from": "MAIN",
            //             "to": "CONTRACT",
            //             "transact_state": "SUCCESS"
            //         }
            //     }
            //
            const data = this.safeDict(response, 'data', {});
            return this.parseTransfer(data);
        }
        else if (marketType === 'swap') {
            throw new errors.BadRequest(this.id + ' fetchTransfer() is not supported for ' + marketType);
        }
        return undefined;
    }
    /**
     * @method
     * @name mexc#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://mexcdevelop.github.io/apidocs/spot_v2_en/#get-internal-assets-transfer-records
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-39-s-asset-transfer-records
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        const [marketType, query] = this.handleMarketTypeAndParams('fetchTransfers', undefined, params);
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        let resultList = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['id'];
        }
        if (marketType === 'spot') {
            if (since !== undefined) {
                request['start_time'] = since;
            }
            if (limit !== undefined) {
                if (limit > 50) {
                    throw new errors.ExchangeError('This exchange supports a maximum limit of 50');
                }
                request['page-size'] = limit;
            }
            const response = await this.spot2PrivateGetAssetInternalTransferRecord(this.extend(request, query));
            //
            //     {
            //         "code": "200",
            //         "data": {
            //             "total_page": "1",
            //             "total_size": "5",
            //             "result_list": [{
            //                     "currency": "USDT",
            //                     "amount": "1",
            //                     "transact_id": "954877a2ef54499db9b28a7cf9ebcf41",
            //                     "from": "MAIN",
            //                     "to": "CONTRACT",
            //                     "transact_state": "SUCCESS"
            //                 },
            //                 ...
            //             ]
            //         }
            //     }
            //
            const data = this.safeValue(response, 'data', {});
            resultList = this.safeValue(data, 'result_list', []);
        }
        else if (marketType === 'swap') {
            if (limit !== undefined) {
                request['page_size'] = limit;
            }
            const response = await this.contractPrivateGetAccountTransferRecord(this.extend(request, query));
            const data = this.safeValue(response, 'data');
            resultList = this.safeValue(data, 'resultList');
            //
            //     {
            //         "success": true,
            //         "code": "0",
            //         "data": {
            //             "pageSize": "20",
            //             "totalCount": "10",
            //             "totalPage": "1",
            //             "currentPage": "1",
            //             "resultList": [
            //                 {
            //                     "id": "2980812",
            //                     "txid": "fa8a1e7bf05940a3b7025856dc48d025",
            //                     "currency": "USDT",
            //                     "amount": "22.90213135",
            //                     "type": "IN",
            //                     "state": "SUCCESS",
            //                     "createTime": "1648849076000",
            //                     "updateTime": "1648849076000"
            //                 },
            //             ]
            //         }
            //     }
            //
        }
        return this.parseTransfers(resultList, currency, since, limit);
    }
    /**
     * @method
     * @name mexc#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#user-universal-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] market symbol required for margin account transfers eg:BTCUSDT
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        const accounts = {
            'spot': 'SPOT',
            'swap': 'FUTURES',
            'margin': 'ISOLATED_MARGIN',
        };
        const fromId = this.safeString(accounts, fromAccount);
        const toId = this.safeString(accounts, toAccount);
        if (fromId === undefined) {
            const keys = Object.keys(accounts);
            throw new errors.ExchangeError(this.id + ' fromAccount must be one of ' + keys.join(', '));
        }
        if (toId === undefined) {
            const keys = Object.keys(accounts);
            throw new errors.ExchangeError(this.id + ' toAccount must be one of ' + keys.join(', '));
        }
        const request = {
            'asset': currency['id'],
            'amount': amount,
            'fromAccountType': fromId,
            'toAccountType': toId,
        };
        if ((fromId === 'ISOLATED_MARGIN') || (toId === 'ISOLATED_MARGIN')) {
            const symbol = this.safeString(params, 'symbol');
            params = this.omit(params, 'symbol');
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' transfer() requires a symbol argument for isolated margin');
            }
            const market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.spotPrivatePostCapitalTransfer(this.extend(request, params));
        //
        //     {
        //         "tranId": "ebb06123e6a64f4ab234b396c548d57e"
        //     }
        //
        const transaction = this.parseTransfer(response, currency);
        return this.extend(transaction, {
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        });
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // spot: fetchTransfer
        //
        //     {
        //         "currency": "USDT",
        //         "amount": "1",
        //         "transact_id": "b60c1df8e7b24b268858003f374ecb75",
        //         "from": "MAIN",
        //         "to": "CONTRACT",
        //         "transact_state": "WAIT"
        //     }
        //
        // swap: fetchTransfer
        //
        //     {
        //         "currency": "USDT",
        //         "amount": "22.90213135",
        //         "txid": "fa8a1e7bf05940a3b7025856dc48d025",
        //         "id": "2980812",
        //         "type": "IN",
        //         "state": "SUCCESS",
        //         "createTime": "1648849076000",
        //         "updateTime": "1648849076000"
        //     }
        //
        // transfer
        //
        //     {
        //         "tranId": "ebb06123e6a64f4ab234b396c548d57e"
        //     }
        //
        const currencyId = this.safeString(transfer, 'currency');
        const id = this.safeStringN(transfer, ['transact_id', 'txid', 'tranId']);
        const timestamp = this.safeInteger(transfer, 'createTime');
        const datetime = (timestamp !== undefined) ? this.iso8601(timestamp) : undefined;
        const direction = this.safeString(transfer, 'type');
        let accountFrom = undefined;
        let accountTo = undefined;
        if (direction !== undefined) {
            accountFrom = (direction === 'IN') ? 'MAIN' : 'CONTRACT';
            accountTo = (direction === 'IN') ? 'CONTRACT' : 'MAIN';
        }
        else {
            accountFrom = this.safeString(transfer, 'from');
            accountTo = this.safeString(transfer, 'to');
        }
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': this.parseAccountId(accountFrom),
            'toAccount': this.parseAccountId(accountTo),
            'status': this.parseTransferStatus(this.safeString2(transfer, 'transact_state', 'state')),
        };
    }
    parseAccountId(status) {
        const statuses = {
            'MAIN': 'spot',
            'CONTRACT': 'swap',
        };
        return this.safeString(statuses, status, status);
    }
    parseTransferStatus(status) {
        const statuses = {
            'SUCCESS': 'ok',
            'FAILED': 'failed',
            'WAIT': 'pending',
        };
        return this.safeString(statuses, status, status);
    }
    /**
     * @method
     * @name mexc#withdraw
     * @description make a withdrawal
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#withdraw-new
     * @see https://www.mexc.com/api-docs/spot-v3/wallet-endpoints#internal-transfer
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.internal] false by default, set to true for an "internal transfer"
     * @param {object} [params.toAccountType] skipped by default, set to 'EMAIL|UID|MOBILE' when making an "internal transfer"
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets();
        const currency = this.currency(code);
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        const internal = this.safeBool(params, 'internal', false);
        if (internal) {
            params = this.omit(params, 'internal');
            const requestForInternal = {
                'asset': currency['id'],
                'amount': amount,
                'toAccount': address,
            };
            const toAccountType = this.safeString(params, 'toAccountType');
            if (toAccountType === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' withdraw() requires a toAccountType parameter for internal transfer to be of: EMAIL | UID | MOBILE');
            }
            const responseForInternal = await this.spotPrivatePostCapitalTransferInternal(this.extend(requestForInternal, params));
            //
            //     {
            //       "id":"7213fea8e94b4a5593d507237e5a555b"
            //     }
            //
            return this.parseTransaction(responseForInternal, currency);
        }
        const networks = this.safeDict(this.options, 'networks', {});
        let network = this.safeString2(params, 'network', 'netWork'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeString(networks, network, network); // handle ETH > ERC-20 alias
        network = this.networkCodeToId(network, currency['code']);
        this.checkAddress(address);
        const request = {
            'coin': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        if (network !== undefined) {
            request['netWork'] = network;
            params = this.omit(params, ['network', 'netWork']);
        }
        const response = await this.spotPrivatePostCapitalWithdraw(this.extend(request, params));
        //
        //     {
        //       "id":"7213fea8e94b4a5593d507237e5a555b"
        //     }
        //
        return this.parseTransaction(response, currency);
    }
    /**
     * @method
     * @name mexc#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#change-position-mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by mexc setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setPositionMode(hedged, symbol = undefined, params = {}) {
        const request = {
            'positionMode': hedged ? 1 : 2, // 1 Hedge, 2 One-way, before changing position mode make sure that there are no active orders, planned orders, or open positions, the risk limit level will be reset to 1
        };
        const response = await this.contractPrivatePostPositionChangePositionMode(this.extend(request, params));
        //
        //     {
        //         "success":true,
        //         "code":0
        //     }
        //
        return response;
    }
    /**
     * @method
     * @name mexc#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-position-mode
     * @param {string} symbol not used by mexc fetchPositionMode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    async fetchPositionMode(symbol = undefined, params = {}) {
        const response = await this.contractPrivateGetPositionPositionMode(params);
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":2
        //     }
        //
        const positionMode = this.safeInteger(response, 'data');
        return {
            'info': response,
            'hedged': (positionMode === 1),
        };
    }
    /**
     * @method
     * @name mexc#fetchTransactionFees
     * @description fetch deposit and withdrawal fees
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information
     * @param {string[]|undefined} codes returns fees for all currencies if undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTransactionFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.spotPrivateGetCapitalConfigGetall(params);
        //
        //    [
        //       {
        //           "coin": "AGLD",
        //           "name": "Adventure Gold",
        //           "networkList": [
        //               {
        //                   "coin": "AGLD",
        //                   "depositDesc": null,
        //                   "depositEnable": true,
        //                   "minConfirm": "0",
        //                   "name": "Adventure Gold",
        //                   "network": "ERC20",
        //                   "withdrawEnable": true,
        //                   "withdrawFee": "10.000000000000000000",
        //                   "withdrawIntegerMultiple": null,
        //                   "withdrawMax": "1200000.000000000000000000",
        //                   "withdrawMin": "20.000000000000000000",
        //                   "sameAddress": false,
        //                   "contract": "0x32353a6c91143bfd6c7d363b546e62a9a2489a20",
        //                   "withdrawTips": null,
        //                   "depositTips": null
        //               }
        //               ...
        //           ]
        //       },
        //       ...
        //    ]
        //
        return this.parseTransactionFees(response, codes);
    }
    parseTransactionFees(response, codes = undefined) {
        const withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString(entry, 'coin');
            const currency = this.safeCurrency(currencyId);
            const code = this.safeString(currency, 'code');
            if ((codes === undefined) || (this.inArray(code, codes))) {
                withdrawFees[code] = this.parseTransactionFee(entry, currency);
            }
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }
    parseTransactionFee(transaction, currency = undefined) {
        //
        //    {
        //        "coin": "AGLD",
        //        "name": "Adventure Gold",
        //        "networkList": [
        //            {
        //                "coin": "AGLD",
        //                "depositDesc": null,
        //                "depositEnable": true,
        //                "minConfirm": "0",
        //                "name": "Adventure Gold",
        //                "network": "ERC20",
        //                "withdrawEnable": true,
        //                "withdrawFee": "10.000000000000000000",
        //                "withdrawIntegerMultiple": null,
        //                "withdrawMax": "1200000.000000000000000000",
        //                "withdrawMin": "20.000000000000000000",
        //                "sameAddress": false,
        //                "contract": "0x32353a6c91143bfd6c7d363b546e62a9a2489a20",
        //                "withdrawTips": null,
        //                "depositTips": null
        //            }
        //            ...
        //        ]
        //    }
        //
        const networkList = this.safeValue(transaction, 'networkList', []);
        const result = {};
        for (let j = 0; j < networkList.length; j++) {
            const networkEntry = networkList[j];
            const networkId = this.safeString(networkEntry, 'network');
            const networkCode = this.safeString(this.options['networks'], networkId, networkId);
            const fee = this.safeNumber(networkEntry, 'withdrawFee');
            result[networkCode] = fee;
        }
        return result;
    }
    /**
     * @method
     * @name mexc#fetchDepositWithdrawFees
     * @description fetch deposit and withdrawal fees
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#query-the-currency-information
     * @param {string[]|undefined} codes returns fees for all currencies if undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchDepositWithdrawFees(codes = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.spotPrivateGetCapitalConfigGetall(params);
        //
        //    [
        //       {
        //           "coin": "AGLD",
        //           "name": "Adventure Gold",
        //           "networkList": [
        //               {
        //                   "coin": "AGLD",
        //                   "depositDesc": null,
        //                   "depositEnable": true,
        //                   "minConfirm": "0",
        //                   "name": "Adventure Gold",
        //                   "network": "ERC20",
        //                   "withdrawEnable": true,
        //                   "withdrawFee": "10.000000000000000000",
        //                   "withdrawIntegerMultiple": null,
        //                   "withdrawMax": "1200000.000000000000000000",
        //                   "withdrawMin": "20.000000000000000000",
        //                   "sameAddress": false,
        //                   "contract": "0x32353a6c91143bfd6c7d363b546e62a9a2489a20",
        //                   "withdrawTips": null,
        //                   "depositTips": null
        //               }
        //               ...
        //           ]
        //       },
        //       ...
        //    ]
        //
        return this.parseDepositWithdrawFees(response, codes, 'coin');
    }
    parseDepositWithdrawFee(fee, currency = undefined) {
        //
        //    {
        //        "coin": "AGLD",
        //        "name": "Adventure Gold",
        //        "networkList": [
        //            {
        //                "coin": "AGLD",
        //                "depositDesc": null,
        //                "depositEnable": true,
        //                "minConfirm": "0",
        //                "name": "Adventure Gold",
        //                "network": "ERC20",
        //                "withdrawEnable": true,
        //                "withdrawFee": "10.000000000000000000",
        //                "withdrawIntegerMultiple": null,
        //                "withdrawMax": "1200000.000000000000000000",
        //                "withdrawMin": "20.000000000000000000",
        //                "sameAddress": false,
        //                "contract": "0x32353a6c91143bfd6c7d363b546e62a9a2489a20",
        //                "withdrawTips": null,
        //                "depositTips": null
        //            }
        //            ...
        //        ]
        //    }
        //
        const networkList = this.safeValue(fee, 'networkList', []);
        const result = this.depositWithdrawFee(fee);
        for (let j = 0; j < networkList.length; j++) {
            const networkEntry = networkList[j];
            const networkId = this.safeString(networkEntry, 'network');
            const networkCode = this.networkIdToCode(networkId, this.safeString(currency, 'code'));
            result['networks'][networkCode] = {
                'withdraw': {
                    'fee': this.safeNumber(networkEntry, 'withdrawFee'),
                    'percentage': undefined,
                },
                'deposit': {
                    'fee': undefined,
                    'percentage': undefined,
                },
            };
        }
        return this.assignDefaultDepositWithdrawFees(result);
    }
    /**
     * @method
     * @name mexc#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.contractPrivateGetPositionLeverage(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "code": 0,
        //         "data": [
        //             {
        //                 "level": 1,
        //                 "maxVol": 463300,
        //                 "mmr": 0.004,
        //                 "imr": 0.005,
        //                 "positionType": 1,
        //                 "openType": 1,
        //                 "leverage": 20,
        //                 "limitBySys": false,
        //                 "currentMmr": 0.004
        //             },
        //             {
        //                 "level": 1,
        //                 "maxVol": 463300,
        //                 "mmr": 0.004,
        //                 "imr": 0.005,
        //                 "positionType": 2,
        //                 "openType": 1,
        //                 "leverage": 20,
        //                 "limitBySys": false,
        //                 "currentMmr": 0.004
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseLeverage(data, market);
    }
    parseLeverage(leverage, market = undefined) {
        let marginMode = undefined;
        let longLeverage = undefined;
        let shortLeverage = undefined;
        for (let i = 0; i < leverage.length; i++) {
            const entry = leverage[i];
            const openType = this.safeInteger(entry, 'openType');
            const positionType = this.safeInteger(entry, 'positionType');
            if (positionType === 1) {
                longLeverage = this.safeInteger(entry, 'leverage');
            }
            else if (positionType === 2) {
                shortLeverage = this.safeInteger(entry, 'leverage');
            }
            marginMode = (openType === 1) ? 'isolated' : 'cross';
        }
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': marginMode,
            'longLeverage': longLeverage,
            'shortLeverage': shortLeverage,
        };
    }
    handleMarginModeAndParams(methodName, params = {}, defaultValue = undefined) {
        /**
         * @ignore
         * @method
         * @description marginMode specified by params["marginMode"], this.options["marginMode"], this.options["defaultMarginMode"], params["margin"] = true or this.options["defaultType"] = 'margin'
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.margin] true for trading spot-margin
         * @returns {Array} the marginMode in lowercase
         */
        const defaultType = this.safeString(this.options, 'defaultType');
        const isMargin = this.safeBool(params, 'margin', false);
        let marginMode = undefined;
        [marginMode, params] = super.handleMarginModeAndParams(methodName, params, defaultValue);
        if ((defaultType === 'margin') || (isMargin === true)) {
            marginMode = 'isolated';
        }
        return [marginMode, params];
    }
    /**
     * @method
     * @name mexc#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-the-user-s-history-position-information
     * @param {string[]} [symbols] unified contract symbols
     * @param {int} [since] not used by mexc fetchPositionsHistory
     * @param {int} [limit] the maximum amount of candles to fetch, default=1000
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.type] position type，1: long, 2: short
     * @param {int} [params.page_num] current page number, default is 1
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionsHistory(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 1) {
                const market = this.market(symbols[0]);
                request['symbol'] = market['id'];
            }
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.contractPrivateGetPositionListHistoryPositions(this.extend(request, params));
        //
        //    {
        //        success: true,
        //        code: '0',
        //        data: [
        //            {
        //                positionId: '390281084',
        //                symbol: 'RVN_USDT',
        //                positionType: '1',
        //                openType: '2',
        //                state: '3',
        //                holdVol: '0',
        //                frozenVol: '0',
        //                closeVol: '1141',
        //                holdAvgPrice: '0.03491',
        //                holdAvgPriceFullyScale: '0.03491',
        //                openAvgPrice: '0.03491',
        //                openAvgPriceFullyScale: '0.03491',
        //                closeAvgPrice: '0.03494',
        //                liquidatePrice: '0.03433',
        //                oim: '0',
        //                im: '0',
        //                holdFee: '0',
        //                realised: '0.1829',
        //                leverage: '50',
        //                createTime: '1711512408000',
        //                updateTime: '1711512553000',
        //                autoAddIm: false,
        //                version: '4',
        //                profitRatio: '0.0227',
        //                newOpenAvgPrice: '0.03491',
        //                newCloseAvgPrice: '0.03494',
        //                closeProfitLoss: '0.3423',
        //                fee: '0.1593977',
        //                positionShowStatus: 'CLOSED'
        //            },
        //            ...
        //        ]
        //    }
        //
        const data = this.safeList(response, 'data');
        const positions = this.parsePositions(data, symbols, params);
        return this.filterBySinceLimit(positions, since, limit);
    }
    /**
     * @method
     * @name mexc#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#switch-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} [symbol] required when there is no position, else provide params["positionId"]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] required when a position is set
     * @param {string} [params.direction] "long" or "short" required when there is no position
     * @returns {object} response from the exchange
     */
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        if (market['spot']) {
            throw new errors.BadSymbol(this.id + ' setMarginMode() supports contract markets only');
        }
        marginMode = marginMode.toLowerCase();
        if (marginMode !== 'isolated' && marginMode !== 'cross') {
            throw new errors.BadRequest(this.id + ' setMarginMode() marginMode argument should be isolated or cross');
        }
        const leverage = this.safeInteger(params, 'leverage');
        if (leverage === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a leverage parameter');
        }
        const direction = this.safeStringLower2(params, 'direction', 'positionId');
        const request = {
            'leverage': leverage,
            'openType': (marginMode === 'isolated') ? 1 : 2,
        };
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (direction !== undefined) {
            request['positionType'] = (direction === 'short') ? 2 : 1;
        }
        params = this.omit(params, 'direction');
        const response = await this.contractPrivatePostPositionChangeLeverage(this.extend(request, params));
        //
        // { success: true, code: '0' }
        //
        return this.parseLeverage(response, market); // tmp revert type
    }
    nonce() {
        return this.milliseconds() - this.safeInteger(this.options, 'timeDifference', 0);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const section = this.safeString(api, 0);
        const access = this.safeString(api, 1);
        [path, params] = this.resolvePath(path, params);
        let url = undefined;
        if (section === 'spot' || section === 'broker') {
            if (section === 'broker') {
                url = this.urls['api'][section][access] + '/' + path;
            }
            else {
                url = this.urls['api'][section][access] + '/api/' + this.version + '/' + path;
            }
            let urlParams = params;
            if (access === 'private') {
                if (section === 'broker' && ((method === 'POST') || (method === 'PUT') || (method === 'DELETE'))) {
                    urlParams = {
                        'timestamp': this.nonce(),
                        'recvWindow': this.safeInteger(this.options, 'recvWindow', 5000),
                    };
                    body = this.json(params);
                }
                else {
                    urlParams['timestamp'] = this.nonce();
                    urlParams['recvWindow'] = this.safeInteger(this.options, 'recvWindow', 5000);
                }
            }
            let paramsEncoded = '';
            if (Object.keys(urlParams).length) {
                paramsEncoded = this.urlencode(urlParams);
                url += '?' + paramsEncoded;
            }
            if (access === 'private') {
                this.checkRequiredCredentials();
                const signature = this.hmac(this.encode(paramsEncoded), this.encode(this.secret), sha256.sha256);
                url += '&' + 'signature=' + signature;
                headers = {
                    'X-MEXC-APIKEY': this.apiKey,
                    'source': this.safeString(this.options, 'broker', 'CCXT'),
                };
            }
            if ((method === 'POST') || (method === 'PUT') || (method === 'DELETE')) {
                headers['Content-Type'] = 'application/json';
            }
        }
        else if (section === 'contract' || section === 'spot2') {
            url = this.urls['api'][section][access] + '/' + this.implodeParams(path, params);
            params = this.omit(params, this.extractParams(path));
            if (access === 'public') {
                if (Object.keys(params).length) {
                    url += '?' + this.urlencode(params);
                }
            }
            else {
                this.checkRequiredCredentials();
                const timestamp = this.nonce().toString();
                let auth = '';
                headers = {
                    'ApiKey': this.apiKey,
                    'Request-Time': timestamp,
                    'Content-Type': 'application/json',
                    'source': this.safeString(this.options, 'broker', 'CCXT'),
                };
                if (method === 'POST') {
                    auth = this.json(params);
                    body = auth;
                }
                else {
                    params = this.keysort(params);
                    if (Object.keys(params).length) {
                        auth += this.urlencode(params);
                        url += '?' + auth;
                    }
                }
                auth = this.apiKey + timestamp + auth;
                const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
                headers['Signature'] = signature;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        // spot
        //     {"code":-1128,"msg":"Combination of optional parameters invalid.","_extend":null}
        //     {"success":false,"code":123456,"message":"Order quantity error...."}
        //
        // contract
        //
        //     {"code":10232,"msg":"The currency not exist"}
        //     {"code":10216,"msg":"No available deposit address"}
        //     {"success":true, "code":0, "data":1634095541710}
        //
        const success = this.safeBool(response, 'success', false); // v1
        if (success === true) {
            return undefined;
        }
        const responseCode = this.safeString(response, 'code', undefined);
        if ((responseCode !== undefined) && (responseCode !== '200') && (responseCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], responseCode, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

exports["default"] = mexc;
