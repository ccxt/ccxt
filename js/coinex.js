'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinex',
            'name': 'CoinEx',
            'version': 'v1',
            'countries': 'CN',
            'rateLimit': 1000,
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '2h': '2hour',
                '4h': '4hour',
                '6h': '6hour',
                '12h': '12hour',
                '1d': '1day',
                '3d': '3day',
                '1w': '1week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg',
                'api': {
                    'public': 'https://api.coinex.com',
                    'private': 'https://api.coinex.com',
                    'web': 'https://www.coinex.com',
                },
                'www': 'https://www.coinex.com',
                'doc': 'https://github.com/coinexcom/coinex_exchange_api/wiki',
                'fees': 'https://www.coinex.com/fees',
            },
            'api': {
                'web': {
                    'get': [
                        'res/market',
                    ],
                },
                'public': {
                    'get': [
                        'market/list',
                        'market/ticker',
                        'market/ticker/all',
                        'market/depth',
                        'market/deals',
                        'market/kline',
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'order',
                        'order/pending',
                        'order/finished',
                        'order/finished/{id}',
                        'order/user/deals',
                    ],
                    'post': [
                        'order/limit',
                        'order/market',
                    ],
                    'delete': [
                        'order/pending',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0,
                    'taker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BCH': 0.0,
                        'BTC': 0.001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'ZEC': 0.0001,
                        'DASH': 0.0001,
                    },
                },
            },
            'limits': {
                'amount': {
                    'min': 0.001,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.webGetResMarket ();
        let markets = response['data']['market_info'];
        let result = [];
        let keys = Object.keys (markets);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let market = markets[key];
            let id = market['market'];
            let quoteId = market['buy_asset_type'];
            let baseId = market['sell_asset_type'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['sell_asset_type_places'],
                'price': market['buy_asset_type_places'],
            };
            let numMergeLevels = market['merge'].length;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'taker': this.safeFloat (market, 'taker_fee_rate'),
                'maker': this.safeFloat (market, 'maker_fee_rate'),
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'least_amount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': parseFloat (market['merge'][numMergeLevels - 1]),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['date'];
        let symbol = market['symbol'];
        ticker = ticker['ticker'];
        let last = this.safeFloat (ticker, 'last');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'vol'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketTicker (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (response['data'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketTickerAll (params);
        let data = response['data'];
        let timestamp = data['date'];
        let tickers = data['ticker'];
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = {
                'date': timestamp,
                'ticker': tickers[id],
            };
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketDepth (this.extend ({
            'market': this.marketId (symbol),
            'merge': '0.00000001',
        }, params));
        return this.parseOrderBook (response['data']);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeInteger (trade, 'create_time');
        let tradeId = this.safeString (trade, 'id');
        let orderId = this.safeString (trade, 'id');
        if (!timestamp) {
            timestamp = trade['date'];
            orderId = undefined;
        } else {
            tradeId = undefined;
        }
        timestamp *= 1000;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let symbol = market['symbol'];
        let cost = this.safeFloat (trade, 'deal_money');
        if (!cost)
            cost = parseFloat (this.costToPrecision (symbol, price * amount));
        let fee = this.safeFloat (trade, 'fee');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': tradeId,
            'order': orderId,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketDeals (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketKline (this.extend ({
            'market': market['id'],
            'type': this.timeframes[timeframe],
        }, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalance (params);
        let result = { 'info': response };
        let balances = response['data'];
        let currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['available']),
                'used': parseFloat (balance['frozen']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        // TODO: check if it's actually milliseconds, since examples were in seconds
        let timestamp = this.safeInteger (order, 'create_time') * 1000;
        let price = this.safeFloat (order, 'price');
        let cost = this.safeFloat (order, 'deal_money');
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'deal_amount');
        let symbol = market['symbol'];
        let remaining = this.amountToPrecision (symbol, amount - filled);
        let status = order['status'];
        if (status === 'done') {
            status = 'closed';
        } else {
            // not_deal
            // part_deal
            status = 'open';
        }
        return {
            'id': this.safeString (order, 'id'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': order['order_type'],
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': {
                'currency': market['quote'],
                'cost': this.safeFloat (order, 'deal_fee'),
            },
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePostOrder' + this.capitalize (type);
        let market = this.market (symbol);
        amount = parseFloat (amount);
        let request = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'type': side,
        };
        if (type === 'limit') {
            price = parseFloat (price);
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let response = await this[method] (this.extend (request, params));
        let order = this.parseOrder (response['data'], market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateDeleteOrderPending (this.extend ({
            'id': id,
            'market': market['id'],
        }, params));
        return this.parseOrder (response['data'], market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrder (this.extend ({
            'id': id,
            'market': market['id'],
        }, params));
        return this.parseOrder (response['data'], market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetOrderPending (this.extend (request, params));
        return this.parseOrders (response['data']['data'], market);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'market': market['id'],
        };
        if (limit)
            request['limit'] = limit;
        let response = await this.privateGetOrderFinished (this.extend (request, params));
        return this.parseOrders (response['data']['data'], market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetOrderUserDeals (this.extend ({
            'market': market['id'],
            'page': 1,
            'limit': 100,
        }, params));
        return this.parseTrades (response['data']['data'], market, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        let url = this.urls['api'][api] + '/' + this.version + '/' + path;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else if (api === 'web') {
            url = this.urls['api'][api] + '/' + path;
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            query = this.extend ({
                'access_id': this.apiKey,
                'tonce': nonce.toString (),
            }, query);
            query = this.keysort (query);
            let urlencoded = this.urlencode (query);
            let signature = this.hash (this.encode (urlencoded + '&secret_key=' + this.secret));
            headers = {
                'Authorization': signature.toUpperCase (),
                'Content-Type': 'application/json',
            };
            if ((method === 'GET') || (method === 'DELETE')) {
                url += '?' + urlencoded;
            } else {
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let code = this.safeString (response, 'code');
        let data = this.safeValue (response, 'data');
        if (code !== '0' || !data) {
            let responseCodes = {
                '24': AuthenticationError,
                '25': AuthenticationError,
                '107': InsufficientFunds,
                '600': OrderNotFound,
                '601': InvalidOrder,
                '602': InvalidOrder,
                '606': InvalidOrder,
            };
            let ErrorClass = this.safeValue (responseCodes, code, ExchangeError);
            throw new ErrorClass (response['message']);
        }
        return response;
    }
};
