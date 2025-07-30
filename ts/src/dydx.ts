
// ---------------------------------------------------------------------------

import Exchange from './abstract/dydx.js';
import { ArgumentsRequired } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import Precise from './base/Precise.js';
import type { Int, Market, Dict, int, Trade, OHLCV, Str, FundingRateHistory, Order, Strings, Position, OrderBook } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class dydx
 * @augments Exchange
 */
export default class dydx extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'dydx',
            'name': 'dYdX',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'version': 'v4',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1MIN',
                '5m': '5MINS',
                '15m': '15MINS',
                '30m': '30MINS',
                '1h': '1HOUR',
                '4h': '4HOURS',
                '1d': '1DAY',
            },
            'urls': {
                'logo': '',
                'api': {
                    'indexer': 'https://indexer.dydx.trade/v4',
                    'node': 'https://dydx-dao-api.polkachu.com',
                },
                'test': {
                    'indexer': 'https://indexer.v4testnet.dydx.exchange/v4',
                    'node': 'https://dydx-lcd-testnet.enigma-validator.com',
                },
                'www': 'https://www.dydx.xyz',
                'doc': [
                    'https://docs.dydx.xyz',
                ],
                'fees': [
                    'https://docs.dydx.exchange/introduction-trading_fees',
                ],
                'referral': {
                    'url': '',
                },
            },
            'api': {
                'indexer': {
                    'get': {
                        'addresses/{address}': 1,
                        'addresses/{address}/parentSubaccountNumber/{number}': 1,
                        'addresses/{address}/subaccountNumber/{subaccountNumber}': 1,
                        'assetPositions': 1,
                        'assetPositions/parentSubaccountNumber': 1,
                        'candles/perpetualMarkets/{market}': 1,
                        'compliance/screen/{address}': 1,
                        'fills': 1,
                        'fills/parentSubaccountNumber': 1,
                        'fundingPayments': 1,
                        'fundingPayments/parentSubaccount': 1,
                        'height': 1,
                        'historical-pnl': 1,
                        'historical-pnl/parentSubaccountNumber': 1,
                        'historicalBlockTradingRewards/{address}': 1,
                        'historicalFunding/{market}': 1,
                        'historicalTradingRewardAggregations/{address}': 1,
                        'orderbooks/perpetualMarket/{market}': 1,
                        'orders': 1,
                        'orders/parentSubaccountNumber': 1,
                        'orders/{orderId}': 1,
                        'perpetualMarkets': 1,
                        'perpetualPositions': 1,
                        'perpetualPositions/parentSubaccountNumber': 1,
                        'screen': 1,
                        'sparklines': 1,
                        'time': 1,
                        'trades/perpetualMarket/{market}': 1,
                        'transfers': 1,
                        'transfers/between': 1,
                        'transfers/parentSubaccountNumber': 1,
                        'vault/v1/megavault/historicalPnl': 1,
                        'vault/v1/megavault/positions': 1,
                        'vault/v1/vaults/historicalPnl': 1,
                        //
                        'perpetualMarketSparklines': 1,
                        'perpetualMarkets/{ticker}': 1,
                        'perpetualMarkets/{ticker}/orderbook': 1,
                        'trades/perpetualMarket/{ticker}': 1,
                        'historicalFunding/{ticker}': 1,
                        'candles/{ticker}/{resolution}': 1,
                        'addresses/{address}/subaccounts': 1,
                        'addresses/{address}/subaccountNumber/{subaccountNumber}/assetPositions': 1,
                        'addresses/{address}/subaccountNumber/{subaccountNumber}/perpetualPositions': 1,
                        'addresses/{address}/subaccountNumber/{subaccountNumber}/orders': 1,
                        'fills/parentSubaccount': 1,
                        'historical-pnl/parentSubaccount': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'options': {
                'timeDifference': 0, // the difference between system clock and exchange clock
                'adjustForTimeDifference': false, // controls the adjustment logic upon instantiation
                'sandboxMode': false,
                'createMarketBuyOrderRequiresPrice': true,
                // these network aliases require manual mapping here
                'network-aliases-for-tokens': {
                    'HT': 'ERC20',
                    'OMG': 'ERC20',
                    'UATOM': 'ATOM',
                    'ZRX': 'ZRX',
                },
                'networks': {
                    'TRX': 'TRON',
                    'TRC20': 'TRON',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                    'ARB': 'Arbitrum',
                },
                'networksById': {
                    'TRX': 'TRC20',
                    'TRON': 'TRC20',
                },
                // override defaultNetworkCodePriorities for a specific currency
                'defaultNetworkCodeForCurrencies': {
                    // 'USDT': 'TRC20',
                    // 'BTC': 'BTC',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': true,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false, // todo by triggerPrice
                        'takeProfitPrice': false, // todo by triggerPrice
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                        },
                        'hedged': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': true,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': true, // todo implement
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 90,
                        'untilDays': 10000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': true,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': 100000,
                        'trigger': true,
                        'trailing': true,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': 1000,
                    },
                },
                'spot': {
                    'extends': 'default',
                },
                'forSwap': {
                    'extends': 'default',
                    'createOrder': {
                        'hedged': true,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'forSwap',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    /**
     * @method
     * @name dydx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.dydx.xyz/indexer-client/http#get-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime (params = {}): Promise<Int> {
        const response = await this.indexerGetTime (params);
        //
        // {
        //     "iso": "2025-07-20T15:12:13.466Z",
        //     "epoch": 1753024333.466
        // }
        //
        return this.safeInteger (response, 'epoch');
    }

    parseMarket (market: Dict): Market {
        //
        // {
        //     "clobPairId": "0",
        //     "ticker": "BTC-USD",
        //     "status": "ACTIVE",
        //     "oraclePrice": "118976.5376",
        //     "priceChange24H": "659.9736",
        //     "volume24H": "1292729.3605",
        //     "trades24H": 9387,
        //     "nextFundingRate": "0",
        //     "initialMarginFraction": "0.02",
        //     "maintenanceMarginFraction": "0.012",
        //     "openInterest": "52.0691",
        //     "atomicResolution": -10,
        //     "quantumConversionExponent": -9,
        //     "tickSize": "1",
        //     "stepSize": "0.0001",
        //     "stepBaseQuantums": 1000000,
        //     "subticksPerTick": 100000,
        //     "marketType": "CROSS",
        //     "openInterestLowerCap": "0",
        //     "openInterestUpperCap": "0",
        //     "baseOpenInterest": "50.3776",
        //     "defaultFundingRate1H": "0"
        // }
        //
        const quoteId = 'USDC';
        const marketId = this.safeString (market, 'ticker');
        const parts = marketId.split ('-');
        const baseName = this.safeString (parts, 0);
        const base = this.safeCurrencyCode (baseName);
        const quote = this.safeCurrencyCode (quoteId);
        const baseId = this.safeString (market, 'baseId');
        const settleId = 'USDC';
        const settle = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const contract = true;
        const swap = true;
        const amountPrecisionStr = this.safeString (market, 'stepSize');
        const pricePrecisionStr = this.safeString (market, 'tickSize');
        const status = this.safeString (market, 'status');
        let active = true;
        if (status !== 'ACTIVE') {
            active = false;
        }
        return this.safeMarketStructure ({
            'id': this.safeString (market, 'ticker'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'baseName': baseName,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': swap,
            'future': false,
            'option': false,
            'active': active,
            'contract': contract,
            'linear': true,
            'inverse': false,
            'taker': undefined,
            'maker': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecisionStr),
                'price': this.parseNumber (pricePrecisionStr),
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
        });
    }

    /**
     * @method
     * @name dydx#fetchMarkets
     * @description retrieves data on all markets for hyperliquid
     * @see https://docs.dydx.xyz/indexer-client/http#get-perpetual-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const request: Dict = {
            // 'limit': 1000,
        };
        const response = await this.indexerGetPerpetualMarkets (this.extend (request, params));
        //
        // {
        //     "markets": {
        //         "BTC-USD": {
        //             "clobPairId": "0",
        //             "ticker": "BTC-USD",
        //             "status": "ACTIVE",
        //             "oraclePrice": "118976.5376",
        //             "priceChange24H": "659.9736",
        //             "volume24H": "1292729.3605",
        //             "trades24H": 9387,
        //             "nextFundingRate": "0",
        //             "initialMarginFraction": "0.02",
        //             "maintenanceMarginFraction": "0.012",
        //             "openInterest": "52.0691",
        //             "atomicResolution": -10,
        //             "quantumConversionExponent": -9,
        //             "tickSize": "1",
        //             "stepSize": "0.0001",
        //             "stepBaseQuantums": 1000000,
        //             "subticksPerTick": 100000,
        //             "marketType": "CROSS",
        //             "openInterestLowerCap": "0",
        //             "openInterestUpperCap": "0",
        //             "baseOpenInterest": "50.3776",
        //             "defaultFundingRate1H": "0"
        //         }
        //     }
        // }
        //
        const data = this.safeDict (response, 'markets', {});
        const markets = Object.values (data);
        return this.parseMarkets (markets);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // {
        //     "id": "02ac5b1f0000000200000002",
        //     "side": "BUY",
        //     "size": "0.0501",
        //     "price": "115732",
        //     "type": "LIMIT",
        //     "createdAt": "2025-07-25T05:11:09.800Z",
        //     "createdAtHeight": "44849951"
        // }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        const symbol = market['symbol'];
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'size');
        const side = this.safeStringLower (trade, 'side');
        const id = this.safeString (trade, 'id');
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'order': undefined,
            'takerOrMaker': undefined,
            'type': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name dydx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developer.woox.io/api-reference/endpoint/public_data/marketTrades
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
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.indexerGetTradesPerpetualMarketMarket (this.extend (request, params));
        //
        // {
        //     "trades": [
        //         {
        //             "id": "02ac5b1f0000000200000002",
        //             "side": "BUY",
        //             "size": "0.0501",
        //             "price": "115732",
        //             "type": "LIMIT",
        //             "createdAt": "2025-07-25T05:11:09.800Z",
        //             "createdAtHeight": "44849951"
        //         }
        //     ]
        // }
        //
        const rows = this.safeList (response, 'trades', []);
        return this.parseTrades (rows, market, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        // {
        //     "startedAt": "2025-07-25T09:47:00.000Z",
        //     "ticker": "BTC-USD",
        //     "resolution": "1MIN",
        //     "low": "116099",
        //     "high": "116099",
        //     "open": "116099",
        //     "close": "116099",
        //     "baseTokenVolume": "0",
        //     "usdVolume": "0",
        //     "trades": 0,
        //     "startingOpenInterest": "54.0594",
        //     "orderbookMidPriceOpen": "115845.5",
        //     "orderbookMidPriceClose": "115845.5"
        // }
        //
        return [
            this.parse8601 (this.safeString (ohlcv, 'startedAt')),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'baseTokenVolume'),
        ];
    }

    /**
     * @method
     * @name dydx#fetchOHLCV
     * @see https://docs.dydx.xyz/indexer-client/http#get-candles
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
            'resolution': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        if (since !== undefined) {
            request['fromIso'] = this.iso8601 (since);
        }
        const until = this.safeInteger (params, 'until');
        params = this.omit (params, 'until');
        if (until !== undefined) {
            request['toIso'] = this.iso8601 (until);
        }
        const response = await this.indexerGetCandlesPerpetualMarketsMarket (this.extend (request, params));
        //
        // {
        //     "candles": [
        //         {
        //             "startedAt": "2025-07-25T09:47:00.000Z",
        //             "ticker": "BTC-USD",
        //             "resolution": "1MIN",
        //             "low": "116099",
        //             "high": "116099",
        //             "open": "116099",
        //             "close": "116099",
        //             "baseTokenVolume": "0",
        //             "usdVolume": "0",
        //             "trades": 0,
        //             "startingOpenInterest": "54.0594",
        //             "orderbookMidPriceOpen": "115845.5",
        //             "orderbookMidPriceClose": "115845.5"
        //         }
        //     ]
        // }
        //
        const rows = this.safeList (response, 'candles', []);
        return this.parseOHLCVs (rows, market, timeframe, since, limit);
    }

    /**
     * @method
     * @name dydx#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.dydx.xyz/indexer-client/http#get-historical-funding
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['effectiveBeforeOrAt'] = this.iso8601 (until);
        }
        const response = await this.indexerGetHistoricalFundingMarket (this.extend (request, params));
        //
        // {
        //     "historicalFunding": [
        //         {
        //             "ticker": "BTC-USD",
        //             "rate": "0",
        //             "price": "116302.62419",
        //             "effectiveAtHeight": "44865196",
        //             "effectiveAt": "2025-07-25T11:00:00.013Z"
        //         }
        //     ]
        // }
        //
        const rates = [];
        const rows = this.safeList (response, 'historicalFunding', []);
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const timestamp = this.parse8601 (this.safeString (entry, 'effectiveAt'));
            const marketId = this.safeString (entry, 'ticker');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (marketId, market),
                'fundingRate': this.safeNumber (entry, 'rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit) as FundingRateHistory[];
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // {
        //     "id": "dad46410-3444-5566-a129-19a619300fb7",
        //     "subaccountId": "8586bcf6-1f58-5ec9-a0bc-e53db273e7b0",
        //     "clientId": "716238006",
        //     "clobPairId": "0",
        //     "side": "BUY",
        //     "size": "0.001",
        //     "totalFilled": "0.001",
        //     "price": "400000",
        //     "type": "LIMIT",
        //     "status": "FILLED",
        //     "timeInForce": "GTT",
        //     "reduceOnly": false,
        //     "orderFlags": "64",
        //     "goodTilBlockTime": "2025-07-28T12:07:33.000Z",
        //     "createdAtHeight": "45058325",
        //     "clientMetadata": "2",
        //     "updatedAt": "2025-07-28T12:06:35.330Z",
        //     "updatedAtHeight": "45058326",
        //     "postOnly": false,
        //     "ticker": "BTC-USD",
        //     "subaccountNumber": 0
        // }
        //
        const status = this.parseOrderStatus (this.safeStringUpper (order, 'status'));
        const marketId = this.safeString (order, 'ticker');
        const symbol = this.safeSymbol (marketId, market);
        const filled = this.safeString (order, 'totalFilled');
        const timestamp = this.parse8601 (this.safeString (order, 'updatedAt'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'size');
        const type = this.parseOrderType (this.safeStringUpper (order, 'type'));
        const side = this.safeStringLower (order, 'side');
        const timeInForce = this.safeStringUpper (order, 'timeInForce');
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': timestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': this.safeBool (order, 'postOnly'),
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'UNTRIGGERED': 'open',
            'OPEN': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'BEST_EFFORT_CANCELED': 'canceling',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str) {
        const types: Dict = {
            'LIMIT': 'LIMIT',
            'STOP_LIMIT': 'LIMIT',
            'TAKE_PROFIT_LIMIT': 'LIMIT',
            'MARKET': 'MARKET',
            'STOP_MARKET': 'MARKET',
            'TAKE_PROFIT_MARKET': 'MARKET',
            'TRAILING_STOP': 'MARKET',
        };
        return this.safeStringUpper (types, type, type);
    }

    /**
     * @method
     * @name dydx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#get-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const request: Dict = {
            'orderId': id,
        };
        const order = await this.indexerGetOrdersOrderId (this.extend (request, params));
        return this.parseOrder (order);
    }

    /**
     * @method
     * @name dydx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        let userAddress = undefined;
        let subAccountNumber = undefined;
        [ userAddress, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'address');
        [ subAccountNumber, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'subAccountNumber', '0');
        if (userAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a address parameter inside \'params\' or the wallet address set');
        }
        await this.loadMarkets ();
        const request: Dict = {
            'address': userAddress,
            'subaccountNumber': subAccountNumber,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['ticker'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.indexerGetOrders (this.extend (request, params));
        //
        // [
        //     {
        //         "id": "dad46410-3444-5566-a129-19a619300fb7",
        //         "subaccountId": "8586bcf6-1f58-5ec9-a0bc-e53db273e7b0",
        //         "clientId": "716238006",
        //         "clobPairId": "0",
        //         "side": "BUY",
        //         "size": "0.001",
        //         "totalFilled": "0.001",
        //         "price": "400000",
        //         "type": "LIMIT",
        //         "status": "FILLED",
        //         "timeInForce": "GTT",
        //         "reduceOnly": false,
        //         "orderFlags": "64",
        //         "goodTilBlockTime": "2025-07-28T12:07:33.000Z",
        //         "createdAtHeight": "45058325",
        //         "clientMetadata": "2",
        //         "updatedAt": "2025-07-28T12:06:35.330Z",
        //         "updatedAtHeight": "45058326",
        //         "postOnly": false,
        //         "ticker": "BTC-USD",
        //         "subaccountNumber": 0
        //     }
        // ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    /**
     * @method
     * @name dydx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.dydx.xyz/indexer-client/http#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const request: Dict = {
            'status': 'OPEN', // ['OPEN', 'FILLED', 'CANCELED', 'BEST_EFFORT_CANCELED', 'UNTRIGGERED', 'BEST_EFFORT_OPENED']
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    /**
     * @method
     * @name dydx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const request: Dict = {
            'status': 'FILLED', // ['OPEN', 'FILLED', 'CANCELED', 'BEST_EFFORT_CANCELED', 'UNTRIGGERED', 'BEST_EFFORT_OPENED']
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        // {
        //     "market": "BTC-USD",
        //     "status": "OPEN",
        //     "side": "SHORT",
        //     "size": "-0.407",
        //     "maxSize": "-0.009",
        //     "entryPrice": "118692.04840909090909090909",
        //     "exitPrice": "119526.565625",
        //     "realizedPnl": "476.42665909090909090909088",
        //     "unrealizedPnl": "-57.26681734000000000000037",
        //     "createdAt": "2025-07-14T07:53:55.631Z",
        //     "createdAtHeight": "44140908",
        //     "closedAt": null,
        //     "sumOpen": "0.44",
        //     "sumClose": "0.032",
        //     "netFunding": "503.13121",
        //     "subaccountNumber": 0
        // }
        //
        const marketId = this.safeString (position, 'market');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower (position, 'side');
        let quantity = this.safeString (position, 'size');
        if (side !== 'long') {
            quantity = Precise.stringMul ('-1', quantity);
        }
        const timestamp = this.parse8601 (this.safeString (position, 'createdAt'));
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnl'),
            'side': side,
            'contracts': this.parseNumber (quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }

    /**
     * @method
     * @name dydx#fetchPosition
     * @description fetch data on an open position
     * @see https://docs.dydx.xyz/indexer-client/http#list-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPosition (symbol: string, params = {}) {
        const positions = await this.fetchPositions ([ symbol ], params);
        return this.safeDict (positions, 0, {}) as Position;
    }

    /**
     * @method
     * @name dydx#fetchPositions
     * @description fetch all open positions
     * @see https://docs.dydx.xyz/indexer-client/http#list-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        let userAddress = undefined;
        let subAccountNumber = undefined;
        [ userAddress, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'address');
        [ subAccountNumber, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'subAccountNumber', '0');
        if (userAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a address parameter inside \'params\' or the wallet address set');
        }
        await this.loadMarkets ();
        const request: Dict = {
            'address': userAddress,
            'subaccountNumber': subAccountNumber,
            'status': 'OPEN', // ['OPEN', 'CLOSED', 'LIQUIDATED']
        };
        const response = await this.indexerGetPerpetualPositions (this.extend (request, params));
        //
        // {
        //     "positions": [
        //         {
        //             "market": "BTC-USD",
        //             "status": "OPEN",
        //             "side": "SHORT",
        //             "size": "-0.407",
        //             "maxSize": "-0.009",
        //             "entryPrice": "118692.04840909090909090909",
        //             "exitPrice": "119526.565625",
        //             "realizedPnl": "476.42665909090909090909088",
        //             "unrealizedPnl": "-57.26681734000000000000037",
        //             "createdAt": "2025-07-14T07:53:55.631Z",
        //             "createdAtHeight": "44140908",
        //             "closedAt": null,
        //             "sumOpen": "0.44",
        //             "sumClose": "0.032",
        //             "netFunding": "503.13121",
        //             "subaccountNumber": 0
        //         }
        //     ]
        // }
        //
        const rows = this.safeList (response, 'positions', []);
        return this.parsePositions (rows, symbols);
    }

    /**
     * @method
     * @name dydx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.dydx.xyz/indexer-client/http#get-perpetual-market-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'market': market['id'],
        };
        const response = await this.indexerGetOrderbooksPerpetualMarketMarket (this.extend (request, params));
        //
        // {
        //     "bids": [
        //         {
        //             "price": "118267",
        //             "size": "0.3182"
        //         }
        //     ],
        //     "asks": [
        //         {
        //             "price": "118485",
        //             "size": "0.0001"
        //         }
        //     ]
        // }
        //
        return this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'price', 'size');
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const pathWithParams = this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][section]);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        if (section === 'indexer') {
            url += '/' + pathWithParams;
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //
        const success = this.safeBool (response, 'success');
        const errorCode = this.safeString (response, 'code');
        if (!success) {
            const feedback = this.id + ' ' + this.json (response);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        return undefined;
    }

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }
}
