'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { BadSymbol, BadRequest, ExchangeError, ArgumentsRequired, OrderNotFound, OnMaintenance } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class coinone extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinone',
            'name': 'CoinOne',
            'countries': [ 'KR' ], // Korea
            // 'enableRateLimit': false,
            'rateLimit': 667,
            'version': 'v2',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchCurrencies': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                // https://github.com/ccxt/ccxt/pull/7067
                // the endpoint that should return closed orders actually returns trades
                'fetchClosedOrders': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg',
                'api': 'https://api.coinone.co.kr',
                'www': 'https://coinone.co.kr',
                'doc': 'https://doc.coinone.co.kr',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook/',
                        'trades/',
                        'ticker/',
                    ],
                },
                'private': {
                    'post': [
                        'account/btc_deposit_address/',
                        'account/balance/',
                        'account/daily_balance/',
                        'account/user_info/',
                        'account/virtual_account/',
                        'order/cancel_all/',
                        'order/cancel/',
                        'order/limit_buy/',
                        'order/limit_sell/',
                        'order/complete_orders/',
                        'order/limit_orders/',
                        'order/order_info/',
                        'transaction/auth_number/',
                        'transaction/history/',
                        'transaction/krw/history/',
                        'transaction/btc/',
                        'transaction/coin/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.002,
                },
            },
            'precision': {
                'price': 4,
                'amount': 4,
                'cost': 8,
            },
            'exceptions': {
                '405': OnMaintenance, // {"errorCode":"405","status":"maintenance","result":"error"}
                '104': OrderNotFound, // {"errorCode":"104","errorMsg":"Order id is not exist","result":"error"}
                '108': BadSymbol, // {"errorCode":"108","errorMsg":"Unknown CryptoCurrency","result":"error"}
                '107': BadRequest, // {"errorCode":"107","errorMsg":"Parameter error","result":"error"}
            },
            'commonCurrencies': {
                'SOC': 'Soda Coin',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const request = {
            'currency': 'all',
        };
        const response = await this.publicGetTicker (request);
        const result = [];
        const quoteId = 'krw';
        const quote = this.safeCurrencyCode (quoteId);
        const baseIds = Object.keys (response);
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const ticker = this.safeValue (response, baseId, {});
            const currency = this.safeValue (ticker, 'currency');
            if (currency === undefined) {
                continue;
            }
            const base = this.safeCurrencyCode (baseId);
            result.push ({
                'info': ticker,
                'id': baseId,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountBalance (params);
        const result = { 'info': response };
        const balances = this.omit (response, [
            'errorCode',
            'result',
            'normalWallets',
        ]);
        const currencyIds = Object.keys (balances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const balance = balances[currencyId];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'avail');
            account['total'] = this.safeString (balance, 'balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bid', 'ask', 'price', 'qty');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currency': 'all',
            'format': 'json',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const result = {};
        const ids = Object.keys (response);
        const timestamp = this.safeTimestamp (response, 'timestamp');
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
                const ticker = response[id];
                result[symbol] = this.parseTicker (ticker, market);
                result[symbol]['timestamp'] = timestamp;
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const first = this.safeNumber (ticker, 'first');
        const last = this.safeNumber (ticker, 'last');
        let average = undefined;
        if (first !== undefined && last !== undefined) {
            average = this.sum (first, last) / 2;
        }
        const previousClose = this.safeNumber (ticker, 'yesterday_last');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined && previousClose !== undefined) {
            change = last - previousClose;
            if (previousClose !== 0) {
                percentage = change / previousClose * 100;
            }
        }
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': first,
            'close': last,
            'last': last,
            'previousClose': previousClose,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "timestamp": "1416893212",
        //         "price": "420000.0",
        //         "qty": "0.1",
        //         "is_ask": "1"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "timestamp": "1416561032",
        //         "price": "419000.0",
        //         "type": "bid",
        //         "qty": "0.001",
        //         "feeRate": "-0.0015",
        //         "fee": "-0.0000015",
        //         "orderId": "E84A1AC2-8088-4FA0-B093-A3BCDB9B3C85"
        //     }
        //
        const timestamp = this.safeTimestamp (trade, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const is_ask = this.safeString (trade, 'is_ask');
        let side = this.safeString (trade, 'type');
        if (is_ask !== undefined) {
            if (is_ask === '1') {
                side = 'sell';
            } else if (is_ask === '0') {
                side = 'buy';
            }
        } else {
            if (side === 'ask') {
                side = 'sell';
            } else if (side === 'bid') {
                side = 'buy';
            }
        }
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'qty');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const orderId = this.safeString (trade, 'orderId');
        let feeCost = this.safeNumber (trade, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
            let feeRate = this.safeNumber (trade, 'feeRate');
            feeRate = Math.abs (feeRate);
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = (side === 'sell') ? market['quote'] : market['base'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': feeRate,
            };
        }
        return {
            'id': this.safeString (trade, 'id'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': orderId,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
            'format': 'json',
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "timestamp": "1416895635",
        //         "currency": "btc",
        //         "completeOrders": [
        //             {
        //                 "timestamp": "1416893212",
        //                 "price": "420000.0",
        //                 "qty": "0.1",
        //                 "is_ask": "1"
        //             }
        //         ]
        //     }
        //
        const completeOrders = this.safeValue (response, 'completeOrders', []);
        return this.parseTrades (completeOrders, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const request = {
            'price': price,
            'currency': this.marketId (symbol),
            'qty': amount,
        };
        const method = 'privatePostOrder' + this.capitalize (type) + this.capitalize (side);
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        return this.parseOrder (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'order_id': id,
            'currency': market['id'],
        };
        const response = await this.privatePostOrderOrderInfo (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "status": "live",
        //         "info": {
        //             "orderId": "32FF744B-D501-423A-8BA1-05BB6BE7814A",
        //             "currency": "BTC",
        //             "type": "bid",
        //             "price": "2922000.0",
        //             "qty": "115.4950",
        //             "remainQty": "45.4950",
        //             "feeRate": "0.0003",
        //             "fee": "0",
        //             "timestamp": "1499340941"
        //         }
        //     }
        //
        const info = this.safeValue (response, 'info', {});
        info['status'] = this.safeString (info, 'status');
        return this.parseOrder (info, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'live': 'open',
            'partially_filled': 'open',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "orderId": "8a82c561-40b4-4cb3-9bc0-9ac9ffc1d63b"
        //     }
        //
        // fetchOrder
        //
        //     {
        //         "status": "live", // injected in fetchOrder
        //         "orderId": "32FF744B-D501-423A-8BA1-05BB6BE7814A",
        //         "currency": "BTC",
        //         "type": "bid",
        //         "price": "2922000.0",
        //         "qty": "115.4950",
        //         "remainQty": "45.4950",
        //         "feeRate": "0.0003",
        //         "fee": "0",
        //         "timestamp": "1499340941"
        //     }
        //
        // fetchOpenOrders
        //
        //     {
        //         "index": "0",
        //         "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //         "timestamp": "1449037367",
        //         "price": "444000.0",
        //         "qty": "0.3456",
        //         "type": "ask",
        //         "feeRate": "-0.0015"
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const price = this.safeNumber (order, 'price');
        const timestamp = this.safeTimestamp (order, 'timestamp');
        let side = this.safeString (order, 'type');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        const remaining = this.safeNumber (order, 'remainQty');
        const amount = this.safeNumber (order, 'qty');
        let status = this.safeString (order, 'status');
        // https://github.com/ccxt/ccxt/pull/7067
        if (status === 'live') {
            if ((remaining !== undefined) && (amount !== undefined)) {
                if (remaining < amount) {
                    status = 'canceled';
                }
            }
        }
        status = this.parseOrderStatus (status);
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        const marketId = this.safeStringLower (order, 'currency');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                base = this.safeCurrencyCode (marketId);
                quote = 'KRW';
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        }
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyCode = (side === 'sell') ? quote : base;
            fee = {
                'cost': feeCost,
                'rate': this.safeNumber (order, 'feeRate'),
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        });
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // The returned amount might not be same as the ordered amount. If an order is partially filled, the returned amount means the remaining amount.
        // For the same reason, the returned amount and remaining are always same, and the returned filled and cost are always zero.
        if (symbol === undefined) {
            throw new ExchangeError (this.id + ' allows fetching closed orders with a specific symbol');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderLimitOrders (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "limitOrders": [
        //             {
        //                 "index": "0",
        //                 "orderId": "68665943-1eb5-4e4b-9d76-845fc54f5489",
        //                 "timestamp": "1449037367",
        //                 "price": "444000.0",
        //                 "qty": "0.3456",
        //                 "type": "ask",
        //                 "feeRate": "-0.0015"
        //             }
        //         ]
        //     }
        //
        const limitOrders = this.safeValue (response, 'limitOrders', []);
        return this.parseOrders (limitOrders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.privatePostOrderCompleteOrders (this.extend (request, params));
        //
        // despite the name of the endpoint it returns trades which may have a duplicate orderId
        // https://github.com/ccxt/ccxt/pull/7067
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0",
        //         "completeOrders": [
        //             {
        //                 "timestamp": "1416561032",
        //                 "price": "419000.0",
        //                 "type": "bid",
        //                 "qty": "0.001",
        //                 "feeRate": "-0.0015",
        //                 "fee": "-0.0000015",
        //                 "orderId": "E84A1AC2-8088-4FA0-B093-A3BCDB9B3C85"
        //             }
        //         ]
        //     }
        //
        const completeOrders = this.safeValue (response, 'completeOrders', []);
        return this.parseTrades (completeOrders, market, since, limit);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            // eslint-disable-next-line quotes
            throw new ArgumentsRequired (this.id + " cancelOrder() requires a symbol argument. To cancel the order, pass a symbol argument and {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument of cancelOrder.");
        }
        const price = this.safeNumber (params, 'price');
        const qty = this.safeNumber (params, 'qty');
        const isAsk = this.safeInteger (params, 'is_ask');
        if ((price === undefined) || (qty === undefined) || (isAsk === undefined)) {
            // eslint-disable-next-line quotes
            throw new ArgumentsRequired (this.id + " cancelOrder() requires {'price': 12345, 'qty': 1.2345, 'is_ask': 0} in the params argument.");
        }
        await this.loadMarkets ();
        const request = {
            'order_id': id,
            'price': price,
            'qty': qty,
            'is_ask': isAsk,
            'currency': this.marketId (symbol),
        };
        const response = await this.privatePostOrderCancel (this.extend (request, params));
        //
        //     {
        //         "result": "success",
        //         "errorCode": "0"
        //     }
        //
        return response;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += request;
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            url += this.version + '/' + request;
            const nonce = this.nonce ().toString ();
            const json = this.json (this.extend ({
                'access_token': this.apiKey,
                'nonce': nonce,
            }, params));
            const payload = this.stringToBase64 (json);
            body = this.decode (payload);
            const secret = this.secret.toUpperCase ();
            const signature = this.hmac (payload, this.encode (secret), 'sha512');
            headers = {
                'Content-Type': 'application/json',
                'X-COINONE-PAYLOAD': payload,
                'X-COINONE-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if ('result' in response) {
            const result = response['result'];
            if (result !== 'success') {
                //
                //    {  "errorCode": "405",  "status": "maintenance",  "result": "error"}
                //
                const errorCode = this.safeString (response, 'errorCode');
                const feedback = this.id + ' ' + body;
                this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
                throw new ExchangeError (feedback);
            }
        } else {
            throw new ExchangeError (this.id + ' ' + body);
        }
    }
};
