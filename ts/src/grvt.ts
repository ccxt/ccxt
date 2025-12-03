
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
                    'privateMarket': 'https://market-data.dev.gravitymarkets.io/',
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
                'privateMarket': {
                    'post': {
                        'full/v1/instrument': 1,
                        'lite/v1/instrument': 1,
                        'full/v1/all_instruments': 1,
                        'lite/v1/all_instruments': 1,
                        'full/v1/instruments': 1,
                        'lite/v1/instruments': 1,
                        'full/v1/currency': 1,
                        'lite/v1/currency': 1,
                        'full/v1/margin_rules': 1,
                        'lite/v1/margin_rules': 1,
                        'full/v1/mini': 1,
                        'lite/v1/mini': 1,
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

    /**
     * @method
     * @name grvt#fetchMarkets
     * @description retrieves data on all markets for alpaca
     * @see https://api-docs.grvt.io/market_data_api/#get-instrument-prod
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.privateMarketPostFullV1AllInstruments (params);
        //
        //    {
        //        "result": [
        //            {
        //                "instrument": "AAVE_USDT_Perp",
        //                "instrument_hash": "0x032201",
        //                "base": "AAVE",
        //                "quote": "USDT",
        //                "kind": "PERPETUAL",
        //                "venues": [
        //                    "ORDERBOOK",
        //                    "RFQ"
        //                ],
        //                "settlement_period": "PERPETUAL",
        //                "base_decimals": "9",
        //                "quote_decimals": "6",
        //                "tick_size": "0.01",
        //                "min_size": "0.1",
        //                "create_time": "1764303867576216941",
        //                "max_position_size": "3000.0",
        //                "funding_interval_hours": "8",
        //                "adjusted_funding_rate_cap": "0.75",
        //                "adjusted_funding_rate_floor": "-0.75"
        //            },
        //            ...
        //
        const result = this.safeList (response, 'result', []);
        return this.parseMarkets (result);
    }

    parseMarket (market): Market {
        const marketId = this.safeString (market, 'instrument');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'quote');
        const settleId = quoteId;
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote;
        let type: Str = undefined;
        const typeRaw = this.safeString (market, 'kind');
        if (typeRaw === 'PERPETUAL') {
            type = 'swap';
        }
        const isSpot = (type === 'spot');
        const isSwap = (type === 'swap');
        const isFuture = (type === 'future');
        const isContract = isSwap || isFuture;
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': false,
            'swap': isSwap,
            'future': isFuture,
            'option': false,
            'active': undefined, // todo: ask support to add
            'contract': isContract,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'base_decimals'))),
                'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'tick_size'))),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'min_size'),
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
            'created': this.safeIntegerProduct (market, 'create_time', 0.000001),
            'info': market,
        } as Market;
    }

    /**
     * @method
     * @name grvt#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.grvt.io/market_data_api/#get-currency-response
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        await this.signIn ();
        const response = await this.privateMarketPostFullV1Currency (params);
        //
        //    {
        //        "result": [
        //            {
        //                "id": "4",
        //                "symbol": "ETH",
        //                "balance_decimals": "9",
        //                "quantity_multiplier": "1000000000"
        //            },
        //            ..
        //
        const responseResult = this.safeList (response, 'result', []);
        return this.parseCurrencies (responseResult);
    }

    parseCurrency (rawCurrency: Dict): Currency {
        const id = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (id);
        return this.safeCurrencyStructure ({
            'info': rawCurrency,
            'id': id,
            'code': code,
            'name': undefined,
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'precision': this.parseNumber (this.parsePrecision (this.safeString (rawCurrency, 'balance_decimals'))),
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'type': 'crypto', // only crypto for now
            'networks': undefined,
        });
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
