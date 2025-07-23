//  ---------------------------------------------------------------------------

import bybitRest from '../bybit.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError, BadRequest } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, OHLCV, Str, Strings, Ticker, OrderBook, Order, Trade, Tickers, Position, Balances, OrderType, OrderSide, Num, Dict, Liquidation } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bybit extends bybitRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'createOrderWs': true,
                'editOrderWs': true,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'cancelOrderWs': true,
                'cancelOrdersWs': false,
                'cancelAllOrdersWs': false,
                'fetchTradesWs': false,
                'fetchBalanceWs': false,
                'watchBalance': true,
                'watchBidsAsks': true,
                'watchLiquidations': true,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': false,
                'watchMyLiquidationsForSymbols': false,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchPositions': true,
                'watchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.{hostname}/v5/public/spot',
                            'inverse': 'wss://stream.{hostname}/v5/public/inverse',
                            'option': 'wss://stream.{hostname}/v5/public/option',
                            'linear': 'wss://stream.{hostname}/v5/public/linear',
                        },
                        'private': {
                            'spot': {
                                'unified': 'wss://stream.{hostname}/v5/private',
                                'nonUnified': 'wss://stream.{hostname}/spot/private/v3',
                            },
                            'contract': 'wss://stream.{hostname}/v5/private',
                            'usdc': 'wss://stream.{hostname}/trade/option/usdc/private/v1',
                            'trade': 'wss://stream.bybit.com/v5/trade',
                        },
                    },
                },
                'test': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream-testnet.{hostname}/v5/public/spot',
                            'inverse': 'wss://stream-testnet.{hostname}/v5/public/inverse',
                            'linear': 'wss://stream-testnet.{hostname}/v5/public/linear',
                            'option': 'wss://stream-testnet.{hostname}/v5/public/option',
                        },
                        'private': {
                            'spot': {
                                'unified': 'wss://stream-testnet.{hostname}/v5/private',
                                'nonUnified': 'wss://stream-testnet.{hostname}/spot/private/v3',
                            },
                            'contract': 'wss://stream-testnet.{hostname}/v5/private',
                            'usdc': 'wss://stream-testnet.{hostname}/trade/option/usdc/private/v1',
                            'trade': 'wss://stream-testnet.bybit.com/v5/trade',
                        },
                    },
                },
                'demotrading': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.{hostname}/v5/public/spot',
                            'inverse': 'wss://stream.{hostname}/v5/public/inverse',
                            'option': 'wss://stream.{hostname}/v5/public/option',
                            'linear': 'wss://stream.{hostname}/v5/public/linear',
                        },
                        'private': {
                            'spot': {
                                'unified': 'wss://stream-demo.{hostname}/v5/private',
                                'nonUnified': 'wss://stream-demo.{hostname}/spot/private/v3',
                            },
                            'contract': 'wss://stream-demo.{hostname}/v5/private',
                            'usdc': 'wss://stream-demo.{hostname}/trade/option/usdc/private/v1',
                            'trade': 'wss://stream-demo.bybit.com/v5/trade',
                        },
                    },
                },
            },
            'options': {
                'watchTicker': {
                    'name': 'tickers', // 'tickers' for 24hr statistical ticker or 'tickers_lt' for leverage token ticker
                },
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
                'watchMyTrades': {
                    // filter execType: https://bybit-exchange.github.io/docs/api-explorer/v5/position/execution
                    'filterExecTypes': [
                        'Trade', 'AdlTrade', 'BustTrade', 'Settle',
                    ],
                },
                'spot': {
                    'timeframes': {
                        '1m': '1m',
                        '3m': '3m',
                        '5m': '5m',
                        '15m': '15m',
                        '30m': '30m',
                        '1h': '1h',
                        '2h': '2h',
                        '4h': '4h',
                        '6h': '6h',
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                },
                'contract': {
                    'timeframes': {
                        '1m': '1',
                        '3m': '3',
                        '5m': '5',
                        '15m': '15',
                        '30m': '30',
                        '1h': '60',
                        '2h': '120',
                        '4h': '240',
                        '6h': '360',
                        '12h': '720',
                        '1d': 'D',
                        '1w': 'W',
                        '1M': 'M',
                    },
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 18000,
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async getUrlByMarketType (symbol: Str = undefined, isPrivate = false, method: Str = undefined, params = {}) {
        const accessibility = isPrivate ? 'private' : 'public';
        let isUsdcSettled = undefined;
        let isSpot = undefined;
        let type = undefined;
        let market = undefined;
        let url = this.urls['api']['ws'];
        if (symbol !== undefined) {
            market = this.market (symbol);
            isUsdcSettled = market['settle'] === 'USDC';
            type = market['type'];
        } else {
            [ type, params ] = this.handleMarketTypeAndParams (method, undefined, params);
            let defaultSettle = this.safeString (this.options, 'defaultSettle');
            defaultSettle = this.safeString2 (params, 'settle', 'defaultSettle', defaultSettle);
            isUsdcSettled = (defaultSettle === 'USDC');
        }
        isSpot = (type === 'spot');
        if (isPrivate) {
            const unified = await this.isUnifiedEnabled ();
            const isUnifiedMargin = this.safeBool (unified, 0, false);
            const isUnifiedAccount = this.safeBool (unified, 1, false);
            if (isUsdcSettled && !isUnifiedMargin && !isUnifiedAccount) {
                url = url[accessibility]['usdc'];
            } else {
                url = url[accessibility]['contract'];
            }
        } else {
            if (isSpot) {
                url = url[accessibility]['spot'];
            } else if ((type === 'swap') || (type === 'future')) {
                let subType = undefined;
                [ subType, params ] = this.handleSubTypeAndParams (method, market, params, 'linear');
                url = url[accessibility][subType];
            } else {
                // option
                url = url[accessibility]['option'];
            }
        }
        url = this.implodeHostname (url);
        return url;
    }

    cleanParams (params) {
        params = this.omit (params, [ 'type', 'subType', 'settle', 'defaultSettle', 'unifiedMargin' ]);
        return params;
    }

    /**
     * @method
     * @name bybit#createOrderWs
     * @description create a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/create-order
     * @see https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK"
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {string} [params.positionIdx] *contracts only*  0 for one-way mode, 1 buy side  of hedged mode, 2 sell side of hedged mode
     * @param {boolean} [params.isLeverage] *unified spot only* false then spot trading true then margin trading
     * @param {string} [params.tpslMode] *contract only* 'full' or 'partial'
     * @param {string} [params.mmp] *option only* market maker protection
     * @param {string} [params.triggerDirection] *contract only* the direction for trigger orders, 'above' or 'below'
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, params, true);
        const url = this.urls['api']['ws']['private']['trade'];
        await this.authenticate (url);
        const requestId = this.requestId ().toString ();
        const request: Dict = {
            'op': 'order.create',
            'reqId': requestId,
            'args': [
                orderRequest,
            ],
            'header': {
                'X-BAPI-TIMESTAMP': this.milliseconds ().toString (),
                'X-BAPI-RECV-WINDOW': this.options['recvWindow'].toString (),
            },
        };
        return await this.watch (url, requestId, request, requestId, true) as Order;
    }

    /**
     * @method
     * @name bybit#editOrderWs
     * @description edit a trade order
     * @see https://bybit-exchange.github.io/docs/v5/order/amend-order
     * @see https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price that a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.triggerBy] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for triggerPrice
     * @param {string} [params.slTriggerBy] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for stopLoss
     * @param {string} [params.tpTriggerby] 'IndexPrice', 'MarkPrice' or 'LastPrice', default is 'LastPrice', required if no initial value for takeProfit
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrderWs (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const orderRequest = this.editOrderRequest (id, symbol, type, side, amount, price, params);
        const url = this.urls['api']['ws']['private']['trade'];
        await this.authenticate (url);
        const requestId = this.requestId ().toString ();
        const request: Dict = {
            'op': 'order.amend',
            'reqId': requestId,
            'args': [
                orderRequest,
            ],
            'header': {
                'X-BAPI-TIMESTAMP': this.milliseconds ().toString (),
                'X-BAPI-RECV-WINDOW': this.options['recvWindow'].toString (),
            },
        };
        return await this.watch (url, requestId, request, requestId, true) as Order;
    }

    /**
     * @method
     * @name bybit#cancelOrderWs
     * @description cancels an open order
     * @see https://bybit-exchange.github.io/docs/v5/order/cancel-order
     * @see https://bybit-exchange.github.io/docs/v5/websocket/trade/guideline#createamendcancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *spot only* whether the order is a trigger order
     * @param {string} [params.orderFilter] *spot only* 'Order' or 'StopOrder' or 'tpslOrder'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const orderRequest = this.cancelOrderRequest (id, symbol, params);
        const url = this.urls['api']['ws']['private']['trade'];
        await this.authenticate (url);
        const requestId = this.requestId ().toString ();
        if ('orderFilter' in orderRequest) {
            delete orderRequest['orderFilter'];
        }
        const request: Dict = {
            'op': 'order.cancel',
            'reqId': requestId,
            'args': [
                orderRequest,
            ],
            'header': {
                'X-BAPI-TIMESTAMP': this.milliseconds ().toString (),
                'X-BAPI-RECV-WINDOW': this.options['recvWindow'].toString (),
            },
        };
        return await this.watch (url, requestId, request, requestId, true) as Order;
    }

    /**
     * @method
     * @name bybit#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'ticker:' + symbol;
        const url = await this.getUrlByMarketType (symbol, false, 'watchTicker', params);
        params = this.cleanParams (params);
        const options = this.safeValue (this.options, 'watchTicker', {});
        let topic = this.safeString (options, 'name', 'tickers');
        if (!market['spot'] && topic !== 'tickers') {
            throw new BadRequest (this.id + ' watchTicker() only supports name tickers for contract markets');
        }
        topic += '.' + market['id'];
        const topics = [ topic ];
        return await this.watchTopics (url, [ messageHash ], topics, params);
    }

    /**
     * @method
     * @name bybit#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const url = await this.getUrlByMarketType (symbols[0], false, 'watchTickers', params);
        params = this.cleanParams (params);
        const options = this.safeValue (this.options, 'watchTickers', {});
        const topic = this.safeString (options, 'name', 'tickers');
        const marketIds = this.marketIds (symbols);
        const topics = [ ];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            topics.push (topic + '.' + marketId);
            messageHashes.push ('ticker:' + symbols[i]);
        }
        const ticker = await this.watchTopics (url, messageHashes, topics, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name bybit#unWatchTickers
     * @description unWatches a price ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const options = this.safeValue (this.options, 'watchTickers', {});
        const topic = this.safeString (options, 'name', 'tickers');
        const messageHashes = [];
        const subMessageHashes = [];
        const marketIds = this.marketIds (symbols);
        const topics = [ ];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const symbol = symbols[i];
            topics.push (topic + '.' + marketId);
            subMessageHashes.push ('ticker:' + symbol);
            messageHashes.push ('unsubscribe:ticker:' + symbol);
        }
        const url = await this.getUrlByMarketType (symbols[0], false, 'watchTickers', params);
        return await this.unWatchTopics (url, 'ticker', symbols, messageHashes, subMessageHashes, topics, params);
    }

    /**
     * @method
     * @name bybit#unWatchTicker
     * @description unWatches a price ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/ticker
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker (symbols: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchTickers ([ symbols ], params);
    }

    handleTicker (client: Client, message) {
        //
        // linear
        //     {
        //         "topic": "tickers.BTCUSDT",
        //         "type": "snapshot",
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "tickDirection": "PlusTick",
        //             "price24hPcnt": "0.017103",
        //             "lastPrice": "17216.00",
        //             "prevPrice24h": "16926.50",
        //             "highPrice24h": "17281.50",
        //             "lowPrice24h": "16915.00",
        //             "prevPrice1h": "17238.00",
        //             "markPrice": "17217.33",
        //             "indexPrice": "17227.36",
        //             "openInterest": "68744.761",
        //             "openInterestValue": "1183601235.91",
        //             "turnover24h": "1570383121.943499",
        //             "volume24h": "91705.276",
        //             "nextFundingTime": "1673280000000",
        //             "fundingRate": "-0.000212",
        //             "bid1Price": "17215.50",
        //             "bid1Size": "84.489",
        //             "ask1Price": "17216.00",
        //             "ask1Size": "83.020"
        //         },
        //         "cs": 24987956059,
        //         "ts": 1673272861686
        //     }
        //
        // option
        //     {
        //         "id": "tickers.BTC-6JAN23-17500-C-2480334983-1672917511074",
        //         "topic": "tickers.BTC-6JAN23-17500-C",
        //         "ts": 1672917511074,
        //         "data": {
        //             "symbol": "BTC-6JAN23-17500-C",
        //             "bidPrice": "0",
        //             "bidSize": "0",
        //             "bidIv": "0",
        //             "askPrice": "10",
        //             "askSize": "5.1",
        //             "askIv": "0.514",
        //             "lastPrice": "10",
        //             "highPrice24h": "25",
        //             "lowPrice24h": "5",
        //             "markPrice": "7.86976724",
        //             "indexPrice": "16823.73",
        //             "markPriceIv": "0.4896",
        //             "underlyingPrice": "16815.1",
        //             "openInterest": "49.85",
        //             "turnover24h": "446802.8473",
        //             "volume24h": "26.55",
        //             "totalVolume": "86",
        //             "totalTurnover": "1437431",
        //             "delta": "0.047831",
        //             "gamma": "0.00021453",
        //             "vega": "0.81351067",
        //             "theta": "-19.9115368",
        //             "predictedDeliveryPrice": "0",
        //             "change24h": "-0.33333334"
        //         },
        //         "type": "snapshot"
        //     }
        //
        // spot
        //     {
        //         "topic": "tickers.BTCUSDT",
        //         "ts": 1673853746003,
        //         "type": "snapshot",
        //         "cs": 2588407389,
        //         "data": {
        //             "symbol": "BTCUSDT",
        //             "lastPrice": "21109.77",
        //             "highPrice24h": "21426.99",
        //             "lowPrice24h": "20575",
        //             "prevPrice24h": "20704.93",
        //             "volume24h": "6780.866843",
        //             "turnover24h": "141946527.22907118",
        //             "price24hPcnt": "0.0196",
        //             "usdIndexPrice": "21120.2400136"
        //         }
        //     }
        //
        // lt ticker
        //     {
        //         "topic": "tickers_lt.EOS3LUSDT",
        //         "ts": 1672325446847,
        //         "type": "snapshot",
        //         "data": {
        //             "symbol": "EOS3LUSDT",
        //             "lastPrice": "0.41477848043290448",
        //             "highPrice24h": "0.435285472510871305",
        //             "lowPrice24h": "0.394601507960931382",
        //             "prevPrice24h": "0.431502290172376349",
        //             "price24hPcnt": "-0.0388"
        //         }
        //     }
        // swap delta
        //     {
        //         "topic":"tickers.AAVEUSDT",
        //         "type":"delta",
        //         "data":{
        //            "symbol":"AAVEUSDT",
        //            "bid1Price":"112.89",
        //            "bid1Size":"2.12",
        //            "ask1Price":"112.90",
        //            "ask1Size":"5.02"
        //         },
        //         "cs":78039939929,
        //         "ts":1709210212704
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const updateType = this.safeString (message, 'type', '');
        const data = this.safeDict (message, 'data', {});
        const isSpot = this.safeString (data, 'usdIndexPrice') !== undefined;
        const type = isSpot ? 'spot' : 'contract';
        let symbol = undefined;
        let parsed = undefined;
        if ((updateType === 'snapshot')) {
            parsed = this.parseTicker (data);
            symbol = parsed['symbol'];
        } else if (updateType === 'delta') {
            const topicParts = topic.split ('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString (topicParts, topicLength - 1);
            const market = this.safeMarket (marketId, undefined, undefined, type);
            symbol = market['symbol'];
            // update the info in place
            const ticker = this.safeDict (this.tickers, symbol, {});
            const rawTicker = this.safeDict (ticker, 'info', {});
            const merged = this.extend (rawTicker, data);
            parsed = this.parseTicker (merged);
        }
        const timestamp = this.safeInteger (message, 'ts');
        parsed['timestamp'] = timestamp;
        parsed['datetime'] = this.iso8601 (timestamp);
        this.tickers[symbol] = parsed;
        const messageHash = 'ticker:' + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    /**
     * @method
     * @name bybit#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const url = await this.getUrlByMarketType (symbols[0], false, 'watchBidsAsks', params);
        params = this.cleanParams (params);
        const marketIds = this.marketIds (symbols);
        const topics = [ ];
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const topic = 'orderbook.1.' + marketId;
            topics.push (topic);
            messageHashes.push ('bidask:' + symbols[i]);
        }
        const ticker = await this.watchTopics (url, messageHashes, topics, params);
        if (this.newUpdates) {
            return ticker;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    parseWsBidAsk (orderbook, market = undefined) {
        const timestamp = this.safeInteger (orderbook, 'timestamp');
        const bids = this.sortBy (this.aggregate (orderbook['bids']), 0);
        const asks = this.sortBy (this.aggregate (orderbook['asks']), 0);
        const bestBid = this.safeList (bids, 0, []);
        const bestAsk = this.safeList (asks, 0, []);
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeNumber (bestAsk, 0),
            'askVolume': this.safeNumber (bestAsk, 1),
            'bid': this.safeNumber (bestBid, 0),
            'bidVolume': this.safeNumber (bestBid, 1),
            'info': orderbook,
        }, market);
    }

    /**
     * @method
     * @name bybit#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name bybit#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const symbols = this.getListFromObjectValues (symbolsAndTimeframes, 0);
        const marketSymbols = this.marketSymbols (symbols, undefined, false, true, true);
        const firstSymbol = marketSymbols[0];
        const url = await this.getUrlByMarketType (firstSymbol, false, 'watchOHLCVForSymbols', params);
        const rawHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            let symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            symbolString = market['symbol'];
            const unfiedTimeframe = this.safeString (data, 1);
            const timeframeId = this.safeString (this.timeframes, unfiedTimeframe, unfiedTimeframe);
            rawHashes.push ('kline.' + timeframeId + '.' + market['id']);
            messageHashes.push ('ohlcv::' + symbolString + '::' + unfiedTimeframe);
        }
        const [ symbol, timeframe, stored ] = await this.watchTopics (url, messageHashes, rawHashes, params);
        if (this.newUpdates) {
            limit = stored.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (stored, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    /**
     * @method
     * @name bybit#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params = {}): Promise<any> {
        await this.loadMarkets ();
        const symbols = this.getListFromObjectValues (symbolsAndTimeframes, 0);
        const marketSymbols = this.marketSymbols (symbols, undefined, false, true, true);
        const firstSymbol = marketSymbols[0];
        const url = await this.getUrlByMarketType (firstSymbol, false, 'watchOHLCVForSymbols', params);
        const rawHashes = [];
        const subMessageHashes = [];
        const messageHashes = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const data = symbolsAndTimeframes[i];
            let symbolString = this.safeString (data, 0);
            const market = this.market (symbolString);
            symbolString = market['symbol'];
            const unfiedTimeframe = this.safeString (data, 1);
            const timeframeId = this.safeString (this.timeframes, unfiedTimeframe, unfiedTimeframe);
            rawHashes.push ('kline.' + timeframeId + '.' + market['id']);
            subMessageHashes.push ('ohlcv::' + symbolString + '::' + unfiedTimeframe);
            messageHashes.push ('unsubscribe::ohlcv::' + symbolString + '::' + unfiedTimeframe);
        }
        const subExtension = {
            'symbolsAndTimeframes': symbolsAndTimeframes,
        };
        return await this.unWatchTopics (url, 'ohlcv', symbols, messageHashes, subMessageHashes, rawHashes, params, subExtension);
    }

    /**
     * @method
     * @name bybit#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/kline
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/etp-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV (symbol: string, timeframe = '1m', params = {}): Promise<any> {
        params['callerMethodName'] = 'watchOHLCV';
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "topic": "kline.5.BTCUSDT",
        //         "data": [
        //             {
        //                 "start": 1672324800000,
        //                 "end": 1672325099999,
        //                 "interval": "5",
        //                 "open": "16649.5",
        //                 "close": "16677",
        //                 "high": "16677",
        //                 "low": "16608",
        //                 "volume": "2.081",
        //                 "turnover": "34666.4005",
        //                 "confirm": false,
        //                 "timestamp": 1672324988882
        //             }
        //         ],
        //         "ts": 1672324988882,
        //         "type": "snapshot"
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        const topicParts = topic.split ('.');
        const topicLength = topicParts.length;
        const timeframeId = this.safeString (topicParts, 1);
        const timeframe = this.findTimeframe (timeframeId);
        const marketId = this.safeString (topicParts, topicLength - 1);
        const isSpot = client.url.indexOf ('spot') > -1;
        const marketType = isSpot ? 'spot' : 'contract';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const ohlcvsByTimeframe = this.safeValue (this.ohlcvs, symbol);
        if (ohlcvsByTimeframe === undefined) {
            this.ohlcvs[symbol] = {};
        }
        if (this.safeValue (ohlcvsByTimeframe, timeframe) === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][timeframe];
        for (let i = 0; i < data.length; i++) {
            const parsed = this.parseWsOHLCV (data[i], market);
            stored.append (parsed);
        }
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const resolveData = [ symbol, timeframe, stored ];
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        //
        //     {
        //         "start": 1670363160000,
        //         "end": 1670363219999,
        //         "interval": "1",
        //         "open": "16987.5",
        //         "close": "16987.5",
        //         "high": "16988",
        //         "low": "16987.5",
        //         "volume": "23.511",
        //         "turnover": "399396.344",
        //         "confirm": false,
        //         "timestamp": 1670363219614
        //     }
        //
        const volumeIndex = (market['inverse']) ? 'turnover' : 'volume';
        return [
            this.safeInteger (ohlcv, 'start'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, volumeIndex),
        ];
    }

    /**
     * @method
     * @name bybit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name bybit#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchOrderBookForSymbols() requires a non-empty array of symbols');
        }
        symbols = this.marketSymbols (symbols);
        const url = await this.getUrlByMarketType (symbols[0], false, 'watchOrderBook', params);
        params = this.cleanParams (params);
        const market = this.market (symbols[0]);
        if (limit === undefined) {
            limit = (market['spot']) ? 50 : 500;
            if (market['option']) {
                limit = 100;
            }
        } else {
            if (!market['spot']) {
                if (market['option']) {
                    if ((limit !== 25) && (limit !== 100)) {
                        throw new BadRequest (this.id + ' watchOrderBookForSymbols() can only use limit 25 and 100 for option markets.');
                    }
                } else if ((limit !== 1) && (limit !== 50) && (limit !== 200) && (limit !== 500)) {
                    // bybit only support limit 1, 50, 200, 500 for contract
                    throw new BadRequest (this.id + ' watchOrderBookForSymbols() can only use limit 1, 50, 200 and 500 for swap and future markets.');
                }
            } else {
                if ((limit !== 1) && (limit !== 50) && (limit !== 200)) {
                    throw new BadRequest (this.id + ' watchOrderBookForSymbols() can only use limit 1,50, and 200 for spot markets.');
                }
            }
        }
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const marketId = this.marketId (symbol);
            const topic = 'orderbook.' + limit.toString () + '.' + marketId;
            topics.push (topic);
            const messageHash = 'orderbook:' + symbol;
            messageHashes.push (messageHash);
        }
        const orderbook = await this.watchTopics (url, messageHashes, topics, params);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name bybit#unWatchOrderBookForSymbols
     * @description unsubscribe from the orderbook channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string[]} symbols unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols (symbols: Strings, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        let channel = 'orderbook.';
        let limit = this.safeInteger (params, 'limit');
        if (limit !== undefined) {
            params = this.omit (params, 'limit');
        } else {
            const firstMarket = this.market (symbols[0]);
            limit = firstMarket['spot'] ? 50 : 500;
        }
        channel += limit.toString ();
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const marketId = market['id'];
            const topic = channel + '.' + marketId;
            messageHashes.push ('unsubscribe:orderbook:' + symbol);
            subMessageHashes.push ('orderbook:' + symbol);
            topics.push (topic);
        }
        const url = await this.getUrlByMarketType (symbols[0], false, 'watchOrderBook', params);
        return await this.unWatchTopics (url, 'orderbook', symbols, messageHashes, subMessageHashes, topics, params);
    }

    /**
     * @method
     * @name bybit#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook
     * @param {string} symbol symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "topic": "orderbook.50.BTCUSDT",
        //         "type": "snapshot",
        //         "ts": 1672304484978,
        //         "data": {
        //             "s": "BTCUSDT",
        //             "b": [
        //                 ...,
        //                 [
        //                     "16493.50",
        //                     "0.006"
        //                 ],
        //                 [
        //                     "16493.00",
        //                     "0.100"
        //                 ]
        //             ],
        //             "a": [
        //                 [
        //                     "16611.00",
        //                     "0.029"
        //                 ],
        //                 [
        //                     "16612.00",
        //                     "0.213"
        //                 ],
        //             ],
        //             "u": 18521288,
        //             "seq": 7961638724
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const limit = topic.split ('.')[1];
        const isSpot = client.url.indexOf ('spot') >= 0;
        const type = this.safeString (message, 'type');
        const isSnapshot = (type === 'snapshot');
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const marketType = isSpot ? 'spot' : 'contract';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'ts');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        if (isSnapshot) {
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
            orderbook.reset (snapshot);
        } else {
            const asks = this.safeList (data, 'a', []);
            const bids = this.safeList (data, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
        if (limit === '1') {
            const bidask = this.parseWsBidAsk (this.orderbooks[symbol], market);
            const newBidsAsks: Dict = {};
            newBidsAsks[symbol] = bidask;
            this.bidsasks[symbol] = bidask;
            client.resolve (newBidsAsks, 'bidask:' + symbol);
        }
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name bybit#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name bybit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const symbolsLength = symbols.length;
        if (symbolsLength === 0) {
            throw new ArgumentsRequired (this.id + ' watchTradesForSymbols() requires a non-empty array of symbols');
        }
        params = this.cleanParams (params);
        const url = await this.getUrlByMarketType (symbols[0], false, 'watchTrades', params);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const topic = 'publicTrade.' + market['id'];
            topics.push (topic);
            const messageHash = 'trade:' + symbol;
            messageHashes.push (messageHash);
        }
        const trades = await this.watchTopics (url, messageHashes, topics, params);
        if (this.newUpdates) {
            const first = this.safeValue (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name bybit#unWatchTradesForSymbols
     * @description unsubscribe from the trades channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string[]} symbols unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTradesForSymbols (symbols: Strings, params = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false, true);
        const url = await this.getUrlByMarketType (symbols[0], false, 'unWatchTradesForSymbols', params);
        const messageHashes = [];
        const topics = [];
        const subMessageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const topic = 'publicTrade.' + market['id'];
            topics.push (topic);
            const messageHash = 'unsubscribe:trade:' + symbol;
            messageHashes.push (messageHash);
            subMessageHashes.push ('trade:' + symbol);
        }
        return await this.unWatchTopics (url, 'trades', symbols, messageHashes, subMessageHashes, topics, params);
    }

    /**
     * @method
     * @name bybit#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/trade
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "topic": "publicTrade.BTCUSDT",
        //         "type": "snapshot",
        //         "ts": 1672304486868,
        //         "data": [
        //             {
        //                 "T": 1672304486865,
        //                 "s": "BTCUSDT",
        //                 "S": "Buy",
        //                 "v": "0.001",
        //                 "p": "16578.50",
        //                 "L": "PlusTick",
        //                 "i": "20f43950-d8dd-5b31-9112-a178eb6023af",
        //                 "BT": false
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        const trades = data;
        const parts = topic.split ('.');
        const isSpot = client.url.indexOf ('spot') >= 0;
        const marketType = (isSpot) ? 'spot' : 'contract';
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            const parsed = this.parseWsTrade (trades[j], market);
            stored.append (parsed);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // public
        //    {
        //         "T": 1672304486865,
        //         "s": "BTCUSDT",
        //         "S": "Buy",
        //         "v": "0.001",
        //         "p": "16578.50",
        //         "L": "PlusTick",
        //         "i": "20f43950-d8dd-5b31-9112-a178eb6023af",
        //         "BT": false
        //     }
        //
        // spot private
        //     {
        //         "e": "ticketInfo",
        //         "E": "1662348310386",
        //         "s": "BTCUSDT",
        //         "q": "0.001007",
        //         "t": "1662348310373",
        //         "p": "19842.02",
        //         "T": "2100000000002220938",
        //         "o": "1238261807653647872",
        //         "c": "spotx008",
        //         "O": "1238225004531834368",
        //         "a": "533287",
        //         "A": "642908",
        //         "m": false,
        //         "S": "BUY"
        //     }
        //
        const id = this.safeStringN (trade, [ 'i', 'T', 'v' ]);
        const isContract = ('BT' in trade);
        let marketType = isContract ? 'contract' : 'spot';
        if (market !== undefined) {
            marketType = market['type'];
        }
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (trade, 't', 'T');
        let side = this.safeStringLower (trade, 'S');
        let takerOrMaker = undefined;
        const m = this.safeValue (trade, 'm');
        if (side === undefined) {
            side = m ? 'buy' : 'sell';
        } else {
            // spot private
            takerOrMaker = m;
        }
        const price = this.safeString (trade, 'p');
        const amount = this.safeString2 (trade, 'q', 'v');
        const orderId = this.safeString (trade, 'o');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    getPrivateType (url) {
        if (url.indexOf ('spot') >= 0) {
            return 'spot';
        } else if (url.indexOf ('v5/private') >= 0) {
            return 'unified';
        } else {
            return 'usdc';
        }
    }

    /**
     * @method
     * @name bybit#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/execution
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        const method = 'watchMyTrades';
        let messageHash = 'myTrades';
        await this.loadMarkets ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const url = await this.getUrlByMarketType (symbol, true, method, params);
        await this.authenticate (url);
        const topicByMarket: Dict = {
            'spot': 'ticketInfo',
            'unified': 'execution',
            'usdc': 'user.openapi.perp.trade',
        };
        const topic = this.safeValue (topicByMarket, this.getPrivateType (url));
        const trades = await this.watchTopics (url, [ messageHash ], [ topic ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name bybit#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/execution
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchMyTrades (symbol: Str = undefined, params = {}): Promise<any> {
        const method = 'watchMyTrades';
        const messageHash = 'unsubscribe:myTrades';
        let subHash = 'myTrades';
        await this.loadMarkets ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            subHash += ':' + symbol;
        }
        const url = await this.getUrlByMarketType (symbol, true, method, params);
        await this.authenticate (url);
        const topicByMarket: Dict = {
            'spot': 'ticketInfo',
            'unified': 'execution',
            'usdc': 'user.openapi.perp.trade',
        };
        const topic = this.safeValue (topicByMarket, this.getPrivateType (url));
        return await this.unWatchTopics (url, 'myTrades', [ ], [ messageHash ], [ subHash ], [ topic ], params);
    }

    handleMyTrades (client: Client, message) {
        //
        // spot
        //    {
        //        "type": "snapshot",
        //        "topic": "ticketInfo",
        //        "ts": "1662348310388",
        //        "data": [
        //            {
        //                "e": "ticketInfo",
        //                "E": "1662348310386",
        //                "s": "BTCUSDT",
        //                "q": "0.001007",
        //                "t": "1662348310373",
        //                "p": "19842.02",
        //                "T": "2100000000002220938",
        //                "o": "1238261807653647872",
        //                "c": "spotx008",
        //                "O": "1238225004531834368",
        //                "a": "533287",
        //                "A": "642908",
        //                "m": false,
        //                "S": "BUY"
        //            }
        //        ]
        //    }
        // unified
        //     {
        //         "id": "592324803b2785-26fa-4214-9963-bdd4727f07be",
        //         "topic": "execution",
        //         "creationTime": 1672364174455,
        //         "data": [
        //             {
        //                 "category": "linear",
        //                 "symbol": "XRPUSDT",
        //                 "execFee": "0.005061",
        //                 "execId": "7e2ae69c-4edf-5800-a352-893d52b446aa",
        //                 "execPrice": "0.3374",
        //                 "execQty": "25",
        //                 "execType": "Trade",
        //                 "execValue": "8.435",
        //                 "isMaker": false,
        //                 "feeRate": "0.0006",
        //                 "tradeIv": "",
        //                 "markIv": "",
        //                 "blockTradeId": "",
        //                 "markPrice": "0.3391",
        //                 "indexPrice": "",
        //                 "underlyingPrice": "",
        //                 "leavesQty": "0",
        //                 "orderId": "f6e324ff-99c2-4e89-9739-3086e47f9381",
        //                 "orderLinkId": "",
        //                 "orderPrice": "0.3207",
        //                 "orderQty": "25",
        //                 "orderType": "Market",
        //                 "stopOrderType": "UNKNOWN",
        //                 "side": "Sell",
        //                 "execTime": "1672364174443",
        //                 "isLeverage": "0"
        //             }
        //         ]
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const spot = topic === 'ticketInfo';
        let data = this.safeValue (message, 'data', []);
        if (!Array.isArray (data)) {
            data = this.safeValue (data, 'result', []);
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const symbols: Dict = {};
        const filterExecTypes = this.handleOption ('watchMyTrades', 'filterExecTypes', []);
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            let parsed = undefined;
            if (spot) {
                parsed = this.parseWsTrade (rawTrade);
            } else {
                // filter unified trades
                const execType = this.safeString (rawTrade, 'execType', '');
                if (!this.inArray (execType, filterExecTypes)) {
                    continue;
                }
                parsed = this.parseTrade (rawTrade);
            }
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            trades.append (parsed);
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            const currentMessageHash = 'myTrades:' + keys[i];
            client.resolve (trades, currentMessageHash);
        }
        // non-symbol specific
        const messageHash = 'myTrades';
        client.resolve (trades, messageHash);
    }

    /**
     * @method
     * @name bybit#watchPositions
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/position
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const method = 'watchPositions';
        let messageHash = '';
        if (!this.isEmpty (symbols)) {
            symbols = this.marketSymbols (symbols);
            messageHash = '::' + symbols.join (',');
        }
        const firstSymbol = this.safeString (symbols, 0);
        const url = await this.getUrlByMarketType (firstSymbol, true, method, params);
        messageHash = 'positions' + messageHash;
        const client = this.client (url);
        await this.authenticate (url);
        this.setPositionsCache (client, symbols);
        const cache = this.positions;
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && cache === undefined) {
            const snapshot = await client.future ('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, symbols, since, limit, true);
        }
        const topics = [ 'position' ];
        const newPositions = await this.watchTopics (url, [ messageHash ], topics, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (cache, symbols, since, limit, true);
    }

    setPositionsCache (client: Client, symbols: Strings = undefined) {
        if (this.positions !== undefined) {
            return;
        }
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadPositionsSnapshot, client, messageHash);
            }
        } else {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
    }

    async loadPositionsSnapshot (client, messageHash) {
        // as only one ws channel gives positions for all types, for snapshot must load all positions
        const fetchFunctions = [
            this.fetchPositions (undefined, { 'type': 'swap', 'subType': 'linear' }),
            this.fetchPositions (undefined, { 'type': 'swap', 'subType': 'inverse' }),
        ];
        const promises = await Promise.all (fetchFunctions);
        this.positions = new ArrayCacheBySymbolBySide ();
        const cache = this.positions;
        for (let i = 0; i < promises.length; i++) {
            const positions = promises[i];
            for (let ii = 0; ii < positions.length; ii++) {
                const position = positions[ii];
                cache.append (position);
            }
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve (cache);
        client.resolve (cache, 'position');
    }

    handlePositions (client, message) {
        //
        //    {
        //        topic: 'position',
        //        id: '504b2671629b08e3c4f6960382a59363:3bc4028023786545:0:01',
        //        creationTime: 1694566055295,
        //        data: [{
        //            bustPrice: '15.00',
        //            category: 'inverse',
        //            createdTime: '1670083436351',
        //            cumRealisedPnl: '0.00011988',
        //            entryPrice: '19358.58553268',
        //            leverage: '10',
        //            liqPrice: '15.00',
        //            markPrice: '25924.00',
        //            positionBalance: '0.0000156',
        //            positionIdx: 0,
        //            positionMM: '0.001',
        //            positionIM: '0.0000015497',
        //            positionStatus: 'Normal',
        //            positionValue: '0.00015497',
        //            riskId: 1,
        //            riskLimitValue: '150',
        //            side: 'Buy',
        //            size: '3',
        //            stopLoss: '0.00',
        //            symbol: 'BTCUSD',
        //            takeProfit: '0.00',
        //            tpslMode: 'Full',
        //            tradeMode: 0,
        //            autoAddMargin: 1,
        //            trailingStop: '0.00',
        //            unrealisedPnl: '0.00003925',
        //            updatedTime: '1694566055293',
        //            adlRankIndicator: 3
        //        }]
        //    }
        //
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const newPositions = [];
        const rawPositions = this.safeValue (message, 'data', []);
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parsePosition (rawPosition);
            const side = this.safeString (position, 'side');
            // hacky solution to handle closing positions
            // without crashing, we should handle this properly later
            newPositions.push (position);
            if (side === undefined || side === '') {
                // closing update, adding both sides to "reset" both sides
                // since we don't know which side is being closed
                position['side'] = 'long';
                cache.append (position);
                position['side'] = 'short';
                cache.append (position);
                position['side'] = undefined;
            } else {
                // regular update
                cache.append (position);
            }
        }
        const messageHashes = this.findMessageHashes (client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split ('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split (',');
            const positions = this.filterByArray (newPositions, 'symbol', symbols, false);
            if (!this.isEmpty (positions)) {
                client.resolve (positions, messageHash);
            }
        }
        client.resolve (newPositions, 'positions');
    }

    /**
     * @method
     * @name bybit#unwatchPositions
     * @description unWatches all open positions
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} status of the unwatch request
     */
    async unwatchPositions (symbols: Strings = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        const method = 'watchPositions';
        let messageHash = 'unsubscribe:positions';
        let subHash = 'positions';
        if (!this.isEmpty (symbols)) {
            symbols = this.marketSymbols (symbols);
            messageHash += '::' + symbols.join (',');
            subHash += '::' + symbols.join (',');
        }
        const firstSymbol = this.safeString (symbols, 0);
        const url = await this.getUrlByMarketType (firstSymbol, true, method, params);
        await this.authenticate (url);
        const topics = [ 'position' ];
        return await this.unWatchTopics (url, 'positions', symbols, [ messageHash ], [ subHash ], topics, params);
    }

    /**
     * @method
     * @name bybit#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://bybit-exchange.github.io/docs/v5/websocket/public/liquidation
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmex api endpoint
     * @param {string} [params.method] exchange specific method, supported: liquidation, allLiquidation
     * @returns {object} an array of [liquidation structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#liquidation-structure}
     */
    async watchLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Liquidation[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = await this.getUrlByMarketType (symbol, false, 'watchLiquidations', params);
        params = this.cleanParams (params);
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchLiquidations', 'method', 'liquidation');
        const messageHash = 'liquidations::' + symbol;
        const topic = method + '.' + market['id'];
        const newLiquidation = await this.watchTopics (url, [ messageHash ], [ topic ], params);
        if (this.newUpdates) {
            return newLiquidation;
        }
        return this.filterBySymbolsSinceLimit (this.liquidations, [ symbol ], since, limit, true);
    }

    handleLiquidation (client: Client, message) {
        //
        //     {
        //         "data": {
        //             "price": "0.03803",
        //             "side": "Buy",
        //             "size": "1637",
        //             "symbol": "GALAUSDT",
        //             "updatedTime": 1673251091822
        //         },
        //         "topic": "liquidation.GALAUSDT",
        //         "ts": 1673251091822,
        //         "type": "snapshot"
        //     }
        //
        //     {
        //         "topic": "allLiquidation.ROSEUSDT",
        //         "type": "snapshot",
        //         "ts": 1739502303204,
        //         "data": [
        //             {
        //                 "T": 1739502302929,
        //                 "s": "ROSEUSDT",
        //                 "S": "Sell",
        //                 "v": "20000",
        //                 "p": "0.04499"
        //             }
        //         ]
        //     }
        //
        if (Array.isArray (message['data'])) {
            const rawLiquidations = this.safeList (message, 'data', []);
            for (let i = 0; i < rawLiquidations.length; i++) {
                const rawLiquidation = rawLiquidations[i];
                const marketId = this.safeString (rawLiquidation, 's');
                const market = this.safeMarket (marketId, undefined, '', 'contract');
                const symbol = market['symbol'];
                const liquidation = this.parseWsLiquidation (rawLiquidation, market);
                let liquidations = this.safeValue (this.liquidations, symbol);
                if (liquidations === undefined) {
                    const limit = this.safeInteger (this.options, 'liquidationsLimit', 1000);
                    liquidations = new ArrayCache (limit);
                }
                liquidations.append (liquidation);
                this.liquidations[symbol] = liquidations;
                client.resolve ([ liquidation ], 'liquidations');
                client.resolve ([ liquidation ], 'liquidations::' + symbol);
            }
        } else {
            const rawLiquidation = this.safeDict (message, 'data', {});
            const marketId = this.safeString (rawLiquidation, 'symbol');
            const market = this.safeMarket (marketId, undefined, '', 'contract');
            const symbol = market['symbol'];
            const liquidation = this.parseWsLiquidation (rawLiquidation, market);
            let liquidations = this.safeValue (this.liquidations, symbol);
            if (liquidations === undefined) {
                const limit = this.safeInteger (this.options, 'liquidationsLimit', 1000);
                liquidations = new ArrayCache (limit);
            }
            liquidations.append (liquidation);
            this.liquidations[symbol] = liquidations;
            client.resolve ([ liquidation ], 'liquidations');
            client.resolve ([ liquidation ], 'liquidations::' + symbol);
        }
    }

    parseWsLiquidation (liquidation, market = undefined) {
        //
        //     {
        //         "price": "0.03803",
        //         "side": "Buy",
        //         "size": "1637",
        //         "symbol": "GALAUSDT",
        //         "updatedTime": 1673251091822
        //     }
        //
        //     {
        //         "T": 1739502302929,
        //         "s": "ROSEUSDT",
        //         "S": "Sell",
        //         "v": "20000",
        //         "p": "0.04499"
        //     }
        //
        const marketId = this.safeString2 (liquidation, 'symbol', 's');
        market = this.safeMarket (marketId, market, '', 'contract');
        const timestamp = this.safeInteger2 (liquidation, 'updatedTime', 'T');
        return this.safeLiquidation ({
            'info': liquidation,
            'symbol': market['symbol'],
            'contracts': this.safeNumber2 (liquidation, 'size', 'v'),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'price': this.safeNumber2 (liquidation, 'price', 'p'),
            'baseValue': undefined,
            'quoteValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    /**
     * @method
     * @name bybit#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const method = 'watchOrders';
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const url = await this.getUrlByMarketType (symbol, true, method, params);
        await this.authenticate (url);
        const topicsByMarket: Dict = {
            'spot': [ 'order', 'stopOrder' ],
            'unified': [ 'order' ],
            'usdc': [ 'user.openapi.perp.order' ],
        };
        const topics = this.safeValue (topicsByMarket, this.getPrivateType (url));
        const orders = await this.watchTopics (url, [ messageHash ], topics, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name bybit#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async unWatchOrders (symbol: Str = undefined, params = {}): Promise<any> {
        await this.loadMarkets ();
        const method = 'watchOrders';
        const messageHash = 'unsubscribe:orders';
        let subHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            subHash += ':' + symbol;
        }
        const url = await this.getUrlByMarketType (symbol, true, method, params);
        await this.authenticate (url);
        const topicsByMarket: Dict = {
            'spot': [ 'order', 'stopOrder' ],
            'unified': [ 'order' ],
            'usdc': [ 'user.openapi.perp.order' ],
        };
        const topics = this.safeValue (topicsByMarket, this.getPrivateType (url));
        return await this.unWatchTopics (url, 'orders', [ ], [ messageHash ], [ subHash ], topics, params);
    }

    handleOrderWs (client: Client, message) {
        //
        //    {
        //        "reqId":"1",
        //        "retCode":0,
        //        "retMsg":"OK",
        //        "op":"order.create",
        //        "data":{
        //            "orderId":"1673523595617593600",
        //            "orderLinkId":"1673523595617593601"
        //        },
        //        "header":{
        //            "X-Bapi-Limit":"20",
        //            "X-Bapi-Limit-Status":"19",
        //            "X-Bapi-Limit-Reset-Timestamp":"1714235558880",
        //            "Traceid":"584a06d373f2fdcb3a4dfdd81d27df11",
        //            "Timenow":"1714235558881"
        //        },
        //        "connId":"cojidqec0hv9fgvhtbt0-40e"
        //    }
        //
        const messageHash = this.safeString (message, 'reqId');
        const data = this.safeDict (message, 'data');
        const order = this.parseOrder (data);
        client.resolve (order, messageHash);
    }

    handleOrder (client: Client, message) {
        //
        //     spot
        //     {
        //         "type": "snapshot",
        //         "topic": "order",
        //         "ts": "1662348310441",
        //         "data": [
        //             {
        //                 "e": "order",
        //                 "E": "1662348310441",
        //                 "s": "BTCUSDT",
        //                 "c": "spotx008",
        //                 "S": "BUY",
        //                 "o": "MARKET_OF_QUOTE",
        //                 "f": "GTC",
        //                 "q": "20",
        //                 "p": "0",
        //                 "X": "CANCELED",
        //                 "i": "1238261807653647872",
        //                 "M": "1238225004531834368",
        //                 "l": "0.001007",
        //                 "z": "0.001007",
        //                 "L": "19842.02",
        //                 "n": "0",
        //                 "N": "BTC",
        //                 "u": true,
        //                 "w": true,
        //                 "m": false,
        //                 "O": "1662348310368",
        //                 "Z": "19.98091414",
        //                 "A": "0",
        //                 "C": false,
        //                 "v": "0",
        //                 "d": "NO_LIQ",
        //                 "t": "2100000000002220938"
        //             }
        //         ]
        //     }
        // unified
        //     {
        //         "id": "5923240c6880ab-c59f-420b-9adb-3639adc9dd90",
        //         "topic": "order",
        //         "creationTime": 1672364262474,
        //         "data": [
        //             {
        //                 "symbol": "ETH-30DEC22-1400-C",
        //                 "orderId": "5cf98598-39a7-459e-97bf-76ca765ee020",
        //                 "side": "Sell",
        //                 "orderType": "Market",
        //                 "cancelType": "UNKNOWN",
        //                 "price": "72.5",
        //                 "qty": "1",
        //                 "orderIv": "",
        //                 "timeInForce": "IOC",
        //                 "orderStatus": "Filled",
        //                 "orderLinkId": "",
        //                 "lastPriceOnCreated": "",
        //                 "reduceOnly": false,
        //                 "leavesQty": "",
        //                 "leavesValue": "",
        //                 "cumExecQty": "1",
        //                 "cumExecValue": "75",
        //                 "avgPrice": "75",
        //                 "blockTradeId": "",
        //                 "positionIdx": 0,
        //                 "cumExecFee": "0.358635",
        //                 "createdTime": "1672364262444",
        //                 "updatedTime": "1672364262457",
        //                 "rejectReason": "EC_NoError",
        //                 "stopOrderType": "",
        //                 "triggerPrice": "",
        //                 "takeProfit": "",
        //                 "stopLoss": "",
        //                 "tpTriggerBy": "",
        //                 "slTriggerBy": "",
        //                 "triggerDirection": 0,
        //                 "triggerBy": "",
        //                 "closeOnTrigger": false,
        //                 "category": "option"
        //             }
        //         ]
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        let rawOrders = this.safeValue (message, 'data', []);
        const first = this.safeValue (rawOrders, 0, {});
        const category = this.safeString (first, 'category');
        const isSpot = category === 'spot';
        if (!isSpot) {
            rawOrders = this.safeValue (rawOrders, 'result', rawOrders);
        }
        const symbols: Dict = {};
        for (let i = 0; i < rawOrders.length; i++) {
            let parsed = undefined;
            if (isSpot) {
                parsed = this.parseWsSpotOrder (rawOrders[i]);
            } else {
                parsed = this.parseOrder (rawOrders[i]);
            }
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            orders.append (parsed);
        }
        const symbolsArray = Object.keys (symbols);
        for (let i = 0; i < symbolsArray.length; i++) {
            const currentMessageHash = 'orders:' + symbolsArray[i];
            client.resolve (orders, currentMessageHash);
        }
        const messageHash = 'orders';
        client.resolve (orders, messageHash);
    }

    parseWsSpotOrder (order, market = undefined) {
        //
        //    {
        //        "e": "executionReport",
        //        "E": "1653297251061", // timestamp
        //        "s": "LTCUSDT", // symbol
        //        "c": "1653297250740", // user id
        //        "S": "SELL", // side
        //        "o": "MARKET_OF_BASE", // order type
        //        "f": "GTC", // time in force
        //        "q": "0.16233", // quantity
        //        "p": "0", // price
        //        "X": "NEW", // status
        //        "i": "1162336018974750208", // order id
        //        "M": "0",
        //        "l": "0", // last filled
        //        "z": "0", // total filled
        //        "L": "0", // last traded price
        //        "n": "0", // trading fee
        //        "N": '', // fee asset
        //        "u": true,
        //        "w": true,
        //        "m": false, // is limit_maker
        //        "O": "1653297251042", // order creation
        //        "Z": "0", // total filled
        //        "A": "0", // account id
        //        "C": false, // is close
        //        "v": "0", // leverage
        //        "d": "NO_LIQ"
        //    }
        // v5
        //    {
        //        "category":"spot",
        //        "symbol":"LTCUSDT",
        //        "orderId":"1474764674982492160",
        //        "orderLinkId":"1690541649154749",
        //        "blockTradeId":"",
        //        "side":"Buy",
        //        "positionIdx":0,
        //        "orderStatus":"Cancelled",
        //        "cancelType":"UNKNOWN",
        //        "rejectReason":"EC_NoError",
        //        "timeInForce":"GTC",
        //        "isLeverage":"0",
        //        "price":"0",
        //        "qty":"5.00000",
        //        "avgPrice":"0",
        //        "leavesQty":"0.00000",
        //        "leavesValue":"5.0000000",
        //        "cumExecQty":"0.00000",
        //        "cumExecValue":"0.0000000",
        //        "cumExecFee":"",
        //        "orderType":"Market",
        //        "stopOrderType":"",
        //        "orderIv":"",
        //        "triggerPrice":"0.000",
        //        "takeProfit":"",
        //        "stopLoss":"",
        //        "triggerBy":"",
        //        "tpTriggerBy":"",
        //        "slTriggerBy":"",
        //        "triggerDirection":0,
        //        "placeType":"",
        //        "lastPriceOnCreated":"0.000",
        //        "closeOnTrigger":false,
        //        "reduceOnly":false,
        //        "smpGroup":0,
        //        "smpType":"None",
        //        "smpOrderId":"",
        //        "createdTime":"1690541649160",
        //        "updatedTime":"1690541649168"
        //     }
        //
        const id = this.safeString2 (order, 'i', 'orderId');
        const marketId = this.safeString2 (order, 's', 'symbol');
        const symbol = this.safeSymbol (marketId, market, undefined, 'spot');
        const timestamp = this.safeInteger2 (order, 'O', 'createdTime');
        let price = this.safeString2 (order, 'p', 'price');
        if (price === '0') {
            price = undefined; // market orders
        }
        const filled = this.safeString2 (order, 'z', 'cumExecQty');
        const status = this.parseOrderStatus (this.safeString2 (order, 'X', 'orderStatus'));
        const side = this.safeStringLower2 (order, 'S', 'side');
        const lastTradeTimestamp = this.safeString2 (order, 'E', 'updatedTime');
        const timeInForce = this.safeString2 (order, 'f', 'timeInForce');
        let amount = undefined;
        const cost = this.safeString2 (order, 'Z', 'cumExecValue');
        let type = this.safeStringLower2 (order, 'o', 'orderType');
        if ((type !== undefined) && (type.indexOf ('market') >= 0)) {
            type = 'market';
        }
        if (type === 'market' && side === 'buy') {
            amount = filled;
        } else {
            amount = this.safeString2 (order, 'orderQty', 'qty');
        }
        let fee = undefined;
        const feeCost = this.safeString2 (order, 'n', 'cumExecFee');
        if (feeCost !== undefined && feeCost !== '0') {
            const feeCurrencyId = this.safeString (order, 'N');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const triggerPrice = this.omitZero (this.safeString (order, 'triggerPrice'));
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': this.safeString2 (order, 'c', 'orderLinkId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': this.safeString (order, 'takeProfit'),
            'stopLossPrice': this.safeString (order, 'stopLoss'),
            'reduceOnly': this.safeValue (order, 'reduceOnly'),
            'amount': amount,
            'cost': cost,
            'average': this.safeString (order, 'avgPrice'),
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
        }, market);
    }

    /**
     * @method
     * @name bybit#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bybit-exchange.github.io/docs/v5/websocket/private/wallet
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const method = 'watchBalance';
        let messageHash = 'balances';
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        let subType = undefined;
        [ subType, params ] = this.handleSubTypeAndParams ('watchBalance', undefined, params);
        const unified = await this.isUnifiedEnabled ();
        const isUnifiedMargin = this.safeBool (unified, 0, false);
        const isUnifiedAccount = this.safeBool (unified, 1, false);
        const url = await this.getUrlByMarketType (undefined, true, method, params);
        await this.authenticate (url);
        const topicByMarket: Dict = {
            'spot': 'outboundAccountInfo',
            'unified': 'wallet',
        };
        if (isUnifiedAccount) {
            // unified account
            if (subType === 'inverse') {
                messageHash += ':contract';
            } else {
                messageHash += ':unified';
            }
        }
        if (!isUnifiedMargin && !isUnifiedAccount) {
            // normal account using v5
            if (type === 'spot') {
                messageHash += ':spot';
            } else {
                messageHash += ':contract';
            }
        }
        if (isUnifiedMargin) {
            // unified margin account using v5
            if (type === 'spot') {
                messageHash += ':spot';
            } else {
                if (subType === 'linear') {
                    messageHash += ':unified';
                } else {
                    messageHash += ':contract';
                }
            }
        }
        const topics = [ this.safeValue (topicByMarket, this.getPrivateType (url)) ];
        return await this.watchTopics (url, [ messageHash ], topics, params);
    }

    handleBalance (client: Client, message) {
        //
        // spot
        //    {
        //        "type": "snapshot",
        //        "topic": "outboundAccountInfo",
        //        "ts": "1662107217641",
        //        "data": [
        //            {
        //                "e": "outboundAccountInfo",
        //                "E": "1662107217640",
        //                "T": true,
        //                "W": true,
        //                "D": true,
        //                "B": [
        //                    {
        //                        "a": "USDT",
        //                        "f": "176.81254174",
        //                        "l": "201.575"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        // unified
        //     {
        //         "id": "5923242c464be9-25ca-483d-a743-c60101fc656f",
        //         "topic": "wallet",
        //         "creationTime": 1672364262482,
        //         "data": [
        //             {
        //                 "accountIMRate": "0.016",
        //                 "accountMMRate": "0.003",
        //                 "totalEquity": "12837.78330098",
        //                 "totalWalletBalance": "12840.4045924",
        //                 "totalMarginBalance": "12837.78330188",
        //                 "totalAvailableBalance": "12632.05767702",
        //                 "totalPerpUPL": "-2.62129051",
        //                 "totalInitialMargin": "205.72562486",
        //                 "totalMaintenanceMargin": "39.42876721",
        //                 "coin": [
        //                     {
        //                         "coin": "USDC",
        //                         "equity": "200.62572554",
        //                         "usdValue": "200.62572554",
        //                         "walletBalance": "201.34882644",
        //                         "availableToWithdraw": "0",
        //                         "availableToBorrow": "1500000",
        //                         "borrowAmount": "0",
        //                         "accruedInterest": "0",
        //                         "totalOrderIM": "0",
        //                         "totalPositionIM": "202.99874213",
        //                         "totalPositionMM": "39.14289747",
        //                         "unrealisedPnl": "74.2768991",
        //                         "cumRealisedPnl": "-209.1544627",
        //                         "bonus": "0"
        //                     },
        //                     {
        //                         "coin": "BTC",
        //                         "equity": "0.06488393",
        //                         "usdValue": "1023.08402268",
        //                         "walletBalance": "0.06488393",
        //                         "availableToWithdraw": "0.06488393",
        //                         "availableToBorrow": "2.5",
        //                         "borrowAmount": "0",
        //                         "accruedInterest": "0",
        //                         "totalOrderIM": "0",
        //                         "totalPositionIM": "0",
        //                         "totalPositionMM": "0",
        //                         "unrealisedPnl": "0",
        //                         "cumRealisedPnl": "0",
        //                         "bonus": "0"
        //                     },
        //                     {
        //                         "coin": "ETH",
        //                         "equity": "0",
        //                         "usdValue": "0",
        //                         "walletBalance": "0",
        //                         "availableToWithdraw": "0",
        //                         "availableToBorrow": "26",
        //                         "borrowAmount": "0",
        //                         "accruedInterest": "0",
        //                         "totalOrderIM": "0",
        //                         "totalPositionIM": "0",
        //                         "totalPositionMM": "0",
        //                         "unrealisedPnl": "0",
        //                         "cumRealisedPnl": "0",
        //                         "bonus": "0"
        //                     },
        //                     {
        //                         "coin": "USDT",
        //                         "equity": "11726.64664904",
        //                         "usdValue": "11613.58597018",
        //                         "walletBalance": "11728.54414904",
        //                         "availableToWithdraw": "11723.92075829",
        //                         "availableToBorrow": "2500000",
        //                         "borrowAmount": "0",
        //                         "accruedInterest": "0",
        //                         "totalOrderIM": "0",
        //                         "totalPositionIM": "2.72589075",
        //                         "totalPositionMM": "0.28576575",
        //                         "unrealisedPnl": "-1.8975",
        //                         "cumRealisedPnl": "0.64782276",
        //                         "bonus": "0"
        //                     },
        //                     {
        //                         "coin": "EOS3L",
        //                         "equity": "215.0570412",
        //                         "usdValue": "0",
        //                         "walletBalance": "215.0570412",
        //                         "availableToWithdraw": "215.0570412",
        //                         "availableToBorrow": "0",
        //                         "borrowAmount": "0",
        //                         "accruedInterest": "",
        //                         "totalOrderIM": "0",
        //                         "totalPositionIM": "0",
        //                         "totalPositionMM": "0",
        //                         "unrealisedPnl": "0",
        //                         "cumRealisedPnl": "0",
        //                         "bonus": "0"
        //                     },
        //                     {
        //                         "coin": "BIT",
        //                         "equity": "1.82",
        //                         "usdValue": "0.48758257",
        //                         "walletBalance": "1.82",
        //                         "availableToWithdraw": "1.82",
        //                         "availableToBorrow": "0",
        //                         "borrowAmount": "0",
        //                         "accruedInterest": "",
        //                         "totalOrderIM": "0",
        //                         "totalPositionIM": "0",
        //                         "totalPositionMM": "0",
        //                         "unrealisedPnl": "0",
        //                         "cumRealisedPnl": "0",
        //                         "bonus": "0"
        //                     }
        //                 ],
        //                 "accountType": "UNIFIED"
        //             }
        //         ]
        //     }
        //
        if (this.balance === undefined) {
            this.balance = {};
        }
        let messageHash = 'balance';
        const topic = this.safeValue (message, 'topic');
        let info = undefined;
        let rawBalances = [];
        let account = undefined;
        if (topic === 'outboundAccountInfo') {
            account = 'spot';
            const data = this.safeValue (message, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const B = this.safeValue (data[i], 'B', []);
                rawBalances = this.arrayConcat (rawBalances, B);
            }
            info = rawBalances;
        }
        if (topic === 'wallet') {
            const data = this.safeValue (message, 'data', {});
            for (let i = 0; i < data.length; i++) {
                const result = this.safeValue (data, 0, {});
                account = this.safeStringLower (result, 'accountType');
                rawBalances = this.arrayConcat (rawBalances, this.safeValue (result, 'coin', []));
            }
            info = data;
        }
        for (let i = 0; i < rawBalances.length; i++) {
            this.parseWsBalance (rawBalances[i], account);
        }
        if (account !== undefined) {
            if (this.safeValue (this.balance, account) === undefined) {
                this.balance[account] = {};
            }
            this.balance[account]['info'] = info;
            const timestamp = this.safeInteger (message, 'ts');
            this.balance[account]['timestamp'] = timestamp;
            this.balance[account]['datetime'] = this.iso8601 (timestamp);
            this.balance[account] = this.safeBalance (this.balance[account]);
            messageHash = 'balances:' + account;
            client.resolve (this.balance[account], messageHash);
        } else {
            this.balance['info'] = info;
            const timestamp = this.safeInteger (message, 'ts');
            this.balance['timestamp'] = timestamp;
            this.balance['datetime'] = this.iso8601 (timestamp);
            this.balance = this.safeBalance (this.balance);
            messageHash = 'balances';
            client.resolve (this.balance, messageHash);
        }
    }

    parseWsBalance (balance, accountType = undefined) {
        //
        // spot
        //    {
        //        "a": "USDT",
        //        "f": "176.81254174",
        //        "l": "201.575"
        //    }
        // unified
        //     {
        //         "coin": "BTC",
        //         "equity": "0.06488393",
        //         "usdValue": "1023.08402268",
        //         "walletBalance": "0.06488393",
        //         "availableToWithdraw": "0.06488393",
        //         "availableToBorrow": "2.5",
        //         "borrowAmount": "0",
        //         "accruedInterest": "0",
        //         "totalOrderIM": "0",
        //         "totalPositionIM": "0",
        //         "totalPositionMM": "0",
        //         "unrealisedPnl": "0",
        //         "cumRealisedPnl": "0",
        //         "bonus": "0"
        //     }
        //
        const account = this.account ();
        const currencyId = this.safeString2 (balance, 'a', 'coin');
        const code = this.safeCurrencyCode (currencyId);
        account['free'] = this.safeStringN (balance, [ 'availableToWithdraw', 'f', 'free', 'availableToWithdraw' ]);
        account['used'] = this.safeString2 (balance, 'l', 'locked');
        account['total'] = this.safeString (balance, 'walletBalance');
        if (accountType !== undefined) {
            if (this.safeValue (this.balance, accountType) === undefined) {
                this.balance[accountType] = {};
            }
            this.balance[accountType][code] = account;
        } else {
            this.balance[code] = account;
        }
    }

    async watchTopics (url, messageHashes, topics, params = {}) {
        const request: Dict = {
            'op': 'subscribe',
            'req_id': this.requestId (),
            'args': topics,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes);
    }

    async unWatchTopics (url: string, topic: string, symbols: string[], messageHashes: string[], subMessageHashes: string[], topics, params = {}, subExtension = {}) {
        const reqId = this.requestId ();
        const request: Dict = {
            'op': 'unsubscribe',
            'req_id': reqId,
            'args': topics,
        };
        const subscription = {
            'id': reqId,
            'topic': topic,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'symbols': symbols,
        };
        const message = this.extend (request, params);
        return await this.watchMultiple (url, messageHashes, message, messageHashes, this.extend (subscription, subExtension));
    }

    async authenticate (url, params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const expiresInt = this.milliseconds () + 10000;
            const expires = this.numberToString (expiresInt);
            const path = 'GET/realtime';
            const auth = path + expires;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256, 'hex');
            const request: Dict = {
                'op': 'auth',
                'args': [
                    this.apiKey, expires, signature,
                ],
            };
            const message = this.extend (request, params);
            this.watch (url, messageHash, message, messageHash);
        }
        return await future;
    }

    handleErrorMessage (client: Client, message) {
        //
        //   {
        //       "success": false,
        //       "ret_msg": "error:invalid op",
        //       "conn_id": "5e079fdd-9c7f-404d-9dbf-969d650838b5",
        //       "request": { op: '', args: null }
        //   }
        //
        // auth error
        //
        //   {
        //       "success": false,
        //       "ret_msg": "error:USVC1111",
        //       "conn_id": "e73770fb-a0dc-45bd-8028-140e20958090",
        //       "request": {
        //         "op": "auth",
        //         "args": [
        //           "9rFT6uR4uz9Imkw4Wx",
        //           "1653405853543",
        //           "542e71bd85597b4db0290f0ce2d13ed1fd4bb5df3188716c1e9cc69a879f7889"
        //         ]
        //   }
        //
        //   { code: '-10009', desc: "Invalid period!" }
        //
        //   {
        //       "reqId":"1",
        //       "retCode":170131,
        //       "retMsg":"Insufficient balance.",
        //       "op":"order.create",
        //       "data":{
        //
        //       },
        //       "header":{
        //           "X-Bapi-Limit":"20",
        //           "X-Bapi-Limit-Status":"19",
        //           "X-Bapi-Limit-Reset-Timestamp":"1714236608944",
        //           "Traceid":"3d7168a137bf32a947b7e5e6a575ac7f",
        //           "Timenow":"1714236608946"
        //       },
        //       "connId":"cojifin88smerbj9t560-406"
        //   }
        //
        const code = this.safeStringN (message, [ 'code', 'ret_code', 'retCode' ]);
        try {
            if (code !== undefined && code !== '0') {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                const msg = this.safeString2 (message, 'retMsg', 'ret_msg');
                this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
                throw new ExchangeError (feedback);
            }
            const success = this.safeValue (message, 'success');
            if (success !== undefined && !success) {
                const ret_msg = this.safeString (message, 'ret_msg');
                const request = this.safeValue (message, 'request', {});
                const op = this.safeString (request, 'op');
                if (op === 'auth') {
                    throw new AuthenticationError ('Authentication failed: ' + ret_msg);
                } else {
                    throw new ExchangeError (this.id + ' ' + ret_msg);
                }
            }
            return false;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                const messageHash = this.safeString (message, 'reqId');
                client.reject (error, messageHash);
            }
            return true;
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        // contract pong
        const ret_msg = this.safeString (message, 'ret_msg');
        if (ret_msg === 'pong') {
            this.handlePong (client, message);
            return;
        }
        // spot pong
        const pong = this.safeInteger (message, 'pong');
        if (pong !== undefined) {
            this.handlePong (client, message);
            return;
        }
        // pong
        const event = this.safeString (message, 'event');
        if (event === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const topic = this.safeString2 (message, 'topic', 'op', '');
        const methods: Dict = {
            'orderbook': this.handleOrderBook,
            'kline': this.handleOHLCV,
            'order': this.handleOrder,
            'stopOrder': this.handleOrder,
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'publicTrade': this.handleTrades,
            'depth': this.handleOrderBook,
            'wallet': this.handleBalance,
            'outboundAccountInfo': this.handleBalance,
            'execution': this.handleMyTrades,
            'ticketInfo': this.handleMyTrades,
            'user.openapi.perp.trade': this.handleMyTrades,
            'position': this.handlePositions,
            'liquidation': this.handleLiquidation,
            'allLiquidation': this.handleLiquidation,
            'pong': this.handlePong,
            'order.create': this.handleOrderWs,
            'order.amend': this.handleOrderWs,
            'order.cancel': this.handleOrderWs,
            'auth': this.handleAuthenticate,
            'unsubscribe': this.handleUnSubscribe,
        };
        const exacMethod = this.safeValue (methods, topic);
        if (exacMethod !== undefined) {
            exacMethod.call (this, client, message);
            return;
        }
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (topic.indexOf (keys[i]) >= 0) {
                const method = methods[key];
                method.call (this, client, message);
                return;
            }
        }
        // unified auth acknowledgement
        const type = this.safeString (message, 'type');
        if (type === 'AUTH_RESP') {
            this.handleAuthenticate (client, message);
        }
    }

    ping (client: Client) {
        return {
            'req_id': this.requestId (),
            'op': 'ping',
        };
    }

    handlePong (client: Client, message) {
        //
        //   {
        //       "success": true,
        //       "ret_msg": "pong",
        //       "conn_id": "db3158a0-8960-44b9-a9de-ac350ee13158",
        //       "request": { op: "ping", args: null }
        //   }
        //
        //   { pong: 1653296711335 }
        //
        client.lastPong = this.safeInteger (message, 'pong');
        return message;
    }

    handleAuthenticate (client: Client, message) {
        //
        //    {
        //        "success": true,
        //        "ret_msg": '',
        //        "op": "auth",
        //        "conn_id": "ce3dpomvha7dha97tvp0-2xh"
        //    }
        //
        //    {
        //        "retCode":0,
        //        "retMsg":"OK",
        //        "op":"auth",
        //        "connId":"cojifin88smerbj9t560-404"
        //    }
        //
        const success = this.safeValue (message, 'success');
        const code = this.safeInteger (message, 'retCode');
        const messageHash = 'authenticated';
        if (success || code === 0) {
            const future = this.safeValue (client.futures, messageHash);
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
        return message;
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //    {
        //        "topic": "kline",
        //        "event": "sub",
        //        "params": {
        //          "symbol": "LTCUSDT",
        //          "binary": "false",
        //          "klineType": "1m",
        //          "symbolName": "LTCUSDT"
        //        },
        //        "code": "0",
        //        "msg": "Success"
        //    }
        //
        return message;
    }

    handleUnSubscribe (client: Client, message) {
        //
        // {"success":true,"ret_msg":"","conn_id":"7188110e-6908-41e9-b863-6365127e92ad","req_id":"3","op":"unsubscribe"}
        //
        // client.subscription will be something like:
        // {
        //     "publicTrade.LTCUSDT":true,
        //     "publicTrade.ADAUSDT":true,
        //     "unsubscribe:trade:LTC/USDT:USDT": {
        //        "id":4,
        //         "subHash": "trade:LTC/USDT"
        //     },
        // }
        const reqId = this.safeString (message, 'req_id');
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = keys[i];
            if (!(messageHash in client.subscriptions)) {
                continue;
                // the previous iteration can have deleted the messageHash from the subscriptions
            }
            if (messageHash.startsWith ('unsubscribe')) {
                const subscription = client.subscriptions[messageHash];
                const subId = this.safeString (subscription, 'id');
                if (reqId !== subId) {
                    continue;
                }
                const messageHashes = this.safeList (subscription, 'messageHashes', []);
                const subMessageHashes = this.safeList (subscription, 'subMessageHashes', []);
                for (let j = 0; j < messageHashes.length; j++) {
                    const unsubHash = messageHashes[j];
                    const subHash = subMessageHashes[j];
                    this.cleanUnsubscription (client, subHash, unsubHash);
                }
                this.cleanCache (subscription);
            }
        }
        return message;
    }

}
