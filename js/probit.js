'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, BadResponse, BadRequest, InvalidOrder, InsufficientFunds, AuthenticationError, ArgumentsRequired, InvalidAddress, RateLimitExceeded, DDoSProtection, BadSymbol } = require ('./base/errors');
const { TRUNCATE, TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class probit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'probit',
            'name': 'ProBit',
            'countries': [ 'SC', 'KR' ], // Seychelles, South Korea
            'rateLimit': 250, // ms
            'has': {
                'CORS': true,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'createOrder': true,
                'createMarketOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'withdraw': true,
                'signIn': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '10m': '10m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M',
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/79268032-c4379480-7ea2-11ea-80b3-dd96bb29fd0d.jpg',
                'api': {
                    'accounts': 'https://accounts.probit.com',
                    'public': 'https://api.probit.com/api/exchange',
                    'private': 'https://api.probit.com/api/exchange',
                },
                'www': 'https://www.probit.com',
                'doc': [
                    'https://docs-en.probit.com',
                    'https://docs-ko.probit.com',
                ],
                'fees': 'https://support.probit.com/hc/en-us/articles/360020968611-Trading-Fees',
                'referral': 'https://www.probit.com/r/34608773',
            },
            'api': {
                'public': {
                    'get': [
                        'market',
                        'currency',
                        'currency_with_platform',
                        'time',
                        'ticker',
                        'order_book',
                        'trade',
                        'candle',
                    ],
                },
                'private': {
                    'post': [
                        'new_order',
                        'cancel_order',
                        'withdrawal',
                    ],
                    'get': [
                        'balance',
                        'order',
                        'open_order',
                        'order_history',
                        'trade_history',
                        'deposit_address',
                    ],
                },
                'accounts': {
                    'post': [
                        'token',
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
                    'UNAUTHORIZED': AuthenticationError,
                    'INVALID_ARGUMENT': BadRequest, // Parameters are not a valid format, parameters are empty, or out of range, or a parameter was sent when not required.
                    'TRADING_UNAVAILABLE': ExchangeNotAvailable,
                    'NOT_ENOUGH_BALANCE': InsufficientFunds,
                    'NOT_ALLOWED_COMBINATION': BadRequest,
                    'INVALID_ORDER': InvalidOrder, // Requested order does not exist, or it is not your order
                    'RATE_LIMIT_EXCEEDED': RateLimitExceeded, // You are sending requests too frequently. Please try it later.
                    'MARKET_UNAVAILABLE': ExchangeNotAvailable, // Market is closed today
                    'INVALID_MARKET': BadSymbol, // Requested market is not exist
                    'MARKET_CLOSED': BadSymbol, // {"errorCode":"MARKET_CLOSED"}
                    'MARKET_NOT_FOUND': BadSymbol, // {"errorCode":"MARKET_NOT_FOUND","message":"8e2b8496-0a1e-5beb-b990-a205b902eabe","details":{}}
                    'INVALID_CURRENCY': BadRequest, // Requested currency is not exist on ProBit system
                    'TOO_MANY_OPEN_ORDERS': DDoSProtection, // Too many open orders
                    'DUPLICATE_ADDRESS': InvalidAddress, // Address already exists in withdrawal address list
                    'invalid_grant': AuthenticationError, // {"error":"invalid_grant"}
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'timeInForce': {
                    'limit': 'gtc',
                    'market': 'ioc',
                },
            },
            'commonCurrencies': {
                'AUTO': 'Cube',
                'BCC': 'BCC',
                'BDP': 'BidiPass',
                'BTCBEAR': 'BEAR',
                'BTCBULL': 'BULL',
                'CBC': 'CryptoBharatCoin',
                'EPS': 'Epanus',  // conflict with EPS Ellipsis https://github.com/ccxt/ccxt/issues/8909
                'HBC': 'Hybrid Bank Cash',
                'ORC': 'Oracle System',
                'SOC': 'Soda Coin',
                'UNI': 'UNICORN Token',
                'UNISWAP': 'UNI',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarket (params);
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"MONA-USDT",
        //                 "base_currency_id":"MONA",
        //                 "quote_currency_id":"USDT",
        //                 "min_price":"0.001",
        //                 "max_price":"9999999999999999",
        //                 "price_increment":"0.001",
        //                 "min_quantity":"0.0001",
        //                 "max_quantity":"9999999999999999",
        //                 "quantity_precision":4,
        //                 "min_cost":"1",
        //                 "max_cost":"9999999999999999",
        //                 "cost_precision":8,
        //                 "taker_fee_rate":"0.2",
        //                 "maker_fee_rate":"0.2",
        //                 "show_in_ui":true,
        //                 "closed":false
        //             },
        //         ]
        //     }
        //
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base_currency_id');
            const quoteId = this.safeString (market, 'quote_currency_id');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const closed = this.safeValue (market, 'closed', false);
            const active = !closed;
            const amountPrecision = this.safeString (market, 'quantity_precision');
            const costPrecision = this.safeString (market, 'cost_precision');
            const amountTickSize = this.parsePrecision (amountPrecision);
            const costTickSize = this.parsePrecision (costPrecision);
            const precision = {
                'amount': this.parseNumber (amountTickSize),
                'price': this.safeNumber (market, 'price_increment'),
                'cost': this.parseNumber (costTickSize),
            };
            const takerFeeRate = this.safeString (market, 'taker_fee_rate');
            const taker = Precise.stringDiv (takerFeeRate, '100');
            const makerFeeRate = this.safeString (market, 'maker_fee_rate');
            const maker = Precise.stringDiv (makerFeeRate, '100');
            result.push ({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'taker': this.parseNumber (taker),
                'maker': this.parseNumber (maker),
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'min_quantity'),
                        'max': this.safeNumber (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'min_price'),
                        'max': this.safeNumber (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_cost'),
                        'max': this.safeNumber (market, 'max_cost'),
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencyWithPlatform (params);
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"USDT",
        //                 "display_name":{"ko-kr":"테더","en-us":"Tether"},
        //                 "show_in_ui":true,
        //                 "platform":[
        //                     {
        //                         "id":"ETH",
        //                         "priority":1,
        //                         "deposit":true,
        //                         "withdrawal":true,
        //                         "currency_id":"USDT",
        //                         "precision":6,
        //                         "min_confirmation_count":15,
        //                         "require_destination_tag":false,
        //                         "display_name":{"name":{"ko-kr":"ERC-20","en-us":"ERC-20"}},
        //                         "min_deposit_amount":"0",
        //                         "min_withdrawal_amount":"1",
        //                         "withdrawal_fee":[
        //                             {"amount":"0.01","priority":2,"currency_id":"ETH"},
        //                             {"amount":"1.5","priority":1,"currency_id":"USDT"},
        //                         ],
        //                         "deposit_fee":{},
        //                         "suspended_reason":"",
        //                         "deposit_suspended":false,
        //                         "withdrawal_suspended":false
        //                     },
        //                     {
        //                         "id":"OMNI",
        //                         "priority":2,
        //                         "deposit":true,
        //                         "withdrawal":true,
        //                         "currency_id":"USDT",
        //                         "precision":6,
        //                         "min_confirmation_count":3,
        //                         "require_destination_tag":false,
        //                         "display_name":{"name":{"ko-kr":"OMNI","en-us":"OMNI"}},
        //                         "min_deposit_amount":"0",
        //                         "min_withdrawal_amount":"5",
        //                         "withdrawal_fee":[{"amount":"5","priority":1,"currency_id":"USDT"}],
        //                         "deposit_fee":{},
        //                         "suspended_reason":"wallet_maintenance",
        //                         "deposit_suspended":false,
        //                         "withdrawal_suspended":false
        //                     }
        //                 ],
        //                 "stakeable":false,
        //                 "unstakeable":false,
        //                 "auto_stake":false,
        //                 "auto_stake_amount":"0"
        //             }
        //         ]
        //     }
        //
        const currencies = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const displayName = this.safeValue (currency, 'display_name');
            const name = this.safeString (displayName, 'en-us');
            const platforms = this.safeValue (currency, 'platform', []);
            const platformsByPriority = this.sortBy (platforms, 'priority');
            const platform = this.safeValue (platformsByPriority, 0, {});
            const precision = this.safeInteger (platform, 'precision');
            const depositSuspended = this.safeValue (platform, 'deposit_suspended');
            const withdrawalSuspended = this.safeValue (platform, 'withdrawal_suspended');
            const active = !(depositSuspended && withdrawalSuspended);
            const withdrawalFees = this.safeValue (platform, 'withdrawal_fee', {});
            const fees = [];
            // sometimes the withdrawal fee is an empty object
            // [ { 'amount': '0.015', 'priority': 1, 'currency_id': 'ETH' }, {} ]
            for (let j = 0; j < withdrawalFees.length; j++) {
                const withdrawalFee = withdrawalFees[j];
                const amount = this.safeNumber (withdrawalFee, 'amount');
                const priority = this.safeInteger (withdrawalFee, 'priority');
                if ((amount !== undefined) && (priority !== undefined)) {
                    fees.push (withdrawalFee);
                }
            }
            const withdrawalFeesByPriority = this.sortBy (fees, 'priority');
            const withdrawalFee = this.safeValue (withdrawalFeesByPriority, 0, {});
            const fee = this.safeNumber (withdrawalFee, 'amount');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': this.safeNumber (platform, 'min_deposit_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeNumber (platform, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //         data: [
        //             {
        //                 "currency_id":"XRP",
        //                 "total":"100",
        //                 "available":"0",
        //             }
        //         ]
        //     }
        //
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const data = this.safeValue (response, 'data');
        for (let i = 0; i < data.length; i++) {
            const balance = data[i];
            const currencyId = this.safeString (balance, 'currency_id');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'total');
            account['free'] = this.safeString (balance, 'available');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        //
        //     {
        //         data: [
        //             { side: 'buy', price: '0.000031', quantity: '10' },
        //             { side: 'buy', price: '0.00356007', quantity: '4.92156877' },
        //             { side: 'sell', price: '0.1857', quantity: '0.17' },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const dataBySide = this.groupBy (data, 'side');
        return this.parseOrderBook (dataBySide, symbol, undefined, 'buy', 'sell', 'price', 'quantity');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const marketIds = this.marketIds (symbols);
            request['market_ids'] = marketIds.join (',');
        }
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "last":"0.022902",
        //                 "low":"0.021693",
        //                 "high":"0.024093",
        //                 "change":"-0.000047",
        //                 "base_volume":"15681.986",
        //                 "quote_volume":"360.514403624",
        //                 "market_id":"ETH-BTC",
        //                 "time":"2020-04-12T18:43:38.000Z"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_ids': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "last":"0.022902",
        //                 "low":"0.021693",
        //                 "high":"0.024093",
        //                 "change":"-0.000047",
        //                 "base_volume":"15681.986",
        //                 "quote_volume":"360.514403624",
        //                 "market_id":"ETH-BTC",
        //                 "time":"2020-04-12T18:43:38.000Z"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const ticker = this.safeValue (data, 0);
        if (ticker === undefined) {
            throw new BadResponse (this.id + ' fetchTicker() returned an empty response');
        }
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "last":"0.022902",
        //         "low":"0.021693",
        //         "high":"0.024093",
        //         "change":"-0.000047",
        //         "base_volume":"15681.986",
        //         "quote_volume":"360.514403624",
        //         "market_id":"ETH-BTC",
        //         "time":"2020-04-12T18:43:38.000Z"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (ticker, 'time'));
        const marketId = this.safeString (ticker, 'market_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        const close = this.safeNumber (ticker, 'last');
        const change = this.safeNumber (ticker, 'change');
        let percentage = undefined;
        let open = undefined;
        if (change !== undefined) {
            if (close !== undefined) {
                open = close - change;
                percentage = (change / open) * 100;
            }
        }
        const baseVolume = this.safeNumber (ticker, 'base_volume');
        const quoteVolume = this.safeNumber (ticker, 'quote_volume');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            'limit': 100,
            'start_time': this.iso8601 (0),
            'end_time': this.iso8601 (this.milliseconds ()),
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeHistory (this.extend (request, params));
        //
        //     {
        //         data: [
        //             {
        //                 "id":"BTC-USDT:183566",
        //                 "order_id":"17209376",
        //                 "side":"sell",
        //                 "fee_amount":"0.657396569175",
        //                 "fee_currency_id":"USDT",
        //                 "status":"settled",
        //                 "price":"6573.96569175",
        //                 "quantity":"0.1",
        //                 "cost":"657.396569175",
        //                 "time":"2018-08-10T06:06:46.000Z",
        //                 "market_id":"BTC-USDT"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'limit': 100,
            'start_time': '1970-01-01T00:00:00.000Z',
            'end_time': this.iso8601 (this.milliseconds ()),
        };
        if (since !== undefined) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTrade (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "id":"ETH-BTC:3331886",
        //                 "price":"0.022981",
        //                 "quantity":"12.337",
        //                 "time":"2020-04-12T20:55:42.371Z",
        //                 "side":"sell",
        //                 "tick_direction":"down"
        //             },
        //             {
        //                 "id":"ETH-BTC:3331885",
        //                 "price":"0.022982",
        //                 "quantity":"6.472",
        //                 "time":"2020-04-12T20:55:39.652Z",
        //                 "side":"sell",
        //                 "tick_direction":"down"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":"ETH-BTC:3331886",
        //         "price":"0.022981",
        //         "quantity":"12.337",
        //         "time":"2020-04-12T20:55:42.371Z",
        //         "side":"sell",
        //         "tick_direction":"down"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id":"BTC-USDT:183566",
        //         "order_id":"17209376",
        //         "side":"sell",
        //         "fee_amount":"0.657396569175",
        //         "fee_currency_id":"USDT",
        //         "status":"settled",
        //         "price":"6573.96569175",
        //         "quantity":"0.1",
        //         "cost":"657.396569175",
        //         "time":"2018-08-10T06:06:46.000Z",
        //         "market_id":"BTC-USDT"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const id = this.safeString (trade, 'id');
        let marketId = undefined;
        if (id !== undefined) {
            const parts = id.split (':');
            marketId = this.safeString (parts, 0);
        }
        marketId = this.safeString (trade, 'market_id', marketId);
        const symbol = this.safeSymbol (marketId, market, '-');
        const side = this.safeString (trade, 'side');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'quantity');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const orderId = this.safeString (trade, 'order_id');
        const feeCost = this.safeNumber (trade, 'fee_amount');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency_id');
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
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     { "data":"2020-04-12T18:54:25.390Z" }
        //
        const timestamp = this.parse8601 (this.safeString (response, 'data'));
        return timestamp;
    }

    normalizeOHLCVTimestamp (timestamp, timeframe, after = false) {
        const duration = this.parseTimeframe (timeframe);
        if (timeframe === '1M') {
            const iso8601 = this.iso8601 (timestamp);
            const parts = iso8601.split ('-');
            const year = this.safeString (parts, 0);
            let month = this.safeInteger (parts, 1);
            if (after) {
                month = this.sum (month, 1);
            }
            if (month < 10) {
                month = '0' + month.toString ();
            } else {
                month = month.toString ();
            }
            return year + '-' + month + '-01T00:00:00.000Z';
        } else if (timeframe === '1w') {
            timestamp = parseInt (timestamp / 1000);
            const firstSunday = 259200; // 1970-01-04T00:00:00.000Z
            const difference = timestamp - firstSunday;
            const numWeeks = Math.floor (difference / duration);
            let previousSunday = this.sum (firstSunday, numWeeks * duration);
            if (after) {
                previousSunday = this.sum (previousSunday, duration);
            }
            return this.iso8601 (previousSunday * 1000);
        } else {
            timestamp = parseInt (timestamp / 1000);
            timestamp = duration * parseInt (timestamp / duration);
            if (after) {
                timestamp = this.sum (timestamp, duration);
            }
            return this.iso8601 (timestamp * 1000);
        }
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        limit = (limit === undefined) ? 100 : limit;
        let requestLimit = this.sum (limit, 1);
        requestLimit = Math.min (1000, requestLimit); // max 1000
        const request = {
            'market_ids': market['id'],
            'interval': interval,
            'sort': 'asc', // 'asc' will always include the start_time, 'desc' will always include end_time
            'limit': requestLimit, // max 1000
        };
        const now = this.milliseconds ();
        const duration = this.parseTimeframe (timeframe);
        let startTime = since;
        let endTime = now;
        if (since === undefined) {
            if (limit === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires either a since argument or a limit argument');
            } else {
                startTime = now - limit * duration * 1000;
            }
        } else {
            if (limit === undefined) {
                endTime = now;
            } else {
                endTime = this.sum (since, this.sum (limit, 1) * duration * 1000);
            }
        }
        const startTimeNormalized = this.normalizeOHLCVTimestamp (startTime, timeframe);
        const endTimeNormalized = this.normalizeOHLCVTimestamp (endTime, timeframe, true);
        request['start_time'] = startTimeNormalized;
        request['end_time'] = endTimeNormalized;
        const response = await this.publicGetCandle (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "market_id":"ETH-BTC",
        //                 "open":"0.02811",
        //                 "close":"0.02811",
        //                 "low":"0.02811",
        //                 "high":"0.02811",
        //                 "base_volume":"0.0005",
        //                 "quote_volume":"0.000014055",
        //                 "start_time":"2018-11-30T18:19:00.000Z",
        //                 "end_time":"2018-11-30T18:20:00.000Z"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "market_id":"ETH-BTC",
        //         "open":"0.02811",
        //         "close":"0.02811",
        //         "low":"0.02811",
        //         "high":"0.02811",
        //         "base_volume":"0.0005",
        //         "quote_volume":"0.000014055",
        //         "start_time":"2018-11-30T18:19:00.000Z",
        //         "end_time":"2018-11-30T18:20:00.000Z"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'start_time')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'base_volume'),
        ];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        since = this.parse8601 (since);
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        const response = await this.privateGetOpenOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'start_time': this.iso8601 (0),
            'end_time': this.iso8601 (this.milliseconds ()),
            'limit': 100,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_id'] = market['id'];
        }
        if (since) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrderHistory (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrders (data, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        } else {
            request['order_id'] = id;
        }
        const query = this.omit (params, [ 'clientOrderId', 'client_order_id' ]);
        const response = await this.privateGetOrder (this.extend (request, query));
        const data = this.safeValue (response, 'data', []);
        const order = this.safeValue (data, 0);
        return this.parseOrder (order, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'cancelled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         id: string,
        //         user_id: string,
        //         market_id: string,
        //         type: 'orderType',
        //         side: 'side',
        //         quantity: string,
        //         limit_price: string,
        //         time_in_force: 'timeInForce',
        //         filled_cost: string,
        //         filled_quantity: string,
        //         open_quantity: string,
        //         cancelled_quantity: string,
        //         status: 'orderStatus',
        //         time: 'date',
        //         client_order_id: string,
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const marketId = this.safeString (order, 'market_id');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.parse8601 (this.safeString (order, 'time'));
        let price = this.safeNumber (order, 'limit_price');
        const filled = this.safeNumber (order, 'filled_quantity');
        let remaining = this.safeNumber (order, 'open_quantity');
        const canceledAmount = this.safeNumber (order, 'cancelled_quantity');
        if (canceledAmount !== undefined) {
            remaining = this.sum (remaining, canceledAmount);
        }
        const amount = this.safeNumber (order, 'quantity', this.sum (filled, remaining));
        const cost = this.safeNumber2 (order, 'filled_cost', 'cost');
        if (type === 'market') {
            price = undefined;
        }
        let clientOrderId = this.safeString (order, 'client_order_id');
        if (clientOrderId === '') {
            clientOrderId = undefined;
        }
        const timeInForce = this.safeStringUpper (order, 'time_in_force');
        return this.safeOrder ({
            'id': id,
            'info': order,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'status': status,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'cost': cost,
            'fee': undefined,
            'trades': undefined,
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['cost'], this.precisionMode);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const options = this.safeValue (this.options, 'timeInForce');
        const defaultTimeInForce = this.safeValue (options, type);
        const timeInForce = this.safeString2 (params, 'timeInForce', 'time_in_force', defaultTimeInForce);
        const request = {
            'market_id': market['id'],
            'type': type,
            'side': side,
            'time_in_force': timeInForce,
        };
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        let costToPrecision = undefined;
        if (type === 'limit') {
            request['limit_price'] = this.priceToPrecision (symbol, price);
            request['quantity'] = this.amountToPrecision (symbol, amount);
        } else if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                let cost = this.safeNumber (params, 'cost');
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (createMarketBuyOrderRequiresPrice) {
                    if (price !== undefined) {
                        if (cost === undefined) {
                            cost = amount * price;
                        }
                    } else if (cost === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument for market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false and supply the total cost value in the 'amount' argument or in the 'cost' extra parameter (the exchange-specific behaviour)");
                    }
                } else {
                    cost = (cost === undefined) ? amount : cost;
                }
                costToPrecision = this.costToPrecision (symbol, cost);
                request['cost'] = costToPrecision;
            } else {
                request['quantity'] = this.amountToPrecision (symbol, amount);
            }
        }
        const query = this.omit (params, [ 'timeInForce', 'time_in_force', 'clientOrderId', 'client_order_id' ]);
        const response = await this.privatePostNewOrder (this.extend (request, query));
        //
        //     {
        //         data: {
        //             id: string,
        //             user_id: string,
        //             market_id: string,
        //             type: 'orderType',
        //             side: 'side',
        //             quantity: string,
        //             limit_price: string,
        //             time_in_force: 'timeInForce',
        //             filled_cost: string,
        //             filled_quantity: string,
        //             open_quantity: string,
        //             cancelled_quantity: string,
        //             status: 'orderStatus',
        //             time: 'date',
        //             client_order_id: string,
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data');
        const order = this.parseOrder (data, market);
        // a workaround for incorrect huge amounts
        // returned by the exchange on market buys
        if ((type === 'market') && (side === 'buy')) {
            order['amount'] = undefined;
            order['cost'] = this.parseNumber (costToPrecision);
            order['remaining'] = undefined;
        }
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'order_id': id,
        };
        const response = await this.privatePostCancelOrder (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrder (data);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        const address = this.safeString (depositAddress, 'address');
        const tag = this.safeString (depositAddress, 'destination_tag');
        const currencyId = this.safeString (depositAddress, 'currency_id');
        const code = this.safeCurrencyCode (currencyId);
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency_id': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        //
        //     {
        //         "data":[
        //             {
        //                 "currency_id":"ETH",
        //                 "address":"0x12e2caf3c4051ba1146e612f532901a423a9898a",
        //                 "destination_tag":null
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const firstAddress = this.safeValue (data, 0);
        if (firstAddress === undefined) {
            throw new InvalidAddress (this.id + ' fetchDepositAddress returned an empty response');
        }
        return this.parseDepositAddress (firstAddress, currency);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (codes) {
            const currencyIds = [];
            for (let i = 0; i < codes.length; i++) {
                const currency = this.currency (codes[i]);
                currencyIds.push (currency['id']);
            }
            request['currency_id'] = codes.join (',');
        }
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseDepositAddresses (data);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // In order to use this method
        // you need to allow API withdrawal from the API Settings Page, and
        // and register the list of withdrawal addresses and destination tags on the API Settings page
        // you can only withdraw to the registered addresses using the API
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (tag === undefined) {
            tag = '';
        }
        const request = {
            'currency_id': currency['id'],
            // 'platform_id': 'ETH', // if omitted it will use the default platform for the currency
            'address': address,
            'destination_tag': tag,
            'amount': this.numberToString (amount),
            // which currency to pay the withdrawal fees
            // only applicable for currencies that accepts multiple withdrawal fee options
            // 'fee_currency_id': 'ETH', // if omitted it will use the default fee policy for each currency
            // whether the amount field includes fees
            // 'include_fee': false, // makes sense only when fee_currency_id is equal to currency_id
        };
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseTransaction (data, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const amount = this.safeNumber (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'destination_tag');
        const txid = this.safeString (transaction, 'hash');
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const type = this.safeString (transaction, 'type');
        const currencyId = this.safeString (transaction, 'currency_id');
        const code = this.safeCurrencyCode (currencyId);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined && feeCost !== 0) {
            fee = {
                'currency': code,
                'cost': feeCost,
            };
        }
        return {
            'id': id,
            'currency': code,
            'amount': amount,
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'status': status,
            'type': type,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'requested': 'pending',
            'pending': 'pending',
            'confirming': 'pending',
            'confirmed': 'pending',
            'applying': 'pending',
            'done': 'ok',
            'cancelled': 'canceled',
            'cancelling': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        const query = this.omit (params, this.extractParams (path));
        if (api === 'accounts') {
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            const auth = this.apiKey + ':' + this.secret;
            const auth64 = this.stringToBase64 (auth);
            headers = {
                'Authorization': 'Basic ' + this.decode (auth64),
                'Content-Type': 'application/json',
            };
            if (Object.keys (query).length) {
                body = this.json (query);
            }
        } else {
            url += this.version + '/';
            if (api === 'public') {
                url += this.implodeParams (path, params);
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (api === 'private') {
                const now = this.milliseconds ();
                this.checkRequiredCredentials ();
                const expires = this.safeInteger (this.options, 'expires');
                if ((expires === undefined) || (expires < now)) {
                    throw new AuthenticationError (this.id + ' access token expired, call signIn() method');
                }
                const accessToken = this.safeString (this.options, 'accessToken');
                headers = {
                    'Authorization': 'Bearer ' + accessToken,
                };
                url += this.implodeParams (path, params);
                if (method === 'GET') {
                    if (Object.keys (query).length) {
                        url += '?' + this.urlencode (query);
                    }
                } else if (Object.keys (query).length) {
                    body = this.json (query);
                    headers['Content-Type'] = 'application/json';
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async signIn (params = {}) {
        this.checkRequiredCredentials ();
        const request = {
            'grant_type': 'client_credentials', // the only supported value
        };
        const response = await this.accountsPostToken (this.extend (request, params));
        //
        //     {
        //         access_token: '0ttDv/2hTTn3bLi8GP1gKaneiEQ6+0hOBenPrxNQt2s=',
        //         token_type: 'bearer',
        //         expires_in: 900
        //     }
        //
        const expiresIn = this.safeInteger (response, 'expires_in');
        const accessToken = this.safeString (response, 'access_token');
        this.options['accessToken'] = accessToken;
        this.options['expires'] = this.sum (this.milliseconds (), expiresIn * 1000);
        return response;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString (response, 'errorCode');
            const message = this.safeString (response, 'message');
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwBroadlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
