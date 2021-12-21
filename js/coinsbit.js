'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors'); // , BadRequest, AuthenticationError, RateLimitExceeded, BadSymbol, InvalidOrder, InsufficientFunds, ArgumentsRequired, OrderNotFound, PermissionDenied 
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
            // 'rateLimit': 50, // default rate limit is 20 times per second
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
                // 'fetchCurrencies' doesn't exist, and will be 'emulated'
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchMarkets': true,
                // 'fetchMarketsByType': <-- i think fetchMarketsByType makes things complex, and might be totally removed from ccxt. There should be one 'fetchMarkets' imho. you can see another comment related to this matter under 'checkExchangeType' function down below.
                'fetchMyTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': true,
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
                        'public': 'https://coinsbit.io/api/',
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
                            'kline': 1,
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
                            'account/order_history_list': 1,
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
                // 'xxx': 'xxxxxxx',
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

    checkExchangeType (methodName, params) { // This method can be moved into base
        // My proposal is to use separate exchange-type (spot|margin|futures) for each API call. So, we can assume a default to be always 'spot' but typically, in every function we should have created a separate parameter, named 'exchangeType', instead of generic 'type', because 'type' can be a very specific to the individual method, and it's better that there was a specific variable name dedicated for 'exchange-type' meaning. Imho, that shouldn't be 'type' but 'exchangeType'(or alike).
        const defaultType = this.safeString2 (this.options, 'fetchStatus', 'defaultType', 'spot');
        const exchangeType = this.safeString (params, 'exchangeType', defaultType);
        const supportedExchangeTypes = Object.keys (this.api);
        if (!supportedExchangeTypes.includes (exchangeType)) {
            throw new ExchangeError (this.id + " does not support '" + exchangeType + "' type, set exchange.options['defaultType'] to desired: " + supportedExchangeTypes.join (' | ')); // eslint-disable-line quotes
        }
        return exchangeType;
    }

    safeMarketObject (element) { // This method can be moved into base
        // I see there are many new exchange classes (mexc, gateio, ...) where inside 'fetchMarkets' these properties are being set for spot-market objects (on each object) while in original exchange API responses those properties doesn't exist at all. So, these can be filled with this helper function (like 'safeTicker' does for each ticker object)
        return this.deepExtend (element, {
            'spot': undefined,
            'derivative': undefined,
            'contract': undefined,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'settle': undefined,
            'settleId': undefined,
        });
    }

    async fetchStatus (params = {}) {
        const exchangeType = this.checkExchangeType ('fetchStatus', params); // Here should be also exchangeType adpoted, because in my experience I've seen cases when spot is working, but futures/perp/etc is under maintenance
        let response = '';
        if (exchangeType === 'spot') {
            response = await this.spotPublicGetSymbols (params); // This specific exchange (coinsbit) unfortunately, doesn't have any good way to get API status, so this is a specific case, I'm just making the most affordable endpoint call (better than nothing) to define the working-status of API. (However, overall structure might be like this)
            //
            // {"success":true,"message":"","result":["5BI_BUSD",...],"code":"200"}
            //
        } else if (exchangeType === 'futures') {
            // JUST FOR DEMONSTRATIONAL PURPOSES
            // response = await this.futuresPublicGetSymbols (params);
        }
        const code = this.safeString (response, 'code');
        if (code !== undefined) {
            const status = (code === '200') ? 'ok' : 'maintenance';
            this.status = this.extend (this.status, {
                'status': status,
                'updated': this.milliseconds (),
            });
        }
        return this.status;
    }

    async fetchTime (params = {}) {
        return this.milliseconds ();
    }

    async fetchMarkets (params = {}) {
        const exchangeType = this.checkExchangeType ('fetchMarkets', params); // Note: imho, I am against dividing methods according to types (like 'fetchSpotMarkets', 'fetchFuturesMarkets' and etc..) because there might be many types and exchanges, from time to time, add new types, thus it will need a never-ending 'new method' creations. I think that, independent to the exchange-type, everything should be done with one 'fetchXXX' functions - if there are multiple different types, they should be handled inside one 'fetchXXX' function (just by passing 'exchangeType' parameter). That has also one advantage - the most of the 'return' object structure can be same and only a few property-values might need to be happening inside if-else blocks, thus will save multiple 'fetchSpotXXX', 'fetchFuturesXXX' functions to be written over-and-over again with same structure.
        const exchangeTypeChecked = this.checkExchangeType (exchangeType);
        const request = this.deepExtend ({}, params);
        let data = '';
        if (exchangeTypeChecked === 'spot') {
            const response = await this.spotPublicGetMarkets (request);
            //     {
            //         "success": true,
            //         "message": "",
            //         "result": [
            //             {
            //                 name: "BTC_USDT",
            //                 moneyPrec: "8",
            //                 stock: "BTC",
            //                 money: "USDT",
            //                 stockPrec: "8",
            //                 feePrec: "8",
            //                 minAmount: "0.001"
            //             },
            //             ...
            //          ],
            //         "code":"200",
            //
            data = this.safeValue (response, 'result', []);
        } else if (exchangeTypeChecked === 'futures') {
            // JUST FOR DEMONSTRATIONAL PURPOSES
            // const response = await this.futuresPublicGetMarkets (params);
            // i.e. : data = this.safeValue (response, 'result', []);
        }
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'name');
            // const [ baseId, quoteId ] = id.split ('_');  // We do have them in properties, so, I don't think this is needed ?
            const baseId = this.safeString (market, 'stock');
            const quoteId = this.safeString (market, 'money');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const priceScale = this.safeInteger (market, 'moneyPrec'); // <<< TODO >>>  strings 1e-8
            const quantityScale = this.safeInteger (market, 'stockPrec');
            const pricePrecision = 1 / Math.pow (10, priceScale);
            const quantityPrecision = 1 / Math.pow (10, quantityScale);
            const minAmount = this.safeNumber (market, 'minAmount');
            const type = 'spot';
            result.push (this.safeMarketObject ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'margin': undefined,
                'active': undefined,
                'taker': undefined,
                'maker': undefined,
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
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'feePrec'),     // <<< TODO >>> I am not yet sure this is correct.
                        'max': undefined,
                    },
                },
                'info': market,
            }));
        }
        return result;
    }

    async fetchTicker (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const exchangeType = this.checkExchangeType ('fetchTicker', params);
        const market = this.market (symbol);
        const request = this.omit (params, 'exchangeType');
        request['market'] = market['id'];
        let ticker = {};
        if (exchangeType === 'spot') {
            const response = await this.spotPublicGetTicker (request);
            //     {
            //          success: true,
            //          message: "",
            //          result: {
            //            bid: '46504.7412435',
            //            ask: '46511.54203562',
            //            open: '47030.33',
            //            high: '47549.99',
            //            low: '45571.08',
            //            last: '46459.99',
            //            volume: '8372.29022355',
            //            deal: '388090406.73607745',
            //          },
            //          code: "200"
            //     }
            ticker = this.safeValue (response, 'result', {});
        } else if (exchangeType === 'futures') {
            // data = await this.futuresPublicGetTicker (request);
        }
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const exchangeType = this.checkExchangeType ('fetchTickers', params);
        const request = this.omit (params, 'exchangeType');
        let tickers = {};
        if (exchangeType === 'spot') {
            const response = await this.spotPublicGetTickers (request);
            //     {
            //          success: true,
            //          message: "",
            //          result: {
            //            BTC_USDT: {
            //               at: '1640028811',
            //               ticker: {
            //                 bid: '46448.49682539',
            //                 ask: '46458.41093569',
            //                 open: '46687.39',
            //                 high: '47550',
            //                 low: '45584.27',
            //                 last: '46462.77',
            //                 vol: '32.56275846',
            //                 deal: '1510574.62551143',
            //                 change: '-0'
            //               }
            //            },
            //            ...
            //          },
            //          code: "200"
            //     }
            tickers = this.safeValue (response, 'result', {});
        } else if (exchangeType === 'futures') {
            // tickers = ..
        }
        return this.parseTickers (tickers, undefined, params);
    }

    // This modified parseTickers method needs to exist in base, to keep the KYES & pass them through parseTickers
    parseTickers (tickers, symbols = undefined, params = {}) {
        const result = [];
        const values = Object.values (tickers || []);
        let keys = Object.keys (tickers);
        for (let i = 0; i < values.length; i++) {
            result.push (this.extend (this.parseTicker (values[i], undefined, keys[i]), params));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined, key = undefined) {
        let tickerFinal = {};
        let timestamp = null;
        if (market === undefined) {
            // if arrived from parseTickers
            market = this.market (key);
            tickerFinal = ticker['ticker'];
            timestamp = Precise.stringticker['at'] + '000';
        } else {
            // if arrived from fetchTicker, then there is nothing to be done more
            tickerFinal = ticker;
            timestamp = this.milliseconds ();
        }
        
        const last = this.safeNumber (ticker, 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeNumber (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined, // They do have 'change' property, but atm,  for some reason, they always return "0 | -0 | -1 | -2" strange values. So, skipping for now.
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': this.safeNumber (ticker, 'deal'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const exchangeType = this.checkExchangeType ('fetchTickers', params);
        const market = this.market (symbol);
        const request = this.omit (params, 'exchangeType');
        request['market'] = market['id'];
        let orderbook = {};
        if (exchangeType === 'spot') {
            if (limit !== undefined) {
                request['limit'] = Math.min (1000, limit); // this parameter is not required, default 50 will be returned
            }
            const type = this.safeString (params, 'type', 'bidsAsks'); // <<< TODO >> maybe a better way to set default unified param name (same param can be used for binance fetchBidsAsks too, if that will get integrated inside binance's fetchOrderbook )
            const method = this.safeString (this.options, 'fetchOrderBookMethod', type);
            if (method === 'bidsAsks') {
                const response = await this.spotPublicGetDepthResult (this.extend (request, params));
                //     {
                //         asks: [
                //             [
                //                 "46809.06069986",
                //                 "2.651"
                //             ],
                //             [
                //                 "46819.80796146",
                //                 "2.6401"
                //             ],
                //             ...
                //         ],
                //         bids: [
                //             [
                //                 "46799.39054516",
                //                 "2.702"
                //             ],
                //             [
                //                 "46801.25196599",
                //                 "0.4"
                //             ],
                //             ...
                //         ]
                //     }
                const priceKey = 0;
                const amountKey = 1;
                const timestamp = this.milliseconds ();
                orderbook = this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', priceKey, amountKey);
            } else if (method === 'book') {
                request['offset'] = this.safeString (params, 'offset', 0);
                // ATM, they need to call separately (unfortunately)
                request['side'] = this.safeString (params, 'side', 'buy');
                const requestBids = this.spotPublicGetBook (this.extend (request, params));
                request['side'] = this.safeString (params, 'side', 'sell');
                const requestAsks = this.spotPublicGetBook (this.extend (request, params));
                const responses = await Promise.all ([requestBids, requestAsks]);
                // FOR EACH (BUY/SELL) REQUEST, THE RESPONSE IS SIMILAR (JUST 'side' PROPERTY IS DIFFERENT BETWEEN THEM)
                //     {
                //         success: true,
                //         message: "",
                //         result: {
                //             offset: 0,
                //             limit: 2,
                //             total: 334,
                //             orders: [
                //                 {
                //                     id: 8620142523,
                //                     left: "1.56772",
                //                     market: "BTC_USDT",
                //                     amount: "1.56772",
                //                     type: "limit",
                //                     price: "46752.63032535",
                //                     timestamp: 1640031161.544,
                //                     side: "buy",
                //                     dealFee: "0",
                //                     takerFee: "0",
                //                     makerFee: "0",
                //                     dealStock: "0",
                //                     dealMoney: "0"
                //                 },
                //                 ...
                //             ]
                //         },
                //         code: 200
                //     }
                const resultBids = this.safeValue (responses[0], 'result', {});
                const resultAsks = this.safeValue (responses[1], 'result', {});
                const bids = this.safeValue (resultBids, 'orders', []);
                const asks = this.safeValue (resultAsks, 'orders', []);
                const response = { 'bids': bids, 'asks': asks };
                const priceKey = 'price';
                const amountKey = 'amount';
                const timestamp = this.milliseconds ();
                orderbook = this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', priceKey, amountKey);
            }
        }
        // orderbook['nonce']  <<< TODO >>> -- atm I dont know how to handle that, as the response doesn't have right that property
        return orderbook;
    }

    sign (path, api = ['spot', 'public'], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const [ section, access ] = api;
        let url = this.urls['api'][section][access] + 'v' + this.version + '/' + access + '/' + path;
        // const exchangeType = this.safeString (params, 'exchangeType', 'spot'); exchangeType same as section
        params = this.omit (params, 'exchangeType');
        params = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (method === 'GET') {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
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
        //    {
        //        success: true,
        //        message: "",
        //        code: "200",
        //        result: [ .... ]
        //    }
        const success = this.safeValue (response, 'success');
        if (success !== true) {
            // depth endpoint doesn't return any code, so have to manually check.
            const isBidAsks = url.includes ('depth/result');
            if (isBidAsks && response && response['asks']) {
                return;
            }
            let errorMessage = '';
            let responseCode = 0;
            let feedback = this.id + ' ';
            if (success === false) {
                errorMessage = this.safeValue (response, 'message');
                responseCode = this.safeString (response, 'code');
                feedback += errorMessage;
            } else { // seems response didnt contain expected JSON format at all. Maybe 404 or any outage
                feedback += body;
            }
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
