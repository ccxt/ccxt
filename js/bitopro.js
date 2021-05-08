'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitopro extends Exchange {
    describe () {
        const result = this.deepExtend (super.describe (), {
            'id': 'bitopro',
            'name': 'BitoPro',
            'countries': [ 'TW' ],
            'version': 'v3',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'fetchStatus': false,
                'fetchCurrencies': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOrder': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://www.bitopro.com/bitoPro_logo.svg',
                'api': 'https://api.bitopro.com/v3',
                'www': 'https://www.bitopro.com',
                'doc': [
                    'https://developers.bitopro.com',
                ],
                'fees': 'https://www.bitopro.com/fees',
                'referral': 'https://www.bitopro.com/landing_pages/reward',
            },
            'api': {
                'public': {
                    'get': [
                        'order-book/{pair}',
                        'tickers',
                        'tickers/{pair}',
                        'trades/{pair}',
                        'provisioning/trading-pairs',
                        'trading-history/{pair}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'orders/history',
                        'orders/{pair}',
                        'orders/{pair}/{orderId}',
                    ],
                    'post': [
                        'orders/{pair}',
                    ],
                    'delete': [
                        'orders/{pair}/{id}',
                    ],
                },
            },
        });
        return result;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = 500, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const nonce = parseInt (this.nonce () / 1000);
        let fromTimstamp = (nonce - 86400);
        if (since !== undefined) {
            fromTimstamp = parseInt (since / 1000);
        }
        let toTimstamp = nonce;
        const to = this.safeValue (params, 'to');
        if (to) {
            toTimstamp = parseInt (to / 1000);
        }
        const resolution = this.timeframes[timeframe];
        const request = {
            'pair': market['id'],
            'resolution': resolution,
            'from': fromTimstamp,
            'to': toTimstamp,
        };
        const response = await this.publicGetTradingHistoryPair (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchTickers ();
        const keys = Object.keys (response);
        const symbolLength = keys.length;
        const result = {};
        for (let c = 0; c < symbolLength; c++) {
            const pair = keys[c];
            const currency = response[pair];
            const symbols = pair.split ('/');
            const symbolLength = symbols.length;
            for (let i = 0; i < symbolLength; i++) {
                const symbol = symbols[i];
                const id = symbol;
                const name = symbol;
                const code = this.commonCurrencyCode (symbol);
                result[code] = {
                    'id': id,
                    'code': code,
                    'info': currency,
                    'name': name,
                    'active': true,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
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
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProvisioningTradingPairs ();
        const markets = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const active = !market['maintain'];
            const pair = this.safeString (market, 'pair');
            let base = this.safeString (market, 'base');
            let quote = this.safeString (market, 'quote');
            const id = pair;
            base = this.commonCurrencyCode (base);
            base = base.toUpperCase ();
            quote = this.commonCurrencyCode (quote);
            quote = quote.toUpperCase ();
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'quotePrecision'),
                'amount': this.safeInteger (market, 'basePrecision'),
                'cost': undefined,
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minLimitBaseAmount'),
                    'max': this.safeFloat (market, 'maxLimitBaseAmount'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'limits': limits,
                'precision': precision,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountsBalance (params);
        const balances = this.safeValue (response, 'data', []);
        const result = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let currencyId = this.safeString (balance, 'currency');
            currencyId = currencyId.toUpperCase ();
            const amount = this.safeFloat (balance, 'amount');
            const available = this.safeFloat (balance, 'available');
            const stake = this.safeFloat (balance, 'stake');
            const account = {
                'free': available,
                'stake': stake,
                'used': amount - available - stake,
                'total': amount,
            };
            result[currencyId] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const timestamp = this.milliseconds ();
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        } else {
            limit = 5;
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        return this.parseOrderBook (response, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let pair = this.safeString (ticker, 'pair');
        pair = pair.toUpperCase ();
        let [ base, quote ] = pair.split ('_');
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        const symbol = base + '/' + quote;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'lastPrice'),
            'last': this.safeFloat (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'priceChange24hr'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24hr'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.publicGetTickers ();
        const tickers = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTickersPair (this.extend (request, params));
        const ticker = this.safeValue (response, 'data', {});
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        const timestampSeconds = this.safeValue (trade, 'timestamp');
        const timestamp = timestampSeconds * 1000;
        const side = (trade['isBuyer']) ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'takerOrMaker': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradesPair (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOrderExecution (order) {
        const orderId = this.safeString (order, 'orderId');
        return {
            'id': orderId,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired ('createOrder requires the symbol parameter');
        }
        const request = {
            'type': type.toUpperCase (),
            'pair': this.marketId (symbol),
            'action': side.toUpperCase (),
            'amount': amount,
            'timestamp': this.nonce (),
        };
        if (type.toLowerCase () === 'limit') {
            request['price'] = price;
        }
        const response = await this.privatePostOrdersPair (this.extend (request, params), params);
        return this.parseOrderExecution (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired ('cancelOrder requires the symbol parameter');
        }
        const request = {
            'pair': this.marketId (symbol),
            'id': id,
        };
        const response = await this.privateDeleteOrdersPairId (this.extend (request, params));
        return this.parseOrderExecution (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'closed',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        const orderId = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'timestamp');
        const marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.markets_by_id, marketId);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = this.safeString (market, 'symbol');
        const type = this.safeString (order, 'type').toLowerCase ();
        const side = this.safeString (order, 'action').toLowerCase ();
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'originalAmount');
        const filled = this.safeFloat (order, 'executedAmount');
        const remaining = this.safeFloat (order, 'remainingAmount');
        const fee = this.safeFloat (order, 'fee');
        let feeSymbol = this.safeString (order, 'feeSymbol');
        feeSymbol = feeSymbol.toUpperCase ();
        return {
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': type,
            'status': status,
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'cost': undefined,
            'remaining': remaining,
            'average': undefined,
            'trades': undefined,
            'fee': {
                'currency': feeSymbol,
                'cost': fee,
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
            'pair': this.marketId (symbol),
        };
        const response = await this.privateGetOrdersPairOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privateGetOrdersPair (this.extend (request, params), params);
        const orders = this.safeValue (response, 'data', []);
        const orderLength = orders.length;
        const result = [];
        for (let i = 0; i < orderLength; i++) {
            const order = orders[i];
            const parsedOrder = this.parseOrder (order);
            result.push (parsedOrder);
        }
        return result;
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'active': true,
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'active': false,
        };
        const orders = await this.fetchOrders (symbol, since, limit, this.extend (request, params));
        const result = [];
        const orderLength = orders.length;
        for (let i = 0; i < orderLength; i++) {
            const order = orders[i];
            const status = this.safeString (order, 'status');
            if (status === 'closed' || status === 'canceled') {
                result.push (order);
            }
        }
        return result;
    }

    parseMyTrade (myTrade) {
        const orderId = this.safeString (myTrade, 'id');
        const timestamp = this.safeInteger (myTrade, 'timestamp');
        const marketId = this.safeString (myTrade, 'pair');
        const market = this.safeValue (this.markets_by_id, marketId);
        const symbol = this.safeString (market, 'symbol');
        const type = this.safeString (myTrade, 'type').toLowerCase ();
        const side = this.safeString (myTrade, 'action').toLowerCase ();
        const price = this.safeFloat (myTrade, 'price');
        const filled = this.safeFloat (myTrade, 'executedAmount');
        const fee = this.safeFloat (myTrade, 'fee');
        let feeSymbol = this.safeString (myTrade, 'feeSymbol');
        feeSymbol = feeSymbol.toUpperCase ();
        return {
            'info': myTrade,
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': filled,
            'cost': undefined,
            'fee': {
                'cost': fee,
                'currency': feeSymbol,
                'rate': undefined,
            },
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        const tradesLength = trades.length;
        const result = [];
        for (let i = 0; i < tradesLength; i++) {
            const trade = trades[i];
            const executedAmount = this.safeFloat (trade, 'executedAmount');
            if (executedAmount > 0 && trade['pair'] === market['id']) {
                const myTrade = this.parseMyTrade (trade);
                result.push (myTrade);
            }
        }
        return result;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        headers['X-BITOPRO-API'] = 'ccxt';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = this.json (params);
                const payload = this.stringToBase64 (body);
                const signature = this.hmac (payload, this.secret, 'sha384', 'hex');
                headers['X-BITOPRO-APIKEY'] = this.apiKey;
                headers['X-BITOPRO-PAYLOAD'] = payload;
                headers['X-BITOPRO-SIGNATURE'] = signature;
            } else if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                const nonce = this.nonce ();
                let rawData = {
                    'identity': this.email,
                    'nonce': nonce,
                };
                rawData = this.json (rawData);
                const payload = this.stringToBase64 (rawData);
                const signature = this.hmac (payload, this.secret, 'sha384', 'hex');
                headers['X-BITOPRO-APIKEY'] = this.apiKey;
                headers['X-BITOPRO-PAYLOAD'] = payload;
                headers['X-BITOPRO-SIGNATURE'] = signature;
            }
        } else if (api === 'public' && method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code >= 200 && code < 300) {
            return;
        }
        if (code === 401) {
            throw new AuthenticationError (body);
        }
        if (code === 429) {
            throw new DDoSProtection (body);
        }
        const feedback = body;
        throw new ExchangeError (feedback);
    }
};
