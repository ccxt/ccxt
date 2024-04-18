
//  ---------------------------------------------------------------------------

import Exchange from './abstract/bitflex.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Currencies, Int, Market, OHLCV, OrderBook, Ticker, Tickers, Trade, Strings } from './base/types.js';

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
            'pro': false,
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
                'fetchBidsAsks': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
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
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
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
                    // 400  {"code":-1130,"msg":"Data sent for paramter \u0027type\u0027 is not valid."}
                    // 400 {"code":-100012,"msg":"Parameter symbol [String] missing!"}
                    // 400 {"code":-100012,"msg":"Parameter interval [String] missing!"}
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
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
        // contract market
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
            'maker': this.safeFloat (this.fees['trading'], 'maker'),
            'taker': this.safeFloat (this.fees['trading'], 'taker'),
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
        } else if (market['contract']) {
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

    parseTrade (trade, market: Market = undefined): Trade {
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (trade, 'time');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'qty');
        const isBuyerMaker = this.safeBool (trade, 'isBuyerMaker');
        let takerOrMaker = undefined;
        if ((isBuyerMaker !== undefined) && (isBuyerMaker)) {
            takerOrMaker = 'maker';
        } else if ((isBuyerMaker !== undefined) && (!isBuyerMaker)) {
            takerOrMaker = 'taker';
        }
        return this.safeTrade ({
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': undefined, // todo check
            'takerOrMaker': takerOrMaker, // todo check
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
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
        const until = this.safeInteger2 (params, 'till', 'until');
        if (until !== undefined) {
            params = this.omit (params, [ 'till', 'until' ]);
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
        } else if (market['contract']) {
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
                } else if (market['contract']) {
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
