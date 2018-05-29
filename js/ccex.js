'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ccex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ccex',
            'name': 'C-CEX',
            'countries': [ 'DE', 'EU' ],
            'rateLimit': 1500,
            'has': {
                'CORS': false,
                'fetchTickers': true,
                'fetchOrderBooks': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg',
                'api': {
                    'web': 'https://c-cex.com/t',
                    'public': 'https://c-cex.com/t/api_pub.html',
                    'private': 'https://c-cex.com/t/api.html',
                },
                'www': 'https://c-cex.com',
                'doc': 'https://c-cex.com/?id=api',
            },
            'api': {
                'web': {
                    'get': [
                        'coinnames',
                        '{market}',
                        'pairs',
                        'prices',
                        'volume_{coin}',
                    ],
                },
                'public': {
                    'get': [
                        'balancedistribution',
                        'markethistory',
                        'markets',
                        'marketsummaries',
                        'orderbook',
                        'fullorderbook',
                    ],
                },
                'private': {
                    'get': [
                        'buylimit',
                        'cancel',
                        'getbalance',
                        'getbalances',
                        'getopenorders',
                        'getorder',
                        'getorderhistory',
                        'mytrades',
                        'selllimit',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.2 / 100,
                    'maker': 0.2 / 100,
                },
            },
            'commonCurrencies': {
                'IOT': 'IoTcoin',
                'BLC': 'Cryptobullcoin',
                'XID': 'InternationalDiamond',
                'LUX': 'Luxmi',
                'CRC': 'CoreCoin',
            },
        });
    }

    async fetchMarkets () {
        let result = {};
        let response = await this.webGetPairs ();
        let markets = response['pairs'];
        for (let i = 0; i < markets.length; i++) {
            let id = markets[i];
            let [ baseId, quoteId ] = id.split ('-');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = base + '/' + quote;
            result[symbol] = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': id,
            };
        }
        // an alternative documented parser
        //     let markets = await this.publicGetMarkets ();
        //     for (let p = 0; p < markets['result'].length; p++) {
        //         let market = markets['result'][p];
        //         let id = market['MarketName'];
        //         let base = market['MarketCurrency'];
        //         let quote = market['BaseCurrency'];
        //         base = this.commonCurrencyCode (base);
        //         quote = this.commonCurrencyCode (quote);
        //         let symbol = base + '/' + quote;
        //         result.push ({
        //             'id': id,
        //             'symbol': symbol,
        //             'base': base,
        //             'quote': quote,
        //             'info': market,
        //         });
        //     }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetGetbalances ();
        let balances = response['result'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let code = balance['Currency'];
            let currency = this.commonCurrencyCode (code);
            let account = {
                'free': balance['Available'],
                'used': balance['Pending'],
                'total': balance['Balance'],
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'market': this.marketId (symbol),
            'type': 'both',
        };
        if (typeof limit !== 'undefined')
            request['depth'] = limit; // 100
        let response = await this.publicGetOrderbook (this.extend (request, params));
        let orderbook = response['result'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbooks = {};
        let response = await this.publicGetFullorderbook ();
        let types = Object.keys (response['result']);
        for (let i = 0; i < types.length; i++) {
            let type = types[i];
            let bidasks = response['result'][type];
            let bidasksByMarketId = this.groupBy (bidasks, 'Market');
            let marketIds = Object.keys (bidasksByMarketId);
            for (let j = 0; j < marketIds.length; j++) {
                let marketId = marketIds[j];
                let symbol = marketId.toUpperCase ();
                let side = type;
                if (symbol in this.markets_by_id) {
                    let market = this.markets_by_id[symbol];
                    symbol = market['symbol'];
                } else {
                    let [ base, quote ] = symbol.split ('-');
                    let invertedId = quote + '-' + base;
                    if (invertedId in this.markets_by_id) {
                        let market = this.markets_by_id[invertedId];
                        symbol = market['symbol'];
                    }
                }
                if (!(symbol in orderbooks))
                    orderbooks[symbol] = {};
                orderbooks[symbol][side] = bidasksByMarketId[marketId];
            }
        }
        let result = {};
        let keys = Object.keys (orderbooks);
        for (let k = 0; k < keys.length; k++) {
            let key = keys[k];
            result[key] = this.parseOrderBook (orderbooks[key], undefined, 'buy', 'sell', 'Rate', 'Quantity');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = ticker['updated'] * 1000;
        let symbol = undefined;
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let last = this.safeFloat (ticker, 'lastprice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'buy'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'sell'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'avg'),
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'buysupport'),
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.webGetPrices (params);
        let result = {};
        let ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let ticker = tickers[id];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                let uppercase = id.toUpperCase ();
                let [ base, quote ] = uppercase.split ('-');
                base = this.commonCurrencyCode (base);
                quote = this.commonCurrencyCode (quote);
                symbol = base + '/' + quote;
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.webGetMarket (this.extend ({
            'market': market['id'].toLowerCase (),
        }, params));
        let ticker = response['ticker'];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        let timestamp = this.parse8601 (trade['TimeStamp']);
        return {
            'id': trade['Id'].toString (),
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': trade['OrderType'].toLowerCase (),
            'price': trade['Price'],
            'amount': trade['Quantity'],
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarkethistory (this.extend ({
            'market': market['id'],
            'type': 'both',
            'depth': 100,
        }, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let method = 'privateGet' + this.capitalize (side) + type;
        let response = await this[method] (this.extend ({
            'market': this.marketId (symbol),
            'quantity': amount,
            'rate': price,
        }, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateGetCancel ({ 'uuid': id });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let query = this.keysort (this.extend ({
                'a': path,
                'apikey': this.apiKey,
                'nonce': nonce,
            }, params));
            url += '?' + this.urlencode (query);
            headers = { 'apisign': this.hmac (this.encode (url), this.encode (this.secret), 'sha512') };
        } else if (api === 'public') {
            url += '?' + this.urlencode (this.extend ({
                'a': 'get' + path,
            }, params));
        } else {
            url += '/' + this.implodeParams (path, params) + '.json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'web')
            return response;
        if ('success' in response)
            if (response['success'])
                return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
