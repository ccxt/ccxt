'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dydx$1 = require('./abstract/dydx.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');
var sha3 = require('./static_dependencies/noble-hashes/sha3.js');
var secp256k1 = require('./static_dependencies/noble-curves/secp256k1.js');
var crypto = require('./base/functions/crypto.js');

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
/**
 * @class dydx
 * @augments Exchange
 */
class dydx extends dydx$1["default"] {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'dydx',
            'name': 'dYdX',
            'countries': ['US'],
            'rateLimit': 100,
            'version': 'v4',
            'certified': false,
            'dex': true,
            'pro': true,
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
                'cancelOrder': true,
                'cancelOrders': true,
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
                'fetchAccounts': true,
                'fetchBalance': true,
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
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': true,
                'fetchFundingHistory': false,
                'fetchFundingInterval': false,
                'fetchFundingIntervals': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
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
                'fetchTransfers': true,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
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
                'logo': 'https://github.com/user-attachments/assets/617ea0c1-f05a-4d26-9fcb-a0d1d4091ae1',
                'api': {
                    'indexer': 'https://indexer.dydx.trade/v4',
                    'nodeRpc': 'https://dydx-ops-rpc.kingnodes.com',
                    'nodeRest': 'https://dydx-rest.publicnode.com',
                },
                'test': {
                    'indexer': 'https://indexer.v4testnet.dydx.exchange/v4',
                    'nodeRpc': 'https://test-dydx-rpc.kingnodes.com',
                    'nodeRest': 'https://test-dydx-rest.kingnodes.com',
                },
                'www': 'https://www.dydx.xyz',
                'doc': [
                    'https://docs.dydx.xyz',
                ],
                'fees': [
                    'https://docs.dydx.exchange/introduction-trading_fees',
                ],
                'referral': 'dydx.trade?ref=ccxt',
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
                        'height': 0.1,
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
                'nodeRpc': {
                    'get': {
                        'abci_info': 1,
                        'block': 1,
                        'broadcast_tx_async': 1,
                        'broadcast_tx_sync': 1,
                        'tx': 1,
                    },
                },
                'nodeRest': {
                    'get': {
                        'cosmos/auth/v1beta1/account_info/{dydxAddress}': 1,
                    },
                    'post': {
                        'cosmos/tx/v1beta1/encode': 1,
                        'cosmos/tx/v1beta1/simulate': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.0001'),
                    'taker': this.parseNumber('0.0005'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'privateKey': false,
            },
            'options': {
                'mnemonic': undefined,
                'chainName': 'dydx-mainnet-1',
                'chainId': 1,
                'sandboxMode': false,
                'defaultFeeDenom': 'uusdc',
                'defaultFeeMultiplier': '1.6',
                'feeDenom': {
                    'USDC_DENOM': 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
                    'USDC_GAS_DENOM': 'uusdc',
                    'USDC_DECIMALS': 6,
                    'USDC_GAS_PRICE': '0.025',
                    'CHAINTOKEN_DENOM': 'adydx',
                    'CHAINTOKEN_DECIMALS': 18,
                    'CHAINTOKEN_GAS_PRICE': '25000000000',
                },
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': {
                            'last': true,
                            'mark': true,
                            'index': false,
                        },
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
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
                    // error collision for clob and sending modules from 2 - 8
                    // https://github.com/dydxprotocol/v4-chain/blob/5f9f6c9b95cc87d732e23de764909703b81a6e8b/protocol/x/clob/types/errors.go#L320
                    // https://github.com/dydxprotocol/v4-chain/blob/5f9f6c9b95cc87d732e23de764909703b81a6e8b/protocol/x/sending/types/errors.go
                    '9': errors.InvalidOrder,
                    '10': errors.InvalidOrder,
                    '11': errors.InvalidOrder,
                    '12': errors.InvalidOrder,
                    '13': errors.InvalidOrder,
                    '14': errors.InvalidOrder,
                    '15': errors.InvalidOrder,
                    '16': errors.InvalidOrder,
                    '17': errors.InvalidOrder,
                    '18': errors.InvalidOrder,
                    '19': errors.InvalidOrder,
                    '20': errors.InvalidOrder,
                    '21': errors.InvalidOrder,
                    '22': errors.InvalidOrder,
                    '23': errors.InvalidOrder,
                    '24': errors.InvalidOrder,
                    '25': errors.InvalidOrder,
                    '26': errors.InvalidOrder,
                    '27': errors.InvalidOrder,
                    '28': errors.InvalidOrder,
                    '29': errors.InvalidOrder,
                    '30': errors.InvalidOrder,
                    '31': errors.InvalidOrder,
                    '32': errors.InvalidOrder,
                    '33': errors.InvalidOrder,
                    '34': errors.InvalidOrder,
                    '35': errors.InvalidOrder,
                    '36': errors.InvalidOrder,
                    '37': errors.InvalidOrder,
                    '39': errors.InvalidOrder,
                    '40': errors.InvalidOrder,
                    '41': errors.InvalidOrder,
                    '42': errors.InvalidOrder,
                    '43': errors.InvalidOrder,
                    '44': errors.InvalidOrder,
                    '45': errors.InvalidOrder,
                    '46': errors.InvalidOrder,
                    '47': errors.InvalidOrder,
                    '48': errors.InvalidOrder,
                    '49': errors.InvalidOrder,
                    '50': errors.InvalidOrder,
                    '1000': errors.BadRequest,
                    '1001': errors.BadRequest,
                    '1002': errors.BadRequest,
                    '1003': errors.InvalidOrder,
                    '1004': errors.InvalidOrder,
                    '1005': errors.InvalidOrder,
                    '1006': errors.InvalidOrder,
                    '1007': errors.InvalidOrder,
                    '1008': errors.InvalidOrder,
                    '1009': errors.InvalidOrder,
                    '1010': errors.InvalidOrder,
                    '1011': errors.InvalidOrder,
                    '1012': errors.InvalidOrder,
                    '1013': errors.InvalidOrder,
                    '1014': errors.InvalidOrder,
                    '1015': errors.InvalidOrder,
                    '1017': errors.InvalidOrder,
                    '1018': errors.InvalidOrder,
                    '1019': errors.InvalidOrder,
                    '1020': errors.InvalidOrder,
                    '1021': errors.InvalidOrder,
                    '1022': errors.InvalidOrder,
                    '2000': errors.InvalidOrder,
                    '2001': errors.InvalidOrder,
                    '2002': errors.InvalidOrder,
                    '2003': errors.InvalidOrder,
                    '2004': errors.InvalidOrder,
                    '2005': errors.InvalidOrder,
                    '3000': errors.InvalidOrder,
                    '3001': errors.InvalidOrder,
                    '3002': errors.InvalidOrder,
                    '3003': errors.InvalidOrder,
                    '3004': errors.InvalidOrder,
                    '3005': errors.InvalidOrder,
                    '3006': errors.InvalidOrder,
                    '3007': errors.InvalidOrder,
                    '3008': errors.InvalidOrder,
                    '3009': errors.InvalidOrder,
                    '3010': errors.InvalidOrder,
                    '4000': errors.InvalidOrder,
                    '4001': errors.InvalidOrder,
                    '4002': errors.InvalidOrder,
                    '4003': errors.InvalidOrder,
                    '4004': errors.InvalidOrder,
                    '4005': errors.InvalidOrder,
                    '4006': errors.InvalidOrder,
                    '4007': errors.InvalidOrder,
                    '4008': errors.InvalidOrder,
                    '5000': errors.InvalidOrder,
                    '5001': errors.InvalidOrder,
                    '6000': errors.InvalidOrder,
                    '6001': errors.InvalidOrder,
                    '6002': errors.InvalidOrder,
                    '9000': errors.InvalidOrder,
                    '9001': errors.InvalidOrder,
                    '9002': errors.InvalidOrder,
                    '9003': errors.InvalidOrder,
                    '10000': errors.InvalidOrder,
                    '10001': errors.InvalidOrder,
                    '11000': errors.InvalidOrder, // Invalid order router address
                },
                'broad': {
                    'insufficient funds': errors.InsufficientFunds,
                },
            },
            'precisionMode': number.TICK_SIZE,
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
    async fetchTime(params = {}) {
        const response = await this.indexerGetTime(params);
        //
        // {
        //     "iso": "2025-07-20T15:12:13.466Z",
        //     "epoch": 1753024333.466
        // }
        //
        return this.safeInteger(response, 'epoch');
    }
    parseMarket(market) {
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
        const marketId = this.safeString(market, 'ticker');
        const parts = marketId.split('-');
        const baseName = this.safeString(parts, 0);
        const baseId = this.safeString(market, 'baseId', baseName); // idk where 'baseId' comes from, but leaving as is
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const settleId = 'USDC';
        const settle = this.safeCurrencyCode(settleId);
        const symbol = base + '/' + quote + ':' + settle;
        const contract = true;
        const swap = true;
        const amountPrecisionStr = this.safeString(market, 'stepSize');
        const pricePrecisionStr = this.safeString(market, 'tickSize');
        const status = this.safeString(market, 'status');
        let active = true;
        if (status !== 'ACTIVE') {
            active = false;
        }
        return this.safeMarketStructure({
            'id': this.safeString(market, 'ticker'),
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
            'contractSize': this.parseNumber('1'),
            'linear': true,
            'inverse': false,
            'taker': undefined,
            'maker': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber(amountPrecisionStr),
                'price': this.parseNumber(pricePrecisionStr),
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
    async fetchMarkets(params = {}) {
        const request = {
        // 'limit': 1000,
        };
        const response = await this.indexerGetPerpetualMarkets(this.extend(request, params));
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
        const data = this.safeDict(response, 'markets', {});
        const markets = Object.values(data);
        return this.parseMarkets(markets);
    }
    parseTrade(trade, market = undefined) {
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
        const timestamp = this.parse8601(this.safeString(trade, 'createdAt'));
        const symbol = market['symbol'];
        const price = this.safeString(trade, 'price');
        const amount = this.safeString(trade, 'size');
        const side = this.safeStringLower(trade, 'side');
        const id = this.safeString(trade, 'id');
        return this.safeTrade({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.indexerGetTradesPerpetualMarketMarket(this.extend(request, params));
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
        const rows = this.safeList(response, 'trades', []);
        return this.parseTrades(rows, market, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
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
            this.parse8601(this.safeString(ohlcv, 'startedAt')),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'baseTokenVolume'),
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
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
            'resolution': this.safeString(this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = Math.min(limit, 1000);
        }
        if (since !== undefined) {
            request['fromIso'] = this.iso8601(since);
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (until !== undefined) {
            request['toIso'] = this.iso8601(until);
        }
        const response = await this.indexerGetCandlesPerpetualMarketsMarket(this.extend(request, params));
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
        const rows = this.safeList(response, 'candles', []);
        return this.parseOHLCVs(rows, market, timeframe, since, limit);
    }
    /**
     * @method
     * @name dydx#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.dydx.xyz/indexer-client/http#get-historical-funding
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['effectiveBeforeOrAt'] = this.iso8601(until);
        }
        const response = await this.indexerGetHistoricalFundingMarket(this.extend(request, params));
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
        const rows = this.safeList(response, 'historicalFunding', []);
        for (let i = 0; i < rows.length; i++) {
            const entry = rows[i];
            const timestamp = this.parse8601(this.safeString(entry, 'effectiveAt'));
            const marketId = this.safeString(entry, 'ticker');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(marketId, market),
                'fundingRate': this.safeNumber(entry, 'rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    handlePublicAddress(methodName, params) {
        let userAux = undefined;
        [userAux, params] = this.handleOptionAndParams(params, methodName, 'user');
        let user = userAux;
        [user, params] = this.handleOptionAndParams(params, methodName, 'address', userAux);
        if ((user !== undefined) && (user !== '')) {
            return [user, params];
        }
        if ((this.walletAddress !== undefined) && (this.walletAddress !== '')) {
            return [this.walletAddress, params];
        }
        throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() requires a user parameter inside \'params\' or the walletAddress set');
    }
    parseOrder(order, market = undefined) {
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
        const status = this.parseOrderStatus(this.safeStringUpper(order, 'status'));
        const marketId = this.safeString(order, 'ticker');
        const symbol = this.safeSymbol(marketId, market);
        const filled = this.safeString(order, 'totalFilled');
        const timestamp = this.parse8601(this.safeString(order, 'updatedAt'));
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'size');
        const type = this.parseOrderType(this.safeStringUpper(order, 'type'));
        const side = this.safeStringLower(order, 'side');
        const timeInForce = this.safeStringUpper(order, 'timeInForce');
        return this.safeOrder({
            'info': order,
            'id': this.safeString(order, 'id'),
            'clientOrderId': this.safeString(order, 'clientId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': timestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': this.safeBool(order, 'postOnly'),
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
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
    parseOrderStatus(status) {
        const statuses = {
            'UNTRIGGERED': 'open',
            'OPEN': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'BEST_EFFORT_CANCELED': 'canceling',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(type) {
        const types = {
            'LIMIT': 'LIMIT',
            'STOP_LIMIT': 'LIMIT',
            'TAKE_PROFIT_LIMIT': 'LIMIT',
            'MARKET': 'MARKET',
            'STOP_MARKET': 'MARKET',
            'TAKE_PROFIT_MARKET': 'MARKET',
            'TRAILING_STOP': 'MARKET',
        };
        return this.safeStringUpper(types, type, type);
    }
    /**
     * @method
     * @name dydx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.dydx.xyz/indexer-client/http#get-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {
            'orderId': id,
        };
        const order = await this.indexerGetOrdersOrderId(this.extend(request, params));
        return this.parseOrder(order);
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let userAddress = undefined;
        let subAccountNumber = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchOrders', params);
        [subAccountNumber, params] = this.handleOptionAndParams(params, 'fetchOrders', 'subAccountNumber', '0');
        await this.loadMarkets();
        const request = {
            'address': userAddress,
            'subaccountNumber': subAccountNumber,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['ticker'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.indexerGetOrders(this.extend(request, params));
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
        return this.parseOrders(response, market, since, limit);
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'OPEN', // ['OPEN', 'FILLED', 'CANCELED', 'BEST_EFFORT_CANCELED', 'UNTRIGGERED', 'BEST_EFFORT_OPENED']
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'status': 'FILLED', // ['OPEN', 'FILLED', 'CANCELED', 'BEST_EFFORT_CANCELED', 'UNTRIGGERED', 'BEST_EFFORT_OPENED']
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    parsePosition(position, market = undefined) {
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
        const marketId = this.safeString(position, 'market');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower(position, 'side');
        let quantity = this.safeString(position, 'size');
        if (side !== 'long') {
            quantity = Precise["default"].stringMul('-1', quantity);
        }
        const timestamp = this.parse8601(this.safeString(position, 'createdAt'));
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'entryPrice': this.safeNumber(position, 'entryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': this.safeNumber(position, 'unrealizedPnl'),
            'side': side,
            'contracts': this.parseNumber(quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
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
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPosition(symbol, params = {}) {
        const positions = await this.fetchPositions([symbol], params);
        return this.safeDict(positions, 0, {});
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
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        let userAddress = undefined;
        let subAccountNumber = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchPositions', params);
        [subAccountNumber, params] = this.handleOptionAndParams(params, 'fetchOrders', 'subAccountNumber', '0');
        await this.loadMarkets();
        const request = {
            'address': userAddress,
            'subaccountNumber': subAccountNumber,
            'status': 'OPEN', // ['OPEN', 'CLOSED', 'LIQUIDATED']
        };
        const response = await this.indexerGetPerpetualPositions(this.extend(request, params));
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
        const rows = this.safeList(response, 'positions', []);
        return this.parsePositions(rows, symbols);
    }
    hashMessage(message) {
        return this.hash(message, sha3.keccak_256, 'hex');
    }
    signHash(hash, privateKey) {
        const signature = crypto.ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1.secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        return {
            'r': r.padStart(64, '0'),
            's': s.padStart(64, '0'),
            'v': this.sum(27, signature['v']),
        };
    }
    signMessage(message, privateKey) {
        return this.signHash(this.hashMessage(message), privateKey.slice(-64));
    }
    signOnboardingAction() {
        const message = { 'action': 'dYdX Chain Onboarding' };
        const chainId = this.options['chainId'];
        const domain = {
            'chainId': chainId,
            'name': 'dYdX Chain',
        };
        const messageTypes = {
            'dYdX': [
                { 'name': 'action', 'type': 'string' },
            ],
        };
        const msg = this.ethEncodeStructuredData(domain, messageTypes, message);
        if (this.privateKey === undefined || this.privateKey === '') {
            throw new errors.ArgumentsRequired(this.id + ' signOnboardingAction() requires a privateKey to be set.');
        }
        const signature = this.signMessage(msg, this.privateKey);
        return signature;
    }
    signDydxTx(privateKey, message, memo, chainId, account, authenticators, fee = undefined) {
        const [encodedTx, signDoc] = this.encodeDydxTxForSigning(message, memo, chainId, account, authenticators, fee);
        const signature = this.signHash(encodedTx, privateKey);
        return this.encodeDydxTxRaw(signDoc, signature['r'] + signature['s']);
    }
    retrieveCredentials() {
        let credentials = this.safeDict(this.options, 'dydxCredentials');
        if (credentials !== undefined) {
            return credentials;
        }
        let entropy = this.safeString(this.options, 'mnemonic');
        if (entropy === undefined) {
            const signature = this.signOnboardingAction();
            entropy = this.hashMessage(this.base16ToBinary(signature['r'] + signature['s']));
        }
        credentials = this.retrieveDydxCredentials(entropy);
        credentials['privateKey'] = this.binaryToBase16(credentials['privateKey']);
        credentials['publicKey'] = this.binaryToBase16(credentials['publicKey']);
        this.options['dydxCredentials'] = credentials;
        return credentials;
    }
    async fetchDydxAccount() {
        // required in js
        await this.loadDydxProtos();
        const dydxAccount = this.safeDict(this.options, 'dydxAccount');
        if (dydxAccount !== undefined) {
            return dydxAccount;
        }
        if (this.walletAddress === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDydxAccount() requires the walletAddress to be set using the dydx chain address eg: dydx1cpb4tedmwq304c2kc9pwzjwq0sc6z2a4tasxrz');
        }
        if (!this.walletAddress.startsWith('dydx')) {
            throw new errors.ArgumentsRequired(this.id + ' fetchDydxAccount() requires a valid dydx chain address, starting with dydx, not the l1 address.');
        }
        const request = {
            'dydxAddress': this.walletAddress,
        };
        //
        // {
        //     "info": {
        //         "address": "string",
        //         "pub_key": {
        //             "type_url": "string",
        //             "key": "string"
        //         },
        //         "account_number": "string",
        //         "sequence": "string"
        //     }
        // }
        //
        const response = await this.nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress(request);
        const account = this.safeDict(response, 'info');
        account['pub_key'] = {
            // encode with binary key would fail in python
            'key': account['pub_key']['key'],
        };
        this.options['dydxAccount'] = account;
        return account;
    }
    pow(n, m) {
        let r = Precise["default"].stringMul(n, '1');
        const c = this.parseToInt(m);
        // TODO: cap
        for (let i = 1; i < c; i++) {
            r = Precise["default"].stringMul(r, n);
        }
        return r;
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        const reduceOnly = this.safeBool2(params, 'reduceOnly', 'reduce_only', false);
        const orderType = type.toUpperCase();
        const market = this.market(symbol);
        const orderSide = side.toUpperCase();
        let subaccountId = 0;
        [subaccountId, params] = this.handleOptionAndParams(params, 'createOrder', 'subAccountId', subaccountId);
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue(params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeValue(params, 'takeProfitPrice');
        const isConditional = triggerPrice !== undefined || stopLossPrice !== undefined || takeProfitPrice !== undefined;
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringUpper(params, 'timeInForce', 'GTT');
        const postOnly = this.isPostOnly(isMarket, undefined, params);
        const amountStr = this.amountToPrecision(symbol, amount);
        const priceStr = this.priceToPrecision(symbol, price);
        const marketInfo = this.safeDict(market, 'info');
        const atomicResolution = marketInfo['atomicResolution'];
        const quantumScale = this.pow('10', Precise["default"].stringNeg(atomicResolution));
        const quantums = Precise["default"].stringMul(amountStr, quantumScale);
        const quantumConversionExponent = marketInfo['quantumConversionExponent'];
        const priceScale = this.pow('10', Precise["default"].stringSub(Precise["default"].stringSub(atomicResolution, quantumConversionExponent), '-6'));
        const subticks = Precise["default"].stringMul(priceStr, priceScale);
        let clientMetadata = 0;
        let conditionalType = 0;
        let conditionalOrderTriggerSubticks = '0';
        let orderFlag = undefined;
        let timeInForceNumber = undefined;
        if (timeInForce === 'FOK') {
            throw new errors.InvalidOrder(this.id + ' timeInForce fok has been deprecated');
        }
        if (orderType === 'MARKET') {
            // short-term
            orderFlag = 0;
            clientMetadata = 1; // STOP_MARKET / TAKE_PROFIT_MARKET
            if (timeInForce !== undefined) {
                // default is ioc
                timeInForceNumber = 1;
            }
        }
        else if (orderType === 'LIMIT') {
            if (timeInForce === 'GTT') {
                // long-term
                orderFlag = 64;
                if (postOnly) {
                    timeInForceNumber = 2;
                }
                else {
                    timeInForceNumber = 0;
                }
            }
            else {
                orderFlag = 0;
                if (timeInForce === 'IOC') {
                    timeInForceNumber = 1;
                }
                else {
                    throw new errors.InvalidOrder('unexpected code path: timeInForce');
                }
            }
        }
        if (isConditional) {
            // conditional
            orderFlag = 32;
            if (stopLossPrice !== undefined) {
                conditionalType = 1;
                conditionalOrderTriggerSubticks = this.priceToPrecision(symbol, stopLossPrice);
            }
            else if (takeProfitPrice !== undefined) {
                conditionalType = 2;
                conditionalOrderTriggerSubticks = this.priceToPrecision(symbol, takeProfitPrice);
            }
            conditionalOrderTriggerSubticks = Precise["default"].stringMul(conditionalOrderTriggerSubticks, priceScale);
        }
        const latestBlockHeight = this.safeInteger(params, 'latestBlockHeight');
        let goodTillBlock = this.safeInteger(params, 'goodTillBlock');
        let goodTillBlockTime = undefined;
        let goodTillBlockTimeInSeconds = 2592000;
        [goodTillBlockTimeInSeconds, params] = this.handleOptionAndParams(params, 'createOrder', 'goodTillBlockTimeInSeconds', goodTillBlockTimeInSeconds); // default is 30 days
        if (orderFlag === 0) {
            if (goodTillBlock === undefined) {
                // short term order
                goodTillBlock = latestBlockHeight + 20;
            }
        }
        else {
            if (goodTillBlockTimeInSeconds === undefined) {
                throw new errors.ArgumentsRequired('goodTillBlockTimeInSeconds is required.');
            }
            goodTillBlockTime = this.seconds() + goodTillBlockTimeInSeconds;
        }
        const sideNumber = (orderSide === 'BUY') ? 1 : 2;
        const defaultClientOrderId = this.randNumber(9); // 2**32 - 1 is 10 digits, but it may overflow with 10
        const clientOrderId = this.safeInteger(params, 'clientOrderId', defaultClientOrderId);
        const orderPayload = {
            'order': {
                'orderId': {
                    'subaccountId': {
                        'owner': this.getWalletAddress(),
                        'number': subaccountId,
                    },
                    'clientId': clientOrderId,
                    'orderFlags': orderFlag,
                    'clobPairId': marketInfo['clobPairId'],
                },
                'side': sideNumber,
                'quantums': this.toDydxLong(quantums),
                'subticks': this.toDydxLong(subticks),
                'goodTilBlock': goodTillBlock,
                'goodTilBlockTime': goodTillBlockTime,
                'timeInForce': timeInForceNumber,
                'reduceOnly': reduceOnly,
                'clientMetadata': clientMetadata,
                'conditionType': conditionalType,
                'conditionalOrderTriggerSubticks': this.toDydxLong(conditionalOrderTriggerSubticks),
                'orderRouterAddress': this.safeString(this.options, 'routerAddress', 'dydx165sfn2k3vucvq7gklauy2r3agyjw4c3m60ascn'),
            },
        };
        const signingPayload = {
            'typeUrl': '/dydxprotocol.clob.MsgPlaceOrder',
            'value': orderPayload,
        };
        params = this.omit(params, ['reduceOnly', 'reduce_only', 'clientOrderId', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit', 'latestBlockHeight', 'goodTillBlock', 'goodTillBlockTimeInSeconds', 'subaccountId']);
        const orderId = this.createOrderIdFromParts(this.getWalletAddress(), subaccountId, clientOrderId, orderFlag, marketInfo['clobPairId']);
        return [orderId, this.extend(signingPayload, params)];
    }
    createOrderIdFromParts(address, subAccountNumber, clientOrderId, orderFlags, clobPairId) {
        const nameSp = this.safeString(this.options, 'namespace', '0f9da948-a6fb-4c45-9edc-4685c3f3317d');
        const prefixAddress = address + '-' + subAccountNumber.toString();
        const prefix = this.uuid5(nameSp, prefixAddress);
        const orderInfo = prefix + '-' + this.numberToString(clientOrderId) + '-' + this.numberToString(clobPairId) + '-' + this.numberToString(orderFlags);
        return this.uuid5(nameSp, orderInfo);
    }
    async fetchLatestBlockHeight(params = {}) {
        const response = await this.nodeRpcGetAbciInfo(params);
        //
        // {
        //     "jsonrpc": "2.0",
        //     "id": -1,
        //     "result": {
        //         "response": {
        //             "data": "dydxprotocol",
        //             "version": "9.1.0-rc0",
        //             "last_block_height": "49157714",
        //             "last_block_app_hash": "9LHAcDDI5zmWiC6bGiiGtxuWPlKJV+/fTBZk/WQ/Y4U="
        //         }
        //     }
        // }
        //
        const result = this.safeDict(response, 'result');
        const info = this.safeDict(result, 'response');
        return this.safeInteger(info, 'last_block_height');
    }
    /**
     * @method
     * @name dydx#createOrder
     * @see https://docs.dydx.xyz/interaction/trading#place-an-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTT", "IOC", or "PO"
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price for a stoploss order
     * @param {float} [params.takeProfitPrice] price for a takeprofit order
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {float} [params.goodTillBlock] expired block number for the order, required for market order and non limit GTT order, default value is latestBlockHeight + 20
     * @param {float} [params.goodTillBlockTimeInSeconds] expired time elapsed for the order, required for limit GTT order and conditional, default value is 30 days
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const credentials = this.retrieveCredentials();
        const account = await this.fetchDydxAccount();
        const lastBlockHeight = await this.fetchLatestBlockHeight();
        // params['latestBlockHeight'] = lastBlockHeight;
        const newParams = this.extend(params, { 'latestBlockHeight': lastBlockHeight });
        const orderRequestRes = this.createOrderRequest(symbol, type, side, amount, price, newParams);
        const orderId = orderRequestRes[0];
        const orderRequest = orderRequestRes[1];
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx(credentials['privateKey'], orderRequest, '', chainName, account, undefined);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync(request);
        //
        // {
        //     "jsonrpc": "2.0",
        //     "id": -1,
        //     "result": {
        //         "code": 0,
        //         "data": "",
        //         "log": "[]",
        //         "codespace": "",
        //         "hash": "CBEDB0603E57E5CE21FA6954770A9403D2A81BED02E608C860356152D0AA1A81"
        //     }
        // }
        //
        const result = this.safeDict(response, 'result');
        return this.safeOrder({
            'info': result,
            'id': orderId,
            'clientOrderId': orderRequest['value']['order']['orderId']['clientId'],
        });
    }
    /**
     * @method
     * @name dydx#cancelOrder
     * @description cancels an open order
     * @see https://docs.dydx.xyz/interaction/trading/#cancel-an-order
     * @param {string} id it should be the clientOrderId in this case
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id used when creating the order
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {float} [params.orderFlags] default is 64, orderFlags for the order, market order and non limit GTT order is 0, limit GTT order is 64 and conditional order is 32
     * @param {float} [params.goodTillBlock] expired block number for the order, required for market order and non limit GTT order (orderFlags = 0), default value is latestBlockHeight + 20
     * @param {float} [params.goodTillBlockTimeInSeconds] expired time elapsed for the order, required for limit GTT order and conditional (orderFlagss > 0), default value is 30 days
     * @param {int} [params.subAccountId] sub account id, default is 0
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const isTrigger = this.safeBool2(params, 'trigger', 'stop', false);
        params = this.omit(params, ['trigger', 'stop']);
        if (!isTrigger && (symbol === undefined)) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clientId', id);
        if (clientOrderId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a clientOrderId parameter, cancelling using id is not currently supported.');
        }
        const idString = id.toString();
        if (id !== undefined && idString.indexOf('-') > -1) {
            throw new errors.NotSupported(this.id + ' cancelOrder() cancelling using id is not currently supported, please use provide the clientOrderId parameter.');
        }
        let goodTillBlock = this.safeInteger(params, 'goodTillBlock');
        let goodTillBlockTimeInSeconds = 2592000;
        [goodTillBlockTimeInSeconds, params] = this.handleOptionAndParams(params, 'cancelOrder', 'goodTillBlockTimeInSeconds', goodTillBlockTimeInSeconds); // default is 30 days
        let goodTillBlockTime = undefined;
        const defaultOrderFlags = (isTrigger) ? 32 : 64;
        const orderFlags = this.safeInteger(params, 'orderFlags', defaultOrderFlags);
        let subAccountId = 0;
        [subAccountId, params] = this.handleOptionAndParams(params, 'cancelOrder', 'subAccountId', subAccountId);
        params = this.omit(params, ['clientOrderId', 'orderFlags', 'goodTillBlock', 'goodTillBlockTime', 'goodTillBlockTimeInSeconds', 'subaccountId', 'clientId']);
        if (orderFlags !== 0 && orderFlags !== 64 && orderFlags !== 32) {
            throw new errors.InvalidOrder(this.id + ' invalid orderFlags, allowed values are (0, 64, 32).');
        }
        if (orderFlags > 0) {
            if (goodTillBlockTimeInSeconds === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' goodTillBlockTimeInSeconds is required in params for long term or conditional order.');
            }
            if (goodTillBlock !== undefined && goodTillBlock > 0) {
                throw new errors.InvalidOrder(this.id + ' goodTillBlock should be 0 for long term or conditional order.');
            }
            goodTillBlockTime = this.seconds() + goodTillBlockTimeInSeconds;
        }
        else {
            if (goodTillBlock === undefined) {
                const latestBlockHeight = await this.fetchLatestBlockHeight();
                goodTillBlock = latestBlockHeight + 20;
            }
        }
        const credentials = this.retrieveCredentials();
        const account = await this.fetchDydxAccount();
        const cancelPayload = {
            'orderId': {
                'subaccountId': {
                    'owner': this.getWalletAddress(),
                    'number': subAccountId,
                },
                'clientId': clientOrderId,
                'orderFlags': orderFlags,
                'clobPairId': market['info']['clobPairId'],
            },
            'goodTilBlock': goodTillBlock,
            'goodTilBlockTime': goodTillBlockTime,
        };
        const signingPayload = {
            'typeUrl': '/dydxprotocol.clob.MsgCancelOrder',
            'value': cancelPayload,
        };
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx(credentials['privateKey'], signingPayload, '', chainName, account, undefined);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync(request);
        //
        // {
        //     "jsonrpc": "2.0",
        //     "id": -1,
        //     "result": {
        //         "code": 0,
        //         "data": "",
        //         "log": "[]",
        //         "codespace": "",
        //         "hash": "CBEDB0603E57E5CE21FA6954770A9403D2A81BED02E608C860356152D0AA1A81"
        //     }
        // }
        //
        const result = this.safeDict(response, 'result');
        return this.safeOrder({
            'info': result,
        });
    }
    /**
     * @method
     * @name dydx#cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @param {int} [params.subAccountId] sub account id, default is 0
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async cancelOrders(ids, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const clientOrderIds = this.safeList(params, 'clientOrderIds');
        if (!clientOrderIds) {
            throw new errors.NotSupported(this.id + ' cancelOrders only support clientOrderIds.');
        }
        let subAccountId = 0;
        [subAccountId, params] = this.handleOptionAndParams(params, 'cancelOrders', 'subAccountId', subAccountId);
        let goodTillBlock = this.safeInteger(params, 'goodTillBlock');
        if (goodTillBlock === undefined) {
            const latestBlockHeight = await this.fetchLatestBlockHeight();
            goodTillBlock = latestBlockHeight + 20;
        }
        params = this.omit(params, ['clientOrderIds', 'goodTillBlock', 'subaccountId']);
        const credentials = this.retrieveCredentials();
        const account = await this.fetchDydxAccount();
        const cancelOrders = {
            'clientIds': clientOrderIds,
            'clobPairId': market['info']['clobPairId'],
        };
        const cancelPayload = {
            'subaccountId': {
                'owner': this.getWalletAddress(),
                'number': subAccountId,
            },
            'shortTermCancels': [cancelOrders],
            'goodTilBlock': goodTillBlock,
        };
        const signingPayload = {
            'typeUrl': '/dydxprotocol.clob.MsgBatchCancel',
            'value': cancelPayload,
        };
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx(credentials['privateKey'], signingPayload, '', chainName, account, undefined);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync(request);
        //
        // {
        //     "jsonrpc": "2.0",
        //     "id": -1,
        //     "result": {
        //         "code": 0,
        //         "data": "",
        //         "log": "[]",
        //         "codespace": "",
        //         "hash": "CBEDB0603E57E5CE21FA6954770A9403D2A81BED02E608C860356152D0AA1A81"
        //     }
        // }
        //
        const result = this.safeDict(response, 'result');
        return [this.safeOrder({
                'info': result,
            })];
    }
    /**
     * @method
     * @name dydx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.dydx.xyz/indexer-client/http#get-perpetual-market-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'market': market['id'],
        };
        const response = await this.indexerGetOrderbooksPerpetualMarketMarket(this.extend(request, params));
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
        return this.parseOrderBook(response, market['symbol'], undefined, 'bids', 'asks', 'price', 'size');
    }
    parseLedgerEntry(item, currency = undefined) {
        //
        // {
        //     "id": "6a6075bc-7183-5fd9-bc9d-894e238aa527",
        //     "sender": {
        //         "address": "dydx14zzueazeh0hj67cghhf9jypslcf9sh2n5k6art",
        //         "subaccountNumber": 0
        //     },
        //     "recipient": {
        //         "address": "dydx1slanxj8x9ntk9knwa6cvfv2tzlsq5gk3dshml0",
        //         "subaccountNumber": 1
        //     },
        //     "size": "0.000001",
        //     "createdAt": "2025-07-29T09:43:02.105Z",
        //     "createdAtHeight": "45116125",
        //     "symbol": "USDC",
        //     "type": "TRANSFER_OUT",
        //     "transactionHash": "92B4744BA1B783CF37C79A50BEBC47FFD59C8D5197D62A8485D3DCCE9AF220AF"
        // }
        //
        const currencyId = this.safeString(item, 'symbol');
        const code = this.safeCurrencyCode(currencyId, currency);
        currency = this.safeCurrency(currencyId, currency);
        const type = this.safeStringUpper(item, 'type');
        let direction = undefined;
        if (type !== undefined) {
            if (type === 'TRANSFER_IN' || type === 'DEPOSIT') {
                direction = 'in';
            }
            else if (type === 'TRANSFER_OUT' || type === 'WITHDRAWAL') {
                direction = 'out';
            }
        }
        const amount = this.safeString(item, 'size');
        const timestamp = this.parse8601(this.safeString(item, 'createdAt'));
        const sender = this.safeDict(item, 'sender');
        const recipient = this.safeDict(item, 'recipient');
        return this.safeLedgerEntry({
            'info': item,
            'id': this.safeString(item, 'id'),
            'direction': direction,
            'account': this.safeString(sender, 'address'),
            'referenceAccount': this.safeString(recipient, 'address'),
            'referenceId': this.safeString(item, 'transactionHash'),
            'type': this.parseLedgerEntryType(type),
            'currency': code,
            'amount': this.parseNumber(amount),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency);
    }
    parseLedgerEntryType(type) {
        const ledgerType = {
            'TRANSFER_IN': 'transfer',
            'TRANSFER_OUT': 'transfer',
            'DEPOSIT': 'deposit',
            'WITHDRAWAL': 'withdrawal',
        };
        return this.safeString(ledgerType, type, type);
    }
    /**
     * @method
     * @name dydx#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    async fetchLedger(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.fetchTransactionsHelper(code, since, limit, this.extend(params, { 'methodName': 'fetchLedger' }));
        return this.parseLedger(response, currency, since, limit);
    }
    async estimateTxFee(message, memo, account) {
        const txBytes = this.encodeDydxTxForSimulation(message, memo, account['sequence'], account['pub_key']);
        const request = {
            'txBytes': txBytes,
        };
        const response = await this.nodeRestPostCosmosTxV1beta1Simulate(request);
        //
        // {
        //     gas_info: { gas_wanted: '18446744073709551615', gas_used: '86055' },
        //     result: {
        //         ...
        //     }
        // }
        //
        const gasInfo = this.safeDict(response, 'gas_info');
        if (gasInfo === undefined) {
            throw new errors.ExchangeError(this.id + ' failed to simulate transaction.');
        }
        const gasUsed = this.safeString(gasInfo, 'gas_used');
        if (gasUsed === undefined) {
            throw new errors.ExchangeError(this.id + ' failed to simulate transaction.');
        }
        const defaultFeeDenom = this.safeString(this.options, 'defaultFeeDenom');
        const defaultFeeMultiplier = this.safeString(this.options, 'defaultFeeMultiplier');
        const feeDenom = this.safeDict(this.options, 'feeDenom');
        let gasPrice = undefined;
        let denom = undefined;
        if (defaultFeeDenom === 'uusdc') {
            gasPrice = feeDenom['USDC_GAS_PRICE'];
            denom = feeDenom['USDC_DENOM'];
        }
        else {
            gasPrice = feeDenom['CHAINTOKEN_GAS_PRICE'];
            denom = feeDenom['CHAINTOKEN_DENOM'];
        }
        const gasLimit = Math.ceil(this.parseToNumeric(Precise["default"].stringMul(gasUsed, defaultFeeMultiplier)));
        let feeAmount = Precise["default"].stringMul(this.numberToString(gasLimit), gasPrice);
        if (feeAmount.indexOf('.') >= 0) {
            feeAmount = this.numberToString(Math.ceil(this.parseToNumeric(feeAmount)));
        }
        const feeObj = {
            'amount': feeAmount,
            'denom': denom,
        };
        return {
            'amount': [feeObj],
            'gasLimit': gasLimit,
        };
    }
    /**
     * @method
     * @name dydx#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from *main, subaccount*
     * @param {string} toAccount account to transfer to *subaccount, address*
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        if (code !== 'USDC') {
            throw new errors.NotSupported(this.id + ' transfer() only support USDC');
        }
        await this.loadMarkets();
        const fromSubaccountId = this.safeInteger(params, 'fromSubaccountId');
        const toSubaccountId = this.safeInteger(params, 'toSubaccountId');
        if (fromAccount !== 'main') {
            // throw error if from subaccount id is undefind
            if (fromAccount === undefined) {
                throw new errors.NotSupported(this.id + ' transfer only support main > subaccount and subaccount <> subaccount.');
            }
            if (fromSubaccountId === undefined || toSubaccountId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' transfer requires fromSubaccountId and toSubaccountId.');
            }
        }
        params = this.omit(params, ['fromSubaccountId', 'toSubaccountId']);
        const credentials = this.retrieveCredentials();
        const account = await this.fetchDydxAccount();
        const usd = this.parseToInt(Precise["default"].stringMul(this.numberToString(amount), '1000000'));
        let payload = undefined;
        let signingPayload = undefined;
        if (fromAccount === 'main') {
            // deposit to subaccount
            if (toSubaccountId === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' transfer() requeire toSubaccoutnId.');
            }
            payload = {
                'sender': this.getWalletAddress(),
                'recipient': {
                    'owner': this.getWalletAddress(),
                    'number': toSubaccountId,
                },
                'assetId': 0,
                'quantums': usd,
            };
            signingPayload = {
                'typeUrl': '/dydxprotocol.sending.MsgDepositToSubaccount',
                'value': payload,
            };
        }
        else {
            payload = {
                'transfer': {
                    'sender': {
                        'owner': fromAccount,
                        'number': fromSubaccountId,
                    },
                    'recipient': {
                        'owner': toAccount,
                        'number': toSubaccountId,
                    },
                    'assetId': 0,
                    'amount': usd,
                },
            };
            signingPayload = {
                'typeUrl': '/dydxprotocol.sending.MsgCreateTransfer',
                'value': payload,
            };
        }
        const txFee = await this.estimateTxFee(signingPayload, '', account);
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx(credentials['privateKey'], signingPayload, '', chainName, account, undefined, txFee);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync(request);
        //
        // {
        //     "jsonrpc": "2.0",
        //     "id": -1,
        //     "result": {
        //         "code": 0,
        //         "data": "",
        //         "log": "[]",
        //         "codespace": "",
        //         "hash": "CBEDB0603E57E5CE21FA6954770A9403D2A81BED02E608C860356152D0AA1A81"
        //     }
        // }
        //
        return this.parseTransfer(response);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // {
        //     "id": "6a6075bc-7183-5fd9-bc9d-894e238aa527",
        //     "sender": {
        //         "address": "dydx14zzueazeh0hj67cghhf9jypslcf9sh2n5k6art",
        //         "subaccountNumber": 0
        //     },
        //     "recipient": {
        //         "address": "dydx1slanxj8x9ntk9knwa6cvfv2tzlsq5gk3dshml0",
        //         "subaccountNumber": 1
        //     },
        //     "size": "0.000001",
        //     "createdAt": "2025-07-29T09:43:02.105Z",
        //     "createdAtHeight": "45116125",
        //     "symbol": "USDC",
        //     "type": "TRANSFER_OUT",
        //     "transactionHash": "92B4744BA1B783CF37C79A50BEBC47FFD59C8D5197D62A8485D3DCCE9AF220AF"
        // }
        //
        const id = this.safeString(transfer, 'id');
        const currencyId = this.safeString(transfer, 'symbol');
        const code = this.safeCurrencyCode(currencyId, currency);
        const amount = this.safeNumber(transfer, 'size');
        const sender = this.safeDict(transfer, 'sender');
        const recipient = this.safeDict(transfer, 'recipient');
        const fromAccount = this.safeString(sender, 'address');
        const toAccount = this.safeString(recipient, 'address');
        const timestamp = this.parse8601(this.safeString(transfer, 'createdAt'));
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': code,
            'amount': amount,
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': undefined,
        };
    }
    /**
     * @method
     * @name dydx#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.fetchTransactionsHelper(code, since, limit, this.extend(params, { 'methodName': 'fetchTransfers' }));
        const transferIn = this.filterBy(response, 'type', 'TRANSFER_IN');
        const transferOut = this.filterBy(response, 'type', 'TRANSFER_OUT');
        const rows = this.arrayConcat(transferIn, transferOut);
        return this.parseTransfers(rows, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        // {
        //     "id": "6a6075bc-7183-5fd9-bc9d-894e238aa527",
        //     "sender": {
        //         "address": "dydx14zzueazeh0hj67cghhf9jypslcf9sh2n5k6art",
        //         "subaccountNumber": 0
        //     },
        //     "recipient": {
        //         "address": "dydx1slanxj8x9ntk9knwa6cvfv2tzlsq5gk3dshml0",
        //         "subaccountNumber": 1
        //     },
        //     "size": "0.000001",
        //     "createdAt": "2025-07-29T09:43:02.105Z",
        //     "createdAtHeight": "45116125",
        //     "symbol": "USDC",
        //     "type": "TRANSFER_OUT",
        //     "transactionHash": "92B4744BA1B783CF37C79A50BEBC47FFD59C8D5197D62A8485D3DCCE9AF220AF"
        // }
        //
        const id = this.safeString(transaction, 'id');
        const sender = this.safeDict(transaction, 'sender');
        const recipient = this.safeDict(transaction, 'recipient');
        const addressTo = this.safeString(recipient, 'address');
        const addressFrom = this.safeString(sender, 'address');
        const txid = this.safeString(transaction, 'transactionHash');
        const currencyId = this.safeString(transaction, 'symbol');
        const code = this.safeCurrencyCode(currencyId, currency);
        const timestamp = this.parse8601(this.safeString(transaction, 'createdAt'));
        const amount = this.safeNumber(transaction, 'size');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': undefined,
            'address': addressTo,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.safeStringLower(transaction, 'type'),
            'amount': amount,
            'currency': code,
            'status': undefined,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        };
    }
    /**
     * @method
     * @name dydx#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        if (code !== 'USDC') {
            throw new errors.NotSupported(this.id + ' withdraw() only support USDC');
        }
        await this.loadMarkets();
        this.checkAddress(address);
        const subaccountId = this.safeInteger(params, 'subaccountId');
        if (subaccountId === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' withdraw requires subaccountId.');
        }
        params = this.omit(params, ['subaccountId']);
        const currency = this.currency(code);
        const credentials = this.retrieveCredentials();
        const account = await this.fetchDydxAccount();
        const usd = this.parseToInt(Precise["default"].stringMul(this.numberToString(amount), '1000000'));
        const payload = {
            'sender': {
                'owner': this.getWalletAddress(),
                'number': subaccountId,
            },
            'recipient': address,
            'assetId': 0,
            'quantums': usd,
        };
        const signingPayload = {
            'typeUrl': '/dydxprotocol.sending.MsgWithdrawFromSubaccount',
            'value': payload,
        };
        const txFee = await this.estimateTxFee(signingPayload, tag, account);
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx(credentials['privateKey'], signingPayload, tag, chainName, account, undefined, txFee);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync(request);
        //
        // {
        //     "jsonrpc": "2.0",
        //     "id": -1,
        //     "result": {
        //         "code": 0,
        //         "data": "",
        //         "log": "[]",
        //         "codespace": "",
        //         "hash": "CBEDB0603E57E5CE21FA6954770A9403D2A81BED02E608C860356152D0AA1A81"
        //     }
        // }
        //
        const data = this.safeDict(response, 'result', {});
        return this.parseTransaction(data, currency);
    }
    /**
     * @method
     * @name dydx#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.fetchTransactionsHelper(code, since, limit, this.extend(params, { 'methodName': 'fetchWithdrawals' }));
        const rows = this.filterBy(response, 'type', 'WITHDRAWAL');
        return this.parseTransactions(rows, currency, since, limit);
    }
    /**
     * @method
     * @name dydx#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.fetchTransactionsHelper(code, since, limit, this.extend(params, { 'methodName': 'fetchDeposits' }));
        const rows = this.filterBy(response, 'type', 'DEPOSIT');
        return this.parseTransactions(rows, currency, since, limit);
    }
    /**
     * @method
     * @name dydx#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.dydx.xyz/indexer-client/http#get-transfers
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.subAccountNumber] sub account number
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
        }
        const response = await this.fetchTransactionsHelper(code, since, limit, this.extend(params, { 'methodName': 'fetchDepositsWithdrawals' }));
        const withdrawals = this.filterBy(response, 'type', 'WITHDRAWAL');
        const deposits = this.filterBy(response, 'type', 'DEPOSIT');
        const rows = this.arrayConcat(withdrawals, deposits);
        return this.parseTransactions(rows, currency, since, limit);
    }
    async fetchTransactionsHelper(code = undefined, since = undefined, limit = undefined, params = {}) {
        const methodName = this.safeString(params, 'methodName');
        params = this.omit(params, 'methodName');
        let userAddress = undefined;
        let subAccountNumber = undefined;
        [userAddress, params] = this.handlePublicAddress(methodName, params);
        [subAccountNumber, params] = this.handleOptionAndParams(params, methodName, 'subAccountNumber', '0');
        const request = {
            'address': userAddress,
            'subaccountNumber': subAccountNumber,
        };
        const response = await this.indexerGetTransfers(this.extend(request, params));
        //
        // {
        //     "transfers": [
        //         {
        //             "id": "6a6075bc-7183-5fd9-bc9d-894e238aa527",
        //             "sender": {
        //                 "address": "dydx14zzueazeh0hj67cghhf9jypslcf9sh2n5k6art",
        //                 "subaccountNumber": 0
        //             },
        //             "recipient": {
        //                 "address": "dydx1slanxj8x9ntk9knwa6cvfv2tzlsq5gk3dshml0",
        //                 "subaccountNumber": 1
        //             },
        //             "size": "0.000001",
        //             "createdAt": "2025-07-29T09:43:02.105Z",
        //             "createdAtHeight": "45116125",
        //             "symbol": "USDC",
        //             "type": "TRANSFER_OUT",
        //             "transactionHash": "92B4744BA1B783CF37C79A50BEBC47FFD59C8D5197D62A8485D3DCCE9AF220AF"
        //         }
        //     ]
        // }
        //
        return this.safeList(response, 'transfers', []);
    }
    /**
     * @method
     * @name dydx#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.dydx.xyz/indexer-client/http#get-subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    async fetchAccounts(params = {}) {
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchAccounts', params);
        const request = {
            'address': userAddress,
        };
        const response = await this.indexerGetAddressesAddress(this.extend(request, params));
        //
        // {
        //     "subaccounts": [
        //         {
        //             "address": "dydx14zzueazeh0hj67cghhf9jypslcf9sh2n5k6art",
        //             "subaccountNumber": 0,
        //             "equity": "25346.73993597",
        //             "freeCollateral": "24207.8530595294",
        //             "openPerpetualPositions": {
        //                 "BTC-USD": {
        //                     "market": "BTC-USD",
        //                     "status": "OPEN",
        //                     "side": "SHORT",
        //                     "size": "-0.491",
        //                     "maxSize": "-0.009",
        //                     "entryPrice": "118703.60811320754716981132",
        //                     "exitPrice": "119655.95",
        //                     "realizedPnl": "3075.17994830188679245283016",
        //                     "unrealizedPnl": "1339.12776155490566037735812",
        //                     "createdAt": "2025-07-14T07:53:55.631Z",
        //                     "createdAtHeight": "44140908",
        //                     "closedAt": null,
        //                     "sumOpen": "0.53",
        //                     "sumClose": "0.038",
        //                     "netFunding": "3111.36894",
        //                     "subaccountNumber": 0
        //                 }
        //             },
        //             "assetPositions": {
        //                 "USDC": {
        //                     "size": "82291.083758",
        //                     "symbol": "USDC",
        //                     "side": "LONG",
        //                     "assetId": "0",
        //                     "subaccountNumber": 0
        //                 }
        //             },
        //             "marginEnabled": true,
        //             "updatedAtHeight": "45234659",
        //             "latestProcessedBlockHeight": "45293477"
        //         }
        //     ]
        // }
        //
        const rows = this.safeList(response, 'subaccounts', []);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const account = rows[i];
            const accountId = this.safeString(account, 'subaccountNumber');
            result.push({
                'id': accountId,
                'type': undefined,
                'currency': undefined,
                'info': account,
                'code': undefined,
            });
        }
        return result;
    }
    /**
     * @method
     * @name dydx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.dydx.xyz/indexer-client/http#get-subaccount
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchAccounts', params);
        let subaccountNumber = undefined;
        [subaccountNumber, params] = this.handleOptionAndParams(params, 'fetchAccounts', 'subaccountNumber', 0);
        const request = {
            'address': userAddress,
            'subaccountNumber': subaccountNumber,
        };
        const response = await this.indexerGetAddressesAddressSubaccountNumberSubaccountNumber(this.extend(request, params));
        //
        // {
        //     "subaccount": {
        //         "address": "dydx14zzueazeh0hj67cghhf9jypslcf9sh2n5k6art",
        //         "subaccountNumber": 0,
        //         "equity": "161451.040416029",
        //         "freeCollateral": "152508.28819133578",
        //         "openPerpetualPositions": {
        //             "ETH-USD": {
        //                 "market": "ETH-USD",
        //                 "status": "OPEN",
        //                 "side": "LONG",
        //                 "size": "0.001",
        //                 "maxSize": "0.002",
        //                 "entryPrice": "3894.7",
        //                 "exitPrice": "3864.5",
        //                 "realizedPnl": "-0.034847",
        //                 "unrealizedPnl": "-0.044675155",
        //                 "createdAt": "2025-10-22T08:34:05.883Z",
        //                 "createdAtHeight": "52228825",
        //                 "closedAt": null,
        //                 "sumOpen": "0.002",
        //                 "sumClose": "0.001",
        //                 "netFunding": "-0.004647",
        //                 "subaccountNumber": 0
        //             },
        //             "BTC-USD": {
        //                 "market": "BTC-USD",
        //                 "status": "OPEN",
        //                 "side": "SHORT",
        //                 "size": "-4.1368",
        //                 "maxSize": "-0.009",
        //                 "entryPrice": "112196.87848803433219017636",
        //                 "exitPrice": "113885.21872652924977050823",
        //                 "realizedPnl": "-15180.426770788459736511679821",
        //                 "unrealizedPnl": "17002.285719484425404321566048",
        //                 "createdAt": "2025-07-14T07:53:55.631Z",
        //                 "createdAtHeight": "44140908",
        //                 "closedAt": null,
        //                 "sumOpen": "5.3361",
        //                 "sumClose": "1.1983",
        //                 "netFunding": "-13157.288663",
        //                 "subaccountNumber": 0
        //             }
        //         },
        //         "assetPositions": {
        //             "USDC": {
        //                 "size": "608580.951601",
        //                 "symbol": "USDC",
        //                 "side": "LONG",
        //                 "assetId": "0",
        //                 "subaccountNumber": 0
        //             }
        //         },
        //         "marginEnabled": true,
        //         "updatedAtHeight": "52228833",
        //         "latestProcessedBlockHeight": "52246761"
        //     }
        // }
        //
        const data = this.safeDict(response, 'subaccount');
        return this.parseBalance(data);
    }
    parseBalance(response) {
        const account = this.account();
        account['free'] = this.safeString(response, 'freeCollateral');
        const result = {
            'info': response,
            'USDC': account,
        };
        return this.safeBalance(result);
    }
    nonce() {
        return this.milliseconds() - this.options['timeDifference'];
    }
    getWalletAddress() {
        if (this.walletAddress !== undefined && this.walletAddress !== '') {
            return this.walletAddress;
        }
        const dydxAccount = this.safeDict(this.options, 'dydxAccount');
        if (dydxAccount !== undefined) {
            // return dydxAccount;
            const wallet = this.safeString(dydxAccount, 'address');
            if (wallet !== undefined) {
                return wallet;
            }
        }
        throw new errors.ArgumentsRequired(this.id + ' getWalletAddress() requires a wallet address. Set `walletAddress` or `dydxAccount` in exchange options.');
    }
    sign(path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const pathWithParams = this.implodeParams(path, params);
        let url = this.implodeHostname(this.urls['api'][section]);
        params = this.omit(params, this.extractParams(path));
        params = this.keysort(params);
        url += '/' + pathWithParams;
        if (method === 'GET') {
            if (Object.keys(params).length) {
                url += '?' + this.urlencode(params);
            }
        }
        else {
            body = this.json(params);
            headers = {
                'Content-type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        // abci response
        // { "result": { "code": 0 } }
        //
        // rest response
        // { "code": 123 }
        //
        const result = this.safeDict(response, 'result');
        let errorCode = this.safeString(result, 'code');
        if (!errorCode) {
            errorCode = this.safeString(response, 'code');
        }
        if (errorCode) {
            const errorCodeNum = this.parseToNumeric(errorCode);
            if (errorCodeNum > 0) {
                const feedback = this.id + ' ' + this.json(response);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
                throw new errors.ExchangeError(feedback);
            }
        }
        return undefined;
    }
    setSandboxMode(enable) {
        super.setSandboxMode(enable);
        // rewrite testnet parameters
        this.options['chainName'] = 'dydx-testnet-4';
        this.options['chainId'] = 11155111;
        this.options['feeDenom']['CHAINTOKEN_DENOM'] = 'adv4tnt';
    }
}

exports["default"] = dydx;
