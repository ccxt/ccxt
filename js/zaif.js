'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class zaif extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'zaif',
            'name': 'Zaif',
            'countries': [ 'JP' ],
            'rateLimit': 2000,
            'version': '1',
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg',
                'api': 'https://api.zaif.jp',
                'www': 'https://zaif.jp',
                'doc': [
                    'https://techbureau-api-document.readthedocs.io/ja/latest/index.html',
                    'https://corp.zaif.jp/api-docs',
                    'https://corp.zaif.jp/api-docs/api_links',
                    'https://www.npmjs.com/package/zaif.jp',
                    'https://github.com/you21979/node-zaif',
                ],
                'fees': 'https://zaif.jp/fee?lang=en',
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'taker': 0.1 / 100,
                    'maker': 0,
                },
            },
            'api': {
                'public': {
                    'get': [
                        'depth/{pair}',
                        'currencies/{pair}',
                        'currencies/all',
                        'currency_pairs/{pair}',
                        'currency_pairs/all',
                        'last_price/{pair}',
                        'ticker/{pair}',
                        'trades/{pair}',
                    ],
                },
                'private': {
                    'post': [
                        'active_orders',
                        'cancel_order',
                        'deposit_history',
                        'get_id_info',
                        'get_info',
                        'get_info2',
                        'get_personal_info',
                        'trade',
                        'trade_history',
                        'withdraw',
                        'withdraw_history',
                    ],
                },
                'ecapi': {
                    'post': [
                        'createInvoice',
                        'getInvoice',
                        'getInvoiceIdsByOrderNumber',
                        'cancelInvoice',
                    ],
                },
                'tlapi': {
                    'post': [
                        'get_positions',
                        'position_history',
                        'active_positions',
                        'create_position',
                        'change_position',
                        'cancel_position',
                    ],
                },
                'fapi': {
                    'get': [
                        'groups/{group_id}',
                        'last_price/{group_id}/{pair}',
                        'ticker/{group_id}/{pair}',
                        'trades/{group_id}/{pair}',
                        'depth/{group_id}/{pair}',
                    ],
                },
            },
            'options': {
                // zaif schedule defines several market-specific fees
                'fees': {
                    'BTC/JPY': { 'maker': 0, 'taker': 0 },
                    'BCH/JPY': { 'maker': 0, 'taker': 0.3 / 100 },
                    'BCH/BTC': { 'maker': 0, 'taker': 0.3 / 100 },
                    'PEPECASH/JPY': { 'maker': 0, 'taker': 0.01 / 100 },
                    'PEPECASH/BT': { 'maker': 0, 'taker': 0.01 / 100 },
                },
            },
            'exceptions': {
                'exact': {
                    'unsupported currency_pair': BadRequest, // {"error": "unsupported currency_pair"}
                },
                'broad': {
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetCurrencyPairsAll (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'currency_pair');
            const name = this.safeString (market, 'name');
            const [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': -Math.log10 (market['item_unit_step']),
                'price': market['aux_unit_point'],
            };
            const fees = this.safeValue (this.options['fees'], symbol, this.fees['trading']);
            const taker = fees['taker'];
            const maker = fees['maker'];
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true, // can trade or not
                'precision': precision,
                'taker': taker,
                'maker': maker,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'item_unit_min'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeFloat (market, 'aux_unit_min'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostGetInfo (params);
        const balances = this.safeValue (response, 'return', {});
        const result = { 'info': response };
        const funds = this.safeValue (balances, 'funds', {});
        const currencyIds = Object.keys (funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeValue (funds, currencyId);
            const account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            };
            if ('deposit' in balances) {
                if (currencyId in balances['deposit']) {
                    account['total'] = this.safeFloat (balances['deposit'], currencyId);
                    account['used'] = account['total'] - account['free'];
                }
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetDepthPair (this.extend (request, params));
        return this.parseOrderBook (response);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const ticker = await this.publicGetTickerPair (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const vwap = this.safeFloat (ticker, 'vwap');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
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

    parseTrade (trade, market = undefined) {
        let side = this.safeString (trade, 'trade_type');
        side = (side === 'bid') ? 'buy' : 'sell';
        let timestamp = this.safeInteger (trade, 'date');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        const id = this.safeString2 (trade, 'id', 'tid');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = amount * price;
            }
        }
        if (market === undefined) {
            const marketId = this.safeString (trade, 'currency_pair');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'order': undefined,
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
            'pair': market['id'],
        };
        let response = await this.publicGetTradesPair (this.extend (request, params));
        const numTrades = response.length;
        if (numTrades === 1) {
            const firstTrade = response[0];
            if (!Object.keys (firstTrade).length) {
                response = [];
            }
        }
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const request = {
            'currency_pair': this.marketId (symbol),
            'action': (side === 'buy') ? 'bid' : 'ask',
            'amount': amount,
            'price': price,
        };
        const response = await this.privatePostTrade (this.extend (request, params));
        return {
            'info': response,
            'id': response['return']['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'order_id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'action');
        side = (side === 'bid') ? 'buy' : 'sell';
        let timestamp = this.safeInteger (order, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        if (!market) {
            const marketId = this.safeString (order, 'currency_pair');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const id = this.safeString (order, 'id');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    parseOrders (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        const result = [];
        const ids = Object.keys (orders);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const order = this.extend ({ 'id': id }, orders[id]);
            result.push (this.extend (this.parseOrder (order, market), params));
        }
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'is_token': false,
            // 'is_token_both': false,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        const response = await this.privatePostActiveOrders (this.extend (request, params));
        return this.parseOrders (response['return'], market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'from': 0,
            // 'count': 1000,
            // 'from_id': 0,
            // 'end_id': 1000,
            // 'order': 'DESC',
            // 'since': 1503821051,
            // 'end': 1503821051,
            // 'is_token': false,
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        const response = await this.privatePostTradeHistory (this.extend (request, params));
        return this.parseOrders (response['return'], market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (code === 'JPY') {
            throw new ExchangeError (this.id + ' withdraw() does not allow ' + code + ' withdrawals');
        }
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
            // 'message': 'Hi!', // XEM and others
            // 'opt_fee': 0.003, // BTC and MONA only
        };
        if (tag !== undefined) {
            request['message'] = tag;
        }
        const result = await this.privatePostWithdraw (this.extend (request, params));
        return {
            'info': result,
            'id': result['return']['txid'],
            'fee': result['return']['fee'],
        };
    }

    nonce () {
        const nonce = parseFloat (this.milliseconds () / 1000);
        return nonce.toFixed (8);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api === 'public') {
            url += 'api/' + this.version + '/' + this.implodeParams (path, params);
        } else if (api === 'fapi') {
            url += 'fapi/' + this.version + '/' + this.implodeParams (path, params);
        } else {
            this.checkRequiredCredentials ();
            if (api === 'ecapi') {
                url += 'ecapi';
            } else if (api === 'tlapi') {
                url += 'tlapi';
            } else {
                url += 'tapi';
            }
            const nonce = this.nonce ();
            body = this.urlencode (this.extend ({
                'method': path,
                'nonce': nonce,
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.hmac (this.encode (body), this.encode (this.secret), 'sha512'),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error": "unsupported currency_pair"}
        //
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            const exact = this.exceptions['exact'];
            if (error in exact) {
                throw new exact[error] (feedback);
            }
            const broad = this.exceptions['broad'];
            const broadKey = this.findBroadlyMatchedKey (broad, error);
            if (broadKey !== undefined) {
                throw new broad[broadKey] (feedback);
            }
            throw new ExchangeError (feedback); // unknown message
        }
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            throw new ExchangeError (feedback);
        }
    }
};
