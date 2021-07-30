'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, ExchangeNotAvailable, PermissionDenied, InvalidOrder, AuthenticationError, InsufficientFunds, OrderNotFound, DDoSProtection, OnMaintenance, RateLimitExceeded } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitz extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitz',
            'name': 'Bit-Z',
            'countries': [ 'HK' ],
            'rateLimit': 2000,
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'has': {
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createMarketOrder': false,
                'fetchBalance': true,
                'fetchDeposits': true,
                'fetchClosedOrders': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTransactions': false,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '60min',
                '4h': '4hour',
                '1d': '1day',
                '5d': '5day',
                '1w': '1week',
                '1M': '1mon',
            },
            'hostname': 'apiv2.bitz.com',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87443304-fec5e000-c5fd-11ea-98f8-ba8e67f7eaff.jpg',
                'api': {
                    'market': 'https://{hostname}',
                    'trade': 'https://{hostname}',
                    'assets': 'https://{hostname}',
                },
                'www': 'https://www.bitz.com',
                'doc': 'https://apidocv2.bitz.plus/en/',
                'fees': 'https://www.bitz.com/fee?type=1',
                'referral': 'https://u.bitz.com/register?invite_code=1429193',
            },
            'api': {
                'market': {
                    'get': [
                        'ticker',
                        'depth',
                        'order', // trades
                        'tickerall',
                        'kline',
                        'symbolList',
                        'getServerTime',
                        'currencyRate',
                        'currencyCoinRate',
                        'coinRate',
                        'getContractCoin',
                        'getContractKline',
                        'getContractOrderBook',
                        'getContractTradesHistory',
                        'getContractTickers',
                    ],
                },
                'trade': {
                    'post': [
                        'addEntrustSheet',
                        'cancelEntrustSheet',
                        'cancelAllEntrustSheet',
                        'coinOut', // withdraw
                        'getUserHistoryEntrustSheet', // closed orders
                        'getUserNowEntrustSheet', // open orders
                        'getEntrustSheetInfo', // order
                        'depositOrWithdraw', // transactions
                        'getCoinAddress',
                        'getCoinAddressList',
                        'marketTrade',
                        'addEntrustSheetBatch',
                    ],
                },
                'assets': {
                    'post': [
                        'getUserAssets',
                    ],
                },
                'contract': {
                    'post': [
                        'addContractTrade',
                        'cancelContractTrade',
                        'getContractActivePositions',
                        'getContractAccountInfo',
                        'getContractMyPositions',
                        'getContractOrderResult',
                        'getContractTradeResult',
                        'getContractOrder',
                        'getContractMyHistoryTrade',
                        'getContractMyTrades',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
            'options': {
                'fetchOHLCVVolume': true,
                'fetchOHLCVWarning': true,
                'lastNonceTimestamp': 0,
            },
            'commonCurrencies': {
                // https://github.com/ccxt/ccxt/issues/3881
                // https://support.bit-z.pro/hc/en-us/articles/360007500654-BOX-BOX-Token-
                'BOX': 'BOX Token',
                'LEO': 'LeoCoin',
                'XRB': 'NANO',
                'PXC': 'Pixiecoin',
                'VTC': 'VoteCoin',
                'TTC': 'TimesChain',
            },
            'exceptions': {
                // '200': Success
                '-102': ExchangeError, // Invalid parameter
                '-103': AuthenticationError, // Verification failed
                '-104': ExchangeNotAvailable, // Network Error-1
                '-105': AuthenticationError, // Invalid api signature
                '-106': ExchangeNotAvailable, // Network Error-2
                '-109': AuthenticationError, // Invalid scretKey
                '-110': DDoSProtection, // The number of access requests exceeded
                '-111': PermissionDenied, // Current IP is not in the range of trusted IP
                '-112': OnMaintenance, // Service is under maintenance
                '-114': RateLimitExceeded, // The number of daily requests has reached the limit
                '-117': AuthenticationError, // The apikey expires
                '-100015': AuthenticationError, // Trade password error
                '-100044': ExchangeError, // Fail to request data
                '-100101': ExchangeError, // Invalid symbol
                '-100201': ExchangeError, // Invalid symbol
                '-100301': ExchangeError, // Invalid symbol
                '-100401': ExchangeError, // Invalid symbol
                '-100302': ExchangeError, // Type of K-line error
                '-100303': ExchangeError, // Size of K-line error
                '-200003': AuthenticationError, // Please set trade password
                '-200005': PermissionDenied, // This account can not trade
                '-200025': ExchangeNotAvailable, // Temporary trading halt
                '-200027': InvalidOrder, // Price Error
                '-200028': InvalidOrder, // Amount must be greater than 0
                '-200029': InvalidOrder, // Number must be between %s and %d
                '-200030': InvalidOrder, // Over price range
                '-200031': InsufficientFunds, // Insufficient assets
                '-200032': ExchangeError, // System error. Please contact customer service
                '-200033': ExchangeError, // Fail to trade
                '-200034': OrderNotFound, // The order does not exist
                '-200035': OrderNotFound, // Cancellation error, order filled
                '-200037': InvalidOrder, // Trade direction error
                '-200038': ExchangeError, // Trading Market Error
                '-200055': OrderNotFound, // Order record does not exist
                '-300069': AuthenticationError, // api_key is illegal
                '-300101': ExchangeError, // Transaction type error
                '-300102': InvalidOrder, // Price or number cannot be less than 0
                '-300103': AuthenticationError, // Trade password error
                '-301001': ExchangeNotAvailable, // Network Error-3
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.marketGetSymbolList (params);
        //
        //     {    status:    200,
        //             msg:   "",
        //            data: {   ltc_btc: {          id: "1",
        //                                        name: "ltc_btc",
        //                                    coinFrom: "ltc",
        //                                      coinTo: "btc",
        //                                 numberFloat: "4",
        //                                  priceFloat: "8",
        //                                      status: "1",
        //                                    minTrade: "0.010",
        //                                    maxTrade: "500000000.000" },
        //                    qtum_usdt: {          id: "196",
        //                                        name: "qtum_usdt",
        //                                    coinFrom: "qtum",
        //                                      coinTo: "usdt",
        //                                 numberFloat: "4",
        //                                  priceFloat: "2",
        //                                      status: "1",
        //                                    minTrade: "0.100",
        //                                    maxTrade: "500000000.000" },  },
        //            time:    1535969146,
        //       microtime:   "0.66955600 1535969146",
        //          source:   "api"                                           }
        //
        const markets = this.safeValue (response, 'data');
        const ids = Object.keys (markets);
        const result = [];
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const market = markets[id];
            const numericId = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'coinFrom');
            const quoteId = this.safeString (market, 'coinTo');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            const pricePrecisionString = this.safeString (market, 'priceFloat');
            const minPrice = this.parsePrecision (pricePrecisionString);
            const precision = {
                'amount': this.safeInteger (market, 'numberFloat'),
                'price': parseInt (pricePrecisionString),
            };
            const minAmount = this.safeString (market, 'minTrade');
            result.push ({
                'info': market,
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': this.parseNumber (minAmount),
                        'max': this.safeNumber (market, 'maxTrade'),
                    },
                    'price': {
                        'min': this.parseNumber (minPrice),
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.parseNumber (Precise.stringMul (minPrice, minAmount)),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.assetsPostGetUserAssets (params);
        //
        //     {
        //         status: 200,
        //         msg: "",
        //         data: {
        //             cny: 0,
        //             usd: 0,
        //             btc_total: 0,
        //             info: [{
        //                 "name": "zpr",
        //                 "num": "37.49067275",
        //                 "over": "37.49067275",
        //                 "lock": "0.00000000",
        //                 "btc": "0.00000000",
        //                 "usd": "0.00000000",
        //                 "cny": "0.00000000",
        //             }],
        //         },
        //         time: 1535983966,
        //         microtime: "0.70400500 1535983966",
        //         source: "api",
        //     }
        //
        const balances = this.safeValue (response['data'], 'info');
        const timestamp = this.parseMicrotime (this.safeString (response, 'microtime'));
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'name');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['used'] = this.safeString (balance, 'lock');
            account['total'] = this.safeString (balance, 'num');
            account['free'] = this.safeString (balance, 'over');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseTicker (ticker, market = undefined) {
        //
        //      {          symbol: "eth_btc",
        //            quoteVolume: "3905.72",
        //                 volume: "97058.21",
        //            priceChange: "-1.72",
        //         priceChange24h: "-1.65",
        //               askPrice: "0.03971272",
        //                 askQty: "0.0663",
        //               bidPrice: "0.03961469",
        //                 bidQty: "19.5451",
        //                   open: "0.04036769",
        //                   high: "0.04062988",
        //                    low: "0.03956123",
        //                    now: "0.03970100",
        //                firstId:  115567767,
        //                 lastId:  115795316,
        //              dealCount:  14078,
        //        numberPrecision:  4,
        //         pricePrecision:  8,
        //                    cny: "1959.05",
        //                    usd: "287.10",
        //                    krw: "318655.82"   }
        //
        const timestamp = undefined;
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market, '_');
        const last = this.safeNumber (ticker, 'now');
        const open = this.safeNumber (ticker, 'open');
        let change = undefined;
        let average = undefined;
        if (last !== undefined && open !== undefined) {
            change = last - open;
            average = this.sum (last, open) / 2;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bidPrice'),
            'bidVolume': this.safeNumber (ticker, 'bidQty'),
            'ask': this.safeNumber (ticker, 'askPrice'),
            'askVolume': this.safeNumber (ticker, 'askQty'),
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': this.safeNumber (ticker, 'priceChange24h'),
            'average': average,
            'baseVolume': this.safeNumber (ticker, 'volume'),
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume'),
            'info': ticker,
        };
    }

    parseMicrotime (microtime) {
        if (microtime === undefined) {
            return microtime;
        }
        const parts = microtime.split (' ');
        const milliseconds = parseFloat (parts[0]);
        const seconds = parseInt (parts[1]);
        const total = this.sum (seconds, milliseconds);
        return parseInt (total * 1000);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.marketGetTicker (this.extend (request, params));
        //
        //     {    status:    200,
        //             msg:   "",
        //            data: {          symbol: "eth_btc",
        //                        quoteVolume: "3905.72",
        //                             volume: "97058.21",
        //                        priceChange: "-1.72",
        //                     priceChange24h: "-1.65",
        //                           askPrice: "0.03971272",
        //                             askQty: "0.0663",
        //                           bidPrice: "0.03961469",
        //                             bidQty: "19.5451",
        //                               open: "0.04036769",
        //                               high: "0.04062988",
        //                                low: "0.03956123",
        //                                now: "0.03970100",
        //                            firstId:  115567767,
        //                             lastId:  115795316,
        //                          dealCount:  14078,
        //                    numberPrecision:  4,
        //                     pricePrecision:  8,
        //                                cny: "1959.05",
        //                                usd: "287.10",
        //                                krw: "318655.82"   },
        //            time:    1535970397,
        //       microtime:   "0.76341900 1535970397",
        //          source:   "api"                             }
        //
        const ticker = this.parseTicker (response['data'], market);
        const timestamp = this.parseMicrotime (this.safeString (response, 'microtime'));
        return this.extend (ticker, {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (symbols !== undefined) {
            const ids = this.marketIds (symbols);
            request['symbols'] = ids.join (',');
        }
        const response = await this.marketGetTickerall (this.extend (request, params));
        //
        //     {    status:    200,
        //             msg:   "",
        //            data: {   ela_btc: {          symbol: "ela_btc",
        //                                     quoteVolume: "0.00",
        //                                          volume: "3.28",
        //                                     priceChange: "0.00",
        //                                  priceChange24h: "0.00",
        //                                        askPrice: "0.00147984",
        //                                          askQty: "5.4580",
        //                                        bidPrice: "0.00120230",
        //                                          bidQty: "12.5384",
        //                                            open: "0.00149078",
        //                                            high: "0.00149078",
        //                                             low: "0.00149078",
        //                                             now: "0.00149078",
        //                                         firstId:  115581219,
        //                                          lastId:  115581219,
        //                                       dealCount:  1,
        //                                 numberPrecision:  4,
        //                                  pricePrecision:  8,
        //                                             cny: "73.66",
        //                                             usd: "10.79",
        //                                             krw: "11995.03"    }     },
        //            time:    1535971578,
        //       microtime:   "0.39854200 1535971578",
        //          source:   "api"                                                }
        //
        const tickers = this.safeValue (response, 'data');
        const timestamp = this.parseMicrotime (this.safeString (response, 'microtime'));
        const result = {};
        const ids = Object.keys (tickers);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let ticker = tickers[id];
            let market = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
            }
            ticker = this.parseTicker (tickers[id], market);
            let symbol = ticker['symbol'];
            if (symbol === undefined) {
                if (market !== undefined) {
                    symbol = market['symbol'];
                } else {
                    const [ baseId, quoteId ] = id.split ('_');
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
            if (symbol !== undefined) {
                result[symbol] = this.extend (ticker, {
                    'timestamp': timestamp,
                    'datetime': this.iso8601 (timestamp),
                });
            }
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTime (params = {}) {
        const response = await this.marketGetGetServerTime (params);
        //
        //     {
        //         "status":200,
        //         "msg":"",
        //         "data":[],
        //         "time":1555490875,
        //         "microtime":"0.35994200 1555490875",
        //         "source":"api"
        //     }
        //
        return this.safeTimestamp (response, 'time');
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        const response = await this.marketGetDepth (this.extend (request, params));
        //
        //     {    status:    200,
        //             msg:   "",
        //            data: {     asks: [ ["10.00000000", "0.4426", "4.4260"],
        //                                ["1.00000000", "0.8339", "0.8339"],
        //                                ["0.91700000", "0.0500", "0.0458"],
        //                                ["0.20000000", "0.1000", "0.0200"],
        //                                ["0.03987120", "16.1262", "0.6429"],
        //                                ["0.03986120", "9.7523", "0.3887"]   ],
        //                        bids: [ ["0.03976145", "0.0359", "0.0014"],
        //                                ["0.03973401", "20.9493", "0.8323"],
        //                                ["0.03967970", "0.0328", "0.0013"],
        //                                ["0.00000002", "10000.0000", "0.0002"],
        //                                ["0.00000001", "231840.7500", "0.0023"] ],
        //                    coinPair:   "eth_btc"                                  },
        //            time:    1535974778,
        //       microtime:   "0.04017400 1535974778",
        //          source:   "api"                                                     }
        //
        const orderbook = this.safeValue (response, 'data');
        const timestamp = this.parseMicrotime (this.safeString (response, 'microtime'));
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //    { id:  115807453,
        //       t: "19:36:24",
        //       T:  1535974584,
        //       p: "0.03983296",
        //       n: "0.1000",
        //       s: "buy"         },
        //
        const id = this.safeString (trade, 'id');
        const timestamp = this.safeTimestamp (trade, 'T');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 'n');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        const side = this.safeString (trade, 's');
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': undefined,
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.marketGetOrder (this.extend (request, params));
        //
        //     {    status:    200,
        //             msg:   "",
        //            data: [ { id:  115807453,
        //                       t: "19:36:24",
        //                       T:  1535974584,
        //                       p: "0.03983296",
        //                       n: "0.1000",
        //                       s: "buy"         },
        //                    { id:  115806811,
        //                       t: "19:33:19",
        //                       T:  1535974399,
        //                       p: "0.03981135",
        //                       n: "9.4612",
        //                       s: "sell"        }  ],
        //            time:    1535974583,
        //       microtime:   "0.57118100 1535974583",
        //          source:   "api"                     }
        //
        return this.parseTrades (response['data'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         time: "1535973420000",
        //         open: "0.03975084",
        //         high: "0.03975084",
        //         low: "0.03967700",
        //         close: "0.03967700",
        //         volume: "12.4733",
        //         datetime: "2018-09-03 19:17:00"
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const duration = this.parseTimeframe (timeframe);
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['size'] = Math.min (limit, 300); // 1-300
            if (since !== undefined) {
                request['to'] = this.sum (since, limit * duration * 1000);
            }
        } else {
            if (since !== undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a limit argument if the since argument is specified');
            }
        }
        const response = await this.marketGetKline (this.extend (request, params));
        //
        //     {
        //         status: 200,
        //         msg: "",
        //         data: {
        //             bars: [
        //                 { time: "1535973420000", open: "0.03975084", high: "0.03975084", low: "0.03967700", close: "0.03967700", volume: "12.4733", datetime: "2018-09-03 19:17:00" },
        //                 { time: "1535955480000", open: "0.04009900", high: "0.04016745", low: "0.04009900", close: "0.04012074", volume: "74.4803", datetime: "2018-09-03 14:18:00" },
        //             ],
        //             resolution: "1min",
        //             symbol: "eth_btc",
        //             from: "1535973420000",
        //             to: "1535955480000",
        //             size: 300
        //         },
        //         time: 1535973435,
        //         microtime: "0.56462100 1535973435",
        //         source: "api"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const bars = this.safeValue (data, 'bars', []);
        return this.parseOHLCVs (bars, market, timeframe, since, limit);
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'open',
            '1': 'open', // partially filled
            '2': 'closed', // filled
            '3': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //    {
        //         "id": "693248739",   // order id
        //         "uId": "2074056",    // uid
        //         "price": "100",      // price
        //         "number": "10",      // number
        //         "numberOver": "10",  // undealed
        //         "flag": "sale",      // flag
        //         "status": "0",       // unfilled
        //         "coinFrom": "vtc",
        //         "coinTo": "dkkt",
        //         "numberDeal": "0"    // dealed
        //     }
        //
        const id = this.safeString (order, 'id');
        let symbol = undefined;
        if (market === undefined) {
            const baseId = this.safeString (order, 'coinFrom');
            const quoteId = this.safeString (order, 'coinTo');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                const marketId = baseId + '_' + quoteId;
                if (marketId in this.markets_by_id) {
                    market = this.safeValue (this.markets_by_id, marketId);
                } else {
                    const base = this.safeCurrencyCode (baseId);
                    const quote = this.safeCurrencyCode (quoteId);
                    symbol = base + '/' + quote;
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let side = this.safeString (order, 'flag');
        if (side !== undefined) {
            side = (side === 'sale') ? 'sell' : 'buy';
        }
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'number');
        const remaining = this.safeNumber (order, 'numberOver');
        const filled = this.safeNumber (order, 'numberDeal');
        let timestamp = this.safeInteger (order, 'timestamp');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp (order, 'created');
        }
        const cost = this.safeNumber (order, 'orderTotalPrice');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
            'average': undefined,
        });
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' createOrder allows limit orders only');
        }
        const market = this.market (symbol);
        const orderType = (side === 'buy') ? '1' : '2';
        if (!this.password) {
            throw new ExchangeError (this.id + ' createOrder() requires you to set exchange.password = "YOUR_TRADING_PASSWORD" (a trade password is NOT THE SAME as your login password)');
        }
        const request = {
            'symbol': market['id'],
            'type': orderType,
            'price': this.priceToPrecision (symbol, price),
            'number': this.amountToPrecision (symbol, amount),
            'tradePwd': this.password,
        };
        const response = await this.tradePostAddEntrustSheet (this.extend (request, params));
        //
        //     {
        //         "status": 200,
        //         "msg": "",
        //         "data": {
        //             "id": "693248739",   // order id
        //             "uId": "2074056",    // uid
        //             "price": "100",      // price
        //             "number": "10",      // number
        //             "numberOver": "10",  // undealed
        //             "flag": "sale",      // flag
        //             "status": "0",       // unfilled
        //             "coinFrom": "vtc",
        //             "coinTo": "dkkt",
        //             "numberDeal": "0"    // dealed
        //         },
        //         "time": "1533035297",
        //         "microtime": "0.41892000 1533035297",
        //         "source": "api",
        //     }
        //
        const timestamp = this.parseMicrotime (this.safeString (response, 'microtime'));
        const order = this.extend ({
            'timestamp': timestamp,
        }, response['data']);
        return this.parseOrder (order, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'entrustSheetId': id,
        };
        const response = await this.tradePostCancelEntrustSheet (this.extend (request, params));
        //
        //     {
        //         "status":200,
        //         "msg":"",
        //         "data":{
        //             "updateAssetsData":{
        //                 "coin":"bz",
        //                 "over":"1000.00000000",
        //                 "lock":"-1000.00000000"
        //             },
        //             "assetsInfo":{
        //                 "coin":"bz",
        //                 "over":"9999.99999999",
        //                 "lock":"9999.99999999"
        //             }
        //         },
        //         "time":"1535464383",
        //         "microtime":"0.91558000 1535464383",
        //         "source":"api"
        //     }
        //
        return response;
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'ids': ids.join (','),
        };
        const response = await this.tradePostCancelEntrustSheet (this.extend (request, params));
        //
        //     {
        //         "status":200,
        //         "msg":"",
        //         "data":{
        //             "744173808":{
        //                 "updateAssetsData":{
        //                     "coin":"bz",
        //                     "over":"100.00000000",
        //                     "lock":"-100.00000000"
        //                 },
        //                 "assetsInfo":{
        //                     "coin":"bz",
        //                     "over":"899.99999999",
        //                     "lock":"19099.99999999"
        //                 }
        //             },
        //             "744173809":{
        //                 "updateAssetsData":{
        //                     "coin":"bz",
        //                     "over":"100.00000000",
        //                     "lock":"-100.00000000"
        //                 },
        //                 "assetsInfo":{
        //                     "coin":"bz",
        //                     "over":"999.99999999",
        //                     "lock":"18999.99999999"
        //                 }
        //             }
        //         },
        //         "time":"1535525649",
        //         "microtime":"0.05009400 1535525649",
        //         "source":"api"
        //     }
        //
        return response;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'entrustSheetId': id,
        };
        const response = await this.tradePostGetEntrustSheetInfo (this.extend (request, params));
        //
        //     {
        //         "status":200,
        //         "msg":"",
        //         "data":{
        //             "id":"708279852",
        //             "uId":"2074056",
        //             "price":"100.00000000",
        //             "number":"10.0000",
        //             "total":"0.00000000",
        //             "numberOver":"10.0000",
        //             "numberDeal":"0.0000",
        //             "flag":"sale",
        //             "status":"0",  //0:unfilled, 1:partial deal, 2:all transactions, 3:already cancelled
        //             "coinFrom":"bz",
        //             "coinTo":"usdt",
        //             "orderTotalPrice":"0",
        //             "created":"1533279876"
        //         },
        //         "time":"1533280294",
        //         "microtime":"0.36859200 1533280294",
        //         "source":"api"
        //     }
        //
        return this.parseOrder (response['data']);
    }

    async fetchOrdersWithMethod (method, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'coinFrom': market['baseId'],
            'coinTo': market['quoteId'],
            // 'type': 1, // optional integer, 1 = buy, 2 = sell
            // 'page': 1, // optional integer
            // 'pageSize': 100, // optional integer, max 100
            // 'startTime': 1510235730, // optional integer timestamp in seconds
            // 'endTime': 1510235730, // optional integer timestamp in seconds
        };
        if (limit !== undefined) {
            request['page'] = 1;
            request['pageSize'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000);
            // request['endTime'] = parseInt (since / 1000);
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "status": 200,
        //         "msg": "",
        //         "data": {
        //             "data": [
        //                 {
        //                     "id": "693248739",
        //                     "uid": "2074056",
        //                     "price": "100.00000000",
        //                     "number": "10.0000",
        //                     "total": "0.00000000",
        //                     "numberOver": "0.0000",
        //                     "numberDeal": "0.0000",
        //                     "flag": "sale",
        //                     "status": "3", // 0:unfilled, 1:partial deal, 2:all transactions, 3:already cancelled
        //                     "isNew": "N",
        //                     "coinFrom": "vtc",
        //                     "coinTo": "dkkt",
        //                     "created": "1533035300",
        //                 },
        //                 {
        //                     "id": "723086996",
        //                     "uid": "2074056",
        //                     "price": "100.00000000",
        //                     "number": "10.0000",
        //                     "total": "0.00000000",
        //                     "numberOver": "0.0000",
        //                     "numberDeal": "0.0000",
        //                     "flag": "sale",
        //                     "status": "3",
        //                     "isNew": "N",
        //                     "coinFrom": "bz",
        //                     "coinTo": "usdt",
        //                     "created": "1533523568",
        //                 },
        //             ],
        //             "pageInfo": {
        //                 "limit": "10",
        //                 "offest": "0",
        //                 "current_page": "1",
        //                 "page_size": "10",
        //                 "total_count": "17",
        //                 "page_count": "2",
        //             }
        //         },
        //         "time": "1533279329",
        //         "microtime": "0.15305300 1533279329",
        //         "source": "api"
        //     }
        //
        const orders = this.safeValue (response['data'], 'data', []);
        return this.parseOrders (orders, undefined, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('tradePostGetUserHistoryEntrustSheet', symbol, since, limit, params);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('tradePostGetUserNowEntrustSheet', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('tradePostGetUserHistoryEntrustSheet', symbol, since, limit, params);
    }

    parseTransactionStatus (status) {
        const statuses = {
            '1': 'pending',
            '2': 'pending',
            '3': 'pending',
            '4': 'ok',
            '5': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": '96275',
        //         "uid": '2109073',
        //         "wallet": '0xf4c4141c0127bc37b1d0c409a091920eba13ada7',
        //         "txid": '0xb7adfa52aa566f9ac112e3c01f77bd91179b19eab12092a9a5a8b33d5086e31d',
        //         "confirm": '12',
        //         "number": '0.50000000',
        //         "status": 4,
        //         "updated": '1534944168605',
        //         "addressUrl": 'https://etherscan.io/address/',
        //         "txidUrl": 'https://etherscan.io/tx/',
        //         "description": 'Ethereum',
        //         "coin": 'eth',
        //         "memo": ''
        //     }
        //
        //     {
        //         "id":"397574",
        //         "uid":"2033056",
        //         "wallet":"1AG1gZvQAYu3WBvgg7p4BMMghQD2gE693k",
        //         "txid":"",
        //         "confirm":"0",
        //         "number":"1000.00000000",
        //         "status":1,
        //         "updated":"0",
        //         "addressUrl":"http://omniexplorer.info/lookupadd.aspx?address=",
        //         "txidUrl":"http://omniexplorer.info/lookuptx.aspx?txid=",
        //         "description":"Tether",
        //         "coin":"usdt",
        //         "memo":""
        //     }
        //
        //     {
        //         "id":"153606",
        //         "uid":"2033056",
        //         "wallet":"1AG1gZvQAYu3WBvgg7p4BMMghQD2gE693k",
        //         "txid":"aa2b179f84cd6dedafd41845e0fbf7f01e14c0d71ea3140d03d6f5a9ccd93199",
        //         "confirm":"0",
        //         "number":"761.11110000",
        //         "status":4,
        //         "updated":"1536726133579",
        //         "addressUrl":"http://omniexplorer.info/lookupadd.aspx?address=",
        //         "txidUrl":"http://omniexplorer.info/lookuptx.aspx?txid=",
        //         "description":"Tether",
        //         "coin":"usdt",
        //         "memo":""
        //     }
        //
        // withdraw
        //
        //     {
        //         "id":397574,
        //         "email":"***@email.com",
        //         "coin":"usdt",
        //         "network_fee":"",
        //         "eid":23112
        //     }
        //
        let timestamp = this.safeInteger (transaction, 'updated');
        if (timestamp === 0) {
            timestamp = undefined;
        }
        const currencyId = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (currencyId, currency);
        const type = this.safeStringLower (transaction, 'type');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let fee = undefined;
        const feeCost = this.safeNumber (transaction, 'network_fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'code': code,
            };
        }
        return {
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'wallet'),
            'tag': this.safeString (transaction, 'memo'),
            'type': type,
            'amount': this.safeNumber (transaction, 'number'),
            'currency': code,
            'status': status,
            'updated': timestamp,
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionsByType (type, transactions, code = undefined, since = undefined, limit = undefined) {
        const result = [];
        for (let i = 0; i < transactions.length; i++) {
            const transaction = this.parseTransaction (this.extend ({
                'type': type,
            }, transactions[i]));
            result.push (transaction);
        }
        return this.filterByCurrencySinceLimit (result, code, since, limit);
    }

    parseTransactionType (type) {
        const types = {
            'deposit': 1,
            'withdrawal': 2,
        };
        return this.safeInteger (types, type, type);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsForType ('deposit', code, since, limit, params);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsForType ('withdrawal', code, since, limit, params);
    }

    async fetchTransactionsForType (type, code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency `code` argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'type': this.parseTransactionType (type),
        };
        if (since !== undefined) {
            request['startTime'] = parseInt (since / 1000).toString ();
        }
        if (limit !== undefined) {
            request['page'] = 1;
            request['pageSize'] = limit;
        }
        const response = await this.tradePostDepositOrWithdraw (this.extend (request, params));
        const transactions = this.safeValue (response['data'], 'data', []);
        return this.parseTransactionsByType (type, transactions, code, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'number': this.currencyToPrecision (code, amount),
            'address': address,
            // 'type': 'erc20', // omni, trc20, optional
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const response = await this.tradePostCoinOut (this.extend (request, params));
        //
        //     {
        //         "status":200,
        //         "msg":"",
        //         "data":{
        //             "id":397574,
        //             "email":"***@email.com",
        //             "coin":"usdt",
        //             "network_fee":"",
        //             "eid":23112
        //         },
        //         "time":1552641646,
        //         "microtime":"0.70304500 1552641646",
        //         "source":"api"
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.parseTransaction (data, currency);
    }

    nonce () {
        const currentTimestamp = this.seconds ();
        if (currentTimestamp > this.options['lastNonceTimestamp']) {
            this.options['lastNonceTimestamp'] = currentTimestamp;
            this.options['lastNonce'] = 100000;
        }
        this.options['lastNonce'] = this.sum (this.options['lastNonce'], 1);
        return this.options['lastNonce'];
    }

    sign (path, api = 'market', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.implodeHostname (this.urls['api'][api]);
        let url = baseUrl + '/' + this.capitalize (api) + '/' + path;
        let query = undefined;
        if (api === 'market') {
            query = this.urlencode (params);
            if (query.length) {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.rawencode (this.keysort (this.extend ({
                'apiKey': this.apiKey,
                'timeStamp': this.seconds (),
                'nonce': this.nonce (),
            }, params)));
            body += '&sign=' + this.hash (this.encode (body + this.secret));
            headers = { 'Content-type': 'application/x-www-form-urlencoded' };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const status = this.safeString (response, 'status');
        if (status !== undefined) {
            const feedback = this.id + ' ' + body;
            //
            //     {"status":-107,"msg":"","data":"","time":1535968848,"microtime":"0.89092200 1535968848","source":"api"}
            //
            if (status === '200') {
                //
                //     {"status":200,"msg":"","data":-200031,"time":1535999806,"microtime":"0.85476800 1535999806","source":"api"}
                //
                const code = this.safeInteger (response, 'data');
                if (code !== undefined) {
                    this.throwExactlyMatchedException (this.exceptions, code, feedback);
                    throw new ExchangeError (feedback);
                } else {
                    return; // no error
                }
            }
            this.throwExactlyMatchedException (this.exceptions, status, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
