'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder, InsufficientFunds, AuthenticationError, RateLimitExceeded, BadSymbol } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class qtrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'qtrade',
            'name': 'qTrade',
            'countries': [ 'US' ],
            'rateLimit': 1000,
            'version': 'v1',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/80491487-74a99c00-896b-11ea-821e-d307e832f13e.jpg',
                'api': 'https://api.qtrade.io',
                'www': 'https://qtrade.io',
                'doc': 'https://qtrade-exchange.github.io/qtrade-docs',
                'referral': 'https://qtrade.io/?ref=BKOQWVFGRH2C',
            },
            'has': {
                'cancelOrder': true,
                'CORS': undefined,
                'createMarketOrder': undefined,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposit': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': undefined,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '5m': 'fivemin',
                '15m': 'fifteenmin',
                '30m': 'thirtymin',
                '1h': 'onehour',
                '2h': 'twohour',
                '4h': 'fourhour',
                '1d': 'oneday',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker/{market_string}',
                        'tickers',
                        'currency/{code}',
                        'currencies',
                        'common',
                        'market/{market_string}',
                        'markets',
                        'market/{market_string}/trades',
                        'orderbook/{market_string}',
                        'market/{market_string}/ohlcv/{interval}',
                    ],
                },
                'private': {
                    'get': [
                        'me',
                        'balances',
                        'balances_all', // undocumented
                        'market/{market_string}',
                        'orders',
                        'order/{order_id}',
                        'trades',
                        'withdraw/{withdraw_id}',
                        'withdraws',
                        'deposit/{deposit_id}',
                        'deposits',
                        'transfers',
                    ],
                    'post': [
                        'cancel_order',
                        'withdraw',
                        'deposit_address/{currency}',
                        'sell_limit',
                        'buy_limit',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'quote',
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.005,
                    'maker': 0.0,
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'BTM': 'Bitmark',
            },
            'exceptions': {
                'exact': {
                    'invalid_auth': AuthenticationError,
                    'insuff_funds': InsufficientFunds,
                    'market_not_found': BadSymbol, // {"errors":[{"code":"market_not_found","title":"Requested market does not exist"}]}
                    'too_small': InvalidOrder,
                    'limit_exceeded': RateLimitExceeded, // {"errors":[{"code":"limit_exceeded","title":"You have exceeded the windowed rate limit. Please see docs."}]}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         "data":{
        //             "markets":[
        //                 {
        //                     "id":5,
        //                     "market_currency":"BAC",
        //                     "base_currency":"BTC",
        //                     "maker_fee":"0.0025",
        //                     "taker_fee":"0.0025",
        //                     "metadata":{
        //                         "delisting_date":"7/15/2018",
        //                         "market_notices":[
        //                             {
        //                                 "message":"Delisting Notice: This market has been delisted due to low volume. Please cancel your orders and withdraw your funds by 7/15/2018.",
        //                                 "type":"warning"
        //                             }
        //                         ]
        //                     },
        //                     "can_trade":false,
        //                     "can_cancel":true,
        //                     "can_view":false,
        //                     "market_string":"BAC_BTC",
        //                     "minimum_sell_amount":"0.0001",
        //                     "minimum_buy_value":"0.0001",
        //                     "market_precision":8,
        //                     "base_precision":8
        //                 },
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const markets = this.safeValue (data, 'markets', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString (market, 'market_string');
            const numericId = this.safeInteger (market, 'id');
            const baseId = this.safeString (market, 'market_currency');
            const quoteId = this.safeString (market, 'base_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'market_precision'),
                'price': this.safeInteger (market, 'base_precision'),
            };
            const canView = this.safeValue (market, 'can_view', false);
            const canTrade = this.safeValue (market, 'can_trade', false);
            const active = canTrade && canView;
            result.push ({
                'symbol': symbol,
                'id': marketId,
                'numericId': numericId,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'type': 'spot',
                'spot': true,
                'active': active,
                'precision': precision,
                'taker': this.safeNumber (market, 'taker_fee'),
                'maker': this.safeNumber (market, 'maker_fee'),
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'minimum_sell_value'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimum_buy_value'),
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
        //         "data":{
        //             "currencies":[
        //                 {
        //                     "code":"DGB",
        //                     "long_name":"Digibyte",
        //                     "type":"bitcoin_like",
        //                     "precision":8,
        //                     "config":{
        //                         "price":0.0035,
        //                         "withdraw_fee":"10",
        //                         "deposit_types":[
        //                             {
        //                                 "label":"Address",
        //                                 "lookup_mode":"address",
        //                                 "render_type":"address",
        //                                 "deposit_type":"address",
        //                                 "lookup_config":{}
        //                             }
        //                         ],
        //                         "default_signer":103,
        //                         "address_version":30,
        //                         "satoshi_per_byte":300,
        //                         "required_confirmations":200,
        //                         "required_generate_confirmations":300
        //                     },
        //                     "metadata":{},
        //                     "minimum_order":"0.0001",
        //                     "status":"ok",
        //                     "can_withdraw":true,
        //                     "delisted":false,
        //                     "deposit_disabled":false,
        //                     "withdraw_disabled":false,
        //                     "deposit_warn_codes":[],
        //                     "withdraw_warn_codes":[]
        //                 },
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const currencies = this.safeValue (data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'long_name');
            const type = this.safeString (currency, 'type');
            const canWithdraw = this.safeValue (currency, 'can_withdraw', true);
            const depositDisabled = this.safeValue (currency, 'deposit_disabled', false);
            const config = this.safeValue (currency, 'config', {});
            const status = this.safeString (currency, 'status');
            const active = canWithdraw && (status === 'ok') && !depositDisabled;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': type,
                'name': name,
                'fee': this.safeNumber (config, 'withdraw_fee'),
                'precision': this.safeInteger (currency, 'precision'),
                'active': active,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (currency, 'minimum_order'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":"2019-12-07T22:55:00Z",
        //         "open":"0.00197",
        //         "high":"0.00197",
        //         "low":"0.00197",
        //         "close":"0.00197",
        //         "volume":"0.00016676",
        //         "market_volume":"0.08465047"
        //     }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'time')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'market_volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_string': market['id'],
            'interval': this.timeframes[timeframe],
        };
        const response = await this.publicGetMarketMarketStringOhlcvInterval (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "slices":[
        //                 {"time":"2019-12-07T22:55:00Z","open":"0.00197","high":"0.00197","low":"0.00197","close":"0.00197","volume":"0.00016676","market_volume":"0.08465047"},
        //                 {"time":"2019-12-07T23:00:00Z","open":"0.00197","high":"0.00197","low":"0.00197","close":"0.00197","volume":"0","market_volume":"0"},
        //                 {"time":"2019-12-07T23:05:00Z","open":"0.00197","high":"0.00197","low":"0.00197","close":"0.00197","volume":"0","market_volume":"0"},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const ohlcvs = this.safeValue (data, 'slices', []);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = { 'market_string': marketId };
        const response = await this.publicGetOrderbookMarketString (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "buy":{
        //                 "0.00700015":"4.76196367",
        //                 "0.00700017":"1.89755391",
        //                 "0.00700018":"2.13214088",
        //             },
        //             "last_change":1588539869958811,
        //             "sell":{
        //                 "0.02418662":"0.19513696",
        //                 "0.02465627":"0.2439212",
        //                 "0.02530277":"0.663475931274359255",
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orderbook = {};
        const sides = { 'buy': 'bids', 'sell': 'asks' };
        const keys = Object.keys (sides);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const side = sides[key];
            const bidasks = this.safeValue (data, key, {});
            const prices = Object.keys (bidasks);
            const result = [];
            for (let j = 0; j < prices.length; j++) {
                const priceAsString = prices[j];
                const price = this.safeNumber (prices, j);
                const amount = this.safeNumber (bidasks, priceAsString);
                result.push ([ price, amount ]);
            }
            orderbook[side] = result;
        }
        const timestamp = this.safeIntegerProduct (data, 'last_change', 0.001);
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "ask":"0.02423119",
        //         "bid":"0.0230939",
        //         "day_avg_price":"0.0247031874349301",
        //         "day_change":"-0.0237543162270376",
        //         "day_high":"0.02470552",
        //         "day_low":"0.02470172",
        //         "day_open":"0.02530277",
        //         "day_volume_base":"0.00268074",
        //         "day_volume_market":"0.10851798",
        //         "id":41,
        //         "id_hr":"ETH_BTC",
        //         "last":"0.02470172",
        //         "last_change":1588533365354609
        //     }
        //
        const marketId = this.safeString (ticker, 'id_hr');
        const symbol = this.safeSymbol (marketId, market, '_');
        const timestamp = this.safeIntegerProduct (ticker, 'last_change', 0.001);
        const previous = this.safeNumber (ticker, 'day_open');
        const last = this.safeNumber (ticker, 'last');
        const day_change = this.safeNumber (ticker, 'day_change');
        let percentage = undefined;
        let change = undefined;
        const average = this.safeNumber (ticker, 'day_avg_price');
        if (day_change !== undefined) {
            percentage = day_change * 100;
            if (previous !== undefined) {
                change = day_change * previous;
            }
        }
        const baseVolume = this.safeNumber (ticker, 'day_volume_market');
        const quoteVolume = this.safeNumber (ticker, 'day_volume_base');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'day_high'),
            'low': this.safeNumber (ticker, 'day_low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': previous,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        //
        //     {
        //         "data":{
        //             "markets":[
        //                 {
        //                     "ask":"0.0000003",
        //                     "bid":"0.00000029",
        //                     "day_avg_price":"0.0000002999979728",
        //                     "day_change":"0.0344827586206897",
        //                     "day_high":"0.0000003",
        //                     "day_low":"0.0000003",
        //                     "day_open":"0.00000029",
        //                     "day_volume_base":"0.00591958",
        //                     "day_volume_market":"19732.06666665",
        //                     "id":36,
        //                     "id_hr":"DOGE_BTC",
        //                     "last":"0.0000003",
        //                     "last_change":1588534202130778
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'markets', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_string': market['id'],
        };
        const response = await this.publicGetTickerMarketString (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "ask":"0.02423119",
        //             "bid":"0.0230939",
        //             "day_avg_price":"0.0247031874349301",
        //             "day_change":"-0.0237543162270376",
        //             "day_high":"0.02470552",
        //             "day_low":"0.02470172",
        //             "day_open":"0.02530277",
        //             "day_volume_base":"0.00268074",
        //             "day_volume_market":"0.10851798",
        //             "id":41,
        //             "id_hr":"ETH_BTC",
        //             "last":"0.02470172",
        //             "last_change":1588533365354609
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_string': market['id'],
            // 'older_than': 123, // returns trades with id < older_than
            // 'newer_than': 123, // returns trades with id > newer_than
        };
        const response = await this.publicGetMarketMarketStringTrades (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "trades":[
        //                 {
        //                     "id":85507,
        //                     "amount":"0.09390502",
        //                     "price":"0.02556325",
        //                     "base_volume":"0.00240051",
        //                     "seller_taker":true,
        //                     "side":"sell",
        //                     "created_at":"0001-01-01T00:00:00Z",
        //                     "created_at_ts":1581560391338718
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'desc': true, // Returns newest trades first when true
            // 'older_than': 123, // returns trades with id < older_than
            // 'newer_than': 123, // returns trades with id > newer_than
        };
        let market = undefined;
        const numericId = this.safeValue (params, 'market_id');
        if (numericId !== undefined) {
            request['market_id'] = numericId; // mutually exclusive with market_string
        } else if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_string'] = market['id'];
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "trades":[
        //                 {
        //                     "id":107331,
        //                     "market_amount":"0.1082536946986",
        //                     "price":"0.0230939",
        //                     "base_amount":"0.00249999",
        //                     "order_id":13790596,
        //                     "market_id":41,
        //                     "market_string":"ETH_BTC",
        //                     "taker":true,
        //                     "base_fee":"0.00001249",
        //                     "side":"sell",
        //                     "created_at":"2020-05-04T06:08:18.513413Z"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":85507,
        //         "amount":"0.09390502",
        //         "price":"0.02556325",
        //         "base_volume":"0.00240051",
        //         "seller_taker":true,
        //         "side":"sell",
        //         "created_at":"0001-01-01T00:00:00Z",
        //         "created_at_ts":1581560391338718
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id":107331,
        //         "market_amount":"0.1082536946986",
        //         "price":"0.0230939",
        //         "base_amount":"0.00249999",
        //         "order_id":13790596,
        //         "market_id":41,
        //         "market_string":"ETH_BTC",
        //         "taker":true,
        //         "base_fee":"0.00001249",
        //         "side":"sell",
        //         "created_at":"2020-05-04T06:08:18.513413Z"
        //     }
        //
        // createOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "base_amount": "9.58970687",
        //         "base_fee": "0.02397426",
        //         "created_at": "0001-01-01T00:00:00Z",
        //         "id": 0,
        //         "market_amount": "0.97179355",
        //         "price": "9.86804952",
        //         "taker": true
        //     }
        //
        const id = this.safeString (trade, 'id');
        let timestamp = this.safeIntegerProduct (trade, 'created_at_ts', 0.001);
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        }
        const side = this.safeString (trade, 'side');
        const marketId = this.safeString (trade, 'market_string');
        market = this.safeMarket (marketId, market);
        const cost = this.safeString2 (trade, 'base_volume', 'base_amount');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'market_amount', 'amount');
        let fee = undefined;
        const feeCost = this.safeString (trade, 'base_fee');
        if (feeCost !== undefined) {
            const feeCurrencyCode = (market === undefined) ? undefined : market['quote'];
            fee = {
                'currency': feeCurrencyCode,
                'cost': feeCost,
            };
        }
        const taker = this.safeValue (trade, 'taker', true);
        const takerOrMaker = taker ? 'taker' : 'maker';
        const orderId = this.safeString (trade, 'order_id');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalancesAll (params);
        //
        //     {
        //         "data":{
        //             "balances": [
        //                 { "balance": "100000000", "currency": "BCH" },
        //                 { "balance": "99992435.78253015", "currency": "LTC" },
        //                 { "balance": "99927153.76074182", "currency": "BTC" },
        //             ],
        //             "order_balances":[],
        //             "limit_used":0,
        //             "limit_remaining":4000,
        //             "limit":4000
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        let balances = this.safeValue (data, 'balances', []);
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in result) ? result[code] : this.account ();
            account['free'] = this.safeString (balance, 'balance');
            account['used'] = '0';
            result[code] = account;
        }
        balances = this.safeValue (data, 'order_balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = (code in result) ? result[code] : this.account ();
            account['used'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new InvalidOrder (this.id + ' createOrder() allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'amount': this.amountToPrecision (symbol, amount),
            'market_id': market['numericId'],
            'price': this.priceToPrecision (symbol, price),
        };
        const method = (side === 'sell') ? 'privatePostSellLimit' : 'privatePostBuyLimit';
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "order": {
        //                 "created_at": "2018-04-06T20:46:52.899248Z",
        //                 "id": 13253,
        //                 "market_amount": "1",
        //                 "market_amount_remaining": "0",
        //                 "market_id": 1,
        //                 "open": false,
        //                 "order_type": "sell_limit",
        //                 "price": "0.01",
        //                 "trades": [
        //                     {
        //                         "base_amount": "0.27834267",
        //                         "base_fee": "0.00069585",
        //                         "created_at": "0001-01-01T00:00:00Z",
        //                         "id": 0,
        //                         "market_amount": "0.02820645",
        //                         "price": "9.86805058",
        //                         "taker": true
        //                     },
        //                     {
        //                         "base_amount": "9.58970687",
        //                         "base_fee": "0.02397426",
        //                         "created_at": "0001-01-01T00:00:00Z",
        //                         "id": 0,
        //                         "market_amount": "0.97179355",
        //                         "price": "9.86804952",
        //                         "taker": true
        //                     }
        //                 ]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const order = this.safeValue (data, 'order', {});
        return this.parseOrder (order, market);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "created_at": "2018-04-06T20:46:52.899248Z",
        //         "id": 13253,
        //         "market_amount": "1",
        //         "market_amount_remaining": "0",
        //         "market_id": 1,
        //         "open": false,
        //         "order_type": "sell_limit",
        //         "price": "0.01",
        //         "trades": [
        //             {
        //                 "base_amount": "0.27834267",
        //                 "base_fee": "0.00069585",
        //                 "created_at": "0001-01-01T00:00:00Z",
        //                 "id": 0,
        //                 "market_amount": "0.02820645",
        //                 "price": "9.86805058",
        //                 "taker": true
        //             },
        //             {
        //                 "base_amount": "9.58970687",
        //                 "base_fee": "0.02397426",
        //                 "created_at": "0001-01-01T00:00:00Z",
        //                 "id": 0,
        //                 "market_amount": "0.97179355",
        //                 "price": "9.86804952",
        //                 "taker": true
        //             }
        //         ]
        //     }
        //
        // fetchOrder
        //
        //     {
        //         id: 13790596,
        //         market_amount: "0.15",
        //         market_amount_remaining: "0",
        //         created_at: "2020-05-04T06:08:18.513413Z",
        //         price: "0.0230939",
        //         base_amount: "0",
        //         order_type: "sell_limit",
        //         market_id: 41,
        //         market_string: "ETH_BTC",
        //         open: false,
        //         trades: [
        //             {
        //                 id: 107331,
        //                 market_amount: "0.1082536946986",
        //                 price: "0.0230939",
        //                 base_amount: "0.00249999",
        //                 taker: true,
        //                 base_fee: "0.00001249",
        //                 created_at: "2020-05-04T06:08:18.513413Z",
        //             }
        //         ],
        //         close_reason: "canceled"
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const sideType = this.safeString (order, 'order_type');
        let orderType = undefined;
        let side = undefined;
        if (sideType !== undefined) {
            const parts = sideType.split ('_');
            side = this.safeString (parts, 0);
            orderType = this.safeString (parts, 1);
        }
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'market_amount');
        const remaining = this.safeNumber (order, 'market_amount_remaining');
        const open = this.safeValue (order, 'open', false);
        const closeReason = this.safeString (order, 'close_reason');
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (closeReason === 'canceled') {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        const marketId = this.safeString (order, 'market_string');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const rawTrades = this.safeValue (order, 'trades', []);
        const parsedTrades = this.parseTrades (rawTrades, market, undefined, undefined, {
            'order': id,
            'side': side,
            'type': orderType,
        });
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'average': undefined,
            'amount': amount,
            'remaining': remaining,
            'filled': undefined,
            'status': status,
            'fee': undefined,
            'fees': undefined,
            'cost': undefined,
            'trades': parsedTrades,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': parseInt (id),
        };
        // successful cancellation returns 200 with no payload
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = { 'order_id': id };
        const response = await this.privateGetOrderOrderId (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "order":{
        //                 "id":13790596,
        //                 "market_amount":"0.15",
        //                 "market_amount_remaining":"0.0417463053014",
        //                 "created_at":"2020-05-04T06:08:18.513413Z",
        //                 "price":"0.0230939",
        //                 "order_type":"sell_limit",
        //                 "market_id":41,
        //                 "market_string":"ETH_BTC",
        //                 "open":true,
        //                 "trades":[
        //                     {
        //                         "id":107331,
        //                         "market_amount":"0.1082536946986",
        //                         "price":"0.0230939",
        //                         "base_amount":"0.00249999",
        //                         "taker":true,
        //                         "base_fee":"0.00001249",
        //                         "created_at":"2020-05-04T06:08:18.513413Z"
        //                     }
        //                 ]
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const order = this.safeValue (data, 'order', {});
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'open': true,
            // 'older_than': 123, // returns orders with id < older_than
            // 'newer_than': 123, // returns orders with id > newer_than
        };
        let market = undefined;
        const numericId = this.safeValue (params, 'market_id');
        if (numericId !== undefined) {
            request['market_id'] = numericId; // mutually exclusive with market_string
        } else if (symbol !== undefined) {
            market = this.market (symbol);
            request['market_string'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "orders":[
        //                 {
        //                     "id":13790596,
        //                     "market_amount":"0.15",
        //                     "market_amount_remaining":"0.0417463053014",
        //                     "created_at":"2020-05-04T06:08:18.513413Z",
        //                     "price":"0.0230939",
        //                     "order_type":"sell_limit",
        //                     "market_id":41,
        //                     "market_string":"ETH_BTC",
        //                     "open":true,
        //                     "trades":[
        //                         {
        //                             "id":107331,
        //                             "market_amount":"0.1082536946986",
        //                             "price":"0.0230939",
        //                             "base_amount":"0.00249999",
        //                             "taker":true,
        //                             "base_fee":"0.00001249",
        //                             "created_at":"2020-05-04T06:08:18.513413Z"
        //                         }
        //                     ]
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const orders = this.safeValue (data, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'open': true };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'open': false };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //         "currency_status":"ok",
        //         "deposit_methods":{
        //             "address":{
        //                 "deposit_type":"address",
        //                 "render_type":"address",
        //                 "label":"Address",
        //                 "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //             },
        //         },
        //     }
        //
        const code = (currency === undefined) ? undefined : currency['code'];
        let address = this.safeString (depositAddress, 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split (':');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostDepositAddressCurrency (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //             "currency_status":"ok",
        //             "deposit_methods":{
        //                 "address":{
        //                     "deposit_type":"address",
        //                     "render_type":"address",
        //                     "label":"Address",
        //                     "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                 },
        //             },
        //         },
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseDepositAddress (data, currency);
    }

    async fetchDeposit (id, code = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'deposit_id': id,
        };
        const response = await this.privateGetDepositDepositId (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "deposit":{
        //                 "id":"0xaa6e65ed274c4786e5dec3671de96f81021cacdbc453b1a133ab84356f3620a0",
        //                 "amount":"0.13",
        //                 "currency":"ETH",
        //                 "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                 "status":"credited",
        //                 "relay_status":"",
        //                 "network_data":{
        //                     "confirms":87,
        //                     "sweep_txid":"0xa16e65ed274d4686e5dec3671de96f81021cacdbc453b1a133ab85356f3630a0",
        //                     "sweep_balance":"0.150000000000000000",
        //                     "confirms_required":80,
        //                     "unsigned_sweep_tx":{
        //                         "chainId":1,
        //                         "from":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                         "gas":"0x5208",
        //                         "gasPrice":"0x19b45a500",
        //                         "nonce":"0x0",
        //                         "to":"0x76Cd80202a2C31e9D8F595a31ed071CE7F75BB93",
        //                         "value":"0x214646b6347d800"
        //                     },
        //                     "txid":"0xaa6e65ed274c4786e5dec3671de96f81021cacdbc453b1a133ab84356f3620a0",
        //                     "tx_index":"0x6f",
        //                     "tx_value":"0.130000000000000000",
        //                     "key_index":311,
        //                     "blockheight":9877869,
        //                     "signed_sweep_tx":{
        //                         "hash":"0xa16e65ed274d4686e5dec3671de96f81021cacdbc453b1a133ab85356f3630a0",
        //                         "rawTransaction":"0xd86c8085019b45a1008252099476cb80202b2c31e9d7f595a31fd071ce7f75bb93880214646b6347d8008046a08c6e3bfe8b25bff2b6851c87ea17c63d7b23591210ab0779a568eaa43dc40435a030e964bb2b667072ea7cbc8ab554403e3f3ead9b554743f2fdc2b1e06e998df9"
        //                     },
        //                     "estimated_sweep_tx_fee":144900000000000
        //                 },
        //                 "created_at":"2020-05-04T05:38:42.145162Z"
        //             }
        //         }
        //     }
        const data = this.safeValue (response, 'data', {});
        const deposit = this.safeValue (data, 'deposit', {});
        return this.parseTransaction (deposit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetDeposits (params);
        //
        //     {
        //         "data":{
        //             "deposits":[
        //                 {
        //                     "id":"0xaa6e65ed274c4786e5dec3671de96f81021cacdbc453b1a133ab84356f3620a0",
        //                     "amount":"0.13",
        //                     "currency":"ETH",
        //                     "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                     "status":"credited",
        //                     "relay_status":"",
        //                     "network_data":{
        //                         "confirms":87,
        //                         "sweep_txid":"0xa16e65ed274d4686e5dec3671de96f81021cacdbc453b1a133ab85356f3630a0",
        //                         "sweep_balance":"0.150000000000000000",
        //                         "confirms_required":80,
        //                         "unsigned_sweep_tx":{
        //                             "chainId":1,
        //                             "from":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                             "gas":"0x5208",
        //                             "gasPrice":"0x19b45a500",
        //                             "nonce":"0x0",
        //                             "to":"0x76Cd80202a2C31e9D8F595a31ed071CE7F75BB93",
        //                             "value":"0x214646b6347d800"
        //                         },
        //                         "txid":"0xaa6e65ed274c4786e5dec3671de96f81021cacdbc453b1a133ab84356f3620a0",
        //                         "tx_index":"0x6f",
        //                         "tx_value":"0.130000000000000000",
        //                         "key_index":311,
        //                         "blockheight":9877869,
        //                         "signed_sweep_tx":{
        //                             "hash":"0xa16e65ed274d4686e5dec3671de96f81021cacdbc453b1a133ab85356f3630a0",
        //                             "rawTransaction":"0xd86c8085019b45a1008252099476cb80202b2c31e9d7f595a31fd071ce7f75bb93880214646b6347d8008046a08c6e3bfe8b25bff2b6851c87ea17c63d7b23591210ab0779a568eaa43dc40435a030e964bb2b667072ea7cbc8ab554403e3f3ead9b554743f2fdc2b1e06e998df9"
        //                         },
        //                         "estimated_sweep_tx_fee":144900000000000
        //                     },
        //                     "created_at":"2020-05-04T05:38:42.145162Z"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const deposits = this.safeValue (data, 'deposits', []);
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawal (id, code = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'withdraw_id': id,
        };
        const response = await this.privateGetWithdrawWithdrawId (this.extend (request, params));
        //
        //     {
        //         data: {
        //             withdraw: {
        //                 "id":25524,
        //                 "amount":"0.0417463053014",
        //                 "user_id":0,
        //                 "currency":"ETH",
        //                 "network_data":{
        //                     "unsigned_tx":{
        //                         "chainId":1,
        //                         "from":"0x76Cd80202a2C31e9D8F595a31ed071CE7F75BB93",
        //                         "gas":"0x5208",
        //                         "gasPrice":"0x20c8558e9",
        //                         "nonce":"0xf3",
        //                         "to":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                         "value":"0x71712bcd113308"
        //                     },
        //                     "estimated_tx_fee":184800004893000,
        //                     "confirms_required":80,
        //                     "txid":"0x79439b62473d61d99ce1dc6c3b8a417da36d45323a394bb0d4af870608fef38d",
        //                     "confirms":83,
        //                     "signed_tx":{
        //                         "hash":"0x79439b62473d61d99ce1dc6c3b8a417da36d45323a394bb0d4af870608fef38d",
        //                         "rawTransaction":"0xf86c81f385021c8558e98252089401b0a9b7b4cde774af0f3e87cb4f1c2ccdba08068771712acd1133078025a0088157d119d924d47413c81b91b9f18ff148623a2ef13dab1895ca3ba546b771a046a021b1e1f64d1a60bb66c19231f641b352326188a9ed3b931b698a939f78d0"
        //                     }
        //                 },
        //                 "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                 "status":"confirmed",
        //                 "relay_status":"",
        //                 "created_at":"2020-05-05T06:32:19.907061Z",
        //                 "cancel_requested":false
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const withdrawal = this.safeValue (data, 'withdraw', {});
        return this.parseTransaction (withdrawal);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetWithdraws (params);
        //     {
        //         "data":{
        //             "withdraws":[
        //                 {
        //                     "id":25524,
        //                     "amount":"0.0417463053014",
        //                     "user_id":0,
        //                     "currency":"ETH",
        //                     "network_data":{
        //                         "unsigned_tx":{
        //                             "chainId":1,
        //                             "from":"0x76Cd80202a2C31e9D8F595a31ed071CE7F75BB93",
        //                             "gas":"0x5208",
        //                             "gasPrice":"0x20c8558e9",
        //                             "nonce":"0xf3",
        //                             "to":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                             "value":"0x71712bcd113308"
        //                         },
        //                         "estimated_tx_fee":184800004893000,
        //                         "confirms_required":80,
        //                         "txid":"0x79439b62473d61d99ce1dc6c3b8a417da36d45323a394bb0d4af870608fef38d",
        //                         "confirms":83,
        //                         "signed_tx":{
        //                             "hash":"0x79439b62473d61d99ce1dc6c3b8a417da36d45323a394bb0d4af870608fef38d",
        //                             "rawTransaction":"0xf86c81f385021c8558e98252089401b0a9b7b4cde774af0f3e87cb4f1c2ccdba08068771712acd1133078025a0088157d119d924d47413c81b91b9f18ff148623a2ef13dab1895ca3ba546b771a046a021b1e1f64d1a60bb66c19231f641b352326188a9ed3b931b698a939f78d0"
        //                         }
        //                     },
        //                     "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                     "status":"confirmed",
        //                     "relay_status":"",
        //                     "created_at":"2020-05-05T06:32:19.907061Z",
        //                     "cancel_requested":false
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const withdrawals = this.safeValue (data, 'withdraws', []);
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits, fetchDeposit
        //
        //     {
        //         "id":"0xaa6e65ed274c4786e5dec3671de96f81021cacdbc453b1a133ab84356f3620a0",
        //         "amount":"0.13",
        //         "currency":"ETH",
        //         "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //         "status":"credited",
        //         "relay_status":"",
        //         "network_data":{
        //             "confirms":87,
        //             "sweep_txid":"0xa16e65ed274d4686e5dec3671de96f81021cacdbc453b1a133ab85356f3630a0",
        //             "sweep_balance":"0.150000000000000000",
        //             "confirms_required":80,
        //             "unsigned_sweep_tx":{
        //                 "chainId":1,
        //                 "from":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                 "gas":"0x5208",
        //                 "gasPrice":"0x19b45a500",
        //                 "nonce":"0x0",
        //                 "to":"0x76Cd80202a2C31e9D8F595a31ed071CE7F75BB93",
        //                 "value":"0x214646b6347d800"
        //             },
        //             "txid":"0xaa6e65ed274c4786e5dec3671de96f81021cacdbc453b1a133ab84356f3620a0",
        //             "tx_index":"0x6f",
        //             "tx_value":"0.130000000000000000",
        //             "key_index":311,
        //             "blockheight":9877869,
        //             "signed_sweep_tx":{
        //                 "hash":"0xa16e65ed274d4686e5dec3671de96f81021cacdbc453b1a133ab85356f3630a0",
        //                 "rawTransaction":"0xd86c8085019b45a1008252099476cb80202b2c31e9d7f595a31fd071ce7f75bb93880214646b6347d8008046a08c6e3bfe8b25bff2b6851c87ea17c63d7b23591210ab0779a568eaa43dc40435a030e964bb2b667072ea7cbc8ab554403e3f3ead9b554743f2fdc2b1e06e998df9"
        //             },
        //             "estimated_sweep_tx_fee":144900000000000
        //         },
        //         "created_at":"2020-05-04T05:38:42.145162Z"
        //     }
        //
        // fetchWithdrawals, fetchWithdrawal
        //
        //     {
        //         "id":25524,
        //         "amount":"0.0417463053014",
        //         "user_id":0,
        //         "currency":"ETH",
        //         "network_data":{
        //             "unsigned_tx":{
        //                 "chainId":1,
        //                 "from":"0x76Cd80202a2C31e9D8F595a31ed071CE7F75BB93",
        //                 "gas":"0x5208",
        //                 "gasPrice":"0x20c8558e9",
        //                 "nonce":"0xf3",
        //                 "to":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //                 "value":"0x71712bcd113308"
        //             },
        //             "estimated_tx_fee":184800004893000,
        //             "confirms_required":80,
        //             "txid":"0x79439b62473d61d99ce1dc6c3b8a417da36d45323a394bb0d4af870608fef38d",
        //             "confirms":83,
        //             "signed_tx":{
        //                 "hash":"0x79439b62473d61d99ce1dc6c3b8a417da36d45323a394bb0d4af870608fef38d",
        //                 "rawTransaction":"0xf86c81f385021c8558e98252089401b0a9b7b4cde774af0f3e87cb4f1c2ccdba08068771712acd1133078025a0088157d119d924d47413c81b91b9f18ff148623a2ef13dab1895ca3ba546b771a046a021b1e1f64d1a60bb66c19231f641b352326188a9ed3b931b698a939f78d0"
        //             }
        //         },
        //         "address":"0xe0cd26f9A60118555247aE6769A5d241D91f07f2",
        //         "status":"confirmed",
        //         "relay_status":"",
        //         "created_at":"2020-05-05T06:32:19.907061Z",
        //         "cancel_requested":false
        //     }
        //
        // withdraw
        //
        //     {
        //         "code": "initiated",
        //         "id": 3,
        //         "result": "Withdraw initiated. Please allow 3-5 minutes for our system to process."
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        const id = this.safeString (transaction, 'id');
        const networkData = this.safeValue (transaction, 'network_data', {});
        const unsignedTx = this.safeValue (networkData, 'unsigned_tx', {});
        const addressFrom = this.safeString (unsignedTx, 'from');
        const txid = this.safeString (networkData, 'txid');
        let address = this.safeString (transaction, 'address');
        let tag = undefined;
        if (address !== undefined) {
            const parts = address.split (':');
            const numParts = parts.length;
            if (numParts > 1) {
                address = this.safeString (parts, 0);
                tag = this.safeString (parts, 1);
            }
        }
        const addressTo = address;
        const tagFrom = undefined;
        const tagTo = tag;
        const cancelRequested = this.safeValue (transaction, 'cancel_requested');
        const type = (cancelRequested === undefined) ? 'deposit' : 'withdrawal';
        const amount = this.safeNumber (transaction, 'amount');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        let status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const statusCode = this.safeString (transaction, 'code');
        if (cancelRequested) {
            status = 'canceled';
        } else if (status === undefined) {
            status = this.parseTransactionStatus (statusCode);
        }
        const fee = undefined;
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': tagFrom,
            'tagTo': tagTo,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'initiated': 'pending',
            'needs_create': 'pending',
            'credited': 'ok',
            'confirmed': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'address': address,
            'amount': amount,
            'currency': currency['id'],
        };
        if (tag !== undefined) {
            request['address'] += ':' + tag;
        }
        const response = await this.privatePostWithdraw (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "code": "initiated",
        //             "id": 3,
        //             "result": "Withdraw initiated. Please allow 3-5 minutes for our system to process."
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const result = this.parseTransaction (data);
        return this.extend (result, {
            'currency': code,
            'address': address,
            'addressTo': address,
            'tag': tag,
            'tagTo': tag,
            'amount': amount,
        });
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.version + '/';
        if (api === 'private') {
            url += 'user/';
        }
        url += this.implodeParams (path, params);
        const request = this.omit (params, this.extractParams (path));
        if (method === 'POST') {
            body = this.json (request);
        } else {
            if (Object.keys (request).length) {
                url += '?' + this.urlencode (request);
            }
        }
        if (api === 'private') {
            const timestamp = this.milliseconds ().toString ();
            const bodyAsString = (method === 'POST') ? body : '';
            const auth = [
                method,
                url,
                timestamp,
                bodyAsString,
                this.secret,
            ].join ("\n"); // eslint-disable-line quotes
            const hash = this.hash (this.encode (auth), 'sha256', 'base64');
            let key = this.apiKey;
            if (typeof key !== 'string') {
                key = key.toString ();
            }
            const signature = 'HMAC-SHA256 ' + key + ':' + hash;
            headers = {
                'Authorization': signature,
                'HMAC-Timestamp': timestamp,
            };
            if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        //     {"errors":[{"code":"insuff_funds","title":"Your available balance is too low for that action"}]}
        //     {"errors":[{"code": "invalid_auth","title": "Invalid HMAC signature"}]}
        //
        if (response === undefined) {
            return;
        }
        const errors = this.safeValue (response, 'errors', []);
        const numErrors = errors.length;
        if (numErrors < 1) {
            return;
        }
        const feedback = this.id + ' ' + body;
        for (let i = 0; i < errors.length; i++) {
            const error = errors[i];
            const errorCode = this.safeString (error, 'code');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        throw new ExchangeError (feedback); // unknown message
    }
};
