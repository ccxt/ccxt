
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitflex.js';
import { TICK_SIZE } from './base/functions/number.js';
import { ArgumentsRequired, BadSymbol, InvalidOrder, NotSupported } from './base/errors.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Precise } from './base/Precise.js';
import { Account, Balances, Currencies, Currency, Int, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Ticker, Tickers, Trade, Transaction, TransferEntry, Strings } from './base/types.js';

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
                'margin': false,
                'swap': true,
                'future': false,
                'option': true, // todo: check
                'addMargin': true,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'createDepositAddress': false,
                'createOrder': true,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': true,
                'fetchCanceledAndClosedOrders': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingRate': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverageTiers': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsForSymbol': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': true,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'transfer': true,
                'setLeverage': true,
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
                        'openapi/v1/ping': 1, // not unified
                        'openapi/v1/time': 1, // implemented
                        'openapi/v1/pairs': 1, // implemented
                        'openapi/v1/brokerInfo': 1, // implemented
                        'openapi/v1/contracts': 1,
                        'openapi/contract/v1/insurance': 1,
                        'openapi/contract/v1/fundingRate': 1,
                        'openapi/quote/v1/contract/index': 1,
                        'openapi/quote/v1/depth': 1, // implemented
                        'openapi/quote/v1/depth/merged': 1, // implemented
                        'openapi/quote/v1/contract/depth': 1, // implemented
                        'openapi/quote/v1/contract/depth/merged': 1, // implemented
                        'openapi/quote/v1/trades': 1, // implemented
                        'openapi/quote/v1/contract/trades': 1, // implemented
                        'openapi/quote/v1/klines': 1, // implemented
                        'openapi/quote/v1/ticker/24hr': 1, // implemented
                        'openapi/quote/v1/contract/ticker/24hr': 1, // implemented
                        'openapi/quote/v1/ticker/price': 1, // not unified
                        'openapi/quote/v1/ticker/bookTicker': 1, // implemented
                    },
                },
                'private': {
                    'get': {
                        'openapi/v1/order': 1, // implemented
                        'openapi/v1/openOrders': 1, // implemented
                        'openapi/v1/historyOrders': 1, // implemented
                        'openapi/v1/myTrades': 1, // implemented
                        'openapi/v1/account': 1, // implemented
                        'openapi/v1/depositOrders': 1, // implemented
                        'openapi/v1/withdrawalOrders': 1, // implemented
                        'openapi/v1/withdraw/detail': 1, // implemented
                        'openapi/v1/balance_flow': 1, // implemented
                        'openapi/contract/v1/getOrder': 1, // implemented
                        'openapi/contract/v1/openOrders': 1, // implemented
                        'openapi/contract/v1/historyOrders': 1, // implemented
                        'openapi/contract/v1/myTrades': 1, // implemented
                        'openapi/contract/v1/positions': 1, // implemented
                        'openapi/contract/v1/account': 1, // implemented
                    },
                    'post': {
                        'openapi/v1/subAccount/query': 1, // implemented
                        'openapi/v1/transfer': 1, // implemented
                        'openapi/v1/withdraw': 1, // implemented
                        'openapi/v1/order': 1, // implemented
                        'openapi/v1/test': 1, // todo check
                        'openapi/contract/v1/order': 1, // implemented
                        'openapi/contract/v1/modifyMargin': 1, // implemented
                        'openapi/contract/v1/modifyLeverage': 1, // implemented
                    },
                    'delete': {
                        'openapi/v1/order': 1, // implemented
                        'openapi/contract/v1/order/cancel': 1, // implemented
                        'openapi/contract/v1/order/batchCancel': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.00015'),
                    'taker': this.parseNumber ('0.00060'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00060') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00050') ],
                            [ this.parseNumber ('150'), this.parseNumber ('0.000450') ],
                            [ this.parseNumber ('750'), this.parseNumber ('0.000425') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.000400') ],
                            [ this.parseNumber ('9000'), this.parseNumber ('0.000350') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('0.000300') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00015') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.000120') ],
                            [ this.parseNumber ('150'), this.parseNumber ('0.000090') ],
                            [ this.parseNumber ('750'), this.parseNumber ('0.000060') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.000030') ],
                            [ this.parseNumber ('9000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('25000'), this.parseNumber ('0') ],
                        ],
                    },
                },
            },
            'exceptions': {
                'exact': {
                    // 400 {"code":-1130,"msg":"Data sent for paramter \u0027type\u0027 is not valid."}
                    // 400 {"code":-100012,"msg":"Parameter symbol [String] missing!"}
                    // 400 {"code":-100012,"msg":"Parameter interval [String] missing!"}
                    // 400 {"code":-1140,"msg":"Transaction amount lower than the minimum."}
                    // 400 {"code":-1131,"msg":"Balance insufficient "}
                    // 400 {"code":-100002,"msg":"Param limit should be int."}
                    // 400 {"code":-1156,"msg":"Order quantity invalid"} - reduceOnly order for already closed position
                    // 400 {"code":-1004,"msg":"Missing required parameter \u0027symbol\u0027"}
                    // 400 {"code":-1001,"msg":"Internal error."}
                    // 400 {"code":-1130,"msg":"Data sent for paramter \u0027leverage\u0027 is not valid."}
                    // 400 {"code":-1162,"msg":"Modify position leverage error"}
                    // 400 {"code":-1155,"msg":"Invalid position side"}
                    // 400 {"code":-1000,"msg":"An unknown error occured while processing the request."}
                    // 400 {"code":-1187,"msg":"Withdrawal address not in whitelist"}
                    // 400 {"code":-1023,"msg":"Please set IP whitelist before using API"}
                    // 400 {"code":-1022,"msg":"Signature for this request is not valid."}
                    // 400 {"code":-10009,"msg":"Invalid period!"}
                    // 400 {"code":-100002,"msg":"Param startTime should be Long."}
                    // 500 {"code":-9999,"msg":"Server Error"}
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'createMarketBuyOrderRequiresPrice': true,
                'defaultType': 'spot', // 'spot' or 'swap'
                'networks': {
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
                    'BEP20': 'BEP20',
                    'OMNI': 'OMNI',
                },
                'networksById': {
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
                    'BEP20': 'BEP20',
                    'OMNI': 'OMNI',
                },
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

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name bitflex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.bitflex.com/spot#broker-token-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetOpenapiV1BrokerInfo (params);
        //
        //     {
        //         "timezone": "UTC",
        //         "serverTime": "1713282998181",
        //         "brokerFilters": [],
        //         "symbols": [
        //             ...
        //         ],
        //         "rateLimits": [
        //             ...
        //         ],
        //         "options": [],
        //         "contracts": [
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
        //                     { "chainType": "ERC20", "allowDeposit": true, "allowWithdraw": true },
        //                     { "chainType": "TRC20", "allowDeposit": true, "allowWithdraw": true },
        //                     { "chainType": "BEP20", "allowDeposit": false, "allowWithdraw": false },
        //                     { "chainType": "OMNI", "allowDeposit": false, "allowWithdraw": false }
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const result = {};
        const tokens = this.safeList (response, 'tokens', []);
        for (let i = 0; i < tokens.length; i++) {
            const currency = tokens[i];
            const id = this.safeString (currency, 'tokenId');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'tokenFullName');
            const depositEnabled = this.safeBool (currency, 'allowDeposit');
            const withdrawEnabled = this.safeBool (currency, 'allowWithdraw');
            const currencyActive = (withdrawEnabled && depositEnabled);
            const networks = {};
            const chains = this.safeList (currency, 'chainTypes', []);
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'chainType');
                const network = this.networkIdToCode (networkId);
                const isDepositEnabled = this.safeBool (chain, 'allowDeposit');
                const isWithdrawEnabled = this.safeBool (chain, 'allowWithdraw');
                const active = (isDepositEnabled && isWithdrawEnabled);
                networks[network] = {
                    'info': chain,
                    'id': networkId,
                    'network': network,
                    'active': active,
                    'deposit': isDepositEnabled,
                    'withdraw': isWithdrawEnabled,
                    'fee': undefined,
                    'precision': undefined,
                    'limits': {
                        'withdraw': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                };
            }
            result[code] = {
                'info': currency,
                'id': id,
                'code': code,
                'name': name,
                'active': currencyActive,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
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
        //                     { "minPrice": "0.01", "maxPrice": "100000.00000000", "tickSize": "0.01", "filterType": "PRICE_FILTER" },
        //                     { "minQty": "0.001", "maxQty": "100000.00000000", "stepSize": "0.0001", "filterType": "LOT_SIZE" },
        //                     { "minNotional": "10", "filterType": "MIN_NOTIONAL" }
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
        //             { "rateLimitType": "REQUEST_WEIGHT", "interval": "MINUTE", "intervalUnit": 1, "limit": 3000 },
        //             { "rateLimitType": "ORDERS", "interval": "SECOND", "intervalUnit": 60, "limit": 60 }
        //         ],
        //         "options": [],
        //         "contracts": [
        //             {
        //                 "filters": [
        //                     { "minPrice": "0.01", "maxPrice": "100000.00000000", "tickSize": "0.01", "filterType": "PRICE_FILTER" },
        //                     { "minQty": "0.01", "maxQty": "100000.00000000", "stepSize": "0.01", "filterType": "LOT_SIZE" },
        //                     { "minNotional": "0.000000001", "filterType": "MIN_NOTIONAL" }
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
        //                     { "riskLimitId": "200000150", "quantity": "200.0", "initialMargin": "0.01", "maintMargin": "0.005" },
        //                     { "riskLimitId": "200000151", "quantity": "600.0", "initialMargin": "0.02", "maintMargin": "0.015" },
        //                     { "riskLimitId": "200000152", "quantity": "2100.0", "initialMargin": "0.04","maintMargin": "0.035" }
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
        //                     { "chainType": "ERC20", "allowDeposit": true, "allowWithdraw": true },
        //                     { "chainType": "TRC20", "allowDeposit": true, "allowWithdraw": true },
        //                     { "chainType": "BEP20", "allowDeposit": false, "allowWithdraw": false },
        //                     { "chainType": "OMNI", "allowDeposit": false, "allowWithdraw": false }
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
        // spot market
        //     {
        //         "filters": [
        //             { "minPrice": "0.01", "maxPrice": "100000.00000000", "tickSize": "0.01", "filterType": "PRICE_FILTER" },
        //             { "minQty": "0.001", "maxQty": "100000.00000000", "stepSize": "0.0001", "filterType": "LOT_SIZE" },
        //             { "minNotional": "10", "filterType": "MIN_NOTIONAL" }
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
        // swap market
        //     {
        //         "filters": [
        //             { "minPrice": "0.01", "maxPrice": "100000.00000000", "tickSize": "0.01", "filterType": "PRICE_FILTER" },
        //             { "minQty": "0.01", "maxQty": "100000.00000000", "stepSize": "0.01", "filterType": "LOT_SIZE" },
        //             { "minNotional": "0.000000001", "filterType": "MIN_NOTIONAL" }
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
        //             { "riskLimitId": "200000150", "quantity": "200.0", "initialMargin": "0.01", "maintMargin": "0.005" },
        //             { "riskLimitId": "200000151", "quantity": "600.0", "initialMargin": "0.02", "maintMargin": "0.015" },
        //             { "riskLimitId": "200000152", "quantity": "2100.0", "initialMargin": "0.04","maintMargin": "0.035" }
        //         ]
        //     }
        //
        const id = this.safeString (market, 'symbol');
        const baseId = this.safeString2 (market, 'underlying', 'baseAsset');
        const quoteId = this.safeString (market, 'quoteAsset');
        const settleId = this.safeString (market, 'marginToken');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        if (settle !== undefined) {
            symbol += ':' + settle;
        }
        const status = this.safeString (market, 'status');
        const active = (status === 'TRADING');
        const riskLimits = this.safeList (market, 'riskLimits');
        let isSpot = false;
        if (riskLimits === undefined) {
            isSpot = true;
        }
        const margin = this.safeBool (market, 'allowMargin', false);
        const type = isSpot ? 'spot' : 'swap';
        const isSwap = (type === 'swap');
        const isInverse = this.safeBool (market, 'inverse');
        let isLinear = undefined;
        if (isInverse !== undefined) {
            isLinear = !isInverse;
        }
        const contractSize = this.safeFloat (market, 'contractMultiplier');
        const limits = this.safeList (market, 'filters', []);
        const limitsIndexed = this.indexBy (limits, 'filterType');
        const amountPrecisionAndLimits = this.safeDict (limitsIndexed, 'LOT_SIZE', {});
        const pricePrecisionAndLimits = this.safeDict (limitsIndexed, 'PRICE_FILTER', {});
        const costLimits = this.safeDict (limitsIndexed, 'MIN_NOTIONAL', {});
        return this.safeMarketStructure ({
            'id': id,
            'numericId': undefined,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': margin,
            'swap': isSwap,
            'future': false,
            'option': false,
            'active': active,
            'contract': isSwap,
            'linear': isLinear,
            'inverse': isInverse,
            'contractSize': contractSize,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'maker': this.safeNumber (this.fees['trading'], 'maker'),
            'taker': this.safeNumber (this.fees['trading'], 'taker'),
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

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitflex#fetchOrderBook
         * @see https://docs.bitflex.com/spot#merged-depth-recommended
         * @see https://docs.bitflex.com/spot#depth
         * @see https://docs.bitflex.com/contract#merged-depth-recommended
         * @see https://docs.bitflex.com/contract#depth
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return, default 40, max 100
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            // this exchange recomends to use the merged depth endpoint for spot and swap markets with a limit up to 40 levels of depth
            // and we use the regular depth endpoint for limit over 40 levels of depth
            if ((limit !== undefined) && (limit > 40)) {
                response = await this.publicGetOpenapiQuoteV1Depth (this.extend (request, params));
            } else {
                response = await this.publicGetOpenapiQuoteV1DepthMerged (this.extend (request, params));
            }
            //
            //     {
            //         "time":1713306685811,
            //         "bids": [
            //             ["63756.93", "0.0234"],
            //             ["63756.45", "0.023175"],
            //             ...
            //         ],
            //         "asks": [
            //             ["63766.74", "0.022275"],
            //             ["63768.57", "0.022275"],
            //             ...
            //         ]
            //     }
            //
        } else {
            if ((limit !== undefined) && (limit > 40)) {
                response = await this.publicGetOpenapiQuoteV1ContractDepth (this.extend (request, params));
            } else {
                response = await this.publicGetOpenapiQuoteV1ContractDepthMerged (this.extend (request, params));
            }
            //
            //     {
            //         "time":1713309417854,
            //         "bids": [
            //             ["63694.28","0.047475"],
            //             ["63693.96","0.023625"],
            //             ...
            //         ],
            //         "asks": [
            //             ["63703.98","0.023175"],
            //             ["63706.07","0.0207"],
            //             ...
            //         ]
            //     }
            //
        }
        const timestamp = this.safeInteger (response, 'time');
        return this.parseOrderBook (response, symbol, timestamp);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name bitflex#fetchTrades
         * @see https://docs.bitflex.com/spot#recent-trades-list
         * @see https://docs.bitflex.com/contract#recent-trades-list
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch, default 500, max 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] *spot only* *since must be defined* the latest time in ms to fetch entries for
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetOpenapiQuoteV1Trades (this.extend (request, params));
            //
            //     [
            //         {
            //             "price":"63385.91",
            //             "time":1713343387094,
            //             "qty":"0.022238",
            //             "isBuyerMaker":true
            //         },
            //         {
            //             "price":"63385.94",
            //             "time":1713343390091,
            //             "qty":"0.009984",
            //             "isBuyerMaker":true
            //         },
            //         ...
            //     ]
            //
        } else if (market['swap']) {
            response = await this.publicGetOpenapiQuoteV1ContractTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "price":"63277.43",
            //             "time":1713343654079,
            //             "qty":"0.044525",
            //             "isBuyerMaker":false
            //         },
            //         {
            //             "price":"63277.47",
            //             "time":1713343655085,
            //             "qty":"0.019592",
            //             "isBuyerMaker":true
            //         },
            //         ...
            //     ]
            //
        }
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#fetchMyTrades
         * @see https://docs.bitflex.com/spot#trades
         * @see https://docs.bitflex.com/contract#trades
         * @description fetch all trades made by the user
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve, default 500, max 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {string} [params.type] market type, ['spot', 'swap']
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.fromId] trade Id to fetch from
         * @param {string} [params.toId] trade Id to fetch to
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        let response = undefined;
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        if (type === 'spot') {
            response = await this.privateGetOpenapiV1MyTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "id": "1668380991176069888",
            //             "symbol": "ETHUSDT",
            //             "symbolName": "ETHUSDT",
            //             "orderId": "1668380991008297728",
            //             "matchOrderId": "1668380954509508864",
            //             "price": "3060.73",
            //             "qty": "0.0081",
            //             "commission": "0.00000486",
            //             "commissionAsset": "ETH",
            //             "time": "1713622512646",
            //             "isBuyer": true,
            //             "isMaker": false,
            //             "fee":
            //                 {
            //                     "feeTokenId": "ETH",
            //                     "feeTokenName": "ETH",
            //                     "fee": "0.00000486"
            //                 },
            //             "feeTokenId": "ETH",
            //             "feeAmount": "0.00000486",
            //             "makerRebate": "0"
            //         },
            //         ...
            //     ]
            //
        } else if (type === 'swap') {
            response = await this.privateGetOpenapiContractV1MyTrades (this.extend (request, params));
            //
            //     [
            //         {
            //             "time": "1713689556972",
            //             "tradeId": "1668943399821004289",
            //             "orderId": "1668943399544181504",
            //             "matchOrderId": "1668943398437015552",
            //             "symbolId": "ETH-SWAP-USDT",
            //             "price": "3173.75",
            //             "quantity": "0.02",
            //             "feeTokenId": "USDT",
            //             "fee": "0.038",
            //             "makerRebate": "0",
            //             "orderType": "MARKET",
            //             "side": "SELL_CLOSE",
            //             "pnl": "0.307",
            //             "isMaker": false
            //         },
            //         ...
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' fetchMyTrades() does not support ' + type + ' markets, only spot and swap orders are accepted');
        }
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // fetchTrades (spot)
        //     [
        //         {
        //             "price":"63385.91",
        //             "time":1713343387094,
        //             "qty":"0.022238",
        //             "isBuyerMaker":true
        //         },
        //         {
        //             "price":"63385.94",
        //             "time":1713343390091,
        //             "qty":"0.009984",
        //             "isBuyerMaker":true
        //         },
        //         ...
        //     ]
        //
        // fetchTrades (swap)
        //     [
        //         {
        //             "price":"63277.43",
        //             "time":1713343654079,
        //             "qty":"0.044525",
        //             "isBuyerMaker":false
        //         },
        //         {
        //             "price":"63277.47",
        //             "time":1713343655085,
        //             "qty":"0.019592",
        //             "isBuyerMaker":true
        //         },
        //         ...
        //     ]
        //
        // fetchMyTrades (spot)
        //     [
        //         {
        //             "id": "1668380991176069888",
        //             "symbol": "ETHUSDT",
        //             "symbolName": "ETHUSDT",
        //             "orderId": "1668380991008297728",
        //             "matchOrderId": "1668380954509508864",
        //             "price": "3060.73",
        //             "qty": "0.0081",
        //             "commission": "0.00000486",
        //             "commissionAsset": "ETH",
        //             "time": "1713622512646",
        //             "isBuyer": true,
        //             "isMaker": false,
        //             "fee":
        //                 {
        //                     "feeTokenId": "ETH",
        //                     "feeTokenName": "ETH",
        //                     "fee": "0.00000486"
        //                 },
        //             "feeTokenId": "ETH",
        //             "feeAmount": "0.00000486",
        //             "makerRebate": "0"
        //         },
        //         ...
        //     ]
        //
        // fetchMyTrades (swap)
        //     [
        //         {
        //             "time": "1713689556972",
        //             "tradeId": "1668943399821004289",
        //             "orderId": "1668943399544181504",
        //             "matchOrderId": "1668943398437015552",
        //             "symbolId": "ETH-SWAP-USDT",
        //             "price": "3173.75",
        //             "quantity": "0.02",
        //             "feeTokenId": "USDT",
        //             "fee": "0.038",
        //             "makerRebate": "0",
        //             "orderType": "MARKET",
        //             "side": "SELL_CLOSE",
        //             "pnl": "0.307",
        //             "isMaker": false
        //         },
        //         ...
        //     ]
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const id = this.safeString2 (trade, 'id', 'tradeId');
        const orderId = this.safeString (trade, 'orderId');
        const timestamp = this.safeInteger (trade, 'time');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString2 (trade, 'qty', 'quantity');
        const isMaker = this.safeBool (trade, 'isMaker', undefined);
        const takerOrMaker = isMaker ? 'maker' : 'taker';
        const isBuyer = this.safeBool (trade, 'isBuyer');
        let side = undefined;
        if (isBuyer !== undefined) {
            side = (isBuyer) ? 'buy' : 'sell';
        } else { // swap trades have no isBuyer
            const tradeSide = this.safeString (trade, 'side');
            side = this.parseSwapTradeSide (tradeSide);
        }
        let fee = undefined;
        const feeCost = this.safeString2 (trade, 'commission', 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString2 (trade, 'commissionAsset', 'feeTokenId');
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (feeCurrencyId),
            };
        }
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side, // todo check
            'takerOrMaker': takerOrMaker, // todo check
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }

    parseSwapTradeSide (side) {
        const sides = {
            'BUY_CLOSE': 'buy',
            'BUY_OPEN': 'buy',
            'SELL_CLOSE': 'sell',
            'SELL_OPEN': 'sell',
        };
        return this.safeString (sides, side);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name bitflex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.bitflex.com/spot#kline-candlestick-data
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch, default 500, max 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        const response = await this.publicGetOpenapiQuoteV1Klines (this.extend (request, params));
        //
        //     [
        //         [
        //             1713389460000,   // Open time
        //             "61456.94",      // Open
        //             "61541.82",      // High
        //             "61456.93",      // Low
        //             "61519.98",      // Close
        //             "0.126378",      // Volume
        //             0,               // Close time
        //             "7770.35199721", // Quote asset volume
        //             9,               // Number of trades
        //             "0",             // Taker buy base asset volume
        //             "0"              // Taker buy quote asset volume
        //         ],
        //         ...
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
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
         * @name bitflex#fetchTicker
         * @see https://docs.bitflex.com/spot#24hr-ticker-price-change-statistics
         * @see https://docs.bitflex.com/contract#id-24hrs-ticker-price-change-statistics
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetOpenapiQuoteV1Ticker24hr (this.extend (request, params));
        //
        //     {
        //         "time": 1713430460947,
        //         "symbol": "BTCUSDT",
        //         "bestBidPrice": "61346.47",
        //         "bestAskPrice": "61353.53",
        //         "volume": "288.494146",
        //         "quoteVolume": "17738881.75813519",
        //         "lastPrice": "61353.94",
        //         "highPrice": "63533.64",
        //         "lowPrice": "59727.66",
        //         "openPrice": "63364.98"
        //     }
        //
        } else if (market['swap']) {
            response = await this.publicGetOpenapiQuoteV1ContractTicker24hr (this.extend (request, params));
        }
        //
        //     {
        //         "time": 1713430608992,
        //         "symbol": "BTC-SWAP-USDT",
        //         "bestBidPrice": "61328",
        //         "bestAskPrice": "61344.4",
        //         "volume": "11886.164",
        //         "quoteVolume": "728879686.9843",
        //         "openInterest": "94.348",
        //         "lastPrice": "61339.5",
        //         "highPrice": "63573.8",
        //         "lowPrice": "59672.6",
        //         "openPrice": "63359.8"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name bitflex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.bitflex.com/spot#24hr-ticker-price-change-statistics
         * @see https://docs.bitflex.com/contract#id-24hrs-ticker-price-change-statistics
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let hasSpot = true;
        let hasContract = true;
        if (symbols !== undefined) {
            hasSpot = false;
            hasContract = false;
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const market = this.market (symbol);
                if (market['spot']) {
                    hasSpot = true;
                } else if (market['swap']) {
                    hasContract = true;
                }
            }
        }
        let responseSpot = [];
        let responseContract = []; // todo check is it good to use 2 endpoints
        if (hasSpot) {
            responseSpot = await this.publicGetOpenapiQuoteV1Ticker24hr (params);
        }
        //
        //     [
        //         {
        //             "time": 1713433035363,
        //             "symbol": "TRXUSDT",
        //             "volume": "5324149.27",
        //             "quoteVolume": "586707.79503338",
        //             "lastPrice": "0.109537",
        //             "highPrice": "0.112817",
        //             "lowPrice": "0.108604",
        //             "openPrice": "0.112816"
        //         },
        //         ...
        //     ]
        //
        if (hasContract) {
            responseContract = await this.publicGetOpenapiQuoteV1ContractTicker24hr (params);
        }
        //
        //     [
        //         {
        //             "time" :1713433029225,
        //             "symbol" :"AVAX-SWAP-USDT",
        //             "volume" :"768502.5",
        //             "quoteVolume" :"25936222.33476",
        //             "openInterest" :"1983.6",
        //             "lastPrice" :"33.9029",
        //             "highPrice" :"35.167",
        //             "lowPrice" :"32.2528",
        //             "openPrice" :"35.0013"
        //         },
        //         ...
        //     ]
        //
        const response = this.arrayConcat (responseSpot, responseContract);
        return this.parseTickers (response, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        // spot (fetchTicker)
        //     {
        //         "time": 1713430460947,
        //         "symbol": "BTCUSDT",
        //         "bestBidPrice": "61346.47",
        //         "bestAskPrice": "61353.53",
        //         "volume": "288.494146",
        //         "quoteVolume": "17738881.75813519",
        //         "lastPrice": "61353.94",
        //         "highPrice": "63533.64",
        //         "lowPrice": "59727.66",
        //         "openPrice": "63364.98"
        //     }
        //
        // contract (fetchTicker)
        //     {
        //         "time": 1713430608992,
        //         "symbol": "BTC-SWAP-USDT",
        //         "bestBidPrice": "61328",
        //         "bestAskPrice": "61344.4",
        //         "volume": "11886.164",
        //         "quoteVolume": "728879686.9843",
        //         "openInterest": "94.348",
        //         "lastPrice": "61339.5",
        //         "highPrice": "63573.8",
        //         "lowPrice": "59672.6",
        //         "openPrice": "63359.8"
        //     }
        //
        // spot (fetchTickers)
        //     {
        //         "time": 1713433035363,
        //         "symbol": "TRXUSDT",
        //         "volume": "5324149.27",
        //         "quoteVolume": "586707.79503338",
        //         "lastPrice": "0.109537",
        //         "highPrice": "0.112817",
        //         "lowPrice": "0.108604",
        //         "openPrice": "0.112816"
        //     }
        //
        // contract (fetchTickers)
        //     {
        //         "time" :1713433029225,
        //         "symbol" :"AVAX-SWAP-USDT",
        //         "volume" :"768502.5",
        //         "quoteVolume" :"25936222.33476",
        //         "openInterest" :"1983.6",
        //         "lastPrice" :"33.9029",
        //         "highPrice" :"35.167",
        //         "lowPrice" :"32.2528",
        //         "openPrice" :"35.0013"
        //     },
        //
        // fetchBidsAsks
        //     {
        //         "symbol": "TRXUSDT",
        //         "bidPrice": "0.109299",
        //         "bidQty": "448.05",
        //         "askPrice": "0.109645",
        //         "askQty": "835.2",
        //         "time": 1713434723420
        //     },
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (ticker, 'time');
        const high = this.safeString (ticker, 'highPrice');
        const low = this.safeString (ticker, 'lowPrice');
        const bid = this.safeString2 (ticker, 'bestBidPrice', 'bidPrice');
        const bidVolume = this.safeString (ticker, 'bidQty');
        const ask = this.safeString2 (ticker, 'bestAskPrice', 'askPrice');
        const askVolume = this.safeString (ticker, 'askQty');
        const open = this.safeString (ticker, 'openPrice');
        const last = this.safeString (ticker, 'lastPrice');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = this.safeString (ticker, 'quoteVolume');
        const average = this.safeString2 (ticker, 'avg_price', 'index_price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchBidsAsks (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#fetchBidsAsks
         * @description fetches the bid and ask price and volume for multiple spot markets
         * @see https://docs.bitflex.com/spot#symbol-orderbook-ticker
         * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const response = await this.publicGetOpenapiQuoteV1TickerBookTicker (params); // only for spot markets, does not work for contracts
        //
        //     [
        //         {
        //             "symbol": "TRXUSDT",
        //             "bidPrice": "0.109299",
        //             "bidQty": "448.05",
        //             "askPrice": "0.109645",
        //             "askQty": "835.2",
        //             "time": 1713434723420
        //         },
        //         ...
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name bitflex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.bitflex.com/spot#account-information
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] market type, ['spot', 'swap']
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.privateGetOpenapiV1Account (params);
            //
            //     {
            //         "balances":
            //             [
            //                 {
            //                     "asset": "USDT",
            //                     "assetId": "USDT",
            //                     "assetName": "USDT",
            //                     "total": "149",
            //                     "free": "149",
            //                     "locked": "0"
            //                 }
            //             ]
            //     }
            //
        } else if (type === 'swap') {
            response = await this.privateGetOpenapiContractV1Account (params);
            //
            //     {
            //         "USDT": {
            //             "total": "49.81107894",
            //             "availableMargin": "49.81107894",
            //             "positionMargin": "0",
            //             "orderMargin": "0",
            //             "tokenId": "USDT"
            //         },
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' fetchBalance() does not support ' + type + ' markets, only spot and swap markets are accepted');
        }
        return this.customParseBalance (response, type);
    }

    customParseBalance (response, type): Balances {
        let balances = undefined;
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        if (type === 'spot') {
            balances = this.safeList (response, 'balances', []);
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const currencyId = this.safeString (balance, 'asset');
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'free');
                account['used'] = this.safeString (balance, 'locked');
                account['total'] = this.safeString (balance, 'total');
                result[code] = account;
            }
        } else if (type === 'swap') {
            const currencyIds = Object.keys (response);
            for (let i = 0; i < currencyIds.length; i++) {
                const currencyId = currencyIds[i];
                const balance = response[currencyId];
                const code = this.safeCurrencyCode (currencyId);
                const account = this.account ();
                account['free'] = this.safeString (balance, 'availableMargin');
                account['total'] = this.safeString (balance, 'total');
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async createMarketBuyOrderWithCost (symbol: string, cost: number, params = {}) {
        /**
         * @method
         * @name bitflex#createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @see https://docs.bitflex.com/spot#new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        params['createMarketBuyOrderRequiresPrice'] = false;
        return await this.createOrder (symbol, 'market', 'buy', cost, undefined, params);
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#createOrder
         * @description create a trade order
         * @see https://docs.bitflex.com/spot#new-order
         * @see https://docs.bitflex.com/contract#new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] *spot only* the cost of the order in units of the quote currency, required for market orders
         * @param {float} [params.triggerPrice] *swap only* the price to trigger a stop order
         * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO", default: "GTC"
         * @param {string} [params.clientOrderId] a unique id for the order (mandatory for swap orders)
         * @param {bool} [params.reduceOnly] *swap only* true or false whether the order is reduce-only
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.newClientOrderId] *spot only* a unique id for the order
         * @param {string} [params.orderType] *swap only* 'LIMIT' or 'STOP'
         * @param {string} [params.priceType] *swap only* 'INPUT' (Default), 'OPPONENT', 'QUEUE', 'OVER' and 'MARKET'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            return await this.createSpotOrder (market, type, side, amount, price, params);
        } else if (market['swap']) {
            return await this.createSwapOrder (market, type, side, amount, price, params);
        } else {
            throw new NotSupported (this.id + ' createOrder() does not support ' + type + ' orders, only spot and swap orders are accepted');
        }
    }

    createSpotOrderRequest (market, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#createSpotOrderRequest
         * @description create a trade order
         * @see https://docs.bitflex.com/spot#new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.cost] the cost of the order in units of the quote currency, required for market orders
         * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO", default: "GTC"
         * @param {string} [params.clientOrderId] a unique id for the order
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.newClientOrderId] *spot only* a unique id for the order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const symbol = market['symbol'];
        const orderSide = side.toUpperCase ();
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'type': type.toUpperCase (),
        };
        if ((orderSide === 'BUY') && (type === 'market')) {
            let createMarketBuyOrderRequiresPrice = true;
            [ createMarketBuyOrderRequiresPrice, params ] = this.handleOptionAndParams (params, 'createOrder', 'createMarketBuyOrderRequiresPrice', true);
            const cost = this.safeNumber (params, 'cost');
            params = this.omit (params, 'cost');
            if (cost !== undefined) {
                amount = cost;
            } else if (createMarketBuyOrderRequiresPrice) {
                if (price === undefined) {
                    throw new InvalidOrder (this.id + ' createOrder() requires the price argument for market buy orders to calculate the total cost to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option or param to false and pass the cost to spend in the amount argument');
                } else {
                    const amountString = this.numberToString (amount);
                    const priceString = this.numberToString (price);
                    const quoteAmount = Precise.stringMul (amountString, priceString);
                    amount = quoteAmount;
                }
            }
            request['quantity'] = this.costToPrecision (symbol, amount);
        } else {
            request['quantity'] = this.amountToPrecision (symbol, amount);
        }
        if ((price !== undefined) && (type !== 'market')) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString (params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['newClientOrderId'] = clientOrderId;
            params = this.omit (params, 'clientOrderId');
        }
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (type === 'market', type === 'LIMIT_MAKER', params);
        if (postOnly) {
            request['type'] = 'LIMIT_MAKER';
        }
        return this.extend (request, params);
    }

    async createSpotOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.createSpotOrderRequest (market, type, side, amount, price, params);
        const response = await this.privatePostOpenapiV1Order (request);
        //
        //     {
        //         "accountId": "1662502620223296001",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "FIRST_ORDER",
        //         "orderId": "1667566351835747072",
        //         "transactTime": "1713525400082",
        //         "price": "0",
        //         "origQty": "10",
        //         "executedQty": "0",
        //         "status": "FILLED",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "BUY"
        //     }
        //
        return this.parseOrder (response, market);
    }

    createSwapOrderRequest (market, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#createOrder
         * @description create a trade order
         * @see https://docs.bitflex.com/spot#new-order
         * @see https://docs.bitflex.com/contract#new-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] the price to trigger a stop order
         * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
         * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO", default: "GTC"
         * @param {string} params.clientOrderId a unique id for the order (mandatory for swap orders)
         * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.orderType] 'LIMIT' or 'STOP'
         * @param {string} [params.priceType] 'INPUT' (Default), 'OPPONENT', 'QUEUE', 'OVER' and 'MARKET'
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'newClientOrderId');
        if (clientOrderId === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a params.clientOrderId parameter'); // the exchange requires a unique clientOrderId for each order
        }
        params = this.omit (params, [ 'clientOrderId', 'newClientOrderId' ]);
        const symbol = market['symbol'];
        const request = {
            'symbol': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'clientOrderId': clientOrderId,
        };
        const reduceOnly = this.safeBool (params, 'reduceOnly', false);
        let suffix = '_OPEN';
        if (reduceOnly) {
            suffix = '_CLOSE';
        }
        params = this.omit (params, 'reduceOnly');
        const orderSide = side.toUpperCase () + suffix;
        request['side'] = orderSide;
        const priceType = this.safeString (params, 'priceType');
        if ((type === 'limit') && ((priceType === undefined) || (priceType === 'INPUT'))) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        if ((type === 'market') && (priceType === undefined)) {
            request['priceType'] = 'MARKET';
        }
        let postOnly = undefined;
        const timeInForce = this.safeString (params, 'timeInForce');
        [ postOnly, params ] = this.handlePostOnly (type === 'market', timeInForce === 'LIMIT_MAKER', params);
        if (postOnly) {
            request['timeInForce'] = 'LIMIT_MAKER';
        }
        const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        if (triggerPrice !== undefined) {
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
            params = this.omit (params, [ 'triggerPrice', 'stopPrice' ]);
            request['orderType'] = 'STOP';
        } else {
            request['orderType'] = 'LIMIT';
        }
        return this.extend (request, params);
    }

    async createSwapOrder (market, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = this.createSwapOrderRequest (market, type, side, amount, price, params);
        const response = await this.privatePostOpenapiContractV1Order (request);
        //
        //     {
        //         "time": "1713688829967",
        //         "updateTime": "1713688829967",
        //         "orderId": "1668937301034598656",
        //         "clientOrderId": "yzh-test1-reduce",
        //         "symbol": "ETH-SWAP-USDT",
        //         "price": "0",
        //         "leverage": "0",
        //         "origQty": "0.01",
        //         "executedQty": "0",
        //         "executeQty": "0",
        //         "avgPrice": "0",
        //         "marginLocked": "0",
        //         "orderType": "MARKET",
        //         "side": "SELL_CLOSE",
        //         "fees": [],
        //         "timeInForce": "IOC",
        //         "status": "FILLED",
        //         "priceType": "MARKET"
        //     }
        //
        return this.parseOrder (response, market);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // spot: createOrder
        //
        //     {
        //         "accountId": "1662502620223296001",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "FIRST_ORDER",
        //         "orderId": "1667566351835747072",
        //         "transactTime": "1713525400082",
        //         "price": "0",
        //         "origQty": "10",
        //         "executedQty": "0",
        //         "status": "FILLED",
        //         "timeInForce": "GTC",
        //         "type": "MARKET",
        //         "side": "BUY"
        //     }
        //
        // swap: createOrder
        //
        //
        //     {
        //         "time": "1713648762414",
        //         "updateTime": "1713648762414",
        //         "orderId": "1668601190047372800",
        //         "clientOrderId": "sddafadfasffffff",
        //         "symbol": "ETH-SWAP-USDT",
        //         "price": "1000",
        //         "leverage": "0",
        //         "origQty": "0.1",
        //         "executedQty": "0",
        //         "executeQty": "0",
        //         "avgPrice": "0",
        //         "marginLocked": "10",
        //         "orderType": "LIMIT",
        //         "side": "BUY_OPEN",
        //         "fees": [],
        //         "timeInForce": "GTC",
        //         "status": "NEW",
        //         "priceType": "INPUT"
        //     }
        //
        // spot: fetchOrder
        //
        //     {
        //         "accountId": "1662502620223296001",
        //         "exchangeId": "301",
        //         "symbol": "ETHUSDT",
        //         "symbolName": "ETHUSDT",
        //         "clientOrderId": "1713528894473521",
        //         "orderId": "1667595665113501696",
        //         "price": "2000",
        //         "origQty": "0.01",
        //         "executedQty": "0",
        //         "cummulativeQuoteQty": "0",
        //         "avgPrice": "0",
        //         "status": "NEW",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT_MAKER",
        //         "side": "BUY",
        //         "stopPrice": "0.0",
        //         "icebergQty": "0.0",
        //         "time": "1713528894498",
        //         "updateTime": "1713528894508",
        //         "isWorking": true
        //     }
        //
        // swap: fetchOrder
        //
        //     {
        //         "time": "1713644180835",
        //         "updateTime": "1713644180876",
        //         "orderId": "1668562756977053184",
        //         "clientOrderId": "123ss443335",
        //         "symbol": "ETH-SWAP-USDT",
        //         "price": "0",
        //         "leverage": "0",
        //         "origQty": "0.1",
        //         "executedQty": "0.1",
        //         "executeQty": "0.1",
        //         "avgPrice": "3162.28",
        //         "marginLocked": "0",
        //         "orderType": "MARKET",
        //         "side": "BUY_CLOSE",
        //         "fees": [],
        //         "timeInForce": "IOC",
        //         "status": "FILLED",
        //         "priceType": "MARKET"
        //     }
        //
        // spot: fetchCanceledAndCloseOrders
        //
        //     [
        //         {
        //             "accountId": "1662502620223296001",
        //             "exchangeId": "301",
        //             "symbol": "ETHUSDT",
        //             "symbolName": "ETHUSDT",
        //             "clientOrderId": "1713531483905247",
        //             "orderId": "1667617386700800256",
        //             "price": "0",
        //             "origQty": "0.001",
        //             "executedQty": "0.001",
        //             "cummulativeQuoteQty": "3.09928",
        //             "avgPrice": "3099.28",
        //             "status": "FILLED",
        //             "timeInForce": "GTC",
        //             "type": "MARKET",
        //             "side": "SELL",
        //             "stopPrice": "0.0",
        //             "icebergQty": "0.0",
        //             "time": "1713531483914",
        //             "updateTime": "1713531483961",
        //             "isWorking": true
        //         },
        //         ...
        //     ]
        //
        // swap: fetchCanceledAndCloseOrders
        //
        //
        //     [
        //         {
        //             "time": "1713644180835",
        //             "updateTime": "1713644180876",
        //             "orderId": "1668562756977053184",
        //             "clientOrderId": "123ss443335",
        //             "symbol": "ETH-SWAP-USDT",
        //             "price": "0",
        //             "leverage": "0",
        //             "origQty": "0.1",
        //             "executedQty": "0.1",
        //             "executeQty": "0.1",
        //             "avgPrice": "3162.28",
        //             "marginLocked": "0",
        //             "orderType": "MARKET",
        //             "side": "BUY_CLOSE",
        //             "fees": [],
        //             "timeInForce": "IOC",
        //             "status": "FILLED",
        //             "priceType": "MARKET"
        //         },
        //         ...
        //     ]
        //
        // spot: cancelOrder
        //
        //     {
        //         "accountId": "1662502620223296001",
        //         "symbol": "ETHUSDT",
        //         "clientOrderId": "1713528894473521",
        //         "orderId": "1667595665113501696",
        //         "transactTime": "1713528894498",
        //         "price": "2000",
        //         "origQty": "0.01",
        //         "executedQty": "0",
        //         "status": "CANCELED",
        //         "timeInForce": "GTC",
        //         "type": "LIMIT_MAKER",
        //         "side": "BUY"
        //     }
        //
        // swap: cancelOrder
        //
        //     {
        //         "time": "1713648762414",
        //         "updateTime": "1713649270107",
        //         "orderId": "1668601190047372800",
        //         "clientOrderId": "sddafadfasffffff",
        //         "symbol": "ETH-SWAP-USDT",
        //         "price": "1000",
        //         "leverage": "0",
        //         "origQty": "0.1",
        //         "executedQty": "0",
        //         "executeQty": "0",
        //         "avgPrice": "0",
        //         "marginLocked": "0",
        //         "orderType": "LIMIT",
        //         "side": "BUY_OPEN",
        //         "fees": [],
        //         "timeInForce": "GTC",
        //         "status": "CANCELED",
        //         "priceType": "INPUT"
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const timestamp = this.safeString (order, 'transactTime');
        const status = this.safeString (order, 'status');
        const marketId = this.safeString (order, 'symbol');
        const orderType = this.safeString2 (order, 'type', 'orderType');
        let type = this.parseOrderType (orderType);
        const orderTimeInForce = this.safeString (order, 'timeInForce');
        let timeInForce = this.parseOrderTimeInForce (orderTimeInForce);
        if (orderType === 'LIMIT_MAKER') {
            timeInForce = 'PO';
        }
        const orderSide = this.safeString (order, 'side');
        const side = this.parseOrderSide (orderSide);
        const reduceOnly = this.parseReduceOnly (orderSide);
        const price = this.omitZero (this.safeString (order, 'price'));
        const triggerPrice = this.safeString (order, 'triggerPrice'); // todo check for swap
        const average = this.safeString (order, 'avgPrice');
        const filled = this.safeString (order, 'executedQty'); // todo check
        market = this.safeMarket (marketId, market);
        let amount = this.safeString (order, 'origQty');
        let cost = undefined;
        if (market['spot']) {
            if ((type === 'market') && (side === 'buy')) {
                cost = this.safeString (order, 'origQty');
                amount = undefined;
            }
        }
        if (market['contract']) {
            const priceType = this.safeString (order, 'priceType');
            const isMarketOrder = (priceType === 'MARKET') || (priceType === 'OPPONENT') || (priceType === 'QUEUE') || (priceType === 'OVER'); // todo check orders with 'OVER'
            type = isMarketOrder ? 'market' : type;
        }
        const lastUpdateTimestamp = this.safeString (order, 'updateTime');
        const remaining = this.safeString (order, 'executeQty'); // todo check
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'lastTradeTimestamp': undefined, // TODO: this might be 'updateTime' if order-status is filled, otherwise cancellation time. needs to be checked
            'status': this.parseOrderStatus (status),
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': timeInForce,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'average': average,
            'amount': amount,
            'cost': cost,
            'filled': filled,
            'remaining': remaining,
            'reduceOnly': reduceOnly,
            'fee': undefined, // todo check for different types of orders
            'trades': undefined,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'NEW': 'open',
            'ORDER_NEW': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'PARTIALLY_FILLED': 'open',
            'REJECTED': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            'MARKET': 'market',
            'LIMIT': 'limit',
            'LIMIT_MAKER': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderTimeInForce (status) {
        const statuses = {
            'GTC': 'GTC',
            'FOK': 'FOK',
            'IOC': 'IOC',
            'LIMIT_MAKER': 'PO',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderSide (status) {
        const statuses = {
            'BUY': 'buy',
            'BUY_OPEN': 'buy',
            'BUY_CLOSE': 'buy',
            'SELL': 'sell',
            'SELL_OPEN': 'sell',
            'SELL_CLOSE': 'sell',
        };
        return this.safeString (statuses, status, status);
    }

    parseReduceOnly (orderSide) {
        const parts = orderSide.split ('_');
        if (parts.length > 1) {
            if (parts[1] === 'OPEN') {
                return false;
            }
            if (parts[1] === 'CLOSE') {
                return true;
            }
            return undefined;
        }
        return undefined;
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) { // todo fetchOrder for swap
        /**
         * @method
         * @name bitflex#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://docs.bitflex.com/spot#query-order
         * @see https://docs.bitflex.com/contract#query-order
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.clientOrderId] a unique ID of the order (user defined)
         * @param {string} [params.orderType] The order type, possible types: 'LIMIT', 'STOP' (for contract orders only)
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {
            'orderId': id,
        };
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOrder', market, params, 'spot');
        let response = undefined;
        if (type === 'spot') {
            response = await this.privateGetOpenapiV1Order (this.extend (request, params));
            //
            //     {
            //         "accountId": "1662502620223296001",
            //         "exchangeId": "301",
            //         "symbol": "ETHUSDT",
            //         "symbolName": "ETHUSDT",
            //         "clientOrderId": "1713528894473521",
            //         "orderId": "1667595665113501696",
            //         "price": "2000",
            //         "origQty": "0.01",
            //         "executedQty": "0",
            //         "cummulativeQuoteQty": "0",
            //         "avgPrice": "0",
            //         "status": "NEW",
            //         "timeInForce": "GTC",
            //         "type": "LIMIT_MAKER",
            //         "side": "BUY",
            //         "stopPrice": "0.0",
            //         "icebergQty": "0.0",
            //         "time": "1713528894498",
            //         "updateTime": "1713528894508",
            //         "isWorking": true
            //     }
            //
        } else if (type === 'swap') {
            response = await this.privateGetOpenapiContractV1GetOrder (this.extend (request, params));
            //
            //     {
            //         "time": "1713644180835",
            //         "updateTime": "1713644180876",
            //         "orderId": "1668562756977053184",
            //         "clientOrderId": "123ss443335",
            //         "symbol": "ETH-SWAP-USDT",
            //         "price": "0",
            //         "leverage": "0",
            //         "origQty": "0.1",
            //         "executedQty": "0.1",
            //         "executeQty": "0.1",
            //         "avgPrice": "3162.28",
            //         "marginLocked": "0",
            //         "orderType": "MARKET",
            //         "side": "BUY_CLOSE",
            //         "fees": [],
            //         "timeInForce": "IOC",
            //         "status": "FILLED",
            //         "priceType": "MARKET"
            //     }
            //
        }
        return this.parseOrder (response, market);
    }

    async fetchCanceledAndClosedOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) { // todo fetchOrders for swap
        /**
         * @method
         * @name bitflex#fetchCanceledAndClosedOrders
         * @description fetches information on multiple canceled and closed orders made by the user
         * @see https://docs.bitflex.com/spot#all-orders
         * @see https://docs.bitflex.com/contract#all-orders
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {int} [since] timestamp in ms of the earliest order to fetch
         * @param {int} [limit] the maximum amount of orders to fetch, default 500, max 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.orderId] if orderId is set, it will get orders < that orderId. Otherwise most recent orders are returned.
         * @param {string} [params.orderType] order type, ['LIMIT', 'STOP'] for contract orders only
         * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchCanceledAndClosedOrders', market, params, 'spot');
        let response = undefined;
        if (type === 'spot') {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            const until = this.safeInteger (params, 'until');
            if (until !== undefined) {
                params = this.omit (params, 'until');
                request['endTime'] = until;
            }
            response = await this.privateGetOpenapiV1HistoryOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "accountId": "1662502620223296001",
            //             "exchangeId": "301",
            //             "symbol": "ETHUSDT",
            //             "symbolName": "ETHUSDT",
            //             "clientOrderId": "1713531483905247",
            //             "orderId": "1667617386700800256",
            //             "price": "0",
            //             "origQty": "0.001",
            //             "executedQty": "0.001",
            //             "cummulativeQuoteQty": "3.09928",
            //             "avgPrice": "3099.28",
            //             "status": "FILLED",
            //             "timeInForce": "GTC",
            //             "type": "MARKET",
            //             "side": "SELL",
            //             "stopPrice": "0.0",
            //             "icebergQty": "0.0",
            //             "time": "1713531483914",
            //             "updateTime": "1713531483961",
            //             "isWorking": true
            //         },
            //         ...
            //     ]
            //
        } else if (type === 'swap') {
            if (market !== undefined) {
                request['symbol'] = market['id'];
            }
            response = await this.privateGetOpenapiContractV1HistoryOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "time": "1713644180835",
            //             "updateTime": "1713644180876",
            //             "orderId": "1668562756977053184",
            //             "clientOrderId": "123ss443335",
            //             "symbol": "ETH-SWAP-USDT",
            //             "price": "0",
            //             "leverage": "0",
            //             "origQty": "0.1",
            //             "executedQty": "0.1",
            //             "executeQty": "0.1",
            //             "avgPrice": "3162.28",
            //             "marginLocked": "0",
            //             "orderType": "MARKET",
            //             "side": "BUY_CLOSE",
            //             "fees": [],
            //             "timeInForce": "IOC",
            //             "status": "FILLED",
            //             "priceType": "MARKET"
            //         },
            //         ...
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' fetchCanceledAndClosedOrders() does not support ' + type + ' orders, only spot and swap orders are accepted');
        }
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> { // todo fetchOrders for swap
        /**
         * @method
         * @name bitflex#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.bitflex.com/spot#current-open-orders
         * @see https://docs.bitflex.com/contract#current-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] market type, ['spot', 'swap']
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.orderId] if orderId is set, it will get orders < that orderId. Otherwise most recent orders are returned.
         * @param {string} [params.orderType] order type, ['LIMIT', 'STOP'] for contract orders only
         * @param {string} [params.priceType] price type, ['INPUT', 'OPPONENT', 'QUEUE', 'OVER', 'MARKET']
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchOpenOrders', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.privateGetOpenapiV1OpenOrders (this.extend (request, params));
            //
            //     [
            //         {
            //             "accountId": "1662502620223296001",
            //             "exchangeId": "301",
            //             "symbol": "ETHUSDT",
            //             "symbolName": "ETHUSDT",
            //             "clientOrderId": "1713608796954308",
            //             "orderId": "1668265935553757440",
            //             "price": "2500",
            //             "origQty": "0.01",
            //             "executedQty": "0",
            //             "cummulativeQuoteQty": "0",
            //             "avgPrice": "0",
            //             "status": "NEW",
            //             "timeInForce": "GTC",
            //             "type": "LIMIT",
            //             "side": "BUY",
            //             "stopPrice": "0.0",
            //             "icebergQty": "0.0",
            //             "time": "1713608796960",
            //             "updateTime": "1713608796971",
            //             "isWorking": true
            //         },
            //         ...
            //     ]
            //
        } else if (type === 'swap') {
            response = await this.privateGetOpenapiContractV1OpenOrders (this.extend (request, params));
            //
            //     ]
            //         {
            //             "time": "1713647854927",
            //             "updateTime": "1713647854940",
            //             "orderId": "1668593577494664704",
            //             "clientOrderId": "sddafadfasdfasdfasdfasdf",
            //             "symbol": "ETH-SWAP-USDT",
            //             "price": "1000",
            //             "leverage": "0",
            //             "origQty": "0.1",
            //             "executedQty": "0",
            //             "executeQty": "0",
            //             "avgPrice": "0",
            //             "marginLocked": "10",
            //             "orderType": "LIMIT",
            //             "side": "BUY_OPEN",
            //             "fees": [],
            //             "timeInForce": "GTC",
            //             "status": "NEW",
            //             "priceType": "INPUT"
            //         },
            //         ...
            //     ]
            //
        } else {
            throw new NotSupported (this.id + ' fetchOpenOrders() does not support ' + type + ' orders, only spot and swap orders are accepted');
        }
        return this.parseOrders (response, market, since, limit);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) { // todo cancelOrder for swap
        /**
         * @method
         * @name bitflex#cancelOrder
         * @description cancels an open order
         * @see https://docs.bitflex.com/spot#cancel-order
         * @see https://docs.bitflex.com/contract#cancel-order
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.clientOrderId] either orderId or clientOrderId must be sent
         * @param {string} [params.orderType] order type, ['LIMIT', 'STOP'] for contract orders only
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        let response = undefined;
        if (type === 'spot') {
            response = await this.privateDeleteOpenapiV1Order (this.extend (request, params));
            //
            //     {
            //         "accountId": "1662502620223296001",
            //         "symbol": "ETHUSDT",
            //         "clientOrderId": "1713528894473521",
            //         "orderId": "1667595665113501696",
            //         "transactTime": "1713528894498",
            //         "price": "2000",
            //         "origQty": "0.01",
            //         "executedQty": "0",
            //         "status": "CANCELED",
            //         "timeInForce": "GTC",
            //         "type": "LIMIT_MAKER",
            //         "side": "BUY"
            //     }
            //
        } else if (type === 'swap') {
            response = await this.privateDeleteOpenapiContractV1OrderCancel (this.extend (request, params));
            //
            //     {
            //         "time": "1713648762414",
            //         "updateTime": "1713649270107",
            //         "orderId": "1668601190047372800",
            //         "clientOrderId": "sddafadfasffffff",
            //         "symbol": "ETH-SWAP-USDT",
            //         "price": "1000",
            //         "leverage": "0",
            //         "origQty": "0.1",
            //         "executedQty": "0",
            //         "executeQty": "0",
            //         "avgPrice": "0",
            //         "marginLocked": "0",
            //         "orderType": "LIMIT",
            //         "side": "BUY_OPEN",
            //         "fees": [],
            //         "timeInForce": "GTC",
            //         "status": "CANCELED",
            //         "priceType": "INPUT"
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' cancelOrder() does not support ' + type + ' orders, only spot and swap orders are accepted');
        }
        return this.parseOrder (response, market);
    }

    async fetchAccounts (params = {}): Promise<Account[]> {
        /**
         * @method
         * @name bitflex#fetchAccounts
         * @description fetch all the accounts associated with a profile
         * @see https://docs.bitflex.com/spot#get-sub-account-list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        await this.loadMarkets ();
        const response = await this.privatePostOpenapiV1SubAccountQuery (params);
        //
        //     [
        //         {
        //             "accountId": "1662502620223296001",
        //             "accountName": "",
        //             "accountType": 1,
        //             "accountIndex": 0
        //         },
        //         {
        //             "accountId": "1662502620223296003",
        //             "accountName": "",
        //             "accountType": 3,
        //             "accountIndex": 0
        //         }
        //     ]
        //
        return this.parseAccounts (response, params);
    }

    parseAccount (account) {
        //
        //     {
        //         "accountId": "1662502620223296001",
        //         "accountName": "",
        //         "accountType": 1,
        //         "accountIndex": 0
        //     },
        //
        const accountType = this.safeString (account, 'accountType'); // todo check
        return {
            'id': this.safeString (account, 'accountId'),
            'name': this.safeString (account, 'accountName'),
            'type': this.parseAccountType (accountType),
            'code': undefined,
            'info': account,
        };
    }

    parseAccountType (type) {
        const types = {
            '1': 'spot',
            '2': 'option',
            '3': 'swap',
        };
        return this.safeString (types, type, type);
    }

    encodeAccountType (type) {
        const types = {
            'spot': '1',
            'option': '2',
            'swap': '3',
        };
        return this.safeString (types, type, type);
    }

    parseAccountIndex (index) {
        const indexes = {
            '0': 'main',
            '1': 'subaccount',
        };
        return this.safeString (indexes, index, index);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitflex#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.bitflex.com/spot#account-deposit-information
         * @param {string} not used by bitflex.fetchDeposits
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve, default 500; Max 1000
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.fromId] if fromId is set, it will get orders > that fromId. Otherwise most recent orders are returned
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['token'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOpenapiV1DepositOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "time": "1713190541009",
        //             "orderId": "1664757265972920576",
        //             "token": "USDT",
        //             "tokenName": "USDT",
        //             "address": "TA3YLQsTvtbXAFoMYoHpSDiVe478VAodew",
        //             "addressTag": "",
        //             "fromAddress": "TEPSrSYPDSQ7yXpMFPq91Fb1QEWpMkRGfn",
        //             "fromAddressTag": "",
        //             "quantity": "149",
        //             "status": 2,
        //             "statusCode": "DEPOSIT_CAN_WITHDRAW",
        //             "requiredConfirmNum": 20,
        //             "confirmNum": 20,
        //             "txid": "fc8e6332a50ae0115ea9f3f551666bfaa06e38dbf1edfeb9e17b59645b27c637",
        //             "txidUrl": "https://tronscan.org/#/transaction/fc8e6332a50ae0115ea9f3f551666bfaa06e38dbf1edfeb9e17b59645b27c637"
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitflex#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://docs.bitflex.com/spot#account-withdrawal-information
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.fromId] query from this OrderId. Defaults to latest records
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency (code);
            request['tokenId'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOpenapiV1WithdrawalOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "time":"1536232111669",
        //             "orderId":"90161227158286336",
        //             "accountId":"517256161325920",
        //             "tokenId":"BHC",
        //             "tokenName":"BHC",
        //             "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //             "addressExt":"address tag",
        //             "quantity":"14", // Withdrawal qty
        //             "arriveQuantity":"14", // Arrived qty
        //             "statusCode":"PROCESSING_STATUS",
        //             "status":3,
        //             "txid":"",
        //             "txidUrl":"",
        //             "walletHandleTime":"1536232111669",
        //             "feeTokenId":"BHC",
        //             "feeTokenName":"BHC",
        //             "fee":"0.1",
        //             "requiredConfirmNum":0, // Required confirmations
        //             "confirmNum":0, // Confirmations
        //             "kernelId":"", // BEAM and GRIN only
        //             "isInternalTransfer": false // True if this transfer is internal
        //         },
        //         {
        //             "time":"1536053746220",
        //             "orderId":"762522731831527",
        //             "accountId":"517256161325920",
        //             "tokenId":"BHC",
        //             "tokenName":"BHC",
        //             "address":"fdfasdfeqfas12323542rgfer54135123",
        //             "addressExt":"EOS tag",
        //             "quantity":"", //Withdrawal qty
        //             "arriveQuantity":"10", // Arrived qty
        //             "statusCode":"BROKER_AUDITING_STATUS",
        //             "status":"2",
        //             "txid":"",
        //             "txidUrl":"",
        //             "walletHandleTime":"1536232111669",
        //             "feeTokenId":"BHC",
        //             "feeTokenName":"BHC",
        //             "fee":"0.1",
        //             "requiredConfirmNum":0, // Required confirmations
        //             "confirmNum":0, // Confirmations
        //             "kernelId":"", // BEAM and GRIN only
        //             "isInternalTransfer": false // True if this transfer is internal
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    async fetchWithdrawal (id: string, code: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#fetchWithdrawal
         * @description fetch data on a currency withdrawal via the withdrawal id
         * @see https://docs.bitflex.com/spot#withdrawal-detail
         * @param {string} id withdrawal id
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.clientOrderId] either orderId or clientOrderId must be sent
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['tokenId'] = currency['id'];
        }
        const response = await this.privateGetOpenapiV1WithdrawDetail (this.extend (request, params));
        //
        //     {
        //         "time":"1536232111669",
        //         "orderId":"90161227158286336",
        //         "accountId":"517256161325920",
        //         "tokenId":"BHC",
        //         "tokenName":"BHC",
        //         "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //         "addressExt":"address tag",
        //         "quantity":"14", // Withdrawal qty
        //         "arriveQuantity":"14", // Arrived qty
        //         "statusCode":"PROCESSING_STATUS",
        //         "status":3,
        //         "txid":"",
        //         "txidUrl":"",
        //         "walletHandleTime":"1536232111669",
        //         "feeTokenId":"BHC",
        //         "feeTokenName":"BHC",
        //         "fee":"0.1",
        //         "requiredConfirmNum":0, // Required confirmations
        //         "confirmNum":0, // Confirmations
        //         "kernelId":"", // BEAM and GRIN only
        //         "isInternalTransfer": false // True if this transfer is internal
        //         }
        //
        return this.parseTransaction (response);
    }

    parseWithdrawTransactionStatus (status) {
        const statuses = {
            '1': 'pending', // Processing by broker
            '2': 'canceled', // Rejected by broker
            '3': 'pending', // Processing by platform
            '4': 'canceled', // Reject by platfor
            '5': 'pending', // Processing by wallet
            '6': 'ok', // Withdrawal success
            '7': 'failed', // Withdrawal failed
            '8': 'pending', // Blockchain mining
        };
        return this.safeString (statuses, status, status);
    }

    parseDepositTransactionStatus (status) { // todo check
        const statuses = {
            '1': 'failed', // failed
            '2': 'ok', // deposit can withdraw
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //     [
        //         {
        //             "time": "1713190541009",
        //             "orderId": "1664757265972920576",
        //             "token": "USDT",
        //             "tokenName": "USDT",
        //             "address": "TA3YLQsTvtbXAFoMYoHpSDiVe478VAodew",
        //             "addressTag": "",
        //             "fromAddress": "TEPSrSYPDSQ7yXpMFPq91Fb1QEWpMkRGfn",
        //             "fromAddressTag": "",
        //             "quantity": "149",
        //             "status": 2,
        //             "statusCode": "DEPOSIT_CAN_WITHDRAW",
        //             "requiredConfirmNum": 20,
        //             "confirmNum": 20,
        //             "txid": "fc8e6332a50ae0115ea9f3f551666bfaa06e38dbf1edfeb9e17b59645b27c637",
        //             "txidUrl": "https://tronscan.org/#/transaction/fc8e6332a50ae0115ea9f3f551666bfaa06e38dbf1edfeb9e17b59645b27c637"
        //         }
        //     ]
        //
        // fetchWithdrawals
        //
        //     [
        //         {
        //             "time":"1536232111669",
        //             "orderId":"90161227158286336",
        //             "accountId":"517256161325920",
        //             "tokenId":"BHC",
        //             "tokenName":"BHC",
        //             "address":"0x815bF1c3cc0f49b8FC66B21A7e48fCb476051209",
        //             "addressExt":"address tag",
        //             "quantity":"14", // Withdrawal qty
        //             "arriveQuantity":"14", // Arrived qty
        //             "statusCode":"PROCESSING_STATUS",
        //             "status":3,
        //             "txid":"",
        //             "txidUrl":"",
        //             "walletHandleTime":"1536232111669",
        //             "feeTokenId":"BHC",
        //             "feeTokenName":"BHC",
        //             "fee":"0.1",
        //             "requiredConfirmNum":0, // Required confirmations
        //             "confirmNum":0, // Confirmations
        //             "kernelId":"", // BEAM and GRIN only
        //             "isInternalTransfer": false // True if this transfer is internal
        //         },
        //         ...
        //     ]
        //
        // withdraw
        //     {
        //         "status": 0,
        //         "success": true,
        //         "needBrokerAudit": false, // Whether this request needs broker auit
        //         "orderId": "423885103582776064" // Id for successful withdrawal
        //     }
        //
        const id = this.safeString (transaction, 'orderId');
        const txid = this.safeString (transaction, 'txid');
        const timestamp = this.safeInteger (transaction, 'time');
        const address = this.safeString (transaction, 'address');
        const fromAddress = this.safeString (transaction, 'fromAddress');
        let tag = this.safeString (transaction, 'addressTag');
        if (tag !== undefined) {
            if (tag.length < 1) {
                tag = undefined;
            }
        }
        const ext = this.safeString (transaction, 'addressExt');
        if ((ext !== undefined) && (tag === undefined)) { // todo check
            tag = ext;
        }
        const tagFrom = this.safeString (transaction, 'fromAddressTag');
        let type = undefined;
        if ('adressExt' in transaction) {
            type = 'withdrawal';
        } else {
            type = 'deposit';
        }
        const amount = this.safeNumber (transaction, 'quantity');
        const code = this.safeString (transaction, 'tokenId');
        let status = undefined;
        if (type === 'withdrawal') {
            status = this.parseWithdrawTransactionStatus (this.safeString (transaction, 'status'));
        } else {
            status = this.parseDepositTransactionStatus (this.safeString (transaction, 'status'));
        }
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        const internal = this.safeBool (transaction, 'isInternalTransfer');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': undefined,
            'address': address,
            'addressTo': undefined,
            'addressFrom': fromAddress,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': tagFrom,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': internal,
            'comment': undefined,
            'fee': fee,
        };
    }

    async transfer (code: string, amount: number, fromAccount: string, toAccount: string, params = {}): Promise<TransferEntry> { // todo transfer to account with special index subaccount
        /**
         * @method
         * @name biflex#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://docs.bitflex.com/spot#internal-account-transfer
         * @see https://docs.bitflex.com/contract#transfer-pending
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const fromAccountType = this.encodeAccountType (fromAccount);
        const toAccountType = this.encodeAccountType (toAccount);
        const request = {
            'amount': amount,
            'tokenId': currency['id'],
            'fromAccountType': fromAccountType,
            'toAccountType': toAccountType,
        };
        const response = await this.privatePostOpenapiV1Transfer (this.extend (request, params));
        //
        //    { "success": "true" }
        //
        const transfer = this.parseTransfer (response, currency);
        transfer['amount'] = amount;
        transfer['fromAccount'] = fromAccount;
        transfer['toAccount'] = toAccount;
        return transfer;
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //    { "success": "true" }
        //
        const status = this.safeString (transfer, 'success');
        const timestamp = this.safeInteger (transfer, 'timestamp');
        return {
            'info': transfer,
            'id': undefined,
            'timestamp': timestamp,
            'datetime': undefined,
            'currency': currency['code'],
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'true': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code: string, amount: number, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#withdraw
         * @description make a withdrawal
         * @see https://docs.bitflex.com/spot#withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} params.clientOrderId Id generated from broker side, to prevent double withdrawal
         * @param {string} [params.chainType] chain type, USDT chain types are OMNI ERC20 TRC20, default is OMNI
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'tokenId': currency['id'],
            'address': address,
            'withdrawQuantity': amount,
        };
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        if (tag !== undefined) {
            request['addressExt'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeString2 (params, 'network', 'chainType');
        network = this.safeString (networks, network, network);
        if (network !== undefined) {
            request['chainType'] = network;
            params = this.omit (params, [ 'network', 'chainType' ]);
        }
        const response = await this.privatePostOpenapiV1Withdraw (this.extend (request, params));
        //
        //     {
        //         "status": 0,
        //         "success": true,
        //         "needBrokerAudit": false, // Whether this request needs broker auit
        //         "orderId": "423885103582776064" // Id for successful withdrawal
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name bitstamp#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered balance of the user, not available for spot account
         * @see https://docs.bitflex.com/spot#check-balance-flow
         * @param {string} code unified currency code, default is undefined
         * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
         * @param {int} [limit] max number of ledger entrys to return, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch entries for
         * @param {string} [params.accountType] account type: spot, option, swap
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.accountIndex] sub-account index, default is '0'
         * @param {int} [params.fromFlowId] Id to start from
         * @param {int} [params.endFlowId] Id to end with
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['tokenId'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        let type = undefined;
        [ type, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'accountType', 'swap');
        if (type === 'spot') {
            throw new NotSupported (this.id + ' fetchLedger() does not support spot accounts, only swap accounts are accepted');
        }
        request['accountType'] = this.encodeAccountType (type);
        params = this.omit (params, 'accountType');
        const response = await this.privateGetOpenapiV1BalanceFlow (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "1669330193041477632",
        //             "accountId": "1662502620223296001",
        //             "token": "USDT",
        //             "tokenId": "USDT",
        //             "tokenName": "USDT",
        //             "flowTypeValue": 51,
        //             "flowType": "USER_ACCOUNT_TRANSFER",
        //             "flowName": "Transfer",
        //             "change": "30",
        //             "total": "32.230409432",
        //             "created": "1713735666338"
        //         },
        //         {
        //             "id": "1668427992530046976",
        //             "accountId": "1662502620223296001",
        //             "token": "USDT",
        //             "tokenId": "USDT",
        //             "tokenName": "USDT",
        //             "flowTypeValue": 51,
        //             "flowType": "USER_ACCOUNT_TRANSFER",
        //             "flowName": "Transfer",
        //             "change": "-50",
        //             "total": "2.230409432",
        //             "created": "1713628115657"
        //         }
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            '1': 'trade', // trades
            '2': 'fee', // trading fees
            '3': 'transfer', // transfer
            '4': 'transaction', // deposit
            '27': 'reward', // maker reward todo check
            '28': 'trade', // PnL from contracts todo check
            '30': 'trade', // settlement todo check
            '31': 'trade', // liquidation
            '32': 'fee', // funding fee settlement todo check
            '51': 'transfer', // userAccountTransfer Exclusive
            '65': 'trade', // OTC buy coin
            '66': 'trade', // OTC sell coin
            '67': 'reward', // campaign reward todo check
            '68': 'rebate', // user rebates
            '69': 'reward', // registration reward todo check
            '70': 'airdrop', // airdrop
            '71': 'reward', // mining reward todo check
            '73': 'fee', // OTC fees
            '200': 'trade', // old OTC balance flow
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency: Currency = undefined) {
        //
        //     [
        //         {
        //             "id": "1669330193041477632",
        //             "accountId": "1662502620223296001",
        //             "token": "USDT",
        //             "tokenId": "USDT",
        //             "tokenName": "USDT",
        //             "flowTypeValue": 51,
        //             "flowType": "USER_ACCOUNT_TRANSFER",
        //             "flowName": "Transfer",
        //             "change": "30",
        //             "total": "32.230409432",
        //             "created": "1713735666338"
        //         },
        //         ...
        //     ]
        //
        const id = this.safeString (item, 'id');
        const account = undefined;
        const referenceId = undefined;
        const referenceAccount = this.safeString (item, 'accountId');
        const type = this.parseLedgerEntryType (this.safeString (item, 'flowTypeValue')); // todo
        const code = this.safeCurrencyCode (this.safeString (item, 'token'), currency);
        let amount = this.safeString (item, 'change');
        const amountIsNegative = Precise.stringLt (amount, '0');
        const direction = amountIsNegative ? 'out' : 'in';
        amount = Precise.stringAbs (amount);
        const timestamp = this.safeString (item, 'created');
        const fee = this.safeString (item, 'fee');
        const before = undefined;
        const after = this.safeString (item, 'total');
        const status = 'ok';
        const symbol = undefined;
        return this.safeLedgerEntry ({
            'id': id,
            'info': item,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'account': account,
            'direction': direction,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'symbol': symbol,
            'amount': amount,
            'before': before,
            'after': after,
            'status': status,
            'fee': fee,
        });
    }

    async fetchPosition (symbol: string, params = {}): Promise<Position> {
        /**
         * @method
         * @name bitflex#fetchPosition
         * @see https://docs.bitflex.com/contract#positions
         * @description fetch data on an open position
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} params.side 'long' or 'short' - direction of the position. If not sent, positions for both sides will be returned.
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new NotSupported (this.id + ' fetchPosition() does not support spot markets, only swap markets are accepted');
        }
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPosition() requires a params.side argument for fetching long or short position. Use fetchPositionsForSymbol() for fetching both long and short positions');
        }
        const request = {
            'symbol': market['id'],
            'side': side.toUpperCase (),
        };
        params = this.omit (params, 'side');
        const response = await this.privateGetOpenapiContractV1Positions (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "BTC-SWAP-USDT",
        //             "side": "LONG",
        //             "avgPrice": "66004.8",
        //             "position": "0.001",
        //             "available": "0.001",
        //             "leverage": "10",
        //             "lastPrice": "65998.2",
        //             "positionValue": "66.0223",
        //             "flp": "59709.4",
        //             "margin": "6.5939",
        //             "marginRate": "0.1001",
        //             "unrealizedPnL": "0.0175",
        //             "profitRate": "0.0026",
        //             "realizedPnL": "-0.0396"
        //         }
        //     ]
        //
        if (response.length > 0) {
            return this.parsePosition (response[0], market);
        } else {
            return this.parsePosition (response[0]); // omiting market to return empty Position
        }
    }

    async fetchPositionsForSymbol (symbol: string, params = {}) {
        /**
         * @method
         * @name bitflex#fetchPositionsForSymbol
         * @see https://docs.bitflex.com/contract#positions
         * @description fetch all open positions for specific symbol
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        return await this.fetchPositions ([ symbol ], params);
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#fetchPositions
         * @description fetch all open positions
         * @see https://docs.bitflex.com/contract#positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.side] 'long' or 'short' - direction of the position. If not sent, positions for both sides will be returned.
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const request = {};
        const side = this.safeString (params, 'side');
        if (side !== undefined) {
            request['side'] = side.toUpperCase ();
            params = this.omit (params, 'side');
        }
        const response = await this.privateGetOpenapiContractV1Positions (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "BTC-SWAP-USDT",
        //             "side": "LONG",
        //             "avgPrice": "66004.8",
        //             "position": "0.001",
        //             "available": "0.001",
        //             "leverage": "10",
        //             "lastPrice": "65998.2",
        //             "positionValue": "66.0223",
        //             "flp": "59709.4",
        //             "margin": "6.5939",
        //             "marginRate": "0.1001",
        //             "unrealizedPnL": "0.0175",
        //             "profitRate": "0.0026",
        //             "realizedPnL": "-0.0396"
        //         },
        //         ...
        //     ]
        //
        return this.parsePositions (response, symbols);
    }

    parsePosition (position, market: Market = undefined) {
        const marketId = this.safeString (position, 'symbol');
        let marginMode = 'cross';
        if (position === undefined) {
            marginMode = undefined;
        }
        market = this.safeMarket (marketId, market);
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': this.safeNumber (position, 'positionValue'),
            'marginMode': marginMode,
            'liquidationPrice': this.safeNumber (position, 'flp'),
            'entryPrice': this.safeNumber (position, 'avgPrice'),
            'unrealizedPnl': this.safeNumber (position, 'unrealizedPnL'),
            'realizedPnl': this.safeNumber (position, 'realizedPnL'),
            'percentage': undefined,
            'contracts': this.safeNumber (position, 'position'),
            'contractSize': undefined,
            'markPrice': undefined,
            'lastPrice': this.safeNumber (position, 'lastPrice'),
            'side': this.safeStringLower (position, 'side'),
            'hedged': undefined, // todo check
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': this.safeNumber (position, 'leverage'),
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    async setLeverage (leverage: Int, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#setLeverage
         * @description set the level of leverage for a market
         * @see https://docs.bitflex.com/contract#modify-leverage
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} params.side 'long' or 'short' - direction of the position
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        // todo find out the limits for leverage
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' setLeverage() supports swap contracts only');
        }
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a params.side argument (long or short)');
        }
        const request = {
            'symbol': market['id'],
            'leverage': leverage,
            'side': side.toUpperCase (),
        };
        params = this.omit (params, 'side');
        return await this.privatePostOpenapiContractV1ModifyLeverage (this.extend (request, params));
        //
        //     {
        //         "symbol": "ETH-SWAP-USDT",
        //         "leverage": "10",
        //         "timestamp": "1713813534115"
        //     }
        //
    }

    async modifyMarginHelper (symbol: string, amount, type, params = {}): Promise<MarginModification> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' reduceMargin() and addMargin() support swap contracts only');
        }
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' reduceMargin() and addMargin() require a params.side argument (long or short)');
        }
        amount = this.amountToPrecision (symbol, amount);
        const request = {
            'symbol': market['id'],
            'amount': amount, // positive value for adding margin, negative for reducing
            'side': side.toUpperCase (),
        };
        params = this.omit (params, 'side');
        const response = await this.privatePostOpenapiContractV1ModifyMargin (this.extend (request, params));
        //
        //     {
        //         "symbol": "BTC-SWAP-USDT",
        //         "margin": "14.0917",
        //         "timestamp": "1713818240989"
        //     }
        //
        if (type === 'reduce') {
            amount = Precise.stringAbs (amount);
        }
        return this.extend (this.parseMarginModification (response, market), {
            'amount': this.parseNumber (amount),
            'type': type,
        });
    }

    parseMarginModification (data, market: Market = undefined): MarginModification {
        //
        //     {
        //         "symbol": "BTC-SWAP-USDT",
        //         "margin": "14.0917",
        //         "timestamp": "1713818240989"
        //     }
        //
        const marketId = this.safeString (data, 'symbol');
        market = this.safeMarket (marketId, market);
        const total = this.safeNumber (data, 'margin');
        const timestamp = this.safeInteger (data, 'timestamp');
        return {
            'info': data,
            'symbol': market['symbol'],
            'type': undefined,
            'marginMode': 'cross', // todo check
            'amount': undefined,
            'total': total,
            'code': market['settle'],
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    async reduceMargin (symbol: string, amount, params = {}): Promise<MarginModification> {
        /**
         * @method
         * @name ascendex#reduceMargin
         * @description remove margin from a position
         * @see https://docs.bitflex.com/contract#modify-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} params.side 'long' or 'short' - direction of the position
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, -amount, 'reduce', params);
    }

    async addMargin (symbol: string, amount, params = {}): Promise<MarginModification> {
        /**
         * @method
         * @name ascendex#addMargin
         * @description add margin
         * @see https://docs.bitflex.com/contract#modify-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} params.side 'long' or 'short' - direction of the position
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, 'add', params);
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name bitflex#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://docs.bitflex.com/contract#funding-rate-pending
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetOpenapiContractV1FundingRate (this.extend (request, params));
        //
        //     [
        //         {
        //             "symbol": "BTC-SWAP-USDT",
        //             "intervalStart": "1713816000000",
        //             "intervalEnd": "1713844800000",
        //             "rate": "0.000272543243139311"
        //         }
        //     ]
        //
        return this.parseFundingRate (response[0], market);
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @see https://docs.bitflex.com/contract#funding-rate-pending
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetOpenapiContractV1FundingRate (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const parsed = this.parseFundingRate (entry);
            result.push (parsed);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        //     {
        //         "symbol": "BTC-SWAP-USDT",
        //         "intervalStart": "1713816000000",
        //         "intervalEnd": "1713844800000",
        //         "rate": "0.000272543243139311"
        //     }
        //
        const marketId = this.safeString (contract, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const nextFundingTimestamp = this.safeInteger (contract, 'intervalEnd'); // todo check
        const previousFundingTimestamp = this.safeInteger (contract, 'intervalStart');
        const fundingRate = this.safeNumber (contract, 'rate');
        return {
            'info': contract,
            'symbol': symbol,
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
            'nextFundingTimestamp': nextFundingTimestamp,
            'nextFundingDatetime': this.iso8601 (nextFundingTimestamp),
            'previousFundingRate': undefined,
            'previousFundingTimestamp': previousFundingTimestamp,
            'previousFundingDatetime': this.iso8601 (previousFundingTimestamp),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        const endpoint = this.implodeParams (path, params);
        url = url + '/' + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            query['timestamp'] = this.milliseconds ();
            const recvWindow = this.safeInteger (query, 'recvWindow');
            if (recvWindow === undefined) {
                const defaultRecvWindow = this.safeInteger (this.options, 'recvWindow');
                if (defaultRecvWindow !== undefined) {
                    query['recvWindow'] = defaultRecvWindow;
                }
            }
            query = this.urlencode (query);
            const signature = this.hmac (this.encode (query), this.encode (this.secret), sha256);
            url = url + '?' + query + '&signature=' + signature;
            headers = {
                'X-BH-APIKEY': this.apiKey,
            };
        } else {
            query = this.urlencode (query);
            if (query.length !== 0) {
                url += '?' + query;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
