'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, BadRequest, ExchangeNotAvailable, PermissionDenied } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

// ----------------------------------------------------------------------------

module.exports = class coinbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbaseexchange',
            'name': 'Coinbase Exchange',
            'countries': [ 'US' ],
            'rateLimit': 40, // 25/s
            'version': 'v1',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'createReduceOnlyOrder': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedPositions': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'api': {
                    'rest': 'https://api.exchange.coinbase.com',
                    'testnet': 'https://api-public.sandbox.exchange.coinbase.com',
                },
                'www': 'https://www.coinbase.com',
                'doc': 'https://docs.cloud.coinbase.com/exchange/reference',
                'fees': 'https://www.coinbase.com/advanced-fees',
                'referral': '', // TODO
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': {
                        'accounts/{account_id}/holds': 2.5,
                        'accounts/{account_id}/transfers': 2.5,
                        'address-book': 2.5,
                        'coinbase-accounts': 2.5,
                        'conversions/{conversion_id}': 2.5,
                        'currencies/{currency_id}': 2.5,
                        'currencies': 2.5,
                        'payment-methods': 2.5,
                        'products': 2.5,
                        'products/{product_id}': 2.5,
                        'products/{product_id}/book': 2.5,
                        'products/{product_id}/candles': 2.5,
                        'products/{product_id}/stats': 2.5,
                        'products/{product_id}/ticker': 2.5,
                        'products/{product_id}/trades': 2.5,
                        'users/{user_id}/exchange-limits': 2.5,
                        'wrapped-assets': 2.5,
                        'wrapped-assets/{wrapped_asset_id}/conversion-rate': 25,
                    },
                    'post': {},
                    'put': {},
                    'delete': {},
                },
                'private': {
                    'get': {
                        'accounts': 1, // up to 50/s in bursts
                        'accounts/{account_id}': 1.6666,
                        'accounts/{account_id}/ledger': 1.6666,
                        'coinbase-accounts/{account_id}/addresses': 1.6666,
                        'payment-methods': 1.6666,
                        'transfers': 1.6666,
                        'transfers/{transfer_id}': 1.6666,
                        'withdrawals/fee-estimate': 1.6666,
                        'fees': 1.6666,
                        'fills': 2.5,
                        'orders': 1.6666,
                        'orders/{order_id}': 1.6666,
                        'oracle': 1.6666,
                        'profiles': 1.6666,
                        'profiles/{profile_id}': 1.6666,
                        'reports': 1.6666,
                        'reports/{report_id}': 1.6666,
                    },
                    'post': {
                        'conversions': 1.6666,
                        'deposits/coinbase-account': 1.6666,
                        'deposits/payment-method': 1.6666,
                        'withdrawals/coinbase-account': 1.6666,
                        'withdrawals/crypto': 1.6666,
                        'withdrawals/payment-method': 1.6666,
                        'orders': 1.6666,
                        'profiles': 1.6666,
                        'profiles/transfer': 1.6666,
                        'reports': 1.6666,
                    },
                    'put': {
                        'profiles/{profile_id}': 1.6666,
                        'profiles/{profile_id}/deactivate': 1.6666,
                    },
                    'delete': {
                        'orders': 1.6666,
                        'orders/{order_id}': 1.6666,
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '401': AuthenticationError,
                    '403': PermissionDenied,
                    '500': ExchangeNotAvailable,
                },
                'broad': {},
            },
            'commonCurrencies': {
                // TODO
            },
            'options': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        return {};
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let fullPath = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api']['rest'] + fullPath;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const auth = nonce + method + fullPath + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const feedback = this.id + ' ' + body;
        //
        //    {"error": "invalid_request", "error_description": "The request is missing a required parameter, includes an unsupported parameter value, or is otherwise malformed."}
        //
        // or
        //
        //    {
        //      "errors": [
        //        {
        //          "id": "not_found",
        //          "message": "Not found"
        //        }
        //      ]
        //    }
        //
        let errorCode = this.safeString (response, 'error');
        if (errorCode !== undefined) {
            const errorMessage = this.safeString (response, 'error_description');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback);
        }
        const errors = this.safeValue (response, 'errors');
        if (errors !== undefined) {
            if (Array.isArray (errors)) {
                const numErrors = errors.length;
                if (numErrors > 0) {
                    errorCode = this.safeString (errors[0], 'id');
                    const errorMessage = this.safeString (errors[0], 'message');
                    if (errorCode !== undefined) {
                        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                        this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
        const data = this.safeValue (response, 'data');
        if (data === undefined) {
            throw new ExchangeError (this.id + ' failed due to a malformed response ' + this.json (response));
        }
    }
};
