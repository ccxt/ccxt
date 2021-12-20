'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InvalidAddress, ExchangeError, BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, ArgumentsRequired, OrderNotFound, PermissionDenied } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');
function c(o){console.log(o);}
// ---------------------------------------------------------------------------

module.exports = class coinsbit extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinsbit',
            'name': 'Coinsbit',
            'countries': [ 'EE' ], // Estonia
            //'rateLimit': 50, // default rate limit is 20 times per second
            'version': 1,
            'certified': false,
            'has': {
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'fetchBalance': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrders': undefined,
                //'fetchCurrencies' doesn't exist, and will be 'emulated'
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchMarkets': undefined,
                //'fetchMarketsByType': <-- i think fetchMarketsByType makes things complex, and might be totally removed from ccxt. There should be one 'fetchMarkets' imho. you can see another comment related to this matter under 'checkExchangeType' function down below.
                'fetchMyTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchStatus': 'emulated',
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': 'emulated',
                'fetchTrades': undefined,
                'fetchWithdrawals': undefined,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'withdraw': undefined,
            },
            'timeframes': {
                // '1m': '1m',
                // '5m': '5m',
                // '15m': '15m',
                // '30m': '30m',
                // '1h': '1h',
                // '1d': '1d',
                // '1M': '1M',
            },
            'urls': {
                'logo': '  <<< TODO >>>   https://upload.wikimedia.org/wikipedia/commons/8/8c/Coinsbit.png  ',
                'api': {
                    'spot': {
                        'public' : 'https://coinsbit.io/api/',
                        'private': 'https://coinsbit.io/api/',
                    },
                },
                'www': 'https://coinsbit.io/',
                'doc': [
                    'https://www.notion.so/coinsbitwsapi/API-COINSBIT-WS-API-COINSBIT-cf1044cff30646d49a0bab0e28f27a87',
                    'https://github.com/Coinsbit-connect/api/wiki/API',
                ],
                'fees': [
                    'https://coinsbit.io/fee-schedule',
                ],
                'referral': '  <<< TODO >>>   ',
            },
            'api': {
                'spot': {
                    'public': {
                        'get': {
                            'markets': 1,
                            'tickers': 1,
                            'ticker': 1,
                            'book': 1,
                            'history': 1,
                            'history/result': 1,
                            'products': 1, // Of no use, everything already available in 'markets'
                            'symbols': 1, // Of no use, everything already available in 'markets'
                            'depth/result': 1,
                            'kline': 1
                        },
                    },
                    'private': {
                        'get': {
                        },
                        'post': {
                            'order/new': 1,
                            'order/cancel': 1,
                            'orders': 1,
                            'account/balances': 1,
                            'account/balance': 1,
                            'account/order': 1,
                            'account/trades': 1,
                            'account/order_history': 1,
                            'account/order_history_list': 1
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.2 / 100,
                    'taker': 0.2 / 100,
                },
            }, 
            'options': {
                'defaultType': 'spot', // spot, ..
                // 'networks': {
                //     'TRX': 'TRC-20',
                //     'TRC20': 'TRC-20',
                //     'ETH': 'ERC-20',
                //     'ERC20': 'ERC-20',
                //     'BEP20': 'BEP20(BSC)',
                // },
            },
            'commonCurrencies': {
                //'xxx': 'xxxxxxx',
            },
            'exceptions': {
                'exact': {
                    // '400': BadRequest, // Invalid parameter
                    // '401': AuthenticationError, // Invalid signature, fail to pass the validation
                    // '429': RateLimitExceeded, // too many requests, rate limit rule is violated
                    // '1000': PermissionDenied, // {"success":false,"code":1000,"message":"Please open contract account first!"}
                    // '1002': InvalidOrder, // {"success":false,"code":1002,"message":"Contract not allow place order!"}
                    // '10072': AuthenticationError, // Invalid access key
                    // '10073': AuthenticationError, // Invalid request time
                    // '10216': InvalidAddress, // {"code":10216,"msg":"No available deposit address"}
                    // '10232': BadSymbol, // {"code":10232,"msg":"The currency not exist"}
                    // '30000': BadSymbol, // Trading is suspended for the requested symbol
                    // '30001': InvalidOrder, // Current trading type (bid or ask) is not allowed
                    // '30002': InvalidOrder, // Invalid trading amount, smaller than the symbol minimum trading amount
                    // '30003': InvalidOrder, // Invalid trading amount, greater than the symbol maximum trading amount
                    // '30004': InsufficientFunds, // Insufficient balance
                    // '30005': InvalidOrder, // Oversell error
                    // '30010': InvalidOrder, // Price out of allowed range
                    // '30016': BadSymbol, // Market is closed
                    // '30019': InvalidOrder, // Orders count over limit for batch processing
                    // '30020': BadSymbol, // Restricted symbol, API access is not allowed for the time being
                    // '30021': BadSymbol, // Invalid symbol
                    // '33333': BadSymbol, // {"code":33333,"msg":"currency can not be null"}
                },
                'broad': {
                },
            },
        });
    }

    checkExchangeType (methodName, params) { // This method can be moved in base
        // My proposal is to use separate exchange-type (spot|margin|futures) for each API call. So, we can assume a default to be always 'spot' but typically, in every function we should have created a separate parameter, named 'exchangeType', instead of generic 'type', because 'type' can be a very specific to the individual method, and it's better that there was a specific variable name dedicated for 'exchange-type' meaning. Imho, that shouldn't be 'type' but 'exchangeType'(or alike).
        const defaultType = this.safeString2 (this.options, 'fetchStatus', 'defaultType', 'spot');
        const exchangeType = this.safeString (params, 'exchangeType', defaultType);
        const supportedExchangeTypes = Object.keys (this.api);
        if ( ! supportedExchangeTypes.includes (exchangeType))
            throw new ExchangeError (this.id + " does not support '" + exchangeType + "' type, set exchange.options['defaultType'] to desired: "+ supportedExchangeTypes.join(' | ') ); // eslint-disable-line quotes
        return exchangeType;
    }

    getChosenFetch (exchangeType, targetMethodName, query) {  // This method can be moved in base
        const exchangeTypeChecked = this.checkExchangeType(exchangeType);
        const exchangeTypeUppercased = exchangeTypeChecked[0].toUpperCase() + exchangeTypeChecked.slice(1);
        const methodFullName = 'fetch' + exchangeTypeUppercased + targetMethodName;
        return methodFullName;
    }

    async fetchStatus (params = {}) {
        let exchangeType = this.checkExchangeType('fetchStatus', params); //Here should be also exchangeType adpoted, because in my experience I've seen cases when spot is working, but futures/perp/etc is under maintenance
        let response = '';
        if (exchangeType === 'spot') {
            response = await this.publicGetSymbols (params); // This specific exchange (coinsbit) unfortunately, doesn't have any good way to get API status, so this is a specific case, I'm just making the most affordable endpoint call (better than nothing) to define the working-status of API. (However, overall structure might be like this)
        }
        //
        // {"success":true,"message":"","result":["5BI_BUSD",...],"code":200}
        //
        const code = this.safeInteger (response, 'code');
        if (code !== undefined) {
            const status = (code === 200) ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchTime (params = {}) {
        return this.milliseconds();
    }

    async fetchMarkets (params = {}) {
        let exchangeType = this.checkExchangeType('fetchMarkets', params);
        const methodName = this.getChosenFetch (exchangeType, 'Markets');
        return await this[methodName] (params);
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.spotPublicGetMarkets (params);
        c(response);
        //
        //     {
        //         "code":200,
        //         "data":[
        //             {
        //                 "symbol":"DFD_USDT",
        //                 "state":"ENABLED",
        //                 "countDownMark":1,
        //                 "vcoinName":"DFD",
        //                 "vcoinStatus":1,
        //                 "price_scale":4,
        //                 "quantity_scale":2,
        //                 "min_amount":"5", // not an amount = cost
        //                 "max_amount":"5000000",
        //                 "maker_fee_rate":"0.002",
        //                 "taker_fee_rate":"0.002",
        //                 "limited":true,
        //                 "etf_mark":0,
        //                 "symbol_partition":"ASSESS"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceScale = this.safeInteger (market, 'price_scale');
            const quantityScale = this.safeInteger (market, 'quantity_scale');
            const pricePrecision = 1 / Math.pow (10, priceScale);
            const quantityPrecision = 1 / Math.pow (10, quantityScale);
            const state = this.safeString (market, 'state');
            const type = 'spot';
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': (state === 'ENABLED'),
                'derivative': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': this.safeNumber (market, 'taker_fee_rate'),
                'maker': this.safeNumber (market, 'maker_fee_rate'),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'price': pricePrecision,
                    'amount': quantityPrecision,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_amount'),
                        'max': this.safeNumber (market, 'max_amount'),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        let url = this.urls['api'][section][access] + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = '';
            headers = {
                'ApiKey': this.apiKey,
                'Request-Time': timestamp,
                'Content-Type': 'application/json',
            };
            if (method === 'POST') {
                auth = this.json (params);
                body = auth;
            } else {
                params = this.keysort (params);
                if (Object.keys (params).length) {
                    auth += this.urlencode (params);
                    url += '?' + auth;
                }
            }
            auth = this.apiKey + timestamp + auth;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers['Signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //     {"code":10232,"msg":"The currency not exist"}
        //     {"code":10216,"msg":"No available deposit address"}
        //
        //     {
        //         "success":true,
        //         "code":0,
        //         "data":1634095541710
        //     }
        //
        const success = this.safeValue (response, 'success', false);
        if (success === true) {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if ((responseCode !== '200') && (responseCode !== '0')) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
