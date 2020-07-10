'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, RateLimitExceeded } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class coinjar extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinjar',
            'name': 'CoinJar Exchange',
            'countries': [ 'AU' ],
            'rateLimit': 1000, // 60 calls per minute
            'enableRateLimit': true,
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': true,
                'fetchMarkets': true,
                'fetchTicker': true,
            },
            'urls': {
                'api': {
                    'public': 'https://data.exchange.coinjar.com',
                    'private': 'https://api.exchange.coinjar.com'
                },
                'www': 'https://exchange.coinjar.com/',
                'doc': 'https://docs.exchange.coinjar.com/',
                'fees': 'https://support.coinjar.com/hc/en-us/articles/360000826626-CoinJar-Exchange-trading-rates',
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'token': true,
            },
            'api': {
                'public': {
                    'get': [
                        'products/{productId}/ticker',
                        'products/{productId}/trades',
                        'products/{productId}/book',
                        'products/{productId}/stats',
                    ],
                },
                'private': {
                    'get': [
                        'products',
                    ],
                    'post': [
                    ],
                    'put': [
                    ],
                    'delete': [
                    ],
                },
            },
            'exceptions': {
                'two_factor_required': AuthenticationError, // 402 When sending money over 2fa limit
                'param_required': ExchangeError, // 400 Missing parameter
                'validation_error': ExchangeError, // 400 Unable to validate POST/PUT
                'invalid_request': ExchangeError, // 400 Invalid request
                'personal_details_required': AuthenticationError, // 400 User’s personal detail required to complete this request
                'identity_verification_required': AuthenticationError, // 400 Identity verification is required to complete this request
                'jumio_verification_required': AuthenticationError, // 400 Document verification is required to complete this request
                'jumio_face_match_verification_required': AuthenticationError, // 400 Document verification including face match is required to complete this request
                'unverified_email': AuthenticationError, // 400 User has not verified their email
                'authentication_error': AuthenticationError, // 401 Invalid auth (generic)
                'invalid_token': AuthenticationError, // 401 Invalid Oauth token
                'revoked_token': AuthenticationError, // 401 Revoked Oauth token
                'expired_token': AuthenticationError, // 401 Expired Oauth token
                'invalid_scope': AuthenticationError, // 403 User hasn’t authenticated necessary scope
                'not_found': ExchangeError, // 404 Resource not found
                'rate_limit_exceeded': RateLimitExceeded, // 429 Rate limit exceeded
                'internal_server_error': ExchangeError, // 500 Internal server error
            },
            'options': {
                'fetchCurrencies': {
                    'expires': 5000,
                },
                'accounts': [
                    'wallet',
                    'fiat',
                ],
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.privateGetProducts (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = market['id'];
            const symbol = market['name'];
            const baseId = market['base_currency']['iso_code'];
            const base = this.safeCurrencyCode (baseId);
            const quoteId = market['counter_currency']['iso_code'];
            const quote = this.safeCurrencyCode (quoteId);
            const precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'info': market,
                'active': undefined,
                'limits': this.limits,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const timestamp = this.seconds ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': market['id'],
        }, params);
        const buy = await this.publicGetPricesSymbolBuy (request);
        const sell = await this.publicGetPricesSymbolSell (request);
        const spot = await this.publicGetPricesSymbolSpot (request);
        const ask = this.safeFloat (buy['data'], 'amount');
        const bid = this.safeFloat (sell['data'], 'amount');
        const last = this.safeFloat (spot['data'], 'amount');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': undefined,
            'low': undefined,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': {
                'buy': buy,
                'sell': sell,
                'spot': spot,
            },
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = {}, body = undefined) {
        const fullPath = '/' + this.implodeParams (path, params);
        const url = this.urls['api'][api] + fullPath;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            headers['Authorization'] = 'Token token="' + this.token + '"';
        }
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        if (method === 'POST') {
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // TODO: Handle error
        return; // fallback to default error handler
    }
};

