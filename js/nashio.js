'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeNotAvailable, ExchangeError, AuthenticationError } = require ('./base/errors');

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
                'fetchTrades': true,
                'fetchOrderBook': true,
                'fetchL2OrderBook': false,
                'fetchOrderBooks': false,
                'fetchBalance': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchAllOrders': true,
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
                'explorer': 'https://app.nash.io/api/graphql/explore',
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
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
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
        query += '          aVolume { amount currency } ';
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let query = '';
        query += 'query ListTrades($marketName: MarketName' + '!' + ', $limit: Int, $before: DateTime) { ';
        query += '  listTrades(marketName: $marketName, limit: $limit, before: $before) { ';
        query += '      trades { ';
        query += '          accountSide ';
        query += '          amount { amount currency} ';
        query += '          cursor ';
        query += '          direction ';
        query += '          executedAt ';
        query += '          id ';
        query += '          limitPrice { amount currencyA currencyB } ';
        query += '          makerFee { amount currency } ';
        query += '          makerGave { amount currency } ';
        query += '          makerOrderId ';
        query += '          makerReceived { amount currency } ';
        // query += '          market { amount currency } ';
        query += '          takerFee { amount currency } ';
        query += '          takerGave { amount currency } ';
        query += '          takerOrderId ';
        query += '          takerReceived { amount currency } ';
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
        const trades = response['data']['listTrades']['trades'];
        // this.print ('fetchTrades.trades', trades);
        return this.parseTrades (trades, market, since, limit);
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

    async fetchBalance (params = {}) {
        let query = '';
        query += 'query ListAccountBalances($payload: ListAccountBalancesParams' + '!' + ', $signature: Signature' + '!' + ') {';
        query += '  listAccountBalances(payload: $payload, signature: $signature) { ';
        query += '      asset { name symbol hash } ';
        query += '      available { amount currency } ';
        query += '      depositAddress ';
        query += '      inOrders { amount currency } ';
        query += '      pending { amount currency } ';
        query += '      personal { amount currency } ';
        query += '  }';
        query += '}';
        // const signature = 'TODO SIGN IT';
        const listAccountBalancesParams = {
            'ignoreLowBalance': false,
        };
        const signedPayload = await this.signPayloadMpc (2, 'list_account_balances', listAccountBalancesParams);
        const signature = signedPayload['signature'];
        const request = {
            'query': query,
            'variables': {
                'payload': signedPayload['payload'],
                'signature': {
                    'publicKey': signature['publicKey'],
                    'signedDigest': signature['signedDigest'],
                },
            },
        };
        const response = await this.privatePostGql (this.extend (request, params));
        // this.print ('response', response);
        const listData = response['data']['listAccountBalances'];
        // console.warn ('response', response['data']['listAccountBalances']);
        const result = {
            'info': listData,
            'free': {},
            'used': {},
            'total': {},
        };
        // console.warn (listData);
        for (let i = 0; i < listData.length; i++) {
            const listItem = listData[i];
            const listSymbol = listItem['asset']['symbol'];
            const code = this.safeCurrencyCode (listSymbol);
            // console.warn (listSymbol, code);
            const free = listData[i]['available']['amount'];
            const used = this.sum (listData[i]['inOrders']['amount'], listData[i]['pending']['amount']);
            const total = this.sum (free, used);
            result['free'][code] = free;
            result['used'][code] = used;
            result['total'][code] = total;
            result[code] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let query = '';
        query += 'query ListAccountTrades($payload: ListAccountTradesParams' + '!, $signature: Signature' + '!' + ') { ';
        query += '  listAccountTrades(payload: $payload, signature: $signature) { ';
        query += '      trades { ';
        query += '          accountSide ';
        query += '          amount { amount currency } ';
        query += '          cursor ';
        query += '          direction ';
        query += '          executedAt ';
        query += '          id ';
        query += '          limitPrice { amount currencyA currencyB } ';
        query += '          makerFee { amount currency } ';
        query += '          makerGave { amount currency } ';
        query += '          makerOrderId ';
        query += '          makerReceived { amount currency } ';
        // query += '          market { } ';
        query += '          takerFee { amount currency } ';
        query += '          takerGave { amount currency } ';
        query += '          takerOrderId ';
        query += '          takerReceived { amount currency } ';
        query += '          usdARate { amount currencyA currencyB } ';
        query += '          usdBRate { amount currencyA currencyB } ';
        query += '      } ';
        query += '      next ';
        query += '  } ';
        query += '}';
        const listAccountTradesParams = {
            'before': undefined,
            'limit': undefined,
            'marketName': market['id'],
            'rangeStart': undefined,
            'rangeStop': undefined,
        };
        if (since !== undefined) {
            listAccountTradesParams['rangeStart'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            listAccountTradesParams['limit'] = limit;
        }
        const signedPayload = await this.signPayloadMpc (30, 'list_account_trades', listAccountTradesParams);
        const request = {
            'query': query,
            'variables': {
                'payload': signedPayload.payload,
                'signature': {
                    'publicKey': signedPayload.signature.publicKey,
                    'signedDigest': signedPayload.signature.signedDigest,
                },
            },
        };
        const response = await this.privatePostGql (this.extend (request, params));
        // this.print ('response', response);
        const trades = response['data']['listAccountTrades']['trades'];
        return this.parseTrades (trades, market, since, limit);
        // structure
        // {
        //     'info':         { ... },                    // the original decoded JSON as is
        //     'id':           '12345-67890:09876/54321',  // string trade id
        //     'timestamp':    1502962946216,              // Unix timestamp in milliseconds
        //     'datetime':     '2017-08-17 12:42:48.000',  // ISO8601 datetime with milliseconds
        //     'symbol':       'ETH/BTC',                  // symbol
        //     'order':        '12345-67890:09876/54321',  // string order id or undefined/None/null
        //     'type':         'limit',                    // order type, 'market', 'limit' or undefined/None/null
        //     'side':         'buy',                      // direction of the trade, 'buy' or 'sell'
        //     'takerOrMaker': 'taker',                    // string, 'taker' or 'maker'
        //     'price':        0.06917684,                 // float price in quote currency
        //     'amount':       1.5,                        // amount of base currency
        //     'cost':         0.10376526,                 // total cost (including fees), `price * amount`
        //     'fee':          {                           // provided by exchange or calculated by ccxt
        //         'cost':  0.0015,                        // float
        //         'currency': 'ETH',                      // usually base currency for buys, quote currency for sells
        //         'rate': 0.002,                          // the fee rate (if available)
        //     },
        // }
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchorders (['OPEN'], symbol, since, limit, params);
    }

    async fetchAllOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return this.fetchorders (['CANCELLED', 'FILLED', 'OPEN', 'PENDING'], symbol, since, limit, params);
    }

    async fetchorders (orderStatus, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let query = '';
        query += 'query ListAccountOrders($payload: ListAccountOrdersParams' + '!, $signature: Signature' + '!' + ') { ';
        query += '  listAccountOrders(payload: $payload, signature: $signature) {';
        query += '      next';
        query += '      orders {';
        query += '          id';
        query += '          placedAt';
        query += '          status';
        query += '          type';
        query += '          buyOrSell';
        query += '          amount { amount }';
        query += '          amountExecuted { amount }';
        query += '          amountRemaining { amount }';
        query += '          limitPrice { amount }';
        query += '          stopPrice { amount }';
        query += '          trades {';
        query += '              accountSide ';
        query += '              amount { amount currency } ';
        query += '              cursor ';
        query += '              direction ';
        query += '              executedAt ';
        query += '              id ';
        query += '              limitPrice { amount currencyA currencyB } ';
        query += '              makerFee { amount currency } ';
        query += '              makerGave { amount currency } ';
        query += '              makerOrderId ';
        query += '              makerReceived { amount currency } ';
        query += '              takerFee { amount currency } ';
        query += '              takerGave { amount currency } ';
        query += '              takerOrderId ';
        query += '              takerReceived { amount currency } ';
        query += '              usdARate { amount currencyA currencyB } ';
        query += '              usdBRate { amount currencyA currencyB } ';
        query += '          }';
        query += '      }';
        query += '  }';
        query += '}';
        const listAccountOrdersParams = {
            'before': undefined,
            'buyOrSell': undefined,
            'limit': undefined,
            'marketName': market['id'],
            'rangeStart': undefined,
            'rangeStop': undefined,
            'status': orderStatus,
            'type': undefined,
        };
        if (since !== undefined) {
            listAccountOrdersParams['rangeStart'] = this.iso8601 (since);
        }
        if (limit !== undefined) {
            listAccountOrdersParams['limit'] = limit;
        }
        const signedPayload = await this.signPayloadMpc (0, 'list_account_orders', listAccountOrdersParams);
        const request = {
            'query': query,
            'variables': {
                'payload': signedPayload.payload,
                'signature': {
                    'publicKey': signedPayload.signature.publicKey,
                    'signedDigest': signedPayload.signature.signedDigest,
                },
            },
        };
        const response = await this.privatePostGql (this.extend (request, params));
        // console.warn ('response', response);
        const orders = this.parseOrders (response['data']['listAccountOrders']['orders'], market, since, limit, params);
        return orders;
    }

    async signPayloadMpc (kindId, kindName, params) {
        // kind: https://gitlab.com/nash-io-public/nash-protocol/-/blob/master/src/payload/signingPayloadID.ts
        const payload = params;
        payload['timestamp'] = this.milliseconds ();
        const payloadAndKind = {
            'kind': kindId,
            'payload': payload,
        };
        const json = this.base64ToString (this.secret);
        const apiKey = this.unjson (json);
        const signedPayload = await this.preSignPayload (apiKey, payloadAndKind, kindName);
        return {
            'payload': signedPayload['payload'],
            'signature': {
                'publicKey': apiKey['payload_public_key'],
                'signedDigest': signedPayload['signature'],
            },
            // 'blockchain_data': signedPayload.blockchainMovement,
            // 'blockchain_raw': signedPayload.blockchainRaw,
            // 'signedPayload': signedPayload.payload,
        };
    }

    async preSignPayload (apiKey, payloadAndKind, kindName) {
        const message = kindName;
        let signature = this.ecdsa (message, apiKey['payload_signing_key'], 'secp256k1', 'sha256', true);
        signature = this.signatureToDER (signature['r'], signature['s'], 'hex');
        this.print ('nashio', 'signature', signature);
        return {
            'payload': payloadAndKind['payload'],
            'signature': signature,
        };
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
        const intervalStartingAt = this.safeString (ohlcv, 'intervalStartingAt');
        const ohlvOpenPrice = this.safeValue (ohlcv, 'openPrice');
        const ohlvHighPrice = this.safeValue (ohlcv, 'highPrice');
        const ohlvLowPrice = this.safeValue (ohlcv, 'lowPrice');
        const ohlvClosePrice = this.safeValue (ohlcv, 'closePrice');
        const ohlvVolume = this.safeValue (ohlcv, 'aVolume');
        const data = [
            this.parse8601 (intervalStartingAt),
            this.safeFloat (ohlvOpenPrice, 'amount'),
            this.safeFloat (ohlvHighPrice, 'amount'),
            this.safeFloat (ohlvLowPrice, 'amount'),
            this.safeFloat (ohlvClosePrice, 'amount'),
            this.safeFloat (ohlvVolume, 'amount'),
        ];
        return data;
    }

    parseTrade (trade, market = undefined) {
        const tradeExecutedAt = this.safeString (trade, 'executedAt');
        const timestamp = this.parse8601 (tradeExecutedAt);
        const id = this.safeString (trade, 'id');
        const order = undefined;
        const type = undefined;
        const side = this.safeString (trade, 'direction') === 'SELL' ? 'sell' : 'buy';
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const tradeLimitPrice = this.safeValue (trade, 'limitPrice');
        const price = this.safeFloat (tradeLimitPrice, 'amount');
        const tradeAmount = this.safeValue (trade, 'amount');
        const amount = this.safeFloat (tradeAmount, 'amount');
        let takerOrMaker = undefined;
        const tradeAccountSide = this.safeString (trade, 'accountSide');
        if (tradeAccountSide === 'MAKER') {
            takerOrMaker = 'maker';
        } else if (tradeAccountSide === 'TAKER') {
            takerOrMaker = 'taker';
        }
        const tradeMakerGave = this.safeValue (trade, 'makerGave');
        const tradeTakerReceived = this.safeValue (trade, 'takerReceived');
        const tradeTakerFee = this.safeValue (trade, 'takerFee');
        const fee = {
            'cost': this.safeFloat (tradeTakerFee, 'amount'),
            'currency': this.safeString (tradeTakerFee, 'currency'),
            'rate': this.safeFloat (tradeMakerGave, 'amount') / this.safeFloat (tradeTakerReceived, 'amount'),
        };
        return {
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': order,
            'type': type,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'fee': fee,
        };
    }

    parseOrder (order, market = undefined) {
        // console.warn ('parseOrder', order);
        const id = this.safeString (order, 'id');
        const placedAt = this.safeString (order, 'placedAt');
        const timestamp = this.parse8601 (placedAt);
        let status = this.safeString (order, 'status');
        if (status === 'OPEN') {
            status = 'open';
        } else if (status === 'FILLED') {
            status = 'closed';
        } else if (status === 'CANCELLED') {
            status = 'canceled';
        }
        let type = this.safeString (order, 'type');
        if (type === 'MARKET') {
            type = 'market';
        } else if (type === 'LIMIT') {
            type = 'limit';
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let side = this.safeString (order, 'buyOrSell');
        if (side === 'BUY') {
            side = 'buy';
        } else if (side === 'SELL') {
            side = 'sell';
        }
        const orderAmount = this.safeValue (order, 'amount');
        const amount = this.safeFloat (orderAmount, 'amount');
        const orderAmountExecuted = this.safeValue (order, 'amountExecuted');
        const filled = this.safeFloat (orderAmountExecuted, 'amount');
        const orderAmountRemaining = this.safeValue (order, 'amountRemaining');
        const remaining = this.safeFloat (orderAmountRemaining, 'amount');
        let price = undefined;
        const limitPrice = this.safeValue (order, 'limitPrice');
        const stopPrice = this.safeValue (order, 'stopPrice');
        if (limitPrice) {
            price = this.safeFloat (limitPrice, 'amount');
        } else if (stopPrice) {
            price = this.safeFloat (stopPrice, 'amount');
        }
        const orderTrades = this.safeValue (order, 'trades');
        const trades = this.parseTrades (orderTrades, market);
        // console.warn ('trades', trades);
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': filled * price,
            'trades': trades,
            'info': order,
        };
        // ### structure
        // {
        //     'id':                '12345-67890:09876/54321', // string
        //     'datetime':          '2017-08-17 12:42:48.000', // ISO8601 datetime of 'timestamp' with milliseconds
        //     'timestamp':          1502962946216, // order placing/opening Unix timestamp in milliseconds
        //     'lastTradeTimestamp': 1502962956216, // Unix timestamp of the most recent trade on this order
        //     'status':     'open',         // 'open', 'closed', 'canceled'
        //     'symbol':     'ETH/BTC',      // symbol
        //     'type':       'limit',        // 'market', 'limit'
        //     'side':       'buy',          // 'buy', 'sell'
        //     'price':       0.06917684,    // float price in quote currency
        //     'amount':      1.5,           // ordered amount of base currency
        //     'filled':      1.1,           // filled amount of base currency
        //     'remaining':   0.4,           // remaining amount to fill
        //     'cost':        0.076094524,   // 'filled' * 'price' (filling price used where available)
        //     'trades':    [ ... ],         // a list of order trades/executions
        //     'fee': {                      // fee info, if available
        //         'currency': 'BTC',        // which currency the fee is (usually quote)
        //         'cost': 0.0009,           // the fee amount in that currency
        //         'rate': 0.002,            // the fee rate (if available)
        //     },
        //     'info': { ... },              // the original unparsed order structure as is
        // }
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
        if (api === 'private') {
            // console.warn ('private');
            this.checkRequiredCredentials ();
            headers['Authorization'] = 'Token ' + this.apiKey;
        }
        // console.warn (url, method, body, headers);
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        // console.warn ('handleErrors', code, reason, url, method, headers, body, response, requestHeaders, requestBody);
        if (code === 520) {
            throw new ExchangeNotAvailable (this.id + ' ' + code.toString () + ' ' + reason);
        }
        const errors = this.safeValue (response, 'errors');
        if (errors) {
            for (let i = 0; i < errors.length; i++) {
                const error = errors[i];
                const code = this.safeFloat (error, 'code');
                const message = this.safeString (error, 'message');
                if (code === 10) {
                    throw new AuthenticationError (message);
                } else {
                    throw new ExchangeError (message);
                }
            }
        }
    }
};
