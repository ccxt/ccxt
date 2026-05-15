'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { DECIMAL_PLACES } = require ('./base/functions/number');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound, ArgumentsRequired, AuthenticationError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitclude extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitclude',
            'name': 'Bitclude',
            'countries': ['PL'],
            'rateLimit': 2000,
            'certified': false,
            'pro': false,
            'urls': {
                'api': {
                    'public': 'https://api.bitclude.com/',
                    'private': 'https://api.bitclude.com/',
                },
                'www': 'https://bitclude.com',
                'doc': 'https://docs.bitclude.com',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'uid': true,
            },
            'has': {
                'fetchMarkets': 'emulated',
                'fetchCurrencies': true, // private
                'cancelAllOrders': false,
                'fetchClosedOrders': false,
                'createDepositAddress': true,
                'fetchDepositAddress': 'emulated',
                'fetchDeposits': true,
                'fetchFundingFees': 'emulated',
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTickers': true,
                'fetchTicker': 'emulated',
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'withdraw': false,
            },
            'api': {
                'public': {
                    'get': [
                        'stats/ticker.json',
                        'stats/orderbook_{base}{quote}.json',
                        'stats/history_{base}{quote}.json',
                    ],
                },
                'private': {
                    'get': [
                        '',
                    ],
                },
            },
            'exceptions': {
                // stolen, todo rewrite
                'exact': {
                    'Not enough balances': InsufficientFunds, // {"error":"Not enough balances","success":false}
                    'InvalidPrice': InvalidOrder, // {"error":"Invalid price","success":false}
                    'Size too small': InvalidOrder, // {"error":"Size too small","success":false}
                    'Missing parameter price': InvalidOrder, // {"error":"Missing parameter price","success":false}
                    'Order not found': OrderNotFound, // {"error":"Order not found","success":false}
                },
                'broad': {
                    'Invalid parameter': BadRequest, // {"error":"Invalid parameter start_time","success":false}
                    'The requested URL was not found on the server': BadRequest,
                    'No such coin': BadRequest,
                    'No such market': BadRequest,
                    'An unexpected error occurred': ExchangeError, // {"error":"An unexpected error occurred, please try again later (58BC21C795).","success":false}
                },
            },
            'precisionMode': DECIMAL_PLACES,
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetStatsTickerJson (params);
        const result = [];
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = (base + '/' + quote);
            const precision = {
                'price': undefined,
                'amount': undefined,
            };
            const info = {};
            info[id] = this.safeValue (response, id);
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': undefined,
                'info': info,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        if (!this.apiKey || !this.uid) {
            throw new AuthenticationError (this.id + " fetchCurrencies is an authenticated endpoint, therefore it requires 'apiKey' and 'uid' credentials. If you don't need currency details, set exchange.has['fetchCurrencies'] = false before calling its methods.");
        }
        const request = {
            'method': 'account',
            'action': 'getwalletsstatus',
        };
        const response = await this.privateGet (this.extend (request, params));
        const ids = Object.keys (response);
        const result = {};
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id === 'success') {
                continue;
            }
            const currency = response[id];
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': undefined,
                'active': this.safeValue (currency, 'is_online'),
                'fee': this.safeFloat (currency, 'current_optimal_fee'),
                'precision': this.safeInteger (currency, 'decimal_point'),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'current_minimal_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = (symbols === undefined) ? this.symbols : symbols;
        const tickers = await this.publicGetStatsTickerJson (params);
        const marketIds = Object.keys (this.marketsById);
        const result = {};
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.marketsById[marketId];
            const symbol = market['symbol'];
            const ticker = this.safeValue (tickers, marketId);
            if (this.inArray (symbol, symbols)) {
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        const ticker = await this.fetchTickers ([symbol]);
        return this.safeValue (ticker, symbol);
    }

    parseTicker (ticker, market) {
        const timestamp = this.milliseconds ();
        const symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'max24H'),
            'low': this.safeFloat (ticker, 'min24H'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'last'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ baseId, quoteId ] = market['id'].split ('_');
        const request = {
            'base': baseId,
            'quote': quoteId,
        };
        const response = await this.publicGetStatsOrderbookBaseQuoteJson (this.extend (request, params));
        const data = this.safeValue (response, 'data');
        const timestamp = this.safeTimestamp (data, 'timestamp');
        const parsedOrderBook = this.parseOrderBook (response, timestamp, 'bids', 'asks', 1, 0);
        if (limit !== undefined) {
            parsedOrderBook['bids'] = this.filterBySinceLimit (parsedOrderBook['bids'], undefined, limit);
            parsedOrderBook['asks'] = this.filterBySinceLimit (parsedOrderBook['asks'], undefined, limit);
        }
        return parsedOrderBook;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'base': market['baseId'],
            'quote': market['quoteId'],
        };
        const response = await this.publicGetStatsHistoryBaseQuoteJson (this.extend (request, params));
        const trades = this.safeValue (response, 'history');
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'method': 'account',
            'action': 'history',
        };
        const response = await this.privateGet (this.extend (request, params));
        const trades = this.safeValue (response, 'history', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //  fetchTrades
        //
        //    {
        //         "time":1531917229,
        //         "nr":"786",
        //         "amount":"0.00018620",
        //         "price":"7314.57",
        //         "type":"a"
        //    }
        //
        //  fetchMyTrades
        //
        //    {
        //         "currency1": "btc",
        //         "currency2": "usd",
        //         "amount": "0.00100000",
        //         "time_close": 1516212758,
        //         "price": "4.00",
        //         "fee_taker": "50", // Idk what does it exactly means
        //         "fee_maker": "0",
        //         "type": "bid",
        //         "action": "open"
        //    }
        const id = this.safeString (trade, 'nr');
        let timestamp = this.safeInteger2 (trade, 'time', 'time_close');
        if ('time' in trade) {
            // API return timestamp in different formats depending on endpoint. Of course this isn't specified in docs xD
            timestamp = timestamp * 1000;
        }
        const type = undefined;
        const baseId = this.safeString (trade, 'currency1');
        const quoteId = this.safeString (trade, 'currency2');
        let symbol = undefined;
        let quote = undefined;
        if (baseId !== undefined && quoteId !== undefined) {
            const base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = (base + '/' + quote);
        } else {
            symbol = market['symbol'];
            quote = market['quote'];
        }
        let side = this.safeString (trade, 'type');
        if (side === 'a' || side === 'ask') {
            side = 'sell';
        } else if (side === 'b' || side === 'bid') {
            side = 'buy';
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
                if (this.currency (quote)['precision'] !== undefined) {
                    cost = this.currencyToPrecision (quote, cost);
                }
            }
        }
        const fee = undefined; // todo
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'order': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'method': 'account',
            'action': 'info',
        };
        const response = await this.privateGet (this.extend (request, params));
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'balances', []);
        const currencies = Object.keys (balances);
        for (let i = 0; i < currencies.length; i++) {
            const balance = this.safeValue (balances, currencies[i]);
            const currencyCode = this.safeCurrencyCode (currencies[i]);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'active');
            account['used'] = this.safeFloat (balance, 'inactive');
            result[currencyCode] = account;
        }
        return this.parseBalance (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let orderId = undefined;
        let response = undefined;
        let feeCost = undefined;
        let feeCurrency = undefined;
        if (type === 'limit') {
            const request = {
                'method': 'transactions',
                'action': side,
                'market1': market['baseId'],
                'market2': market['quoteId'],
                'amount': this.currencyToPrecision (market['base'], amount),
                'rate': this.currencyToPrecision (market['quote'], price),
            };
            response = await this.privateGet (this.extend (request, params));
            const order = this.safeValue (response, 'actions');
            orderId = this.safeString (order, 'order');
        } else if (type === 'market') {
            const request = {
                'method': 'account',
                'action': 'convert',
            };
            request['market1'] = (side === 'sell') ? market['baseId'] : market['quoteId'];
            request['market2'] = (side === 'sell') ? market['quoteId'] : market['baseId'];
            const currencyOfAmount = (side === 'sell') ? market['base'] : market['quote'];
            request['amount'] = this.currencyToPrecision (currencyOfAmount, amount);
            response = await this.privateGet (this.extend (request, params));
            feeCurrency = (side === 'sell') ? market['quote'] : market['base'];
            feeCost = this.safeString (response, 'fee');
        }
        const timestamp = this.milliseconds ();
        return {
            'id': orderId,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': 'open',
            'symbol': market['symbol'],
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'fee': {
                'currency': feeCurrency,
                'cost': feeCost,
                'rate': undefined,
            },
            'trades': undefined,
            'info': response,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'method': 'account',
            'action': 'activeoffers',
        };
        const response = await this.privateGet (this.extend (request, params));
        const result = this.safeValue (response, 'offers', []);
        let orders = this.parseOrders (result, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    parseOrder (order, market = undefined) {
        // due to very diverse structure of orders this method only work for these returned by fetchOpenOrders
        const status = 'open';
        let side = this.safeString (order, 'offertype');
        if (side === 'ask') {
            side = 'sell';
        } else if (side === 'bid') {
            side = 'buy';
        }
        let symbol = undefined;
        if (market === undefined) {
            const baseId = this.safeString (order, 'currency1');
            const quoteId = this.safeString (order, 'currency2');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            symbol = (base + '/' + quote);
        } else {
            symbol = market['symbol'];
        }
        const timestamp = this.safeInteger (order, 'time_open');
        return {
            'info': order,
            'id': this.safeString (order, 'nr'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'amount': this.safeFloat (order, 'amount'),
            'remaining': undefined,
            'filled': undefined,
            'status': status,
            'fee': undefined,
            'cost': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const side_in_params = ('side' in params);
        if (!side_in_params) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a `side` parameter (sell or buy)');
        }
        const side = (params['side'] === 'buy') ? 'bid' : 'ask'; // Typo could cause cancel wrong order. todo: handle typo
        params = this.omit (params, [ 'side', 'currency' ]);
        const request = {
            'method': 'transactions',
            'action': 'cancel',
            'order': parseInt (id),
            'typ': side,
        };
        return await this.privateGet (this.extend (request, params));
    }

    cancelUnifiedOrder (order, params = {}) {
        // https://github.com/ccxt/ccxt/issues/6838
        const request = {
            'side': order['side'],
        };
        return this.cancelOrder (order['id'], undefined, this.extend (request, params));
    }

    async createDepositAddress (code, params = {}) {
        // not yet documented exchange api method
        await this.loadMarkets ();
        const currencyId = this.currencyId (code);
        const request = {
            'method': 'account',
            'action': 'newaddress',
            'currency': currencyId,
        };
        const response = await this.privateGet (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currencyId = this.currencyId (code);
        currencyId = currencyId.toUpperCase ();
        const request = {
            'method': 'account',
            'action': 'info',
        };
        const response = await this.privateGet (this.extend (request, params));
        const deposits = this.safeValue (response, 'deposit');
        const deposit = this.safeValue (deposits, currencyId);
        const address = this.safeString (deposit, 'deposit');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'info': response,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const currencyId = currency['id'];
        const request = {
            'method': 'account',
            'action': 'deposits',
            'currency': currencyId,
        };
        const response = await this.privateGet (this.extend (request, params));
        const transactions = this.safeValue (response, 'history', []);
        return this.parseTransactions (transactions, currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDeposits requires a currency code argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const currencyId = currency['id'];
        const request = {
            'method': 'account',
            'action': 'withdrawals',
            'currency': currencyId,
        };
        const response = await this.privateGet (this.extend (request, params));
        const transactions = this.safeValue (response, 'history', []);
        return this.parseTransactions (transactions, currency);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     {
        //       "time": "1530883428",
        //       "amount": "0.13750000",
        //       "type": "b787400027b4eae298bad72150384540a23342daaa3eec1c8d17459c103c6bbc",
        //       "state": "1"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "time": "1528715035",
        //         "amount": "1.00000000",
        //         "tx": "01b8ae6437843879574b69daf95542aff43a4aefaa90e8f70ebf572eccf01cad",
        //         "address": "2N8hwP1WmJrFF5QWABn38y63uYLhnJYJYTF",
        //         "state": "0"
        //     },
        //
        const timestamp = this.safeInteger (transaction, 'time');
        const currencyCode = this.safeString (currency, 'code');
        const amount = this.safeFloat (transaction, 'amount');
        const address = this.safeString (transaction, 'address');
        const status = this.safeString (transaction, 'state'); // todo: ask support
        const txid = this.safeString2 (transaction, 'type', 'tx');
        return {
            'info': transaction,
            'id': undefined,
            'currency': currencyCode,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': undefined,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const request = {
            'method': 'account',
            'action': 'info',
        };
        const response = await this.privateGet (this.extend (request, params));
        const account = this.safeValue (response, 'account');
        const fees = this.safeValue (account, 'fee');
        return {
            'info': response,
            'maker': this.safeFloat (fees, 'maker'),
            'taker': this.safeFloat (fees, 'taker'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            params['id'] = this.uid;
            params['key'] = this.apiKey;
        }
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
