//  ---------------------------------------------------------------------------

import {Precise } from '../ccxt.js';
import Exchange from './abstract/bullish.js';
import {} from './base/errors.js';
import {TICK_SIZE } from './base/functions/number.js';
import {Currencies, Dict, Int, Market } from './base/types.js';

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
                'cancelAllOrders': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'createDepositAddress': false,
                'createOrder': false,
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
                'fetchCurrencies': false,
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
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrderBooks': false,
                'fetchOrders': false,
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
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
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
                'ws': false,
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
                        'v1/time': 1,
                        'v1/assets': 1,
                        'v1/assets/{symbol}': 1,
                        'v1/markets': 1,
                        'v1/markets/{symbol}': 1,
                        'v1/markets/{symbol}/orderbook/hybrid': 1,
                        'v1/markets/{symbol}/trades': 1,
                        'v1/markets/{symbol}/tick': 1,
                        'v1/markets/{symbol}/candle': 1,
                        'v1/history/markets/{symbol}/trades': 1,
                        'v1/history/markets/{symbol}/funding-rate': 1,
                        'v1/index-prices': 1,
                        'v1/index-prices/{assetSymbol}': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/orders': 1,
                        'v2/orders/{orderId}': 1,
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
                        'v2/orders': 1,
                        'v2/command': 1,
                        'v2/amm-instructions': 1,
                        'v1/wallets/withdrawal': 1,
                        'v2/users/login': 1,
                        'v1/command?commandType=V1TransferAsset': 1,
                        'v1/simulate-portfolio-margin': 1,
                    },
                },
            },
            'fees': {
                'trading': {
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
        const id = this.safeString (market, 'marketId');
        const symbol = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAssetId');
        const quoteId = this.safeString (market, 'quoteAssetId');
        const base = this.safeString (market, 'baseSymbol');
        const quote = this.safeString (market, 'quoteSymbol');
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
        return this.safeMarketStructure ({
            'id': id,
            'symbol': symbol,
            'base': base,
            'baseId': baseId,
            'quote': quote,
            'quoteId': quoteId,
            'settle': undefined,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
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
            'active': undefined,
            'created': undefined,
            'info': market,
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        url += '?' + query;
        return {'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
