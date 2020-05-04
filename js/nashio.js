'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');

//  ---------------------------------------------------------------------------

module.exports = class nashio extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'nashio',
            'name': 'Nash',
            'countries': ['US'],
            'version': 'v1',
            'rateLimit': 3000,
            'certified': false,
            'pro': false,
            'has': {
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchTrades': false,
                'fetchOrderBook': true,
                'fetchL2OrderBook': false,
                'fetchOrderBooks': false,
            },
            'marketsByAltname': {},
            'timeframes': {
                '1m': 'ONE_MINUTE',
                '15m': 'FIFTEEN_MINUTE',
                '30m': 'THIRTY_MINUTE',
                '1h': 'ONE_HOUR',
                '6h': 'SIX_HOUR',
                '12h': 'TWELVE_HOUR',
                '1d': 'ONE_DAY',
                '1w': 'ONE_WEEK',
                '1M': 'ONE_MONTH',
            },
            'urls': {
                'logo': 'https://blog.nash.io/content/images/2019/07/Nash_Logo-Lrg.png',
                'api': {
                    'public': 'https://app.nash.io/api/graphql',
                    'private': 'https://app.nash.io/api/graphql',
                },
                'www': 'https://www.nash.io',
                'docs': 'https://api-ts-docs.nash.io/',
                'test': {
                    'public': 'https://app.sandbox.nash.io/api/graphql',
                    'private': 'https://app.sandbox.nash.io/api/graphql',
                },
                'fees': 'https://support.nash.io/hc/en-us/articles/360034801773-What-is-the-trading-fee-structure-on-Nash-',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': 'true',
                    'taker': 0.25 / 100,
                    'maker': 0,
                    'tiers': {
                        'taker': [
                            [0, 0.0025],
                            [1, 0.0022],
                            [2.5, 0.0019],
                            [5, 0.0019],
                            [10, 0.0016],
                            [20, 0.0013],
                        ],
                    },
                },
            },
            'api': {
                'public': {
                    'get': [],
                    'post': [
                        'gql',
                    ],
                },
                'private': {
                    'get': [],
                    'post': [
                        'gql',
                    ],
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        let query = '';
        query += 'query ListMarkets { ';
        query += '  listMarkets {';
        query += '      aUnit aUnitPrecision bUnit bUnitPrecision minTickSize minTradeSize minTradeSizeB minTradeIncrement minTradeIncrementB name status';
        query += '  }';
        query += '}';
        const request = {
            'query': query,
        };
        const response = await this.publicPostGql (this.extend (request, params));
        // console.warn ('fetchMarkets', response);
        const result = [];
        for (let i = 0; i < response['data']['listMarkets'].length; i++) {
            const market = response['data']['listMarkets'][i];
            // console.warn (i, market);
            const id = this.safeString (market, 'name');
            const baseId = this.safeString (market, 'aUnit');
            const quoteId = this.safeString (market, 'bUnit');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const active = market['status'] === 'RUNNING';
            const precision = {
                'amount': market['aUnitPrecision'],
                'price': market['bUnitPrecision'],
            };
            const limits = {
                'amount': {
                    'min': market['minTradeSize'],
                    'max': undefined,
                },
                'price': {
                    'min': market['minTradeSizeB'],
                    'max': undefined,
                },
            };
            const row = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            };
            // if (this.verbose) {
            //     this.print ('market', row);
            // }
            result.push (row);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        let query = '';
        query += 'query ListAssets { ';
        query += '  listAssets { ';
        query += '      blockchain hash name symbol';
        query += '  }';
        query += '}';
        const request = {
            'query': query,
        };
        const response = await this.publicPostGql (this.extend (request, params));
        const assets = response['data']['listAssets'];
        // console.warn ('assets', assets);
        const result = [];
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const row = {
                'id': this.safeString (asset, 'id'),
                'code': this.safeString (asset, 'symbol'),
                'name': this.safeString (asset, 'name'),
                'info': asset,
            };
            result.push (row);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let query = '';
        query += 'query GetTicker($marketName: MarketName' + '!' + ') { ';
        query += '  getTicker(marketName: $marketName) { ';
        query += '      highPrice24h { amount currencyA currencyB }';
        query += '      lowPrice24h { amount currencyA currencyB }';
        query += '      bestBidPrice { amount currencyA currencyB }';
        query += '      bestBidSize { amount currency }';
        query += '      bestAskPrice { amount currencyA currencyB }';
        query += '      bestAskSize { amount currency }';
        query += '      lastPrice { amount currencyA currencyB }';
        query += '      priceChange24h { amount currencyA currencyB }';
        query += '      priceChange24hPct';
        query += '  } ';
        query += '} ';
        const request = {
            'query': query,
            'variables': {
                'marketName': market['id'],
            },
        };
        const response = await this.publicPostGql (this.extend (request, params));
        return this.parseTicker (response['data']['getTicker'], market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        symbols = (symbols === undefined) ? this.symbols : symbols;
        const marketIds = [];
        // console.warn(this.markets);
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.markets[symbol];
            if (market['active']) {
                marketIds.push (market['id']);
            }
        }
        let query = '';
        query += 'query Tickers { ';
        query += '  listTickers { ';
        query += '      highPrice24h { amount currencyA currencyB }';
        query += '      lowPrice24h { amount currencyA currencyB }';
        query += '      bestBidPrice { amount currencyA currencyB }';
        query += '      bestBidSize { amount currency }';
        query += '      bestAskPrice { amount currencyA currencyB }';
        query += '      bestAskSize { amount currency }';
        query += '      lastPrice { amount currencyA currencyB }';
        query += '      priceChange24h { amount currencyA currencyB }';
        query += '      priceChange24hPct';
        query += '      market {';
        query += '          name';
        query += '      }';
        query += '  } ';
        query += '}';
        const request = {
            'query': query,
        };
        const response = await this.publicPostGql (this.extend (request, params));
        // console.warn ('fetchTickers', response['data']);
        const result = {};
        for (let i = 0; i < response['data']['listTickers'].length; i++) {
            const ticker = response['data']['listTickers'][i];
            const market = this.markets_by_id[ticker['market']['name']];
            const symbol = market['symbol'];
            if (this.inArray (symbol, symbols)) {
                result[symbol] = this.parseTicker (ticker, market);
            }
        }
        // console.warn ('fetchTickers', result);
        return result;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        // this.verbose = true;
        const market = this.market (symbol);
        let query = '';
        query += 'query listCandles($before: DateTime, $interval: CandleInterval, $marketName: MarketName' + '!' + ', $limit: Int) { ';
        query += '  listCandles (before: $before, interval: $interval, marketName: $marketName, limit: $limit) { ';
        query += '      candles { ';
        query += '          aVolume { amount currency }';
        query += '          openPrice { amount currencyA currencyB }';
        query += '          closePrice { amount currencyA currencyB }';
        query += '          highPrice { amount currencyA currencyB }';
        query += '          lowPrice { amount currencyA currencyB }';
        query += '          interval ';
        query += '          intervalStartingAt ';
        query += '      } ';
        query += '  } ';
        query += '}';
        const request = {
            'query': query,
            'variables': {
                'marketName': market['id'],
                'interval': this.timeframes[timeframe],
                'limit': limit,
            },
        };
        if (since !== undefined) {
            request['variables']['before'] = this.iso8601 (since);
        }
        const response = await this.publicPostGql (this.extend (request, params));
        // this.print ('response', response);
        const ohlcvs = response['data']['listCandles']['candles'];
        // console.warn ('ohlcvs', ohlcvs);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let query = '';
        query += 'query GetOrderBook($marketName: MarketName ' + '!' + ') { ';
        query += '  getOrderBook(marketName: $marketName) { ';
        query += '      lastUpdateId ';
        query += '      updateId ';
        query += '      asks { ';
        query += '          amount { amount currency } ';
        query += '          price { amount currencyA currencyB } ';
        query += '      } ';
        query += '      bids { ';
        query += '          amount { amount currency } ';
        query += '          price { amount currencyA currencyB } ';
        query += '      } ';
        query += '  } ';
        query += '}';
        const request = {
            'query': query,
            'variables': {
                'marketName': market['id'],
            },
        };
        if (limit !== undefined) {
            request['count'] = limit; // 100
        }
        const response = await this.publicPostGql (this.extend (request, params));
        const orderbook = response['data']['getOrderBook'];
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 0, 'amount');
    }

    parseBidAsk (bidask, priceKey = 0, amountKey = 1) {
        // if (this.verbose) {
        //     this.print ('bidask', bidask, priceKey, amountKey, market);
        // }
        const price = parseFloat (bidask['price'][amountKey]);
        const amount = parseFloat (bidask['amount'][amountKey]);
        return [ price, amount ];
    }

    parseTicker (ticker, market = undefined) {
        // console.warn ('parseTicker', ticker);
        const timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        const open = undefined;
        const tickerHighPrice24h = this.safeValue (ticker, 'highPrice24h');
        const tickerLowPrice24h = this.safeValue (ticker, 'lowPrice24h');
        const tickerLastPrice = this.safeValue (ticker, 'lastPrice');
        const tickerPriceChange24h = this.safeValue (ticker, 'priceChange24h');
        const tickerBestAskPrice = this.safeValue (ticker, 'bestAskPrice');
        const tickerBestAskSize = this.safeValue (ticker, 'bestAskSize');
        const tickerBestBidPrice = this.safeValue (ticker, 'bestBidPrice');
        const tickerBestBidSize = this.safeValue (ticker, 'bestBidSize');
        const high = this.safeFloat (tickerHighPrice24h, 'amount');
        const low = this.safeFloat (tickerLowPrice24h, 'amount');
        const last = this.safeFloat (tickerLastPrice, 'amount');
        // console.warn ('last', symbol, last);
        const change = this.safeFloat (tickerPriceChange24h, 'amount');
        const ask = this.safeFloat (tickerBestAskPrice, 'amount');
        const askVolume = this.safeFloat (tickerBestAskSize, 'amount');
        const bid = this.safeFloat (tickerBestBidPrice, 'amount');
        const bidVolume = this.safeFloat (tickerBestBidSize, 'amount');
        const percentage = ticker['priceChange24hPct'];
        const average = undefined;
        const close = last;
        // console.warn ('parseTicker', last, close);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'open': open,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        const datetime = this.parse8601 (ohlcv['intervalStartingAt']);
        const ohlvOpenPrice = this.safeValue (ohlcv, 'openPrice');
        const ohlvHighPrice = this.safeValue (ohlcv, 'highPrice');
        const ohlvLowPrice = this.safeValue (ohlcv, 'lowPrice');
        const ohlvClosePrice = this.safeValue (ohlcv, 'closePrice');
        const ohlvVolume = this.safeValue (ohlcv, 'aVolume');
        const open = this.safeFloat (ohlvOpenPrice, 'amount');
        const high = this.safeFloat (ohlvHighPrice, 'amount');
        const low = this.safeFloat (ohlvLowPrice, 'amount');
        const close = this.safeFloat (ohlvClosePrice, 'amount');
        const volume = this.safeFloat (ohlvVolume, 'amount');
        const data = [
            datetime,
            open,
            high,
            low,
            close,
            volume,
        ];
        return data;
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeTimestamp (trade['executedAt'], 'time');
        const id = trade['id'];
        // const order = undefined;
        // const type = undefined;
        const side = trade['direction'] === 'SELL' ? 'sell' : 'buy';
        // let symbol = undefined;
        const price = this.safeFloat (trade['limitPrice'], 'amount');
        const amount = this.safeFloat (trade['amount'], 'amount');
        // let currency = undefined;
        // if (market) {
        //     currency = market['quote'];
        // }
        // const fee = {
        //     'cost': this.safeFloat (trade['takerFee'], 'amount'),
        //     'currency': currency,
        // };
        // if (market !== undefined) {
        //     symbol = market['symbol'];
        // }
        // console.warn ('trade', trade);
        return {
            'id': id,
            // 'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            // 'symbol': symbol,
            // 'type': type,
            'side': side,
            // 'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            // 'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        // if (this.verbose) {
        //     this.print ('sign', path, api, method, params, headers, body);
        // }
        const url = this.urls['api'][api];
        headers = {
            'Content-Type': 'application/json',
        };
        body = this.json (params);
        // if (this.verbose) {
        //     this.print ('sign', { 'url': url, 'method': method, 'body': body, 'headers': headers });
        // }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
