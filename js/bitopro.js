'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitopro extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitopro',
            'name': 'BitoPro',
            'countries': [ 'TW' ], // Taiwan
            'version': 'v3',
            'rateLimit': 600,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://www.bitopro.com/bitoPro_logo.svg',
                'api': 'https://api.bitopro.com/v3',
                'www': 'https://www.bitopro.com',
                'doc': [
                    'https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md',
                ],
                'fees': 'https://www.bitopro.com/fees',
                'referral': '',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'order-book/{pair}',
                        'tickers',
                        'tickers/{pair}',
                        'trades/{pair}',
                        'provisioning/currencies',
                        'provisioning/trading-pairs',
                        'provisioning/limitations-and-fees',
                        'trading-history/{pair}',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/balance',
                        'orders/history',
                        'orders/{pair}',
                        'orders/{pair}/{orderId}',
                    ],
                    'post': [
                        'orders/{pair}',
                    ],
                    'delete': [
                        'orders/{pair}/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.00194') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0014') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.0013') ],
                            [ this.parseNumber ('550000000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('1300000000'), this.parseNumber ('0.0011') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('3000000'), this.parseNumber ('0.00097') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('30000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('300000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('550000000'), this.parseNumber ('0.0004') ],
                            [ this.parseNumber ('1300000000'), this.parseNumber ('0.0003') ],
                        ],
                    },
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {},
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetProvisioningCurrencies (params);
        const currencies = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "currency":"eth",
        //                 "withdrawFee":"0.007",
        //                 "minWithdraw":"0.001",
        //                 "maxWithdraw":"1000",
        //                 "maxDailyWithdraw":"2000",
        //                 "withdraw":true,
        //                 "deposit":true,
        //                 "depositConfirmation":"12"
        //             }
        //         ]
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeString (currency, 'currency');
            const deposit = this.safeValue (currency, 'deposit');
            const withdraw = this.safeValue (currency, 'withdraw');
            const fee = this.safeNumber (currency, 'withdrawFee');
            const withdrawMin = this.safeNumber (currency, 'minWithdraw');
            const withdrawMax = this.safeNumber (currency, 'maxWithdraw');
            const limits = {
                'withdraw': {
                    'min': withdrawMin,
                    'max': withdrawMax,
                },
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': undefined,
                'active': deposit && withdraw,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'precision': undefined,
                'limits': limits,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProvisioningTradingPairs ();
        const markets = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "pair":"shib_twd",
        //                 "base":"shib",
        //                 "quote":"twd",
        //                 "basePrecision":"8",
        //                 "quotePrecision":"6",
        //                 "minLimitBaseAmount":"100000",
        //                 "maxLimitBaseAmount":"5500000000",
        //                 "minMarketBuyQuoteAmount":"1000",
        //                 "orderOpenLimit":"200",
        //                 "maintain":false,
        //                 "orderBookQuotePrecision":"6",
        //                 "orderBookQuoteScaleLevel":"5"
        //             }
        //         ]
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const active = !this.safeValue (market, 'maintain');
            const pair = this.safeString (market, 'pair');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'quote');
            const id = pair;
            let base = this.safeCurrencyCode (baseId);
            base = base.toUpperCase ();
            let quote = this.safeCurrencyCode (quoteId);
            quote = quote.toUpperCase ();
            const symbol = base + '/' + quote;
            const precision = {
                'price': this.safeInteger (market, 'quotePrecision'),
                'amount': this.safeInteger (market, 'basePrecision'),
            };
            const limits = {
                'amount': {
                    'min': this.safeNumber (market, 'minLimitBaseAmount'),
                    'max': this.safeNumber (market, 'maxLimitBaseAmount'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'linear': false,
                'inverse': false,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': limits,
                'precision': precision,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "pair":"btc_twd",
        //         "lastPrice":"1182449.00000000",
        //         "isBuyer":false,
        //         "priceChange24hr":"-1.99",
        //         "volume24hr":"9.13089740",
        //         "high24hr":"1226097.00000000",
        //         "low24hr":"1181000.00000000"
        //     }
        //
        const timestamp = this.milliseconds ();
        const marketId = this.safeString (ticker, 'pair');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24hr'),
            'low': this.safeString (ticker, 'low24hr'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'lastPrice'),
            'last': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'priceChange24hr'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume24hr'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTickersPair (this.extend (request, params));
        const ticker = this.safeValue (response, 'data', {});
        //
        //     {
        //         "data":{
        //             "pair":"btc_twd",
        //             "lastPrice":"1182449.00000000",
        //             "isBuyer":false,
        //             "priceChange24hr":"-1.99",
        //             "volume24hr":"9.13089740",
        //             "high24hr":"1226097.00000000",
        //             "low24hr":"1181000.00000000"
        //         }
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        const response = await this.publicGetTickers ();
        const tickers = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "pair":"xrp_twd",
        //                 "lastPrice":"21.26110000",
        //                 "isBuyer":false,
        //                 "priceChange24hr":"-6.53",
        //                 "volume24hr":"102846.47084802",
        //                 "high24hr":"23.24460000",
        //                 "low24hr":"21.13730000"
        //             }
        //         ]
        //     }
        //
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        const timestamp = this.milliseconds ();
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        //
        //     {
        //         "bids":[
        //             {
        //                 "price":"1175271",
        //                 "amount":"0.00022804",
        //                 "count":1,
        //                 "total":"0.00022804"
        //             }
        //         ],
        //         "asks":[
        //             {
        //                 "price":"1176906",
        //                 "amount":"0.0496",
        //                 "count":1,
        //                 "total":"0.0496"
        //             }
        //         ]
        //     }
        //
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market) {
        //
        //     {
        //         "data":[
        //             {
        //                 "timestamp":1644651458,
        //                 "price":"1180785.00000000",
        //                 "amount":"0.00020000",
        //                 "isBuyer":false
        //             }
        //         ]
        //     }
        //
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const timestampSeconds = this.safeInteger (trade, 'timestamp');
        const timestamp = timestampSeconds * 1000;
        const isBuyer = this.safeValue (trade, 'isBuyer');
        let side = undefined;
        if (isBuyer) {
            side = 'buy';
        } else {
            side = 'sell';
        }
        return this.safeTrade ({
            'info': trade,
            'id': market['id'],
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'takerOrMaker': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradesPair (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "timestamp":1644651458,
        //                 "price":"1180785.00000000",
        //                 "amount":"0.00020000",
        //                 "isBuyer":false
        //             }
        //         ]
        //     }
        //
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = 500, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.timeframes[timeframe];
        const request = {
            'pair': market['id'],
            'resolution': resolution,
        };
        if (since === undefined) {
            request['to'] = this.seconds ();
            request['from'] = request['to'] - limit * this.parseTimeframe (timeframe);
        } else {
            request['from'] = parseInt (since / 1000);
            request['to'] = this.sum (request['from'], limit * this.parseTimeframe (timeframe));
        }
        const response = await this.publicGetTradingHistoryPair (this.extend (request, params));
        const data = this.safeValue (response, 'data', []);
        //
        //     {
        //         "data":[
        //             {
        //                 "timestamp":1644581100000,
        //                 "open":"1214737",
        //                 "high":"1215110",
        //                 "low":"1214737",
        //                 "close":"1215110",
        //                 "volume":"0.08423959"
        //             }
        //         ]
        //     }
        //
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountsBalance (params);
        const balances = this.safeValue (response, 'data', []);
        const result = {
            'info': balances,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            let currencyId = this.safeString (balance, 'currency');
            currencyId = currencyId.toUpperCase ();
            const amount = this.safeFloat (balance, 'amount');
            const available = this.safeFloat (balance, 'available');
            const stake = this.safeFloat (balance, 'stake');
            const account = {
                'free': available,
                'stake': stake,
                'used': amount - available - stake,
                'total': amount,
            };
            result[currencyId] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderExecution (order) {
        const orderId = this.safeString (order, 'orderId');
        return {
            'id': orderId,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired ('createOrder requires the symbol parameter');
        }
        const request = {
            'type': type.toUpperCase (),
            'pair': this.marketId (symbol),
            'action': side.toUpperCase (),
            'amount': amount,
            'timestamp': this.nonce (),
        };
        if (type.toLowerCase () === 'limit') {
            request['price'] = price;
        }
        const response = await this.privatePostOrdersPair (this.extend (request, params), params);
        return this.parseOrderExecution (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired ('cancelOrder requires the symbol parameter');
        }
        const request = {
            'pair': this.marketId (symbol),
            'id': id,
        };
        const response = await this.privateDeleteOrdersPairId (this.extend (request, params));
        return this.parseOrderExecution (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open',
            '2': 'closed',
            '3': 'closed',
            '4': 'canceled',
        };
        return this.safeString (statuses, status, undefined);
    }

    parseOrder (order, market = undefined) {
        const orderId = this.safeString (order, 'id');
        const timestamp = this.safeInteger (order, 'timestamp');
        const marketId = this.safeString (order, 'pair');
        market = this.safeValue (this.markets_by_id, marketId);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const symbol = this.safeString (market, 'symbol');
        const type = this.safeString (order, 'type').toLowerCase ();
        const side = this.safeString (order, 'action').toLowerCase ();
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'originalAmount');
        const filled = this.safeFloat (order, 'executedAmount');
        const remaining = this.safeFloat (order, 'remainingAmount');
        const fee = this.safeFloat (order, 'fee');
        let feeSymbol = this.safeString (order, 'feeSymbol');
        feeSymbol = feeSymbol.toUpperCase ();
        return {
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'type': type,
            'status': status,
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'cost': undefined,
            'remaining': remaining,
            'average': undefined,
            'trades': undefined,
            'fee': {
                'currency': feeSymbol,
                'cost': fee,
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
            'pair': this.marketId (symbol),
        };
        const response = await this.privateGetOrdersPairOrderId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privateGetOrdersPair (this.extend (request, params), params);
        const orders = this.safeValue (response, 'data', []);
        const orderLength = orders.length;
        const result = [];
        for (let i = 0; i < orderLength; i++) {
            const order = orders[i];
            const parsedOrder = this.parseOrder (order);
            result.push (parsedOrder);
        }
        return result;
    }

    fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'active': true,
        };
        return this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'active': false,
        };
        const orders = await this.fetchOrders (symbol, since, limit, this.extend (request, params));
        const result = [];
        const orderLength = orders.length;
        for (let i = 0; i < orderLength; i++) {
            const order = orders[i];
            const status = this.safeString (order, 'status');
            if (status === 'closed' || status === 'canceled') {
                result.push (order);
            }
        }
        return result;
    }

    parseMyTrade (myTrade) {
        const orderId = this.safeString (myTrade, 'id');
        const timestamp = this.safeInteger (myTrade, 'timestamp');
        const marketId = this.safeString (myTrade, 'pair');
        const market = this.safeValue (this.markets_by_id, marketId);
        const symbol = this.safeString (market, 'symbol');
        const type = this.safeString (myTrade, 'type').toLowerCase ();
        const side = this.safeString (myTrade, 'action').toLowerCase ();
        const price = this.safeFloat (myTrade, 'price');
        const filled = this.safeFloat (myTrade, 'executedAmount');
        const fee = this.safeFloat (myTrade, 'fee');
        let feeSymbol = this.safeString (myTrade, 'feeSymbol');
        feeSymbol = feeSymbol.toUpperCase ();
        return {
            'info': myTrade,
            'id': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': filled,
            'cost': undefined,
            'fee': {
                'cost': fee,
                'currency': feeSymbol,
                'rate': undefined,
            },
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        const trades = this.safeValue (response, 'data', []);
        const tradesLength = trades.length;
        const result = [];
        for (let i = 0; i < tradesLength; i++) {
            const trade = trades[i];
            const executedAmount = this.safeFloat (trade, 'executedAmount');
            if (executedAmount > 0 && trade['pair'] === market['id']) {
                const myTrade = this.parseMyTrade (trade);
                result.push (myTrade);
            }
        }
        return result;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (headers === undefined) {
            headers = {};
        }
        headers['X-BITOPRO-API'] = 'ccxt';
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = this.json (params);
                const payload = this.stringToBase64 (body);
                const signature = this.hmac (payload, this.secret, 'sha384', 'hex');
                headers['X-BITOPRO-APIKEY'] = this.apiKey;
                headers['X-BITOPRO-PAYLOAD'] = payload;
                headers['X-BITOPRO-SIGNATURE'] = signature;
            } else if (method === 'GET' || method === 'DELETE') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
                const nonce = this.nonce ();
                let rawData = {
                    'identity': this.email,
                    'nonce': nonce,
                };
                rawData = this.json (rawData);
                const payload = this.stringToBase64 (rawData);
                const signature = this.hmac (payload, this.secret, 'sha384', 'hex');
                headers['X-BITOPRO-APIKEY'] = this.apiKey;
                headers['X-BITOPRO-PAYLOAD'] = payload;
                headers['X-BITOPRO-SIGNATURE'] = signature;
            }
        } else if (api === 'public' && method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code >= 200 && code < 300) {
            return;
        }
        if (code === 401) {
            throw new AuthenticationError (body);
        }
        if (code === 429) {
            throw new DDoSProtection (body);
        }
        const feedback = body;
        throw new ExchangeError (feedback);
    }
};
