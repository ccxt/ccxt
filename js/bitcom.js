'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NetworkError, AuthenticationError, ArgumentsRequired, PermissionDenied, ExchangeError, ExchangeNotAvailable, DDoSProtection, BadRequest, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitcom extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcom',
            'name': 'bit.com',
            'countries': ['SG'],
            'version': 'v1',
            'rateLimit': 500,
            'has': {
                // CCXT interface
                'CORS': true,
                'fetchStatus': true,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchBalance': true,
                'fetchOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchClosedOrders': true,
                'fetchOrderTrades': true,
                'fetchMyTrades': true,
                'fetchTrades': true,
                'fetchTransactions': false,
                'createOrder': true,
                'editOrder': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createDepositAddress': false,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'withdraw': false,
            },
            'options': {
                'category': ['future', 'option'],
            },
            'timeframes': {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
            },
            'urls': {
                'logo': 'https://144321d373cade4e83.matrixtechfin.com:1443/imgs/logo-1617071258366.png',
                'api': {
                    'public': 'https://api.bit.com',
                    'private': 'https://api.bit.com',
                    'v1': 'https://api.bit.com/v1',
                },
                'testApi': {
                    'public': 'https://betaapi.bitexch.dev',
                    'private': 'https://betaapi.bitexch.dev',
                    'v1': 'https://betaapi.bitexch.dev/v1',
                },
                'www': 'https://www.bit.com/',
                'doc': 'https://www.bit.com/docs/en-us/#introduction',
                'fees': 'https://www.bit.com/tieredFee',
            },
            'api': {
                'public': {
                    'get': [
                        // system
                        'system/time',
                        'system/version',
                        'system/cancel_only_status',
                        // market
                        'index',
                        'market/summary',
                        'instruments',
                        'tickers',
                        'orderbooks',
                        'market/trades',
                        'klines',
                        'delivery_info',
                        'settlement_prices',
                        'funding_rate',
                        'funding_rate_history',
                        'total_volumes',
                        'currencies',
                    ],
                },
                'private': {
                    'get': [
                        // account
                        'accounts',
                        'positions',
                        'transactions',
                        'user/deliveries',
                        'user/settlements',
                        'account_configs/cod',
                        'mmp_state',
                        // order
                        'orders',
                        'open_orders',
                        'stop_orders',
                        'user/trades',
                        'margins',
                        // wallet
                        'wallet/withdraw',
                        'wallet/withdrawals',
                        'wallet/deposits',
                    ],
                    'post': [
                        // account
                        'account_configs/cod',
                        'update_mmp_config',
                        'reset_mmp',
                        // order
                        'orders',
                        'batchorders',
                        'cancel_orders',
                        'amend_orders',
                        'amend_batchorders',
                        'close_positions',
                        // wallet
                        'wallet/withdraw',
                    ],
                },
            },
            'httpExceptions': {
                '400': BadRequest,
                '429': DDoSProtection,
                '500': ExchangeNotAvailable,
            },
            'exceptions': {
                // '0': Success,
                '18100100': ExchangeError, // General Error
                '18100101': ExchangeError, // Invalid Order Request
                '18100102': ExchangeError, // Invalid Order Side
                '18100103': ExchangeError, // Invalid Order Price
                '18100104': ExchangeError, // Invalid Order Quantity
                '18100105': ExchangeError, // Invalid Order Type
                '18100106': ExchangeError, // Invalid Time In Force
                '18100107': ExchangeError, // Get Position Error
                '18100109': ExchangeError, // Get Underlying Price Fail
                '18100110': ExchangeError, // Place Order Error
                '18100111': ExchangeError, // Marshal Order Error
                '18100112': ExchangeError, // Submit Order Request Error
                '18100113': ExchangeError, // Invalid Order ID
                '18100114': ExchangeError, // Get Order Error
                '18100115': ExchangeError, // Order Not Found
                '18100116': ExchangeError, // Submit Order Cancel Error
                '18100117': ExchangeError, // Invalid Order Status Parameter
                '18100119': ExchangeError, // Get Trade Error
                '18100120': ExchangeError, // Bad Create Option Request
                '18100121': ExchangeError, // Calc Strike Price Error
                '18100122': ExchangeError, // Create Option Error
                '18100123': ExchangeError, // Bad Update Option Request
                '18100124': ExchangeError, // Invalid Expiration
                '18100125': ExchangeError, // Get Option Error
                '18100126': ExchangeError, // Invalid Option Status
                '18100127': ExchangeError, // Update Option Error
                '18100128': ExchangeError, // Get Expiration Error
                '18100129': ExchangeError, // Invalid Delivery Price
                '18100130': ExchangeError, // Option Has Incomplete Orders
                '18100131': ExchangeError, // Bad Transfer Request
                '18100132': ExchangeError, // Invalid Transfer Quantity
                '18100133': ExchangeError, // Create Transfer Error
                '18100134': ExchangeError, // Get User Trade Error
                '18100135': ExchangeError, // Get Transfer Error
                '18100137': ExchangeError, // Get Account Error
                '18100138': ExchangeError, // Get Trades Error
                '18100139': ExchangeError, // Invalid Option Type
                '18100141': ExchangeError, // Invalid Currency
                '18100142': ExchangeError, // Get Underlying Error
                '18100143': ExchangeError, // Get Ticks Error
                '18100144': ExchangeError, // Get Mark Price Error
                '18100145': ExchangeError, // Get Portfolio Margin Error
                '18100146': ExchangeError, // Update Account Error
                '18100147': ExchangeError, // Get Transaction Log Error
                '18100148': ExchangeError, // Audit Account Error
                '18100149': ExchangeError, // Delivery Information Error
                '18100150': ExchangeError, // Exceed Max Open Order By Account
                '18100151': ExchangeError, // Exceed Max Open Order By Instrument
                '18100152': ExchangeError, // Get Open Order Count Error
                '18100153': ExchangeError, // Create Expiration Error
                '18100154': ExchangeError, // Update Access Token Error
                '18100155': ExchangeError, // Bad Delete Option Request
                '18100156': ExchangeError, // Delete Option Error
                '18100157': ExchangeError, // Bad Config Error
                '18100158': ExchangeError, // Update Config Error
                '18100159': ExchangeError, // Get Fee Rate Error
                '18100160': ExchangeError, // Invalidate Parameters Error
                '18100161': ExchangeError, // Get Orderbook Error
                '18100162': ExchangeError, // Get Index Error
                '18100163': ExchangeError, // Big Account Information Error
                '18100164': ExchangeError, // Get Uc Transfer Record Error
                '18100165': ExchangeError, // Invalid User Error
                '18100166': ExchangeError, // Insurance Account Error
                '18100167': ExchangeError, // Insurance Log Error
                '18100168': ExchangeError, // Fee Account Error
                '18100169': ExchangeError, // Fee Log Error
                '18100170': ExchangeError, // Get Delivery Error
                '18100171': ExchangeError, // Get Insurance Data Error
                '18100172': ExchangeError, // Invalid Depth Error
                '18100173': ExchangeError, // Invalid Expired Error
                '18100174': ExchangeError, // Get Orderbook Summary Error
                '18100175': ExchangeError, // Get Settlement Error
                '18100176': ExchangeError, // Get Trading View Data Error
                '18100177': ExchangeError, // Get User Error
                '18100178': ExchangeError, // Save User Error
                '18100179': ExchangeError, // Get Funding Chart Data Error
                '18100180': ExchangeError, // Invalid Order Cancel Request
                '18100181': ExchangeError, // Get Instrument Error
                '18100183': ExchangeError, // Get Future Error
                '18100185': ExchangeError, // Invalid Instrument
                '18100186': ExchangeError, // Close Position Request Error
                '18100187': ExchangeError, // Get Order Margin Error
                '18100188': ExchangeError, // Get Limit Price Error
                '18100189': ExchangeError, // Invalid Stop Price
                '18100190': ExchangeError, // Get Open Stop Order Count Error
                '18100191': ExchangeError, // Exceed Max Open Stop Order
                '18100192': ExchangeError, // Invalid Order Stop Price
                '18100193': ExchangeError, // Invalid Order Trigger Type
                '18100194': ExchangeError, // Save Stop Order Failed
                '18100195': ExchangeError, // Delete Expiration Error
                '18100196': ExchangeError, // Get Funding Rate Error
                '18100197': ExchangeError, // Bad Update Expiration Request
                '18100198': ExchangeError, // Update Expiration Error
                '18100199': ExchangeError, // Insufficient Balance Error
                '18100200': ExchangeError, // Invalid Transaction Type Error
                '18100201': ExchangeError, // Get Index Data Error
                '18100202': ExchangeError, // Invalid Argument Error
                '18100204': ExchangeError, // Invalid Page Parameter Error
                '18100205': ExchangeError, // Get Market Summary Error
                '18100206': ExchangeError, // System Account Error
                '18100210': ExchangeError, // Invalid Operator Id Error
                '18100211': ExchangeError, // Get Takeover Records Error
                '18100212': ExchangeError, // Invalid Operator User Ids
                '18100213': ExchangeError, // Start Takeover
                '18100214': ExchangeError, // Invalid Account Id
                '18100215': ExchangeError, // Exit Admin Takeover
                '18100216': ExchangeError, // Link Admin To Account
                '18100217': ExchangeError, // Unlink Admin From Account
                '18100218': ExchangeError, // Calc Portfolio Margin
                '18100223': ExchangeError, // Get Takeover Orders Error
                '18100224': ExchangeError, // Invalid Amend Order Request Error
                '18100225': ExchangeError, // Auto Price Error
                '18100226': ExchangeError, // Takeover Switch User Id Error
                '18100227': ExchangeError, // Account Is Locked Error
                '18100228': ExchangeError, // Get Bankruptcy Error
                '18100229': ExchangeError, // Filled Bankruptcy Request Error
                '18100230': ExchangeError, // Exceed Max Stop Order Error
                '18100231': ExchangeError, // Invalid Stop Order Status Error
                '18100232': ExchangeError, // Verification Code Mail Error
                '18100233': ExchangeError, // Verification Code Phone Error
                '18100234': ExchangeError, // Rpc Error: Order not active
                '18100235': ExchangeError, // Fill Bankruptcy Error
                '18100236': ExchangeError, // Invalid Order Role
                '18100237': ExchangeError, // No Block Order Permission
                '18100238': ExchangeError, // Self Trading Error
                '18100239': ExchangeError, // Illegal Valid Time Error
                '18100240': ExchangeError, // Invalid Block Order Request
                '18100241': ExchangeError, // Accept Block Order Error
                '18100242': ExchangeError, // Reject Block Order Error
                '18100243': ExchangeError, // Calculate Option Mm Error
                '18100244': ExchangeError, // Reduce Only Error
                '18100245': ExchangeError, // Block Trade Service Stop Error
                '18100246': ExchangeError, // Get Stop Trigger Price Error
                '18100247': ExchangeError, // Get Open Order Size Error
                '18100248': ExchangeError, // Get Position Size Error
                '18100249': ExchangeError, // Exceed Max Open Order By Option
                '18100250': ExchangeError, // Exceed Max Open Order By Future
                '18100251': ExchangeError, // Marketing Bonus Request Error
                '18100252': ExchangeError, // Bonus Error
                '18100253': ExchangeError, // Get Bonus Error
                '18100254': ExchangeError, // Marketing Refund Request Error
                '18100255': ExchangeError, // Refund Error
                '18100256': ExchangeError, // Get Active Error
                '18100257': ExchangeError, // Get Account Configuration Error
                '18100258': ExchangeError, // Invalid User Kyc Level Error
                '18100259': ExchangeError, // Duplicate Bonus Error
                '18100260': ExchangeError, // Calc Position Summary Error
                '18100261': ExchangeError, // Exceed Account Delta Error
                '18100262': ExchangeError, // Withdraw Request Error
                '18100263': ExchangeError, // Withdraw Error
                '18100264': ExchangeError, // Invalid User Defined String
                '18100265': ExchangeError, // Invalid Blocktrade Source
                '18100266': ExchangeError, // Send Captcha Error
                '18100267': ExchangeError, // Invalid Captcha Error
                '18100268': ExchangeError, // Invalid Number String
                '18100269': ExchangeError, // Exceed Max Position Error
                '18100270': ExchangeError, // Exceed Max Open Quantity Error
                '18100271': ExchangeError, // Get Block Order Error
                '18100272': ExchangeError, // Duplicated Blocktrade Key
                '18100273': ExchangeError, // Creat Bonus Active Error
                '18100274': ExchangeError, // Bonus Total Limit Error
                '18100275': ExchangeError, // Invalid Batch Order Request
                '18100276': ExchangeError, // Invalid Batch Order Count Request
                '18100277': ExchangeError, // Rpc New Batch Order Error
                '18100278': ExchangeError, // Fetch Db Timeout
                '18100279': ExchangeError, // Takeover Not Allowed
                '18100280': ExchangeError, // Invalid Batch Order Amend Request
                '18100281': ExchangeError, // Not Found In Open Orders
                '18100282': ExchangeError, // Rpc Batch Amend Error
                '18100285': ExchangeError, // Mmp error
                '18100304': ExchangeError, // Invalid Channel Error
                '18100305': ExchangeError, // Invalid Category Error
                '18100306': ExchangeError, // Invalid Interval Error
                '18100401': ExchangeError, // Invalid Address
                '18100402': ExchangeError, // Address Not Whitelisted
                '18100403': ExchangeError, // Invalid Fund Password
                '18100404': ExchangeError, // Withdrawal Order Not Exist
                '18100405': ExchangeError, // KYT Rejected
                '18100406': ExchangeError, // Withdraw Too Frequently
                '18100407': ExchangeError, // Withdraw Limit Exceeded
                '18100408': ExchangeError, // Withdraw Amount Less Than Minimum Amount
                '18200300': PermissionDenied, // Rate Limit Exceed
                '18200301': PermissionDenied, // Login Error
                '18200302': AuthenticationError, // Authentication Error
                '17002010': AuthenticationError, // signature error
                '17002011': AuthenticationError, // invalid IP address
                '17002012': AuthenticationError, // no permission to access this endpoint
                '17002014': AuthenticationError, // timestamp expired
                '17002006': AuthenticationError, // internal error
                '18200303': PermissionDenied, // Exceed Max Connection Error
                '18300300': ExchangeError, // Not Part In Competition
                '18300301': ExchangeError, // Register Competition Failed
                '18300302': ExchangeError, // Register Competition Failed
                '18400300': ExchangeError, // Cancel Only Period
                '18500000': ExchangeError, // Rpc timeout error (API result in uncertain state, see above info)
            },
        });
    }

    async getIndex (params = {}) {
        // params = {
        //     'currency': 'BTC',
        // }
        const resp = await this.publicGetIndex (params);
        const indexResp = this.safeValue (resp, 'data', {});
        const name = this.safeString (indexResp, 'name');
        const indexPrice = this.safeString (indexResp, 'index_price');
        return {
            'name': name,
            'index_price': indexPrice,
        };
    }

    async getMarketSummary (params = {}) {
        // params = {
        //     'currency': 'BTC',
        //     'category': 'future',
        //     'instrument_id': 'BTC-PERPETUAL',
        // }
        const resp = await this.publicGetMarketSummary (params);
        const marketSummaries = this.safeValue (resp, 'data', []);
        const nums = marketSummaries.length;
        if (nums < 1) {
            throw new NetworkError (this.id + ' publicGetMarketSummary returned empty response: ' + this.json (marketSummaries));
        }
        const result = [];
        for (let i = 0; i < nums; i++) {
            const market = marketSummaries[i];
            const instrumentId = this.safeString (market, 'instrument_id');
            const timestamp = this.safeString (market, 'timestamp');
            const bestBid = this.safeString (market, 'best_bid');
            const bestAsk = this.safeString (market, 'best_ask');
            const bestBitQty = this.safeString (market, 'best_bid_qty');
            const bestAskQty = this.safeString (market, 'best_ask_qty');
            const lastPrice = this.safeString (market, 'last_price');
            const lastQty = this.safeString (market, 'last_qty');
            const open24H = this.safeString (market, 'open24h');
            const high24H = this.safeString (market, 'high24h');
            const low24H = this.safeString (market, 'low24h');
            const volume24H = this.safeString (market, 'volume24h');
            const openInterest = this.safeString (market, 'open_interest');
            const markPrice = this.safeString (market, 'mark_price');
            const maxBuy = this.safeString (market, 'max_buy');
            const minSell = this.safeString (market, 'min_sell');
            const delta = this.safeString (market, 'delta');
            const gamma = this.safeString (market, 'gamma');
            const vega = this.safeString (market, 'vega');
            const theta = this.safeString (market, 'theta');
            result.push ({
                'instrument_id': instrumentId,
                'timestamp': timestamp,
                'best_bid': bestBid,
                'best_ask': bestAsk,
                'best_bid_qty': bestBitQty,
                'best_ask_qty': bestAskQty,
                'last_price': lastPrice,
                'last_qty': lastQty,
                'open24h': open24H,
                'high24h': high24H,
                'low24h': low24H,
                'volume24h': volume24H,
                'open_interest': openInterest,
                'mark_price': markPrice,
                'max_buy': maxBuy,
                'min_sell': minSell,
                'delta': delta,
                'gamma': gamma,
                'vega': vega,
                'theta': theta,
            });
        }
        return result;
    }

    async getCurrencies (params = {}) {
        const resp = await this.publicGetCurrencies (params);
        const indexResp = this.safeValue (resp, 'data', {});
        const currencies = this.safeValue (indexResp, 'currencies', []);
        return {
            'currencies': currencies,
        };
    }

    async fetchTime (params = {}) {
        const timeResp = await this.publicGetSystemTime (params);
        // {
        //   "code": 0,
        //   "message": "",
        //   "data": 1587884283175
        // }
        return this.safeInteger (timeResp, 'data');
    }

    async fetchStatus (params = {}) {
        await this.publicGetSystemTime (params);
        // {
        //   "code": 0,
        //   "message": "",
        //   "data": 1587884283175
        // }
        this.status = this.extend (this.status, {
            'status': 'ok',
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchBalance (params = {}) {
        const ccysResp = await this.getCurrencies ();
        const ccys = this.safeValue (ccysResp, 'currencies', []);
        const result = {
            'info': [],
        };
        for (let i = 0; i < ccys.length; i++) {
            const resp = await this.privateGetAccounts ({ 'currency': ccys[i] });
            const accountResp = this.safeValue (resp, 'data', {});
            result['info'].push (accountResp);
            const currencyId = ccys[i];
            const currencyCode = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeNumber (accountResp, 'available_balance');
            account['used'] = this.safeNumber (accountResp, 'maintenance_margin');
            account['total'] = this.safeNumber (accountResp, 'equity');
            result[currencyCode] = account;
        }
        return this.parseBalance (result);
    }

    async fetchMarkets (params = {}) {
        const ccysResp = await this.getCurrencies ();
        const ccys = this.safeValue (ccysResp, 'currencies', []);
        const result = [];
        for (let i = 0; i < ccys.length; i++) {
            const request = {
                'currency': ccys[i],
            };
            const categories = this.options.category;
            for (let j = 0; j < categories.length; j++) {
                request['category'] = categories[j];
                const instrumentResp = await this.publicGetInstruments (this.extend (request, params));
                const instruments = this.safeValue (instrumentResp, 'data', []);
                for (let k = 0; k < instruments.length; k++) {
                    const instrument = instruments[k];
                    const id = this.safeString (instrument, 'instrument_id');
                    const base = this.safeString (instrument, 'base_currency');
                    const quote = this.safeString (instrument, 'quote_currency');
                    const type = categories[j];
                    const future = (type === 'future');
                    const option = (type === 'option');
                    const active = this.safeString (instrument, 'active');
                    const minSize = this.safeNumber (instrument, 'min_size');
                    const stepSize = this.safeNumber (instrument, 'size_step');
                    const precision = {
                        'amount': minSize,
                        'price': stepSize,
                    };
                    result.push ({
                        'id': id,
                        'symbol': id,
                        'base': base,
                        'quote': quote,
                        'active': active,
                        'precision': precision,
                        'tierBased': true,
                        'limits': {
                            'amount': {
                                'min': minSize,
                                'max': undefined,
                            },
                            'price': {
                                'min': stepSize,
                                'max': undefined,
                            },
                            'cost': {
                                'min': undefined,
                                'max': undefined,
                            },
                        },
                        'type': type,
                        'spot': false,
                        'future': future,
                        'option': option,
                        'info': instrument,
                    });
                }
            }
        }
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_id': market['id'],
            'timeframe_min': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        const now = this.milliseconds ();
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a since argument or a limit argument');
            } else {
                request['start_time'] = now - (limit - 1) * duration * 1000;
                request['end_time'] = now;
            }
        } else {
            request['start_time'] = since;
            if (limit === undefined) {
                request['end_time'] = now;
            } else {
                request['end_time'] = this.sum (since, limit * duration * 1000);
            }
        }
        const response = await this.publicGetKlines (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": {
        //         "close": [
        //             0.023
        //         ],
        //         "high": [
        //             0.031
        //         ],
        //         "low": [
        //             0.022
        //         ],
        //         "open": [
        //             0.028
        //         ],
        //         "timestamps": [
        //             1585296000000
        //         ],
        //         "volume": [
        //             31.2
        //         ]
        //     }
        // }
        const klines = this.safeValue (response, 'data', {});
        const ohlcvs = this.convertTradingViewToOHLCV (klines, 'timestamps', 'open', 'high', 'low', 'close', 'volume', true);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_id': market['id'],
        };
        const tickerResp = await this.publicGetTickers (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data":{
        //         "time":1589126498813,
        //         "instrument_id":"BTC-26JUN20-5000-C",
        //         "best_bid":"0.50200000",
        //         "best_ask":"0.50500000",
        //         "best_bid_qty":"2.30000000",
        //         "best_ask_qty":"0.80000000",
        //         "ask_sigma":"2.22748567",
        //         "bid_sigma":"2.18964114",
        //         "last_price":"0.50500000",
        //         "last_qty":"0.10000000",
        //         "open24h":"0.50500000",
        //         "high24h":"0.50500000",
        //         "low24h":"0.50500000",
        //         "price_change24h":"",
        //         "volume24h":"0.10000000",
        //         "open_interest":"289.50000000",
        //         "underlying_name":"BTC-26JUN20",
        //         "underlying_price":"8616.02000000",
        //         "mark_price":"0.43989364",
        //         "sigma":"1.29049244",
        //         "delta":"0.92073799",
        //         "vega":"4.54807454",
        //         "theta":"-6.28858194",
        //         "gamma":"0.00003713",
        //         "min_sell":"0.38950000",
        //         "max_buy":"0.49000000"
        //     }
        // }
        const result = this.safeValue (tickerResp, 'data', {});
        return this.parseTicker (result, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'time');
        const instrumentId = this.safeString (ticker, 'instrument_id');
        const symbol = this.safeSymbol (instrumentId, market);
        const last = this.safeNumber (ticker, 'last_price');
        const stats = this.safeValue (ticker, 'stats', ticker);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (stats, 'high24h'),
            'low': this.safeNumber (stats, 'low24h'),
            'bid': this.safeNumber (ticker, 'best_bid'),
            'bidVolume': this.safeNumber (ticker, 'best_bid_qty'),
            'ask': this.safeNumber (ticker, 'best_ask'),
            'askVolume': this.safeNumber (ticker, 'best_ask_qty'),
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        // params = {
        //     'currency': 'BTC',
        // }
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a currency parameter.');
        }
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a id parameter.');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const orderResp = await this.privateGetOrders (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [{
        //         "order_id": "7718222",
        //         "created_at": 1589202185000,
        //         "updated_at": 1589460149000,
        //         "user_id": "51140",
        //         "instrument_id": "BTC-29MAY20-7500-C",
        //         "order_type": "limit",
        //         "side": "buy",
        //         "price": "0.08000000",
        //         "qty": "3.00000000",
        //         "time_in_force": "gtc",
        //         "avg_price": "0.00000000",
        //         "filled_qty": "0.00000000",
        //         "status": "cancelled",
        //         "fee": "0.00000000",
        //         "is_liquidation": false,
        //         "auto_price": "0.00000000",
        //         "auto_price_type": "",
        //         "pnl": "0.00000000",
        //         "cash_flow": "0.00000000",
        //         "initial_margin": "",
        //         "taker_fee_rate": "0.00050000",
        //         "maker_fee_rate": "0.00020000",
        //         "label": "hedge",
        //         "stop_price": "0.00000000",
        //         "reduce_only": false,
        //         "post_only": false,
        //         "reject_post_only": false,
        //         "mmp": false,
        //         "reorder_index": 1,
        //         "source": "api",
        //         "hidden": false
        //     }]
        // }
        const orders = this.safeValue (orderResp, 'data', []);
        const orderResult = orders[0];
        return this.parseOrder (orderResult);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a currency parameter.');
        }
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['instrument_id'] = symbol;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const orderResp = await this.privateGetOrders (params);
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [{
        //         "order_id": "7718222",
        //         "created_at": 1589202185000,
        //         "updated_at": 1589460149000,
        //         "user_id": "51140",
        //         "instrument_id": "BTC-29MAY20-7500-C",
        //         "order_type": "limit",
        //         "side": "buy",
        //         "price": "0.08000000",
        //         "qty": "3.00000000",
        //         "time_in_force": "gtc",
        //         "avg_price": "0.00000000",
        //         "filled_qty": "0.00000000",
        //         "status": "cancelled",
        //         "fee": "0.00000000",
        //         "is_liquidation": false,
        //         "auto_price": "0.00000000",
        //         "auto_price_type": "",
        //         "pnl": "0.00000000",
        //         "cash_flow": "0.00000000",
        //         "initial_margin": "",
        //         "taker_fee_rate": "0.00050000",
        //         "maker_fee_rate": "0.00020000",
        //         "label": "hedge",
        //         "stop_price": "0.00000000",
        //         "reduce_only": false,
        //         "post_only": false,
        //         "reject_post_only": false,
        //         "mmp": false,
        //         "reorder_index": 1,
        //         "source": "api",
        //         "hidden": false
        //     }]
        // }
        const orderList = this.safeValue (orderResp, 'data', []);
        return this.parseOrders (orderList, undefined, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders() requires a currency parameter.');
        }
        await this.loadMarkets ();
        const request = {
            'include_open': false,
        };
        if (symbol !== undefined) {
            request['instrument_id'] = symbol;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const closedOrderResp = await this.privateGetOrders (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [{
        //         "order_id": "7718222",
        //         "created_at": 1589202185000,
        //         "updated_at": 1589460149000,
        //         "user_id": "51140",
        //         "instrument_id": "BTC-29MAY20-7500-C",
        //         "order_type": "limit",
        //         "side": "buy",
        //         "price": "0.08000000",
        //         "qty": "3.00000000",
        //         "time_in_force": "gtc",
        //         "avg_price": "0.00000000",
        //         "filled_qty": "0.00000000",
        //         "status": "cancelled",
        //         "fee": "0.00000000",
        //         "is_liquidation": false,
        //         "auto_price": "0.00000000",
        //         "auto_price_type": "",
        //         "pnl": "0.00000000",
        //         "cash_flow": "0.00000000",
        //         "initial_margin": "",
        //         "taker_fee_rate": "0.00050000",
        //         "maker_fee_rate": "0.00020000",
        //         "label": "hedge",
        //         "stop_price": "0.00000000",
        //         "reduce_only": false,
        //         "post_only": false,
        //         "reject_post_only": false,
        //         "mmp": false,
        //         "reorder_index": 1,
        //         "source": "api",
        //         "hidden": false
        //     }]
        // }
        const closedOrders = this.safeValue (closedOrderResp, 'data', []);
        return this.parseOrders (closedOrders, undefined, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a currency parameter.');
        }
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['instrument_id'] = symbol;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const openOrderResp = await this.privateGetOpenOrders (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [{
        //         "order_id": "7610691",
        //         "created_at": 1589183001000,
        //         "updated_at": 1589183001000,
        //         "user_id": "51140",
        //         "instrument_id": "BTC-29MAY20-7500-C",
        //         "order_type": "limit",
        //         "side": "buy",
        //         "price": "0.08000000",
        //         "qty": "3.00000000",
        //         "time_in_force": "gtc",
        //         "avg_price": "0.00000000",
        //         "filled_qty": "0.00000000",
        //         "status": "open",
        //         "fee": "0.00000000",
        //         "is_liquidation": false,
        //         "auto_price": "0.00000000",
        //         "auto_price_type": "",
        //         "pnl": "0.00000000",
        //         "cash_flow": "0.00000000",
        //         "initial_margin": "0.24000000",
        //         "taker_fee_rate": "0.00050000",
        //         "maker_fee_rate": "0.00020000",
        //         "label": "hedge",
        //         "stop_price": "0.00000000",
        //         "reduce_only": false,
        //         "post_only": false,
        //         "reject_post_only": false,
        //         "mmp": false,
        //         "reorder_index": 1,
        //         "source": "api",
        //         "hidden": false
        //         }
        //     ]
        // }
        const openOrders = this.safeValue (openOrderResp, 'data', []);
        return this.parseOrders (openOrders, undefined, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a currency parameter.');
        }
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a id parameter.');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const tradesResp = await this.privateGetUserTrades (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [{
        //         "trade_id": "23210268",
        //         "order_id": "17551020",
        //         "instrument_id": "BTC-22MAY20-7500-C",
        //         "qty": "2.00000000",
        //         "price": "0.17550000",
        //         "sigma": "0.00000000",
        //         "underlying_price": "9471.25000000",
        //         "index_price": "9469.81000000",
        //         "usd_price": "1661.95165500",
        //         "fee": "0.00100000",
        //         "fee_rate": "0.00050000",
        //         "side": "buy",
        //         "created_at": 1589521371000,
        //         "is_taker": true,
        //         "order_type": "limit",
        //         "label": "hedge"
        //     }]
        // }
        const trades = this.safeValue (tradesResp, 'data', []);
        return this.parseTrades (trades, undefined, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a currency parameter.');
        }
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const tradesResp = await this.privateGetUserTrades (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [{
        //         "trade_id": "23210268",
        //         "order_id": "17551020",
        //         "instrument_id": "BTC-22MAY20-7500-C",
        //         "qty": "2.00000000",
        //         "price": "0.17550000",
        //         "sigma": "0.00000000",
        //         "underlying_price": "9471.25000000",
        //         "index_price": "9469.81000000",
        //         "usd_price": "1661.95165500",
        //         "fee": "0.00100000",
        //         "fee_rate": "0.00050000",
        //         "side": "buy",
        //         "created_at": 1589521371000,
        //         "is_taker": true,
        //         "order_type": "limit",
        //         "label": "hedge"
        //     }]
        // }
        const trades = this.safeValue (tradesResp, 'data', []);
        return this.parseTrades (trades, undefined, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a currency parameter.');
        }
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            request['instrument_id'] = symbol;
        }
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const tradesResp = await this.publicGetMarketTrades (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": [
        //         {
        //             "created_at": 1585299600000,
        //             "index_price": "8000.00000000",
        //             "underlying_price": "8000.00000000",
        //             "instrument_id": "BTC-27MAR20-9000-C",
        //             "price": "0.03400000",
        //             "qty": "1.00000000",
        //             "side": "buy",
        //             "sigma": "0.00200000",
        //             "trade_id": 3743,
        //             "is_block_trade": false
        //         }
        //     ]
        // }
        const trades = this.safeValue (tradesResp, 'data', []);
        return this.parseTrades (trades, undefined, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'trade_id');
        const marketId = this.safeString (trade, 'instrument_id');
        const symbol = marketId;
        const timestamp = this.safeInteger (trade, 'created_at');
        const side = this.safeString (trade, 'side');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber (trade, 'qty');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const isTaker = this.safeString (trade, 'is_taker');
        let takerOrMaker = undefined;
        if (isTaker !== undefined) {
            if (isTaker === 'true') {
                takerOrMaker = 'taker';
            } else {
                takerOrMaker = 'maker';
            }
        }
        const feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.getCurrencyFromInstrumentId (marketId);
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeString (trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_id': market['id'],
        };
        if (limit !== undefined) {
            request['level'] = limit;
        }
        const orderBookResp = await this.publicGetOrderbooks (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": {
        //         "instrument_id": "BTC-27MAR20-9000-C",
        //         "timestamp": 1585299600000,
        //         "asks": [
        //             ["0.02300000", "3.00000000"],
        //             ["0.02400000", "0.70000000"],
        //             ["0.02500000", "18.00000000"]
        //         ],
        //         "bids": [
        //             ["0.02100000", "0.30000000"],
        //             ["0.02000000", "2.00000000"],
        //             ["0.01900000", "5.60000000"]
        //         ]
        //     }
        // }
        const orderBook = this.safeValue (orderBookResp, 'data', {});
        const timestamp = this.safeInteger (orderBook, 'timestamp');
        const nonce = this.nonce ();
        const result = this.parseOrderBook (orderBook, timestamp);
        result['nonce'] = nonce;
        return result;
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'created_at');
        const lastUpdate = this.safeInteger (order, 'updated_at');
        const id = this.safeString (order, 'order_id');
        const price = this.safeNumber (order, 'price');
        const average = this.safeNumber (order, 'avg_price');
        const amount = this.safeNumber (order, 'qty');
        const filled = this.safeNumber (order, 'filled_qty');
        let lastTradeTimestamp = undefined;
        if (filled !== undefined) {
            if (filled > 0) {
                lastTradeTimestamp = lastUpdate;
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'instrument_id');
        market = this.safeMarket (marketId, market);
        const side = this.safeStringLower (order, 'side');
        let feeCost = this.safeNumber (order, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
            fee = {
                'cost': feeCost,
                'currency': market['base'],
            };
        }
        const type = this.safeString (order, 'order_type');
        const timeInForce = this.parseTimeInForce (this.safeString (order, 'time_in_force'));
        const stopPrice = this.safeValue (order, 'stop_price');
        const postOnly = this.safeValue (order, 'post_only');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_id': market['id'],
            'qty': this.amountToPrecision (symbol, amount),
            'order_type': type, // limit/market/stop-limit/stop-market/
            'side': side, // buy/sell
        };
        let priceIsRequired = false;
        let stopPriceIsRequired = false;
        if (type === 'limit') {
            priceIsRequired = true;
        } else if (type === 'stop-limit') {
            priceIsRequired = true;
            stopPriceIsRequired = true;
        }
        if (priceIsRequired) {
            if (price !== undefined) {
                request['price'] = this.priceToPrecision (symbol, price);
            } else {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
        }
        if (stopPriceIsRequired) {
            const stopPrice = this.safeNumber (params, 'stop_price');
            if (stopPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a stop_price param for a ' + type + ' order');
            } else {
                request['stop_price'] = this.priceToPrecision (symbol, stopPrice);
            }
        }
        const placeOrderResp = await this.privatePostOrders (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": {
        //         "order_id": "17552314",
        //         "created_at": 1589523803017,
        //         "updated_at": 1589523803017,
        //         "user_id": "51140",
        //         "instrument_id": "BTC-29MAY20-8000-C",
        //         "order_type": "limit",
        //         "side": "buy",
        //         "price": "0.08000000",
        //         "qty": "3.00000000",
        //         "time_in_force": "gtc",
        //         "avg_price": "0.00000000",
        //         "filled_qty": "0.00000000",
        //         "status": "open",
        //         "is_liquidation": false,
        //         "auto_price": "0.00000000",
        //         "auto_price_type": "",
        //         "taker_fee_rate": "0.00050000",
        //         "maker_fee_rate": "0.00020000",
        //         "label":"hedge",
        //         "stop_price": "0.00000000",
        //         "reduce_only": false,
        //         "post_only": false,
        //         "reject_post_only": false,
        //         "mmp":false,
        //         "source": "api",
        //         "hidden": false
        //     }
        // }
        const order = this.safeValue (placeOrderResp, 'data', {});
        return this.parseOrder (order, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires a currency parameter.');
        }
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires an id argument');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        if (amount !== undefined) {
            request['qty'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const amendResp = await this.privatePostAmendOrders (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": {
        //         "order_id": "1206764",
        //         "created_at": 1590760363846,
        //         "updated_at": 1590760363846,
        //         "user_id": "51140",
        //         "instrument_id": "BTC-PERPETUAL",
        //         "order_type": "limit",
        //         "side": "buy",
        //         "price": "9450.00000000",
        //         "qty": "260.00000000",
        //         "time_in_force": "gtc",
        //         "avg_price": "9435.67307692",
        //         "filled_qty": "260.00000000",
        //         "status": "filled",
        //         "is_liquidation": false,
        //         "auto_price": "0.00000000",
        //         "auto_price_type": "",
        //         "taker_fee_rate": "0.00050000",
        //         "maker_fee_rate": "-0.00020000",
        //         "label": "hedge",
        //         "stop_price": "0.00000000",
        //         "reduce_only": false,
        //         "post_only": false,
        //         "reject_post_only": false,
        //         "mmp": false,
        //         "source": "api",
        //         "hidden": false,
        //     }
        // }
        const code = this.safeNumber (amendResp, 'code');
        if (code === 0) {
            const order = this.safeValue (amendResp, 'data', {});
            return this.parseOrder (order);
        }
        const errMsg = this.safeString (amendResp, 'message');
        throw new InvalidOrder (this.id + ' editOrder() failed, err: ' + errMsg);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const currency = this.safeString (params, 'currency');
        if (currency === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a currency parameter.');
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const cancelResp = await this.privatePostCancelOrders (this.extend (request, params));
        // {
        //     "code": 0,
        //     "message": "",
        //     "data": {
        //         "num_cancelled": 1
        //     }
        // }
        const code = this.safeNumber (cancelResp, 'code');
        if (code === 0) {
            return this.fetchOrder (id, symbol, params);
        }
        const errMsg = this.safeString (cancelResp, 'message');
        throw new InvalidOrder (this.id + ' cancelOrder() failed, err: ' + errMsg);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const ccysResp = await this.getCurrencies ();
        const ccys = this.safeValue (ccysResp, 'currencies', []);
        for (let i = 0; i < ccys.length; i++) {
            const request = { 'currency': ccys[i] };
            await this.privatePostCancelOrders (request);
        }
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits() requires a currency code argument');
        }
        const request = {
            'currency': code,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const depositResp = await this.privateGetWalletDeposits (this.extend (request, params));
        // {
        //     "code": 0,
        //     "data": {
        //         "count": 1,
        //         "items": [{
        //             "address": "mfaFpdVCb6UFS5AXUhC8VGXgj9dnJ37nLP",
        //             "amount": "0.001",
        //             "code": 0,
        //             "confirmations": 0,
        //             "currency": "BTC",
        //             "state": "confirmed",
        //             "transaction_id": "52e1537002f51acbf5f52b9dfeab6a9e7cc185a669cda2573e768420b0839523",
        //             "created_at": 1608606000000,
        //             "updated_at": 1608606000000,
        //             "is_onchain": true
        //         }]
        //     }
        // }
        const result = this.safeValue (depositResp, 'data', {});
        const depositItems = this.safeValue (result, 'items', []);
        return this.parseTransactions (depositItems, code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchWithdrawals() requires a currency code argument');
        }
        const request = {
            'currency': code,
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const withdrawalsResp = await this.privateGetWalletWithdrawals (this.extend (request, params));
        // {
        //     "code": 0,
        //     "data": {
        //         "count": 2,
        //         "items": [{
        //             "address": "mfaFpdVCb6UFS5AXUhC8VGXgj9dnJ37nLP",
        //             "amount": "0.001",
        //             "code": 0,
        //             "confirmations": 0,
        //             "currency": "BTC",
        //             "fee": "0.00001",
        //             "state": "confirmed",
        //             "transaction_id": "52e1537002f51acbf5f52b9dfeab6a9e7cc185a669cda2573e768420b0839523",
        //             "created_at": 1608606000000,
        //             "updated_at": 1608606000000,
        //             "is_onchain": true
        //         }, {
        //             "address": "mfaFpdVCb6UFS5AXUhC8VGXgj9dnJ37nLP",
        //             "amount": "0.11",
        //             "code": 13100100,
        //             "confirmations": 0,
        //             "currency": "BTC",
        //             "fee": "0.00001",
        //             "state": "rejected",
        //             "transaction_id": "",
        //             "created_at": 1608606000000,
        //             "updated_at": 1608606000000,
        //             "is_onchain": false
        //         }]
        //     }
        // }
        const result = this.safeValue (withdrawalsResp, 'result', {});
        const withdrawals = this.safeValue (result, 'data', []);
        return this.parseTransactions (withdrawals, code, since, limit, params);
    }

    parseTransaction (transaction, currency = undefined) {
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeInteger (transaction, 'created_at');
        const updated = this.safeInteger (transaction, 'updated_at');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const address = this.safeString (transaction, 'address');
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'transaction_id'),
            'txid': this.safeString (transaction, 'transaction_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': this.safeNumber (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': undefined,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'confirmed': 'ok',
            'pending': 'pending',
            'mempool': 'pending',
            'unconfirmed': 'pending',
            'rejected': 'canceled',
            'rollback': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
            'pending': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'gtc': 'GTC',
            'fok': 'FOK',
            'ioc': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    getCurrencyFromInstrumentId (id) {
        const parts = id.split ('-');
        if (parts.length < 2 || parts[0] === '') {
            throw new ArgumentsRequired (this.id + ' the instrument id is invalid, id = ' + id + '.');
        }
        return parts[0];
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const pathEnding = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + pathEnding;
        if (api !== 'public') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            params['timestamp'] = timestamp;
            const strToSign = pathEnding + '&' + this.encodeObject (params);
            // this.print ('strToSign: ' + strToSign);
            const signature = this.hmac (strToSign, this.secret, 'sha256', 'hex');
            // this.print ('signature: ' + signature);
            headers = {
                'Content-Type': 'application/json',
                'X-Bit-Access-Key': this.apiKey,
            };
            params['signature'] = signature;
        }
        const queryWithTimeAndSig = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            const queryEncoded = this.urlencode (queryWithTimeAndSig);
            if (Object.keys (query).length) {
                url += '?' + queryEncoded;
                // this.print ('GET query url: ' + url);
            }
        } else if (method === 'POST') {
            body = this.json (queryWithTimeAndSig);
            // this.print ('POST query url: ' + url);
            // this.print ('POST request body: ' + JSON.stringify (body));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    encodeObject (params = {}) {
        const paramKeys = Object.keys (params);
        const sortedKeys = paramKeys.sort ();
        const resultList = [];
        for (let i = 0; i < sortedKeys.length; i++) {
            const key = sortedKeys[i];
            const val = this.safeValue (params, key);
            if (Array.isArray (val)) {
                const listVal = this.encodeList (val);
                resultList.push (key + '=' + listVal);
            } else if (val instanceof Object) {
                const objVal = this.encodeObject (val);
                resultList.push (key + '=' + objVal);
            } else if (val instanceof Boolean) {
                const boolVal = val.toString ().toLowerCase ();
                resultList.push (key + '=' + boolVal);
            } else {
                const generalVal = val.toString ();
                resultList.push (key + '=' + generalVal);
            }
        }
        const sortedList = resultList.sort ();
        return sortedList.join ('&');
    }

    encodeList (list = []) {
        const strList = [];
        for (let i = 0; i < list; i++) {
            const objVal = this.encodeObject (list[i]);
            const objStr = objVal.toString ();
            strList.push (objStr);
        }
        let outputStr = strList.join ('&');
        outputStr = '[' + outputStr + ']';
        return outputStr;
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (
            path,
            api,
            method,
            params,
            headers,
            body
        );
        return response;
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ('code' in response) {
            const code = this.safeInteger (response, 'code');
            if (code === 0) {
                return;
            }
            const message = this.safeString (response, 'message');
            this.throwExactlyMatchedException (this.exceptions, code, message);
            throw new ExchangeError (message);
        } else {
            const error = this.id + ' ' + body;
            throw new ExchangeError (error);
        }
    }
};
