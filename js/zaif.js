'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest } = require ('./base/errors');
const Precise = require ('./base/Precise');

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
                'cancelOrder': true,
                'CORS': false,
                'createMarketOrder': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchOpenOrders': true,
                'fetchTicker': true,
                'fetchTrades': true,
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
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0'),
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
        //
        //     [
        //         {
        //             "aux_unit_point": 0,
        //             "item_japanese": "\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3",
        //             "aux_unit_step": 5.0,
        //             "description": "\u30d3\u30c3\u30c8\u30b3\u30a4\u30f3\u30fb\u65e5\u672c\u5186\u306e\u53d6\u5f15\u3092\u884c\u3046\u3053\u3068\u304c\u3067\u304d\u307e\u3059",
        //             "item_unit_min": 0.001,
        //             "event_number": 0,
        //             "currency_pair": "btc_jpy",
        //             "is_token": false,
        //             "aux_unit_min": 5.0,
        //             "aux_japanese": "\u65e5\u672c\u5186",
        //             "id": 1,
        //             "item_unit_step": 0.0001,
        //             "name": "BTC/JPY",
        //             "seq": 0,
        //             "title": "BTC/JPY"
        //         }
        //     ]
        //
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
                'amount': -Math.log10 (this.safeNumber (market, 'item_unit_step')),
                'price': this.safeInteger (market, 'aux_unit_point'),
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
                        'min': this.safeNumber (market, 'item_unit_min'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeNumber (market, 'aux_unit_min'),
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
        const deposit = this.safeValue (balances, 'deposit');
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const funds = this.safeValue (balances, 'funds', {});
        const currencyIds = Object.keys (funds);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const balance = this.safeString (funds, currencyId);
            const account = this.account ();
            account['free'] = balance;
            account['total'] = balance;
            if (deposit !== undefined) {
                if (currencyId in deposit) {
                    account['total'] = this.safeString (deposit, currencyId);
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
        return this.parseOrderBook (response, symbol);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const ticker = await this.publicGetTickerPair (this.extend (request, params));
        const timestamp = this.milliseconds ();
        const vwap = this.safeNumber (ticker, 'vwap');
        const baseVolume = this.safeNumber (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeNumber (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
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
        const timestamp = this.safeTimestamp (trade, 'date');
        const id = this.safeString2 (trade, 'id', 'tid');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const marketId = this.safeString (trade, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market, '_');
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
        //
        //     {
        //         "currency_pair": "btc_jpy",
        //         "action": "ask",
        //         "amount": 0.03,
        //         "price": 56000,
        //         "timestamp": 1402021125,
        //         "comment" : "demo"
        //     }
        //
        let side = this.safeString (order, 'action');
        side = (side === 'bid') ? 'buy' : 'sell';
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const marketId = this.safeString (order, 'currency_pair');
        const symbol = this.safeSymbol (marketId, market, '_');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'amount');
        const id = this.safeString (order, 'id');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        });
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

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error": "unsupported currency_pair"}
        //
        const feedback = this.id + ' ' + body;
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            throw new ExchangeError (feedback);
        }
    }
};
