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
                'BLC': 'Cryptobullcoin',
                'CRC': 'CoreCoin',
                'IOT': 'IoTcoin',
                'LUX': 'Luxmi',
                'VIT': 'VitalCoin',
                'XID': 'InternationalDiamond',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const result = {};
        const response = await this.webGetPairs (params);
        const markets = this.safeValue (response, 'pairs');
        for (let i = 0; i < markets.length; i++) {
            const id = markets[i];
            const [ baseId, quoteId ] = id.split ('-');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            const symbol = base + '/' + quote;
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
        const response = await this.privateGetGetbalances (params);
        const balances = this.safeValue (response, 'result');
        const result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'Currency');
            const code = this.commonCurrencyCode (currencyId);
            const account = {
                'free': this.safeFloat (balance, 'Available'),
                'used': this.safeFloat (balance, 'Pending'),
                'total': this.safeFloat (balance, 'Balance'),
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'market': this.marketId (symbol),
            'type': 'both',
        };
        if (limit !== undefined) {
            request['depth'] = limit; // 100
        }
        const response = await this.publicGetOrderbook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'result');
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 'Rate', 'Quantity');
    }

    async fetchOrderBooks (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const orderbooks = {};
        const response = await this.publicGetFullorderbook ();
        const sides = Object.keys (response['result']);
        for (let i = 0; i < sides.length; i++) {
            const side = sides[i];
            const bidasks = response['result'][side];
            const bidasksByMarketId = this.groupBy (bidasks, 'Market');
            const marketIds = Object.keys (bidasksByMarketId);
            for (let j = 0; j < marketIds.length; j++) {
                const marketId = marketIds[j];
                let symbol = marketId;
                if (marketId in this.markets_by_id) {
                    const market = this.markets_by_id[symbol];
                    symbol = market['symbol'];
                } else {
                    const [ baseId, quoteId ] = symbol.split ('-');
                    const invertedId = quoteId + '-' + baseId;
                    if (invertedId in this.markets_by_id) {
                        const market = this.markets_by_id[invertedId];
                        symbol = market['symbol'];
                    }
                }
                if (!(symbol in orderbooks)) {
                    orderbooks[symbol] = {};
                }
                orderbooks[symbol][side] = bidasksByMarketId[marketId];
            }
        }
        const result = {};
        const keys = Object.keys (orderbooks);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            result[key] = this.parseOrderBook (orderbooks[key], undefined, 'buy', 'sell', 'Rate', 'Quantity');
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeInteger (ticker, 'updated');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'lastprice');
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
        const response = await this.webGetPrices (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const ticker = response[id];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                const uppercase = id.toUpperCase ();
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
        const market = this.market (symbol);
        const request = {
            'market': market['id'].toLowerCase (),
        };
        const response = await this.webGetMarket (this.extend (request, params));
        const ticker = this.safeValue (response, 'ticker');
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        const timestamp = this.parse8601 (this.safeString (trade, 'TimeStamp'));
        const id = this.safeString (trade, 'id');
        let side = this.safeString (trade, 'OrderType');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const price = this.safeFloat (trade, 'Price');
        const amount = this.safeFloat (trade, 'Quantity');
        let cost = undefined;
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = amount * price;
            }
        }
        return {
            'id': id,
            'info': trade,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'type': 'both',
            'depth': 100,
        };
        const response = await this.publicGetMarkethistory (this.extend (request, params));
        return this.parseTrades (response['result'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const method = 'privateGet' + this.capitalize (side) + type;
        const request = {
            'market': this.marketId (symbol),
            'quantity': amount,
            'rate': price,
        };
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['result']['uuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'uuid': id,
        };
        return await this.privateGetCancel (this.extend (request, params));
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            const query = this.keysort (this.extend ({
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
        const response = await this.fetch2 (path, api, method, params, headers, body);
        if (api === 'web') {
            return response;
        }
        if ('success' in response) {
            if (response['success']) {
                return response;
            }
        }
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }
};
