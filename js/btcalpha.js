'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection, InvalidOrder, InsufficientFunds } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class btcalpha extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcalpha',
            'name': 'BTC-Alpha',
            'countries': [ 'US' ],
            'version': 'v1',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchClosedOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': undefined,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': 'D',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg',
                'api': 'https://btc-alpha.com/api',
                'www': 'https://btc-alpha.com',
                'doc': 'https://btc-alpha.github.io/api-docs',
                'fees': 'https://btc-alpha.com/fees/',
                'referral': 'https://btc-alpha.com/?r=123788',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies/',
                        'pairs/',
                        'orderbook/{pair_name}/',
                        'exchanges/',
                        'charts/{pair}/{type}/chart/',
                    ],
                },
                'private': {
                    'get': [
                        'wallets/',
                        'orders/own/',
                        'order/{id}/',
                        'exchanges/own/',
                        'deposits/',
                        'withdraws/',
                    ],
                    'post': [
                        'order/',
                        'order-cancel/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'commonCurrencies': {
                'CBC': 'Cashbery',
            },
            'exceptions': {
                'exact': {},
                'broad': {
                    'Out of balance': InsufficientFunds, // {"date":1570599531.4814300537,"error":"Out of balance -9.99243661 BTC"}
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetPairs (params);
        //
        //    [
        //        {
        //            "name": "1INCH_USDT",
        //            "currency1": "1INCH",
        //            "currency2": "USDT",
        //            "price_precision": 4,
        //            "amount_precision": 2,
        //            "minimum_order_size": "0.01000000",
        //            "maximum_order_size": "900000.00000000",
        //            "minimum_order_value": "10.00000000",
        //            "liquidity_type": 10
        //        },
        //    ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'currency1');
            const quoteId = this.safeString (market, 'currency2');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const pricePrecision = this.safeString (market, 'price_precision');
            const priceLimit = this.parsePrecision (pricePrecision);
            const amountLimit = this.safeString (market, 'minimum_order_size');
            result.push ({
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
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': parseInt ('8'),
                    'price': parseInt (pricePrecision),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.parseNumber (amountLimit),
                        'max': this.safeNumber (market, 'maximum_order_size'),
                    },
                    'price': {
                        'min': this.parseNumber (priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber (Precise.stringMul (priceLimit, amountLimit)),
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair_name': this.marketId (symbol),
        };
        if (limit) {
            request['limit_sell'] = limit;
            request['limit_buy'] = limit;
        }
        const response = await this.publicGetOrderbookPairName (this.extend (request, params));
        return this.parseOrderBook (response, symbol, undefined, 'buy', 'sell', 'price', 'amount');
    }

    parseBidsAsks (bidasks, priceKey = 0, amountKey = 1) {
        const result = [];
        for (let i = 0; i < bidasks.length; i++) {
            const bidask = bidasks[i];
            if (bidask) {
                result.push (this.parseBidAsk (bidask, priceKey, amountKey));
            }
        }
        return result;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "id": "202203440",
        //          "timestamp": "1637856276.264215",
        //          "pair": "AAVE_USDT",
        //          "price": "320.79900000",
        //          "amount": "0.05000000",
        //          "type": "buy"
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "id": "202203440",
        //          "timestamp": "1637856276.264215",
        //          "pair": "AAVE_USDT",
        //          "price": "320.79900000",
        //          "amount": "0.05000000",
        //          "type": "buy",
        //          "my_side": "buy"
        //      }
        //
        const marketId = this.safeString (trade, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const id = this.safeString (trade, 'id');
        const side = this.safeString2 (trade, 'my_side', 'type');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': id,
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.publicGetExchanges (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":1591296000,
        //         "open":0.024746,
        //         "close":0.024728,
        //         "low":0.024728,
        //         "high":0.024753,
        //         "volume":16.624
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.publicGetChartsPairTypeChart (this.extend (request, params));
        //
        //     [
        //         {"time":1591296000,"open":0.024746,"close":0.024728,"low":0.024728,"high":0.024753,"volume":16.624},
        //         {"time":1591295700,"open":0.024718,"close":0.02475,"low":0.024711,"high":0.02475,"volume":31.645},
        //         {"time":1591295400,"open":0.024721,"close":0.024717,"low":0.024711,"high":0.02473,"volume":65.071}
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseBalance (response) {
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'reserve');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWallets (params);
        return this.parseBalance (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            '1': 'open',
            '2': 'canceled',
            '3': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // fetchClosedOrders / fetchOrder
        //     {
        //       "id": "923763073",
        //       "date": "1635451090368",
        //       "type": "sell",
        //       "pair": "XRP_USDT",
        //       "price": "1.00000000",
        //       "amount": "0.00000000",
        //       "status": "3",
        //       "amount_filled": "10.00000000",
        //       "amount_original": "10.0"
        //       "trades": [],
        //     }
        //
        // createOrder
        //     {
        //       "success": true,
        //       "date": "1635451754.497541",
        //       "type": "sell",
        //       "oid": "923776755",
        //       "price": "1.0",
        //       "amount": "10.0",
        //       "amount_filled": "0.0",
        //       "amount_original": "10.0",
        //       "trades": []
        //     }
        //
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market, '_');
        const symbol = market['symbol'];
        const success = this.safeValue (order, 'success', false);
        let timestamp = undefined;
        if (success) {
            timestamp = this.safeTimestamp (order, 'date');
        } else {
            timestamp = this.safeInteger (order, 'date');
        }
        const price = this.safeString (order, 'price');
        const remaining = this.safeString (order, 'amount');
        const filled = this.safeString (order, 'amount_filled');
        const amount = this.safeString (order, 'amount_original');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const id = this.safeString2 (order, 'oid', 'id');
        const trades = this.safeValue (order, 'trades');
        const side = this.safeString2 (order, 'my_side', 'type');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
            'info': order,
            'lastTradeTimestamp': undefined,
            'average': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'type': side,
            'amount': amount,
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrder (this.extend (request, params));
        if (!response['success']) {
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        }
        const order = this.parseOrder (response, market);
        amount = (order['amount'] > 0) ? order['amount'] : amount;
        return this.extend (order, {
            'amount': amount,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'order': id,
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const order = await this.privateGetOrderId (this.extend (request, params));
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const orders = await this.privateGetOrdersOwn (this.extend (request, params));
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': '1',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': '3',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const trades = await this.privateGetExchangesOwn (this.extend (request, params));
        return this.parseTrades (trades, undefined, since, limit);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.urlencode (this.keysort (this.omit (params, this.extractParams (path))));
        let url = this.urls['api'] + '/';
        if (path !== 'charts/{pair}/{type}/chart/') {
            url += 'v1/';
        }
        url += this.implodeParams (path, params);
        headers = { 'Accept': 'application/json' };
        if (api === 'public') {
            if (query.length) {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            let payload = this.apiKey;
            if (method === 'POST') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                body = query;
                payload += body;
            } else if (query.length) {
                url += '?' + query;
            }
            headers['X-KEY'] = this.apiKey;
            headers['X-SIGN'] = this.hmac (this.encode (payload), this.encode (this.secret));
            headers['X-NONCE'] = this.nonce ().toString ();
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        //
        //     {"date":1570599531.4814300537,"error":"Out of balance -9.99243661 BTC"}
        //
        const error = this.safeString (response, 'error');
        const feedback = this.id + ' ' + body;
        if (error !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
        }
        if (code === 401 || code === 403) {
            throw new AuthenticationError (feedback);
        } else if (code === 429) {
            throw new DDoSProtection (feedback);
        }
        if (code < 400) {
            return;
        }
        throw new ExchangeError (feedback);
    }
};
