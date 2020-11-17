'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadSymbol, AuthenticationError, InsufficientFunds, InvalidOrder, ArgumentsRequired, OrderNotFound, InvalidAddress, BadRequest, RateLimitExceeded, PermissionDenied, ExchangeNotAvailable, AccountSuspended, OnMaintenance } = require ('./base/errors');
const { TRUNCATE } = require ('./base/functions/number');

// ----------------------------------------------------------------------------

module.exports = class bitvavo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitvavo',
            'name': 'Bitvavo',
            'countries': [ 'NL' ], // Netherlands
            'rateLimit': 500,
            'version': 'v2',
            'certified': true,
            'pro': true,
            'has': {
                'CORS': false,
                'publicAPI': true,
                'privateAPI': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOrderBook': true,
                'fetchMarkets': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/83165440-2f1cf200-a116-11ea-9046-a255d09fb2ed.jpg',
                'api': {
                    'public': 'https://api.bitvavo.com',
                    'private': 'https://api.bitvavo.com',
                },
                'www': 'https://bitvavo.com/',
                'doc': 'https://docs.bitvavo.com/',
                'fees': 'https://bitvavo.com/en/fees',
                'referral': 'https://bitvavo.com/?a=24F34952F7',
            },
            'api': {
                'public': {
                    'get': [
                        'time',
                        'markets',
                        'assets',
                        '{market}/book',
                        '{market}/trades',
                        '{market}/candles',
                        'ticker/price',
                        'ticker/book',
                        'ticker/24h',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'orders',
                        'ordersOpen',
                        'trades',
                        'balance',
                        'deposit',
                        'depositHistory',
                        'withdrawalHistory',
                    ],
                    'post': [
                        'order',
                        'withdrawal',
                    ],
                    'put': [
                        'order',
                    ],
                    'delete': [
                        'order',
                        'orders',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.25 / 100,
                    'maker': 0.20 / 100,
                    'tiers': {
                        'taker': [
                            [ 0, 0.0025 ],
                            [ 50000, 0.0024 ],
                            [ 100000, 0.0022 ],
                            [ 250000, 0.0020 ],
                            [ 500000, 0.0018 ],
                            [ 1000000, 0.0016 ],
                            [ 2500000, 0.0014 ],
                            [ 5000000, 0.0012 ],
                            [ 10000000, 0.0010 ],
                        ],
                        'maker': [
                            [ 0, 0.0020 ],
                            [ 50000, 0.0015 ],
                            [ 100000, 0.0010 ],
                            [ 250000, 0.0006 ],
                            [ 500000, 0.0003 ],
                            [ 1000000, 0.0001 ],
                            [ 2500000, -0.0001 ],
                            [ 5000000, -0.0003 ],
                            [ 10000000, -0.0005 ],
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'exceptions': {
                'exact': {
                    '101': ExchangeError, // Unknown error. Operation may or may not have succeeded.
                    '102': BadRequest, // Invalid JSON.
                    '103': RateLimitExceeded, // You have been rate limited. Please observe the Bitvavo-Ratelimit-AllowAt header to see when you can send requests again. Failure to respect this limit will result in an IP ban. The default value is 1000 weighted requests per minute. Please contact support if you wish to increase this limit.
                    '104': RateLimitExceeded, // You have been rate limited by the number of new orders. The default value is 100 new orders per second or 100.000 new orders per day. Please update existing orders instead of cancelling and creating orders. Please contact support if you wish to increase this limit.
                    '105': PermissionDenied, // Your IP or API key has been banned for not respecting the rate limit. The ban expires at ${expiryInMs}.
                    '107': ExchangeNotAvailable, // The matching engine is overloaded. Please wait 500ms and resubmit your order.
                    '108': ExchangeNotAvailable, // The matching engine could not process your order in time. Please consider increasing the access window or resubmit your order.
                    '109': ExchangeNotAvailable, // The matching engine did not respond in time. Operation may or may not have succeeded.
                    '110': BadRequest, // Invalid endpoint. Please check url and HTTP method.
                    '200': BadRequest, // ${param} url parameter is not supported. Please note that parameters are case-sensitive and use body parameters for PUT and POST requests.
                    '201': BadRequest, // ${param} body parameter is not supported. Please note that parameters are case-sensitive and use url parameters for GET and DELETE requests.
                    '202': BadRequest, // ${param} order parameter is not supported. Please note that certain parameters are only allowed for market or limit orders.
                    '203': BadSymbol, // {"errorCode":203,"error":"symbol parameter is required."}
                    '204': BadRequest, // ${param} parameter is not supported.
                    '205': BadRequest, // ${param} parameter is invalid.
                    '206': BadRequest, // Use either ${paramA} or ${paramB}. The usage of both parameters at the same time is not supported.
                    '210': InvalidOrder, // Amount exceeds the maximum allowed amount (1000000000).
                    '211': InvalidOrder, // Price exceeds the maximum allowed amount (100000000000).
                    '212': InvalidOrder, // Amount is below the minimum allowed amount for this asset.
                    '213': InvalidOrder, // Price is below the minimum allowed amount (0.000000000000001).
                    '214': InvalidOrder, // Price is too detailed
                    '215': InvalidOrder, // Price is too detailed. A maximum of 15 digits behind the decimal point are allowed.
                    '216': InsufficientFunds, // {"errorCode":216,"error":"You do not have sufficient balance to complete this operation."}
                    '217': InvalidOrder, // {"errorCode":217,"error":"Minimum order size in quote currency is 5 EUR or 0.001 BTC."}
                    '230': ExchangeError, // The order is rejected by the matching engine.
                    '231': ExchangeError, // The order is rejected by the matching engine. TimeInForce must be GTC when markets are paused.
                    '232': BadRequest, // You must change at least one of amount, amountRemaining, price, timeInForce, selfTradePrevention or postOnly.
                    '233': InvalidOrder, // {"errorCode":233,"error":"Order must be active (status new or partiallyFilled) to allow updating/cancelling."}
                    '234': InvalidOrder, // Market orders cannot be updated.
                    '235': ExchangeError, // You can only have 100 open orders on each book.
                    '236': BadRequest, // You can only update amount or amountRemaining, not both.
                    '240': OrderNotFound, // {"errorCode":240,"error":"No order found. Please be aware that simultaneously updating the same order may return this error."}
                    '300': AuthenticationError, // Authentication is required for this endpoint.
                    '301': AuthenticationError, // {"errorCode":301,"error":"API Key must be of length 64."}
                    '302': AuthenticationError, // Timestamp is invalid. This must be a timestamp in ms. See Bitvavo-Access-Timestamp header or timestamp parameter for websocket.
                    '303': AuthenticationError, // Window must be between 100 and 60000 ms.
                    '304': AuthenticationError, // Request was not received within acceptable window (default 30s, or custom with Bitvavo-Access-Window header) of Bitvavo-Access-Timestamp header (or timestamp parameter for websocket).
                    // '304': AuthenticationError, // Authentication is required for this endpoint.
                    '305': AuthenticationError, // {"errorCode":305,"error":"No active API key found."}
                    '306': AuthenticationError, // No active API key found. Please ensure that you have confirmed the API key by e-mail.
                    '307': PermissionDenied, // This key does not allow access from this IP.
                    '308': AuthenticationError, // {"errorCode":308,"error":"The signature length is invalid (HMAC-SHA256 should return a 64 length hexadecimal string)."}
                    '309': AuthenticationError, // {"errorCode":309,"error":"The signature is invalid."}
                    '310': PermissionDenied, // This key does not allow trading actions.
                    '311': PermissionDenied, // This key does not allow showing account information.
                    '312': PermissionDenied, // This key does not allow withdrawal of funds.
                    '315': BadRequest, // Websocket connections may not be used in a browser. Please use REST requests for this.
                    '317': AccountSuspended, // This account is locked. Please contact support.
                    '400': ExchangeError, // Unknown error. Please contact support with a copy of your request.
                    '401': ExchangeError, // Deposits for this asset are not available at this time.
                    '402': PermissionDenied, // You need to verify your identitiy before you can deposit and withdraw digital assets.
                    '403': PermissionDenied, // You need to verify your phone number before you can deposit and withdraw digital assets.
                    '404': OnMaintenance, // Could not complete this operation, because our node cannot be reached. Possibly under maintenance.
                    '405': ExchangeError, // You cannot withdraw digital assets during a cooldown period. This is the result of newly added bank accounts.
                    '406': BadRequest, // {"errorCode":406,"error":"Your withdrawal is too small."}
                    '407': ExchangeError, // Internal transfer is not possible.
                    '408': InsufficientFunds, // {"errorCode":408,"error":"You do not have sufficient balance to complete this operation."}
                    '409': InvalidAddress, // {"errorCode":409,"error":"This is not a verified bank account."}
                    '410': ExchangeError, // Withdrawals for this asset are not available at this time.
                    '411': BadRequest, // You can not transfer assets to yourself.
                    '412': InvalidAddress, // {"errorCode":412,"error":"eth_address_invalid."}
                    '413': InvalidAddress, // This address violates the whitelist.
                    '414': ExchangeError, // You cannot withdraw assets within 2 minutes of logging in.
                },
                'broad': {
                    'start parameter is invalid': BadRequest, // {"errorCode":205,"error":"start parameter is invalid."}
                    'symbol parameter is invalid': BadSymbol, // {"errorCode":205,"error":"symbol parameter is invalid."}
                    'amount parameter is invalid': InvalidOrder, // {"errorCode":205,"error":"amount parameter is invalid."}
                    'orderId parameter is invalid': InvalidOrder, // {"errorCode":205,"error":"orderId parameter is invalid."}
                },
            },
            'options': {
                'BITVAVO-ACCESS-WINDOW': 10000, // default 10 sec
                'fetchCurrencies': {
                    'expires': 1000, // 1 second
                },
            },
            'commonCurrencies': {
                'MIOTA': 'IOTA', // https://github.com/ccxt/ccxt/issues/7487
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     { "time": 1590379519148 }
        //
        return this.safeInteger (response, 'time');
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const currencies = await this.fetchCurrenciesFromCache (params);
        const currenciesById = this.indexBy (currencies, 'symbol');
        //
        //     [
        //         {
        //             "market":"ADA-BTC",
        //             "status":"trading", // "trading" "halted" "auction"
        //             "base":"ADA",
        //             "quote":"BTC",
        //             "pricePrecision":5,
        //             "minOrderInBaseAsset":"100",
        //             "minOrderInQuoteAsset":"0.001",
        //             "orderTypes": [ "market", "limit" ]
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'market');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const status = this.safeString (market, 'status');
            const active = (status === 'trading');
            const baseCurrency = this.safeValue (currenciesById, baseId);
            let amountPrecision = undefined;
            if (baseCurrency !== undefined) {
                amountPrecision = this.safeInteger (baseCurrency, 'decimals', 8);
            }
            const precision = {
                'price': this.safeInteger (market, 'pricePrecision'),
                'amount': amountPrecision,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'minOrderInBaseAsset'),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeFloat (market, 'minOrderInQuoteAsset'),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.publicGetAssets (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchCurrencies'], 'response');
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        //
        //     [
        //         {
        //             "symbol":"ADA",
        //             "name":"Cardano",
        //             "decimals":6,
        //             "depositFee":"0",
        //             "depositConfirmations":15,
        //             "depositStatus":"OK", // "OK", "MAINTENANCE", "DELISTED"
        //             "withdrawalFee":"0.2",
        //             "withdrawalMinAmount":"0.2",
        //             "withdrawalStatus":"OK", // "OK", "MAINTENANCE", "DELISTED"
        //             "networks": [ "Mainnet" ], // "ETH", "NEO", "ONT", "SEPA", "VET"
        //             "message":"",
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeValue (currency, 'depositStatus');
            const deposit = (depositStatus === 'OK');
            const withdrawalStatus = this.safeValue (currency, 'withdrawalStatus');
            const withdrawal = (withdrawalStatus === 'OK');
            const active = deposit && withdrawal;
            const name = this.safeString (currency, 'name');
            const precision = this.safeInteger (currency, 'decimals', 8);
            result[code] = {
                'id': id,
                'info': currency,
                'code': code,
                'name': name,
                'active': active,
                'fee': this.safeFloat (currency, 'withdrawalFee'),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
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
                    'withdraw': {
                        'min': this.safeFloat (currency, 'withdrawalMinAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetTicker24h (this.extend (request, params));
        //
        //     {
        //         "market":"ETH-BTC",
        //         "open":"0.022578",
        //         "high":"0.023019",
        //         "low":"0.022573",
        //         "last":"0.023019",
        //         "volume":"25.16366324",
        //         "volumeQuote":"0.57333305",
        //         "bid":"0.023039",
        //         "bidSize":"0.53500578",
        //         "ask":"0.023041",
        //         "askSize":"0.47859202",
        //         "timestamp":1590381666900
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     {
        //         "market":"ETH-BTC",
        //         "open":"0.022578",
        //         "high":"0.023019",
        //         "low":"0.022573",
        //         "last":"0.023019",
        //         "volume":"25.16366324",
        //         "volumeQuote":"0.57333305",
        //         "bid":"0.023039",
        //         "bidSize":"0.53500578",
        //         "ask":"0.023041",
        //         "askSize":"0.47859202",
        //         "timestamp":1590381666900
        //     }
        //
        const marketId = this.safeString (ticker, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const last = this.safeFloat (ticker, 'last');
        const baseVolume = this.safeFloat (ticker, 'volume');
        const quoteVolume = this.safeFloat (ticker, 'volumeQuote');
        const vwap = this.vwap (baseVolume, quoteVolume);
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        const open = this.safeFloat (ticker, 'open');
        if ((open !== undefined) && (last !== undefined)) {
            change = last - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, last) / 2;
        }
        const result = {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bidSize'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'askSize'),
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
        return result;
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTicker24h (params);
        //
        //     [
        //         {
        //             "market":"ADA-BTC",
        //             "open":"0.0000059595",
        //             "high":"0.0000059765",
        //             "low":"0.0000059595",
        //             "last":"0.0000059765",
        //             "volume":"2923.172",
        //             "volumeQuote":"0.01743483",
        //             "bid":"0.0000059515",
        //             "bidSize":"1117.630919",
        //             "ask":"0.0000059585",
        //             "askSize":"809.999739",
        //             "timestamp":1590382266324
        //         }
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'tradeIdFrom': '57b1159b-6bf5-4cde-9e2c-6bd6a5678baf',
            // 'tradeIdTo': '57b1159b-6bf5-4cde-9e2c-6bd6a5678baf',
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"94154c98-6e8b-4e33-92a8-74e33fc05650",
        //             "timestamp":1590382761859,
        //             "amount":"0.06026079",
        //             "price":"8095.3",
        //             "side":"buy"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":"94154c98-6e8b-4e33-92a8-74e33fc05650",
        //         "timestamp":1590382761859,
        //         "amount":"0.06026079",
        //         "price":"8095.3",
        //         "side":"buy"
        //     }
        //
        // createOrder, fetchOpenOrders, fetchOrders, editOrder (private)
        //
        //     {
        //         "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //         "timestamp":1590505649245,
        //         "amount":"0.249825",
        //         "price":"183.49",
        //         "taker":true,
        //         "fee":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "settled":true
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "timestamp":1590505649245,
        //         "market":"ETH-EUR",
        //         "side":"sell",
        //         "amount":"0.249825",
        //         "price":"183.49",
        //         "taker":true,
        //         "fee":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "settled":true
        //     }
        //
        // watchMyTrades (private)
        //
        //     {
        //         event: 'fill',
        //         timestamp: 1590964470132,
        //         market: 'ETH-EUR',
        //         orderId: '85d082e1-eda4-4209-9580-248281a29a9a',
        //         fillId: '861d2da5-aa93-475c-8d9a-dce431bd4211',
        //         side: 'sell',
        //         amount: '0.1',
        //         price: '211.46',
        //         taker: true,
        //         fee: '0.056',
        //         feeCurrency: 'EUR'
        //     }
        //
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'side');
        const id = this.safeString2 (trade, 'id', 'fillId');
        const marketId = this.safeInteger (trade, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const taker = this.safeValue (trade, 'taker');
        let takerOrMaker = undefined;
        if (taker !== undefined) {
            takerOrMaker = taker ? 'taker' : 'maker';
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return {
            'info': trade,
            'id': id,
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetMarketBook (this.extend (request, params));
        //
        //     {
        //         "market":"BTC-EUR",
        //         "nonce":35883831,
        //         "bids":[
        //             ["8097.4","0.6229099"],
        //             ["8097.2","0.64151283"],
        //             ["8097.1","0.24966294"],
        //         ],
        //         "asks":[
        //             ["8097.5","1.36916911"],
        //             ["8098.8","0.33462248"],
        //             ["8099.3","1.12908646"],
        //         ]
        //     }
        //
        const orderbook = this.parseOrderBook (response);
        orderbook['nonce'] = this.safeInteger (response, 'nonce');
        return orderbook;
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     [
        //         1590383700000,
        //         "8088.5",
        //         "8088.5",
        //         "8088.5",
        //         "8088.5",
        //         "0.04788623"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeFloat (ohlcv, 1),
            this.safeFloat (ohlcv, 2),
            this.safeFloat (ohlcv, 3),
            this.safeFloat (ohlcv, 4),
            this.safeFloat (ohlcv, 5),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'interval': this.timeframes[timeframe],
            // 'limit': 1440, // default 1440, max 1440
            // 'start': since,
            // 'end': this.milliseconds (),
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 1440, max 1440
        }
        const response = await this.publicGetMarketCandles (this.extend (request, params));
        //
        //     [
        //         [1590383700000,"8088.5","8088.5","8088.5","8088.5","0.04788623"],
        //         [1590383580000,"8091.3","8091.5","8091.3","8091.5","0.04931221"],
        //         [1590383520000,"8090.3","8092.7","8090.3","8092.5","0.04001286"],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     [
        //         {
        //             "symbol": "BTC",
        //             "available": "1.57593193",
        //             "inOrder": "0.74832374"
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'available'),
                'used': this.safeFloat (balance, 'inOrder'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
        };
        const response = await this.privateGetDeposit (this.extend (request, params));
        //
        //     {
        //         "address": "0x449889e3234514c45d57f7c5a571feba0c7ad567",
        //         "paymentId": "10002653"
        //     }
        //
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'paymentId');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'orderType': type,
            // 'amount': this.amountToPrecision (symbol, amount),
            // 'price': this.priceToPrecision (symbol, price),
            // 'amountQuote': this.costToPrecision (symbol, cost),
            // 'timeInForce': 'GTC', // "GTC" "IOC" "FOK"
            // 'selfTradePrevention': "decrementAndCancel", // "decrementAndCancel" "cancelOldest" "cancelNewest" "cancelBoth"
            // 'postOnly': false,
            // 'disableMarketProtection': false, // don't cancel if the next fill price is 10% worse than the best fill price
            // 'responseRequired': true, // false is faster
        };
        if (type === 'market') {
            let cost = undefined;
            if (price !== undefined) {
                cost = amount * price;
            } else {
                cost = this.safeFloat2 (params, 'cost', 'amountQuote');
            }
            if (cost !== undefined) {
                const precision = market['precision']['price'];
                request['amountQuote'] = this.decimalToPrecision (cost, TRUNCATE, precision, this.precisionMode);
            } else {
                request['amount'] = this.amountToPrecision (symbol, amount);
            }
            params = this.omit (params, [ 'cost', 'amountQuote' ]);
        } else if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        const response = await this.privatePostOrder (this.extend (request, params));
        //
        //     {
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "market":"ETH-EUR",
        //         "created":1590505649241,
        //         "updated":1590505649241,
        //         "status":"filled",
        //         "side":"sell",
        //         "orderType":"market",
        //         "amount":"0.249825",
        //         "amountRemaining":"0",
        //         "onHold":"0",
        //         "onHoldCurrency":"ETH",
        //         "filledAmount":"0.249825",
        //         "filledAmountQuote":"45.84038925",
        //         "feePaid":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "fills":[
        //             {
        //                 "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                 "timestamp":1590505649245,
        //                 "amount":"0.249825",
        //                 "price":"183.49",
        //                 "taker":true,
        //                 "fee":"0.12038925",
        //                 "feeCurrency":"EUR",
        //                 "settled":true
        //             }
        //         ],
        //         "selfTradePrevention":"decrementAndCancel",
        //         "visible":false,
        //         "disableMarketProtection":false
        //     }
        //
        return this.parseOrder (response, market);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {};
        const amountRemaining = this.safeFloat (params, 'amountRemaining');
        params = this.omit (params, 'amountRemaining');
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (amountRemaining !== undefined) {
            request['amountRemaining'] = this.amountToPrecision (symbol, amountRemaining);
        }
        request = this.extend (request, params);
        if (Object.keys (request).length) {
            request['orderId'] = id;
            request['market'] = market['id'];
            const response = await this.privatePutOrder (this.extend (request, params));
            return this.parseOrder (response, market);
        } else {
            throw new ArgumentsRequired (this.id + ' editOrder requires an amount argument, or a price argument, or non-empty params');
        }
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        const response = await this.privateDeleteOrder (this.extend (request, params));
        //
        //     {
        //         "orderId": "2e7ce7fc-44e2-4d80-a4a7-d079c4750b61"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId": "1be6d0df-d5dc-4b53-a250-3376f3b393e6"
        //         }
        //     ]
        //
        return this.parseOrders (response, market);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'market': market['id'],
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        //
        //     {
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "market":"ETH-EUR",
        //         "created":1590505649241,
        //         "updated":1590505649241,
        //         "status":"filled",
        //         "side":"sell",
        //         "orderType":"market",
        //         "amount":"0.249825",
        //         "amountRemaining":"0",
        //         "onHold":"0",
        //         "onHoldCurrency":"ETH",
        //         "filledAmount":"0.249825",
        //         "filledAmountQuote":"45.84038925",
        //         "feePaid":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "fills":[
        //             {
        //                 "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                 "timestamp":1590505649245,
        //                 "amount":"0.249825",
        //                 "price":"183.49",
        //                 "taker":true,
        //                 "fee":"0.12038925",
        //                 "feeCurrency":"EUR",
        //                 "settled":true
        //             }
        //         ],
        //         "selfTradePrevention":"decrementAndCancel",
        //         "visible":false,
        //         "disableMarketProtection":false
        //     }
        //
        return this.parseOrder (response, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500,
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'orderIdFrom': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
            // 'orderIdTo': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //             "market":"ETH-EUR",
        //             "created":1590505649241,
        //             "updated":1590505649241,
        //             "status":"filled",
        //             "side":"sell",
        //             "orderType":"market",
        //             "amount":"0.249825",
        //             "amountRemaining":"0",
        //             "onHold":"0",
        //             "onHoldCurrency":"ETH",
        //             "filledAmount":"0.249825",
        //             "filledAmountQuote":"45.84038925",
        //             "feePaid":"0.12038925",
        //             "feeCurrency":"EUR",
        //             "fills":[
        //                 {
        //                     "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                     "timestamp":1590505649245,
        //                     "amount":"0.249825",
        //                     "price":"183.49",
        //                     "taker":true,
        //                     "fee":"0.12038925",
        //                     "feeCurrency":"EUR",
        //                     "settled":true
        //                 }
        //             ],
        //             "selfTradePrevention":"decrementAndCancel",
        //             "visible":false,
        //             "disableMarketProtection":false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'market': market['id'],
            // 'limit': 500,
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'orderIdFrom': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
            // 'orderIdTo': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetOrdersOpen (this.extend (request, params));
        //
        //     [
        //         {
        //             "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //             "market":"ETH-EUR",
        //             "created":1590505649241,
        //             "updated":1590505649241,
        //             "status":"filled",
        //             "side":"sell",
        //             "orderType":"market",
        //             "amount":"0.249825",
        //             "amountRemaining":"0",
        //             "onHold":"0",
        //             "onHoldCurrency":"ETH",
        //             "filledAmount":"0.249825",
        //             "filledAmountQuote":"45.84038925",
        //             "feePaid":"0.12038925",
        //             "feeCurrency":"EUR",
        //             "fills":[
        //                 {
        //                     "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                     "timestamp":1590505649245,
        //                     "amount":"0.249825",
        //                     "price":"183.49",
        //                     "taker":true,
        //                     "fee":"0.12038925",
        //                     "feeCurrency":"EUR",
        //                     "settled":true
        //                 }
        //             ],
        //             "selfTradePrevention":"decrementAndCancel",
        //             "visible":false,
        //             "disableMarketProtection":false
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'canceled': 'canceled',
            'canceledAuction': 'canceled',
            'canceledSelfTradePrevention': 'canceled',
            'canceledIOC': 'canceled',
            'canceledFOK': 'canceled',
            'canceledMarketProtection': 'canceled',
            'canceledPostOnly': 'canceled',
            'filled': 'closed',
            'partiallyFilled': 'open',
            'expired': 'canceled',
            'rejected': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // cancelOrder, cancelAllOrders
        //
        //     {
        //         "orderId": "2e7ce7fc-44e2-4d80-a4a7-d079c4750b61"
        //     }
        //
        // createOrder, fetchOrder, fetchOpenOrders, fetchOrders, editOrder
        //
        //     {
        //         "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //         "market":"ETH-EUR",
        //         "created":1590505649241,
        //         "updated":1590505649241,
        //         "status":"filled",
        //         "side":"sell",
        //         "orderType":"market",
        //         "amount":"0.249825",
        //         "amountRemaining":"0",
        //         "price": "183.49", // limit orders only
        //         "onHold":"0",
        //         "onHoldCurrency":"ETH",
        //         "filledAmount":"0.249825",
        //         "filledAmountQuote":"45.84038925",
        //         "feePaid":"0.12038925",
        //         "feeCurrency":"EUR",
        //         "fills":[
        //             {
        //                 "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //                 "timestamp":1590505649245,
        //                 "amount":"0.249825",
        //                 "price":"183.49",
        //                 "taker":true,
        //                 "fee":"0.12038925",
        //                 "feeCurrency":"EUR",
        //                 "settled":true
        //             }
        //         ],
        //         "selfTradePrevention":"decrementAndCancel",
        //         "visible":false,
        //         "disableMarketProtection":false
        //         "timeInForce": "GTC",
        //         "postOnly": true,
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeInteger (order, 'created');
        const marketId = this.safeString (order, 'market');
        const symbol = this.safeSymbol (marketId, market, '-');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'orderType');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        let remaining = this.safeFloat (order, 'amountRemaining');
        let filled = this.safeFloat (order, 'filledAmount');
        const remainingCost = this.safeFloat (order, 'remainingCost');
        if ((remainingCost !== undefined) && (remainingCost === 0.0)) {
            remaining = 0;
        }
        if ((amount !== undefined) && (remaining !== undefined)) {
            filled = Math.max (0, amount - remaining);
        }
        const cost = this.safeFloat (order, 'filledAmountQuote');
        let average = undefined;
        if (cost !== undefined) {
            if (filled) {
                average = cost / filled;
            }
        }
        let fee = undefined;
        const feeCost = this.safeFloat (order, 'feePaid');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (order, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        let lastTradeTimestamp = undefined;
        const rawTrades = this.safeValue (order, 'fills');
        let trades = undefined;
        if (rawTrades !== undefined) {
            trades = this.parseTrades (rawTrades, market, undefined, undefined, {
                'symbol': symbol,
                'order': id,
                'side': side,
            });
            const numTrades = trades.length;
            if (numTrades > 0) {
                const lastTrade = this.safeValue (trades, numTrades - 1);
                lastTradeTimestamp = lastTrade['timestamp'];
            }
        }
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': trades,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            // 'limit': 500,
            // 'start': since,
            // 'end': this.milliseconds (),
            // 'tradeIdFrom': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
            // 'tradeIdTo': 'af76d6ce-9f7c-4006-b715-bb5d430652d0',
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":"b0c86aa5-6ed3-4a2d-ba3a-be9a964220f4",
        //             "orderId":"af76d6ce-9f7c-4006-b715-bb5d430652d0",
        //             "timestamp":1590505649245,
        //             "market":"ETH-EUR",
        //             "side":"sell",
        //             "amount":"0.249825",
        //             "price":"183.49",
        //             "taker":true,
        //             "fee":"0.12038925",
        //             "feeCurrency":"EUR",
        //             "settled":true
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'symbol': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'address': address, // address or IBAN
            // 'internal': false, // transfer to another Bitvavo user address, no fees
            // 'addWithdrawalFee': false, // true = add the fee on top, otherwise the fee is subtracted from the amount
        };
        if (tag !== undefined) {
            request['paymentId'] = tag;
        }
        const response = await this.privatePostWithdrawal (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "symbol": "BTC",
        //         "amount": "1.5"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': currency['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetWithdrawalHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp":1590531212000,
        //             "symbol":"ETH",
        //             "amount":"0.091",
        //             "fee":"0.009",
        //             "status":"awaiting_bitvavo_inspection",
        //             "address":"0xe42b309f1eE9F0cbf7f54CcF3bc2159eBfA6735b",
        //             "paymentId": "10002653",
        //             "txId": "927b3ea50c5bb52c6854152d305dfa1e27fc01d10464cf10825d96d69d235eb3",
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'symbol': currency['id'],
            // 'limit': 500, // default 500, max 1000
            // 'start': since,
            // 'end': this.milliseconds (),
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['symbol'] = currency['id'];
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500, max 1000
        }
        const response = await this.privateGetDepositHistory (this.extend (request, params));
        //
        //     [
        //         {
        //             "timestamp":1590492401000,
        //             "symbol":"ETH",
        //             "amount":"0.249825",
        //             "fee":"0",
        //             "status":"completed",
        //             "txId":"0x5167b473fd37811f9ef22364c3d54726a859ef9d98934b3a1e11d7baa8d2c2e2"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'awaiting_processing': 'pending',
            'awaiting_email_confirmation': 'pending',
            'awaiting_bitvavo_inspection': 'pending',
            'approved': 'pending',
            'sending': 'pending',
            'in_mempool': 'pending',
            'processed': 'pending',
            'completed': 'ok',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         "success": true,
        //         "symbol": "BTC",
        //         "amount": "1.5"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "timestamp": 1542967486256,
        //         "symbol": "BTC",
        //         "amount": "0.99994",
        //         "address": "BitcoinAddress",
        //         "paymentId": "10002653",
        //         "txId": "927b3ea50c5bb52c6854152d305dfa1e27fc01d10464cf10825d96d69d235eb3",
        //         "fee": "0.00006",
        //         "status": "awaiting_processing"
        //     }
        //
        // fetchDeposits
        //
        //     {
        //         "timestamp":1590492401000,
        //         "symbol":"ETH",
        //         "amount":"0.249825",
        //         "fee":"0",
        //         "status":"completed",
        //         "txId":"0x5167b473fd37811f9ef22364c3d54726a859ef9d98934b3a1e11d7baa8d2c2e2"
        //     }
        //
        const id = undefined;
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const txid = this.safeString (transaction, 'txId');
        let fee = undefined;
        const feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        let type = undefined;
        if ('success' in transaction) {
            type = 'withdrawal';
        } else {
            type = (status === undefined) ? 'deposit' : 'withdrawal';
        }
        const tag = this.safeString (transaction, 'paymentId');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = '/' + this.version + '/' + this.implodeParams (path, params);
        const getOrDelete = (method === 'GET') || (method === 'DELETE');
        if (getOrDelete) {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let payload = '';
            if (!getOrDelete) {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            const timestamp = this.milliseconds ().toString ();
            const auth = timestamp + method + url + payload;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            const accessWindow = this.safeString (this.options, 'BITVAVO-ACCESS-WINDOW', '10000');
            headers = {
                'BITVAVO-ACCESS-KEY': this.apiKey,
                'BITVAVO-ACCESS-SIGNATURE': signature,
                'BITVAVO-ACCESS-TIMESTAMP': timestamp,
                'BITVAVO-ACCESS-WINDOW': accessWindow,
            };
            if (!getOrDelete) {
                headers['Content-Type'] = 'application/json';
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"errorCode":308,"error":"The signature length is invalid (HMAC-SHA256 should return a 64 length hexadecimal string)."}
        //     {"errorCode":203,"error":"symbol parameter is required."}
        //     {"errorCode":205,"error":"symbol parameter is invalid."}
        //
        const errorCode = this.safeString (response, 'errorCode');
        const error = this.safeString (response, 'error');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
