/* eslint-disable no-restricted-syntax */
'use strict';

const axios = require ('axios');

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
// const { ExchangeError, ArgumentsRequired, NotSupported, AuthenticationError, InsufficientFunds, OrderNotFound, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitbnsexchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitbns',
            'name': 'BitBns Exchange',
            'countries': ['IN'],
            'version': '1.0',
            'has': {
                // 'CORS': false,
                'fetchCurrencies': false,
                'fetchTicker': false, // Can be emulated on fetchTickers if necessary
                'fetchTickers': false,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchBalance': false,
                'createOrder': false,
                'cancelOrder': false,
                'fetchOpenOrders': false,
                'fetchMyTrades': false,
                'fetchDepositAddress': false,
                'fetchWithdrawals': false,
                'fetchDeposits': false,
                'fetchClosedOrders': false,
                'fetchL2OrderBook': false,
                'fetchOHLCV': 'emulated',
                'fetchOrder': false,
                'editOrder': false,
                'fetchTransactions': false,
                'fetchLedger': false,
                'withdraw': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
            },
            'urls': {
                'logo': 'https://bitbns.com/assets/img/logos/bitbns.svg',
                'api': {
                    'public': 'https://c086dmj6f2.execute-api.ap-south-1.amazonaws.com/dev/',
                    'private': 'https://api.bitbns.com/api/trade/v2',
                },
                'www': 'https://bitbns.com/',
                'doc': 'https://github.com/bitbns-official/node-bitbns-api',
                'fees': 'https://bitbns.com/fees/',
            },
            'api': {
                // All methods are passed in as query params
                'public': {
                    'get': [
                        'fetchOrderBook',
                        'fetchMarkets',
                        'fetchTickers',
                        'fetchTrades',
                    ] },
                'private': { 'post': [
                    'orders',
                    'cancel',
                ] },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0025,
                    'taker': 0.0025,
                },
            },
            'verbose': false,
            'proxy': '',
            'apiKey': '***REMOVED***',
            'secret': '***REMOVED***',
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // Dev Logging
        // console.log ({path,api});
        // console.log(this.urls)
        // console.log("Implode:", this.implodeParams (path, params));
        // console.log("Extract:", this.extractParams (path));
        // console.log("Encode:", this.encode({
        //     "a": "abc",
        // }));
        console.log("Body: ", body);
        
        let url = '';
        if (api === 'private') {
            console.log("Signing Privately !!!");
            
            // Generate payload
            const timeStamp_nonce = Date.now ().toString ();
            const data = {
                'symbol': this.implodeParams (path, params),
                'timeStamp_nonce': timeStamp_nonce,
                'body': body,
            };
            const payload = this.stringToBase64 (JSON.stringify (data));
            // Generate signature from payload
            const signature = this.hmac (payload, this.secret, 'sha512', 'hex');
            // Generate complete url
            url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
            console.log(method,url);
            
            // Init headers
            headers = {};
            // Attach headers
            headers['X-BITBNS-APIKEY'] = this.apiKey;
            headers['X-BITBNS-PAYLOAD'] = payload;
            headers['X-BITBNS-SIGNATURE'] = signature;
        } else {
            url = this.urls['api'][api] + path;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
            console.log(url);
        }
        console.log({ 'url': url, 'method': method, 'body': body, 'headers': headers });
        
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchMarkets (params = {}) {
        const data = await this.publicGetFetchMarkets ();
        // console.log(data);
        return data;
    }

    // Emulated using fetchTickers
    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ();
        return this.safeValue (tickers, symbol);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        // console.log(this.symbols);
        const tickers = await this.publicGetFetchTickers ();
        return tickers;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        // const data = bitbns
        await this.loadMarkets ();
        const market = this.market (symbol);
        const excgSymbol = market['id'];
        const request = {
            'symbol': excgSymbol,
            'since': since,
            'limit': limit,
        };
        const trades = await this.publicGetFetchTrades (this.extend (request, params));
        for (let i = 0; i < trades.length; i++) {
            trades[i].symbol = symbol;
        }
        return trades;
    }

    async fetchOrderBook (symbol = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const excgSymbol = market['id'];
        const request = {
            'symbol': excgSymbol,
            'limit': limit,
        };
        const ob = await this.publicGetFetchOrderBook (this.extend (request, params));
        return ob;
    }

    // =================
    // PRIVATE ENDPOINTS
    // =================

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'side': side.toUpperCase (),
            'quantity': amount,
            'rate': price,
        };
        
        
        const splitSymbol = symbol.split ('/');
        if (splitSymbol[1] === 'USDT') {
            request['symbol'] = splitSymbol[0] + '_' + splitSymbol[1];
        }
        console.log(request);
        // return request;
        const resp = await this.privatePostOrders (this.extend (request, params));
        return {
            'info': resp,
            'id': this.safeString (resp, 'id'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tradingSymbol = market['id'];
        const request = {
            'symbol': tradingSymbol,
            'entry_id': id,
        };
        const splitSymbol = symbol.split ('/');
        if (splitSymbol[1] === 'USDT') {
            request['symbol'] = splitSymbol[0] + '_' + splitSymbol[1];
        }
        if (splitSymbol[1] === 'USDT') {
            request['side'] = 'usdtcancelOrder';
        } else {
            request['side'] = 'cancelOrder';
        }
        const resp = await this.privatePostCancel (this.extend (request, params));
    }
};
