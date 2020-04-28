'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadRequest, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class smartvalor extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'smartvalor',
            'name': 'Smart Valor',
            'countries': [ 'CH', 'DE', 'LI' ], // Switzerland, Germany, Liechtenstein
            'urls': {
                'api': {
                    'public': 'https://api.smartvalor.com',
                    'private': 'https://api.smartvalor.com',
                },
                'www': 'https://smartvalor.com',
                'doc': 'https://api.smartvalor.com/swagger/',
                'logo': 'https://smartvalor.com/_client-assets_/assets/img/smart_valor_logo.svg',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/time',
                        'products',
                        'instruments',
                        'instruments/{id}/level1',
                        'instruments/{id}/level2',
                        'instruments/{id}/trades',
                    ],
                },
                'private': {
                    'get': [
                        'account/balance',
                        'orders/{id}',
                        'orders',
                        'account/fees',
                        'account/trades',
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': true,
                'createDepositAddress': false,
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': false,
                'editOrder': 'emulated',
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchL2OrderBook': true,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': false,
            },
            'rateLimit': 2000,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.29 / 100,
                    'taker': 0.29 / 100,
                },
            },
            'exceptions': {
                '404': OrderNotFound,
                '401': AuthenticationError,
                '400': BadRequest,
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetExchangeTime (params);
        return this.safeInteger (response, 'timestamp');
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchMarkets (params = {}) {
        const instruments = await this.publicGetInstruments (params);
        const result = [];
        for (let i = 0; i < instruments.length; i++) {
            const instrument = this.safeValue (instruments, i);
            const base = this.safeValue (instrument, 'product1');
            const quote = this.safeValue (instrument, 'product2');
            result.push ({
                'id': instruments[i].id,
                'symbol': base['isoCode'] + '/' + quote['isoCode'],
                'base': base['isoCode'],
                'quote': quote['isoCode'],
                'info': instrument,
                'active': true,
                'precision': {
                    'amount': undefined,
                    'price': undefined,
                },
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
                },
                'baseId': base['id'],
                'quoteId': quote['id'],
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const currencies = await this.publicGetProducts (params);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = this.safeValue (currencies, i);
            result[currency['isoCode']] = {
                'id': currency['id'],
                'code': currency['isoCode'],
                'info': currency,
                'name': currency['name'],
                'active': true,
                'fee': undefined,
                'precision': undefined,
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
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetInstrumentsIdLevel1 (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const open = this.safeFloat (ticker, 'sessionOpen');
        const close = this.safeFloat (ticker, 'sessionClose');
        const change = this.safeFloat (ticker, 'currentDayPriceChange');
        let percentage = undefined;
        let average = undefined;
        if ((close !== undefined) && (open !== undefined)) {
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, close) / 2;
        }
        const baseVolume = this.safeFloat (ticker, 'rolling24HrVolume');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'sessionHigh'),
            'low': this.safeFloat (ticker, 'sessionLow'),
            'bid': this.safeFloat (ticker, 'bestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'bestOffer'),
            'askVolume': undefined,
            'vwap': undefined, // volume weighted average price
            'open': open,
            'close': close,
            'last': this.safeFloat (ticker, 'lastTradedPrice'),
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const signature = this.hmac (this.encode (nonce + this.uid.toString () + this.apiKey), this.encode (this.secret));
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': this.apiKey,
                'signature': signature.toString (),
                'identification': this.uid,
                'nonce': nonce,
            };
            if (method !== 'GET') {
                body = this.json (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetAccountBalance (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const currencyBalance = this.safeValue (balances, i);
            const product = this.safeValue (currencyBalance, 'product');
            const account = this.account ();
            account['total'] = this.safeFloat (currencyBalance, 'totalBalance');
            account['used'] = this.safeFloat (currencyBalance, 'hold');
            account['free'] = this.safeFloat (currencyBalance, 'availableBalance');
            result[product['isoCode']] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        if (limit !== undefined) {
            request['count'] = limit; // max = 50
        }
        const orderBook = await this.publicGetInstrumentsIdLevel2 (this.extend (request, params));
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderBook.length; i++) {
            const entry = this.safeValue (orderBook, i);
            const price = this.safeFloat (entry, 'price');
            const quantity = this.safeFloat (entry, 'quantity');
            if (entry.side === 'BUY') {
                bids.push ([price, quantity]);
            } else {
                asks.push ([price, quantity]);
            }
        }
        const timestamp = this.milliseconds ();
        return this.parseOrderBook ({
            'bids': bids,
            'asks': asks,
        }, timestamp, 'bids', 'asks');
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const trades = await this.publicGetInstrumentsIdTrades (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const type = this.safeStringLower (trade, 'type');
        const side = this.safeStringLower (trade, 'side');
        const id = this.safeInteger (trade, 'id');
        const marketId = this.safeInteger (trade, 'instrumentId');
        let symbol = undefined;
        if (market === undefined) {
            market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'quantity');
        const cost = this.safeFloat (trade, 'value');
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const marketId = this.marketId (symbol);
        const request = {
            'side': side.toUpperCase (),
            'type': type.toUpperCase (),
            'quantity': amount,
            'instrumentId': marketId,
            'price': price,
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        const id = this.safeInteger (response, 'id');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = {
            'id': id,
        };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrder (order, market = undefined) {
        const side = this.safeStringLower (order, 'side');
        const orderStatus = this.safeString (order, 'status');
        // [ UNKNOWN, ACCEPTED, WORKING, REJECTED, CANCELED, EXPIRED, FULLYEXECUTED ]
        let status = undefined;
        if (orderStatus === 'UNKNOWN' || orderStatus === 'ACCEPTED' || orderStatus === 'WORKING') {
            status = 'open'; // UNKNOWN, ACCEPTED, WORKING
        } else if (orderStatus === 'REJECTED' || orderStatus === 'CANCELED' || orderStatus === 'EXPIRED') {
            status = 'canceled'; // REJECTED, CANCELED, EXPIRED
        } else {
            status = 'closed'; // FULLYEXECUTED
        }
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeInteger (order, 'instrumentId');
            if (marketId !== undefined) {
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const orderType = this.safeStringLower (order, 'type');
        const timestamp = this.safeInteger (order, 'receivedTimestamp');
        return {
            'info': order,
            'id': this.safeInteger (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': undefined,
            'amount': this.safeFloat (order, 'quantity'),
            'remaining': this.safeFloat (order, 'remaining_amount'),
            'filled': this.safeFloat (order, 'executedQuantity'),
            'status': status,
            'fee': undefined,
            'cost': undefined,
            'trades': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            if (!(symbol in this.markets)) {
                throw new ExchangeError (this.id + ' has no symbol ' + symbol);
            }
        }
        const response = await this.privateGetOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccountFees (params);
        const fees = this.fees['trading'];
        return {
            'info': response,
            'maker': this.safeFloat (fees, 'maker'),
            'taker': this.safeFloat (fees, 'taker'),
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const trades = await this.privateGetAccountTrades (this.extend ({}, params));
        const result = this.parseTrades (trades, undefined, since, limit);
        if (symbol === undefined) {
            return result;
        }
        return this.filterBySymbol (result, symbol);
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const feedback = this.id + ' ' + body;
        if ('status' in response) {
            const status = this.safeInteger (response, 'status');
            if (status !== undefined) {
                this.throwExactlyMatchedException (this.exceptions, status, feedback);
                throw new ExchangeError (feedback);
            }
        }
        if ('statusCode' in response) {
            const statusCode = this.safeInteger (response, 'statusCode');
            this.throwExactlyMatchedException (this.exceptions, statusCode, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
