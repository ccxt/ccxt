
// ---------------------------------------------------------------------------

import Exchange from './abstract/p2b.js';
import { InsufficientFunds, AuthenticationError, BadRequest, ExchangeNotAvailable } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha512 } from './static_dependencies/noble-hashes/sha256.js';

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
            'countries': [ 'LT' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
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
            },
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        if (api === 'private') {
            const nonce = this.nonce ();
            params['nonce'] = nonce;
            params['request'] = '/api/v2/' + path;
            const payload = this.encode (params);  // Body json encoded in base64
            headers = {
                'Content-Type': 'application/json',
                'X-TXC-APIKEY': this.apiKey,
                'X-TXC-PAYLOAD': payload,
                'X-TXC-SIGNATURE': this.hmac (payload, this.encode (this.secret), sha512, 'base64'),
            };
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
