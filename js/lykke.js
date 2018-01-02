"use strict";

//  ---------------------------------------------------------------------------

var Exchange = require ('./base/Exchange')
var { ExchangeError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class lykke extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lykke',
            'name': 'Lykke',
            'countries': 'CH',
            'version': 'v1',
            'rateLimit': 200,
            'hasCORS': false,
            // obsolete metainfo interface
            'hasFetchTrades': false,
            'hasFetchOHLCV': false,
            // new metainfo interface
            'has': {
                'fetchOHLCV': false,
                'fetchTrades': false,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg',
                'api': {
                    'mobile': 'https://api.lykkex.com/api',
                    'public': 'https://hft-api.lykke.com/api',
                    'private': 'https://hft-api.lykke.com/api',
                    'test': {
                        'mobile': 'https://api.lykkex.com/api',
                        'public': 'https://hft-service-dev.lykkex.net/api',
                        'private': 'https://hft-service-dev.lykkex.net/api',
                    },
                },
                'www': 'https://www.lykke.com',
                'doc': [
                    'https://hft-api.lykke.com/swagger/ui/',
                    'https://www.lykke.com/lykke_api',
                ],
                'fees': 'https://www.lykke.com/trading-conditions',
            },
            'api': {
                'mobile': {
                    'get': [
                        'AllAssetPairRates/{market}',
                    ]
                },
                'public': {
                    'get': [
                        'AssetPairs',
                        'AssetPairs/{id}',
                        'IsAlive',
                        'OrderBooks',
                        'OrderBooks/{AssetPairId}'
                    ],
                },
                'private': {
                    'get': [
                        'Orders',
                        'Orders/{id}',
                        'Wallets',
                    ],
                    'post': [
                        'Orders/limit',
                        'Orders/market',
                        'Orders/{id}/Cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.0010,
                    'taker': 0.0019,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.001,
                    },
                    'deposit': {
                        'BTC': 0,
                    },
                },
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetWallets ();
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let currency = balance['AssetId'];
            let total = balance['Balance'];
            let used = balance['Reserved'];
            let free = total - used;
            result[currency] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return this.parseBalance (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrdersIdCancel ({ 'id': id });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let query = {
            'AssetPairId': market['id'],
            'OrderAction': this.capitalize (side),
            'Volume': amount,
        };
        if (type == 'market') {
            query['Asset'] = (side == 'buy') ? market['base'] : market['quote'];
        } else if (type == 'limit') {
            query['Price'] = price;
        }
        let method = 'privatePostOrders' + this.capitalize (type);
        let result = await this[method] (this.extend (query, params));
        return {
            'id': undefined,
            'info': result,
        };
    }

    async fetchMarkets () {
        let markets = await this.publicGetAssetPairs ();
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['Id'];
            let base = market['BaseAssetId'];
            let quote = market['QuotingAssetId'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            let symbol = market['Name'];
            let precision = {
                'amount': market['Accuracy'],
                'price': market['InvertedAccuracy'],
            };
            result.push (this.extend (this.fees['trading'], {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'info': market,
                'lot': Math.pow (10, -precision['amount']),
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': Math.pow (10, precision['amount']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                },
            }));
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        ticker = ticker['Result'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['Rate']['Bid']),
            'ask': parseFloat (ticker['Rate']['Ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.mobileGetAllAssetPairRatesMarket (this.extend ({
            'market': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseOrder (order, market = undefined) {
        let result = {
            'id': order['Id'],
            'datetime': order['LastMatchTime'],
            'timestamp': undefined,
            'status': order['Status'],
            'symbol': undefined,
            'side': undefined,
            'amount': parseFloat (order['Volume']),
            'price': parseFloat (order['Price']),
            'info': order,
        };
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let response = await this.privateGetOrdersId (this.extend ({
            'id': id,
        }, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.privateGetOrders ();
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.privateGetOrders (this.extend ({
            'status': 'InOrderBook',
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.privateGetOrders (this.extend ({
            'status': 'Matched',
        }, params));
    }

    async fetchOrderBook (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetOrderBooksAssetPairId (this.extend ({
            'AssetPairId': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined);
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'bids', asksKey = 'asks', priceKey = 0, amountKey = 1) {
        timestamp = timestamp || this.milliseconds ();
        let bids = [];
        let asks = [];
        for (let i = 0; i < orderbook.length; i++) {
            let side = orderbook[i];
            if (side['IsBuy']) {
                for (let j = 0; j < side['Prices'].length; j++) {
                    let entry = side['Prices'][j];
                    bids.push ([
                        parseFloat (entry['Price']),
                        parseFloat (entry['Volume']),
                    ]);
                }
            } else {
                for (let j = 0; j < side['Prices'].length; j++) {
                    let entry = side['Prices'][j];
                    asks.push ([
                        parseFloat (entry['Price']),
                        parseFloat (-entry['Volume']),
                    ]);
                }
            }
        }
        return {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api == 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else if (api == 'private') {
            if (method == 'GET')
                if (Object.keys (query).length)
                    url += '?' + this.urlencode (query);
            this.checkRequiredCredentials ();
            headers = {
                'api-key': this.apiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
            if (method == 'POST')
                if (Object.keys (params).length)
                    body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

}
