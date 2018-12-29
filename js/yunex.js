'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class yunex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'yunex',
            'name': 'Yunex',
            'countries': [ 'Hong Kong' ],
            'version': 'v1',
            'accounts': undefined,
            'accountsById': undefined,
            'has': {
                'CORS': true,
                'fetchMarkets': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOHLCV': true,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchMyTrades': false,
                'fetchTrades': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOrderBook': true,
                'fetchOpenOrders': false,
                'fetchClosedOrders': false,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '4h': '1hour',
                '1d': '1day',
            },
            'urls': {
                'logo': 'https://theme.zdassets.com/theme_assets/2289273/fdd2e3bf9e40a9751d199a337c48d8a48194ff7c.png',
                'api': 'https://a.yunex.io',
                'www': 'https://yunex.io/',
                'referral': 'https://yunex.io/user/register?inviter=16609',
                'doc': 'https://github.com/yunexio/openAPI',
                'fees': 'https://support.yunex.io/hc/en-us/articles/360003486391-Fees',
            },
            'api': {
                'public': {
                    'get': [
                        'api/v1/base/coins/tradepair',
                        'api/market/depth',
                        'api/market/trade/kline',
                        'api/market/trade/info',
                    ],
                },
                'private': {
                    'get': [
                        'api/v1/coin/balance',
                    ],
                    'post': [
                        'api/v1/order/buy',
                        'api/v1/order/sell',
                        'api/v1/order/cancel',
                        'api/v1/order/query',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
            'funding': {
                'tierBased': false,
                'percentage': false,
                'deposit': {},
                'withdraw': {
                    'BTC': 0.001,
                    'ETH': 0.01,
                    'BCH': 0.001,
                    'LTC': 0.01,
                    'ETC': 0.01,
                    'USDT': 2,
                    'SNET': 20,
                    'KT': 20,
                    'YUN': 20,
                    'Rating': 20,
                    'YBT': 20,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetApiV1BaseCoinsTradepair ();
        let data = response['data'];
        let result = [];
        for (let i = 0; i < data.length; i++) {
            let market = data[i];
            let id = market['symbol'];
            let symbol = market['name'];
            let base = symbol.split ('/')[0];
            let quote = symbol.split ('/')[1];
            let baseId = market['base_coin_id'];
            let quoteId = market['coin_id'];
            let active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
            'price': String (price),
            'volume': String (amount),
        };
        let response = '';
        if (side === 'buy') {
            response = await this.privatePostApiV1OrderBuy (this.extend (request, params));
        } else if (side === 'sell') {
            response = await this.privatePostApiV1OrderSell (this.extend (request, params));
        }
        let data = response['data'];
        return {
            'info': response,
            'id': this.safeString (data, 'order_id'),
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let _symbol = this.marketId (symbol);
        let request = {
            'symbol': _symbol,
            'order_id': id,
        };
        let response = await this.privatePostApiV1OrderQuery (this.extend (request, params));
        let order = this.parseOrder (response['data'], _symbol);
        return order;
    }

    parseSide (sideId) {
        if (sideId === 1) {
            return 'buy';
        } else if (sideId === 2) {
            return 'sell';
        } else {
            return undefined;
        }
    }

    parseOrder (order, symbol) {
        let id = this.safeString (order, 'order_id');
        let timestamp = this.safeFloat (order, 'timestamp');
        let sideId = this.safeInteger (order, 'type');
        let side = this.parseSide (sideId);
        let type = undefined;
        let price = this.safeFloat (order, 'price');
        let average = undefined;
        let amount = this.safeFloat (order, 'volume');
        let filled = this.safeFloat (order, 'trade_volume');
        let remaining = undefined;
        if (amount && filled) {
            remaining = amount - filled;
        }
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let cost = undefined;
        let fee = undefined;
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
        return result;
    }

    parseOrderStatus (status) {
        let statuses = {
            '1': 'open',
            '2': 'closed',
            '3': 'canceled',
            '4': 'lose',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'order_id': id,
        };
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        let results = await this.privatePostApiV1OrderCancel (this.extend (request, params));
        let success = results['ok'] === 1;
        let returnVal = { 'info': results, 'success': success };
        return returnVal;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let marketId = this.marketId (symbol);
        let request = {
            'symbol': marketId,
        };
        if (limit !== undefined) {
            request['level'] = limit;
        }
        let response = await this.publicGetApiMarketDepth (this.extend (request, params));
        let data = response['data'];
        let timestamp = undefined;
        let datetime = undefined;
        data['timestamp'] = timestamp;
        data['datetime'] = datetime;
        return data;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['ts'] * 1000,
            ohlcv['v'][0],
            ohlcv['v'][2],
            ohlcv['v'][3],
            ohlcv['v'][4],
            ohlcv['v'][5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 300, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        let response = await this.publicGetApiMarketTradeKline (this.extend (request, params));
        // return response
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let request = {
            'symbol': market['id'],
        };
        let response = await this.publicGetApiMarketTradeInfo (this.extend (request, params));
        let data = response['data'];
        let timestamp = this.safeInteger (data, 'ts');
        timestamp = timestamp * 1000;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (data, 'max_price'),
            'low': this.safeFloat (data, 'min_price'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeFloat (data, 'open_price'),
            'close': this.safeFloat (data, 'close_price'),
            'last': this.safeFloat (data, 'close_price'),
            'previousClose': undefined,
            'change': this.safeFloat (data, 'rate'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (data, 'volume'),
            'quoteVolume': undefined,
            'info': response,
        };
    }

    async fetchBalance () {
        let response = await this.privateGetApiV1CoinBalance ();
        let data = response['data']['coin'];
        let result = { 'info': response };
        for (let i = 0; i < data.length; i++) {
            let balance = data[i];
            let currency = balance['name'];
            let account = undefined;
            if (currency in result)
                account = result[currency];
            else
                account = this.account ();
            result[currency] = account;
            result[currency]['used'] = parseFloat (balance['freezed']);
            result[currency]['free'] = parseFloat (balance['usable']);
            result[currency]['total'] = parseFloat (balance['total']);
        }
        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            headers = {
                'Content-Type': 'application/json',
            };
        } else {
            this.checkRequiredCredentials ();
            let ts = this.seconds ();
            let nonce = Math.random ().toString (32).substr (2);
            headers = {
                'Content-Type': 'application/json',
                '-x-ts': ts,
                '-x-nonce': nonce,
                '-x-key': this.apiKey,
            };
            let str_parms = '';
            query = this.keysort (query);
            if (method === 'POST') {
                body = this.json (query);
                str_parms = body;
            }
            let sign_str = str_parms + ts + nonce + this.secret;
            let sign = this.hash (this.encode (sign_str), 'sha256');
            headers['-x-sign'] = sign;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
