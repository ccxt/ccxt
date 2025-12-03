
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitrue.js';
import { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, InsufficientFunds, OrderNotFound, InvalidOrder, DDoSProtection, InvalidNonce, AuthenticationError, RateLimitExceeded, PermissionDenied, BadRequest, BadSymbol, AccountSuspended, OrderImmediatelyFillable, OnMaintenance, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TRUNCATE, TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Currencies, Currency, Dict, Int, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry, int } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitrue
 * @augments Exchange
 */
export default class grvt extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'grvt',
            'name': 'GRVT',
            'countries': [ 'https://market-data.grvt.io' ], //
            'rateLimit': 10,
            'certified': false,
            'version': 'v1',
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '1d': '1D',
                '1w': '1W',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/67abe346-1273-461a-bd7c-42fa32907c8e',
                'api': {
                    'publicMarket': 'https://market-data.dev.gravitymarkets.io/',
                    'privateEdge': 'https://edge.grvt.io/',
                },
                'www': 'https://grvt.io',
                'referral': '----------------------------------------------------',
                'doc': [
                    'https://api-docs.grvt.io/',
                ],
                'fees': '',
            },
            'api': {
                'privateEdge': {
                    'post': {
                        'auth/api_key/login': 1,
                    },
                },
                'publicMarket': {
                    'post': {
                        'full/v1/instrument': 1,
                        'full/v1/all_instruments': 1,
                    },
                },
            },
            // exchange-specific options
            'options': {
               
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    
                },
                'broad': {
                    
                },
            },
        });
    }

    /**
     * @method
     * @name grvt#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api-docs.grvt.io/#authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn (params = {}): Promise<{}> {
        const request = {
            'api_key': this.apiKey,
        };
        const response = await this.privateEdgePostAuthApiKeyLogin (this.extend (request, params));
        const status = this.safeString (response, 'status');
        if (status !== 'success') {
            throw new AuthenticationError (this.id + ' signIn() failed: ' + this.json (response));
        }
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        path = this.implodeParams (path, params);
        let url = this.urls['api'][api] + path;
        let queryString = '';
        if (method === 'GET') {
            if (Object.keys (query).length) {
                queryString = this.urlencode (query);
                url += '?' + queryString;
            }
        }
        const isPrivate = api.startsWith ('private');
        if (isPrivate) {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = this.json (params);
            }
            if (queryString !== '') {
                path = path + '?' + queryString;
            }
            headers = {
                'Content-Type': 'application/json',
            };
            if (path === 'auth/api_key/login') {
                headers['Cookie'] = 'rm=true;';
            } else {
                const accountId = this.safeString (this.options, 'AuthAccountId');
                const cookieValue = this.safeString (this.options, 'AuthCookieValue');
                headers['Cookie'] = cookieValue;
                headers['X-Grvt-Account-Id'] = accountId;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (url.endsWith ('auth/api_key/login')) {
            const accountId = this.safeString (headers, 'X-Grvt-Account-Id');
            this.options['AuthAccountId'] = accountId;
            const cookie = this.safeString2 (headers, 'Set-Cookie', 'set-cookie');
            if (cookie !== undefined) {
                const cookieValue = cookie.split (';')[0];
                this.options['AuthCookieValue'] = cookieValue;
            }
            if (this.options['AuthCookieValue'] === undefined || this.options['AuthAccountId'] === undefined) {
                throw new AuthenticationError (this.id + ' signIn() failed to receive auth-cookie or account-id');
            }
            // todo: add expire
        }
        return undefined;
    }
}
