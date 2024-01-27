'use strict';

var bitteam$1 = require('./abstract/bitteam.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var Precise = require('./base/Precise.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class bitteam
 * @augments Exchange
 */
class bitteam extends bitteam$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitteam',
            'name': 'BIT.TEAM',
            'countries': ['UK'],
            'version': 'v2.0.6',
            'rateLimit': 1,
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
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': true,
                'fetchClosedOrder': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': true,
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
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
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
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': true,
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
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '1h': '60',
                '1d': '1D',
            },
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/cf71fe3d-b8b4-40f2-a906-907661b28793',
                'api': {
                    'history': 'https://history.bit.team',
                    'public': 'https://bit.team',
                    'private': 'https://bit.team',
                },
                'www': 'https://bit.team/',
                'referral': 'https://bit.team/auth/sign-up?ref=bitboy2023',
                'doc': [
                    'https://bit.team/trade/api/documentation',
                ],
            },
            'api': {
                'history': {
                    'get': {
                        'api/tw/history/{pairName}/{resolution}': 1,
                    },
                },
                'public': {
                    'get': {
                        'trade/api/asset': 1,
                        'trade/api/currencies': 1,
                        'trade/api/orderbooks/{symbol}': 1,
                        'trade/api/orders': 1,
                        'trade/api/pair/{name}': 1,
                        'trade/api/pairs': 1,
                        'trade/api/pairs/precisions': 1,
                        'trade/api/rates': 1,
                        'trade/api/trade/{id}': 1,
                        'trade/api/trades': 1,
                        'trade/api/ccxt/pairs': 1,
                        'trade/api/cmc/assets': 1,
                        'trade/api/cmc/orderbook/{pair}': 1,
                        'trade/api/cmc/summary': 1,
                        'trade/api/cmc/ticker': 1,
                        'trade/api/cmc/trades/{pair}': 1,
                    },
                },
                'private': {
                    'get': {
                        'trade/api/ccxt/balance': 1,
                        'trade/api/ccxt/order/{id}': 1,
                        'trade/api/ccxt/ordersOfUser': 1,
                        'trade/api/ccxt/tradesOfUser': 1,
                        'trade/api/transactionsOfUser': 1,
                    },
                    'post': {
                        'trade/api/ccxt/cancel-all-order': 1,
                        'trade/api/ccxt/cancelorder': 1,
                        'trade/api/ccxt/ordercreate': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber('0.002'),
                    'maker': this.parseNumber('0.002'),
                },
            },
            'precisionMode': number.DECIMAL_PLACES,
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
                    'Decimal': 'Decimal',
                    'ufobject': 'ufobject',
                    'tonchain': 'tonchain',
                },
                'currenciesValuedInUsd': {
                    'USDT': true,
                    'BUSD': true,
                },
            },
            'exceptions': {
                'exact': {
                    '400002': errors.BadSymbol,
                    '401000': errors.AuthenticationError,
                    '403002': errors.BadRequest,
                    '404200': errors.BadSymbol, // {"ok":false,"code":404200,"data":{},"message":"Pair was not found"}
                },
                'broad': {
                    'is not allowed': errors.BadRequest,
                    'Insufficient funds': errors.InsufficientFunds,
                    'Invalid request params input': errors.BadRequest,
                    'must be a number': errors.BadRequest,
                    'must be a string': errors.BadRequest,
                    'must be of type': errors.BadRequest,
                    'must be one of': errors.BadRequest,
                    'Order not found': errors.OrderNotFound,
                    'Pair with pair name': errors.BadSymbol,
                    'pairName': errors.BadSymbol,
                    'Service Unavailable': errors.ExchangeNotAvailable,
                    'Symbol ': errors.BadSymbol, // {"ok":false,"code":404000,"data":{},"message":"Symbol asdfasdfas was not found"}
                },
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name bitteam#fetchMarkets
         * @description retrieves data on all markets for bitteam
         * @see https://bit.team/trade/api/documentation#/CCXT/getTradeApiCcxtPairs
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetTradeApiCcxtPairs(params);
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
        const result = this.safeValue(response, 'result', {});
        const markets = this.safeValue(result, 'pairs', []);
        return this.parseMarkets(markets);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'name');
        const numericId = this.safeInteger(market, 'id');
        const parts = id.split('_');
        const baseId = this.safeString(parts, 0);
        const quoteId = this.safeString(parts, 1);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        const active = this.safeValue(market, 'active');
        const amountPrecision = this.safeInteger(market, 'baseStep');
        const pricePrecision = this.safeInteger(market, 'quoteStep');
        const timeStart = this.safeString(market, 'timeStart');
        const created = this.parse8601(timeStart);
        let minCost = undefined;
        const currenciesValuedInUsd = this.safeValue(this.options, 'currenciesValuedInUsd', {});
        const quoteInUsd = this.safeValue(currenciesValuedInUsd, quote, false);
        if (quoteInUsd) {
            const settings = this.safeValue(market, 'settings', {});
            minCost = this.safeNumber(settings, 'limit_usd');
        }
        return this.safeMarketStructure({
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
                    'min': minCost,
                    'max': undefined,
                },
            },
            'created': created,
            'info': market,
        });
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name bitteam#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiCurrencies
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetTradeApiCurrencies(params);
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
        const responseResult = this.safeValue(response, 'result', {});
        const currencies = this.safeValue(responseResult, 'currencies', []);
        // usding another endpoint to fetch statuses of deposits and withdrawals
        let statusesResponse = await this.publicGetTradeApiCmcAssets();
        //
        //     {
        //         "ZNX": {
        //             "name": "ZeNeX Coin",
        //             "unified_cryptoasset_id": 30,
        //             "withdrawStatus": true,
        //             "depositStatus": true,
        //             "min_withdraw": 0.00001,
        //             "max_withdraw": 10000
        //         },
        //         "USDT": {
        //             "name": "Tether USD",
        //             "unified_cryptoasset_id": 3,
        //             "withdrawStatus": true,
        //             "depositStatus": true,
        //             "min_withdraw": 1,
        //             "max_withdraw": 100000
        //         },
        //     }
        //
        statusesResponse = this.indexBy(statusesResponse, 'unified_cryptoasset_id');
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString(currency, 'symbol');
            const numericId = this.safeInteger(currency, 'id');
            const code = this.safeCurrencyCode(id);
            const active = this.safeValue(currency, 'active', false);
            const precision = this.safeInteger(currency, 'precision');
            const txLimits = this.safeValue(currency, 'txLimits', {});
            const minWithdraw = this.safeString(txLimits, 'minWithdraw');
            const maxWithdraw = this.safeString(txLimits, 'maxWithdraw');
            const minDeposit = this.safeString(txLimits, 'minDeposit');
            let fee = undefined;
            const withdrawCommissionFixed = this.safeValue(txLimits, 'withdrawCommissionFixed', {});
            let feesByNetworkId = {};
            const blockChain = this.safeString(currency, 'blockChain');
            // if only one blockChain
            if ((blockChain !== undefined) && (blockChain !== '')) {
                fee = this.parseNumber(withdrawCommissionFixed);
                feesByNetworkId[blockChain] = fee;
            }
            else {
                feesByNetworkId = withdrawCommissionFixed;
            }
            const statuses = this.safeValue(statusesResponse, numericId, {});
            const deposit = this.safeValue(statuses, 'depositStatus');
            const withdraw = this.safeValue(statuses, 'withdrawStatus');
            const networkIds = Object.keys(feesByNetworkId);
            const networks = {};
            const networkPrecision = this.safeInteger(currency, 'decimals');
            for (let j = 0; j < networkIds.length; j++) {
                const networkId = networkIds[j];
                const networkCode = this.networkIdToCode(networkId, code);
                const networkFee = this.safeNumber(feesByNetworkId, networkId);
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'deposit': deposit,
                    'withdraw': withdraw,
                    'active': active,
                    'fee': networkFee,
                    'precision': networkPrecision,
                    'limits': {
                        'amount': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.parseNumber(minWithdraw),
                            'max': this.parseNumber(maxWithdraw),
                        },
                        'deposit': {
                            'min': this.parseNumber(minDeposit),
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
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber(minWithdraw),
                        'max': this.parseNumber(maxWithdraw),
                    },
                    'deposit': {
                        'min': this.parseNumber(minDeposit),
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const resolution = this.safeString(this.timeframes, timeframe, timeframe);
        const request = {
            'pairName': market['id'],
            'resolution': resolution,
        };
        const response = await this.historyGetApiTwHistoryPairNameResolution(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "count": 364,
        //             "data": [
        //                 {
        //                     "t": 1669593600,
        //                     "o": 16211.259266,
        //                     "h": 16476.985001,
        //                     "l": 16023.714999,
        //                     "c": 16430.636894,
        //                     "v": 2.60150368999999
        //                 },
        //                 {
        //                     "t": 1669680000,
        //                     "o": 16430.636894,
        //                     "h": 17065.229582,
        //                     "l": 16346.114155,
        //                     "c": 16882.297736,
        //                     "v": 3.0872548400000115
        //                 },
        //                 ...
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const data = this.safeValue(result, 'data', []);
        return this.parseOHLCVs(data, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "t": 1669680000,
        //         "o": 16430.636894,
        //         "h": 17065.229582,
        //         "l": 16346.114155,
        //         "c": 16882.297736,
        //         "v": 3.0872548400000115
        //     },
        //
        return [
            this.safeTimestamp(ohlcv, 't'),
            this.safeNumber(ohlcv, 'o'),
            this.safeNumber(ohlcv, 'h'),
            this.safeNumber(ohlcv, 'l'),
            this.safeNumber(ohlcv, 'c'),
            this.safeNumber(ohlcv, 'v'),
        ];
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcOrderbookPair
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradeApiCmcOrderbookPair(this.extend(request, params));
        //
        //     {
        //         "timestamp": 1701166703285,
        //         "bids": [
        //             [
        //                 2019.334988,
        //                 0.09048525
        //             ],
        //             [
        //                 1999.860002,
        //                 0.0225
        //             ],
        //             ...
        //         ],
        //         "asks": [
        //             [
        //                 2019.334995,
        //                 0.00899078
        //             ],
        //             [
        //                 2019.335013,
        //                 0.09833052
        //             ],
        //             ...
        //         ]
        //     }
        //
        const timestamp = this.safeInteger(response, 'timestamp');
        const orderbook = this.parseOrderBook(response, symbol, timestamp);
        return orderbook;
    }
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @param {string} [params.type] the status of the order - 'active', 'closed', 'cancelled', 'all', 'history' (default 'all')
         * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const type = this.safeString(params, 'type', 'all');
        const request = {
            'type': type,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['pair'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeApiCcxtOrdersOfUser(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "count": 3,
        //             "orders": [
        //                 {
        //                     "id": 106733026,
        //                     "orderId": null,
        //                     "userId": 21639,
        //                     "pair": "btc_usdt",
        //                     "pairId": 22,
        //                     "quantity": "0.00001",
        //                     "price": "40",
        //                     "executedPrice": "0",
        //                     "fee": null,
        //                     "orderCid": null,
        //                     "executed": "0",
        //                     "expires": null,
        //                     "baseDecimals": 8,
        //                     "quoteDecimals": 6,
        //                     "timestamp": 1700594804,
        //                     "status": "inactive",
        //                     "side": "buy",
        //                     "type": "limit",
        //                     "createdAt": "2023-11-21T19:26:43.868Z",
        //                     "updatedAt": "2023-11-21T19:26:43.868Z"
        //                 },
        //                 {
        //                     "id": 106733308,
        //                     "orderId": "13074362",
        //                     "userId": 21639,
        //                     "pair": "btc_usdt",
        //                     "pairId": 22,
        //                     "quantity": "0.00001",
        //                     "price": "50000",
        //                     "executedPrice": "37017.495008",
        //                     "fee": {
        //                         "amount": "0.00000002",
        //                         "symbol": "btc",
        //                         "userId": 21639,
        //                         "decimals": 8,
        //                         "symbolId": 11
        //                     },
        //                     "orderCid": null,
        //                     "executed": "0.00001",
        //                     "expires": null,
        //                     "baseDecimals": 8,
        //                     "quoteDecimals": 6,
        //                     "timestamp": 1700594959,
        //                     "status": "executed",
        //                     "side": "buy",
        //                     "type": "limit",
        //                     "createdAt": "2023-11-21T19:29:19.946Z",
        //                     "updatedAt": "2023-11-21T19:29:19.946Z"
        //                 },
        //                 {
        //                     "id": 106734455,
        //                     "orderId": "13248984",
        //                     "userId": 21639,
        //                     "pair": "eth_usdt",
        //                     "pairId": 2,
        //                     "quantity": "0.001",
        //                     "price": "1750",
        //                     "executedPrice": "0",
        //                     "fee": null,
        //                     "orderCid": null,
        //                     "executed": "0",
        //                     "expires": null,
        //                     "baseDecimals": 18,
        //                     "quoteDecimals": 6,
        //                     "timestamp": 1700595523,
        //                     "status": "accepted",
        //                     "side": "buy",
        //                     "type": "limit",
        //                     "createdAt": "2023-11-21T19:38:43.530Z",
        //                     "updatedAt": "2023-11-21T19:38:43.530Z"
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const orders = this.safeValue(result, 'orders', []);
        return this.parseOrders(orders, market, since, limit);
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchOrder
         * @description fetches information on an order
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrderId
         * @param {int|string} id order id
         * @param {string} symbol not used by bitteam fetchOrder ()
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const request = {
            'id': id,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const response = await this.privateGetTradeApiCcxtOrderId(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "id": 106494347,
        //             "orderId": "13214332",
        //             "userId": 15912,
        //             "pair": "eth_usdt",
        //             "pairId": 2,
        //             "quantity": "0.00448598",
        //             "price": "2015.644995",
        //             "executedPrice": "2015.644995",
        //             "fee": {
        //                 "amount": "0",
        //                 "symbol": "eth",
        //                 "userId": 15912,
        //                 "decimals": 18,
        //                 "symbolId": 2,
        //                 "discountAmount": "0",
        //                 "discountSymbol": "btt",
        //                 "discountDecimals": 18,
        //                 "discountSymbolId": 5
        //             },
        //             "orderCid": null,
        //             "executed": "0.00448598",
        //             "expires": null,
        //             "baseDecimals": 18,
        //             "quoteDecimals": 6,
        //             "timestamp": 1700470476,
        //             "status": "executed",
        //             "side": "buy",
        //             "type": "limit",
        //             "stopPrice": null,
        //             "slippage": null
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result');
        return this.parseOrder(result, market);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of open order structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const request = {
            'type': 'active',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of closed order structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const request = {
            'type': 'closed',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    async fetchCanceledOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchCanceledOrders
         * @description fetches information on multiple canceled orders made by the user
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of canceled order structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const request = {
            'type': 'cancelled',
        };
        return await this.fetchOrders(symbol, since, limit, this.extend(request, params));
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#createOrder
         * @description create a trade order
         * @see https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtOrdercreate
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pairId': market['numericId'].toString(),
            'type': type,
            'side': side,
            'amount': this.amountToPrecision(symbol, amount),
        };
        if (type === 'limit') {
            if (price === undefined) {
                throw new errors.ArgumentsRequired(this.id + ' createOrder() requires a price argument for a ' + type + ' order');
            }
            else {
                request['price'] = this.priceToPrecision(symbol, price);
            }
        }
        const response = await this.privatePostTradeApiCcxtOrdercreate(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "id": 106733308,
        //             "userId": 21639,
        //             "quantity": "0.00001",
        //             "pair": "btc_usdt",
        //             "side": "buy",
        //             "price": "50000",
        //             "executed": "0",
        //             "executedPrice": "0",
        //             "status": "created",
        //             "baseDecimals": 8,
        //             "quoteDecimals": 6,
        //             "pairId": 22,
        //             "type": "limit",
        //             "stopPrice": null,
        //             "slippage": null,
        //             "timestamp": "1700594959"
        //         }
        //     }
        //
        const order = this.safeValue(response, 'result', {});
        return this.parseOrder(order, market);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#cancelOrder
         * @description cancels an open order
         * @see https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelorder
         * @param {string} id order id
         * @param {string} symbol not used by bitteam cancelOrder ()
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        const request = {
            'id': id,
        };
        const response = await this.privatePostTradeApiCcxtCancelorder(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "message": "The request to cancel your order was received"
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        return this.parseOrder(result);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#cancelAllOrders
         * @description cancel open orders of market
         * @see https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelallorder
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
         */
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['pairId'] = market['numericId'].toString();
        }
        else {
            request['pairId'] = '0'; // '0' for all markets
        }
        const response = await this.privatePostTradeApiCcxtCancelAllOrder(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "message":"The request to cancel all your orders was received"
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const orders = [result];
        return this.parseOrders(orders, market);
    }
    parseOrder(order, market = undefined) {
        //
        // fetchOrders
        //     {
        //         "id": 106733308,
        //         "orderId": "13074362",
        //         "userId": 21639,
        //         "pair": "btc_usdt",
        //         "pairId": 22,
        //         "quantity": "0.00001",
        //         "price": "50000",
        //         "executedPrice": "37017.495008",
        //         "fee": {
        //             "amount": "0.00000002",
        //             "symbol": "btc",
        //             "userId": 21639,
        //             "decimals": 8,
        //             "symbolId": 11
        //         },
        //         "orderCid": null,
        //         "executed": "0.00001",
        //         "expires": null,
        //         "baseDecimals": 8,
        //         "quoteDecimals": 6,
        //         "timestamp": 1700594959,
        //         "status": "executed",
        //         "side": "buy",
        //         "type": "limit",
        //         "createdAt": "2023-11-21T19:29:19.946Z",
        //         "updatedAt": "2023-11-21T19:29:19.946Z"
        //     },
        //
        // fetchOrder
        //     {
        //         "id": 106494347,
        //         "orderId": "13214332",
        //         "userId": 15912,
        //         "pair": "eth_usdt",
        //         "pairId": 2,
        //         "quantity": "0.00448598",
        //         "price": "2015.644995",
        //         "executedPrice": "2015.644995",
        //         "fee": {
        //             "amount": "0",
        //             "symbol": "eth",
        //             "userId": 15912,
        //             "decimals": 18,
        //             "symbolId": 2,
        //             "discountAmount": "0",
        //             "discountSymbol": "btt",
        //             "discountDecimals": 18,
        //             "discountSymbolId": 5
        //         },
        //         "orderCid": null,
        //         "executed": "0.00448598",
        //         "expires": null,
        //         "baseDecimals": 18,
        //         "quoteDecimals": 6,
        //         "timestamp": 1700470476,
        //         "status": "executed",
        //         "side": "buy",
        //         "type": "limit",
        //         "stopPrice": null,
        //         "slippage": null
        //     }
        //
        // createOrder
        //     {
        //         "id": 106733308,
        //         "userId": 21639,
        //         "quantity": "0.00001",
        //         "pair": "btc_usdt",
        //         "side": "buy",
        //         "price": "50000",
        //         "executed": "0",
        //         "executedPrice": "0",
        //         "status": "created",
        //         "baseDecimals": 8,
        //         "quoteDecimals": 6,
        //         "pairId": 22,
        //         "type": "limit",
        //         "stopPrice": null,
        //         "slippage": null,
        //         "timestamp": "1700594959"
        //     }
        //
        const id = this.safeString(order, 'id');
        const marketId = this.safeString(order, 'pair');
        market = this.safeMarket(marketId, market);
        const clientOrderId = this.safeString(order, 'orderCid');
        let timestamp = undefined;
        const createdAt = this.safeString(order, 'createdAt');
        if (createdAt !== undefined) {
            timestamp = this.parse8601(createdAt);
        }
        else {
            timestamp = this.safeTimestamp(order, 'timestamp');
        }
        const updatedAt = this.safeString(order, 'updatedAt');
        const lastUpdateTimestamp = this.parse8601(updatedAt);
        const status = this.parseOrderStatus(this.safeString(order, 'status'));
        const type = this.parseOrderType(this.safeString(order, 'type'));
        const side = this.safeString(order, 'side');
        const feeRaw = this.safeValue(order, 'fee');
        const price = this.safeString(order, 'price');
        const stopPrice = this.safeString(order, 'stopPrice');
        const amount = this.safeString(order, 'quantity');
        const filled = this.safeString(order, 'executed');
        let fee = undefined;
        if (feeRaw !== undefined) {
            const feeCost = this.safeString(feeRaw, 'amount');
            const feeCurrencyId = this.safeString(feeRaw, 'symbol');
            fee = {
                'currency': this.safeCurrencyCode(feeCurrencyId),
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return this.safeOrder({
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
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
            'fee': fee,
            'trades': undefined,
            'info': order,
            'postOnly': false,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'accepted': 'open',
            'executed': 'closed',
            'cancelled': 'canceled',
            'partiallyCancelled': 'canceled',
            'delete': 'rejected',
            'inactive': 'rejected',
            'executing': 'open',
            'created': 'open',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(status) {
        const statuses = {
            'market': 'market',
            'limit': 'limit',
        };
        return this.safeString(statuses, status, status);
    }
    parseValueToPricision(valueObject, valueKey, preciseObject, precisionKey) {
        const valueRawString = this.safeString(valueObject, valueKey);
        const precisionRawString = this.safeString(preciseObject, precisionKey);
        if (valueRawString === undefined || precisionRawString === undefined) {
            return undefined;
        }
        const precisionString = this.parsePrecision(precisionRawString);
        return Precise["default"].stringMul(valueRawString, precisionString);
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @see https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcSummary
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets();
        let response = await this.publicGetTradeApiCmcSummary();
        //
        //     [
        //         {
        //             "trading_pairs": "BTC_USDT",
        //             "base_currency": "BTC",
        //             "quote_currency": "USDT",
        //             "last_price": 37669.955001,
        //             "lowest_ask": 37670.055,
        //             "highest_bid": 37669.955,
        //             "base_volume": 6.81156888,
        //             "quote_volume": 257400.516878529,
        //             "price_change_percent_24h": -0.29,
        //             "highest_price_24h": 38389.994463,
        //             "lowest_price_24h": 37574.894999
        //         },
        //         {
        //             "trading_pairs": "BNB_USDT",
        //             "base_currency": "BNB",
        //             "quote_currency": "USDT",
        //             "last_price": 233.525142,
        //             "lowest_ask": 233.675,
        //             "highest_bid": 233.425,
        //             "base_volume": 245.0199339,
        //             "quote_volume": 57356.91823827642,
        //             "price_change_percent_24h": -0.32,
        //             "highest_price_24h": 236.171123,
        //             "lowest_price_24h": 231.634637
        //         },
        //         ...
        //     ]
        //
        const tickers = [];
        if (!Array.isArray(response)) {
            response = [];
        }
        for (let i = 0; i < response.length; i++) {
            const rawTicker = response[i];
            const ticker = this.parseTicker(rawTicker);
            tickers.push(ticker);
        }
        return this.filterByArrayTickers(tickers, 'symbol', symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name bitteam#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairName
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'name': market['id'],
        };
        const response = await this.publicGetTradeApiPairName(this.extend(request, params));
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
        const result = this.safeValue(response, 'result', {});
        const pair = this.safeValue(result, 'pair', {});
        return this.parseTicker(pair, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        // fetchTicker
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
        // fetchTickers
        //     {
        //         "trading_pairs": "BTC_USDT",
        //         "base_currency": "BTC",
        //         "quote_currency": "USDT",
        //         "last_price": 37669.955001,
        //         "lowest_ask": 37670.055,
        //         "highest_bid": 37669.955,
        //         "base_volume": 6.81156888,
        //         "quote_volume": 257400.516878529,
        //         "price_change_percent_24h": -0.29,
        //         "highest_price_24h": 38389.994463,
        //         "lowest_price_24h": 37574.894999
        //     }
        const marketId = this.safeStringLower(ticker, 'trading_pairs');
        market = this.safeMarket(marketId, market);
        let bestBidPrice = undefined;
        let bestAskPrice = undefined;
        let bestBidVolume = undefined;
        let bestAskVolume = undefined;
        const bids = this.safeValue(ticker, 'bids');
        const asks = this.safeValue(ticker, 'asks');
        if ((bids !== undefined) && (Array.isArray(bids)) && (asks !== undefined) && (Array.isArray(asks))) {
            const bestBid = this.safeValue(bids, 0, {});
            bestBidPrice = this.safeString(bestBid, 'price');
            bestBidVolume = this.safeString(bestBid, 'quantity');
            const bestAsk = this.safeValue(asks, 0, {});
            bestAskPrice = this.safeString(bestAsk, 'price');
            bestAskVolume = this.safeString(bestAsk, 'quantity');
        }
        else {
            bestBidPrice = this.safeString(ticker, 'highest_bid');
            bestAskPrice = this.safeString(ticker, 'lowest_ask');
        }
        const baseVolume = this.safeString2(ticker, 'volume24', 'base_volume');
        const quoteVolume = this.safeString2(ticker, 'quoteVolume24', 'quote_volume');
        const high = this.safeString2(ticker, 'highPrice24', 'highest_price_24h');
        const low = this.safeString2(ticker, 'lowPrice24', 'lowest_price_24h');
        const close = this.safeString2(ticker, 'lastPrice', 'last_price');
        const changePcnt = this.safeString2(ticker, 'change24', 'price_change_percent_24h');
        return this.safeTicker({
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
            'change': undefined,
            'percentage': changePcnt,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcTradesPair
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'pair': market['id'],
        };
        const response = await this.publicGetTradeApiCmcTradesPair(this.extend(request, params));
        //
        //     [
        //         {
        //             "trade_id": 34970337,
        //             "price": 37769.994793,
        //             "base_volume": 0.00119062,
        //             "quote_volume": 44.96971120044166,
        //             "timestamp": 1700827234000,
        //             "type": "buy"
        //         },
        //         {
        //             "trade_id": 34970347,
        //             "price": 37769.634497,
        //             "base_volume": 0.00104009,
        //             "quote_volume": 39.28381914398473,
        //             "timestamp": 1700827248000,
        //             "type": "buy"
        //         },
        //         ...
        //     ]
        //
        return this.parseTrades(response, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtTradesofuser
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['pairId'] = market['numericId'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeApiCcxtTradesOfUser(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "count": 3,
        //             "trades": [
        //                 {
        //                     "id": 34880724,
        //                     "tradeId": "4368041",
        //                     "makerOrderId": 106742914,
        //                     "takerOrderId": 106761614,
        //                     "pairId": 2,
        //                     "quantity": "0.00955449",
        //                     "price": "1993.674994",
        //                     "isBuyerMaker": true,
        //                     "baseDecimals": 18,
        //                     "quoteDecimals": 6,
        //                     "side": "sell",
        //                     "timestamp": 1700615250,
        //                     "rewarded": true,
        //                     "makerUserId": 21639,
        //                     "takerUserId": 15913,
        //                     "baseCurrencyId": 2,
        //                     "quoteCurrencyId": 3,
        //                     "feeMaker": {
        //                         "amount": "0.0000191",
        //                         "symbol": "eth",
        //                         "userId": 21639,
        //                         "decimals": 18,
        //                         "symbolId": 2
        //                     },
        //                     "feeTaker": {
        //                         "amount": "0",
        //                         "symbol": "usdt",
        //                         "userId": 15913,
        //                         "decimals": 6,
        //                         "symbolId": 3,
        //                         "discountAmount": "0",
        //                         "discountSymbol": "btt",
        //                         "discountDecimals": 18,
        //                         "discountSymbolId": 5
        //                     },
        //                     "pair": "eth_usdt",
        //                     "createdAt": "2023-11-22T01:07:30.593Z",
        //                     "updatedAt": "2023-11-22T01:10:00.117Z",
        //                     "isCurrentSide": "maker"
        //                 },
        //                 {
        //                     "id": 34875793,
        //                     "tradeId": "4368010",
        //                     "makerOrderId": 106742914,
        //                     "takerOrderId": 106745926,
        //                     "pairId": 2,
        //                     "quantity": "0.0027193",
        //                     "price": "1993.674994",
        //                     "isBuyerMaker": true,
        //                     "baseDecimals": 18,
        //                     "quoteDecimals": 6,
        //                     "side": "sell",
        //                     "timestamp": 1700602983,
        //                     "rewarded": true,
        //                     "makerUserId": 21639,
        //                     "takerUserId": 15912,
        //                     "baseCurrencyId": 2,
        //                     "quoteCurrencyId": 3,
        //                     "feeMaker": {
        //                         "amount": "0.00000543",
        //                         "symbol": "eth",
        //                         "userId": 21639,
        //                         "decimals": 18,
        //                         "symbolId": 2
        //                     },
        //                     "feeTaker": {
        //                         "amount": "0",
        //                         "symbol": "usdt",
        //                         "userId": 15912,
        //                         "decimals": 6,
        //                         "symbolId": 3,
        //                         "discountAmount": "0",
        //                         "discountSymbol": "btt",
        //                         "discountDecimals": 18,
        //                         "discountSymbolId": 5
        //                     },
        //                     "pair": "eth_usdt",
        //                     "createdAt": "2023-11-21T21:43:02.758Z",
        //                     "updatedAt": "2023-11-21T21:45:00.147Z",
        //                     "isCurrentSide": "maker"
        //                 },
        //                 {
        //                     "id": 34871727,
        //                     "tradeId": "3441840",
        //                     "makerOrderId": 106733299,
        //                     "takerOrderId": 106733308,
        //                     "pairId": 22,
        //                     "quantity": "0.00001",
        //                     "price": "37017.495008",
        //                     "isBuyerMaker": false,
        //                     "baseDecimals": 8,
        //                     "quoteDecimals": 6,
        //                     "side": "buy",
        //                     "timestamp": 1700594960,
        //                     "rewarded": true,
        //                     "makerUserId": 15909,
        //                     "takerUserId": 21639,
        //                     "baseCurrencyId": 11,
        //                     "quoteCurrencyId": 3,
        //                     "feeMaker": {
        //                         "amount": "0",
        //                         "symbol": "usdt",
        //                         "userId": 15909,
        //                         "decimals": 6,
        //                         "symbolId": 3,
        //                         "discountAmount": "0",
        //                         "discountSymbol": "btt",
        //                         "discountDecimals": 18,
        //                         "discountSymbolId": 5
        //                     },
        //                     "feeTaker": {
        //                         "amount": "0.00000002",
        //                         "symbol": "btc",
        //                         "userId": 21639,
        //                         "decimals": 8,
        //                         "symbolId": 11
        //                     },
        //                     "pair": "btc_usdt",
        //                     "createdAt": "2023-11-21T19:29:20.092Z",
        //                     "updatedAt": "2023-11-21T19:30:00.159Z"
        //                     "isCurrentSide": "taker"
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const trades = this.safeValue(result, 'trades', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // fetchTrades
        //     {
        //         "trade_id": 34970337,
        //         "price": 37769.994793,
        //         "base_volume": 0.00119062,
        //         "quote_volume": 44.96971120044166,
        //         "timestamp": 1700827234000,
        //         "type": "buy"
        //     },
        //
        // fetchMyTrades
        //     {
        //         "id": 34875793,
        //         "tradeId": "4368010",
        //         "makerOrderId": 106742914,
        //         "takerOrderId": 106745926,
        //         "pairId": 2,
        //         "quantity": "0.0027193",
        //         "price": "1993.674994",
        //         "isBuyerMaker": true,
        //         "baseDecimals": 18,
        //         "quoteDecimals": 6,
        //         "side": "sell",
        //         "timestamp": 1700602983,
        //         "rewarded": true,
        //         "makerUserId": 21639,
        //         "takerUserId": 15912,
        //         "baseCurrencyId": 2,
        //         "quoteCurrencyId": 3,
        //         "feeMaker": {
        //             "amount": "0.00000543",
        //             "symbol": "eth",
        //             "userId": 21639,
        //             "decimals": 18,
        //             "symbolId": 2
        //         },
        //         "feeTaker": {
        //             "amount": "0",
        //             "symbol": "usdt",
        //             "userId": 15912,
        //             "decimals": 6,
        //             "symbolId": 3,
        //             "discountAmount": "0",
        //             "discountSymbol": "btt",
        //             "discountDecimals": 18,
        //             "discountSymbolId": 5
        //         },
        //         "pair": "eth_usdt",
        //         "createdAt": "2023-11-21T21:43:02.758Z",
        //         "updatedAt": "2023-11-21T21:45:00.147Z",
        //         "isCurrentSide": "maker"
        //     }
        //
        const marketId = this.safeString(trade, 'pair');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const id = this.safeString2(trade, 'id', 'trade_id');
        const price = this.safeString(trade, 'price');
        const amount = this.safeString2(trade, 'quantity', 'base_volume');
        const cost = this.safeString(trade, 'quote_volume');
        const takerOrMaker = this.safeString(trade, 'isCurrentSide');
        let timestamp = this.safeString(trade, 'timestamp');
        if (takerOrMaker !== undefined) {
            timestamp = Precise["default"].stringMul(timestamp, '1000');
        }
        // the exchange returns the side of the taker
        let side = this.safeString2(trade, 'side', 'type');
        let feeInfo = undefined;
        let order = undefined;
        if (takerOrMaker === 'maker') {
            if (side === 'sell') {
                side = 'buy';
            }
            else if (side === 'buy') {
                side = 'sell';
            }
            order = this.safeString(trade, 'makerOrderId');
            feeInfo = this.safeValue(trade, 'feeMaker', {});
        }
        else if (takerOrMaker === 'taker') {
            order = this.safeString(trade, 'takerOrderId');
            feeInfo = this.safeValue(trade, 'feeTaker', {});
        }
        const feeCurrencyId = this.safeString(feeInfo, 'symbol');
        const feeCost = this.safeString(feeInfo, 'amount');
        const fee = {
            'currency': this.safeCurrencyCode(feeCurrencyId),
            'cost': feeCost,
            'rate': undefined,
        };
        const intTs = this.parseToInt(timestamp);
        return this.safeTrade({
            'id': id,
            'order': order,
            'timestamp': intTs,
            'datetime': this.iso8601(intTs),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'info': trade,
        }, market);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name betteam#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtBalance
         * @param {object} [params] extra parameters specific to the betteam api endpoint
         * @returns {object} a [balance structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#balance-structure}
         */
        await this.loadMarkets();
        const response = await this.privateGetTradeApiCcxtBalance(params);
        return this.parseBalance(response);
    }
    parseBalance(response) {
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "free": {
        //                 "USDT": "0",
        //                 "DEL": "0",
        //                 "BTC": "0",
        //                 ...
        //             },
        //                 "used": {
        //                 "USDT": "0",
        //                 "DEL": "0",
        //                 "BTC": "0",
        //                 ...
        //             },
        //             "total": {
        //                 "USDT": "0",
        //                 "DEL": "0",
        //                 "BTC": "0",
        //                 ...
        //             },
        //             "USDT": {
        //                 "free": "0",
        //                 "used": "0",
        //                 "total": "0",
        //             },
        //             "DEL": {
        //                 "free": "0",
        //                 "used": "0",
        //                 "total": "0",
        //             },
        //             "BTC": {
        //                 "free": "0",
        //                 "used": "0",
        //                 "total": "0",
        //             }
        //             ...
        //         }
        //     }
        //
        const timestamp = this.milliseconds();
        const balance = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const result = this.safeValue(response, 'result', {});
        const balanceByCurrencies = this.omit(result, ['free', 'used', 'total']);
        const rawCurrencyIds = Object.keys(balanceByCurrencies);
        for (let i = 0; i < rawCurrencyIds.length; i++) {
            const rawCurrencyId = rawCurrencyIds[i];
            const currencyBalance = this.safeValue(result, rawCurrencyId);
            const free = this.safeString(currencyBalance, 'free');
            const used = this.safeString(currencyBalance, 'used');
            const total = this.safeString(currencyBalance, 'total');
            const currencyCode = this.safeCurrencyCode(rawCurrencyId.toLowerCase());
            balance[currencyCode] = {
                'free': free,
                'used': used,
                'total': total,
            };
        }
        return this.safeBalance(balance);
    }
    async fetchDepositsWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bitteam#fetchDepositsWithdrawals
         * @description fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet
         * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiTransactionsofuser
         * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
         * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
         * @param {int} [limit] max number of deposit/withdrawals to return (default 10)
         * @param {object} [params] extra parameters specific to the bitteam api endpoint
         * @returns {object} a list of [transaction structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure}
         */
        await this.loadMarkets();
        let currency = undefined;
        const request = {};
        if (code !== undefined) {
            currency = this.currency(code);
            request['currency'] = currency['numericId'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetTradeApiTransactionsOfUser(this.extend(request, params));
        //
        //     {
        //         "ok": true,
        //         "result": {
        //             "count": 2,
        //             "transactions": [
        //                 {
        //                     "id": 1329686,
        //                     "orderId": "2f060ad5-30f7-4f2b-ac5f-1bb8f5fd34dc",
        //                     "transactionCoreId": "561863",
        //                     "userId": 21639,
        //                     "recipient": "0x9050dfA063D1bE7cA711c750b18D51fDD13e90Ee",
        //                     "sender": "0x6894a93B6fea044584649278621723cac51443Cd",
        //                     "symbolId": 2,
        //                     "CommissionId": 17571,
        //                     "amount": "44000000000000000",
        //                     "params": {},
        //                     "reason": null,
        //                     "timestamp": 1700715341743,
        //                     "status": "approving",
        //                     "statusDescription": null,
        //                     "type": "withdraw",
        //                     "message": null,
        //                     "blockChain": "",
        //                     "before": null,
        //                     "after": null,
        //                     "currency": {
        //                         "symbol": "eth",
        //                         "decimals": 18,
        //                         "blockChain": "Ethereum",
        //                         "links": [
        //                             {
        //                                 "tx": "https://etherscan.io/tx/",
        //                                 "address": "https://etherscan.io/address/",
        //                                 "blockChain": "Ethereum"
        //                             }
        //                         ]
        //                     }
        //                 },
        //                 {
        //                     "id": 1329229,
        //                     "orderId": null,
        //                     "transactionCoreId": "561418",
        //                     "userId": 21639,
        //                     "recipient": "0x7d6a797f2406e06b2f9b41d067df324affa315dd",
        //                     "sender": null,
        //                     "symbolId": 3,
        //                     "CommissionId": null,
        //                     "amount": "100000000",
        //                     "params": {
        //                         "tx_id": "0x2253823c828d838acd983fe6a348fb0e034efe3874b081871d8b80da76ec758b"
        //                     },
        //                     "reason": null,
        //                     "timestamp": 1700594180417,
        //                     "status": "success",
        //                     "statusDescription": null,
        //                     "type": "deposit",
        //                     "message": null,
        //                     "blockChain": "Ethereum",
        //                     "before": 0,
        //                     "after": 100000000,
        //                     "currency": {
        //                         "symbol": "usdt",
        //                         "decimals": 6,
        //                         "blockChain": "",
        //                         "links": [
        //                             {
        //                                 "tx": "https://etherscan.io/tx/",
        //                                 "address": "https://etherscan.io/address/",
        //                                 "blockChain": "Ethereum"
        //                             },
        //                             {
        //                                 "tx": "https://tronscan.org/#/transaction/",
        //                                 "address": "https://tronscan.org/#/address/",
        //                                 "blockChain": "Tron"
        //                             },
        //                             {
        //                                 "tx": "https://bscscan.com/tx/",
        //                                 "address": "https://bscscan.com/address/",
        //                                 "blockChain": "Binance"
        //                             }
        //                         ]
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //
        const result = this.safeValue(response, 'result', {});
        const transactions = this.safeValue(result, 'transactions', []);
        return this.parseTransactions(transactions, currency, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //     {
        //         "id": 1329229,
        //         "orderId": null,
        //         "transactionCoreId": "561418",
        //         "userId": 21639,
        //         "recipient": "0x7d6a797f2406e06b2f9b41d067df324affa315dd",
        //         "sender": null,
        //         "symbolId": 3,
        //         "CommissionId": null,
        //         "amount": "100000000",
        //         "params": {
        //             "tx_id": "0x2253823c828d838acd983fe6a348fb0e034efe3874b081871d8b80da76ec758b"
        //         },
        //         "reason": null,
        //         "timestamp": 1700594180417,
        //         "status": "success",
        //         "statusDescription": null,
        //         "type": "deposit",
        //         "message": null,
        //         "blockChain": "Ethereum",
        //         "before": 0,
        //         "after": 100000000,
        //         "currency": {
        //             "symbol": "usdt",
        //             "decimals": 6,
        //             "blockChain": "",
        //             "links": [
        //                 {
        //                     "tx": "https://etherscan.io/tx/",
        //                     "address": "https://etherscan.io/address/",
        //                     "blockChain": "Ethereum"
        //                 },
        //                 {
        //                     "tx": "https://tronscan.org/#/transaction/",
        //                     "address": "https://tronscan.org/#/address/",
        //                     "blockChain": "Tron"
        //                 },
        //                 {
        //                     "tx": "https://bscscan.com/tx/",
        //                     "address": "https://bscscan.com/address/",
        //                     "blockChain": "Binance"
        //                 }
        //             ]
        //         }
        //     }
        //
        const currencyObject = this.safeValue(transaction, 'currency');
        const currencyId = this.safeString(currencyObject, 'symbol');
        const code = this.safeCurrencyCode(currencyId, currency);
        const id = this.safeString(transaction, 'id');
        const params = this.safeValue(transaction, 'params');
        const txid = this.safeString(params, 'tx_id');
        const timestamp = this.safeInteger(transaction, 'timestamp');
        let networkId = this.safeString(transaction, 'blockChain');
        if (networkId === undefined) {
            const links = this.safeValue(currencyObject, 'links', []);
            const blockChain = this.safeValue(links, 0, {});
            networkId = this.safeString(blockChain, 'blockChain');
        }
        const addressFrom = this.safeString(transaction, 'sender');
        const addressTo = this.safeString(transaction, 'recipient');
        const tag = this.safeString(transaction, 'message');
        const type = this.parseTransactionType(this.safeString(transaction, 'type'));
        const amount = this.parseValueToPricision(transaction, 'amount', currencyObject, 'decimals');
        const status = this.parseTransactionStatus(this.safeValue(transaction, 'status'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'network': this.networkIdToCode(networkId),
            'addressFrom': addressFrom,
            'address': undefined,
            'addressTo': addressTo,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'type': type,
            'amount': this.parseNumber(amount),
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': undefined,
            'comment': this.safeString(transaction, 'description'),
            'internal': false,
        };
    }
    parseTransactionType(type) {
        const types = {
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
        };
        return this.safeString(types, type, type);
    }
    parseTransactionStatus(status) {
        const statuses = {
            'approving': 'pending',
            'success': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const request = this.omit(params, this.extractParams(path));
        const endpoint = '/' + this.implodeParams(path, params);
        let url = this.urls['api'][api] + endpoint;
        const query = this.urlencode(request);
        if (api === 'private') {
            this.checkRequiredCredentials();
            if (method === 'POST') {
                body = this.json(request);
            }
            else if (query.length !== 0) {
                url += '?' + query;
            }
            const auth = this.apiKey + ':' + this.secret;
            const auth64 = this.stringToBase64(auth);
            const signature = 'Basic ' + auth64;
            headers = {
                'Authorization': signature,
                'Content-Type': 'application/json',
            };
        }
        else if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (code !== 200) {
            if (code === 404) {
                if ((url.indexOf('/ccxt/order/') >= 0) && (method === 'GET')) {
                    const parts = url.split('/order/');
                    const orderId = this.safeString(parts, 1);
                    throw new errors.OrderNotFound(this.id + ' order ' + orderId + ' not found');
                }
                if (url.indexOf('/cmc/orderbook/') >= 0) {
                    const parts = url.split('/cmc/orderbook/');
                    const symbolId = this.safeString(parts, 1);
                    throw new errors.BadSymbol(this.id + ' symbolId ' + symbolId + ' not found');
                }
            }
            const feedback = this.id + ' ' + body;
            const message = this.safeString(response, 'message');
            const responseCode = this.safeString(response, 'code');
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], responseCode, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

module.exports = bitteam;
