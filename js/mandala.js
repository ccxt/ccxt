'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class mandala extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mandala',
            'name': 'Mandala',
            'countries': [ 'JP', 'MT' ], // Japan, Malta
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
                'fetchOrderBook': true,
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
                'logo': 'https://user-images.githubusercontent.com/44410798/105278730-53c15080-5b63-11eb-8c68-1b66b14af120.png',
                'api': {
                    'open': 'https://trade.mandala.exchange/open/v1',
                    'signed': 'https://trade.mandala.exchange/open/v1',
                    'binance': 'https://api.binance.com/api',
                },
                'www': 'https://www.mandala.exchange/',
                'referral': 'https://trade.mandala.exchange/account/signup?ref=4W82X4P3',
                'doc': [
                    'https://trade.mandala.exchange/apidocs/',
                ],
                'api_management': 'https://trade.mandala.exchange/usercenter/settings/api-management',
                'fees': 'https://support.mandala.exchange/hc/en-us/articles/360053314954-Fee-Schedule',
            },
            'api': {
                'open': {
                    'get': [
                        'common/time',
                        'common/symbols',
                        'market/depth',
                        'market/trades',
                        'market/agg-trade',
                    ],
                },
                'signed': {
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
                'binance': {
                    'get': [
                        'ping',
                        'v3/trades',
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
                    'taker': 0.001, // 0.1% trading fee
                    'maker': 0.001, // 0.1% trading fee
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
            'base': this.safeCurrencyCode (this.safeValue (market, 'baseAsset')),
            'quote': this.safeCurrencyCode (this.safeValue (market, 'quoteAsset')),
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

    convertTrade (symbol, trade) {
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'time') / 1000;
        const datetime = this.iso8601 (timestamp);
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'qty');
        const order = '';
        const type = 'limit';
        const side = 'buy';
        const cost = 0.00;
        let takerOrMaker = undefined;
        if (this.safeValue (trade, 'isBuyerMaker')) {
            takerOrMaker = 'maker';
        } else {
            takerOrMaker = 'taker';
        }
        const entry = {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
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
        const method = 'openGetMarketDepth';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        return this.parseOrderBook (response);
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
        return response;
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
        return response;
    }

    async fetchBalance (params = {}) {
        const method = 'signedGetAccountSpot';
        const response = await this[method] (params);
        return response;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        let method = 'binanceGetV3Trades';
        await this.loadMarkets ();
        let marketSymbol = this.markets[symbol]['id'];
        if (marketSymbol.indexOf ('MDX') >= 0) {
            method = 'openGetMarketTrades';
        } else {
            marketSymbol = marketSymbol.replace ('_', '');
        }
        const request = {
            'symbol': marketSymbol,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = await this[method] (this.extend (request, params));
        if (marketSymbol.indexOf ('MDX') >= 0) {
            response = this.safeValue (response.data, 'list');
        }
        const result = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.convertTrade (symbol, response[i]));
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired ('fetchMyTrades requires a symbol argument');
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
        const timestamp = this.safeTimestamp (entry, 'T');
        const datetime = this.iso8601 (timestamp);
        return {
            'tradeId': this.safeInteger (entry, 'a'),
            'price': this.safeFloat (entry, 'p'),
            'quantity': this.safeFloat (entry, 'q'),
            'firstTradeId': this.safeInteger (entry, 'f'),
            'lastTradeId': this.safeInteger (entry, 'l'),
            'timestamp': timestamp,
            'datetime': datetime,
            'maker': this.safeValue (entry, 'm'),
            'bestPriceMatch': this.safeValue (entry, 'M'),
        };
    }

    async fetchAggTrades (symbol, limit = undefined, params = {}) {
        const method = 'openGetMarketAggTrade';
        await this.loadMarkets ();
        const request = {
            'symbol': this.markets[symbol]['id'],
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
