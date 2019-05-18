'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, InsufficientFunds, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class okex3 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'okex3',
            'name': 'okex3',
            'countries': [ 'CN' ],
            'rateLimit': 2000,
            'userAgent': this.userAgents['chrome39'],
            'version': 'v3',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'okex.com',
            'has': {
                'CORS': false,
                'fetchDepositAddress': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchTradingLimits': false,
                'withdraw': false,
                'fetchCurrencies': false,
            },
            'timeframes': {
                '1m': 60,
                '3m': 180,
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '1d': 86400,
                '1w': 604800,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg',
                'api': {
                    'spot': 'https://www.okex.com/api/spot/v3',
                    'account': 'https://www.okex.com/api/account/v3',
                },
                'www': 'https://www.okex.com',
                'doc': 'https://www.okex.com/docs/en',
                'fees': 'https://www.okex.com/pages/products/fees.html',
            },
            'api': {
                'spot': {
                    'get': [
                        'instruments',
                        'instruments/{id}/book',
                        'instruments/{id}/ticker',
                        'instruments/{id}/trades',
                        'orders/{id}',
                        'orders',
                        'orders_pending',
                        'instruments/{id}/candles',
                    ],
                    'post': [
                        'orders',
                        'cancel_orders/{id}',
                    ],
                },
                'account': {
                    'get': [
                        'wallet',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.001,
                    'taker': 0.001,
                },
            },
            'limits': {
                'amount': { 'min': 0.01, 'max': 100000 },
            },
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'limits': {},
            },
            'exceptions': {
                '400': NotSupported, // Bad Request
                '401': AuthenticationError,
                '405': NotSupported,
                '429': DDoSProtection, // Too Many Requests, exceed api request limit
                '1002': ExchangeNotAvailable, // System busy
                '1016': InsufficientFunds,
                '3008': InvalidOrder,
                '6004': InvalidNonce,
                '6005': AuthenticationError, // Illegal API Signature
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.spotGetInstruments ();
        let result = [];
        let markets = response;
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['instrument_id'];
            let baseId = market['base_currency'];
            let quoteId = market['quote_currency'];
            let base = baseId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            let quote = quoteId.toUpperCase ();
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'price': this.safeFloat (market, 'tick_size'),
                'amount': this.safeFloat (market, 'size_increment'),
            };
            let limits = {
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': Math.pow (10, precision['price']),
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.accountGetWallet (params);
        let result = { 'info': response };
        let balances = response;
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currencyId = balance['currency'];
            let code = currencyId.toUpperCase ();
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (code);
            }
            let account = this.account ();
            account['free'] = parseFloat (balance['available']);
            account['total'] = parseFloat (balance['balance']);
            account['used'] = parseFloat (balance['hold']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol = undefined, limit = 5, params = {}) {
        await this.loadMarkets ();
        let request = this.extend ({
            'symbol': this.marketId (symbol),
            'size': limit,
            'id': this.marketId (symbol),
        }, params);
        let response = await this.spotGetInstrumentsIdBook (request);
        let orderbook = response;
        return this.parseOrderBook (orderbook, orderbook['timestamp'], 'bids', 'asks', 0, 1);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.spotGetInstrumentsIdTicker ({ 'id': this.marketId (symbol) });
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['timestamp'];
        let last = ticker['last'];
        return {
            'symbol': market['symbol'],
            'timestamp': this.parse8601 (timestamp),
            'datetime': this.iso8601 (timestamp),
            'high': ticker['high_24h'],
            'low': ticker['low_24h'],
            'bid': ticker['bid'],
            'bidVolume': undefined,
            'ask': ticker['ask'],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': ticker['base_volume_24h'],
            'quoteVolume': ticker['quote_volume_24h'],
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let datetime = trade['time'];
        let side = trade['side'].toLowerCase ();
        let orderId = this.safeString (trade, 'trade_id');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'size');
        let cost = price * amount;
        let fee = undefined;
        return {
            'id': orderId,
            'info': trade,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
            'id': market['id'],
        };
        let response = await this.spotGetInstrumentsIdTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market') {
            // for market buy it requires the amount of quote currency to spend
            if (side === 'buy') {
                if (this.options['createMarketBuyOrderRequiresPrice']) {
                    if (price === undefined) {
                        throw new InvalidOrder (this.id + " createOrder() requires the price argument with market buy orders to calculate total order cost (amount to spend), where cost = amount * price. Supply a price argument to createOrder() call if you want the cost to be calculated for you from price and amount, or, alternatively, add .options['createMarketBuyOrderRequiresPrice'] = false to supply the cost in the amount argument (the exchange-specific behaviour)");
                    } else {
                        amount = amount * price;
                    }
                }
            }
        }
        await this.loadMarkets ();
        let orderType = type;
        let request = {
            'instrument_id': this.marketId (symbol),
            'size': this.amountToPrecision (symbol, amount),
            'side': side,
            'type': orderType,
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        } else {
            request['notional'] = this.amountToPrecision (symbol, amount);
        }
        let result = await this.spotPostOrders (this.extend (request, params));
        return {
            'info': result,
            'id': result['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        params['instrument_id'] = this.market (symbol)['id'];
        let response = await this.spotPostCancelOrdersId (this.extend ({
            'id': id,
        }, params));
        let order = this.parseOrder (response);
        return this.extend (order, {
            'id': id,
            'status': 'canceled',
        });
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'ordering': 'open',
            'canceled': 'canceled',
            'cancelled': 'canceled',
            'canceling': 'canceled',
            'part_filled': 'open',
            'filled': 'closed',
            'failure': 'canceled',
        };
        if (status in statuses) {
            return statuses[status];
        }
        return status;
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'order_id');
        let side = this.safeString (order, 'side');
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'instrument_id');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let orderType = this.safeString (order, 'type');
        let timestamp = this.safeString (order, 'timestamp');
        timestamp = this.parse8601 (timestamp);
        let amount = this.safeFloat (order, 'size');
        let filled = this.safeFloat (order, 'filled_size');
        let remaining = undefined;
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'filled_notional');
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = amount - filled;
            }
            if (cost === undefined) {
                if (price !== undefined) {
                    cost = price * filled;
                }
            } else if ((cost > 0) && (filled > 0)) {
                price = cost / filled;
            }
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            feeCurrency = (side === 'buy') ? market['base'] : market['quote'];
        }
        let feeCost = 0;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'remaining': remaining,
            'filled': filled,
            'average': undefined,
            'status': status,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
            'trades': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = this.extend ({
            'instrument_id': this.market (symbol)['id'],
            'id': id,
        }, params);
        let response = await this.spotGetOrdersId (request);
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        symbol = this.market (symbol)['id'];
        let result = await this.spotGetOrdersPending (symbol, since, limit);
        return this.parseOrders (result);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let result = await this.fetchOrders (symbol, since, limit, { 'status': 'filled' });
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'instrument_id': market['id'],
            'status': 'all',
        };
        if (limit !== undefined)
            request['limit'] = limit;
        let response = await this.spotGetOrders (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv[0]),
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = this.extend ({
            'id': market['id'],
            'granularity': this.timeframes[timeframe],
        }, params);
        if (since) {
            request['start'] = this.iso8601 (since);
        }
        let response = await this.spotGetInstrumentsIdCandles (request);
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'spot', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/';
        request += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + request;
        // console.log(path, request, url)
        let nonce = this.nonce ();
        let timestamp = this.iso8601 (nonce);
        let payloadPath = url.replace (this.urls['www'], '');
        let payload = timestamp + method;
        if (payloadPath) {
            payload += payloadPath;
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
                payload += '?' + this.urlencode (query);
            }
        } else {
            payload += this.json (query);
            body = this.json (query);
        }
        let signature = '';
        if (payload && this.secret) {
            signature = this.hmac (this.encode (payload), this.encode (this.secret), 'sha256', 'base64');
        }
        headers = {
            'OK-ACCESS-KEY': this.apiKey,
            'OK-ACCESS-SIGN': this.decode (signature),
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.password,
            'Content-Type': 'application/json',
        };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
