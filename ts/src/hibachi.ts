
// ---------------------------------------------------------------------------

import Exchange from './abstract/hibachi.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Balances, Currencies, Dict, Market, Str, Ticker, Trade, Int, Num, OrderSide, OrderType, OrderBook, TradingFees, Transaction, DepositAddress, OHLCV, Order, LedgerEntry, Currency, int } from './base/types.js';
import { ecdsa, hmac } from './base/functions/crypto.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { Precise } from './base/Precise.js';
import { ExchangeError } from './base/errors.js';

// ---------------------------------------------------------------------------

/**
 * @class hibachi
 * @augments Exchange
 */
export default class hibachi extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'hibachi',
            'name': 'Hibachi',
            'countries': [ 'US' ],
            'rateLimit': 100,
            'userAgent': this.userAgents['chrome'],
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
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
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTradingLimits': false,
                'fetchTransactions': 'emulated',
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1min',
                '5m': '5min',
                '15m': '15min',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/1e2179d0-b6a8-44a0-b466-66103ae2de9c',
                'api': {
                    'public': 'https://data-api.hibachi.xyz',
                    'private': 'https://api.hibachi.xyz',
                },
                'www': 'https://www.hibachi.xyz/',
            },
            'api': {
                'public': {
                    'get': {
                        'market/exchange-info': 1,
                        'market/data/trades': 1,
                        'market/data/prices': 1,
                        'market/data/stats': 1,
                        'market/data/klines': 1,
                        'market/data/orderbook': 1,
                    },
                },
                'private': {
                    'get': {
                        'capital/deposit-info': 1,
                        'capital/history': 1,
                        'trade/account/trading_history': 1,
                        'trade/account/info': 1,
                        'trade/order': 1,
                        'trade/account/trades': 1,
                        'trade/orders': 1,
                    },
                    'put': {
                        'trade/order': 1,
                    },
                    'delete': {
                        'trade/order': 1,
                    },
                    'post': {
                        'trade/order': 1,
                        'capital/withdraw': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
                'accountId': true,
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0000'),
                    'taker': this.parseNumber ('0.0002'),
                },
            },
            'options': {
            },
            'features': {
                'default': {
                    'sandbox': false,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerPriceType': undefined,
                        'triggerDirection': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': false,
                            'FOK': false,
                            'PO': false,
                            'GTD': false,
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': undefined,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': undefined,
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': undefined,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
                'future': {
                    'linear': {
                        'extends': 'default',
                    },
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

    parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'symbol');
        const numericId = this.safeNumber (market, 'id');
        const marketType = 'swap';
        const baseId = this.safeString (market, 'underlyingSymbol');
        const quoteId = this.safeString (market, 'settlementSymbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settleId: Str = this.safeString (market, 'settlementSymbol');
        const settle: Str = this.safeCurrencyCode (settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const created = this.safeInteger (market, 'marketCreationTimestamp') * 1000;
        return {
            'id': marketId,
            'numericId': numericId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeString (market, 'status') === 'LIVE',
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'underlyingDecimals'))),
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
                    'min': this.safeNumber (market, 'minNotional'),
                    'max': undefined,
                },
            },
            'created': created,
            'info': market,
        };
    }

    /**
     * @method
     * @name hibachi#fetchMarkets
     * @description retrieves data on all markets for hibachi
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetMarketExchangeInfo (params);
        // {
        //     "displayName": "ETH/USDT Perps",
        //     "id": 1,
        //     "maintenanceFactorForPositions": "0.030000",
        //     "marketCloseTimestamp": null,
        //     "marketOpenTimestamp": null,
        //     "minNotional": "1",
        //     "minOrderSize": "0.000000001",
        //     "orderbookGranularities": [
        //         "0.01",
        //         "0.1",
        //         "1",
        //         "10"
        //     ],
        //     "riskFactorForOrders": "0.066667",
        //     "riskFactorForPositions": "0.030000",
        //     "settlementDecimals": 6,
        //     "settlementSymbol": "USDT",
        //     "status": "LIVE",
        //     "stepSize": "0.000000001",
        //     "symbol": "ETH/USDT-P",
        //     "tickSize": "0.000001",
        //     "underlyingDecimals": 9,
        //     "underlyingSymbol": "ETH"
        // },
        const rows = this.safeList (response, 'futureContracts');
        return this.parseMarkets (rows);
    }

    /**
     * @method
     * @name hibachi#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        // Hibachi only supports USDT on Arbitrum at this time
        // We don't have an API endpoint to expose this information yet
        const result: Dict = {};
        const networks: Dict = {};
        const networkId = 'ARBITRUM';
        networks[networkId] = {
            'id': networkId,
            'network': networkId,
            'limits': {
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'active': undefined,
            'deposit': undefined,
            'withdraw': undefined,
            'info': {},
        };
        const code = this.safeCurrencyCode ('USDT');
        result[code] = this.safeCurrencyStructure ({
            'id': 'USDT',
            'name': 'USDT',
            'type': 'fiat',
            'code': code,
            'precision': this.parseNumber ('0.000001'),
            'active': true,
            'fee': undefined,
            'networks': networks,
            'deposit': true,
            'withdraw': true,
            'limits': {
                'deposit': {
                    'min': undefined,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': {},
        });
        return result;
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        // Hibachi only supports USDT on Arbitrum at this time
        const code = this.safeCurrencyCode ('USDT');
        const account = this.account ();
        account['total'] = this.safeString (response, 'balance');
        account['free'] = this.safeString (response, 'maximalWithdraw');
        result[code] = account;
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name hibachi#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        this.checkRequiredCredentials ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.privateGetTradeAccountInfo (this.extend (request, params));
        //
        // {
        //     assets: [ { quantity: '3.000000', symbol: 'USDT' } ],
        //     balance: '3.000000',
        //     maximalWithdraw: '3.000000',
        //     numFreeTransfersRemaining: '100',
        //     positions: [],
        //     totalOrderNotional: '0.000000',
        //     totalPositionNotional: '0.000000',
        //     totalUnrealizedFundingPnl: '0.000000',
        //     totalUnrealizedPnl: '0.000000',
        //     totalUnrealizedTradingPnl: '0.000000',
        //     tradeMakerFeeRate: '0.00000000',
        //     tradeTakerFeeRate: '0.00020000'
        // }
        //
        return this.parseBalance (response);
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const prices = this.safeDict (ticker, 'prices');
        const stats = this.safeDict (ticker, 'stats');
        const bid = this.safeFloat (prices, 'bidPrice');
        const ask = this.safeFloat (prices, 'askPrice');
        const last = this.safeFloat (prices, 'tradePrice');
        const high = this.safeFloat (stats, 'high24h');
        const low = this.safeFloat (stats, 'low24h');
        const volume = this.safeFloat (stats, 'volume24h');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': undefined,
            'datetime': undefined,
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': high,
            'low': low,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': volume,
            'info': ticker,
        }, market);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        // public fetchTrades:
        //      {
        //          "price": "3512.431902",
        //          "quantity": "1.414780098",
        //          "takerSide": "Buy",
        //          "timestamp": 1712692147
        //      }
        //
        // private fetchMyTrades:
        //      {
        //          "askAccountId": 221,
        //          "askOrderId": 589168494921909200,
        //          "bidAccountId": 132,
        //          "bidOrderId": 589168494829895700,
        //          "fee": "0.000477",
        //          "id": 199511136,
        //          "orderType": "MARKET",
        //          "price": "119257.90000",
        //          "quantity": "0.0000200000",
        //          "realizedPnl": "-0.000352",
        //          "side": "Sell",
        //          "symbol": "BTC/USDT-P",
        //          "timestamp": 1752543391
        //      }
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const id = this.safeString (trade, 'id');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        const timestamp = this.safeInteger (trade, 'timestamp') * 1000;
        const cost = Precise.stringMul (price, amount);
        let side = undefined;
        let fee = undefined;
        let orderType = undefined;
        let orderId = undefined;
        let takerOrMaker = undefined;
        if (id === undefined) {
            // public trades
            side = this.safeStringLower (trade, 'takerSide');
            takerOrMaker = 'taker';
        } else {
            // private trades
            side = this.safeStringLower (trade, 'side');
            fee = { 'cost': this.safeString (trade, 'fee'), 'currency': 'USDT' };
            orderType = this.safeStringLower (trade, 'orderType');
            if (side === 'buy') {
                orderId = this.safeString (trade, 'bidOrderId');
            } else {
                orderId = this.safeString (trade, 'askOrderId');
            }
        }
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': orderId,
            'takerOrMaker': takerOrMaker,
            'type': orderType,
            'fee': fee,
            'info': trade,
        }, market);
    }

    /**
     * @method
     * @name hibachi#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-doc.hibachi.xyz/#86a53bc1-d3bb-4b93-8a11-7034d4698caa
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
     * @param {object} [params] extra parameters specific to the hibachi api endpoint
     * @returns {object[]} a list of recent [trade structures]
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDataTrades (this.extend (request, params));
        //
        // {
        //     "trades": [
        //         {
        //             "price": "111091.38352",
        //             "quantity": "0.0090090093",
        //             "takerSide": "Buy",
        //             "timestamp": 1752095479
        //         },
        //     ]
        // }
        //
        const trades = this.safeList (response, 'trades', []);
        return this.parseTrades (trades, market);
    }

    /**
     * @method
     * @name hibachi#fetchTicker
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @description fetches a price ticker and the related information for the past 24h
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the hibachi api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: Str, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const pricesResponse = await this.publicGetMarketDataPrices (this.extend (request, params));
        // {
        //     "askPrice": "3514.650296",
        //     "bidPrice": "3513.596112",
        //     "fundingRateEstimation": {
        //         "estimatedFundingRate": "0.000001",
        //         "nextFundingTimestamp": 1712707200
        //     },
        //     "markPrice": "3514.288858",
        //     "spotPrice": "3514.715000",
        //     "symbol": "ETH/USDT-P",
        //     "tradePrice": "2372.746570"
        // }
        const statsResponse = await this.publicGetMarketDataStats (this.extend (request, params));
        // {
        //     "high24h": "3819.507827",
        //     "low24h": "3754.474162",
        //     "symbol": "ETH/USDT-P",
        //     "volume24h": "23554.858590416"
        // }
        const ticker = {
            'prices': pricesResponse,
            'stats': statsResponse,
        };
        return this.parseTicker (ticker, market);
    }

    parseOrderStatus (status: string): string {
        const statuses: Dict = {
            'PENDING': 'open',
            'CHILD_PENDING': 'open',
            'SCHEDULED_TWAP': 'open',
            'PLACED': 'open',
            'PARTIALLY_FILLED': 'open',
            'FILLED': 'closed',
            'CANCELLED': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const status = this.safeString (order, 'status');
        const type = this.safeStringLower (order, 'orderType');
        const price = this.safeString (order, 'price');
        const rawSide = this.safeString (order, 'side');
        let side = undefined;
        if (rawSide === 'BID') {
            side = 'buy';
        } else if (rawSide === 'ASK') {
            side = 'sell';
        }
        const amount = this.safeString (order, 'totalQuantity');
        const remaining = this.safeString (order, 'availableQuantity');
        const totalQuantity = this.safeString (order, 'totalQuantity');
        const availableQuantity = this.safeString (order, 'availableQuantity');
        let filled = undefined;
        if (totalQuantity !== undefined && availableQuantity !== undefined) {
            filled = Precise.stringSub (totalQuantity, availableQuantity);
        }
        let timeInForce = 'GTC';
        const orderFlags = this.safeValue (order, 'orderFlags');
        let postOnly = false;
        let reduceOnly = false;
        if (orderFlags === 'POST_ONLY') {
            timeInForce = 'PO';
            postOnly = true;
        } else if (orderFlags === 'IOC') {
            timeInForce = 'IOC';
        } else if (orderFlags === 'REDUCE_ONLY') {
            reduceOnly = true;
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': undefined,
            'datetime': undefined,
            'timestamp': undefined,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'status': this.parseOrderStatus (status),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'reduceOnly': reduceOnly,
            'postOnly': postOnly,
            'triggerPrice': this.safeNumber (order, 'triggerPrice'),
        }, market);
    }

    /**
     * @method
     * @name hibachi#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-doc.hibachi.xyz/#096a8854-b918-4de8-8731-b2a28d26b96d
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'orderId': id,
            'accountId': this.accountId,
        };
        const response = await this.privateGetTradeOrder (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name hibachi#fetchTradingFees
     * @description fetch the trading fee
     * @param params extra parameters
     * @returns {object} a map of market symbols to [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        // We currently don't have market-specific trade fees. We will fetch from exchange-info for now
        const exchangeInfo = await this.publicGetMarketExchangeInfo (params);
        //     "feeConfig": {
        //         "depositFees": "0.004498",
        //         "instantWithdrawDstPublicKey": "a4fff986badd3b58ead09cc617a82ff1b5b77b98d560baa27fbcffa4c08610b6372f362f3e8e530291f24251f2c332d958bf776c88ae4370380eee943cddf859",
        //         "instantWithdrawalFees": [
        //             [
        //                 1000,
        //                 0.002
        //             ],
        //             [
        //                 100,
        //                 0.004
        //             ],
        //             [
        //                 50,
        //                 0.005
        //             ],
        //             [
        //                 20,
        //                 0.01
        //             ],
        //             [
        //                 5,
        //                 0.02
        //             ]
        //         ],
        //         "tradeMakerFeeRate": "0.00000000",
        //         "tradeTakerFeeRate": "0.00020000",
        //         "transferFeeRate": "0.00010000",
        //         "withdrawalFees": "0.011995"
        //    },
        const feeConfig = this.safeDict (exchangeInfo, 'feeConfig');
        const makerFeeRate = this.safeNumber (feeConfig, 'tradeMakerFeeRate');
        const takerFeeRate = this.safeNumber (feeConfig, 'tradeTakerFeeRate');
        const result: Dict = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = {
                'info': feeConfig,
                'symbol': symbol,
                'maker': makerFeeRate,
                'taker': takerFeeRate,
                'percentage': true,
            };
        }
        return result;
    }

    orderMessage (market, nonce: number, feeRate: number, type: OrderType, side: OrderSide, amount: number, price: Num = undefined) {
        let sideInternal = 0;
        if (side === 'sell') {
            sideInternal = 0;
        } else if (side === 'buy') {
            sideInternal = 1;
        }
        // Converting them to internal representation:
        // - Quantity: Internal = External * (10^underlyingDecimals)
        // - Price: Internal = External * (2^32) * (10^(settlementDecimals-underlyingDecimals))
        // - FeeRate: Internal = External * (10^8)
        const amountStr = amount.toString ();
        const feeRateStr = feeRate.toString ();
        const info = this.safeDict (market, 'info');
        const underlying = '1e' + this.safeNumber (info, 'underlyingDecimals').toString ();
        const settlement = '1e' + this.safeNumber (info, 'settlementDecimals').toString ();
        const pOne = new Precise ('1');
        const pFeeRateFactor = new Precise ('100000000'); // 10^8
        const pPriceFactor = new Precise ('4294967296'); // 2^32
        const pAmount = new Precise (amountStr);
        const pFeeRate = new Precise (feeRateStr);
        const pUnderlying = new Precise (underlying);
        const pSettlement = new Precise (settlement);
        const quantityInternal = pAmount.mul (pUnderlying).div (pOne, 0);
        const feeRateInternal = pFeeRate.mul (pFeeRateFactor).div (pOne, 0);
        // Encoding
        const encodedNonce = this.base16ToBinary (this.intToBase16 (nonce).padStart (16, '0'));
        const encodedMarketId = this.base16ToBinary (this.intToBase16 (market.numericId).padStart (8, '0'));
        const encodedQuantity = this.base16ToBinary (this.intToBase16 (this.parseToInt (quantityInternal.toString ())).padStart (16, '0'));
        const encodedSide = this.base16ToBinary (this.intToBase16 (sideInternal).padStart (8, '0'));
        const encodedFeeRate = this.base16ToBinary (this.intToBase16 (this.parseToInt (feeRateInternal.toString ())).padStart (16, '0'));
        let encodedPrice = this.binaryConcat ();
        if (type === 'limit') {
            const priceStr = price.toString ();
            const pPrice = new Precise (priceStr);
            const priceInternal = pPrice.mul (pPriceFactor).mul (pSettlement).div (pUnderlying).div (pOne, 0);
            encodedPrice = this.base16ToBinary (this.intToBase16 (this.parseToInt (priceInternal.toString ())).padStart (16, '0'));
        }
        const message = this.binaryConcat (encodedNonce, encodedMarketId, encodedQuantity, encodedSide, encodedPrice, encodedFeeRate);
        return message;
    }

    /**
     * @method
     * @name hibachi#createOrder
     * @description create a trade order
     * @see https://api-doc.hibachi.xyz/#00f6d5ad-5275-41cb-a1a8-19ed5d142124
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const nonce = this.nonce ();
        const feeRate = Math.max (market.taker, market.maker);
        let sideInternal = '';
        if (side === 'sell') {
            sideInternal = 'ASK';
        } else if (side === 'buy') {
            sideInternal = 'BID';
        }
        let priceInternal = '';
        if (price) {
            priceInternal = price.toString ();
        }
        const message = this.orderMessage (market, nonce, feeRate, type, side, amount, price);
        const signature = this.signMessage (message, this.privateKey);
        const request = {
            'accountId': this.accountId,
            'symbol': market.id,
            'nonce': nonce,
            'side': sideInternal,
            'orderType': type.toUpperCase (),
            'quantity': amount.toString (),
            'price': priceInternal,
            'signature': signature,
            'maxFeesPercent': feeRate.toString (),
        };
        const response = await this.privatePostTradeOrder (this.extend (request, params));
        //
        // {
        //     "orderId": "578721673790138368"
        // }
        //
        return this.safeOrder ({
            'id': response.orderId,
            'status': 'pending',
        });
    }

    /**
     * @method
     * @name hibachi#editOrder
     * @description edit a limit order that is not matched
     * @see https://api-doc.hibachi.xyz/#94d2cdaf-1c71-440f-a981-da1112824810
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell', should stay the same with original side
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async editOrder (id: string, symbol: string, type:OrderType, side: OrderSide, amount: Num = undefined, price: Num = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const nonce = this.nonce ();
        const feeRate = Math.max (market.taker, market.maker);
        const message = this.orderMessage (market, nonce, feeRate, type, side, amount, price);
        const signature = this.signMessage (message, this.privateKey);
        const request = {
            'accountId': this.accountId,
            'orderId': id,
            'nonce': nonce,
            'updatedQuantity': amount.toString (),
            'updatedPrice': price.toString (),
            'maxFeesPercent': feeRate.toString (),
            'signature': signature,
        };
        await this.privatePutTradeOrder (this.extend (request, params));
        // At this time the response body is empty. A 200 response means the update request is accepted and sent to process
        //
        // {}
        //
        return this.safeOrder ({
            'id': id,
            'status': 'pending',
        });
    }

    /**
     * @method
     * @name hibachi#cancelOrder
     * @see https://api-doc.hibachi.xyz/#e99c4f48-e610-4b7c-b7f6-1b4bb7af0271
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol is unused
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        this.checkRequiredCredentials ();
        const message = this.base16ToBinary (this.intToBase16 (this.parseToInt (id)).padStart (16, '0'));
        const signature = this.signMessage (message, this.privateKey);
        const request: Dict = {
            'accountId': this.accountId,
            'orderId': id,
            'signature': signature,
        };
        await this.privateDeleteTradeOrder (this.extend (request, params));
        // At this time the response body is empty. A 200 response means the cancel request is accepted and sent to cancel
        //
        // {}
        //
        return this.safeOrder ({
            'id': id,
            'status': 'canceled',
        });
    }

    withdrawMessage (amount: number, maxFees: number, address: string) {
        // Converting them to internal representation:
        // - Quantity: Internal = External * (10^6)
        // - maxFees: Internal = External * (10^6)
        // We only have USDT as our currency as this time
        const USDTAssetId = 1;
        const pUSDTFactor = new Precise ('1000000');
        const amountStr = amount.toString ();
        const maxFeesStr = maxFees.toString ();
        const pOne = new Precise ('1');
        const pAmount = new Precise (amountStr);
        const pMaxFees = new Precise (maxFeesStr);
        const quantityInternal = pAmount.mul (pUSDTFactor).div (pOne, 0);
        const maxFeesInternal = pMaxFees.mul (pUSDTFactor).div (pOne, 0);
        // Encoding
        const encodedAssetId = this.base16ToBinary (this.intToBase16 (USDTAssetId).padStart (8, '0'));
        const encodedQuantity = this.base16ToBinary (this.intToBase16 (this.parseToInt (quantityInternal.toString ())).padStart (16, '0'));
        const encodedMaxFees = this.base16ToBinary (this.intToBase16 (this.parseToInt (maxFeesInternal.toString ())).padStart (16, '0'));
        const encodedAddress = this.base16ToBinary (address);
        const message = this.binaryConcat (encodedAssetId, encodedQuantity, encodedMaxFees, encodedAddress);
        return message;
    }

    /**
     * @method
     * @name hibachi#withdraw
     * @description make a withdrawal
     * @see https://api-doc.hibachi.xyz/#6421625d-3e45-45fa-be9b-d2a0e780c090
     * @param {string} code unified currency code, only support USDT
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        this.checkRequiredCredentials ();
        const withdrawAddress = address.slice (-40);
        // Get the withdraw fees
        const exchangeInfo = await this.publicGetMarketExchangeInfo (params);
        // {
        //      "feeConfig": {
        //          "depositFees": "0.004518",
        //          "tradeMakerFeeRate": "0.00000000",
        //          "tradeTakerFeeRate": "0.00020000",
        //          "transferFeeRate": "0.00010000",
        //          "withdrawalFees": "0.012050"
        //    },
        // }
        const feeConfig = this.safeDict (exchangeInfo, 'feeConfig');
        const maxFees = this.safeNumber (feeConfig, 'withdrawalFees');
        // Generate the signature
        const message = this.withdrawMessage (amount, maxFees, withdrawAddress);
        const signature = this.signMessage (message, this.privateKey);
        const request = {
            'accountId': this.accountId,
            'coin': 'USDT',
            'network': 'ARBITRUM',
            'withdrawAddress': withdrawAddress,
            'selfWithdrawal': false,
            'quantity': amount.toString (),
            'maxFees': maxFees.toString (),
            'signature': signature,
        };
        await this.privatePostCapitalWithdraw (this.extend (request, params));
        // At this time the response body is empty. A 200 response means the withdraw request is accepted and sent to process
        //
        // {}
        //
        return {
            'info': undefined,
            'id': undefined,
            'txid': undefined,
            'timestamp': this.milliseconds (),
            'datetime': undefined,
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': withdrawAddress,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': 'pending',
            'fee': { 'currency': 'USDT', 'cost': maxFees },
            'network': 'ARBITRUM',
            'updated': undefined,
            'comment': undefined,
            'internal': undefined,
        } as Transaction;
    }

    nonce () {
        return this.milliseconds ();
    }

    signMessage (message, privateKey) {
        if (privateKey.length === 44) {
            // For Exchange Managed account, the key length is 44 and we use HMAC to sign the message
            return hmac (message, privateKey, sha256);
        } else {
            // For Trustless account, the key length is 66 including '0x' and we use ECDSA to sign the message
            const hash = this.hash (message, sha256, 'hex');
            const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
            const r = signature['r'];
            const s = signature['s'];
            const v = signature['v'];
            return r.padStart (64, '0') + s.padStart (64, '0') + v.toString (16).padStart (2, '0');
        }
    }

    /**
     * @method
     * @name hibachi#fetchOrderBook
     * @description fetches the state of the open orders on the orderbook
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] currently unused
     * @param {object} [params] extra parameters to be passed -- see documentation link above
     * @returns {object} A dictionary containg [orderbook information]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market: Market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketDataOrderbook (this.extend (request, params));
        const formattedResponse = {};
        formattedResponse['ask'] = this.safeValue (this.safeValue (response, 'ask'), 'levels');
        formattedResponse['bid'] = this.safeValue (this.safeValue (response, 'bid'), 'levels');
        // {
        //     "ask": {
        //         "endPrice": "3512.63",
        //         "levels": [
        //             {
        //                 "price": "3511.93",
        //                 "quantity": "0.284772482"
        //             },
        //             {
        //                 "price": "3512.28",
        //                 "quantity": "0.569544964"
        //             },
        //             {
        //                 "price": "3512.63",
        //                 "quantity": "0.854317446"
        //             }
        //         ],
        //         "startPrice": "3511.93"
        //     },
        //     "bid": {
        //         "endPrice": "3510.87",
        //         "levels": [
        //             {
        //                 "price": "3515.39",
        //                 "quantity": "2.345153070"
        //             },
        //             {
        //                 "price": "3511.22",
        //                 "quantity": "0.284772482"
        //             },
        //             {
        //                 "price": "3510.87",
        //                 "quantity": "0.569544964"
        //             }
        //         ],
        //         "startPrice": "3515.39"
        //     }
        // }
        return this.parseOrderBook (formattedResponse, symbol, this.milliseconds (), 'bid', 'ask', 'price', 'quantity');
    }

    /**
     * @method
     * @name hibachi#fetchMyTrades
     * @see https://api-doc.hibachi.xyz/#0adbf143-189f-40e0-afdc-88af4cba3c79
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'accountId': this.accountId };
        const response = await this.privateGetTradeAccountTrades (this.extend (request, params));
        //
        // {
        //     "trades": [
        //         {
        //             "askAccountId": 221,
        //             "askOrderId": 589168494921909200,
        //             "bidAccountId": 132,
        //             "bidOrderId": 589168494829895700,
        //             "fee": "0.000477",
        //             "id": 199511136,
        //             "orderType": "MARKET",
        //             "price": "119257.90000",
        //             "quantity": "0.0000200000",
        //             "realizedPnl": "-0.000352",
        //             "side": "Sell",
        //             "symbol": "BTC/USDT-P",
        //             "timestamp": 1752543391
        //         }
        //     ]
        // }
        //
        const trades = this.safeList (response, 'trades');
        return this.parseTrades (trades, market, since, limit, params);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        // [
        //     {
        //       "close": "3704.751036",
        //       "high": "3716.530378",
        //       "interval": "1h",
        //       "low": "3699.627883",
        //       "open": "3716.406894",
        //       "timestamp": 1712628000,
        //       "volumeNotional": "1637355.846362"
        //     }
        //   ]
        //
        return [
            this.safeInteger (ohlcv, 'timestamp') * 1000,
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volumeNotional'),
        ];
    }

    /**
     * @method
     * @name hibachi#fetchOpenOrders
     * @description fetches all current open orders
     * @see https://api-doc.hibachi.xyz/#3243f8a0-086c-44c5-ab8a-71bbb7bab403
     * @param {string} [symbol] unified market symbol to filter by
     * @param {int} [since] milisecond timestamp of the earliest order
     * @param {int} [limit] the maximum number of open orders to return
     * @param {object} [params] extra parameters
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'accountId': this.accountId,
        };
        const response = await this.privateGetTradeOrders (request);
        // [
        //     {
        //         "accountId": 12452,
        //         "availableQuantity": "0.0000230769",
        //         "contractId": 2,
        //         "creationTime": 1752684501,
        //         "orderId": "589205486123876352",
        //         "orderType": "LIMIT",
        //         "price": "130000.00000",
        //         "side": "ASK",
        //         "status": "PLACED",
        //         "symbol": "BTC/USDT-P",
        //         "totalQuantity": "0.0000230769"
        //     },
        //     {
        //         "accountId": 12452,
        //         "availableQuantity": "1.234000000",
        //         "contractId": 1,
        //         "creationTime": 1752240682,
        //         "orderId": "589089141754429441",
        //         "orderType": "LIMIT",
        //         "price": "1.234000",
        //         "side": "BID",
        //         "status": "PLACED",
        //         "symbol": "ETH/USDT-P",
        //         "totalQuantity": "1.234000000"
        //     }
        // ]
        return this.parseOrders (response, market, since, limit, params);
    }

    /**
     * @name hibachi#fetchOHLCV
     * @see  https://api-doc.hibachi.xyz/#4f0eacec-c61e-4d51-afb3-23c51c2c6bac
     * @description fetches historical candlestick data containing the close, high, low, open prices, interval and the volumeNotional
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        timeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'symbol': market['id'],
            'interval': timeframe,
        };
        if (since !== undefined) {
            request['fromMs'] = since;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'until');
        if (until !== undefined) {
            request['toMs'] = until;
        }
        const response = await this.publicGetMarketDataKlines (this.extend (request, params));
        //
        // [
        //     {
        //       "close": "3704.751036",
        //       "high": "3716.530378",
        //       "interval": "1h",
        //       "low": "3699.627883",
        //       "open": "3716.406894",
        //       "timestamp": 1712628000,
        //       "volumeNotional": "1637355.846362"
        //     }
        //   ]
        //
        const klines = this.safeList (response, 'klines', []);
        return this.parseOHLCVs (klines, market, timeframe, since, limit);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        headers = {};
        if (method === 'GET') {
            const request = this.omit (params, this.extractParams (path));
            const query = this.urlencode (request);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            headers['Content-Type'] = 'application/json';
            body = this.json (params);
        }
        if (api === 'private') {
            headers['Authorization'] = this.apiKey;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        if ('status' in response) {
            //
            //     {"errorCode":4,"message":"Invalid input: Invalid quantity: 0","status":"failed"}
            //
            const status = this.safeString (response, 'status');
            if (status === 'failed') {
                const code = this.safeString (response, 'errorCode');
                const feedback = this.id + ' ' + body;
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                const message = this.safeString (response, 'message');
                this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }

    derivePublicKeyFromPrivate () {
        this.checkRequiredCredentials ();
        return secp256k1.getPublicKey (this.privateKey.slice (-64), false).slice (1, 65);
    }

    parseTransactionType (type) {
        const types: Dict = {
            'deposit': 'transaction',
            'withdrawal': 'transaction',
            'transfer-in': 'transfer',
            'transfer-out': 'transfer',
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status) {
        const statuses: Dict = {
            'pending': 'pending',
            'claimable': 'pending',
            'completed': 'ok',
            'failed': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
        const transactionType = this.safeString (item, 'transactionType');
        let timestamp = undefined;
        let type = undefined;
        let direction = undefined;
        let amount = undefined;
        let fee = undefined;
        let referenceId = undefined;
        let referenceAccount = undefined;
        let status = undefined;
        if (transactionType === undefined) {
            // response from TradeAccountTradingHistory
            timestamp = this.safeInteger (item, 'timestamp') * 1000;
            type = 'trade';
            let amountStr = this.safeString (item, 'realizedPnl');
            if (Precise.stringLt (amountStr, '0')) {
                direction = 'out';
                amountStr = Precise.stringNeg (amountStr);
            } else {
                direction = 'in';
            }
            amount = this.parseNumber (amountStr);
            fee = { 'currency': 'USDT', 'cost': this.safeNumber (item, 'fee') };
            status = 'ok';
        } else {
            // response from CapitalHistory
            timestamp = this.safeInteger (item, 'timestampSec') * 1000;
            amount = this.safeNumber (item, 'quantity');
            direction = (transactionType === 'deposit' || transactionType === 'transfer-in') ? 'in' : 'out';
            type = this.parseTransactionType (transactionType);
            status = this.parseTransactionStatus (this.safeString (item, 'status'));
            if (transactionType === 'transfer-in') {
                referenceAccount = this.safeString (item, 'srcAccountId');
            } else if (transactionType === 'transfer-out') {
                referenceAccount = this.safeString (item, 'receivingAccountId');
            }
            referenceId = this.safeString (item, 'transactionHash');
        }
        return this.safeLedgerEntry ({
            'id': this.safeString (item, 'id'),
            'currency': this.currency ('USDT'),
            'account': this.accountId.toString (),
            'referenceAccount': referenceAccount,
            'referenceId': referenceId,
            'status': status,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'fee': fee,
            'direction': direction,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'type': type,
            'info': item,
        }, currency) as LedgerEntry;
    }

    /**
     * @method
     * @name hibachi#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const currency = this.currency ('USDT');
        const request = { 'accountId': this.accountId };
        const responseCapitalHistory = await this.privateGetCapitalHistory (this.extend (request, params));
        //
        // {
        //     "transactions": [
        //         {
        //             "assetId": 1,
        //             "blockNumber": 358396669,
        //             "chain": "Arbitrum",
        //             "etaTsSec": null,
        //             "id": 358396669,
        //             "quantity": "0.999500",
        //             "status": "pending",
        //             "timestampSec": 1752692872,
        //             "token": "USDT",
        //             "transactionHash": "0x408e48881e0ba77d8638e3fe57bc06bdec513ddaa8b672e0aefa7e22e2f18b5e",
        //             "transactionType": "deposit"
        //         },
        //         {
        //             "assetId": 1,
        //             "etaTsSec": null,
        //             "id": 13116,
        //             "instantWithdrawalChain": null,
        //             "instantWithdrawalToken": null,
        //             "isInstantWithdrawal": false,
        //             "quantity": "0.040000",
        //             "status": "completed",
        //             "timestampSec": 1752542708,
        //             "transactionHash": "0xe89cf90b2408d1a273dc9427654145def102d9449e5e2cfc10690ccffc3d7e28",
        //             "transactionType": "withdrawal",
        //             "withdrawalAddress": "0x23625d5fc6a6e32638d908eb4c3a3415e5121f76"
        //         },
        //         {
        //             "assetId": 1,
        //             "id": 167,
        //             "quantity": "10.000000",
        //             "srcAccountId": 175,
        //             "srcAddress": "0xc2f77ce029438a3fdfe68ddee25991a9fb985a86",
        //             "status": "completed",
        //             "timestampSec": 1732224729,
        //             "transactionType": "transfer-in"
        //         },
        //         {
        //             "assetId": 1,
        //             "id": 170,
        //             "quantity": "10.000000",
        //             "receivingAccountId": 175,
        //             "receivingAddress": "0xc2f77ce029438a3fdfe68ddee25991a9fb985a86",
        //             "status": "completed",
        //             "timestampSec": 1732225631,
        //             "transactionType": "transfer-out"
        //         },
        //     ]
        // }
        //
        const rowsCapitalHistory = this.safeList (responseCapitalHistory, 'transactions');
        const responseTradingHistory = await this.privateGetTradeAccountTradingHistory (this.extend (request, params));
        //
        // {
        //     "tradingHistory": [
        //         {
        //             "eventType": "MARKET",
        //             "fee": "0.000008",
        //             "priceOrFundingRate": "119687.82481",
        //             "quantity": "0.0000003727",
        //             "realizedPnl": "0.004634",
        //             "side": "Sell",
        //             "symbol": "BTC/USDT-P",
        //             "timestamp": 1752522571
        //         },
        //         {
        //             "eventType": "FundingEvent",
        //             "fee": "0",
        //             "priceOrFundingRate": "0.000203",
        //             "quantity": "0.0000003727",
        //             "realizedPnl": "-0.000009067899008751979",
        //             "side": "Long",
        //             "symbol": "BTC/USDT-P",
        //             "timestamp": 1752508800
        //         },
        //     ]
        // }
        //
        const rowsTradingHistory = this.safeList (responseTradingHistory, 'tradingHistory');
        const rows = this.arrayConcat (rowsCapitalHistory, rowsTradingHistory);
        return this.parseLedger (rows, currency, since, limit, params);
    }

    /**
     * @method
     * @name hibachi#fetchDepositAddress
     * @description fetch deposit address for given currency and chain. currently, we have a single EVM address across multiple EVM chains. Note: This method is currently only supported for trustless accounts
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters for API
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        this.checkRequiredCredentials ();
        const publicKey = this.derivePublicKeyFromPrivate ();
        const request = {
            'publicKey': '0x' + this.binaryToBase16 (publicKey),
            'accountId': this.accountId,
        };
        const response = await this.privateGetCapitalDepositInfo (this.extend (request, params));
        // {
        //     "depositAddressEvm": "0x0b95d90b9345dadf1460bd38b9f4bb0d2f4ed788"
        // }
        return {
            'info': response,
            'currency': 'USDT',
            'network': 'ARBITRUM',
            'address': this.safeString (response, 'depositAddressEvm'),
            'tag': undefined,
        };
    }
}
