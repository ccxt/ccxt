//  ---------------------------------------------------------------------------

import { Precise } from '../ccxt.js';
import Exchange from './abstract/bullish.js';
import { AuthenticationError, ArgumentsRequired, BadRequest, BadSymbol, BaseError, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InvalidNonce, InvalidOrder, InsufficientFunds, OperationFailed, OperationRejected, OrderNotFound, RateLimitExceeded, UnsubscribeError } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Account, Balances, Bool, Currencies, Currency, DepositAddress, Dict, Int, int, FundingRateHistory, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade, Transaction, TransferEntry } from './base/types.js';

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
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': true,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
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
                'fetchMyTrades': true,
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
                'fetchPositionHistory': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
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
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': true,
                'transfer': true,
                'withdraw': true,
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
                'test': {
                    'public': 'https://api.simnext.bullish-test.com/trading-api',
                    'private': 'https://api.simnext.bullish-test.com/trading-api',
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
                        'v1/history/markets/{symbol}/trades': 1, // done
                        'v1/history/markets/{symbol}/funding-rate': 1, // done
                        'v1/index-prices': 1, // not used
                        'v1/index-prices/{assetSymbol}': 1, // not used
                    },
                },
                'private': {
                    'get': {
                        'v2/orders': 1, // done
                        'v2/orders/{orderId}': 1, // done
                        'v2/amm-instructions': 1, // not used
                        'v2/amm-instructions/{instructionId}': 1, // not used
                        'v1/wallets/transactions': 1, // todo complete after withdraw
                        'v1/wallets/limits/{symbol}': 1, // not used
                        'v1/wallets/deposit-instructions/crypto/{symbol}': 1, // done
                        'v1/wallets/withdrawal-instructions/crypto/{symbol}': 1, // not used
                        'v1/wallets/deposit-instructions/fiat/{symbol}': 1, // not used
                        'v1/wallets/withdrawal-instructions/fiat/{symbol}': 1, // not used
                        'v1/trades': 1, // done
                        'v1/trades/{tradeId}': 1, // not used
                        'v1/accounts/asset': 1, // done
                        'v1/accounts/asset/{symbol}': 1, // done
                        'v1/users/logout': 1, // not used
                        'v1/users/hmac/login': 1, // done
                        'v1/accounts/trading-accounts': 1, // done
                        'v1/accounts/trading-accounts/{tradingAccountId}': 1, // done
                        'v1/derivatives-positions': 1, // done
                        'v1/history/derivatives-settlement': 1, // done
                        'v1/history/transfer': 1, // done
                        'v1/history/borrow-interest': 1, // done
                    },
                    'post': {
                        'v2/orders': 1, // done
                        'v2/command': 1, // done
                        'v2/amm-instructions': 1, // not used
                        'v1/wallets/withdrawal': 1, // todo check
                        'v2/users/login': 1, // done
                        'v1/command?commandType=V1TransferAsset': 1, // todo check
                        'v1/simulate-portfolio-margin': 1, // not used
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.001'),
                    'maker': this.parseNumber ('0.001'),
                },
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'tokenExpires': undefined, // used for the login endpoint
                'networks': {
                    'BTC': 'BTC',
                    'EOS': 'EOS',
                    'ERC20': 'ETH',
                },
                'tradingAccountId': '111309424211255',
            },
            'features': {
                'spot': {
                },
            },
            'exceptions': {
                'exact': {
                    '400': BadRequest,
                    '1': BadSymbol,
                    '5': InvalidOrder,
                    '6': DuplicateOrderId,
                    '13': BadRequest,
                    '15': BadRequest,
                    '18': BadRequest,
                    '1002': BadRequest,
                    '2001': BadRequest,
                    '2002': BadRequest,
                    '2003': BadRequest,
                    '2004': BadRequest,
                    '2005': ExchangeError,
                    '2006': BadRequest,
                    '2007': AuthenticationError,
                    '2008': BadRequest,
                    '2009': BadRequest,
                    '2010': AuthenticationError,
                    '2011': BadRequest,
                    '2012': BadRequest,
                    '2013': BadRequest,
                    '2015': RateLimitExceeded,
                    '2016': BadRequest,
                    '2017': InvalidOrder,
                    '2018': BadRequest,
                    '2020': OperationRejected,
                    '2021': RateLimitExceeded,
                    '2029': BadRequest,
                    '2035': InvalidNonce,
                    '3001': InsufficientFunds,
                    '3002': OrderNotFound,
                    '3003': ExchangeNotAvailable,
                    '3004': ExchangeNotAvailable,
                    '3005': InsufficientFunds,
                    '3006': InsufficientFunds,
                    '3007': DuplicateOrderId,
                    '3020': OperationFailed,
                    '3021': OperationFailed,
                    '3023': DuplicateOrderId,
                    '3031': BadRequest,
                    '3032': OperationRejected,
                    '3033': OperationRejected,
                    '3034': RateLimitExceeded,
                    '3035': RateLimitExceeded,
                    '3064': OperationFailed,
                    '3065': RateLimitExceeded,
                    '3066': RateLimitExceeded,
                    '3067': ExchangeError,
                    '6002': ExchangeError,
                    '6003': ExchangeError,
                    '6004': ExchangeError,
                    '6005': BaseError,
                    '6007': BaseError,
                    '6011': BaseError,
                    '6012': BaseError,
                    '6023': BadRequest,
                    '6105': OperationRejected,
                    '8301': UnsubscribeError,
                    '8305': OperationFailed,
                    '8306': AuthenticationError,
                    '8307': OperationFailed,
                    '8310': OperationFailed,
                    '8311': BadRequest,
                    '8313': BadRequest,
                    '8315': BadRequest,
                    '8316': ExchangeError,
                    '8317': ExchangeError,
                    '8318': ExchangeError,
                    '8319': ExchangeError,
                    '8320': AuthenticationError,
                    '8322': BadRequest,
                    '8327': AuthenticationError,
                    '8329': ExchangeError,
                    '8331': BadRequest,
                    '8332': BadRequest,
                    '8333': BadSymbol,
                    '8334': BadRequest,
                    '8335': BadRequest,
                    '8336': BadRequest,
                    '8399': UnsubscribeError,
                    '20999': ExchangeError,
                    '23001': BadRequest,
                    '30001': BadRequest,
                },
                'broad': {
                    'HttpInvalidParameterException': BadRequest,
                    'UNAUTHORIZED_COMMAND': AuthenticationError, // {"message":"Unauthorized to execute command","raw":null,"errorCode":6105,"errorCodeName":"UNAUTHORIZED_COMMAND"}
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
            const id = this.safeString (currency, 'symbol');
            const code = this.safeString (currency, 'symbol');
            const name = this.safeString (currency, 'name');
            const precision = this.safeString (currency, 'precision');
            const minFee = Precise.stringMax (this.safeString (currency, 'minFee'), '0.00000');
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'active': true,
                'deposit': undefined,
                'withdraw': undefined,
                'fee': minFee,
                'precision': this.parseNumber (this.parsePrecision (precision)),
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
        return this.parseMarkets (response);
    }

    parseMarket (market: Dict): Market {
        //
        //     {
        //         "marketId": "20069",
        //         "symbol": "BTC-USDC-20250516",
        //         "quoteAssetId": "5",
        //         "baseAssetId": "1",
        //         "quoteSymbol": "USDC",
        //         "baseSymbol": "BTC",
        //         "quotePrecision": "4",
        //         "basePrecision": "8",
        //         "pricePrecision": "4",
        //         "quantityPrecision": "8",
        //         "costPrecision": "4",
        //         "minQuantityLimit": "0.00050000",
        //         "maxQuantityLimit": "200.00000000",
        //         "maxPriceLimit": null,
        //         "minPriceLimit": null,
        //         "maxCostLimit": null,
        //         "minCostLimit": null,
        //         "timeZone": "Etc/UTC",
        //         "tickSize": "0.1000",
        //         "liquidityTickSize": "100.0000",
        //         "liquidityPrecision": "4",
        //         "makerFee": "0",
        //         "takerFee": "2",
        //         "roundingCorrectionFactor": "0.00000100",
        //         "makerMinLiquidityAddition": "1000000",
        //         "orderTypes":
        //             [
        //                 "LMT",
        //                 "MKT",
        //                 "STOP_LIMIT",
        //                 "POST_ONLY"
        //             ],
        //         "spotTradingEnabled": true,
        //         "marginTradingEnabled": true,
        //         "marketEnabled": true,
        //         "createOrderEnabled": true,
        //         "cancelOrderEnabled": true,
        //         "liquidityInvestEnabled": true,
        //         "liquidityWithdrawEnabled": true,
        //         "feeTiers":
        //             [
        //                 {
        //                     "feeTierId": "1",
        //                     "staticSpreadFee": "0.00000000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "10",
        //                     "staticSpreadFee": "0.00100000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "11",
        //                     "staticSpreadFee": "0.00150000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "12",
        //                     "staticSpreadFee": "0.00150000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "13",
        //                     "staticSpreadFee": "0.00300000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "14",
        //                     "staticSpreadFee": "0.00300000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "15",
        //                     "staticSpreadFee": "0.00500000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "16",
        //                     "staticSpreadFee": "0.00500000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "17",
        //                     "staticSpreadFee": "0.01000000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "18",
        //                     "staticSpreadFee": "0.01000000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "19",
        //                     "staticSpreadFee": "0.01500000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "2",
        //                     "staticSpreadFee": "0.00000000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "20",
        //                     "staticSpreadFee": "0.01500000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "21",
        //                     "staticSpreadFee": "0.02000000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "22",
        //                     "staticSpreadFee": "0.02000000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "3",
        //                     "staticSpreadFee": "0.00010000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "4",
        //                     "staticSpreadFee": "0.00010000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "5",
        //                     "staticSpreadFee": "0.00020000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "6",
        //                     "staticSpreadFee": "0.00020000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "7",
        //                     "staticSpreadFee": "0.00060000",
        //                     "isDislocationEnabled": false
        //                 },
        //                 {
        //                     "feeTierId": "8",
        //                     "staticSpreadFee": "0.00060000",
        //                     "isDislocationEnabled": true
        //                 },
        //                 {
        //                     "feeTierId": "9",
        //                     "staticSpreadFee": "0.00100000",
        //                     "isDislocationEnabled": false
        //                 }
        //             ],
        //         "marketType": "DATED_FUTURE",
        //         "contractMultiplier": "1",
        //         "settlementAssetSymbol": "USDC",
        //         "underlyingQuoteSymbol": "USDC",
        //         "underlyingBaseSymbol": "BTC",
        //         "openInterestLimitUSD": "100000000.0000",
        //         "concentrationRiskPercentage": "100.00",
        //         "concentrationRiskThresholdUSD": "30000000.0000",
        //         "expiryDatetime": "2025-05-16T08:00:00.000Z",
        //         "priceBuffer": "0.1",
        //         "feeGroupId": "4"
        //     }
        //
        const id = this.safeString (market, 'symbol');
        let symbol = undefined;
        const baseId = this.safeString (market, 'baseSymbol');
        const quoteId = this.safeString (market, 'quoteSymbol');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
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
        let swap: Bool = false;
        let future: Bool = false;
        let linear: Bool = false;
        let inverse: Bool = false;
        let expiryDatetime: Str = undefined;
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
            const rawSymbol = this.safeString (market, 'symbol');
            const parts = rawSymbol.split ('-');
            const datePart = this.safeString (parts, 2);
            symbol = base + '/' + quote + '-' + datePart;
            expiryDatetime = this.safeString (market, 'expiryDatetime');
        }
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
            'margin': undefined,
            'swap': swap,
            'future': future,
            'option': false,
            'contract': false,
            'linear': linear,
            'inverse': inverse,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'contractSize': undefined,
            'expiry': this.parse8601 (expiryDatetime),
            'expiryDatetime': expiryDatetime,
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
                'amount': this.parseNumber (this.parsePrecision (costPrecision)),
                'price': this.parseNumber (this.parsePrecision (pricePrecision)),
                'base': this.parseNumber (this.parsePrecision (basePrecision)),
                'quote': this.parseNumber (this.parsePrecision (quotePrecision)),
            },
            'active': undefined,
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
        const timestamp = this.safeInteger (response, 'timestamp');
        return this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', 'price', 'priceLevelQuantity');
    }

    /**
     * @method
     * @name bullish#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/trades
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const maxLimit = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTrades', symbol, since, limit, params, maxLimit) as Trade[];
        }
        if (since !== undefined) {
            request['createdAtDatetime[gte]'] = this.iso8601 (since);
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['createdAtDatetime[lte]'] = this.iso8601 (until);
            params = this.omit (params, 'until');
        }
        let response = undefined;
        if ((since !== undefined) || (until !== undefined)) {
            request['_pageSize'] = maxLimit;
            response = await this.publicGetV1HistoryMarketsSymbolTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "tradeId": "100178000000367159",
            //             "symbol": "BTCUSDC",
            //             "price": "103891.8977",
            //             "quantity": "0.00029411",
            //             "quoteAmount": "30.5556",
            //             "side": "BUY",
            //             "isTaker": true,
            //             "createdAtTimestamp": "1747768055826",
            //             "createdAtDatetime": "2025-05-20T19:07:35.826Z"
            //         }, ...
            //     ]
            //
        } else {
            response = await this.publicGetV1MarketsSymbolTrades (this.extend (request, params));
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
        }
        return this.parseTrades (response, market, since, limit);
    }

    /**
     * @method
     * @name bullish#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderId] the order id to fetch trades for
     * @param {string} [params.tradingAccountId] the trading account id to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            request['tradingAccountId'] = tradingAccountId;
        } else {
            throw new ArgumentsRequired (this.id + 'fetchMyTrades() requires a tradingAccountId parameter');
        }
        const orderId = this.safeString (params, 'orderId');
        if (orderId !== undefined) {
            request['orderId'] = orderId;
            params = this.omit (params, 'orderId');
        }
        const response = await this.privateGetV1Trades (this.extend (request, params));
        //
        //     [
        //         {
        //             "baseFee": "0.00000000",
        //             "createdAtDatetime": "2025-05-18T15:57:28.132Z",
        //             "createdAtTimestamp": "1747583848132",
        //             "handle": null,
        //             "isTaker": true,
        //             "orderId": "844242293909618689",
        //             "price": "103942.7048",
        //             "publishedAtTimestamp": "1747769786131",
        //             "quantity": "1.00000000",
        //             "quoteAmount": "103942.7048",
        //             "quoteFee": "0.0000",
        //             "side": "BUY",
        //             "symbol": "BTCUSDC",
        //             "tradeId": "100178000000288892"
        //         }, ...
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades
        //     [
        //         {
        //             "tradeId": "100178000000367159",
        //             "symbol": "BTCUSDC",
        //             "price": "103891.8977",
        //             "quantity": "0.00029411",
        //             "quoteAmount": "30.5556",
        //             "side": "BUY",
        //             "isTaker": true,
        //             "createdAtTimestamp": "1747768055826",
        //             "createdAtDatetime": "2025-05-20T19:07:35.826Z"
        //         }, ...
        //     ]
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
        // fetchMyTrades
        //     [
        //         {
        //             "baseFee": "0.00000000",
        //             "createdAtDatetime": "2025-05-18T15:57:28.132Z",
        //             "createdAtTimestamp": "1747583848132",
        //             "handle": null,
        //             "isTaker": true,
        //             "orderId": "844242293909618689",
        //             "price": "103942.7048",
        //             "publishedAtTimestamp": "1747769786131",
        //             "quantity": "1.00000000",
        //             "quoteAmount": "103942.7048",
        //             "quoteFee": "0.0000",
        //             "side": "BUY",
        //             "symbol": "BTCUSDC",
        //             "tradeId": "100178000000288892"
        //         }, ...
        //     ]
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'createdAtTimestamp');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        const side = this.safeString (trade, 'side');
        const isTaker = this.safeBool (trade, 'isTaker');
        const currency = market['quote'];
        const code = this.safeCurrencyCode (currency);
        const feeCost = this.safeNumber (trade, 'quoteFee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'currency': code, 'cost': feeCost };
        }
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
            'id': this.safeString (trade, 'tradeId'),
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
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
        const marketId = this.safeString (ticker, 'symbol');
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
            'markPrice': this.safeString (ticker, 'markPrice'),
            'info': ticker,
        }, market);
    }

    async safeDeterministicCall (method: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, timeframe: Str = undefined, params = {}) {
        let maxRetries = undefined;
        [ maxRetries, params ] = this.handleOptionAndParams (params, method, 'maxRetries', 3);
        let errors = 0;
        params = this.omit (params, 'until');
        // the exchange returns the most recent data, so we do not need to pass until into paginated calls
        // the correct util value will be calculated inside of the method
        while (errors <= maxRetries) {
            try {
                if (timeframe && method !== 'fetchFundingRateHistory') {
                    return await this[method] (symbol, timeframe, since, limit, params);
                } else {
                    return await this[method] (symbol, since, limit, params);
                }
            } catch (e) {
                if (e instanceof RateLimitExceeded) {
                    throw e; // if we are rate limited, we should not retry and fail fast
                }
                errors += 1;
                if (errors > maxRetries) {
                    throw e;
                }
            }
        }
        return [];
    }

    /**
     * @method
     * @name bullish#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/candle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const maxLimit = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, maxLimit) as OHLCV[];
        }
        let request: Dict = {
            'symbol': market['id'],
            'timeBucket': this.safeString (this.timeframes, timeframe, timeframe),
            '_pageSize': maxLimit,
        };
        [ request, params ] = this.handleUntilOption ('createdAtDatetime[lte]', request, params);
        let until = this.safeInteger (request, 'createdAtDatetime[lte]');
        const duration = this.parseTimeframe (timeframe);
        const maxDelta = 1000 * duration * maxLimit;
        let startTime = since;
        // both of since and until are required
        if (startTime === undefined && until === undefined) {
            until = this.milliseconds ();
            startTime = until - maxDelta;
        } else if (startTime === undefined) {
            startTime = until - maxDelta;
        } else if (until === undefined) {
            until = this.sum (startTime, maxDelta);
        }
        request['createdAtDatetime[gte]'] = this.iso8601 (startTime);
        request['createdAtDatetime[lte]'] = this.iso8601 (until);
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
     * @name bullish#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const maxLimit = 25; // current endpoint supports a maximum of 25 entries per request
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingRateHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchFundingRateHistory', symbol, since, limit, params, maxLimit) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest (this.id + ' fetchFundingRateHistory() supports swap markets only');
        }
        let request: Dict = {
            'symbol': market['id'],
            '_pageSize': maxLimit,
        };
        if (since !== undefined) {
            request['updatedAtDatetime[gte]'] = this.iso8601 (since);
        }
        [ request, params ] = this.handleUntilOption ('updatedAtDatetime[lte]', request, params);
        const until = this.safeInteger (request, 'updatedAtDatetime[lte]');
        if (until !== undefined) {
            request['updatedAtDatetime[lte]'] = this.iso8601 (until);
        }
        const response = await this.publicGetV1HistoryMarketsSymbolFundingRate (this.extend (request, params));
        //
        //     [
        //         {
        //             "fundingRate": "0.00125",
        //             "updatedAtDatetime": "2025-05-18T09:06:04.074Z"
        //         },
        //         {
        //             "fundingRate": "0.00125",
        //             "updatedAtDatetime": "2025-05-18T08:59:59.033Z"
        //         }, ...
        //     ]
        //
        const rates = [];
        const result = this.toArray (response);
        for (let i = 0; i < result.length; i++) {
            const entry = result[i];
            const datetime = this.safeString (entry, 'updatedAtDatetime');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': this.parse8601 (datetime),
                'datetime': datetime,
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
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
     * @param {string} params.tradingAccountId the trading account id (mandatory parameter)
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
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            request['tradingAccountId'] = tradingAccountId;
        } else {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a tradingAccountId parameter');
        }
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
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request: Dict = {
            'orderId': id,
        };
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchOrder', 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            request['tradingAccountId'] = tradingAccountId;
        } else {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires a tradingAccountId parameter');
        }
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
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bullish#createOrder
     * @description create a trade order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP_LIMIT' or 'POST_ONLY'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id
     * @param {float} [params.triggerPrice] the price at which a stop order is triggered at
     * @param {string} [params.timeInForce] the time in force for the order, either 'GTC' (Good Till Cancelled) or 'IOC' (Immediate or Cancel), default is 'GTC'
     * @param {bool} [params.allowBorrow] if true, the order will be allowed to borrow assets to fulfill the order (default is false)
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} params.traidingAccountId the trading account id (mandatory parameter)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'commandType': 'V3CreateOrder',
            'symbol': market['id'],
            'side': side.toUpperCase (),
            'quantity': this.amountToPrecision (symbol, amount),
        };
        const postOnly = this.safeBool (params, 'postOnly', false);
        if (postOnly) {
            type = 'POST_ONLY';
            params = this.omit (params, 'postOnly');
        }
        let timeInForce = 'GTC';
        [ timeInForce, params ] = this.handleOptionAndParams (params, 'createOrder', 'timeInForce', timeInForce);
        params['timeInForce'] = timeInForce.toUpperCase ();
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'createOrder', 'tradingAccountId');
        if (tradingAccountId !== undefined) {
            request['tradingAccountId'] = tradingAccountId;
        } else {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a tradingAccountId parameter');
        }
        const triggerPrice = this.safeString (params, 'triggerPrice');
        if (triggerPrice !== undefined) {
            request['stopPrice'] = this.priceToPrecision (symbol, triggerPrice);
            type = 'STOP_LIMIT';
            params = this.omit (params, 'triggerPrice');
        }
        request['type'] = type.toUpperCase ();
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
     * @param {string} [id] order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.commandType the command type, default is 'V3CancelOrder' (mandatory parameter)
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market (symbol);
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'cancelOrder', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a tradingAccountId parameter');
        }
        const request: Dict = {
            'symbol': market['id'],
            'tradingAccountId': tradingAccountId,
            'commandType': this.safeString (params, 'commandType', 'V3CancelOrder'),
            'orderId': id,
        };
        const response = await this.privatePostV2Command (this.extend (request, params));
        //
        //     {
        //         "message": "Command acknowledged - CancelOrder",
        //         "requestId": "844658480774644736",
        //         "orderId": "297735387747975680",
        //         "clientOrderId": null
        //     }
        //
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name bullish#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations
     * @param {string} [symbol] alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.traidingAccountId the trading account id (mandatory parameter)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        await this.loadMarkets ();
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'cancelAllOrders', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a tradingAccountId parameter');
        }
        const request: Dict = {
            'tradingAccountId': tradingAccountId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
            request['commandType'] = 'V1CancelAllOrdersByMarket';
        } else {
            request['commandType'] = 'V1CancelAllOrders';
        }
        const response = await this.privatePostV2Command (this.extend (request, params));
        //
        //     {
        //         "message": "Command acknowledged - CancelAllOrders",
        //         "requestId": "633900538459062272"
        //     }
        //
        return this.parseOrder (response, market);
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
        if (market === undefined) {
            market = this.safeMarket (marketId);
        }
        const symbol = this.safeSymbol (marketId, market);
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeInteger (order, 'createdAtTimestamp');
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
            'clientOrderId': this.safeString (order, 'clientOrderId'),
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

    /**
     * @method
     * @name bullish#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/transactions
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchDepositsWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        let request: Dict = {};
        [ request, params ] = this.handleUntilOption ('updatedAtDatetime[lte]', request, params);
        const until = this.safeInteger (request, 'updatedAtDatetime[lte]');
        if (until !== undefined) {
            request['updatedAtDatetime[lte]'] = this.iso8601 (until);
        }
        if (since !== undefined) {
            request['createdAtDatetime[gte]'] = this.iso8601 (since);
        }
        const response = await this.privateGetV1WalletsTransactions (this.extend (request, params));
        //
        //     [
        //         {
        //             "custodyTransactionId": "DB:9e6304a08c9cc2a33e6bc6429a088eae2a6b940c8e312aede3a3780257b9b979",
        //             "direction": "DEPOSIT",
        //             "quantity": "100000.00",
        //             "symbol": "USDC",
        //             "network": "EOS",
        //             "fee": "3.00",
        //             "memo": "925891241",
        //             "createdAtDateTime": "2022-09-16T07:56:15.000Z",
        //             "status": "COMPLETE",
        //             "transactionDetails":
        //                 {
        //                     "address": "0xb0a64d976972d87b0783eeb1ff88306cd1891f02",
        //                     "blockchainTxId": "0xec557f2c7278d2dae2d98a27b9bd43f386789a4209090cbbd11595f1bed4a4c2",
        //                     "swiftUetr": "b55aa5cd-baa2-4122-8c17-ae9b856ae36a"
        //                 }
        //         }
        //     ]
        //
        let currency = undefined;
        for (let i = 0; i < response.length; i++) {
            const transaction = response[i];
            const currencyId = this.safeString (transaction, 'symbol');
            currency = this.safeCurrencyCode (currencyId);
        }
        return this.parseTransactions (response, currency, since, limit);
    }

    /**
     * @method
     * @name bullish#withdraw
     * @description make a withdrawal
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/wallets/withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.timestamp the timestamp of the withdrawal request (mandatory)
     * @param {string} params.nonce the nonce of the withdrawal request (mandatory)
     * @param {string} params.network network for withdraw (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'command': {
                'commandType': 'V1Withdraw',
                'destinationId': address,
                'symbol': currency['id'],
                'quantity': this.currencyToPrecision (code, amount),
            },
        };
        let networkCode: Str = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode !== undefined) {
            request['network'] = this.networkCodeToId (networkCode);
        } else {
            throw new ArgumentsRequired (this.id + ' withdraw() requires a network parameter');
        }
        const response = await this.privatePostV1WalletsWithdrawal (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "data": {
        //             "orderId":888291686266343424",
        //             "clientOrderId":"123"
        //         }
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        //
        //     {
        //         "custodyTransactionId": "DB:9e6304a08c9cc2a33e6bc6429a088eae2a6b940c8e312aede3a3780257b9b979",
        //         "direction": "DEPOSIT",
        //         "quantity": "100000.00",
        //         "symbol": "USDC",
        //         "network": "EOS",
        //         "fee": "3.00",
        //         "memo": "925891241",
        //         "createdAtDateTime": "2022-09-16T07:56:15.000Z",
        //         "status": "COMPLETE",
        //         "transactionDetails":
        //             {
        //                 "address": "0xb0a64d976972d87b0783eeb1ff88306cd1891f02",
        //                 "blockchainTxId": "0xec557f2c7278d2dae2d98a27b9bd43f386789a4209090cbbd11595f1bed4a4c2",
        //                 "swiftUetr": "b55aa5cd-baa2-4122-8c17-ae9b856ae36a"
        //             }
        //     }
        //
        const id = this.safeString (transaction, 'custodyTransactionId');
        const type = this.safeString (transaction, 'direction');
        const timestamp = this.parse8601 (this.safeString (transaction, 'createdAtDateTime'));
        const network = this.safeString (transaction, 'network');
        const transactionDetails = this.safeDict (transaction, 'transactionDetails');
        const address = this.safeString (transactionDetails, 'address');
        const amount = this.safeNumber (transaction, 'quantity');
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId);
        const status = this.safeString (transaction, 'status');
        const fee = {
            'currency': undefined,
            'cost': undefined,
            'rate': undefined,
        };
        const feeCost = this.safeNumber (transaction, 'fee');
        if (feeCost !== undefined) {
            fee['cost'] = feeCost;
            fee['currency'] = currency['code'];
        }
        return {
            'id': id,
            'txid': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'addressFrom': undefined,
            'address': address,
            'addressTo': undefined,
            'amount': amount,
            'type': this.parseTransactionType (type),
            'currency': code,
            'status': this.parseTransactionStatus (status),
            'updated': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'comment': undefined,
            'internal': undefined,
            'fee': fee,
            'info': transaction,
        };
    }

    parseTransactionType (type) {
        const types: Dict = {
            'DEPOSIT': 'deposit',
            'WITHDRAW': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    parseTransactionStatus (status: Str) {
        const statuses: Dict = {
            'COMPLETE': 'ok',
            'FAILED': 'failed',
            'PENDING': 'pending',
            'CANCELLED': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name bullish#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--trading-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    async fetchAccounts (params = {}): Promise<Account[]> {
        await this.loadMarkets ();
        const response = await this.privateGetV1AccountsTradingAccounts (params);
        //
        //     [
        //         {
        //             "defaultedMarginUSD": "0.0000",
        //             "endCustomerId": "222801149768465",
        //             "fullLiquidationMarginUSD": "0.0000",
        //             "initialMarginUSD": "0.0000",
        //             "isBorrowing": "false",
        //             "isConcentrationRiskEnabled": "true",
        //             "isDefaulted": "false",
        //             "isLending": "false",
        //             "isPrimaryAccount": "true",
        //             "liquidationMarginUSD": "0.0000",
        //             "liquidityAddonUSD": "0.0000",
        //             "makerFee": "0.00000000",
        //             "marginProfile": {
        //                 "defaultedMarketRiskMultiplierPct": "50.00",
        //                 "fullLiquidationMarketRiskMultiplierPct": "75.00",
        //                 "initialMarketRiskMultiplierPct": "200.00",
        //                 "liquidationMarketRiskMultiplierPct": "100.00",
        //                 "warningMarketRiskMultiplierPct": "150.00"
        //             },
        //             "marketRiskUSD": "0.0000",
        //             "maxInitialLeverage": "1",
        //             "rateLimitToken": "7fc358f0bad4124528318ff415e24f1ad6e530321827162a5e35d8de8dcfc750",
        //             "riskLimitUSD": "0.0000",
        //             "takerFee": "0.00000002",
        //             "totalBorrowedUSD": "0.0000",
        //             "totalCollateralUSD": "0.0000",
        //             "totalLiabilitiesUSD": "0.0000",
        //             "tradeFeeRate": [
        //                 {
        //                     "feeGroupId": "1",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "2",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "3",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "4",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "5",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "6",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "7",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 },
        //                 {
        //                     "feeGroupId": "8",
        //                     "makerFee": "0.00000000",
        //                     "takerFee": "0.00000000"
        //                 }
        //             ],
        //             "tradingAccountDescription": null,
        //             "tradingAccountId": "111309424211255",
        //             "tradingAccountName": "Primary Account",
        //             "warningMarginUSD": "0.0000"
        //         }
        //     ]
        //
        return this.parseAccounts (response, params);
    }

    parseAccount (account) {
        return {
            'id': this.safeString (account, 'tradingAccountId'),
            'type': 'trading',
            'code': undefined,
            'info': account,
        };
    }

    /**
     * @method
     * @name bullish#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/deposit-instructions/crypto/-symbol-
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'symbol': currency['id'],
        };
        const response = await this.privateGetV1WalletsDepositInstructionsCryptoSymbol (this.extend (request, params));
        //
        //     [
        //         {
        //             "network": "ETH",
        //             "address": "0xc2fc755082d052bb334763b144851a0031999f33",
        //             "symbol": "ETH"
        //         }
        //     ]
        //
        const depositAddress = this.safeDict (response, 0);
        return this.parseDepositAddress (depositAddress, currency);
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined): DepositAddress {
        let parsedCurrency = undefined;
        if (currency !== undefined) {
            parsedCurrency = currency['id'];
        }
        const network = this.safeString (depositAddress, 'network');
        return {
            'info': depositAddress,
            'currency': parsedCurrency,
            'network': this.networkIdToCode (network),
            'address': this.safeString (depositAddress, 'address'),
            'tag': undefined,
        } as DepositAddress;
    }

    /**
     * @method
     * @name bullish#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset/-symbol-
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.tradingAccountId the trading account id (mandatory parameter)
     * @param {string} [params.code] unified currency code, default is undefined
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchBalance', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBalance() requires a tradingAccountId parameter');
        }
        const request: Dict = {
            'tradingAccountId': tradingAccountId,
        };
        let response = undefined;
        const code = this.safeString (params, 'code');
        if (code !== undefined) {
            request['symbol'] = this.currency (code)['id'];
            response = await this.privateGetV1AccountsAssetSymbol (this.extend (request, params));
            return this.parseBalanceForSingleCurrency (response, code);
        } else {
            response = await this.privateGetV1AccountsAsset (this.extend (request, params));
            //
            //     [
            //         {
            //             "assetId": "10",
            //             "assetSymbol": "AAVE",
            //             "availableQuantity": "10000000.00000000",
            //             "borrowedQuantity": "0.00000000",
            //             "loanedQuantity": "0.00000000",
            //             "lockedQuantity": "0.00000000",
            //             "publishedAtTimestamp": "1747942728870",
            //             "tradingAccountId": "111309424211255",
            //             "updatedAtDatetime": "2025-05-13T11:33:08.801Z",
            //             "updatedAtTimestamp": "1747135988801"
            //         }, ...
            //     ]
            //
            return this.parseBalance (response);
        }
    }

    parseBalanceForSingleCurrency (response, code: Str): Balances {
        const result: Dict = { 'info': response };
        const account = this.account ();
        account['free'] = this.safeString (response, 'availableQuantity');
        account['used'] = this.safeString (response, 'lockedQuantity');
        result[code] = account;
        return this.safeBalance (result);
    }

    parseBalance (response): Balances {
        const result: Dict = {
            'info': response,
        };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const symbol = this.safeString (balance, 'assetSymbol');
            const code = this.safeCurrencyCode (symbol);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'availableQuantity');
            account['used'] = this.safeString (balance, 'lockedQuantity');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name bullish#fetchPositions
     * @description fetch all open positions
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/derivatives-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchPositions', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositions() requires a tradingAccountId parameter');
        }
        const request: Dict = {
            'tradingAccountId': tradingAccountId,
        };
        const response = await this.privateGetV1DerivativesPositions (this.extend (request, params));
        //
        //     [
        //         {
        //         "tradingAccountId": "111000000000001",
        //         "symbol": "BTC-USDC-PERP",
        //         "side": "BUY",
        //         "quantity": "1.00000000",
        //         "notional": "1.0000",
        //         "entryNotional": "1.0000",
        //         "mtmPnl": "1.0000",
        //         "reportedMtmPnl": "1.0000",
        //         "reportedFundingPnl": "1.0000",
        //         "realizedPnl": "1.0000",
        //         "settlementAssetSymbol": "USDC",
        //         "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "createdAtTimestamp": "1621490985000",
        //         "updatedAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "updatedAtTimestamp": "1621490985000"
        //         }
        //     ]
        //
        const results = this.parsePositions (response, symbols);
        return this.filterByArrayPositions (results, 'symbol', symbols, false);
    }

    /**
     * @method
     * @name bullish#fetchPositionHistory
     * @description fetches historical positions
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/derivatives-settlement
     * @param {string} symbol unified contract symbol
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum amount of records to fetch
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @param {int} params.until the latest time in ms to fetch positions for
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositionHistory (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request: Dict = {
            'symbol': market['id'],
        };
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchPositionHistory', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPositionHistory() requires a tradingAccountId parameter');
        }
        request['tradingAccountId'] = tradingAccountId;
        if (since !== undefined) {
            request['createdAtDatetime[gte]'] = this.iso8601 (since);
        }
        [ request, params ] = this.handleUntilOption ('updatedAtDatetime[lte]', request, params);
        const until = this.safeInteger (request, 'updatedAtDatetime[lte]');
        if (until !== undefined) {
            request['updatedAtDatetime[lte]'] = this.iso8601 (until);
        }
        const response = await this.privateGetV1HistoryDerivativesSettlement (this.extend (request, params));
        //
        //     [
        //         {
        //             "tradingAccountId": "111000000000001",
        //             "symbol": "BTC-USDC-PERP",
        //             "side": "BUY",
        //             "settlementQuantity": "1.00000000",
        //             "deltaTradingQuantity": "1.00000000",
        //             "mtmPnl": "1.0000",
        //             "fundingPnl": "1.0000",
        //             "eventType": "settlementUpdate",
        //             "settlementMarkPrice": "1.0000",
        //             "settlementIndexPrice": "1.0000",
        //             "settlementFundingRate": "10.0",
        //             "settlementDatetime": "2021-05-20T01:01:01.000Z",
        //             "settlementTimestamp": "1621490985000"
        //         }
        //     ]
        //
        const positions = this.parsePositions (response);
        return this.filterBySymbolSinceLimit (positions, symbol, since, limit);
    }

    parsePosition (position: Dict, market: Market = undefined) {
        //
        //     [
        //         {
        //         "tradingAccountId": "111000000000001",
        //         "symbol": "BTC-USDC-PERP",
        //         "side": "BUY",
        //         "quantity": "1.00000000",
        //         "notional": "1.0000",
        //         "entryNotional": "1.0000",
        //         "mtmPnl": "1.0000",
        //         "reportedMtmPnl": "1.0000",
        //         "reportedFundingPnl": "1.0000",
        //         "realizedPnl": "1.0000",
        //         "settlementAssetSymbol": "USDC",
        //         "createdAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "createdAtTimestamp": "1621490985000",
        //         "updatedAtDatetime": "2021-05-20T01:01:01.000Z",
        //         "updatedAtTimestamp": "1621490985000"
        //         }
        //     ]
        //
        market = this.safeMarket (this.safeString (position, 'symbol'), market);
        const symbol = market['symbol'];
        const datetime = this.iso8601 (this.safeInteger (position, 'createdAtTimestamp'));
        const timestamp = this.safeString (position, 'createdAtTimestamp');
        const updatedTimestamp = this.safeString (position, 'updatedAtTimestamp');
        const side = this.safeString (position, 'side');
        const entryPrice = this.safeNumber (position, 'entryNotional');
        const markPrice = this.safeNumber (position, 'mtmPnl');
        const notional = this.safeNumber (position, 'notional');
        const lastPrice = this.safeNumber (position, 'reportedFundingPnl');
        const collateral = this.safeNumber (position, 'quantity');
        return this.safePosition ({
            'info': position,
            'id': this.safeString (position, 'account'),
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': datetime,
            'lastUpdateTimestamp': updatedTimestamp,
            'hedged': undefined,
            'side': side,
            'contracts': undefined,
            'contractSize': undefined,
            'entryPrice': entryPrice,
            'markPrice': markPrice,
            'lastPrice': lastPrice,
            'notional': notional,
            'leverage': undefined,
            'collateral': collateral,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': undefined,
            'marginMode': undefined,
            'marginRatio': undefined,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    /**
     * @method
     * @name bullish#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/transfer
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.until the latest time in ms to fetch transfers for (default time now)
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async fetchTransfers (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<TransferEntry[]> {
        await this.loadMarkets ();
        // todo add pagination support
        let request: Dict = {};
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['assetSymbol'] = currency['id'];
        }
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchTransfers', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransfers() requires a tradingAccountId parameter');
        }
        request['tradingAccountId'] = tradingAccountId;
        if (since !== undefined) {
            request['createdAtDatetime[gte]'] = this.iso8601 (since);
        }
        [ request, params ] = this.handleUntilOption ('updatedAtDatetime[lte]', request, params);
        const until = this.safeInteger (request, 'updatedAtDatetime[lte]');
        if (until !== undefined) {
            request['updatedAtDatetime[lte]'] = this.iso8601 (until);
        }
        const response = await this.privateGetV1HistoryTransfer (this.extend (request, params));
        //
        //     [
        //         {
        //             "requestId": "1",
        //             "toTradingAccountId": "111000000000001",
        //             "fromTradingAccountId": "121000000000001",
        //             "assetSymbol": "BTC",
        //             "quantity": "1.00000000",
        //             "status": "CLOSED",
        //             "statusReasonCode": "6002",
        //             "statusReason": "Executed",
        //             "createdAtTimestamp": "1621490985000",
        //             "createdAtDatetime": "2021-05-20T01:01:01.000Z"
        //         }
        //     ]
        //
        return this.parseTransfers (response, currency, since, limit);
    }

    /**
     * @method
     * @name bullish#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/command-commandType-V1TransferAsset
     * @param {string} code unified currency codeåå
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account ID to transfer from
     * @param {string} toAccount account ID to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer (code: string, amount: number, fromAccount: string, toAccount:string, params = {}): Promise<TransferEntry> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'command': {
                'commandType': 'V1TransferAsset',
                'assetSymbol': currency['id'],
                'quantity': this.currencyToPrecision (code, amount),
                'fromTradingAccountId': fromAccount,
                'toTradingAccountId': toAccount,
            },
        };
        const response = await this.privatePostV1CommandCommandTypeV1TransferAsset (this.extend (request, params));
        //
        //     {
        //         "message": "Command acknowledged - TransferAsset",
        //         "requestId": "633909659774222336"
        //     }
        //
        const transferOptions = this.safeDict (this.options, 'transfer', {});
        const fillResponseFromRequest = this.safeBool (transferOptions, 'fillResponseFromRequest', true);
        const transfer = this.parseTransfer (response, currency);
        if (fillResponseFromRequest) {
            transfer['fromAccount'] = fromAccount;
            transfer['toAccount'] = toAccount;
            transfer['amount'] = amount;
            transfer['currency'] = code;
        }
        return transfer;
    }

    parseTransfer (transfer, currency: Currency = undefined) {
        //
        // fetchTransfers
        //     {
        //         "requestId": "1",
        //         "toTradingAccountId": "111000000000001",
        //         "fromTradingAccountId": "121000000000001",
        //         "assetSymbol": "BTC",
        //         "quantity": "1.00000000",
        //         "status": "CLOSED",
        //         "statusReasonCode": "6002",
        //         "statusReason": "Executed",
        //         "createdAtTimestamp": "1621490985000",
        //         "createdAtDatetime": "2021-05-20T01:01:01.000Z"
        //     }
        //
        // transfer
        //     {
        //         "message": "Command acknowledged - TransferAsset",
        //         "requestId": "633909659774222336"
        //     }
        //
        const timestamp = this.safeInteger (transfer, 'createdAtTimestamp');
        const currencyId = this.safeString (transfer, 'assetSymbol');
        let status = this.safeString (transfer, 'status');
        if (status === undefined) {
            status = this.safeString (transfer, 'message');
        }
        return {
            'id': this.safeString (transfer, 'requestId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'quantity'),
            'fromAccount': this.safeString (transfer, 'fromTradingAccountId'),
            'toAccount': this.safeString (transfer, 'toTradingAccountId'),
            'status': this.parseTransferStatus (status),
            'info': transfer,
        };
    }

    parseTransferStatus (status) {
        const statuses: Dict = {
            'CLOSED': 'ok',
            'OPEN': 'pending',
            'REJECTED': 'failed',
            'Command acknowledged - TransferAsset': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    /**
     * @method
     * @name bullish#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/borrow-interest
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.until the latest time in ms to fetch entries for
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    async fetchBorrowRateHistory (code: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let request: Dict = {
            'assetSymbol': currency['id'],
        };
        let tradingAccountId: Str = undefined;
        [ tradingAccountId, params ] = this.handleOptionAndParams (params, 'fetchBorrowRateHistory', 'tradingAccountId');
        if (tradingAccountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchBorrowRateHistory() requires a tradingAccountId parameter');
        }
        request['tradingAccountId'] = tradingAccountId;
        if (since !== undefined) {
            request['createdAtDatetime[gte]'] = this.iso8601 (since);
        }
        [ request, params ] = this.handleUntilOption ('updatedAtDatetime[lte]', request, params);
        const until = this.safeInteger (request, 'updatedAtDatetime[lte]');
        if (until !== undefined) {
            request['updatedAtDatetime[lte]'] = this.iso8601 (until);
        }
        const response = await this.privateGetV1HistoryBorrowInterest (this.extend (request, params));
        //
        //     [
        //         {
        //             "assetId": "1",
        //             "assetSymbol": "BTC",
        //             "borrowedQuantity": "1.00000000",
        //             "totalBorrowedQuantity": "1.00000000",
        //             "createdAtDatetime": "2020-08-21T08:00:00.000Z",
        //             "createdAtTimestamp": "1621490985000"
        //         }
        //     ]
        //
        return this.parseBorrowRateHistory (response, code, since, limit);
    }

    parseBorrowRate (info, currency: Currency = undefined) {
        //
        //     {
        //         "assetId": "1",
        //         "assetSymbol": "BTC",
        //         "borrowedQuantity": "1.00000000",
        //         "totalBorrowedQuantity": "1.00000000",
        //         "createdAtDatetime": "2020-08-21T08:00:00.000Z",
        //         "createdAtTimestamp": "1621490985000"
        //     }
        //
        const timestamp = this.safeInteger (info, 'createdAtTimestamp');
        const currencyId = this.safeString (info, 'assetSymbol');
        return {
            'currency': this.safeCurrencyCode (currencyId, currency),
            'rate': this.safeNumber (info, 'borrowedQuantity'),
            'period': 86400000,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.microseconds ().toString ();
            const timestamp = this.milliseconds ().toString ();
            if (method === 'GET') {
                const payload = timestamp + nonce + method + '/trading-api/' + path;
                const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
                headers = {
                    'BX-TIMESTAMP': timestamp,
                    'BX-NONCE': nonce,
                    'BX-SIGNATURE': signature,
                };
            } else if (method === 'POST') {
                body = this.json (params);
                const payload = timestamp + nonce + method + '/trading-api/' + path + body;
                const digest = this.hash (this.encode (payload), sha256, 'hex');
                const signature = this.hmac (this.encode (digest), this.encode (this.secret), sha256, 'hex');
                headers = {
                    'BX-TIMESTAMP': timestamp,
                    'BX-NONCE': nonce,
                    'BX-SIGNATURE': signature,
                    'Content-Type': 'application/json',
                };
                headers['Content-Type'] = 'application/json';
                const rateLimitToken = this.safeString (request, 'rateLimitToken');
                if (rateLimitToken !== undefined) {
                    headers['BX-RATE-LIMIT-TOKEN'] = rateLimitToken;
                }
            }
            if (path === 'v1/users/hmac/login') {
                headers['BX-PUBLIC-KEY'] = this.apiKey;
            } else {
                const token = this.token;
                const tokenExpires = this.safeInteger (this.options, 'tokenExpires', 0);
                if ((token === undefined)) {
                    throw new AuthenticationError (this.id + ' requires a token, please call signIn() first');
                } else if (this.milliseconds () > tokenExpires) {
                    throw new AuthenticationError (this.id + ' token has expired, please call signIn()');
                }
                headers['Authorization'] = 'Bearer ' + token;
                // headers['BX-NONCE-WINDOW-ENABLED'] = 'false'; // default is false
            }
        }
        if (method === 'GET') {
            const query = this.customUrlencode (request);
            if (query.length) {
                url += '?' + query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name bullish#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--add-authenticated-request-header
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    async signIn (params = {}) {
        const response = await this.privateGetV1UsersHmacLogin (params);
        //
        //     {
        //         "authorizer": "113363EFA2CA00007368524E02000000",
        //         "ownerAuthorizer": "113363EFA2CA00007368524E02000000",
        //         "token": "eyJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJiMXgtYXV0aC1zZXJ2aWNlIiwic3ViIjoiNDY0OTc4MzAiLCJleHAiOjE3NDczMzgzNDMsIlNUQUdFIjoiQVVUSEVOVElDQVRFRF9XSVRIX0JMT0NLQ0hBSU4ifQ.5FSyrihzc1wsJqAY8pVX36Y4ZXg3HopLJypPEbHg5bBK8FbL_oLxkj6zM_iOYL2a1x6-ICG0pQjr8hF_k8Yg-w"
        //     }
        //
        const token = this.safeString (response, 'token');
        this.token = token;
        this.options['tokenExpires'] = this.sum (this.milliseconds (), 1000 * 60 * 60 * 24); // token expires in 24 hours
        return response;
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

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        //
        //         {
        //             "type": "HttpInvalidParameterException",
        //             "message": "HTTP_INVALID_PARAMETER: '100m' is not a valid time bucket"
        //         }
        //
        //         {
        //             "message": "Order size outside valid range",
        //             "raw": null,
        //             "errorCode": 6023,
        //             "errorCodeName": "ORDER_SIZE_OUTSIDE_VALID_RANGE"
        //         }
        //
        const code = this.safeString (response, 'errorCode');
        const type = this.safeString (response, 'type');
        if ((code !== undefined && code !== '0' && code !== '1001') || (type !== undefined && type === 'HttpInvalidParameterException')) {
            let message = '';
            const errorCodeName = this.safeString (response, 'errorCodeName');
            if (errorCodeName !== undefined) {
                message = errorCodeName;
            } else {
                message = type;
            }
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }
}
