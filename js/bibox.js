'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, DDoSProtection, ExchangeNotAvailable, InvalidOrder, OrderNotFound, PermissionDenied, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bibox extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bibox',
            'name': 'Bibox',
            'countries': [ 'CN', 'US', 'KR' ],
            'version': 'v1',
            'has': {
                'CORS': false,
                'publicAPI': false,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchFundingFees': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'createMarketOrder': false, // or they will return https://github.com/ccxt/ccxt/issues/2338
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1hour',
                '12h': '12hour',
                '1d': 'day',
                '1w': 'week',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg',
                'api': 'https://api.bibox.com',
                'www': 'https://www.bibox.com',
                'doc': [
                    'https://github.com/Biboxcom/api_reference/wiki/home_en',
                    'https://github.com/Biboxcom/api_reference/wiki/api_reference',
                ],
                'fees': 'https://bibox.zendesk.com/hc/en-us/articles/115004417013-Fee-Structure-on-Bibox',
                'referral': 'https://www.bibox.com/signPage?id=11114745&lang=en',
            },
            'api': {
                'public': {
                    'post': [
                        // TODO: rework for full endpoint/cmd paths here
                        'mdata',
                    ],
                    'get': [
                        'mdata',
                    ],
                },
                'private': {
                    'post': [
                        'user',
                        'orderpending',
                        'transfer',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.001,
                    'maker': 0.0,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'exceptions': {
                '2021': InsufficientFunds, // Insufficient balance available for withdrawal
                '2015': AuthenticationError, // Google authenticator is wrong
                '2027': InsufficientFunds, // Insufficient balance available (for trade)
                '2033': OrderNotFound, // operation failed! Orders have been completed or revoked
                '2067': InvalidOrder, // Does not support market orders
                '2068': InvalidOrder, // The number of orders can not be less than
                '2085': InvalidOrder, // Order quantity is too small
                '3012': AuthenticationError, // invalid apiKey
                '3024': PermissionDenied, // wrong apikey permissions
                '3025': AuthenticationError, // signature failed
                '4000': ExchangeNotAvailable, // current network is unstable
                '4003': DDoSProtection, // server busy please try again later
            },
            'commonCurrencies': {
                'KEY': 'Bihu',
                'PAI': 'PCHAIN',
            },
        });
    }

    async fetchMarkets (params = {}) {
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'marketAll',
        }, params));
        let markets = response['result'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let baseId = market['coin_symbol'];
            let quoteId = market['currency_symbol'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let id = base + '_' + quote;
            let precision = {
                'amount': 4,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': base,
                'quoteId': quote,
                'active': true,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        // we don't set values that are not defined by the exchange
        let timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            let base = ticker['coin_symbol'];
            let quote = ticker['currency_symbol'];
            symbol = this.commonCurrencyCode (base) + '/' + this.commonCurrencyCode (quote);
        }
        let last = this.safeFloat (ticker, 'last');
        let change = this.safeFloat (ticker, 'change');
        let baseVolume = undefined;
        if ('vol' in ticker) {
            baseVolume = this.safeFloat (ticker, 'vol');
        } else {
            baseVolume = this.safeFloat (ticker, 'vol24H');
        }
        let open = undefined;
        if ((last !== undefined) && (change !== undefined))
            open = last - change;
        let percentage = this.safeString (ticker, 'percent');
        if (percentage !== undefined) {
            percentage = percentage.replace ('%', '');
            percentage = parseFloat (percentage);
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': this.safeFloat (ticker, 'amount'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'ticker',
            'pair': market['id'],
        }, params));
        return this.parseTicker (response['result'], market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        let tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            let ticker = this.parseTicker (rawTickers[i]);
            if ((symbols === undefined) || (this.inArray (ticker['symbol'], symbols))) {
                tickers.push (ticker);
            }
        }
        return tickers;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'marketAll',
        }, params));
        let tickers = this.parseTickers (response['result'], symbols);
        return this.indexBy (tickers, 'symbol');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.safeInteger (trade, 'time');
        timestamp = this.safeInteger (trade, 'createdAt', timestamp);
        let side = this.safeInteger (trade, 'side');
        side = this.safeInteger (trade, 'order_side', side);
        side = (side === 1) ? 'buy' : 'sell';
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (trade, 'pair');
            if (marketId === undefined) {
                let baseId = this.safeString (trade, 'coin_symbol');
                let quoteId = this.safeString (trade, 'currency_symbol');
                if ((baseId !== undefined) && (quoteId !== undefined))
                    marketId = baseId + '_' + quoteId;
            }
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let fee = undefined;
        let feeCost = this.safeFloat (trade, 'fee');
        let feeCurrency = this.safeString (trade, 'fee_symbol');
        if (feeCurrency !== undefined) {
            if (feeCurrency in this.currencies_by_id) {
                feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            } else {
                feeCurrency = this.commonCurrencyCode (feeCurrency);
            }
        }
        let feeRate = undefined; // todo: deduce from market if market is defined
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = price * amount;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': feeRate,
            };
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': undefined, // Bibox does not have it (documented) yet
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'deals',
            'pair': market['id'],
            'size': size,
        }, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async fetchOrderBook (symbol, limit = 200, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'cmd': 'depth',
            'pair': market['id'],
        };
        request['size'] = limit; // default = 200 ?
        let response = await this.publicGetMdata (this.extend (request, params));
        return this.parseOrderBook (response['result'], this.safeFloat (response['result'], 'update_time'), 'bids', 'asks', 'price', 'volume');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'],
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['vol'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 1000, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMdata (this.extend ({
            'cmd': 'kline',
            'pair': market['id'],
            'period': this.timeframes[timeframe],
            'size': limit,
        }, params));
        return this.parseOHLCVs (response['result'], market, timeframe, since, limit);
    }

    async fetchCurrencies (params = {}) {
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/coinList',
            'body': {},
        });
        let currencies = response['result'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['symbol'];
            let code = this.commonCurrencyCode (id);
            let precision = 8;
            let deposit = currency['enable_deposit'];
            let withdraw = currency['enable_withdraw'];
            let active = (deposit && withdraw) ? true : false;
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': currency['name'],
                'active': active,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/assets',
            'body': this.extend ({
                'select': 1,
            }, params),
        });
        let balances = response['result'];
        let result = { 'info': balances };
        let indexed = undefined;
        if ('assets_list' in balances) {
            indexed = this.indexBy (balances['assets_list'], 'coin_symbol');
        } else {
            indexed = balances;
        }
        let keys = Object.keys (indexed);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let code = id.toUpperCase ();
            if (code.indexOf ('TOTAL_') >= 0) {
                code = code.slice (6);
            }
            if (code in this.currencies_by_id) {
                code = this.currencies_by_id[code]['code'];
            }
            let account = this.account ();
            let balance = indexed[id];
            if (typeof balance === 'string') {
                balance = parseFloat (balance);
                account['free'] = balance;
                account['used'] = 0.0;
                account['total'] = balance;
            } else {
                account['free'] = parseFloat (balance['balance']);
                account['used'] = parseFloat (balance['freeze']);
                account['total'] = this.sum (account['free'], account['used']);
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderType = (type === 'limit') ? 2 : 1;
        let orderSide = (side === 'buy') ? 1 : 2;
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/trade',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0,
                'order_type': orderType,
                'order_side': orderSide,
                'pay_bix': 0,
                'amount': amount,
                'price': price,
            }, params),
        });
        return {
            'info': response,
            'id': this.safeString (response, 'result'),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/cancelTrade',
            'body': this.extend ({
                'orders_id': id,
            }, params),
        });
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/order',
            'body': this.extend ({
                'id': id,
            }, params),
        });
        let order = this.safeValue (response, 'result');
        if (this.isEmpty (order)) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (order);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (market === undefined) {
            let marketId = undefined;
            let baseId = this.safeString (order, 'coin_symbol');
            let quoteId = this.safeString (order, 'currency_symbol');
            if ((baseId !== undefined) && (quoteId !== undefined))
                marketId = baseId + '_' + quoteId;
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let type = (order['order_type'] === 1) ? 'market' : 'limit';
        let timestamp = order['createdAt'];
        let price = this.safeFloat (order, 'price');
        let average = this.safeFloat (order, 'deal_price');
        let filled = this.safeFloat (order, 'deal_amount');
        let amount = this.safeFloat (order, 'amount');
        let cost = this.safeFloat2 (order, 'deal_money', 'money');
        let remaining = undefined;
        if (filled !== undefined) {
            if (amount !== undefined)
                remaining = amount - filled;
            if (cost === undefined)
                cost = price * filled;
        }
        let side = (order['order_side'] === 1) ? 'buy' : 'sell';
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let result = {
            'info': order,
            'id': this.safeString (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost ? cost : parseFloat (price) * filled,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': this.safeFloat (order, 'fee'),
        };
        return result;
    }

    parseOrderStatus (status) {
        let statuses = {
            // original comments from bibox:
            '1': 'open', // pending
            '2': 'open', // part completed
            '3': 'closed', // completed
            '4': 'canceled', // part canceled
            '5': 'canceled', // canceled
            '6': 'canceled', // canceling
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        let pair = undefined;
        if (symbol !== undefined) {
            await this.loadMarkets ();
            market = this.market (symbol);
            pair = market['id'];
        }
        let size = (limit) ? limit : 200;
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/orderPendingList',
            'body': this.extend ({
                'pair': pair,
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
            }, params),
        });
        let orders = this.safeValue (response['result'], 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = 200, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchClosedOrders requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/pendingHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': limit,
            }, params),
        });
        let orders = this.safeValue (response['result'], 'items', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined)
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let size = (limit) ? limit : 200;
        let response = await this.privatePostOrderpending ({
            'cmd': 'orderpending/orderHistoryList',
            'body': this.extend ({
                'pair': market['id'],
                'account_type': 0, // 0 - regular, 1 - margin
                'page': 1,
                'size': size,
                'coin_symbol': market['baseId'],
                'currency_symbol': market['quoteId'],
            }, params),
        });
        let trades = this.safeValue (response['result'], 'items', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferIn',
            'body': this.extend ({
                'coin_symbol': currency['id'],
            }, params),
        });
        let address = this.safeString (response, 'result');
        let tag = undefined; // todo: figure this out
        let result = {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        if (this.password === undefined)
            if (!('trade_pwd' in params))
                throw new ExchangeError (this.id + ' withdraw() requires this.password set on the exchange instance or a trade_pwd parameter');
        if (!('totp_code' in params))
            throw new ExchangeError (this.id + ' withdraw() requires a totp_code parameter for 2FA authentication');
        let body = {
            'trade_pwd': this.password,
            'coin_symbol': currency['id'],
            'amount': amount,
            'addr': address,
        };
        if (tag !== undefined)
            body['address_remark'] = tag;
        let response = await this.privatePostTransfer ({
            'cmd': 'transfer/transferOut',
            'body': this.extend (body, params),
        });
        return {
            'info': response,
            'id': undefined,
        };
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        // by default it will try load withdrawal fees of all currencies (with separate requests)
        // however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        let withdrawFees = {};
        let info = {};
        if (codes === undefined)
            codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = this.currency (code);
            let response = await this.privatePostTransfer ({
                'cmd': 'transfer/transferOutInfo',
                'body': this.extend ({
                    'coin_symbol': currency['id'],
                }, params),
            });
            info[code] = response;
            withdrawFees[code] = response['result']['withdraw_fee'];
        }
        return {
            'info': info,
            'withdraw': withdrawFees,
            'deposit': {},
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + path;
        let cmds = this.json ([ params ]);
        if (api === 'public') {
            if (method !== 'GET')
                body = { 'cmds': cmds };
            else if (Object.keys (params).length)
                url += '?' + this.urlencode (params);
        } else {
            this.checkRequiredCredentials ();
            body = {
                'cmds': cmds,
                'apikey': this.apiKey,
                'sign': this.hmac (this.encode (cmds), this.encode (this.secret), 'md5'),
            };
        }
        if (body !== undefined)
            body = this.json (body, { 'convertArraysToObjects': true });
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (body.length > 0) {
            if (body[0] === '{') {
                if ('error' in response) {
                    if ('code' in response['error']) {
                        let code = this.safeString (response['error'], 'code');
                        let feedback = this.id + ' ' + body;
                        const exceptions = this.exceptions;
                        if (code in exceptions) {
                            throw new exceptions[code] (feedback);
                        } else {
                            throw new ExchangeError (feedback);
                        }
                    }
                    throw new ExchangeError (this.id + ': "error" in response: ' + body);
                }
                if (!('result' in response))
                    throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (method === 'GET') {
            return response;
        } else {
            return response['result'][0];
        }
    }
};
