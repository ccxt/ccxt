"use strict";

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
            'hasCORS': false,
            'hasFetchOrder': true,
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
                    'post': [
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
                },
            },
        });
    }

    getTradingFeeFromBaseQuote (base, quote) {
        // base: quote
        let fees = {
            'BTC': { 'USDT': 0.0 },
            'BCH': { 'BTC': 0.001, 'USDT': 0.001 },
            'LTC': { 'BTC': 0.001, 'USDT': 0.0 },
            'ETH': { 'BTC': 0.001, 'USDT': 0.0 },
            'ETC': { 'BTC': 0.001, 'USDT': 0.0 },
            'BTS': { 'BTC': 0.001, 'USDT': 0.001 },
            'EOS': { 'BTC': 0.001, 'USDT': 0.001 },
            'HSR': { 'BTC': 0.001, 'USDT': 0.001 },
            'QTUM': { 'BTC': 0.001, 'USDT': 0.001 },
            'USDT': { 'BTC': 0.0 },
        };
        if (base in fees) {
            let quoteFees = fees[base];
            if (quote in quoteFees)
                return quoteFees[quote];
        }
        return undefined;
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
            let fee = this.getTradingFeeFromBaseQuote (base, quote);
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
                'info': market,
                'maker': fee,
                'taker': fee,
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
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostGetAccountInfo ();
        let balances = response['result'];
        let result = { 'info': balances };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let account = this.account ();
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
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    getMarketFieldName () {
        return 'market';
    }

    async fetchOrderBook (symbol, params = {}) {
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

    parseTrade (trade, market = undefined) {
        let timestamp = trade['date'] * 1000;
        let side = (trade['trade_type'] == 'bid') ? 'buy' : 'sell';
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
        let order = {
            price: price.toString (),
            amount: amount.toString (),
            tradeType: (side == 'buy') ? '1' : '0',
            currency: this.marketId (symbol),
        };
        order = this.extend (order, params);
        let response = await this.privatePostOrder (order);
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            id: id.toString (),
            currency: this.marketId (symbol),
        };
        order = this.extend (order, params);
        return await this.privatePostCancelOrder (order);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            id: id.toString (),
            currency: this.marketId (symbol),
        };
        order = this.extend (order, params);
        let response = await this.privatePostGetOrder (order);
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
        //pageIndex 页数 默认1; pageSize 每页数量 默认50
        let defaultParams = {
            pageIndex: 1,
            pageSize: 50,
        };
        //默认请求方法，不分买卖类型 (default method GetOrdersIgnoreTradeType)
        let method = 'privatePostGetOrdersIgnoreTradeType';
        //如果传入了status，则查未完成的订单；如果传入了tradeType，则查买单或者卖单(if status in parmas,change method to GetUnfinishedOrdersIgnoreTradeType); status === 1表示完成的订单,zb api不提供这样的查询.(status ===1 means get finished orders, the zb exchange did not support query finished orders )
        if ('status' in params && params['status']===0) {
            method = 'privatePostGetUnfinishedOrdersIgnoreTradeType';
            defaultParams['pageSize'] = 10;//fixed to 10
        } else if ('tradeType' in params) {
            method = 'privatePostGetOrdersNew';
            //tradeType 交易类型1/0[buy/sell]
            request['tradeType'] = params['tradeType'];
        }
        request = this.extend (request, defaultParams, params);
        let response = await this[method](request);
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let open = 0; // 0 for unfilled orders, 1 for filled orders
        return await this.fetchOrders (symbol, undefined, undefined, this.extend ( {
            'status': open,
        }, params));
    }

    parseOrder (order, market = undefined, isSingle = false) {
        let side = order['type'] == 1 ? 'buy' : 'sell';
        let type = 'limit';//market order is not availalbe in ZB
        let timestamp = undefined;
        let createDateField = this.getCreateDateField ();
        if (createDateField in order)
            timestamp = order[createDateField];
        let symbol = undefined;
        if ('currency' in order) {
            //get symbol from currency
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
        if (status == 1)
            return 'canceled';
        if (status == 3 && isSingle) {
            //when fetch single order detail, status == 3 means partial or open
            return filled == 0 ? 'open' : 'partial';
        }
        if (status == 3)
            return 'partial';
        if (status == 0)
            return 'open';
        if (status == 2)
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
        if (api == 'public') {
            url += '/' + this.version + '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let query = this.keysort (this.extend ( {
                'method': path,
                'accesskey': this.apiKey,
            }, params));
            let nonce = this.nonce ();
            query = this.keysort (query);
            let auth = this.rawencode (query);
            let secret = this.hash (this.encode (this.secret), 'sha1');
            let signature = this.hmac (this.encode (auth), this.encode (secret), 'md5');
            let suffix = 'sign=' + signature + '&reqTime=' + nonce.toString ();
            url += '/' + path + '?' + auth + '&' + suffix;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api == 'private')
            if ('code' in response && response['code'] !== 1000)
                throw new ExchangeError (this.id + ' ' + this.json (response));
        return response;
    }
};
