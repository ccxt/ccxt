'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, NotSupported } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class basefex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'basefex',
            'name': 'BaseFEX',
            'countries': ['SC'],
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchTradingFees': false,
                'fetchTicker': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'editOrder': 'emulated',
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': true,
                'fetchLedger': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/56343370/68750543-00886f80-063b-11ea-8bbd-8f53201602a8.png',
                'api': 'https://api.basefex.com',
                'www': 'https://www.basefex.com',
                'doc': ['https://github.com/BaseFEX/basefex-api-docs', 'https://github.com/BaseFEX/basefex-api-docs/blob/master/api-doc_en.md'],
                'fees': 'https://www.basefex.com/docs/fees',
                'referral': 'https://www.basefex.com/register/76VqmL',
            },
            'api': {
                'public': {
                    'get': ['symbols', 'spec/kvs', 'candlesticks/{type}@{symbol}/history', 'depth@{symbol}/snapshot', 'v1/trades/{symbol}'],
                },
                'private': {
                    'get': ['accounts', 'orders/{id}', 'orders', 'trades', 'accounts/deposits/{currency}/address', 'accounts/transactions'],
                    'post': ['orders'],
                    'put': [],
                    'delete': ['orders/{id}'],
                },
            },
            'timeframes': {
                '1m': '1MIN',
                '3m': '3MIN',
                '5m': '5MIN',
                '15m': '15MIN',
                '30m': '30MIN',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': '1DAY',
            },
            'exceptions': {},
            'httpExceptions': {
                '498': AuthenticationError,
            },
            'options': {
                'api-expires': 10,
                'kvs-key': ['maker-fee-rate', 'taker-fee-rate', 'long-funding-rate', 'short-funding-rate', 'funding-interval'],
                'order-status': {
                    'NEW': 'open',
                    'INFORCE': 'open',
                    'PARTIALLY_FILLED': 'open',
                    'PARTIALLY_CANCELED': 'canceled',
                    'FILLED': 'closed',
                    'CANCELED': 'canceled',
                    'PENDING_CANCEL': 'open',
                    'REJECTED': 'rejected',
                    'UNTRIGGERED': 'open',
                },
                'deposit-status': {
                    'NEW': 'pending',
                    'COMPLETED': 'ok',
                },
                'withdrawal-status': {
                    'NEW': 'pending',
                    'REJECTED': 'failed',
                    'AUDITED': 'pending',
                    'PROCESSED': 'pending',
                    'COMPLETED': 'ok',
                    'CANCELED': 'canceled',
                    'PENDING': 'pending',
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const symbols = await this.publicGetSymbols ();
        return this.fnMap (symbols, 'cast_market');
    }

    async fetchTradingFees (params = {}) {
        throw new NotSupported (this.id + ' fetchTradingFees not supported yet');
    }

    async fetchTicker (symbol, params = {}) {
        const candlesticks = await this.publicGetCandlesticksTypeSymbolHistory ({
            'path': {
                'type': '1DAY',
                'symbol': this.translateBaseFEXSymbol (symbol),
            },
            'query': {
                'limit': 1,
            },
        });
        return this.castTicker (candlesticks[0], symbol);
    }

    async fetchOrderBook (symbol) {
        const orderbookSource = await this.publicGetDepthSymbolSnapshot ({
            'path': {
                'symbol': this.translateBaseFEXSymbol (symbol),
            },
        });
        return this.castOrderBook (orderbookSource);
    }

    async fetchTrades (symbol) {
        const trades = await this.publicGetV1TradesSymbol ({
            'path': { 'symbol': this.translateBaseFEXSymbol (symbol) },
        });
        return this.fnMap (trades, 'cast_trade', symbol);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        let _from = undefined;
        let _to = undefined;
        if (since > 0) {
            _from = this.iso8601 (since);
            _to = this.iso8601 (this.milliseconds ());
        }
        const query = {
            'limit': limit,
            'from': _from,
            'to': _to,
        };
        const ohlcv = await this.publicGetCandlesticksTypeSymbolHistory ({
            'path': {
                'type': this.timeframes[timeframe],
                'symbol': this.translateBaseFEXSymbol (symbol),
            },
            'query': this.extend (query, this.safeValue (params, 'query', {})),
        });
        let result = this.fnMap (ohlcv, 'cast_ohlcv');
        result = this.fnReverse (result);
        return result;
    }

    async fetchBalance (params = {}) {
        const accounts = await this.privateGetAccounts ();
        return this.castBalance (accounts);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const body = {
            'symbol': this.translateBaseFEXSymbol (symbol),
            'type': this.translateBaseFEXOrderType (type),
            'side': this.translateBaseFEXOrderSide (side),
            'size': amount,
            'price': price,
        };
        const order = await this.privatePostOrders ({
            'body': this.extend (body, this.safeValue (params, 'body', {})),
        });
        return this.castOrder (order, symbol);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.privateDeleteOrdersId ({
            'path': {
                'id': id,
            },
        });
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        const order = await this.privateGetOrdersId ({
            'path': {
                'id': id,
            },
        });
        return this.castOrder (order, symbol);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const query = {
            'symbol': this.translateBaseFEXSymbol (symbol),
            'limit': limit,
        };
        let orders = await this.privateGetOrders ({
            'query': this.extend (query, this.safeValue (params, 'query', {})),
        });
        orders = this.fnFilter (orders, 'lo_is_open_order');
        return this.fnMap (orders, 'cast_order', symbol);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const query = {
            'symbol': this.translateBaseFEXSymbol (symbol),
            'limit': limit,
        };
        const trades = await this.privateGetTrades ({
            'query': this.extend (query, this.safeValue (params, 'query', {})),
        });
        return this.fnMap (trades, 'cast_my_trade', symbol);
    }

    async fetchDepositAddress (code, params = {}) {
        const depositAddress = await this.privateGetAccountsDepositsCurrencyAddress ({
            'path': {
                'currency': code,
            },
        });
        return this.castDepositAddress (depositAddress, code);
    }

    async fetchDeposits (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const query = {
            'type': 'DEPOSIT',
        };
        params = this.extend ({ 'query': query }, params);
        return this.fetchTransactions (symbol, since, limit, params);
    }

    async fetchWithdrawals (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const query = {
            'type': 'WITHDRAW',
        };
        params = this.extend ({ 'query': query }, params);
        return this.fetchTransactions (symbol, since, limit, params);
    }

    async fetchTransactions (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const query = {
            'limit': limit,
        };
        let transactions = await this.privateGetAccountsTransactions ({
            'query': this.extend (query, this.safeValue (params, 'query', {})),
        });
        if (symbol) {
            transactions = this.fnFilter (transactions, 'lo_currency_equal', symbol);
        }
        return this.fnMap (transactions, 'cast_transaction');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.urls['api'] + path;
        if (api === 'private' && this.apiKey && this.secret) {
            let auth = method + path;
            let expires = this.options['api-expires'];
            expires = this.sum (this.seconds (), expires).toString ();
            auth += expires;
            if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
                if (body && Object.keys (body).length > 0) {
                    body = this.json (body);
                    auth += body;
                }
            }
            if (headers === undefined) {
                headers = {};
            }
            headers['api-key'] = this.apiKey;
            headers['api-expires'] = expires;
            headers['api-signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const pathObj = this.safeValue (params, 'path');
        if (pathObj) {
            path = this.implodeParams (path, pathObj);
        }
        path = '/' + path;
        const queryObj = this.safeValue (params, 'query');
        if (queryObj) {
            const query = this.urlencode (queryObj);
            if (query !== '') {
                path += '?' + query;
            }
        }
        const headersObj = this.safeValue (params, 'headers', {});
        headers = this.extend ({ 'Content-Type': 'application/json' }, headersObj);
        body = this.safeValue (params, 'body');
        return super.request (path, api, method, params, headers, body);
    }

    castMarket (symbol, params) {
        const _base = this.safeString (symbol, 'baseCurrency');
        const _quote = this.safeString (symbol, 'quoteCurrency');
        return {
            'id': this.safeString (symbol, 'symbol'),
            'symbol': this.translateSymbol (_base, _quote),
            'base': _base.toUpperCase (),
            'quote': _quote.toUpperCase (),
            'baseId': _base,
            'quoteId': _quote,
            'active': this.safeValue (symbol, 'enable'),
            'precision': {
                'price': this.safeInteger (symbol, 'priceStep'),
            },
            'limits': {},
            'info': symbol,
        };
    }

    castTicker (candlestick, symbol) {
        const timestamp = this.safeInteger (candlestick, 'time');
        const open = this.safeFloat (candlestick, 'open');
        const close = this.safeFloat (candlestick, 'close');
        const last = close;
        const change = this.sum (last, -open);
        const percentage = (change / open) * 100;
        const average = this.sum (last, open) / 2;
        return {
            'symbol': symbol,
            'info': candlestick,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (candlestick, 'high'),
            'low': this.safeFloat (candlestick, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeFloat (candlestick, 'volume'),
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': undefined,
        };
    }

    castOrderBook (source) {
        const bids = this.fnEntites (this.safeValue (source, 'bids'));
        const asks = this.fnEntites (this.safeValue (source, 'asks'));
        return this.parseOrderBook ({ 'bids': bids, 'asks': asks });
    }

    castTrade (trade, symbol) {
        const _timestamp = this.safeInteger (trade, 'matchedAt');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        const cost = price * amount;
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': _timestamp,
            'datetime': this.iso8601 (_timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': this.translateOrderSide (this.safeString (trade, 'side')),
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    castOHLCV (candlestick, params) {
        return [this.safeInteger (candlestick, 'time'), this.safeFloat (candlestick, 'open'), this.safeFloat (candlestick, 'high'), this.safeFloat (candlestick, 'low'), this.safeFloat (candlestick, 'close'), this.safeFloat (candlestick, 'volume')];
    }

    castBalance (accounts) {
        accounts = this.fnMap (accounts, 'fn_pick', 'cash');
        const balance = {
            'info': accounts,
            'free': {},
            'used': {},
            'total': {},
        };
        for (let i = 0; i < accounts.length; i++) {
            const cash = accounts[i];
            const currency = this.safeString (cash, 'currency');
            const total = this.safeFloat (cash, 'marginBalances');
            const free = this.safeFloat (cash, 'available');
            const used = this.sum (total, -free);
            balance.free[currency] = free;
            balance.used[currency] = used;
            balance.total[currency] = total;
            balance[currency] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return balance;
    }

    castOrder (order, symbol) {
        const _timestamp = this.safeInteger (order, 'ts');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'size');
        const filled = this.safeFloat (order, 'filled');
        const remaining = this.sum (amount, -filled);
        const cost = filled * price;
        return {
            'id': order.id,
            'datetime': this.iso8601 (_timestamp),
            'timestamp': _timestamp,
            'lastTradeTimestamp': undefined,
            'status': this.options['order-status'][order.status],
            'symbol': symbol,
            'type': this.translateOrderType (this.safeString (order, 'type')),
            'side': this.translateOrderSide (this.safeString (order, 'side')),
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    castMyTrade (trade, symbol) {
        const _timestamp = this.safeInteger (trade, 'ts');
        const _order = this.safeValue (trade, 'order');
        let _type = undefined;
        if (_order) {
            _type = this.translateOrderType (this.safeString (_order, 'type'));
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'timestamp': _timestamp,
            'datetime': this.iso8601 (_timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'orderId'),
            'type': _type,
            'side': this.translateOrderSide (this.safeString (trade, 'side')),
            'price': this.safeFloat (trade, 'price'),
            'amount': this.safeFloat (trade, 'size'),
        };
    }

    castDepositAddress (address, currency) {
        return {
            'currency': currency,
            'address': this.safeString (address, 'address'),
            'tag': undefined,
            'info': address,
        };
    }

    castTransaction (transaction, params) {
        const _type = this.translateTransactionType (this.safeString (transaction, 'type'));
        const _timestamp = this.safeInteger (transaction, 'ts');
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'foreignTxId'),
            'timestamp': _timestamp,
            'datetime': this.iso8601 (_timestamp),
            'addressFrom': undefined,
            'address': this.safeString (transaction, 'address'),
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': _type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': this.safeString (transaction, 'currency'),
            'status': this.options[_type + '-status'][this.safeString (transaction, 'status')],
            'updated': undefined,
            'comment': this.safeString (transaction, 'node'),
            'fee': {
                'currency': this.safeString (transaction, 'currency'),
                'cost': this.safeFloat (transaction, 'fee'),
                'rate': undefined,
            },
        };
    }

    translateSymbol (base, quote) {
        return base.toUpperCase () + '/' + quote.toUpperCase ();
    }

    translateBaseFEXSymbol (symbol) {
        const semi = symbol.replace ('/', '');
        return semi.toUpperCase ();
    }

    translateOrderSide (side) {
        return side.toLowerCase ();
    }

    translateBaseFEXOrderSide (side) {
        return side.toUpperCase ();
    }

    translateOrderType (type) {
        return type.toLowerCase ();
    }

    translateBaseFEXOrderType (type) {
        return type.toUpperCase ();
    }

    translateTransactionType (type) {
        if (type === 'WITHDRAW') {
            return 'withdrawal';
        } else if (type === 'DEPOSIT') {
            return 'deposit';
        }
    }

    translateBaseFEXTransactionType (type) {
        if (type === 'withdrawal') {
            return 'WITHDRAW';
        } else if (type === 'deposit') {
            return 'DEPOSIT';
        }
    }

    fnMap (_array, _callback, params = {}) {
        const result = [];
        for (let i = 0; i < _array.length; i++) {
            result.push (this[_callback] (_array[i], params));
        }
        return result;
    }

    fnFilter (_array, _predicate, params = {}) {
        const result = [];
        for (let i = 0; i < _array.length; i++) {
            if (this[_predicate] (_array[i], params)) {
                result.push (_array[i]);
            }
        }
        return result;
    }

    fnReverse (_array) {
        const _last = _array.length - 1;
        const result = [];
        for (let i = 0; i < _array.length; i++) {
            result.push (_array[_last - i]);
        }
        return result;
    }

    fnEntites (_object) {
        const _keys = Object.keys (_object);
        return this.fnMap (_keys, 'fn_entity', _object);
    }

    fnEntity (_key, _object) {
        return [_key, _object[_key]];
    }

    fnPick (_object, _key) {
        return _object[_key];
    }

    fnEqual (a, b) {
        return a === b;
    }

    loIsOpenOrder (order, params) {
        return this.options['order-status'][this.safeString (order, 'status')] === 'open';
    }

    loCurrencyEqual (_object, currency) {
        return this.safeString (_object, 'currency') === currency;
    }
};
