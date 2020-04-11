'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadResponse } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class biki extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'biki',
            'name': 'Biki',
            'countries': [ 'CN' ],
            'version': 'v1',
            'rateLimit': 10,
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': false,
                'withdraw': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
                'createDepositAddress': false,
                'fetchDepositAddress': false,
                'fetchClosedOrders': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrderTrades': false,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchMyTrades': false,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '60m': '3600',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://openapi.biki.com/open/api/',
                    'private': 'https://openapi.biki.com/open/api/',
                },
                'www': 'https://biki.com/',
                'doc': 'https://github.com/code-biki/open-api',
                'fees': [
                    'https://bikiuser.zendesk.com/hc/zh-cn/articles/360019543671-BiKi%E8%B4%B9%E7%8E%87%E8%AF%B4%E6%98%8E',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'common/symbols',
                        'market_dept',
                        'get_trades',
                        'get_ticker',
                        'get_records',
                    ],
                },
                'private': {
                    'get': [
                        'user/account',
                        'v2/all_order',
                        'order_info',
                    ],
                    'post': [
                        'create_order',
                        'mass_replaceV2',
                        'cancel_order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.0015,
                    'taker': 0.0015,
                },
            },
            'exceptions': {
                '1': BadResponse,
            },
            'errorCodeNames': {
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                        },
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetCommonSymbols (params);
        const markets = this.safeValue (response, 'data');
        if (!markets) {
            throw new ExchangeError (this.id + ' fetchMarkets got an unrecognized response');
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market['symbol'];
            const baseId = market['base_coin'];
            const quoteId = market['count_coin'];
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amount_precision'),
                'price': this.safeInteger (market, 'price_precision'),
            };
            const amountLimits = {
                'min': Math.pow (10, -market['amount_precision']),
                'max': undefined,
            };
            const priceLimits = {
                'min': Math.pow (10, -market['price_precision']),
                'max': undefined,
            };
            const defaultCost = amountLimits['min'] * priceLimits['min'];
            const minCost = this.safeFloat (this.options['limits']['cost']['min'], quote, defaultCost);
            const costLimits = {
                'min': minCost,
                'max': undefined,
            };
            const limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            const active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'api_key': this.apiKey,
            'time': this.milliseconds (),
        };
        const response = await this.privateGetUserAccount (this.extend (request, params));
        const respData = this.safeValue (response, 'data');
        const result = { 'info': respData };
        const coins = this.safeValue (respData, 'coin_list');
        for (let i = 0; i < coins.length; i++) {
            const coin = coins[i];
            const currencyId = this.safeValue (coin, 'coin');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (coin, 'normal');
            account['used'] = this.safeFloat (coin, 'locked');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'type': 'step0',
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetMarketDept (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const orderbook = this.safeValue (data, 'tick');
        return this.parseOrderBook (orderbook);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        // they return [ Timestamp, Volume, Close, High, Low, Open ]
        return [
            parseInt (ohlcv[0]),   // t
            parseFloat (ohlcv[1]), // o
            parseFloat (ohlcv[2]), // c
            parseFloat (ohlcv[3]), // h
            parseFloat (ohlcv[4]), // l
            parseFloat (ohlcv[5]), // v
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const periodDurationInSeconds = this.parseTimeframe (timeframe);
        const request = {
            'symbol': this.marketId (symbol),
            'period': periodDurationInSeconds / 60,  // in minute
        };
        // max limit = 1001
        // since & limit not supported
        const response = await this.publicGetGetRecords (this.extend (request, params));
        //        ordering: Ts, O, C, H, L, V
        //     {
        //         "code": 200,
        //         "data": [
        //             [ "TS", "o", "c", "h", "l", "v" ],
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const percentage = this.safeFloat (ticker, 'rose');
        const open = this.safeFloat (ticker, 'open');
        let change = undefined;
        let average = undefined;
        if ((last !== undefined) && (percentage !== undefined)) {
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ticker = await this.publicGetGetTicker (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        // API doc says 'ts', but in fact it is 'ctime'
        const timestamp = this.safeTimestamp (trade, 'ctime') / 1000;
        // take either of orderid or orderId
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const type = this.safeString (trade, 'type');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': undefined,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': type === '1' ? 'buy' : 'sell',
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.publicGetGetTrades (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        if (!data) {
            throw new ExchangeError (this.id + ' fetchTrades got an unrecognized response');
        }
        return this.parseTrades (data, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'api_key': this.apiKey,
            'time': this.milliseconds (),
        };
        const response = await this.privateGetCurrentOrders (this.extend (request, params));
        return this.parseOrders (response['data'], undefined, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            'symbol': this.marketId (symbol),
            'api_key': this.apiKey,
            'time': this.milliseconds (),
        };
        const response = await this.privateGetOrderInfo (this.extend (request, params));
        return this.parseOrder (response['data']['order_info']);
    }

    parseOrderSide (side) {
        const sides = {
            '1': 'buy',
            '2': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'open', // partial closed
            '4': 'canceled', // partial closed
            '5': 'canceled', // partial canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // Different API endpoints returns order info in different format...
        // with different fields filled.
        let id = this.safeString (order, 'id');
        if (id === undefined) {
            id = this.safeString (order, 'order_id');
        }
        let symbol = undefined;
        let marketId = undefined;
        if (('baseCoin' in order) && ('countCoin' in order)) {
            marketId = this.safeStringLower (order, 'baseCoin') + this.safeStringLower (order, 'countCoin');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        if ('symbol' in order) {
            symbol = this.safeString (order, 'symbol');
        }
        let timestamp = undefined;
        let datetime = undefined;
        if ('created_at' in order) {
            timestamp = this.safeTimestamp (order, 'created_at') / 1000;
            datetime = this.iso8601 (timestamp);
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.parseOrderSide (this.safeString (order, 'type'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'volume');
        const filled = this.safeFloat (order, 'deal_volume');
        const average = this.safeFloat (order, 'avg_price');
        const remaining = this.safeFloat (order, 'remain_volume');
        return {
            'id': id,
            'datetime': datetime,
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': average,
            'trades': undefined,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            // https://github.com/code-biki/open-api#%E5%88%9B%E5%BB%BA%E8%AE%A2%E5%8D%95
            // their API for market order is crap, not supporting market orders for now
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'api_key': this.apiKey,
            'time': this.milliseconds (),
            'symbol': this.marketId (symbol),
            'price': price,
            'volume': amount,
            'side': side.toUpperCase (),
            'type': '1', // limit order
        };
        const response = await this.privatePostCreateOrder (this.extend (request, params));
        return this.parseOrder (this.extend ({
            'status': 'open',
            'side': side,
            'amount': amount,
            'type': type,
            'symbol': symbol,
        }, this.safeValue (response, 'data')), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'api_key': this.apiKey,
            'time': this.milliseconds (),
            'symbol': this.marketId (symbol),
            'order_id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const auth = this.rawencode (this.keysort (query));
            const to_sign = auth.replace ('=', '').replace ('&', '');
            const signature = this.hash (this.encode (to_sign + this.secret), 'md5');
            const suffix = 'sign=' + signature;
            url += '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        // use response code for error
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg', body);
        if (errorCode !== undefined && errorCode !== '0') {
            const feedback = this.safeString (this.errorCodeNames, errorCode, message);
            // XXX: just throwing generic error when API call went wrong
            this.throwExactlyMatchedException (this.exceptions, '1', feedback);
        }
    }
};
