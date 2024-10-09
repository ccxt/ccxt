
//  ---------------------------------------------------------------------------

import Exchange from './abstract/cex.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, NullResponse, InvalidOrder, InsufficientFunds, InvalidNonce, OrderNotFound, RateLimitExceeded, DDoSProtection, BadSymbol } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class cex
 * @augments Exchange
 */
export default class cex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cex',
            'name': 'CEX.IO',
            'countries': [ 'GB', 'EU', 'CY', 'RU' ],
            'rateLimit': 1500,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false, // has but not through api
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'fetchTime': true,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg',
                'api': {
                    // 'rest': 'https://cex.io/api',
                    'public': 'https://trade.cex.io/api/spot/rest-public',
                    // 'private': 'https://trade.cex.io/api/spot/rest-public',
                },
                'www': 'https://cex.io',
                'doc': 'https://trade.cex.io/docs/',
                'fees': [
                    'https://cex.io/fee-schedule',
                    'https://cex.io/limits-commissions',
                ],
                'referral': 'https://cex.io/r/0/up105393824/0/',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': {

                    },
                    'post': {
                        'get_server_time': 1,
                    },
                },
                'private': {
                    'get': {

                    },
                    'post': {

                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {},
                'broad': {
                },
            },
            'options': {
                'networks': {
                },
            },
        });
    }

    
    async fetchTime (params = {}) {
        /**
         * @method
         * @name cex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicPostGetServerTime (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": {
        //            "timestamp": "1728472063472",
        //            "ISODate": "2024-10-09T11:07:43.472Z"
        //        }
        //    }
        //
        const data = this.safeDict (response, 'data');
        const timestamp = this.safeInteger (data, 'timestamp');
        return timestamp;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            // this.checkRequiredCredentials ();
            // const nonce = this.nonce ().toString ();
            // const auth = nonce + this.uid + this.apiKey;
            // const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            // body = this.json (this.extend ({
            //     'key': this.apiKey,
            //     'signature': signature.toUpperCase (),
            //     'nonce': nonce,
            // }, query));
            // headers = {
            //     'Content-Type': 'application/json',
            // };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        // if (Array.isArray (response)) {
        //     return response; // public endpoints may return []-arrays
        // }
        // if (body === 'true') {
        //     return undefined;
        // }
        // if (response === undefined) {
        //     throw new NullResponse (this.id + ' returned ' + this.json (response));
        // }
        // if ('e' in response) {
        //     if ('ok' in response) {
        //         if (response['ok'] === 'ok') {
        //             return undefined;
        //         }
        //     }
        // }
        // if ('error' in response) {
        //     const message = this.safeString (response, 'error');
        //     const feedback = this.id + ' ' + body;
        //     this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        //     this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        //     throw new ExchangeError (feedback);
        // }
        // return undefined;
    }
}
