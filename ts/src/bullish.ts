//  ---------------------------------------------------------------------------

import { Precise } from '../ccxt.js';
import Exchange from './abstract/bullish.js';
import { BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Bool, Currencies, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Ticker, Trade } from './base/types.js';
import { req } from './static_dependencies/proxies/agent-base/helpers.js';

//  ---------------------------------------------------------------------------

/**
 * @class bullish
 * @augments Exchange
 */
export default class bullish extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'bullish',
            'name': 'Bullish',
            'countries': [ 'DE' ],
            'version': 'v3',
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': true,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
                'ws': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '30m': '30m',
                '1h': '1h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.exchange.bullish.com/trading-api',
                    'private': 'https://api.exchange.bullish.com/trading-api',
                },
                'www': 'https://bullish.com/',
                'referral': '',
                'doc': [
                    'https://api.exchange.bullish.com/docs/api/rest/',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'v1/nonce': 1,
                        'v1/time': 1, // done
                        'v1/assets': 1, // done
                        'v1/assets/{symbol}': 1, // not used
                        'v1/markets': 1, // done
                        'v1/markets/{symbol}': 1, // not used
                        'v1/markets/{symbol}/orderbook/hybrid': 1, // done
                        'v1/markets/{symbol}/trades': 1, // done
                        'v1/markets/{symbol}/tick': 1, // done
                        'v1/markets/{symbol}/candle': 1, // done
                        'v1/history/markets/{symbol}/trades': 1,
                        'v1/history/markets/{symbol}/funding-rate': 1,
                        'v1/index-prices': 1,
                        'v1/index-prices/{assetSymbol}': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/orders': 1, // todo complete while get api keys
                        'v2/orders/{orderId}': 1, // todo complete while get api keys
                        'v2/amm-instructions': 1,
                        'v2/amm-instructions/{instructionId}': 1,
                        'v1/wallets/transactions': 1,
                        'v1/wallets/limits/{symbol}': 1,
                        'v1/wallets/deposit-instructions/crypto/{symbol}': 1,
                        'v1/wallets/withdrawal-instructions/crypto/{symbol}': 1,
                        'v1/wallets/deposit-instructions/fiat/{symbol}': 1,
                        'v1/wallets/withdrawal-instructions/fiat/{symbol}': 1,
                        'v1/trades': 1,
                        'v1/trades/{tradeId}': 1,
                        'v1/accounts/asset': 1,
                        'v1/accounts/asset/{symbol}': 1,
                        'v1/users/logout': 1,
                        'v1/users/hmac/login': 1,
                        'v1/accounts/trading-accounts': 1,
                        'v1/accounts/trading-accounts/{tradingAccountId}': 1,
                        'v1/derivatives-positions': 1,
                        'v1/history/derivatives-settlement': 1,
                        'v1/history/transfer': 1,
                        'v1/history/borrow-interest': 1,
                    },
                    'post': {
                        'v2/orders': 1, // todo complete while get api keys
                        'v2/command': 1, // todo complete while get api keys
                        'v2/amm-instructions': 1,
                        'v1/wallets/withdrawal': 1,
                        'v2/users/login': 1,
                        'v1/command?commandType=V1TransferAsset': 1,
                        'v1/simulate-portfolio-margin': 1,
                    },
                },
            },
            'fees': {
                'trading': { // to do check
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'networksById': {
                },
            },
            'features': {
                'spot': {
                },
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    /**
     * @method
     * @name bullish#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.publicGetV1Time (params);
        //
        //     {
        //         "datetime": "2025-05-05T20:05:50.999Z",
        //         "timestamp": 1746475550999
        //     }
        //
        return this.safeInteger (response, 'timestamp');
    }

    /**
     * @method
     * @name bullish#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetV1Assets (params);
        //
        //     [
        //         {
        //             "assetId": "72",
        //             "symbol": "BTT1M",
        //             "name": "BitTorrent (millions)",
        //             "precision": "5",
        //             "minBalanceInterest": "0.00000",
        //             "apr": "10.00",
        //             "minFee": "0.00000",
        //             "maxBorrow": "0.00000",
        //             "totalOfferedLoanQuantity": "0.00000",
        //             "loanBorrowedQuantity": "0.00000",
        //             "collateralBands":
        //                 [
        //                     {
        //                         "collateralPercentage": "90.00",
        //                         "bandLimitUSD": "100000.0000"
        //                     },
        //                     {
        //                         "collateralPercentage": "68.00",
        //                         "bandLimitUSD": "300000.0000"
        //                     },
        //                     {
        //                         "collateralPercentage": "25.00",
        //                         "bandLimitUSD": "600000.0000"
        //                     }
        //                 ],
        //             "underlyingAsset":
        //                 {
        //                     "symbol": "BTT1M",
        //                     "assetId": "72",
        //                     "bpmMinReturnStart": "0.9200",
        //                     "bpmMinReturnEnd": "0.9300",
        //                     "bpmMaxReturnStart": "1.0800",
        //                     "bpmMaxReturnEnd": "1.0800",
        //                     "marketRiskFloorPctStart": "2.60",
        //                     "marketRiskFloorPctEnd": "2.50",
        //                     "bpmTransitionDateTimeStart": "2025-05-05T08:00:00.000Z",
        //                     "bpmTransitionDateTimeEnd": "2025-05-08T08:00:00.000Z"
        //                 }
        //         }, ...
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'assetId');
            const code = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name');
            const precision = this.safeInteger (currency, 'precision');
            const minFee = Precise.stringMax (this.safeString (currency, 'minFee'), '0.00000');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': minFee,
                'precision': precision,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
                'type': 'crypto',
                'info': currency,
            };
        }
        return result;
    }

    /**
     * @method
     * @name bullish#fetchMarkets
     * @description retrieves data on all markets for ace
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV1Markets (params);
        //
        //     [
        //         {
        //             "marketId": "20069",
        //             "symbol": "BTC-USDC-20250516",
        //             "quoteAssetId": "5",
        //             "baseAssetId": "1",
        //             "quoteSymbol": "USDC",
        //             "baseSymbol": "BTC",
        //             "quotePrecision": "4",
        //             "basePrecision": "8",
        //             "pricePrecision": "4",
        //             "quantityPrecision": "8",
        //             "costPrecision": "4",
        //             "minQuantityLimit": "0.00050000",
        //             "maxQuantityLimit": "200.00000000",
        //             "maxPriceLimit": null,
        //             "minPriceLimit": null,
        //             "maxCostLimit": null,
        //             "minCostLimit": null,
        //             "timeZone": "Etc/UTC",
        //             "tickSize": "0.1000",
        //             "liquidityTickSize": "100.0000",
        //             "liquidityPrecision": "4",
        //             "makerFee": "0",
        //             "takerFee": "2",
        //             "roundingCorrectionFactor": "0.00000100",
        //             "makerMinLiquidityAddition": "1000000",
        //             "orderTypes":
        //                 [
        //                     "LMT",
        //                     "MKT",
        //                     "STOP_LIMIT",
        //                     "POST_ONLY"
        //                 ],
        //             "spotTradingEnabled": true,
        //             "marginTradingEnabled": true,
        //             "marketEnabled": true,
        //             "createOrderEnabled": true,
        //             "cancelOrderEnabled": true,
        //             "liquidityInvestEnabled": true,
        //             "liquidityWithdrawEnabled": true,
        //             "feeTiers":
        //                 [
        //                     {
        //                         "feeTierId": "1",
        //                         "staticSpreadFee": "0.00000000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "10",
        //                         "staticSpreadFee": "0.00100000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "11",
        //                         "staticSpreadFee": "0.00150000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "12",
        //                         "staticSpreadFee": "0.00150000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "13",
        //                         "staticSpreadFee": "0.00300000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "14",
        //                         "staticSpreadFee": "0.00300000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "15",
        //                         "staticSpreadFee": "0.00500000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "16",
        //                         "staticSpreadFee": "0.00500000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "17",
        //                         "staticSpreadFee": "0.01000000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "18",
        //                         "staticSpreadFee": "0.01000000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "19",
        //                         "staticSpreadFee": "0.01500000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "2",
        //                         "staticSpreadFee": "0.00000000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "20",
        //                         "staticSpreadFee": "0.01500000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "21",
        //                         "staticSpreadFee": "0.02000000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "22",
        //                         "staticSpreadFee": "0.02000000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "3",
        //                         "staticSpreadFee": "0.00010000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "4",
        //                         "staticSpreadFee": "0.00010000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "5",
        //                         "staticSpreadFee": "0.00020000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "6",
        //                         "staticSpreadFee": "0.00020000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "7",
        //                         "staticSpreadFee": "0.00060000",
        //                         "isDislocationEnabled": false
        //                     },
        //                     {
        //                         "feeTierId": "8",
        //                         "staticSpreadFee": "0.00060000",
        //                         "isDislocationEnabled": true
        //                     },
        //                     {
        //                         "feeTierId": "9",
        //                         "staticSpreadFee": "0.00100000",
        //                         "isDislocationEnabled": false
        //                     }
        //                 ],
        //             "marketType": "DATED_FUTURE",
        //             "contractMultiplier": "1",
        //             "settlementAssetSymbol": "USDC",
        //             "underlyingQuoteSymbol": "USDC",
        //             "underlyingBaseSymbol": "BTC",
        //             "openInterestLimitUSD": "100000000.0000",
        //             "concentrationRiskPercentage": "100.00",
        //             "concentrationRiskThresholdUSD": "30000000.0000",
        //             "expiryDatetime": "2025-05-16T08:00:00.000Z",
        //             "priceBuffer": "0.1",
        //             "feeGroupId": "4"
        //         },
        //     ]...
        //
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        const id = this.safeString (market, 'symbol');
        let symbol = undefined;
        const baseId = this.safeString (market, 'baseSymbol');
        const quoteId = this.safeString (market, 'quoteSymbol');
        const base = this.safeString (market, 'baseSymbol');
        const quote = this.safeString (market, 'quoteSymbol');
        symbol = base + '/' + quote;
        const basePrecision = this.safeString (market, 'basePrecision');
        const quotePrecision = this.safeString (market, 'quotePrecision');
        const pricePrecision = this.safeString (market, 'pricePrecision');
        const costPrecision = this.safeString (market, 'costPrecision');
        const minQuantityLimit = this.safeString (market, 'minQuantityLimit');
        const maxQuantityLimit = this.safeString (market, 'maxQuantityLimit');
        const minPriceLimit = this.safeString (market, 'minPriceLimit');
        const maxPriceLimit = this.safeString (market, 'maxPriceLimit');
        const minCostLimit = this.safeString (market, 'minCostLimit');
        const maxCostLimit = this.safeString (market, 'maxCostLimit');
        let settleId = undefined;
        const type = this.parseMarketType (this.safeString (market, 'marketType'), 'spot');
        let spot: Bool = false;
        let swap = false;
        let future = false;
        let linear: Bool = undefined;
        let inverse: Bool = undefined;
        if (type === 'spot') {
            spot = true;
        } else if (type === 'swap') {
            swap = true;
            linear = true;
            settleId = this.safeString (market, 'settlementAssetSymbol');
            inverse = false;
            symbol = base + '/' + quote + ':' + settleId;
        } else if (type === 'future') {
            future = true;
            linear = true;
            settleId = this.safeString (market, 'settlementAssetSymbol');
            inverse = false;
            symbol = base + '/' + quote + ':' + settleId;
        }
        const margin = this.safeValue (market, 'marginTradingEnabled', false);
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': this.safeCurrencyCode (settleId),
            'settleId': settleId,
            'type': type,
            'spot': spot,
            'margin': margin,
            'swap': swap,
            'future': future,
            'option': false,
            'contract': false,
            'linear': linear,
            'inverse': inverse,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'limits': {
                'amount': {
                    'min': minQuantityLimit,
                    'max': maxQuantityLimit,
                },
                'price': {
                    'min': minPriceLimit,
                    'max': maxPriceLimit,
                },
                'cost': {
                    'min': minCostLimit,
                    'max': maxCostLimit,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'precision': {
                'amount': costPrecision,
                'price': pricePrecision,
                'base': basePrecision,
                'quote': quotePrecision,
            },
            'active': true,
            'created': undefined,
            'info': market,
        });
    }

    parseMarketType (type: string, defaultType: string): string {
        const types = {
            'SPOT': 'spot',
            'PERPETUAL': 'swap',
            'DATED_FUTURE': 'future',
        };
        return this.safeString (types, type, defaultType);
    }

    /**
     * @method
     * @name bullish#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/orderbook/hybrid
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (not used by bullish)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1MarketsSymbolOrderbookHybrid (this.extend (request, params));
        //
        //     {
        //         "bids": [
        //             {
        //                 "price": "1.00000000",
        //                 "priceLevelQuantity": "1.00000000"
        //             }
        //         ],
        //         "asks": [
        //             {
        //                 "price": "1.00000000",
        //                 "priceLevelQuantity": "1.00000000"
        //             }
        //         ],
        //         "datetime": "2021-05-20T01:01:01.000Z",
        //         "timestamp": "1621490985000",
        //         "sequenceNumber": 999
        //     }
        //
        const timestamp = this.safeTimestamp (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'priceLevelQuantity');
    }

    /**
     * @method
     * @name bullish#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1MarketsSymbolTrades (this.extend (request, params));
        //
        //     [
        //         {
        //             "tradeId": "100020000000000060",
        //             "symbol": "BTCUSDC",
        //             "price": "1.00000000",
        //             "quantity": "1.00000000",
        //             "side": "BUY",
        //             "isTaker": true,
        //             "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //             "createdAtTimestamp": "1621490985000"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     [
        //         {
        //             "tradeId": "100020000000000060",
        //             "symbol": "BTCUSDC",
        //             "price": "1.00000000",
        //             "quantity": "1.00000000",
        //             "side": "BUY",
        //             "isTaker": true,
        //             "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //             "createdAtTimestamp": "1621490985000"
        //         }
        //     ]
        //
        const id = this.safeString (trade, 'symbol');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'createdAtTimestamp');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        const side = this.safeString (trade, 'side');
        const isTaker = this.safeBool (trade, 'isTaker');
        let takerOrMaker = undefined;
        if (isTaker) {
            takerOrMaker = 'taker';
        } else {
            takerOrMaker = 'maker';
        }
        const orderId = this.safeString (trade, 'tradeId');
        return this.safeTrade ({
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
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name bullish#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1MarketsSymbolTick (this.extend (request, params));
        //
        //     {
        //         "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "createdAtTimestamp": "1621490985000",
        //         "high": "1.00000000",
        //         "low": "1.00000000",
        //         "bestBid": "1.00000000",
        //         "bidVolume": "1.00000000",
        //         "bestAsk": "1.00000000",
        //         "askVolume": "1.00000000",
        //         "vwap": "1.00000000",
        //         "open": "1.00000000",
        //         "close": "1.00000000",
        //         "last": "1.00000000",
        //         "change": "1.00000000",
        //         "percentage": "1.00000000",
        //         "average": "1.00000000",
        //         "baseVolume": "1.00000000",
        //         "quoteVolume": "1.00000000",
        //         "bancorPrice": "1.00000000",
        //         "markPrice": "19999.00",
        //         "fundingRate": "0.01",
        //         "openInterest": "100000.32452",
        //         "lastTradeDatetime": "2021-05-20T01:01:01.000Z",
        //         "lastTradeTimestamp": "1621490985000",
        //         "lastTradeQuantity": "1.00000000",
        //         "ammData": [
        //             {
        //                 "feeTierId": "1",
        //                 "bidSpreadFee": "0.00040000",
        //                 "askSpreadFee": "0.00040000",
        //                 "baseReservesQuantity": "245.56257825",
        //                 "quoteReservesQuantity": "3424383.3629",
        //                 "currentPrice": "16856.0000"
        //             }
        //         ]
        //     }
        //
        return this.parseTicker (response, market);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const marketId = this.safeString (market, 'id');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (ticker, 'createdAtTimestamp');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString2 (ticker, 'bid', 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidVolume'),
            'ask': this.safeString2 (ticker, 'ask', 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askVolume'),
            'vwap': this.safeString (ticker, 'vwap'),
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'last'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'percentage'),
            'average': this.safeString (ticker, 'average'),
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name bullish#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/candle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (since === undefined) {
            throw new BadRequest (this.id + ' fetchOHLCV() requires a since argument');
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        timeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'symbol': market['id'],
            'timeBucket': timeframe,
            'createdAtDatetime[gte]': this.iso8601 (since),
            'createdAtDatetime[lte]': this.iso8601 (until),
        };
        const response = await this.publicGetV1MarketsSymbolCandle (this.extend (request, params));
        //
        //     [
        //         {
        //             "open": "100846.7490",
        //             "high": "100972.4001",
        //             "low": "100840.8129",
        //             "close": "100972.2602",
        //             "volume": "30.56064890",
        //             "createdAtTimestamp": "1746720540000",
        //             "createdAtDatetime": "2025-05-08T16:09:00.000Z",
        //             "publishedAtTimestamp": "1746720636007"
        //         }, ...
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'createdAtTimestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name bullish#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, not used by bullish
     * @param {int} [limit] the maximum number of order structures to retrieve, not used by bullish
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        const request: Dict = {
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const tradingAccountId = this.safeString (params, 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new BadRequest (this.id + ' fetchOrders() requires a tradingAccountId parameter');
        }
        params = this.omit (params, 'tradingAccountId');
        request['tradingAccountId'] = tradingAccountId;
        const response = await this.privateGetV2Orders (this.extend (request, params));
        //
        //     [
        //         {
        //             "clientOrderId": "187",
        //             "orderId": "297735387747975680",
        //             "symbol": "BTCUSDC",
        //             "price": "1.00000000",
        //             "averageFillPrice": "1.00000000",
        //             "stopPrice": "1.00000000",
        //             "allowBorrow": false,
        //             "quantity": "1.00000000",
        //             "quantityFilled": "1.00000000",
        //             "quoteAmount": "1.00000000",
        //             "baseFee": "0.00100000",
        //             "quoteFee": "0.0010",
        //             "borrowedBaseQuantity": "1.00000000",
        //             "borrowedQuoteQuantity": "1.00000000",
        //             "isLiquidation": false,
        //             "side": "BUY",
        //             "type": "LMT",
        //             "timeInForce": "GTC",
        //             "status": "OPEN",
        //             "statusReason": "User cancelled",
        //             "statusReasonCode": "1002",
        //             "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //             "createdAtTimestamp": "1621490985000",
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name bullish#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v2/orders/-orderId-
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const tradingAccountId = this.safeString (params, 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new BadRequest (this.id + ' fetchOrders() requires a tradingAccountId parameter');
        }
        params = this.omit (params, 'tradingAccountId');
        request['tradingAccountId'] = tradingAccountId;
        const response = await this.privateGetV2OrdersOrderId (this.extend (request, params));
        //
        //     {
        //         "clientOrderId": "187",
        //         "orderId": "297735387747975680",
        //         "symbol": "BTCUSDC",
        //         "price": "1.00000000",
        //         "averageFillPrice": "1.00000000",
        //         "stopPrice": "1.00000000",
        //         "allowBorrow": false,
        //         "quantity": "1.00000000",
        //         "quantityFilled": "1.00000000",
        //         "quoteAmount": "1.00000000",
        //         "baseFee": "0.00100000",
        //         "quoteFee": "0.0010",
        //         "borrowedBaseQuantity": "1.00000000",
        //         "borrowedQuoteQuantity": "1.00000000",
        //         "isLiquidation": false,
        //         "side": "BUY",
        //         "type": "LMT",
        //         "timeInForce": "GTC",
        //         "status": "OPEN",
        //         "statusReason": "User cancelled",
        //         "statusReasonCode": "1002",
        //         "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "createdAtTimestamp": "1621490985000",
        //     }
        //
        return this.parseOrder (response);
    }

    /**
     * @method
     * @name bullish#createOrder
     * @description create a trade order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id
     * @param {float} [params.stopPrice] the price at which a stop order is triggered at
     * @param {string} [params.timeInForce] the time in force for the order, either 'GTC' (Good Till Cancelled) or 'IOC' (Immediate or Cancel), default is 'GTC'
     * @param {bool} [params.allowBorrow] if true, the order will be allowed to borrow assets to fulfill the order (default is false)
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'commandType': 'V3CreateOrder',
            'symbol': market['id'],
            'side': side,
            'price': price,
            'quantity': this.amountToPrecision (symbol, amount),
            'timeInForce': this.safeString (params, 'timeInForce', 'GTC'),
            'allowBorrow': this.safeValue (params, 'allowBorrow', false),
            'tradingAccountId': this.safeString (params, 'tradingAccountId'),
        };
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        const stopPrice = this.safeString (params, 'stopPrice');
        if (stopPrice !== undefined) {
            request['stopPrice'] = stopPrice;
            request['type'] = 'STOP_LIMIT';
        }
        const postOnly = this.safeValue (params, 'postOnly', false);
        if (postOnly) {
            request['type'] = 'POST_ONLY';
        }
        request['type'] = this.capitalize (type);
        params = this.omit (params, [ 'postOnly', 'timeInForce', 'stopPrice' ]);
        const response = await this.privatePostV2Orders (this.extend (request, params));
        //
        //     {
        //         "message": "Command acknowledged - CreateOrder",
        //         "requestId": "633910976353665024",
        //         "orderId": "633910775316480001",
        //         "clientOrderId": "1234567"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bullish#cancelOrder
     * @description cancels an open order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.commandType] the command type, default is 'V3CancelOrder'
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'commandType': this.safeString (params, 'commandType', 'V3CancelOrder'),
            'orderId': parseInt (id),
            'symbol': market['id'],
            'tradingAccountId': this.safeString (params, 'tradingAccountId'),
        };
        const response = await this.privatePostV2Command (this.extend (request, params));
        //
        //     {
        //         "message": "Command acknowledged - CancelOrder",
        //         "requestId": "633910976353665024",
        //         "orderId": "633910775316480001"
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bullish#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations
     * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.commandType] the command type, default is 'V3CancelOrder'
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'tradingAccountId': this.safeString (params, 'tradingAccountId'),
        };
        if (market !== undefined) {
            request['symbol'] = market['id'];
            request['commandType'] = 'V1CancelAllOrdersByMarket';
            params = this.omit (params, 'commandType');
        } else {
            request['commandType'] = this.safeString (params, 'commandType', 'V3CancelAllOrders');
        }
        const response = await this.privatePostV2Command (this.extend (request, params));
        //
        //     {
        //         "message": "Command acknowledged - CancelAllOrders",
        //         "requestId": "633900538459062272"
        //     }
        //
        return this.parseOrders (response, market);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // fetchOrders, fetchOrder
        //     {
        //         "clientOrderId": "187",
        //         "orderId": "297735387747975680",
        //         "symbol": "BTCUSDC",
        //         "price": "1.00000000",
        //         "averageFillPrice": "1.00000000",
        //         "stopPrice": "1.00000000",
        //         "allowBorrow": false,
        //         "quantity": "1.00000000",
        //         "quantityFilled": "1.00000000",
        //         "quoteAmount": "1.00000000",
        //         "baseFee": "0.00100000",
        //         "quoteFee": "0.0010",
        //         "borrowedBaseQuantity": "1.00000000",
        //         "borrowedQuoteQuantity": "1.00000000",
        //         "isLiquidation": false,
        //         "side": "BUY",
        //         "type": "LMT",
        //         "timeInForce": "GTC",
        //         "status": "OPEN",
        //         "statusReason": "User cancelled",
        //         "statusReasonCode": "1002",
        //         "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "createdAtTimestamp": "1621490985000",
        //     }
        //
        // createOrder
        //     {
        //         "message": "Command acknowledged - CreateOrder",
        //         "requestId": "633910976353665024",
        //         "orderId": "633910775316480001",
        //         "clientOrderId": "1234567"
        //     }
        //
        // cancelOrder
        //     {
        //         "message": "Command acknowledged - CancelOrder",
        //         "requestId": "633910976353665024",
        //         "orderId": "633910775316480001"
        //     }
        //
        // cancelAllOrders
        //     {
        //         "message": "Command acknowledged - CancelAllOrders",
        //         "requestId": "633900538459062272"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString (order, 'clientOrderId');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAtTimestamp'));
        const type = this.parseOrderType (this.safeString (order, 'type'));
        const side = this.safeString (order, 'side');
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'quantity');
        const filled = this.safeString (order, 'quantityFilled');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const timeInForce = this.safeString (order, 'timeInForce');
        const stopPrice = this.safeString (order, 'stopPrice');
        const cost = this.safeString (order, 'quoteAmount');
        const fee = {};
        const quoteFee = this.safeNumber (order, 'quoteFee');
        if (quoteFee !== undefined) {
            fee['cost'] = quoteFee;
            fee['currency'] = market['quote'];
        }
        const average = this.safeString (order, 'averageFillPrice');
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'triggerPrice': stopPrice,
            'amount': amount,
            'filled': filled,
            'remaining': undefined,
            'cost': cost,
            'trades': undefined,
            'fee': fee,
            'info': order,
            'average': average,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'OPEN': 'open',
            'CLOSED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            'LMT': 'limit',
            'MKT': 'market',
        };
        return this.safeString (types, type, type);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.customUrlencode (request);
        url += '?' + query;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    customUrlencode (params: Dict = {}): Str {
        let result = this.urlencode (params);
        result = result.replace ('%5B', '[');
        result = result.replace ('%5D', ']');
        result = result.replace ('%3A', ':');
        result = result.replace ('%3A', ':');
        result = result.replace ('%5B', '[');
        result = result.replace ('%5D', ']');
        result = result.replace ('%3A', ':');
        result = result.replace ('%3A', ':');
        return result;
    }
}
