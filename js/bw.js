'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest, AuthenticationError, InvalidOrder, InsufficientFunds, RequestTimeout } = require ('./base/errors');
const { ROUND, DECIMAL_PLACES, NO_PADDING } = require ('./base/functions/number');

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
                'cancelOrder': false,
                'cancelOrders': false,
                'CORS': false,
                'createDepositAddress': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
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
                'fetchOrder': false,
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
                    'EOF': BadRequest,
                },
                'broad': {
                    'json: cannot unmarshal object into Go value of type': BadRequest,
                    'not allowed to cancel this order': BadRequest,
                    'request timed out': RequestTimeout,
                    'balance_freezing.freezing validation.balance_freeze': InsufficientFunds,
                    'order_creation.validation.validation': InvalidOrder,
                },
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/config/controller/website/marketcontroller/getByWebId',
                        'exchange/config/controller/website/currencycontroller/getCurrencyList',
                        'api/data/v1/entrusts',
                    ],
                },
                'private': {
                    'post': [
                        'exchange/fund/controller/website/fundcontroller/findbypage',
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
            let [ quote, base ] = name.split ('_');
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const baseId = this.safeString (market, 'buyerCurrencyId');
            const quoteId = this.safeString (market, 'sellerCurrencyId');
            const baseNumericId = parseInt (baseId);
            const quoteNumericId = parseInt (quoteId);
            const symbol = quote + '/' + base;
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
                        'min': parseFloat (this.safeInteger(currency, 'limitAmount')),
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
                        'max': parseFloat (this.safeInteger(currency, 'onceDrawLimit')),
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

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + path;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
            const ms = this.milliseconds ();
            const signing = this.apiKey + ms + body + this.secret;
            const hash = this.hash (signing, 'md5');
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
            return; // fallback to default error handler
        }
        const error = response['error'];
        if (error) {
            const feedback = this.id + ' ' + this.json (response);
            const exact = this.exceptions['exact'];
            if (error in exact) {
                throw new exact[error] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, error);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown error
        }
    }
};
