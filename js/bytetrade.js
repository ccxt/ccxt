'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, AuthenticationError, DDoSProtection } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bytetrade extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bytetrade',
            'name': 'bytetrade',
            'countries': ['HK'],
            'rateLimit': 500,
            // new metainfo interface
            'has': {
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': 'emulated',
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '5d': '5d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'test': 'https://api-v2-test.bytetrade.com',
                'logo': 'https://user-images.githubusercontent.com/246404/60647143-9c28f880-9e6f-11e9-8b94-fbdd0d3f2c5d.png',
                'api': {
                    'market': 'https://api-v2.bytetrade.com',
                    'public': 'https://api-v2.bytetrade.com',
                },
                'www': 'https://www.bytetrade.com',
                'referral': '',
                'doc': 'https://github.com/Bytetrade/bytetrade-official-api-docs/wiki',
                'fees': '0.0008',
            },
            'api': {
                'market': {
                    'get': [
                        'klines',        // Kline of a symbol
                        'depth',         // Market Depth of a symbol
                        'trades',        // Trade records of a symbol
                        'tickers',
                    ],
                },
                'public': {
                    'get': [
                        'symbols',        // Reference information of trading instrument, including base currency, quote precision, etc.
                        'currencies',     // The list of currencies available
                        'balance',        // Get the balance of an account
                        'orders/open',    // Get the open orders of an account
                        'orders/closed',  // Get the closed orders of an account
                        'orders',         // Get the details of an order of an account
                        'orders/trades',  // Get detail match results
                        'depositaddress', // Get deposit address
                        'withdrawals',    // Get withdrawals info
                        'deposits',       // Get deposit info
                        'transfers',      // Get transfer info
                        'transaction',    // Post create order\cancel order\withdraw\transfer transaction to blockchain
                    ],
                    'post': [
                    ],
                },
                'private': {
                    'get': [
                    ],
                    'post': [
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.0008,
                    'maker': 0.0008,
                },
            },
            'commonCurrencies': {
                'CMT@18': 'CMT@18',
            },
            // exchange-specific options
            'options': {
            },
            'exceptions': {
                'vertify error': AuthenticationError,           // private key signature is incorrect
                'transaction already in network': BadRequest,   // same transaction submited
                'invalid argument': ArgumentsRequired,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const currencies = await this.publicGetCurrencies (params);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'code');
            const name = this.safeValue (currency, 'name');
            const nameId = name + '@' + id;
            if (!(nameId in this.commonCurrencies)) {
                this.commonCurrencies[nameId] = name;
            }
            const code = this.commonCurrencyCode (nameId);
            const active = currency['active'];
            // const name = this.safeString (currency, 'display-name');
            const limits = this.safeValue (currency, 'limits');
            const deposit = this.safeValue (limits, 'deposit');
            let maxDeposit = this.safeFloat (deposit, 'max');
            if (maxDeposit === -1) {
                maxDeposit = undefined;
            }
            const withdraw = this.safeValue (limits, 'withdraw');
            let maxWithdraw = this.safeFloat (withdraw, 'max');
            if (maxWithdraw === -1) {
                maxWithdraw = undefined;
            }
            result[code] = {
                'id': id,
                'code': code,
                'type': 'crypto',
                'name': name,
                'active': active,
                'fee': undefined,
                'basePrecision': this.safeValue (currency, 'basePrecision'),
                'transferPrecision': this.safeValue (currency, 'transferPrecision'),
                'limits': {
                    'deposit': {
                        'min': this.safeFloat (deposit, 'min'),
                        'max': maxDeposit,
                    },
                    'withdraw': {
                        'min': this.safeFloat (withdraw, 'min'),
                        'max': maxWithdraw,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetSymbols (params);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'base');
            const baseName = this.safeString (market, 'baseName');
            const baseNameAndId = baseName + '@' + baseId;
            const quoteId = this.safeString (market, 'quote');
            const quoteName = this.safeString (market, 'quoteName');
            const quoteNameAndId = quoteName + '@' + quoteId;
            let base = '';
            let quote = '';
            if (baseNameAndId in this.commonCurrencies) {
                base = this.commonCurrencies[baseNameAndId];
            } else {
                base = baseName;
            }
            if (quoteNameAndId in this.commonCurrencies) {
                quote = this.commonCurrencies[quoteNameAndId];
            } else {
                quote = quoteName;
            }
            const symbol = base + '/' + quote;
            const amountMin = this.safeFloat (market['limits']['amount'], 'min');
            const amountMax = this.safeFloat (market['limits']['amount'], 'max');
            const priceMin = this.safeFloat (market['limits']['price'], 'min');
            const priceMax = this.safeFloat (market['limits']['price'], 'max');
            const precision = {
                'amount': market['precision']['amount'],
                'price': market['precision']['price'],
            };
            const status = this.safeString (market, 'active');
            const active = (status === true);
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': amountMin,
                        'max': amountMax,
                    },
                    'price': {
                        'min': priceMin,
                        'max': priceMax,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result.push (entry);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        const balances = await this.publicGetBalance (request);
        const result = { 'info': balances };
        // const balances = this.safeValue (response, 'list', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'code');
            let code = currencyId;
            if (currencyId in this.currencies_by_id) {
                code = this.currencies_by_id[currencyId]['code'];
            } else {
                code = this.commonCurrencyCode (currencyId);
            }
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'free');
            account['used'] = this.safeFloat (balance, 'used');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default = maximum = 100
        }
        const response = await this.marketGetDepth (this.extend (request, params));
        const timestamp = this.safeValue (response, 'timestamp');
        const orderbook = this.parseOrderBook (response, timestamp);
        return orderbook;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const symbol = this.findSymbol (this.safeString (ticker, 'symbol'), market);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'weightedAvgPrice'),
            'open': this.safeFloat (ticker, 'open'),
            'close': this.safeFloat (ticker, 'close'),
            'last': this.safeFloat (ticker, 'last'),
            'previousClose': undefined, // previous day close
            'change': this.safeFloat (ticker, 'change'),
            'percentage': this.safeFloat (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.marketGetTickers (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTickers (rawTickers, symbols = undefined) {
        const tickers = [];
        for (let i = 0; i < rawTickers.length; i++) {
            tickers.push (this.parseTicker (rawTickers[i]));
        }
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    async fetchBidsAsks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const rawTickers = await this.marketGetDepth (params);
        return this.parseTickers (rawTickers, symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const rawTickers = await this.marketGetTickers (params);
        return this.parseTickers (rawTickers, symbols);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            parseFloat (ohlcv[1]),
            parseFloat (ohlcv[2]),
            parseFloat (ohlcv[3]),
            parseFloat (ohlcv[4]),
            parseFloat (ohlcv[5]),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.marketGetKlines (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'timestamp');
        const price = this.safeFloat2 (trade, 'price', 'price');
        const amount = this.safeFloat2 (trade, 'amount', 'amount');
        const cost = this.safeFloat2 (trade, 'cost', 'cost');
        const id = this.safeString2 (trade, 'id', 'id');
        const side = this.safeString2 (trade, 'side', 'side');
        const datetime = this.safeString2 (trade, 'datetime', 'datetime');
        // const orderId = this.safeString (trade, 'orderId');
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'symbol');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
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
            'symbol': market['id'],
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default = 100, maximum = 500
        }
        const response = await this.marketGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const status = this.safeString (order, 'status');
        const symbol = this.findSymbol (this.safeString (order, 'symbol'), market);
        const timestamp = this.safeInteger (order, 'timestamp');
        const datetime = this.safeString (order, 'datetime');
        const lastTradeTimestamp = this.safeInteger (order, 'lastTradeTimestamp');
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'amount');
        const filled = this.safeFloat (order, 'filled');
        const remaining = this.safeFloat (order, 'remaining');
        const cost = this.safeFloat (order, 'cost');
        const average = this.safeFloat (order, 'average');
        const id = this.safeString (order, 'id');
        const type = this.safeString (order, 'type');
        const side = this.safeString (order, 'side');
        const fee = this.safeValue (order, 'fee');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the next 5 lines are added to support for testing orders
        let sideNum = undefined;
        let typeNum = undefined;
        if (side === 'sell') {
            sideNum = 1;
        } else {
            sideNum = 2;
        }
        if (type === 'limit') {
            typeNum = 1;
        } else {
            typeNum = 2;
        }
        const baseRealName = market['base'].split ('@')[0];
        const quoteRealName = market['quote'].split ('@')[0];
        const marketName = baseRealName + '/' + quoteRealName;
        const baseId = market['baseId'];
        const baseCurrency = this.currencies_by_id[baseId];
        const amountFloat = parseFloat (amount);
        const amountChain = amountFloat * Math.pow (10, baseCurrency['basePrecision']);
        const quoteId = market['quoteId'];
        const quoteCurrency = this.currencies_by_id[quoteId];
        const priceFloat = parseFloat (price);
        const priceChain = priceFloat * Math.pow (10, quoteCurrency['basePrecision']);
        const nowMs = Date.now () / 1000;
        const now = Math.ceil (nowMs);
        const expiration = now + 10;
        const ob = {
            'fee': '300000000000000',
            'creator': this.apiKey,
            'side': sideNum,
            'order_type': typeNum,
            'market_name': marketName,
            'amount': amountChain.toString (),
            'price': priceChain.toString (),
            'now': now,
            'expiration': expiration,
            'use_btt_as_fee': false,
            'freeze_btt_fee': 0,
            'custom_no_btt_fee_rate': 8,
            'money_id': parseInt (quoteId),
            'stock_id': parseInt (baseId),
        };
        const obj = JSON.stringify (ob);
        const request = {
            'trObj': obj,
        };
        // tr.add_type_operation("order_create", ob);
        // tr.timestamp = Math.ceil(Date.now() / 1000);
        // tr.dapp="harvey1322";
        // tr.validate_type = 0;
        // tr.add_signer(bytetrade_js.PrivateKey.fromHex(test_privatekey));
        // tr.finalize2();
        // if (!tr.signed) { tr.sign(); }
        // var trObj = tr.toObject();
        // console.log("id " + tr.id());
        // console.log(JSON.stringify(trObj));
        const response = await this.publicGetTransaction (request);
        const timestamp = this.milliseconds ();
        const statusCode = this.safe_string (response, 'code');
        let status = '';
        if (statusCode === '0') {
            status = 'submit success';
        } else {
            status = 'submit fail';
        }
        return {
            'info': response,
            'id': '',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        if (symbol !== undefined) {
            market = this.markets[symbol];
            request['symbol'] = market['id'];
        }
        request['id'] = id;
        const response = await this.publicGetOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersOpen (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = { };
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetOrdersClosed (this.extend (request, params));
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const responseOpen = await this.publicGetOrdersOpen (this.extend (request, params));
        const responseClosed = await this.publicGetOrdersClosed (this.extend (request, params));
        const response = responseOpen + responseClosed;
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id, symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const baseRealName = market['base'].split ('@')[0];
        const quoteRealName = market['quote'].split ('@')[0];
        const marketName = baseRealName + '/' + quoteRealName;
        const baseId = market['baseId'];
        const quoteId = market['quoteId'];
        const ob = {
            'fee': '300000000000000',
            'creator': this.apiKey,
            'market_name': marketName,
            'money_id': parseInt (quoteId),
            'stock_id': parseInt (baseId),
        };
        const obj = JSON.stringify (ob);
        const request = {
            'trObj': obj,
        };
        const response = await this.publicGetTransaction (request);
        const timestamp = this.milliseconds ();
        const statusCode = this.safe_string (response, 'code');
        let status = '';
        if (statusCode === '0') {
            status = 'submit success';
        } else {
            status = 'submit fail';
        }
        return {
            'info': response,
            'id': '',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
        };
    }

    async transfer (to, code, amount, params = {}) {
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('transfer requires hasAlreadyAuthenticatedSuccessfully');
        }
        await this.loadMarkets ();
        const currency = this.currencies[code];
        const message = this.safe_string (params, 'message');
        const amountFloat = parseFloat (amount);
        const amountChain = amountFloat * Math.pow (10, currency['basePrecision']);
        const ob = {
            'fee': '300000000000000',
            'from': this.apiKey,
            'to': to,
            'asset_type': parseInt (currency['id']),
            'amount': amountChain.toString (),
            'message': message,
        };
        const obj = JSON.stringify (ob);
        const request = {
            'trObj': obj,
        };
        const response = await this.publicGetTransaction (request);
        const timestamp = this.milliseconds ();
        const statusCode = this.safe_string (response, 'code');
        let status = '';
        if (statusCode === '0') {
            status = 'submit success';
        } else {
            status = 'submit fail';
        }
        return {
            'info': response,
            'id': '',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': undefined,
            'type': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'fee': undefined,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDeposits requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        let currency = undefined;
        const request = { };
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetDeposits (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchWithdrawals requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        let currency = undefined;
        const request = {};
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransactionStatusByType (status) {
        if ((status === 'DEPOSIT_FAILED') || (status === 'FEE_SEND_FAILED') || (status === 'FEE_FAILED') || (status === 'PAY_SEND_FAILED') || (status === 'PAY_FAILED') || (status === 'BTT_FAILED') || (status === 'WITHDDRAW_FAILED') || (status === 'USER_FAILED')) {
            return 'failed';
        } else if ((status === 'FEE_EXECUED') || (status === 'PAY_EXECUED') || (status === 'WITHDDRAW_EXECUTED') || (status === 'USER_EXECUED')) {
            return 'pending';
        } else if (status === 'BTT_SUCCED') {
            return 'ok';
        } else {
            return status;
        }
    }

    parseTransaction (transaction, currency = undefined) {
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeString (transaction, 'tag');
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const txid = this.safeValue (transaction, 'txid');
        let code = undefined;
        const currencyId = this.safeString (transaction, 'code');
        if (currencyId in this.currencies_by_id) {
            currency = this.currencies_by_id[currencyId];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        }
        const timestamp = this.safeInteger (transaction, 'timestamp');
        const datetime = this.safeString (transaction, 'datetime');
        const type = this.safeString (transaction, 'type');
        const status = this.parseTransactionStatusByType (this.safeString (transaction, 'status'));
        const amount = this.safeFloat (transaction, 'amount');
        const feeInfo = this.safeValue (transaction, 'fee');
        const feeCost = this.safeFloat (feeInfo, 'cost');
        const feeCurrencyId = this.safeString (feeInfo, 'code');
        let feeCode = undefined;
        if (feeCurrencyId in this.currencies_by_id) {
            feeCode = this.currencies_by_id[feeCurrencyId]['code'];
        } else {
            feeCode = this.commonCurrencyCode (feeCurrencyId);
        }
        const fee = {
            'cost': feeCost,
            'currency': feeCode,
        };
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'address': address,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        if (!('userid' in params) && (this.apiKey === undefined)) {
            throw new ArgumentsRequired ('fetchDepositAddress requires hasAlreadyAuthenticatedSuccessfully or userid argument');
        }
        const currency = this.currency (code);
        const request = { };
        if ('userid' in params) {
            request['userid'] = params['userid'];
        } else {
            request['userid'] = this.apiKey;
        }
        request['currency'] = currency['id'];
        const response = await this.publicGetDepositAddress (request);
        const address = this.safeString (response, 'address');
        const tag = this.safeString (response, 'addressTag');
        const chainType = this.safeString (response, 'chainType');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': this.checkAddress (address),
            'tag': tag,
            'chainType': chainType,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        if (this.apiKey === undefined) {
            throw new ArgumentsRequired ('withdraw requires hasAlreadyAuthenticatedSuccessfully');
        }
        // when deposit, first deposit to user's pixiu address, and then auto transfer to bytetrade smart contract from pixiu addreess; when withdraw, first withdraw to user's pixiu address from bytetrade smart contract, and then transfer to user address;
        const addressResponse = await this.fetchDepositAddress (code);
        const middleAddress = this.safeString (addressResponse, 'address');
        const chainTypeString = this.safeString (addressResponse, 'chainType');
        let chainType = 0;
        if (chainTypeString === 'ethereum') {
            chainType = 1;
        } else if (chainTypeString === 'bitcoin') {
            chainType = 2;
        } else if (chainTypeString === 'cmt') {
            chainType = 3;
        } else if (chainTypeString === 'naka') {
            chainType = 4;
        }
        const currency = this.currency (code);
        const coinId = currency['id'];
        const Currency = this.currencies_by_id[coinId];
        const amountFloat = parseFloat (amount);
        const amountChain = amountFloat * Math.pow (10, Currency['basePrecision']);
        const ob = {
            'fee': '300000000000000',
            'from': this.apiKey,
            'to_external_address': middleAddress,
            'asset_type': parseInt (coinId),
            'amount': amountChain.toString (),
        };
        const obj = JSON.stringify (ob);
        const pixiuWithdrawRequest = {};
        pixiuWithdrawRequest['cmd'] = 'withdrawNotify';
        pixiuWithdrawRequest['chain_type'] = chainType;
        pixiuWithdrawRequest['toExternalAddress'] = address;
        pixiuWithdrawRequest['transaction'] = obj;
        pixiuWithdrawRequest['chainContractAddress'] = this.safeString (Currency['info'], 'chainType');
        const pixiuWithdrawRequestObj = JSON.stringify (pixiuWithdrawRequest);
        const response = await this.publicPostTransaction (pixiuWithdrawRequestObj);
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        url += '/' + path;
        if (api === 'wapi') {
            url += '.html';
        }
        const userDataStream = (path === 'userDataStream');
        if (path === 'historicalTrades') {
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
        } else if (userDataStream) {
            body = this.urlencode (params);
            headers = {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        if ((api === 'private') || (api === 'wapi' && path !== 'systemStatus')) {
            this.checkRequiredCredentials ();
            let query = this.urlencode (this.extend ({
                'timestamp': this.nonce (),
            }, params));
            const signature = this.hmac (this.encode (query), this.encode (this.secret));
            query += '&' + 'signature=' + signature;
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
            if ((method === 'GET') || (method === 'DELETE') || (api === 'wapi')) {
                url += '?' + query;
            } else {
                body = query;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        } else {
            if (!userDataStream) {
                if (Object.keys (params).length) {
                    url += '?' + this.urlencode (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if ((code === 503)) {
            throw new DDoSProtection (this.id + ' ' + code.toString () + ' ' + reason + ' ' + body);
        }
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('code' in response) {
            const status = this.safeString (response, 'code');
            if (status === '1') {
                const msg = this.safeString (response, 'msg');
                const feedback = this.id + ' ' + this.json (response);
                const exceptions = this.exceptions;
                if (msg in exceptions) {
                    throw new exceptions[msg] (feedback);
                }
                throw new ExchangeError (feedback);
            }
        }
    }
};
