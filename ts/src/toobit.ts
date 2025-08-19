//  ---------------------------------------------------------------------------

import Exchange from './abstract/toobit.js';
import { AuthenticationError, ExchangeNotAvailable, OnMaintenance, AccountSuspended, PermissionDenied, RateLimitExceeded, InvalidNonce, InvalidAddress, ArgumentsRequired, ExchangeError, InvalidOrder, InsufficientFunds, BadRequest, OrderNotFound, BadSymbol, NotSupported, NetworkError } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE, TRUNCATE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, TransferEntry, Num, TradingFeeInterface, Currencies, IsolatedBorrowRates, IsolatedBorrowRate, Dict, OrderRequest, int, FundingRate, DepositAddress, BorrowInterest, MarketInterface, FundingRateHistory, FundingHistory, LedgerEntry, Position } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class toobit
 * @augments Exchange
 */
export default class toobit extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'toobit',
            'name': 'Toobit',
            'countries': [ 'SC' ], // Seychelles
            'version': 'v1',
            'rateLimit': 50, // 20 requests per second
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
            },
            'urls': {
                'logo': '',
                'api': {
                    'common': 'https://api.toobit.com/api',
                    'spot': 'https://api.toobit.com/api',
                    'swap': 'https://api.toobit.com/api',
                },
                'www': 'https://www.toobit.com/',
                'doc': [
                    'https://toobit-docs.github.io/apidocs/spot/v1/en/',
                    'https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/',
                ],
                'referral': undefined,
                'fees': 'https://www.toobit.com/fee',
            },
            'api': {
                'common': {
                    'get': {
                        'v1/time': 1,
                    },
                },
                'spot': {
                    'get': {
                    },
                },
                'private': {
                    'get': {
                    },
                    'post': {
                    },
                    'delete': {
                    },
                },
            },
            'timeframes': {
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'commonCurrencies': {},
            'options': {
                'defaultType': 'spot',
            },
        });
    }

    /**
     * @method
     * @name toobit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.commonGetV1Time (params);
        //
        //     {
        //         "serverTime": 1699827319559
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            let queryString = '';
            if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
            } else {
                body = this.json (query);
            }
            const payload = timestamp + method + '/' + path + (body || queryString || '');
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            headers = {
                'X-TB-APIKEY': this.apiKey,
                'X-TB-TIMESTAMP': timestamp.toString (),
                'X-TB-SIGNATURE': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeString (response, 'code');
        const message = this.safeString (response, 'msg');
        if (errorCode && errorCode !== '200') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
