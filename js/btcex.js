'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class btcex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'btcex',
            'name': 'BTCEX',
            'countries': [ 'CA' ], // Canada
            'version': 'v1',
            // hard limit of 6 requests per 200ms => 30 requests per 1000ms => 1000ms / 30 = 33.3333 ms between requests
            // 10 withdrawal requests per 30 seconds = (1000ms / rateLimit) / (1/3) = 90.1
            // cancels do not count towards rateLimit
            // only 'order-making' requests count towards ratelimit
            'rateLimit': 33.34,
            'certified': false,
            'pro': false,
            'urls': {
                'logo': '',
                'www': 'https://www.btcex.com/',
                'api': 'https://api.btcex.com',
                'doc': 'https://docs.btcex.com/',
                'fees': 'https://support.btcex.com/hc/en-us/articles/4415995130647',
                'referral': {
                    'url': '',
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRate': true,
                'fetchBorrowRateHistories': true,
                'fetchBorrowRateHistory': true,
                'fetchBorrowRates': true,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': false,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'setLeverage': true,
                'setMarginMode': false, // FTX only supports cross margin
                'setPositionMode': false,
                'withdraw': true,
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
                '3d': '259200',
                '1w': '604800',
                '2w': '1209600',
                '1M': '2592000',
            },
            'api': {
                'public': {
                    'get': {
                        // Market data
                        'get_last_trades_by_currency': 1,
                        'get_last_trades_by_instrument': 1,
                        'get_order_book': 1,
                        'tickers': 1,
                        'get_instruments': 1,
                        'get_tradingview_chart_data': 1,
                        // CMC
                        'cmc_spot_summary': 1,
                        'cmc_spot_ticker': 1,
                        'cmc_spot_orderbook': 1,
                        'cmc_market_trades': 1,
                        'cmc_contracts': 1,
                        'cmc_contract_orderbook': 1,
                        // CoinGecko
                        'coin_gecko_spot_pairs': 1,
                        'coin_gecko_spot_ticker': 1,
                        'coin_gecko_spot_orderbook': 1,
                        'coin_gecko_market_trades': 1,
                        'coin_gecko_contracts': 1,
                        'coin_gecko_contract_orderbook': 1,
                    },
                    'post': {
                    },
                },
                'private': {
                    'get': {
                    },
                    'post': {
                    },
                    'delete': {
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'margin': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.001'),
                    'taker': this.parseNumber ('0.001'),
                },
                'perpetual': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                },
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetGetInstruments (params);
        const markets = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647533492507,
        //         "usOut":1647533492511,
        //         "usDiff":4,
        //         "result":[{
        //             "currency":"BTC",
        //             "base_currency":"USDT",
        //             "contract_size":"0.01",
        //             "creation_timestamp":"1632384961348",
        //             "expiration_timestamp":"1648195200000",
        //             "instrument_name":"BTC-25MAR22",
        //             "show_name":"BTC-25MAR22",
        //             "is_active":true,
        //             "kind":"future",
        //             "leverage":0,
        //             "maker_commission":"10",
        //             "taker_commission":"17",
        //             "min_trade_amount":"0.01",
        //             "option_type":"init",
        //             "quote_currency":"USDT",
        //             "settlement_period":"week",
        //             "strike":"0",
        //             "tick_size":"0.1",
        //             "instr_multiple":"0.01",
        //             "order_price_low_rate":"0.8",
        //             "order_price_high_rate":"1.2",
        //             "order_price_limit_type":0,
        //             "min_qty":"0.01",
        //             "min_notional":"0",
        //             "support_trace_trade":false
        //         }]
        //     }
        //
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'instrument_name');
            const type = this.safeString (market, 'kind');
            const contract = (type === 'future');
            const baseId = this.safeString (market, 'base_currency');
            let quoteId = this.safeString (market, 'quote_currency');
            const settlementPeriod = this.safeValue (market, 'settlement_period');
            const margin = !contract;
            const perpetual = (settlementPeriod === 'perpetual');
            const swap = perpetual;
            const spot = (type === 'spot');
            const option = (type === 'option');
            const future = !swap && (type === 'future');
            const expiry = this.safeInteger (market, 'expiration_timestamp');
            const strike = this.safeString (market, 'strike');
            const optionType = this.safeString (market, 'option_type');
            const base = this.safeCurrencyCode (baseId);
            const settleId = quoteId;
            const settle = this.safeCurrencyCode (settleId);
            if (!spot) {
                quoteId = this.safeString (market, 'currency');
            }
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = quote + '/' + base;
            if (option || future) {
                symbol = symbol + ':' + settle + '-' + this.yymmdd (expiry, '');
                if (option) {
                    const letter = (optionType === 'call') ? 'C' : 'P';
                    symbol = symbol + ':' + this.numberToString (strike) + ':' + letter;
                }
            }
            const minTradeAmount = this.safeString (market, 'min_trade_amount');
            const tickSize = this.safeString (market, 'tick_size');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': type,
                'spot': spot,
                'margin': margin,
                'swap': swap,
                'future': future,
                'option': option,
                'active': this.safeValue (market, 'enabled'),
                'contract': contract,
                'linear': contract ? true : undefined,
                'inverse': contract ? false : undefined,
                'contractSize': this.safeString (market, 'contract_size'),
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': strike,
                'optionType': optionType,
                'precision': {
                    'amount': minTradeAmount,
                    'price': tickSize,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': this.safeString (market, 'leverage'),
                    },
                    'amount': {
                        'min': minTradeAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': tickSize,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "best_ask_amount":"0.20962",
        //         "best_ask_price":"40491.7",
        //         "best_bid_amount":"0.08855",
        //         "best_bid_price":"40491.6",
        //         "instrument_name":"BTC-USDT",
        //         "last_price":"40493",
        //         "mark_price":"40493.10644717",
        //         "state":"open",
        //         "stats":{
        //             "high":"41468.8",
        //             "low":"40254.9",
        //             "price_change":"-0.0159",
        //             "volume":"3847.35240000000000005"
        //         },
        //         "timestamp":"1647569486224"
        //     }
        //
        const marketId = this.safeString (ticker, 'instrument_name');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const stats = this.safeValue (ticker, 'stats');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (stats, 'high'),
            'low': this.safeString (stats, 'low'),
            'bid': this.safeString (ticker, 'best_bid_price'),
            'bidVolume': this.safeString (ticker, 'best_bid_amount'),
            'ask': this.safeString (ticker, 'best_ask_price'),
            'askVolume': this.safeString (ticker, 'best_ask_amount'),
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'last_price'),
            'last': this.safeString (ticker, 'last_price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (stats, 'price_change'),
            'average': undefined,
            'baseVolume': this.safeString (stats, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetTickers (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647569487238,
        //         "usOut":1647569487240,
        //         "usDiff":2,
        //         "result":[{
        //             "best_ask_amount":"0.20962",
        //             "best_ask_price":"40491.7",
        //             "best_bid_amount":"0.08855",
        //             "best_bid_price":"40491.6",
        //             "instrument_name":"BTC-USDT",
        //             "last_price":"40493",
        //             "mark_price":"40493.10644717",
        //             "state":"open",
        //             "stats":{
        //                 "high":"41468.8",
        //                 "low":"40254.9",
        //                 "price_change":"-0.0159",
        //                 "volume":"3847.35240000000000005"
        //             },
        //             "timestamp":"1647569486224"
        //         }]
        //     }
        //
        const ticker = this.safeValue (result, 0);
        return this.parseTicker (ticker, market);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
        };
        const response = await this.publicGetGetOrderBook (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647573916524,
        //         "usOut":1647573916526,
        //         "usDiff":2,
        //         "result":{
        //             "asks":[["10155.00000","0.200","186.980","0.000"],["10663.00000","0.200","217.480","0.000"]],
        //             "bids":[["7896.00000","0.200","1.000","0.000"],["7481.00000","0.200","1.000","0.000"]],
        //             "timestamp":"1647573916525",
        //             "instrument_name":"BTC-25MAR22-32000-C",
        //             "version":1002541
        //         }
        //     }
        //
        const timestamp = this.safeInteger (result, 'timestamp');
        return this.parseOrderBook (result, symbol, timestamp);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "close":177.23,
        //         "high":177.45,
        //         "low":177.2,
        //         "open":177.43,
        //         "startTime":"2019-10-17T13:27:00+00:00",
        //         "time":1571318820000.0,
        //         "volume":0.0
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
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 500;
        }
        const request = {
            'resolution': this.timeframes[timeframe],
            'instrument_name': market['id'],
            // 'start_timestamp': 0,
            // 'end_timestamp': 0,
        };
        if (market['spot']) {
            request['instrument_name'] = market['symbol'].replace ('/', '-');
        }
        const timeframeInSeconds = this.parseTimeframe (timeframe);
        const timeframeInMilliseconds = timeframeInSeconds * 1000;
        if (since === undefined) {
            request['end_timestamp'] = this.milliseconds ();
            request['start_timestamp'] = request['end_timestamp'] - (limit * timeframeInMilliseconds);
        } else {
            request['start_timestamp'] = since;
            request['end_timestamp'] = this.sum (request['start_timestamp'], limit * timeframeInMilliseconds);
        }
        const response = await this.publicGetGetTradingviewChartData (this.extend (request, params));
        const result = this.safeValue (response, 'result', []);
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647578562427,
        //         "usOut":1647578562428,
        //         "usDiff":1,
        //         "result":[{
        //             "tick":1647547200,
        //             "open":"40868.16800000",
        //             "high":"40877.65600000",
        //             "low":"40647.00000000",
        //             "close":"40699.10000000",
        //             "volume":"100.27789000",
        //             "cost":"4083185.78337596"
        //         }]
        //     }
        //
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "amount":"0.0003",
        //         "direction":"sell",
        //         "iv":"0",
        //         "price":"40767.18",
        //         "timestamp":"1647582687050",
        //         "instrument_name":"BTC-USDT-SPOT",
        //         "trade_id":57499240
        //     }
        //
        const id = this.safeString (trade, 'trade_id');
        const marketId = this.safeString (trade, 'instrument_name');
        const symbol = this.safeSymbol (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const side = this.safeString (trade, 'direction');
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'amount');
        const liquidity = this.safeString (trade, 'liquidity');
        let takerOrMaker = undefined;
        if (liquidity !== undefined) {
            // M = maker, T = taker, MT = both
            takerOrMaker = (liquidity === 'M') ? 'maker' : 'taker';
        }
        const feeCostString = this.safeString (trade, 'fee');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (trade, 'order_id'),
            'type': this.safeString (trade, 'order_type'),
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'instrument_name': market['id'],
            // 'start_id' : 0,
            // 'end_id': 0,
            // 'sorting': 'asc', // asc | desc
        };
        if (limit !== undefined) {
            request['count'] = limit; // default 10
        }
        const response = await this.publicGetGetLastTradesByInstrument (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "jsonrpc":"2.0",
        //         "usIn":1647582703220,
        //         "usOut":1647582703253,
        //         "usDiff":33,
        //         "result":{
        //             "trades":[{
        //                 "amount":"0.0003",
        //                 "direction":"sell",
        //                 "iv":"0",
        //                 "price":"40767.18",
        //                 "timestamp":"1647582687050",
        //                 "instrument_name":"BTC-USDT-SPOT",
        //                 "trade_id":57499240
        //             }],
        //             "has_more":true
        //         }
        //     }
        //
        const trades = this.safeValue (result, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + 'api/' + this.version + '/' + api + '/' + path;
        if (api === 'public') {
            if (Object.keys (params).length) {
                request += '?' + this.urlencode (params);
            }
        }
        const url = this.urls['api'] + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        const error = this.safeValue (response, 'error');
        if (error) {
            const feedback = this.id + ' ' + body;
            const error = this.safeString (response, 'error');
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
