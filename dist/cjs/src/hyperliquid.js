'use strict';

var hyperliquid$1 = require('./abstract/hyperliquid.js');
var errors = require('./base/errors.js');
var Precise = require('./base/Precise.js');
var number = require('./base/functions/number.js');
var sha3 = require('./static_dependencies/noble-hashes/sha3.js');
var secp256k1 = require('./static_dependencies/noble-curves/secp256k1.js');
var crypto = require('./base/functions/crypto.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class hyperliquid
 * @augments Exchange
 */
class hyperliquid extends hyperliquid$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'hyperliquid',
            'name': 'Hyperliquid',
            'countries': [],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMarginMode': true,
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
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1m',
            },
            'hostname': 'hyperliquid.xyz',
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/b371bc6c-4a8c-489f-87f4-20a913dd8d4b',
                'api': {
                    'public': 'https://api.{hostname}',
                    'private': 'https://api.{hostname}',
                },
                'test': {
                    'public': 'https://api.hyperliquid-testnet.xyz',
                    'private': 'https://api.hyperliquid-testnet.xyz',
                },
                'www': 'https://hyperliquid.xyz',
                'doc': 'https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api',
                'fees': 'https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees',
                'referral': 'https://app.hyperliquid.xyz/',
            },
            'api': {
                'public': {
                    'post': {
                        'info': 1,
                    },
                },
                'private': {
                    'post': {
                        'exchange': 1,
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber('0.00035'),
                    'maker': this.parseNumber('0.0001'),
                },
                'spot': {
                    'taker': this.parseNumber('0.00035'),
                    'maker': this.parseNumber('0.0001'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {},
                'broad': {
                    'Price must be divisible by tick size.': errors.InvalidOrder,
                    'Order must have minimum value of $10': errors.InvalidOrder,
                    'Insufficient margin to place order.': errors.InvalidOrder,
                    'Reduce only order would increase position.': errors.InvalidOrder,
                    'Post only order would have immediately matched,': errors.InvalidOrder,
                    'Order could not immediately match against any resting orders.': errors.InvalidOrder,
                    'Invalid TP/SL price.': errors.InvalidOrder,
                    'No liquidity available for market order.': errors.InvalidOrder,
                    'Order was never placed, already canceled, or filled.': errors.OrderNotFound,
                    'User or API Wallet ': errors.InvalidOrder,
                },
            },
            'precisionMode': number.TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'swap',
                'sandboxMode': false,
                'defaultSlippage': 0.05,
                'zeroAddress': '0x0000000000000000000000000000000000000000',
            },
        });
    }
    setSandboxMode(enabled) {
        super.setSandboxMode(enabled);
        this.options['sandboxMode'] = enabled;
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-exchange-metadata
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const request = {
            'type': 'meta',
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "universe": [
        //                 {
        //                     "maxLeverage": 50,
        //                     "name": "SOL",
        //                     "onlyIsolated": false,
        //                     "szDecimals": 2
        //                 }
        //             ]
        //         }
        //     ]
        //
        const meta = this.safeList(response, 'universe', []);
        const result = {};
        for (let i = 0; i < meta.length; i++) {
            const data = this.safeDict(meta, i, {});
            const id = i;
            const name = this.safeString(data, 'name');
            const code = this.safeCurrencyCode(name);
            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': undefined,
                'info': data,
                'active': undefined,
                'deposit': undefined,
                'withdraw': undefined,
                'networks': undefined,
                'fee': undefined,
                // 'fees': fees,
                'limits': undefined,
            };
        }
        return result;
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchMarkets
         * @description retrieves data on all markets for hyperliquid
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-asset-contexts-includes-mark-price-current-funding-open-interest-etc
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const rawPromises = [
            this.fetchSwapMarkets(params),
            this.fetchSpotMarkets(params),
        ];
        const promises = await Promise.all(rawPromises);
        const swapMarkets = promises[0];
        const spotMarkets = promises[1];
        return this.arrayConcat(swapMarkets, spotMarkets);
    }
    async fetchSwapMarkets(params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchMarkets
         * @description retrieves data on all swap markets for hyperliquid
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-asset-contexts-includes-mark-price-current-funding-open-interest-etc
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'type': 'metaAndAssetCtxs',
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "universe": [
        //                 {
        //                     "maxLeverage": 50,
        //                     "name": "SOL",
        //                     "onlyIsolated": false,
        //                     "szDecimals": 2
        //                 }
        //             ]
        //         },
        //         [
        //             {
        //                 "dayNtlVlm": "9450588.2273",
        //                 "funding": "0.0000198",
        //                 "impactPxs": [
        //                     "108.04",
        //                     "108.06"
        //                 ],
        //                 "markPx": "108.04",
        //                 "midPx": "108.05",
        //                 "openInterest": "10764.48",
        //                 "oraclePx": "107.99",
        //                 "premium": "0.00055561",
        //                 "prevDayPx": "111.81"
        //             }
        //         ]
        //     ]
        //
        //
        let meta = this.safeDict(response, 0, {});
        meta = this.safeList(meta, 'universe', []);
        const assetCtxs = this.safeDict(response, 1, {});
        const result = [];
        for (let i = 0; i < meta.length; i++) {
            const data = this.extend(this.safeDict(meta, i, {}), this.safeDict(assetCtxs, i, {}));
            data['baseId'] = i;
            result.push(data);
        }
        return this.parseMarkets(result);
    }
    async fetchSpotMarkets(params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchMarkets
         * @description retrieves data on all spot markets for hyperliquid
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-asset-contexts-includes-mark-price-current-funding-open-interest-etc
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'type': 'spotMetaAndAssetCtxs',
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        // [
        //     {
        //         'tokens': [
        //             {
        //                 'name': 'USDC',
        //                 'szDecimals': '8',
        //                 'weiDecimals': '8',
        //             },
        //             {
        //                 'name': 'PURR',
        //                 'szDecimals': '0',
        //                 'weiDecimals': '5',
        //             },
        //         ],
        //         'universe': [
        //             {
        //                 'name': 'PURR/USDC',
        //                 'tokens': [
        //                     1,
        //                     0,
        //                 ],
        //             },
        //         ],
        //     },
        //     [
        //         {
        //             'dayNtlVlm': '264250385.14640012',
        //             'markPx': '0.018314',
        //             'midPx': '0.0182235',
        //             'prevDayPx': '0.017427',
        //         },
        //     ],
        // ];
        // mainnet
        // [
        //     {
        //        "canonical_tokens2":[
        //           0,
        //           1
        //        ],
        //        "spot_infos":[
        //           {
        //              "name":"PURR/USDC",
        //              "tokens":[
        //                 1,
        //                 0
        //              ]
        //           }
        //        ],
        //        "token_id_to_token":[
        //           [
        //              "0x6d1e7cde53ba9467b783cb7c530ce054",
        //              0
        //           ],
        //           [
        //              "0xc1fb593aeffbeb02f85e0308e9956a90",
        //              1
        //           ]
        //        ],
        //        "token_infos":[
        //           {
        //              "deployer":null,
        //              "spec":{
        //                 "name":"USDC",
        //                 "szDecimals":"8",
        //                 "weiDecimals":"8"
        //              },
        //              "spots":[
        //              ]
        //           },
        //           {
        //              "deployer":null,
        //              "spec":{
        //                 "name":"PURR",
        //                 "szDecimals":"0",
        //                 "weiDecimals":"5"
        //              },
        //              "spots":[
        //                 0
        //              ]
        //           }
        //        ]
        //     },
        //     [
        //        {
        //           "dayNtlVlm":"35001170.16631",
        //           "markPx":"0.15743",
        //           "midPx":"0.157555",
        //           "prevDayPx":"0.158"
        //        }
        //     ]
        // ]
        //
        // response differs depending on the environment (mainnet vs sandbox)
        const first = this.safeDict(response, 0, {});
        const meta = this.safeList2(first, 'universe', 'spot_infos', []);
        const tokens = this.safeList2(first, 'tokens', 'token_infos', []);
        const markets = [];
        for (let i = 0; i < meta.length; i++) {
            const market = this.safeDict(meta, i, {});
            const marketName = this.safeString(market, 'name');
            if (marketName.indexOf('/') < 0) {
                // there are some weird spot markets in testnet, eg @2
                continue;
            }
            const marketParts = marketName.split('/');
            const baseName = this.safeString(marketParts, 0);
            const quoteId = this.safeString(marketParts, 1);
            const base = this.safeCurrencyCode(baseName);
            const quote = this.safeCurrencyCode(quoteId);
            const symbol = base + '/' + quote;
            const fees = this.safeDict(this.fees, 'spot', {});
            const taker = this.safeNumber(fees, 'taker');
            const maker = this.safeNumber(fees, 'maker');
            const tokensPos = this.safeList(market, 'tokens', []);
            const baseTokenPos = this.safeInteger(tokensPos, 0);
            // const quoteTokenPos = this.safeInteger (tokensPos, 1);
            const baseTokenInfo = this.safeDict(tokens, baseTokenPos, {});
            // const quoteTokenInfo = this.safeDict (tokens, quoteTokenPos, {});
            const innerBaseTokenInfo = this.safeDict(baseTokenInfo, 'spec', baseTokenInfo);
            // const innerQuoteTokenInfo = this.safeDict (quoteTokenInfo, 'spec', quoteTokenInfo);
            const amountPrecision = this.parseNumber(this.parsePrecision(this.safeString(innerBaseTokenInfo, 'szDecimals')));
            // const quotePrecision = this.parseNumber (this.parsePrecision (this.safeString (innerQuoteTokenInfo, 'szDecimals')));
            const baseId = this.numberToString(i + 10000);
            markets.push(this.safeMarketStructure({
                'id': marketName,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'subType': undefined,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'active': true,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': 5, // significant digits
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
            }));
        }
        return markets;
    }
    parseMarket(market) {
        //
        //     {
        //         "maxLeverage": "50",
        //         "name": "ETH",
        //         "onlyIsolated": false,
        //         "szDecimals": "4",
        //         "dayNtlVlm": "1709813.11535",
        //         "funding": "0.00004807",
        //         "impactPxs": [
        //             "2369.3",
        //             "2369.6"
        //         ],
        //         "markPx": "2369.6",
        //         "midPx": "2369.45",
        //         "openInterest": "1815.4712",
        //         "oraclePx": "2367.3",
        //         "premium": "0.00090821",
        //         "prevDayPx": "2381.5"
        //     }
        //
        const quoteId = 'USDC';
        const base = this.safeString(market, 'name');
        const quote = this.safeCurrencyCode(quoteId);
        const baseId = this.safeString(market, 'baseId');
        const settleId = 'USDC';
        const settle = this.safeCurrencyCode(settleId);
        let symbol = base + '/' + quote;
        const contract = true;
        const swap = true;
        {
            {
                symbol = symbol + ':' + settle;
            }
        }
        const fees = this.safeDict(this.fees, 'swap', {});
        const taker = this.safeNumber(fees, 'taker');
        const maker = this.safeNumber(fees, 'maker');
        return {
            'id': baseId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': swap,
            'future': false,
            'option': false,
            'active': true,
            'contract': contract,
            'linear': true,
            'inverse': false,
            'taker': taker,
            'maker': maker,
            'contractSize': this.parseNumber('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber(this.parsePrecision(this.safeString(market, 'szDecimals'))),
                'price': 5, // significant digits
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
        };
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-state
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] user address, will default to this.walletAddress if not provided
         * @param {string} [params.type] wallet type, ['spot', 'swap'], defaults to swap
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchBalance', params);
        let type = undefined;
        [type, params] = this.handleMarketTypeAndParams('fetchBalance', undefined, params);
        const isSpot = (type === 'spot');
        const reqType = (isSpot) ? 'spotClearinghouseState' : 'clearinghouseState';
        const request = {
            'type': reqType,
            'user': userAddress,
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     {
        //         "assetPositions": [],
        //         "crossMaintenanceMarginUsed": "0.0",
        //         "crossMarginSummary": {
        //             "accountValue": "100.0",
        //             "totalMarginUsed": "0.0",
        //             "totalNtlPos": "0.0",
        //             "totalRawUsd": "100.0"
        //         },
        //         "marginSummary": {
        //             "accountValue": "100.0",
        //             "totalMarginUsed": "0.0",
        //             "totalNtlPos": "0.0",
        //             "totalRawUsd": "100.0"
        //         },
        //         "time": "1704261007014",
        //         "withdrawable": "100.0"
        //     }
        // spot
        //
        //     {
        //         "balances":[
        //            {
        //               "coin":"USDC",
        //               "hold":"0.0",
        //               "total":"1481.844"
        //            },
        //            {
        //               "coin":"PURR",
        //               "hold":"0.0",
        //               "total":"999.65004"
        //            }
        //     }
        //
        const balances = this.safeList(response, 'balances');
        if (balances !== undefined) {
            const spotBalances = { 'info': response };
            for (let i = 0; i < balances.length; i++) {
                const balance = balances[i];
                const code = this.safeCurrencyCode(this.safeString(balance, 'coin'));
                const account = this.account();
                const total = this.safeString(balance, 'total');
                const free = this.safeString(balance, 'hold');
                account['total'] = total;
                account['free'] = free;
                spotBalances[code] = account;
            }
            return this.safeBalance(spotBalances);
        }
        const data = this.safeDict(response, 'marginSummary', {});
        const result = {
            'info': response,
            'USDC': {
                'total': this.safeFloat(data, 'accountValue'),
                'used': this.safeFloat(data, 'totalMarginUsed'),
            },
        };
        const timestamp = this.safeInteger(response, 'time');
        result['timestamp'] = timestamp;
        result['datetime'] = this.iso8601(timestamp);
        return this.safeBalance(result);
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#info
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'type': 'l2Book',
            'coin': market['swap'] ? market['base'] : market['id'],
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     {
        //         "coin": "ETH",
        //         "levels": [
        //             [
        //                 {
        //                     "n": "2",
        //                     "px": "2216.2",
        //                     "sz": "74.0637"
        //                 }
        //             ],
        //             [
        //                 {
        //                     "n": "2",
        //                     "px": "2216.5",
        //                     "sz": "70.5893"
        //                 }
        //             ]
        //         ],
        //         "time": "1704290104840"
        //     }
        //
        const data = this.safeList(response, 'levels', []);
        const result = {
            'bids': this.safeList(data, 0, []),
            'asks': this.safeList(data, 1, []),
        };
        const timestamp = this.safeInteger(response, 'time');
        return this.parseOrderBook(result, market['symbol'], timestamp, 'bids', 'asks', 'px', 'sz');
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#info-1
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents, support '1m', '15m', '1h', '1d'
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const until = this.safeInteger(params, 'until', this.milliseconds());
        if (since === undefined) {
            since = 0;
        }
        if (limit === undefined) {
            limit = 500;
        }
        params = this.omit(params, ['until']);
        const request = {
            'type': 'candleSnapshot',
            'req': {
                'coin': market['swap'] ? market['base'] : market['id'],
                'interval': timeframe,
                'startTime': since,
                'endTime': until,
            },
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "T": 1704287699999,
        //             "c": "2226.4",
        //             "h": "2247.9",
        //             "i": "15m",
        //             "l": "2224.6",
        //             "n": 46,
        //             "o": "2247.9",
        //             "s": "ETH",
        //             "t": 1704286800000,
        //             "v": "591.6427"
        //         }
        //     ]
        //
        return this.parseOHLCVs(response, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "T": 1704287699999,
        //         "c": "2226.4",
        //         "h": "2247.9",
        //         "i": "15m",
        //         "l": "2224.6",
        //         "n": 46,
        //         "o": "2247.9",
        //         "s": "ETH",
        //         "t": 1704286800000,
        //         "v": "591.6427"
        //     }
        //
        return [
            this.safeInteger(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    async fetchTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade
         * @param {string} [params.address] wallet address that made trades
         * @param {string} [params.user] wallet address that made trades
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchTrades', params);
        await this.loadMarkets();
        const market = this.safeMarket(symbol);
        const request = {
            'user': userAddress,
        };
        if (since !== undefined) {
            request['type'] = 'userFillsByTime';
            request['startTime'] = since;
        }
        else {
            request['type'] = 'userFills';
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "closedPnl": "0.19343",
        //             "coin": "ETH",
        //             "crossed": true,
        //             "dir": "Close Long",
        //             "fee": "0.050062",
        //             "hash": "0x09d77c96791e98b5775a04092584ab010d009445119c71e4005c0d634ea322bc",
        //             "liquidationMarkPx": null,
        //             "oid": 3929354691,
        //             "px": "2381.1",
        //             "side": "A",
        //             "startPosition": "0.0841",
        //             "sz": "0.0841",
        //             "tid": 128423918764978,
        //             "time": 1704262888911
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    amountToPrecision(symbol, amount) {
        const market = this.market(symbol);
        if (market['spot']) {
            return super.amountToPrecision(symbol, amount);
        }
        return this.decimalToPrecision(amount, number.ROUND, this.markets[symbol]['precision']['amount'], this.precisionMode);
    }
    priceToPrecision(symbol, price) {
        const market = this.market(symbol);
        const result = this.decimalToPrecision(price, number.ROUND, market['precision']['price'], number.SIGNIFICANT_DIGITS, this.paddingMode);
        const decimalParsedResult = this.decimalToPrecision(result, number.ROUND, 6, number.DECIMAL_PLACES, this.paddingMode);
        return decimalParsedResult;
    }
    hashMessage(message) {
        return '0x' + this.hash(message, sha3.keccak_256, 'hex');
    }
    signHash(hash, privateKey) {
        const signature = crypto.ecdsa(hash.slice(-64), privateKey.slice(-64), secp256k1.secp256k1, undefined);
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': this.sum(27, signature['v']),
        };
    }
    signMessage(message, privateKey) {
        return this.signHash(this.hashMessage(message), privateKey.slice(-64));
    }
    constructPhantomAgent(hash, isTestnet = true) {
        const source = (isTestnet) ? 'b' : 'a';
        return {
            'source': source,
            'connectionId': hash,
        };
    }
    actionHash(action, vaultAddress, nonce) {
        const dataBinary = this.packb(action);
        const dataHex = this.binaryToBase16(dataBinary);
        let data = dataHex;
        data += '00000' + this.intToBase16(nonce);
        if (vaultAddress === undefined) {
            data += '00';
        }
        else {
            data += '01';
            data += vaultAddress;
        }
        return this.hash(this.base16ToBinary(data), sha3.keccak_256, 'binary');
    }
    signL1Action(action, nonce, vaultAdress = undefined) {
        const hash = this.actionHash(action, vaultAdress, nonce);
        const isTestnet = this.safeBool(this.options, 'sandboxMode', false);
        const phantomAgent = this.constructPhantomAgent(hash, isTestnet);
        // const data = {
        //     'domain': {
        //         'chainId': 1337,
        //         'name': 'Exchange',
        //         'verifyingContract': '0x0000000000000000000000000000000000000000',
        //         'version': '1',
        //     },
        //     'types': {
        //         'Agent': [
        //             { 'name': 'source', 'type': 'string' },
        //             { 'name': 'connectionId', 'type': 'bytes32' },
        //         ],
        //         'EIP712Domain': [
        //             { 'name': 'name', 'type': 'string' },
        //             { 'name': 'version', 'type': 'string' },
        //             { 'name': 'chainId', 'type': 'uint256' },
        //             { 'name': 'verifyingContract', 'type': 'address' },
        //         ],
        //     },
        //     'primaryType': 'Agent',
        //     'message': phantomAgent,
        // };
        const zeroAddress = this.safeString(this.options, 'zeroAddress');
        const chainId = 1337; // check this out
        const domain = {
            'chainId': chainId,
            'name': 'Exchange',
            'verifyingContract': zeroAddress,
            'version': '1',
        };
        const messageTypes = {
            'Agent': [
                { 'name': 'source', 'type': 'string' },
                { 'name': 'connectionId', 'type': 'bytes32' },
            ],
        };
        const msg = this.ethEncodeStructuredData(domain, messageTypes, phantomAgent);
        const signature = this.signMessage(msg, this.privateKey);
        return signature;
    }
    buildSig(chainId, messageTypes, message) {
        const zeroAddress = this.safeString(this.options, 'zeroAddress');
        const domain = {
            'chainId': chainId,
            'name': 'Exchange',
            'verifyingContract': zeroAddress,
            'version': '1',
        };
        const msg = this.ethEncodeStructuredData(domain, messageTypes, message);
        const signature = this.signMessage(msg, this.privateKey);
        return signature;
    }
    buildTransferSig(message) {
        const isSandboxMode = this.safeBool(this.options, 'sandboxMode');
        const chainId = (isSandboxMode) ? 421614 : 42161;
        const messageTypes = {
            'UsdTransferSignPayload': [
                { 'name': 'destination', 'type': 'string' },
                { 'name': 'amount', 'type': 'string' },
                { 'name': 'time', 'type': 'uint64' },
            ],
        };
        return this.buildSig(chainId, messageTypes, message);
    }
    buildWithdrawSig(message) {
        const isSandboxMode = this.safeBool(this.options, 'sandboxMode');
        const chainId = (isSandboxMode) ? 421614 : 42161;
        const messageTypes = {
            'WithdrawFromBridge2SignPayload': [
                { 'name': 'destination', 'type': 'string' },
                { 'name': 'usd', 'type': 'string' },
                { 'name': 'time', 'type': 'uint64' },
            ],
        };
        return this.buildSig(chainId, messageTypes, message);
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#createOrder
         * @description create a trade order
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.timeInForce] 'Gtc', 'Ioc', 'Alo'
         * @param {bool} [params.postOnly] true or false whether the order is post-only
         * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
         * @param {string} [params.slippage] the slippage for market order
         * @param {string} [params.vaultAddress] the vault address for order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const vaultAddress = this.safeString(params, 'vaultAddress');
        params = this.omit(params, 'vaultAddress');
        symbol = market['symbol'];
        const order = {
            'symbol': symbol,
            'type': type,
            'side': side,
            'amount': amount,
            'price': price,
            'params': params,
        };
        const globalParams = {};
        if (vaultAddress !== undefined) {
            globalParams['vaultAddress'] = vaultAddress;
        }
        const response = await this.createOrders([order], globalParams);
        const first = this.safeDict(response, 0);
        return first;
    }
    async createOrders(orders, params = {}) {
        /**
         * @method
         * @name hyperliquid#createOrders
         * @description create a list of trade orders
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials();
        await this.loadMarkets();
        let defaultSlippage = this.safeString(this.options, 'defaultSlippage');
        defaultSlippage = this.safeString(params, 'slippage', defaultSlippage);
        let hasClientOrderId = false;
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const clientOrderId = this.safeString2(orderParams, 'clientOrderId', 'client_id');
            if (clientOrderId !== undefined) {
                hasClientOrderId = true;
            }
        }
        if (hasClientOrderId) {
            for (let i = 0; i < orders.length; i++) {
                const rawOrder = orders[i];
                const orderParams = this.safeDict(rawOrder, 'params', {});
                const clientOrderId = this.safeString2(orderParams, 'clientOrderId', 'client_id');
                if (clientOrderId === undefined) {
                    throw new errors.ArgumentsRequired(this.id + ' createOrders() all orders must have clientOrderId if at least one has a clientOrderId');
                }
            }
        }
        params = this.omit(params, ['slippage', 'clientOrderId', 'client_id', 'slippage', 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'timeInForce']);
        const nonce = this.milliseconds();
        const orderReq = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString(rawOrder, 'symbol');
            const market = this.market(marketId);
            const symbol = market['symbol'];
            const type = this.safeStringUpper(rawOrder, 'type');
            const isMarket = (type === 'MARKET');
            const side = this.safeStringUpper(rawOrder, 'side');
            const isBuy = (side === 'BUY');
            const amount = this.safeString(rawOrder, 'amount');
            const price = this.safeString(rawOrder, 'price');
            let orderParams = this.safeDict(rawOrder, 'params', {});
            const clientOrderId = this.safeString2(orderParams, 'clientOrderId', 'client_id');
            const slippage = this.safeString(orderParams, 'slippage', defaultSlippage);
            let defaultTimeInForce = (isMarket) ? 'ioc' : 'gtc';
            const postOnly = this.safeBool(orderParams, 'postOnly', false);
            if (postOnly) {
                defaultTimeInForce = 'alo';
            }
            let timeInForce = this.safeStringLower(orderParams, 'timeInForce', defaultTimeInForce);
            timeInForce = this.capitalize(timeInForce);
            let triggerPrice = this.safeString2(orderParams, 'triggerPrice', 'stopPrice');
            const stopLossPrice = this.safeString(orderParams, 'stopLossPrice', triggerPrice);
            const takeProfitPrice = this.safeString(orderParams, 'takeProfitPrice');
            const isTrigger = (stopLossPrice || takeProfitPrice);
            let px = undefined;
            if (isMarket) {
                if (price === undefined) {
                    throw new errors.ArgumentsRequired(this.id + '  market orders require price to calculate the max slippage price. Default slippage can be set in options (default is 5%).');
                }
                px = (isBuy) ? Precise["default"].stringMul(price, Precise["default"].stringAdd('1', slippage)) : Precise["default"].stringMul(price, Precise["default"].stringSub('1', slippage));
                px = this.priceToPrecision(symbol, px); // round after adding slippage
            }
            else {
                px = this.priceToPrecision(symbol, price);
            }
            const sz = this.amountToPrecision(symbol, amount);
            const reduceOnly = this.safeBool(orderParams, 'reduceOnly', false);
            const orderType = {};
            if (isTrigger) {
                let isTp = false;
                if (takeProfitPrice !== undefined) {
                    triggerPrice = this.priceToPrecision(symbol, takeProfitPrice);
                    isTp = true;
                }
                else {
                    triggerPrice = this.priceToPrecision(symbol, stopLossPrice);
                }
                orderType['trigger'] = {
                    'isMarket': isMarket,
                    'triggerPx': triggerPrice,
                    'tpsl': (isTp) ? 'tp' : 'sl',
                };
            }
            else {
                orderType['limit'] = {
                    'tif': timeInForce,
                };
            }
            orderParams = this.omit(orderParams, ['clientOrderId', 'slippage', 'triggerPrice', 'stopPrice', 'stopLossPrice', 'takeProfitPrice', 'timeInForce', 'client_id', 'reduceOnly', 'postOnly']);
            const orderObj = {
                'a': this.parseToInt(market['baseId']),
                'b': isBuy,
                'p': px,
                's': sz,
                'r': reduceOnly,
                't': orderType,
                // 'c': clientOrderId,
            };
            if (clientOrderId !== undefined) {
                orderObj['c'] = clientOrderId;
            }
            orderReq.push(this.extend(orderObj, orderParams));
        }
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const orderAction = {
            'type': 'order',
            'orders': orderReq,
            'grouping': 'na',
            // 'brokerCode': 1, // cant
        };
        if (vaultAddress === undefined) {
            orderAction['brokerCode'] = 1;
        }
        const signature = this.signL1Action(orderAction, nonce, vaultAddress);
        const request = {
            'action': orderAction,
            'nonce': nonce,
            'signature': signature,
            // 'vaultAddress': vaultAddress,
        };
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         "status": "ok",
        //         "response": {
        //             "type": "order",
        //             "data": {
        //                 "statuses": [
        //                     {
        //                         "resting": {
        //                             "oid": 5063830287
        //                         }
        //                     }
        //                 ]
        //             }
        //         }
        //     }
        //
        const responseObj = this.safeDict(response, 'response', {});
        const data = this.safeDict(responseObj, 'data', {});
        const statuses = this.safeList(data, 'statuses', []);
        return this.parseOrders(statuses, undefined);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#cancelOrder
         * @description cancels an open order
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
         * @param {string} [params.vaultAddress] the vault address for order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.cancelOrders([id], symbol, params);
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#cancelOrders
         * @description cancel multiple orders
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
         * @param {string[]} ids order ids
         * @param {string} [symbol] unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string|string[]} [params.clientOrderId] client order ids, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
         * @param {string} [params.vaultAddress] the vault address
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials();
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        let clientOrderId = this.safeValue2(params, 'clientOrderId', 'client_id');
        params = this.omit(params, ['clientOrderId', 'client_id']);
        const nonce = this.milliseconds();
        const request = {
            'nonce': nonce,
            // 'vaultAddress': vaultAddress,
        };
        const cancelReq = [];
        const cancelAction = {
            'type': '',
            'cancels': [],
        };
        const baseId = this.parseToNumeric(market['baseId']);
        if (clientOrderId !== undefined) {
            if (!Array.isArray(clientOrderId)) {
                clientOrderId = [clientOrderId];
            }
            cancelAction['type'] = 'cancelByCloid';
            for (let i = 0; i < clientOrderId.length; i++) {
                cancelReq.push({
                    'asset': baseId,
                    'cloid': clientOrderId[i],
                });
            }
        }
        else {
            cancelAction['type'] = 'cancel';
            for (let i = 0; i < ids.length; i++) {
                cancelReq.push({
                    'a': baseId,
                    'o': this.parseToNumeric(ids[i]),
                });
            }
        }
        cancelAction['cancels'] = cancelReq;
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const signature = this.signL1Action(cancelAction, nonce, vaultAddress);
        request['action'] = cancelAction;
        request['signature'] = signature;
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         "status":"ok",
        //         "response":{
        //             "type":"cancel",
        //             "data":{
        //                 "statuses":[
        //                     "success"
        //                 ]
        //             }
        //         }
        //     }
        //
        return response;
    }
    async cancelOrdersForSymbols(orders, params = {}) {
        /**
         * @method
         * @name hyperliquid#cancelOrdersForSymbols
         * @description cancel multiple orders for multiple symbols
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
         * @param {CancellationRequest[]} orders each order should contain the parameters required by cancelOrder namely id and symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.vaultAddress] the vault address
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const nonce = this.milliseconds();
        const request = {
            'nonce': nonce,
            // 'vaultAddress': vaultAddress,
        };
        const cancelReq = [];
        const cancelAction = {
            'type': '',
            'cancels': [],
        };
        let cancelByCloid = false;
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const clientOrderId = this.safeString(order, 'clientOrderId');
            if (clientOrderId !== undefined) {
                cancelByCloid = true;
            }
            const id = this.safeString(order, 'id');
            const symbol = this.safeString(order, 'symbol');
            if (symbol === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' cancelOrdersForSymbols() requires a symbol argument in each order');
            }
            if (id !== undefined && cancelByCloid) {
                throw new errors.BadRequest(this.id + ' cancelOrdersForSymbols() all orders must have either id or clientOrderId');
            }
            const assetKey = cancelByCloid ? 'asset' : 'a';
            const idKey = cancelByCloid ? 'cloid' : 'o';
            const market = this.market(symbol);
            const cancelObj = {};
            cancelObj[assetKey] = this.parseToNumeric(market['baseId']);
            cancelObj[idKey] = cancelByCloid ? clientOrderId : this.parseToNumeric(id);
            cancelReq.push(cancelObj);
        }
        cancelAction['type'] = cancelByCloid ? 'cancelByCloid' : 'cancel';
        cancelAction['cancels'] = cancelReq;
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const signature = this.signL1Action(cancelAction, nonce, vaultAddress);
        request['action'] = cancelAction;
        request['signature'] = signature;
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         "status":"ok",
        //         "response":{
        //             "type":"cancel",
        //             "data":{
        //                 "statuses":[
        //                     "success"
        //                 ]
        //             }
        //         }
        //     }
        //
        return response;
    }
    async cancelAllOrdersAfter(timeout, params = {}) {
        /**
         * @method
         * @name hyperliquid#cancelAllOrdersAfter
         * @description dead man's switch, cancel all orders after the given timeout
         * @param {number} timeout time in milliseconds, 0 represents cancel the timer
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.vaultAddress] the vault address
         * @returns {object} the api result
         */
        this.checkRequiredCredentials();
        await this.loadMarkets();
        params = this.omit(params, ['clientOrderId', 'client_id']);
        const nonce = this.milliseconds();
        const request = {
            'nonce': nonce,
            // 'vaultAddress': vaultAddress,
        };
        const cancelAction = {
            'type': 'scheduleCancel',
            'time': nonce + timeout,
        };
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const signature = this.signL1Action(cancelAction, nonce, vaultAddress);
        request['action'] = cancelAction;
        request['signature'] = signature;
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         "status":"err",
        //         "response":"Cannot set scheduled cancel time until enough volume traded. Required: $1000000. Traded: $373.47205."
        //     }
        //
        return response;
    }
    async editOrder(id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#editOrder
         * @description edit a trade order
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-an-order
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
         * @param {string} id cancel order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.timeInForce] 'Gtc', 'Ioc', 'Alo'
         * @param {bool} [params.postOnly] true or false whether the order is post-only
         * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
         * @param {string} [params.vaultAddress] the vault address for order
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        this.checkRequiredCredentials();
        if (id === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' editOrder() requires an id argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        type = type.toUpperCase();
        const isMarket = (type === 'MARKET');
        side = side.toUpperCase();
        const isBuy = (side === 'BUY');
        const defaultSlippage = this.safeString(this.options, 'defaultSlippage');
        const slippage = this.safeString(params, 'slippage', defaultSlippage);
        let defaultTimeInForce = (isMarket) ? 'ioc' : 'gtc';
        const postOnly = this.safeBool(params, 'postOnly', false);
        if (postOnly) {
            defaultTimeInForce = 'alo';
        }
        let timeInForce = this.safeStringLower(params, 'timeInForce', defaultTimeInForce);
        timeInForce = this.capitalize(timeInForce);
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'client_id');
        let triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeString(params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeString(params, 'takeProfitPrice');
        const isTrigger = (stopLossPrice || takeProfitPrice);
        params = this.omit(params, ['slippage', 'timeInForce', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'clientOrderId', 'client_id']);
        let px = price.toString();
        if (isMarket) {
            px = (isBuy) ? Precise["default"].stringMul(price.toString(), Precise["default"].stringAdd('1', slippage)) : Precise["default"].stringMul(price.toString(), Precise["default"].stringSub('1', slippage));
        }
        else {
            px = this.priceToPrecision(symbol, price.toString());
        }
        const sz = this.amountToPrecision(symbol, amount);
        const reduceOnly = this.safeBool(params, 'reduceOnly', false);
        const orderType = {};
        if (isTrigger) {
            let isTp = false;
            if (takeProfitPrice !== undefined) {
                triggerPrice = this.priceToPrecision(symbol, takeProfitPrice);
                isTp = true;
            }
            else {
                triggerPrice = this.priceToPrecision(symbol, stopLossPrice);
            }
            orderType['trigger'] = {
                'isMarket': isMarket,
                'triggerPx': triggerPrice,
                'tpsl': (isTp) ? 'tp' : 'sl',
            };
        }
        else {
            orderType['limit'] = {
                'tif': timeInForce,
            };
        }
        if (triggerPrice === undefined) {
            triggerPrice = '0';
        }
        const nonce = this.milliseconds();
        const orderReq = {
            'a': this.parseToInt(market['baseId']),
            'b': isBuy,
            'p': px,
            's': sz,
            'r': reduceOnly,
            't': orderType,
            // 'c': clientOrderId,
        };
        if (clientOrderId !== undefined) {
            orderReq['c'] = clientOrderId;
        }
        const modifyReq = {
            'oid': this.parseToInt(id),
            'order': orderReq,
        };
        const modifyAction = {
            'type': 'batchModify',
            'modifies': [modifyReq],
        };
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const signature = this.signL1Action(modifyAction, nonce, vaultAddress);
        const request = {
            'action': modifyAction,
            'nonce': nonce,
            'signature': signature,
            // 'vaultAddress': vaultAddress,
        };
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         "status": "ok",
        //         "response": {
        //             "type": "order",
        //             "data": {
        //                 "statuses": [
        //                     {
        //                         "resting": {
        //                             "oid": 5063830287
        //                         }
        //                     }
        //                 ]
        //             }
        //         }
        //     }
        // when the order is filled immediately
        //     {
        //         "status":"ok",
        //         "response":{
        //            "type":"order",
        //            "data":{
        //               "statuses":[
        //                  {
        //                     "filled":{
        //                        "totalSz":"0.1",
        //                        "avgPx":"100.84",
        //                        "oid":6195281425
        //                     }
        //                  }
        //               ]
        //            }
        //         }
        //     }
        //
        const responseObject = this.safeDict(response, 'response', {});
        const dataObject = this.safeDict(responseObject, 'data', {});
        const statuses = this.safeList(dataObject, 'statuses', []);
        const first = this.safeDict(statuses, 0, {});
        return this.parseOrder(first, market);
    }
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-historical-funding-rates
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest funding rate
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'type': 'fundingHistory',
            'coin': market['base'],
        };
        if (since !== undefined) {
            request['startTime'] = since;
        }
        else {
            request['startTime'] = this.milliseconds() - 100 * 60 * 60 * 1000;
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "coin": "ETH",
        //             "fundingRate": "0.0000125",
        //             "premium": "0.00057962",
        //             "time": 1704290400031
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeInteger(entry, 'time');
            result.push({
                'info': entry,
                'symbol': this.safeSymbol(undefined, market),
                'fundingRate': this.safeNumber(entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(result, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] user address, will default to this.walletAddress if not provided
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchOpenOrders', params);
        await this.loadMarkets();
        const market = this.safeMarket(symbol);
        const request = {
            'type': 'openOrders',
            'user': userAddress,
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "coin": "ETH",
        //             "limitPx": "2000.0",
        //             "oid": 3991946565,
        //             "origSz": "0.1",
        //             "side": "B",
        //             "sz": "0.1",
        //             "timestamp": 1704346468838
        //         }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchClosedOrders
         * @description fetch all unfilled currently closed orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] user address, will default to this.walletAddress if not provided
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchClosedOrders', params);
        await this.loadMarkets();
        const market = this.safeMarket(symbol);
        const request = {
            'type': 'historicalOrders',
            'user': userAddress,
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "coin": "ETH",
        //             "limitPx": "2000.0",
        //             "oid": 3991946565,
        //             "origSz": "0.1",
        //             "side": "B",
        //             "sz": "0.1",
        //             "timestamp": 1704346468838
        //         }
        //     ]
        //
        return this.parseOrders(response, market, since, limit);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] user address, will default to this.walletAddress if not provided
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchOrder', params);
        await this.loadMarkets();
        const market = this.safeMarket(symbol);
        const request = {
            'type': 'orderStatus',
            'oid': this.parseToNumeric(id),
            'user': userAddress,
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     {
        //         "order": {
        //             "order": {
        //                 "children": [],
        //                 "cloid": null,
        //                 "coin": "ETH",
        //                 "isPositionTpsl": false,
        //                 "isTrigger": false,
        //                 "limitPx": "2000.0",
        //                 "oid": "3991946565",
        //                 "orderType": "Limit",
        //                 "origSz": "0.1",
        //                 "reduceOnly": false,
        //                 "side": "B",
        //                 "sz": "0.1",
        //                 "tif": "Gtc",
        //                 "timestamp": "1704346468838",
        //                 "triggerCondition": "N/A",
        //                 "triggerPx": "0.0"
        //             },
        //             "status": "open",
        //             "statusTimestamp": "1704346468838"
        //         },
        //         "status": "order"
        //     }
        //
        const data = this.safeDict(response, 'order');
        return this.parseOrder(data, market);
    }
    parseOrder(order, market = undefined) {
        //
        //  fetchOpenOrders
        //
        //     {
        //         "coin": "ETH",
        //         "limitPx": "2000.0",
        //         "oid": 3991946565,
        //         "origSz": "0.1",
        //         "side": "B",
        //         "sz": "0.1",
        //         "timestamp": 1704346468838
        //     }
        // fetchClosedorders
        //    {
        //        "cloid": null,
        //        "closedPnl": "0.0",
        //        "coin": "SOL",
        //        "crossed": true,
        //        "dir": "Open Long",
        //        "fee": "0.003879",
        //        "hash": "0x4a2647998682b7f07bc5040ab531e1011400f9a51bfa0346a0b41ebe510e8875",
        //        "liquidationMarkPx": null,
        //        "oid": "6463280784",
        //        "px": "110.83",
        //        "side": "B",
        //        "startPosition": "1.64",
        //        "sz": "0.1",
        //        "tid": "232174667018988",
        //        "time": "1709142268394"
        //    }
        //
        //  fetchOrder
        //
        //     {
        //         "order": {
        //             "children": [],
        //             "cloid": null,
        //             "coin": "ETH",
        //             "isPositionTpsl": false,
        //             "isTrigger": false,
        //             "limitPx": "2000.0",
        //             "oid": "3991946565",
        //             "orderType": "Limit",
        //             "origSz": "0.1",
        //             "reduceOnly": false,
        //             "side": "B",
        //             "sz": "0.1",
        //             "tif": "Gtc",
        //             "timestamp": "1704346468838",
        //             "triggerCondition": "N/A",
        //             "triggerPx": "0.0"
        //         },
        //         "status": "open",
        //         "statusTimestamp": "1704346468838"
        //     }
        //
        // createOrder
        //
        //     {
        //         "resting": {
        //             "oid": 5063830287
        //         }
        //     }
        //
        //     {
        //        "filled":{
        //           "totalSz":"0.1",
        //           "avgPx":"100.84",
        //           "oid":6195281425
        //        }
        //     }
        //
        let entry = this.safeDictN(order, ['order', 'resting', 'filled']);
        if (entry === undefined) {
            entry = order;
        }
        const coin = this.safeString(entry, 'coin');
        let marketId = undefined;
        if (coin !== undefined) {
            if (coin.indexOf('/') > -1) {
                marketId = coin;
            }
            else {
                marketId = coin + '/USDC:USDC';
            }
        }
        if (this.safeString(entry, 'id') === undefined) {
            market = this.safeMarket(marketId, undefined);
        }
        else {
            market = this.safeMarket(marketId, market);
        }
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2(order, 'timestamp', 'statusTimestamp');
        const status = this.safeString(order, 'status');
        let side = this.safeString(entry, 'side');
        if (side !== undefined) {
            side = (side === 'A') ? 'sell' : 'buy';
        }
        return this.safeOrder({
            'info': order,
            'id': this.safeString(entry, 'oid'),
            'clientOrderId': this.safeString(entry, 'cloid'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': symbol,
            'type': this.safeStringLower(entry, 'orderType'),
            'timeInForce': this.safeStringUpper(entry, 'tif'),
            'postOnly': undefined,
            'reduceOnly': this.safeBool(entry, 'reduceOnly'),
            'side': side,
            'price': this.safeNumber(entry, 'limitPx'),
            'triggerPrice': this.safeBool(entry, 'isTrigger') ? this.safeNumber(entry, 'triggerPx') : undefined,
            'amount': this.safeNumber2(entry, 'sz', 'totalSz'),
            'cost': undefined,
            'average': this.safeNumber(entry, 'avgPx'),
            'filled': undefined,
            'remaining': undefined,
            'status': this.parseOrderStatus(status),
            'fee': undefined,
            'trades': undefined,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'triggered': 'open',
            'filled': 'closed',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(status) {
        const statuses = {
            'stop limit': 'limit',
            'stop market': 'market',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchMyTrades', params);
        await this.loadMarkets();
        const market = this.safeMarket(symbol);
        const request = {
            'user': userAddress,
        };
        if (since !== undefined) {
            request['type'] = 'userFillsByTime';
            request['startTime'] = since;
        }
        else {
            request['type'] = 'userFills';
        }
        const until = this.safeInteger(params, 'until');
        params = this.omit(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     [
        //         {
        //             "closedPnl": "0.19343",
        //             "coin": "ETH",
        //             "crossed": true,
        //             "dir": "Close Long",
        //             "fee": "0.050062",
        //             "hash": "0x09d77c96791e98b5775a04092584ab010d009445119c71e4005c0d634ea322bc",
        //             "liquidationMarkPx": null,
        //             "oid": 3929354691,
        //             "px": "2381.1",
        //             "side": "A",
        //             "startPosition": "0.0841",
        //             "sz": "0.0841",
        //             "tid": 128423918764978,
        //             "time": 1704262888911
        //         }
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        //     {
        //         "closedPnl": "0.19343",
        //         "coin": "ETH",
        //         "crossed": true,
        //         "dir": "Close Long",
        //         "fee": "0.050062",
        //         "hash": "0x09d77c96791e98b5775a04092584ab010d009445119c71e4005c0d634ea322bc",
        //         "liquidationMarkPx": null,
        //         "oid": 3929354691,
        //         "px": "2381.1",
        //         "side": "A",
        //         "startPosition": "0.0841",
        //         "sz": "0.0841",
        //         "tid": 128423918764978,
        //         "time": 1704262888911
        //     }
        //
        const timestamp = this.safeInteger(trade, 'time');
        const price = this.safeString(trade, 'px');
        const amount = this.safeString(trade, 'sz');
        const coin = this.safeString(trade, 'coin');
        const marketId = coin + '/USDC:USDC';
        market = this.safeMarket(marketId, undefined);
        const symbol = market['symbol'];
        const id = this.safeString(trade, 'tid');
        let side = this.safeString(trade, 'side');
        if (side !== undefined) {
            side = (side === 'A') ? 'sell' : 'buy';
        }
        const fee = this.safeString(trade, 'fee');
        return this.safeTrade({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'id': id,
            'order': this.safeString(trade, 'oid'),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': { 'cost': fee, 'currency': 'USDC' },
        }, market);
    }
    async fetchPosition(symbol, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchPosition
         * @description fetch data on an open position
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-state
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] user address, will default to this.walletAddress if not provided
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        const positions = await this.fetchPositions([symbol], params);
        return this.safeDict(positions, 0, {});
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#fetchPositions
         * @description fetch all open positions
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-state
         * @param {string[]} [symbols] list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.user] user address, will default to this.walletAddress if not provided
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets();
        let userAddress = undefined;
        [userAddress, params] = this.handlePublicAddress('fetchPositions', params);
        symbols = this.marketSymbols(symbols);
        const request = {
            'type': 'clearinghouseState',
            'user': userAddress,
        };
        const response = await this.publicPostInfo(this.extend(request, params));
        //
        //     {
        //         "assetPositions": [
        //             {
        //                 "position": {
        //                     "coin": "ETH",
        //                     "cumFunding": {
        //                         "allTime": "0.0",
        //                         "sinceChange": "0.0",
        //                         "sinceOpen": "0.0"
        //                     },
        //                     "entryPx": "2213.9",
        //                     "leverage": {
        //                         "rawUsd": "-475.23904",
        //                         "type": "isolated",
        //                         "value": "20"
        //                     },
        //                     "liquidationPx": "2125.00856238",
        //                     "marginUsed": "24.88097",
        //                     "maxLeverage": "50",
        //                     "positionValue": "500.12001",
        //                     "returnOnEquity": "0.0",
        //                     "szi": "0.2259",
        //                     "unrealizedPnl": "0.0"
        //                 },
        //                 "type": "oneWay"
        //             }
        //         ],
        //         "crossMaintenanceMarginUsed": "0.0",
        //         "crossMarginSummary": {
        //             "accountValue": "100.0",
        //             "totalMarginUsed": "0.0",
        //             "totalNtlPos": "0.0",
        //             "totalRawUsd": "100.0"
        //         },
        //         "marginSummary": {
        //             "accountValue": "100.0",
        //             "totalMarginUsed": "0.0",
        //             "totalNtlPos": "0.0",
        //             "totalRawUsd": "100.0"
        //         },
        //         "time": "1704261007014",
        //         "withdrawable": "100.0"
        //     }
        //
        const data = this.safeList(response, 'assetPositions', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            result.push(this.parsePosition(data[i], undefined));
        }
        return this.filterByArrayPositions(result, 'symbol', symbols, false);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "position": {
        //             "coin": "ETH",
        //             "cumFunding": {
        //                 "allTime": "0.0",
        //                 "sinceChange": "0.0",
        //                 "sinceOpen": "0.0"
        //             },
        //             "entryPx": "2213.9",
        //             "leverage": {
        //                 "rawUsd": "-475.23904",
        //                 "type": "isolated",
        //                 "value": "20"
        //             },
        //             "liquidationPx": "2125.00856238",
        //             "marginUsed": "24.88097",
        //             "maxLeverage": "50",
        //             "positionValue": "500.12001",
        //             "returnOnEquity": "0.0",
        //             "szi": "0.2259",
        //             "unrealizedPnl": "0.0"
        //         },
        //         "type": "oneWay"
        //     }
        //
        const entry = this.safeDict(position, 'position', {});
        const coin = this.safeString(entry, 'coin');
        const marketId = coin + '/USDC:USDC';
        market = this.safeMarket(marketId, undefined);
        const symbol = market['symbol'];
        const leverage = this.safeDict(entry, 'leverage', {});
        const isIsolated = (this.safeString(leverage, 'type') === 'isolated');
        const quantity = this.safeNumber(leverage, 'rawUsd');
        let side = undefined;
        if (quantity !== undefined) {
            side = (quantity > 0) ? 'short' : 'long';
        }
        const unrealizedPnl = this.safeNumber(entry, 'unrealizedPnl');
        const initialMargin = this.safeNumber(entry, 'marginUsed');
        const percentage = unrealizedPnl / initialMargin * 100;
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'isolated': isIsolated,
            'hedged': undefined,
            'side': side,
            'contracts': this.safeNumber(entry, 'szi'),
            'contractSize': undefined,
            'entryPrice': this.safeNumber(entry, 'entryPx'),
            'markPrice': undefined,
            'notional': this.safeNumber(entry, 'positionValue'),
            'leverage': this.safeNumber(leverage, 'value'),
            'collateral': undefined,
            'initialMargin': initialMargin,
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': unrealizedPnl,
            'liquidationPrice': this.safeNumber(entry, 'liquidationPx'),
            'marginMode': undefined,
            'percentage': percentage,
        });
    }
    async setMarginMode(marginMode, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#setMarginMode
         * @description set margin mode (symbol)
         * @param {string} marginMode margin mode must be either [isolated, cross]
         * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.leverage] the rate of leverage, is required if setting trade mode (symbol)
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const leverage = this.safeInteger(params, 'leverage');
        if (leverage === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setMarginMode() requires a leverage parameter');
        }
        const asset = this.parseToInt(market['baseId']);
        const isCross = (marginMode === 'cross');
        const nonce = this.milliseconds();
        params = this.omit(params, ['leverage']);
        const updateAction = {
            'type': 'updateLeverage',
            'asset': asset,
            'isCross': isCross,
            'leverage': leverage,
        };
        let vaultAddress = this.safeString(params, 'vaultAddress');
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            if (vaultAddress.startsWith('0x')) {
                vaultAddress = vaultAddress.replace('0x', '');
            }
        }
        const extendedAction = this.extend(updateAction, params);
        const signature = this.signL1Action(extendedAction, nonce, vaultAddress);
        const request = {
            'action': extendedAction,
            'nonce': nonce,
            'signature': signature,
            // 'vaultAddress': vaultAddress,
        };
        if (vaultAddress !== undefined) {
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(request);
        //
        //     {
        //         'response': {
        //             'type': 'default'
        //         },
        //         'status': 'ok'
        //     }
        //
        return response;
    }
    async setLeverage(leverage, symbol = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#setLeverage
         * @description set the level of leverage for a market
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] margin mode must be either [isolated, cross], default is cross
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const marginMode = this.safeString(params, 'marginMode', 'cross');
        const isCross = (marginMode === 'cross');
        const asset = this.parseToInt(market['baseId']);
        const nonce = this.milliseconds();
        params = this.omit(params, 'marginMode');
        const updateAction = {
            'type': 'updateLeverage',
            'asset': asset,
            'isCross': isCross,
            'leverage': leverage,
        };
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const signature = this.signL1Action(updateAction, nonce, vaultAddress);
        const request = {
            'action': updateAction,
            'nonce': nonce,
            'signature': signature,
            // 'vaultAddress': vaultAddress,
        };
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         'response': {
        //             'type': 'default'
        //         },
        //         'status': 'ok'
        //     }
        //
        return response;
    }
    async addMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name hyperliquid#addMargin
         * @description add margin
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'add', params);
    }
    async reduceMargin(symbol, amount, params = {}) {
        /**
         * @method
         * @name hyperliquid#reduceMargin
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
         * @description remove margin from a position
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper(symbol, amount, 'reduce', params);
    }
    async modifyMarginHelper(symbol, amount, type, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const asset = this.parseToInt(market['baseId']);
        let sz = this.parseToInt(Precise["default"].stringMul(this.amountToPrecision(symbol, amount), '1000000'));
        if (type === 'reduce') {
            sz = -sz;
        }
        const nonce = this.milliseconds();
        const updateAction = {
            'type': 'updateIsolatedMargin',
            'asset': asset,
            'isBuy': true,
            'ntli': sz,
        };
        const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
        const signature = this.signL1Action(updateAction, nonce, vaultAddress);
        const request = {
            'action': updateAction,
            'nonce': nonce,
            'signature': signature,
            // 'vaultAddress': vaultAddress,
        };
        if (vaultAddress !== undefined) {
            params = this.omit(params, 'vaultAddress');
            request['vaultAddress'] = vaultAddress;
        }
        const response = await this.privatePostExchange(this.extend(request, params));
        //
        //     {
        //         'response': {
        //             'type': 'default'
        //         },
        //         'status': 'ok'
        //     }
        //
        return this.extend(this.parseMarginModification(response, market), {
            'code': this.safeString(response, 'status'),
        });
    }
    parseMarginModification(data, market = undefined) {
        //
        //    {
        //        'type': 'default'
        //    }
        //
        return {
            'info': data,
            'symbol': this.safeSymbol(undefined, market),
            'type': undefined,
            'marginMode': 'isolated',
            'amount': undefined,
            'total': undefined,
            'code': this.safeString(market, 'settle'),
            'status': undefined,
            'timestamp': undefined,
            'datetime': undefined,
        };
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name hyperliquid#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from *spot, swap*
         * @param {string} toAccount account to transfer to *swap, spot or address*
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.vaultAddress] the vault address for order
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        this.checkRequiredCredentials();
        await this.loadMarkets();
        const isSandboxMode = this.safeBool(this.options, 'sandboxMode');
        const nonce = this.milliseconds();
        if (this.inArray(fromAccount, ['spot', 'swap', 'perp'])) {
            // handle swap <> spot account transfer
            if (!this.inArray(toAccount, ['spot', 'swap', 'perp'])) {
                throw new errors.NotSupported(this.id + 'transfer() only support spot <> swap transfer');
            }
            const vaultAddress = this.formatVaultAddress(this.safeString(params, 'vaultAddress'));
            params = this.omit(params, 'vaultAddress');
            const toPerp = (toAccount === 'perp') || (toAccount === 'swap');
            const action = {
                'type': 'spotUser',
                'classTransfer': {
                    'usdc': amount,
                    'toPerp': toPerp,
                },
            };
            const signature = this.signL1Action(action, nonce, vaultAddress);
            const innerRequest = {
                'action': this.extend(action, params),
                'nonce': nonce,
                'signature': signature,
            };
            if (vaultAddress !== undefined) {
                innerRequest['vaultAddress'] = vaultAddress;
            }
            const transferResponse = await this.privatePostExchange(innerRequest);
            return transferResponse;
        }
        // handle sub-account/different account transfer
        this.checkAddress(toAccount);
        if (code !== undefined) {
            code = code.toUpperCase();
            if (code !== 'USDC') {
                throw new errors.NotSupported(this.id + 'withdraw() only support USDC');
            }
        }
        const payload = {
            'destination': toAccount,
            'amount': this.numberToString(amount),
            'time': nonce,
        };
        const sig = this.buildTransferSig(payload);
        const request = {
            'action': {
                'chain': (isSandboxMode) ? 'ArbitrumTestnet' : 'Arbitrum',
                'payload': payload,
                'type': 'usdTransfer',
            },
            'nonce': nonce,
            'signature': sig,
        };
        const response = await this.privatePostExchange(this.extend(request, params));
        return response;
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name hyperliquid#withdraw
         * @description make a withdrawal (only support USDC)
         * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        this.checkRequiredCredentials();
        await this.loadMarkets();
        this.checkAddress(address);
        if (code !== undefined) {
            code = code.toUpperCase();
            if (code !== 'USDC') {
                throw new errors.NotSupported(this.id + 'withdraw() only support USDC');
            }
        }
        const isSandboxMode = this.safeBool(this.options, 'sandboxMode');
        const nonce = this.milliseconds();
        const payload = {
            'destination': address,
            'usd': amount.toString(),
            'time': nonce,
        };
        const sig = this.buildWithdrawSig(payload);
        const request = {
            'action': {
                'chain': (isSandboxMode) ? 'ArbitrumTestnet' : 'Arbitrum',
                'payload': payload,
                'type': 'withdraw2',
            },
            'nonce': nonce,
            'signature': sig,
        };
        const response = await this.privatePostExchange(this.extend(request, params));
        return response;
    }
    formatVaultAddress(address = undefined) {
        if (address === undefined) {
            return undefined;
        }
        if (address.startsWith('0x')) {
            return address.replace('0x', '');
        }
        return address;
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
        throw new errors.ArgumentsRequired(this.id + ' ' + methodName + '() requires a user parameter inside \'params\' or the wallet address set');
    }
    coinToMarketId(coin) {
        if (coin.indexOf('/') > -1) {
            return coin; // spot
        }
        return coin + '/USDC:USDC';
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        // {"status":"err","response":"User or API Wallet 0xb8a6f8b26223de27c31938d56e470a5b832703a5 does not exist."}
        //
        //     {
        //         status: 'ok',
        //         response: { type: 'order', data: { statuses: [ { error: 'Insufficient margin to place order. asset=4' } ] } }
        //     }
        //
        const status = this.safeString(response, 'status', '');
        let message = undefined;
        if (status === 'err') {
            message = this.safeString(response, 'response');
        }
        else {
            const responsePayload = this.safeDict(response, 'response', {});
            const data = this.safeDict(responsePayload, 'data', {});
            const statuses = this.safeList(data, 'statuses', []);
            const firstStatus = this.safeDict(statuses, 0);
            message = this.safeString(firstStatus, 'error');
        }
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException(this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
        }
        if (nonEmptyMessage) {
            throw new errors.ExchangeError(feedback); // unknown message
        }
        return undefined;
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const url = this.implodeHostname(this.urls['api'][api]) + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json(params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}

module.exports = hyperliquid;
