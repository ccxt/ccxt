
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
                    'market': 'https://market-data.dev.gravitymarkets.io/',
                },
                'www': 'https://grvt.io',
                'referral': '----------------------------------------------------',
                'doc': [
                    'https://api-docs.grvt.io/',
                ],
                'fees': '',
            },
            'api': {
                'market': {
                    'get': {
                        'full/v1/instrument': 1,
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
     * @name grvt#fetchMarkets
     * @description retrieves data on all markets for alpaca
     * @see https://api-docs.grvt.io/market_data_api/#get-instrument-prod
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const assets = await this.marketGetFullV1Instrument (params);
        
        return this.parseMarkets (assets);
    }

    parseMarket (asset): Market {
        //
        //     {
        //         "id": "c150e086-1e75-44e6-9c2c-093bb1e93139",
        //         "class": "crypto",
        //         "exchange": "CRYPTO",
        //         "symbol": "BTC/USDT",
        //         "name": "Bitcoin / USD Tether",
        //         "status": "active",
        //         "tradable": true,
        //         "marginable": false,
        //         "maintenance_margin_requirement": 101,
        //         "shortable": false,
        //         "easy_to_borrow": false,
        //         "fractionable": true,
        //         "attributes": [],
        //         "min_order_size": "0.000026873",
        //         "min_trade_increment": "0.000000001",
        //         "price_increment": "1"
        //     }
        //
        const marketId = this.safeString (asset, 'symbol');
        const parts = marketId.split ('/');
        const assetClass = this.safeString (asset, 'class');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        let quote = this.safeCurrencyCode (quoteId);
        // Us equity markets do not include quote in symbol.
        // We can safely coerce us_equity quote to USD
        if (quote === undefined && assetClass === 'us_equity') {
            quote = 'USD';
        }
        const symbol = base + '/' + quote;
        const status = this.safeString (asset, 'status');
        const active = (status === 'active');
        const minAmount = this.safeNumber (asset, 'min_order_size');
        const amount = this.safeNumber (asset, 'min_trade_increment');
        const price = this.safeNumber (asset, 'price_increment');
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': undefined,
            'swap': false,
            'future': false,
            'option': false,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amount,
                'price': price,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
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
            'info': asset,
        };
    }


    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const type = this.safeString (api, 0);
        const version = this.safeString (api, 1);
        const access = this.safeString (api, 2);
        let url = undefined;
        if ((type === 'api' && version === 'kline') || (type === 'open' && path.indexOf ('listenKey') >= 0)) {
            url = this.urls['api'][type];
        } else {
            url = this.urls['api'][type] + '/' + version;
        }
        url = url + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (access === 'private') {
            this.checkRequiredCredentials ();
            const recvWindow = this.safeInteger (this.options, 'recvWindow', 5000);
            if (type === 'spot' || type === 'open') {
                let query = this.urlencode (this.extend ({
                    'timestamp': this.nonce (),
                    'recvWindow': recvWindow,
                }, params));
                const signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
                query += '&' + 'signature=' + signature;
                headers = {
                    'X-MBX-APIKEY': this.apiKey,
                };
                if ((method === 'GET') || (method === 'DELETE')) {
                    url += '?' + query;
                } else {
                    body = query;
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else {
                const timestamp = this.nonce ().toString ();
                let signPath = undefined;
                if (type === 'fapi') {
                    signPath = '/fapi';
                } else if (type === 'dapi') {
                    signPath = '/dapi';
                }
                signPath = signPath + '/' + version + '/' + path;
                let signMessage = timestamp + method + signPath;
                if (method === 'GET') {
                    const keys = Object.keys (params);
                    const keysLength = keys.length;
                    if (keysLength > 0) {
                        signMessage += '?' + this.urlencode (params);
                    }
                    const signature = this.hmac (this.encode (signMessage), this.encode (this.secret), sha256);
                    headers = {
                        'X-CH-APIKEY': this.apiKey,
                        'X-CH-SIGN': signature,
                        'X-CH-TS': timestamp,
                    };
                    url += '?' + this.urlencode (params);
                } else {
                    const query = this.extend ({
                        'recvWindow': recvWindow,
                    }, params);
                    body = this.json (query);
                    signMessage += body;
                    const signature = this.hmac (this.encode (signMessage), this.encode (this.secret), sha256);
                    headers = {
                        'Content-Type': 'application/json',
                        'X-CH-APIKEY': this.apiKey,
                        'X-CH-SIGN': signature,
                        'X-CH-TS': timestamp,
                    };
                }
            }
        } else {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if ((code === 418) || (code === 429)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        // error response in a form: { "code": -1013, "msg": "Invalid quantity." }
        // following block cointains legacy checks against message patterns in "msg" property
        // will switch "code" checks eventually, when we know all of them
        if (code >= 400) {
            if (body.indexOf ('Price * QTY is zero or less') >= 0) {
                throw new InvalidOrder (this.id + ' order cost = amount * price is zero or less ' + body);
            }
            if (body.indexOf ('LOT_SIZE') >= 0) {
                throw new InvalidOrder (this.id + ' order amount should be evenly divisible by lot size ' + body);
            }
            if (body.indexOf ('PRICE_FILTER') >= 0) {
                throw new InvalidOrder (this.id + ' order price is invalid, i.e. exceeds allowed price precision, exceeds min price or max price limits or is invalid float value in general, use this.priceToPrecision (symbol, amount) ' + body);
            }
        }
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        // check success value for wapi endpoints
        // response in format {'msg': 'The coin does not exist.', 'success': true/false}
        const success = this.safeBool (response, 'success', true);
        if (!success) {
            const messageInner = this.safeString (response, 'msg');
            let parsedMessage = undefined;
            if (messageInner !== undefined) {
                try {
                    parsedMessage = JSON.parse (messageInner);
                } catch (e) {
                    // do nothing
                    parsedMessage = undefined;
                }
                if (parsedMessage !== undefined) {
                    response = parsedMessage;
                }
            }
        }
        const message = this.safeString (response, 'msg');
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, this.id + ' ' + message);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, this.id + ' ' + message);
        }
        // checks against error codes
        const error = this.safeString (response, 'code');
        if (error !== undefined) {
            // https://github.com/ccxt/ccxt/issues/6501
            // https://github.com/ccxt/ccxt/issues/7742
            if ((error === '200') || Precise.stringEquals (error, '0')) {
                return undefined;
            }
            // a workaround for {"code":-2015,"msg":"Invalid API-key, IP, or permissions for action."}
            // despite that their message is very confusing, it is raised by Binance
            // on a temporary ban, the API key is valid, but disabled for a while
            if ((error === '-2015') && this.options['hasAlreadyAuthenticatedSuccessfully']) {
                throw new DDoSProtection (this.id + ' temporary banned: ' + body);
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            throw new ExchangeError (feedback);
        }
        if (!success) {
            throw new ExchangeError (this.id + ' ' + body);
        }
        return undefined;
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        if (('noSymbol' in config) && !('symbol' in params)) {
            return config['noSymbol'];
        } else if (('byLimit' in config) && ('limit' in params)) {
            const limit = params['limit'];
            const byLimit = config['byLimit'] as any;
            for (let i = 0; i < byLimit.length; i++) {
                const entry = byLimit[i];
                if (limit <= entry[0]) {
                    return entry[1];
                }
            }
        }
        return this.safeValue (config, 'cost', 1);
    }
}
