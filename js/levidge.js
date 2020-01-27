'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, InvalidAddress } = require ('./base/errors');
const { ROUND } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class levidge extends Exchange {
   
	describe () {
        return this.deepExtend (super.describe (), {
            'id': 'levidge',
            'name': 'Levidge',
            'countries': [ 'US'], // USA
            'rateLimit': 500,
            'certified': false,
            // new metainfo interface
            'has': {
                'fetchDepositAddress': false,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchOHLCV': true,
                'fetchMyTrades': false,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': false,
                'fetchClosedOrders': 'emulated',
                'withdraw': false,
                'fetchFundingFees': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchTransactions': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'public': 'https://levidge.com/api',
                    },
                'www': 'https://levidge.com',
                'doc': [
                    'https://levidge.com/api-doc/en.html#introduction',
                ],
            },
            'api': {
            	'fpublic': {
                    'get': [
                        'Instruments',
                        'InstrumentPairs',
                        'OrderBook',
                        'TradeHistory',
                        'Chart',
                        ],
                },
                'public': {
                    'get': [
                        'Instruments',
                        'InstrumentPairs',
                        'OrderBook',
                        'TradeHistory',
                        'Chart',
                        ],
                },
                },
            // exchange-specific options
            'exceptions': {
                'API key does not exist': AuthenticationError,
                'Order would trigger immediately.': InvalidOrder,
                'Account has insufficient balance for requested action.': InsufficientFunds,
                'Rest API trading is not enabled.': ExchangeNotAvailable,
                '-1000': ExchangeNotAvailable, // {"code":-1000,"msg":"An unknown error occured while processing the request."}
                '-1013': InvalidOrder, // createOrder -> 'invalid quantity'/'invalid price'/MIN_NOTIONAL
                '-1021': InvalidNonce, // 'your time is ahead of server'
                '-1022': AuthenticationError, // {"code":-1022,"msg":"Signature for this request is not valid."}
                '-1100': InvalidOrder, // createOrder(symbol, 1, asdf) -> 'Illegal characters found in parameter 'price'
                '-1104': ExchangeError, // Not all sent parameters were read, read 8 parameters but was sent 9
                '-1128': ExchangeError, // {"code":-1128,"msg":"Combination of optional parameters invalid."}
                '-2010': ExchangeError, // generic error code for createOrder -> 'Account has insufficient balance for requested action.', {"code":-2010,"msg":"Rest API trading is not enabled."}, etc...
                '-2011': OrderNotFound, // cancelOrder(1, 'BTC/USDT') -> 'UNKNOWN_ORDER'
                '-2013': OrderNotFound, // fetchOrder (1, 'BTC/USDT') -> 'Order does not exist'
                '-2014': AuthenticationError, // { "code":-2014, "msg": "API-key format invalid." }
                '-2015': AuthenticationError, // "Invalid API-key, IP, or permissions for action."
            },
        });
    }

    async fetchInstruments (params = {}) 
    {
    	const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGetInstruments' : 'fpublicGetInstruments';
        const response = await this[method] (params);
        return response;

    }

    async fetchInstrumentPairs (params = {}) 
    {
    	const defaultType = this.safeString2 (this.options, 'fetchTickers', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGetInstrumentPairs' : 'fpublicGetInstrumentPairs';
        const response = await this[method] (params);
        return response;
    }

    async fetchOrderBookSnap(id, params = {})
    {
    	console.log(id);
    	const request = {
            'pairId': id,
        };
    	const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGetOrderBook' : 'fpublicGetOrderBook';
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchTradeHistory(id, params = {})
    {
    	console.log(id);
    	const request = {
            'pairId': id,
        };
    	const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGet' : 'fpublicGet';
        const response = await this[method] (this.extend (request, params));
        return response;
    }


    async fetchChart(id,timestamp, params = {})
    {
        console.log(timestamp);
        const request = {
            'pairId': id,
            'timespan':timestamp,
        };
        const defaultType = this.safeString2 (this.options, 'fetchOrder', 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        const query = this.omit (params, 'type');
        const method = (type === 'spot') ? 'publicGetChart' : 'fpublicGetChart';
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) 
    {
        let url = this.urls['api'][api];
        path = 'get' + path;
        // console.log(path);
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
        const userDataStream = ((path === 'userDataStream') || (path === 'listenKey'));
        if (path === 'historicalTrades') {
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
        } else if (userDataStream) {
            // v1 special case for userDataStream
            body = this.urlencode (params);
            headers = {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        if ((api === 'private') || (api === 'sapi') || (api === 'wapi' && path !== 'systemStatus') || (api === 'fapiPrivate')) {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': this.options['recvWindow'],
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
            	// console.log("test" + query);
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            // userDataStream endpoints are public, but POST, PUT, DELETE
            // therefore they don't accept URL query arguments
            // https://github.com/ccxt/ccxt/issues/5224
            if (!userDataStream) {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        // console.log(url);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }



};
