'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, OnMaintenance, BadResponse, ArgumentsRequired, AuthenticationError, NotSupported, InvalidOrder, OrderNotFound, ExchangeNotAvailable, RateLimitExceeded, InsufficientFunds } = require ('./base/errors');
const { TRUNCATE, DECIMAL_PLACES } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class livecoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'livecoin',
            'name': 'LiveCoin',
            'countries': [ 'US', 'UK', 'RU' ],
            'rateLimit': 1000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'cancelOrder': true,
                'CORS': false,
                'createOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
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
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg',
                'api': 'https://api.livecoin.net',
                'www': 'https://www.livecoin.net',
                'doc': 'https://www.livecoin.net/api?lang=en',
                'referral': 'https://livecoin.net/?from=Livecoin-CQ1hfx44',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/all/order_book',
                        'exchange/last_trades',
                        'exchange/maxbid_minask',
                        'exchange/order_book',
                        'exchange/restrictions',
                        'exchange/ticker', // omit params to get all tickers at once
                        'info/coinInfo',
                    ],
                },
                'private': {
                    'get': [
                        'exchange/client_orders',
                        'exchange/order',
                        'exchange/trades',
                        'exchange/commission',
                        'exchange/commissionCommonInfo',
                        'payment/balances',
                        'payment/balance',
                        'payment/get/address',
                        'payment/history/size',
                        'payment/history/transactions',
                    ],
                    'post': [
                        'exchange/buylimit',
                        'exchange/buymarket',
                        'exchange/cancellimit',
                        'exchange/selllimit',
                        'exchange/sellmarket',
                        'payment/out/capitalist',
                        'payment/out/card',
                        'payment/out/coin',
                        'payment/out/okpay',
                        'payment/out/payeer',
                        'payment/out/perfectmoney',
                        'payment/voucher/amount',
                        'payment/voucher/make',
                        'payment/voucher/redeem',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.18 / 100,
                    'taker': 0.18 / 100,
                },
            },
            'commonCurrencies': {
                'BTCH': 'Bithash',
                'CPC': 'Capricoin',
                'CBC': 'CryptoBossCoin', // conflict with CBC (CashBet Coin)
                'CPT': 'Cryptos', // conflict with CPT = Contents Protocol https://github.com/ccxt/ccxt/issues/4920 and https://github.com/ccxt/ccxt/issues/6081
                'EDR': 'E-Dinar Coin', // conflicts with EDR for Endor Protocol and EDRCoin
                'eETT': 'EETT',
                'FirstBlood': '1ST',
                'FORTYTWO': '42',
                'LEO': 'LeoCoin',
                'MIOTA': 'IOTA', // https://github.com/ccxt/ccxt/issues/7487
                'ORE': 'Orectic',
                'PLN': 'Plutaneum', // conflict with Polish Zloty
                'RUR': 'RUB',
                'SCT': 'SpaceCoin',
                'TPI': 'ThaneCoin',
                'UNUS': 'LEO', // https://github.com/ccxt/ccxt/issues/7496
                'WAX': 'WAXP',
                'wETT': 'WETT',
                'XBT': 'Bricktox',
            },
            'exceptions': {
                'exact': {
                    '1': ExchangeError,
                    '10': AuthenticationError,
                    '100': ExchangeError, // invalid parameters
                    '101': AuthenticationError,
                    '102': AuthenticationError,
                    '103': InvalidOrder, // invalid currency
                    '104': InvalidOrder, // invalid amount
                    '105': InvalidOrder, // unable to block funds
                    '11': AuthenticationError,
                    '12': AuthenticationError,
                    '2': AuthenticationError, // "User not found"
                    '20': AuthenticationError,
                    '30': AuthenticationError,
                    '31': NotSupported,
                    '32': ExchangeError,
                    '429': RateLimitExceeded,
                    '503': ExchangeNotAvailable,
                },
                'broad': {
                    'insufficient funds': InsufficientFunds, // https://github.com/ccxt/ccxt/issues/5749
                    'NOT FOUND': OrderNotFound,
                    'Cannot find order': OrderNotFound,
                    'Minimal amount is': InvalidOrder,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetExchangeTicker (params);
        const restrictions = await this.publicGetExchangeRestrictions ();
        const restrictionsById = this.indexBy (restrictions['restrictions'], 'currencyPair');
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'symbol');
            const [ baseId, quoteId ] = id.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const coinRestrictions = this.safeValue (restrictionsById, symbol);
            const precision = {
                'price': 5,
                'amount': 8,
                'cost': 8,
            };
            const limits = {
                'amount': {
                    'min': Math.pow (10, -precision['amount']),
                    'max': Math.pow (10, precision['amount']),
                },
            };
            if (coinRestrictions) {
                precision['price'] = this.safeInteger (coinRestrictions, 'priceScale', 5);
                limits['amount']['min'] = this.safeFloat (coinRestrictions, 'minLimitQuantity', limits['amount']['min']);
            }
            limits['price'] = {
                'min': Math.pow (10, -precision['price']),
                'max': Math.pow (10, precision['price']),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetInfoCoinInfo (params);
        if (typeof response === 'string') {
            if (response.indexOf ('site is under maintenance') >= 0) {
                throw new OnMaintenance (this.id + ' fetchCurrencies() failed to fetch the currencies, the exchange is on maintenance');
            } else {
                throw new BadResponse (this.id + ' fetchCurrencies() failed to fetch the currencies');
            }
        }
        const currencies = this.safeValue (response, 'info');
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            // todo: will need to rethink the fees
            // to add support for multiple withdrawal/deposit methods and
            // differentiated fees for each particular method
            const code = this.safeCurrencyCode (id);
            const precision = 8; // default precision, todo: fix "magic constants"
            const walletStatus = this.safeString (currency, 'walletStatus');
            const active = (walletStatus === 'normal');
            const name = this.safeString (currency, 'name');
            const fee = this.safeFloat (currency, 'withdrawFee');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (currency, 'minOrderAmount'),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': this.safeFloat (currency, 'minOrderAmount'),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'minWithdrawAmount'),
                        'max': Math.pow (10, precision),
                    },
                    'deposit': {
                        'min': this.safeFloat (currency, 'minDepositAmount'),
                        'max': undefined,
                    },
                },
            };
        }
        result = this.appendFiatCurrencies (result);
        return result;
    }

    appendFiatCurrencies (result) {
        const precision = 8;
        const defaults = {
            'info': undefined,
            'active': true,
            'fee': undefined,
            'precision': precision,
            'limits': {
                'withdraw': { 'min': undefined, 'max': undefined },
                'deposit': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
                'price': {
                    'min': Math.pow (10, -precision),
                    'max': Math.pow (10, precision),
                },
            },
            'id': undefined,
            'code': undefined,
            'name': undefined,
        };
        const currencies = [
            { 'id': 'USD', 'code': 'USD', 'name': 'US Dollar' },
            { 'id': 'EUR', 'code': 'EUR', 'name': 'Euro' },
            // { 'id': 'RUR', 'code': 'RUB', 'name': 'Russian ruble' },
        ];
        currencies.push ({
            'id': 'RUR',
            'code': this.safeCurrencyCode ('RUR'),
            'name': 'Russian ruble',
        });
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const code = currency['code'];
            result[code] = this.extend (defaults, currency);
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPaymentBalances (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            let account = undefined;
            if (code in result) {
                account = result[code];
            } else {
                account = this.account ();
            }
            if (balance['type'] === 'total') {
                account['total'] = this.safeFloat (balance, 'value');
            }
            if (balance['type'] === 'available') {
                account['free'] = this.safeFloat (balance, 'value');
            }
            if (balance['type'] === 'trade') {
                account['used'] = this.safeFloat (balance, 'value');
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetExchangeCommissionCommonInfo (params);
        const commission = this.safeFloat (response, 'commission');
        return {
            'info': response,
            'maker': commission,
            'taker': commission,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'currencyPair': this.marketId (symbol),
            'groupByPrice': 'false',
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetExchangeOrderBook (this.extend (request, params));
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const vwap = this.safeFloat (ticker, 'vwap');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'best_bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'best_ask'),
            'askVolume': undefined,
            'vwap': this.safeFloat (ticker, 'vwap'),
            'open': undefined,
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetExchangeTicker (params);
        const tickers = this.indexBy (response, 'symbol');
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
            'currencyPair': market['id'],
        };
        const ticker = await this.publicGetExchangeTicker (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "time": 1409935047,
        //         "id": 99451,
        //         "price": 350,
        //         "quantity": 2.85714285,
        //         "type": "BUY"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "datetime": 1435844369,
        //         "id": 30651619,
        //         "type": "sell",
        //         "symbol": "BTC/EUR",
        //         "price": 230,
        //         "quantity": 0.1,
        //         "commission": 0,
        //         "clientorderid": 1472837650
        //     }
        const timestamp = this.safeTimestamp2 (trade, 'time', 'datetime');
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'commission');
        if (feeCost !== undefined) {
            const feeCurrency = market ? market['quote'] : undefined;
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const orderId = this.safeString (trade, 'clientorderid');
        const id = this.safeString (trade, 'id');
        const side = this.safeStringLower (trade, 'type');
        const amount = this.safeFloat (trade, 'quantity');
        const price = this.safeFloat (trade, 'price');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '/');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currencyPair': market['id'],
            // 'orderDesc': 'true', // or 'false', if true then new orders will be first, otherwise old orders will be first.
            // 'offset': 0, // page offset, position of the first item on the page
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetExchangeTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "datetime": 1435844369,
        //             "id": 30651619,
        //             "type": "sell",
        //             "symbol": "BTC/EUR",
        //             "price": 230,
        //             "quantity": 0.1,
        //             "commission": 0,
        //             "clientorderid": 1472837650
        //         },
        //         {
        //             "datetime": 1435844356,
        //             "id": 30651618,
        //             "type": "sell",
        //             "symbol": "BTC/EUR",
        //             "price": 230,
        //             "quantity": 0.2,
        //             "commission": 0.092,
        //             "clientorderid": 1472837651
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currencyPair': market['id'],
        };
        const response = await this.publicGetExchangeLastTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "time": 1409935047,
        //             "id": 99451,
        //             "price": 350,
        //             "quantity": 2.85714285,
        //             "type": "BUY"
        //         },
        //         {
        //             "time": 1409934792,
        //             "id": 99450,
        //             "price": 350,
        //             "quantity": 0.57142857,
        //             "type": "SELL"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetExchangeOrder (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'OPEN': 'open',
            'PARTIALLY_FILLED': 'open',
            'EXECUTED': 'closed',
            'CANCELLED': 'canceled',
            'PARTIALLY_FILLED_AND_CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        let timestamp = undefined;
        if ('lastModificationTime' in order) {
            timestamp = this.safeString (order, 'lastModificationTime');
            if (timestamp !== undefined) {
                if (timestamp.indexOf ('T') >= 0) {
                    timestamp = this.parse8601 (timestamp);
                } else {
                    timestamp = this.safeInteger (order, 'lastModificationTime');
                }
            }
        }
        // TODO currently not supported by livecoin
        // let trades = this.parseTrades (order['trades'], market, since, limit);
        const trades = undefined;
        const status = this.parseOrderStatus (this.safeString2 (order, 'status', 'orderStatus'));
        const marketId = this.safeString2 (order, 'symbol', 'currencyPair');
        const symbol = this.safeSymbol (marketId, market, '/');
        let type = this.safeStringLower (order, 'type');
        let side = undefined;
        if (type !== undefined) {
            const orderType = type.split ('_');
            type = orderType[0];
            side = orderType[1];
        }
        const price = this.safeFloat (order, 'price');
        // of the next two lines the latter overrides the former, if present in the order structure
        let remaining = this.safeFloat (order, 'remainingQuantity');
        remaining = this.safeFloat (order, 'remaining_quantity', remaining);
        const amount = this.safeFloat (order, 'quantity', remaining);
        let filled = undefined;
        if (remaining !== undefined) {
            filled = amount - remaining;
        }
        let cost = undefined;
        if (filled !== undefined && price !== undefined) {
            cost = filled * price;
        }
        const feeRate = this.safeFloat (order, 'commission_rate');
        let feeCost = undefined;
        if (cost !== undefined && feeRate !== undefined) {
            feeCost = cost * feeRate;
        }
        if ((market === undefined) && (symbol in this.markets)) {
            market = this.markets[symbol];
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            feeCurrency = market['quote'];
        }
        return {
            'info': order,
            'id': order['id'],
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': feeRate,
            },
            'average': undefined,
        };
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['currencyPair'] = market['id'];
        }
        if (since !== undefined) {
            request['issuedFrom'] = parseInt (since);
        }
        if (limit !== undefined) {
            request['endRow'] = limit - 1;
        }
        const response = await this.privateGetExchangeClientOrders (this.extend (request, params));
        const result = [];
        let rawOrders = [];
        if (response['data']) {
            rawOrders = response['data'];
        }
        for (let i = 0; i < rawOrders.length; i++) {
            const order = rawOrders[i];
            result.push (this.parseOrder (order, market));
        }
        return this.sortBy (result, 'timestamp');
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'openClosed': 'OPEN',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'openClosed': 'CLOSED',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privatePostExchange' + this.capitalize (side) + type;
        const market = this.market (symbol);
        const request = {
            'quantity': this.amountToPrecision (symbol, amount),
            'currencyPair': market['id'],
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this[method] (this.extend (request, params));
        const result = {
            'info': response,
            'id': response['orderId'].toString (),
        };
        const success = this.safeValue (response, 'success');
        if (success) {
            result['status'] = 'open';
        }
        return result;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'orderId': id,
            'currencyPair': market['id'],
        };
        const response = await this.privatePostExchangeCancellimit (this.extend (request, params));
        const message = this.safeString (response, 'message', this.json (response));
        if ('success' in response) {
            if (!response['success']) {
                throw new InvalidOrder (message);
            } else if ('cancelled' in response) {
                if (response['cancelled']) {
                    return {
                        'status': 'canceled',
                        'info': response,
                    };
                } else {
                    throw new OrderNotFound (message);
                }
            }
        }
        throw new ExchangeError (this.id + ' cancelOrder() failed: ' + this.json (response));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // Sometimes the response with be { key: null } for all keys.
        // An example is if you attempt to withdraw more than is allowed when withdrawal fees are considered.
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        let wallet = address;
        if (tag !== undefined) {
            wallet += '::' + tag;
        }
        const request = {
            'amount': this.decimalToPrecision (amount, TRUNCATE, currency['precision'], DECIMAL_PLACES),
            'currency': currency['id'],
            'wallet': wallet,
        };
        const response = await this.privatePostPaymentOutCoin (this.extend (request, params));
        const id = this.safeInteger (response, 'id');
        if (id === undefined) {
            throw new InsufficientFunds (this.id + ' insufficient funds to cover requested withdrawal amount post fees ' + this.json (response));
        }
        return {
            'info': response,
            'id': id,
        };
    }

    parseTransaction (transaction, currency = undefined) {
        //    {
        //        "id": "c853093d5aa06df1c92d79c2...", (tx on deposits, address on withdrawals)
        //        "type": "DEPOSIT",
        //        "date": 1553186482676,
        //        "amount": 712.61266,
        //        "fee": 0,
        //        "fixedCurrency": "XVG",
        //        "taxCurrency": "XVG",
        //        "variableAmount": null,
        //        "variableCurrency": null,
        //        "external": "Coin",
        //        "login": "USERNAME",
        //        "externalKey": "....87diPBy......3hTtuwUT78Yi", (address on deposits, tx on withdrawals)
        //        "documentId": 1110662453
        //    },
        let txid = undefined;
        let address = undefined;
        const id = this.safeString (transaction, 'documentId');
        const amount = this.safeFloat (transaction, 'amount');
        const timestamp = this.safeInteger (transaction, 'date');
        const type = this.safeStringLower (transaction, 'type');
        const currencyId = this.safeString (transaction, 'fixedCurrency');
        const feeCost = this.safeFloat (transaction, 'fee');
        const code = this.safeCurrencyCode (currencyId, currency);
        if (type === 'withdrawal') {
            txid = this.safeString (transaction, 'externalKey');
            address = this.safeString (transaction, 'id');
        } else if (type === 'deposit') {
            address = this.safeString (transaction, 'externalKey');
            txid = this.safeString (transaction, 'id');
        }
        let status = undefined;
        if (type === 'deposit') {
            status = 'ok'; // Deposits is not registered until they are in account. Withdrawals are left as undefined, not entirely sure about theyre status.
        }
        return {
            'info': transaction,
            'id': id,
            'currency': code,
            'amount': amount,
            'address': address,
            'tag': undefined,
            'status': status,
            'type': type,
            'updated': undefined,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'currency': code,
                'cost': feeCost,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const endtime = 2505600000; // 29 days - exchange has maximum 30 days.
        const now = this.milliseconds ();
        const request = {
            'types': 'DEPOSIT',
            'end': now,
            'start': (since !== undefined) ? parseInt (since) : now - endtime,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default is 100
        }
        const response = await this.privateGetPaymentHistoryTransactions (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const endtime = 2505600000; // 29 days - exchange has maximum 30 days.
        const now = this.milliseconds ();
        const request = {
            'types': 'WITHDRAWAL',
            'end': now,
            'start': (since !== undefined) ? parseInt (since) : now - endtime,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default is 100
        }
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.privateGetPaymentHistoryTransactions (this.extend (request, params));
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchDepositAddress (currency, params = {}) {
        const request = {
            'currency': currency,
        };
        const response = await this.privateGetPaymentGetAddress (this.extend (request, params));
        let address = this.safeString (response, 'wallet');
        let tag = undefined;
        if (address.indexOf (':') >= 0) {
            const parts = address.split (':');
            address = parts[0];
            tag = parts[2];
        }
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + path;
        const query = this.urlencode (this.keysort (params));
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + query;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'POST') {
                body = query;
            }
            const signature = this.hmac (this.encode (query), this.encode (this.secret), 'sha256');
            headers = {
                'Api-Key': this.apiKey,
                'Sign': signature.toUpperCase (),
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if (code >= 300) {
            const feedback = this.id + ' ' + body;
            const errorCode = this.safeString (response, 'errorCode');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            throw new ExchangeError (feedback);
        }
        // returns status code 200 even if success === false
        const success = this.safeValue (response, 'success', true);
        if (!success) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString2 (response, 'message', 'exception');
            if (message !== undefined) {
                this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            }
            throw new ExchangeError (feedback);
        }
    }
};

