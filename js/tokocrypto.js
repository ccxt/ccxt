'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, NotSupported, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable, OnMaintenance, BadResponse, RequestTimeout, OrderNotFillable, MarginModeAlreadySet } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class tokocrypto extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tokocrypto',
            'name': 'Tokocrypto',
            'countries': [ 'ID' ], // Indonesia
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
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': false,
                'createOrder': true,
                'createReduceOnlyOrder': undefined,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchBorrowInterest': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': 'emulated',
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': true,
                'fetchL3OrderBook': false,
                'fetchLedger': undefined,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': undefined,
                'fetchPositions': true,
                'fetchPositionsRisk': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': true,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': true,
                'repayMargin': true,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': true,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg',
                'api': {
                    'rest': {
                        'public': 'https://www.tokocrypto.com',
                        'binance': 'https://api.binance.com',
                        'private': 'https://www.tokocrypto.com',
                    },
                },
                'www': 'https://tokocrypto.com',
                // 'referral': 'https://www.binance.us/?ref=35005074',
                // 'doc': 'https://github.com/binance-us/binance-official-api-docs',
                // 'fees': 'https://www.binance.us/en/fee/schedule',
            },
            'api': {
                'binance': {
                    'get': {
                        'api/v3/depth': 1, // when symbol type is 1
                        'api/v3/trades': 1, // when symbol type is 1
                        'api/v3/aggTrades': 1, // when symbol type is 1
                        'api/v1/klines': 1, // when symbol type is 1
                    },
                },
                'public': {
                    'get': {
                        'open/v1/common/time': 1,
                        'open/v1/common/symbols': 1,
                        'open/v1/market/depth': 1, // when symbol type is not 1
                        'open/v1/market/trades': 1, // when symbol type is not 1
                        'open/v1/market/agg-trades': 1, // when symbol type is not 1
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
                    },
                },
            },
            // 'fees': {
            //     'trading': {
            //         'tierBased': true,
            //         'percentage': true,
            //         'taker': this.parseNumber ('0.001'), // 0.1% trading fee, zero fees for all trading pairs before November 1
            //         'maker': this.parseNumber ('0.001'), // 0.1% trading fee, zero fees for all trading pairs before November 1
            //     },
            // },
            'options': {
                'fetchCurrencies': false, // this is a private call and it requires API keys
                // 'fetchTradesMethod': 'binanceGetApiV3Trades', // binanceGetApiV3Trades, binanceGetApiV3AggTrades
                'defaultTimeInForce': 'GTC', // 'GTC' = Good To Cancel (default), 'IOC' = Immediate Or Cancel
                // 'defaultType': 'spot', // 'spot', 'future', 'margin', 'delivery'
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                // 'fetchPositions': 'positionRisk', // or 'account'
                'recvWindow': 5 * 1000, // 5 sec, binance default
                'timeDifference': 0, // the difference between system clock and Binance clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'newOrderRespType': {
                    'market': 'FULL', // 'ACK' for order id, 'RESULT' for full order or 'FULL' for order with fills
                    'limit': 'FULL', // we change it from 'ACK' by default to 'FULL' (returns immediately if limit is not hit)
                },
                'quoteOrderQty': false, // whether market orders support amounts in quote currency
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
                    'System is under maintenance.': OnMaintenance, // {"code":1,"msg":"System is under maintenance."}
                    'System abnormality': ExchangeError, // {"code":-1000,"msg":"System abnormality"}
                    'You are not authorized to execute this request.': PermissionDenied, // {"msg":"You are not authorized to execute this request."}
                    'API key does not exist': AuthenticationError,
                    'Order would trigger immediately.': OrderImmediatelyFillable,
                    'Stop price would trigger immediately.': OrderImmediatelyFillable, // {"code":-2010,"msg":"Stop price would trigger immediately."}
                    'Order would immediately match and take.': OrderImmediatelyFillable, // {"code":-2010,"msg":"Order would immediately match and take."}
                    'Account has insufficient balance for requested action.': InsufficientFunds,
                    'Rest API trading is not enabled.': ExchangeNotAvailable,
                    "You don't have permission.": PermissionDenied, // {"msg":"You don't have permission.","success":false}
                    'Market is closed.': ExchangeNotAvailable, // {"code":-1013,"msg":"Market is closed."}
                    'Too many requests. Please try again later.': DDoSProtection, // {"msg":"Too many requests. Please try again later.","success":false}
                    'This action disabled is on this account.': AccountSuspended, // {"code":-2010,"msg":"This action disabled is on this account."}
                    '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                    '-1001': ExchangeNotAvailable, // {"code":-1001,"msg":"'Internal error; unable to process your request. Please try again.'"}
                    '-1002': AuthenticationError, // {"code":-1002,"msg":"'You are not authorized to execute this request.'"}
                    '-1003': RateLimitExceeded, // {"code":-1003,"msg":"Too much request weight used, current limit is 1200 request weight per 1 MINUTE. Please use the websocket for live updates to avoid polling the API."}
                    '-1004': DDoSProtection, // {"code":-1004,"msg":"Server is busy, please wait and try again"}
                    '-1005': PermissionDenied, // {"code":-1005,"msg":"No such IP has been white listed"}
                    '-1006': BadResponse, // {"code":-1006,"msg":"An unexpected response was received from the message bus. Execution status unknown."}
                    '-1007': RequestTimeout, // {"code":-1007,"msg":"Timeout waiting for response from backend server. Send status unknown; execution status unknown."}
                    '-1010': BadResponse, // {"code":-1010,"msg":"ERROR_MSG_RECEIVED."}
                    '-1011': PermissionDenied, // {"code":-1011,"msg":"This IP cannot access this route."}
                    '-1013': InvalidOrder, // {"code":-1013,"msg":"createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL"}
                    '-1014': InvalidOrder, // {"code":-1014,"msg":"Unsupported order combination."}
                    '-1015': RateLimitExceeded, // {"code":-1015,"msg":"'Too many new orders; current limit is %s orders per %s.'"}
                    '-1016': ExchangeNotAvailable, // {"code":-1016,"msg":"'This service is no longer available.',"}
                    '-1020': BadRequest, // {"code":-1020,"msg":"'This operation is not supported.'"}
                    '-1021': InvalidNonce, // {"code":-1021,"msg":"'your time is ahead of server'"}
                    '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                    '-1023': BadRequest, // {"code":-1023,"msg":"Start time is greater than end time."}
                    '-1099': AuthenticationError, // {"code":-1099,"msg":"Not found, authenticated, or authorized"}
                    '-1100': BadRequest, // {"code":-1100,"msg":"createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'"}
                    '-1101': BadRequest, // {"code":-1101,"msg":"Too many parameters; expected %s and received %s."}
                    '-1102': BadRequest, // {"code":-1102,"msg":"Param %s or %s must be sent, but both were empty"}
                    '-1103': BadRequest, // {"code":-1103,"msg":"An unknown parameter was sent."}
                    '-1104': BadRequest, // {"code":-1104,"msg":"Not all sent parameters were read, read 8 parameters but was sent 9"}
                    '-1105': BadRequest, // {"code":-1105,"msg":"Parameter %s was empty."}
                    '-1106': BadRequest, // {"code":-1106,"msg":"Parameter %s sent when not required."}
                    '-1108': BadRequest, // {"code":-1108,"msg":"Invalid asset."}
                    '-1109': AuthenticationError, // {"code":-1109,"msg":"Invalid account."}
                    '-1110': BadRequest, // {"code":-1110,"msg":"Invalid symbolType."}
                    '-1111': BadRequest, // {"code":-1111,"msg":"Precision is over the maximum defined for this asset."}
                    '-1112': InvalidOrder, // {"code":-1112,"msg":"No orders on book for symbol."}
                    '-1113': BadRequest, // {"code":-1113,"msg":"Withdrawal amount must be negative."}
                    '-1114': BadRequest, // {"code":-1114,"msg":"TimeInForce parameter sent when not required."}
                    '-1115': BadRequest, // {"code":-1115,"msg":"Invalid timeInForce."}
                    '-1116': BadRequest, // {"code":-1116,"msg":"Invalid orderType."}
                    '-1117': BadRequest, // {"code":-1117,"msg":"Invalid side."}
                    '-1118': BadRequest, // {"code":-1118,"msg":"New client order ID was empty."}
                    '-1119': BadRequest, // {"code":-1119,"msg":"Original client order ID was empty."}
                    '-1120': BadRequest, // {"code":-1120,"msg":"Invalid interval."}
                    '-1121': BadSymbol, // {"code":-1121,"msg":"Invalid symbol."}
                    '-1125': AuthenticationError, // {"code":-1125,"msg":"This listenKey does not exist."}
                    '-1127': BadRequest, // {"code":-1127,"msg":"More than %s hours between startTime and endTime."}
                    '-1128': BadRequest, // {"code":-1128,"msg":"{"code":-1128,"msg":"Combination of optional parameters invalid."}"}
                    '-1130': BadRequest, // {"code":-1130,"msg":"Data sent for paramter %s is not valid."}
                    '-1131': BadRequest, // {"code":-1131,"msg":"recvWindow must be less than 60000"}
                    '-1136': BadRequest, // {"code":-1136,"msg":"Invalid newOrderRespType"}
                    '-2008': AuthenticationError, // {"code":-2008,"msg":"Invalid Api-Key ID."}
                    '-2010': ExchangeError, // {"code":-2010,"msg":"generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc..."}
                    '-2011': OrderNotFound, // {"code":-2011,"msg":"cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'"}
                    '-2013': OrderNotFound, // {"code":-2013,"msg":"fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'"}
                    '-2014': AuthenticationError, // {"code":-2014,"msg":"API-key format invalid."}
                    '-2015': AuthenticationError, // {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
                    '-2016': BadRequest, // {"code":-2016,"msg":"No trading window could be found for the symbol. Try ticker/24hrs instead."}
                    '-2018': InsufficientFunds, // {"code":-2018,"msg":"Balance is insufficient"}
                    '-2019': InsufficientFunds, // {"code":-2019,"msg":"Margin is insufficient."}
                    '-2020': OrderNotFillable, // {"code":-2020,"msg":"Unable to fill."}
                    '-2021': OrderImmediatelyFillable, // {"code":-2021,"msg":"Order would immediately trigger."}
                    '-2022': InvalidOrder, // {"code":-2022,"msg":"ReduceOnly Order is rejected."}
                    '-2023': InsufficientFunds, // {"code":-2023,"msg":"User in liquidation mode now."}
                    '-2024': InsufficientFunds, // {"code":-2024,"msg":"Position is not sufficient."}
                    '-2025': InvalidOrder, // {"code":-2025,"msg":"Reach max open order limit."}
                    '-2026': InvalidOrder, // {"code":-2026,"msg":"This OrderType is not supported when reduceOnly."}
                    '-2027': InvalidOrder, // {"code":-2027,"msg":"Exceeded the maximum allowable position at current leverage."}
                    '-2028': InsufficientFunds, // {"code":-2028,"msg":"Leverage is smaller than permitted: insufficient margin balance"}
                    '-3000': ExchangeError, // {"code":-3000,"msg":"Internal server error."}
                    '-3001': AuthenticationError, // {"code":-3001,"msg":"Please enable 2FA first."}
                    '-3002': BadSymbol, // {"code":-3002,"msg":"We don't have this asset."}
                    '-3003': BadRequest, // {"code":-3003,"msg":"Margin account does not exist."}
                    '-3004': ExchangeError, // {"code":-3004,"msg":"Trade not allowed."}
                    '-3005': InsufficientFunds, // {"code":-3005,"msg":"Transferring out not allowed. Transfer out amount exceeds max amount."}
                    '-3006': InsufficientFunds, // {"code":-3006,"msg":"Your borrow amount has exceed maximum borrow amount."}
                    '-3007': ExchangeError, // {"code":-3007,"msg":"You have pending transaction, please try again later.."}
                    '-3008': InsufficientFunds, // {"code":-3008,"msg":"Borrow not allowed. Your borrow amount has exceed maximum borrow amount."}
                    '-3009': BadRequest, // {"code":-3009,"msg":"This asset are not allowed to transfer into margin account currently."}
                    '-3010': ExchangeError, // {"code":-3010,"msg":"Repay not allowed. Repay amount exceeds borrow amount."}
                    '-3011': BadRequest, // {"code":-3011,"msg":"Your input date is invalid."}
                    '-3012': ExchangeError, // {"code":-3012,"msg":"Borrow is banned for this asset."}
                    '-3013': BadRequest, // {"code":-3013,"msg":"Borrow amount less than minimum borrow amount."}
                    '-3014': AccountSuspended, // {"code":-3014,"msg":"Borrow is banned for this account."}
                    '-3015': ExchangeError, // {"code":-3015,"msg":"Repay amount exceeds borrow amount."}
                    '-3016': BadRequest, // {"code":-3016,"msg":"Repay amount less than minimum repay amount."}
                    '-3017': ExchangeError, // {"code":-3017,"msg":"This asset are not allowed to transfer into margin account currently."}
                    '-3018': AccountSuspended, // {"code":-3018,"msg":"Transferring in has been banned for this account."}
                    '-3019': AccountSuspended, // {"code":-3019,"msg":"Transferring out has been banned for this account."}
                    '-3020': InsufficientFunds, // {"code":-3020,"msg":"Transfer out amount exceeds max amount."}
                    '-3021': BadRequest, // {"code":-3021,"msg":"Margin account are not allowed to trade this trading pair."}
                    '-3022': AccountSuspended, // {"code":-3022,"msg":"You account's trading is banned."}
                    '-3023': BadRequest, // {"code":-3023,"msg":"You can't transfer out/place order under current margin level."}
                    '-3024': ExchangeError, // {"code":-3024,"msg":"The unpaid debt is too small after this repayment."}
                    '-3025': BadRequest, // {"code":-3025,"msg":"Your input date is invalid."}
                    '-3026': BadRequest, // {"code":-3026,"msg":"Your input param is invalid."}
                    '-3027': BadSymbol, // {"code":-3027,"msg":"Not a valid margin asset."}
                    '-3028': BadSymbol, // {"code":-3028,"msg":"Not a valid margin pair."}
                    '-3029': ExchangeError, // {"code":-3029,"msg":"Transfer failed."}
                    '-3036': AccountSuspended, // {"code":-3036,"msg":"This account is not allowed to repay."}
                    '-3037': ExchangeError, // {"code":-3037,"msg":"PNL is clearing. Wait a second."}
                    '-3038': BadRequest, // {"code":-3038,"msg":"Listen key not found."}
                    '-3041': InsufficientFunds, // {"code":-3041,"msg":"Balance is not enough"}
                    '-3042': BadRequest, // {"code":-3042,"msg":"PriceIndex not available for this margin pair."}
                    '-3043': BadRequest, // {"code":-3043,"msg":"Transferring in not allowed."}
                    '-3044': DDoSProtection, // {"code":-3044,"msg":"System busy."}
                    '-3045': ExchangeError, // {"code":-3045,"msg":"The system doesn't have enough asset now."}
                    '-3999': ExchangeError, // {"code":-3999,"msg":"This function is only available for invited users."}
                    '-4001': BadRequest, // {"code":-4001 ,"msg":"Invalid operation."}
                    '-4002': BadRequest, // {"code":-4002 ,"msg":"Invalid get."}
                    '-4003': BadRequest, // {"code":-4003 ,"msg":"Your input email is invalid."}
                    '-4004': AuthenticationError, // {"code":-4004,"msg":"You don't login or auth."}
                    '-4005': RateLimitExceeded, // {"code":-4005 ,"msg":"Too many new requests."}
                    '-4006': BadRequest, // {"code":-4006 ,"msg":"Support main account only."}
                    '-4007': BadRequest, // {"code":-4007 ,"msg":"Address validation is not passed."}
                    '-4008': BadRequest, // {"code":-4008 ,"msg":"Address tag validation is not passed."}
                    '-4010': BadRequest, // {"code":-4010 ,"msg":"White list mail has been confirmed."} // [TODO] possible bug: it should probably be "has not been confirmed"
                    '-4011': BadRequest, // {"code":-4011 ,"msg":"White list mail is invalid."}
                    '-4012': BadRequest, // {"code":-4012 ,"msg":"White list is not opened."}
                    '-4013': AuthenticationError, // {"code":-4013 ,"msg":"2FA is not opened."}
                    '-4014': PermissionDenied, // {"code":-4014 ,"msg":"Withdraw is not allowed within 2 min login."}
                    '-4015': ExchangeError, // {"code":-4015 ,"msg":"Withdraw is limited."}
                    '-4016': PermissionDenied, // {"code":-4016 ,"msg":"Within 24 hours after password modification, withdrawal is prohibited."}
                    '-4017': PermissionDenied, // {"code":-4017 ,"msg":"Within 24 hours after the release of 2FA, withdrawal is prohibited."}
                    '-4018': BadSymbol, // {"code":-4018,"msg":"We don't have this asset."}
                    '-4019': BadSymbol, // {"code":-4019,"msg":"Current asset is not open for withdrawal."}
                    '-4021': BadRequest, // {"code":-4021,"msg":"Asset withdrawal must be an %s multiple of %s."}
                    '-4022': BadRequest, // {"code":-4022,"msg":"Not less than the minimum pick-up quantity %s."}
                    '-4023': ExchangeError, // {"code":-4023,"msg":"Within 24 hours, the withdrawal exceeds the maximum amount."}
                    '-4024': InsufficientFunds, // {"code":-4024,"msg":"You don't have this asset."}
                    '-4025': InsufficientFunds, // {"code":-4025,"msg":"The number of hold asset is less than zero."}
                    '-4026': InsufficientFunds, // {"code":-4026,"msg":"You have insufficient balance."}
                    '-4027': ExchangeError, // {"code":-4027,"msg":"Failed to obtain tranId."}
                    '-4028': BadRequest, // {"code":-4028,"msg":"The amount of withdrawal must be greater than the Commission."}
                    '-4029': BadRequest, // {"code":-4029,"msg":"The withdrawal record does not exist."}
                    '-4030': ExchangeError, // {"code":-4030,"msg":"Confirmation of successful asset withdrawal. [TODO] possible bug in docs"}
                    '-4031': ExchangeError, // {"code":-4031,"msg":"Cancellation failed."}
                    '-4032': ExchangeError, // {"code":-4032,"msg":"Withdraw verification exception."}
                    '-4033': BadRequest, // {"code":-4033,"msg":"Illegal address."}
                    '-4034': ExchangeError, // {"code":-4034,"msg":"The address is suspected of fake."}
                    '-4035': PermissionDenied, // {"code":-4035,"msg":"This address is not on the whitelist. Please join and try again."}
                    '-4036': BadRequest, // {"code":-4036,"msg":"The new address needs to be withdrawn in {0} hours."}
                    '-4037': ExchangeError, // {"code":-4037,"msg":"Re-sending Mail failed."}
                    '-4038': ExchangeError, // {"code":-4038,"msg":"Please try again in 5 minutes."}
                    '-4039': BadRequest, // {"code":-4039,"msg":"The user does not exist."}
                    '-4040': BadRequest, // {"code":-4040,"msg":"This address not charged."}
                    '-4041': ExchangeError, // {"code":-4041,"msg":"Please try again in one minute."}
                    '-4042': ExchangeError, // {"code":-4042,"msg":"This asset cannot get deposit address again."}
                    '-4043': BadRequest, // {"code":-4043,"msg":"More than 100 recharge addresses were used in 24 hours."}
                    '-4044': BadRequest, // {"code":-4044,"msg":"This is a blacklist country."}
                    '-4045': ExchangeError, // {"code":-4045,"msg":"Failure to acquire assets."}
                    '-4046': AuthenticationError, // {"code":-4046,"msg":"Agreement not confirmed."}
                    '-4047': BadRequest, // {"code":-4047,"msg":"Time interval must be within 0-90 days"}
                    '-5001': BadRequest, // {"code":-5001,"msg":"Don't allow transfer to micro assets."}
                    '-5002': InsufficientFunds, // {"code":-5002,"msg":"You have insufficient balance."}
                    '-5003': InsufficientFunds, // {"code":-5003,"msg":"You don't have this asset."}
                    '-5004': BadRequest, // {"code":-5004,"msg":"The residual balances of %s have exceeded 0.001BTC, Please re-choose."}
                    '-5005': InsufficientFunds, // {"code":-5005,"msg":"The residual balances of %s is too low, Please re-choose."}
                    '-5006': BadRequest, // {"code":-5006,"msg":"Only transfer once in 24 hours."}
                    '-5007': BadRequest, // {"code":-5007,"msg":"Quantity must be greater than zero."}
                    '-5008': InsufficientFunds, // {"code":-5008,"msg":"Insufficient amount of returnable assets."}
                    '-5009': BadRequest, // {"code":-5009,"msg":"Product does not exist."}
                    '-5010': ExchangeError, // {"code":-5010,"msg":"Asset transfer fail."}
                    '-5011': BadRequest, // {"code":-5011,"msg":"future account not exists."}
                    '-5012': ExchangeError, // {"code":-5012,"msg":"Asset transfer is in pending."}
                    '-5013': InsufficientFunds, // {"code":-5013,"msg":"Asset transfer failed: insufficient balance""} // undocumented
                    '-5021': BadRequest, // {"code":-5021,"msg":"This parent sub have no relation"}
                    '-6001': BadRequest, // {"code":-6001,"msg":"Daily product not exists."}
                    '-6003': BadRequest, // {"code":-6003,"msg":"Product not exist or you don't have permission"}
                    '-6004': ExchangeError, // {"code":-6004,"msg":"Product not in purchase status"}
                    '-6005': InvalidOrder, // {"code":-6005,"msg":"Smaller than min purchase limit"}
                    '-6006': BadRequest, // {"code":-6006,"msg":"Redeem amount error"}
                    '-6007': BadRequest, // {"code":-6007,"msg":"Not in redeem time"}
                    '-6008': BadRequest, // {"code":-6008,"msg":"Product not in redeem status"}
                    '-6009': RateLimitExceeded, // {"code":-6009,"msg":"Request frequency too high"}
                    '-6011': BadRequest, // {"code":-6011,"msg":"Exceeding the maximum num allowed to purchase per user"}
                    '-6012': InsufficientFunds, // {"code":-6012,"msg":"Balance not enough"}
                    '-6013': ExchangeError, // {"code":-6013,"msg":"Purchasing failed"}
                    '-6014': BadRequest, // {"code":-6014,"msg":"Exceed up-limit allowed to purchased"}
                    '-6015': BadRequest, // {"code":-6015,"msg":"Empty request body"}
                    '-6016': BadRequest, // {"code":-6016,"msg":"Parameter err"}
                    '-6017': BadRequest, // {"code":-6017,"msg":"Not in whitelist"}
                    '-6018': BadRequest, // {"code":-6018,"msg":"Asset not enough"}
                    '-6019': AuthenticationError, // {"code":-6019,"msg":"Need confirm"}
                    '-6020': BadRequest, // {"code":-6020,"msg":"Project not exists"}
                    '-7001': BadRequest, // {"code":-7001,"msg":"Date range is not supported."}
                    '-7002': BadRequest, // {"code":-7002,"msg":"Data request type is not supported."}
                    '-9000': InsufficientFunds, // {"code":-9000,"msg":"user have no avaliable amount"}"
                    '-10017': BadRequest, // {"code":-10017,"msg":"Repay amount should not be larger than liability."}
                    '-11008': InsufficientFunds, // {"code":-11008,"msg":"Exceeding the account's maximum borrowable limit."} // undocumented
                    '-12014': RateLimitExceeded, // {"code":-12014,"msg":"More than 1 request in 3 seconds"}
                    '-13000': BadRequest, // {"code":-13000,"msg":"Redeption of the token is forbiden now"}
                    '-13001': BadRequest, // {"code":-13001,"msg":"Exceeds individual 24h redemption limit of the token"}
                    '-13002': BadRequest, // {"code":-13002,"msg":"Exceeds total 24h redemption limit of the token"}
                    '-13003': BadRequest, // {"code":-13003,"msg":"Subscription of the token is forbiden now"}
                    '-13004': BadRequest, // {"code":-13004,"msg":"Exceeds individual 24h subscription limit of the token"}
                    '-13005': BadRequest, // {"code":-13005,"msg":"Exceeds total 24h subscription limit of the token"}
                    '-13006': InvalidOrder, // {"code":-13006,"msg":"Subscription amount is too small"}
                    '-13007': AuthenticationError, // {"code":-13007,"msg":"The Agreement is not signed"}
                    '-21001': BadRequest, // {"code":-21001,"msg":"USER_IS_NOT_UNIACCOUNT"}
                    '-21002': BadRequest, // {"code":-21002,"msg":"UNI_ACCOUNT_CANT_TRANSFER_FUTURE"}
                    '-21003': BadRequest, // {"code":-21003,"msg":"NET_ASSET_MUST_LTE_RATIO"}
                    '100001003': BadRequest, // {"code":100001003,"msg":"Verification failed"} // undocumented
                },
                'broad': {
                    'has no operation privilege': PermissionDenied,
                    'MAX_POSITION': InvalidOrder, // {"code":-2010,"msg":"Filter failure: MAX_POSITION"}
                },
            },
        });
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name tokocrypto#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} params extra parameters specific to the tokocrypto api endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetTime (params);
        //
        //
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name tokocrypto#fetchMarkets
         * @description retrieves data on all markets for tokocrypto
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const response = await this.publicGetOpenV1CommonSymbols (params);
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
            await this.loadTimeDifference ();
        }
        const data = this.safeValue (response, 'data', {});
        const list = this.safeValue (data, 'list', []);
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const market = list[i];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const id = baseId + quoteId; // this.safeString (market, 'symbol');
            const lowercaseId = this.safeStringLower (market, 'symbol');
            const settleId = this.safeString (market, 'marginAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const symbol = base + '/' + quote;
            const filters = this.safeValue (market, 'filters', []);
            const filtersByType = this.indexBy (filters, 'filterType');
            const status = this.safeString2 (market, 'status', 'contractStatus');
            let active = (status === 'TRADING');
            const permissions = this.safeValue (market, 'permissions', []);
            for (let j = 0; j < permissions.length; j++) {
                if (permissions[j] === 'TRD_GRP_003') {
                    active = false;
                    break;
                }
            }
            const isMarginTradingAllowed = this.safeValue (market, 'isMarginTradingAllowed', false);
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
                    'amount': this.safeInteger (market, 'quantityPrecision'),
                    'price': this.safeInteger (market, 'pricePrecision'),
                    'base': this.safeInteger (market, 'baseAssetPrecision'),
                    'quote': this.safeInteger (market, 'quotePrecision'),
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
                'info': market,
            };
            if ('PRICE_FILTER' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'PRICE_FILTER', {});
                const tickSize = this.safeString (filter, 'tickSize');
                entry['precision']['price'] = this.precisionFromString (tickSize);
                // PRICE_FILTER reports zero values for maxPrice
                // since they updated filter types in November 2018
                // https://github.com/ccxt/ccxt/issues/4286
                // therefore limits['price']['max'] doesn't have any meaningful value except undefined
                entry['limits']['price'] = {
                    'min': this.safeNumber (filter, 'minPrice'),
                    'max': this.safeNumber (filter, 'maxPrice'),
                };
                entry['precision']['price'] = this.precisionFromString (filter['tickSize']);
            }
            if ('LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'LOT_SIZE', {});
                const stepSize = this.safeString (filter, 'stepSize');
                entry['precision']['amount'] = this.precisionFromString (stepSize);
                entry['limits']['amount'] = {
                    'min': this.safeNumber (filter, 'minQty'),
                    'max': this.safeNumber (filter, 'maxQty'),
                };
            }
            if ('MARKET_LOT_SIZE' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'MARKET_LOT_SIZE', {});
                entry['limits']['market'] = {
                    'min': this.safeNumber (filter, 'minQty'),
                    'max': this.safeNumber (filter, 'maxQty'),
                };
            }
            if ('MIN_NOTIONAL' in filtersByType) {
                const filter = this.safeValue (filtersByType, 'MIN_NOTIONAL', {});
                entry['limits']['cost']['min'] = this.safeNumber2 (filter, 'minNotional', 'notional');
            }
            result.push (entry);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 5000, see https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md#order-book
        }
        const response = await this.binanceGetApiV3Depth (this.extend (request, params));
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
        const timestamp = this.safeInteger (response, 'T');
        const orderbook = this.parseOrderBook (response, symbol, timestamp);
        orderbook['nonce'] = this.safeInteger (response, 'lastUpdateId');
        return orderbook;
    }

    parseTrade (trade, market = undefined) {
        if ('isDustTrade' in trade) {
            return this.parseDustTrade (trade, market);
        }
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
        const timestamp = this.safeInteger2 (trade, 'T', 'time');
        const price = this.safeString2 (trade, 'p', 'price');
        const amount = this.safeString2 (trade, 'q', 'qty');
        const cost = this.safeString2 (trade, 'quoteQty', 'baseQty');  // inverse futures
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        let id = this.safeString2 (trade, 't', 'a');
        id = this.safeString2 (trade, 'id', 'tradeId', id);
        let side = undefined;
        const orderId = this.safeString (trade, 'orderId');
        const buyerMaker = this.safeValue2 (trade, 'm', 'isBuyerMaker');
        let takerOrMaker = undefined;
        if (buyerMaker !== undefined) {
            side = buyerMaker ? 'sell' : 'buy'; // this is reversed intentionally
            takerOrMaker = 'taker';
        } else if ('side' in trade) {
            side = this.safeStringLower (trade, 'side');
        } else {
            if ('isBuyer' in trade) {
                side = trade['isBuyer'] ? 'buy' : 'sell'; // this is a true side
            }
        }
        let fee = undefined;
        if ('commission' in trade) {
            fee = {
                'cost': this.safeString (trade, 'commission'),
                'currency': this.safeCurrencyCode (this.safeString (trade, 'commissionAsset')),
            };
        }
        if ('isMaker' in trade) {
            takerOrMaker = trade['isMaker'] ? 'maker' : 'taker';
        }
        if ('maker' in trade) {
            takerOrMaker = trade['maker'] ? 'maker' : 'taker';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name binance#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the binance api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            // 'fromId': 123,    // ID to get aggregate trades from INCLUSIVE.
            // 'startTime': 456, // Timestamp in ms to get aggregate trades from INCLUSIVE.
            // 'endTime': 789,   // Timestamp in ms to get aggregate trades until INCLUSIVE.
            // 'limit': 500,     // default = 500, maximum = 1000
        };
        const defaultMethod = 'binanceGetApiV3Trades';
        const method = this.safeString (this.options, 'fetchTradesMethod', defaultMethod);
        if ((method === 'binanceGetApiV3AggTrades') && (since !== undefined)) {
            request['startTime'] = since;
            // https://github.com/ccxt/ccxt/issues/6400
            // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#compressedaggregate-trades-list
            request['endTime'] = this.sum (since, 3600000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 500, maximum = 1000
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
        const response = await this[method] (this.extend (request, params));
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
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name binance#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the binance api endpoint
         * @param {string|undefined} params.type 'future', 'delivery', 'savings', 'funding', or 'spot'
         * @param {string|undefined} params.marginMode 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
         * @param {[string]|undefined} params.symbols unified market symbols, only used in isolated margin mode
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const defaultMarginMode = this.safeString2 (this.options, 'marginMode', 'defaultMarginMode');
        const marginMode = this.safeStringLower (params, 'marginMode', defaultMarginMode);
        let method = 'privateGetOpenV1AccountSpotAccount';
        const request = {};
        const response = await this.privateGetOpenV1AccountSpot (this.extend (request, params));
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
        //         ]
        //         },
        //         "timestamp":1659666786943
        //     }
        //
        return this.parseBalance (response, type, marginMode);
    }

    parseBalanceHelper (entry) {
        const account = this.account ();
        account['used'] = this.safeString (entry, 'locked');
        account['free'] = this.safeString (entry, 'free');
        account['total'] = this.safeString (entry, 'totalAsset');
        return account;
    }

    parseBalance (response, type = undefined, marginMode = undefined) {
        const timestamp = this.safeInteger (response, 'updateTime');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const balances = this.safeValue2 (response, 'balances', 'userAssets', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'free');
            account['used'] = this.safeString (balance, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!(api in this.urls['api']['rest'])) {
            throw new NotSupported (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
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
                    body = this.urlencode (params);
                }
            } else {
                throw new AuthenticationError (this.id + ' userDataStream endpoint requires `apiKey` credential');
            }
        } else if ((api === 'private') || (api === 'sapi' && path !== 'system/status') || (api === 'sapiV3') || (api === 'wapi' && path !== 'systemStatus') || (api === 'dapiPrivate') || (api === 'dapiPrivateV2') || (api === 'fapiPrivate') || (api === 'fapiPrivateV2')) {
            this.checkRequiredCredentials ();
            let query = undefined;
            const defaultRecvWindow = this.safeInteger (this.options, 'recvWindow');
            const extendedParams = this.extend ({
                'timestamp': this.nonce (),
            }, params);
            if (defaultRecvWindow !== undefined) {
                extendedParams['recvWindow'] = defaultRecvWindow;
            }
            const recvWindow = this.safeInteger (params, 'recvWindow');
            if (recvWindow !== undefined) {
                extendedParams['recvWindow'] = recvWindow;
            }
            if ((api === 'sapi') && (path === 'asset/dust')) {
                query = this.urlencodeWithArrayRepeat (extendedParams);
            } else if ((path === 'batchOrders') || (path.indexOf ('sub-account') >= 0) || (path === 'capital/withdraw/apply') || (path.indexOf ('staking') >= 0)) {
                query = this.rawencode (extendedParams);
            } else {
                query = this.urlencode (extendedParams);
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        // check success value for wapi endpoints
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            const message = this.safeString (response, 'msg');
            let parsedMessage = undefined;
            if (message !== undefined) {
                try {
                    parsedMessage = JSON.parse (message);
                } catch (e) {
                    // do nothing
                    parsedMessage = undefined;
                }
                if (parsedMessage !== undefined) {
                    response = parsedMessage;
                }
            }
        }
        const message = this.safeString (response, 'msg');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + message);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, this.id + ' ' + message);
        }
        // checks against error codes
        const error = this.safeString (response, 'code');
        if (error !== undefined) {
            // https://github.com/ccxt/ccxt/issues/6501
            // https://github.com/ccxt/ccxt/issues/7742
            if ((error === '200') || Precise.stringEquals (error, '0')) {
                return undefined;
            }
            // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
            // despite that their message is very confusing, it is raised by Binance
            // on a temporary ban, the API key is valid, but disabled for a while
            if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                throw new DDoSProtection (this.id + ' ' + body);
            }
            const feedback = this.id + ' ' + body;
            if (message === 'No need to change margin type.') {
                // not an error
                // https://github.com/ccxt/ccxt/issues/11268
                // https://github.com/ccxt/ccxt/pull/11624
                // POST https://fapi.binance.com/fapi/v1/marginType 400 Bad Request
                // binanceusdm {"code":-4046,"msg":"No need to change margin type."}
                throw new MarginModeAlreadySet (feedback);
            }
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            throw new ExchangeError (feedback);
        }
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    calculateRateLimiterCost (api, method, path, params, config = {}, context = {}) {
        if (('noCoin' in config) && !('coin' in params)) {
            return config['noCoin'];
        } else if (('noSymbol' in config) && !('symbol' in params)) {
            return config['noSymbol'];
        } else if (('noPoolId' in config) && !('poolId' in params)) {
            return config['noPoolId'];
        } else if (('byLimit' in config) && ('limit' in params)) {
            const limit = params['limit'];
            const byLimit = config['byLimit'];
            for (let i = 0; i < byLimit.length; i++) {
                const entry = byLimit[i];
                if (limit <= entry[0]) {
                    return entry[1];
                }
            }
        }
        return this.safeInteger (config, 'cost', 1);
    }
};
