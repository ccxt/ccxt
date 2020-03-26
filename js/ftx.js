'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class ftx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftx',
            'name': 'FTX',
            'countries': [ 'HK' ],
            'rateLimit': 100,
            'certified': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg',
                'www': 'https://ftx.com',
                'api': {
                    'public': 'https://ftx.com',
                    'private': 'https://ftx.com',
                },
                'doc': 'https://github.com/ftexchange/ftx',
                'fees': 'https://ftexchange.zendesk.com/hc/en-us/articles/360024479432-Fees',
                'referral': 'https://ftx.com/#a=1623029',
            },
            'has': {
                'cancelAllOrders': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
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
            },
            'api': {
                'public': {
                    'get': [
                        'coins',
                        'markets',
                        'markets/{market_name}',
                        'markets/{market_name}/orderbook', // ?depth={depth}
                        'markets/{market_name}/trades', // ?limit={limit}&start_time={start_time}&end_time={end_time}
                        'markets/{market_name}/candles', // ?resolution={resolution}&limit={limit}&start_time={start_time}&end_time={end_time}
                        'futures',
                        'futures/{future_name}',
                        'futures/{future_name}/stats',
                        'funding_rates',
                        'lt/tokens',
                        'lt/{token_name}',
                    ],
                },
                'private': {
                    'get': [
                        'account',
                        'positions',
                        'wallet/coins',
                        'wallet/balances',
                        'wallet/deposit_address/{coin}',
                        'wallet/deposits',
                        'wallet/withdrawals',
                        'orders', // ?market={market}
                        'orders/history', // ?market={market}
                        'orders/{order_id}',
                        'orders/by_client_id/{client_order_id}',
                        'conditional_orders', // ?market={market}
                        'conditional_orders/history', // ?market={market}
                        'fills', // ?market={market}
                        'funding_payments',
                        'lt/balances',
                        'lt/creations',
                        'lt/redemptions',
                        'subaccounts',
                        'subaccounts/{nickname}/balances',
                    ],
                    'post': [
                        'account/leverage',
                        'wallet/withdrawals',
                        'orders',
                        'conditional_orders',
                        'lt/{token_name}/create',
                        'lt/{token_name}/redeem',
                        'subaccounts',
                        'subaccounts/update_name',
                        'subaccounts/transfer',
                    ],
                    'delete': [
                        'orders/{order_id}',
                        'orders/by_client_id/{client_order_id}',
                        'orders',
                        'conditional_orders/{order_id}',
                        'subaccounts',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.02 / 100,
                    'taker': 0.07 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.07 / 100],
                            [1000000, 0.06 / 100],
                            [5000000, 0.055 / 100],
                            [10000000, 0.05 / 100],
                            [15000000, 0.045 / 100],
                            [35000000, 0.04 / 100],
                        ],
                        'maker': [
                            [0, 0.02 / 100],
                            [1000000, 0.02 / 100],
                            [5000000, 0.015 / 100],
                            [10000000, 0.015 / 100],
                            [15000000, 0.01 / 100],
                            [35000000, 0.01 / 100],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'exceptions': {
                'exact': {
                    'Not enough balances': InsufficientFunds, // {"error":"Not enough balances","success":false}
                    'InvalidPrice': InvalidOrder, // {"error":"Invalid price","success":false}
                    'Size too small': InvalidOrder, // {"error":"Size too small","success":false}
                    'Missing parameter price': InvalidOrder, // {"error":"Missing parameter price","success":false}
                    'Order not found': OrderNotFound, // {"error":"Order not found","success":false}
                },
                'broad': {
                    'Invalid parameter': BadRequest, // {"error":"Invalid parameter start_time","success":false}
                    'The requested URL was not found on the server': BadRequest,
                    'No such coin': BadRequest,
                    'No such market': BadRequest,
                    'An unexpected error occurred': ExchangeError, // {"error":"An unexpected error occurred, please try again later (58BC21C795).","success":false}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                // support for canceling conditional orders
                // https://github.com/ccxt/ccxt/issues/6669
                'cancelOrder': {
                    'method': 'privateDeleteOrdersOrderId', // privateDeleteConditionalOrdersOrderId
                },
                'fetchOpenOrders': {
                    'method': 'privateGetOrders', // privateGetConditionalOrders
                },
                'fetchOrders': {
                    'method': 'privateGetOrdersHistory', // privateGetConditionalOrdersHistory
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCoins (params);
        const currencies = this.safeValue (response, 'result', []);
        //
        //     {
        //         "success":true,
        //         "result": [
        //             {"id":"BTC","name":"Bitcoin"},
        //             {"id":"ETH","name":"Ethereum"},
        //             {"id":"ETHMOON","name":"10X Long Ethereum Token","underlying":"ETH"},
        //             {"id":"EOSBULL","name":"3X Long EOS Token","underlying":"EOS"},
        //         ],
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': name,
                'active': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'withdraw': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.37,
        //                 "baseCurrency":null,
        //                 "bid":170.31,
        //                 "change1h":-0.019001554672655036,
        //                 "change24h":-0.024841165359738997,
        //                 "changeBod":-0.03816406029469881,
        //                 "enabled":true,
        //                 "last":170.37,
        //                 "name":"ETH-PERP",
        //                 "price":170.37,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":null,
        //                 "quoteVolume24h":7742164.59889,
        //                 "sizeIncrement":0.001,
        //                 "type":"future",
        //                 "underlying":"ETH",
        //                 "volumeUsd24h":7742164.59889
        //             },
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'result', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString2 (market, 'baseCurrency', 'underlying');
            const quoteId = this.safeString (market, 'quoteCurrency', 'USD');
            const type = this.safeString (market, 'type');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            // check if a market is a spot or future market
            const symbol = (type === 'future') ? this.safeString (market, 'name') : (base + '/' + quote);
            const active = this.safeValue (market, 'enabled');
            const sizeIncrement = this.safeFloat (market, 'sizeIncrement');
            const priceIncrement = this.safeFloat (market, 'priceIncrement');
            const precision = {
                'amount': sizeIncrement,
                'price': priceIncrement,
            };
            const entry = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'future': (type === 'future'),
                'spot': (type === 'spot'),
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': sizeIncrement,
                        'max': undefined,
                    },
                    'price': {
                        'min': priceIncrement,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            };
            result.push (entry);
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "ask":171.29,
        //         "baseCurrency":null, // base currency for spot markets
        //         "bid":171.24,
        //         "change1h":-0.0012244897959183673,
        //         "change24h":-0.031603346901854366,
        //         "changeBod":-0.03297013492914808,
        //         "enabled":true,
        //         "last":171.44,
        //         "name":"ETH-PERP",
        //         "price":171.29,
        //         "priceIncrement":0.01,
        //         "quoteCurrency":null, // quote currency for spot markets
        //         "quoteVolume24h":8570651.12113,
        //         "sizeIncrement":0.001,
        //         "type":"future",
        //         "underlying":"ETH", // null for spot markets
        //         "volumeUsd24h":8570651.12113,
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'name');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            const type = this.safeString (ticker, 'type');
            if (type === 'future') {
                symbol = marketId;
            } else {
                const base = this.safeCurrencyCode (this.safeString (ticker, 'baseCurrency'));
                const quote = this.safeCurrencyCode (this.safeString (ticker, 'quoteCurrency'));
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat (ticker, 'last');
        const timestamp = this.milliseconds ();
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
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
            'percentage': this.safeFloat (ticker, 'change24h'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeFloat (ticker, 'quoteVolume24h'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        const response = await this.publicGetMarketsMarketName (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "ask":171.29,
        //             "baseCurrency":null, // base currency for spot markets
        //             "bid":171.24,
        //             "change1h":-0.0012244897959183673,
        //             "change24h":-0.031603346901854366,
        //             "changeBod":-0.03297013492914808,
        //             "enabled":true,
        //             "last":171.44,
        //             "name":"ETH-PERP",
        //             "price":171.29,
        //             "priceIncrement":0.01,
        //             "quoteCurrency":null, // quote currency for spot markets
        //             "quoteVolume24h":8570651.12113,
        //             "sizeIncrement":0.001,
        //             "type":"future",
        //             "underlying":"ETH", // null for spot markets
        //             "volumeUsd24h":8570651.12113,
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        const tickers = this.safeValue (response, 'result', []);
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit; // max 100, default 20
        }
        const response = await this.publicGetMarketsMarketNameOrderbook (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "asks":[
        //                 [171.95,279.865],
        //                 [171.98,102.42],
        //                 [171.99,124.11],
        //             ],
        //             "bids":[
        //                 [171.93,69.749],
        //                 [171.9,288.325],
        //                 [171.88,87.47],
        //             ],
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrderBook (result);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
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
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        // max 1501 candles, including the current candle when since is not specified
        limit = (limit === undefined) ? 1501 : limit;
        if (since === undefined) {
            request['end_time'] = this.seconds ();
            request['limit'] = limit;
            request['start_time'] = request['end_time'] - limit * this.parseTimeframe (timeframe);
        } else {
            request['start_time'] = parseInt (since / 1000);
            request['limit'] = limit;
            request['end_time'] = this.sum (request['start_time'], limit * this.parseTimeframe (timeframe));
        }
        const response = await this.publicGetMarketsMarketNameCandles (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result":[
        //             {
        //                 "close":177.23,
        //                 "high":177.45,
        //                 "low":177.2,
        //                 "open":177.43,
        //                 "startTime":"2019-10-17T13:27:00+00:00",
        //                 "time":1571318820000.0,
        //                 "volume":0.0
        //             },
        //             {
        //                 "close":177.26,
        //                 "high":177.33,
        //                 "low":177.23,
        //                 "open":177.23,
        //                 "startTime":"2019-10-17T13:28:00+00:00",
        //                 "time":1571318880000.0,
        //                 "volume":0.0
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":1715826,
        //         "liquidation":false,
        //         "price":171.62,
        //         "side":"buy",
        //         "size":2.095,
        //         "time":"2019-10-18T12:59:54.288166+00:00"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "fee": 20.1374935,
        //         "feeRate": 0.0005,
        //         "future": "EOS-0329",
        //         "id": 11215,
        //         "liquidity": "taker",
        //         "market": "EOS-0329",
        //         "baseCurrency": null,
        //         "quoteCurrency": null,
        //         "orderId": 8436981,
        //         "price": 4.201,
        //         "side": "buy",
        //         "size": 9587,
        //         "time": "2019-03-27T19:15:10.204619+00:00",
        //         "type": "order"
        //     }
        //
        const id = this.safeString (trade, 'id');
        const takerOrMaker = this.safeString (trade, 'liquidity');
        const marketId = this.safeString (trade, 'market');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const base = this.safeCurrencyCode (this.safeString (trade, 'baseCurrency'));
                const quote = this.safeCurrencyCode (this.safeString (trade, 'quoteCurrency'));
                if ((base !== undefined) && (quote !== undefined)) {
                    symbol = base + '/' + quote;
                } else {
                    symbol = marketId;
                }
            }
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'side');
        let cost = undefined;
        if (price !== undefined && amount !== undefined) {
            cost = price * amount;
        }
        let fee = undefined;
        const feeCost = this.safeFloat (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'rate': this.safeFloat (trade, 'feeRate'),
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
            // start_time doesn't work without end_time
            request['end_time'] = this.seconds ();
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsMarketNameTrades (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {
        //                 "id":1715826,
        //                 "liquidation":false,
        //                 "price":171.62,
        //                 "side":"buy",
        //                 "size":2.095,
        //                 "time":"2019-10-18T12:59:54.288166+00:00"
        //             },
        //             {
        //                 "id":1715763,
        //                 "liquidation":false,
        //                 "price":171.89,
        //                 "side":"sell",
        //                 "size":1.477,
        //                 "time":"2019-10-18T12:58:38.443734+00:00"
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "backstopProvider": true,
        //             "collateral": 3568181.02691129,
        //             "freeCollateral": 1786071.456884368,
        //             "initialMarginRequirement": 0.12222384240257728,
        //             "liquidating": false,
        //             "maintenanceMarginRequirement": 0.07177992558058484,
        //             "makerFee": 0.0002,
        //             "marginFraction": 0.5588433331419503,
        //             "openMarginFraction": 0.2447194090423075,
        //             "takerFee": 0.0005,
        //             "totalAccountValue": 3568180.98341129,
        //             "totalPositionSize": 6384939.6992,
        //             "username": "user@domain.com",
        //             "positions": [
        //                 {
        //                     "cost": -31.7906,
        //                     "entryPrice": 138.22,
        //                     "future": "ETH-PERP",
        //                     "initialMarginRequirement": 0.1,
        //                     "longOrderSize": 1744.55,
        //                     "maintenanceMarginRequirement": 0.04,
        //                     "netSize": -0.23,
        //                     "openSize": 1744.32,
        //                     "realizedPnl": 3.39441714,
        //                     "shortOrderSize": 1732.09,
        //                     "side": "sell",
        //                     "size": 0.23,
        //                     "unrealizedPnl": 0,
        //                 },
        //             ],
        //         },
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'maker': this.safeFloat (result, 'makerFee'),
            'taker': this.safeFloat (result, 'takerFee'),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletBalances (params);
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "coin": "USDTBEAR",
        //                 "free": 2320.2,
        //                 "total": 2340.2
        //             },
        //         ],
        //     }
        //
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'result', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'coin'));
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'free');
            account['total'] = this.safeFloat (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'open': 'open',
            'closed': 'closed', // filled or canceled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // limit orders - fetchOrder, fetchOrders, fetchOpenOrders, createOrder
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "filledSize": 0,
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "price": 0.306525,
        //         "remainingSize": 31431,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "limit",
        //         "reduceOnly": false,
        //         "ioc": false,
        //         "postOnly": false,
        //         "clientId": null,
        //     }
        //
        // market orders - fetchOrder, fetchOrders, fetchOpenOrders, createOrder
        //
        //     {
        //         "avgFillPrice": 2666.0,
        //         "clientId": None,
        //         "createdAt": "2020-02-12T00: 53: 49.009726+00: 00",
        //         "filledSize": 0.0007,
        //         "future": None,
        //         "id": 3109208514,
        //         "ioc": True,
        //         "market": "BNBBULL/USD",
        //         "postOnly": False,
        //         "price": None,
        //         "reduceOnly": False,
        //         "remainingSize": 0.0,
        //         "side": "buy",
        //         "size": 0.0007,
        //         "status": "closed",
        //         "type": "market"
        //     }
        //
        // createOrder (conditional, "stop", "trailingStop", or "takeProfit")
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "triggerPrice": 0.306525,
        //         "orderId": null,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "stop",
        //         "orderPrice": null,
        //         "error": null,
        //         "triggeredAt": null,
        //         "reduceOnly": false
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        const filled = this.safeFloat (order, 'filledSize');
        const remaining = this.safeFloat (order, 'remainingSize');
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const amount = this.safeFloat (order, 'size');
        const average = this.safeFloat (order, 'avgFillPrice');
        const price = this.safeFloat2 (order, 'price', 'triggerPrice', average);
        let cost = undefined;
        if (filled !== undefined && price !== undefined) {
            cost = filled * price;
        }
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'triggeredAt'));
        const clientOrderId = this.safeString (order, 'clientId');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side, // "buy" or "sell"
            // 'price': 0.306525, // send null for market orders
            'type': type, // "limit", "market", "stop", "trailingStop", or "takeProfit"
            'size': parseFloat (this.amountToPrecision (symbol, amount)),
            // 'reduceOnly': false, // optional, default is false
            // 'ioc': false, // optional, default is false, limit or market orders only
            // 'postOnly': false, // optional, default is false, limit or market orders only
            // 'clientId': 'abcdef0123456789', // string, optional, client order id, limit or market orders only
        };
        let priceToPrecision = undefined;
        if (price !== undefined) {
            priceToPrecision = parseFloat (this.priceToPrecision (symbol, price));
        }
        let method = 'privatePostConditionalOrders';
        if (type === 'limit') {
            method = 'privatePostOrders';
            request['price'] = priceToPrecision;
        } else if (type === 'market') {
            method = 'privatePostOrders';
            request['price'] = null;
        } else if ((type === 'stop') || (type === 'takeProfit')) {
            request['triggerPrice'] = priceToPrecision;
            // request['orderPrice'] = number; // optional, order type is limit if this is specified, otherwise market
        } else if (type === 'trailingStop') {
            request['trailValue'] = priceToPrecision; // negative for "sell", positive for "buy"
        } else {
            throw new InvalidOrder (this.id + ' createOrder () does not support order type ' + type + ', only limit, market, stop, trailingStop, or takeProfit orders are supported');
        }
        const response = await this[method] (this.extend (request, params));
        //
        // orders
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 0,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "remainingSize": 31431,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null,
        //             }
        //         ]
        //     }
        //
        // conditional orders
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "triggerPrice": 0.306525,
        //                 "orderId": null,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "stop",
        //                 "orderPrice": null,
        //                 "error": null,
        //                 "triggeredAt": null,
        //                 "reduceOnly": false
        //             }
        //         ]
        //     }
        //
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const defaultMethod = this.safeString (options, 'method', 'privateDeleteOrdersOrderId');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        if ((type === 'stop') || (type === 'trailingStop') || (type === 'takeProfit')) {
            method = 'privateDeleteConditionalOrdersOrderId';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": "Order queued for cancelation"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return result;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'market': market['id'], // optional
            'conditionalOrdersOnly': false, // cancel conditional orders only
            'limitOrdersOnly': false, // cancel existing limit orders (non-conditional orders) only
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "success": true,
        //         "result": "Orders queued for cancelation"
        //     }
        //
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privateGetOrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //             "filledSize": 10,
        //             "future": "XRP-PERP",
        //             "id": 9596912,
        //             "market": "XRP-PERP",
        //             "price": 0.306525,
        //             "avgFillPrice": 0.306526,
        //             "remainingSize": 31421,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "limit",
        //             "reduceOnly": false,
        //             "ioc": false,
        //             "postOnly": false,
        //             "clientId": null
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetOrders');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        if ((type === 'stop') || (type === 'trailingStop') || (type === 'takeProfit')) {
            method = 'privateGetConditionalOrders';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 10,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "avgFillPrice": 0.306526,
        //                 "remainingSize": 31421,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'fetchOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetOrdersHistory');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        if ((type === 'stop') || (type === 'trailingStop') || (type === 'takeProfit')) {
            method = 'privateGetConditionalOrdersHistory';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 10,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "avgFillPrice": 0.306526,
        //                 "remainingSize": 31421,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        const response = await this.privateGetFills (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "fee": 20.1374935,
        //                 "feeRate": 0.0005,
        //                 "future": "EOS-0329",
        //                 "id": 11215,
        //                 "liquidity": "taker",
        //                 "market": "EOS-0329",
        //                 "baseCurrency": null,
        //                 "quoteCurrency": null,
        //                 "orderId": 8436981,
        //                 "price": 4.201,
        //                 "side": "buy",
        //                 "size": 9587,
        //                 "time": "2019-03-27T19:15:10.204619+00:00",
        //                 "type": "order"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'size': amount,
            'address': address,
            // 'password': 'string', // optional withdrawal password if it is required for your account
            // 'code': '192837', // optional 2fa code if it is required for your account
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostWalletWithdrawals (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "USDTBEAR",
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null",
        //             "fee": 0,
        //             "id": 1,
        //             "size": "20.2",
        //             "status": "requested",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "null"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetWalletDepositAddressCoin (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        const tag = this.safeString (result, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            // what are other statuses here?
            'confirmed': 'ok', // deposits
            'complete': 'ok', // withdrawals
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction) {
        //
        // fetchDeposits
        //
        //     {
        //         "coin": "TUSD",
        //         "confirmations": 64,
        //         "confirmedTime": "2019-03-05T09:56:55.728933+00:00",
        //         "fee": 0,
        //         "id": 1,
        //         "sentTime": "2019-03-05T09:56:55.735929+00:00",
        //         "size": "99.0",
        //         "status": "confirmed",
        //         "time": "2019-03-05T09:56:55.728933+00:00",
        //         "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "coin": "TUSD",
        //         "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //         "tag": "null",
        //         "fee": 0,
        //         "id": 1,
        //         "size": "99.0",
        //         "status": "complete",
        //         "time": "2019-03-05T09:56:55.728933+00:00",
        //         "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //     }
        //
        const code = this.safeCurrencyCode (this.safeString (transaction, 'coin'));
        const id = this.safeInteger (transaction, 'id');
        const amount = this.safeFloat (transaction, 'size');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const txid = this.safeString (transaction, 'txid');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'tag');
        const fee = this.safeFloat (transaction, 'fee');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': undefined,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletDeposits (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "TUSD",
        //             "confirmations": 64,
        //             "confirmedTime": "2019-03-05T09:56:55.728933+00:00",
        //             "fee": 0,
        //             "id": 1,
        //             "sentTime": "2019-03-05T09:56:55.735929+00:00",
        //             "size": "99.0",
        //             "status": "confirmed",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTransactions (result);
    }

    async fetchWithdrawals (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletWithdrawals (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "TUSD",
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null",
        //             "fee": 0,
        //             "id": 1,
        //             "size": "99.0",
        //             "status": "complete",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTransactions (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'][api] + request;
        if (method !== 'POST') {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + method + request;
            headers = {
                'FTX-KEY': this.apiKey,
                'FTX-TS': timestamp,
            };
            if (method === 'POST') {
                body = this.json (query);
                auth += body;
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            headers['FTX-SIGN'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        //
        //     {"error":"Invalid parameter start_time","success":false}
        //     {"error":"Not enough balances","success":false}
        //
        const success = this.safeValue (response, 'success');
        if (!success) {
            const feedback = this.id + ' ' + body;
            const error = this.safeString (response, 'error');
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
