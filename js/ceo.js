'use strict';

//  ---------------------------------------------------------------------------

const zb = require ('./zb.js');
const { ExchangeError, AuthenticationError, ExchangeNotAvailable, InvalidOrder, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ceo extends zb {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ceo',
            'name': 'CEO',
            'has': {
                'withdraw': false,
            },
            'exceptions': {
                '1001': ExchangeError,
                '1002': ExchangeError,
                '1003': AuthenticationError,
                '1004': ExchangeNotAvailable,
                '1005': ExchangeNotAvailable,
                '1006': PermissionDenied,
                '1007': ExchangeError,
                '1008': AuthenticationError,
            },
            'urls': {
                'api': 'https://ceo.bi/api',
                'www': 'https://ceo.bi',
                'doc': 'https://ceo.bi/api/doc',
            },
            'api': {
                'public': {
                    'get': [
                        'market/markets',
                        'market/allTicker',
                        'market/ticker',
                        'market/entrust',
                        'market/trades',
                        'market/kline',
                    ],
                },
                'private': {
                    'get': [
                        'deal/accountInfo',
                        'deal/order',
                        'deal/cancelOrder',
                        'deal/getOrder',
                        'deal/getOrders',
                        'deal/getTrades',
                        'deal/getUserAddress',
                        'deal/getWithdrawAddress',
                        'deal/getWithdrawRecord',
                        'deal/getChargeRecord',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': undefined,
                    'maker': undefined,
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {},
        });
    }

    async publicGetMarkets () {
        let response = await this.publicGetMarketMarkets ();
        return response['data'];
    }

    async privateGetGetAccountInfo (params) {
        let response = await this.privateGetDealAccountInfo (params);
        response['result'] = response['data'];
        return response;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privateGetDealGetUserAddress ({
            'currency': currency['id'],
        });
        let data = response['data'];
        let tag = undefined;
        if (data['memo']) {
            tag = data['memo'];
        }
        return {
            'currency': code,
            'address': data['address'],
            'tag': tag,
            'info': response,
        };
    }

    async publicGetDepth (params) {
        let response = await this.publicGetMarketEntrust (params);
        return {
            'bids': response['data']['b'],
            'asks': response['data']['s'],
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarketAllTicker (params);
        let result = {};
        let ids = Object.keys (response['data']);
        for (let i = 0; i < ids.length; i++) {
            let market = this.marketsById[ids[i]];
            result[market['symbol']] = this.parseTicker (response['data'][ids[i]], market);
        }
        return result;
    }

    async publicGetTicker (params) {
        let response = await this.publicGetMarketTicker (params);
        response['ticker'] = response['data'];
        return response;
    }

    parseTicker (ticker, market = undefined) {
        if (ticker['sell'] === '0.00000000') {
            ticker['sell'] = undefined;
        }
        return super.parseTicker (ticker, market);
    }

    async publicGetKline (params) {
        let response = await this.publicGetMarketKline (this.extend (params));
        let klines = this.safeValue (response['data'], 'data', []);
        let data = [];
        for (let i = 0; i < klines.length; i++) {
            let kline = [
                klines[i][0],
                klines[i][2],
                klines[i][3],
                klines[i][4],
                klines[i][5],
                klines[i][1],
            ];
            data.push (kline);
        }
        response['data'] = data;
        return response;
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['time'] * 1000;
        let side = (trade['type'] === 1) ? 'buy' : 'sell';
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async publicGetTrades (params) {
        let response = await this.publicGetMarketTrades (params);
        return response['data'];
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new InvalidOrder (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let order = {
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
            'tradeType': (side === 'buy') ? '1' : '2',
            'currency': this.marketId (symbol),
        };
        let response = await this.privateGetDealOrder (this.extend (order, params));
        return {
            'info': response['data'],
            'id': response['data']['orderId'],
        };
    }

    async privateGetCancelOrder (params) {
        return await this.privateGetDealCancelOrder (params);
    }

    async privateGetGetOrder (params) {
        let response = await this.privateGetDealGetOrder (params);
        return response['data'];
    }

    async privateGetGetOrdersIgnoreTradeType (params) {
        return await this.privateGetGetOrdersNew (params);
    }

    async privateGetGetUnfinishedOrdersIgnoreTradeType (params) {
        return await this.privateGetGetOrdersNew (this.deepExtend ({ 'tradeStatus': 1 }, params));
    }

    async privateGetGetOrdersNew (params) {
        let response = await this.privateGetDealGetOrders (params);
        return response['data'];
    }

    parseOrder (order, market = undefined) {
        let createDateField = this.getCreateDateField ();
        if (createDateField in order) {
            order[createDateField] = order[createDateField] * 1000;
        }
        let createTimeField = this.getCreateTimeField ();
        if (createTimeField in order)
            order[createDateField] = order[createTimeField] * 1000;
        return super.parseOrder (order, market);
    }

    getCreateTimeField () {
        return 'trade_time';
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'closed',
            '2': 'canceled',
            '3': 'open',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        if (api === 'public') {
            url += '/' + path;
            if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            let query = this.keysort (this.extend ({
                'method': path.split ('/')[1],
                'accesskey': this.apiKey,
                'reqTime': this.nonce ().toString (),
            }, params));
            query = this.rawencode (query);
            let signature = this.hmac (query, this.secret, 'md5');
            url += '/' + path + '?' + query + '&sign=' + signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return;
        if (body.length < 2)
            return;
        if (body[0] === '{') {
            let feedback = this.id + ' ' + this.json (response);
            if ('code' in response) {
                let code = this.safeString (response, 'code');
                if (code in this.exceptions) {
                    let ExceptionClass = this.exceptions[code];
                    throw new ExceptionClass (feedback);
                } else if (code !== '1000') {
                    throw new ExchangeError (feedback);
                }
            }
            let result = this.safeValue (response, 'data');
            if (result !== undefined) {
                if (!result) {
                    let message = this.safeString (response, 'message');
                    if (message === '撤销成功') {
                        return;
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
