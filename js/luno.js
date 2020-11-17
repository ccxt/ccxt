'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class luno extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'luno',
            'name': 'luno',
            'countries': [ 'GB', 'SG', 'ZA' ],
            'rateLimit': 1000,
            'version': '1',
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
            },
            'urls': {
                'referral': 'https://www.luno.com/invite/44893A',
                'logo': 'https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg',
                'api': 'https://api.luno.com/api',
                'www': 'https://www.luno.com',
                'doc': [
                    'https://www.luno.com/en/api',
                    'https://npmjs.org/package/bitx',
                    'https://github.com/bausmeier/node-bitx',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'orderbook',
                        'orderbook_top',
                        'ticker',
                        'tickers',
                        'trades',
                    ],
                },
                'private': {
                    'get': [
                        'accounts/{id}/pending',
                        'accounts/{id}/transactions',
                        'balance',
                        'beneficiaries',
                        'fee_info',
                        'funding_address',
                        'listorders',
                        'listtrades',
                        'orders/{id}',
                        'quotes/{id}',
                        'withdrawals',
                        'withdrawals/{id}',
                    ],
                    'post': [
                        'accounts',
                        'accounts/{id}/name',
                        'postorder',
                        'marketorder',
                        'stoporder',
                        'funding_address',
                        'withdrawals',
                        'send',
                        'quotes',
                        'oauth2/grant',
                    ],
                    'put': [
                        'accounts/{id}/name',
                        'quotes/{id}',
                    ],
                    'delete': [
                        'quotes/{id}',
                        'withdrawals/{id}',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetTickers (params);
        const result = [];
        for (let i = 0; i < response['tickers'].length; i++) {
            const market = response['tickers'][i];
            const id = market['pair'];
            const baseId = id.slice (0, 3);
            const quoteId = id.slice (3, 6);
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': undefined,
                'precision': this.precision,
                'limits': this.limits,
            });
        }
        return result;
    }

    async fetchAccounts (params = {}) {
        const response = await this.privateGetBalance (params);
        const wallets = this.safeValue (response, 'balance', []);
        const result = [];
        for (let i = 0; i < wallets.length; i++) {
            const account = wallets[i];
            const accountId = this.safeString (account, 'account_id');
            const currencyId = this.safeString (account, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'id': accountId,
                'type': undefined,
                'currency': code,
                'info': account,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        const wallets = this.safeValue (response, 'balance', []);
        const result = { 'info': response };
        for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const currencyId = this.safeString (wallet, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const reserved = this.safeFloat (wallet, 'reserved');
            const unconfirmed = this.safeFloat (wallet, 'unconfirmed');
            const balance = this.safeFloat (wallet, 'balance');
            const account = this.account ();
            account['used'] = this.sum (reserved, unconfirmed);
            account['total'] = this.sum (balance, unconfirmed);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'publicGetOrderbook';
        if (limit !== undefined) {
            if (limit <= 100) {
                method += 'Top'; // get just the top of the orderbook when limit is low
            }
        }
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this[method] (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, timestamp, 'bids', 'asks', 'price', 'volume');
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "base": "string",
        //         "completed_timestamp": "string",
        //         "counter": "string",
        //         "creation_timestamp": "string",
        //         "expiration_timestamp": "string",
        //         "fee_base": "string",
        //         "fee_counter": "string",
        //         "limit_price": "string",
        //         "limit_volume": "string",
        //         "order_id": "string",
        //         "pair": "string",
        //         "state": "PENDING",
        //         "type": "BID"
        //     }
        //
        const timestamp = this.safeInteger (order, 'creation_timestamp');
        const status = (order['state'] === 'PENDING') ? 'open' : 'closed';
        const side = (order['type'] === 'ASK') ? 'sell' : 'buy';
        const marketId = this.safeString (order, 'pair');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeFloat (order, 'limit_price');
        const amount = this.safeFloat (order, 'limit_volume');
        const quoteFee = this.safeFloat (order, 'fee_counter');
        const baseFee = this.safeFloat (order, 'fee_base');
        const filled = this.safeFloat (order, 'base');
        const cost = this.safeFloat (order, 'counter');
        let remaining = undefined;
        if (amount !== undefined) {
            if (filled !== undefined) {
                remaining = Math.max (0, amount - filled);
            }
        }
        const fee = { 'currency': undefined };
        if (quoteFee) {
            fee['cost'] = quoteFee;
            if (market !== undefined) {
                fee['currency'] = market['quote'];
            }
        } else {
            fee['cost'] = baseFee;
            if (market !== undefined) {
                fee['currency'] = market['base'];
            }
        }
        const id = this.safeString (order, 'order_id');
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'cost': cost,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
            'average': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrdersByState (state = undefined, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (state !== undefined) {
            request['state'] = state;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
        }
        const response = await this.privateGetListorders (this.extend (request, params));
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState (undefined, symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('PENDING', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersByState ('COMPLETE', symbol, since, limit, params);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last_trade');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'rolling_24_hour_volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const tickers = this.indexBy (response['tickers'], 'pair');
        const ids = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.safeMarket (id);
            const symbol = market['symbol'];
            const ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market) {
        // For public trade data (is_buy === True) indicates 'buy' side but for private trade data
        // is_buy indicates maker or taker. The value of "type" (ASK/BID) indicate sell/buy side.
        // Private trade data includes ID field which public trade data does not.
        const orderId = this.safeString (trade, 'order_id');
        let takerOrMaker = undefined;
        let side = undefined;
        if (orderId !== undefined) {
            side = (trade['type'] === 'ASK') ? 'sell' : 'buy';
            if (side === 'sell' && trade['is_buy']) {
                takerOrMaker = 'maker';
            } else if (side === 'buy' && !trade['is_buy']) {
                takerOrMaker = 'maker';
            } else {
                takerOrMaker = 'taker';
            }
        } else {
            side = trade['is_buy'] ? 'buy' : 'sell';
        }
        const feeBase = this.safeFloat (trade, 'fee_base');
        const feeCounter = this.safeFloat (trade, 'fee_counter');
        let feeCurrency = undefined;
        let feeCost = undefined;
        if (feeBase !== undefined) {
            if (feeBase !== 0.0) {
                feeCurrency = market['base'];
                feeCost = feeBase;
            }
        } else if (feeCounter !== undefined) {
            if (feeCounter !== 0.0) {
                feeCurrency = market['quote'];
                feeCost = feeCounter;
            }
        }
        const timestamp = this.safeInteger (trade, 'timestamp');
        return {
            'info': trade,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'volume'),
            // Does not include potential fee costs
            'cost': this.safeFloat (trade, 'counter'),
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetListtrades (this.extend (request, params));
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetFeeInfo (params);
        return {
            'info': response,
            'maker': this.safeFloat (response, 'maker_fee'),
            'taker': this.safeFloat (response, 'taker_fee'),
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privatePost';
        const request = {
            'pair': this.marketId (symbol),
        };
        if (type === 'market') {
            method += 'Marketorder';
            request['type'] = side.toUpperCase ();
            if (side === 'buy') {
                request['counter_volume'] = amount;
            } else {
                request['base_volume'] = amount;
            }
        } else {
            method += 'Postorder';
            request['volume'] = amount;
            request['price'] = price;
            request['type'] = (side === 'buy') ? 'BID' : 'ASK';
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        return await this.privatePostStoporder (this.extend (request, params));
    }

    async fetchLedgerByEntries (code = undefined, entry = -1, limit = 1, params = {}) {
        // by default without entry number or limit number, return most recent entry
        const since = undefined;
        const request = {
            'min_row': entry,
            'max_row': this.sum (entry, limit),
        };
        return await this.fetchLedger (code, since, limit, this.extend (request, params));
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        let currency = undefined;
        let id = this.safeString (params, 'id'); // account id
        let min_row = this.safeValue (params, 'min_row');
        let max_row = this.safeValue (params, 'max_row');
        if (id === undefined) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchLedger() requires a currency code argument if no account id specified in params');
            }
            currency = this.currency (code);
            const accountsByCurrencyCode = this.indexBy (this.accounts, 'currency');
            const account = this.safeValue (accountsByCurrencyCode, code);
            if (account === undefined) {
                throw new ExchangeError (this.id + ' fetchLedger() could not find account id for ' + code);
            }
            id = account['id'];
        }
        if (min_row === undefined && max_row === undefined) {
            max_row = 0; // Default to most recent transactions
            min_row = -1000; // Maximum number of records supported
        } else if (min_row === undefined || max_row === undefined) {
            throw new ExchangeError (this.id + " fetchLedger() require both params 'max_row' and 'min_row' or neither to be defined");
        }
        if (limit !== undefined && max_row - min_row > limit) {
            if (max_row <= 0) {
                min_row = max_row - limit;
            } else if (min_row > 0) {
                max_row = min_row + limit;
            }
        }
        if (max_row - min_row > 1000) {
            throw new ExchangeError (this.id + " fetchLedger() requires the params 'max_row' - 'min_row' <= 1000");
        }
        const request = {
            'id': id,
            'min_row': min_row,
            'max_row': max_row,
        };
        const response = await this.privateGetAccountsIdTransactions (this.extend (params, request));
        const entries = this.safeValue (response, 'transactions', []);
        return this.parseLedger (entries, currency, since, limit);
    }

    parseLedgerComment (comment) {
        const words = comment.split (' ');
        const types = {
            'Withdrawal': 'fee',
            'Trading': 'fee',
            'Payment': 'transaction',
            'Sent': 'transaction',
            'Deposit': 'transaction',
            'Received': 'transaction',
            'Released': 'released',
            'Reserved': 'reserved',
            'Sold': 'trade',
            'Bought': 'trade',
            'Failure': 'failed',
        };
        let referenceId = undefined;
        const firstWord = this.safeString (words, 0);
        const thirdWord = this.safeString (words, 2);
        const fourthWord = this.safeString (words, 3);
        let type = this.safeString (types, firstWord, undefined);
        if ((type === undefined) && (thirdWord === 'fee')) {
            type = 'fee';
        }
        if ((type === 'reserved') && (fourthWord === 'order')) {
            referenceId = this.safeString (words, 4);
        }
        return {
            'type': type,
            'referenceId': referenceId,
        };
    }

    parseLedgerEntry (entry, currency = undefined) {
        // const details = this.safeValue (entry, 'details', {});
        const id = this.safeString (entry, 'row_index');
        const account_id = this.safeString (entry, 'account_id');
        const timestamp = this.safeValue (entry, 'timestamp');
        const currencyId = this.safeString (entry, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const available_delta = this.safeFloat (entry, 'available_delta');
        const balance_delta = this.safeFloat (entry, 'balance_delta');
        const after = this.safeFloat (entry, 'balance');
        const comment = this.safeString (entry, 'description');
        let before = after;
        let amount = 0.0;
        const result = this.parseLedgerComment (comment);
        const type = result['type'];
        const referenceId = result['referenceId'];
        let direction = undefined;
        let status = undefined;
        if (balance_delta !== 0.0) {
            before = after - balance_delta; // TODO: float precision
            status = 'ok';
            amount = Math.abs (balance_delta);
        } else if (available_delta < 0.0) {
            status = 'pending';
            amount = Math.abs (available_delta);
        } else if (available_delta > 0.0) {
            status = 'canceled';
            amount = Math.abs (available_delta);
        }
        if (balance_delta > 0 || available_delta > 0) {
            direction = 'in';
        } else if (balance_delta < 0 || available_delta < 0) {
            direction = 'out';
        }
        return {
            'id': id,
            'direction': direction,
            'account': account_id,
            'referenceId': referenceId,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': before,
            'after': after,
            'status': status,
            'fee': undefined,
            'info': entry,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const auth = this.stringToBase64 (this.apiKey + ':' + this.secret);
            headers = {
                'Authorization': 'Basic ' + this.decode (auth),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if ('error' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
