
//  ---------------------------------------------------------------------------

import arkmRest from '../arkm.js';
import { BadRequest, NetworkError, NotSupported, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Balances, Ticker, Tickers, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class arkm extends arkmRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                // 'watchTrades': true,
                // 'watchTradesForSymbols': false,
                // 'watchOrderBook': true,
                // 'watchOrderBookForSymbols': true,
                // 'watchOHLCV': true,
                // 'watchOHLCVForSymbols': true,
                // 'watchOrders': true,
                // 'watchMyTrades': true,
                // 'watchTicker': true,
                // 'watchTickers': true,
                // 'watchBalance': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'spot': 'wss://arkm.com/ws',
                        'linear': 'wss://arkm.com/ws',
                        'inverse': 'wss://arkm.com/ws',
                    },
                },
            },
            'options': {
                'listenKeyRefreshRate': 3540000, // 1 hour (59 mins so we have 1 min to renew the token)
                'ws': {
                    'gunzip': true,
                },
                'watchBalance': {
                    'fetchBalanceSnapshot': true, // needed to be true to keep track of used and free balance
                    'awaitBalanceSnapshot': false, // whether to wait for the balance snapshot before providing updates
                },
                'watchOrderBook': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchOrderBookForSymbols': {
                    'depth': 100, // 5, 10, 20, 50, 100
                    'interval': 500, // 100, 200, 500, 1000
                },
                'watchTrades': {
                    'ignoreDuplicates': true,
                },
            },
            'streaming': {
                'keepAlive': 1800000, // 30 minutes
            },
        });
    }

    handleMessage (client: Client, message) {
        //
        // confirmation
        //
        //     {channel: 'confirmations', confirmationId: 'myCustomId-123'}
        //
        // if (!this.handleErrorMessage (client, message)) {
        //     return;
        // }
        const methods: Dict = {
            'ticker': this.handleTicker,
            // 'confirmations': this.handleTicker,
        };
        const channel = this.safeString (message, 'channel');
        if (channel === 'confirmations') {
            return;
        }
        const type = this.safeString (message, 'type');
        if (type !== 'update' && type !== 'snapshot') {
            debugger;
        }
        const method = this.safeValue (methods, channel);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    getMessageHash (unifiedChannel: string, symbol: Str = undefined, extra: Str = undefined) {
        let hash = unifiedChannel;
        if (symbol !== undefined) {
            hash += '::' + symbol;
        } else {
            hash += 's'; // tickers, orderbooks, ohlcvs ...
        }
        if (extra !== undefined) {
            hash += '::' + extra;
        }
        return hash;
    }

    async watchSingle (messageHash: Str, request: Dict, subscriptionHash: Str): Promise<any> {
        return await this.watch (this.urls['api']['ws']['spot'], messageHash, request, subscriptionHash);
    }

    /**
     * @method
     * @name arkm#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://arkm.com/docs#stream/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const subscriptionHash = market['id'] + '@ticker';
        const messageHash = this.getMessageHash ('ticker', market['symbol']);
        const request: Dict = {
            'args': {
                'channel': 'ticker',
                'params': {
                    'snapshot': true,
                    'symbol': 'BTC_USDT',
                },
            },
            'confirmationId': this.uuid (),
            'method': 'subscribe',
        };
        return await this.watchSingle (messageHash, this.extend (request, params), subscriptionHash);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //   channel: 'ticker',
        //   type: 'update',
        //   data: {
        //     symbol: 'BTC_USDT',
        //     baseSymbol: 'BTC',
        //     quoteSymbol: 'USDT',
        //     price: '118962.74',
        //     price24hAgo: '118780.42',
        //     high24h: '120327.96',
        //     low24h: '118217.28',
        //     volume24h: '32.89729',
        //     quoteVolume24h: '3924438.7146048',
        //     markPrice: '0',
        //     indexPrice: '118963.080293501',
        //     fundingRate: '0',
        //     nextFundingRate: '0',
        //     nextFundingTime: 0,
        //     productType: 'spot',
        //     openInterest: '0',
        //     indexCurrency: 'USDT',
        //     usdVolume24h: '3924438.7146048',
        //     openInterestUSD: '0'
        //   }
        // }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId, undefined);
        const symbol = market['symbol'];
        const ticker = this.parseWsTicker (data, market);
        this.tickers[symbol] = ticker;
        client.resolve (ticker, this.getMessageHash ('ticker', symbol));
        // if (this.safeString (message, 'dataType') === 'all@ticker') {
        //     client.resolve (ticker, this.getMessageHash ('ticker'));
        // }
    }

    parseWsTicker (message, market = undefined) {
        // same dict as REST api
        return this.parseTicker (message, market);
    }
}
