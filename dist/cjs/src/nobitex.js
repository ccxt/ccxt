'use strict';

var nobitex$1 = require('./abstract/nobitex.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class nobitex
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
class nobitex extends nobitex$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'nobitex',
            'name': 'Nobitex',
            'country': ['IR'],
            'rateLimit': 1000,
            'version': '1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL2OrderBook': false,
                'fetchLedger': false,
                'fetchLedgerEntry': false,
                'fetchLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': 'emulated',
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'comment': 'This comment is optional',
            'urls': {
                'logo': 'https://cdn.arz.digital/cr-odin/img/exchanges/nobitex/64x64.png',
                'api': {
                    'public': 'https://api.nobitex.ir',
                },
                'www': 'https://nobitex.ir/',
                'doc': [
                    'https://apidocs.nobitex.ir',
                ],
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '3h': '180',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '2d': '2D',
                '3d': '3D',
            },
            'api': {
                'public': {
                    'get': {
                        'market/stats': 1,
                        'market/udf/history': 1,
                        'v2/orderbook': 1,
                    },
                },
            },
            'commonCurrencies': {
                'RLS': 'IRT',
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber('0.001'),
                    'taker': this.parseNumber('0.001'),
                },
            },
        });
    }
    async fetchMarkets(symbols = undefined, params = {}) {
        /**
         * @method
         * @name nobitex#fetchMarkets
         * @description retrieves data on all markets for nobitex
         * @see https://apidocs.nobitex.ir/#6ae2dae4a2
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'srcCurrency': 'btc,usdt,eth,etc,doge,ada,bch,ltc,bnb,eos,xlm,xrp,trx,uni,link,dai,dot,shib,aave,ftm,matic,axs,mana,sand,avax,usdc,gmt,mkr,sol,atom,grt,bat,near,ape,qnt,chz,xmr,egala,busd,algo,hbar,1inch,yfi,flow,snx,enj,crv,fil,wbtc,ldo,dydx,apt,mask,comp,bal,lrc,lpt,ens,sushi,api3,one,glm,pmn,dao,cvc,nmr,storj,snt,ant,zrx,slp,egld,imx,blur,100k_floki,1b_babydoge,1m_nft,1m_btt,t,celr,arb,magic,gmx,band,cvx,ton,ssv,mdt,omg,wld,rdnt,jst,bico,rndr,woo,skl,gal,agix,fet,not,xtz,agld,trb,rsr,ethfi',
            'dstCurrency': 'rls,usdt',
        };
        const response = await this.publicGetMarketStats(request);
        const markets = this.safeDict(response, 'stats');
        const marketKeys = Object.keys(markets);
        const result = [];
        for (let i = 0; i < marketKeys.length; i++) {
            const symbol = marketKeys[i];
            markets[symbol]['symbol'] = symbol;
            const market = await this.parseMarket(markets[symbol]);
            result.push(market);
        }
        return result;
    }
    parseMarket(market) {
        //        {
        // symbol: btc-usdt
        // isClosed: false,
        // bestSell: "39659550020",
        // bestBuy: "39650000000",
        // volumeSrc: "11.6924501388",
        // volumeDst: "464510376461.05263193275",
        // latest: "39659550020",
        // mark: "39817678220",
        // dayLow: "38539978000",
        // dayHigh: "40809999990",
        // dayOpen: "38553149810",
        // dayClose: "39659550020",
        // dayChange: "2.87"
        // },
        const symbol = this.safeStringUpper(market, 'symbol');
        const id = symbol.replace('-', '');
        let [baseId, quoteId] = symbol.split('-');
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        baseId = baseId.toLowerCase();
        quoteId = quoteId.toLowerCase();
        return {
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
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
            },
            'created': undefined,
            'info': market,
        };
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name nobitex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://apidocs.nobitex.ir/#6ae2dae4a2
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        if (symbols !== undefined) {
            symbols = this.marketSymbols(symbols);
        }
        const request = {
            'srcCurrency': 'btc,usdt,eth,etc,doge,ada,bch,ltc,bnb,eos,xlm,xrp,trx,uni,link,dai,dot,shib,aave,ftm,matic,axs,mana,sand,avax,usdc,gmt,mkr,sol,atom,grt,bat,near,ape,qnt,chz,xmr,egala,busd,algo,hbar,1inch,yfi,flow,snx,enj,crv,fil,wbtc,ldo,dydx,apt,mask,comp,bal,lrc,lpt,ens,sushi,api3,one,glm,pmn,dao,cvc,nmr,storj,snt,ant,zrx,slp,egld,imx,blur,100k_floki,1b_babydoge,1m_nft,1m_btt,t,celr,arb,magic,gmx,band,cvx,ton,ssv,mdt,omg,wld,rdnt,jst,bico,rndr,woo,skl,gal,agix,fet,not,xtz,agld,trb,rsr,ethfi',
            'dstCurrency': 'rls,usdt',
        };
        const response = await this.publicGetMarketStats(request);
        const markets = this.safeDict(response, 'stats');
        const marketKeys = Object.keys(markets);
        const result = [];
        for (let i = 0; i < marketKeys.length; i++) {
            let symbol = marketKeys[i];
            markets[symbol]['symbol'] = symbol;
            const ticker = await this.parseTicker(markets[symbol]);
            symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArrayTickers(result, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name nobitex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://apidocs.nobitex.ir/#6ae2dae4a2
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const ticker = await this.fetchTickers([symbol]);
        return ticker[symbol];
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //      symbol: "USDT-IRT",
        //      last: "61338.0",
        //      best_ask: "61338.0",
        //      best_bid: "61338.0",
        //      open_24h: "61419",
        //      high_24h: 61739,
        //      low_24h: 60942,
        //      vol_24h_pair: 11017655160,
        //      vol_24h: 17968,
        //      ts: 1715074621
        //     }
        //
        const marketType = 'spot';
        let symbol = this.safeStringUpper(ticker, 'symbol');
        const marketId = symbol.replace('-', '');
        const marketinfo = this.market(marketId);
        symbol = this.safeSymbol(marketId, market, undefined, marketType);
        let high = this.safeFloat(ticker, 'dayHigh');
        let low = this.safeFloat(ticker, 'dayLow');
        let bid = this.safeFloat(ticker, 'bestBuy');
        let ask = this.safeFloat(ticker, 'bestSell');
        let open = this.safeFloat(ticker, 'dayOpen');
        let close = this.safeFloat(ticker, 'dayClose');
        const change = this.safeFloat(ticker, 'dayChange');
        let last = this.safeFloat(ticker, 'latest');
        let quoteVolume = this.safeFloat(ticker, 'volumeDst');
        const baseVolume = this.safeFloat(ticker, 'volumeSrc');
        if (marketinfo['quote'] === 'IRT') {
            high /= 10;
            low /= 10;
            bid /= 10;
            ask /= 10;
            open /= 10;
            close /= 10;
            last /= 10;
            quoteVolume /= 10;
        }
        return this.safeTicker({
            'symbol': symbol.replace('-', '/'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': this.safeFloat(bid, 0),
            'bidVolume': undefined,
            'ask': this.safeFloat(ask, 0),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name nobitex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://apidocs.nobitex.ir/#ohlc
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const endTime = Date.now();
        const request = {
            'symbol': market['id'],
            'from': (endTime / 1000) - (24 * 60 * 60),
            'to': endTime / 1000,
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
            // 'limit': 500,
        };
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        request['from'] = this.safeInteger(request, 'from');
        request['to'] = this.safeInteger(request, 'to');
        if (timeframe !== undefined) {
            request['resolution'] = this.safeString(this.timeframes, timeframe, timeframe);
        }
        const response = await this.publicGetMarketUdfHistory(request);
        const openList = this.safeValue(response, 'o', []);
        const highList = this.safeList(response, 'h', []);
        const lowList = this.safeList(response, 'l', []);
        const closeList = this.safeList(response, 'c', []);
        const volumeList = this.safeList(response, 'v', []);
        const timestampList = this.safeList(response, 't', []);
        const ohlcvs = [];
        for (let i = 0; i < openList.length; i++) {
            if (market['quote'] === 'IRT') {
                openList[i] /= 10;
                highList[i] /= 10;
                lowList[i] /= 10;
                closeList[i] /= 10;
                volumeList[i] /= 10;
            }
            ohlcvs.push([
                timestampList[i],
                openList[i],
                highList[i],
                lowList[i],
                closeList[i],
                volumeList[i],
            ]);
        }
        return this.parseOHLCVs(ohlcvs, market, timeframe, since, limit);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name nobitex#fetchOrderBooks
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
         * @see https://apidocs.nobitex.ir/#orderbook
         * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
         * @param {int} [limit] max number of entries per orderbook to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': symbol.replace('/', ''),
        };
        const response = await this.publicGetV2Orderbook(request);
        if (market['quote'] === 'IRT') {
            const bids = this.safeList(response, 'bids');
            const asks = this.safeList(response, 'asks');
            for (let i = 0; i < bids.length; i++) {
                bids[i][0] /= 10;
            }
            for (let i = 0; i < asks.length; i++) {
                asks[i][0] /= 10;
            }
            response['bids'] = bids;
            response['asks'] = asks;
        }
        const timestamp = this.safeInteger(response, 'lastUpdate');
        return this.parseOrderBook(response, symbol, timestamp);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit(params, this.extractParams(path));
        let url = this.urls['api']['public'] + '/' + path;
        if (path === 'market/udf/history') {
            url = this.urls['api']['public'] + '/' + path + '?' + this.urlencode(query);
        }
        if (path === 'market/stats') {
            url = url + '?' + this.urlencode(query);
        }
        if (path === 'v2/orderbook') {
            url = url + '/' + params['symbol'];
        }
        headers = { 'Content-Type': 'application/json' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = nobitex;
