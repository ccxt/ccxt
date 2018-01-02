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
            'countries': [ 'CH' ],
            'hasFetchTrades': false,
            'urls': {
                'logo': 'https://www.lykke.com/favicon.ico',
                'api': {
                    'mobile': 'https://api.lykkex.com/api',
                    'public': 'https://hft-api.lykke.com/api',
                    'private': 'https://hft-api.lykke.com/api',
                    't_public': 'https://hft-service-dev.lykkex.net/api',
                    't_private': 'https://hft-service-dev.lykkex.net/api',
                },
                'www': 'https://www.lykke.com',
                'doc': [
                    'https://www.lykke.com/lykke_api',
                ],
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
        });
    }

    async fetchBalance () {
        let balance = {
            'free': {},
            'used': {},
            'total': {},
            'info': await this.privateGetWallets (),
        };
        for (let i = 0;i < balance['info'].length; i++) {
            let assetInfo = balance['info'][i];
            balance[assetInfo['AssetId']] = {
                'free': undefined,
                'used': assetInfo['Reserved'],
                'total': assetInfo['Balance'],
            };
            let assetBalance = balance[assetInfo['AssetId']];
            assetBalance['free'] = assetBalance['total'] - assetBalance['used'];
            balance['total'][assetInfo['AssetId']] = assetBalance['total'];
            balance['free'][assetInfo['AssetId']] = assetBalance['free'];
            balance['used'][assetInfo['AssetId']] = assetBalance['used'];
        }
        return balance;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        return await this.privatePostOrdersIdCancel ({'id': id});
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let action = undefined;
        if (side == 'buy') {
            action = 'Buy';
        } else if (side == 'sell') {
            action = 'Sell';
        }
        let query = {
            'AssetPairId': market['id'],
            'OrderAction': action,
            'Volume': amount,
        };
        if (type == 'market') {
            if (side == 'buy') {
                query['Asset'] = market['base'];
            }
            if (side == 'sell') {
                query['Asset'] = market['quote'];
            }
            let result = await this.privatePostOrdersMarket (
                this.extend (query, params)
            );
        } else if (type == 'limit') {
            query['Price'] = price;
            let result = await this.privatePostOrdersLimit (
                this.extend (query, params)
            );
            return {
                'id': result,
                'info': result,
            };
        }
    }

    async fetchMarkets () {
        let markets = await this.publicGetAssetPairs ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['Id'];
            let symbol = market['Name'];
            let base = market['BaseAssetId'];
            let quote = market['QuotingAssetId'];
            base = this.commonCurrencyCode (base);
            quote = this.commonCurrencyCode (quote);
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            });
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
        let pair = market['id'];
        let ticker = await this.mobileGetAllAssetPairRatesMarket(
            this.extend({'market': pair}, params)
        );
        return (this.parseTicker(ticker, market));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        let request = {
            'id': id
        };
        let response = await this.privateGetOrdersId (this.extend (request, params));
        let result = {
            'id': response['Id'],
            'datetime': response['LastMatchTime'],
            'timestamp': undefined,
            'status': response['Status'],
            'symbol': undefined,
            'side': undefined,
            'amount': parseFloat (response['Volume']),
            'price': parseFloat (response['Price']),
            'info': response,
        };
        return result;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.privateGetOrders();
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.privateGetOrders(this.extend ({
            'status': 'InOrderBook'
        }, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.privateGetOrders(this.extend ({
            'status': 'Matched'
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
        for (let i=0; i<orderbook.length; i++) {
            let side = orderbook[i];
            if (side['IsBuy']) {
                for (let j=0;j<side["Prices"].length;j++) {
                    let entry = side["Prices"][j];
                    bids.push ([parseFloat (entry["Price"]), parseFloat (entry["Volume"])]);
                }
            } else {
                for (let j=0; j<side["Prices"].length; j++) {
                    let entry = side["Prices"][j];
                    asks.push ([parseFloat (entry["Price"]), parseFloat (-entry["Volume"])]);
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
        let url = this.urls['api'][api];
        url += '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        if (api == 'private') {
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
