import { Precise } from 'ccxt';
import Exchange from './abstract/bitteam.js';
// import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidAddress, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, PermissionDenied } from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
// import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Int, Market, Order, OrderBook, Str, Ticker } from './base/types.js';

/**
 * @class bitteam
 * @extends Exchange
 */
export default class bitteam extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitteam',
            'name': 'BitTeam', // todo: check
            'countries': [ 'UK', 'RU' ], // todo: check
            'version': 'v1', // todo: check
            'rateLimit': 1, // has no rate limiter
            'certified': false,
            'pro': false,
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
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFee': false, // todo
                'fetchDepositWithdrawFees': false, // todo
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
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': true,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false, // todo
                'fetchTradingFee': false, // todo
                'fetchTradingFees': false, // todo
                'fetchTradingLimits': false, // todo
                'fetchTransactionFee': false, // todo
                'fetchTransactionFees': false, // todo
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
                // todo
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://bit.team',
                    'private': 'https://bit.team',
                },
                'www': 'https://bit.team/',
                'doc': [
                    'https://bit.team/trade/api/documentation',
                ],
                'fees': '', // todo
            },
            'api': {
                'public': {
                    'get': {
                        'trade/api/asset': 1, // not unified
                        'trade/api/currencies': 1,
                        'trade/api/login-confirmation': 1, // not unified
                        'trade/api/orderbooks/{symbol}': 1,
                        'trade/api/orders': 1,
                        'trade/api/pair/{name}': 1, // todo: fetchTicker?
                        'trade/api/pairs': 1,
                        'trade/api/pairs/precisions': 1, // not unified
                        'trade/api/rates': 1, // not unified
                        'trade/api/stats': 1, // not unified
                        'trade/api/trade/{id}': 1, // not unified
                        'trade/api/trades': 1, // todo: fetchTrades
                        'trade/api/transaction/{id}': 1, // todo: ? looks like a private endpoint
                    },
                    'post': {
                        'trade/api/login-oauth': 1, // not unified
                        'trade/api/reset-password': 1, // not unified
                    },
                },
                'private': {
                    'get': {
                        'trade/api/get-session-status': 1,
                    },
                    'post': {
                    },
                    'delete': {
                    },
                },
            },
            'fees': {
                'trading': {
                    // todo
                },
            },
            'precisionMode': DECIMAL_PLACES, // todo: check
            // exchange-specific options
            'options': {
                'networksById': {
                    'Ethereum': 'ERC20',
                    'ethereum': 'ERC20',
                    'Tron': 'TRC20',
                    'tron': 'TRC20',
                    'Binance': 'BSC',
                    'binance': 'BSC',
                    'Binance Smart Chain': 'BSC',
                    'bscscan': 'BSC',
                    'Bitcoin': 'BTC',
                    'bitcoin': 'BTC',
                    'Litecoin': 'LTC',
                    'litecoin': 'LTC',
                    'Polygon': 'POLYGON',
                    'polygon': 'POLYGON',
                    'PRIZM': 'PRIZM',
                    'Decimal': 'Decimal', // todo: check
                    'ufobject': 'ufobject', // todo: check
                    'tonchain': 'tonchain', // todo: check
                },
            },
            'exceptions': {
                // todo
                'exact': {
                },
                'broad': {
                },
            },
        });
    }

    calculateRateLimiterCost (api, method, path, params, config = {}) {
        return 1;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name bitteam#fetchMarkets
         * @description retrieves data on all markets for bitteam
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairs
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetTradeApiPairs (params);
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "count": 28,
        //             "pairs": [
        //                 {
        //                     "id": 2,
        //                     "name": "eth_usdt",
        //                     "baseAssetId": 2,
        //                     "quoteAssetId": 3,
        //                     "fullName": "ETH USDT",
        //                     "description": "ETH   USDT",
        //                     "lastBuy": 1964.665001,
        //                     "lastSell": 1959.835005,
        //                     "lastPrice": 1964.665001,
        //                     "change24": 1.41,
        //                     "volume24": 28.22627543,
        //                     "volume24USD": 55662.35636401598,
        //                     "active": true,
        //                     "baseStep": 8,
        //                     "quoteStep": 6,
        //                     "status": 1,
        //                     "settings": {
        //                         "limit_usd": "0.1",
        //                         "price_max": "10000000000000",
        //                         "price_min": "1",
        //                         "price_tick": "1",
        //                         "pricescale": 10000,
        //                         "lot_size_max": "1000000000000000",
        //                         "lot_size_min": "1",
        //                         "lot_size_tick": "1",
        //                         "price_view_min": 6,
        //                         "default_slippage": 10,
        //                         "lot_size_view_min": 6
        //                     },
        //                     "updateId": "50620",
        //                     "timeStart": "2021-01-28T09:19:30.706Z",
        //                     "makerFee": 200,
        //                     "takerFee": 200,
        //                     "quoteVolume24": 54921.93404134529,
        //                     "lowPrice24": 1919.355,
        //                     "highPrice24": 1971.204995
        //                 },
        //                 {
        //                     "id": 27,
        //                     "name": "ltc_usdt",
        //                     "baseAssetId": 13,
        //                     "quoteAssetId": 3,
        //                     "fullName": "LTC USDT",
        //                     "description": "This is LTC USDT",
        //                     "lastBuy": 53.14,
        //                     "lastSell": 53.58,
        //                     "lastPrice": 53.58,
        //                     "change24": -6.72,
        //                     "volume24": 0,
        //                     "volume24USD": null,
        //                     "active": true,
        //                     "baseStep": 8,
        //                     "quoteStep": 6,
        //                     "status": 0,
        //                     "settings": {
        //                         "limit_usd": "0.1",
        //                         "price_max": "1000000000000",
        //                         "price_min": "1",
        //                         "price_tick": "1",
        //                         "pricescale": 10000,
        //                         "lot_size_max": "1000000000000",
        //                         "lot_size_min": "1",
        //                         "lot_size_tick": "1",
        //                         "price_view_min": 6,
        //                         "default_slippage": 10,
        //                         "lot_size_view_min": 6
        //                     },
        //                     "updateId": "30",
        //                     "timeStart": "2021-10-13T12:11:05.359Z",
        //                     "makerFee": 200,
        //                     "takerFee": 200,
        //                     "quoteVolume24": 0,
        //                     "lowPrice24": null,
        //                     "highPrice24": null
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const markets = this.safeValue (result, 'pairs', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'name');
        const numericId = this.safeNumber (market, 'id');
        const parts = id.split ('_');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const active = this.safeValue (market, 'active');
        const amountPrecision = this.safeNumber (market, 'baseStep');
        const pricePrecision = this.safeNumber (market, 'quoteStep');
        // const limits = this.safeValue (market, 'settings', {});
        // const maxPrice = this.parseNumber (this.safeString (limits, 'price_max'));
        // const minPrice = this.parseNumber (this.safeString (limits, 'price_min'));
        return {
            'id': id,
            'numericId': numericId,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amountPrecision,
                'price': pricePrecision,
            },
            // todo: check limits
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
            'created': undefined, // todo: check
            'info': market,
        };
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name bitteam#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiCurrencies
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetTradeApiCurrencies (params);
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "count": 24,
        //             "currencies": [
        //                 {
        //                     "txLimits": {
        //                         "minDeposit": "0.0001",
        //                         "minWithdraw": "0.02",
        //                         "maxWithdraw": "10000",
        //                         "withdrawCommissionPercentage": "NaN",
        //                         "withdrawCommissionFixed": "0.005"
        //                     },
        //                     "id": 2,
        //                     "status": 1,
        //                     "symbol": "eth",
        //                     "title": "Ethereum",
        //                     "logoURL": "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/34ca5/eth-diamond-black.png",
        //                     "isDiscount": false,
        //                     "address": "https://ethereum.org/",
        //                     "description": "Ethereum ETH",
        //                     "decimals": 18,
        //                     "blockChain": "Ethereum",
        //                     "precision": 8,
        //                     "currentRate": null,
        //                     "active": true,
        //                     "timeStart": "2021-01-28T08:57:41.719Z",
        //                     "type": "crypto",
        //                     "typeNetwork": "internalGW",
        //                     "idSorting": 2,
        //                     "links": [
        //                         {
        //                             "tx": "https://etherscan.io/tx/",
        //                             "address": "https://etherscan.io/address/",
        //                             "blockChain": "Ethereum"
        //                         }
        //                     ]
        //                 },
        //                 {
        //                     "txLimits": {
        //                         "minDeposit": "0.001",
        //                         "minWithdraw": "1",
        //                         "maxWithdraw": "100000",
        //                         "withdrawCommissionPercentage": "NaN",
        //                         "withdrawCommissionFixed": {
        //                             "Tron": "2",
        //                             "Binance": "2",
        //                             "Ethereum": "20"
        //                         }
        //                     },
        //                     "id": 3,
        //                     "status": 1,
        //                     "symbol": "usdt",
        //                     "title": "Tether USD",
        //                     "logoURL": "https://cryptologos.cc/logos/tether-usdt-logo.png?v=010",
        //                     "isDiscount": false,
        //                     "address": "https://tether.to/",
        //                     "description": "Tether USD",
        //                     "decimals": 6,
        //                     "blockChain": "",
        //                     "precision": 6,
        //                     "currentRate": null,
        //                     "active": true,
        //                     "timeStart": "2021-01-28T09:04:17.170Z",
        //                     "type": "crypto",
        //                     "typeNetwork": "internalGW",
        //                     "idSorting": 0,
        //                     "links": [
        //                         {
        //                             "tx": "https://etherscan.io/tx/",
        //                             "address": "https://etherscan.io/address/",
        //                             "blockChain": "Ethereum"
        //                         },
        //                         {
        //                             "tx": "https://tronscan.org/#/transaction/",
        //                             "address": "https://tronscan.org/#/address/",
        //                             "blockChain": "Tron"
        //                         },
        //                         {
        //                             "tx": "https://bscscan.com/tx/",
        //                             "address": "https://bscscan.com/address/",
        //                             "blockChain": "Binance"
        //                         }
        //                     ]
        //                 }
        //             ]
        //         }
        //     }
        //
        const responseResult = this.safeValue (response, 'result', {});
        const currencies = this.safeValue (responseResult, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const numericId = this.safeNumber (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const active = this.safeValue (currency, 'active', false);
            const decimalPlaces = this.safeString (currency, 'decimal_places');
            const precision = this.parseNumber (this.parsePrecision (decimalPlaces));
            const txLimits = this.safeValue (currency, 'txLimits', {});
            const minWithdraw = this.safeString (txLimits, 'minWithdraw');
            const maxWithdraw = this.safeString (txLimits, 'maxWithdraw');
            const minDeposit = this.safeString (txLimits, 'minDeposit');
            const withdrawLimits = {
                'min': this.parseNumber (minWithdraw),
                'max': this.parseNumber (maxWithdraw),
            };
            let fee = undefined;
            // todo: fee is fixed?
            const withdrawCommissionFixed = this.safeValue (txLimits, 'withdrawCommissionFixed', {}) as any;
            let networkFeesById = {};
            const blockChain = this.safeString (currency, 'blockChain');
            // if only one blockChain
            if ((blockChain !== undefined) || (blockChain !== '')) {
                fee = this.parseNumber (withdrawCommissionFixed);
                networkFeesById[blockChain] = fee;
            } else {
                networkFeesById = withdrawCommissionFixed;
            }
            const networkIds = Object.keys (networkFeesById);
            const networks = {};
            for (let j = 0; j < networkIds.length; j++) {
                const networkId = networkIds[j];
                const networkCode = this.networkIdToCode (networkId);
                // todo: check all networkIds for unified codes
                const networkFee = this.safeNumber (networkFeesById, networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'deposit': undefined, // todo: check
                    'withdraw': undefined, // todo: check
                    'active': active,
                    'fee': networkFee,
                    'precision': undefined, // todo: check
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': withdrawLimits,
                        'deposit': {
                            'min': this.parseNumber (minDeposit),
                            'max': undefined,
                        },
                    },
                    'info': currency,
                };
            }
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'name': code,
                'info': currency,
                'active': active,
                'deposit': undefined, // todo: check
                'withdraw': undefined, // todo: check
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': withdrawLimits,
                },
                'networks': networks,
            };
        }
        return result;
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitteam#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiOrderbooksSymbol
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradeApiOrderbooksSymbol (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "result":  {
        //             "bids": [
        //                 ["1951.764988", "0.09656137"],
        //                 ["1905.472973", "0.00263591"],
        //                 ["1904.274973", "0.09425304"]
        //             ],
        //             "asks": [
        //                 ["1951.765013", "0.09306902"],
        //                 ["2010.704988", "0.00127892"],
        //                 ["2010.9875", "0.00024893"]
        //             ],
        //             "symbol": "ETH/USDT"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const orderbook = this.parseOrderBook (result, symbol);
        return orderbook;
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name bitteam#fetchOrders
         * @description fetches information on multiple orders
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiOrders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        const request = {};
        // todo: check offset and order
        // also filtration by symbol breaks pagination
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetTradeApiOrders (this.extend (request, params));
        //
        //     {
        //         "ok":true,
        //         "result":
        //         {
        //             "count": 43873,
        //             "orders": [
        //                 {
        //                     "id": 106361856,
        //                     "orderId": "13191647",
        //                     "userId": 15913,
        //                     "pair": "eth_usdt",
        //                     "pairId": 2,
        //                     "quantity": 97110810000000000,
        //                     "price": 1953044988,
        //                     "executedPrice": 0,
        //                     "orderCid": null,
        //                     "executed": 0,
        //                     "expires": null,
        //                     "baseDecimals": 18,
        //                     "quoteDecimals": 6,
        //                     "timestamp": 1700394513,
        //                     "status": "cancelled",
        //                     "side": "buy",
        //                     "type": "limit",
        //                     "stopPrice": null,
        //                     "slippage": null
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const orders = this.safeValue (result, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // fetchOrders
        //     {
        //         "id": 106361856,
        //         "orderId": "13191647",
        //         "userId": 15913,
        //         "pair": "eth_usdt",
        //         "pairId": 2,
        //         "quantity": 97110810000000000,
        //         "price": 1953044988,
        //         "executedPrice": 0,
        //         "orderCid": null,
        //         "executed": 0,
        //         "expires": null,
        //         "baseDecimals": 18,
        //         "quoteDecimals": 6,
        //         "timestamp": 1700394513,
        //         "status": "cancelled",
        //         "side": "buy",
        //         "type": "limit",
        //         "stopPrice": null,
        //         "slippage": null
        //     }
        //
        const id = this.safeString (order, 'orderId');
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market);
        const clientOrderId = this.safeString (order, 'orderCid'); // todo: check
        const timestamp = this.safeTimestamp (order, 'timestamp');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const type = this.parseOrderType (this.safeString (order, 'type'));
        const side = this.safeString (order, 'side');
        // todo: check prices and amount
        const quotePrecisionString = this.parsePrecision (this.safeString (order, 'quoteDecimals'));
        const priceRawString = this.safeString (order, 'price');
        const price = Precise.stringMul (quotePrecisionString, priceRawString);
        const stopPriceRawString = this.safeString (order, 'stopPrice');
        const stopPrice = Precise.stringMul (quotePrecisionString, stopPriceRawString);
        const basePrecisionString = this.parsePrecision (this.safeString (order, 'baseDecimals'));
        const amountRawString = this.safeString (order, 'quantity');
        const amount = Precise.stringMul (basePrecisionString, amountRawString);
        const filledRawString = this.safeString (order, 'executed');
        const filled = Precise.stringMul (basePrecisionString, filledRawString);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': market['symbol'],
            'type': type,
            'timeInForce': 'GTC',
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'triggerPrice': stopPrice,
            'average': undefined,
            'amount': amount,
            'cost': undefined,
            'filled': filled,
            'remaining': undefined,
            'fee': undefined,
            'trades': undefined,
            'info': order,
            'postOnly': undefined,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'accepted': 'open',
            'executed': 'closed',
            'cancelled': 'canceled',
            'partiallyCancelled': 'canceled',
            'delete': 'rejected', // todo: check
            'executing': 'open', // todo: check
            'created': 'open', // todo: check
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (status) {
        const statuses = {
            'market': 'market',
            'limit': 'limit',
            'conditional': 'limit',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name bitteam#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairName
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'name': market['id'],
        };
        const response = await this.publicGetTradeApiPairName (this.extend (request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "pair": {
        //                 "id": 2,
        //                 "name": "eth_usdt",
        //                 "baseAssetId": 2,
        //                 "quoteAssetId": 3,
        //                 "fullName": "ETH USDT",
        //                 "description": "ETH   USDT",
        //                 "lastBuy": "1976.715012",
        //                 "lastSell": "1971.995006",
        //                 "lastPrice": "1976.715012",
        //                 "change24": "1.02",
        //                 "volume24": 24.0796457,
        //                 "volume24USD": 44282.347995912205,
        //                 "active": true,
        //                 "baseStep": 8,
        //                 "quoteStep": 6,
        //                 "status": 1,
        //                 "settings": {
        //                     "limit_usd": "0.1",
        //                     "price_max": "10000000000000",
        //                     "price_min": "1",
        //                     "price_tick": "1",
        //                     "pricescale": 10000,
        //                     "lot_size_max": "1000000000000000",
        //                     "lot_size_min": "1",
        //                     "lot_size_tick": "1",
        //                     "price_view_min": 6,
        //                     "default_slippage": 10,
        //                     "lot_size_view_min": 6
        //                 },
        //                 "asks": [
        //                     {
        //                     "price": "1976.405003",
        //                     "quantity": "0.0051171",
        //                     "amount": "10.1134620408513"
        //                     },
        //                     {
        //                     "price": "1976.405013",
        //                     "quantity": "0.09001559",
        //                     "amount": "177.90726332415267"
        //                     },
        //                     {
        //                     "price": "2010.704988",
        //                     "quantity": "0.00127892",
        //                     "amount": "2.57153082325296"
        //                     }
        //                 ],
        //                 "bids": [
        //                     {
        //                     "price": "1976.404988",
        //                     "quantity": "0.09875861",
        //                     "amount": "195.18700941194668"
        //                     },
        //                     {
        //                     "price": "1905.472973",
        //                     "quantity": "0.00263591",
        //                     "amount": "5.02265526426043"
        //                     },
        //                     {
        //                     "price": "1904.274973",
        //                     "quantity": "0.09425304",
        //                     "amount": "179.48370520116792"
        //                     }
        //                 ],
        //                 "updateId": "78",
        //                 "timeStart": "2021-01-28T09:19:30.706Z",
        //                 "makerFee": 200,
        //                 "takerFee": 200,
        //                 "quoteVolume24": 49125.1374009045,
        //                 "lowPrice24": 1966.704999,
        //                 "highPrice24": 2080.354997,
        //                 "baseCurrency": {
        //                     "id": 2,
        //                     "status": 1,
        //                     "symbol": "eth",
        //                     "title": "Ethereum",
        //                     "logoURL": "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/34ca5/eth-diamond-black.png",
        //                     "isDiscount": false,
        //                     "address": "https://ethereum.org/",
        //                     "description": "Ethereum ETH",
        //                     "decimals": 18,
        //                     "blockChain": "Ethereum",
        //                     "precision": 8,
        //                     "currentRate": null,
        //                     "active": true,
        //                     "timeStart": "2021-01-28T08:57:41.719Z",
        //                     "txLimits": {
        //                         "minDeposit": "100000000000000",
        //                         "maxWithdraw": "10000000000000000000000",
        //                         "minWithdraw": "20000000000000000",
        //                         "withdrawCommissionFixed": "5000000000000000",
        //                         "withdrawCommissionPercentage": "NaN"
        //                     },
        //                     "type": "crypto",
        //                     "typeNetwork": "internalGW",
        //                     "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMTVDMCA2LjcxNTczIDYuNzE1NzMgMCAxNSAwVjBDMjMuMjg0MyAwIDMwIDYuNzE1NzMgMzAgMTVWMTVDMzAgMjMuMjg0MyAyMy4yODQzIDMwIDE1IDMwVjMwQzYuNzE1NzMgMzAgMCAyMy4yODQzIDAgMTVWMTVaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTQuOTU1NyAxOS45NzM5TDkgMTYuMzUwOUwxNC45NTIxIDI1TDIwLjkxMDkgMTYuMzUwOUwxNC45NTIxIDE5Ljk3MzlIMTQuOTU1N1pNMTUuMDQ0MyA1TDkuMDkwOTUgMTUuMTg1M0wxNS4wNDQzIDE4LjgxNDZMMjEgMTUuMTg5MUwxNS4wNDQzIDVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
        //                     "idSorting": 2,
        //                     "links": [
        //                         {
        //                             "tx": "https://etherscan.io/tx/",
        //                             "address": "https://etherscan.io/address/",
        //                             "blockChain": "Ethereum"
        //                         }
        //                     ],
        //                     "clientTxLimits": {
        //                         "minDeposit": "0.0001",
        //                         "minWithdraw": "0.02",
        //                         "maxWithdraw": "10000",
        //                         "withdrawCommissionPercentage": "NaN",
        //                         "withdrawCommissionFixed": "0.005"
        //                     }
        //                 },
        //                 "quoteCurrency": {
        //                     "id": 3,
        //                     "status": 1,
        //                     "symbol": "usdt",
        //                     "title": "Tether USD",
        //                     "logoURL": "https://cryptologos.cc/logos/tether-usdt-logo.png?v=010",
        //                     "isDiscount": false,
        //                     "address": "https://tether.to/",
        //                     "description": "Tether USD",
        //                     "decimals": 6,
        //                     "blockChain": "",
        //                     "precision": 6,
        //                     "currentRate": null,
        //                     "active": true,
        //                     "timeStart": "2021-01-28T09:04:17.170Z",
        //                     "txLimits": {
        //                         "minDeposit": "1000",
        //                         "maxWithdraw": "100000000000",
        //                         "minWithdraw": "1000000",
        //                         "withdrawCommissionFixed": {
        //                             "Tron": "2000000",
        //                             "Binance": "2000000000000000000",
        //                             "Ethereum": "20000000"
        //                         },
        //                         "withdrawCommissionPercentage": "NaN"
        //                     },
        //                     "type": "crypto",
        //                     "typeNetwork": "internalGW",
        //                     "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMTVDMCA2LjcxNTczIDYuNzE1NzMgMCAxNSAwVjBDMjMuMjg0MyAwIDMwIDYuNzE1NzMgMzAgMTVWMTVDMzAgMjMuMjg0MyAyMy4yODQzIDMwIDE1IDMwVjMwQzYuNzE1NzMgMzAgMCAyMy4yODQzIDAgMTVWMTVaIiBmaWxsPSIjNkZBNjg4Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjMgN0g3VjExSDEzVjEyLjA2MkM4Ljk5MjAyIDEyLjMxNDYgNiAxMy4zMTAyIDYgMTQuNUM2IDE1LjY4OTggOC45OTIwMiAxNi42ODU0IDEzIDE2LjkzOFYyM0gxN1YxNi45MzhDMjEuMDA4IDE2LjY4NTQgMjQgMTUuNjg5OCAyNCAxNC41QzI0IDEzLjMxMDIgMjEuMDA4IDEyLjMxNDYgMTcgMTIuMDYyVjExSDIzVjdaTTcuNSAxNC41QzcuNSAxMy40NjA2IDkuMzMzMzMgMTIuMzY4IDEzIDEyLjA3NTZWMTUuNUgxN1YxMi4wNzU5QzIwLjkzODQgMTIuMzkyNyAyMi41IDEzLjYzMzkgMjIuNSAxNC41QzIyLjUgMTUuMzIyIDIwLjAwMDggMTUuODA2MSAxNyAxNS45NTI1QzE1LjcwODIgMTYuMDQ2MiAxMy43OTUxIDE1Ljk4MjYgMTMgMTUuOTM5MUM5Ljk5OTIxIDE1Ljc1NTkgNy41IDE1LjE4MDkgNy41IDE0LjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K",
        //                     "idSorting": 0,
        //                     "links": [
        //                         {
        //                             "tx": "https://etherscan.io/tx/",
        //                             "address": "https://etherscan.io/address/",
        //                             "blockChain": "Ethereum"
        //                         },
        //                         {
        //                             "tx": "https://tronscan.org/#/transaction/",
        //                             "address": "https://tronscan.org/#/address/",
        //                             "blockChain": "Tron"
        //                         },
        //                         {
        //                             "tx": "https://bscscan.com/tx/",
        //                             "address": "https://bscscan.com/address/",
        //                             "blockChain": "Binance"
        //                         }
        //                     ],
        //                     "clientTxLimits": {
        //                         "minDeposit": "0.001",
        //                         "minWithdraw": "1",
        //                         "maxWithdraw": "100000",
        //                         "withdrawCommissionPercentage": "NaN",
        //                         "withdrawCommissionFixed": {
        //                             "Tron": "2",
        //                             "Binance": "2",
        //                             "Ethereum": "20"
        //                         }
        //                     }
        //                 },
        //                 "quantities": {
        //                     "asks": "5.58760757",
        //                     "bids": "2226.98663823032198"
        //                 }
        //             }
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const pair = this.safeValue (result, 'pair', {});
        return this.parseTicker (pair, market);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        //     {
        //         "id": 2,
        //         "name": "eth_usdt",
        //         "baseAssetId": 2,
        //         "quoteAssetId": 3,
        //         "fullName": "ETH USDT",
        //         "description": "ETH   USDT",
        //         "lastBuy": "1976.715012",
        //         "lastSell": "1971.995006",
        //         "lastPrice": "1976.715012",
        //         "change24": "1.02",
        //         "volume24": 24.0796457,
        //         "volume24USD": 44282.347995912205,
        //         "active": true,
        //         "baseStep": 8,
        //         "quoteStep": 6,
        //         "status": 1,
        //         "asks": [
        //             {
        //             "price": "1976.405003",
        //             "quantity": "0.0051171",
        //             "amount": "10.1134620408513"
        //             },
        //             {
        //             "price": "1976.405013",
        //             "quantity": "0.09001559",
        //             "amount": "177.90726332415267"
        //             },
        //             {
        //             "price": "2010.704988",
        //             "quantity": "0.00127892",
        //             "amount": "2.57153082325296"
        //             }
        //                ...
        //         ],
        //         "bids": [
        //             {
        //             "price": "1976.404988",
        //             "quantity": "0.09875861",
        //             "amount": "195.18700941194668"
        //             },
        //             {
        //             "price": "1905.472973",
        //             "quantity": "0.00263591",
        //             "amount": "5.02265526426043"
        //             },
        //             {
        //             "price": "1904.274973",
        //             "quantity": "0.09425304",
        //             "amount": "179.48370520116792"
        //             }
        //                ...
        //         ],
        //         "updateId": "78",
        //         "timeStart": "2021-01-28T09:19:30.706Z",
        //         "makerFee": 200,
        //         "takerFee": 200,
        //         "quoteVolume24": 49125.1374009045,
        //         "lowPrice24": 1966.704999,
        //         "highPrice24": 2080.354997,
        //         ...
        //     }
        //
        const bids = this.safeValue (ticker, 'bids', []);
        const bestBid = this.safeValue (bids, 0, {});
        const bestBidPrice = this.safeString (bestBid, 'price');
        const bestBidVolume = this.safeString (bestBid, 'quantity');
        const asks = this.safeValue (ticker, 'asks', []);
        const bestAsk = this.safeValue (asks, 0, {});
        const bestAskPrice = this.safeString (bestAsk, 'price');
        const bestAskVolume = this.safeString (bestAsk, 'quantity');
        const baseVolume = this.safeString (ticker, 'volume24');
        const quoteVolume = this.safeString (ticker, 'quoteVolume24');
        const high = this.safeString (ticker, 'highPrice24');
        const low = this.safeString (ticker, 'lowPrice24');
        const close = this.safeString (ticker, 'lastPrice');
        const changePcnt = this.safeString (ticker, 'change24'); // todo: check
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'open': undefined,
            'high': high,
            'low': low,
            'close': close,
            'bid': bestBidPrice,
            'bidVolume': bestBidVolume,
            'ask': bestAskPrice,
            'askVolume': bestAskVolume,
            'vwap': undefined,
            'previousClose': undefined,
            'change': undefined, // todo: check
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit (params, this.extractParams (path));
        const endpoint = '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode (request);
        // if (api === 'private') {
        // todo
        // }
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
