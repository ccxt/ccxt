'use strict';

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

module.exports = class wazirx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'wazirx',
            'name': 'WazirX',
            'countries': ['IN'],
            'version': 'v2',
            'has': {
                'CORS': true,
                'publicAPI': true,
                'privateAPI': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchTicker': false,
                'fetchStatus': false,
                'fetchOHLCV': false,
                'fetchOrderBook': true,
                'fetchTrades': true,
            },
            'urls': {
                'logo': 'https://i0.wp.com/blog.wazirx.com/wp-content/uploads/2020/06/banner.png',
                'api': 'https://api.wazirx.com',
                'www': 'https://wazirx.com',
                'doc': 'https://github.com/WazirX/wazirx-api',
            },
            'api': {
                'public': {
                    'get': [
                        'market-status',
                        'tickers',
                        'depth',
                        'trades',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    '403': 'ab',
                },
            },
            'options': {
                'cachedMarketData': {},
            },
        });
    }

    async fetchMarketAndAssets () {
        const markets = this.safeValue (this.options['cachedMarketData'], 'markets');
        const assets = this.safeValue (this.options['cachedMarketData'], 'assets');
        if (markets !== undefined && assets !== undefined) {
            return this.options['cachedMarketData'];
        }
        const response = await this.publicGetMarketStatus ();
        this.options['cachedMarketData'] = response;
        return response;
    }

    async fetchMarkets (params = {}) {
        const marketAndAssets = await this.fetchMarketAndAssets ();
        const markets = marketAndAssets['markets'];
        //      {
        //             "baseMarket": "btc",
        //             "quoteMarket": "inr",
        //             "minBuyAmount": 0.001,
        //             "minSellAmount": 0.001,
        //             "fee": {
        //                 "bid": {
        //                     "maker": 0.001,
        //                     "taker": 0.0025
        //                 },
        //                 "ask": {
        //                     "maker": 0.001,
        //                     "taker": 0.0025
        //                 }
        //             },
        //             "basePrecision": 4,
        //             "quotePrecision": 2,
        //             "low": "460001.01",
        //             "high": "505000.0",
        //             "last": "480102.0",
        //             "open": 505002,
        //             "volume": "0.2071",
        //             "sell": "490000.0",
        //             "buy": "485001.0",
        //             "type": "SPOT"
        //             "Status": "active"
        //       },
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const baseId = this.safeString (market, 'baseMarket');
            const quoteId = this.safeString (market, 'quoteMarket');
            let id = undefined;
            if (baseId !== undefined && quoteId !== undefined) {
                id = baseId + quoteId;
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = undefined;
            if (base !== undefined && quote !== undefined) {
                symbol = base + '/' + quote;
            }
            const status = this.safeValue (market, 'status') === 'active' ? true : false;
            const makerAndTakerFee = this.computeMakerAndTakerFee (market);
            const minBuyAmount = this.safeFloat (market, 'minBuyAmount');
            const minSellAmount = this.safeFloat (market, 'minSellAmount');
            const minAmount = minBuyAmount > minSellAmount ? minSellAmount : minBuyAmount;
            const precision = {
                'amount': this.safeInteger (market, 'quotePrecision'),
            };
            const limits = {
                'amount': {
                    'min': minAmount,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': status,
                'taker': makerAndTakerFee['taker'],
                'maker': makerAndTakerFee['maker'],
                'percentage': true,
                'tierBased': false,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const marketAndAssets = await this.fetchMarketAndAssets ();
        const assets = marketAndAssets['assets'];
        //
        //        {
        //             "type": "inr",
        //             "name": "Rupee",
        //             "withdrawFee": 0,
        //             "minWithdrawAmount": 50,
        //             "maxWithdrawAmount": 50000,
        //             "minDepositAmount": 500,
        //             "confirmation": 5,
        //             "deposit": "enabled",
        //             "withdrawal": "enabled"
        //       },
        //
        const result = {};
        for (let i = 0; i < assets.length; i++) {
            const currency = assets[i];
            const id = this.safeString (currency, 'type');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const fee = this.safeFloat (currency, 'withdrawFee');
            const minWithdrawAmount = this.safeFloat (currency, 'minWithdrawAmount');
            const maxWithdrawAmount = this.safeFloat (currency, 'maxWithdrawAmount');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'fee': fee,
                'info': currency,
                'limits': {
                    'withdraw': { 'min': minWithdrawAmount, 'max': maxWithdrawAmount },
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickers = await this.publicGetTickers ();
        // {
        //     "btcinr": {
        //         "base_unit": "btc",
        //         "quote_unit": "inr",
        //         "low": "472005.0",
        //         "high": "508102.0",
        //         "last": "508100.0",
        //         "open": 490000,
        //         "volume": "0.2709",
        //         "sell": "508100.0",
        //         "buy": "481000.0",
        //         "name": "BTC/INR",
        //         "at": 1536732262
        //     },
        //     ...
        // }
        //
        const tickerIds = Object.keys (tickers);
        const result = {};
        for (let i = 0; i < tickerIds.length; i++) {
            const ticker = tickers[tickerIds[i]];
            const low = this.safeFloat (ticker, 'low');
            const high = this.safeFloat (ticker, 'high');
            const last = this.safeFloat (ticker, 'last');
            const open = this.safeFloat (ticker, 'open');
            const volume = this.safeFloat (ticker, 'volume');
            const ask = this.safeFloat (ticker, 'sell');
            const bid = this.safeFloat (ticker, 'buy');
            const timestamp = this.safeTimestamp (ticker, 'at');
            let change = undefined;
            let average = undefined;
            let percentage = undefined;
            if (last !== undefined && open !== undefined) {
                change = last - open;
                average = this.sum (last, open) / 2;
            }
            if (change !== undefined && open) {
                percentage = (change / open) * 100;
            }
            let symbol = undefined;
            const name = this.safeString (ticker, 'name');
            if (name !== undefined) {
                if (name in this.markets_by_id) {
                    const market = this.markets_by_id[name];
                    symbol = market['symbol'];
                } else {
                    const [baseId, quoteId] = name.split ('/');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            } else {
                const baseId = this.safeString (ticker, 'base_unit');
                const quoteId = this.safeString (ticker, 'quote_unit');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
            result[symbol] = {
                'symbol': symbol,
                'info': ticker,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': high,
                'low': low,
                'bid': bid,
                'bidVolume': undefined,
                'ask': ask,
                'askVolume': undefined,
                'vwap': undefined,
                'open': open,
                'close': last,
                'last': last,
                'previousClose': undefined,
                'change': change,
                'percentage': percentage,
                'average': average,
                'baseVolume': volume,
                'quoteVolume': undefined,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'market': undefined,
        };
        if (market !== undefined && this.safeString (market, 'id') !== undefined) {
            request = {
                'market': market['id'],
            };
        }
        const response = await this.publicGetDepth (this.extend (request, params));
        //
        //     {
        //          "timestamp":1559561187,
        //          "asks":[
        //                     ["8540.0","1.5"],
        //                     ["8541.0","0.0042"]
        //                 ],
        //          "bids":[
        //                     ["8530.0","0.8814"],
        //                     ["8524.0","1.4"]
        //                 ]
        //      }
        //
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, timestamp);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'market': undefined,
        };
        if (market !== undefined && this.safeString (market, 'id') !== undefined) {
            request = {
                'market': market['id'],
            };
        }
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        // [
        //     {
        //         "id": 1302646,
        //         "price": "8530.0",
        //         "volume": "0.3207",
        //         "funds": "2735.571",
        //         "market": "btcusdt",
        //         "created_at": "2019-06-03T17:03:41+05:30",
        //         "side": null
        //     }
        // ]
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const datetime = this.iso8601 (timestamp);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'side');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'volume');
        const cost = this.safeFloat (trade, 'funds');
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'order': id,
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': {
                'cost': undefined,
                'currency': undefined,
            },
        };
    }

    computeMakerAndTakerFee (market) {
        const fee = this.safeValue (market, 'fee');
        if (fee === undefined) {
            return {
                'maker': 0,
                'taker': 0,
            };
        }
        let bidMakerFee = 0;
        let askMakerFee = 0;
        let bidTakerFee = 0;
        let askTakerFee = 0;
        const bid = this.safeValue (fee, 'bid');
        if (bid !== undefined && bid !== 0) {
            bidMakerFee = this.safeFloat (bid, 'maker');
            if (bidMakerFee === undefined) {
                bidMakerFee = 0;
            }
            bidTakerFee = this.safeFloat (bid, 'taker');
            if (bidTakerFee === undefined) {
                bidTakerFee = 0;
            }
        }
        const ask = this.safeValue (fee, 'ask');
        if (ask !== undefined && ask !== 0) {
            askMakerFee = this.safeFloat (ask, 'maker');
            if (askMakerFee === undefined) {
                askMakerFee = 0;
            }
            askTakerFee = this.safeFloat (ask, 'taker');
            if (askTakerFee === undefined) {
                askTakerFee = 0;
            }
        }
        return {
            'maker': bidMakerFee * 0.5 + askMakerFee * 0.5,
            'taker': bidTakerFee * 0.5 + askTakerFee * 0.5,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/api' + '/' + this.version + '/' + path;
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody) {
        if (statusCode !== 200) {
            const feedback = this.id + ' ' + responseBody;
            throw new ExchangeError (feedback);
        }
    }
};
