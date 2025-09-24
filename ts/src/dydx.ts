
// ---------------------------------------------------------------------------

import Exchange from './abstract/dydx.js';
import { ArgumentsRequired, NotSupported, ExchangeError, InsufficientFunds, InvalidOrder, BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import Precise from './base/Precise.js';
import type { Int, Market, Dict, int, Trade, OHLCV, Str, FundingRateHistory, Order, OrderSide, OrderType, Strings, Num, Position, OrderBook, Currency, LedgerEntry, TransferEntry, Transaction, Account } from './base/types.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';

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
                'logo': '',
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
                    'maker': this.parseNumber ('0.0001'),
                    'taker': this.parseNumber ('0.0005'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'privateKey': false,
            },
            'options': {
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
                    '9': InvalidOrder, // A cancel already exists in the memclob for this order with a greater than or equal GoodTilBlock
                    '10': InvalidOrder, // The next block height is greater than the GoodTilBlock of the message
                    '11': InvalidOrder, // The GoodTilBlock of the message is further than ShortBlockWindow blocks into the future
                    '12': InvalidOrder, // MsgPlaceOrder is invalid
                    '13': InvalidOrder, // MsgProposedMatchOrders is invalid
                    '14': InvalidOrder, // State filled amount cannot be unchanged
                    '15': InvalidOrder, // State filled amount cannot decrease
                    '16': InvalidOrder, // Cannot prune state fill amount that does not exist
                    '17': InvalidOrder, // Subaccount cannot open more than 20 orders on a given CLOB and side
                    '18': InvalidOrder, // `FillAmount` is not divisible by `StepBaseQuantums` of the specified `ClobPairId`
                    '19': InvalidOrder, // The provided perpetual ID does not have any associated CLOB pairs
                    '20': InvalidOrder, // Replacing an existing order failed
                    '21': InvalidOrder, // Clob pair and perpetual ids do not match
                    '22': InvalidOrder, // Matched order has negative fee
                    '23': InvalidOrder, // Subaccounts updated for a matched order, but fee transfer to fee-collector failed
                    '24': InvalidOrder, // Order is fully filled
                    '25': InvalidOrder, // Attempting to get price premium with a non-perpetual CLOB pair
                    '26': InvalidOrder, // Index price is zero when calculating price premium
                    '27': InvalidOrder, // Invalid ClobPair parameter
                    '28': InvalidOrder, // Oracle price must be > 0.
                    '29': InvalidOrder, // Invalid stateful order cancellation
                    '30': InvalidOrder, // An order with the same `OrderId` and `OrderHash` has already been processed for this CLOB
                    '31': InvalidOrder, // Missing mid price for ClobPair
                    '32': InvalidOrder, // Existing stateful order cancellation has higher-or-equal priority than the new one
                    '33': InvalidOrder, // ClobPair with id already exists
                    '34': InvalidOrder, // Order conflicts with ClobPair status
                    '35': InvalidOrder, // Invalid ClobPair status transition
                    '36': InvalidOrder, // Operation conflicts with ClobPair status
                    '37': InvalidOrder, // Perpetual does not exist in state
                    '39': InvalidOrder, // ClobPair update is invalid
                    '40': InvalidOrder, // Authority is invalid
                    '41': InvalidOrder, // perpetual ID is already associated with an existing CLOB pair
                    '42': InvalidOrder, // Unexpected time in force
                    '43': InvalidOrder, // Order has remaining size
                    '44': InvalidOrder, // invalid time in force
                    '45': InvalidOrder, // Invalid batch cancel message
                    '46': InvalidOrder, // Batch cancel has failed
                    '47': InvalidOrder, // CLOB has not been initialized
                    '48': InvalidOrder, // This field has been deprecated
                    '49': InvalidOrder, // Invalid TWAP order placement
                    '50': InvalidOrder, // Invalid builder code
                    '1000': BadRequest, // Proposed LiquidationsConfig is invalid
                    '1001': BadRequest, // Subaccount has no perpetual positions to liquidate
                    '1002': BadRequest, // Subaccount is not liquidatable
                    '1003': InvalidOrder, // Subaccount does not have an open position for perpetual
                    '1004': InvalidOrder, // Liquidation order has invalid size
                    '1005': InvalidOrder, // Liquidation order is on the wrong side
                    '1006': InvalidOrder, // Total fills amount exceeds size of liquidation order
                    '1007': InvalidOrder, // Liquidation order does not contain any fills
                    '1008': InvalidOrder, // Subaccount has previously liquidated this perpetual in the current block
                    '1009': InvalidOrder, // Liquidation order has size smaller than min position notional specified in the liquidation config
                    '1010': InvalidOrder, // Liquidation order has size greater than max position notional specified in the liquidation config
                    '1011': InvalidOrder, // Liquidation exceeds the maximum notional amount that a single subaccount can have liquidated per block
                    '1012': InvalidOrder, // Liquidation exceeds the maximum insurance fund payout amount for a given subaccount per block
                    '1013': InvalidOrder, // Insurance fund does not have sufficient funds to cover liquidation losses
                    '1014': InvalidOrder, // Invalid perpetual position size delta
                    '1015': InvalidOrder, // Invalid delta base and/or quote quantums for insurance fund delta calculation
                    '1017': InvalidOrder, // Cannot deleverage subaccount against itself
                    '1018': InvalidOrder, // Deleveraging match cannot have fills with same id
                    '1019': InvalidOrder, // Deleveraging match cannot have fills with zero amount
                    '1020': InvalidOrder, // Position cannot be fully offset
                    '1021': InvalidOrder, // Deleveraging match has incorrect value for isFinalSettlement flag
                    '1022': InvalidOrder, // Liquidation conflicts with ClobPair status
                    '2000': InvalidOrder, // FillOrKill order could not be fully filled
                    '2001': InvalidOrder, // Reduce-only orders cannot increase the position size
                    '2002': InvalidOrder, // Reduce-only orders cannot change the position side
                    '2003': InvalidOrder, // Post-only order would cross one or more maker orders
                    '2004': InvalidOrder, // IOC order is already filled, remaining size is cancelled.
                    '2005': InvalidOrder, // Order would violate isolated subaccount constraints.
                    '3000': InvalidOrder, // Invalid order flags
                    '3001': InvalidOrder, // Invalid order goodTilBlockTime
                    '3002': InvalidOrder, // Stateful orders cannot require immediate execution
                    '3003': InvalidOrder, // The block time is greater than the GoodTilBlockTime of the message
                    '3004': InvalidOrder, // The GoodTilBlockTime of the message is further than StatefulOrderTimeWindow into the future
                    '3005': InvalidOrder, // Existing stateful order has higher-or-equal priority than the new one
                    '3006': InvalidOrder, // Stateful order does not exist
                    '3007': InvalidOrder, // Stateful order collateralization check failed
                    '3008': InvalidOrder, // Stateful order was previously cancelled and therefore cannot be placed
                    '3009': InvalidOrder, // Stateful order was previously removed and therefore cannot be placed
                    '3010': InvalidOrder, // Stateful order cancellation failed because the order was already removed from state
                    '4000': InvalidOrder, // MsgProposedOperations is invalid
                    '4001': InvalidOrder, // Match Order is invalid
                    '4002': InvalidOrder, // Order was not previously placed in operations queue
                    '4003': InvalidOrder, // Fill amount cannot be zero
                    '4004': InvalidOrder, // Deleveraging fill is invalid
                    '4005': InvalidOrder, // Deleveraged subaccount in proposed deleveraged operation failed deleveraging validation
                    '4006': InvalidOrder, // Order Removal is invalid
                    '4007': InvalidOrder, // Order Removal reason is invalid
                    '4008': InvalidOrder, // Zero-fill deleveraging operation included in block for non-negative TNC subaccount
                    '5000': InvalidOrder, // Proposed BlockRateLimitConfig is invalid
                    '5001': InvalidOrder, // Block rate limit exceeded
                    '6000': InvalidOrder, // Conditional type is invalid
                    '6001': InvalidOrder, // Conditional order trigger subticks is invalid
                    '6002': InvalidOrder, // Conditional order is untriggered
                    '9000': InvalidOrder, // Asset orders are not implemented
                    '9001': InvalidOrder, // Updates for assets other than USDC are not implemented
                    '9002': InvalidOrder, // This function is not implemented
                    '9003': InvalidOrder, // Reduce-only is currently disabled for non-IOC orders
                    '10000': InvalidOrder, // Proposed EquityTierLimitConfig is invalid
                    '10001': InvalidOrder, // Subaccount cannot open more orders due to equity tier limit.
                    '11000': InvalidOrder, // Invalid order router address
                },
                'broad': {
                    'insufficient funds': InsufficientFunds,
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

    handlePublicAddress (methodName: string, params: Dict) {
        let userAux = undefined;
        [ userAux, params ] = this.handleOptionAndParams (params, methodName, 'user');
        let user = userAux;
        [ user, params ] = this.handleOptionAndParams (params, methodName, 'address', userAux);
        if ((user !== undefined) && (user !== '')) {
            return [ user, params ];
        }
        if ((this.walletAddress !== undefined) && (this.walletAddress !== '')) {
            return [ this.walletAddress, params ];
        }
        throw new ArgumentsRequired (this.id + ' ' + methodName + '() requires a user parameter inside \'params\' or the wallet address set');
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
        [ userAddress, params ] = this.handlePublicAddress ('fetchOrders', params);
        [ subAccountNumber, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'subAccountNumber', '0');
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
        [ userAddress, params ] = this.handlePublicAddress ('fetchPositions', params);
        [ subAccountNumber, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'subAccountNumber', '0');
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

    hashMessage (message) {
        return this.hash (message, keccak, 'hex');
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'];
        const s = signature['s'];
        return {
            'r': r.padStart (64, '0'),
            's': s.padStart (64, '0'),
            'v': this.sum (27, signature['v']),
        };
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    signOnboardingAction (): object {
        const message = { 'action': 'dYdX Chain Onboarding' };
        const chainId = this.options['chainId'];
        const domain: Dict = {
            'chainId': chainId,
            'name': 'dYdX Chain',
        };
        const messageTypes: Dict = {
            'dYdX': [
                { 'name': 'action', 'type': 'string' },
            ],
        };
        const msg = this.ethEncodeStructuredData (domain, messageTypes, message);
        const signature = this.signMessage (msg, this.privateKey);
        return signature;
    }

    signDydxTx (privateKey: string, message: any, memo: string, chainId: string, account: any, authenticators: any, fee = undefined): string {
        const [ encodedTx, signDoc ] = this.encodeDydxTxForSigning (message, memo, chainId, account, authenticators, fee);
        const signature = this.signHash (encodedTx, privateKey);
        return this.encodeDydxTxRaw (signDoc, signature['r'] + signature['s']);
    }

    retrieveCredentials (): any {
        let credentials = this.safeDict (this.options, 'dydxCredentials');
        if (credentials !== undefined) {
            return credentials;
        }
        const signature = this.signOnboardingAction ();
        const entropy = this.hashMessage (this.base16ToBinary (signature['r'] + signature['s']));
        credentials = this.retrieveDydxCredentials (entropy);
        credentials['privateKey'] = this.binaryToBase16 (credentials['privateKey']);
        credentials['publicKey'] = this.binaryToBase16 (credentials['publicKey']);
        this.options['dydxCredentials'] = credentials;
        return credentials;
    }

    async fetchDydxAccount (params: Dict = undefined) {
        // required in js
        await this.loadDydxProtos ();
        const dydxAccount = this.safeDict (this.options, 'dydxAccount');
        if (dydxAccount !== undefined) {
            return dydxAccount;
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
        const response = await this.nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress (request);
        const account = this.safeDict (response, 'info');
        account['pub_key'] = {
            // encode with binary key would fail in python
            'key': account['pub_key']['key'],
        };
        this.options['dydxAccount'] = account;
        return account;
    }

    pow (n: string, m: string) {
        let r = Precise.stringMul (n, '1');
        const c = this.parseToInt (m);
        // TODO: cap
        for (let i = 1; i < c; i++) {
            r = Precise.stringMul (r, n);
        }
        return r;
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        const reduceOnly = this.safeBool2 (params, 'reduceOnly', 'reduce_only', false);
        const orderType = type.toUpperCase ();
        const market = this.market (symbol);
        const orderSide = side.toUpperCase ();
        const subaccountId = this.safeInteger (params, 'subaccountId', 0);
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isConditional = triggerPrice !== undefined || stopLossPrice !== undefined || takeProfitPrice !== undefined;
        const isMarket = orderType === 'MARKET';
        const timeInForce = this.safeStringUpper (params, 'timeInForce');
        const postOnly = this.isPostOnly (isMarket, undefined, params);
        const amountStr = this.amountToPrecision (symbol, amount);
        const priceStr = this.priceToPrecision (symbol, price);
        const marketInfo = this.safeDict (market, 'info');
        const atomicResolution = Precise.stringNeg (marketInfo['atomicResolution']);
        const quantumScale = this.pow ('10', atomicResolution);
        const quantums = Precise.stringMul (amountStr, quantumScale);
        const quantumConversionExponent = marketInfo['quantumConversionExponent'];
        const priceScale = this.pow ('10', Precise.stringAdd (atomicResolution, Precise.stringAdd (quantumConversionExponent, '6')));
        const subticks = Precise.stringMul (priceStr, priceScale);
        let clientMetadata = 0;
        let conditionalType = 0;
        let conditionalOrderTriggerSubticks = '0';
        let orderFlag = undefined;
        let timeInForceNumber = undefined;
        if (timeInForce === 'FOK') {
            throw new Error (this.id + ' timeInForce fok has been deprecated');
        }
        if (orderType === 'MARKET') {
            // short-term
            orderFlag = 0;
            clientMetadata = 1; // STOP_MARKET / TAKE_PROFIT_MARKET
            if (timeInForce !== undefined) {
                // default is ioc
                timeInForceNumber = 1;
            }
        } else if (orderType === 'LIMIT') {
            if (timeInForce === undefined) {
                throw new ArgumentsRequired (this.id + ' timeInForce should be specified for limit order.');
            }
            if (timeInForce === 'GTT') {
                // long-term
                orderFlag = 64;
                if (postOnly) {
                    timeInForceNumber = 2;
                } else {
                    timeInForceNumber = 0;
                }
            } else {
                orderFlag = 0;
                if (timeInForce === 'IOC') {
                    timeInForceNumber = 1;
                } else {
                    throw new Error ('unexpected code path: timeInForce');
                }
            }
        }
        if (isConditional) {
            // conditional
            orderFlag = 32;
            if (stopLossPrice !== undefined) {
                conditionalType = 1;
                conditionalOrderTriggerSubticks = this.priceToPrecision (symbol, stopLossPrice);
            } else if (takeProfitPrice !== undefined) {
                conditionalType = 2;
                conditionalOrderTriggerSubticks = this.priceToPrecision (symbol, takeProfitPrice);
            }
            conditionalOrderTriggerSubticks = Precise.stringMul (conditionalOrderTriggerSubticks, priceScale);
        }
        const latestBlockHeight = this.safeInteger (params, 'latestBlockHeight');
        let goodTillBlock = this.safeInteger (params, 'goodTillBlock');
        let goodTillBlockTime = undefined;
        const goodTillBlockTimeInSeconds = this.safeInteger (params, 'goodTillBlockTimeInSeconds', 60); // default is 60 seconds
        if (orderFlag === 0) {
            if (goodTillBlock === undefined) {
                // short term order
                goodTillBlock = latestBlockHeight + 20;
            }
        } else {
            if (goodTillBlockTimeInSeconds === undefined) {
                throw new ArgumentsRequired ('goodTillBlockTimeInSeconds is required.');
            }
            goodTillBlockTime = this.seconds () + goodTillBlockTimeInSeconds;
        }
        const sideNumber = (orderSide === 'BUY') ? 1 : 2;
        const defaultClientOrderId = this.randNumber (10);
        const clientOrderId = this.safeInteger (params, 'clientOrderId', defaultClientOrderId);
        const orderPayload = {
            'order': {
                'orderId': {
                    'subaccountId': {
                        'owner': this.walletAddress,
                        'number': subaccountId,
                    },
                    'clientId': clientOrderId,
                    'orderFlags': orderFlag,
                    'clobPairId': marketInfo['clobPairId'],
                },
                'side': sideNumber,
                'quantums': this.toDydxLong (quantums),
                'subticks': this.toDydxLong (subticks),
                'goodTilBlock': goodTillBlock,
                'goodTilBlockTime': goodTillBlockTime,
                'timeInForce': timeInForceNumber,
                'reduceOnly': reduceOnly,
                'clientMetadata': clientMetadata,
                'conditionType': conditionalType,
                'conditionalOrderTriggerSubticks': this.toDydxLong (conditionalOrderTriggerSubticks),
            },
        };
        const signingPayload = {
            'typeUrl': '/dydxprotocol.clob.MsgPlaceOrder',
            'value': orderPayload,
        };
        params = this.omit (params, [ 'reduceOnly', 'reduce_only', 'clientOrderId', 'postOnly', 'timeInForce', 'stopPrice', 'triggerPrice', 'stopLoss', 'takeProfit', 'latestBlockHeight', 'goodTillBlock', 'goodTillBlockTimeInSeconds', 'subaccountId' ]);
        return this.extend (signingPayload, params);
    }

    async fetchLatestBlockHeight (params = {}): Promise<int> {
        const response = await this.nodeRpcGetAbciInfo (params);
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
        const result = this.safeDict (response, 'result');
        const info = this.safeDict (result, 'response');
        return this.safeInteger (info, 'last_block_height');
    }

    /**
     * @method
     * @name dydx#createOrder
     * @description create a trade order
     * @see
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.algoType] 'STOP'or 'TP_SL' or 'POSITIONAL_TP_SL'
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const credentials = this.retrieveCredentials ();
        const account = await this.fetchDydxAccount ();
        const lastBlockHeight = await this.fetchLatestBlockHeight ();
        params['latestBlockHeight'] = lastBlockHeight;
        const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, params);
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx (credentials['privateKey'], orderRequest, '', chainName, account, undefined);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync (request);
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
        const result = this.safeDict (response, 'result');
        return this.safeOrder ({
            'info': result,
            'clientOrderId': orderRequest['value']['order']['orderId']['clientId'],
        });
    }

    /**
     * @method
     * @name dydx#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        const isTrigger = this.safeBool2 (params, 'trigger', 'stop', false);
        params = this.omit (params, [ 'trigger', 'stop' ]);
        if (!isTrigger && (symbol === undefined)) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market: Market = this.market (symbol);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        let goodTillBlock = this.safeInteger (params, 'goodTillBlock');
        const goodTillBlockTimeInSeconds = this.safeInteger (params, 'goodTillBlockTimeInSeconds');
        let goodTillBlockTime = undefined;
        const defaultOrderFlags = (isTrigger) ? 32 : undefined;
        const orderFlags = this.safeInteger (params, 'orderFlags', defaultOrderFlags);
        const subaccountId = this.safeInteger (params, 'subaccountId', 0);
        params = this.omit (params, [ 'clientOrderId', 'orderFlags', 'goodTillBlock', 'goodTillBlockTime', 'goodTillBlockTimeInSeconds', 'subaccountId' ]);
        if (orderFlags !== 0 && orderFlags !== 64 && orderFlags !== 32) {
            throw new Error (this.id + ' invalid orderFlags (0, 64, 32).');
        }
        if (orderFlags > 0) {
            if (goodTillBlockTimeInSeconds === undefined) {
                throw new ArgumentsRequired (this.id + ' goodTillBlockTimeInSeconds is required for long term or conditional order.');
            }
            if (goodTillBlock !== undefined && goodTillBlock > 0) {
                throw new Error (this.id + ' goodTillBlock should be 0 for long term or conditional order.');
            }
            goodTillBlockTime = this.seconds () + goodTillBlockTimeInSeconds;
        } else {
            const latestBlockHeight = await this.fetchLatestBlockHeight ();
            if (goodTillBlock === undefined) {
                goodTillBlock = latestBlockHeight + 20;
            }
        }
        const credentials = this.retrieveCredentials ();
        const account = await this.fetchDydxAccount ();
        const cancelPayload = {
            'orderId': {
                'subaccountId': {
                    'owner': this.walletAddress,
                    'number': subaccountId,
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
        const signedTx = this.signDydxTx (credentials['privateKey'], signingPayload, '', chainName, account, undefined);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync (request);
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
        const result = this.safeDict (response, 'result');
        return this.safeOrder ({
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
     * @param {string[]} [params.client_order_ids] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrders (ids:string[], symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        const market: Market = this.market (symbol);
        const clientOrderIds = this.safeList (params, 'clientOrderIds');
        if (!clientOrderIds) {
            throw new NotSupported (this.id + ' cancelOrders only support clientOrderIds.');
        }
        const subaccountId = this.safeInteger (params, 'subaccountId', 0);
        let goodTillBlock = this.safeInteger (params, 'goodTillBlock');
        if (goodTillBlock === undefined) {
            const latestBlockHeight = await this.fetchLatestBlockHeight ();
            goodTillBlock = latestBlockHeight + 20;
        }
        params = this.omit (params, [ 'clientOrderIds', 'goodTillBlock', 'subaccountId' ]);
        const credentials = this.retrieveCredentials ();
        const account = await this.fetchDydxAccount ();
        const cancelPayload = {
            'subaccountId': {
                'owner': this.walletAddress,
                'number': subaccountId,
            },
            'shortTermCancels': [ {
                'clientIds': clientOrderIds,
                'clobPairId': market['info']['clobPairId'],
            } ],
            'goodTilBlock': goodTillBlock,
        };
        const signingPayload = {
            'typeUrl': '/dydxprotocol.clob.MsgBatchCancel',
            'value': cancelPayload,
        };
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx (credentials['privateKey'], signingPayload, '', chainName, account, undefined);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync (request);
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
        const result = this.safeDict (response, 'result');
        return [ this.safeOrder ({
            'info': result,
        }) ];
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

    parseLedgerEntry (item: Dict, currency: Currency = undefined): LedgerEntry {
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
        const currencyId = this.safeString (item, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        currency = this.safeCurrency (currencyId, currency);
        const type = this.safeStringUpper (item, 'type');
        let direction = undefined;
        if (type !== undefined) {
            if (type === 'TRANSFER_IN' || type === 'DEPOSIT') {
                direction = 'in';
            } else if (type === 'TRANSFER_OUT' || type === 'WITHDRAWAL') {
                direction = 'out';
            }
        }
        const amount = this.safeString (item, 'size');
        const timestamp = this.parse8601 (this.safeString (item, 'createdAt'));
        const sender = this.safeDict (item, 'sender');
        const recipient = this.safeDict (item, 'recipient');
        return this.safeLedgerEntry ({
            'info': item,
            'id': this.safeString (item, 'id'),
            'direction': direction,
            'account': this.safeString (sender, 'address'),
            'referenceAccount': this.safeString (recipient, 'address'),
            'referenceId': this.safeString (item, 'transactionHash'),
            'type': this.parseLedgerEntryType (type),
            'currency': code,
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': undefined,
            'after': undefined,
            'status': undefined,
            'fee': undefined,
        }, currency) as LedgerEntry;
    }

    parseLedgerEntryType (type) {
        const ledgerType: Dict = {
            'TRANSFER_IN': 'transfer',
            'TRANSFER_OUT': 'transfer',
            'DEPOSIT': 'deposit',
            'WITHDRAWAL': 'withdrawal',
        };
        return this.safeString (ledgerType, type, type);
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
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        params['methodName'] = 'fetchLedger';
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        return this.parseLedger (response, currency, since, limit);
    }

    async estimateTxFee (message: any, memo: string, account: any): Promise<any> {
        const txBytes = this.encodeDydxTxForSimulation (message, memo, account['sequence'], account['pub_key']);
        const request = {
            'txBytes': txBytes,
        };
        const response = await this.nodeRestPostCosmosTxV1beta1Simulate (request);
        //
        // {
        //     gas_info: { gas_wanted: '18446744073709551615', gas_used: '86055' },
        //     result: {
        //         ...
        //     }
        // }
        //
        const gasInfo = this.safeDict (response, 'gas_info');
        if (gasInfo === undefined) {
            throw new Error (this.id + ' failed to simulate transaction.');
        }
        const gasUsed = this.safeString (gasInfo, 'gas_used');
        if (gasUsed === undefined) {
            throw new Error (this.id + ' failed to simulate transaction.');
        }
        const defaultFeeDenom = this.safeString (this.options, 'defaultFeeDenom');
        const defaultFeeMultiplier = this.safeString (this.options, 'defaultFeeMultiplier');
        const feeDenom = this.safeDict (this.options, 'feeDenom');
        let gasPrice = undefined;
        let denom = undefined;
        if (defaultFeeDenom === 'uusdc') {
            gasPrice = feeDenom['USDC_GAS_PRICE'];
            denom = feeDenom['USDC_DENOM'];
        } else {
            gasPrice = feeDenom['CHAINTOKEN_GAS_PRICE'];
            denom = feeDenom['CHAINTOKEN_DENOM'];
        }
        const gasLimit = Math.ceil (this.parseToNumeric (Precise.stringMul (gasUsed, defaultFeeMultiplier)));
        let feeAmount = Precise.stringMul (this.numberToString (gasLimit), gasPrice);
        if (feeAmount.indexOf ('.') >= 0) {
            feeAmount = this.numberToString (Math.ceil (this.parseToNumeric (feeAmount)));
        }
        return {
            'amount': [ {
                'amount': feeAmount,
                'denom': denom,
            } ],
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
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> {
        this.checkRequiredCredentials ();
        if (code !== 'USDC') {
            throw new NotSupported (this.id + ' transfer() only support USDC');
        }
        await this.loadMarkets ();
        const fromSubaccountId = this.safeInteger (params, 'fromSubaccountId');
        const toSubaccountId = this.safeInteger (params, 'toSubaccountId');
        if (fromAccount !== 'main') {
            // throw error if from subaccount id is undefind
            if (fromAccount === undefined) {
                throw new NotSupported (this.id + ' transfer only support main > subaccount and subaccount <> subaccount.');
            }
            if (fromSubaccountId === undefined || toSubaccountId === undefined) {
                throw new ArgumentsRequired (this.id + ' transfer requires fromSubaccountId and toSubaccountId.');
            }
        }
        params = this.omit (params, [ 'fromSubaccountId', 'toSubaccountId' ]);
        const credentials = this.retrieveCredentials ();
        const account = await this.fetchDydxAccount ();
        const usd = this.parseToInt (Precise.stringMul (this.numberToString (amount), '1000000'));
        let payload = undefined;
        let signingPayload = undefined;
        if (fromAccount === 'main') {
            // deposit to subaccount
            if (toSubaccountId === undefined) {
                throw new ArgumentsRequired (this.id + ' transfer() requeire toSubaccoutnId.');
            }
            payload = {
                'sender': this.walletAddress,
                'recipient': {
                    'owner': this.walletAddress,
                    'number': toSubaccountId,
                },
                'assetId': 0,
                'quantums': usd,
            };
            signingPayload = {
                'typeUrl': '/dydxprotocol.sending.MsgDepositToSubaccount',
                'value': payload,
            };
        } else {
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
        const txFee = await this.estimateTxFee (signingPayload, '', account);
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx (credentials['privateKey'], signingPayload, '', chainName, account, undefined, txFee);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync (request);
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
        return this.parseTransfer (response);
    }

    parseTransfer (transfer: Dict, currency: Currency = undefined): TransferEntry {
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
        const id = this.safeString (transfer, 'id');
        const currencyId = this.safeString (transfer, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.safeNumber (transfer, 'size');
        const sender = this.safeDict (transfer, 'sender');
        const recipient = this.safeDict (transfer, 'recipient');
        const fromAccount = this.safeString (sender, 'address');
        const toAccount = this.safeString (recipient, 'address');
        const timestamp = this.parse8601 (this.safeString (transfer, 'createdAt'));
        return {
            'info': transfer,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
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
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        params['methodName'] = 'fetchTransfers';
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        const transferIn = this.filterBy (response, 'type', 'TRANSFER_IN');
        const transferOut = this.filterBy (response, 'type', 'TRANSFER_OUT');
        const rows = this.arrayConcat (transferIn, transferOut);
        return this.parseTransfers (rows, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
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
        const id = this.safeString (transaction, 'id');
        const sender = this.safeDict (transaction, 'sender');
        const recipient = this.safeDict (transaction, 'recipient');
        const addressTo = this.safeString (recipient, 'address');
        const addressFrom = this.safeString (sender, 'address');
        const txid = this.safeString (transaction, 'transactionHash');
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAt'));
        const amount = this.safeNumber (transaction, 'size');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': addressTo,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': undefined,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': this.safeStringLower (transaction, 'type'), // 'deposit', 'withdrawal'
            'amount': amount,
            'currency': code,
            'status': undefined,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': undefined,
        } as Transaction;
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
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        this.checkRequiredCredentials ();
        if (code !== 'USDC') {
            throw new NotSupported (this.id + ' withdraw() only support USDC');
        }
        await this.loadMarkets ();
        this.checkAddress (address);
        const subaccountId = this.safeInteger (params, 'subaccountId');
        if (subaccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw requires subaccountId.');
        }
        params = this.omit (params, [ 'subaccountId' ]);
        const currency = this.currency (code);
        const credentials = this.retrieveCredentials ();
        const account = await this.fetchDydxAccount ();
        const usd = this.parseToInt (Precise.stringMul (this.numberToString (amount), '1000000'));
        const payload = {
            'sender': {
                'owner': this.walletAddress,
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
        const txFee = await this.estimateTxFee (signingPayload, tag, account);
        const chainName = this.options['chainName'];
        const signedTx = this.signDydxTx (credentials['privateKey'], signingPayload, tag, chainName, account, undefined, txFee);
        const request = {
            'tx': signedTx,
        };
        // nodeRpcGetBroadcastTxAsync
        const response = await this.nodeRpcGetBroadcastTxSync (request);
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
        const data = this.safeDict (response, 'result', {});
        return this.parseTransaction (data, currency);
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
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        params['methodName'] = 'fetchWithdrawals';
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        const rows = this.filterBy (response, 'type', 'WITHDRAWAL');
        return this.parseTransactions (rows, currency, since, limit);
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
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        params['methodName'] = 'fetchDeposits';
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        const rows = this.filterBy (response, 'type', 'DEPOSIT');
        return this.parseTransactions (rows, currency, since, limit);
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
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        params['methodName'] = 'fetchDepositsWithdrawals';
        const response = await this.fetchTransactionsHelper (code, since, limit, params);
        const withdrawals = this.filterBy (response, 'type', 'WITHDRAWAL');
        const deposits = this.filterBy (response, 'type', 'DEPOSIT');
        const rows = this.arrayConcat (withdrawals, deposits);
        return this.parseTransactions (rows, currency, since, limit);
    }

    async fetchTransactionsHelper (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        const methodName = this.safeString (params, 'methodName');
        params = this.omit (params, 'methodName');
        let userAddress = undefined;
        let subAccountNumber = undefined;
        [ userAddress, params ] = this.handlePublicAddress (methodName, params);
        [ subAccountNumber, params ] = this.handleOptionAndParams (params, methodName, 'subAccountNumber', '0');
        const request: Dict = {
            'address': userAddress,
            'subaccountNumber': subAccountNumber,
        };
        const response = await this.indexerGetTransfers (this.extend (request, params));
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
        return this.safeList (response, 'transfers', []);
    }

    /**
     * @method
     * @name dydx#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.dydx.xyz/indexer-client/http#get-subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address that made trades
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts (params = {}): Promise<Account[]> {
        let userAddress = undefined;
        [ userAddress, params ] = this.handlePublicAddress ('fetchAccounts', params);
        const request: Dict = {
            'address': userAddress,
        };
        const response = await this.indexerGetAddressesAddress (this.extend (request, params));
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
        const rows = this.safeList (response, 'subaccounts', []);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const account = rows[i];
            const accountId = this.safeString (account, 'subaccountNumber');
            result.push ({
                'id': accountId,
                'type': undefined,
                'currency': undefined,
                'info': account,
                'code': undefined,
            });
        }
        return result;
    }

    nonce () {
        return this.milliseconds () - this.options['timeDifference'];
    }

    sign (path, section = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const pathWithParams = this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][section]);
        params = this.omit (params, this.extractParams (path));
        params = this.keysort (params);
        url += '/' + pathWithParams;
        if (method === 'GET') {
            if (Object.keys (params).length) {
                url += '?' + this.urlencode (params);
            }
        } else {
            body = this.json (params);
            headers = {
                'Content-type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
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
        const result = this.safeDict (response, 'result');
        let errorCode = this.safeString (result, 'code');
        if (!errorCode) {
            errorCode = this.safeString (response, 'code');
        }
        if (errorCode) {
            const errorCodeNum = this.parseToNumeric (errorCode);
            if (errorCodeNum > 0) {
                const feedback = this.id + ' ' + this.json (response);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
                throw new ExchangeError (feedback);
            }
        }
        return undefined;
    }

    setSandboxMode (enable: boolean) {
        super.setSandboxMode (enable);
        // rewrite testnet parameters
        this.options['chainName'] = 'dydx-testnet-4';
        this.options['chainId'] = 11155111;
        this.options['feeDenom']['CHAINTOKEN_DENOM'] = 'adv4tnt';
    }
}
