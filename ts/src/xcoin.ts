
//  ---------------------------------------------------------------------------

import Exchange from './abstract/xcoin.js';
import { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError, OrderNotFound, AccountSuspended, BadSymbol, OrderImmediatelyFillable, RateLimitExceeded, OnMaintenance, PermissionDenied, BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Dict, int, LedgerEntry, DepositAddress, FundingRates, FundingRate, FundingRateHistory } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class zonda
 * @augments Exchange
 */
export default class xcoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'xcoin',
            'name': 'XCoin',
            'countries': [ 'HK' ], // Hong Kong
            'rateLimit': 100,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
            },
            'hostname': 'xcoin.com',
            'urls': {
                'referral': '__________________________',
                'logo': '__________________________',
                'www': 'https://xcoin.com/',
                'api': {
                    'public': 'https://api.{hostname}/api',
                    'private': 'https://api.{hostname}/api',
                },
                'doc': [
                    'https://xcoin.com/docs/',
                ],
                'support': 'https://support.xcoin.com/',
                'fees': 'https://xcoin.com/zh-CN/trade/guide/spot-fee-rate',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/market/time': 1,
                        'v2/public/symbols': 1,
                        'v1/market/depth': 1,
                        'v1/market/ticker/mini': 1,
                        'v1/market/trade': 1,
                        'v1/market/ticker/24hr': 1,
                        'v1/market/kline': 1,
                        'v1/market/deliveryExercise/history': 1,
                        'v1/market/fundingRate': 1,
                        'v1/market/fundingRate/history': 1,
                        'v1/public/baseRates': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/trade/openOrders': 1,
                        'v2/trade/order/info': 1,
                        'v2/history/orders': 1,
                        'v2/history/order/operations': 1,
                        'v2/history/trades': 1,
                        'v2/trade/openOrderComplex': 1,
                        'v2/history/orderComplexs': 1,
                        // RFQ (currenty not available)
                        'v1/blockRfq/counterparties': 1,
                        'v1/blockRfq/rfqs': 1,
                        'v1/blockRfq/quotes': 1,
                        'v1/blockRfq/trades': 1,
                        //
                        'v1/account/convert/exchangeInfo': 1,
                        'v1/account/convert/history/orders': 1,
                        'v2/trade/positions': 1,
                        'v1/trade/lever': 1,
                        'v1/account/balance': 1,
                        'v1/account/transferBalance': 1,
                        'v1/account/availableBalance': 1,
                        'v1/history/bill': 1,
                        'v1/account/interest/history': 1,
                        'v1/asset/account/info': 1,
                        'v1/asset/balances': 1,
                        'v1/asset/bill': 1,
                        'v1/asset/currencies': 1,
                        'v1/asset/deposit/address': 1,
                        'v1/asset/deposit/record': 1,
                        'v1/asset/withdrawal/address': 1,
                        'v1/asset/withdrawal/record': 1,
                        'v1/asset/transfer/history': 1,
                        'v1/asset/accountMembers': 1,
                        'v1/asset/crossTransfer/history': 1,
                        'v1/public/flexible/product': 1,
                        'v1/public/flexible/rateHistory': 1,
                        'v1/earn/flexible/records': 1,
                    },
                    'post': {
                        'v2/trade/order': 1,
                        'v2/trade/batchOrder': 1,
                        'v1/trade/cancelOrder': 1,
                        'v1/trade/batchCancelOrder': 1,
                        'v1/trade/cancelAllOrder': 1,
                        'v2/trade/orderComplex': 1,
                        'v1/trade/cancelComplex': 1,
                        'v1/trade/cancelAllOrderComplexs': 1,
                        // RFQ (currenty not available)
                        'v1/blockRfq/rfq': 1,
                        'v1/blockRfq/legPrices': 1,
                        'v1/blockRfq/cancelRfq': 1,
                        'v1/blockRfq/cancelAllRfqs': 1,
                        'v1/blockRfq/executeQuote': 1,
                        'v1/blockRfq/quote': 1,
                        'v1/blockRfq/editQuote': 1,
                        'v1/blockRfq/cancelQuote': 1,
                        'v1/blockRfq/cancelAllQuotes': 1,
                        //
                        'v1/account/convert/getQuote': 1,
                        'v1/account/convert/acceptQuote': 1,
                        //
                        'v1/trade/lever': 1,
                        'v2/trade/stopPosition': 1,
                        'v1/account/marginModeSet': 1,
                        'v1/asset/withdrawal': 1,
                        'v1/asset/transfer': 1,
                        'v1/asset/crossTransfer': 1,
                        'v1/earn/flexible/setFlexibleOnOff': 1,
                    },
                },
            },
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
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'options': {
                'fetchTickers': {
                    'method': 'publicGetV1MarketTicker24hr', // publicGetV1MarketTicker24hr, publicGetV1MarketTickerMini
                },
            },
            'features': {
                'spot': {
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
            },
        });
    }

    /**
     * @method
     * @name xcoin#fetchMarkets
     * @see https://xcoin.com/docs/coinApi/ticker/get-the-basic-information-of-trading-products
     * @description retrieves data on all markets for zonda
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV2PublicSymbols (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "businessType": "linear_perpetual",
        //                "symbol": "BTC-USDT-PERP",
        //                "symbolFamily": "BTC-USDT",
        //                "quoteCurrency": "USDT",
        //                "baseCurrency": "BTC",
        //                "settleCurrency": "USDT",
        //                "ctVal": "0.0001",
        //                "tickSize": "0.1",
        //                "status": "trading",
        //                "deliveryTime": null,
        //                "deliveryFeeRate": null,
        //                "pricePrecision": "1",
        //                "quantityPrecision": "4",
        //                "onlineTime": "1750127400000",
        //                "riskEngineRate": "0.02",
        //                "maxLeverage": "75.000000000000000000",
        //                "contractType": null,
        //                "orderParameters": {
        //                    "minOrderQty": "0.0001",
        //                    "minOrderAmt": null,
        //                    "maxOrderNum": "200",
        //                    "maxTriggerOrderNum": "30",
        //                    "maxTpslOrderNum": "30",
        //                    "maxLmtOrderAmt": null,
        //                    "maxMktOrderAmt": null,
        //                    "maxLmtOrderQty": "50",
        //                    "maxMktOrderQty": "1",
        //                    "basisLimitRatio": "0.1"
        //                },
        //                "priceParameters": {
        //                    "maxLmtPriceUp": "0.05",
        //                    "minLmtPriceDown": "0.05",
        //                    "maxMktPriceUp": "0.05",
        //                    "minMktPriceDown": "0.05"
        //                },
        //                "positionParameters": {
        //                    "positionRatioThreshold": "10000000",
        //                    "positionMaxRatio": "0.1",
        //                    "positionCidMaxRatio": "0.3",
        //                    "defaultLeverRatio": "10"
        //                },
        //                "group": [
        //                    "0.1",
        //                    "1",
        //                    "10",
        //                    "100"
        //                ]
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const result: Market[] = [];
        for (let i = 0; i < data.length; i++) {
            const market = this.parseMarket (data[i]);
            result.push (market);
        }
        return result;
    }

    parseMarket (item): Market {
        const id = this.safeString (item, 'symbol');
        const baseId = this.safeString (item, 'baseCurrency');
        const quoteId = this.safeString (item, 'quoteCurrency');
        const settleId = this.safeString (item, 'settleCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const businessType = this.safeString (item, 'businessType');
        let marketType = undefined;
        let symbol = base + '/' + quote;
        let subType = undefined;
        if (businessType === 'spot') {
            marketType = 'spot';
        } else if (businessType === 'linear_perpetual') {
            marketType = 'swap';
            subType = 'linear';
            symbol = symbol + ':' + settle;
        }
        const expiry = this.safeInteger (item, 'deliveryTime');
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'spot',
            'spot': (marketType === 'spot'),
            'margin': false,
            'swap': (marketType === 'swap'),
            'future': false,
            'option': false,
            'active': (this.safeString (item, 'status') === 'trading'),
            'contract': (marketType === 'swap'),
            'linear': (subType === 'linear') ? true : undefined,
            'inverse': (subType === 'linear') ? false : undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': this.safeNumber (item, 'ctVal'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'optionType': undefined,
            'strike': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (item, 'quantityPrecision'))),
                'price': this.safeNumber (item, 'tickSize'), // strange, but pricePrecision is different
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeInteger (item, 'maxLeverage'),
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
            'created': this.safeInteger (item, 'onlineTime'),
            'info': item,
        };
    }

    /**
     * @method
     * @name xcoin#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://xcoin.com/docs/coinApi/ticker/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetV1MarketTime (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": {
        //            "time": "1761576724320"
        //        },
        //        "ts": "1761576724320"
        //    }
        //
        const data = this.safeDict (response, 'data', {});
        return this.safeInteger (data, 'time');
    }

    /**
     * @method
     * @name xcoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://xcoin.com/docs/coinApi/ticker/get-order-book-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request: Dict = {
            'symbol': id,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketDepth (this.extend (request, params));
        //
        //  {
        //     "code": "0",
        //     "msg":"success",
        //     "data": {
        //       "bids": [
        //         ["65000","0.1"],
        //         ["65001","0.1"],
        //       ],
        //       "asks": [
        //         ["65003","0.1"],
        //         ["65004","0.1"],
        //       ]
        //     },
        //     "lastUpdateId": "5001"
        //    },
        //    "ts": "1732158178000"
        //  }
        //
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (response, 'ts');
        return this.parseOrderBook (data, market['symbol'], timestamp);
    }

    /**
     * @method
     * @name xcoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://xcoin.com/docs/coinApi/ticker/get-24-hour-ticker-data
     * @see https://xcoin.com/docs/coinApi/ticker/get-latest-ticker-information
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbols !== undefined) {
            const symbol = this.safeString (symbols, 0);
            market = this.market (symbol);
            const marketIds = this.marketIds (symbols);
            request['symbol'] = marketIds.join (',');
        }
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        request['businessType'] = (marketType === 'spot') ? 'spot' : 'linear_perpetual';
        let response = undefined;
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'fetchTickers', 'method', 'publicGetV1MarketTicker24hr'); // publicGetV1MarketTicker24hr, publicGetV1MarketTickerMini
        if (method === 'publicGetV1MarketTickerMini') {
            response = await this.publicGetV1MarketTickerMini (this.extend (request, params));
        } else {
            response = await this.publicGetV1MarketTicker24hr (this.extend (request, params));
        }
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "businessType": "spot",
        //                "symbol": "ENA-USDT",
        //                "priceChange": "0.0087",
        //                "priceChangePercent": "0.017661388550548112",
        //                "lastPrice": "0.5013",
        //                "openPrice": "0.4926",
        //                "highPrice": "0.5344",
        //                "lowPrice": "0.4926",
        //                "fillQty": "1694436.24",
        //                "fillAmount": "868188.786879",
        //                "count": "14804",
        //                "baseCurrency": "ENA",
        //                "indexPrice": "0.5014",
        //                "markPrice": "0",
        //                "fundingRate": "0",
        //                "toNextFundRateTime": "0"
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'openPrice'),
            'close': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'fillAmount'),
            'quoteVolume': this.safeString (ticker, 'fillQty'),
            'mark': this.safeString (ticker, 'markPrice'),
            'index': this.safeString (ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name xcoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://xcoin.com/docs/coinApi/ticker/get-recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketTrade (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "id": "1121384806",
        //                "symbol": "BTC-USDT-PERP",
        //                "side": "buy",
        //                "price": "115560.1",
        //                "qty": "0.0006",
        //                "time": "1761584074207"
        //            },
        //         ],
        //        "ts": "1761584074208"
        //    }
        //
        const trades = this.safeList (response, 'data', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //            {
        //                "id": "1121384806",
        //                "symbol": "BTC-USDT-PERP",
        //                "side": "buy",
        //                "price": "115560.1",
        //                "qty": "0.0006",
        //                "time": "1761584074207"
        //            },
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'time');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'takerOrMaker': undefined,
            'side': this.safeString (trade, 'side'),
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'qty'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name xcoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://xcoin.com/docs/coinApi/ticker/get-kline-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'period': this.safeString (this.timeframes, timeframe, timeframe),
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit; // max 200, default 200
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const response = await this.publicGetV1MarketKline (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            [
        //                "1h",
        //                "1761588000000",
        //                "1761588972388",
        //                "115647.3",
        //                "115674.9",
        //                "115742",
        //                "115493.4",
        //                "254.0191",
        //                "29372081.25293",
        //                "1228",
        //                "27.6",
        //                "0.000238656674215481"
        //            ],
        //        ],
        //        "ts": "1761588974866"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 1),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 5),
            this.safeNumber (ohlcv, 6),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 7),
        ];
    }

    /**
     * @method
     * @name xcoin#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://xcoin.com/docs/coinApi/ticker/get-current-funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    async fetchFundingRates (symbols: Strings = undefined, params = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV1MarketFundingRate (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "symbol": "TRUMP-USDT-PERP",
        //                "fundingRate": "-0.000146",
        //                "fundingTime": "1761638400000",
        //                "fundingInterval": "8",
        //                "upperFundingRate": "0.03",
        //                "lowerFundingRate": "-0.03"
        //            },
        //        ],
        //        "ts": "1761627696000"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRates (data, symbols);
    }

    parseFundingRate (contract, market: Market = undefined): FundingRate {
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const fundingRate = this.safeNumber (contract, 'fundingRate');
        const nextFundingRateTimestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': this.safeNumber (contract, 'markPrice'),
            'indexPrice': this.safeNumber (contract, 'indexPrice'),
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'previousFundingRate': undefined,
            'nextFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'nextFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'nextFundingDatetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': nextFundingRateTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingRateTimestamp),
            'interval': undefined,
        } as FundingRate;
    }

    /**
     * @method
     * @name xcoin#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://xcoin.com/docs/coinApi/ticker/get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchFundingRateHistory', symbol, since, limit, '8h', params) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV1MarketFundingRateHistory (this.extend (request, params));
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "fundingRate": "0.000062171216727901",
        //                "fundingTime": "1761609600000",
        //                "markPrice": "114056.3"
        //            },
        //        ],
        //        "ts": "1761627696000"
        //    }
        //
        return this.parseFundingRateHistories (response, market, since, limit) as FundingRateHistory[];
    }

    parseFundingRateHistory (contract, market: Market = undefined) {
        const marketId = this.safeString (contract, 'symbol');
        const timestamp = this.safeInteger (contract, 'fundingTime');
        return {
            'info': contract,
            'symbol': this.safeSymbol (marketId, market),
            'fundingRate': this.safeNumber (contract, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        return undefined;
    }
}
