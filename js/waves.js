'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class waves extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'waves',
            'name': 'Waves Exchange',
            'countries': ['CH'], // Switzerland
            'rateLimit': 500,
            'certified': true,
            'pro': false,
            'has': {
                'fetchOrderBook': true,
            },
            'timeframes': {},
            'urls': {
                'api': {
                    'public': 'http://matcher.waves.exchange',
                }
            },
            'api': {
                'public': {
                    'get': [
                        'matcher/orderbook',
                        'matcher/orderbook/{amountAsset}/{priceAsset}'
                    ]
                }
            },
            'commonCurrencies': {
                'WBTC': 'BTC',
                'WETH': 'ETH',
            }
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMatcherOrderbook (params);
        const markets = this.safeValue (response, 'markets');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const entry = markets[i];
            const baseId = this.safeString (entry, 'amountAssetName');
            const quoteId = this.safeString (entry, 'priceAssetName');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const baseAsset = this.safeString (entry, 'amountAsset');
            const quoteAsset = this.safeString (entry, 'priceAsset');
            const id = baseAsset + '/' + quoteAsset;
            const symbol = base + '/' + quote;
            const amountPrecision = this.safeValue (entry, 'amountAssetInfo');
            const pricePricision = this.safeValue (entry, 'priceAssetInfo');
            const precision = {
                'amount': this.safeInteger (amountPrecision, 'decimals'),
                'price': this.safeInteger (pricePricision, 'decimals'),
            };
            result.push ({
               'symbol': symbol,
               'id': id,
               'base': base,
               'quote': quote,
               'baseId': baseAsset,
               'quoteId': quoteAsset,
               'info': entry,
               'precision': precision,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'amountAsset': market['baseId'],
            'priceAsset': market['quoteId'],
        }, params);
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetMatcherOrderbookAmountAssetPriceAsset (request);
        const timestamp = this.safeInteger (response, 'timestamp');
        const bids = this.parseOrderBookSide (this.safeValue (response, 'bids'), market);
        const asks = this.parseOrderBookSide (this.safeValue (response, 'asks'), market);
        return {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        }
    }

    parseOrderBookSide (bookSide, market = undefined) {
        const precision = market['precision'];
        const amountPrecision = Math.pow (10, precision['amount']);
        const pricePrecision = Math.pow (10, precision['price']);
        const result = [];
        for (let i = 0; i < bookSide.length; i++) {
            const entry = bookSide[i];
            const price = this.safeInteger (entry, 'price', 0) / pricePrecision;
            const amount = this.safeInteger (entry, 'amount', 0) / amountPrecision;
            result.push ([price, amount]);
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        path = this.implodeParams (path, params);
        const url = this.urls['api'][api] + '/' + path;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
