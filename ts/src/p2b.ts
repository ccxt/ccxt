
// ---------------------------------------------------------------------------

import Exchange from './abstract/p2b.js';
import { InsufficientFunds, NotSupported, AuthenticationError, BadRequest, ExchangeNotAvailable } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { sha384 } from './static_dependencies/noble-hashes/sha512.js';

// ---------------------------------------------------------------------------

/**
 * @class p2b
 * @extends Exchange
 */
export default class p2b extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'p2b',
            'name': 'p2b',
            'countries': [ 'UA' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchL3OrderBook': true,
                'fetchLeverage': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setPositionMode': false,
            },
            'timeframes': undefined,
            'urls': {
                'extension': '.json',
                'referral': '',  // TODO
                'logo': 'https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg',
                'api': {
                    'public': ' https://api.p2pb2b.com/api/v2/public',
                    'private': ' https://api.p2pb2b.com/api/v2',
                },
                'www': 'https://p2pb2b.com/',
                'doc': 'https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md',
                'fees': 'https://p2pb2b.com/fee-schedule/',
            },
            'api': {
                'get': [
                    'markets',
                    'market',
                    'tickers',
                    'ticker',
                    'book',
                    'history',
                    'depth/result',
                    'market/kline',
                ],
                'post': [
                    'account/balances',
                    'account/balance',
                    'order/new',
                    'order/cancel',
                    'orders',
                    'account/market_order_history',
                    'account/market_deal_history',
                    'account/order',
                    'account/order_history',
                    'account/executed_history',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': [
                        [ this.parseNumber ('0'), this.parseNumber ('0.2') ],
                        [ this.parseNumber ('1'), this.parseNumber ('0.19') ],
                        [ this.parseNumber ('5'), this.parseNumber ('0.18') ],
                        [ this.parseNumber ('10'), this.parseNumber ('0.17') ],
                        [ this.parseNumber ('25'), this.parseNumber ('0.16') ],
                        [ this.parseNumber ('75'), this.parseNumber ('0.15') ],
                        [ this.parseNumber ('100'), this.parseNumber ('0.14') ],
                        [ this.parseNumber ('150'), this.parseNumber ('0.13') ],
                        [ this.parseNumber ('300'), this.parseNumber ('0.12') ],
                        [ this.parseNumber ('450'), this.parseNumber ('0.11') ],
                        [ this.parseNumber ('500'), this.parseNumber ('0.1') ],
                    ],
                    'maker': [
                        [ this.parseNumber ('0'), this.parseNumber ('0.2') ],
                        [ this.parseNumber ('1'), this.parseNumber ('0.18') ],
                        [ this.parseNumber ('5'), this.parseNumber ('0.16') ],
                        [ this.parseNumber ('10'), this.parseNumber ('0.14') ],
                        [ this.parseNumber ('25'), this.parseNumber ('0.12') ],
                        [ this.parseNumber ('75'), this.parseNumber ('0.1') ],
                        [ this.parseNumber ('100'), this.parseNumber ('0.08') ],
                        [ this.parseNumber ('150'), this.parseNumber ('0.06') ],
                        [ this.parseNumber ('300'), this.parseNumber ('0.04') ],
                        [ this.parseNumber ('450'), this.parseNumber ('0.02') ],
                        [ this.parseNumber ('500'), this.parseNumber ('0.01') ],
                    ],
                },
                'funding': {
                    'withdraw': {
                    },
                    'deposit': {
                    },
                },
            },
            'commonCurrencies': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '1001': AuthenticationError,    // Key not provided. X-TXC-APIKEY header is missing in the request or empty.
                '1002': AuthenticationError,    // Payload not provided. X-TXC-PAYLOAD header is missing in the request or empty.
                '1003': AuthenticationError,    // Signature not provided. X-TXC-SIGNATURE header is missing in the request or empty.
                '1004': AuthenticationError,    // Nonce and url not provided. Request body is empty. Missing required parameters "request", "nonce".
                '1005': AuthenticationError,    // Invalid body data. Invalid request body
                '1006': AuthenticationError,    // Nonce not provided. Request body missing required parameter "nonce".
                '1007': AuthenticationError,    // Request not provided. Request body missing required parameter "request".
                '1008': AuthenticationError,    // Invalid request in body. The passed request parameter does not match the URL of this request.
                '1009': AuthenticationError,    // Invalid payload. The transmitted payload value (X-TXC-PAYLOAD header) does not match the request body.
                '1010': AuthenticationError,    // This action is unauthorized. - API key passed in the X-TXC-APIKEY header does not exist. - Access to API is not activated. Go to profile and activate access.
                '1011': AuthenticationError,    // This action is unauthorized. Please, enable two-factor authentication. 	Two-factor authentication is not activated for the user.
                '1012': AuthenticationError,    // Invalid nonce. Parameter "nonce" is not a number.
                '1013': AuthenticationError,    // Too many requests. - A request came with a repeated value of nonce. - Received more than the limited value of requests (10) within one second.
                '1014': AuthenticationError,    // Unauthorized request. Signature value passed (in the X-TXC-SIGNATURE header) does not match the request body.
                '1015': AuthenticationError,    // Temporary block. Temporary blocking. There is a cancellation of orders.
                '1016': AuthenticationError,    // Not unique nonce. The request was sent with a repeated parameter "nonce" within 10 seconds.
                '2010': BadRequest,             // Currency not found. Currency not found.
                '2020': BadRequest,             // Market is not available. Market is not available.
                '2021': BadRequest,             // Unknown market. Unknown market.
                '2030': BadRequest,             // Order not found. Order not found.
                '2040': InsufficientFunds,      // Balance not enough. Insufficient balance.
                '2050': BadRequest,             // Amount less than the permitted minimum. Amount less than the permitted minimum.
                '2051': BadRequest,             // Amount is greater than the maximum allowed. Amount exceeds the allowed maximum.
                '2052': BadRequest,             // Amount step size error. Amount step size error.
                '2060': BadRequest,             // Price less than the permitted minimum. Price is less than the permitted minimum.
                '2061': BadRequest,             // Price is greater than the maximum allowed. Price exceeds the allowed maximum.
                '2062': BadRequest,             // Price pick size error. Price pick size error.
                '2070': BadRequest,             // Total less than the permitted minimum. Total less than the permitted minimum.
                '3001': BadRequest,             // Validation exception. The given data was invalid.
                '3020': BadRequest,             // Invalid currency value. Incorrect parameter, check your request.
                '3030': BadRequest,             // Invalid market value. Incorrect "market" parameter, check your request.
                '3040': BadRequest,             // Invalid amount value. Incorrect "amount" parameter, check your request.
                '3050': BadRequest,             // Invalid price value. Incorrect "price" parameter, check your request.
                '3060': BadRequest,             // Invalid limit value. Incorrect "limit" parameter, check your request.
                '3070': BadRequest,             // Invalid offset value. Incorrect "offset" parameter, check your request.
                '3080': BadRequest,             // Invalid orderId value. Incorrect "orderId" parameter, check your request.
                '3090': BadRequest,             // Invalid lastId value. Incorrect "lastId" parameter, check your request.
                '3100': BadRequest,             // Invalid side value. Incorrect "side" parameter, check your request.
                '3110': BadRequest,             // Invalid interval value. Incorrect "interval" parameter, check your request.
                '4001': ExchangeNotAvailable,   // Service temporary unavailable. An unexpected system error has occurred. Try again after a while. If the error persists, please contact support.
                '6010': InsufficientFunds,      // Balance not enough. Insufficient balance.
            },
            'options': {
                // 'account': 'pro'      // Only for pro accounts
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // TODO
        let url = undefined;
        if (Array.isArray (api)) {
            const [ version, access ] = api;
            if (version === 'v3') {
                url = this.urls['api'][version] + '/' + version + '/' + this.implodeParams (path, params);
                if (access === 'public') {
                    if (method === 'GET') {
                        if (Object.keys (params).length) {
                            url += '?' + this.urlencode (params);
                        }
                    } else if ((method === 'POST') || (method === 'PUT')) {
                        headers = { 'Content-Type': 'application/json' };
                        body = this.json (params);
                    }
                } else if (access === 'private') {
                    throw new NotSupported (this.id + ' private v3 API is not supported yet');
                }
            } else if (version === 'v4') {
                const splitPath = path.split ('/');
                const splitPathLength = splitPath.length;
                let urlPath = '';
                if ((splitPathLength > 1) && (splitPath[0] !== 'p2b-code')) {
                    let pathTail = '';
                    for (let i = 1; i < splitPathLength; i++) {
                        pathTail += splitPath[i];
                    }
                    urlPath = '/' + version + '/' + splitPath[0] + '/' + access + '/' + this.implodeParams (pathTail, params);
                } else {
                    urlPath = '/' + version + '/' + access + '/' + this.implodeParams (path, params);
                }
                url = this.urls['api'][version] + urlPath;
                if (access === 'private') {
                    const nonce = this.nonce ();
                    const auth = urlPath + nonce + this.json (params);
                    headers = {
                        'content-type': 'application/json',
                        'accept': 'application/json',
                        'nonce': nonce,
                        'public-key': this.apiKey,
                        'signature': this.hmac (this.encode (auth), this.encode (this.secret), sha384, 'hex'),
                    };
                    const account = this.safeString (this.options, 'account');
                    if (account === 'pro') {
                        headers['account'] = 'pro';
                    }
                }
            }
        } else {
            let request = '/api/' + this.version + '/' + this.implodeParams (path, params);
            if ('extension' in this.urls) {
                request += this.urls['extension'];
            }
            const query = this.omit (params, this.extractParams (path));
            url = this.urls['api'][api] + request;
            if (api === 'public') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else {
                this.checkRequiredCredentials ();
                const nonce = this.nonce ().toString ();
                const queryInner = this.encodeParams (this.extend ({
                    'access_key': this.apiKey,
                    'tonce': nonce,
                }, params));
                const auth = method + '|' + request + '|' + queryInner;
                const signed = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
                const suffix = query + '&signature=' + signed;
                if (method === 'GET') {
                    url += '?' + suffix;
                } else {
                    body = suffix;
                    headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // TODO
        if (response === undefined) {
            return undefined;
        }
        if (code === 400) {
            const error = this.safeValue (response, 'error');
            const errorCode = this.safeString (error, 'code');
            const feedback = this.id + ' ' + this.json (response);
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            // fallback to default error handler
        }
        return undefined;
    }
}
