'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class lykke extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'lykke',
            'name': 'Lykke',
            'countries': [ 'CH' ],
            'version': 'v1',
            'rateLimit': 200,
            'has': {
                'CORS': false,
                'fetchOHLCV': false,
                'fetchTrades': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg',
                'api': {
                    'mobile': 'https://public-api.lykke.com/api',
                    'public': 'https://hft-api.lykke.com/api',
                    'private': 'https://hft-api.lykke.com/api',
                    'test': {
                        'mobile': 'https://public-api.lykke.com/api',
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
                        'Market/{market}',
                        'Trades/{AssetPairId}',
                    ],
                },
                'public': {
                    'get': [
                        'AssetPairs',
                        'AssetPairs/{id}',
                        'IsAlive',
                        'OrderBooks',
                        'OrderBooks/{AssetPairId}',
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
                    'maker': 0.0, // as of 7 Feb 2018, see https://github.com/ccxt/ccxt/issues/1863
                    'taker': 0.0, // https://www.lykke.com/cp/wallet-fees-and-limits
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

    parseTrade (trade, market) {
        //
        //  public fetchTrades
        //
        //   {
        //     "id": "d5983ab8-e9ec-48c9-bdd0-1b18f8e80a71",
        //     "assetPairId": "BTCUSD",
        //     "dateTime": "2019-05-15T06:52:02.147Z",
        //     "volume": 0.00019681,
        //     "index": 0,
        //     "price": 8023.333,
        //     "action": "Buy"
        //   }
        //
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (trade, 'AssetPairId');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market) {
            symbol = market['symbol'];
        }
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'dateTime'));
        let side = this.safeString (trade, 'action');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const cost = price * amount;
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 100;
        }
        const request = {
            'AssetPairId': market['id'],
            'skip': 0,
            'take': limit,
        };
        const response = await this.mobileGetTradesAssetPairId (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWallets (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'AssetId');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'Balance');
            account['used'] = this.safeFloat (balance, 'Reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrdersIdCancel ({ 'id': id });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const query = {
            'AssetPairId': market['id'],
            'OrderAction': this.capitalize (side),
            'Volume': amount,
        };
        if (type === 'market') {
            query['Asset'] = (side === 'buy') ? market['base'] : market['quote'];
        } else if (type === 'limit') {
            query['Price'] = price;
        }
        const method = 'privatePostOrders' + this.capitalize (type);
        const result = await this[method] (this.extend (query, params));
        return {
            'id': undefined,
            'info': result,
        };
    }

    async fetchMarkets (params = {}) {
        const markets = await this.publicGetAssetPairs ();
        //
        //     [ {                Id: "AEBTC",
        //                      Name: "AE/BTC",
        //                  Accuracy:  6,
        //          InvertedAccuracy:  8,
        //               BaseAssetId: "6f75280b-a005-4016-a3d8-03dc644e8912",
        //            QuotingAssetId: "BTC",
        //                 MinVolume:  0.4,
        //         MinInvertedVolume:  0.0001                                 },
        //       {                Id: "AEETH",
        //                      Name: "AE/ETH",
        //                  Accuracy:  6,
        //          InvertedAccuracy:  8,
        //               BaseAssetId: "6f75280b-a005-4016-a3d8-03dc644e8912",
        //            QuotingAssetId: "ETH",
        //                 MinVolume:  0.4,
        //         MinInvertedVolume:  0.001                                  } ]
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'Id');
            const name = this.safeString (market, 'Name');
            const [ baseId, quoteId ] = name.split ('/');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': this.safeInteger (market, 'Accuracy'),
                'price': this.safeInteger (market, 'InvertedAccuracy'),
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': true,
                'info': market,
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
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const close = this.safeFloat (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'volume24H'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const ticker = await this.mobileGetMarketMarket (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'Pending': 'open',
            'InOrderBook': 'open',
            'Processing': 'open',
            'Matched': 'closed',
            'Cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'AssetPairId');
            market = this.safeValue (this.markets_by_id, marketId);
        }
        if (market) {
            symbol = market['symbol'];
        }
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'LastMatchTime'));
        let timestamp = undefined;
        if (('Registered' in order) && (order['Registered'])) {
            timestamp = this.parse8601 (order['Registered']);
        } else if (('CreatedAt' in order) && (order['CreatedAt'])) {
            timestamp = this.parse8601 (order['CreatedAt']);
        }
        const price = this.safeFloat (order, 'Price');
        const amount = this.safeFloat (order, 'Volume');
        const remaining = this.safeFloat (order, 'RemainingVolume');
        const filled = amount - remaining;
        const cost = filled * price;
        const id = this.safeString (order, 'Id');
        return {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': undefined,
            'side': undefined,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetOrders (params);
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'status': 'InOrderBook',
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'status': 'Matched',
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        return this.parseOrders (response, undefined, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetOrderBooksAssetPairId (this.extend ({
            'AssetPairId': this.marketId (symbol),
        }, params));
        const orderbook = {
            'timestamp': undefined,
            'bids': [],
            'asks': [],
        };
        let timestamp = undefined;
        for (let i = 0; i < response.length; i++) {
            const side = response[i];
            if (side['IsBuy']) {
                orderbook['bids'] = this.arrayConcat (orderbook['bids'], side['Prices']);
            } else {
                orderbook['asks'] = this.arrayConcat (orderbook['asks'], side['Prices']);
            }
            const sideTimestamp = this.parse8601 (side['Timestamp']);
            timestamp = (timestamp === undefined) ? sideTimestamp : Math.max (timestamp, sideTimestamp);
        }
        return this.parseOrderBook (orderbook, timestamp, 'bids', 'asks', 'Price', 'Volume');
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = this.safeFloat (bidask, priceKey);
        let amount = this.safeFloat (bidask, amountKey);
        if (amount < 0) {
            amount = -amount;
        }
        return [ price, amount ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'mobile') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            }
            this.checkRequiredCredentials ();
            headers = {
                'api-key': this.apiKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
            if (method === 'POST') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
