'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, ExchangeError, InvalidOrder } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ftx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftx',
            'name': 'FTX',
            'countries': [ 'HK' ],
            'rateLimit': 100,
            'certified': false,
            'urls': {
                'logo': 'https://theme.zdassets.com/theme_assets/9179536/d48e830d666da07d0a1fcdb74e5ed665d4d4a069.png',
                'www': 'https://ftx.com',
                'api': 'https://ftx.com/api',
                'doc': 'https://github.com/ftexchange/ftx',
            },
            'version': 'v1',
            'has': {
                'fetchDepositAddress': true,
                'fetchTickers': false,
                'fetchTicker': true,
                'fetchOHLCV': true,
                'fetchCurrencies': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'fetchL2OrderBook': false,
                'fetchMyTrades': false,
                'withdraw': true,
                'fetchFundingFees': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchTransactions': false,
                'fetchStatus': false,
                'fetchTrades': true,
                'fetchOrderBook': true,
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '24h': '86400',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'futures/{market}/mark_candles',
                        'markets/{market}/candles',
                        'markets/{market}/orderbook',
                        'markets/{market}/trades',
                        'coins',
                        'futures/{market}',
                        'futures/{market}/stats',
                    ],
                },
                'private': {
                    'get': [
                        'wallet/balances',
                        'orders',
                        'orders/{id}',
                        'wallet/deposit_address/{coin}',
                        'wallet/deposits',
                        'wallet/withdrawals',
                    ],
                    'post': [
                        'orders',
                        'conditional_orders',
                        'wallet/withdrawals',
                    ],
                    'delete': [
                        'orders',
                        'orders/{id}',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.37,
        //                 "baseCurrency":null,
        //                 "bid":170.31,
        //                 "change1h":-0.019001554672655036,
        //                 "change24h":-0.024841165359738997,
        //                 "changeBod":-0.03816406029469881,
        //                 "enabled":true,
        //                 "last":170.37,
        //                 "name":"ETH-PERP",
        //                 "price":170.37,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":null,
        //                 "quoteVolume24h":7742164.59889,
        //                 "sizeIncrement":0.001,
        //                 "type":"future",
        //                 "underlying":"ETH",
        //                 "volumeUsd24h":7742164.59889
        //             },
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'result', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString2 (market, 'baseCurrency', 'underlying');
            const quoteId = this.safeString (market, 'quoteCurrency', 'USD');
            const type = this.safeString (market, 'type');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            // check if a market is a spot or future market
            const symbol = (type === 'future') ? this.safeString (market, 'name') : (base + '/' + quote);
            const active = this.safeValue (market, 'enabled');
            const precision = {
                'amount': this.precisionFromString (this.safeString (market, 'sizeIncrement')),
                'price': this.precisionFromString (this.safeString (market, 'priceIncrement')),
            };
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'future': (type === 'future'),
                'spot': (type === 'spot'),
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.safeFloat (market, 'sizeIncrement'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.safeFloat (market, 'priceIncrement'),
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const symbol = market['symbol'];
        return {
            'symbol': symbol,
            'timestamp': this.safeInteger (ticker, 'time'),
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (market['info'], 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (market['info'], 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (market['info'], 'last'),
            'last': this.safeFloat (market['info'], 'last'),
            'previousClose': undefined,
            'change': this.safeFloat (ticker, 'change'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const marketType = this.safeString (market, 'type');
        if (marketType !== 'future') {
            throw new NotSupported (this.id + ' fetchTicker() supports futures markets only, see exchange.markets[symbol]["type"] for details');
        }
        const response = await this.publicGetFuturesMarket (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetMarketsMarketOrderbook (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseOrderBook (result);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCoins (params);
        const currencies = this.safeValue (response, 'result', []);
        //
        //     {
        //         "success":true,
        //         "result": [
        //             {"id":"BTC","name":"Bitcoin"},
        //             {"id":"ETH","name":"Ethereum"},
        //             {"id":"ETHMOON","name":"10X Long Ethereum Token","underlying":"ETH"},
        //             {"id":"EOSBULL","name":"3X Long EOS Token","underlying":"EOS"},
        //         ],
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': name,
                'active': undefined,
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

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletBalances (params);
        const balance = {};
        const result = this.safeValue (response, 'result', []);
        for (let i = 0; i < result.length; i++) {
            const code = this.safeCurrencyCode (result[i]['coin']);
            balance[code] = {};
            balance[code]['free'] = this.safeFloat (result[i]['free']);
            balance[code]['total'] = this.safeFloat (result[i]['total']);
        }
        return this.parseBalance (balance);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv['time'],
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            ohlcv['close'],
            ohlcv['volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketType = this.safeString (market, 'type');
        const request = {
            'market': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (marketType !== undefined && marketType === 'future') {  // check if it is a future market
            if (since !== undefined) {
                request['start_time'] = since;
            }
            const response = await this.publicGetFuturesMarketMarkCandles (this.extend (request, params));
            const result = this.safeValue (response, 'result', []);
            return this.parseOHLCVs (result, market, timeframe, since, limit);
        } else {
            const response = await this.publicGetMarketsMarketCandles (this.extend (request, params));
            const result = this.safeValue (response, 'result', []);
            return this.parseOHLCVs (result, market, timeframe, since, limit);
        }
    }

    parseTrade (trade, market = undefined) {
        const datetime = this.safeString (trade, 'time');
        const timestamp = this.parse8601 (datetime);
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        const id = this.safeString (market, 'id');
        const symbol = this.safeString (market, 'symbol');
        const orderId = this.safeString (trade, 'id');
        const side = this.safeString (trade, 'side');
        let cost = undefined;
        if (price !== undefined && amount !== undefined) {
            cost = price * amount;
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'cost': undefined,
                'currency': undefined,
                'rate': undefined,
            },
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeInteger (order, 'id');
        const datetime = this.safeString (order, 'createdAt');
        const timestamp = this.parse8601 (datetime);
        const filled = this.safeFloat (order, 'filledSize');
        const remaining = this.safeFloat (order, 'remainingSize');
        const symbol = this.findSymbol (this.safeString (order, 'market'));
        const status = this.safeString (order, 'status');
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const amount = this.safeFloat (order, 'size');
        let cost = undefined;
        if (filled !== undefined && amount !== undefined) {
            cost = filled * amount;
        }
        let price = 0;
        // determine if its a stop-loss order
        if (type === 'stop') {
            price = this.safeFloat (order, 'triggerPrice');
        } else {
            price = this.safeFloat (order, 'price');
        }
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': {
                'currency': undefined,
                'cost': undefined,
                'rate': undefined,
            },
            'trades': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const name = this.currency (code);
        const request = {
            'coin': name,
            'size': amount,
            'address': address,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostWalletWithdrawals (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side,
            'type': type,
            'size': amount,
        };
        let method = 'privatePostConditionalOrders';
        if ((type === 'limit') || (type === 'market')) {
            method = 'privatePostOrders';
            request['price'] = price;
        } else if ((type === 'stop') || (type === 'takeProfit')) {
            request['triggerPrice'] = price;
        } else if (type === 'trailingStop') {
            request['trailValue'] = price;
        } else {
            throw new InvalidOrder (this.id + ' createOrder () does not support order type ' + type + ', supported types: limit, market, stop, trailingStop, takeProfit');
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': parseInt (id),
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return result;
    }

    async cancelAllOrders (params = {}) {
        const response = await this.privateDeleteOrders (params);
        const result = this.safeValue (response, 'result', {});
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetWalletDepositAddressCoin (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        const tag = this.safeString (result, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': result,
        };
    }

    parseTransaction (transaction) {
        const currency = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currency);
        const id = this.safeInteger (transaction, 'id');
        const comment = this.safeString (transaction, 'notes');
        const amount = this.safeFloat (transaction, 'size');
        const status = this.safeString (transaction, 'status');
        const datetime = this.safeString (transaction, 'time');
        const timestamp = this.parse8601 (datetime);
        const txid = this.safeString (transaction, 'txid');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'tag');
        const fee = this.safeFloat (transaction, 'fee');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'comment': comment,
            'fee': {
                'currency': code,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetWalletDeposits (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseTransactions (result);
    }

    async fetchWithdrawals (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const response = await this.privateGetWalletWithdrawals (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        return this.parseTransactions (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if (method === 'GET') {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
            if (method === 'POST') {
                body = this.json (query);
                this.checkRequiredCredentials ();
                request = '/api' + request;
                const tx = this.milliseconds ();
                const hmacString = this.encode (tx + method + request + body);
                const secret = this.encode (this.secret);
                const signature = this.hmac (hmacString, secret, 'sha256');
                headers = {
                    'FTX-KEY': this.apiKey,
                    'FTX-TS': tx,
                    'FTX-SIGN': signature,
                    'content-type': 'application/json',
                };
            } else {
                this.checkRequiredCredentials ();
                request = '/api' + request;
                const tx = this.milliseconds ();
                const hmacString = tx + method + request;
                const secret = this.encode (this.secret);
                const signature = this.hmac (hmacString, secret, 'sha256');
                headers = {
                    'FTX-KEY': this.apiKey,
                    'FTX-TS': tx,
                    'FTX-SIGN': signature,
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        const success = this.safeValue (response, 'success');
        if (!success) {
            if (body[0] === '{') {
                const feedback = this.id + ' ' + this.json (response);
                throw new ExchangeError (feedback);
            }
        }
    }
};
