'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidOrder, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class braziliex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'braziliex',
            'name': 'Braziliex',
            'countries': 'BR',
            'rateLimit': 1000,
            'has': {
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg',
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
            let precision = this.safeInteger (currency, 'decimal');
            let uppercase = id.toUpperCase ();
            let code = this.commonCurrencyCode (uppercase);
            let active = this.safeInteger (currency, 'active') === 1;
            let status = 'ok';
            let maintenance = this.safeInteger (currency, 'under_maintenance');
            if (maintenance !== 0) {
                active = false;
                status = 'maintenance';
            }
            let canWithdraw = this.safeInteger (currency, 'is_withdrawal_active') === 1;
            let canDeposit = this.safeInteger (currency, 'is_deposit_active') === 1;
            if (!canWithdraw || !canDeposit)
                active = false;
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': active,
                'status': status,
                'precision': precision,
                'funding': {
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
            let [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let active = this.safeInteger (market, 'active') === 1;
            let precision = {
                'amount': 8,
                'price': 8,
            };
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol.toUpperCase (),
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'lot': lot,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
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

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = ticker['date'];
        ticker = ticker['ticker'];
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highestBid24'),
            'low': this.safeFloat (ticker, 'lowestAsk24'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'percentChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume24'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume24'),
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderbookMarket (this.extend ({
            'market': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        if ('date_exec' in trade) {
            timestamp = this.parse8601 (trade['date_exec']);
        } else {
            timestamp = this.parse8601 (trade['date']);
        }
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['amount']);
        let symbol = market['symbol'];
        let cost = parseFloat (trade['total']);
        let orderId = this.safeString (trade, 'order_number');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': this.safeString (trade, '_id'),
            'order': orderId,
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

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market) {
            let marketId = this.safeString (order, 'market');
            if (marketId)
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = this.safeValue (order, 'timestamp');
        if (!timestamp)
            timestamp = this.parse8601 (order['date']);
        let price = parseFloat (order['price']);
        let cost = this.safeFloat (order, 'total', 0.0);
        let amount = this.safeFloat (order, 'amount');
        let filledPercentage = this.safeFloat (order, 'progress');
        let filled = amount * filledPercentage;
        let remaining = this.amountToPrecision (symbol, amount - filled);
        let info = order;
        if ('info' in info)
            info = order['info'];
        return {
            'id': order['order_number'],
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': symbol,
            'type': 'limit',
            'side': order['type'],
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': this.safeValue (order, 'fee'),
            'info': info,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side);
        let response = await this[method] (this.extend ({
            'market': market['id'],
            // 'price': this.priceToPrecision (symbol, price),
            // 'amount': this.amountToPrecision (symbol, amount),
            'price': price,
            'amount': amount,
        }, params));
        let success = this.safeInteger (response, 'success');
        if (success !== 1)
            throw new InvalidOrder (this.id + ' ' + this.json (response));
        let parts = response['message'].split (' / ');
        parts = parts.slice (1);
        let feeParts = parts[5].split (' ');
        let order = this.parseOrder ({
            'timestamp': this.milliseconds (),
            'order_number': response['order_number'],
            'type': parts[0].toLowerCase (),
            'market': parts[0].toLowerCase (),
            'amount': parts[2].split (' ')[1],
            'price': parts[3].split (' ')[1],
            'total': parts[4].split (' ')[1],
            'fee': {
                'cost': parseFloat (feeParts[1]),
                'currency': feeParts[2],
            },
            'progress': '0.0',
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

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orders = await this.privatePostOpenOrders (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseOrders (orders['order_open'], market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.privatePostTradeHistory (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTrades (trades['trade_history'], market, since, limit);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostDepositAddress (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response, 'deposit_address');
        this.checkAddress (address);
        let tag = this.safeString (response, 'payment_id');
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'status': 'ok',
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + api;
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            query = this.extend ({
                'command': path,
                'nonce': this.nonce (),
            }, query);
            body = this.urlencode (query);
            let signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Content-type': 'application/x-www-form-urlencoded',
                'Key': this.apiKey,
                'Sign': this.decode (signature),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('success' in response) {
            let success = this.safeInteger (response, 'success');
            if (success === 0) {
                let message = this.safeString (response, 'message');
                if (message === 'Invalid APIKey')
                    throw new AuthenticationError (message);
                throw new ExchangeError (message);
            }
        }
        return response;
    }
};
