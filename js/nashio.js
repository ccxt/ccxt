'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');

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
                'fetchCurrencies': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchTrades': true,
                'fetchOrderBook': true,
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
            'precisionMode': TICK_SIZE,
            'gqlFragments': {
                'MarketFields': [
                    'aUnit',
                    'aUnitPrecision',
                    'bUnit',
                    'bUnitPrecision',
                    'minTickSize',
                    'minTradeSize',
                    'minTradeSizeB',
                    'minTradeIncrement',
                    'minTradeIncrementB',
                    'name',
                    'status',
                    'priceGranularity',
                ],
                'CurrencyAmountFields': [
                    'amount',
                    'currency',
                ],
                'CurrencyAmountPartialFields': [
                    'amount',
                ],
                'CurrencyPriceFields': [
                    'amount',
                    'currencyA',
                    'currencyB',
                ],
                'CurrencyPricePartialFields': [
                    'amount',
                ],
            },
        });
    }

    async fetchMarkets (params = {}) {
        const marketFields = this.gqlFragments['MarketFields'];
        let query = '';
        query += 'query ListMarkets { ';
        query += '  listMarkets { ';
        query += '      ' + marketFields.join (' ');
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
            const row = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'info': market,
            };
            // if (this.verbose) {
            //     this.print ('market', row);
            // }
            result.push (row);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // console.warn ('fetchTicker', symbol, market);
        const marketFields = this.gqlFragments['MarketFields'];
        const currencyAmountFields = this.gqlFragments['CurrencyAmountFields'];
        const currencyPriceFields = this.gqlFragments['CurrencyPriceFields'];
        let query = '';
        query += 'query GetTicker($marketName: MarketName!) { ';
        query += '  getTicker(marketName: $marketName) { ';
        query += '      market { ';
        query += '          ' + marketFields.join (' ');
        query += '      } ';
        query += '      priceChange24hPct ';
        query += '      volume24h { ';
        query += '          ' + currencyAmountFields.join (' ');
        query += '      } ';
        query += '      lastPrice { ';
        query += '          ' + currencyPriceFields.join (' ');
        query += '      } ';
        query += '      usdLastPrice { ';
        query += '          ' + currencyPriceFields.join (' ');
        query += '      } ';
        query += '  } ';
        query += '} ';
        const request = {
            'query': query,
            'variables': {
                'marketName': market['id'],
            },
        };
        const response = await this.publicPostGql (this.extend (request, params));
        const candles = await this.fetchOHLCV (symbol, '1d', undefined, 1, params);
        const book = await this.fetchOrderBook (symbol, undefined, params);
        response['data']['getTicker']['candles'] = candles;
        response['data']['getTicker']['book'] = book;
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
        const marketFields = this.gqlFragments['MarketFields'];
        const currencyAmountFields = this.gqlFragments['CurrencyAmountFields'];
        const currencyPriceFields = this.gqlFragments['CurrencyPriceFields'];
        let query = '';
        query += 'query Tickers { ';
        query += '  listTickers { ';
        query += '      market { ';
        query += '          ' + marketFields.join (' ');
        query += '      } ';
        query += '      priceChange24hPct ';
        query += '      volume24h { ';
        query += '          ' + currencyAmountFields.join (' ');
        query += '      } ';
        query += '      lastPrice { ';
        query += '          ' + currencyPriceFields.join (' ');
        query += '      } ';
        query += '      usdLastPrice { ';
        query += '          ' + currencyPriceFields.join (' ');
        query += '      } ';
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
            // console.warn('ticker', ticker);
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
        const currencyAmountPartialFields = this.gqlFragments['CurrencyAmountPartialFields'];
        const currencyPricePartialFields = this.gqlFragments['CurrencyPricePartialFields'];
        let query = '';
        query += 'query listCandles($before: DateTime, $interval: CandleInterval, $marketName: MarketName!, $limit: Int) { ';
        query += '  listCandles (before: $before, interval: $interval, marketName: $marketName, limit: $limit) { ';
        query += '      candles { ';
        query += '          aVolume { ';
        query += '               ' + currencyAmountPartialFields.join (' ');
        query += '          }';
        query += '          openPrice { ';
        query += '               ' + currencyPricePartialFields.join (' ');
        query += '          }';
        query += '          closePrice { ';
        query += '               ' + currencyPricePartialFields.join (' ');
        query += '          }';
        query += '          highPrice { ';
        query += '               ' + currencyPricePartialFields.join (' ');
        query += '          }';
        query += '          lowPrice { ';
        query += '               ' + currencyPricePartialFields.join (' ');
        query += '          } ';
        query += '          interval ';
        query += '          intervalStartingAt ';
        query += '      }';
        query += '  }';
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
        // console.warn('response', response);
        const ohlcvs = response['data']['listCandles']['candles'];
        // console.warn ('ohlcvs', ohlcvs);
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const currencyAmountFields = this.gqlFragments['CurrencyAmountFields'];
        const currencyPriceFields = this.gqlFragments['CurrencyPriceFields'];
        let query = '';
        query += 'query ListTrades($marketName: MarketName!, $limit: Int, $before: DateTime) { ';
        query += '  listTrades(marketName: $marketName, limit: $limit, before: $before) { ';
        query += '      trades { ';
        query += '          id ';
        query += '          makerOrderId ';
        query += '          takerOrderId ';
        query += '          executedAt ';
        query += '          accountSide ';
        query += '          limitPrice { ';
        query += '              ' + currencyPriceFields.join (' ');
        query += '          } ';
        query += '          amount { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          direction ';
        query += '          makerGave { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          takerGave { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          makerReceived { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          takerReceived { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          makerFee { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          takerFee { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '      } ';
        query += '      next ';
        query += '  } ';
        query += '}';
        const request = {
            'query': query,
            'variables': {
                'marketName': market['id'],
            },
        };
        const response = await this.publicPostGql (this.extend (request, params));
        // console.warn ('fetchTrades', response);
        const trades = response['data']['listTrades']['trades'];
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const currencyAmountFields = this.gqlFragments['CurrencyAmountFields'];
        const currencyPriceFields = this.gqlFragments['CurrencyPriceFields'];
        let query = '';
        query += 'query GetOrderBook($marketName: MarketName!) { ';
        query += '  getOrderBook(marketName: $marketName) { ';
        query += '      lastUpdateId ';
        query += '      updateId ';
        query += '      asks { ';
        query += '          amount { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          price { ';
        query += '              ' + currencyPriceFields.join (' ');
        query += '          } ';
        query += '      } ';
        query += '      bids { ';
        query += '          amount { ';
        query += '              ' + currencyAmountFields.join (' ');
        query += '          } ';
        query += '          price { ';
        query += '              ' + currencyPriceFields.join (' ');
        query += '          } ';
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
        // console.warn ('orderbook', orderbook);
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
        const open = ticker['candles'] ? ticker['candles'][0][1] : undefined;
        const high = ticker['candles'] ? ticker['candles'][0][2] : undefined;
        const low = ticker['candles'] ? ticker['candles'][0][3] : undefined;
        const last = ticker['lastPrice'] ? ticker['lastPrice']['amount'] : undefined;
        const close = ticker['candles'] && last ? ticker['candles'][0][4] : last;
        const average = last && open ? (last + open) / 2 : undefined;
        const change = last && open ? last - open : undefined;
        const percentage = ticker['priceChange24hPct'];
        const ask = ticker['book'] ? ticker['book']['asks'][0][0] : undefined;
        const askVolume = ticker['book'] ? ticker['book']['asks'][0][1] : undefined;
        const bid = ticker['book'] ? ticker['book']['bids'][0][0] : undefined;
        const bidVolume = ticker['book'] ? ticker['book']['bids'][0][1] : undefined;
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
        // console.warn('ohlcv', ohlcv);
        const datetime = this.parse8601 (ohlcv['intervalStartingAt']);
        const open = ohlcv['openPrice']['amount'];
        const high = ohlcv['highPrice']['amount'];
        const low = ohlcv['lowPrice']['amount'];
        const close = ohlcv['closePrice']['amount'];
        const volume = ohlcv['aVolume']['amount'];
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
