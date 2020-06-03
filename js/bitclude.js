'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { DECIMAL_PLACES } = require ('./base/functions/number');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound } = require ('./base/errors');

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
                'fetchCurrencies': false,
                'cancelAllOrders': false,
                'fetchClosedOrders': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingFees': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTickers': true,
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
            'precisionMode': DECIMAL_PLACES, // todo
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
                'precision': precision, // todo
                'limits': undefined, // this exchange have user-specific limits
                'info': info,
            };
            result.push (entry);
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
        // todo idk what do with limit
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
        return this.parseOrderBook (response, timestamp, 'bids', 'asks', 1, 0); // todo check if correct
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

    parseTrade (trade, market) {
        const id = this.safeString (trade, 'nr');
        const timestamp = this.safeTimestamp (trade, 'time');
        const type = undefined;
        let side = this.safeString (trade, 'type');
        if (side === 'a') {
            // todo ensure
            side = 'sell';
        } else if (side === 'b') {
            side = 'buy';
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const fee = undefined;
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
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
        params['method'] = 'account';
        params['action'] = 'info';
        const response = await this.privateGet (params);
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
