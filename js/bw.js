'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, ArgumentsRequired } = require ('./base/errors');
const { DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bw extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bw',
            'name': 'bw.com',
            'countries': [ 'CN' ],
            'rateLimit': 1500,
            'version': 'v1',
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'createOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': false,
                'publicAPI': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1M',
                '5m': '5M',
                '15m': '15M',
                '30m': '30M',
                '1h': '1H',
                '1w': '1W',
            },
            'urls': {
                'api': 'https://www.bw.com/',
                'www': 'https://www.bw.com',
                'doc': 'https://www.bw.com/restApi',
                'fees': 'https://www.bw.com/feesRate',
                'referral': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0.1 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.1 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                        ],
                    },
                },
                'funding': {
                },
            },
            'exceptions': {
                // TODO
                'exact': {
                    '999': AuthenticationError,
                },
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/config/controller/website/marketcontroller/getByWebId',
                        'exchange/config/controller/website/currencycontroller/getCurrencyList',
                        'api/data/v1/entrusts',
                        'api/data/v1/klines',
                    ],
                },
                'private': {
                    'get': [
                        'exchange/entrust/controller/website/EntrustController/getEntrustById',
                    ],
                    'post': [
                        'exchange/fund/controller/website/fundcontroller/findbypage',
                        'exchange/entrust/controller/website/EntrustController/addEntrust',
                        'exchange/entrust/controller/website/EntrustController/cancelEntrust',
                    ],
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeConfigControllerWebsiteMarketcontrollerGetByWebId (params);
        const markets = this.safeValue (response, 'datas', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'marketId');
            const numericId = parseInt (id);
            const name = this.safeStringUpper (market, 'name');
            let [ base, quote ] = name.split ('_');
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const baseId = this.safeString (market, 'sellerCurrencyId');
            const quoteId = this.safeString (market, 'buyerCurrencyId');
            const baseNumericId = parseInt (baseId);
            const quoteNumericId = parseInt (quoteId);
            const symbol = base + '/' + quote;
            const state = this.safeInteger (market, 'state');
            const active = state === 1;
            result.push ({
                'id': id,
                'active': active,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'baseNumericId': baseNumericId,
                'quoteNumericId': quoteNumericId,
                'info': market,
                'precision': {
                    'amount': this.safeInteger (market, 'amountDecimal'),
                    'price': this.safeInteger (market, 'priceDecimal'),
                },
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minAmount'),
                        'max': undefined,
                    },
                    'price': {
                        'min': 0,
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

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetExchangeConfigControllerWebsiteCurrencycontrollerGetCurrencyList (params);
        const currencies = this.safeValue (response, 'datas', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currencyId');
            const code = this.safeCurrencyCode (this.safeStringUpper (currency, 'name'));
            const state = this.safeInteger (currency, 'state');
            const active = state === 1;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': parseFloat (this.safeInteger (currency, 'limitAmount', 0)),
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
                    'withdraw': {
                        'min': undefined,
                        'max': parseFloat (this.safeInteger (currency, 'onceDrawLimit')),
                    },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
        };
        if (limit !== undefined) {
            request['dataSize'] = limit;
        }
        const response = await this.publicGetApiDataV1Entrusts (this.extend (request, params));
        const orderbook = this.safeValue (response, 'datas', []);
        const ts = this.safeTimestamp (orderbook, 'timestamp');
        return this.parseOrderBook (orderbook, ts, 'bids', 'asks', 0, 1);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostExchangeFundControllerWebsiteFundcontrollerFindbypage (params);
        const data = this.safeValue (response, 'datas', {});
        const balances = this.safeValue (data, 'list', []);
        const result = { 'info': response };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let symbol = this.safeInteger (balance, 'currencyTypeId');
            if (symbol in this.currencies_by_id) {
                symbol = this.currencies_by_id[symbol]['code'];
            }
            const account = this.account ();
            const amount = this.safeFloat (balance, 'amount');
            account['free'] = amount;
            account['total'] = amount;
            account['used'] = 0;
            result[symbol] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (price === undefined) {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'type': 0, // sell
            'rangeType': 0, // limit order
            'marketId': market['id'],
        };
        if (side.toLowerCase () === 'buy') {
            request['type'] = 1; // buy
        }
        const response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerAddEntrust (this.extend (request, params));
        const data = this.safeValue (response, 'datas');
        return {
            'id': this.safeString (data, 'entrustId'),
            'info': response,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '-2': 'canceled',
            '-1': 'canceled',
            '0': 'open',
            '1': 'canceled',
            '2': 'closed',
            '3': 'open',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const marketId = this.safeString (order, 'marketId');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        const timestamp = this.safeInteger (order, 'createTime');
        let side = undefined;
        const orderSide = this.safeInteger (order, 'type');
        if (orderSide === 0) {
            side = 'sell';
        } else if (orderSide === 1) {
            side = 'buy';
        }
        const amount = this.safeFloat (order, 'amount');
        const price = this.safeFloat (order, 'price');
        const filled = this.safeFloat (order, 'completeAmount');
        const status = this.parseOrderStatus (this.safeInteger (order, 'status', '').toString ());
        return {
            'info': order,
            'id': this.safeString (order, 'entrustId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': amount - filled,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'entrustId': id,
        };
        const response = await this.privateGetExchangeEntrustControllerWebsiteEntrustControllerGetEntrustById (this.extend (request, params));
        const order = this.safeValue (response, 'datas', {});
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'entrustId': id,
        };
        const response = await this.privatePostExchangeEntrustControllerWebsiteEntrustControllerCancelEntrust (this.extend (request, params));
        return {
            'info': response,
            'id': id,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeTimestamp (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
            this.safeFloat (ohlcv, 6),
            this.safeFloat (ohlcv, 7),
            this.safeFloat (ohlcv, 8),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketId': market['id'],
            'type': this.timeframes[timeframe],
            'dataSize': 500,
        };
        if (limit !== undefined) {
            request['dataSize'] = limit;
        }
        const response = await this.publicGetApiDataV1Klines (this.extend (request, params));
        const data = this.safeValue (response, 'datas', []);
        const ohlcvs = this.parseOHLCVs (data, market, timeframe, since, limit);
        return this.sortBy (ohlcvs, 0);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
        }
        if (api === 'private') {
            const ms = this.milliseconds ().toString ();
            let content = '';
            if (method === 'GET') {
                const sortedParams = this.keysort (params);
                const keys = Object.keys (sortedParams);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    content += key + sortedParams[key];
                }
            } else {
                content = body;
            }
            const signing = this.apiKey + ms + content + this.secret;
            const hash = this.hash (this.encode (signing), 'md5');
            if (!headers) {
                headers = {};
            }
            headers['Apiid'] = this.apiKey;
            headers['Timestamp'] = ms;
            headers['Sign'] = hash;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return; // default error handler
        }
        const resMsg = this.safeValue (response, 'resMsg');
        const errorCode = this.safeString (resMsg, 'code');
        if (errorCode !== '1') {
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (errorCode in exact) {
                throw new exact[errorCode] (feedback);
            }
            throw new ExchangeError (feedback); // unknown error
        }
    }
};
