'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidAddress } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class gateio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateio',
            'name': 'Gate.io',
            'countries': 'CN',
            'version': '2',
            'rateLimit': 1000,
            'has': {
                'CORS': false,
                'createMarketOrder': false,
                'fetchTickers': true,
                'withdraw': true,
                'createDepositAddress': true,
                'fetchDepositAddress': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'api': {
                    'public': 'https://data.gate.io/api',
                    'private': 'https://data.gate.io/api',
                },
                'www': 'https://gate.io/',
                'doc': 'https://gate.io/api2',
                'fees': [
                    'https://gate.io/fee',
                    'https://support.gate.io/hc/en-us/articles/115003577673',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'pairs',
                        'marketinfo',
                        'marketlist',
                        'tickers',
                        'ticker/{id}',
                        'orderBook/{id}',
                        'trade/{id}',
                        'tradeHistory/{id}',
                        'tradeHistory/{id}/{tid}',
                    ],
                },
                'private': {
                    'post': [
                        'balances',
                        'depositAddress',
                        'newAddress',
                        'depositsWithdrawals',
                        'buy',
                        'sell',
                        'cancelOrder',
                        'cancelAllOrders',
                        'getOrder',
                        'openOrders',
                        'tradeHistory',
                        'withdraw',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.002,
                    'taker': 0.002,
                },
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetMarketinfo ();
        let markets = this.safeValue (response, 'pairs');
        if (!markets)
            throw new ExchangeError (this.id + ' fetchMarkets got an unrecognized response');
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let keys = Object.keys (market);
            let id = keys[0];
            let details = market[id];
            let [ base, quote ] = id.split ('_');
            base = base.toUpperCase ();
            quote = quote.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': details['decimal_places'],
            };
            let amountLimits = {
                'min': details['min_amount'],
                'max': undefined,
            };
            let priceLimits = {
                'min': Math.pow (10, -details['decimal_places']),
                'max': undefined,
            };
            let costLimits = {
                'min': amountLimits['min'] * priceLimits['min'],
                'max': undefined,
            };
            let limits = {
                'amount': amountLimits,
                'price': priceLimits,
                'cost': costLimits,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
                'maker': details['fee'] / 100,
                'taker': details['fee'] / 100,
                'precision': precision,
                'limits': limits,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balance = await this.privatePostBalances ();
        let result = { 'info': balance };
        let currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let code = this.commonCurrencyCode (currency);
            let account = this.account ();
            if ('available' in balance) {
                if (currency in balance['available']) {
                    account['free'] = parseFloat (balance['available'][currency]);
                }
            }
            if ('locked' in balance) {
                if (currency in balance['locked']) {
                    account['used'] = parseFloat (balance['locked'][currency]);
                }
            }
            account['total'] = this.sum (account['free'], account['used']);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBookId (this.extend ({
            'id': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24hr'),
            'low': this.safeFloat (ticker, 'low24hr'),
            'bid': this.safeFloat (ticker, 'highestBid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'lowestAsk'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'percentChange'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'quoteVolume'),
            'quoteVolume': this.safeFloat (ticker, 'baseVolume'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let result = {};
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            let ticker = tickers[id];
            let market = undefined;
            if (symbol in this.markets)
                market = this.markets[symbol];
            if (id in this.markets_by_id)
                market = this.markets_by_id[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetTickerId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        // exchange reports local time (UTC+8)
        let timestamp = this.parse8601 (trade['date']) - 8 * 60 * 60 * 1000;
        return {
            'id': trade['tradeID'],
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['type'],
            'price': this.safeFloat (trade, 'rate'),
            'amount': this.safeFloat (trade, 'amount'),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradeHistoryId (this.extend ({
            'id': market['id'],
        }, params));
        return this.parseTrades (response['data'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type === 'market')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let method = 'privatePost' + this.capitalize (side);
        let order = {
            'currencyPair': this.marketId (symbol),
            'rate': price,
            'amount': amount,
        };
        let response = await this[method] (this.extend (order, params));
        return {
            'info': response,
            'id': response['orderNumber'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostCancelOrder ({ 'orderNumber': id });
    }

    async queryDepositAddress (method, currency, params = {}) {
        method = 'privatePost' + method + 'Address';
        let response = await this[method] (this.extend ({
            'currency': currency,
        }, params));
        let address = undefined;
        if ('addr' in response)
            address = this.safeString (response, 'addr');
        if ((typeof address !== 'undefined') && (address.indexOf ('address') >= 0))
            throw new InvalidAddress (this.id + ' queryDepositAddress ' + address);
        return {
            'currency': currency,
            'address': address,
            'status': (typeof address !== 'undefined') ? 'ok' : 'none',
            'info': response,
        };
    }

    async createDepositAddress (currency, params = {}) { // CHANGE
        return await this.queryDepositAddress ('New', currency, params);
    }

    async fetchDepositAddress (currency, params = {}) {  // CHANGE
        return await this.queryDepositAddress ('Deposit', currency, params);
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let response = await this.privatePostWithdraw (this.extend ({
            'currency': currency.toLowerCase (),
            'amount': amount,
            'address': address, // Address must exist in you AddressBook in security settings
        }, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let prefix = (api === 'private') ? (api + '/') : '';
        let url = this.urls['api'][api] + this.version + '/1/' + prefix + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let request = { 'nonce': nonce };
            body = this.urlencode (this.extend (request, query));
            let signature = this.hmac (this.encode (body), this.encode (this.secret), 'sha512');
            headers = {
                'Key': this.apiKey,
                'Sign': signature,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('result' in response) {
            let result = response['result'];
            let message = this.id + ' ' + this.json (response);
            if (typeof result === 'undefined')
                throw new ExchangeError (message);
            if (typeof result === 'string') {
                if (result !== 'true')
                    throw new ExchangeError (message);
            } else if (!result) {
                throw new ExchangeError (message);
            }
        }
        return response;
    }
};
