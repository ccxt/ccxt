
//  ---------------------------------------------------------------------------

import Exchange from './abstract/cex.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, NullResponse, InvalidOrder, InsufficientFunds, InvalidNonce, OrderNotFound, RateLimitExceeded, DDoSProtection, BadSymbol } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Currency, Currencies, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, int } from './base/types.js';

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
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
            },
            'timeframes': {
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
                        'get_pairs_info': 1,
                        'get_currencies_info': 1,
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

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name cex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://trade.cex.io/docs/#rest-public-api-calls-currencies-info
         * @param {dict} [params] extra parameters specific to the exchange API endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        const response = await this.publicPostGetCurrenciesInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "currency": "ZAP",
        //                "fiat": false,
        //                "precision": "8",
        //                "walletPrecision": "6",
        //                "walletDeposit": true,
        //                "walletWithdrawal": true
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseCurrencies (data);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'currency');
        const code = this.safeCurrencyCode (id);
        const type = this.safeBool (rawCurrency, 'fiat') ? 'fiat' : 'crypto';
        const currencyDepositEnabled = this.safeBool (rawCurrency, 'walletDeposit');
        const currencyWithdrawEnabled = this.safeBool (rawCurrency, 'walletWithdrawal');
        const currencyPrecision = this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'precision')));
        return {
            'id': id,
            'code': code,
            'name': undefined,
            'type': type,
            'active': undefined,
            'deposit': currencyDepositEnabled,
            'withdraw': currencyWithdrawEnabled,
            'fee': undefined,
            'precision': currencyPrecision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'networks': undefined,
            'info': rawCurrency,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name cex#fetchMarkets
         * @description retrieves data on all markets for ace
         * @see https://trade.cex.io/docs/#rest-public-api-calls-pairs-info
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicPostGetPairsInfo (params);
        //
        //    {
        //        "ok": "ok",
        //        "data": [
        //            {
        //                "base": "AI",
        //                "quote": "USD",
        //                "baseMin": "30",
        //                "baseMax": "2516000",
        //                "baseLotSize": "0.000001",
        //                "quoteMin": "10",
        //                "quoteMax": "1000000",
        //                "quoteLotSize": "0.01000000",
        //                "basePrecision": "6",
        //                "quotePrecision": "8",
        //                "pricePrecision": "4",
        //                "minPrice": "0.0377",
        //                "maxPrice": "19.5000"
        //            },
        //            ...
        //
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        const baseId = this.safeString (market, 'base');
        const base = this.safeCurrencyCode (baseId);
        const quoteId = this.safeString (market, 'quote');
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote;
        return this.safeMarketStructure ({
            'id': symbol,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': undefined,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'baseMin'),
                    'max': this.safeNumber (market, 'baseMax'),
                },
                'price': {
                    'min': this.safeNumber (market, 'minPrice'),
                    'max': this.safeNumber (market, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeNumber (market, 'quoteMin'),
                    'max': this.safeNumber (market, 'quoteMax'),
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': this.safeString (market, 'baseLotSize'),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'pricePrecision'))),
                // 'cost': this.parseNumber (this.parsePrecision (this.safeString (market, 'quoteLotSize'))), // buggy, doesn't reflect their documentation
                'base': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                'quote': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
            },
            'active': undefined,
            'created': undefined,
            'info': market,
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
