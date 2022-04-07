'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, AuthenticationError, ExchangeError, ExchangeNotAvailable, OrderNotFound, InvalidOrder, CancelPending, RateLimitExceeded, InsufficientFunds, BadRequest, BadSymbol, PermissionDenied } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class aax extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'aax',
            'name': 'AAX',
            'countries': [ 'MT' ], // Malta
            'enableRateLimit': true,
            'rateLimit': 500,
            'version': 'v2',
            'hostname': 'aaxpro.com', // aax.com
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchAccounts': undefined,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': true,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL3OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverage': undefined,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyBuys': undefined,
                'fetchMySells': undefined,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': true,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': 'emulated',
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfer': false,
                'fetchTransfers': true,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': undefined,
                'reduceMargin': undefined,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': true,
                'withdraw': undefined,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/104140087-a27f2580-53c0-11eb-87c1-5d9e81208fe9.jpg',
                'test': {
                    'v1': 'https://api.testnet.{hostname}/marketdata/v1',
                    'public': 'https://api.testnet.{hostname}',
                    'private': 'https://api.testnet.{hostname}',
                },
                'api': {
                    'v1': 'https://api.{hostname}/marketdata/v1',
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'www': 'https://www.aaxpro.com', // string website URL
                'doc': 'https://www.aaxpro.com/apidoc/index.html',
                'fees': 'https://www.aaxpro.com/en-US/fees/',
                'referral': 'https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB',
            },
            'api': {
                'v1': {
                    'get': [
                        'getHistMarketData', // Get OHLC k line of specific market
                    ],
                },
                'public': {
                    // these endpoints are not documented
                    // 'get': [
                    //     'order_book', // Get the order book of specified market
                    //     'order_book/{market}',
                    //     'trades', // Get recent trades on market, each trade is included only once Trades are sorted in reverse creation order.
                    //     'trades/{market}',
                    //     'tickers', // Get ticker of all markets
                    //     'tickers/{market}', // Get ticker of specific market
                    // ],
                    'get': [
                        'currencies',
                        'announcement/maintenance', // System Maintenance Notice
                        'time',
                        'instruments', // Retrieve all trading pairs information
                        'market/orderbook', // Order Book
                        'futures/position/openInterest', // Open Interest
                        'market/tickers', // Get the Last 24h Market Summary
                        'market/candles', // Get Current Candlestick
                        'market/history/candles', // Get Current Candlestick
                        'market/trades', // Get the Most Recent Trades
                        'market/markPrice', // Get Current Mark Price
                        'futures/funding/predictedFunding/{symbol}', // Get Predicted Funding Rate
                        'futures/funding/prevFundingRate/{symbol}', // Get Last Funding Rate
                        'futures/funding/fundingRate',
                        'market/candles/index', // * Deprecated
                        'market/index/candles',
                    ],
                },
                'private': {
                    'get': [
                        'user/info', // Retrieve user information
                        'account/balances', // Get Account Balances
                        'account/deposit/address', // undocumented
                        'account/deposits', // Get account deposits history
                        'account/transfer',
                        'account/withdraws', // Get account withdrawals history
                        'spot/trades', // Retrieve trades details for a spot order
                        'spot/openOrders', // Retrieve spot open orders
                        'spot/orders', // Retrieve historical spot orders
                        'futures/position', // Get positions for all contracts
                        'futures/position/closed', // Get closed positions
                        'futures/trades', // Retrieve trade details for a futures order
                        'futures/openOrders', // Retrieve futures open orders
                        'futures/orders', // Retrieve historical futures orders
                        'futures/funding/fundingFee',
                        'futures/funding/predictedFundingFee/{symbol}', // Get predicted funding fee
                    ],
                    'post': [
                        'account/transfer', // Asset Transfer
                        'spot/orders', // Create a new spot order
                        'spot/orders/cancelAllOnTimeout', // Automatically cancel all your spot orders after a specified timeout.
                        'futures/orders', // Create a new futures order
                        'futures/orders/cancelAllOnTimeout', // Automatically cancel all your futures orders after a specified timeout.
                        'futures/position/sltp', // Set take profit and stop loss orders for an opening position
                        'futures/position/close', // Close position
                        'futures/position/leverage', // Update leverage for position
                        'futures/position/margin', // Modify Isolated Position Margin
                    ],
                    'put': [
                        'spot/orders', // Amend spot order
                        'futures/orders', // Amend the quantity of an open futures order
                    ],
                    'delete': [
                        'spot/orders/cancel/{orderID}', // Cancel a spot order
                        'spot/orders/cancel/all', // Batch cancel spot orders
                        'futures/orders/cancel/{orderID}', // Cancel a futures order
                        'futures/orders/cancel/all', // Batch cancel futures orders
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0006'),
                    'taker': this.parseNumber ('0.001'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': true,
                    'withdraw': {}, // There is only 1% fee on withdrawals to your bank account.
                },
            },
            'commonCurrencies': {
                'XBT': 'XBT',
            },
            'exceptions': {
                'exact': {
                    '2002': InsufficientFunds,
                    '2003': OrderNotFound,
                    '10003': BadRequest, // Parameter validation error
                    '10006': AuthenticationError, // Session expired, please relogin
                    '10007': AuthenticationError, // Invalid authentication key or token
                    '11007': AuthenticationError, // Invalid key format
                    '20001': InsufficientFunds, // Insufficient balance. Please deposit to trade.
                    '20009': InvalidOrder, // Order amount must be positive
                    '30000': OrderNotFound, // {"code":30000,"data":null,"message":"The order does not exist","ts":1610259732263}
                    '30001': InvalidOrder, // The order is being submitted, please try again later
                    '30004': InvalidOrder, // Minimum quantity is {0}
                    '30005': InvalidOrder, // Quantity maximum precision is {0} decimal places
                    '30006': InvalidOrder, // Price maximum precision is {0} decimal places
                    '30007': InvalidOrder, // Minimum price is {0}
                    '30008': InvalidOrder, // Stop price maximum precision is {0} decimal places
                    '30009': InvalidOrder, // Stop Price cannot be less than {0}
                    '30010': InvalidOrder, // Market price cannot be empty
                    '30011': CancelPending, // The order is being cancelled, please wait.
                    '30012': BadRequest, // Unknown currency
                    '30013': BadSymbol, // Unknown symbol
                    '30014': OrderNotFound, // Futures order cannot be found
                    '30015': InvalidOrder, // This is not an open order and cannot modified
                    '30016': ExchangeError, // No position found
                    '30017': InvalidOrder, // The current close position is 0. It is recommended that you cancel the current order closing order.
                    '30018': InvalidOrder, // Order price cannot be greater than {0}
                    '30019': InvalidOrder, // Order quantity cannot be greater than {0}
                    '30020': InvalidOrder, // Order price must be a multiple of {0}
                    '30021': InvalidOrder, // Margin adjustement must be greater than 0
                    '30022': InvalidOrder, // New quantity must be greater than filled quantity
                    '30023': InvalidOrder, // Order failed, please try again
                    '30024': InvalidOrder, // TimeInForce error, only GTC or IOC are allowed
                    '30025': InvalidOrder, // TimeInForce error, only GTC is allowed
                    '30026': InvalidOrder, // Quantity is not a multiple of {0}
                    '30027': InvalidOrder, // Close position failed, it is recommended that you cancel the current order and then close the position.
                    '30028': BadSymbol, // Symbol cannot be traded at this time
                    '30029': InvalidOrder, // Modified quantity or price cannot be empty
                    '30030': InvalidOrder, // Price cannot be specified for market orders
                    '30031': InvalidOrder, // Liquidation orders cannot be modified
                    '30032': InvalidOrder, // Leverage cannot be greater than {0}
                    '30033': InvalidOrder, // Leverage cannot be smaller than {0}
                    '30034': RateLimitExceeded, // The max number of open orders is {0}. To place a new order, please cancel a previous one
                    '30035': RateLimitExceeded, // The max number of {0} open orders is {1}. To place a new order, please cancel a previous one
                    '30036': ExchangeNotAvailable, // Liquidation is in progress, please try again later
                    '30037': InvalidOrder, // Once stop limit order triggered, stop price cannot be amended
                    '30038': ExchangeError, // The total value of your orders has exceeded the current risk limit. Please adjust the risk limit
                    '30039': InsufficientFunds, // Your risk limit has now been changed to {0}, your maximum leverage less than 1, please readjust accordingly
                    '30040': InvalidOrder, // Order status has changed, please try again later
                    '30041': InvalidOrder, // Liquidation orders cannot be cancelled
                    '30042': InvalidOrder, // Order cannot be placed as you will be breaching you max limit value of {1} BTC for {0}
                    '30043': InvalidOrder, // The risk limit cannot be less than 0
                    '30044': BadRequest, // Timeout cannot be greater than 60 minutes
                    '30045': InvalidOrder, // Side is not valid, it should be BUY or SELL
                    '30046': InvalidOrder, // Order type is not valid, it should be MARKET or LIMIT or STOP-LIMIT or STOP
                    '30047': InvalidOrder, // The order is closed. Can't cancel
                    '30048': InvalidOrder, // Market orders cannot be modified
                    '30049': InvalidOrder, // The order is being modified, please wait
                    '30050': InvalidOrder, // Maximum 10 orders
                    '40004': BadRequest, // Requested resource doesn't exist
                    '40009': RateLimitExceeded, // Too many requests
                    '40102': AuthenticationError, // {"code":40102,"message":"Unauthorized(invalid key)"}
                    '40103': AuthenticationError, // {"code":40103,"message":"Unauthorized(invalid sign)"}
                    '40303': PermissionDenied, // {"code":40303,"message":"Forbidden(invalid scopes)"}
                    '41001': BadRequest, // Incorrect HTTP request
                    '41002': BadRequest, // Unsupported HTTP request method
                    '42001': ExchangeNotAvailable, // Duplicated data entry, please check and try again
                    '50001': ExchangeError, // Server side exception, please try again later
                    '50002': ExchangeError, // Server is busy, please try again later
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'spot', // 'spot', 'future'
                'types': {
                    'spot': 'SPTP',
                    'future': 'FUTP',
                    'otc': 'F2CP',
                    'saving': 'VLTP',
                },
                'accounts': {
                    'SPTP': 'spot',
                    'FUTP': 'future',
                    'F2CP': 'otc',
                    'VLTP': 'saving',
                },
                'networks': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                    'SOL': 'SPL',
                },
                'transfer': {
                    'fillFromAccountToAccount': true,
                    'fillAmount': true,
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //    {
        //        "code": 1,
        //        "data": 1573542445411,  // unit: millisecond
        //        "message": "success",
        //        "ts": 1573542445411
        //    }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetAnnouncementMaintenance (params);
        //
        //     {
        //         "code": 1,
        //         "data": {
        //             "startTime":"2020-06-25T02:15:00.000Z",
        //             "endTime":"2020-06-25T02:45:00.000Z"，
        //             "description":"Spot Trading :UTC Jun 25, 2020 02:15 to 02:45 (HKT Jun 25 10:15 to 10:45),Futures Trading: UTC Jun 25, 2020 02:15 to 02:45 (HKT Jun 25 10:15 to 10:45).We apologize for any inconvenience caused. Thank you for your patience and understanding.Should you have any enquiries, please do not hesitate our live chat support or via email at cs@aax.com."
        //         },
        //         "message":"success",
        //         "ts":1593043237000
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const timestamp = this.milliseconds ();
        const startTime = this.parse8601 (this.safeString (data, 'startTime'));
        const endTime = this.parse8601 (this.safeString (data, 'endTime'));
        const update = {
            'updated': this.safeInteger (response, 'ts', timestamp),
        };
        if (endTime !== undefined) {
            const startTimeIsOk = (startTime === undefined) ? true : (timestamp < startTime);
            const isOk = (timestamp > endTime) || startTimeIsOk;
            update['eta'] = endTime;
            update['status'] = isOk ? 'ok' : 'maintenance';
        }
        this.status = this.extend (this.status, update);
        return this.status;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstruments (params);
        //
        //     {
        //         "code":1,
        //         "message":"success",
        //         "ts":1610159448962,
        //         "data":[
        //             {
        //                 "tickSize":"0.01",
        //                 "lotSize":"1",
        //                 "base":"BTC",
        //                 "quote":"USDT",
        //                 "minQuantity":"1.0000000000",
        //                 "maxQuantity":"30000",
        //                 "minPrice":"0.0100000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"BTCUSDTFP",
        //                 "code":"FP",
        //                 "takerFee":"0.00040",
        //                 "makerFee":"0.00020",
        //                 "multiplier":"0.001000000000",
        //                 "mmRate":"0.00500",
        //                 "imRate":"0.01000",
        //                 "type":"futures",
        //                 "settleType":"Vanilla",
        //                 "settleCurrency":"USDT"
        //             },
        //             {
        //                 "tickSize":"0.5",
        //                 "lotSize":"10",
        //                 "base":"BTC",
        //                 "quote":"USD",
        //                 "minQuantity":"10.0000000000",
        //                 "maxQuantity":"300000",
        //                 "minPrice":"0.5000000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"BTCUSDFP",
        //                 "code":"FP",
        //                 "takerFee":"0.00040",
        //                 "makerFee":"0.00020",
        //                 "multiplier":"1.000000000000",
        //                 "mmRate":"0.00500",
        //                 "imRate":"0.01000",
        //                 "type":"futures",
        //                 "settleType":"Inverse",
        //                 "settleCurrency":"BTC"
        //             },
        //             {
        //                 "tickSize":"0.0001",
        //                 "lotSize":"0.01",
        //                 "base":"AAB",
        //                 "quote":"USDT",
        //                 "minQuantity":"5.0000000000",
        //                 "maxQuantity":"50000.0000000000",
        //                 "minPrice":"0.0001000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"AABUSDT",
        //                 "code":null,
        //                 "takerFee":"0.00100",
        //                 "makerFee":"0.00100",
        //                 "multiplier":"1.000000000000",
        //                 "mmRate":"0.02500",
        //                 "imRate":"0.05000",
        //                 "type":"spot",
        //                 "settleType":null,
        //                 "settleCurrency":null
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const settleId = this.safeString (market, 'settleCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const status = this.safeString (market, 'status');
            const marketType = this.safeString (market, 'type');
            let inverse = undefined;
            let linear = undefined;
            let quanto = undefined;
            const spot = (marketType === 'spot');
            const swap = (marketType === 'futures');
            const settleType = this.safeStringLower (market, 'settleType');
            if (settleType !== undefined) {
                inverse = (settleType === 'inverse');
                linear = (settleType === 'vanilla');
                quanto = (settleType === 'quanto');
            }
            let symbol = base + '/' + quote;
            let type = 'spot';
            let contractSize = undefined;
            if (swap) {
                symbol = symbol + ':' + settle;
                type = 'swap';
                contractSize = this.safeNumber (market, 'multiplier');
            }
            result.push ({
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
                'margin': false,
                'swap': swap,
                'future': false,
                'option': false,
                'active': (status === 'enable'),
                'contract': swap,
                'linear': linear,
                'inverse': inverse,
                'taker': this.safeNumber (market, 'takerFee'),
                'maker': this.safeNumber (market, 'makerFee'),
                'contractSize': contractSize,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'quanto': quanto,
                'precision': {
                    'amount': this.safeNumber (market, 'lotSize'),
                    'price': this.safeNumber (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeString (market, 'minQuantity'),
                        'max': this.safeString (market, 'maxQuantity'),
                    },
                    'price': {
                        'min': this.safeString (market, 'minPrice'),
                        'max': this.safeString (market, 'maxPrice'),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "code":1,
        //         "data":[
        //             {
        //                 "chain":"BTC",
        //                 "displayName":"Bitcoin",
        //                 "withdrawFee":"0.0004",
        //                 "withdrawMin":"0.001",
        //                 "otcFee":"0",
        //                 "enableOTC":true,
        //                 "visible":true,
        //                 "enableTransfer":true,
        //                 "transferMin":"0.00001",
        //                 "depositMin":"0.0005",
        //                 "enableWithdraw":true,
        //                 "enableDeposit":true,
        //                 "addrWithMemo":false,
        //                 "withdrawPrecision":"0.00000001",
        //                 "currency":"BTC",
        //                 "network":"BTC", // ETH, ERC20, TRX, TRC20, OMNI, LTC, XRP, XLM, ...
        //                 "minConfirm":"2"
        //             },
        //         ],
        //         "message":"success",
        //         "ts":1624330530697
        //     }
        //
        const result = {};
        const data = this.safeValue (response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'chain');
            const name = this.safeString (currency, 'displayName');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeNumber (currency, 'withdrawPrecision');
            const enableWithdraw = this.safeValue (currency, 'enableWithdraw');
            const enableDeposit = this.safeValue (currency, 'enableDeposit');
            const fee = this.safeNumber (currency, 'withdrawFee');
            const visible = this.safeValue (currency, 'visible');
            const active = (enableWithdraw && enableDeposit && visible);
            const deposit = (enableDeposit && visible);
            const withdraw = (enableWithdraw && visible);
            const network = this.safeString (currency, 'network');
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': currency,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'network': network,
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (currency, 'depositMin'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'withdrawMin'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "t":1610162685342, // timestamp
        //         "a":"0.00000000", // trading volume in USD in the last 24 hours, futures only
        //         "c":"435.20000000", // close
        //         "d":"4.22953489", // change
        //         "h":"455.04000000", // high
        //         "l":"412.78000000", // low
        //         "o":"417.54000000", // open
        //         "s":"BCHUSDTFP", // market id
        //         "v":"2031068.00000000", // trading volume in quote currency of last 24 hours
        //     }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const marketId = this.safeString (ticker, 's');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeString (ticker, 'c');
        const open = this.safeString (ticker, 'o');
        const quoteVolume = this.safeString (ticker, 'v');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': undefined,
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarketTickers (params);
        //
        //     {
        //         "e":"tickers",
        //         "t":1610162685342,
        //         "tickers":[
        //             {
        //                 "a":"0.00000000",
        //                 "c":"435.20000000",
        //                 "d":"4.22953489",
        //                 "h":"455.04000000",
        //                 "l":"412.78000000",
        //                 "o":"417.54000000",
        //                 "s":"BCHUSDTFP",
        //                 "v":"2031068.00000000",
        //             },
        //         ],
        //     }
        //
        const tickers = this.safeValue (response, 'tickers', []);
        const result = [];
        const timestamp = this.safeInteger (response, 't');
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (this.extend (tickers[i], { 't': timestamp }));
            result.push (ticker);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 20;
        } else {
            if ((limit !== 20) && (limit !== 50)) {
                throw new BadRequest (this.id + ' fetchOrderBook() limit argument must be undefined, 20 or 50');
            }
        }
        const request = {
            'symbol': market['id'],
            'level': limit, // required
        };
        //
        const response = await this.publicGetMarketOrderbook (this.extend (request, params));
        //
        //     {
        //         "asks":[
        //             ["10823.00000000","0.004000"],
        //             ["10823.10000000","0.100000"],
        //             ["10823.20000000","0.010000"]
        //         ],
        //         "bids":[
        //             ["10821.20000000","0.002000"],
        //             ["10821.10000000","0.005000"],
        //             ["10820.40000000","0.013000"]
        //         ],
        //         "e":"BTCUSDT@book_50",
        //         "t":1561543614756
        //     }
        //
        const timestamp = this.safeInteger (response, 't'); // need unix type
        return this.parseOrderBook (response, symbol, timestamp);
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "i":"T1qzQeZG9g",
        //         "p":"-61348.81000000",
        //         "q":"0.045400",
        //         "s":"sell",
        //         "t":1635731102731
        //     }
        //
        // private fetchMyTrades
        //
        //     {
        //         "avgPrice":"1199.8",
        //         "base":"ETH",
        //         "clOrdID":null,
        //         "commission":"0.00002",
        //         "createTime":"2021-01-11T02:47:51.512Z",
        //         "cumQty":"0.02",
        //         "filledOrderID":"1eUD4F5rwK",
        //         "filledPrice":"1199.8",
        //         "filledQty":"0.02",
        //         "leavesQty":"0",
        //         "oCreateTime":"2021-01-11T02:47:51.377Z",
        //         "orderID":"1eUD4EHfdU",
        //         "orderQty":"0.02",
        //         "orderStatus":3,
        //         "orderType":1,
        //         "price":"1198.25",
        //         "quote":"USDT",
        //         "rejectCode":null,
        //         "rejectReason":null,
        //         "side":1,
        //         "stopPrice":"0",
        //         "symbol":"ETHUSDT",
        //         "taker":true,
        //         "tradeID":"E04WTIgfmULU",
        //         "transactTime":"2021-01-11T02:47:51.389Z",
        //         "updateTime":null,
        //         "userID":"1362494"
        //     }
        //
        let timestamp = this.safeInteger (trade, 't');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'createTime'));
        }
        let id = this.safeString2 (trade, 'tid', 'tradeID');
        id = this.safeString (trade, 'i', id);
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        let priceString = this.safeString2 (trade, 'p', 'filledPrice');
        const amountString = this.safeString2 (trade, 'q', 'filledQty');
        const orderId = this.safeString (trade, 'orderID');
        const isTaker = this.safeValue (trade, 'taker');
        let takerOrMaker = undefined;
        if (isTaker !== undefined) {
            takerOrMaker = isTaker ? 'taker' : 'maker';
        }
        let side = this.safeString (trade, 'side');
        if (side === '1') {
            side = 'buy';
        } else if (side === '2') {
            side = 'sell';
        }
        if (side === undefined) {
            side = (priceString[0] === '-') ? 'sell' : 'buy';
        }
        priceString = Precise.stringAbs (priceString);
        const orderType = this.parseOrderType (this.safeString (trade, 'orderType'));
        let fee = undefined;
        const feeCost = this.safeString (trade, 'commission');
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (side === 'buy') {
                feeCurrency = market['base'];
            } else if (side === 'sell') {
                feeCurrency = market['quote'];
            }
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': orderType,
            'side': side,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetAccountTransfer (this.extend (request, params));
        //
        //      {
        //          code: '1',
        //          data: [{
        //                  quantity: '0.000010000000',
        //                  transferID: '480975741034369024',
        //                  transferTime: '2022-03-24T13:53:07.042Z',
        //                  fromPurse: 'VLTP',
        //                  toPurse: 'SPTP',
        //                  currency: 'ETH'
        //              },
        //          ],
        //          message: 'success',
        //          ts: '1648338516932'
        //      }
        //
        const transfers = this.safeValue (response, 'data', []);
        return this.parseTransfers (transfers, currency, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        limit = (limit === undefined) ? 2000 : limit;
        limit = Math.min (limit, 2000);
        const request = {
            'symbol': market['id'],
            'limit': limit,
        };
        const response = await this.publicGetMarketTrades (request);
        //
        //     {
        //         "e":"BTCUSDT@trades",
        //         "trades":[
        //             {"i":"T1qzQeZG9g","p":"-61348.81000000","q":"0.045400","s":"sell","t":1635731102731},
        //             {"i":"T1qzQeU6UK","p":"61343.10000000","q":"0.179300","s":"buy","t":1635731102133},
        //             {"i":"T1qzQe5BQm","p":"-61346.02000000","q":"0.021100","s":"sell","t":1635731099231},
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         0.042398, // 0 open
        //         0.042684, // 1 high
        //         0.042366, // 2 low
        //         0.042386, // 3 close
        //         0.93734243, // 4 volume
        //         1611514800, // 5 timestamp
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 5),
            this.safeNumber (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'limit': limit, // if set counts from now into the past
            'symbol': market['id'],
            'timeFrame': this.timeframes[timeframe],
        };
        limit = (limit === undefined) ? 500 : limit;
        const duration = this.parseTimeframe (timeframe);
        if (since === undefined) {
            const end = this.seconds ();
            request['start'] = end - duration * limit;
            request['end'] = end;
        } else {
            const start = parseInt (since / 1000);
            request['start'] = start;
            request['end'] = this.sum (start, duration * limit);
        }
        const response = await this.publicGetMarketHistoryCandles (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             [0.042398,0.042684,0.042366,0.042386,0.93734243,1611514800],
        //             [0.042386,0.042602,0.042234,0.042373,1.01925239,1611518400],
        //             [0.042373,0.042558,0.042362,0.042389,0.93801705,1611522000],
        //         ],
        //         "success":true,
        //         "t":1611875157
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchBalance', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const types = this.safeValue (this.options, 'types', {});
        const purseType = this.safeString (types, type, type);
        const request = {
            'purseType': purseType,
        };
        params = this.omit (params, 'type');
        const response = await this.privateGetAccountBalances (this.extend (request, params));
        //
        //     {
        //         "code":1,
        //         "data":[
        //             {
        //                 "purseType":"FUTP",
        //                 "currency":"BTC",
        //                 "available":"0.41000000",
        //                 "unavailable":"0.00000000"
        //             },
        //             {
        //                 "purseType":"FUTP",
        //                 "currency":"USDT",
        //                 "available":"0.21000000",
        //                 "unvaliable":"0.00000000"
        //             }
        //         ]
        //         "message":"success",
        //         "ts":1573530401020
        //     }
        //
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeInteger (response, 'ts');
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const balanceType = this.safeString (balance, 'purseType');
            if (balanceType === purseType) {
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'available');
                account['used'] = this.safeString (balance, 'unavailable');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let orderType = type.toUpperCase ();
        const orderSide = side.toUpperCase ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            // 'orderType': orderType, // MARKET, LIMIT, STOP, STOP-LIMIT
            'symbol': market['id'],
            'orderQty': this.amountToPrecision (symbol, amount),
            'side': orderSide,
            // 'stopPrice': this.priceToPrecision (symbol, stopPrice),
            // 'clOrdID': clientOrderId, // up to 20 chars, lowercase and uppercase letters only
            // 'timeInForce': 'GTC', // GTC, IOC, FOK, default is GTC
            // 'execInst': 'Post-Only', // the only value supported by the exchange, futures and spot
        };
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
        }
        const postOnly = this.safeValue (params, 'postOnly', false);
        if (postOnly !== undefined) {
            request['execInst'] = 'Post-Only';
        }
        params = this.omit (params, [ 'clOrdID', 'clientOrderId', 'postOnly' ]);
        const stopPrice = this.safeNumber (params, 'stopPrice');
        if (stopPrice === undefined) {
            if ((orderType === 'STOP-LIMIT') || (orderType === 'STOP')) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a stopPrice parameter for ' + orderType + ' orders');
            }
        } else {
            if (orderType === 'LIMIT') {
                orderType = 'STOP-LIMIT';
            } else if (orderType === 'MARKET') {
                orderType = 'STOP';
            }
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            params = this.omit (params, 'stopPrice');
        }
        if (orderType === 'LIMIT' || orderType === 'STOP-LIMIT') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        request['orderType'] = orderType;
        let method = undefined;
        if (market['spot']) {
            method = 'privatePostSpotOrders';
        } else if (market['contract']) {
            method = 'privatePostFuturesOrders';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "symbol":"ETHUSDT",
        //             "orderType":2,
        //             "avgPrice":"0",
        //             "execInst":null,
        //             "orderStatus":0,
        //             "userID":"1362494",
        //             "quote":"USDT",
        //             "rejectReason":null,
        //             "rejectCode":null,
        //             "price":"1500",
        //             "orderQty":"1",
        //             "commission":"0",
        //             "id":"268323430253735936",
        //             "timeInForce":1,
        //             "isTriggered":false,
        //             "side":2,
        //             "orderID":"1eO51MDSpQ",
        //             "leavesQty":"0",
        //             "cumQty":"0",
        //             "updateTime":null,
        //             "lastQty":"0",
        //             "clOrdID":null,
        //             "stopPrice":null,
        //             "createTime":null,
        //             "transactTime":null,
        //             "base":"ETH",
        //             "lastPrice":"0"
        //         },
        //         "message":"success",
        //         "ts":1610245290980
        //     }
        //
        // futures
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "liqType":0,
        //             "symbol":"ETHUSDTFP",
        //             "orderType":2,
        //             "leverage":"1",
        //             "marketPrice":"1318.3150000000",
        //             "code":"FP",
        //             "avgPrice":"0",
        //             "execInst":null,
        //             "orderStatus":0,
        //             "userID":"1362494",
        //             "quote":"USDT",
        //             "rejectReason":null,
        //             "rejectCode":null,
        //             "price":"500",
        //             "orderQty":"1",
        //             "commission":"0",
        //             "id":"268346885133053953",
        //             "timeInForce":1,
        //             "isTriggered":false,
        //             "side":1,
        //             "orderID":"1eOuPUAAkq",
        //             "leavesQty":"1",
        //             "cumQty":"0",
        //             "updateTime":null,
        //             "lastQty":null,
        //             "clOrdID":null,
        //             "stopPrice":null,
        //             "createTime":null,
        //             "transactTime":null,
        //             "settleType":"VANILLA",
        //             "base":"ETH",
        //             "lastPrice":"0"
        //         },
        //         "message":"success",
        //         "ts":1610250883059
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderID': id,
            // 'orderQty': this.amountToPrecision (symbol, amount),
            // 'price': this.priceToPrecision (symbol, price),
            // 'stopPrice': this.priceToPrecision (symbol, stopPrice),
        };
        const stopPrice = this.safeNumber (params, 'stopPrice');
        if (stopPrice !== undefined) {
            request['stopPrice'] = this.priceToPrecision (symbol, stopPrice);
            params = this.omit (params, 'stopPrice');
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            request['orderQty'] = this.amountToPrecision (symbol, amount);
        }
        let method = undefined;
        if (market['spot']) {
            method = 'privatePutSpotOrders';
        } else if (market['contract']) {
            method = 'privatePutFuturesOrders';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "symbol":"ETHUSDT",
        //             "orderType":2,
        //             "avgPrice":"0",
        //             "execInst":null,
        //             "orderStatus":0,
        //             "userID":"1362494",
        //             "quote":"USDT",
        //             "rejectReason":null,
        //             "rejectCode":null,
        //             "price":"1500",
        //             "orderQty":"1",
        //             "commission":"0",
        //             "id":"268323430253735936",
        //             "timeInForce":1,
        //             "isTriggered":false,
        //             "side":2,
        //             "orderID":"1eO51MDSpQ",
        //             "leavesQty":"0",
        //             "cumQty":"0",
        //             "updateTime":null,
        //             "lastQty":"0",
        //             "clOrdID":null,
        //             "stopPrice":null,
        //             "createTime":null,
        //             "transactTime":null,
        //             "base":"ETH",
        //             "lastPrice":"0"
        //         },
        //         "message":"success",
        //         "ts":1610245290980
        //     }
        //
        // futures
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "liqType":0,
        //             "symbol":"ETHUSDTFP",
        //             "orderType":2,
        //             "leverage":"1",
        //             "marketPrice":"1318.3150000000",
        //             "code":"FP",
        //             "avgPrice":"0",
        //             "execInst":null,
        //             "orderStatus":0,
        //             "userID":"1362494",
        //             "quote":"USDT",
        //             "rejectReason":null,
        //             "rejectCode":null,
        //             "price":"500",
        //             "orderQty":"1",
        //             "commission":"0",
        //             "id":"268346885133053953",
        //             "timeInForce":1,
        //             "isTriggered":false,
        //             "side":1,
        //             "orderID":"1eOuPUAAkq",
        //             "leavesQty":"1",
        //             "cumQty":"0",
        //             "updateTime":null,
        //             "lastQty":null,
        //             "clOrdID":null,
        //             "stopPrice":null,
        //             "createTime":null,
        //             "transactTime":null,
        //             "settleType":"VANILLA",
        //             "base":"ETH",
        //             "lastPrice":"0"
        //         },
        //         "message":"success",
        //         "ts":1610250883059
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderID': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateDeleteSpotOrdersCancelOrderID',
            'swap': 'privateDeleteFuturesOrdersCancelOrderID',
            'future': 'privateDeleteFuturesOrdersCancelOrderID',
        });
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "avgPrice":"0",
        //             "base":"BTC",
        //             "clOrdID":"aax",
        //             "commission":"0",
        //             "createTime":"2019-11-12T03:46:41Z",
        //             "cumQty":"0",
        //             "id":"114330021504606208",
        //             "isTriggered":false,
        //             "lastPrice":"0",
        //             "lastQty":"0",
        //             "leavesQty":"0",
        //             "orderID":"wJ4L366KB",
        //             "orderQty":"0.05",
        //             "orderStatus":1,
        //             "orderType":2,
        //             "price":"8000",
        //             "quote":"USDT",
        //             "rejectCode":0,
        //             "rejectReason":null,
        //             "side":1,
        //             "stopPrice":"0",
        //             "symbol":"BTCUSDT",
        //             "transactTime":null,
        //             "updateTime":"2019-11-12T03:46:41Z",
        //             "timeInForce":1,
        //             "userID":"216214"
        //         },
        //         "message":"success",
        //         "ts":1573530402029
        //     }
        //
        // futures
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "avgPrice":"0",
        //             "base":"BTC",
        //             "clOrdID":"aax_futures",
        //             "code":"FP",
        //             "commission":"0",
        //             "createTime":"2019-11-12T06:48:58Z",
        //             "cumQty":"0",
        //             "id":"114375893764395008",
        //             "isTriggered":false,
        //             "lastPrice":"0",
        //             "lastQty":null,
        //             "leavesQty":"300",
        //             "leverage":"1",
        //             "liqType":0,
        //             "marketPrice":"8760.75",
        //             "orderID":"wJTewQc81",
        //             "orderQty":"300",
        //             "orderStatus":1,
        //             "orderType":2,
        //             "price":"8000",
        //             "quote":"USD",
        //             "rejectCode":0,
        //             "rejectReason":null,
        //             "settleType":"INVERSE",
        //             "side":1,
        //             "stopPrice":"0",
        //             "symbol":"BTCUSDFP",
        //             "transactTime":"2019-11-12T06:48:58Z",
        //             "updateTime":"2019-11-12T06:48:58Z",
        //             "timeInForce":1,
        //             "execInst": "",
        //             "userID":"216214"
        //         },
        //         "message":"success",
        //         "ts":1573541642970
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseOrder (data, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            method = 'privateDeleteSpotOrdersCancelAll';
        } else if (market['contract']) {
            method = 'privateDeleteFuturesOrdersCancelAll';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code":1,
        //         "data":[
        //             "vBC9rXsEE",
        //             "vBCc46OI0"
        //             ],
        //         "message":"success",
        //         "ts":1572597435470
        //     }
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', 'spot');
        params['type'] = this.safeString (params, 'type', defaultType);
        const request = {};
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId === undefined) {
            request['orderID'] = id;
        } else {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        const orders = await this.fetchOrders (symbol, undefined, undefined, this.extend (request, params));
        const order = this.safeValue (orders, 0);
        if (order === undefined) {
            if (clientOrderId === undefined) {
                throw new OrderNotFound (this.id + ' fetchOrder() could not find order id ' + id);
            } else {
                throw new OrderNotFound (this.id + ' fetchOrder() could not find order clientOrderID ' + clientOrderId);
            }
        }
        return order;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'pageNum': '1',
            // 'pageSize': '10',
            // 'symbol': market['id'],
            // 'orderID': id,
            // 'side': 'undefined', // BUY, SELL
            // 'clOrdID': clientOrderId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotOpenOrders',
            'swap': 'privateGetFuturesOpenOrders',
            'future': 'privateGetFuturesOpenOrders',
        });
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit; // default 10
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "total":19,
        //             "pageSize":10,
        //             "list":[
        //                 {
        //                     "orderType":2,
        //                     "symbol":"BTCUSDT",
        //                     "avgPrice":"0",
        //                     "orderStatus":0,
        //                     "userID":"7225",
        //                     "quote":"USDT",
        //                     "rejectReason":null,
        //                     "rejectCode":null,
        //                     "price":"0",
        //                     "orderQty":"0.002",
        //                     "commission":"0",
        //                     "id":"110419975166304256",
        //                     "isTriggered":null,
        //                     "side":1,
        //                     "orderID":"vBGlDcLwk",
        //                     "cumQty":"0",
        //                     "leavesQty":"0",
        //                     "updateTime":null,
        //                     "clOrdID":"0001",
        //                     "lastQty":"0",
        //                     "stopPrice":"0",
        //                     "createTime":"2019-11-01T08:49:33Z",
        //                     "transactTime":null,
        //                     "timeInForce":1,
        //                     "base":"BTC",
        //                     "lastPrice":"0"
        //                 }
        //             ],
        //             "pageNum":1
        //         },
        //         "message":"success",
        //         "ts":1572598173682
        //     }
        //
        // futures
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "list":[
        //                 {
        //                     "avgPrice":"8768.99999999484997",
        //                     "base":"BTC",
        //                     "clOrdID":null,
        //                     "code":"FP",
        //                     "commission":"0.00000913",
        //                     "createTime":"2019-11-12T07:05:52.000Z,
        //                     "cumQty":"100",
        //                     "id":"114380149603028993",
        //                     "isTriggered":false,
        //                     "lastPrice":"8769",
        //                     "lastQty":"100",
        //                     "leavesQty":"0",
        //                     "leverage":"1",
        //                     "liqType":1,
        //                     "marketPrice":"8769.75",
        //                     "orderID":"wJXURIFBT",
        //                     "orderQty":"100",
        //                     "orderStatus":3,
        //                     "orderType":1,
        //                     "price":"8769.75",
        //                     "quote":"USD",
        //                     "rejectCode":0,
        //                     "rejectReason":null,
        //                     "settleType":"INVERSE",
        //                     "side":2,
        //                     "stopPrice":"0",
        //                     "symbol":"BTCUSDFP",
        //                     "transactTime":"2019-11-12T07:05:52.000Z,
        //                     "updateTime":"2019-11-12T07:05:52.000Z,
        //                     "timeInForce":1,
        //                     "execInst": "",
        //                     "userID":"216214"
        //                 },
        //             ],
        //             "pageNum":1,
        //             "pageSize":10,
        //             "total":21
        //         },
        //         "message":"success",
        //         "ts":1573546960172
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'orderStatus': '2', // 1 new, 2 filled, 3 canceled
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'orderStatus': '3', // 1 new, 2 filled, 3 canceled
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'pageNum': '1',
            // 'pageSize': '10',
            // 'symbol': market['id'],
            // 'orderID': id,
            // 'base': market['baseId'],
            // 'quote': market['quoteId'],
            // 'orderStatus': undefined, // 1 new, 2 filled, 3 canceled
            // 'startDate': this.yyyymmdd (since),
            // 'endDate': this.yyyymmdd (this.milliseconds()),
            // 'orderType': undefined, // MARKET, LIMIT, STOP, STOP-LIMIT
            // 'side': 'undefined', // BUY, SELL
            // 'clOrdID': clientOrderId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchOrders', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotOrders',
            'swap': 'privateGetFuturesOrders',
            'future': 'privateGetFuturesOrders',
        });
        const clientOrderId = this.safeString2 (params, 'clOrdID', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clOrdID'] = clientOrderId;
            params = this.omit (params, [ 'clOrdID', 'clientOrderId' ]);
        }
        if (limit !== undefined) {
            request['pageSize'] = limit; // default 10
        }
        if (since !== undefined) {
            request['startDate'] = this.yyyymmdd (since);
        }
        const response = await this[method] (this.extend (request, query));
        //
        // spot
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "total":19,
        //             "pageSize":10,
        //             "list":[
        //                 {
        //                     "orderType":2,
        //                     "symbol":"BTCUSDT",
        //                     "avgPrice":"0",
        //                     "orderStatus":0,
        //                     "userID":"7225",
        //                     "quote":"USDT",
        //                     "rejectReason":null,
        //                     "rejectCode":null,
        //                     "price":"0",
        //                     "orderQty":"0.002",
        //                     "commission":"0",
        //                     "id":"110419975166304256",
        //                     "isTriggered":null,
        //                     "side":1,
        //                     "orderID":"vBGlDcLwk",
        //                     "cumQty":"0",
        //                     "leavesQty":"0",
        //                     "updateTime":null,
        //                     "clOrdID":"0001",
        //                     "lastQty":"0",
        //                     "stopPrice":"0",
        //                     "createTime":"2019-11-01T08:49:33Z",
        //                     "transactTime":null,
        //                     "timeInForce":1,
        //                     "base":"BTC",
        //                     "lastPrice":"0"
        //                 }
        //             ],
        //             "pageNum":1
        //         },
        //         "message":"success",
        //         "ts":1572598173682
        //     }
        //
        // futures
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "list":[
        //                 {
        //                     "avgPrice":"8768.99999999484997",
        //                     "base":"BTC",
        //                     "clOrdID":null,
        //                     "code":"FP",
        //                     "commission":"0.00000913",
        //                     "createTime":"2019-11-12T07:05:52.000Z,
        //                     "cumQty":"100",
        //                     "id":"114380149603028993",
        //                     "isTriggered":false,
        //                     "lastPrice":"8769",
        //                     "lastQty":"100",
        //                     "leavesQty":"0",
        //                     "leverage":"1",
        //                     "liqType":1,
        //                     "marketPrice":"8769.75",
        //                     "orderID":"wJXURIFBT",
        //                     "orderQty":"100",
        //                     "orderStatus":3,
        //                     "orderType":1,
        //                     "price":"8769.75",
        //                     "quote":"USD",
        //                     "rejectCode":0,
        //                     "rejectReason":null,
        //                     "settleType":"INVERSE",
        //                     "side":2,
        //                     "stopPrice":"0",
        //                     "symbol":"BTCUSDFP",
        //                     "transactTime":"2019-11-12T07:05:52.000Z,
        //                     "updateTime":"2019-11-12T07:05:52.000Z,
        //                     "timeInForce":1,
        //                     "execInst": "",
        //                     "userID":"216214"
        //                 },
        //             ],
        //             "pageNum":1,
        //             "pageSize":10,
        //             "total":21
        //         },
        //         "message":"success",
        //         "ts":1573546960172
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'list', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open', // pending new
            '1': 'open', // new
            '2': 'open', // partially-filled
            '3': 'closed', // filled
            '4': 'canceled', // cancel-reject
            '5': 'canceled', // canceled
            '6': 'rejected', // rejected
            '10': 'expired', // expired
            '11': 'rejected', // business-reject
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            '1': 'market',
            '2': 'limit',
            '3': 'stop',
            '4': 'stop-limit',
            '7': 'stop-loss',
            '8': 'take-profit',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            '1': 'GTC',
            '3': 'IOC',
            '4': 'FOK',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "avgPrice":"8768.99999999484997",
        //         "base":"BTC",
        //         "clOrdID":null,
        //         "code":"FP", // futures only
        //         "commission":"0.00000913",
        //         "createTime":"2019-11-12T07:05:52.000Z,
        //         "cumQty":"100",
        //         "id":"114380149603028993", // futures only
        //         "isTriggered":false,
        //         "lastPrice":"8769",
        //         "lastQty":"100",
        //         "leavesQty":"0",
        //         "leverage":"1", // futures only
        //         "liqType":1, // futures only
        //         "marketPrice":"8769.75", // futures only
        //         "orderID":"wJXURIFBT",
        //         "orderQty":"100",
        //         "orderStatus":3,
        //         "orderType":1,
        //         "price":"8769.75",
        //         "quote":"USD",
        //         "rejectCode":0,
        //         "rejectReason":null,
        //         "settleType":"INVERSE", // futures only
        //         "side":2,
        //         "stopPrice":"0",
        //         "symbol":"BTCUSDFP",
        //         "transactTime":"2019-11-12T07:05:52.000Z,
        //         "updateTime":"2019-11-12T07:05:52.000Z,
        //         "timeInForce":1,
        //         "execInst": "",
        //         "userID":"216214"
        //     }
        //
        // sometimes the timestamp is returned in milliseconds
        let timestamp = this.safeValue (order, 'createTime');
        if (typeof timestamp === 'string') {
            timestamp = this.parse8601 (timestamp);
        }
        const status = this.parseOrderStatus (this.safeString (order, 'orderStatus'));
        const type = this.parseOrderType (this.safeString (order, 'orderType'));
        let side = this.safeString (order, 'side');
        if (side === '1') {
            side = 'buy';
        } else if (side === '2') {
            side = 'sell';
        }
        const id = this.safeString (order, 'orderID');
        const clientOrderId = this.safeString (order, 'clOrdID');
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const price = this.safeString (order, 'price');
        const stopPrice = this.safeNumber (order, 'stopPrice');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'timeInForce'));
        const execInst = this.safeString (order, 'execInst');
        const postOnly = (execInst === 'Post-Only');
        const average = this.safeString (order, 'avgPrice');
        const amount = this.safeString (order, 'orderQty');
        const filled = this.safeString (order, 'cumQty');
        let remaining = this.safeString (order, 'leavesQty');
        if ((Precise.stringEquals (filled, '0')) && (Precise.stringEquals (remaining, '0'))) {
            remaining = undefined;
        }
        let lastTradeTimestamp = this.safeValue (order, 'transactTime');
        if (typeof lastTradeTimestamp === 'string') {
            lastTradeTimestamp = this.parse8601 (lastTradeTimestamp);
        }
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'commission');
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (side === 'buy') {
                feeCurrency = market['base'];
            } else if (side === 'sell') {
                feeCurrency = market['quote'];
            }
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
            };
        }
        return this.safeOrder ({
            'id': id,
            'info': order,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'trades': undefined,
            'fee': fee,
        }, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'pageNum': '1',
            // 'pageSize': '10',
            // 'symbol': market['id'],
            // 'orderID': id,
            // 'base': market['baseId'],
            // 'quote': market['quoteId'],
            // 'startDate': this.yyyymmdd (since),
            // 'endDate': this.yyyymmdd (this.milliseconds()),
            // 'orderType': undefined, // MARKET, LIMIT, STOP, STOP-LIMIT
            // 'side': 'undefined', // BUY, SELL
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const [ marketType, query ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const method = this.getSupportedMapping (marketType, {
            'spot': 'privateGetSpotTrades',
            'swap': 'privateGetFuturesTrades',
            'future': 'privateGetFuturesTrades',
        });
        if (limit !== undefined) {
            request['pageSize'] = limit; // default 10
        }
        if (since !== undefined) {
            request['startDate'] = this.yyyymmdd (since);
        }
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "list":[
        //                 {
        //                     "avgPrice":"1199.8",
        //                     "base":"ETH",
        //                     "clOrdID":null,
        //                     "commission":"0.00002",
        //                     "createTime":"2021-01-11T02:47:51.512Z",
        //                     "cumQty":"0.02",
        //                     "filledOrderID":"1eUD4F5rwK",
        //                     "filledPrice":"1199.8",
        //                     "filledQty":"0.02",
        //                     "leavesQty":"0",
        //                     "oCreateTime":"2021-01-11T02:47:51.377Z",
        //                     "orderID":"1eUD4EHfdU",
        //                     "orderQty":"0.02",
        //                     "orderStatus":3,
        //                     "orderType":1,
        //                     "price":"1198.25",
        //                     "quote":"USDT",
        //                     "rejectCode":null,
        //                     "rejectReason":null,
        //                     "side":1,
        //                     "stopPrice":"0",
        //                     "symbol":"ETHUSDT",
        //                     "taker":true,
        //                     "tradeID":"E04WTIgfmULU",
        //                     "transactTime":"2021-01-11T02:47:51.389Z",
        //                     "updateTime":null,
        //                     "userID":"1362494"
        //                 }
        //             ],
        //             "pageNum":1,
        //             "pageSize":10,
        //             "total":1
        //         },
        //         "message":"success",
        //         "ts":1610333278042
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'list', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            // 'network': undefined, // 'ERC20
        };
        if ('network' in params) {
            const networks = this.safeValue (this.options, 'networks', {});
            const network = this.safeStringUpper (params, 'network');
            params = this.omit (params, 'network');
            request['network'] = this.safeStringUpper (networks, network, network);
        }
        const response = await this.privateGetAccountDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code":1,
        //         "data":{
        //             "address":"0x080c5c667381404cca9be0be9a04b2e47691ff86",
        //             "tag":null,
        //             "currency":"USDT",
        //             "network":"ERC20"
        //         },
        //         "message":"success",
        //         "ts":1610270465132
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // status Not required -  Deposit status, "1: pending,2: confirmed, 3:failed"
            // currency: Not required -  String Currency
            // startTime Not required Integer Default: 90 days from current timestamp.
            // endTime Not required Integer Default: present timestamp.
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            const startTime = parseInt (since / 1000);
            request['startTime'] = startTime;
            request['endTime'] = this.sum (startTime, 90 * 24 * 60 * 60); // Only allows a 90 day window between start and end
        }
        const response = await this.privateGetAccountDeposits (this.extend (request, params));
        // {    "code": 1,
        //     "data": [{
        //         "currency": "USDT",
        //         "network": "USDT",
        //         "quantity": "19.000000000000",
        //         "txHash": "75eb2e5f037b025c535664c49a0f7cc8f601dae218a5f4fe82290ff652c43f3d",
        //         "address": "1GkB7Taf7uttcguKEb2DmmyRTnihskJ9Le",
        //         "status": "2",
        //         "createdTime": "2021-01-08T19:45:01.354Z",
        //         "updatedTime": "2021-01-08T20:03:05.000Z",
        //     }]
        //     "message": "success",
        //     "ts": 1573561743499
        // }
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // status Not required : "0: Under Review, 1: Manual Review, 2: On Chain, 3: Review Failed, 4: On Chain, 5: Completed, 6: Failed"
            // currency: Not required -  String Currency
            // startTime Not required Integer Default: 30 days from current timestamp.
            // endTime Not required Integer Default: present timestamp.
            // Note difference between endTime and startTime must be 90 days or less
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            const startTime = parseInt (since / 1000);
            request['startTime'] = startTime;
            request['endTime'] = this.sum (startTime, 90 * 24 * 60 * 60); // Only allows a 90 day window between start and end
        }
        const response = await this.privateGetAccountWithdraws (this.extend (request, params));
        // {
        //     "code":1,
        //     "data": [
        //       {
        //            "currency":"USDT",
        //            "network":"USDT",
        //            "quantity":"19.000000000000",
        //            "fee":"0.10000"
        //            "txHash":"75eb2e5f037b025c535664c49a0f7cc8f601dae218a5f4fe82290ff652c43f3d",
        //            "address":"1GkB7Taf7uttcguKEb2DmmyRTnihskJ9Le",
        //            "addressTag": "",
        //            "status":"2",
        //            "createdTime":"2021-01-08T19:45:01.354Z",
        //            "updatedTime":"2021-01-08T20:03:05.000Z",
        //       }
        //  ]
        //     "message":"success",
        //     "ts":1573561743499
        //  }
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, code, since, limit);
    }

    parseTransactionStatusByType (status, type = undefined) {
        const statuses = {
            'deposit': {
                '1': 'pending',
                '2': 'ok',
                '3': 'failed',
            },
            'withdrawal': {
                '0': 'pending', // under review
                '1': 'pending', // manual review
                '2': 'pending', // on chain
                '3': 'failed',  // failed
                '4': 'pending', // on chain
                '5': 'ok',      // completed
                '6': 'failed',  // failed
            },
        };
        return this.safeString (this.safeValue (statuses, type, {}), status, status);
    }

    parseAddressByType (address, tag, type = undefined) {
        let addressFrom = undefined;
        let addressTo = undefined;
        let tagFrom = undefined;
        let tagTo = undefined;
        if (type === 'deposit') {
            addressFrom = address;
            tagFrom = tag;
        } else if (type === 'withdrawal') {
            addressTo = address;
            tagTo = tag;
        }
        return [ addressFrom, tagFrom, addressTo, tagTo ];
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //    {
        //         "currency": "USDT",
        //         "network": "USDT",
        //         "quantity": "19.000000000000",
        //         "txHash": "75eb2e5f037b025c535664c49a0f7cc8f601dae218a5f4fe82290ff652c43f3d",
        //         "address": "1GkB7Taf7uttcguKEb2DmmyRTnihskJ9Le",
        //         "status": "2",
        //         "createdTime": "2021-01-08T19:45:01.354Z",
        //         "updatedTime": "2021-01-08T20:03:05.000Z",
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "currency":"USDT",
        //         "network":"USDT",
        //         "quantity":"19.000000000000",
        //         "fee":"0.10000"
        //         "txHash":"75eb2e5f037b025c535664c49a0f7cc8f601dae218a5f4fe82290ff652c43f3d",
        //         "address":"1GkB7Taf7uttcguKEb2DmmyRTnihskJ9Le",
        //         "addressTag": "",
        //         "status":"2",
        //         "createdTime":"2021-01-08T19:45:01.354Z",
        //         "updatedTime":"2021-01-08T20:03:05.000Z",
        //      }
        //
        const fee = this.safeString (transaction, 'fee');
        let type = 'withdrawal';
        if (fee === undefined) {
            type = 'deposit';
        }
        const code = this.safeCurrencyCode (this.safeString (transaction, 'currency'));
        const txid = this.safeString (transaction, 'txHash');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'addressTag'); // withdrawals only
        const [ addressFrom, tagFrom, addressTo, tagTo ] = this.parseAddressByType (address, tag, type);
        const amountString = this.safeString (transaction, 'quantity');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdTime'));
        const updated = this.parse8601 (this.safeString (transaction, 'updatedTime'));
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'), type);
        const network = this.safeString (transaction, 'network');
        return {
            'id': undefined,
            'info': transaction,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'addressFrom': addressFrom,
            'address': address,
            'addressTo': addressTo,
            'amount': this.parseNumber (amountString),
            'type': type,
            'currency': code,
            'status': status,
            'updated': updated,
            'tagFrom': tagFrom,
            'tag': tag,
            'tagTo': tagTo,
            'comment': undefined,
            'fee': fee,
        };
    }

    async fetchFundingRate (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest ('Funding rates only exist for swap contracts');
        }
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetFuturesFundingPrevFundingRateSymbol (this.extend (request, params));
        //
        //    {
        //        "code": 1,
        //        "data": {
        //           "symbol": "BTCUSDFP",
        //           "markPrice": "11192.5",
        //           "fundingRate": "0.001",
        //           "fundingTime": "2020-08-12T08:00:00Z",
        //           "nextFundingTime": "2020-08-12T16:00:00Z"
        //        },
        //        "message": "success",
        //        "ts": 1573542445411
        //    }
        //
        const data = this.safeValue (response, 'data');
        return this.parseFundingRate (data);
    }

    parseFundingRate (contract, market = undefined) {
        //
        //    {
        //        "symbol": "BTCUSDFP",
        //        "markPrice": "11192.5",
        //        "fundingRate": "0.001",
        //        "fundingTime": "2020-08-12T08:00:00Z",
        //        "nextFundingTime": "2020-08-12T16:00:00Z"
        //    }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const markPrice = this.safeNumber (contract, 'markPrice');
        const fundingRate = this.safeNumber (contract, 'fundingRate');
        const fundingDatetime = this.safeString (contract, 'fundingTime');
        const nextFundingDatetime = this.safeString (contract, 'nextFundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': this.parse8601 (fundingDatetime),
            'fundingDatetime': fundingDatetime,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': this.parse8601 (nextFundingDatetime),
            'nextFundingDatetime': nextFundingDatetime,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address":"0x080c5c667381404cca9be0be9a04b2e47691ff86",
        //         "tag":null,
        //         "currency":"USDT",
        //         "network":"ERC20"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'tag');
        let currencyId = this.safeString (depositAddress, 'currency');
        const network = this.safeString (depositAddress, 'network');
        if (network !== undefined) {
            currencyId = currencyId.replace (network, '');
        }
        const code = this.safeCurrencyCode (currencyId);
        return {
            'info': depositAddress,
            'currency': code,
            'address': address,
            'tag': tag,
            'network': network,
        };
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000);
        }
        const till = this.safeInteger (params, 'till'); // unified in milliseconds
        const endTime = this.safeString (params, 'endTime'); // exchange-specific in seconds
        params = this.omit (params, [ 'endTime', 'till' ]);
        if (till !== undefined) {
            request['endTime'] = parseInt (till / 1000);
        } else if (endTime !== undefined) {
            request['endTime'] = endTime;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetFuturesFundingFundingRate (this.extend (request, params));
        //
        //    {
        //        "code": 1,
        //        "data": [
        //            {
        //                "fundingRate": "0.00033992",
        //                "fundingTime": "2021-12-31T00:00:00.000Z",
        //                "symbol": "ETHUSDTFP"
        //            },
        //        ]
        //    }
        //
        const data = this.safeValue (response, 'data');
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const datetime = this.safeString (entry, 'fundingTime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': this.parse8601 (datetime),
                'datetime': datetime,
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    async fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingHistory() requires a symbol argument');
        }
        if (limit === undefined) {
            limit = 100; // Default
        } else if (limit > 1000) {
            throw new BadRequest (this.id + ' fetchFundingHistory() limit argument cannot exceed 1000');
        }
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'limit': limit,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.privateGetFuturesFundingFundingFee (this.extend (request, params));
        //
        //    {
        //        "code": 1,
        //        "data": [
        //            {
        //                "symbol": "BTCUSDTFP",
        //                "fundingRate":"0.001",
        //                "fundingFee":"100",
        //                "currency":"USDT",
        //                "fundingTime": "2020-08-12T08:00:00Z",
        //                "markPrice": "11192.5",
        //            }
        //        ],
        //        "message": "success",
        //        "ts": 1573542445411
        //    }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const datetime = this.safeString (entry, 'fundingTime');
            result.push ({
                'info': entry,
                'symbol': symbol,
                'code': this.safeCurrencyCode (this.safeString (entry, 'currency')),
                'timestamp': this.parse8601 (datetime),
                'datetime': datetime,
                'id': undefined,
                'amount': this.safeNumber (entry, 'fundingFee'),
            });
        }
        return result;
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        if ((leverage < 1) || (leverage > 100)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 100');
        }
        const market = this.market (symbol);
        if (market['type'] !== 'swap') {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
        };
        return await this.privatePostFuturesPositionLeverage (this.extend (request, params));
    }

    async fetchLeverageTiers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetInstruments (params);
        //
        //     {
        //         "code":1,
        //         "message":"success",
        //         "ts":1610159448962,
        //         "data":[
        //             {
        //                 "tickSize":"0.01",
        //                 "lotSize":"1",
        //                 "base":"BTC",
        //                 "quote":"USDT",
        //                 "minQuantity":"1.0000000000",
        //                 "maxQuantity":"30000",
        //                 "minPrice":"0.0100000000",
        //                 "maxPrice":"999999.0000000000",
        //                 "status":"readOnly",
        //                 "symbol":"BTCUSDTFP",
        //                 "code":"FP",
        //                 "takerFee":"0.00040",
        //                 "makerFee":"0.00020",
        //                 "multiplier":"0.001000000000",
        //                 "mmRate":"0.00500",
        //                 "imRate":"0.01000",
        //                 "type":"futures",
        //                 "settleType":"Vanilla",
        //                 "settleCurrency":"USDT"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market) {
        /**
            @param info: Exchange market response
            {
                "tickSize":"0.01",
                "lotSize":"1",
                "base":"BTC",
                "quote":"USDT",
                "minQuantity":"1.0000000000",
                "maxQuantity":"30000",
                "minPrice":"0.0100000000",
                "maxPrice":"999999.0000000000",
                "status":"readOnly",
                "symbol":"BTCUSDTFP",
                "code":"FP",
                "takerFee":"0.00040",
                "makerFee":"0.00020",
                "multiplier":"0.001000000000",
                "mmRate":"0.00500",
                "imRate":"0.01000",
                "type":"futures",
                "settleType":"Vanilla",
                "settleCurrency":"USDT"
            }
            @param market: CCXT Market
        */
        let maintenanceMarginRate = this.safeString (info, 'mmRate');
        let initialMarginRate = this.safeString (info, 'imRate');
        const maxVol = this.safeString (info, 'maxQuantity');
        const riskIncrVol = maxVol; // TODO
        const riskIncrMmr = '0.0'; // TODO
        const riskIncrImr = '0.0'; // TODO
        let floor = '0';
        const tiers = [];
        while (Precise.stringLt (floor, maxVol)) {
            const cap = Precise.stringAdd (floor, riskIncrVol);
            tiers.push ({
                'tier': this.parseNumber (Precise.stringDiv (cap, riskIncrVol)),
                'currency': market['base'],
                'notionalFloor': this.parseNumber (floor),
                'notionalCap': this.parseNumber (cap),
                'maintenanceMarginRate': this.parseNumber (maintenanceMarginRate),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRate)),
                'info': info,
            });
            maintenanceMarginRate = Precise.stringAdd (maintenanceMarginRate, riskIncrMmr);
            initialMarginRate = Precise.stringAdd (initialMarginRate, riskIncrImr);
            floor = cap;
        }
        return tiers;
    }

    parseTransfer (transfer, currency = undefined) {
        //     {
        //          quantity: '0.000010000000',
        //          transferID: '480975741034369024',
        //          transferTime: '2022-03-24T13:53:07.042Z',
        //          fromPurse: 'VLTP',
        //          toPurse: 'SPTP',
        //          currency: 'ETH'
        //     },
        const id = this.safeString (transfer, 'transferID');
        const amount = this.safeNumber (transfer, 'quantity');
        const timestamp = this.parse8601 (this.safeString (transfer, 'transferTime'));
        const accounts = this.safeValue (this.options, 'accounts', {});
        const fromId = this.safeString (transfer, 'fromPurse');
        const toId = this.safeString (transfer, 'toPurse');
        const fromAccount = this.safeString (accounts, fromId);
        const toAccount = this.safeString (accounts, toId);
        const currencyId = this.safeString (transfer, 'currency');
        const currencyCode = this.safeCurrencyCode (currencyId, currency);
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': currencyCode,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': undefined,
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            '1': 'ok',
        };
        return this.safeString (statuses, status, 'canceled');
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const accountTypes = this.safeValue (this.options, 'types', {});
        const fromId = this.safeString (accountTypes, fromAccount);
        const toId = this.safeString (accountTypes, toAccount);
        if (fromId === undefined) {
            const keys = Object.keys (accountTypes);
            throw new ExchangeError (this.id + ' fromAccount must be one of ' + keys.join (', '));
        }
        if (toId === undefined) {
            const keys = Object.keys (accountTypes);
            throw new ExchangeError (this.id + ' toAccount must be one of ' + keys.join (', '));
        }
        const request = {
            'currency': currency['id'],
            'fromPurse': fromId,
            'toPurse': toId,
            'quantity': amount,
        };
        const response = await this.privatePostAccountTransfer (this.extend (request, params));
        //
        //     {
        //         "code": 1,
        //         "data": {
        //             "transferID": 888561,
        //             "transferTime": "2022-03-22T15:29:05.197Z"
        //         },
        //         "message": "success",
        //         "ts": 1647962945151
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const transfer = this.parseTransfer (data, currency);
        const transferOptions = this.safeValue (this.options, 'transfer', {});
        const fillFromAccountToAccount = this.safeValue (transferOptions, 'fillFromAccountToAccount', true);
        const fillAmount = this.safeValue (transferOptions, 'fillAmount', true);
        if (fillFromAccountToAccount) {
            if (transfer['fromAccount'] === undefined) {
                transfer['fromAccount'] = fromAccount;
            }
            if (transfer['toAccount'] === undefined) {
                transfer['toAccount'] = toAccount;
            }
        }
        if (fillAmount && transfer['amount'] === undefined) {
            transfer['amount'] = amount;
        }
        transfer['status'] = this.parseTransferStatus (this.safeString (response, 'code'));
        return transfer;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'v1') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            url = '/' + this.version + url;
            if (api === 'public') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (api === 'private') {
                this.checkRequiredCredentials ();
                const nonce = this.nonce ().toString ();
                headers = {
                    'X-ACCESS-KEY': this.apiKey,
                    'X-ACCESS-NONCE': nonce,
                };
                let auth = nonce + ':' + method;
                if (method === 'GET') {
                    if (Object.keys (query).length) {
                        url += '?' + this.urlencode (query);
                    }
                    auth += url;
                } else {
                    headers['Content-Type'] = 'application/json';
                    body = this.json (query);
                    auth += url + body;
                }
                const signature = this.hmac (this.encode (auth), this.encode (this.secret));
                headers['X-ACCESS-SIGN'] = signature;
            }
        }
        url = this.implodeHostname (this.urls['api'][api]) + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"code":40102,"message":"Unauthorized(invalid key)"}
        //
        const errorCode = this.safeString (response, 'code');
        if ((errorCode !== undefined) && (errorCode !== '1')) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
        }
    }
};
