'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, NotSupported, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitstamp extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitstamp',
            'name': 'Bitstamp',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': true,
                'fetchDepositAddress': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': 'https://www.bitstamp.net/api',
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'order_book/{pair}/',
                        'ticker_hour/{pair}/',
                        'ticker/{pair}/',
                        'transactions/{pair}/',
                        'trading-pairs-info/',
                    ],
                },
                'private': {
                    'post': [
                        'balance/',
                        'balance/{pair}/',
                        'bch_withdrawal/',
                        'bch_address/',
                        'user_transactions/',
                        'user_transactions/{pair}/',
                        'open_orders/all/',
                        'open_orders/{pair}/',
                        'order_status/',
                        'cancel_order/',
                        'buy/{pair}/',
                        'buy/market/{pair}/',
                        'sell/{pair}/',
                        'sell/market/{pair}/',
                        'ltc_withdrawal/',
                        'ltc_address/',
                        'eth_withdrawal/',
                        'eth_address/',
                        'xrp_withdrawal/',
                        'xrp_address/',
                        'transfer-to-main/',
                        'transfer-from-main/',
                        'withdrawal-requests/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'withdrawal/cancel/',
                        'liquidation_address/new/',
                        'liquidation_address/info/',
                    ],
                },
                'v1': {
                    'post': [
                        'bitcoin_deposit_address/',
                        'unconfirmed_btc/',
                        'bitcoin_withdrawal/',
                        'ripple_withdrawal/',
                        'ripple_address/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.25 / 100,
                    'maker': 0.25 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.25 / 100],
                            [20000, 0.24 / 100],
                            [100000, 0.22 / 100],
                            [400000, 0.20 / 100],
                            [600000, 0.15 / 100],
                            [1000000, 0.14 / 100],
                            [2000000, 0.13 / 100],
                            [4000000, 0.12 / 100],
                            [20000000, 0.11 / 100],
                            [20000001, 0.10 / 100],
                        ],
                        'maker': [
                            [0, 0.25 / 100],
                            [20000, 0.24 / 100],
                            [100000, 0.22 / 100],
                            [400000, 0.20 / 100],
                            [600000, 0.15 / 100],
                            [1000000, 0.14 / 100],
                            [2000000, 0.13 / 100],
                            [4000000, 0.12 / 100],
                            [20000000, 0.11 / 100],
                            [20000001, 0.10 / 100],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0,
                        'BCH': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'USD': 25,
                        'EUR': 0.90,
                    },
                    'deposit': {
                        'BTC': 0,
                        'BCH': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'USD': 25,
                        'EUR': 0,
                    },
                },
            },
            'exceptions': {
                'No permission found': PermissionDenied,
            },
        });
    }

    async fetchMarkets () {
        let markets = await this.publicGetTradingPairsInfo ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let symbol = market['name'];
            let [ base, quote ] = symbol.split ('/');
            let baseId = base.toLowerCase ();
            let quoteId = quote.toLowerCase ();
            let symbolId = baseId + '_' + quoteId;
            let id = market['url_symbol'];
            let precision = {
                'amount': market['base_decimals'],
                'price': market['counter_decimals'],
            };
            let parts = market['minimum_order'].split (' ');
            let cost = parts[0];
            // let [ cost, currency ] = market['minimum_order'].split (' ');
            let active = (market['trading'] === 'Enabled');
            let lot = Math.pow (10, -precision['amount']);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'symbolId': symbolId,
                'info': market,
                'lot': lot,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (cost),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBookPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (orderbook['timestamp']) * 1000;
        return this.parseOrderBook (orderbook, timestamp);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let ticker = await this.publicGetTickerPair (this.extend ({
            'pair': this.marketId (symbol),
        }, params));
        let timestamp = parseInt (ticker['timestamp']) * 1000;
        let vwap = this.safeFloat (ticker, 'vwap');
        let baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'last');
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
            'open': this.safeFloat (ticker, 'open'),
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

    getMarketFromTrade (trade) {
        trade = this.omit (trade, [
            'fee',
            'price',
            'datetime',
            'tid',
            'type',
            'order_id',
            'side',
        ]);
        let currencyIds = Object.keys (trade);
        let numCurrencyIds = currencyIds.length;
        if (numCurrencyIds > 2)
            throw new ExchangeError (this.id + ' getMarketFromTrade too many keys: ' + this.json (currencyIds) + ' in the trade: ' + this.json (trade));
        if (numCurrencyIds === 2) {
            let marketId = currencyIds[0] + currencyIds[1];
            if (marketId in this.markets_by_id)
                return this.markets_by_id[marketId];
            marketId = currencyIds[1] + currencyIds[0];
            if (marketId in this.markets_by_id)
                return this.markets_by_id[marketId];
        }
        return undefined;
    }

    getMarketFromTrades (trades) {
        let tradesBySymbol = this.indexBy (trades, 'symbol');
        let symbols = Object.keys (tradesBySymbol);
        let numSymbols = symbols.length;
        if (numSymbols === 1)
            return this.markets[symbols[0]];
        return undefined;
    }

    parseTrade (trade, market = undefined) {
        let timestamp = undefined;
        let symbol = undefined;
        if ('date' in trade) {
            timestamp = parseInt (trade['date']) * 1000;
        } else if ('datetime' in trade) {
            timestamp = this.parse8601 (trade['datetime']);
        }
        // only if overrided externally
        let side = this.safeString (trade, 'side');
        let orderId = this.safeString (trade, 'order_id');
        if (typeof orderId === 'undefined')
            if (typeof side === 'undefined') {
                side = this.safeInteger (trade, 'type');
                if (side === 0)
                    side = 'buy';
                else
                    side = 'sell';
            }
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let id = this.safeString (trade, 'tid');
        id = this.safeString (trade, 'id', id);
        if (typeof market === 'undefined') {
            let keys = Object.keys (trade);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].indexOf ('_') >= 0) {
                    let marketId = keys[i].replace ('_', '');
                    if (marketId in this.markets_by_id)
                        market = this.markets_by_id[marketId];
                }
            }
            // if the market is still not defined
            // try to deduce it from used keys
            if (typeof market === 'undefined')
                market = this.getMarketFromTrade (trade);
        }
        let feeCost = this.safeFloat (trade, 'fee');
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            price = this.safeFloat (trade, market['symbolId'], price);
            amount = this.safeFloat (trade, market['baseId'], amount);
            feeCurrency = market['quote'];
            symbol = market['symbol'];
        }
        let cost = undefined;
        if (typeof price !== 'undefined')
            if (typeof amount !== 'undefined')
                cost = price * amount;
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTransactionsPair (this.extend ({
            'pair': market['id'],
            'time': 'hour',
        }, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balance = await this.privatePostBalance ();
        let result = { 'info': balance };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let lowercase = currency.toLowerCase ();
            let total = lowercase + '_balance';
            let free = lowercase + '_available';
            let used = lowercase + '_reserved';
            let account = this.account ();
            if (free in balance)
                account['free'] = parseFloat (balance[free]);
            if (used in balance)
                account['used'] = parseFloat (balance[used]);
            if (total in balance)
                account['total'] = parseFloat (balance[total]);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'pair': this.marketId (symbol),
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'market')
            method += 'Market';
        else
            order['price'] = this.priceToPrecision (symbol, price);
        method += 'Pair';
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'id': id });
    }

    parseOrderStatus (order) {
        if ((order['status'] === 'Queue') || (order['status'] === 'Open'))
            return 'open';
        if (order['status'] === 'Finished')
            return 'closed';
        return order['status'];
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus (this.extend ({ 'id': id }, params));
        return this.parseOrderStatus (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (typeof symbol !== 'undefined')
            market = this.market (symbol);
        let response = await this.privatePostOrderStatus (this.extend ({ 'id': id }, params));
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let method = 'privatePostUserTransactions';
        let market = undefined;
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
            request['pair'] = market['id'];
            method += 'Pair';
        }
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this[method] (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        let id = this.safeString (order, 'id');
        let timestamp = undefined;
        let iso8601 = undefined;
        let side = this.safeString (order, 'type');
        if (typeof side !== 'undefined')
            side = (side === '1') ? 'sell' : 'buy';
        let datetimeString = this.safeString (order, 'datetime');
        if (typeof datetimeString !== 'undefined') {
            timestamp = this.parse8601 (datetimeString);
            iso8601 = this.iso8601 (timestamp);
        }
        let symbol = undefined;
        if (typeof market === 'undefined') {
            if ('currency_pair' in order) {
                let marketId = order['currency_pair'];
                if (marketId in this.markets_by_id)
                    market = this.markets_by_id[marketId];
            }
        }
        let amount = this.safeFloat (order, 'amount');
        let filled = 0.0;
        let trades = [];
        let transactions = this.safeValue (order, 'transactions');
        let feeCost = undefined;
        let cost = undefined;
        if (typeof transactions !== 'undefined') {
            if (Array.isArray (transactions)) {
                feeCost = 0.0;
                for (let i = 0; i < transactions.length; i++) {
                    let trade = this.parseTrade (this.extend ({
                        'order_id': id,
                        'side': side,
                    }, transactions[i]), market);
                    filled += trade['amount'];
                    feeCost += trade['fee']['cost'];
                    if (typeof cost === 'undefined')
                        cost = 0.0;
                    cost += trade['cost'];
                    trades.push (trade);
                }
            }
        }
        let status = this.safeString (order, 'status');
        if ((status === 'In Queue') || (status === 'Open'))
            status = 'open';
        else if (status === 'Finished') {
            status = 'closed';
            if (typeof amount === 'undefined')
                amount = filled;
        }
        let remaining = undefined;
        if (typeof amount !== 'undefined')
            remaining = amount - filled;
        let price = this.safeFloat (order, 'price');
        if (typeof market === 'undefined')
            market = this.getMarketFromTrades (trades);
        let feeCurrency = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        if (typeof cost === 'undefined') {
            if (typeof price !== 'undefined')
                cost = price * filled;
        } else if (typeof price === 'undefined') {
            if (filled > 0)
                price = cost / filled;
        }
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return {
            'id': id,
            'datetime': iso8601,
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        await this.loadMarkets ();
        if (typeof symbol !== 'undefined') {
            market = this.market (symbol);
        }
        let orders = await this.privatePostOpenOrdersAll ();
        return this.parseOrders (orders, market, since, limit);
    }

    getCurrencyName (code) {
        if (code === 'BTC')
            return 'bitcoin';
        return code.toLowerCase ();
    }

    isFiat (code) {
        if (code === 'USD')
            return true;
        if (code === 'EUR')
            return true;
        return false;
    }

    async fetchDepositAddress (code, params = {}) {
        if (this.isFiat (code))
            throw new NotSupported (this.id + ' fiat fetchDepositAddress() for ' + code + ' is not implemented yet');
        let name = this.getCurrencyName (code);
        let v1 = (code === 'BTC');
        let method = v1 ? 'v1' : 'private'; // v1 or v2
        method += 'Post' + this.capitalize (name);
        method += v1 ? 'Deposit' : '';
        method += 'Address';
        let response = await this[method] (params);
        let address = v1 ? response : this.safeString (response, 'address');
        let tag = v1 ? undefined : this.safeString (response, 'destination_tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        if (this.isFiat (code))
            throw new NotSupported (this.id + ' fiat withdraw() for ' + code + ' is not implemented yet');
        let name = this.getCurrencyName (code);
        let request = {
            'amount': amount,
            'address': address,
        };
        let v1 = (code === 'BTC');
        let method = v1 ? 'v1' : 'private'; // v1 or v2
        method += 'Post' + this.capitalize (name) + 'Withdrawal';
        let query = params;
        if (code === 'XRP') {
            if (typeof tag !== 'undefined') {
                request['destination_tag'] = tag;
                query = this.omit (params, 'destination_tag');
            } else {
                throw new ExchangeError (this.id + ' withdraw() requires a destination_tag param for ' + code);
            }
        }
        let response = await this[method] (this.extend (request, query));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/';
        if (api !== 'v1')
            url += this.version + '/';
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let auth = nonce + this.uid + this.apiKey;
            let signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
            query = this.extend ({
                'key': this.apiKey,
                'signature': signature.toUpperCase (),
                'nonce': nonce,
            }, query);
            body = this.urlencode (query);
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            // fetchDepositAddress returns {"error": "No permission found"} on apiKeys that don't have the permission required
            let error = this.safeString (response, 'error');
            let exceptions = this.exceptions;
            if (error in exceptions) {
                throw new exceptions[error] (this.id + ' ' + body);
            }
            let status = this.safeString (response, 'status');
            if (status === 'error') {
                let code = this.safeString (response, 'code');
                if (typeof code !== 'undefined') {
                    if (code === 'API0005')
                        throw new AuthenticationError (this.id + ' invalid signature, use the uid for the main account if you have subaccounts');
                }
                throw new ExchangeError (this.id + ' ' + body);
            }
        }
    }
};
