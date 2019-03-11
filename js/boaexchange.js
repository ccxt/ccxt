'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OrderNotFound, AddressPending } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class boaexchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'boaexchange',
            'name': 'BOA Exchange',
            'countries': [ 'CR' ],
            'version': 'v1',
            'rateLimit': 250,
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': false,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'deposit': false,
                'fetchBalance': true,
                'createMarketOrder': false,
                'fetchDepositAddress': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchMarkets': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchOpenOrders': true,
                'fetchTickers': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '30m': '1800',
                '1h': '3600',
                '1d': '86400',
            },
            'hostname': 'boaexchange.com',
            'urls': {
                'logo': 'https://boaexchange.com/4cdef72eb47d4a759d2c72e619f48827.png',
                'api': {
                    'v1': 'https://api.{hostname}/api',
                },
                'www': 'https://boaexchange.com',
                'doc': [
                    'https://api.boaexchange.com/docs/',
                ],
                'fees': [
                ],
            },
            'api': {
                'v1': {
                    'get': [
                        'addresses',
                        'addresses/{label}',
                        'apiKeys',
                        'balances',
                        'chat',
                        'coins',
                        'deposits',
                        'markets',
                        'markets/{label}',
                        'markets/{label}/ohlcv',
                        'markets/{label}/orderbook',
                        'orders',
                        'trades',
                        'trades/{tradeId}',
                        'trades/all',
                        'transactions',
                        'transfers',
                        'withdraws',
                    ],
                    'post': [
                        'addresses',
                        'addresses/{label}',
                        'apiKeys',
                        'balances',
                        'chat',
                        'coins',
                        'deposits',
                        'markets',
                        'markets/{label}',
                        'markets/{label}/ohlcv',
                        'markets/{label}/orderbook',
                        'orders',
                        'trades',
                        'trades/{tradeId}',
                        'transfers',
                        'withdraws',
                    ],
                    'delete': [
                        'addresses',
                        'addresses/{label}',
                        'apiKeys',
                        'balances',
                        'chat',
                        'coins',
                        'deposits',
                        'markets',
                        'markets/{label}',
                        'markets/{label}/ohlcv',
                        'markets/{label}/orderbook',
                        'orders',
                        'trades',
                        'trades/{tradeId}',
                        'transfers',
                        'withdraws',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                // 'password': true // Used by the withdrawal api
            },
            'dontGetUsedBalanceFromStaleCache': true,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.15,
                    'taker': 0.15,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                    },
                    'deposit': {
                    },
                },
            },
            'exceptions': {
            },
            'options': {
                'hasEmptyMarkets': true,
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'symbolSeparator': '_',
                'tag': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    feeToPrecision (symbol, fee) {
        return this.decimalToPrecision (fee, TRUNCATE, this.markets[symbol]['precision']['price'], DECIMAL_PLACES);
    }

    async fetchMarkets (params = {}) {
        // https://github.com/ccxt/ccxt/commit/866370ba6c9cabaf5995d992c15a82e38b8ca291
        // https://github.com/ccxt/ccxt/pull/4304
        const response = await this.v1GetMarkets ();
        const result = [];
        const markets = this.safeValue (response, 'data');
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let id = market['id'];
            let baseId = market['coin_market']['code'];
            let quoteId = market['coin_traded']['code'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let pricePrecision = 8;
            if (quote in this.options['pricePrecisionByCode'])
                pricePrecision = this.options['pricePrecisionByCode'][quote];
            let precision = {
                'amount': 8,
                'price': pricePrecision,
            };
            let paused = this.safeValue (market, 'paused', false);
            if (paused === 'false' || !paused) {
                paused = true;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': !paused,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchTransactions (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.v1GetTransactions ();
        return this.parseTransactions (response['data']);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.v1GetBalances (params);
        let balances = response['data'];
        let result = { 'info': balances };
        for (let i = 0; i < response['data'].length; i++) {
            let data = response['data'][i];
            let currency = this.commonCurrencyCode (data['coin']['code']);
            const account = {
                'free': this.safeFloat (data, 'balance', 0),
                'used': this.safeFloat (data, 'held_balance', 0),
                'total': this.safeFloat (data, 'balance', 0) + this.safeFloat (data, 'held_balance', 0),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let type = 'both';
        let response = await this.v1GetMarketsLabelOrderbook (this.extend ({
            'label': this.marketId (symbol),
            'side': type,
        }, params));
        let orderbook = response['data'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 0, 1);
    }

    parseTransaction (transaction, currency = undefined) {
        return {
            'info': transaction,
            'id': transaction['txid'],
            'txid': transaction['txid'],
            'timestamp': transaction['created'],
            'datetime': this.parse8601 (transaction['created']),
            'addressFrom': undefined,
            'address': transaction['address'],
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': transaction,
            'amount': transaction['amount'],
            'currency': transaction['address']['coin']['code'],
            'status': 'ok',
            'updated': undefined,
            'message': undefined,
            'fee': undefined,
        };
    }

    parseTicker (ticker, market = undefined) {
        return {
            'symbol': this.safeString (ticker, 'label'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high_price'),
            'low': this.safeFloat (ticker, 'low_price'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'price'),
            'last': this.safeFloat (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'price_change'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_traded'),
            'quoteVolume': this.safeFloat (ticker, 'volume_market'),
            'info': ticker,
        };
    }

    async fetchCurrencies (params = {}) {
        const response = await this.v1GetCoins (params);
        const currencies = this.safeValue (response, 'data', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.commonCurrencyCode (this.safeString (currency, 'code'));
            const precision = 8; // default precision, todo: fix "magic constants"
            const address = undefined;
            const fee = this.safeFloat (currency, 'tx_fee'); // todo: redesign
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': undefined,
                'name': currency['name'],
                'active': currency['maintenance'],
                'fee': fee,
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
                        'min': fee,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.v1GetMarkets (this.extend ({
            'market': symbols,
        }, params));
        let tickers = response['data'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['id'];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['label'];
            } else {
                symbol = this.parseSymbol (symbol);
                market = this.markets (symbol);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.v1GetMarketsLabel (this.extend ({
            'label': this.marketId (symbol),
        }, params));
        let ticker = response['data'][0];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['created'];
        let side = trade['maker'];
        let id = undefined;
        if (market === undefined) {
            market = this.marketId (trade['market']);
        }
        let symbol = market['symbol'];
        let cost = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.v1GetTradesAll (this.extend ({
            'market': market['id'],
        }, params));
        if ('data' in response) {
            if (response['data'] !== undefined) {
                // Re-format dat
                let data = [];
                for (let i = 0; i < response['data'].length; i++) {
                    let order = response['data'][i];
                    data.push ({
                        'market': order['market'],
                        'amount': order['amount'],
                        'symbol': symbol,
                        'maker': order['maker'],
                        'price': order['price'],
                        'created': order['created'],
                    });
                }
                return this.parseTrades (data, market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = undefined, limit = undefined) {
        let timestamp = this.parse8601 (ohlcv['timeframe'] + '+00:00');
        return [
            timestamp,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume_traded'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'period': this.timeframes[timeframe],
            'label': market['id'],
        };
        let response = await this.v1GetMarketsLabelOhlcv (this.extend (request, params));
        if ('result' in response) {
            if (response['data'])
                return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
        }
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'mine': true, 'status': 'init,open,closed,cancelled' };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.v1GetTrades (this.extend (request, params));
        let orders = this.parseOrders (response['data'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'mine': true };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.v1GetTrades (this.extend (request, params));
        let orders = this.parseOrders (response['data'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'side': side,
        };
        let response = await this.v1GetOrder (this.extend (order, params));
        let orderIdField = this.getOrderIdField ();
        let result = {
            'info': response,
            'id': response['data'][orderIdField],
            'symbol': symbol,
            'type': type,
            'side': side,
            'status': 'open',
        };
        return result;
    }

    getOrderIdField () {
        return 'id';
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'orderId': id };
        let response = await this.v1DeleteOrdersOrderId (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.v1GetDeposits (this.extend (request, params));
        let data = [];
        for (let i = 0; i < response['data'].length; i++) {
            let deposit = response['data'][i];
            let code = undefined;
            let currencyId = this.safeString (deposit['coin'], 'id');
            currency = this.safeValue (this.currencies_by_id, currencyId);
            if (currency !== undefined) {
                code = currency['code'];
            } else {
                code = this.commonCurrencyCode (this.safeString (deposit['coin'], 'id'));
            }
            const confirmed = this.safeValue (deposit, 'confirmed', false);
            let status = undefined;
            if (confirmed) {
                status = 'ok';
            } else {
                status = 'pending';
            }
            const timestamp = this.parse8601 (this.safeString (deposit, 'created'));
            data.push ({
                'info': response['data'][i],
                'id': this.safeString (deposit, 'txid'),
                'currency': code,
                'amount': this.safeFloat (deposit, 'amount'),
                'address': this.safeString (deposit['address'], 'address'),
                'tag': undefined,
                'status': status,
                'type': 'withdrawal',
                'updated': undefined,
                'txid': this.safeString (deposit, 'txid'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'fee': undefined,
            });
        }
        return data;
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.v1GetWithdraws (this.extend (request, params));
        let data = [];
        for (let i = 0; i < response['data'].length; i++) {
            let withdrawal = response['data'][i];
            let code = undefined;
            let currencyId = this.safeString (withdrawal['coin'], 'id');
            currency = this.safeValue (this.currencies_by_id, currencyId);
            if (currency !== undefined) {
                code = currency['code'];
            } else {
                code = this.commonCurrencyCode (this.safeString (withdrawal['coin'], 'id'));
            }
            const confirmed = this.safeValue (withdrawal, 'confirmed');
            const cancelled = this.safeValue (withdrawal, 'cancelled');
            const confirms = this.safeInteger (withdrawal, 'confirms', 0);
            let status = undefined;
            if (confirms) {
                status = 'ok';
            } else if (cancelled) {
                status = 'canceled';
            } else if (confirmed) {
                status = 'pending';
            }
            const timestamp = this.parse8601 (this.safeString (withdrawal, 'created'));
            data.push ({
                'info': response['data'][i],
                'id': this.safeString (withdrawal, 'txid'),
                'currency': code,
                'amount': this.safeFloat (withdrawal, 'amount'),
                'address': this.safeString (withdrawal, 'address'),
                'tag': undefined,
                'status': status,
                'type': 'withdrawal',
                'updated': undefined,
                'txid': this.safeString (withdrawal, 'txid'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'fee': undefined,
            });
        }
        return data;
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'side');
        let remaining = this.safeFloat (order, 'amount');
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (remaining > 0)
            status = 'open';
        if (this.safeValue (order, 'cancelled', false))
            status = 'canceled';
        if (remaining === 0)
            status = 'closed';
        let symbol = undefined;
        if ('market' in order) {
            let marketId = order['market'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('created' in order)
            timestamp = this.parse8601 (order['created'] + '+00:00');
        let lastTradeTimestamp = undefined;
        if (('date_closed' in order) && (order['date_closed'] !== 0))
            lastTradeTimestamp = this.parse8601 (order['date_closed'] + '+00:00');
        if (timestamp === undefined)
            timestamp = lastTradeTimestamp;
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount_start');
        let cost = this.safeFloat (order, 'amount_coin');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        let id = this.safeString (order, 'id');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let request = {};
            request['orderId'] = id;
            response = await this.v1GetOrdersOrderId (this.extend (request, params));
        } catch (e) {
            throw e;
        }
        if (!response['data']) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['data']);
    }

    orderToTrade (order) {
        // this entire method should be moved to the base class
        const timestamp = this.safeInteger (order, 'created');
        const market = this.marketId (this.safeString (order, 'market'));
        return {
            'id': this.safeString (order, 'id'),
            'side': this.safeString (order, 'side'),
            'order': this.safeString (order, 'id'),
            'price': this.safeFloat (order, 'price'),
            'amount': this.safeFloat (order, 'amount'),
            'cost': this.safeFloat (order, 'amount_coin'),
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
            'info': order,
        };
    }

    ordersToTrades (orders) {
        // this entire method should be moved to the base class
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            result.push (this.orderToTrade (orders[i]));
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        params['symbol'] = symbol;
        const orders = await this.v1GetOrders (params, since, limit, params);
        return this.ordersToTrades (orders);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'mine': true };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.v1GetOrders (this.extend (request, params));
        let orders = this.parseOrders (response['data'], market, since, limit);
        if (symbol !== undefined)
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'label': currency['id'],
        };
        const response = await this.v1GetAddressesLabel (this.extend (request, params));
        let address = this.safeString (response['data']['address'], 'address');
        if (!address) {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'label': currency['id'],
            'amount': amount,
            'address': address,
        };
        let response = await this.v1GetAccountWithdraw (this.extend (request, params));
        let id = undefined;
        if ('data' in response) {
            if ('withdraw' in response['data'])
                id = response['data']['withdraw']['id'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    nonce () {
        return this.seconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'][api], {
            'hostname': this.hostname,
        }) + '/v1/';
        url += this.implodeParams (path, params);
        params['limit'] = 500;
        url += '?' + this.urlencode (params);
        this.checkRequiredCredentials ();
        let nonce = '' + this.nonce ();
        let signature = this.hmac (this.encode (nonce), this.encode (this.secret), 'sha256');
        headers = {
            'X-BOA-ENCRYPTED': signature,
            'X-BOA-KEY': this.apiKey,
            'X-BOA-NONCE': nonce,
            'Content-Type': 'application/json',
        };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (body[0] === '{') {
            let data = this.safeValue (response, 'data');
            let errors = this.safeValue (response, 'errors');
            if (errors !== undefined)
                throw new ExchangeError (this.id + ': (URL: ' + url + ') an error occoured: ' + this.json (errors));
            if (data === undefined)
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
        }
    }

    appendTimezoneParse8601 (x) {
        let length = x.length;
        let lastSymbol = x[length - 1];
        if ((lastSymbol === 'Z') || (x.indexOf ('+') >= 0)) {
            return this.parse8601 (x);
        }
        return this.parse8601 (x + 'Z');
    }

    async request (path, api = '', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
