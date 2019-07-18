'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class coinfloor extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinfloor',
            'name': 'coinfloor',
            'rateLimit': 1000,
            'countries': [ 'UK' ],
            'has': {
                'CORS': false,
                'fetchOpenOrders': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg',
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
                        '{symbol}/user_transactions/',
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
                'BTC/GBP': { 'id': 'XBT/GBP', 'symbol': 'BTC/GBP', 'base': 'BTC', 'quote': 'GBP', 'baseId': 'XBT', 'quoteId': 'GBP' },
                'BTC/EUR': { 'id': 'XBT/EUR', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'XBT', 'quoteId': 'EUR' },
                'BCH/GBP': { 'id': 'BCH/GBP', 'symbol': 'BCH/GBP', 'base': 'BCH', 'quote': 'GBP', 'baseId': 'BCH', 'quoteId': 'GBP' },
                'ETH/GBP': { 'id': 'ETH/GBP', 'symbol': 'ETH/GBP', 'base': 'ETH', 'quote': 'GBP', 'baseId': 'ETH', 'quoteId': 'GBP' },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if ('symbol' in params) {
            market = this.findMarket (params['symbol']);
        }
        if ('id' in params) {
            market = this.findMarket (params['id']);
        }
        if (!market) {
            throw new NotSupported (this.id + ' fetchBalance requires a symbol param');
        }
        const request = {
            'id': market['id'],
        };
        const response = await this.privatePostIdBalance (this.extend (request, params));
        const result = {
            'info': response,
        };
        // base/quote used for keys e.g. "xbt_reserved"
        const keys = market['id'].toLowerCase ().split ('/');
        result[market['base']] = {
            'free': this.safeFloat (response, keys[0] + '_available'),
            'used': this.safeFloat (response, keys[0] + '_reserved'),
            'total': this.safeFloat (response, keys[0] + '_balance'),
        };
        result[market['quote']] = {
            'free': this.safeFloat (response, keys[1] + '_available'),
            'used': this.safeFloat (response, keys[1] + '_reserved'),
            'total': this.safeFloat (response, keys[1] + '_balance'),
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
        let timestamp = this.safeInteger (trade, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
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
        if (code) {
            market = this.findMarket (code);
            if (!market) {
                throw new NotSupported (this.id + ' fetchTransactions requires a market symbol param');
            }
        }
        const request = {
            'id': market['id'],
            'limit': limit,
        };
        const response = await this.privatePostIdUserTransactions (this.extend (request, params));
        return this.parseLedger (response, undefined, since, limit);
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
        // trade:
        //   {
        //     "datetime": "2017-07-25 06:41:24",
        //     "id": 1500964884381265,
        //     "type": 2,
        //     "xbt": "0.1000",
        //     "xbt_eur": "2322.00",
        //     "eur": "-232.20",
        //     "fee": "0.00",
        //     "order_id": 84696745 }
        //
        // transactions:
        //   {
        //     "datetime": "2017-07-25 13:19:46",
        //     "id": 97669,
        //     "type": 1,
        //     "xbt": "-3.0000",
        //     "xbt_eur": null,
        //     "eur": "0",
        //     "fee": "0.0000",
        //     "order_id": null }
        //   {
        //     "datetime": "2017-07-27 16:44:55",
        //     "id": 98277,
        //     "type": 0,
        //     "xbt": "0",
        //     "xbt_eur": null,
        //     "eur": "4970.04",
        //     "fee": "0.00",
        //     "order_id": null }
        const keys = Object.keys (item);
        let baseId = undefined;
        let quoteId = undefined;
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.indexOf ('_') > 0) {
                const parts = key.split ('_');
                if (parts.length === 2) {
                    const baseIdPresentInKey = item[parts[0]] !== undefined;
                    const quoteIdPresentInKey = item[parts[1]] !== undefined;
                    if (baseIdPresentInKey && quoteIdPresentInKey) {
                        baseId = parts[0];
                        quoteId = parts[1];
                    }
                }
            }
        }
        const baseAmount = this.safeFloat (item, baseId);
        const quoteAmount = this.safeFloat (item, quoteId);
        if (this.safeString (item, 'type') === '2') {
            // it's a trade so let make 2 entries
            const orderId = this.safeString (item, 'order_id');
            return [
                this.createLedgerItem (baseAmount, baseId, orderId, undefined, item),
                this.createLedgerItem (quoteAmount, quoteId, orderId, undefined, item),
            ];
        } else {
            const amount = baseAmount !== 0 ? baseAmount : quoteAmount;
            const currencyId = baseAmount !== 0 ? baseId : quoteId;
            const feeCost = this.safeFloat (item, 'fee');
            return this.createLedgerItem (amount, currencyId, undefined, feeCost, item);
        }
    }

    createLedgerItem (amount, currencyId, referenceId, feeCost, item) {
        const id = this.safeString (item, 'id');
        const timestamp = this.parse8601 (this.safeString (item, 'datetime'));
        const datetime = this.iso8601 (timestamp);
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        let fee = undefined;
        const code = this.safeCurrencyCode (currencyId);
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'amount': amount < 0 ? -amount : amount,
            'direction': amount < 0 ? 'out' : 'in',
            'currency': code,
            'type': type,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'fee': fee,
            'info': item,
        };
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
        return await this[method] (this.extend (request, params));
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new NotSupported (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'id': id,
        };
        return await this.privatePostSymbolCancelOrder (request);
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
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new NotSupported (this.id + ' fetchOpenOrders requires a symbol param');
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
            const signature = this.decode (this.stringToBase64 (this.encode (auth)));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
