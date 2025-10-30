
//  ---------------------------------------------------------------------------

import Exchange from './abstract/xcoin.js';
import { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError, OrderNotFound, AccountSuspended, BadSymbol, OrderImmediatelyFillable, RateLimitExceeded, OnMaintenance, PermissionDenied, BadRequest, ArgumentsRequired, NotSupported } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Dict, int, LedgerEntry, DepositAddress, CrossBorrowRates, FundingRates, FundingRate, FundingRateHistory, Currencies, Account, BorrowInterest, Position, Leverage, MarginMode, OrderRequest } from './base/types.js';

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
                'fetchCurrencies': true,
                'fetchTime': true,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTrades': true,
                'fetchOHLCV': true,
                'fetchFundingRates': true,
                'fetchFundingRateHistory': true,
                'fetchCrossBorrowRates': true,
                'fetchBorrowInterest': true,
                'fetchBalance': true,
                'fetchLedger': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchPositions': true,
                'setLeverage': true,
                'fetchLeverage': true,
                'setMarginMode': true,
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
                        'v1/asset/account/info': 1, // todo: fetchAccount new method
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
                'fetchBalance': {
                    'defaultAccount': 'trading', // trading, fund
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
            'contractSize': this.safeNumberOmitZero (item, 'ctVal'),
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
     * @name xcoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://xcoin.com/docs/coinApi/funding-account/get-currency-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        // private endpoint
        if (!this.checkRequiredCredentials (false)) {
            return {};
        }
        const response = await this.privateGetV1AssetCurrencies (params);
        //
        //    {
        //        "code": "0",
        //        "data": [
        //            {
        //                "accountName": "test123",
        //                "pid": "1981204053820035072",
        //                "uid": "176118985582700",
        //                "cid": "176118985590600",
        //                "currency": "SOL",
        //                "name": "Solana",
        //                "icon": "https://static.xcoin.com/1932683099083247616",
        //                "traderAuth": true,
        //                "depositAuth": true,
        //                "withdrawAuth": true,
        //                "haircut": "",
        //                "currencyPrecision": "8",
        //                "maxLeverage": "",
        //                "chains": [
        //                    {
        //                        "chainType": "sol",
        //                        "minDep": "0.00099",
        //                        "minWd": "0.11",
        //                        "maxWd": "10000",
        //                        "withdrawFee": "0.001",
        //                        "depositAuth": true,
        //                        "withdrawAuth": true
        //                    }
        //                ]
        //            }
        //        ],
        //        "msg": "Success",
        //        "ts": "1761644584108",
        //        "traceId": "7cd27fb2914b9eb97f733a745807bb6b"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const currencyId = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const networks: Dict = {};
            const chains = currency['chains'];
            const chainsLength = chains.length;
            for (let j = 0; j < chainsLength; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chainType');
                const networkCode = this.networkIdToCode (networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'active': undefined,
                    'deposit': this.safeBool (chain, 'depositAuth'),
                    'withdraw': this.safeBool (chain, 'withdrawAuth'),
                    'fee': this.safeNumber (chain, 'withdrawFee'),
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (chain, 'minWd'),
                            'max': this.safeNumber (chain, 'maxWd'),
                        },
                        'deposit': {
                            'min': this.safeNumber (chain, 'minDep'),
                            'max': undefined,
                        },
                    },
                    'info': chain,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'info': chains,
                'code': code,
                'id': currencyId,
                'name': this.safeString (currency, 'name'),
                'active': undefined,
                'deposit': this.safeBool (currency, 'depositAuth'),
                'withdraw': this.safeBool (currency, 'withdrawAuth'),
                'fee': undefined,
                'precision': this.parseNumber (this.parsePrecision (this.safeString (currency, 'currencyPrecision'))),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'type': undefined, // atm only crypto
                'networks': networks,
            });
        }
        return result;
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
        //       {
        //           "id": "1121384806",
        //           "symbol": "BTC-USDT-PERP",
        //           "side": "buy",
        //           "price": "115560.1",
        //           "qty": "0.0006",
        //           "time": "1761584074207"
        //       },
        //
        // fetchOrderTrades
        //
        //       {
        //         "orderId": "1308916158820376576",
        //         "operationType": "create_order",
        //         "price": "93000",
        //         "qty": "0.1",
        //         "createTime": "1732158178000",
        //         "accountName": "hongliang01",
        //         "pid": "1917239173600325633",
        //         "cid": "174594041187401",
        //         "uid": "174594041178400"
        //       }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (trade, 'time', 'createTime');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString2 (trade, 'id', 'orderId'),
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
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
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
        const data = this.safeList (response, 'data', []);
        return this.parseFundingRateHistories (data, market, since, limit) as FundingRateHistory[];
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

    /**
     * @method
     * @name xcoin#fetchCrossBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://xcoin.com/docs/coinApi/ticker/get-margin-interest-rates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchCrossBorrowRates (params = {}): Promise<CrossBorrowRates> {
        await this.loadMarkets ();
        const response = await this.publicGetV1PublicBaseRates (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "currency": "USDT",
        //                "borrowed": "1030.197645707887976309",
        //                "remainingQuota": "279325.425680997126775253",
        //                "rate": "0.04158911"
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            rates.push (this.parseBorrowRate (data[i]));
        }
        return rates as any;
    }

    parseBorrowRate (info, currency: Currency = undefined) {
        const timestamp = this.safeInteger (info, 'ts');
        return {
            'currency': this.safeCurrencyCode (this.safeString (info, 'currency')),
            'rate': this.safeNumber (info, 'rate'),
            'period': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    /**
     * @method
     * @name xcoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://xcoin.com/docs/coinApi/funding-account/get-funding-account-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let defaultAccount = undefined;
        [ defaultAccount, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'defaultAccount');
        let response = undefined;
        if (defaultAccount === 'funding') {
            response = await this.privateGetV1AssetBalances (params);
            //
            //    {
            //        "code": "0",
            //        "data": [
            //            {
            //                "accountName": "test123",
            //                "pid": "1981204053820035072",
            //                "uid": "176118985582700",
            //                "cid": "176118985590600",
            //                "currency": "USDT",
            //                "accountType": "funding",
            //                "balance": "100",
            //                "freeze": "0",
            //                "equity": "100",
            //                "withdrawAble": "100"
            //            }
            //        ],
            //        "msg": "Success",
            //        "ts": "1761655079854",
            //        "traceId": "671ca9e68d04f29edb756d25917b2d49"
            //    }
            //
        } else {
            response = await this.privateGetV1AccountBalance (params);
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "accountName": "hongliang03",
            //         "totalEquity": "19392.506484534215473559",
            //         "totalMarginBalance": "17635.572422907886172353",
            //         "totalAvailableBalance": "16060.954948108649117299",
            //         "totalEffectiveMargin": "17635.572422907886172353",
            //         "totalPositionValue": "15746.174747992370550548",
            //         "totalIm": "1574.617474799237055054",
            //         "totalMm": "787.308737399618527527",
            //         "totalOpenLoss": "0",
            //         "mmr": "0.04464322",
            //         "imr": "0.08928644",
            //         "accountLeverage": "0.8928644",
            //         "totalUpl": "0",
            //         "flexibleEquity": "35138.6812325265860241072",
            //         "flexiblePnl": "1.7207679725053541062",
            //         "autoSubscribe": false,
            //         "details": [
            //             {
            //                 "currency": "USDT",
            //                 "equity": "-15746.174747992370550548",
            //                 "totalBalance": "0",
            //                 "cashBalance": "0",
            //                 "savingBalance": "0",
            //                 "leftPersonalQuota": null,
            //                 "savingTotalPnl": null,
            //                 "savingLastPnl": null,
            //                 "savingHoldDays": null,
            //                 "savingTotalAPR": "0.000781530000000000",
            //                 "savingLastAPR": null,
            //                 "borrow": "15746.174747992370550548",
            //                 "realLiability": "15746.174747992370550548",
            //                 "potentialLiability": "15746.174747992370550548",
            //                 "accruedInterest": "0.000100528919329999",
            //                 "upl": "0",
            //                 "positionInitialMargin": null,
            //                 "orderInitialMargin": null,
            //                 "liabilityInitialMargin": "1574.617474799237055054",
            //                 "initialMargin": "1574.617474799237055054"
            //             },
            //         ],
            //         "pid": "1917181551846567937",
            //         "cid": "174575858798300",
            //         "uid": "174575858790600"
            //     },
            //     "ts": "1746844510052"
            // }
            //
        }
        return this.parseBalance (response);
    }

    parseBalance (response): Balances {
        const timestamp = this.safeInteger (response, 'ts');
        const result: Dict = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
        const balances = this.safeList (response, 'data', []);
        for (let i = 0; i < balances.length; i++) {
            const balanceRaw = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balanceRaw, 'currency'));
            const account = this.account ();
            account['total'] = this.safeString (balanceRaw, 'totalBalance');
            account['free'] = this.safeString (balanceRaw, 'balance');
            account['used'] = this.safeString (balanceRaw, 'freeze');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name xcoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://xcoin.com/docs/coinApi/funding-account/get-funding-account-transaction-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined, max is 2500
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchLedger', code, since, limit, params, 100) as LedgerEntry[];
        }
        let currency = undefined;
        let request: Dict = {};
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        let defaultAccount = undefined;
        [ defaultAccount, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'defaultAccount');
        let response = undefined;
        if (defaultAccount === 'funding') {
            response = await this.privateGetV1AssetBill (this.extend (request, params));
            //
            //     {
            //         "code": 0,
            //         "data": [
            //             {
            //                 "accountName": "hongliang01",
            //                 "accountType": "funding",
            //                 "amount": "-112",
            //                 "balance": "499764779.013",
            //                 "billId": "1918143117886697473",
            //                 "cid": "174575858798300",
            //                 "createTime": "1746098331000",
            //                 "currency": "USDT",
            //                 "id": "1918143117886697473",
            //                 "pid": "1916476554095833090",
            //                 "transactionId": "1918143117610061824",
            //                 "uid": "174575858790600",
            //                 "actionType": "21",
            //                 "updateTime": "1746098331000"
            //             },
            //         ],
            //         "msg":"success",
            //         "ts": 1747824336306
            //     }
            //
        } else {
            response = await this.privateGetV1HistoryBill (this.extend (request, params));
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": [
            //         {
            //             "accountName": "1915030377665978370",
            //             "id": "6755399451247615",
            //             "businessType": "none",
            //             "symbol": "",
            //             "actionType": "3",
            //             "currency": "BTC",
            //             "qty": "0.000000045812491",
            //             "actionId": "6755399451247615",
            //             "transactionId": "1371472019211829250",
            //             "tradeId": "0",
            //             "lever": "0",
            //             "side": null,
            //             "createTime": "1747026010146",
            //             "pid": "1915030377665978370",
            //             "cid": "174541379399500",
            //             "uid": "174541379390800"
            //         },
            //     ],
            //     "ts": "1747030934883"
            // }
            //
        }
        const data = this.safeList (response, 'data', []);
        return this.parseLedger (data, currency, since, limit);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        const currencyId = this.safeString (item, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const timestamp = this.safeInteger (item, 'updateTime');
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': undefined,
            'account': undefined,
            'referenceId': this.safeString (item, 'transactionId'),
            'referenceAccount': undefined,
            'type': undefined,
            'currency': currency['code'],
            'amount': this.safeNumber2 (item, 'amount', 'qty'),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (typeId: string): string {
        const ledgerTypes: Dict = {
            '1': 'transfer',
            '2': 'transfer',
            '3': 'borrow',
            '4': 'repayment',
            '5': 'trade',
            '6': 'trade',
            '7': 'trade',
            '8': 'trade',
            '9': 'repayment',
            '10': 'repayment',
            '11': 'repayment',
            '12': 'repayment',
            // 13 Forced swap outgoing amount
            // 14 Forced swap incoming amount
            '15': 'fee',
            '16': 'interest',
            '17': 'realized_pnl',
            '18': 'funding',
            '19': 'liquidation',
            '20': 'liquidation',
            '21': 'deposit',
            '22': 'withdrawal',
            '23': 'transfer',
            '24': 'transfer',
            '25': 'transfer',
            '26': 'transfer',
            // 27 Flexible products subscription
            // 28 Flexible products redemption
            '29': 'interest',
            '30': 'fee',
            '31': 'airdrop',
            '32': 'rebate',
            '33': 'other',
            '34': 'bonus',
            '35': 'trial_fund',
            '36': 'compensation',
            '37': 'gas_fee',
            '38': 'failed_recharge_credited',
            '99': 'other',
        };
        return this.safeString (ledgerTypes, typeId, typeId);
    }

    /**
     * @method
     * @name xcoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://xcoin.com/docs/coinApi/funding-account/deposit/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'currency': currency['id'],
        };
        let networkCode = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress(): params["network"] is required.');
        }
        const response = await this.privateGetV1AssetDepositAddress (this.extend (request, params));
        //
        // {
        //     "code": 0,
        //     "data": {
        //         "accountName": "hl04",
        //         "addressDeposit": "rsQbUpy1cfGdetwqabbJ8asKXeoY1G3h1N",
        //         "chainType": "XRP",
        //         "cid": "174575859872200",
        //         "currency": "XRP",
        //         "memo": "401145838",
        //         "pid": "1916476600090570754",
        //         "uid": "174575859864400"
        //     },
        //     "msg":"success",
        //     "ts": 1747824336306
        // }
        //
        return this.parseDepositAddress (response, currency);
    }

    parseDepositAddress (depositEntry, currency: Currency = undefined): DepositAddress {
        const currencyId = this.safeString (depositEntry, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        return {
            'info': depositEntry,
            'currency': currency['code'],
            'network': this.networkIdToCode (this.safeString (depositEntry, 'chainType')),
            'address': this.safeString (depositEntry, 'addressDeposit'),
            'tag': this.safeString (depositEntry, 'memo'),
        } as DepositAddress;
    }

    /**
     * @method
     * @name xcoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://xcoin.com/docs/coinApi/funding-account/deposit/get-deposit-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        return await this.fetchTransactionsHelper ('INCOMING', code, since, limit, params);
    }

    async fetchTransactionsHelper (type, code, since, limit, params) {
        await this.loadMarkets ();
        let currency = undefined;
        const request: Dict = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        const response = await this.privateGetV1AssetDepositRecord (this.extend (request, params));
        //
        //     {
        //         "code": 0,
        //         "data": [
        //            {
        //                 "accountName": "hl04",
        //                 "amount": "24381.9837",
        //                 "chainType": "eth",
        //                 "cid": "174575859872200",
        //                 "createTime": "1747818768080",
        //                 "currency": "USDT",
        //                 "depositFee": "",
        //                 "depositId": "1925117560689778690",
        //                 "fromAddress": "0xe76eccc60b21fd89b27c253796a4d2358f0fa989",
        //                 "hash": "0x56413470ed7dcb33ed377566055701c7e0e48da7e831974d5c14e370316e1c8c",
        //                 "memo": "",
        //                 "pid": "1916476600090570754",
        //                 "status": "success",
        //                 "toAddress": "0x432960397a1175e4c1100b0e4beb4a7562769d7a",
        //                 "uid": "174575859864400",
        //                 "updateTime": "1747823275000"
        //             }
        //         ],
        //         "msg":"success",
        //         "ts": 1747824336306
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit, params);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        // deposit
        //
        //            {
        //                 "accountName": "hl04",
        //                 "amount": "24381.9837",
        //                 "chainType": "eth",
        //                 "cid": "174575859872200",
        //                 "createTime": "1747818768080",
        //                 "currency": "USDT",
        //                 "depositFee": "",
        //                 "depositId": "1925117560689778690",
        //                 "fromAddress": "0xe76eccc60b21fd89b27c253796a4d2358f0fa989",
        //                 "hash": "0x56413470ed7dcb33ed377566055701c7e0e48da7e831974d5c14e370316e1c8c",
        //                 "memo": "",
        //                 "pid": "1916476600090570754",
        //                 "status": "success",
        //                 "toAddress": "0x432960397a1175e4c1100b0e4beb4a7562769d7a",
        //                 "uid": "174575859864400",
        //                 "updateTime": "1747823275000"
        //             }
        //
        let depositOrWithdrawal: Str = undefined;
        if ('depositId' in transaction) {
            depositOrWithdrawal = 'deposit';
        } else if ('withdraw_id' in transaction) {
            depositOrWithdrawal = 'withdrawal';
        }
        const timestamp = this.safeInteger (transaction, 'createTime');
        const currencyId = this.safeString (transaction, 'currency');
        currency = this.safeCurrency (currencyId, currency);
        const depositFee = this.safeNumber (transaction, 'depositFee');
        let fee = undefined;
        if (depositFee !== undefined) {
            fee = {
                'cost': depositFee,
                'currency': currency['code'],
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'depositId'),
            'currency': currency['code'],
            'amount': this.safeNumber (transaction, 'amount'),
            'network': this.networkIdToCode (this.safeString (transaction, 'chainType')),
            'address': undefined,
            'addressFrom': this.safeString (transaction, 'fromAddress'),
            'addressTo': this.safeString (transaction, 'toAddress'),
            'tag': this.safeString (transaction, 'memo'),
            'tagFrom': undefined,
            'tagTo': undefined,
            'status': this.parseTransactionStatus (this.safeString (transaction, 'status')),
            'type': depositOrWithdrawal,
            'updated': undefined,
            'txid': this.safeString (transaction, 'hash'),
            'internal': undefined,
            'comment': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': fee,
        } as Transaction;
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'success': 'ok',
            'toBeVerified': 'pending',
            'fail': 'failed',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name xcoin#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://xcoin.com/docs/coinApi/trading-account-information/asset-information/get-borrowing-interest-history
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the borrow interest in a portfolio margin account
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    async fetchBorrowInterest (code: Str = undefined, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<BorrowInterest[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV1AccountInterestHistory (this.extend (request, params));
        //
        // {
        //     {
        //         "code": "0",
        //         "msg":"success",
        //         "data": [
        //             {
        //                 "id": 1232343213,
        //                 "currency": "BTC",
        //                 "interestTime": "1747206121000",
        //                 "interest": "-0.00000129972997738",
        //                 "interestRate": "0.01138529",
        //                 "interestBearingBorrowSize": "0",
        //                 "borrowAmount": "1.000030267288672843",
        //                 "freeBorrowedAmount": "0",
        //                 "accountName": "hongliang01",
        //                 "pid": "1917239173600325633",
        //                 "cid": "174594041187401",
        //                 "uid": "174594041178400"
        //             },
        //     ],
        //         "ts": "1747207316831"
        // }
        //
        const data = this.safeList (response, 'data', []);
        const interest = this.parseBorrowInterests (data, undefined);
        return this.filterByCurrencySinceLimit (interest, code, since, limit);
    }

    parseBorrowInterest (info: Dict, market: Market = undefined): BorrowInterest {
        const timestamp = this.safeInteger (info, 'interestTime');
        return {
            'info': info,
            'symbol': undefined,
            'currency': this.safeCurrencyCode (this.safeString (info, 'data')),
            'interest': this.safeNumber (info, 'interest'),
            'interestRate': this.safeNumber (info, 'interestRate'),
            'amountBorrowed': this.safeNumber (info, 'borrowAmount'),
            'marginMode': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        } as BorrowInterest;
    }

    /**
     * @method
     * @name xcoin#fetchPositions
     * @description fetch all open positions
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/get-trading-account-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.privateGetV2TradePositions (params);
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //         {
        //             "accountName": "hongliang02",
        //             "positionId": "15762598695810131",
        //             "businessType": "linear_perpetual",
        //             "symbol": "BTC-USDT-PERP",
        //             "positionQty": "-2",
        //             "avgPrice": "93921.6",
        //             "takeProfit": "96000",
        //             "stopLoss": "85000",
        //             "upl": "0.662",
        //             "lever": 1,
        //             "liquidationPrice": "1400633.1709273944765165",
        //             "markPrice": "93888.5",
        //             "im": "1877.77",
        //             "indexPrice": "93877.2",
        //             "createTime": 1746532093181,
        //             "updateTime": 1746532093181,
        //             "pid": "1917181674366382082",
        //             "cid": "174575858798300",
        //             "uid": "174575858790600"
        //         }
        //     ],
        //     "ts": "1746533365670"
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parsePositions (data, symbols);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (position, 'createTime');
        const quantity = this.safeString (position, 'positionQty');
        let side: Str = undefined;
        if (quantity !== undefined) {
            side = Precise.stringGe (quantity, '0') ? 'long' : 'short';
        }
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'positionId'),
            'symbol': symbol,
            'entryPrice': this.safeString (position, 'avgPrice'),
            'markPrice': this.safeString (position, 'markPrice'),
            'indexPrice': this.safeString (position, 'indexPrice'),
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': this.safeString (position, 'upl'),
            'side': side,
            'contracts': Precise.stringAbs (quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeString (position, 'im'),
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber (position, 'lever'),
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name xcoin#setLeverage
     * @description set the level of leverage for a market
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/set-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage (leverage: int, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'leverage': leverage,
        };
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privatePostV1TradeLever (this.extend (request, params));
        //
        // {
        //     "accountName": "hongliang01",
        //     "currency": "BTC",
        //     "lever": 3
        // }
        //
        return response;
    }

    /**
     * @method
     * @name xcoin#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/get-current-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        await this.loadMarkets ();
        const request: Dict = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetV1TradeLever (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": {
        //         "accountName": "hongliang01",
        //         "symbol": "",
        //         "currency": "BTC",
        //         "lever": 10,
        //         "pid": "1916476472910884866",
        //         "cid": "174575857047300",
        //         "uid": "174575857039400"
        //     },
        //     "ts": "1745927621737"
        // }
        //
        return this.parseLeverage (response, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        const marketId = this.safeString (leverage, 'symbol');
        return {
            'info': leverage,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': undefined,
            'longLeverage': this.safeInteger (leverage, 'lever'),
            'shortLeverage': this.safeInteger (leverage, 'lever'),
        } as Leverage;
    }

    /**
     * @method
     * @name xcoin#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://xcoin.com/docs/coinApi/trading-account-information/position-information/set-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setMarginMode (marginMode: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const modes = {
            'cross': 'multi_currency',
        };
        const request = {
            'marginMode': this.safeString (modes, marginMode, marginMode),
        };
        const response = await this.privatePostV1AccountMarginModeSet (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg": "success",
        //     "data": {
        //         "accountName": "1915650018593001474",
        //         "accountMode": "multi_currency"
        //     },
        //     "ts": "1760422532889"
        // }
        //
        return this.parseMarginMode (response, undefined) as any;
    }

    parseMarginMode (marginMode: Dict, market = undefined): MarginMode {
        const marketId = this.safeString (marginMode, 'symbol');
        const marginType = this.safeString (marginMode, 'accountMode');
        const margin = (marginType === 'multi_currency') ? 'cross' : marginType;
        return {
            'info': marginMode,
            'symbol': this.safeSymbol (marketId, market),
            'marginMode': margin,
        } as MarginMode;
    }

    /**
     * @method
     * @name xcoin#createOrder
     * @description create a trade order
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.reduceOnly] a mark to reduce the position size for margin, swap and future orders
     * @param {bool} [params.postOnly] true to place a post only order
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
     * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
     * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
     * @param {string} [params.positionSide] if position mode is one-way: set to 'net', if position mode is hedge-mode: set to 'long' or 'short'
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.tpOrdKind] 'condition' or 'limit', the default is 'condition'
     * @param {bool} [params.hedged] *swap and future only* true for hedged mode, false for one way mode
     * @param {string} [params.marginMode] 'cross' or 'isolated', the default is 'cross'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isTrigger = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice' ]) !== undefined;
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (isTrigger) {
            response = await this.privatePostV2TradeOrderComplex (request);
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "accountName": "hongliang01",
            //         "complexOId": "1369970333708804096",
            //         "complexClOrdId": "66"
            //     },
            //     "ts": "1746667980576"
            // }
            //
        } else {
            response = await this.privatePostV2TradeOrder (request);
            //
            // {
            //     "code": "0",
            //     "msg":"success",
            //     "data": {
            //         "orderId": "1322590062927904769"
            //     },
            //     "ts": "1732158178000"
            // }
            //
        }
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name xcoin#createOrders
     * @description create a list of trade orders
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/place-batch-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrders (orders: OrderRequest[], params = {}) {
        await this.loadMarkets ();
        for (let i = 0; i < orders.length; i++) {
            if (this.safeNumber2 (orders[i]['params'], 'triggerPrice', 'stopPrice') !== undefined) {
                throw new NotSupported (this.id + ' createOrders() does not support conditional orders');
            }
        }
        const ordersRequests = this.createOrdersRequest (orders);
        const response = await this.privatePostV2TradeBatchOrder (ordersRequests);
        return this.parseOrders (response);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toLowerCase (),
            'qty': this.amountToPrecision (symbol, amount),
            // 'marketUnit': todo
        };
        const cost = this.safeNumber (params, 'cost');
        if (cost !== undefined) {
            request['marketUnit'] = 'quote_currency';
        }
        const isMarketOrder = type === 'market';
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, type === 'post_only', params);
        if (postOnly) {
            request['orderType'] = 'post_only';
        } else {
            request['orderType'] = type;
        }
        const timeInForce = this.safeString (params, 'timeInForce', 'GTC');
        if (timeInForce !== 'GTC' && !postOnly) {
            request['timeInForce'] = timeInForce.toLowerCase ();
        }
        const isReduceOnly = this.safeBool (params, 'reduceOnly');
        if (!market['spot'] || isReduceOnly) {
            request['reduceOnly'] = true;
        }
        const triggerPriceTypes = {
            'last': 'last_price',
            'index': 'index_price',
            'mark': 'mark_price',
        };
        // trigger
        const triggerPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice' ]);
        const takeProfitPrice = this.safeNumber (params, 'takeProfitPrice');
        const stopLossPrice = this.safeNumber (params, 'stopLossPrice');
        const isConditional = (triggerPrice !== undefined) || (takeProfitPrice !== undefined) || (stopLossPrice !== undefined);
        const conditionalPrice = this.safeNumberN (params, [ 'triggerPrice', 'stopPrice', 'takeProfitPrice', 'stopLossPrice' ]);
        const stopLoss = this.safeDict (params, 'stopLoss');
        const stopLossDefined = (stopLoss !== undefined);
        const takeProfit = this.safeDict (params, 'takeProfit');
        const takeProfitDefined = (takeProfit !== undefined);
        if (stopLossDefined || takeProfitDefined) {
            const tpslOrder: Dict = {};
            // stop-loss
            if (stopLossDefined) {
                tpslOrder['stopLoss'] = this.safeNumber (stopLoss, 'triggerPrice');
                const triggerPriceTypeSl = this.safeString (stopLoss, 'triggerPriceType');
                if (triggerPriceTypeSl !== undefined) {
                    tpslOrder['stopLossType'] = this.safeString (triggerPriceTypes, triggerPriceTypeSl);
                }
                const limitPriceSl = this.safeNumber (stopLoss, 'price');
                if (limitPriceSl !== undefined) {
                    tpslOrder['slOrderType'] = 'limit';
                    tpslOrder['slLimitPrice'] = this.priceToPrecision (symbol, limitPriceSl);
                }
            }
            // take-profit
            if (takeProfitDefined) {
                tpslOrder['takeProfit'] = this.safeNumber (takeProfit, 'triggerPrice');
                const triggerPriceTypeTp = this.safeString (takeProfit, 'triggerPriceType');
                if (triggerPriceTypeTp !== undefined) {
                    tpslOrder['takeProfitType'] = this.safeString (triggerPriceTypes, triggerPriceTypeTp);
                }
                const limitPriceTp = this.safeNumber (takeProfit, 'price');
                if (limitPriceTp !== undefined) {
                    tpslOrder['tpOrderType'] = 'limit';
                    tpslOrder['tpLimitPrice'] = this.priceToPrecision (symbol, limitPriceTp);
                }
            }
            request['tpslOrder'] = tpslOrder;
        }
        // trigger order
        if (isConditional) {
            request['complexType'] = 'trigger';
            const directionMap = {
                'ascending': 'rising',
                'descending': 'falling',
            };
            const triggerOrder = {};
            const triggerPriceType = this.safeString (params, 'triggerPriceType');
            if (triggerPriceType !== undefined) {
                triggerOrder['triggerPriceType'] = this.safeString (triggerPriceTypes, triggerPriceType);
            }
            const triggerDirection = this.safeString (params, 'triggerDirection');
            if (triggerPrice !== undefined) {
                if (triggerDirection === undefined) {
                    throw new ArgumentsRequired (this.id + ' createOrder() requires a "triggerDirection" parameter for trigger orders');
                }
                triggerOrder['triggerDirection'] = this.safeString (directionMap, triggerDirection);
            } else {
                if (stopLossPrice !== undefined) {
                    triggerOrder['triggerDirection'] = (side === 'buy') ? 'falling' : 'rising';
                } else if (takeProfitPrice !== undefined) {
                    triggerOrder['triggerDirection'] = (side === 'buy') ? 'rising' : 'falling';
                }
            }
            request['triggerPrice'] = this.priceToPrecision (symbol, conditionalPrice);
            if (type === 'limit') {
                request['triggerOrderPrice'] = this.priceToPrecision (symbol, price);
            }
        } else {
            if (type === 'limit') {
                request['price'] = this.priceToPrecision (symbol, price);
            }
        }
        return this.extend (request, params);
    }

    /**
     * @method
     * @name xcoin#cancelOrder
     * @description cancels an open order
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privatePostV1TradeCancelOrder (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": {
        //         "orderId": "1322590062927904769"
        //     },
        //     "ts": "1732158178000"
        // }
        //
        const data = this.safeDict (response, 'data');
        return this.parseOrder (data, this.marketOrNull (symbol));
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // cancelOrder
        //
        //     regular
        //
        //     {
        //         "orderId": "1322590062927904769"
        //     }
        //
        //     trigger
        //
        //     {
        //         "accountName": "hongliang01",
        //         "complexOId": "1369970333708804096",
        //         "complexClOrdId": "66"
        //     }
        //
        // fetchOpenOrders
        //
        //         {
        //             "accountName": "hongliang02",
        //             "businessType": "linear_perpetual",
        //             "symbol": "ETH-USDT-PERP",
        //             "orderId": "1369615474164670464",
        //             "clientOrderId": "1369615474164670464",
        //             "price": "1800",
        //             "qty": "100",
        //             "pnl": "",
        //             "orderType": "limit",
        //             "side": "buy",
        //             "totalFillQty": "50",
        //             "avgPrice": "1800",
        //             "status": "partially_filled",
        //             "lever": 1,
        //             "baseFee": "",
        //             "quoteFee": "-0.45",
        //             "uid": "174594041178400",
        //             "source": "web",
        //             "category": "normal",
        //             "reduceOnly": false,
        //             "timeInForce": "gtc",
        //             "createTime": 1746583375274,
        //             "updateTime": 1746584491397,
        //             "eventId": "1",
        //             "parentOrderId": "",
        //             "tpslOrder": {
        //                 // "quoteId": "",
        //                 // "quote": false,
        //                 // "mmpGroup": "",
        //                 // "quoteSetId": ""
        //                 "tpslClOrdId": null,
        //                 "tpslMode": null,
        //                 "takeProfitType": "last_price",
        //                 "stopLossType": "last_price",
        //                 "takeProfit": "1900",
        //                 "stopLoss": "1600",
        //                 "tpOrderType": "market",
        //                 "slOrderType": "market",
        //                 "tpLimitPrice": null,
        //                 "slLimitPrice": null
        //             },
        //             "pid": "1919735713887760385",
        //             "cid": "174594041187401"
        //         }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (order, 'ts', 'createTime');
        let orderType: Str = undefined;
        const orderTypeRaw = this.safeString (order, 'orderType');
        if (orderTypeRaw === 'post_only') {
            orderType = 'limit';
        } else {
            orderType = orderTypeRaw;
        }
        let fee = undefined;
        const feeRaw = this.safeString (order, 'quoteFee');
        if (feeRaw !== undefined) {
            fee = {
                'cost': Precise.stringAbs (feeRaw),
                'currency': market['quote'],
            };
        }
        return this.safeOrder ({
            'id': this.safeString2 (order, 'orderId', 'complexOId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimeStamp': this.safeInteger (order, 'updateTime'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (this.safeString (order, 'timeInForce')),
            'postOnly': (orderTypeRaw === 'post_only'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'triggerPrice': undefined,
            'cost': undefined,
            'average': this.safeString (order, 'avgPrice'),
            'amount': this.safeString (order, 'qty'),
            'filled': this.safeString (order, 'totalFillQty'),
            'remaining': undefined,
            'trades': undefined,
            'fee': fee,
            'info': order,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'untriggered': 'open',
            'new': 'open',
            'partially_filled': 'open',
            'partially_canceled': 'canceled',
            'canceled': 'canceled',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce: Str) {
        const timeInForces: Dict = {
            'gtc': 'GTC',
            'fok': 'FOK',
            'ioc': 'IOC',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    /**
     * @method
     * @name xcoin#cancelOrders
     * @description cancel multiple orders
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/batch-cancel
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            const cancelReq = {
                'orderId': ids[i],
                'symbol': market['id'],
            };
            orders.push (cancelReq);
        }
        const request = {
            'orderReqList': orders,
        };
        const response = await this.privatePostV1TradeBatchCancelOrder (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "orderId": "1322577577491374080",
        //         "code": "0",
        //         "msg":"success",
        //         "ts": "1732158287000"
        //       },
        //       {
        //         "orderId": "1328425322454036480",
        //         "code": "0",
        //         "msg":"success",
        //         "ts": "1732158287000"
        //       }
        //     ],
        //     "ts": "1732158287000"
        //     }
        return this.parseOrders (response);
    }

    /**
     * @method
     * @name xcoin#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/cancel-all-orders
     * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        const market = this.marketOrNull (symbol);
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        const response = await this.privatePostV1TradeCancelAllOrder (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": null,
        //     "ts": "1732158178000"
        // }
        //
        return this.parseOrders ([ response ], market);
    }

    /**
     * @method
     * @name xcoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-current-open-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.marketOrNull (symbol);
        const request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        const response = await this.privateGetV2TradeOpenOrders (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //         {
        //             "accountName": "hongliang02",
        //             "businessType": "linear_perpetual",
        //             "symbol": "ETH-USDT-PERP",
        //             "orderId": "1369615474164670464",
        //             "clientOrderId": "1369615474164670464",
        //             "price": "1800",
        //             "qty": "100",
        //             "pnl": "",
        //             "orderType": "limit",
        //             "side": "buy",
        //             "totalFillQty": "50",
        //             "avgPrice": "1800",
        //             "status": "partially_filled",
        //             "lever": 1,
        //             "baseFee": "",
        //             "quoteFee": "-0.45",
        //             "uid": "174594041178400",
        //             "source": "web",
        //             "category": "normal",
        //             "reduceOnly": false,
        //             "timeInForce": "gtc",
        //             "createTime": 1746583375274,
        //             "updateTime": 1746584491397,
        //             "tpslOrder": {
        //                 "quoteId": "",
        //                 "quote": false,
        //                 "mmpGroup": "",
        //                 "quoteSetId": ""
        //             },
        //             "eventId": "1",
        //             "parentOrderId": "",
        //             "tpslOrder": {
        //                 "tpslClOrdId": null,
        //                 "tpslMode": null,
        //                 "takeProfitType": "last_price",
        //                 "stopLossType": "last_price",
        //                 "takeProfit": "1900",
        //                 "stopLoss": "1600",
        //                 "tpOrderType": "market",
        //                 "slOrderType": "market",
        //                 "tpLimitPrice": null,
        //                 "slLimitPrice": null
        //             },
        //             "pid": "1919735713887760385",
        //             "cid": "174594041187401"
        //         }
        //     ],
        //     "ts": "1746586573969"
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name xcoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-historical-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const market = this.marketOrNull (symbol);
        let request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2HistoryOrders (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "id": "1328700748417994752",
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "orderId": "1328700748417994752",
        //         "clientOrderId": "1328700748417994752",
        //         "price": "95836.07",
        //         "qty": "0.02",
        //         "quoteQty": "0.02",
        //         "pnl": "0",
        //         "orderType": "market",
        //         "side": "sell",
        //         "totalFillQty": "0.02",
        //         "avgPrice": "95836.07",
        //         "status": "filled",
        //         "lever": "0",
        //         "baseFee": "0",
        //         "quoteFee": "-0.19167214",
        //         "uid": "173578258816600000",
        //         "source": "api",
        //         "cancelSource": "0",
        //         "cancel uid": "0",
        //         "reduceOnly": false,
        //         "timeInForce": "ioc",
        //         "createTime": "1736828544489",
        //         "updateTime": "1736828544494"
        //       }
        //     ],
        //     "ts": "1732158443301"
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseOrders (data, market, since, limit);
    }

    /**
     * @method
     * @name xcoin#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-order-information
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {};
        if (this.safeString (params, 'clientOrderId') === undefined) {
            request['orderId'] = id;
        }
        const order = await this.privateGetV2TradeOrderInfo (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "id": "1328700748417994752",
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "orderId": "1328700748417994752",
        //         "clientOrderId": "1328700748417994752",
        //         "price": "95836.07",
        //         "qty": "0.02",
        //         "quoteQty": "0.02",
        //         "pnl": "0",
        //         "orderType": "market",
        //         "side": "sell",
        //         "totalFillQty": "0.02",
        //         "avgPrice": "95836.07",
        //         "status": "filled",
        //         "lever": "0",
        //         "baseFee": "0",
        //         "quoteFee": "-0.19167214",
        //         "uid": "173578258816600000",
        //         "source": "api",
        //         "cancelSource": "0",
        //         "cancel uid": "0",
        //         "reduceOnly": false,
        //         "timeInForce": "ioc",
        //         "createTime": "1736828544489",
        //         "updateTime": "1736828544494"
        //       }
        //     ],
        //     "ts": "1732158443301"
        // }
        //
        const data = this.safeList (order, 'data', []);
        const firstOrder = this.safeDict (data, 0, {});
        return this.parseOrder (firstOrder);
    }

    /**
     * @method
     * @name xcoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-order-operation-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const response = await this.privateGetV2HistoryOrderOperations (this.extend (request, params));
        //
        // {
        //     "code": "0",
        //     "msg":"success",
        //     "data": [
        //       {
        //         "orderId": "1308916158820376576",
        //         "operationType": "create_order",
        //         "price": "93000",
        //         "qty": "0.1",
        //         "createTime": "1732158178000",
        //         "accountName": "hongliang01",
        //         "pid": "1917239173600325633",
        //         "cid": "174594041187401",
        //         "uid": "174594041178400"
        //       }
        //     ],
        //     "ts": "1732158443301"
        // }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, undefined, since, limit);
    }

    /**
     * @method
     * @name xcoin#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://xcoin.com/docs/coinApi/trading/regular-trading/get-account-trade-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.marketOrNull (symbol);
        let request: Dict = {};
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTime'] = since;
        }
        [ request, params ] = this.handleUntilOption ('endTime', request, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetV2HistoryTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "20221228071929579::ca2aafd0-1270-4b56-b0a9-85423b4a07c8",
        //             "activity_type": "FILL",
        //             "transaction_time": "2022-12-28T12:19:29.579352Z",
        //             "type": "fill",
        //             "price": "67.31",
        //             "qty": "0.07",
        //             "side": "sell",
        //             "symbol": "LTC/USD",
        //             "leaves_qty": "0",
        //             "order_id": "82eebcf7-6e66-4b7e-93f8-be0df0e4f12e",
        //             "cum_qty": "0.07",
        //             "order_status": "filled",
        //             "swap_rate": "1"
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        const query = this.omit (params, this.extractParams (path));
        url += '/' + this.implodeParams (path, params);
        let queryStr = '';
        if (method === 'GET') {
            if (Object.keys (query).length) {
                queryStr = this.urlencode (query);
                url += '?' + queryStr;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            let bodyStr = '';
            if (method === 'POST') {
                body = this.json (params);
                bodyStr = body;
            }
            const preHash = timestamp.toString () + method.toUpperCase () + '/' + path + queryStr + bodyStr;
            const signature = this.hmac (this.encode (preHash), this.encode (this.secret), sha256, 'hex');
            headers = {
                'Content-Type': 'application/json',
                'X-ACCESS-APIKEY': this.apiKey,
                'X-ACCESS-TIMESTAMP': timestamp,
                'X-ACCESS-SIGN': signature,
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
