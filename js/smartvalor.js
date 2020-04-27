'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class smartvalor extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'smartvalor',
            'name': 'SmartValor',
            'countries': [ 'CH' ], // Switzerland
            'rateLimit': 500,
            'has': {
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'CORS': false,
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
                'fetchMyTrades': false,
                'fetchOHLCV': 'emulated',
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': false,
                'fetchWithdrawals': false,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://smartvalor.com/_client-assets_/assets/img/smart_valor_logo.svg',
                'api': {
                    'public': 'http://localhost:3033',
                    'private': 'http://localhost:3033',
                },
                'www': 'https://smartvalor.com',
                'doc': 'https://api.smartvalor.com/swagger/',
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
                    ],
                    'post': [
                        'orders',
                    ],
                    'delete': [
                        'orders/{id}',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'fees': {
                'trading': {
                    'maker': 0.18 / 100,
                    'taker': 0.18 / 100,
                },
            },
            'exceptions': {
                '404': BadRequest,
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
        const data = await this.publicGetInstruments (params);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push ({
                'id': data[i].id,
                'symbol': data[i].product1.isoCode + '/' + data[i].product2.isoCode,
                'base': data[i].product1.isoCode,
                'quote': data[i].product2.isoCode,
                'info': data[i].product1.isoCode,
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
                'baseId': data[i].product1.id,
                'quoteId': data[i].product2.id,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const currencies = await this.publicGetProducts (params);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            result[currencies[i].isoCode] = {
                'id': currencies[i].id,
                'code': currencies[i].isoCode,
                'info': currencies[i],
                'name': currencies[i].name,
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
        let change = undefined;
        let percentage = undefined;
        let average = undefined;
        if ((close !== undefined) && (open !== undefined)) {
            change = close - open;
            if (open > 0) {
                percentage = change / open * 100;
            }
            average = this.sum (open, close) / 2;
        }
        const baseVolume = this.safeFloat (ticker, 'rolling24HrVolume');
        const quoteVolume = this.safeFloat (ticker, 'rolling24HrNumTrades');
        let vwap = undefined;
        if (quoteVolume !== undefined && baseVolume !== undefined) {
            vwap = quoteVolume / baseVolume;
        }
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
            'vwap': vwap,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
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
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balances = await this.privateGetAccountBalance (params);
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const currencyBalance = balances[i];
            const account = this.account ();
            account['total'] = this.safeFloat (currencyBalance, 'totalBalance');
            account['used'] = this.safeFloat (currencyBalance, 'hold');
            account['free'] = this.safeFloat (currencyBalance, 'availableBalance');
            result[currencyBalance.product.isoCode] = account;
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
        const orderbook = await this.publicGetInstrumentsIdLevel2 (this.extend (request, params));
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbook.length; i++) {
            const h = orderbook[i];
            if (h.side === 'BUY') {
                bids.push ([h.price, h.quantity]);
            } else {
                asks.push ([h.price, h.quantity]);
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
        if (limit === undefined) {
            request['count'] = limit; // default 50
        }
        const trades = await this.publicGetInstrumentsIdTrades (this.extend (request, params));
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'timestamp');
        const type = this.safeStringLower (trade, 'type');
        const side = this.safeStringLower (trade, 'side');
        const id = this.safeInteger (trade, 'id');
        let symbol = undefined;
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickerAll (params);
        const result = {};
        const timestamp = this.safeInteger (response['data'], 'date');
        const tickers = this.omit (response['data'], 'date');
        const ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let symbol = id;
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            }
            const ticker = tickers[id];
            const isArray = Array.isArray (ticker);
            if (!isArray) {
                ticker['date'] = timestamp;
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }
};
