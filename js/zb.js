'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class zb extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zb',
            'name': 'ZB',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                'CORS': false,
                'fetchOrder': true,
                'withdraw': true,
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
            'errors': {
                '1000': 'Successful operation',
                '1001': 'General error message',
                '1002': 'Internal error',
                '1003': 'Verification does not pass',
                '1004': 'Funding security password lock',
                '1005': 'Funds security password is incorrect, please confirm and re-enter.',
                '1006': 'Real-name certification pending approval or audit does not pass',
                '1009': 'This interface is under maintenance',
                '2001': 'Insufficient CNY Balance',
                '2002': 'Insufficient BTC Balance',
                '2003': 'Insufficient LTC Balance',
                '2005': 'Insufficient ETH Balance',
                '2006': 'Insufficient ETC Balance',
                '2007': 'Insufficient BTS Balance',
                '2009': 'Account balance is not enough',
                '3001': 'Pending orders not found',
                '3002': 'Invalid price',
                '3003': 'Invalid amount',
                '3004': 'User does not exist',
                '3005': 'Invalid parameter',
                '3006': 'Invalid IP or inconsistent with the bound IP',
                '3007': 'The request time has expired',
                '3008': 'Transaction records not found',
                '4001': 'API interface is locked or not enabled',
                '4002': 'Request too often',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg',
                'api': {
                    'public': 'http://api.zb.com/data', // no https for public API
                    'private': 'https://trade.zb.com/api',
                },
                'www': 'https://trade.zb.com/api',
                'doc': 'https://www.zb.com/i/developer',
                'fees': 'https://www.zb.com/i/rate',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'funding': {
                    'withdraw': {
                        'BTC': 0.0001,
                        'BCH': 0.0006,
                        'LTC': 0.005,
                        'ETH': 0.01,
                        'ETC': 0.01,
                        'BTS': 3,
                        'EOS': 1,
                        'QTUM': 0.01,
                        'HSR': 0.001,
                        'XRP': 0.1,
                        'USDT': '0.1%',
                        'QCASH': 5,
                        'DASH': 0.002,
                        'BCD': 0,
                        'UBTC': 0,
                        'SBTC': 0,
                        'INK': 20,
                        'TV': 0.1,
                        'BTH': 0,
                        'BCX': 0,
                        'LBTC': 0,
                        'CHAT': 20,
                        'bitCNY': 20,
                        'HLC': 20,
                        'BTP': 0,
                        'BCW': 0,
                    },
                },
                'trading': {
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarkets ();
        let keys = Object.keys (markets);
        let result = [];
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let market = markets[id];
            let [ baseId, quoteId ] = id.split ('_');
            let base = this.commonCurrencyCode (baseId.toUpperCase ());
            let quote = this.commonCurrencyCode (quoteId.toUpperCase ());
            let symbol = base + '/' + quote;
            let precision = {
                'amount': market['amountScale'],
                'price': market['priceScale'],
            };
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'lot': lot,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': 0,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetGetAccountInfo ();
        let balances = response['result'];
        let coins = balances['coins'];
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
            // let coinBalance = undefined;
            // for (let j = 0; i < coins.length; j++) {
            //     let coin = coins[j];
            //     coin['key'] = coin['key'].toUpperCase ();
            //     if (coin['key'] === 'BCC') {
            //---------------------------------------------------------------------
            // old code
            account['free'] = parseFloat (balance['available']);
            account['used'] = parseFloat (balance['freez']);
            // end of old code
            //---------------------------------------------------------------------
            //---------------------------------------------------------------------
            // new code
            let coinBalance = undefined;
            for (let j=0;i<balances.coins.length;j++) {
                let coin = balances.coins[j];
                coin['key'] = coin['key'].toUpperCase ();
                if (coin['key'] == 'BCC') {
                    coin['key'] = 'BCH';
                    coin['cnName'] = 'BCH';
                    coin['enName'] = 'BCH';
                    coin['unitTag'] = 'BCH';
                }
                if (coin['key'] === currency) {
                    coinBalance = coin;
                    break;
                }
            }
            account['free'] = parseFloat (coinBalance['available']);
            account['used'] = parseFloat (coinBalance['freez']);
            // end of new code
            //---------------------------------------------------------------------
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    getMarketFieldName () {
        return 'market';
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let orderbook = await this.publicGetDepth (this.extend (request, params));
        let timestamp = this.milliseconds ();
        let bids = undefined;
        let asks = undefined;
        if ('bids' in orderbook)
            bids = orderbook['bids'];
        if ('asks' in orderbook)
            asks = orderbook['asks'];
        let result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        if (result['bids'])
            result['bids'] = this.sortBy (result['bids'], 0, true);
        if (result['asks'])
            result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetTicker (this.extend (request, params));
        let ticker = response['ticker'];
        let timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['buy']),
            'ask': parseFloat (ticker['sell']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['vol']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (typeof limit === 'undefined')
            limit = 1000;
        let request = {
            'market': market['id'],
            'type': this.timeframes[timeframe],
            'limit': limit,
        };
        if (typeof since !== 'undefined')
            request['since'] = since;
        let response = await this.publicGetKline (this.extend (request, params));
        return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let side = (trade['trade_type'] === 'bid') ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': trade['tid'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let marketFieldName = this.getMarketFieldName ();
        let request = {};
        request[marketFieldName] = market['id'];
        let response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        // let order = {
        //     'price': price.toString (),
        //     'amount': amount.toString (),
        //     'tradeType': (side === 'buy') ? '1' : '0',
        //     'currency': this.marketId (symbol),
        // };
        // order = this.extend (order, params);
        // let response = await this.privateGetOrder (order);
        //---------------------------------------------------------------------
        // old code
        let paramString = '&price=' + price.toString ();
        paramString += '&amount=' + amount.toString ();
        let tradeType = (side === 'buy') ? '1' : '0';
        paramString += '&tradeType=' + tradeType;
        paramString += '&currency=' + this.marketId (symbol);
        let response = await this.privatePostOrder (paramString);
        // end of old code
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------
        // new code
        let order = {
            'price': price.toString (),
            'amount': amount.toString (),
            'tradeType': (side == 'buy') ? '1' : '0',
            'currency': this.marketId (symbol),
        };
        order = this.extend (order, params);
        let response = await this.privatePostOrder (order);
        // end of new code
        //---------------------------------------------------------------------
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        order = this.extend (order, params);
        return await this.privateGetCancelOrder (order);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'id': id.toString (),
            'currency': this.marketId (symbol),
        };
        order = this.extend (order, params);
        let response = await this.privateGetGetOrder (order);
        return this.parseOrder (response, undefined, true);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!symbol)
            throw new ExchangeError (this.id + 'fetchOrders requires a symbol parameter');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'currency': market['id'],
        };
        // pageIndex 页数 默认1; pageSize 每页数量 默认50
        let defaultParams = {
            'pageIndex': 1,
            'pageSize': 50,
        };
        // 默认请求方法，不分买卖类型 (default method GetOrdersIgnoreTradeType)
        let method = 'privateGetGetOrdersIgnoreTradeType';
        // 如果传入了status，则查未完成的订单；如果传入了tradeType，则查买单或者卖单(if status in parmas,change method to GetUnfinishedOrdersIgnoreTradeType); status === 1表示完成的订单,zb api不提供这样的查询.(status ===1 means get finished orders, the zb exchange did not support query finished orders )
        let hasStatus = ('status' in params);
        if (hasStatus && params['status'] === 0) {
            method = 'privateGetGetUnfinishedOrdersIgnoreTradeType';
            defaultParams['pageSize'] = 10; // fixed to 10
        } else if ('tradeType' in params) {
            method = 'privateGetGetOrdersNew';
            // tradeType 交易类型1/0[buy/sell]
            request['tradeType'] = params['tradeType'];
        }
        request = this.extend (request, defaultParams, params);
        let response = await this[method] (request);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let open = 0; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, undefined, undefined, this.extend ({
            'status': open,
        }, params));
    }

    parseOrder (order, market = undefined, isSingle = false) {
        let side = order['type'] === 1 ? 'buy' : 'sell';
        let type = 'limit'; // market order is not availalbe in ZB
        let timestamp = undefined;
        let createDateField = this.getCreateDateField ();
        if (createDateField in order)
            timestamp = order[createDateField];
        let symbol = undefined;
        if ('currency' in order) {
            // get symbol from currency
            market = this.marketsById[order['currency']];
        }
        if (market)
            symbol = market['symbol'];
        let price = order['price'];
        let average = order['trade_price'];
        let filled = order['trade_amount'];
        let amount = order['total_amount'];
        let remaining = amount - filled;
        let cost = order['trade_money'];
        let status = this.parseOrderStatus (order['status'], filled, isSingle);
        let result = {
            'info': order,
            'id': order['id'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    parseOrderStatus (status, filled, isSingle) {
        if (status === 1)
            return 'canceled';
        if (status === 3 && isSingle) {
            // when fetch single order detail, status == 3 means partial or open
            return filled === 0 ? 'open' : 'partial';
        }
        if (status === 3)
            return 'partial';
        if (status === 0)
            return 'open';
        if (status === 2)
            return 'closed';
        return status;
    }

    getCreateDateField () {
        return 'trade_date';
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            // let query = this.keysort (this.extend ({
            //     'method': path,
            //     'accesskey': this.apiKey,
            // }, params));
            // let nonce = this.nonce ();
            // query = this.keysort (query);
            // let auth = this.rawencode (query);
            //---------------------------------------------------------------------
            // old code
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let auth = 'accesskey=' + this.apiKey;
            auth += '&' + 'method=' + path;
            // end of old code
            //---------------------------------------------------------------------
            //---------------------------------------------------------------------
            // new code
            let query = this.keysort (this.extend ({
                'method': path,
                'accesskey': this.apiKey,
            }, params));
            let nonce = this.nonce ();
            query = this.keysort (query);
            let auth = this.rawencode (query);
            // end of new code
            //---------------------------------------------------------------------
            let secret = this.hash (this.encode (this.secret), 'sha1');
            let signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            let suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            // {"result":false,"message":}
            if ('result' in response) {
                let success = this.safeValue (response, 'result', false);
                if (typeof success === 'string') {
                    if ((success === 'true') || (success === '1'))
                        success = true;
                    else
                        success = false;
                }
                if (!success)
                    throw new ExchangeError (this.id + ' ' + this.json (response));
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        // if (api === 'private') {
        //     if ('code' in response) {
        //         let code = response['code'];
        //         if (this.errors[code]) {
        //             response['message'] = this.errors[code];
        //         }
        //         if (code !== 1000) {
        //             throw new ExchangeError (this.id + ' ' + this.json (response));
        //         }
        //     }
        // }
        //---------------------------------------------------------------------
        // old code
        if (api === 'private')
            if ('code' in response)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        // end of old code
        //---------------------------------------------------------------------
        //---------------------------------------------------------------------
        // new code
        if (api == 'private')
            if ('code' in response && response['code'] !== 1000)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        // end of new code
        //---------------------------------------------------------------------
        return response;
    }
};
