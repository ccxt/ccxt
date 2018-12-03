'use strict';

// ---------------------------------------------------------------------------

const bitfinex = require ('./bitfinex.js');
const { ExchangeError, NotSupported, InsufficientFunds } = require ('./base/errors');

// ---------------------------------------------------------------------------

module.exports = class bitfinex2 extends bitfinex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex2',
            'name': 'Bitfinex v2',
            'countries': [ 'VG' ],
            'version': 'v2',
            'certified': false,
            // new metainfo interface
            'has': {
                'CORS': true,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchDepositAddress': false,
                'fetchClosedOrders': false,
                'fetchFundingFees': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchTradingFees': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'rateLimit': 1500,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v2/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
                'fees': 'https://www.bitfinex.com/fees',
            },
            'api': {
                'v1': {
                    'get': [
                        'symbols',
                        'symbols_details',
                    ],
                },
                'public': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'stats1/{key}:{size}:{symbol}:{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/{section}',
                        'stats1/{key}:{size}:{symbol}:long/last',
                        'stats1/{key}:{size}:{symbol}:long/hist',
                        'stats1/{key}:{size}:{symbol}:short/last',
                        'stats1/{key}:{size}:{symbol}:short/hist',
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                    'post': [
                        'calc/trade/avg',
                        'calc/fx',
                    ],
                },
                'private': {
                    'post': [
                        'auth/r/wallets',
                        'auth/r/orders/{symbol}',
                        'auth/r/orders/{symbol}/new',
                        'auth/r/orders/{symbol}/hist',
                        'auth/r/order/{symbol}:{id}/trades',
                        'auth/r/trades/{symbol}/hist',
                        'auth/r/positions',
                        'auth/r/funding/offers/{symbol}',
                        'auth/r/funding/offers/{symbol}/hist',
                        'auth/r/funding/loans/{symbol}',
                        'auth/r/funding/loans/{symbol}/hist',
                        'auth/r/funding/credits/{symbol}',
                        'auth/r/funding/credits/{symbol}/hist',
                        'auth/r/funding/trades/{symbol}/hist',
                        'auth/r/info/margin/{key}',
                        'auth/r/info/funding/{key}',
                        'auth/r/movements/{currency}/hist',
                        'auth/r/stats/perf:{timeframe}/hist',
                        'auth/r/alerts',
                        'auth/w/alert/set',
                        'auth/w/alert/{type}:{symbol}:{price}/del',
                        'auth/calc/order/avail',
                        'auth/r/ledgers/{symbol}/hist',
                        'auth/r/settings',
                        'auth/w/settings/set',
                        'auth/w/settings/del',
                        'auth/r/info/user',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                },
                'funding': {
                    'withdraw': {
                        'BTC': 0.0005,
                        'BCH': 0.0005,
                        'ETH': 0.01,
                        'EOS': 0.1,
                        'LTC': 0.001,
                        'OMG': 0.1,
                        'IOT': 0.0,
                        'NEO': 0.0,
                        'ETC': 0.01,
                        'XRP': 0.02,
                        'ETP': 0.01,
                        'ZEC': 0.001,
                        'BTG': 0.0,
                        'DASH': 0.01,
                        'XMR': 0.04,
                        'QTM': 0.01,
                        'EDO': 0.5,
                        'DAT': 1.0,
                        'AVT': 0.5,
                        'SAN': 0.1,
                        'USDT': 5.0,
                        'SPK': 9.2784,
                        'BAT': 9.0883,
                        'GNT': 8.2881,
                        'SNT': 14.303,
                        'QASH': 3.2428,
                        'YYW': 18.055,
                    },
                },
            },
            'wsconf': {
                'conx-tpls': {
                    'default': {
                        'type': 'ws',
                        'baseurl': 'wss://api.bitfinex.com/ws/2',
                    },
                },
                'methodmap': {
                    '_websocketTimeoutRemoveNonce': '_websocketTimeoutRemoveNonce',
                },
                'events': {
                    'ob': {
                        'conx-tpl': 'default',
                        'conx-param': {
                            'url': '{baseurl}',
                            'id': '{id}',
                        },
                    },
                },
            },
        });
    }

    isFiat (code) {
        let fiat = {
            'USD': 'USD',
            'EUR': 'EUR',
        };
        return (code in fiat);
    }

    getCurrencyId (code) {
        return 'f' + code;
    }

    async fetchMarkets () {
        let markets = await this.v1GetSymbolsDetails ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['pair'].toUpperCase ();
            let baseId = id.slice (0, 3);
            let quoteId = id.slice (3, 6);
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            id = 't' + id;
            baseId = this.getCurrencyId (baseId);
            quoteId = this.getCurrencyId (quoteId);
            let precision = {
                'price': market['price_precision'],
                'amount': market['price_precision'],
            };
            let limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minimum_order_size'),
                    'max': this.safeFloat (market, 'maximum_order_size'),
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': Math.pow (10, precision['price']),
                },
            };
            limits['cost'] = {
                'min': limits['amount']['min'] * limits['price']['min'],
                'max': undefined,
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostAuthRWallets ();
        let balanceType = this.safeString (params, 'type', 'exchange');
        let result = { 'info': response };
        for (let b = 0; b < response.length; b++) {
            let balance = response[b];
            let accountType = balance[0];
            let currency = balance[1];
            let total = balance[2];
            let available = balance[4];
            if (accountType === balanceType) {
                let code = currency;
                if (currency in this.currencies_by_id) {
                    code = this.currencies_by_id[currency]['code'];
                } else if (currency[0] === 't') {
                    currency = currency.slice (1);
                    code = currency.toUpperCase ();
                    code = this.commonCurrencyCode (code);
                } else {
                    code = this.commonCurrencyCode (code);
                }
                let account = this.account ();
                account['total'] = total;
                if (!available) {
                    if (available === 0) {
                        account['free'] = 0;
                        account['used'] = total;
                    } else {
                        account['free'] = total;
                    }
                } else {
                    account['free'] = available;
                    account['used'] = account['total'] - account['free'];
                }
                result[code] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbolPrecision (this.extend ({
            'symbol': this.marketId (symbol),
            'precision': 'R0',
        }, params));
        let timestamp = this.milliseconds ();
        let result = {
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        for (let i = 0; i < orderbook.length; i++) {
            let order = orderbook[i];
            let price = order[1];
            let amount = order[2];
            let side = (amount > 0) ? 'bids' : 'asks';
            amount = Math.abs (amount);
            result[side].push ([ price, amount ]);
        }
        result['bids'] = this.sortBy (result['bids'], 0, true);
        result['asks'] = this.sortBy (result['asks'], 0);
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let length = ticker.length;
        let last = ticker[length - 4];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': ticker[length - 2],
            'low': ticker[length - 1],
            'bid': ticker[length - 10],
            'bidVolume': undefined,
            'ask': ticker[length - 8],
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': ticker[length - 6],
            'percentage': ticker[length - 5] * 100,
            'average': undefined,
            'baseVolume': ticker[length - 3],
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (symbols !== undefined) {
            let ids = this.marketIds (symbols);
            request['symbols'] = ids.join (',');
        } else {
            request['symbols'] = 'ALL';
        }
        let tickers = await this.publicGetTickers (this.extend (request, params));
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let id = ticker[0];
            if (id in this.markets_by_id) {
                let market = this.markets_by_id[id];
                let symbol = market['symbol'];
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.markets[symbol];
        let ticker = await this.publicGetTickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let [ id, timestamp, amount, price ] = trade;
        let side = (amount < 0) ? 'sell' : 'buy';
        if (amount < 0) {
            amount = -amount;
        }
        return {
            'id': id.toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 120, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let sort = '-1';
        let request = {
            'symbol': market['id'],
            'limit': limit, // default = max = 120
        };
        if (since !== undefined) {
            request['start'] = since;
            sort = '1';
        }
        request['sort'] = sort;
        let response = await this.publicGetTradesSymbolHist (this.extend (request, params));
        let trades = this.sortBy (response, 1);
        return this.parseTrades (trades, market, undefined, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 100, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        if (since === undefined) {
            since = this.milliseconds () - this.parseTimeframe (timeframe) * limit * 1000;
        }
        let request = {
            'symbol': market['id'],
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
            'limit': limit,
            'start': since,
        };
        let response = await this.publicGetCandlesTradeTimeframeSymbolHist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new NotSupported (this.id + ' createOrder not implemented yet');
    }

    cancelOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' cancelOrder not implemented yet');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        throw new NotSupported (this.id + ' fetchOrder not implemented yet');
    }

    async fetchDepositAddress (currency, params = {}) {
        throw new NotSupported (this.id + ' fetchDepositAddress() not implemented yet.');
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        throw new NotSupported (this.id + ' withdraw not implemented yet');
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit': limit,
            'end': this.seconds (),
        };
        if (since !== undefined)
            request['start'] = parseInt (since / 1000);
        let response = await this.privatePostAuthRTradesSymbolHist (this.extend (request, params));
        // return this.parseTrades (response, market, since, limit); // not implemented yet for bitfinex v2
        return response;
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'v1')
            request = api + request;
        else
            request = this.version + request;
        let url = this.urls['api'] + '/' + request;
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            body = this.json (query);
            let auth = '/api' + '/' + request + nonce + body;
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha384');
            headers = {
                'bfx-nonce': nonce,
                'bfx-apikey': this.apiKey,
                'bfx-signature': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (response) {
            if ('message' in response) {
                if (response['message'].indexOf ('not enough exchange balance') >= 0)
                    throw new InsufficientFunds (this.id + ' ' + this.json (response));
                throw new ExchangeError (this.id + ' ' + this.json (response));
            }
            return response;
        } else if (response === '') {
            throw new ExchangeError (this.id + ' returned empty response');
        }
        return response;
    }

    _websocketOnMessage (contextId, data) {
        let msg = JSON.parse (data);
        // console.log(msg);
        let event = this.safeString (msg, 'event');
        if (typeof event !== 'undefined') {
            if (event === 'subscribed') {
                let channel = this.safeString (msg, 'channel');
                if (channel === 'book') {
                    this._websocketHandleSubscription (contextId, 'ob', msg);
                }
            } else if (event === 'unsubscribed') {
                this._websocketHandleUnsubscription (contextId, msg);
            } else if (event === 'error') {
                this._websocketHandleError (contextId, msg);
            }
        } else {
            // channel data
            let chanId = msg[0];
            let data = msg[1];
            if (data === 'hb') {
                // console.log ('heartbeat');
                return;
            }
            let chanKey = '_' + chanId.toString ();
            let channels = this._contextGet (contextId, 'channels');
            if (!(chanKey in channels)) {
                this.emit ('err', new ExchangeError (this.id + ' msg received from unregistered channels:' + chanId));
                return;
            }
            let symbol = channels[chanKey]['symbol'];
            let event = channels[chanKey]['event'];
            if (event === 'ob') {
                this._websocketHandleOrderBook (contextId, symbol, msg);
            }
        }
    }

    _websocketHandleError (contextId, msg) {
        let channel = this.safeString (msg, 'channel');
        let errorMsg = this.safeString (msg, 'msg');
        let errorCode = this.safeString (msg, 'code');
        let ex = new ExchangeError (this.id + ' ' + errorCode + ':' + errorMsg);
        if (channel === 'book') {
            let id = this.safeString (msg, 'symbol');
            let symbol = this.findSymbol (id);
            this._websocketProcessPendingNonces (contextId, 'sub-nonces', 'ob', symbol, false, ex);
        }
        this.emit ('err', ex, contextId);
    }

    _websocketHandleOrderBook (contextId, symbol, msg) {
        let data = msg[1];
        let firstElement = data[0];
        let symbolData = this._contextGetSymbolData (contextId, 'ob', symbol);
        if (Array.isArray (firstElement)) {
            // snapshot
            symbolData['ob'] = {
                'bids': [],
                'asks': [],
                'timestamp': undefined,
                'datetime': undefined,
                'nonce': undefined,
            };
            for (let i = 0; i < data.length; i++) {
                let record = data[i];
                let price = record[0];
                let c = record[1];
                let amount = record[2];
                let side = undefined;
                let isBid = undefined;
                if (amount > 0) {
                    side = 'bids';
                    isBid = true;
                } else {
                    side = 'asks'
                    isBid = false;
                    amount = -amount;
                }
                if (c === 0) {
                    // remove
                    this.updateBidAsk ([price, 0], symbolData['ob'][side], isBid);
                } else {
                    // update
                    this.updateBidAsk ([price, amount], symbolData['ob'][side], isBid);
                }
            }
        } else {
            // update
            let price = data[0];
            let c = data[1];
            let amount = data[2];
            let side = undefined;
            let isBid = undefined;
            if (amount > 0) {
                side = 'bids';
                isBid = true;
            } else {
                side = 'asks'
                isBid = false;
                amount = -amount;
            }
            if (c === 0) {
                // remove
                this.updateBidAsk ([price, 0], symbolData['ob'][side], isBid);
            } else {
                // update
                this.updateBidAsk ([price, amount], symbolData['ob'][side], isBid);
            }
        }
        this.emit ('ob', symbol, this._cloneOrderBook (symbolData['ob'], symbolData['limit']));
        this._contextSetSymbolData (contextId, 'ob', symbol, symbolData);
    }

    _websocketProcessPendingNonces (contextId, nonceKey, event, symbol, success, ex) {
        let symbolData = this._contextGetSymbolData (contextId, event, symbol);
        if (nonceKey in symbolData) {
            let nonces = symbolData[nonceKey];
            const keys = Object.keys (nonces);
            for (let i = 0; i < keys.length; i++) {
                let nonce = keys[i];
                this._cancelTimeout (nonces[nonce]);
                this.emit (nonce, success, ex);
            }
            symbolData[nonceKey] = {};
            this._contextSetSymbolData (contextId, event, symbol, symbolData);
        }
    }

    _websocketHandleSubscription (contextId, event, msg) {
        let id = this.safeString (msg, 'symbol');
        let symbol = this.findSymbol (id);
        let channel = this.safeInteger (msg, 'chanId');
        let chanKey = '_' + channel.toString ();
        let channels = this._contextGet (contextId, 'channels');
        if (typeof channels === 'undefined') {
            channels = {};
        }
        channels[chanKey] = {
            'response': msg,
            'symbol': symbol,
            'event': event,
        };
        this._contextSet (contextId, 'channels', channels);
        let symbolData = this._contextGetSymbolData (contextId, event, symbol);
        symbolData['channelId'] = channel;
        this._contextSetSymbolData (contextId, event, symbol, symbolData);
        this._websocketProcessPendingNonces (contextId, 'sub-nonces', 'ob', symbol, true, undefined);
    }

    _websocketHandleUnsubscription (contextId, msg) {
        let status = this.safeString (msg, 'status');
        if (status === 'OK') {
            let chanId = this.safeInteger (msg, 'chanId');
            let chanKey = '_' + chanId.toString ();
            let channels = this._contextGet (contextId, 'channels');
            if (!(chanKey in channels)) {
                this.emit ('err', new ExchangeError (this.id + ' msg received from unregistered channels:' + chanId));
                return;
            }
            let symbol = channels[chanKey]['symbol'];
            let event = channels[chanKey]['event'];
            // remove channel ids ?
            this.omit (channels, chanKey);
            this._contextSet (contextId, 'channels', channels);
            this._websocketProcessPendingNonces (contextId, 'unsub-nonces', event, symbol, true, undefined);
        }
    }

    _websocketSubscribe (contextId, event, symbol, nonce, params = {}) {
        if (event !== 'ob') {
            throw new NotSupported ('subscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
        }
        // save nonce for subscription response
        let symbolData = this._contextGetSymbolData (contextId, event, symbol);
        if (!('sub-nonces' in symbolData)) {
            symbolData['sub-nonces'] = {};
        }
        symbolData['limit'] = this.safeInteger (params, 'limit', undefined);
        let nonceStr = nonce.toString ();
        let handle = this._setTimeout (this.timeout, this._websocketMethodMap ('_websocketTimeoutRemoveNonce'), [contextId, nonceStr, event, symbol, 'sub-nonce']);
        symbolData['sub-nonces'][nonceStr] = handle;
        this._contextSetSymbolData (contextId, event, symbol, symbolData);
        // send request
        const id = this.marketId (symbol);
        this.websocketSendJson ({
            'event': 'subscribe',
            'channel': 'book',
            'symbol': id,
            'prec': 'P0',
            'freq': 'F0',
            'len': '100',
        });
    }

    _websocketUnsubscribe (contextId, event, symbol, nonce, params = {}) {
        if (event !== 'ob') {
            throw new NotSupported ('unsubscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
        }
        let symbolData = this._contextGetSymbolData (contextId, event, symbol);
        let payload = {
            'event': 'unsubscribe',
            'chanId': symbolData['channelId'],
        };
        if (!('unsub-nonces' in symbolData)) {
            symbolData['unsub-nonces'] = {};
        }
        let nonceStr = nonce.toString ();
        let handle = this._setTimeout (this.timeout, this._websocketMethodMap ('_websocketTimeoutRemoveNonce'), [contextId, nonceStr, event, symbol, 'unsub-nonces']);
        symbolData['unsub-nonces'][nonceStr] = handle;
        this._contextSetSymbolData (contextId, event, symbol, symbolData);
        this.websocketSendJson (payload);
    }

    _websocketTimeoutRemoveNonce (contextId, timerNonce, event, symbol, key) {
        let symbolData = this._contextGetSymbolData (contextId, event, symbol);
        if (key in symbolData) {
            let nonces = symbolData[key];
            if (timerNonce in nonces) {
                this.omit (symbolData[key], timerNonce);
                this._contextSetSymbolData (contextId, event, symbol, symbolData);
            }
        }
    }

    _getCurrentWebsocketOrderbook (contextId, symbol, limit) {
        let data = this._contextGetSymbolData (contextId, 'ob', symbol);
        if (('ob' in data) && (typeof data['ob'] !== 'undefined')) {
            return this._cloneOrderBook (data['ob'], limit);
        }
        return undefined;
    }
};
