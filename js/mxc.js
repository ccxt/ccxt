'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class mxc extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mxc',
            'name': 'MXC',
            'countries': [ 'CN' ],
            'version': 'v1',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': true,
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
                    'public': 'https://www.mxc.ceo/open/api/v1/data/',
                    'private': 'https://www.mxc.ceo/open/api/v1/private/',
                },
                'www': 'https://mxc.ceo/',
                'doc': 'https://github.com/mxcdevelop/APIDoc',
                'fees': [
                    'https://www.mxc.ceo/info/fee',
                ],
                'referral': '',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets_info',
                        'depth',
                        'history',
                        'ticker',
                        'kline',
                    ],
                },
                'private': {
                    'get': [
                        'account/info',
                        'current/orders',
                        'orders',
                        'order',
                    ],
                    'post': [
                        'order',
                        'order_batch',
                        'order_cancel',
                    ],
                    'delete': [
                        'order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'exceptions': {
            },
            // https://gate.io/api2#errCode
            'errorCodeNames': {
            },
            'options': {
                'limits': {
                    'cost': {
                        'min': {
                            'BTC': 0.0001,
                            'ETH': 0.001,
                            'USDT': 1,
                        },
                    },
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarketsInfo (params);
        const markets = this.safeValue (response, 'data');
        if (!markets) {
            throw new ExchangeError (this.id + ' fetchMarkets got an unrecognized response');
        }
        const result = [];
        const keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            const id = keys[i];
            const market = markets[id];
            const details = market;
            // all of their symbols are separated with an underscore
            // but not boe_eth_eth (BOE_ETH/ETH) which has two underscores
            // https://github.com/ccxt/ccxt/issues/4894
            const parts = id.split ('_');
            const numParts = parts.length;
            let baseId = parts[0];
            let quoteId = parts[1];
            if (numParts > 2) {
                baseId = parts[0] + '_' + parts[1];
                quoteId = parts[2];
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': 8,
                'price': details['priceScale'],
            };
            const amountLimits = {
                'min': details['minAmount'],
                'max': undefined,
            };
            const priceLimits = {
                'min': Math.pow (10, -details['priceScale']),
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
                'maker': details['sellFeeRate'],
                'taker': details['buyFeeRate'],
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
            'req_time': this.milliseconds (),
        };
        const response = await this.privateGetAccountInfo (this.extend (request, params));
        const result = { 'info': response };
        const currencyIds = Object.keys (response);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (response[currencyId], 'available');
            account['used'] = this.safeFloat (response[currencyId], 'frozen');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'depth': 5,
            'market': this.marketId (symbol),
        };
        const response = await this.publicGetDepth (this.extend (request, params));
        const orderbook = this.safeValue (response, 'data');
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'quantity');
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
        const now = this.milliseconds ();
        const request = {
            'market': this.marketId (symbol),
            'interval': this.timeframes[timeframe],
            'startTime': now / 1000,
        };
        // max limit = 1001
        if (limit !== undefined) {
            const periodDurationInSeconds = this.parseTimeframe (timeframe);
            const hours = parseInt ((periodDurationInSeconds * limit) / 3600);
            request['range_hour'] = Math.max (0, hours - 1);
        }
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000);
        }
        const response = await this.publicGetKline (this.extend (request, params));
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
        const percentage = this.safeFloat (ticker, 'percentChange');
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
            'baseVolume': this.safeFloat (ticker, 'volume'), // gateio has them reversed
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker (params);
        const result = {};
        const data = this.safeValue (response, 'data', []);
        const ids = Object.keys (data);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            let market = undefined;
            if (symbol in this.markets) {
                market = this.markets[symbol];
            }
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
            }
            result[symbol] = this.parseTicker (data[id], market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const ticker = await this.publicGetTickerId (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        const trade_time = this.safeValue (trade, 'tradeTime');
        // take either of orderid or orderId
        const price = this.safeFloat (trade, 'tradePrice');
        const amount = this.safeFloat (trade, 'tradeQuantity');
        const type = this.safeString (trade, 'tradeType');
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
            'timestamp': undefined,
            'datetime': trade_time,
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
            'market': this.marketId (symbol),
        };
        const response = await this.publicGetHistory (this.extend (request, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'api_key': this.apiKey,
            'req_time': this.milliseconds (),
        };
        const response = await this.privateGetCurrentOrders (this.extend (request, params));
        return this.parseOrders (response['data'], undefined, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'trade_no': id,
            'market': this.marketId (symbol),
            'api_key': this.apiKey,
            'req_time': this.milliseconds (),
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response['data']);
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
            id = this.safeString (order, 'data');
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const dateStr = this.safeString (order, 'createTime');
        // XXX: MXC returns order creation times in GMT+8 timezone with out specifying it
        //  hence appending ' GMT+8' to it so we can get the correct value
        // XXX: Also MXC api does not return actual matched prices and costs/fees
        const timestamp = this.parseDate (dateStr + '  GMT+8');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.parseOrderSide (this.safeString (order, 'type'));
        const price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'totalQuantity');
        if (amount === undefined) {
            amount = this.safeFloat (order, 'initialAmount');
        }
        const filled = this.safeFloat (order, 'tradedQuantity');
        const average = undefined;
        let remaining = undefined;
        if ((filled !== undefined) && (amount !== undefined)) {
            remaining = amount - filled;
        }
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
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
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'api_key': this.apiKey,
            'req_time': this.milliseconds (),
            'market': this.marketId (symbol),
            'price': price,
            'quantity': amount,
            'trade_type': (side === 'buy') ? '1' : '2',
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        return this.parseOrder (this.extend ({
            'status': 'open',
            'type': side,
            'initialAmount': amount,
        }, response), market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires symbol argument');
        }
        await this.loadMarkets ();
        const request = {
            'api_key': this.apiKey,
            'req_time': this.milliseconds (),
            'market': this.marketId (symbol),
            'trade_no': id,
        };
        return await this.privateDeleteOrder (this.extend (request, params));
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
            const signature = this.hash (this.encode (auth + '&api_secret=' + this.secret), 'md5');
            const suffix = 'sign=' + signature;
            url += '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const resultString = this.safeString (response, 'result', '');
        if (resultString !== 'false') {
            return;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'message', body);
        if (errorCode !== undefined) {
            const feedback = this.safeString (this.errorCodeNames, errorCode, message);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
    }
};
