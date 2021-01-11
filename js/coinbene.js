'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinbene extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbene',
            'name': 'Coinbene',
            'countries': ['US'],
            'version': 'v2',
            'rateLimit': 1000,
            'has': {
                'createMarketOrder': false,
                'fetchOpenOrders': true,
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchOrder': true,
                'fetchTrades': true,
                'fetchBalance': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'api': {
                    'public': 'http://openapi-exchange.coinbene.com/api/exchange/v2',
                    'private': 'http://openapi-exchange.coinbene.com/api/exchange/v2',
                },
                'www': 'https://www.coinbene.com',
                'doc': [
                    'https://github.com/Coinbene/API-SPOT-v2-Documents/blob/master/openapi-spot-rest-en.md',
                ],
                'fees': '',
            },
            'api': {
                'public': {
                    'get': [
                        'market/tradePair/list',
                        'market/ticker/list',
                        'market/ticker/one',
                        'market/orderBook',
                        'market/trades',
                        'market/instruments/candles',
                        'market/rate/list',
                    ],
                },
                'private': {
                    'get': [
                        'account/info',
                        'account/one',
                        'order/openOrders',
                        'order/closedOrders',
                        'order/info',
                        'order/trade/fills',
                    ],
                    'post': [
                        'order/place',
                        'order/cancel',
                        'order/batchCancel',
                        'order/batchPlaceOrder',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        // {
        //     "symbol": "ABBC/BTC",
        //     "baseAsset": "ABBC",
        //     "quoteAsset": "BTC",
        //     "pricePrecision": "8",
        //     "amountPrecision": "2",
        //     "takerFeeRate": "0.001",
        //     "makerFeeRate": "0.001",
        //     "minAmount": "50",
        //     "priceFluctuation": "0.20",
        //     "site": "MAIN"
        // },
        const response = await this.publicGetMarketTradePairList (params);
        const result = [];
        for (let i = 0; i < response['data'].length; i++) {
            const market = response['data'][i];
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const id = base + quote;
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'amountPrecision'),
                'price': this.safeInteger (market, 'pricePrecision'),
            };
            const minAmount = this.safeFloat (market, 'minAmount');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
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

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.parse8601 (ohlcv[0]), // t
            parseFloat (ohlcv[1]), // o
            parseFloat (ohlcv[2]), // c
            parseFloat (ohlcv[3]), // h
            parseFloat (ohlcv[4]), // l
            parseFloat (ohlcv[5]), // v
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'symbol': symbol,
            'period': this.timeframes[timeframe],
        };
        const response = await this.publicGetMarketInstrumentsCandles (request);
        // Description of the returned array format:
        //     [
        //     timestamp start time
        //     open price
        //     high price
        //     low lowest price
        //     close closing price
        //     volume
        //     ]
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, undefined, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        // [ 'BTC/USDT', '38330.25', '1.4135', 'buy', '2021-01-10T18:22:31.000Z' ]
        //
        let timestamp = undefined;
        let side = undefined;
        const type = undefined;
        let price = undefined;
        let amount = undefined;
        let id = undefined;
        const order = undefined;
        const fee = undefined;
        let symbol = undefined;
        let cost = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        if (Array.isArray (trade)) {
            timestamp = trade[4].toString ();
            price = parseFloat (trade[1]);
            amount = parseFloat (trade[2]);
            cost = price * amount;
            side = trade[3];
            id = trade[0].toString ();
        }
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': this.parse8601 (timestamp),
            'datetime': timestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': this.safeString (market, 'symbol'),
        };
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const timestamp = this.milliseconds ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': this.safeString (market, 'symbol'),
        }, params);
        const response = await this.publicGetMarketTickerOne (request);
        const ticker = this.safeValue (response, 'data');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24h'),
            'low': this.safeFloat (ticker, 'low24h'),
            'bid': this.safeFloat (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'bestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'previousClose': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'latestPrice'),
            'last': this.safeFloat (ticker, 'latestPrice'),
            'percentage': undefined,
            'change': this.safeFloat (ticker, 'chg24h'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24h'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        return await this.privatePostOrderBatchCancel (params);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const result = {};
        await this.loadMarkets ();
        const request = {
            'symbol': symbol,
            'direction': side,
            'price': price,
            'quantity': amount,
            'orderType': type,
        };
        const response = await this.privatePostOrderPlace (this.extend (request, params));
        const code = response['code'];
        if (code !== 200) {
            return response;
        }
        result['id'] = response['data']['orderId'];
        result['info'] = response['data'];
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const asset = this.safeString (params, 'asset');
        const request = {
            'asset': asset,
        };
        const response = await this.privateGetAccountOne (this.extend (request, params));
        const balances = this.safeValue (response, 'data');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'frozenBalance');
            account['total'] = this.safeFloat (balance, 'totalBalance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrderInfo (this.extend (request, params));
        return this.parseOrder (response['data']);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'depth': 10,
        };
        const response = await this.publicGetMarketOrderBook (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        return this.parseOrderBook (data, data.timestamp, 'bids', 'asks');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        const request = {
            'symbol': symbol,
        };
        const response = await this.privateGetOrderOpenOrders (this.extend (request, params));
        const orders = this.safeValue (response, 'data');
        if (!orders.length) {
            return result;
        }
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            result.push ({
                'id': order['orderId'],
                'datetime': order['orderTime'],
                'timestamp': undefined,
                'lastTradeTimestamp': undefined,
                'status': order['orderStatus'],
                'symbol': order['symbol'],
                'type': undefined,
                'side': order['orderDirection'],
                'price': order['orderPrice'],
                'amount': order['amount'],
                'filled': order['amount'],
                'remaining': undefined,
                'const': undefined,
                'fee': order['fee'],
                'info': order,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const request = '/api/exchange/' + this.version + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            query = this.urlencode (query);
            if (method === 'POST') {
                body = query;
            }
            const timestamp = this.iso8601 (this.milliseconds ());
            let auth = '';
            if (query.length) {
                auth = timestamp + method + request + '?' + query;
            } else {
                auth = timestamp + method + request;
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers = {
                'Content-Type': 'application/json',
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // resort to defaultErrorHandler
        }
        if (httpCode >= 400) {
            if (body[0] === '{') {
                const feedback = this.id + ' ' + body;
                const message = this.safeString2 (response, 'message', 'error');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                this.throwExactlyMatchedException (this.exceptions['broad'], message, feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
