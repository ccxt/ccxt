
// ---------------------------------------------------------------------------

import Exchange from './abstract/hashkey.js';
import { ArgumentsRequired, BadRequest, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Account, Balances, Bool, Currencies, Currency, Dict, FundingRateHistory, LastPrice, LastPrices, Leverage, LeverageTier, LeverageTiers, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class hashkey
 * @augments Exchange
 */
export default class hashkey extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'hashkey',
            'name': 'HashKey Global',
            'countries': [ 'BM' ], // Bermuda
            'rateLimit': 100,
            'version': 'v1',
            'certified': true,
            'pro': true,
            'hostname': 'https://global.hashkey.com/',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelWithdraw': false,
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
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchCanceledAndClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': true,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': true,
                'fetchLeverageTiers': true,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
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
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true, // emulated for spot markets
                'fetchTradingFees': true, // for spot markets only
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': true,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
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
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api-glb.hashkey.com',
                    'private': 'https://api-glb.hashkey.com',
                },
                'test': {
                    'public': 'https://api-glb.sim.hashkeydev.com',
                    'private': 'https://api-glb.sim.hashkeydev.com',
                },
                'www': 'https://global.hashkey.com/',
                'doc': 'https://hashkeyglobal-apidoc.readme.io/',
                'fees': 'https://support.global.hashkey.com/hc/en-us/articles/13199900083612-HashKey-Global-Fee-Structure',
                'referral': {
                },
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/exchangeInfo': 5, // done
                        'quote/v1/depth': 1, // done
                        'quote/v1/trades': 1, // done
                        'quote/v1/klines': 1, // done
                        'quote/v1/ticker/24hr': 1, // done
                        'quote/v1/ticker/price': 1, // done
                        'quote/v1/ticker/bookTicker': 1, // not unified
                        'quote/v1/depth/merged': 1, // todo ask
                        'quote/v1/markPrice': 1, // not unified todo ask
                        'quote/v1/index': 1, // not unified todo ask
                        'api/v1/futures/fundingRate': 1, // done
                        'api/v1/futures/historyFundingRate': 1, // done
                        'api/v1/ping': 1,
                        'api/v1/time': 1, // done
                    },
                },
                'private': {
                    'get': {
                        'api/v1/spot/order': 1, // done
                        'api/v1/spot/openOrders': 1, // done
                        'api/v1/spot/tradeOrders': 5, // done
                        'api/v1/futures/leverage': 1, // done
                        'api/v1/futures/order': 1, // done
                        'api/v1/futures/openOrders': 1, // done
                        'api/v1/futures/userTrades': 1, // done
                        'api/v1/futures/positions': 1, // done
                        'api/v1/futures/historyOrders': 1, // done
                        'api/v1/futures/balance': 1, // update fetchBalance
                        'api/v1/futures/liquidationAssignStatus': 1, // todo ask
                        'api/v1/futures/riskLimit': 1, // not unified
                        'api/v1/futures/commissionRate': 1, // done
                        'api/v1/futures/getBestOrder': 1,
                        'api/v1/account/vipInfo': 5, // done
                        'api/v1/account': 1, // done
                        'api/v1/account/trades': 5, // done
                        'api/v1/account/type': 5, // done
                        'api/v1/account/checkApiKey': 1, // not unified
                        'api/v1/account/balanceFlow': 5, // done
                        'api/v1/spot/subAccount/openOrders': 1, // update fetchOpenOrders
                        'api/v1/spot/subAccount/tradeOrders': 1, // update fetchCanceledAndClosedOrders
                        'api/v1/subAccount/trades': 1, // update fetchTrades
                        'api/v1/futures/subAccount/openOrders': 1, // update fetchOpenOrders
                        'api/v1/futures/subAccount/historyOrders': 1, // update fetchCanceledAndClosedOrders
                        'api/v1/futures/subAccount/userTrades': 1, // update fetchTrades
                        'api/v1/account/deposit/address': 1, // done
                        'api/v1/account/depositOrders': 1, // done
                        'api/v1/account/withdrawOrders': 1, // done
                    },
                    'post': {
                        'api/v1/userDataStream': 1,
                        'api/v1/spot/orderTest': 1, // done
                        'api/v1/spot/order': 1, // done
                        'api/v1.1/spot/order': 1, // done
                        'api/v1/spot/batchOrders': 5, // todo implement
                        'api/v1/futures/leverage': 1, // done
                        'api/v1/futures/order': 1, // done
                        'api/v1/futures/position/trading-stop': 1,
                        'api/v1/futures/batchOrders': 1,
                        'api/v1/account/assetTransfer': 1, // done
                        'api/v1/account/authAddress': 1, // todo ask about it
                        'api/v1/account/withdraw': 1, // done
                    },
                    'delete': {
                        'api/v1/spot/order': 1, // done
                        'api/v1/spot/openOrders': 5, // done
                        'api/v1/spot/cancelOrderByIds': 5, // done
                        'api/v1/futures/order': 1, // done
                        'api/v1/futures/batchOrders': 1, // done
                        'api/v1/futures/cancelOrderByIds': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    // todo add swap fees
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0012'),
                    'taker': this.parseNumber ('0.0012'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00090') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00085') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.00045') ],
                            [ this.parseNumber ('400000000'), this.parseNumber ('0.00040') ],
                            [ this.parseNumber ('800000000'), this.parseNumber ('0.00035') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.00080') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00070') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00060') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.00040') ],
                            [ this.parseNumber ('200000000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('400000000'), this.parseNumber ('0.00010') ],
                            [ this.parseNumber ('800000000'), this.parseNumber ('0.00') ],
                        ],
                    },
                },
            },
            'options': {
                'recvWindow': undefined,
                'sandboxMode': false,
                'networks': {
                    'BTC': 'BTC',
                    'ERC20': 'ETH',
                    'AVAX': 'AvalancheC',
                    'SOL': 'Solana',
                    'MATIC': 'Polygon',
                    'ATOM': 'Cosmos',
                    'DOT': 'Polkadot',
                    'LTC': 'LTC',
                    'OPTIMISM': 'Optimism',
                    'ARB': 'Arbitrum',
                    'DOGE': 'Dogecoin',
                    'TRC20': 'TRC20',
                },
                'networksById': {
                    'BTC': 'BTC',
                    'Bitcoin': 'BTC',
                    'ETH': 'ERC20',
                    'ERC20': 'ERC20',
                    'AvalancheC': 'AVAX',
                    'AVAX C-Chain': 'AVAX',
                    'Solana': 'SOL',
                    'Cosmos': 'ATOM',
                    'Arbitrum': 'ARB',
                    'Polygon': 'MATIC',
                    'Optimism': 'OPTIMISM',
                    'Polkadot': 'DOT',
                    'LTC': 'LTC',
                    'Litecoin': 'LTC',
                    'Dogecoin': 'DOGE',
                    'Merlin Chain': 'Merlin Chain', // todo check
                    'zkSync': 'zkSync', // todo check
                    'TRC20': 'TRC20',
                    'TON': 'TON', // todo check
                    'BSC(BEP20)': 'BSC',
                    'Klaytn': 'Klaytn', // todo check
                },
                'defaultNetwork': 'ERC20',
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // {"code":-100012,"msg":"Parameter symbol [String] missing!"}
                    // {"code":"0211","msg":"Order not found"}
                    // {"code":"-1141","msg":"Duplicate order"} duplicated clientOrderId
                    // {"code":"0001","msg":"Required field clientOrderId missing or invalid"}
                    // {"code":"0001","msg":"Required field symbol missing or invalid"}
                    // {"code":-100010,"msg":"Invalid Symbols!"}
                    // {"code":"-1004","msg":"Bad request"}
                    // {"code":"-1002","msg":"Unauthorized operation"}
                    // {"code":"-1133","msg":"Order price lower than the minimum"}
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchTime (params = {}): Promise<Int> {
        /**
         * @method
         * @name hashkey#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://hashkeyglobal-apidoc.readme.io/reference/check-server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetApiV1Time (params);
        //
        //     {
        //         "serverTime": 1721661553214
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name hashkey#fetchMarkets
         * @description retrieves data on all markets for the exchange
         * @see https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.symbol] the id of the market to fetch
         * @returns {object[]} an array of objects representing market data
         */
        let symbol: Str = undefined;
        const request: Dict = {};
        [ symbol, params ] = this.handleOptionAndParams (params, 'fetchMarkets', 'symbol');
        if (symbol !== undefined) {
            request['symbol'] = symbol;
        }
        const response = await this.publicGetApiV1ExchangeInfo (this.extend (request, params));
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": "1721661653952",
        //         "brokerFilters": [],
        //         "symbols": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "symbolName": "BTCUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTC",
        //                 "baseAssetName": "BTC",
        //                 "baseAssetPrecision": "0.00001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetName": "USDT",
        //                 "quotePrecision": "0.0000001",
        //                 "retailAllowed": true,
        //                 "piAllowed": true,
        //                 "corporateAllowed": true,
        //                 "omnibusAllowed": true,
        //                 "icebergAllowed": false,
        //                 "isAggregate": false,
        //                 "allowMargin": false,
        //                 "filters": [
        //                     {
        //                         "minPrice": "0.01",
        //                         "maxPrice": "100000.00000000",
        //                         "tickSize": "0.01",
        //                         "filterType": "PRICE_FILTER"
        //                     },
        //                     {
        //                         "minQty": "0.00001",
        //                         "maxQty": "8",
        //                         "stepSize": "0.00001",
        //                         "marketOrderMinQty": "0.00001",
        //                         "marketOrderMaxQty": "4",
        //                         "filterType": "LOT_SIZE"
        //                     },
        //                     {
        //                         "minNotional": "1",
        //                         "filterType": "MIN_NOTIONAL"
        //                     },
        //                     {
        //                         "minAmount": "1",
        //                         "maxAmount": "400000",
        //                         "minBuyPrice": "0",
        //                         "marketOrderMinAmount": "1",
        //                         "marketOrderMaxAmount": "200000",
        //                         "filterType": "TRADE_AMOUNT"
        //                     },
        //                     {
        //                         "maxSellPrice": "0",
        //                         "buyPriceUpRate": "0.1",
        //                         "sellPriceDownRate": "0.1",
        //                         "filterType": "LIMIT_TRADING"
        //                     },
        //                     {
        //                         "buyPriceUpRate": "0.1",
        //                         "sellPriceDownRate": "0.1",
        //                         "filterType": "MARKET_TRADING"
        //                     },
        //                     {
        //                         "noAllowMarketStartTime": "1710485700000",
        //                         "noAllowMarketEndTime": "1710486000000",
        //                         "limitOrderStartTime": "0",
        //                         "limitOrderEndTime": "0",
        //                         "limitMinPrice": "0",
        //                         "limitMaxPrice": "0",
        //                         "filterType": "OPEN_QUOTE"
        //                     }
        //                 ]
        //             }
        //         ],
        //         "options": [],
        //         "contracts": [
        //             {
        //                 "filters": [
        //                     {
        //                         "minPrice": "0.1",
        //                         "maxPrice": "100000.00000000",
        //                         "tickSize": "0.1",
        //                         "filterType": "PRICE_FILTER"
        //                     },
        //                     {
        //                         "minQty": "0.001",
        //                         "maxQty": "10",
        //                         "stepSize": "0.001",
        //                         "marketOrderMinQty": "0",
        //                         "marketOrderMaxQty": "0",
        //                         "filterType": "LOT_SIZE"
        //                     },
        //                     {
        //                         "minNotional": "0",
        //                         "filterType": "MIN_NOTIONAL"
        //                     },
        //                     {
        //                         "maxSellPrice": "999999",
        //                         "buyPriceUpRate": "0.05",
        //                         "sellPriceDownRate": "0.05",
        //                         "maxEntrustNum": 200,
        //                         "maxConditionNum": 200,
        //                         "filterType": "LIMIT_TRADING"
        //                     },
        //                     {
        //                         "buyPriceUpRate": "0.05",
        //                         "sellPriceDownRate": "0.05",
        //                         "filterType": "MARKET_TRADING"
        //                     },
        //                     {
        //                         "noAllowMarketStartTime": "0",
        //                         "noAllowMarketEndTime": "0",
        //                         "limitOrderStartTime": "0",
        //                         "limitOrderEndTime": "0",
        //                         "limitMinPrice": "0",
        //                         "limitMaxPrice": "0",
        //                         "filterType": "OPEN_QUOTE"
        //                     }
        //                 ],
        //                 "exchangeId": "301",
        //                 "symbol": "BTCUSDT-PERPETUAL",
        //                 "symbolName": "BTCUSDT-PERPETUAL",
        //                 "status": "TRADING",
        //                 "baseAsset": "BTCUSDT-PERPETUAL",
        //                 "baseAssetPrecision": "0.001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.1",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "USDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "0.001",
        //                 "underlying": "BTC",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200000722",
        //                         "quantity": "1000.00",
        //                         "initialMargin": "0.10",
        //                         "maintMargin": "0.005",
        //                         "isWhite": false
        //                     },
        //                     {
        //                         "riskLimitId": "200000723",
        //                         "quantity": "2000.00",
        //                         "initialMargin": "0.10",
        //                         "maintMargin": "0.01",
        //                         "isWhite": false
        //                     }
        //                 ]
        //             }
        //         ],
        //         "coins": [
        //            {
        //                 "orgId": "9001",
        //                 "coinId": "BTC",
        //                 "coinName": "BTC",
        //                 "coinFullName": "Bitcoin",
        //                 "allowWithdraw": true,
        //                 "allowDeposit": true,
        //                 "tokenType": "CHAIN_TOKEN",
        //                 "chainTypes": [
        //                     {
        //                         "chainType": "Bitcoin",
        //                         "withdrawFee": "0",
        //                         "minWithdrawQuantity": "0.002",
        //                         "maxWithdrawQuantity": "0",
        //                         "minDepositQuantity": "0.0005",
        //                         "allowDeposit": true,
        //                         "allowWithdraw": true
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        //
        const spotMarkets = this.safeList (response, 'symbols', []);
        const swapMarkets = this.safeList (response, 'contracts', []);
        let markets = this.arrayConcat (spotMarkets, swapMarkets);
        if (this.isEmpty (markets)) {
            markets = [ response ]; // if user provides params.symbol the exchange returns a single object insted of list of objects
        }
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        // spot
        //     {
        //         "symbol": "BTCUSDT",
        //         "symbolName": "BTCUSDT",
        //         "status": "TRADING",
        //         "baseAsset": "BTC",
        //         "baseAssetName": "BTC",
        //         "baseAssetPrecision": "0.00001",
        //         "quoteAsset": "USDT",
        //         "quoteAssetName": "USDT",
        //         "quotePrecision": "0.0000001",
        //         "retailAllowed": true,
        //         "piAllowed": true,
        //         "corporateAllowed": true,
        //         "omnibusAllowed": true,
        //         "icebergAllowed": false,
        //         "isAggregate": false,
        //         "allowMargin": false,
        //         "filters": [
        //             {
        //                 "minPrice": "0.01",
        //                 "maxPrice": "100000.00000000",
        //                 "tickSize": "0.01",
        //                 "filterType": "PRICE_FILTER"
        //             },
        //             {
        //                 "minQty": "0.00001",
        //                 "maxQty": "8",
        //                 "stepSize": "0.00001",
        //                 "marketOrderMinQty": "0.00001",
        //                 "marketOrderMaxQty": "4",
        //                 "filterType": "LOT_SIZE"
        //             },
        //             {
        //                 "minNotional": "1",
        //                 "filterType": "MIN_NOTIONAL"
        //             },
        //             {
        //                 "minAmount": "1",
        //                 "maxAmount": "400000",
        //                 "minBuyPrice": "0",
        //                 "marketOrderMinAmount": "1",
        //                 "marketOrderMaxAmount": "200000",
        //                 "filterType": "TRADE_AMOUNT"
        //             },
        //             {
        //                 "maxSellPrice": "0",
        //                 "buyPriceUpRate": "0.1",
        //                 "sellPriceDownRate": "0.1",
        //                 "filterType": "LIMIT_TRADING"
        //             },
        //             {
        //                 "buyPriceUpRate": "0.1",
        //                 "sellPriceDownRate": "0.1",
        //                 "filterType": "MARKET_TRADING"
        //             },
        //             {
        //                 "noAllowMarketStartTime": "1710485700000",
        //                 "noAllowMarketEndTime": "1710486000000",
        //                 "limitOrderStartTime": "0",
        //                 "limitOrderEndTime": "0",
        //                 "limitMinPrice": "0",
        //                 "limitMaxPrice": "0",
        //                 "filterType": "OPEN_QUOTE"
        //             }
        //         ]
        //     }
        //
        // swap
        //     {
        //         "filters": [
        //             {
        //                 "minPrice": "0.1",
        //                 "maxPrice": "100000.00000000",
        //                 "tickSize": "0.1",
        //                 "filterType": "PRICE_FILTER"
        //             },
        //             {
        //                 "minQty": "0.001",
        //                 "maxQty": "10",
        //                 "stepSize": "0.001",
        //                 "marketOrderMinQty": "0",
        //                 "marketOrderMaxQty": "0",
        //                 "filterType": "LOT_SIZE"
        //             },
        //             {
        //                 "minNotional": "0",
        //                 "filterType": "MIN_NOTIONAL"
        //             },
        //             {
        //                 "maxSellPrice": "999999",
        //                 "buyPriceUpRate": "0.05",
        //                 "sellPriceDownRate": "0.05",
        //                 "maxEntrustNum": 200,
        //                 "maxConditionNum": 200,
        //                 "filterType": "LIMIT_TRADING"
        //             },
        //             {
        //                 "buyPriceUpRate": "0.05",
        //                 "sellPriceDownRate": "0.05",
        //                 "filterType": "MARKET_TRADING"
        //             },
        //             {
        //                 "noAllowMarketStartTime": "0",
        //                 "noAllowMarketEndTime": "0",
        //                 "limitOrderStartTime": "0",
        //                 "limitOrderEndTime": "0",
        //                 "limitMinPrice": "0",
        //                 "limitMaxPrice": "0",
        //                 "filterType": "OPEN_QUOTE"
        //             }
        //         ],
        //         "exchangeId": "301",
        //         "symbol": "BTCUSDT-PERPETUAL",
        //         "symbolName": "BTCUSDT-PERPETUAL",
        //         "status": "TRADING",
        //         "baseAsset": "BTCUSDT-PERPETUAL",
        //         "baseAssetPrecision": "0.001",
        //         "quoteAsset": "USDT",
        //         "quoteAssetPrecision": "0.1",
        //         "icebergAllowed": false,
        //         "inverse": false,
        //         "index": "USDT",
        //         "marginToken": "USDT",
        //         "marginPrecision": "0.0001",
        //         "contractMultiplier": "0.001",
        //         "underlying": "BTC",
        //         "riskLimits": [
        //             {
        //                 "riskLimitId": "200000722",
        //                 "quantity": "1000.00",
        //                 "initialMargin": "0.10",
        //                 "maintMargin": "0.005",
        //                 "isWhite": false
        //             },
        //             {
        //                 "riskLimitId": "200000723",
        //                 "quantity": "2000.00",
        //                 "initialMargin": "0.10",
        //                 "maintMargin": "0.01",
        //                 "isWhite": false
        //             }
        //         ]
        //     }
        //
        const marketId = this.safeString (market, 'symbol');
        const quoteId = this.safeString (market, 'quoteAsset');
        const quote = this.safeCurrencyCode (quoteId);
        const settleId = this.safeString (market, 'marginToken');
        const settle = this.safeCurrencyCode (settleId);
        let baseId = this.safeString (market, 'baseAsset');
        let marketType = 'spot' as any;
        let isSpot = true;
        let isSwap = false;
        let suffix = '';
        const parts = marketId.split ('-');
        const secondPart = this.safeString (parts, 1);
        if (secondPart === 'PERPETUAL') {
            marketType = 'swap';
            isSpot = false;
            isSwap = true;
            baseId = this.safeString (market, 'underlying');
            suffix += ':' + settleId;
        }
        const base = this.safeCurrencyCode (baseId);
        const symbol = base + '/' + quote + suffix;
        const status = this.safeString (market, 'status');
        const active = status === 'TRADING';
        let isLinear: Bool = undefined;
        let subType = undefined;
        const isInverse = this.safeBool (market, 'inverse');
        if (isInverse !== undefined) {
            if (isInverse) {
                isLinear = false;
                subType = 'inverse';
            } else {
                isLinear = true;
                subType = 'linear';
            }
        }
        const filtersList = this.safeList (market, 'filters', []);
        const filters = this.indexBy (filtersList, 'filterType');
        const priceFilter = this.safeDict (filters, 'PRICE_FILTER', {});
        const amountFilter = this.safeDict (filters, 'LOT_SIZE', {});
        const costFilter = this.safeDict (filters, 'MIN_NOTIONAL', {});
        const minCostString = this.omitZero (this.safeString (costFilter, 'min_notional'));
        const contractSizeString = this.safeString (market, 'contractMultiplier');
        let amountPrecisionString = this.safeString (amountFilter, 'stepSize');
        let amountMinLimitString = this.safeString (amountFilter, 'minQty');
        let amountMaxLimitString = this.safeString (amountFilter, 'maxQty');
        if (isSwap) {
            amountPrecisionString = Precise.stringDiv (amountPrecisionString, contractSizeString);
            amountMinLimitString = Precise.stringDiv (amountMinLimitString, contractSizeString);
            amountMaxLimitString = Precise.stringDiv (amountMaxLimitString, contractSizeString);
        }
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': active,
            'type': marketType,
            'subType': subType,
            'spot': isSpot,
            'margin': this.safeBool (market, 'allowMargin'),
            'swap': isSwap,
            'future': false,
            'option': false,
            'contract': isSwap,
            'settle': settle,
            'settleId': settleId,
            'contractSize': this.parseNumber (contractSizeString),
            'linear': isLinear,
            'inverse': isInverse,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecisionString),
                'price': this.safeNumber (priceFilter, 'tickSize'),
            },
            'limits': {
                'amount': {
                    'min': this.parseNumber (amountMinLimitString),
                    'max': this.parseNumber (amountMaxLimitString),
                },
                'price': {
                    'min': this.safeNumber (priceFilter, 'minPrice'),
                    'max': this.safeNumber (priceFilter, 'maxPrice'),
                },
                'leverage': {
                    'min': undefined, // todo
                    'max': undefined, // todo
                },
                'cost': {
                    'min': this.parseNumber (minCostString),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name hashkey#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetApiV1ExchangeInfo (params);
        const coins = this.safeList (response, 'coins');
        //
        //     {
        //         ...
        //         "coins": [
        //             {
        //                 "orgId": "9001",
        //                 "coinId": "BTC",
        //                 "coinName": "BTC",
        //                 "coinFullName": "Bitcoin",
        //                 "allowWithdraw": true,
        //                 "allowDeposit": true,
        //                 "tokenType": "CHAIN_TOKEN",
        //                 "chainTypes": [
        //                     {
        //                         "chainType": "Bitcoin",
        //                         "withdrawFee": "0",
        //                         "minWithdrawQuantity": "0.002",
        //                         "maxWithdrawQuantity": "0",
        //                         "minDepositQuantity": "0.0005",
        //                         "allowDeposit": true,
        //                         "allowWithdraw": true
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        //
        const result: Dict = {};
        for (let i = 0; i < coins.length; i++) {
            const currecy = coins[i];
            const currencyId = this.safeString (currecy, 'coinId');
            const code = this.safeCurrencyCode (currencyId);
            const allowWithdraw = this.safeBool (currecy, 'allowWithdraw');
            const allowDeposit = this.safeBool (currecy, 'allowDeposit');
            const networks = this.safeList (currecy, 'chainTypes');
            const networksById = this.safeDict (this.options, 'networksById');
            const parsedNetworks: Dict = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString (network, 'chainType');
                const networkName = this.safeString (networksById, networkId, networkId);
                const maxWithdrawQuantity = this.omitZero (this.safeString (network, 'maxWithdrawQuantity')); // todo check
                const networkDeposit = this.safeBool (network, 'allowDeposit');
                const networkWithdraw = this.safeBool (network, 'allowWithdraw');
                parsedNetworks[networkName] = {
                    'id': networkId,
                    'network': networkName,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (network, 'minWithdrawQuantity'),
                            'max': this.parseNumber (maxWithdrawQuantity),
                        },
                        'deposit': {
                            'min': this.safeNumber (network, 'minDepositQuantity'),
                            'max': undefined,
                        },
                    },
                    'active': networkDeposit && networkWithdraw,
                    'deposit': networkDeposit,
                    'withdraw': networkWithdraw,
                    'fee': this.safeNumber (network, 'withdrawFee'),
                    'precision': undefined,
                    'info': network,
                };
            }
            result[code] = {
                'id': currencyId,
                'code': code,
                'precision': undefined,
                'type': this.parseCurrencyType (this.safeString (currecy, 'tokenType')),
                'name': this.safeString (currecy, 'coinFullName'),
                'active': allowWithdraw && allowDeposit,
                'deposit': allowDeposit,
                'withdraw': allowWithdraw,
                'fee': undefined,
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
                'networks': parsedNetworks,
                'info': currecy,
            };
        }
        return result;
    }

    parseCurrencyType (type) {
        const types = {
            'CHAIN_TOKEN': 'crypto',
            'ERC20_TOKEN': 'crypto',
            'BSC_TOKEN': 'crypto',
            'REAL_MONEY': 'fiat',
        };
        return this.safeString (types, type);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name hashkey#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (maximum value is 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetQuoteV1Depth (this.extend (request, params));
        //
        //     {
        //         "t": 1721681436393,
        //         "b": [
        //             ["67902.49", "0.00112"],
        //             ["67901.08", "0.01014"]
        //             ...
        //         ],
        //         "a": [
        //             ["67905.99", "0.87134"],
        //             ["67906", "0.57361"]
        //             ...
        //         ]
        //     }
        //
        const timestamp = this.safeInteger (response, 't');
        return this.parseOrderBook (response, symbol, timestamp, 'b', 'a');
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name hashkey#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-recent-trade-list
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetQuoteV1Trades (this.extend (request, params));
        //
        //     [
        //         {
        //             "t": 1721682745779,
        //             "p": "67835.99",
        //             "q": "0.00017",
        //             "ibm": true
        //         },
        //         ...
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-account-trade-list
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-futures-trades
         * @param {string} symbol *is mandatory for swap markets* unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch trades for (default 'spot')
         * @param {int} [params.until] the latest time in ms to fetch trades for, only supports the last 30 days timeframe
         * @param {string} [params.fromId] srarting trade id
         * @param {string} [params.toId] ending trade id
         * @param {string} [params.clientOrderId] *spot markets only* filter trades by orderId
         * @param {string} [params.accountId] *spot markets only* filter trades by account id
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
         */
        const methodName = 'fetchMyTrades';
        await this.loadMarkets ();
        const request: Dict = {};
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params);
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let fromId: Str = undefined;
        [ fromId, params ] = this.handleOptionAndParams (params, methodName, 'fromId');
        if (fromId !== undefined) {
            request['fromId'] = fromId;
        }
        let toId: Str = undefined;
        [ toId, params ] = this.handleOptionAndParams (params, methodName, 'toId');
        if (toId !== undefined) {
            request['toId'] = toId;
        }
        let response = undefined;
        if (marketType === 'spot') {
            if (market !== undefined) {
                request['symbol'] = market['id'];
            }
            let clientOrderId: Str = undefined;
            [ clientOrderId, params ] = this.handleOptionAndParams (params, methodName, 'clientOrderId');
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
            let accountId: Str = undefined;
            [ accountId, params ] = this.handleOptionAndParams (params, methodName, 'accountId');
            if (accountId !== undefined) {
                request['accountId'] = clientOrderId;
            }
            response = await this.privateGetApiV1AccountTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": "1739352552862964736",
            //             "clientOrderId": "1722082982086472",
            //             "ticketId": "1739352552795029504",
            //             "symbol": "ETHUSDT",
            //             "symbolName": "ETHUSDT",
            //             "orderId": "1739352552762301440",
            //             "matchOrderId": "0",
            //             "price": "3289.96",
            //             "qty": "0.001",
            //             "commission": "0.0000012",
            //             "commissionAsset": "ETH",
            //             "time": "1722082982097",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "fee": {
            //                 "feeCoinId": "ETH",
            //                 "feeCoinName": "ETH",
            //                 "fee": "0.0000012"
            //             },
            //             "feeCoinId": "ETH",
            //             "feeAmount": "0.0000012",
            //             "makerRebate": "0"
            //         },
            //         ...
            //     ]
            //
        } else if (marketType === 'swap') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument for swap markets');
            }
            request['symbol'] = market['id'];
            response = await this.privateGetApiV1FuturesUserTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "time": "1722429951648",
            //             "tradeId": "1742263144691139328",
            //             "orderId": "1742263144028363776",
            //             "symbol": "ETHUSDT-PERPETUAL",
            //             "price": "3327.54",
            //             "quantity": "4",
            //             "commissionAsset": "USDT",
            //             "commission": "0.00798609",
            //             "makerRebate": "0",
            //             "type": "LIMIT",
            //             "side": "BUY_OPEN",
            //             "realizedPnl": "0",
            //             "isMarker": false
            //         }
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //
        //     {
        //         "t": 1721682745779,
        //         "p": "67835.99",
        //         "q": "0.00017",
        //         "ibm": true
        //     }
        //
        // fetchMyTrades spot
        //
        //     {
        //         "id": "1739352552862964736",
        //         "clientOrderId": "1722082982086472",
        //         "ticketId": "1739352552795029504",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "orderId": "1739352552762301440",
        //         "matchOrderId": "0",
        //         "price": "3289.96",
        //         "qty": "0.001",
        //         "commission": "0.0000012",
        //         "commissionAsset": "ETH",
        //         "time": "1722082982097",
        //         "isBuyer": true,
        //         "isMaker": false,
        //         "fee": {
        //             "feeCoinId": "ETH",
        //             "feeCoinName": "ETH",
        //             "fee": "0.0000012"
        //         },
        //         "feeCoinId": "ETH",
        //         "feeAmount": "0.0000012",
        //         "makerRebate": "0"
        //     }
        //
        // fetchMyTrades swap
        //     {
        //         "time": "1722429951648",
        //         "tradeId": "1742263144691139328",
        //         "orderId": "1742263144028363776",
        //         "symbol": "ETHUSDT-PERPETUAL",
        //         "price": "3327.54",
        //         "quantity": "4",
        //         "commissionAsset": "USDT",
        //         "commission": "0.00798609",
        //         "makerRebate": "0",
        //         "type": "LIMIT",
        //         "side": "BUY_OPEN",
        //         "realizedPnl": "0",
        //         "isMarker": false // todo report
        //     }
        const timestamp = this.safeInteger2 (trade, 't', 'time');
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        let side = this.safeStringLower (trade, 'side'); // swap trades have side param
        if (side !== undefined) {
            side = this.safeString (side.split ('_'), 0);
        }
        const isBuyer = this.safeBool (trade, 'isBuyer');
        if (isBuyer !== undefined) {
            side = isBuyer ? 'buy' : 'sell';
        }
        let takerOrMaker = undefined;
        const isMaker = this.safeBool2 (trade, 'isMaker', 'isMarker');
        if (isMaker !== undefined) {
            takerOrMaker = isMaker ? 'maker' : 'taker';
        }
        let feeCost = this.safeString (trade, 'commission');
        let feeCurrncyId = this.safeString (trade, 'commissionAsset');
        const feeInfo = this.safeDict (trade, 'fee');
        if (feeInfo !== undefined) {
            feeCost = this.safeString (feeInfo, 'fee');
            feeCurrncyId = this.safeString (feeInfo, 'feeCoinId');
        }
        const fee = {
            'cost': feeCost,
            'currency': this.safeCurrencyCode (feeCurrncyId),
        };
        return this.safeTrade ({
            'id': this.safeString2 (trade, 'id', 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'side': side,
            'price': this.safeString2 (trade, 'p', 'price'),
            'amount': this.safeStringN (trade, [ 'q', 'qty', 'quantity' ]),
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'type': undefined,
            'order': this.safeString (trade, 'orderId'),
            'fee': fee,
            'info': trade,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name hashkey#fetchOHLCV
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-kline
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch (max 1000)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const methodName = 'fetchOHLCV';
        await this.loadMarkets ();
        const market = this.market (symbol);
        timeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'symbol': market['id'],
            'interval': timeframe,
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicGetQuoteV1Klines (this.extend (request, params));
        //
        //     [
        //         [
        //             1721684280000,
        //             "67832.49",
        //             "67862.5",
        //             "67832.49",
        //             "67861.44",
        //             "0.01122",0,
        //             "761.2763533",68,
        //             "0.00561",
        //             "380.640643"
        //         ],
        //         ...
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     [
        //         1721684280000,
        //         "67832.49",
        //         "67862.5",
        //         "67832.49",
        //         "67861.44",
        //         "0.01122",0,
        //         "761.2763533",68,
        //         "0.00561",
        //         "380.640643"
        //     ]
        //
        return [
            this.safeInteger (ohlcv, 0),
            this.safeNumber (ohlcv, 1),
            this.safeNumber (ohlcv, 2),
            this.safeNumber (ohlcv, 3),
            this.safeNumber (ohlcv, 4),
            this.safeNumber (ohlcv, 5),
        ];
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name hashkey#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetQuoteV1Ticker24hr (this.extend (request, params));
        //
        //     [
        //         {
        //             "t": 1721685896846,
        //             "s": "BTCUSDT-PERPETUAL",
        //             "c": "67756.7",
        //             "h": "68479.9",
        //             "l": "66594.3",
        //             "o": "68279.7",
        //             "b": "67756.6",
        //             "a": "67756.7",
        //             "v": "1604722",
        //             "qv": "108827258.7761"
        //         }
        //     ]
        //
        const ticker = this.safeDict (response, 0, {});
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name hashkey#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetQuoteV1Ticker24hr (params);
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //     {
        //         "t": 1721685896846,
        //         "s": "BTCUSDT-PERPETUAL",
        //         "c": "67756.7",
        //         "h": "68479.9",
        //         "l": "66594.3",
        //         "o": "68279.7",
        //         "b": "67756.6",
        //         "a": "67756.7",
        //         "v": "1604722",
        //         "qv": "108827258.7761"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'a'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'qv'),
            'info': ticker,
        }, market);
    }

    async fetchLastPrices (symbols: Strings = undefined, params = {}): Promise<LastPrices> {
        /**
         * @method
         * @name hashkey#fetchLastPrices
         * @description fetches the last price for multiple markets
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-symbol-price-ticker
         * @param {string[]} [symbols] unified symbols of the markets to fetch the last prices
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.symbol] the id of the market to fetch last price for
         * @returns {object} a dictionary of lastprices structures
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {};
        let symbol: Str = undefined;
        [ symbol, params ] = this.handleOptionAndParams (params, 'fetchLastPrices', 'symbol');
        if (symbol !== undefined) {
            request['symbol'] = symbol;
        }
        const response = await this.publicGetQuoteV1TickerPrice (this.extend (request, params));
        //
        //     [
        //         {
        //             "s": "BTCUSDT-PERPETUAL",
        //             "p": "64871"
        //         },
        //         ...
        //     ]
        //
        return this.parseLastPrices (response, symbols);
    }

    parseLastPrice (entry, market: Market = undefined): LastPrice {
        const marketId = this.safeString (entry, 's'); // todo check fetchLastPrices() could return more markets than fetchMarkets()
        market = this.safeMarket (marketId, market);
        return {
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'price': this.safeNumber (entry, 'p'),
            'side': undefined,
            'info': entry,
        };
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name hashkey#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-account-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.accountId] account ID, for Master Key only
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        const methodName = 'fetchBalance';
        let accountId: Str = undefined;
        [ accountId, params ] = this.handleOptionAndParams (params, methodName, 'accountId');
        if (accountId !== undefined) {
            request['accountId'] = accountId;
        }
        const response = await this.privateGetApiV1Account (this.extend (request, params));
        //
        //     {
        //         "balances": [
        //             {
        //                 "asset":"USDT",
        //                 "assetId":"USDT",
        //                 "assetName":"USDT",
        //                 "total":"40",
        //                 "free":"40",
        //                 "locked":"0"
        //             },
        //             ...
        //         ],
        //         "userId": "1732885739572845312"
        //     }
        //
        return this.parseBalance (response);
    }

    parseBalance (balance): Balances {
        //
        //     {
        //         "balances": [
        //             {
        //                 "asset":"USDT",
        //                 "assetId":"USDT",
        //                 "assetName":"USDT",
        //                 "total":"40",
        //                 "free":"40",
        //                 "locked":"0"
        //             },
        //             ...
        //         ],
        //         "userId": "1732885739572845312"
        //     }
        //
        const result: Dict = {
            'info': balance,
        };
        const balances = this.safeList (balance, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = balances[i];
            const currencyId = this.safeString (balanceEntry, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balanceEntry, 'total');
            account['free'] = this.safeString (balanceEntry, 'free');
            account['used'] = this.safeString (balanceEntry, 'locked');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name hashkey#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-address
         * @param {string} code unified currency code (default is 'USDT')
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.network] network for fetch deposit address (default is 'ETH')
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
        };
        let networkCode: Str = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            networkCode = this.defaultNetworkCode (code);
        }
        request['chainType'] = this.networkCodeToId (networkCode, code);
        const response = await this.privateGetApiV1AccountDepositAddress (this.extend (request, params));
        //
        //     {
        //         "canDeposit": true,
        //         "address": "0x61AAd7F763e2C7fF1CC996918740F67f9dC8BF4e",
        //         "addressExt": "",
        //         "minQuantity": "1",
        //         "needAddressTag": false,
        //         "requiredConfirmTimes": 64,
        //         "canWithdrawConfirmTimes": 64,
        //         "coinType": "ERC20_TOKEN"
        //     }
        //
        const depositAddress = this.parseDepositAddress (response, currency);
        depositAddress['network'] = networkCode;
        return depositAddress;
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        //
        //     {
        //         "canDeposit": true,
        //         "address": "0x61AAd7F763e2C7fF1CC996918740F67f9dC8BF4e",
        //         "addressExt": "",
        //         "minQuantity": "1",
        //         "needAddressTag": false,
        //         "requiredConfirmTimes": 64,
        //         "canWithdrawConfirmTimes": 64,
        //         "coinType": "ERC20_TOKEN"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        let tag = this.safeString (depositAddress, 'addressExt');
        if (tag === '') {
            tag = undefined;
        }
        return {
            'currency': currency['code'],
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': depositAddress,
        };
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name hashkey#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-history
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @param {int} [params.fromId] starting ID (To be released)
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        const methodName = 'fetchDeposits';
        await this.loadMarkets ();
        const request: Dict = {};
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code); // todo format is chain_coin, such as ETH_USDT for USDT coin issued on Ethereum
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let fromId: Str = undefined;
        [ fromId, params ] = this.handleOptionAndParams (params, methodName, 'fromId');
        if (fromId !== undefined) {
            request['fromId'] = fromId;
        }
        const response = await this.privateGetApiV1AccountDepositOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "time": "1721641082163",
        //             "coin": "TRXUSDT",
        //             "coinName": "TRXUSDT",
        //             "address": "TBA6CypYJizwA9XdC7Ubgc5F1bxrQ7SqPt",
        //             "quantity": "86.00000000000000000000",
        //             "status": 4,
        //             "statusCode": "4",
        //             "txId": "0970c14da4d7412295fa7b21c03a08da319e746a0d59ef14462a74183d118da4"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name hashkey#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://hashkeyglobal-apidoc.readme.io/reference/withdrawal-records
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const methodName = 'fetchWithdrawals';
        await this.loadMarkets ();
        const request: Dict = {};
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetApiV1AccountWithdrawOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "time": "1719499716079",
        //             "id": "W594298131448512512",
        //             "coin": "USDT",
        //             "coinId": "USDT",
        //             "coinName": "USDT",
        //             "address": "0xA9648A0f44956AFA90A16F5Fe470d34C85fb983B",
        //             "quantity": "1.00000000",
        //             "arriveQuantity": "1.00000000",
        //             "txId": "0x4fc00f8d053bcd24cd052130e051e4587c4f5c19efb73ddc6c8da77cb0040e93",
        //             "addressUrl": "0xA9648A0f44956AFA90A16F5Fe470d34C85fb983B",
        //             "feeCoinId": "USDT",
        //             "feeCoinName": "USDT",
        //             "fee": "0.00100000",
        //             "remark": "",
        //             "platform": "hashkey"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' }); // todo check after making a withdrawal
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#withdraw
         * @description make a withdrawal
         * @see https://hashkeyglobal-apidoc.readme.io/reference/withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {string} [params.network] network for withdraw
         * @param {string} [params.clientOrderId] client order id
         * @param {string} [params.platform] the platform to withdraw to (hashkey, HashKey HK)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
            'address': address,
            'quantity': amount,
        };
        if (tag !== undefined) {
            request['addressExt'] = tag;
        }
        let clientOrderId: Str = undefined;
        [ clientOrderId, params ] = this.handleOptionAndParams (params, 'withdraw', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        let networkCode: Str = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode !== undefined) {
            request['chainType'] = this.networkCodeToId (networkCode);
        }
        let platform: Str = undefined;
        [ platform, params ] = this.handleOptionAndParams (params, 'withdraw', 'platform');
        if (platform !== undefined) {
            request['fromId'] = platform;
        }
        const response = await this.privatePostApiV1AccountWithdraw (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "id": "0",
        //         "orderId": "W476435800487079936"
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        //  fetchDeposits
        //     {
        //         "time": "1721641082163",
        //         "coin": "TRXUSDT", // todo how to parse it?
        //         "coinName": "TRXUSDT",
        //         "address": "TBA6CypYJizwA9XdC7Ubgc5F1bxrQ7SqPt",
        //         "quantity": "86.00000000000000000000",
        //         "status": 4,
        //         "statusCode": "4",
        //         "txId": "0970c14da4d7412295fa7b21c03a08da319e746a0d59ef14462a74183d118da4"
        //     }
        //
        // fetchWithdrawals
        //     {
        //         "time": "1719499716079",
        //         "id": "W594298131448512512",
        //         "coin": "USDT",
        //         "coinId": "USDT",
        //         "coinName": "USDT",
        //         "address": "0xA9648A0f44956AFA90A16F5Fe470d34C85fb983B",
        //         "quantity": "1.00000000",
        //         "arriveQuantity": "1.00000000",
        //         "txId": "0x4fc00f8d053bcd24cd052130e051e4587c4f5c19efb73ddc6c8da77cb0040e93",
        //         "addressUrl": "0xA9648A0f44956AFA90A16F5Fe470d34C85fb983B",
        //         "feeCoinId": "USDT",
        //         "feeCoinName": "USDT",
        //         "fee": "0.00100000",
        //         "remark": "",
        //         "platform": "hashkey"
        //     }
        //
        const id = this.safeString2 (transaction, 'id', 'orderId');
        const address = this.safeString (transaction, 'address');
        const status = this.safeString (transaction, 'status'); // todo check for withdrawals
        const txid = this.safeString (transaction, 'txId');
        const coin = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (coin, currency);
        const timestamp = this.safeInteger (transaction, 'time');
        const amount = this.safeNumber (transaction, 'quantity');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        const statuses: Dict = {
            '1': 'pending',
            '2': 'pending',
            '3': 'failed',
            '4': 'ok',
            '5': 'pending', // todo refund status
            '6': 'ok', // todo refund status
            '7': 'failed', // todo refund status
            '8': 'cancelled',
            '9': 'failed',
            '10': 'failed',
            'successful': 'ok',
            'success': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        /**
         * @method
         * @name hashkey#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://hashkeyglobal-apidoc.readme.io/reference/new-account-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account id to transfer from
         * @param {string} toAccount account id to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] a unique id for the transfer
         * @param {string} [params.remark] a note for the transfer
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
            'quantity': this.currencyToPrecision (code, amount),
            'fromAccountId': fromAccount,
            'toAccountId': toAccount,
        };
        let clientOrderId: Str = undefined;
        [ clientOrderId, params ] = this.handleOptionAndParams (params, 'transfer', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        let remark: Str = undefined;
        [ remark, params ] = this.handleOptionAndParams (params, 'transfer', 'remark');
        if (remark !== undefined) {
            request['remark'] = remark;
        }
        const response = await this.privatePostApiV1AccountAssetTransfer (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "timestamp": 1722260230773,
        //         "clientOrderId": "",
        //         "orderId": "1740839420695806720"
        //     }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency: Currency = undefined) {
        const timestamp = this.safeInteger (transfer, 'timestamp');
        const currencyId = this.safeString (currency, 'id');
        return {
            'id': this.safeString (transfer, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': this.parseTransferStatus (this.safeString (transfer, 'success')),
            'info': transfer,
        };
    }

    parseTransferStatus (status) {
        const statuses: Dict = {
            'true': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        /**
         * @method
         * @name hashkey#fetchAccounts
         * @description fetch subaccounts associated with a profile
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-sub-account
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        await this.loadMarkets ();
        const response = await this.privateGetApiV1AccountType (params);
        //
        //     [
        //         {
        //             "accountId": "1732885739589466112",
        //             "accountLabel": "Main Trading Account",
        //             "accountType": 1,
        //             "accountIndex": 0
        //         },
        //         ...
        //     ]
        //
        return this.parseAccounts (response, params);
    }

    parseAccount (account) {
        return {
            'id': this.safeString (account, 'accountId'),
            'type': this.parseAccountType (this.safeString (account, 'accountType')),
            'code': undefined,
            'info': account,
        };
    }

    parseAccountType (type) {
        const types: Dict = {
            '1': 'spot',
            '3': 'swap',
            '5': 'custody', // todo check
            '6': 'fiat', // todo check
        };
        return this.safeString (types, type, type);
    }

    encodeAccountType (type) {
        const types = {
            'spot': '1',
            'swap': '3',
            'custody': '5',
        };
        return this.safeInteger (types, type, type);
    }

    encodeFlowType (type) {
        const types = {
            'trade': '1',
            'fee': '3',
            'transfer': '51',
            'deposit': '900',
            'withdraw': '904',
        };
        return this.safeInteger (types, type, type);
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-account-transaction-list
         * @param {string} code unified currency code, default is undefined (not used)
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {int} [params.flowType] trade, fee, transfer, deposit, withdrawal
         * @param {int} [params.accountType] spot, swap, custody
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        const methodName = 'fetchLedger';
        if (since === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a since argument');
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires an until argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {};
        request['startTime'] = since;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        request['endTime'] = until;
        let flowType = undefined;
        [ flowType, params ] = this.handleOptionAndParams (params, methodName, 'flowType');
        if (flowType !== undefined) {
            request['flowType'] = this.encodeFlowType (flowType);
        }
        let accountType = undefined;
        [ accountType, params ] = this.handleOptionAndParams (params, methodName, 'accountType');
        if (accountType !== undefined) {
            request['accountType'] = this.encodeAccountType (accountType);
        }
        const response = await this.privateGetApiV1AccountBalanceFlow (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "1740844413612065537",
        //             "accountId": "1732885739589466112",
        //             "coin": "USDT",
        //             "coinId": "USDT",
        //             "coinName": "USDT",
        //             "flowTypeValue": 51,
        //             "flowType": "USER_ACCOUNT_TRANSFER",
        //             "flowName": "",
        //             "change": "-1",
        //             "total": "8.015680088",
        //             "created": "1722260825765"
        //         },
        //         ...
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types: Dict = {
            '1': 'trade', // transfer
            '2': 'fee', // trade
            '51': 'transfer',
            '900': 'deposit',
            '904': 'withdraw',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item: Dict, currency: Currency = undefined) {
        //
        //     {
        //         "id": "1740844413612065537",
        //         "accountId": "1732885739589466112",
        //         "coin": "USDT",
        //         "coinId": "USDT",
        //         "coinName": "USDT",
        //         "flowTypeValue": 51,
        //         "flowType": "USER_ACCOUNT_TRANSFER",
        //         "flowName": "",
        //         "change": "-1",
        //         "total": "8.015680088",
        //         "created": "1722260825765"
        //     }
        //
        const id = this.safeString (item, 'id');
        const account = this.safeString (item, 'accountId');
        const timestamp = this.safeInteger (item, 'created');
        const type = this.parseLedgerEntryType (this.safeString (item, 'flowTypeValue'));
        const code = this.safeCurrencyCode (this.safeString (item, 'coin'), currency);
        const amountString = this.safeString (item, 'change');
        const amount = this.parseNumber (amountString);
        let direction = 'in';
        if (amountString.indexOf ('-') >= 0) {
            direction = 'out';
        }
        const afterString = this.safeString (item, 'total');
        const after = this.parseNumber (afterString);
        const status = 'ok';
        return {
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'account': account,
            'direction': direction,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'symbol': undefined,
            'amount': amount,
            'before': undefined,
            'after': after,
            'status': status,
            'fee': undefined,
        };
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name hashkey#createOrder
         * @description create a trade order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/create-order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
         * @param {boolean} [params.test] *spot markets only* whether to use the test endpoint or not, default is false
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {string} [params.timeInForce] "GTC" or "IOC" or "PO" for spot, 'GTC' or 'FOK' or 'IOC' or 'LIMIT_MAKER' or 'PO' for swap
         * @param {string} [params.clientOrderId] a unique id for the order - is mandatory for swap
         * @param {float} [params.triggerPrice] *swap markets only* The price at which a trigger order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else if (market['swap']) {
            return await this.createSwapOrder (symbol, type, side, amount, price, params);
        } else {
            throw new NotSupported (this.id + ' createOrder() is not supported for ' + market['type'] + ' type of markets');
        }
    }

    async createSpotOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name hashkey#createSpotOrder
         * @description create a trade order on spot market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/create-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
         * @param {bool} [params.test] whether to use the test endpoint or not, default is false
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {string} [params.timeInForce] 'GTC', 'IOC', or 'PO'
         * @param {string} [params.clientOrderId] a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const isMarketBuy = (type === 'market') && (side === 'buy');
        const cost = this.safeString (params, 'cost');
        if ((!isMarketBuy) && (cost !== undefined)) {
            throw new NotSupported (this.id + ' createOrder() supports cost parameter for spot market buy orders only');
        }
        const request: Dict = this.createSpotOrderRequest (symbol, type, side, amount, price, params);
        let response: Dict = {};
        const test = this.safeBool (params, 'test');
        if (test) {
            params = this.omit (params, 'test');
            response = await this.privatePostApiV1SpotOrderTest (request);
        } else if (isMarketBuy && (cost === undefined)) {
            response = await this.privatePostApiV11SpotOrder (request); // the endpoint for market buy orders by amount
            //
            //     {
            //         "accountId": "1732885739589466112",
            //         "symbol": "ETHUSDT",
            //         "symbolName": "ETHUSDT",
            //         "clientOrderId": "1722005792096557",
            //         "orderId": "1738705036219839744",
            //         "transactTime": "1722005792106",
            //         "price": "0",
            //         "origQty": "0.006",
            //         "executedQty": "0.0059",
            //         "status": "FILLED",
            //         "timeInForce": "IOC",
            //         "type": "MARKET",
            //         "side": "BUY",
            //         "reqAmount": "0",
            //         "concentration": ""
            //     }
            //
        } else {
            response = await this.privatePostApiV1SpotOrder (request); // the endpoint for market buy orders by cost and other orders
            //
            // market buy
            //     {
            //         "accountId": "1732885739589466112",
            //         "symbol": "ETHUSDT",
            //         "symbolName": "ETHUSDT",
            //         "clientOrderId": "1722004623170558",
            //         "orderId": "1738695230608169984",
            //         "transactTime": "1722004623186",
            //         "price": "0",
            //         "origQty": "0",
            //         "executedQty": "0.0061",
            //         "status": "FILLED",
            //         "timeInForce": "IOC",
            //         "type": "MARKET",
            //         "side": "BUY",
            //         "reqAmount": "20",
            //         "concentration": ""
            //     }
            //
            // market sell
            //     {
            //         "accountId": "1732885739589466112",
            //         "symbol": "ETHUSDT",
            //         "symbolName": "ETHUSDT",
            //         "clientOrderId": "1722005654516362",
            //         "orderId": "1738703882140316928",
            //         "transactTime": "1722005654529",
            //         "price": "0",
            //         "origQty": "0.006",
            //         "executedQty": "0.006",
            //         "status": "FILLED",
            //         "timeInForce": "IOC",
            //         "type": "MARKET",
            //         "side": "SELL",
            //         "reqAmount": "0",
            //         "concentration": ""
            //     }
            //
            // limit
            //     {
            //         "accountId": "1732885739589466112",
            //         "symbol": "ETHUSDT",
            //         "symbolName": "ETHUSDT",
            //         "clientOrderId": "1722006209978370",
            //         "orderId": "1738708541676585728",
            //         "transactTime": "1722006209989",
            //         "price": "5000",
            //         "origQty": "0.005",
            //         "executedQty": "0",
            //         "status": "NEW",
            //         "timeInForce": "GTC",
            //         "type": "LIMIT_MAKER",
            //         "side": "SELL",
            //         "reqAmount": "0",
            //         "concentration": ""
            //     }
            //
        }
        return this.parseOrder (response, market);
    }

    createSpotOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Dict {
        /**
         * @method
         * @ignore
         * @name hashkey#createSpotOrderRequest
         * @description helper function to build request
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
         * @param {string} [params.clientOrderId] a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const market = this.market (symbol);
        type = type.toUpperCase ();
        const request: Dict = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'type': type,
        };
        if (amount !== undefined) {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        const cost = this.handleParamString (params, 'cost');
        if (cost !== undefined) {
            request['quantity'] = this.costToPrecision (symbol, cost);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const isMarketOrder = type === 'MARKET';
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, type === 'LIMIT_MAKER', params);
        if (postOnly && (type === 'LIMIT')) {
            request['type'] = 'LIMIT_MAKER';
        }
        let clientOrderId: Str = undefined;
        [ clientOrderId, params ] = this.handleParamString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params['newClientOrderId'] = clientOrderId;
        }
        return this.extend (request, params);
    }

    async createSwapOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name hashkey#createSwapOrder
         * @description create a trade order on swap market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit' or 'STOP'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {bool} [params.reduceOnly] true or false whether the order is reduce only
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {string} [params.timeInForce] 'GTC', 'FOK', 'IOC', 'LIMIT_MAKER' or 'PO'
         * @param {string} [params.clientOrderId] a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'type': 'LIMIT',
            'quantity': this.amountToPrecision (symbol, amount),
        };
        const isMarketOrder = type === 'market';
        if (isMarketOrder) {
            request['priceType'] = 'MARKET';
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
            request['priceType'] = 'INPUT';
        }
        let reduceOnly = false;
        [ reduceOnly, params ] = this.handleParamBool (params, 'reduceOnly', reduceOnly);
        let suffix = '_OPEN';
        if (reduceOnly) {
            suffix = '_CLOSE';
        }
        request['side'] = side.toUpperCase () + suffix;
        let timeInForce: Str = undefined;
        [ timeInForce, params ] = this.handleParamString (params, 'timeInForce');
        let postOnly = false;
        [ postOnly, params ] = this.handlePostOnly (isMarketOrder, timeInForce === 'LIMIT_MAKER', params);
        if (postOnly) {
            timeInForce = 'LIMIT_MAKER';
        }
        request['timeInForce'] = timeInForce;
        let clientOrderId: Str = undefined;
        [ clientOrderId, params ] = this.handleParamString (params, 'clientOrderId');
        if (clientOrderId === undefined) {
            // throw new ArgumentsRequired (this.id + ' createSwapOrder() requires a clientOrderId parameter');
            clientOrderId = this.milliseconds ().toString (); // todo delete it after check
            request['clientOrderId'] = clientOrderId;
        }
        const triggerPrice = this.safeNumber (params, 'triggerPrice');
        if (triggerPrice !== undefined) {
            request['stopPrice'] = this.priceToPrecision (symbol, triggerPrice);
            request['type'] = 'STOP';
            params = this.omit (params, 'triggerPrice');
        }
        const response = await this.privatePostApiV1FuturesOrder (this.extend (request, params));
        //
        //     {
        //         "time": "1722429951611",
        //         "updateTime": "1722429951648",
        //         "orderId": "1742263144028363776",
        //         "clientOrderId": "1722429950315",
        //         "symbol": "ETHUSDT-PERPETUAL",
        //         "price": "3460.62",
        //         "leverage": "5",
        //         "origQty": "10",
        //         "executedQty": "10",
        //         "avgPrice": "0",
        //         "marginLocked": "6.9212",
        //         "type": "LIMIT",
        //         "side": "BUY_OPEN",
        //         "timeInForce": "IOC",
        //         "status": "FILLED",
        //         "priceType": "MARKET",
        //         "contractMultiplier": "0.00100000"
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#cancelOrder
         * @description cancels an open order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-futures-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
         * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
         * @param {bool} [params.trigger] *swap markets only* true for canceling a trigger order (default false)
         * @param {bool} [params.stop] *swap markets only* an alternative for trigger param
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const methodName = 'cancelOrder';
        this.checkTypeParam (methodName, params);
        await this.loadMarkets ();
        const request: Dict = {};
        if (id !== undefined) {
            request['orderId'] = id;
        } else {
            const clientOrderId = this.safeString (params, 'clientOrderId');
            if (clientOrderId === undefined) {
                throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires an id argument or clientOrderId parameter');
            }
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.privateDeleteApiV1SpotOrder (this.extend (request, params));
            //
            //     {
            //         "accountId": "1732885739589466112",
            //         "symbol": "ETHUSDT",
            //         "clientOrderId": "1722006209978370",
            //         "orderId": "1738708541676585728",
            //         "transactTime": "1722006209989",
            //         "price": "5000",
            //         "origQty": "0.005",
            //         "executedQty": "0",
            //         "status": "NEW",
            //         "timeInForce": "GTC",
            //         "type": "LIMIT_MAKER",
            //         "side": "SELL"
            //     }
            //
        } else if (marketType === 'swap') {
            let isTrigger = false;
            [ isTrigger, params ] = this.handleTriggerOptionAndParams (params, methodName, isTrigger);
            if (isTrigger) {
                request['type'] = 'STOP';
            } else {
                request['type'] = 'LIMIT';
            }
            if (market !== undefined) {
                request['symbol'] = market['id'];
            }
            response = await this.privateDeleteApiV1FuturesOrder (this.extend (request, params));
            //
            //     {
            //         "time": "1722432302919",
            //         "updateTime": "1722432302925",
            //         "orderId": "1742282868229463040",
            //         "clientOrderId": "1722432301670",
            //         "symbol": "ETHUSDT-PERPETUAL",
            //         "price": "4000",
            //         "leverage": "5",
            //         "origQty": "10",
            //         "executedQty": "0",
            //         "avgPrice": "0",
            //         "marginLocked": "0",
            //         "type": "LIMIT_MAKER",
            //         "side": "SELL_CLOSE",
            //         "timeInForce": "GTC",
            //         "status": "NEW",
            //         "priceType": "INPUT",
            //         "isLiquidationOrder": false,
            //         "indexPrice": "0",
            //         "liquidationType": ""
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#cancelAllOrders
         * @description cancel all open orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-all-open-orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.side] 'buy' or 'sell'
         * @returns {object} response from exchange
         */
        // Does not cancel trigger orders. For canceling trigger order use cancelOrder() or cancelOrders()
        const methodName = 'cancelAllOrders';
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let side: Str = undefined;
        [ side, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'side');
        if (side !== undefined) {
            request['side'] = side;
        }
        if (market['spot']) {
            return await this.privateDeleteApiV1SpotOpenOrders (this.extend (request, params));
            //
            //     { "success": true }
            //
        } else if (market['swap']) {
            return await this.privateDeleteApiV1SpotOpenOrders (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + market['type'] + ' type of markets');
        }
    }

    async cancelOrders (ids: string[], symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#cancelOrders
         * @description cancel multiple orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-multiple-orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order-by-order-id
         * @param {string[]} ids order ids
         * @param {string} [symbol] unified market symbol (not used by hashkey)
         * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const methodName = 'cancelOrders';
        await this.loadMarkets ();
        const request = {};
        let orderIds = '';
        for (let i = 0; i < ids.length; i++) {
            orderIds += this.safeString (ids, i) + ','; // todo comma is url encoded
        }
        orderIds = orderIds.slice (0, -1);
        request['ids'] = orderIds;
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        if (marketType === 'spot') {
            return await this.privateDeleteApiV1SpotCancelOrderByIds (this.extend (request));
            //
            //     {
            //         "code": "0000",
            //         "result": []
            //     }
            //
        } else if (marketType === 'swap') {
            return await this.privateDeleteApiV1FuturesCancelOrderByIds (this.extend (request));
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        /**
         * @method
         * @name hashkey#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-order
         * @param {string} id the order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
         * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
         * @param {string} [params.accountId] *spot markets only* account id to fetch the order from
         * @param {bool} [params.trigger] *swap markets only* true for fetching a trigger order (default false)
         * @param {bool} [params.stop] *swap markets only* an alternative for trigger param
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const methodName = 'fetchOrder';
        this.checkTypeParam (methodName, params);
        await this.loadMarkets ();
        const request: Dict = {};
        let clientOrderId: Str = undefined;
        [ clientOrderId, params ] = this.handleParamString (params, 'clientOrderId');
        if (id !== undefined) {
            request['orderId'] = id;
        } else if (clientOrderId === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires an id argument or clientOrderId parameter');
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            if (clientOrderId !== undefined) {
                request['origClientOrderId'] = clientOrderId;
            }
            let accountId: Str = undefined;
            [ accountId, params ] = this.handleOptionAndParams (params, methodName, 'accountId');
            if (accountId !== undefined) {
                request['accountId'] = accountId;
            }
            response = await this.privateGetApiV1SpotOrder (this.extend (request, params));
            //
            //     {
            //         "accountId": "1732885739589466112",
            //         "exchangeId": "301",
            //         "symbol": "ETHUSDT",
            //         "symbolName": "ETHUSDT",
            //         "clientOrderId": "1722004623170558",
            //         "orderId": "1738695230608169984",
            //         "price": "0",
            //         "origQty": "0",
            //         "executedQty": "0.0061",
            //         "cummulativeQuoteQty": "19.736489",
            //         "cumulativeQuoteQty": "19.736489",
            //         "avgPrice": "3235.49",
            //         "status": "FILLED",
            //         "timeInForce": "IOC",
            //         "type": "MARKET",
            //         "side": "BUY",
            //         "stopPrice": "0.0",
            //         "icebergQty": "0.0",
            //         "time": "1722004623186",
            //         "updateTime": "1722004623406",
            //         "isWorking": true,
            //         "reqAmount": "20",
            //         "feeCoin": "",
            //         "feeAmount": "0",
            //         "sumFeeAmount": "0"
            //     }
            //
        } else if (marketType === 'swap') {
            if (clientOrderId !== undefined) {
                request['clientOrderId'] = clientOrderId;
            }
            let isTrigger = false;
            [ isTrigger, params ] = this.handleTriggerOptionAndParams (params, methodName, isTrigger);
            if (isTrigger) {
                request['type'] = 'STOP'; // todo report type is not mandatory
            }
            response = await this.privateGetApiV1FuturesOrder (this.extend (request, params));
            //
            //     {
            //         "time": "1722429951611",
            //         "updateTime": "1722429951700",
            //         "orderId": "1742263144028363776",
            //         "clientOrderId": "1722429950315",
            //         "symbol": "ETHUSDT-PERPETUAL",
            //         "price": "3460.62",
            //         "leverage": "5",
            //         "origQty": "10",
            //         "executedQty": "10",
            //         "avgPrice": "3327.52",
            //         "marginLocked": "0",
            //         "type": "LIMIT",
            //         "side": "BUY_OPEN",
            //         "timeInForce": "IOC",
            //         "status": "FILLED",
            //         "priceType": "MARKET",
            //         "isLiquidationOrder": false,
            //         "indexPrice": "0",
            //         "liquidationType": ""
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name hashkey#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders
         * @param {string} [symbol] unified market symbol of the market orders were made in - is mandatory for swap markets
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
         * @param {string} [params.orderId] *spot markets only* the id of the order to fetch
         * @param {string} [params.side] *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
         * @param {string} [params.fromOrderId] *swap markets only* the id of the order to start from
         * @param {bool} [params.trigger] *swap markets only* true for fetching trigger orders (default false)
         * @param {bool} [params.stop] *swap markets only* an alternative for trigger param
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const methodName = 'fetchOpenOrders';
        this.checkTypeParam (methodName, params);
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        params = this.extend ({ 'methodName': methodName }, params);
        if (marketType === 'spot') {
            return await this.fetchOpenSpotOrders (symbol, since, limit, params);
        } else if (marketType === 'swap') {
            return await this.fetchOpenSwapOrders (symbol, since, limit, params);
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
    }

    async fetchOpenSpotOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @ignore
         * @name hashkey#fetchOpenSpotOrders
         * @description fetch all unfilled currently open orders for spot markets
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
         * @param {string} [symbol] unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.orderId] the id of the order to fetch
         * @param {string} [params.side] 'buy' or 'sell' - the side of the orders to fetch
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let methodName = 'fetchOpenSpotOrders';
        [ methodName, params ] = this.handleParamString (params, 'methodName', methodName);
        let market: Market = undefined;
        const request: Dict = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let orderId: Str = undefined;
        [ orderId, params ] = this.handleOptionAndParams (params, methodName, 'orderId');
        if (orderId !== undefined) {
            request['orderId'] = orderId;
        }
        let side: Str = undefined;
        [ side, params ] = this.handleOptionAndParams (params, methodName, 'side');
        if (side !== undefined) {
            request['side'] = side.toUpperCase ();
        }
        const response = await this.privateGetApiV1SpotOpenOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "accountId": "1732885739589466112",
        //             "exchangeId": "301",
        //             "symbol": "ETHUSDT",
        //             "symbolName": "ETHUSDT",
        //             "clientOrderId": "1",
        //             "orderId": "1739491435386897152",
        //             "price": "2000",
        //             "origQty": "0.001",
        //             "executedQty": "0",
        //             "cummulativeQuoteQty": "0",
        //             "cumulativeQuoteQty": "0",
        //             "avgPrice": "0",
        //             "status": "NEW",
        //             "timeInForce": "GTC",
        //             "type": "LIMIT",
        //             "side": "BUY",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": "1722099538193",
        //             "updateTime": "1722099538197",
        //             "isWorking": true,
        //             "reqAmount": "0"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenSwapOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @ignore
         * @name hashkey#fetchOpenSwapOrders
         * @description fetch all unfilled currently open orders for swap markets
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders
         * @param {string} symbol *is mandatory* unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve - maximum 500
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.fromOrderId] the id of the order to start from
         * @param {bool} [params.trigger] true for fetching trigger orders (default false)
         * @param {bool} [params.stop] an alternative for trigger param
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let methodName = 'fetchOpenSwapOrders';
        [ methodName, params ] = this.handleParamString (params, 'methodName', methodName);
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument for swap market orders');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let isTrigger = false;
        [ isTrigger, params ] = this.handleTriggerOptionAndParams (params, methodName, isTrigger);
        if (isTrigger) {
            request['type'] = 'STOP';
        } else {
            request['type'] = 'LIMIT';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let fromOrderId: Str = undefined;
        [ fromOrderId, params ] = this.handleOptionAndParams (params, methodName, 'fromOrderId');
        if (fromOrderId !== undefined) {
            request['fromOrderId'] = fromOrderId;
        }
        const response = await this.privateGetApiV1FuturesOpenOrders (this.extend (request, params));
        // 'LIMIT'
        //     [
        //         {
        //             "time": "1722432302919",
        //             "updateTime": "1722432302925",
        //             "orderId": "1742282868229463040",
        //             "clientOrderId": "1722432301670",
        //             "symbol": "ETHUSDT-PERPETUAL",
        //             "price": "4000",
        //             "leverage": "5",
        //             "origQty": "10",
        //             "executedQty": "0",
        //             "avgPrice": "0",
        //             "marginLocked": "0",
        //             "type": "LIMIT_MAKER",
        //             "side": "SELL_CLOSE",
        //             "timeInForce": "GTC",
        //             "status": "NEW",
        //             "priceType": "INPUT",
        //             "isLiquidationOrder": false,
        //             "indexPrice": "0",
        //             "liquidationType": ""
        //         }
        //     ]
        //
        // 'STOP'
        //     [
        //         {
        //             "time": "1722433095688",
        //             "updateTime": "1722433095688",
        //             "orderId": "1742289518466225664",
        //             "accountId": "1735619524953226496",
        //             "clientOrderId": "1722433094438",
        //             "symbol": "ETHUSDT-PERPETUAL",
        //             "price": "3700",
        //             "leverage": "0",
        //             "origQty": "10",
        //             "type": "STOP",
        //             "side": "SELL_CLOSE",
        //             "status": "ORDER_NEW",
        //             "stopPrice": "3600"
        //         }
        //     ]
        return this.parseOrders (response, market, since, limit);
    }

    async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name hashkey#fetchCanceledAndClosedOrders
         * @description fetches information on multiple canceled and closed orders made by the user
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-all-orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-futures-history-orders
         * @param {string} symbol *is mandatory for swap markets* unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for - only supports the last 90 days timeframe
         * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
         * @param {string} [params.orderId] *spot markets only* the id of the order to fetch
         * @param {string} [params.side] *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
         * @param {string} [params.fromOrderId] *swap markets only* the id of the order to start from
         * @param {bool} [params.trigger] *swap markets only* the id of the order to start from true for fetching trigger orders (default false)
         * @param {bool} [params.stop] *swap markets only* the id of the order to start from an alternative for trigger param
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const methodName = 'fetchCanceledAndClosedOrders';
        this.checkTypeParam (methodName, params);
        await this.loadMarkets ();
        const request: Dict = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            if (market !== undefined) {
                request['symbol'] = market['id']; // todo: report - symbol is not mandatory for spot markets
            }
            let orderId: Str = undefined;
            [ orderId, params ] = this.handleOptionAndParams (params, methodName, 'orderId');
            if (orderId !== undefined) {
                request['orderId'] = orderId;
            }
            let side: Str = undefined;
            [ side, params ] = this.handleOptionAndParams (params, methodName, 'side');
            if (side !== undefined) {
                request['side'] = side.toUpperCase ();
            }
            response = await this.privateGetApiV1SpotTradeOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "accountId": "1732885739589466112",
            //             "exchangeId": "301",
            //             "symbol": "ETHUSDT",
            //             "symbolName": "ETHUSDT",
            //             "clientOrderId": "1722082982086472",
            //             "orderId": "1739352552762301440",
            //             "price": "0",
            //             "origQty": "0.001",
            //             "executedQty": "0.001",
            //             "cummulativeQuoteQty": "3.28996",
            //             "cumulativeQuoteQty": "3.28996",
            //             "avgPrice": "3289.96",
            //             "status": "FILLED",
            //             "timeInForce": "IOC",
            //             "type": "MARKET",
            //             "side": "BUY",
            //             "stopPrice": "0.0",
            //             "icebergQty": "0.0",
            //             "time": "1722082982093",
            //             "updateTime": "1722082982097",
            //             "isWorking": true,
            //             "reqAmount": "0"
            //         },
            //         ...
            //     ]
            //
        } else if (marketType === 'swap') {
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument for swap markets');
            }
            request['symbol'] = market['id'];
            let isTrigger = false;
            [ isTrigger, params ] = this.handleTriggerOptionAndParams (params, methodName, isTrigger);
            if (isTrigger) {
                request['type'] = 'STOP';
            } else {
                request['type'] = 'LIMIT';
            }
            let fromOrderId: Str = undefined;
            [ fromOrderId, params ] = this.handleOptionAndParams (params, methodName, 'fromOrderId');
            if (fromOrderId !== undefined) {
                request['fromOrderId'] = fromOrderId;
            }
            response = await this.privateGetApiV1FuturesHistoryOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "time": "1722429951611",
            //             "updateTime": "1722429951700",
            //             "orderId": "1742263144028363776",
            //             "clientOrderId": "1722429950315",
            //             "symbol": "ETHUSDT-PERPETUAL",
            //             "price": "3460.62",
            //             "leverage": "5",
            //             "origQty": "10",
            //             "executedQty": "10",
            //             "avgPrice": "3327.52",
            //             "marginLocked": "0",
            //             "type": "LIMIT",
            //             "side": "BUY_OPEN",
            //             "timeInForce": "IOC",
            //             "status": "FILLED",
            //             "priceType": "MARKET",
            //             "isLiquidationOrder": false,
            //             "indexPrice": "0",
            //             "liquidationType": ""
            //         }
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
        return this.parseOrders (response, market, since, limit);
    }

    checkTypeParam (methodName, params) {
        // some hashkey endpoints have a type param for swap markets that defines the type of an order
        // type param is reserved in ccxt for defining the type of the market
        // current method warns user if he provides the exchange specific value in type parameter
        const paramsType = this.safeString (params, 'type');
        if ((paramsType !== undefined) && (paramsType !== 'spot') && (paramsType !== 'swap')) {
            throw new BadRequest (this.id + ' ' + methodName + ' () type parameter can not be "' + paramsType + '". It should define the type of the market ("spot" or "swap"). To define the type of an order use the trigger parameter (true for trigger orders)');
        }
    }

    handleTriggerOptionAndParams (params: object, methodName: string, defaultValue = undefined) {
        let isStop = defaultValue;
        [ isStop, params ] = this.handleOptionAndParams (params, methodName, 'stop', isStop);
        let isTrigger = isStop;
        [ isTrigger, params ] = this.handleOptionAndParams (params, methodName, 'trigger', isTrigger);
        return [ isTrigger, params ];
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder spot
        //     {
        //         "accountId": "1732885739589466112",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "1722004623170558",
        //         "orderId": "1738695230608169984",
        //         "transactTime": "1722004623186",
        //         "price": "0",
        //         "origQty": "0",
        //         "executedQty": "0.0061",
        //         "status": "FILLED",
        //         "timeInForce": "IOC",
        //         "type": "MARKET",
        //         "side": "BUY",
        //         "reqAmount": "20",
        //         "concentration": ""
        //     }
        //
        // fetchOrder spot
        //     {
        //         "accountId": "1732885739589466112",
        //         "exchangeId": "301",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "1722004623170558",
        //         "orderId": "1738695230608169984",
        //         "price": "0",
        //         "origQty": "0",
        //         "executedQty": "0.0061",
        //         "cummulativeQuoteQty": "19.736489",
        //         "cumulativeQuoteQty": "19.736489",
        //         "avgPrice": "3235.49",
        //         "status": "FILLED",
        //         "timeInForce": "IOC",
        //         "type": "MARKET",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "icebergQty": "0.0",
        //         "time": "1722004623186",
        //         "updateTime": "1722004623406",
        //         "isWorking": true,
        //         "reqAmount": "20",
        //         "feeCoin": "",
        //         "feeAmount": "0",
        //         "sumFeeAmount": "0"
        //     }
        //
        // cancelOrder
        //     {
        //         "accountId": "1732885739589466112",
        //         "symbol": "ETHUSDT",
        //         "clientOrderId": "1722006209978370",
        //         "orderId": "1738708541676585728",
        //         "transactTime": "1722006209989",
        //         "price": "5000",
        //         "origQty": "0.005",
        //         "executedQty": "0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT_MAKER",
        //         "side": "SELL"
        //     }
        //
        // createOrder swap
        //     {
        //         "time": "1722429951611",
        //         "updateTime": "1722429951648",
        //         "orderId": "1742263144028363776",
        //         "clientOrderId": "1722429950315",
        //         "symbol": "ETHUSDT-PERPETUAL",
        //         "price": "3460.62",
        //         "leverage": "5",
        //         "origQty": "10",
        //         "executedQty": "10",
        //         "avgPrice": "0",
        //         "marginLocked": "6.9212",
        //         "type": "LIMIT",
        //         "side": "BUY_OPEN",
        //         "timeInForce": "IOC",
        //         "status": "FILLED",
        //         "priceType": "MARKET",
        //         "contractMultiplier": "0.00100000"
        //     }
        //
        // fetchOrder swap
        //     {
        //         "time": "1722429951611",
        //         "updateTime": "1722429951700",
        //         "orderId": "1742263144028363776",
        //         "clientOrderId": "1722429950315",
        //         "symbol": "ETHUSDT-PERPETUAL",
        //         "price": "3460.62",
        //         "leverage": "5",
        //         "origQty": "10",
        //         "executedQty": "10",
        //         "avgPrice": "3327.52",
        //         "marginLocked": "0",
        //         "type": "LIMIT",
        //         "side": "BUY_OPEN",
        //         "timeInForce": "IOC",
        //         "status": "FILLED",
        //         "priceType": "MARKET",
        //         "isLiquidationOrder": false,
        //         "indexPrice": "0",
        //         "liquidationType": ""
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'transactTime', 'time');
        const status = this.safeString (order, 'status');
        let type = this.safeString (order, 'type');
        const priceType = this.safeString (order, 'priceType');
        if (priceType === 'MARKET') {
            type = 'market';
        }
        let price = this.omitZero (this.safeString (order, 'price'));
        if (type === 'STOP') {
            if (price === undefined) {
                type = 'market';
            } else {
                type = 'limit';
            }
        } else {
            type = this.parseOrderType (type);
        }
        const average = this.omitZero (this.safeString (order, 'avgPrice'));
        if (price === undefined) {
            price = average;
        }
        let side = this.safeStringLower (order, 'side');
        const parts = side.split ('_');
        side = parts[0];
        let reduceOnly: Bool = undefined;
        const secondPart = this.safeString (parts, 1);
        if (secondPart !== undefined) {
            if (secondPart === 'open') {
                reduceOnly = false;
            } else if ((secondPart === 'close')) {
                reduceOnly = true;
            }
        }
        let postOnly = type === 'LIMIT_MAKER'; // for spot markets
        let timeInForce = this.safeString (order, 'timeInForce');
        if (timeInForce === 'LIMIT_MAKER') { // for swap markets
            postOnly = true;
            timeInForce = 'PO';
        }
        let feeCurrncyId = this.safeString (order, 'feeCoin');
        if (feeCurrncyId === '') {
            feeCurrncyId = undefined;
        }
        const triggerPrice = this.omitZero (this.safeString (order, 'stopPrice'));
        return this.safeOrder ({
            'id': this.safeString (order, 'orderId'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': this.safeInteger (order, 'updateTime'),
            'status': this.parseOrderStatus (status),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'average': average,
            'amount': this.omitZero (this.safeString (order, 'origQty')),
            'filled': this.safeString (order, 'executedQty'),
            'remaining': undefined,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'cost': this.omitZero (this.safeString2 (order, 'cumulativeQuoteQty', 'cummulativeQuoteQty')),
            'trades': undefined,
            'fee': {
                'currency': this.safeCurrencyCode (feeCurrncyId), // todo check - orders return empty field
                'amount': this.omitZero (this.safeString (order, 'feeAmount')), // todo check - orders return 0
            },
            'reduceOnly': reduceOnly,
            'postOnly': postOnly,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'PARTIALLY_FILLED': 'open',
            'PARTIALLY_CANCELED': 'canceled',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'ORDER_CANCELED': 'canceled',
            'PENDING_CANCEL': 'canceled',
            'REJECTED': 'rejected',
            'ORDER_NEW': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
            'MARKET_OF_BASE': 'market',
        };
        return this.safeString (types, type, type);
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name hashkey#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
            'timestamp': this.milliseconds (),
        };
        const response = await this.publicGetApiV1FuturesFundingRate (this.extend (request, params));
        //
        //     [
        //         { "symbol": "ETHUSDT-PERPETUAL", "rate": "0.0001", "nextSettleTime": "1722297600000" }
        //     ]
        //
        const rate = this.safeDict (response, 0, {});
        return this.parseFundingRate (rate, market);
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request: Dict = {
            'timestamp': this.milliseconds (), // todo the exchange accepts any integer
        };
        const response = await this.publicGetApiV1FuturesFundingRate (this.extend (request, params));
        //
        //     [
        //         { "symbol": "BTCUSDT-PERPETUAL", "rate": "0.0001", "nextSettleTime": "1722297600000" },
        //         { "symbol": "ETHUSDT-PERPETUAL", "rate": "0.0001", "nextSettleTime": "1722297600000" }
        //     ]
        //
        const fundingRates = this.parseFundingRates (response);
        return this.filterByArray (fundingRates, 'symbol', symbols);
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        // fetchFundingRates
        //     {
        //         "symbol": "ETHUSDT-PERPETUAL",
        //         "rate": "0.0001",
        //         "nextSettleTime": "1722297600000"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'swap');
        const fundingRate = this.safeNumber (contract, 'rate');
        const fundingTimestamp = this.safeInteger (contract, 'nextSettleTime');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': fundingTimestamp,
            'nextFundingDatetime': this.iso8601 (fundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-history-funding-rate
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.fromId] the id of the entry to start from
         * @param {int} [params.endId] the id of the entry to end with
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let fromId: Int = undefined;
        [ fromId, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'fromId');
        if (fromId !== undefined) {
            request['fromId'] = fromId;
        }
        let endId: Int = undefined;
        [ endId, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'endId');
        if (endId !== undefined) {
            request['endId'] = endId;
        }
        // todo timestamp is not mandatory
        const response = await this.publicGetApiV1FuturesHistoryFundingRate (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "10698",
        //             "symbol": "ETHUSDT-PERPETUAL",
        //             "settleTime": "1722268800000",
        //             "settleRate": "0.0001"
        //         },
        //         ...
        //     ]
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (this.safeString (entry, 'symbol'), market, undefined, 'swap'),
                'fundingRate': this.safeNumber (entry, 'settleRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit) as FundingRateHistory[];
    }

    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        /**
         * @method
         * @description fetch open positions for a market
         * @name hashkey#fetchPositions
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions
         * @description fetch all open positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.side] 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        const methodName = 'fetchPositions';
        if ((symbols === undefined) || (symbols.length < 1)) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a symbol argument with one single market symbol');
        } else if (symbols.length > 1) {
            throw new NotSupported (this.id + ' ' + methodName + '() is supported for a symbol argument with one single market symbol only');
        }
        await this.loadMarkets ();
        return await this.fetchPositionsForSymbol (symbols[0], this.extend ({ 'methodName': 'fetchPositions' }, params));
    }

    async fetchPositionsForSymbol (symbol: string, params = {}): Promise<Position[]> {
        /**
         * @method
         * @description fetch open positions for a single market
         * @name hashkey#fetchPositionsForSymbol
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions
         * @description fetch all open positions for specific symbol
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.side] 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let methodName = 'fetchPosition';
        [ methodName, params ] = this.handleParamString (params, 'methodName', methodName);
        if (!market['swap']) {
            throw new NotSupported (this.id + ' ' + methodName + '() supports swap markets only');
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        let side: Str = undefined;
        [ side, params ] = this.handleOptionAndParams (params, methodName, 'side');
        if (side !== undefined) {
            request['side'] = side.toUpperCase ();
        }
        const response = await this.privateGetApiV1FuturesPositions (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "ETHUSDT-PERPETUAL",
        //             "side": "LONG",
        //             "avgPrice": "3327.52",
        //             "position": "10",
        //             "available": "0",
        //             "leverage": "5",
        //             "lastPrice": "3324.44",
        //             "positionValue": "33.2752",
        //             "liquidationPrice": "-953.83",
        //             "margin": "6.9012",
        //             "marginRate": "",
        //             "unrealizedPnL": "-0.0288",
        //             "profitRate": "-0.0041",
        //             "realizedPnL": "-0.0199",
        //             "minMargin": "0.2173"
        //         }
        //     ]
        //
        return this.parsePositions (response, [ symbol ]);
    }

    parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        return this.safePosition ({
            'symbol': symbol,
            'id': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'contracts': this.safeNumber (position, 'position'),
            'contractSize': undefined,
            'side': this.safeStringLower (position, 'side'),
            'notional': this.safeNumber (position, 'positionValue'),
            'leverage': this.safeInteger (position, 'leverage'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnL'),
            'realizedPnl': this.safeNumber (position, 'realizedPnL'),
            'collateral': undefined,
            'entryPrice': this.safeNumber (position, 'avgPrice'),
            'markPrice': undefined,
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'marginMode': 'cross',
            'hedged': true,
            'maintenanceMargin': this.safeNumber (position, 'minMargin'),
            'maintenanceMarginPercentage': undefined,
            'initialMargin': this.safeNumber (position, 'margin'),
            'initialMarginPercentage': undefined,
            'marginRatio': undefined,
            'lastUpdateTimestamp': undefined,
            'lastPrice': this.safeNumber (position, 'lastPrice'),
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
            'percentage': undefined,
            'info': position,
        });
    }

    async fetchLeverage (symbol: string, params = {}): Promise<Leverage> {
        /**
         * @method
         * @name hashkey#fetchLeverage
         * @description fetch the set leverage for a market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/query-futures-leverage-trade
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.privateGetApiV1FuturesLeverage (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbolId": "ETHUSDT-PERPETUAL",
        //             "leverage": "5",
        //             "marginType": "CROSS"
        //         }
        //     ]
        //
        const leverage = this.safeDict (response, 0, {});
        return this.parseLeverage (leverage, market);
    }

    parseLeverage (leverage: Dict, market: Market = undefined): Leverage {
        let marginMode = this.safeString (leverage, 'marginType');
        if (marginMode !== undefined) {
            marginMode = marginMode.toLowerCase ();
        }
        const leverageValue = this.safeNumber (leverage, 'leverage');
        return {
            'info': leverage,
            'symbol': market['symbol'],
            'marginMode': marginMode,
            'longLeverage': leverageValue,
            'shortLeverage': leverageValue,
        } as Leverage;
    }

    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#setLeverage
         * @description set the level of leverage for a market
         * @see https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets ();
        const request: Dict = {
            'leverage': leverage,
        };
        const market = this.market (symbol);
        request['symbol'] = market['id'];
        const response = await this.privatePostApiV1FuturesLeverage (this.extend (request, params));
        //
        //     {
        //         "code": "0000",
        //         "symbolId": "ETHUSDT-PERPETUAL",
        //         "leverage": "3"
        //     }
        //
        return this.parseLeverage (response, market);
    }

    async fetchLeverageTiers (symbols: Strings = undefined, params = {}): Promise<LeverageTiers> {
        /**
         * @method
         * @name hashkey#fetchLeverageTiers
         * @see https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.publicGetApiV1ExchangeInfo (params);
        // response is the same as in fetchMarkets()
        const data = this.safeList (response, 'contracts', []);
        symbols = this.marketSymbols (symbols);
        return this.parseLeverageTiers (data, symbols, 'symbol');
    }

    parseMarketLeverageTiers (info, market: Market = undefined): LeverageTier[] {
        //
        //     {
        //         "filters": [
        //             {
        //                 "minPrice": "0.1",
        //                 "maxPrice": "100000.00000000",
        //                 "tickSize": "0.1",
        //                 "filterType": "PRICE_FILTER"
        //             },
        //             {
        //                 "minQty": "0.001",
        //                 "maxQty": "10",
        //                 "stepSize": "0.001",
        //                 "marketOrderMinQty": "0",
        //                 "marketOrderMaxQty": "0",
        //                 "filterType": "LOT_SIZE"
        //             },
        //             {
        //                 "minNotional": "0",
        //                 "filterType": "MIN_NOTIONAL"
        //             },
        //             {
        //                 "maxSellPrice": "999999",
        //                 "buyPriceUpRate": "0.05",
        //                 "sellPriceDownRate": "0.05",
        //                 "maxEntrustNum": 200,
        //                 "maxConditionNum": 200,
        //                 "filterType": "LIMIT_TRADING"
        //             },
        //             {
        //                 "buyPriceUpRate": "0.05",
        //                 "sellPriceDownRate": "0.05",
        //                 "filterType": "MARKET_TRADING"
        //             },
        //             {
        //                 "noAllowMarketStartTime": "0",
        //                 "noAllowMarketEndTime": "0",
        //                 "limitOrderStartTime": "0",
        //                 "limitOrderEndTime": "0",
        //                 "limitMinPrice": "0",
        //                 "limitMaxPrice": "0",
        //                 "filterType": "OPEN_QUOTE"
        //             }
        //         ],
        //         "exchangeId": "301",
        //         "symbol": "BTCUSDT-PERPETUAL",
        //         "symbolName": "BTCUSDT-PERPETUAL",
        //         "status": "TRADING",
        //         "baseAsset": "BTCUSDT-PERPETUAL",
        //         "baseAssetPrecision": "0.001",
        //         "quoteAsset": "USDT",
        //         "quoteAssetPrecision": "0.1",
        //         "icebergAllowed": false,
        //         "inverse": false,
        //         "index": "USDT",
        //         "marginToken": "USDT",
        //         "marginPrecision": "0.0001",
        //         "contractMultiplier": "0.001",
        //         "underlying": "BTC",
        //         "riskLimits": [
        //             {
        //                 "riskLimitId": "200000722",
        //                 "quantity": "1000.00",
        //                 "initialMargin": "0.10",
        //                 "maintMargin": "0.005",
        //                 "isWhite": false
        //             },
        //             {
        //                 "riskLimitId": "200000723",
        //                 "quantity": "2000.00",
        //                 "initialMargin": "0.10",
        //                 "maintMargin": "0.01",
        //                 "isWhite": false
        //             }
        //         ]
        //     }
        //
        const riskLimits = this.safeList (info, 'riskLimits', []);
        const id = this.safeString (info, 'symbol');
        market = this.safeMarket (id, market);
        const tiers = [];
        for (let i = 0; i < riskLimits.length; i++) {
            const tier = riskLimits[i];
            const initialMarginRate = this.safeString (tier, 'initialMargin');
            tiers.push ({
                'tier': this.sum (i, 1),
                'currency': market['settle'],
                'minNotional': undefined,
                'maxNotional': this.safeNumber (tier, 'quantity'), // todo check
                'maintenanceMarginRate': this.safeNumber (tier, 'maintMargin'),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRate)),
                'info': tier,
            });
        }
        return tiers;
    }

    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        /**
         * @method
         * @name hashkey#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://developers.binance.com/docs/wallet/asset/trade-fee // spot
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-commission-rate-request-weight // swap
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const methodName = 'fetchTradingFee';
        let response = undefined;
        if (market['spot']) {
            response = await this.fetchTradingFees (params);
            return this.safeDict (response, symbol) as TradingFeeInterface;
        } else if (market['swap']) {
            response = await this.privateGetApiV1FuturesCommissionRate (this.extend ({ 'symbol': market['id'] }, params));
            return this.parseTradingFee (response, market);
            //
            //     {
            //         "openMakerFee": "0.00025",
            //         "openTakerFee": "0.0006",
            //         "closeMakerFee": "0.00025",
            //         "closeTakerFee": "0.0006"
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + market['type'] + ' type of markets');
        }
    }

    async fetchTradingFees (params = {}): Promise<TradingFees> {
        /**
         * @method
         * @name binance#fetchTradingFees
         * @description *for spot markets only* fetch the trading fees for multiple markets
         * @see https://developers.binance.com/docs/wallet/asset/trade-fee
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateGetApiV1AccountVipInfo (params);
        //
        //     {
        //         "code": 0,
        //         "vipLevel": "0",
        //         "tradeVol30Day": "67",
        //         "totalAssetBal": "0",
        //         "data": [
        //             {
        //                 "symbol": "UXLINKUSDT",
        //                 "productType": "Token-Token",
        //                 "buyMakerFeeCurrency": "UXLINK",
        //                 "buyTakerFeeCurrency": "UXLINK",
        //                 "sellMakerFeeCurrency": "USDT",
        //                 "sellTakerFeeCurrency": "USDT",
        //                 "actualMakerRate": "0.0012",
        //                 "actualTakerRate": "0.0012"
        //             },
        //             ...
        //         ],
        //         "updateTimestamp": "1722320137809"
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const fee = this.safeDict (data, i, {});
            const parsedFee = this.parseTradingFee (fee);
            result[parsedFee['symbol']] = parsedFee;
        }
        return result;
    }

    parseTradingFee (fee: Dict, market: Market = undefined): TradingFeeInterface {
        //
        // spot
        //     {
        //         "symbol": "UXLINKUSDT",
        //         "productType": "Token-Token",
        //         "buyMakerFeeCurrency": "UXLINK",
        //         "buyTakerFeeCurrency": "UXLINK",
        //         "sellMakerFeeCurrency": "USDT",
        //         "sellTakerFeeCurrency": "USDT",
        //         "actualMakerRate": "0.0012",
        //         "actualTakerRate": "0.0012"
        //     }
        //
        // swap
        //     {
        //         "openMakerFee": "0.00025",
        //         "openTakerFee": "0.0006",
        //         "closeMakerFee": "0.00025",
        //         "closeTakerFee": "0.0006"
        //     }
        //
        const marketId = this.safeString (fee, 'symbol');
        market = this.safeMarket (marketId, market);
        return {
            'info': fee,
            'symbol': market['symbol'],
            'maker': this.safeNumber2 (fee, 'openMakerFee', 'actualMakerRate'),
            'taker': this.safeNumber2 (fee, 'openTakerFee', 'actualTakerRate'),
            'percentage': true, // todo check
            'tierBased': true, // todo check
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ();
            const additionalParams = {
                'timestamp': timestamp,
            };
            const recvWindow = this.safeInteger (this.options, 'recvWindow');
            if (recvWindow !== undefined) {
                additionalParams['recvWindow'] = recvWindow;
            }
            const totalParams = this.extend (additionalParams, params);
            const signature = this.hmac (this.encode (this.customUrlencode (totalParams)), this.encode (this.secret), sha256);
            totalParams['signature'] = signature;
            const totalParamsString = this.customUrlencode (totalParams);
            if (method === 'GET') {
                url += '?' + totalParamsString;
            } else {
                body = totalParamsString;
            }
            headers = {
                'X-HK-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
        } else {
            const query = this.urlencode (params);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    customUrlencode (params: Dict = {}): Str {
        let result = this.urlencode (params);
        result = result.replace ('%2C', ',');
        return result;
    }
}
