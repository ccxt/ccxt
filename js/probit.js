'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ExchangeNotAvailable, BadResponse, BadRequest, InvalidOrder, InsufficientFunds, AuthenticationError, ArgumentsRequired } = require ('./base/errors');

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
                'createLimitOrder': true,
                'createMarketOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'withdraw': true,
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
            },
            'version': 'v1',
            'urls': {
                'logo': 'https://static.probit.com/landing/assets/images/probit-logo-global.png',
                'api': {
                    'account': 'https://accounts.probit.com',
                    'exchange': 'https://api.probit.com/api/exchange',
                },
                'www': 'https://www.probit.com',
                'doc': [
                    'https://docs-en.probit.com',
                    'https://docs-ko.probit.com',
                ],
                'fees': 'https://support.probit.com/hc/en-us/articles/360020968611-Trading-Fees',
            },
            'api': {
                'public': {
                    'get': [
                        'market',
                        'currency',
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
                'auth': {
                    'post': [
                        'token',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
            'exceptions': {
                'INVALID_ARGUMENT': BadRequest,
                'TRADING_UNAVAILABLE': ExchangeNotAvailable,
                'NOT_ENOUGH_BALANCE': InsufficientFunds,
                'NOT_ALLOWED_COMBINATION': BadRequest,
                'INVALID_ORDER': InvalidOrder,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'defaultLimitOrderTimeInForce': 'gtc',
                'defaultMarketOrderTimeInForce': 'ioc',
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
            const priceIncrement = this.safeString (market, 'price_increment');
            const precision = {
                'amount': this.safeInteger (market, 'quantity_precision'),
                'price': this.precisionFromString (priceIncrement),
                'cost': this.safeInteger (market, 'cost_precision'),
            };
            const takerFeeRate = this.safeFloat (market, 'taker_fee_rate');
            const makerFeeRate = this.safeFloat (market, 'maker_fee_rate');
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
                'taker': takerFeeRate / 100,
                'maker': makerFeeRate / 100,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'min_quantity'),
                        'max': this.safeFloat (market, 'max_quantity'),
                    },
                    'price': {
                        'min': this.safeFloat (market, 'min_price'),
                        'max': this.safeFloat (market, 'max_price'),
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'min_cost'),
                        'max': this.safeFloat (market, 'max_cost'),
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrency (params);
        //     {
        //         data: [
        //             {
        //                 id: 'DOGE',
        //                 name: 'Dogecoin',
        //                 display_name: { 'ko-kr': '도지코인', 'en-us': 'Dogecoin' },
        //                 platform: 'DOGE',
        //                 precision: 8,
        //                 display_precision: 8,
        //                 min_confirmation_count: 20,
        //                 min_withdrawal_amount: '4',
        //                 withdrawal_fee: '2',
        //                 deposit_suspended: true,
        //                 withdrawal_suspended: true,
        //                 internal_precision: 8,
        //                 show_in_ui: true,
        //                 suspended_reason: '',
        //                 min_deposit_amount: '0'
        //             },
        //         ]
        //     }
        //
        const currencies = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const precision = this.safeInteger (currency, 'precision');
            const suspendedReason = this.safeString (currency, 'suspended_reason');
            let active = true;
            if (suspendedReason.length > 0) {
                active = false;
            }
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawal_fee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': this.safeFloat (currency, 'min_deposit_amount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance ();
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = balance['currency_id'];
            const account = this.account ();
            const total = this.safeFloat (balance, 'total');
            const available = this.safeFloat (balance, 'available');
            const hold = this.sum (total, -available);
            account['total'] = total;
            account['free'] = available;
            account['used'] = hold;
            result[currencyId] = account;
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
        return this.parseOrderBook (dataBySide, undefined, 'buy', 'sell', 'price', 'quantity');
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

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
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
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'market_id');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('-');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const close = this.safeFloat (ticker, 'last');
        const change = this.safeFloat (ticker, 'change');
        let percentage = undefined;
        let open = undefined;
        if (change !== undefined) {
            percentage = change / 100;
            if (close !== undefined) {
                open = close - change;
            }
        }
        const baseVolume = this.safeFloat (ticker, 'base_volume');
        const quoteVolume = this.safeFloat (ticker, 'quote_volume');
        let vwap = undefined;
        if ((baseVolume !== undefined) && (quoteVolume !== undefined)) {
            vwap = baseVolume / quoteVolume;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
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
        return this.parseTrades (response['data'], market, since, limit);
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
        //     ...
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        let symbol = undefined;
        const id = this.safeString (trade, 'id');
        if (id !== undefined) {
            const parts = id.split (':');
            const marketId = this.safeString (parts, 0);
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                } else {
                    const [ baseId, quoteId ] = marketId.split ('-');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
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

    normalizeCandleTimestamp (timestamp, timeframe) {
        const coeff = parseInt (timeframe.slice (0, -1), 10);
        const unitLetter = timeframe.slice (-1);
        const m = 60 * 1000;
        const h = 60 * m;
        const D = 24 * h;
        const W = 7 * D;
        const units = {
            'm': m,
            'h': h,
            'D': D,
            'W': W,
        };
        const unit = units[unitLetter];
        const mod = coeff * unit;
        const diff = (timestamp % mod);
        timestamp = timestamp - diff;
        if (unit === W) {
            timestamp = timestamp + 3 * D;
        }
        return timestamp;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const interval = this.timeframes[timeframe];
        limit = (limit === undefined) ? 100 : limit;
        const request = {
            'market_ids': market['id'],
            'interval': interval,
            'sort': 'asc',
            'limit': limit, // max 1000
        };
        const now = this.milliseconds ();
        const duration = this.parseTimeframe (timeframe);
        const difference = limit * duration * 1000;
        if (since === undefined) {
            request['end_time'] = this.iso8601 (now);
            request['start_time'] = this.iso8601 (now - difference);
        } else {
            request['start_time'] = this.iso8601 (since);
            request['end_time'] = this.iso8601 (this.sum (since, difference));
        }
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
        const data = this.safeValue (response, 'data');
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (this.safeString (ohlcv, 'start_time')),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'base_volume'),
        ];
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        since = this.parse8601 (since);
        const request = {};
        if (symbol) {
            request['market_id'] = this.marketId (symbol);
        }
        const resp = await this.privateGetOpenOrder (this.extend (request, params));
        const orders = this.safeValue (resp, 'data');
        let arr = [];
        for (let i = 0; i < orders.length; i++) {
            if (since && this.parse8601 (orders[i]['time']) < since) {
                continue;
            }
            const symbol = this.findSymbol (this.safeString (orders[i], 'market_id'));
            arr.push (this.parseOrder (orders[i], symbol));
        }
        // order by desc
        arr = this.sortBy (arr, 'timestamp', true);
        if (limit) {
            arr = arr.slice (0, limit);
        }
        return arr;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'start_time': this.iso8601 (0),
            'end_time': this.iso8601 (this.milliseconds ()),
            'limit': 100,
        };
        if (symbol) {
            request['market_id'] = this.marketId (symbol);
        }
        if (since) {
            request['start_time'] = this.iso8601 (since);
        }
        if (limit) {
            request['limit'] = limit;
        }
        const resp = await this.privateGetOrderHistory (this.extend (request, params));
        const orders = this.safeValue (resp, 'data');
        const arr = [];
        for (let i = 0; i < orders.length; i++) {
            const symbol = this.findSymbol (this.safeString (orders[i], 'market_id'));
            arr.push (this.parseOrder (orders[i], symbol));
        }
        return arr;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'order_id': id.toString (),
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            request['client_order_id'] = clientOrderId;
        }
        const response = await this.privateGetOrder (this.extend (request, params));
        const order = this.safeValue (response, 'data')[0];
        return this.parseOrder (order, symbol);
    }

    parseOrder (order, symbol) {
        let status = order['status'];
        if (status === 'filled') {
            status = 'closed';
        }
        const time = order['time'];
        const filledCost = this.safeFloat (order, 'filled_cost');
        const filledQty = this.safeFloat (order, 'filled_quantity');
        const openQty = this.safeFloat (order, 'open_quantity');
        let qty = this.safeFloat (order, 'quantity');
        let price = this.safeFloat (order, 'limit_price');
        if (order['type'] === 'market') {
            qty = this.sum (filledQty, openQty);
            if (filledCost > 0 && filledQty > 0) {
                price = filledCost / filledQty;
            }
        }
        return {
            'id': order['id'],
            'symbol': symbol,
            'type': order['type'],
            'side': order['side'],
            'datetime': time,
            'timestamp': this.parse8601 (time),
            'lastTradeTimestamp': undefined,
            'status': status,
            'price': price,
            'amount': qty,
            'filled': filledQty,
            'remaining': openQty,
            'cost': filledCost,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const req = {
            'market_id': market['id'],
            'type': type,
            'side': side,
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId) {
            req['client_order_id'] = clientOrderId;
        }
        let timeInForce = this.safeString (params, 'timeInForce');
        if (type === 'limit') {
            if (!timeInForce) {
                timeInForce = this.options['defaultLimitOrderTimeInForce'];
            }
            req['time_in_force'] = timeInForce;
            req['limit_price'] = this.priceToPrecision (symbol, price);
            req['quantity'] = this.amountToPrecision (symbol, amount);
        } else if (type === 'market') {
            if (!timeInForce) {
                timeInForce = this.options['defaultMarketOrderTimeInForce'];
            }
            req['time_in_force'] = timeInForce;
            if (side === 'sell') {
                req['quantity'] = this.amountToPrecision (symbol, amount);
            } else if (side === 'buy') {
                req['cost'] = this.costToPrecision (symbol, amount);
            }
        }
        const resp = await this.privatePostNewOrder (this.extend (req, params));
        return this.parseOrder (this.safeValue (resp, 'data'), symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
            'order_id': id.toString (),
        };
        const resp = await this.privatePostCancelOrder (this.extend (request, params));
        return this.parseOrder (this.safeValue (resp, 'data'));
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

    async createDepositAddress (code, params = {}) {
        return this.fetchDepositAddress (code, params);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency_id': currency['id'],
        };
        const response = await this.privateGetDepositAddress (this.extend (request, params));
        return this.parseDepositAddress (response['data'][0]);
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
        return this.parseDepositAddresses (response['data']);
    }

    async parseDepositAddresses (rawAddresses) {
        const addresses = [];
        for (let i = 0; i < rawAddresses.length; i++) {
            addresses.push (this.parseDepositAddress (rawAddresses[i]));
        }
        return addresses;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (!tag) {
            tag = undefined;
        }
        const request = {
            'currency_id': currency['id'],
            'address': address,
            'destination_tag': tag,
            'amount': this.numberToString (amount),
        };
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        return this.parseTransaction (response['data']);
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'destination_tag');
        const txid = this.safeString (transaction, 'hash');
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const type = this.safeString (transaction, 'type');
        const currencyId = this.safeString (transaction, 'currency_id');
        const code = this.safeCurrencyCode (currencyId);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const feeCost = this.safeFloat (transaction, 'fee');
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
            'address': address,
            'tag': tag,
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
        let url = this.urls['api']['exchange'] + '/' + this.version + '/';
        if (api === 'auth') {
            url = this.urls['api']['account'] + '/';
        }
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const expires = this.safeInteger (this.options, 'expires');
            if (!expires || expires < this.milliseconds ()) {
                throw new AuthenticationError (this.id + ' accessToken expired, call signIn() method');
            }
            url += this.implodeParams (path, params);
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            headers = {
                'Authorization': 'Bearer ' + this.options['accessToken'],
                'Content-Type': 'application/json',
            };
        } else if (api === 'auth') {
            this.checkRequiredCredentials ();
            url += this.implodeParams (path, params);
            const encoded = this.encode (this.apiKey + ':' + this.secret);
            const basicAuth = this.stringToBase64 (encoded);
            headers = {
                'Authorization': 'Basic ' + this.decode (basicAuth),
                'Content-Type': 'application/json',
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async signIn (params = {}) {
        this.checkRequiredCredentials ();
        if (!this.apiKey || !this.secret) {
            throw new AuthenticationError (this.id + ' signIn() requires this.apiKey and this.secret credentials');
        }
        const body = {
            'grant_type': 'client_credentials',
        };
        const tokenResponse = await this.authPostToken (body);
        const expiresIn = this.safeInteger (tokenResponse, 'expires_in');
        const accessToken = this.safeString (tokenResponse, 'access_token');
        this.options['accessToken'] = accessToken;
        this.options['expires'] = this.sum (this.milliseconds (), expiresIn * 1000);
        this.options['tokenType'] = this.safeString (tokenResponse, 'token_type');
        return tokenResponse;
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('errorCode' in response) {
            const errorCode = this.safeString (response, 'errorCode');
            const message = this.safeString (response, 'message');
            if (errorCode !== undefined) {
                const feedback = this.json (response);
                const exceptions = this.exceptions;
                if (message in exceptions) {
                    throw new exceptions[message] (feedback);
                } else if (errorCode in exceptions) {
                    throw new exceptions[errorCode] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
