
//  ---------------------------------------------------------------------------

import Exchange from './abstract/xcoin.js';
import { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError, OrderNotFound, AccountSuspended, BadSymbol, OrderImmediatelyFillable, RateLimitExceeded, OnMaintenance, PermissionDenied, BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Dict, int, LedgerEntry, DepositAddress } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class zonda
 * @augments Exchange
 */
export default class xcoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'xcoin',
            'name': 'XCoin',
            'countries': [ 'JP' ], // Japan
            'rateLimit': 1000,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
            },
            'timeframes': {
            },
            'hostname': 'xcoin.com',
            'urls': {
                'referral': '__________________________',
                'logo': '__________________________',
                'www': 'https://xcoin.com/',
                'api': {
                    'public': 'https://{hostname}/API/Public',
                    'private': 'https://{hostname}/API/Trading/tradingApi.php',
                    'v1_01Public': 'https://api.{hostname}/rest',
                    'v1_01Private': 'https://api.{hostname}/rest',
                },
                'doc': [
                    'https://xcoin.com/docs/',
                ],
                'support': 'https://support.xcoin.com/',
                'fees': 'https://xcoin.com/zh-CN/trade/guide/spot-fee-rate',
            },
            'api': {
                'public': {
                    'get': [
                    ],
                },
                'private': {
                    'post': [
                    ],
                },
            },
            'options': {
            },
            'features': {
                'spot': {
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
            },
        });
    }

    /**
     * @method
     * @name zonda#fetchMarkets
     * @see https://docs.zondacrypto.exchange/reference/ticker-1
     * @description retrieves data on all markets for zonda
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        
    }

    parseMarket (item): Market {
        const market = this.safeValue (item, 'market', {});
        const id = this.safeString (market, 'code');
        const first = this.safeValue (market, 'first', {});
        const second = this.safeValue (market, 'second', {});
        const baseId = this.safeString (first, 'currency');
        const quoteId = this.safeString (second, 'currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let fees = this.safeValue (this.fees, 'trading', {});
        const fiatCurrencies = this.safeValue (this.options, 'fiatCurrencies', []);
        if (this.inArray (base, fiatCurrencies) || this.inArray (quote, fiatCurrencies)) {
            fees = this.safeValue (this.fees, 'fiat', {});
        }
        // todo: check that the limits have ben interpreted correctly
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'optionType': undefined,
            'strike': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (first, 'scale'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (second, 'scale'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (first, 'minOffer'),
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
            'created': undefined,
            'info': item,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params) + '.json';
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'v1_01Private') {
            this.checkRequiredCredentials ();
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            const nonce = this.milliseconds ().toString ();
            let payload: Str = undefined;
            if (method !== 'POST') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                payload = this.apiKey + nonce;
            } else if (body === undefined) {
                body = this.json (query);
                payload = this.apiKey + nonce + body;
            }
            headers = {
                'Request-Timestamp': nonce,
                'Operation-Id': this.uuid (),
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (payload), this.encode (this.secret), sha512),
                'Content-Type': 'application/json',
            };
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        return undefined;
    }
}
