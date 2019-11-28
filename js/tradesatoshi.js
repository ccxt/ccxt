'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tradesatoshi extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tradesatoshi',
            'name': 'Tradesatoshi',
            'countries': [ 'UK' ],
            'rateLimit': 2000,
            'version': '*',
            'certified': false, // 2019-11-27
            'has': {
                'CORS': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOrderBook': true,
                'fetchCurrencies': true,
                'fetchBalance': true,
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchClosedOrders': false,
                'fetchOpenOrders': 'emulated',
                'fetchStatus': 'emulated',
                'withdraw': true,
                'fetchL2OrderBook': true,
                'fetchOHLCV': 'emulated',
                'privateAPI': true,
                'publicAPI': true,
            },
            'timeframes': {
                '5m': 300,
                '15m': 900,
                '30m': 1800,
                '2h': 7200,
                '4h': 14400,
                '1d': 86400,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/44006686-f96c02ce-9e90-11e8-871c-c67d21e9d165.jpg',
                'api': {
                    'public': 'https://www.tradesatoshi.com/api/public',
                    'private': 'https://www.tradesatoshi.com/api/private',
                },
                'www': 'https://www.tradesatoshi.com',
                'doc': 'https://www.tradesatoshi.com/Home/Api',
                'fees': 'https://www.tradesatoshi.com/FeesStructure',
            },
            'api': {
                'public': {
                    'get': [
                        'getcurrencies',
                        'GetCurrency',
                        'getticker',
                        'GetMarketStatus',
                        'getmarkethistory',
                        'getmarketsummary',
                        'getmarketsummaries',
                        'getorderbook',
                    ],
                },
                'private': {
                    'post': [
                        'getbalance',
                        'getbalances',
                        'getorder',
                        'getorders',
                        'submitorder',
                        'submitmarketorder',
                        'cancelorder',
                        'gettradehistory',
                        'generateaddress',
                        'submitwithdraw',
                        'getdeposits',
                        'getwithdrawals',
                        'submittransfer',
                        'SubmitTip',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': undefined,
                    'percentage': undefined,
                    'taker': undefined,
                    'maker': undefined,
                },
                'funding': {
                    'tierBased': undefined,
                    'percentage': undefined,
                    'withdraw': {},
                    'deposit': {},
                },
            },
            'limits': {
                'amount': {
                    'min': 0.000001,
                    'max': 1000000000,
                },
                'price': {
                    'min': 0.00000001,
                    'max': 1000000000,
                },
                'cost': {
                    'min': 0.00000000,
                    'max': 1000000000,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'exceptions': {
                'Currency not found or is currently disabled or is currently withdraw disabled.': ExchangeError,
                'Insufficient funds for trade.': InsufficientFunds,
                'Insufficient funds.': InsufficientFunds,
                'Address generated failed. REASON: currency status Maintenance.': ExchangeError,
                'Failed to cancel order.': OrderNotFound,
            },
        });
    }

    async fetchStatus (params = {}) {
        this.loadMarkets ();
        const symbol = params['symbol'];
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + " fetchStatus requires an exchange-specific extra 'symbol' parameter (unified market name).");
        }
        const market = this.market (symbol);
        const marketId = market['id'];
        const request = {
            'market': marketId,
        };
        const response = await this.publicGetGetMarketStatus (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        return {
            'info': response,
            'status': this.safeValue (result, 'marketStatus'),
            'updated': undefined,
            'eta': undefined,
            'url': undefined,
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetmarketsummaries (params);
        // result:
        // [
        //     {
        //         market: 'STRAT_BTC',
        //         high: 0.00003847,
        //         low: 0.00003802,
        //         volume: 131.84680266,
        //         baseVolume: 0.00506166,
        //         last: 0.00003802,
        //         bid: 0.00003582,
        //         ask: 0.00004841,
        //         openBuyOrders: 103,
        //         openSellOrders: 85,
        //         marketStatus: 'OK',
        //         change: -0.81
        //     },
        //     ...
        //     {
        //         market: 'BOLI_DOGE',
        //         high: 0,
        //         low: 0,
        //         volume: 0,
        //         baseVolume: 0,
        //         last: 4.27159235,
        //         bid: 3.95190423,
        //         ask: 4.36028858,
        //         openBuyOrders: 161,
        //         openSellOrders: 81,
        //         marketStatus: 'OK',
        //         change: -0.2
        //     },
        // ]
        const markets = this.safeValue (response, 'result', []);
        const marketsNumber = markets.length;
        const result = [];
        for (let i = 0; i < marketsNumber; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'market');
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const limits = {
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            };
            const status = this.safeValue (market, 'marketStatus');
            const active = (status === 'OK');
            const precision = {
                'amount': 8,
                'price': 8,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'baseId': baseId,
                'quoteId': quoteId,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetGetmarketsummaries (params);
        const markets = this.safeValue (response, 'result');
        const marketsNumber = markets.length;
        const result = {};
        for (let i = 0; i < marketsNumber; i++) {
            const ticker = markets[i];
            const id = ticker['market'];
            let symbol = undefined;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId] = id.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        const tickers = this.filterTickers (result, symbols);
        return tickers;
    }

    filterTickers (tickers, symbols) {
        if (symbols === undefined) {
            return tickers;
        }
        if (!Array.isArray (symbols)) {
            return tickers;
        }
        if (!symbols.length) {
            return tickers;
        }
        const filteredTickers = {};
        for (let i = 0; i < symbols.length; i++) {
            filteredTickers[symbols[i]] = tickers[symbols[i]];
        }
        return filteredTickers;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const response = await this.publicGetGetmarketsummary ({ 'market': market['id'] });
        const ticker = this.safeValue (response, 'result', {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'market');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const timestamp = this.milliseconds ();
        const last = this.safeFloat (ticker, 'last');
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
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVolume'),
            'quoteVolume': this.safeFloat (ticker, 'volume'),
            'info': ticker,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        if (limit !== undefined) {
            if (limit > 20) {
                request['count'] = limit;
            }
        }
        const response = await this.publicGetGetorderbook (this.extend (request, params));
        const result = this.safeValue (response, 'result');
        const orderbook = this.parseOrderBook (result, this.milliseconds (), 'buy', 'sell', 'rate', 'quantity');
        return orderbook;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetGetcurrencies (params);
        const currencies = this.safeValue (response, 'result', []);
        const currenciesLength = currencies.length;
        const result = {};
        for (let i = 0; i < currenciesLength; i++) {
            const currency = currencies[i];
            const id = this.safeValue (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeValue (currency, 'currencyLong');
            const active = (this.safeValue (currency, 'status') === 'OK');
            const fee = this.safeValue (currency, 'txFee');
            const minAmount = this.safeFloat (currency, 'minBaseTrade');
            const precision = this.precisionFromString (this.numberToString (minAmount));
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': active,
                'fee': fee, // todo: redesign
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minAmount,
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
                        'min': fee,
                        'max': undefined,
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privatePostGetbalances (this.extend (request, params));
        const balances = this.safeValue (response, 'result');
        // [
        //     {
        //         currency: 'LCC',
        //         currencyLong: 'Litecoin Cash',
        //         available: 0,
        //         total: 0,
        //         heldForTrades: 0,
        //         unconfirmed: 0,
        //         pendingWithdraw: 0,
        //         address: null,
        //         paymentId: null
        //     },
        //     {
        //         currency: 'LDOGE',
        //         currencyLong: 'LiteDoge',
        //         available: 0,
        //         total: 0,
        //         heldForTrades: 0,
        //         unconfirmed: 0,
        //         pendingWithdraw: 0,
        //         address: null,
        //         paymentId: null
        //     },
        // ]
        const result = { 'info': response };
        const balancesLength = balances.length;
        for (let i = 0; i < balancesLength; i++) {
            const balance = balances[i];
            const currency = this.safeValue (balance, 'currency');
            const code = this.safeCurrencyCode (currency);
            const account = this.account ();
            const total = this.safeFloat (balance, 'total');
            const free = this.safeFloat (balance, 'available');
            const held = this.safeFloat (balance, 'heldForTrades');
            const pending = this.safeFloat (balance, 'pendingWithdraw');
            const unconfirmed = this.safeFloat (balance, 'unconfirmed');
            account['total'] = total;
            account['free'] = free;
            account['used'] = this.sum (held, pending, unconfirmed);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'Currency': currency['id'],
        };
        const response = await this.privatePostGenerateaddress (this.extend (request, params));
        // {
        //     "success": true,
        //     "message": null,
        //     "result": {
        //         "Currency": "LTC",
        //         "Address": "3KBUuGko4H5ke7EVsq9B7PLK1c5Askdd7y",
        //         "PaymentId": "8e93b95650b473c859693771864432dbd10a192629d4883aa0c89857b1cd67fd                   Note: only for CryptoNight coins like (XMR,TRTL,LOKI,DIT) etc."
        //     }
        // }
        const depositAddressInfo = this.safeValue (response, 'result');
        let address = undefined;
        let tag = undefined;
        if (this.safeValue (response, 'success') === true) {
            address = this.safeValue (depositAddressInfo, 'address');
            tag = this.safeValue (depositAddressInfo, 'tag');
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        return await this.createDepositAddress (code, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'Currency': 'all',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['Currency'] = currency['id'];
        }
        if (limit !== undefined) {
            if (limit > 20) {
                request['count'] = limit;
            }
        }
        const response = await this.privatePostGetdeposits (this.extend (params, request));
        const resultRaw = this.safeValue (response, 'result');
        const resultLength = resultRaw.length;
        for (let i = 0; i < resultLength; i++) {
            resultRaw[i]['Type'] = 'deposit';
        }
        const result = this.parseTransactions (resultRaw, currency, since, limit);
        return result; // return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'Currency': 'all',
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['Currency'] = currency['id'];
        }
        if (limit !== undefined) {
            if (limit > 20) {
                request['count'] = limit;
            }
        }
        const response = await this.privatePostGetwithdrawals (this.extend (params, request));
        const resultRaw = this.safeValue (response, 'result');
        const resultLength = resultRaw.length;
        for (let i = 0; i < resultLength; i++) {
            resultRaw[i]['Type'] = 'withdrawal';
        }
        const result = this.parseTransactions (resultRaw, currency, since, limit);
        return result;
        // return this.filterByCurrencySinceLimit (withdrawals, code, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        // withdrawal
        // {
        //     "success": true,
        //     "message": null,
        //     "result": [
        //         {
        //             "Id": "436436",
        //             "Currency": "BTC",
        //             "CurrencyLong": "Bitcoin",
        //             "Amount": 100,
        //             "Fee": 0.0004,
        //             "Address": "3KBUuGko4H5ke7EVsq9B7PLK1c5Askdd7y",
        //             "Status": "Unconfirmed",
        //             "Txid": null,
        //             "Confirmations": 0,
        //             "Timestamp": "2015-12-07T20:04:05.3947572",
        //             "IsApi": false
        //         },
        //         {
        //             "Id": "436437",
        //             "Currency": "BTC",
        //             "CurrencyLong": "Bitcoin",
        //             "Amount": 100,
        //             "Fee": 0.0004,
        //             "Address": "3KBUuGko4H5ke7EVsq9B7PLK1c5Askdd7y",
        //             "Status": "Complete",
        //             "Txid": "9281eacaad58335b884adc24be884c00200a4fc17b2e05c72e255976223de187",
        //             "Confirmations": 12,
        //             "Timestamp": "2015-12-07T20:04:05.3947572",
        //             "IsApi": false
        //         }
        //     ]
        // }
        // deposit
        // {
        //     "success": true,
        //     "message": null,
        //     "result": [
        //         {
        //             "Id": "436436",
        //             "Currency": "BTC",
        //             "CurrencyLong": "Bitcoin",
        //             "Amount": 100,
        //             "Status": "Unconfirmed",
        //             "Txid": "9281eacaad58335b884adc24be884c00200a4fc17b2e05c72e255976223de187",
        //             "Confirmations": 0,
        //             "Timestamp": "2015-12-07T20:04:05.3947572"
        //         },
        //         {
        //             "Id": "436437",
        //             "Currency": "BTC",
        //             "CurrencyLong": "Bitcoin",
        //             "Amount": 100,
        //             "Status": "Confirmed",
        //             "Txid": "6ddbaca454c97ba4e8a87a1cb49fa5ceace80b89eaced84b46a8f52c2b8c8ca3",
        //             "Confirmations": 12,
        //             "Timestamp": "2015-12-07T20:04:05.3947572"
        //         }
        //     ]
        // }
        const datetime = this.safeString (transaction, 'Timestamp');
        const currencyId = this.safeString (transaction, 'Currency');
        const code = this.safeCurrencyCode (currencyId);
        let status = this.safeString (transaction, 'Status', 'pending');
        status = this.parseTransactionStatus (status);
        const txid = this.safeString (transaction, 'Txid');
        const type = this.safeString (transaction, 'Type');
        const id = this.safeString (transaction, 'Id');
        const amount = this.safeFloat (transaction, 'Amount');
        const address = this.safeString (transaction, 'Address');
        const tag = this.safeString (transaction, 'Tag');
        const fee = this.safeFloat (transaction, 'Fee');
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': tag,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': this.parse8601 (datetime),
            'datetime': datetime,
            'fee': {
                'currency': code,
                'cost': fee,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'Confirmed': 'ok',
            'Complete': 'ok',
            'Unconfirmed': 'pending',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            if (limit > 20) {
                request['count'] = limit;
            }
        }
        const response = await this.publicGetGetmarkethistory (this.extend (request, params));
        const trades = this.safeValue (response, 'result');
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let pair = 'all';
        if (market !== undefined) {
            pair = market['id'];
        }
        const request = { 'Market': pair };
        if (limit !== undefined) {
            if (limit > 20) {
                request['count'] = limit;
            }
        }
        const response = await this.privatePostGettradehistory (this.extend (request, params));
        const trades = this.safeValue (response, 'result');
        let result = [];
        if (market !== undefined) {
            result = this.parseTrades (trades, market);
        } else {
            if (trades) {
                const tradesLength = trades.length;
                for (let i = 0; i < tradesLength; i++) {
                    const tradeRaw = trades[i];
                    const trade = this.parseTrade (tradeRaw);
                    result.push (trade);
                }
            }
        }
        return this.filterBySinceLimit (result, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // fetchTrades (symbol defined, specific market)
        //
        // {
        //     "success": true,
        //     "message": null,
        //     "result": [
        //         {
        //             "id": 502,
        //             "timeStamp": "2016-04-23T08:16:34.91",
        //             "quantity": 0.0065,
        //             "price": 0.079,
        //             "orderType": "Buy",
        //             "total": 0.0005135
        //         }
        //     ]
        // }
        //
        // fetchMyTrades (symbol undefined, all markets)
        // {
        //     "success": true,
        //     "message": null,
        //     "totalRecords": 75,
        //     "result": [
        //         {
        //             "Id": "18253",
        //             "Market": "LTC_BTC",
        //             "Type": "Buy",
        //             "Amount": 100,
        //             "Rate": 0.01,
        //             "Fee": 0.0002,
        //             "Total": 0.9998,
        //             "Timestamp": "2015-12-07T20:04:05.3947572",
        //             "IsApi": true
        //         }
        //     ]
        // }
        //
        const id = this.safeString2 (trade, 'id', 'Id');
        const orderId = undefined;
        const timestamp = this.parse8601 (this.safeString2 (trade, 'timeStamp', 'Timestamp'));
        let symbol = undefined;
        let base = undefined;
        let quote = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
            base = market['base'];
            quote = market['quote'];
        } else {
            const marketId = this.safeValue (trade, 'Market');
            const [ baseId, quoteId] = marketId.split ('_');
            base = this.safeCurrencyCode (baseId);
            quote = this.safeCurrencyCode (quoteId);
            symbol = base + '/' + quote;
        }
        let side = this.safeString2 (trade, 'orderType', 'Type');
        side = side.toLowerCase ();
        const fee = this.safeFloat (trade, 'Fee');
        const price = this.safeFloat2 (trade, 'price', 'Rate');
        const cost = this.safeFloat2 (trade, 'total', 'Total');
        const amount = this.safeFloat2 (trade, 'quantity', 'Amount');
        let feeCost = undefined;
        let currency = undefined;
        const rate = fee;
        if (fee !== undefined) {
            if (side === 'buy') {
                currency = base;
                feeCost = amount * rate;
            } else {
                currency = quote;
                if (cost !== undefined) {
                    feeCost = cost * rate;
                }
            }
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'rate': rate,
                'cost': feeCost,
                'currency': currency,
            },
            'info': trade,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit' && type !== 'market') {
            throw new ExchangeError (this.id + ' allows market and limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'Market': market['id'],
            'Type': type,
            'Price': this.priceToPrecision (symbol, price),
            'Amount': this.amountToPrecision (symbol, amount),
        };
        let response = undefined;
        if (type === 'limit') {
            response = await this.privatePostSubmitorder (this.extend (request, params));
        } else if (type === 'market') {
            response = await this.privatePostSubmitmarketorder (this.extend (request, params));
        }
        const orderRaw = this.safeValue (response, 'result');
        let order = this.parseOrder (this.extend ({
            'Status': 'open',
            'Type': type,
            'Side': side,
            'Price': price,
            'Amount': amount,
        }, orderRaw), market);
        order = this.extend ({ 'info': response }, order);
        const id = order['id'];
        if (id !== undefined) {
            this.orders[id] = order;
        }
        return order;
    }

    parseOrder (order, market = undefined) {
        // fetch
        // {
        //     "Id": "18253",
        //     "Market": "LTC_BTC",
        //     "Type": "Buy",
        //     "Amount": 100,
        //     "Rate": 0.01,
        //     "Remaining": 0.5,
        //     "Total": 1,
        //     "Status": "Partial",
        //     "Timestamp": "2015-12-07T20:04:05.3947572",
        //     "IsApi": true
        // },
        // create
        // {
        //     "success": true,
        //     "message": null,
        //     "result": {
        //         "OrderId": 343526,
        //         "Filled": [
        //             24124,
        //             41284,
        //             57548
        //         ]
        //     }
        // }
        let datetime = this.safeValue (order, 'Timestamp');
        // If order just created - then datetime in response is absent
        let timestamp = this.milliseconds ();
        if (datetime !== undefined) {
            timestamp = this.parse8601 (datetime);
        } else {
            datetime = this.iso8601 (timestamp);
        }
        const id = this.safeString2 (order, 'OrderId', 'Id');
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let type = this.safeString (order, 'Type'); // undefined for fetchOrder
        let side = this.safeString (order, 'Side');
        if (side === undefined) {
            side = type.toLowerCase ();
            type = undefined;
        }
        side = side.toLowerCase ();
        const price = this.safeFloat2 (order, 'Price', 'Rate');
        let remaining = this.safeFloat (order, 'Remaining');
        const amount = this.safeFloat (order, 'Amount');
        let trades = this.safeValue (order, 'Filled', []);
        let filled = undefined;
        const tradesLength = trades.length;
        if (tradesLength > 0) {
            filled = trades[tradesLength - 1];
        } else {
            filled = undefined;
            trades = undefined;
        }
        let cost = undefined;
        if (amount !== undefined) {
            if (remaining !== undefined) {
                filled = amount - remaining;
                if (price !== undefined) {
                    cost = filled * price;
                }
            } else if (filled !== undefined) {
                remaining = amount - filled; // maybe that line is not gonna return correct value, check needed
            }
        }
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': undefined,
            'info': order,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            'Open': 'open',
            'Partial': 'open',
            'Filled': 'closed',
            'Closed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // Parameters:
        // Type: The cancel type, options: 'Single','Market','MarketBuys','MarketSells','AllBuys','AllSells','All'(required)
        // OrderId: The order to cancel(required if cancel type 'Single')
        // Market: The order to cancel(required if cancel type 'Market','MarketBuys','MarketSells')
        let request = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request = {
                'Market': market['id'],
                'Type': 'Market',
            };
        } else {
            request = {
                'Type': 'All',
            };
        }
        const response = await this.privatePostCancelorder (this.extend (request, params));
        // {
        //     "success": true,
        //     "message": null,
        //     "result": {
        //         "CanceledOrders": [
        //             233544,
        //             233545,
        //             233546
        //         ]
        //     }
        // }
        const result = this.safeValue (response, 'result');
        const orderIds = this.safeValue (result, 'CanceledOrders', []);
        for (let i = 0; i < orderIds.length; i++) {
            const id = orderIds[i].toString ();
            if (id in this.orders) {
                this.orders[id]['status'] = 'canceled';
            }
        }
        return response;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        // Parameters:
        // Type: The cancel type, options: 'Single','Market','MarketBuys','MarketSells','AllBuys','AllSells','All'(required)
        // OrderId: The order to cancel(required if cancel type 'Single')
        // Market: The order to cancel(required if cancel type 'Market','MarketBuys','MarketSells')
        await this.loadMarkets ();
        const request = {
            'Type': 'Single',
            'OrderId': id,
        };
        const response = await this.privatePostCancelorder (this.extend (request, params));
        if (this.safeValue (response, 'success') === true) {
            if (id in this.orders) {
                this.orders[id]['status'] = 'canceled';
            }
        }
        return response;
    }

    parseOpenOrders (orders, market, result) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const extended = this.extend (order, {
                'status': 'open',
                'type': 'limit',
                'side': order['type'],
                'price': order['rate'],
            });
            result.push (this.parseOrder (extended, market));
        }
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // {
        //     "success": true,
        //     "message": null,
        //     "result": [
        //         {
        //             "Id": "18253",
        //             "Market": "LTC_BTC",
        //             "Type": "Buy",
        //             "Amount": 100,
        //             "Rate": 0.01,
        //             "Remaining": 0.5,
        //             "Total": 1,
        //             "Status": "Partial",
        //             "Timestamp": "2015-12-07T20:04:05.3947572",
        //             "IsApi": true
        //         },
        //     ]
        // }
        let market = undefined;
        const request = {
            'Market': 'all',
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['Market'] = market['id'];
        }
        if (limit !== undefined) {
            if (limit > 20) {
                request['count'] = limit;
            }
        }
        const response = await this.privatePostGetorders (this.extend (request, params));
        const ordersRaw = this.safeValue (response, 'result', []);
        let orders = [];
        if (market !== undefined) {
            orders = this.parseOrders (ordersRaw, market, since, limit, params);
        } else {
            const ordersLength = ordersRaw.length;
            for (let i = 0; i < ordersLength; i++) {
                const orderRaw = ordersRaw[i];
                const marketId = this.safeValue (orderRaw, 'Market');
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                    symbol = market['symbol'];
                } else {
                    const [ baseId, quoteId] = marketId.split ('_');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                    market = { 'symbol': symbol };
                }
                const order = this.parseOrder (orderRaw, market);
                orders.push (order);
            }
        }
        // For perfection there must be a peace of code that adds and
        // removes orders to/from cached orders
        return this.filterBySinceLimit (orders, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'OrderId': id,
        };
        const response = await this.privatePostGetorder (this.extend (request, params));
        const result = response['result'];
        let order = {};
        if (result) {
            const marketId = this.safeValue (result, 'Market');
            let market = undefined;
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
                market = { 'symbol': symbol };
            }
            order = this.parseOrder (result, market);
        }
        return this.extend ({ 'info': response }, order);
    }

    filterOrdersByStatus (orders, status) {
        const result = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i]['status'] === status) {
                result.push (orders[i]);
            }
        }
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterOrdersByStatus (orders, 'open');
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'Currency': currency['id'],
            'Address': address,
            'Amount': amount,
        };
        if (tag) {
            request['PaymentId'] = tag;
        }
        const response = await this.privatePostSubmitwithdraw (this.extend (request, params));
        // {
        //     "success": true,
        //     "message": null,
        //     "result": {
        //         "WithdrawalId": 546474
        //     }
        // }
        const result = this.safeValue (response, 'result');
        return {
            'info': response,
            'id': this.safeString (result, 'WithdrawalId'),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        const query = this.urlencode (params);
        if (api === 'public') {
            if (query) {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.json (params);
            headers = {};
            const postBody = this.binaryToBase64 (this.stringToBinary (body));
            const signature = this.apiKey + 'POST' + this.encodeURIComponent (url).toLowerCase () + nonce + postBody;
            const hmacSign = this.hmac (signature, this.base64ToBinary (this.secret), 'sha512', 'base64');
            const header = 'Basic ' + this.apiKey + ':' + hmacSign + ':' + nonce;
            headers['Authorization'] = header;
            headers['Content-Type'] = 'application/json; charset=utf-8';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const success = this.safeValue (response, 'success');
        if (!success) {
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + this.json (response);
            const exceptions = this.exceptions;
            if (message in exceptions) {
                throw new exceptions[message] (feedback);
            }
            throw new ExchangeError (feedback);
        }
    }
};
