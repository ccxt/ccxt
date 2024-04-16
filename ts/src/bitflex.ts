
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitflex.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Market } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class bitflex
 * @augments Exchange
 */
export default class bitflex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitflex',
            'name': 'Bitflex',
            'countries': [ 'SC' ], // Seychelles
            'version': 'v1', // todo
            'rateLimit': 300, // todo: find out the real ratelimit
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': false, // todo: check
                'future': true,
                'option': true, // todo: check
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createDepositAddress': false,
                'createOrder': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchClosedOrders': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchIndexOHLCV': false,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
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
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'public': 'https://api.bitflex.com',
                    'private': 'https://api.bitflex.com',
                },
                'www': 'https://www.bitflex.com',
                'doc': 'https://docs.bitflex.com',
                'fees': 'https://help.bitflex.com/hc/en-us/articles/6316329212953-What-are-Trading-Fees-Maker-Fee-Taker-Fee-etc',
            },
            'api': {
                'public': {
                    'get': {
                        'openapi/v1/ping': 1,
                        'openapi/v1/time': 1,
                        'openapi/v1/pairs': 1,
                        'openapi/v1/brokerInfo': 1,
                        'openapi/v1/contracts': 1,
                        'openapi/contract/v1/insurance': 1,
                        'openapi/contract/v1/fundingRate': 1,
                        'openapi/quote/v1/contract/index': 1,
                        'openapi/quote/v1/depth': 1,
                        'openapi/quote/v1/depth/merged': 1,
                        'openapi/quote/v1/contract/depth': 1,
                        'openapi/quote/v1/contract/depth/merged': 1,
                        'openapi/quote/v1/trades': 1,
                        'openapi/quote/v1/contract/trades': 1,
                        'openapi/quote/v1/klines': 1,
                        'openapi/quote/v1/ticker/24hr': 1,
                        'openapi/quote/v1/contract/ticker/24hr': 1,
                        'openapi/quote/v1/ticker/price': 1,
                        'openapi/quote/v1/ticker/bookTicker': 1,
                    },
                },
                'private': {
                    'get': {
                        'openapi/order': 1,
                        'openapi/openOrders': 1,
                        'openapi/historyOrders': 1,
                        'openapi/myTrades': 1,
                        'openapi/account': 1,
                        'openapi/depositOrders': 1,
                        'openapi/withdrawalOrders': 1,
                        'openapi/withdraw/detail': 1,
                        'openapi/balance_flow': 1,
                        'openapi/quote/contract/v1/getOrder': 1,
                        'openapi/quote/contract/v1/openOrders': 1,
                        'openapi/quote/contract/v1/historyOrders': 1,
                        'openapi/quote/contract/v1/myTrades': 1,
                        'openapi/quote/contract/v1/positions': 1,
                        'openapi/quote/contract/v1/account': 1,
                    },
                    'post': {
                        'openapi/subAccount/query': 1,
                        'openapi/transfer': 1,
                        'openapi/withdraw': 1,
                        'openapi/order': 1,
                        'openapi/test': 1,
                        'openapi/contract/v1/order': 1,
                        'openapi/contract/v1/modifyMargin': 1,
                        'openapi/contract/v1/modifyLeverage': 1,
                    },
                    'delete': {
                        'openapi/order': 1,
                        'openapi/contract/v1/order/cancel': 1,
                        'openapi/contract/v1/order/batchCancel': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    // todo
                },
                'funding': {
                    // todo
                },
            },
            'exceptions': {
                'exact': {
                    // 400  {"code":-1130,"msg":"Data sent for paramter \u0027type\u0027 is not valid."}
                    // 400 {"code":-100012,"msg":"Parameter symbol [String] missing!"}
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name bitflex#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://docs.bitflex.com/spot#get-server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetOpenapiV1Time (params);
        //
        //     {
        //         "serverTime": 1713272360388
        //     }
        //
        return this.safeInteger (response, 'serverTime');
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name bitflex#fetchMarkets
         * @description retrieves data on all markets for bitflex
         * @see https://docs.bitflex.com/spot#broker-token-information
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetOpenapiV1BrokerInfo (params);
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": "1713282998181",
        //         "brokerFilters": [],
        //         "symbols": [
        //             {
        //                 "filters": [
        //                     {
        //                         "minPrice": "0.01",
        //                         "maxPrice": "100000.00000000",
        //                         "tickSize": "0.01",
        //                         "filterType": "PRICE_FILTER"
        //                     },
        //                     {
        //                         "minQty": "0.001",
        //                         "maxQty": "100000.00000000",
        //                         "stepSize": "0.0001",
        //                         "filterType": "LOT_SIZE"
        //                     },
        //                     {
        //                         "minNotional": "10",
        //                         "filterType": "MIN_NOTIONAL"
        //                     }
        //                 ],
        //                 "exchangeId": "301",
        //                 "symbol": "ETHUSDT",
        //                 "symbolName": "ETHUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "ETH",
        //                 "baseAssetName": "ETH",
        //                 "baseAssetPrecision": "0.0001",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetName": "USDT",
        //                 "quotePrecision": "0.01",
        //                 "icebergAllowed": false,
        //                 "isAggregate": false,
        //                 "allowMargin": false
        //             },
        //             ...
        //         ],
        //         "rateLimits": [
        //             {
        //                 "rateLimitType": "REQUEST_WEIGHT",
        //                 "interval": "MINUTE",
        //                 "intervalUnit": 1,
        //                 "limit": 3000
        //             },
        //             {
        //                 "rateLimitType": "ORDERS",
        //                 "interval": "SECOND",
        //                 "intervalUnit": 60,
        //                 "limit": 60
        //             }
        //         ],
        //         "options": [],
        //         "contracts": [
        //             {
        //                 "filters": [
        //                     {
        //                         "minPrice": "0.01",
        //                         "maxPrice": "100000.00000000",
        //                         "tickSize": "0.01",
        //                         "filterType": "PRICE_FILTER"
        //                     },
        //                     {
        //                         "minQty": "0.01",
        //                         "maxQty": "100000.00000000",
        //                         "stepSize": "0.01",
        //                         "filterType": "LOT_SIZE"
        //                     },
        //                     {
        //                         "minNotional": "0.000000001",
        //                         "filterType": "MIN_NOTIONAL"
        //                     }
        //                 ],
        //                 "exchangeId": "301",
        //                 "symbol": "ETH-SWAP-USDT",
        //                 "symbolName": "ETH-SWAP-USDTUSDT",
        //                 "status": "TRADING",
        //                 "baseAsset": "ETH-SWAP-USDT",
        //                 "baseAssetPrecision": "0.01",
        //                 "quoteAsset": "USDT",
        //                 "quoteAssetPrecision": "0.01",
        //                 "icebergAllowed": false,
        //                 "inverse": false,
        //                 "index": "ETHUSDT",
        //                 "marginToken": "USDT",
        //                 "marginPrecision": "0.0001",
        //                 "contractMultiplier": "1.0",
        //                 "underlying": "ETH",
        //                 "riskLimits": [
        //                     {
        //                         "riskLimitId": "200000150",
        //                         "quantity": "200.0",
        //                         "initialMargin": "0.01",
        //                         "maintMargin": "0.005"
        //                     },
        //                     {
        //                         "riskLimitId": "200000151",
        //                         "quantity": "600.0",
        //                         "initialMargin": "0.02",
        //                         "maintMargin": "0.015"
        //                     },
        //                     {
        //                         "riskLimitId": "200000152",
        //                         "quantity": "2100.0",
        //                         "initialMargin": "0.04",
        //                         "maintMargin": "0.035"
        //                     }
        //                 ]
        //             },
        //             ...
        //         ],
        //         "tokens": [
        //             {
        //                 "orgId": "9001",
        //                 "tokenId": "ETH",
        //                 "tokenName": "ETH",
        //                 "tokenFullName": "Ethereum",
        //                 "allowWithdraw": true,
        //                 "allowDeposit": true,
        //                 "chainTypes": []
        //             },
        //             {
        //                 "orgId": "9001",
        //                 "tokenId": "USDT",
        //                 "tokenName": "USDT",
        //                 "tokenFullName": "TetherUS",
        //                 "allowWithdraw": true,
        //                 "allowDeposit": true,
        //                 "chainTypes": [
        //                     {
        //                         "chainType": "ERC20",
        //                         "allowDeposit": true,
        //                         "allowWithdraw": true
        //                     },
        //                     {
        //                         "chainType": "TRC20",
        //                         "allowDeposit": true,
        //                         "allowWithdraw": true
        //                     },
        //                     {
        //                         "chainType": "BEP20",
        //                         "allowDeposit": false,
        //                         "allowWithdraw": false
        //                     },
        //                     {
        //                         "chainType": "OMNI",
        //                         "allowDeposit": false,
        //                         "allowWithdraw": false
        //                     }
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const spotMarkets = this.safeList (response, 'symbols', []);
        const parsedSpotMarkets = this.parseMarkets (spotMarkets);
        const contractMarkets = this.safeList (response, 'contracts', []); // todo check if contracts are futures
        const parsedContractMarkets = this.parseMarkets (contractMarkets);
        const optionMarkets = this.safeList (response, 'options', []); // options are not supported yet, returns empty list
        const parsedOptionMarkets = this.parseMarkets (optionMarkets);
        let result = this.arrayConcat (parsedSpotMarkets, parsedContractMarkets);
        result = this.arrayConcat (result, parsedOptionMarkets);
        return result;
    }

    parseMarket (market): Market {
        //
        //  spot markets
        //     {
        //         "filters": [
        //             {
        //                 "minPrice": "0.01",
        //                 "maxPrice": "100000.00000000",
        //                 "tickSize": "0.01",
        //                 "filterType": "PRICE_FILTER"
        //             },
        //             {
        //                 "minQty": "0.001",
        //                 "maxQty": "100000.00000000",
        //                 "stepSize": "0.0001",
        //                 "filterType": "LOT_SIZE"
        //             },
        //             {
        //                 "minNotional": "10",
        //                 "filterType": "MIN_NOTIONAL"
        //             }
        //         ],
        //         "exchangeId": "301",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "status": "TRADING",
        //         "baseAsset": "ETH",
        //         "baseAssetName": "ETH",
        //         "baseAssetPrecision": "0.0001",
        //         "quoteAsset": "USDT",
        //         "quoteAssetName": "USDT",
        //         "quotePrecision": "0.01",
        //         "icebergAllowed": false,
        //         "isAggregate": false,
        //         "allowMargin": false
        //     }
        //
        //  contract markets
        //     {
        //         "filters": [
        //             {
        //                 "minPrice": "0.01",
        //                 "maxPrice": "100000.00000000",
        //                 "tickSize": "0.01",
        //                 "filterType": "PRICE_FILTER"
        //             },
        //             {
        //                 "minQty": "0.01",
        //                 "maxQty": "100000.00000000",
        //                 "stepSize": "0.01",
        //                 "filterType": "LOT_SIZE"
        //             },
        //             {
        //                 "minNotional": "0.000000001",
        //                 "filterType": "MIN_NOTIONAL"
        //             }
        //         ],
        //         "exchangeId": "301",
        //         "symbol": "ETH-SWAP-USDT",
        //         "symbolName": "ETH-SWAP-USDTUSDT",
        //         "status": "TRADING",
        //         "baseAsset": "ETH-SWAP-USDT",
        //         "baseAssetPrecision": "0.01",
        //         "quoteAsset": "USDT",
        //         "quoteAssetPrecision": "0.01",
        //         "icebergAllowed": false,
        //         "inverse": false,
        //         "index": "ETHUSDT",
        //         "marginToken": "USDT",
        //         "marginPrecision": "0.0001",
        //         "contractMultiplier": "1.0",
        //         "underlying": "ETH",
        //         "riskLimits": [
        //             {
        //                 "riskLimitId": "200000150",
        //                 "quantity": "200.0",
        //                 "initialMargin": "0.01",
        //                 "maintMargin": "0.005"
        //             },
        //             {
        //                 "riskLimitId": "200000151",
        //                 "quantity": "600.0",
        //                 "initialMargin": "0.02",
        //                 "maintMargin": "0.015"
        //             },
        //             {
        //                 "riskLimitId": "200000152",
        //                 "quantity": "2100.0",
        //                 "initialMargin": "0.04",
        //                 "maintMargin": "0.035"
        //             }
        //         ]
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString (market, 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const settleId = this.safeString (market, 'marginToken');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let margin = false;
        if (settleId !== undefined) {
            margin = true;
        }
        const status = this.safeString (market, 'status');
        const active = (status === 'TRADING');
        const riskLimits = this.safeList (market, 'riskLimits');
        let isSpot = false;
        if (riskLimits === undefined) {
            isSpot = true;
        }
        const type = isSpot ? 'spot' : 'future';
        const isFuture = (type === 'future');
        const isInverse = this.safeBool (market, 'inverse');
        const isLinear = !isInverse;
        const contractSize = this.safeFloat (market, 'contractMultiplier');
        const limits = this.safeList (market, 'filters', []);
        const limitsIndexed = this.indexBy (limits, 'filterType');
        const amountPrecisionAndLimits = this.safeDict (limitsIndexed, 'LOT_SIZE', {});
        const pricePrecisionAndLimits = this.safeDict (limitsIndexed, 'PRICE_FILTER', {});
        const costLimits = this.safeDict (limitsIndexed, 'MIN_NOTIONAL', {});
        return this.safeMarketStructure ({
            'id': id,
            'numericId': undefined,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': margin,
            'swap': false,
            'future': isFuture,
            'option': false,
            'active': active,
            'contract': isFuture,
            'linear': isLinear,
            'inverse': isInverse,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeFloat (amountPrecisionAndLimits, 'stepSize'),
                'price': this.safeFloat (pricePrecisionAndLimits, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined, // todo
                    'max': undefined, // todo
                },
                'amount': {
                    'min': this.safeFloat (amountPrecisionAndLimits, 'minQty'),
                    'max': this.safeFloat (amountPrecisionAndLimits, 'maxQty'),
                },
                'price': {
                    'min': this.safeFloat (pricePrecisionAndLimits, 'minPrice'),
                    'max': this.safeFloat (pricePrecisionAndLimits, 'maxPrice'),
                },
                'cost': {
                    'min': this.safeFloat (costLimits, 'minNotional'),
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        const endpoint = this.implodeParams (path, params);
        url = url + '/' + endpoint;
        query = this.urlencode (query);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
