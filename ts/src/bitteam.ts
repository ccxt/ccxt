import Exchange from './abstract/bitteam.js';
// import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidAddress, InvalidOrder, NotSupported, OnMaintenance, OrderNotFound, PermissionDenied } from './base/errors.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
// import { Precise } from './base/Precise.js';
// import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { Market } from './base/types.js';

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
                'fetchPositions': false,
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
                        'trade/api/pairs': 1,
                    },
                    'post': {
                        'trade/api/login-oauth': 1, // not unified
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
