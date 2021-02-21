'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { InsufficientFunds, ExchangeError, InvalidNonce, InvalidOrder, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinfloor extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinfloor',
            'name': 'coinfloor',
            'rateLimit': 1000,
            'countries': [ 'UK' ],
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchLedger': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153925-ef265e80-c2c0-11ea-91b5-020c804b90e0.jpg',
                'api': 'https://webapi.coinfloor.co.uk/bist',
                'www': 'https://www.coinfloor.co.uk',
                'doc': [
                    'https://github.com/coinfloor/api',
                    'https://www.coinfloor.co.uk/api',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'password': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        '{id}/ticker/',
                        '{id}/order_book/',
                        '{id}/transactions/',
                    ],
                },
                'private': {
                    'post': [
                        '{id}/balance/',
                        '{id}/user_transactions/',
                        '{id}/open_orders/',
                        '{symbol}/cancel_order/',
                        '{id}/buy/',
                        '{id}/sell/',
                        '{id}/buy_market/',
                        '{id}/sell_market/',
                        '{id}/estimate_sell_market/',
                        '{id}/estimate_buy_market/',
                    ],
                },
            },
            'markets': {
                'BTC/GBP': { 'id': 'XBT/GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', 'baseId': 'XBT', 'quoteId': 'GBP', 'precision': { 'price': 0, 'amount': 4 }},
                'BTC/EUR': { 'id': 'XBT/EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'XBT', 'quoteId': 'EUR', 'precision': { 'price': 0, 'amount': 4 }},
            },
            'exceptions': {
                'exact': {
                    'You have insufficient funds.': InsufficientFunds,
                    'Tonce is out of sequence.': InvalidNonce,
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        let query = params;
        const symbol = this.safeString (params, 'symbol');
        if (symbol !== undefined) {
            market = this.market (params['symbol']);
            query = this.omit (params, 'symbol');
        }
        const marketId = this.safeString (params, 'id');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        }
        if (market === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires a symbol param');
        }
        const request = {
            'id': market['id'],
        };
        const response = await this.privatePostIdBalance (this.extend (request, query));
        const result = {
            'info': response,
        };
        // base/quote used for keys e.g. "xbt_reserved"
        const base = market['base'];
        const quote = market['quote'];
        const baseIdLower = this.safeStringLower (market, 'baseId');
        const quoteIdLower = this.safeStringLower (market, 'quoteId');
        result[base] = {
            'free': this.safeFloat (response, baseIdLower + '_available'),
            'used': this.safeFloat (response, baseIdLower + '_reserved'),
            'total': this.safeFloat (response, baseIdLower + '_balance'),
        };
        result[quote] = {
            'free': this.safeFloat (response, quoteIdLower + '_available'),
            'used': this.safeFloat (response, quoteIdLower + '_reserved'),
            'total': this.safeFloat (response, quoteIdLower + '_balance'),
        };
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const response = await this.publicGetIdOrderBook (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    parseTicker (ticker, market = undefined) {
        // rewrite to get the timestamp from HTTP headers
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const vwap = this.safeFloat (ticker, 'vwap');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetIdTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString (trade, 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetIdTransactions (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        // code is actually a market symbol in this situation, not a currency code
        await this.loadMarkets ();
        let market = undefined;
        if (code !== undefined) {
            market = this.market (code);
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a code argument (a market symbol)');
            }
        }
        const request = {
            'id': market['id'],
            'limit': limit,
        };
        const response = await this.privatePostIdUserTransactions (this.extend (request, params));
        return this.parseLedger (response, undefined, since, undefined);
    }

    parseLedgerEntryStatus (status) {
        const types = {
            'completed': 'ok',
        };
        return this.safeString (types, status, status);
    }

    parseLedgerEntryType (type) {
        const types = {
            '0': 'transaction', // deposit
            '1': 'transaction', // withdrawal
            '2': 'trade',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        // trade
        //
        //     {
        //         "datetime": "2017-07-25 06:41:24",
        //         "id": 1500964884381265,
        //         "type": 2,
        //         "xbt": "0.1000",
        //         "xbt_eur": "2322.00",
        //         "eur": "-232.20",
        //         "fee": "0.00",
        //         "order_id": 84696745
        //     }
        //
        // transaction (withdrawal)
        //
        //     {
        //         "datetime": "2017-07-25 13:19:46",
        //         "id": 97669,
        //         "type": 1,
        //         "xbt": "-3.0000",
        //         "xbt_eur": null,
        //         "eur": "0",
        //         "fee": "0.0000",
        //         "order_id": null
        //     }
        //
        // transaction (deposit)
        //
        //     {
        //         "datetime": "2017-07-27 16:44:55",
        //         "id": 98277,
        //         "type": 0,
        //         "xbt": "0",
        //         "xbt_eur": null,
        //         "eur": "4970.04",
        //         "fee": "0.00",
        //         "order_id": null
        //     }
        //
        const keys = Object.keys (item);
        let baseId = undefined;
        let quoteId = undefined;
        let baseAmount = undefined;
        let quoteAmount = undefined;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.indexOf ('_') > 0) {
                const parts = key.split ('_');
                const numParts = parts.length;
                if (numParts === 2) {
                    const tmpBaseAmount = this.safeFloat (item, parts[0]);
                    const tmpQuoteAmount = this.safeFloat (item, parts[1]);
                    if (tmpBaseAmount !== undefined && tmpQuoteAmount !== undefined) {
                        baseId = parts[0];
                        quoteId = parts[1];
                        baseAmount = tmpBaseAmount;
                        quoteAmount = tmpQuoteAmount;
                    }
                }
            }
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const referenceId = this.safeString (item, 'id');
        const timestamp = this.parse8601 (this.safeString (item, 'datetime'));
        let fee = undefined;
        const feeCost = this.safeFloat (item, 'fee');
        const result = {
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'amount': undefined,
            'direction': undefined,
            'currency': undefined,
            'type': type,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'fee': fee,
            'info': item,
        };
        if (type === 'trade') {
            //
            // it's a trade so let's make multiple entries, we have several options:
            //
            // if fee is always in quote currency (the exchange uses this)
            // https://github.com/coinfloor/API/blob/master/IMPL-GUIDE.md#how-fees-affect-trade-quantities
            //
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': quote,
                };
            }
            return [
                this.extend (result, { 'currency': base, 'amount': Math.abs (baseAmount), 'direction': (baseAmount > 0) ? 'in' : 'out' }),
                this.extend (result, { 'currency': quote, 'amount': Math.abs (quoteAmount), 'direction': (quoteAmount > 0) ? 'in' : 'out', 'fee': fee }),
            ];
            //
            // if fee is base or quote depending on buy/sell side
            //
            //     const baseFee = (baseAmount > 0) ? { 'currency': base, 'cost': feeCost } : undefined;
            //     const quoteFee = (quoteAmount > 0) ? { 'currency': quote, 'cost': feeCost } : undefined;
            //     return [
            //         this.extend (result, { 'currency': base, 'amount': baseAmount, 'direction': (baseAmount > 0) ? 'in' : 'out', 'fee': baseFee }),
            //         this.extend (result, { 'currency': quote, 'amount': quoteAmount, 'direction': (quoteAmount > 0) ? 'in' : 'out', 'fee': quoteFee }),
            //     ];
            //
            // fee as the 3rd item
            //
            //     return [
            //         this.extend (result, { 'currency': base, 'amount': baseAmount, 'direction': (baseAmount > 0) ? 'in' : 'out' }),
            //         this.extend (result, { 'currency': quote, 'amount': quoteAmount, 'direction': (quoteAmount > 0) ? 'in' : 'out' }),
            //         this.extend (result, { 'currency': feeCurrency, 'amount': feeCost, 'direction': 'out', 'type': 'fee' }),
            //     ];
            //
        } else {
            //
            // it's a regular transaction (deposit or withdrawal)
            //
            const amount = (baseAmount === 0) ? quoteAmount : baseAmount;
            const code = (baseAmount === 0) ? quote : base;
            const direction = (amount > 0) ? 'in' : 'out';
            if (feeCost !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': code,
                };
            }
            return this.extend (result, {
                'currency': code,
                'amount': Math.abs (amount),
                'direction': direction,
                'fee': fee,
            });
        }
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        let method = 'privatePostId' + this.capitalize (side);
        if (type === 'market') {
            request['quantity'] = amount;
            method += 'Market';
        } else {
            request['price'] = price;
            request['amount'] = amount;
        }
        //
        //     {
        //         "id":31950584,
        //         "datetime":"2020-05-21 08:38:18",
        //         "type":1,
        //         "price":"9100",
        //         "amount":"0.0026"
        //     }
        //
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.parse8601 (this.safeString (response, 'datetime'));
        return {
            'id': this.safeString (response, 'id'),
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'type': type,
            'price': this.safeFloat (response, 'price'),
            'remaining': this.safeFloat (response, 'amount'),
            'info': response,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'id': id,
        };
        const response = await this.privatePostSymbolCancelOrder (request);
        if (response === 'false') {
            // unfortunately the exchange does not give much info in the response
            throw new InvalidOrder (this.id + ' cancel was rejected');
        }
        return response;
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.parse8601 (this.safeString (order, 'datetime'));
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let side = undefined;
        const status = this.safeString (order, 'status');
        if (order['type'] === 0) {
            side = 'buy';
        } else if (order['type'] === 1) {
            side = 'sell';
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'id');
        return {
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': amount,
            'cost': cost,
            'fee': undefined,
            'average': undefined,
            'trades': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol param');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.privatePostIdOpenOrders (this.extend (request, params));
        //   {
        //     "amount": "1.0000",
        //     "datetime": "2019-07-12 13:28:16",
        //     "id": 233123443,
        //     "price": "1000.00",
        //     "type": 0
        //   }
        return this.parseOrders (response, market, since, limit, { 'status': 'open' });
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code < 400) {
            return;
        }
        if (response === undefined) {
            return;
        }
        const message = this.safeString (response, 'error_msg');
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        throw new ExchangeError (feedback);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // curl -k -u '[User ID]/[API key]:[Passphrase]' https://webapi.coinfloor.co.uk:8090/bist/XBT/GBP/balance/
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({ 'nonce': nonce }, query));
            const auth = this.uid + '/' + this.apiKey + ':' + this.password;
            const signature = this.decode (this.stringToBase64 (auth));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
