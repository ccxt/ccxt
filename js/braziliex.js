"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class braziliex extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'braziliex',
            'name': 'Braziliex',
            'countries': 'BR',
            'rateLimit': 1000,
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            // new metainfo interface
            'has': {
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'urls': {
                'logo': 'https://braziliex.com/img/logo_topo.png',
                'api': 'https://braziliex.com/api/v1',
                'www': 'https://braziliex.com/',
                'doc': 'https://braziliex.com/exchange/api.php',
                'fees': 'https://braziliex.com/exchange/fees.php',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'ticker',
                        'ticker/{market}',
                        'orderbook/{market}',
                        'tradehistory/{market}',
                    ],
                },
                'private': {
                    'post': [
                        'balance',
                        'complete_balance',
                        'open_orders',
                        'trade_history',
                        'deposit_address',
                        'sell',
                        'buy',
                        'cancel_order',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.005,
                    'taker': 0.005,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetCurrencies (params);
        let ids = Object.keys (currencies);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let currency = currencies[id];
            let precision = currency['decimal'];
            let idUpperCase = id.toUpperCase ();
            let code = this.commonCurrencyCode (idUpperCase);
            let active = currency['active'] == 1;
            let status = 'ok';
            if (currency['under_maintenance'] != 0) {
                active = false;
                status = 'maintenance';
            }
            let canWithdraw = currency['is_withdrawal_active'] == 1;
            let canDeposit = currency['is_deposit_active'] == 1;
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': active,
                'status': status,
                'precision': precision,
                'wallet': {
                    'address': undefined,
                    'extra': undefined,
                    'withdraw': {
                        'active': canWithdraw,
                        'fee': currency['txWithdrawalFee'],
                    },
                    'deposit': {
                        'active': canDeposit,
                        'fee': currency['txDepositFee'],
                    },
                },
                'limits': {
                    'amount': {
                        'min': currency['minAmountTrade'],
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
                        'min': currency['MinWithdrawal'],
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': currency['minDeposit'],
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets () {
        let markets = await this.publicGetTicker ();
        let ids = Object.keys (markets);
        let result = [];
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = markets[id];
            let idUpperCase = id.toUpperCase ();
            let [ base, quote ] = idUpperCase.split ('_');
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let active = market['active'] == 1;
            result.push ({
                'id': id,
                'symbol': symbol.toUpperCase (),
                'base': base,
                'quote': quote,
                'active': active,
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = ticker['date'];
        ticker = ticker['ticker'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['highestBid24']),
            'low': parseFloat (ticker['lowestAsk24']),
            'bid': parseFloat (ticker['highestBid']),
            'ask': parseFloat (ticker['lowestAsk']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last']),
            'change': parseFloat (ticker['percentChange']),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['baseVolume24']),
            'quoteVolume': parseFloat (ticker['quoteVolume24']),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerMarket (this.extend ({
            'market': market['id'],
        }, params));
        ticker = {
            'date': this.milliseconds (),
            'ticker': ticker,
        };
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTicker (params);
        let result = {};
        let timestamp = this.milliseconds ();
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = {
                'date': timestamp,
                'ticker': tickers[id],
            };
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbookMarket (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = this.parse8601 (trade['date_exec']);
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = parseFloat (trade['total']);
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, '_id'),
            'order': undefined,
            'type': 'limit',
            'side': trade['type'],
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetTradehistoryMarket (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privatePostCompleteBalance (params);
        let result = { 'info': balances };
        let currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            let id = currencies[i];
            let balance = balances[id];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['available']),
                'used': 0.0,
                'total': parseFloat (balance['total']),
            };
            account['used'] = account['total'] - account['free'];
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market, status = 'open') {
        let symbol = market['symbol'];
        let timestamp = this.parse8601 (order['date']);
        let price = parseFloat (order['price']);
        let cost = this.safeFloat (order, 'total', 0.0);
        let amount = this.safeFloat (order, 'amount');
        let filled = this.safeFloat (order, 'progress');
        let remaining = this.amountToPrecision (symbol, amount - filled);
        let info = order;
        if ('info' in info)
            info = order['info'];
        return {
            'id': order['order_number'],
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': info,
        };
    }

    parseOrders (orders, market, status = undefined) {
        let result = [];
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            result.push (this.parseOrder (order, market, status));
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side.toLowerCase ());
        let response = await this[method] (this.extend ({
            'market': market['id'],
            'price': this.priceToPrecision (symbol, price),
            'amount': this.amountToPrecision (symbol, amount),
        }, params));
        if (this.safeInteger(response, 'success') != 1)
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        let chunks = response['message'].split (' / ').slice (1);
        let order = this.parseOrder ({
            'order_number': response['order_number'],
            'type': chunks[0].toLowerCase (),
            'market': chunks[1].toLowerCase (),
            'amount': chunks[2].split (' ')[1],
            'price': chunks[3].split (' ')[1],
            'total': chunks[4].split (' ')[1],
            'progress': 0.0,
            'date': this.iso8601 (this.milliseconds ()),
            'info': response,
        }, market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let result = await this.privatePostCancelOrder (this.extend ({
            'order_number': id,
            'market': market['id'],
        }, params));
        return result;
    }

    async fetchOpenOrders (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orders = await this.privatePostOpenOrders (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOrders (orders['order_open'], market, 'open');
    }

    async fetchClosedOrders (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orders = await this.privatePostTradeHistory (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOrders (orders['trade_history'], market, 'closed');
    }

    async fetchDepositAddress (currencyCode, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (currencyCode);
        let response = await this.privatePostDepositAddress (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response['deposit_address'], 'address');
        if (!address)
            throw new ExchangeError (this.id + ' fetchDepositAddress failed: ' + this.last_http_response);
        return {
            'currency': currencyCode,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api + '/';
        let query = undefined;
        if (api == 'public') {
            query = this.urlencode (this.omit (params, this.extractParams (path)));
            url += this.implodeParams (path, params);
            if (query.length)
                url += '?' + query;
        } else {
            this.checkRequiredCredentials ();
            query = this.extend ({
                'command': path,
                'nonce': this.nonce (),
            }, params);
            body = this.json (query);
            query = this.urlencode (query);
            let signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            headers = {
                'Content-type': 'application/json',
                'Key': this.apiKey,
                'Sign': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        let success = this.safeInteger (response, 'success');
        if (success == 0) {
            let message = response['message'];
            if (message == 'Invalid APIKey')
                throw new AuthenticationError (message);
            throw new ExchangeError (message);
        }
        return response;
    }
}
