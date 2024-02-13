//  ---------------------------------------------------------------------------

import deltaRest from '../delta.js';
import { ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Int, Market, OHLCV, Strings, Ticker, Tickers } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------
export default class delta extends deltaRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': false,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://socket.delta.exchange',
                },
                'test': {
                    'ws': 'wss://testnet-socket.delta.exchange',
                },
            },
        });
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name delta#watchTicker
         * @see https://docs.delta.exchange/#v2-ticker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.watchTickers ([ symbol ], params);
        return this.safeDict (ticker, symbol, {}) as Ticker;
    }

    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name delta#watchTickers
         * @see https://docs.delta.exchange/#v2-ticker
         * @description watches price tickers, a statistical calculation with the information for all markets or those specified.
         * @param {string} symbols unified symbols of the markets to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an array of [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true);
        const marketIds = this.marketIds (symbols);
        const subscriptionHash = 'v2/ticker';
        const messageHash = 'tickers';
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': 'v2/ticker',
                        'symbols': marketIds,
                    },
                ],
            },
        };
        const tickers = await this.watchMany (messageHash, request, subscriptionHash, symbols, params);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "close: 2669.25,
        //         "contract_type": "spot",
        //         "greeks": null,
        //         "high": 2685.65,
        //         "low": 2484.25,
        //         "mark_change_24h": "0.0000",
        //         "mark_price": "3200",
        //         "oi": "0.0000",
        //         "oi_change_usd_6h": "0.0000",
        //         "oi_contracts": "0",
        //         "oi_value": "0.0000",
        //         "oi_value_symbol": "ETH",
        //         "oi_value_usd": "0.0000",
        //         "open": 2486.3,
        //         "price_band": null,
        //         "product_id": 8411,
        //         "quotes": {},
        //         "size": 67.1244100000001,
        //         "spot_price": "2668.12",
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1707830745453077",
        //         "turnover": 67.1244100000001,
        //         "turnover_symbol": "ETH",
        //         "turnover_usd": 174972.02068899997,
        //         "type": "v2/ticker",
        //         "volume": 67.1244100000001
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const symbol = this.safeSymbol (marketId);
        this.tickers[symbol] = this.parseTicker (message);
        client.resolve (this.tickers[symbol], 'ticker.' + symbol);
        client.resolve (this.tickers, 'tickers');
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name delta#fetchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.delta.exchange/#candlesticks
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const timeframeId = this.safeString (this.timeframes, timeframe, timeframe);
        const request = {
            'type': 'subscribe',
            'payload': {
                'channels': [
                    {
                        'name': 'candlestick_' + timeframeId,
                        'symbols': [
                            market['id'],
                        ],
                    },
                ],
            },
        };
        const messageHash = 'ohlcv:' + market['symbol'] + ':' + timeframeId;
        const url = this.urls['api']['ws'];
        const ohlcv = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "candle_start_time": "1706548320000000",
        //         "close": 2301.65,
        //         "high": 2301.65,
        //         "last_updated": "1706548346156723",
        //         "low": 2301.65,
        //         "open": 2301.65,
        //         "resolution": "1m",
        //         "symbol": "ETH_USDT",
        //         "timestamp": "1706548377948581",
        //         "type": "candlestick_1m",
        //         "volume": 0.187
        //     }
        //
        const type = this.safeString (message, 'type', '');
        const typeAndTimeframeId = type.split ('_');
        const timeframeId = typeAndTimeframeId[1];
        const marketId = this.safeString (message, 'symbol', '');
        const market = this.safeMarket (marketId);
        const symbol = this.safeSymbol (marketId, market);
        const timeframe = this.findTimeframe (timeframeId);
        const ohlcvsBySymbol = this.safeDict (this.ohlcvs, symbol);
        if (ohlcvsBySymbol === undefined) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeList (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const parsed = this.parseWsOHLCV (message, market);
        stored.push (parsed);
        const messageHash = 'ohlcv:' + symbol + ':' + timeframeId;
        client.resolve (stored, messageHash);
    }

    parseWsOHLCV (ohlcv, market: Market = undefined): OHLCV {
        const result = this.parseOHLCV (ohlcv, market);
        result[0] = this.safeIntegerProduct (ohlcv, 'candle_start_time', 0.001);
        return result;
    }

    async watchMany (messageHash, request, subscriptionHash, symbols: Strings = [], params = {}) {
        let marketIds = [];
        const numSymbols = symbols.length;
        if (numSymbols === 0) {
            marketIds = Object.keys (this.markets_by_id);
        } else {
            marketIds = this.marketIds (symbols);
        }
        const url = this.urls['api']['ws'];
        const client = this.safeValue (this.clients, url);
        let subscription = {};
        if (client !== undefined) {
            subscription = this.safeDict (client.subscriptions, subscriptionHash, {});
            if (subscription !== undefined) {
                for (let i = 0; i < marketIds.length; i++) {
                    const marketId = marketIds[i];
                    const marketSubscribed = this.safeBool (subscription, marketId, false);
                    if (!marketSubscribed) {
                        client.subscriptions[subscriptionHash] = undefined;
                    }
                }
            }
        }
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            subscription[marketId] = true;
        }
        request['type'] = 'subscribe';
        request['payload']['channels'][0]['symbols'] = Object.keys (subscription);
        return await this.watch (url, messageHash, this.deepExtend (request, params), subscriptionHash, subscription);
    }

    handleMessage (client: Client, message) {
        const type = this.safeString (message, 'type', '');
        if (type.indexOf ('candlestick') > -1) {
            return this.handleOHLCV (client, message);
        }
        if (type === 'v2/ticker') {
            return this.handleTicker (client, message);
        }
    }
}
