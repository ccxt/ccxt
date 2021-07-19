'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const Precise = require ('./base/Precise');

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
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchTrades': true,
                'fetchMyTrades': true,
                'createOrder': true,
                'cancelOrder': true,
                'cancelAllOrders': true,
                'fetchBalance': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
            },
            'timeframes': {
                '1m': 'Minute',
                '5m': 'Min5',
                '15m': 'Min15',
                '30m': 'Min30',
                '1h': 'Hour',
                '4h': 'Hour4',
                '6h': 'Hour6',
                '12h': 'Hour12',
                '1d': 'Day',
                '1w': 'Week',
                '1M': 'Month',
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
                },
                'test': {
                    'mobile': 'https://public-api.lykke.com/api',
                    'public': 'https://hft-service-dev.lykkex.net/api',
                    'private': 'https://hft-service-dev.lykkex.net/api',
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
                        'AssetPairs/rate',
                        'AssetPairs/rate/{assetPairId}',
                        'AssetPairs/dictionary/{market}',
                        'Assets/dictionary',
                        'Candles/history/{market}/available',
                        'Candles/history/{market}/{assetPair}/{period}/{type}/{from}/{to}',
                        'Company/ownershipStructure',
                        'Company/registrationsCount',
                        'IsAlive',
                        'Market',
                        'Market/{market}',
                        'Market/capitalization/{market}',
                        'OrderBook',
                        'OrderBook/{assetPairId}',
                        'Trades/{AssetPairId}',
                        'Trades/Last/{assetPair}/{n}',
                    ],
                    'post': [
                        'AssetPairs/rate/history',
                        'AssetPairs/rate/history/{assetPairId}',
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
                        'History/trades',
                    ],
                    'post': [
                        'Orders/limit',
                        'Orders/market',
                        'Orders/{id}/Cancel',
                        'Orders/v2/market',
                        'Orders/v2/limit',
                        'Orders/stoplimit',
                        'Orders/bulk',
                    ],
                    'delete': [
                        'Orders',
                        'Orders/{id}',
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
            'commonCurrencies': {
                'CAN': 'CanYaCoin',
                'XPD': 'Lykke XPD',
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
        //  private fetchMyTrades
        //     {
        //         Id: '3500b83c-9963-4349-b3ee-b3e503073cea',
        //         OrderId: '83b50feb-8615-4dc6-b606-8a4168ecd708',
        //         DateTime: '2020-05-19T11:17:39.31+00:00',
        //         Timestamp: '2020-05-19T11:17:39.31+00:00',
        //         State: null,
        //         Amount: -0.004,
        //         BaseVolume: -0.004,
        //         QuotingVolume: 39.3898,
        //         Asset: 'BTC',
        //         BaseAssetId: 'BTC',
        //         QuotingAssetId: 'USD',
        //         AssetPair: 'BTCUSD',
        //         AssetPairId: 'BTCUSD',
        //         Price: 9847.427,
        //         Fee: { Amount: null, Type: 'Unknown', FeeAssetId: null }
        //     },
        const marketId = this.safeString (trade, 'AssetPairId');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString2 (trade, 'id', 'Id');
        const orderId = this.safeString (trade, 'OrderId');
        const timestamp = this.parse8601 (this.safeString2 (trade, 'dateTime', 'DateTime'));
        const priceString = this.safeString2 (trade, 'price', 'Price');
        let amountString = this.safeString2 (trade, 'volume', 'Amount');
        let side = this.safeStringLower (trade, 'action');
        if (side === undefined) {
            side = (amountString[0] === '-') ? 'sell' : 'buy';
        }
        amountString = Precise.stringAbs (amountString);
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const fee = {
            'cost': 0, // There are no fees for trading. https://www.lykke.com/wallet-fees-and-limits/
            'currency': market['quote'],
        };
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': orderId,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
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

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (limit !== undefined) {
            request['take'] = limit; // How many maximum items have to be returned, max 1000 default 100.
        }
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['assetPairId'] = market['id'];
        }
        const response = await this.privateGetHistoryTrades (this.extend (request, params));
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
            account['total'] = this.safeString (balance, 'Balance');
            account['used'] = this.safeString (balance, 'Reserved');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        const request = { 'id': id };
        return await this.privateDeleteOrdersId (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['assetPairId'] = market['id'];
        }
        return await this.privateDeleteOrders (this.extend (request, params));
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const query = {
            'AssetPairId': market['id'],
            'OrderAction': this.capitalize (side),
            'Volume': amount,
            'Asset': market['baseId'],
        };
        if (type === 'limit') {
            query['Price'] = price;
        }
        const method = 'privatePostOrdersV2' + this.capitalize (type);
        const result = await this[method] (this.extend (query, params));
        //
        // market
        //
        //     {
        //         "Price": 0
        //     }
        //
        // limit
        //
        //     {
        //         "Id":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        //     }
        //
        const id = this.safeString (result, 'Id');
        price = this.safeNumber (result, 'Price');
        return {
            'id': id,
            'info': result,
            'clientOrderId': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
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
            const pricePrecision = this.safeString (market, 'Accuracy');
            const priceLimit = this.parsePrecision (pricePrecision);
            const precision = {
                'price': parseInt (pricePrecision),
                'amount': this.safeInteger (market, 'InvertedAccuracy'),
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
                        'min': this.safeNumber (market, 'MinVolume'),
                        'max': undefined,
                    },
                    'price': {
                        'min': this.parseNumber (priceLimit),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'MinInvertedVolume'),
                        'max': undefined,
                    },
                },
                'baseId': undefined,
                'quoteId': undefined,
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
        const close = this.safeNumber (ticker, 'lastPrice');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeNumber (ticker, 'ask'),
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
            'quoteVolume': this.safeNumber (ticker, 'volume24H'),
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
            'Open': 'open',
            'Pending': 'open',
            'InOrderBook': 'open',
            'Processing': 'open',
            'Matched': 'closed',
            'Cancelled': 'canceled',
            'Rejected': 'rejected',
            'Replaced': 'canceled',
            'Placed': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        //     {
        //         "Id": "string",
        //         "Status": "Unknown",
        //         "AssetPairId": "string",
        //         "Volume": 0,
        //         "Price": 0,
        //         "RemainingVolume": 0,
        //         "LastMatchTime": "2020-03-26T20:58:50.710Z",
        //         "CreatedAt": "2020-03-26T20:58:50.710Z",
        //         "Type": "Unknown",
        //         "LowerLimitPrice": 0,
        //         "LowerPrice": 0,
        //         "UpperLimitPrice": 0,
        //         "UpperPrice": 0
        //     }
        //
        const status = this.parseOrderStatus (this.safeString (order, 'Status'));
        const marketId = this.safeString (order, 'AssetPairId');
        const symbol = this.safeSymbol (marketId, market);
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'LastMatchTime'));
        let timestamp = undefined;
        if (('Registered' in order) && (order['Registered'])) {
            timestamp = this.parse8601 (order['Registered']);
        } else if (('CreatedAt' in order) && (order['CreatedAt'])) {
            timestamp = this.parse8601 (order['CreatedAt']);
        }
        const price = this.safeNumber (order, 'Price');
        let side = undefined;
        let amount = this.safeNumber (order, 'Volume');
        if (amount < 0) {
            side = 'sell';
            amount = Math.abs (amount);
        } else {
            side = 'buy';
        }
        const remaining = Math.abs (this.safeNumber (order, 'RemainingVolume'));
        const id = this.safeString (order, 'Id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': undefined,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        });
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
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'InOrderBook',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'Matched',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
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
        return this.parseOrderBook (orderbook, symbol, timestamp, 'bids', 'asks', 'Price', 'Volume');
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        const price = this.safeNumber (bidask, priceKey);
        let amount = this.safeNumber (bidask, amountKey);
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
            if ((method === 'GET') || (method === 'DELETE')) {
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
