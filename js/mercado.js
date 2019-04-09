'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class mercado extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mercado',
            'name': 'Mercado Bitcoin',
            'countries': ['BR'], // Brazil
            'rateLimit': 1000,
            'version': 'v3',
            'has': {
                'CORS': true,
                'createMarketOrder': true,
                'fetchOrder': true,
                'withdraw': true,
                'fetchOHLCV': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
            },
            'timeframes': {
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '2w': '2w',
            },
            'timeframesMilliseconds': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '1h': 3600,
                '6h': 21600,
                '1d': 86400,
                '3d': 64800,
                '1w': 604800,
                '2w': 1209600,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg',
                'api': {
                    'public': 'https://www.mercadobitcoin.net/api',
                    'private': 'https://www.mercadobitcoin.net/tapi',
                    'v4Public': 'https://www.mercadobitcoin.com.br/v4',
                },
                'www': 'https://www.mercadobitcoin.com.br',
                'doc': [
                    'https://www.mercadobitcoin.com.br/api-doc',
                    'https://www.mercadobitcoin.com.br/trade-api',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        '{coin}/orderbook/', // last slash critical
                        '{coin}/ticker/',
                        '{coin}/trades/',
                        '{coin}/trades/{from}/',
                        '{coin}/trades/{from}/{to}',
                        '{coin}/day-summary/{year}/{month}/{day}/',
                    ],
                },
                'private': {
                    'post': [
                        'cancel_order',
                        'get_account_info',
                        'get_order',
                        'get_withdrawal',
                        'list_system_messages',
                        'list_orders',
                        'list_orderbook',
                        'place_buy_order',
                        'place_sell_order',
                        'place_market_buy_order',
                        'place_market_sell_order',
                        'withdraw_coin',
                    ],
                },
                'v4Public': {
                    'get': [
                        '{coin}/candle/',
                    ],
                },
            },
            'markets': {
                'BTC/BRL': { 'id': 'BRLBTC', 'symbol': 'BTC/BRL', 'base': 'BTC', 'quote': 'BRL', 'suffix': 'Bitcoin' },
                'LTC/BRL': { 'id': 'BRLLTC', 'symbol': 'LTC/BRL', 'base': 'LTC', 'quote': 'BRL', 'suffix': 'Litecoin' },
                'BCH/BRL': { 'id': 'BRLBCH', 'symbol': 'BCH/BRL', 'base': 'BCH', 'quote': 'BRL', 'suffix': 'BCash' },
                'XRP/BRL': { 'id': 'BRLXRP', 'symbol': 'XRP/BRL', 'base': 'XRP', 'quote': 'BRL', 'suffix': 'Ripple' },
                'ETH/BRL': { 'id': 'BRLETH', 'symbol': 'ETH/BRL', 'base': 'ETH', 'quote': 'BRL', 'suffix': 'Ethereum' },
            },
            'fees': {
                'trading': {
                    'maker': 0.3 / 100,
                    'taker': 0.7 / 100,
                },
            },
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let orderbook = await this.publicGetCoinOrderbook (this.extend ({
            'coin': market['base'],
        }, params));
        return this.parseOrderBook (orderbook);
    }

    async fetchTicker (symbol, params = {}) {
        let market = this.market (symbol);
        let response = await this.publicGetCoinTicker (this.extend ({
            'coin': market['base'],
        }, params));
        let ticker = response['ticker'];
        let timestamp = parseInt (ticker['date']) * 1000;
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

    parseTrade (trade, market) {
        let timestamp = trade['date'] * 1000;
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'id': trade['tid'].toString (),
            'order': undefined,
            'type': undefined,
            'side': trade['type'],
            'price': trade['price'],
            'amount': trade['amount'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let market = this.market (symbol);
        let method = 'publicGetCoinTrades';
        let request = {
            'coin': market['base'],
        };
        if (since !== undefined) {
            method += 'From';
            request['from'] = parseInt (since / 1000);
        }
        let to = this.safeInteger (params, 'to');
        if (to !== undefined)
            method += 'To';
        let response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['response_data']['balance'];
        let result = { 'info': response };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            let account = this.account ();
            if (lowercase in balances) {
                account['free'] = parseFloat (balances[lowercase]['available']);
                account['total'] = parseFloat (balances[lowercase]['total']);
                account['used'] = account['total'] - account['free'];
            }
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let order = {
            'coin_pair': this.marketId (symbol),
        };
        let method = 'privatePostPlace' + this.capitalize (side) + 'Order';
        if (type === 'limit') {
            order['limit_price'] = price;
            order['quantity'] = amount;
        } else {
            method = 'privatePostPlaceMarket' + this.capitalize (side) + 'Order';
            if (side === 'buy') {
                order['cost'] = (amount * price).toFixed (5);
            } else {
                order['quantity'] = amount;
            }
        }
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['response_data']['order']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostCancelOrder (this.extend ({
            'coin_pair': market['id'],
            'order_id': id,
        }, params));
        return this.parseOrder (response['response_data']['order'], market);
    }

    parseOrderStatus (status) {
        const statuses = {
            '2': 'open',
            '3': 'canceled',
            '4': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'order_id');
        let side = undefined;
        if ('order_type' in order)
            side = (order['order_type'] === 1) ? 'buy' : 'sell';
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'coin_pair');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let timestamp = this.safeInteger (order, 'created_timestamp');
        if (timestamp !== undefined) {
            timestamp = timestamp * 1000;
        }
        let fee = {
            'cost': this.safeFloat (order, 'fee'),
            'currency': market['quote'],
        };
        let price = this.safeFloat (order, 'limit_price');
        // price = this.safeFloat (order, 'executed_price_avg', price);
        let average = this.safeFloat (order, 'executed_price_avg');
        let amount = this.safeFloat (order, 'quantity');
        let filled = this.safeFloat (order, 'executed_quantity');
        let remaining = amount - filled;
        let cost = amount * average;
        let lastTradeTimestamp = this.safeInteger (order, 'updated_timestamp');
        if (lastTradeTimestamp !== undefined) {
            lastTradeTimestamp = lastTradeTimestamp * 1000;
        }
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined, // todo parse trades (operations)
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrder () requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = undefined;
        response = await this.privatePostGetOrder (this.extend ({
            'coin_pair': market['id'],
            'order_id': parseInt (id),
        }, params));
        return this.parseOrder (response['response_data']['order']);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'coin': currency['id'],
            'quantity': amount.toFixed (10),
            'address': address,
        };
        if (code === 'BRL') {
            let account_ref = ('account_ref' in params);
            if (!account_ref) {
                throw new ExchangeError (this.id + ' requires account_ref parameter to withdraw ' + code);
            }
        } else if (code !== 'LTC') {
            let tx_fee = ('tx_fee' in params);
            if (!tx_fee) {
                throw new ExchangeError (this.id + ' requires tx_fee parameter to withdraw ' + code);
            }
            if (code === 'XRP') {
                if (tag === undefined) {
                    if (!('destination_tag' in params)) {
                        throw new ExchangeError (this.id + ' requires a tag argument or destination_tag parameter to withdraw ' + code);
                    }
                } else {
                    request['destination_tag'] = tag;
                }
            }
        }
        let response = await this.privatePostWithdrawCoin (this.extend (request, params));
        return {
            'info': response,
            'id': response['response_data']['withdrawal']['id'],
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv.timestamp * 1000,
            parseFloat (ohlcv.open),
            parseFloat (ohlcv.high),
            parseFloat (ohlcv.low),
            parseFloat (ohlcv.close),
            parseFloat (ohlcv.volume),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'precision': this.timeframes[timeframe],
            'coin': market.id.toLowerCase (),
        };
        if (since !== undefined) {
            request['from'] = parseInt (since / 1000);
            if (limit !== undefined) {
                request['to'] = (this.sum (request['from'], limit * this.timeframesMilliseconds[timeframe]));
            } else {
                request['to'] = this.sum (this.seconds (), 1);
            }
        }
        let response = await this.v4PublicGetCoinCandle (this.extend (request, params));
        return this.parseOHLCVs (response.candles, market, timeframe, since, limit);
    }

    async fetchOrders (id, symbol = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchOrders () requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = undefined;
        response = await this.privatePostListOrders (this.extend ({
            'coin_pair': market['base'],
            'order_id': parseInt (id),
        }, params));
        let orders = response['response_data']['orders'];
        for (let i = 0; i < orders.length; i++) {
            orders[i] = this.parseOrder (orders[i]);
        }
        return orders;
    }

    async fetchTickers (params = {}) {
        let tickers = {};
        let tickersArray = [];
        Object.keys (this.markets).forEach ((key) => {
            tickersArray.push (key);
        });
        for (let i = 0; i < tickersArray.length; i++) {
            const ticker = tickersArray[i];
            tickers[ticker] = await this.fetchTicker (ticker);
        }
        return tickers;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public' || (api === 'v4Public')) {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/';
            let nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'tapi_method': path,
                'tapi_nonce': nonce,
            }, params));
            let auth = '/tapi/' + this.version + '/' + '?' + body;
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'TAPI-ID': this.apiKey,
                'TAPI-MAC': this.hmac (this.encode (auth), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error_message' in response)
            throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
