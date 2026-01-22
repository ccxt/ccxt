'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, DuplicateOrderId, InvalidOrder, NetworkError, AuthenticationError, BadRequest, BadSymbol, InsufficientFunds, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class kickex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kickex',
            'name': 'KickEX',
            'countries': ['US'],
            'version': 'v1',
            'has': {
                'cancelOrder': true, // good
                'createOrder': true, // good
                'fetchBalance': true, // good
                'fetchCurrencies': true, // good
                'fetchMarkets': true, // good
                'fetchMyTrades': true, // good
                'fetchOpenOrders': true, // good
                'fetchClosedOrders': true, // good
                'fetchOrder': true, // good
                'fetchOrderBook': true, // good
                'fetchTickers': true, // good
                'fetchTicker': true, // good
                'fetchTrades': true, // good
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/7362743/105103335-81ee5400-5ac1-11eb-8a9c-467dcbc07eb3.png',
                'api': {
                    'public': 'https://gate.kickex.com/api',
                    'private': 'https://gate.kickex.com/api',
                    'v1': 'https://gate.kickex.com/api/v1',
                },
                'www': 'https://kickex.com/en',
                'doc': 'https://kickecosystem.github.io/KickEx-API-beta/#introduction',
                'fees': 'https://id.kickex.com/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'market/orderbook',
                        'market/allTickers',
                        'currencies',
                        'market/pairs',
                        'market/ticker',
                        'market/trades',
                    ],
                },
                'private': {
                    'get': [
                        'activeOrders',
                        'createTradeOrder',
                        'order',
                        'ordersHistory',
                        'tradesHistory',
                        'user/balance',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                    'post': [
                        'createTradeOrder',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.005,
                    'maker': 0.007,
                },
            },
            'httpExceptions': {
                '400': BadRequest,
                '500': ExchangeError,
            },
            'exceptions': {
                '19000': ExchangeError, // internal error
                '19002': ExchangeError, // internal error
                '19003': ExchangeError, // internal error
                '19004': ExchangeError, // internal error
                '19005': ExchangeError, // internal error
                '19006': ExchangeError, // internal error
                '19007': ExchangeError, // internal error
                '19008': ExchangeError, // internal error
                '19009': ExchangeError, // internal error
                '20001': BadRequest, // EX_DOCUMENT_NOT_FOUND
                '20002': DuplicateOrderId, // EX_DUPLICATED_DOCUMENT
                '20003': BadRequest, // EX_INVALID_CURRENCY
                '20004': InvalidOrder, // EX_AMOUNT_TOO_SMALL
                '20005': InsufficientFunds, // EX_INSUFFICIENT_FUNDS
                '20006': BadRequest, // EX_BAD_ARGUMENT
                '20007': BadRequest, // EX_INCORRECT_OBJECT_STATE
                '20008': BadRequest, // EX_ID_REUSED
                '20009': BadRequest, // EX_BC_ADDRESS_IN_USE
                '20010': BadRequest, // EX_WRONG_BC_ADDRESS
                '20011': ExchangeError, // EX_AUTHENTICATION_FAILED
                '20012': ExchangeError, // EX_CHANNEL_NOT_FOUND
                '20013': ExchangeError, // EX_BROKER_NOT_FOUND
                '20014': ExchangeError, // EX_UNREGISTERED_DAEMON
                '20015': ExchangeError, // EX_UNSYNCHRONIZED_TIME
                '20016': ExchangeError, // EX_PROTO_VIOLATION
                '20017': ExchangeError, // EX_LOOSER
                '29000': AuthenticationError, // User authentication error
                '29001': ExchangeError, // Wallet error
                '29002': BadRequest, // Request has malformed JSON
                '29003': BadRequest, // Unknown request type
                '29004': BadSymbol, // Unknown currency
                '29005': InsufficientFunds, // Insufficient funds in user's account
                '29006': BadRequest, // There is already present subscription with the same ID
                '29007': ExchangeError, // Gate will unsubscribe the client on one of internal service disconnect
                '29008': BadSymbol, // Unknown currency pair
                '29009': ExchangeError, // Gate cannot longer keep subscription. Cause of internal service failure
                '29010': AuthenticationError, // ER_USER_NOT_FOUND
                '29011': ExchangeError, // ER_SCRAM_ERROR
                '29012': AuthenticationError, // ER_ACCESS_TOKEN_EXPIRED
                '29014': ExchangeError, // Frozen service unknown error
                '29015': BadRequest, // Frozen service. Wrong address
                '29016': BadRequest, // Frozen service. Wrong address name
                '29017': BadRequest, // Frozen service. Too many addresses
                '29018': BadRequest, // No such subscription
                '29019': BadRequest, // Invalid argument
                '29020': BadRequest, // Country restricted
                '29021': BadRequest, // 2FA check error
                '29022': PermissionDenied, // Method requires user to have KYC passed
                '29023': PermissionDenied, // Method requires user to have email confirmed
                '29024': PermissionDenied, // Method unavailable for users with no KYC and not listed country (BAC-3068)
                '29025': BadRequest, // Not enough amount in order book
            },
        });
    }

    async fetchMarkets (params = {}) {
        params['type'] = 'market';
        const markets = await this.publicGetMarketPairs (params);
        const numMarkets = markets.length;
        if (numMarkets < 1) {
            throw new NetworkError (this.id + ' publicGetPairs returned empty response: ' + this.json (markets));
        }
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'quoteCurrencу');
            const id = this.safeString (market, 'pairName');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = this.safeString (market, 'pairName');
            const precision = {
                'base': this.safeInteger (market, 'baseMinSIze'),
                'quote': this.safeInteger (market, 'quoteMinSIze'),
                'price': this.safeInteger (market, 'priceDecimal'),
            };
            const minAmount = this.safeFloat (market, 'baseMinSIze', 0);
            const minCost = this.safeFloat (market, 'quoteMinSIze', 0);
            const active = true;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'taker': undefined,
                'maker': undefined,
                'limits': {
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': minCost,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const marketId = this.safeString (ticker, 'pairName');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger2 (ticker, 'timestamp', 'time');
        const last = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'highestPrice'),
            'low': this.safeFloat (ticker, 'lowestPrice'),
            'bid': this.safeFloat (ticker, 'bestBid'),
            'bidVolume': this.safeFloat (ticker, 'bestBidVolume'),
            'ask': this.safeFloat (ticker, 'bestAsk'),
            'askVolume': this.safeFloat (ticker, 'bestAskVolume'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'changePrice'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'baseVol'),
            'quoteVolume': this.safeFloat (ticker, 'quoteVol'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        const tickers = await this.fetchTickers ([symbol], params);
        const ticker = this.safeValue (tickers, symbol);
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' ticker symbol ' + symbol + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetMarketAllTickers (params);
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchCurrencies (params = {}) {
        const data = await this.publicGetCurrencies (params);
        //
        //     {
        //         "currency": "OMG",
        //         "name": "OMG",
        //         "fullName": "OmiseGO",
        //         "precision": 8,
        //         "confirms": 12,
        //         "withdrawalMinSize": "4",
        //         "withdrawalMinFee": "1.25",
        //         "isWithdrawEnabled": false,
        //         "isDepositEnabled": false,
        //         "isMarginEnabled": false,
        //         "isDebitEnabled": false
        //     }
        //
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'currencyName');
            const name = this.safeString (entry, 'fullName');
            const code = this.safeCurrencyCode (id);
            const precision = this.safeInteger (entry, 'decimal');
            const fee = this.safeFloat (entry, 'minFeeWithrawal');
            const active = this.safeInteger (entry, 'state') === 4;
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': entry,
                'active': active,
                'fee': fee,
                'limits': undefined,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        params['pairName'] = this.marketId (symbol);
        const response = await this.publicGetMarketOrderbook (
            this.extend (request, params)
        );
        const orderbook = this.parseOrderBook (
            response,
            undefined,
            'bids',
            'asks',
            'price',
            'amount'
        );
        const timestamp = this.safeInteger (response, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['nonce'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const marketId = this.safeString (trade, 'pairName');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeFloat (trade, 'price');
        const id = this.safeString (trade, 'timestamp');
        const amount = this.safeFloat (trade, 'baseVol');
        const cost = this.safeFloat (trade, 'quoteVol');
        const takerOrMaker = undefined;
        const fee = {
            'cost': this.safeFloat (trade, 'feeQuoted'),
            'currency': undefined,
        };
        if ('externalFeeCurrency' in trade) {
            fee['externalCurrency'] = this.safeFloat (trade, 'externalFeeCurrency');
        }
        if ('feeExternal' in trade) {
            fee['externalCost'] = this.safeFloat (trade, 'feeExternal');
        }
        const orderId = this.safeInteger (trade, 'orderId');
        const side = this.safeString (trade, 'type');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        params['pairName'] = market['id'];
        params['type'] = 'all';
        const data = await this.publicGetMarketTrades (this.extend (request, params));
        let result = this.parseTrades (data, market, since, limit);
        result = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetUserBalance (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currencyCode');
            const code = this.safeCurrencyCode (currencyId);
            let account = undefined;
            if (code in result) {
                account = result[code];
            } else {
                account = this.account ();
            }
            const accountType = this.safeInteger (balance, 'accountType', 2401);
            if (accountType === 2401) {
                account['free'] = this.safeFloat (balance, 'available');
                account['total'] = this.safeFloat (balance, 'balance');
                account['used'] = this.safeFloat (balance, 'inOrders');
            }
            if (accountType === 2411) {
                account['frozen'] = this.safeFloat (balance, 'balance');
            }
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'ORDERED': 'open',
            'ORDERED MODIFYING': 'open',
            'EXECUTED': 'closed',
            'CANCELLING': 'canceled',
            'CANCECANCELEDLED_PARTIALLY_FILLED': 'canceled',
            'EXPIRED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'pairName');
        let symbol = undefined;
        if (marketId && !market && (marketId in this.marketsById)) {
            market = this.marketsById[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const createdTimestamp = parseInt (this.safeInteger (order, 'createdTimestamp') / 1000000);
        const tradeTimeStamp = parseInt (this.safeInteger (order, 'tradeTimestamp') / 1000000);
        const externalId = this.safeString (order, 'externalId');
        const limitPrice = this.safeFloat (order, 'limitPrice');
        const amount = this.safeFloat (order, 'orderedVolume');
        let average = undefined;
        let cost = undefined;
        let filled = 0;
        let side = undefined;
        const tradeIntent = this.safeInteger (order, 'tradeIntent');
        const totalSellVolume = this.safeFloat (order, 'totalSellVolume');
        const totalBuyVolume = this.safeFloat (order, 'totalBuyVolume');
        if (tradeIntent === 0) {
            side = 'buy';
            filled = this.safeFloat (order, 'totalBuyVolume');
            average = totalSellVolume / totalBuyVolume;
            cost = totalSellVolume;
        } else if (tradeIntent === 1) {
            side = 'sell';
            filled = this.safeFloat (order, 'totalSellVolume');
            average = totalBuyVolume / totalSellVolume;
            cost = totalBuyVolume;
        }
        let remaining = undefined;
        if (filled !== undefined) {
            if (amount !== undefined) {
                remaining = Math.max (amount - filled, 0);
            }
        }
        const fee = {};
        const totalFeeQuoted = this.safeFloat (order, 'totalFeeQuoted');
        // const totalFeeExt = this.safeFloat (order, 'totalFeeExt');
        if (totalFeeQuoted !== undefined) {
            fee['cost'] = totalFeeQuoted;
            fee['currency'] = undefined;
        }
        let type = undefined;
        if (('tpActivateLevel' in order) || ('tpLimitPrice' in order) || ('tpSubmitLevel' in order)) {
            type = 'takeProfit';
        } else if (('slLimitPrice' in order) || ('slSubmitLevel' in order)) {
            type = 'stoplLoss';
        } else if ('limitPrice' in order) {
            type = 'limit';
        } else {
            type = 'market';
        }
        return {
            'id': id,
            'clientOrderId': externalId,
            'datetime': this.iso8601 (createdTimestamp),
            'timestamp': createdTimestamp,
            'lastTradeTimestamp': tradeTimeStamp,
            'status': undefined,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': limitPrice,
            'stopPrice': undefined,
            'cost': cost,
            'average': average,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let intent = 0;
        if (side === 'buy') {
            intent = 0;
        } else if (side === 'sell') {
            intent = 1;
        } else {
            throw new InvalidOrder (this.id + ' invalid side type. Must be sell or buy.');
        }
        const request = {
            'pairName': market['id'],
            'tradeIntent': intent,
            'orderedAmount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            if (price === undefined) {
                throw new InvalidOrder (this.id + ' createOrder requires a price argument for limit order');
            }
            request['limitPrice'] = this.priceToPrecision (symbol, price);
        } else if (type !== 'market') {
            throw new InvalidOrder (this.id + ' unknown order type.');
        }
        const response = await this.privatePostCreateTradeOrder (this.extend (request, params));
        const id = this.safeInteger (response, 'orderId');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const market = undefined;
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pairName'] = market['id'];
        }
        if (since !== undefined) {
            request['bottomOrderTs'] = parseInt (since * 1000000);
        }
        const response = await this.privateGetActiveOrders (this.extend (request, params));
        const parsedOrders = this.parseOrders (response, market, since, limit);
        const result = [];
        for (let i = 0; i < parsedOrders.length; i++) {
            result.push (this.extend (parsedOrders[i], { 'status': 'open' }));
        }
        return result;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pairName'] = market['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if ('endTime' in params) {
            request['endTime'] = params['endTime'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if ('tradeIntent' in params) {
            request['tradeIntent'] = params['tradeIntent'];
        }
        if ('tsnBottomOrder' in params) {
            request['tsnBottomOrder'] = params['tsnBottomOrder'];
        }
        if ('tsnTopOrder' in params) {
            request['tsnTopOrder'] = params['tsnTopOrder'];
        }
        if (since !== undefined) {
            request['bottomOrderTs'] = parseInt (since * 1000000);
        }
        const response = await this.privateGetOrdersHistory (this.extend (request, params));
        const parsedOrders = this.parseOrders (response, market, since, limit);
        const result = [];
        for (let i = 0; i < parsedOrders.length; i++) {
            result.push (this.extend (parsedOrders[i], { 'status': 'closed' }));
        }
        return result;
    }

    parseMyTrade (trade, market = undefined) {
        const timestamp = parseInt (this.safeInteger (trade, 'timestamp') / 1000000);
        const marketId = this.safeString (trade, 'pairName');
        const symbol = this.safeSymbol (marketId, market);
        const price = this.safeFloat (trade, 'price');
        const id = this.safeString (trade, 'timestamp');
        const takerOrMaker = undefined;
        const fee = {
            'cost': this.safeFloat (trade, 'feeQuoted'),
            'currency': undefined,
        };
        if ('externalFeeCurrency' in trade) {
            fee['externalCurrency'] = this.safeFloat (trade, 'externalFeeCurrency');
        }
        if ('feeExternal' in trade) {
            fee['externalCost'] = this.safeFloat (trade, 'feeExternal');
        }
        const orderId = this.safeInteger (trade, 'orderId');
        const sellVolume = this.safeFloat (trade, 'sellVolume');
        const buyVolume = this.safeFloat (trade, 'buyVolume');
        let amount = undefined;
        let side = undefined;
        let cost = undefined;
        const tradeIntent = this.safeInteger (trade, 'tradeIntent');
        if (tradeIntent === 0) {
            side = 'buy';
            amount = buyVolume;
            cost = sellVolume;
        } else if (tradeIntent === 1) {
            side = 'sell';
            amount = sellVolume;
            cost = buyVolume;
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        };
    }

    parseMyTrades (trades, market = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            const entry = this.parseMyTrade (trades[i], market);
            result.push (entry);
        }
        // let result = Object.values (trades || []).map ((trade) => this.extend (this.parseMyTrade (trade, market), params));
        result = this.sortBy (result, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        if (market !== undefined) {
            request['pairName'] = market['id'];
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        if ('tradeIntent' in params) {
            request['tradeIntent'] = params['tradeIntent'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if ('endTime' in params) {
            request['endTime'] = params['endTime'];
        }
        if ('tsnBottomDeal' in params) {
            request['tsnBottomDeal'] = params['tsnBottomDeal'];
        }
        if ('tsnTopDeal' in params) {
            request['tsnTopDeal'] = params['tsnTopDeal'];
        }
        if (since !== undefined) {
            request['bottomOrderTs'] = parseInt (since * 1000000);
        }
        const response = await this.privateGetTradesHistory (this.extend (request, params));
        return this.parseMyTrades (response, market, since, limit);
    }

    nonce () {
        return this.seconds ();
    }

    urldecodeBase64 (val) {
        const before = val;
        val = val.replace ('-', '+').replace ('_', '/');
        if (before === val) {
            return val;
        } else {
            return this.urldecodeBase64 (val);
        }
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        const pathEnding = '/' + this.version + '/' + this.implodeParams (path, params);
        const fullPath = '/api' + pathEnding;
        let url = this.urls['api'][api] + pathEnding;
        let bodyForSignature = '';
        if (method === 'GET' || method === 'DELETE') {
            const queryEncoded = this.urlencode (query);
            if (Object.keys (query).length) {
                url += '?' + queryEncoded;
            }
            bodyForSignature = queryEncoded;
        } else if (method === 'POST') {
            body = this.json (query);
            bodyForSignature = body;
        }
        if (api !== 'public') {
            this.checkRequiredCredentials ();
            const timestamp = '' + this.nonce ();
            let secret = this.urldecodeBase64 (this.secret);
            // this.print ('presecret: ' + secret);
            secret = this.base64ToBinary (secret);
            const signature = this.hmac (this.encode (method.toLowerCase ()), this.encode (timestamp), 'sha512', 'base64');
            // this.print ('signature1: ' + this.base64ToBinary (signature));
            const signature2 = this.hmac (this.encode (fullPath), this.base64ToBinary (signature), 'sha512', 'base64');
            // this.print ('signature2: ' + this.base64ToBinary (signature2));
            const signature3 = this.hmac (this.encode (bodyForSignature), this.base64ToBinary (signature2), 'sha512', 'base64');
            // this.print ('signature3: ' + this.base64ToBinary (signature3));
            const signature4 = this.hmac (secret, this.base64ToBinary (signature3), 'sha512', 'base64');
            // this.print ('secret: ' + secret);
            // this.print ('signature4: ' + this.base64ToBinary (signature4));
            headers = {
                'Content-Type': 'application/json',
                'KICK-API-KEY': this.apiKey,
                'KICK-API-PASS': this.stringToBase64 (this.password),
                'KICK-API-TIMESTAMP': timestamp,
                'KICK-SIGNATURE': signature4,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const response = await this.fetch2 (
            path,
            api,
            method,
            params,
            headers,
            body
        );
        return response;
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        // {"code":29000,"message":"Bad apikey hash. Please verify password."}
        if ('code' in response) {
            const code = this.safeString (response, 'code');
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions, code, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
