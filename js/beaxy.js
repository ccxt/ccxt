'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class beaxy extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'beaxy',
            'name': 'Beaxy',
            'countries': [ 'US' ],
            'rateLimit': 500,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': false,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchOHLCV': true,
            },
            'timeframes': {
                '1m': 'MINUTE',
                '5m': 'MINUTE5',
                '15m': 'MINUTE15',
                '30m': 'MINUTE30',
                '1h': 'HOUR',
                '4h': 'HOUR4',
                '8h': 'HOUR8',
                '1d': 'DAY',
                '1w': 'WEEK',
            },
            'urls': {
                'api': {
                    'public': 'https://services.beaxy.com/api/v2',
                },
                'www': 'https://beaxy.com',
                'doc': 'https://beaxyapiv2.docs.apiary.io',
            },
            'api': {
                'public': {
                    'get': [
                        'symbols',
                        'currencies',
                        'symbols/rates',
                        'symbols/{market}/rate',
                        'symbols/{market}/trades',
                        'symbols/{market}/chart',
                        'symbols/{market}/book',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetSymbols (params);
        //
        // [{
        //     symbol: "ETCBTC",
        //     name: "ETCBTC",
        //     minimumQuantity: 0.01,
        //     maximumQuantity: 2509.41,
        //     quantityIncrement: 1e-7,
        //     quantityPrecision: 7,
        //     tickSize: 1e-7,
        //     baseCurrency: "ETC",
        //     termCurrency: "BTC",
        //     pricePrecision: 7,
        //     suspendedForTrading: false
        // }]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const id = this.safeString (market, 'name');
            const uuid = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseCurrency');
            const quoteId = this.safeString (market, 'termCurrency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const suspended = this.safeValue (market, 'suspendedForTrading', false);
            const precision = {
                'amount': this.safeInteger (market, 'quantityPrecision'),
                'price': this.safeInteger (market, 'pricePrecision'),
            };
            const entry = {
                'id': id,
                'uuid': uuid,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'active': !suspended,
            };
            result.push (entry);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        // [
        //     {
        //        "currency":"BXY",
        //        "name":"Beaxy Coin",
        //        "precision":8,
        //        "dailyDepositThreshold":1.0E9,
        //        "dailyWithdrawalThreshold":250000.0,
        //        "weeklyDepositThreshold":1.0E9,
        //        "weeklyWithdrawalThreshold":2.0E7,
        //        "monthlyDepositThreshold":1.0E9,
        //        "monthlyWithdrawalThreshold":5.0E7,
        //        "dailyDepositLimit":1.0E9,
        //        "dailyWithdrawalLimit":250000.0,
        //        "weeklyDepositLimit":1.0E9,
        //        "weeklyWithdrawalLimit":2.0E7,
        //        "monthlyDepositLimit":1.0E9,
        //        "monthlyWithdrawalLimit":5.0E7,
        //        "minimalWithdrawal":875.0,
        //        "type":"crypto"
        //     }
        // ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const code = this.safeString (currency, 'currency');
            const precision = this.safeInteger (currency, 'precision');
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': code,
                'code': code,
                'name': name,
                'active': true,
                'fee': undefined,
                'precision': precision,
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

    parseTrade (trade, market = undefined) {
        const side = this.safeString (trade, 'side');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if ((price !== undefined) && (amount !== undefined)) {
            cost = price * amount;
        }
        let symbol = undefined;
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': undefined,
            'order': undefined,
            'type': undefined,
            'takerOrMaker': undefined,
            'side': side.toLowerCase (),
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetSymbolsMarketTrades (this.extend (request, params));
        //
        // [
        //     {
        //        "price":8.3E-7,
        //        "size":27019.0,
        //        "side":"BUY",
        //        "timestamp":1593082296713
        //     }
        //  ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.publicGetSymbolsMarketRate (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetSymbolsRates (params);
        const result = {};
        const ids = Object.keys (response);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = this.markets_by_id[id];
            const symbol = market['symbol'];
            const ticker = response[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //    "ETCBTC":{
        //       "ask":6.67E-4,
        //       "bid":6.63E-4,
        //       "low24":6.57E-4,
        //       "high24":6.71E-4,
        //       "volume24":26.6879096,
        //       "change24":-0.4491017964071856,
        //       "price":6.62E-4,
        //       "volume":0.8439548,
        //       "timestamp":1593183000000
        //    }
        // }
        //
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high24'),
            'low': this.safeFloat (ticker, 'low24'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume24'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        //
        // {
        //    "symbol":"ETHBTC",
        //    "barType":"MINUTE5",
        //    "bars":[
        //       {
        //          "closeAsk":0.025308,
        //          "closeBid":0.025289,
        //          "highAsk":0.025319,
        //          "highBid":0.0253,
        //          "highMid":0.0253095,
        //          "lowAsk":0.025294,
        //          "lowBid":0.02527,
        //          "lowMid":0.025282,
        //          "openAsk":0.025294,
        //          "openBid":0.025274,
        //          "volume":0.0,
        //          "time":1593034200000
        //       }
        //    ]
        // }
        //
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'barType': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['count'] = limit;
        }
        const response = await this.publicGetSymbolsMarketChart (this.extend (request, params));
        const result = this.safeValue (response, 'bars', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //       "closeAsk":0.025308,
        //       "closeBid":0.025289,
        //       "highAsk":0.025319,
        //       "highBid":0.0253,
        //       "highMid":0.0253095,
        //       "lowAsk":0.025294,
        //       "lowBid":0.02527,
        //       "lowMid":0.025282,
        //       "openAsk":0.025294,
        //       "openBid":0.025274,
        //       "volume":0.0,
        //       "time":1593034200000
        //    }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'openBid'),
            this.safeFloat (ohlcv, 'highBid'),
            this.safeFloat (ohlcv, 'lowBid'),
            this.safeFloat (ohlcv, 'closeBid'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'depth': 20,
        };
        const response = await this.publicGetSymbolsMarketBook (this.extend (request, params));
        //
        // {
        //    "type":"SNAPSHOT_FULL_REFRESH",
        //    "security":"BXYBTC",
        //    "timestamp":1593185579378,
        //    "sequenceNumber":11887,
        //    "entries":[
        //       {
        //          "action":"INSERT",
        //          "side":"ASK",
        //          "level":0,
        //          "numberOfOrders":null,
        //          "quantity":129541.0,
        //          "price":8.4E-7
        //       }]
        // }
        //
        const result = this.safeValue (response, 'entries', []);
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (result, timestamp, 'Buy', 'Sell', 'price', 'quantity');
    }

    parseOrderBook (orderbook, timestamp = undefined, bidsKey = 'Buy', asksKey = 'Sell', priceKey = 'price', amountKey = 'size') {
        const bids = [];
        const asks = [];
        for (let i = 0; i < orderbook.length; i++) {
            const bidask = orderbook[i];
            const side = this.safeString (bidask, 'side');
            if (side === 'ASK') {
                asks.push (this.parseBidAsk (bidask, priceKey, amountKey));
            } else {
                bids.push (this.parseBidAsk (bidask, priceKey, amountKey));
            }
        }
        return {
            'bids': this.sortBy (bids, 0, true),
            'asks': this.sortBy (asks, 0),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        const query = this.omit (params, this.extractParams (path));
        url += this.implodeParams (path, params);
        if (Object.keys (query).length) {
            url += '?' + this.urlencode (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
