'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gooplex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gooplex',
            'name': 'Gooplex',
            'countries': [ 'BR' ], // US
            'certified': false,
            'pro': false,
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchClosedOrders': 'emulated',
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': false,
                'fetchStatus': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'doc': 'https://www.gooplex.com.br/apidocs/#api-document-description',
                'fees': 'https://gooplex.zendesk.com/hc/pt/articles/360049326131-O-que-s%C3%A3o-taxas-de-negocia%C3%A7%C3%A3o-',
                'logo': 'https://user-images.githubusercontent.com/228850/93481157-a0a2cb00-f8d4-11ea-8608-d56dd916a9ed.jpg',
                'referral': 'https://www.gooplex.com.br/account/signup?ref=H8QQ57WT',
                'www': 'https://www.gooplex.com.br',
                // API
                'api': {
                    'open': 'https://www.gooplex.com.br/open/v1',
                    'signed': 'https://www.gooplex.com.br/open/v1',
                    'api': 'https://api.binance.com/api',
                },
            },
            'api': {
                'open': {               // public
                    'get': [
                        'common/time',
                        'common/symbols',
                    ],
                },
                'signed': {             // private
                    'get': [
                        'orders',
                        'orders/detail',
                        'orders/trades',
                        'account/spot',
                    ],
                    'post': [
                        'orders',
                        'orders/cancel',
                    ],
                },
                'api': {
                    'get': [
                        'v3/depth',
                        'v3/trades',
                        'v3/aggTrades',
                    ],
                },
            },
            'orderlimits': [
                5,
                10,
                20,
                50,
                100,
                500,
            ],
            'sides': {
                'BUY': 0,
                'SELL': 1,
            },
            'types': {
                'LIMIT': 1,
                'MARKET': 2,
                'STOP_LOSS': 3,
                'STOP_LOSS_LIMIT': 4,
                'TAKE_PROFIT': 5,
                'TAKE_PROFIT_LIMIT': 6,
                'LIMIT_MAKER': 7,
            },
            'fees': {
                'trading': {
                    'taker': 0.0022, // 0.22% trading fee
                    'maker': 0.0022, // 0.22% trading fee
                },
            },
        });
    }

    sign (path, api = 'open', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!(api in this.urls['api'])) {
            throw new NotSupported (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'signed') {
            this.checkRequiredCredentials ();
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            const recvWindow = this.safeInteger (this.options, 'recvWindow', 5000);
            let query = undefined;
            query = this.urlencodeWithArrayRepeat (this.extend ({
                'timestamp': this.nonce (),
                'recvWindow': recvWindow,
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&signature=' + signature;
            url += '?' + query;
        } else {
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchTime (params = {}) {
        const method = 'openGetCommonTime';
        const response = await this[method] (params);
        return this.safeInteger (response, 'timestamp');
    }

    getFees () {
        const feesKey = 'fees';
        const fees = this[feesKey];
        return this.safeValue (fees, 'trading');
    }

    convertSymbol (market) {
        const trading_fees = this.getFees ();
        const symbol = this.safeString (market, 'symbol');
        const id = symbol.replace ('_', '/');
        const id2 = symbol.replace ('_', '');
        const entry = {
            'id': symbol,
            'symbol': id,
            'symbol2': id2,
            'base': this.safeCurrencyCode (market, 'baseAsset'),
            'quote': this.safeCurrencyCode (market, 'quoteAsset'),
            'active': true,
            'taker': this.safeFloat (trading_fees, 'taker'),
            'maker': this.safeFloat (trading_fees, 'maker'),
            'percetage': true,
            'tierBase': false,
            'precision': {
                'price': this.safeInteger (market, 'quotePrecision'),
                'amount': this.safeInteger (market, 'basePrecision'),
                'cost': this.safeInteger (market, 'basePrecision'),
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': market,
        };
        return entry;
    }

    async fetchMarkets (params = {}) {
        const method = 'openGetCommonSymbols';
        const response = await this[method] (params);
        const data = this.safeValue (response, 'data');
        const markets = this.safeValue (data, 'list');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const entry = this.convertSymbol (market);
            result.push (entry);
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const method = 'apiGetV3Depth';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['symbol2'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        return response;                // map
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired ('fetchOrders requires a symbol argument');
        }
        const method = 'signedGetOrders';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        return response;                // map
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        let requestSide = undefined;
        let requestType = undefined;
        if (side in this.sides) {
            requestSide = this.sides[side];
        } else {
            throw new NotSupported ('Side ' + side + ' not supported');
        }
        if (type in this.types) {
            requestType = this.types[type];
        } else {
            throw new NotSupported ('Type ' + type + ' not supported.');
        }
        const method = 'signedPostOrders';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['id'],
            'side': requestSide,
            'type': requestType,
            'quantity': amount,
        };
        if (price !== undefined) {
            request['price'] = price;
        }
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const method = 'signedGetOrdersDetail';
        const request = {
            'orderId': id,
        };
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const method = 'signedPostOrdersCancel';
        const request = {
            'orderId': id,
        };
        const response = await this[method] (this.extend (request, params));
        return response;                        // map
    }

    async fetchBalance (params = {}) {
        const method = 'signedGetAccountSpot';
        const response = await this[method] (params);
        return response;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        const method = 'apiGetV3Trades';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['symbol2'],
        };
        if (since !== undefined) {
            request['fromId'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired ('fetchOrders requires a symbol argument');
        }
        const method = 'signedGetOrdersTrades';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        return response;
    }

    parseL2 (entry) {
        return {
            'tradeId': this.safeInteger (entry, 'a'),
            'price': this.safeFloat (entry, 'p'),
            'quantity': this.safeFloat (entry, 'q'),
            'firstTradeId': this.safeInteger (entry, 'f'),
            'lastTradeId': this.safeInteger (entry, 'l'),
            'timestamp': this.safeTimestamp (entry, 'T'),
            'maker': this.safeValue (entry, 'm'),
            'bestPriceMatch': this.safeValue (entry, 'M'),
        };
    }

    async fetchL2OrderBook (symbol, limit = undefined, params = {}) {
        const method = 'apiGetV3AggTrades';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['symbol2'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseL2 (response[i]));
        }
        return result;
    }
};

