
// ---------------------------------------------------------------------------

import Exchange from './abstract/hashkey.js';
import { ArgumentsRequired, NotSupported } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Bool, Currencies, Currency, Dict, LastPrice, LastPrices, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Trade, Transaction } from './base/types.js';

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
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
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
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
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
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
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
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': 'emulated',
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
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
                        'quote/v1/ticker/bookTicker': 1,
                        'quote/v1/depth/merged': 1,
                        'quote/v1/markPrice': 1,
                        'quote/v1/index': 1,
                        'api/v1/ping': 1,
                        'api/v1/time': 5, // done
                    },
                },
                'private': {
                    'get': {
                        'api/v1/spot/order': 1, // done
                        'api/v1/spot/openOrders': 1,
                        'api/v1/spot/tradeOrders': 1,
                        'api/v1/futures/leverage': 1,
                        'api/v1/futures/order': 1,
                        'api/v1/futures/openOrders': 1,
                        'api/v1/futures/userTrades': 1,
                        'api/v1/futures/positions': 1,
                        'api/v1/futures/historyOrders': 1,
                        'api/v1/futures/balance': 1,
                        'api/v1/futures/liquidationAssignStatus': 1,
                        'api/v1/futures/fundingRate': 1,
                        'api/v1/futures/historyFundingRate': 1,
                        'api/v1/futures/riskLimit': 1,
                        'api/v1/futures/commissionRate': 1,
                        'api/v1/futures/getBestOrders': 1,
                        'api/v1/account/vipInfo': 1,
                        'api/v1/account': 1, // done
                        'api/v1/account/trades': 1,
                        'api/v1/account/types': 1,
                        'api/v1/account/checkApiKey': 1,
                        'api/v1/account/balanceFlow': 1,
                        'api/v1/spot/subAccount/openOrders': 1,
                        'api/v1/spot/subAccount/tradeOrders': 1,
                        'api/v1/subAccount/trades': 1,
                        'api/v1/futures/subAccount/openOrders': 1,
                        'api/v1/futures/subAccount/historyOrders': 1,
                        'api/v1/futures/subAccount/userTrades': 1,
                        'api/v1/account/deposit/address': 1, // done
                        'api/v1/account/depositOrders': 1, // done
                        'api/v1/account/withdrawOrders': 1, // done
                    },
                    'post': {
                        'api/v1/userDataStream': 1,
                        'api/v1/spot/orderTest': 1,
                        'api/v1/spot/order': 1, // done
                        'api/v1.1/spot/order': 1, // done
                        'api/v1/spot/batchOrders': 5,
                        'api/v1/futures/leverage': 1,
                        'api/v1/futures/order': 1,
                        'api/v1/futures/position/trading-stop': 1,
                        'api/v1/futures/batchOrders': 1,
                        'api/v1/account/assetTransfer': 1,
                        'api/v1/account/authAddress': 1,
                        'api/v1/account/withdraw': 1,
                    },
                    'delete': {
                        'api/v1/spot/order': 1, // done
                        'api/v1/spot/openOrders': 1,
                        'api/v1/spot/cancelOrderByIds': 1,
                        'api/v1/futures/order': 1,
                        'api/v1/futures/batchOrders': 1,
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
                    // {"code":"0001","msg":"Required field symbol missing or invalid"}
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
            'contractSize': this.safeNumber (market, 'contractMultiplier'), // todo check
            'linear': isLinear,
            'inverse': isInverse,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber (amountFilter, 'stepSize'),
                'price': this.safeNumber (priceFilter, 'tickSize'),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber (amountFilter, 'minQty'),
                    'max': this.safeNumber (amountFilter, 'maxQty'),
                },
                'price': {
                    'min': this.safeNumber (priceFilter, 'minPrice'),
                    'max': this.safeNumber (priceFilter, 'maxPrice'),
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
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
        const timestamp = this.safeInteger (trade, 't');
        const symbol = this.safeString (market, 'symbol');
        const price = this.safeString (trade, 'p');
        const amount = this.safeString (trade, 'q');
        return this.safeTrade ({
            'id': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': undefined,
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
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
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
        let accountId: Str = undefined;
        [ accountId, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'accountId');
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
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
        }
        let fromId: Str = undefined;
        [ fromId, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'fromId');
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
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
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
        //             "platform": "Binance"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit, { 'type': 'withdrawal' }); // todo check after making a withdrawal
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
        //         "platform": "Binance"
        //     }
        //
        const id = this.safeString (transaction, 'id');
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
        };
        return this.safeString (statuses, status, status);
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
         * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER' or 'STOP'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of you want to trade in units of the base currency
         * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
         * @param {boolean} [params.test] *spot only* whether to use the test endpoint or not, default is false
         * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
         * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
         * @param {string} [params.clientOrderId] a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (symbol, type, side, amount, price, params);
        } else {
            throw new NotSupported (this.id + ' createOrder() is not supported for ' + market['type'] + ' markets');
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
         * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
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
        const cost = this.safeString (params, 'cost');
        if (cost !== undefined) {
            params = this.omit (params, 'cost');
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
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            params['newClientOrderId'] = clientOrderId;
        }
        return this.extend (request, params);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name hashkey#cancelOrder
         * @description cancels an open order
         * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        if (id !== undefined) {
            request['orderId'] = id;
        } else {
            const clientOrderId = this.safeString (params, 'clientOrderId');
            params = this.omit (params, 'clientOrderId');
            request['clientOrderId'] = clientOrderId;
        }
        const response = await this.privateDeleteApiV1SpotOrder (this.extend (request, params));
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
        return this.parseOrder (response);
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
         * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
         * @param {string} [params.accountId] account id to fetch the order from
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request: Dict = {};
        if (id !== undefined) {
            request['orderId'] = id;
        } else {
            const clientOrderId = this.safeString (params, 'clientOrderId');
            params = this.omit (params, 'clientOrderId');
            request['origClientOrderId'] = clientOrderId;
        }
        let accountId: Str = undefined;
        [ accountId, params ] = this.handleOptionAndParams (params, 'fetchOrder', 'accountId');
        if (accountId !== undefined) {
            request['accountId'] = accountId;
        }
        const response = await this.privateGetApiV1SpotOrder (this.extend (request, params));
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
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name hashkey#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.orderId] the id of the order to fetch
         * @param {string} [params.side] 'buy' or 'sell' - the side of the orders to fetch
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        const market = this.market (symbol);
        await this.loadMarkets ();
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let orderId: Str = undefined;
        [ orderId, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'orderId');
        if (orderId !== undefined) {
            request['orderId'] = orderId;
        }
        let side: Str = undefined;
        [ side, params ] = this.handleOptionAndParams (params, 'fetchOpenOrders', 'side');
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

    parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // createOrder
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
        // fetchOrder
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
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (order, 'transactTime', 'time');
        const status = this.safeString (order, 'status');
        const type = this.safeString (order, 'type');
        let price = this.omitZero (this.safeString (order, 'price'));
        const average = this.omitZero (this.safeString (order, 'avgPrice'));
        if (price === undefined) {
            price = average;
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
            'type': this.parseOrderType (type),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'side': this.safeStringLower (order, 'side'),
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
            'reduceOnly': undefined,
            'postOnly': type === 'LIMIT_MAKER',
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
            'PENDING_CANCEL': 'canceled',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type) {
        const types = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
        };
        return this.safeString (types, type, type);
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
            const signature = this.hmac (this.encode (this.urlencode (totalParams)), this.encode (this.secret), sha256);
            totalParams['signature'] = signature;
            const totalParamsString = this.urlencode (totalParams);
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
}
