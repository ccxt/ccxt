'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AccountSuspended, BadRequest, BadResponse, NetworkError, DDoSProtection, AuthenticationError, PermissionDenied, ExchangeError, InsufficientFunds, InvalidOrder, InvalidNonce, OrderNotFound, InvalidAddress, RateLimitExceeded, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class digifinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'digifinex',
            'name': 'DigiFinex',
            'countries': [ 'SG' ],
            'version': 'v3',
            'rateLimit': 900, // 300 for posts
            'has': {
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '12h': '720',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg',
                'api': 'https://openapi.digifinex.com',
                'www': 'https://www.digifinex.com',
                'doc': [
                    'https://docs.digifinex.com',
                ],
                'fees': 'https://digifinex.zendesk.com/hc/en-us/articles/360000328422-Fee-Structure-on-DigiFinex',
                'referral': 'https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp',
            },
            'api': {
                'public': {
                    'get': [
                        '{market}/symbols',
                        'kline',
                        'margin/currencies',
                        'margin/symbols',
                        'markets',
                        'order_book',
                        'ping',
                        'spot/symbols',
                        'time',
                        'trades',
                        'trades/symbols',
                        'ticker',
                        'currencies', // todo add fetchCurrencies
                    ],
                },
                'private': {
                    'get': [
                        '{market}/financelog',
                        '{market}/mytrades',
                        '{market}/order',
                        '{market}​/order​/detail', // todo add fetchOrder
                        '{market}/order/current',
                        '{market}/order/history',
                        'margin/assets',
                        'margin/financelog',
                        'margin/mytrades',
                        'margin/order',
                        'margin/order/current',
                        'margin/order/history',
                        'margin/positions',
                        'otc/financelog',
                        'spot/assets',
                        'spot/financelog',
                        'spot/mytrades',
                        'spot/order',
                        'spot/order/current',
                        'spot/order/history',
                        'deposit/address', // todo add fetchDepositAddress
                        'deposit/history', // todo add fetchDeposits
                        'withdraw/history', // todo add fetchWithdrawals
                    ],
                    'post': [
                        '{market}/order/cancel',
                        '{market}/order/new',
                        '{market}​/order​/batch_new',
                        'margin/order/cancel',
                        'margin/order/new',
                        'margin/position/close',
                        'spot/order/cancel',
                        'spot/order/new',
                        'transfer',
                        'withdraw/new', // todo add withdraw()
                        'withdraw/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'exceptions': {
                'exact': {
                    '10001': [ BadRequest, "Wrong request method, please check it's a GET ot POST request" ],
                    '10002': [ AuthenticationError, 'Invalid ApiKey' ],
                    '10003': [ AuthenticationError, "Sign doesn't match" ],
                    '10004': [ BadRequest, 'Illegal request parameters' ],
                    '10005': [ DDoSProtection, 'Request frequency exceeds the limit' ],
                    '10006': [ PermissionDenied, 'Unauthorized to execute this request' ],
                    '10007': [ PermissionDenied, 'IP address Unauthorized' ],
                    '10008': [ InvalidNonce, 'Timestamp for this request is invalid, timestamp must within 1 minute' ],
                    '10009': [ NetworkError, 'Unexist endpoint, please check endpoint URL' ],
                    '10011': [ AccountSuspended, 'ApiKey expired. Please go to client side to re-create an ApiKey' ],
                    '20001': [ PermissionDenied, 'Trade is not open for this trading pair' ],
                    '20002': [ PermissionDenied, 'Trade of this trading pair is suspended' ],
                    '20003': [ InvalidOrder, 'Invalid price or amount' ],
                    '20007': [ InvalidOrder, 'Price precision error' ],
                    '20008': [ InvalidOrder, 'Amount precision error' ],
                    '20009': [ InvalidOrder, 'Amount is less than the minimum requirement' ],
                    '20010': [ InvalidOrder, 'Cash Amount is less than the minimum requirement' ],
                    '20011': [ InsufficientFunds, 'Insufficient balance' ],
                    '20012': [ BadRequest, 'Invalid trade type, valid value: buy/sell)' ],
                    '20013': [ InvalidOrder, 'No order info found' ],
                    '20014': [ BadRequest, 'Invalid date, Valid format: 2018-07-25)' ],
                    '20015': [ BadRequest, 'Date exceeds the limit' ],
                    '20018': [ PermissionDenied, 'Your trading rights have been banned by the system' ],
                    '20019': [ BadSymbol, 'Wrong trading pair symbol. Correct format:"usdt_btc". Quote asset is in the front' ],
                    '20020': [ DDoSProtection, "You have violated the API operation trading rules and temporarily forbid trading. At present, we have certain restrictions on the user's transaction rate and withdrawal rate." ],
                    '50000': [ ExchangeError, 'Exception error' ],
                    '20021': [ BadRequest, 'Invalid currency' ],
                    '20022': [ BadRequest, 'The ending timestamp must be larger than the starting timestamp' ],
                    '20023': [ BadRequest, 'Invalid transfer type' ],
                    '20024': [ BadRequest, 'Invalid amount' ],
                    '20025': [ BadRequest, 'This currency is not transferable at the moment' ],
                    '20026': [ InsufficientFunds, 'Transfer amount exceed your balance' ],
                    '20027': [ PermissionDenied, 'Abnormal account status' ],
                    '20028': [ PermissionDenied, 'Blacklist for transfer' ],
                    '20029': [ PermissionDenied, 'Transfer amount exceed your daily limit' ],
                    '20030': [ BadRequest, 'You have no position on this trading pair' ],
                    '20032': [ PermissionDenied, 'Withdrawal limited' ],
                    '20033': [ BadRequest, 'Wrong Withdrawal ID' ],
                    '20034': [ PermissionDenied, 'Withdrawal service of this crypto has been closed' ],
                    '20035': [ PermissionDenied, 'Withdrawal limit' ],
                    '20036': [ ExchangeError, 'Withdrawal cancellation failed' ],
                    '20037': [ InvalidAddress, 'The withdrawal address, Tag or chain type is not included in the withdrawal management list' ],
                    '20038': [ InvalidAddress, 'The withdrawal address is not on the white list' ],
                    '20039': [ ExchangeError, "Can't be canceled in current status" ],
                    '20040': [ RateLimitExceeded, 'Withdraw too frequently; limitation: 3 times a minute, 100 times a day' ],
                    '20041': [ PermissionDenied, 'Beyond the daily withdrawal limit' ],
                    '20042': [ BadSymbol, 'Current trading pair does not support API trading' ],
                },
                'broad': {
                },
            },
            'options': {
                'defaultType': 'spot',
                'types': [ 'spot', 'margin', 'otc' ],
            },
            'commonCurrencies': {
                'BHT': 'Black House Test',
                'EPS': 'Epanus',
                'MBN': 'Mobilian Coin',
                'TEL': 'TEL666',
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     {
        //         "data":[
        //             {
        //                 "deposit_status":1,
        //                 "min_deposit_amount":10,
        //                 "withdraw_fee_rate":0,
        //                 "min_withdraw_amount":10,
        //                 "min_withdraw_fee":5,
        //                 "currency":"USDT",
        //                 "withdraw_status":0,
        //                 "chain":"OMNI"
        //             },
        //             {
        //                 "deposit_status":1,
        //                 "min_deposit_amount":10,
        //                 "withdraw_fee_rate":0,
        //                 "min_withdraw_amount":10,
        //                 "min_withdraw_fee":3,
        //                 "currency":"USDT",
        //                 "withdraw_status":1,
        //                 "chain":"ERC20"
        //             },
        //             {
        //                 "deposit_status":0,
        //                 "min_deposit_amount":0,
        //                 "withdraw_fee_rate":0,
        //                 "min_withdraw_amount":0,
        //                 "min_withdraw_fee":0,
        //                 "currency":"DGF13",
        //                 "withdraw_status":0,
        //                 "chain":""
        //             },
        //         ],
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeValue (currency, 'deposit_status', 1);
            const withdrawStatus = this.safeValue (currency, 'withdraw_status', 1);
            const active = depositStatus && withdrawStatus;
            const fee = this.safeNumber (currency, 'withdraw_fee_rate');
            if (code in result) {
                if (Array.isArray (result[code]['info'])) {
                    result[code]['info'].push (currency);
                } else {
                    result[code]['info'] = [ result[code]['info'], currency ];
                }
            } else {
                result[code] = {
                    'id': id,
                    'code': code,
                    'info': currency,
                    'type': undefined,
                    'name': undefined,
                    'active': active,
                    'fee': fee,
                    'precision': 8, // todo fix hardcoded value
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.safeNumber (currency, 'min_withdraw_amount'),
                            'max': undefined,
                        },
                    },
                };
            }
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const method = this.safeString (options, 'method', 'fetch_markets_v2');
        return await this[method] (params);
    }

    async fetchMarketsV2 (params = {}) {
        const response = await this.publicGetTradesSymbols (params);
        //
        //     {
        //         "symbol_list":[
        //             {
        //                 "order_types":["LIMIT","MARKET"],
        //                 "quote_asset":"USDT",
        //                 "minimum_value":2,
        //                 "amount_precision":4,
        //                 "status":"TRADING",
        //                 "minimum_amount":0.0001,
        //                 "symbol":"BTC_USDT",
        //                 "is_allow":1,
        //                 "zone":"MAIN",
        //                 "base_asset":"BTC",
        //                 "price_precision":2
        //             }
        //         ],
        //         "code":0
        //     }
        //
        const markets = this.safeValue (response, 'symbol_list', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base_asset');
            const quoteId = this.safeString (market, 'quote_asset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeNumber (market, 'minimum_amount'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'minimum_value'),
                    'max': undefined,
                },
            };
            //
            // The status is documented in the exchange API docs as follows:
            // TRADING, HALT (delisted), BREAK (trading paused)
            // https://docs.digifinex.vip/en-ww/v3/#/public/spot/symbols
            // However, all spot markets actually have status === 'HALT'
            // despite that they appear to be active on the exchange website.
            // Apparently, we can't trust this status.
            // const status = this.safeString (market, 'status');
            // const active = (status === 'TRADING');
            //
            const isAllowed = this.safeInteger (market, 'is_allow', 1);
            const active = isAllowed ? true : false;
            const type = 'spot';
            const spot = (type === 'spot');
            const margin = (type === 'margin');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'type': type,
                'spot': spot,
                'margin': margin,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchMarketsV1 (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "data": [
        //             {
        //                 "volume_precision":4,
        //                 "price_precision":2,
        //                 "market":"btc_usdt",
        //                 "min_amount":2,
        //                 "min_volume":0.0001
        //             },
        //         ],
        //         "date":1564507456,
        //         "code":0
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'volume_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeNumber (market, 'min_volume'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_amount'),
                    'max': undefined,
                },
            };
            const active = undefined;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const method = 'privateGet' + this.capitalize (type) + 'Assets';
        const response = await this[method] (params);
        //
        //     {
        //         "code": 0,
        //         "list": [
        //             {
        //                 "currency": "BTC",
        //                 "free": 4723846.89208129,
        //                 "total": 0
        //             }
        //         ]
        //     }
        const balances = this.safeValue (response, 'list', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'frozen');
            account['free'] = this.safeString (balance, 'free');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 150
        }
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {
        //         "bids": [
        //             [9605.77,0.0016],
        //             [9605.46,0.0003],
        //             [9602.04,0.0127],
        //         ],
        //         "asks": [
        //             [9627.22,0.025803],
        //             [9627.12,0.168543],
        //             [9626.52,0.0011529],
        //         ],
        //         "date":1564509499,
        //         "code":0
        //     }
        //
        const timestamp = this.safeTimestamp (response, 'date');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        //
        //    {
        //        "ticker": [{
        //            "vol": 40717.4461,
        //            "change": -1.91,
        //            "base_vol": 392447999.65374,
        //            "sell": 9592.23,
        //            "last": 9592.22,
        //            "symbol": "btc_usdt",
        //            "low": 9476.24,
        //            "buy": 9592.03,
        //            "high": 9793.87
        //        }],
        //        "date": 1589874294,
        //        "code": 0
        //    }
        //
        const result = {};
        const tickers = this.safeValue (response, 'ticker', []);
        const date = this.safeInteger (response, 'date');
        for (let i = 0; i < tickers.length; i++) {
            const rawTicker = this.extend ({
                'date': date,
            }, tickers[i]);
            const ticker = this.parseTicker (rawTicker);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //    {
        //        "ticker": [{
        //            "vol": 40717.4461,
        //            "change": -1.91,
        //            "base_vol": 392447999.65374,
        //            "sell": 9592.23,
        //            "last": 9592.22,
        //            "symbol": "btc_usdt",
        //            "low": 9476.24,
        //            "buy": 9592.03,
        //            "high": 9793.87
        //        }],
        //        "date": 1589874294,
        //        "code": 0
        //    }
        //
        const date = this.safeInteger (response, 'date');
        const tickers = this.safeValue (response, 'ticker', []);
        const firstTicker = this.safeValue (tickers, 0, {});
        const result = this.extend ({ 'date': date }, firstTicker);
        return this.parseTicker (result, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "last":0.021957,
        //         "symbol": "btc_usdt",
        //         "base_vol":2249.3521732227,
        //         "change":-0.6,
        //         "vol":102443.5111,
        //         "sell":0.021978,
        //         "low":0.021791,
        //         "buy":0.021946,
        //         "high":0.022266,
        //         "date"1564518452, // injected from fetchTicker/fetchTickers
        //     }
        //
        const marketId = this.safeStringUpper (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeTimestamp (ticker, 'date');
        const last = this.safeNumber (ticker, 'last');
        const percentage = this.safeNumber (ticker, 'change');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'vol'),
            'quoteVolume': this.safeNumber (ticker, 'base_vol'),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "date":1564520003,
        //         "id":1596149203,
        //         "amount":0.7073,
        //         "type":"buy",
        //         "price":0.02193,
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "order_id": "6707cbdcda0edfaa7f4ab509e4cbf966",
        //         "id": 28457,
        //         "price": 0.1,
        //         "amount": 0,
        //         "fee": 0.096,
        //         "fee_currency": "USDT",
        //         "timestamp": 1499865549,
        //         "side": "buy",
        //         "is_maker": true
        //     }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        const timestamp = this.safeTimestamp2 (trade, 'date', 'timestamp');
        const side = this.safeString2 (trade, 'type', 'side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const takerOrMaker = this.safeValue (trade, 'is_maker');
        const feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
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
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        };
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "server_time": 1589873762,
        //         "code": 0
        //     }
        //
        return this.safeTimestamp (response, 'server_time');
    }

    async fetchStatus (params = {}) {
        await this.publicGetPing (params);
        //
        //     {
        //         "msg": "pong",
        //         "code": 0
        //     }
        //
        this.status = this.extend (this.status, {
            'status': 'ok',
            'updated': this.milliseconds (),
        });
        return this.status;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 500
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "date":1564520003,
        //                 "id":1596149203,
        //                 "amount":0.7073,
        //                 "type":"buy",
        //                 "price":0.02193,
        //             },
        //             {
        //                 "date":1564520002,
        //                 "id":1596149165,
        //                 "amount":0.3232,
        //                 "type":"sell",
        //                 "price":0.021927,
        //             },
        //         ],
        //         "code": 0,
        //         "date": 1564520003,
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1556712900,
        //         2205.899,
        //         0.029967,
        //         0.02997,
        //         0.029871,
        //         0.029927
        //     ]
        //
        return [
            this.safeTimestamp (ohlcv, 0),
            this.safeNumber (ohlcv, 5), // open
            this.safeNumber (ohlcv, 3), // high
            this.safeNumber (ohlcv, 4), // low
            this.safeNumber (ohlcv, 2), // close
            this.safeNumber (ohlcv, 1), // volume
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'period': this.timeframes[timeframe],
            // 'start_time': 1564520003, // starting timestamp, 200 candles before end_time by default
            // 'end_time': 1564520003, // ending timestamp, current timestamp by default
        };
        if (since !== undefined) {
            const startTime = parseInt (since / 1000);
            request['start_time'] = startTime;
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                request['end_time'] = this.sum (startTime, limit * duration);
            }
        } else if (limit !== undefined) {
            const endTime = this.seconds ();
            const duration = this.parseTimeframe (timeframe);
            request['startTime'] = this.sum (endTime, -limit * duration);
        }
        const response = await this.publicGetKline (this.extend (request, params));
        //
        //     {
        //         "code":0,
        //         "data":[
        //             [1556712900,2205.899,0.029967,0.02997,0.029871,0.029927],
        //             [1556713800,1912.9174,0.029992,0.030014,0.029955,0.02996],
        //             [1556714700,1556.4795,0.029974,0.030019,0.029969,0.02999],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'symbol': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            // 'post_only': 0, // 0 by default, if set to 1 the order will be canceled if it can be executed immediately, making sure there will be no market taking
        };
        let suffix = '';
        if (type === 'market') {
            suffix = '_market';
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        request['type'] = side + suffix;
        const response = await this.privatePostMarketOrderNew (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "order_id": "198361cecdc65f9c8c9bb2fa68faec40"
        //     }
        //
        const result = this.parseOrder (response, market);
        return this.extend (result, {
            'symbol': symbol,
            'side': side,
            'type': type,
            'amount': amount,
            'price': price,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'order_id': id,
        };
        const response = await this.privatePostMarketOrderCancel (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "success": [
        //             "198361cecdc65f9c8c9bb2fa68faec40",
        //             "3fb0d98e51c18954f10d439a9cf57de0"
        //         ],
        //         "error": [
        //             "78a7104e3c65cc0c5a212a53e76d0205"
        //         ]
        //     }
        //
        const canceledOrders = this.safeValue (response, 'success', []);
        const numCanceledOrders = canceledOrders.length;
        if (numCanceledOrders !== 1) {
            throw new OrderNotFound (this.id + ' cancelOrder ' + id + ' not found');
        }
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        const request = {
            'market': orderType,
            'order_id': ids.join (','),
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "success": [
        //             "198361cecdc65f9c8c9bb2fa68faec40",
        //             "3fb0d98e51c18954f10d439a9cf57de0"
        //         ],
        //         "error": [
        //             "78a7104e3c65cc0c5a212a53e76d0205"
        //         ]
        //     }
        //
        const canceledOrders = this.safeValue (response, 'success', []);
        const numCanceledOrders = canceledOrders.length;
        if (numCanceledOrders < 1) {
            throw new OrderNotFound (this.id + ' cancelOrders error');
        }
        return response;
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed',
            '3': 'canceled',
            '4': 'canceled', // partially filled and canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "code": 0,
        //         "order_id": "198361cecdc65f9c8c9bb2fa68faec40"
        //     }
        //
        // fetchOrder, fetchOpenOrders, fetchOrders
        //
        //     {
        //         "symbol": "BTC_USDT",
        //         "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //         "created_date": 1562303547,
        //         "finished_date": 0,
        //         "price": 0.1,
        //         "amount": 1,
        //         "cash_amount": 1,
        //         "executed_amount": 0,
        //         "avg_price": 0,
        //         "status": 1,
        //         "type": "buy",
        //         "kind": "margin"
        //     }
        //
        const id = this.safeString (order, 'order_id');
        const timestamp = this.safeTimestamp (order, 'created_date');
        const lastTradeTimestamp = this.safeTimestamp (order, 'finished_date');
        let side = this.safeString (order, 'type');
        let type = undefined;
        if (side !== undefined) {
            const parts = side.split ('_');
            const numParts = parts.length;
            if (numParts > 1) {
                side = parts[0];
                type = parts[1];
            } else {
                type = 'limit';
            }
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const amount = this.safeNumber (order, 'amount');
        const filled = this.safeNumber (order, 'executed_amount');
        const price = this.safeNumber (order, 'price');
        const average = this.safeNumber (order, 'avg_price');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': undefined,
            'average': average,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetMarketOrderCurrent (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000); // default 3 days from now, max 30 days
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetMarketOrderHistory (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'market': orderType,
            'order_id': id,
        };
        const response = await this.privateGetMarketOrder (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "dd3164b333a4afa9d5730bb87f6db8b3",
        //                 "created_date": 1562303547,
        //                 "finished_date": 0,
        //                 "price": 0.1,
        //                 "amount": 1,
        //                 "cash_amount": 1,
        //                 "executed_amount": 0,
        //                 "avg_price": 0,
        //                 "status": 1,
        //                 "type": "buy",
        //                 "kind": "margin"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const order = this.safeValue (data, 0);
        if (order === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() order ' + id + ' not found');
        }
        return this.parseOrder (order, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'market': orderType,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000); // default 3 days from now, max 30 days
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        const response = await this.privateGetMarketMytrades (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "list": [
        //             {
        //                 "symbol": "BTC_USDT",
        //                 "order_id": "6707cbdcda0edfaa7f4ab509e4cbf966",
        //                 "id": 28457,
        //                 "price": 0.1,
        //                 "amount": 0,
        //                 "fee": 0.096,
        //                 "fee_currency": "USDT",
        //                 "timestamp": 1499865549,
        //                 "side": "buy",
        //                 "is_maker": true
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'list', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {};
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "currency_mark": "BTC",
        //         "type": 100234,
        //         "num": 28457,
        //         "balance": 0.1,
        //         "time": 1546272000
        //     }
        //
        const id = this.safeString (item, 'num');
        const account = undefined;
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const code = this.safeCurrencyCode (this.safeString (item, 'currency_mark'), currency);
        const timestamp = this.safeTimestamp (item, 'time');
        const before = undefined;
        const after = this.safeNumber (item, 'balance');
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': undefined,
            'account': account,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': undefined,
            'before': before,
            'after': after,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const orderType = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        await this.loadMarkets ();
        const request = {
            'market': orderType,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency_mark'] = currency['id'];
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        const response = await this.privateGetMarketFinancelog (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": {
        //             "total": 521,
        //             "finance": [
        //                 {
        //                     "currency_mark": "BTC",
        //                     "type": 100234,
        //                     "num": 28457,
        //                     "balance": 0.1,
        //                     "time": 1546272000
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const items = this.safeValue (data, 'finance', []);
        return this.parseLedger (items, currency, since, limit);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "addressTag":"",
        //         "address":"0xf1104d9f8624f89775a3e9d480fc0e75a8ef4373",
        //         "currency":"USDT",
        //         "chain":"ERC20"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'addressTag');
        const currencyId = this.safeStringUpper (depositAddress, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        return {
            'info': depositAddress,
            'code': code,
            'address': address,
            'tag': tag,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "addressTag":"",
        //                 "address":"0xf1104d9f8624f89775a3e9d480fc0e75a8ef4373",
        //                 "currency":"USDT",
        //                 "chain":"ERC20"
        //             }
        //         ],
        //         "code":200
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const addresses = this.parseDepositAddresses (data);
        const address = this.safeValue (addresses, code);
        if (address === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress did not return an address for ' + code + ' - create the deposit address in the user settings on the exchange website first.');
        }
        return address;
    }

    async fetchTransactionsByType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        const request = {
            // 'currency': currency['id'],
            // 'from': 'fromId', // When direct is' prev ', from is 1, returning from old to new ascending, when direct is' next ', from is the ID of the most recent record, returned from the old descending order
            // 'size': 100, // default 100, max 500
            // 'direct': 'prev', // "prev" ascending, "next" descending
        };
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['size'] = Math.min (500, limit);
        }
        const method = (type === 'deposit') ? 'privateGetDepositHistory' : 'privateGetWithdrawHistory';
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "data": [
        //             {
        //                 "id": 1171,
        //                 "currency": "xrp",
        //                 "hash": "ed03094b84eafbe4bc16e7ef766ee959885ee5bcb265872baaa9c64e1cf86c2b",
        //                 "chain": "",
        //                 "amount": 7.457467,
        //                 "address": "rae93V8d2mdoUQHwBDBdM4NHCMehRJAsbm",
        //                 "memo": "100040",
        //                 "fee": 0,
        //                 "state": "safe",
        //                 "created_date": "2020-04-20 11:23:00",
        //                 "finished_date": "2020-04-20 13:23:00"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, { 'type': type });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsByType ('withdrawal', code, since, limit, params);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '0': 'pending', // Email Sent
            '1': 'canceled', // Cancelled (different from 1 = ok in deposits)
            '2': 'pending', // Awaiting Approval
            '3': 'failed', // Rejected
            '4': 'pending', // Processing
            '5': 'failed', // Failure
            '6': 'ok', // Completed
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "code": 200,
        //         "withdraw_id": 700
        //     }
        //
        // fetchDeposits, fetchWithdrawals
        //
        //     {
        //         "id": 1171,
        //         "currency": "xrp",
        //         "hash": "ed03094b84eafbe4bc16e7ef766ee959885ee5bcb265872baaa9c64e1cf86c2b",
        //         "chain": "",
        //         "amount": 7.457467,
        //         "address": "rae93V8d2mdoUQHwBDBdM4NHCMehRJAsbm",
        //         "memo": "100040",
        //         "fee": 0,
        //         "state": "safe",
        //         "created_date": "2020-04-20 11:23:00",
        //         "finished_date": "2020-04-20 13:23:00"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'withdraw_id');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'memo'); // set but unused
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const txid = this.safeString (transaction, 'hash');
        const currencyId = this.safeStringUpper (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_date'));
        const updated = this.parse8601 (this.safeString (transaction, 'finished_date'));
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const amount = this.safeNumber (transaction, 'amount');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'addressTo': address,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'tagFrom': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            // 'chain': 'ERC20', 'OMNI', 'TRC20', // required for USDT
            'address': address,
            'amount': parseFloat (amount),
            'currency': currency['id'],
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.privatePostWithdrawNew (this.extend (request, params));
        //
        //     {
        //         "code": 200,
        //         "withdraw_id": 700
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.version;
        let url = this.urls['api'] + '/' + version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const urlencoded = this.urlencode (this.keysort (query));
        if (api === 'private') {
            const nonce = this.nonce ().toString ();
            const auth = urlencoded;
            // the signature is not time-limited :\
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            if (method === 'GET') {
                if (urlencoded) {
                    url += '?' + urlencoded;
                }
            } else if (method === 'POST') {
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
                if (urlencoded) {
                    body = urlencoded;
                }
            }
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': nonce,
            };
        } else {
            if (urlencoded) {
                url += '?' + urlencoded;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (!response) {
            return; // fall back to default error handler
        }
        const code = this.safeString (response, 'code');
        if ((code === '0') || (code === '200')) {
            return; // no error
        }
        const feedback = this.id + ' ' + responseBody;
        if (code === undefined) {
            throw new BadResponse (feedback);
        }
        const unknownError = [ ExchangeError, feedback ];
        const [ ExceptionClass, message ] = this.safeValue (this.exceptions['exact'], code, unknownError);
        throw new ExceptionClass (message);
    }
};
